/*
 * TRIANGLEcorp flowmotion
 * https://trianglecorp.net
 *
 * Time: 15/07/2023
 * Release 2.0.0
 */


/**
 * Main module for the flowmotion system.
 * This function encapsulates all responsive logic.
 *
 * @param {Window} winRef - Reference to the global window object.
 * @param {Document} docRef - Reference to the global document object.
 * @param {jQuery} jqRef - Reference to the jQuery library.
 * @returns {object} Public API for the flowmotion module.
 */
var flowmotion = function(winRef, docRef, jqRef) {

	// ##########################################
	// Internal state variables
	var _mediaPoints = {}; // Stores all programmatically defined media query points
	var _sizeProbe = null; // A hidden DOM element utilized for dimension calculations
	var _fontSizeCheckDelay = 750; // Milliseconds between font size re-evaluations
	var _fontSizeWatcher = null; // Timer object for monitoring font size changes
	var _initialFontSize = null; // Baseline font size value for comparison
	var _activeMediaPoint = null; // The name of the currently active media query point
	var _previousMediaPoint = null; // The name of the media query point active just before the current one

	var _cssTags = ["small","medium","base","wide"]; // Standard CSS-driven media point labels


	// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
	// Module Initialization

	/**
	 * Sets up all necessary listeners and initial state when the DOM is fully loaded.
	 *
	 * @function setupModule
	 * @returns {void}
	 */
	var setupModule = function() {
		jqRef(function() {
			establishSizeProbe();

			// Event handler for viewport dimension changes
			jqRef(winRef).on("resize", function() {
				evaluateMediaPoints();
				renderUpdate();
			});

			// Begin monitoring for font size modifications
			_initialFontSize = getSizeProbeHeight();
			beginFontSizeMonitoring();

			// Determine the initial media point status
			evaluateMediaPoints();

			// Trigger an initial rendering cycle
			renderUpdate();
		});
	};

	// ************************************************************************
	// Core Functionality

	/**
	 * Emits a 'renderUpdate' event to signal UI components to refresh.
	 *
	 * @function renderUpdate
	 * @returns {void}
	 */
	var renderUpdate = function() {
		jqRef(winRef).trigger("renderUpdate");
	};

	/**
	 * Conducts checks against all programmatically defined media query points.
	 *
	 * @function checkProgrammaticPoints
	 * @returns {void}
	 */
	var checkProgrammaticPoints = function() {
		// Assess our custom-defined media points
		let activePoint = null;
		for (const pointKey in _mediaPoints) {
			if (testIndividualPoint(pointKey)) {
				activePoint = pointKey;
				break;
			}
		}

		// Trigger an event only if the active point has changed
		if (_activeMediaPoint !== activePoint) {
			_previousMediaPoint = _activeMediaPoint;
			_activeMediaPoint = activePoint;
			applyBodyClass();
			dispatchPointChange();
		}
	};

	/**
	 * Evaluates the currently active CSS-driven media query tag.
	 *
	 * @function checkCSSPoints
	 * @returns {void}
	 */
	var checkCSSPoints = function() {
		// Examine the CSS media query tags
		const currentTag = fetchResponsiveTag();
		if (currentTag.length > 0 && currentTag !== _activeMediaPoint) {
			// console.info(_activeMediaPoint + " -> " + currentTag); // Example debug log
			_previousMediaPoint = _activeMediaPoint;
			_activeMediaPoint = currentTag;
			applyBodyClass();
			dispatchPointChange();
		}
	};

	/**
	 * Dispatches custom events indicating a change in the active media point.
	 *
	 * @function dispatchPointChange
	 * @returns {void}
	 */
	var dispatchPointChange = function() {
		jqRef(winRef).trigger(_activeMediaPoint + "Activated");
		jqRef(winRef).trigger(_previousMediaPoint + "Deactivated");
		jqRef(winRef).trigger("mediaPointChanged", [_activeMediaPoint, _previousMediaPoint]);
	};

	/**
	 * The primary method to determine and update the active media point.
	 * Prioritizes programmatic points over CSS-defined ones if available.
	 *
	 * @function evaluateMediaPoints
	 * @returns {void}
	 */
	var evaluateMediaPoints = function() {
		if (countProgrammaticPoints()) {
			// If custom media points are defined, they take precedence
			checkProgrammaticPoints();
		} else {
			// Otherwise, rely on CSS-driven media points
			checkCSSPoints();
		}
	};

	/**
	 * Cleans up previous media point classes from the 'body' element
	 * and adds the class corresponding to the currently active media point.
	 *
	 * @function applyBodyClass
	 * @returns {void}
	 */
	var applyBodyClass = function() {
		let classNamesToRemove = "";
		// Determine if we are using custom points or CSS tags
		if (countProgrammaticPoints()) {
			for (const pointKey in _mediaPoints) {
				classNamesToRemove += pointKey + " ";
			}
		} else {
			for (let idx = 0; idx < _cssTags.length; idx++) {
				classNamesToRemove += _cssTags[idx] + " ";
			}
		}
		jqRef("body").removeClass(classNamesToRemove);
		jqRef("body").addClass(_activeMediaPoint);
	};

	/**
	 * Initiates a recurring timer to periodically check for font size changes.
	 *
	 * @function beginFontSizeMonitoring
	 * @returns {void}
	 */
	var beginFontSizeMonitoring = function() {
		_fontSizeWatcher = winRef.setInterval(recheckFontSize, _fontSizeCheckDelay);
	};

	/**
	 * Halts the interval timer responsible for monitoring font size adjustments.
	 *
	 * @function endFontSizeMonitoring
	 * @returns {void}
	 */
	var endFontSizeMonitoring = function() {
		winRef.clearTimeout(_fontSizeWatcher);
	};

	/**
	 * Compares the current height of the size probe against the stored baseline font size.
	 * Triggers a media point re-evaluation if a change is detected.
	 *
	 * @function recheckFontSize
	 * @returns {void}
	 */
	var recheckFontSize = function() {
		const currentProbeHeight = getSizeProbeHeight();
		if (currentProbeHeight !== _initialFontSize) {
			evaluateMediaPoints();
			_initialFontSize = currentProbeHeight;
		}
	};

	/**
	 * Provides the name of the media point that is currently active.
	 *
	 * @function getActiveMediaPoint
	 * @returns {string} The name of the active media point.
	 */
	var getActiveMediaPoint = function() {
		return _activeMediaPoint;
	};

	/**
	 * Injects a hidden `div` element into the document body to assist with
	 * dynamic measurement of font sizes and widths.
	 *
	 * @function establishSizeProbe
	 * @returns {void}
	 */
	var establishSizeProbe = function() {
		_sizeProbe = jqRef('<div class="flowmotion-probe"></div>');
		_sizeProbe.css({
			position: "fixed",
			visibility: "collapse",
			fontSize: "1.1em",
			height: "1.1em",
			width: "1.1em",
			padding: "1px",
			margin: "1px",
			top: "-10px",
			left: "-300px"
		});
		jqRef("body").append(_sizeProbe);
	};

	/**
	 * Resets the width of the size probe element to its natural (auto) state.
	 *
	 * @function resetProbeWidth
	 * @returns {void}
	 */
	var resetProbeWidth = function() {
		_sizeProbe.css({
			width: "auto"
		});
	};

	/**
	 * Calculates the rendered width of the size probe when its CSS width
	 * property is temporarily set to a specified value (e.g., "600px", "30em").
	 *
	 * @function getProbeCalculatedWidth
	 * @param {string} dimensionValue - The CSS width value to apply.
	 * @returns {number} The outer width of the probe in pixels.
	 */
	var getProbeCalculatedWidth = function(dimensionValue) {
		_sizeProbe.css({
			width: dimensionValue
		});
		let measuredWidth = _sizeProbe.outerWidth();
		resetProbeWidth();
		return measuredWidth;
	};

	/**
	 * Retrieves the current computed height of the hidden size probe element.
	 *
	 * @function getSizeProbeHeight
	 * @returns {number} The outer height of the probe in pixels.
	 */
	var getSizeProbeHeight = function() {
		return _sizeProbe.outerHeight();
	};

	/**
	 * Obtains the active CSS media query tag by inspecting the `content` property
	 * of the `::after` pseudo-element on the document body.
	 * Defaults to "base" if an error occurs or no tag is found.
	 *
	 * @function fetchResponsiveTag
	 * @returns {string} The active CSS tag or "base".
	 */
	var fetchResponsiveTag = function() {
		// Reference: https://example.com/responsive-css-tag-detection
		try {
			let currentTagValue = winRef.getComputedStyle(docRef.body, "::after").getPropertyValue("content");
			currentTagValue = currentTagValue.replace(/"/g, ''); // Fix for browser inconsistencies
			return currentTagValue;
		} catch (error) {
			return "base"; // Return a different default value
		}
	};

	/**
	 * Updates the internal list of recognized CSS-driven media point labels.
	 *
	 * @function updateCSSTags
	 * @param {string[]} newTagList - An array of CSS tag strings.
	 * @returns {void}
	 */
	var updateCSSTags = function(newTagList) {
		_cssTags = newTagList;
	};

	/**
	 * Retrieves the current height of the browser viewport.
	 *
	 * @function getViewportHeight
	 * @returns {number} The viewport height in pixels.
	 */
	var getViewportHeight = function() {
		return jqRef(winRef).height();
	};

	/**
	 * Retrieves the current width of the browser viewport.
	 *
	 * @function getViewportWidth
	 * @returns {number} The viewport width in pixels.
	 */
	var getViewportWidth = function() {
		return jqRef(winRef).width();
	};

	/**
	 * Erases all currently defined programmatic media query points.
	 *
	 * @function resetMediaPoints
	 * @returns {void}
	 */
	var resetMediaPoints = function() {
		_mediaPoints = {};
	};

	/**
	 * Registers a new programmatic media query point with optional minimum and maximum width constraints.
	 *
	 * @function registerMediaPoint
	 * @param {string} pointIdentifier - A unique name for the media point.
	 * @param {string} [minDimension="0"] - The minimum width (e.g., "600px", "30em").
	 * @param {string} [maxDimension="99999999px"] - The maximum width (e.g., "800px", "40em").
	 * @returns {void}
	 */
	var registerMediaPoint = function(pointIdentifier, minDimension, maxDimension) {
		if (minDimension === undefined) minDimension = "0";
		if (maxDimension === undefined) maxDimension = "99999999px";
		_mediaPoints[pointIdentifier] = {
			minConstraint: minDimension,
			maxConstraint: maxDimension
		};
	};

	/**
	 * Deletes a previously registered programmatic media query point by its identifier.
	 *
	 * @function deregisterMediaPoint
	 * @param {string} pointIdentifier - The identifier of the media point to remove.
	 * @returns {void}
	 */
	var deregisterMediaPoint = function(pointIdentifier) {
		delete _mediaPoints[pointIdentifier];
	};

	/**
	 * Reports the total number of currently defined programmatic media query points.
	 *
	 * @function countProgrammaticPoints
	 * @returns {number} The count of registered media points.
	 */
	var countProgrammaticPoints = function() {
		let numPoints = 0;
		for (const pointKey in _mediaPoints) {
			numPoints++;
		}
		return numPoints;
	};


	/**
	 * Checks if the current viewport width falls within the defined
	 * minimum and maximum constraints of a specified programmatic media point.
	 *
	 * @function testIndividualPoint
	 * @param {string} pointIdentifier - The name of the media point to validate.
	 * @returns {boolean} True if the viewport is within the point's range, false otherwise.
	 */
	var testIndividualPoint = function(pointIdentifier) {
		const targetPoint = _mediaPoints[pointIdentifier];
		if (targetPoint) {
			const minVal = getProbeCalculatedWidth(targetPoint.minConstraint);
			const maxVal = getProbeCalculatedWidth(targetPoint.maxConstraint);
			const currentViewportWidth = getViewportWidth();
			if (currentViewportWidth >= minVal && currentViewportWidth <= maxVal) {
				return true;
			}
		}
		return false;
	};

	/**
	 * Obtains the precise width and height of the browser's visual viewport,
	 * offering a more consistent measurement across different browser environments.
	 *
	 * @function getTrueViewportDimensions
	 * @returns {object} An object containing `viewportWidth` and `viewportHeight` properties.
	 */
	// Source: https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth
	var getTrueViewportDimensions = function() {
		let viewportWidth;
		let viewportHeight;

		// Modern browsers leverage window.innerWidth and window.innerHeight
		if (typeof winRef.innerWidth !== 'undefined') {
			viewportWidth = winRef.innerWidth;
			viewportHeight = winRef.innerHeight;
		} else if (typeof docRef.documentElement !== 'undefined' &&
				typeof docRef.documentElement.clientWidth !== 'undefined' &&
				docRef.documentElement.clientWidth !== 0) {
			// Standards-compliant mode in older IE (e.g., IE9+)
			viewportWidth = docRef.documentElement.clientWidth;
			viewportHeight = docRef.documentElement.clientHeight;
		} else {
			// Fallback for very old browsers (e.g., IE8 and below)
			viewportWidth = docRef.getElementsByTagName('body')[0].clientWidth;
			viewportHeight = docRef.getElementsByTagName('body')[0].clientHeight;
		}
		return { viewportWidth: viewportWidth, viewportHeight: viewportHeight };
	};




	// ########################################################################
	// Exposed API
	var publicApi = {
		evaluateMediaPoints: evaluateMediaPoints,
		updateCSSTags: updateCSSTags,
		registerMediaPoint: registerMediaPoint,
		deregisterMediaPoint: deregisterMediaPoint,
		getActiveMediaPoint: getActiveMediaPoint,
		getViewportHeight: getViewportHeight,
		getViewportWidth: getViewportWidth,
		getTrueViewportDimensions: getTrueViewportDimensions
	};

	// ########################################################################
	setupModule();
	return publicApi;
}(this, this.document, this.jQuery);