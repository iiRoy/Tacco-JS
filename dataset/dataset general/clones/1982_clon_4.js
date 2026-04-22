function orchestrator(initialTask) {
    let _workflowStages = [{ type: 'sequential', tasks: [initialTask] }];
    let _errorHandler = null;

    const api = {
        sequence: function(taskFn) {
            _workflowStages.push({ type: 'sequential', tasks: [taskFn] });
            return api;
        },
        concurrent: function(taskFn) {
            const currentStage = _workflowStages[_workflowStages.length - 1];
            if (currentStage.type === 'sequential') {
                currentStage.type = 'parallel';
                currentStage.tasks.push(taskFn);
            } else {
                currentStage.tasks.push(taskFn);
            }
            return api;
        },
        onError: function(handlerFn) {
            _errorHandler = handlerFn;
            return api;
        },
        execute: function(initialPayload, finalCb) {
            processStages(0, initialPayload, _workflowStages, _errorHandler, finalCb);
        }
    };
    return api;
}

function processStages(stageIndex, currentPayload, stages, errorHandler, finalCallback) {
    if (stageIndex >= stages.length) {
        finalCallback(currentPayload);
        return;
    }

    const currentStage = stages[stageIndex];

    if (currentStage.type === 'sequential') {
        const task = currentStage.tasks[0];
        try {
            task(currentPayload, (errorInstance, result) => {
                if (errorInstance) {
                    if (errorHandler) errorHandler(errorInstance);
                    else finalCallback(errorInstance);
                    return;
                }
                processStages(stageIndex + 1, result, stages, errorHandler, finalCallback);
            });
        } catch (e) {
            if (errorHandler) errorHandler(e);
            else finalCallback(e);
        }
    } else {
        const tasks = currentStage.tasks;
        let completedTasks = 0;
        let collectedResults = new Array(tasks.length);
        let currentStageError = null;
        let errorSignaled = false;

        const checkStageCompletion = () => {
            if (errorSignaled) return;

            completedTasks++;
            if (completedTasks === tasks.length) {
                if (currentStageError) {
                    if (errorHandler) errorHandler(currentStageError);
                    else finalCallback(currentStageError);
                } else {
                    processStages(stageIndex + 1, collectedResults, stages, errorHandler, finalCallback);
                }
            }
        };

        if (tasks.length === 0) {
            processStages(stageIndex + 1, currentPayload, stages, errorHandler, finalCallback);
            return;
        }

        tasks.forEach((taskFn, index) => {
            try {
                taskFn(currentPayload, (errorInstance, result) => {
                    if (errorSignaled) return;

                    if (errorInstance) {
                        currentStageError = errorInstance;
                        errorSignaled = true;
                        if (errorHandler) errorHandler(errorInstance);
                        else finalCallback(errorInstance);
                        return;
                    }
                    collectedResults[index] = result;
                    checkStageCompletion();
                });
            } catch (e) {
                if (!errorSignaled) {
                    currentStageError = e;
                    errorSignaled = true;
                    if (errorHandler) errorHandler(e);
                    else finalCallback(e);
                }
            }
        });
    }
}

function pauseExecution(signalCallback, errorInstance, contentValue) {
    const randomMs = Math.floor(Math.random() * 100);
    setTimeout(function() {
        signalCallback(errorInstance, contentValue);
    }, randomMs);
}

const testHarness = {
    strictCompare: function(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(`Strict equality failed: Expected ${expected}, got ${actual}. ${message || ''}`);
        }
    },
    deepCompare: function(actual, expected, message) {
        const actualStr = JSON.stringify(actual);
        const expectedStr = JSON.stringify(expected);
        if (actualStr !== expectedStr) {
            throw new Error(`Deep equality failed: Expected ${expectedStr}, got ${actualStr}. ${message || ''}`);
        }
    },
    equality: function(actual, expected, message) {
        if (actual != expected) {
            throw new Error(`Equality failed: Expected ${expected}, got ${actual}. ${message || ''}`);
        }
    },
    finish: function() {
        // Signals completion for asynchronous tests.
    }
};

const testScenarios = {};

testScenarios['sequential_activity_flow'] = {

    'immediate_outcome': function(validator) {
      orchestrator(function (payload, signal) {
        validator.strictCompare(payload, 'foo');
        pauseExecution(signal, null, payload + 'bar');
      }).execute('foo', function (outcome) {
        validator.strictCompare(outcome, 'foobar');
        validator.finish();
      });
    },

    'two_tasks_in_sequence': function (validator) {
      orchestrator(function (payload, signal) {
        validator.deepCompare(payload, []);
        payload.push('first');
        pauseExecution(signal, null, payload);
      }).sequence(function (payload, signal) {
        validator.deepCompare(payload, [ 'first' ]);
        payload.push('second');
        pauseExecution(signal, null, payload);
      }).execute([], function (outcome) {
        validator.deepCompare(outcome, ['first', 'second']);
        validator.finish();
      });
    },

    'three_tasks_in_sequence': function (validator) {
      orchestrator(function (payload, signal) {
        validator.deepCompare(payload, []);
        payload.push('first');
        pauseExecution(signal, null, payload);
      }).sequence(function (payload, signal) {
        validator.deepCompare(payload, [ 'first' ]);
        payload.push('second');
        pauseExecution(signal, null, payload);
      }).sequence(function (payload, signal) {
        validator.deepCompare(payload, [ 'first', 'second' ]);
        payload.push('third');
        pauseExecution(signal, null, payload);
      }).execute([], function (outcome) {
        validator.deepCompare(outcome, ['first', 'second', 'third' ]);
        validator.finish();
      });
    },

    'fault_recovery_sequential': function (validator) {
      const problemMessage = 'FAILURE';
      orchestrator(function (payload, signal) {
        validator.deepCompare(payload, []);
        payload.push('alpha');
        pauseExecution(signal, null, payload);
      }).sequence(function (payload, signal) {
        pauseExecution(signal, new Error(problemMessage));
      }).sequence(function (payload, signal) {
        throw new Error('This_should_not_run_after_error');
      }).onError(function (err) {
        validator.equality(err.message, problemMessage);
        validator.finish();
      }).execute([], function (outcome) {
        throw new Error('Final_callback_not_expected_after_error');
      });
    }

};

testScenarios['concurrent_activity_flow'] = {

    'two_tasks_in_parallel': function (validator) {
      orchestrator(function (payload, signal) {
        validator.strictCompare(payload, 'foo');
        pauseExecution(signal, null, payload + 'bar');
      }).concurrent(function (payload, signal) {
        validator.strictCompare(payload, 'foo');
        pauseExecution(signal, null, payload + 'baz');
      }).execute('foo', function (outcome) {
        validator.deepCompare(outcome, [ 'foobar', 'foobaz' ]);
        validator.finish();
      });
    },

    'three_tasks_in_parallel': function (validator) {
      orchestrator(function (payload, signal) {
        validator.strictCompare(payload, 'foo');
        pauseExecution(signal, null, payload + 'bar');
      }).concurrent(function (payload, signal) {
        validator.strictCompare(payload, 'foo');
        pauseExecution(signal, null, payload + 'baz');
      }).concurrent(function (payload, signal) {
        pauseExecution(signal, null, payload + 'bam');
        validator.strictCompare(payload, 'foo');
      }).execute('foo', function (outcome) {
        validator.deepCompare(outcome, [ 'foobar', 'foobaz', 'foobam' ]);
        validator.finish();
      });
    },

    'fault_recovery_concurrent': function (validator) {
      const problemText = 'ISSUE';
      orchestrator(function (payload, signal) {
        pauseExecution(signal, null, payload + 'bar');
      }).concurrent(function (payload, signal) {
        pauseExecution(signal, new Error(problemText));
      }).concurrent(function (payload, signal) {
        pauseExecution(signal, null, payload + 'bam');
      }).onError(function (err) {
        validator.equality(err.message, problemText);
        validator.finish();
      }).execute('foo', function (outcome) {
        throw new Error('Final_callback_not_expected_after_error');
      });
    }
};

testScenarios['mixed_flow_execution'] = {

    'sequential_parallel_combo': function (validator) {
      orchestrator(function (payload, signal) {
        validator.strictCompare(payload, 'foo');
        pauseExecution(signal, null, payload + 'bar');
      }).concurrent(function (payload, signal) {
        validator.strictCompare(payload, 'foo');
        pauseExecution(signal, null, payload + 'baz');
      }).sequence(function (payload, signal) {
        validator.deepCompare(payload, [ 'foobar', 'foobaz' ]);
        pauseExecution(signal, null, payload.join(' ') + 'a');
      }).concurrent(function (payload, signal) {
        validator.deepCompare(payload, [ 'foobar', 'foobaz' ]);
        pauseExecution(signal, null, payload.join(' ') + 'b');
      }).execute('foo', function (outcome) {
        validator.deepCompare(outcome,[ 'foobar foobaza', 'foobar foobazb']);
        validator.finish();
      });
    },

    'sequence_of_three_steps_with_mixed_parallel_calls': function (validator) {
      orchestrator(function (payload, signal) {
        validator.strictCompare(payload, 'a');
        pauseExecution(signal, null, payload + 'b');
      }).concurrent(function (payload, signal) {
        validator.strictCompare(payload, 'a');
        pauseExecution(signal, null, payload + 'c');
      }).concurrent(function (payload, signal) {
        validator.strictCompare(payload, 'a');
        pauseExecution(signal, null, payload + 'd');
      }).sequence(function (payload, signal) {
        validator.deepCompare(payload, [ 'ab', 'ac', 'ad' ]);
        pauseExecution(signal, null, payload.join(' ') + ' ae');
      }).concurrent(function (payload, signal) {
        validator.deepCompare(payload, [ 'ab', 'ac', 'ad' ]);
        pauseExecution(signal, null, payload.join(' ') + ' af');
      }).sequence(function (payload, signal) {
        validator.deepCompare(payload, [ 'ab ac ad ae', 'ab ac ad af' ]);
        pauseExecution(signal, null, payload.join(' '));
      }).execute('a', function (outcome) {
        validator.strictCompare(outcome, 'ab ac ad ae ab ac ad af');
        validator.finish();
      });
    },

    'mixed_fault_recovery': function (validator) {
      const faultMsg = 'CRITICAL';
      orchestrator(function (payload, signal) {
        validator.strictCompare(payload, 'foo');
        pauseExecution(signal, null, payload + 'bar');
      }).concurrent(function (payload, signal) {
        validator.strictCompare(payload, 'foo');
        pauseExecution(signal, new Error(faultMsg));
      }).sequence(function (payload, signal) {
        throw new Error('This_should_not_execute_after_fault');
      }).concurrent(function (payload, signal) {
        throw new Error('This_should_not_execute_after_fault');
      }).onError(function (err) {
        validator.strictCompare(err.message, faultMsg);
        validator.finish();
      }).execute('foo', function (outcome) {
        throw new Error('Final_callback_not_expected_after_fault');
      });
    }
};

testScenarios['concurrent_fault_handling'] = {

  'multiple_faults': function (validator) {

    let faultCounter = 0;
    const timingInterval = 100;

    orchestrator(function (payload, signal) {
      setTimeout(function () { signal(new Error('E1')); }, timingInterval);
    }).concurrent(function (payload, signal) {
      setTimeout(function () { signal(new Error('E2')); }, timingInterval);
    }).concurrent(function (payload, signal) {
      setTimeout(function () { signal(new Error('E3')); }, timingInterval);
    }).onError(function(err) {
      faultCounter++;
      setTimeout(function () {
        validator.strictCompare(faultCounter, 1);
        validator.finish();
      }, timingInterval * 5);
    }).execute('alpha', function (outcome) {
      throw new Error('Final_callback_not_expected_after_fault');
    });
    
  }

};

for (const category in testScenarios) {
    if (Object.prototype.hasOwnProperty.call(testScenarios, category)) {
        for (const testName in testScenarios[category]) {
            if (Object.prototype.hasOwnProperty.call(testScenarios[category], testName)) {
                try {
                    testScenarios[category][testName](testHarness);
                } catch (e) {
                }
            }
        }
    }
}