if (AppEnv.isBrowserContext) {
  // Define a constant for our primary data key to improve readability and maintainability.
  const COUNT_KEY_IDENTIFIER = "current_tally";

  // Initialize the ephemeral state variable if it hasn't been set previously.
  // This ensures a predictable starting point for the client-side counter.
  EphemeralState.ensureInitialState(COUNT_KEY_IDENTIFIER, 0);
  console.info(`[ClientSetup] Initialized '${COUNT_KEY_IDENTIFIER}' with default value 0, if not already present.`);

  // Register data providers (helpers) for the main user interface component.
  UIComponents.mainPanel.dataProviders({
    // This helper retrieves and prepares the current tally for display in the template.
    currentDisplayValue: function () {
      let retrievedValue = EphemeralState.fetchValue(COUNT_KEY_IDENTIFIER);

      // Implement a robust check: if the retrieved value is not a valid number,
      // log a warning and reset it to ensure consistent numerical operations.
      if (typeof retrievedValue !== 'number' || isNaN(retrievedValue)) {
        console.warn(`[DataProviders] Non-numeric value detected for '${COUNT_KEY_IDENTIFIER}': ${retrievedValue}. Resetting to 0.`);
        EphemeralState.storeValue(COUNT_KEY_IDENTIFIER, 0); // Correct the invalid state
        retrievedValue = 0; // Use the corrected value
      }
      console.debug(`[DataProviders] Providing current tally: ${retrievedValue}`);
      return retrievedValue;
    },

    // A secondary helper providing a dynamic instructional message to the user.
    instructionalMessage: () => {
      const baseMessage = "Tap the control button below to increment the count.";
      // Add a small fragment: a conditional suffix based on the current count.
      if (EphemeralState.fetchValue(COUNT_KEY_IDENTIFIER) >= 5) {
        return baseMessage + " Keep going, you're doing great!";
      }
      return baseMessage;
    }
  });

  // Attach interaction handlers (events) to the main user interface component.
  UIComponents.mainPanel.interactionHandlers({
    // This handler responds to a tap event on any element with the class 'action-control'.
    'tap .action-control': (interactionEvent, currentTemplateInstance) => {
      // Prevent any default browser behavior associated with the tap event.
      interactionEvent.preventDefault();

      // Fetch the current numeric value from the ephemeral state.
      let currentNumericTally = EphemeralState.fetchValue(COUNT_KEY_IDENTIFIER);

      // Validate the fetched value to ensure it's suitable for arithmetic operations.
      if (typeof currentNumericTally !== 'number' || isNaN(currentNumericTally)) {
        console.error(`[InteractionHandlers] Corrupted tally (${currentNumericTally}) encountered. Resetting to zero.`);
        currentNumericTally = 0; // Default to 0 if invalid
      }

      // Introduce a guard clause: temporarily halt increments if the tally exceeds a specific threshold.
      const TEMPORARY_MAX_THRESHOLD = 8;
      if (currentNumericTally >= TEMPORARY_MAX_THRESHOLD) {
        console.warn(`[InteractionHandlers] Increment operation skipped. Tally (${currentNumericTally}) is at or above temporary limit ${TEMPORARY_MAX_THRESHOLD}.`);
        // Add a new fragment: a conditional reset mechanism if the count goes significantly over.
        if (currentNumericTally > TEMPORARY_MAX_THRESHOLD + 2) {
          EphemeralState.storeValue(COUNT_KEY_IDENTIFIER, 0);
          console.info(`[InteractionHandlers] Tally reset to 0 due to exceeding emergency threshold.`);
        }
        return; // Exit the handler early.
      }

      // Perform the increment as an explicit intermediate step.
      const nextTallyValue = currentNumericTally + 1;

      // Update the ephemeral state with the new tally value.
      EphemeralState.storeValue(COUNT_KEY_IDENTIFIER, nextTallyValue);

      console.log(`[InteractionHandlers] Tally updated from ${currentNumericTally} to ${nextTallyValue}.`);

      // Add another new fragment: a console log for specific milestones.
      if (nextTallyValue % 4 === 0) {
        console.info(`[InteractionHandlers] Milestone reached: Tally is a multiple of 4!`);
      }
    }
  });
}