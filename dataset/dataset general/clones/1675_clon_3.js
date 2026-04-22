// A robust jQuery plugin for managing interactive table data,
// enabling real-time aggregation, input validation, and alert messaging.
$.fn.gridValueHandler = function () {
    'use strict'; // Enforce strict mode for cleaner and safer JavaScript.

    // Define internal constants for improved readability and easier modification.
    const LABEL_COLUMN_INDEX = 0; // Index of the column typically used for labels, not numeric data.
    const AGGREGATE_ALERT_THRESHOLD = 5000; // Numeric threshold for triggering a specific alert.
    const WARNING_MESSAGE_SELECTOR = '.alert'; // CSS selector for the alert message element.
    const DECIMAL_PRECISION = 2; // Number of decimal places for displaying aggregated values.

    // Store a reference to the main element this plugin is applied to.
    let hostContainer = $(this);

    // --- Pre-initialization Checks (Guard Clauses) ---
    // Ensure the host container is a table or contains one, otherwise, log a warning and exit.
    if (!hostContainer.is('table') && hostContainer.find('table').length === 0) {
        console.warn('GridValueHandler: Target container is not a table or lacks an embedded table. Plugin initialization aborted.');
        return this; // Maintain chainability even if no action is taken.
    }

    // Identify the actual table element to operate on.
    // If hostContainer is already the table, use it; otherwise, find the first table within.
    let interactiveTable = hostContainer.is('table') ? hostContainer : hostContainer.find('table').first();

    // Fetch key structural components of the table.
    let totalDisplayRow = interactiveTable.find('tfoot tr').first(); // The row where aggregated totals are displayed.
    let dataEntryRows = interactiveTable.find('tbody tr'); // All rows containing data entries.

    // Ensure essential table parts (footer for totals, body for data) are present.
    if (totalDisplayRow.length === 0 || dataEntryRows.length === 0) {
        console.warn('GridValueHandler: Missing `<tfoot>` or `<tbody>` rows. Aggregation features may be limited.');
        // We can still proceed with validation, but aggregation won't work fully.
        // For this clone, we'll still exit here if aggregation is central.
        return this;
    }

    // --- Helper Functions ---

    /**
     * Safely parses a string into a floating-point number.
     * Returns 0 if parsing fails (e.g., non-numeric input) or if the number is not finite.
     * @param {string} rawText The string to be parsed.
     * @returns {number} The parsed float or 0.
     */
    const parseValueAsFloat = (rawText) => {
        const numericResult = parseFloat(rawText);
        return isNaN(numericResult) || !isFinite(numericResult) ? 0 : numericResult;
    };

    /**
     * Calculates the sum of numeric values for a specific column across all data rows.
     * @param {number} targetColumnIndex The 0-based index of the column to sum.
     * @returns {number} The total sum for the specified column.
     */
    const computeColumnAggregate = (targetColumnIndex) => {
        let currentColumnTotal = 0;
        dataEntryRows.each(function () {
            let activeDataRow = $(this);
            // Retrieve text from the cell at the targetColumnIndex and convert it to a number.
            currentColumnTotal += parseValueAsFloat(activeDataRow.children().eq(targetColumnIndex).text());
        });
        return currentColumnTotal;
    };

    /**
     * Refreshes and updates all column aggregate values displayed in the footer row.
     * Iterates through all relevant columns and updates their corresponding total cells.
     */
    const refreshAllColumnAggregates = () => {
        // Determine the number of columns in the footer to iterate through.
        const totalFooterCells = totalDisplayRow.children().length;

        // Loop through each column, starting from the second one (skipping the label column).
        for (let currentIdx = LABEL_COLUMN_INDEX + 1; currentIdx < totalFooterCells; currentIdx++) {
            let calculatedSum = computeColumnAggregate(currentIdx);
            // Update the text content of the footer cell, formatted to a fixed decimal precision.
            totalDisplayRow.children().eq(currentIdx).text(calculatedSum.toFixed(DECIMAL_PRECISION));
        }
    };

    // --- Event Handling Logic ---

    // Attach event listeners to all `<td>` elements within the `<tbody>` for 'change' and 'validate' events.
    interactiveTable.find('tbody td')
        .on('change', function (eventPayload) {
            let modifiedCell = $(this);
            let cellColumnIndex = modifiedCell.index();
            let validationAlert = $(WARNING_MESSAGE_SELECTOR); // Get a reference to the alert element.

            // If the modified cell is in the label column, no numeric aggregation is needed.
            if (cellColumnIndex === LABEL_COLUMN_INDEX) {
                return; // Exit early.
            }

            // Recalculate the sum for the column where the change occurred.
            let newlyCalculatedSum = computeColumnAggregate(cellColumnIndex);

            // Special validation rule: Check column 1's total against a critical threshold.
            if (cellColumnIndex === 1 && newlyCalculatedSum > AGGREGATE_ALERT_THRESHOLD) {
                validationAlert.slideDown(200); // Display the alert with a sliding animation.
                // Returning `false` from a jQuery event handler prevents default action and stops propagation.
                // Here, it signals that the change might be problematic or rejected.
                return false;
            } else {
                validationAlert.slideUp(200); // Hide the alert with a sliding animation.
                // Update the corresponding footer cell with the new aggregate, formatted.
                totalDisplayRow.children().eq(cellColumnIndex).text(newlyCalculatedSum.toFixed(DECIMAL_PRECISION));
            }
        })
        .on('validate', function (eventPayload, valueToValidate) {
            let targetCell = $(this);
            let targetColumnIndex = targetCell.index();

            // Apply different validation rules based on the column index.
            if (targetColumnIndex === LABEL_COLUMN_INDEX) {
                // For the label column, ensure the value is a non-empty string after trimming.
                const isLabelValid = typeof valueToValidate === 'string' && valueToValidate.trim().length > 0;
                // Provide visual feedback for validation status.
                targetCell.toggleClass('validation-error', !isLabelValid);
                return isLabelValid;
            } else {
                // For numeric columns, validate if the value can be parsed as a finite number.
                // Also, explicitly allow '0' as a valid numeric input.
                const isNumericValueValid = parseValueAsFloat(valueToValidate) !== 0 || valueToValidate === '0';
                // Provide visual feedback for validation status.
                targetCell.toggleClass('validation-error', !isNumericValueValid);
                return isNumericValueValid;
            }
        });

    // --- Initialization ---

    // Execute the initial aggregation calculation and display upon plugin load.
    refreshAllColumnAggregates();

    // Return the jQuery object to allow for method chaining.
    return this;
};