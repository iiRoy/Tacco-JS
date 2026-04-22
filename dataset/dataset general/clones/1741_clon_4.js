const hfs = require('node:fs/promises');
const hpath = require('node:path');
const hos = require('node:os');
const { Readable } = require('node:stream');
const fs = require('node:fs'); // For fs.createWriteStream

// --- Custom Event Broadcaster (replacement for EventEmitter) ---
class EventBroadcaster {
    constructor() {
        this.listeners = new Map();
    }
    register(eventName, handler) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }
        this.listeners.get(eventName).add(handler);
    }
    unregister(eventName, handler) {
        if (this.listeners.has(eventName)) {
            this.listeners.get(eventName).delete(handler);
            if (this.listeners.get(eventName).size === 0) {
                this.listeners.delete(eventName);
            }
        }
    }
    notify(eventName, ...args) {
        if (this.listeners.has(eventName)) {
            // Create a copy to prevent issues if listeners modify the set during iteration
            [...this.listeners.get(eventName)].forEach(handler => handler(...args));
        }
    }
}

// --- Custom Concurrent Task Runner (replacement for async.queue) ---
class ConcurrentTaskRunner {
    constructor(maxParallel) {
        this.maxParallel = maxParallel;
        this.activeTasks = 0;
        this.queuedTasks = [];
        this.drainPromise = null;
        this.resolveDrain = null;
    }

    add(taskFn) {
        return new Promise((resolve, reject) => {
            this.queuedTasks.push({ taskFn, resolve, reject });
            this._processQueue();
        });
    }

    _processQueue() {
        while (this.activeTasks < this.maxParallel && this.queuedTasks.length > 0) {
            this.activeTasks++;
            const { taskFn, resolve, reject } = this.queuedTasks.shift();
            
            Promise.resolve(taskFn())
                .then(resolve)
                .catch(reject)
                .finally(() => {
                    this.activeTasks--;
                    this._processQueue(); // Try to process more tasks
                    this._checkDrain();
                });
        }
        this._checkDrain();
    }

    _checkDrain() {
        if (this.activeTasks === 0 && this.queuedTasks.length === 0) {
            if (this.resolveDrain) {
                this.resolveDrain();
                this.drainPromise = null;
                this.resolveDrain = null;
            }
        } else if (!this.drainPromise) {
            this.drainPromise = new Promise(resolve => {
                this.resolveDrain = resolve;
            });
        }
    }

    onDrain() {
        if (this.activeTasks === 0 && this.queuedTasks.length === 0) {
            return Promise.resolve();
        }
        if (!this.drainPromise) {
            this.drainPromise = new Promise(resolve => {
                this.resolveDrain = resolve;
            });
        }
        return this.drainPromise;
    }
}

// --- Minimal XML Parser (for specific S3 responses) ---
const parseS3XmlResponse = (xmlString) => {
    const extractTagValue = (tagName, content) => {
        const match = new RegExp(`<${tagName}>(.*?)</${tagName}>`).exec(content);
        return match ? match[1] : undefined;
    };

    const parsedResult = {};

    parsedResult.UploadId = extractTagValue('UploadId', xmlString);
    parsedResult.Bucket = extractTagValue('Bucket', xmlString);
    parsedResult.Key = extractTagValue('Key', xmlString);
    parsedResult.ETag = extractTagValue('ETag', xmlString);
    parsedResult.Location = extractTagValue('Location', xmlString);

    return parsedResult;
};

// --- Custom S3 HTTP Response Processor (replacement for parse.xmlResponse) ---
const processS3HttpResponse = (httpRequest, completionHandler) => {
    let receivedData = '';
    httpRequest.on('response', (s3Response) => {
        s3Response.on('data', (chunk) => {
            receivedData += chunk.toString();
        });
        s3Response.on('end', () => {
            if (s3Response.statusCode >= 200 && s3Response.statusCode < 300) {
                const parsedBody = parseS3XmlResponse(receivedData);
                completionHandler(null, parsedBody);
            } else {
                completionHandler(new Error(`S3 API error: ${s3Response.statusCode} - ${receivedData}`));
            }
        });
        s3Response.on('error', (err) => {
            completionHandler(err);
        });
    });
    httpRequest.on('error', (err) => { // Request error, not response error
        completionHandler(err);
    });
};

// --- Unique Suffix Generator (replacement for random_seed) ---
const generateUniqueSuffix = () => {
    return 'xxxx-xxxx'.replace(/[xy]/g, (char) => {
        const randomHex = Math.random() * 16 | 0;
        const value = char === 'x' ? randomHex : (randomHex & 0x3 | 0x8);
        return value.toString(16);
    });
};

// --- Main Class (replacement for MultiPartUpload) ---
class CloudFileProcessor extends EventBroadcaster {
    constructor(ingestConfig, completionNotifier) {
        super(); // Initialize EventBroadcaster

        if (!ingestConfig.apiGateway || !ingestConfig.resourceIdentifier) {
            throw new Error('Cloud file processing requires an API gateway and a resource identifier.');
        }
        if (!ingestConfig.dataStream && !ingestConfig.localFilePath) {
            throw new Error('Cloud file processing needs either a data stream or a local file path.');
        }
        if (ingestConfig.dataStream && ingestConfig.localFilePath) {
            throw new Error('Cannot provide both a data stream and a local file path.');
        }
        if (ingestConfig.inMemoryProcessing && ingestConfig.chunkSize && ingestConfig.chunkSize > 10485760) {
            throw new Error('In-memory chunk sizes should be 10MB or less.');
        }

        this.finalizationCallback = completionNotifier || (() => {});

        this.resourceIdentifier = ingestConfig.resourceIdentifier;
        this.localFilePath = ingestConfig.localFilePath;
        this.requestHeaders = ingestConfig.requestHeaders || {};
        this.apiGateway = ingestConfig.apiGateway;
        this.chunkSize = ingestConfig.chunkSize || 5242880; // 5MB default
        this.maxAttemptCount = ingestConfig.maxAttemptCount || 0; // default to no retry
        this.sessionToken = null;
        this.concurrencyLimit = ingestConfig.parallelOperations || 4;
        this.concurrentOperations = new ConcurrentTaskRunner(this.concurrencyLimit);
        this.inMemoryProcessing = ingestConfig.inMemoryProcessing;
        this.maximumPayloadLimit = ingestConfig.maximumPayloadLimit || Infinity;
        this.currentPayloadTotal = 0;
        this.transactionAborted = false;
        this.expectedPayloadTotal = 0;

        this.cumulativeProcessedSize = 0;
        this.processedSegments = []; // Stores {part: id, etag: ETag}

        this.scratchPadLocation = !this.inMemoryProcessing && (ingestConfig.scratchPadLocation || hos.tmpdir());

        let transmittedBytes = 0;

        this.register('segmentProgress', (progressData) => {
            transmittedBytes += progressData.transmitted;
            this.notify('overallProgress', {
                transmitted: transmittedBytes,
                total: this.expectedPayloadTotal,
                percentage: this.expectedPayloadTotal > 0 ? Math.floor(transmittedBytes / this.expectedPayloadTotal * 100) : 0
            });
        });

        this.register('segmentFailure', (failedSegment, bytesWrittenForSegment) => {
            transmittedBytes -= bytesWrittenForSegment;
        });

        if (ingestConfig.dataStream) {
            this.processDataStream(ingestConfig.dataStream, this.finalizationCallback);
        } else {
            this.processLocalFile(ingestConfig.localFilePath, this.finalizationCallback);
        }
    }

    async beginSession() {
        return new Promise((resolve, reject) => {
            const req = this.apiGateway.request('POST', this.resourceIdentifier + '?uploads', this.requestHeaders);
            processS3HttpResponse(req, (err, body) => {
                if (err) return reject(err);
                if (!body.UploadId) return reject(new Error('Invalid session token received'));
                this.sessionToken = body.UploadId;
                this.notify('sessionStarted', body.UploadId);
                resolve(body.UploadId);
            });
            req.end();
        });
    }

    async processLocalFile(filePath, notifier) {
        if (!filePath) return notifier(new Error('Invalid file path.'));

        try {
            const fileStats = await hfs.lstat(filePath);
            this.expectedPayloadTotal = fileStats.size;

            let currentOffset = 0;
            let remaining = fileStats.size;
            let segmentIndex = 1;
            
            while (remaining > 0) {
                const segmentLength = Math.min(this.chunkSize, remaining);
                const segmentDetails = {
                    identifier: segmentIndex++,
                    sourcePath: this.localFilePath,
                    byteOffset: currentOffset,
                    byteLength: segmentLength,
                    remainingAttempts: this.maxAttemptCount + 1
                };
                this.concurrentOperations.add(() => this.dispatchSegment(segmentDetails));
                currentOffset += segmentLength;
                remaining -= segmentLength;
            }

            await this.beginSession();
            this.concurrentOperations.onDrain()
                .then(() => this.finalizeTransaction(notifier))
                .catch(notifier);

        } catch (error) {
            notifier(error);
        }
    }

    async processDataStream(inputDataStream, notifier) {
        if (!inputDataStream) return notifier(new Error('Invalid input stream.'));

        if (!this.sessionToken) {
            try {
                await this.beginSession();
            } catch (err) {
                return notifier(new Error(`Failed to initialize stream processing session: ${err.message}`));
            }
        }
        this.segmentStreamData(inputDataStream, notifier);
    }

    segmentStreamData(inputDataStream, notifier) {
        let currentSegment = null;
        let segmentIndex = 1;
        const temporaryFileStreams = new Map(); // To keep track of open write streams

        const createNewSegment = () => {
            const identifier = segmentIndex++;
            const segmentObject = {
                identifier: identifier,
                byteLength: 0,
                remainingAttempts: this.maxAttemptCount + 1,
                payloadBuffer: this.inMemoryProcessing ? Buffer.alloc(0) : null,
                tempFilePath: null,
                tempFileHandle: null
            };

            if (!this.inMemoryProcessing) {
                segmentObject.tempFilePath = hpath.resolve(hpath.join(this.scratchPadLocation, `cloudproc-${this.resourceIdentifier}-${generateUniqueSuffix()}-${(this.sessionToken || Date.now())}-${identifier}.tmp`));
                segmentObject.tempFileHandle = fs.createWriteStream(segmentObject.tempFilePath);
                temporaryFileStreams.set(identifier, segmentObject.tempFileHandle);
            }
            return segmentObject;
        };

        const signalSegmentReady = (segment) => {
            if (!segment) return;

            if (segment.tempFileHandle && segment.tempFileHandle.writable) {
                segment.tempFileHandle.end();
                temporaryFileStreams.delete(segment.identifier);
            }
            this.concurrentOperations.add(() => this.dispatchSegment(segment));
        };

        const haltProcessing = async (segmentToClean) => {
            if (segmentToClean && segmentToClean.tempFileHandle && segmentToClean.tempFileHandle.writable) {
                segmentToClean.tempFileHandle.end();
                temporaryFileStreams.delete(segmentToClean.identifier);
            }
            if (segmentToClean && segmentToClean.tempFilePath) {
                try {
                    await hfs.unlink(segmentToClean.tempFilePath);
                } catch (err) {
                    console.error(`Error deleting temp file ${segmentToClean.tempFilePath}:`, err);
                }
            }
            this.transactionAborted = true;
            this.concurrentOperations.onDrain()
                .then(() => this.cancelTransaction(notifier))
                .catch(notifier);
        };

        inputDataStream.on('data', (dataChunk) => {
            if (this.transactionAborted) return;

            if ((this.currentPayloadTotal + dataChunk.length) > this.maximumPayloadLimit) {
                inputDataStream.destroy();
                return haltProcessing(currentSegment);
            }

            if (!currentSegment) {
                currentSegment = createNewSegment();
            }

            if (currentSegment.tempFileHandle) {
                currentSegment.tempFileHandle.write(dataChunk);
            } else {
                currentSegment.payloadBuffer = Buffer.concat([currentSegment.payloadBuffer, dataChunk]);
            }
            currentSegment.byteLength += dataChunk.length;
            this.currentPayloadTotal += dataChunk.length;
            this.expectedPayloadTotal += dataChunk.length;

            if (currentSegment.byteLength >= this.chunkSize) {
                signalSegmentReady(currentSegment);
                currentSegment = null;
            }
        });

        inputDataStream.on('end', () => {
            if (this.transactionAborted) {
                return; // haltProcessing already scheduled cancelTransaction
            }
            if (currentSegment) {
                signalSegmentReady(currentSegment);
            }
            this.concurrentOperations.onDrain()
                .then(() => this.finalizeTransaction(notifier))
                .catch(notifier);
        });

        inputDataStream.on('error', (err) => {
            temporaryFileStreams.forEach(stream => stream.end());
            temporaryFileStreams.clear();
            notifier(err);
        });
    }

    async dispatchSegment(segment) {
        if (!this.sessionToken) {
            await new Promise(resolve => this.register('sessionStarted', resolve));
        }

        const executeUpload = async (currentSegment) => {
            const segmentUrl = `${this.resourceIdentifier}?partNumber=${currentSegment.identifier}&uploadId=${this.sessionToken}`;
            const uploadHeaders = { 'Content-Length': currentSegment.byteLength };
            const req = this.apiGateway.request('PUT', segmentUrl, uploadHeaders);
            let segmentTransmittedBytes = 0;

            return new Promise((resolve, reject) => {
                req.on('response', async (s3Response) => {
                    if (s3Response.statusCode >= 200 && s3Response.statusCode < 300) {
                        const etag = s3Response.headers.etag;
                        const result = { part: currentSegment.identifier, etag: etag };
                        this.cumulativeProcessedSize += currentSegment.byteLength;
                        this.processedSegments.push(result);
                        this.notify('segmentUploaded', result);

                        if (!this.inMemoryProcessing && currentSegment.tempFilePath) {
                            try {
                                await hfs.unlink(currentSegment.tempFilePath);
                                resolve(result);
                            } catch (err) {
                                reject(err);
                            }
                        } else {
                            resolve(result);
                        }
                    } else {
                        const errorMsg = `Upload failed for segment ${currentSegment.identifier} with status ${s3Response.statusCode}`;
                        this.notify('segmentFailure', { part: currentSegment.identifier, message: errorMsg }, segmentTransmittedBytes);
                        if (--currentSegment.remainingAttempts) {
                            setTimeout(() => this.concurrentOperations.add(() => this.dispatchSegment(currentSegment)).then(resolve).catch(reject), 1000);
                        } else {
                            reject(new Error(errorMsg));
                        }
                    }
                });

                req.on('error', (err) => {
                    this.notify('segmentFailure', { part: currentSegment.identifier, message: err.message }, segmentTransmittedBytes);
                    if (--currentSegment.remainingAttempts) {
                        setTimeout(() => this.concurrentOperations.add(() => this.dispatchSegment(currentSegment)).then(resolve).catch(reject), 1000);
                    } else {
                        reject(err);
                    }
                });

                if (!this.inMemoryProcessing && currentSegment.sourcePath) {
                    const fileReadStream = fs.createReadStream(currentSegment.sourcePath, {
                        start: currentSegment.byteOffset,
                        end: currentSegment.byteOffset + currentSegment.byteLength - 1
                    });
                    fileReadStream.on('data', (data) => {
                        segmentTransmittedBytes += data.length;
                        this.notify('segmentProgress', {
                            part: currentSegment.identifier,
                            transmitted: data.length,
                            totalForSegment: currentSegment.byteLength,
                            percentage: Math.floor(segmentTransmittedBytes / currentSegment.byteLength * 100)
                        });
                    });
                    fileReadStream.pipe(req);
                } else if (!this.inMemoryProcessing && currentSegment.tempFilePath) {
                    const tempFileReadStream = fs.createReadStream(currentSegment.tempFilePath);
                    tempFileReadStream.on('data', (data) => {
                        segmentTransmittedBytes += data.length;
                        this.notify('segmentProgress', {
                            part: currentSegment.identifier,
                            transmitted: data.length,
                            totalForSegment: currentSegment.byteLength,
                            percentage: Math.floor(segmentTransmittedBytes / currentSegment.byteLength * 100)
                        });
                    });
                    tempFileReadStream.pipe(req);
                } else {
                    req.write(currentSegment.payloadBuffer);
                    segmentTransmittedBytes = currentSegment.byteLength;
                    this.notify('segmentProgress', {
                        part: currentSegment.identifier,
                        transmitted: segmentTransmittedBytes,
                        totalForSegment: currentSegment.byteLength,
                        percentage: 100
                    });
                    req.end();
                }
                this.notify('segmentDispatching', currentSegment.identifier);
            });
        };

        return executeUpload(segment);
    }

    async finalizeTransaction(notifier) {
        try {
            await this.concurrentOperations.onDrain();

            const sortedSegments = [...this.processedSegments].sort((a, b) => a.part - b.part);
            const xmlParts = sortedSegments.map(segment =>
                `<Part><PartNumber>${segment.part}</PartNumber><ETag>${segment.etag}</ETag></Part>`
            ).join('');

            const completeUploadXml = `<CompleteMultipartUpload>${xmlParts}</CompleteMultipartUpload>`;
            const req = this.apiGateway.request('POST', `${this.resourceIdentifier}?uploadId=${this.sessionToken}`);

            processS3HttpResponse(req, (err, body) => {
                if (err) return notifier(err);
                if (body === null) return notifier(new Error('Empty response received during finalization.'));
                body.finalSize = this.cumulativeProcessedSize;
                this.notify('transactionCompleted', body);
                notifier(null, body);
            });

            req.write(completeUploadXml);
            req.end();
        } catch (error) {
            notifier(error);
        }
    }

    async cancelTransaction(notifier) {
        try {
            await this.concurrentOperations.onDrain();

            const req = this.apiGateway.request('DELETE', `${this.resourceIdentifier}?uploadId=${this.sessionToken}`);
            processS3HttpResponse(req, (err, body) => {
                if (err) return notifier(err);
                notifier(new Error('Transaction cancelled due to exceeding maximum payload limit.'));
            });
            req.end();
        } catch (error) {
            notifier(error);
        }
    }
}

module.exports = CloudFileProcessor;