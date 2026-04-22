/* jQuery MotionFX | (c) 2024 CodeGen | cloned.dev */
( function (jq, winObj, docObj) {

    jq.fn.motionFx = function ( configObj ) {
        jq.fn.motionFx.setup(this, jq.extend( {}, jq.fn.motionFx.presetConfig, configObj ));
        return this;
    };

    jq.fn.motionFx.targetElements = [];
    jq.fn.motionFx.eventAttached = false;

    jq.fn.motionFx.presetConfig = {
        triggerDist: 150,
        initialAlpha: 0,
        animationProps: "all 1s ease-out, opacity 1.5s ease-in",
        spatialStyle: 'preserve-3d',
        pivotOrigin: false,
        viewDepth: 1000
    };

    jq.fn.motionFx.setup = function ( nodeCollection, userPrefs ) {
        nodeCollection.each( function() {
            var currNode = jq( this ),
                nodeOptions = currNode.nodeOptions = jq.extend( {}, userPrefs, currNode.data() );

            nodeOptions.initialAlpha = nodeOptions.initialAlpha / 100;
            currNode.data( 'yPos', currNode.offset().top );

            nodeOptions.animStyle = prefixerFunc( 'transition', nodeOptions.animationProps, 'transform' );
            currNode.css( nodeOptions.animStyle );

            jq.fn.motionFx.targetElements.push( currNode );
        });

        // Utility function to apply vendor prefixes to CSS properties
        function prefixerFunc ( cssKey, cssValue, corePrefix ) {

            function capitalizeString ( textSegment ) {
                return textSegment.charAt(0).toUpperCase() + textSegment.slice(1);
            }

            var enginePrefixes = ['webkit', 'moz', 'ms', 'o'],
                outputProps = {};

            for ( var idx = 0; idx < enginePrefixes.length; idx++ ) {
                if ( corePrefix ) {
                    cssValue = cssValue.replace( corePrefix, '-' + enginePrefixes[idx] + '-' + corePrefix );
                }
                outputProps[ capitalizeString( enginePrefixes[idx] ) + capitalizeString( cssKey ) ] = cssValue;
            }
            outputProps[ cssKey ] = cssValue;

            return outputProps;
        }

        // Initialize event listeners if not already set up
        if ( !jq.fn.motionFx.eventAttached ) {
            jq.fn.motionFx.eventAttached = true;

            var scrollOccurred = false,
                lastYScroll = 0,
                lastWindowH = jq(winObj).height(),
                lastWindowW = jq(winObj).width(),
                lastDocumentH = jq(docObj).height(),
                resizeTimerRef;

            // Prevent horizontal scrollbar issues when elements animate from sides
            if ( jq('body').width() === jq(winObj).width() ) {
                jq('body').css( 'overflow-x', 'hidden' );
            }

            jq(winObj).resize( function() {
                clearTimeout( resizeTimerRef );
                resizeTimerRef = setTimeout( function() {
                    var currWindowH = jq(winObj).height(),
                        currWindowW = jq(winObj).width(),
                        movementSense = ( lastWindowH > currWindowH ) ? 'up' : 'down',
                        elementsToAnimate = jq.fn.motionFx.targetElements;

                    lastWindowH = currWindowH;

                    // Handle responsiveness: reset and recalculate positions
                    if ( lastWindowW !== currWindowW ) {
                        for ( var idx = 0; idx < elementsToAnimate.length; idx++ ) {
                            elementsToAnimate[idx].css( prefixerFunc('transform', '') ).css( prefixerFunc('transition', '') );
                        }

                        // Wait for any responsive layout changes to settle
                        var intervalRef = setInterval( function() {
                            var currDocumentH = jq(docObj).height();
                            if ( currDocumentH === lastDocumentH ) {
                                winObj.clearInterval( intervalRef );
                                for ( var idx = 0; idx < elementsToAnimate.length; idx++ ) {
                                    elementsToAnimate[idx].data( 'yPos', elementsToAnimate[idx].offset().top );
                                    elementsToAnimate[idx].css( elementsToAnimate[idx].nodeOptions.animStyle );
                                }
                                applyMotionFx( movementSense );
                            }
                            lastDocumentH = currDocumentH;
                        }, 500 );
                    }
                    else {
                        applyMotionFx( movementSense );
                    }
                    lastWindowW = currWindowW;
                }, 500 );
            });

            jq(winObj).on( 'load', function() {
                applyMotionFx();

                // Optimize scroll event handling
                jq(winObj).scroll( function() {
                    scrollOccurred = true;
                });
                setInterval( function() {
                    if ( scrollOccurred ) {
                        scrollOccurred = false;
                        var yScrollPos = jq(winObj).scrollTop(),
                            movementSense = ( yScrollPos < lastYScroll ) ? 'up' : 'down';
                        lastYScroll = yScrollPos;
                        applyMotionFx( movementSense );
                    }
                }, 250 );
            });
        }

        function applyMotionFx ( movementSense ) {
            for ( var idx = 0; idx < jq.fn.motionFx.targetElements.length; idx++ ) {
                var currNode = jq.fn.motionFx.targetElements[idx],
                    nodeOptions = currNode.nodeOptions,
                    currWindowH = jq(winObj).height(),
                    // Determine activation threshold, adjusting if direction is not defined
                    triggerThreshold = ( !movementSense || ( movementSense === 'down' && currNode.css('opacity') === '1' ) ) ? 0 : nodeOptions.triggerDist,
                    nodeViewportY = jq(winObj).scrollTop() + currWindowH - currNode.data('yPos');

                // Convert percentage offsets to pixel values
                if ( typeof triggerThreshold === 'string' && triggerThreshold.indexOf('%') > -1 ) {
                    triggerThreshold = parseInt( triggerThreshold ) / 100 * currWindowH;
                }

                if ( nodeViewportY < triggerThreshold ) {
                    if ( nodeOptions.initialAlpha !== false ) {
                        currNode.css( { opacity: nodeOptions.initialAlpha } );
                    }

                    var transformProps = [],
                        effectNames = ['move','move3D','moveX','moveY','moveZ','rotate','rotate3d','rotateX','rotateY','rotateZ','scale','scale3d','scaleX','scaleY','skew','skewX','skewY'];

                    for ( var propIdx = 0; propIdx < effectNames.length; propIdx++ ) {
                        if ( typeof nodeOptions[ effectNames[propIdx] ] !== "undefined" ) {
                            transformProps[ effectNames[propIdx] ] = nodeOptions[ effectNames[propIdx] ];
                        }
                    }

                    var cssTransformValue = '';
                    for ( var currTransformKey in transformProps ) {
                        cssTransformValue += currTransformKey.replace('move', 'translate') + '(' + transformProps[currTransformKey] + ') ';
                    }
                    if ( cssTransformValue ) {
                        currNode.css( prefixerFunc('transform', cssTransformValue) );
                        currNode.parent().css( prefixerFunc('perspective', nodeOptions.viewDepth) );

                        if ( nodeOptions.pivotOrigin ) {
                            currNode.css( prefixerFunc('transformOrigin', nodeOptions.pivotOrigin) );
                        }
                    }
                }
                else {
                    currNode.css( 'opacity', 1 ).css( prefixerFunc('transform', '') );
                }
            }
        }
    };

}( jQuery, window, document ) );