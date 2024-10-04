# Hypha
Hypermedia Enhancement in 132 Lines.

Hypha is a JavaScript library that lets you 
- Click on a hyperlink to dynamically load the linked resource to the current page.
- Submit a form and automagically update all relevant resources currently displayed.
- Make SPAs that also work as MPAs.
- Use the application with JavaScript disabled.
- Do all of the above without writing a single line of JavaScript.

Hypha is small.  The API consists of only **5 attributes**.
There are in total **132 lines** of JavaScript,
weighing only **2kB** minified and compressed.

Hypha is inspired by [intercooler.js](https://intercoolerjs.org/),
[Unpoly](https://unpoly.com/), [htmx](https://htmx.org/),
and my previous project [Rhizome](https://github.com/nxjfxu/rhizome).

## Guide
### Basics

Let's say we have a page that looks like this initially:

```html
<a href="/item" hy-target="#item-container">Load Items</a>
<ul id="item-list">
  <!-- empty initially -->
</ul>
<div id="item-view">
  <!-- empty initially -->
</div>
```

Notice the `hy-target` attribute of the "Load Items" element.
The `hy-target` attribute tells Hypha to modify the behaviour of the element,
so that when the "Load Items" link is clicked,
instead of opening `/item` in the browser window,
it sends a GET request to `/item` without leaving the page.
The response will then be loaded into the element
[selected](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors)
by the `hy-target` attribute, i.e. the `#item-list` element.

Let's say the server responds with a webpage like this:
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

We only want the list items from this response, not the title,
the navigation bar, or the footer.
So we put a `hy-body` attribute on the element containing what we want.
This tells Hypha to only load the children of the element with the
`hy-body` attribute.
If `hy-body` is not specified, Hypha will load the entire `<body>`
of the page instead.

Now the web page looks like this:
```html
<a href="/item" hy-target="#item-container">Load Items</a>
<ul id="item-list" hy-src="/item">
  <li><a href="/item/100" hy-target="#item-view">Foo</a></li>
  <li><a href="/item/101" hy-target="#item-view">Bar</a></li>
  <li><a href="/item/200" hy-target="#item-view">Baz</a></li>
</ul>
<div id="item-view">
  <!-- still empty -->
</div>
```

In Hypha lingo, a piece of dynamically loaded HTML content is called 
a **"fragment"**.
The name comes from that fact that they are (usually) not complete web pages,
only a *fragment* of it.
We refer to a fragment by its URL.
So in this case the fragment we just loaded is the `/item` fragment.

Notice that `#item-list` now has an additional attribute `hy-src`.
`hy-src` indicates the URL of the fragment that is currently loaded in an element.
It will be used to decide whether or not a certain element should be updated
when we make a request that potentially changes the fragment.

Since the hyperlinks in `#item-list` have `hy-target` attributes,
clicking on them loads the corresponding page into the `#item-view` `div`.
When loading a fragment into a target,
it replaces all the child elements of the target.
So if we click "Foo" followed by "Bar", 
only the `/item/101` fragment will remain in `#item-view`.

Let's say our web page ends up looking like this:

```html
<a href="/item" hy-target="#item-container">Load Items</a>
<ul id="item-list" hy-src="/item">
  <li><a href="/item/100" hy-target="#item-view">Foo</a></li>
  <li><a href="/item/101" hy-target="#item-view">Bar</a></li>
  <li><a href="/item/200" hy-target="#item-view">Baz</a></li>
</ul>
<div id="item-view" hy-src="/item/101">
  <h2>Bar</h2>
  <form method="post" action="/item/101" hy-target="fragment">
    <input type="text" name="name" value="Bar" />
    <input type="submit" value="Change Name" />
  </form>
</div>
```

The `<form>` lets us rename an item by `POST`ing
the new name to the URL of the item we want to rename.
Since the `<form>` has a `hy-target` attribute, it will send a `POST`
request, and display the response in the target specified.
Here, by making the `hy-target` `fragment`, we are telling Hypha
to replace the fragment that the `<form>` is a part of,
i.e. we will be replacing the content of the `#item-view` div
(which contains the fragment `/item/101`)
with the response to the `POST` request.

However, `#item-view` is not the only thing we want to change.
We also want to update the list of items to reflect the new name of `/item/101`.
This is handled automagically by Hypha:
After making a POST, PUT, or DELETE request
which may potentially modify the data on the server,
Hypha looks for fragments whose URLs indicates that they might have been affected by the change,
and reload them from the server.
In this case, since we are making a `POST` request to `/item/101`,
we know that the `/item` fragment is potentially changed, so we reload it.

After all that, the web page would look like this: 

```html
<a href="/item" hy-target="#item-container">Load Items</a>
<ul id="item-list" hy-src="/item">
  <li><a href="/item/100" hy-target="#item-view">Foo</a></li>
  <li><a href="/item/101" hy-target="#item-view">FooBar</a></li>
  <li><a href="/item/200" hy-target="#item-view">Baz</a></li>
</ul>
<div id="item-view" hy-src="/item/101">
  <h2>FooBar</h2>
  <p>You just renamed "Bar" to "FooBar"
  <form method="post" action="/item/101" hy-target="fragment">
    <input type="text" name="name" value="FooBar" />
    <input type="submit" value="Change Name" />
  </form>
</div>
```

Hypha considers two paths to be dependent of each other if they are identical,
or if one path is a directory that contains the other.
This behaviour is modelled after [intercooler.js's dependency detection algorithm](https://intercoolerjs.org/docs.html#dependencies).

### API Design

For Hypha to work properly, our API must follow the following two rules:

- Use [URL paths](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/What_is_a_URL#path_to_resource)
  instead of [parameters (a.k.a. queries)](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/What_is_a_URL#parameters)
   to refer to resources.
  For example, use `user/1234` instead of `user?id=1234` to refer to the
  user with id 1234.

- Use [HTTP Verbs](https://martinfowler.com/articles/richardsonMaturityModel.html#level2)
  to indicate what we want to do to a resource.
  For example, send a `DELETE` request to `user/1234` instead of send a `POST` request to `user/1234/delete`
  when trying to delete a user.

The secone rule gets tricky when using forms.
Browsers only support `GET` or `POST` as form methods when submitting the form.
This is not a problem when JavaScript is enabled and Hypha is able
to submit the form using Ajax,
but becomes a problem if there is no JavaScript and we have to rely on
the browser's default form submission behaviour.

This limitation can be circumvented using a hidden input named `_method`
whose value is set to the "real" HTTP method we wan to use.
The form method may need to be set to `POST` if the "real" method causes changes.
When the `_method` field is present, Hypha will automatically use its value
as the request method when making Ajax requests.

```html
<form method="post" action="/user/1234" hy-target="#some-target">
  <input type="hidden" name="_method" value="delete" />
  <!-- ... -->
</form>
```

Some web frameworks, such as [Laravel](https://laravel.com/docs/11.x/routing#form-method-spoofing),
[Ruby on Rails](https://guides.rubyonrails.org/form_helpers.html#forms-with-patch-put-or-delete-methods),
and [Rocket](https://rocket.rs/guide/v0.5/requests/#reinterpreting)
will automatically route requests with the `_method` field to the appropriate destinations.


### Supporting Single- and Multiple-Page Applications

Hypha changes the behaviour of hyperlinks with the `hy-target` attribute,
making them load a fragment into the current page instead of opening a new page.
However, the user can still open the link in a new tab or window like a normal web page.
This means any Hypha SPA can always work as an MPA.

Ideally, any page returned by an API of a Hypha application should be a full HTML page,
with styling, navigation, *et cetera*.
As long as the "main" content is contained in an element specified by the `hy-body` attribute,
the extraneous page content will not affect using the application as an SPA.
However, users who prefer to work across multiple pages will appreciate
the fact that each web page is a fully functional page on its own.

> Q: SPA or MPA?
> A: Yes.


### Making Things Work without JavaScript

We don't need to do any work to make a Hypha application work without JavaScript.

If we look at the example used in [Basics](#Basics) section,
we notice that the entire application will work without problem without
any of the Hypha-added niceties:
we can still click on "Load Items" to go to the `/item` page and see the list of items;
we can still click on an item in the list to go to the item's page;
and we can still modify the item using the form on the page.

Hypha follows the philosophy of *progressive enhancement*.
We do not build the core functionalities of an application using Hypha.
Instead, we build a working (albeit janky, by 2024 standards)
web application using boring, old static HTML pages,
and use Hypha to enhance it, to add dynamic content and reactivity.
This way, when JavaScript is not available and Hypha does not work,
we still have a fully functional application underneath,
and those among us who browse the web using [`eww`](https://www.gnu.org/software/emacs/manual/html_mono/eww.html)
can still get things done.

