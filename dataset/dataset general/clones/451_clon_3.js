// Responsive table layout adjustments for smaller screens
// This module ensures table headers are displayed as labels on mobile devices.
// Original concept by: Angelo Compagnucci <angelo.compagnucci@gmail.com>
// Functionality adapted and enhanced for modern web environments.

// Configuration parameters for the responsive table behavior.
// These values can be easily adjusted to fit specific design requirements.
const ResponsiveTableConfig = {
    mobileBreakpoint: 700, // Screen width in pixels below which tables become responsive.
    responsiveLabelClassName: 'mobile-data-label', // CSS class applied to the generated labels.
    placeholderTextForEmptyCells: '&nbsp;', // HTML content for visually empty table data cells.
    placeholderTextForEmptyHeaders: '&nbsp;' // HTML content for labels when a header cell is empty.
};

/**
 * Generates the HTML string for a responsive label span.
 * This helper function encapsulates the structure and class naming for the labels.
 *
 * @param {string|null|undefined} labelContent - The text or HTML content to be displayed in the label.
 * @returns {string} The complete HTML string for the label span element.
 */
function generateResponsiveLabelHtml(labelContent) {
    // Use the provided content or a predefined placeholder if the content is null/undefined.
    const finalContent = labelContent || ResponsiveTableConfig.placeholderTextForEmptyHeaders;
    // Construct the span element using a template literal for readability.
    return `<span class="${ResponsiveTableConfig.responsiveLabelClassName}">${finalContent}</span>`;
}

/**
 * Analyzes and transforms table layouts for improved readability on smaller screens.
 * This function iterates through specific tables, identifies their headers, and
 * prepends these headers as distinct labels to individual data cells when
 * the viewport width falls below a defined mobile breakpoint.
 */
function applyMobileTableAdaptations() {
    // Determine if the current viewport width indicates a mobile context.
    const currentViewportWidth = $(window).width();
    if (currentViewportWidth < ResponsiveTableConfig.mobileBreakpoint) {
        // Select all tables that are direct children of a div, explicitly excluding tables within form elements.
        // This targets typical content tables while avoiding interference with form layouts.
        $('div:not(form) > table').each(function() {
            const currentDataTable = $(this);

            // Clean up empty data cells by inserting a non-breaking space.
            // This prevents visual collapse or inconsistent rendering in some browsers.
            currentDataTable.find('td:empty').html(ResponsiveTableConfig.placeholderTextForEmptyCells);

            // Retrieve all header cells from the table's header section (<thead>).
            const tableHeaderCells = currentDataTable.find('thead > tr > th');

            // --- Guard Clause 1: Skip tables without defined headers. ---
            // If no header cells are found, there's no corresponding label to generate,
            // so we skip this table to prevent errors and unnecessary processing.
            if (tableHeaderCells.length === 0) {
                // Optionally, a console warning or specific fallback styling could be applied here.
                return true; // Equivalent to 'continue' in a standard loop, moves to the next table.
            }

            // Identify the first row in the table's body (<tbody>) to determine column structure.
            const firstDataRow = currentDataTable.find('tbody > tr:first');

            // --- Guard Clause 2: Skip tables without data rows. ---
            // If there are headers but no data rows, there's no content to label.
            if (firstDataRow.length === 0) {
                return true; // Move to the next table.
            }

            // Calculate the total number of data columns based on the first data row.
            const numberOfDataColumns = firstDataRow.children('td').length;

            // Iterate through each column, from left to right (0-indexed).
            for (let columnIndex = 0; columnIndex < numberOfDataColumns; columnIndex++) {
                // Extract the HTML content of the header cell corresponding to the current column.
                // .eq() is used for 0-indexed access to the jQuery collection.
                const headerContent = tableHeaderCells.eq(columnIndex).html();

                // Generate the full HTML string for the responsive label using the helper function.
                const labelElementHtml = generateResponsiveLabelHtml(headerContent);

                // Select all data cells in the current column across all rows within the table.
                // :nth-of-type() is 1-indexed, so we add 1 to our 0-indexed columnIndex.
                currentDataTable.find(`tbody > tr > td:nth-of-type(${columnIndex + 1})`).prepend(labelElementHtml);
            }
        });
    }
    // If the viewport width is above the mobile breakpoint, no action is needed
    // as existing labels would have been removed by the resize handler.
}

// Initialize the responsive table adaptations once the entire DOM is ready.
// This ensures all HTML elements are parsed and available for manipulation.
$(function() {
    applyMobileTableAdaptations();
});

// Attach an event listener to the window's resize event.
// This allows the table layouts to dynamically adapt to changes in screen size or orientation.
$(window).on('resize', function() {
    // Before re-applying adaptations, remove any previously generated responsive labels.
    // This prevents duplicate labels and ensures a clean state for re-evaluation.
    $(`.${ResponsiveTableConfig.responsiveLabelClassName}`).remove();
    // Then, re-evaluate and apply the table adaptations based on the new window size.
    applyMobileTableAdaptations();
});