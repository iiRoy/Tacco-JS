(function () {
    "use strict";

    let exportMechanism = null;

    if (typeof module === "object" && typeof module.exports === "object") {
        exportMechanism = module.exports;
    } else if (typeof define === "function" && define.amd) {
        define(function() { return createCoreEngine(); });
        return;
    } else if (typeof window !== "undefined") {
        window.FulfillmentEngine = null;
        exportMechanism = window;
    } else if (typeof self !== "undefined") {
        self.FulfillmentEngine = null;
        exportMechanism = self;
    } else {
        this.FulfillmentEngine = null;
        exportMechanism = this;
    }

    if (exportMechanism) {
        exportMechanism.FulfillmentEngine = createCoreEngine();
    }

    function createCoreEngine() {

        const INITIAL_PHASE = 0;
        const SUCCESS_PHASE = 1;
        const FAILURE_PHASE = 2;

        let queueMicrotaskOrFallback;
        if (typeof Promise === 'function' && typeof Promise.resolve === 'function') {
            queueMicrotaskOrFallback = function(task) {
                Promise.resolve().then(task);
            };
        } else {
            queueMicrotaskOrFallback = function(task) {
                setTimeout(task, 0);
            };
        }

        let supportsErrorStack = false;
        try {
            throw new Error();
        } catch (e) {
            supportsErrorStack = !!e.stack;
        }

        function mergeErrorTraces(primaryError, promiseChainHead) {
            if (!supportsErrorStack || !primaryError || !primaryError.stack) {
                return;
            }
            let traceFragments = [];
            for (let currentLink = promiseChainHead; currentLink; currentLink = currentLink._parentLink) {
                if (currentLink._capturedTrace) {
                    traceFragments.unshift(currentLink._capturedTrace);
                }
            }
            traceFragments.unshift(primaryError.stack);
            primaryError.stack = traceFragments.join("\n--- Async context boundary ---\n");
        }

        function OutcomeObject(executionRoutine) {
            if (!(this instanceof OutcomeObject)) {
                return new OutcomeObject(executionRoutine);
            }

            let currentPhase = INITIAL_PHASE;
            let outcomePayload;
            let registeredHandlers = [];

            const transitionState = (phase, payload) => {
                if (currentPhase !== INITIAL_PHASE) return;

                currentPhase = phase;
                outcomePayload = payload;

                queueMicrotaskOrFallback(processRegisteredHandlers);
            };

            const finalizeResolution = (result) => {
                if (result === this) {
                    return transitionState(FAILURE_PHASE, new TypeError("An OutcomeObject cannot resolve with itself."));
                }

                if (result && (typeof result === 'object' || typeof result === 'function') && typeof result.then === 'function') {
                    try {
                        result.then(finalizeResolution, reason => transitionState(FAILURE_PHASE, reason));
                    } catch (err) {
                        transitionState(FAILURE_PHASE, err);
                    }
                } else {
                    transitionState(SUCCESS_PHASE, result);
                }
            };

            const processRegisteredHandlers = () => {
                if (currentPhase === INITIAL_PHASE) return;

                const handlersToExecute = registeredHandlers;
                registeredHandlers = [];

                handlersToExecute.forEach(handlerEntry => {
                    const nextHandle = handlerEntry.nextOutcomeHandle;
                    try {
                        if (currentPhase === SUCCESS_PHASE) {
                            if (handlerEntry.onResolve) {
                                nextHandle.resolve(handlerEntry.onResolve(outcomePayload));
                            } else {
                                nextHandle.resolve(outcomePayload);
                            }
                        } else if (currentPhase === FAILURE_PHASE) {
                            if (handlerEntry.onReject) {
                                nextHandle.resolve(handlerEntry.onReject(outcomePayload));
                            } else {
                                nextHandle.reject(outcomePayload);
                            }
                        }
                    } catch (err) {
                        nextHandle.reject(err);
                    }
                });
            };

            this.then = (onSuccess, onFailure) => {
                const newHandle = createOutcomeHandle();
                const newOutcome = newHandle.resultPromise;

                if (FulfillmentEngine.traceEnabled && supportsErrorStack) {
                    newOutcome._parentLink = this;
                    try {
                        throw new Error();
                    } catch (e) {
                        newOutcome._capturedTrace = e.stack;
                    }
                }

                registeredHandlers.push({
                    onResolve: typeof onSuccess === 'function' ? onSuccess : null,
                    onReject: typeof onFailure === 'function' ? onFailure : null,
                    nextOutcomeHandle: newHandle
                });

                if (currentPhase !== INITIAL_PHASE) {
                    queueMicrotaskOrFallback(processRegisteredHandlers);
                }
                return newOutcome;
            };

            this.catch = (onFailure) => this.then(null, onFailure);

            this.finally = (onFinal) => {
                return this.then(
                    value => {
                        if (onFinal) {
                            return FulfillmentEngine.resolve(onFinal()).then(() => value);
                        }
                        return value;
                    },
                    reason => {
                        if (onFinal) {
                            return FulfillmentEngine.resolve(onFinal()).then(() => { throw reason; });
                        }
                        throw reason;
                    }
                );
            };

            try {
                executionRoutine(finalizeResolution, reason => transitionState(FAILURE_PHASE, reason));
            } catch (err) {
                transitionState(FAILURE_PHASE, err);
            }
        }

        function createOutcomeHandle() {
            let associatedOutcome;
            const resolver = (value) => associatedOutcome._internalFulfiller(value);
            const rejecter = (reason) => associatedOutcome._internalRejector(reason);

            associatedOutcome = new OutcomeObject((res, rej) => {
                associatedOutcome._internalFulfiller = res;
                associatedOutcome._internalRejector = rej;
            });

            return {
                resultPromise: associatedOutcome,
                resolve: resolver,
                reject: rejecter
            };
        }

        OutcomeObject.wrapValue = (input) => {
            if (input instanceof OutcomeObject) {
                return input;
            }
            return new OutcomeObject(res => res(input));
        };

        OutcomeObject.wrapError = (reason) => {
            return new OutcomeObject((res, rej) => rej(reason));
        };

        const FulfillmentEngine = function(initialValue) {
            return OutcomeObject.wrapValue(initialValue);
        };

        FulfillmentEngine.resolve = FulfillmentEngine;
        FulfillmentEngine.defer = createOutcomeHandle;
        FulfillmentEngine.nextTick = queueMicrotaskOrFallback;
        FulfillmentEngine.traceEnabled = false;

        FulfillmentEngine.isOutcome = (testValue) => testValue instanceof OutcomeObject;
        FulfillmentEngine.isThenable = (testValue) => testValue && (typeof testValue === 'object' || typeof testValue === 'function') && typeof testValue.then === 'function';

        FulfillmentEngine.all = (collection) => {
            return new OutcomeObject((masterResolve, masterReject) => {
                if (!Array.isArray(collection)) {
                    return masterReject(new TypeError("Input collection must be an array."));
                }

                const finalResultsArray = [];
                let activePromises = 0;
                let completedPromises = 0;
                const totalItems = collection.length;

                if (totalItems === 0) {
                    return masterResolve([]);
                }

                collection.forEach((item, index) => {
                    activePromises++;
                    FulfillmentEngine.resolve(item).then(
                        value => {
                            finalResultsArray[index] = value;
                            completedPromises++;
                            if (completedPromises === totalItems) {
                                masterResolve(finalResultsArray);
                            }
                        },
                        reason => {
                            masterReject(reason);
                        }
                    );
                });
                if (activePromises === 0) {
                     masterResolve([]);
                }
            });
        };

        FulfillmentEngine.invokeFunction = (fnReference, ...functionArguments) => {
            return new OutcomeObject((res, rej) => {
                try {
                    res(fnReference(...functionArguments));
                } catch (err) {
                    rej(err);
                }
            });
        };

        return FulfillmentEngine;
    }
})();