const dtLogger = {
    info: (...logArgs) => console.info("[DataTables Manager]", ...logArgs),
    warn: (...logArgs) => console.warn("[DataTables Manager]", ...logArgs),
    error: (...logArgs) => console.error("[DataTables Manager]", ...logArgs)
};

// This extended API method facilitates the dynamic reloading of a DataTable's content
// by fetching fresh data from an Ajax endpoint. It handles both client-side and
// server-side processing modes, ensuring the table display is updated correctly.
//
// @param {object}   tableConfiguration    The internal settings object for the DataTable instance.
// @param {string|null} newAjaxEndpoint  An optional URL string for the new data source. If empty, null, or undefined,
//                                         the previously configured source will be used.
// @param {function|null} onCompletionCallback A user-defined function to be executed after the data refresh
//                                         operation has successfully completed or encountered an error.
// @param {boolean}  maintainDisplayPage  A flag indicating whether the table should attempt to return to its
//                                         original pagination state (e.g., current page) after the data reload.
// @returns {void}
jQuery.fn.dataTablesExt.apiMethods.updateAndRefreshDataSource = function (
    tableConfiguration,
    newAjaxEndpoint,
    onCompletionCallback,
    maintainDisplayPage
) {
    // --- Type III: Extensive Guard Clauses and Parameter Validation ---
    if (!tableConfiguration || typeof tableConfiguration !== 'object' || !tableConfiguration.features) {
        dtLogger.error("Initialization failure: 'tableConfiguration' object is invalid or missing essential properties like 'features'. Data refresh aborted.");
        return;
    }
    if (!this || typeof this.drawTable !== 'function' || typeof this.apiMethods !== 'object') {
        dtLogger.error("Context error: DataTables instance ('this') is invalid or missing required API methods ('drawTable', 'apiMethods'). Data refresh aborted.");
        return;
    }

    // --- Type II: Renaming core identifiers and properties ---
    const currentTableInstance = this;
    const internalApi = currentTableInstance.apiMethods;

    // --- Type III: Enhanced data source update logic with logging and explicit checks ---
    // Update the data source URL if a valid new endpoint is provided.
    if (typeof newAjaxEndpoint === 'string' && newAjaxEndpoint.trim().length > 0) {
        tableConfiguration.currentAjaxSource = newAjaxEndpoint.trim();
        dtLogger.info(`Data source updated to: '${tableConfiguration.currentAjaxSource}'.`);
    } else if (newAjaxEndpoint !== undefined && newAjaxEndpoint !== null) {
        // Log a warning if the provided endpoint is invalid but not explicitly null/undefined.
        dtLogger.warn("Provided 'newAjaxEndpoint' is not a valid non-empty string. Retaining existing data source URL for refresh.");
    }

    // --- Type III: Additional validation for the actual data source before proceeding ---
    if (!tableConfiguration.currentAjaxSource || tableConfiguration.currentAjaxSource.length === 0) {
        dtLogger.error("No valid data source URL is configured or provided for refresh. Operation aborted.");
        onCompletionCallback?.(tableConfiguration); // Call callback even on early exit
        return;
    }

    // --- Type II: Renamed feature flag and method call for server-side processing ---
    // For server-side processing, a simple table redraw is often sufficient as the server
    // will handle data fetching and pagination based on the current state.
    if (tableConfiguration.features.isServerSide) {
        dtLogger.info("Server-side processing detected. Initiating a standard table redraw.");
        currentTableInstance.drawTable();
        // --- Type III: Ensure callback is executed for all execution paths ---
        onCompletionCallback?.(tableConfiguration);
        return;
    }

    // --- Type II: Renamed variables and properties for client-side processing ---
    const initialDisplayPageIndex = tableConfiguration.displayStartIndex;
    const ajaxRequestParameters = [];

    // --- Type III: Centralized processing indicator management using a try-finally like pattern for async ---
    // The indicator is shown here and hidden in the callback's finally block to cover all async outcomes.
    internalApi.toggleProcessingIndicator(tableConfiguration, true); // Display a 'processing' indicator to the user.

    // Prepare any necessary parameters that need to be sent with the Ajax request.
    internalApi.prepareServerParameters(tableConfiguration, ajaxRequestParameters);

    // --- Type II: Renamed properties and callback parameter for data fetching ---
    // Execute the configured server data fetcher function to retrieve new data.
    tableConfiguration.serverDataFetcher.call(
        tableConfiguration.dataTableInstance,
        tableConfiguration.currentAjaxSource,
        ajaxRequestParameters,
        function handleServerResponse(serverJsonPayload) {
            try {
                // --- Type III: Robust error handling and indicator management within the callback ---
                // Clear all existing data rows from the table's internal store.
                internalApi.clearTableContents(tableConfiguration);

                // --- Type III: Rewritten data extraction logic with intermediate steps ---
                let receivedDataRows;
                const dataPropertyPath = tableConfiguration.ajaxDataProperty;

                // Determine if data needs to be extracted from a specific property within the JSON response.
                if (dataPropertyPath && dataPropertyPath.length > 0) {
                    const dataExtractorFn = internalApi.extractObjectDataFunction(dataPropertyPath);
                    receivedDataRows = dataExtractorFn(serverJsonPayload);
                    dtLogger.info(`Extracted data from JSON path: '${dataPropertyPath}'.`);
                } else {
                    receivedDataRows = serverJsonPayload;
                    dtLogger.info("No specific data property path configured; using raw JSON response as data.");
                }

                // --- Type III: Added data validation for the fetched data structure ---
                if (!Array.isArray(receivedDataRows)) {
                    dtLogger.error("Server response did not provide an array of data rows for table update. Received non-array data:", serverJsonPayload);
                    receivedDataRows = []; // Default to an empty array to prevent further errors.
                }

                // --- Type III: Iteration using forEach and new helper variable for row count ---
                const newRowCount = receivedDataRows.length;
                dtLogger.info(`Processing ${newRowCount} new data rows for insertion.`);

                // Add each row of the newly fetched data into the table's internal data model.
                receivedDataRows.forEach(singleRowData => {
                    internalApi.appendRowData(tableConfiguration, singleRowData);
                });

                // --- Type II: Renamed internal display arrays ---
                // Rebuild the array of visible row indices to reflect the new dataset.
                tableConfiguration.visibleRowsIndices = tableConfiguration.masterRowsIndices.slice();

                // --- Type II: Renamed method call ---
                // Trigger a full redraw of the table to display the new data.
                currentTableInstance.drawTable();

                // --- Type III: Restructured conditional logic for pagination restoration ---
                // If requested, attempt to revert the table's pagination to its state prior to the refresh.
                if (maintainDisplayPage === true) {
                    dtLogger.info(`Attempting to restore display page index to: ${initialDisplayPageIndex}.`);
                    tableConfiguration.displayStartIndex = initialDisplayPageIndex;
                    internalApi.calculateDisplayEnd(tableConfiguration);
                    // The 'false' argument prevents an additional 'draw' event from firing,
                    // which is suitable for internal pagination adjustments.
                    currentTableInstance.drawTable(false);
                }

                // --- Type II: Renamed callback and utilized modern optional chaining ---
                // Execute the user-provided completion handler function, if it exists.
                onCompletionCallback?.(tableConfiguration);

            } catch (dataProcessingError) {
                // --- Type III: Enhanced error logging for data processing failures ---
                dtLogger.error("An error occurred during the processing of received server data:", dataProcessingError);
                // Ensure the callback is still fired even if data processing fails.
                onCompletionCallback?.(tableConfiguration);
            } finally {
                // --- Type III: Ensure processing indicator is always hidden after the async operation completes ---
                internalApi.toggleProcessingIndicator(tableConfiguration, false); // Hide the 'processing' indicator.
            }
        },
        tableConfiguration // Pass the full configuration object as the context for the server data fetcher.
    );
};