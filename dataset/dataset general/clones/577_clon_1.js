// This file contains the core logic for TMW.js, an experimental 2D MMORPG.
// It relies on the melonJS engine for game mechanics and Socket.IO for networking.
// For more details, visit: http://manasource.org/tmwjs
//
// This is a Type I clone, meaning only whitespace and comments have been altered.

var socket; // Global variable to hold the Socket.IO connection object.
var timeout; // Global variable for managing network update timeouts.
var player; // Reference to the local player entity in the game world.
var otherPlayers = { }; // An object to store references to other connected players by their ID.

/**
 * Adds a new player character to the game world.
 * This function is typically called when a new player connects or on initial player list reception.
 * @param {object} player - The player data object received from the server.
 */
function addPlayer( player )
{
  // Configure default sprite settings for the player character.
  me.ObjectSettings.spritewidth  = 64;
  me.ObjectSettings.spriteheight = 64;
  me.ObjectSettings.image        = "player_male_base"; // Default player sprite image.

  // Create a new Character instance for the player and store it.
  otherPlayers[player.id] = new Character( player.x, player.y, me.ObjectSettings );

  // Set the z-index for rendering order (e.g., to appear above map).
  otherPlayers[player.id].z = 3;

  // Add the newly created character to the game world.
  me.game.add( otherPlayers[player.id] );

  // Re-sort game objects based on their z-index to ensure correct rendering order.
  me.game.sort();
}


/**
 * Callback function executed once the local player entity has been created in the game.
 * This sets up the network connection and event listeners.
 * @param {object} playerEntity - The instance of the local player's Character entity.
 */
function localPlayerCreated( playerEntity )
{
  // Assign the local player entity to the global 'player' variable.
  player = playerEntity;

  // Establish a Socket.IO connection to the server.
  socket = io.connect();


  // --- Event Listeners for Socket.IO ---

  // 'connect' event: Fired when the client successfully connects to the server.
  socket.on( 'connect', function() {
    // Upon connection, emit a 'logon' event with the player's initial position.
    socket.emit( 'logon', player.pos );
  });

  // 'players' event: Fired when the server sends the initial list of connected players.
  socket.on( 'players', function( players ) {
    // Log the received player data to the console for debugging.
    console.log( "Players: " + players );

    // Iterate over the list of players and add each one to the game.
    players.forEach( addPlayer );

    /**
     * Internal helper function to send the local player's position to the server.
     * This function is called repeatedly at a set interval.
     */
    function sendPosition() {
      // Emit a 'move' event with the player's current position.
      socket.emit( 'move', player.pos );
      // Set a timeout to call this function again after 200 milliseconds.
      timeout = setTimeout( sendPosition, 200 );
    }

    // After receiving initial players and sending our logon,
    // we start sending our position updates to the server.
    timeout = setTimeout( sendPosition, 200 );
  });

  // 'moved' event: Fired when another player's position has updated on the server.
  socket.on( 'moved', function( player ) {
    // console.log("Moved: " + player.id + " " + player.x + "," + player.y); // Debugging line.
    // Retrieve the character instance corresponding to the moved player.
    var character = otherPlayers[player.id];

    // If the character exists in our local game state, update its destination.
    if ( character ) {
      character.destinationX = player.x;
      character.destinationY = player.y;
    }
  });

  // 'connected' event: Fired when a new player connects to the server.
  socket.on( 'connected', function( player ) {
    console.log( "Connected: " + player ); // Log the new player's data.
    addPlayer( player ); // Add the new player to our game world.
  });

  // 'disconnected' event: Fired when a player disconnects from the server.
  socket.on( 'disconnected', function( player ) {
    console.log( "Disconnected: " + player ); // Log the disconnected player's data.
    // TODO: Implement a more robust way to remove characters from the map.

    var character = otherPlayers[player.id]; // Get the character object to be removed.

    // Remove the character from the melonJS game world.
    me.game.remove( character );

    // Delete the character's entry from our 'otherPlayers' tracking object.
    delete otherPlayers[player.id];
  });
}


// --- Game Resources Definition ---
// This array defines all the assets (images, maps) that need to be loaded by the game.
var g_resources =
[
  { name: "desert1",          type: "image", src: "data/desert1.png"         }, // Background image for the desert map.
  { name: "desert",           type: "tmx",   src: "data/desert.tmx"          }, // Tiled map data for the desert level.
  { name: "player_male_base", type: "image", src: "data/player_male_base.png"}, // Sprite sheet for the male player character.
  { name: "fog",              type: "image", src: "data/fog.png"             }  // Image for fog effects or overlays.
];

// --- Main Game Application Object ---
// Contains initialization and asset loading logic.
var jsApp = {

  // Callback function executed when the HTML document is fully loaded.
  onload: function()
  {
    // Initialize the melonJS video engine.
    // 'jsapp' is the ID of the canvas element, 640x384 is the resolution,
    // false for auto-scaling, 1.0 for scaling ratio.
    if ( !me.video.init( 'jsapp', 640, 384, false, 1.0 ) )
    {
      // Display an alert if the browser does not support HTML5 Canvas.
      alert( "Sorry but your browser does not support html 5 canvas." );
      return;
    }

    // Initialize the melonJS audio engine.
    // Supports both MP3 and OGG formats.
    me.audio.init( "mp3,ogg" );

    // Set the callback function for when all resources are loaded.
    me.loader.onload = this.loaded.bind( this );

    // Preload all resources defined in g_resources.
    me.loader.preload( g_resources );

    // Change the game state to the LOADING screen while resources are being loaded.
    me.state.change( me.state.LOADING );
  },

  // Callback function executed once all game resources have been loaded.
  loaded: function()
  {
    // Set the "Play/Ingame" Screen Object as the active screen.
    me.state.set( me.state.PLAY, new PlayScreen() );

    // Add our player entity to the entity pool, making it available for creation.
    me.entityPool.add( "mainPlayer", PlayerEntity );

    // Bind keyboard keys to specific actions for player input.
    me.input.bindKey( me.input.KEY.LEFT,  "left"  );
    me.input.bindKey( me.input.KEY.RIGHT, "right" );
    me.input.bindKey( me.input.KEY.UP,    "up"    );
    me.input.bindKey( me.input.KEY.DOWN,  "down"  );

    // Uncomment the line below to enable hitbox rendering for debugging.
    //me.debug.renderHitBox = true;

    // Start the game by changing the state to PLAY.
    me.state.change( me.state.PLAY );
  }

};

// This section defines the in-game screen logic.
// PlayScreen is a custom melonJS ScreenObject.
var PlayScreen = me.ScreenObject.extend(
{
  /**
   * Called when this screen is set as the active game state.
   * Resets game elements and loads the level.
   */
  onResetEvent: function()
  {
    // Load the "desert" level from the TMX map data.
    me.levelDirector.loadLevel( "desert" );
  },

  /**
   * Called when this screen is no longer the active game state.
   * Cleans up resources if necessary.
   */
  onDestroyEvent: function()
  {
    // No specific cleanup needed for this simple screen.
  }

});

// --- Base Character Entity Definition ---
// This defines the common properties and behaviors for all characters in the game.
var Character = me.ObjectEntity.extend(
{
  /**
   * Constructor for the Character entity.
   * @param {number} x - Initial X coordinate.
   * @param {number} y - Initial Y coordinate.
   * @param {object} settings - Configuration settings for the entity.
   */
  init: function( x, y, settings )
  {
    // Call the parent constructor (me.ObjectEntity) to initialize basic properties.
    this.parent( x, y, settings );

    // Set the character's walking speed.
    this.setVelocity( 2.5, 2.5 );

    // Apply friction to slow down movement gradually.
    this.setFriction( 0.2, 0.2 );

    // Adjust the bounding box for collision detection.
    // (offset_x, offset_y, width, height)
    this.updateColRect( 20, 24, 44, 16 );

    // Disable gravity for a top-down 2D game.
    this.gravity = 0;

    // Custom properties for character state.
    this.firstUpdates   = 2; // Counter for initial updates (might be for interpolation setup).
    this.direction      = 'down'; // Current facing direction.
    this.destinationX   = x; // Target X coordinate for movement.
    this.destinationY   = y; // Target Y coordinate for movement.

    // Define sprite animations for standing in different directions.
    this.addAnimation( "stand-down",  [0] );
    this.addAnimation( "stand-left",  [7] );
    this.addAnimation( "stand-up",    [14] );
    this.addAnimation( "stand-right", [21] );

    // Define sprite animations for walking in different directions.
    this.addAnimation( "down",  [1, 2, 3, 4, 5, 6] );
    this.addAnimation( "left",  [8, 9, 10, 11, 12, 13] );
    this.addAnimation( "up",    [15, 16, 17, 18, 19, 20] );
    this.addAnimation( "right", [22, 23, 24, 25, 26, 27] );
  },

  /**
   * Updates the character's state each game tick.
   * @returns {boolean} True if the entity was updated, false otherwise.
   */
  update: function()
  {
    // Check if the character had any speed in the previous frame.
    hadSpeed = this.vel.y !== 0 || this.vel.x !== 0;

    // Process input (movement towards destination for other players).
    this.handleInput();

    // Update the character's movement based on velocity and friction.
    updated = this.updateMovement();

    // If the character is not moving, set the standing animation.
    if ( this.vel.y === 0 && this.vel.x === 0 )
    {
      this.setCurrentAnimation( 'stand-' + this.direction ); // Set appropriate standing pose.
      // If the character just stopped, mark as updated to ensure animation change.
      if ( hadSpeed ) {
        updated = true;
      }
    }

    // If any update occurred (movement or animation change), update the parent.
    if ( updated )
    {
      // Call the parent's update method to handle animation updates.
      this.parent( this );
    }
    return updated; // Return whether the entity was updated.
  },

  /**
   * Handles input for the character. For non-local players, this means moving towards a destination.
   */
  handleInput: function()
  {
    // Move left if destination is significantly to the left of current position.
    if ( this.destinationX < this.pos.x - 10 )
    {
      this.vel.x -= this.accel.x * me.timer.tick; // Apply acceleration to velocity.
      this.setCurrentAnimation( 'left' ); // Set walking left animation.
      this.direction = 'left'; // Update facing direction.
    }
    // Move right if destination is significantly to the right.
    else if ( this.destinationX > this.pos.x + 10 )
    {
      this.vel.x += this.accel.x * me.timer.tick; // Apply acceleration to velocity.
      this.setCurrentAnimation( 'right' ); // Set walking right animation.
      this.direction = 'right'; // Update facing direction.
    }

    // Move up if destination is significantly above current position.
    if ( this.destinationY < this.pos.y - 10 )
    {
      this.vel.y = -this.accel.y * me.timer.tick; // Apply negative acceleration for upward movement.
      this.setCurrentAnimation( 'up' ); // Set walking up animation.
      this.direction = 'up'; // Update facing direction.
    }
    // Move down if destination is significantly below.
    else if ( this.destinationY > this.pos.y + 10 )
    {
      this.vel.y = this.accel.y * me.timer.tick; // Apply positive acceleration for downward movement.
      this.setCurrentAnimation( 'down' ); // Set walking down animation.
      this.direction = 'down'; // Update facing direction.
    }
  }
});


// --- Local Player Entity Definition ---
// Extends the base Character class with specific logic for the player controlled by the user.
var PlayerEntity = Character.extend(
{
  /**
   * Constructor for the PlayerEntity.
   * @param {number} x - Initial X coordinate.
   * @param {number} y - Initial Y coordinate.
   * @param {object} settings - Configuration settings for the entity.
   */
  init: function( x, y, settings )
  {
    // Call the parent Character constructor.
    this.parent( x, y, settings );

    // Set the game viewport to follow this player entity on both axes.
    me.game.viewport.follow( this.pos, me.game.viewport.AXIS.BOTH );

    // Inform the game system that the local player has been created.
    localPlayerCreated( this );
  },

  /**
   * Handles input specifically for the local player, based on keyboard presses.
   */
  handleInput: function()
  {
    // Check if the 'left' key is pressed.
    if ( me.input.isKeyPressed( 'left' ) )
    {
      this.vel.x -= this.accel.x * me.timer.tick; // Apply acceleration for left movement.
      this.setCurrentAnimation( 'left' ); // Set walking left animation.
      this.direction = 'left'; // Update facing direction.
    }
    // Check if the 'right' key is pressed.
    else if ( me.input.isKeyPressed( 'right' ) )
    {
      this.vel.x += this.accel.x * me.timer.tick; // Apply acceleration for right movement.
      this.setCurrentAnimation( 'right' ); // Set walking right animation.
      this.direction = 'right'; // Update facing direction.
    }

    // Check if the 'up' key is pressed.
    if ( me.input.isKeyPressed( 'up' ) )
    {
      this.vel.y = -this.accel.y * me.timer.tick; // Apply negative acceleration for upward movement.
      this.setCurrentAnimation( 'up' ); // Set walking up animation.
      this.direction = 'up'; // Update facing direction.
    }
    // Check if the 'down' key is pressed.
    else if ( me.input.isKeyPressed( 'down' ) )
    {
      this.vel.y = this.accel.y * me.timer.tick; // Apply positive acceleration for downward movement.
      this.setCurrentAnimation( 'down' ); // Set walking down animation.
      this.direction = 'down'; // Update facing direction.
    }
  }

});

// Entry point: Execute jsApp.onload when the window is ready.
window.onReady( function()
{
  jsApp.onload(); // Initialize the game application.
});