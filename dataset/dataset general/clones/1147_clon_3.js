// Ensure the DOM is fully loaded before executing any scripts.
jQuery(function() { // Using jQuery(function) is a shorthand for $(document).ready()

    // Define selectors as constants for better maintainability and clarity.
    const introBannerSelector = "div.page-intro";
    const primaryContentSelector = "div.content-region.main";
    const secondaryContentSelector = "div.content-region.extra";
    const infoFooterSelector = "div.site-info";

    // Define animation durations and delays using descriptive variable names.
    const mainIntroAnimationDuration = 550; // Slightly altered from 500ms
    const mainContentDisplayDelay = 1600;   // Slightly altered from 1500ms
    const secondaryContentDisplayDelay = 1050; // Slightly altered from 1000ms
    const footerSectionDisplayDelay = 525;  // Slightly altered from 505ms

    // Helper function to animate elements robustly.
    // This function adds a check for element existence before proceeding with animation.
    function revealElementWithSlide(elementQuery, durationMilliseconds) {
        const targetElement = jQuery(elementQuery);
        // Guard clause: Only attempt to animate if the element is found in the DOM.
        if (targetElement.length > 0) {
            targetElement.slideDown(durationMilliseconds);
        } else {
            // Optional: Log a warning if an element is not found, useful for debugging.
            // console.warn(`Target element '${elementQuery}' not found for animation.`);
        }
    }

    // Pre-hide all relevant animated elements to ensure consistent starting state,
    // especially if CSS doesn't explicitly handle initial visibility.
    jQuery([
        introBannerSelector,
        primaryContentSelector,
        secondaryContentSelector,
        infoFooterSelector
    ].join(', ')).hide();

    // Start the main animation sequence by revealing the introductory banner.
    // The `animationEventObject` parameter captures event details upon completion.
    jQuery(introBannerSelector).slideDown(mainIntroAnimationDuration, function(animationEventObject) {

        // Optional: Log a message when the initial animation finishes.
        // console.info("Main introductory banner has completed its animation.");

        // Introduce a small, fixed base delay for subsequent animations
        // to slightly offset them from the banner's immediate completion.
        const subsequentAnimationBaseDelay = 50;

        // Schedule the footer section to slide down after its specific delay.
        setTimeout(function() {
            revealElementWithSlide(infoFooterSelector, 500); // Retaining a similar duration for footer
        }, footerSectionDisplayDelay + subsequentAnimationBaseDelay);

        // Schedule the secondary content block to slide down after its specific delay.
        setTimeout(function() {
            revealElementWithSlide(secondaryContentSelector, 420); // Slightly altered duration from 400ms
        }, secondaryContentDisplayDelay + subsequentAnimationBaseDelay);

        // Schedule the primary content block to slide down after the longest delay.
        setTimeout(function() {
            revealElementWithSlide(primaryContentSelector, 550); // Slightly altered duration from 500ms
        }, mainContentDisplayDelay + subsequentAnimationBaseDelay);

    }); // End of main introductory banner animation callback

}); // End of jQuery document ready block