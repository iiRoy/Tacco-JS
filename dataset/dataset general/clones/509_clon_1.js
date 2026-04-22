/**
 * DeLorean - A robust and versatile Flux capacitor implementation
 *            for accurately simulating time-bound operations in
 *            JavaScript unit tests, encompassing timeouts, intervals,
 *            and date manipulation.
 *
 * Current version: 0.1.2
 *
 * Project Home: http://michaelmonteleone.net/projects/delorean
 * GitHub Repository: http://github.com/mmonteleone/delorean
 *
 * Copyright (c) 2009 Michael Monteleone.
 * Licensed under the terms of the MIT License (refer to README.markdown for details).
 */
( function ( ) {

    var global = this; // Capture a reference to the global scope (e.g., `window` in browsers, `global` in Node.js).


    var version = '0.1.2'; // The current version string for DeLorean.


    var globalizedApi = false; // Flag indicating whether DeLorean's API has overridden native global functions.


    var callbacks = { }; // An object to store all currently scheduled callback functions.


    var advancedMs = 0; // Accumulator for the total milliseconds the fake clock has advanced.


    var elapsedMs = 0; // The current "fake" time in milliseconds, updated as callbacks execute.


    var funcCount = 0; // A counter used to generate unique IDs for scheduled functions.


    var currentlyAdvancing = false; // A boolean flag to indicate if an `advance` operation is actively running.


    var executionInterrupted = false; // Flag set if a callback schedules new events during an `advance` cycle.


    /**
     * Basic utility function to extend an object by copying properties from a source object.
     * This performs a shallow copy of properties.
     *
     * @param {Object} dest The destination object that will receive new properties.
     * @param {Object} src The source object whose properties will be copied.
     */
    var extend = function ( dest, src ) {

        // Iterate over each property in the source object.
        for ( var prop in src ) {

            // Copy the property from src to dest.
            dest[ prop ] = src[ prop ];
        }

    };


    /**
     * Stores references to the original, native timing functions and the Date constructor.
     * This allows DeLorean to restore the environment or use the native functions internally.
     */
    var originalClock = {

        setTimeout: global.setTimeout,      // The original `setTimeout` function.

        setInterval: global.setInterval,    // The original `setInterval` function.

        clearTimeout: global.clearTimeout,  // The original `clearTimeout` function.

        clearInterval: global.clearInterval, // The original `clearInterval` function.

        Date: global.Date                   // The original `Date` constructor.
    };


    /**
     * A custom Date constructor that intercepts requests for the current time,
     * offsetting them by the faked time advancement. This ensures that `new Date()`
     * within tests reflects the faked clock.
     *
     * It uses a "parasitic inheritance" pattern as described by Douglas Crockford.
     * http://www.crockford.com/javascript/inheritance.html
     *
     * @param {Number} year        The year (e.g., 2023).
     * @param {Number} month       The month (0-11).
     * @param {Number} day         The day of the month (1-31).
     * @param {Number} hour        The hour of the day (0-23).
     * @param {Number} minute      The minute (0-59).
     * @param {Number} second      The second (0-59).
     * @param {Number} millisecond The millisecond (0-999).
     * @returns {Date} A new Date object, potentially shifted by the fake clock.
     */
    var ShiftedDate = function ( year, month, day, hour, minute, second, millisecond ) {

        var shiftedDate; // Declare a variable to hold the new Date instance.

        // If no arguments are provided, it means `new Date()` was called to get the current time.
        if ( arguments.length === 0 ) {

            shiftedDate = new originalClock.Date( ); // Create a native Date object.
            // Adjust its milliseconds by the effective time offset.
            shiftedDate.setMilliseconds( shiftedDate.getMilliseconds( ) + effectiveOffset( ) );

        }
        // If one argument is provided, it could be a date string, a timestamp, or another Date object.
        else if ( arguments.length == 1 ) {

            shiftedDate = new originalClock.Date( arguments[ 0 ] ); // Pass the single argument directly to native Date.

        }
        // For multiple arguments, construct the date using the provided components.
        else {

            shiftedDate = new originalClock.Date(
                year || null,
                month || null,
                day || null,
                hour || null,
                minute || null,
                second || null,
                millisecond || null
            );

        }

        return shiftedDate; // Return the newly created (and potentially shifted) Date object.

    };


    // Copy static methods like `parse`, `UTC`, and `now` from the original Date constructor
    // to the `ShiftedDate` facade, ensuring it behaves like a full Date object.
    extend( ShiftedDate, {

        parse: originalClock.Date.parse, // Static `parse` method.

        UTC: originalClock.Date.UTC,     // Static `UTC` method.

        now: originalClock.Date.now      // Static `now` method.

    } );


    /**
     * Resets the fake time advancement back to zero, clearing all scheduled functions.
     * This effectively resets DeLorean to its initial state.
     */
    var reset = function ( ) {

        callbacks = { };                // Clear all scheduled callbacks.

        funcCount = 0;                  // Reset the function ID counter.

        advancedMs = 0;                 // Reset the total advanced milliseconds.

        currentlyAdvancing = false;     // Ensure no advance operation is considered active.

        executionInterrupted = false;   // Clear the interruption flag.

        elapsedMs = 0;                  // Reset the elapsed milliseconds for the current advance.

    };


    /**
     * Helper function to determine if a given value is truly numeric (not null, not NaN).
     *
     * @param {Object} value The value to be tested.
     * @returns {boolean} `true` if the value is numeric, `false` otherwise.
     */
    var isNumeric = function ( value ) {

        // Check if the value is not null and not NaN.
        return value !== null && !isNaN( value );

    };


    /**
     * Helper function to calculate the effective current time offset in milliseconds.
     * This accounts for whether an `advance` operation is currently in progress.
     *
     * @returns {Number} The current effective time offset in milliseconds.
     */
    var effectiveOffset = function ( ) {

        // If an advance is currently happening, use the `elapsedMs` for precise timing within the advance.
        // Otherwise, use the total `advancedMs`.
        return currentlyAdvancing ? elapsedMs : advancedMs;

    };


    /**
     * Advances the fake clock by a specified quantity of milliseconds.
     * During this advancement, all scheduled callbacks that would have occurred
     * within the advanced time range are executed in their proper native order and context.
     *
     * @param {Number} ms The quantity of milliseconds to advance the fake clock.
     * @returns {Number} The total accumulated advanced offset in milliseconds.
     */
    var advance = function ( ms ) {

        // The `advance` function can be called without parameters
        // to simply return the current accumulated advanced offset.
        if ( !!ms ) {

            // Validate the `ms` argument. It must be a positive number.
            if ( !isNumeric( ms ) || ms < 0 ) {
                throw ( "'ms' argument must be a positive number" );
            }

            // An array to hold scheduled callbacks that need to be executed within this advance range.
            var schedule = [ ];

            // Define the time range for this specific advancement.
            var range = {
                start: advancedMs,       // The starting point of this advancement.
                end: advancedMs += ms    // The ending point, also updating the total advanced milliseconds.
            };

            /**
             * Registers a callback function to occur at a specific point in the schedule.
             *
             * @param {Object} fn The function object (containing original function, ID, etc.).
             * @param {Number} at The millisecond timestamp at which this specific instance should run.
             */
            var register = function ( fn, at ) {
                schedule.push( {
                    fn: fn, // The callback function object.
                    at: at  // The time it's scheduled to run.
                } );
            };

            // This `do-while` loop handles the scheduling and execution.
            // It continues as long as `executionInterrupted` is true, meaning
            // a callback scheduled new events that need to be re-evaluated.
            do {

                executionInterrupted = false; // Reset the interruption flag for the current iteration.

                // Iterate through all currently registered callbacks.
                for ( var id in callbacks ) {
                    var fn = callbacks[ id ];

                    // Handle non-repeating `setTimeout` calls.
                    if ( !fn.repeats && fn.firstRunAt <= range.end ) {

                        register( fn, fn.firstRunAt ); // Schedule the timeout if its first run is within the range.

                    }
                    // Handle repeating `setInterval` calls.
                    else {

                        // Schedule the first instance of an interval if it falls within the range.
                        if ( fn.lastRunAt === null &&
                             fn.firstRunAt > range.start &&
                             ( fn.lastRunAt || fn.firstRunAt ) <= range.end ) {

                                fn.lastRunAt = fn.firstRunAt; // Set the last run time to its first run time.
                                register( fn, fn.lastRunAt ); // Register this first occurrence.
                        }

                        // Schedule all subsequent instances of the interval that occur within the range.
                        while ( ( fn.lastRunAt || fn.firstRunAt ) + fn.ms <= range.end ) {

                            fn.lastRunAt += fn.ms; // Advance the last run time by the interval duration.
                            register( fn, fn.lastRunAt ); // Register this subsequent occurrence.

                        }
                    }
                }

                // Sort all the collected scheduled callback instances.
                // This ensures they execute in the correct chronological order,
                // mimicking browser behavior.
                schedule.sort( function ( a, b ) {

                    // Primary sort key: execution point (ascending).
                    var order = a.at - b.at;

                    if ( order === 0 ) {
                        // Secondary sort key (if execution points are identical):
                        // interval length (descending, so shorter intervals run first).
                        order = b.fn.ms - a.fn.ms;

                        if ( order === 0 ) {
                            // Tertiary sort key (if execution points and interval lengths are identical):
                            // order of addition (ascending, preserving original scheduling order).
                            order = a.fn.id - b.fn.id;
                        }
                    }
                    return order; // Return the determined sort order.
                } );

                // Execute the scheduled callback instances.
                var ran = [ ]; // Keep track of indices of callbacks that have been run and should be removed.

                for ( var i = 0; i < schedule.length; ++i ) {

                    var fn = schedule[ i ].fn; // Get the function object from the schedule.

                    // Only run callbacks that are still present in the master `callbacks` list.
                    // A callback might have been cleared by a previous callback's execution.
                    if ( !!callbacks[ fn.id ] ) {

                        elapsedMs = schedule[ i ].at; // Set `elapsedMs` to the exact execution time of this callback.

                        currentlyAdvancing = true; // Indicate that an advance is in progress.

                        try {

                            fn.fn.apply( global ); // Execute the callback function in the global context.

                        } finally {

                            currentlyAdvancing = false; // Reset the flag after execution.

                            ran.push( i ); // Record that this instance was executed.

                            // If it's a non-repeating timeout, remove it completely from the master schedule.
                            if ( !fn.repeats ) {
                                removeCallback( fn.id );
                            }

                            // If a callback interrupted the execution (by scheduling new events),
                            // break out of the current execution loop to re-evaluate the schedule.
                            if ( executionInterrupted ) {
                                break;
                            }
                        }
                    }
                }

                // Remove all executed callback instances from the `schedule` array.
                // Iterate backwards to avoid issues with shifting indices.
                for ( var i = ran.length - 1; i >= 0; i-- ) {
                    schedule.splice( ran[ i ], 1 );
                }

            }
            while ( executionInterrupted ); // Continue the do-while loop if execution was interrupted.
        }

        return effectiveOffset( ); // Return the total effective time offset.

    };


    /**
     * Adds a callback function to DeLorean's master schedule.
     *
     * @param {Function|String} fn       The callback function or a string of code to be executed.
     * @param {Number}          ms       The millisecond delay after which the callback should run.
     * @param {Boolean}         repeats  `true` if the callback should repeat (like `setInterval`), `false` otherwise (like `setTimeout`).
     * @returns {Number} A unique numeric ID for the scheduled callback.
     */
    var addCallback = function ( fn, ms, repeats ) {

        // If the scheduled function is provided as a string of code,
        // convert it into an actual Function object.
        if ( typeof ( fn ) == 'string' ) {
            fn = new Function( fn );
        }

        var at = effectiveOffset( ); // Get the current effective time offset.
        var id = funcCount++;        // Generate a unique ID for this callback.

        // Store the callback's details in the `callbacks` object.
        callbacks[ id ] = {
            id: id,                     // The unique identifier for this callback.
            fn: fn,                     // The actual function to be called.
            ms: ms,                     // The delay in milliseconds.
            addedAt: at,                // The time when this callback was added.
            firstRunAt: ( at + ms ),    // The calculated time for its very first execution.
            lastRunAt: null,            // Tracks the last time this callback was executed (for intervals).
            repeats: repeats            // Boolean indicating if it's a repeating callback.
        };

        // If an `advance` operation is currently in progress,
        // set the `executionInterrupted` flag. This signals to the `advance` loop
        // that new callbacks have been scheduled and the schedule needs to be re-evaluated.
        if ( currentlyAdvancing ) {
            executionInterrupted = true;
        }

        return id; // Return the unique ID for the scheduled callback.

    };


    /**
     * Removes a callback from the master schedule using its unique identifier.
     *
     * @param {Number} id The unique identifier of the callback to be removed.
     */
    var removeCallback = function ( id ) {

        delete callbacks[ id ]; // Delete the callback entry from the `callbacks` object.

    };


    /**
     * Controls whether DeLorean's fake timing functions (setTimeout, setInterval, Date, etc.)
     * should overwrite the native global ones.
     *
     * @param {Boolean} shouldOverrideGlobal Optional. When `true`, DeLorean's API replaces native functions.
     *                                       When `false`, native functions are restored.
     *                                       If omitted, it simply returns the current state.
     * @returns {Boolean} `true` if DeLorean's API is currently active globally, `false` otherwise.
     */
    var globalApi = function ( shouldOverrideGlobal ) {

        // If `shouldOverrideGlobal` is provided, update the global API state.
        if ( typeof ( shouldOverrideGlobal ) !== 'undefined' ) {

            globalizedApi = shouldOverrideGlobal; // Set the internal flag.

            // Extend the global object with either DeLorean's API or the original native clock functions.
            extend( global, globalizedApi ? api : originalClock );

        }

        return globalizedApi; // Return the current state of whether the API is globalized.

    };


    /**
     * DeLorean's faked timing API.
     * These functions are encapsulated in their own object to facilitate
     * easy injection into and removal from the global scope.
     */
    var api = {

        /**
         * Faked `setTimeout` implementation.
         * Schedules a function to run once after a specified delay.
         *
         * @param {Function|String} fn The function to execute, or a string of code.
         * @param {Number} ms The delay in milliseconds.
         * @returns {Number} A unique ID for the scheduled timeout.
         */
        setTimeout: function ( fn, ms ) {

            // Handle cases with exceptional or incorrect parameters.
            if ( arguments.length === 0 ) {
                throw ( "Function setTimeout requires at least 1 parameter" );
            }
            // Warn about potentially useless calls if a number is passed as the first argument without quotes.
            else if ( arguments.length === 1 && isNumeric( arguments[ 0 ] ) ) {
                throw ( "useless setTimeout call (missing quotes around argument?)" );
            }
            // If only one argument is provided, assume it's the function and delay is 0.
            else if ( arguments.length === 1 ) {
                return addCallback( fn, 0, false );
            }

            // Schedule the function as a non-repeating callback.
            return addCallback( fn, ms, false );

        },

        /**
         * Faked `setInterval` implementation.
         * Schedules a function to run repeatedly after a specified delay.
         *
         * @param {Function|String} fn The function to execute, or a string of code.
         * @param {Number} ms The delay in milliseconds between executions.
         * @returns {Number} A unique ID for the scheduled interval.
         */
        setInterval: function ( fn, ms ) {

            // Handle cases with exceptional or incorrect parameters.
            if ( arguments.length === 0 ) {
                throw ( "Function setInterval requires at least 1 parameter" );
            }
            // Warn about potentially useless calls if a number is passed as the first argument without quotes.
            else if ( arguments.length === 1 && isNumeric( arguments[ 0 ] ) ) {
                throw ( "useless setTimeout call (missing quotes around argument?)" );
            }
            // If only one argument is provided, assume it's the function and delay is 0.
            else if ( arguments.length === 1 ) {
                return addCallback( fn, 0, false );
            }

            // Schedule the function as a repeating callback.
            return addCallback( fn, ms, true );

        },

        clearTimeout: removeCallback,    // `clearTimeout` simply maps to `removeCallback`.

        clearInterval: removeCallback,   // `clearInterval` also maps to `removeCallback`.

        Date: ShiftedDate               // Use the `ShiftedDate` constructor for `Date`.

    };


    // Expose a public API object on the global scope, named `DeLorean`.
    global.DeLorean = {

        reset: reset,           // Method to reset DeLorean's state.

        advance: advance,       // Method to advance the fake clock.

        globalApi: globalApi,   // Method to enable/disable global API overriding.

        version: version        // The current version of DeLorean.

    };

    // Extend the public API with the faked timing methods (setTimeout, setInterval, etc.).
    extend( global.DeLorean, api );


    // Set the initial state of DeLorean upon loading.
    reset( );

} ) ( );