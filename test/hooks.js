// mocha-phantomjs hooks

(function () {
    'use strict';

    function inBrowserTestingInfoHook(reporter) {
        var testUrl = 'http://localhost:3000/test/runner.html';

        console.log('To test Cartier in a browser, navigate to ' + testUrl);
    }

    module.exports = {
        beforeStart: function (reporter) {
            /* Call all hooks to run before the tests here: */
        },

        afterEnd: function (reporter) {
            /* Call all hooks to run after the tests here: */
            inBrowserTestingInfoHook(reporter);
        }
    };
}());
