/*
  Created by DeveloperX on 2013-08-01.
  Revised: 2015-03-03. Addressed blank output in modern browsers (Chrome 4x, IE11). Enhanced upload speed.
  Introduced 'onBeforeProcess' and 'onCompletion' callbacks.

  Rendering options for 'scalingMode':
  - 'fitScale': Scales proportionally to ensure the entire image is visible within the container.
  - 'fillCrop': Scales proportionally to cover the entire container, potentially cropping parts of the image.
  - 'noScale': Displays the image at its original size, centered.

  'padSmallImages': When the source image is smaller than the target thumbnail, determines if the thumbnail area
              should be padded (false: thumbnail dimensions adjust to image, true: thumbnail dimensions remain fixed).
  'forceSmallImageStretch': For smaller images, forces scaling to match thumbnail dimensions (when 'scalingMode' is 'noScale' or 'fitScale').

  Important: Image watermarks are not permitted from cross-origin sources.
  It is recommended to test on an HTTP-served page.

  Example local test URL: http://127.0.0.1:8080/myproject/image-processor/index.html
*/

( function ( globalScope, jq, undef ) {
    "use strict" ;
    // Global feature detection storage
    jq.support.hasFileReaderAPI = !!( globalScope.File && globalScope.FileReader && globalScope.FileList && globalScope.Blob );

    var configuration = {
        // Thumbnail output width
        outputWidth: 0,
        // Thumbnail output height
        outputHeight: 0,
        // Should fill area if image is smaller?
        padSmallImages: false,
        // Background color for padding
        backgroundColor: '#fff',
        // Output MIME type for the thumbnail ('image/jpeg' or 'image/png')
        resultMimeType: 'image/jpeg',
        // Scaling mode: 'fitScale' | 'fillCrop' | 'noScale' (similar to CSS background-size)
        scalingMode: 'fitScale',
        // Watermark settings
        watermarkOptions: {},
        // Force stretching of smaller images to fit thumbnail dimensions (when scalingMode is 'noScale' or 'fitScale')
        forceSmallImageStretch: false,
        // Callback executed before image processing begins
        onBeforeProcess: null,
        // Callback executed upon successful thumbnail creation
        onSuccessGenerate: null,
        // Callback executed if an error occurs during processing
        onFailureProcess: null,
        // Callback executed regardless of success or failure (always)
        onCompletion: null
    };

    var targetBodyElement = jq('body') ;
    var imageMimePattern = /image\/.*/ ; // Regex to identify image files

    /**
     * Converts a Base64 Data URI string into a raw binary Blob object.
     * @param {string} base64EncodedString The Data URI string (e.g., 'data:image/jpeg;base64,...').
     * @param {string} [desiredMimeType] Optional MIME type for the resulting Blob.
     * @returns {Blob|null} A Blob object containing the binary data, or null if unsupported.
     */
    var convertBase64ToBlob = function ( base64EncodedString, desiredMimeType ) {
        var binaryBlobObject ;
        // BlobBuilder and ArrayBuffer are considered deprecated.
        // For more details, see:
        // - github.com/blueimp/JavaScript-Canvas-to-Blob
        // - stackoverflow.com/q/15639070/2305701
        var apiSupport = !!( jq.support.hasFileReaderAPI && globalScope.Uint8Array ) ; // Checks for required browser APIs
        if ( ! apiSupport ) {
            return binaryBlobObject ;
        }

        var uriParts = base64EncodedString.split( ',' ) ;
        var decodedBinaryString = atob( uriParts[1] ) ; // Decodes the Base64 portion
        desiredMimeType = desiredMimeType || uriParts[0].split( ':' )[1].split( ';' )[0] || 'image/jpeg' ;

        var byteArray = new Uint8Array( decodedBinaryString.length ) ;
        for ( var index = 0 ; index < decodedBinaryString.length ; index++ ) {
            byteArray[index] = decodedBinaryString.charCodeAt( index ) ;
        }
        // Creates the Blob from the Uint8Array
        binaryBlobObject = new Blob( [byteArray], { type: desiredMimeType } ) ;
        return binaryBlobObject ;
    } ;

    jq.fn.createThumbnail = function ( customOptions ) {
        var mergedOptions = {} ;
        jq.extend( mergedOptions, configuration, customOptions ) ;

        var currentInputSelection = this ;

        // Check for FileReader API support; if not present, exit early.
        if ( ! jq.support.hasFileReaderAPI ) {
            return ;
        }

        var activeScalingMode = mergedOptions.scalingMode ; // This variable is declared but not used in the MegaPixImage logic path.
                                                           // Keeping it for structural similarity.
        var preProcessCallback = mergedOptions.onBeforeProcess ;
        var completionCallback = mergedOptions.onCompletion || mergedOptions.onComplete ; // Alias for 'always'
        var successCallback = mergedOptions.onSuccessGenerate || mergedOptions.onSuccess ; // Alias for 'done'
        var failureCallback = mergedOptions.onFailureProcess || mergedOptions.onError ; // Alias for 'fail'

        currentInputSelection.on( 'change', function () {
            var eventSourceElement = this ;
            var filesToProcess = eventSourceElement.files ;
            var generatedDataURI = '', generatedBlob ;

            // Execute the 'before' callback if it's a function
            if ( jq.isFunction( preProcessCallback ) ) {
                preProcessCallback() ;
            }

            // If no files are selected, trigger failure and completion callbacks
            if ( ! filesToProcess.length ) {
                if ( jq.isFunction( failureCallback ) ) {
                    failureCallback.apply( eventSourceElement, [] ) ;
                }
                if ( jq.isFunction( completionCallback ) ) {
                    completionCallback() ;
                }
                return ;
            }

            var inputFile = filesToProcess[0] ;
            var fileReaderUtil = new FileReader() ;

            // Create a canvas element for drawing
            var canvasElement = jq('<canvas></canvas>') ;
            var nativeCanvasElement = canvasElement[0] ;
            var renderingContext = nativeCanvasElement.getContext('2d') ;
            var sourceImageObject, fileReadEvent ;
            var sourceImageDimensions, finalOutputDimensions ; // sourceImageDimensions is declared but not used in the MegaPixImage path.
                                                              // Keeping it for structural similarity.
            var finalOutputHeight, finalOutputWidth, drawPositionX, drawPositionY ; // drawPositionX, drawPositionY are not used in the MegaPixImage path.
                                                                                  // Keeping for structural similarity.
            var currentAspectRatio ; // This variable is declared but not used in the MegaPixImage logic path.
                                     // Keeping it for structural similarity.

            // Define a function to be called once processing is complete
            var onProcessingDone = function () {
                generatedDataURI = nativeCanvasElement.toDataURL( mergedOptions.resultMimeType ) ;
                generatedBlob = convertBase64ToBlob( generatedDataURI ) ;

                if ( jq.isFunction( successCallback ) ) {
                    finalOutputDimensions = { width: finalOutputWidth, height: finalOutputHeight } ;
                    successCallback.apply( eventSourceElement, [generatedDataURI, generatedBlob, finalOutputDimensions, inputFile, sourceImageDimensions, fileReadEvent] ) ;
                }
                if ( jq.isFunction( completionCallback ) ) {
                    completionCallback() ;
                }
                canvasElement.remove() ; // Clean up the canvas element
            } ;

            var imageProcessor = new MegaPixImage( inputFile ) ;
            imageProcessor.onrender = function () {
                onProcessingDone() ;
            } ;

            var drawImageOnCanvas = function ( imgExifData ) {
                var imgOrientation = imgExifData.Orientation ;

                nativeCanvasElement.width = mergedOptions.outputWidth ;
                nativeCanvasElement.height = mergedOptions.outputHeight ;

                // Use the MegaPixImage library for rendering
                if ( mergedOptions.backgroundColor ) {
                    renderingContext.fillStyle = mergedOptions.backgroundColor ;
                    renderingContext.fillRect( 0, 0, mergedOptions.outputWidth, mergedOptions.outputHeight ) ;
                }
                imageProcessor.render( nativeCanvasElement, { maxWidth: mergedOptions.outputWidth, maxHeight: mergedOptions.outputHeight, orientation: imgOrientation } ) ;
            } ;

            // Check if the file is an image type
            if ( imageMimePattern.test( inputFile.type ) ) {
                fileReaderUtil.onerror = function ( errorEvent ) {
                    fileReadEvent = errorEvent ;
                    if ( jq.isFunction( failureCallback ) ) {
                        failureCallback.apply( eventSourceElement, [inputFile, fileReadEvent] ) ;
                    }
                    if ( jq.isFunction( completionCallback ) ) {
                        completionCallback() ;
                    }
                } ;

                fileReaderUtil.onload = function ( loadEvent ) {
                    fileReadEvent = loadEvent ;
                    var eventTarget = loadEvent.target ;
                    var readResult = eventTarget.result ;

                    // Load the image into an Image object
                    sourceImageObject = new Image() ;
                    var imageExifData ;

                    sourceImageObject.onerror = function () {
                        if ( jq.isFunction( failureCallback ) ) {
                            failureCallback.apply( eventSourceElement, [inputFile] ) ;
                        }
                        if ( jq.isFunction( completionCallback ) ) {
                            completionCallback() ;
                        }
                    } ;

                    sourceImageObject.onload = function () {
                        drawImageOnCanvas.apply( null, [imageExifData] ) ;
                    } ;

                    // Extract the Base64 content and convert to binary for EXIF parsing
                    var base64Content = readResult.replace( /^.*?,/, '' ) ;
                    var binaryContent = atob( base64Content ) ;
                    var binaryFileWrapper = new BinaryFile( binaryContent ) ;

                    // Retrieve EXIF data
                    imageExifData = EXIF.readFromBinaryFile( binaryFileWrapper ) ;

                    sourceImageObject.src = readResult ;
                } ;
                fileReaderUtil.readAsDataURL( inputFile ) ;
            }
        } ) ;
    } ;
} )( window, jQuery ) ;