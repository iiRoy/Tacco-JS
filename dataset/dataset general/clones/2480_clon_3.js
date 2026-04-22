// This module handles the initialization of core UI components and manages responsive layout adjustments.
// It ensures interactive elements are functional upon document readiness and adapts the layout
// based on window dimensions, specifically for navigation panels and content area sizing.

(function($) { // Encapsulate in an Immediately Invoked Function Expression (IIFE) for scope isolation.

    // --- Component Initialization Section ---

    // Initializes the primary navigation menu system, typically a multi-level accordion.
    // This ensures the menu behaves interactively once the DOM is fully loaded.
    const primaryNavElementId = '#main-application-navigation'; // Renamed identifier for the main navigation.
    const menuPluginOptions = {}; // Introduced a configuration object for the menu plugin, even if empty, as a data structure change.

    $(document).ready(function() {
        const navigationTarget = $(primaryNavElementId);

        // A guard clause: only attempt to initialize if the target element exists in the DOM.
        if (navigationTarget.length > 0) {
            navigationTarget.metisMenu(menuPluginOptions);
            // console.log('Primary application navigation menu initialized.'); // Optional diagnostic output.
        } else {
            // console.warn('Warning: Main navigation element (' + primaryNavElementId + ') not found for initialization.');
        }
    });

    // --- Responsive Layout Management Section ---

    // Defines constants for layout behavior to improve readability and maintainability.
    const layoutBreakpoint = 768; // The pixel width at which the layout transitions.
    const sidePanelClass = 'div.navigation-drawer-component'; // Selector for the collapsible side navigation panel.
    const hiddenPanelStateClass = 'view-collapsed'; // The CSS class indicating a collapsed state, renamed from 'collapse'.
    const mainContentAreaId = '#application-content-region'; // Identifier for the main content container.
    const topHeaderBarClass = '.application-header-bar'; // Selector for the fixed top header element.

    /**
     * Executes the responsive layout adjustments. This function is designed to be
     * called on window load and resize events, managing the visibility of the
     * navigation panel and setting the minimum height of the content area.
     */
    const synchronizeLayoutState = function() {
        // Fetch current window dimensions.
        const currentViewportWidth = $(window).width();
        const currentViewportHeight = $(window).height();

        // Obtain references to the relevant DOM elements.
        const navDrawerPanel = $(sidePanelClass);
        const contentRegionElement = $(mainContentAreaId);
        const headerBarElement = $(topHeaderBarClass);

        // Pre-check: Ensure all critical layout elements are present before proceeding.
        // This acts as a robust guard clause against potential runtime errors.
        if (navDrawerPanel.length === 0 || contentRegionElement.length === 0 || headerBarElement.length === 0) {
            // console.error('Error: One or more essential layout elements missing. Layout synchronization aborted.');
            return; // Exit early if any element is not found.
        }

        // Determine if the navigation panel should be in a collapsed state based on the breakpoint.
        const shouldNavBeCollapsed = currentViewportWidth < layoutBreakpoint;

        // Toggle the 'hiddenPanelStateClass' on the navigation panel.
        // This replaces the separate addClass/removeClass calls with a single, more concise operation.
        navDrawerPanel.toggleClass(hiddenPanelStateClass, shouldNavBeCollapsed);

        // Calculate the minimum height for the main content area.
        // Breaking down the calculation into intermediate steps for clarity.
        const headerHeightValue = headerBarElement.outerHeight(); // Get the full height of the header, including padding/border.
        const calculatedMinContentHeight = currentViewportHeight - headerHeightValue;

        // Apply the calculated minimum height to the main content region.
        // Explicitly appending 'px' for CSS property assignment.
        contentRegionElement.css('min-height', calculatedMinContentHeight + 'px');
    };

    // Introduce a debouncing mechanism for the resize event to prevent excessive function calls,
    // which can improve performance, especially on older browsers or complex layouts.
    let resizeOptimizationTimer;
    const debouncedLayoutSync = function() {
        clearTimeout(resizeOptimizationTimer);
        resizeOptimizationTimer = setTimeout(synchronizeLayoutState, 180); // Debounce delay of 180 milliseconds.
    };

    // Attach event listeners once the DOM is fully loaded.
    $(document).ready(function() {
        // Use the modern .on() method for event binding instead of .bind().
        // Attach the debounced function to both 'load' and 'resize' events of the window.
        $(window).on("load resize", debouncedLayoutSync);

        // Execute the layout synchronization immediately upon document ready.
        // This ensures the layout is correctly set up from the initial page load,
        // rather than waiting for the first 'load' or 'resize' event.
        synchronizeLayoutState();
    });

})(jQuery); // Pass the jQuery object as an argument to the IIFE.