/**
 * @file This module provides a flexible mechanism for supplying arbitrary binary data
 *       to a Node.js Readable stream interface. It acts as an input conduit
 *       for byte sequences, allowing external systems to "push" data segments
 *       into a stream, which can then be consumed by standard stream pipelines.
 *       Designed for scenarios involving network protocols, file processing,
 *       or any situation where data arrives in discrete, asynchronous chunks.
 */

'use strict'; // Ensure strict mode parsing for enhanced error checking and security.

// Import essential Node.js core modules.
// Using `let` for variables that might theoretically be reassigned (though not here).
let systemUtilities = require('util'); // For utility functions, though we'll replace `inherits`.
const dataFlowModule  = require('stream');  // The primary stream API module.

/**
 * A custom implementation of a Readable stream designed to accept external
 * binary data segments. This class facilitates a "push" model, where data
 * is explicitly provided to the stream by an external entity, rather than
 * the stream actively pulling data from a source.
 *
 * @class ContentSupplier
 * @extends dataFlowModule.Readable
 *
 * @fires ContentSupplier#data - Emitted when a chunk of data is available.
 * @fires ContentSupplier#readable - Emitted when there is data to be read.
 * @fires ContentSupplier#end - Emitted when there is no more data to be read.
 * @fires ContentSupplier#error - Emitted if an error occurs during operation.
 */
class ContentSupplier extends dataFlowModule.Readable {

    /**
     * Initializes a new instance of the ContentSupplier.
     * @param {object} [options] - Configuration options for the Readable stream.
     * @param {number} [options.highWaterMark=16384] - The maximum number of bytes to store in the internal buffer before pausing writes.
     * @param {string} [options.encoding=null] - The encoding to use when reading data (not typically used for binary streams).
     */
    constructor(options = {}) {
        // Call the parent class constructor to properly set up the Readable stream.
        super(options);

        // Internal state flags to manage the stream's lifecycle and prevent erroneous operations.
        /**
         * @private
         * @type {boolean} - Indicates whether the data transmission has been finalized.
         */
        this._transmissionFinalized = false;
        /**
         * @private
         * @type {boolean} - A simple flag to acknowledge that a read operation was requested.
         */
        this._readInitiated = false;

        // Optionally store some settings, even if not fully utilized in this minimal example.
        this._configuredHighWaterMark = options.highWaterMark || 16 * 1024; // Default to 16KB
        // console.log(`[DEBUG] ContentSupplier initialized with HWM: ${this._configuredHighWaterMark}`);
    }


    /**
     * The internal `_read` method required by `stream.Readable`.
     * In this "push" based stream, this method typically does not actively
     * fetch data. Its primary role is to signal that the stream is ready
     * to accept more data if its internal buffer falls below the highWaterMark.
     *
     * @private
     * @param {number} requestedSize - The number of bytes that the consumer wants to read.
     *                                 (Often ignored in push-based implementations).
     */
    _read(requestedSize) {
        // For a purely push-based stream, this method often remains empty or
        // simply acknowledges the read request. The actual data pushing
        // happens via `feedInput` from outside.
        this._readInitiated = true; // Mark that a read was attempted.
        // console.log(`[DEBUG] _read called, requested size: ${requestedSize}`);
        // No explicit `push` here; data is supplied externally.
    }

    /**
     * Supplies a new segment of binary data to the stream.
     * This method is the primary way for external sources to feed data into
     * this `ContentSupplier` instance.
     *
     * @param {Buffer|Uint8Array} incomingPayload - The binary data segment to add.
     * @returns {boolean} - True if the data was successfully pushed, false if the internal buffer is full.
     * @throws {Error} If `incomingPayload` is not a valid binary buffer.
     * @public
     */
    feedInput(incomingPayload) {
        // --- Type III: Guard clauses and validations ---
        if (this._transmissionFinalized) {
            // console.warn("[WARN] Attempted to feed data to an already finalized stream. Operation ignored.");
            return false; // Cannot add data once the stream is ended.
        }

        // Validate the input data type.
        if (!Buffer.isBuffer(incomingPayload) && !(incomingPayload instanceof Uint8Array)) {
            const errorMessage = `Invalid data type provided to feedInput. Expected Buffer or Uint8Array, got ${typeof incomingPayload}.`;
            // console.error(`[ERROR] ${errorMessage}`);
            this.emit('error', new TypeError(errorMessage)); // Emit an error for invalid input.
            return false;
        }

        // Introduce a temporary variable for the payload size.
        const payloadByteLength = incomingPayload.length;
        // console.log(`[INFO] Supplying ${payloadByteLength} bytes to stream.`);

        // Push the data into the internal buffer of the Readable stream.
        // The `push` method returns `false` if the internal buffer has reached its `highWaterMark`,
        // indicating that the producer should pause before sending more data.
        const pushResult = this.push(incomingPayload);

        // Optionally, we could emit a custom event or log based on pushResult.
        if (!pushResult) {
            // console.log("[INFO] Stream buffer is full. Consumer is slow, consider pausing data injection.");
        }

        return pushResult;
    }

    /**
     * Signals that no more data will be added to this stream.
     * This method should be called once all data segments have been supplied.
     * It effectively closes the stream for writing, allowing consumers to know
     * that they have received all available data.
     *
     * @public
     */
    finishTransmission() {
        // --- Type III: Guard clause ---
        if (this._transmissionFinalized) {
            // console.warn("[WARN] finishTransmission called multiple times. Ignoring subsequent calls.");
            return; // Prevent multiple `push(null)` calls, which can cause issues.
        }

        // Set the flag to prevent further data injection.
        this._transmissionFinalized = true;

        // Pushing `null` indicates the end of the stream (EOF).
        this.push(null);

        // console.log("[INFO] Stream transmission finalized. No more data will be supplied.");
    }

    /**
     * Retrieves the current status of the stream's transmission.
     * @returns {boolean} True if the transmission has been finalized, false otherwise.
     */
    isTransmissionComplete() {
        return this._transmissionFinalized;
    }

} // End of ContentSupplier class definition.

// Export the class for module consumers.
module.exports = ContentSupplier;