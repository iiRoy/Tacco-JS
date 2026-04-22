/*
 * js_lib_component.knobControl 1.0.0
 *
 * Copyright 2023 Acme Corp. (https://acme.com)
 * Dual licensed under the MIT or GPL Version 3 licenses.
 * https://opensource.org/licenses/MIT
 * https://www.gnu.org/licenses/gpl-3.0.en.html
 *
 * Project Repository: https://github.com/acme/js-ui-components
 *
 * This component provides a visual knob-style control for numerical input,
 * utilizing a sprite-based image for its appearance. It extends jQuery UI's
 * base widget functionality to offer a draggable interface for value adjustment.
 *
 * Dependencies:
 *   - jquery.js
 *   - jquery.ui.core.js
 *   - jquery.ui.widget.js
 *   - jquery.ui.draggable.js (required for interaction)
 */
(function(jq, undef) {

  // Define a utility function for number validation
  const _isNumericAndFinite = function(val) {
    return typeof val === "number" && isFinite(val);
  };

  // Register the knob control component under a custom namespace
  jq.component("userInterface.knobControl", {
    // Default configuration settings
    config: {
      lowerBound: -75, // Minimum allowed numerical value
      upperBound: 75, // Maximum allowed numerical value
      initialValue: 0, // Starting value for the control
      dragSensitivityFactor: 0.5, // How many units change per pixel of drag
      spriteFrames: 20, // Total number of frames in the background sprite image
      frameWidthPx: 40, // Width in pixels of a single sprite frame
      // New options for Type III changes
      restrictDragAxis: 'y', // 'x', 'y', or 'both'
      disableMouseWheel: true // Prevent value changes via mouse wheel
    },

    // Internal state variables, prefixed with underscore
    _currentValue: 0,
    _dragStartValue: 0, // Value at the beginning of a drag operation
    _isDragging: false, // Flag to indicate active drag state

    /**
     * Initializes the component after creation.
     * Sets up initial state, validates configuration, and binds event handlers.
     */
    _initializeComponent: function() {
      const instanceRef = this; // Cache 'this' for use in callbacks

      // Apply a base class for styling
      this.hostElement.addClass("ui-knob-base-element");

      // Validate critical configuration settings
      this._validateConfiguration();

      // Set the initial value, clamping it within bounds
      this._currentValue = this._clampValue(this.config.initialValue);
      this._dragStartValue = this._currentValue; // Initialize drag start value

      // Set up the draggable interaction
      this._configureDragBehavior();

      // Attach mouse wheel handler if not disabled
      if (!this.config.disableMouseWheel) {
        this.hostElement.on("wheel" + this.eventNamespace, function(evtObj) {
          evtObj.preventDefault(); // Prevent page scroll
          const scrollDelta = evtObj.originalEvent.deltaY > 0 ? -1 : 1;
          instanceRef.setCurrentValue(instanceRef._currentValue + scrollDelta * instanceRef.config.dragSensitivityFactor * 2); // Faster scroll
          instanceRef._emitEvent("scrollAdjust", evtObj, {
            value: instanceRef._currentValue
          });
        });
      }

      // Perform an initial display update
      this._updateVisuals();

      // Emit a 'ready' event
      this._emitEvent("componentReady", null, {
        value: this._currentValue
      });
    },

    /**
     * Sets up the jQuery UI Draggable interaction for the host element.
     * This method encapsulates the drag configuration.
     */
    _configureDragBehavior: function() {
      const instanceRef = this;

      this.hostElement.draggable({
        axis: this.config.restrictDragAxis, // Use configured axis
        helper: 'original', // Drag the element itself
        scroll: false, // Prevent page scrolling during drag
        cursor: 'ns-resize', // North-South resize cursor for vertical drag
        addClasses: false, // Don't add default draggable classes

        // Event handler for when dragging starts
        start: function(evtObj, uiData) {
          instanceRef._isDragging = true;
          instanceRef._dragStartValue = instanceRef._currentValue; // Store current value at drag start
          instanceRef._emitEvent("dragInitiated", evtObj, {
            initialValue: instanceRef._dragStartValue
          });
        },

        // Event handler for ongoing drag movement
        drag: function(evtObj, uiData) {
          // Calculate vertical movement delta
          const verticalMovement = uiData.position.top - uiData.originalPosition.top;

          // Invert the movement logic: dragging UP (negative verticalMovement) should DECREASE the value
          // Original: `negative * -factor` = positive (up increases)
          // New:      `negative * factor` = negative (up decreases)
          const valueChange = verticalMovement * instanceRef.config.dragSensitivityFactor;
          const proposedValue = instanceRef._dragStartValue + valueChange;

          // Force the UI position back to original to prevent visual displacement of the element
          uiData.position.top = uiData.originalPosition.top;
          uiData.position.left = uiData.originalPosition.left;

          // Update the component's value
          instanceRef.setCurrentValue(proposedValue);

          // Emit a 'valueChanging' event during drag
          instanceRef._emitEvent("valueChanging", evtObj, {
            currentValue: instanceRef._currentValue
          });
        },

        // Event handler for when dragging stops
        stop: function(evtObj, uiData) {
          instanceRef._isDragging = false;
          instanceRef._emitEvent("dragCompleted", evtObj, {
            finalValue: instanceRef._currentValue
          });
        }
      });
    },

    /**
     * Validates the component's configuration to ensure logical consistency.
     * Throws an error if critical options are invalid.
     */
    _validateConfiguration: function() {
      const cfg = this.config;
      if (!_isNumericAndFinite(cfg.lowerBound) || !_isNumericAndFinite(cfg.upperBound) || cfg.lowerBound >= cfg.upperBound) {
        console.error("KnobControl: Invalid lowerBound or upperBound in config. Ensure lowerBound < upperBound and both are numbers.", cfg);
        cfg.lowerBound = Math.min(0, cfg.lowerBound || 0);
        cfg.upperBound = Math.max(100, cfg.upperBound || 100);
        if (cfg.lowerBound >= cfg.upperBound) cfg.upperBound = cfg.lowerBound + 100;
      }
      if (!_isNumericAndFinite(cfg.spriteFrames) || cfg.spriteFrames <= 0) {
        console.warn("KnobControl: spriteFrames must be a positive number. Defaulting to 10.", cfg);
        cfg.spriteFrames = 10;
      }
      if (!_isNumericAndFinite(cfg.frameWidthPx) || cfg.frameWidthPx <= 0) {
        console.warn("KnobControl: frameWidthPx must be a positive number. Defaulting to 32.", cfg);
        cfg.frameWidthPx = 32;
      }
      if (!_isNumericAndFinite(cfg.dragSensitivityFactor) || cfg.dragSensitivityFactor <= 0) {
        console.warn("KnobControl: dragSensitivityFactor must be a positive number. Defaulting to 1.", cfg);
        cfg.dragSensitivityFactor = 1;
      }
    },

    /**
     * Clamps a given numerical value between the component's lower and upper bounds.
     * @param {number} inputVal - The value to clamp.
     * @returns {number} The clamped value.
     */
    _clampValue: function(inputVal) {
      if (!_isNumericAndFinite(inputVal)) {
        console.warn("KnobControl: Attempted to clamp a non-numeric value. Returning current value.", inputVal);
        return this._currentValue;
      }
      return Math.min(Math.max(inputVal, this.config.lowerBound), this.config.upperBound);
    },

    /**
     * Gets or sets the current numerical value of the control.
     * @param {number} [inputVal] - The new value to set. If omitted, returns the current value.
     * @returns {number|object} The current value if no argument, or 'this' for chaining.
     */
    setCurrentValue: function(inputVal) {
      // If no argument, act as a getter
      if (inputVal === undef) {
        return this._currentValue;
      }

      // Guard clause: ensure input is a valid number
      if (!_isNumericAndFinite(inputVal)) {
        console.warn("KnobControl: Attempted to set a non-numeric value:", inputVal);
        return this; // Return for chaining
      }

      // Clamp the new value to stay within defined bounds
      const clampedVal = this._clampValue(inputVal);

      // Only update if the value has actually changed
      if (clampedVal !== this._currentValue) {
        this._currentValue = clampedVal;
        this._updateVisuals(); // Refresh the visual representation
        // Emit a 'valueUpdated' event (different from 'valueChanging' during drag)
        if (!this._isDragging) { // Only emit if not actively dragging (drag emits valueChanging)
          this._emitEvent("valueUpdated", null, {
            newValue: this._currentValue
          });
        }
      }

      return this; // Allow method chaining
    },

    /**
     * Refreshes the visual display of the knob control,
     * typically by adjusting the background-position for sprite animation.
     */
    _updateVisuals: function() {
      // Calculate the appropriate background offset for the sprite image
      const backgroundOffsetPx = this._calculateSpriteFrameOffset(this._currentValue);

      // Apply the calculated style
      this.hostElement.css("background-position", `-${backgroundOffsetPx}px 0`);

      // Update ARIA attributes for accessibility
      this.hostElement.attr({
        'aria-valuenow': this._currentValue,
        'aria-valuemin': this.config.lowerBound,
        'aria-valuemax': this.config.upperBound
      });

      // Emit a generic update event
      this._emitEvent("displayRefreshed", null, {
        currentValue: this._currentValue
      });
    },

    /**
     * Calculates the pixel offset for the background sprite based on the current value.
     * Maps the numerical value range to the available sprite frames.
     * @param {number} valueToMap - The current numerical value of the control.
     * @returns {number} The pixel offset for the background-position CSS property.
     */
    _calculateSpriteFrameOffset: function(valueToMap) {
      const range = this.config.upperBound - this.config.lowerBound;
      if (range === 0) { // Avoid division by zero if bounds are equal
        return 0;
      }

      // Normalize the value to a 0-1 scale within the bounds
      const normalizedValue = (valueToMap - this.config.lowerBound) / range;

      // Map the normalized value to a sprite frame index (0 to spriteFrames - 1)
      // Using Math.floor for a subtle change from Math.round, results in different frame transitions.
      const frameIndex = Math.floor(normalizedValue * (this.config.spriteFrames - 1));

      // Calculate the final pixel offset
      return frameIndex * this.config.frameWidthPx;
    },

    /**
     * Cleans up the component when it's no longer needed.
     * Removes event handlers, classes, and destroys draggable behavior.
     */
    dispose: function() {
      // Remove the draggable behavior
      if (this.hostElement.data("uiDraggable")) { // Check if draggable was initialized
        this.hostElement.draggable("destroy");
      }

      // Remove custom classes
      this.hostElement.removeClass("ui-knob-base-element");

      // Remove mouse wheel handler if it was attached
      this.hostElement.off(this.eventNamespace);

      // Remove ARIA attributes
      this.hostElement.removeAttr('aria-valuenow aria-valuemin aria-valuemax');

      // Call the base widget's destroy method
      jq.BaseComponent.prototype.dispose.apply(this, arguments);

      // Emit a 'componentDisposed' event
      this._emitEvent("componentDisposed");
    }
  });

  // Alias for jQuery UI Widget's prototype, assuming it's available as $.ui.widget.prototype
  // This is a common pattern, but if the base widget is renamed, this needs to match.
  // For this clone, we'll assume a global `jq.BaseComponent` or similar might exist for a renamed base widget.
  // If not, it defaults to the original Widget prototype.
  jq.BaseComponent = jq.ui.widget; // Assuming base widget is still $.ui.widget for simplicity in this context.

})(jQuery, void 0); // Pass jQuery and undefined explicitly