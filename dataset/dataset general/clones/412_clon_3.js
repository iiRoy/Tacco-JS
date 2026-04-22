(function($){
	// This jQuery plugin applies a dynamic shifting effect to text characters.
	// It supports configurable colors, sizes, and animation properties.
	// Version 1.0 (Clone) - Developed from 'funnyText.js'
	// License: MIT (inherited)

	$.fn.dynamicLetterFX = function(userSettings){
		const defaultSettings = {
			animationSpeedMs: 700,         // Base duration for shift animations in milliseconds
			borderOutlineColor: 'black',   // Color for the outline of the active character
			highlightFillColor: 'white',   // Color for the active character's fill
			defaultTextColor: 'black',     // Color for the normal (static) character
			charDisplaySize: '7em',        // Font size for each character
			movementConstraint: 'both'     // 'horizontal', 'vertical', or 'both' for character movement
		};

		// Merge user-provided settings with defaults. Create a new object to avoid modifying defaultSettings.
		const effectConfig = $.extend({}, defaultSettings, userSettings);

		// Store a reference to the jQuery object for the current selection.
		const $targetContainer = $(this);

		// --- Input Validation and Setup ---
		if (!$targetContainer.length) {
			// If no elements are selected, gracefully exit.
			console.warn("dynamicLetterFX: No elements selected for effect application.");
			return this;
		}

		// Ensure the main container has the base class for styling.
		$targetContainer.addClass('dynamic-letter-fx-container');

		// Extract and prepare the text content. Trim whitespace and split into individual characters.
		const originalContent = $.trim($targetContainer.text());
		if (!originalContent.length) {
			console.warn("dynamicLetterFX: Selected element contains no text. Skipping effect application.");
			return this;
		}
		const individualChars = originalContent.split('');

		// Clear the original HTML content; characters will be re-added with effects.
		$targetContainer.empty();
		// Store the original text as a data attribute for potential future use (e.g., a 'destroy' method).
		$targetContainer.data('original-content', originalContent);


		// --- Dynamic Style Injection ---
		// Construct and append a <style> block to the document head for character styling.
		// This ensures consistent styling and allows for dynamic updates.
		const styleId = 'dynamicLetterFX-styles-' + Math.floor(Math.random() * 100000); // Unique ID
		let styleBlock = $('<style>', { id: styleId });
		let cssRules = `
			.dynamic-letter-fx-container .char-segment {
				position: relative;
				display: inline-block;
				overflow: hidden;
				transition: left ${effectConfig.animationSpeedMs}ms ease-out, top ${effectConfig.animationSpeedMs}ms ease-out;
				/* Default transition for browsers supporting it */
			}
			.dynamic-letter-fx-container .char-segment-wrapper {
				position: absolute;
				display: flex; /* Using flexbox for better alignment within the wrapper */
				align-items: center;
				justify-content: center;
				width: 200%; /* Double width/height to accommodate shifted states */
				height: 200%;
				transition: left ${effectConfig.animationSpeedMs}ms ease-out, top ${effectConfig.animationSpeedMs}ms ease-out;
			}
			.dynamic-letter-fx-container .char-segment-wrapper.shifted-state.shift-right-anim { left: -50%; }
			.dynamic-letter-fx-container .char-segment-wrapper.shifted-state.shift-left-anim { left: 0%; } /* Original left */
			.dynamic-letter-fx-container .char-segment-wrapper.shifted-state.shift-up-anim { top: 0%; } /* Original top */
			.dynamic-letter-fx-container .char-segment-wrapper.shifted-state.shift-down-anim { top: -50%; }

			.dynamic-letter-fx-container .base-char-view,
			.dynamic-letter-fx-container .active-char-view {
				display: inline-block;
				font-size: ${effectConfig.charDisplaySize};
				white-space: pre; /* Preserve whitespace for characters */
				line-height: 1; /* Normalize line height */
			}
			.dynamic-letter-fx-container .base-char-view {
				color: ${effectConfig.defaultTextColor};
				position: absolute; /* Position to allow active char to move over it */
			}
			.dynamic-letter-fx-container .active-char-view {
				color: ${effectConfig.highlightFillColor};
				text-shadow: -1px 0 ${effectConfig.borderOutlineColor}, 0 1px ${effectConfig.borderOutlineColor}, 1px 0 ${effectConfig.borderOutlineColor}, 0 -1px ${effectConfig.borderOutlineColor};
				position: absolute;
			}
			/* Initial positioning for the character content within its wrapper */
			.dynamic-letter-fx-container .char-segment-wrapper.top-align { align-items: flex-start; }
			.dynamic-letter-fx-container .char-segment-wrapper.bottom-align { align-items: flex-end; }
			.dynamic-letter-fx-container .char-segment-wrapper.left-align { justify-content: flex-start; }
			.dynamic-letter-fx-container .char-segment-wrapper.right-align { justify-content: flex-end; }
		`;
		styleBlock.html(cssRules);
		$('head').append(styleBlock);


		// --- Helper Utilities ---
		const _utils = {
			/**
			 * Generates a random integer within a specified range (inclusive).
			 * @param {number} min - The minimum value.
			 * @param {number} max - The maximum value.
			 * @returns {number} A random integer.
			 */
			getRandomIntInclusive: (min, max) => {
				min = Math.ceil(min);
				max = Math.floor(max);
				return Math.floor(Math.random() * (max - min + 1)) + min;
			},

			/**
			 * Checks if the browser supports CSS Transitions.
			 * @returns {boolean} True if transitions are supported, false otherwise.
			 */
			checkTransitionSupport: (() => {
				const bodyElem = document.body || document.documentElement;
				const styleProp = bodyElem.style;
				const transitionPropName = 'transition';
				if (typeof styleProp[transitionPropName] === 'string') {
					return true;
				}
				const vendorPrefixes = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'];
				const capitalizedProp = transitionPropName.charAt(0).toUpperCase() + transitionPropName.substr(1);
				for (let i = 0; i < vendorPrefixes.length; i++) {
					if (typeof styleProp[vendorPrefixes[i] + capitalizedProp] === 'string') {
						return true;
					}
				}
				return false;
			})(),

			/**
			 * Determines the shift direction descriptor for the active character.
			 * @param {string} currentHPos - 'left' or 'right' for the base character's horizontal position.
			 * @param {string} currentVPos - 'top' or 'bottom' for the base character's vertical position.
			 * @returns {string} A space-separated string of classes describing the shift.
			 */
			calculateShiftDescriptor: (currentHPos, currentVPos) => {
				let shiftResult = '';
				const useHorizontalShift = (_utils.getRandomIntInclusive(0, 1) === 0 && effectConfig.movementConstraint === 'both') || effectConfig.movementConstraint === 'horizontal';

				if (useHorizontalShift) {
					if (currentHPos === "right") {
						shiftResult = "left-align shift-left-anim";
					} else { // currentHPos === "left"
						shiftResult = "right-align shift-right-anim";
					}
					// Vertical position remains the same as base char's vertical position
					shiftResult += ` ${currentVPos}-align`;
				} else { // Vertical shift
					if (currentVPos === "top") {
						shiftResult = "bottom-align shift-down-anim";
					} else { // currentVPos === "bottom"
						shiftResult = "top-align shift-up-anim";
					}
					// Horizontal position remains the same as base char's horizontal position
					shiftResult += ` ${currentHPos}-align`;
				}
				return shiftResult;
			}
		};


		// --- Character Structure Generation ---
		const verticalPositions = ['top', 'bottom'];
		const horizontalPositions = ['left', 'right'];

		individualChars.forEach((char, charIdx) => {
			// Replace spaces with non-breaking spaces to ensure layout integrity.
			const displayChar = (char === ' ') ? '&nbsp;' : char;

			// Randomly determine the base character's initial position within its wrapper.
			const normalVCoord = verticalPositions[_utils.getRandomIntInclusive(0, 1)];
			const normalHCoord = horizontalPositions[_utils.getRandomIntInclusive(0, 1)];

			// Determine the active character's shift direction based on the normal position.
			const activeShiftClasses = _utils.calculateShiftDescriptor(normalHCoord, normalVCoord);

			// Construct the HTML for the base and active character spans.
			const baseCharMarkup = `<span class="base-char-view ${normalVCoord}-align ${normalHCoord}-align" aria-hidden="true">${displayChar}</span>`;
			const activeCharMarkup = `<span class="active-char-view ${activeShiftClasses}">${displayChar}</span>`;

			// Combine into a single inner wrapper, then into the main character segment.
			const segmentContainerMarkup = `<div class="char-segment-wrapper ${normalVCoord}-align ${normalHCoord}-align">${baseCharMarkup}${activeCharMarkup}</div>`;
			const charSegment = `<div class="char-segment" data-char-index="${charIdx}">${segmentContainerMarkup}</div>`;

			$targetContainer.append(charSegment);
		});


		// --- Post-Render Layout Adjustments ---
		// Iterate over each character segment to set dimensions and initial offsets.
		$targetContainer.find('.char-segment').each(function() {
			const $charSegment = $(this);
			const $innerWrapper = $charSegment.find('.char-segment-wrapper');
			const $baseChar = $innerWrapper.find('.base-char-view');

			// Get the actual rendered size of a single character.
			const charBoxWidth = $baseChar.width();
			const charBoxHeight = $baseChar.height();

			// Set the dimensions of the outer 'viewport' wrapper for the character.
			$charSegment.css({
				'width': charBoxWidth + 'px',
				'height': charBoxHeight + 'px'
			});

			// Adjust the initial position of the inner wrapper based on the base character's alignment.
			// This positions the base character correctly within the 200% sized inner wrapper,
			// allowing space for the active character to shift into view.
			if ($innerWrapper.hasClass('bottom-align')) {
				$innerWrapper.css('top', '-' + charBoxHeight + 'px');
			}
			if ($innerWrapper.hasClass('right-align')) {
				$innerWrapper.css('left', '-' + charBoxWidth + 'px');
			}
		});


		// --- Animation Logic ---

		/**
		 * Toggles the shifted state of a character segment, triggering its animation.
		 * @param {jQuery} $charSegment - The jQuery object for the character segment container.
		 */
		const performShiftAnimation = ($charSegment) => {
			const $innerWrapper = $charSegment.find('.char-segment-wrapper');
			const isCurrentlyShifted = $innerWrapper.hasClass('shifted-state');

			// For browsers without CSS transition support, use jQuery's animate.
			if (!_utils.checkTransitionSupport) {
				const charBoxWidth = $charSegment.width();
				const charBoxHeight = $charSegment.height();
				const targetLeft = isCurrentlyShifted ? 0 : ($innerWrapper.hasClass('shift-left-anim') ? -charBoxWidth : 0);
				const targetTop = isCurrentlyShifted ? 0 : ($innerWrapper.hasClass('shift-up-anim') ? -charBoxHeight : 0);

				$innerWrapper.animate({
					left: targetLeft,
					top: targetTop
				}, effectConfig.animationSpeedMs * 0.6); // Use a slightly faster animation for jQuery fallback
			}

			// Toggle the 'shifted-state' class, which CSS transitions will pick up.
			$innerWrapper.toggleClass('shifted-state');
		};

		/**
		 * Schedules a character animation after a specified delay.
		 * @param {jQuery} $charSegment - The jQuery object for the character segment container.
		 * @param {number} delayFactor - A multiplier for the base animation speed.
		 */
		const scheduleShiftAction = ($charSegment, delayFactor) => {
			setTimeout(() => {
				performShiftAnimation($charSegment);
			}, delayFactor * effectConfig.animationSpeedMs);
		};

		// --- Interaction and Timed Animations ---

		// Handle hover interactions: shift character on hover if not already shifted.
		$targetContainer.on('mouseenter', '.char-segment', function() {
			const $currentSegment = $(this);
			if (!$currentSegment.find('.char-segment-wrapper').hasClass('shifted-state')) {
				performShiftAnimation($currentSegment);
			}
		});

		// Setup a continuous, random character animation sequence using recursive setTimeout.
		// This is more flexible than setInterval and prevents queueing up if animations lag.
		let animationLoopActive = true;
		const startRandomAnimationLoop = () => {
			if (!animationLoopActive) return;

			const delayFactor = _utils.getRandomIntInclusive(2, 6); // Random delay multiplier
			const charCount = individualChars.length;
			if (charCount === 0) return;

			// Select a random character index.
			const selectedCharIndex = _utils.getRandomIntInclusive(0, charCount - 1);
			const $selectedCharSegment = $targetContainer.find(`.char-segment[data-char-index="${selectedCharIndex}"]`);

			if ($selectedCharSegment.length) {
				scheduleShiftAction($selectedCharSegment, delayFactor);
			}

			// Schedule the next iteration of the loop.
			setTimeout(startRandomAnimationLoop, effectConfig.animationSpeedMs);
		};

		// Start the animation loop after initial setup.
		startRandomAnimationLoop();

		// Return the jQuery object for chaining.
		return this;
	};

})(jQuery);