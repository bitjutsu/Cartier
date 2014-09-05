//     cartier.js - (c) 2014 Adam Carruthers
//     cartier may be freely distributed under the MIT License.

(function (global) {
    'use strict';

    /* Helper function to map a keys array to a values array, creating an object */
    var fuse = function (keys, vals) {
        var obj = {},
            index = -1,
            len = keys.length;

        while (++index < len) {
            obj[keys[index]] = vals[index];
        }

        return obj;
    };

    var processRoutes = function (routes) {
        var paramRegex = /\/:([^\/]+)/g,
            routeReplaceRegex = /:[^\/]+/g,
            processedRoutes = {},
            routePaths = Object.keys(routes),
            len = routePaths.length,
            index = -1;

        while (++index < len) {
            var route = routePaths[index];

            var matches = [],
                params = [];
            while (matches = paramRegex.exec(route)) {
                if (matches[1]) {
                    params.push(matches[1]);
                }
            }

            /*
                Construct the route matching regex like so:
                    '/tags/:guitarists/:name' -> '^/tags/([^\/]+)/([^\/]+)/?$'
            */
            var routeRegex = route.replace(routeReplaceRegex, '([^\/]+)');

            routeRegex = routeRegex.replace(/(\/)/g, '\/');
            routeRegex = '^' + routeRegex + '\/?$';

            processedRoutes[route] = {
                params: params,
                /* TODO construct regex from string like so: */
                match: new RegExp(routeRegex),
                context: routes[route]
            };
        }

        return processedRoutes;
    };

    var cartier = function (onContextSwitch) {
        var contextForLocation = function (location, routes) {
            /* Look through the routes mapping and find the first match */
            var routeKeys = Object.keys(routes),
                len = routeKeys.length,
                index = -1;

            while (++index < len) {
                var route = routes[routeKeys[index]],
                    matches = [];

                /* Don't do a check for !route.context because it being undefined
                could be a desired behaviour. */
                if (!route || !route.match) {
                    continue;
                }

                /* Save capture groups (parameter values) */
                matches = route.match.exec(location);

                if (!matches) {
                    continue;
                }

                /* Remove the first match - we don't want it. */
                matches.shift();

                /* Map the parameters to the keys */
                return {
                    context: route.context,
                    params: fuse(route.params, matches)
                };
            }
        };

        var ret = {
            location: void 0,
            context: null,
            contextSwitch: onContextSwitch,
            notFound: null,
            routes: {},

            setRoutes: function (routes) {
                this.routes = processRoutes(routes);
            },

            start: function () {
                /* Starts the routing process: */
                ret.navigate(window.location.pathname, true);
            },

            setNotFoundContext: function (notFoundContext) {
                this.notFound = notFoundContext;
            },

            navigate: function (location, isOldState) {
                var lastContext = this.context,
                    params = {};

                this.location = location;
                var nextState = contextForLocation(this.location, this.routes);

                if (nextState) {
                    this.context = nextState.context;
                    params = nextState.params;
                } else {
                    this.context = onNotFound;
                }

                /* The Context it is A-Changin' */
                if (!isOldState) {
                    /* Push a new history entry */
                    window.history.pushState({
                        path: this.location
                    }, '', this.location);
                } else {
                    /* Replace the current entry to update the path in the state */
                    window.history.replaceState({
                        path: this.location
                    }, '', this.location);
                }

                /* Call the route changed handler */
                if (this.contextSwitch) {
                    this.contextSwitch(lastContext, this.context, params);
                }
            }
        };

        /* Ad onpopstate listener */
        window.addEventListener('popstate', function (event) {
            if (event.state && event.state.path) {
                ret.navigate(event.state.path, true);
            } else {
                /* Event state is null - we're on the entry point history entry */
            }
        });

        return ret;
    };

    if (typeof define === 'function' && define.amd) {
        // Export cartier for CommonJS/AMD
        define('cartier', [], function () {
            return cartier;
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        // Define cartier for Node/Browserify environments
        module.exports = cartier;
    } else {
        // Define cartier as a global.
        global.cartier = cartier;
    }

    return cartier;
}(this));
