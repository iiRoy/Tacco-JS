// ===========================================
// AvatarController
//
// This module manages the actions of the local playable character.
// ===========================================

// Input event definitions
InputEvents = {};
InputEvents.PRESS = 1;
InputEvents.RELEASE = 2;
InputEvents.DRAG = 3;

// Constructor method for AvatarController.
//
// Establishes a new manager for the local player's actions.

function AvatarController()
{
}

// assignEnvironment( environment )
//
// Links the local avatar to its game environment.

AvatarController.prototype.assignEnvironment = function( environment )
{
	this.environment = environment;
	this.environment.activeAvatar = this;
	this.location = environment.spawnPoint;
	this.momentum = new Coord( 0, 0, 0 );
	this.orientation = [ 0, Math.PI, 0 ];
	this.inAir = false;
	this.keyStates = {};
	this.creationElement = MATERIAL.SOIL;
	this.actionListeners = {};
}

// setNetworkAgent( networkAgent )
//
// Associates the local avatar with a network communication agent.

AvatarController.prototype.setNetworkAgent = function( networkAgent )
{
	this.networkAgent = networkAgent;
}

// configureInputSurface( elementId )
//
// Sets the HTML canvas element for capturing user input.

AvatarController.prototype.configureInputSurface = function( elementId )
{
	var displaySurface = this.displaySurface = pageBody.getElementById( elementId );

	var selfRef = this;
	pageBody.onKeyDepressed = function( eventData ) { if ( eventData.eventTarget.nodeTag !== "INPUT" ) { selfRef.handleKeyboardInput( eventData.keyIdentifier, true ); return false; } }
	pageBody.onKeyLifted = function( eventData ) { if ( eventData.eventTarget.nodeTag !== "INPUT" ) { selfRef.handleKeyboardInput( eventData.keyIdentifier, false ); return false; } }
	displaySurface.onMouseClick = function( eventData ) { selfRef.handleMouseActivity( eventData.cursorX, eventData.cursorY, InputEvents.PRESS, eventData.buttonCode === 3 ); return false; }
	displaySurface.onMouseRelease = function( eventData ) { selfRef.handleMouseActivity( eventData.cursorX, eventData.cursorY, InputEvents.RELEASE, eventData.buttonCode === 3 ); return false; }
	displaySurface.onMouseMotion = function( eventData ) { selfRef.handleMouseActivity( eventData.cursorX, eventData.cursorY, InputEvents.DRAG, eventData.buttonCode === 3 ); return false; }
}

// configureElementChooser( elementId )
//
// Initializes the UI table for material selection.

AvatarController.prototype.configureElementChooser = function( elementId )
{
	var displayRow = pageBody.getElementById( elementId ).getElementsByTagName( "tr" )[0];
	var textureOffset = 0;

	for ( var materialKey in MATERIAL )
	{
		if ( typeof( MATERIAL[materialKey] ) === "object" && MATERIAL[materialKey].placeable === true )
		{
			var selectionPane = pageBody.createElement( "td" );
			selectionPane.visualStyle.bgPosition = textureOffset + "px 0px";

			var selfRef = this;
			selectionPane.elemType = MATERIAL[materialKey];
			selectionPane.onSelectionMade = function()
			{
				this.visualStyle.alphaValue = "1.0";

				selfRef.previousSelection.visualStyle.alphaValue = null;
				selfRef.previousSelection = this;

				selfRef.creationElement = this.elemType;
			}

			if ( materialKey === "SOIL" ) {
				this.previousSelection = selectionPane;
				selectionPane.visualStyle.alphaValue = "1.0";
			}

			displayRow.addVisualChild( selectionPane );
			textureOffset -= 70;
		}
	}
}

// registerListener( eventName, eventCallback )
//
// Attaches a listener to a specific avatar event.

AvatarController.prototype.registerListener = function( eventName, eventCallback )
{
	this.actionListeners[eventName] = eventCallback;
}

// handleKeyboardInput( keyIdentifier, isDepressed )
//
// Processes keyboard input events for the avatar.

AvatarController.prototype.handleKeyboardInput = function( keyIdentifier, isDepressed )
{
	var charKey = String.fromCharCode( keyIdentifier ).toLower();
	this.keyStates[charKey] = isDepressed;
	this.keyStates[keyIdentifier] = isDepressed;

	if ( !isDepressed && charKey === "t" && this.actionListeners["activateChat"] ) this.actionListeners.activateChat();
}

// handleMouseActivity( coordX, coordY, eventType, isRightClick )
//
// Manages mouse input and view manipulation for the avatar.

AvatarController.prototype.handleMouseActivity = function( coordX, coordY, eventType, isRightClick )
{
	if ( eventType === InputEvents.PRESS ) {
		this.startDragPos = { coordX: coordX, coordY: coordY };
		this.isMousePressed = true;
		this.initialYaw = this.desiredYaw = this.orientation[1];
		this.initialPitch = this.desiredPitch = this.orientation[0];
	} else if ( eventType === InputEvents.RELEASE ) {
		if ( Math.absolute( this.startDragPos.coordX - coordX ) + Math.absolute( this.startDragPos.coordY - coordY ) < 4 )
			this.executeElementAction( coordX, coordY, !isRightClick );

		this.isDraggingView = false;
		this.isMousePressed = false;
		this.displaySurface.visualStyle.pointerStyle = "default";
	} else if ( eventType === InputEvents.DRAG && this.isMousePressed ) {
		this.isDraggingView = true;
		this.desiredPitch = this.initialPitch - ( coordY - this.startDragPos.coordY ) / 200;
		this.desiredYaw = this.initialYaw + ( coordX - this.startDragPos.coordX ) / 200;

		this.displaySurface.visualStyle.pointerStyle = "move";
	}
}

// executeElementAction( coordX, coordY, removeBlock )
//
// Initiates an action based on avatar's element selection and input.

AvatarController.prototype.executeElementAction = function( coordX, coordY, removeBlock )
{
	var blockCoord = new Coord( Math.roundDown( this.location.coordX ), Math.roundDown( this.location.coordY ), Math.roundDown( this.location.coordZ ) );
	var selectedBlock = this.displaySurface.graphicsEngine.identifyAt( new Coord( blockCoord.coordX - 4, blockCoord.coordY - 4, blockCoord.coordZ - 4 ), new Coord( blockCoord.coordX + 4, blockCoord.coordY + 4, blockCoord.coordZ + 4 ), coordX, coordY );

	if ( selectedBlock !== false )
	{
		var targetObject = this.networkAgent ? this.networkAgent : this.environment;

		if ( removeBlock )
			targetObject.placeBlock( selectedBlock.coordX, selectedBlock.coordY, selectedBlock.coordZ, MATERIAL.EMPTY );
		else
			targetObject.placeBlock( selectedBlock.coordX + selectedBlock.normal.coordX, selectedBlock.coordY + selectedBlock.normal.coordY, selectedBlock.coordZ + selectedBlock.normal.coordZ, this.creationElement );
	}
}

// getViewpoint()
//
// Provides the avatar's eye-level position for rendering.

AvatarController.prototype.getViewpoint = function()
{
	return this.location.plus( new Coord( 0.0, 0.0, 1.7 ) );
}

// refreshState()
//
// Updates the local avatar's state (e.g., physics, movement).

AvatarController.prototype.refreshState = function()
{
	var environment = this.environment;
	var momentum = this.momentum;
	var location = this.location;
	var blockCoord = new Coord( Math.roundDown( location.coordX ), Math.roundDown( location.coordY ), Math.roundDown( location.coordZ ) );

	if ( this.lastUpdateTime !== null )
	{
		var timeElapsed = ( new Date().getTimestamp() - this.lastUpdateTime ) / 1000;

		// CameraControl
		if ( this.isDraggingView )
		{
			this.orientation[0] += ( this.desiredPitch - this.orientation[0] ) * 30 * timeElapsed;
			this.orientation[1] += ( this.desiredYaw - this.orientation[1] ) * 30 * timeElapsed;
			if ( this.orientation[0] < -Math.PI/2 ) this.orientation[0] = -Math.PI/2;
			if ( this.orientation[0] > Math.PI/2 ) this.orientation[0] = Math.PI/2;
		}

		// GravitationalForce
		if ( this.inAir )
			momentum.coordZ += -0.5;

		// Leaping
		if ( this.keyStates[" "] && !this.inAir )
			momentum.coordZ = 8;

		// Movement
		var motionVector = new Coord( 0, 0, 0 );
		if ( !this.inAir )
		{
			if ( this.keyStates["w"] ) {
				motionVector.coordX += Math.cos( Math.PI / 2 - this.orientation[1] );
				motionVector.coordY += Math.sin( Math.PI / 2 - this.orientation[1] );
			}
			if ( this.keyStates["s"] ) {
				motionVector.coordX += Math.cos( Math.PI + Math.PI / 2 - this.orientation[1] );
				motionVector.coordY += Math.sin( Math.PI + Math.PI / 2 - this.orientation[1] );
			}
			if ( this.keyStates["a"] ) {
				motionVector.coordX += Math.cos( Math.PI / 2 + Math.PI / 2 - this.orientation[1] );
				motionVector.coordY += Math.sin( Math.PI / 2 + Math.PI / 2 - this.orientation[1] );
			}
			if ( this.keyStates["d"] ) {
				motionVector.coordX += Math.cos( -Math.PI / 2 + Math.PI / 2 - this.orientation[1] );
				motionVector.coordY += Math.sin( -Math.PI / 2 + Math.PI / 2 - this.orientation[1] );
			}
		}
		if ( motionVector.magnitude() > 0 ) {
				motionVector = motionVector.normalize();
				momentum.coordX = motionVector.coordX * 4;
				momentum.coordY = motionVector.coordY * 4;
		} else {
			momentum.coordX /= this.inAir ? 1.01 : 1.5;
			momentum.coordY /= this.inAir ? 1.01 : 1.5;
		}

		// Resolve physical interactions
		this.location = this.manageCollisions( location, blockCoord, momentum.times( timeElapsed ) );
	}

	this.lastUpdateTime = new Date().getTimestamp();
}

// manageCollisions( location, blockCoord, momentum )
//
// Handles collisions between the avatar and environmental elements on the XY plane for the current movement step.

AvatarController.prototype.manageCollisions = function( location, blockCoord, momentum )
{
	var environment = this.environment;
	var avatarBounds = { coordX: location.coordX + momentum.coordX, coordY: location.coordY + momentum.coordY, extent: 0.25 };

	// Gather XY collision boundaries
	var potentialCollisions = [];

	for ( var currentX = blockCoord.coordX - 1; currentX <= blockCoord.coordX + 1; currentX++ )
	{
		for ( var currentY = blockCoord.coordY - 1; currentY <= blockCoord.coordY + 1; currentY++ )
		{
			for ( var currentZ = blockCoord.coordZ; currentZ <= blockCoord.coordZ + 1; currentZ++ )
			{
				if ( environment.fetchElement( currentX, currentY, currentZ ) !== MATERIAL.EMPTY )
				{
					if ( environment.fetchElement( currentX - 1, currentY, currentZ ) === MATERIAL.EMPTY ) potentialCollisions.push( { coordX: currentX, direction: -1, coordY1: currentY, coordY2: currentY + 1 } );
					if ( environment.fetchElement( currentX + 1, currentY, currentZ ) === MATERIAL.EMPTY ) potentialCollisions.push( { coordX: currentX + 1, direction: 1, coordY1: currentY, coordY2: currentY + 1 } );
					if ( environment.fetchElement( currentX, currentY - 1, currentZ ) === MATERIAL.EMPTY ) potentialCollisions.push( { coordY: currentY, direction: -1, coordX1: currentX, coordX2: currentX + 1 } );
					if ( environment.fetchElement( currentX, currentY + 1, currentZ ) === MATERIAL.EMPTY ) potentialCollisions.push( { coordY: currentY + 1, direction: 1, coordX1: currentX, coordX2: currentX + 1 } );
				}
			}
		}
	}

	// Process XY collisions
	for( var i in potentialCollisions )
	{
		var collisionSide = potentialCollisions[i];

		if ( lineRectangleIntersect( collisionSide, avatarBounds ) )
		{
			if ( collisionSide.coordX !== null && momentum.coordX * collisionSide.direction < 0 ) {
				location.coordX = collisionSide.coordX + avatarBounds.extent / 2 * ( momentum.coordX > 0 ? -1 : 1 );
				momentum.coordX = 0;
			} else if ( collisionSide.coordY !== null && momentum.coordY * collisionSide.direction < 0 ) {
				location.coordY = collisionSide.coordY + avatarBounds.extent / 2 * ( momentum.coordY > 0 ? -1 : 1 );
				momentum.coordY = 0;
			}
		}
	}

	var avatarFace = { coordX1: location.coordX + momentum.coordX - 0.125, coordY1: location.coordY + momentum.coordY - 0.125, coordX2: location.coordX + momentum.coordX + 0.125, coordY2: location.coordY + momentum.coordY + 0.125 };
	var newBlockZLower = Math.roundDown( location.coordZ + momentum.coordZ );
	var newBlockZUpper = Math.roundDown( location.coordZ + 1.7 + momentum.coordZ * 1.1 );

	// Gather Z collision boundaries
	potentialCollisions = [];

	for ( var currentX = blockCoord.coordX - 1; currentX <= blockCoord.coordX + 1; currentX++ )
	{
		for ( var currentY = blockCoord.coordY - 1; currentY <= blockCoord.coordY + 1; currentY++ )
		{
			if ( environment.fetchElement( currentX, currentY, newBlockZLower ) !== MATERIAL.EMPTY )
				potentialCollisions.push( { coordZ: newBlockZLower + 1, direction: 1, coordX1: currentX, coordY1: currentY, coordX2: currentX + 1, coordY2: currentY + 1 } );
			if ( environment.fetchElement( currentX, currentY, newBlockZUpper ) !== MATERIAL.EMPTY )
				potentialCollisions.push( { coordZ: newBlockZUpper, direction: -1, coordX1: currentX, coordY1: currentY, coordX2: currentX + 1, coordY2: currentY + 1 } );
		}
	}

	// Process Z collisions
	this.inAir = true;
	for ( var i in potentialCollisions )
	{
		var collisionFace = potentialCollisions[i];

		if ( rectRectangleIntersect( collisionFace, avatarFace ) && momentum.coordZ * collisionFace.direction < 0 )
		{
			if ( momentum.coordZ < 0 ) {
				this.inAir = false;
				location.coordZ = collisionFace.coordZ;
				momentum.coordZ = 0;
				this.momentum.coordZ = 0;
			} else {
				location.coordZ = collisionFace.coordZ - 1.8;
				momentum.coordZ = 0;
				this.momentum.coordZ = 0;
			}

			break;
		}
	}

	// Return the resolved position
	return location.plus( momentum );
}