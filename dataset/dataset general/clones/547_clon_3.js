/**
 *
 *  Module: MediaScaler
 *
 *  A comprehensive jQuery utility for managing responsive media embeds (iframes).
 *
 *  Author:       @modern-dev-labs (http://modern-dev-labs.com)
 *  Copyright:    © 2024 Modern Dev Labs. All rights reserved.
 *  License:      MIT License (https://opensource.org/licenses/MIT)
 *  Repository:   https://github.com/modern-dev-labs/MediaScaler.js
 *  Version:      1.0.0-beta
 *
 **/

;
(function ($, globalScope, currentDocument) {

  // Validate jQuery availability before proceeding
  if (typeof $ === 'undefined' || typeof $.fn === 'undefined') {
    console.error('MediaScaler: jQuery is not found. Please ensure jQuery is loaded.');
    return;
  }

  const MOD_IDENTIFIER = "mediaScaler";
  const OBJ_DATA_KEY = `plugin_${MOD_IDENTIFIER}_instance`;
  const DEBOUNCE_DELAY_MS = 120; // Time in milliseconds for event debouncing

  /**
   * Represents the core MediaScaler component.
   * Manages responsive behavior for iframes within a given container.
   * @param {HTMLElement} hostElement - The DOM element to manage.
   * @param {object} userOptions - User-defined configuration settings.
   * @param {object} baseSettings - Default configuration settings.
   */
  function MediaScaler(hostElement, userOptions, baseSettings) {
    this.hostElement = $(hostElement); // The jQuery object for the managing container
    this.userOptions = $.extend(true, {}, baseSettings, userOptions); // Deep merge options
    this._initialSettings = baseSettings; // Store initial settings for reference
    this._version = '1.0.0-beta'; // Internal version tracking

    // Begin the setup process for the component
    this._beginSetup();
    console.log(`MediaScaler initialized on element:`, this.hostElement[0]);
  }

  /**
   * Prototype methods for the MediaScaler component.
   * Contains all the operational logic.
   */
  MediaScaler.prototype = {

    /**
     * Refreshes the layout by processing any new or existing embeds.
     * This method should be called if new iframes are dynamically added to the DOM.
     */
    refreshLayout: function () {
      if (this.userOptions.mode === 'resize') {
        this._prepareUnscaledFrames();
      } else {
        this._processUnwrappedFrames();
      }
      this.hostElement.trigger('mediaScaler:layoutUpdated', [this]); // Custom event trigger
    },

    /**
     * Encapsulates a single iframe element within a responsive container.
     * Applicable when the 'wrap' mode is active.
     * @param {jQuery} embedElement - The jQuery object representing the iframe.
     * @returns {jQuery} The newly created wrapper element.
     */
    encapsulateElement: function (embedElement) {
      if (!(embedElement instanceof $)) {
        console.warn('MediaScaler: encapsulateElement expects a jQuery object.');
        return $();
      }

      const aspectCoefficient = this._computeProportion(embedElement);
      const bottomSpacing = (aspectCoefficient * 100).toFixed(2) + '%'; // Format to 2 decimal places

      // Create a responsive outer shell for the iframe
      const outerShell = $(currentDocument.createElement('div'))
        .addClass(this.userOptions.wrapperCssClass)
        .css({
          'position': 'relative',
          'padding-bottom': bottomSpacing,
          'height': '0',
          'overflow': 'hidden',
          'max-width': '100%'
        });

      // Apply necessary styles to the iframe itself for responsiveness
      embedElement.css({
        'position': 'absolute',
        'top': '0',
        'left': '0',
        'width': '100%',
        'height': '100%'
      });

      // Wrap the iframe and return the newly created parent element
      return embedElement.wrap(outerShell).parent();
    },

    /**
     * Adjusts the dimensions of a single iframe element.
     * Applicable when the 'resize' mode is active.
     * @param {jQuery} embedElement - The jQuery object representing the iframe.
     * @returns {jQuery} The adjusted iframe element.
     */
    adjustDimensions: function (embedElement) {
      if (!(embedElement instanceof $)) {
        console.warn('MediaScaler: adjustDimensions expects a jQuery object.');
        return $();
      }

      this._configureEmbed(embedElement); // Set up initial data for the iframe

      // Perform the actual resizing based on the container's dimensions
      this._adjustSingleFrame(
        embedElement,
        this.hostElement.width(),
        this.hostElement.height(),
        this.userOptions.fitHeight
      );

      return embedElement; // Return the now scaled iframe
    },

    /**
     * Removes and cleans up all resources associated with this MediaScaler instance.
     */
    cleanupModule: function () {
      const thisInstance = this;

      if (thisInstance.userOptions.mode === 'resize') {
        // Iterate through managed iframes to revert their styles and data
        this.hostElement.find(`iframe.${this.userOptions.iframeCssClass}`).each(function () {
          const frameElement = $(this);
          const originalProps = frameElement.data(MOD_IDENTIFIER);

          if (originalProps) { // Only revert if data exists
            frameElement
              .removeClass(thisInstance.userOptions.iframeCssClass)
              .width(originalProps.width)
              .height(originalProps.height)
              .removeData(MOD_IDENTIFIER); // Clean up stored data
          }
        });
        this._detachEventHandlers(); // Unbind the window resize listener

      } else { // 'wrap' mode cleanup
        // Unwrap all iframes from their responsive containers
        this.hostElement.find(`.${this.userOptions.wrapperCssClass} > iframe`).unwrap();
      }

      // Remove the instance reference from the host element's data
      this.hostElement.removeData(OBJ_DATA_KEY);
      this.hostElement.trigger('mediaScaler:destroyed', [this]); // Custom event trigger
      console.log(`MediaScaler instance on element:`, this.hostElement[0], ` has been cleaned up.`);
    },

    /**
     * Internal method to initialize the component.
     * Attaches event handlers or performs an initial layout refresh.
     * @private
     */
    _beginSetup: function () {
      if (this.userOptions.mode === 'resize') {
        this._attachEventHandlers(); // Bind to window resize for responsive behavior
      }
      this.refreshLayout(); // Perform an initial layout update
    },

    /**
     * Internal method to process iframes that haven't been wrapped yet.
     * Finds and wraps new iframes within the component's host element.
     * @private
     */
    _processUnwrappedFrames: function () {
      const thisInstance = this;
      // Select iframes that are children of the hostElement and are not already within a wrapper
      const unprocessedEmbeds = this.hostElement.find('iframe').filter(function () {
        return !$(this).closest(`.${thisInstance.userOptions.wrapperCssClass}`).length;
      });

      if (unprocessedEmbeds.length > 0) {
        console.log(`MediaScaler: Found ${unprocessedEmbeds.length} new iframes to wrap.`);
        unprocessedEmbeds.each(function () {
          thisInstance.encapsulateElement($(this));
        });
      }
    },

    /**
     * Internal method to prepare newly added iframes for resizing.
     * Identifies iframes not yet managed and configures them for scaling.
     * @private
     */
    _prepareUnscaledFrames: function () {
      const thisInstance = this;
      // Select all iframes in the document that do NOT have the plugin's CSS class
      // This identifies iframes that haven't been configured by this plugin yet
      const newlyAddedFrames = $('iframe').not(`.${this.userOptions.iframeCssClass}`);

      if (newlyAddedFrames.length > 0) {
        console.log(`MediaScaler: Found ${newlyAddedFrames.length} new iframes to prepare for resizing.`);
        newlyAddedFrames.each(function () {
          thisInstance._configureEmbed($(this));
        });
      }
      this._scaleAllEmbeds(); // After setup, ensure all managed embeds are scaled correctly
    },

    /**
     * Internal method to set up an iframe by storing its original dimensions and ratio.
     * @param {jQuery} embedElement - The iframe element to configure.
     * @private
     */
    _configureEmbed: function (embedElement) {
      if (!embedElement.data(MOD_IDENTIFIER)) { // Only configure if not already done
        const aspectRatio = this._computeProportion(embedElement);
        embedElement
          .data(MOD_IDENTIFIER, {
            aspectRatio: aspectRatio,
            originalWidth: embedElement.width(),
            originalHeight: embedElement.height()
          })
          .addClass(this.userOptions.iframeCssClass);
        console.log(`MediaScaler: Configured iframe:`, embedElement[0], ` with aspect ratio:`, aspectRatio);
      }
    },

    /**
     * Internal method to resize all iframes currently managed by this instance.
     * Iterates through configured iframes and calls the single-frame adjustment method.
     * @private
     */
    _scaleAllEmbeds: function () {
      const thisInstance = this;
      const parentWidth = this.hostElement.width();
      const parentHeight = this.hostElement.height();
      const honorParentHeight = this.userOptions.fitHeight;

      // Find all iframes within the host element that have been marked by this plugin
      this.hostElement.find(`iframe.${this.userOptions.iframeCssClass}`).each(function () {
        thisInstance._adjustSingleFrame($(this), parentWidth, parentHeight, honorParentHeight);
      });
      console.log(`MediaScaler: All managed iframes scaled for container width: ${parentWidth}`);
    },

    /**
     * Internal method to adjust the dimensions of a single iframe based on container size.
     * @param {jQuery} embedElement - The iframe element to adjust.
     * @param {number} parentWidth - The width of the containing element.
     * @param {number} parentHeight - The height of the containing element.
     * @param {boolean} honorParentHeight - Whether to constrain by parent height.
     * @private
     */
    _adjustSingleFrame: function (embedElement, parentWidth, parentHeight, honorParentHeight) {
      const storedData = embedElement.data(MOD_IDENTIFIER);
      if (!storedData || !storedData.aspectRatio) {
        console.warn('MediaScaler: Missing aspect ratio data for iframe, skipping adjustment.', embedElement[0]);
        return;
      }

      const aspectCoefficient = storedData.aspectRatio;
      let calculatedHeight = parentWidth * aspectCoefficient;
      let finalWidth = '100%';
      let finalHeight = calculatedHeight;

      // Check if height constraint is active and if calculated height exceeds container height
      if (honorParentHeight && calculatedHeight > parentHeight) {
        // If it would overflow, scale based on container height instead
        finalHeight = parentHeight;
        finalWidth = parentHeight / aspectCoefficient;
      }

      embedElement.height(finalHeight).width(finalWidth);
    },

    /**
     * Internal method to calculate the aspect ratio of an iframe.
     * @param {jQuery} embedElement - The iframe element.
     * @returns {number} The aspect ratio (height / width).
     * @private
     */
    _computeProportion: function (embedElement) {
      // Prioritize width/height attributes, then fall back to current dimensions
      const origWidth = parseInt(embedElement.attr('width'), 10) || embedElement.width();
      const origHeight = parseInt(embedElement.attr('height'), 10) || embedElement.height();

      if (origWidth === 0 || isNaN(origWidth)) {
        console.warn('MediaScaler: Iframe width is zero or invalid, cannot compute aspect ratio. Defaulting to 9:16.', embedElement[0]);
        return 9 / 16; // Default to common aspect ratio
      }

      // Return the ratio, ensuring it's a number
      return parseFloat((origHeight / origWidth).toFixed(6)); // Fixed precision for consistency
    },

    /**
     * Internal method to attach event listeners, specifically for window resizing.
     * Uses debouncing to limit the frequency of resize operations.
     * @private
     */
    _attachEventHandlers: function () {
      const thisInstance = this;
      let debounceTimer = null; // Timer for debouncing the resize event

      $(globalScope).on(`resize.${MOD_IDENTIFIER}`, function () {
        clearTimeout(debounceTimer); // Clear any existing timer
        debounceTimer = setTimeout(function () {
          thisInstance._scaleAllEmbeds(); // Re-scale all embeds after delay
        }, DEBOUNCE_DELAY_MS);
      });
      console.log(`MediaScaler: Window resize event handler attached with debounce of ${DEBOUNCE_DELAY_MS}ms.`);
    },

    /**
     * Internal method to detach all namespaced event handlers.
     * Used during cleanup to prevent memory leaks.
     * @private
     */
    _detachEventHandlers: function () {
      $(globalScope).off(`.${MOD_IDENTIFIER}`); // Remove all handlers specific to this plugin's namespace
      console.log(`MediaScaler: Window resize event handler detached.`);
    }
  };

  /**
   * jQuery plugin definition for MediaScaler.
   * Allows users to initialize and interact with the plugin via jQuery selectors.
   * @param {string|object} options - Method name (string) or configuration object (object).
   * @returns {jQuery|*} - jQuery object for chainability or the result of a method call.
   */
  $.fn[MOD_IDENTIFIER] = function (options) {

    const methodArguments = arguments;
    let operationResult; // Stores the return value of public method calls

    this.each(function () {
      let moduleInstance = $.data(this, OBJ_DATA_KEY);

      // If an instance already exists for this element
      if (moduleInstance) {
        // If a string is passed, it's an attempt to call a public method
        if (typeof options === 'string') {
          // Prevent calling private methods (those starting with '_')
          if (options.startsWith('_')) {
            $.error(`MediaScaler: Private method '${options}' cannot be invoked directly.`);
            return;
          }

          const invokedMethod = moduleInstance[options];
          if (typeof invokedMethod === 'function') {
            // Call the method with arguments, excluding the method name itself
            operationResult = invokedMethod.apply(moduleInstance, [].slice.call(methodArguments, 1));
          } else {
            // Warn if the method does not exist
            $.error(`MediaScaler: Public method '${options}' is not defined on jQuery.${MOD_IDENTIFIER}.`);
          }
        } else {
          // If options object is passed to an existing instance, it's a re-initialization (update config)
          // For simplicity in Type III, we'll just log and exit, or re-init (which might be disruptive)
          // Let's go with updating options directly for existing instance
          $.extend(true, moduleInstance.userOptions, options);
          moduleInstance.refreshLayout(); // Trigger a refresh after options update
          console.log(`MediaScaler: Options updated for existing instance on:`, this);
        }
      } else {
        // No instance exists, so create a new one
        if (typeof options !== 'string') { // Only create if not attempting to call a method on a non-existent instance
          moduleInstance = new MediaScaler(this, options, $.fn[MOD_IDENTIFIER].defaults);
          $.data(this, OBJ_DATA_KEY, moduleInstance); // Store the instance reference
        } else {
          $.error(`MediaScaler: Cannot call method '${options}' on an uninitialized element.`);
        }
      }
    });

    // Return the method result if any, otherwise return 'this' for jQuery chainability
    return operationResult !== undefined ? operationResult : this;
  };

  /**
   * Default configuration settings for the MediaScaler plugin.
   * These can be overridden by user-provided options.
   */
  $.fn[MOD_IDENTIFIER].defaults = {
    wrapperCssClass: 'media-scaler-outer-shell', // CSS class for the responsive wrapper div
    iframeCssClass: 'media-scaler-embed', // CSS class added to managed iframes
    mode: 'wrap', // Operation mode: 'wrap' (uses CSS padding trick) or 'resize' (direct JS resizing)
    fitHeight: false // Only applicable in 'resize' mode: if true, iframe will shrink to fit parent height if necessary
  };

})(jQuery, window, document);