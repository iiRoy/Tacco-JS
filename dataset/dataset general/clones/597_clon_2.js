( function ( ) {
	let mainCanvas = Scene3D.rootLayer(),
		mainScene = mainCanvas.addChild( Scene3D.createObject() ),
		enclosureBody,
		screenWidth = window.innerWidth,
		screenHeight = window.innerHeight,
		cursorX = -0.17849898580121704,
		cursorY = 0.4572815533980582,
		prevCursorX = 0,
		prevCursorY = 0,
		currentCursorX = -0.17849898580121704,
		currentCursorY = 0.4572815533980582,
		containerDim = 575,
		previousCreature,
		livestockArray = [],
		vaporClusters = [],
		airflowVelocity = 2,
		desiredAirflow = 2,
		isInputActive = false,
		activeTouchId = -1,
		rotorBlade,
		activatedItem, // This variable appears to be unused
		alienCraft,
		alienCraftRotX = 0,
		alienCraftScaleX = .12,
		previousFrameTime,
		promptElement,
		enclosureLid;


	// INPUT HANDLERS FOR TOUCH DEVICES ///////////////////////////////////
	let handleTouchBegin = function ( eventObject ) {
		if ( !isInputActive ) {
			let firstTouch = eventObject.changedTouches[0];
			prevCursorX = ( firstTouch.pageX / screenWidth ) - .5;
			prevCursorY = ( firstTouch.pageY / screenHeight ) - .5;
			isInputActive = true;
			activeTouchId = firstTouch.identifier;
		}
		eventObject.preventDefault();
	};

	let handleTouchDrag = function ( evt ) {
		if ( isInputActive ) {
			let currentTouches = evt.changedTouches,
				numTouches = currentTouches.length;
			while ( numTouches-- ) {
				let currentTouch = evt.changedTouches[numTouches];
				if ( currentTouch.identifier === activeTouchId ) {
					let tempX = ( currentTouch.pageX / screenWidth ) - .5,
						tempY = ( currentTouch.pageY / screenHeight ) - .5;
					cursorX -= tempX - prevCursorX;
					cursorY -= tempY - prevCursorY;
					prevCursorX = tempX;
					prevCursorY = tempY;
					if ( cursorX < -.5 ) cursorX = -.5;
					if ( cursorX > .5 ) cursorX = .5;
					if ( cursorY < -.5 ) cursorY = -.5;
					if ( cursorY > .5 ) cursorY = .5;
					break;
				}
			}
		}
		evt.preventDefault();
	};

	let handleTouchStop = function ( eventObj ) {
		if ( isInputActive ) {
			promptElement.className = "disabled";
			let endingTouches = eventObj.changedTouches,
				touchCount = endingTouches.length;
			while ( touchCount-- ) {
				let endedTouch = eventObj.changedTouches[touchCount];
				if ( endedTouch.identifier === activeTouchId ) {
					isInputActive = false;
					activeTouchId = -1;
					break;
				}
			}
		}
		eventObj.preventDefault();
	};


	// INPUT HANDLERS FOR MOUSE DEVICES ///////////////////////////////////

	let handleMousePress = function ( eventData ) {
		if ( !isInputActive ) {
			prevCursorX = ( eventData.pageX / screenWidth ) - .5;
			prevCursorY = ( eventData.pageY / screenHeight ) - .5;
			isInputActive = true;
		}
		eventData.preventDefault();
	};

	let handleMouseMovement = function ( inputEvent ) {
		if ( isInputActive ) {
			let currentX = ( inputEvent.pageX / screenWidth ) - .5,
				currentY = ( inputEvent.pageY / screenHeight ) - .5;
			cursorX -= currentX - prevCursorX;
			cursorY -= currentY - prevCursorY;
			prevCursorX = currentX;
			prevCursorY = currentY;
			if ( cursorX < -.5 ) cursorX = -.5;
			if ( cursorX > .5 ) cursorX = .5;
			if ( cursorY < -.5 ) cursorY = -.5;
			if ( cursorY > .5 ) cursorY = .5;
		}
		inputEvent.preventDefault();
	};

	let handleMouseRelease = function ( actionEvent ) {
		promptElement.className = "disabled";
		isInputActive = false;
		actionEvent.preventDefault();
	};


	// HANDLERS FOR WINDOW EVENTS ///////////////////////////////////

	let handleWindowResize = function ( ) {
		screenWidth = window.innerWidth;
		screenHeight = window.innerHeight;
		let scaleFactor = Math.min( screenWidth, screenHeight ) / 768.0;
		mainCanvas.scaleTransform( scaleFactor, scaleFactor, scaleFactor ).applyChanges();
	};

	let handleDeviceOrientation = function ( ) {
		window.scrollTo( 0, 0 );
	};


	// INTERACTION HANDLERS FOR 3D ELEMENTS ///////////////////////////////////

	let highlightCreature = function ( creatureObj ) {
		if ( previousCreature )
			previousCreature
				.scaleTransform( previousCreature.isMirrored ? -1 : 1, 1, 1 )
				.applyChanges();
		previousCreature = creatureObj;
	};

	let handleCreatureTap = function ( eventDetails ) {
		// adjust position
		let targetSprite = this,
			newPosX = targetSprite.xCoord() + ( Math.round( Math.random() ) * 2 - 1 ) * 50,
			newPosY = targetSprite.yCoord() + ( Math.round( Math.random() ) * 2 - 1 ) * 50,
			isMirrored = targetSprite.isMirrored;
		// constrain boundaries
		if ( newPosX < 50 ) newPosX = 50;
		if ( newPosX > containerDim - 50 ) newPosX = containerDim - 50;
		if ( newPosY < 80 ) newPosY = 80;
		if ( newPosY > containerDim - 50 ) newPosY = containerDim - 50;
		// apply movement
		targetSprite
			.setPosition( newPosX, newPosY, 0 )
			.setRotation( -90, ( newPosX / containerDim - .5 ) * 45, 0 )
			.setProperty( "isMirrored", isMirrored )
			//.scaleTransform( isMirrored?-1+Math.random()*.3:1+Math.random()*.3, 1+Math.random()*.3, 1 )
			.applyChanges();

	//	highlightCreature(targetSprite);
		eventDetails.preventDefault();
		eventDetails.stopImmediatePropagation();
	};

	let handleCreatureHover = function ( ) {
		highlightCreature( this );
	};

	let handleCreatureLeave = function ( ) {

	};

	let handleRotorClick = function ( clickEvent ) {
		if ( desiredAirflow === 0 ) {
			desiredAirflow = 1 + Math.random() * 7;
		} else {
			desiredAirflow = 0;
		}
		clickEvent.preventDefault();
		clickEvent.stopImmediatePropagation();
	};

	let handleSolarTap = function ( sunEvent ) {
		this
			.setPosition( containerDim * Math.random(), -250, 360 )
			.setRotation( -90, this.getRotationY() + 180, 0 )
			.applyChanges();
		sunEvent.preventDefault();
		sunEvent.stopImmediatePropagation();
	};

	// CORE ANIMATION CYCLE ///////////////////////////////////

	let runAnimation = function ( ) {
		requestAnimationFrame( runAnimation );
		updateSceneState();
	};

	let updateSceneState = function ( ) {
		currentCursorX += ( cursorX - currentCursorX ) * .1;
		currentCursorY += ( cursorY - currentCursorY ) * .1;
		enclosureBody
			.setPosition( currentCursorX * 100, 230 + currentCursorY * 50, -currentCursorY * 600 - 150 )
			.setRotation( 70 + currentCursorY * 50, 0, currentCursorX * 210 )
			.applyChanges();

		airflowVelocity += ( desiredAirflow - airflowVelocity ) * .01;

		rotorBlade.rotateAxis( 0, 0, airflowVelocity ).applyChanges();

		let cloudCount = vaporClusters.length,
			singleCloud, cloudXPos;

		while ( cloudCount-- ) {
			singleCloud = vaporClusters[cloudCount];
			cloudXPos = singleCloud.getX();
			if ( cloudXPos < -290 ) {
				cloudXPos = -290 - cloudXPos;
				singleCloud.setZ( singleCloud.destinationZ + cloudXPos * cloudXPos * .1 );
			} else if ( cloudXPos > containerDim + 290 ) {
				cloudXPos = cloudXPos - ( containerDim + 290 );
				singleCloud.setZ( singleCloud.destinationZ + cloudXPos * cloudXPos * .1 );
				if ( cloudXPos > 110 ) {
					singleCloud.destinationY = ( Math.random() * 1.4 - .4 ) * containerDim;
					singleCloud.destinationZ = Math.random() * 190 + 300;
					singleCloud.setPosition( -400 - Math.random() * 400, singleCloud.destinationY, 3000 );
				}
			}
			singleCloud.translate( airflowVelocity, 0, 0 ).applyChanges();
		}
	};



	// UTILITY FUNCTIONS FOR SCENE CONSTRUCTION ///////////////////////////////////

	let appendEnclosurePanel = function ( panelId, panelX, panelY, panelRotation ) {
		enclosureBody.addChild(
			Scene3D.createObject( ".panelSection" )
				.setProperty( "elementIdentifier", panelId )
				.setTransformOrigin( 0, 0 )
				.setTransformFormat( "p rx rz ry s" )
				.setPosition( panelX, panelY, 231 )
				.setRotation( -90, panelRotation, 0 )
				.applyChanges()
		);
	};




	// SCENE ELEMENT INSTANTIATION AND INITIALIZATION ///////////////////////////////////

	promptElement = document.createElement( "div" );
	promptElement.id = "userPrompt";
	document.body.appendChild( promptElement );

	// ENCLOSURE BASE //
	enclosureBody = mainCanvas.addChild(
		Scene3D.createObject( "enclosureBody" )
			.setOriginPoint( 640, 640 )
			.setPosition( 0, 200, -600 )
			.setRotation( 70, 0, 0 )
			.setTransformFormat( "p rx rz ry s" )
			.applyChanges()
	);
	enclosureLid = enclosureBody.addChild(
		Scene3D.createObject( "enclosureLid" )
			.setPosition( 358, 362, 231 )
			.applyChanges()
	);
	// ENCLOSURE PANELS //
	appendEnclosurePanel( "panelOne", 358, 937, 0 );
	appendEnclosurePanel( "panelTwo", 358, 362, 270 );
	appendEnclosurePanel( "panelThree", 933, 362, 180 );
	appendEnclosurePanel( "panelFour", 933, 937, 90 );

	// LIVESTOCK ELEMENTS //
	for ( let idx = 0; idx < 5; idx++ ) {
		let horizontalPos = ( Math.random() * .8 + .1 ),
			isMirrored = Math.random() > .5;

		livestockArray.push( enclosureLid.addChild(
			Scene3D.createObject( ".creature" + Math.ceil( Math.random() * 3 ) )
				.setOriginPoint( 38, 78 )
				.setTransformOrigin( 38, 78 )
				.setPosition( horizontalPos * containerDim, ( Math.random() * .8 + .1 ) * containerDim, 0 )
				.setRotation( -90, ( horizontalPos - .5 ) * 45, 0 )
				.setProperty( "isMirrored", isMirrored )
				.attachHandlers( { hover: handleCreatureTap, tap: handleCreatureTap } )
				.applyChanges()
		) );
	}

	// DECORATIVE BANNER //
	enclosureLid.addChild(
		Scene3D.createObject( "displayRibbon" )
			.setOriginPoint( 0, 332 )
			.setTransformOrigin( 0, 332 )
			.setPosition( 10, 60, 0 )
			.setRotation( -90, .4, 0 )
			.applyChanges()
	);

	// SOLAR ORB //
	enclosureLid.addChild(
		Scene3D.createObject( "solarOrb" )
			.setTransformFormat( "p rx rz ry s" )
			.setOriginPoint( 125, 750 - 136 )
			.setTransformOrigin( 125, 750 - 136 )
			.setPosition( containerDim * .92, -250, 360 )
			.setRotation( -90, -2, 0 )
			.attachHandlers( { hover: handleSolarTap, tap: handleSolarTap } )
			.applyChanges()
	);

	// ATMOSPHERIC VAPOR //
	let vaporY, vaporZ;
	for ( let loopIndex = 0; loopIndex < 7; loopIndex++ ) {
		vaporY = ( Math.random() * 1.4 - .4 ) * containerDim;
		vaporZ = Math.random() * 190 + 300;
		vaporClusters.push( enclosureLid.addChild(
			Scene3D.createObject( ".vapor" + Math.ceil( Math.random() * 3 ) )
				.setTransformFormat( "p rx rz ry s" )
				.setTransformOrigin( 62, 750 - 40 )
				.setOriginPoint( 62, 750 - 40 )
				.setPosition( ( Math.random() * 1.4 - .2 ) * containerDim, vaporY, vaporZ )
				.setRotation( -90, -Math.random() * 10 - 5, 0 )
				.setProperty( "destinationY", vaporY )
				.setProperty( "destinationZ", vaporZ )
				.applyChanges()
		) );

	}

	// WINDMILL STRUCTURE //
	let windmillStructure = enclosureLid.addChild(
		Scene3D.createObject( "windmillBase" )
			.setOriginPoint( 60, 201 )
			.setTransformOrigin( 60, 201 )
			.setPosition( 90, 380, 0 )
			.setRotation( -90, 20, 0 )
			.applyChanges()
	);

	rotorBlade = windmillStructure.addChild(
		Scene3D.createObject( "rotorElement" )
			.setOriginPoint( 89, 93 )
			.setTransformOrigin( 89, 93 )
			.setPosition( 60, 80, 5 )
			.attachHandlers( { press: handleRotorClick, tap: handleRotorClick } )
			.applyChanges()
	);

	// UNIDENTIFIED FLYING OBJECT //
	enclosureLid.addChild(
		Scene3D.createObject( "alienVehicle" )
			.setTransformFormat( "p rx rz ry s" )
			.setOriginPoint( 61, 750 - 50 )
			.setTransformOrigin( 61, 0 )
			.setPosition( containerDim >> 1, containerDim >> 1, 800 )
			.setRotation( -90, -2, 0 )
			.applyChanges()
	);


	// Event subscriptions for mouse input
	document.addEventListener( "pointerdown", handleMousePress, false );
	document.addEventListener( "pointermove", handleMouseMovement, false );
	document.addEventListener( "pointerup", handleMouseRelease, false );
	// Event subscriptions for touch input
	document.addEventListener( "touchBegin", handleTouchBegin, false );
	document.addEventListener( "touchMove", handleTouchDrag, false );
	document.addEventListener( "touchEnd", handleTouchStop, false );
	// Event subscriptions for window state changes
	window.addEventListener( "windowResized", handleWindowResize, false );
	window.addEventListener( "orientationChange", handleDeviceOrientation, false );
	handleWindowResize();

	// Initiate render cycle
	/* Alternative: setInterval(updateSceneState, 1000 / 50); */
	previousFrameTime = new Date().getTime();
	runAnimation();
} )();