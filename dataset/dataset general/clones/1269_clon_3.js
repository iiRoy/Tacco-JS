(function(jq) {
  // This module provides a robust polyfill for the HTML5 placeholder attribute,
  // ensuring consistent behavior across web browsers, particularly older versions
  // that lack native support. It creates an overlay label for inputs/textareas.

  // Extend the primary jQuery object with our custom form hint functionality.
  jq.extend(jq, {
    formHint: {
      // Internal cache to store the result of native placeholder support detection.
      _nativeSupportCached: undefined,

      /**
       * Determines if the current browser natively supports the 'placeholder' attribute.
       * The result is cached after the initial check for optimal performance.
       * @returns {boolean} True if the browser provides native placeholder support, false otherwise.
       */
      isNativeHintSupported: function() {
        // Return the cached result if it's already been determined.
        if (this._nativeSupportCached !== undefined) {
          return this._nativeSupportCached;
        }

        // Create a temporary input element to test for the 'placeholder' property.
        // Using 'in' operator on the DOM element's properties is a reliable
        // method for feature detection in JavaScript.
        this._nativeSupportCached = !!('placeholder' in jq('<input type="text">')[0]);
        return this._nativeSupportCached;
      },

      /**
       * Initializes and applies the placeholder shim for a specified set of input elements.
       * This function will only apply the shim if native browser support is not detected
       * or if explicitly configured to override native behavior.
       * @param {object} [userOptions] - Optional configuration object to customize the shim's behavior.
       * @param {string} [userOptions.hintColor='#888'] - The CSS color for the overlay placeholder text.
       * @param {string} [userOptions.hintClass='form-hint-label'] - The CSS class name to apply to the overlay label.
       * @param {string} [userOptions.targetElements='input[placeholder], textarea[placeholder]'] - A jQuery selector string
       *                                                                                 specifying which elements to target for the shim.
       * @param {boolean} [userOptions.removeNative=true] - If true, the native 'placeholder' attribute
       *                                                     will be removed from elements after shimming.
       */
      activateHints: function(userOptions) {
        // Establish a set of default configuration options.
        const defaultOptions = {
          hintColor: '#888',
          hintClass: 'form-hint-label',
          targetElements: 'input[placeholder], textarea[placeholder]',
          removeNative: true // By default, remove the native placeholder attribute.
        };

        // Merge the user-provided options with the defaults.
        // jq.merge creates a new object, preventing modification of defaults.
        const effectiveOptions = jq.merge({}, defaultOptions, userOptions || {});

        // If the browser natively supports placeholders, we might not need the shim.
        if (this.isNativeHintSupported()) {
          // However, if `removeNative` is true, we still process to remove the attribute
          // for consistent styling or behavior across all inputs.
          if (effectiveOptions.removeNative) {
            jq(effectiveOptions.targetElements).each(function() {
              jq(this).removeAttr('placeholder');
            });
          }
          return; // Exit early if no shim is required.
        }

        // Apply the custom overlay logic to the elements matched by the selector.
        // This calls the internal jQuery method `_applyHintOverlay`.
        jq(effectiveOptions.targetElements)._applyHintOverlay(effectiveOptions);
      }
    }
  });

  // Extend jQuery's prototype (jq.fn) to make the shim method available on jQuery objects.
  jq.extend(jq.fn, {
    /**
     * Internal method to create and manage the placeholder overlay for a collection of elements.
     * This function is intended for internal use by the `formHint` module and not for direct public access.
     * @param {object} overlayConfig - The configuration object for the placeholder overlay.
     * @returns {jQuery} The original jQuery object, allowing for method chaining.
     * @private
     */
    _applyHintOverlay: function(overlayConfig) {

      /**
       * Calculates the necessary CSS positioning properties for the overlay label,
       * relative to its offset parent, to align perfectly with the target input element.
       * @param {HTMLElement} inputElement - The DOM element (typically an input or textarea)
       *                                     for which to compute the overlay's position.
       * @returns {object} An object containing 'top', 'left', and 'width' CSS properties.
       */
      function determineOverlayPlacement(inputElement) {
        const $input = jq(inputElement);
        const elementOffset = $input.offset(); // Position relative to the document.
        const parentOffset = $input.offsetParent().offset(); // Position of the nearest positioned ancestor.

        // Calculate the position of the input relative to its offset parent.
        const relativeTop = elementOffset.top - parentOffset.top;
        const relativeLeft = elementOffset.left - parentOffset.left;

        // Calculate the width, adjusting for padding and borders to ensure the overlay
        // matches the inner content area of the input as closely as possible.
        const effectiveWidth = $input.outerWidth(true) - ($input.outerWidth() - $input.width());

        return {
          top: relativeTop,
          left: relativeLeft,
          width: effectiveWidth
        };
      }

      // Iterate over each element in the current jQuery selection.
      return this.each(function() {
        const currentInput = jq(this);

        // Retrieve the placeholder text. If it's missing or empty, skip this element.
        const hintText = currentInput.attr('placeholder');
        if (!hintText || hintText.trim() === '') {
          return; // Move to the next element if no valid hint text is found.
        }

        // Check if an overlay has already been applied to this input.
        const existingOverlay = currentInput.data('formHintOverlay');
        if (existingOverlay && existingOverlay.length) {
          // If an overlay exists, simply update its position in case of layout changes.
          existingOverlay.css(determineOverlayPlacement(currentInput));
          return; // Skip creation and event binding for existing overlays.
        }

        // Prepare specific line-height styles for non-textarea inputs.
        // This helps align the text vertically within single-line inputs.
        let dynamicLineHeightStyles = {};
        if (!currentInput.is('textarea')) {
          const inputHeight = currentInput.css('height');
          // Apply line-height only if the input has an explicitly set height.
          if (inputHeight !== 'auto' && inputHeight !== '0px') {
            dynamicLineHeightStyles = {
              lineHeight: inputHeight,
              whiteSpace: 'nowrap', // Prevent text from wrapping.
              textOverflow: 'ellipsis' // Truncate long hints with ellipses.
            };
          }
        }

        // Create the actual overlay label element.
        const overlayLabel = jq('<label />')
          .text(hintText) // Set the label's text content from the placeholder attribute.
          .addClass(overlayConfig.hintClass) // Apply the configured CSS class for styling.
          .css(jq.extend(true, { // Deep merge CSS properties for comprehensive styling.
            position: 'absolute',
            display: 'block', // Use block display for better control over positioning.
            'float': 'none', // Ensure floats don't interfere with positioning.
            overflow: 'hidden',
            textAlign: currentInput.css('text-align') || 'left', // Inherit or default to left alignment.
            color: overlayConfig.hintColor, // Apply the configured hint color.
            cursor: 'text', // Indicate that clicking will focus an input.
            // Copy padding from the input element to precisely match its text alignment.
            paddingTop: currentInput.css('padding-top'),
            paddingRight: currentInput.css('padding-right'),
            paddingBottom: currentInput.css('padding-bottom'),
            paddingLeft: currentInput.css('padding-left'),
            // Copy font styles for visual consistency with the input's text.
            fontSize: currentInput.css('font-size'),
            fontFamily: currentInput.css('font-family'),
            fontStyle: currentInput.css('font-style'),
            fontWeight: currentInput.css('font-weight'),
            textTransform: currentInput.css('text-transform'),
            backgroundColor: 'transparent', // Ensure the label background is transparent.
            zIndex: 99 // Place the label above the input field.
          }, dynamicLineHeightStyles)) // Apply dynamic line-height styles if applicable.
          .css(determineOverlayPlacement(this)) // Apply the calculated position.
          .attr('for', this.id) // Link the label to the input via its ID for accessibility.
          .data('associatedInput', currentInput) // Store a reference to the target input.
          .on('click', function() {
            // When the overlay label is clicked, transfer focus to its associated input.
            jq(this).data('associatedInput').focus();
          });

        // Insert the newly created overlay label directly before the target input element in the DOM.
        overlayLabel.insertBefore(currentInput);

        // Store a reference to the overlay label on the input element's data,
        // allowing for quick access and updates later.
        currentInput.data('formHintOverlay', overlayLabel);

        // If configured, remove the native 'placeholder' attribute to prevent
        // conflicts or double display with the shimmed label.
        if (overlayConfig.removeNative) {
          currentInput.removeAttr('placeholder');
        }

        // Attach event handlers to the input element to manage the overlay's visibility.
        currentInput
          .on('focus.formHint', function() { // Namespace the focus event to prevent conflicts.
            // Hide the overlay label when the input element gains focus.
            overlayLabel.hide();
          })
          .on('blur.formHint', function() { // Namespace the blur event.
            // Show the overlay label if the input's value is empty (after trimming whitespace),
            // otherwise, keep it hidden.
            if (currentInput.val().trim().length === 0) {
              overlayLabel.show();
            } else {
              overlayLabel.hide();
            }
          })
          .triggerHandler('blur.formHint'); // Manually trigger the blur event once to set the initial state.

        // Attach a debounced resize handler to the window to update overlay positions
        // when the browser window is resized, ensuring accurate alignment.
        let resizeTimer;
        jq(window).on('resize.formHint', function() { // Namespace the resize event.
          clearTimeout(resizeTimer); // Clear any previous resize timeout.
          resizeTimer = setTimeout(function() {
            const currentAssociatedInput = overlayLabel.data('associatedInput');
            // Only update position if the input is currently visible.
            if (currentAssociatedInput && currentAssociatedInput.is(':visible')) {
              overlayLabel.css(determineOverlayPlacement(currentAssociatedInput));
            }
          }, 150); // Debounce for 150 milliseconds to prevent excessive recalculations.
        });
      });
    }
  });
})(jQuery);

// Global initialization logic to activate the form hint functionality.
// This ensures that placeholders are shimmed once the DOM is fully loaded.
jQuery(document).ready(function() {
  // Check if the formHint module has been successfully loaded before attempting activation.
  if (jQuery.formHint) {
    jQuery.formHint.activateHints();
  }
});

// Additionally, bind to the window's 'load' event. This can catch elements
// that might be styled or laid out after the DOM is ready (e.g., due to images).
// Re-running activateHints is safe as it updates existing overlays.
jQuery(window).on('load', function() {
    if (jQuery.formHint) {
        jQuery.formHint.activateHints();
    }
});