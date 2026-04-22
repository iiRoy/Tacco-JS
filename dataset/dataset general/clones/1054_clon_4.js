'use strict';

let pendingPromiseActions = [];

function customPromiseCreator() {
    let resultValue;
    let rejectionReason;
    let statusIndicator = 'pending'; // 'pending', 'fulfilled', 'failed'
    let successHandlers = [];
    let failureHandlers = [];

    function triggerAllHandlers() {
        if (statusIndicator === 'fulfilled') {
            successHandlers.forEach(h => h(resultValue));
            successHandlers = [];
            failureHandlers = [];
        } else if (statusIndicator === 'failed') {
            failureHandlers.forEach(h => h(rejectionReason));
            successHandlers = [];
            failureHandlers = [];
        }
    }

    const promiseEntity = {
        then: function(onSuccessCallback, onFailureCallback) {
            let nextController = customPromiseCreator(); 
            let wrappedSuccess = (val) => {
                if (onSuccessCallback) {
                    try {
                        const res = onSuccessCallback(val);
                        if (res && typeof res.then === 'function') {
                            res.then(nextController.fulfill, nextController.fail);
                        } else {
                            nextController.fulfill(res);
                        }
                    } catch (e) {
                        nextController.fail(e);
                    }
                } else {
                    nextController.fulfill(val); 
                }
            };
            let wrappedFailure = (err) => {
                if (onFailureCallback) {
                    try {
                        const res = onFailureCallback(err);
                        if (res && typeof res.then === 'function') {
                            res.then(nextController.fulfill, nextController.fail);
                        } else {
                            nextController.fulfill(res); 
                        }
                    } catch (e) {
                        nextController.fail(e);
                    }
                } else {
                    nextController.fail(err); 
                }
            };

            if (statusIndicator === 'pending') {
                successHandlers.push(wrappedSuccess);
                failureHandlers.push(wrappedFailure);
            } else if (statusIndicator === 'fulfilled') {
                pendingPromiseActions.push(() => wrappedSuccess(resultValue));
            } else if (statusIndicator === 'failed') {
                pendingPromiseActions.push(() => wrappedFailure(rejectionReason));
            }
            return nextController.promiseEntity;
        }
    };

    const promiseController = {
        promiseEntity: promiseEntity,
        fulfill: function(val) {
            if (statusIndicator !== 'pending') return;
            statusIndicator = 'fulfilled';
            resultValue = val;
            pendingPromiseActions.push(triggerAllHandlers);
        },
        fail: function(reason) {
            if (statusIndicator !== 'pending') return;
            statusIndicator = 'failed';
            rejectionReason = reason;
            pendingPromiseActions.push(triggerAllHandlers);
        }
    };
    return promiseController;
}

function runDigestCycle() {
    while (pendingPromiseActions.length > 0) {
        const action = pendingPromiseActions.shift();
        action();
    }
}

const globalPromiseSystem = {
    createDeferred: function() {
        return customPromiseCreator();
    },
    succeedWith: function(val) {
        const control = customPromiseCreator();
        control.fulfill(val);
        return control.promiseEntity;
    },
    coordinateAll: function(entityMap) {
        const finalControl = customPromiseCreator();
        const results = {};
        let totalEntities = Object.keys(entityMap).length;
        let fulfilledCount = 0;
        let failureOccurred = false;

        if (totalEntities === 0) {
            finalControl.fulfill({});
            return finalControl.promiseEntity;
        }

        Object.entries(entityMap).forEach(([key, entity]) => {
            entity.then(val => {
                if (failureOccurred) return;
                results[key] = val;
                fulfilledCount++;
                if (fulfilledCount === totalEntities) {
                    finalControl.fulfill(results);
                }
            }, err => {
                if (!failureOccurred) {
                    failureOccurred = true;
                    finalControl.fail(err);
                }
            });
        });
        return finalControl.promiseEntity;
    }
};

const outputBuffer = [];
let assertionCounter = 0;
let failingAssertions = 0;

function customSpy() {
    const recordedCalls = [];
    const spyFunction = function(...args) {
        recordedCalls.push(args);
        return undefined; 
    };
    spyFunction.getInvocationCount = () => recordedCalls.length;
    spyFunction.getInvokedWith = (idx) => recordedCalls[idx];
    spyFunction.wasInvoked = () => recordedCalls.length > 0;
    spyFunction.wasInvokedWith = (...expectedArgs) => recordedCalls.some(c => JSON.stringify(c) === JSON.stringify(expectedArgs));
    return spyFunction;
}

function assertionHelper(actualValue) {
    return {
        isEqualTo: function(expectedValue) {
            assertionCounter++;
            if (JSON.stringify(actualValue) !== JSON.stringify(expectedValue)) {
                outputBuffer.push(`  ❌ Expected ${JSON.stringify(actualValue)} to be equal to ${JSON.stringify(expectedValue)}`);
                failingAssertions++;
            } else {
                outputBuffer.push(`  ✅ Assertion passed: ${JSON.stringify(actualValue)} is equal to ${JSON.stringify(expectedValue)}`);
            }
        },
        hasBeenCalled: function() {
            assertionCounter++;
            if (!actualValue.wasInvoked()) {
                outputBuffer.push(`  ❌ Expected spy to have been called`);
                failingAssertions++;
            } else {
                outputBuffer.push(`  ✅ Spy was called`);
            }
        },
        hasBeenCalledWith: function(...args) {
            assertionCounter++;
            if (!actualValue.wasInvokedWith(...args)) {
                outputBuffer.push(`  ❌ Expected spy to have been called with ${JSON.stringify(args)}`);
                failingAssertions++;
            } else {
                outputBuffer.push(`  ✅ Spy was called with ${JSON.stringify(args)}`);
            }
        },
        hasNotBeenCalled: function() {
            assertionCounter++;
            if (actualValue.wasInvoked()) {
                outputBuffer.push(`  ❌ Expected spy not to have been called`);
                failingAssertions++;
            } else {
                outputBuffer.push(`  ✅ Spy was not called`);
            }
        }
    };
}

function verifyCase(descriptionText, testLogic) {
    outputBuffer.push(`    - ${descriptionText}`);
    testLogic();
}

function verificationSuite(suiteName, suiteLogic) {
    outputBuffer.push(`\n${suiteName}`);
    suiteLogic();
}

function createMockNavigationService() {
    const pathInvocations = customSpy();
    const replaceInvocations = customSpy();
    return {
        routeTo: pathInvocations,
        replaceRoute: replaceInvocations
    };
}

function provideExtendedPromise(basePromiseEntity) {
    const extendedMethods = {
        basePromiseEntity: basePromiseEntity,

        handleFailure: function(failureCallback) {
            return provideExtendedPromise(this.basePromiseEntity.then(null, failureCallback));
        },

        establishValue: function(targetObject, propertyKey, fixedValue) {
            return provideExtendedPromise(this.basePromiseEntity.then(resolvedValue => {
                targetObject[propertyKey] = fixedValue !== undefined ? fixedValue : resolvedValue;
            }));
        },

        establishFailureValue: function(targetObject, propertyKey, fixedValue) {
            return provideExtendedPromise(this.basePromiseEntity.then(null, rejectedReason => {
                targetObject[propertyKey] = fixedValue !== undefined ? fixedValue : rejectedReason;
            }));
        },

        extractProperty: function(propertyToExtract) {
            return provideExtendedPromise(this.basePromiseEntity.then(obj => obj[propertyToExtract]));
        },

        supplyFixedResult: function(successResult, failureResult) {
            return provideExtendedPromise(this.basePromiseEntity.then(
                () => successResult,
                failureResult !== undefined ? () => failureResult : null
            ));
        },

        executeSideEffect: function(effectFunction) {
            return provideExtendedPromise(this.basePromiseEntity.then(value => {
                effectFunction(value);
                return value; 
            }));
        },

        invokeMethodOnResult: function(methodName, ...invocationArgs) {
            return provideExtendedPromise(this.basePromiseEntity.then(obj => {
                if (typeof obj[methodName] === 'function') {
                    return obj[methodName](...invocationArgs);
                }
                return obj; 
            }));
        },

        navigateDestination: function(targetPath, shouldReplaceEntry) {
            return provideExtendedPromise(this.basePromiseEntity.then(() => {
                currentNavigationService.routeTo(targetPath);
                if (shouldReplaceEntry) {
                    currentNavigationService.replaceRoute();
                }
            }));
        },

        andThen: function(onSuccessCallback, onFailureCallback) {
            return provideExtendedPromise(this.basePromiseEntity.then(onSuccessCallback, onFailureCallback));
        }
    };
    return extendedMethods;
}

function provideExtendedAllPromise(basePromiseEntity) {
    const extendedAll = provideExtendedPromise(basePromiseEntity);
    extendedAll.assignAllToTarget = function(targetObject) {
        return provideExtendedPromise(this.basePromiseEntity.then(resultsMap => {
            Object.assign(targetObject, resultsMap);
        }));
    };
    return extendedAll;
}

let currentNavigationService;
let currentPromiseFacility;

const cycleExecutor = {
    triggerCycle: runDigestCycle
};

verificationSuite('The Custom Promise Utility Suite', function() {

    function setupTestEnvironment() {
        currentNavigationService = createMockNavigationService();
        currentPromiseFacility = globalPromiseSystem;
        pendingPromiseActions = []; 
    }

    verificationSuite('The Failure Handling Method', function() {
        setupTestEnvironment();

        verifyCase('should be an alias for .then(null, fn)', function() {
            let promiseControl = currentPromiseFacility.createDeferred();
            let errorAction = customSpy();
            provideExtendedPromise(promiseControl.promiseEntity).handleFailure(errorAction);
            promiseControl.fail();
            cycleExecutor.triggerCycle(); 
            assertionHelper(errorAction).hasBeenCalled();
        });
    });

    verificationSuite('The Value Setting Method', function() {
        setupTestEnvironment();

        verifyCase('should set the resolved promise\'s value to the given object under the given key', function() {
            let dataContainer = {};
            let propertyName = 'label';
            let finalValue = 'for grand success';

            let promiseControl = currentPromiseFacility.createDeferred();
            provideExtendedPromise(promiseControl.promiseEntity).establishValue(dataContainer, propertyName);
            promiseControl.fulfill(finalValue);

            cycleExecutor.triggerCycle();

            assertionHelper(dataContainer.label).isEqualTo(finalValue);
        });

        verifyCase('should set a fixed value when the promise resolves and a constant was provided', function() {
            let dataContainer = {};
            let promiseControl = currentPromiseFacility.createDeferred();
            provideExtendedPromise(promiseControl.promiseEntity).establishValue(dataContainer, 'label', 'fixed_text');
            promiseControl.fulfill();
            cycleExecutor.triggerCycle();
            assertionHelper(dataContainer.label).isEqualTo('fixed_text');
        });
    });

    verificationSuite('The Failure Value Setting Method', function() {
        setupTestEnvironment();

        verifyCase('should set the rejected promise\'s value to the given object under the given key', function() {
            let dataContainer = {};
            let promiseControl = currentPromiseFacility.createDeferred();
            provideExtendedPromise(promiseControl.promiseEntity).establishFailureValue(dataContainer, 'label');
            promiseControl.fail('for grand failure');
            cycleExecutor.triggerCycle();
            assertionHelper(dataContainer.label).isEqualTo('for grand failure');
        });

        verifyCase('should set a fixed value when the promise resolves and a constant was provided', function() {
            let dataContainer = {};
            let promiseControl = currentPromiseFacility.createDeferred();
            provideExtendedPromise(promiseControl.promiseEntity).establishFailureValue(dataContainer, 'label', 'fixed_error_text');
            promiseControl.fail();
            cycleExecutor.triggerCycle();
            assertionHelper(dataContainer.label).isEqualTo('fixed_error_text');
        });
    });

    verificationSuite('The Property Extraction Method', function() {
        setupTestEnvironment();

        verifyCase('should take the value of the given key from the object returned by the promise and pass it to the next then in the chain', function() {
            let sourceObject = {
                identifier: 'unique_id_123'
            };
            let promiseControl = currentPromiseFacility.createDeferred();
            let successObserver = customSpy();
            provideExtendedPromise(promiseControl.promiseEntity)
                .extractProperty('identifier')
                .andThen(successObserver);

            promiseControl.fulfill(sourceObject);
            cycleExecutor.triggerCycle();
            assertionHelper(successObserver).hasBeenCalledWith(sourceObject.identifier);
        });
    });

    verificationSuite('The Fixed Result Supply Method', function() {
        setupTestEnvironment();

        verifyCase('should pass the first argument to the next then in the chain when the promise resolves', function() {
            let promiseControl = currentPromiseFacility.createDeferred();
            let successObserver = customSpy();
            provideExtendedPromise(promiseControl.promiseEntity)
                .supplyFixedResult('successful_outcome')
                .andThen(successObserver);

            promiseControl.fulfill();
            cycleExecutor.triggerCycle();

            assertionHelper(successObserver).hasBeenCalledWith('successful_outcome');
        });

        verifyCase('should pass the second argument to the next then in the chain when the promise rejects', function() {
            let promiseControl = currentPromiseFacility.createDeferred();
            let successObserver = customSpy(); 
            provideExtendedPromise(promiseControl.promiseEntity)
                .supplyFixedResult('successful_outcome', 'failed_outcome')
                .andThen(successObserver);

            promiseControl.fail();
            cycleExecutor.triggerCycle();

            assertionHelper(successObserver).hasBeenCalledWith('failed_outcome');
        });
    });

    verificationSuite('The Side Effect Execution Method', function() {
        setupTestEnvironment();

        verifyCase('should call the function with the promise value when the promise resolves', function() {
            let promiseControl = currentPromiseFacility.createDeferred();
            let effectObserver = customSpy();
            provideExtendedPromise(promiseControl.promiseEntity).executeSideEffect(effectObserver);
            promiseControl.fulfill('input_value');
            cycleExecutor.triggerCycle();
            assertionHelper(effectObserver).hasBeenCalledWith('input_value');
        });

        verifyCase('should pass the resolved value to the next entry in the promise chain regardless of the return value of the first handler', function() {
            let promiseControl = currentPromiseFacility.createDeferred();
            let secondEffectObserver = customSpy();

            provideExtendedPromise(promiseControl.promiseEntity)
                .executeSideEffect(function() {
                    return 'different_result';
                })
                .executeSideEffect(secondEffectObserver);

            promiseControl.fulfill('original_value');
            cycleExecutor.triggerCycle();
            assertionHelper(secondEffectObserver).hasBeenCalledWith('original_value');
        });
    });

    verificationSuite('The Method Invocation On Result Method', function() {
        setupTestEnvironment();

        verifyCase('should call the given function name on the object returned by the project with the remaining parameters as arguments', function() {
            let promiseControl = currentPromiseFacility.createDeferred();
            let invokedCallback = customSpy();

            provideExtendedPromise(promiseControl.promiseEntity).invokeMethodOnResult('process', 'first_arg');

            promiseControl.fulfill({
                process: invokedCallback
            });
            cycleExecutor.triggerCycle();

            assertionHelper(invokedCallback).hasBeenCalledWith('first_arg');
        });
    });

    verificationSuite('The Navigation Redirection Method', function() {
        setupTestEnvironment();

        verifyCase('should call navigationService.routeTo with the given path argument', function() {
            let promiseControl = currentPromiseFacility.createDeferred();

            provideExtendedPromise(promiseControl.promiseEntity).navigateDestination('/new_route');
            promiseControl.fulfill();
            cycleExecutor.triggerCycle();

            assertionHelper(currentNavigationService.routeTo).hasBeenCalledWith('/new_route');
            assertionHelper(currentNavigationService.replaceRoute).hasNotBeenCalled();
        });

        verifyCase('should call navigationService.replaceRoute if the second argument is true', function() {
            let promiseControl = currentPromiseFacility.createDeferred();

            provideExtendedPromise(promiseControl.promiseEntity).navigateDestination('/new_route', true);
            promiseControl.fulfill();
            cycleExecutor.triggerCycle();

            assertionHelper(currentNavigationService.routeTo).hasBeenCalledWith('/new_route');
            assertionHelper(currentNavigationService.replaceRoute).hasBeenCalled();
        });
    });

    verificationSuite('the Assign All To Target Method', function() {
        setupTestEnvironment();

        verifyCase('should set the given promises to the given object under their respective object keys', function() {
            let itemOnePromise = currentPromiseFacility.succeedWith('content one');
            let itemTwoPromise = currentPromiseFacility.succeedWith('content two');
            let targetStorage = {};

            let allPromises = currentPromiseFacility.coordinateAll({
                alpha: itemOnePromise,
                beta: itemTwoPromise
            });
            provideExtendedAllPromise(allPromises).assignAllToTarget(targetStorage);
            cycleExecutor.triggerCycle();

            assertionHelper(targetStorage.alpha).isEqualTo('content one');
            assertionHelper(targetStorage.beta).isEqualTo('content two');
        });
    });

});

outputBuffer.forEach(line => console.log(line));
console.log(`\n--- Test Summary ---`);
console.log(`Total assertions: ${assertionCounter}`);
console.log(`Failed assertions: ${failingAssertions}`);
if (failingAssertions === 0) {
    console.log('All tests passed! 🎉');
} else {
    console.log('Some tests failed. 😔');
}