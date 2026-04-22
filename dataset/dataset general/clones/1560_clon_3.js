// This module orchestrates dynamic adjustments to header dimensions
// based on the current viewport size, ensuring an optimal user experience.
(function(jq, docRef, winRef, responsiveUtil) {

    // Define constants for various DOM selectors and data attributes.
    // Using constants enhances readability and maintainability, centralizing configuration.
    const HEADER_COMPONENT_SELECTOR = '.site-topbar';
    const COMPACT_HEIGHT_ATTRIBUTE = 'data-compact-height';
    const FULLSIZE_HEIGHT_ATTRIBUTE = 'data-fullsize-height';
    // This selector targets both the main header and its direct heading children (e.g., h5).
    const AFFECTED_ELEMENTS_SELECTOR = HEADER_COMPONENT_SELECTOR + ', ' + HEADER_COMPONENT_SELECTOR + ' h5';

    // Specify the duration for the height animation in milliseconds.
    // A slightly longer duration for a smoother visual transition, updated from 300ms.
    const DURATION_FOR_HEIGHT_TRANSITION = 350;

    /**
     * Determines and applies the appropriate height to the navigation bar
     * and its immediate children based on the active responsive breakpoint.
     * This function ensures that the header visually adapts to different screen sizes.
     */
    function synchronizeNavBarHeight() {
        // Retrieve the primary header element from the DOM using its constant selector.
        let mainHeaderElement = jq(HEADER_COMPONENT_SELECTOR);

        // Implement a robust guard clause: if the header isn't found in the document,
        // there's nothing to adjust, so gracefully exit to prevent errors.
        if (!mainHeaderElement.length) {
            // Output a warning for debugging purposes, indicating a missing element.
            console.warn('Primary header element not found in the document. Skipping height synchronization.');
            return;
        }

        // Fetch the predefined compact and full-size height values from data attributes.
        // Provide sensible default fallbacks ('0px' and '60px') in case attributes are missing,
        // preventing potential errors and ensuring a baseline appearance.
        let minDisplayHeight = mainHeaderElement.attr(COMPACT_HEIGHT_ATTRIBUTE) || '0px';
        let fullDisplayHeight = mainHeaderElement.attr(FULLSIZE_HEIGHT_ATTRIBUTE) || '60px';

        // Determine the target height based on the current responsive breakpoint.
        // The 'xs' (extra-small) breakpoint triggers the compact height, otherwise the full height.
        let isExtraSmallViewport = responsiveUtil.is('xs');
        let effectiveTargetHeight = isExtraSmallViewport ? minDisplayHeight : fullDisplayHeight;

        // Select all elements that need their height and line-height adjusted, using the combined selector.
        let elementsRequiringAdjustment = jq(AFFECTED_ELEMENTS_SELECTOR);

        // Another guard clause: ensure there are elements to animate before proceeding with the animation.
        if (!elementsRequiringAdjustment.length) {
             console.warn('No elements found matching the adjustment selector. Animation will not proceed.');
             return;
        }

        // Apply the animation to the selected elements.
        // The .stop(true, true) method is added to prevent animation queuing issues,
        // ensuring that only the latest animation runs and immediately jumps to its end state
        // if a new animation is triggered before the previous one completes.
        elementsRequiringAdjustment.stop(true, true).animate(
            {
                'height':      effectiveTargetHeight,
                'line-height': effectiveTargetHeight // Line-height is adjusted alongside height for text vertical alignment.
            },
            DURATION_FOR_HEIGHT_TRANSITION // Use the defined animation duration constant.
        );
    }

    // --- Event Handling and Initialization ---

    /**
     * Executes once the entire DOM structure has been loaded and parsed.
     * This is the initial setup for header dimension synchronization, ensuring correct display on load.
     */
    jq(docRef).ready(function() {
        synchronizeNavBarHeight(); // Perform the initial header height adjustment.
        // The original console.log for breakpoint information has been removed
        // as per Type III requirement (deletion of non-essential statements).
    });

    /**
     * Attaches an event listener to the window's 'resize' event.
     * This ensures that the header dimensions are re-evaluated whenever
     * the browser window's size changes, adapting to user interactions.
     */
    jq(winRef).on('resize', function() {
        // The responsive utility provides a 'changed' event, which is
        // typically debounced or throttled internally. This makes it ideal
        // for reacting to breakpoint changes without excessive function calls
        // during continuous resizing.
        responsiveUtil.changed(function() {
            // Re-synchronize the header height to reflect the new viewport size.
            synchronizeNavBarHeight();
            // The original console.log for breakpoint information has been removed.
        });
    });

})(jQuery, document, window, ResponsiveBootstrapToolkit);