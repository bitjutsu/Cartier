Cartier
=======
A small, unopinionated client-side routing library.

[![](http://img.shields.io/npm/v/cartier.svg?style=flat-square)](https://npmsjs.org/package/cartier)

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

And then in your HTML documents:
```html
<a href="#!/tests">Click Here!</a>
<a href="#!/tests/123">(Or Here)</a>
```

Note that the `#!` will not appear in the URL - this is just Cartier's chosen method of intercepting routes without leaving the page.

Testing
-------
After cloning this repo, grab all of the dependencies like so:
```sh
$ npm i
```

*But wait! There's more!*
You'll also need to install the tools that Cartier uses for testing:
```sh
$ npm i -g gulp istanbul mocha-phantomjs phantomjs
```
> [mocha-phantomjs](https://github.com/metaskills/mocha-phantomjs) is used for running the tests in PhantomJS and displaying the results in the console easily.

*Phew!*
Now that all of the setup is out of the way, run `npm test` or `gulp test` from the folder you cloned Cartier into.

You can view the full coverage report or run the tests in a browser by navigating to the URLs indicated in the console.

> Please note that the test task never terminates. It continues to serve the test runner and coverage results until it is explicitly closed (using Ctrl+C or the like).

Limitations
-----------
Cartier currently relies on `window.history.pushState()`, so if compatibility is a major issue for you, Cartier may not be for you.
Also, currently only one callback for context switches is supported - although that callback can be used to trigger events.

License
-------
Cartier may be freely distributed under the MIT license.
