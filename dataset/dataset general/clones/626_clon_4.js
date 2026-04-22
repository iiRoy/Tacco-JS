const mediaComposer = (function() {
    class VisualProcessor {
        /**
         * Transforms an image element into a compressed Blob.
         * @param {HTMLImageElement} inputElement The source Image Element.
         * @param {number} compressionLevel The output quality (0-100).
         * @param {string} formatType The output format ('jpeg' or 'png').
         * @returns {Promise<Blob>} A Promise resolving with the compressed Blob.
         */
        static async shrinkVisual(inputElement, compressionLevel, formatType) {
            return new Promise((doResolve, doReject) => {
                if (!(inputElement instanceof HTMLImageElement)) {
                    return doReject(new Error("Provided input is not an image element."));
                }
                if (compressionLevel < 0 || compressionLevel > 100) {
                    return doReject(new Error("Compression level must be within 0-100."));
                }

                const outputMime = (formatType === "png") ? "image/png" : "image/jpeg";
                const drawingArea = document.createElement('canvas');
                drawingArea.width = inputElement.naturalWidth;
                drawingArea.height = inputElement.naturalHeight;

                const graphicsModule = drawingArea.getContext("2d");
                graphicsModule.drawImage(inputElement, 0, 0);

                drawingArea.toBlob(
                    (processedBlob) => {
                        if (processedBlob) {
                            doResolve(processedBlob);
                        } else {
                            doReject(new Error("Failed to generate image blob."));
                        }
                    },
                    outputMime,
                    compressionLevel / 100
                );
            });
        }

        /**
         * Dispatches an image object or a Blob to a server endpoint.
         * @param {HTMLImageElement|Blob} inputResource The image element or Blob to upload.
         * @param {string} targetUrl The server URL.
         * @param {string} formFieldName The name for the form field.
         * @param {string} resourceIdentifier The filename for the resource.
         * @param {function} successAction The callback for successful upload.
         * @param {function} [errorAction] The callback for failed upload.
         * @param {function} [progressAction] The callback for upload progress (0-100).
         * @param {object} [customRequestHeaders] Additional headers for the request.
         * @returns {Promise<string>} A Promise resolving with the server's response text.
         */
        static async dispatchPayload(inputResource, targetUrl, formFieldName, resourceIdentifier, successAction, errorAction, progressAction, customRequestHeaders) {
            return new Promise((doResolve, doReject) => {
                let finalBlob;

                const proceedWithUpload = () => {
                    const dataPackage = new FormData();
                    dataPackage.append(formFieldName, finalBlob, resourceIdentifier);

                    const networkRequest = new XMLHttpRequest();
                    networkRequest.open('POST', targetUrl, true);

                    if (customRequestHeaders && typeof customRequestHeaders === "object") {
                        for (const headerKey in customRequestHeaders) {
                            networkRequest.setRequestHeader(headerKey, customRequestHeaders[headerKey]);
                        }
                    }

                    if (progressAction && typeof progressAction === 'function') {
                        networkRequest.upload.onprogress = (evt) => {
                            if (evt.lengthComputable) {
                                progressAction((evt.loaded / evt.total) * 100);
                            }
                        };
                    }

                    networkRequest.onload = () => {
                        if (networkRequest.status >= 200 && networkRequest.status < 300) {
                            if (successAction) {
                                successAction(networkRequest.responseText);
                            }
                            doResolve(networkRequest.responseText);
                        } else {
                            const issueDetails = networkRequest.responseText || `HTTP error! Status: ${networkRequest.status}`;
                            if (errorAction) {
                                errorAction(issueDetails);
                            }
                            doReject(new Error(issueDetails));
                        }
                    };

                    networkRequest.onerror = () => {
                        const issueDetails = "Network communication failed.";
                        if (errorAction) {
                            errorAction(issueDetails);
                        }
                        doReject(new Error(issueDetails));
                    };

                    networkRequest.send(dataPackage);
                };

                if (inputResource instanceof Blob) {
                    finalBlob = inputResource;
                    proceedWithUpload();
                } else if (inputResource instanceof HTMLImageElement) {
                    const drawingArea = document.createElement('canvas');
                    drawingArea.width = inputResource.naturalWidth;
                    drawingArea.height = inputResource.naturalHeight;
                    const graphicsModule = drawingArea.getContext("2d");
                    graphicsModule.drawImage(inputResource, 0, 0);

                    const outputMime = resourceIdentifier.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";

                    drawingArea.toBlob((blob) => {
                        if (!blob) {
                            return doReject(new Error("Failed to create blob for upload."));
                        }
                        finalBlob = blob;
                        proceedWithUpload();
                    }, outputMime);
                } else {
                    return doReject(new Error("Invalid input resource for dispatch."));
                }
            });
        }
    }

    return {
        visualServices: VisualProcessor
    };
})();