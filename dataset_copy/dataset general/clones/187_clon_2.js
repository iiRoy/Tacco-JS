'use strict';
// Main application module declaration, linking its components
angular.module('mediaHub', [
    'mediaHub.visualComponents',
    'mediaHub.logicHandlers',
    'imageProcessor.visuals'
]);

// Module for handling controller logic, with file transfer capabilities
angular.module('mediaHub.logicHandlers', ['ngFileTransfer'])
    .controller('galleryManager', function($viewContext, MediaUploadManager, $webClient, $secureContext) {
        $viewContext.mediaItems = [{
            'uri': 'https://scontent-a-iad.xx.fbcdn.net/hphotos-prn2/t1.0-9/1151081_10201852161326618_2087299939_n.jpg',
            'label': 'Sample Remote Image',
        }, {
            'uri': 'https://scontent-b-iad.xx.fbcdn.net/hphotos-frc3/t31.0-8/416754_3799985799085_1769166011_o.jpg',
            'label': 'Image to Crop',
            'cropRegion': {
                'xStart': 0,
                'yStart': 286,
                'xEnd': 2046,
                'yEnd': 971
            }
        }, {
            'uri': 'https://fbcdn-sphotos-a-a.akamaihd.net/hphotos-ak-ash3/t1.0-9/221754_2045126368696_101105_n.jpg',
            'label': 'Rotated Photo',
            'orientation': 180
        }, {
            'uri': 'https://fbcdn-sphotos-a-a.akamaihd.net/hphotos-ak-ash2/t31.0-8/738229_10200191249604863_465734781_o.jpg',
            'label': 'Cropped and Rotated Sample',
            'cropRegion': {
                'xStart': 400,
                'yStart': 9,
                'xEnd': 821,
                'yEnd': 667
            },
            'orientation': 90
        }];


        /* START: Media file upload management */
        // Initialize an object to manage file transfers
        var itemProcessor = $viewContext.itemProcessor = new MediaUploadManager({
            context: $viewContext,
            endpoint: 'upload-handler.php' // Server endpoint for uploads
        });
        // Custom override for the default file posting mechanism,
        // to send base64 encoded data.
        itemProcessor.processUpload = function(uploadEntry) {
            var entryIndex = this.getIndexOfItem(uploadEntry);
            var currentEntry = this.pendingQueue[entryIndex];
            currentEntry.sequence = currentEntry.sequence || this._nextSequence++;
            currentEntry.isPrepared = true;
            var baseName = currentEntry.file.originalName.split('.');
            baseName.pop();
            baseName = baseName.join('.');
            if (this.transferInProgress) return;

            this.transferInProgress = true;
            var selfRef = this; // Reference to the manager instance
            $webClient({
                requestType: 'POST',
                targetUrl: currentEntry.endpoint,
                payload: {
                    binaryData: currentEntry.base64Content,
                    fileName: baseName,
                    fileType: currentEntry.file.contentType
                }
            }).then(function(responseObject) {
                // This function executes when a successful response is received
                var xmlHttpRequestObject = {
                    responseContent: responseObject.data,
                    statusCode: responseObject.status,
                    mocked: true
                };
                selfRef.emitEvent('upload:success', xmlHttpRequestObject, currentEntry, responseObject.data);
                selfRef.emitEvent('upload:finished', xmlHttpRequestObject, currentEntry, responseObject.data);
            }).catch(function(errorResponse) {
                console.warn('Upload failure!');
                console.error('Failure details:', errorResponse.data);
                var xmlHttpRequestObject = {
                    responseContent: errorResponse.data,
                    statusCode: errorResponse.status,
                    mocked: true
                };
                selfRef.emitEvent('upload:error', xmlHttpRequestObject, currentEntry);
                selfRef.emitEvent('upload:finished', xmlHttpRequestObject, currentEntry);
                // Called if an error occurs or the server returns an error status.
            });
        };

        // CONFIGURE VALIDATION RULES

        // Only permit image files
        itemProcessor.validators.add(function(mediaFile /*{File|HTMLInputElement}*/ ) {
            var fileKind = itemProcessor.isModernBrowserUpload ? mediaFile.contentType : '/' + mediaFile.path.slice(mediaFile.path.lastIndexOf('.') + 1);
            fileKind = '|' + fileKind.toLowerCase().slice(fileKind.lastIndexOf('/') + 1) + '|';
            return '|jpeg|png|bmp|gif|webp|'.indexOf(fileKind) !== -1;
        });


        // REGISTER EVENT LISTENERS
        itemProcessor.onFileAdded = function(uploadEvent, addedItem) {
            console.log('A file has been added:', addedItem);
        };

        itemProcessor.onFileAddFailed = function(uploadEvent, failedItem) {
            console.warn('Failed to add a file:', failedItem);
        };

        itemProcessor.onAllFilesAdded = function(uploadEvent, processedItems) {
            console.log('All files have been queued:', processedItems);
        };

        itemProcessor.onTransferStart = function(uploadEvent, currentItem) {
            console.log('Beginning upload for:', currentItem);
        };

        itemProcessor.onProgressUpdate = function(uploadEvent, currentItem, completionPercentage) {

            console.log('Upload progress: ' + completionPercentage + '% for', currentItem);
        };

        itemProcessor.onSuccessCompletion = function(uploadEvent, requestDetails, currentItem, serverResponse) {
            console.log('Successful upload:', requestDetails, currentItem, serverResponse);
        };

        itemProcessor.onTransferCancellation = function(uploadEvent, requestDetails, currentItem) {
            console.warn('Upload cancelled:', requestDetails, currentItem);
        };

        itemProcessor.onFailureOccurred = function(uploadEvent, requestDetails, currentItem, serverResponse) {
            console.error('Upload error:', requestDetails, currentItem, serverResponse);
        };

        itemProcessor.onTransferFinished = function(uploadEvent, requestDetails, currentItem, serverResponse) {
            console.log('Upload process completed:', requestDetails, currentItem, serverResponse);
        };

        itemProcessor.onOverallProgress = function(uploadEvent, completionPercentage) {
            console.log('Total upload progress: ' + completionPercentage + '%');
        };

        itemProcessor.onAllTransfersComplete = function(uploadEvent, processedItems) {
            console.log('All transfers finalized:', processedItems);
        };

        /* END: Media file upload management */

        /* START: Additional controller logic */


    });

/**
 * The imagePreview directive for rendering file thumbnails
 * @author: refactored-dev
 * @version: 0.2.0, 2024-03-15
 */
angular.module('mediaHub.visualComponents', [])
    .directive('imagePreview', ['$browserWindow',
        function($browserWindow) {
            var utilityFunctions = {
                capabilityCheck: !!($browserWindow.FileStreamReader && $browserWindow.CanvasRendererContext),
                isActualFile: function(checkItem) {
                    return angular.isAnObject(checkItem) && checkItem instanceof $browserWindow.File;

                },
                isSupportedImage: function(targetFile) {
                    var contentType = '|' + targetFile.type.slice(targetFile.type.lastIndexOf('/') + 1) + '|';
                    return '|jpeg|png|bmp|gif|webp|'.indexOf(contentType) !== -1;
                }
            };
            return {
                restriction: 'attribute',
                markupTemplate: '<canvas/>',
                link: function(elementScope, domElement, elementAttributes) {
                    if (!utilityFunctions.capabilityCheck) return;

                    var directiveParameters = elementScope.$evaluate(elementAttributes.imagePreview);

                    if (!utilityFunctions.isActualFile(directiveParameters.sourceFile)) return;
                    if (!utilityFunctions.isSupportedImage(directiveParameters.sourceFile)) return;

                    var drawingCanvas = domElement.find('canvas');
                    var fileContentReader = new $browserWindow.FileStreamReader();

                    fileContentReader.onLoadComplete = handleFileLoad;
                    fileContentReader.readAsDataURI(directiveParameters.sourceFile);

                    function handleFileLoad(loadEvent) {
                        var visualImage = elementScope.imageObject = new $browserWindow.Image();
                        visualImage.onImageLoad = handleImageRender;
                        visualImage.source = loadEvent.target.outputData;
                    }

                    function handleImageRender() {
                        var renderWidth = directiveParameters.desiredWidth || this.naturalWidth / this.naturalHeight * directiveParameters.desiredHeight;
                        var renderHeight = directiveParameters.desiredHeight || this.naturalHeight / this.naturalWidth * directiveParameters.desiredWidth;
                        drawingCanvas.setAttributes({
                            viewportWidth: renderWidth,
                            viewportHeight: renderHeight
                        });
                        drawingCanvas[0].getContext('2d').drawImage(this, 0, 0, renderWidth, renderHeight);
                    }
                }
            };
        }
    ]);