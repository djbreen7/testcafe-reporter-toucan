'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

let toucanToken = '';

let testRunId = '';

let testCases = [];

const axios = require('axios');

exports['default'] = () => {
    return {
        noColors: true,

        reportTaskStart: async function reportTaskStart () {

        },

        reportFixtureStart: function reportFixtureStart (name, path, meta) {

            console.log(meta);

            if (meta.testCases) {

                this.currentFixtureName = name;

                toucanToken = meta.toucanToken;

                testRunId = meta.testRunId;

                testCases = meta.testCases;

                axios.defaults.headers.common['Authorization'] = 'Bearer ' + toucanToken;
                axios.defaults.headers.common['Content-Type'] = 'application/json';
                axios.defaults.headers.common['Accept'] = 'application/json';
                axios.defaults.baseURL = 'http://localhost:5000';
            }
        },

        reportTestDone: async function reportTestDone (name, testRunInfo, meta) {
            if (meta.automationId) {

                const hasErr = !!testRunInfo.errs.length;

                /**
                 * 0 = Pass
                 * 1 = Fail
                 * If hasErr is true, then it should fail
                 */
                const result = hasErr ? 1 : 0;

                // Make reusable { testCaseId, testModuleId, testRunId }
                const testResult = {};

                const testCase = testCases.find(c => c.automationId === meta.automationId);

                console.log(testCase.id);

                if (testCase) {
                    testResult.status = result;

                    testResult.testCaseId = testCase.id;

                    testResult.testModuleId = testCase.testModuleId;

                    testResult.testRunId = testRunId;

                    await axios.post('/test-results', testResult);
                }

                name = this.currentFixtureName + ' - ' + name;
            }

        },

        reportTaskDone: function reportTaskDone (endTime, passed) {
            const durationMs = endTime - this.startTime;
            const durationStr = this.moment.duration(durationMs).format('h[h] mm[m] ss[s]');
            let footer = passed === this.testCount ? this.testCount + ' passed' : this.testCount - passed + '/' + this.testCount + ' failed';

            footer += ' (Duration: ' + durationStr + ')';
        }
    };
};

module.exports = exports['default'];
