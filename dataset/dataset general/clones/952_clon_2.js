DataVisLib.ChartExporter = DataVisLib.DefineClass({
    construct: function( graph, optionsObj, shouldInitialize ) {
        var selfRef = this;
        selfRef.isDebugging = false;
        selfRef.plot = graph;
        selfRef.drawingSurface = null;
        selfRef.vectorGraphics = [];
        selfRef.clientOptions = optionsObj;
        selfRef.exportIconPath = 'chart_export.png';
        selfRef.enablePNGExport = true;
        selfRef.enablePDFExport = false;
        selfRef.enableJPGExport = false;
        selfRef.enableSVGExport = false;
        // selfRef.leftCoord;
        selfRef.rightOffset = 0;
        // selfRef.bottomCoord;
        selfRef.topOffset = 0;
        // selfRef.mainTextColor;
        selfRef.hoverButtonColor = "#F5F5F5";
        // selfRef.buttonDefaultColor = "#FFFFFF";
        // selfRef.buttonHoverTransparency = 0.5;
        selfRef.hoverTextColor = "#DD0000";
        selfRef.exportButtonLabel = "Save chart graphic";
        selfRef.buttonTransparency = 0.8;
        selfRef.outputFileName = "chart_export";
        selfRef.outputBgColor = "#FFFFFF";

        if ( shouldInitialize ) {
            selfRef.prepareExport();
        }
    },

    convertCoordValue: function( coordValue ) {
        if ( coordValue === undefined ) {
            return "auto";
        }
        if ( String( coordValue ).indexOf( "%" ) !== -1 ) {
            return coordValue;
        } else {
            return coordValue + "px";
        }
    },

    prepareExport: function() {
        var selfRef = this;

        var exportFormats = [];
        if ( selfRef.enablePNGExport ) {
            exportFormats.push( "png" );
        }
        if ( selfRef.enablePDFExport ) {
            exportFormats.push( "pdf" );
        }
        if ( selfRef.enableJPGExport ) {
            exportFormats.push( "jpg" );
        }
        if ( selfRef.enableSVGExport ) {
            exportFormats.push( "svg" );
        }

        var actionItems = [];
        if ( exportFormats.length === 1 ) {
            var outputFormat = exportFormats[ 0 ];
            actionItems.push( { outputFormat: outputFormat, itemLabel: selfRef.exportButtonLabel, itemIcon: selfRef.plot.pathToImages + selfRef.exportIconPath } );
        } else if ( exportFormats.length > 1 ) {
            var nestedActions = [];
            for ( var idx = 0; idx < exportFormats.length; idx++ ) {
                nestedActions.push( { outputFormat: exportFormats[ idx ], title: exportFormats[ idx ].toUpperCase() } );
            }
            actionItems.push( { clickHandler: function() {}, itemIcon: selfRef.plot.pathToImages + selfRef.exportIconPath, items: nestedActions } );
        }

        var textColor = selfRef.mainTextColor;
        if ( textColor === undefined ) {
            textColor = selfRef.plot.color;
        }

        var btnBgColor = selfRef.buttonDefaultColor;
        if ( btnBgColor === undefined ) {
            btnBgColor = "transparent";
        }

        selfRef.exportConfig = {
            menuTopPos: selfRef.convertCoordValue( selfRef.topOffset ),
            menuLeftPos: selfRef.convertCoordValue( selfRef.leftCoord ),
            menuRightPos: selfRef.convertCoordValue( selfRef.rightOffset ),
            menuBottomPos: selfRef.convertCoordValue( selfRef.bottomCoord ),
            menuActions: actionItems,
            itemStyleProps: {
                bgColor: btnBgColor,
                itemOpacity: selfRef.buttonTransparency,
                hoverBgColor: selfRef.hoverButtonColor,
                textColor: textColor,
                hoverTextColor: selfRef.hoverTextColor,
                padTop: '6px',
                padRight: '6px',
                padBottom: '6px',
                padLeft: '6px',
                marginTop: '0px',
                marginRight: '0px',
                marginBottom: '0px',
                marginLeft: '0px',
                alignText: 'left',
                textDecoration: 'none',
                fontStyle: selfRef.plot.fontFamily,
                textSize: selfRef.plot.fontSize + 'px'
            },
            outputOptions: {
                bgColor: selfRef.outputBgColor,
                destFileName: selfRef.outputFileName,
                outputFormat: 'png',
                outputMethod: 'dataurlnewwindow',
                renderingEngine: 'browser',
                resolutionDPI: 90,
                clickHandler: function( exportInstance, exportConfig, clickEvent ) {
                    clickEvent.preventDefault();
                    exportInstance.generateOutputData( exportConfig );
                }
            },
            omitImages: true
        };

        selfRef.exportProcess = {
            dataBuffer: [],
            itemsRendered: 0,
            processTimer: 0
        };

        // Adjust configuration based on available libraries
        if ( typeof( window.svgToCanvas ) !== 'undefined' && typeof( window.ColorParser ) !== 'undefined' ) {
            selfRef.exportConfig.outputOptions.renderingEngine = 'canvg';
        }
        if ( typeof( window.saveFile ) !== 'undefined' ) {
            selfRef.exportConfig.outputOptions.outputMethod = 'save';
        }
        if ( DataVisLib.isInternetExplorer && DataVisLib.ieBrowserVersion < 10 ) {
            selfRef.exportConfig.outputOptions.outputMethod = 'dataurlnewwindow';
        }

        // Incorporate client-provided options
        var currentOptions = selfRef.clientOptions;
        if ( currentOptions ) {
            currentOptions.outputOptions = DataVisLib.mergeObjects( selfRef.exportConfig.outputOptions, currentOptions.outputOptions || {} );
            currentOptions.itemStyleProps = DataVisLib.mergeObjects( selfRef.exportConfig.itemStyleProps, currentOptions.itemStyleProps || {} );
            selfRef.exportConfig = DataVisLib.mergeObjects( selfRef.exportConfig, currentOptions );
        }

        // Establish a link to the chart object
        selfRef.plot.ChartExporter = selfRef;

        // Monitor for chart rendering completion
        selfRef.plot.attachListener( 'chartRendered', function() {
            selfRef.initializeButtons();
        });

        // Expose for debugging if enabled
        if ( selfRef.isDebugging ) {
            window.ChartExporter = selfRef;
        }
    },

    /*
     * Simple logging utility for internal operations.
     * @param {Array} messageArgs - Arguments to log.
     */
    debugLog: function() {
        console.log( 'ChartExporter: ', arguments );
    },

    /* PUBLIC METHOD
     * Sets up the necessary components for chart export functionality.
     * @param {void}
     */
    initializeButtons: function() {
        var selfRef = this;

        if ( !DataVisLib.isInternetExplorer || ( DataVisLib.isInternetExplorer && DataVisLib.ieBrowserVersion > 9 ) ) {
            selfRef.createExportButtons();
        }
    },

    /* PUBLIC METHOD
     * Converts a base64 encoded string into a binary byte array.
     * @param {string} encodedString - The base64 string to decode.
     * @copyright Eli Grey, http://eligrey.com and Devin Samarin, https://github.com/eboyjr
     */
    decodeBase64ToBytes: function( encodedString ) {
        var strLength = encodedString.length,
            byteBuffer = new Uint8Array( strLength / 4 * 3 | 0 ),
            charIndex = 0,
            outputPtr = 0,
            lastChars = [0, 0],
            decodeState = 0,
            currentValue = 0,
            charRank, char_code, undefinedVal,
            b64LookupTable = new Uint8Array([
                62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, 0, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51
            ]);
        while ( strLength-- ) {
            char_code = encodedString.charCodeAt( charIndex++ );
            charRank = b64LookupTable[ char_code - 43 ];
            if ( charRank !== 255 && charRank !== undefinedVal ) {
                lastChars[ 1 ] = lastChars[ 0 ];
                lastChars[ 0 ] = char_code;
                currentValue = ( currentValue << 6 ) | charRank;
                decodeState++;
                if ( decodeState === 4 ) {
                    byteBuffer[ outputPtr++ ] = currentValue >>> 16;
                    if ( lastChars[ 1 ] !== 61 /* padding character */ ) {
                        byteBuffer[ outputPtr++ ] = currentValue >>> 8;
                    }
                    if ( lastChars[ 0 ] !== 61 /* padding character */ ) {
                        byteBuffer[ outputPtr++ ] = currentValue;
                    }
                    decodeState = 0;
                }
            }
        }
        // Truncate buffer if necessary to remove trailing nulls.
        return byteBuffer;
    },

    /*
     * Creates a Blob object from a data string.
     * @param {string} dataRepresentation - The data string, possibly base64 encoded.
     * @param {string} mimeType - The MIME type of the data.
     */
    createDataBlob: function( dataRepresentation, mimeType ) {
        var selfRef = this,
            headerEndIndex = mimeType !== 'image/svg+xml' ? dataRepresentation.indexOf(',') + 1 : 0,
            dataHeader = dataRepresentation.substring( 0, headerEndIndex ),
            rawData = dataRepresentation,
            outputBlob = new Blob();

        if ( dataHeader.indexOf( 'base64' ) !== -1 ) {
            rawData = selfRef.decodeBase64ToBytes( dataRepresentation.substring( headerEndIndex ) );
        }

        // Emulate Blob for older IE versions
        if ( DataVisLib.isInternetExplorer && DataVisLib.ieBrowserVersion < 10 ) {
            outputBlob.data = rawData;
            outputBlob.size = rawData.length;
            outputBlob.type = mimeType;
            outputBlob.encoding = 'base64';
        } else {
            outputBlob = new Blob( [ rawData ], {
                type: mimeType
            });
        }
        return outputBlob;
    },

    /*
     * Generates a PDF document object.
     * @param {object} exportConfig - Configuration settings for the export.
     */
    createPDFDocument: function( exportConfig ) {
        var selfRef = this,
            pdfObject = {
                generateOutputData: function() {
                    return '';
                }
            },
            rawData = selfRef.drawingSurface.toDataURL( 'image/jpeg' ), // JSPDF primarily uses JPEG
            docWidth = ( selfRef.drawingSurface.width * 25.4 ) / exportConfig.resolutionDPI,
            docHeight = ( selfRef.drawingSurface.height * 25.4 ) / exportConfig.resolutionDPI;

        // Check for jsPDF library availability
        if ( window.PDFGenLib ) {
            pdfObject = new PDFGenLib();
            if ( pdfObject.insertImage ) {
                pdfObject.insertImage( rawData, 'JPEG', 0, 0, docWidth, docHeight );
            } else {
                alert( "PDF library plugin missing; Ensure 'addImage' plugin is included." );
            }
        } else {
            alert( "PDF generation library not found; Please include jsPDF and its plugins." );
        }

        return pdfObject;
    },

    /* PUBLIC METHOD
     * Initiates the output process, generating the desired image or document.
     * @param {object} exportConfig - Configuration for the output.
     * @param {function} completionCallback - Optional callback function for post-processing.
     */
    generateOutputData: function( exportConfig, completionCallback ) {
        var selfRef = this;
        exportConfig = DataVisLib.mergeObjects( DataVisLib.mergeObjects( {}, selfRef.exportConfig.outputOptions ), exportConfig || {} );

        // Prepare the chart for export if a method is available
        if ( selfRef.plot.prepareForExport ) {
            selfRef.plot.prepareForExport();
        }

        /* PRIVATE FUNCTION
         * This callback is invoked once the drawing process on the canvas is finished.
         * @param {void}
         */
        function onDrawingComplete() {
            var exportData = null;
            var outputBlob;

            // Handle SVG output format
            if ( exportConfig.outputFormat === 'image/svg+xml' || exportConfig.outputFormat === 'svg' ) {
                exportData = selfRef.composeCombinedSVG();
                outputBlob = selfRef.createDataBlob( exportData, 'image/svg+xml' );

                if ( exportConfig.outputMethod === 'save' ) {
                    saveFile( outputBlob, exportConfig.destFileName + '.svg' );
                } else if ( exportConfig.outputMethod === 'datastring' || exportConfig.outputMethod === 'datauristring' || exportConfig.outputMethod === 'dataurlstring' ) {
                    outputBlob = 'data:image/svg+xml;base64,' + encodeBase64( exportData );
                } else if ( exportConfig.outputMethod === 'dataurlnewwindow' ) {
                    window.open( 'data:image/svg+xml;base64,' + encodeBase64( exportData ) );
                } else if ( exportConfig.outputMethod === 'datauri' || exportConfig.outputMethod === 'dataurl' ) {
                    location.href = 'data:image/svg+xml;base64,' + encodeBase64( exportData );
                } else if ( exportConfig.outputMethod === 'datastream' ) {
                    location.href = 'data:image/octet-stream;base64,' + exportData;
                }

                if ( completionCallback ) {
                    completionCallback.apply( selfRef, [ outputBlob ] );
                }

            // Handle PDF output format
            } else if ( exportConfig.outputFormat === 'application/pdf' || exportConfig.outputFormat === 'pdf' ) {
                exportData = selfRef.createPDFDocument( exportConfig ).generateOutputData( 'dataurlstring' );
                outputBlob = selfRef.createDataBlob( exportData, 'application/pdf' );

                if ( exportConfig.outputMethod === 'save' ) {
                    saveFile( outputBlob, exportConfig.destFileName + '.pdf' );
                } else if ( exportConfig.outputMethod === 'datastring' || exportConfig.outputMethod === 'datauristring' || exportConfig.outputMethod === 'dataurlstring' ) {
                    outputBlob = exportData;
                } else if ( exportConfig.outputMethod === 'dataurlnewwindow' ) {
                    window.open( exportData );
                } else if ( exportConfig.outputMethod === 'datauri' || exportConfig.outputMethod === 'dataurl' ) {
                    location.href = exportData;
                } else if ( exportConfig.outputMethod === 'datastream' ) {
                    location.href = exportData.replace( 'application/pdf', 'application/octet-stream' );
                }

                if ( completionCallback ) {
                    completionCallback.apply( selfRef, [ outputBlob ] );
                }

            // Handle PNG output format
            } else if ( exportConfig.outputFormat === 'image/png' || exportConfig.outputFormat === 'png' ) {
                exportData = selfRef.drawingSurface.toDataURL( 'image/png' );
                outputBlob = selfRef.createDataBlob( exportData, 'image/png' );

                if ( exportConfig.outputMethod === 'save' ) {
                    saveFile( outputBlob, exportConfig.destFileName + '.png' );
                } else if ( exportConfig.outputMethod === 'datastring' || exportConfig.outputMethod === 'datauristring' || exportConfig.outputMethod === 'dataurlstring' ) {
                    outputBlob = exportData;
                } else if ( exportConfig.outputMethod === 'dataurlnewwindow' ) {
                    window.open( exportData );
                } else if ( exportConfig.outputMethod === 'datauri' || exportConfig.outputMethod === 'dataurl' ) {
                    location.href = exportData;
                } else if ( exportConfig.outputMethod === 'datastream' ) {
                    location.href = exportData.replace( 'image/png', 'image/octet-stream' );
                }

                if ( completionCallback ) {
                    completionCallback.apply( selfRef, [ outputBlob ] );
                }

            // Handle JPG output format
            } else if ( exportConfig.outputFormat === 'image/jpeg' || exportConfig.outputFormat === 'jpeg' || exportConfig.outputFormat === 'jpg' ) {
                exportData = selfRef.drawingSurface.toDataURL( 'image/jpeg' );
                outputBlob = selfRef.createDataBlob( exportData, 'image/jpeg' );

                if ( exportConfig.outputMethod === 'save' ) {
                    saveFile( outputBlob, exportConfig.destFileName + '.jpg' );
                } else if ( exportConfig.outputMethod === 'datastring' || exportConfig.outputMethod === 'datauristring' || exportConfig.outputMethod === 'dataurlstring' ) {
                    outputBlob = exportData;
                } else if ( exportConfig.outputMethod === 'dataurlnewwindow' ) {
                    window.open( exportData );
                } else if ( exportConfig.outputMethod === 'datauri' || exportConfig.outputMethod === 'dataurl' ) {
                    location.href = exportData;
                } else if ( exportConfig.outputMethod === 'datastream' ) {
                    location.href = exportData.replace( 'image/jpeg', 'image/octet-stream' );
                }

                if ( completionCallback ) {
                    completionCallback.apply( selfRef, [ outputBlob ] );
                }
            }
        }

        return selfRef.renderOutputCanvas( exportConfig, onDrawingComplete );
    },

    /* PUBLIC METHOD
     * Enhances the SVG content by adding necessary attributes and embedding images as base64.
     * @param {SVGElement} svgElement - The SVG element to modify.
     */
    enhanceSVGContent: function( svgElement ) {
        var selfRef = this;

        // Internal function to recursively modify elements
        function applyRecursiveModifications( currentSvg, elementTag ) {
            var foundElements = currentSvg.getElementsByTagName( elementTag );
            var count = foundElements.length;

            while ( count-- ) {
                if ( selfRef.exportConfig.omitImages ) {
                    foundElements[ count ].parentNode.removeChild( foundElements[ count ] );
                } else {
                    var imgElement = document.createElement( 'img' );
                    var tempCanvas = document.createElement( 'canvas' );
                    var canvasContext = tempCanvas.getContext( '2d' );

                    tempCanvas.width = foundElements[ count ].getAttribute( 'width' );
                    tempCanvas.height = foundElements[ count ].getAttribute( 'height' );
                    imgElement.src = foundElements[ count ].getAttribute( 'xlink:href' );
                    imgElement.width = foundElements[ count ].getAttribute( 'width' );
                    imgElement.height = foundElements[ count ].getAttribute( 'height' );

                    try {
                        canvasContext.drawImage( imgElement, 0, 0, imgElement.width, imgElement.height );
                        imageDataString = tempCanvas.toDataURL();
                    } catch ( processingErr ) {
                        imageDataString = imgElement.src;

                        selfRef.debugLog( 'Tainted canvas detected; browser CORS security enforced. Image origin must match server!' );
                        throw new ProcessingError( processingErr );
                    }

                    foundElements[ count ].setAttribute( 'xlink:href', imageDataString );
                }
            }
        }

        // Add essential SVG attributes; xmlns is crucial for valid SVG files
        if ( DataVisLib.ieBrowserVersion === 0 ) {
            svgElement.setAttribute( 'xmlns', 'http://www.w3.org/2000/svg' );
            if ( !selfRef.exportConfig.omitImages ) {
                svgElement.setAttribute( 'xmlns:xlink', 'http://www.w3.org/1999/xlink' );
            }
        }

        // Force link attribute adaptation for patterns and images
        applyRecursiveModifications( svgElement, 'pattern' );
        applyRecursiveModifications( svgElement, 'image' );
        selfRef.vectorGraphics.push( svgElement );

        return svgElement;
    },

    /* PUBLIC METHOD
     * Combines multiple SVG elements into a single SVG.
     * @param {void}
     */
    composeCombinedSVG: function() {
        var selfRef = this;
        var svgContainer = document.createElement( 'svg' );
        svgContainer.setAttribute( 'xmlns', 'http://www.w3.org/2000/svg' );
        svgContainer.setAttribute( 'xmlns:xlink', 'http://www.w3.org/1999/xlink' );

        for ( var idx = 0; idx < selfRef.exportProcess.dataBuffer.length; idx++ ) {
            var graphicGroup = document.createElement( 'g' ),
                elementData = selfRef.exportProcess.dataBuffer[ idx ];

            elementData[ 0 ].setAttribute( 'xmlns', 'http://www.w3.org/2000/svg' );
            elementData[ 0 ].setAttribute( 'xmlns:xlink', 'http://www.w3.org/1999/xlink' );

            graphicGroup.setAttribute( 'transform', 'translate(' + elementData[ 1 ].x + ',' + elementData[ 1 ].y + ')' );
            graphicGroup.appendChild( elementData[ 0 ] );
            svgContainer.appendChild( graphicGroup );
        }

        return new XMLSerializer().serializeToString( svgContainer );
    },

    /* PUBLIC METHOD
     * Renders the chart content onto a canvas using the specified renderer.
     * @param {object} exportConfig - Configuration for the rendering process.
     * @param {function} onDrawingComplete - Callback function executed after drawing.
     */
    renderOutputCanvas: function( exportConfig, onDrawingComplete ) {
        var selfRef = this,
            svgCollection = [],
            foundSVGElements = [],
            tempCanvas = document.createElement( 'canvas' ),
            canvasContext = tempCanvas.getContext( '2d' ),
            currentOffset = {
                y: 0,
                x: 0
            };

        // Collect all SVG elements from the chart's container
        svgCollection = selfRef.plot.containerDiv.getElementsByTagName( 'svg' );
        for ( var idx = 0; idx < svgCollection.length; idx++ ) foundSVGElements.push( svgCollection[ idx ] );
        // ... (rest of the generateOutput method logic would follow here,
        //     but it was truncated in the original prompt)
        //     For a Type II clone, the remaining logic would also be rewritten.
    }
});