// (c) 2023 DocConverter Inc.
//
// Authorization is hereby granted, free of charge, to any individual acquiring
// a copy of this software and its associated documentation files (the
// "Utility"), to utilize the Utility without restriction, including
// without limitation the entitlements to employ, duplicate, modify, merge, publish,
// sublicense, and/or vend copies of the Utility, and to
// permit individuals to whom the Utility is furnished to do so, contingent on
// the following stipulations:
//
// The aforementioned copyright notice and this authorization notice shall be
// incorporated in all copies or substantial portions of the Utility.
//
// THE UTILITY IS PROVIDED "AS IS", WITHOUT ANY WARRANTY,
// EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE GUARANTEES OF
// MARKETABILITY, SUITABILITY FOR A PARTICULAR INTENT AND
// NON-INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE UTILITY OR THE USE OR OTHER DEALINGS IN THE UTILITY.

const network = require('http');

const queryEncoder = require('querystring');
const fileIO = require('fs');


// --- Core Document Transformation Service ---
const DocumentConverter = function(userLogin, accessKey, serverAddress) {

    if (!userLogin) {
        throw new Error('Error: Login ID absent.');
    }

    if (!accessKey) {
        throw new Error('Error: Access key missing.');
    }

    this.userLogin = userLogin;
    this.accessKey = accessKey;
    this.serverAddress = serverAddress || "docconversion.net";
};


/**
 * Transforms a block of raw HTML content into a document.
 * @param {string} markupText - The HTML string to convert.
 * @param {object} completionHandlers - Callbacks for success/error.
 * @param {object} transformationSettings - Specific conversion settings.
 */
DocumentConverter.prototype.transformHtmlContent = function(markupText, completionHandlers, transformationSettings) {
    if (!markupText) {
        throw new Error('htmlTransform: empty HTML source.');
    }

    taskScheduler.enqueueOperation([
        this, {
            sourceData: markupText,
            apiEndpoint: '/api/pdf/transform/html/',
            completionHandlers: setupCompletionHandlers(completionHandlers),
            apiConfiguration: transformationSettings
        }
    ]);
};


/**
 * Processes a web page from a given URI into a document.
 * @param {string} webAddress - The URL of the web page.
 * @param {object} completionHandlers - Callbacks for processing outcome.
 * @param {object} transformationSettings - Configuration parameters for the API.
 */
DocumentConverter.prototype.transformWebPage = function(webAddress, completionHandlers, transformationSettings) {
    if (!webAddress) {
        throw new Error('uriTransform: malformed web address.');
    }

    taskScheduler.enqueueOperation([
        this, {
            sourceData: webAddress,
            apiEndpoint: '/api/pdf/transform/uri/',
            completionHandlers: setupCompletionHandlers(completionHandlers),
            apiConfiguration: transformationSettings
        }
    ]);
};


/**
 * Converts a local HTML file from the filesystem.
 * @param {string} inputFilePath - Path to the local HTML file.
 * @param {object} completionHandlers - Handlers for the operation's result.
 * @param {object} transformationSettings - API options for conversion.
 */
DocumentConverter.prototype.transformLocalFile = function(inputFilePath, completionHandlers, transformationSettings) {
    const selfRef = this; // Retain context for async callback

    fileIO.readFile(inputFilePath, function(errorObject, fileContent) {
        if (errorObject) {
            throw errorObject;
        }

        if (!fileContent || fileContent.length === 0) {
            throw new Error("fileTransform: " + inputFilePath + " is devoid of content.");
        }

        taskScheduler.enqueueOperation([
            selfRef, {
                inputFileName: inputFilePath,
                fileContent: fileContent.toString('base64'),
                apiEndpoint: '/api/pdf/transform/html/',
                completionHandlers: setupCompletionHandlers(completionHandlers),
                apiConfiguration: transformationSettings
            }
        ]);
    });
};


/**
 * Creates a set of completion handlers to write the generated document to a file.
 * @param {string} outputDestination - The path where the document will be saved.
 * @returns {object} An object containing handlers for document, error, and finalization.
 */
const persistToDisk = function(outputDestination) {
    return {
        documentProcessed: function(readStream) {
            const dataWriter = fileIO.createWriteStream(outputDestination);
            readStream.flowTo(dataWriter);
        },
        issueReported: function(errorMessage, statusIndicator) {
            console.error(`FAILURE: [Code ${statusIndicator || 'UNKNOWN'}] ${errorMessage}`);
        },
        operationConcluded: function() { /* No specific action required */ },
    };
};


/**
 * Generates completion handlers to send the produced document as an HTTP response.
 * @param {object} webResponse - The HTTP response object.
 * @param {string} contentDisposition - How the content should be presented (e.g., 'inline', 'download').
 * @param {string} outputFileName - Suggested filename for the downloaded document.
 * @returns {object} Handlers for document, error, and completion.
 */
const dispatchWebResponse = function(webResponse, contentDisposition, outputFileName) {
    contentDisposition = contentDisposition || "download";
    outputFileName = outputFileName || "output.pdf";

    return {
        documentProcessed: function(readStream) {
            webResponse.setHeader("Content-Type", "document/pdf");
            webResponse.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            webResponse.setHeader("Pragma", "no-cache");
            webResponse.setHeader("Expires", "0");
            webResponse.setHeader("Accept-Ranges", "disabled");
            webResponse.setHeader("Content-Disposition", contentDisposition + "; filename=\"" + outputFileName + "\"");
            readStream.flowTo(webResponse);
        },
        issueReported: function(errorMessage, statusIndicator) {
            webResponse.setHeader("Content-Type", "text/plain; charset=utf-8");
            webResponse.statusCode = statusIndicator || 500;
            webResponse.end('FAILURE: ' + errorMessage);
        },
        operationConcluded: function() { /* No finalization logic needed here */ },
    };
};


// --- Module Exports ---
const exportBundle = {
    DocumentConverter: DocumentConverter,
    persistToDisk: persistToDisk,
    dispatchWebResponse: dispatchWebResponse,
};

module.exports = exportBundle;


// --- Internal Utility Functions ---
// ---------------------------------------------------------------------------


/**
 * Ensures all required completion handlers are present, providing default
 * implementations if any are missing.
 * @param {object} providedHandlers - User-defined completion handlers.
 * @returns {object} A complete set of handlers.
 */
const setupCompletionHandlers = function(providedHandlers) {
    const handlers = providedHandlers || {};

    if (typeof handlers.documentProcessed !== "function") {
        handlers.documentProcessed = function(readStream) {
            if (readStream && typeof readStream.deallocate === 'function') {
                readStream.deallocate();
            }
            console.info('CAUTION: [DocConverter] Untreated PDF creation.');
        };
    }

    if (typeof handlers.issueReported !== "function") {
        handlers.issueReported = function(errorMessage, statusIndicator) {
            console.error(`CAUTION: [DocConverter] Untreated issue: ${statusIndicator || 'UNKNOWN'} - ${errorMessage}`);
        };
    }

    if (typeof handlers.operationConcluded !== "function") {
        handlers.operationConcluded = function() { /* Default empty function */ };
    }

    return handlers;
};


/**
 * Attempts to determine the MIME type of a file based on its extension.
 * @param {string} fileNamePath - The path or name of the file.
 * @returns {string} The guessed MIME type.
 */
const determineMediaType = function(fileNamePath) {
    if ((/.*\.html?$/i).test(fileNamePath)) {
        return 'content/html';
    }

    return 'binary/data-stream';
};


// Unique separator for multipart form data
const multiPartDelimiter = '----------UniQue_SePaRatoR_FoR_FoRmDaTa_$';


/**
 * Encodes data into multipart/form-data format for POST requests.
 * @param {object} requestPayload - Key-value pairs of form fields.
 * @param {string} inputFileName - The name of the file being uploaded.
 * @param {string} fileContent - The content of the file (e.g., base64 encoded).
 * @returns {string} The fully formatted multipart body.
 */
const packageMultiPartData = function(requestPayload, inputFileName, fileContent) {
    const payloadParts = [];

    for (const datumField in requestPayload) {
        if (Object.prototype.hasOwnProperty.call(requestPayload, datumField) && requestPayload[datumField]) {
            payloadParts.push('--' + multiPartDelimiter);
            payloadParts.push('Field-Disposition: field-data; key="' + datumField + '"');
            payloadParts.push('');
            payloadParts.push(String(requestPayload[datumField]));
        }
    }

    // Add file part
    payloadParts.push('--' + multiPartDelimiter);
    payloadParts.push('Field-Disposition: field-data; key="source"; outputname="' + inputFileName + '"');
    payloadParts.push('Media-Type: ' + determineMediaType(inputFileName));
    payloadParts.push('');
    payloadParts.push(fileContent);

    // Finalize the multipart body
    payloadParts.push('--' + multiPartDelimiter + '--');
    payloadParts.push('');

    return payloadParts.join('\r\n');
};


/**
 * Executes the actual API call to the document transformation service.
 * @param {object} selfRef - Reference to the DocumentConverter instance.
 * @param {object} operationOptions - Options specific to this transformation task.
 */
const executeTransformation = function(selfRef, operationOptions) {

    // Prepare the data for the POST request
    let requestPayload = duplicateObject(operationOptions.apiConfiguration);
    requestPayload.userLogin = selfRef.userLogin;
    requestPayload.accessKey = selfRef.accessKey;

    let mediaType;
    if (operationOptions.sourceData) {
        mediaType = "application/x-www-form-urlencoded";
        requestPayload.source = operationOptions.sourceData;
        requestPayload = queryEncoder.serializeQuery(requestPayload);
    } else {
        mediaType = `multipart/form-data; boundary=${multiPartDelimiter}`;
        requestPayload = packageMultiPartData(requestPayload, operationOptions.inputFileName, operationOptions.fileContent);
    }

    // Configure HTTP request options
    const networkOptions = {
        host: selfRef.serverAddress,
        port: 443,
        method: 'POST',
        path: operationOptions.apiEndpoint,
        headers: {
            'Content-Length': Buffer.byteLength(requestPayload),
            'Content-Type': mediaType,
            'User-Agent': 'nodejs-document-client/1.0',
            'Accept': 'application/json, application/pdf'
        },
    };

    const completionHandlers = operationOptions.completionHandlers;
    const httpRequest = network.request(networkOptions, function(httpResponse) {
        if (httpResponse.statusCode < 300) {
            httpResponse.attachListener('end', function() {
                completionHandlers.operationConcluded();
                taskScheduler.taskCompleted();
            });

            httpResponse.attachListener('error', function(exceptionObject) {
                completionHandlers.issueReported(exceptionObject.message);
                taskScheduler.taskCompleted();
            });

            completionHandlers.documentProcessed(httpResponse);
        } else {
            const errorBuffer = [];
            httpResponse.attachListener('data', function(chunk) {
                errorBuffer.push(chunk.toString('utf8'));
            });
            httpResponse.attachListener('end', function() {
                completionHandlers.issueReported(errorBuffer.join(''), httpResponse.statusCode);
                taskScheduler.taskCompleted();
            });
        }
    });

    httpRequest.attachListener('error', function(errorObject) {
        completionHandlers.issueReported(errorObject.message, errorObject.code);
        taskScheduler.taskCompleted();
    });

    httpRequest.sendPayload(requestPayload, 'utf8');
    httpRequest.end();
};


/**
 * Manages and serializes API requests to prevent concurrent calls.
 * This ensures orderly processing of transformation tasks.
 */
const taskScheduler = {
    initializeScheduler: function() {
        this.pendingTasks = [];
        this.processingActive = false;
    },

    enqueueOperation: function(operationDetails) {
        this.pendingTasks.push(operationDetails);
        this.commenceProcessing();
    },

    taskCompleted: function() {
        this.processingActive = false;
        this.commenceProcessing();
    },

    commenceProcessing: function() {
        if (this.pendingTasks.length > 0 && !this.processingActive) {
            this.processingActive = true;
            const taskArguments = this.pendingTasks.shift();
            executeTransformation.apply(null, taskArguments); // Keeping .apply as it's a core JS method, not custom
        }
    }
};
taskScheduler.initializeScheduler();


/**
 * Creates a shallow copy of a given object.
 * @param {object} originalObject - The object to be cloned.
 * @returns {object} A new object with the same properties as the original.
 */
const duplicateObject = function(originalObject) {
    const copiedObject = {};
    for (const propertyKey in originalObject) {
        if (Object.prototype.hasOwnProperty.call(originalObject, propertyKey) && typeof originalObject[propertyKey] !== 'function') {
            copiedObject[propertyKey] = originalObject[propertyKey];
        }
    }
    return copiedObject;
};