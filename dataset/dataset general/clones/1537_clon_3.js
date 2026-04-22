jQuery(document).ready(function($) {
    // Core configuration and state management for the dynamic off-canvas navigation.
    const SLIDE_DURATION_MILLIS = 300; // Specifies the animation speed for panel transitions.
    let isNavigationPanelOpen = false; // Tracks the current visibility status of the side panel.

    // Define robust CSS selectors for critical UI elements.
    const SELECTOR_PANEL_ACTIVATOR = '.sidebar-toggle-button';
    const SELECTOR_OFF_CANVAS_PANEL = '.app-sidebar-container';
    const SELECTOR_PANEL_INNER_CONTENT = '.app-sidebar-container .navigation-content-wrapper';
    const SELECTOR_MAIN_APPLICATION_AREA = 'body';

    // Pre-fetch and cache jQuery objects for improved performance and code clarity.
    const $sidebarToggleButton = $(SELECTOR_PANEL_ACTIVATOR);
    const $offCanvasSidebar = $(SELECTOR_OFF_CANVAS_PANEL);
    const $mainContentBody = $(SELECTOR_MAIN_APPLICATION_AREA);

    // --- Essential Pre-Check: Validate the presence of required DOM elements ---
    // If key elements are missing, log a warning and prevent script execution to avoid errors.
    if (!$sidebarToggleButton.length || !$offCanvasSidebar.length) {
        console.warn('Warning: One or more essential sidebar components (toggle button or panel) are missing from the DOM. Off-canvas script disabled.');
        return; // Terminate script execution.
    }

    /**
     * Manages the open/close state and animation of the off-canvas navigation panel.
     * This function is designed to be idempotent, toggling the state based on `isNavigationPanelOpen`.
     * @param {Event} userEvent - The event object, typically from a click, used for `preventDefault()`.
     */
    const manageSidebarDisplay = function(userEvent) {
        userEvent.preventDefault(); // Halt the default action associated with the event (e.g., link navigation).

        // Dynamically calculate the target width for the panel based on its inner content.
        const currentPanelContentWidth = $offCanvasSidebar.find(SELECTOR_PANEL_INNER_CONTENT).outerWidth();
        // Implement a robust fallback for panel width to ensure animations always have a target.
        const animatedPanelTargetWidth = (currentPanelContentWidth && currentPanelContentWidth > 0) ? currentPanelContentWidth : 280; // Default to 280px if content width is invalid.

        if (!isNavigationPanelOpen) { // If the panel is currently closed, proceed to open it.
            // Initiate animation for the off-canvas panel to reveal it.
            $offCanvasSidebar.stop(true, true).animate({
                width: `${animatedPanelTargetWidth}px`
            }, SLIDE_DURATION_MILLIS);

            // Simultaneously animate the main application body to shift it, creating space for the panel.
            $mainContentBody.stop(true, true).animate({
                marginLeft: `${animatedPanelTargetWidth}px`,
                marginRight: `-${animatedPanelTargetWidth}px`
            }, SLIDE_DURATION_MILLIS, function() {
                isNavigationPanelOpen = true; // Update the state flag upon animation completion.
            });
        } else { // If the panel is currently open, proceed to close it.
            // Initiate animation for the off-canvas panel to hide it.
            $offCanvasSidebar.stop(true, true).animate({
                width: 0 // Animate to zero width to visually hide the panel.
            }, SLIDE_DURATION_MILLIS, function() {
                // Crucial cleanup: Reset the width CSS property to allow external stylesheets (e.g., media queries) to manage width.
                $(this).css('width', '');
            });

            // Return the main application body to its default, unshifted position.
            $mainContentBody.stop(true, true).animate({
                marginLeft: 0,
                marginRight: 0
            }, SLIDE_DURATION_MILLIS, function() {
                isNavigationPanelOpen = false; // Update the state flag once the closing animation is complete.
            });
        }
    };

    // Attach the primary event listener to the sidebar toggle button.
    $sidebarToggleButton.on('click', manageSidebarDisplay);

    // --- Enhanced User Experience: Implement "Click Outside to Close" functionality ---
    // This feature allows users to close the sidebar by clicking anywhere on the main body
    // that is outside of the sidebar itself or its toggle button.
    $mainContentBody.on('click', function(event) {
        // Only proceed if the panel is currently open.
        if (isNavigationPanelOpen) {
            // Check if the click target is NOT within the sidebar panel AND NOT the toggle button.
            const clickedOutsidePanel = !$(event.target).closest(SELECTOR_OFF_CANVAS_PANEL).length;
            const clickedOutsideToggleButton = !$(event.target).closest(SELECTOR_PANEL_ACTIVATOR).length;

            if (clickedOutsidePanel && clickedOutsideToggleButton) {
                manageSidebarDisplay(event); // Re-use the existing function to gracefully close the sidebar.
            }
        }
    });
});