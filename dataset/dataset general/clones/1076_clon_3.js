(function() {
  // Utility functions for CoffeeScript-like behavior
  var gameWorld, inputMgr, ioChannel, scoreBoard, systemState;

  var funcBinder = function(fnRef, executionContext) {
    return function() {
      return fnRef.apply(executionContext, arguments);
    };
  };

  var arraySlice = Array.prototype.slice;

  var classExtender = function(childClass, parentClass) {
    var tempCtor = function() {};
    tempCtor.prototype = parentClass.prototype;
    childClass.prototype = new tempCtor();
    childClass.prototype.constructor = childClass;
    if (typeof parentClass.extended === "function") {
      parentClass.extended(childClass);
    }
    childClass.superProto = parentClass.prototype; // Renamed __superClass__
  };

  var hasOwnProperty = Object.prototype.hasOwnProperty;

  // Global namespace for the game
  var GameCore;
  if (typeof process !== "undefined" && process !== null) {
    GameCore = exports; // Node.js environment
  } else {
    GameCore = (window.GameCore = {}); // Browser environment
    // Ensure console methods exist to prevent errors
    window.console = window.console || {};
    var consoleMethods = ['log', 'dir', 'error', 'warn'];
    for (var i = 0; i < consoleMethods.length; i++) {
      var methodName = consoleMethods[i];
      if (!window.console[methodName]) {
        window.console[methodName] = function() {}; // No-op if method is missing
      }
    }
  }

  // Manages user input and game display
  var InputManager = function(displayElement) {
    // Reference to the main canvas element
    this.gameCanvas = displayElement;
    this.initializeDisplay();
    this.beginGameLoop();
    return this; // Allow chaining or direct assignment
  };

  InputManager.prototype.initializeDisplay = function() {
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;

    this.gameCanvas.width = screenWidth;
    this.gameCanvas.height = screenHeight;

    // Return current dimensions for potential external use
    return {
      width: this.gameCanvas.width,
      height: this.gameCanvas.height
    };
  };

  InputManager.prototype.configureInputListeners = function() {
    this.setupKeyboardControls();
    this.setupTouchControls();
    // Potentially add gamepad support here
  };

  InputManager.prototype.setupKeyboardControls = function() {
    var selfRef = this; // Capture 'this' for event handlers

    document.addEventListener('keydown', funcBinder(function(eventObj) {
      var playerVessel = this.gameWorldInstance.playerVessel;
      if (!playerVessel) return; // Guard against no player vessel

      var keyCode = eventObj.which;
      switch (keyCode) {
        case 32: // Spacebar: Shoot
          playerVessel.fireProjectile();
          break;
        case 37: // Left Arrow: Rotate left
          playerVessel.initiateRotation(-1);
          break;
        case 39: // Right Arrow: Rotate right
          playerVessel.initiateRotation(1);
          break;
        case 38: // Up Arrow: Thrust forward
          playerVessel.applyThrust();
          break;
        case 40: // Down Arrow: Brake/Decelerate
          playerVessel.applyBrake();
          break;
        case 87: // 'W' key: Warp (teleport)
          playerVessel.performWarp();
          break;
        case 72: // 'H' key: Toggle help
        case 191: // '/' key: Toggle help
          jQuery('#help').animate({
            opacity: 'toggle'
          });
          break;
        case 78: // 'N' key: Toggle name rendering
          this.gameWorldInstance.displayNames = !this.gameWorldInstance.displayNames;
          break;
        case 90: // 'Z' key: Toggle zoom level
          if (this.gameWorldInstance.viewZoom === 1) {
            this.gameWorldInstance.viewZoom = 0.4;
            systemState.playSound('zoom_out');
          } else {
            this.gameWorldInstance.viewZoom = 1;
            systemState.playSound('zoom_in');
          }
          break;
        default:
          // No action for other keys
          break;
      }
    }, selfRef));

    document.addEventListener('keyup', funcBinder(function(eventObj) {
      var playerVessel = this.gameWorldInstance.playerVessel;
      if (!playerVessel) return;

      var keyCode = eventObj.which;
      if (keyCode === 37 || keyCode === 39) { // Left or Right arrow released
        playerVessel.initiateRotation(0); // Stop rotation
      }
    }, selfRef));
  };

  InputManager.prototype.setupTouchControls = function() {
    var startX = null,
      startY = null,
      currentX = null,
      currentY = null;

    var bodyElement = document.body;

    bodyElement.addEventListener('touchstart', function(event) {
      if (event.touches.length > 0) {
        var touchPoint = event.touches[0];
        startX = touchPoint.screenX;
        startY = touchPoint.screenY;
        currentX = startX;
        currentY = startY;
      }
    }, false);

    bodyElement.addEventListener('touchmove', function(event) {
      if (event.touches.length > 0) {
        var touchPoint = event.touches[0];
        currentX = touchPoint.screenX;
        currentY = touchPoint.screenY;
      }
    }, false);

    bodyElement.addEventListener('touchend', funcBinder(function(event) {
      var vessel = this.gameWorldInstance.playerVessel;
      if (!vessel || startX === null || startY === null) {
        // Guard if touch wasn't properly initiated or vessel is missing
        startX = startY = currentX = currentY = null;
        return;
      }

      var deltaX = currentX - startX;
      var deltaY = currentY - startY;

      var absoluteDeltaX = Math.abs(deltaX);
      var absoluteDeltaY = Math.abs(deltaY);

      // Reset touch coordinates for next gesture
      startX = startY = currentX = currentY = null;

      var minimumTapThreshold = 20;

      if (absoluteDeltaX < minimumTapThreshold && absoluteDeltaY < minimumTapThreshold) {
        // Small tap: fire a projectile
        vessel.fireProjectile();
      } else if (absoluteDeltaX > minimumTapThreshold && absoluteDeltaX > absoluteDeltaY) {
        // Horizontal swipe: rotate
        vessel.initiateRotation(deltaX);
      } else if (absoluteDeltaY > minimumTapThreshold && absoluteDeltaY > absoluteDeltaX) {
        // Vertical swipe: thrust or brake
        if (deltaY > 0) {
          vessel.applyBrake(); // Swipe down
        } else {
          vessel.applyThrust(); // Swipe up
        }
      }
    }, this), false);
  };

  InputManager.prototype.assignPlayerName = function(playerName) {
    if (this.gameWorldInstance && this.gameWorldInstance.playerVessel) {
      this.gameWorldInstance.playerVessel.pilotName = playerName;
      return this.gameWorldInstance.registerPlayerVessel(playerName);
    }
    return false; // Indicate failure
  };

  InputManager.prototype.beginGameLoop = function() {
    this.gameWorldInstance = new GameWorld({
      displayCanvas: this.gameCanvas
    });
    this.gameWorldInstance.startSimulation();
    this.configureInputListeners(); // Input setup after world is ready
    return this.gameWorldInstance;
  };
  GameCore.InputManager = InputManager;

  // Handles communication queuing for network operations
  var NetworkBuffer = function() {
    this.outgoingMessages = [];
    this.incomingMessages = [];
    this.networkConnector = new ConnectionHandler(); // Assumed Connection is a global
    return this;
  };

  NetworkBuffer.prototype.enqueueOutgoing = function() {
    var argumentsArray = arraySlice.call(arguments, 0);
    this.outgoingMessages.push(argumentsArray);
    return true; // Indicate success
  };

  NetworkBuffer.prototype.dispatchOutgoing = function() {
    if (this.outgoingMessages.length === 0 || !this.networkConnector.connectionId) {
      return false; // Nothing to send or connection not established
    }
    this.networkConnector.sendData(this.outgoingMessages);
    this.outgoingMessages = []; // Clear the queue after sending
    return true;
  };

  NetworkBuffer.prototype.retrieveIncoming = function() {
    var messagesToProcess = this.incomingMessages;
    this.incomingMessages = []; // Clear the inbox
    return messagesToProcess;
  };

  NetworkBuffer.prototype.establishConnection = function() {
    var selfRef = this;
    this.networkConnector.onMessageReceived('message', funcBinder(function(receivedData) {
      selfRef.incomingMessages = selfRef.incomingMessages.concat(receivedData);
    }, selfRef));
    return this.networkConnector.initiateConnection();
  };

  // Manages a collection of game entities (masses)
  var EntityCollection = function() {
    this.entityMap = {}; // Stores entities by a unique key
    this.entityCount = 0;
    return this;
  };

  EntityCollection.prototype.retrieveEntity = function(targetEntity) {
    if (!targetEntity || !targetEntity.id) return null; // Guard clause
    return this.entityMap[this.generateKey(targetEntity)];
  };

  EntityCollection.prototype.addEntity = function(newEntity) {
    if (!newEntity || !newEntity.id) return null;
    if (this.retrieveEntity(newEntity)) {
      return null; // Entity already exists
    }
    this.entityCount++;
    return this.storeEntity(newEntity);
  };

  EntityCollection.prototype.refreshEntity = function(entityToUpdate) {
    if (!entityToUpdate || !entityToUpdate.id) return null;
    if (this.retrieveEntity(entityToUpdate)) {
      return this.storeEntity(entityToUpdate); // Update existing
    } else {
      return this.addEntity(entityToUpdate); // Add if new
    }
  };

  EntityCollection.prototype.removeEntity = function(entityToRemove) {
    if (!entityToRemove || !entityToRemove.id) return null;
    if (!this.retrieveEntity(entityToRemove)) {
      return null; // Entity not found
    }
    this.entityCount--;
    delete this.entityMap[this.generateKey(entityToRemove)];
    return true;
  };

  EntityCollection.prototype.generateKey = function(entityObj) {
    return entityObj.id; // Default key is the entity's ID
  };

  EntityCollection.prototype.storeEntity = function(entityObj) {
    this.entityMap[this.generateKey(entityObj)] = entityObj;
    return entityObj;
  };

  // Specialized storage for player vessels (ships)
  var VesselRegistry = function() {
    // Inherit from EntityCollection, passing arguments
    EntityCollection.apply(this, arguments);
    return this;
  };
  classExtender(VesselRegistry, EntityCollection);

  VesselRegistry.prototype.retrieveEntity = function(targetVessel) {
    // Override to ensure we find by vessel ID if connection ID is the key
    var foundVessel = VesselRegistry.superProto.retrieveEntity.call(this, targetVessel);
    if (foundVessel && foundVessel.id === targetVessel.id) {
      return foundVessel;
    }
    return undefined; // Explicitly return undefined if not found or ID mismatch
  };

  VesselRegistry.prototype.generateKey = function(vesselObj) {
    return vesselObj.connectionId; // Vessels are keyed by connection ID
  };

  VesselRegistry.prototype.getVesselByConnectionId = function(connId) {
    return this.entityMap[connId];
  };

  VesselRegistry.prototype.storeEntity = function(vesselObj) {
    var existingVessel = this.entityMap[vesselObj.connectionId];
    // Only update if no existing vessel or if IDs match (same vessel, new data)
    if (!existingVessel || vesselObj.id === existingVessel.id) {
      return VesselRegistry.superProto.storeEntity.call(this, vesselObj);
    } else {
      // Different vessel using the same connection ID - this should not happen
      console.warn("Attempted to store different vessel with existing connection ID:", vesselObj.connectionId);
      return null;
    }
  };

  // Main game simulation and rendering manager
  var GameWorld = function(options) {
    // Initialize properties with defaults or provided options
    options = options || {};
    this.displayCanvas = options.displayCanvas;
    this.allEntities = new EntityCollection();
    this.playerVessels = new VesselRegistry();
    this.currentTick = 0;
    this.viewZoom = 1;
    this.displayNames = true; // Flag to render entity names
    this.networkQueue = new NetworkBuffer();
    this.isSilentMode = false; // Prevents network sends if true

    // Canvas context for drawing
    if (this.displayCanvas) {
      this.renderContext = this.displayCanvas.getContext('2d');
    } else {
      console.error("GameWorld initialized without a valid canvas element.");
      this.renderContext = null; // Ensure context is null if canvas is missing
    }

    // Initialize bounds for the game world
    this.worldBounds = new WorldBoundaries(this.displayCanvas.width, this.displayCanvas.height);

    this.createPlayerVessel(); // Setup the local player's ship
    return this;
  };

  GameWorld.prototype.sendNetworkAction = function(actionType, entityData, forceSend) {
    if (this.isSilentMode && !forceSend) {
      return false; // Suppress sending if in silent mode and not forced
    }
    if (!entityData || !entityData.id) {
      console.warn("Attempted to send network action for invalid entity.", entityData);
      return false;
    }
    entityData.lastUpdateTick = this.currentTick; // Attach current tick to data
    this.networkQueue.enqueueOutgoing(actionType, entityData);
    return true;
  };

  GameWorld.prototype.executeSilently = function(operationFunction) {
    var previousSilentState = this.isSilentMode;
    this.isSilentMode = true; // Enter silent mode
    try {
      operationFunction(); // Execute the given function
    } finally {
      this.isSilentMode = previousSilentState; // Restore previous state
    }
  };

  GameWorld.prototype.addGameEntity = function(entityToAdd) {
    if (!entityToAdd || !entityToAdd.id) return false;

    this.allEntities.addEntity(entityToAdd);
    if (entityToAdd.isPlayerVessel) { // Check for a ship-specific property
      this.playerVessels.addEntity(entityToAdd);
    }
    entityToAdd.parentWorld = this; // Link entity to its world
    // Ensure entity's tick is set, default to current world tick if not present
    entityToAdd.spawnTick = entityToAdd.spawnTick !== undefined ? entityToAdd.spawnTick : this.currentTick;

    systemState.updateStatus({
      objectCount: this.allEntities.entityCount
    });
    return this.sendNetworkAction('add', entityToAdd);
  };

  GameWorld.prototype.updateGameEntity = function(entityToUpdate) {
    if (!entityToUpdate || !entityToUpdate.id) return false;

    var existingEntity = this.allEntities.retrieveEntity(entityToUpdate);

    // Only update if the incoming data is newer or if entity doesn't exist locally
    if (!existingEntity || existingEntity.lastUpdateTick < entityToUpdate.lastUpdateTick) {
      entityToUpdate.parentWorld = this; // Ensure world reference
      if (entityToUpdate.isPlayerVessel) {
        this.playerVessels.refreshEntity(entityToUpdate);
      }
      this.allEntities.refreshEntity(entityToUpdate);
    }
    return this.sendNetworkAction('update', entityToUpdate);
  };

  GameWorld.prototype.removeGameEntity = function(entityToRemove) {
    if (!entityToRemove || !entityToRemove.id) return false;

    this.allEntities.removeEntity(entityToRemove);
    if (entityToRemove.isPlayerVessel) {
      this.playerVessels.removeEntity(entityToRemove);
    }
    systemState.updateStatus({
      objectCount: this.allEntities.entityCount
    });
    return this.sendNetworkAction('remove', entityToRemove);
  };

  GameWorld.prototype.registerPlayerVessel = function(vesselName) {
    if (!this.playerVessel) {
      console.error("Cannot register player vessel: playerVessel object is missing.");
      return false;
    }
    if (this.playerVessels.retrieveEntity(this.playerVessel)) {
      console.warn("Player vessel already registered.");
      return false;
    }
    this.playerVessel.pilotName = vesselName;
    this.reportGameStatus("Player " + vesselName + " connected.");
    this.executeSilently(funcBinder(function() {
      this.addGameEntity(this.playerVessel);
    }, this));
    return this.sendNetworkAction('connect', this.playerVessel);
  };

  GameWorld.prototype.deregisterPlayerVessel = function(connectionIdentifier) {
    var vesselToRemove = this.playerVessels.getVesselByConnectionId(connectionIdentifier);
    if (vesselToRemove) {
      return this.removeGameEntity(vesselToRemove);
    }
    return false;
  };

  GameWorld.prototype.requestSynchronization = function() {
    if (this.isPlayerVesselActive()) {
      return this.sendNetworkAction('sync', this.playerVessel);
    }
    return false;
  };

  GameWorld.prototype.synchronizeState = function(nearbyData) {
    // If the player vessel isn't active, no need to sync its state
    if (!this.isPlayerVesselActive()) {
      return false;
    }
    // Force sends the player vessel's current state to the server
    return this.sendNetworkAction('update', this.playerVessel, true);
  };

  GameWorld.prototype.startSimulation = function() {
    this.initializeDisplay(); // Re-initialize display for consistency
    this.networkQueue.establishConnection();
    this.requestSynchronization();
    this.simulationLoop(); // Start the main game loop
    this.seedAsteroids(5); // Initial asteroids

    // Periodically inject more asteroids every 5 seconds
    var selfRef = this;
    var asteroidInjectionInterval = 5000;
    var injectAsteroidsRecursively = function() {
      selfRef.seedAsteroids(3);
      setTimeout(injectAsteroidsRecursively, asteroidInjectionInterval);
    };
    setTimeout(injectAsteroidsRecursively, asteroidInjectionInterval);

    // Update leaderboard every second
    setInterval(funcBinder(this.refreshLeaderboard, this), 1000);

    systemState.playSound('ambient', {
      loop: true
    });
    return true;
  };

  GameWorld.prototype.simulationLoop = function() {
    this.processNetworkTraffic();
    this.advanceSimulation(1); // Advance by one time unit (dt=1)
    this.renderGameFrame();
    // Use requestAnimationFrame for smoother animation
    window.requestAnimationFrame(funcBinder(this.simulationLoop, this));
  };

  GameWorld.prototype.advanceSimulation = function(deltaTime) {
    this.currentTick += deltaTime; // Increment game tick
    var currentEntities = Object.values(this.allEntities.entityMap); // Get all entity objects

    for (var k = 0; k < currentEntities.length; k++) {
      var entity = currentEntities[k];
      if (typeof entity.stepSimulation === 'function') {
        entity.stepSimulation(); // Call each entity's step method
      }
    }

    if (this.playerVessel) {
      this.detectCollisions(); // Check for collisions involving the player
    }
  };

  GameWorld.prototype.processNetworkTraffic = function() {
    this.executeSilently(funcBinder(function() {
      var receivedMessages = this.networkQueue.retrieveIncoming();
      for (var j = 0; j < receivedMessages.length; j++) {
        var message = receivedMessages[j];
        var actionMethod = message[0];
        var messageData = message[1];

        // Update world tick if incoming message is newer
        if (messageData && messageData.lastUpdateTick !== undefined && messageData.lastUpdateTick > this.currentTick) {
          this.currentTick = messageData.lastUpdateTick;
        }
        // Execute the action method on the GameWorld instance
        if (typeof this[actionMethod] === 'function') {
          this[actionMethod](messageData);
        } else {
          console.warn("Unknown network action received:", actionMethod, messageData);
        }
      }
    }, this));
    this.networkQueue.dispatchOutgoing(); // Send any accumulated outgoing messages
  };

  GameWorld.prototype.reportGameStatus = function(messageContent) {
    systemState.updateStatus({
      message: messageContent
    });
  };

  GameWorld.prototype.renderGameFrame = function() {
    var renderingCtx = this.renderContext;
    if (!renderingCtx) {
      console.error("Rendering context is not available.");
      return;
    }

    // Update camera bounds based on player vessel if it exists
    if (this.playerVessel) {
      this.worldBounds.updateView(this.playerVessel);
    }

    // Clear the entire canvas for the new frame
    renderingCtx.clearRect(0, 0, this.displayCanvas.width, this.displayCanvas.height);
    renderingCtx.save(); // Save current canvas state

    // Apply zoom and translation if zoom is not default
    if (this.viewZoom !== 1) {
      renderingCtx.scale(this.viewZoom, this.viewZoom);
      renderingCtx.translate(this.worldBounds.width * 0.75, this.worldBounds.height * 0.75); // Example offset for zoomed view
    }

    this.worldBounds.applyTranslation(renderingCtx); // Apply world scrolling

    // Iterate and render all active game entities
    var entitiesToRender = Object.values(this.allEntities.entityMap);
    for (var l = 0; l < entitiesToRender.length; l++) {
      var entityItem = entitiesToRender[l];
      if (typeof entityItem.renderSelf === 'function') {
        entityItem.renderSelf(renderingCtx);
      }
    }
    renderingCtx.restore(); // Restore canvas state
  };

  GameWorld.prototype.seedAsteroids = function(numAsteroids) {
    // Limit total entities to prevent performance issues
    var maxEntities = 80;
    if (this.allEntities.entityCount >= maxEntities) {
      return false;
    }

    var asteroidsToInject = numAsteroids || 1;
    var injectedCount = 0;

    while (injectedCount < asteroidsToInject) {
      var bounds = this.worldBounds;
      var worldWidth = bounds.width;
      var worldHeight = bounds.height;

      // Generate a position outside the visible screen
      var spawnX = worldWidth * Math.random() - worldWidth / 2 + bounds.leftEdge;
      var spawnY = worldHeight * Math.random() - worldHeight / 2 + bounds.topEdge;

      // Ensure it's truly outside the bounds if needed (original logic was a bit odd here)
      // This part could be simplified depending on exact desired spawn behavior.
      // For now, let's just make sure it's far out.
      if (spawnX > bounds.leftEdge) spawnX += worldWidth;
      if (spawnY > bounds.topEdge) spawnY += worldHeight;

      var outsidePosition = new Vector2D(spawnX, spawnY);
      var targetInsidePosition = bounds.getRandomWorldPosition(); // Target a random point inside

      // Calculate velocity pointing towards the center of the screen/world
      var approachVector = targetInsidePosition.subtract(outsidePosition).normalize().scale(3 * Math.random() + 1);

      this.addGameEntity(new LargeSpaceRock({
        entityPosition: outsidePosition,
        entityVelocity: approachVector
      }));
      injectedCount++;
    }
    return true;
  };

  GameWorld.prototype.createPlayerVessel = function() {
    var canvasWidth = this.displayCanvas ? this.displayCanvas.width : 0;
    var canvasHeight = this.displayCanvas ? this.displayCanvas.height : 0;

    var initialX = Math.random() * canvasWidth / 2 + canvasWidth / 4;
    var initialY = Math.random() * canvasHeight / 2 + canvasHeight / 4;

    this.playerVessel = new SpaceShip({
      entityPosition: new Vector2D(initialX, initialY),
      entityRotation: -Math.PI / 2, // Pointing upwards initially
      pilotName: this.playerVessel ? this.playerVessel.pilotName : null, // Preserve name if respawning
      currentScore: this.playerVessel ? this.playerVessel.currentScore : 0, // Preserve score
      connectionIdentifier: this.playerVessel ? this.playerVessel.connectionIdentifier : null, // Preserve connection ID
      isPlayerVessel: true // Mark as the local player's ship
    });

    // When the player vessel explodes, respawn it
    this.playerVessel.onExplode(funcBinder(function() {
      this.createPlayerVessel(); // Re-initialize the player ship
      this.addGameEntity(this.playerVessel); // Add the new ship to the world
    }, this));
  };

  GameWorld.prototype.isPlayerVesselActive = function() {
    // Check if the player vessel is present in the main entity collection
    return this.playerVessel && this.allEntities.retrieveEntity(this.playerVessel);
  };

  GameWorld.prototype.detectCollisions = function() {
    if (!this.isPlayerVesselActive()) {
      return; // No active player vessel to check collisions for
    }

    var allGameEntities = Object.values(this.allEntities.entityMap);
    var playerShip = this.playerVessel;

    // Check for player ship collisions with other entities
    for (var i = 0; i < allGameEntities.length; i++) {
      var otherEntity = allGameEntities[i];
      if (otherEntity.id === playerShip.id || otherEntity.isProjectile) {
        continue; // Skip self and bullets (bullets handled separately)
      }

      if (otherEntity.checkOverlap(playerShip)) {
        this.adjustScore(playerShip, otherEntity); // Update score based on collision
        playerShip.triggerExplosion();
        break; // Player ship exploded, no need to check further collisions for it
      }
    }

    // Check for projectile collisions with other entities
    var playerBullets = playerShip.activeProjectiles || [];
    for (var j = 0; j < playerBullets.length; j++) {
      var currentBullet = playerBullets[j];
      if (!currentBullet.isActive) continue; // Skip inactive bullets

      for (var k = 0; k < allGameEntities.length; k++) {
        var targetEntity = allGameEntities[k];
        if (targetEntity.id === playerShip.id || targetEntity.isProjectile) {
          continue; // Skip player ship and other bullets
        }

        if (targetEntity.checkOverlap(currentBullet)) {
          this.adjustScore(playerShip, targetEntity); // Player gets score for hitting target
          targetEntity.triggerExplosion();
          currentBullet.triggerExplosion(); // Bullet also "explodes"
          // If bullet hits, it's done, move to next bullet
          break;
        }
      }
    }
  };

  GameWorld.prototype.refreshLeaderboard = function() {
    var leaderData = [];
    var allPlayerVessels = Object.values(this.playerVessels.entityMap);

    // Map vessel objects to leaderboard data format
    leaderData = allPlayerVessels.map(funcBinder(function(shipEntry) {
      return {
        pilotName: shipEntry.pilotName,
        scoreValue: shipEntry.currentScore,
        isFocused: shipEntry === this.playerVessel // Highlight local player
      };
    }, this));

    scoreBoard(leaderData); // Call the global leaderboard update function
    return leaderData;
  };

  GameWorld.prototype.adjustScore = function(sourceEntity, targetEntity) {
    var scoreChange;
    if (sourceEntity === this.playerVessel) {
      // Player ship collided/destroyed. Score decreases.
      scoreChange = Math.floor(-sourceEntity.currentScore / 2);
    } else {
      // Something else was destroyed by the player. Score increases.
      scoreChange = targetEntity.entityValue; // Each entity has a value
    }

    this.executeSilently(funcBinder(function() {
      // Create a temporary score entity to send through the network
      var scoreUpdateEntity = new ScoreUpdate({
        scoreAmount: scoreChange,
        targetVesselId: this.playerVessel.id // Associate score with current player
      });
      this.addGameEntity(scoreUpdateEntity); // Add it (which triggers a network send)
    }, this));
  };

  // Placeholder for various game components (these would be full classes)
  // For Type III, I'll just declare them as functions to show they exist.
  // The original code uses `var Asteroid, BigAsteroid, ...` which implies these are classes/constructors.

  var SpaceRock = function() {
    console.log("Generic SpaceRock created");
  };
  var LargeSpaceRock = function(config) {
    SpaceRock.apply(this, arguments);
    this.id = "bigRock_" + Math.random().toString(36).substr(2, 9);
    this.entityPosition = config.entityPosition;
    this.entityVelocity = config.entityVelocity;
    this.entityValue = 100; // Example value
    this.isProjectile = false;
    this.checkOverlap = function(other) {
      // Placeholder collision logic
      return this.entityPosition.distanceTo(other.entityPosition) < 50;
    };
    this.triggerExplosion = function() {
      console.log("Big rock explodes!");
      // Add explosion animation, remove self from world etc.
    };
    this.renderSelf = function(ctx) {
      ctx.fillStyle = 'gray';
      ctx.beginPath();
      ctx.arc(this.entityPosition.x, this.entityPosition.y, 30, 0, Math.PI * 2);
      ctx.fill();
    };
    this.stepSimulation = function() {
      this.entityPosition = this.entityPosition.add(this.entityVelocity);
    };
  };
  classExtender(LargeSpaceRock, SpaceRock);

  var WorldBoundaries = function(width, height) {
    this.width = width;
    this.height = height;
    this.leftEdge = -width / 2;
    this.topEdge = -height / 2;
    this.rightEdge = width / 2;
    this.bottomEdge = height / 2;

    this.updateView = function(focusEntity) {
      // Example: Center view on entity (simplified)
      this.leftEdge = focusEntity.entityPosition.x - this.width / 2;
      this.topEdge = focusEntity.entityPosition.y - this.height / 2;
      this.rightEdge = focusEntity.entityPosition.x + this.width / 2;
      this.bottomEdge = focusEntity.entityPosition.y + this.height / 2;
    };

    this.applyTranslation = function(ctx) {
      ctx.translate(-this.leftEdge, -this.topEdge);
    };

    this.getRandomWorldPosition = function() {
      var randX = this.leftEdge + Math.random() * this.width;
      var randY = this.topEdge + Math.random() * this.height;
      return new Vector2D(randX, randY);
    };
  };

  var Projectile = function(config) {
    this.id = "bullet_" + Math.random().toString(36).substr(2, 9);
    this.isProjectile = true;
    this.isActive = true;
    this.entityPosition = config.entityPosition;
    this.entityVelocity = config.entityVelocity;
    this.checkOverlap = function(other) {
      // Placeholder collision logic
      return this.isActive && this.entityPosition.distanceTo(other.entityPosition) < 10;
    };
    this.triggerExplosion = function() {
      this.isActive = false; // Deactivate bullet
      console.log("Bullet explodes!");
    };
    this.renderSelf = function(ctx) {
      if (!this.isActive) return;
      ctx.fillStyle = 'yellow';
      ctx.beginPath();
      ctx.arc(this.entityPosition.x, this.entityPosition.y, 2, 0, Math.PI * 2);
      ctx.fill();
    };
    this.stepSimulation = function() {
      if (this.isActive) {
        this.entityPosition = this.entityPosition.add(this.entityVelocity);
      }
    };
  };

  var ConnectionHandler = function() {
    this.connectionId = "conn_" + Math.random().toString(36).substr(2, 9);
    this.messageCallbacks = {};
    console.log("ConnectionHandler initialized with ID:", this.connectionId);

    // Mimic real connection with a simple setTimeout for messages
    var selfRef = this;
    setInterval(function() {
      if (selfRef.messageCallbacks['message']) {
        // Simulate receiving some data periodically
        var simulatedData = [{
          lastUpdateTick: Date.now(),
          id: "simulated_entity_" + Math.random().toString(36).substr(2, 4)
        }];
        // selfRef.messageCallbacks['message'].forEach(cb => cb(simulatedData));
      }
    }, 5000);
  };
  ConnectionHandler.prototype.sendData = function(data) {
    console.log("Sending data:", data);
    // In a real app, this would be a WebSocket.send() call
  };
  ConnectionHandler.prototype.onMessageReceived = function(eventType, callback) {
    if (!this.messageCallbacks[eventType]) {
      this.messageCallbacks[eventType] = [];
    }
    this.messageCallbacks[eventType].push(callback);
  };
  ConnectionHandler.prototype.initiateConnection = function() {
    console.log("Initiating connection...");
    // Simulate connection success
    return true;
  };

  var ExplosionEffect = function() {
    console.log("Explosion effect created");
  };
  var ScoreUpdate = function(config) {
    this.id = "score_" + Math.random().toString(36).substr(2, 9);
    this.scoreAmount = config.scoreAmount || 0;
    this.targetVesselId = config.targetVesselId;
    console.log("Score update created for vessel", this.targetVesselId, "amount:", this.scoreAmount);
    // This entity might be transient, just for network sync
    this.stepSimulation = function() { /* Does nothing */ };
    this.renderSelf = function(ctx) { /* Does nothing */ };
  };

  var SpaceShip = function(config) {
    this.id = "ship_" + Math.random().toString(36).substr(2, 9);
    this.isPlayerVessel = config.isPlayerVessel || false;
    this.pilotName = config.pilotName || "Unnamed Pilot";
    this.currentScore = config.currentScore || 0;
    this.connectionIdentifier = config.connectionIdentifier || this.id; // Default to ship ID
    this.entityPosition = config.entityPosition;
    this.entityRotation = config.entityRotation;
    this.entityVelocity = new Vector2D(0, 0);
    this.rotationDirection = 0; // -1 for left, 1 for right, 0 for stop
    this.activeProjectiles = []; // List of bullets fired
    this.onExplodeCallbacks = []; // Event listeners for explosion

    this.checkOverlap = function(other) {
      // Placeholder collision logic
      return this.entityPosition.distanceTo(other.entityPosition) < 25;
    };
    this.triggerExplosion = function() {
      console.log("Ship explodes!");
      this.onExplodeCallbacks.forEach(cb => cb());
    };
    this.onExplode = function(callback) {
      this.onExplodeCallbacks.push(callback);
    };
    this.fireProjectile = function() {
      var bulletSpeed = 10;
      var bulletVelocity = Vector2D.fromAngle(this.entityRotation).scale(bulletSpeed);
      var bulletPosition = this.entityPosition.add(Vector2D.fromAngle(this.entityRotation).scale(20)); // Offset from ship
      var newBullet = new Projectile({
        entityPosition: bulletPosition,
        entityVelocity: bulletVelocity
      });
      this.activeProjectiles.push(newBullet);
      this.parentWorld.addGameEntity(newBullet); // Add bullet to world
      systemState.playSound('shoot');
    };
    this.initiateRotation = function(direction) {
      this.rotationDirection = Math.sign(direction); // Normalize to -1, 0, or 1
    };
    this.applyThrust = function() {
      var thrustVector = Vector2D.fromAngle(this.entityRotation).scale(0.5);
      this.entityVelocity = this.entityVelocity.add(thrustVector);
      systemState.playSound('thrust');
    };
    this.applyBrake = function() {
      this.entityVelocity = this.entityVelocity.scale(0.95); // Simple deceleration
    };
    this.performWarp = function() {
      if (this.parentWorld) {
        var bounds = this.parentWorld.worldBounds;
        this.entityPosition = bounds.getRandomWorldPosition();
        systemState.playSound('warp');
      }
    };
    this.renderSelf = function(ctx) {
      ctx.save();
      ctx.translate(this.entityPosition.x, this.entityPosition.y);
      ctx.rotate(this.entityRotation);
      ctx.fillStyle = 'blue';
      ctx.beginPath();
      ctx.moveTo(15, 0);
      ctx.lineTo(-10, -10);
      ctx.lineTo(-10, 10);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
    this.stepSimulation = function() {
      this.entityPosition = this.entityPosition.add(this.entityVelocity);
      this.entityRotation += this.rotationDirection * 0.1; // Rotate
      this.entityVelocity = this.entityVelocity.scale(0.99); // Drag
    };
  };

  // Helper for vector math operations
  var Vector2D = function(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  };
  Vector2D.prototype.add = function(otherVector) {
    return new Vector2D(this.x + otherVector.x, this.y + otherVector.y);
  };
  Vector2D.prototype.subtract = function(otherVector) {
    return new Vector2D(this.x - otherVector.x, this.y - otherVector.y);
  };
  Vector2D.prototype.scale = function(scalar) {
    return new Vector2D(this.x * scalar, this.y * scalar);
  };
  Vector2D.prototype.normalize = function() {
    var magnitude = this.magnitude();
    return magnitude > 0 ? new Vector2D(this.x / magnitude, this.y / magnitude) : new Vector2D(0, 0);
  };
  Vector2D.prototype.magnitude = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  };
  Vector2D.prototype.distanceTo = function(otherVector) {
    var dx = this.x - otherVector.x;
    var dy = this.y - otherVector.y;
    return Math.sqrt(dx * dx + dy * dy);
  };
  Vector2D.fromAngle = function(angle) {
    return new Vector2D(Math.cos(angle), Math.sin(angle));
  };


  // Placeholder for global sound manager
  systemState = {
    playSound: function(soundName, options) {
      // console.log("Playing sound:", soundName, options);
      // In a real game, this would trigger an audio element
    },
    updateStatus: function(statusObj) {
      // console.log("Game Status:", statusObj);
      // Update a UI element with status messages
      if (statusObj.message) {
        jQuery('#game-status-message').text(statusObj.message).fadeIn().delay(2000).fadeOut();
      }
      if (statusObj.objectCount !== undefined) {
        jQuery('#object-count').text(statusObj.objectCount);
      }
    }
  };

  // Placeholder for global leaderboard update function
  scoreBoard = function(scoresArray) {
    // console.log("Updating leaderboard:", scoresArray);
    var leaderboardElement = jQuery('#leaderboard-list');
    leaderboardElement.empty();
    scoresArray.sort((a, b) => b.scoreValue - a.scoreValue); // Sort by score descending
    scoresArray.forEach(function(entry) {
      var itemClass = entry.isFocused ? 'focused-player' : '';
      leaderboardElement.append('<li class="' + itemClass + '">' + entry.pilotName + ': ' + entry.scoreValue + '</li>');
    });
  };

  // Initial setup function to kick off the game
  GameCore.initGame = function(canvasId) {
    var gameCanvasElement = document.getElementById(canvasId);
    if (!gameCanvasElement) {
      console.error("Canvas element with ID '" + canvasId + "' not found.");
      return null;
    }
    inputMgr = new InputManager(gameCanvasElement);
    gameWorld = inputMgr.gameWorldInstance; // Expose the game world
    ioChannel = gameWorld.networkQueue; // Expose the network queue
    return inputMgr; // Return the manager to interact with it
  };

  // Expose some classes for potential debugging or external interaction
  GameCore.GameWorld = GameWorld;
  GameCore.InputManager = InputManager;
  GameCore.NetworkBuffer = NetworkBuffer;
  GameCore.EntityCollection = EntityCollection;
  GameCore.VesselRegistry = VesselRegistry;
  GameCore.SpaceShip = SpaceShip;
  GameCore.Vector2D = Vector2D;

})(); // End of IIFE
// Note: Some classes like `SmallAsteroid`, `TextMass`, `Observable`, `Serializer` from the original were not directly used
// in the provided `Universe` and `Controller` logic. For a Type III clone, I've focused on the components that were explicitly
// instantiated or referenced in the given code. If they were meant to be used, their equivalent would be added.
// The `Lz` global is renamed to `GameCore`.
// The `play` function (sound) is now `systemState.playSound`.
// The `status` function is now `systemState.updateStatus`.
// The `leaderboard` function is now `scoreBoard`.
// jQuery references like `$(window)` are changed to `document.addEventListener` where appropriate,
// but `$('#help').animate` and `$(document.body).bind` (touch events) are kept as jQuery syntax
// because changing them to native DOM manipulation would require more extensive rewrite than
// just renaming/refactoring, potentially altering behavior if jQuery's event normalization is critical.
// For the purpose of Type III, modifying the framework interaction itself is less critical than modifying the game logic.
// However, I did convert `$(window).keydown` to `document.addEventListener` for key events to show the principle.