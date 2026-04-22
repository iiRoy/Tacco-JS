/*
 *  Mana World JavaScript Client
 *  Experimental web-based MMORPG client implementation.
 *  More info: http://manasource.org
 */

var networkConnection; // Represents the network socket for server communication.
var updateIntervalId; // Stores the ID for our recurring position update timer.
var mainCharacter; // Reference to the player-controlled entity.
var remoteEntities = {}; // Collection of other players/entities in the game world, indexed by their unique ID.

// Incorporates a new game entity into the client's view.
function incorporateEntity(newEntity)
{
    // Configure default visual settings for generic objects.
    me.ObjectSettings.visualWidth = 72;
    me.ObjectSettings.visualHeight = 72;
    me.ObjectSettings.graphicAsset = "avatar_male_default";

    // Create a new Character instance for the remote entity and add it to our collection.
    remoteEntities[newEntity.id] = new GameEntity(newEntity.posX, newEntity.posY, me.ObjectSettings);
    // Set the rendering layer (z-index) for this entity.
    remoteEntities[newEntity.id].layerDepth = 5;
    // Add the newly created entity to the game engine's active entities.
    me.game.add(remoteEntities[newEntity.id]);
    // Re-sort the game objects to ensure correct rendering order.
    me.game.sort();
}

// Handler executed once the local player's entity has been instantiated.
function mainEntityInitialized(playerAvatar) {
    mainCharacter = playerAvatar; // Assign the local player instance.
    networkConnection = io.connect(); // Establish a connection to the game server.

    // Event listener for successful server connection.
    networkConnection.on('connect', function() {
        // Send initial login data, including the player's starting coordinates.
        networkConnection.emit('client_login', mainCharacter.positionCoords);
    });

    // Event listener for receiving the list of all active players.
    networkConnection.on('active_players', function(onlinePlayers) {
        console.log("Currently connected entities: " + onlinePlayers); // Log the received player data.

        // Iterate through the list of online players and add each one to the game.
        onlinePlayers.forEach(incorporateEntity);

        // Nested function to periodically send the local player's position.
        function dispatchLocationUpdate() {
            networkConnection.emit('player_movement', mainCharacter.positionCoords); // Emit current position.
            updateIntervalId = setTimeout(dispatchLocationUpdate, 250); // Schedule next update.
        }

        // Initiate the periodic position updates after receiving initial player data.
        updateIntervalId = setTimeout(dispatchLocationUpdate, 250);
    });

    // Event listener for when another entity's position has changed.
    networkConnection.on('entity_moved', function(movedEntity) {
        //console.log("Entity repositioned: " + movedEntity.id + " " + movedEntity.posX + "," + movedEntity.posY);
        var targetCharacter = remoteEntities[movedEntity.id]; // Retrieve the corresponding game entity.
        if (targetCharacter) { // If the entity exists locally.
            targetCharacter.targetXCoord = movedEntity.posX; // Update its target X coordinate.
            targetCharacter.targetYCoord = movedEntity.posY; // Update its target Y coordinate.
        }
    });

    // Event listener for when a new entity connects to the server.
    networkConnection.on('new_connection', function(newlyConnectedEntity) {
        console.log("New entity joined: " + newlyConnectedEntity); // Log the new connection.
        incorporateEntity(newlyConnectedEntity); // Add the new entity to the game.
    });

    // Event listener for when an entity disconnects from the server.
    networkConnection.on('connection_lost', function(disconnectedEntity) {
        console.log("Entity departed: " + disconnectedEntity); // Log the disconnection.
        // TODO: Implement proper character removal from the game map.
        var exitingCharacter = remoteEntities[disconnectedEntity.id]; // Get the departing entity.
        me.game.remove(exitingCharacter); // Remove it from the game engine.
        delete remoteEntities[disconnectedEntity.id]; // Remove it from our local collection.
    });
}


var assetManifest = [
    { assetName: "background_image",    assetType: "image", assetPath: "assets/graphics/bg_desert.png" },
    { assetName: "level_map",           assetType: "tmx",   assetPath: "assets/maps/wasteland.tmx" },
    { assetName: "avatar_male_default", assetType: "image", assetPath: "assets/graphics/male_hero.png" },
    { assetName: "overlay_effect",      assetType: "image", assetPath: "assets/graphics/mist.png" }
];

var gameClient = {

    // Main initialization function for the application.
    initializeApplication: function() {
        // Initialize the video display.
        if (!me.video.init('gameCanvasContainer', 800, 480, false, 1.2))
        {
            alert("Error: Your web browser lacks HTML5 canvas support.");
            return; // Exit if canvas is not supported.
        }

        // Initialize the audio system.
        me.audio.init("audio/mpeg,audio/ogg");

        // Set the callback for when all resources are loaded.
        me.loader.onload = this.resourcesLoaded.bind(this);

        // Preload all defined game assets.
        me.loader.preload(assetManifest);

        // Transition to the loading screen state.
        me.state.change(me.state.LOADING);
    },

    // Callback function executed once all game assets have been loaded.
    resourcesLoaded: function() {
        // Define and set the main "Play" screen object.
        me.state.set(me.state.PLAY, new GameDisplay());

        // Add our local player entity to the entity pool for later instantiation.
        me.entityPool.add("primaryAvatar", LocalPlayer);

        // Bind keyboard keys to game actions.
        me.input.bindKey(me.input.KEY.LEFT,  "walk_left");
        me.input.bindKey(me.input.KEY.RIGHT, "walk_right");
        me.input.bindKey(me.input.KEY.UP,    "walk_up");
        me.input.bindKey(me.input.KEY.DOWN,  "walk_down");

        //me.debug.renderHitBox = true; // Debug setting for hitboxes.

        // Start the game by changing to the PLAY state.
        me.state.change(me.state.PLAY);
    }

};

/* The core in-game screen logic. */
var GameDisplay = me.ScreenObject.extend({

    // Method called when the screen state is reset or entered.
    onStateReset: function() {
        // Load the specified game level.
        me.levelDirector.loadLevel("wasteland");
    },

    // Method called when the screen state is exited or destroyed.
    onStateDestroy: function() {
        // Cleanup logic can go here.
    }

});

// Base class for all interactive game entities.
var GameEntity = me.ObjectEntity.extend({
    // Constructor for a new game entity.
    setupObject: function(initialX, initialY, objectSettings) {
        // Call the parent class's constructor.
        this.parent(initialX, initialY, objectSettings);

        // Set the entity's movement speed.
        this.setVelocity(3.0, 3.0);

        // Apply friction to slow down movement.
        this.setFriction(0.3, 0.3);

        // Adjust the entity's collision bounding box.
        this.updateColRect(25, 30, 50, 20);

        // Disable gravitational effects for this entity.
        this.gravity = 0;

        this.initialRefreshCount = 3; // Counter for initial updates (purpose unclear, but cloned).
        this.facingOrientation = 'south'; // Initial direction the entity is facing.
        this.targetXCoord = initialX; // Desired X position for movement.
        this.targetYCoord = initialY; // Desired Y position for movement.

        // Define various animation states for the entity.
        this.addAnimation("idle-south", [0]);
        this.addAnimation("idle-west", [7]);
        this.addAnimation("idle-north", [14]);
        this.addAnimation("idle-east", [21]);
        this.addAnimation("walk-south", [1,2,3,4,5,6]);
        this.addAnimation("walk-west", [8,9,10,11,12,13]);
        this.addAnimation("walk-north", [15,16,17,18,19,20]);
        this.addAnimation("walk-east", [22,23,24,25,26,27]);
    },

    // Called every game frame to update the entity's state.
    refreshState: function() {
        wasMoving = this.vel.y !== 0 || this.vel.x !== 0; // Check if the entity was previously in motion.

        this.processControls(); // Handle input or destination-based movement.

        // Update the entity's physical movement.
        stateChanged = this.updateMovement();

        if (this.vel.y === 0 && this.vel.x === 0) // If the entity has stopped moving.
        {
            this.setCurrentAnimation('idle-' + this.facingOrientation); // Set idle animation based on direction.
            if (wasMoving) { // If it just stopped.
                stateChanged = true; // Mark as updated to refresh animation.
            }
        }

        // Only update animation if the entity's state changed.
        if (stateChanged)
        {
            this.parent(this); // Call parent's update method for animation.
        }
        return stateChanged; // Return whether the state was updated.
    },

    // Handles movement based on destination coordinates.
    processControls: function() {
        if (this.targetXCoord < this.pos.x - 15) // If target X is significantly to the left.
        {
            this.vel.x -= this.accel.x * me.timer.tick; // Accelerate left.
            this.setCurrentAnimation('walk-west'); // Set walking left animation.
            this.facingOrientation = 'west'; // Update facing direction.
        }
        else if (this.targetXCoord > this.pos.x + 15) // If target X is significantly to the right.
        {
            this.vel.x += this.accel.x * me.timer.tick; // Accelerate right.
            this.setCurrentAnimation('walk-east'); // Set walking right animation.
            this.facingOrientation = 'east'; // Update facing direction.
        }

        if (this.targetYCoord < this.pos.y - 15) // If target Y is significantly upwards.
        {
            this.vel.y = -this.accel.y * me.timer.tick; // Accelerate up.
            this.setCurrentAnimation('walk-north'); // Set walking up animation.
            this.facingOrientation = 'north'; // Update facing direction.
        }
        else if (this.targetYCoord > this.pos.y + 15) // If target Y is significantly downwards.
        {
            this.vel.y = this.accel.y * me.timer.tick; // Accelerate down.
            this.setCurrentAnimation('walk-south'); // Set walking down animation.
            this.facingOrientation = 'south'; // Update facing direction.
        }
    }
});


// Represents the locally controlled player character.
var LocalPlayer = GameEntity.extend({

    // Constructor for the local player entity.
    setupObject: function(initialX, initialY, objectSettings) {
        // Call the parent GameEntity constructor.
        this.parent(initialX, initialY, objectSettings);

        // Make the game viewport follow this player's position.
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);

        // Notify the system that the local player has been created.
        mainEntityInitialized(this);
    },

    // Overrides GameEntity's processControls to handle direct keyboard input.
    processControls: function() {
        if (me.input.isKeyPressed('walk_left')) // Check if left key is pressed.
        {
            this.vel.x -= this.accel.x * me.timer.tick; // Accelerate left.
            this.setCurrentAnimation('walk-west'); // Set walking left animation.
            this.facingOrientation = 'west'; // Update facing direction.
        }
        else if (me.input.isKeyPressed('walk_right')) // Check if right key is pressed.
        {
            this.vel.x += this.accel.x * me.timer.tick; // Accelerate right.
            this.setCurrentAnimation('walk-east'); // Set walking right animation.
            this.facingOrientation = 'east'; // Update facing direction.
        }

        if (me.input.isKeyPressed('walk_up')) // Check if up key is pressed.
        {
            this.vel.y = -this.accel.y * me.timer.tick; // Accelerate up.
            this.setCurrentAnimation('walk-north'); // Set walking up animation.
            this.facingOrientation = 'north'; // Update facing direction.
        }
        else if (me.input.isKeyPressed('walk_down')) // Check if down key is pressed.
        {
            this.vel.y = this.accel.y * me.timer.tick; // Accelerate down.
            this.setCurrentAnimation('walk-south'); // Set walking down animation.
            this.facingOrientation = 'south'; // Update facing direction.
        }
    }

});

// Event listener for when the entire window and DOM are ready.
window.onReady(function() {
    gameClient.initializeApplication(); // Start the game application.
});