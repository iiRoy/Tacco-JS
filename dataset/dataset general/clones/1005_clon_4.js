const verificationLog = [];
let currentTestCategory = '';

const registerVerification = (category, description, success, details = '') => {
    verificationLog.push({ category, description, success, details });
};

const valueInspector = (subject) => ({
    mustExist: (message = 'Value was not defined.') => {
        if (typeof subject === 'undefined') {
            throw new Error(message);
        }
    },
    mustBeFunction: (message = 'Value was not a function.') => {
        if (typeof subject !== 'function') {
            throw new Error(message);
        }
    },
    mustMatch: (expectedValue, message = `Expected value to match ${expectedValue}, but got ${subject}.`) => {
        if (subject !== expectedValue) {
            throw new Error(message);
        }
    },
    mustThrow: (message = 'Expected an error, but none was thrown.') => {
        let threw = false;
        try {
            subject();
        } catch (e) {
            threw = true;
        }
        if (!threw) {
            throw new Error(message);
        }
    },
    mustNotThrow: (message = 'An unexpected error was thrown.') => {
        let threw = false;
        try {
            subject();
        } catch (e) {
            threw = true;
        }
        if (threw) {
            throw new Error(message);
        }
    }
});

const runTest = (description, testFunction) => {
    return new Promise((resolve, reject) => {
        try {
            const result = testFunction(description);
            if (result && typeof result.then === 'function') {
                result
                    .then(() => {
                        registerVerification(currentTestCategory, description, true);
                        resolve();
                    })
                    .catch(e => {
                        registerVerification(currentTestCategory, description, false, e.message || String(e));
                        resolve();
                    });
            } else {
                registerVerification(currentTestCategory, description, true);
                resolve();
            }
        } catch (e) {
            registerVerification(currentTestCategory, description, false, e.message || String(e));
            resolve();
        }
    });
};

const runTestGroup = async (title, testDefinitions) => {
    const previousCategory = currentTestCategory;
    currentTestCategory = title;
    for (const testDef of testDefinitions) {
        await runTest(testDef.description, testDef.func);
    }
    currentTestCategory = previousCategory;
};

const testPlan = [];

testPlan.push(async () => {
    await runTestGroup("Module System Overview", [
        {
            description: "GlobalModuleSystem should be present",
            func: () => valueInspector(Modil).mustExist()
        }
    ]);
});

testPlan.push(async () => {
    await runTestGroup("Module Definition Mechanism", [
        {
            description: "Modil.define should be a function reference",
            func: () => valueInspector(Modil.define).mustBeFunction()
        },
        {
            description: "Global module definition function should be present",
            func: () => valueInspector(define).mustBeFunction()
        },
        {
            description: "AMD compatibility flag should be set",
            func: () => valueInspector(define.amd).mustExist()
        },
        {
            description: "Definition without arguments should cause error",
            func: () => valueInspector(() => define()).mustThrow()
        },
        {
            description: "Definition with only module name should cause error",
            func: () => valueInspector(() => define('module')).mustThrow()
        },
        {
            description: "Definition with name, deps, but no factory should cause error",
            func: () => valueInspector(() => define('module', 'dependencies', function(){})).mustThrow()
        },
        {
            description: "Definition with only factory function should not cause error",
            func: () => valueInspector(() => define(function () {})).mustNotThrow()
        },
        {
            description: "Mock helper function should exist on definition utility",
            func: () => valueInspector(define.mock).mustBeFunction()
        }
    ]);
});

testPlan.push(async () => {
    let invocationCounter = 0;

    await runTestGroup("Module Resolution Mechanism", [
        {
            description: "Modil.require should be a function reference",
            func: () => valueInspector(Modil.require).mustBeFunction()
        },
        {
            description: "Global module resolution function should be present",
            func: () => valueInspector(require).mustBeFunction()
        },
        {
            description: "Resolution without arguments should cause error",
            func: () => valueInspector(() => require()).mustThrow()
        },
        {
            description: "Resolution for non-existent module should cause error",
            func: () => valueInspector(() => require('doesnt.exist')).mustThrow()
        },
        {
            description: "Resolution for non-existent module with invalid callback should cause error",
            func: () => valueInspector(() => require('doesnt.exist', 'not.a.function')).mustThrow()
        },
        {
            description: "Resolution for non-existent module array with invalid callback should cause error",
            func: () => valueInspector(() => require(['doesnt.exist'], 'not.a.function')).mustThrow()
        },
        {
            description: "Error callback should be invoked for missing dependency and count should be one",
            func: () => new Promise((resolve, reject) => {
                let pollAttempts = 0;
                const maxAttempts = 10;
                const pollInterval = 10;

                require(['doesnt.exist'], function () {}, function () {
                    invocationCounter++;
                });

                const checkCondition = () => {
                    if (invocationCounter > 0) {
                        try {
                            valueInspector(invocationCounter).mustMatch(1, "Expected error callback to be called exactly once.");
                            resolve();
                        } catch (e) {
                            reject(e);
                        }
                    } else if (pollAttempts >= maxAttempts) {
                        reject(new Error("Timeout: Error callback was not invoked."));
                    } else {
                        pollAttempts++;
                        setTimeout(checkCondition, pollInterval);
                    }
                };
                setTimeout(checkCondition, pollInterval);
            })
        },
        {
            description: "Optional dependency helper should be available",
            func: () => valueInspector(require.optional).mustBeFunction()
        }
    ]);
});

(async () => {
    'use strict';

    for (const groupFn of testPlan) {
        await groupFn();
    }

    console.log("--- Verification Results Summary ---");
    let totalCases = verificationLog.length;
    let successfulCases = verificationLog.filter(entry => entry.success).length;
    let failedCases = totalCases - successfulCases;

    verificationLog.forEach(entry => {
        const status = entry.success ? 'SUCCESS' : 'FAILURE';
        console.log(`[${status}] ${entry.category}: ${entry.description}`);
        if (!entry.success) {
            console.error(`  Details: ${entry.details}`);
        }
    });

    console.log(`\nVerification Summary: Total: ${totalCases}, Passed: ${successfulCases}, Failed: ${failedCases}`);
})();