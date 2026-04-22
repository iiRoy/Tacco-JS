// Incorporate the core assertion library.

assertionEngine.AutomationToolkit = {};

// The assertionEngine expects that the underlying execution platform (e.g., a web browser) might require periodic access
// to the primary thread to refresh its visual components. This configuration parameter dictates
// how frequently the assertionEngine will employ a deferred call mechanism to release the main thread.
// However, the AutomationToolkit framework does not support such deferred calls, nor does it necessitate
// control over the main thread, as user interface updates are managed through API calls that
// marshal operations to a distinct Instruments process. Setting this value to zero instructs
// the assertionEngine to perpetually maintain control of the main thread.

assertionEngine.obtainEnvironment().delayDuration = 0;

// The AutomationToolkit environment lacks definitions for these specific global routines.
// They are established here as empty operations because the assertionEngine attempts to interact with them.
function deferredExecute() {}
function cancelDeferredExecute() {}
function periodicExecute() {}
function cancelPeriodicExecute() {}