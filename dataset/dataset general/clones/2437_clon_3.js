var swipeRefreshModule = (function ($) {

	// Module Configuration and Constants
	const config = {
		reloadOverlayId: "refreshLoaderOverlay",
		pullIndicatorId: "pullIndicatorContainer",
		indicatorWrapperClass: "indicatorWrapper",
		refreshIconClass: "refreshIcon",
		indicatorTextId: "indicatorText",
		rotatedArrowClass: "rotatedArrow",
		initialPullText: "Drag down to refresh",
		releaseText: "Release to reload content",
		initialTopOffset: -45, // Slightly different initial offset
		pullThresholdPx: 45, // Threshold for "release to refresh"
		minScrollHoldDurationMs: 600, // Time to hold at top before considering a pull gesture
		fastReleaseThresholdMs: 450, // Max time for release to trigger reload
		loaderFadeInDurationMs: 350,
		reloadDelayMs: 800 // Delay before actual page reload
	};

	// Internal state variables for the module
	let moduleState = {
		isScrollHandlerActive: false, // Indicates if the scroll event listener is active
		isReloadPending: false,       // True when user has pulled enough to reload
		scrollAtTopTime: null,        // Timestamp when user first scrolled to Y=0
		pullGestureStartTime: null,   // Timestamp when a pull gesture officially began (Y<0)
		isCurrentlyReloading: false   // Flag to prevent re-entry during reload process
	};

	// Cached DOM elements for performance
	const domElements = {
		$body: null,
		$pullIndicator: null,
		$indicatorText: null,
		$refreshIcon: null,
		$reloadOverlay: null
	};

	/**
	 * Private helper function to update the visual state of the pull indicator.
	 * @param {string} newText - The text to display in the indicator.
	 * @param {boolean} shouldRotateArrow - Whether the arrow icon should be rotated.
	 */
	function updateIndicatorDisplay(newText, shouldRotateArrow) {
		if (domElements.$indicatorText && domElements.$refreshIcon) {
			domElements.$indicatorText.html(newText);
			if (shouldRotateArrow) {
				domElements.$refreshIcon.addClass(config.rotatedArrowClass);
			} else {
				domElements.$refreshIcon.removeClass(config.rotatedArrowClass);
			}
		}
	}

	/**
	 * Private helper to reset the state variables related to a pull gesture.
	 */
	function resetPullGestureState() {
		moduleState.pullGestureStartTime = null;
		moduleState.isReloadPending = false;
		moduleState.scrollAtTopTime = null; // Reset this too, as a new scroll interaction might begin
	}

	/**
	 * Initializes the refresh module by injecting HTML and binding events.
	 * This is the entry point for setting up the functionality.
	 */
	function setupModule() {
		// Ensure jQuery is available
		if (typeof $ === 'undefined') {
			console.error("jQuery is required for swipeRefreshModule to function.");
			return;
		}

		// Cache body element
		domElements.$body = $('body');

		// Construct and inject the necessary HTML elements for the UI
		const refreshOverlayHtml = `<div id="${config.reloadOverlayId}"><span class="icon"></span><span class="text">Refreshing Content...</span></div>`;
		const pullIndicatorHtml = `
			<div id="${config.pullIndicatorId}">
				<div class="${config.indicatorWrapperClass}">
					<span class="${config.refreshIconClass}">&nbsp;</span>
					<div id="${config.indicatorTextId}">${config.initialPullText}</div>
				</div>
			</div>`;

		domElements.$body.prepend(refreshOverlayHtml + pullIndicatorHtml);

		// Cache newly injected DOM elements
		domElements.$pullIndicator = $(`#${config.pullIndicatorId}`);
		domElements.$indicatorText = $(`#${config.indicatorTextId}`);
		domElements.$refreshIcon = domElements.$pullIndicator.find(`.${config.refreshIconClass}`);
		domElements.$reloadOverlay = $(`#${config.reloadOverlayId}`);

		// Initially hide the reload overlay and set initial position for pull indicator
		domElements.$reloadOverlay.hide();
		domElements.$pullIndicator.css({ top: config.initialTopOffset });

		// Bind the main scroll event handler to the window
		$(window).on('scroll', handlePageScroll);

		// Activate the scroll handler flag
		moduleState.isScrollHandlerActive = true;

		console.log("Swipe Refresh Module initialized.");
	}

	/**
	 * Primary scroll event handler. Determines the current scroll state
	 * and delegates to pull action processing if necessary.
	 */
	function handlePageScroll() {
		// If a reload is in progress, ignore further scroll events
		if (moduleState.isCurrentlyReloading) {
			return;
		}

		const currentScrollY = window.scrollY || window.pageYOffset;
		const now = new Date();

		// Check if the user is scrolling down the page
		if (currentScrollY > 0) {
			// If not at the very top, reset any pending pull gestures
			resetPullGestureState();
		}

		// Check if the user is at the very top of the page (Y=0)
		if (currentScrollY === 0) {
			// If we just reached the top, record the time
			if (moduleState.scrollAtTopTime === null) {
				moduleState.scrollAtTopTime = now;
			}
		} else {
			// If we scrolled away from the top, clear the top-of-page timer
			moduleState.scrollAtTopTime = null;
		}

		// If the user has been at the top for long enough, enable potential pull gestures
		if (moduleState.scrollAtTopTime !== null) {
			const timeAtTopElapsed = now.getTime() - moduleState.scrollAtTopTime.getTime();
			if (timeAtTopElapsed >= config.minScrollHoldDurationMs) {
				// User has lingered at the top, now process potential pull actions
				processPullActions(currentScrollY);
			} else {
				// Not enough time at top, reset pull state if any
				if (currentScrollY >= 0) { // Only hide if we are at or below Y=0
					domElements.$pullIndicator.css({ top: config.initialTopOffset });
					updateIndicatorDisplay(config.initialPullText, false);
					resetPullGestureState();
				}
			}
		} else {
			// If not at the top, ensure the indicator is hidden and state reset
			if (currentScrollY >= 0) {
				domElements.$pullIndicator.css({ top: config.initialTopOffset });
				updateIndicatorDisplay(config.initialPullText, false);
				resetPullGestureState();
			}
		}

		// Always process pull actions if scrolling above 0, regardless of timeAtTop
		// This handles the immediate pull-down gesture
		if (currentScrollY < 0) {
			processPullActions(currentScrollY);
		}
	}

	/**
	 * Manages the visual feedback and state transitions based on the pull gesture.
	 * This function is called when the user scrolls above the viewport (Y < 0).
	 * @param {number} currentScrollY - The current pageYOffset, expected to be negative for pull.
	 */
	function processPullActions(currentScrollY) {
		const absScrollY = Math.abs(currentScrollY);

		// Stage 1: Pulling down but not yet past the threshold
		if (currentScrollY < 0 && absScrollY < config.pullThresholdPx) {
			// Ensure the indicator is visible and positioned correctly
			domElements.$pullIndicator.css({ top: absScrollY - config.pullThresholdPx });

			// If we just entered this state or haven't set the start time yet, record it
			if (moduleState.pullGestureStartTime === null) {
				moduleState.pullGestureStartTime = new Date();
			}

			// Update display if not already in "pull to refresh" state
			if (moduleState.isReloadPending) {
				updateIndicatorDisplay(config.initialPullText, false);
				moduleState.isReloadPending = false;
			}
		}
		// Stage 2: Pulled down past the threshold
		else if (currentScrollY <= -config.pullThresholdPx) {
			// Ensure the indicator is fixed at the top of the viewport
			domElements.$pullIndicator.css({ top: 0 });

			// Update display to "release to refresh" if not already
			if (!moduleState.isReloadPending) {
				updateIndicatorDisplay(config.releaseText, true);
				moduleState.isReloadPending = true;
			}

			// Clear the pull gesture start time as it's now a "release" state
			moduleState.pullGestureStartTime = null;
		}
		// Stage 3: User released the pull, and scrollY is now >= 0
		else if (currentScrollY >= 0 && moduleState.isReloadPending) {
			const now = new Date();
			let timeFromPullStart = 0;

			// If a pull gesture start time was recorded, calculate elapsed time
			if (moduleState.pullGestureStartTime !== null) {
				timeFromPullStart = now.getTime() - moduleState.pullGestureStartTime.getTime();
			}

			// If the release was "fast" (within the threshold), trigger reload
			if (timeFromPullStart < config.fastReleaseThresholdMs || moduleState.pullGestureStartTime === null) {
				// If pullGestureStartTime was null, it means we went directly to reload-pending state
				// or the user was quick enough that the timer wasn't relevant.
				// In original code, this was an implicit fast reload.
				triggerContentRefresh();
			} else {
				// Release was too slow or not a valid fast gesture, just reset
				console.log("Release gesture too slow or invalid for reload.");
				domElements.$pullIndicator.css({ top: config.initialTopOffset });
				updateIndicatorDisplay(config.initialPullText, false);
				resetPullGestureState();
			}

			// Reset all related states after evaluating the release
			resetPullGestureState();
		}
		// Default state: scrollY >= 0, hide indicator, reset state
		else if (currentScrollY >= 0 && !moduleState.isReloadPending) {
			domElements.$pullIndicator.css({ top: config.initialTopOffset });
			updateIndicatorDisplay(config.initialPullText, false);
			resetPullGestureState();
		}
	}

	/**
	 * Initiates the page reload process, showing a loading animation.
	 */
	function triggerContentRefresh() {
		// Prevent multiple reloads or scroll events during the refresh process
		if (moduleState.isCurrentlyReloading) {
			return;
		}
		moduleState.isCurrentlyReloading = true;

		// Hide the pull indicator immediately
		domElements.$pullIndicator.css({ top: config.initialTopOffset });
		updateIndicatorDisplay(config.initialPullText, false);

		// Show the reloading overlay with a fade-in effect
		domElements.$reloadOverlay.fadeIn(config.loaderFadeInDurationMs);
		console.log("Initiating content refresh...");

		// Hold for a short duration to display the animation, then reload
		setTimeout(function () {
			// Using window.location.replace() to prevent the back button from
			// showing the "reloading" state again.
			window.location.replace(window.location.href);
			// If direct reload is preferred, use: window.location.reload();
		}, config.reloadDelayMs);
	}

	// Expose only the setupModule method to the outside world
	return {
		initialize: setupModule
	};

})(jQuery); // Pass jQuery into the IIFE for scope isolation and aliasing

// When the DOM is fully loaded, initialize the refresh module
$(document).ready(swipeRefreshModule.initialize);