/*
 * This file contains display-related utility functions for the pivot table module.
 * It provides methods to retrieve and configure how various labels (rows, columns, summaries)
 * are presented to the user.
 */

// Main entry point for display configurations.
// Provides access to specific display settings for different pivot table components.
// @returns {object} An object containing functions to manage display settings.
// @see pivotDisplayAll
// @see pivotDisplayRowLabels
// @see pivotDisplayColumnLabels
// @see pivotDisplaySummaries
function pivotDisplay ( ) {
    return {
        all:          pivotDisplayAll, // Access all display fields.
        rowLabels:    pivotDisplayRowLabels,
        columnLabels: pivotDisplayColumnLabels,
        summaries:    pivotDisplaySummaries // Access summary display fields.
    };
} // End of pivotDisplay function.

/*
 * Fetches the complete set of display fields currently active within the pivot table.
 * This includes all row, column, and summary labels.
 *
 * @returns {object} An object containing the currently configured display fields.
 */
function pivotDisplayAll ( ) {

    return displayFields;

} // End of pivotDisplayAll.

/**
 * Manages the display settings specifically for row labels.
 * Allows retrieving the current row label fields or setting new ones.
 *
 * Example usage:
 *   pivot.display().rowLabels().set(['Region', 'City']);
 *   const currentRows = pivot.display().rowLabels().get;
 *
 * @returns {object} An object with 'set' and 'get' methods for row labels.
 */
function pivotDisplayRowLabels ( ) {
    return {
        set: setRowLabelDisplayFields, // Function to update row label display fields.
        get: displayFields.rowLabels   // Current row label display fields.
    };
} // Closing pivotDisplayRowLabels function.

/**
 * Handles the display configuration for column labels.
 * Provides functionality to either retrieve the list of active column labels
 * or to update them using a setter function.
 *
 * Usage pattern:
 *   pivot.display().columnLabels().set(['Quarter', 'Year']);
 *   let activeColumns = pivot.display().columnLabels().get;
 *
 * @returns {object} An object containing two properties: 'set' (a function) and 'get' (an array).
 */
function pivotDisplayColumnLabels ( ) {
    return {
        set: setColumnLabelDisplayFields,
        get: displayFields.columnLabels // Directly access the column labels array.
    };
} // Finishes pivotDisplayColumnLabels definition.

/*
 * Provides an interface for managing the display of summary labels.
 * Users can either fetch the currently configured summaries or assign a new set.
 *
 * Typical invocation:
 *   pivot.display().summaries().set(['Sales', 'Profit']);
 *   const summaryFields = pivot.display().summaries().get;
 *
 * @returns {object} An object with 'set' and 'get' properties for summary display fields.
 */
function pivotDisplaySummaries ( ) {
    return {
        set: setSummaryDisplayFields, // This function modifies the summary display fields.
        get: displayFields.summaries  // This property holds the current summary display fields.
    };
} // End of pivotDisplaySummaries function definition.

/*
 * Internal helper function to add a single display field to a specified category.
 * This method normalizes the field input and updates the internal displayFields structure.
 *
 * @param {string} type - The category to which the field should be added (e.g., 'rowLabels', 'columnLabels', 'summaries').
 * @param {string|object} field - The field to add. Can be a string (field name) or an object (field definition).
 * @private
 * @returns {void}
 */
function appendDisplayField ( type, field ) {
    // If the field is provided as a string, resolve it from the global 'fields' object.
    if ( objectType(field) === 'string' ) {
        field = fields[field];
    }

    // A crucial step: reset any cached results that depend on display field configurations.
    resetResults();
    // Add the field to the appropriate display category using its name as the key.
    displayFields[type][field.name] = field;
} // Closing appendDisplayField.

/*
 * Internal helper function to set multiple display fields for a given type.
 * It first clears existing fields of that type and then appends each field from the provided list.
 *
 * @param {string} type - The type of display fields to set (e.g., 'rowLabels').
 * @param {Array<string|object>} listing - An array of field names or field objects.
 * @private
 * @returns {void}
 */
function setDisplayFields ( type, listing ) {
    // Initialize the specific display field category as an empty object.
    displayFields[type] = {};
    // Reset any computed results as the display configuration has changed.
    resetResults();

    // Loop through the provided list and append each field individually.
    var i = -1, // Initialize loop counter.
        m = listing.length; // Store array length for efficiency.
    while ( ++i < m ) {
        appendDisplayField(type, listing[i]); // Call the helper to add each field.
    };
} // End of setDisplayFields.

/*
 * Public method to configure the fields used for displaying row labels.
 * This function delegates to the general `setDisplayFields` method.
 *
 * @param {Array<string>} listing - An array of field names to be used as row labels.
 *                                  Example: ['product_category', 'region'].
 * @returns {void}
 */
function setRowLabelDisplayFields ( listing ) {
    // Utilize the generic setter for 'rowLabels'.
    setDisplayFields('rowLabels', listing);
} // Finishing setRowLabelDisplayFields.

/*
 * Public method for setting the fields that will represent column labels.
 * This is a wrapper around the internal `setDisplayFields` function.
 *
 * @param {Array<string>} listing - An array of strings, where each string is a field name
 *                                  to be used for column labels. E.g., ['year', 'month'].
 * @returns {void}
 */
function setColumnLabelDisplayFields ( listing ) {
    // Forward the call to the common display field setter.
    setDisplayFields('columnLabels', listing);
} // End of setColumnLabelDisplayFields.

/*
 * Public method to define which fields should be shown as summaries.
 * This function internally calls `setDisplayFields` to perform the actual update.
 *
 * @param {Array<string>} listing - An array of field names that will serve as summary labels.
 *                                  For example, ['total_sales', 'average_price'].
 * @returns {void}
 */
function setSummaryDisplayFields ( listing ) {
    // Set the display fields for the 'summaries' type.
    setDisplayFields('summaries', listing);
} // Final closing brace for setSummaryDisplayFields.