/*
 *  Define the primary module for dynamic content refreshing.
 */
var updateOnDrag = {

    // Component state variables
    interactionEnabled: true, /* Indicates if user interaction is currently being processed */
    reloadReady: false, /* Flag for whether a refresh action is primed */
    releaseCaptureTime: null, /* Timestamp when the user initiated a release after a drag */
    initialScrollTime: null, /* Records the moment scrolling started from the top */

    setupComponent: function() {

        // Embed the necessary UI elements into the document body
        jQuery('body').prepend('<div id="updateIndicatorOverlay"><span class="indicatorGraphic"></span><span class="statusText">Refreshing...</span></div><div id="swipeRefreshContainer"><div class="wrap"><span class="indicatorGraphic">&nbsp;</span><div id="updateInstruction">Drag to refresh</div></div></div>');

        // Attach an event handler to track window scroll movements
        jQuery(window).on('scroll', updateOnDrag.watchScrollActivity);
    },

    watchScrollActivity: function() {

        // If the user has scrolled downwards, prevent refresh action
        if (window.scrollY > 0) {
            // Clear any previous time tracking for scrolling
            updateOnDrag.initialScrollTime = null;
            updateOnDrag.interactionEnabled = false;
        }

        // When the viewport is at the very top
        if (window.scrollY === 0) {
            // Begin a time measurement if not already active
            if (updateOnDrag.initialScrollTime === null) {
                updateOnDrag.initialScrollTime = new Date();
            }
        }

        // If a scroll-up timer is in progress
        if (updateOnDrag.initialScrollTime !== null) {
            let currentTimestamp = new Date(),
                elapsedDuration = currentTimestamp.getTime() - updateOnDrag.initialScrollTime.getTime();

            // If sufficient time has passed since reaching the top, execute actions
            if (elapsedDuration > 500) {
                updateOnDrag.processScrollStates();
            }
        } else {
            // Otherwise, proceed with scroll handling immediately
            updateOnDrag.processScrollStates();
        }

    },

    processScrollStates: function() {

        // Scrolling upwards, but not yet past the update threshold
        if (window.scrollY < 0 && window.scrollY > -40) {
            // Update the instructional text for the user
            jQuery("#swipeRefreshContainer #updateInstruction").html("Drag to refresh");

            if (jQuery("#swipeRefreshContainer .indicatorGraphic").hasClass("invertedIndicator")) {
                jQuery("#swipeRefreshContainer .indicatorGraphic").removeClass("invertedIndicator");
            }

            // Adjust the vertical position of the refresh bar
            jQuery("#swipeRefreshContainer").css({ top: Math.abs(window.scrollY) - 40 });

            // Capture the start time if a refresh is possible and no time is set
            if (updateOnDrag.reloadReady === true && updateOnDrag.releaseCaptureTime === null) {
                // Record the timestamp when the scroll-down phase begins
                updateOnDrag.releaseCaptureTime = new Date();
            }
        }

        // The refresh threshold has been met or exceeded
        if (window.scrollY <= -40) {
            // Change the prompt and visual cue to indicate readiness for release
            jQuery("#swipeRefreshContainer #updateInstruction").html("Release to refresh");

            if (!jQuery("#swipeRefreshContainer .indicatorGraphic").hasClass("invertedIndicator")) {
                jQuery("#swipeRefreshContainer .indicatorGraphic").addClass("invertedIndicator");
            }

            // Ensure the refresh bar is fully visible at the top
            jQuery("#swipeRefreshContainer").css({ top: 0 });

            // Mark the component as ready for a reload
            updateOnDrag.reloadReady = true;

            // Reset the release capture time
            updateOnDrag.releaseCaptureTime = null;
        }

        // User has scrolled back down to or past the page's top, and a reload was primed
        if (window.scrollY >= 0 && updateOnDrag.reloadReady === true) {
            if (updateOnDrag.releaseCaptureTime !== null) {
                // Calculate the duration of the release gesture
                let currentTimestamp = new Date(),
                    elapsedDuration = currentTimestamp.getTime() - updateOnDrag.releaseCaptureTime.getTime();

                // If the release was quick enough, trigger the page update
                if (elapsedDuration < 500) {
                    updateOnDrag.initiateContentReload();
                }
            } else {
                // If no release time was captured (very fast release), trigger reload immediately
                updateOnDrag.initiateContentReload();
            }

            // Reset state variables after potential reload
            updateOnDrag.releaseCaptureTime = null;
            updateOnDrag.reloadReady = false;
        }

        // If the page is scrolled normally (not in pull-to-refresh state)
        if (window.scrollY >= 0) {
            // Position the refresh UI completely out of view
            jQuery("#swipeRefreshContainer").css({ top: -40 });
        }

    },

    initiateContentReload: function() {
        jQuery("#updateIndicatorOverlay").fadeIn(300);

        // Pause briefly to allow the loading animation to be seen
        setTimeout(function() {
            // Execute the full page content refresh
            window.location.reload();
        }, 750);
    }

}; /* End of updateOnDrag module definition */

// When the document's structure is fully loaded, initialize the refresh mechanism.
jQuery(document).ready(updateOnDrag.setupComponent);