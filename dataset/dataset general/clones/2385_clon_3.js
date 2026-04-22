(function ( $lib ) {

    $lib.fn.extend({

     elementHalo : function(configParams) {

         // Establishes default configuration for the visual indicator.
         var visualConfig = $lib.extend({
             baseColor: "rgb(255, 165, 0)", // Default orange color
             animationDuration: 400,       // Speed of transition
             transparencyLevel: 1,         // Full opacity by default
             fadeDelay: 200,               // Delay before fading out
             paddingSize: 2,               // Universal padding
			 depthIndex: -1                // Z-index for the halo
         }, configParams );

         // Ensure horizontal and vertical padding are explicitly set.
         if (visualConfig.horizontalPadding === undefined || visualConfig.horizontalPadding === null) {
             visualConfig.horizontalPadding = visualConfig.paddingSize;
         }

         if (visualConfig.verticalPadding === undefined || visualConfig.verticalPadding === null) {
             visualConfig.verticalPadding = visualConfig.paddingSize;
         }

         // Create the visual indicator element and append it to the body.
         // Using a more verbose creation for clarity.
         var indicatorElement = $lib('<div>', {
             id: 'focus-halo-indicator',
             class: 'js-focus-halo'
         }).appendTo('body');

         // Apply initial CSS styles to the indicator.
         indicatorElement.css({
             "border-radius": "6px",
             "z-index": visualConfig.depthIndex,
             "position": "absolute",
             "background-color": visualConfig.baseColor,
             "opacity": 0,
             "pointer-events": "none" // Ensure the halo doesn't interfere with mouse events
         });

         // Process each selected element to attach event handlers.
         return this.each(function() {
             var currentTarget = $lib(this);

             currentTarget.on( "mouseenter", function() {
                 // Determine border-radius for the indicator.
                 // If not explicitly set in config, try to match the hovered element's radius.
                 if (visualConfig.borderRadius === undefined || visualConfig.borderRadius === null) {
                    let currentElementRadius = parseInt(currentTarget.css("border-radius"), 10);
                    if (isNaN(currentElementRadius) || currentElementRadius <= 0) {
                        visualConfig.borderRadius = 0; // No radius if element has none
                    } else {
                        // Apply padding to the element's border-radius
                        visualConfig.borderRadius = currentElementRadius + visualConfig.verticalPadding;
                    }
                 }
                
                 // Cache current element dimensions and position
                 let elementOffset = currentTarget.offset();
                 let elementHeight = currentTarget.outerHeight(); // Use outerHeight for accurate dimensions
                 let elementWidth = currentTarget.outerWidth();   // Use outerWidth

                 // Calculate new dimensions for the indicator, including padding
                 let targetTop = elementOffset.top - visualConfig.verticalPadding;
                 let targetLeft = elementOffset.left - visualConfig.horizontalPadding;
                 let targetHeight = elementHeight + (visualConfig.verticalPadding * 2);
                 let targetWidth = elementWidth + (visualConfig.horizontalPadding * 2);

                 // Prepare border-radius properties for various browser prefixes
                 let borderRadiusProps = {
                     borderTopLeftRadius: visualConfig.borderRadius, 
                     borderTopRightRadius: visualConfig.borderRadius, 
                     borderBottomLeftRadius: visualConfig.borderRadius, 
                     borderBottomRightRadius: visualConfig.borderRadius,
                     WebkitBorderTopLeftRadius: visualConfig.borderRadius, 
                     WebkitBorderTopRightRadius: visualConfig.borderRadius, 
                     WebkitBorderBottomLeftRadius: visualConfig.borderRadius, 
                     WebkitBorderBottomRightRadius: visualConfig.borderRadius, 
                     MozBorderRadius: visualConfig.borderRadius
                 };

                 // Check if the indicator is currently visible.
                 // If visible, animate its transition; otherwise, set its properties instantly.
                 if (parseFloat(indicatorElement.css('opacity')) > 0) {
                     indicatorElement.stop(true, false).animate({ // Stop current animations, but don't jump to end
                         'top' : targetTop,
                         'left' : targetLeft,
                         'opacity' : visualConfig.transparencyLevel,
                         'height' : targetHeight,
                         'width' : targetWidth,
                         ...borderRadiusProps // Spread operator for dynamic radius properties
                     }, visualConfig.animationDuration, 'easeOutQuad'); // Add easing for smoother animation
                 } else {
                     // Instant placement and display if not currently visible
                     indicatorElement.css({
                         'top' : targetTop,
                         'left' : targetLeft,
                         'height' : targetHeight,
                         'width' : targetWidth,
                         'opacity' : visualConfig.transparencyLevel,
                         ...borderRadiusProps
                     });
                 }
             });
			 
             // Determine which element should trigger the mouseleave event.
             // If a 'containerElement' is specified, use that; otherwise, use the current element.
             const leaveTriggerElement = configParams.containerElement ? $lib(configParams.containerElement) : currentTarget;

             // Log a message for debugging or informational purposes if no explicit container is set.
             if (configParams.containerElement === undefined || configParams.containerElement === null) {
                 // console.debug("No explicit container specified for mouseleave; using individual element.");
             }

             // Attach the mouseleave event handler.
             leaveTriggerElement.on( "mouseleave", function() {
                 indicatorElement.stop(true, false).animate({
                     'opacity' : 0
                 }, visualConfig.fadeDelay);
             });
         });

     } // End of elementHalo function

    }); // End of $lib.fn.extend

}( jQuery )); // Pass jQuery as $lib to avoid conflicts