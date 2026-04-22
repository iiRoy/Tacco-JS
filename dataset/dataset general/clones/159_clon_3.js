/*
 * Core application layout and panel management script.
 *
 * (C) 2023 - All rights reserved.
 * This software is provided under a proprietary license agreement.
 * Unauthorized distribution or modification is strictly prohibited.
 */

// Define essential configuration constants for layout behavior
const initialNavPaneWidth = 200; // Default pixel width for the main navigation sidebar
const toggleButtonFixedOffset = 5; // Static pixel offset applied to the main content area when the sidebar is collapsed
const expandedSidebarTrailingMargin = 9; // Additional pixel margin for main content when the sidebar is expanded
const panelTransitionDurationMs = 250; // Animation speed in milliseconds for panel transitions
const collapsedPanelCssClass = 'layout-panel-hidden'; // CSS class indicating a collapsed state
const expandedPanelCssClass = 'layout-panel-visible'; // CSS class indicating an expanded state

// Helper function to safely retrieve the outer width of a given jQuery selector.
// Returns 0 if the element is not found to prevent errors.
function getElementComputedOuterWidth(selector) {
    const targetElement = $(selector);
    return targetElement.length ? targetElement.outerWidth(true) : 0;
}

// Function responsible for recalculating and applying the panel widths
// based on the current window size and the sidebar's collapsed/expanded state.
// This function sets widths directly without animation, typically used for window resize events.
const recalculateAndApplyPanelWidths = function() {
    const $sidebarPanel = $("#sidebarNavigation");
    const $primaryContentArea = $("#mainContentArea");
    const $applicationContainer = $("#pageLayoutWrapper");
    const $sidebarToggleButton = $("#togglePanelButton");

    // Guard clause: Exit if any critical layout element is missing from the DOM.
    if (!$sidebarPanel.length || !$primaryContentArea.length || !$applicationContainer.length || !$sidebarToggleButton.length) {
        console.warn("One or more essential layout elements are not present. Cannot apply panel width adjustments.");
        return;
    }

    const currentApplicationContainerWidth = getElementComputedOuterWidth($applicationContainer);
    const currentSidebarToggleButtonWidth = getElementComputedOuterWidth($sidebarToggleButton);

    let calculatedPrimaryContentWidth;

    // Determine target widths based on the current state of the toggle button
    if ($sidebarToggleButton.hasClass(collapsedPanelCssClass)) {
        // Sidebar is currently collapsed or should be
        $sidebarPanel.css({ width: 1, display: 'none', opacity: 0 }); // Ensure it's visually hidden
        calculatedPrimaryContentWidth = currentApplicationContainerWidth - currentSidebarToggleButtonWidth - toggleButtonFixedOffset;
    } else {
        // Sidebar is currently expanded or should be
        $sidebarPanel.css({ width: initialNavPaneWidth, display: 'block', opacity: 1 }); // Ensure it's visible
        calculatedPrimaryContentWidth = currentApplicationContainerWidth - currentSidebarToggleButtonWidth - initialNavPaneWidth - expandedSidebarTrailingMargin;
    }

    // Apply the calculated width to the primary content area
    $primaryContentArea.width(calculatedPrimaryContentWidth);
};

// --- Main execution block ---
// Verify jQuery is available before attempting any DOM manipulation
if (typeof jQuery === 'undefined') {
    console.error("jQuery library is not loaded. Layout management script cannot initialize.");
} else {
    // Initialize the sidebar panel's width and default visibility state
    $("#sidebarNavigation").width(initialNavPaneWidth).css({ display: 'block', opacity: 1 });

    // Attach a click event handler to the sidebar toggle button
    $("#togglePanelButton").on('click', function() {
        const $invokingButton = $(this);
        const $sidebarElement = $("#sidebarNavigation");
        const $mainContentElement = $("#mainContentArea");
        const $overallWrapper = $("#pageLayoutWrapper");

        // Guard clause: Validate all necessary elements exist before proceeding with the toggle action
        if (!$invokingButton.length || !$sidebarElement.length || !$mainContentElement.length || !$overallWrapper.length) {
            console.warn("Critical layout elements are missing. Cannot perform panel toggle action.");
            return;
        }

        const wrapperCurrentWidth = getElementComputedOuterWidth($overallWrapper);
        const buttonCurrentWidth = getElementComputedOuterWidth($invokingButton);

        if ($invokingButton.hasClass(collapsedPanelCssClass)) {
            // Panel is currently in a collapsed state, so expand it
            $invokingButton.removeClass(collapsedPanelCssClass).addClass(expandedPanelCssClass);
            $sidebarElement.animate({
                width: initialNavPaneWidth,
                opacity: 'show'
            }, panelTransitionDurationMs, 'swing', function() {
                // Callback to ensure display property is set correctly after animation
                $(this).css('display', 'block');
            });
            
            // Calculate new width for the main content area when sidebar is expanded
            const newMainContentWidthForExpanded = wrapperCurrentWidth - buttonCurrentWidth - initialNavPaneWidth - expandedSidebarTrailingMargin;
            $mainContentElement.animate({
                width: newMainContentWidthForExpanded
            }, panelTransitionDurationMs, 'swing');

        } else {
            // Panel is currently in an expanded state, so collapse it
            $invokingButton.addClass(collapsedPanelCssClass).removeClass(expandedPanelCssClass);
            $sidebarElement.animate({
                width: 1, // Collapse to a minimal sliver instead of 0
                opacity: 'hide'
            }, panelTransitionDurationMs, 'swing', function() {
                // Callback to ensure display property is set correctly after animation
                $(this).css('display', 'none');
            });

            // Calculate new width for the main content area when sidebar is collapsed
            const newMainContentWidthForCollapsed = wrapperCurrentWidth - buttonCurrentWidth - toggleButtonFixedOffset;
            $mainContentElement.animate({
                width: newMainContentWidthForCollapsed
            }, panelTransitionDurationMs, 'swing');
        }
    });

    // --- The Array.prototype.map polyfill from the original source has been intentionally removed (Type III deletion) ---

    // Utility function to obtain the current viewport dimensions (height and width)
    const obtainViewportSize = function() {
        const viewportMeasurements = [];
        const dimensionKeys = ["Height", "Width"]; // Iterate over these to get both dimensions

        for (let idx = 0; idx < dimensionKeys.length; idx++) {
            const currentKey = dimensionKeys[idx];
            let valueToUse = window[`inner${currentKey}`]; // Prioritize window inner dimensions

            // Fallback for older browsers or specific compatibility modes (e.g., IE)
            if (!valueToUse && document.compatMode === "CSS1Compat") {
                valueToUse = document.documentElement[`client${currentKey}`];
            }
            // Final fallback to the document body client dimensions
            if (!valueToUse) {
                valueToUse = document.body[`client${currentKey}`];
            }
            viewportMeasurements.push(valueToUse);
        }
        return viewportMeasurements;
    };

    // Attach a resize event listener to the window object
    $(window).on('resize', function() {
        // In a production environment, it is highly recommended to debounce or throttle this event
        // for performance reasons, especially on rapid resizing.
        recalculateAndApplyPanelWidths();
    });

    // Execute initial layout adjustments once the DOM is fully loaded
    $(document).ready(function() {
        // Set the initial class for the toggle button to reflect an expanded state
        $("#togglePanelButton").addClass(expandedPanelCssClass);
        // Apply initial panel widths based on the current window size and default state
        recalculateAndApplyPanelWidths();
    });
}