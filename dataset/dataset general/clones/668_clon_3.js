(function (globalScope, moduleFactory) {
	// Check for AMD loader
	if ( typeof define === 'function' && define.amd ) {
		define([], function() { return moduleFactory(globalScope); });
	}
	// Check for CommonJS environment
	else if ( typeof exports === 'object' && typeof module !== 'undefined' ) {
		module.exports = moduleFactory(globalScope);
	}
	// Fallback to global object
	else {
		globalScope.smoothPageScroller = moduleFactory(globalScope);
	}
})(this, function (currentWindow) {

	'use strict';

	//
	// Module Configuration and State Variables
	//

	var pageScroller = {}; // Core object for exposing public methods
	var browserSupport = (!!document.querySelector && !!currentWindow.addEventListener); // Basic feature check
	var currentConfig, animationTimerId, stickyElement, stickyElementHeight;

	// Default operational parameters for the scrolling behavior
	var defaultOptions = {
		scrollDuration: 600, // Time in milliseconds for the scroll animation
		easingCurve: 'easeOutQuint', // Easing function to apply to the scroll
		verticalOffset: 0, // Pixels to offset from the target element's top
		updateHistory: true, // Whether to update the browser's URL hash
		beforeScrollCallback: function () {}, // Function to execute before scrolling starts
		afterScrollCallback: function () {}  // Function to execute after scrolling completes
	};


	//
	// Internal Utility Functions
	//

	/**
	 * Iterates over properties of an object or elements of an array/NodeList.
	 * @private
	 * @param {Array|Object|NodeList} targetCollection - Items to process
	 * @param {Function} processingCallback - Function to call for each item
	 * @param {Array|Object|NodeList} iterationContext - The 'this' context for the callback
	 */
	var iterateCollection = function (targetCollection, processingCallback, iterationContext) {
		if (!targetCollection) {
			return; // Gracefully handle null/undefined collections
		}

		// Handle plain objects
		if (Object.prototype.toString.call(targetCollection) === '[object Object]') {
			for (var keyName in targetCollection) {
				if (Object.prototype.hasOwnProperty.call(targetCollection, keyName)) {
					processingCallback.call(iterationContext, targetCollection[keyName], keyName, targetCollection);
				}
			}
		}
		// Handle arrays and NodeLists
		else if (typeof targetCollection.length === 'number') {
			for (var iterator = 0, itemCount = targetCollection.length; iterator < itemCount; iterator++) {
				processingCallback.call(iterationContext, targetCollection[iterator], iterator, targetCollection);
			}
		}
	};

	/**
	 * Combines default settings with user-provided overrides.
	 * @private
	 * @param {Object} baseSettings - The base configuration object
	 * @param {Object} customSettings - User-defined options
	 * @returns {Object} A new object with merged properties
	 */
	var mergeConfigurations = function (baseSettings, customSettings) {
		var combinedSettings = {};
		iterateCollection(baseSettings, function (val, propName) {
			combinedSettings[propName] = baseSettings[propName];
		});
		iterateCollection(customSettings, function (val, propName) {
			combinedSettings[propName] = customSettings[propName];
		});
		return combinedSettings;
	};

	/**
	 * Traverses up the DOM tree to find the closest ancestor matching a selector.
	 * @param {Element} startingElement - The element to begin the search from
	 * @param {String} matchSelector - CSS selector to find (e.g., '.class', '#id', '[data-attr]')
	 * @returns {Element|null} The matching ancestor element or null if not found
	 */
	var findMatchingAncestor = function (startingElement, matchSelector) {
		if (!startingElement || !matchSelector || typeof matchSelector !== 'string') {
			return null;
		}
		var firstCharOfSelector = matchSelector.charAt(0);
		var currentAncestor = startingElement;

		while (currentAncestor && currentAncestor !== document.documentElement) {
			if (firstCharOfSelector === '.') { // Class selector
				if (currentAncestor.classList.contains(matchSelector.substring(1))) {
					return currentAncestor;
				}
			} else if (firstCharOfSelector === '#') { // ID selector
				if (currentAncestor.id === matchSelector.substring(1)) {
					return currentAncestor;
				}
			} else if (firstCharOfSelector === '[') { // Attribute selector
				if (currentAncestor.hasAttribute(matchSelector.substring(1, matchSelector.length - 1))) {
					return currentAncestor;
				}
			}
			currentAncestor = currentAncestor.parentNode;
		}
		return null; // No match found
	};

	/**
	 * Computes the effective height of a DOM element.
	 * @private
	 * @param  {Node} domElement - The element to measure
	 * @return {Number} The element's height in pixels
	 */
	var getComputedElementHeight = function (domElement) {
		if (!domElement || typeof domElement.scrollHeight === 'undefined') {
			return 0;
		}
		// Uses scrollHeight, offsetHeight, and clientHeight for robust measurement
		return Math.max(domElement.scrollHeight, domElement.offsetHeight, domElement.clientHeight);
	};

	/**
	 * Sanitizes a string for use as a CSS selector, especially for IDs.
	 * This prevents issues with special characters in IDs when using querySelector.
	 * Based on Mathias Bynens' CSS.escape polyfill.
	 * @private
	 * @param {String} inputIdentifier - The ID string to escape
	 * @returns {String} The escaped string
	 */
	var prepareIdForSelection = function (inputIdentifier) {
		var rawString = String(inputIdentifier);
		var strLen = rawString.length;
		var charIdx = -1;
		var charCode;
		var processedResult = '';
		var initialCharCode = rawString.charCodeAt(0);

		while (++charIdx < strLen) {
			charCode = rawString.charCodeAt(charIdx);

			// Handle NULL character (U+0000)
			if (charCode === 0x0000) {
				throw new Error('InvalidCharacterError: Input contains U+0000.');
			}

			// Special handling for characters that need escaping with a hex code and space
			if (
				(charCode >= 0x0001 && charCode <= 0x001F) || charCode === 0x007F || // Control characters
				(charIdx === 0 && charCode >= 0x0030 && charCode <= 0x0039) || // Digit as first char
				(charIdx === 1 && charCode >= 0x0030 && charCode <= 0x0039 && initialCharCode === 0x002D) // Digit as second char after hyphen
			) {
				processedResult += '\\' + charCode.toString(16) + ' ';
				continue;
			}

			// Characters that are allowed as-is or need simple backslash escaping
			if (
				charCode >= 0x0080 || // Non-ASCII
				charCode === 0x002D || // Hyphen
				charCode === 0x005F || // Underscore
				(charCode >= 0x0030 && charCode <= 0x0039) || // Digits 0-9
				(charCode >= 0x0041 && charCode <= 0x005A) || // Uppercase A-Z
				(charCode >= 0x0061 && charCode <= 0x007A)    // Lowercase a-z
			) {
				processedResult += rawString.charAt(charIdx);
				continue;
			}

			// Default: simple backslash escape
			processedResult += '\\' + rawString.charAt(charIdx);
		}
		return processedResult;
	};

	/**
	 * Calculates the easing factor for animation based on type and time progress.
	 * @private
	 * @link https://gist.github.com/gre/1650294
	 * @param {String} easingType - The name of the easing function
	 * @param {Number} progressTime - Normalized time (0.0 to 1.0)
	 * @returns {Number} The eased progress value
	 */
	var computeEasingFactor = function (easingType, progressTime) {
		var calculatedFactor;
		switch (easingType) {
			case 'easeInQuad':
				calculatedFactor = progressTime * progressTime;
				break;
			case 'easeOutQuad':
				calculatedFactor = progressTime * (2 - progressTime);
				break;
			case 'easeInOutQuad':
				calculatedFactor = progressTime < 0.5 ? 2 * progressTime * progressTime : -1 + (4 - 2 * progressTime) * progressTime;
				break;
			case 'easeInCubic':
				calculatedFactor = progressTime * progressTime * progressTime;
				break;
			case 'easeOutCubic':
				calculatedFactor = (--progressTime) * progressTime * progressTime + 1;
				break;
			case 'easeInOutCubic':
				calculatedFactor = progressTime < 0.5 ? 4 * progressTime * progressTime * progressTime : (progressTime - 1) * (2 * progressTime - 2) * (2 * progressTime - 2) + 1;
				break;
			case 'easeInQuart':
				calculatedFactor = progressTime * progressTime * progressTime * progressTime;
				break;
			case 'easeOutQuart':
				calculatedFactor = 1 - (--progressTime) * progressTime * progressTime * progressTime;
				break;
			case 'easeInOutQuart':
				calculatedFactor = progressTime < 0.5 ? 8 * progressTime * progressTime * progressTime * progressTime : 1 - 8 * (--progressTime) * progressTime * progressTime * progressTime;
				break;
			case 'easeInQuint':
				calculatedFactor = progressTime * progressTime * progressTime * progressTime * progressTime;
				break;
			case 'easeOutQuint':
				calculatedFactor = 1 + (--progressTime) * progressTime * progressTime * progressTime * progressTime;
				break;
			case 'easeInOutQuint':
				calculatedFactor = progressTime < 0.5 ? 16 * progressTime * progressTime * progressTime * progressTime * progressTime : 1 + 16 * (--progressTime) * progressTime * progressTime * progressTime * progressTime;
				break;
			default:
				calculatedFactor = progressTime; // Linear if no match
				break;
		}
		return calculatedFactor;
	};

	/**
	 * Determines the final vertical scroll position for a given anchor.
	 * @private
	 * @param {Element} targetAnchor - The element to scroll into view
	 * @param {Number} fixedHeaderOffset - Height of any fixed header
	 * @param {Number} userOffset - Additional pixel offset from user settings
	 * @returns {Number} The absolute pixel position to scroll to
	 */
	var calculateScrollDestination = function (targetAnchor, fixedHeaderOffset, userOffset) {
		var finalPosition = 0;
		var currentElement = targetAnchor;

		if (!currentElement) {
			return 0; // If anchor is null, scroll to top
		}

		// Accumulate offsetTop values from all parent elements
		while (currentElement) {
			finalPosition += currentElement.offsetTop;
			currentElement = currentElement.offsetParent;
		}

		// Adjust for fixed header and user-defined offset
		finalPosition = finalPosition - fixedHeaderOffset - userOffset;
		// Ensure position is not negative
		return Math.max(0, finalPosition);
	};

	/**
	 * Retrieves the total scrollable height of the document.
	 * @private
	 * @returns {Number} The maximum possible scroll position vertically
	 */
	var fetchDocumentScrollHeight = function () {
		return Math.max(
			document.body.scrollHeight, document.documentElement.scrollHeight,
			document.body.offsetHeight, document.documentElement.offsetHeight,
			document.body.clientHeight, document.documentElement.clientHeight
		);
	};

	/**
	 * Parses a JSON string from a data attribute into an object.
	 * @private
	 * @param {String} jsonString - The JSON string from a data attribute
	 * @returns {Object} Parsed options or an empty object on failure
	 */
	var decodeAttributeOptions = function (jsonString) {
		if (!jsonString || !(typeof JSON === 'object' && typeof JSON.parse === 'function')) {
			return {};
		}
		try {
			return JSON.parse(jsonString);
		} catch (e) {
			console.warn('Smooth Scroller: Could not parse data-options attribute.', e);
			return {};
		}
	};

	/**
	 * Updates the browser's URL hash without causing a page reload.
	 * @private
	 * @param {String} hashValue - The hash to set (e.g., '#section-id')
	 * @param {Boolean} shouldUpdate - Flag indicating if history should be updated
	 */
	var updateBrowserUrl = function (hashValue, shouldUpdate) {
		if (currentWindow.history && currentWindow.history.pushState && (shouldUpdate || shouldUpdate === 'true')) {
			var currentProtocol = currentWindow.location.protocol;
			var currentHost = currentWindow.location.host;
			var currentPath = currentWindow.location.pathname;
			var currentSearch = currentWindow.location.search;

			currentWindow.history.pushState(null, null, `${currentProtocol}//${currentHost}${currentPath}${currentSearch}${hashValue}`);
		}
	};

	/**
	 * Calculates the effective height of a potential sticky header.
	 * @private
	 * @param {Element|null} headerElement - The DOM element identified as the sticky header
	 * @returns {Number} The total height of the sticky header, or 0 if none
	 */
	var computeStickyHeaderTotalHeight = function (headerElement) {
		if (!headerElement || typeof headerElement.offsetTop === 'undefined') {
			return 0;
		}
		// Considers the element's actual height plus any top offset (e.g., margin-top)
		return getComputedElementHeight(headerElement) + headerElement.offsetTop;
	};

	/**
	 * Initiates the smooth scrolling animation to a specific target.
	 * @public
	 * @param {Element} triggerElement - The element that initiated the scroll (e.g., a link)
	 * @param {String} targetHash - The hash string of the target element (e.g., '#my-section')
	 * @param {Object} customOptions - Optional overrides for the current configuration
	 */
	pageScroller.initiateSmoothScroll = function (triggerElement, targetHash, customOptions) {

		// Initialize/merge settings
		var currentScrollSettings = mergeConfigurations(currentConfig || defaultOptions, customOptions || {});
		var attributeOverrides = decodeAttributeOptions(triggerElement ? triggerElement.getAttribute('data-scroll-options') : null);
		currentScrollSettings = mergeConfigurations(currentScrollSettings, attributeOverrides);

		// Sanitize and select the target element
		var cleanedHash = prepareIdForSelection(targetHash.substring(1)); // Remove '#' and escape
		var targetDomElement = (targetHash === '#') ? document.documentElement : document.querySelector('#' + cleanedHash);

		// Guard clause for non-existent target
		if (!targetDomElement) {
			console.warn('Smooth Scroller: Target element not found for hash: ' + targetHash);
			return;
		}

		// Capture initial state
		var startYPosition = currentWindow.pageYOffset;
		var totalPageHeight = fetchDocumentScrollHeight();

		// Ensure sticky header height is determined
		if (!stickyElement) {
			stickyElement = document.querySelector('[data-scroll-header]');
		}
		if (typeof stickyElementHeight === 'undefined' || stickyElementHeight === null) {
			stickyElementHeight = computeStickyHeaderTotalHeight(stickyElement);
		}

		// Calculate final scroll position
		var destinationYPosition = calculateScrollDestination(
			targetDomElement,
			stickyElementHeight,
			parseInt(currentScrollSettings.verticalOffset, 10)
		);

		var scrollDistance = destinationYPosition - startYPosition;
		var elapsedTime = 0;
		var animationFrameInterval = 16; // Approximately 60fps
		var currentScrollProgress, easedScrollPosition;


		// Update URL before animation if configured
		updateBrowserUrl(targetHash, currentScrollSettings.updateHistory);

		/**
		 * Checks conditions to stop the ongoing scroll animation.
		 * @private
		 * @param {Number} currentY - The current actual scroll position
		 * @param {Number} finalY - The intended final scroll position
		 * @param {Number} intervalID - The ID of the animation interval
		 */
		var stopScrollAnimation = function (currentY, finalY, intervalID) {
			var windowBottom = currentWindow.innerHeight + currentWindow.pageYOffset;
			// Stop if target reached, or if scrolled to top/bottom of the page
			if (currentY === finalY || currentWindow.pageYOffset === finalY || (windowBottom >= totalPageHeight)) {
				clearInterval(intervalID);
				// Attempt to focus the target element for accessibility
				if (targetDomElement && typeof targetDomElement.focus === 'function') {
					setTimeout(function() { // Small delay to ensure browser finished layout
						targetDomElement.focus();
					}, 50);
				}
				currentScrollSettings.afterScrollCallback(triggerElement, targetHash); // Execute post-animation callback
			}
		};

		/**
		 * Executes a single frame of the scroll animation.
		 * @private
		 */
		var animateSingleFrame = function () {
			elapsedTime += animationFrameInterval;
			currentScrollProgress = (elapsedTime / parseInt(currentScrollSettings.scrollDuration, 10));
			currentScrollProgress = Math.min(1, currentScrollProgress); // Cap at 1.0

			easedScrollPosition = startYPosition + (scrollDistance * computeEasingFactor(currentScrollSettings.easingCurve, currentScrollProgress));

			currentWindow.scrollTo(0, Math.floor(easedScrollPosition));
			stopScrollAnimation(easedScrollPosition, destinationYPosition, animationTimerId);
		};

		/**
		 * Begins the animation loop.
		 * @private
		 */
		var startAnimationLoop = function () {
			currentScrollSettings.beforeScrollCallback(triggerElement, targetHash); // Execute pre-animation callback
			animationTimerId = setInterval(animateSingleFrame, animationFrameInterval);
		};

		// Fix for iOS bug where pageYOffset can be incorrect at 0
		if (currentWindow.pageYOffset === 0) {
			currentWindow.scrollTo(0, 0);
		}

		// Kick off the scrolling
		startAnimationLoop();

	};

	/**
	 * Handles click events on elements with `data-scroll` attribute.
	 * @private
	 * @param {Event} clickEvent - The DOM click event
	 */
	var delegateClickHandler = function (clickEvent) {
		var scrollTrigger = findMatchingAncestor(clickEvent.target, '[data-scroll]');
		if (scrollTrigger && scrollTrigger.tagName && scrollTrigger.tagName.toLowerCase() === 'a') {
			clickEvent.preventDefault(); // Prevent default anchor jump behavior
			pageScroller.initiateSmoothScroll(scrollTrigger, scrollTrigger.hash, currentConfig); // Trigger smooth scroll
		}
	};

	/**
	 * Debounces window resize events to prevent excessive recalculations.
	 * @private
	 * @param {Event} resizeEvent - The DOM resize event
	 */
	var handleResizeThrottled = function (resizeEvent) {
		if (animationTimerId) { // Rename to resizeTimerId
			clearTimeout(animationTimerId);
		}
		animationTimerId = setTimeout(function() {
			animationTimerId = null; // Reset the timer ID
			stickyElementHeight = computeStickyHeaderTotalHeight(stickyElement); // Recalculate header height
		}, 100); // Wait 100ms after last resize event
	};

	/**
	 * Resets the module to its initial state, removing event listeners.
	 * @public
	 */
	pageScroller.tearDown = function () {

		// If not initialized, nothing to tear down
		if ( !currentConfig ) {
			return;
		}

		// Remove event listeners to prevent memory leaks and unwanted behavior
		document.removeEventListener('click', delegateClickHandler, false);
		currentWindow.removeEventListener('resize', handleResizeThrottled, false);

		// Reset all internal state variables
		currentConfig = null;
		animationTimerId = null;
		stickyElement = null;
		stickyElementHeight = null;
	};

	/**
	 * Initializes the smooth scrolling functionality.
	 * @public
	 * @param {Object} userConfiguration - Custom settings to override defaults
	 */
	pageScroller.initialize = function (userConfiguration) {

		// Perform initial browser feature check
		if ( !browserSupport ) {
			console.warn('Smooth Scroller: Browser does not support required features.');
			return;
		}

		// Destroy any previous instances to ensure a clean setup
		pageScroller.tearDown();

		// Merge user options with default settings
		currentConfig = mergeConfigurations(defaultOptions, userConfiguration || {});

		// Identify and measure the fixed header only once on initialization
		stickyElement = document.querySelector('[data-scroll-header]');
		stickyElementHeight = computeStickyHeaderTotalHeight(stickyElement);

		// Attach event listeners
		document.addEventListener('click', delegateClickHandler, false);
		if (stickyElement) { // Only listen for resize if a sticky header exists
			currentWindow.addEventListener('resize', handleResizeThrottled, false);
		}

	};


	//
	// Expose Public API
	//

	return pageScroller;

});