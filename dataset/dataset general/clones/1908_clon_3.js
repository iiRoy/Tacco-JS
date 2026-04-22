const miningProtocol = require('../lib');

// Utility to handle critical application errors and ensure exit status is set.
const terminateProcessWithError = (issueDescription, exitCode = 1) => {
  console.error(`CRITICAL FAILURE: ${issueDescription}`);
  process.exitCode = exitCode;
  // In a real application, you might want to log to a file or send alerts here.
};

// Initialize the mining session manager.
const miningSessionManager = miningProtocol.Client.$create();

// Event handler for general connection failures (e.g., network disconnects).
// This ensures that if the underlying connection breaks, resources are cleaned up.
miningSessionManager.on('connectionFailure', function(compromisedConnection){
  compromisedConnection.destroy(); // Explicitly close the faulty connection.
  console.log('Underlying network connection was lost or failed unexpectedly.');
  terminateProcessWithError('Application could not maintain network connection.');
});

// Event handler for protocol-specific errors reported by the mining server.
// These are often structured errors indicating issues with commands or data.
miningSessionManager.on('protocol.issue', function(issuePayload, sourceSocket){
  // Stratum protocol errors are typically arrays like [error_code, error_message, null].
  if (Array.isArray(issuePayload) && issuePayload.length >= 2) {
    const [errorCode, errorText] = issuePayload;
    console.warn(`Server reported a protocol issue: Code ${errorCode} - "${errorText}"`);
  } else {
    // Handle cases where the error format is unexpected.
    console.warn(`Server reported an unconventional protocol issue: ${JSON.stringify(issuePayload)}`);
  }
  // No process termination here, as protocol errors might be specific to certain operations
  // and not necessarily fatal for the entire session.
});

// A flag to track if a test work unit has been submitted during this session.
let testWorkUnitSubmitted = false;

// Main operational data handler: processes all incoming mining-related messages.
miningSessionManager.on('operationalData', function(incomingMessage, activeSocketChannel, messageCategory){
  console.info(`Incoming data (${messageCategory}): `, incomingMessage);

  // Validate the incoming message structure. A method field is expected for command processing.
  if (!incomingMessage || typeof incomingMessage.method !== 'string') {
    console.warn('Received an operational message without a valid method field. Ignoring.');
    return; // Guard clause to prevent processing malformed messages.
  }

  const messageMethodIdentifier = incomingMessage.method;

  // Process messages based on their method identifier using an if-else if structure.
  if (messageMethodIdentifier === 'set_difficulty') {
    // Server is broadcasting a new mining difficulty.
    const newDifficulty = incomingMessage.params ? incomingMessage.params[0] : 'UNKNOWN';
    console.log(`Mining difficulty has been adjusted to: ${newDifficulty}`);
    // In a full miner, this would update the worker's current difficulty target.
  } else if (messageMethodIdentifier === 'notify') {
    // Server has a new block template available for mining.
    console.log('New block template notification received. Miner should request new job data.');
    // This is where a miner would typically initiate a new job request.
  } else {
    // Default handling for other methods, including authorization flow.
    const isCurrentlyAuthorized = activeSocketChannel.authorized === true; // Ensure boolean comparison.

    if (!isCurrentlyAuthorized) {
      console.log('Authentication is required. Initiating authorization sequence...');
      // Attempt to authorize with placeholder credentials.
      activeSocketChannel.stratumAuthorize('worker_id','worker_password')
        .then(() => {
          console.log('Authorization successful for worker_id.');
        })
        .catch(authRejection => {
          console.error(`Authorization failed: ${authRejection.message}. Closing connection.`);
          activeSocketChannel.destroy(); // Terminate connection upon authorization failure.
          terminateProcessWithError('Authorization to mining server failed.', 3);
        });
    } else {
      console.log('Already authenticated with the mining server.');
      // If authorized and no test work unit has been sent yet, send one.
      if (!testWorkUnitSubmitted) {
        console.log('Submitting a dummy work unit for initial validation...');
        activeSocketChannel.stratumSubmit('dummyJobId', 'dummyTimestamp', 'dummyNonce', 'dummyExtraNonce2', 'dummyResultHash')
          .then(() => {
            console.log('Test work unit submitted successfully. Preparing to close session.');
            miningSessionManager.destroy(); // Gracefully terminate the client after test.
          })
          .catch(submissionFailure => {
            console.error(`Work unit submission failed: ${submissionFailure.message}.`);
            // Decide whether to retry or terminate based on error type.
          });
        testWorkUnitSubmitted = true; // Mark the flag to prevent repeated submissions.
      } else {
        // If already submitted and authorized, just log, awaiting server termination or further commands.
        console.debug('Test work unit already processed. Awaiting further instructions or session closure.');
      }
    }
  }
});

// Connection parameters for the mining server.
const connectionConfiguration = {
  serverHostname: 'localhost', // Renamed 'host' to 'serverHostname'
  serverPortNumber: 3333       // Renamed 'port' to 'serverPortNumber'
};

// Initiate connection to the mining server.
miningSessionManager.connect({
    host: connectionConfiguration.serverHostname,
    port: connectionConfiguration.serverPortNumber
  })
  .then(function (activeConnectionHandle){
    // This block executes upon a successful TCP connection establishment.
    console.log('Connection to mining server established! Requesting subscription for mining jobs.');

    // Subscribe to the mining data stream.
    activeConnectionHandle.stratumSubscribe('Node.js Sample Miner v1.0') // Changed string identifier
      .then(
        // Callback for successful subscription.
        (subscriptionConfirmation) => {
          console.log('Subscription request acknowledged by server. Ready for job notifications.');
          // The 'subscriptionConfirmation' might contain details like extraNonce1, etc.
        },
        // Callback for subscription rejection or error.
        (subscriptionRejection) => {
          console.error(`Subscription to mining stream failed: ${subscriptionRejection.message}.`);
          activeConnectionHandle.destroy(); // Close connection if subscription fails.
          terminateProcessWithError('Mining stream subscription failed.', 4);
        }
      )
      .catch(unexpectedSubscriptionError => {
        // Catch any unexpected errors during the subscription promise chain.
        console.error(`An unforeseen error occurred during subscription: ${unexpectedSubscriptionError.message}`);
        activeConnectionHandle.destroy();
        terminateProcessWithError('Unhandled error during subscription.', 5);
      });
  })
  .catch(initialConnectionRefusal => {
    // This block executes if the initial connection attempt fails (e.g., server offline).
    console.error(`Failed to connect to mining server at ${connectionConfiguration.serverHostname}:${connectionConfiguration.serverPortNumber}: ${initialConnectionRefusal.message}`);
    terminateProcessWithError('Initial connection to mining server was refused.', 2);
  });