const hyperTextModule = require('http');
const queryFormatter = require('querystring');
const fileSystem = require('fs');
const pathResolver = require('path');
const { URL } = require('url'); // Explicitly import URL for clarity

// Retain copyright and licensing information
// Copyright (C) 2011,2012 pdfcrowd.com
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/**
 * @class DocumentProcessor
 * @description A client for converting various document sources to a target format via an external API.
 */
class DocumentProcessor {
    /**
     * Constructs a new DocumentProcessor instance.
     * @param {string} userCredential - The unique identifier for the user.
     * @param {string} secretKey - The authentication token for API access.
     * @param {string} [targetHost='api.example.com'] - The API endpoint host.
     * @param {object} [runtimeOptions={}] - Optional runtime configuration.
     */
    constructor(userCredential, secretKey, targetHost = 'api.example.com', runtimeOptions = {}) {
        // Validate core credentials
        if (!userCredential || typeof userCredential !== 'string' || userCredential.trim() === '') {
            throw new Error('User identifier must be provided and non-empty for API access.');
        }
        if (!secretKey || typeof secretKey !== 'string' || secretKey.trim() === '') {
            throw new Error('Authentication token is required and cannot be empty.');
        }

        // Assign instance properties
        this.clientUser = userCredential;
        this.clientSecret = secretKey;
        this.remoteHost = targetHost;

        // Internal configuration for API specifics and logging
        this.apiConfig = {
            version: runtimeOptions.apiVersion || 'v2',
            secureConnection: runtimeOptions.useHttps || false, // Use HTTPS by default if not specified
            requestTimeoutMs: runtimeOptions.requestTimeout || 60000 // Default to 60 seconds
        };

        this.logger = runtimeOptions.logger || console; // Allow custom logger injection
        if (!this.logger.debug) this.logger.debug = this.logger.log; // Ensure debug method exists
    }

    /**
     * Processes raw HTML content for conversion.
     * @param {string} inputHtml - The HTML string to be converted.
     * @param {object} resultHandlers - Callbacks for handling conversion outcomes.
     * @param {object} [transformationOpts={}] - Specific options for the conversion API.
     * @returns {Promise<void>}
     */
    async processHtmlContent(inputHtml, resultHandlers, transformationOpts = {}) {
        if (!inputHtml || typeof inputHtml !== 'string' || inputHtml.trim().length === 0) {
            throw new Error('HTML content for processing cannot be null, undefined, or empty.');
        }

        const effectiveOptions = applyDefaultConversionOptions(transformationOpts);

        const jobDetails = {
            sourceData: inputHtml,
            apiPath: '/transform/document/html/',
            responseCallbacks: prepareResultHandlers(resultHandlers),
            apiSettings: effectiveOptions
        };

        conversionTaskQueue.enqueueOperation([this, jobDetails]);
    }

    /**
     * Transforms a web page identified by its URI.
     * @param {string} resourceUri - The URL of the web page to convert.
     * @param {object} resultHandlers - Callbacks for handling conversion outcomes.
     * @param {object} [transformationOpts={}] - Specific options for the conversion API.
     * @returns {Promise<void>}
     */
    async transformWebResource(resourceUri, resultHandlers, transformationOpts = {}) {
        if (!resourceUri || !isValidWebUrl(resourceUri)) {
            throw new Error('Provided URI is malformed, missing, or not a valid web URL.');
        }

        const effectiveOptions = applyDefaultConversionOptions(transformationOpts);

        const jobDetails = {
            sourceData: resourceUri,
            apiPath: '/transform/document/uri/',
            responseCallbacks: prepareResultHandlers(resultHandlers),
            apiSettings: effectiveOptions
        };

        conversionTaskQueue.enqueueOperation([this, jobDetails]);
    }

    /**
     * Handles conversion of a local HTML file.
     * @param {string} filePath - The path to the local HTML file.
     * @param {object} resultHandlers - Callbacks for handling conversion outcomes.
     * @param {object} [transformationOpts={}] - Specific options for the conversion API.
     * @returns {Promise<void>}
     */
    async handleLocalFile(filePath, resultHandlers, transformationOpts = {}) {
        const currentProcessor = this;

        // Guard clause: Validate file path existence and type
        if (!filePath || typeof filePath !== 'string' || !fileSystem.existsSync(filePath)) {
            const handlers = prepareResultHandlers(resultHandlers);
            handlers.onError(`Local file path "${filePath}" does not exist or is invalid.`, 404);
            return; // Exit early
        }

        try {
            const fileBuffer = await fileSystem.promises.readFile(filePath);
            if (fileBuffer.length === 0) {
                const handlers = prepareResultHandlers(resultHandlers);
                handlers.onError(`File "${filePath}" is empty and cannot be processed.`, 400);
                return;
            }

            const effectiveOptions = applyDefaultConversionOptions(transformationOpts);

            const jobDetails = {
                sourceFilePath: filePath,
                fileContentBinary: fileBuffer.toString('binary'),
                apiPath: '/transform/document/html/',
                responseCallbacks: prepareResultHandlers(resultHandlers),
                apiSettings: effectiveOptions
            };

            conversionTaskQueue.enqueueOperation([currentProcessor, jobDetails]);
        } catch (error) {
            currentProcessor.logger.error(`Error reading local file for conversion: ${error.message}`);
            const handlers = prepareResultHandlers(resultHandlers);
            handlers.onError(`Failed to read source file: ${error.message}`, 500);
        }
    }
}

/**
 * Provides a callback object to save the generated document to a local file.
 * @param {string} outputFileName - The name of the file to save the PDF to.
 * @returns {object} An object containing callback functions.
 */
const persistResult = (outputFileName) => {
    if (!outputFileName || typeof outputFileName !== 'string' || outputFileName.trim() === '') {
        console.error('Invalid output file name provided for persistence. Cannot save.');
        return {
            onPdfData: (stream) => stream.destroy(),
            onError: (msg, code) => console.error(`ERROR: Persistence failed. ${msg} (Status: ${code})`),
            onCompletion: () => {}
        };
    }

    return {
        onPdfData: (incomingStream) => {
            const outputStream = fileSystem.createWriteStream(outputFileName);
            incomingStream.pipe(outputStream);
            outputStream.on('finish', () => console.log(`Document successfully saved to: ${outputFileName}`));
            outputStream.on('error', (err) => console.error(`Error writing document to file: ${err.message}`));
        },
        onError: (errorMessage, statusIndicator) => {
            console.error(`DOCUMENT PERSISTENCE FAILURE: ${errorMessage} [Status Code: ${statusIndicator}]`);
        },
        onCompletion: () => { /* File stream completion handled by 'finish' event */ },
    };
};

/**
 * Provides a callback object to send the generated document as an HTTP response.
 * @param {object} httpResponseObj - The Node.js HTTP response object.
 * @param {string} [contentDispositionType="attachment"] - How the browser should handle the file (e.g., "inline", "attachment").
 * @param {string} [suggestedFileName="document.pdf"] - The suggested filename for the download.
 * @returns {object} An object containing callback functions.
 */
const transmitResponse = (httpResponseObj, contentDispositionType = "attachment", suggestedFileName = "document.pdf") => {
    if (!httpResponseObj || typeof httpResponseObj.setHeader !== 'function' || typeof httpResponseObj.end !== 'function') {
        console.error('Invalid HTTP response object provided for transmission. Cannot send.');
        return {
            onPdfData: (stream) => stream.destroy(),
            onError: (msg, code) => console.error(`ERROR: Transmission failed. ${msg} (Status: ${code})`),
            onCompletion: () => {}
        };
    }

    return {
        onPdfData: (incomingStream) => {
            httpResponseObj.setHeader("Content-Type", "application/pdf");
            httpResponseObj.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            httpResponseObj.setHeader("Pragma", "no-cache");
            httpResponseObj.setHeader("Expires", "0");
            httpResponseObj.setHeader("Accept-Ranges", "bytes");
            httpResponseObj.setHeader("Content-Disposition", `${contentDispositionType}; filename*=UTF-8''${encodeURIComponent(suggestedFileName)}`);
            incomingStream.pipe(httpResponseObj);
            incomingStream.on('error', (err) => {
                console.error(`Stream error during document transmission: ${err.message}`);
                if (!httpResponseObj.headersSent) {
                    httpResponseObj.writeHead(500, { 'Content-Type': 'text/plain' });
                    httpResponseObj.end('Internal server error during document streaming.');
                }
            });
        },
        onError: (failureMessage, statusValue) => {
            if (!httpResponseObj.headersSent) {
                httpResponseObj.writeHead(statusValue || 500, { "Content-Type": "text/plain" });
                httpResponseObj.end(`DOCUMENT PROCESSING FAILED: ${failureMessage}`);
            } else {
                console.error(`Error occurred after headers were sent: ${failureMessage}`);
            }
        },
        onCompletion: () => { /* Response stream completion handled by underlying HTTP module */ },
    };
};

// Export the main class and utility functions
module.exports = {
    DocumentProcessor: DocumentProcessor,
    persistResult: persistResult,
    transmitResponse: transmitResponse,
    isValidWebUrl: isValidWebUrl // Exported for external use
};


// ---------------------------------------------------------------------------
//                                 INTERNAL UTILITIES


/**
 * Validates if a given string is a syntactically correct web URL.
 * @param {string} urlStr - The string to validate.
 * @returns {boolean} True if the string is a valid web URL, false otherwise.
 */
const isValidWebUrl = (urlStr) => {
    try {
        const parsedUrl = new URL(urlStr);
        return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch (e) {
        return false;
    }
};

/**
 * Merges user-provided options with a set of default conversion options.
 * @param {object} userOptions - Options provided by the user.
 * @returns {object} The merged options object.
 */
const applyDefaultConversionOptions = (userOptions) => {
    const defaultConversionSettings = {
        outputFormat: 'pdf',
        scaleFactor: 1.0,
        enableJavaScript: true,
        waitForNetworkIdle: false,
        conversionTimeoutMs: 60000 // 60 seconds
    };
    return { ...defaultConversionSettings, ...userOptions };
};

/**
 * Ensures all required callback handlers are present, providing default implementations if missing.
 * @param {object} inputHandlers - The set of user-defined callback functions.
 * @returns {object} A complete set of callback functions.
 */
const prepareResultHandlers = (inputHandlers) => {
    const handlers = inputHandlers || {};

    // Default handler for successful PDF data stream
    if (typeof handlers.onPdfData !== "function") {
        handlers.onPdfData = (dataStream) => {
            dataStream.destroy();
            console.warn('WARNING: [DocumentProcessor] No specific handler for PDF data provided. Incoming stream destroyed.');
        };
    }

    // Default handler for errors during processing
    if (typeof handlers.onError !== "function") {
        handlers.onError = (errorMessage, statusCode = 500) => {
            console.error(`ERROR: [DocumentProcessor] Unhandled processing error: Status ${statusCode} - ${errorMessage}`);
        };
    }

    // Default handler for overall task completion
    if (typeof handlers.onCompletion !== "function") {
        handlers.onCompletion = () => {
            // console.debug('Processing task completed without specific finalization handler.');
        };
    }

    // Optional handler for progress updates (newly added)
    if (typeof handlers.onProgress !== "function") {
        handlers.onProgress = (progressInfo) => {
            // console.log(`Processing progress: ${JSON.stringify(progressInfo)}`);
        };
    }

    return handlers;
};

/**
 * Determines the MIME type of a file based on its extension.
 * @param {string} resourceIdentifier - The file path or name.
 * @returns {string} The guessed MIME type.
 */
const determineMimeType = (resourceIdentifier) => {
    const fileExtension = pathResolver.extname(resourceIdentifier).toLowerCase();

    switch (fileExtension) {
        case '.html':
        case '.htm':
            return 'text/html';
        case '.xml':
            return 'application/xml';
        case '.css':
            return 'text/css';
        case '.js':
            return 'application/javascript';
        case '.json':
            return 'application/json';
        case '.txt':
            return 'text/plain';
        default:
            return 'application/octet-stream'; // Generic binary data
    }
};

const multipartBoundaryToken = '----DocumentConverterBoundary_v1_ABCDEF0123456789----';

/**
 * Constructs a multipart/form-data body for HTTP POST requests.
 * @param {object} requestPayload - Key-value pairs for form fields.
 * @param {string} sourceFileName - The original filename of the file being uploaded.
 * @param {Buffer|string} fileBinaryContent - The binary content of the file.
 * @returns {string} The formatted multipart body string.
 */
const buildMultipartFormData = (requestPayload, sourceFileName, fileBinaryContent) => {
    let formSegments = [];

    if (!fileBinaryContent) {
        console.warn('Attempting to build multipart form data without any file content. This might lead to an invalid request.');
    }

    for (const dataKey in requestPayload) {
        if (Object.prototype.hasOwnProperty.call(requestPayload, dataKey) && requestPayload[dataKey] !== null && requestPayload[dataKey] !== undefined) {
            formSegments.push(`--${multipartBoundaryToken}`);
            formSegments.push(`Content-Disposition: form-data; name="${dataKey}"`);
            formSegments.push('');
            formSegments.push(requestPayload[dataKey].toString());
        }
    }

    formSegments.push(`--${multipartBoundaryToken}`);
    formSegments.push(`Content-Disposition: form-data; name="src"; filename="${sourceFileName}"`);
    formSegments.push(`Content-Type: ${determineMimeType(sourceFileName)}`);
    formSegments.push('');
    formSegments.push(fileBinaryContent);

    formSegments.push(`--${multipartBoundaryToken}--`);
    formSegments.push(''); // Final trailing newline for standard compliance

    return formSegments.join('\r\n');
};

/**
 * Executes the actual API request to the conversion service.
 * Handles HTTP communication, response parsing, and error management.
 * @param {DocumentProcessor} processorInstance - The instance of the DocumentProcessor class.
 * @param {object} requestOptions - Options detailing the conversion task.
 */
const executeApiRequest = (processorInstance, requestOptions) => {
    if (!processorInstance || !requestOptions) {
        processorInstance.logger.error('Invalid processor instance or request options provided to executeApiRequest.');
        return;
    }

    const apiPayload = copyObjectShallow(requestOptions.apiSettings);
    apiPayload['clientId'] = processorInstance.clientUser;
    apiPayload['secretToken'] = processorInstance.clientSecret;

    let requestBodyData;
    let requestContentType;
    const isFileSubmission = requestOptions.sourceFilePath && requestOptions.fileContentBinary;

    if (!isFileSubmission) {
        requestContentType = "application/x-www-form-urlencoded";
        apiPayload['source'] = requestOptions.sourceData; // Add source data directly to payload
        requestBodyData = queryFormatter.stringify(apiPayload);
    } else {
        requestContentType = `multipart/form-data; boundary=${multipartBoundaryToken}`;
        requestBodyData = buildMultipartFormData(apiPayload, requestOptions.sourceFilePath, requestOptions.fileContentBinary);
    }

    const httpRequestConfig = {
        hostname: processorInstance.remoteHost,
        port: processorInstance.apiConfig.secureConnection ? 443 : 80,
        method: 'POST',
        path: requestOptions.apiPath,
        headers: {
            'Content-Length': Buffer.byteLength(requestBodyData),
            'Content-Type': requestContentType,
            'User-Agent': `Node-DocumentProcessor/${processorInstance.apiConfig.version} (Node.js ${process.version})`
        },
        timeout: requestOptions.apiSettings.conversionTimeoutMs || processorInstance.apiConfig.requestTimeoutMs
    };

    const responseHandlers = requestOptions.responseCallbacks;

    let retryCount = 0;
    const maxRetries = 2; // Allow up to 2 retries for transient issues
    const initialRetryDelay = 1000; // 1 second

    const performHttpRequest = () => {
        const httpClient = processorInstance.apiConfig.secureConnection ? require('https') : hyperTextModule;

        const apiRequest = httpClient.request(httpRequestConfig, (serverResponse) => {
            processorInstance.logger.debug(`API response received for ${httpRequestConfig.path}, Status: ${serverResponse.statusCode}`);

            if (serverResponse.statusCode >= 200 && serverResponse.statusCode < 300) {
                let receivedBytes = 0;
                const totalBytesExpected = serverResponse.headers['content-length'] ? parseInt(serverResponse.headers['content-length'], 10) : undefined;

                serverResponse.on('data', (chunk) => {
                    receivedBytes += chunk.length;
                    responseHandlers.onProgress({
                        stage: 'downloading',
                        bytesReceived: receivedBytes,
                        totalBytes: totalBytesExpected,
                        percentage: totalBytesExpected ? (receivedBytes / totalBytesExpected) * 100 : undefined
                    });
                });

                serverResponse.on('end', () => {
                    responseHandlers.onCompletion();
                    conversionTaskQueue.operationCompleted();
                });

                serverResponse.on('error', (streamError) => {
                    processorInstance.logger.error(`Stream error during API response for ${httpRequestConfig.path}: ${streamError.message}`);
                    responseHandlers.onError(`API response stream error: ${streamError.message}`, 500);
                    conversionTaskQueue.operationCompleted();
                });

                responseHandlers.onPdfData(serverResponse);
            } else {
                let errorDataChunks = [];
                serverResponse.on('data', (chunk) => {
                    errorDataChunks.push(chunk.toString());
                });
                serverResponse.on('end', () => {
                    const fullErrorResponse = errorDataChunks.join('');
                    processorInstance.logger.warn(`API responded with non-success status ${serverResponse.statusCode} for ${httpRequestConfig.path}: ${fullErrorResponse}`);

                    // Implement a simple retry logic for specific transient errors
                    if ((serverResponse.statusCode === 503 || serverResponse.statusCode === 429) && retryCount < maxRetries) { // Service Unavailable or Too Many Requests
                        retryCount++;
                        const delay = initialRetryDelay * Math.pow(2, retryCount - 1); // Exponential backoff
                        processorInstance.logger.log(`Retrying API request (attempt ${retryCount}/${maxRetries}) after ${delay}ms due to status ${serverResponse.statusCode}...`);
                        setTimeout(performHttpRequest, delay);
                    } else {
                        responseHandlers.onError(fullErrorResponse, serverResponse.statusCode);
                        conversionTaskQueue.operationCompleted();
                    }
                });
            }
        });

        apiRequest.on('error', (requestError) => {
            processorInstance.logger.error(`HTTP request to ${httpRequestConfig.hostname}${httpRequestConfig.path} failed: ${requestError.message}`);
            if (retryCount < maxRetries) {
                retryCount++;
                const delay = initialRetryDelay * Math.pow(2, retryCount - 1);
                processorInstance.logger.log(`Retrying API request (attempt ${retryCount}/${maxRetries}) after ${delay}ms due to connection error...`);
                setTimeout(performHttpRequest, delay);
            } else {
                responseHandlers.onError(`Network or connection error: ${requestError.message}`, 500);
                conversionTaskQueue.operationCompleted();
            }
        });

        apiRequest.on('timeout', () => {
            apiRequest.destroy(); // Abort the request on timeout
            processorInstance.logger.error(`API request to ${httpRequestConfig.path} timed out after ${httpRequestConfig.timeout}ms.`);
            responseHandlers.onError(`API request timed out.`, 408); // 408 Request Timeout
            conversionTaskQueue.operationCompleted();
        });

        apiRequest.write(requestBodyData, 'binary');
        apiRequest.end();
    };

    performHttpRequest(); // Initiate the first request
};


/**
 * Manages a global queue of API conversion tasks, ensuring they are processed sequentially.
 */
const conversionTaskQueue = {
    operationsList: [], // Stores pending operations as [processorInstance, taskOptions] tuples
    isProcessingActive: false, // Flag indicating if an operation is currently being processed
    totalOperationsCompleted: 0, // Counter for successfully finished operations
    logger: console, // Internal logger for queue activity

    /**
     * Initializes the queue's state.
     */
    initializeQueue: function() {
        this.operationsList = [];
        this.isProcessingActive = false;
        this.totalOperationsCompleted = 0;
        this.logger.debug('Conversion task queue system initialized.');
    },

    /**
     * Adds a new conversion operation to the queue.
     * @param {Array} operationTuple - An array containing [processorInstance, taskOptions].
     */
    enqueueOperation: function(operationTuple) {
        if (!Array.isArray(operationTuple) || operationTuple.length !== 2 || !(operationTuple[0] instanceof DocumentProcessor)) {
            this.logger.error('Invalid operation tuple provided to enqueueOperation. Must be [DocumentProcessor, taskOptions].');
            return;
        }
        this.operationsList.push(operationTuple);
        this.logger.debug(`Operation enqueued. Current queue size: ${this.operationsList.length}`);
        this.attemptProcessNextOperation();
    },

    /**
     * Signals that the current operation has completed, allowing the next one to start.
     */
    operationCompleted: function() {
        this.isProcessingActive = false;
        this.totalOperationsCompleted++;
        this.logger.debug(`Operation completed. Total handled: ${this.totalOperationsCompleted}. Remaining in queue: ${this.operationsList.length}`);
        this.attemptProcessNextOperation();
    },

    /**
     * Attempts to start the next operation in the queue if the queue is not currently busy.
     */
    attemptProcessNextOperation: function() {
        if (this.operationsList.length > 0 && !this.isProcessingActive) {
            this.isProcessingActive = true;
            const [processorInst, taskOptions] = this.operationsList.shift();
            this.logger.debug(`Starting new operation for API path: ${taskOptions.apiPath}`);
            executeApiRequest(processorInst, taskOptions);
        } else if (this.operationsList.length === 0 && !this.isProcessingActive) {
            this.logger.debug('Conversion queue is currently idle and empty.');
        } else if (this.isProcessingActive) {
            this.logger.debug('Conversion queue is busy, waiting for current operation to finish before starting next.');
        }
    }
};
conversionTaskQueue.initializeQueue(); // Initialize the queue on module load

/**
 * Performs a shallow copy of an object.
 * @param {object} sourceObject - The object to copy.
 * @returns {object} A shallow copy of the source object.
 */
const copyObjectShallow = (sourceObject) => {
    if (sourceObject === null || typeof sourceObject !== 'object') {
        return sourceObject; // Primitives or null are returned as-is
    }
    if (Array.isArray(sourceObject)) {
        return [...sourceObject]; // Shallow copy for arrays
    }
    return { ...sourceObject }; // Shallow copy for plain objects
};