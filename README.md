# Hypha
Hypermedia Enhancement in 132 Lines.

[Guide](docs/guide.md) | [Reference](docs/reference.md)

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


## Setting Up

```html
<script type="module" src="./hypha.min.js"></script>
```

Hypha is also available on [unpkg](https://unpkg.com):
```html
<script type="module" src="https://unpkg.com/@nxjfxu/hypha@latest/hypha.min.js"></script>
```

### Using NPM

```bash
npm i @nxjfxu/hypha
```
Then, in your JavaScript file:
```javascript
import "@nxjfxu/hypha";
```

