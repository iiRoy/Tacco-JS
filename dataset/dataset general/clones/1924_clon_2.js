/*
 * Copyright (c) 2023 [Your Name or Company Name]
 *
 * This software is provided under the terms of the [Chosen License, e.g., MIT License].
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

( function( currentJQuery, undefinedValue ) {

    "use strict";

    currentJQuery.fn.overviewMap = function( configOptions ) {
        // Reference to the original element for which the overview is created.
        var originalElement = this;
        // Reference to the browser window, wrapped in jQuery.
        var viewportElement = currentJQuery( window );
        // An empty function used as a default callback.
        var noopFunction = function() {};
        // Flag indicating if the overview map is currently visible.
        var isVisible = true;

        // Default configuration settings for the overview map.
        var defaultSettings = {
            verticalScaleRatio : 0.6,
            horizontalScaleRatio : 0.05,
            verticalOffsetFactor : 0.035,
            horizontalOffsetFactor : 0.035,
            placementSide : "right",
            enableTouch : true,
            animateScroll : true,
            animationDuration : 200,
            onOverviewUpdate : noopFunction
        };
        // Merge default settings with user-provided options.
        var activeSettings = currentJQuery.extend( {}, defaultSettings, configOptions );
        // Valid placement sides for the overview map.
        var validPlacementSides = [ "right", "left" ];

        // Function to validate individual properties of the configuration.
        var validateConfigurationProperty = function( propertyKey, propertyValue ) {

            switch ( propertyKey ) {
                case 'verticalScaleRatio':
                    var vRatio = propertyValue;
                    if ( !currentJQuery.isNumeric( vRatio ) || vRatio <= 0.0 || vRatio > 1.0 )
                        throw "Invalid verticalScaleRatio: " + vRatio;
                    break;
                case 'horizontalScaleRatio':
                    var hRatio = propertyValue;
                    if ( !currentJQuery.isNumeric( hRatio ) || hRatio <= 0.0 || hRatio > 0.5 )
                        throw "Invalid horizontalScaleRatio: " + hRatio;
                    break;
                case 'verticalOffsetFactor':
                    var vOffset = propertyValue;
                    if ( !currentJQuery.isNumeric( vOffset ) || vOffset < 0.0 || vOffset > 0.9 )
                        throw "Invalid verticalOffsetFactor: " + vOffset;
                    break;
                case 'horizontalOffsetFactor':
                    var hOffset = propertyValue;
                    if ( !currentJQuery.isNumeric( hOffset ) || hOffset < 0.0 || hOffset > 0.9 )
                        throw "Invalid horizontalOffsetFactor: " + hOffset;
                    break;
                case 'placementSide':
                    var sideValue = propertyValue.toLowerCase();
                    var foundIndex = validPlacementSides.indexOf( sideValue );
                    if ( foundIndex === -1 ) throw "Invalid placementSide: " + activeSettings.placementSide;
                    activeSettings.placementSide = sideValue;
                    break;
                case 'animationDuration':
                    var durationMs = propertyValue;
                    if ( ( ( durationMs | 0 ) !== durationMs ) || durationMs < 4 )
                        throw "Invalid animationDuration (in ms): " + durationMs;
                    break;
                case 'enableTouch':
                case 'animateScroll':
                    // These are boolean flags, no specific numeric validation needed.
                    break;
                case 'onOverviewUpdate':
                    var updateCallback = propertyValue;
                    if ( !updateCallback || !currentJQuery.isFunction( updateCallback ) )
                        throw "Invalid onOverviewUpdate callback: " + propertyValue;
                    break;
                default:
                    throw "Unsupported validation property: " + propertyKey;
            }
        };

        // Validate all the provided or default settings.
        for ( var settingKey in activeSettings ) {
            validateConfigurationProperty( settingKey, activeSettings[ settingKey ] );
        }

        // Create a clone of the original element to serve as the overview map.
        var clonedDisplayElement = originalElement.clone();

        // Remove any existing overview-specific elements from the clone.
        clonedDisplayElement.find( '.overview.no-selection' ).remove();
        clonedDisplayElement.find( '.view-region' ).remove();
        // Add necessary classes to the cloned element.
        clonedDisplayElement.addClass( 'overview no-selection' );
        // Disable pointer events on children of the clone to prevent interaction.
        clonedDisplayElement.children().each( function() { currentJQuery( this ).css( { 'pointer-events': 'none' } ); } );

        // Create the movable region (viewfinder) element.
        var viewfinderElement = currentJQuery( '<div class="view-region"> </div>' );

        // Append the viewfinder and the cloned display element to the body.
        currentJQuery( 'body' )[ 0 ].append( viewfinderElement );
        currentJQuery( 'body' )[ 0 ].append( clonedDisplayElement );

        // Computes the scaling factors based on window and original element dimensions.
        var computeScaleFactors = function() {
            return {
                x: ( viewportElement.width() / originalElement.width() ) * activeSettings.horizontalScaleRatio,
                y: ( viewportElement.height() / originalElement.height() ) * activeSettings.verticalScaleRatio
            };
        };

        // Handles resizing of the browser window or changes in the overview map.
        var handleWindowResize = function( resizeEvent ) {
            // If the overview is not visible, do nothing.
            if ( !isVisible ) return;

            var currentScaling = computeScaleFactors();
            var transformStyle = 'scale(' + currentScaling.x + ',' + currentScaling.y + ')';
            var verticalViewportOffset = viewportElement.height() * activeSettings.verticalOffsetFactor;

            var horizontalViewportOffset = viewportElement.width() * activeSettings.horizontalOffsetFactor;

            var elementVerticalPosition = originalElement.height() * ( currentScaling.y - 1 ) / 2 + verticalViewportOffset;
            var elementHorizontalPosition = originalElement.width() * ( currentScaling.x - 1 ) / 2 + horizontalViewportOffset;

            var cloneDisplayWidth = viewportElement.width() * ( 1 / currentScaling.x ) * activeSettings.horizontalScaleRatio;
            var cloneDisplayHeight = viewportElement.height() * ( 1 / currentScaling.y ) * activeSettings.verticalScaleRatio;

            // Apply CSS transformations and positioning to the cloned element.
            var cloneCssProperties = {
                '-webkit-transform': transformStyle,
                '-moz-transform': transformStyle,
                '-ms-transform': transformStyle,
                '-o-transform': transformStyle,
                'transform': transformStyle,
                'top' : elementVerticalPosition,
                'width' : cloneDisplayWidth,
                'height' : cloneDisplayHeight,
                'margin' : '0px',
                'padding' : '0px'
            };
            cloneCssProperties[ activeSettings.placementSide ] = elementHorizontalPosition;

            clonedDisplayElement.css( cloneCssProperties );

            // Calculate and apply CSS for the viewfinder element.
            var viewfinderTopPosition = originalElement.offset().top * currentScaling.y;
            var viewfinderCssProperties = {
                width : clonedDisplayElement.width() * currentScaling.x,
                height : viewportElement.height() * currentScaling.y,
                margin : '0px',
                top : viewportElement.scrollTop() * currentScaling.y + verticalViewportOffset - viewfinderTopPosition + 'px'
            };
            viewfinderCssProperties[ activeSettings.placementSide ] = horizontalViewportOffset + 'px';
            viewfinderElement.css( viewfinderCssProperties );

            // Invoke the callback for overview updates.
            activeSettings.onOverviewUpdate( clonedDisplayElement, currentScaling );
        };

        // Handles scrolling of the browser window.
        var handleWindowScroll = function( scrollEvent ) {
            // If the overview is not visible, do nothing.
            if ( !isVisible ) return;

            var currentScaling = computeScaleFactors();
            var verticalViewportOffset = viewportElement.height() * activeSettings.verticalOffsetFactor;
            var originalElementTop = originalElement.offset().top * currentScaling.y;
            var currentScrollPositionScaled = ( viewportElement.scrollTop() ) * currentScaling.y;
            var viewfinderTotalHeight = viewfinderElement.outerHeight( true );
            var originalElementBottom = originalElement.outerHeight( true ) * currentScaling.y + originalElementTop;

            // Adjust viewfinder visibility and position based on scroll.
            if ( currentScrollPositionScaled + viewfinderTotalHeight + verticalViewportOffset < originalElementTop || currentScrollPositionScaled > originalElementBottom ) {
                viewfinderElement.css( {
                    display: 'none',
                } );
            } else {
                viewfinderElement.css( {
                    top : currentScrollPositionScaled + verticalViewportOffset - originalElementTop + 'px',
                    display : 'block'
                } );
            }
        };

        // Scrolls the main window to a target position based on user interaction.
        var initiateScrollToPosition = function( interactionEvent ) {
            // If the overview is not visible, do nothing.
            if ( !isVisible ) return;

            var currentScaling = computeScaleFactors();
            var verticalViewportOffset = viewportElement.height() * activeSettings.verticalOffsetFactor;
            var originalElementTop = originalElement.offset().top * currentScaling.y;
            var desiredScrollTarget = ( interactionEvent.clientY - verticalViewportOffset + originalElementTop ) / currentScaling.y;

            // Handle smooth scrolling if enabled and it's a click event.
            if ( interactionEvent.type === 'click' && activeSettings.animateScroll ) {
                var currentWindowScroll = viewportElement.scrollTop();
                var maxScrollHeight = originalElement.outerHeight( true );
                // Clamp the target scroll position.
                desiredScrollTarget = Math.max( desiredScrollTarget, Math.min( desiredScrollTarget, maxScrollHeight ) );
                var isScrollingDown = desiredScrollTarget > currentWindowScroll;
                var animationDelay = activeSettings.animationDuration;
                var totalScrollDistance = Math.abs( currentWindowScroll - desiredScrollTarget );
                var ratioCalc = animationDelay / totalScrollDistance;
                var scrollIncrement = 1;
                var delayPerStep = 4;
                if ( ratioCalc >= 4 ) {
                    delayPerStep = parseInt( scrollIncrement );
                } else if ( ratioCalc >= 1 ) {
                    scrollIncrement = parseInt( ratioCalc ) * 4;
                } else {
                    scrollIncrement = ( 4 / ratioCalc );
                }

                var nextScrollPosition = currentWindowScroll;
                var stepCount = parseInt( totalScrollDistance / scrollIncrement );
                isScrollAnimationActive = true;

                // Function for each step of the linear smooth scroll.
                var performSmoothScrollStep = function() {
                    nextScrollPosition = nextScrollPosition + ( isScrollingDown ? scrollIncrement : -scrollIncrement );
                    if ( --stepCount <= 0 ) {
                        clearInterval( scrollAnimationTimer );
                        isScrollAnimationActive = false;
                        nextScrollPosition = desiredScrollTarget;
                    }
                    viewportElement.scrollTop( nextScrollPosition );
                };
                var scrollAnimationTimer = window.setInterval( performSmoothScrollStep, delayPerStep );
            } else {
                // Instant scroll if smooth scroll is not active or not a click.
                viewportElement.scrollTop( desiredScrollTarget );
            }
            interactionEvent.stopPropagation();
        };

        var isMouseDown = false;
        var isScrollAnimationActive = false;

        // Handles mouse button release event.
        var handleMouseRelease = function( mouseEvent ) {
            isMouseDown = false;
        };

        // Handles mouse movement event for dragging the viewfinder.
        var handleMouseMove = function( mouseEvent ) {
            if ( !isMouseDown || isScrollAnimationActive ) return;
            initiateScrollToPosition( mouseEvent );
        };

        // Handles click event on the viewfinder or overview map.
        var handleClick = function( clickEvent ) {
            initiateScrollToPosition( clickEvent );
            isMouseDown = false;
        };

        // Handles mouse button press event.
        var handleMousePress = function( mouseEvent ) {
            isMouseDown = true;
        };

        // Initial setup and event binding.
        handleWindowResize();
        viewportElement.on( 'resize', handleWindowResize );
        viewportElement.on( 'scroll', handleWindowScroll );

        // Bind mouse events to the viewfinder element.
        currentJQuery( viewfinderElement ).on( 'mousedown', handleMousePress );
        currentJQuery( viewfinderElement ).on( 'mouseup', handleMouseRelease );
        currentJQuery( viewfinderElement ).on( 'mousemove', handleMouseMove );
        currentJQuery( viewfinderElement ).on( 'click', handleClick );

        // Bind mouse events to the cloned display element.
        currentJQuery( clonedDisplayElement ).on( 'mousedown', handleMousePress );
        currentJQuery( clonedDisplayElement ).on( 'mouseup', handleMouseRelease );
        currentJQuery( clonedDisplayElement ).on( 'mousemove', handleMouseMove );
        currentJQuery( clonedDisplayElement ).on( 'click', handleClick );

        var lastTouchActionType = '';
        // Generic touch event handler to simulate mouse events.
        var processTouchEvent = function( touchEvent ) {
            var touchPoints = touchEvent.changedTouches;

            // Ignore multi-touch gestures.
            if ( touchPoints.length > 1 ) return;

            var singleTouch = touchPoints[ 0 ];
            var touchEventNames = [ "touchstart", "touchmove", "touchend" ];
            var simulatedMouseEventNames = [ "mousedown", "mousemove", "mouseup" ];
            var eventTypeIndex = touchEventNames.indexOf( touchEvent.type );

            if ( eventTypeIndex === -1 ) return; // Not a recognized touch event.

            var simulatedEventType = simulatedMouseEventNames[ eventTypeIndex ];
            // Convert touchend following touchstart into a click.
            if ( touchEvent.type === touchEventNames[ 2 ] && lastTouchActionType === touchEventNames[ 0 ] ) {
                simulatedEventType = "click";
            }

            // Create and dispatch a synthetic mouse event.
            var syntheticMouseEvent = document.createEvent( "MouseEvent" );
            syntheticMouseEvent.initMouseEvent( simulatedEventType, true, true, window, 1,
                singleTouch.screenX, singleTouch.screenY,
                singleTouch.clientX, singleTouch.clientY, false,
                false, false, false, 0, null );
            singleTouch.target.dispatchEvent( syntheticMouseEvent );
            touchEvent.preventDefault(); // Prevent default touch behavior.
            lastTouchActionType = touchEvent.type;
        };

        // Enable touch event handling if configured.
        if ( activeSettings.enableTouch ) {

            document.addEventListener( "touchstart", processTouchEvent, true );
            document.addEventListener( "touchmove", processTouchEvent, true );
            document.addEventListener( "touchend", processTouchEvent, true );
            document.addEventListener( "touchcancel", processTouchEvent, true );

        }

        // Sets the placement side (left/right) of the overview map.
        var setPlacementPosition = function( newPlacementSide ) {
            var previousPlacement = activeSettings.placementSide;
            validateConfigurationProperty( 'placementSide', newPlacementSide );
            if ( previousPlacement !== activeSettings.placementSide ) {
                var cssReset = {};
                cssReset[ previousPlacement ] = ''; // Clear previous position.
                handleWindowResize(); // Recalculate and redraw.
                viewfinderElement.css( cssReset );
                clonedDisplayElement.css( cssReset );
            }
        };

        // Factory function to create setters for various properties.
        var createPropertySetter = function( optionName, requiresRedraw ) {
            return function( newValue ) {
                validateConfigurationProperty( optionName, newValue );
                activeSettings[ optionName ] = newValue;
                if ( requiresRedraw ) handleWindowResize(); // Redraw if necessary.
            };
        };

        // Makes the overview map visible.
        var displayOverview = function() {
            if ( isVisible ) return;
            clonedDisplayElement.show();
            viewfinderElement.show();
            isVisible = true;
            handleWindowResize(); // Ensure correct positioning after showing.
        };

        // Hides the overview map.
        var concealOverview = function() {
            if ( !isVisible ) return;
            clonedDisplayElement.hide();
            viewfinderElement.hide();
            isVisible = false;
        };

        // Toggles the visibility of the overview map.
        var toggleVisibility = function() {
            clonedDisplayElement.toggle();
            viewfinderElement.toggle();
            isVisible = !isVisible;
            if ( isVisible ) handleWindowResize(); // Redraw if it becomes visible.
        };

        // Extend the original element with the new public methods.
        return currentJQuery.extend( {}, this, {
            "setPlacement": setPlacementPosition,
            "setVerticalRatio": createPropertySetter( 'verticalScaleRatio', true ),
            "setHorizontalRatio": createPropertySetter( 'horizontalScaleRatio', true ),
            "setVerticalOffset": createPropertySetter( 'verticalOffsetFactor', true ),
            "setHorizontalOffset": createPropertySetter( 'horizontalOffsetFactor', true ),
            "setAnimatedScrolling" : createPropertySetter( 'animateScroll' ),
            "setAnimationDuration" : createPropertySetter( 'animationDuration' ),
            "displayOverview" : displayOverview,
            "concealOverview" : concealOverview,
            "toggleVisibility" : toggleVisibility
        } );

    };
}( jQuery ) );