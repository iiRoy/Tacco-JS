const _ = require('lodash');
const EventSystem = require('events').EventEmitter;
const asyncTasks = require("async");
const fileSystem = require('fs');
const pathResolver = require('path');
const systemOS = require('os');
const utility = require('util');
const xmlParser = require('./parse');

/**
 * Orchestrates a multi-part file transfer operation to a remote storage service.
 * This component manages chunking, concurrent uploads, and retry mechanisms.
 */
function RemoteTransferOrchestrator(transferOptions, completionCallback) {
    // Extensive input validation and default value assignments
    if (!transferOptions || !transferOptions.remoteClient || !transferOptions.targetResourceIdentifier) {
        throw new Error('A valid client and a target resource identifier are mandatory for transfer initialization.');
    }

    const hasStreamInput = !!transferOptions.sourceStream;
    const hasFileInput = !!transferOptions.localFilePath;

    if (!hasStreamInput && !hasFileInput) {
        throw new Error('Transfer process requires either a data stream or a local file path as input.');
    }

    if (hasStreamInput && hasFileInput) {
        throw new Error('Simultaneous provision of both a stream and a file for transfer is not permitted.');
    }

    // Introducing a new validation helper function for part size
    const validatePartSize = (size, isNoDisk) => {
        const MAX_IN_MEMORY_PART_SIZE = 10 * 1024 * 1024; // 10MB
        if (isNoDisk && size > MAX_IN_MEMORY_PART_SIZE) {
            throw new Error(`In-memory part segments must not exceed ${MAX_IN_MEMORY_PART_SIZE / (1024 * 1024)}MB.`);
        }
    };

    validatePartSize(transferOptions.segmentSize, transferOptions.noTempStorage);

    // Ensure callback is always a function, even if not provided
    completionCallback = completionCallback || (() => { /* No-op callback */ });

    // Initializing internal state variables
    this.targetObjectName = transferOptions.targetResourceIdentifier;
    this.sourceFilePath = transferOptions.localFilePath;
    this.requestHeaders = transferOptions.metadata || {};
    this.remoteClientInstance = transferOptions.remoteClient;
    this.segmentSize = transferOptions.segmentSize || (5 * 1024 * 1024); // Default to 5MB chunk size
    this.maxRetryAttempts = transferOptions.maxRetries || 1; // Default to 1 retry attempt
    this.activeUploadId = null;
    this.concurrentTransfers = transferOptions.batchConcurrency || 3; // Default concurrency of 3
    this.transferQueue = asyncTasks.queue((taskFn, qCb) => { taskFn(qCb); }, this.concurrentTransfers);
    this.disableTemporaryStorage = transferOptions.noTempStorage;
    this.overallTransferLimit = transferOptions.maxTotalSize || Number.POSITIVE_INFINITY; // Infinite by default
    this.currentBytesTransferred = 0;
    this.operationTerminated = false;
    this.totalSourceBytes = 0; // Renamed from totalUploadSize
    this.collectedSegments = []; // Stores details of successfully uploaded parts
    this.accumulatedSize = 0; // Renamed from 'size'
    this.progressTracker = 0; // New variable to track bytes written for progress events

    // Determine temporary directory usage
    this.tempDirectoryPath = !this.disableTemporaryStorage ? (transferOptions.tempDir || systemOS.tmpdir()) : null;

    const currentProcessor = this;

    // Set up event listeners for progress tracking
    currentProcessor.on('segmentProgress', (dataPayload) => {
        currentProcessor.progressTracker += dataPayload.bytesWritten;
        currentProcessor.emit('transferProgress', {
            bytesProcessed: currentProcessor.progressTracker,
            totalExpected: currentProcessor.totalSourceBytes,
            completionPercentage: Math.floor((currentProcessor.progressTracker / currentProcessor.totalSourceBytes) * 100)
        });
    });

    // Adjust progress if a segment fails and needs to be re-uploaded
    currentProcessor.on('segmentFailure', (failedPart, segmentBytesWritten) => {
        currentProcessor.progressTracker -= segmentBytesWritten;
    });

    // Kick off the appropriate transfer method based on input
    if (transferOptions.sourceStream) {
        this._initiateStreamProcessing(transferOptions.sourceStream, completionCallback);
    } else {
        this._beginFileTransfer(transferOptions.localFilePath, completionCallback);
    }
}

utility.inherits(RemoteTransferOrchestrator, EventSystem);

/**
 * Starts the multi-part upload process by obtaining an upload identifier from the remote service.
 * @param {Function} initiateCb - Callback function to be invoked upon initiation completion.
 */
RemoteTransferOrchestrator.prototype._startUploadProcess = function(initiateCb) {
    const selfRef = this;

    // Constructing the request for upload ID
    const requestObject = this.remoteClientInstance.request('POST', `${this.targetObjectName}?uploads`, this.requestHeaders);

    // Handling the XML response from the service
    xmlParser.xmlResponse(requestObject, (parseError, responseBody) => {
        if (parseError) {
            return initiateCb(parseError);
        }
        if (!responseBody || !responseBody.UploadId) {
            // More specific error message
            return initiateCb(new Error('Failed to retrieve a valid upload identifier from the service.'));
        }

        selfRef.activeUploadId = responseBody.UploadId;
        selfRef.emit('transferInitiated', responseBody.UploadId);
        return initiateCb(null, responseBody.UploadId);
    });

    requestObject.end();
};

/**
 * Manages the transfer of a local file to the remote service using multi-part upload.
 * The file is divided into segments, which are then queued for upload.
 * @param {string} localFile - Path to the local file.
 * @param {Function} transferCb - Callback function for overall transfer completion.
 */
RemoteTransferOrchestrator.prototype._beginFileTransfer = function(localFile, transferCb) {
    if (!localFile || typeof localFile !== 'string') {
        return transferCb(new Error('Invalid local file path provided.'));
    }

    const currentInstance = this;
    const fileSegments = [];

    fileSystem.access(localFile, fileSystem.constants.F_OK, (existsErr) => { // Using fs.access for existence check
        if (existsErr) {
            return transferCb(new Error(`Source file '${localFile}' does not exist or is inaccessible.`));
        }

        fileSystem.stat(localFile, (statError, fileStats) => {
            if (statError) {
                return transferCb(statError);
            }

            let bytesRemaining = fileStats.size;
            let currentOffset = 0;
            currentInstance.totalSourceBytes = fileStats.size;

            // Helper to create and enqueue a segment
            const createAndQueueSegment = (id, startOffset, len) => {
                const segmentDetails = {
                    segmentId: id,
                    sourcePath: currentInstance.sourceFilePath,
                    byteOffset: startOffset,
                    byteLength: len,
                    retryCount: currentInstance.maxRetryAttempts + 1
                };
                fileSegments.push(segmentDetails);
                currentInstance.transferQueue.push(currentInstance._dispatchPartSegment.bind(currentInstance, segmentDetails));
            };

            let partCounter = 0;
            while (bytesRemaining > 0) {
                partCounter++;
                const segmentLen = Math.min(bytesRemaining, currentInstance.segmentSize);
                createAndQueueSegment(partCounter, currentOffset, segmentLen);
                currentOffset += segmentLen;
                bytesRemaining -= segmentLen;
            }

            // Initiate the upload process after all parts are queued
            currentInstance._startUploadProcess((initError, uploadReferenceId) => {
                if (initError || !uploadReferenceId) {
                    currentInstance.emit('error', new Error('Failed to initiate file transfer: ' + (initError ? initError.message : 'No upload ID')));
                    return transferCb(new Error('Failed to initiate file transfer.'));
                }
                // Once all parts are queued and initiation is done, wait for completion
                return currentInstance._finalizeUploadOperation(transferCb);
            });
        });
    });
};

/**
 * Processes an incoming data stream, breaking it into segments and uploading them.
 * This method ensures the upload is initiated before stream data processing begins.
 * @param {Stream} inputDataStream - The readable stream to be uploaded.
 * @param {Function} streamCb - Callback function for stream processing completion.
 */
RemoteTransferOrchestrator.prototype._initiateStreamProcessing = function(inputDataStream, streamCb) {
    if (!inputDataStream || typeof inputDataStream.on !== 'function') {
        return streamCb(new Error('Invalid or unreadable stream provided.'));
    }

    const currentProcessor = this;

    // Check if upload ID is already present, if not, initiate it first
    if (!this.activeUploadId) {
        this._startUploadProcess((initError, uploadReferenceId) => {
            if (initError || !uploadReferenceId) {
                return streamCb(new Error(`Failed to initiate stream transfer: ${initError ? initError.message : 'No upload ID obtained.'}`));
            }
            // Proceed with stream handling once initiation is successful
            currentProcessor._ingestDataStream(inputDataStream, streamCb);
        });
    } else {
        // If already initiated, handle the stream directly
        currentProcessor._ingestDataStream(inputDataStream, streamCb);
    }
};

/**
 * Handles the continuous ingestion of data from a stream, segments it, and queues parts for upload.
 * Manages temporary file creation if disk storage is enabled.
 * @param {Stream} sourceStream - The readable data stream.
 * @param {Function} completionHandler - Callback for the overall stream processing.
 */
RemoteTransferOrchestrator.prototype._ingestDataStream = function(sourceStream, completionHandler) {
    const currentProcessor = this;
    const activeSegments = []; // List of all segments created for this stream
    let currentSegment = null; // The segment currently being filled

    // Helper to generate a unique ID for temporary files
    const generateTempFileId = () => `mpu-temp-${currentProcessor.targetObjectName}-${generateUniqueIdSegment()}-${currentProcessor.activeUploadId || Date.now()}`;

    // Creates and initializes a new part/segment object
    const createNewSegment = () => {
        const segmentIndex = activeSegments.length + 1;
        const tempSegmentFileName = currentProcessor.disableTemporaryStorage ? null : pathResolver.join(currentProcessor.tempDirectoryPath, generateTempFileId() + `-${segmentIndex}.tmp`);
        const segmentWriteStream = !currentProcessor.disableTemporaryStorage ? fileSystem.createWriteStream(tempSegmentFileName) : null;

        const newSegment = {
            segmentId: segmentIndex,
            dataStream: segmentWriteStream,
            temporaryFile: tempSegmentFileName,
            byteOffset: 0, // Not strictly an offset for stream parts, but used for length tracking
            byteLength: 0,
            retryCount: currentProcessor.maxRetryAttempts + 1,
            bufferData: currentProcessor.disableTemporaryStorage ? Buffer.from('') : null // Stores data in memory if no disk
        };

        activeSegments.push(newSegment);
        return newSegment;
    };

    // Marks a segment as ready for upload and queues it
    const segmentReadyForUpload = (segmentToProcess) => {
        if (!segmentToProcess) return;

        // Ensure any associated write stream is closed
        if (segmentToProcess.dataStream && segmentToProcess.dataStream.writable) {
            segmentToProcess.dataStream.end();
        }
        currentProcessor.transferQueue.push(currentProcessor._dispatchPartSegment.bind(currentProcessor, segmentToProcess));
    };

    // Aborts the current upload operation due to an error or limit breach
    const terminateOperation = (segmentToCleanUp) => {
        if (segmentToCleanUp) {
            // If disk-based, close stream and delete temp file
            if (segmentToCleanUp.dataStream && segmentToCleanUp.dataStream.writable) {
                segmentToCleanUp.dataStream.end();
            }
            if (segmentToCleanUp.temporaryFile) {
                fileSystem.unlink(segmentToCleanUp.temporaryFile, (err) => {
                    if (err) currentProcessor.emit('warning', `Failed to delete temporary file: ${segmentToCleanUp.temporaryFile}, Error: ${err.message}`);
                });
            }
        }
        currentSegment = null; // Clear the current segment reference
        currentProcessor.operationTerminated = true;
        sourceStream.destroy(new Error('Transfer operation halted.')); // Stop reading from the source stream
    };

    // Data event handler for the incoming stream
    sourceStream.on('data', (inputBuffer) => {
        // Early exit if operation has been terminated
        if (currentProcessor.operationTerminated) {
            return;
        }

        // Check against the maximum total upload size
        if ((currentProcessor.currentBytesTransferred + inputBuffer.length) > currentProcessor.overallTransferLimit) {
            currentProcessor.emit('limitExceeded', currentProcessor.overallTransferLimit);
            terminateOperation(currentSegment);
            return;
        }

        if (!currentSegment) {
            currentSegment = createNewSegment();
        }

        // Write to stream or buffer based on configuration
        if (currentSegment.dataStream) {
            currentSegment.dataStream.write(inputBuffer);
        } else if (currentSegment.bufferData !== null) {
            currentSegment.bufferData = Buffer.concat([currentSegment.bufferData, inputBuffer]);
        }
        currentSegment.byteLength += inputBuffer.length;
        currentProcessor.totalSourceBytes += inputBuffer.length; // Accumulate total bytes for progress
        currentProcessor.currentBytesTransferred += inputBuffer.length;

        // If current segment reaches its size limit, mark it ready and create a new one
        if (currentSegment.byteLength >= currentProcessor.segmentSize) {
            segmentReadyForUpload(currentSegment);
            currentSegment = null; // Prepare for a new segment
        }
    });

    // End event handler for the incoming stream
    sourceStream.on('end', () => {
        // Process any remaining data in the last segment
        if (currentSegment && currentSegment.byteLength > 0) { // Ensure it's not an empty segment
            segmentReadyForUpload(currentSegment);
        }

        // If the operation was terminated, abort all uploads; otherwise, complete them
        if (currentProcessor.operationTerminated) {
            currentProcessor._cancelActiveTransfers(completionHandler);
        } else {
            currentProcessor._finalizeUploadOperation(completionHandler);
        }
    });

    // Error event handler for the incoming stream
    sourceStream.on('error', (streamErr) => {
        // Clean up and notify of the error
        currentProcessor.emit('streamError', streamErr);
        terminateOperation(currentSegment); // Clean up the current segment
        return completionHandler(streamErr);
    });
};

/**
 * Dispatches a single segment of data for upload to the remote service.
 * Handles retries and temporary file management.
 * @param {object} segmentPayload - Details of the segment to upload.
 * @param {Function} segmentUploadCb - Callback for this specific segment's upload.
 */
RemoteTransferOrchestrator.prototype._dispatchPartSegment = function(segmentPayload, segmentUploadCb) {
    // If upload ID is not yet available, defer this segment's upload until it is.
    if (!this.activeUploadId) {
        return this.on('transferInitiated', () => this._dispatchPartSegment(segmentPayload, segmentUploadCb));
    }

    const selfReference = this;
    const requestUrl = `${this.targetObjectName}?partNumber=${segmentPayload.segmentId}&uploadId=${this.activeUploadId}`;
    const requestHeaders = { 'Content-Length': segmentPayload.byteLength };
    const httpRequest = this.remoteClientInstance.request('PUT', requestUrl, requestHeaders);

    let currentPartStream = null;
    if (!this.disableTemporaryStorage && segmentPayload.temporaryFile) {
        currentPartStream = fileSystem.createReadStream(segmentPayload.temporaryFile, {
            start: segmentPayload.byteOffset,
            end: segmentPayload.byteOffset + segmentPayload.byteLength - 1
        });
    }

    let bytesTransferredForPart = 0; // Tracks bytes for this specific part for progress reporting

    // Response handler for the HTTP request
    httpRequest.on('response', (serviceResponse) => {
        // Introducing a flag to prevent multiple callbacks for the same segment
        if (segmentPayload.callbackInvoked) {
            return;
        }

        if (serviceResponse.statusCode !== 200) {
            const errorDetails = { segment: segmentPayload.segmentId, message: `Remote service returned status code ${serviceResponse.statusCode}` };
            selfReference.emit('segmentFailure', errorDetails, bytesTransferredForPart);

            if (segmentPayload.retryCount > 0) { // Check if retries are available
                segmentPayload.retryCount--;
                selfReference.emit('segmentRetry', segmentPayload.segmentId, segmentPayload.retryCount);
                // Re-queue the part for another attempt
                return RemoteTransferOrchestrator.prototype._dispatchPartSegment.call(selfReference, segmentPayload, segmentUploadCb);
            } else {
                // No retries left, fail this segment
                segmentPayload.callbackInvoked = true;
                return segmentUploadCb(new Error(`Segment ${segmentPayload.segmentId} failed after multiple retries.`));
            }
        }

        // Successfully uploaded segment
        const etagValue = serviceResponse.headers.etag;
        const successResult = { segment: segmentPayload.segmentId, etag: etagValue };
        selfReference.accumulatedSize += segmentPayload.byteLength;
        selfReference.collectedSegments.push(successResult);

        selfReference.emit('segmentUploaded', successResult);

        // Clean up temporary file if applicable
        if (!selfReference.disableTemporaryStorage && segmentPayload.temporaryFile) {
            fileSystem.unlink(segmentPayload.temporaryFile, (unlinkError) => {
                if (unlinkError) {
                    selfReference.emit('warning', `Failed to delete temporary file ${segmentPayload.temporaryFile}: ${unlinkError.message}`);
                }
                if (!segmentPayload.callbackInvoked) {
                    segmentPayload.callbackInvoked = true;
                    return segmentUploadCb(null, successResult);
                }
            });
        } else if (!segmentPayload.callbackInvoked) {
            segmentPayload.callbackInvoked = true;
            return segmentUploadCb(null, successResult);
        }
    });

    // Error handler for the HTTP request
    httpRequest.on('error', (requestError) => {
        if (segmentPayload.callbackInvoked) { // Avoid double-handling if already processed by response handler
            return;
        }

        const errorDetails = { segment: segmentPayload.segmentId, message: requestError.message };
        selfReference.emit('segmentFailure', errorDetails, bytesTransferredForPart);

        if (segmentPayload.retryCount > 0) {
            segmentPayload.retryCount--;
            selfReference.emit('segmentRetry', segmentPayload.segmentId, segmentPayload.retryCount);
            // Re-queue for retry
            return RemoteTransferOrchestrator.prototype._dispatchPartSegment.call(selfReference, segmentPayload, segmentUploadCb);
        } else {
            // Exhausted retries
            segmentPayload.callbackInvoked = true;
            return segmentUploadCb(new Error(`Segment ${segmentPayload.segmentId} failed with network error after retries: ${requestError.message}`));
        }
    });

    // Stream data to the request or write buffer directly
    if (!this.disableTemporaryStorage && currentPartStream) {
        currentPartStream.on('data', (chunk) => {
            bytesTransferredForPart += chunk.length;
            selfReference.emit('segmentProgress', {
                segment: segmentPayload.segmentId,
                bytesWritten: chunk.length,
                totalSegmentBytes: segmentPayload.byteLength,
                segmentCompletion: Math.floor((bytesTransferredForPart / segmentPayload.byteLength) * 100)
            });
        });
        currentPartStream.pipe(httpRequest);
    } else {
        // Direct buffer write for in-memory parts
        if (segmentPayload.bufferData) {
            httpRequest.write(segmentPayload.bufferData);
            bytesTransferredForPart = segmentPayload.bufferData.length; // Assume all written at once
            selfReference.emit('segmentProgress', {
                segment: segmentPayload.segmentId,
                bytesWritten: bytesTransferredForPart,
                totalSegmentBytes: segmentPayload.byteLength,
                segmentCompletion: 100
            });
        }
        httpRequest.end();
    }

    selfReference.emit('segmentQueued', segmentPayload.segmentId);
};

/**
 * Finalizes the multi-part upload by sending the completion request to the remote service.
 * This is called once all individual segments have been successfully uploaded.
 * @param {Function} finalCb - The ultimate callback for the entire transfer operation.
 */
RemoteTransferOrchestrator.prototype._finalizeUploadOperation = function(finalCb) {
    const currentInstance = this;

    // This drain function is called when the async queue is empty
    this.transferQueue.drain = () => {
        const orderedParts = _.sortBy(currentInstance.collectedSegments, (segmentInfo) => segmentInfo.segment);
        const xmlPartsList = orderedParts.map((segmentInfo) => {
            return utility.format('<Part><PartNumber>%d</PartNumber><ETag>%s</ETag></Part>', segmentInfo.segment, segmentInfo.etag);
        }).join('');

        const completeRequest = currentInstance.remoteClientInstance.request('POST', `${currentInstance.targetObjectName}?uploadId=${currentInstance.activeUploadId}`);

        // Register the response handler for the completion request
        xmlParser.xmlResponse(completeRequest, (parseError, responseContent) => {
            if (parseError) {
                currentInstance.emit('uploadError', new Error('Error completing upload: ' + parseError.message));
                return finalCb(parseError);
            }
            if (!responseContent) {
                return finalCb(new Error('Received empty response for completion request.'));
            }
            // Remove the root element property if it exists, similar to original behavior
            if (responseContent.$) {
                delete responseContent.$;
            }
            responseContent.finalSize = currentInstance.accumulatedSize;
            currentInstance.emit('transferCompleted', responseContent);
            return finalCb(null, responseContent);
        });

        // Construct and send the XML payload
        completeRequest.write(`<CompleteMultipartUpload>${xmlPartsList}</CompleteMultipartUpload>`);
        completeRequest.end();
    };
};

/**
 * Aborts an active multi-part upload operation.
 * This sends a cancellation request to the remote service and cleans up.
 * @param {Function} abortCb - Callback for the abortion process.
 */
RemoteTransferOrchestrator.prototype._cancelActiveTransfers = function(abortCb) {
    const currentInstance = this;

    // This drain function is called when the async queue is empty, implying all pending uploads are stopped/failed
    this.transferQueue.drain = () => {
        // If there's no upload ID, nothing to abort on the remote side
        if (!currentInstance.activeUploadId) {
            currentInstance.emit('transferAborted', 'No active upload ID to cancel on remote service.');
            return abortCb(new Error('Operation cancelled locally due to exceeding max size. No remote abort necessary.'));
        }

        const abortRequest = currentInstance.remoteClientInstance.request('DELETE', `${currentInstance.targetObjectName}?uploadId=${currentInstance.activeUploadId}`);

        // Handle the response from the abort request
        xmlParser.xmlResponse(abortRequest, (parseError, responseContent) => {
            if (parseError) {
                currentInstance.emit('abortError', new Error('Failed to send remote abort request: ' + parseError.message));
                // Even if abort fails, we still want to inform the original caller about the reason for abort
                return abortCb(new Error('Transfer cancelled due to size limit, remote abort failed.'));
            }
            currentInstance.emit('transferAborted', 'Remote upload successfully cancelled.');
            return abortCb(new Error('Transfer operation halted as max upload size was exceeded.'));
        });

        abortRequest.end();
    };
};

module.exports = RemoteTransferOrchestrator;

// Renamed and slightly altered utility function
function generateUniqueIdSegment() {
    // Generate a random 8-character hex string
    return 'xxxxxxxx'.replace(/[xy]/g, (char) => {
        const r = Math.random() * 16 | 0;
        const v = char === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}