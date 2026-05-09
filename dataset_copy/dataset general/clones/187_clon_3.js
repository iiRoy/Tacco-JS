'use strict';
// This module orchestrates the main application components and their interactions.
angular.module('mainApplication', [
    'mainApplication.uiElements',
    'mainApplication.dataServices',
    'imageProcessor.components'
]);

// This module encapsulates all service-layer logic and data manipulation.
angular.module('mainApplication.dataServices', ['fileUploadIntegration'])
    .controller('AssetManagementController', function($scope, FileTransferService, $httpService, $safeContent) {
        // ViewModel for managing user-uploaded assets.
        $scope.mediaAssets = [{
            // Sample asset from a remote source, demonstrating a complete state.
            'resourceUri': 'https://scontent-a-iad.xx.fbcdn.net/hphotos-prn2/t1.0-9/1151081_10201852161326618_2087299939_n.jpg',
            'assetTitle': 'Remote Test Image',
            'uploadStatus': 'completed',
            'metadata': {
                'source': 'facebook',
                'description': 'A test image loaded from a server URL for display.'
            }
        }, {
            // Sample asset with predefined cropping parameters, indicating a past operation.
            'resourceUri': 'https://scontent-b-iad.xx.fbcdn.net/hphotos-frc3/t31.0-8/416754_3799985799085_1769166011_o.jpg',
            'assetTitle': 'Cropped Example',
            'uploadStatus': 'completed',
            'cropRegion': {
                'xCoord': 0,
                'yCoord': 286,
                'x2Coord': 2046,
                'y2Coord': 971
            }
        }, {
            // Sample asset with rotation applied, showing an edited state.
            'resourceUri': 'https://fbcdn-sphotos-a-a.akamaihd.net/hphotos-ak-ash3/t1.0-9/221754_2045126368696_101105_n.jpg',
            'assetTitle': 'Rotated Photo',
            'uploadStatus': 'completed',
            'rotationAngle': 180
        }, {
            // Sample asset demonstrating both cropping and rotation, a complex edit.
            'resourceUri': 'https://fbcdn-sphotos-a-a.akamaihd.net/hphotos-ak-ash2/t31.0-8/738229_10200191249604863_465734781_o.jpg',
            'assetTitle': 'Combined Edit',
            'uploadStatus': 'completed',
            'cropRegion': {
                'xCoord': 400,
                'yCoord': 9,
                'x2Coord': 821,
                'y2Coord': 667
            },
            'rotationAngle': 90
        }];

        // Configuration object for the file transfer service.
        const transferConfig = {
            targetEndpoint: '/api/v2/asset-upload',
            maxFileSizeMB: 5, // Maximum allowed file size in megabytes.
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'] // Extended allowed types.
        };

        // Initialize the file transfer service instance, binding it to the current scope.
        var assetTransferAgent = $scope.assetUploader = new FileTransferService({
            contextScope: $scope,
            uploadUrl: transferConfig.targetEndpoint
        });

        // Helper function for centralized event logging and status updates.
        function recordTransferEvent(eventName, payload) {
            console.debug(`[AssetTransferAgent] Event: ${eventName}`, payload);
            $scope.lastActivity = { name: eventName, timestamp: new Date(), details: payload };
        }

        // Custom method to handle the actual file upload process, sending base64 data.
        assetTransferAgent.processUploadItem = function(transferItem) {
            // Validate the incoming transfer item.
            if (!transferItem || !transferItem.file || !transferItem.base64Data) {
                console.error("Invalid or incomplete transfer item provided, skipping upload.");
                recordTransferEvent('upload:skipped', { reason: 'invalid item', item: transferItem });
                return;
            }

            const queuedItem = this.queue.find(item => item === transferItem);
            if (!queuedItem) {
                console.warn("Transfer item not found in the processing queue.");
                recordTransferEvent('upload:warn', { reason: 'item not in queue', item: transferItem.file.name });
                return;
            }

            queuedItem.isReadyForTransfer = true; // Mark item as prepared for transfer.

            // Extract base name and extension from the filename.
            let fileNameParts = queuedItem.file.name.split('.');
            let fileExtension = fileNameParts.length > 1 ? fileNameParts.pop() : ''; // Handle files without extension.
            let baseIdentifier = fileNameParts.join('.');

            // Prevent concurrent uploads if the agent is already busy.
            if (this.isTransferInProgress) {
                console.warn("An asset upload is currently active. This item will be processed sequentially.");
                recordTransferEvent('upload:queued', { file: queuedItem.file.name });
                return;
            }

            this.isTransferInProgress = true; // Set status to indicate an ongoing transfer.
            const selfReference = this; // Capture 'this' for use within asynchronous callbacks.

            // Execute the POST request using the injected HTTP service.
            $httpService({
                method: 'POST',
                url: queuedItem.uploadUrl || this.uploadUrl, // Prioritize item-specific URL, fallback to default.
                data: {
                    base64EncodedData: queuedItem.base64Data,
                    assetName: baseIdentifier,
                    mediaType: queuedItem.file.type,
                    fileExtension: fileExtension // Explicitly send the file extension.
                },
                headers: {
                    'Content-Type': 'application/json' // Ensure JSON content type for the payload.
                }
            }).then(function(httpResponse) {
                // Handle successful HTTP response.
                const responseData = httpResponse.data;
                const httpStatusCode = httpResponse.status;
                const simulatedXHR = {
                    responseBody: responseData,
                    statusCode: httpStatusCode,
                    isSimulated: true // Flag for compatibility with original Uploader's XHR object.
                };
                selfReference.emitEvent('transfer:successful', simulatedXHR, queuedItem, responseData);
                selfReference.emitEvent('transfer:completed', simulatedXHR, queuedItem, responseData);
                queuedItem.uploadStatus = 'success';
                queuedItem.remoteAssetId = responseData.assetId || null; // Assume server returns an ID.
            }).catch(function(httpError) {
                // Handle HTTP request errors.
                console.error('Asset transfer encountered an error:', httpError.data);
                const errorResponse = {
                    responseBody: httpError.data,
                    statusCode: httpError.status,
                    isSimulated: true
                };
                selfReference.emitEvent('transfer:failed', errorResponse, queuedItem);
                selfReference.emitEvent('transfer:completed', errorResponse, queuedItem);
                queuedItem.uploadStatus = 'failed';
                $scope.latestError = `Upload for '${queuedItem.file.name}' failed. Status: ${httpError.statusText || httpError.status}.`;
            }).finally(function() {
                selfReference.isTransferInProgress = false; // Always reset transfer status.
            });
        };

        // Add validation rules to the transfer agent's pipeline.

        // Validation Rule 1: Allow only specific image MIME types.
        assetTransferAgent.validationRules.push(function(candidateFile /* File object */ ) {
            if (!candidateFile || !candidateFile.type) {
                recordTransferEvent('validation:fail', { reason: 'missing type', file: candidateFile?.name });
                return false;
            }
            const fileMimeType = candidateFile.type.toLowerCase();
            const allowedTypesSet = new Set(transferConfig.allowedMimeTypes);
            const typeIsValid = allowedTypesSet.has(fileMimeType);

            if (!typeIsValid) {
                recordTransferEvent('validation:fail', { reason: 'unsupported mime type', file: candidateFile.name, type: fileMimeType });
            }
            return typeIsValid;
        });

        // Validation Rule 2: Enforce a maximum file size.
        assetTransferAgent.validationRules.push(function(candidateFile) {
            if (!candidateFile || typeof candidateFile.size === 'undefined') {
                recordTransferEvent('validation:fail', { reason: 'missing size', file: candidateFile?.name });
                return false;
            }
            const maxBytes = transferConfig.maxFileSizeMB * 1024 * 1024;
            const sizeIsValid = candidateFile.size <= maxBytes;

            if (!sizeIsValid) {
                recordTransferEvent('validation:fail', { reason: 'file too large', file: candidateFile.name, sizeKB: (candidateFile.size / 1024).toFixed(2) });
            }
            return sizeIsValid;
        });

        // Register various event listeners for the file transfer agent.
        assetTransferAgent.onAfterFileAdded = function(event, addedItem) {
            recordTransferEvent('FileAdded', { name: addedItem.file.name, size: addedItem.file.size });
            addedItem.uploadStatus = 'pending';
            addedItem.progressValue = 0;
        };

        assetTransferAgent.onFileAddFailure = function(event, failedItem) {
            recordTransferEvent('FileAddFailed', { name: failedItem.file.name, reason: failedItem.errorMessage });
            failedItem.uploadStatus = 'rejected';
            $scope.latestError = `Failed to add file: ${failedItem.file.name}. Reason: ${failedItem.errorMessage}.`;
        };

        assetTransferAgent.onAllFilesAdded = function(event, itemCollection) {
            recordTransferEvent('AllFilesProcessed', { total: itemCollection.length });
        };

        assetTransferAgent.onBeforeTransfer = function(event, itemToTransfer) {
            recordTransferEvent('BeforeTransfer', { name: itemToTransfer.file.name });
            itemToTransfer.uploadStatus = 'transferring';
        };

        assetTransferAgent.onTransferProgress = function(event, item, currentProgress) {
            item.progressValue = currentProgress; // Update item-specific progress.
            recordTransferEvent('TransferProgress', { file: item.file.name, progress: currentProgress });
        };

        assetTransferAgent.onTransferSuccess = function(event, response, item, serverData) {
            recordTransferEvent('TransferSuccess', { file: item.file.name, serverResponse: serverData });
            item.uploadStatus = 'success';
            item.remoteResourcePath = serverData.filePath || null; // Store remote path if provided.
        };

        assetTransferAgent.onTransferCancel = function(event, response, item) {
            recordTransferEvent('TransferCancelled', { file: item.file.name });
            item.uploadStatus = 'cancelled';
        };

        assetTransferAgent.onTransferError = function(event, response, item, serverResponse) {
            recordTransferEvent('TransferError', { file: item.file.name, error: serverResponse, statusCode: response.statusCode });
            item.uploadStatus = 'failed';
            $scope.latestError = `Upload error for '${item.file.name}'. Server says: ${serverResponse?.message || 'Unknown error'}`;
        };

        assetTransferAgent.onTransferComplete = function(event, response, item, serverResponse) {
            recordTransferEvent('TransferFinished', { file: item.file.name, status: item.uploadStatus });
            // Cleanup sensitive data after the transfer attempt (success or failure).
            if (item.base64Data) {
                delete item.base64Data;
            }
        };

        assetTransferAgent.onTotalProgressUpdate = function(event, overallProgress) {
            $scope.overallUploadProgress = overallProgress;
            recordTransferEvent('OverallProgress', overallProgress);
        };

        assetTransferAgent.onAllTransfersCompleted = function(event, finalItems) {
            recordTransferEvent('AllTransfersDone', { count: finalItems.length });
            $scope.isBatchUploadComplete = true;
            // Potentially trigger a UI refresh or a notification to the user.
        };

        // Initialize default scope properties for UI elements.
        $scope.isBatchUploadComplete = false;
        $scope.overallUploadProgress = 0;
        $scope.latestError = '';
        $scope.lastActivity = null;
    });

/**
 * The 'mediaPreviewRender' directive for generating image thumbnails directly in the browser.
 * @author: refactored-dev-team
 * @version: 1.0.1, 2023-11-15
 * This directive takes a file object and optional display dimensions to render a preview.
 */
angular.module('mainApplication.uiElements', [])
    .directive('mediaPreviewRender', ['$windowService',
        function($windowService) {
            // Utility functions for image processing and environment checks.
            const imageRenderToolkit = {
                // Checks if the necessary browser APIs (FileReader, Canvas) are available.
                isEnvironmentSupported: function() {
                    return !!($windowService.FileReader && $windowService.CanvasRenderingContext2D);
                },
                // Verifies if the given input is a valid File API object.
                isValidFileObject: function(input) {
                    return angular.isObject(input) && input instanceof $windowService.File;
                },
                // Determines if the file's MIME type is a recognized image format.
                isRecognizedImage: function(file) {
                    if (!file || !file.type) return false;
                    const supportedImageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp']);
                    return supportedImageMimeTypes.has(file.type.toLowerCase());
                }
            };

            return {
                restrict: 'A', // This directive is used as an attribute.
                template: '<canvas class="image-thumbnail-canvas"></canvas>', // The directive renders a canvas element.
                link: function(elementScope, domElement, elementAttributes) {
                    // Early exit if the browser environment does not support necessary features.
                    if (!imageRenderToolkit.isEnvironmentSupported()) {
                        console.warn('Image preview rendering is not supported in the current browser.');
                        domElement.empty().append('<div class="unsupported-feature-message">Image preview not available</div>');
                        return;
                    }

                    const renderConfiguration = elementScope.$eval(elementAttributes.mediaPreviewRender);

                    // Validate the input file object for rendering.
                    if (!renderConfiguration || !imageRenderToolkit.isValidFileObject(renderConfiguration.sourceFile)) {
                        console.warn('Invalid or missing file object for image preview. Cannot render.');
                        domElement.empty().append('<div class="no-source-file-message">No valid file to preview</div>');
                        return;
                    }
                    if (!imageRenderToolkit.isRecognizedImage(renderConfiguration.sourceFile)) {
                        console.warn('The provided file is not a supported image type for preview.');
                        domElement.empty().append('<div class="unsupported-file-type-message">File type not supported for preview</div>');
                        return;
                    }

                    const canvasDrawingSurface = domElement.find('canvas');
                    const fileContentReader = new $windowService.FileReader();

                    // Event handler for when the file's content (as Data URL) has been loaded.
                    fileContentReader.onload = function(fileLoadEvent) {
                        const imageObject = elementScope.previewImage = new $windowService.Image();
                        imageObject.onload = function() {
                            let calculatedWidth = renderConfiguration.displayDimensions?.width || this.naturalWidth;
                            let calculatedHeight = renderConfiguration.displayDimensions?.height || this.naturalHeight;

                            // Ensure positive and sensible dimensions.
                            if (calculatedWidth <= 0 || calculatedHeight <= 0) {
                                console.warn('Provided display dimensions are invalid; defaulting to 150x150.');
                                calculatedWidth = 150;
                                calculatedHeight = 150;
                            }

                            const imageAspectRatio = this.naturalWidth / this.naturalHeight;

                            // Adjust dimensions to maintain aspect ratio if only one is specified or if both are missing.
                            if (renderConfiguration.displayDimensions?.width && !renderConfiguration.displayDimensions?.height) {
                                calculatedHeight = calculatedWidth / imageAspectRatio;
                            } else if (!renderConfiguration.displayDimensions?.width && renderConfiguration.displayDimensions?.height) {
                                calculatedWidth = calculatedHeight * imageAspectRatio;
                            } else if (!renderConfiguration.displayDimensions?.width && !renderConfiguration.displayDimensions?.height) {
                                // If no dimensions are provided, scale to fit within a default maximum.
                                const defaultMaxDimension = 150;
                                if (this.naturalWidth > this.naturalHeight) {
                                    calculatedWidth = Math.min(this.naturalWidth, defaultMaxDimension);
                                    calculatedHeight = calculatedWidth / imageAspectRatio;
                                } else {
                                    calculatedHeight = Math.min(this.naturalHeight, defaultMaxDimension);
                                    calculatedWidth = calculatedHeight * imageAspectRatio;
                                }
                            }

                            // Round dimensions to avoid fractional pixels for better rendering.
                            calculatedWidth = Math.round(calculatedWidth);
                            calculatedHeight = Math.round(calculatedHeight);

                            // Set the canvas element's attributes.
                            canvasDrawingSurface.attr({
                                width: calculatedWidth,
                                height: calculatedHeight
                            });

                            // Obtain the 2D rendering context and draw the image.
                            const canvasContext = canvasDrawingSurface[0].getContext('2d');
                            if (canvasContext) {
                                canvasContext.drawImage(this, 0, 0, calculatedWidth, calculatedHeight);
                            } else {
                                console.error('Failed to obtain 2D rendering context for canvas element.');
                                domElement.empty().append('<div class="rendering-error-message">Canvas rendering failed</div>');
                            }
                        };
                        imageObject.src = fileLoadEvent.target.result; // Set image source to the loaded Data URL.
                    };

                    // Start reading the file as a Data URL.
                    fileContentReader.readAsDataURL(renderConfiguration.sourceFile);
                }
            };
        }
    ]);