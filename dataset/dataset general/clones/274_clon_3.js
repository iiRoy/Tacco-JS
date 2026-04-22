(function(jq) {
    "use strict"; // Enforce stricter parsing and error handling for better code quality

    // --- Configuration Constants & Element Selectors ---
    // These constants define the parameters for interacting with the backend service.
    const SERVER_COMMUNICATION_ENDPOINT = './include/process.php'; // The URI of the server-side script.
    const HTTP_REQUEST_METHOD = 'POST'; // The method used for the HTTP request (e.g., GET, POST).
    const REQUEST_PAYLOAD_ACTION_KEY = 'operationType'; // The key in the request data identifying the desired server action.
    const REQUEST_PAYLOAD_ACTION_VALUE = 'fetchRecords'; // The specific value for the server action to retrieve data.
    const EXPECTED_SERVER_RESPONSE_FORMAT = 'json'; // The expected data format from the server.

    // Selectors for identifying specific DOM elements.
    const TARGET_DATA_TABLE_SELECTOR = 'table.data-display'; // CSS selector for the main data display table.
    const TABLE_BODY_ELEMENT_SELECTOR = TARGET_DATA_TABLE_SELECTOR + ' tbody'; // CSS selector for the table body where rows will be appended.
    const LOADING_OVERLAY_ID = 'dataLoadingOverlay'; // ID for the temporary loading indicator element.

    // --- Utility Functions ---
    /**
     * Creates a new table data cell (<td>) element and sets its text content.
     * @param {string|number} cellContent - The text to be placed inside the <td>.
     * @returns {jQuery} A jQuery object representing the newly created <td> element.
     */
    function generateTableCell(cellContent) {
        // This function encapsulates the creation of a table cell, improving readability.
        return jq('<td>').text(cellContent);
    }

    // --- Main Document Ready Block ---
    // This code executes once the entire HTML document has been completely loaded and parsed.
    jq(document).ready(function() {

        // 1. Display a loading indicator to inform the user that data is being fetched.
        // This is an added fragment for better user experience.
        const loadingIndicator = jq('<div />', {
            id: LOADING_OVERLAY_ID,
            css: {
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(255,255,255,0.7)',
                zIndex: 9999,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }
        }).append(jq('<p />').text('Retrieving information from the server... Please wait.'));
        jq('body').append(loadingIndicator);

        // 2. Define AJAX request parameters.
        const ajaxRequestConfiguration = {
            url: SERVER_COMMUNICATION_ENDPOINT, // The URL to send the request to.
            type: HTTP_REQUEST_METHOD, // The HTTP method (POST in this case).
            data: {
                [REQUEST_PAYLOAD_ACTION_KEY]: REQUEST_PAYLOAD_ACTION_VALUE // The data payload sent to the server.
            },
            dataType: EXPECTED_SERVER_RESPONSE_FORMAT, // The expected format of the server's response.

            // 3. Callback for successful data retrieval.
            success: function(serverDataResponse) {
                // Ensure the loading indicator is removed regardless of internal success logic.
                jq('#' + LOADING_OVERLAY_ID).remove();

                // Validate the server's primary success indicator. This is a guard clause.
                if (!serverDataResponse || !serverDataResponse.operationStatus) { // Renamed from data.success to operationStatus
                    console.warn("Server response was not structured as expected or indicated failure.", serverDataResponse);
                    // Provide feedback to the user in the table.
                    jq(TABLE_BODY_ELEMENT_SELECTOR).html('<tr><td colspan="4" style="color: #c0392b; text-align: center;">Data retrieval failed. Please try again later.</td></tr>');
                    return; // Exit if the server response is invalid.
                }

                let recordsProcessedCounter = 0; // Initialize a counter for successfully processed records (new fragment).
                const tableBodyTarget = jq(TABLE_BODY_ELEMENT_SELECTOR); // Cache the jQuery object for performance.

                // Iterate through the server response to extract and display individual data entries.
                // Using Object.keys and filter for explicit iteration over numeric-indexed records.
                Object.keys(serverDataResponse).filter(key => jq.isNumeric(key)).forEach(function(numericIndexKey) {
                    const currentRecordItem = serverDataResponse[numericIndexKey]; // Access the record object.

                    // Perform basic validation on the record's structure before processing (new fragment).
                    if (!currentRecordItem || !currentRecordItem.uniqueIdentifier || !currentRecordItem.entityLabel || !currentRecordItem.descriptiveText) {
                        console.warn(`Skipping malformed record at key '${numericIndexKey}'. Missing essential properties.`, currentRecordItem);
                        return; // Skip this item and move to the next.
                    }

                    // Create a new table row element.
                    const newTableRow = jq('<tr>');

                    // Append table cells with data from the current record item using the helper function.
                    // Renamed properties: Id -> uniqueIdentifier, Nombre -> entityLabel, Descripcion -> descriptiveText.
                    generateTableCell(currentRecordItem.uniqueIdentifier).appendTo(newTableRow);
                    generateTableCell(currentRecordItem.entityLabel).appendTo(newTableRow);
                    generateTableCell(currentRecordItem.descriptiveText).appendTo(newTableRow);

                    // Add a new column for an action button (new fragment).
                    generateTableCell(jq('<button />').text('View Details').addClass('btn btn-sm btn-info')).appendTo(newTableRow);

                    // Append the fully constructed row to the table body.
                    newTableRow.appendTo(tableBodyTarget);
                    recordsProcessedCounter++; // Increment the counter.
                });

                console.log(`Finished processing. Successfully added ${recordsProcessedCounter} data entries.`); // Log processed count.

                // 4. Initialize the DataTables plugin for enhanced table functionality.
                const dataPresentationTable = jq(TARGET_DATA_TABLE_SELECTOR);
                // Guard clause: Check if the table exists and if DataTables has not already been initialized on it.
                if (dataPresentationTable.length > 0 && !jq.fn.DataTable.isDataTable(dataPresentationTable)) {
                    dataPresentationTable.DataTable({ // Renamed from dataTable to DataTable (modern API).
                        "jQueryUI": true, // Enable jQuery UI theme integration.
                        "pagingType": "full_numbers", // Use full pagination controls (First, Previous, Next, Last).
                        "lengthMenu": [
                            [10, 25, 50, -1],
                            [10, 25, 50, "All"]
                        ], // Provide options for number of records per page.
                        "responsive": true, // Enable responsive design for tables on smaller screens.
                        "searching": true // Explicitly enable searching functionality.
                    });
                } else {
                    console.warn("The target table for DataTables ('" + TARGET_DATA_TABLE_SELECTOR + "') was not found or already initialized.");
                }
            },

            // 5. Callback for handling AJAX request errors (new fragment).
            error: function(xhrObject, statusText, errorDescription) {
                // Remove the loading indicator on error.
                jq('#' + LOADING_OVERLAY_ID).remove();
                console.error("An error occurred during the AJAX request:", statusText, errorDescription, xhrObject);
                // Display an error message directly in the table body.
                jq(TABLE_BODY_ELEMENT_SELECTOR).html('<tr><td colspan="4" style="color: #e74c3c; text-align: center;">Error: Could not retrieve data. ' + statusText + '</td></tr>');
            },

            // 6. Callback that always executes after the AJAX request completes, regardless of success or failure (new fragment).
            complete: function() {
                // Any final cleanup or status updates can be performed here.
                console.info("Data fetching process concluded.");
            }
        };

        // 7. Execute the AJAX request using the defined configuration.
        jq.ajax(ajaxRequestConfiguration);
    });

})(jQuery); // Pass jQuery as 'jq' to avoid conflicts and improve minification.