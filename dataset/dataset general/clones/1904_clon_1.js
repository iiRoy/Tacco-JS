/*-------------------------------------------------------------------

	___________    ____   _____ _____    ____
	\____ \__  \ _/ ___\ /     \\__  \  /    \
	|  |_> > __ \\  \___|  Y Y  \/ __ \|   |  \
	|   __(____  /\___  >__|_|  (____  /___|  /
	|__|       \/     \/      \/     \/     \/ .platzh1rsch.ch

	author: platzh1rsch		(www.platzh1rsch.ch)

	This section contains a cool ASCII art logo.
	It's pretty neat, isn't it?
	And a note about the author.
	
-------------------------------------------------------------------*/


/* ----- Global Variables ---------------------------------------- */
	var canvas; // The main canvas element
	var joystick; // Controls for player movement
	var context; // 2D rendering context for the main canvas
	var game; // The primary game object
	var canvas_walls, context_walls; // Canvas and context specifically for drawing walls
	var inky, blinky, clyde, pinky; // The four ghosts in the game

	var mapConfig = 'data/map.json'; // Path to the map configuration file

	// AJAX related functions for highscore management
	/* AJAX stuff */
	function getHighscore() {
		// Asynchronously fetches the highscore list after a short delay
		setTimeout(ajax_get, 30);
	}
	function ajax_get() {
		// Performs an AJAX GET request to retrieve highscores
		date = new Date().getTime(); // Current timestamp for cache busting
		$.ajax({
			datatype: "json",
			type: "GET",
			url: "data/db-handler.php",
			data: {
				timestamp: date,
				action: 'get'
			},
			success: function(msg) {
				// Clears the current highscore list and populates it with new data
				$("#highscore-list").text("");
				for (var i = 0; i < msg.length; i++) {
					$("#highscore-list").append("<li>" + msg[i]['name'] + "<span id='score'>" + msg[i]['score'] + "</span></li>");
				}
			}
		});
	}
	function ajax_add(n, s) {
		// Performs an AJAX POST request to add a new highscore
		$.ajax({
			type: "POST",
			url: "data/db-handler.php",
			data: {
				action: 'add',
				name: n,
				score: s
			}
		});
	}
	function addHighscore() {
		// Adds the current player's score to the highscore list and updates the form
		ajax_add($("input[type=text]").val(), game.score.score);
		$("#highscore-form").html('<span class="button" onClick="game.showContent(\'highscore-content\');getHighscore();">view highscore</span>');
	}

	function buildWall(context, gridX, gridY, width, height) {
		// Draws a wall segment on the provided canvas context
		console.log("BuildWall"); // Log wall creation
		width = width * 2 - 1; // Adjust width for drawing
		height = height * 2 - 1; // Adjust height for drawing
		context.fillRect(pacman.radius / 2 + gridX * 2 * pacman.radius, pacman.radius / 2 + gridY * 2 * pacman.radius, width * pacman.radius, height * pacman.radius);
	}

	function between(x, min, max) {
		// Checks if a value x is within a specified range [min, max]
		return x >= min && x <= max;
	}


	// Logger utility for enabling/disabling console logs
	// Logger
	var logger = function() {
		var oldConsoleLog = null; // Stores the original console.log function
		var pub = {}; // Public interface of the logger

		pub.enableLogger = function enableLogger() {
			// Restores the original console.log
			if (oldConsoleLog == null)
				return;

			window['console']['log'] = oldConsoleLog;
		};

		pub.disableLogger = function disableLogger() {
			// Replaces console.log with an empty function, effectively disabling it
			oldConsoleLog = console.log;
			window['console']['log'] = function() {};
		};

		return pub;
	}(); // Immediately invoked function expression to create the logger instance

	// Manages the whole game ("God Object")
	function Game() {
		this.refreshRate = 33; // Speed of the game, will increase in higher levels
		this.running = false; // Is the game loop currently active?
		this.pause = true; // Is the game currently paused?
		this.score = new Score(); // Manages the player's score
		this.soundfx = 0; // Sound effects toggle (0 = off, 1 = on)
		this.map; // The game map data
		this.pillCount; // Number of pills remaining on the map
		this.monsters; // Array of monster/ghost objects (not explicitly used here but implied)
		this.level = 1; // Current game level
		this.gameOver = false; // Is the game over?
		this.canvas = $("#myCanvas").get(0); // Reference to the main canvas DOM element
		this.width = this.canvas.width; // Width of the canvas
		this.height = this.canvas.height; // Height of the canvas

		this.ghostFrightened = false; // Are ghosts currently in frightened mode?
		this.ghostFrightenedTimer = 240; // Duration of frightened mode
		this.ghostMode = 0; // Current ghost mode (0 = Scatter, 1 = Chase)
		this.ghostModeTimer = 200; // Timer for ghost mode changes (decrements each animationLoop execution)

		/* Game Functions */
		this.startGhostFrightened = function() {
			// Initiates the ghost frightened mode
			console.log("ghost frigthened");
			this.ghostFrightened = true;
			this.ghostFrightenedTimer = 240;
			inky.dazzle();
			pinky.dazzle();
			blinky.dazzle();
			clyde.dazzle();
		}
		this.endGhostFrightened = function() {
			// Ends the ghost frightened mode
			console.log("ghost frigthened end");
			this.ghostFrightened = false;
			inky.undazzle();
			pinky.undazzle();
			blinky.undazzle();
			clyde.undazzle();
		};


		this.checkGhostMode = function() {
			// Manages the timers and transitions for ghost modes
			if (this.ghostFrightened) {

				this.ghostFrightenedTimer--;
				if (this.ghostFrightenedTimer == 0) {
					this.endGhostFrightened();
					this.ghostFrigthenedTimer = 240; // Reset timer for next frightened phase
					/*inky.reverseDirection(); // These lines are commented out,
					pinky.reverseDirection(); // suggesting a feature that was
					clyde.reverseDirection(); // considered but not implemented
					blinky.reverseDirection();*/ // or moved.
				}
			} else {
				this.ghostModeTimer--;
				if (this.ghostModeTimer == 0) {
					console.log("ghostMode=" + this.ghostMode);
					this.ghostMode ^= 1; // Toggles between 0 and 1 (Scatter and Chase)
					this.ghostModeTimer = 200 + this.ghostMode * 450; // Adjusts timer based on new mode
					/*inky.reverseDirection(); // Similar commented lines as above
					pinky.reverseDirection();
					clyde.reverseDirection();
					blinky.reverseDirection();*/
				}
			}
		}

		this.getMapContent = function(x, y) {
			// Retrieves the content of a specific grid cell on the map, handling wrapping
			var maxX = game.width / 30 - 1;
			var maxY = game.height / 30 - 1;
			if (x < 0) x = maxX + x;
			if (x > maxX) x = x - maxX;
			if (y < 0) y = maxY + y;
			if (y > maxY) y = y - maxY;
			return this.map.posY[y].posX[x].type;
		}
		this.setMapContent = function(x, y, val) {
			// Sets the content of a specific grid cell on the map
			this.map.posY[y].posX[x].type = val;
		}

		this.toggleSound = function() {
			// Toggles sound effects on/off
			this.soundfx == 0 ? this.soundfx = 1 : this.soundfx = 0;
			$('#mute').toggle(); // Toggles visibility of a mute indicator
		}
		this.reset = function() {
			// Placeholder for game reset logic (currently empty)
		}
		this.newGame = function() {
			// Starts a new game after user confirmation
			var r = confirm("Are you sure you want to restart?");
			if (r) {
				console.log("new Game");
				this.init(0); // Initialize game from scratch
			}
			this.pauseResume(); // Resume game if it was paused
		}
		this.nextLevel = function() {
			// Advances to the next game level
			this.level++;
			console.log("Level " + game.level);
			game.showMessage("Level " + game.level, "Level up! Click to continue!");
			this.init(1); // Initialize game for the next level, keeping score/lives
		}
		this.drawHearts = function(count) {
			// Draws heart icons to represent player lives
			var html = "";
			for (i = 0; i < count; i++) {
				html += " <img src='img/heart.png'>";
			}
			$(".lives").html("Lives: " + html);

		}
		this.showContent = function(id) {
			// Shows a specific content div and hides others
			$('.content').hide();
			$('#' + id).show();
		}
		this.showMessage = function(title, text) {
			// Displays an overlay message and pauses the game
			this.pause = true;
			$('#canvas-overlay-container').fadeIn(200);
			if ($('.controls').css('display') != "none") $('.controls').slideToggle(200); // Hide controls if visible
			$('#canvas-overlay-content #title').text(title);
			$('#canvas-overlay-content #text').html(text);
		}
		this.closeMessage = function() {
			// Hides the overlay message
			$('#canvas-overlay-container').fadeOut(200);
			$('.controls').slideToggle(200); // Show controls again
		}
		this.pauseResume = function() {
			// Toggles the game's pause state
			if (!this.running) {
				this.pause = false;
				this.running = true;
				this.closeMessage();
				animationLoop(); // Start the animation loop
			} else if (this.pause) {
				this.pause = false;
				this.closeMessage();
			} else {
				this.showMessage("Pause", "Click to Resume"); // Display pause message
			}
		}
		this.init = function(state) {
			// Initializes or re-initializes game elements
			console.log("init game " + state);

			// get Level Map via AJAX
			$.ajax({
				url: mapConfig,
				async: false, // Synchronous request to ensure map is loaded before proceeding
				beforeSend: function(xhr) {
					if (xhr.overrideMimeType) xhr.overrideMimeType("application/json");
				},
				dataType: "json",
				success: function(data) {
					game.map = data; // Assign loaded map data
				}
			});

			var temp = 0;
			// Count total pills on the map
			$.each(this.map.posY, function(i, item) {
				$.each(this.posX, function() {
					if (this.type == "pill") {
						temp++;
						//console.log("Pill Count++. temp="+temp+". PillCount="+this.pillCount+".");
					}
				});
			});

			this.pillCount = temp; // Store the initial pill count

			if (state == 0) { // If starting a completely new game
				this.score.set(0); // Reset score
				this.score.refresh(".score"); // Update score display
				pacman.lives = 3; // Reset Pacman's lives
				game.level = 1; // Reset level
				game.gameOver = false; // Game is not over
			}
			pacman.reset(); // Reset Pacman's position and state

			game.drawHearts(pacman.lives); // Redraw lives display

			this.ghostFrightened = false; // Reset ghost frightened state
			this.ghostFrightenedTimer = 240;
			this.ghostMode = 0; // 0 = Scatter, 1 = Chase
			this.ghostModeTimer = 200; // decrements each animationLoop execution

			// Initialize Ghosts, avoid memory flooding by checking if they already exist
			if (pinky == null) {
				pinky = new Ghost("pinky", 7, 5, 'img/pinky.svg', 2, 2);
				inky = new Ghost("inky", 8, 5, 'img/inky.svg', 13, 11);
				blinky = new Ghost("blinky", 9, 5, 'img/blinky.svg', 13, 0);
				clyde = new Ghost("clyde", 10, 5, 'img/clyde.svg', 2, 11);
			} else {
				//console.log("ghosts reset");
				pinky.reset(); // Reset existing ghosts
				inky.reset();
				blinky.reset();
				clyde.reset();
			}
			blinky.start(); // Blinky is the first to leave ghostHouse
			inky.start();
			pinky.start();
			clyde.start();
		}
		this.check = function() {
			// Checks game conditions, e.g., if all pills are eaten
			if ((this.pillCount == 0) && game.running) {
				this.nextLevel();
			}
		}
		this.win = function() {} // Placeholder for win condition logic
		this.gameover = function() {} // Placeholder for game over logic
		this.toPixelPos = function(gridPos) {
			// Converts a grid position to a pixel position
			return gridPos * 30;
		}
		this.toGridPos = function(pixelPos) {
			// Converts a pixel position to a fractional grid position
			return ((pixelPos % 30) / 30);
		}

	}

	game = new Game(); // Create the global game instance



	function Score() {
		this.score = 0; // Current score value
		this.set = function(i) {
			// Sets the score to a specific value
			this.score = i;
		}
		this.add = function(i) {
			// Adds points to the current score
			this.score += i;
		}
		this.refresh = function(h) {
			// Updates the score display in the DOM
			$(h).html("Score: " + this.score);
		}

	}



	// Utility object to play sounds during the game
	var Sound = new Object();
	Sound.play = function(sound) {
		if (game.soundfx == 1) {
			var audio = document.getElementById(sound);
			(audio != null) ? audio.play(): console.log(sound + " not found"); // Play sound if found, otherwise log error
		}
	}


	// Direction object in Constructor notation
	function Direction(name, angle1, angle2, dirX, dirY) {
		this.name = name; // Name of the direction (e.g., "up")
		this.angle1 = angle1; // Start angle for Pacman's mouth animation
		this.angle2 = angle2; // End angle for Pacman's mouth animation
		this.dirX = dirX; // X-component of the direction vector
		this.dirY = dirY; // Y-component of the direction vector
		this.equals = function(dir) {
			// Compares two Direction objects for equality
			return JSON.stringify(this) == JSON.stringify(dir);
		}
	}

	// Predefined Direction Objects for convenience
	// Direction Objects
	var up = new Direction("up", 1.75, 1.25, 0, -1); // UP direction
	var left = new Direction("left", 1.25, 0.75, -1, 0); // LEFT direction
	var down = new Direction("down", 0.75, 0.25, 0, 1); // DOWN direction
	var right = new Direction("right", 0.25, 1.75, 1, 0); // RIGHT direction
	/*var directions = [{},{},{},{}]; // Example of an array of directions (commented out)
	directions[0] = up;
	directions[1] = down;
	directions[2] = right;
	directions[3] = left;*/


	// DirectionWatcher
	function directionWatcher() {
		this.dir = null; // Stores the current direction
		this.set = function(dir) {
			// Sets the current direction
			this.dir = dir;

		}
		this.get = function() {
			// Retrieves the current direction
			return this.dir;
		}
	}

	//var directionWatcher = new directionWatcher(); // Example of creating an instance (commented out)

	// Ghost object in Constructor notation
	function Ghost(name, gridPosX, gridPosY, image, gridBaseX, gridBaseY) {
		this.name = name; // Name of the ghost (e.g., "pinky")
		this.posX = gridPosX * 30; // Current X pixel position
		this.posY = gridPosY * 30; // Current Y pixel position
		this.startPosX = gridPosX * 30; // Initial X pixel position
		this.startPosY = gridPosY * 30; // Initial Y pixel position
		this.gridBaseX = gridBaseX; // Base X grid position (for scatter mode)
		this.gridBaseY = gridBaseY; // Base Y grid position (for scatter mode)
		this.speed = 5; // Movement speed of the ghost
		// JSON string defining image paths for different ghost states
		this.images = JSON.parse(
			'{"normal" : {' +
			'"inky" : "0",' +
			'"pinky" : "1",' +
			'"blinky" : "2",' +
			'"clyde" : "3"' +
			'},' +
			'"frightened1" : {' +
			'"left" : "", "up": "", "right" : "", "down": ""},' +
			'"frightened2" : {' +
			'"left" : "", "up": "", "right" : "", "down": ""},' +
			'"dead" : {' +
			'"left" : "", "up": "", "right" : "", "down": ""}}'
		);
		this.image = new Image(); // Image object for the ghost's normal appearance
		this.image.src = image; // Source path for the normal image
		this.ghostHouse = true; // Is the ghost currently in the ghost house?
		this.dazzled = false; // Is the ghost in frightened (dazzled) mode?
		this.dazzle = function() {
			// Puts the ghost into frightened mode
			this.changeSpeed(3); // Reduce speed
			// Ensure ghost aligns to grid after speed change
			if (this.posX > 0) this.posX = this.posX - this.posX % this.speed;
			if (this.posY > 0) this.posY = this.posY - this.posY % this.speed;
			this.dazzled = true;
		}
		this.undazzle = function() {
			// Takes the ghost out of frightened mode
			// only change speed if ghost is not "dead"
			if (!this.dead) this.changeSpeed(3); // Restore normal speed if not dead
			// ensure ghost doesnt leave grid
			if (this.posX > 0) this.posX = this.posX - this.posX % this.speed;
			if (this.posY > 0) this.posY = this.posY - this.posY % this.speed;
			this.dazzled = false;
		}
		this.dazzleImg = new Image(); // Image for frightened state (blue)
		this.dazzleImg.src = 'img/dazzled.svg';
		this.dazzleImg2 = new Image(); // Image for flashing frightened state
		this.dazzleImg2.src = 'img/dazzled2.svg';
		this.deadImg = new Image(); // Image for dead state (eyes only)
		this.deadImg.src = 'img/dead.svg';
		this.direction = right; // Initial direction of the ghost
		this.radius = pacman.radius; // Radius of the ghost (for drawing and collision)
		this.draw = function(context) {
			// Draws the ghost on the canvas based on its current state
			if (this.dead) {
				context.drawImage(this.deadImg, this.posX, this.posY, 2 * this.radius, 2 * this.radius);
			} else if (this.dazzled) {
				// Flash between dazzleImg and dazzleImg2 near end of frightened mode
				if (pacman.beastModeTimer < 50 && pacman.beastModeTimer % 8 > 1) {
					context.drawImage(this.dazzleImg2, this.posX, this.posY, 2 * this.radius, 2 * this.radius);
				} else {
					context.drawImage(this.dazzleImg, this.posX, this.posY, 2 * this.radius, 2 * this.radius);
				}
			} else context.drawImage(this.image, this.posX, this.posY, 2 * this.radius, 2 * this.radius);
		}
		this.getCenterX = function() {
			// Returns the pixel X coordinate of the ghost's center
			return this.posX + this.radius;
		}
		this.getCenterY = function() {
			// Returns the pixel Y coordinate of the ghost's center
			return this.posY + this.radius;
		}

		this.reset = function() {
			// Resets the ghost to its initial state and position
			this.dead = false;
			this.posX = this.startPosX;
			this.posY = this.startPosY;
			this.ghostHouse = true;
			this.undazzle(); // Ensure it's not dazzled
		}

		this.die = function() {
			// Marks the ghost as dead and changes its speed
			//this.reset(); // (Commented out: would reset position immediately)
			this.dead = true;
			this.changeSpeed(5); // Increase speed when dead (returning to ghost house)
		}
		this.changeSpeed = function(s) {
			// Changes the ghost's speed and adjusts its position to stay on the grid
			// adjust gridPosition to new speed
			this.posX = Math.round(this.posX / s) * s;
			this.posY = Math.round(this.posY / s) * s;
			this.speed = s;
		}

		this.move = function() {

			this.checkDirectionChange(); // Determine if the ghost should change direction
			this.checkCollision(); // Check for collisions with Pacman

			// Logic for ghosts leaving the Ghost House
			if (this.ghostHouse == true) {

				// Clyde does not start chasing before 2/3 of all pills are eaten
				if (this.name == "clyde") {
					if ((game.pillCount > 104 / 3)) this.stop = true; // Stop if too many pills remain
					else this.stop = false; // Start if enough pills are eaten
				}
				// Inky starts after 30 pills have been eaten (104 - 30 remaining)
				if (this.name == "inky") {
					if ((game.pillCount > 104 - 30)) this.stop = true;
					else this.stop = false;
				}