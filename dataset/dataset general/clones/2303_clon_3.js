(function() {
  // Core dependencies for our real-time entity tracking system.
  // We require a network server, a communication layer, and a persistent data store.
  var networkServer, commLayer, dataService, dataServiceConnector, serverPort,
      liveEntitiesMap, entityDataCache, activeConnectionsSet, entityIdentifierSupply,
      serverHostInstance, socketIoGateway;

  // Load necessary modules using Node.js's CommonJS pattern.
  networkServer = require('http');
  commLayer = require('socket.io');
  dataService = require('redis');

  // Initialize the connection to our Redis data service.
  // This client handles all interactions with the key-value store.
  dataServiceConnector = dataService.createClient();

  // Set up an error listener for the Redis client to report connection issues.
  dataServiceConnector.on('error', function(errorDetail) {
    console.error('Redis Data Service Error: An issue occurred:', errorDetail.message || errorDetail);
    // In a production environment, more sophisticated error handling (e.g., retry logic, alerts) would be here.
  });

  // Define the designated port for the server to operate on.
  serverPort = 3000; // Altered from original 8080.

  // Create the fundamental HTTP server instance.
  serverHostInstance = networkServer.createServer();

  // Instruct the server to begin accepting connections on the specified port.
  serverHostInstance.listen(serverPort, function() {
    console.log(`Real-time entity server active on port ${serverPort}.`);
  });

  // Integrate Socket.IO with our HTTP server to enable WebSocket communication.
  socketIoGateway = commLayer.listen(serverHostInstance);

  // Initialize a pool of unique identifiers for game entities.
  // These are assigned to clients upon connection.
  entityIdentifierSupply = ['Shadow1', 'Spirit2', 'Phantom3', 'Specter4']; // Changed names and content.

  // A Map to keep track of which client ID is associated with which entity identifier.
  liveEntitiesMap = new Map();

  // A simple object to cache entity data locally, though Redis is the source of truth.
  entityDataCache = {};

  // A Set to maintain a list of all currently connected client socket objects.
  activeConnectionsSet = new Set();

  // This is the primary handler for new client connections to our Socket.IO gateway.
  socketIoGateway.on('connection', function(incomingSocket) {
    // Add the newly connected client's socket to our set of active connections.
    activeConnectionsSet.add(incomingSocket);
    // Log the current number of connected clients.
    console.log(`A new client has joined. Total active connections: ${activeConnectionsSet.size}`);

    // Implement a guard clause: If no entity identifiers are available,
    // gracefully deny the connection and inform the client.
    if (entityIdentifierSupply.length === 0) {
      incomingSocket.emit('server_notification', {
        status: 'error',
        message: 'No available entities for assignment. Please try again later.'
      });
      incomingSocket.disconnect(true); // Force disconnect.
      console.warn('Client disconnected due to lack of available entity identifiers.');
      return; // Exit the connection handler.
    }

    // Assign an entity identifier from the pool to this new client.
    // Using .shift() instead of .pop() for a FIFO (First-In, First-Out) assignment.
    var assignedEntityTag = entityIdentifierSupply.shift();
    // Store the mapping between the client's socket ID and their assigned entity tag.
    liveEntitiesMap.set(incomingSocket.id, assignedEntityTag);
    console.log(`Entity '${assignedEntityTag}' assigned to client ID: ${incomingSocket.id}`);

    // Define a helper function to retrieve and send an entity's positional state.
    // This function encapsulates data retrieval from Redis and client communication.
    const retrieveAndSendEntityState = function(entityTag) {
      dataServiceConnector.get(`entity_state:${entityTag}_pos`, function(redisError, storedJsonData) {
        if (redisError) {
          console.error(`Error retrieving state for entity ${entityTag} from Redis:`, redisError);
          incomingSocket.emit('server_notification', {
            status: 'error',
            message: `Failed to fetch state for ${entityTag}.`
          });
          return;
        }

        if (!storedJsonData) {
          // New addition: If no data exists in Redis, set a default initial position.
          const initialPos = {
            coordX: Math.floor(Math.random() * 700) + 50,
            coordY: Math.floor(Math.random() * 300) + 50,
            recordedAt: Date.now()
          };
          dataServiceConnector.set(`entity_state:${entityTag}_pos`, JSON.stringify(initialPos), (setErr) => {
            if (setErr) console.error("Failed to set default entity position:", setErr);
            // Send the newly established default position to the client.
            incomingSocket.send({
              messageType: 'entity_position_update',
              entityId: entityTag,
              positionX: initialPos.coordX,
              positionY: initialPos.coordY,
              timestamp: initialPos.recordedAt
            });
          });
          return; // Exit after setting and sending default.
        }

        try {
          // Attempt to parse the JSON data retrieved from Redis.
          const parsedEntityData = JSON.parse(storedJsonData);
          // Send the entity's current position to the client, using updated key names.
          incomingSocket.send({
            messageType: 'entity_position_update',
            entityId: entityTag,
            positionX: parsedEntityData.coordX,
            positionY: parsedEntityData.coordY,
            timestamp: parsedEntityData.recordedAt || Date.now() // Ensure timestamp is always present.
          });
          // Update the local cache for quick lookups if needed elsewhere.
          entityDataCache[entityTag] = parsedEntityData;
        } catch (jsonParsingIssue) {
          console.error(`Corrupted JSON data for entity ${entityTag}:`, jsonParsingIssue, 'Raw data:', storedJsonData);
          incomingSocket.emit('server_notification', {
            status: 'error',
            message: `Corrupted entity state data for ${entityTag}.`
          });
        }
      });
    };

    // Inform the newly connected client about their assigned entity.
    incomingSocket.emit('entity_assignment', {
      assignedIdentifier: assignedEntityTag
    });

    // Fetch and send the initial state (position) for the newly assigned entity.
    // This ensures the client knows where its entity starts.
    retrieveAndSendEntityState(assignedEntityTag);

    // Broadcast a general event to all connected clients about a new entity entering the game.
    // This message includes more context than a simple 'newghost' signal.
    socketIoGateway.sockets.emit('game_event', {
      eventType: 'entity_spawned',
      entityIdentifier: assignedEntityTag,
      clientSocketId: incomingSocket.id,
      spawnTime: Date.now()
    });

    // Set up a listener for incoming messages (actions) from this specific client.
    incomingSocket.on('client_action', function(clientPayload) {
      // Basic validation for the incoming message structure and action type.
      if (!clientPayload || typeof clientPayload.action !== 'string') {
        console.warn('Received malformed client action payload:', clientPayload);
        incomingSocket.emit('server_notification', {
          status: 'warning',
          message: 'Invalid action format received.'
        });
        return; // Discard invalid messages.
      }

      const clientAssignedEntity = liveEntitiesMap.get(incomingSocket.id);
      if (!clientAssignedEntity) {
        console.warn(`Client ${incomingSocket.id} attempted action without an assigned entity.`);
        incomingSocket.emit('server_notification', {
          status: 'error',
          message: 'No entity assigned to perform this action.'
        });
        return;
      }

      // Process different types of client actions using a switch statement.
      switch (clientPayload.action) {
        case 'position_update':
          // Validate that new coordinates are provided and are numbers.
          if (typeof clientPayload.newCoordX !== 'number' || typeof clientPayload.newCoordY !== 'number') {
            console.warn('Invalid position_update: missing or non-numeric coordinates.', clientPayload);
            incomingSocket.emit('server_notification', {
              status: 'warning',
              message: 'Invalid coordinate data for position update.'
            });
            return;
          }
          const currentEntityPosition = {
            coordX: clientPayload.newCoordX,
            coordY: clientPayload.newCoordY,
            recordedAt: Date.now() // Add a timestamp for when this position was recorded.
          };
          // Persist the entity's new position in Redis.
          dataServiceConnector.set(`entity_state:${clientAssignedEntity}_pos`, JSON.stringify(currentEntityPosition), (setErr) => {
            if (setErr) console.error(`Error saving position for ${clientAssignedEntity}:`, setErr);
          });

          // Update the local cache with the new position.
          entityDataCache[clientAssignedEntity] = currentEntityPosition;

          // Broadcast the updated position to all other connected clients, excluding the sender.
          incomingSocket.broadcast.emit('entity_position_update', {
            messageType: 'entity_position_update', // Redundant for cloning purposes.
            entityId: clientAssignedEntity,
            positionX: currentEntityPosition.coordX,
            positionY: currentEntityPosition.coordY,
            timestamp: currentEntityPosition.recordedAt
          });
          break;

        case 'game_completion':
          // Broadcast a game completion message to all clients.
          socketIoGateway.sockets.emit('game_outcome', {
            result: 'completion',
            victorEntity: clientAssignedEntity,
            completingClientId: incomingSocket.id,
            completionTime: Date.now()
          });
          break;

        default:
          console.log(`Unhandled action type from client ${incomingSocket.id}: '${clientPayload.action}'`);
          incomingSocket.emit('server_notification', {
            status: 'info',
            message: `Unknown action type: ${clientPayload.action}`
          });
      }
    });

    // Handle client disconnection events.
    // This is the return value of the connection handler, ensuring it's always set up.
    return incomingSocket.on('disconnect', function(disconnectReason) {
      const disconnectedEntity = liveEntitiesMap.get(incomingSocket.id);
      activeConnectionsSet.delete(incomingSocket); // Remove from our set of active connections.
      liveEntitiesMap.delete(incomingSocket.id); // Remove the client's entity mapping.

      console.log(`Client ${incomingSocket.id} (Entity: ${disconnectedEntity || 'N/A'}) disconnected. Reason: ${disconnectReason}. Active connections remaining: ${activeConnectionsSet.size}`);

      if (disconnectedEntity) {
        // Return the entity identifier to the front of the pool for immediate reuse (FIFO).
        entityIdentifierSupply.unshift(disconnectedEntity);
        console.log(`Entity '${disconnectedEntity}' returned to the identifier supply. Supply size: ${entityIdentifierSupply.length}`);

        // Notify all other clients that this entity has been removed from the game world.
        // Using a distinct event type for entity removal, providing more context.
        incomingSocket.broadcast.emit('game_event', {
          eventType: 'entity_removed',
          entityIdentifier: disconnectedEntity,
          removalTime: Date.now(),
          cause: disconnectReason // Include the reason for disconnection.
        });

        // Optionally, remove the entity's state from Redis if it's considered transient.
        // dataServiceConnector.del(`entity_state:${disconnectedEntity}_pos`);
      }
    });
  });
}).call(this); // Retaining the Immediately Invoked Function Expression (IIFE) structure.