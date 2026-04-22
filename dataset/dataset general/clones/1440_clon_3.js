// Placeholder for external or shared utility functions.
// In a real scenario, these would be defined elsewhere or imported.
function obtainCallStackInfo( depth ) { /* ... */ return "some_file.js:123"; }
function getElementByIdentifier( identifier ) { return document.getElementById( identifier ); }
function mergeObjects( target, source ) {
    for ( var key in source ) {
        if ( Object.prototype.hasOwnProperty.call( source, key ) ) {
            target[ key ] = source[ key ];
        }
    }
    return target;
}
var eventListeners = {}; // Simple mock for addEvent
function registerEventHandler( element, eventType, handler ) {
    if (element && element.addEventListener) {
        element.addEventListener(eventType, handler);
    } else { // Fallback for older browsers or mock
        if (!eventListeners[eventType]) {
            eventListeners[eventType] = [];
        }
        eventListeners[eventType].push({element: element, handler: handler});
    }
}
function executeCallbacks( eventName, context, data ) { /* ... */ }
function preserveGlobalScope() { /* ... */ }
function verifyGlobalScopeIntegrity() { /* ... */ }
function sanitizeTextForDisplay( textValue ) {
    return String( textValue ).replace( /&/g, "&amp;" ).replace( /</g, "&lt;" ).replace( />/g, "&gt;" ).replace( /"/g, "&quot;" );
}
var executionQueue = [];
var isProcessingQueue = false;
function manageExecutionQueue( taskFunction, defer = false ) {
    if (defer) {
        executionQueue.push(taskFunction);
    } else {
        taskFunction();
    }
    if (!isProcessingQueue) {
        processNextInQueue();
    }
}
function processNextInQueue() {
    isProcessingQueue = true;
    if (executionQueue.length > 0) {
        var nextTask = executionQueue.shift();
        if (typeof window.setTimeout !== "undefined") {
            window.setTimeout(function() {
                nextTask();
                processNextInQueue();
            }, 0);
        } else {
            nextTask();
            processNextInQueue();
        }
    } else {
        isProcessingQueue = false;
    }
}
function filterTestEligibility( unit ) { /* ... */ return true; }


// A JavaScript Test Suite Framework, Reimagined
// Project: TestCraftJS
// Version: 2.0.0-alpha
// License: MIT / GPL dual license.
// Copyright (c) 2023 Acme Corp.

(( globalObject ) => {

    let qvr, // Renamed from QUnit
        frameworkConfig, // Renamed from config
        testSequenceCounter = 0, // Renamed from testId
        sourceFilePath = (obtainCallStackInfo( 0 ) || "" ).replace(/(:\d+)+\)?/, "").replace(/.+\//, ""), // Rewritten and renamed
        objectStringRepresentation = Object.prototype.toString, // Renamed
        hasOwnPropertyCheck = Object.prototype.hasOwnProperty; // Renamed

    // Feature availability checks - rewritten
    const systemCapabilities = {
        canSetTimeout: typeof globalObject.setTimeout === "function",
        canUseSessionStorage: (() => {
            const tempKey = "testcraft-validation-token";
            try {
                globalObject.sessionStorage.setItem( tempKey, tempKey );
                globalObject.sessionStorage.removeItem( tempKey );
                return true;
            } catch( error ) {
                return false;
            }
        })()
    };

    /**
     * Represents a single verifiable unit or test case.
     * @param {Object} unitOptions - Configuration options for this unit.
     */
    function VerificationUnit( unitOptions ) {
        mergeObjects( this, unitOptions ); // Renamed extend to mergeObjects
        this.checkResults = []; // Renamed assertions
        this.runIndex = ++VerificationUnit.totalCount; // Renamed testNumber, Test.count
    }

    VerificationUnit.totalCount = 0; // Renamed Test.count

    VerificationUnit.prototype = {
        /**
         * Initializes the UI representation for this verification unit.
         * Deletes some non-essential statements (e.g., initial `a` declaration).
         */
        initializeDisplay: function() { // Renamed init
            let linkElement, // Renamed a
                titleElement, // Renamed b
                listItemElement, // Renamed li
                testListContainer = getElementByIdentifier( "testcraft-results-list" ); // Renamed tests, id

            // Guard clause added
            if ( !testListContainer ) {
                return;
            }

            titleElement = document.createElement( "strong" );
            titleElement.textContent = this.unitName; // Changed innerHTML to textContent
            titleElement.className = "unit-title"; // Added class

            linkElement = document.createElement( "a" );
            linkElement.textContent = "Re-execute"; // Changed innerHTML, Renamed Rerun
            linkElement.href = qvr.buildTestUrl({ unitSequence: this.runIndex }); // Renamed QUnit.url, testNumber

            listItemElement = document.createElement( "li" );
            listItemElement.appendChild( titleElement );
            listItemElement.appendChild( linkElement );
            listItemElement.classList.add( "current-execution" ); // Changed className to classList.add
            listItemElement.id = this.unitIdentifier = "testcraft-unit-output-" + testSequenceCounter++; // Renamed id, testId

            testListContainer.appendChild( listItemElement );
        },

        /**
         * Sets up the environment for the test run.
         * Rewritten module handling logic.
         */
        prepareEnvironment: function() { // Renamed setup
            frameworkConfig.currentActiveUnit = this; // Renamed config.current

            // Module handling logic rewritten and reordered
            const currentMod = this.moduleName; // Renamed module
            const prevMod = frameworkConfig.lastProcessedModule; // Renamed config.previousModule

            if ( currentMod !== prevMod ) {
                if ( prevMod ) {
                    executeCallbacks( "moduleCompletion", qvr, { // Renamed moduleDone
                        name: prevMod,
                        failures: frameworkConfig.moduleStatistics.badChecks, // Renamed failed
                        successes: frameworkConfig.moduleStatistics.totalChecks - frameworkConfig.moduleStatistics.badChecks, // Renamed passed
                        total: frameworkConfig.moduleStatistics.totalChecks // Renamed total
                    });
                }
                frameworkConfig.lastProcessedModule = currentMod;
                frameworkConfig.moduleStatistics = { totalChecks: 0, badChecks: 0 }; // Renamed all, bad
                executeCallbacks( "moduleInitiation", qvr, { name: currentMod }); // Renamed moduleStart
            } else if ( frameworkConfig.autoRunEnabled ) { // Renamed config.autorun
                executeCallbacks( "moduleInitiation", qvr, { name: currentMod });
            }

            // Test environment setup
            this.executionEnvironment = mergeObjects({ // Renamed testEnvironment, extend
                preTestHook: () => {}, // Renamed setup
                postTestHook: () => {} // Renamed teardown
            }, this.moduleExecutionEnvironment ); // Renamed moduleTestEnvironment

            executeCallbacks( "unitExecutionStart", qvr, { // Renamed testStart
                name: this.unitCaseName, // Renamed testName
                module: this.moduleName // Renamed module
            });

            // Expose the current test environment to utility functions for internal use.
            qvr.activeExecutionEnv = this.executionEnvironment; // Renamed QUnit.current_testEnvironment

            // Pollution checks rewritten
            if ( !frameworkConfig.pollutionControlActive ) { // Renamed config.pollution
                preserveGlobalScope(); // Renamed saveGlobal
            }

            if ( frameworkConfig.noTryCatchMode ) { // Renamed config.notrycatch
                this.executionEnvironment.preTestHook.call( this.executionEnvironment );
                return;
            }

            try {
                this.executionEnvironment.preTestHook.call( this.executionEnvironment );
            } catch( err ) {
                qvr.recordFailure( `Preparation failed for "${this.unitCaseName}": ${err.message}`, obtainCallStackInfo( 1 ) ); // Renamed QUnit.pushFailure, testName, extractStacktrace
            }
        },

        /**
         * Executes the main test logic.
         * Rewritten control flow for async tests.
         */
        performExecution: function() { // Renamed run
            frameworkConfig.currentActiveUnit = this; // Renamed config.current

            const statusDisplay = getElementByIdentifier( "testcraft-current-status" ); // Renamed running, id

            if ( statusDisplay ) {
                statusDisplay.innerHTML = `Executing: <br/> ${this.unitName}`; // Changed content
            }

            // Async handling
            if ( this.isAsynchronous ) { // Renamed async
                qvr.pauseExecution(); // Renamed QUnit.stop
            }

            if ( frameworkConfig.noTryCatchMode ) { // Renamed config.notrycatch
                this.unitCallback.call( this.executionEnvironment, qvr.assertionAPI ); // Renamed callback, QUnit.assert
                return;
            }

            try {
                this.unitCallback.call( this.executionEnvironment, qvr.assertionAPI );
            } catch( err ) {
                qvr.recordFailure( `Execution halted on check #${(this.checkResults.length + 1)} ${this.stackTraceInfo}: ${err.message}`, obtainCallStackInfo( 0 ) ); // Renamed QUnit.pushFailure, assertions.length, stack, extractStacktrace
                // If an error occurs, ensure global state is cleaned up before next test.
                preserveGlobalScope(); // Renamed saveGlobal

                // Restart if blocking mode is active
                if ( frameworkConfig.blockingOperation ) { // Renamed config.blocking
                    qvr.resumeExecution(); // Renamed QUnit.start
                }
            }
        },

        /**
         * Cleans up the environment after test execution.
         */
        cleanEnvironment: function() { // Renamed teardown
            frameworkConfig.currentActiveUnit = this; // Renamed config.current
            if ( frameworkConfig.noTryCatchMode ) {
                this.executionEnvironment.postTestHook.call( this.executionEnvironment ); // Renamed teardown
            } else {
                try {
                    this.executionEnvironment.postTestHook.call( this.executionEnvironment );
                } catch( err ) {
                    qvr.recordFailure( `Cleanup failed for "${this.unitCaseName}": ${err.message}`, obtainCallStackInfo( 1 ) ); // Renamed QUnit.pushFailure, testName, extractStacktrace
                }
            }
            verifyGlobalScopeIntegrity(); // Renamed checkPollution
        },

        /**
         * Finalizes the test run, reports results, and updates UI.
         * Extensive refactoring, new helper variables, changed loop structures.
         */
        concludeRun: function() { // Renamed finish
            frameworkConfig.currentActiveUnit = this; // Renamed config.current

            const expectedCount = this.expectedChecks; // Renamed expected
            const actualCount = this.checkResults.length; // Renamed assertions.length

            if ( expectedCount !== null && expectedCount !== undefined && expectedCount !== actualCount ) { // Added undefined check
                qvr.recordFailure( `Expected ${expectedCount} verifications, but ${actualCount} were performed`, this.stackTraceInfo ); // Renamed QUnit.pushFailure, stack
            } else if ( (expectedCount === null || expectedCount === undefined) && actualCount === 0 ) { // Grouped null/undefined checks
                qvr.recordFailure( "Anticipated at least one verification; none occurred. Invoke 'expectAssertions(0)' to permit zero verifications.", this.stackTraceInfo ); // Renamed QUnit.pushFailure, stack
            }

            let individualResult,
                loopIndex,
                resultListItem,
                orderedListForResults,
                finalSummaryElement, // Renamed b
                passedChecks = 0,
                failedChecks = 0,
                resultsContainer = getElementByIdentifier( "testcraft-results-list" ); // Renamed tests, id

            frameworkConfig.globalStatistics.totalChecks += actualCount; // Renamed config.stats.all
            frameworkConfig.moduleStatistics.totalChecks += actualCount; // Renamed config.moduleStats.all

            if ( resultsContainer ) {
                orderedListForResults = document.createElement( "ol" );
                orderedListForResults.classList.add("unit-checks-list"); // Added class

                for ( loopIndex = 0; loopIndex < actualCount; loopIndex++ ) { // Changed i to loopIndex
                    individualResult = this.checkResults[loopIndex]; // Renamed assertion

                    resultListItem = document.createElement( "li" );
                    resultListItem.classList.add( individualResult.outcome ? "pass-status" : "fail-status" ); // Changed className to classList.add, pass/fail
                    resultListItem.innerHTML = individualResult.message || ( individualResult.outcome ? "OK" : "FAILED" ); // Renamed result, okay, failed
                    orderedListForResults.appendChild( resultListItem );

                    if ( individualResult.outcome ) {
                        passedChecks++;
                    } else {
                        failedChecks++;
                        frameworkConfig.globalStatistics.badChecks++; // Renamed config.stats.bad
                        frameworkConfig.moduleStatistics.badChecks++; // Renamed config.moduleStats.bad
                    }
                }

                // Store result for reordering if supported
                if ( qvr.frameworkSettings.reorderTests && systemCapabilities.canUseSessionStorage ) { // Renamed QUnit.config.reorder, defined.sessionStorage
                    const sessionKey = `testcraft-unit-status-${this.moduleName}-${this.unitCaseName}`; // Renamed key
                    if ( failedChecks > 0 ) {
                        globalObject.sessionStorage.setItem( sessionKey, failedChecks.toString() ); // Changed value to string
                    } else {
                        globalObject.sessionStorage.removeItem( sessionKey );
                    }
                }

                if ( failedChecks === 0 ) {
                    orderedListForResults.style.display = "none";
                }

                finalSummaryElement = document.createElement( "strong" );
                // Helper function added for count formatting
                const formatCounts = (f, p, t) => `<b class='failed-count'>${f}</b>, <b class='passed-count'>${p}</b>, ${t}`;
                finalSummaryElement.innerHTML = `${this.unitName} <span class='result-summary'>( ${formatCounts(failedChecks, passedChecks, actualCount)} )</span>`; // Changed class names, html structure

                // Event listeners rewritten using addEventListener and changed function names
                registerEventHandler(finalSummaryElement, "click", () => {
                    const nextElement = finalSummaryElement.nextElementSibling; // Simplified access to next sibling if structure is predictable
                    if (nextElement && nextElement.style) { // Added null check
                        nextElement.style.display = nextElement.style.display === "none" ? "block" : "none";
                    }
                });

                registerEventHandler(finalSummaryElement, "dblclick", ( eventData ) => { // Renamed e to eventData
                    let eventTarget = eventData && eventData.target ? eventData.target : globalObject.event.srcElement;
                    const targetNodeName = eventTarget.nodeName.toLowerCase();
                    if ( targetNodeName === "span" || targetNodeName === "b" ) {
                        eventTarget = eventTarget.parentNode;
                    }
                    if ( globalObject.location && eventTarget.nodeName.toLowerCase() === "strong" ) {
                        globalObject.location = qvr.buildTestUrl({ unitSequence: this.runIndex }); // Renamed QUnit.url, testNumber
                    }
                });

                const currentListItem = getElementByIdentifier( this.unitIdentifier ); // Renamed li, id
                if (currentListItem) { // Added null check
                    currentListItem.classList.remove("current-execution"); // Removed old class
                    currentListItem.classList.add( failedChecks ? "test-failed" : "test-passed" ); // Changed class names
                    currentListItem.removeChild( currentListItem.firstElementChild ); // Removed first child (old title)
                    const existingLink = currentListItem.firstElementChild; // Re-get the link element
                    currentListItem.appendChild( finalSummaryElement );
                    currentListItem.appendChild( existingLink ); // Re-append link after summary
                    currentListItem.appendChild( orderedListForResults );
                }
            } else { // If no UI container, just count results
                this.checkResults.forEach( (res) => { // Changed for loop to forEach
                    if ( !res.outcome ) {
                        failedChecks++;
                        frameworkConfig.globalStatistics.badChecks++;
                        frameworkConfig.moduleStatistics.badChecks++;
                    }
                });
            }

            executeCallbacks( "unitCompletion", qvr, { // Renamed testDone
                name: this.unitCaseName,
                module: this.moduleName,
                failures: failedChecks,
                successes: actualCount - failedChecks,
                total: actualCount
            });

            qvr.resetState(); // Renamed QUnit.reset
        },

        /**
         * Adds this verification unit to the execution queue.
         * Rewritten queueing logic.
         */
        enqueueForExecution: function() { // Renamed queue
            const currentUnit = this; // Renamed test

            manageExecutionQueue(() => { // Renamed synchronize
                currentUnit.initializeDisplay();
            });

            const sequencedRun = () => {
                manageExecutionQueue(() => { currentUnit.prepareEnvironment(); });
                manageExecutionQueue(() => { currentUnit.performExecution(); });
                manageExecutionQueue(() => { currentUnit.cleanEnvironment(); });
                manageExecutionQueue(() => { currentUnit.concludeRun(); });
            };

            // Check if previous run passed for reordering
            let previousRunFailed = false; // Renamed bad
            if ( qvr.frameworkSettings.reorderTests && systemCapabilities.canUseSessionStorage ) {
                const storedFailures = globalObject.sessionStorage.getItem( `testcraft-unit-status-${this.moduleName}-${this.unitCaseName}` );
                previousRunFailed = (storedFailures !== null && parseInt(storedFailures, 10) > 0);
            }

            if ( previousRunFailed ) {
                sequencedRun(); // Execute immediately if it failed last time
            } else {
                manageExecutionQueue( sequencedRun, true ); // Defer if it passed or no record
            }
        }
    };

    // Root TestRunner object, formerly QUnit.
    qvr = { // Renamed QUnit

        frameworkSettings: { // New configuration object, renamed config
            currentModule: null,
            currentModuleEnvironment: null,
            lastProcessedModule: null,
            moduleStatistics: { totalChecks: 0, badChecks: 0 },
            globalStatistics: { totalChecks: 0, badChecks: 0 },
            currentActiveUnit: null,
            autoRunEnabled: true,
            pollutionControlActive: false,
            noTryCatchMode: false,
            blockingOperation: false,
            semaphoreCount: 0, // Renamed semaphore
            timeoutHandle: null, // Renamed timeout
            testTimeLimit: null, // Renamed testTimeout
            reorderTests: true // Moved from QUnit.config
        },

        // API for defining test modules
        defineModule: function( moduleIdentifier, environmentSetup ) { // Renamed module
            qvr.frameworkSettings.currentModule = moduleIdentifier;
            qvr.frameworkSettings.currentModuleEnvironment = environmentSetup;
        },

        // API for asynchronous test cases
        asyncTestCase: function( caseTitle, expectedAssertions, callbackFn ) { // Renamed asyncTest, testName, expected, callback
            if ( arguments.length === 2 && typeof expectedAssertions === 'function' ) { // Changed check
                callbackFn = expectedAssertions;
                expectedAssertions = null;
            }
            qvr.createTestCase( caseTitle, expectedAssertions, callbackFn, true ); // Renamed QUnit.test
        },

        // API for standard test cases
        createTestCase: function( caseTitle, expectedAssertions, callbackFn, isAsync ) { // Renamed test, testName, expected, callback, async
            let displayTitle = sanitizeTextForDisplay( caseTitle ); // Renamed name, escapeInnerText

            if ( arguments.length === 2 && typeof expectedAssertions === 'function' ) { // Changed check
                callbackFn = expectedAssertions;
                expectedAssertions = null;
            }

            if ( qvr.frameworkSettings.currentModule ) {
                displayTitle = `<span class='module-label'>${sanitizeTextForDisplay( qvr.frameworkSettings.currentModule )}</span>: ${displayTitle}`; // Rewritten structure
            }

            const newVerificationUnit = new VerificationUnit({ // Renamed Test
                unitName: displayTitle, // Renamed name
                unitCaseName: caseTitle, // Renamed testName
                expectedChecks: expectedAssertions, // Renamed expected
                isAsynchronous: isAsync || false, // Renamed async, added default
                unitCallback: callbackFn, // Renamed callback
                moduleName: qvr.frameworkSettings.currentModule, // Renamed module
                moduleExecutionEnvironment: qvr.frameworkSettings.currentModuleEnvironment, // Renamed moduleTestEnvironment
                stackTraceInfo: obtainCallStackInfo( 2 ) // Renamed stack, sourceFromStacktrace
            });

            if ( !filterTestEligibility( newVerificationUnit ) ) { // Renamed validTest
                return;
            }

            newVerificationUnit.enqueueForExecution(); // Renamed test.queue
        },

        // Specify the number of assertions expected for the current test.
        expectAssertions: function( numberOfAssertions ) { // Renamed expect, asserts
            if (qvr.frameworkSettings.currentActiveUnit) { // Added guard
                qvr.frameworkSettings.currentActiveUnit.expectedChecks = numberOfAssertions; // Renamed config.current.expected
            } else {
                console.warn("Attempted to call expectAssertions() outside of a test context.");
            }
        },

        // Resumes test execution.
        resumeExecution: function( decrementCount = 1 ) { // Renamed start, count
            qvr.frameworkSettings.semaphoreCount -= decrementCount; // Renamed config.semaphore
            // Only proceed if all 'pause' calls have been matched by 'resume'
            if ( qvr.frameworkSettings.semaphoreCount > 0 ) {
                return;
            }
            // Reset semaphore if it goes negative (more resumes than pauses)
            if ( qvr.frameworkSettings.semaphoreCount < 0 ) {
                qvr.frameworkSettings.semaphoreCount = 0;
            }

            // A slight delay to allow any pending callbacks to complete
            if ( systemCapabilities.canSetTimeout ) {
                globalObject.setTimeout(() => {
                    if ( qvr.frameworkSettings.semaphoreCount > 0 ) { // Double check
                        return;
                    }
                    if ( qvr.frameworkSettings.timeoutHandle ) {
                        clearTimeout( qvr.frameworkSettings.timeoutHandle );
                        qvr.frameworkSettings.timeoutHandle = null; // Clear handle after use
                    }

                    qvr.frameworkSettings.blockingOperation = false;
                    manageExecutionQueue( true ); // Renamed process(true)
                }, 17); // Changed delay from 13 to 17ms
            } else {
                qvr.frameworkSettings.blockingOperation = false;
                manageExecutionQueue( true );
            }
        },

        // Pauses test execution.
        pauseExecution: function( incrementCount = 1 ) { // Renamed stop, count
            qvr.frameworkSettings.semaphoreCount += incrementCount;
            qvr.frameworkSettings.blockingOperation = true;

            if ( qvr.frameworkSettings.testTimeLimit && systemCapabilities.canSetTimeout ) {
                clearTimeout( qvr.frameworkSettings.timeoutHandle );
                qvr.frameworkSettings.timeoutHandle = globalObject.setTimeout(() => {
                    qvr.assertionAPI.verifyTrue( false, "Test exceeded time limit" ); // Renamed QUnit.ok
                    qvr.frameworkSettings.semaphoreCount = 1; // Force resume
                    qvr.resumeExecution();
                }, qvr.frameworkSettings.testTimeLimit );
            }
        },

        // Internal helper to record assertion results and update UI.
        recordResult: function( outcome, actualValue, expectedValue, messageText ) { // Renamed QUnit.push
            if ( !qvr.frameworkSettings.currentActiveUnit ) {
                console.error( "Assertion made outside of active test context:", messageText );
                return; // Guard clause added
            }

            const details = {
                outcome: Boolean(outcome), // Ensure boolean
                message: messageText,
                actual: actualValue,
                expected: expectedValue
            };

            // Enhanced logging callbacks
            executeCallbacks( "assertionLogged", qvr, details ); // Renamed log

            qvr.frameworkSettings.currentActiveUnit.checkResults.push({
                outcome: details.outcome,
                message: sanitizeTextForDisplay( messageText || (details.outcome ? "Passed" : "Failed") ) // Rewritten message logic
            });
        },

        // Internal helper for deep comparison
        compareDeep: function( val1, val2 ) { // Renamed QUnit.equiv
            // Simplified deep comparison for example, real implementation would be more robust
            try {
                return JSON.stringify(val1) === JSON.stringify(val2);
            } catch (e) {
                // Handle circular references or complex types if needed
                return val1 === val2;
            }
        },

        // Internal helper for type checking
        getType: function( obj ) { // Renamed QUnit.objectType
            if (obj === null) { return "null"; }
            if (obj === undefined) { return "undefined"; }
            const type = objectStringRepresentation.call(obj).slice(8, -1).toLowerCase();
            if (type === "number" && isNaN(obj)) { return "nan"; } // Specific NaN check
            return type;
        },

        // Internal helper to record a failure directly
        recordFailure: function( message, stack ) { // Renamed QUnit.pushFailure
            // This directly pushes a failed assertion without going through the public assertion API
            if ( !qvr.frameworkSettings.currentActiveUnit ) {
                console.error("Failure recorded outside of test context:", message, stack);
                return;
            }

            const failureDetails = {
                outcome: false,
                message: `Failure: ${sanitizeTextForDisplay(message)}`,
                source: stack
            };

            executeCallbacks( "assertionLogged", qvr, failureDetails );
            qvr.frameworkSettings.currentActiveUnit.checkResults.push({
                outcome: false,
                message: failureDetails.message + (stack ? ` (Source: <pre>${sanitizeTextForDisplay(stack)}</pre>)` : '')
            });
        },

        // Internal helper to reset state after a test
        resetState: function() { // Renamed QUnit.reset
            // This is a placeholder, actual reset logic would be here
            // e.g., clearing global mocks, resetting DOM elements, etc.
        },

        // Utility to build test URLs
        buildTestUrl: function( params ) { // Renamed QUnit.url
            let url = globalObject.location.href.split("?")[0];
            const queryParts = [];
            for (const key in params) {
                if (hasOwnPropertyCheck.call(params, key)) {
                    queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
                }
            }
            if (queryParts.length > 0) {
                url += `?${queryParts.join("&")}`;
            }
            return url;
        },

        // Assertion API object - renamed and reorganized
        assertionAPI: { // Renamed QUnit.assert
            /**
             * Verifies a condition is truthy.
             * @param {any} condition - The condition to verify.
             * @param {string} message - Description of the verification.
             */
            verifyTrue: function( condition, message ) { // Renamed ok
                const currentUnit = qvr.frameworkSettings.currentActiveUnit; // Renamed config.current
                if ( !currentUnit ) {
                    throw new Error( `verifyTrue() invoked outside a test, at ${obtainCallStackInfo(2)}` ); // Renamed ok(), sourceFromStacktrace
                }
                const isConditionTrue = Boolean(condition); // Renamed result

                let stackInfo, // Renamed source
                    assertionDetails = {
                        outcome: isConditionTrue, // Renamed result
                        message: message
                    };

                let displayMessage = sanitizeTextForDisplay( message || (isConditionTrue ? "verified" : "failed") ); // Renamed msg, okay, failed
                displayMessage = `<span class='check-message'>${displayMessage}</span>`;

                if ( !isConditionTrue ) {
                    stackInfo = obtainCallStackInfo( 2 ); // Renamed sourceFromStacktrace
                    if ( stackInfo ) {
                        assertionDetails.source = stackInfo;
                        displayMessage += `<table><tr class='check-source'><th>Origin: </th><td><pre>${sanitizeTextForDisplay( stackInfo )}</pre></td></tr></table>`; // Rewritten HTML structure
                    }
                }
                executeCallbacks( "assertionLogged", qvr, assertionDetails ); // Renamed log
                currentUnit.checkResults.push({ // Renamed assertions
                    outcome: isConditionTrue,
                    message: displayMessage
                });
            },

            /**
             * Verifies two values are loosely equal.
             * @param {any} actualVal - The actual value.
             * @param {any} expectedVal - The expected value.
             * @param {string} msg - Message for the assertion.
             */
            checkEquality: function( actualVal, expectedVal, msg ) { // Renamed equal
                qvr.recordResult( expectedVal == actualVal, actualVal, expectedVal, msg );
            },

            checkInequality: function( actualVal, expectedVal, msg ) { // Renamed notEqual
                qvr.recordResult( expectedVal != actualVal, actualVal, expectedVal, msg );
            },

            checkDeepEquality: function( actualVal, expectedVal, msg ) { // Renamed deepEqual
                qvr.recordResult( qvr.compareDeep(actualVal, expectedVal), actualVal, expectedVal, msg );
            },

            checkDeepInequality: function( actualVal, expectedVal, msg ) { // Renamed notDeepEqual
                qvr.recordResult( !qvr.compareDeep(actualVal, expectedVal), actualVal, expectedVal, msg );
            },

            checkStrictEquality: function( actualVal, expectedVal, msg ) { // Renamed strictEqual
                qvr.recordResult( expectedVal === actualVal, actualVal, expectedVal, msg );
            },

            checkStrictInequality: function( actualVal, expectedVal, msg ) { // Renamed notStrictEqual
                qvr.recordResult( expectedVal !== actualVal, actualVal, expectedVal, msg );
            },

            /**
             * Verifies that a function block throws an expected error.
             * @param {Function} codeBlock - The function expected to throw.
             * @param {any} expectedError - The expected error type, regex, or validation function.
             * @param {string} msg - Message for the assertion.
             */
            expectsException: function( codeBlock, expectedError, msg ) { // Renamed raises
                let caughtError,
                    assertionPassed = false; // Renamed ok

                if ( typeof expectedError === "string" ) {
                    msg = expectedError;
                    expectedError = null;
                }

                try {
                    codeBlock.call( qvr.frameworkSettings.currentActiveUnit.executionEnvironment ); // Renamed config.current.testEnvironment
                } catch (exception) { // Renamed e to exception
                    caughtError = exception;
                }

                if ( caughtError ) {
                    if ( !expectedError ) { // No specific error expected, just that it throws
                        assertionPassed = true;
                    } else if ( qvr.getType( expectedError ) === "regexp" ) { // Expected is a regex
                        assertionPassed = expectedError.test( caughtError );
                    } else if ( caughtError instanceof expectedError ) { // Expected is a constructor
                        assertionPassed = true;
                    } else if ( typeof expectedError === 'function' && expectedError.call( {}, caughtError ) === true ) { // Expected is a validation function
                        assertionPassed = true;
                    }
                }

                qvr.recordResult( assertionPassed, caughtError, null, msg );
            }
        }
    };

    // Integrate assertion methods directly into the main API for convenience (backwards compatibility)
    mergeObjects( qvr, qvr.assertionAPI ); // Renamed extend


    // Expose the test runner to the global scope
    globalObject.TestCraft = qvr; // Renamed QUnit to TestCraft

})( typeof window !== "undefined" ? window : this ); // Changed window to globalObject, added 'this' fallback