'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

const axios = require('axios');
const testCases = [];
let toucanToken;
let testRunId;

const logError = (err) => {
    console.log('An error occurred within testcafe-reporter-toucan: ', `\n\t${err.config.method.toUpperCase()} ${err.config.url}\n\t${err.message}`);
};

exports['default'] = () => {
    return {
        noColors: true,

        reportTaskStart: async function reportTaskStart() { },

        reportFixtureStart: async function reportFixtureStart(name, path, meta) {
            if (!toucanToken) {
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

                let testRun;
                let testModules;

                try {
                    testRun = await axios.get('/test-runs', {
                        params: {
                            pageNumber: 1,
                            pageSize: 1,
                            searchText: meta.toucan.testRunTitle
                        }
                    });
                }
                catch (err) {
                    logError(err);
                }

                if (!testRun.data.length) {
                    testRun = await axios.post('/test-runs', {
                        name: meta.toucan.testRunTitle,
                        testSuiteId: meta.toucan.testSuiteId
                    });

                    testRunId = testRun.data.id;
                }
                else
                    testRunId = testRun.data[0].id;


                try {
                    testModules = await axios.get(`/test-suites/${meta.toucan.testSuiteId}/test-modules`);
                }
                catch (err) {
                    logError(err);
                }

                testModules.data.forEach(async testModule => {
                    const results = await axios.get(`test-suites/${meta.toucan.testSuiteId}/test-modules/${testModule.id}/test-cases`);

                    testCases.push(...results.data);
                });
            }
        },

        reportTestDone: async function reportTestDone(name, testRunInfo, meta) {
            if (meta.automationId) {
                const hasErr = !!testRunInfo.errs.length;

                /**
                 * 0 = Pass
                 * 1 = Fail
                 * If hasErr is true, then it should fail
                 */
                const result = hasErr ? 1 : 0;
                const testResult = {};
                const testCase = testCases.find(c => c.automationId === meta.automationId);

                if (testCase) {
                    testCase.lastTested = new Date(Date.now());

                    try {
                        await axios.put(`/test-cases/${testCase.id}`, testCase);
                    }
                    catch (err) {
                        logError(err);
                    }

                    testResult.status = result;
                    testResult.testCaseId = testCase.id;
                    testResult.testModuleId = testCase.testModuleId;
                    testResult.testRunId = testRunId;

                    try {
                        await axios.post('/test-results', testResult);
                    }
                    catch (err) {
                        logError(err);
                    }
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
