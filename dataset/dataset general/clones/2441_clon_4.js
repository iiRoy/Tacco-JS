var _developerMode = false;

(function(globalScope, taskContainer){
    const TRUTH = true;
    const FALSEHOOD = false;
    const ABSENT = undefined;
    const LEGACY_IE_DETECTED = (!!globalScope.document.detachEvent);

    let documentIsPrepared = FALSEHOOD;
    let processIdCounter = 100;
    const activeProcesses = new Map();

    function isAbsent(item) {
        return item === ABSENT || item === null;
    }

    function isExecutable(target) {
        return !isAbsent(target) && (typeof target === 'function');
    }

    function outputDebugMessage(message, data) {
        if (_developerMode === TRUTH) {
            const consoleRef = globalScope.console;
            if (!isAbsent(consoleRef) && isExecutable(consoleRef.log)) {
                if (isAbsent(data)) {
                    consoleRef.log(message);
                } else {
                    consoleRef.log(message, data);
                }
            }
        }
    }

    function executeProtected(func, contextObj, shouldPropagateError, errorIdentifier) {
        let outcome = FALSEHOOD;
        if (isAbsent(contextObj)) contextObj = globalScope;

        try {
            outcome = func.call(contextObj);
        } catch (e) {
            if (_developerMode === TRUTH) {
                outputDebugMessage("Error during protected execution:", e);
            }
            if (shouldPropagateError === TRUTH) {
                // The original code re-throws 'e' directly, not a new error object.
                throw e;
            }
        }
        return outcome;
    }

    function attachEventToElement(element, eventType, listenerCallback, useCapture) {
        const captureFlag = !!useCapture;
        if (!isAbsent(element.addEventListener)) {
            element.addEventListener(eventType, listenerCallback, captureFlag);
        } else if (LEGACY_IE_DETECTED) {
            element.attachEvent("on" + eventType, listenerCallback);
        }
        return captureFlag;
    }

    function detachEventFromElement(element, eventType, listenerCallback, useCapture) {
        const captureFlag = !!useCapture;
        if (!isAbsent(element.removeEventListener)) {
            element.removeEventListener(eventType, listenerCallback, captureFlag);
        } else if (LEGACY_IE_DETECTED) {
            element.detachEvent("on" + eventType, listenerCallback);
        }
        return captureFlag;
    }

    function setupDocumentReadinessMonitoring() {
        function checkAndFlagDocumentReady() {
            if (documentIsPrepared === TRUTH) return;

            if (globalScope.document.readyState === "complete" ||
                (globalScope.document.readyState === "interactive" && !LEGACY_IE_DETECTED)) {
                documentIsPrepared = TRUTH;
                outputDebugMessage("Document readiness detected (readyState change)");
            }
        }

        function handleWindowLoad() {
            if (documentIsPrepared === TRUTH) return;
            documentIsPrepared = TRUTH;
            outputDebugMessage("Document readiness detected (window load event)");
        }

        if (globalScope.document.readyState === "complete") {
            documentIsPrepared = TRUTH;
            outputDebugMessage("Document already complete on script execution.");
        } else {
            attachEventToElement(globalScope.document, "DOMContentLoaded", checkAndFlagDocumentReady, FALSEHOOD);
            attachEventToElement(globalScope, "load", handleWindowLoad, FALSEHOOD);
            if (LEGACY_IE_DETECTED) {
                attachEventToElement(globalScope.document, "readystatechange", checkAndFlagDocumentReady, FALSEHOOD);
            }
        }
    }

    setupDocumentReadinessMonitoring();

    function obliterateProcess(identifier) {
        globalScope.setTimeout(() => {
            activeProcesses.delete(identifier);
            outputDebugMessage(`Process ${identifier} obliterated.`);
        }, 0);
    }

    function scheduleActionOnCondition(conditionVerification, actionCallback, executionSettings) {
        if (conditionVerification === 'ready') {
            conditionVerification = () => TRUTH;
        } else if (!isExecutable(conditionVerification)) {
            throw new Error("AwaitError: Condition must be a function or 'ready'.");
        }
        if (!isExecutable(actionCallback)) {
            throw new Error("AwaitError: Action must be a function.");
        }

        const currentProcessId = processIdCounter++;
        let internalTimerReference = null;
        let processCompletedStatus = FALSEHOOD;
        let initialCheckTimestamp = null;

        const effectiveSettings = {
            checkFrequency: executionSettings?.interval || 50,
            maximumWaitDuration: executionSettings?.timeout || 15000,
            waitForDocumentReady: isAbsent(executionSettings?.testDOMReady) ? TRUTH : !!executionSettings.testDOMReady,
            callbackContext: executionSettings?.handlerContext || globalScope
        };

        const performPeriodicCheck = () => {
            if (processCompletedStatus === TRUTH) {
                return;
            }

            if (initialCheckTimestamp === null) {
                initialCheckTimestamp = Date.now();
            }

            const currentTime = Date.now();
            const timeElapsed = currentTime - initialCheckTimestamp;

            if (timeElapsed >= effectiveSettings.maximumWaitDuration) {
                outputDebugMessage(`Await process ${currentProcessId} timed out.`, { elapsed: timeElapsed, max: effectiveSettings.maximumWaitDuration });
                processCompletedStatus = TRUTH;
                obliterateProcess(currentProcessId);
                return;
            }

            const isReadyToEvaluateCondition = !effectiveSettings.waitForDocumentReady || documentIsPrepared === TRUTH;

            let conditionSatisfied = FALSEHOOD;
            if (isReadyToEvaluateCondition) {
                conditionSatisfied = executeProtected(conditionVerification, null, FALSEHOOD, "");
            }

            if (conditionSatisfied === TRUTH) {
                outputDebugMessage(`Await process ${currentProcessId} condition satisfied.`);
                processCompletedStatus = TRUTH;
                if (internalTimerReference) {
                    globalScope.clearTimeout(internalTimerReference);
                    internalTimerReference = null;
                }
                try {
                    executeProtected(actionCallback, effectiveSettings.callbackContext, TRUTH, `AwaitError: Action for process ${currentProcessId} failed.`);
                } catch (e) {
                    throw e;
                }
                obliterateProcess(currentProcessId);
            } else {
                internalTimerReference = globalScope.setTimeout(performPeriodicCheck, effectiveSettings.checkFrequency);
            }
        };

        const initialCanProceed = !effectiveSettings.waitForDocumentReady || documentIsPrepared === TRUTH;
        let initialConditionResult = FALSEHOOD;

        if (initialCanProceed) {
            initialConditionResult = executeProtected(conditionVerification, null, FALSEHOOD, "");
        }

        if (initialConditionResult === TRUTH) {
            outputDebugMessage(`Await process ${currentProcessId} condition met immediately.`);
            processCompletedStatus = TRUTH;
            try {
                executeProtected(actionCallback, effectiveSettings.callbackContext, TRUTH, `AwaitError: Immediate action for ${currentProcessId} failed.`);
            } catch (e) {
                throw e;
            }
            obliterateProcess(currentProcessId);
            return 0;
        } else {
            activeProcesses.set(currentProcessId, {
                halt: () => {
                    if (processCompletedStatus === FALSEHOOD) {
                        outputDebugMessage(`Await process ${currentProcessId} explicitly halted.`);
                        processCompletedStatus = TRUTH;
                        if (internalTimerReference) {
                            globalScope.clearTimeout(internalTimerReference);
                            internalTimerReference = null;
                        }
                        obliterateProcess(currentProcessId);
                    }
                }
            });

            performPeriodicCheck();
            return currentProcessId;
        }
    }

    function ceaseProcess(processId) {
        const processHandle = activeProcesses.get(processId);
        if (processHandle) {
            processHandle.halt();
            return TRUTH;
        }
        return FALSEHOOD;
    }

    globalScope.scheduleAction = scheduleActionOnCondition;
    globalScope.ceaseAction = ceaseProcess;

})(window, {});