//     cartier.js - (c) 2014 Adam Carruthers
//     cartier may be freely distributed under the MIT License.

(function (global) {
    'use strict';

    /* Export as a module for AMD, CommonJS/Node, or as a window Global */
    modulify(function () {
        /* Define the constructor for Cartier: */
        function Cartier(doContextChange, notFoundContext) {
            /* The router is useless without a context change handler. */
            if (typeof doContextChange !== 'function') {
                throw new TypeError('A context changed handler is required.');
            }

            this.onContextChange = doContextChange;
            this.notFoundContext = notFoundContext;
        }

        /* Define the API: */
        extend(Cartier.prototype, {
            route: function (routes, notFoundContext) {
                /* If notFoundContext is undefined, use the existing one. */
                notFoundContext = notFoundContext || this.notFoundContext;

                /* Add the routes. */
                this.routes = processRoutes(routes);

                /* Set the notFoundContext. */
                this.notFoundContext = notFoundContext;

                /* Kick things off: */
                var url = global.location.pathname;

                /* (Pass false to signal that this is not a new context.) */
                baseNavigate(url, this, false);
            },

            setNotFoundContext: function (notFoundContext) {
                this.notFoundContext = notFoundContext;
            },

            navigate: function (url) {
                /* Backup the outgoing context. */
                var previousContext = this.context;

                baseNavigate(url, this);

                /* Call the context change callback: */
                this.onContextChange(previousContext, this.context, this.params);
            }
        });

        return Cartier;
    });

    /* Utility and helper methods: */
    function extend(object, source) {
        var index = -1,
            props = Object.keys(source),
            length = props.length;

        while (++index < length) {
            var key = props[index];
            object[key] = source[key];
        }

        return object;
    }

    /* Map a keys array to a values array, creating an object */
    function fuse(keys, vals) {
        var obj = {},
            index = -1,
            len = keys.length;

        while (++index < len) {
            obj[keys[index]] = vals[index];
        }

        return obj;
    }

    /* Get all capture group matches from a regular expression. */
    function getAllMatches(regex, str) {
        var matches = void 0,
            results = [];

        if (!regex.global) {
            var matches = regex.exec(str);

            matches.shift();

            return matches;
        }

        /* do-while because a match needs to be tried at least once - and
        also because do-whiles are badass. */
        do {
            /* Execute the Regular Expression: */
            matches = regex.exec(str);

            if (matches != null && matches.length > 1) {
                /* Grab the value of the first capture group: */
                results.push(matches[1]);
            }
        } while (matches != null);

        return results;
    }

    function processRoutes(routes) {
        /* Convert the routes to regular expressions and extract parameters: */
        var routeKeys = Object.keys(routes),
            length = routeKeys.length,
            index = -1,
            processedRoutes = {};

        /* Construct the processed route object */
        while (++index < length) {
            var key = routeKeys[index];

            processedRoutes[key] = processRoute(key, routes[key]);
        }

        return processedRoutes;
    }

    function processRoute(route, context) {
        var params = extractParameters(route),
            match = convertToRegularExpression(route);

        return {
            params: params,
            match: match,
            context: context
        };
    }

    function extractParameters(route) {
        /* Create a RegExp object to keep track of match position: */
        var paramsRegex = new RegExp(/:([^\/]+)/g);

        return getAllMatches(paramsRegex, route);
    }

    /* Converts a route into a Regular Expression. */
    function convertToRegularExpression(route) {
        var paramsReplacementRegex = new RegExp(/:[^\/]+/g),
            /* This will match parameters in the route */
            paramsMatchRegexString = '([^/]+)',
            innerRegex = route.replace(paramsReplacementRegex, paramsMatchRegexString);
        
        /* The route starts and ends with innerRegex and- trailing slash optional: */
        var processedRoute = '^' + innerRegex + '\/?$';

        return new RegExp(processedRoute);
    }

    function baseNavigate(location, router, isNewContext) {
        /* Default to true for isNewContext (results in a pushState): */
        if (typeof isNewContext !== 'boolean') {
            isNewContext = true;
        }

        /* Get the context and parameters: */
        router.state = getState(location, router.routes) || void 0;
        router.context = getContext(router.state) || router.notFoundContext;
        router.params = getParamValues(location, router.state);
        /* Mutate the history and pass false as isNewContext. */
        mutateHistory(location, isNewContext);
    }

    function mutateHistory(location, isNewContext) {
        /* Pick history mutator function using isNewContext */
        var mutator = isNewContext ? 'pushState' : 'replaceState';
        global.history[mutator]({ path: location }, '', location);
    }

    function getContext(state) {
        if (typeof state !== 'object') {
            return void 0;
        }

        return state.context;
    }

    function getState(location, routes) {
        var keys = Object.keys(routes),
            length = keys.length,
            index = -1;

        /* Look through all of the routes in order for the first match. */
        while (++index < length) {
            var key = keys[index],
                route = routes[key];

            if (route.match.test(location)) {
                /* Return the first matched state. */
                return route
            }
        }

        /* No match found. */
        return void 0;
    }

    /* Maps parameter names to parameter values. */
    function getParamValues(location, state) {
        if (typeof state !== 'object') {
            /* Handle undefined/null notFoundContext */
            return void 0;
        }

        var paramValues = getAllMatches(state.match, location);

        return fuse(state.params, paramValues);
    }

    /* Exports Cartier for a subset of the plethora of module systems. */
    function modulify(factory) {
        if (typeof module === 'object') {
            /* Export for Browserify: */
            module.exports = factory();
        } else if (typeof define === 'function' && define.amd) {
            /* Export for amd: */
            define('cartier', factory);
        } else {
            /* Extend the global scope to include cartier: */
            global.cartier = factory();
        }
    }
}(window));
