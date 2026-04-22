/*global DomUtil */
/*!
 * Document Search Plugin for Jekyll Sites
 * Based on Simple Jekyll Search by Christian Fei - https://github.com/christian-fei/Simple-Jekyll-Search
 *
 * This version includes structural modifications, identifier renames,
 * updated error handling, and performance enhancements.
 *
 */

(function(DomUtil) {

    // Ensure DomUtil (jQuery) is available
    if (typeof DomUtil === 'undefined' || !DomUtil.fn) {
        console.error("DomUtil (jQuery) is required for documentSearchPlugin to function.");
        return;
    }

    DomUtil.fn.documentSearchPlugin = function(pluginConfig) {

        // Default configuration for the search component
        var defaultSettings = {
            dataSourcePath:      '/search.json',             // Path to the JSON data file
            dataKeys:            'title,category,desc,url,date,shortdate', // Comma-separated list of keys to search within
            resultItemTemplate:  '<a href="{url}" title="{title}">{title}</a>', // HTML template for each search result
            outputContainerSelector: '.results',             // Selector for the element where results will be displayed
            outputHeadingHtml:   '<h4>Search Results</h4>',  // HTML for the heading above results
            maxResultsToShow:    '10',                       // Maximum number of results to display
            emptyResultsMessage: '<p>Sorry, no items matched your query.<br/><small>Please try a different term.</small></p>', // Message when no results are found
            debounceDelay:       200                         // Milliseconds to wait before performing search after keyup
        };

        // Merge user configuration with defaults
        var currentConfig = DomUtil.extend({}, defaultSettings, pluginConfig);

        // Parse the data keys into an array for easier iteration
        var searchableFields = currentConfig.dataKeys.split(',');

        // Variables to hold fetched data, the input element, and the output container
        var cachedData = [];
        var inputElement = this; // The jQuery object representing the input field
        var outputElement = DomUtil(currentConfig.outputContainerSelector); // The jQuery object for the results display area

        // Flag to indicate if data has been loaded
        var isDataLoaded = false;
        // Timer for debouncing the search input
        var searchTimer = null;

        // --- Initialization Logic ---
        // Check if the input element and output container exist
        if (!inputElement.length) {
            console.warn("documentSearchPlugin: Input element not found. Please check your selector.");
            return;
        }
        if (!outputElement.length) {
            console.warn("documentSearchPlugin: Output container not found. Please check 'outputContainerSelector'.");
            return;
        }

        // Fetch JSON data if dataSourcePath is provided
        if (currentConfig.dataSourcePath.length) {
            fetchSearchData();
        } else {
            console.warn("documentSearchPlugin: No 'dataSourcePath' provided. Search functionality will be limited.");
        }

        /**
         * Fetches the JSON data from the specified path.
         */
        function fetchSearchData() {
            DomUtil.ajax({
                type: "GET",
                url: currentConfig.dataSourcePath,
                dataType: 'json',
                success: function(fetchedData) {
                    cachedData = fetchedData;
                    isDataLoaded = true;
                    bindInputEvent(); // Bind event listener only after data is ready
                },
                error: function(errorRequest, errorStatus, errorThrown) {
                    console.error("documentSearchPlugin: Failed to load search data from " + currentConfig.dataSourcePath);
                    console.error("Error details:", errorRequest, errorStatus, errorThrown);
                    // Optionally display an error message to the user
                    outputElement.html('<p class="search-error">Failed to load search data. Please try again later.</p>');
                }
            });
        }

        /**
         * Binds the keyup event to the input element, with debouncing.
         */
        function bindInputEvent() {
            inputElement.on('keyup', function(eventObject) {
                clearTimeout(searchTimer); // Clear any previous timer
                searchTimer = setTimeout(function() {
                    var currentInputValue = DomUtil(eventObject.target).val();
                    if (currentInputValue.length > 0) {
                        displayMatches( executeSearch(currentInputValue) );
                    } else {
                        clearDisplayedResults();
                    }
                }, currentConfig.debounceDelay);
            });
        }

        /**
         * Performs the search operation on the cached data.
         * @param {string} searchTerm - The string to search for.
         * @returns {Array} An array of matching data entries.
         */
        function executeSearch(searchTerm) {
            var foundEntries = [];
            if (!isDataLoaded || !searchTerm) {
                return foundEntries;
            }

            var lowerCaseSearchTerm = searchTerm.toLowerCase();

            // Iterate over each item in the cached data
            DomUtil.each(cachedData, function(itemIndex, currentItem) {
                var itemMatched = false; // Flag to stop checking fields for current item once a match is found

                // Iterate over each searchable field for the current item
                for (var keyIndex = 0; keyIndex < searchableFields.length; keyIndex++) {
                    var searchKey = searchableFields[keyIndex];
                    var fieldValue = currentItem[searchKey];

                    // Ensure field value exists and is a string before attempting search
                    if (typeof fieldValue === 'string') {
                        if (fieldValue.toLowerCase().indexOf(lowerCaseSearchTerm) !== -1) {
                            foundEntries.push(currentItem);
                            itemMatched = true; // Mark as matched and move to the next data item
                            break; // Exit the inner loop (searchable fields)
                        }
                    }
                }
            });
            return foundEntries;
        }

        /**
         * Renders and displays the search results in the output container.
         * @param {Array} matchedItems - An array of data entries that matched the search term.
         */
        function displayMatches(matchedItems) {
            clearDisplayedResults(); // Always clear previous results first

            // Append the heading if there are results
            if (matchedItems.length > 0) {
                outputElement.append( DomUtil(currentConfig.outputHeadingHtml) );
            }

            if (matchedItems.length > 0) {
                // Iterate through matched items and render them
                DomUtil.each(matchedItems, function(idx, currentItem) {
                    // Only display up to the configured limit
                    if (idx < parseInt(currentConfig.maxResultsToShow, 10)) {
                        var renderedHtml = currentConfig.resultItemTemplate;

                        // Replace placeholders in the template with actual data
                        for (var keyIdx = 0; keyIdx < searchableFields.length; keyIdx++) {
                            var fieldName = searchableFields[keyIdx];
                            var placeholderRegex = new RegExp("\{" + fieldName + "\}", 'g');
                            var fieldValue = currentItem[fieldName] || ''; // Use empty string for undefined fields
                            renderedHtml = renderedHtml.replace(placeholderRegex, fieldValue);
                        }
                        outputElement.append(DomUtil(renderedHtml));
                    }
                });
            } else {
                // Display the "no results" message
                outputElement.append( currentConfig.emptyResultsMessage );
            }
        }

        /**
         * Clears all previously displayed search results from the output container.
         */
        function clearDisplayedResults() {
            outputElement.empty(); // More concise than .children().remove()
        }
    };

}(jQuery)); // Pass jQuery as DomUtil