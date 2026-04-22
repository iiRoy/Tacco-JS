(function ( jQueryAlias ) {
    'use strict'; // Enforce stricter parsing and error handling.

    /**
     * Initializes a jQuery element as a data-driven HTML table.
     * This function sets up the table structure (thead, tbody) and column headers.
     * @param {object} initialOptions - Configuration options for the table component.
     * @param {Array<string>} initialOptions.headerLabels - An array of strings for column headers.
     * @param {Array<string>} initialOptions.fieldMappings - An array defining how data fields map to columns.
     *                                                        Use '*' to represent the row index (1-based).
     * @returns {jQuery} The jQuery object representing the initialized table for method chaining.
     */
    jQueryAlias.fn.dataDisplayTable = function( initialOptions ) {
        // Define a set of robust default settings for the table component.
        const componentDefaultSettings = {
            headerLabels: [],   // Default to an empty array if no headers are specified.
            fieldMappings: []   // Default to an empty array for data field mapping.
        };

        // Merge user-provided options with our defaults. The target jQuery element
        // itself is also integrated into the configuration for persistent access.
        let componentConfiguration = jQueryAlias.extend(
            true, // Perform a deep merge
            {},   // Start with a new, empty object to avoid modifying defaults directly.
            componentDefaultSettings,
            initialOptions,
            { targetContainer: this } // Store a direct reference to the jQuery object for this table.
        );

        const currentTableElement = this; // Cache the jQuery object for efficiency within this function.

        // Persist the merged configuration directly onto the table element using jQuery's data API.
        // This allows subsequent plugin calls (e.g., updates) to retrieve these settings.
        currentTableElement.data("componentConfig", componentConfiguration);

        // --- Core Table Structure Verification and Creation ---

        // Verify or create the table header (<thead>) section.
        let tableHeaderSection = currentTableElement.children("thead");
        if (tableHeaderSection.length === 0) {
            tableHeaderSection = jQueryAlias('<thead>'); // Construct a new <thead> element.
            currentTableElement.append(tableHeaderSection); // Attach it to the main table element.
            console.info("dataDisplayTable: Created missing <thead> section.");
        }

        // Verify or create the header row (<tr>) within the <thead>.
        let headerRowElement = tableHeaderSection.children("tr");
        if (headerRowElement.length === 0) {
            headerRowElement = jQueryAlias('<tr>'); // Construct a new <tr> for headers.
            tableHeaderSection.append(headerRowElement); // Attach it to the <thead>.
            console.info("dataDisplayTable: Created missing <tr> within <thead>.");
        } else {
            // If header rows already exist, we'll use the first one and clear its content
            // to prevent duplicate headers on re-initialization.
            if (headerRowElement.length > 1) {
                console.warn("dataDisplayTable: Multiple <tr> elements found in <thead>. Using the first one.");
            }
            headerRowElement = headerRowElement.first();
            headerRowElement.empty(); // Clear any existing <th> elements.
        }

        // Verify or create the table body (<tbody>) section.
        let tableBodySection = currentTableElement.children("tbody");
        if (tableBodySection.length === 0) {
            tableBodySection = jQueryAlias('<tbody>'); // Construct a new <tbody> element.
            currentTableElement.append(tableBodySection); // Attach it to the main table element.
            console.info("dataDisplayTable: Created missing <tbody> section.");
        }

        // --- Populate Table Headers Based on Configuration ---

        // Implement a guard clause: Check if header labels are provided and not empty.
        const definedHeaderLabels = componentConfiguration.headerLabels;
        if (!Array.isArray(definedHeaderLabels) || definedHeaderLabels.length === 0) {
            console.warn("dataDisplayTable: No header labels were provided in the configuration. The table header might appear empty.");
        } else {
            // Iterate over the configured header labels to create and append <th> elements.
            definedHeaderLabels.forEach((labelContent, headerIndex) => {
                // Create a new <th> element, set its text content, and add a data attribute for identification.
                const headerCell = jQueryAlias('<th>')
                    .text(String(labelContent)) // Ensure content is always a string.
                    .attr('data-header-idx', headerIndex); // Add an index for potential styling or scripting.
                headerRowElement.append(headerCell); // Add the newly created header cell to the header row.
            });
        }
        
        // Output the final configuration to the console for debugging purposes.
        console.debug("dataDisplayTable: Initialization complete with configuration:", componentConfiguration);

        // Return the jQuery object to maintain chainability.
        return currentTableElement;
    };

    /**
     * Updates the content of an initialized dataDisplayTable with new data.
     * This function supports fetching data from a URL (via AJAX) or using a direct JavaScript object.
     * @param {object} updateParameters - Options specific to this update operation.
     * @param {string|object} updateParameters.dataSource - The URL to fetch data from (string) or the data object itself.
     * @param {string} [updateParameters.rowCssClass] - An optional CSS class string to apply to each generated table row.
     * @param {Function} [updateParameters.onCompletion] - An optional callback function to execute after data rendering is complete.
     * @returns {jQuery} The jQuery object representing the updated table for method chaining.
     */
    jQueryAlias.fn.refreshDataTableContent = function( updateParameters ){
        // Define default options for the data refresh operation.
        const refreshDefaults = {
            dataSource: null,       // No default data source.
            rowCssClass: '',        // Default to an empty string for row classes.
            onCompletion: null      // No default completion callback.
        };

        // Merge user-provided update parameters with our defaults.
        const effectiveRefreshConfig = jQueryAlias.extend({}, refreshDefaults, updateParameters);

        // Retrieve the component's main configuration that was stored during its initialization.
        const currentComponentConfig = this.data("componentConfig");

        // Guard clause: Crucial check to ensure the table was properly initialized before attempting an update.
        if (!currentComponentConfig) {
            console.error("refreshDataTableContent: Error! Table component not initialized. Call .dataDisplayTable() first.");
            return this; // Return the original jQuery object to prevent further errors.
        }

        // Validate and process the data source.
        const incomingDataSource = effectiveRefreshConfig.dataSource;

        if (typeof incomingDataSource === "string" && incomingDataSource.trim().length > 0) {
            // If the source is a non-empty string, interpret it as a URL for an AJAX GET request.
            console.log(`refreshDataTableContent: Fetching data from URL: ${incomingDataSource}`);
            jQueryAlias.ajax({
                url: incomingDataSource,
                type: 'GET',
                dataType: 'json', // Explicitly expect JSON data from the server.
                success: (retrievedPayload) => {
                    // Upon successful data retrieval, proceed to populate the table rows.
                    jQueryAlias.fn.populateTableRows(
                        retrievedPayload,
                        currentComponentConfig,
                        effectiveRefreshConfig.rowCssClass,
                        effectiveRefreshConfig.onCompletion
                    );
                },
                error: (xhr, textStatus, errorThrown) => {
                    // Log detailed error information if the AJAX request fails.
                    console.error(`refreshDataTableContent: AJAX data fetch failed: ${textStatus}, ${errorThrown}.`, xhr);
                    // Optionally, invoke the completion callback even on error, passing an error object.
                    if (typeof effectiveRefreshConfig.onCompletion === 'function') {
                        effectiveRefreshConfig.onCompletion(new Error(`Data retrieval failed: ${textStatus}`));
                    }
                }
            });
        } else if (incomingDataSource !== null && typeof incomingDataSource === "object") {
            // If the source is a non-null object, treat it as direct data to be rendered.
            console.log("refreshDataTableContent: Using directly provided object as data source.");
            jQueryAlias.fn.populateTableRows(
                incomingDataSource,
                currentComponentConfig,
                effectiveRefreshConfig.rowCssClass,
                effectiveRefreshConfig.onCompletion
            );
        } else {
            // Log a warning if no valid data source is provided.
            console.warn("refreshDataTableContent: No valid data source provided for table update. Table content will not be refreshed.");
            // Even if no update occurs, trigger the completion callback if it exists.
            if (typeof effectiveRefreshConfig.onCompletion === 'function') {
                effectiveRefreshConfig.onCompletion();
            }
        }
        
        // Return the jQuery object for method chaining.
        return this;
    };

    /**
     * Internal helper function to populate the table's tbody with data from a JavaScript object array.
     * This function is typically invoked by `refreshDataTableContent`.
     * @param {Array<object>} sourceDataArray - The array of data objects, where each object represents a row.
     * @param {object} currentSettings - The full configuration object for the table component.
     * @param {string} [appliedRowClassName] - An optional CSS class to apply to each generated row.
     * @param {Function} [finalCallback] - An optional function to execute once all rows are rendered.
     */
    jQueryAlias.fn.populateTableRows = function( sourceDataArray, currentSettings, appliedRowClassName, finalCallback ){
        // Retrieve the table body section from the stored configuration.
        const tableBodyTarget = currentSettings.targetContainer.children("tbody");
        
        // Guard clause: Ensure the table body element exists before attempting to manipulate it.
        if (!tableBodyTarget || tableBodyTarget.length === 0) {
            console.error("populateTableRows: Error! Target <tbody> not found in component configuration. Cannot populate rows.");
            // Execute the callback even on error, potentially passing an error object.
            if (typeof finalCallback === "function") {
                finalCallback(new Error("Target <tbody> element is missing."));
            }
            return;
        }

        // Clear all existing rows from the table body to prepare for new data.
        tableBodyTarget.empty();
        console.log("populateTableRows: Cleared existing table body content in preparation for new data.");

        // Guard clause: Check if the provided data is a valid array and not empty.
        if (!Array.isArray(sourceDataArray) || sourceDataArray.length === 0) {
            console.info("populateTableRows: No data array provided or the data array is empty. The table body will remain empty.");
            if (typeof finalCallback === "function") {
                finalCallback(); // Still invoke callback even if no data was processed.
            }
            return;
        }

        // Ensure field mappings are defined in the configuration.
        const dataFieldMappings = currentSettings.fieldMappings;
        if (!Array.isArray(dataFieldMappings) || dataFieldMappings.length === 0) {
            console.warn("populateTableRows: No field mappings defined in the component configuration. Rows might be empty or incorrectly populated.");
            // We'll proceed, but the rows might not contain meaningful data.
        }

        // Iterate over each data item (record) in the input array to create a new table row.
        sourceDataArray.forEach((recordEntry, rowIndex) => {
            // Create a new table row element (<tr>) and apply the optional CSS class.
            const newTableRowElement = jQueryAlias('<tr>')
                .addClass(appliedRowClassName || '') // Ensure a string is always passed to addClass.
                .attr('data-row-idx', rowIndex);     // Add a data attribute for easier row identification.

            // Iterate over each field mapping to generate table cells (<td>) for the current row.
            dataFieldMappings.forEach((columnIdentifier, columnIndex) => {
                let cellValue = ''; // Default empty content for the cell.

                if (columnIdentifier === '*') {
                    // Special case: If the mapping is '*', display the 1-based row index.
                    cellValue = rowIndex + 1;
                } else if (recordEntry && typeof recordEntry === 'object' && Object.prototype.hasOwnProperty.call(recordEntry, columnIdentifier)) {
                    // If the data item is an object and contains the specified column identifier, use its value.
                    cellValue = recordEntry[columnIdentifier];
                } else {
                    // If the column identifier is not found or dataItem is not an object, content remains empty.
                    console.debug(`populateTableRows: Column key '${columnIdentifier}' not found for record index ${rowIndex}.`);
                }
                
                // Create the table data cell (<td>), set its text content, and add data attributes.
                const tableDataCell = jQueryAlias('<td>')
                    .text(String(cellValue || '')) // Ensure content is always a string, handling null/undefined values.
                    .attr('data-column-key', columnIdentifier)
                    .attr('data-column-idx', columnIndex);
                newTableRowElement.append(tableDataCell); // Add the cell to the current table row.
            });
            
            // Append the fully constructed row to the table body.
            tableBodyTarget.append(newTableRowElement);
        });

        // After all rows have been rendered, execute the final callback function if it was provided.
        if (typeof finalCallback === "function") {
            try {
                console.log("populateTableRows: Executing completion callback for table update.");
                finalCallback();
            } catch (e) {
                console.error("populateTableRows: Error encountered during completion callback execution:", e);
            }
        }
        
        // Trigger a global window resize event. This can be beneficial for other components
        // (e.g., responsive layouts, scrollbar plugins) that need to re-evaluate dimensions
        // after the table's content has changed. A small delay ensures DOM updates are complete.
        setTimeout(() => {
            jQueryAlias(window).trigger('resize');
            console.debug("populateTableRows: Triggered window resize event after table population.");
        }, 50); // A short delay of 50 milliseconds.
    };
 
}( jQuery ));