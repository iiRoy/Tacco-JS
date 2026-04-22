// This file orchestrates the client-side logic for a distributed 2D role-playing game.
// It manages network communication, player state, and game engine integration.

// Global instances for network and game state management.
let networkConnection = null; // Represents the WebSocket connection to the game server.
let updateTimerId = null;     // Stores the ID for the periodic position update timer.
let localPlayerInstance = null; // Reference to the player-controlled character entity.

// A registry for all other (remote) player characters present in the game world.
// Keys are unique player identifiers, values are GameCharacter instances.
const remotePlayerRegistry = {};

// Assuming 'melon_engine' is the global object for the game engine,
// replacing 'me' from the original code.
// For the purpose of this clone, we'll prefix 'me' references with 'melon_engine'.

/**
 * Incorporates a new remote player's data into the game world.
 * This function creates a visual representation for the player and adds it to the scene.
 * @param {object} newPlayerData - Object containing details about the new player (id, x, y).
 */
const registerRemotePlayer = (newPlayerData) => {
    // Validate incoming data before processing
    if (!newPlayerData || typeof newPlayerData.identifier === 'undefined') {
        console.warn("Attempted to register remote player with invalid data:", newPlayerData);
        return;
    }

    // Define visual properties for the character sprite.
    const characterVisualConfig = {
        visualWidth: 64,  // Default sprite width.
        visualHeight: 64, // Default sprite height.
        assetGraphic: "player_male_base" // Asset name for the character's base sprite.
    };

    // Create a new character entity for the remote player.
    const newCharacterEntity = new GameCharacter(
        newPlayerData.posX,
        newPlayerData.posY,
        characterVisualConfig
    );

    // Assign a rendering depth to ensure proper layering.
    // A slightly higher Z-index makes sure players are above map tiles.
    newCharacterEntity.renderDepth = 3;

    // Store the new character in the global registry using their unique ID.
    remotePlayerRegistry[newPlayerData.identifier] = newCharacterEntity;

    // Add the character entity to the game's active world.
    melon_engine.gameWorld.addObject(newCharacterEntity);

    // Re-sort the game entities to ensure correct rendering order after adding.
    melon_engine.gameWorld.reorderEntities();
};

/**
 * Initializes the client-side game logic once the local player's entity is created.
 * This sets up network communication and event listeners for game updates.
 * @param {object} playerAvatar - The game entity representing the local player.
 */
const initializeGameClient = (playerAvatar) => {
    // Assign the created player entity to the global localPlayerInstance.
    localPlayerInstance = playerAvatar;

    // Establish a WebSocket connection to the game server, potentially on a specific namespace.
    // The '/game-namespace' is an arbitrary addition for Type III cloning.
    networkConnection = io.connect('/game-namespace');

    // --- Network Event Listeners ---

    // Listener for when the client successfully connects to the server.
    networkConnection.on('connectionEstablished', () => {
        console.log("Network connection established. Sending initial logon data.");
        // Emit a 'clientLogin' event with the local player's current position data.
        networkConnection.emit('clientLogin', localPlayerInstance.currentPosition);
    });

    // Listener for receiving the initial list of all active players from the server.
    networkConnection.on('allPlayersData', (playerList) => {
        console.info("Received initial player roster:", playerList);

        // Iterate through the received player list and register each remote player.
        playerList.forEach(playerItem => {
            if (playerItem.identifier !== localPlayerInstance.id) { // Ensure not to re-add self
                registerRemotePlayer(playerItem);
            }
        });

        // Helper function to periodically send the local player's position to the server.
        const transmitLocalPosition = () => {
            // Emit a 'playerMovement' event with the player's current position.
            networkConnection.emit('playerMovement', localPlayerInstance.currentPosition);
            // Schedule the next position update after a short delay (e.g., 250ms).
            updateTimerId = setTimeout(transmitLocalPosition, 250);
        };

        // Start the periodic position updates after the initial player data is processed.
        updateTimerId = setTimeout(transmitLocalPosition, 250);
        console.log("Started periodic position updates to the server.");
    });

    // Listener for when a remote player's position has changed.
    networkConnection.on('playerMoved', (remotePlayerUpdate) => {
        // console.debug(`Remote player ${remotePlayerUpdate.identifier} moved to ${remotePlayerUpdate.posX},${remotePlayerUpdate.posY}`);
        const targetCharacter = remotePlayerRegistry[remotePlayerUpdate.identifier];

        // Update the character's target destination if it exists in our registry.
        if (targetCharacter) {
            targetCharacter.targetX = remotePlayerUpdate.posX;
            targetCharacter.targetY = remotePlayerUpdate.posY;
        } else {
            // Log a warning if we receive an update for a character not in our registry.
            console.warn(`Received movement update for unknown player ID: ${remotePlayerUpdate.identifier}`);
            // Optionally, request full player data or ignore. For now, just warn.
        }
    });

    // Listener for when a new player connects to the game server.
    networkConnection.on('newPlayerConnected', (newlyConnectedPlayer) => {
        console.log("New player connected:", newlyConnectedPlayer);
        // Add the newly connected player to the game world.
        registerRemotePlayer(newlyConnectedPlayer);
    });

    // Listener for when a player disconnects from the game server.
    networkConnection.on('playerDisconnected', (disconnectedPlayer) => {
        console.log("Player disconnected:", disconnectedPlayer);
        const departingCharacter = remotePlayerRegistry[disconnectedPlayer.identifier];

        // If the character exists, remove it from the game world and the registry.
        if (departingCharacter) {
            melon_engine.gameWorld.removeObject(departingCharacter);
            delete remotePlayerRegistry[disconnectedPlayer.identifier];
            console.info(`Removed character for disconnected player: ${disconnectedPlayer.identifier}`);
        } else {
            console.warn(`Attempted to remove unknown character for disconnected player ID: ${disconnectedPlayer.identifier}`);
        }
    });
};


// --- Game Asset Manifest ---
// Defines all resources that need to be preloaded by the game engine.
const gameAssetManifest = [
    { name: "player_male_base", type: "image", src: "assets/sprites/player_male_base.png" },
    { name: "arid_wasteland_tiles", type: "image", src: "assets/maps/tilesets/desert_tiles.png" }, // Renamed desert1
    { name: "arid_wasteland", type: "tmx", src: "assets/maps/desert.tmx" }, // Renamed desert
    { name: "fog_overlay", type: "image", src: "assets/effects/fog_of_war.png" }, // Renamed fog
    { name: "item_icon_set", type: "image", src: "assets/ui/item_icons.png" } // Added a new dummy entry
];

// --- Game Application Core ---
// The main entry point and controller for the game client.
const gameClientCore = {

    /**
     * Initializes the game application. This is called when the DOM is ready.
     * Sets up video, audio, and resource loading.
     */
    initializeApplication: function() {
        // Attempt to initialize the video renderer with custom dimensions and scaling.
        // 'gameCanvasElement' is an arbitrary new ID for the canvas.
        if (!melon_engine.videoManager.setupRenderer('gameCanvasElement', 720, 480, true, 1.25))
        {
            console.error("Browser lacks HTML5 canvas support. Game cannot start.");
            // Optionally, display a more user-friendly message on the page.
            document.body.innerHTML = '<h1>Your browser does not support HTML5 Canvas. Please update or use a different browser.</h1>';
            return;
        }

        // Initialize the audio playback system, supporting multiple formats.
        melon_engine.audioManager.initAudioPlayback(["webm", "ogg", "mp3"]);

        // Set the callback function to execute once all game assets are loaded.
        melon_engine.resourceLoader.onAllAssetsLoaded = () => this.assetsReady();

        // Start preloading all defined game assets.
        melon_engine.resourceLoader.loadAssets(gameAssetManifest);

        // Transition the game state to the loading screen while assets are fetched.
        melon_engine.gameStateManager.transitionToState(melon_engine.gameStateManager.LOADING_SCREEN);
    },

    /**
     * Callback function executed once all game resources have been successfully loaded.
     * Configures game states, registers entities, and sets up input handling.
     */
    assetsReady: function() {
        // Define the "Gameplay Active" screen object.
        melon_engine.gameStateManager.defineState(melon_engine.gameStateManager.GAMEPLAY_ACTIVE, new GameplayScene());

        // Register the main player entity type into the engine's entity pool.
        melon_engine.entityRegistry.registerEntity("primaryPlayerAvatar", MainPlayerCharacter);

        // Bind keyboard keys to specific in-game actions.
        melon_engine.inputHandler.mapKeyToInput(melon_engine.inputHandler.KEYBOARD_CODES.ARROW_LEFT,  "moveLeft");
        melon_engine.inputHandler.mapKeyToInput(melon_engine.inputHandler.KEYBOARD_CODES.ARROW_RIGHT, "moveRight");
        melon_engine.inputHandler.mapKeyToInput(melon_engine.inputHandler.KEYBOARD_CODES.ARROW_UP,    "moveUp");
        melon_engine.inputHandler.mapKeyToInput(melon_engine.inputHandler.KEYBOARD_CODES.ARROW_DOWN,  "moveDown");
        // Added an extra key binding for Type III
        melon_engine.inputHandler.mapKeyToInput(melon_engine.inputHandler.KEYBOARD_CODES.SPACEBAR, "interact");


        // Start the game by transitioning to the main gameplay state.
        melon_engine.gameStateManager.transitionToState(melon_engine.gameStateManager.GAMEPLAY_ACTIVE);
    }
};

// --- Game Scene Definitions ---

/**
 * Represents the main gameplay scene, extending the engine's base screen object.
 */
const GameplayScene = melon_engine.ScreenBase.extend({

    /**
     * Executed when this scene becomes active. Used to load the game level.
     */
    onSceneEnter: function() {
        // Load the main game level (map).
        melon_engine.levelManager.loadMap("arid_wasteland");
        console.log("GameplayScene entered. Map 'arid_wasteland' loaded.");
    },

    /**
     * Executed when this scene is exited. Currently empty, but could be used for cleanup.
     */
    onSceneExit: function() {
        // Perform any scene-specific cleanup here.
        console.log("GameplayScene exited.");
    }

});

/**
 * Base class for all character entities in the game, both local and remote.
 * Handles movement, animation, and basic physics.
 */
const GameCharacter = melon_engine.EntityBase.extend({
    /**
     * Constructor for a GameCharacter instance.
     * @param {number} initialX - The starting X coordinate.
     * @param {number} initialY - The starting Y coordinate.
     * @param {object} entityConfig - Configuration object for the entity (e.g., sprite settings).
     */
    constructor: function(initialX, initialY, entityConfig) {
        // Call the parent (melon_engine.EntityBase) constructor.
        super(initialX, initialY, entityConfig);

        // Set character movement speed (pixels per frame).
        this.setMovementSpeed(2.8, 2.8); // Slightly different values

        // Apply friction to slow down movement when no input is given.
        this.applyFriction(0.15, 0.15); // Slightly different values

        // Adjust the character's collision bounding box.
        // Using a Rectangle object for more explicit definition.
        this.adjustCollisionBounds(new melon_engine.Rectangle(18, 22, 48, 18)); // Altered dimensions

        // Disable gravity for a top-down 2D game.
        this.disableGravity = true;

        // Internal state variables for character behavior.
        this.initialUpdateCycles = 3; // Counter for initial updates (Type III addition)
        this.facingDirection = 'south'; // The direction the character is currently facing.
        this.targetX = initialX; // The X coordinate the character is trying to reach.
        this.targetY = initialY; // The Y coordinate the character is trying to reach.

        // Define character animations. Renamed animation states.
        this.addAnimation("idle-south", [0]);
        this.addAnimation("idle-west", [7]);
        this.addAnimation("idle-north", [14]);
        this.addAnimation("idle-east", [21]);
        this.addAnimation("walk-south", [1,2,3,4,5,6]);
        this.addAnimation("walk-west", [8,9,10,11,12,13]);
        this.addAnimation("walk-north", [15,16,17,18,19,20]);
        this.addAnimation("walk-east", [22,23,24,25,26,27]);
    },

    /**
     * Called every game frame to update the character's state and position.
     * @returns {boolean} True if the entity's state was updated and needs redrawing.
     */
    onUpdate: function() {
        // Track if the character was moving in the previous frame.
        let wasMoving = (this.velocity.y !== 0 || this.velocity.x !== 0);
        let currentMovementStateChanged = false; // Helper flag for Type III

        // Process movement input based on character type (local/remote).
        this.processMovementInput();

        // Apply physics updates and check if movement actually occurred.
        let movementApplied = this.updatePhysics(); // Renamed updateMovement to updatePhysics

        // If the character is not moving, set to an idle animation.
        if (this.velocity.y === 0 && this.velocity.x === 0)
        {
            this.setAnimationState('idle-' + this.facingDirection);
            // If it stopped moving, it's an update.
            if (wasMoving) {
                movementApplied = true;
                currentMovementStateChanged = true;
            }
        } else {
            // If it is moving, and wasn't before, it's also an update.
            if (!wasMoving) {
                movementApplied = true;
                currentMovementStateChanged = true;
            }
        }

        // Only call the parent update if something has changed (animation or position).
        if (movementApplied || currentMovementStateChanged)
        {
            super.onUpdate(); // Call the parent's update method.
        }

        // Decrement initial update cycles; useful for network synchronization.
        if (this.initialUpdateCycles > 0) {
            this.initialUpdateCycles--;
            movementApplied = true; // Force update for initial cycles
        }

        return movementApplied;
    },

    /**
     * Handles character movement based on target coordinates (for remote players)
     * or input (for local player - overridden in MainPlayerCharacter).
     */
    processMovementInput: function() {
        const movementThreshold = 12; // Increased threshold for Type III

        // Reset velocities to prevent perpetual motion if not moving towards target.
        this.velocity.x = 0;
        this.velocity.y = 0;

        // Check horizontal movement towards target X.
        if (this.targetX < this.position.x - movementThreshold)
        {
            this.velocity.x -= this.acceleration.x * melon_engine.timer.deltaTime;
            this.setAnimationState('walk-west');
            this.facingDirection = 'west';
        }
        else if (this.targetX > this.position.x + movementThreshold)
        {
            this.velocity.x += this.acceleration.x * melon_engine.timer.deltaTime;
            this.setAnimationState('walk-east');
            this.facingDirection = 'east';
        }

        // Check vertical movement towards target Y.
        // Note: Y-axis is inverted in screen coordinates (larger Y is 'down').
        if (this.targetY < this.position.y - movementThreshold)
        {
            this.velocity.y -= this.acceleration.y * melon_engine.timer.deltaTime;
            this.setAnimationState('walk-north');
            this.facingDirection = 'north';
        }
        else if (this.targetY > this.position.y + movementThreshold)
        {
            this.velocity.y += this.acceleration.y * melon_engine.timer.deltaTime;
            this.setAnimationState('walk-south');
            this.facingDirection = 'south';
        }
    }
});


/**
 * Represents the player-controlled character, inheriting from GameCharacter.
 * Overrides input handling to respond to local keyboard input.
 */
const MainPlayerCharacter = GameCharacter.extend({

    /**
     * Constructor for the MainPlayerCharacter.
     * @param {number} startX - The initial X position.
     * @param {number} startY - The initial Y position.
     * @param {object} configuration - Configuration object for the entity.
     */
    constructor: function(startX, startY, configuration) {
        // Call the parent (GameCharacter) constructor.
        super(startX, startY, configuration);

        // Configure the game viewport to follow this player's position.
        // Uses a specific viewport axis enum for clarity.
        melon_engine.gameView.cameraFollow(this.position, melon_engine.gameView.ViewportAxis.BOTH_AXES);

        // Initialize client-side network communication and other game elements.
        initializeGameClient(this);

        // Add a flag for UI interaction (Type III addition)
        this.canInteract = true;
    },

    /**
     * Overrides the base character's input processing to handle local keyboard input.
     */
    processMovementInput: function() {
        // Reset velocities at the start of each input cycle.
        this.velocity.x = 0;
        this.velocity.y = 0;

        let horizontalInput = false;
        let verticalInput = false;

        // Handle horizontal movement based on mapped actions.
        if (melon_engine.inputHandler.isActionPressed('moveLeft'))
        {
            this.velocity.x -= this.acceleration.x * melon_engine.timer.deltaTime;
            this.setAnimationState('run-west'); // Renamed animation for main player
            this.facingDirection = 'west';
            horizontalInput = true;
        }
        else if (melon_engine.inputHandler.isActionPressed('moveRight'))
        {
            this.velocity.x += this.acceleration.x * melon_engine.timer.deltaTime;
            this.setAnimationState('run-east');
            this.facingDirection = 'east';
            horizontalInput = true;
        }

        // Handle vertical movement.
        if (melon_engine.inputHandler.isActionPressed('moveUp'))
        {
            this.velocity.y -= this.acceleration.y * melon_engine.timer.deltaTime;
            this.setAnimationState('run-north');
            this.facingDirection = 'north';
            verticalInput = true;
        }
        else if (melon_engine.inputHandler.isActionPressed('moveDown'))
        {
            this.velocity.y += this.acceleration.y * melon_engine.timer.deltaTime;
            this.setAnimationState('run-south');
            this.facingDirection = 'south';
            verticalInput = true;
        }

        // If no directional input, ensure horizontal/vertical velocities are zeroed out
        // and set to idle animation.
        if (!horizontalInput && !verticalInput) {
            this.velocity.x = 0;
            this.velocity.y = 0;
            this.setAnimationState('idle-' + this.facingDirection);
        } else if (horizontalInput && verticalInput) {
            // Optional: Reduce diagonal speed if both axes are pressed.
            // For now, simple sum, but could use square root of 2 for normalization.
            // This is a small Type III addition.
            const diagonalSpeedFactor = 0.707; // 1 / sqrt(2)
            this.velocity.x *= diagonalSpeedFactor;
            this.velocity.y *= diagonalSpeedFactor;
        }

        // Handle interaction key (Type III addition)
        if (melon_engine.inputHandler.isActionPressed('interact') && this.canInteract) {
            console.log("Player attempted interaction!");
            // Implement interaction logic here (e.g., open chest, talk to NPC)
            this.canInteract = false; // Prevent spamming
            setTimeout(() => this.canInteract = true, 500); // Cooldown
        }
    }

});

// --- Application Bootstrap ---
// Ensures the game starts only after the entire DOM and all resources are loaded.
// Using a modern event listener instead of a proprietary `onReady` function.
window.addEventListener('load', () => gameClientCore.initializeApplication());