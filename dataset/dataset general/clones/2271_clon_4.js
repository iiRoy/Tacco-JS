(function(domUtil) {
    const activeTimeouts = new WeakMap();
    const eventContexts = new WeakMap();
    const originalCallbacks = new WeakMap();
    const wrapperCallbacks = new WeakMap();

    let uniqueIdCounter = 1;

    const standardDebounceDelay = 100;

    function obtainCallbackIdentifier(callback) {
        if (!callback._customId_) {
            callback._customId_ = uniqueIdCounter++;
        }
        return callback._customId_;
    }

    const blockEvent = () => false;

    function parseEventArguments(args) {
        let [eventTypes, eventOptions, eventSelector, eventData, eventCallback, executionMode] = args;

        if (eventData == null && eventCallback == null) {
            eventCallback = eventSelector;
            eventData = eventSelector = undefined;
        } else if (eventCallback == null) {
            if (typeof eventSelector === "string") {
                eventCallback = eventData;
                eventData = undefined;
            } else {
                eventCallback = eventData;
                eventData = eventSelector;
                eventSelector = undefined;
            }
        }

        if (eventCallback === false) {
            eventCallback = blockEvent;
        } else if (!eventCallback) {
            return null;
        }

        if (typeof eventOptions !== 'object') {
            eventOptions = {
                delay: eventOptions
            };
        }

        if (typeof eventOptions.delay === 'undefined') {
            return null;
        }

        return {
            eventTypes,
            eventOptions,
            eventSelector,
            eventData,
            eventCallback,
            executionMode
        };
    }

    function retrieveEventRecords(element, typeDefinition, eventSelector, eventCallback) {
        const matchingRecords = [];
        const regexTypeNamespace = /^([^\.]*)?(?:\.(.+))?$/;
        const elementEventData = domUtil._data(element, 'events');

        if (eventSelector === false || typeof eventSelector === "function") {
            eventCallback = eventSelector;
            eventSelector = undefined;
        }
        if (eventCallback === false) {
            eventCallback = blockEvent;
        }

        let processedTypes = typeDefinition.replace(/(?:^|\s)hover(\.\S+)?\b/, "mouseenter$1 mouseleave$1") || "";
        processedTypes = domUtil.trim(processedTypes).split(" ");

        for (const fullType of processedTypes) {
            const typeParts = regexTypeNamespace.exec(fullType) || [];
            let baseType = typeParts[1];
            let originalEventType = baseType;

            if (baseType === 'mouseenter') {
                baseType = 'mouseover';
                originalEventType = 'mouseenter';
            } else if (baseType === 'mouseleave') {
                baseType = 'mouseout';
                originalEventType = 'mouseleave';
            } else {
                originalEventType = false;
            }

            const eventsOfType = elementEventData && elementEventData[baseType] || [];

            for (const eventRecord of eventsOfType) {
                if ((originalEventType && originalEventType === eventRecord.origType) || !originalEventType) {
                    if (eventRecord.namespace === typeParts[2] || typeof(typeParts[2]) === 'undefined') {
                        if (eventSelector) {
                            if (eventRecord.selector === eventSelector) {
                                if (eventCallback) {
                                    if (eventRecord.handler._customId_ === eventCallback._customId_) {
                                        matchingRecords.push(eventRecord);
                                    }
                                } else {
                                    matchingRecords.push(eventRecord);
                                }
                            }
                        } else {
                            matchingRecords.push(eventRecord);
                        }
                    }
                }
            }
        }
        return matchingRecords;
    }

    const EventScheduler = {

        scheduleEvent: function(eventTypes, eventOptions, eventSelector, eventData, eventCallback, executionMode) {
            const currentScope = this;

            if (typeof eventTypes === "object") {
                if (typeof eventSelector !== "string") {
                    eventData = eventData || eventSelector;
                    eventSelector = undefined;
                }
                for (const typeKey in eventTypes) {
                    EventScheduler.scheduleEvent.call(this, typeKey, eventSelector, eventData, eventTypes[typeKey]);
                }
                return this;
            }

            const parsedArgs = parseEventArguments([eventTypes, eventOptions, eventSelector, eventData, eventCallback, executionMode]);
            if (!parsedArgs) {
                return this;
            }
            ({
                eventTypes,
                eventOptions,
                eventSelector,
                eventData,
                eventCallback,
                executionMode
            } = parsedArgs);

            const originalFnId = obtainCallbackIdentifier(eventCallback);

            const wrappedEventCallback = function(eventObject) {
                if (eventOptions.preventDefault) {
                    eventObject.preventDefault();
                }
                if (eventOptions.stopPropagation) {
                    eventObject.stopPropagation();
                }
                if (eventOptions.stopImmediatePropagation) {
                    eventObject.stopImmediatePropagation();
                }

                eventContexts.set(eventCallback, [this, arguments]);

                let delayMilliseconds;
                if (eventOptions.delay === 'debounce') {
                    window.clearTimeout(activeTimeouts.get(eventCallback));
                    delayMilliseconds = standardDebounceDelay;
                } else {
                    delayMilliseconds = eventOptions.delay;
                }

                if (executionMode === 1) {
                    domUtil().off(eventObject);
                } else if (executionMode === 'first') {
                    domUtil(eventObject.delegateTarget).restoreEventCallback(eventTypes, eventSelector, eventCallback);
                }

                const timeoutId = window.setTimeout(() => {
                    const storedContext = eventContexts.get(eventCallback);
                    if (storedContext) {
                        eventCallback.apply(storedContext[0], storedContext[1]);
                    }
                    activeTimeouts.delete(eventCallback);
                    eventContexts.delete(eventCallback);
                }, delayMilliseconds);

                activeTimeouts.set(eventCallback, timeoutId);
            };

            wrappedEventCallback._customId_ = originalFnId;
            originalCallbacks.set(wrappedEventCallback, eventCallback);
            wrapperCallbacks.set(eventCallback, wrappedEventCallback);

            return currentScope.each(function() {
                domUtil.event.add(this, eventTypes, wrappedEventCallback, eventData, eventSelector);
            });
        },

        scheduleOnce: function(eventTypes, eventOptions, eventSelector, eventData, eventCallback) {
            return this.scheduleEvent(eventTypes, eventOptions, eventSelector, eventData, eventCallback, 1);
        },

        scheduleFirst: function(eventTypes, eventOptions, eventSelector, eventData, eventCallback) {
            return this.scheduleEvent(eventTypes, eventOptions, eventSelector, eventData, eventCallback, 'first');
        },

        restoreEventCallback: function(eventTypes, eventSelector, eventCallback) {
            if (typeof eventTypes === "object") {
                for (const typeKey in eventTypes) {
                    this.restoreEventCallback(typeKey, eventSelector, eventTypes[typeKey]);
                }
                return this;
            }

            return this.each(function() {
                const recordsToModify = retrieveEventRecords(this, eventTypes, eventSelector, eventCallback);

                for (const record of recordsToModify) {
                    const currentBoundHandler = record.handler;
                    if (originalCallbacks.has(currentBoundHandler)) {
                        const originalHandler = originalCallbacks.get(currentBoundHandler);

                        record.handler = originalHandler;

                        if (activeTimeouts.has(originalHandler)) {
                            window.clearTimeout(activeTimeouts.get(originalHandler));
                            activeTimeouts.delete(originalHandler);
                        }
                        eventContexts.delete(originalHandler);
                        wrapperCallbacks.delete(originalHandler);
                        originalCallbacks.delete(currentBoundHandler);
                    }
                }
            });
        },

        abortScheduledEvent: function(eventTypes, eventSelector, eventCallback) {
            if (typeof eventTypes === "object") {
                for (const typeKey in eventTypes) {
                    this.abortScheduledEvent(typeKey, eventSelector, eventTypes[typeKey]);
                }
                return this;
            }

            return this.each(function() {
                const recordsToExamine = retrieveEventRecords(this, eventTypes, eventSelector, eventCallback);

                for (const record of recordsToExamine) {
                    const currentBoundHandler = record.handler;
                    const originalHandler = originalCallbacks.get(currentBoundHandler);

                    if (originalHandler && activeTimeouts.has(originalHandler)) {
                        window.clearTimeout(activeTimeouts.get(originalHandler));
                        activeTimeouts.delete(originalHandler);
                        eventContexts.delete(originalHandler);
                    }
                }
            });
        },

        throttleEvent: function(eventTypes, eventSelector, eventData, eventCallback) {
            return this.each(function() {
                domUtil(this).scheduleEvent(eventTypes, 'debounce', eventSelector, eventData, eventCallback);
            });
        }
    };

    domUtil.fn.scheduleEvent = function() {
        return EventScheduler['scheduleEvent'].apply(this, arguments);
    };

    domUtil.fn.scheduleOnce = function() {
        return EventScheduler['scheduleOnce'].apply(this, arguments);
    };

    domUtil.fn.scheduleFirst = function() {
        return EventScheduler['scheduleFirst'].apply(this, arguments);
    };

    domUtil.fn.restoreEventCallback = function() {
        return EventScheduler['restoreEventCallback'].apply(this, arguments);
    };

    domUtil.fn.abortScheduledEvent = function() {
        return EventScheduler['abortScheduledEvent'].apply(this, arguments);
    };

    domUtil.fn.throttleEvent = function() {
        return EventScheduler['throttleEvent'].apply(this, arguments);
    };

})(jQuery);