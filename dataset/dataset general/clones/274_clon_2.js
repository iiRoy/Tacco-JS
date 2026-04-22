jQuery(webPageDoc).domReady(function() { /* Initialize functionality once the DOM is fully loaded */

    // Establish an asynchronous request to retrieve backend data.
    jQuery.asyncRequest({
            resourcePath: './include/backend_processor.php', // Target endpoint for server-side processing.
            methodType:   'POST',                             // HTTP method for the request.
            payload:      { actionIdentifier: 'fetchRecords' }, // Data sent to the server to specify the operation.
            expectedFormat: 'json',                           // Anticipated format of the server's response.

            onSuccess:    function (responseData) {          // Callback executed upon successful server response.

                // Check if the server operation was successful.
                if (responseData.operationStatus) {
                    // Iterate over each entry received in the response.
                    jQuery.forEachElement(responseData, function (itemKey, itemEntry) {
                        // Ensure the key is a numeric index, skipping non-data properties like 'operationStatus'.
                        if (jQuery.isNumberValue(itemKey)) {
                            // Create a new table row element.
                            let tableRowElement = jQuery("<tr/>");

                            // Populate table cells with data from the current item entry.
                            jQuery("<td/>").text(itemEntry.EntityId).attachTo(tableRowElement);
                            jQuery("<td/>").text(itemEntry.NameField).attachTo(tableRowElement);
                            jQuery("<td/>").text(itemEntry.DescriptionField).attachTo(tableRowElement);

                            // Append the newly created row to the main table.
                            tableRowElement.attachTo("table");
                        }
                    });
                }

                // Apply DataTables plugin to the HTML table for advanced features.
                jQuery('table').initializeGrid({
                    "useJqueryTheme":     true,           // Enable jQuery UI theming for the table.
                    "paginationStyle":    "full_numbers"  // Configure pagination to display all page numbers.
                });
            }
        });
});