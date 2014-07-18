Cartier
=======
A(nother) small, unopinionated client-side routing library.

Using
-----
Even though the Contexts in this example are just Strings, any value can be a Context - the most useful of which are JavaScript Objects.
```js
var HomeContext = 'home',
    CollectionContext = 'collection',
    DrilldownContext = 'drilldown',
    NotFoundContext = 'error';

var onContextChanged = function (from, to, params) {
    console.log(from, '->', to, params);
};

var routes = {
  '/home': HomeContext,
  '/:collection': CollectionContext,
  '/:collection/:id': DrilldownContext
};

// Assume that you are currently at /home
var nav = new cartier(routes, NotFoundContext, onContextChanged);
// => null -> home Object {}

nav.navigate('/tests');
// => home -> collection Object {collection: "tests"}

nav.navigate('/tests/123');
// => collection -> drilldown Object {collection: "tests", id: "123"}
```

Limitations
-----------
Cartier currently relies on `window.history.pushState()`, so if compatibility is a major issue for you, Cartier may not be for you.
Also, currently only one callback for context switches is supported.

License
-------
Ziptie may be freely distributed under the MIT license.