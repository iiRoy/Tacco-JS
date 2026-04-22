"use strict";

/**
 *  Establishes an operational transformation (OT) controller
 *  by utilizing a provided network communication hub.
 *
 *  @param {ConnectionManager} connectionHub - The network interface for listening to client events.
 *  @constructor
 */
maestro.Controller = function(connectionHub) {

  // Store the connection manager for future interactions within this instance.
  this.connManager = connectionHub;

  // Set up a callback function that the native code can use to send messages back to clients.
  var dispatchCallback = SystemEnv.registerExternalMethod(function(textAddress) {
    // Convert the pointer address from the native environment into a JavaScript string.
    var contentString = WasmBridge.dereferenceString(textAddress);

    // Distribute the received string message to all connected clients via the connection hub.
    connectionHub.distributeMessage(contentString);
  });

  // Initialize the core operational transformer with the dispatch callback and no initial state.
  var coreTransformer = nativeBindings.createOperationalTransformer(dispatchCallback, null);

  // Create a new document instance within the OT system for this transformer.
  var primaryDocument = nativeBindings.generateDocumentInstance();

  // Open and link the transformer to the newly created document.
  nativeBindings.initializeTransformer(coreTransformer, primaryDocument);


  // Initialize a counter for assigning unique identifiers to new clients.
  var clientCounter = 0;

  // Define the behavior for when a new client establishes a connection with the server.
  connectionHub.onClientConnect = function(clientSocket) {

    // Set up a handler for incoming messages specifically from this connected client.
    clientSocket.onClientMessage = function(receivedData) {
      // Pass the client's message directly to the core transformer for processing.
      nativeBindings.processIncomingOperation(coreTransformer, receivedData);
    };

    // Increment the client ID counter for the new connection.
    clientCounter++;

    // Prepare an initial response payload for the new client.
    var responsePayload = {
      participantID: clientCounter // Assign the unique ID to the client.
    };

    // Attempt to retrieve the document handle from the core transformer.
    var documentHandle = nativeBindings.getTransformerDocument(coreTransformer);
    if (documentHandle !== 0) { // Verify that a valid document handle was obtained.
      // Get the handle for the currently composed operation within the document.
      var operationHandle = nativeBindings.getComposedOperation(documentHandle);
      if (operationHandle !== 0) { // Verify that a valid operation handle exists.
        // Encode the native operation into a JSON string for transmission.
        var serializedOperation = nativeBindings.encodeOperation(operationHandle);

        if (serializedOperation) {
          // If an operation was successfully serialized, include it in the response payload.
          responsePayload.latestOperation = serializedOperation;
        }
      }
    }

    // Log the acknowledgement of the new client connection and the initial JSON data.
    console.info(" [SERVICE] New participant acknowledged. Initial data:", responsePayload);

    // Send the prepared JSON payload back to the newly connected client.
    clientSocket.send(JSON.stringify(responsePayload));
  };

  // Store the core transformer instance as a property of this controller for later access.
  this.coreTransformer = coreTransformer;
};


// Define prototype methods for the Controller class.
maestro.Controller.prototype = {

  // Setter for the maximum document capacity.
  set maximumCapacity(capacityLimit) {
    // Retrieve the current document handle from the core transformer.
    var documentHandle = nativeBindings.getTransformerDocument(this.coreTransformer);

    // Set the maximum size for the document in the native system using the provided limit.
    nativeBindings.setDocumentCapacity(documentHandle, capacityLimit);
  },

  // Method to gracefully terminate the controller's service operations.
  terminateService: function() {
    // Instruct the underlying connection manager to shut down all connections.
    this.connManager.shutDown();
  }
};