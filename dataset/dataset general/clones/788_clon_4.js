(function (codeGenerator) {
    "use strict";

    var moduleKey = "promise";

    var environmentDispatch = [
        {
            test: function() { return typeof bootstrap === "function"; },
            execute: function() { bootstrap(moduleKey, codeGenerator); }
        },
        {
            test: function() { return typeof exports === "object" && typeof module === "object"; },
            execute: function() { module.exports = codeGenerator(); }
        },
        {
            test: function() { return typeof define === "function" && define.amd; },
            execute: function() { define(codeGenerator); }
        },
        {
            test: function() { return typeof ses !== "undefined"; },
            execute: function() {
                if (!ses.ok()) {
                    return;
                } else {
                    ses.makeAsyncTool = codeGenerator;
                }
            }
        },
        {
            test: function() { return typeof self !== "undefined"; },
            execute: function() { self.AsyncTool = codeGenerator(); }
        }
    ];

    var handledEnvironment = environmentDispatch.some(function(handler) {
        if (handler.test()) {
            handler.execute();
            return true;
        }
        return false;
    });

    if (!handledEnvironment) {
        throw new Error("Target environment not recognized by AsyncTool. Please report this configuration.");
    }

})(function () {
    "use strict";

    var traceSupport = false;
    try {
        throw new Error();
    } catch (errorObj) {
        traceSupport = !!errorObj.stack;
    }

    function interpretStackLine(stackLineText) {
        var regex1 = /at\s+.+\s\((.+):(\d+):(?:\d+)\)$/.exec(stackLineText);
        if (regex1) {
            return [regex1[1], Number(regex1[2])];
        }

        var regex2 = /at\s+([^ ]+):(\d+):(?:\d+)$/.exec(stackLineText);
        if (regex2) {
            return [regex2[1], Number(regex2[2])];
        }

        var regex3 = /.*@(.+):(\d+)$/.exec(stackLineText);
        if (regex3) {
            return [regex3[1], Number(regex3[2])];
        }
    }

    function getCallerOrigin() {
        if (!traceSupport) {
            return [null, null];
        }
        try {
            throw new Error();
        } catch (errorObj) {
            var traceLines = errorObj.stack.split("\n");
            var targetLine = traceLines[0].indexOf("@") > 0 ? traceLines[1] : traceLines[2];
            if (targetLine && targetLine.indexOf("getCallerOrigin") !== -1) {
                targetLine = traceLines[0].indexOf("@") > 0 ? traceLines[2] : traceLines[3];
            }
            return interpretStackLine(targetLine);
        }
    }

    var initialModuleLocation = getCallerOrigin();
    var moduleFileId = initialModuleLocation[0];
    var moduleStartLine = initialModuleLocation[1];

    var emptyFunction = function () {};

    var asynchronousScheduler = (function () {
        var queuedOperations = [];
        var operationInProgress = false;
        var scheduleOperation;
        var isNodeRuntime = false;

        function processQueue() {
            while (queuedOperations.length > 0) {
                var currentOp = queuedOperations.shift();
                var opFunction = currentOp.func;
                var opDomain = currentOp.domain;

                if (opDomain) {
                    opDomain.enter();
                }

                try {
                    opFunction();
                } catch (err) {
                    if (isNodeRuntime) {
                        if (opDomain) {
                            opDomain.exit();
                        }
                        setTimeout(processQueue, 0);
                        if (opDomain) {
                            opDomain.enter();
                        }
                        throw err;
                    } else {
                        setTimeout(function() {
                           throw err;
                        }, 0);
                    }
                }

                if (opDomain) {
                    opDomain.exit();
                }
            }
            operationInProgress = false;
        }

        var queueTask = function (taskFunc) {
            queuedOperations.push({
                func: taskFunc,
                domain: isNodeRuntime && typeof process !== "undefined" && process.domain ? process.domain : undefined
            });

            if (!operationInProgress) {
                operationInProgress = true;
                scheduleOperation();
            }
        };

        if (typeof process !== "undefined" && process.nextTick) {
            isNodeRuntime = true;
            scheduleOperation = function () {
                process.nextTick(processQueue);
            };
        } else if (typeof setImmediate === "function") {
            if (typeof window !== "undefined") {
                scheduleOperation = setImmediate.bind(window, processQueue);
            } else {
                scheduleOperation = function () {
                    setImmediate(processQueue);
                };
            }
        } else if (typeof MessageChannel !== "undefined") {
            var msgChannel = new MessageChannel();
            msgChannel.port1.onmessage = function () {
                scheduleOperation = portScheduleMsg;
                msgChannel.port1.onmessage = processQueue;
                processQueue();
            };
            var portScheduleMsg = function () {
                msgChannel.port2.postMessage(0);
            };
            scheduleOperation = function () {
                setTimeout(processQueue, 0);
                portScheduleMsg();
            };
        } else {
            scheduleOperation = function () {
                setTimeout(processQueue, 0);
            };
        }

        return queueTask;
    })();

    var universalCall = Function.call;
    function unbindMethod(targetFunction) {
        return function () {
            return universalCall.apply(targetFunction, arguments);
        };
    }

    var arraySliceMethod = unbindMethod(Array.prototype.slice);

    var arrayReduceMethod = unbindMethod(
        Array.prototype.reduce || function (accumulatorFunc, initialValue) {
            var loopIndex = 0,
                currentLength = this.length;
            if (arguments.length === 1) {
                do {
                    if (loopIndex in this) {
                        initialValue = this[loopIndex++];
                        break;
                    }
                    if (++loopIndex >= currentLength) {
                        throw new TypeError();
                    }
                } while (1);
            }
            for (; loopIndex < currentLength; loopIndex++) {
                if (loopIndex in this) {
                    initialValue = accumulatorFunc(initialValue, this[loopIndex], loopIndex);
                }
            }
            return initialValue;
        }
    );

    var arrayFindIndexMethod = unbindMethod(
        Array.prototype.indexOf || function (searchElement) {
            for (var k = 0; k < this.length; k++) {
                if (this[k] === searchElement) {
                    return k;
                }
            }
            return -1;
        }
    );

    var arrayMapMethod = unbindMethod(
        Array.prototype.map || function (transformFn, contextObj) {
            var sourceCollection = this;
            var newCollection = [];
            arrayReduceMethod(sourceCollection, function (ignore, itemValue, itemIndex) {
                newCollection.push(transformFn.call(contextObj, itemValue, itemIndex, sourceCollection));
            }, void 0);
            return newCollection;
        }
    );

    var objectCreationMethod = Object.create || function (prototypeObject) {
        function TransientConstructor() { }
        TransientConstructor.prototype = prototypeObject;
        return new TransientConstructor();
    };

    var objectHasProperty = unbindMethod(Object.prototype.hasOwnProperty);

    var objectKeyDiscovery = Object.keys || function (targetObject) {
        var discoveredKeys = [];
        for (var prop in targetObject) {
            if (objectHasProperty(targetObject, prop)) {
                discoveredKeys.push(prop);
            }
        }
        return discoveredKeys;
    };

    var objectTypeSignature = unbindMethod(Object.prototype.toString);

    function isAnObject(testValue) {
        return testValue === Object(testValue);
    }

    var GeneratorBreakWrapper;
    if (typeof ReturnValue !== "undefined") {
        GeneratorBreakWrapper = ReturnValue;
    } else {
        GeneratorBreakWrapper = function (resultValue) {
            this.value = resultValue;
        };
    }

    function isGeneratorStopSignal(exceptionInstance) {
        return (
            objectTypeSignature(exceptionInstance) === "[object StopIteration]" ||
            exceptionInstance instanceof GeneratorBreakWrapper
        );
    }

    var TRACE_BREAK_INDICATOR = "From prior execution layer:";

    function augmentErrorTrace(originalError, asyncPromise) {
        if (traceSupport &&
            asyncPromise.capturedTrace &&
            typeof originalError === "object" &&
            originalError !== null &&
            originalError.stack &&
            originalError.stack.indexOf(TRACE_BREAK_INDICATOR) === -1
        ) {
            var traceSegments = [];
            for (var prm = asyncPromise; !!prm; prm = prm.source) {
                if (prm.capturedTrace) {
                    traceSegments.unshift(prm.capturedTrace);
                }
            }
            traceSegments.unshift(originalError.stack);

            var combinedTrace = traceSegments.join("\n" + TRACE_BREAK_INDICATOR + "\n");
            originalError.stack = filterModuleTraces(combinedTrace);
        }
    }

    function filterModuleTraces(rawTraceString) {
        var traceRows = rawTraceString.split("\n");
        var filteredRows = [];
        for (var i = 0; i < traceRows.length; ++i) {
            var row = traceRows[i];

            if (!isInternalModuleFrame(row) && !isSystemRuntimeFrame(row) && row) {
                filteredRows.push(row);
            }
        }
        return filteredRows.join("\n");
    }

    function isSystemRuntimeFrame(stackRow) {
        return stackRow.indexOf("(module.js:") !== -1 ||
               stackRow.indexOf("(node.js:") !== -1;
    }

    var moduleEndLine;

    function isInternalModuleFrame(stackLineEntry) {
        var fileAndLineData = interpretStackLine(stackLineEntry);

        if (!fileAndLineData) {
            return false;
        }

        var currentFile = fileAndLineData[0];
        var currentLine = fileAndLineData[1];

        return currentFile === moduleFileId &&
            currentLine >= moduleStartLine &&
            currentLine <= moduleEndLine;
    }

    function warnDeprecated(legacyFunc, oldName, recommendedName) {
        return function () {
            if (typeof console !== "undefined" &&
                typeof console.warn === "function") {
                console.warn(oldName + " is deprecated, use " + recommendedName +
                             " instead.", new Error("").stack);
            }
            return legacyFunc.apply(legacyFunc, arguments);
        };
    }

    function AsyncTool(inputVal) {
        if (inputVal instanceof InternalPromise) {
            return inputVal;
        }

        if (isAnObject(inputVal) && typeof inputVal.then === "function") {
            return adaptExternalThenable(inputVal);
        } else {
            return createFulfilledPromise(inputVal);
        }
    }
    AsyncTool.resolve = AsyncTool;

    AsyncTool.queueMicrotask = asynchronousScheduler;

    AsyncTool.enableLongTraces = false;

    if (typeof process === "object" && process && process.env && process.env.ASYNCTOOL_DEBUG) {
        AsyncTool.enableLongTraces = true;
    }

    AsyncTool.createDeferredContainer = createDeferredContainer;

    function createDeferredContainer() {
        var promiseResolver;
        var promiseRejector;

        var managedPromise = new InternalPromise(function(rs, rj) {
            promiseResolver = rs;
            promiseRejector = rj;
        });

        function deferredGeneralResolution(valueToResolve) {
            if (valueToResolve instanceof InternalPromise) {
                valueToResolve.then(promiseResolver, promiseRejector);
            } else if (isAnObject(valueToResolve) && typeof valueToResolve.then === "function") {
                adaptExternalThenable(valueToResolve).then(promiseResolver, promiseRejector);
            } else {
                promiseResolver(valueToResolve);
            }
        }

        function deferredErrorRejection(reasonForRejection) {
            promiseRejector(reasonForRejection);
        }

        return {
            promiseElement: managedPromise,
            resolverFunction: deferredGeneralResolution,
            rejectorFunction: deferredErrorRejection
        };
    }

    function InternalPromise(executor) {
        var promiseStatus = "pending";
        var promiseValue;
        var promiseHandlers = [];

        function notifySubscribers() {
            asynchronousScheduler(function() {
                promiseHandlers.forEach(function(handler) {
                    if (promiseStatus === "fulfilled" && handler.onFulfilled) {
                        handler.onFulfilled(promiseValue);
                    } else if (promiseStatus === "rejected" && handler.onRejected) {
                        handler.onRejected(promiseValue);
                    }
                });
                promiseHandlers = [];
            });
        }

        function fulfillPromise(val) {
            if (promiseStatus === "pending") {
                promiseStatus = "fulfilled";
                promiseValue = val;
                notifySubscribers();
            }
        }

        function rejectPromise(reason) {
            if (promiseStatus === "pending") {
                promiseStatus = "rejected";
                promiseValue = reason;
                notifySubscribers();
            }
        }

        this.then = function(onSuccess, onFailure) {
            return new InternalPromise(function(nextResolve, nextReject) {
                promiseHandlers.push({
                    onFulfilled: function(v) {
                        try {
                            var res = onSuccess ? onSuccess(v) : v;
                            nextResolve(res);
                        } catch (e) {
                            nextReject(e);
                        }
                    },
                    onRejected: function(r) {
                        try {
                            var res = onFailure ? onFailure(r) : r;
                            nextReject(res);
                        } catch (e) {
                            nextReject(e);
                        }
                    }
                });
                if (promiseStatus !== "pending") {
                    notifySubscribers();
                }
            });
        };

        if (AsyncTool.enableLongTraces) {
            try {
                throw new Error();
            } catch (e) {
                this.capturedTrace = e.stack;
            }
        }

        try {
            executor(fulfillPromise, rejectPromise);
        } catch (e) {
            rejectPromise(e);
        }
    }

    function adaptExternalThenable(externalThenable) {
        return new InternalPromise(function(rs, rj) {
            try {
                externalThenable.then(rs, rj);
            } catch (e) {
                rj(e);
            }
        });
    }

    function createFulfilledPromise(valueContent) {
        return new InternalPromise(function(rs, rj) {
            rs(valueContent);
        });
    }

    var finalModuleLocation = getCallerOrigin();
    moduleEndLine = finalModuleLocation[1];

    return AsyncTool;
});