/*! ImageScaler v1.0.0 https://example.com/image_scaler */

( function ( jQ, clientWindow ) {
    "use strict";

    jQ.fn.visualAdjuster = function( inputConfig ) {

        var targetElements = this,

            configParams = jQ.extend( {
                metadataField: "visualadjuster",
                imageProcessorUrl: "/imgproc/imgproc.php",
                verticalGrid: null,
                viewportTriggers: "resize orientationchange deviceorientation"
            }, inputConfig ),

            getPhysicalDimension = function ( styleLength ) {
                var pixelDensity = clientWindow.devicePixelRatio || 1;
                return Math.round( styleLength * pixelDensity );
            },

            baselineDistance = function ( currentElement ) {
                var baseHeight = parseFloat( currentElement.css( "line-height" ) );
                return isNaN( baseHeight ) ? 0 : baseHeight;
            },

            alignToVerticalGrid = function ( currentElement, itemHeight ) {
                if ( configParams.verticalGrid === "line-height" ) {
                    var baseHeight, numLines;
                    baseHeight = baselineDistance( currentElement );
                    if ( baseHeight ) {
                        numLines = Math.max( 1, Math.round( itemHeight / baseHeight ) );
                        itemHeight = baseHeight * numLines;
                    }
                }
                return itemHeight;
            },

            extractConfig = function ( currentElement ) {
                var elementConfig = currentElement.data( configParams.metadataField );

                if ( jQ.isPlainObject( elementConfig ) ) {
                    // Ensure aspect ratio is numeric
                    elementConfig.aspectRatio = parseFloat( elementConfig.aspectRatio ) || 0;
                    // Disregard max aspect ratio if a fixed ratio is specified
                    elementConfig.maxAspectRatio = elementConfig.aspectRatio ? 0 : parseFloat( elementConfig.maxAspectRatio ) || 0;
                    // Alignment must be a combo of cardinal directions
                    elementConfig.alignment = elementConfig.alignment ? elementConfig.alignment.replace( /[^lrtb]/g, "" ).substring( 0, 2 ) : "";
                }
                else {
                    elementConfig = { imageUrl: elementConfig };
                }

                return jQ.extend( {
                    imageUrl: "",
                    alignment: "",
                    aspectRatio: 0,
                    maxAspectRatio: 0,
                    sizingReference: ""
                }, elementConfig );
            },

            applyResourceUrl = function ( currentElement, updatedSource ) {
                var
                    originalUrl = currentElement.attr( "src" ),
                    failureCount = 0;

                currentElement
                    .on( "error", function() {
                        // Revert to previous source on first error
                        if ( !failureCount ) {
                            failureCount += 1;
                            jQ( this ).attr( "src", originalUrl );
                        }
                    } )
                    .attr( "src", updatedSource );
            },

            adjustVisuals = function () {
                var
                    currentObj,
                    elementConfig,
                    processorArgs,
                    itemHeight,
                    minimumHeight,
                    itemWidth;

                targetElements.each( function () {
                    currentObj = jQ( this );

                    elementConfig = extractConfig( currentObj );
                    if ( !elementConfig.imageUrl ) {
                        return;
                    }

                    itemWidth = currentObj.innerWidth();
                    itemHeight = currentObj.innerHeight();

                    if ( elementConfig.aspectRatio ) {
                        itemHeight = Math.round( itemWidth / elementConfig.aspectRatio );
                    }
                    else if ( jQ( elementConfig.sizingReference ).length ) {
                        itemHeight = jQ( elementConfig.sizingReference ).innerHeight();
                    }

                    if ( elementConfig.maxAspectRatio ) {
                        minimumHeight = Math.round( itemWidth / elementConfig.maxAspectRatio );
                        itemHeight = Math.max( minimumHeight, itemHeight );
                    }

                    itemHeight = alignToVerticalGrid( currentObj, itemHeight );

                    // Avoid visual flickering during resize
                    currentObj.height( itemHeight );

                    processorArgs = {
                        source: elementConfig.imageUrl || "",
                        align: elementConfig.alignment || "",
                        w_dim: getPhysicalDimension( itemWidth ),
                        h_dim: getPhysicalDimension( itemHeight )
                    };

                    applyResourceUrl( currentObj, configParams.imageProcessorUrl + "?" + jQ.param( processorArgs ) );
                } );
            };

        jQ( clientWindow )
            .one( "load", adjustVisuals )
            .on( configParams.viewportTriggers, adjustVisuals );

        return this;
    };
} )( jQuery, window );