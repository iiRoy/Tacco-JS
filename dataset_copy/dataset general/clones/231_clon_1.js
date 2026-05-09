/*
 * This file contains the implementation for the Player class.
 * It manages the local player's state, input, and interactions within the game world.
 */
// Define mouse event types for clarity in input handling.
var MOUSE = {};      // Global object to hold mouse event constants.
MOUSE.DOWN = 1; // Represents a mouse button press event.
MOUSE.UP = 2;   // Represents a mouse button release event.
MOUSE.MOVE = 3; // Represents a mouse movement event.

/*
 * Player Class Constructor
 *
 * Initializes a new instance of the Player class.
 */
function Player ( )
{
	// The constructor is currently empty as properties are set by other methods.
}

/*
 * setWorld Method
 *
 * Parameters:
 *   world - The game world object to which this player will be assigned.
 *
 * Assigns the player to a specified game world and initializes player properties.
 */
Player.prototype.setWorld = function( world )
{
	this.world = world;                 // Store a reference to the game world.
	this.world.localPlayer = this;      // Set this player as the local player in the world.
	this.pos = world.spawnPoint;        // Initialize player position to the world's spawn point.
	this.velocity = new Vector( 0, 0, 0 ); // Initialize player velocity to zero.
	this.angles = [ 0, Math.PI, 0 ];    // Initialize player view angles (pitch, yaw, roll).
	this.falling = false;               // Flag to track if the player is currently falling.
	this.keys = {};                     // Object to store the state of pressed keys.
	this.buildMaterial = BLOCK.DIRT;    // Default material for building.
	this.eventHandlers = {};            // Object to store custom event callbacks.
};

/*
 * setClient Method
 *
 * Parameters:
 *   client - The network client object associated with this player.
 *
 * Assigns a network client to the local player instance.
 */
Player.prototype.setClient = function( client )
{
	this.client = client; /* Store the client reference for network communication. */
};

/*
 * setInputCanvas Method
 *
 * Parameters:
 *   id - The DOM ID of the canvas element used for input.
 *
 * Sets up event listeners on the specified canvas and document for user input.
 */
Player.prototype.setInputCanvas = function( id )
{
	var canvas = this.canvas = document.getElementById( id ); // Get the canvas element by its ID.

	var t = this; // Capture 'this' for use within event handler closures.
	document.onkeydown = function( e ) {
		// Only process key events if the target is not an input field.
		if ( e.target.tagName != "INPUT" ) {
			t.onKeyEvent( e.keyCode, true ); // Call the player's key event handler for key down.
			return false; // Prevent default browser action.
		}
	};
	document.onkeyup = function( e ) {
		// Only process key events if the target is not an input field.
		if ( e.target.tagName != "INPUT" ) {
			t.onKeyEvent( e.keyCode, false ); // Call the player's key event handler for key up.
			return false; // Prevent default browser action.
		}
	};
	canvas.onmousedown = function( e ) {
		// Call the player's mouse event handler for mouse down.
		t.onMouseEvent( e.clientX, e.clientY, MOUSE.DOWN, e.which == 3 );
		return false; // Prevent default browser action.
	};
	canvas.onmouseup = function( e ) {
		// Call the player's mouse event handler for mouse up.
		t.onMouseEvent( e.clientX, e.clientY, MOUSE.UP, e.which == 3 );
		return false; // Prevent default browser action.
	};
	canvas.onmousemove = function( e ) {
		// Call the player's mouse event handler for mouse move.
		t.onMouseEvent( e.clientX, e.clientY, MOUSE.MOVE, e.which == 3 );
		return false; // Prevent default browser action.
	};
};

/*
 * setMaterialSelector Method
 *
 * Parameters:
 *   id - The DOM ID of the HTML element containing the material selectors.
 *
 * Populates and configures a material selection interface.
 */
Player.prototype.setMaterialSelector = function( id )
{
	var tableRow = document.getElementById( id ).getElementsByTagName( "tr" )[0]; // Get the first row of the selector table.
	var texOffset = 0; // Initial texture offset for background positioning.

	for ( var mat in BLOCK ) // Iterate through all defined blocks.
	{
		// Check if the block is a valid, spawnable object.
		if ( typeof( BLOCK[mat] ) == "object" && BLOCK[mat].spawnable == true )
		{
			var selector = document.createElement( "td" ); // Create a new table cell for the selector.
			selector.style.backgroundPosition = texOffset + "px 0px"; // Set background position for texture.

			var pl = this; // Reference to the player instance for event handler.
			selector.material = BLOCK[mat]; // Store the block material data on the selector element.
			selector.onclick = function() // Define click event handler for the selector.
			{
				this.style.opacity = "1.0"; // Make the clicked selector fully opaque.

				pl.prevSelector.style.opacity = null; // Reset opacity of the previously selected selector.
				pl.prevSelector = this;               // Update the reference to the currently selected selector.

				pl.buildMaterial = this.material;     // Set the player's current build material.
			};

			if ( mat == "DIRT" ) { // If the current material is DIRT (default).
				this.prevSelector = selector;      // Mark this selector as the previously selected one.
				selector.style.opacity = "1.0";    // Set its opacity to full.
			}

			tableRow.appendChild( selector ); // Add the selector cell to the table row.
			texOffset -= 70; // Adjust texture offset for the next material.
		}
	}
};

/*
 * on Method
 *
 * Parameters:
 *   event    - The name of the event to hook (string).
 *   callback - The function to call when the event occurs.
 *
 * Registers a callback function for a specific player event.
 */
Player.prototype.on = function( event, callback )
{
	this.eventHandlers[event] = callback; // Store the callback function under the event name.
};

/*
 * onKeyEvent Method
 *
 * Parameters:
 *   keyCode - The key code of the pressed/released key.
 *   down    - Boolean, true if key is pressed, false if released.
 *
 * Handles keyboard input events, updating key states and triggering actions.
 */
Player.prototype.onKeyEvent = function( keyCode, down )
{
	var key = String.fromCharCode( keyCode ).toLowerCase(); // Convert key code to a lowercase character.
	this.keys[key] = down;                                  // Update the state of the character key.
	this.keys[keyCode] = down;                              // Update the state of the numeric key code.

	// If 't' key is released and an 'openChat' handler exists, trigger it.
	if ( !down && key == "t" && this.eventHandlers["openChat"] )
		this.eventHandlers.openChat();
};

/*
 * onMouseEvent Method
 *
 * Parameters:
 *   x    - X-coordinate of the mouse cursor.
 *   y    - Y-coordinate of the mouse cursor.
 *   type - Type of mouse event (MOUSE.DOWN, MOUSE.UP, MOUSE.MOVE).
 *   rmb  - Boolean, true if the right mouse button was involved.
 *
 * Processes mouse input for camera control and block actions.
 */
Player.prototype.onMouseEvent = function( x, y, type, rmb )
{
	if ( type == MOUSE.DOWN ) {
		this.dragStart = { x: x, y: y }; // Record the starting position of a drag.
		this.mouseDown = true;           // Set flag indicating mouse button is down.
		this.yawStart = this.targetYaw = this.angles[1];     // Store initial yaw for dragging.
		this.pitchStart = this.targetPitch = this.angles[0]; // Store initial pitch for dragging.
	} else if ( type == MOUSE.UP ) {
		// If the mouse moved minimally, perform a block action.
		if ( Math.abs( this.dragStart.x - x ) + Math.abs( this.dragStart.y - y ) < 4 )
			this.doBlockAction( x, y, !rmb ); // Perform destroy if left-click, build if right-click.

		this.dragging = false;       // Reset dragging flag.
		this.mouseDown = false;      // Reset mouse down flag.
		this.canvas.style.cursor = "default"; // Restore default cursor.
	} else if ( type == MOUSE.MOVE && this.mouseDown ) {
		this.dragging = true; // Set dragging flag if mouse is moving while button is down.
		// Calculate new target pitch based on vertical mouse movement.
		this.targetPitch = this.pitchStart - ( y - this.dragStart.y ) / 200;
		// Calculate new target yaw based on horizontal mouse movement.
		this.targetYaw = this.yawStart + ( x - this.dragStart.x ) / 200;

		this.canvas.style.cursor = "move"; // Change cursor to indicate dragging.
	}
};

/*
 * doBlockAction Method
 *
 * Parameters:
 *   x       - X-coordinate of the mouse click.
 *   y       - Y-coordinate of the mouse click.
 *   destroy - Boolean, true to destroy a block, false to place one.
 *
 * Executes a block-related action (destroy or build) based on player input.
 */
Player.prototype.doBlockAction = function( x, y, destroy )
{
	// Determine the player's current block position.
	var bPos = new Vector( Math.floor( this.pos.x ), Math.floor( this.pos.y ), Math.floor( this.pos.z ) );
	// Use the renderer to pick a block in the world based on mouse coordinates.
	var block = this.canvas.renderer.pickAt( new Vector( bPos.x - 4, bPos.y - 4, bPos.z - 4 ), new Vector( bPos.x + 4, bPos.y + 4, bPos.z + 4 ), x, y );

	if ( block != false ) // If a block was successfully picked.
	{
		var obj = this.client ? this.client : this.world; // Use client for multiplayer, world for singleplayer.

		if ( destroy )
			obj.setBlock( block.x, block.y, block.z, BLOCK.AIR ); // Destroy the picked block.
		else
			obj.setBlock( block.x + block.n.x, block.y + block.n.y, block.z + block.n.z, this.buildMaterial ); // Place a block next to the picked one.
	}
};

/*
 * getEyePos Method
 *
 * Returns:
 *   A Vector representing the player's eye position for rendering purposes.
 *
 * Calculates and returns the player's eye-level position.
 */
Player.prototype.getEyePos = function()
{
	return this.pos.add( new Vector( 0.0, 0.0, 1.7 ) ); // Add an offset to the player's base position for eye height.
};

/*
 * update Method
 *
 * Updates the player's state, including movement, gravity, and view angles.
 */
Player.prototype.update = function()
{
	var world = this.world;     // Reference to the current game world.
	var velocity = this.velocity; // Player's current velocity vector.
	var pos = this.pos;         // Player's current position vector.
	// Determine the player's current block coordinates.
	var bPos = new Vector( Math.floor( pos.x ), Math.floor( pos.y ), Math.floor( pos.z ) );

	if ( this.lastUpdate != null ) // Ensure this is not the first update.
	{
		// Calculate time difference since the last update in seconds.
		var delta = ( new Date().getTime() - this.lastUpdate ) / 1000;

		// Handle View Rotation
		if ( this.dragging )
		{
			// Smoothly interpolate current angles towards target angles.
			this.angles[0] += ( this.targetPitch - this.angles[0] ) * 30 * delta;
			this.angles[1] += ( this.targetYaw - this.angles[1] ) * 30 * delta;
			// Clamp pitch angle to prevent flipping.
			if ( this.angles[0] < -Math.PI/2 ) this.angles[0] = -Math.PI/2;
			if ( this.angles[0] > Math.PI/2 ) this.angles[0] = Math.PI/2;
		}

		// Apply Gravity
		if ( this.falling )
			velocity.z += -0.5; // Accelerate downwards.

		// Handle Jumping
		if ( this.keys[" "] && !this.falling )
			velocity.z = 8; // Apply upward velocity for a jump.

		// Handle Walking Movement
		var walkVelocity = new Vector( 0, 0, 0 ); // Initialize walk velocity.
		if ( !this.falling ) // Only allow horizontal movement when not falling.
		{
			if ( this.keys["w"] ) { // Move forward.
				walkVelocity.x += Math.cos( Math.PI / 2 - this.angles[1] );
				walkVelocity.y += Math.sin( Math.PI / 2 - this.angles[1] );
			}
			if ( this.keys["s"] ) { // Move backward.
				walkVelocity.x += Math.cos( Math.PI + Math.PI / 2 - this.angles[1] );
				walkVelocity.y += Math.sin( Math.PI + Math.PI / 2 - this.angles[1] );
			}
			if ( this.keys["a"] ) { // Strafe left.
				walkVelocity.x += Math.cos( Math.PI / 2 + Math.PI / 2 - this.angles[1] );
				walkVelocity.y += Math.sin( Math.PI / 2 + Math.PI / 2 - this.angles[1] );
			}
			if ( this.keys["d"] ) { // Strafe right.
				walkVelocity.x += Math.cos( -Math.PI / 2 + Math.PI / 2 - this.angles[1] );
				walkVelocity.y += Math.sin( -Math.PI / 2 + Math.PI / 2 - this.angles[1] );
			}
		}
		if ( walkVelocity.length() > 0 ) {
			walkVelocity = walkVelocity.normal(); // Normalize the walk velocity vector.
			velocity.x = walkVelocity.x * 4;     // Apply walk speed.
			velocity.y = walkVelocity.y * 4;     // Apply walk speed.
		} else {
			// Decelerate horizontal velocity when not walking.
			velocity.x /= this.falling ? 1.01 : 1.5;
			velocity.y /= this.falling ? 1.01 : 1.5;
		}

		// Resolve collisions and update player position.
		this.pos = this.resolveCollision( pos, bPos, velocity.mul( delta ) );
	}

	this.lastUpdate = new Date().getTime(); // Record the current time for the next update.
};

/*
 * resolveCollision Method
 *
 * Parameters:
 *   pos      - The player's current position.
 *   bPos     - The player's current block-aligned position.
 *   velocity - The player's velocity vector for the current step.
 *
 * Returns:
 *   A Vector representing the player's new position after collision resolution.
 *
 * Detects and resolves collisions between the player and world blocks.
 */
Player.prototype.resolveCollision = function( pos, bPos, velocity )
{
	var world = this.world; // Reference to the game world.
	// Define the player's bounding box for XY collision checks.
	var playerRect = { x: pos.x + velocity.x, y: pos.y + velocity.y, size: 0.25 };

	// Collect potential XY collision sides from surrounding blocks.
	var collisionCandidates = [];

	for ( var x = bPos.x - 1; x <= bPos.x + 1; x++ )
	{
		for ( var y = bPos.y - 1; y <= bPos.y + 1; y++ )
		{
			for ( var z = bPos.z; z <= bPos.z + 1; z++ )
			{
				if ( world.getBlock( x, y, z ) != BLOCK.AIR ) // If the block is not air.
				{
					// Add collision candidates for each face of the block that is adjacent to air.
					if ( world.getBlock( x - 1, y, z ) == BLOCK.AIR ) collisionCandidates.push( { x: x, dir: -1, y1: y, y2: y + 1 } );
					if ( world.getBlock( x + 1, y, z ) == BLOCK.AIR ) collisionCandidates.push( { x: x + 1, dir: 1, y1: y, y2: y + 1 } );
					if ( world.getBlock( x, y - 1, z ) == BLOCK.AIR ) collisionCandidates.push( { y: y, dir: -1, x1: x, x2: x + 1 } );
					if ( world.getBlock( x, y + 1, z ) == BLOCK.AIR ) collisionCandidates.push( { y: y + 1, dir: 1, x1: x, x2: x + 1 } );
				}
			}
		}
	}

	// Solve XY collisions by adjusting position and velocity.
	for( var i in collisionCandidates )
	{
		var side = collisionCandidates[i]; // Current collision candidate side.

		if ( lineRectCollide( side, playerRect ) ) // Check if the player's future position collides with this side.
		{
			if ( side.x != null && velocity.x * side.dir < 0 ) {
				// Adjust X position to prevent penetration.
				pos.x = side.x + playerRect.size / 2 * ( velocity.x > 0 ? -1 : 1 );
				velocity.x = 0; // Stop horizontal movement in this direction.
			} else if ( side.y != null && velocity.y * side.dir < 0 ) {
				// Adjust Y position to prevent penetration.
				pos.y = side.y + playerRect.size / 2 * ( velocity.y > 0 ? -1 : 1 );
				velocity.y = 0; // Stop vertical movement in this direction.
			}
		}
	}

	// Define player's bounding box for Z collision checks.
	var playerFace = { x1: pos.x + velocity.x - 0.125, y1: pos.y + velocity.y - 0.125, x2: pos.x + velocity.x + 0.125, y2: pos.y + velocity.y + 0.125 };
	var newBZLower = Math.floor( pos.z + velocity.z );             // Block Z coordinate for player's feet.
	var newBZUpper = Math.floor( pos.z + 1.7 + velocity.z * 1.1 ); // Block Z coordinate for player's head.

	// Collect potential Z collision sides from surrounding blocks.
	collisionCandidates = [];

	for ( var x = bPos.x - 1; x <= bPos.x + 1; x++ )
	{
		for ( var y = bPos.y - 1; y <= bPos.y + 1; y++ )
		{
			// Check for collisions with blocks below the player.
			if ( world.getBlock( x, y, newBZLower ) != BLOCK.AIR )
				collisionCandidates.push( { z: newBZLower + 1, dir: 1, x1: x, y1: y, x2: x + 1, y2: y + 1 } );
			// Check for collisions with blocks above the player.
			if ( world.getBlock( x, y, newBZUpper ) != BLOCK.AIR )
				collisionCandidates.push( { z: newBZUpper, dir: -1, x1: x, y1: y, x2: x + 1, y2: y + 1 } );
		}
	}

	// Solve Z collisions.
	this.falling = true; // Assume falling until a collision proves otherwise.
	for ( var i in collisionCandidates )
	{
		var face = collisionCandidates[i]; // Current collision candidate face.

		if ( rectRectCollide( face, playerFace ) && velocity.z * face.dir < 0 ) // Check for Z collision.
		{
			if ( velocity.z < 0 ) { // Collision with ground.
				this.falling = false;  // Player is no longer falling.
				pos.z = face.z;        // Adjust Z position to sit on top of the block.
				velocity.z = 0;        // Stop vertical velocity.
				this.velocity.z = 0;   // Reset player's actual velocity.
			} else { // Collision with ceiling.
				pos.z = face.z - 1.8;  // Adjust Z position to be below the block.
				velocity.z = 0;        // Stop vertical velocity.
				this.velocity.z = 0;   // Reset player's actual velocity.
			}

			break; // Only resolve one Z collision per step.
		}
	}

	// Return the final position after all collision resolutions.
	return pos.add( velocity );
};