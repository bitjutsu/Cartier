// mocha-phantomjs hooks

/* NOTE: this file is executed in the PhantomJS environment. */
(function () {
    'use strict';

    function getLineCoverage(coverage) {
        var key = Object.keys(coverage)[0],
            statementHits = coverage[key].s;

        var keys = Object.keys(statementHits),
            length = keys.length,
            index = -1,
            hits = 0;

        while (++index < length) {
            var curKey = keys[index],
                curVal = statementHits[curKey];

            if (curVal != 0) {
                hits++;
            }
        }

        return formatLineCoverage(hits, length);
    }

    function formatLineCoverage(hits, total) {
        return percentage(hits, total) + '% (' + hits + '/' + total + ')';
    }

    function percentage(score, total) {
        return ((score / total) * 100).toFixed(2);
    }

    function istanbulHook(reporter) {
        /* This is NOT NodeJS's fs module - it's Phantom's. */
        var fs = require('fs');

        var coverage = reporter.page.evaluate(function () {
            return window.__coverage__;
        });

        fs.write('coverage/coverage.json', JSON.stringify(coverage), 'w');

        console.log('Line coverage:', getLineCoverage(coverage));
        console.log('To see full coverage results, see http://localhost:3000/coverage');
    }

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
            istanbulHook(reporter);
            inBrowserTestingInfoHook(reporter);
        }
    };
}());
