'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

let testSuiteId;

let testModuleId;

let toucanToken;

let testRunTitle;

try {
    testSuiteId = process.argv.find((val) => val.includes('testSuiteId')).split('=')[1] ?
        process.argv.find((val) => val.includes('testSuiteId')).split('=')[1] :
        '';

    testModuleId = process.argv.find((val) => val.includes('testModuleId')) ?
        process.argv.find((val) => val.includes('testModuleId')).split('=')[1] :
        '';

    // Make this an ajax call to the api eventually
    toucanToken = process.argv.find((val) => val.includes('toucanToken')) ?
        process.argv.find((val) => val.includes('toucanToken')).split('=')[1] :
        '';

    testRunTitle = process.argv.find((val) => val.includes('testRunTitle')) ?
        process.argv.find((val) => val.includes('testRunTitle')).split('=')[1] :
        '';

    if (testSuiteId.length < 1 || testModuleId.length < 1 || toucanToken.length < 1 || testRunTitle < 1)
        throw 'You must provide testSuiteId, testModuleId, toucanToken, testRunTitle';
} 
catch (err) {
    console.log(err);
}

let testRunId = '';

var axios = require('axios');

axios.defaults.headers.common['Authorization'] = 'Bearer ' + toucanToken;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.baseURL = 'http://api.toucantesting.com';

exports['default'] = () => {
    return {
        noColors: true,

        reportTaskStart: async function reportTaskStart () {
            const newTestRun = {};

            newTestRun.name = testRunTitle;
            newTestRun.testSuiteId = testSuiteId;

            const res = await axios.post('/test-runs', newTestRun);

            testRunId = res.data.id;

        },

        reportFixtureStart: function reportFixtureStart (name) {
            this.currentFixtureName = name;
        },

        reportTestDone: async function reportTestDone (name, errs) {
            var hasErr = !!errs.length;
            /**
             * 0 = Pass
             * 1 = Fail
             * If hasErr is true, then it should fail
             */
            var result = hasErr ? 1 : 0;

            // Make reusable { testCaseId, testModuleId, testRunId }
            var testResult = {};

            var testCaseId = name.split(' ')[0];

            console.log(testCaseId, ' ***Test Case ID');

            if (testCaseId !== 'M') {
                testResult.status = result;
                testResult.testCaseId = testCaseId;
    
                testResult.testModuleId = testModuleId;
                testResult.testRunId = testRunId;
    
                await axios.post('/test-results', testResult);
            }

            name = this.currentFixtureName + ' - ' + name;
        },

        reportTaskDone: function reportTaskDone (endTime, passed) {
            var durationMs = endTime - this.startTime;
            var durationStr = this.moment.duration(durationMs).format('h[h] mm[m] ss[s]');
            var footer = passed === this.testCount ? this.testCount + ' passed' : this.testCount - passed + '/' + this.testCount + ' failed';

            footer += ' (Duration: ' + durationStr + ')';
        }
    };
};

module.exports = exports['default'];
