const testDriver = (groupName, tests) => {
    let currentDoneCallback = null;
    let assertionCount = 0;
    let failureCount = 0;
    let testCount = 0;
    let currentTestName = '';

    const assert = {
        equal: (actual, expected, msg = `Expected ${actual} to equal ${expected}`) => {
            assertionCount++;
            if (actual !== expected) {
                console.error(`FAILURE in ${groupName}.${currentTestName}: ${msg}`);
                console.error(`  Actual: ${actual}, Expected: ${expected}`);
                failureCount++;
            }
        },
        notEqual: (actual, expected, msg = `Expected ${actual} not to equal ${expected}`) => {
            assertionCount++;
            if (actual === expected) {
                console.error(`FAILURE in ${groupName}.${currentTestName}: ${msg}`);
                console.error(`  Actual: ${actual}, Expected: ${expected}`);
                failureCount++;
            }
        },
        ok: (value, msg = `Expected ${value} to be truthy`) => {
            assertionCount++;
            if (!value) {
                console.error(`FAILURE in ${groupName}.${currentTestName}: ${msg}`);
                console.error(`  Value: ${value}`);
                failureCount++;
            }
        },
        fail: (msg = 'Explicit failure') => {
            assertionCount++;
            console.error(`FAILURE in ${groupName}.${currentTestName}: ${msg}`);
            failureCount++;
        },
        throws: async (fn, expectedErrorType, msg = 'Expected function to throw') => {
            assertionCount++;
            let thrown = false;
            try {
                await fn();
            } catch (e) {
                thrown = true;
                if (expectedErrorType && !(e instanceof expectedErrorType)) {
                    console.error(`FAILURE in ${groupName}.${currentTestName}: ${msg} - Threw wrong error type`);
                    console.error(`  Actual: ${e.constructor.name}, Expected: ${expectedErrorType.name}`);
                    failureCount++;
                }
            }
            if (!thrown) {
                console.error(`FAILURE in ${groupName}.${currentTestName}: ${msg} - No error thrown`);
                failureCount++;
            }
        },
        done: () => {
            if (currentDoneCallback) {
                currentDoneCallback();
                currentDoneCallback = null;
            } else {
                console.error(`ERROR: done() called multiple times or outside a test for ${groupName}.${currentTestName}`);
            }
        }
    };

    const beforeEachTest = tests.beforeEachTest || (() => {});
    const afterEachTest = tests.afterEachTest || (() => {});

    const runTest = async (name, func) => {
        currentTestName = name;
        testCount++;
        let testFinished = false;

        const donePromise = new Promise(resolve => {
            currentDoneCallback = () => {
                testFinished = true;
                resolve();
            };
        });

        try {
            await beforeEachTest();
            const result = func(assert);
            if (result instanceof Promise) {
                await result;
            }
            if (currentDoneCallback) {
                currentDoneCallback();
            }
        } catch (e) {
            console.error(`UNCAUGHT EXCEPTION in ${groupName}.${currentTestName}:`, e);
            failureCount++;
            if (currentDoneCallback) currentDoneCallback();
        } finally {
            await donePromise;
            await afterEachTest();
        }
    };

    const runAllTests = async () => {
        console.log(`\nRunning test group: ${groupName}`);
        for (const key in tests) {
            if (key !== 'beforeEachTest' && key !== 'afterEachTest') {
                await runTest(key, tests[key]);
            }
        }
        console.log(`Finished test group: ${groupName}`);
        console.log(`  Tests run: ${testCount}, Assertions: ${assertionCount}, Failures: ${failureCount}`);
        return failureCount;
    };

    return runAllTests();
};

const allTestGroups = [];
const registerTestGroup = (groupName, tests) => {
    allTestGroups.push({ groupName, tests });
};

const executeAllRegisteredTests = async () => {
    let totalFailures = 0;
    for (const { groupName, tests } of allTestGroups) {
        totalFailures += await testDriver(groupName, tests);
    }
    if (totalFailures > 0) {
        console.error(`\nTOTAL FAILURES ACROSS ALL GROUPS: ${totalFailures}`);
        process.exit(1);
    } else {
        console.log('\nAll tests passed successfully!');
        process.exit(0);
    }
};

class TaskCatalog {
    constructor() {
        this.taskDefinitions = new Map();
    }

    define(descriptor) {
        if (!descriptor.outputIdentifier) {
            throw new Error('Task definition requires an output identifier.');
        }
        this.taskDefinitions.set(descriptor.outputIdentifier, {
            ...descriptor,
            dependencies: descriptor.dependencies || [],
            cacheable: descriptor.cacheable !== false
        });
    }

    retrieve(identifier) {
        return this.taskDefinitions.get(identifier);
    }
}

class InputResultWrapper {
    constructor(data, isError = false) {
        this._data = data;
        this._isError = isError;
    }
    retrieve() {
        if (this._isError) {
            throw this._data;
        }
        return this._data;
    }
}

class ExecutionEnvironment {
    constructor(catalog, parentEnv = null) {
        this.taskCatalog = catalog;
        this.parentEnvironment = parentEnv;
        this.seededValues = new Map();
        this.explicitBindings = new Map();
        this.resultCache = new Map();
        this.currentContext = {};
    }

    establishContext(context = {}) {
        this.currentContext = context;
    }

    clearContext() {
        this.currentContext = {};
    }

    injectValue(identifier, valueOrFunction) {
        this.seededValues.set(identifier, valueOrFunction);
    }

    bindExplicitly(identifier, promiseOrValue) {
        this.explicitBindings.set(identifier, Promise.resolve(promiseOrValue));
    }

    async resolveTask(identifier) {
        if (this.explicitBindings.has(identifier)) {
            return this.explicitBindings.get(identifier);
        }

        let seeded = this.getSeededValue(identifier);
        if (seeded !== undefined) {
            return Promise.resolve(seeded);
        }

        if (this.resultCache.has(identifier)) {
            return this.resultCache.get(identifier);
        }

        const taskDefinition = this.taskCatalog.retrieve(identifier);
        if (!taskDefinition) {
            if (this.parentEnvironment) {
                const parentResult = await this.parentEnvironment.resolveTask(identifier);
                if (taskDefinition && taskDefinition.cacheable) {
                     this.resultCache.set(identifier, Promise.resolve(parentResult));
                }
                return parentResult;
            }
            throw new Error(`Undefined task: ${identifier}`);
        }

        const executionPromise = (async () => {
            const dependencyResultWrappers = await Promise.all(
                taskDefinition.dependencies.map(depKey => this._resolveDependencyOutcome(depKey))
            );

            const result = await taskDefinition.logic.apply(this.currentContext, dependencyResultWrappers);
            return result;
        })();

        if (taskDefinition.cacheable) {
            this.resultCache.set(identifier, executionPromise);
        }

        return executionPromise;
    }

    async _resolveDependencyOutcome(identifier) {
        try {
            const value = await this.resolveTask(identifier);
            return new InputResultWrapper(value, false);
        } catch (err) {
            return new InputResultWrapper(err, true);
        }
    }

    getSeededValue(identifier) {
        if (this.seededValues.has(identifier)) {
            const valOrFn = this.seededValues.get(identifier);
            return typeof valOrFn === 'function' ? valOrFn() : valOrFn;
        }
        if (this.parentEnvironment) {
            return this.parentEnvironment.getSeededValue(identifier);
        }
        return undefined;
    }
}

class TaskBuilder {
    constructor(catalog) {
        this.catalog = catalog;
        this.descriptor = {
            dependencies: [],
            cacheable: true
        };
    }

    produce(outputKey) {
        this.descriptor.outputIdentifier = outputKey;
        return this;
    }

    needs(dependencyKeys) {
        this.descriptor.dependencies = Array.isArray(dependencyKeys) ? dependencyKeys : [dependencyKeys];
        return this;
    }

    computation(logicFunction) {
        this.descriptor.logic = logicFunction;
        return this;
    }

    noCaching() {
        this.descriptor.cacheable = false;
        return this;
    }

    register() {
        this.catalog.define(this.descriptor);
    }
}

const flowEngine = {
    TaskCatalog: TaskCatalog,
    ExecutionEnvironment: ExecutionEnvironment,
    defineTask: (catalog) => new TaskBuilder(catalog)
};

const postpone = (milliseconds, action) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(action());
        }, milliseconds);
    });
};

const executeFlow = async (env, targetKey, explicitBinds = {}) => {
    const tempEnv = new flowEngine.ExecutionEnvironment(env.taskCatalog, env);
    tempEnv.establishContext(env.currentContext);
    for (const key in explicitBinds) {
        tempEnv.bindExplicitly(key, explicitBinds[key]);
    }
    return tempEnv.resolveTask(targetKey);
};

const executeMultipleFlows = (env, targetKeys) => {
    return targetKeys.map(key => executeFlow(env, key));
};

let globalTaskCatalog;
let currentExecutionEnvironment;

function defineTask() {
    return flowEngine.defineTask(globalTaskCatalog);
}

registerTestGroup('FlowEngineTests', {

    beforeEachTest: () => {
        globalTaskCatalog = new flowEngine.TaskCatalog();
        currentExecutionEnvironment = new flowEngine.ExecutionEnvironment(globalTaskCatalog);
        currentExecutionEnvironment.establishContext();
    },

    afterEachTest: () => {
        currentExecutionEnvironment.clearContext();
    },

    verifyDependencies: async (check) => {
        defineTask().produce('A').computation(() => 'A').register();
        defineTask().produce('B').computation(() => Promise.resolve('B')).register();
        defineTask().needs(['A', 'B']).produce('A_PLUS_B').computation((a, b) => a.retrieve() + b.retrieve()).register();
        defineTask().produce('C').computation(() => 'C').noCaching().register();
        defineTask().needs(['A_PLUS_B', 'C']).produce('A_PLUS_B_PLUS_C').computation((ab, c) => ab.retrieve() + c.retrieve()).register();

        const [valA, valB, valC, valAB, valABC] = await Promise.all(executeMultipleFlows(currentExecutionEnvironment, ['A', 'B', 'C', 'A_PLUS_B', 'A_PLUS_B_PLUS_C']));

        check.equal(valA, 'A');
        check.equal(valB, 'B');
        check.equal(valC, 'C');
        check.equal(valAB, 'AB');
        check.equal(valABC, 'ABC');
        check.done();
    },

    validateExplicitInputs: async (check) => {
        defineTask().produce('A_KEY').computation(() => 'A').register();
        defineTask().needs(['A_KEY', 'B_KEY']).produce('A_B_COMBINED').computation((a, b) => a.retrieve() + b.retrieve()).register();

        const result = await executeFlow(currentExecutionEnvironment, 'A_B_COMBINED', { 'B_KEY': 'FOO' });

        check.equal(result, 'AFOO');
        check.done();
    },

    assessContextualExecution: async (check) => {
        const childEnv = new flowEngine.ExecutionEnvironment(globalTaskCatalog, currentExecutionEnvironment);
        const customContext = { resultValue: 42 };

        defineTask().produce('context_val').computation(function () {
            return this.resultValue;
        }).register();

        childEnv.establishContext(customContext);
        const value = await executeFlow(childEnv, 'context_val');
        childEnv.clearContext();

        check.equal(value, 42);
        check.done();
    },

    confirmResultCaching: async (check) => {
        defineTask().produce('random_val').computation(() => Math.random()).register();

        const [r1, r2] = await Promise.all(executeMultipleFlows(currentExecutionEnvironment, ['random_val', 'random_val']));

        check.equal(r1, r2);
        check.done();
    },

    confirmCachingDisabled: async (check) => {
        defineTask().produce('random_val').computation(() => Math.random()).noCaching().register();

        const [r1, r2] = await Promise.all(executeMultipleFlows(currentExecutionEnvironment, ['random_val', 'random_val']));

        check.notEqual(r1, r2);
        check.done();
    },

    checkPromiseInputHandling: async (check) => {
        defineTask().produce('delayed_output').computation(() => {
            return postpone(200, () => 'foo');
        }).register();

        defineTask().needs(['input_foo']).produce('foo_bar').computation((foo) => {
            return foo.retrieve() + 'bar';
        }).register();

        const delayedPromise = executeFlow(currentExecutionEnvironment, 'delayed_output');
        const finalResult = await executeFlow(currentExecutionEnvironment, 'foo_bar', { 'input_foo': delayedPromise });

        check.equal(finalResult, 'foobar');
        check.done();
    },

    evaluateEnvironmentSeeding: async (check) => {
        defineTask().needs(['person_name', 'person_number']).produce('capitalized_name').computation((name, number) => {
            return name.retrieve().toUpperCase() + number.retrieve();
        }).register();

        let currentNumber = 42;
        const childEnv = new flowEngine.ExecutionEnvironment(globalTaskCatalog, currentExecutionEnvironment);
        childEnv.injectValue('person_name', 'David');
        childEnv.injectValue('person_number', () => currentNumber);

        const resultName = await executeFlow(childEnv, 'capitalized_name');

        check.equal(resultName, 'DAVID42');
        check.done();
    },

    inspectFlowCompletionCallbacks: async (check) => {
        defineTask().produce('success_task').computation(() => {
            return postpone(200, () => 'ok');
        }).register();

        defineTask().produce('error_task').computation(() => {
            throw new Error('not-ok-error');
        }).register();

        await new Promise(resolve => {
            executeFlow(currentExecutionEnvironment, 'success_task')
                .then(val => {
                    check.ok(val);
                    check.equal(val, 'ok');
                    return executeFlow(currentExecutionEnvironment, 'error_task');
                })
                .catch(err => {
                    check.equal(err.message, 'not-ok-error');
                    resolve();
                });
        });
        check.done();
    },

    validateDependentInputCaching: async (check) => {
        let callCounter = 0;
        defineTask().produce('value_processor').needs(['counter_input']).computation((counter) => {
            return counter.retrieve() + '' + counter.retrieve() + '' + counter.retrieve();
        }).register();

        const childEnv = new flowEngine.ExecutionEnvironment(globalTaskCatalog, currentExecutionEnvironment);
        childEnv.injectValue('counter_input', () => ++callCounter);

        const processedValue = await executeFlow(childEnv, 'value_processor');

        check.equal(processedValue, '111');
        check.done();
    },

    testUndefinedTaskFailure: async (check) => {
        defineTask().needs(['non_existent']).produce('nothing_val').computation(() => {}).register();

        await check.throws(async () => {
            // This tests that a direct request for an undefined task fails
            await executeFlow(currentExecutionEnvironment, 'non_existent');
        }, Error, 'Expected error for unknown task "non_existent"');

        await check.throws(async () => {
            // This tests that a task with an undefined dependency fails
            await executeFlow(currentExecutionEnvironment, 'nothing_val');
        }, Error, 'Expected error for undefined dependency');

        check.done();
    },

    verifyErrorPropagation: async (check) => {
        defineTask().produce('okay_result').computation(() => 'ok').register();
        defineTask().needs(['okay_result']).produce('error_producer').computation(() => {
            throw new Error('critical_failure');
        }).register();
        defineTask().needs(['error_producer']).produce('final_error_task').computation(() => {
            throw new Error('another_failure');
        }).register();

        let caughtError = null;
        try {
            await executeFlow(currentExecutionEnvironment, 'final_error_task');
        } catch (err) {
            caughtError = err;
        }

        check.ok(caughtError);
        check.equal(caughtError.message, 'critical_failure');
        check.done();
    },

    checkErrorSuppression: async (check) => {
        defineTask().produce('okay_result').computation(() => 'ok').register();
        defineTask().needs(['okay_result']).produce('error_producer').computation(() => {
            throw new Error('suppress_this_error');
        }).register();

        defineTask().needs(['okay_result', 'error_producer']).produce('ignored_error_task').computation((ok, notOk) => {
            // In this test, the original code explicitly does NOT call notOk.get().
            // My InputResultWrapper's retrieve() method will throw if called on an error.
            // By not calling notOk.retrieve(), the error is effectively ignored by THIS task.
            return ok.retrieve();
        }).register();

        const value = await executeFlow(currentExecutionEnvironment, 'ignored_error_task');
        check.equal(value, 'ok');
        check.done();
    },

    runComplexScenario: async (check) => {
        defineTask().produce('first_id').computation(() => postpone(20, () => 'David')).register();
        defineTask().produce('last_id').computation(() => postpone(200, () => 'Byttow')).register();
        defineTask().needs(['first_id', 'last_id']).produce('complete_id').computation((first, last) => first.retrieve() + ' ' + last.retrieve()).register();
        defineTask().needs(['complete_id']).produce('lower_cased').computation((full) => full.retrieve().toLowerCase()).register();
        defineTask().needs(['lower_cased']).produce('under_scored').computation((name) => postpone(100, () => name.retrieve().replace(' ', '_'))).noCaching().register();
        defineTask().needs(['lower_cased']).produce('upper_cased').computation((name) => postpone(200, () => name.retrieve().toUpperCase())).noCaching().register();
        defineTask().needs(['lower_cased', 'upper_cased', 'under_scored']).produce('all_names').computation((lower, upper, under) => ({
            lower_cased: lower.retrieve(),
            upper_cased: upper.retrieve(),
            under_scored: under.retrieve()
        })).register();

        const names = await executeFlow(currentExecutionEnvironment, 'all_names');

        check.equal(names.lower_cased, 'david byttow');
        check.equal(names.upper_cased, 'DAVID BYTTOW');
        check.equal(names.under_scored, 'david_byttow');
        check.done();
    }
});

executeAllRegisteredTests();