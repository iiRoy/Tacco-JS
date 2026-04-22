/*
 *  jq-Scroller - A simple content rotator utility - Ver. 2.0.0
 *  Project page: https://example.com/
 *  (C) 2023, Acme Solutions
 *  Distributed under the Apache 2.0 License.
 */

( function ( jq, globalWin, docObj, undefVal ) {

	// Internal identifier for the plugin
    var pluginIdentifier = "simpleScroller",
		// Default configuration settings for the component
        configDefaults = {
			flowDirection: 'upward', // Movement direction: 'upward' or 'downward'
			transitionStyle: 'easeOutSine', // Easing function for animation
			animationDuration: 700, // Speed of animation in milliseconds
			updateInterval: 3000, // Time between automatic scrolls in ms
			containerHeight: null, // 'null' for auto, or a fixed pixel value
			displayCount: 1, // Number of items visible at once (0 for all)
			pauseOnHover: true, // Whether to pause scrolling when mouse is over
			uiControls: { // Selectors for user interaction elements
				upButton: '',
				downButton: '',
				toggleButton: '',
				startLabel: 'Begin',
				stopLabel: 'Halt'
			}
        };

	// Main class constructor for the scrolling component
    function SimpleScroller( elementRef, userOptions ) {

		var instance = this; // Self-reference for inner functions

        instance.settings = jq.extend( {}, configDefaults, userOptions ); // Merge user options with defaults
        instance.mainElement = jq(elementRef); // The main container element
		instance.contentWrapper = jq(elementRef).children(':first-child'); // The actual content wrapper
		instance.scrollTimer = 0; // Holds the interval ID for auto-scrolling
		instance.windowActive = true; // Flag to check if the browser window is in focus
		instance.prevScrollTimer = 0; // Stores timer state during hover pause

		// Initialize the component's structure and styling
		initializeScroller();
		// Start the automatic scrolling if applicable
		beginScrolling();

		// Event listeners for window focus/blur to pause/resume
		jq([globalWin, docObj]).off('focus.sscr').on('focus.sscr', function() {
			instance.windowActive = true;
		}).off('blur.sscr').on('blur.sscr', function() {
			instance.windowActive = false;
		});

		// Handle mouse hover pause functionality
		if (instance.settings.pauseOnHover === true) {
			instance.mainElement.mouseenter(function() {
				instance.prevScrollTimer = instance.scrollTimer; // Store timer state before stopping
				haltScrolling();
			}).mouseleave(function() {
				if (instance.prevScrollTimer !== 0) { // Only resume if it was running before hover
					beginScrolling();
				}
			});
		}

		// Attach event listeners to control buttons
		jq(instance.settings.uiControls.upButton).on('click', function(evtObject) {
			evtObject.preventDefault(); // Prevent default link behavior
			initiateDirectionalMove('upward');
		});

		jq(instance.settings.uiControls.downButton).on('click', function(evtObject) {
			evtObject.preventDefault();
			initiateDirectionalMove('downward');
		});

		jq(instance.settings.uiControls.toggleButton).on('click', function(evtObject) {
			evtObject.preventDefault();
			if (instance.scrollTimer === 0) { // If not currently scrolling
				beginScrolling();
			} else {
				haltScrolling();
			}
		});

		// Internal method to set up initial styles
		function initializeScroller() {

			// Remove default margins from immediate children and their children
			instance.mainElement.children().css('margin', 0).children().css('margin', 0);

			// Apply base styles to the main container
			instance.mainElement.css({
				position : 'relative',
				height: instance.settings.containerHeight,
				overflow : 'hidden'
			});

			// Apply base styles to the content wrapper
			instance.contentWrapper.css({
				'position' : 'absolute',
				'margin' : 0
			});

			// Periodically adjust height in case content changes
			setInterval( function() {
				adaptContainerHeight();
			}, 150 ); // Slightly different interval

		} // End of initializeScroller


		// Initiates the auto-scrolling mechanism
		function beginScrolling() {
			instance.scrollTimer = setInterval(function() {
				if (instance.windowActive === true) { // Only scroll if the window is in focus
					performScroll(instance.settings.flowDirection);
				}
			}, instance.settings.updateInterval);

			// Update UI for toggle button
			jq(instance.settings.uiControls.toggleButton).addClass('ss-active').html(instance.settings.uiControls.stopLabel);

		} // End of beginScrolling


		// Halts the auto-scrolling
		function haltScrolling() {
			clearInterval(instance.scrollTimer); // Clear the interval
			instance.scrollTimer = 0; // Reset timer ID
			// Update UI for toggle button
			jq(instance.settings.uiControls.toggleButton).removeClass('ss-active').html(instance.settings.uiControls.startLabel);
		} // End of haltScrolling


		// Executes a single scroll movement
		function performScroll( movementDirection ) {
			var childSelector, positionOperator, appendMethod; // Variables for scroll logic

			// Do nothing if the main element is not visible
			if (!instance.mainElement.is(':visible')) { return; }

			// Determine direction-specific logic
			if (movementDirection === 'upward') {
				childSelector = ':first-child';
				positionOperator = '-=';
				appendMethod = 'appendTo';
			} else { // 'downward'
				childSelector = ':last-child';
				positionOperator = '+=';
				appendMethod = 'prependTo';
			}

			var selectedChild = instance.contentWrapper.children(childSelector); // Get the child to move
			var itemHeight = selectedChild.outerHeight(); // Calculate its height

			// Animate the content wrapper
			instance.contentWrapper.stop(true, true).animate({
				'top': positionOperator + itemHeight + "px" // Move by item height
			}, instance.settings.animationDuration, instance.settings.transitionStyle, function() {

				// After animation, hide, move, show, and reset position
				selectedChild.hide()[appendMethod](instance.contentWrapper).fadeIn();
				instance.contentWrapper.css('top', 0); // Reset wrapper position

				adaptContainerHeight(); // Recalculate container height

			});
		} // End of performScroll

		// Handles manual directional movement triggered by controls
		function initiateDirectionalMove( movementDirection ) {
			haltScrolling(); // Stop auto-scrolling
			if (movementDirection === 'upward') {
				performScroll('upward');
			} else {
				performScroll('downward');
			}
			// The original had a commented-out start(), maintaining the structure
			// beginScrolling();
		}

		// Calculates and sets the full height of the container based on all children
		function calculateFullHeight() {
			var totalHeight = 0; // Accumulator for total height
			var originalDisplay = instance.mainElement.css('display'); // Store current display style

			instance.mainElement.css('display', 'block'); // Temporarily make block to measure height

			instance.contentWrapper.children().each(function() {
				totalHeight += jq(this).outerHeight(); // Sum up heights of all children
			});

			// Restore original display and set calculated height
			instance.mainElement.css({
				'display' : originalDisplay,
				'height' : totalHeight
			});
		}

		// Adjusts container height based on the 'visible' option
		function adjustVisibleHeight( animateFlag ) {
			var visibleContentHeight = 0; // Height of visible items
			instance.contentWrapper.children(':lt(' + instance.settings.displayCount + ')').each(function() {
				visibleContentHeight += jq(this).outerHeight(); // Sum heights of specified visible items
			});

			if (animateFlag === 1) { // Animate height change
				instance.mainElement.stop(true, true).animate({height: visibleContentHeight}, instance.settings.animationDuration);
			} else { // Set height directly
				instance.mainElement.css( 'height', visibleContentHeight);
			}
		}

		// Main function to adapt the container's height based on settings
		function adaptContainerHeight() {
			// Check if height is auto and visible count is set
			if (instance.settings.containerHeight === null && instance.settings.displayCount !== 0) {
				// Determine if animation should be used (0 for no anim, 1 for anim)
				// This relies on arguments.callee.caller, which is deprecated but maintains original logic structure.
				var shouldAnimate = (typeof arguments.callee.caller !== undefVal && arguments.callee.caller !== null && arguments.callee.caller.name === 'initializeScroller') ? 0 : 1;
				adjustVisibleHeight(shouldAnimate);
			} else if (instance.settings.containerHeight === null) { // If height is auto but no visible count
				calculateFullHeight();
			}
		}

		// Public API methods for the plugin instance
		return {
			moveUp: function() { initiateDirectionalMove('upward'); },
			moveDown: function() { initiateDirectionalMove('downward'); },
			startScrolling: beginScrolling,
			stopScrolling: haltScrolling,
			currentSettings: instance.settings
		};

    }

	// jQuery plugin method to attach the functionality to DOM elements
    jq.fn[pluginIdentifier] = function ( userOptions ) {
        return this.each(function () {
            // Prevent multiple instances on the same element
            if (!jq.data(this, pluginIdentifier)) {
                jq.data(this, pluginIdentifier, new SimpleScroller( this, userOptions ));
            }
        });
    };

})( jq, globalWin, docObj, undefined );