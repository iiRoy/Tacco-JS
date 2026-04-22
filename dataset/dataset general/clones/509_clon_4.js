var realmContext = this;
var toolVersion = '1.0.0';
var apiActive = false;

var nativeImplementations = {
    setSchedule: realmContext.setTimeout,
    setRepeatedSchedule: realmContext.setInterval,
    clearSchedule: realmContext.clearTimeout,
    clearRepeatedSchedule: realmContext.clearInterval,
    DateTime: realmContext.Date
};

var currentVirtualTime = 0;
var nextEventId = 0;
var isExecuting = false;
var wasInterrupted = false;
var executionPointInTime = 0;

// Event queue, always sorted by scheduledTime, then delay (desc), then insertionOrder (asc)
// Each item: { id, handler, delay, repeats, scheduledTime, insertionOrder }
var eventQueue = [];
// Map for quick lookup: id -> event object
var activeEvents = new Map();

// Helper to copy properties from source to destination
var assignProps = function(destination, source) {
    for (var prop in source) {
        if (Object.prototype.hasOwnProperty.call(source, prop)) {
            destination[prop] = source[prop];
        }
    }
};

// Helper to check if a value is a number
var isNumberValue = function(val) {
    return val !== null && !isNaN(val);
};

// Custom Date constructor that offsets current time
var AdjustedDateTime = function(y, M, d, h, m, s, ms) {
    var instance;
    var numArgs = arguments.length;
    if (numArgs === 0) {
        instance = new nativeImplementations.DateTime();
        instance.setMilliseconds(instance.getMilliseconds() + getEffectiveTime());
    } else if (numArgs === 1) {
        instance = new nativeImplementations.DateTime(arguments[0]);
    } else {
        instance = new nativeImplementations.DateTime(
            y || null, M || null, d || null, h || null,
            m || null, s || null, ms || null);
    }
    return instance;
};

// Keep prototype methods over the facade class
assignProps(AdjustedDateTime, {
    parse: nativeImplementations.DateTime.parse,
    UTC: nativeImplementations.DateTime.UTC,
    now: nativeImplementations.DateTime.now
});

// Resets the entire time control system
var reinitializeSystem = function() {
    activeEvents.clear();
    eventQueue = [];
    nextEventId = 0;
    currentVirtualTime = 0;
    isExecuting = false;
    wasInterrupted = false;
    executionPointInTime = 0;
};

// Helper function to return the current effective time for scheduling/date creation
var getEffectiveTime = function() {
    return isExecuting ? executionPointInTime : currentVirtualTime;
};

// Inserts an event into the sorted eventQueue
var insertIntoQueue = function(eventItem) {
    let low = 0, high = eventQueue.length;
    while (low < high) {
        let mid = Math.floor((low + high) / 2);
        let existing = eventQueue[mid];
        if (eventItem.scheduledTime < existing.scheduledTime) {
            high = mid;
        } else if (eventItem.scheduledTime > existing.scheduledTime) {
            low = mid + 1;
        } else { // Same scheduledTime, use secondary sorting
            if (eventItem.delay > existing.delay) {
                high = mid;
            } else if (eventItem.delay < existing.delay) {
                low = mid + 1;
            } else { // Same delay, use insertionOrder as tie-breaker
                if (eventItem.insertionOrder < existing.insertionOrder) {
                    high = mid;
                } else {
                    low = mid + 1;
                }
            }
        }
    }
    eventQueue.splice(low, 0, eventItem);
};

// Schedules a new event (timeout or interval)
var scheduleEvent = function(callbackFunction, delayMillis, shouldRepeat) {
    if (typeof callbackFunction === 'string') {
        callbackFunction = new Function(callbackFunction);
    }
    const idValue = nextEventId++;
    const currentEffectiveTime = getEffectiveTime();
    const scheduledMoment = currentEffectiveTime + delayMillis;

    const eventDetails = {
        id: idValue,
        handler: callbackFunction,
        delay: delayMillis,
        repeats: shouldRepeat,
        scheduledTime: scheduledMoment,
        insertionOrder: idValue
    };

    activeEvents.set(idValue, eventDetails);
    insertIntoQueue(eventDetails);

    if (isExecuting) {
        wasInterrupted = true;
    }
    return idValue;
};

// Cancels a scheduled event
var cancelEvent = function(idValue) {
    activeEvents.delete(idValue);
    // Event will be skipped during processing if not in activeEvents map
};

// Advances the mocked time by a specified duration
var processTimePassage = function(durationMs) {
    if (durationMs === undefined) {
        return currentVirtualTime;
    }
    if (!isNumberValue(durationMs) || durationMs < 0) {
        throw new Error("Duration must be a positive number.");
    }

    const finalTargetTime = currentVirtualTime + durationMs;

    do {
        wasInterrupted = false;
        let eventsForCurrentPass = [];
        let i = 0;

        // Collect events from the front of the queue that are due within the range
        // and temporarily remove them for processing in this pass.
        while (i < eventQueue.length) {
            const eventItem = eventQueue[i];
            if (eventItem.scheduledTime <= finalTargetTime) {
                eventsForCurrentPass.push(eventItem);
                eventQueue.splice(i, 1); // Remove from eventQueue
            } else {
                break; // Queue is sorted, no more events due
            }
        }

        // Sort the collected events for deterministic execution order
        eventsForCurrentPass.sort((e1, e2) => {
            let order = e1.scheduledTime - e2.scheduledTime;
            if (order === 0) {
                order = e2.delay - e1.delay; // Longer delays first for same scheduled time
                if (order === 0) {
                    order = e1.insertionOrder - e2.insertionOrder; // Original insertion order
                }
            }
            return order;
        });

        for (let j = 0; j < eventsForCurrentPass.length; ++j) {
            const eventToExecute = eventsForCurrentPass[j];

            if (activeEvents.has(eventToExecute.id)) { // Ensure event is still active
                executionPointInTime = eventToExecute.scheduledTime;
                currentVirtualTime = eventToExecute.scheduledTime; // Advance clock to this precise moment

                isExecuting = true;
                try {
                    eventToExecute.handler.apply(realmContext); // No extra arguments passed
                } finally {
                    isExecuting = false;
                }

                if (eventToExecute.repeats) {
                    const nextScheduled = eventToExecute.scheduledTime + eventToExecute.delay;
                    const reScheduledEvent = {
                        id: eventToExecute.id,
                        handler: eventToExecute.handler,
                        delay: eventToExecute.delay,
                        repeats: true,
                        scheduledTime: nextScheduled,
                        insertionOrder: eventToExecute.insertionOrder
                    };
                    activeEvents.set(eventToExecute.id, reScheduledEvent); // Update map entry
                    insertIntoQueue(reScheduledEvent); // Re-insert into sorted queue
                } else {
                    activeEvents.delete(eventToExecute.id); // Remove one-time event
                }

                if (wasInterrupted) {
                    // A new timer was added during execution. Re-evaluate the entire queue.
                    break; // Exit this inner loop. The `do...while` will re-run.
                }
            }
        }
    } while (wasInterrupted);

    // After all processing, ensure the `currentVirtualTime` reaches `finalTargetTime`
    // if no interruption occurred or if all events up to `finalTargetTime` were processed.
    currentVirtualTime = Math.max(currentVirtualTime, finalTargetTime);

    return currentVirtualTime;
};

// Mocked timing API methods
var mockedInterface = {
    setSchedule: function(fn, ms) {
        if (arguments.length === 0) {
            throw new Error("Function setSchedule requires at least 1 parameter");
        } else if (arguments.length === 1 && isNumberValue(arguments[0])) {
            throw new Error("useless setSchedule call (missing quotes around argument?)");
        } else if (arguments.length === 1) {
            return scheduleEvent(fn, 0, false);
        }
        return scheduleEvent(fn, ms, false);
    },
    setRepeatedSchedule: function(fn, ms) {
        if (arguments.length === 0) {
            throw new Error("Function setRepeatedSchedule requires at least 1 parameter");
        } else if (arguments.length === 1 && isNumberValue(arguments[0])) {
            throw new Error("useless setSchedule call (missing quotes around argument?)");
        } else if (arguments.length === 1) {
            return scheduleEvent(fn, 0, false);
        }
        return scheduleEvent(fn, ms, true);
    },
    clearSchedule: cancelEvent,
    clearRepeatedSchedule: cancelEvent,
    DateTime: AdjustedDateTime
};

// Toggles whether the mocked functions replace native ones
var toggleMocking = function(shouldOverrideGlobal) {
    if (typeof(shouldOverrideGlobal) !== 'undefined') {
        apiActive = shouldOverrideGlobal;
        assignProps(realmContext, apiActive ? mockedInterface : nativeImplementations);
    }
    return apiActive;
};

// Expose public API
realmContext.TemporalController = {
    reinitializeSystem: reinitializeSystem,
    advanceTime: processTimePassage,
    toggleMocking: toggleMocking,
    toolVersion: toolVersion
};
assignProps(realmContext.TemporalController, mockedInterface);

// Set initial state
reinitializeSystem();