Cartier
=======
A(nother) small, unopinionated client-side routing library.

Using
-----
```js

var onContextChanged = function (from, to, params) {
    if (to && to.data === 'error') {
        console.error('Oops');
    } else {
        console.log(JSON.stringify(from) + ' -> '
            + JSON.stringify(to)
            + (params ? ', ' + JSON.stringify(params) : ''));
    }
};

var routes = {
  '/home': 'home',
  '/:collection': { data: 'abc' },
  '/:collection/:id': { data: 'def' }
};

var onError = {
    data: 'error'
};

var nav = new cartier(routes, onError, onContextChanged);
// => null -> [whatever page you're currently on]

nav.navigate('/tests');
// => [whatever page you started on] => {"data":"abc"}, {"collection":"tests"}

nav.navigate('/tests/123');
// => {"data":"abc"} -> {data: 'def'}, {"collection":"tests", "id": "123"}
```

Limitations
-----------
Cartier currently relies on `window.history.pushState()`, so if compatibility is a major issue for you, Cartier may not be for you.
Also, currently only one callback for context switches is supported.

License
-------
Ziptie may be freely distributed under the MIT license.