// var should = require('should');
function noop() {};

describe('Cartier', function () {
    describe('#constructor()', function () {
        it('should return a Cartier instance', function () {
            var nav = new cartier(noop);
            nav.constructor.name.should.be.exactly('Cartier');
        });

        it('should return a Cartier instance with a notFoundContext', function () {
            var nav = new cartier(noop, '404');
            nav.notFoundContext.should.be.exactly('404').and.be.a.String;
        });

        it('should complain about no context changed listener', function () {
            cartier.should.throw();
        });
    });

    describe('#setNotFoundContext()', function () {
        it('should set the notFoundContext', function () {
            var nav = new cartier(noop);
            nav.setNotFoundContext('404');
            nav.notFoundContext.should.be.exactly('404').and.be.a.String;
        });
    });

    describe('#route()', function () {
        var nav = void 0;

        beforeEach(function () {
            nav = new cartier(noop, '404');
        });

        it('should instantiate the routes', function () {
            nav.route({
                '/': 'root',
                '/test': 'test'
            });

            /* Test that routes are instantiated: */
            nav.routes.should.be.an.Object;
            nav.routes['/'].should.be.an.Object;
            nav.routes['/test'].should.be.an.Object;
        });

        it('should set the context to the current browser location', function () {
            nav.route({
                '/': 'root',
                '/test': 'test',
                '/test/runner.html': 'runner'
            });

            /* Test that context is set */
            nav.state.should.be.an.Object;
            nav.context.should.be.exactly('runner');
        });
    });

    describe('#navigate()', function () {
        var nav = void 0;
        var routes = void 0;

        beforeEach(function () {
            nav = new cartier(noop, '404');
            nav.route({
                '/': 'root',
                '/test': 'test',
                '/test/:param': 'singleParam',
                '/test/:param/:drilldown': 'doubleParam'
            });
        });

        it('should navigate to a parameter-less url', function () {
            nav.navigate('/test');

            nav.context.should.be.exactly('test');
        });

        it('should navigate to a url with one parameter', function () {
            nav.navigate('/test/123');

            nav.context.should.be.exactly('singleParam');
            nav.params['param'].should.be.exactly('123').and.be.a.String;
        });

        it('should navigate to a url with two parameters', function () {
            nav.navigate('/test/123/456');

            nav.context.should.be.exactly('doubleParam');
            nav.params['param'].should.be.exactly('123').and.be.a.String;
            nav.params['drilldown'].should.be.exactly('456').and.be.a.String;
        });

        it('should navigate to relative paths from a path with no trailing slash', function () {
            nav.navigate('/test/123');
            nav.navigate('456');

            nav.context.should.be.exactly('doubleParam');
            nav.params['param'].should.be.exactly('123').and.be.a.String;
            nav.params['drilldown'].should.be.exactly('456').and.be.a.String;
        });

        it('should navigate to relative paths with from a path with a trailing slash', function () {
            nav.navigate('/test/123/');
            nav.navigate('456');

            nav.context.should.be.exactly('doubleParam');
            nav.params['param'].should.be.exactly('123').and.be.a.String;
            nav.params['drilldown'].should.be.exactly('456').and.be.a.String;
        });

        it('should not call doContextChange when navigating to the same route', function (done) {
            nav.navigate('/test');

            nav.onContextChange = function () {
                done('Context change was called.');
            }

            nav.navigate('/test');

            window.setTimeout(done, 10);
        });

        it('should call doContextChange when params change', function (done) {
            nav.navigate('/test/123/456');

            nav.onContextChange = function () {
                done();
            };

            /* Allow for onContextChange to be set (?): */
            window.setTimeout(nav.navigate.bind(nav, '/test/123/567'), 10);
        });

        it('should not call doContextChange when params don\'t change', function (done) {
            nav.navigate('/test/123/456');

            nav.onContextChange = function () {
                done('Context change was called.');
            };

            nav.navigate('/test/123/456');
            window.setTimeout(done, 10);
        });

        it('should complain about not calling route() first', function () {
            /* Clear routes: */
            nav.routes = void 0;

            nav.navigate.bind(nav, '/').should.throw(/route/);
        });
    });

    after(function () {
        /* Restore the window location after tests are completed. */
        var nav = new cartier(noop);
        nav.route({'/test/runner.html': ''});
        nav.navigate('/test/runner.html');
    });
});
