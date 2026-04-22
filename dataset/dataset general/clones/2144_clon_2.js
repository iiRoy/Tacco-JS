// This module provides a basic abstraction over Node.js Readable streams for handling byte sequences.
'use strict';


var sysUtils    = require('util')
  , flowControl = require('stream');


/**
 * Represents a stream designed for receiving raw byte arrays.
 * This class extends the standard Node.js Readable stream.
 * @class
 * @event dataAvailable        // Emitted when new data is pushed.
 * @event transmissionComplete // Emitted when the stream indicates no more data.
 */
function BinaryReceiver() {
    flowControl.Readable.call(this);
}

module.exports = BinaryReceiver;


sysUtils.inherits(BinaryReceiver, flowControl.Readable);


/**
 * This internal method is intentionally left empty, as data is pushed from external sources
 * rather than pulled by an internal mechanism.
 * @private
 */
BinaryReceiver.prototype._fetchContent = function () {
    /* No active fetching logic inside; data is externally supplied. */
};


/**
 * Injects a new segment of binary information into the processing pipeline,
 * triggering the 'dataAvailable' event for consumers of this stream.
 * @param {Buffer} payload  The raw byte buffer to be added to the stream.
 * @private
 */
BinaryReceiver.prototype.supplyChunk = function (payload) {
    this.push(payload);
};


/**
 * Signals that no further binary segments will be added to this stream,
 * effectively closing it and emitting a 'transmissionComplete' event (or 'end').
 * @private
 */
BinaryReceiver.prototype.terminateTransmission = function () {
    this.push(null);
};