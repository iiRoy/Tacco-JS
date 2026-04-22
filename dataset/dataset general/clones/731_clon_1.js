/*
 * Copyright (c) 2012 by James Cammarata <jimi@sngx.net>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


// This global flag helps manage search operations.
// It prevents multiple concurrent search requests from being initiated.
var searching = false ;


// This array will store the final, sorted search results.
// It's declared globally to be accessible after the asynchronous search completes.
var final_results = [ ] ;



/**
 * Helper function to enable or disable search-related UI elements.
 * It targets all elements with the class "search" to control their disabled state.
 *
 * @param {boolean} enabled - If true, elements are enabled; if false, they are disabled.
 */
function set_search_enabled ( enabled )
{
    // Toggle the 'disabled' property based on the 'enabled' parameter.
    // Note the negation to correctly map 'enabled' to the 'disabled' attribute.
    $ ( ".search" ) . prop ( "disabled" , ! enabled ) ;
}




/**
 * Extracts all enumerable own property keys from a given object and returns them as an array.
 * This function acts as a utility to get object keys, similar to Object.keys() but potentially
 * for older environments or specific needs.
 *
 * @param {object} obj - The object from which to extract keys.
 * @returns {Array<string>} An array containing the keys of the object.
 */
function getkeys ( obj )
{
    var keys = [ ] ; // Initialize an empty array to hold the keys.

    // Iterate over all properties of the object, including those inherited.
    for ( var key in obj )
    {
        // Ensure that the property is an "own" property of the object,
        // not inherited from its prototype chain.
        if ( obj . hasOwnProperty ( key ) )
        {
            keys . push ( key ) ; // Add the key to our results array.
        }
    }

    return keys ; // Return the array of keys.
}




/**
 * Initiates and executes a search operation based on user input.
 * This function performs an asynchronous JSON request to a search endpoint,
 * processes the results, sorts them by relevance, and then invokes a callback.
 * It also manages the 'searching' state to prevent overlapping searches.
 *
 * @param {Function} search_callback - A callback function to be executed once the search is complete
 *                                     and results are processed.
 */
function run_search ( search_callback )
{
    // Proceed only if no search is currently active and the search box is not empty.
    if ( ! searching && $ . trim ( $ ( "#searchbox" ) . val ( ) ) != "" )
    {
        // Set the flag to indicate that a search is now in progress.
        searching = true ;

        // Clear any previous search results before starting a new search.
        final_results = [ ] ;

        // Disable search input fields and buttons to prevent user interaction during the search.
        set_search_enabled ( false ) ;


        // Make an AJAX GET request to the /search.json endpoint.
        // The results are expected in JSON format.
        $ . getJSON ( '/search.json' , function ( data , status ) {

            // Retrieve search terms from the search box, trim whitespace, convert to lowercase,
            // and split into individual words.
            var s_words = $ . trim ( $ ( "#searchbox" ) . val ( ) ) . toLowerCase ( ) . split ( " " ) ;

            // Initialize an object to store interim search results, keyed by document ID.
            var results = { } ;


            // Loop through all the words found in the search index data.
            $ . each ( getkeys ( data [ "words" ] ) , function ( idx , key )
            {
                // For each word in the search index, compare it against each of the user's search terms.
                $ . each ( s_words , function ( idx , val )
                {
                    // Initialize the regular expression string for fuzzy matching.
                    var s_reg = val ;

                    // Apply "fuzzy" matching logic using regex if the search term is at least 3 characters long.
                    if ( val . length > 2 )
                    {
                        try
                        {
                            // Construct a regex for fuzzy matching (e.g., 'word' becomes 'w\w*o\w*r\w*d').
                            // The `replace(/\W/, "")` ensures non-word characters don't break the regex.
                            s_reg = new RegExp ( val . split ( '' ) . join ( '\\w*' ) . replace ( / \W / , "" ) , 'i' ) ;
                        }
                        catch ( e )
                        {
                            // If an error occurs during regex creation (e.g., invalid regex characters in input),
                            // fall back to using the raw string for a direct match.
                            // This block handles cases like "word*" which might create an invalid regex.
                        }
                    }

                    // Check if the current word from the index matches the search term (either exact or fuzzy).
                    if ( key . match ( s_reg ) )
                    {
                        // A match is found! Now, process all documents associated with this matching word.
                        $ . each ( data [ "words" ] [ key ] , function ( widx , wobj )
                        {
                            // 'u' is the unique identifier for the document, typically a ferret-based ID,
                            // which serves as an index into the 'index' hash table within our data.
                            var id = wobj [ "u" ] ;

                            // Ensure that the document ID actually exists in the main index.
                            if ( data [ "index" ] [ id ] )
                            {
                                // If this document hasn't been added to our results yet, initialize its entry.
                                if ( ! results [ id ] )
                                {
                                    results [ id ] = { } ; // Create a new object for this document's results.
                                    results [ id ] [ "s" ] = 0.0 ;                    // Initialize score to 0.0.
                                    results [ id ] [ "t" ] = data [ "index" ] [ id ] [ "t" ] ; // Store the document title.
                                    results [ id ] [ "u" ] = data [ "index" ] [ id ] [ "u" ] ; // Store the document URL.
                                }

                                // Add the score associated with this specific word/document pairing
                                // to the document's total score.
                                //
                                // TODO: Consider implementing logic to adjust scores based on the "fuzziness"
                                //       of the match (e.g., exact matches score higher than fuzzy ones).
                                results [ id ] [ "s" ] += parseFloat ( wobj [ "s" ] ) ;
                            }
                        } ) ;
                    }
                } ) ;
            } ) ;


            // After processing all words, extract all document IDs (keys) from the 'results' object.
            var keys = [ ] ;
            $ . each ( results , function ( key , val ) {
                keys . push ( key ) ;
            } ) ;


            // Sort the document IDs. The primary sort criterion is the score (highest to lowest).
            // In case of a tie in scores, documents are sorted alphabetically by their title.
            keys . sort ( function ( a , b )
            {
                var res = results [ b ] [ "s" ] - results [ a ] [ "s" ] ; // Calculate score difference.

                if ( res == 0.0 )
                {
                    // Scores are equal, so sort by title alphabetically.
                    return ( results [ a ] [ "t" ] > results [ b ] [ "t" ] ) ? 1 : ( ( results [ b ] [ "t" ] > results [ a ] [ "t" ] ) ? -1 : 0 ) ;
                }
                else
                {
                    // Scores are different, return the score difference for sorting.
                    return res ;
                }
            } ) ;


            // Populate the 'final_results' array with the sorted document objects,
            // ensuring that documents with higher scores appear first.
            $ . each ( keys , function ( idx , key )
            {
                final_results . push ( results [ key ] ) ;
            } ) ;

            // Execute the provided callback function, signaling the completion of result processing.
            search_callback ( ) ;

        } )
        . success ( function ( ) {
            // This block executes if the AJAX request was successful.
            // No specific action needed here beyond what's handled in the main callback.
        } )
        . error ( function ( ) {
            // This block executes if the AJAX request encountered an error.
            // Error handling logic could be added here (e.g., displaying a message).
        } )
        . complete ( function ( ) {
            // This block always executes, regardless of success or error, after the request finishes.
            // It's used to reset the search state.

            searching = false ; // Reset the search flag, indicating no search is currently active.
            set_search_enabled ( true ) ; // Re-enable search UI elements for new input.
        } ) ;
    }
}