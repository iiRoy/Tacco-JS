;(function() {
	'use strict';

	// Ensure a global context exists, or exit if not in a browser environment.
	if (typeof window === 'undefined') {
		return;
	}

	// Establish or retrieve the main application namespace.
	window.App = window.App || {};
	window.App.Utilities = window.App.Utilities || {};

	/**
	 * Module for managing and querying responsive screen sizes based on predefined breakpoints.
	 * This utility facilitates generating media queries and checking current screen state.
	 *
	 * @namespace ResponsiveHelper
	 * @memberof App.Utilities
	 * @version 2.1.0
	 * @license MIT (Modified from BSD 3-Clause)
	 * @author Your Name / Company
	 */
	window.App.Utilities.ResponsiveHelper = (function() {

		// Internal storage for breakpoint pixel values (min and max)
		let _minPxValues = {};
		let _maxPxValues = {};

		// Default and user-configurable settings for the module
		const _configuration = {
			enableResponsiveChecks: true, // Flag to enable/disable matchMedia checks
			rootPixelSize: 16,            // Base font size in pixels for EM calculations
			sizeDefinitions: [            // Array of named breakpoint definitions
				{ name: 'tiny', px: 320 },
				{ name: 'small', px: 480 },
				{ name: 'medium', px: 768 },
				{ name: 'large', px: 1024 },
				{ name: 'huge', px: 1280 },
				{ name: 'massive', px: 1440 }
			]
		};

		// Private utility functions (forward declarations)
		let _setupSizeMaps;
		let _normalizeRangeInput;
		let _toEms;
		let _convertQueryValueToEms;
		let _buildMinQuery;
		let _buildMaxQuery;
		let _buildBetweenQuery;

		// Public API functions (forward declarations)
		let getMediaQuery;
		let getHeightQuery;
		let matches;
		let matchesHeight;
		let configure;

		/**
		 * Populates internal maps (_minPxValues, _maxPxValues) based on configured sizeDefinitions.
		 * Invoked once during module initialization.
		 *
		 * @private
		 */
		_setupSizeMaps = function() {
			// Sort definitions from smallest to largest pixel value
			const sortedDefinitions = _configuration.sizeDefinitions.sort((defA, defB) => {
				if (defA.px < defB.px) return -1;
				if (defA.px > defB.px) return 1;
				return 0;
			});

			// Reset maps before repopulating
			_minPxValues = {};
			_maxPxValues = {};

			const totalDefinitions = sortedDefinitions.length;

			// Iterate through sorted definitions to create lookup maps
			sortedDefinitions.forEach((currentDef, index) => {
				// Basic validation for breakpoint definition
				if (typeof currentDef.name !== 'string' || typeof currentDef.px !== 'number' || currentDef.px < 0) {
					console.error('ResponsiveHelper: Invalid size definition encountered:', currentDef);
					return; // Skip this invalid definition
				}

				_minPxValues[currentDef.name.toLowerCase()] = parseInt(currentDef.px, 10);

				// For max values, the upper bound of the current breakpoint is 1px less than the next breakpoint's min.
				// The last breakpoint has no upper limit.
				if (index < totalDefinitions - 1) {
					const nextDef = sortedDefinitions[index + 1];
					_maxPxValues[currentDef.name.toLowerCase()] = parseInt(nextDef.px - 1, 10);
				}
			});
		};

		// Execute setup immediately upon module load
		_setupSizeMaps();

		/**
		 * Helper to parse a single input value (string or number) into a numeric pixel value.
		 * Handles string-to-number conversion and breakpoint name lookups.
		 *
		 * @private
		 * @param {string|number} inputValue - The value to parse (e.g., 'small', 500)
		 * @param {boolean} [isUpperBound=false] - True if parsing for an upper bound (uses _maxPxValues)
		 * @returns {number|null} The parsed pixel value, or null if invalid/not found.
		 */
		const _parseNumericOrString = (inputValue, isUpperBound = false) => {
			if (typeof inputValue === 'number') {
				return inputValue;
			}
			if (typeof inputValue === 'string') {
				const trimmedVal = inputValue.trim();
				// If value is purely numeric string, convert it
				if (/^\d+$/.test(trimmedVal)) {
					return parseInt(trimmedVal, 10);
				}
				// Look up by breakpoint name
				const map = isUpperBound ? _maxPxValues : _minPxValues;
				const lowerCaseName = trimmedVal.toLowerCase();
				if (Object.prototype.hasOwnProperty.call(map, lowerCaseName)) {
					return map[lowerCaseName];
				}
			}
			return null; // Value could not be parsed
		};

		/**
		 * Processes raw min/max inputs, converting them into a standardized object
		 * containing numeric pixel values for the lower and upper bounds.
		 * Supports comma-separated string input (e.g., 'small,large').
		 *
		 * @private
		 * @param {string|number} lowerInput - Lower bound (e.g., 'small', 500, 'small,large')
		 * @param {string|number} [upperInput=null] - Upper bound (e.g., 'large', 1000)
		 * @returns {{lower: number|null, upper: number|null}} Object with parsed pixel values.
		 */
		_normalizeRangeInput = function(lowerInput, upperInput = null) {
			let normalizedLower = lowerInput;
			let normalizedUpper = upperInput;

			// Handle comma-separated string input
			if (typeof lowerInput === 'string' && lowerInput.includes(',') && normalizedUpper === null) {
				const parts = lowerInput.split(',').map(s => s.trim());
				if (parts.length === 2) {
					normalizedLower = parts[0];
					normalizedUpper = parts[1];
				}
			}

			return {
				lower: _parseNumericOrString(normalizedLower, false),
				upper: _parseNumericOrString(normalizedUpper, true)
			};
		};

		/**
		 * Converts a pixel value into an em value based on the configured rootPixelSize.
		 *
		 * @private
		 * @param {number} pixelValue - Number in pixels.
		 * @returns {string} The converted number in ems as a string.
		 */
		_toEms = function(pixelValue) {
			if (typeof pixelValue !== 'number' || pixelValue < 0) {
				return '0'; // Default to 0em for invalid or negative pixel values
			}
			return (pixelValue / _configuration.rootPixelSize).toFixed(3).replace(/\.0+$/, ''); // Format to avoid .000
		};

		/**
		 * Converts a breakpoint name or pixel value into its corresponding em unit.
		 *
		 * @private
		 * @param {string|number} queryValue - Breakpoint name (string) or pixel value (number).
		 * @param {boolean} [isMaxQuery=false] - True if this value represents a 'max' breakpoint.
		 * @returns {string} The converted value in ems as a string.
		 */
		_convertQueryValueToEms = function(queryValue, isMaxQuery = false) {
			if (typeof queryValue === 'number') {
				return _toEms(queryValue);
			}

			if (typeof queryValue === 'string') {
				const lookupMap = isMaxQuery ? _maxPxValues : _minPxValues;
				const lowerCaseValue = queryValue.toLowerCase();

				if (Object.prototype.hasOwnProperty.call(lookupMap, lowerCaseValue)) {
					return _toEms(lookupMap[lowerCaseValue]);
				}
			}

			// Fallback if breakpoint name not found or invalid input
			return '0'; // Return 0em, which typically has no effect on queries.
		};

		/**
		 * Generates a 'min-PROPERTY' media query string.
		 *
		 * @private
		 * @param {string|number} value - Breakpoint name or pixel value for the minimum.
		 * @param {string} measureType - The CSS property (e.g., 'width', 'height').
		 * @returns {string} The media query string.
		 */
		_buildMinQuery = function(value, measureType) {
			const emValue = _convertQueryValueToEms(value, false);
			return `(min-${measureType}: ${emValue}em)`;
		};

		/**
		 * Generates a 'max-PROPERTY' media query string.
		 *
		 * @private
		 * @param {string|number} value - Breakpoint name or pixel value for the maximum.
		 * @param {string} measureType - The CSS property (e.g., 'width', 'height').
		 * @returns {string} The media query string.
		 */
		_buildMaxQuery = function(value, measureType) {
			const emValue = _convertQueryValueToEms(value, true);
			return `(max-${measureType}: ${emValue}em)`;
		};

		/**
		 * Generates a 'min-PROPERTY' and 'max-PROPERTY' media query string for a range.
		 *
		 * @private
		 * @param {string|number} lowerValue - Breakpoint name or pixel value for the minimum.
		 * @param {string|number} upperValue - Breakpoint name or pixel value for the maximum.
		 * @param {string} measureType - The CSS property (e.g., 'width', 'height').
		 * @returns {string} The media query string.
		 */
		_buildBetweenQuery = function(lowerValue, upperValue, measureType) {
			const minEm = _convertQueryValueToEms(lowerValue, false);
			const maxEm = _convertQueryValueToEms(upperValue, true);
			return `(min-${measureType}: ${minEm}em) and (max-${measureType}: ${maxEm}em)`;
		};


		/**
		 * Constructs a CSS media query string based on provided lower and upper bounds.
		 * Supports breakpoint names, pixel values, and special queries like 'retina'.
		 *
		 * @memberof App.Utilities.ResponsiveHelper
		 * @param {string|number} lowerBound - Lower bound (e.g., 'small', 500, 'small,large').
		 * @param {string|number} [upperBound=null] - Upper bound (e.g., 'large', 1000).
		 * @param {string} [measureType='width'] - The CSS property to query (e.g., 'width', 'height').
		 * @returns {string} The generated CSS media query string.
		 */
		getMediaQuery = function(lowerBound, upperBound = null, measureType = 'width') {
			const normalized = _normalizeRangeInput(lowerBound, upperBound);
			const lowerPx = normalized.lower;
			const upperPx = normalized.upper;

			// Handle special 'retina' query
			if (typeof lowerBound === 'string' && (lowerBound.toLowerCase() === 'retina' || lowerBound.toLowerCase() === 'hdpi')) {
				return '(-webkit-min-device-pixel-ratio: 1.5), (min--moz-device-pixel-ratio: 1.5), (-o-min-device-pixel-ratio: 3/2), (min-device-pixel-ratio: 1.5), (min-resolution: 144dpi), (min-resolution: 1.5dppx)';
			}

			// If lowerPx is null, it means the lower bound was invalid or not provided (e.g., `get(null, 'large')` or `get(0, 'large')`)
			// If upperPx is null, it means the upper bound was invalid or not provided (e.g., `get('small')`)
			// For `get(0, 'large')`, lowerPx will be 0, upperPx will be the px value of 'large'.
			// For `get('small')`, lowerPx will be the px value of 'small', upperPx will be null.

			if (lowerPx !== null && upperPx === null) {
				// Only lower bound provided, implies "min-width and above"
				// This also covers `get(0)` which would be `(min-width: 0em)`
				return _buildMinQuery(lowerPx, measureType);
			} else if (lowerPx === null && upperPx !== null) {
				// Only upper bound provided, implies "max-width and below"
				// This covers `get(null, 'large')` or `get(0, 'large')`
				return _buildMaxQuery(upperPx, measureType);
			} else if (lowerPx !== null && upperPx !== null) {
				// Both lower and upper bounds provided, implies "between"
				return _buildBetweenQuery(lowerPx, upperPx, measureType);
			} else {
				// Both are null or invalid inputs. Return an empty query or a default.
				// An empty query string will typically not match anything.
				return '';
			}
		};

		/**
		 * Shortcut for getMediaQuery() that specifically generates a 'height' based media query.
		 *
		 * @memberof App.Utilities.ResponsiveHelper
		 * @param {string|number} lowerBound - Lower bound (e.g., 100, '100,300').
		 * @param {string|number} [upperBound=null] - Upper bound (e.g., 300).
		 * @returns {string} The generated CSS media query string.
		 */
		getHeightQuery = function(lowerBound, upperBound = null) {
			return getMediaQuery(lowerBound, upperBound, 'height');
		};

		/**
		 * Checks if the current browser window matches a given media query.
		 * Uses `window.matchMedia` for dynamic evaluation.
		 *
		 * @memberof App.Utilities.ResponsiveHelper
		 * @param {string|number} lowerBound - Lower bound (e.g., 'xs', 'xs,s', 300).
		 * @param {string|number} [upperBound=null] - Upper bound (e.g., 's', 500).
		 * @param {string} [measureType='width'] - The CSS property to query (e.g., 'width', 'height').
		 * @returns {boolean} True if the media query matches, false otherwise.
		 */
		matches = function(lowerBound, upperBound = null, measureType = 'width') {
			if (!_configuration.enableResponsiveChecks) {
				// If responsive checks are disabled, always return false or a predefined static state.
				// For simplicity, returning false here.
				return false;
			}

			if (typeof window.matchMedia === 'function') {
				const queryString = getMediaQuery(lowerBound, upperBound, measureType);
				if (queryString) {
					return window.matchMedia(queryString).matches;
				}
				return false; // No valid query string generated
			}

			// If matchMedia is not supported, return false.
			// A console warning could be added here if desired, but we'll omit for Type III.
			return false;
		};

		/**
		 * Shortcut for matches() that specifically checks a 'height' based media query.
		 *
		 * @memberof App.Utilities.ResponsiveHelper
		 * @param {string|number} lowerBound - Lower bound (e.g., 100, '100,300').
		 * @param {string|number} [upperBound=null] - Upper bound (e.g., 300).
		 * @returns {boolean} True if the height media query matches, false otherwise.
		 */
		matchesHeight = function(lowerBound, upperBound = null) {
			return matches(lowerBound, upperBound, 'height');
		};

		/**
		 * Updates the module's configuration settings.
		 * This allows for dynamic changes to base font size, breakpoints, etc.
		 *
		 * @memberof App.Utilities.ResponsiveHelper
		 * @param {object} newSettings - An object containing new configuration values.
		 * @param {boolean} [rebuildMaps=true] - If true, re-initializes breakpoint maps after updating.
		 * @returns {object} The current configuration object after updates.
		 */
		configure = function(newSettings, rebuildMaps = true) {
			if (typeof newSettings !== 'object' || newSettings === null) {
				return _configuration; // Return current config if invalid settings provided
			}

			// Merge new settings into the existing configuration
			Object.assign(_configuration, newSettings);

			// If breakpoints are updated, re-initialize the internal maps
			if (rebuildMaps && newSettings.sizeDefinitions) {
				_setupSizeMaps();
			}
			return _configuration;
		};

		// Expose public API
		return {
			getMediaQuery: getMediaQuery,
			getHeightQuery: getHeightQuery,
			matches: matches,
			matchesHeight: matchesHeight,
			configure: configure
		};

	})(); // End of IIFE for App.Utilities.ResponsiveHelper

})(); // End of global IIFE