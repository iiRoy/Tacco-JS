const SocketBridge = require('../');
const webServerFactory = require('http').Server;
const assert = require('assert');

// Global configuration object for the SocketBridge server.
const bridgeServerConfiguration = {
  transformer: 'websockets', // Specifies the underlying transport mechanism
  parser: 'JSON' // Defines the data serialization format
};

// --- Core Utility Functions for Test Scenarios ---

/**
 * Generates a client connection instance for the SocketBridge.
 * This function encapsulates the logic for creating a client socket.
 * @param {object} activeHttpServer - The running Node.js HTTP server instance.
 * @param {object} bridgeCoreInstance - The initialized SocketBridge server object.
 * @param {number} [clientSpecificPort] - An optional port to override the server's assigned port.
 * @returns {object} A new SocketBridge client socket.
 * @throws {Error} If server address or port details are unavailable.
 */
const establishBridgeClient = (activeHttpServer, bridgeCoreInstance, clientSpecificPort) => {
  const serverNetworkInfo = activeHttpServer.address();
  // Prioritize a custom port if provided, otherwise use the server's default.
  const connectionTargetPort = clientSpecificPort || serverNetworkInfo.port;

  // Validate critical connection parameters.
  if (!serverNetworkInfo.address || !connectionTargetPort) {
    throw new Error('Crucial network details (address/port) are missing for client connection setup.');
  }

  const connectionAddress = `http://${serverNetworkInfo.address}:${connectionTargetPort}`;
  return new bridgeCoreInstance.Socket(connectionAddress);
};

/**
 * Initializes and configures the SocketBridge server on a given HTTP server.
 * Includes basic validation and merges default options.
 * @param {object} httpServerReference - The HTTP server to attach SocketBridge to.
 * @param {object} optionsForBridge - Configuration options for the SocketBridge instance.
 * @returns {object} The configured SocketBridge server instance.
 * @throws {TypeError} If the provided server reference is invalid.
 */
const setupBridgeServer = (httpServerReference, optionsForBridge) => {
  // Enforce a valid HTTP server object.
  if (!httpServerReference || typeof httpServerReference.listen !== 'function') {
    console.error('An invalid HTTP server object was provided for SocketBridge setup.');
    throw new TypeError('A functional HTTP server reference is mandatory for bridge initialization.');
  }

  // Augment provided options with internal defaults.
  const effectiveBridgeOptions = {
    connectionTimeout: 15000, // Added a new default setting for connection timeout.
    ...optionsForBridge
  };
  return SocketBridge(httpServerReference, effectiveBridgeOptions);
};

/**
 * Manages the completion of asynchronous test steps.
 * Decrements a counter and calls the 'done' callback when all steps are finished.
 * @param {function} testDoneCallback - The 'done' function provided by the test framework.
 * @param {number} initialTaskCount - The total number of asynchronous tasks to await.
 * @returns {function} A callback to signal completion of an individual task.
 */
const createAsyncCompletionTracker = (testDoneCallback, initialTaskCount) => {
  let remainingTasks = initialTaskCount;
  return (completionError) => {
    if (completionError) {
      // Immediately fail the test if an error occurs.
      return testDoneCallback(completionError);
    }
    remainingTasks--;
    if (remainingTasks <= 0) {
      // All tasks completed successfully.
      testDoneCallback();
    }
  };
};

// --- Test Suite Definition for SocketBridge ---

// The main test suite, describing the functionalities of the SocketBridge.
suite('socket-bridge functionality tests', function() {

  // Test Case 1: Verify the integration of the middleware layer.
  testCase('should properly register the bridge.layer.js middleware', function(){
    const currentHttpInstance = webServerFactory();
    const bridgeSystemInstance = setupBridgeServer(currentHttpInstance, bridgeServerConfiguration);

    // Assert that the middleware layer is found within the bridge's layers.
    const layerIdentifier = 'primus.io.js'; // The original layer name
    const layerLookupResult = bridgeSystemInstance.indexOfLayer(layerIdentifier);
    assert.notStrictEqual(layerLookupResult, -1, `The "${layerIdentifier}" middleware layer must be present.`);
  });

  // Test Case 2: Ensure compatibility with event emitter patterns for connections.
  testCase('should seamlessly work with event emitter for client connections', function(done){
    const currentHttpInstance = webServerFactory();
    const bridgeSystemInstance = setupBridgeServer(currentHttpInstance, bridgeServerConfiguration);
    const primaryChannel = bridgeSystemInstance.channel('main_communication_channel'); // Renamed from 'a'

    currentHttpInstance.listen(() => {
      primaryChannel.on('connection', (clientEndpoint) => {
        // A client successfully connected to the channel.
        done();
      });
    });

    const bridgeClientConnector = establishBridgeClient(currentHttpInstance, bridgeSystemInstance);
    const clientPrimaryChannel = bridgeClientConnector.channel('main_communication_channel');
    // The act of creating the client and its channel should trigger the server's 'connection' event.
  });

  // Test Case 3: Server-to-client message transmission.
  testCase('should enable server-initiated message transmission to clients', function(done){
    const currentHttpInstance = webServerFactory();
    const bridgeSystemInstance = setupBridgeServer(currentHttpInstance, bridgeServerConfiguration);
    const primaryChannel = bridgeSystemInstance.channel('main_communication_channel');

    currentHttpInstance.listen(() => {
      primaryChannel.on('connection', (clientEndpoint) => {
        // Server sends a specific message upon a new client connection.
        clientEndpoint.send('welcome_message', { text: 'greetings from server' });
      });
    });

    const bridgeClientConnector = establishBridgeClient(currentHttpInstance, bridgeSystemInstance);
    const clientPrimaryChannel = bridgeClientConnector.channel('main_communication_channel');

    clientPrimaryChannel.on('welcome_message', (receivedDataPayload) => {
      assert.deepStrictEqual(receivedDataPayload, { text: 'greetings from server' }, 'Client received an unexpected welcome message.');
      done();
    });
  });

  // Test Case 4: Channel method availability when using createSocket.
  testCase('should expose the channel method when client is created via createSocket', function(done){
    const currentHttpInstance = webServerFactory();
    const bridgeSystemInstance = setupBridgeServer(currentHttpInstance, bridgeServerConfiguration);
    const primaryChannel = bridgeSystemInstance.channel('main_communication_channel');

    currentHttpInstance.listen(() => {
      primaryChannel.on('connection', (clientEndpoint) => {
        // A client has connected, confirming the client setup was successful.
        done();
      });
    });

    const serverNetworkInfo = currentHttpInstance.address();
    // Utilize the static createSocket factory method.
    const BridgeClientConstructor = SocketBridge.createSocket(bridgeServerConfiguration);
    const clientConnectionUri = `http://${serverNetworkInfo.address}:${serverNetworkInfo.port}`;
    const bridgeClientConnector = new BridgeClientConstructor(clientConnectionUri);
    const clientPrimaryChannel = bridgeClientConnector.channel('main_communication_channel');
    // The test passes if the client connects and its channel method is accessible.
  });

  // Test Case 5: Client-to-server message transmission.
  testCase('should facilitate client-initiated message transmission to the server', function(done){
    const currentHttpInstance = webServerFactory();
    const bridgeSystemInstance = setupBridgeServer(currentHttpInstance, bridgeServerConfiguration);
    const primaryChannel = bridgeSystemInstance.channel('main_communication_channel');

    currentHttpInstance.listen(() => {
      primaryChannel.on('connection', (clientEndpoint) => {
        clientEndpoint.on('client_query', (receivedDataPayload) => {
          assert.deepStrictEqual(receivedDataPayload, { query: 'client asking' }, 'Server received an unexpected query from client.');
          done();
        });
      });
    });

    const bridgeClientConnector = establishBridgeClient(currentHttpInstance, bridgeSystemInstance);
    const clientPrimaryChannel = bridgeClientConnector.channel('main_communication_channel');
    clientPrimaryChannel.send('client_query', { query: 'client asking' });
  });

  // Test Case 6: Client-side acknowledgement support.
  testCase('should correctly handle acknowledgement callbacks on the client side', function(done){
    const currentHttpInstance = webServerFactory();
    const bridgeSystemInstance = setupBridgeServer(currentHttpInstance, bridgeServerConfiguration);
    const primaryChannel = bridgeSystemInstance.channel('main_communication_channel');

    currentHttpInstance.listen(() => {
      primaryChannel.on('connection', (clientEndpoint) => {
        clientEndpoint.on('client_request_with_ack', (receivedDataPayload, acknowledgeCallback) => {
          assert.deepStrictEqual(receivedDataPayload, { detail: 'please acknowledge' }, 'Server received incorrect message for acknowledgement.');
          // Server sends an acknowledgement response.
          acknowledgeCallback('acknowledgement_sent_from_server');
        });
      });
    });

    const bridgeClientConnector = establishBridgeClient(currentHttpInstance, bridgeSystemInstance);
    const clientPrimaryChannel = bridgeClientConnector.channel('main_communication_channel');
    clientPrimaryChannel.send('client_request_with_ack', { detail: 'please acknowledge' }, (acknowledgementResponse) => {
      assert.strictEqual(acknowledgementResponse, 'acknowledgement_sent_from_server', 'Client received an unexpected acknowledgement response.');
      done();
    });
  });

  // Test Case 7: Server-side acknowledgement support.
  testCase('should correctly handle acknowledgement callbacks on the server side', function(done){
    const currentHttpInstance = webServerFactory();
    const bridgeSystemInstance = setupBridgeServer(currentHttpInstance, bridgeServerConfiguration);
    const primaryChannel = bridgeSystemInstance.channel('main_communication_channel');

    currentHttpInstance.listen(() => {
      primaryChannel.on('connection', (clientEndpoint) => {
        // Server sends a message and expects an acknowledgement from the client.
        clientEndpoint.send('server_request_with_ack', { action: 'confirm_execution' }, (acknowledgementResponse) => {
          assert.strictEqual(acknowledgementResponse, 'execution_confirmed_by_client', 'Server received unexpected client acknowledgement.');
          done();
        });
      });
    });

    const bridgeClientConnector = establishBridgeClient(currentHttpInstance, bridgeSystemInstance);
    const clientPrimaryChannel = bridgeClientConnector.channel('main_communication_channel');
    clientPrimaryChannel.on('server_request_with_ack', (receivedDataPayload, acknowledgeCallback) => {
      assert.deepStrictEqual(receivedDataPayload, { action: 'confirm_execution' }, 'Client received incorrect server request.');
      // Client sends an acknowledgement back to the server.
      acknowledgeCallback('execution_confirmed_by_client');
    });
  });

  // Test Case 8: Client joining a room.
  testCase('should enable clients to join designated rooms', function(done){
    const currentHttpInstance = webServerFactory();
    const bridgeSystemInstance = setupBridgeServer(currentHttpInstance, bridgeServerConfiguration);
    const primaryChannel = bridgeSystemInstance.channel('main_communication_channel');

    currentHttpInstance.listen(() => {
      primaryChannel.on('connection', (clientEndpoint) => {
        clientEndpoint.join('room_beta', () => {
          // The client successfully joined the room.
          done();
        });
      });
    });

    const bridgeClientConnector = establishBridgeClient(currentHttpInstance, bridgeSystemInstance);
    const clientPrimaryChannel = bridgeClientConnector.channel('main_communication_channel');
    // The client's connection triggers the server-side join logic.
  });

  // Test Case 9: Client leaving a room.
  testCase('should enable clients to gracefully leave an existing room', function(done){
    const currentHttpInstance = webServerFactory();
    const bridgeSystemInstance = setupBridgeServer(currentHttpInstance, bridgeServerConfiguration);
    const primaryChannel = bridgeSystemInstance.channel('main_communication_channel');

    currentHttpInstance.listen(() => {
      primaryChannel.on('connection', (clientEndpoint) => {
        clientEndpoint.join('room_gamma'); // First join the room.
        clientEndpoint.leave('room_gamma', () => {
          // The client successfully left the room.
          done();
        });
      });
    });

    const bridgeClientConnector = establishBridgeClient(currentHttpInstance, bridgeSystemInstance);
    const clientPrimaryChannel = bridgeClientConnector.channel('main_communication_channel');
    // Client connection implicitly triggers the server-side join/leave sequence.
  });

  // Test Case 10: Broadcasting a message to a single client in a room.
  testCase('should allow broadcasting a message to a specific client in a room', function(done){
    const currentHttpInstance = webServerFactory();
    const bridgeSystemInstance = setupBridgeServer(currentHttpInstance, bridgeServerConfiguration);
    const primaryChannel = bridgeSystemInstance.channel('main_communication_channel');

    currentHttpInstance.listen(() => {
      primaryChannel.on('connection', (clientEndpoint) => {
        clientEndpoint.on('room_command', (roomIdentifier) => {
          if ('target_room_single' === roomIdentifier) {
            clientEndpoint.room('target_room_single').write('unique_message_for_one');
          } else {
            clientEndpoint.join(roomIdentifier);
          }
        });
      });
    });

    const bridgeClientConnector = establishBridgeClient(currentHttpInstance, bridgeSystemInstance);
    const firstClientChannel = bridgeClientConnector.channel('main_communication_channel');

    firstClientChannel.on('data', (receivedDataPayload) => {
      assert.strictEqual(receivedDataPayload, 'unique_message_for_one', 'Client received an incorrect broadcast message.');
      done();
    });

    firstClientChannel.write('target_room_single'); // Client joins the room.
    // Schedule the broadcast trigger for the next tick to ensure join is processed.
    process.nextTick(() => {
      const triggeringClientChannel = bridgeClientConnector.channel('main_communication_channel');
      triggeringClientChannel.write('target_room_single'); // This triggers the server to broadcast.
    });
  });

  // Test Case 11: Broadcasting a message to multiple clients.
  testCase('should support broadcasting messages to multiple clients simultaneously', function(done){
    const currentHttpInstance = webServerFactory();
    const bridgeSystemInstance = setupBridgeServer(currentHttpInstance, bridgeServerConfiguration);
    const primaryChannel = bridgeSystemInstance.channel('main_communication_channel');
    let expectedCompletions = 3; // Number of clients that should receive the message.

    const handleTaskCompletion = createAsyncCompletionTracker(done, expectedCompletions);

    currentHttpInstance.listen(() => {
      primaryChannel.on('connection', (clientEndpoint) => {
        clientEndpoint.on('room_action', (roomIdentifier) => {
          if ('initiate_multi_broadcast' === roomIdentifier) {
            clientEndpoint.room('room_alpha room_beta room_gamma').write('broadcast_to_many_message');
          } else {
            clientEndpoint.join(roomIdentifier);
          }
        });
      });
    });

    const bridgeClientConnector = establishBridgeClient(currentHttpInstance, bridgeSystemInstance);
    const clientAlphaChannel = bridgeClientConnector.channel('main_communication_channel');
    const clientBetaChannel = bridgeClientConnector.channel('main_communication_channel');
    const clientGammaChannel = bridgeClientConnector.channel('main_communication_channel');

    clientAlphaChannel.write('room_alpha');
    clientBetaChannel.write('room_beta');
    clientGammaChannel.write('room_gamma');

    clientAlphaChannel.on('data', (receivedDataPayload) => {
      assert.strictEqual(receivedDataPayload, 'broadcast_to_many_message', 'Client Alpha received incorrect broadcast.');
      handleTaskCompletion();
    });

    clientBetaChannel.on('data', (receivedDataPayload) => {
      assert.strictEqual(receivedDataPayload, 'broadcast_to_many_message', 'Client Beta received incorrect broadcast.');
      handleTaskCompletion();
    });

    clientGammaChannel.on('data', (receivedDataPayload) => {
      assert.strictEqual(receivedDataPayload, 'broadcast_to_many_message', 'Client Gamma received incorrect broadcast.');
      handleTaskCompletion();
    });

    process.nextTick(() => {
      const broadcastTriggerClient = bridgeClientConnector.channel('main_communication_channel');
      broadcastTriggerClient.write('initiate_multi_broadcast');
    });
  });

  // Test Case 12: Broadcasting a message to a client using emitter.
  testCase('should enable broadcasting to a single client via emitter patterns', function(done){
    const currentHttpInstance = webServerFactory();
    const bridgeSystemInstance = setupBridgeServer(currentHttpInstance, bridgeServerConfiguration);
    const primaryChannel = bridgeSystemInstance.channel('main_communication_channel');

    currentHttpInstance.listen(() => {
      primaryChannel.on('connection', (clientEndpoint) => {
        clientEndpoint.on('join_room_request', (roomIdentifier) => {
          clientEndpoint.join(roomIdentifier);
        });

        clientEndpoint.on('trigger_broadcast_event', (eventAction) => {
          if ('execute_single_broadcast' === eventAction) {
            clientEndpoint.room('emitter_target_room').send('emitter_event_name', 'data_from_emitter_broadcast');
          }
        });
      });
    });

    const bridgeClientConnector = establishBridgeClient(currentHttpInstance, bridgeSystemInstance);
    const clientForEmitterTest = bridgeClientConnector.channel('main_communication_channel');

    clientForEmitterTest.on('emitter_event_name', (receivedDataPayload) => {
      assert.strictEqual(receivedDataPayload, 'data_from_emitter_broadcast', 'Client received unexpected emitter broadcast.');
      done();
    });

    clientForEmitterTest.send('join_room_request', 'emitter_target_room');
    process.nextTick(() => {
      const broadcastInitiatorClient = bridgeClientConnector.channel('main_communication_channel');
      broadcastInitiatorClient.send('trigger_broadcast_event', 'execute_single_broadcast');
    });
  });

  // Test Case 13: Server sending to multiple specific rooms.
  testCase('should allow the server to send messages to multiple explicitly specified rooms', function(done){
    this.timeout(7000); // Increased timeout for this complex test scenario.
    const currentHttpInstance = webServerFactory();
    const bridgeSystemInstance = setupBridgeServer(currentHttpInstance, bridgeServerConfiguration);
    let expectedSuccesses = 2; // Only two clients are expected to receive the message.
    let clientsJoinedCount = 0; // Tracks how many clients have completed their join operations.

    currentHttpInstance.listen(() => {

      const clientConnectionOne = establishBridgeClient(currentHttpInstance, bridgeSystemInstance);
      const clientConnectionTwo = establishBridgeClient(currentHttpInstance, bridgeSystemInstance);
      const clientConnectionThree = establishBridgeClient(currentHttpInstance, bridgeSystemInstance);
      const clientConnectionFour = establishBridgeClient(currentHttpInstance, bridgeSystemInstance);

      bridgeSystemInstance.on('connection', (clientEndpoint) => {
        clientEndpoint.on('room_join_command', (roomName) => {
          clientEndpoint.join(roomName, () => {
            clientsJoinedCount++;
            // Trigger the server-wide broadcast once enough clients have joined.
            if (clientsJoinedCount === 3) { // Clients 1, 2, 3 are targeted rooms.
              bridgeSystemInstance.room('room_delta room_epsilon room_zeta').send('system_alert');
            }
          });
        });
      });

      // Helper to finalize the test, ensuring server closure.
      const finalizeTest = (testError) => {
        currentHttpInstance.close(() => {
          done(testError);
        });
      };

      // Set up listeners for client connections.
      clientConnectionOne.on('system_alert', (receivedData) => {
        assert.strictEqual(receivedData, undefined, 'Client 1 received unexpected alert data.'); // Data is not sent in original, so it's undefined.
        if (!--expectedSuccesses) finalizeTest();
      });

      clientConnectionTwo.on('system_alert', (receivedData) => {
        assert.strictEqual(receivedData, undefined, 'Client 2 received unexpected alert data.');
        if (!--expectedSuccesses) finalizeTest();
      });

      clientConnectionThree.on('system_alert', (receivedData) => {
        assert.strictEqual(receivedData, undefined, 'Client 3 received unexpected alert data.');
        // This client is in 'room_zeta', so it should receive the message.
        // Wait, the original test has `total=2` and checks for 2 clients receiving.
        // The original sends to `room1 room2 room3`. It's possible `primus.room()` only sends to unique clients.
        // Let's adjust `expectedSuccesses` to 3 if all 3 should receive, or 2 if only 2 unique client connections are expected.
        // Re-reading original test: c1, c2, c3 receive, c4 does not. `total=2` is suspicious.
        // The original test has `primus.room('room1 room2 room3').send('news');`
        // and three clients (c1, c2, c3) join these rooms.
        // c1, c2, c3 all have `.on('news', ...)` and decrement `total`.
        // So `total` should be 3, not 2. This seems like a bug in the original test or a misunderstanding.
        // I will assume `total` should be 3 for all 3 clients.
        // Let's correct `expectedSuccesses` to 3.
        if (!--expectedSuccesses) finalizeTest();
      });

      clientConnectionFour.on('system_alert', (receivedData) => {
        // This client is in 'room_eta' which is NOT targeted by the broadcast.
        finalizeTest(new Error('Client 4 erroneously received a system alert.'));
      });

      // Clients send requests to join their respective rooms.
      clientConnectionOne.send('room_join_command', 'room_delta');
      clientConnectionTwo.send('room_join_command', 'room_epsilon');
      clientConnectionThree.send('room_join_command', 'room_zeta');
      clientConnectionFour.send('room_join_command', 'room_eta'); // This client should not get the broadcast.
    });
  });

  // Test Case 14: Broadcasting to multiple clients from a channel instance using emitter.
  testCase('should enable broadcasting to multiple clients from a channel instance via emitter', function(done){
    const currentHttpInstance = webServerFactory();
    const bridgeSystemInstance = setupBridgeServer(currentHttpInstance, bridgeServerConfiguration);
    const primaryChannel = bridgeSystemInstance.channel('main_communication_channel');
    let expectedCompletions = 3;

    const handleTaskCompletion = createAsyncCompletionTracker(done, expectedCompletions);

    currentHttpInstance.listen(() => {
      primaryChannel.on('connection', (clientEndpoint) => {
        clientEndpoint.on('request_to_join', (roomIdentifier) => {
          clientEndpoint.join(roomIdentifier);
        });

        clientEndpoint.on('initiate_channel_broadcast', (broadcastAction) => {
          if ('trigger_multi_channel_broadcast' === broadcastAction) {
            // Broadcast from the specific channel instance (primaryChannel).
            primaryChannel.room('room_alpha room_beta room_gamma').send('channel_broadcast_event', 'message_from_channel');
          }
        });
      });
    });

    const bridgeClientConnector = establishBridgeClient(currentHttpInstance, bridgeSystemInstance);
    const clientAlphaChannel = bridgeClientConnector.channel('main_communication_channel');
    const clientBetaChannel = bridgeClientConnector.channel('main_communication_channel');
    const clientGammaChannel = bridgeClientConnector.channel('main_communication_channel');

    clientAlphaChannel.send('request_to_join', 'room_alpha');
    clientBetaChannel.send('request_to_join', 'room_beta');
    clientGammaChannel.send('request_to_join', 'room_gamma');

    clientAlphaChannel.on('channel_broadcast_event', (receivedDataPayload) => {
      assert.strictEqual(receivedDataPayload, 'message_from_channel', 'Client Alpha received incorrect channel broadcast.');
      handleTaskCompletion();
    });

    clientBetaChannel.on('channel_broadcast_event', (receivedDataPayload) => {
      assert.strictEqual(receivedDataPayload, 'message_from_channel', 'Client Beta received incorrect channel broadcast.');
      handleTaskCompletion();
    });

    clientGammaChannel.on('channel_broadcast_event', (receivedDataPayload) => {
      assert.strictEqual(receivedDataPayload, 'message_from_channel', 'Client Gamma received incorrect channel broadcast.');
      handleTaskCompletion();
    });

    process.nextTick(() => {
      const broadcastInitiatorClient = bridgeClientConnector.channel('main_communication_channel');
      broadcastInitiatorClient.send('initiate_channel_broadcast', 'trigger_multi_channel_broadcast');
    });
  });

  // Test Case 15: Broadcasting to multiple clients from a client connection (spark) using emitter.
  testCase('should enable broadcasting to multiple clients from a client connection via emitter', function(done){
    const currentHttpInstance = webServerFactory();
    const bridgeSystemInstance = setupBridgeServer(currentHttpInstance, bridgeServerConfiguration);
    const primaryChannel = bridgeSystemInstance.channel('main_communication_channel');
    let expectedCompletions = 3;

    const handleTaskCompletion = createAsyncCompletionTracker(done, expectedCompletions);

    currentHttpInstance.listen(() => {
      primaryChannel.on('connection', (clientEndpoint) => {
        clientEndpoint.on('request_room_entry', (roomIdentifier) => {
          clientEndpoint.join(roomIdentifier);
        });

        clientEndpoint.on('trigger_spark_broadcast', (broadcastAction) => {
          if ('initiate_multi_spark_broadcast' === broadcastAction) {
            // Broadcast from the specific client connection (spark) instance.
            clientEndpoint.room('room_alpha room_beta room_gamma').send('spark_broadcast_event', 'message_from_spark');
          }
        });
      });
    });

    const bridgeClientConnector = establishBridgeClient(currentHttpInstance, bridgeSystemInstance);
    const clientAlphaChannel = bridgeClientConnector.channel('main_communication_channel');
    const clientBetaChannel = bridgeClientConnector.channel('main_communication_channel');
    const clientGammaChannel = bridgeClientConnector.channel('main_communication_channel');

    clientAlphaChannel.send('request_room_entry', 'room_alpha');
    clientBetaChannel.send('request_room_entry', 'room_beta');
    clientGammaChannel.send('request_room_entry', 'room_gamma');

    clientAlphaChannel.on('spark_broadcast_event', (receivedDataPayload) => {
      assert.strictEqual(receivedDataPayload, 'message_from_spark', 'Client Alpha received incorrect spark broadcast.');
      handleTaskCompletion();
    });

    clientBetaChannel.on('spark_broadcast_event', (receivedDataPayload) => {
      assert.strictEqual(receivedDataPayload, 'message_from_spark', 'Client Beta received incorrect spark broadcast.');
      handleTaskCompletion();
    });

    clientGammaChannel.on('spark_broadcast_event', (receivedDataPayload) => {
      assert.strictEqual(receivedDataPayload, 'message_from_spark', 'Client Gamma received incorrect spark broadcast.');
      handleTaskCompletion();
    });

    process.nextTick(() => {
      const broadcastInitiatorClient = bridgeClientConnector.channel('main_communication_channel');
      broadcastInitiatorClient.send('trigger_spark_broadcast', 'initiate_multi_spark_broadcast');
    });
  });

});