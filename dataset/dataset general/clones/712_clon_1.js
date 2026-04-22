/*
 * This file defines a RateLimiter module.
 * It strictly adheres to modern JavaScript practices.
 */
'use strict';


var RateLimiter = ( function () { // Self-executing anonymous function to encapsulate the RateLimiter definition


    /**
     * @constructor
     * Creates a new RateLimiter instance.
     *
     * @param {number} maxOps      The maximum number of operations allowed.
     * @param {number} interval    The time interval (in milliseconds) over which maxOps applies.
     * @param {boolean} allowBursts If true, maxOps is the absolute limit per interval. If false,
     *                               it's an average rate (maxOps/interval).
     */
    var RateLimiter = function ( maxOps , interval , allowBursts ) {

        // Determine the maximum rate based on whether bursts are allowed.
        // If bursts are allowed, maxOps is the limit. Otherwise, it's maxOps per interval.
        this._maxRate    = allowBursts ? maxOps : maxOps / interval ;
        this._interval   = interval; // Store the interval duration.
        this._allowBursts = allowBursts; // Store the burst allowance setting.

        // Initialize internal state variables for tracking operations.
        this._numOps = 0; // Counter for operations within the current interval.

        // Record the start time of the current tracking interval.
        this._start    = new Date().getTime();

        // A queue to hold functions that are delayed due to rate limits.
        this._queue = [];
    };


    /**
     * Schedules a function to be executed, respecting the defined rate limits.
     * If the rate limit is not exceeded, the function is executed immediately.
     * Otherwise, it's queued and retried later.
     *
     * @param {Function} fn The function to be scheduled.
     */
    RateLimiter.prototype.schedule = function ( fn ) {

        var that      = this, // Capture 'this' for use in callbacks.
            rate      = 0, // Variable to hold the calculated current rate.
            now       = new Date().getTime(), // Current timestamp.
            elapsed   = now - this._start; // Time elapsed since the start of the current interval.

        // If the elapsed time exceeds the defined interval, reset the counters.
        if ( elapsed > this._interval ) {

            this._numOps = 0; // Reset operation count.
            this._start  = now; // Reset the interval start time.
        }

        // Calculate the current operation rate.
        // If bursts are allowed, we consider the rate against a 'virtual' elapsed time of 1 to allow immediate execution up to maxOps.
        // Otherwise, it's ops per actual elapsed time.
        rate = this._numOps / ( this._allowBursts ? 1 : elapsed );

        // Check if the current rate is below the maximum allowed rate.
        if ( rate < this._maxRate ) {

            // If the queue is empty, execute the function immediately.
            if ( this._queue.length === 0 ) {

                this._numOps++; // Increment the operation counter.
                fn();           // Execute the provided function.
            }

            else { // If there are functions already in the queue

                // Add the current function to the queue if it's provided.
                if ( fn ) {
                    this._queue.push( fn );
                }

                this._numOps++; // Increment the operation counter.
                this._queue.shift()(); // Execute the oldest function from the queue.
            }
        }

        else { // If the rate limit has been exceeded

            // If a function was provided, add it to the queue.
            if ( fn ) {
                this._queue.push( fn );
            }

            // Schedule a retry of the schedule method after a short delay.
            // The delay is inversely proportional to the max rate, ensuring minimal wait times.
            setTimeout( function () {
                that.schedule(); // Call schedule again without a specific function, to process the queue.
            } , 1 / this._maxRate );
        }
    };


    return RateLimiter; // Return the constructor function as the module's export.
} ) ();


/*
 * Export the RateLimiter constructor for use in other modules.
 * This makes the RateLimiter class available when this file is required.
 */
module.exports = RateLimiter;