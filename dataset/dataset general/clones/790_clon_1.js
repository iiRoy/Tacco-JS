( function ( ) {
    'use strict'; /* Enforce strict JavaScript parsing and execution rules. */

    // Declare the Angular module named 'sticky' with an empty array of dependencies.
    var module = angular.module( 'sticky', [ ] ) ;

    /*
     * The main 'sticky' directive definition.
     * This directive makes an element 'stick' to the top or bottom of the viewport
     * when the user scrolls past a certain point.
     */
    module . directive ( 'sticky' , function ( ) {
        return {
            restrict: 'A' , /* Restricts the directive to be used only as an attribute on an HTML element. */
            link: linkFn   // Specifies the linking function for this directive.
        } ; // End of directive definition object.

        // The primary linking function for the 'sticky' directive.
        function linkFn ( $scope , $elem , $attrs ) {
            // Declare all local variables used within the link function.
            // These variables will hold references to elements, states, and configuration.
            var mediaQuery        ,
                stickyClass       ,
                bodyClass         ,
                elem              ,
                $window           ,
                $body             ,
                doc               ,
                initialCSS        ,
                initialStyle      ,
                isPositionFixed   ,
                isSticking        ,
                stickyLine        ,
                offset            ,
                anchor            ,
                prevOffset        ,
                matchMedia        ,
                usePlaceholder    ,
                placeholder       ;

            // Initialize state flags.
            isPositionFixed = false ; /* Flag to indicate if the element is currently fixed. */
            isSticking      = false ; /* Flag to indicate if the element is currently in sticky mode. */

            // Assign the browser's matchMedia function, if available.
            matchMedia = window . matchMedia ;

            /* Element References */
            // Wrap native DOM elements with Angular's jQLite (or jQuery if available).
            $window = angular . element ( window ) ;
            $body   = angular . element ( document . body ) ;
            elem    = $elem [ 0 ] ; // Get the raw DOM element from the jQLite wrapper.
            doc     = document . documentElement ; // Reference to the document's root element (<html>).

            /* Attribute Configuration */
            // Retrieve and parse directive attributes, providing default values.
            mediaQuery     = $attrs . mediaQuery     || false ; // Optional media query string.
            stickyClass    = $attrs . stickyClass    || ''    ; // CSS class to apply when sticky.
            bodyClass      = $attrs . bodyClass      || ''    ; // CSS class to apply to body when sticky.

            // Determine whether to use a placeholder element to prevent content reflow.
            // If 'useplaceholder' attribute is present (even if empty), it's true.
            usePlaceholder = ( $attrs . useplaceholder == undefined ) ? false : true ;

            // Store the initial inline style of the element before any modifications.
            initialStyle = $elem . attr ( 'style' ) ;

            // Parse the 'offset' attribute, converting it to an integer.
            // It allows '50px' or '50'. Defaults to 0 if not provided or invalid.
            offset = ( typeof $attrs . offset === 'string' )
                ? parseInt ( $attrs . offset . replace ( /px;?/ , '' ) )
                : 0 ;

            // Determine the 'anchor' point (where the element sticks: 'top' or 'bottom').
            anchor = ( typeof $attrs . anchor === 'string' )
                ? $attrs . anchor . toLowerCase ( ) . trim ( )
                : 'top' ; // Default anchor is 'top'.

            /* Capture Initial Element Styles */
            // Store the element's original CSS properties to restore them later.
            initialCSS = {
                top       : $elem . css ( 'top' )       ,
                width     : $elem . css ( 'width' )     ,
                position  : $elem . css ( 'position' )  ,
                marginTop : $elem . css ( 'margin-top' ),
                cssLeft   : $elem . css ( 'left' )
            } ; // End of initialCSS object.

            /* Validate Anchor Configuration */
            // Ensure the 'anchor' attribute has a supported value.
            switch ( anchor ) {
                case 'top'    : // Sticking to the top of the viewport.
                case 'bottom' : // Sticking to the bottom of the viewport.
                    break ; // Valid anchor, do nothing.
                default       :
                    // Log a warning for an unsupported anchor type and default to 'top'.
                    console . log ( 'Unknown anchor ' + anchor + ', defaulting to top' ) ;
                    anchor = 'top' ;
                    break ;
            } // End of anchor validation switch.


            /* Event Listeners Setup */
            // Attach event handlers for window scroll and resize events, and scope destruction.
            $window . on ( 'scroll' , checkIfShouldStick ) ; // Handle scrolling to check for stickiness.
            $window . on ( 'resize' , $scope . $apply . bind ( $scope , onResize ) ) ; // Re-evaluate on window resize.
            $scope . $on ( '$destroy' , onDestroy ) ; // Clean up event listeners when the scope is destroyed.

            /**
             * Handles the window resize event.
             * Recalculates element width and stickiness after resize.
             */
            function onResize ( ) {
                initialCSS . offsetWidth = elem . offsetWidth ; // Update the stored initial width.
                unstickElement ( ) ;                           // Temporarily unstick to recalculate positions.
                checkIfShouldStick ( ) ;                       // Then re-check if it should stick.

                // If the element is currently sticking, adjust its width to match its parent's content width.
                if ( isSticking ) {
                    var parent = window . getComputedStyle ( elem . parentElement , null ) ;
                    var initialOffsetWidth = elem . parentElement . offsetWidth
                                           - parseInt ( parent . getPropertyValue ( 'padding-right' ) . replace ( 'px' , '' ) )
                                           - parseInt ( parent . getPropertyValue ( 'padding-left' ) . replace ( 'px' , '' ) ) ;

                    $elem . css ( 'width' , initialOffsetWidth + 'px' ) ; // Apply the calculated width.
                } // End of isSticking width adjustment.
            } // End of onResize function.

            /**
             * Cleans up event listeners and applied classes/elements when the directive's scope is destroyed.
             */
            function onDestroy ( ) {
                // Remove the previously attached event listeners from the window.
                $window . off ( 'scroll' , checkIfShouldStick ) ;
                $window . off ( 'resize' , onResize ) ;

                // If a body class was applied, remove it.
                if ( bodyClass ) {
                    $body . removeClass ( bodyClass ) ;
                } // End of bodyClass cleanup.

                // If a placeholder element was created, remove it from the DOM.
                if ( placeholder ) {
                    placeholder . remove ( ) ;
                } // End of placeholder cleanup.
            } // End of onDestroy function.


            /* Scope Watcher for Element Position */
            // Initialize prevOffset before the watcher starts.
            prevOffset = _getTopOffset ( elem ) ;

            // Set up a watcher on the element's position relative to the viewport.
            // This ensures 'stickyLine' is updated if the element's initial position changes.
            $scope . $watch ( function ( ) { /* This function is triggered on load and during each digest cycle. */
                // If the element is currently sticking, its position relative to the document
                // isn't relevant for recalculating the sticky line, so return the last known offset.
                if ( isSticking ) {
                    return prevOffset ;
                }

                // Calculate the previous offset based on the configured anchor.
                prevOffset =
                    ( anchor === 'top' )
                        ? _getTopOffset ( elem )    // Get distance from top of document.
                        : _getBottomOffset ( elem ) ; // Get distance from bottom of document.

                return prevOffset ; // Return the calculated offset for the watcher to compare.

            } , function ( newVal , oldVal ) {
                // This callback fires if newVal changes or if stickyLine hasn't been defined yet.
                if ( ( newVal !== oldVal ) || ( typeof stickyLine === 'undefined' ) ) {
                    stickyLine = newVal - offset ; // Calculate the actual scroll position where sticking should occur.
                    checkIfShouldStick ( ) ;       // Re-evaluate stickiness based on the new stickyLine.
                } // End of stickyLine update logic.
            } ) ; // End of $scope.$watch.


            /* Core Logic Functions */

            /**
             * Determines whether the element should currently be in a sticky state or not.
             * This function is called on scroll and other events.
             */
            function checkIfShouldStick ( ) {
                var scrollTop        , // Current scroll position from the top.
                    shouldStick      , // Boolean indicating if the element should be sticky.
                    scrollBottom     , // Current scroll position from the bottom.
                    scrolledDistance ; // Total distance scrolled from the top of the document.

                // If a media query is specified, check if it matches the current viewport.
                // If not, the sticky behavior is disabled for this media state.
                if ( mediaQuery && ! ( matchMedia ( '(' + mediaQuery + ')' ) . matches || matchMedia ( mediaQuery ) . matches ) ) {
                    return ; // Exit early if media query conditions are not met.
                }

                // Logic differs based on whether the element sticks to the 'top' or 'bottom'.
                if ( anchor === 'top' ) {
                    scrolledDistance = window . pageYOffset || doc . scrollTop ; // Get vertical scroll position.
                    scrollTop        = scrolledDistance - ( doc . clientTop || 0 ) ; // Adjust for clientTop.
                    shouldStick      = scrollTop >= stickyLine ; // Should stick if scrolled past the sticky line.
                } else { /* anchor === 'bottom' */
                    scrollBottom     = window . pageYOffset + window . innerHeight ; // Calculate viewport bottom.
                    shouldStick      = scrollBottom <= stickyLine ; // Should stick if viewport bottom is above or at sticky line.
                }

                // Based on the 'shouldStick' determination, either stick or unstick the element.
                // This prevents redundant calls if the state hasn't changed.
                if ( shouldStick && ! isSticking ) {
                    stickElement ( ) ; // Transition to sticky mode.
                } else if ( ! shouldStick && isSticking ) {
                    unstickElement ( ) ; // Transition out of sticky mode.
                }
            } // End of checkIfShouldStick function.

            /**
             * Applies the necessary CSS styles to make the element stick.
             * This involves changing its position to 'fixed' and setting appropriate offsets.
             */
            function stickElement ( ) {
                var rect         , // Bounding client rectangle of the element.
                    absoluteLeft ; // The 'left' position of the element relative to the viewport.

                rect         = $elem [ 0 ] . getBoundingClientRect ( ) ; // Get current size and position.
                absoluteLeft = rect . left ;                             // Capture the current left position.

                initialCSS . offsetWidth = elem . offsetWidth ; // Store the current width for later use.

                isSticking = true ; // Update the state flag to indicate the element is now sticky.

                // Apply custom classes if provided by attributes.
                if ( bodyClass ) {
                    $body . addClass ( bodyClass ) ; // Add class to the body.
                }
                if ( stickyClass ) {
                    $elem . addClass ( stickyClass ) ; // Add class to the sticky element.
                }

                // Apply inline styles to make the element fixed.
                $elem
                    . css ( 'width'      , elem . offsetWidth + 'px' ) // Maintain current width.
                    . css ( 'position'   , 'fixed'                     ) // Fix position relative to viewport.
                    . css ( anchor       , offset + 'px'               ) // Set top/bottom offset.
                    . css ( 'left'       , absoluteLeft + 'px'         ) // Maintain current horizontal position.
                    . css ( 'margin-top' , 0                             ) ; // Remove margin-top.

                // Specific adjustment for 'bottom' anchor.
                if ( anchor === 'bottom' ) {
                    $elem . css ( 'margin-bottom' , 0 ) ; // Remove margin-bottom if sticking to bottom.
                }

                // If 'usePlaceholder' is enabled, create and insert a placeholder element.
                // This prevents the content below from jumping up when the element becomes fixed.
                if ( usePlaceholder ) {
                    placeholder = angular . element ( "<div>" ) ; // Create a new div element.
                    var elementsHeight = $elem [ 0 ] . offsetHeight ; // Get the height of the sticky element.
                    placeholder . css ( "height" , elementsHeight + "px" ) ; // Set placeholder height.
                    $elem . after ( placeholder ) ; // Insert the placeholder immediately after the sticky element.
                } // End of placeholder creation.
            } // End of stickElement function.

            /**
             * Reverts the element's styles to its original state, making it unstick.
             * This removes fixed positioning and restores initial attributes.
             */
            function unstickElement ( ) {
                $elem . attr ( 'style' , $elem . initialStyle ) ; // Attempt to restore initial inline style.
                isSticking = false ; // Update the state flag.

                // Remove custom classes if they were applied.
                if ( bodyClass ) {
                    $body . removeClass ( bodyClass ) ; // Remove class from the body.
                }
                if ( stickyClass ) {
                    $elem . removeClass ( stickyClass ) ; // Remove class from the sticky element.
                }

                // Reset inline styles to their initial or default values.
                $elem
                    . css ( 'width'      , ''                 ) // Reset width (often to auto).
                    . css ( 'top'        , initialCSS . top   ) // Restore original 'top' value.
                    . css ( 'position'   , initialCSS . position ) // Restore original 'position' (e.g., 'static').
                    . css ( 'left'       , initialCSS . cssLeft ) // Restore original 'left' value.
                    . css ( 'margin-top' , initialCSS . marginTop ) ; // Restore original 'margin-top'.

                // If a placeholder was used, remove it from the DOM.
                if ( placeholder ) {
                    placeholder . remove ( ) ;
                } // End of placeholder removal.
            } // End of unstickElement function.

            /**
             * Helper function to calculate the total top offset of an element relative to the document.
             * @param {HTMLElement} element The DOM element to measure.
             * @returns {number} The total offset from the top of the document in pixels.
             */
            function _getTopOffset ( element ) {
                var pixels = 0 ; // Initialize accumulator for pixels.

                // Traverse up the offsetParent chain to sum up all offsetTop values.
                if ( element . offsetParent ) {
                    do {
                        pixels  += element . offsetTop ; // Add current element's offset from its parent.
                        element  = element . offsetParent ; // Move to the next parent.
                    } while ( element ) ; // Continue until no more offsetParents.
                }

                return pixels ; // Return the cumulative top offset.
            } // End of _getTopOffset function.

            /**
             * Helper function to calculate the total bottom offset of an element relative to the document.
             * This is the top offset plus the element's own height.
             * @param {HTMLElement} element The DOM element to measure.
             * @returns {number} The total offset from the top of the document to the bottom of the element.
             */
            function _getBottomOffset ( element ) {
                return element . offsetTop + element . clientHeight ; // Sum top offset and client height.
            } // End of _getBottomOffset function.

        } // End of linkFn function.

    } ) ; // End of module.directive('sticky').

    /*
     * matchMedia Polyfill (Shiv) for older browsers.
     * Provides a basic fallback for window.matchMedia if it's not natively supported.
     * This ensures the directive doesn't break, though media queries won't function.
     */
    window . matchMedia = window . matchMedia || ( function ( ) {
        var warning = 'angular-sticky: This browser does not support ' +
                      'matchMedia, therefore the minWidth option will not work on ' +
                      'this browser. Please consider polyfilling matchMedia to fix this issue.' ;

        // Log a warning to the console if matchMedia is unavailable.
        if ( window . console && console . warn ) {
            console . warn ( warning ) ;
        } // End of console warning check.

        // Return a dummy function that always indicates a match, effectively disabling media query checks.
        return function ( ) {
            return {
                matches : true // Always returns true, so media queries are always considered 'matched'.
            } ;
        } ; // End of dummy matchMedia function.
    } ( ) ) ; // End of matchMedia polyfill IIFE.

} ( ) ) ; // End of the main IIFE encapsulating the entire script.