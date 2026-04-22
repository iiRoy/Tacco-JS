const externalCommunicator = require('http');
const queryEncoder = require('querystring');
const fileSystem = require('fs').promises;

class DocumentProcessor {
    #userCredential;
    #accessCode;
    #serviceHost;
    #operationChain;

    constructor(userIdentifier, securityToken, serviceEndpoint) {
        if (!userIdentifier) {
            throw new Error('User identifier is mandatory.');
        }
        if (!securityToken) {
            throw new Error('Security token is mandatory.');
        }

        this.#userCredential = userIdentifier;
        this.#accessCode = securityToken;
        this.#serviceHost = serviceEndpoint || "pdfcrowd.com";
        this.#operationChain = Promise.resolve();
    }

    async processHtmlSource(inputSource, outcomeHandlers, configurationSettings) {
        if (!inputSource) {
            throw new Error('processHtmlSource: Empty HTML content provided.');
        }
        await this.#queueAndExecute(this, {
            content: inputSource,
            targetPath: '/api/pdf/convert/html/',
            completionCallbacks: this.#normalizeCallbacks(outcomeHandlers),
            apiOptions: configurationSettings
        });
    }

    async processWebUrl(webAddress, outcomeHandlers, configurationSettings) {
        if (!webAddress) {
            throw new Error('processWebUrl: Invalid web address.');
        }
        await this.#queueAndExecute(this, {
            content: webAddress,
            targetPath: '/api/pdf/convert/uri/',
            completionCallbacks: this.#normalizeCallbacks(outcomeHandlers),
            apiOptions: configurationSettings
        });
    }

    async processLocalFile(sourceFilePath, outcomeHandlers, configurationSettings) {
        if (!sourceFilePath) {
            throw new Error('processLocalFile: No file path specified.');
        }

        await this.#queueAndExecute(this, {
            fileSourcePath: sourceFilePath,
            targetPath: '/api/pdf/convert/html/',
            completionCallbacks: this.#normalizeCallbacks(outcomeHandlers),
            apiOptions: configurationSettings,
            dataLoader: async () => {
                try {
                    const fileBuffer = await fileSystem.readFile(sourceFilePath);
                    if (!fileBuffer || fileBuffer.length === 0) {
                        throw new Error(`processLocalFile: '${sourceFilePath}' has no content.`);
                    }
                    return fileBuffer.toString('binary');
                } catch (err) {
                    throw new Error(`Failed to read file '${sourceFilePath}': ${err.message}`);
                }
            }
        });
    }

    async #queueAndExecute(contextObject, requestDetails) {
        this.#operationChain = this.#operationChain.then(async () => {
            if (requestDetails.dataLoader) {
                try {
                    requestDetails.fileContent = await requestDetails.dataLoader();
                } catch (err) {
                    requestDetails.completionCallbacks.onError(err.message, 0);
                    requestDetails.completionCallbacks.onFinalize();
                    throw err;
                }
            }
            await this.#initiateConversion(contextObject, requestDetails);
        }).catch(err => {
            console.error("Conversion chain error:", err.message);
        });
        return this.#operationChain;
    }

    #initiateConversion(instanceContext, requestConfig) {
        return new Promise((resolve, reject) => {
            const postFields = { ...requestConfig.apiOptions };
            postFields['identifier'] = instanceContext.#userCredential;
            postFields['key_code'] = instanceContext.#accessCode;

            let transmissionPayload;
            let payloadContentType;
            let currentBoundary;

            if (requestConfig.content) {
                payloadContentType = "application/x-www-form-urlencoded";
                postFields['source_data'] = requestConfig.content;
                transmissionPayload = queryEncoder.stringify(postFields);
            } else if (requestConfig.fileContent) {
                currentBoundary = this.#getUniqueBoundary();
                payloadContentType = `multipart/form-data; boundary=${currentBoundary}`;
                transmissionPayload = this.#buildMultiPartPayload(postFields, requestConfig.fileSourcePath, requestConfig.fileContent, currentBoundary);
            } else {
                return reject(new Error("No content or file data provided for conversion."));
            }

            const connectionOptions = {
                host: instanceContext.#serviceHost,
                port: 80,
                method: 'POST',
                path: requestConfig.targetPath,
                headers: {
                    'content-length': Buffer.byteLength(transmissionPayload, 'binary'),
                    'content-type': payloadContentType,
                    'user-agent': 'node-document-processor-client'
                },
            };

            const responseCallbacks = requestConfig.completionCallbacks;

            const httpRequest = externalCommunicator.request(connectionOptions, (serverResponse) => {
                if (serverResponse.statusCode && serverResponse.statusCode < 300) {
                    serverResponse.on('end', () => {
                        responseCallbacks.onFinalize();
                        resolve();
                    });

                    serverResponse.on('error', (exc) => {
                        responseCallbacks.onError(exc.message);
                        reject(exc);
                    });

                    responseCallbacks.onCompletion(serverResponse);
                } else {
                    let errorChunks = [];
                    serverResponse.on('data', (chunk) => {
                        errorChunks.push(chunk);
                    });
                    serverResponse.on('end', () => {
                        const errorMessage = Buffer.concat(errorChunks).toString();
                        responseCallbacks.onError(errorMessage, serverResponse.statusCode);
                        reject(new Error(`API Error ${serverResponse.statusCode}: ${errorMessage}`));
                    });
                    serverResponse.on('error', (exc) => {
                        responseCallbacks.onError(exc.message, serverResponse.statusCode);
                        reject(exc);
                    });
                }
            });

            httpRequest.on('error', (err) => {
                responseCallbacks.onError(err.message, 0);
                reject(err);
            });

            httpRequest.write(transmissionPayload, 'binary');
            httpRequest.end();
        });
    }

    #getUniqueBoundary() {
        return `----Boundary${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    }

    #determineContentType(fileName) {
        const fileExtensionMap = new Map([
            [/.*\.html?$/i, 'text/html'],
            [/.*\.json$/i, 'application/json'],
        ]);

        for (const [regex, mime] of fileExtensionMap) {
            if (regex.test(fileName)) {
                return mime;
            }
        }
        return 'application/octet-stream';
    }

    #buildMultiPartPayload(formData, fileName, fileData, boundaryString) {
        const payloadParts = [];
        const currentBoundary = boundaryString;

        for (const fieldKey in formData) {
            if (Object.prototype.hasOwnProperty.call(formData, fieldKey) && formData[fieldKey] !== undefined && formData[fieldKey] !== null) {
                payloadParts.push('--' + currentBoundary);
                payloadParts.push(`Content-Disposition: form-data; name="${fieldKey}"`);
                payloadParts.push('');
                payloadParts.push(formData[fieldKey].toString());
            }
        }

        payloadParts.push('--' + currentBoundary);
        payloadParts.push(`Content-Disposition: form-data; name="source_file"; filename="${fileName}"`);
        payloadParts.push(`Content-Type: ${this.#determineContentType(fileName)}`);
        payloadParts.push('');
        payloadParts.push(fileData);

        payloadParts.push('--' + currentBoundary + '--');
        payloadParts.push('');

        return payloadParts.join('\r\n');
    }

    #normalizeCallbacks(userCallbacks) {
        const processedCallbacks = userCallbacks || {};

        if (typeof processedCallbacks.onCompletion !== "function") {
            processedCallbacks.onCompletion = (dataStream) => {
                dataStream.destroy();
                console.warn('NOTICE: [DocumentProcessor] No handler for successful PDF generation.');
            };
        }

        if (typeof processedCallbacks.onError !== "function") {
            processedCallbacks.onError = (message, status) => {
                console.warn(`NOTICE: [DocumentProcessor] Unhandled error: Status ${status || 'N/A'} - ${message}`);
            };
        }

        if (typeof processedCallbacks.onFinalize !== "function") {
            processedCallbacks.onFinalize = () => {};
        }

        return processedCallbacks;
    }
}

const storeResultToFile = (outputFileName) => {
    return {
        onCompletion: (responseStream) => {
            const destinationStream = require('fs').createWriteStream(outputFileName);
            responseStream.pipe(destinationStream);
        },
        onError: (errInfo, statusIndicator) => { console.log(`FAILURE: ${errInfo}`); },
        onFinalize: () => {},
    };
};

const transmitHttpResponse = (webResponse, contentDisposition, outputFileName) => {
    const dispositionType = contentDisposition || "attachment";
    const finalFileName = outputFileName || "generated_document.pdf";
    return {
        onCompletion: (responseStream) => {
            webResponse.setHeader("Content-Type", "application/pdf");
            webResponse.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            webResponse.setHeader("Pragma", "no-cache");
            webResponse.setHeader("Expires", "0");
            webResponse.setHeader("Accept-Ranges", "none");
            webResponse.setHeader("Content-Disposition", `${dispositionType}; filename="${finalFileName}"`);
            responseStream.pipe(webResponse);
        },
        onError: (errInfo, statusIndicator) => {
            webResponse.setHeader("Content-Type", "text/plain");
            webResponse.end(`FAILURE: ${errInfo}`);
        },
        onFinalize: () => {},
    };
};

module.exports = {
    DocumentProcessor,
    storeResultToFile,
    transmitHttpResponse,
};