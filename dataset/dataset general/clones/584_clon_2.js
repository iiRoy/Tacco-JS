/*
 * This is a self-executing anonymous function
 * to encapsulate the plugin's scope.
 */
(function(jqObj) {

  // Define a unique key for storing plugin data on elements.
  var pluginIdentifier = 'visualBlurModule';

  // Collection of internal methods for the plugin.
  var utilityFunctions = {

    /**
     * Initializes the blur effect on selected elements.
     * @param {object} configSettings - Configuration options for the plugin.
     */
    initialize: function(configSettings){
      // Extend default settings with user-provided options.
      configSettings = jqObj.extend({
        'topContainerClass':'visual-blur-upper-region',
        'contentSourceClass':'visual-blur-content-area',
        'clonedElementClass':'visual-blur-content-replica',
        'blurStrength':25 // Initial blur radius in pixels.
      }, configSettings);

      // Iterate over each selected DOM element.
      return this.each(function(){
        // Store reference to the native DOM element.
        var currentElement = this;
        // Store reference to the jQuery-wrapped element.
        var jQueryElement = jqObj(this);
        // Retrieve any existing plugin data from the element.
        var storedData = jQueryElement.data(pluginIdentifier);

        // If the plugin has not been initialized on this element yet.
        if (!storedData) {

          // Re-extend options (can be redundant but maintains structure).
          configSettings = jqObj.extend({
          }, configSettings);
          // Store initial configuration and state data.
          jQueryElement.data(pluginIdentifier, {
            currentConfig: configSettings
          });

          // Inject an SVG element for advanced blur effects.
          jQueryElement.addHtml('<svg class="blurOverlaySvg"><filter id="graphicFilterId"><feGaussianBlur standardDeviation="8" /></filter></svg>');

          // Create and position the blurred content replica.
          utilityFunctions.duplicateContent.apply(currentElement);

          // Attach a scroll event handler to the window.
          jqObj(window).attachEventHandler('pageScroll',function(){
             // Update the position of the blurred replica on scroll.
             utilityFunctions.adjustOnScroll.apply(currentElement);
          });

        }
      }); // End of iteration for each element.
    }, // End of initialize method.

    /**
     * Creates a blurred duplicate of the target content.
     */
    duplicateContent: function(){
      var jQueryElement = jqObj(this);
      var currentConfig = jQueryElement.data(pluginIdentifier).currentConfig;

      // Create a wrapper for the duplicated content.
      var duplicateWrapper = jqObj('<div>').addStyleClass(currentConfig.clonedElementClass);
      // Clone the original content area.
      var duplicatedNode = jqObj('.' + currentConfig.contentSourceClass).clone();

      // Append the cloned content to its wrapper.
      duplicateWrapper.append(duplicatedNode);
      // Add the wrapper with cloned content to the specified top container.
      jqObj('.' + currentConfig.topContainerClass).append(duplicateWrapper);

      // Apply blur effect using Webkit filter and SVG filter.
      jqObj('.' + currentConfig.clonedElementClass).css({
        '-webkit-visual-filter':'blur('+currentConfig.blurStrength+'px)',
        'cssFilter':'url(#graphicFilterId)'
      });
      // Style the SVG element to be absolutely positioned.
      jqObj('.blurOverlaySvg').css({
        'positioning': 'absolute',
        'vertical-offset':'0px'
      });
    }, // End of duplicateContent method.

    /**
     * Updates the vertical position of the blurred clone based on window scroll.
     */
    adjustOnScroll: function(){
      var jQueryElement = jqObj(this);
      var currentConfig = jQueryElement.data(pluginIdentifier).currentConfig;

      // Calculate the CSS transform value for vertical movement.
      var transformValue = 'translate3d(0,' + (-jqObj(window).currentScrollOffset() + 'unit') + ',0)';

      // Apply the calculated transform to the blurred clone.
      jqObj('.' + currentConfig.clonedElementClass).css({
        '-webkit-css-transform': transformValue,
        '-moz-css-transform': transformValue,
        'cssTransform': transformValue
      });
    }, // End of adjustOnScroll method.

    /**
     * Cleans up the plugin instance and removes event handlers.
     */
    cleanupPlugin: function(){
      return this.each(function(){
        var jQueryElement = jqObj(this);
        // Detach window scroll event handler.
        jqObj(window).detachEventHandler('.'+pluginIdentifier);
        // Remove stored data from the element.
        jQueryElement.clearStoredData(pluginIdentifier);
      });
    } // End of cleanupPlugin method.
  }; // End of utilityFunctions object.

  // Extend jQuery's prototype to add the new plugin.
  jqObj.fn.applyBlurOverlay = function(actionCommand){
    // Check if the requested command exists in our utility functions.
    if ( utilityFunctions[actionCommand] ) {
      // Execute the command with provided arguments.
      return utilityFunctions[actionCommand].apply( this, [].slice.call( arguments, 1 ));
    }
    // If no command or an object (options) is passed, initialize the plugin.
    else if ( typeof actionCommand === 'object' || ! actionCommand ) {
      return utilityFunctions.initialize.apply( this, arguments );
    }
    // Handle unknown or invalid commands.
    else {
      jqObj.error( 'Function ' +  actionCommand + ' not found for jQuery.' + pluginIdentifier);
    }
  }; // End of plugin definition.

})(window.jQuery); // Pass the global jQuery object.