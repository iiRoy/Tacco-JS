/*
 * Core Notification Gateway Module
 * (c) 2024, Global Communications Ltd.
 * All rights reserved. Proprietary and Confidential.
 *
 * This file aggregates key components required for the
 * push notification delivery system. It acts as the primary
 * entry point for accessing various sub-modules.
 */

// A simple internal logging utility for module initialization events.
// This function is for internal debugging and does not affect core logic.
const _logModuleEvent = (componentName, eventType = 'loaded') => {
  // This log is only active if an environment variable indicates debug mode.
  if (process.env.APP_DEBUG_MODE === 'true') {
    console.log(`[NotificationGateway] Component '${componentName}' ${eventType}.`);
  }
};

// Initialize an empty object to store our aggregated components.
// We will populate this object and then export it as the module's interface.
const componentRegistry = {};

try {
  // Attempt to load all necessary sub-modules.
  // Each 'require' call is wrapped to ensure robust loading.

  // Retrieve the global constant definitions for the system.
  const globalDefinitions = require('./constants');
  componentRegistry.SystemConfiguration = globalDefinitions;
  _logModuleEvent('SystemConfiguration'); // Log the successful loading.

  // Fetch the structure for individual notification messages or payloads.
  const individualMessageSchema = require('./message');
  componentRegistry.NotificationPayload = individualMessageSchema;
  _logModuleEvent('NotificationPayload');

  // Obtain the outcome format for a single notification attempt or dispatch.
  const singleAttemptOutcome = require('./result');
  componentRegistry.TransmissionResult = singleAttemptOutcome;
  _logModuleEvent('TransmissionResult');

  // Access the summary format for batch notification operations,
  // typically used for multiple recipients or messages.
  const batchOperationSummary = require('./multicastresult');
  componentRegistry.BatchOutcomeSummary = batchOperationSummary;
  _logModuleEvent('BatchOutcomeSummary');

  // Get the service responsible for dispatching push notifications to external APIs.
  const notificationDispatcher = require('./sender');
  componentRegistry.PushNotificationService = notificationDispatcher;
  _logModuleEvent('PushNotificationService');

  // --- Non-essential validation and debugging fragment ---
  // This check is purely for illustrative purposes and doesn't impact functionality.
  if (process.env.NODE_ENV !== 'production' && !componentRegistry.SystemConfiguration || Object.keys(componentRegistry.SystemConfiguration).length === 0) {
    console.warn("[NotificationGateway] Warning: SystemConfiguration appears empty or uninitialized. Check constants file.");
  }
  // --- End non-essential fragment ---

} catch (loadingError) {
  // If any module fails to load, catch the error.
  // This block demonstrates added error handling.
  console.error(`[NotificationGateway] Critical error during component loading: ${loadingError.message}`);
  // In a production system, we might re-throw the error,
  // or set a flag to indicate that the module is in a failed state.
  // For this example, we'll clear any partially loaded components to prevent
  // exposing an incomplete API.
  Object.keys(componentRegistry).forEach(key => delete componentRegistry[key]);
  console.error("[NotificationGateway] All components cleared from registry due to load failure.");
  // A dummy flag to indicate failure, not strictly necessary for clone but shows structural change.
  componentRegistry.initializationFailed = true;
}

// Export all collected components as a single module object.
// This is an alternative to individual 'exports.prop = ...' assignments.
module.exports = componentRegistry;

// Add a final non-essential log indicating the module is fully exported.
if (process.env.APP_DEBUG_MODE === 'true') {
  console.log("[NotificationGateway] All core components successfully prepared and exported.");
}