var _ = require('lodash')
    , EventEmitter = require('events').EventEmitter
    , async = require("async")
    , fs = require('fs')
    , path = require('path')
    , os = require('os')
    , util = require('util')
    , parse = require('./parse'); // Custom parser utility

/**
 * Initializes a Amazon S3 Multi part file upload with the given options.
 * This function sets up the necessary parameters for the upload process.
 * @param {object} opts - Configuration options for the upload.
 * @param {function} callback - Callback function to be executed upon completion or error.
 */
function MultiPartUpload(opts, callback) {

    // Validate essential options for the upload to proceed correctly.
    if ( ! opts.client || ! opts.objectName ) {
        throw new Error('MultiPart upload must be created from a client and provide an object name');
    }

    if ( ! opts.stream && ! opts.file ) {
        throw new Error('MultiPart upload must be passed either a stream or file parameter');
    }

    // Prevent conflicting input parameters.
    if ( opts.stream && opts.file ) {
        throw new Error('You cannot provide both a stream and a file to upload');
    }

    // Enforce memory limits for no-disk uploads to prevent excessive memory usage.
    if ( opts.noDisk && opts.partSize && opts.partSize > 10485760 ) {
        throw new Error('Keep in-memory part sizes 10MB or less');
    }

    // Initialize callback if not provided to prevent errors during execution.
    callback = callback || function(err, results) {
        // Default empty callback for handling results or errors silently.
    };

    // Assign configuration options to instance properties.
    this.objectName = opts.objectName;
    this.fileName = opts.file;
    this.headers = opts.headers || {};
    this.client = opts.client;
    this.partSize = opts.partSize || 5242880; // Default part size to 5MB (5 * 1024 * 1024 bytes)
    this.maxRetries = opts.maxRetries || 0; // Default to no retries for failed parts.
    this.uploadId = null; // This will be populated after initiation.
    this.concurrency = opts.batchSize || 4; // Number of parts to upload concurrently.
    this.uploads = async.queue(function(task, callback) { task(callback); }, this.concurrency); // Task queue for managing uploads.
    this.noDisk = opts.noDisk; // Flag to indicate if temporary disk storage should be avoided.
    this.maxUploadSize = opts.maxUploadSize || 1/0; // Maximum total upload size, defaults to infinity.
    this.currentUploadSize = 0; // Tracks the size of data currently being processed for upload.
    this.aborted = false; // Flag to indicate if the upload process has been aborted.
    this.totalUploadSize = 0; // Total size of the file/stream to be uploaded.

    this.size = 0; // Total bytes successfully uploaded and confirmed by S3.
    this.parts = []; // Array to store metadata of successfully uploaded parts.

    // Determine the temporary directory path, falling back to OS default if not specified and disk is used.
    this.tmpDir = !this.noDisk && (opts.tmpDir || os.tmpDir());

    // Reference to the current instance for use within closures.
    var mpu = this,
        written = 0; // Tracks bytes written for progress reporting.

    // Event listener for individual part progress.
    mpu.on('partProgress', function(data) {
        written += data.written; // Accumulate total bytes written.
        mpu.emit('progress', {
            written: written,
            total: mpu.totalUploadSize,
            percent: written / mpu.totalUploadSize * 100 | 0 // Calculate and floor percentage.
        });
    });

    // Recalculate progress if a part fails, as its data might be re-written.
    mpu.on('failed', function(part, partWritten) {
        written = written - partWritten; // Deduct the failed part's written amount.
    });

    // Start the upload process based on whether a stream or file was provided.
    if ( opts.stream ) {
        this._putStream(opts.stream, callback);
    } else {
        this._putFile(opts.file, callback);
    }

}
// Inherit from EventEmitter to allow for custom events.
util.inherits(MultiPartUpload, EventEmitter);

/**
 * Attempts to initiate the MultiPartUpload request (gets the upload ID) from S3.
 * This is the first step in any multipart upload.
 * @param {function} callback - Callback function (err, uploadId).
 */
MultiPartUpload.prototype._initiate = function(callback) {

    // Construct the request to initiate a multipart upload.
    var req = this.client.request('POST', this.objectName + '?uploads', this.headers),
        mpu = this; // Store reference to 'this' for use in callback.

    // Handle the XML response from S3.
    parse.xmlResponse(req, function(err, body) {

        if ( err ) return callback(err); // Propagate any parsing or network errors.
        if ( ! body.UploadId ) return callback('Invalid upload ID'); // Ensure an upload ID was returned.

        mpu.uploadId = body.UploadId; // Store the received UploadId.
        mpu.emit('initiated', body.UploadId); // Emit an event indicating initiation.
        return callback(null, body.UploadId); // Return the UploadId to the caller.
    });

    req.end(); // Send the request to S3.
};

/**
 * Streams a file to S3 using a multipart form upload.
 * Divides the file into separate parts, and then uploads them to Amazon S3.
 * @param {string} file - Path to the file to be uploaded.
 * @param {function} callback - Callback function (err, results).
 */
MultiPartUpload.prototype._putFile = function(file, callback) {
    if ( ! file ) return callback('Invalid file'); // Ensure a file path is provided.

    var mpu = this,
        parts = []; // Array to store details of each file part.

    // Check if the file exists before proceeding.
    fs.exists(file, function(exists) {
        if ( ! exists ) {
            return callback('File does not exist'); // File not found error.
        }

        // Get file statistics to determine size and partition it.
        fs.lstat(file, function (err, stats) {
            var remainingBytes = stats.size;
            var offset = 0;
            mpu.totalUploadSize = stats.size; // Set total upload size.

            // Loop to divide the file into parts of `mpu.partSize`.
            while ( remainingBytes > mpu.partSize ) {
                var partId = parts.length + 1, // Part number (1-indexed).
                    part = {
                        id: partId,
                        fileName: mpu.fileName,
                        offset: offset,
                        length: mpu.partSize,
                        triesLeft: mpu.maxRetries + 1 // Number of retries available for this part.
                    };
                offset += mpu.partSize;
                remainingBytes -= mpu.partSize;
                parts.push(part);
                mpu.uploads.push(mpu._uploadPart.bind(mpu, part)); // Add part to upload queue.
            }
            // Handle the last remaining part, which might be smaller than `mpu.partSize`.
            if ( remainingBytes ) {
                var partId = parts.length + 1,
                    part = {
                        id: partId,
                        fileName: mpu.fileName,
                        offset: offset,
                        length: remainingBytes,
                        triesLeft: mpu.maxRetries + 1
                    };
                parts.push(part);
                mpu.uploads.push(mpu._uploadPart.bind(mpu, part)); // Add final part to queue.
            }

            // Initiate the multipart upload on S3.
            mpu._initiate(function(err, uploadId) {
                if ( err || ! uploadId ) {
                    return callback('Unable to initiate file upload'); // Failed to get upload ID.
                }
                // Once initiated, proceed to complete all queued uploads.
                return mpu._completeUploads(callback);
            });
        });
    });
};

/**
 * Streams a stream to S3 using a multipart form upload.
 * It will attempt to initialize the upload (if not already started), read the stream in,
 * write the stream to a temporary file of the given partSize (or buffer in memory),
 * and then start uploading a part each time a part is available.
 * @param {Stream} stream - The readable stream to upload.
 * @param {function} callback - Callback function (err, results).
 */
MultiPartUpload.prototype._putStream = function(stream, callback) {

    if ( ! stream ) return callback('Invalid stream'); // Ensure a stream object is provided.

    var mpu = this; // Reference to 'this'.

    // If upload not yet initiated, do so.
    if ( ! this.uploadId ) {
        this._initiate(function(err, uploadId) {
            if ( err || ! uploadId ) return callback('Unable to initiate stream upload [' + (err || 'No upload ID') + ']');
        });
    }
    // Begin processing the incoming stream data immediately.
    mpu._handleStream(stream, callback);
};

/**
 * Handles an incoming stream, divides it into parts, and uploads it to S3.
 * This function manages the buffering, temporary file creation, and queuing of parts.
 * @param {Stream} stream - The readable stream.
 * @param {function} callback - Callback function for overall upload status.
 */
MultiPartUpload.prototype._handleStream = function(stream, callback) {

    var mpu = this,
        parts = [], // Local array to manage parts being formed from the stream.
        current; // The part currently being filled.

    // Helper function to create a new part object.
    function newPart() {
        var partId = parts.length + 1,
            // Generate a unique file name for the temporary part file.
            partFileName = path.resolve(path.join(mpu.tmpDir || '', 'mpu-' + mpu.objectName + '-' + random_seed() + '-' + (mpu.uploadId || Date.now()) + '-' + partId)),
            partFile = !mpu.noDisk && fs.createWriteStream(partFileName), // Create write stream if using disk.
            part = {
                id: partId,
                stream: partFile, // Stream for disk-backed parts.
                fileName: partFileName, // Path to the temporary file.
                offset: 0, // Not applicable for stream parts, but kept for consistency.
                length: 0, // Current size of this part.
                triesLeft: mpu.maxRetries + 1,
                data: Buffer('') // Buffer for in-memory parts.
            };

        parts.push(part);
        return part;
    }

    // Helper function to mark a part as ready for upload.
    function partReady(part) {
        if ( ! part ) return;

        // Close the temporary file stream if it exists and is writable.
        if ( part.stream && part.stream.writable ) {
            part.stream.end();
        }
        mpu.uploads.push(mpu._uploadPart.bind(mpu, part)); // Add part to the upload queue.
    }

    // Helper function to abort the upload process.
    function abortUpload(part) {
        // Ensure the current part's stream is closed.
        if ( part && part.stream && part.stream.writable ) {
            part.stream.end();
            // Remove the temporary file if it was created.
            fs.unlink(part.fileName, function(err) {
                if ( err ) return callback(err); // Handle unlink error.
            });
        }

        current = null; // Clear current part.
        mpu.aborted = true; // Set aborted flag.
    }

    // Event listener for incoming data chunks from the stream.
    stream.on('data', function(buffer) {
        // Check if the total upload size exceeds the maximum allowed.
        if ( (mpu.currentUploadSize += buffer.length) > mpu.maxUploadSize ) {
            return abortUpload(current); // Abort if limit exceeded.
        }

        if ( ! current ) {
            current = newPart(); // Create a new part if none is active.
        }

        // Write data to stream (disk) or buffer (memory).
        if ( current.stream ) {
            current.stream.write(buffer);
        } else {
            current.data = Buffer.concat([current.data, buffer]);
        }
        current.length += buffer.length; // Update part length.
        mpu.totalUploadSize += buffer.length; // Update total upload size.

        // If the current part has reached its maximum size, mark it as ready.
        if ( current.length >= mpu.partSize ) {
            partReady(current);
            current = null; // Reset current part to prepare for a new one.
        }
    });

    // Event listener for the end of the stream.
    stream.on('end', function() {
        if ( current ) {
            partReady(current); // Mark the last part as ready, even if partial.
        }

        // Decide whether to complete or abort based on the `aborted` flag.
        if ( mpu.aborted ) {
            return mpu._abortUploads(callback);
        } else {
            return mpu._completeUploads(callback);
        }
    });

    // Event listener for stream errors.
    stream.on('error', function(err) {
        // Clean up and notify the main callback about the error.
        return callback(err);
    });
};

/**
 * Uploads a single part to S3. If the main upload is not yet initiated,
 * it waits for the upload ID before proceeding.
 * @param {object} part - The part object containing its details.
 * @param {function} callback - Callback function (err, result) for this specific part.
 */
MultiPartUpload.prototype._uploadPart = function(part, callback) {

    // If the upload ID isn't available yet, defer this part's upload until 'initiated' event.
    if ( ! this.uploadId ) {
        return this.on('initiated', this._uploadPart.bind(this, part, callback));
    }

    var url = this.objectName + '?partNumber=' + part.id + '&uploadId=' + this.uploadId,
        headers = { 'Content-Length': part.length }, // Content-Length is crucial for S3.
        req = this.client.request('PUT', url, headers),
        // Create a read stream for the part file if using disk.
        partStream = !this.noDisk && fs.createReadStream(part.fileName, {start: part.offset, end: part.offset + part.length - 1}),
        mpu = this, // Reference to 'this'.
        written = 0; // Bytes written for this specific part.

    // Event handler for the response from S3 after part upload.
    req.on('response', function(res) {
        // Handle non-200 status codes as failures.
        // Also check `part.alreadyCB` to prevent multiple callback invocations.
        if ( res.statusCode != 200 && ! part.alreadyCB ) {
            var result = {part: part.id, message: 'Upload failed with status code ' + res.statusCode };
            mpu.emit('failed', result); // Emit failure event.

            // If retries are available, attempt to re-upload the part.
            if ( --part.triesLeft ) {
                return MultiPartUpload.prototype._uploadPart.call(mpu, part, callback);
            }
            // Otherwise, mark as failed and return the error.
            else {
                part.alreadyCB = true;
                return callback(result);
            }
        }

        // If upload was successful, extract ETag and update state.
        var etag = res.headers.etag,
            result = { part: part.id, etag: etag };
        mpu.size += part.length; // Accumulate total successfully uploaded size.
        mpu.parts.push(result); // Add part metadata to the list.

        mpu.emit('uploaded', result); // Emit success event for this part.

        // If temporary files were used, delete the part file.
        if ( ! this.noDisk ) {
            fs.unlink(part.fileName, function(err) {
                // Ensure callback is only called once.
                if ( ! part.alreadyCB ) {
                    part.alreadyCB = true;
                    return callback(err, result);
                }
            });
        } else if ( ! part.alreadyCB ) {
            // For in-memory parts, directly call callback.
            part.alreadyCB = true;
            return callback(null, result);
        }

    });

    // Event handler for request errors during part upload.
    req.on('error', function(err) {
        // If the part was already successfully saved, ignore this error.
        if ( part && part.alreadyCB ) { return; }
        var result = {part: part.id, message: err};
        mpu.emit('failed', result, written); // Emit failure event with written bytes.

        // If retries are available, attempt to re-upload.
        if ( --part.triesLeft ) {
            return MultiPartUpload.prototype._uploadPart.call(mpu, part, callback);
        }
        // Otherwise, mark as failed and return the error.
        else {
            part.alreadyCB = true;
            return callback(result);
        }
    });

    // Pipe the part data to the request.
    if ( ! this.noDisk ) {
        partStream.on('data', function (data) {
            written += data.length; // Track bytes written for this part.
            mpu.emit('partProgress', {
                part: part.id,
                written: data.length,
                overall: written,
                total: part.length,
                percent: written / part.length * 100 | 0
            });
        });
        partStream.pipe(req); // Stream from file to S3.
    } else {
        req.write(part.data); // Write buffered data directly.
        req.end(); // End the request.
    }

    mpu.emit('uploading', part.id); // Emit event indicating a part is being uploaded.
};

/**
 * Indicates that all uploads have been started and that we should wait for completion
 * of all parts before sending the final 'CompleteMultipartUpload' request to S3.
 * @param {function} callback - The final callback for the entire multipart upload.
 */
MultiPartUpload.prototype._completeUploads = function(callback) {

    var mpu = this; // Reference to 'this'.

    // This function is called when the `uploads` queue becomes empty.
    this.uploads.drain = function() {

        // Sort parts by ID and format them into XML for the completion request.
        var parts = _.sortBy(mpu.parts, function(value) { return value.part; });
        parts = _.map(parts, function(value) {
            return util.format('<Part><PartNumber>%d</PartNumber><ETag>%s</ETag></Part>', value.part, value.etag);
        }).join(''); // Join all part XML strings.

        // Create the request to complete the multipart upload.
        var req = mpu.client.request('POST', mpu.objectName + '?uploadId=' + mpu.uploadId);

        // Register the response handler for the completion request.
        parse.xmlResponse(req, function(err, body) {
            if ( err ) return callback(err); // Handle any errors.
            if ( body === null ) return callback('got empty response'); // Empty response is an error.
            delete body.$; // Remove any extraneous properties from the parsed body.
            body.size = mpu.size; // Add the total uploaded size to the result.
            mpu.emit('completed', body); // Emit a 'completed' event.
            return callback(null, body); // Return the final result.
        });

        // Write the XML payload for completing the multipart upload.
        req.write('<CompleteMultipartUpload>' + parts + '</CompleteMultipartUpload>');
        req.end(); // Send the completion request.
    };
};

/**
 * Indicates that upload has been aborted, and sends a 'AbortMultipartUpload'
 * request to S3 to clean up any partially uploaded parts.
 * @param {function} callback - The final callback for the entire multipart upload.
 */
MultiPartUpload.prototype._abortUploads = function(callback) {

    var mpu = this; // Reference to 'this'.

    // This function is called when the `uploads` queue becomes empty after an abort.
    this.uploads.drain = function() {

        // Create a DELETE request to abort the multipart upload.
        var req = mpu.client.request('DELETE', mpu.objectName + '?uploadId=' + mpu.uploadId);

        // Register the response handler.
        parse.xmlResponse(req, function(err, body) {
            if ( err ) return callback(err); // Handle any errors during abort.
            // Even if the abort request itself was successful, the overall operation failed due to size limit.
            return callback('reached maxUploadSize');
        });

        req.end(); // Send the abort request.
    };
};

// Export the MultiPartUpload constructor.
module.exports = MultiPartUpload;

/**
 * Generates a random seed string, similar to UUID generation patterns.
 * Used for creating unique temporary file names.
 * @returns {string} A random hexadecimal string.
 */
function random_seed(){
    return 'xxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}