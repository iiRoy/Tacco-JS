/*
 * This module facilitates the generation of dynamic status updates for a simulated environment.
 * It leverages a configuration object to apply necessary policies and an event bus to dispatch the generated data.
 */

// Define a pool of potential entities or labels for the status updates.
var playerAliases = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];

/**
 * Initializes and returns a data service factory.
 * @param {object} serviceConfigurator - An object responsible for configuring service components and applying policies.
 * @param {function} dataEventBus - A function acting as an event bus or channel to publish data payloads.
 * @param {object} [auxiliarySettings] - Optional additional settings or parameters for service initialization.
 * @returns {object} An object containing methods for data generation.
 */
exports.createDataService = function(serviceConfigurator, dataEventBus, auxiliarySettings) {
  // Apply essential middleware or policies for session management and client authentication.
  // These ensure the service operates within a secure and managed context.
  serviceConfigurator.applyPolicy('session_management');
  serviceConfigurator.applyPolicy('client_access_control');

  // Define a constant for the update frequency to ensure consistency.
  const REPORTING_INTERVAL_SECONDS = 5;
  const MAX_SCORE_DIFFERENCE = 75; // Upper bound for the score difference
  const MIN_SCORE_DIFFERENCE = 1; // Lower bound for the score difference

  // Return the core functionality of this data service.
  return {
    // A version identifier for this service component.
    serviceVersion: '2.1.Beta',

    /**
     * Generates and dispatches a fresh status update payload.
     * This method simulates real-time data generation based on various factors.
     * @param {object} clientRequestInfo - Information pertaining to the client request,
     *                                     expected to contain an 'identifier' property.
     */
    generateStatusUpdate: function(clientRequestInfo) {
      const currentMoment = new Date(); // Capture the current timestamp.

      // Calculate a time-based identifier that updates only every `REPORTING_INTERVAL_SECONDS`.
      const timeSliceIdentifier = Math.trunc(currentMoment.getSeconds() / REPORTING_INTERVAL_SECONDS);

      // Randomly select an entity from the predefined aliases list.
      const activeEntityIndex = Math.floor(Math.random() * playerAliases.length);
      const currentPossessor = playerAliases[activeEntityIndex];

      // Determine a pseudo-random score difference within a defined range.
      const scoreDifferential = Math.floor(Math.random() * (MAX_SCORE_DIFFERENCE - MIN_SCORE_DIFFERENCE + 1)) + MIN_SCORE_DIFFERENCE;

      // Determine a textual status message based on the score differential.
      let contextualMessage;
      if (scoreDifferential > (MAX_SCORE_DIFFERENCE * 0.75)) {
        contextualMessage = 'Commanding lead!';
      } else if (scoreDifferential > (MAX_SCORE_DIFFERENCE * 0.4)) {
        contextualMessage = 'Holding strong.';
      } else {
        contextualMessage = 'Close contest.';
      }

      // Format the current time into an ISO 8601 string for consistent reporting.
      const reportTimestamp = currentMoment.toISOString();

      // Extract the client's preferred identifier, defaulting to 'Anonymous' if not provided.
      const requesterIdentifier = clientRequestInfo?.identifier || 'Anonymous';

      // Construct the comprehensive data payload.
      const generatedPayload = {
        updateCycleId: timeSliceIdentifier, // Unique ID for the current 5-second update window.
        activePlayer: currentPossessor,    // The entity currently in possession.
        advantageMargin: scoreDifferential, // The calculated score difference.
        generatedTime: reportTimestamp,    // The exact time this payload was generated.
        clientReference: requesterIdentifier, // Identifier of the requesting client.
        statusNote: contextualMessage      // A descriptive message based on the advantage margin.
      };

      // Publish the generated payload to the designated event bus for consumption.
      dataEventBus(generatedPayload);
    }
  };
};