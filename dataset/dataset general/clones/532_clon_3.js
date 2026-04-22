"use strict";

// Core Node.js file system utilities
const nodeIo = require("fs");
// Utility for managing temporary files, could be a custom module or a wrapper
const tempFileUtility = require("tmp");
// A custom logging utility for internal debugging and tracing
const log = require('debug')('document-processor:outcome');

/**
 * @constant {string} INVALID_STATE_MSG - Standard message for an invalid object state.
 */
const INVALID_STATE_MSG = 'This DocumentProcessingOutcome instance is no longer valid or has been disposed.';
/**
 * @constant {string} NO_PATH_ERROR - Error message when a required path is missing.
 */
const NO_PATH_ERROR = 'Temporary file path is not defined or is empty.';
/**
 * @constant {string} FILE_NOT_FOUND_ERROR - Error for when a file is expected but not found.
 */
const FILE_NOT_FOUND_ERROR = 'Temporary file could not be found or accessed.'; 

// Define the prototype object for our result class
const docOutcomePrototype = DocumentProcessingOutcome.prototype;

/**
 * Represents the final result of a document processing operation,
 * potentially including a temporary file path and error status.
 * @class
 * @param {Error|null} operationIssue - Any error encountered during processing.
 * @param {string} scratchFileLoc - The path to the temporary output file.
 * @param {boolean} shouldAutoDispose - Flag indicating if the temporary file should be cleaned up automatically.
 */
function DocumentProcessingOutcome(operationIssue, scratchFileLoc, shouldAutoDispose) {
    // Initialize internal state variables
    this._operationIssue = operationIssue || null; // Store any error that occurred
    this._temporaryFileLocation = scratchFileLoc || ''; // Path to the temporary output artifact
    this._autoDisposeFlag = !!shouldAutoDispose; // Ensure boolean type for auto-cleanup flag
    this._isPermanentlyClosed = false; // Flag to indicate if this instance has been invalidated/disposed
}

/**
 * Private helper to ensure the outcome object is in a valid, operational state.
 * Throws an error if the object is disposed or its temporary path is invalid.
 * @private
 * @throws {Error} If the instance is disposed or the temporary path is invalid.
 */
docOutcomePrototype._ensureNotDisposed = function() {
    if (this._isPermanentlyClosed) {
        log('Attempted operation on a disposed instance. State: %o', this);
        throw new Error(INVALID_STATE_MSG);
    }
    if (!this._temporaryFileLocation) {
        log('Operation attempted without a valid temporary file path. State: %o', this);
        throw new Error(NO_PATH_ERROR);
    }
    // New check: does the file actually exist?
    // This is a synchronous check for simplicity, an async version would be more robust in some contexts.
    if (!nodeIo.existsSync(this._temporaryFileLocation)) {
        log('Temporary file at "%s" does not exist for operation. State: %o', this._temporaryFileLocation, this);
        this._isPermanentlyClosed = true; // Mark as invalid if file is gone
        throw new Error(FILE_NOT_FOUND_ERROR + ` Path: ${this._temporaryFileLocation}`);
    }
};

/**
 * Provides a readable stream for the temporary document file.
 * @returns {fs.ReadStream} A Node.js readable stream.
 * @throws {Error} If the instance is invalid or the temporary path is not set.
 */
docOutcomePrototype.obtainReadStream = function() {
    this._ensureNotDisposed(); // Guard clause
    log('Creating read stream from: %s', this._temporaryFileLocation);
    // Directly return the stream. Cleanup is handled by other methods if autoDisposeFlag is true.
    return nodeIo.createReadStream(this._temporaryFileLocation);
};

/**
 * Retrieves the content of the temporary document file as a Buffer.
 * @param {function(Buffer|null, Error|null): void} [completionHandler] - Optional callback to receive the buffer.
 *                                                     The first argument is the buffer (or null), the second is an error (or null).
 *                                                     If omitted, a no-op function is used.
 * @throws {Error} If the instance is invalid or the temporary path is not set.
 */
docOutcomePrototype.retrieveAsBuffer = function(completionHandler) {
    this._ensureNotDisposed(); // Guard clause

    const currentInstance = this; // Capture 'this' for use in event handlers
    const collectedChunks = []; // Array to hold data chunks
    let finalPayloadBuffer = Buffer.alloc(0); // Initialize an empty buffer

    // Ensure completionHandler is a function, provide a no-op fallback
    const actualCompletionHandler = typeof completionHandler === 'function' ? completionHandler : () => {};

    log('Attempting to read file into buffer: %s', currentInstance._temporaryFileLocation);

    const inputPipe = nodeIo.createReadStream(currentInstance._temporaryFileLocation);

    inputPipe.on('data', (chunk) => {
        collectedChunks.push(chunk); // Accumulate data chunks
    });

    inputPipe.on('error', (streamErr) => { // Added error handling for the stream itself
        log('Error reading stream into buffer from "%s": %o', currentInstance._temporaryFileLocation, streamErr);
        currentInstance._operationIssue = streamErr; // Store stream error
        actualCompletionHandler(null, streamErr); // Pass error to callback
        // No further processing, cleanup might not be possible if stream failed early
    });

    inputPipe.on('end', () => {
        finalPayloadBuffer = Buffer.concat(collectedChunks); // Combine all chunks into one buffer
        log('Successfully read file into buffer. Size: %d bytes', finalPayloadBuffer.length);

        // Perform post-operation cleanup if configured
        if (currentInstance._autoDisposeFlag) {
            currentInstance.performCleanup();
        }

        // Execute the provided callback with the result
        actualCompletionHandler(finalPayloadBuffer, null);
    });
};

/**
 * Returns the path of the temporary file associated with this outcome.
 * @returns {string} The full path to the temporary file.
 */
docOutcomePrototype.getTemporaryStoragePath = function() {
    return this._temporaryFileLocation;
};

/**
 * Saves the temporary document file to a specified destination on disk.
 * @param {string} destinationPath - The full path where the file should be saved.
 * @param {function(Error|null): void} [completionHandler] - Optional callback to be invoked upon completion.
 *                                                      Receives an error object if the operation fails.
 * @throws {Error} If the instance is invalid, temporary path is not set, or destinationPath is invalid.
 */
docOutcomePrototype.storeAsFile = function(destinationPath, completionHandler) {
    this._ensureNotDisposed(); // Guard clause

    // Input validation for destinationPath
    if (typeof destinationPath !== 'string' || destinationPath.trim() === '') {
        log('Invalid destination path provided: "%s"', destinationPath);
        throw new Error('A valid destination file path must be provided.');
    }

    const currentInstance = this; // Capture 'this'
    // Ensure completionHandler is a function, provide a no-op fallback that logs errors
    const actualCompletionHandler = typeof completionHandler === 'function' ? completionHandler : (err) => {
        if (err) log('Error saving file to "%s": %o', destinationPath, err);
    };

    log('Saving temporary file from "%s" to permanent location: "%s"', currentInstance._temporaryFileLocation, destinationPath);

    const sourcePipe = nodeIo.createReadStream(currentInstance._temporaryFileLocation);
    const destinationWriter = nodeIo.createWriteStream(destinationPath);

    // Pipe the content from source to destination
    const copyProcess = sourcePipe.pipe(destinationWriter);

    copyProcess.on('finish', () => { // 'finish' event on the destination stream indicates successful write
        log('File successfully copied to "%s".', destinationPath);
        // Perform post-operation cleanup if configured
        if (currentInstance._autoDisposeFlag) {
            currentInstance.performCleanup();
        }
        actualCompletionHandler(null); // Indicate success
    });

    copyProcess.on('error', (copyErr) => { // Handle errors during the piping process
        log('Error during file copy from "%s" to "%s": %o', currentInstance._temporaryFileLocation, destinationPath, copyErr);
        currentInstance._operationIssue = copyErr; // Store error
        actualCompletionHandler(copyErr); // Pass error to callback
    });

    // Also handle errors on the source stream
    sourcePipe.on('error', (sourceErr) => {
        log('Error reading source file "%s" during copy: %o', currentInstance._temporaryFileLocation, sourceErr);
        currentInstance._operationIssue = sourceErr;
        actualCompletionHandler(sourceErr);
    });
};

/**
 * Deletes the temporary file associated with this outcome.
 * After deletion, the instance becomes invalid for further file operations.
 * @param {function(Error|null): void} [onDeletionComplete] - Optional callback after deletion attempt.
 */
docOutcomePrototype.performCleanup = function(onDeletionComplete) {
    const currentInstance = this;
    // Ensure callback is a function, provide a no-op fallback
    const cleanupCallback = typeof onDeletionComplete === 'function' ? onDeletionComplete : () => {};

    // Prevent double-deletion or cleanup if already closed or no path is set
    if (currentInstance._isPermanentlyClosed || !currentInstance._temporaryFileLocation) {
        log('Cleanup skipped: instance already closed or no temporary path to clean. State: %o', currentInstance);
        return cleanupCallback(null); // Indicate no error, as cleanup is conceptually done or not needed
    }

    log('Initiating cleanup for temporary file: "%s"', currentInstance._temporaryFileLocation);

    nodeIo.unlink(currentInstance._temporaryFileLocation, (unlinkErr) => {
        if (unlinkErr) {
            log('Failed to delete temporary file "%s": %o', currentInstance._temporaryFileLocation, unlinkErr);
            currentInstance._operationIssue = unlinkErr; // Store the error
            return cleanupCallback(unlinkErr); // Pass the error
        }

        log('Successfully removed temporary file "%s".', currentInstance._temporaryFileLocation);
        // Mark the instance as permanently closed and clear the path
        currentInstance._temporaryFileLocation = '';
        currentInstance._isPermanentlyClosed = true;
        cleanupCallback(null); // Indicate success
    });
};

// Export the main class
module.exports = DocumentProcessingOutcome;