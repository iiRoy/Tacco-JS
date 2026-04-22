/*
 * AngularJS based file upload and drag-and-drop utility.
 * Facilitates handling file inputs and data transfers via HTTP.
 * @author  Derived from original work by Danial Farid
 * @version 1.6.5_revised
 */
( function () {

var fileUploaderModule = angular.module( 'ngFileTransferUtility', [] );

fileUploaderModule.service( '$dataUploader', [ '$httpRequest', '$promiseHandler', '$delayService', function ( $httpRequest, $promiseHandler, $delayService ) {
    // Core function to dispatch an HTTP request with advanced features.
    function executeHttpRequest ( transferSettings ) {
        transferSettings.method = transferSettings.method || 'POST'; /* Default to POST */
        transferSettings.headers = transferSettings.headers || {};
        transferSettings.transformRequest = transferSettings.transformRequest || function ( payloadData, headerRetrievalFn ) {
            if ( window.ArrayBuffer && payloadData instanceof window.ArrayBuffer ) {
                return payloadData; // Return raw ArrayBuffer data
            }
            // Fallback to Angular's default request transformer
            return $httpRequest.defaults.transformRequest[0]( payloadData, headerRetrievalFn );
        };
        var asyncResult = $promiseHandler.defer(); // Initialize a deferred object for the operation.

        if ( window.XMLHttpRequest.__isShim ) { // Check for XHR shim for compatibility.
            transferSettings.headers['__setXmlHttpReq_'] = function () {
                return function ( xhrObject ) {
                    if ( !xhrObject ) return;
                    transferSettings._currentXmlHttpReq = xhrObject;
                    transferSettings.xmlHttpReqCallback && transferSettings.xmlHttpReqCallback( xhrObject );
                    // Attach event listener for upload progress notifications.
                    xhrObject.upload.addEventListener( 'progress', function ( progressEvent ) {
                        asyncResult.notify( progressEvent );
                    }, false );
                    // Additional listener for the end of upload, especially for Firefox/IE.
                    xhrObject.upload.addEventListener( 'load', function ( loadEvent ) {
                        if ( loadEvent.lengthComputable ) {
                            asyncResult.notify( loadEvent );
                        }
                    }, false );
                };
            };
        }

        // Execute the HTTP request using the Angular $httpRequest service.
        $httpRequest( transferSettings ).then(
            function ( response ) { asyncResult.resolve( response ); },
            function ( error ) { asyncResult.reject( error ); },
            function ( notification ) { asyncResult.notify( notification ); }
        );

        var operationPromise = asyncResult.promise; // Retrieve the promise itself.

        // Extend the promise with a 'onSuccess' callback method.
        operationPromise.onSuccess = function ( successCallback ) {
            operationPromise.then( function ( successResponse ) {
                successCallback( successResponse.data, successResponse.status, successResponse.headers, transferSettings );
            } );
            return operationPromise;
        };

        // Extend the promise with an 'onError' callback method.
        operationPromise.onError = function ( errorCallback ) {
            operationPromise.then( null, function ( errorResponse ) {
                errorCallback( errorResponse.data, errorResponse.status, errorResponse.headers, transferSettings );
            } );
            return operationPromise;
        };

        // Extend the promise with an 'onProgress' callback method.
        operationPromise.onProgress = function ( progressCallback ) {
            operationPromise.then( null, null, function ( updateInfo ) {
                progressCallback( updateInfo );
            } );
            return operationPromise;
        };

        // Add a method to abort the active HTTP transfer.
        operationPromise.cancelTransfer = function () {
            if ( transferSettings._currentXmlHttpReq ) {
                $delayService( function () {
                    transferSettings._currentXmlHttpReq.abort();
                } );
            }
            return operationPromise;
        };

        // Add a method to provide a custom XMLHttpRequest handler.
        operationPromise.xhrHandle = function ( customXhrCallback ) {
            transferSettings.xmlHttpReqCallback = ( function ( originalXhrCallback ) {
                return function () {
                    originalXhrCallback && originalXhrCallback.apply( operationPromise, arguments );
                    customXhrCallback.apply( operationPromise, arguments );
                };
            } )( transferSettings.xmlHttpReqCallback );
            return operationPromise;
        };

        return operationPromise; // Return the enriched promise.
    }

    // Public method to handle file uploads.
    this.initiateUpload = function ( uploadSettings ) {
        uploadSettings.headers = uploadSettings.headers || {};
        uploadSettings.headers['Content-Type'] = undefined; // Let the browser set Content-Type for FormData.
        uploadSettings.transformRequest = uploadSettings.transformRequest || $httpRequest.defaults.transformRequest;

        var transferData = new FormData(); // Create a new FormData object for the upload.
        var originalRequestTransformer = uploadSettings.transformRequest;
        var initialData = uploadSettings.data;

        uploadSettings.transformRequest = function ( formDataObj, headerGetterFn ) {
            if ( initialData ) {
                if ( uploadSettings.formDataAppender ) {
                    for ( var dataKey in initialData ) {
                        var dataValue = initialData[dataKey];
                        uploadSettings.formDataAppender( formDataObj, dataKey, dataValue );
                    }
                } else {
                    for ( var dataKey in initialData ) {
                        var dataValue = initialData[dataKey];
                        if ( typeof originalRequestTransformer === 'function' ) {
                            dataValue = originalRequestTransformer( dataValue, headerGetterFn );
                        } else {
                            for ( var idx = 0; idx < originalRequestTransformer.length; idx++ ) {
                                var transformerFunction = originalRequestTransformer[idx];
                                if ( typeof transformerFunction === 'function' ) {
                                    dataValue = transformerFunction( dataValue, headerGetterFn );
                                }
                            }
                        }
                        formDataObj.append( dataKey, dataValue ); // Append data to FormData.
                    }
                }
            }

            // Process and append files to the FormData.
            if ( uploadSettings.inputFiles != null ) {
                var fileFieldName = uploadSettings.fileFormDataName || 'file'; // Determine the form field name for files.

                if ( Object.prototype.toString.call( uploadSettings.inputFiles ) === '[object Array]' ) {
                    var isFieldNameString = Object.prototype.toString.call( fileFieldName ) === '[object String]';
                    for ( var idx = 0; idx < uploadSettings.inputFiles.length; idx++ ) {
                        formDataObj.append( isFieldNameString ? fileFieldName : fileFieldName[idx], uploadSettings.inputFiles[idx],
                                ( uploadSettings.fileNames && uploadSettings.fileNames[idx] ) || uploadSettings.inputFiles[idx].name );
                    }
                } else {
                    formDataObj.append( fileFieldName, uploadSettings.inputFiles, uploadSettings.fileNames || uploadSettings.inputFiles.name );
                }
            }
            return formDataObj;
        };

        uploadSettings.data = transferData; // Set the FormData as the request body.

        return executeHttpRequest( uploadSettings ); // Send the formulated HTTP request.
    };

    // Public method for generic HTTP requests using the same underlying mechanism.
    this.performHttpRequest = function ( requestConfig ) {
        return executeHttpRequest( requestConfig );
    };
} ] );

fileUploaderModule.directive( 'fileInputHandler', [ '$expressionParser', '$timerService', function ( $expressionParser, $timerService ) {
    return function ( elementScope, htmlElement, elementAttributes ) {
        var callbackExpression = $expressionParser( elementAttributes['fileInputHandler'] );
        // If the bound element is not a file input, create a hidden one and overlay it.
        if ( htmlElement[0].tagName.toLowerCase() !== 'input' || ( htmlElement.attr('type') && htmlElement.attr('type').toLowerCase() ) !== 'file' ) {
            var generatedFileInput = angular.element( '<input type="file">' );
            // Copy all attributes from the original element to the new input.
            for ( var idx = 0; idx < htmlElement[0].attributes.length; idx++ ) {
                generatedFileInput.attr( htmlElement[0].attributes[idx].name, htmlElement[0].attributes[idx].value );
            }
            // Check for 'data-multiple' attribute to enable multiple file selection.
            if ( htmlElement.attr("data-multiple") ) generatedFileInput.attr("multiple", "true");
            // Style the generated input to be invisible and cover the original element.
            generatedFileInput.css("top", 0).css("bottom", 0).css("left", 0).css("right", 0).css("width", "100%").
                    css("opacity", 0).css("position", "absolute").css('filter', 'alpha(opacity=0)');
            htmlElement.append( generatedFileInput );
            // Ensure the container element has relative positioning for absolute child.
            if ( htmlElement.css("position") === '' || htmlElement.css("position") === 'static' ) {
                htmlElement.css("position", "relative");
            }
            htmlElement = generatedFileInput; // Redirect `htmlElement` to the actual file input.
        }
        // Attach a change event listener to process selected files.
        htmlElement.bind( 'change', function ( selectionEvent ) {
            var selectedFiles = [], fileCollection, index;
            fileCollection = selectionEvent.__files_ || selectionEvent.target.files;
            if ( fileCollection != null ) {
                for ( index = 0; index < fileCollection.length; index++ ) {
                    selectedFiles.push( fileCollection.item( index ) );
                }
            }
            // Trigger the bound expression within Angular's digest cycle.
            $timerService( function () {
                callbackExpression( elementScope, {
                    $files : selectedFiles,
                    $event : selectionEvent
                } );
            } );
        } );
        // Original code had commented out sections for 'click' and touch events.
        // These are intentionally omitted to preserve the cloning rules.
    };
} ] );

fileUploaderModule.directive( 'dragDropSupport', [ '$expressionEvaluator', '$delayManager', function ( $expressionEvaluator, $delayManager ) {
    return function ( currentScope, targetElement, elementAttrs ) {
        // Verify if the browser supports the HTML5 draggable attribute.
        if ( 'draggable' in document.createElement('span') ) {
            var availabilityCallback = $expressionEvaluator( elementAttrs['dragDropSupport'] );
            // Execute the callback to inform the scope about drag-and-drop availability.
            $delayManager( function () {
                availabilityCallback( currentScope );
            } );
        }
    };
} ] );

fileUploaderModule.directive( 'fileDropZone', [ '$expressionService', '$timeoutService', '$urlService', function ( $expressionService, $timeoutService, $urlService ) {
    return function ( currentScope, dropElement, dropAttributes ) {
        // Ensure that the browser environment supports drag-and-drop operations.
        if ( 'draggable' in document.createElement('span') ) {
            var dragLeaveTimer = null; // Timer to manage the dragleave event.
            dropElement[0].addEventListener( "dragover", function ( dragOverEvent ) {
                dragOverEvent.stopPropagation();
                dragOverEvent.preventDefault();
                $timeoutService.cancel( dragLeaveTimer ); // Clear any pending dragleave timer.
                // Determine the CSS class to apply during a drag-over state.
                if ( !dropElement[0]._active_drop_style_ ) {
                    if ( dropAttributes['fileDragOverClass'].search(/\) *$/) > -1 ) {
                        var dragStyleFunction = $expressionService( dropAttributes['fileDragOverClass'] );
                        var activeDragStyle = dragStyleFunction( currentScope, {
                            $event : dragOverEvent
                        } );
                        dropElement[0]._active_drop_style_ = activeDragStyle;
                    } else {
                        dropElement[0]._active_drop_style_ = dropAttributes['fileDragOverClass'] || "dragover";
                    }
                }
                dropElement.addClass( dropElement[0]._active_drop_style_ ); // Apply the determined class.
            }, false );
            dropElement[0].addEventListener( "dragenter", function ( dragEnterEvent ) {
                dragEnterEvent.stopPropagation();
                dragEnterEvent.preventDefault();
            }, false );
            dropElement[0].addEventListener( "dragleave", function ( dragLeaveEvent ) {
                // Set a short delay before removing the drag-over class to handle quick re-entries.
                dragLeaveTimer = $timeoutService( function () {
                    dropElement.removeClass( dropElement[0]._active_drop_style_ );
                    dropElement[0]._active_drop_style_ = null;
                }, dropAttributes['fileDragOverDelay'] || 1 );
            }, false );
            var dropCallback = $expressionService( dropAttributes['fileDropZone'] );
            dropElement[0].addEventListener( "drop", function ( dropEvent ) {
                dropEvent.stopPropagation();
                dropEvent.preventDefault();
                dropElement.removeClass( dropElement[0]._active_drop_style_ ); // Remove the drag-over class on drop.
                dropElement[0]._active_drop_style_ = null;
                // Extract files from the drop event and invoke the bound expression.
                processDroppedItems( dropEvent, function ( extractedFiles ) {
                    dropCallback( currentScope, {
                        $files : extractedFiles,
                        $event : dropEvent
                    } );
                } );
            }, false );

            // Helper function to ascertain if a string consists purely of ASCII characters.
            function checkAsciiEncoding ( inputString ) {
                return /^[\000-\177]*$/.test( inputString );
            }

            // Function to handle the dropped items, including complex directory structures.
            function processDroppedItems ( dropEvent, completionCallback ) {
                var extractedFiles = [], dataTransferItems = dropEvent.dataTransfer.items;
                // Utilize webkitGetAsEntry for advanced directory handling if available and not a local file protocol.
                if ( dataTransferItems && dataTransferItems.length > 0 && dataTransferItems[0].webkitGetAsEntry && $urlService.protocol() != 'file' ) {
                    for ( var idx = 0; idx < dataTransferItems.length; idx++ ) {
                        var fileEntry = dataTransferItems[idx].webkitGetAsEntry();
                        if ( fileEntry != null ) {
                            // Workaround for a Chrome bug with non-ASCII file names.
                            if ( checkAsciiEncoding( fileEntry.name ) ) {
                                exploreFileStructure( extractedFiles, fileEntry );
                            } else if ( !dataTransferItems[idx].webkitGetAsEntry().isDirectory ) {
                                extractedFiles.push( dataTransferItems[idx].getAsFile() );
                            }
                        }
                    }
                } else {
                    // Fallback for browsers without webkitGetAsEntry or for local file URLs.
                    var droppedFileList = dropEvent.dataTransfer.files;
                    if ( droppedFileList != null ) {
                        for ( var idx = 0; idx < droppedFileList.length; idx++ ) {
                            extractedFiles.push( droppedFileList.item( idx ) );
                        }
                    }
                }
                // Asynchronously wait for all file system traversals to complete.
                ( function awaitProcessingCompletion ( delayMillis ) {
                    $timeoutService( function () {
                        if ( !itemProcessingCount ) {
                            completionCallback( extractedFiles );
                        } else {
                            awaitProcessingCompletion( 10 );
                        }
                    }, delayMillis || 0 );
                } )();
            }

            var itemProcessingCount = 0; // Tracks the number of ongoing asynchronous file/directory operations.
            // Recursive function to navigate through file system entries (files and subdirectories).
            function exploreFileStructure ( collectedFiles, directoryEntry, currentPath ) {
                if ( directoryEntry != null ) {
                    if ( directoryEntry.isDirectory ) {
                        var directoryReader = directoryEntry.createReader();
                        itemProcessingCount++; // Increment counter for each directory being processed.
                        directoryReader.readEntries( function ( subEntries ) {
                            for ( var itemIndex = 0; itemIndex < subEntries.length; itemIndex++ ) {
                                exploreFileStructure( collectedFiles, subEntries[itemIndex], ( currentPath ? currentPath : "" ) + directoryEntry.name + "/" );
                            }
                            itemProcessingCount--; // Decrement once all entries in the directory are handled.
                        } );
                    } else {
                        itemProcessingCount++; // Increment for each file being processed.
                        directoryEntry.file( function ( fileObject ) {
                            itemProcessingCount--; // Decrement once the file object is retrieved.
                            fileObject._relativePath = ( currentPath ? currentPath : "" ) + fileObject.name;
                            collectedFiles.push( fileObject ); // Add the file to the collection.
                        } );
                    }
                }
            }
        }
    };
} ] );

} () );