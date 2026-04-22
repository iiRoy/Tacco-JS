/*
 *  This is a Type I clone of the original JavaScript code.
 *  The MIT License (MIT)
 *
 *  Copyright (c) 2014 Prince John Wesley <princejohnwesley@gmail.com>
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 *
 *  This file has been altered only in whitespace and comments to create a Type I clone.
 */


( function ( $ , undefined ) {

    "use strict" ; // Enforce strict mode for cleaner code.


    // Define the minimap plugin on jQuery's prototype.
    $.fn.minimap = function ( options ) {

        // Store the jQuery object for the element(s) this plugin is called on.
        var minimap = this ;

        // Cache the window jQuery object.
        var $window = $( window ) ;

        // A no-operation function to serve as a default callback.
        var fn = function ( ) { } ;

        // Flag to track the visibility state of the minimap.
        var shown = true ;


        // Default configuration settings for the minimap.
        var defaults = {
            heightRatio         : 0.6 ,     // Ratio of minimap height to original element height.
            widthRatio          : 0.05 ,    // Ratio of minimap width to original element width.
            offsetHeightRatio   : 0.035 ,   // Vertical offset from the window top.
            offsetWidthRatio    : 0.035 ,   // Horizontal offset from the window edge.
            position            : "right" , // Position of the minimap ('right' or 'left').
            touch               : true ,    // Enable touch support.
            smoothScroll        : true ,    // Enable smooth scrolling on click/drag.
            smoothScrollDelay   : 200 ,     // Delay in milliseconds for smooth scrolling animation.
            onPreviewChange     : fn        // Callback function on preview area change.
        } ;


        // Merge default settings with user-provided options.
        var settings = $.extend( { } , defaults , options ) ;

        // Allowed positions for the minimap.
        var position = [ "right" , "left" ] ;


        /**
         * Validates a given property and its value against predefined rules.
         * Throws an error if validation fails.
         *
         * @param {string} prop - The name of the property to validate.
         * @param {*} value - The value of the property.
         */
        var validateProps = function ( prop , value ) {

            switch ( prop ) {

                case 'heightRatio' :
                    var heightRatio = value ;
                    // Height ratio must be a number between 0 (exclusive) and 1 (inclusive).
                    if ( ! $.isNumeric( heightRatio ) || heightRatio <= 0.0 || heightRatio > 1.0 )
                        throw "Invalid heightRatio: " + heightRatio ;
                    break ;

                case 'widthRatio' :
                    var widthRatio = value ;
                    // Width ratio must be a number between 0 (exclusive) and 0.5 (inclusive).
                    if ( ! $.isNumeric( widthRatio ) || widthRatio <= 0.0 || widthRatio > 0.5 )
                        throw "Invalid widthRatio: " + widthRatio ;
                    break ;

                case 'offsetHeightRatio' :
                    var offsetHeightRatio = value ;
                    // Offset height ratio must be a number between 0 (inclusive) and 0.9 (inclusive).
                    if ( ! $.isNumeric( offsetHeightRatio ) || offsetHeightRatio < 0.0 || offsetHeightRatio > 0.9 )
                        throw "Invalid offsetHeightRatio: " + offsetHeightRatio ;
                    break ;

                case 'offsetWidthRatio' :
                    var offsetWidthRatio = value ;
                    // Offset width ratio must be a number between 0 (inclusive) and 0.9 (inclusive).
                    if ( ! $.isNumeric( offsetWidthRatio ) || offsetWidthRatio < 0.0 || offsetWidthRatio > 0.9 )
                        throw "Invalid offsetWidthRatio: " + offsetWidthRatio ;
                    break ;

                case 'position' :
                    var p = value.toLowerCase( ) ;
                    var pos = position.indexOf( p ) ;
                    // Position must be one of the allowed values.
                    if ( pos === -1 ) throw "Invalid position: " + settings.position ;
                    settings.position = p ; // Update setting to validated lowercase value.
                    break ;

                case 'smoothScrollDelay' :
                    var smoothScrollDelay = value ;
                    // Smooth scroll delay must be an integer and at least 4ms.
                    if ( ( ( smoothScrollDelay | 0 ) !== smoothScrollDelay ) || smoothScrollDelay < 4 )
                        throw "Invalid smoothScrollDelay(in ms): " + smoothScrollDelay ;
                    break ;

                case 'touch' :
                case 'smoothScroll' :
                    // These are boolean flags, no specific numeric validation.
                    break ;

                case 'onPreviewChange' :
                    var fn = value ;
                    // onPreviewChange must be a function.
                    if ( ! fn || ! $.isFunction( fn ) )
                        throw "Invalid onPreviewChange: " + value ;
                    break ;

                default :
                    throw "Invalid validation property: " + prop ;
            }
        } ;


        // Validate all settings after merging.
        for ( var prop in settings ) {
            validateProps( prop , settings[ prop ] ) ;
        }


        // Create a clone of the original element to serve as the minimap.
        var miniElement = minimap.clone( ) ;

        // Remove existing minimap and miniregion elements from the clone to prevent nesting.
        miniElement.find( '.minimap.noselect' ).remove( ) ;
        miniElement.find( '.miniregion' ).remove( ) ;

        // Add necessary classes to the minimap element.
        miniElement.addClass( 'minimap noselect' ) ;

        // Disable pointer events on children of the minimap to prevent interaction with cloned content.
        miniElement.children( ).each( function ( ) { $( this ).css( { 'pointer-events' : 'none' } ) ; } ) ;


        // Create the region element which highlights the visible area in the minimap.
        var region = $( '<div class="miniregion"> </div>' ) ;


        // Append the region and the minimap to the body.
        $( $( 'body' )[ 0 ] ).append( region ) ;
        $( $( 'body' )[ 0 ] ).append( miniElement ) ;


        /**
         * Calculates the scaling factors for the minimap based on window and original element dimensions.
         * @returns {object} An object containing x and y scaling factors.
         */
        var scale = function ( ) {
            return {
                x : ( $window.width( ) / minimap.width( ) ) * settings.widthRatio ,
                y : ( $window.height( ) / minimap.height( ) ) * settings.heightRatio
            } ;
        } ;


        /**
         * Handles window resize events, adjusting the minimap and region sizes and positions.
         * @param {Event} e - The resize event object.
         */
        var onResizeHandler = function ( e ) {
            if ( ! shown ) return ; // Do nothing if minimap is hidden.

            var s = scale( ) ; // Get current scaling factors.

            // Construct the CSS transform scale string.
            var sc = 'scale(' + s.x + ',' + s.y + ')' ;

            // Calculate vertical offset from the top of the window.
            var offsetTop = $window.height( ) * settings.offsetHeightRatio ;

            // Calculate horizontal offset from the left/right edge of the window.
            var offsetLeftRight = $window.width( ) * settings.offsetWidthRatio ;

            // Calculate the top position of the minimap.
            var top = minimap.height( ) * ( s.y - 1 ) / 2 + offsetTop ;

            // Calculate the left/right position of the minimap.
            var leftRight = minimap.width( ) * ( s.x - 1 ) / 2 + offsetLeftRight ;

            // Calculate the actual width of the minimap based on its scaled size.
            var width = $window.width( ) * ( 1 / s.x ) * settings.widthRatio ;

            // Calculate the actual height of the minimap based on its scaled size.
            var height = $window.height( ) * ( 1 / s.y ) * settings.heightRatio ;

            // Define the CSS properties for the minimap element.
            var css = {
                '-webkit-transform' : sc ,
                '-moz-transform'    : sc ,
                '-ms-transform'     : sc ,
                '-o-transform'      : sc ,
                'transform'         : sc ,
                'top'               : top ,
                'width'             : width ,
                'height'            : height ,
                'margin'            : '0px' ,
                'padding'           : '0px'
            } ;

            // Set the horizontal position (left or right) dynamically.
            css[ settings.position ] = leftRight ;

            // Apply the CSS to the minimap.
            miniElement.css( css ) ;


            // Calculate the top position of the original minimap content relative to its scaled version.
            var regionTop = minimap.offset( ).top * s.y ;

            // Define the CSS properties for the region element.
            var cssRegion = {
                width   : miniElement.width( ) * s.x ,  // Region width matches scaled minimap width.
                height  : $window.height( ) * s.y ,     // Region height matches scaled window height.
                margin  : '0px' ,
                top     : $window.scrollTop( ) * s.y + offsetTop - regionTop + 'px' // Position based on scroll.
            } ;

            // Set the horizontal position of the region.
            cssRegion[ settings.position ] = offsetLeftRight + 'px' ;

            // Apply the CSS to the region.
            region.css( cssRegion ) ;

            // Invoke the onPreviewChange callback with the minimap element and scale factors.
            settings.onPreviewChange( miniElement , s ) ;
        } ;


        /**
         * Handles window scroll events, adjusting the region's vertical position and visibility.
         * @param {Event} e - The scroll event object.
         */
        var onScrollHandler = function ( e ) {
            if ( ! shown ) return ; // Do nothing if minimap is hidden.

            var s = scale( ) ; // Get current scaling factors.

            // Calculate vertical offset from the top of the window.
            var offsetTop = $window.height( ) * settings.offsetHeightRatio ;

            // Calculate the top position of the original minimap content relative to its scaled version.
            var top = minimap.offset( ).top * s.y ;

            // Calculate the scaled scroll position of the window.
            var pos = ( $window.scrollTop( ) ) * s.y ;

            // Get the outer height of the region.
            var regionHeight = region.outerHeight( true ) ;

            // Calculate the bottom boundary of the minimap content.
            var bottom = minimap.outerHeight( true ) * s.y + top ;

            // Check if the region is outside the visible minimap area.
            if ( pos + regionHeight + offsetTop < top || pos > bottom ) {
                region.css( {
                    display : 'none' , // Hide the region if out of bounds.
                } ) ;
            } else {
                region.css( {
                    top     : pos + offsetTop - top + 'px' , // Adjust region's top position.
                    display : 'block' // Show the region.
                } ) ;
            }
        } ;


        // Flag to indicate if a mouse button is currently down.
        var mousedown = false ;

        // Flag to indicate if smooth scrolling animation is in progress.
        var onSmoothScroll = false ;

        /**
         * Scrolls the main window to a target position based on a click/drag event on the minimap.
         * @param {Event} e - The event object (click or mousemove).
         */
        var scrollTop = function ( e ) {
            if ( ! shown ) return ; // Do nothing if minimap is hidden.

            var s = scale( ) ; // Get current scaling factors.

            // Calculate vertical offset from the top of the window.
            var offsetTop = $window.height( ) * settings.offsetHeightRatio ;

            // Calculate the top position of the original minimap content relative to its scaled version.
            var top = minimap.offset( ).top * s.y ;

            // Calculate the target scroll position in the main content.
            var target = ( e.clientY - offsetTop + top ) / s.y ;

            // Handle smooth scrolling if enabled and it's a click event.
            if ( e.type === 'click' && settings.smoothScroll ) {

                var current = $window.scrollTop( ) ; // Current scroll position.
                var maxTarget = minimap.outerHeight( true ) ; // Maximum scrollable height.

                // Clamp target to valid scroll range.
                target = Math.max( target , Math.min( target , maxTarget ) ) ;

                var direction = target > current ; // Scrolling up or down.
                var delay = settings.smoothScrollDelay ; // Desired total delay for smooth scroll.
                var distance = Math.abs( current - target ) ; // Total distance to scroll.
                var r = delay / distance ; // Ratio of delay to distance.

                var unitScroll = 1 ; // Default scroll increment.
                var unitDelay = 4 ; // Default delay between increments.

                // Adjust unitScroll and unitDelay based on desired smoothness and distance.
                if ( r >= 4 ) {
                    unitDelay = parseInt( unitScroll ) ;
                } else if ( r >= 1 ) {
                    unitScroll = parseInt( r ) * 4 ;
                } else {
                    unitScroll = ( 4 / r ) ;
                }

                var next = current ; // Current position during smooth scroll.
                var count = parseInt( distance / unitScroll ) ; // Number of steps for smooth scroll.

                onSmoothScroll = true ; // Set flag to indicate smooth scroll is active.

                // Inner function for linear smooth translation.
                var smoothScroll = function ( ) {
                    next = next + ( direction ? unitScroll : - unitScroll ) ; // Move to the next position.
                    if ( --count <= 0 ) {
                        clearInterval( timer ) ; // Stop the timer when done.
                        onSmoothScroll = false ; // Reset smooth scroll flag.
                        next = target ; // Ensure final position is exactly the target.
                    }
                    $window.scrollTop( next ) ; // Apply the scroll.
                } ;

                // Start the interval timer for smooth scrolling.
                var timer = window.setInterval( smoothScroll , unitDelay ) ;
            } else {
                $window.scrollTop( target ) ; // Instant scroll if not smooth or not a click.
            }
            e.stopPropagation( ) ; // Prevent event bubbling.
        } ;


        /**
         * Handles mouseup events, resetting the mousedown flag.
         * @param {Event} e - The mouseup event object.
         */
        var onMouseupHandler = function ( e ) {
            mousedown = false ;
        } ;


        /**
         * Handles mousemove events for dragging the region, if mousedown and not smooth scrolling.
         * @param {Event} e - The mousemove event object.
         */
        var onMousemoveHandler = function ( e ) {
            if ( ! mousedown || onSmoothScroll ) return ; // Only drag if mouse is down and not smooth scrolling.
            scrollTop( e ) ; // Scroll to the new position.
        } ;


        /**
         * Handles click events on the minimap/region, triggering a scroll.
         * @param {Event} e - The click event object.
         */
        var onClickHandler = function ( e ) {
            scrollTop( e ) ; // Scroll to the clicked position.
            mousedown = false ; // Ensure mousedown flag is reset after click.
        } ;


        /**
         * Handles mousedown events, setting the mousedown flag.
         * @param {Event} e - The mousedown event object.
         */
        var onMousedownHandler = function ( e ) {
            mousedown = true ;
        } ;


        // Initial setup calls and event bindings.
        onResizeHandler( ) ; // Perform an initial resize to set up minimap.

        $window.on( 'resize' , onResizeHandler ) ; // Bind resize event.
        $window.on( 'scroll' , onScrollHandler ) ; // Bind scroll event.

        // Bind mouse events to the region element.
        $( region ).on( 'mousedown' , onMousedownHandler ) ;
        $( region ).on( 'mouseup' , onMouseupHandler ) ;
        $( region ).on( 'mousemove' , onMousemoveHandler ) ;
        $( region ).on( 'click' , onClickHandler ) ;

        // Bind mouse events to the minimap element.
        $( miniElement ).on( 'mousedown' , onMousedownHandler ) ;
        $( miniElement ).on( 'mouseup' , onMouseupHandler ) ;
        $( miniElement ).on( 'mousemove' , onMousemoveHandler ) ;
        $( miniElement ).on( 'click' , onClickHandler ) ;


        var lastTouchType = '' ; // Keep track of the last touch event type.

        /**
         * Generic touch event handler that simulates mouse events for compatibility.
         * @param {Event} e - The touch event object.
         */
        var touchHandler = function ( e ) {
            var touches = e.changedTouches ; // Get the list of touch points.

            // Ignore multi-touch gestures.
            if ( touches.length > 1 ) return ;

            var touch = touches[ 0 ] ; // Get the first touch point.
            var events = [ "touchstart" , "touchmove" , "touchend" ] ; // Touch event types.
            var mouseEvents = [ "mousedown" , "mousemove" , "mouseup" ] ; // Corresponding mouse event types.
            var ev = events.indexOf( e.type ) ; // Find the index of the current touch event type.

            if ( ev === -1 ) return ; // If it's not a recognized touch event, exit.

            var type = mouseEvents[ ev ] ; // Default simulated mouse event type.

            // If it's a touchend after a touchstart, simulate a click.
            if ( e.type === events[ 2 ] && lastTouchType === events[ 0 ] ) {
                type = "click" ;
            }


            // Create a simulated mouse event.
            var simulatedEvent = document.createEvent( "MouseEvent" ) ;
            simulatedEvent.initMouseEvent( type , true , true , window , 1 ,
                touch.screenX , touch.screenY ,
                touch.clientX , touch.clientY , false ,
                false , false , false , 0 , null ) ;

            // Dispatch the simulated event on the target.
            touch.target.dispatchEvent( simulatedEvent ) ;
            e.preventDefault( ) ; // Prevent default touch behavior (e.g., scrolling).
            lastTouchType = e.type ; // Update the last touch event type.
        } ;


        // If touch support is enabled in settings, bind touch event listeners.
        if ( settings.touch ) {

            document.addEventListener( "touchstart" , touchHandler , true ) ;
            document.addEventListener( "touchmove" , touchHandler , true ) ;
            document.addEventListener( "touchend" , touchHandler , true ) ;
            document.addEventListener( "touchcancel" , touchHandler , true ) ; // Handle touch cancellation.

        }


        /**
         * Sets the position of the minimap (left or right).
         * @param {string} pos - The new position string.
         */
        var setPosition = function ( pos ) {
            var oldValue = settings.position ; // Store the current position.
            validateProps( 'position' , pos ) ; // Validate the new position.

            // If the position actually changed, update CSS and redraw.
            if ( oldValue !== settings.position ) {
                var css = { } ;
                css[ oldValue ] = '' ; // Clear the old position property.
                onResizeHandler( ) ; // Recalculate and apply new layout.
                region.css( css ) ;
                miniElement.css( css ) ;
            }
        } ;


        /**
         * Factory function to create setters for various properties.
         * @param {string} propName - The name of the property to set.
         * @param {boolean} redraw - True if the minimap needs to be redrawn after setting the property.
         * @returns {Function} A setter function for the specified property.
         */
        var setProperty = function ( propName , redraw ) {
            return function ( value ) {
                validateProps( propName , value ) ; // Validate the new value.
                settings[ propName ] = value ; // Update the setting.
                if ( redraw ) onResizeHandler( ) ; // Redraw if required.
            } ;
        } ;


        /**
         * Makes the minimap and region visible.
         */
        var show = function ( ) {
            if ( shown ) return ; // Do nothing if already shown.
            miniElement.show( ) ;
            region.show( ) ;
            shown = true ;
            onResizeHandler( ) ; // Redraw to ensure correct positioning.
        } ;


        /**
         * Hides the minimap and region.
         */
        var hide = function ( ) {
            if ( ! shown ) return ; // Do nothing if already hidden.
            miniElement.hide( ) ;
            region.hide( ) ;
            shown = false ;
        } ;


        /**
         * Toggles the visibility of the minimap and region.
         */
        var toggle = function ( ) {
            miniElement.toggle( ) ;
            region.toggle( ) ;
            shown = ! shown ; // Invert the shown state.
            if ( shown ) onResizeHandler( ) ; // Redraw if minimap becomes visible.
        } ;


        // Extend the original jQuery object with minimap API methods and return it.
        return $.extend( { } , this , {
            "setPosition"           : setPosition ,
            "setHeightRatio"        : setProperty( 'heightRatio' , true ) ,
            "setWidthRatio"         : setProperty( 'widthRatio' , true ) ,
            "setOffsetHeightRatio"  : setProperty( 'offsetHeightRatio' , true ) ,
            "setOffsetWidthRatio"   : setProperty( 'offsetWidthRatio' , true ) ,
            "setSmoothScroll"       : setProperty( 'smoothScroll' ) ,
            "setSmoothScrollDelay"  : setProperty( 'smoothScrollDelay' ) ,
            "show"                  : show ,
            "hide"                  : hide ,
            "toggle"                : toggle
        } ) ;

    } ; // End of $.fn.minimap definition.

} ( jQuery ) ) ; // End of Immediately Invoked Function Expression (IIFE).