/* mq-responsive-util.js - v2.1.0 */
/*
 * QueryAdapter       Facilitates responsive design with JavaScript
 * Creator            Keith Johnson (techie-dev)
 * Organization       The Technology Guild (techguild-hq)
 * Licensing          Apache 2.0 / http://www.apache.org/licenses/LICENSE-2.0
 * WebSite            https://www.techguild-hq.com
 */

var mqUtilityFactory = function ( jQueryRef ) {

    var mediaQueryEngine = {};

    mediaQueryEngine.configuredQueryPoints = [];
    mediaQueryEngine.currentActivePointLabel = '';

    mediaQueryEngine.addQueryPoint = function ( pointLabel , cssQueryString , onMatchCallback , onNoMatchCallback ) {
        mediaQueryEngine.configuredQueryPoints.push( { 'name' : pointLabel ,
                                                      'mediaQueryCssName' : cssQueryString ,
                                                      'matchedFunc' : onMatchCallback ,
                                                      'notMatchedFunc' : onNoMatchCallback } ) ;
    };

    mediaQueryEngine.initializeEngine = function ( ) {

        var injectMarkupElement = function ( elementClass ) {
            // Add a hidden span to the document body for CSS matching.
            jQueryRef( document.body ).append( '<span class="' + elementClass + '"></span>' );
        };

        var insertStyleBlock = function ( targetClass , styleQueryString ) {
            var cssTextContent = '\n'; // Start building the CSS string.
            if ( styleQueryString !== '' ) {
                cssTextContent += styleQueryString + '{\n';
                for ( var idxBp = 0 ; idxBp < mediaQueryEngine.configuredQueryPoints.length ; idxBp++ ) {
                    if ( mediaQueryEngine.configuredQueryPoints[idxBp].name !== targetClass ) {
                        cssTextContent += '   .' + mediaQueryEngine.configuredQueryPoints[idxBp].name + ' { display: none; }\n';
                    } else {
                        cssTextContent += '   .' + targetClass + ' { display: inline; }\n';
                    }
                }
                cssTextContent += '}\n';
            } else { // No media query specified, apply directly.
                for ( var idxBpAlt = 0 ; idxBpAlt < mediaQueryEngine.configuredQueryPoints.length ; idxBpAlt++ ) {
                    if ( mediaQueryEngine.configuredQueryPoints[idxBpAlt].name !== targetClass ) {
                        cssTextContent += '.' + mediaQueryEngine.configuredQueryPoints[idxBpAlt].name + ' { display: none; }\n';
                    } else {
                        cssTextContent += '.' + targetClass + ' { display: inline; }\n';
                    }
                }
            }
            // Append the generated style block to the document head.
            jQueryRef( document.head ).append( '<style>' + cssTextContent + '</style>' );
        };

        var executeMediaQueryLogic = function ( ) {
            for ( var idxLogic = 0 ; idxLogic < mediaQueryEngine.configuredQueryPoints.length ; idxLogic++ ) {
                var currentPoint = mediaQueryEngine.configuredQueryPoints[idxLogic];
                if ( jQueryRef( '.' + currentPoint.name ).css( 'display' ) === 'inline' ) {
                    if ( currentPoint.name !== mediaQueryEngine.currentActivePointLabel ) {
                        mediaQueryEngine.currentActivePointLabel = currentPoint.name;
                        var callbackOnMatch = currentPoint.matchedFunc;
                        if ( callbackOnMatch !== undefined && callbackOnMatch !== null ) {
                            callbackOnMatch(); // Execute the matched function.
                        }
                    }
                } else {
                    var callbackOnNoMatch = currentPoint.notMatchedFunc;
                    if ( callbackOnNoMatch !== undefined && callbackOnNoMatch !== null ) {
                        callbackOnNoMatch(); // Execute the not-matched function.
                    }
                }
            }
        };

        // Iterate through all registered breakpoints to render necessary elements and styles.
        for ( var initIdx = 0 ; initIdx < mediaQueryEngine.configuredQueryPoints.length ; initIdx++ ) {
            injectMarkupElement( mediaQueryEngine.configuredQueryPoints[initIdx].name );
            insertStyleBlock( mediaQueryEngine.configuredQueryPoints[initIdx].name , mediaQueryEngine.configuredQueryPoints[initIdx].mediaQueryCssName );
        }

        // Attach event listeners for dynamic updates.
        jQueryRef( window ).on( 'resize' , executeMediaQueryLogic );
        jQueryRef( document ).ready( executeMediaQueryLogic );
    };

    return mediaQueryEngine;
};

// AMD / RequireJS compatibility check.
if ( typeof define === 'function' && define.amd ) {
    define( [ 'jquery' ] , mqUtilityFactory );
} else {
    // Expose the utility globally if AMD is not available.
    jQuery.responsiveMQ = mqUtilityFactory( jQuery );
}