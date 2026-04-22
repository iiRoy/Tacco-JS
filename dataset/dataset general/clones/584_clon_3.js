(function($) {
  /**
   * Defines a unique namespace for the jQuery plugin to prevent conflicts.
   * This identifier is used for data storage on elements and event binding.
   * Type II: Changed 'oblurlay' to 'dynamicBlurEffect'.
   */
  var dynamicBlurEffect = 'dynamicBlur';

  /**
   * Collection of core functions that implement the dynamic blur functionality.
   * Type II: Renamed 'methods' to 'coreFunctions'.
   */
  var coreFunctions = {

    /**
     * Initializes the dynamic blur effect on the selected jQuery element(s).
     * This method sets up configuration, creates necessary SVG filters,
     * duplicates content, and binds event listeners.
     * Type II: Renamed 'init' to 'setup'.
     * Type III: Added more robust option merging and initialization checks.
     */
    setup: function(userSettings) {
      // Merge default configuration options with any user-provided settings.
      // Type III: Ensured `userSettings` is always an object to prevent errors.
      userSettings = $.extend({
        'wrapperClass': 'dynamicBlur-wrapper', // Class for the element that contains the blurred clone.
        'contentSourceClass': 'dynamicBlur-source', // Class of the content within the target element to be cloned and blurred.
        'cloneTargetClass': 'dynamicBlur-replica', // Class for the actual blurred clone element.
        'blurStrength': 25, // Standard deviation for the Gaussian blur filter.
        'svgFilterId': 'dynamicBlur-svgFilterElement', // Unique ID for the SVG filter.
        'svgCanvasClass': 'dynamicBlur-svgCanvas', // Class for the SVG container element.
        'scrollEventNamespace': '.dynamicBlurScrollEvents' // Namespace for event binding, ensuring unique cleanup.
      }, userSettings || {}); // Type III: Handles cases where userSettings is undefined or null.

      // Iterate over each selected DOM element to apply the plugin.
      return this.each(function() {
        var currentElement = this; // Reference to the native DOM element.
        var $targetElement = $(this); // jQuery-wrapped version of the current element.
        var pluginData = $targetElement.data(dynamicBlurEffect); // Retrieve existing plugin data, if any.

        // Proceed only if the plugin has not been previously initialized on this element.
        if (!pluginData) {
          // Store the finalized configuration and an initialization flag on the element.
          $targetElement.data(dynamicBlurEffect, {
            effectConfig: userSettings,
            isInitialized: true // Type III: Added a flag for clearer state management.
          });

          // Type III: Centralized variables for filter details.
          const filterIdentifier = userSettings.svgFilterId;
          const svgContainerClass = userSettings.svgCanvasClass;
          const blurAmount = userSettings.blurStrength;

          // Check if the SVG filter element already exists in the DOM.
          // This prevents redundant SVG elements if multiple plugin instances are created.
          if ($(`#${filterIdentifier}`).length === 0) {
            // If the filter doesn't exist, append the SVG element to the document body.
            // It's placed in the body as it's a global resource referenced by URL.
            // Type III: Used template literals for cleaner SVG string.
            // Type III: Added inline styles to hide the SVG canvas visually.
            $('body').append(`
              <svg class="${svgContainerClass}" style="position:absolute; width:0; height:0; overflow:hidden; pointer-events:none;">
                <filter id="${filterIdentifier}">
                  <feGaussianBlur stdDeviation="${blurAmount}" />
                </filter>
              </svg>
            `);
          }

          // Trigger the initial duplication and blurring of content.
          coreFunctions.duplicateContent.apply(currentElement);

          // Bind event listeners for scroll and resize events.
          // Type III: Implemented debouncing for performance optimization on scroll and resize.
          let scrollDebounceTimer;
          $(window).on('scroll' + userSettings.scrollEventNamespace, function() {
            clearTimeout(scrollDebounceTimer);
            scrollDebounceTimer = setTimeout(function() {
              coreFunctions.repositionEffect.apply(currentElement);
            }, 10); // Debounce scroll updates by 10ms.
          });

          let resizeDebounceTimer;
          $(window).on('resize' + userSettings.scrollEventNamespace, function() {
            clearTimeout(resizeDebounceTimer);
            resizeDebounceTimer = setTimeout(function() {
              // On resize, re-clone the content to adjust to new dimensions and then reposition.
              coreFunctions.duplicateContent.apply(currentElement);
              coreFunctions.repositionEffect.apply(currentElement);
            }, 150); // Debounce resize updates by 150ms.
          });

          // Type III: Perform an initial reposition to ensure the blur effect is correctly placed on page load.
          coreFunctions.repositionEffect.apply(currentElement);
        }
      }); // End of `each` iteration.
    },

    /**
     * Creates a blurred clone of the target element's specified contents.
     * This clone is then appended to the designated wrapper and styled.
     * Type II: Renamed 'clone' to 'duplicateContent'.
     * Type III: Added more checks and cleanup.
     */
    duplicateContent: function() {
      var $targetElement = $(this);
      var pluginData = $targetElement.data(dynamicBlurEffect);

      // Type III: Guard clause to ensure the plugin is initialized on this element.
      if (!pluginData || !pluginData.isInitialized) {
        console.warn("DynamicBlur: Attempted to duplicate content before proper initialization.");
        return;
      }

      var effectConfig = pluginData.effectConfig;
      const filterIdentifier = effectConfig.svgFilterId;
      const blurAmount = effectConfig.blurStrength;

      // Type III: Remove any existing clone before creating a new one to prevent duplicates,
      // especially useful during resize events.
      $(`.${effectConfig.cloneTargetClass}`).remove();

      // Create a container for the blurred clone.
      var $replicaContainer = $('<div>').addClass(effectConfig.cloneTargetClass);
      // Find the content to be cloned within the target element and create its clone.
      var $sourceContentClone = $targetElement.find('.' + effectConfig.contentSourceClass).clone();

      // Type III: Validate that source content was actually found before proceeding.
      if ($sourceContentClone.length === 0) {
        console.warn(`DynamicBlur: No source content found with class "${effectConfig.contentSourceClass}" within the target element to clone.`);
        return;
      }

      // Append the cloned content into its replica container.
      $replicaContainer.append($sourceContentClone);

      // Identify the wrapper element where the blurred clone should be placed.
      var $wrapperElement = $('.' + effectConfig.wrapperClass);
      // Type III: Add a fallback if the specified wrapper element is not found.
      if ($wrapperElement.length === 0) {
        console.error(`DynamicBlur: Wrapper element with class "${effectConfig.wrapperClass}" not found. Appending to target element's parent as a fallback.`);
        $wrapperElement = $targetElement.parent(); // Fallback to the target element's immediate parent.
      }

      // Append the replica container to the wrapper element.
      $wrapperElement.append($replicaContainer);

      // Apply CSS styles to the blurred replica container.
      // Type III: Added more explicit positioning and sizing for the clone.
      // Type III: Added both `-webkit-filter` and standard `filter` for broader browser compatibility.
      $replicaContainer.css({
        'position': 'absolute', // Essential for `translate3d` and overlay effect.
        'top': 0,
        'left': 0,
        'width': '100%', // Ensure clone covers the wrapper's width.
        'height': '100%', // Ensure clone covers the wrapper's height.
        'overflow': 'hidden', // Hide content that extends beyond the blur area.
        'pointer-events': 'none', // Type III: Prevent clone from capturing mouse events.
        '-webkit-filter': `blur(${blurAmount}px)`, // Webkit-specific CSS blur.
        'filter': `url(#${filterIdentifier})` // SVG filter application.
      });

      // Type III: Ensure the SVG canvas element is correctly hidden and doesn't interfere.
      $(`.${effectConfig.svgCanvasClass}`).css({
        'position': 'absolute',
        'width': '0',
        'height': '0',
        'overflow': 'hidden',
        'pointer-events': 'none' // Crucial to prevent interaction with the invisible SVG.
      });
    },

    /**
     * Adjusts the vertical position of the blurred clone to create a parallax-like effect
     * in response to window scrolling.
     * Type II: Renamed 'scrollY' to 'repositionEffect'.
     * Type III: Used template literals and added more robust checks.
     */
    repositionEffect: function() {
      var $targetElement = $(this);
      var pluginData = $targetElement.data(dynamicBlurEffect);

      // Type III: Guard clause to ensure the plugin is initialized.
      if (!pluginData || !pluginData.isInitialized) {
        return;
      }

      var effectConfig = pluginData.effectConfig;
      var currentScrollPosition = $(window).scrollTop(); // Type III: Calculate scroll position once.
      var negativeScrollOffset = -currentScrollPosition; // Type III: Intermediate variable for clarity.

      // Construct the CSS `translate3d` value for hardware-accelerated transformation.
      // Type III: Used template literals for cleaner string concatenation.
      var cssTransformValue = `translate3d(0, ${negativeScrollOffset}px, 0)`;

      // Select the blurred clone element.
      var $blurredCloneElement = $('.' + effectConfig.cloneTargetClass);

      // Type III: Guard against the clone element not existing and attempt to recreate it.
      if ($blurredCloneElement.length === 0) {
        console.warn("DynamicBlur: Blurred clone element not found during repositioning. Attempting to recreate it.");
        coreFunctions.duplicateContent.apply(this); // Try to recreate the clone.
        $blurredCloneElement = $('.' + effectConfig.cloneTargetClass); // Re-select after recreation attempt.

        if ($blurredCloneElement.length === 0) {
          console.error("DynamicBlur: Failed to find or recreate blurred clone. Repositioning aborted.");
          return; // Abort if recreation also fails.
        }
      }

      // Apply the transform to position the blurred clone.
      $blurredCloneElement.css({
        '-webkit-transform': cssTransformValue, // Webkit browsers.
        '-moz-transform': cssTransformValue, // Mozilla browsers.
        'transform': cssTransformValue // Standard.
      });

      // Type III: Example of adding new functionality - dynamically adjusting blur strength.
      // This part is commented out but demonstrates how to add dynamic behavior.
      /*
      var dynamicBlurStrength = Math.min(effectConfig.blurStrength + Math.floor(currentScrollPosition / 200), 50);
      $(`#${effectConfig.svgFilterId} feGaussianBlur`).attr('stdDeviation', dynamicBlurStrength);
      */
    },

    /**
     * Cleans up all resources, data, and event listeners associated with the plugin
     * for the selected elements.
     * Type II: Renamed 'destroy' to 'teardown'.
     * Type III: Added more comprehensive cleanup.
     */
    teardown: function() {
      return this.each(function() {
        var $targetElement = $(this);
        var pluginData = $targetElement.data(dynamicBlurEffect);

        // Type III: Guard clause to ensure plugin data exists before attempting cleanup.
        if (!pluginData) {
          return;
        }

        var effectConfig = pluginData.effectConfig;

        // Unbind all events that were namespaced by this plugin from the window.
        $(window).off(effectConfig.scrollEventNamespace);

        // Remove the data stored on the element.
        $targetElement.removeData(dynamicBlurEffect);
        $targetElement.data(dynamicBlurEffect, null); // Type III: Ensure data is fully cleared.

        // Type III: Remove the blurred clone element from the DOM.
        $('.' + effectConfig.cloneTargetClass).remove();

        // Type III: Check if the global SVG filter is still being used by other elements.
        // If no other elements are using this plugin, remove the SVG canvas from the DOM.
        // This prevents leaving behind unused global resources.
        if ($(`[data-${dynamicBlurEffect}]`).length === 0) {
            $(`.${effectConfig.svgCanvasClass}`).remove();
        }

        // Type III: If the plugin had applied any direct styles to the target element
        // (which the original code did not), those would be reset here.
        // Example: $targetElement.css({ 'position': '', 'overflow': '' });
      });
    }
  };

  /**
   * Registers the dynamicBlur plugin with jQuery's prototype.
   * This allows calling `$(selector).dynamicBlur()` to interact with the plugin.
   * Type II: Renamed '$.fn.oblurlay' to '$.fn.dynamicBlur'.
   * Type III: Improved error handling and argument parsing.
   */
  $.fn.dynamicBlur = function(methodName) {
    // Check if a specific method name was passed and if it exists in our core functions.
    if (coreFunctions[methodName]) {
      // If so, execute the method with the provided arguments.
      // Type III: Explicitly slice arguments for method calls.
      var methodArguments = Array.prototype.slice.call(arguments, 1);
      return coreFunctions[methodName].apply(this, methodArguments);
    } else if (typeof methodName === 'object' || !methodName) {
      // If an object (options) is passed, or no method name is specified,
      // assume the user intends to initialize the plugin.
      // Type II: Renamed 'init' to 'setup'.
      return coreFunctions.setup.apply(this, arguments);
    } else {
      // If an invalid method name is provided, throw an error.
      // Type III: Provided a more descriptive error message.
      $.error(`Method "${methodName}" does not exist on jQuery.${dynamicBlurEffect}. Please verify the method name or consult the documentation.`);
    }
  };

})(jQuery);