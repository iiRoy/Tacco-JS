(function (globalObj, moduleCreator) {
	if ( typeof define === 'function' && define.amd ) {
		define([], moduleCreator(globalObj));
	} else if ( typeof exports === 'object' ) {
		module.exports = moduleCreator(globalObj);
	} else {
		globalObj.fancyScroller = moduleCreator(globalObj);
	}
})(this, function (windowContext) {

	'use strict';

	// Internal state variables for the scrolling module
	var animatedScroller = {}; // Main object for exposing public methods
	var featureSupport = !!document.querySelector && !!windowContext.addEventListener; // Check browser compatibility
	var configParams, debounceTimer, stickyHeaderElement, cachedStickyHeaderHeight;

	// Default configuration settings
	var initialOptions = {
		animationDuration: 500,
		timingFunction: 'easeInOutCubic',
		scrollOffset: 0,
		modifyUrlHash: true,
		onStartCallback: function () {},
		onCompleteCallback: function () {}
	};


	// Utility functions
	/**
	 * Provides a generic iteration mechanism for various collection types.
	 * @private
	 * @param {Array|Object|NodeList} itemsContainer The collection to iterate through
	 * @param {Function} processItem The function to call for each item
	 * @param {Array|Object|NodeList} contextObject The 'this' context for the callback execution
	 */
	var iterateCollection = function (itemsContainer, processItem, contextObject) {
		if (Object.prototype.toString.call(itemsContainer) === '[object Object]') {
			for (var propertyKey in itemsContainer) {
				if (Object.prototype.hasOwnProperty.call(itemsContainer, propertyKey)) {
					processItem.call(contextObject, itemsContainer[propertyKey], propertyKey, itemsContainer);
				}
			}
		} else {
			for (var idx = 0, count = itemsContainer.length; idx < count; idx++) {
				processItem.call(contextObject, itemsContainer[idx], idx, itemsContainer);
			}
		}
	};


	/**
	 * Merges a set of user options with default settings.
	 * @private
	 * @param {Object} baseOptions The default configuration object
	 * @param {Object} userOptions The options provided by the user
	 * @returns {Object} A new object containing combined properties
	 */
	var mergeOptions = function ( baseOptions, userOptions ) {
		var mergedResult = {};
		iterateCollection(baseOptions, function (itemValue, propertyName) {
			mergedResult[propertyName] = baseOptions[propertyName];
		});
		iterateCollection(userOptions, function (itemValue, propertyName) {
			mergedResult[propertyName] = userOptions[propertyName];
		});
		return mergedResult;
	};


	/**
	 * Navigates up the DOM tree to find the nearest matching element.
	 * @param {Element} startElement The element from which to begin the search
	 * @param {String} targetSelector The CSS selector string to match
	 * @return {Boolean|Element} The first matching ancestor or false if none is found
	 */
	var findAncestor = function (startElement, targetSelector) {
		var initialChar = targetSelector.charAt(0);
		for ( ; startElement && startElement !== document; startElement = startElement.parentNode ) {
			if ( initialChar === '.' ) {
				if ( startElement.classList.contains( targetSelector.substr(1) ) ) {
					return startElement;
				}
			} else if ( initialChar === '#' ) {
				if ( startElement.id === targetSelector.substr(1) ) {
					return startElement;
				}
			} else if ( initialChar === '[' ) {
				if ( startElement.hasAttribute( targetSelector.substr(1, targetSelector.length - 2) ) ) {
					return startElement;
				}
			}
		}
		return false;
	};


	/**
	 * Calculates the full height of a DOM element.
	 * @private
	 * @param  {Node} targetElement The element to measure
	 * @return {Number} The computed height of the element in pixels
	 */
	var measureElementHeight = function (targetElement) {
		return Math.max( targetElement.scrollHeight, targetElement.offsetHeight, targetElement.clientHeight );
	};


	/**
	 * Sanitizes an ID string for use in CSS selectors by escaping special characters.
	 * @private
	 * @param {String} inputIdentifier The raw ID string
	 * @author Mathias Bynens - Referencing his CSS.escape implementation
	 * @link https://github.com/mathiasbynens/CSS.escape
	 */
	var sanitizeIdString = function ( inputIdentifier ) {
		var idString = String(inputIdentifier);
		var strLength = idString.length;
		var charIndex = -1;
		var charCode;
		var sanitizedString = '';
		var firstCharCode = idString.charCodeAt(0);
		while (++charIndex < strLength) {
			charCode = idString.charCodeAt(charIndex);
			// No special handling for Unicode astral symbols or surrogate pairs.

			// If the character is a NULL byte (U+0000), throw an error.
			if (charCode === 0x0000) {
				throw new InvalidCharacterError(
					'Invalid character detected: the input contains U+0000.'
				);
			}

			if (
				// Characters in the range [U+0001, U+001F] or U+007F,
				(charCode >= 0x0001 && charCode <= 0x001F) || charCode == 0x007F ||
				// The first character is a digit [U+0030, U+0039],
				(charIndex === 0 && charCode >= 0x0030 && charCode <= 0x0039) ||
				// The second character is a digit and the first is '-' (U+002D),
				(
					charIndex === 1 &&
					charCode >= 0x0030 && charCode <= 0x0039 &&
					firstCharCode === 0x002D
				)
			) {
				// Escape as a CSS code point.
				sanitizedString += '\\' + charCode.toString(16) + ' ';
				continue;
			}

			// If character is >= U+0080, or is '-', '_', or an alphanumeric character,
			if (
				charCode >= 0x0080 ||
				charCode === 0x002D ||
				charCode === 0x005F ||
				(charCode >= 0x0030 && charCode <= 0x0039) ||
				(charCode >= 0x0041 && charCode <= 0x005A) ||
				(charCode >= 0x0061 && charCode <= 0x007A)
			) {
				// Append the character as is.
				sanitizedString += idString.charAt(charIndex);
				continue;
			}

			// Otherwise, escape the character directly.
			sanitizedString += '\\' + idString.charAt(charIndex);

		}
		return sanitizedString;
	};


	/**
	 * Computes the eased value for animation progress based on a specified function.
	 * @private
	 * @link https://gist.github.com/gre/1650294
	 * @param {String} easingType The name of the easing curve to use
	 * @param {Number} progressRatio The current progress of the animation (from 0 to 1)
	 * @returns {Number} The transformed progress value
	 */
	var calculateEasing = function ( easingType, progressRatio ) {
		var calculatedValue;
		if ( easingType === 'easeInQuad' ) calculatedValue = progressRatio * progressRatio; // Quadratic accelerating from zero velocity
		if ( easingType === 'easeOutQuad' ) calculatedValue = progressRatio * (2 - progressRatio); // Quadratic decelerating to zero velocity
		if ( easingType === 'easeInOutQuad' ) calculatedValue = progressRatio < 0.5 ? 2 * progressRatio * progressRatio : -1 + (4 - 2 * progressRatio) * progressRatio; // Quadratic acceleration until halfway, then deceleration
		if ( easingType === 'easeInCubic' ) calculatedValue = progressRatio * progressRatio * progressRatio; // Cubic accelerating from zero velocity
		if ( easingType === 'easeOutCubic' ) calculatedValue = (--progressRatio) * progressRatio * progressRatio + 1; // Cubic decelerating to zero velocity
		if ( easingType === 'easeInOutCubic' ) calculatedValue = progressRatio < 0.5 ? 4 * progressRatio * progressRatio * progressRatio : (progressRatio - 1) * (2 * progressRatio - 2) * (2 * progressRatio - 2) + 1; // Cubic acceleration until halfway, then deceleration
		if ( easingType === 'easeInQuart' ) calculatedValue = progressRatio * progressRatio * progressRatio * progressRatio; // Quartic accelerating from zero velocity
		if ( easingType === 'easeOutQuart' ) calculatedValue = 1 - (--progressRatio) * progressRatio * progressRatio * progressRatio; // Quartic decelerating to zero velocity
		if ( easingType === 'easeInOutQuart' ) calculatedValue = progressRatio < 0.5 ? 8 * progressRatio * progressRatio * progressRatio * progressRatio : 1 - 8 * (--progressRatio) * progressRatio * progressRatio * progressRatio; // Quartic acceleration until halfway, then deceleration
		if ( easingType === 'easeInQuint' ) calculatedValue = progressRatio * progressRatio * progressRatio * progressRatio * progressRatio; // Quintic accelerating from zero velocity
		if ( easingType === 'easeOutQuint' ) calculatedValue = 1 + (--progressRatio) * progressRatio * progressRatio * progressRatio * progressRatio; // Quintic decelerating to zero velocity
		if ( easingType === 'easeInOutQuint' ) calculatedValue = progressRatio < 0.5 ? 16 * progressRatio * progressRatio * progressRatio * progressRatio * progressRatio : 1 + 16 * (--progressRatio) * progressRatio * progressRatio * progressRatio * progressRatio; // Quintic acceleration until halfway, then deceleration
		return calculatedValue || progressRatio; // Return linear progress if no easing type matches
	};


	/**
	 * Calculates the final pixel position to scroll to.
	 * @private
	 * @param {Element} targetAnchor The element designated as the scroll target
	 * @param {Number} fixedBarHeight The height of any fixed elements at the top of the viewport
	 * @param {Number} scrollDisplacement An additional pixel offset to apply
	 * @returns {Number} The absolute vertical scroll position
	 */
	var determineTargetPosition = function (targetAnchor, fixedBarHeight, scrollDisplacement) {
		var currentPosition = 0;
		if (targetAnchor.offsetParent) {
			do {
				currentPosition += targetAnchor.offsetTop;
				targetAnchor = targetAnchor.offsetParent;
			} while (targetAnchor);
		}
		currentPosition = currentPosition - fixedBarHeight - scrollDisplacement;
		return currentPosition >= 0 ? currentPosition : 0;
	};


	/**
	 * Fetches the total scrollable height of the current document.
	 * @private
	 * @returns {Number} The maximum possible scroll height of the document
	 */
	var fetchDocumentHeight = function () {
		return Math.max(
			document.body.scrollHeight, document.documentElement.scrollHeight,
			document.body.offsetHeight, document.documentElement.offsetHeight,
			document.body.clientHeight, document.documentElement.clientHeight
		);
	};


	/**
	 * Parses a JSON string from a data attribute into an object.
	 * @private
	 * @param {String} attributeString The string value from a data attribute
	 * @returns {Object} An object parsed from JSON, or an empty object if invalid/missing
	 */
	var parseDataAttributeOptions = function (attributeString) {
		return !attributeString || !(typeof JSON === 'object' && typeof JSON.parse === 'function') ? {} : JSON.parse( attributeString );
	};


	/**
	 * Updates the browser's URL hash, optionally pushing to history.
	 * @private
	 * @param {Element} hashValue The hash value to set in the URL
	 * @param {Boolean} shouldUpdateHistory Flag indicating whether to modify browser history
	 */
	var updateBrowserUrl = function (hashValue, shouldUpdateHistory) {
		if ( history.pushState && (shouldUpdateHistory || shouldUpdateHistory === 'true') ) {
			history.pushState( null, null, [windowContext.location.protocol, '//', windowContext.location.host, windowContext.location.pathname, windowContext.location.search, hashValue].join('') );
		}
	};


	var getFixedElementHeight = function (fixedElement) {
		return fixedElement === null ? 0 : ( measureElementHeight( fixedElement ) + fixedElement.offsetTop );
	};


	/**
	 * Initiates the smooth scrolling animation to a specified target.
	 * @public
	 * @param {Element} triggerElement The element that triggered this scroll action
	 * @param {Element} destinationId The ID of the element to scroll into view
	 * @param {Object} animationOptions Specific options for this animation
	 */
	animatedScroller.initiateScrollAnimation = function (triggerElement, destinationId, animationOptions) {

		// Merge user-defined and data-attribute options with defaults
		var currentConfig = mergeOptions( configParams || initialOptions, animationOptions || {} );
		var optionOverrides = parseDataAttributeOptions( triggerElement ? triggerElement.getAttribute('data-options') : null );
		currentConfig = mergeOptions( currentConfig, optionOverrides );
		destinationId = '#' + sanitizeIdString(destinationId.substr(1)); // Clean and escape the ID for selector use

		// Prepare variables for the animation
		var targetElementNode = destinationId === '#' ? document.documentElement : document.querySelector(destinationId);
		var initialScrollPosition = windowContext.pageYOffset; // Get current scroll position
		if ( !cachedStickyHeader ) { cachedStickyHeader = document.querySelector('[data-scroll-header]'); }  // Cache fixed header if not already done
		if ( !cachedStickyHeaderHeight ) { cachedStickyHeaderHeight = getFixedElementHeight( cachedStickyHeader ); } // Calculate fixed header height
		var finalScrollPosition = determineTargetPosition( targetElementNode, cachedStickyHeaderHeight, parseInt(currentConfig.scrollOffset, 10) ); // Determine the final scroll target
		var scrollIntervalId; // Holder for the animation interval ID
		var totalDistance = finalScrollPosition - initialScrollPosition; // The total pixel distance to cover
		var pageContentHeight = fetchDocumentHeight();
		var elapsedTime = 0;
		var animationProgress, currentScrollPosition;

		// Update the browser's URL based on configuration
		updateBrowserUrl(destinationId, currentConfig.modifyUrlHash);

		/**
		 * Stops the animation when the target is reached or boundaries are hit.
		 * @private
		 * @param {Number} currentScrollPosition The current calculated scroll position during animation
		 * @param {Number} finalScrollPosition The ultimate target scroll position
		 * @param {Number} scrollIntervalId The ID of the active animation interval
		 */
		var haltScrollAnimation = function (currentScrollPosition, finalScrollPosition, scrollIntervalId) {
			var windowScrollY = windowContext.pageYOffset;
			if ( currentScrollPosition == finalScrollPosition || windowScrollY == finalScrollPosition || ( (windowContext.innerHeight + windowScrollY) >= pageContentHeight ) ) {
				clearInterval(scrollIntervalId);
				targetElementNode.focus();
				currentConfig.onCompleteCallback( triggerElement, destinationId ); // Execute callback after animation finishes
			}
		};

		/**
		 * Executes a single frame of the scrolling animation.
		 * @private
		 */
		var animateScrollStep = function () {
			elapsedTime += 16;
			animationProgress = ( elapsedTime / parseInt(currentConfig.animationDuration, 10) );
			animationProgress = ( animationProgress > 1 ) ? 1 : animationProgress;
			currentScrollPosition = initialScrollPosition + ( totalDistance * calculateEasing(currentConfig.timingFunction, animationProgress) );
			windowContext.scrollTo( 0, Math.floor(currentScrollPosition) );
			haltScrollAnimation(currentScrollPosition, finalScrollPosition, scrollIntervalId);
		};

		/**
		 * Kicks off the scrolling animation by setting an interval.
		 * @private
		 */
		var beginScrollAnimation = function () {
			currentConfig.onStartCallback( triggerElement, destinationId ); // Execute callback before animation starts
			scrollIntervalId = setInterval(animateScrollStep, 16);
		};

		/**
		 * Addresses an iOS-specific scroll bug by ensuring the scroll position is reset.
		 * @link https://github.com/cferdinandi/smooth-scroll/issues/45
		 */
		if ( windowContext.pageYOffset === 0 ) {
			windowContext.scrollTo( 0, 0 );
		}

		// Start the animation sequence
		beginScrollAnimation();

	};


	/**
	 * General event handler for clicks on scroll trigger elements.
	 * @private
	 */
	var handleLinkClick = function (clickEvent) {
		var scrollTrigger = findAncestor(clickEvent.target, '[data-scroll]');
		if ( scrollTrigger && scrollTrigger.tagName.toLowerCase() === 'a' ) {
			clickEvent.preventDefault(); // Prevent the default link navigation
			animatedScroller.initiateScrollAnimation( scrollTrigger, scrollTrigger.hash, configParams); // Trigger the smooth scroll
		}
	};


	/**
	 * Throttles window resize events to improve performance.
	 * @private
	 * @param  {Function} windowEvent The event object (unused)
	 */
	var throttleWindowEvents = function (windowEvent) {
		if ( !debounceTimer ) {
			debounceTimer = setTimeout(function() {
				debounceTimer = null; // Clear the timeout flag
				cachedStickyHeaderHeight = getFixedElementHeight( stickyHeaderElement ); // Re-calculate fixed header height
			}, 66);
		}
	};


	/**
	 * Deactivates the scrolling module, removing all listeners and resetting state.
	 * @public
	 */
	animatedScroller.teardownModule = function () {

		// If the module was not initialized, there's nothing to tear down
		if ( !configParams ) return;

		// Remove all attached event listeners
		document.removeEventListener( 'click', handleLinkClick, false );
		windowContext.removeEventListener( 'resize', throttleWindowEvents, false );

		// Reset all module-level variables
		configParams = null;
		debounceTimer = null;
		stickyHeaderElement = null;
		cachedStickyHeaderHeight = null;
	};


	/**
	 * Initializes the fancy scrolling module with provided settings.
	 * @public
	 * @param {Object} userSettings Custom settings to apply
	 */
	animatedScroller.initializeModule = function (userSettings) {

		// Skip initialization if required browser features are missing
		if ( !featureSupport ) return;

		// Ensure any prior initialization is cleaned up first
		animatedScroller.teardownModule();

		// Set up the module's configuration and cache elements
		configParams = mergeOptions( initialOptions, userSettings || {} ); // Merge user settings with defaults
		stickyHeaderElement = document.querySelector('[data-scroll-header]'); // Find the fixed header element
		cachedStickyHeaderHeight = getFixedElementHeight( stickyHeaderElement );

		// Attach event listeners for user interaction and window events
		document.addEventListener('click', handleLinkClick, false );
		if ( stickyHeaderElement ) { windowContext.addEventListener( 'resize', throttleWindowEvents, false ); }

	};


	// Expose the public API of the module
	return animatedScroller;

});