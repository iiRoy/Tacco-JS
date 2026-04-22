(function (jq) {

	// Core configuration and state management for each slider instance
	var	sliderConfigurations	= [], // Stores merged options for each slider
		tileOrderSequences		= [], // Defines the order in which grid tiles appear
		sourceImages			= [], // Array of image URLs for each slider
		destinationLinks		= [], // Corresponding links for each image
		linkOpeningTargets		= [], // Target attributes for image links
		imageCaptions			= [], // Text captions for images
		primaryIntervalHandles	= [], // Timer ID for auto-advancing slides
		currentImageIndices		= [], // Current active image index for each slider
		tileAnimationTimers		= [], // Timer ID for individual tile animations
		currentTileIndices		= [], // Current tile being animated
		animationDirectionFlags	= [], // Flag to reverse tile animation order
		sliderBaseID			= "csInstanceIdentifier", // Prefix for unique slider IDs
		instanceCounter			= 0; // Counter for unique slider IDs


	jq.fn.coinslider = jq.fn.CoinSlider = function (incomingSettings) {

		/**
		 * Builds the grid of individual display tiles for a given slider element.
		 * @param {HTMLElement} targetDomElement The DOM element representing the slider container.
		 */
		var layoutDisplayGrid = function (targetDomElement) {

			var	cfg				= sliderConfigurations[targetDomElement.id],
				baseTileWidth	= Math.floor(cfg.width / cfg.spw),
				currentTileWidth= baseTileWidth,
				baseTileHeight	= Math.floor(cfg.height / cfg.sph),
				currentTileHeight= baseTileHeight,
				tileCounter		= 0,
				offsetX			= 0,
				offsetY			= 0,
				rowIterator,
				colIterator,
				horizontalGap	= cfg.width - (cfg.spw * baseTileWidth), // Remaining pixels for width distribution
				verticalGap		= cfg.height - (cfg.sph * baseTileHeight), // Remaining pixels for height distribution
				currentHGap		= horizontalGap,
				currentVGap		= verticalGap,
				htmlOutput		= []; // Array to build HTML for performance

			for (rowIterator = 1; rowIterator <= cfg.sph; rowIterator++) {
				currentHGap = horizontalGap; // Reset horizontal gap for each row

				if (currentVGap > 0) {
					currentVGap--;
					currentTileHeight = baseTileHeight + 1;
				} else {
					currentTileHeight = baseTileHeight;
				}

				for (colIterator = 1; colIterator <= cfg.spw; colIterator++) {

					if (currentHGap > 0) {
						currentHGap--;
						currentTileWidth = baseTileWidth + 1;
					} else {
						currentTileWidth = baseTileWidth;
					}

					tileOrderSequences[targetDomElement.id][tileCounter] = rowIterator + "" + colIterator;
					tileCounter++;

					var tileId = 'cs-' + targetDomElement.id + rowIterator + colIterator;
					var tileStyle = 'width:' + currentTileWidth + 'px; height:' + currentTileHeight + 'px; float: left; position: absolute;';
					var backgroundPosition = -offsetX + 'px ' + (-offsetY + 'px)';

					if (cfg.links) {
						htmlOutput.push("<a href='" + destinationLinks[targetDomElement.id][0] + "' class='cs-" + targetDomElement.id + "' id='" + tileId + "' style='" + tileStyle + " background-position:" + backgroundPosition + "; left:" + offsetX + "px; top:" + offsetY + "px;'></a>");
					} else {
						htmlOutput.push("<div class='cs-" + targetDomElement.id + "' id='" + tileId + "' style='" + tileStyle + " background-position:" + backgroundPosition + "; left:" + offsetX + "px; top:" + offsetY + "px;'></div>");
					}

					offsetX += currentTileWidth;
				}

				offsetY += currentTileHeight;
				offsetX = 0; // Reset X-offset for the next row
			}

			// Append all generated tiles at once
			jq('#' + targetDomElement.id).append(htmlOutput.join(''));

			// Event handling for navigation visibility (if not always shown)
			if (!cfg.navigationPrevNextAlwaysShown) {
				jq('.cs-' + targetDomElement.id + ', #cs-caption-bar-' + targetDomElement.id).on('mouseenter', function() {
					jq('#cs-nav-controls-' + targetDomElement.id).stop(true, true).fadeIn(100);
				}).on('mouseleave', function() {
					jq('#cs-nav-controls-' + targetDomElement.id).stop(true, true).fadeOut(100);
				});
			}

			// Event handling for hover pause functionality
			if (cfg.hoverPause) {
				jq('.cs-' + targetDomElement.id + ', #cs-caption-bar-' + targetDomElement.id).on('mouseenter', function() {
					cfg.pause = true;
				}).on('mouseleave', function() {
					cfg.pause = false;
				});
			}
		};

		/**
		 * Orchestrates the scheduling of the next slide transition.
		 * @param {HTMLElement} targetDomElement The DOM element representing the slider container.
		 */
		var scheduleNextTransition = function (targetDomElement) {
			clearInterval(primaryIntervalHandles[targetDomElement.id]); // Clear any existing timer
			var delayMillis = sliderConfigurations[targetDomElement.id].delay +
							  (sliderConfigurations[targetDomElement.id].spw *
							   sliderConfigurations[targetDomElement.id].sph *
							   sliderConfigurations[targetDomElement.id].sDelay);
			primaryIntervalHandles[targetDomElement.id] = setInterval(function() { initiateSlideTransition(targetDomElement); }, delayMillis);
		};

		/**
		 * Executes a single slide transition, updating images and captions.
		 * @param {HTMLElement} targetDomElement The DOM element representing the slider container.
		 * @param {string|number} [transitionMode] 'prev' for previous, or an index for direct jump.
		 */
		var initiateSlideTransition = function (targetDomElement, transitionMode) {
			var cfg = sliderConfigurations[targetDomElement.id];

			// Exit if slider is paused
			if (cfg.pause === true) {
				return;
			}

			// Apply the chosen visual effect to determine tile sequence
			determineTileEffect(targetDomElement);

			currentTileIndices[targetDomElement.id] = 0;
			clearInterval(tileAnimationTimers[targetDomElement.id]); // Ensure previous animation timer is cleared
			tileAnimationTimers[targetDomElement.id] = setInterval(function() {
				animateTileAppearance(targetDomElement, tileOrderSequences[targetDomElement.id][currentTileIndices[targetDomElement.id]]);
			}, cfg.sDelay);

			// Update background image of the main slider container
			jq(targetDomElement).css({ 'background-image': 'url("' + sourceImages[targetDomElement.id][currentImageIndices[targetDomElement.id]] + '")' });

			// Determine the next image index based on transition mode
			if (typeof transitionMode === "undefined") {
				currentImageIndices[targetDomElement.id]++;
			} else if (transitionMode === 'prev') {
				currentImageIndices[targetDomElement.id]--;
			} else {
				currentImageIndices[targetDomElement.id] = transitionMode; // Direct jump to an image
			}

			// Wrap around image indices if out of bounds
			if (currentImageIndices[targetDomElement.id] >= sourceImages[targetDomElement.id].length) {
				currentImageIndices[targetDomElement.id] = 0;
			}
			if (currentImageIndices[targetDomElement.id] < 0) {
				currentImageIndices[targetDomElement.id] = sourceImages[targetDomElement.id].length - 1;
			}

			// Update navigation buttons
			jq('.cs-btn-' + targetDomElement.id).removeClass('cs-active-btn');
			jq('#cs-btn-' + targetDomElement.id + "-" + (currentImageIndices[targetDomElement.id] + 1)).addClass('cs-active-btn');

			// Update caption bar
			var currentCaption = imageCaptions[targetDomElement.id][currentImageIndices[targetDomElement.id]];
			var captionElement = jq('#cs-caption-bar-' + targetDomElement.id);
			if (currentCaption) {
				captionElement.css({ 'opacity' : 0 }).animate({ 'opacity' : cfg.opacity }, cfg.titleSpeed);
				captionElement.html(currentCaption);
			} else {
				captionElement.css('opacity', 0); // Hide caption if empty
			}
		};

		/**
		 * Animates the appearance of individual grid tiles.
		 * @param {HTMLElement} targetDomElement The DOM element representing the slider container.
		 * @param {string} tileIdString The generated ID string for the current tile (e.g., "12").
		 */
		var animateTileAppearance = function (targetDomElement, tileIdString) {
			var cfg = sliderConfigurations[targetDomElement.id];

			// Ensure all tiles are linked to the correct destination and target
			jq('.cs-' + targetDomElement.id).attr({
				'href': destinationLinks[targetDomElement.id][currentImageIndices[targetDomElement.id]],
				'target': linkOpeningTargets[targetDomElement.id][currentImageIndices[targetDomElement.id]]
			});

			if (currentTileIndices[targetDomElement.id] >= cfg.spw * cfg.sph) {
				clearInterval(tileAnimationTimers[targetDomElement.id]); // All tiles animated, stop timer
				return;
			}

			var tileElement = jq('#cs-' + targetDomElement.id + tileIdString);
			tileElement.css({ opacity: 0, 'background-image': 'url("' + sourceImages[targetDomElement.id][currentImageIndices[targetDomElement.id]] + '")' });
			tileElement.animate({ opacity: 1 }, 300); // Animate tile fade-in
			currentTileIndices[targetDomElement.id]++;
		};

		/**
		 * Creates and attaches navigation controls (prev/next buttons, image buttons).
		 * @param {HTMLElement} targetDomElement The DOM element representing the slider container.
		 */
		var buildNavigationControls = function (targetDomElement) {
			var cfg = sliderConfigurations[targetDomElement.id];

			// Create Previous and Next buttons
			if (cfg.showNavigationPrevNext) {
				var navContainer = jq("<div id='cs-nav-controls-" + targetDomElement.id + "'></div>").appendTo(jq(targetDomElement));

				if (!cfg.navigationPrevNextAlwaysShown) {
					navContainer.hide();
				}

				var prevBtn = jq("<a href='#' id='cs-prev-" + targetDomElement.id + "' class='cs-prev-btn'>" + cfg.prevText + "</a>").appendTo(navContainer);
				var nextBtn = jq("<a href='#' id='cs-next-" + targetDomElement.id + "' class='cs-next-btn'>" + cfg.nextText + "</a>").appendTo(navContainer);

				prevBtn.css({
					'position'		: 'absolute',
					'top'			: (cfg.height / 2) - 15,
					'left'			: 0,
					'z-index'		: 1001,
					'line-height'	: '30px',
					'opacity'		: cfg.opacity
				}).on('click', function(evt) {
					evt.preventDefault();
					initiateSlideTransition(targetDomElement, 'prev');
					scheduleNextTransition(targetDomElement);
				}).on('mouseenter', function() { navContainer.show(); });

				nextBtn.css({
					'position'		: 'absolute',
					'top'			: (cfg.height / 2) - 15,
					'right'			: 0,
					'z-index'		: 1001,
					'line-height'	: '30px',
					'opacity'		: cfg.opacity
				}).on('click', function(evt) {
					evt.preventDefault();
					initiateSlideTransition(targetDomElement); // Default to next
					scheduleNextTransition(targetDomElement);
				}).on('mouseenter', function() { navContainer.show(); });

				navContainer.find('a').on('mouseleave', function() {
					if (!cfg.navigationPrevNextAlwaysShown) {
						navContainer.hide();
					}
					cfg.pause = false; // Ensure unpause after leaving navigation
				});
			}

			// Create image index buttons (pagination)
			if (cfg.showNavigationButtons) {
				var buttonsContainer = jq("<div id='cs-buttons-" + targetDomElement.id + "' class='cs-pagination-btns'></div>").appendTo(jq('#coin-slider-' + targetDomElement.id));

				for (var imgIdx = 1; imgIdx <= sourceImages[targetDomElement.id].length; imgIdx++){
					buttonsContainer.append("<a href='#' class='cs-btn-" + targetDomElement.id + "' id='cs-btn-" + targetDomElement.id + "-" + imgIdx + "'>" + imgIdx + "</a>");
				}

				jq.each(jq('.cs-btn-' + targetDomElement.id), function(index, buttonElem){
					jq(buttonElem).on('click', function(evt){
						jq('.cs-btn-' + targetDomElement.id).removeClass('cs-active-btn');
						jq(this).addClass('cs-active-btn');
						evt.preventDefault();
						initiateSlideTransition(targetDomElement, index); // Direct jump to image
						scheduleNextTransition(targetDomElement);
					});
				});

				buttonsContainer.css({
					'left'			: '50%',
					'margin-left'	: -(sourceImages[targetDomElement.id].length * 15 / 2) - 5, // Center buttons
					'position'		: 'relative'
				});
			}
		};

		/**
		 * Selects and applies a visual effect for the tile animation sequence.
		 * @param {HTMLElement} targetDomElement The DOM element representing the slider container.
		 */
		var determineTileEffect = function (targetDomElement) {
			var cfg = sliderConfigurations[targetDomElement.id];
			var availableEffects = ['random','swirl','rain','straight'];
			var chosenEffect;

			if (cfg.effect === '' || cfg.effect === 'random') { // If random or empty, pick one
				chosenEffect = availableEffects[Math.floor(Math.random() * availableEffects.length)];
			} else {
				chosenEffect = cfg.effect;
			}

			tileOrderSequences[targetDomElement.id] = []; // Clear previous sequence

			switch (chosenEffect) {
				case 'random':
					var sequence = [];
					for (var r = 1; r <= cfg.sph; r++) {
						for (var c = 1; c <= cfg.spw; c++) {
							sequence.push(r + "" + c);
						}
					}
					tileOrderSequences[targetDomElement.id] = shuffleArrayElements(sequence);
					break;
				case 'rain':
					generateRainSequence(targetDomElement);
					break;
				case 'swirl':
					generateSwirlSequence(targetDomElement);
					break;
				case 'straight':
					generateStraightSequence(targetDomElement);
					break;
				default: // Fallback to straight if unknown effect
					generateStraightSequence(targetDomElement);
					break;
			}

			animationDirectionFlags[targetDomElement.id] *= -1; // Toggle reverse flag

			if (animationDirectionFlags[targetDomElement.id] > 0) {
				tileOrderSequences[targetDomElement.id].reverse(); // Reverse if flag is positive
			}
		};

		/**
		 * Shuffles the elements of an array (Fisher-Yates algorithm).
		 * @param {Array} inputArray The array to be shuffled.
		 * @returns {Array} The shuffled array.
		 */
		var shuffleArrayElements = function (inputArray) {
			var currentIndex = inputArray.length, temporaryValue, randomIndex;

			// While there remain elements to shuffle...
			while (0 !== currentIndex) {
				// Pick a remaining element...
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex -= 1;

				// And swap it with the current element.
				temporaryValue = inputArray[currentIndex];
				inputArray[currentIndex] = inputArray[randomIndex];
				inputArray[randomIndex] = temporaryValue;
			}
			return inputArray;
		};

		/**
		 * Generates a tile sequence resembling a swirling pattern.
		 * @param {HTMLElement} targetDomElement The DOM element representing the slider container.
		 */
		var generateSwirlSequence = function (targetDomElement) {
			var cfg = sliderConfigurations[targetDomElement.id];
			var rows = cfg.sph,
				cols = cfg.spw,
				currX = 1,
				currY = 1,
				directionIdx = 0, // 0: right, 1: down, 2: left, 3: up
				seqCount = 0,
				totalTiles = rows * cols,
				continueGeneration = true;

			while (continueGeneration) {
				var iterations = (directionIdx === 0 || directionIdx === 2) ? cols : rows;

				for (var i = 1; i <= iterations; i++){
					if (seqCount < totalTiles) { // Safety check
						tileOrderSequences[targetDomElement.id][seqCount++] = currX + "" + currY;
					}

					if (i !== iterations) { // Don't advance on the last iteration of a segment
						switch(directionIdx){
							case 0 : currY++; break; // Move right
							case 1 : currX++; break; // Move down
							case 2 : currY--; break; // Move left
							case 3 : currX--; break; // Move up
						}
					}
				}

				directionIdx = (directionIdx + 1) % 4; // Cycle through directions

				// Adjust boundaries for the next segment
				switch (directionIdx) {
					case 0 : cols--; currY++; break; // Finished moving left, now move right (next row starts one down)
					case 1 : rows--; currX++; break; // Finished moving up, now move down (next col starts one right)
					case 2 : cols--; currY--; break; // Finished moving right, now move left (next row starts one up)
					case 3 : rows--; currX--; break; // Finished moving down, now move up (next col starts one left)
				}

				// Termination condition: if no more rows/cols to traverse
				if (rows <= 0 || cols <= 0) {
					continueGeneration = false;
				}
			}
		};

		/**
		 * Generates a tile sequence resembling a rain/diagonal pattern.
		 * @param {HTMLElement} targetDomElement The DOM element representing the slider container.
		 */
		var generateRainSequence = function (targetDomElement) {
			var cfg = sliderConfigurations[targetDomElement.id];
			var maxRows = cfg.sph,
				maxCols = cfg.spw,
				currentSeqIndex = 0,
				rowCursor = 1, // Current row for diagonal
				colCursor = 1, // Current column for diagonal
				startRow = 1, // Starting row for the diagonal scan
				continueLoop = true;

			while (continueLoop) {
				for (var i = startRow; i <= rowCursor; i++) {
					var j = colCursor - i + 1;
					if (j >= 1 && j <= maxCols && i >= 1 && i <= maxRows) { // Ensure within bounds
						tileOrderSequences[targetDomElement.id][currentSeqIndex++] = i + '' + j;
					}
				}

				colCursor++; // Move diagonal cursor
				if (rowCursor < maxRows && colCursor <= maxCols + maxRows) { // Adjust row cursor if needed
					rowCursor++;
				} else if (rowCursor >= maxRows && colCursor > maxCols) { // If reached end of columns, increment start row
					startRow++;
				}

				// Termination condition
				if (startRow > maxRows) {
					continueLoop = false;
				}
			}
		};

		/**
		 * Generates a tile sequence in a simple row-by-row, left-to-right order.
		 * @param {HTMLElement} targetDomElement The DOM element representing the slider container.
		 */
		var generateStraightSequence = function (targetDomElement) {
			var cfg = sliderConfigurations[targetDomElement.id];
			var currentSeqIndex = 0;
			for (var r = 1; r <= cfg.sph; r++) {
				for (var c = 1; c <= cfg.spw; c++) {
					tileOrderSequences[targetDomElement.id][currentSeqIndex++] = r + '' + c;
				}
			}
		};

		// Utility functions (could be Math.min/max but keeping original structure for Type III)
		var getMinValue = function (val1, val2) {
			return (val1 > val2) ? val2 : val1;
		};

		var getMaxValue = function (val1, val2) {
			return (val1 < val2) ? val2 : val1;
		};

		/**
		 * Initializes a single slider instance.
		 * @param {HTMLElement} currentElement The current DOM element to convert into a slider.
		 */
		var initializeSliderInstance = function (currentElement) {

			// Assign a unique ID if none exists
			if (!currentElement.id) {
				currentElement.id = sliderBaseID + instanceCounter++;
			}

			// Initialize instance-specific arrays
			tileOrderSequences[currentElement.id]		= [];
			sourceImages[currentElement.id]				= [];
			destinationLinks[currentElement.id]			= [];
			linkOpeningTargets[currentElement.id]		= [];
			imageCaptions[currentElement.id]			= [];
			currentImageIndices[currentElement.id]		= 0;
			currentTileIndices[currentElement.id]		= 0;
			animationDirectionFlags[currentElement.id]	= 1; // Start with forward direction

			// Merge default settings with user-provided options
			sliderConfigurations[currentElement.id] = jq.extend({}, jq.fn.coinslider.defaults, incomingSettings);
			var cfg = sliderConfigurations[currentElement.id]; // For easier access

			// Extract images, links, and titles from the initial HTML structure
			var foundImages = jq('#' + currentElement.id + ' img');
			if (foundImages.length === 0) {
				console.warn('Coin Slider: No images found within the element #' + currentElement.id + '. Skipping initialization.');
				return; // Exit if no images to process
			}

			foundImages.each(function (idx, imgElem) {
				var jqImg = jq(imgElem);
				var parentLink = jqImg.parent('a');

				sourceImages[currentElement.id][idx]		= jqImg.attr('src');
				destinationLinks[currentElement.id][idx]	= parentLink.length ? parentLink.attr('href') : '';
				linkOpeningTargets[currentElement.id][idx]	= parentLink.length ? parentLink.attr('target') : '';
				imageCaptions[currentElement.id][idx]		= jqImg.next('span').length ? jqImg.next('span').html() : '';

				jqImg.hide(); // Hide original image
				jqImg.next('span').hide(); // Hide original caption span
			});

			// Set up the main slider container
			jq(currentElement).css({
				'background-image': 'url("' + sourceImages[currentElement.id][0] + '")',
				'width': cfg.width,
				'height': cfg.height,
				'position': 'relative',
				'background-position': 'top left',
				'overflow': 'hidden' // Ensure tiles don't spill
			}).wrap("<div class='coin-slider-wrapper' id='coin-slider-" + currentElement.id + "' />");

			// Create caption bar
			jq('#' + currentElement.id).append("<div class='cs-caption-bar' id='cs-caption-bar-" + currentElement.id + "' style='position: absolute; bottom:0; left: 0; z-index: 1000; width: 100%;'></div>");

			// Build the grid of tiles
			layoutDisplayGrid(currentElement);

			// Initialize navigation if enabled
			if(cfg.navigation){
				buildNavigationControls(currentElement);
			}

			// Start the first transition and schedule subsequent ones
			initiateSlideTransition(currentElement);
			scheduleNextTransition(currentElement);
		};

		// Iterate over each matched element to initialize the slider
		return this.each(function () {
			initializeSliderInstance(this);
		});
	};

	// Default plugin options (can be overridden by userSettings)
	jq.fn.coinslider.defaults = {
		width: 560, // Width of the slider container
		height: 300, // Height of the slider container
		spw: 7, // Number of horizontal tiles (squares per width)
		sph: 5, // Number of vertical tiles (squares per height)
		delay: 3000, // Delay between transitions (milliseconds)
		sDelay: 30, // Delay between individual tile animations (milliseconds)
		opacity: 0.7, // Opacity for navigation elements and captions
		titleSpeed: 500, // Speed of caption text fade-in/out
		effect: 'random', // 'random', 'swirl', 'rain', 'straight' or '' (random)
		navigation: true, // Enable/disable navigation controls
		links: true, // Enable/disable image links
		hoverPause: true, // Pause slider on hover
		showNavigationPrevNext: true, // Display previous/next buttons
		navigationPrevNextAlwaysShown: false, // Keep prev/next buttons visible
		showNavigationButtons: true, // Display image index buttons (pagination)
		prevText: 'prev', // Text for previous button
		nextText: 'next' // Text for next button
	};

})(jQuery);