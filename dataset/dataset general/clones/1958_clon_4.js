(function(global, $) {
    // A completely distinct framework for managing data flow and user interface interactions.
    global.SignalWorks = {};

    // Utility to check if a string contains non-whitespace characters.
    const hasContent = function(textInput) {
        return typeof textInput === 'string' && textInput.trim().length > 0;
    };

    // Browser detection for specific behavior, avoiding previous identifiers.
    const browserIsChr = (function() {
        return navigator.userAgent.toLowerCase().includes("chrome");
    })();

    // --- Core Data Flow Abstractions (replacing Bacon.js concepts) ---

    // Represents a value that changes over time, analogous to Bacon.Property.
    class ValueMonitor {
        constructor(initialDatum) {
            let currentDatum = initialDatum;
            const observers = new Set();
            let lastEmittedDatum = Symbol('initial'); // Unique sentinel for distinct comparison

            this.retrieveCurrent = () => currentDatum;

            this.updateWith = (newDatum) => {
                if (newDatum === currentDatum) return; // Only update if value changes
                currentDatum = newDatum;
                observers.forEach(fn => fn(currentDatum));
            };

            this.onValueChange = (callback) => {
                observers.add(callback);
                callback(currentDatum); // Immediately notify with current value
                return () => observers.delete(callback); // Returns an unsubscription function
            };

            this.mapValues = (transformationFn) => {
                const mappedMonitor = new ValueMonitor(transformationFn(this.retrieveCurrent()));
                this.onValueChange(val => mappedMonitor.updateWith(transformationFn(val)));
                return mappedMonitor;
            };

            this.filterValues = (predicateFn) => {
                const filteredMonitor = new ValueMonitor(this.retrieveCurrent()); // Keep initial value, might not satisfy predicate
                this.onValueChange(val => {
                    if (predicateFn(val)) {
                        filteredMonitor.updateWith(val);
                    }
                });
                return filteredMonitor;
            };

            this.ensureDistinct = () => {
                const distinctMonitor = new ValueMonitor(this.retrieveCurrent());
                this.onValueChange(val => {
                    if (val !== lastEmittedDatum) {
                        distinctMonitor.updateWith(val);
                        lastEmittedDatum = val;
                    }
                });
                return distinctMonitor;
            };

            // Combines values from two monitors.
            this.combineLatestWith = (otherMonitor, combinationFn) => {
                const combined = new ValueMonitor(combinationFn(this.retrieveCurrent(), otherMonitor.retrieveCurrent()));
                const triggerCombination = () => combined.updateWith(combinationFn(this.retrieveCurrent(), otherMonitor.retrieveCurrent()));
                this.onValueChange(triggerCombination);
                otherMonitor.onValueChange(triggerCombination);
                return combined;
            };
        }
    }

    // Represents a sequence of events, analogous to Bacon.EventStream.
    class EventFlow {
        constructor() {
            const registeredHandlers = new Set();

            this.dispatch = (payload) => {
                registeredHandlers.forEach(fn => fn(payload));
            };

            this.registerHandler = (callback) => {
                registeredHandlers.add(callback);
                return () => registeredHandlers.delete(callback); // Unsubscription
            };

            this.mapFlow = (mapper) => {
                const newFlow = new EventFlow();
                this.registerHandler(e => newFlow.dispatch(mapper(e)));
                return newFlow;
            };

            this.filterFlow = (predicate) => {
                const newFlow = new EventFlow();
                this.registerHandler(e => {
                    if (predicate(e)) {
                        newFlow.dispatch(e);
                    }
                });
                return newFlow;
            };

            this.delayFlow = (durationMs) => {
                const newFlow = new EventFlow();
                this.registerHandler(e => setTimeout(() => newFlow.dispatch(e), durationMs));
                return newFlow;
            };

            this.limitEvents = (count) => {
                const newFlow = new EventFlow();
                let dispatchedCount = 0;
                const unsubscribe = this.registerHandler(e => {
                    if (dispatchedCount < count) {
                        newFlow.dispatch(e);
                        dispatchedCount++;
                    } else {
                        unsubscribe(); // Stop listening after `count` events
                    }
                });
                return newFlow;
            };

            this.toValueMonitor = (initialVal) => {
                const monitor = new ValueMonitor(initialVal);
                this.registerHandler(val => monitor.updateWith(val));
                return monitor;
            };

            this.mergeFlows = (otherFlow) => {
                const mergedFlow = new EventFlow();
                this.registerHandler(e => mergedFlow.dispatch(e));
                otherFlow.registerHandler(e => mergedFlow.dispatch(e));
                return mergedFlow;
            };

            this.chainLatestFlows = (flowCreatorFn) => { // Analogous to flatMapLatest
                const resultFlow = new EventFlow();
                let currentInnerUnsubscribe = null;

                this.registerHandler(mainEvent => {
                    if (currentInnerUnsubscribe) {
                        currentInnerUnsubscribe(); // Cancel previous inner flow
                        currentInnerUnsubscribe = null; // Reset
                    }
                    const innerSource = flowCreatorFn(mainEvent);
                    if (innerSource instanceof EventFlow) {
                        currentInnerUnsubscribe = innerSource.registerHandler(innerEvent => resultFlow.dispatch(innerEvent));
                    } else if (innerSource instanceof Promise) {
                        // Promises resolve once, no explicit unsubscribe needed for cancellation,
                        // but we can mark it as 'active' to prevent previous promises from dispatching.
                        let promiseActive = true;
                        currentInnerUnsubscribe = () => { promiseActive = false; };
                        innerSource.then(res => {
                            if (promiseActive) resultFlow.dispatch(res);
                        }).catch(err => {
                            if (promiseActive) resultFlow.dispatch(err);
                        });
                    }
                });
                return resultFlow;
            };
        }
    }

    // Creates an EventFlow from DOM events.
    const createDomEventFlow = (domElement, eventNames, selector = undefined) => {
        const flow = new EventFlow();
        const eventArray = Array.isArray(eventNames) ? eventNames : eventNames.split(' ');
        eventArray.forEach(eventName => {
            $(domElement).on(eventName, selector, (e) => flow.dispatch(e));
        });
        return flow;
    };

    // Creates a continuous EventFlow from an interval.
    const createIntervalFlow = (intervalMs) => {
        const flow = new EventFlow();
        let intervalHandle = null;
        // The interval should only be active when there are subscribers.
        // For simplicity, we'll auto-start, or use a manual start/stop.
        // For this Type IV, let's make it start when first subscribed to,
        // and stop when all subscribers are gone (more complex EventFlow needed).
        // For now, it will start on creation for consistency with Bacon.interval.
        intervalHandle = setInterval(() => flow.dispatch(Date.now()), intervalMs);
        // Add a way to stop it globally if needed for tests, or for `take(n)` to clean up.
        flow.stop = () => { if(intervalHandle) { clearInterval(intervalHandle); intervalHandle = null; } };
        return flow;
    };

    // Creates an EventFlow that never emits.
    const createDormantFlow = () => new EventFlow();

    // Creates an EventFlow from a Promise.
    const createPromiseFlow = (promiseInstance) => {
        const flow = new EventFlow();
        promiseInstance.then(result => flow.dispatch(result)).catch(error => flow.dispatch(error));
        return flow;
    };

    // Attach to global SignalWorks object.
    global.SignalWorks.ValueMonitor = ValueMonitor;
    global.SignalWorks.EventFlow = EventFlow;
    global.SignalWorks.createDomEventFlow = createDomEventFlow;
    global.SignalWorks.createIntervalFlow = createIntervalFlow;
    global.SignalWorks.createDormantFlow = createDormantFlow;
    global.SignalWorks.createPromiseFlow = createPromiseFlow;
    global.SignalWorks.hasContent = hasContent;
    global.SignalWorks.browserIsChr = browserIsChr;

    // --- UserInterfaceTools (formerly Bacon.UI) ---
    global.UserInterfaceTools = {};

    global.UserInterfaceTools.inputFieldState = function(inputElement, initialSetting) {
        const currentValRetriever = () => inputElement.val();

        if (initialSetting !== null) {
            inputElement.val(initialSetting);
        }

        const autofillTrigger = function() {
            if (inputElement.attr("type") === "password") {
                return SignalWorks.createIntervalFlow(100);
            } else if (SignalWorks.browserIsChr) {
                const chromeAutofillPoll = new EventFlow();
                let pollIntervalIdentifier = null;
                let pollAttemptCount = 0;

                // When someone subscribes to chromeAutofillPoll, start polling.
                // This is a simplified subscription model.
                const unsubscribeInternal = chromeAutofillPoll.registerHandler(() => { /* do nothing, just activate */ });
                pollIntervalIdentifier = setInterval(() => {
                    const currentVal = currentValRetriever();
                    if (SignalWorks.hasContent(currentVal)) {
                        chromeAutofillPoll.dispatch(currentVal);
                        clearInterval(pollIntervalIdentifier);
                        pollIntervalIdentifier = null;
                        unsubscribeInternal(); // Deactivate internal listener
                    }
                    pollAttemptCount++;
                    if (pollAttemptCount >= 20) {
                        clearInterval(pollIntervalIdentifier);
                        pollIntervalIdentifier = null;
                        unsubscribeInternal(); // Deactivate internal listener
                    }
                }, 100);
                // Return a flow that only takes the first emitted value.
                return chromeAutofillPoll.limitEvents(1);
            } else {
                return SignalWorks.createDormantFlow();
            }
        };

        const keyAndInputFlow = SignalWorks.createDomEventFlow(inputElement, "keyup input");
        const cutAndPasteFlow = SignalWorks.createDomEventFlow(inputElement, "cut paste").delayFlow(1);
        const autofillDetectionFlow = autofillTrigger();

        const combinedInputFlow = keyAndInputFlow
            .mergeFlows(cutAndPasteFlow)
            .mergeFlows(autofillDetectionFlow)
            .mapFlow(currentValRetriever);

        return combinedInputFlow.toValueMonitor(currentValRetriever()).ensureDistinct();
    };

    global.UserInterfaceTools.selectionStatus = function(dropdownElement, initialSelection) {
        const currentValRetriever = () => dropdownElement.val();
        if (initialSelection != null) {
            dropdownElement.val(initialSelection);
        }
        const changeFlow = SignalWorks.createDomEventFlow(dropdownElement, "change");
        return changeFlow.mapFlow(currentValRetriever).toValueMonitor(currentValRetriever());
    };

    global.UserInterfaceTools.multiToggleStatus = function(checkboxGroup, initialValues) {
        const getSelectedValues = () => {
            return checkboxGroup.filter(":checked").map(function(i, elem) {
                return $(elem).val();
            }).toArray();
        };

        if (initialValues) {
            checkboxGroup.each(function(i, elem) {
                $(elem).prop("checked", initialValues.includes($(elem).val()));
            });
        }

        const clickFlow = SignalWorks.createDomEventFlow(checkboxGroup, "click");
        return clickFlow.mapFlow(getSelectedValues).toValueMonitor(getSelectedValues());
    };

    // AJAX utilities
    const remoteOperation = function(requestConfig) {
        const promise = $.ajax(requestConfig);
        return SignalWorks.createPromiseFlow(promise);
    };
    global.UserInterfaceTools.remoteDataFetch = remoteOperation;

    global.UserInterfaceTools.retrieveGet = function(address, dataPayload, dataFormat) {
        return global.UserInterfaceTools.remoteDataFetch({
            url: address,
            dataType: dataFormat,
            data: dataPayload
        });
    };

    global.UserInterfaceTools.retrieveJsonGet = function(address, dataPayload) {
        return global.UserInterfaceTools.remoteDataFetch({
            url: address,
            dataType: "json",
            data: dataPayload
        });
    };

    global.UserInterfaceTools.submitPost = function(address, dataPayload, dataFormat) {
        return global.UserInterfaceTools.remoteDataFetch({
            url: address,
            dataType: dataFormat,
            data: dataPayload,
            type: "POST"
        });
    };

    global.UserInterfaceTools.retrieveScriptGet = function(address) {
        return global.UserInterfaceTools.remoteDataFetch({
            url: address,
            dataType: "script"
        });
    };

    // Extend EventFlow prototype for chained AJAX.
    EventFlow.prototype.chainedRemoteDataFetch = function() {
        return this.chainLatestFlows(global.UserInterfaceTools.remoteDataFetch);
    };

    global.UserInterfaceTools.singleChoiceStatus = function(radioGroup, initialChoice) {
        if (initialChoice != null) {
            radioGroup.each(function(i, elem) {
                if (elem.value === initialChoice) {
                    $(elem).prop("checked", true);
                }
            });
        } else {
            initialChoice = radioGroup.filter(":checked").first().val();
        }
        const changeFlow = SignalWorks.createDomEventFlow(radioGroup, "change");
        return changeFlow.mapFlow(e => e.target.value).toValueMonitor(initialChoice);
    };

    global.UserInterfaceTools.toggleSwitchState = function(toggleElement, initialSetting) {
        const isCheckedChecker = () => !!toggleElement.prop("checked");
        if (initialSetting !== null) {
            toggleElement.prop("checked", initialSetting);
        }
        const changeFlow = SignalWorks.createDomEventFlow(toggleElement, "change");
        return changeFlow.mapFlow(isCheckedChecker).toValueMonitor(isCheckedChecker()).ensureDistinct();
    };

    global.UserInterfaceTools.urlFragmentMonitor = function(fallbackValue) {
        const getFragment = () => {
            const currentHash = document.location.hash;
            return currentHash ? currentHash : fallbackValue;
        };
        if (fallbackValue === undefined) {
            fallbackValue = "";
        }
        const hashChangeFlow = SignalWorks.createDomEventFlow(window, "hashchange");
        return hashChangeFlow.mapFlow(getFragment).toValueMonitor(getFragment()).ensureDistinct();
    };

    // --- jQuery Extensions ---

    // A generic method to create an EventFlow from jQuery elements.
    $.fn.extend({
        createEventFlow: function(eventName, selector = undefined) {
            return SignalWorks.createDomEventFlow(this, eventName, selector);
        }
    });

    // Dynamically create specific event flow methods based on the generic one.
    const uiEventAliases = {
        keydownE: "keydown", keyupE: "keyup", keypressE: "keypress",
        clickE: "click", dblclickE: "dblclick", mousedownE: "mousedown",
        mouseupE: "mouseup", mouseenterE: "mouseenter", mouseleaveE: "mouseleave",
        mousemoveE: "mousemove", mouseoutE: "mouseout", mouseoverE: "mouseover",
        resizeE: "resize", scrollE: "scroll", selectE: "select",
        changeE: "change", submitE: "submit", blurE: "blur",
        focusE: "focus", focusinE: "focusin", focusoutE: "focusout",
        loadE: "load", unloadE: "unload"
    };

    for (const [methodName, eventName] of Object.entries(uiEventAliases)) {
        $.fn[methodName] = function() {
            const methodArgs = [].slice.call(arguments);
            // Assuming the first argument might be a selector.
            const selectorArg = methodArgs.length > 0 && typeof methodArgs[0] === 'string' ? methodArgs[0] : undefined;
            return this.createEventFlow(eventName, selectorArg);
        };
    }

    // Extensions for monitoring animation completions.
    $.fn.extend({
        animationCompletionFlow: function(animationMethod, ...params) {
            const element = this;
            const flow = new EventFlow();
            const promise = element[animationMethod](...params).promise();
            promise.then(result => flow.dispatch(result)).catch(error => flow.dispatch(error));
            return flow;
        }
    });

    const uiAnimationAliases = {
        animateE: "animate", showE: "show", hideE: "hide", toggleE: "toggle",
        fadeInE: "fadeIn", fadeOutE: "fadeOut", fadeToE: "fadeTo", fadeToggleE: "fadeToggle",
        slideDownE: "slideDown", slideUpE: "slideUp", slideToggleE: "slideToggle"
    };

    for (const [methodName, animationName] of Object.entries(uiAnimationAliases)) {
        $.fn[methodName] = function() {
            const methodArgs = [].slice.call(arguments);
            return this.animationCompletionFlow(animationName, ...methodArgs);
        };
    }

})(window, jQuery);