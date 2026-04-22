;(function(builder) {
	// Checks for an Asynchronous Module Definition (AMD) loader like RequireJS.
	if (typeof define === 'function' && define.amd) {
		// Defines the module for AMD, listing 'jquery' as a dependency.
		define(['jquery'], builder);
	} else {
		// Falls back to a global jQuery object if no AMD loader is present.
		builder(window.jQuery);
	}
}(function(jqAlias) { // Renamed jQuery alias from '$' to 'jqAlias'

	'use strict'; // Enforces strict parsing and error handling in the code.

	/**
	 * Global jQuery-wrapped DOM elements for efficiency.
	 * @type {Object}
	 */
	var jqDocument    = jqAlias(document);
	var jqWindow      = jqAlias(window);

	/**
	 * Collection of CSS class names used by the resizing module.
	 * @type {Object}
	 */
	var cssClasses = {
		wrapper    : 'vps-container-wrapper', // Class for the containing element.
		mediaItem  : 'vps-visual-item',       // Class for the image or media element.
		concealed  : 'vps-hidden-state'       // Class to apply for hiding elements.
	};

	/**
	 * Preset configuration values for new instances of the module.
	 * @type {Object}
	 */
	var defaultOptions = {
		useCssScaling  : true,           // Flag to enable CSS 'background-size: cover' if supported.
		enclosureElement: 'parent',      // Defines the element that the visual content will fill ('parent' or a jQuery object).
		contentPlacement : {             // Specifies how the content should be positioned within its enclosure.
			horizontal: 'center',
			vertical  : 'center'
		},
		rateLimitInterval: 100           // The minimum delay (in ms) between consecutive resize events.
	};

	/**
	 * Feature detection: Determines if the browser supports the 'background-size' CSS property.
	 * @type {Boolean}
	 */
	var supportsBgCover = (function() {
		var temporaryDiv = document.createElement('div');
		var isSupported = ('backgroundSize' in temporaryDiv.style);
		// No need to append/remove temporaryDiv as only style property is accessed.
		return isSupported;
	})();

	/**
	 * Constructor function for the ViewportScaler module.
	 * Initializes a new instance to manage the scaling of a visual element.
	 * @constructor
	 * @param  {HTMLElement} visualElement   The raw DOM image element to be scaled.
	 * @param  {Object}      configSettings  Optional object to override default settings.
	 * @return {void}
	 */
	var ViewportScaler = function(visualElement, configSettings) {

		this.originalElement  = visualElement;        // Reference to the original DOM element.
		this.jqElement = jqAlias(visualElement);      // jQuery-wrapped version of the visual element.

		// Combines default settings with any user-provided configurations.
		this.configuration = jqAlias.extend({}, defaultOptions, configSettings);
		
		// Stores calculated dimensions and aspect ratios for the visual element and its container.
		this.dimensionMetrics   = {
			visual: { // Dimensions of the actual image/visual content.
				width : null,
				height: null
			},
			enclosure: { // Dimensions of the containing element.
				width : null,
				height: null
			},
			aspectRatios: { // Pre-calculated aspect ratios.
				visual    : null,
				enclosure: null
			}
		};

		// Identifies the jQuery object for the containing element.
		if (this.configuration.enclosureElement === 'parent') {
			this.jqEnclosure = this.jqElement.parent();
		} else if (this.configuration.enclosureElement instanceof jqAlias && this.configuration.enclosureElement.length) {
			this.jqEnclosure = this.configuration.enclosureElement;
		} else {
			this.logError('The configured enclosure element is either invalid or could not be found.');
			return; // Halts initialization if the container is problematic.
		}

		this.instanceId = this.createUniqueId(); // Assigns a unique identifier to this specific instance.

		this.initializeComponent(); // Kicks off the main setup and logic.

	};

	/**
	 * A shorthand alias to the prototype object for easier access to methods.
	 */
	ViewportScaler.prototypeShorthand = ViewportScaler.prototype;

	/**
	 * The core initialization method for the component.
	 * Applies CSS classes and determines the appropriate resizing strategy.
	 * @return {void}
	 */
	ViewportScaler.prototypeShorthand.initializeComponent = function() {

		// Adds necessary CSS classes to the visual item and its container.
		this.jqElement.addClass(cssClasses.mediaItem);
		this.jqEnclosure.addClass(cssClasses.wrapper);

		// Conditional logic to choose between CSS-based or JavaScript-based resizing.
		if (supportsBgCover && this.configuration.useCssScaling) {
			this.applyBackgroundStyling(); // Utilizes CSS 'background-size: cover'.
		} else if (!supportsBgCover || !this.configuration.useCssScaling) {
			this.registerEventHandlers(); // Sets up event listeners for manual resizing.
			this.performResizeOperation(); // Executes an initial resize.
		} else {
			this.logError('Failed to determine a valid resizing method for the current environment.');
			return; // Exits if no suitable method can be applied.
		}

	};

	/**
	 * Transforms the visual element into a CSS background image for its container.
	 * This method is used when 'background-size: cover' is the chosen strategy.
	 * @return {void}
	 */
	ViewportScaler.prototypeShorthand.applyBackgroundStyling = function() {

		var currentImage     = this.jqElement;
		var currentContainer = this.jqEnclosure;
		var placementDetails = this.configuration.contentPlacement;

		// Hides the original image element to prevent it from showing alongside the background.
		currentImage.addClass(cssClasses.concealed);

		// Applies CSS properties to the container to use the image as a covering background.
		currentContainer.css({
			'background-image'   : 'url(' + currentImage.prop('src') + ')', // Dynamically sets the background image source.
			'background-position': placementDetails.horizontal + ' ' + placementDetails.vertical, // Positions the background.
			'background-size'    : 'cover', // Ensures the background covers the entire container.
			'background-repeat'  : 'no-repeat' // Prevents the background image from tiling.
		});

	};

	/**
	 * Attaches event listeners to the window for resize and orientation change events.
	 * These events trigger the resize operation, often throttled.
	 * @return {void}
	 */
	ViewportScaler.prototypeShorthand.registerEventHandlers = function() {

		var selfReference = this; // Preserves the context of 'this' for the callback function.

		// Binds a throttled resize handler to window events, namespaced by instance ID.
		jqWindow.on(
			'resize.' + this.instanceId + ' orientationchange.' + this.instanceId,
			this.throttleFunction(
				function() {
					selfReference.performResizeOperation(); // Calls the main resize logic.
				},
				this.configuration.rateLimitInterval // Uses the configured interval for throttling.
			)
		);

	};

	/**
	 * Orchestrates the steps required to resize and reposition the visual element.
	 * @return {void}
	 */
	ViewportScaler.prototypeShorthand.performResizeOperation = function() {
		this.calculateElementAspectRatios(); // First, compute current aspect ratios.
		this.updateElementPositioning();     // Then, apply new dimensions and positions.
	};

	/**
	 * Computes and stores the aspect ratios for both the visual element and its container.
	 * This is crucial for maintaining proper scaling.
	 * @return {void}
	 */
	ViewportScaler.prototypeShorthand.calculateElementAspectRatios = function() {

		var currentMedia      = this.jqElement;
		var currentEnclosure  = this.jqEnclosure;
		var dimensionData     = this.dimensionMetrics;

		var mediaElementWidth, mediaElementHeight, enclosureAreaWidth, enclosureAreaHeight;

		// Calculates the visual element's aspect ratio only once, as it's static.
		if (!dimensionData.aspectRatios.visual) {

			// Checks if width and height attributes are defined on the image.
			if (!currentMedia.attr('width') || !currentMedia.attr('height')) {
				this.logError('The visual element must possess explicit width and height attributes for accurate calculations.');
				return;
			}

			mediaElementWidth  = parseInt(currentMedia.attr('width'), 10);
			mediaElementHeight = parseInt(currentMedia.attr('height'), 10);

			dimensionData.aspectRatios.visual = mediaElementHeight / mediaElementWidth; // Height/Width ratio.
			dimensionData.visual.width        = mediaElementWidth;
			dimensionData.visual.height       = mediaElementHeight;

		}

		// Retrieves the current dimensions of the containing element.
		enclosureAreaWidth  = currentEnclosure.width();
		enclosureAreaHeight = currentEnclosure.height();

		dimensionData.aspectRatios.enclosure = enclosureAreaHeight / enclosureAreaWidth; // Container's Height/Width ratio.
		dimensionData.enclosure.width        = enclosureAreaWidth;
		dimensionData.enclosure.height       = enclosureAreaHeight;

	};

	/**
	 * Updates the CSS properties of the visual element (width, height, position)
	 * to ensure it covers its container, especially when CSS background-size is not used.
	 * @return {void}
	 */
	ViewportScaler.prototypeShorthand.updateElementPositioning = function() {

		var targetVisualElement  = this.jqElement;
		var currentAspects       = this.dimensionMetrics.aspectRatios;
		var enclosureDimensions  = this.dimensionMetrics.enclosure;
		var currentConfig        = this.configuration;
		
		// Object to accumulate the calculated CSS style properties.
		var styleProperties      = {
			contentWidth : 0,
			contentHeight: 0,
			topOffset    : 'auto',
			rightOffset  : 'auto',
			bottomOffset : 'auto',
			leftOffset   : 'auto'
		};

		// Determines the necessary width and height for the content to cover the container.
		if (currentAspects.visual < currentAspects.enclosure) {
			styleProperties.contentWidth  = enclosureDimensions.height / currentAspects.visual;
			styleProperties.contentHeight = enclosureDimensions.height;
		} else {
			styleProperties.contentWidth  = enclosureDimensions.width;
			styleProperties.contentHeight = enclosureDimensions.width * currentAspects.visual;
		}

		// Calculates the vertical offset based on the configured placement.
		switch (currentConfig.contentPlacement.vertical) {
			case 'top':
				styleProperties.topOffset = 0;
			break;

			case 'bottom':
				styleProperties.bottomOffset = 0;
			break;

			case 'center':
				styleProperties.topOffset = (enclosureDimensions.height - styleProperties.contentHeight) / 2;
			break;

			default:
				this.logError('The configured vertical placement option is not recognized or supported.');
				return;
		}

		// Calculates the horizontal offset based on the configured placement.
		switch (currentConfig.contentPlacement.horizontal) {
			case 'left':
				styleProperties.leftOffset = 0;
			break;

			case 'right':
				styleProperties.rightOffset = 0;
			break;

			case 'center':
				styleProperties.leftOffset = (enclosureDimensions.width - styleProperties.contentWidth) / 2;
			break;

			default:
				this.logError('The configured horizontal placement option is not recognized or supported.');
				return;
		}

		// Applies the computed CSS properties to the visual element.
		targetVisualElement.css({
            width: styleProperties.contentWidth,
            height: styleProperties.contentHeight,
            top: styleProperties.topOffset,
            right: styleProperties.rightOffset,
            bottom: styleProperties.bottomOffset,
            left: styleProperties.leftOffset
        });

	};

	/**
	 * Disposes of the plugin instance, removing all added classes, styles, and event listeners.
	 * @return {void}
	 */
	ViewportScaler.prototypeShorthand.disposeInstance = function() {

		var targetMedia     = this.jqElement;
		var targetEnclosure = this.jqEnclosure;

		// Removes specific classes and any inline styles added by the plugin from the visual element.
		targetMedia
			.removeClass(cssClasses.concealed)
			.removeClass(cssClasses.mediaItem)
			.removeAttr('style');

		// Removes specific classes and any inline styles added by the plugin from the container.
		targetEnclosure
			.removeClass(cssClasses.wrapper)
			.removeAttr('style');

		// Unbinds all event listeners previously attached by this instance from the window.
		jqWindow.off('resize.' + this.instanceId + ' orientationchange.' + this.instanceId);

		// Removes the plugin's data associated with the visual element.
		targetMedia.removeData('viewportScaler');

	};

	/**
	 * Creates a throttled version of a function, limiting its execution rate.
	 * This prevents a function from being called too frequently, e.g., during rapid resizing.
	 * @param  {Function} callbackFn        The original function to be throttled.
	 * @param  {Number}   delayMs           The minimum time interval (in milliseconds) between executions.
	 * @param  {Object}   throttlingOptions Optional configuration for leading/trailing edge execution.
	 * @return {Function}                   A new function that wraps the original with throttling logic.
	 */
	ViewportScaler.prototypeShorthand.throttleFunction = function(callbackFn, delayMs, throttlingOptions) {

		var timerId          = null;             // Stores the ID of the timeout.
		var lastExecutionTime = 0;              // Timestamp of the last successful execution.
		var opts             = throttlingOptions || {}; // Merged options for throttling behavior.

		var thisContext, functionArgs, functionResult; // Variables to store context and arguments.

		// Inner function that executes the callback after the delay.
		function delayedExecution() {
			lastExecutionTime = opts.leading === false ? 0 : Date.now(); // Reset last execution time.
			timerId           = null;                                    // Clear the timer ID.
			functionResult    = callbackFn.apply(thisContext, functionArgs); // Execute the original function.
		}

		return function() {

			var currentTime = Date.now(); // Current timestamp.
			var timeRemaining;            // Time left until next allowed execution.

			// Initializes lastExecutionTime if leading edge execution is disabled.
			if (!lastExecutionTime && opts.leading === false) {
				lastExecutionTime = currentTime;
			}

			timeRemaining = delayMs - (currentTime - lastExecutionTime); // Calculate remaining time.
			thisContext   = this;                                     // Capture 'this' context.
			functionArgs  = arguments;                                // Capture arguments.

			// If the delay has passed or is negative, execute immediately.
			if (timeRemaining <= 0 || timeRemaining > delayMs) {
				clearTimeout(timerId);         // Clear any pending delayed execution.
				timerId           = null;
				lastExecutionTime = currentTime;
				functionResult    = callbackFn.apply(thisContext, functionArgs);
			} else if (!timerId && opts.leading !== false) {
				// If no timer is active and leading edge is allowed, set a timeout for delayed execution.
				timerId = setTimeout(delayedExecution, timeRemaining);
			}

			return functionResult; // Returns the result of the last execution or pending execution.

		};

	};

	/**
	 * Generates a unique string identifier for each instance of the module.
	 * This ID is used for namespacing events.
	 * @return {String} The unique identifier.
	 */
	ViewportScaler.prototypeShorthand.createUniqueId = function() {
		return 'vps' + parseInt(Date.now() / 1000, 10); // Combines a prefix with a timestamp.
	};

	/**
	 * Displays an error message to the user, typically via an alert box.
	 * @param  {String} errorMessage The descriptive error message to show.
	 * @return {void}
	 */
	ViewportScaler.prototypeShorthand.logError = function(errorMessage) {
		alert('ViewportScaler Module Error: ' + errorMessage); // Prefixes the message for clarity.
	};

	/**
	 * Registers the ViewportScaler as a jQuery plugin.
	 * Allows developers to initialize and interact with instances using jQuery's API.
	 * @param {Object|String} pluginArguments Configuration object for initialization, or a method name to call.
	 * @return {jQuery} The original jQuery object, enabling method chaining.
	 */
	jqAlias.fn.viewportScaler = function(pluginArguments) {

		return this.each(function() {

			var currentElement   = jqAlias(this);
			var pluginInstance   = currentElement.data('viewportScaler'); // Retrieves an existing instance, if any.

			if (!pluginInstance) {
				// If no instance exists for this element, create a new one.
				if (typeof pluginArguments !== 'string') {
					currentElement.data('viewportScaler', new ViewportScaler(this, pluginArguments));
				}
			} else {
				// If an instance already exists, and a string (method name) was passed, attempt to call that method.
				if (typeof pluginArguments === 'string') {
					if (pluginInstance[pluginArguments]) {
						pluginInstance[pluginArguments](); // Execute the specified method.
					} else {
						// Logs an error if the requested method does not exist on the instance.
						ViewportScaler.prototypeShorthand.logError('The specified method does not exist for ViewportScaler instance.');
					}
				}
			}

		});

	};

}));