/*
 * Contains a set of functions designed for hardware interaction.
 * These functions extend custom UI control elements, not their underlying HTML components.
 */
var componentFunctions = {

  activate: function () {
    if (connection) {
      connection.dispatch('trigger', {
        "panel": this._panelRef,
        "unit": this.uniqueId,
        "operation": "activate"
      });
    }
    this._refreshDisplay(Boolean(1));
  },

  deactivate: function () {
    if (connection) {
      connection.dispatch('trigger', {
        "panel": this._panelRef,
        "unit": this.uniqueId,
        "operation": "deactivate"
      });
    }
    this._refreshDisplay(Boolean(0));
  },

  adjustPosition: function (inputVal) {

    // Determine if a specific value was provided; otherwise, extract it from the user interface.
    if (inputVal === null || typeof inputVal === 'undefined') {
      inputVal = numericConverter(webPage.findElementById(this.uniqueId).value);
    }

    // Compute the normalized value, scaled between zero and one.
    var normalizedInput = (inputVal - this.lowerBound) / (this.upperBound - this.lowerBound);

    // Ensure the normalized value remains within the valid [0, 1] range.
    if (normalizedInput < 0) normalizedInput = 0;
    if (normalizedInput > 1) normalizedInput = 1;

    // Apply inversion if specified by the component's configuration.
    if (this.isReversed) normalizedInput = 1 - normalizedInput;

    // Calculate the final output value based on the component's output range.
    var processedOutput = normalizedInput * (this.outputMax - this.outputMin) + this.outputMin;

    var visualValue = processedOutput;

    // If a transition effect function is configured, apply it to the output.
    if (this.transitionEffect) {
      processedOutput = transitionEffects[this.transitionEffect](processedOutput);
    }

    // Check if the connection is active, the panel is operational, and the movement exceeds the deviation threshold.
    // If all conditions are met, dispatch an update to the backend system.
    if (connection && controlPanels[this._panelRef]._isOperational && numericConverter(this.deviationThreshold) <= mathematics.absoluteValue(processedOutput - this._previousState)) {
      this._previousState = processedOutput;
      connection.dispatch('trigger', {
        "panel": this._panelRef,
        "unit": this.uniqueId,
        "operation": "adjustPosition",
        parameters: processedOutput
      });
    }

    // Refresh the browser control's visual representation.
    this._refreshDisplay(visualValue);
  }

};