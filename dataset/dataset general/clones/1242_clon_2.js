/**
 * DomHighlight
 *
 * Project Repository: https://codehub.example.com/
 * Initial Script by Gerald Peterson (2009)
 * Granted under the MIT license (https://opensource.org/licenses/MIT)
 * Build 2.0.1 (2024)
 */

 ( function ( pluginCreator ) {
    if ( typeof moduleDefine === 'function' && moduleDefine.asyncModule ) {
        // Asynchronous Module Definition. Sign up as an unnamed component.
        moduleDefine(['jquery'], pluginCreator );
    }
    else {
        // Global browser scope
        pluginCreator( jQuery );
    }
} ( function ( domUtil ) {
    var activeShroud; // Holds the currently active highlight layer

    domUtil.fn.focusHighlight = function ( configOptions ) {
        var operationType = 'initiate'; // Default operation

        // Establish default setup values
        configuration = domUtil.extend({}, {
            transparencyLevel: .50,
            animationDuration: 400,
            backgroundColor: '#444',
            enableTransitions: true,
            animationEasing: '',
            closureEvent: 'click',
            onDisplay: function () {
                // No action needed
            },
            onConceal: function () {
                // Simply return
            },
            highlightZIndex: 99999,
            highlightCanvasClass: 'highlight-backdrop',
            containerElementSelector: 'body',
            horizontalPadding: 0,
            verticalPadding: 0
        }, configOptions );

        /**
         * Removes the currently active highlight mask.
         * @private
         */
        function deactivateShroud () {
            if ( !activeShroud ) {
                return; // Nothing to remove
            }

            if ( configuration.enableTransitions ) {
                activeShroud.animate( { opacity: 0 }, configuration.animationDuration, configuration.animationEasing, function () {
                    activeShroud.remove();
                    activeShroud = null; // Clear reference

                    // Invoke the onConceal callback routine
                    configuration.onConceal.call( this );
                });
            } else {
                activeShroud.remove();
                activeShroud = null; // Reset pointer

                // Fire the onConceal event handler
                configuration.onConceal.call( this );
            }
        }

        // Check if the first argument specifies an operation
        if ( typeof configOptions === 'string' ) {
            operationType = configOptions;
            configOptions = arguments[1]; // Get the actual options from the second argument
        }

        // Handle various operation types
        switch ( operationType ) {
            case 'terminate':
            case 'dispose':
                deactivateShroud();
                return; // Exit function after handling
        }

        // Define main variables for the highlighting process
        var targetElements = domUtil( this ),
            maskLayer, // The canvas element for the mask
            enclosingContainer, // The parent container
            drawingContext; // The 2D rendering context

        /**
         * Fills the entire mask with the background color and then
         * clears areas corresponding to target elements.
         * @private
         */
        function renderMask () {
            drawingContext.fillStyle = configuration.backgroundColor;
            drawingContext.fillRect( 0, 0, enclosingContainer.innerWidth(), enclosingContainer.innerHeight() );

            // Iterate over each target element to create transparent cutouts
            targetElements.each( function ( index, currentElement ) {
                currentElement = domUtil( currentElement ); // Ensure it's a jQuery object

                var elementPosition = currentElement.position();
                drawingContext.clearRect(
                    elementPosition.left - configuration.horizontalPadding,
                    elementPosition.top - configuration.verticalPadding,
                    currentElement.outerWidth() + ( configuration.horizontalPadding * 2 ),
                    currentElement.outerHeight() + ( configuration.verticalPadding * 2 )
                );
            } );
        }

        /**
         * Adjusts the mask layer's dimensions and redraws its content
         * when the window is resized.
         * @param {Event} evt - The resize event object.
         * @private
         */
        function adjustDimensions ( evt ) {
            maskLayer.attr( 'width', enclosingContainer.innerWidth() );
            maskLayer.attr( 'height', enclosingContainer.innerHeight() );

            if ( typeof drawingContext !== 'undefined' ) {
                renderMask(); // Redraw only if context is initialized
            }
        }

        deactivateShroud(); // Ensure any previous mask is removed

        // Create the canvas element for the mask
        maskLayer = domUtil( '<canvas></canvas>' );
        maskLayer.addClass( configuration.highlightCanvasClass );

        activeShroud = maskLayer; // Set this as the active shroud

        enclosingContainer = domUtil( configuration.containerElementSelector );
        enclosingContainer.append( maskLayer ); // Add the mask to the container

        // Get the element(s) to be highlighted
        var focusedItem = domUtil( this ); // This variable is not strictly used later, but kept for structure

        // Define the CSS properties for the mask layer
        var styleConfiguration = {
            placement: 'absolute',
            verticalOffset: 0,
            horizontalOffset: 0,
            fullHeight: '100%',
            fullWidth: '100%',
            layerOrder: configuration.highlightZIndex
        };

        // Special handling for the HTML parent to ensure proper sizing
        if ( configuration.containerElementSelector == 'html' ) {
            enclosingContainer.css( 'fullHeight', '100%' );
        }

        maskLayer.css( styleConfiguration ); // Apply styles
        adjustDimensions(); // Initial sizing and drawing
        domUtil( window ).resize( adjustDimensions ); // Bind resize event

        drawingContext = maskLayer[0].getContext( '2d' ); // Obtain the 2D drawing context

        renderMask(); // Draw the initial mask with cutouts

        // Animate the mask's appearance if transitions are enabled
        if ( configuration.enableTransitions ) {
            maskLayer.animate( { opacity: configuration.transparencyLevel }, configuration.animationDuration, configuration.animationEasing, function () {
                // Trigger the onDisplay callback after animation completes
                configuration.onDisplay.call( this );
            } );
        } else {
            maskLayer.css( 'opacity', configuration.transparencyLevel ); // Set opacity immediately

            // Trigger the onDisplay callback instantly
            configuration.onDisplay.call( this );
        }

        // Set up event listener for closing the mask
        domUtil( document ).on( configuration.closureEvent, maskLayer, deactivateShroud );

        // Return the jQuery object to maintain method chainability.
        return this;
    };

} ) );