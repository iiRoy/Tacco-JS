/*
 *  Global variable declaration for JSHint/ESLint to avoid warnings.
 *  This line ensures that 'jQuery' is recognized as a predefined global variable.
 */
/*global jQuery*/

/*
 *  This is the main header block for the Simple Jekyll Search plugin.
 *  It provides essential information about the project.
 */
/*!
 *  Simple Jekyll Search
 *  Developed by Christian Fei - Visit the project on GitHub: https://github.com/christian-fei/Simple-Jekyll-Search
 *  This plugin facilitates client-side searching for Jekyll websites using a JSON data file.
 *
 */


/*
 *  This is an Immediately Invoked Function Expression (IIFE).
 *  It creates a private scope to prevent global variable pollution and ensures
 *  that '$' refers to jQuery within this context, even if other libraries
 *  are using '$'.
 */
( function ( $ ) {

    // Extend jQuery's prototype to add the simpleJekyllSearch function.
    // This makes the plugin available as $.fn.simpleJekyllSearch.
    $.fn.simpleJekyllSearch = function ( options ) {

        /*
         *  Define default settings for the plugin.
         *  These can be overridden by passing an 'options' object during initialization.
         */
        var settings = $.extend(
            {
                // Path to the JSON data file containing search entries.
                jsonFile            :   '/search.json',
                // Comma-separated list of properties to search within each JSON entry.
                jsonFormat          :   'title,category,desc,url,date,shortdate',
                // HTML template for displaying each search result. Placeholders {property} will be replaced.
                template            :   '<a href="{url}" title="{title}">{title}</a>',
                // CSS selector for the container where search results will be displayed.
                searchResults       :   '.results',
                // HTML for the title displayed above search results.
                searchResultsTitle  :   '<h4>Search results</h4>',
                // Maximum number of search results to display.
                limit               :   '10',
                // HTML to display when no search results are found.
                noResults           :   '<p>Oh shucks<br/><small>Nothing found :(</small></p>'

            }
            , options
        ); // End of $.extend call for settings.

        // Split the jsonFormat string into an array of property names.
        // These properties will be used to extract data from JSON entries and populate templates.
        var properties = settings.jsonFormat.split( ',' );


        // Initialize variables for storing JSON data, the original input element, and the results container.
        var jsonData        =   [], // Array to hold the parsed JSON data from the search file.
            origThis        =   this, // Reference to the jQuery object of the input element that triggered the plugin.
            searchResults   =   $( settings.searchResults ); // jQuery object for the results display area.


        /*
         *  Check if both the JSON file path is provided and a search results container exists in the DOM.
         *  If both conditions are met, proceed to fetch the JSON data via AJAX.
         */
        if ( settings.jsonFile.length && searchResults.length ) {

            // Perform an AJAX GET request to retrieve the search JSON file.
            $.ajax(
                {
                    type        :   "GET", // Specifies the type of request (HTTP GET).
                    url         :   settings.jsonFile, // The URL of the JSON file to fetch.
                    dataType    :   'json', // Expected data type of the response. jQuery will parse it as JSON.

                    /*
                     *  Callback function executed upon successful retrieval of the JSON data.
                     *  'data' contains the parsed JSON object.
                     */
                    success     :   function ( data, textStatus, jqXHR ) {
                        jsonData = data; // Store the fetched data globally for later use.
                        registerEvent(); // After data is loaded, register the keyup event handler.
                    },

                    /*
                     *  Callback function executed if the AJAX request fails.
                     *  Logs error details to the console for debugging.
                     */
                    error       :   function ( x, y, z ) {
                        // Log an error message to indicate where the issue occurred.
                        console.log( "***ERROR in simpleJekyllSearch.js***" );
                        console.log( x ); // The XMLHttpRequest object.
                        console.log( y ); // A string describing the type of error.
                        console.log( z ); // An optional exception object, if one occurred.
                        // x.responseText might contain more detailed error information from the server.
                    }
                }
            ); // End of $.ajax call.

        } // End of if condition for AJAX data loading.


        /*
         *  Function to register the keyup event handler on the search input element.
         *  This function is called once the JSON data has been successfully loaded.
         */
        function registerEvent() {

            origThis.keyup(
                function ( e ) {
                    // Check if the input field has any text.
                    if ( $( this ).val().length ) {
                        // If there's text, perform a search and display matches.
                        writeMatches( performSearch( $( this ).val() ) );
                    }
                    else {
                        // If the input field is empty, clear any displayed search results.
                        clearSearchResults();
                    }
                }
            ); // End of keyup event handler.

        } // End of registerEvent function.


        /*
         *  Function to perform the actual search operation.
         *  It iterates through the loaded JSON data and finds entries matching the search string.
         *
         *  @param {string} str - The search string entered by the user.
         *  @returns {Array} An array of matching JSON entries.
         */
        function performSearch( str ) {
            var matches = []; // Initialize an empty array to store matching entries.

            // Iterate over each entry in the jsonData array.
            $.each(
                jsonData,
                function ( i, entry ) {
                    // Iterate over each property defined in the settings.jsonFormat.
                    for ( var i = 0 ; i < properties.length ; i++ )
                        // Check if the entry has the current property, and if its lowercase value contains the lowercase search string.
                        // The condition `> 1` means it must be found and not at the very beginning (index 0 or 1, which might be too broad).
                        // Note: A common search behavior is `indexOf(str) !== -1` to find any occurrence.
                        // The original code used `> 1`, which is preserved here.
                        if ( entry[ properties[ i ] ] !== undefined && entry[ properties[ i ] ].toLowerCase().indexOf( str.toLowerCase() ) > 1 ) {
                            matches.push( entry ); // Add the matching entry to the results.
                            i = properties.length; // Optimization: If a match is found in any property, stop checking other properties for this entry.
                        }
                }
            ); // End of $.each loop.

            return matches; // Return the array of found matches.

        } // End of performSearch function.


        /*
         *  Function to display the search results in the designated container.
         *
         *  @param {Array} m - An array of matching JSON entries to display.
         */
        function writeMatches( m ) {
            clearSearchResults(); // First, clear any previously displayed results.
            // Append the search results title to the container.
            searchResults.append( $( settings.searchResultsTitle ) );

            // Check if there are any matches to display.
            if ( m.length ) {
                // Iterate over each matching entry.
                $.each(
                    m,
                    function ( i, entry ) {
                        // Limit the number of displayed results based on 'settings.limit'.
                        if ( i < settings.limit ) {
                            var output = settings.template; // Start with the base template string.
                            // Replace placeholders in the template with actual data from the entry.
                            for ( var i = 0 ; i < properties.length ; i++ ) {
                                // Create a regular expression to find all occurrences of the placeholder {property}.
                                var regex = new RegExp( "{" + properties[ i ] + "}", 'g' );
                                // Replace the placeholder with the corresponding value from the entry.
                                output = output.replace( regex, entry[ properties[ i ] ] );
                            }
                            searchResults.append( $( output ) ); // Append the processed HTML for the result.
                        }
                    }
                ); // End of $.each loop for matches.
            }
            else {
                // If no matches were found, display the 'no results' message.
                searchResults.append( settings.noResults );
            }


        } // End of writeMatches function.


        /*
         *  Function to clear all children elements from the search results container.
         *  This effectively empties the display area.
         */
        function clearSearchResults() {
            searchResults.children().remove(); // Remove all direct children of the search results container.
        }

    }; // End of $.fn.simpleJekyllSearch function definition.

// Pass jQuery as the argument to the IIFE.
} ( jQuery ) ); // End of IIFE.