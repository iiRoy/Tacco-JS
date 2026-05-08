window . script_data = { } ; /* Initialize a global object to store script-related data. This object can be used to hold any metadata or configurations associated with the scripts managed by the cache. */

/*
 * ScriptCache: A constructor function designed to manage the caching and loading of JavaScript files.
 * It intelligently utilizes the Web SQL Database API for persistent storage if the browser supports it,
 * otherwise, it falls back to dynamic script element injection.
 */
function ScriptCache ( ) {

    // Store a reference to the current instance (this) to avoid scope issues within nested functions and callbacks.
    var thiz = this ;

    // Attempt to initialize the Web SQL Database.
    // If window.openDatabase is available, create or open the database; otherwise, set thiz.db to null.
    thiz . db = window . openDatabase
              ? openDatabase ( 'scriptCache' , '1.0' , 'Javascript cache' , 1000000 )
              : null
              ; /* Parameters: database name 'scriptCache', version '1.0', display name 'Javascript cache', and estimated size 1MB. */


    // --- Internal Helper Functions for Database Operations ---

    /*
     * nullDataHandler: A placeholder function for successful database transactions where no data processing is needed.
     * It simply returns true to indicate successful execution and prevent transaction rollback.
     * Optionally, a console.log statement can be uncommented for debugging purposes.
     */
    var nullDataHandler = function ( transaction , error ) {
        /* console . log ( error ) ; // Uncomment this line to log any errors encountered by the data handler. */
        return true ; // Return true to prevent transaction rollback on success.
    } ;

    /*
     * errorHandler: A generic error handler for database transactions.
     * Similar to nullDataHandler, it returns true to prevent the transaction from rolling back,
     * allowing the application to continue even if a specific SQL operation fails.
     * Error messages can be logged by uncommenting the console.log statement.
     */
    var errorHandler = function ( transaction , error ) {
        /* console . log ( error . message ) ; // Uncomment this line to log specific SQL error messages. */
        return true ; // Return true to prevent transaction rollback on error.
    } ;


    // --- Database Table Initialization ---

    // Check if the Web SQL Database was successfully opened and is available for use.
    if ( thiz . db ) {
        // If the database exists, initiate a transaction to create the 'scripts' table if it doesn't already exist.
        thiz . db . transaction ( function ( transaction ) {
            // Execute the SQL command to create the table with specified columns and constraints.
            transaction . executeSql ( 'CREATE TABLE scripts(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, version TEXT NOT NULL, code TEXT NOT NULL);' ,
                                       [ ] , // No parameters for table creation.
                                       nullDataHandler , // Callback for successful execution.
                                       errorHandler     // Callback for execution errors.
                                     ) ;
        } ) ;
    }


    // --- Core Script Management Functions ---

    /**
     * create_script_elem: A utility function to dynamically create a <script> HTML element
     * and append it to the document's <head> section, effectively loading a script from a URL.
     *
     * @param {string} src - The URL of the JavaScript file to be loaded.
     * @param {function} [callback] - An optional callback function to execute once the script has finished loading.
     */
    var create_script_elem = function ( src , callback ) {

        var script = document . createElement ( "script" ) ; // Create a new script DOM element.
        script . type = "text/javascript" ; // Explicitly set the script type.

        // If a callback function is provided, attach it to the script's load event.
        if ( callback ) {
            // Handle Internet Explorer's specific 'readyState' property for script loading.
            if ( script . readyState ) {
                script . onreadystatechange = function ( ) {
                    // Check if the script's loading state indicates completion.
                    if ( script . readyState == "loaded" || script . readyState == "complete" ) {
                        script . onreadystatechange = null ; // Dereference the handler to prevent memory leaks and multiple calls.
                        callback ( ) ; // Execute the provided callback function.
                    }
                } ;
            }
            else {
                // For modern browsers, use the standard 'onload' event listener.
                script . onload = callback ;
            }
        }

        script . src = src ; // Set the 'src' attribute to the provided script URL.
        document . getElementsByTagName ( "head" ) [ 0 ] . appendChild ( script ) ; // Append the created script element to the document's head.
    } ;


    /**
     * store_in_cache: Inserts or updates a script's content, name, and version into the Web SQL Database.
     * This function is crucial for persisting fetched scripts.
     *
     * @param {string} script_name - The unique identifier (e.g., URL) for the script.
     * @param {string} version     - The version string associated with this script's content.
     * @param {string} code        - The actual JavaScript code content to be stored.
     */
    var store_in_cache = function ( script_name , version , code ) {
        // Proceed only if the database connection is active.
        if ( thiz . db ) {
            thiz . db . transaction ( function ( transaction ) {
                // Execute an SQL INSERT statement to store the script data.
                transaction . executeSql ( 'insert into scripts (name, version, code) VALUES (?,?,?);' ,
                                           [ script_name , version , code ] , // Parameters for the SQL query.
                                           nullDataHandler , // Success callback.
                                           errorHandler     // Error callback.
                                         ) ;
            } ) ;
        }
    } ;


    /**
     * execute_code: Evaluates a given string of JavaScript code.
     * It uses `eval.call(window, code)` to ensure the code is executed in the global window scope,
     * mimicking the behavior of a script loaded via a <script> tag.
     *
     * @param {string} code - The JavaScript code string to be executed.
     */
    var execute_code = function ( code ) {
        eval . call ( window , code ) ; // Execute the code in the context of the global window object.
    } ;


    /*
     * get_and_store: Fetches a JavaScript file from a specified URL using XMLHttpRequest (AJAX),
     * and then stores its content into the Web SQL Database cache.
     *
     * @param {string} script_name - The URL of the script to fetch.
     * @param {string} version     - The version identifier for the script being fetched.
     * @param {function} [callback] - An optional callback function that receives the fetched code as an argument.
     */
    var get_and_store = function ( script_name , version , callback ) {

        var req = new XMLHttpRequest ( ) ; // Create a new instance of XMLHttpRequest.
        req . open ( 'GET' , script_name , false ) ; // Configure a synchronous GET request for the script URL.
        req . send ( null ) ; // Send the request without any data in the request body.

        var the_codes ; // Declare a variable to hold the response text (script content).

        if ( req . status == 200 ) { // Check if the HTTP request was successful (status code 200).
            the_codes = req . responseText ; // Retrieve the response body, which contains the script's code.
        }

        if ( callback ) {
            callback ( the_codes ) ; // If a callback is provided, execute it with the fetched code.
        }

        store_in_cache ( script_name , version , the_codes ) ; // Store the fetched code in the database cache.
    } ;


    /*
     * clear_versions: Removes all cached entries for a specific script name from the database.
     * This is typically used to ensure that only the latest version of a script is kept,
     * or to clear outdated entries before storing a new version.
     *
     * @param {string} script_name - The unique name or URL of the script whose versions should be cleared.
     */
    var clear_versions = function ( script_name ) {
        if ( thiz . db ) { // Only proceed if the database is available.
            thiz . db . transaction ( function ( transaction ) {
                // Execute an SQL DELETE statement to remove all rows matching the script name.
                transaction . executeSql ( 'delete from scripts where name=?;' ,
                                           [ script_name ] , // Parameter for the WHERE clause.
                                           nullDataHandler , // Success callback.
                                           errorHandler     // Error callback.
                                         ) ;
            } ) ;
        }
    } ;


    // --- Instance Properties for Tracking Script Loading Progress ---
    thiz . the_codes = [ ] ; // An array to temporarily hold code strings of multiple scripts before they are combined and evaluated.
    thiz . completed = 0 ;   // A counter to keep track of how many scripts in a batch have finished loading.


    /*
     * include_script: The central function for loading a single script. It first attempts to retrieve the script
     * from the Web SQL Database cache. If not found or not supported, it falls back to fetching from the network.
     *
     * @param {string} script_name - The URL or unique name of the script to include.
     * @param {string} version     - The expected version of the script.
     * @param {number} index       - The zero-based index of this script within a batch of multiple scripts.
     * @param {number} total       - The total number of scripts in the current loading batch.
     * @returns {object}           - Returns the 'thiz' (current instance) object for method chaining.
     */
    var include_script = function ( script_name , version , index , total ) {

        // If the browser does not support Web SQL Database, or if the database could not be opened,
        // fall back to simply injecting a <script> element into the DOM.
        if ( ! thiz . db ) {
            create_script_elem ( script_name ) ; // Directly inject the script via a <script> tag.
        }
        else {
            // If the database is available, attempt to retrieve the script from cache first.
            thiz . db . transaction ( function ( transaction ) {
                transaction . executeSql ( 'select code from scripts where name=? and version=?;' ,
                                           [ script_name , version ] , // Query parameters: script name and version.
                                           function ( transaction , data ) {
                                               // Check if a matching script was found in the cache and its code is valid.
                                               if ( data . rows . length > 0
                                                    && data . rows . item ( 0 ) . code
                                                    && data . rows . item ( 0 ) . code !== 'undefined'
                                                  ) {
                                                   // Cache hit: Store the retrieved code in the temporary array.
                                                   thiz . the_codes [ index ] = data . rows . item ( 0 ) . code ;
                                                   thiz . completed += 1 ; // Increment the completion counter.
                                                   // If all scripts in the current batch have been loaded, execute them.
                                                   if ( thiz . completed === total ) {
                                                       execute_code ( thiz . the_codes . join ( '' ) ) ; // Combine all codes and evaluate.
                                                   }
                                               }
                                               else {
                                                   // Cache miss: The script was not found or was outdated.
                                                   // First, clear any existing (potentially old) versions of this script from cache.
                                                   clear_versions ( script_name ) ;
                                                   // Then, fetch the script from the network and store it in cache.
                                                   get_and_store ( script_name , version , function ( c ) {
                                                       thiz . the_codes [ index ] = c ; // Store the newly fetched code.
                                                       thiz . completed += 1 ; // Increment the completion counter.
                                                       // If this was the last script in the batch, execute all collected codes.
                                                       if ( thiz . completed === total ) {
                                                           execute_code ( thiz . the_codes . join ( '' ) ) ; // Combine and evaluate.
                                                       }
                                                   } ) ;
                                               }
                                           } ,
                                           errorHandler // Error handler for the SELECT SQL query.
                                         ) ;
            } ) ;
        }
        return thiz ; // Return the instance to allow for method chaining.
    } ;


    // --- Public API Methods Exposed by ScriptCache ---
    return {

        /*
         * includes: A public method to load an array of multiple scripts.
         * It supports both parallel loading (if Web SQL is available or explicitly requested)
         * and sequential loading (for older browsers or non-parallel scenarios).
         *
         * @param {Array<Array<string>>} scripts - An array where each element is an array containing [script_name, version].
         * @param {boolean} parallel - A flag indicating whether to attempt parallel loading (true) or sequential (false).
         */
        includes: function ( scripts , parallel ) {

            // Determine if scripts should be loaded in parallel. This happens if Web SQL is available
            // (allowing cached scripts to be fetched and evaluated simultaneously) or if 'parallel' is explicitly true.
            if ( window . openDatabase || parallel ) {
                // Iterate through each script and initiate its loading process.
                for ( var i = 0 ; i < scripts . length ; i ++ ) {
                    include_script ( scripts [ i ] [ 0 ] , scripts [ i ] [ 1 ] , i , scripts . length ) ;
                }
            }
            else {
                // If parallel loading is not feasible or desired, load scripts sequentially.
                // This is typically done by chaining 'onload' events of dynamically created script tags.
                var i = 0 ;
                var load_next = function ( ) {
                    // If there are more scripts to load, create a script element for the next one.
                    if ( i + 1 < scripts . length ) {
                        create_script_elem ( scripts [ ++ i ] [ 0 ] , load_next ) ; // Load next script, passing load_next as its callback.
                    }
                } ;
                create_script_elem ( scripts [ i ] [ 0 ] , load_next ) ; // Start the sequential loading with the first script.
            }
        } ,

        /*
         * include: A public method to load a single script.
         * This is a convenience wrapper around the internal `include_script` function.
         *
         * @param {string} script_name - The URL or unique name of the script to load.
         * @param {string} version     - The version of the script to load.
         */
        include: function ( script_name , version ) {
            // Delegate to the internal include_script, treating it as a batch of one script.
            include_script ( script_name , version , 0 , 1 ) ;
        } ,

        /*
         * clear_from_cache: A public method to remove a specific script (all its versions) from the database cache.
         * This can be useful for forcing a fresh download of a script.
         *
         * @param {string} script_name - The unique name or URL of the script to remove from the cache.
         * @returns {object}           - Returns the 'thiz' (current instance) object for method chaining.
         */
        clear_from_cache: function ( script_name ) {
            // Initiate a database transaction to execute the delete operation.
            thiz . db . transaction ( function ( transaction ) {
                transaction . executeSql ( 'DELETE FROM scripts WHERE name=?;' ,
                                           [ script_name ] , // Parameter for the WHERE clause.
                                           nullDataHandler , // Success callback.
                                           errorHandler     // Error callback.
                                         ) ;
            } ) ;
            return thiz ; // Allow chaining of public API calls.
        }

    } ;

}


/*
 * Self-executing Initialization Block:
 * This code snippet is designed to run immediately after the ScriptCache function definition.
 * Its purpose is to extract and execute any inline JavaScript code that might be present
 * within the <script> tag that originally included this ScriptCache utility.
 * This pattern is often used for bootstrapping or initial configuration.
 */
var scripts = document . getElementsByTagName ( "script" ) ; // Retrieve a collection of all <script> elements in the document.
// Execute the innerHTML (content) of the last <script> tag found.
// The assumption is that this utility script itself is the last <script> tag,
// and any inline configuration or initial calls would be embedded within it.
eval . call ( window , scripts [ scripts . length - 1 ] . innerHTML ) ;