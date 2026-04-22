/*-------------------------------------------------------------------

	___________    ____   _____ _____    ____  
	\____ \__  \ _/ ___\ /     \\__  \  /    \ 
	|  |_> > __ \\  \___|  Y Y  \/ __ \|   |  \
	|   __(____  /\___  >__|_|  (____  /___|  /
	|__|       \/     \/      \/     \/     \/ .platzh1rsch.ch
	
	author: dev_pablo		(www.dev_pablo.ch)
	
-------------------------------------------------------------------*/


/* ----- Global Program Variables ---------------------------------------- */
	var drawingSurface; /* Main drawing area for the game */
	var gameController; /* Input handler for the player */
	var renderContext;  /* 2D rendering context for the main surface */
	var mainApp;        /* The core game engine instance */
	var wallSurface, wallRenderContext; /* Separate surfaces for static elements */
	var azureSpecter, crimsonSpecter, ochreSpecter, roseSpecter; /* The four spectral antagonists */
	
	var levelLayoutPath = 'data/map.json'; /* Path to the configuration for the game's level */
	
	
	/* Remote data handling functions */
	function fetchTopScores() {
		/* Schedule the data retrieval after a short delay */
		setTimeout(performDataRetrieval, 30);
	}
	function performDataRetrieval() {
	    var currentMoment = new Date().getTime(); /* Get current timestamp for cache busting */
		$.ajax({
		   dataType: "json", /* Expected data type from the server */
		   type: "GET",      /* HTTP method for the request */
		   url: "data/db-handler.php", /* Server-side script to handle data */
		   data: {
			 timestamp: currentMoment, /* Unique timestamp */
			 action: 'get'            /* Action to perform: retrieve scores */
			 },
		   success: function(serverResponse){ /* Callback on successful response */
			 $("#highscore-list").text(""); /* Clear existing list */
			 for (var k = 0; k < serverResponse.length; k++) { /* Iterate through scores */
				$("#highscore-list").append("<li>"+serverResponse[k]['name']+"<span id='score'>"+serverResponse[k]['score']+"</span></li>"); /* Add each score to the list */
			 }
		   } 
		});
	}
	function submitNewScore(playerName, playerScore) {
		/* Send player's name and score to the server */
		$.ajax({
		   type: "POST", /* HTTP method for submitting data */
		   url: "data/db-handler.php", /* Server-side script for data handling */
		   data: {
			 action: 'add',        /* Action to perform: add new score */
			 name: playerName,     /* Player's identifier */
			 score: playerScore   /* Player's achieved points */
			 }
		});
	}
	function recordPlayerScore() {
		/* Capture player input and current game score, then submit */
		submitNewScore($("input[type=text]").val(), mainApp.playerScoreboard.currentValue);
		$("#highscore-form").html('<span class="button" onClick="mainApp.displayInterfaceSection(\'highscore-content\');fetchTopScores();">view highscore</span>'); /* Update form to show button */
	}
	
	function constructBarrier(renderTarget, xCoord, yCoord, blockWidth, blockHeight) {
		console.log("Building a section of wall."); /* Log wall construction */
		blockWidth = blockWidth * 2 - 1; /* Adjust width for rendering */
		blockHeight = blockHeight * 2 - 1; /* Adjust height for rendering */
		renderTarget.fillRect(playerCharacter.size / 2 + xCoord * 2 * playerCharacter.size, playerCharacter.size / 2 + yCoord * 2 * playerCharacter.size, blockWidth * playerCharacter.size, blockHeight * playerCharacter.size); /* Draw the wall rectangle */
	}
	
	function isWithinRange (value, lowerBound, upperBound) {
		/* Checks if a value falls within a specified inclusive range */
		return value >= lowerBound && value <= upperBound;
		}


	// Debugging utility
	var debugLog = function() {
	    var previousConsoleLogger = null; /* Stores the original console.log function */
	    var publicApi = {}; /* Public interface for the debug utility */

	    publicApi.activateLogger =  function activateLogger() 
	                        {
	                            if(previousConsoleLogger == null)
	                                return; /* Do nothing if logger wasn't disabled */

	                            window['console']['log'] = previousConsoleLogger; /* Restore original console.log */
	                        };

	    publicApi.deactivateLogger = function deactivateLogger()
	                        {
	                            previousConsoleLogger = console.log; /* Save original console.log */
	                            window['console']['log'] = function() {}; /* Replace with a no-op function */
	                        };

	    return publicApi; /* Return the public interface */
	}();
	
	// Manages the entire game application ("Master Controller")
	function GameEngine() {
		this.tickRate = 33;		// Simulation speed, increases with higher difficulty levels
		this.isActive = false;      // Is the game currently running?
		this.isPaused = true;       // Is the game currently paused?
		this.playerScoreboard = new PlayerScore(); // Tracks player's points
		this.audioEnabled = 0;      // Sound effects toggle (0 = off, 1 = on)
		this.currentMap;            // The loaded game map layout
		this.dotCount;              // Number of collectibles remaining on the map
		this.spectralEntities;      // Array or list of antagonists
		this.difficultyLevel = 1;   // Current game difficulty
		this.isGameOver = false;    // Flag indicating end of game
		this.displayElement = $("#myCanvas").get(0); // Reference to the canvas DOM element
		this.renderWidth = this.displayElement.width;   // Width of the game area
		this.renderHeight = this.displayElement.height; // Height of the game area
		
		this.entitiesFrightened = false;    // Are the spectral entities currently vulnerable?
		this.frightenedDuration = 240;      // Timer for how long entities remain frightened
		this.entityStrategy = 0;            // 0 = Disperse, 1 = Pursue
		this.strategyTimer = 200;           // Decrements each animation frame
		
		/* Core Game Mechanics */
		this.initiateFrightenedState = function() {
			console.log("Spectral entities are now frightened!"); /* Log the state change */
			this.entitiesFrightened = true; /* Set flag */
			this.frightenedDuration = 240; /* Reset timer */
			azureSpecter.enterVulnerableState();	/* Make azure vulnerable */
			roseSpecter.enterVulnerableState();	/* Make rose vulnerable */
			crimsonSpecter.enterVulnerableState();	/* Make crimson vulnerable */
			ochreSpecter.enterVulnerableState();
		}
		this.terminateFrightenedState = function() {
			console.log("Spectral entities return to normal.");		/* Log state change */
			this.entitiesFrightened = false; /* Clear flag */
			azureSpecter.exitVulnerableState(); /* Restore normal state */
			roseSpecter.exitVulnerableState();	/* Restore normal state */
			crimsonSpecter.exitVulnerableState();	/* Restore normal state */
			ochreSpecter.exitVulnerableState();
			};
		
			
		this.evaluateEntityStrategy = function() {
			if (this.entitiesFrightened) {
				
				this.frightenedDuration--; /* Decrement timer */
				if (this.frightenedDuration == 0) { /* If timer runs out */
					this.terminateFrightenedState(); /* End frightened state */
					this.frightenedDuration = 240; /* Reset timer (this seems like a bug, should not reset here if already 0) */
					/*azureSpecter.reverseCurrentDirection();
					roseSpecter.reverseCurrentDirection();
					ochreSpecter.reverseCurrentDirection();
					crimsonSpecter.reverseCurrentDirection();*/
				}
			}
			else {
				this.strategyTimer--; /* Decrement strategy timer */
				if (this.strategyTimer == 0) { /* If timer runs out */
					console.log("entityStrategy=" + this.entityStrategy); /* Log current strategy */
					this.entityStrategy ^= 1; /* Toggle strategy (0 to 1, 1 to 0) */
					this.strategyTimer = 200 + this.entityStrategy * 450; /* Reset timer based on new strategy */
					/*azureSpecter.reverseCurrentDirection();
					roseSpecter.reverseCurrentDirection();
					ochreSpecter.reverseCurrentDirection();
					crimsonSpecter.reverseCurrentDirection();*/
					}
			}
		}
		
		this.getMapGridValue = function (xPos, yPos) {
			var maximumX = mainApp.renderWidth / 30 - 1; /* Calculate max X grid coordinate */
			var maximumY = mainApp.renderHeight / 30 - 1; /* Calculate max Y grid coordinate */
			if (xPos < 0) xPos = maximumX + xPos; /* Wrap X if out of bounds */
			if (xPos > maximumX) xPos = xPos - maximumX; /* Wrap X if out of bounds */
			if (yPos < 0) yPos = maximumY + yPos; /* Wrap Y if out of bounds */
			if (yPos > maximumY) yPos = yPos - maximumY; /* Wrap Y if out of bounds */
			return this.currentMap.yPositions[yPos].xPositions[xPos].tileType; /* Return map tile type */
		}
		this.setMapGridValue = function (xPos, yPos, newValue) {
			this.currentMap.yPositions[yPos].xPositions[xPos].tileType = newValue; /* Set map tile type */
		}
		
		this.toggleAudio = function() { 
			this.audioEnabled == 0 ? this.audioEnabled = 1 : this.audioEnabled = 0; /* Toggle audio state */
			$('#mute').toggle(); /* Toggle mute indicator */
			}
		this.performReset = function() {
			/* Placeholder for reset logic */
			}
		this.startNewSession = function() {
		    var confirmation = confirm("Are you certain you wish to commence a new game?"); /* Ask for confirmation */
            if (confirmation) {
        	    console.log("Commencing new game session."); /* Log new game start */
                this.initializeGame(0); /* Initialize game from scratch */
            }
            this.togglePauseResume(); /* Resume if paused, or pause if running */
		}
		this.advanceLevel = function() {
			this.difficultyLevel++; /* Increment difficulty level */
            console.log("Game Level " + mainApp.difficultyLevel); /* Log new level */
			mainApp.showMessage("Level " + mainApp.difficultyLevel, "Level up! Click to continue!"); /* Show level up message */
			this.initializeGame(1); /* Initialize game for next level */
		}
		this.drawPlayerLives = function (liveCount) {
			var heartsHtml = ""; /* String to build HTML for lives */
			for (let iter = 0; iter < liveCount; iter++) {
				heartsHtml += " <img src='img/heart.png'>"; /* Add heart image for each life */
				}
			$(".lives").html("Lives: " + heartsHtml); /* Update lives display */
			
		}
		this.displayInterfaceSection = function (sectionId) {
			$('.content').hide(); /* Hide all content sections */
			$('#' + sectionId).show(); /* Show the specified section */
		}
		this.showMessage = function(mainTitle, messageText) {
			this.isPaused = true; /* Pause the game */
			$('#canvas-overlay-container').fadeIn(200); /* Show overlay with fade effect */
			if ($('.controls').css('display') != "none") $('.controls').slideToggle(200); /* Hide controls if visible */
			$('#canvas-overlay-content #title').text(mainTitle); /* Set message title */
			$('#canvas-overlay-content #text').html(messageText); /* Set message body */
		}
		this.hideMessage = function() {
			$('#canvas-overlay-container').fadeOut(200); /* Hide overlay with fade effect */
			$('.controls').slideToggle(200); /* Show controls again */
		}
		this.togglePauseResume = function () {
			if (!this.isActive) { /* If game is not active (first start) */
				this.isPaused = false; /* Unpause */
				this.isActive = true; /* Set active */
				this.hideMessage(); /* Hide any messages */
				gameAnimationLoop(); /* Start animation loop */
			}
			else if (this.isPaused) { /* If game is paused */
				this.isPaused = false; /* Unpause */
				this.hideMessage(); /* Hide message */
				}
			else { /* If game is running */
				this.showMessage("Pause", "Click to Resume"); /* Show pause message */
				}
			}
		this.initializeGame = function (initMode) {
			
			console.log("Initializing game with mode: " + initMode); /* Log initialization mode */
			
			// Load Level Map configuration
			$.ajax({
				url: levelLayoutPath, /* Path to map configuration */
				async: false,         /* Synchronous request */
				 beforeSend: function(xhr){ /* Before sending request */
					if (xhr.overrideMimeType) xhr.overrideMimeType("application/json"); /* Override MIME type if supported */
				},
				dataType: "json", /* Expected data type */
				success: function (dataContent) { /* On successful data load */
					mainApp.currentMap = dataContent; /* Store map data */
				}
			});
		
			var temporaryCounter = 0; /* Counter for pills */
			$.each(this.currentMap.yPositions, function(indexY, mapRow) { /* Iterate through map rows */
			   $.each(mapRow.xPositions, function() { /* Iterate through columns in each row */
				   if (this.tileType == "pill") { /* If tile is a pill */
					temporaryCounter++; /* Increment pill counter */
					//console.log("Pill Count++. temporaryCounter="+temporaryCounter+". PillCount="+this.dotCount+".");
					}
				});
			});
			
			this.dotCount = temporaryCounter; /* Set total pill count */
	
			if (initMode == 0) { /* If starting a brand new game */
				this.playerScoreboard.resetScore(0); /* Reset score to zero */
				this.playerScoreboard.updateDisplay(".score"); /* Update score display */
				playerCharacter.livesRemaining = 3; /* Set initial lives */
				mainApp.difficultyLevel = 1; /* Reset level */
				mainApp.isGameOver = false; /* Clear game over flag */
				}
			playerCharacter.resetPosition(); /* Reset player's position and state */
			
			mainApp.drawPlayerLives(playerCharacter.livesRemaining); /* Draw player's lives */
			
			this.entitiesFrightened = false; /* Clear frightened state */
			this.frightenedDuration = 240; /* Reset frightened timer */
			this.entityStrategy = 0;            // 0 = Disperse, 1 = Pursue
			this.strategyTimer = 200;           // decrements each animationLoop execution
			
			// Initialize spectral entities, avoiding memory leaks
			if (roseSpecter == null) { /* If entities not yet created */
				roseSpecter = new SpectralEntity("rose", 7, 5, 'img/pinky.svg', 2, 2); /* Create rose specter */
				azureSpecter = new SpectralEntity("azure", 8, 5, 'img/inky.svg', 13, 11); /* Create azure specter */
				crimsonSpecter = new SpectralEntity("crimson", 9, 5, 'img/blinky.svg', 13, 0); /* Create crimson specter */
				ochreSpecter = new SpectralEntity("ochre", 10, 5, 'img/clyde.svg', 2, 11); /* Create ochre specter */
			}
			else {
				//console.log("spectral entities reset");
				roseSpecter.resetState(); /* Reset rose specter */
				azureSpecter.resetState(); /* Reset azure specter */
				crimsonSpecter.resetState(); /* Reset crimson specter */
				ochreSpecter.resetState(); /* Reset ochre specter */
			}
			crimsonSpecter.startMovement();	// crimson is the first to leave the spectral abode
			azureSpecter.startMovement();
			roseSpecter.startMovement();
			ochreSpecter.startMovement();
			}
		this.checkGameProgress = function() {
		if ((this.dotCount == 0) && mainApp.isActive) { /* If all pills collected and game is active */
				this.advanceLevel(); /* Advance to next level */
			}
		}
		this.playerWins = function () {} /* Placeholder for win condition */
		this.endGame = function () {} /* Placeholder for game over condition */
		this.gridToPixel = function (gridCoordinate) {
			return gridCoordinate * 30; /* Convert grid coordinate to pixel coordinate */
		}
		this.pixelToGrid = function (pixelCoordinate) {
			return ((pixelCoordinate % 30) / 30); /* Convert pixel coordinate to grid fraction */
		}

	}

	mainApp = new GameEngine(); /* Instantiate the main game engine */



	function PlayerScore() {
		this.currentValue = 0; /* The player's accumulated score */
		this.resetScore = function(value) {
			this.currentValue = value; /* Set score to a specific value */
		}
		this.addToScore = function(value) {
			this.currentValue += value; /* Add to the current score */
		}
		this.updateDisplay = function(htmlSelector) {
			$(htmlSelector).html("Score: " + this.currentValue); /* Update HTML element with score */
		}
		
	}
	
	
	
	// Utility for playing sound effects during gameplay
	var AudioPlayer = new Object(); /* Global audio player object */
	AudioPlayer.playEffect = function (effectName) {
		if (mainApp.audioEnabled == 1) { /* Check if audio is enabled */
			var soundElement = document.getElementById(effectName); /* Get audio element by ID */
			(soundElement != null) ? soundElement.play() : console.log(effectName + " not found"); /* Play if found, else log error */
			}
	}
	
	
	// Movement vector object in Constructor notation
	function MovementVector(label, arcStart, arcEnd, xComponent, yComponent) {
		this.label = label;       /* Descriptive name for the vector */
		this.arcStart = arcStart; /* Start angle for drawing (e.g., player mouth) */
		this.arcEnd = arcEnd;     /* End angle for drawing */
		this.xComponent = xComponent; /* X-axis movement component */
		this.yComponent = yComponent; /* Y-axis movement component */
		this.isEqual = function(otherVector) {
			/* Compares two MovementVector objects for equality */
			return  JSON.stringify(this) ==  JSON.stringify(otherVector);
		}
	}
	
	// Predefined MovementVector Objects
	var vectorUp = new MovementVector("upwards", 1.75, 1.25, 0, -1);		// Move UP
	var vectorLeft = new MovementVector("leftwards", 1.25, 0.75, -1, 0);	// Move LEFT
	var vectorDown = new MovementVector("downwards", 0.75, 0.25, 0, 1);		// Move DOWN
	var vectorRight = new MovementVector("rightwards", 0.25, 1.75, 1, 0);	// Move RIGHT
	/*var movementOptions = [{},{},{},{}];
	movementOptions[0] = vectorUp;
	movementOptions[1] = vectorDown;
	movementOptions[2] = vectorRight;
	movementOptions[3] = vectorLeft;*/
	
	
	// Tracks the player's desired movement
	function CurrentMovementTracker() {
		this.desiredVector = null; /* The currently desired movement direction */
		this.setVector = function(newVector) {
			this.desiredVector = newVector; /* Set a new desired vector */
			
		}
		this.getVector = function() {
			return this.desiredVector; /* Retrieve the current desired vector */
		}
		}
		
	//var currentMovementTracker = new CurrentMovementTracker();
	
	// Spectral entity object (ghost) in Constructor notation
	function SpectralEntity(entityName, startGridX, startGridY, visualAsset, baseGridX, baseGridY) {
		this.entityName = entityName; /* Identifier for this entity */
		this.currentX = startGridX * 30; /* Current pixel X position */
		this.currentY = startGridY * 30; /* Current pixel Y position */
		this.initialX = startGridX * 30; /* Starting pixel X position */
		this.initialY = startGridY * 30; /* Starting pixel Y position */
		this.homeGridX = baseGridX; /* X coordinate of home base in grid units */
		this.homeGridY = baseGridY; /* Y coordinate of home base in grid units */
		this.movementSpeed = 5; /* Pixels moved per game tick */
		this.visuals = JSON.parse(
			'{"normalState" : {'
				+ '"azure" : "0",'
				+ '"rose" : "1",'
				+ '"crimson" : "2",'
				+ '"ochre" : "3"'
				+ '},'
			+
			'"vulnerableState1" : {'
				+
				'"left" : "", "up": "", "right" : "", "down": ""},'
			+
			'"vulnerableState2" : {'
				+
				'"left" : "", "up": "", "right" : "", "down": ""},'
			+
			'"defeatedState" : {'
				+
				'"left" : "", "up": "", "right" : "", "down": ""}}'
			);
		this.entityImage = new Image(); /* Image object for normal state */
		this.entityImage.src = visualAsset; /* Set source for entity image */
		this.inSpectralAbode = true; /* Flag if entity is inside the ghost house */
		this.isVulnerable = false; /* Flag if entity is currently frightened/vulnerable */
		this.enterVulnerableState = function() {
			this.adjustSpeed(3); /* Reduce speed when vulnerable */
			// Ensure entity remains on grid after speed change
			if (this.currentX > 0) this.currentX = this.currentX - this.currentX % this.movementSpeed;
			if (this.currentY > 0) this.currentY = this.currentY - this.currentY % this.movementSpeed;
			this.isVulnerable = true; /* Set vulnerable flag */
		}
		this.exitVulnerableState = function() {
			// Only change speed if entity is not "defeated"
			if (!this.isDefeated) this.adjustSpeed(3); /* Restore normal speed (this seems like a bug, should restore default speed, not 3) */
			// Ensure entity remains on grid after speed change
			if (this.currentX > 0) this.currentX = this.currentX - this.currentX % this.movementSpeed;
			if (this.currentY > 0) this.currentY = this.currentY - this.currentY % this.movementSpeed;
			this.isVulnerable = false; /* Clear vulnerable flag */
		}
		this.vulnerableImage = new Image(); /* Image for vulnerable state (blue) */
		this.vulnerableImage.src = 'img/dazzled.svg'; /* Source for vulnerable image */
		this.vulnerableImageAlt = new Image(); /* Alternate image for flashing vulnerable state */
		this.vulnerableImageAlt.src = 'img/dazzled2.svg'; /* Source for flashing vulnerable image */
		this.defeatedImage = new Image(); /* Image for defeated state (eyes only) */
		this.defeatedImage.src = 'img/dead.svg'; /* Source for defeated image */
		this.currentDirection = vectorRight; /* Initial movement direction */
		this.entityRadius = playerCharacter.size; /* Radius of the entity for collision */
		this.drawEntity = function (renderingContext) {					
			if (this.isDefeated) { /* If entity is defeated */
				renderingContext.drawImage(this.defeatedImage, this.currentX, this.currentY, 2 * this.entityRadius, 2 * this.entityRadius); /* Draw defeated image */
			}
			else if (this.isVulnerable) { /* If entity is vulnerable */
				if (playerCharacter.powerPelletTimer < 50 && playerCharacter.powerPelletTimer % 8 > 1) { /* If timer is low and flashing */
					renderingContext.drawImage(this.vulnerableImageAlt, this.currentX, this.currentY, 2 * this.entityRadius, 2 * this.entityRadius); /* Draw flashing vulnerable image */
				} else {
					renderingContext.drawImage(this.vulnerableImage, this.currentX, this.currentY, 2 * this.entityRadius, 2 * this.entityRadius); /* Draw regular vulnerable image */
				}
			}
			else renderingContext.drawImage(this.entityImage, this.currentX, this.currentY, 2 * this.entityRadius, 2 * this.entityRadius); /* Draw normal image */
		}
		this.getCenterCoordX = function () {
			return this.currentX + this.entityRadius; /* Calculate center X coordinate */
		}
		this.getCenterCoordY = function () {
			return this.currentY + this.entityRadius; /* Calculate center Y coordinate */
		}
		
		this.resetState = function() {
			this.isDefeated = false; /* Clear defeated flag */
			this.currentX = this.initialX; /* Reset X position */
			this.currentY = this.initialY; /* Reset Y position */
			this.inSpectralAbode = true; /* Return to ghost house */
			this.exitVulnerableState(); /* Ensure not vulnerable */
		}
		
		this.beDefeated = function() {
			//this.resetState();
			this.isDefeated = true; /* Set defeated flag */
			this.adjustSpeed(5); /* Increase speed when defeated (returning to house) */
		}
		this.adjustSpeed = function(newSpeed) {
			// Adjust grid position to new speed to prevent misalignment
			this.currentX = Math.round(this.currentX / newSpeed) * newSpeed;
			this.currentY = Math.round(this.currentY / newSpeed) * newSpeed;
			this.movementSpeed = newSpeed; /* Set new speed */
		}
		
		this.moveEntity = function() {
		
			this.evaluateDirectionChange(); /* Determine if direction should change */
			this.detectCollisions(); /* Check for interactions with player or walls */
		
			// Logic for leaving the Spectral Abode
			if (this.inSpectralAbode == true) {
			
				// Ochre (Clyde) does not start chasing until 2/3 of all pills are consumed
				if (this.entityName == "ochre") {
					if ((mainApp.dotCount > 104 / 3)) this.shouldStop = true; /* Remain in house */
					else this.shouldStop = false; /* Can leave */
				}
				// Azure (Inky) starts after 30 pills are consumed
				if (this.entityName == "azure") {
					if ((mainApp.dotCount > 104 - 30)) this.shouldStop = true; /* Remain in house */
					else this.shouldStop = false; /* Can leave */
				}