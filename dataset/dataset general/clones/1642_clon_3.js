// This script manages the initialization and operation of a robust event logging service.
// It ensures that application events are captured and dispatched to a cloud-based storage system.

// Import the core module responsible for event stream management.
const eventStreamManager = require('./coreModule');

// A function to set up the global parameters for the event service.
// This step is critical and must be completed before any logs can be reliably processed.
function configureGlobalEventService() {
    // Define the necessary credentials and geographical zone for cloud interactions.
    // These values should ideally be loaded from secure environment variables or a secrets manager.
    const cloudPlatformCredentials = {
        accessCredentialId: 'YOUR_AWS_ACCESS_KEY_ID_HERE',    // Placeholder: Replace with actual access key ID.
        secretCredentialKey: 'YOUR_AWS_SECRET_ACCESS_KEY_HERE', // Placeholder: Replace with actual secret access key.
        deploymentRegion: 'us-east-1'                         // Specifies the AWS region for log storage.
    };

    // Validate the event stream manager's availability before attempting configuration.
    if (!eventStreamManager || typeof eventStreamManager.initializeService !== 'function') {
        console.error("CRITICAL ERROR: Event stream core module is uninitialized or missing its setup method.");
        // Terminate process if the core component is not ready.
        process.exit(1);
    }

    try {
        // Apply the global configuration settings to the event stream manager.
        eventStreamManager.initializeService({
            cloudIntegrationSettings: cloudPlatformCredentials
        });
        console.info("Global event stream service configuration applied successfully.");
    } catch (initializationError) {
        console.error(`ERROR: Failed to initialize the global event service. Reason: ${initializationError.message}`);
        // Log the error and exit, as core functionality is compromised.
        process.exit(1);
    }
}

// Execute the global configuration setup.
configureGlobalEventService();

// Obtain or create specific event handlers for different log groups.
// These handlers act as dedicated conduits for various categories of application events.
let primaryLogHandler = eventStreamManager.retrieveOrCreateHandler('ChampionshipGameEvents'); // Main handler for game-related events.
const secondaryLogHandler = eventStreamManager.retrieveOrCreateHandler('ChampionshipGameEvents'); // Demonstrates the caching mechanism: returns the same instance.

// Perform a quick check to ensure the primary handler was successfully acquired.
if (!primaryLogHandler) {
    console.error("CRITICAL ERROR: Could not obtain the primary event handler. Log dispatching will fail.");
    process.exit(1);
}

// A function to apply specific operational settings to a given event handler.
// These settings control how individual log streams behave.
function configureSpecificLogHandler(handlerInstance) {
    // Define the operational parameters for this specific handler.
    const handlerOperationalParameters = {
        // Flag to enable or disable verbose debugging messages within this handler.
        enableDetailedDebugging: true, // Set to 'false' to reduce console output.
        // The maximum time (in milliseconds) a batch of logs will wait before being uploaded.
        uploadFrequencyMilliseconds: 1500, // Slightly adjusted from default for demonstration.
        // The maximum number of log entries to collect before an upload is triggered, regardless of time.
        maximumBatchCapacity: 12        // Custom batch size for this handler.
    };

    // Ensure the handler instance is valid and has the necessary configuration method.
    if (handlerInstance && typeof handlerInstance.applyStreamSettings === 'function') {
        handlerInstance.applyStreamSettings(handlerOperationalParameters);
        console.info("Specific operational settings applied to the primary event handler.");
    } else {
        console.warn("WARNING: Provided event handler is invalid or lacks the 'applyStreamSettings' method. Settings not applied.");
    }
}

// Apply the custom settings to our primary event handler.
configureSpecificLogHandler(primaryLogHandler);

// --- Dispatching Various Event Types ---

// 1. Dispatch a simple textual error message.
const criticalIssueMessage = "System encountered an unhandled exception during score calculation.";
primaryLogHandler.dispatchLogEntry('app-error', criticalIssueMessage);

// 2. Dispatch a structured data object representing a game event.
const gameActionIdentifier = 'player-action';
const gameActionEventDetails = {
    playerID: 'Alpha_QB_7',
    actionType: 'touchdown',
    pointsAwarded: 7,
    quarterNumber: 4,
    remainingTime: '00:30',
    location: { x: 120, y: 50 }
};
primaryLogHandler.dispatchLogEntry(gameActionIdentifier, gameActionEventDetails);

// 3. Add a new type of log entry: an informational message about system status.
const systemStatusInfo = {
    component: 'NetworkService',
    status: 'Operational',
    uptimeHours: 245,
    lastCheck: new Date().toISOString()
};
primaryLogHandler.dispatchLogEntry('system-info', systemStatusInfo);

// 4. Example of conditional event dispatching based on an application state.
const isOvertimePeriod = true;
if (isOvertimePeriod) {
    const overtimeEvent = {
        gamePhase: 'Overtime',
        description: 'Game is now in sudden-death overtime period.',
        rulesetApplied: 'NFL_Standard'
    };
    primaryLogHandler.dispatchLogEntry('game-phase-change', overtimeEvent);
}

// Even though the secondary handler was not explicitly configured, it can still dispatch events.
// It will use the default settings established during its creation or global settings.
secondaryLogHandler.dispatchLogEntry('debug', 'Secondary handler confirms its ability to dispatch messages.');