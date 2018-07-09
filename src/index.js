'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

const axios = require('axios');
let toucanToken;
let testRunId;
let testCases;

exports['default'] = () => {
    return {
        noColors: true,

        reportTaskStart: async function reportTaskStart() {},

        reportFixtureStart: async function reportFixtureStart(name, path, meta) {
            if (meta.isFirstFixture) {
                const auth = await axios.post('https://toucantesting.auth0.com/oauth/token', {
                    'client_id': meta.toucan.clientId,
                    'client_secret': meta.toucan.clientSecret,
                    'audience': meta.toucan.audience,
                    'grant_type': 'client_credentials'
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                toucanToken = auth.data.access_token;

                axios.defaults.headers.common['Authorization'] = 'Bearer ' + toucanToken;
                axios.defaults.headers.common['Content-Type'] = 'application/json';
                axios.defaults.headers.common['Accept'] = 'application/json';
                axios.defaults.baseURL = meta.toucan.baseUrl;

                const testRun = await axios.post('/test-runs', {
                    name: meta.toucan.testRunTitle,
                    testSuiteId: meta.toucan.testSuiteId
                });

                testRunId = testRun.data.id;
                const testModule = await axios.get(`/test-suites/${meta.toucan.testSuiteId}/test-modules`);
                testCases = await axios.get(`test-suites/${meta.toucan.testSuiteId}/test-modules/${testModule.data[0].id}/test-cases`);
            }
        },

        reportTestDone: async function reportTestDone(name, testRunInfo, meta) {
            if (meta.automationId) {
                console.log(meta.automationId);

                const hasErr = !!testRunInfo.errs.length;

                /**
                 * 0 = Pass
                 * 1 = Fail
                 * If hasErr is true, then it should fail
                 */
                const result = hasErr ? 1 : 0;
                const testResult = {};
                const testCase = testCases.data.find(c => c.automationId === meta.automationId);

                if (testCase) {
                    testCase.lastTested = new Date(Date.now());

                    await axios.put(`/test-cases/${testCase.id}`, testCase);

                    testResult.status = result;
                    testResult.testCaseId = testCase.id;
                    testResult.testModuleId = testCase.testModuleId;
                    testResult.testRunId = testRunId;

                    await axios.post('/test-results', testResult);
                }

                name = this.currentFixtureName + ' - ' + name;
            }
        },

        reportTaskDone: function reportTaskDone(endTime, passed) {
            const durationMs = endTime - this.startTime;
            const durationStr = this.moment.duration(durationMs).format('h[h] mm[m] ss[s]');
            let footer = passed === this.testCount ? this.testCount + ' passed' : this.testCount - passed + '/' + this.testCount + ' failed';

            footer += ' (Duration: ' + durationStr + ')';
        }
    };
};

module.exports = exports['default'];
