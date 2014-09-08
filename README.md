Cartier
=======
A small, unopinionated client-side routing library.

Using
-----
Even though the Contexts in this example are just Strings, any value can be a Context - the most useful of which are JavaScript Objects.
```js
var onContextChanged = function (from, to, params) {
    console.log(from, '->', to, params);
};

var router = new cartier(onContextChanged);

var HomeContext = 'home',
    CollectionContext = 'collection',
    DrilldownContext = 'drilldown',
    NotFoundContext = 'error';

var routes = {
    '/home': HomeContext,
    '/:collection': CollectionContext,
    '/:collection/:id': DrilldownContext
};

/* Set up the 404 context. */
router.setNotFoundContext(NotFoundContext);

/* Add the routes and start routing. */
router.route(routes);

router.navigate('/tests');
// => home -> collection Object {collection: "tests"}

router.navigate('/tests/123');
// => collection -> drilldown Object {collection: "tests", id: "123"}
```

Limitations
-----------
Cartier currently relies on `window.history.pushState()`, so if compatibility is a major issue for you, Cartier may not be for you.
Also, currently only one callback for context switches is supported - although that callback can be used to trigger events.

License
-------
Cartier may be freely distributed under the MIT license.
