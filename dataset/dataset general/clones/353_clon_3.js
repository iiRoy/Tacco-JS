(function (jQ) {
  // Define a new jQuery UI widget for managing scrollable panels.
  // This utility creates a custom scrollable region within a parent element.
  jQ.widget("jq.scrollPanel", {
    // Configuration options for the scroll panel's behavior and appearance.
    settings: {
      axis: "x", // 'x' for horizontal, 'y' for vertical scrolling.
      scrollSensitivity: 20, // Magnitude of scroll for mouse wheel events.
      animationEase: 'swing', // Easing function for scroll animations.
      transitionTimeMs: 30, // Duration of scroll animation in milliseconds.
      debugMode: false, // Enable console logging for debugging purposes.
      minimumThumbSize: 15 // Smallest allowed size for the scrollbar thumb.
    },

    /**
     * Initializes the scroll panel widget.
     * This method prepares the DOM, sets up internal structures, and binds events.
     */
    _construct: function () {
      const widgetInstance = this;
      const widgetOptions = this.settings;
      const hostElement = this.element;

      // Ensure the widget isn't double-initialized.
      if (widgetInstance._isInitialized) {
        this._debugLog("Widget already initialized. Skipping _construct.");
        return;
      }
      widgetInstance._isInitialized = true;

      // Validate core options.
      this._validateInitialOptions();

      // Flag indicating if the custom scrollbar is active and visible.
      this.isScrollEnabled = false;

      // Store references to original content and the new structure.
      this.parentWrapper = jQ(hostElement);
      this.originalContents = this.parentWrapper.children().detach(); // Detach original children temporarily.

      // Assemble the primary scroll panel components.
      this.viewportContainer = jQ('<div class="scroll-panel-view scroll-panel-view-' + widgetOptions.axis + '"></div>');
      this.contentArea = jQ('<div class="inner-content inner-content-' + widgetOptions.axis + '"></div>');

      // Re-insert original content into the content area.
      this.contentArea.append(this.originalContents);
      this.contentArea.appendTo(this.viewportContainer);
      this.contentArea.css('display', 'block'); // Ensure content is visible.

      // Build the actual UI slider that acts as the scrollbar.
      this.sliderTrack = jQ('<div class="slider-track-wrap slider-track-wrap-' + widgetOptions.axis + ' ui-corner-all"></div>');
      this.sliderTrack.appendTo(this.viewportContainer).hide(); // Hide initially.

      this.scrollSlider = jQ('<div class="scroll-handle-slider scroll-handle-slider-' + widgetOptions.axis + '"></div>').slider({
        orientation: (widgetOptions.axis === 'x' ? 'horizontal' : 'vertical'),
        value: (widgetOptions.axis === 'x' ? 0 : 100), // Start at 0 for horizontal, 100 for vertical (bottom).
        slide: function (eventObj, uiData) {
          // Determine the appropriate scroll handler based on axis.
          if (widgetOptions.axis === "x") {
            widgetInstance._handleHScroll(eventObj, uiData);
          } else {
            widgetInstance._handleVScroll(eventObj, uiData);
          }
        }
      });

      // Customize the slider handle for a scrollbar aesthetic.
      this._adjustSliderHandle();
      this.scrollSlider.appendTo(this.sliderTrack);
      this.viewportContainer.appendTo(this.parentWrapper);

      // Register all necessary event listeners.
      this._registerEventListeners();

      // Evaluate and display the scrollbar if content exceeds viewport.
      this._evaluateScrollbarVisibility();

      this._debugLog("ScrollPanel widget constructed.");
    },

    /**
     * Performs a basic validation of initial widget options.
     * Logs warnings for invalid settings.
     */
    _validateInitialOptions: function () {
      const opts = this.settings;
      if (opts.axis !== 'x' && opts.axis !== 'y') {
        this._debugLog("Warning: Invalid 'axis' option. Defaulting to 'x'.", true);
        opts.axis = 'x';
      }
      if (typeof opts.scrollSensitivity !== 'number' || opts.scrollSensitivity <= 0) {
        this._debugLog("Warning: Invalid 'scrollSensitivity'. Defaulting to 20.", true);
        opts.scrollSensitivity = 20;
      }
      if (typeof opts.transitionTimeMs !== 'number' || opts.transitionTimeMs < 0) {
        this._debugLog("Warning: Invalid 'transitionTimeMs'. Defaulting to 30.", true);
        opts.transitionTimeMs = 30;
      }
    },

    /**
     * Sets up event listeners for mousewheel input and other interactions.
     * This method centralizes event binding.
     */
    _registerEventListeners: function () {
      const widgetRef = this;
      this.parentWrapper.on('mousewheel.scrollPanel', function (eventData, deltaVal) {
        // Only process mousewheel if the scrollbar is active.
        if (widgetRef.isScrollEnabled) {
          eventData.stopPropagation(); // Prevent event bubbling.
          // Ensure the mousewheel plugin provided a delta value.
          if (deltaVal !== undefined) {
            return widgetRef._handleWheelInput(eventData, deltaVal);
          }
        }
      });
      // Optionally add other event listeners here, e.g., for keyboard navigation.
    },

    /**
     * Cleans up event listeners when the widget is destroyed.
     */
    _cleanupEventListeners: function () {
      this.parentWrapper.off('.scrollPanel'); // Unbind all events prefixed with .scrollPanel
    },

    /**
     * Modifies the appearance and behavior of the slider handle
     * to better suit a scrollbar, ensuring it stays within bounds.
     */
    _adjustSliderHandle: function () {
      const widgetRef = this;
      const opts = this.settings;
      const sliderHandle = this.scrollSlider.find(".ui-slider-handle");

      // Wrap the handle in an auxiliary div for precise positioning.
      this.sliderThumbWrapper = sliderHandle.wrap("<div class='ui-handle-aux-wrapper'></div>").parent();

      // Custom behavior for handle resizing during drag.
      sliderHandle.on('mousedown.scrollPanel', function () {
        if (opts.axis === "x") {
          widgetRef.scrollSlider.width(widgetRef.sliderThumbWrapper.width());
        } else {
          widgetRef.scrollSlider.height(widgetRef.sliderThumbWrapper.height());
        }
      });
      sliderHandle.on('mouseup.scrollPanel', function () {
        if (opts.axis === "x") {
          widgetRef.scrollSlider.width("100%");
        } else {
          widgetRef.scrollSlider.height("100%");
        }
      });

      // Hide overflow of the viewport; scrolling is now handled by the slider.
      this.viewportContainer.css("overflow", "hidden");
    },

    /**
     * Handles horizontal scroll events triggered by the slider.
     * @param {Event} eventData - The event object.
     * @param {Object} uiData - UI object from jQuery UI slider containing value.
     */
    _handleHScroll: function (eventData, uiData) {
      this._shiftContentHorizontally(uiData.value, this.settings.transitionTimeMs);
    },

    /**
     * Handles vertical scroll events triggered by the slider.
     * @param {Event} eventData - The event object.
     * @param {Object} uiData - UI object from jQuery UI slider containing value.
     */
    _handleVScroll: function (eventData, uiData) {
      this._shiftContentVertically(uiData.value, this.settings.transitionTimeMs);
    },

    /**
     * Processes mousewheel input to calculate and apply scroll adjustments.
     * @param {Event} eventData - The mousewheel event object.
     * @param {number} deltaVal - The scroll direction and magnitude.
     * @returns {boolean} True if scrolling occurred, false otherwise.
     */
    _handleWheelInput: function (eventData, deltaVal) {
      const opts = this.settings;
      let scrollAmt = deltaVal * opts.scrollSensitivity;
      let newSliderValue;

      if (opts.axis === "x") {
        newSliderValue = this._normalizeScrollValue(-scrollAmt); // Invert for horizontal wheel.
        this._shiftContentHorizontally(newSliderValue.finalValue, opts.transitionTimeMs);
      } else {
        newSliderValue = this._normalizeScrollValue(scrollAmt);
        this._shiftContentVertically(newSliderValue.finalValue, opts.transitionTimeMs);
      }
      return newSliderValue.didChange; // Return if scroll actually changed.
    },

    /**
     * Clamps a scroll amount to be within the 0-100 range of the slider.
     * @param {number} scrollChange - The proposed change in slider value.
     * @returns {{finalValue: number, didChange: boolean}} The adjusted slider value and if it resulted in a change.
     */
    _normalizeScrollValue: function (scrollChange) {
      const currentSliderVal = parseInt(this.scrollSlider.slider('value'), 10);
      let proposedSliderVal = currentSliderVal + scrollChange;
      let changed = true;

      // Clamp the value between 0 and 100.
      proposedSliderVal = Math.max(0, Math.min(100, proposedSliderVal));

      if (proposedSliderVal === currentSliderVal) {
        changed = false; // No actual change in slider position.
      }
      this.scrollSlider.slider('value', proposedSliderVal);
      return {
        finalValue: proposedSliderVal,
        didChange: changed
      };
    },

    /**
     * Shifts the content area horizontally based on a slider value (0-100%).
     * @param {number} sliderValue - The slider's current value (0-100).
     * @param {number} durationMs - Animation duration in milliseconds.
     */
    _shiftContentHorizontally: function (sliderValue, durationMs) {
      const viewportWidth = this.viewportContainer.width();
      const contentWidth = this.contentArea.width();

      if (contentWidth > viewportWidth) {
        const moveDistance = Math.floor(
          sliderValue / 100 * (viewportWidth - contentWidth)
        );
        this._moveContentX(moveDistance, durationMs);
      } else {
        this.contentArea.css("margin-left", 0);
      }
    },

    /**
     * Shifts the content area vertically based on a slider value (0-100%).
     * @param {number} sliderValue - The slider's current value (0-100).
     * @param {number} durationMs - Animation duration in milliseconds.
     */
    _shiftContentVertically: function (sliderValue, durationMs) {
      const viewportHeight = this.viewportContainer.height();
      const contentHeight = this.contentArea.height();

      if (contentHeight > viewportHeight) {
        const moveDistance = Math.floor(
          (100 - sliderValue) / 100 * (viewportHeight - contentHeight)
        ); // Invert value for vertical (0=top, 100=bottom).
        this._moveContentY(moveDistance, durationMs);
      } else {
        this.contentArea.css("margin-top", 0);
      }
    },

    /**
     * Animates the horizontal movement of the content area.
     * @param {number} targetDistance - The target margin-left value in pixels.
     * @param {number} animDuration - Animation duration in milliseconds.
     */
    _moveContentX: function (targetDistance, animDuration) {
      this.contentArea.stop(true, false).animate({
        "marginLeft": targetDistance + "px"
      }, {
        duration: animDuration,
        easing: this.settings.animationEase
      });
    },

    /**
     * Animates the vertical movement of the content area.
     * @param {number} targetDistance - The target margin-top value in pixels.
     * @param {number} animDuration - Animation duration in milliseconds.
     */
    _moveContentY: function (targetDistance, animDuration) {
      this.contentArea.stop(true, false).animate({
        "marginTop": targetDistance + "px"
      }, {
        duration: animDuration,
        easing: this.settings.animationEase
      });
    },

    /**
     * Determines whether the scrollbar is necessary and updates its visibility.
     * Also triggers content and scrollbar sizing.
     */
    _evaluateScrollbarVisibility: function () {
      const opts = this.settings;
      const hostWidth = this.parentWrapper.width();
      const hostHeight = this.parentWrapper.height();
      const contentWidth = this.contentArea.width();
      const contentHeight = this.contentArea.height();

      const needsHorizontal = (opts.axis === "x" && contentWidth > hostWidth);
      const needsVertical = (opts.axis === "y" && contentHeight > hostHeight);

      const shouldBeActive = needsHorizontal || needsVertical;

      if (shouldBeActive && !this.isScrollEnabled) {
        // Activate scrollbar.
        this.isScrollEnabled = Boolean(1);
        this.sliderTrack.show();
        this.contentArea.addClass('has-custom-scrollbar');
        // Defer sizing to allow DOM reflow, especially for Safari.
        setTimeout(() => this._scaleScrollbarElements(), 10);
      } else if (!shouldBeActive && this.isScrollEnabled) {
        // Deactivate scrollbar.
        this.isScrollEnabled = Boolean(0);
        this.sliderTrack.hide();
        this.contentArea.removeClass('has-custom-scrollbar');
      }

      // Adjust content dimensions to accommodate the scrollbar.
      this._adjustContentDimensions();
    },

    /**
     * Adjusts the content area's width or height based on scrollbar presence.
     */
    _adjustContentDimensions: function () {
      const opts = this.settings;
      if (opts.axis === "y") {
        if (this.isScrollEnabled) {
          // Reduce content width to make space for vertical scrollbar.
          this.contentArea.css("width", this.viewportContainer.width() - (this.sliderTrack.outerWidth(true)));
        } else {
          // Restore full width if no scrollbar is needed.
          this.contentArea.css("width", "100%");
        }
      }
      // Horizontal axis content adjustment is generally handled by design,
      // but could be implemented here if needed.
    },

    /**
     * Calculates and applies the appropriate size to the scrollbar thumb (handle)
     * based on content and viewport dimensions.
     */
    _scaleScrollbarElements: function () {
      const opts = this.settings;
      const sliderHandle = this.scrollSlider.find(".ui-slider-handle");
      let thumbSize;

      if (opts.axis === "x") {
        thumbSize = this._calculateThumbSize(this.contentArea.width(), this.viewportContainer.width());
        sliderHandle.css({
          width: thumbSize + "px",
          "marginLeft": (-thumbSize / 2) + "px"
        });
        // Adjust the helper wrapper to match the remaining track length.
        this.sliderThumbWrapper.width("").width(this.scrollSlider.width() - thumbSize);
      } else {
        thumbSize = this._calculateThumbSize(this.contentArea.height(), this.viewportContainer.height());
        sliderHandle.css({
          height: thumbSize + "px",
          "marginTop": (-thumbSize / 2) + "px"
        });
        // Adjust the helper wrapper.
        this.sliderThumbWrapper.height("").height(this.scrollSlider.height() - thumbSize).css("marginTop", thumbSize + 'px');
      }
    },

    /**
     * Computes the proportional size for the scrollbar thumb.
     * @param {number} totalContentDimension - The full dimension of the content.
     * @param {number} visiblePaneDimension - The visible dimension of the viewport.
     * @returns {number} The calculated size for the scrollbar thumb.
     */
    _calculateThumbSize: function (totalContentDimension, visiblePaneDimension) {
      const overflowAmount = totalContentDimension - visiblePaneDimension;
      if (overflowAmount <= 0) return visiblePaneDimension; // No overflow, handle takes full space.

      const proportion = overflowAmount / totalContentDimension;
      let calculatedSize = visiblePaneDimension - (proportion * visiblePaneDimension);

      // Ensure the handle is at least the minimum specified size.
      return Math.max(calculatedSize, this.settings.minimumThumbSize);
    },

    /**
     * Resets the slider's value to reflect the current scroll position of the content.
     */
    _syncSliderPosition: function () {
      const opts = this.settings;
      let currentMargin, totalOverflow, sliderPercentage;

      if (opts.axis === "x") {
        totalOverflow = this.viewportContainer.width() - this.contentArea.width();
        currentMargin = parseInt(this.contentArea.css("margin-left"), 10) || 0;
        if (totalOverflow === 0) { // Avoid division by zero if no overflow.
          sliderPercentage = 0;
        } else {
          sliderPercentage = Math.round((currentMargin / totalOverflow) * 100);
        }
        this.scrollSlider.slider("value", sliderPercentage);
      } else {
        totalOverflow = this.viewportContainer.height() - this.contentArea.height();
        currentMargin = parseInt(this.contentArea.css("margin-top"), 10) || 0;
        if (totalOverflow === 0) { // Avoid division by zero if no overflow.
          sliderPercentage = 100; // For vertical, 100% means top if margin-top is 0.
        } else {
          sliderPercentage = Math.round((currentMargin / totalOverflow) * 100);
        }
        // Vertical slider usually has 0 at bottom, 100 at top.
        this.scrollSlider.slider("value", 100 - sliderPercentage);
      }
    },

    /**
     * Adjusts content position if the viewport expands, revealing previously hidden content.
     * Prevents empty space at the end of the scrollable area.
     */
    _repositionContentOnResize: function () {
      const opts = this.settings;
      let currentVisibleDimension, currentMargin, viewportDimension, contentDimension;

      if (opts.axis === "x") {
        currentMargin = parseInt(this.contentArea.css("margin-left"), 10) || 0;
        contentDimension = this.contentArea.width();
        viewportDimension = this.viewportContainer.width();
        currentVisibleDimension = contentDimension + currentMargin;

        if (currentVisibleDimension < viewportDimension) {
          // If there's a gap at the end, shift content to fill it.
          this.contentArea.css("margin-left", currentMargin + (viewportDimension - currentVisibleDimension));
        }
      } else {
        currentMargin = parseInt(this.contentArea.css("margin-top"), 10) || 0;
        contentDimension = this.contentArea.height();
        viewportDimension = this.viewportContainer.height();
        currentVisibleDimension = contentDimension + currentMargin;

        if (currentVisibleDimension < viewportDimension) {
          // Shift content upwards to fill the gap.
          this.contentArea.css("margin-top", currentMargin + (viewportDimension - currentVisibleDimension));
        }
      }
    },

    /**
     * Public method to trigger a layout recalculation and refresh the scrollbar.
     * Useful when content or container dimensions change dynamically.
     */
    recalculateLayout: function () {
      this._debugLog("Recalculating layout...");
      this._evaluateScrollbarVisibility();
      if (this.isScrollEnabled) {
        this._syncSliderPosition();
        this._repositionContentOnResize();
      }
    },

    /**
     * Public method to scroll to a specific pixel offset within the content.
     * @param {number} targetOffset - The pixel offset to scroll to (from the start).
     */
    jumpToPosition: function (targetOffset) {
      const opts = this.settings;
      if (!this.isScrollEnabled) {
        this._debugLog("Scrollbar not active, cannot jump to position.", true);
        return;
      }

      let contentSize, viewportSize, calculatedDistance;

      if (opts.axis === "x") {
        contentSize = this.contentArea.width();
        viewportSize = this.parentWrapper.width();
        calculatedDistance = this._computeTargetOffset(targetOffset, contentSize, viewportSize);
        this._moveContentX(calculatedDistance, opts.transitionTimeMs);
      } else {
        contentSize = this.contentArea.height();
        viewportSize = this.parentWrapper.height();
        calculatedDistance = this._computeTargetOffset(targetOffset, contentSize, viewportSize);
        this._moveContentY(calculatedDistance, opts.transitionTimeMs);
      }
    },

    /**
     * Calculates the actual margin distance needed to scroll to a given offset.
     * Ensures the scroll doesn't go past the content's end.
     * @param {number} requestedOffset - The desired scroll offset (e.g., 100px from top/left).
     * @param {number} totalContentSize - The full size of the scrollable content.
     * @param {number} visibleViewportSize - The size of the visible viewport.
     * @returns {number} The calculated margin value (negative for scrolling).
     */
    _computeTargetOffset: function (requestedOffset, totalContentSize, visibleViewportSize) {
      // Ensure requested offset is not negative.
      let effectiveOffset = Math.max(0, requestedOffset);

      // Max possible scroll distance (negative value).
      const maxScrollDistance = visibleViewportSize - totalContentSize;

      // The margin needed to bring the effectiveOffset to view.
      let targetMargin = -effectiveOffset;

      // Clamp the target margin to prevent scrolling past the end.
      return Math.max(targetMargin, maxScrollDistance);
    },

    /**
     * Restores the DOM structure to its state before widget initialization.
     * Unbinds events and removes all generated elements.
     */
    dispose: function () {
      this._debugLog("Disposing scrollPanel widget.");
      this.originalContents.detach(); // Detach children from the content area.
      this.parentWrapper.empty(); // Clear all generated elements.
      this.parentWrapper.append(this.originalContents); // Re-append original children.
      this._cleanupEventListeners(); // Remove custom event listeners.
      this._isInitialized = false; // Reset initialization flag.
      jQ.Widget.prototype.destroy.call(this); // Call the base widget destroy method.
    },

    /**
     * Allows updating widget options after initialization.
     * @param {string} optionName - The name of the option to update.
     * @param {*} optionValue - The new value for the option.
     */
    _updateOption: function (optionName, optionValue) {
      // Apply default behavior from the base jQuery UI Widget.
      jQ.Widget.prototype._setOption.apply(this, arguments);

      // Implement specific logic for certain options.
      switch (optionName) {
        case 'contentHeight':
          this.contentArea.css("height", optionValue);
          this._scaleScrollbarElements();
          this.recalculateLayout(); // Trigger a full recalculation.
          break;
        case 'axis':
          this._debugLog("Changing 'axis' is not fully supported after initialization.", true);
          // Re-initialize might be needed for axis change, or extensive DOM manipulation.
          // For a Type III clone, we can leave this as a "not fully supported" case.
          break;
        case 'debugMode':
          this.settings.debugMode = Boolean(optionValue);
          this._debugLog(`Debug mode set to: ${this.settings.debugMode}.`);
          break;
        // Add other cases for options that require immediate UI updates.
      }
    },

    /**
     * Internal logging utility, conditional on debugMode.
     * @param {string} message - The message to log.
     * @param {boolean} [isWarning=false] - If true, logs as a warning.
     */
    _debugLog: function (message, isWarning = false) {
      if (this.settings.debugMode) {
        const prefix = `[jq.scrollPanel - ${this.element[0].id || this.element[0].className || 'Unnamed'}]`;
        if (isWarning) {
          console.warn(`${prefix} WARNING: ${message}`);
        } else {
          console.log(`${prefix} ${message}`);
        }
      }
    }
  });
})(jQuery);