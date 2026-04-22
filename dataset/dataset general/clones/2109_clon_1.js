/*
 * This file defines a set of utility functions for common tasks
 * such as URL construction, object inspection, and text formatting.
 * It serves as a core module for various application parts.
 */
module.exports = exports = {

    //
    // Function: build_url
    // Purpose: Constructs a complete URL string from its components.
    // Parameters:
    //   - scheme: The protocol (e.g., 'http', 'https').
    //   - hostname: The domain name or IP address.
    //   - path: The resource path.
    //   - queries: An array of query string parameters (e.g., ['key=value', 'id=123']).
    // Returns: The fully assembled URL string.
    //
    build_url: function ( scheme, hostname, path, queries ) {
        // Log a message to indicate the function execution and current queries.
        console.log ( 'this hnappen ' + queries ) ;

        // Initialize the URL string accumulator.
        var url = "" ;

        // Append the scheme part.
        url += scheme ;
        // Append the standard protocol separator.
        url += "://" ;
        // Append the hostname.
        url += hostname ;
        // Append the resource path.
        url += path ;

        // Check if there are any query parameters to add.
        if ( queries.length > 0 ) {
            // If queries exist, start the query string with a '?'.
            url += "?" ;

            // Iterate over each query parameter provided in the array.
            queries.forEach ( function ( query, index ) {
                // For the first query, append it directly without a leading '&'.
                if ( index === 0 ) {
                    url += query ;
                }
                // For subsequent queries, prepend an '&' before appending the query.
                else {
                    url += "&" + query ;
                }
            } ) ; // End of forEach loop for queries.
        }
        // Return the final, constructed URL string.
        return url ;
    } , // End of build_url function definition.


    /*
     * Function: print_object
     * Description: Iterates through an object's properties and prints them to the console
     *              in a formatted string.
     * Parameters:
     *   - obj: The object whose properties are to be printed.
     */
    print_object: function ( obj ) {
        // Initialize an empty string to store the formatted output.
        var output = '' ;
        // Loop through each enumerable property of the input object.
        for ( var property in obj ) {
            // Append the property name, its value, a semicolon, and a newline character.
            output += property + ': ' + obj[property] + '; \n' ;
        }
        // Output the accumulated formatted string to the console.
        console.log ( output ) ;
    } , // End of print_object function.


    /**
     * Function: highlight
     * Description: Wraps the given text in an HTML <h1> tag with inline red styling.
     * Parameters:
     *   - text: The string content to be highlighted.
     * Returns: An HTML string representing the highlighted text.
     */
    highlight: function ( text ) {
        // Construct and return the HTML string.
        return "<h1 style='color:red;'>" + text + "</h1>" ;
    }

} ; // End of module.exports object.