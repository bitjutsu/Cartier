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
            var routeReplaceRegex = /:[^\/]+/g,
                routeRegex = route.replace(routeReplaceRegex, '([^\/]+)');

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

    var cartier = function (routes, onNotFound, onContextSwitch) {
        /* Process routes - extract parameters, etc */
        var processedRoutes = processRoutes(routes);

        var getContextForLocation = function (location) {
            /* Look through the routes mapping and find the first match */
            var routeKeys = Object.keys(routes),
                len = routeKeys.length,
                index = -1;

            while (++index < len) {
                var route = processedRoutes[routeKeys[index]],
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
            notFound: onNotFound,
            routes: processedRoutes,

            onContextSwitch: function (cb) {
                /* Set the onContextSwitch handler */
                this.contextSwitch = cb;
            },

            onNotFound: function (cb) {
                /* Fore? Oh, Four! */
                this.notFound = cb;
            },

            navigate: function (location) {
                var lastContext = this.context,
                    params = {};

                this.location = location;
                var nextState = getContextForLocation(this.location);

                if (nextState) {
                    this.context = nextState.context;
                    params = nextState.params;
                } else {
                    this.context = onNotFound;
                }

                /* The Context it is A-Changin' */
                window.history.pushState(this.context, '', this.location);

                /* Notify listener of context switch. */
                if (this.contextSwitch) {
                    this.contextSwitch(lastContext, this.context, params);
                }
            }
        };

        ret.navigate(window.location.pathname);

        return ret;
    };

    /*if (typeof define === 'function' && define.amd) {
        // Export cartier for CommonJS/AMD
        define('cartier', [], function () {
            return cartier;
        });
    } else {*/
        // Define cartier as a global.
        global.cartier = cartier;
    //}

    return cartier;
}(this));