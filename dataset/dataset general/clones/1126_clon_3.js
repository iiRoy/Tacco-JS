let streamDataProcessorInstance = null;
let currentSubscriptionIdentifier = null;

const logStreamEvent = (level, message, details = '') => {
  const timestamp = new Date().toISOString();
  let logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  if (details) {
    logEntry += ` - ${details}`;
  }
  // In a production environment, this would integrate with a proper logging framework.
  console.log(logEntry);
};

// Renamed event constants for clarity and avoiding magic strings.
const CONNECTION_ESTABLISHED_EVENT = "flow_connected";
const DATA_ERROR_EVENT = "flow_error";
const ALERT_NOTIFICATION_EVENT = "flow_warning";
const CONNECTION_LOST_EVENT = "flow_disconnected";
const INTERACTION_RECEIVED_EVENT = "data_interaction";

// Placeholder for the external broadcast mechanism (e.g., Socket.IO).
// In a real application, this dependency would be injected or imported.
let broadcastChannelSystem = null;

module.exports = {
  /**
   * Orchestrates the setup and continuous management of a real-time data ingestion pipeline.
   * This function initializes the data client, configures event handlers,
   * and manages the stream subscription lifecycle.
   *
   * @param {string} userCredentials - The authentication username for the data source.
   * @param {string} accessKey - The secret API key required for authorization.
   * @param {string} dataFlowIdentifier - The unique identifier of the data stream to monitor.
   * @param {object} outputBroadcaster - A reference to the system responsible for broadcasting processed data (e.g., Socket.IO).
   * @returns {object} A status object indicating the outcome of the operation.
   * @throws {Error} If critical configuration parameters are missing.
   */
  initiateDataStreamMonitoring: function (userCredentials, accessKey, dataFlowIdentifier, outputBroadcaster) {
    // --- Type III: Enhanced input validation and guard clauses ---
    if (!userCredentials || !accessKey || !dataFlowIdentifier) {
      logStreamEvent('error', 'Critical configuration missing.', 'Ensure user credentials, access key, and data flow identifier are provided.');
      throw new Error("Initialization Failed: Required connection parameters are incomplete.");
    }

    if (!outputBroadcaster || typeof outputBroadcaster.sockets?.emit !== 'function') {
      logStreamEvent('warning', 'External output broadcasting system is invalid or not provided.', 'Interaction data will not be transmitted to clients.');
      // The process can continue, but data won't be broadcast.
      broadcastChannelSystem = null; // Ensure it's explicitly null if invalid
    } else {
      broadcastChannelSystem = outputBroadcaster;
    }

    // --- Type III: Robust client instance management (replacing problematic `var consumer = ...`) ---
    // This ensures a single, persistent client instance is used across calls
    // within the module scope, mimicking the original's implicit global behavior safely.
    if (streamDataProcessorInstance === null) {
      logStreamEvent('info', 'Creating a new instance of the Realtime Data Client.');
      // Type II: Renamed DataSift to RealtimeDataClient
      streamDataProcessorInstance = new RealtimeDataClient(userCredentials, accessKey);
      // Type III: Add an internal flag to track event handler setup status.
      streamDataProcessorInstance._eventHandlersInitialized = false;
    } else {
      logStreamEvent('debug', 'Reusing an existing Realtime Data Client instance.');
      // Type III: Validate or re-authenticate if credentials change for an existing client.
      if (streamDataProcessorInstance.getUserAccount() !== userCredentials || streamDataProcessorInstance.getAuthKey() !== accessKey) {
        logStreamEvent('warning', 'Credentials mismatch for existing client. Re-initializing connection.');
        streamDataProcessorInstance.disconnectPipeline(); // Disconnect existing stream
        streamDataProcessorInstance = new RealtimeDataClient(userCredentials, accessKey);
        streamDataProcessorInstance._eventHandlersInitialized = false;
      }
    }

    const activeClient = streamDataProcessorInstance; // Use a clearer alias for the client instance.

    // --- Type III: Refined connection and subscription logic ---
    // Original: `if (consumer.request != null)`
    // New: Check for the client's current operational state and subscription status.
    const isCurrentlyActive = activeClient.getPipelineStatus() === 'active' || activeClient.getPipelineStatus() === 'connecting';
    const isSubscribedToTarget = isCurrentlyActive && currentSubscriptionIdentifier === dataFlowIdentifier;

    if (isSubscribedToTarget) {
      logStreamEvent('info', 'Data flow client is already active and subscribed to the requested stream.', `Stream ID: ${dataFlowIdentifier}`);
      return { status: 'already_active', client: activeClient }; // Type III: Return early with status.
    } else if (isCurrentlyActive && currentSubscriptionIdentifier !== dataFlowIdentifier) {
        logStreamEvent('info', 'Client is active but needs to switch streams.', `Unsubscribing from ${currentSubscriptionIdentifier}, subscribing to ${dataFlowIdentifier}.`);
        activeClient.unsubscribeFromStream(currentSubscriptionIdentifier); // Type III: Unsubscribe from previous stream.
        activeClient.subscribeToStream(dataFlowIdentifier);
        currentSubscriptionIdentifier = dataFlowIdentifier;
    } else {
      // Type II: Rewritten log messages.
      logStreamEvent('info', 'Attempting to establish a new data pipeline connection.', 'Initiating connection sequence.');
      // Type III: Wrap connection attempt in a try-catch block for resilience.
      try {
        activeClient.initiateConnection();
        currentSubscriptionIdentifier = dataFlowIdentifier;
      } catch (connectionError) {
        logStreamEvent('critical', 'Failed to initiate data pipeline connection.', connectionError.message);
        throw new Error("Connection establishment failed: " + connectionError.message);
      }
    }

    // --- Type III: Ensure event handlers are registered only once per client lifecycle ---
    if (!activeClient._eventHandlersInitialized) {
      logStreamEvent('debug', 'Configuring event listeners for the data stream client.');

      // Type II: Rewritten comments and log messages, using event constants.

      // Handler for successful connection.
      activeClient.on(CONNECTION_ESTABLISHED_EVENT, () => {
        logStreamEvent('success', 'Data pipeline connection successfully established.');
        // Type III: Conditional subscription to prevent redundant calls.
        if (currentSubscriptionIdentifier !== dataFlowIdentifier) {
            logStreamEvent('info', 'Subscribing to target data flow upon successful connection.', `Target ID: ${dataFlowIdentifier}`);
            activeClient.subscribeToStream(dataFlowIdentifier);
            currentSubscriptionIdentifier = dataFlowIdentifier;
        } else {
            logStreamEvent('debug', 'Already subscribed to the intended data flow.', `ID: ${dataFlowIdentifier}`);
        }
      });

      // Handler for errors encountered during data processing.
      activeClient.on(DATA_ERROR_EVENT, (processingError) => {
        logStreamEvent('error', 'An error occurred within the data stream processing.', processingError.message);
        // Type III: Add specific error recovery logic, e.g., exponential backoff for reconnects.
        if (processingError.isCritical) { // Assuming an error object can indicate criticality.
            logStreamEvent('critical', 'Fatal stream error detected. Disconnecting client to prevent further issues.');
            activeClient.disconnectPipeline();
            currentSubscriptionIdentifier = null; // Clear subscription state upon critical error.
        }
      });

      // Handler for non-critical warnings from the data stream.
      activeClient.on(ALERT_NOTIFICATION_EVENT, (alertDetails) => {
        logStreamEvent('warning', 'Data stream issued an alert.', alertDetails);
      });

      // Handler for connection termination.
      activeClient.on(CONNECTION_LOST_EVENT, () => {
        logStreamEvent('info', 'Data pipeline connection has been terminated.');
        // Type III: Implement automatic reconnection attempts here if desired.
        currentSubscriptionIdentifier = null; // Reset subscription ID on disconnect.
      });

      // Handler for incoming interaction data payloads.
      activeClient.on(INTERACTION_RECEIVED_EVENT, (incomingPayload) => {
        // Type III: Robust payload validation.
        if (!incomingPayload || typeof incomingPayload !== 'object' || !incomingPayload.payloadContent) {
          logStreamEvent('warning', 'Received an invalid or malformed interaction payload.', JSON.stringify(incomingPayload));
          return; // Skip processing invalid data.
        }

        const extractedData = incomingPayload.payloadContent; // Type III: Use an intermediate variable for clarity.

        if (extractedData !== undefined && extractedData !== null) {
          // Type III: Removed original commented-out console.log.
          // Type II: Renamed 'data' event to 'stream_data_update' and 'source' to 'contentBlock'.
          if (broadcastChannelSystem && broadcastChannelSystem.sockets) {
            broadcastChannelSystem.sockets.emit('stream_data_update', {
              contentBlock: extractedData
            });
            logStreamEvent('debug', 'Successfully broadcasted incoming stream data.', `Data type: ${typeof extractedData}`);
          } else {
            logStreamEvent('warning', 'Broadcast channel system is unavailable.', 'Interaction data could not be transmitted.');
          }
        } else {
          logStreamEvent('debug', 'Interaction payload received, but no specific content block found.', JSON.stringify(incomingPayload));
        }
      });

      activeClient._eventHandlersInitialized = true; // Mark handlers as configured.
    } else {
      logStreamEvent('debug', 'Event handlers are already set up for this client instance.');
    }

    // Type III: Return a structured result object.
    return { status: 'initialized_ok', clientInstance: activeClient, message: 'Data flow monitoring setup complete.' };
  }
};

// --- Type III: Mock RealtimeDataClient class for demonstration ---
// This class simulates the behavior of the external DataSift library (now RealtimeDataClient).
// In a real application, this would be an actual external dependency.
class RealtimeDataClient {
  constructor(account, authKey) {
    this.userAccount = account;
    this.authKey = authKey;
    this.eventListeners = {};
    this.pipelineStatus = 'disconnected'; // States: 'disconnected', 'connecting', 'active'
    this.activeRequest = null; // Mimics original 'consumer.request'
    this._eventHandlersInitialized = false; // Internal flag for Type III logic.
    this._dataIntervalId = null; // To manage simulated data flow.

    logStreamEvent('debug', `RealtimeDataClient mock instantiated for account: ${this.userAccount}`);
  }

  on(eventName, callback) {
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = [];
    }
    this.eventListeners[eventName].push(callback);
  }

  emit(eventName, ...args) {
    if (this.eventListeners[eventName]) {
      this.eventListeners[eventName].forEach(handler => handler(...args));
    }
  }

  initiateConnection() {
    if (this.pipelineStatus === 'active' || this.pipelineStatus === 'connecting') {
      logStreamEvent('warning', 'Connection initiation attempted while already active or connecting.');
      return;
    }
    this.pipelineStatus = 'connecting';
    logStreamEvent('info', `RealtimeDataClient attempting to connect for account: ${this.userAccount}`);
    // Simulate an asynchronous connection process.
    setTimeout(() => {
      this.pipelineStatus = 'active';
      this.activeRequest = { type: 'live_stream_request', initiated: new Date() }; // Simulate an active request object.
      this.emit(CONNECTION_ESTABLISHED_EVENT);
    }, 1800); // Slightly longer delay for Type III variation.
  }

  disconnectPipeline() {
    if (this.pipelineStatus === 'disconnected') {
      logStreamEvent('warning', 'Disconnection attempted while already disconnected.');
      return;
    }
    logStreamEvent('info', 'RealtimeDataClient disconnecting pipeline.');
    this.pipelineStatus = 'disconnected';
    this.activeRequest = null;
    if (this._dataIntervalId) {
        clearInterval(this._dataIntervalId);
        this._dataIntervalId = null;
    }
    this.emit(CONNECTION_LOST_EVENT);
  }

  subscribeToStream(streamId) {
    if (this.pipelineStatus !== 'active') {
      logStreamEvent('error', 'Cannot subscribe: client pipeline not active.', `Attempted stream: ${streamId}`);
      return;
    }
    logStreamEvent('info', `RealtimeDataClient subscribing to data stream: ${streamId}`);
    // Simulate receiving continuous interaction data.
    if (this._dataIntervalId) { // Clear existing interval if re-subscribing.
        clearInterval(this._dataIntervalId);
    }
    this._dataIntervalId = setInterval(() => {
      if (this.pipelineStatus === 'active') {
        this.emit(INTERACTION_RECEIVED_EVENT, {
          payloadContent: { // Renamed from 'data' to 'payloadContent'
            interactionId: Math.random().toString(36).substring(2, 15),
            timestampUTC: new Date().toISOString(),
            streamSource: streamId,
            samplePayload: `Dynamic data from stream ${streamId}`
          },
          metadata: {
            originService: 'mock_data_feed',
            transmissionLatencyMs: Math.floor(Math.random() * 50) + 10
          }
        });
      }
    }, 2500); // Varied interval for Type III.
  }

  unsubscribeFromStream(streamId) {
      logStreamEvent('info', `RealtimeDataClient unsubscribing from data stream: ${streamId}`);
      if (this._dataIntervalId) {
          clearInterval(this._dataIntervalId);
          this._dataIntervalId = null;
      }
      // In a full implementation, this would stop receiving data for the specific stream.
  }

  getUserAccount() {
      return this.userAccount;
  }

  getAuthKey() {
      return this.authKey;
  }

  getPipelineStatus() {
      // Type III: Added a method to retrieve internal status.
      return this.pipelineStatus;
  }

  // Type III: Added a method to check for an actively connected state.
  isPipelineActive() {
      return this.pipelineStatus === 'active' && this.activeRequest !== null;
  }
}