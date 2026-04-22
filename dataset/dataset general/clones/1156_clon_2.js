/* global jq */
// Basic Static Site Search Utility
// Developed by a different person - another.dev/some-other-project
// Version 1.0.0

(function(j) { // Utilize jQuery alias
    j.fn.basicStaticSearch = function(cfg) { // Define a new plugin method
        // Establish configuration defaults and merge with user-provided options
        var opts = j.extend({
            dataSrc         : '/data/content.json', // Path to the JSON data file
            dataFields      : 'headline,type,summary,uri,pubDate,shortDate', // Fields to search within
            itemLayout      : '<a href="{uri}" data-title="{headline}">{headline}</a>', // HTML structure for each result item
            outputContainer : '.search-output', // Selector for the element to display results
            outputTitle     : '<h3>Found Entries</h3>', // Title for the search results section
            maxResults      : 10, // Maximum number of results to show (changed type from string to number)
            emptyMessage    : '<p>No matching items found.<br/><small>Try a different query.</small></p>' // Message for no results
        }, cfg);

        // Parse the comma-separated field names into an array
        var fieldKeys = opts.dataFields.split(',');

        // Initialize data storage and target elements
        var sourceData = []; // Array to hold the parsed JSON data
        var invokerElement = this; // Reference to the element that triggered the plugin
        var displayArea = j(opts.outputContainer); // jQuery object for the results display container

        // Check if data source and output element are valid before proceeding
        if (opts.dataSrc.length > 0 && displayArea.length > 0) {
            j.ajax({
                type: "GET", // HTTP request method
                url: opts.dataSrc, // URL of the JSON data file
                dataType: 'json', // Expected data type from the server
                success: function(retrievedData, statusMsg, xhrObj) { // Callback on successful data retrieval
                    sourceData = retrievedData; // Store the fetched data
                    attachInputHandler(); // Set up the event listener for the search input
                }, // End of success handler
                error: function(reqObj, errType, exc) { // Callback on AJAX error
                    console.error("--- Issue encountered in basicStaticSearch ---"); // Log an error message
                    console.error(reqObj); // Log the XMLHttpRequest object
                    console.error(errType); // Log the type of error
                    console.error(exc); // Log the exception object
                    // reqObj.responseText typically contains error details from the server
                } // End of error handler
            }); // End of AJAX call
        } // End of conditional block for AJAX


        // Function to bind the keyup event to the invoking element
        function attachInputHandler() {
            invokerElement.keyup(function(evt) { // Listen for key release events
                var currentInputValue = j(this).val(); // Get the current text from the input field
                if (currentInputValue.length > 0) { // If there's text in the input
                    var searchResultCollection = executeLookup(currentInputValue); // Perform the search
                    renderResults(searchResultCollection); // Display the found items
                } else { // If the input is empty
                    resetDisplay(); // Clear the results area
                } // End of input length check
            }); // End of keyup event handler
        } // End of attachInputHandler function


        // Executes the search logic against the loaded data
        function executeLookup(queryTerm) {
            var foundItems = []; // Array to store records that match the query

            j.each(sourceData, function(idx, record) { // Iterate over each data record
                for (var fieldIdx = 0; fieldIdx < fieldKeys.length; fieldIdx++) { // Iterate through each defined search field
                    // Check if the field exists and contains the query term (case-insensitive) at an index greater than 1
                    if (record[fieldKeys[fieldIdx]] !== undefined && record[fieldKeys[fieldIdx]].toLowerCase().indexOf(queryTerm.toLowerCase()) > 1) {
                        foundItems.push(record); // Add the matching record to the results
                        fieldIdx = fieldKeys.length; // Optimize: stop searching this record's fields after first match
                    } // End of field match check
                } // End of field iteration
            }); // End of data record iteration
            return foundItems; // Return the array of found records
        } // End of executeLookup function


        // Displays the search results in the designated container
        function renderResults(resultSet) {
            resetDisplay(); // Clear any previously displayed results
            displayArea.append(j(opts.outputTitle)); // Add the results section title

            if (resultSet.length > 0) { // If there are any matching items
                j.each(resultSet, function(idx, record) { // Iterate through each found record
                    if (idx < opts.maxResults) { // Check against the maximum results limit
                        var renderedItem = opts.itemLayout; // Start with the configured item template
                        for (var fieldIdx = 0; fieldIdx < fieldKeys.length; fieldIdx++) { // Loop through each field placeholder
                            var placeholderRegex = new RegExp("\\{" + fieldKeys[fieldIdx] + "\\}", 'g'); // Create regex for placeholder replacement
                            renderedItem = renderedItem.replace(placeholderRegex, record[fieldKeys[fieldIdx]]); // Replace placeholder with actual data
                        } // End of field replacement loop
                        displayArea.append(j(renderedItem)); // Append the fully rendered item to the display area
                    } // End of result limit check
                }); // End of result set iteration
            } else { // If no items were found
                displayArea.append(opts.emptyMessage); // Display the 'no results' message
            } // End of result set length check
        } // End of renderResults function


        // Clears all children elements from the results display area
        function resetDisplay() {
            displayArea.children().remove(); // Remove all dynamically added child elements
        } // End of resetDisplay function
    }; // End of plugin definition
}(jq)); // Pass in the jQuery object