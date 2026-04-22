/*
 * This module provides a client for interacting with a StatsD server over UDP.
 * It allows sending various types of metrics like timings, increments, gauges, etc.
 */
var dgram = require('dgram'); // Core Node.js UDP module
var dns   = require('dns');   // Node.js DNS resolution module

/*
 * The main UDP Client class for StatsD protocol communication.
 * This constructor initializes a new StatsD client instance.
 *
 * @param {object|string} hostOrOptions - Either an options object or the host string.
 *   @option {string}  host        The target host to connect to (default: 'localhost').
 *   @option {string|number} port The target port to connect to (default: 8125).
 *   @option {string}  prefix      An optional string prefix to prepend to all stat names.
 *   @option {string}  suffix      An optional string suffix to append to all stat names.
 *   @option {boolean} globalize   If true, adds this client instance to the global namespace as 'statsd'.
 *   @option {boolean} cacheDns    If true, performs a one-time DNS lookup for the host and caches the IP address.
 *   @option {boolean} mock        If true, the client operates in mock mode and does not send any actual UDP packets.
 *   @option {Array<string>=} global_tags Optional array of tags to be added to every metric sent by this client.
 * @constructor
 */
var Client = function ( host, port, prefix, suffix, globalize, cacheDns, mock, global_tags ) {
    // Determine options based on how the constructor was called.
    var options = host || {};

    var self = this; // Capture 'this' for use in callbacks.

    // If more than one argument is provided, or if the first argument is a string (indicating it's the host),
    // then assume the old constructor signature is being used.
    if ( arguments.length > 1 || typeof( host ) === 'string' ) {
        options = {
            host        : host,
            port        : port,
            prefix      : prefix,
            suffix      : suffix,
            globalize   : globalize,
            cacheDns    : cacheDns,
            mock        : mock === true, // Ensure mock is a boolean.
            global_tags : global_tags
        };
    }

    // Initialize instance properties with provided options or defaults.
    this.host        = options.host        || 'localhost';
    this.port        = options.port        || 8125;
    this.prefix      = options.prefix      || '';
    this.suffix      = options.suffix      || '';
    this.socket      = dgram.createSocket( 'udp4' ); // Create a new UDP4 socket.
    this.mock        = options.mock;                  // Mock status.
    this.global_tags = options.global_tags || [];     // Global tags for all metrics.

    // If DNS caching is enabled, perform a lookup and update the host.
    if ( options.cacheDns === true ) {
        dns.lookup( options.host, function ( err, address, family ) {
            // Only update if lookup was successful.
            if ( err == null ) {
                self.host = address;
            }
        } );
    }

    // If globalize option is true, expose this client globally.
    if ( options.globalize ) {
        global.statsd = this;
    }
};

/*
 * Records a timing stat.
 * @param {string|Array<string>} stat       The name(s) of the stat to send.
 * @param {number}               time       The time in milliseconds to record.
 * @param {number=}              sampleRate Optional: The sampling rate (0 to 1).
 * @param {Array<string>=}      tags       Optional: An array of tags to associate with this metric.
 * @param {Function=}            callback   Optional: Callback function to execute after message delivery.
 */
Client.prototype.timing = function ( stat, time, sampleRate, tags, callback ) {
    this.sendAll( stat, time, 'ms', sampleRate, tags, callback );
};

/*
 * Increments a counter stat by a specified or default amount.
 * @param {string|Array<string>} stat       The name(s) of the stat to increment.
 * @param {number=}              value      Optional: The amount to increment by (default: 1).
 * @param {number=}              sampleRate Optional: The sampling rate (0 to 1).
 * @param {Array<string>=}      tags       Optional: An array of tags to associate with this metric.
 * @param {Function=}            callback   Optional: Callback function to execute after message delivery.
 */
Client.prototype.increment = function ( stat, value, sampleRate, tags, callback ) {
    this.sendAll( stat, value || 1, 'c', sampleRate, tags, callback );
};

/*
 * Decrements a counter stat by a specified or default amount.
 * @param {string|Array<string>} stat       The name(s) of the stat to decrement.
 * @param {number=}              value      Optional: The amount to decrement by (default: 1).
 * @param {number=}              sampleRate Optional: The sampling rate (0 to 1).
 * @param {Array<string>=}      tags       Optional: An array of tags to associate with this metric.
 * @param {Function=}            callback   Optional: Callback function to execute after message delivery.
 */
Client.prototype.decrement = function ( stat, value, sampleRate, tags, callback ) {
    this.sendAll( stat, -value || -1, 'c', sampleRate, tags, callback );
};

/*
 * Records a histogram stat.
 * @param {string|Array<string>} stat       The name(s) of the stat to record.
 * @param {number}               value      The value to record for the histogram.
 * @param {number=}              sampleRate Optional: The sampling rate (0 to 1).
 * @param {Array<string>=}      tags       Optional: An array of tags to associate with this metric.
 * @param {Function=}            callback   Optional: Callback function to execute after message delivery.
 */
Client.prototype.histogram = function ( stat, value, sampleRate, tags, callback ) {
    this.sendAll( stat, value, 'h', sampleRate, tags, callback );
};


/*
 * Sets a gauge stat to a specified value.
 * @param {string|Array<string>} stat       The name(s) of the stat to set.
 * @param {number}               value      The value to set the gauge to.
 * @param {number=}              sampleRate Optional: The sampling rate (0 to 1).
 * @param {Array<string>=}      tags       Optional: An array of tags to associate with this metric.
 * @param {Function=}            callback   Optional: Callback function to execute after message delivery.
 */
Client.prototype.gauge = function ( stat, value, sampleRate, tags, callback ) {
    this.sendAll( stat, value, 'g', sampleRate, tags, callback );
};

/*
 * Records a unique value (set stat).
 * @param {string|Array<string>} stat       The name(s) of the stat to record.
 * @param {any}                  value      The unique value to record.
 * @param {number=}              sampleRate Optional: The sampling rate (0 to 1).
 * @param {Array<string>=}      tags       Optional: An array of tags to associate with this metric.
 * @param {Function=}            callback   Optional: Callback function to execute after message delivery.
 */
Client.prototype.unique =
Client.prototype.set = function ( stat, value, sampleRate, tags, callback ) {
    this.sendAll( stat, value, 's', sampleRate, tags, callback );
};

/*
 * Helper function to send multiple stats or a single stat.
 * It checks if 'stat' is an array and iterates, calling 'send' for each.
 * The callback is invoked once all individual stats have been sent.
 *
 * @param {string|Array<string>} stat       The stat(s) to send.
 * @param {any}                  value      The value associated with the stat.
 * @param {string}               type       The StatsD metric type (e.g., 'ms', 'c', 'g', 'h', 's').
 * @param {number=}              sampleRate Optional: The sampling rate (0 to 1).
 * @param {Array<string>=}      tags       Optional: An array of tags.
 * @param {Function=}            callback   Optional: Callback function when message(s) are delivered.
 */
Client.prototype.sendAll = function ( stat, value, type, sampleRate, tags, callback ) {
    var completed  = 0;          // Counter for completed sends.
    var calledback = false;      // Flag to ensure callback is called only once on error.
    var sentBytes  = 0;          // Total bytes sent across all messages.
    var self       = this;       // Reference to the client instance.

    // Argument shuffling for optional sampleRate and tags.
    if ( sampleRate && typeof sampleRate !== 'number' ) {
        callback   = tags;
        tags       = sampleRate;
        sampleRate = undefined;
    }

    if ( tags && !Array.isArray( tags ) ) {
        callback = tags;
        tags     = undefined;
    }

    /**
     * Internal callback handler for individual `send` operations.
     * It tracks completion and invokes the main `callback` when all
     * messages for an array of stats have been processed.
     * @private
     * @param {Error=} error An error object if the send failed.
     * @param {number} bytes The number of bytes sent for this specific message.
     */
    function onSend ( error, bytes ) {
        completed += 1; // Increment completed count.

        // If callback was already invoked due to an error, or no callback provided, just return.
        if ( calledback || typeof callback !== 'function' ) {
            return;
        }

        // If an error occurred, mark as called back and invoke the main callback with the error.
        if ( error ) {
            calledback = true;
            return callback( error );
        }

        sentBytes += bytes; // Accumulate sent bytes.

        // If all individual stats have been processed, invoke the main callback.
        if ( completed === stat.length ) {
            callback( null, sentBytes );
        }
    }

    // Check if 'stat' is an array.
    if ( Array.isArray( stat ) ) {
        // If it's an array, send each item individually.
        stat.forEach( function ( item ) {
            self.send( item, value, type, sampleRate, tags, onSend );
        } );
    } else {
        // Otherwise, send the single stat directly.
        this.send( stat, value, type, sampleRate, tags, callback );
    }
};

/*
 * Sends a single stat across the wire to the StatsD server.
 * This is the core method for dispatching UDP packets.
 *
 * @param {string}               stat       The name of the stat to send.
 * @param {any}                  value      The value associated with the stat.
 * @param {string}               type       The StatsD metric type (e.g., 'ms', 'c', 'g', 'h', 's').
 * @param {number=}              sampleRate Optional: The sampling rate (0 to 1).
 * @param {Array<string>=}      tags       Optional: An array of tags to add to this metric.
 * @param {Function=}            callback   Optional: Callback function when message is delivered.
 */
Client.prototype.send = function ( stat, value, type, sampleRate, tags, callback ) {
    // Construct the basic StatsD message string.
    var message = this.prefix + stat + this.suffix + ':' + value + '|' + type;

    // Buffer to hold the message.
    var buf;

    // Array to hold merged tags (global + specific).
    var merged_tags = [];

    // Apply sampling if a sampleRate is provided and less than 1.
    if ( sampleRate && sampleRate < 1 ) {
        if ( Math.random() < sampleRate ) {
            message += '|@' + sampleRate; // Append sample rate to message.
        } else {
            // If random check fails, do not send the stat.
            return;
        }
    }

    // Merge specific tags with global tags.
    if ( tags && Array.isArray( tags ) ) {
        merged_tags = merged_tags.concat( tags );
    }
    if ( this.global_tags && Array.isArray( this.global_tags ) ) {
        merged_tags = merged_tags.concat( this.global_tags );
    }

    // If there are any tags after merging, append them to the message.
    if ( merged_tags.length > 0 ) {
        message += '|#' + merged_tags.join( ',' );
    }

    // Only send the stat if the client is not in mock mode.
    if ( !this.mock ) {
        // Create a buffer from the message string.
        buf = new Buffer( message );
        // Send the UDP packet.
        this.socket.send( buf, 0, buf.length, this.port, this.host, callback );
    } else {
        // In mock mode, if a callback is provided, invoke it immediately as if sent.
        if ( typeof callback === 'function' ) {
            callback( null, 0 ); // Report success with 0 bytes sent.
        }
    }
};

/*
 * Closes the underlying UDP socket.
 * This should be called when the client is no longer needed to release system resources.
 */
Client.prototype.close = function ( ) {
    this.socket.close( );
};

// Export the Client constructor as the main module export and also as a named export.
exports = module.exports = Client;
exports.StatsD = Client;