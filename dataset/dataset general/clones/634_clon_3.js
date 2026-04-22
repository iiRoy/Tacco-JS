/*
	Rotational List Component for jQuery
	Copyright (c) 2023 CodeForge Labs
	Licensed under MIT License
	--------------------------
	Adapted from the Totem Ticker Plugin by Zach Dunn, 2011.
*/
(function( $ ){

	// Ensure the core namespace exists for our components
	if (!$.listScroller) {
		$.listScroller = {};
	}

	/**
	 * Main constructor for the List Rotator component.
	 * @param {HTMLElement} domElement The raw DOM element to apply the rotator to.
	 * @param {object} userConfig User-defined configuration options.
	 */
	$.listScroller.listRotator = function(domElement, userConfig ) {

		// Reference to the current plugin instance (this object)
		var componentInstance = this;

		// Store the raw DOM element and its jQuery wrapped version
		componentInstance.targetElement = domElement;
		componentInstance.jQueryElement = $(domElement);

		// Attach a reverse reference to the DOM object for easy access to the plugin instance
		componentInstance.jQueryElement.data("listScroller.listRotator", componentInstance);

		// Internal variable to hold the ID of the cycling timer
		var cycleTimerId = null;

		/**
		 * Initializes the component by merging configurations, setting up dimensions,
		 * configuring controls, and starting the rotation.
		 */
		componentInstance.initializeComponent = function(){
			// Merge default options with user-provided configurations
			componentInstance.configSettings = $.extend({}, $.listScroller.listRotator.componentDefaults, userConfig);

			// Perform initial sizing and styling adjustments for the container
			componentInstance.adjustContainerDimensions();

			// Set up event handlers for navigation controls
			componentInstance.configureInteractionControls();

			// If configured to start immediately, begin the cycling routine
			if (!componentInstance.configSettings.initialPause) {
				componentInstance.beginCyclingRoutine();
			}
		};

		/**
		 * Starts the automatic cycling of list items. Clears any existing timer.
		 */
		componentInstance.beginCyclingRoutine = function(){
			// Clear any previously active timer to prevent multiple intervals
			if (cycleTimerId) {
				clearInterval(cycleTimerId);
			}

			const animationDuration = componentInstance.configSettings.animationDuration;
			const itemHeightPx = componentInstance.configSettings.itemHeight;
			const cycleDelay = componentInstance.configSettings.cycleDelay;
			const scrollDirection = componentInstance.configSettings.scrollDirection;
			const easingFunction = componentInstance.configSettings.easing;

			// Ensure there are list items to scroll
			if (componentInstance.jQueryElement.children('li').length === 0) {
				console.warn("List Rotator: No list items found within the target element. Cycling aborted.");
				return;
			}

			// Define the scrolling logic based on direction
			const scrollUp = () => {
				// Move the last item to the top, position it above the view
				componentInstance.jQueryElement.find('li:last')
					.detach()
					.prependTo(componentInstance.jQueryElement)
					.css('marginTop', '-' + itemHeightPx);

				// Animate the first item into view
				componentInstance.jQueryElement.find('li:first').animate({
					marginTop: '0px'
				}, animationDuration, easingFunction);
			};

			const scrollDown = () => {
				// Animate the first item out of view
				componentInstance.jQueryElement.find('li:first').animate({
					marginTop: '-' + itemHeightPx
				}, animationDuration, easingFunction, function() {
					// After animation, move it to the end and reset its margin
					$(this).detach().css('marginTop', '0px').appendTo(componentInstance.jQueryElement);
				});
			};

			// Set up the interval based on the configured direction
			if (scrollDirection === 'up') {
				cycleTimerId = setInterval(scrollUp, cycleDelay);
			} else { // Default to 'down'
				cycleTimerId = setInterval(scrollDown, cycleDelay);
			}
		};

		/**
		 * Resets the cycling timer. Stops the current interval and immediately restarts it.
		 * Useful after manual navigation to resume auto-cycling.
		 */
		componentInstance.reinitializeCycling = function(){
			componentInstance.haltCycling();
			componentInstance.beginCyclingRoutine();
		};

		/**
		 * Halts the automatic cycling of list items by clearing the interval timer.
		 */
		componentInstance.haltCycling = function(){
			if (cycleTimerId) {
				clearInterval(cycleTimerId);
				cycleTimerId = null; // Ensure the ID is cleared
			}
		};

		/**
		 * Adjusts the height of the container based on `maxVisibleItems` and `itemHeight`.
		 * Ensures overflow is hidden.
		 */
		componentInstance.adjustContainerDimensions = function(){
			const maxVisible = componentInstance.configSettings.maxVisibleItems;
			const itemHeight = componentInstance.configSettings.itemHeight;

			// Validate itemHeight format
			if (!itemHeight || !itemHeight.endsWith('px')) {
				console.warn("List Rotator: 'itemHeight' must be specified in pixels (e.g., '100px'). Defaulting to 100px for calculation.");
				// Set a fallback if invalid, but don't modify the original config
				const fallbackHeight = 100;
				if (typeof maxVisible === 'number' && maxVisible > 0) {
					componentInstance.jQueryElement.css({
						height		: (fallbackHeight * maxVisible) + 'px',
						overflow	: 'hidden'
					});
				} else {
					componentInstance.jQueryElement.css({ overflow : 'hidden' });
				}
				return; // Exit as we've handled the error
			}

			// Extract numerical value from itemHeight string
			const parsedHeightValue = parseFloat(itemHeight);

			if (typeof maxVisible === 'number' && maxVisible > 0 && !isNaN(parsedHeightValue)) {
				const calculatedContainerHeight = parsedHeightValue * maxVisible;

				componentInstance.jQueryElement.css({
					height		: calculatedContainerHeight + 'px',
					overflow	: 'hidden'
				});
			} else {
				// If no specific height is set, just ensure overflow is hidden
				componentInstance.jQueryElement.css({
					overflow	: 'hidden'
				});
			}
		};

		/**
		 * Sets up event listeners for navigation controls (start, stop, previous, next)
		 * and mouse hover pause/resume functionality.
		 */
		componentInstance.configureInteractionControls = function(){
			const config = componentInstance.configSettings;
			const itemHeightPx = config.itemHeight;
			const animationDuration = config.animationDuration;
			const easingFunction = config.easing;

			// Helper function for animating a single step forward (next)
			const animateNextStep = () => {
				componentInstance.jQueryElement.find('li:first').animate({
					marginTop: '-' + itemHeightPx
				}, animationDuration, easingFunction, function() {
					$(this).detach().css('marginTop', '0px').appendTo(componentInstance.jQueryElement);
					componentInstance.reinitializeCycling(); // Resume after manual interaction
				});
			};

			// Helper function for animating a single step backward (previous)
			const animatePrevStep = () => {
				componentInstance.jQueryElement.find('li:last')
					.detach()
					.prependTo(componentInstance.jQueryElement)
					.css('marginTop', '-' + itemHeightPx);
				componentInstance.jQueryElement.find('li:first').animate({
					marginTop: '0px'
				}, animationDuration, easingFunction, function () {
					componentInstance.reinitializeCycling(); // Resume after manual interaction
				});
			};

			// Attach click handlers to navigation buttons
			const setupButton = (selector, handler) => {
				if (selector && $(selector).length) {
					$(selector).on('click.listRotator', function(e){
						e.preventDefault(); // Prevent default link behavior
						handler();
					});
				}
			};

			setupButton(config.pauseControlSelector, componentInstance.haltCycling);
			setupButton(config.resumeControlSelector, componentInstance.beginCyclingRoutine);
			setupButton(config.prevItemControlSelector, animatePrevStep);
			setupButton(config.nextItemControlSelector, animateNextStep);

			// Handle mouse hover pause/resume
			if (config.pauseOnMouseOver === true) {
				componentInstance.jQueryElement.on('mouseenter.listRotator', componentInstance.haltCycling)
											   .on('mouseleave.listRotator', componentInstance.beginCyclingRoutine);
			}
		};

		// Kick off the initialization process for this component instance
		componentInstance.initializeComponent();
	};

	/**
	 * Default configuration options for the List Rotator component.
	 * These can be overridden by user-provided settings.
	 */
	$.listScroller.listRotator.componentDefaults = {
		nextControlSelector		:	null,		/* jQuery selector for the 'next item' button/link */
		prevItemControlSelector	:	null,		/* jQuery selector for the 'previous item' button/link */
		pauseControlSelector	:	null,		/* jQuery selector for the 'stop' button/link */
		resumeControlSelector	:	null,		/* jQuery selector for the 'start' button/link */
		itemHeight				:	'100px',	/* Fixed height of each list item in pixels (e.g., '100px') */
		animationDuration		:	800,		/* Speed of the scroll animation in milliseconds */
		cycleDelay				:	4000,		/* Time between automatic item changes in milliseconds */
		maxVisibleItems			: 	null, 		/* Number of items to display at once. Adjusts container height. (OPTIONAL) */
		pauseOnMouseOver		:	false,		/* If true, cycling stops on mouse hover and resumes on mouse leave */
		scrollDirection			:	'down',		/* Direction of scrolling: 'up' or 'down' */
		initialPause			:	false,		/* If true, the rotator starts in a paused state */
		easing					:	'swing'		/* Easing function for animations (e.g., 'swing', 'linear') */
	};

	/**
	 * jQuery plugin method to apply the List Rotator to selected elements.
	 * Iterates over each matched element and creates a new instance of the rotator.
	 */
	$.fn.listRotator = function( options ){
		return this.each(function(){
			// Prevent multiple initializations on the same element
			if (!$.data(this, "listScroller.listRotator")) {
				new $.listScroller.listRotator(this, options);
			}
		});
	};

})( jQuery );