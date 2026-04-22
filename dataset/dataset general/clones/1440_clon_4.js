/**
 * TestPilot v1.0.0 - A JavaScript Verification Framework
 *
 * This framework provides a distinct approach to unit testing,
 * focusing on asynchronous execution, functional assertion routines,
 * and a clear separation of test definition from execution flow.
 *
 * Copyright (c) 2024 AI Assistant
 * Licensed under the MIT License.
 */

(function(globalRef) {
    // --- Internal State Management (Replaces QUnit's 'config' object) ---
    const globalExecutionContext = {
        currentSegmentName: null,
        currentSegmentEnvironment: {},
        activeProbeUnit: null, // Holds details of the currently running probe for 'anticipate'
        activeProbeUnitEnv: null, // The 'this' context for current probe's setup/teardown/callback
        probeQueue: [], // Queue of pending verification units
        isProcessing: false, // Flag to prevent re-entrant queue processing
        asyncRelease: null, // Promise resolve function for an async probe awaiting 'release'
        asyncRejection: null, // Promise reject function for an async probe
        asyncHoldCount: 0, // Semaphore for managing async probe blocking ('hold'/'release')
        collectedRunReports: [], // Stores structured results of all probes
        eventLog: [] // A generic event log, capturing lifecycle events
    };

    // --- Utility for Deep Equality Comparison (Replaces QUnit.equiv) ---
    function checkDeepEquality(valOne, valTwo) {
        if (valOne === valTwo) return true;

        const typeOne = Object.prototype.toString.call(valOne);
        const typeTwo = Object.prototype.toString.call(valTwo);

        if (typeOne !== typeTwo) return false;

        switch (typeOne) {
            case '[object Number]':
            case '[object String]':
            case '[object Boolean]':
            case '[object Null]':
            case '[object Undefined]':
                return valOne === valTwo;
            case '[object Date]':
                return valOne.getTime() === valTwo.getTime();
            case '[object RegExp]':
                return valOne.source === valTwo.source && valOne.flags === valTwo.flags;
            case '[object Array]':
                if (valOne.length !== valTwo.length) return false;
                for (let i = 0; i < valOne.length; i++) {
                    if (!checkDeepEquality(valOne[i], valTwo[i])) return false;
                }
                return true;
            case '[object Object]':
                const keysOne = Object.keys(valOne);
                const keysTwo = Object.keys(valTwo);
                if (keysOne.length !== keysTwo.length) return false;
                for (const key of keysOne) {
                    if (!keysTwo.includes(key) || !checkDeepEquality(valOne[key], valTwo[key])) return false;
                }
                return true;
            case '[object Function]':
                return valOne === valTwo; // Functions are equivalent if they are the same reference
            default:
                // For other types (e.g., DOM elements), default to strict equality
                return valOne === valTwo;
        }
    }

    // --- Assertion Core Logic (Replaces QUnit.push) ---
    function generateAssertionReport(condition, actualVal, expectedVal, messageTxt, stackInfo = null) {
        return {
            success: !!condition,
            message: messageTxt,
            actual: actualVal,
            expected: expectedVal,
            callStack: stackInfo
        };
    }

    // --- Assertion Routines (Replaces QUnit.assert methods) ---
    const assertionRoutines = {
        // Replaces QUnit.assert.ok
        affirm: (condition, msg) => {
            return generateAssertionReport(condition, condition, true, msg || (condition ? "affirmative" : "negative"));
        },
        // Replaces QUnit.assert.equal
        matchValues: (actual, expected, msg) => {
            return generateAssertionReport(expected == actual, actual, expected, msg);
        },
        // Replaces QUnit.assert.notEqual
        differValues: (actual, expected, msg) => {
            return generateAssertionReport(expected != actual, actual, expected, msg);
        },
        // Replaces QUnit.assert.deepEqual
        matchDeep: (actual, expected, msg) => {
            return generateAssertionReport(checkDeepEquality(actual, expected), actual, expected, msg);
        },
        // Replaces QUnit.assert.notDeepEqual
        differDeep: (actual, expected, msg) => {
            return generateAssertionReport(!checkDeepEquality(actual, expected), actual, expected, msg);
        },
        // Replaces QUnit.assert.strictEqual
        matchStrict: (actual, expected, msg) => {
            return generateAssertionReport(expected === actual, actual, expected, msg);
        },
        // Replaces QUnit.assert.notStrictEqual
        differStrict: (actual, expected, msg) => {
            return generateAssertionReport(expected !== actual, actual, expected, msg);
        },
        // Replaces QUnit.assert.raises
        expectsFailure: (behaviorFunc, errorExpectation, msg) => {
            let caughtException = null;
            let outcome = false;

            if (typeof errorExpectation === "string") {
                msg = errorExpectation;
                errorExpectation = null;
            }

            try {
                // Call the function with the probe's environment as 'this'
                behaviorFunc.call(globalExecutionContext.activeProbeUnitEnv);
            } catch (e) {
                caughtException = e;
            }

            if (caughtException) {
                if (!errorExpectation) {
                    outcome = true; // Any error is considered a pass
                } else if (Object.prototype.toString.call(errorExpectation) === '[object RegExp]') {
                    outcome = errorExpectation.test(caughtException.message || String(caughtException));
                } else if (caughtException instanceof errorExpectation) {
                    outcome = true;
                } else if (typeof errorExpectation === 'function' && errorExpectation.call({}, caughtException) === true) {
                    outcome = true;
                }
            }
            return generateAssertionReport(outcome, caughtException, errorExpectation, msg);
        }
    };

    // --- Stack Trace Utility (Replaces QUnit's sourceFromStacktrace) ---
    function captureCallStack(offset = 0) {
        try {
            throw new Error();
        } catch (e) {
            // Filter out internal framework calls and adjust for the desired offset
            const stackLines = e.stack ? e.stack.split('\n') : ['No stack trace available'];
            const filteredStack = stackLines.slice(2 + offset).filter(line =>
                !line.includes('at captureCallStack') &&
                !line.includes('at Function.performVerificationStep') &&
                !line.includes('at TestPilot.check')
            );
            return filteredStack.join('\n');
        }
    }

    // --- Event Dispatcher (Replaces runLoggingCallbacks) ---
    function dispatchEvent(eventName, payload) {
        globalExecutionContext.eventLog.push({ type: eventName, data: payload, timestamp: Date.now() });
        // In a full implementation, this could trigger actual event handlers.
    }

    // --- Main Test Execution Loop (Replaces Test.prototype.queue and synchronize) ---
    async function processExecutionQueue() {
        if (globalExecutionContext.isProcessing || globalExecutionContext.probeQueue.length === 0) {
            return;
        }
        globalExecutionContext.isProcessing = true;

        dispatchEvent('runStart', {}); // Mimics 'begin'

        let previousSegmentName = null;
        let segmentStats = { totalAssertions: 0, failedAssertions: 0 };

        while (globalExecutionContext.probeQueue.length > 0) {
            const currentProbe = globalExecutionContext.probeQueue.shift();

            // Handle segment transitions (Mimics Test.prototype.setup's module logic)
            if (currentProbe.segment !== previousSegmentName) {
                if (previousSegmentName) {
                    dispatchEvent('segmentDone', { // Mimics 'moduleDone'
                        name: previousSegmentName,
                        failed: segmentStats.failedAssertions,
                        passed: segmentStats.totalAssertions - segmentStats.failedAssertions,
                        total: segmentStats.totalAssertions
                    });
                }
                dispatchEvent('segmentStart', { name: currentProbe.segment }); // Mimics 'moduleStart'
                previousSegmentName = currentProbe.segment;
                segmentStats = { totalAssertions: 0, failedAssertions: 0 }; // Reset stats for new segment
            }

            // Set active context for the current probe
            globalExecutionContext.activeProbeUnit = currentProbe;
            globalExecutionContext.activeProbeUnitEnv = {
                ...globalExecutionContext.currentSegmentEnvironment,
                ...currentProbe.environment
            };

            const probeAssertions = [];
            const assertionApi = {
                affirm: (cond, msg) => probeAssertions.push(assertionRoutines.affirm(cond, msg, captureCallStack(2))),
                matchValues: (a, e, msg) => probeAssertions.push(assertionRoutines.matchValues(a, e, msg, captureCallStack(2))),
                differValues: (a, e, msg) => probeAssertions.push(assertionRoutines.differValues(a, e, msg, captureCallStack(2))),
                matchDeep: (a, e, msg) => probeAssertions.push(assertionRoutines.matchDeep(a, e, msg, captureCallStack(2))),
                differDeep: (a, e, msg) => probeAssertions.push(assertionRoutines.differDeep(a, e, msg, captureCallStack(2))),
                matchStrict: (a, e, msg) => probeAssertions.push(assertionRoutines.matchStrict(a, e, msg, captureCallStack(2))),
                differStrict: (a, e, msg) => probeAssertions.push(assertionRoutines.differStrict(a, e, msg, captureCallStack(2))),
                expectsFailure: (f, err, msg) => probeAssertions.push(assertionRoutines.expectsFailure(f, err, msg, captureCallStack(2))),
                // For internal errors during probe execution
                recordFlaw: (msg, stack) => probeAssertions.push(generateAssertionReport(false, null, null, msg, stack || captureCallStack(1)))
            };

            dispatchEvent('probeStart', { // Mimics 'testStart'
                name: currentProbe.probeName,
                segment: currentProbe.segment
            });

            // Step 1: Setup execution (Mimics Test.prototype.setup)
            try {
                if (currentProbe.environment && typeof currentProbe.environment.setup === 'function') {
                    await Promise.resolve(currentProbe.environment.setup.call(globalExecutionContext.activeProbeUnitEnv));
                }
            } catch (e) {
                assertionApi.recordFlaw(`Setup routine failed: ${e.message}`, captureCallStack(1));
            }

            // Step 2: Probe Callback execution (Mimics Test.prototype.run)
            if (!currentProbe.isAsync) {
                try {
                    await Promise.resolve(currentProbe.callback.call(globalExecutionContext.activeProbeUnitEnv, assertionApi));
                } catch (e) {
                    assertionApi.recordFlaw(`Probe execution encountered an error: ${e.message}`, captureCallStack(1));
                }
            } else {
                // For async probes, wait for 'release'
                globalExecutionContext.asyncHoldCount = 1; // Initial hold for the async probe
                const asyncCompletionPromise = new Promise((resolve, reject) => {
                    globalExecutionContext.asyncRelease = resolve;
                    globalExecutionContext.asyncRejection = reject;
                });
                try {
                    await Promise.resolve(currentProbe.callback.call(globalExecutionContext.activeProbeUnitEnv, assertionApi));
                    await asyncCompletionPromise; // Wait until TestPilot.release() is called
                } catch (e) {
                    assertionApi.recordFlaw(`Async probe execution encountered an error: ${e.message}`, captureCallStack(1));
                    if (globalExecutionContext.asyncRejection) {
                        globalExecutionContext.asyncRejection(e); // Propagate rejection if still pending
                    }
                } finally {
                    globalExecutionContext.asyncRelease = null;
                    globalExecutionContext.asyncRejection = null;
                    globalExecutionContext.asyncHoldCount = 0; // Reset semaphore
                }
            }

            // Step 3: Teardown execution (Mimics Test.prototype.teardown)
            try {
                if (currentProbe.environment && typeof currentProbe.environment.teardown === 'function') {
                    await Promise.resolve(currentProbe.environment.teardown.call(globalExecutionContext.activeProbeUnitEnv));
                }
            } catch (e) {
                assertionApi.recordFlaw(`Teardown routine failed: ${e.message}`, captureCallStack(1));
            }

            // Final check for expected assertions (Mimics Test.prototype.finish's expected assertions logic)
            if (currentProbe.expectedAssertionCount !== null && currentProbe.expectedAssertionCount !== probeAssertions.length) {
                assertionApi.recordFlaw(`Anticipated ${currentProbe.expectedAssertionCount} validations, but ${probeAssertions.length} were performed.`);
            } else if (currentProbe.expectedAssertionCount === null && probeAssertions.length === 0) {
                assertionApi.recordFlaw("Expected at least one validation, but none were performed. Call anticipate(0) to allow zero assertions.");
            }

            const failedAssertions = probeAssertions.filter(a => !a.success).length;
            const passedAssertions = probeAssertions.length - failedAssertions;

            segmentStats.totalAssertions += probeAssertions.length;
            segmentStats.failedAssertions += failedAssertions;

            globalExecutionContext.collectedRunReports.push({
                probeIdentifier: currentProbe.probeName,
                segmentIdentifier: currentProbe.segment,
                totalAssertions: probeAssertions.length,
                failedAssertions: failedAssertions,
                passedAssertions: passedAssertions,
                assertionDetails: probeAssertions
            });

            dispatchEvent('probeDone', { // Mimics 'testDone'
                name: currentProbe.probeName,
                segment: currentProbe.segment,
                failed: failedAssertions,
                passed: passedAssertions,
                total: probeAssertions.length
            });

            globalExecutionContext.activeProbeUnit = null; // Clear active context
            globalExecutionContext.activeProbeUnitEnv = null;
        }

        // Dispatch 'segmentDone' for the last segment if any were run
        if (previousSegmentName) {
            dispatchEvent('segmentDone', {
                name: previousSegmentName,
                failed: segmentStats.failedAssertions,
                passed: segmentStats.totalAssertions - segmentStats.failedAssertions,
                total: segmentStats.totalAssertions
            });
        }

        // Calculate overall run statistics
        const overallTotalAssertions = globalExecutionContext.collectedRunReports.reduce((sum, r) => sum + r.totalAssertions, 0);
        const overallFailedAssertions = globalExecutionContext.collectedRunReports.reduce((sum, r) => sum + r.failedAssertions, 0);
        const overallPassedAssertions = overallTotalAssertions - overallFailedAssertions;
        const overallTotalProbes = globalExecutionContext.collectedRunReports.length;
        const overallFailedProbes = globalExecutionContext.collectedRunReports.filter(r => r.failedAssertions > 0).length;
        const overallPassedProbes = overallTotalProbes - overallFailedProbes;


        dispatchEvent('runDone', { // Mimics 'done'
            totalProbes: overallTotalProbes,
            failedProbes: overallFailedProbes,
            passedProbes: overallPassedProbes,
            totalAssertions: overallTotalAssertions,
            failedAssertions: overallFailedAssertions,
            passedAssertions: overallPassedAssertions
        });

        globalExecutionContext.isProcessing = false;
    }

    // --- Public API Object (Replaces the global 'QUnit' object) ---
    const TestPilot = (function(globalRef) {
        return {
            // Replaces QUnit.module
            defineSegment: (segmentName, segmentEnvironment) => {
                globalExecutionContext.currentSegmentName = segmentName;
                globalExecutionContext.currentSegmentEnvironment = segmentEnvironment || {};
            },

            // Replaces QUnit.test
            defineProbe: (probeName, expectedCount, probeCallback, isAsyncFlag = false) => {
                let finalCallback = probeCallback;
                let finalExpected = expectedCount;

                if (typeof expectedCount === 'function') {
                    finalCallback = expectedCount;
                    finalExpected = null;
                }

                globalExecutionContext.probeQueue.push({
                    probeName: probeName,
                    segment: globalExecutionContext.currentSegmentName,
                    expectedAssertionCount: finalExpected,
                    callback: finalCallback,
                    // Clone environment to prevent unintended modifications between probes
                    environment: { ...globalExecutionContext.currentSegmentEnvironment },
                    isAsync: isAsyncFlag,
                    // Original QUnit captures stack here, skipping for brevity but `captureCallStack` exists.
                });

                // Defer processing to ensure all probes are defined before execution starts
                // and to allow async operations to settle.
                if (!globalExecutionContext.asyncHoldCount && !globalExecutionContext.isProcessing) {
                    setTimeout(processExecutionQueue, 0);
                }
            },

            // Replaces QUnit.asyncTest
            defineAsyncProbe: (probeName, expectedCount, probeCallback) => {
                TestPilot.defineProbe(probeName, expectedCount, probeCallback, true);
            },

            // Replaces QUnit.expect
            anticipate: (count) => {
                if (globalExecutionContext.activeProbeUnit) {
                    globalExecutionContext.activeProbeUnit.expectedAssertionCount = count;
                } else {
                    throw new Error("Anticipate() invoked outside of a probe context.");
                }
            },

            // Replaces QUnit.stop
            hold: (blockCount = 1) => {
                globalExecutionContext.asyncHoldCount += blockCount;
                // Original QUnit also sets a timeout here for async tests.
                // This Type IV clone simplifies by omitting the timeout logic.
            },

            // Replaces QUnit.start
            release: (releaseCount = 1) => {
                globalExecutionContext.asyncHoldCount -= releaseCount;
                if (globalExecutionContext.asyncHoldCount <= 0) {
                    globalExecutionContext.asyncHoldCount = 0; // Prevent negative semaphore
                    if (globalExecutionContext.asyncRelease) {
                        globalExecutionContext.asyncRelease(); // Resolve the promise awaiting async probe completion
                    }
                    // Resume queue processing if it was paused for an async probe
                    if (!globalExecutionContext.isProcessing) {
                        setTimeout(processExecutionQueue, 0);
                    }
                }
            },

            // Replaces QUnit.assert (the object holding assertion methods)
            check: {
                affirm: assertionRoutines.affirm,
                matchValues: assertionRoutines.matchValues,
                differValues: assertionRoutines.differValues,
                matchDeep: assertionRoutines.matchDeep,
                differDeep: assertionRoutines.differDeep,
                matchStrict: assertionRoutines.matchStrict,
                differStrict: assertionRoutines.differStrict,
                expectsFailure: assertionRoutines.expectsFailure
            },

            // New methods to retrieve structured results and event log
            retrieveReports: () => globalExecutionContext.collectedRunReports,
            retrieveEventLog: () => globalExecutionContext.eventLog
            // Note: QUnit.pushFailure and QUnit.reset are internal or not publicly exposed in the same way.
            // QUnit.url is specific to QUnit's HTML runner and not part of core logic.
        };
    })(typeof window !== 'undefined' ? window : global); // Adapt for browser or Node.js environments

    // Make TestPilot globally accessible
    globalRef.TestPilot = TestPilot;

})(typeof window !== 'undefined' ? window : global);