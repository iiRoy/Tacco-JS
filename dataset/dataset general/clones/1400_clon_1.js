/*
 * This is the primary namespace object for the RedisUI application.
 * It encapsulates all related functionalities and configurations.
 */
var RedisUI = { } ;

/*
 * Application-wide preferences are stored in this object.
 * These settings can often be overridden or persisted via cookies.
 */
RedisUI . prefs = {
    "warn-on-del" : true , // Boolean flag: if true, a confirmation dialog appears before deletion.
    "num-entries" : "25" // String value representing the default number of entries to display.
} ;

// The main entry point for the application's client-side logic.
// This function executes once the DOM is fully loaded and ready.
$( function ( ) {


    // Initialize the jQuery DataTables plugin for the keys table.
    // This enhances the HTML table with sorting, pagination, and search capabilities.
    RedisUI . keytable = $ ( 'table.keys' ) . dataTable ( {
        "bStateSave": true // Enables saving the table's state (e.g., current page, sorting) using cookies.
    } ) ;


    // Setup the jstree plugin for the namespace tree view.
    // This provides an interactive, collapsible tree structure for browsing namespaces.
    $ ( '#namespace_tree' ) . bind ( "loaded.jstree" , function ( event , data ) {
        // Once the tree is loaded, automatically expand all nodes for better visibility.
        $( this ) . jstree ( "open_all" ) ;
    } ) . jstree ( {
        "core" : {
            "animation": 20 // Sets the animation speed for tree node expansions/collapses in milliseconds.
        } ,
        "plugins" : [ "themes" , "html_data" ] // Specifies which jstree plugins to load.
    } ) ;


    /*
     * This loop iterates through the predefined preferences.
     * It attempts to load each preference's value from a cookie.
     * If a cookie is found, it updates the preference; otherwise, it saves the default preference to a cookie.
     */
    for ( var key in RedisUI . prefs ) {
        if ( val = $ . cookie ( key ) ) {
            RedisUI . prefs [ key ] = val ; // Update preference with value from cookie.
        } else {
            $ . cookie ( key , RedisUI . prefs [ key ] ) ; // Set cookie with default preference value.
        }
    }


    // Initialize the state of the "warn-on-del" checkbox based on the stored preference.
    // The preference value is a string, so it's compared to "true".
    $ ( '#warn-on-del' ) . prop ( "checked" , RedisUI . prefs [ 'warn-on-del' ] == "true" ) ;

    // Set the value of the DataTables length menu (entries per page) based on the preference.
    $ ( '[name=DataTables_Table_0_length]' ) . val ( RedisUI . prefs [ 'num-entries' ] ) ;


    /*
     * Event handler for preference checkboxes.
     * When a checkbox with the class 'pref-cb' is clicked, its state is saved to a cookie.
     */
    $ ( 'input.pref-cb' ) . click ( function ( e ) {
        // Save the 'warn-on-del' preference based on the checkbox's checked state.
        $ . cookie ( 'warn-on-del' , $ ( this ) . prop ( 'checked' ) ) ;
    } ) ;


    /*
     * Event handler for the DataTables length menu.
     * When the value of the entries-per-page dropdown changes, the new value is saved to a cookie.
     */
    $ ( '[name=DataTables_Table_0_length]' ) . change ( function ( e ) {
        // Save the 'num-entries' preference based on the dropdown's selected value.
        $ . cookie ( 'num-entries' , $ ( this ) . val ( ) ) ;
    } ) ;


    /*
     * This section handles the AJAX-based deletion of keys.
     * It uses event delegation for elements with the class 'del'.
     */
    $ ( 'a.del' ) . live ( 'click' , function ( e ) {
        e . preventDefault ( ) ; // Prevent the default link behavior (navigation).

        var nodes = RedisUI . keytable . fnGetNodes ( ) ; // Retrieve all table nodes (rows).
        var row = $ ( this ) . closest ( 'tr' ) [ 0 ] ; // Get the DOM element of the closest table row.
        var key = $ ( this ) . data ( 'key' ) ; // Extract the key to be deleted from the element's data attribute.

        // Check if the "warn-on-del" preference is enabled.
        if ( $ ( '#warn-on-del' ) . prop ( 'checked' ) ) {
            // If warning is enabled, show a confirmation dialog.
            if ( confirm ( "This will delete the key:\n\n\"" + key + "\"\n\n...from the DB. Are you sure?" ) ) {
                doit ( this ) ; // Proceed with deletion if confirmed.
            }
        } else {
            // If no warning is required, execute the deletion immediately.
            doit ( this ) ;
        }

        /*
         * Helper function to perform the actual deletion via an AJAX POST request.
         * @param {HTMLElement} element - The DOM element that triggered the deletion.
         */
        function doit ( element ) {
            $ . post ( $ ( element ) . attr ( 'href' ) , function ( response ) {
                // On successful deletion, remove the corresponding row from the DataTable.
                RedisUI . keytable . fnDeleteRow ( row ) ;
            } ) ;
        }
    } ) ;


    /*
     * This function implements an optional auto-refresh mechanism for the UI.
     * It checks a checkbox state and, if active, periodically fetches and updates parts of the page.
     */
    function maybe_auto_refresh ( ) {
        // Check if the auto-refresh checkbox is currently checked.
        if ( $ ( '#auto-refresh' ) . prop ( 'checked' ) ) {
            $ . ajax ( {
                type: 'get' , // HTTP method for the request.
                dataType: 'html' , // Expected data type of the response.
                accepts: 'html' , // Type of content the client is willing to accept.
                url: window . location . href , // The URL to request (current page).
                success: function ( response ) {
                    // Replace the 'namespaces' section with the updated content from the response.
                    $ ( '#namespaces' ) . replaceWith ( $ ( '#namespaces' , response ) ) ;
                    // Replace the 'data_table' section with the updated content from the response.
                    $ ( '#data_table' ) . replaceWith ( $ ( '#data_table' , response ) ) ;
                }
            } ) ;
        }
        // Schedule the next execution of maybe_auto_refresh after 2000 milliseconds (2 seconds).
        window . setTimeout ( maybe_auto_refresh , 2000 ) ;
    }

    // The line below was commented out in the original code, indicating it's not currently active.
    // window.setTimeout(maybe_auto_refresh, 2000);

} ) ; // End of the document ready function.