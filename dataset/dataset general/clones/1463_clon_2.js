// This file orchestrates a dynamic image presentation widget.
// Version: 1.0 - (April 4, 2010)
// Requires jQuery version 1.2.2 or newer.
// Developed by a skilled engineer.
// Additional resources available at: http://example.com/project-showcase/

// Licensed under an open-source agreement:
//   http://www.opensource.org/licenses/mit-license.php

(function (JQueryAlias) {

	var	optionsMap		= [], // Collection of configuration sets for each instance
		sequence		= [], // Defines the display order of visual segments
		visuals			= [], // Array holding image source URLs
		hyperlinks		= [], // Associated link URLs for each visual
		hyperlinkTargets	= [], // Target attributes for the hyperlinks
		captions		= [], // Textual descriptions for images
		timerIDs		= [], // Main animation timer identifiers
		currentVisualIndex	= [], // Tracks the currently displayed visual's position
		displayTimerIDs		= [], // Timer for individual tile appearance
		tileDisplayCounter	= [], // Progress counter for tile display
		directionToggle		= [], // Controls sequence reversal
		uniqueComponentPrefix	= "visualComponentID", // Base string for unique IDs
		uniqueComponentCount	= 0; // Incremental counter for unique IDs

	JQueryAlias.fn.visualSlider = JQueryAlias.fn.VisualSlider = function (configSettings) {

		// Function to lay out the individual visual tiles
		var arrangeTiles = function (element) {

			var	baseTileWidth	= parseInt(optionsMap[element.id].width / optionsMap[element.id].spw), // Calculated base width for a tile
				currentTileWidth	= baseTileWidth, // Actual width for the current tile
				baseTileHeight	= parseInt(optionsMap[element.id].height / optionsMap[element.id].sph), // Calculated base height for a tile
				currentTileHeight	= baseTileHeight, // Actual height for the current tile
				loopCounter	= 0, // General counter for iterating
				currentLeftPosition	= 0, // X-coordinate for tile placement
				currentTopPosition	= 0, // Y-coordinate for tile placement
				rowIterator, // Loop variable for rows
				colIterator, // Loop variable for columns
				totalXGap	= optionsMap[element.id].width - optionsMap[element.id].spw * currentTileWidth, // Total horizontal pixel gap
				remainingXGap	= totalXGap, // Remaining horizontal gap to distribute
				totalYGap	= optionsMap[element.id].height - optionsMap[element.id].sph * currentTileHeight, // Total vertical pixel gap
				remainingYGap	= totalYGap; // Remaining vertical gap to distribute

			for (rowIterator = 1; rowIterator <= optionsMap[element.id].sph; rowIterator++) {
				remainingXGap = totalXGap; // Reset horizontal gap for each new row

				if (remainingYGap > 0) {
					remainingYGap--;
					currentTileHeight = baseTileHeight + 1; // Distribute extra height
				} else {
					currentTileHeight = baseTileHeight; // Use base height
				}

				for (colIterator = 1; colIterator <= optionsMap[element.id].spw; colIterator++) {

					if (remainingXGap > 0) {
						remainingXGap--;
						currentTileWidth = baseTileWidth + 1; // Distribute extra width
					} else {
						currentTileWidth = baseTileWidth; // Use base width
					}

					sequence[element.id][loopCounter] = rowIterator + "" + colIterator; // Store tile identifier
					loopCounter++;

					// Append either a link or a div for the tile
					if (optionsMap[element.id].links) {
						JQueryAlias('#' + element.id).append("<a href='" + hyperlinks[element.id][0] + "' class='vc-" + element.id + "' id='vc-" + element.id + rowIterator + colIterator + "' style='width:" + currentTileWidth + "px; height:" + currentTileHeight + "px; float: left; position: absolute;'></a>");
					} else {
						JQueryAlias('#' + element.id).append("<div class='vc-" + element.id + "' id='vc-" + element.id + rowIterator + colIterator + "' style='width:" + currentTileWidth + "px; height:" + currentTileHeight + "px; float: left; position: absolute;'></div>");
					}

					// Adjust background and position for each tile
					JQueryAlias("#vc-" + element.id + rowIterator + colIterator).css({
						'background-position': -currentLeftPosition + 'px ' + (-currentTopPosition + 'px'),
						'left' : currentLeftPosition,
						'top': currentTopPosition
					});

					currentLeftPosition += currentTileWidth; // Advance horizontal position
				}

				currentTopPosition += currentTileHeight; // Advance vertical position for next row
				currentLeftPosition = 0; // Reset horizontal position for new row

			}

			// Handle visibility of navigation controls based on configuration
			if (!optionsMap[element.id].navigationPrevNextAlwaysShown) {

				JQueryAlias('.vc-' + element.id).mouseover(function(){
					JQueryAlias('#vc-nav-controls-' + element.id).show();
				});

				JQueryAlias('.vc-' + element.id).mouseout(function(){
					JQueryAlias('#vc-nav-controls-' + element.id).hide();
				});

				JQueryAlias('#vc-caption-' + element.id).mouseover(function(){
					JQueryAlias('#vc-nav-controls-' + element.id).show();
				});

				JQueryAlias('#vc-caption-' + element.id).mouseout(function(){
					JQueryAlias('#vc-nav-controls-' + element.id).hide();
				});
			}

			// Implement pause on hover functionality
			if (optionsMap[element.id].hoverPause) {
				JQueryAlias('.vc-' + element.id).mouseover(function(){
					optionsMap[element.id].pause = true;
				});

				JQueryAlias('.vc-' + element.id).mouseout(function(){
					optionsMap[element.id].pause = false;
				});

				JQueryAlias('#vc-caption-' + element.id).mouseover(function(){
					optionsMap[element.id].pause = true;
				});

				JQueryAlias('#vc-caption-' + element.id).mouseout(function(){
					optionsMap[element.id].pause = false;
				});
			}

		}; // End of arrangeTiles function

		// Sets up the recurring transition mechanism
		var initiateTransitionCycle = function (element) {

			clearInterval(timerIDs[element.id]); // Clear any existing main timer
			var transitionDelay = optionsMap[element.id].delay + optionsMap[element.id].spw * optionsMap[element.id].sph * optionsMap[element.id].sDelay;
			timerIDs[element.id] = setInterval(function() { performTransition(element);  }, transitionDelay); // Start new timer

		};

		// Core function to execute an image transition
		var performTransition = function (element, flowDirection) {

			if(optionsMap[element.id].pause === true){
				return; // Exit if paused
			}

			applyEffect(element); // Determine and apply the visual effect

			tileDisplayCounter[element.id] = 0; // Reset tile display progress
			displayTimerIDs[element.id] = setInterval(function() { appereance(element,sequence[element.id][tileDisplayCounter[element.id]]);  },optionsMap[element.id].sDelay); // Start tile appearance timer

			// Set the background image for the main container
			JQueryAlias(element).css({ 'background-image': 'url("' + visuals[element.id][currentVisualIndex[element.id]] + '")' });

			// Determine the next image index
			if (typeof(flowDirection) == "undefined") {
				currentVisualIndex[element.id]++; // Move to next image
			} else {
				if (flowDirection == 'prev') {
					currentVisualIndex[element.id]--; // Move to previous image
				} else {
					currentVisualIndex[element.id] = flowDirection; // Jump to specific image
				}
			}

			// Wrap around logic for image index
			if (currentVisualIndex[element.id] == visuals[element.id].length) {
				currentVisualIndex[element.id] = 0;
			}

			if (currentVisualIndex[element.id] == -1) {
				currentVisualIndex[element.id] = visuals[element.id].length-1;
			}

			// Update navigation buttons' active state
			JQueryAlias('.vc-button-' + element.id).removeClass('vc-active');
			JQueryAlias('#vc-button-' + element.id + "-" + (currentVisualIndex[element.id] + 1)).addClass('vc-active');

			// Display or hide the image caption
			if (captions[element.id][currentVisualIndex[element.id]]) {
				JQueryAlias('#vc-caption-' + element.id).css({ 'opacity' : 0 }).animate({ 'opacity' : optionsMap[element.id].opacity }, optionsMap[element.id].titleSpeed);
				JQueryAlias('#vc-caption-' + element.id).html(captions[element.id][currentVisualIndex[element.id]]);
			} else {
				JQueryAlias('#vc-caption-' + element.id).css('opacity',0);
			}

		}; // End of performTransition function

		// Manages the gradual appearance of individual tiles
		var appereance = function (element, tileIdentifier) {

			// Update tile's link and target based on current visual
			JQueryAlias('.vc-' + element.id).attr('href',hyperlinks[element.id][currentVisualIndex[element.id]]).attr('target',hyperlinkTargets[element.id][currentVisualIndex[element.id]]);

			// If all tiles have appeared, clear the timer
			if (tileDisplayCounter[element.id] == optionsMap[element.id].spw * optionsMap[element.id].sph) {
				clearInterval(displayTimerIDs[element.id]);
				return;
			}

			// Animate the current tile's opacity and set its background
			JQueryAlias('#vc-' + element.id + tileIdentifier).css({ opacity: 0, 'background-image': 'url("' + visuals[element.id][currentVisualIndex[element.id]] + '")' });
			JQueryAlias('#vc-' + element.id + tileIdentifier).animate({ opacity: 1 }, 300);
			tileDisplayCounter[element.id]++; // Increment tile counter

		}; // End of appereance function

		// Configures and adds navigation elements
		var setupNavigationControls = function (element) {
			// Create 'previous' and 'next' buttons if enabled
			if (optionsMap[element.id].showNavigationPrevNext) {
				JQueryAlias(element).append("<div id='vc-nav-controls-" + element.id + "'></div>");

				if (!optionsMap[element.id].navigationPrevNextAlwaysShown) {
					JQueryAlias('#vc-nav-controls-' + element.id).hide(); // Hide by default if not always shown
				}

				JQueryAlias('#vc-nav-controls-' + element.id).append("<a href='#' id='vc-prev-" + element.id + "' class='vc-prev'>"+optionsMap[element.id].prevText+"</a>");
				JQueryAlias('#vc-nav-controls-' + element.id).append("<a href='#' id='vc-next-" + element.id + "' class='vc-next'>"+optionsMap[element.id].nextText+"</a>");
				JQueryAlias('#vc-prev-' + element.id).css({
					'position'		: 'absolute',
					'top'			: optionsMap[element.id].height / 2 - 15,
					'left'			: 0,
					'z-index'		: 1001,
					'line-height'	: '30px',
					'opacity'		: optionsMap[element.id].opacity
				}).click( function(eventObj){
					eventObj.preventDefault(); // Prevent default link behavior
					performTransition(element,'prev'); // Trigger previous transition
					initiateTransitionCycle(element); // Reset timer
				}).mouseover( function(){ JQueryAlias('#vc-nav-controls-' + element.id).show(); }); // Show nav on hover

				JQueryAlias('#vc-next-' + element.id).css({
					'position'		: 'absolute',
					'top'			: optionsMap[element.id].height / 2 - 15,
					'right'			: 0,
					'z-index'		: 1001,
					'line-height'	: '30px',
					'opacity'		: optionsMap[element.id].opacity
				}).click( function(eventObj){
					eventObj.preventDefault(); // Prevent default link behavior
					performTransition(element); // Trigger next transition
					initiateTransitionCycle(element); // Reset timer
				}).mouseover( function(){ JQueryAlias('#vc-nav-controls-' + element.id).show(); }); // Show nav on hover

				JQueryAlias('#vc-nav-controls-' + element.id + ' a').mouseout(function(){
					if (!optionsMap[element.id].navigationPrevNextAlwaysShown)
						JQueryAlias('#vc-nav-controls-' + element.id).hide(); // Hide nav if not always shown

					optionsMap[element.id].pause = false; // Ensure slider is not paused
				});
			}

			// Add individual image selection buttons if enabled
			if (optionsMap[element.id].showNavigationButtons) {
				JQueryAlias("<div id='vc-buttons-" + element.id + "' class='vc-buttons'></div>").appendTo(JQueryAlias('#component-container-' + element.id));

				var buttonIterator;
				for (buttonIterator = 1; buttonIterator < visuals[element.id].length + 1; buttonIterator++){
					JQueryAlias('#vc-buttons-' + element.id).append("<a href='#' class='vc-button-" + element.id + "' id='vc-button-" + element.id + "-" + buttonIterator + "'>" + buttonIterator + "</a>");
				}

				JQueryAlias.each(JQueryAlias('.vc-button-' + element.id), function(index,buttonElement){
					JQueryAlias(buttonElement).click( function(eventObj){
						JQueryAlias('.vc-button-' + element.id).removeClass('vc-active'); // Remove active from others
						JQueryAlias(this).addClass('vc-active'); // Set current button active
						eventObj.preventDefault(); // Prevent default link behavior
						performTransition(element,index); // Jump to selected image
						initiateTransitionCycle(element); // Reset timer
					});
				});

				JQueryAlias("#vc-buttons-" + element.id).css({
					'left'			: '50%',
					'margin-left'	: -visuals[element.id].length * 15 / 2 - 5,
					'position'		: 'relative'
				});
			}

		}; // End of setupNavigationControls function

		// Manages the selection and application of transition effects
		var applyEffect = function (element) {
			var effectOptions = ['random','swirl','rain','straight'], // Available effect types
				rowIterator,
				colIterator,
				loopCounter,
				chosenEffect;

			// Choose a random effect if none is specified
			if (optionsMap[element.id].effect === '') {
				chosenEffect = effectOptions[Math.floor(Math.random() * (effectOptions.length))];
			} else {
				chosenEffect = optionsMap[element.id].effect; // Use the configured effect
			}

			sequence[element.id] = []; // Clear previous sequence

			// Apply the chosen effect to populate the sequence array
			if (chosenEffect == 'random') {
				loopCounter = 0;
					for (rowIterator = 1; rowIterator <= optionsMap[element.id].sph; rowIterator++) {
						for (colIterator = 1; colIterator <= optionsMap[element.id].spw; colIterator++) {
							sequence[element.id][loopCounter] = rowIterator + "" + colIterator;
							loopCounter++;
						}
					}
				shuffleArray(sequence[element.id]); // Randomize the order
			}

			if (chosenEffect == 'rain') {
				rainfallEffect(element);
			}

			if (chosenEffect == 'swirl') {
				spiralEffect(element);
			}

			if (chosenEffect == 'straight') {
				linearEffect(element);
			}

			directionToggle[element.id] *= -1; // Flip direction for next effect

			if (directionToggle[element.id] > 0) {
				sequence[element.id].reverse(); // Reverse the sequence if toggle is positive
			}

		}; // End of applyEffect function

		// Utility function to randomize array elements
		var shuffleArray = function (inputArray) {

			var arrayLength = inputArray.length,
				randomIndex,
				tempValI,
				tempValJ;

			if ( arrayLength === 0 ) {
				return false; // Nothing to shuffle
			}

			while ( --arrayLength ) {
				randomIndex = Math.floor( Math.random() * ( arrayLength + 1 ) ); // Pick a random index
				tempValI = inputArray[arrayLength]; // Store current element
				tempValJ = inputArray[randomIndex]; // Store random element
				inputArray[arrayLength] = tempValJ; // Swap elements
				inputArray[randomIndex] = tempValI;
			}
		}; // End of shuffleArray function

		// Implements a spiral tile display effect
		var spiralEffect = function (element) {

			var numRows = optionsMap[element.id].sph, // Number of rows
				numCols = optionsMap[element.id].spw, // Number of columns
				currentRow = 1, // Current row coordinate
				currentCol = 1, // Current column coordinate
				directionIndex = 0, // Current direction (0:right, 1:down, 2:left, 3:up)
				segmentLength = 0, // Length of the current spiral segment
				tileIndex = 0, // Index for the sequence array
				boundaryCheck, // Used for loop termination
				continueLoop = true, // Loop control flag
				iteratorVar; // Loop counter

			while (continueLoop) {

				segmentLength = (directionIndex === 0 || directionIndex === 2) ? numCols : numRows; // Determine segment length

				for (iteratorVar = 1; iteratorVar <= segmentLength; iteratorVar++){

					sequence[element.id][tileIndex] = currentRow + "" + currentCol; // Add tile to sequence
					tileIndex++;

					if (iteratorVar != segmentLength) { // Move to next tile in current segment
						switch(directionIndex){
							case 0 : currentCol++; break;
							case 1 : currentRow++; break;
							case 2 : currentCol--; break;
							case 3 : currentRow--; break;

						}
					}
				}

				directionIndex = (directionIndex + 1) % 4; // Rotate direction

				// Adjust boundaries and current position for the next segment
				switch (directionIndex) {
					case 0 : numCols--; currentCol++; break;
					case 1 : numRows--; currentRow++; break;
					case 2 : numCols--; currentCol--; break;
					case 3 : numRows--; currentRow--; break;
				}

				boundaryCheck = findMaximum(numRows,numCols) - findMinimum(numRows,numCols); // Check for loop termination
				if (numCols <= boundaryCheck && numRows <= boundaryCheck) {
					continueLoop = false; // Terminate loop if boundaries cross
				}

			}
		}; // End of spiralEffect function

		// Implements a diagonal "rain" tile display effect
		var rainfallEffect = function (element) {

			var numRows = optionsMap[element.id].sph, // Total rows
				numCols = optionsMap[element.id].spw, // Total columns
				tileIndex = 0, // Index for sequence array
				upperBound = 1, // Upper limit for row/col iterator
				diagonalOffset = 1, // Controls diagonal progression
				lowerBound = 1, // Lower limit for row/col iterator
				continueLoop = true, // Loop control
				iteratorVar; // Loop counter

			while (continueLoop) {

				for (iteratorVar = lowerBound; iteratorVar <= upperBound; iteratorVar++) {
					sequence[element.id][tileIndex] = iteratorVar + '' + parseInt(diagonalOffset - iteratorVar + 1); // Calculate tile ID
					tileIndex++;
			}

				diagonalOffset++; // Advance diagonal offset

				// Adjust bounds for the next diagonal line
				if (upperBound < numRows && diagonalOffset < numCols && numRows < numCols) {
					upperBound++;
				}

				if (upperBound < numRows && numRows >= numCols) {
					upperBound++;
				}

				if (diagonalOffset > numCols) {
					lowerBound++;
				}

				if (lowerBound > upperBound) {
					continueLoop= false; // Terminate when bounds cross
				}

			}

		}; // End of rainfallEffect function

		// Implements a simple linear tile display effect
		var linearEffect = function (element) {
			var tileCounter = 0, // Counter for array index
				rowIterator,
				colIterator;

			for (rowIterator = 1; rowIterator <= optionsMap[element.id].sph; rowIterator++) {
				for (colIterator = 1; colIterator <= optionsMap[element.id].spw; colIterator++) {
					sequence[element.id][tileCounter] = rowIterator + '' + colIterator; // Add tiles in row-major order
					tileCounter++;
				}
			}
		}; // End of linearEffect function

		// Helper function to find the minimum of two numbers
		var findMinimum = function (val1, val2) {
			if (val1 > val2) {
				return val2;
			} else {
				return val1;
			}
		};

		// Helper function to find the maximum of two numbers
		var findMaximum = function (val1, val2) {
			if (val1 < val2) {
				return val2;
			} else {
				return val1;
			}
		};

		// Initializes the visual slider component
		var initializeSlider = function (element) {

			// Assign a unique ID if the element doesn't have one
			if( element.id === '' ){
				element.id = uniqueComponentPrefix + uniqueComponentCount++;
			}

			sequence[element.id]		= [];	// Initialize sequence for tile display
			visuals[element.id]		= [];	// Initialize visuals array
			hyperlinks[element.id]		= [];	// Initialize hyperlinks array
			hyperlinkTargets[element.id]	= [];	// Initialize hyperlink targets array
			captions[element.id]		= [];	// Initialize captions array
			currentVisualIndex[element.id]	= 0;	// Start at the first visual
			tileDisplayCounter[element.id]	= 0;	// Reset tile display counter
			directionToggle[element.id]	= 1;	// Initial direction for effects

			// Merge default settings with user-provided configurations
			optionsMap[element.id] = JQueryAlias.extend({}, JQueryAlias.fn.visualSlider.standardSettings, configSettings);

			// Populate visual, link, and caption arrays from existing DOM elements
			JQueryAlias.each(JQueryAlias('#' + element.id + ' img'), function (index, imageElement) {
				visuals[element.id][index]		= JQueryAlias(imageElement).attr('src');
				hyperlinks[element.id][index]		= JQueryAlias(imageElement).parent().is('a') ? JQueryAlias(imageElement).parent().attr('href') : '';
				hyperlinkTargets[element.id][index]	= JQueryAlias(imageElement).parent().is('a') ? JQueryAlias(imageElement).parent().attr('target') : '';
				captions[element.id][index]		= JQueryAlias(imageElement).next().is('span') ? JQueryAlias(imageElement).next().html() : '';
				JQueryAlias(imageElement).hide(); // Hide original image
				JQueryAlias(imageElement).next().hide(); // Hide original caption span
			});

			// Configure the main container for the slider
			JQueryAlias(element).css({
				'background-image': 'url("' + visuals[element.id][0] + '")',
				'width': optionsMap[element.id].width,
				'height': optionsMap[element.id].height,
				'position': 'relative',
				'background-position': 'top left'
			}).wrap("<div class='component-container' id='component-container-" + element.id + "' />");

			// Create and append the caption bar
			JQueryAlias('#' + element.id).append("<div class='vc-caption' id='vc-caption-" + element.id + "' style='position: absolute; bottom:0; left: 0; z-index: 1000;'></div>");

			arrangeTiles(element); // Lay out the visual tiles

			// If navigation is enabled, set up controls and start the cycle
			if(optionsMap[element.id].navigation){
				setupNavigationControls(element);
				performTransition(element); // Initial display
				initiateTransitionCycle(element); // Start automated cycling
			}

		}; // End of initializeSlider function

		// Iterate over each selected element and initialize the slider
		return this.each (function () {
			initializeSlider(this);
		});

	}; // End of JQueryAlias.fn.visualSlider definition

	// Default configuration settings for the visual slider
	JQueryAlias.fn.visualSlider.standardSettings = {
		width: 560, // Width of the visual slider
		height: 300, // Height of the visual slider
		spw: 7, // Number of squares per width
		sph: 5, // Number of squares per height
		delay: 3000, // Delay between transitions
		sDelay: 30, // Delay between individual square appearances
		opacity: 0.7, // Opacity of the caption bar
		titleSpeed: 500, // Speed of caption animation
		effect: 'random', // Default transition effect
		navigation: true, // Show navigation controls
		links: true, // Enable links on images
		hoverPause: true, // Pause on mouse hover
		showNavigationPrevNext: true, // Show previous/next buttons
		showNavigationButtons: true, // Show individual image buttons
		navigationPrevNextAlwaysShown: false, // Prev/next always visible or only on hover
		prevText: 'Prev', // Text for previous button
		nextText: 'Next' // Text for next button
	};

})(jQuery);