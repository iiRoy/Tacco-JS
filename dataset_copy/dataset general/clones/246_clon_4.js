'use strict';

const checker = {
    overallChecks: 0,
    failedChecks: 0,
    currentTestFailures: [],

    resetForTest: function() {
        this.currentTestFailures = [];
    },

    registerCheck: function(condition, message) {
        this.overallChecks++;
        if (!condition) {
            this.failedChecks++;
            this.currentTestFailures.push(`  Check Failed: ${message}`);
            return false;
        }
        return true;
    },

    verifyEquality: function(actual, expected, message) {
        this.registerCheck(actual === expected, `${message} (Expected: ${expected}, Got: ${actual})`);
    },

    verifyInequality: function(actual, expected, message) {
        this.registerCheck(actual !== expected, `${message} (Expected not: ${expected}, Got: ${actual})`);
    },

    verifyTruthy: function(value, message) {
        this.registerCheck(!!value, `${message} (Value: ${value})`);
    },

    verifyException: function(func, message) {
        this.overallChecks++;
        let exceptionOccurred = false;
        try {
            func();
        } catch (e) {
            exceptionOccurred = true;
        }
        if (!exceptionOccurred) {
            this.failedChecks++;
            this.currentTestFailures.push(`  Check Failed: ${message} (Expected an exception to be thrown)`);
        }
    },

    produceSummary: function() {
        if (this.failedChecks === 0) {
            console.log(`\nAll ${this.overallChecks} individual assertions passed across the suite.`);
        } else {
            console.error(`\n${this.failedChecks} out of ${this.overallChecks} individual assertions failed across the suite.`);
        }
    }
};

const ServiceKit = require('retsly-js-sdk');

const doNothing = function () {};

const validationCases = [];
const suiteIdentifier = 'SDK Component Validation';

function defineValidation(descriptionText, testRoutine) {
    validationCases.push({ descriptionText, testRoutine });
}

async function conductValidations(label) {
    console.log(`\n--- Commencing Validation Suite: ${label} ---`);
    let successfulRoutines = 0;
    let failedRoutines = 0;

    for (const testCase of validationCases) {
        checker.resetForTest();
        try {
            await new Promise((resolve, reject) => {
                const completionCallback = (err = null) => {
                    if (err) {
                        reject(err);
                    } else {
                        if (checker.currentTestFailures.length > 0) {
                            reject(new Error(`Validation "${testCase.descriptionText}" had assertion failures:\n${checker.currentTestFailures.join('\n')}`));
                        } else {
                            resolve();
                        }
                    }
                };
                testCase.testRoutine(completionCallback);
            });
            successfulRoutines++;
        } catch (error) {
            failedRoutines++;
            console.error(`  ✖ Validation "${testCase.descriptionText}" FAILED:`, error.message || error);
        }
    }

    console.log(`\n--- Validation Suite Outcomes ---`);
    console.log(`Total validation routines: ${validationCases.length}`);
    console.log(`Routines passed: ${successfulRoutines}`);
    console.log(`Routines failed: ${failedRoutines}`);
    checker.produceSummary();
}

defineValidation('verifying constructor type', function (completionCallback) {
    checker.verifyEquality(typeof ServiceKit, 'function', 'ServiceKit should be a function (constructor)');
    completionCallback();
});

defineValidation('evaluating argument expectations', function (completionCallback) {
    checker.verifyEquality(ServiceKit.length, 3, 'ServiceKit constructor expects 3 arguments');
    checker.verifyException(() => { new ServiceKit(); }, 'ServiceKit should throw without arguments');
    checker.verifyTruthy(new ServiceKit('first', 'second'), 'ServiceKit should instantiate with two arguments');
    completionCallback();
});

defineValidation('inspecting public options attribute', function (completionCallback) {
    var instanceA = new ServiceKit('first', 'second', {propertyX: 'valueY'});
    checker.verifyEquality(instanceA.options.propertyX, 'valueY', 'Instance options should reflect passed object');
    completionCallback();
});

defineValidation('confirming socket.io integration', function (completionCallback) {
    var instanceA = new ServiceKit('first', 'second');
    instanceA.doSockets();
    checker.verifyTruthy(instanceA.io, 'Socket.io connection should be established');
    completionCallback();
});

defineValidation('asserting setup method chainability', function (completionCallback) {
    ServiceKit
        .client('identity1')
        .token('secret1')
        .options({setting:true})
        .create();
    checker.registerCheck(true, 'Setup methods should be chainable without errors');
    completionCallback();
});

defineValidation('validating original instance return', function (completionCallback) {
    var instanceA = new ServiceKit('initial_id', 'initial_key');
    var instanceB = ServiceKit.create();
    checker.verifyEquality(instanceB.getClient(), 'initial_id', 'Created instance should have original client ID');
    checker.verifyEquality(instanceB, instanceA, 'Created instance should be the same as the initial one');
    completionCallback();
});

defineValidation('checking singleton behavior for instance creation', function (completionCallback) {
    var instanceA = ServiceKit.create();
    var instanceB = ServiceKit.create();
    checker.verifyTruthy(instanceA instanceof ServiceKit, 'First created instance should be of ServiceKit type');
    checker.verifyTruthy(instanceB instanceof ServiceKit, 'Second created instance should be of ServiceKit type');
    checker.verifyEquality(instanceA, instanceB, 'Subsequent create calls should return the same instance');
    completionCallback();
});

defineValidation('testing instance replacement with new arguments', function (completionCallback) {
    var instanceA = ServiceKit.create();
    var instanceB = ServiceKit.create('new_id', 'new_key', {setting:false});
    var instanceC = ServiceKit.create();
    checker.verifyInequality(instanceA, instanceB, 'New arguments should create a different instance');
    checker.verifyEquality(instanceB, instanceC, 'Subsequent create calls after replacement should return the new instance');
    completionCallback();
});

defineValidation('constructing URLs from fragments', function (completionCallback) {
    var instanceA = new ServiceKit('client_id','client_key');
    checker.verifyEquality(instanceA.getDomain() + '/api/v1/test', instanceA.getURL('test'), 'URL should be correctly assembled from domain and fragment');
    completionCallback();
});

defineValidation('triggering all registered callbacks', function (completionCallback) {
    var invocationCount = 0;
    var processFunction = function () { invocationCount++; if (2 === invocationCount) completionCallback(); };
    var instanceA = new ServiceKit('client_id','client_key');
    instanceA.ready(processFunction).ready(processFunction).ready();
});

defineValidation('confirming ready method chainability', function (completionCallback) {
    var instanceA = new ServiceKit('client_id','client_key')
        .ready(doNothing)
        .ready(doNothing);
    checker.verifyTruthy(instanceA instanceof ServiceKit, 'Ready method should return instance for chaining');
    completionCallback();
});

defineValidation('confirming data access method chainability', function (completionCallback) {
    var instanceA = new ServiceKit('client_id','client_key')
        .get('data.xml', doNothing)
        .post('submit.json', doNothing);
    checker.verifyTruthy(instanceA instanceof ServiceKit, 'Data access methods should return instance for chaining');
    completionCallback();
});

defineValidation('confirming logout method chainability', function (completionCallback) {
    var instanceA = new ServiceKit('client_id','client_key')
        .logout(doNothing);
    checker.verifyTruthy(instanceA instanceof ServiceKit, 'Logout method should return instance for chaining');
    completionCallback();
});

conductValidations(suiteIdentifier);