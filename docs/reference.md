# Hypha Reference

## HTML Attributes

### `hy-src=<URL>`

`hy-src` can be given to any element that may have children.  Its value should be a **URL**.

`hy-src` specifies the URL of the fragment that is currently loaded in an element.
When a fragment is loaded into an element, the element's `hy-src` attribute is updated automatically.

If an element has `hy-src` set to `"/some/path"` initially,
then the fragment `/some/path` will be loaded into the element after the page finishes loading,
replacing any children the element previously have.


#### Example

After the page finishes loading, automatically load the fragment `/user` into `#user-list`,
replacing the "Loading..." text.
```html
<div id="user-list" hy-src="/user">
  <span>Loading..</span>
</div>
```

-----

### `hy-target=<Selector> | "fragment"`

`hy-target` can be given to an `<a>` (anchor) or a `<form>`.
It value can be either a [**CSS selector**](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors),
or the string **`"fragment"`**.

`hy-target` specifies where the fragment linked to by an element should be loaded
when the element is either clicked on or submitted.
If `hy-target` is a selector, then it loads the fragment into *all* elements that selector selects.
If `hy-target` is "fragment", then it replaces the fragment the element is a part of,
or the entire `<body>` if the element is not in a fragment.

`<a>` elements with a `hy-target` will load its `href` to the target when clicked on.

When a `<form>` elements with a `hy-target` is submitted,
it will make an Ajax request to the url specified by its `action`, 
and load the server response into the target.
If the method of the form request is either `POST`, `PUT`, `PATCH`, or `DELETE`,
any element whose `hy-src` depeneds on the form's `action` is also updated.


#### Examples

Clicking "User 1234" will load the fragment `/user/1234` into `#user-info`.
````html
<a href="/user/1234" hy-target="#user-info">User 1234</a>
<div id="user-info></div>
````

Clicking either links will load the corresponding fragments into `#article-view`.
````html
<div id="article-view" hy-src="/article/100">
  </h2>Article Title</h1>
  <!-- ... -->
  <a href="/article/99"  hy-target="fragment">Previous Article</a>
  <a href="/article/101" hy-target="fragment">Next Article</a>
</div>
````

Submitting the form replaces the `#form-container` div with the response to the form submission request.
The `#item-list` div will reload automatically.
````html
<div id="form-container" hy-src="/new-item">
  <form action="/item" method="post" hy-target="fragment">
    <!-- ... -->
  </form>
</div>
<div id="item-list" hy-src="/item">
  <!-- ... -->
</div>
````


-----

### `hy-body`

`hy-body` can be given to any element.  Its value does not matter.

When loading a fragment, Hypha looks for an element with the `hy-body` attribute in it.
If an element with the `hy-body` attribute is found, then only the children of that element will be loaded.
Otherwise, the whole `<body>` of the page will be loaded.


#### Example

When Hypha tries to load the following element, only the three `<li>`s will be loaded,
because they are the children of an `<ul>` which has the `hy-body` attribute.
```html
<h1>List of Items</h1>
<nav> <!-- ... --> </nav>
<ul hy-body>
  <li><a href="/item/100" hy-target="#item-view">Foo</a></li>
  <li><a href="/item/101" hy-target="#item-view">Bar</a></li>
  <li><a href="/item/200" hy-target="#item-view">Baz</a></li>
</ul>
<footer> <!-- ... --> </footer>
```


-----

### `hy-changes=<URL>...`

`hy-changes` can be given to a form.  Its value should be a **space-separated list of URLs**.

By default, when submitting a form, only the `action` of the form is assumed to be affected,
and only fragments whose URL depends on the `action` are reloaded.
`hy-changes` specifies additional URLs that are affected,
and any fragment that depends on any of the URLs in `hy-changes` will also be reloaded.

#### Example

Submitting the form causes `#item-list`, `#ranking-list`, and `#latest-list`
to all update automatically.
```html
<div id="form-container" hy-src="/new-item" hy-changes="/ranking /">
  <form action="/item" method="post" hy-target="fragment">
    <!-- ... -->
  </form>
</div>
<div id="item-list" hy-src="/item">
  <!-- ... -->
</div>
<div id="ranking-list" hy-src="/ranking">
  <!-- ... -->
</div>
<div id="latest-list" hy-src="/latest">
  <!-- ... -->
</div>
```

-----
-----

## `function reloadFragments(changes?: string[], root?: HTMLElement) => void`

If `changes` is given, then only fragments who depends on the URLs in `changes` are reloaded.
Otherwise, *all* fragments are reloaded.
`changes` must be an array of **full URLs** (i.e. `http://example.com/foo/bar` instead of `/foo/bar`).

If `root` is given, then only fragments inside `root` are reloaded.
Otherwise, *all* fragments are reloaded.

By default, Hypha calls `reloadFragments` automatically when a Hypha-handled 
form submission potentially affects any fragment,
so in most cases there is no need to call this function manually.
Nevertheless, Hypha exports this function so we can reload data any time we want to.

#### Example

Update the fragment `/data` every five seconds.
```javascript
import reloadFragments from "@nxjfxu/hypha";

setInterval(() => reloadFragments(["https://example.com/data"]), 5000);
```
```html
<div id="data-list" hy-src="/data">
  <!-- ... -->
</div>
```
