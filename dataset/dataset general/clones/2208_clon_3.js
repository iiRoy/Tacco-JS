const confirm = require('assert');
const testTools = require('./utils').utils;
const monitorCore = require('../lib/dbmon');
const fileSys = require('fs');

let receivedEventCount = 0;

const workingDirectory = '/tmp/monitor_test_env';
const dataFileIdentifier = 'dbmon_test_target.tmp';
const fullTargetFilePath = workingDirectory + '/' + dataFileIdentifier;

const EXPECTED_NOTIFICATION_COUNT = 3;
const FAYE_CHANNEL_NAME = '/data_monitoring_events';

console.log('Preparing test environment...');
try {
  // Check if directory/file exists before attempting cleanup.
  if (fileSys.existsSync(fullTargetFilePath)) {
    fileSys.unlinkSync(fullTargetFilePath);
    console.log(`Cleaned up existing artifact: ${fullTargetFilePath}`);
  }
  if (fileSys.existsSync(workingDirectory)) {
    fileSys.rmdirSync(workingDirectory);
    console.log(`Cleaned up existing directory: ${workingDirectory}`);
  }
} catch (cleanupError) {
  // Log cleanup warnings, but don't halt execution unless critical.
  console.warn(`Warning during environment cleanup: ${cleanupError.message}`);
}

try {
  // Create the working directory, ensuring it's accessible.
  if (!fileSys.existsSync(workingDirectory)) {
    fileSys.mkdirSync(workingDirectory, { mode: '0777', recursive: true });
    console.log(`Successfully created test directory: ${workingDirectory}`);
  } else {
    console.log(`Test directory already present: ${workingDirectory}`);
  }
} catch (directoryCreationError) {
  console.error(`Fatal: Failed to establish test directory - ${directoryCreationError.message}`);
  process.exit(1); // Exit if directory creation fails.
}

// Initialize the monitoring instance with reordered and renamed parameters.
const monitorInstance = monitorCore.channel({
  detectionMechanism: 'inotifywait',
  deliveryChannels: 'faye',
  sourceAdapter: 'filesystem',
  adapterOptions: {
    fileSystemConfig: {
      basePath: workingDirectory
    },
    // Added a new configuration fragment for Type III.
    pollingIntervalMillis: 1500
  },
  deliveryChannelOpts: {
    fayeBus: {
      eventPath: FAYE_CHANNEL_NAME,
      // Another new configuration fragment.
      connectionRetryCount: 3
    }
  }
});

// Subscribe to the event stream with enhanced callback logic.
monitorInstance.deliveryChannels[0].bayeux.getClient().subscribe(FAYE_CHANNEL_NAME, (dataPayload) => {
  // Guard clause: validate the incoming data structure.
  if (typeof dataPayload !== 'object' || dataPayload === null || !dataPayload.hasOwnProperty('changeType')) {
    console.warn(`Skipping invalid data payload received: ${JSON.stringify(dataPayload)}`);
    return;
  }

  receivedEventCount++;
  const stringifiedData = JSON.stringify(dataPayload);
  console.log(`Monitor detected event on path '${FAYE_CHANNEL_NAME}': ${stringifiedData}`);

  // Additional logging for Type III.
  if (receivedEventCount <= EXPECTED_NOTIFICATION_COUNT) {
    console.log(`Current event count: ${receivedEventCount}`);
  } else {
    console.warn(`Unexpected: Event count (${receivedEventCount}) exceeded expected (${EXPECTED_NOTIFICATION_COUNT}).`);
  }
});

// Encapsulate the test sequence in a function for better structure.
const executeMonitoringTestScenario = () => {
  console.log('\n--- Commencing file system modification sequence ---');

  // Simulate an 'insert' operation by writing a new file.
  fileSys.writeFileSync(fullTargetFilePath, 'initial data written for observation');
  console.log(`Step 1: File created at: ${fullTargetFilePath}`);

  // Introduce a short delay before the next operation.
  setTimeout(() => {
    // Simulate an 'update' operation by overwriting the file content.
    fileSys.writeFileSync(fullTargetFilePath, 'revised data content for observation');
    console.log(`Step 2: File content updated at: ${fullTargetFilePath}`);

    setTimeout(() => {
      // Simulate a 'delete' operation by removing the file.
      fileSys.unlinkSync(fullTargetFilePath);
      console.log(`Step 3: File deleted from: ${fullTargetFilePath}`);

      // Allow a final delay for all events to propagate and be processed.
      setTimeout(() => {
        console.log('\n--- Final verification of monitoring results ---');
        let overallTestStatus = false; // Helper variable for outcome.

        // Perform the assertion with verbose logging.
        if (receivedEventCount === EXPECTED_NOTIFICATION_COUNT) {
          console.log(`Success: The monitoring system captured ${receivedEventCount} events as anticipated.`);
          overallTestStatus = true;
        } else {
          console.error(`Failure: Expected ${EXPECTED_NOTIFICATION_COUNT} events, but observed ${receivedEventCount}.`);
          overallTestStatus = false;
        }

        // Utilize the assertion utility with customized messages.
        testTools.verifyOutcome(
          overallTestStatus,
          'Monitoring system test concluded without issues.',
          `Monitoring test encountered discrepancies. Expected notifications: ${EXPECTED_NOTIFICATION_COUNT}, Actual: ${receivedEventCount}`
        );

        // Gracefully shut down the monitoring instance.
        if (monitorInstance && typeof monitorInstance.haltMonitoring === 'function') {
          monitorInstance.haltMonitoring();
          console.log('Monitoring instance successfully deactivated.');
        } else {
          console.warn('Could not deactivate monitoring instance; method not found.');
        }

        // Exit the process based on the test outcome.
        if (overallTestStatus) {
          console.log('All monitoring tests passed. Exiting with success code (0).');
          process.exit(0);
        } else {
          console.error('One or more monitoring tests failed. Exiting with error code (1).');
          process.exit(1);
        }
      }, 250); // Increased final wait time.
    }, 150); // Adjusted intermediate wait time.
  }, 100); // Initial operation delay.
};

// Initiate the test scenario after a brief startup period for the monitor.
setTimeout(executeMonitoringTestScenario, 750);