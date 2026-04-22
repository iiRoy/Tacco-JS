var _helper = require('lodash'),
    MessageEmitter = require('events').EventEmitter,
    taskOrchestrator = require("async"),
    diskOps = require('fs'),
    routeUtils = require('path'),
    environ = require('os'),
    commonUtils = require('util'),
    xmlProcessor = require('./parse');

/**
 * Sets up an online file transfer process with the provided configuration parameters.
 */
function ChunkedDataUploader(config, completionHandler) {
    // Validate essential configuration fields
    if (!config.apiClient || !config.destinationIdentifier) {
        throw new Error('Chunked data uploader must be initialized with an API client and a destination name.');
    }

    // Ensure a data source is provided
    if (!config.inputStream && !config.sourceFilePath) {
        throw new Error('Chunked data uploader requires either an input stream or a file path parameter.');
    }

    // Prevent conflicting data sources
    if (config.inputStream && config.sourceFilePath) {
        throw new Error('You cannot provide both an input stream and a file path for upload.');
    }

    // Enforce memory limits for diskless operations
    if (config.inMemoryOnly && config.chunkDimension && config.chunkDimension > 10485760) {
        throw new Error('Keep in-memory chunk sizes 10MB or less.');
    }

    // Default completion handler if not provided
    completionHandler = completionHandler || function(errorStatus, operationResults) {};

    // Assign configuration values to the instance
    this.destinationIdentifier = config.destinationIdentifier;
    this.inputBlobName = config.sourceFilePath;
    this.metadata = config.requestHeaders || {};
    this.serviceConnector = config.apiClient;
    this.segmentSize = config.chunkDimension || 5242880; // Default 5MB segment size
    this.maxAttempts = config.retryLimit || 0;   // No retries by default
    this.transferSessionId = null;
    this.parallelWorkers = config.batchSize || 4;
    // Initialize an asynchronous queue for processing upload tasks
    this.workQueue = taskOrchestrator.queue(function(job, jobDone) { job(jobDone); }, this.parallelWorkers);
    this.disklessMode = config.inMemoryOnly;
    this.overallSizeCap = config.totalDataLimit || 1/0; // Infinite default capacity
    this.accumulatedBytes = 0;
    this.operationCancelled = false;
    this.estimatedTotalBytes = 0;

    this.totalUploadedBytes = 0;
    this.chunkDetails = [];

    // Determine the temporary directory path, if disk-based operations are allowed
    this.scratchDirectory = !this.disklessMode && (config.tempStoragePath || environ.tmpdir());

    var transferAgent = this,
        bytesTransferred = 0;

    // Monitor progress of individual segments
    transferAgent.on('segmentProgress', function(progressData) {        
        bytesTransferred += progressData.outputBytes;
        transferAgent.emit('progressReport', {
            transferred: bytesTransferred,
            totalExpected: transferAgent.estimatedTotalBytes,
            percentage: bytesTransferred / transferAgent.estimatedTotalBytes * 100 | 0
        });
    });

    // Adjust overall progress if a segment fails and needs reprocessing
    transferAgent.on('transferFailed', function(failedSegment, previousBytes) {
        bytesTransferred = bytesTransferred - previousBytes;
    });

    // Route to appropriate handler based on input source
    if (config.inputStream) {
        this._handleStreamSource(config.inputStream, completionHandler);
    } else {
        this._processFileSource(config.sourceFilePath, completionHandler);
    }    

}
// Inherit event emitter capabilities
commonUtils.inherits(ChunkedDataUploader, MessageEmitter);

/**
 * Attempts to initialize the multipart transfer request, obtaining the session ID.
 */
ChunkedDataUploader.prototype._startSession = function(completionHandler) {

    // Send the session initiation request to the service
    var apiRequest = this.serviceConnector.request('POST', this.destinationIdentifier + '?uploads', this.metadata),
        transferAgent = this;

    // Process the XML response from the service
    xmlProcessor.xmlResponse(apiRequest, function(errorStatus, responseBody) {

        if (errorStatus) return completionHandler(errorStatus);
        if (!responseBody.UploadId) return completionHandler('Invalid transfer session ID received.');

        transferAgent.transferSessionId = responseBody.UploadId;
        transferAgent.emit('started', responseBody.UploadId);
        return completionHandler(null, responseBody.UploadId);
    });

    apiRequest.end();
};

/**
 * Processes a local file for segmented transfer to the online service.
 *
 * Divides the file into segments and queues them for uploading.
 */
ChunkedDataUploader.prototype._processFileSource = function(inputBlob, completionHandler) {
    if (!inputBlob) return completionHandler('Invalid input file specified.');

    var transferAgent = this,
        segmentList = [];

    // Check for file existence
    diskOps.exists(inputBlob, function(fileExists) {
        if (!fileExists) {
            return completionHandler('Specified file does not exist.');
        }

        // Get file statistics to determine size and segment allocation
        diskOps.lstat(inputBlob, function (errorStats, fileStats) {
            var remainingDataBytes = fileStats.size;
            var currentOffset = 0;
            transferAgent.estimatedTotalBytes = fileStats.size;
            // Loop to create segments until remaining data is less than segment size
            while (remainingDataBytes > transferAgent.segmentSize) {
                var segmentIndex = segmentList.length + 1,
                    segmentInfo = {
                        id: segmentIndex,
                        inputBlobName: transferAgent.inputBlobName,
                        offset: currentOffset,
                        length: transferAgent.segmentSize,
                        attemptsLeft: transferAgent.maxAttempts + 1
                    };
                currentOffset += transferAgent.segmentSize;
                remainingDataBytes -= transferAgent.segmentSize;
                segmentList.push(segmentInfo);
                transferAgent.workQueue.push(transferAgent._transmitSegment.bind(transferAgent, segmentInfo));
            }
            // Handle the last, potentially smaller, segment
            if (remainingDataBytes) {
                var segmentIndex = segmentList.length + 1,
                    segmentInfo = {
                        id: segmentIndex,
                        inputBlobName: transferAgent.inputBlobName,
                        offset: currentOffset,
                        length: remainingDataBytes,
                        attemptsLeft: transferAgent.maxAttempts + 1
                    };
                segmentList.push(segmentInfo);
                transferAgent.workQueue.push(transferAgent._transmitSegment.bind(transferAgent, segmentInfo));
            }

            // Initiate the overall transfer session
            transferAgent._startSession(function(errorSession, sessionIdentifier) {
                if (errorSession || !sessionIdentifier) {
                    return completionHandler('Unable to initiate file transfer session.');
                }
                // Once all segments are queued and session started, wait for completion
                return transferAgent._finalizeTransfer(completionHandler);
            });
        });
   });
}

/**
 * Handles an incoming data stream for segmented transfer to the online service.
 *
 * Initializes the session (if not already), reads data, writes to temporary storage
 * (or memory), and queues segments as they become ready.
 */
ChunkedDataUploader.prototype._handleStreamSource = function(inputStream, completionHandler) {

    if (!inputStream) return completionHandler('Invalid input stream provided.');

    var transferAgent = this;

    // If session not yet initiated, do so now
    if (!this.transferSessionId) {
        this._startSession(function(errorSession, sessionIdentifier) {
            if (errorSession || !sessionIdentifier) return completionHandler('Unable to initiate stream transfer session [' + errorSession || 'No session ID' + ']');
        });    
    }
    // Begin processing the incoming stream immediately
    transferAgent._manageIncomingStream(inputStream, completionHandler);
};

/**
  Manages an incoming stream, dividing its content into upload segments and dispatching them.
 **/
ChunkedDataUploader.prototype._manageIncomingStream = function(inputStream, completionHandler) {

    var transferAgent = this,
        segmentList = [],
        activeSegment;

    // Function to create a new segment
    function createNewSegment() {
        var segmentIndex = segmentList.length + 1,
            segmentBlobPath = routeUtils.resolve(routeUtils.join(transferAgent.scratchDirectory || '', 'seg-' + transferAgent.destinationIdentifier + '-' + generate_guid_fragment() + '-' + (transferAgent.transferSessionId || Date.now()) + '-' + segmentIndex)),
            segmentDataWriter = !transferAgent.disklessMode && diskOps.createWriteStream(segmentBlobPath),
            segmentDescriptor = {
                id: segmentIndex,
                writer: segmentDataWriter,
                inputBlobName: segmentBlobPath,
                offset: 0,
                length: 0,
                attemptsLeft: transferAgent.maxAttempts + 1,
                dataBuffer: Buffer('')
            };

        segmentList.push(segmentDescriptor);
        return segmentDescriptor;
    }

    // Function to mark a segment as ready for upload
    function prepareSegmentForUpload(segmentDescriptor) {
        if (!segmentDescriptor) return;

        // Ensure the writer stream is closed if it exists
        if (segmentDescriptor.writer && segmentDescriptor.writer.writable) {
            segmentDescriptor.writer.end();
        }
        transferAgent.workQueue.push(transferAgent._transmitSegment.bind(transferAgent, segmentDescriptor));
    }

    // Function to cancel the current upload process
    function haltTransferOperation(segmentDescriptor) {
        // Ensure any active writer stream is closed and temporary file removed
        if (segmentDescriptor && segmentDescriptor.writer.writable) {
            // Close the writer stream
            if (segmentDescriptor.writer.writable) {
                segmentDescriptor.writer.end();
            }

            // Remove the associated temporary file
            diskOps.unlink(segmentDescriptor.inputBlobName, function(removalError) {
                if(removalError) return completionHandler(removalError);
            });
        }

        activeSegment = null;
        transferAgent.operationCancelled = true;
    }

    // Process incoming data chunks from the stream
    inputStream.on('data', function(dataChunk) {
        // Check if exceeding the maximum total data limit
        if((transferAgent.accumulatedBytes += dataChunk.length )> transferAgent.overallSizeCap){
            return haltTransferOperation(activeSegment);
        }

        // Create a new segment if none is active
        if (!activeSegment) {
            activeSegment = createNewSegment();
        }

        // Write data to file or buffer based on diskless mode
        if (activeSegment.writer) {
            activeSegment.writer.write(dataChunk);
        } else {
            activeSegment.dataBuffer = Buffer.concat([activeSegment.dataBuffer, dataChunk]);
        }
        activeSegment.length += dataChunk.length;
        transferAgent.estimatedTotalBytes += dataChunk.length;

        // If the current segment has reached its target size, prepare it for upload
        if (activeSegment.length >= transferAgent.segmentSize) {
            prepareSegmentForUpload(activeSegment);
            activeSegment = null;
        }
    });

    // Handle the end of the input stream
    inputStream.on('end', function() {
        // If there's any data left in the active segment, prepare it
        if (activeSegment) {
            prepareSegmentForUpload(activeSegment);
        }

        // Depending on whether the operation was cancelled, either complete or abort
        if(transferAgent.operationCancelled){
          return transferAgent._cancelTransfer(completionHandler);
        }else{
          return transferAgent._finalizeTransfer(completionHandler);
        }
    });

    // Handle errors occurring in the input stream
    inputStream.on('error', function(streamError) {
        // Clean up resources and report error
        return completionHandler(streamError);
    });    
};

/**
  Transmits a single data segment; if the transfer session isn't initiated, it waits.
 **/
ChunkedDataUploader.prototype._transmitSegment = function(segmentDescriptor, completionHandler) {

    // If the session ID isn't available yet, defer this upload until it is.
    if (!this.transferSessionId) {
        return this.on('started', this._transmitSegment.bind(this, segmentDescriptor, completionHandler));
    }

    var requestUrl = this.destinationIdentifier + '?partNumber=' + segmentDescriptor.id + '&uploadId=' + this.transferSessionId,
        requestMetadata = { 'Content-Length': segmentDescriptor.length },
        uploadRequest = this.serviceConnector.request('PUT', requestUrl, requestMetadata),
        segmentDataReader = !this.disklessMode && diskOps.createReadStream(segmentDescriptor.inputBlobName, {start: segmentDescriptor.offset, end: segmentDescriptor.offset + segmentDescriptor.length - 1}),
        transferAgent = this,
        outputBytes = 0;

    // Process the response from the service after upload attempt
    uploadRequest.on('response', function(serviceResponse) {
        // If a non-success status code is received and callback hasn't been invoked
        if (serviceResponse.statusCode != 200  && !segmentDescriptor.callbackInvoked) {
            var failureDetails = {segment: segmentDescriptor.id, message: 'Upload failed with status code '+serviceResponse.statusCode };
            transferAgent.emit('transferFailed', failureDetails);
            // If retries remain, attempt the upload again
            if (--segmentDescriptor.attemptsLeft) {
                return ChunkedDataUploader.prototype._transmitSegment.call(transferAgent, segmentDescriptor, completionHandler);
            } 
            // Otherwise, report the failure
            else {
                segmentDescriptor.callbackInvoked = true;
                return completionHandler(failureDetails);
            }
        }

        // Extract the ETag from response headers and store segment info
        var etagValue = serviceResponse.headers.etag,
        segmentResult = { segment: segmentDescriptor.id, etag: etagValue };
        transferAgent.totalUploadedBytes += segmentDescriptor.length;
        transferAgent.chunkDetails.push(segmentResult);

        transferAgent.emit('segmentCompleted', segmentResult);

        // If data was temporarily stored on disk, remove the file now
        if (!this.disklessMode) {
            diskOps.unlink(segmentDescriptor.inputBlobName, function(removalError) {
                // Ensure the completion handler is called only once
                if (!segmentDescriptor.callbackInvoked){
                    segmentDescriptor.callbackInvoked = true;
                    return completionHandler(removalError, segmentResult);
                }
            });
        } else if (!segmentDescriptor.callbackInvoked) {
            // Ensure the completion handler is called only once for in-memory uploads
            segmentDescriptor.callbackInvoked = true;
            return completionHandler(null, segmentResult);
        }

    });

    // Handle network or service request errors
    uploadRequest.on('error', function(requestError) {
        // If this segment was already successfully processed, ignore the error
        if (segmentDescriptor && segmentDescriptor.callbackInvoked) {return;}
        var failureDetails = {segment: segmentDescriptor.id, message: requestError};
        transferAgent.emit('transferFailed', failureDetails, outputBytes); // Pass outputBytes for progress adjustment
        // If retries are available, re-attempt
        if (--segmentDescriptor.attemptsLeft) {
            return ChunkedDataUploader.prototype._transmitSegment.call(transferAgent, segmentDescriptor, completionHandler);
        }
        else {
            // Ensure callback is only invoked once            
            segmentDescriptor.callbackInvoked = true;
            return completionHandler(failureDetails);
        }
    });

    // Pipe data to the request, either from disk or directly from buffer
    if (!this.disklessMode) {
        segmentDataReader.on('data', function (readData) {
            outputBytes += readData.length;
            transferAgent.emit('segmentProgress', {
                segment: segmentDescriptor.id,
                outputBytes: readData.length,
                totalSegmentBytes: outputBytes,
                expectedSegmentLength: segmentDescriptor.length,
                segmentPercentage: outputBytes / segmentDescriptor.length * 100 | 0
            });
        });
        segmentDataReader.pipe(uploadRequest);
    } else {
        uploadRequest.write(segmentDescriptor.dataBuffer);
        uploadRequest.end();
    }

    transferAgent.emit('segmentInitiated', segmentDescriptor.id);
};

/**
  Signals that all segments have been dispatched and we should await their finalization.
 **/
ChunkedDataUploader.prototype._finalizeTransfer = function(completionHandler) {

    var transferAgent = this;

    // Set a drain handler for the work queue to trigger completion logic
    this.workQueue.drain = function() {

        // Sort segments by ID and format them for the final completion request
        var orderedSegments = _helper.sortBy(transferAgent.chunkDetails, function(item) { return item.segment; });
        orderedSegments = _helper.map(orderedSegments, function(item) {
            return commonUtils.format('<Part><PartNumber>%d</PartNumber><ETag>%s</ETag></Part>', item.segment, item.etag);
        }).join('');

        // Create the completion request to the service
        var finalRequest = transferAgent.serviceConnector.request('POST', transferAgent.destinationIdentifier + '?uploadId=' + transferAgent.transferSessionId);

        // Register the response handler for the completion request
        xmlProcessor.xmlResponse(finalRequest, function(errorStatus, responseBody) {
            if (errorStatus) return completionHandler(errorStatus);
            if (responseBody === null) return completionHandler('Received empty completion response.');
            delete responseBody.$; // Remove extraneous property if present
            responseBody.finalSize = transferAgent.totalUploadedBytes;
            transferAgent.emit('transferFinished', responseBody);
            return completionHandler(null, responseBody);
        });

        // Write the XML payload for completing the multipart upload
        finalRequest.write('<CompleteMultipartUpload>' + orderedSegments + '</CompleteMultipartUpload>');
        finalRequest.end();
    };
};

/**
  Indicates that the transfer operation has been explicitly cancelled.
 **/
ChunkedDataUploader.prototype._cancelTransfer = function(completionHandler) {

    var transferAgent = this;

    // Set a drain handler for the work queue to trigger abort logic
    this.workQueue.drain = function() {

        // Create the abort request to the service
        var abortRequest = transferAgent.serviceConnector.request('DELETE', transferAgent.destinationIdentifier + '?uploadId=' + transferAgent.transferSessionId);

        // Register the response handler for the abort request
        xmlProcessor.xmlResponse(abortRequest, function(errorStatus, responseBody) {
            if (errorStatus) return completionHandler(errorStatus);
            return completionHandler('Maximum upload size exceeded, transfer cancelled.');
        });

        abortRequest.end();
    };
};

module.exports = ChunkedDataUploader;

// Helper function to generate a pseudo-random fragment for unique identifiers
function generate_guid_fragment(){
    return 'xxxx'.replace(/[xy]/g, function(charPlaceholder) {var randVal = Math.random()*16|0,derivedVal=charPlaceholder=='x'?randVal:randVal&0x3|0x8;return derivedVal.toString(16);});
}