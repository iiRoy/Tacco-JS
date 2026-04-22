var controlOperations = {

  /**
   * Activates the associated component, dispatching a signal to the backend.
   * This method corresponds to the "on" state.
   */
  activateComponent: function() {
    // Ensure a global communication channel is established before attempting to send data.
    if (!globalConnection) {
      console.warn('Communication channel not available. Cannot activate component.');
      return; // Early exit if no connection.
    }

    try {
      // Dispatch an activation command via the established channel.
      globalConnection.emit('command_relay', {
        'targetBoard': this.associatedBoardKey,
        'componentId': this.instanceIdentifier,
        'actionType': 'power_on_request'
      });
      // Update the client-side visual state to reflect the activation.
      this.updateVisualState(true, 'active');
      console.info(`Component ${this.instanceIdentifier} on board ${this.associatedBoardKey} activated.`);
    } catch (error) {
      console.error(`Failed to send activation command for ${this.instanceIdentifier}:`, error);
    }
  },

  /**
   * Deactivates the associated component, dispatching a signal to the backend.
   * This method corresponds to the "off" state.
   */
  deactivateComponent: function() {
    // Guard against operations without an active communication channel.
    if (!globalConnection) {
      console.warn('Communication channel missing. Deactivation command aborted.');
      return;
    }

    // Attempt to send a deactivation signal.
    globalConnection.emit('command_relay', {
      'targetBoard': this.associatedBoardKey,
      'componentId': this.instanceIdentifier,
      'actionType': 'power_off_request'
    });
    // Reflect the deactivation in the user interface.
    this.updateVisualState(false, 'inactive');
    console.info(`Component ${this.instanceIdentifier} on board ${this.associatedBoardKey} deactivated.`);
  },

  /**
   * Adjusts the operational value of the component, handling input normalization,
   * range mapping, and optional transformations before dispatching to the server.
   *
   * @param {number|null|undefined} rawInputPayload - The raw input value, potentially from a UI element.
   */
  adjustValue: function(rawInputPayload) {
    let currentInputVal;

    // Determine the source of the input value. If not provided, fetch from the DOM.
    if (rawInputPayload == null) { // Checks for both null and undefined
      const domElement = document.getElementById(this.instanceIdentifier);
      if (!domElement || typeof domElement.value === 'undefined') {
        console.error(`DOM element or its value not found for ID: ${this.instanceIdentifier}. Cannot adjust value.`);
        return; // Halt if input cannot be determined.
      }
      currentInputVal = Number(domElement.value);
    } else {
      currentInputVal = Number(rawInputPayload);
    }

    // Basic validation for the input value.
    if (isNaN(currentInputVal)) {
      console.warn(`Invalid numeric input received for ${this.instanceIdentifier}. Skipping adjustment.`);
      return;
    }

    // --- Value Normalization (Input Range to 0-1) ---
    const rawInputSpan = this.rawInputMaximum - this.rawInputMinimum;
    if (rawInputSpan === 0) {
      console.warn(`Input range for ${this.instanceIdentifier} is zero. Cannot normalize.`);
      currentInputVal = this.rawInputMinimum; // Fallback to minimum
    }

    let normalizedRatio = (currentInputVal - this.rawInputMinimum) / rawInputSpan;

    // Clamp the normalized value to ensure it stays within the [0, 1] range.
    normalizedRatio = Math.max(0, Math.min(1, normalizedRatio));

    // Apply inversion if configured for the component.
    if (this.isOutputInverted) {
      normalizedRatio = 1 - normalizedRatio;
    }

    // --- Output Value Scaling (0-1 to Target Output Range) ---
    const outputSpan = this.outputRangeMax - this.outputRangeMin;
    let processedOutput = normalizedRatio * outputSpan + this.outputRangeMin;

    // This variable holds the value that will be displayed locally.
    let visualRepresentation = processedOutput;

    // --- Apply Optional Transformation (e.g., easing function) ---
    if (this.transformationKey && valueTransformers && typeof valueTransformers[this.transformationKey] === 'function') {
      processedOutput = valueTransformers[this.transformationKey](processedOutput);
    }

    // --- Conditional Server Update ---
    // Only send an update if a connection exists, the board is operational,
    // and the change exceeds the defined tolerance threshold.
    const currentChangeMagnitude = Math.abs(processedOutput - this.lastReportedValue);
    const hasSignificantChange = currentChangeMagnitude >= this.updateThreshold;
    const isBoardReady = registeredBoards && registeredBoards[this.associatedBoardKey] && registeredBoards[this.associatedBoardKey]._ready;

    if (globalConnection && isBoardReady && hasSignificantChange) {
      // Update the last reported value *before* emitting to prevent re-triggering on the same value.
      this.lastReportedValue = processedOutput;

      // Dispatch the updated value to the server.
      globalConnection.emit('command_relay', {
        'targetBoard': this.associatedBoardKey,
        'componentId': this.instanceIdentifier,
        'actionType': 'set_value',
        'parameters': processedOutput // Send the transformed value.
      });
      console.debug(`Sent updated value for ${this.instanceIdentifier}: ${processedOutput}`);
    } else if (!globalConnection) {
        console.warn('No active connection to send value updates.');
    } else if (!isBoardReady) {
        console.warn(`Board ${this.associatedBoardKey} not ready for updates.`);
    } else {
        console.debug(`Change for ${this.instanceIdentifier} (${currentChangeMagnitude}) below threshold (${this.updateThreshold}). No server update.`);
    }

    // --- Final Client-Side State Update ---
    // Always update the local visual state, regardless of server communication.
    this.updateVisualState(visualRepresentation, 'value_updated');
  }

};