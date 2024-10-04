const PARSER = new DOMParser();

function toElems(q) {
  return q instanceof Element ? [q] : document.querySelectorAll(q);
}

function dependsOn(s1, s2) {
  let u1 = new URL(s1);
  let u2 = new URL(s2);
  if (u1.origin !== u2.origin) return false;
  let ps1 = u1.pathname.split("/");
  let ps2 = u2.pathname.split("/");
  for (let i = 0; i < Math.min(ps1.length, ps2.length); i++) {
    if (ps1[i] !== ps2[i]) return false;
  }
  return true;
}

function reloadFragments(changes, root) {
  (root || document)
    .querySelectorAll("[hy-src]:not([hy-protected])")
    .forEach((e) => {
      const src = e.getAttribute("hy-src");
      if (!changes || changes.some((u) => dependsOn(u, src))) fetchTo(src, e);
    });
  return;
}

async function fetchTo(uri, q) {
  const r = await fetch(`${uri}?hy-fragment`);
  setNodes(await r.text(), q, uri);
}

function protectNodes(q, off) {
  toElems(q).forEach((e) =>
    off
      ? e.removeAttribute("hy-protected")
      : e.setAttribute("hy-protected", true),
  );
}

function setNodes(html, q, uri) {
  const parsed = PARSER.parseFromString(html, "text/html");
  const fragment = parsed.querySelector("[hy-body]") || parsed.body;
  toElems(q).forEach((e) => {
    if (uri) e.setAttribute("hy-src", uri);
    e.replaceChildren(...fragment.childNodes);
    updateAnchors(e);
    updateForms(e);
  });
}

function getTarget(n) {
  const q = n.getAttribute("hy-target");
  if (q === "fragment") {
    let fragment = n;
    while (fragment.tagName !== "BODY" && !fragment.getAttribute("hy-src")) {
      fragment = fragment.parentNode;
    }
    return fragment;
  }
  return q;
}

async function handleFormUpdate(e) {
  const f = e.target;
  e.preventDefault();
  const action = e.submitter.hasAttribute("formaction")
    ? e.submitter.formAction
    : f.action;
  const methodField = f.querySelector("input[name=_method]");
  const method = (
    f.getAttribute("hy-method") ||
    (methodField && methodField.value) ||
    f.getAttribute("method") ||
    f.method
  ).toLowerCase();
  const data = new FormData(f);
  const params = method === "get" ? new URLSearchParams(data) : undefined;

  const r = await fetch(`${action}?hy-fragment&${params}`, {
    method: method,
    redirect: "follow",
    body: params ? undefined : data,
  });

  let location = new URL(r.url);
  let query = new URLSearchParams(location.search);
  query.delete("hy-fragment");
  location.search = query.toString();
  location = location.toString();
  const html = await r.text();
  const target = getTarget(f);
  if (target) {
    if (method !== "get") protectNodes(target);
    setNodes(html, target, location);
  }
  const origin = new URL(action).origin;
  const changes = [
    action,
    ...(f.getAttribute("hy-changes") || "")
      .trim()
      .split(" ")
      .map((u) => new URL(u, origin).href),
  ];
  if (method === "post" || method === "delete" || method === "put") {
    reloadFragments(changes);
    protectNodes(target, true);
  }
}

function updateForms(root) {
  const forms = (root || document).querySelectorAll("form[hy-target]");
  forms.forEach((f) => (f.onsubmit = handleFormUpdate));
}

function updateAnchors(root) {
  (root || document).querySelectorAll("a[hy-target]").forEach((a) => {
    a.onclick = (e) => {
      e.preventDefault();
      fetchTo(a.href, getTarget(a));
    };
  });
}

addEventListener("load", () => {
  updateAnchors();
  updateForms();
  reloadFragments();
});

export default reloadFragments;
