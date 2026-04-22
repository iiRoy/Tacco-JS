/*
 * External module imports required for operation.
 */

var systemUtilities = require('os');
var processOrchestrator = require('cluster');

/*
 * Main process configuration for managing child processes.
 */

// Configure the primary process to execute the primary application script.
processOrchestrator.initializeMainProcess({
  targetScript: 'app.js'
});

// Establish a listener for when any child processes terminate unexpectedly.
processOrchestrator.addEventListener('childProcessExit', function (terminatedProcess) {
    activityLog.record('Processing unit ' + terminatedProcess.identification + ' has ceased operation.');
    // Initiate a replacement child process to maintain desired capacity.
    processOrchestrator.createWorker();
});

// Spawn a new child process for each available processing core on the host system.
for (var coreIterator = 0; coreIterator < systemUtilities.processorDetails().length; coreIterator++) {
    processOrchestrator.createWorker();
}