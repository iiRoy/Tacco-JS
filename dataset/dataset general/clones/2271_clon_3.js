/*
    Modern Event Management Module - Facilitates asynchronous event handling within jQuery applications.
    This module enables delaying, debouncing, and managing event callbacks.
    Based on earlier work by Tyler Vigeant.
    License: MIT and GPL compatible.
    Version 2.0.0 (Type III Clone)
*/
(function( jq ) {
    // Ensure jQuery is available before proceeding.
    if (!jq || !jq.fn) {
        console.error("jQuery is not loaded. AsyncEventUtility cannot initialize.");
        return;
    }

    // A utility function to prevent the default action of an event.
    // This replaces `returnFalse` from the original code.
    const preventStandardAction = function() {
        return false;
    };

    // Main object managing asynchronous event operations.
    const AsyncEventUtility = {
        // Stores references to active `setTimeout` IDs for pending executions.
        pendingTimeouts: {},
        // Holds the `this` context and `arguments` for scheduled callbacks.
        storedCallContexts: {},
        // Keeps track of the original, unmodified event handler functions.
        originalCallbacks: {},
        // Default time in milliseconds for debounce operations.
        debounceDefaultMs: 120, // Slightly adjusted from 100

        /**
         * Schedules an event handler to execute after a specified delay or debounces it.
         * This is the core method for asynchronous event management.
         *
         * @param {string|object} eventTypes - Event type string (e.g., 'click.mynamespace') or a map of types to handlers.
         * @param {object|number} [options] - Configuration object or a number representing the delay in milliseconds.
         *                                    Can include `delay`, `preventDefault`, `stopPropagation`, `stopImmediatePropagation`.
         * @param {string} [eventDelegateSelector] - Optional selector for delegated events.
         * @param {*} [eventAttachedData] - Data to be passed to the event handler.
         * @param {function} [userCallback] - The actual event handler function to be executed.
         * @param {number|string} [executionQualifier] - '1' for once, 'first' for first match, or undefined for normal.
         * @returns {jq} The jQuery object for chaining.
         */
        scheduleHandler: function ( eventTypes, options, eventDelegateSelector, eventAttachedData, userCallback, executionQualifier ) {
            let initialCallback, currentEventType;

            // Normalize arguments: Handle various overloaded signatures.
            // If eventTypes is an object, it's a map of types to handlers.
            if ( typeof eventTypes === "object" ) {
                // Signature: ( eventTypes-Object, eventDelegateSelector, eventAttachedData )
                if ( typeof eventDelegateSelector !== "string" ) {
                    // Signature: ( eventTypes-Object, eventAttachedData )
                    eventAttachedData = eventAttachedData || eventDelegateSelector;
                    eventDelegateSelector = undefined;
                }
                for ( currentEventType in eventTypes ) {
                    // Recursively call for each type in the map.
                    this.scheduleHandler( currentEventType, options, eventDelegateSelector, eventAttachedData, eventTypes[ currentEventType ] );
                }
                return this; // Return chainable jQuery object.
            }

            // Further argument normalization for non-object `eventTypes`.
            if ( eventAttachedData == null && userCallback == null ) {
                // Signature: ( eventTypes, userCallback )
                userCallback = eventDelegateSelector;
                eventAttachedData = eventDelegateSelector = undefined;
            } else if ( userCallback == null ) {
                if ( typeof eventDelegateSelector === "string" ) {
                    // Signature: ( eventTypes, eventDelegateSelector, userCallback )
                    userCallback = eventAttachedData;
                    eventAttachedData = undefined;
                } else {
                    // Signature: ( eventTypes, eventAttachedData, userCallback )
                    userCallback = eventAttachedData;
                    eventAttachedData = eventDelegateSelector;
                    eventDelegateSelector = undefined;
                }
            }

            // If the userCallback is explicitly false, replace it with our preventStandardAction.
            if ( userCallback === false ) {
                userCallback = preventStandardAction;
            } else if ( !userCallback ) {
                // If no valid userCallback, nothing to schedule.
                return this;
            }

            // Ensure options is an object. If a number, it's the delay.
            if ( typeof options !== 'object' || options === null ) {
                options = { delay: options };
            }

            // Validate delay option. If undefined, log a warning and exit.
            if ( typeof options.delay === 'undefined' ) {
                console.warn("AsyncEventUtility: No delay specified for event type '" + eventTypes + "'. Handler will not be scheduled.");
                return this;
            }

            // Clone the original user function for internal use and removal.
            initialCallback = userCallback;

            // Wrap the user's callback in a delayed execution function.
            userCallback = function( actualEvent ) {
                // Handle event propagation and default prevention based on options.
                if ( options.preventDefault ) { actualEvent.preventDefault(); }
                if ( options.stopPropagation ) { actualEvent.stopPropagation(); }
                if ( options.stopImmediatePropagation ) { actualEvent.stopImmediatePropagation(); }

                // Store the context (this) and arguments for later application.
                AsyncEventUtility.storedCallContexts[ initialCallback.uniqueHandlerId ] = [this, arguments];

                let effectiveDelayMillis;

                // Determine the actual delay duration.
                if ( options.delay === 'debounce' ) {
                    // Clear any existing timeout for this handler to debounce.
                    clearTimeout( AsyncEventUtility.pendingTimeouts[ initialCallback.uniqueHandlerId ] );
                    effectiveDelayMillis = AsyncEventUtility.debounceDefaultMs;
                } else {
                    effectiveDelayMillis = options.delay;
                }

                // Handle 'one' or 'first' execution qualifiers.
                if ( executionQualifier === 1 ) {
                    // If 'once', unbind the event immediately after the first trigger.
                    jq(actualEvent.currentTarget).off( actualEvent.type + (actualEvent.namespace ? '.' + actualEvent.namespace : '') );
                } else if ( executionQualifier === 'first' ) {
                    // If 'first', remove the delay management for this handler.
                    jq(actualEvent.delegateTarget).clearScheduledHandlers( eventTypes, eventDelegateSelector, userCallback );
                }

                // Schedule the actual execution of the original callback.
                AsyncEventUtility.pendingTimeouts[ initialCallback.uniqueHandlerId ] = setTimeout(function() {
                    const storedContext = AsyncEventUtility.storedCallContexts[ initialCallback.uniqueHandlerId ];
                    if (storedContext) { // Ensure context still exists (not cleared by another operation)
                        return initialCallback.apply( storedContext[0], storedContext[1] );
                    }
                }, effectiveDelayMillis);
            };

            // Assign a unique ID to the wrapped function, inheriting from the original if present.
            // This allows linking the wrapped function back to the original for removal/management.
            userCallback.uniqueHandlerId = initialCallback.uniqueHandlerId || ( initialCallback.uniqueHandlerId = jq.event.guid++ );

            // Store the original function reference.
            AsyncEventUtility.originalCallbacks[ userCallback.uniqueHandlerId ] = initialCallback;

            // Attach the event using jQuery's event system.
            return this.each( function() {
                jq.event.add( this, eventTypes, userCallback, eventAttachedData, eventDelegateSelector );
            });
        },

        /**
         * Schedules an event handler to run only once after a delay.
         * @param {string} types - Event types.
         * @param {object} options - Configuration options.
         * @param {string} selector - Event selector.
         * @param {*} data - Event data.
         * @param {function} fn - The callback function.
         * @returns {jq} The jQuery object.
         */
        scheduleOnce: function ( types, options, selector, data, fn ) {
            return this.scheduleHandler( types, options, selector, data, fn, 1 );
        },

        /**
         * Schedules an event handler, and if it triggers, removes all other delays for this handler.
         * @param {string} types - Event types.
         * @param {object} options - Configuration options.
         * @param {string} selector - Event selector.
         * @param {*} data - Event data.
         * @param {function} fn - The callback function.
         * @returns {jq} The jQuery object.
         */
        scheduleFirstMatch: function ( types, options, selector, data, fn ) {
            return this.scheduleHandler( types, options, selector, data, fn, 'first' );
        },

        /**
         * Retrieves a list of jQuery event objects matching the criteria for a given element.
         * @param {HTMLElement} targetElement - The DOM element to inspect.
         * @param {string} eventTypes - Space-separated event types (e.g., 'click.myNs mouseover').
         * @param {string} [eventDelegateSelector] - Optional selector for delegated events.
         * @param {function} [specificCallback] - Optional specific handler function to match.
         * @returns {Array} An array of matching event descriptor objects.
         */
        retrieveMatchingEvents: function( targetElement, eventTypes, eventDelegateSelector, specificCallback ) {
            const matchedEvents = [];
            const typeNamespaceSplitter = /^([^\.]*)?(?:\.(.+))?$/; // Regex to split type and namespace.

            // Get event data using jQuery's internal method (assuming modern jQuery).
            const targetElementEvents = jq._data(targetElement, 'events');

            // Normalize arguments for optional specificCallback.
            if ( eventDelegateSelector === false || typeof eventDelegateSelector === "function" ) {
                specificCallback = eventDelegateSelector;
                eventDelegateSelector = undefined;
            }
            // If specificCallback is false, use the preventStandardAction helper.
            if ( specificCallback === false ) {
                specificCallback = preventStandardAction;
            }

            // Process event types.
            // Replace 'hover' with 'mouseenter mouseleave' and trim/split.
            let typeList = (eventTypes || "").replace(/(?:^|\s)hover(\.\S+)?\b/g, "mouseenter$1 mouseleave$1");
            typeList = jq.trim( typeList ).split(" ");

            for ( let typeIdx = 0; typeIdx < typeList.length; typeIdx++ ) {
                const parsedTypeAndNamespace = typeNamespaceSplitter.exec( typeList[typeIdx] ) || [];
                let baseType = parsedTypeAndNamespace[1];
                let originalBaseType = baseType;

                // Special handling for mouseenter/mouseleave to map to mouseover/mouseout.
                if ( baseType === 'mouseenter' ) {
                    baseType = 'mouseover';
                } else if ( baseType === 'mouseleave' ) {
                    baseType = 'mouseout';
                } else {
                    originalBaseType = false; // No special mapping needed.
                }

                const currentTypeEvents = targetElementEvents && targetElementEvents[ baseType ] || [];

                // Iterate through all registered handlers for the current baseType.
                for ( const eventIdx in currentTypeEvents ) {
                    const eventDescriptor = currentTypeEvents[eventIdx];

                    // Check if the event descriptor matches the original event type (for mouseenter/leave).
                    const typeMatches = (originalBaseType && originalBaseType === eventDescriptor.origType) || !originalBaseType;
                    if (!typeMatches) continue;

                    // Check namespace match.
                    const namespaceMatches = (eventDescriptor.namespace === parsedTypeAndNamespace[2] || typeof parsedTypeAndNamespace[2] === 'undefined');
                    if (!namespaceMatches) continue;

                    // Check selector match for delegated events.
                    if ( eventDelegateSelector ) {
                        if ( eventDescriptor.selector === eventDelegateSelector ) {
                            // If a specific callback is provided, check for handler match.
                            if ( specificCallback ) {
                                if ( eventDescriptor.handler === specificCallback ) {
                                    matchedEvents.push(eventDescriptor);
                                }
                            } else {
                                matchedEvents.push(eventDescriptor);
                            }
                        }
                    } else {
                        // No selector provided, add if no specific callback or callback matches.
                        if ( specificCallback ) {
                            if ( eventDescriptor.handler === specificCallback ) {
                                matchedEvents.push(eventDescriptor);
                            }
                        } else {
                            matchedEvents.push(eventDescriptor);
                        }
                    }
                }
            }
            return matchedEvents;
        },

        /**
         * Extracts unique handler IDs (guids) from a list of event objects.
         * @param {HTMLElement} targetElement - The DOM element.
         * @param {string} eventTypes - Event types string.
         * @param {string} [eventDelegateSelector] - Optional selector.
         * @param {function} [specificCallback] - Optional specific handler function.
         * @returns {Array<number>} An array of unique handler IDs.
         */
        extractHandlerIdentifiers: function( targetElement, eventTypes, eventDelegateSelector, specificCallback ) {
            const handlerIds = [];
            const eventsToInspect = AsyncEventUtility.retrieveMatchingEvents( targetElement, eventTypes, eventDelegateSelector, specificCallback );

            for ( const idx in eventsToInspect ) {
                const eventDescriptor = eventsToInspect[idx];
                if (eventDescriptor.uniqueHandlerId || eventDescriptor.guid) { // Support both guid and uniqueHandlerId
                    handlerIds.push(eventDescriptor.uniqueHandlerId || eventDescriptor.guid);
                }
            }
            return handlerIds;
        },

        /**
         * Reverts delayed handlers back to their original, immediate execution state.
         * This effectively removes the delay wrapper without unbinding the event.
         * @param {string|object} types - Event type string or map.
         * @param {string} [selector] - Event selector.
         * @param {function} [fn] - Specific handler function.
         * @returns {jq} The jQuery object for chaining.
         */
        clearScheduledHandlers: function( types, selector, fn ) {
            // Handle map of types.
            if ( typeof types === "object" ) {
                for ( const typeKey in types ) {
                    this.clearScheduledHandlers( typeKey, selector, types[ typeKey ] );
                }
                return this;
            }

            // Iterate over each selected element to clear its handlers.
            return this.each(function() {
                const elementsEvents = AsyncEventUtility.retrieveMatchingEvents( this, types, selector, fn );

                for ( const idx in elementsEvents ) {
                    const eventDescriptor = elementsEvents[idx];
                    // Replace the wrapped handler with its original version.
                    if (AsyncEventUtility.originalCallbacks[ eventDescriptor.uniqueHandlerId || eventDescriptor.guid ]) {
                        eventDescriptor.handler = AsyncEventUtility.originalCallbacks[ eventDescriptor.uniqueHandlerId || eventDescriptor.guid ];
                        // Clean up stored contexts and timeouts for this handler.
                        delete AsyncEventUtility.storedCallContexts[eventDescriptor.uniqueHandlerId || eventDescriptor.guid];
                        clearTimeout(AsyncEventUtility.pendingTimeouts[eventDescriptor.uniqueHandlerId || eventDescriptor.guid]);
                        delete AsyncEventUtility.pendingTimeouts[eventDescriptor.uniqueHandlerId || eventDescriptor.guid];
                    }
                }
            });
        },

        /**
         * Immediately stops any currently pending (delayed) executions for matching event handlers.
         * It does not unbind the event or remove its delay wrapper.
         * @param {string|object} types - Event type string or map.
         * @param {string} [selector] - Event selector.
         * @param {function} [fn] - Specific handler function.
         * @returns {jq} The jQuery object for chaining.
         */
        haltPendingExecutions: function( types, selector, fn ) {
            // Handle map of types.
            if ( typeof types === "object" ) {
                for ( const typeKey in types ) {
                    this.haltPendingExecutions( typeKey, selector, types[ typeKey ] );
                }
                return this;
            }

            // Iterate over each selected element to stop its pending executions.
            return this.each(function() {
                const handlerGuids = AsyncEventUtility.extractHandlerIdentifiers( this, types, selector, fn );

                for ( const idx in handlerGuids ) {
                    const currentGuid = handlerGuids[idx];
                    // Clear the timeout if it exists.
                    if (AsyncEventUtility.pendingTimeouts[ currentGuid ]) {
                        clearTimeout( AsyncEventUtility.pendingTimeouts[ currentGuid ] );
                        delete AsyncEventUtility.pendingTimeouts[ currentGuid ];
                        delete AsyncEventUtility.storedCallContexts[ currentGuid ]; // Also clear its context
                    }
                }
            });
        },

        /**
         * Registers an event handler that will be debounced.
         * The handler will only execute after a pause in triggers.
         * @param {string} types - Event types.
         * @param {string} [selector] - Event selector.
         * @param {*} [data] - Event data.
         * @param {function} [fn] - The callback function.
         * @returns {jq} The jQuery object for chaining.
         */
        registerDebouncedEvent: function( types, selector, data, fn ) {
            // Simply calls scheduleHandler with 'debounce' as the delay option.
            return this.each(function() {
                jq(this).scheduleHandler( types, 'debounce', selector, data, fn );
            });
        }
    };

    // Extend jQuery's prototype with our new methods for chainability.
    jq.fn.scheduleHandler = function() {
        return AsyncEventUtility.scheduleHandler.apply( this, arguments );
    };

    jq.fn.scheduleOnce = function() {
        return AsyncEventUtility.scheduleOnce.apply( this, arguments );
    };

    jq.fn.scheduleFirstMatch = function() {
        return AsyncEventUtility.scheduleFirstMatch.apply( this, arguments );
    };

    jq.fn.clearScheduledHandlers = function() {
        return AsyncEventUtility.clearScheduledHandlers.apply( this, arguments );
    };

    jq.fn.haltPendingExecutions = function() {
        return AsyncEventUtility.haltPendingExecutions.apply( this, arguments );
    };

    jq.fn.registerDebouncedEvent = function() {
        return AsyncEventUtility.registerDebouncedEvent.apply( this, arguments );
    };

})( jQuery );