'use strict';
// This file contains the SphinxClient implementation for Node.js.
// It provides functionality to interact with a Sphinx search daemon.

/*
 * sphinxapi
 * Copyright(c) 2012 Nicolas Thouvenin <nthouvenin@gmail.com>
 * MIT Licensed
 *
 * This software is licensed under the MIT License.
 * Please refer to the LICENSE file for more details.
 */

// Module dependencies list:
// These are essential Node.js modules and external libraries
// required for the SphinxClient's operation.
var net = require('net');           // Used for network communication (TCP sockets).
var bp = require('bufferpack');     // Provides binary packing and unpacking functions.
var Put = require('put');           // A buffer builder for creating binary data.
var assert = require('assert');     // Node.js assertion library for input validation.
var util = require('util');         // Node.js utility functions.
var debug = require('debug')('SphinxClient'); // Debugging module for SphinxClient activities.
var server_say = require('debug')('server');  // Debugging specifically for server responses.
var client_say = require('debug')('client');  // Debugging specifically for client requests.


// Useful internal utility functions for data manipulation.
// These functions are private to the module and not exposed externally.

/**
 * Packs an unsigned 64-bit integer into a Buffer.
 *
 * @param {number} number The unsigned 64-bit integer to pack.
 * @returns {Buffer} A Buffer containing the packed integer.
 */
function packUInt64 ( number )
{
    // Uses the 'Put' library to write a big-endian 64-bit word.
    return Put() .word64be ( number ) .buffer();
}


/**
 * Packs a signed 64-bit integer into a Buffer.
 * Note: Sphinx often treats 64-bit IDs as unsigned, but this function
 * is provided for consistency with the original library.
 *
 * @param {number} number The signed 64-bit integer to pack.
 * @returns {Buffer} A Buffer containing the packed integer.
 */
function packInt64 ( number )
{
    // Uses the 'Put' library to write a big-endian 64-bit word.
    return Put() .word64be ( number ) .buffer();
}


/**
 * Unpacks an unsigned 64-bit integer from a Buffer.
 * This is a manual conversion since JavaScript numbers are 64-bit floats.
 *
 * @param {Buffer} buffer The Buffer containing the packed unsigned 64-bit integer.
 * @returns {number} The unpacked unsigned 64-bit integer.
 */
function unpackUInt64 ( buffer )
{
    // Reads the high 32 bits (most significant) and low 32 bits (least significant).
    var high = buffer.readUInt32BE(0);
    var low = buffer.readUInt32BE(4);
    // Combines them to form the 64-bit number.
    return high * 4294967296 + low; // 2^32
}


/**
 * Unpacks a signed 64-bit integer from a Buffer.
 * Note: The original implementation only returns the low 32 bits, which might be
 * a simplification or a bug depending on the exact use case.
 *
 * @param {Buffer} buffer The Buffer containing the packed signed 64-bit integer.
 * @returns {number} The unpacked signed 64-bit integer (potentially only low 32 bits).
 */
function unpackInt64 ( buffer )
{
    // Reads high 32 bits.
    var high = buffer.readInt32BE(0);
    // Reads low 32 bits.
    var low = buffer.readInt32BE(4);
    // Current implementation returns only the low part.
    // This might not be fully correct for true 64-bit signed integers.
    return low;
}


/**
 * Concatenates two Buffers into a new single Buffer.
 *
 * @param {Buffer} a The first Buffer.
 * @param {Buffer} b The second Buffer.
 * @returns {Buffer} A new Buffer containing the concatenated data.
 */
function ConcatBuffer ( a, b )
{
    var t = new Buffer(a.length + b.length); // Create a new buffer of combined size.
    a.copy(t, 0, 0);                         // Copy the first buffer to the start.
    b.copy(t, a.length, 0);                  // Copy the second buffer after the first.
    return t;                                // Return the combined buffer.
}


/**
 * Reduces two arguments into a single concatenated Buffer.
 * If the second argument is not a Buffer, it's converted to one.
 *
 * @param {Buffer} a The initial Buffer.
 * @param {Buffer|string|Array} b The data to concatenate, can be a Buffer or convertible.
 * @returns {Buffer} The concatenated Buffer.
 */
function ReduceBuffer ( a, b )
{
    // Check if 'b' is already a Buffer, otherwise create a new Buffer from it.
    return ConcatBuffer(a, Buffer.isBuffer(b) ? b : new Buffer(b));
}


/**
 * Iterates over properties of an object or elements of an array.
 *
 * @param {Array|Object} o The object or array to iterate over.
 * @param {Function} fn The callback function to execute for each item/property.
 *                       For arrays: fn(item, index).
 *                       For objects: fn(value, key).
 */
function forEach ( o, fn )
{
    if (Array.isArray(o)) {
        // If it's an array, use the native forEach method.
        return o.forEach(fn);
    }
    else {
        // If it's an object, iterate over its own properties.
        for (var key in o) {
            if (o.hasOwnProperty(key)) {
                fn(o[key], key); // Call with value and key.
            }
        }
    }
}


/**
 * Calculates the length of an array, string (in bytes), or the number of
 * own properties in an object.
 *
 * @param {Array|string|Object} o The entity for which to get the length.
 * @returns {number} The length or count.
 */
function len ( o )
{
    if (Array.isArray(o)) {
        return o.length; // Array length.
    }
    else if (typeof o == 'string') {
        return Buffer.byteLength(o); // String length in bytes.
    }
    else {
        var k, l = 0;
        // Count own properties of an object.
        for (k in o) {
            l += Number(o.hasOwnProperty(k));
        }
        return l;
    }
}


/**
 * Wrapper for bufferpack's unpack function.
 *
 * @param {string} a Format string.
 * @param {Buffer} b Buffer to unpack.
 * @returns {Array} Unpacked values.
 */
function unpack ( a, b )
{
    return bp.unpack(a, b);
}


/**
 * Wrapper for bufferpack's pack function.
 *
 * @param {string} a Format string.
 * @param {Array} b Values to pack.
 * @returns {Buffer} Packed buffer.
 */
function pack ( a, b )
{
    return bp.pack(a, b);
}


// SphinxClient Object Definition
// This is the main class for interacting with the Sphinx search daemon.

/**
 * Constructs a new SphinxClient instance.
 *
 * @constructor
 * @api public
 */
function SphinxClient ()
{
    // Ensure that 'new' keyword is used for instantiation.
    if (!(this instanceof SphinxClient))
    {
        return new SphinxClient();
    }

    // --- Connection and Network Settings ---
    this._host = 'localhost';             // searchd host (default is "localhost").
    this._port = 9312;                    // searchd port (default is 9312).
    this._path = null;                    // searchd unix-domain socket path (if used).
    this._socket = null;                  // Internal socket object.
    this._timeout = 1.0;                  // Connection timeout in seconds (default is 1.0).

    // --- Query Parameters ---
    this._offset = 0;                     // How many records to seek from result-set start (default is 0).
    this._limit = 20;                     // How many records to return from result-set starting at offset (default is 20).
    this._mode = SphinxClient.SPH_MATCH_ALL; // Query matching mode (default is SPH_MATCH_ALL).
    this._weights = [];                   // Per-field weights (default is 1 for all fields).
    this._sort = SphinxClient.SPH_SORT_RELEVANCE; // Match sorting mode (default is SPH_SORT_RELEVANCE).
    this._sortby = '';                    // Attribute to sort by (default is "").
    this._min_id = 0;                     // Minimum ID to match (default is 0).
    this._max_id = 0;                     // Maximum ID to match (default is UINT_MAX, handled implicitly).
    this._filters = [];                   // Array of search filters.
    this._groupby = '';                   // Group-by attribute name.
    this._groupfunc = SphinxClient.SPH_GROUPBY_DAY; // Group-by function.
    this._groupsort = '@group desc';      // Group-by sorting clause.
    this._groupdistinct = '';             // Group-by count-distinct attribute.
    this._maxmatches = 1000;              // Maximum matches to retrieve.
    this._cutoff = 0;                     // Cutoff to stop searching at.
    this._retrycount = 0;                 // Distributed retry count.
    this._retrydelay = 0;                 // Distributed retry delay.
    this._anchor = {};                    // Geographical anchor point (latitude/longitude).
    this._indexweights = {};              // Per-index weights.
    this._ranker = SphinxClient.SPH_RANK_PROXIMITY_BM25; // Ranking mode.
    this._rankexpr = '';                  // Ranking expression for SPH_RANK_EXPR mode.
    this._maxquerytime = 0;               // Max query time in milliseconds (0 means no limit).
    this._fieldweights = {};              // Per-field-name weights.
    this._overrides = {};                 // Per-query attribute values overrides.
    this._select = '*';                   // Select-list (attributes or expressions).

    // --- Error and Warning Handling ---
    this._error = '';                     // Stores the last error message.
    this._warning = '';                   // Stores the last warning message.

    // --- Multi-query Management ---
    this._reqs = [];                      // Array to store requests for multi-query.
}


/**
 * Sends a request packet to the searchd server and handles the response.
 * This is an internal method used by Query and RunQueries.
 *
 * @param {number} client_ver Client protocol version.
 * @param {Buffer} request The request payload to send.
 * @param {Function} fn Callback function (err, content).
 * @api private
 */
SphinxClient.prototype._SendRequest = function (client_ver, request, fn)
{
    var self = this; // Capture 'this' for use in callbacks.
    debug('Connecting to ' + self._host + ':' + self._port);

    // Establish a TCP connection to the Sphinx searchd.
    var client = net.connect(self._port, self._host);

    // Event listener for successful connection.
    client.on('connect', function () {
        client_say('connected to searchd');
    });

    // Event listener for the first chunk of data received (protocol version).
    client.once('data', function (chunk) {
        // The first 4 bytes are usually the server's protocol version.
        chunk.slice(0, 4); // This line appears to do nothing useful.

        var response = unpack('>L', chunk); // Unpack the server's protocol version.
        server_say('>L', response);

        if (!Array.isArray(response)) {
            // If the response is not an array, it's an unexpected format.
            fn(new Error('connection to ' + self._host + ':' + self._port + ' failed'));
        } else if (Array.isArray(response) && response[0] < 1) {
            // Check if the received protocol version is valid.
            fn(new Error('expected searchd protocol version, got ' + response[0]));
        }
        else {
            client_say('received server version', client_ver);
        }

        var content = null; // Stores the accumulated response content.
        var state, version, length; // Variables to hold response header details.

        // Event listener for subsequent data chunks from the server.
        client.on('data', function (chunk) {
                if (content === null || content === undefined) {
                    // This is the first content chunk after the version.
                    client_say('received the response header');
                    response = unpack('>2HL', chunk); // Unpack state, version, length.
                    server_say('>2HL', response);

                    state = response[0];   // Server state (OK, WARNING, ERROR, RETRY).
                    version = response[1]; // Server command protocol version.
                    length = response[2];  // Length of the actual content body.
                    content = chunk.slice(8); // Actual content starts after the 8-byte header.
                    client_say('processing the response #1', state, version, length);
                }
                else {
                    // Subsequent chunks, concatenate them.
                    client_say('received following the response chunk ');
                    content = ConcatBuffer(content, chunk);
                }

                // Check if we have received all expected data for the current response.
                if (content.length >= length) {
                    var err = null; // Initialize error variable.
                    client_say('processing the response #2', state, version);

                    if (state == SphinxClient.SEARCHD_WARNING) {
                        // Handle server warning.
                        var wend = 4 + unpack('>L', content); // Get warning message length.
                        var warning = content.slice(4, wend); // Extract warning message.
                        // TODO: Implement proper warning handling/storage.
                        console.warn('Sphinx searchd warning:', warning.toString());
                        self._warning = warning.toString(); // Store the warning.
                    }
                    else if (state == SphinxClient.SEARCHD_ERROR) {
                        // Handle server error.
                        err = new Error('searchd error: ' + content.slice(4).toString());
                        content = null; // Reset content to prevent further processing.
                    }
                    else if (state == SphinxClient.SEARCHD_RETRY) {
                        // Handle temporary server error (retryable).
                        err = new Error('temporary searchd error: ' + content.slice(4).toString());
                        content = null; // Reset content.
                    }
                    else if (state != SphinxClient.SEARCHD_OK) {
                        // Handle unknown status code.
                        err = new Error('unknown status code ' + state);
                        content = null; // Reset content.
                    }

                    // Check if server protocol version is older than client's.
                    if (version < client_ver) {
                        self._warning = util.format('searchd command v.%d.%d older than client\'s v.%d.%d, some options might not work',
                            version >> 8, version & 0xff, client_ver >> 8, client_ver & 0xff);
                        // TODO: Log or handle this warning appropriately.
                        console.warn('Sphinx client warning:', self._warning);
                    }

                    client.end(); // Close the client connection after processing.
                    fn(err, content); // Invoke the callback with error and content.
                }
            }
        );

        client_say('sending a request', request.toString());
        // For debugging, one might uncomment the following line to see hex representation:
        // process.stdout.write(request.toString('hex') + '\n');
        client.write(request); // Send the actual request payload to the server.
    });

    // Event listener for connection end (graceful disconnect).
    client.on('end', function () {
        client_say('disconnected from searchd');
    });

    // Event listener for connection errors.
    client.on('error', function (err) {
        fn(new Error('searchd connection error: ' + err.message)); // Report connection error.
    });

    // Send the client protocol version (usually 1) as the very first packet.
    client.write(pack('>L', 1));
};


/**
 * Retrieves the last error message recorded by the client.
 *
 * @returns {string} The last error message, or an empty string if none.
 */
SphinxClient.prototype.GetLastError = function ()
{
    var self = this;
    return self._error;
};


/**
 * Retrieves the last warning message recorded by the client.
 *
 * @returns {string} The last warning message, or an empty string if none.
 */
SphinxClient.prototype.GetLastWarning = function ()
{
    var self = this;
    return self._warning;
};


/**
 * Sets the searchd server host and port for the client.
 *
 * @param {string} host The hostname or IP address of the searchd server.
 * @param {number} port The port number of the searchd server.
 * @api public
 */
SphinxClient.prototype.SetServer = function ( host, port )
{
    var self = this;
    assert.equal(typeof host, 'string', 'Host must be a string.');
    assert.equal(typeof port, 'number', 'Port must be a number.');
    self._host = host;
    self._port = port;
};


/**
 * Sets the connection timeout for the searchd server.
 *
 * @param {number} timeout The timeout duration in seconds. Must be greater than 0.001.
 * @api public
 */
SphinxClient.prototype.SetConnectTimeout = function ( timeout )
{
    var self = this;
    assert.equal(typeof timeout, 'number', 'Timeout must be a number.');
    // Ensure timeout is a positive value.
    self._timeout = Math.max(0.001, timeout);
};


/**
 * Sets the offset, limit, maximum matches, and cutoff for the query.
 *
 * @param {number} offset The number of records to skip from the start of the result set.
 * @param {number} limit The maximum number of records to return.
 * @param {number} [maxmatches=0] The maximum number of matches to retrieve from the index.
 * @param {number} [cutoff=0] The cutoff to stop searching at.
 * @api public
 */
SphinxClient.prototype.SetLimits = function ( offset, limit, maxmatches, cutoff )
{
    var self = this;
    assert.equal(typeof offset, 'number', 'Offset must be a number.');
    assert.equal(typeof limit, 'number', 'Limit must be a number.');
    // Assertions for valid range of offset and limit.
    assert(0 <= offset && offset < 16777216, 'Offset must be between 0 and 16777215.');
    assert(0 <= limit && limit < 16777216, 'Limit must be between 0 and 16777215.');

    // Assign default values if not provided.
    if (maxmatches === undefined) {
        maxmatches = 0;
    }
    if (cutoff === undefined) {
        cutoff = 0;
    }

    assert(maxmatches >= 0, 'Maxmatches must be a non-negative number.');

    self._offset = offset;
    self._limit = limit;

    if (maxmatches > 0) {
        self._maxmatches = maxmatches;
    }
    if (cutoff >= 0) {
        self._cutoff = cutoff;
    }
};


/**
 * Sets the maximum query time in milliseconds.
 *
 * @param {number} maxquerytime The maximum query time in milliseconds. Must be positive.
 * @api public
 */
SphinxClient.prototype.SetMaxQueryTime = function ( maxquerytime )
{
    var self = this;
    assert.equal(typeof maxquerytime, 'number', 'Max query time must be a number.');
    assert(maxquerytime > 0, 'Max query time must be greater than 0.');
    self._maxquerytime = maxquerytime;
};


/**
 * Sets the query matching mode.
 *
 * @param {number} mode The matching mode (e.g., SPH_MATCH_ALL, SPH_MATCH_ANY).
 * @api public
 */
SphinxClient.prototype.SetMatchMode = function ( mode )
{
    var self = this;
    // Define all valid match modes for validation.
    var modes = [
        SphinxClient.SPH_MATCH_ALL,
        SphinxClient.SPH_MATCH_ANY,
        SphinxClient.SPH_MATCH_PHRASE,
        SphinxClient.SPH_MATCH_BOOLEAN,
        SphinxClient.SPH_MATCH_EXTENDED,
        SphinxClient.SPH_MATCH_FULLSCAN,
        SphinxClient.SPH_MATCH_EXTENDED2
    ];
    // Assert that the provided mode is one of the valid modes.
    assert(modes.some(function (x) { return (x === mode); }), 'Invalid match mode provided.');
    self._mode = mode;
};


/**
 * Sets the ranking mode and an optional ranking expression.
 *
 * @param {number} ranker The ranking mode (e.g., SPH_RANK_PROXIMITY_BM25).
 * @param {string} [rankexpr=''] An optional ranking expression for SPH_RANK_EXPR.
 * @api public
 */
SphinxClient.prototype.SetRankingMode = function ( ranker, rankexpr )
{
    var self = this;
    if (rankexpr === undefined) {
        rankexpr = ''; // Default to empty string if not provided.
    }
    // Assert that the ranker is within the valid range.
    assert(0 <= ranker && ranker < SphinxClient.SPH_RANK_TOTAL, 'Invalid ranker value.');
    self._ranker = ranker;
    self._rankexpr = rankexpr;
};


/**
 * Sets the sorting mode and an optional sorting clause.
 *
 * @param {number} mode The sorting mode (e.g., SPH_SORT_RELEVANCE, SPH_SORT_ATTR_DESC).
 * @param {string} [clause=''] An optional sorting clause for SPH_SORT_EXTENDED or SPH_SORT_EXPR.
 * @api public
 */
SphinxClient.prototype.SetSortMode = function ( mode, clause )
{
    var self = this;
    // Define all valid sort modes for validation.
    var modes = [
        SphinxClient.SPH_SORT_RELEVANCE,
        SphinxClient.SPH_SORT_ATTR_DESC,
        SphinxClient.SPH_SORT_ATTR_ASC,
        SphinxClient.SPH_SORT_TIME_SEGMENTS,
        SphinxClient.SPH_SORT_EXTENDED,
        SphinxClient.SPH_SORT_EXPR
    ];
    if (clause === undefined) {
        clause = ''; // Default to empty string if not provided.
    }
    // Assert that the provided mode is valid.
    assert(modes.some(function (x) { return (x === mode); }), 'Invalid sort mode provided.');
    assert.equal(typeof clause, 'string', 'Sort clause must be a string.');
    self._sort = mode;
    self._sortby = clause;
};


/**
 * Sets per-field weights for ranking.
 *
 * @param {Array<number>} weights An array of numeric weights.
 * @api public
 */
SphinxClient.prototype.SetWeights = function ( weights )
{
    var self = this;
    assert(Array.isArray(weights), 'Weights must be an array.');
    // Validate that all items in the weights array are numbers.
    forEach(weights, function (item, index) {
        assert.equal(typeof item, 'number', 'All weights must be numbers.');
    });
    self._weights = weights;
};


/**
 * Sets per-field-name weights for ranking.
 *
 * @param {Object<string, number>} weights An object where keys are field names and values are weights.
 * @api public
 */
SphinxClient.prototype.SetFieldWeights = function ( weights )
{
    var self = this;
    assert.equal(typeof weights, 'object', 'Field weights must be an object.');
    // Validate that all values in the weights object are numbers.
    forEach(weights, function (item, index) {
        assert.equal(typeof item, 'number', 'All field weights must be numbers.');
    });
    self._fieldweights = weights;
};


/**
 * Sets per-index weights for multi-index searching.
 *
 * @param {Object<string, number>} weights An object where keys are index names and values are weights.
 * @api public
 */
SphinxClient.prototype.SetIndexWeights = function ( weights )
{
    var self = this;
    assert.equal(typeof weights, 'object', 'Index weights must be an object.');
    // Validate that all values in the weights object are numbers.
    forEach(weights, function (item, index) {
        assert.equal(typeof item, 'number', 'All index weights must be numbers.');
    });
    self._indexweights = weights;
};


/**
 * Sets a range for document IDs to match.
 *
 * @param {number} minid The minimum document ID (inclusive).
 * @param {number} maxid The maximum document ID (inclusive).
 * @api public
 */
SphinxClient.prototype.SetIDRange = function ( minid, maxid )
{
    var self = this;
    assert.equal(typeof minid, 'number', 'Min ID must be a number.');
    assert.equal(typeof maxid, 'number', 'Max ID must be a number.');
    assert(minid <= maxid, 'Min ID must be less than or equal to Max ID.');
    self._min_id = minid;
    self._max_id = maxid;
};


/**
 * Adds a filter for attribute values.
 * Documents must have one of the specified values for the given attribute.
 *
 * @param {string} attribute The name of the attribute to filter on.
 * @param {Array<number>} values An array of numeric values to match.
 * @param {number} [exclude=0] Flag to exclude (1) or include (0) documents matching the values.
 * @api public
 */
SphinxClient.prototype.SetFilter = function ( attribute, values, exclude )
{
    var self = this;
    if (exclude === undefined) {
        exclude = 0; // Default to include.
    }
    assert.equal(typeof attribute, 'string', 'Attribute name must be a string.');
    // Validate that all values in the array are numbers.
    forEach(values, function (item, index) {
        assert.equal(typeof item, 'number', 'All filter values must be numbers.');
    });

    self._filters.push({
        'type': SphinxClient.SPH_FILTER_VALUES,
        'attr': attribute,
        'exclude': exclude,
        'values': values
    });
};


/**
 * Adds a filter for a numeric attribute range.
 * Documents must have an attribute value within the specified range.
 *
 * @param {string} attribute The name of the attribute to filter on.
 * @param {number} min_ The minimum value for the range (inclusive).
 * @param {number} max_ The maximum value for the range (inclusive).
 * @param {number} [exclude=0] Flag to exclude (1) or include (0) documents within the range.
 * @api public
 */
SphinxClient.prototype.SetFilterRange = function ( attribute, min_, max_, exclude )
{
    var self = this;
    if (exclude === undefined) {
        exclude = 0; // Default to include.
    }
    assert.equal(typeof attribute, 'string', 'Attribute name must be a string.');
    assert.equal(typeof min_, 'number', 'Min value must be a number.');
    assert.equal(typeof max_, 'number', 'Max value must be a number.');
    assert(min_ <= max_, 'Min value must be less than or equal to Max value.');

    self._filters.push({
        'type': SphinxClient.SPH_FILTER_RANGE,
        'attr': attribute,
        'exclude': exclude,
        'min': min_,
        'max': max_
    });
};


/**
 * Adds a filter for a floating-point attribute range.
 * Documents must have an attribute value within the specified float range.
 *
 * @param {string} attribute The name of the attribute to filter on.
 * @param {number} min_ The minimum floating-point value for the range (inclusive).
 * @param {number} max_ The maximum floating-point value for the range (inclusive).
 * @param {number} [exclude=0] Flag to exclude (1) or include (0) documents within the range.
 * @api public
 */
SphinxClient.prototype.SetFilterFloatRange = function ( attribute, min_, max_, exclude )
{
    var self = this;
    if (exclude === undefined) {
        exclude = 0; // Default to include.
    }
    assert.equal(typeof attribute, 'string', 'Attribute name must be a string.');
    assert.equal(typeof min_, 'number', 'Min float value must be a number.');
    assert.equal(typeof max_, 'number', 'Max float value must be a number.');
    assert(min_ <= max_, 'Min float value must be less than or equal to Max float value.');

    self._filters.push({
        'type': SphinxClient.SPH_FILTER_FLOATRANGE,
        'attr': attribute,
        'exclude': exclude,
        'min': min_,
        'max': max_
    });
};


/**
 * Sets a geographical anchor point for distance calculations.
 *
 * @param {string} attrlat The name of the attribute storing latitude.
 * @param {string} attrlong The name of the attribute storing longitude.
 * @param {number} latitude The anchor latitude.
 * @param {number} longitude The anchor longitude.
 * @api public
 */
SphinxClient.prototype.SetGeoAnchor = function ( attrlat, attrlong, latitude, longitude )
{
    var self = this;
    assert.equal(typeof attrlat, 'string', 'Latitude attribute name must be a string.');
    assert.equal(typeof attrlong, 'string', 'Longitude attribute name must be a string.');
    assert.equal(typeof latitude, 'number', 'Latitude value must be a number.');
    assert.equal(typeof longitude, 'number', 'Longitude value must be a number.');

    self._anchor['attrlat'] = attrlat;
    self._anchor['attrlong'] = attrlong;
    self._anchor['lat'] = latitude;
    self._anchor['long'] = longitude;
};


/**
 * Configures grouping (clustering) of search results.
 *
 * @param {string} attribute The attribute to group by.
 * @param {number} func The grouping function (e.g., SPH_GROUPBY_DAY, SPH_GROUPBY_ATTR).
 * @param {string} [groupsort='@group desc'] The sorting clause for groups.
 * @api public
 */
SphinxClient.prototype.SetGroupBy = function ( attribute, func, groupsort )
{
    var self = this;
    if (groupsort == undefined) {
        groupsort = '@group desc'; // Default group sort order.
    }
    assert.equal(typeof attribute, 'string', 'Group attribute must be a string.');
    assert.equal(typeof groupsort, 'string', 'Group sort clause must be a string.');

    // Valid grouping functions.
    var funcs = [
        SphinxClient.SPH_GROUPBY_DAY,
        SphinxClient.SPH_GROUPBY_WEEK,
        SphinxClient.SPH_GROUPBY_MONTH,
        SphinxClient.SPH_GROUPBY_YEAR,
        SphinxClient.SPH_GROUPBY_ATTR,
        SphinxClient.SPH_GROUPBY_ATTRPAIR
    ];
    assert(funcs.some(function (x) { return (x === func); }), 'Invalid group function provided.');

    self._groupby = attribute;
    self._groupfunc = func;
    self._groupsort = groupsort;
};


/**
 * Sets the attribute to count distinct values for within each group.
 *
 * @param {string} attribute The attribute name for distinct count.
 * @api public
 */
SphinxClient.prototype.SetGroupDistinct = function ( attribute )
{
    var self = this;
    assert.equal(typeof attribute, 'string', 'Group distinct attribute must be a string.');
    self._groupdistinct = attribute;
};


/**
 * Configures distributed query retries.
 *
 * @param {number} count The number of retries for failed distributed queries.
 * @param {number} [delay=0] The delay between retries in milliseconds.
 * @api public
 */
SphinxClient.prototype.SetRetries = function ( count, delay )
{
    var self = this;
    if (delay == undefined) {
        delay = 0; // Default delay to 0.
    }
    assert.equal(typeof count, 'number', 'Retry count must be a number.');
    assert.equal(typeof delay, 'number', 'Retry delay must be a number.');
    assert(count >= 0, 'Retry count cannot be negative.');
    assert(delay >= 0, 'Retry delay cannot be negative.');
    self._retrycount = count;
    self._retrydelay = delay;
};


/**
 * Sets an attribute override for the current query.
 * Overrides specific attribute values for matching documents.
 *
 * @param {string} name The name of the attribute to override.
 * @param {number} type The type of the attribute (e.g., SPH_ATTR_INTEGER).
 * @param {Object<number, number>} values An object mapping document IDs to their overridden values.
 * @api public
 */
SphinxClient.prototype.SetOverride = function ( name, type, values )
{
    var self = this;
    assert.equal(typeof name, 'string', 'Override name must be a string.');
    // Validate attribute type.
    assert(SphinxClient.SPH_ATTR_TYPES.some(function (x) { return (x === type); }), 'Invalid attribute type for override.');
    assert.equal(typeof values, 'object', 'Override values must be an object.');

    self._overrides[name] = {
        'name': name,
        'type': type,
        'values': values
    };
};


/**
 * Sets the select-list for the query.
 * This defines which attributes or expressions are returned in the result set.
 *
 * @param {string} select The select-list string (e.g., "*, @weight / 1000 AS rank").
 * @api public
 */
SphinxClient.prototype.SetSelect = function ( select )
{
    var self = this;
    assert.equal(typeof select, 'string', 'Select statement must be a string.');
    self._select = select;
};


/**
 * Resets all attribute overrides.
 *
 * @api public
 */
SphinxClient.prototype.ResetOverrides = function ()
{
    var self = this;
    self._overrides = {}; // Clear the overrides object.
};


/**
 * Resets all filters and the geo anchor.
 *
 * @api public
 */
SphinxClient.prototype.ResetFilters = function ()
{
    var self = this;
    self._filters = []; // Clear the filters array.
    self._anchor = {};  // Clear the geo anchor object.
};


/**
 * Resets all group-by settings to their default values.
 *
 * @api public
 */
SphinxClient.prototype.ResetGroupBy = function ()
{
    var self = this;
    self._groupby = '';
    self._groupfunc = SphinxClient.SPH_GROUPBY_DAY;
    self._groupsort = '@group desc';
    self._groupdistinct = '';
};


/**
 * Connects to the searchd server and executes a single search query.
 *
 * @param {string} query The search query string.
 * @param {string} [index='*'] The index name(s) to search in (default is all indexes '*').
 * @param {string} [comment=''] An optional comment for the query.
 * @param {Function} fn The callback function (err, results).
 * @api public
 */
SphinxClient.prototype.Query = function ( query, index, comment, fn )
{
    var self = this; // Retain context.

    // Handle overloaded function signatures.
    if (arguments.length == 2) {
        fn = arguments[1]; // If only query and callback are provided.
        index = '*';       // Default index to all.
        comment = '';      // Default comment to empty.
    }
    else if (arguments.length == 3) {
        fn = arguments[2]; // If query, index, and callback are provided.
        comment = '';      // Default comment to empty.
    }

    // Add the single query to the internal requests array.
    self.AddQuery(query, index, comment);

    // Execute the batch of queries (in this case, just one).
    self.RunQueries(function (err, results) {
        self._reqs = []; // Clear requests array after execution, even if errors occurred.

        if (err) {
            fn(err, null); // Propagate connection or fundamental errors.
            return;
        }
        if (results.length == 0) {
            fn(err, null); // No results returned.
            return;
        }

        // Extract error and warning from the first query result.
        self._error = results[0].error;
        self._warning = results[0].warning;

        // If the first query itself had an error status.
        if (results[0].status == SphinxClient.SEARCHD_ERROR) {
            fn(results[0].error, null); // Return the specific searchd error.
            return;
        }

        // If everything is successful or a warning occurred, return the results.
        fn(err, results[0]);
    });
};


/**
 * Adds a query to the batch for multi-query execution.
 * The actual execution happens when `RunQueries` is called.
 *
 * @param {string} query The search query string.
 * @param {string} [index='*'] The index name(s) to search in.
 * @param {string} [comment=''] An optional comment for the query.
 * @api public
 */
SphinxClient.prototype.AddQuery = function ( query, index, comment )
{
    var self = this;
    if (index === undefined) {
        index = '*'; // Default to all indexes.
    }
    if (comment === undefined) {
        comment = ''; // Default to empty comment.
    }

    assert.equal(typeof query, 'string', 'Query must be a string.');
    assert.equal(typeof index, 'string', 'Index must be a string.');
    assert.equal(typeof comment, 'string', 'Comment must be a string.');

    // Store all current client settings (filters, limits, etc.) along with the query.
    // A deep copy is implicitly created by creating a new object for each query.
    self._reqs.push({
        _query: query,
        _index: index,
        _comment: comment,
        _offset: self._offset,
        _limit: self._limit,
        _mode: self._mode,
        _weights: self._weights,
        _sort: self._sort,
        _sortby: self._sortby,
        _min_id: self._min_id,
        _max_id: self._max_id,
        _filters: self._filters, // Note: This is a reference, not a deep copy. Filters should be reset before AddQuery if they are meant to be unique per query.
        _groupby: self._groupby,
        _groupfunc: self._groupfunc,
        _groupsort: self._groupsort,
        _groupdistinct: self._groupdistinct,
        _maxmatches: self._maxmatches,
        _cutoff: self._cutoff,
        _retrycount: self._retrycount,
        _retrydelay: self._retrydelay,
        _anchor: self._anchor, // Reference.
        _indexweights: self._indexweights, // Reference.
        _ranker: self._ranker,
        _rankexpr: self._rankexpr,
        _maxquerytime: self._maxquerytime,
        _fieldweights: self._fieldweights, // Reference.
        _overrides: self._overrides, // Reference.
        _select: self._select
    });
};