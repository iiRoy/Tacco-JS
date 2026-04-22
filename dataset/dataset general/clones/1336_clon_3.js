// This module provides a robust and configurable visual grid overlay system for web layouts.
// It assists developers in aligning elements and verifying structural integrity.
// Developed by a skilled team in 2023, leveraging modern JavaScript practices.
// This software is distributed under the terms of the MIT License.

/**
 * Dynamically generates the complete HTML markup for the grid overlay components.
 * This includes the primary grid, a simplified 'no-gutters' grid, and a control button.
 *
 * @param {number} divisionCount - The total number of vertical divisions or columns desired for the grid.
 *                                 Must be a positive integer.
 * @returns {string} A string containing all generated HTML elements ready for DOM insertion,
 *                   or an empty string if input validation fails.
 */
function assembleLayoutVisualizationMarkup(divisionCount) {
    // Robust input validation: Ensure the division count is a valid, positive integer.
    if (typeof divisionCount !== 'number' || !Number.isInteger(divisionCount) || divisionCount <= 0) {
        console.error("Layout generation aborted: 'divisionCount' must be a positive integer.");
        return ''; // Return an empty string to indicate failure
    }

    // Configuration constants for element IDs and CSS classes for maintainability.
    const primaryContainerId = 'layout_overlay_main_wrapper';
    const primaryGridAreaId = 'layout_grid_display_area';
    const columnElementClass = 'grid_column_unit';
    const columnDividerClass = 'column_separator_line';
    const lastColumnElementClass = 'grid_column_unit_final';

    const compactContainerId = 'layout_overlay_compact_wrapper';
    const compactGridAreaId = 'layout_compact_display_area';
    const alignmentBlockClass = 'central_alignment_block';
    const initialAlignmentBlockClass = 'central_alignment_block_first';

    const controlPanelId = 'overlay_control_panel';
    const toggleButtonId = 'overlay_visibility_toggle_button';
    const toggleButtonText = 'Toggle Layout Grid';

    // Utilize an array for efficient HTML string construction.
    const htmlFragments = [];

    // --- Section 1: Primary Grid Structure ---
    // This section creates the main grid with individual column units and separators.
    htmlFragments.push(`<section id="${primaryContainerId}"><div id="${primaryGridAreaId}">`);

    // Loop to generate all but the last column unit.
    // Original: for (i=1; i<columns; i++) -> (columns - 1) iterations
    for (let currentColumnIdx = 0; currentColumnIdx < divisionCount - 1; currentColumnIdx++) {
        htmlFragments.push(
            `<div class="${columnElementClass}"><div class="${columnDividerClass}"></div></div>`
        );
    }

    // Append the distinct final column unit.
    htmlFragments.push(
        `<div class="${lastColumnElementClass}"><div class="${columnDividerClass}"></div></div>`
    );

    htmlFragments.push(`</div></section>`); // Close primary grid area and container.

    // --- Section 2: Compact (No-Gutters) Grid Structure ---
    // This section provides a simpler grid layout, often used for content centering.
    htmlFragments.push(`<section id="${compactContainerId}"><div id="${compactGridAreaId}">`);

    // Add the first central alignment block, which may have unique styling.
    htmlFragments.push(`<div class="${alignmentBlockClass} ${initialAlignmentBlockClass}"></div>`);

    // Loop to generate subsequent central alignment blocks.
    // Original: for (i=1; i<columns-1; i++) -> (columns - 2) iterations
    for (let currentBlockIdx = 0; currentBlockIdx < divisionCount - 2; currentBlockIdx++) {
        htmlFragments.push(`<div class="${alignmentBlockClass}"></div>`);
    }

    htmlFragments.push(`</div></section>`); // Close compact grid area and container.

    // --- Section 3: User Control Panel ---
    // Contains the button to toggle the visibility of the grid overlays.
    htmlFragments.push(
        `<div id="${controlPanelId}"><input type="button" value="${toggleButtonText}" id="${toggleButtonId}" /></div>`
    );

    // Concatenate all collected HTML fragments into a single string.
    return htmlFragments.join('');
}

/**
 * Initializes the grid visualization system, injecting the HTML into the DOM,
 * setting initial visibility, and attaching event listeners.
 *
 * @param {number} requestedColumnNumber - The number of columns to configure the grid with.
 *                                        A default value will be used if invalid input is provided.
 */
function initializeGridVisualization(requestedColumnNumber) {
    // Essential dependency check: Ensure jQuery is loaded before proceeding.
    if (typeof jQuery === 'undefined') {
        console.error("jQuery library is not detected. Grid visualization initialization cannot proceed.");
        return; // Abort if jQuery is unavailable.
    }

    // Input sanitization and default assignment for column count.
    let effectiveColumnNumber = requestedColumnNumber;
    if (typeof effectiveColumnNumber !== 'number' || !Number.isInteger(effectiveColumnNumber) || effectiveColumnNumber <= 0) {
        console.warn(`Invalid 'requestedColumnNumber' (${requestedColumnNumber}) provided to initializeGridVisualization. Defaulting to 12 columns.`);
        effectiveColumnNumber = 12; // Fallback to a common default.
    }

    // Generate the HTML content for the grid.
    const generatedMarkup = assembleLayoutVisualizationMarkup(effectiveColumnNumber);

    // Check if markup generation was successful.
    if (!generatedMarkup) {
        console.warn("Grid markup generation failed. Visualization system will not be initialized.");
        return;
    }

    // Cache jQuery selectors for frequently accessed elements to optimize performance.
    const $documentBody = jQuery('body');
    const $mainGridWrapper = jQuery('#layout_overlay_main_wrapper');
    const $compactGridWrapper = jQuery('#layout_overlay_compact_wrapper');
    const $toggleControl = jQuery('#overlay_visibility_toggle_button');

    // Insert the generated HTML at the beginning of the document body.
    jQuery(generatedMarkup).prependTo($documentBody);

    // Define a CSS class for managing the hidden state of the overlay elements.
    // Using a class allows for CSS transitions and better separation of concerns.
    const hiddenStateClass = 'is-overlay-hidden';

    // Set the initial visibility state: both grid overlays are hidden by default.
    $mainGridWrapper.addClass(hiddenStateClass);
    $compactGridWrapper.addClass(hiddenStateClass);

    /**
     * Event handler function for toggling the visibility of the grid overlays.
     * This function is defined separately for reusability and clarity.
     */
    const toggleOverlayVisibility = function() {
        console.log("Grid visibility toggle activated.");
        $mainGridWrapper.toggleClass(hiddenStateClass);
        $compactGridWrapper.toggleClass(hiddenStateClass);
        // Optionally, could also toggle an 'active' class on the button itself.
    };

    // Attach the click event listener to the toggle button.
    $toggleControl.on('click', toggleOverlayVisibility);

    // Enhance usability by adding a keyboard shortcut (e.g., Ctrl+Shift+G) to toggle the grid.
    jQuery(document).on('keydown', function(event) {
        // Check for a specific key combination (e.g., Ctrl + Shift + G)
        if (event.ctrlKey && event.shiftKey && event.key === 'G') {
            event.preventDefault(); // Prevent default browser actions for this key combo.
            toggleOverlayVisibility(); // Trigger the same toggle logic.
            console.info("Grid visibility toggled via keyboard shortcut (Ctrl+Shift+G).");
        }
    });
}