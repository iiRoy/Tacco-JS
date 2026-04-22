(function(jq) {
	/**
	 * jQuery plugin for fluid typography, adjusting line-height based on element width.
	 *
	 * @param {object} customOpts - User-defined options to override defaults.
	 */
	jq.fn.fluidLineAdjuster = function( customOpts ) {
		// Establish configuration defaults and merge with user-provided options.
		// These settings control the responsive behavior of line heights.
		var currentSettings = jq.extend( {
			minLineHeightValue: 1.2,  // Smallest allowed line height ratio.
			maxLineHeightValue: 1.6,  // Largest allowed line height ratio.
			minContainerWidth: 320,   // Minimum width for line height scaling.
			maxContainerWidth: 1024   // Maximum width for line height scaling.
		}, customOpts );

		// Ensure sensible limits for line height.
		if (currentSettings.minLineHeightValue > currentSettings.maxLineHeightValue) {
			console.warn("FluidLineAdjuster: Minimum line height cannot be greater than maximum. Swapping values.");
			let temp = currentSettings.minLineHeightValue;
			currentSettings.minLineHeightValue = currentSettings.maxLineHeightValue;
			currentSettings.maxLineHeightValue = temp;
		}

		/**
		 * Helper function to calculate and apply the fluid line height to a single element.
		 *
		 * @param {HTMLElement} elementReference - The DOM element to process.
		 */
		var recalibrateLeading = function( elementReference ) {
			var targetElementJq = jq( elementReference ),
				currentElementWidth = targetElementJq.width();

			// Guard clause: if element has no width, skip calculation.
			if (currentElementWidth <= 0) {
				return;
			}

			// Calculate the normalized width ratio (0 to 1) within the defined range.
			// This determines how far along the scaling spectrum the current width falls.
			var rangeDiff = currentSettings.maxContainerWidth - currentSettings.minContainerWidth;
			var widthProgress = (currentElementWidth - currentSettings.minContainerWidth) / rangeDiff;

			// Clamp the progress between 0 and 1.
			// Values outside the min/max width range will result in the min/max line heights.
			var normalizedWidthRatio = Math.max(0, Math.min(1, widthProgress));

			// Interpolate the line height between min and max based on the normalized width ratio.
			var lineRange = currentSettings.maxLineHeightValue - currentSettings.minLineHeightValue;
			var finalLineHeightVal = currentSettings.minLineHeightValue + (lineRange * normalizedWidthRatio);

			// Apply the calculated line height to the element's style.
			targetElementJq.css( "lineHeight", finalLineHeightVal );

			// Re-evaluate line height on subsequent throttled resize events.
			// Using our custom 'smartresize' event for performance.
			jq( window ).one( "smartresize", function() {
				recalibrateLeading( targetElementJq );
			});
		};

		// Iterate over all selected elements and apply the fluid line height logic.
		return this.each( function() {
			recalibrateLeading( this );
		});
	};
})(jQuery);


/*
 * smartresize: A custom jQuery event that fires at a controlled rate
 * during browser window resizing, preventing performance issues from
 * excessive event triggers. This implementation uses requestAnimationFrame
 * for smoother, browser-optimized throttling.
 *
 * Based on concepts from: https://github.com/louisremi/jquery-smartresize
 *
 * Copyright (c) 2012-2023 Various Authors. Licensed under the MIT license.
 *
 * This utility significantly improves responsiveness performance.
 */
(function(jq) {

	var jqEventCore = jq.event, // Reference to jQuery's event system.
		customEventReg,         // Placeholder for our custom event definition.
		resizeEventPending,     // Flag indicating if a resize event has occurred since last frame.
		rafHandle = null;       // Stores the requestAnimationFrame ID for cancellation.

	// Define the custom 'smartresize' event within jQuery's special events.
	customEventReg = jqEventCore.special.smartresize = {
		/**
		 * Setup function: called when the first 'smartresize' handler is bound.
		 * Attaches the native 'resize' event listener.
		 */
		setup: function() {
			jq( this ).on( "resize", customEventReg.eventProcessor );
		},
		/**
		 * Teardown function: called when the last 'smartresize' handler is unbound.
		 * Removes the native 'resize' event listener.
		 */
		teardown: function() {
			jq( this ).off( "resize", customEventReg.eventProcessor );
			// If no more handlers, ensure any pending animation frame is cancelled.
			if (rafHandle !== null) {
				cancelAnimationFrame(rafHandle);
				rafHandle = null;
			}
		},
		/**
		 * Event processor (handler): triggered by the native 'resize' event.
		 * It sets a flag and schedules a requestAnimationFrame to dispatch the custom event.
		 *
		 * @param {jQuery.Event} eventObject - The native resize event.
		 * @param {boolean} forceDispatch - If true, dispatches immediately without throttling.
		 */
		eventProcessor: function( eventObject, forceDispatch ) {
			var thisRef = this, // Context of the element that received the event.
				handlerArgs = arguments; // All arguments passed to the handler.

			resizeEventPending = true; // Mark that a resize has occurred.

			// If no animation frame is currently scheduled, request one.
			if ( rafHandle === null || forceDispatch ) {
				rafHandle = requestAnimationFrame( function() {
					// Check if a resize was detected or if immediate dispatch was requested.
					if ( resizeEventPending || forceDispatch ) {
						// Clone the event and change its type to 'smartresize'.
						// This ensures handlers for 'smartresize' receive the correct event type.
						eventObject.type = "smartresize";
						// Dispatch the custom event to all bound 'smartresize' handlers.
						jqEventCore.dispatch.apply( thisRef, handlerArgs );
						resizeEventPending = false; // Reset the flag.
					}
					rafHandle = null; // Clear the handle, ready for the next resize.
				});
			}
		},
		// A threshold could be implemented here for time-based throttling,
		// but requestAnimationFrame inherently provides a frame-based throttle.
		// Keeping it for potential future extensions or compatibility.
		throttleDelay: 0
	};

	// Default threshold can be set, but with rAF, it's less critical.
	// This could be used to enforce a minimum time between dispatches if desired.
	if (jqEventCore.special.smartresize) {
		jqEventCore.special.smartresize.throttleDelay = 3; // Example: could be used for a minimum frame count or time in other throttle implementations.
	}

})(jQuery);

/**
 * Calculates the width of the system's scrollbar.
 * This function is memoized to avoid recalculating the value multiple times.
 *
 * @returns {number} The width of the scrollbar in pixels.
 */
var getSystemScrollbarWidth = (function() {
	var cachedScrollbarWidth = null; // Cache the calculated width.

	return function() {
		// If the width has already been calculated, return the cached value.
		if (cachedScrollbarWidth !== null) {
			return cachedScrollbarWidth;
		}

		// Ensure jQuery is available before proceeding.
		if (typeof jQuery === 'undefined') {
			console.error("jQuery not found for scrollbar width calculation.");
			return 0;
		}

		// Create a temporary outer div to act as a viewport.
		var wrapperViewportDiv = jQuery(document.createElement('div')).css({
			width: '200px',
			height: '150px',
			position: 'absolute',
			top: '0',
			left: '0',
			visibility: 'hidden',
			overflow: 'hidden'
		});

		// Create an inner div that is wider than the outer div to force a scrollbar.
		var innerContentDiv = jQuery(document.createElement('div')).css({
			width: '100%',
			height: '200px'
		});

		try {
			wrapperViewportDiv.append(innerContentDiv);
			jQuery('body').append(wrapperViewportDiv);

			// Measure the width of the inner div without a scrollbar.
			var contentWidth = innerContentDiv[0].offsetWidth;

			// Force a scrollbar by changing the outer div's overflow property.
			wrapperViewportDiv.css('overflow', 'scroll');

			// Measure the client width of the outer div (width minus scrollbar).
			var viewportWidth = wrapperViewportDiv[0].clientWidth;

			// The difference is the scrollbar width.
			cachedScrollbarWidth = contentWidth - viewportWidth;

		} catch (e) {
			console.error("Error calculating scrollbar width:", e);
			cachedScrollbarWidth = 0; // Fallback in case of error.
		} finally {
			// Clean up by removing the temporary elements.
			if (wrapperViewportDiv && wrapperViewportDiv.parent().length) {
				wrapperViewportDiv.remove();
			}
		}

		// Return the calculated (and now cached) scrollbar width.
		return cachedScrollbarWidth;
	};
})();