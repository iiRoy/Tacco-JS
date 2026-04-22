/*
 * This module manages browser session storage.
 * It provides basic CRUD operations for key-value pairs.
 * Utilizes an Immediately Invoked Function Expression (IIFE)
 * to create a private scope for its internal variables.
 */
var StorageManager = ( function () {

    // Private variable to hold the storage object.
    var _storage = window.sessionStorage ;

    /**
     * Checks if session storage is supported by the browser.
     * @returns {boolean} True if supported, false otherwise.
     */
    function support ( ) {
        return ( typeof _storage != "undefined" ) ;
    }

    // Public API exposed by the StorageManager.
    return {
        /**
         * Saves a key-value pair to session storage.
         * @param {string} key - The key to store the value under.
         * @param {*} value - The value to store.
         */
        save : function ( key , value ) {
            if ( support ( ) )
                _storage[ key ] = value ;
        } ,

        /**
         * Retrieves a value from session storage.
         * @param {string} key - The key of the value to retrieve.
         * @returns {*} The stored value, or null if not supported.
         */
        get : function ( key ) {
            if ( ! support ( ) ) return null ;
            return _storage[ key ] ;
        } ,

        /**
         * Checks if a key exists in session storage.
         * @param {string} key - The key to check.
         * @returns {boolean} True if the key exists, false otherwise.
         */
        has : function ( key ) {
            if ( ! support ( ) ) {
                return false ;
            }
            return ( _storage[ key ] ? true : false ) ;
        }
    } ;

} ) ( ) ;


/*
 * MarkupPreview module: Handles dynamic preview of markup content.
 * It manages textarea input, AJAX rendering, and UI layout adjustments.
 * This IIFE encapsulates all preview-related logic and state.
 */
var MarkupPreview = ( function ( ) {

    // Stores the last processed markup content.
    var lastMarkup = null ;
    // This variable seems unused in the provided code.
    var lastFormat = null ;
    // Stores the current layout mode (e.g., "50-50", "exact").
    var lastLayout = null ;
    // Delay in milliseconds before updating the preview.
    var delay = 1000 ;

    // Timeout ID for the delayed update function.
    var timeout = 0 ;

    /**
     * Adjusts the layout of the preview panes based on `lastLayout` mode.
     * Handles dynamic resizing of elements.
     */
    function resizeHandler ( ) {
        if ( lastLayout == "exact" ) {
            // Set fixed width for the right pane.
            $ ( "#right" ) . css ( "width" , "907px" ) ;
            // Calculate width for the left pane dynamically.
            $ ( "#left" ) . css ( "width" , ( $ ( document ) . width ( ) - 907 - 1 ) + "px" ) ;
        } else {
            // Default to 50-50 split for parts.
            $ ( ".part" ) . css ( "width" , "49.9999%" ) ;
        }

        // Adjust height of the right content area.
        $ ( "#right .content" ) . height ( $ ( window ) . height ( ) - 95 + 1 ) ;
        // Adjust height of the textarea.
        $ ( "textarea" ) . height ( $ ( window ) . height ( ) - 95 + 1 ) ;
        // Adjust width of the textarea based on the left pane's width.
        $ ( "textarea" ) . width ( $ ( "#left" ) . width ( ) - 34 ) ;
    }

    /**
     * Updates the preview content.
     * It debounces updates using a timeout and sends AJAX requests
     * if the markup or type has changed.
     */
    function update ( ) {
        // Clear any pending update timeouts.
        clearTimeout ( timeout ) ;

        // Get the latest content from the textarea.
        var latest = $ ( "textarea" ) . val ( ) ;
        // Get the selected markup type.
        var type = $ ( "#type" ) . val ( ) ;

        // If content and type haven't changed, schedule another check and return.
        if ( ( latest == lastMarkup ) && ( lastType == type ) ) {
            timeout = setTimeout ( update , delay ) ;
            return ;
        }

        // Update the last known markup and type.
        lastMarkup = latest ;
        lastType = type ;

        // Persist the current data and type to session storage.
        StorageManager . save ( "data" , lastMarkup ) ;
        StorageManager . save ( "type" , lastType ) ;

        // Make an AJAX call to render the markup.
        $ . ajax ( {
            type : "POST" ,
            url : "./render" ,
            data : {
                type : $ ( "#type" ) . val ( ) ,
                markup : lastMarkup
            }
        } ) . success ( function ( data ) {
            // On success, update the right pane's content.
            $ ( "#right .content" ) . html ( data ) ;
            // Re-adjust layout after content update.
            resizeHandler ( ) ;
            // Schedule the next update check.
            timeout = setTimeout ( update , delay ) ;
        } ) ;
    }


    // Public API for the MarkupPreview module.
    return {
        /**
         * Initializes the preview functionality.
         * Sets up event listeners, loads initial data, and performs initial rendering.
         */
        init : function ( ) {
            // Check for WordPress example hash in URL.
            if ( window . location . hash == "#wp" ) {
                window . example_url = 'wp-example.txt' ;
                window . markup_type = 'wp' ;
                // window.location.hash = ''; // This line was commented out in original.
            }

            // Event listener for layout buttons in the header.
            $ ( "header .btn-group .btn" ) . click ( function ( ) {
                // Remove 'active' class from previously active button.
                $ ( "button.active" ) . removeClass ( "active" ) ;
                // Add 'active' class to the clicked button.
                $ ( this ) . addClass ( "active" ) ;

                // Determine the layout based on the button's ID.
                if ( $ ( this ) . attr ( "id" ) == "50-50" ) {
                    lastLayout = "50-50" ;
                } else {
                    lastLayout = "exact" ;
                }
                // Apply the new layout.
                resizeHandler ( ) ;
                // Save the layout preference.
                StorageManager . save ( "layout" , lastLayout ) ;
            } ) ;

            // Load saved markup data or a default example.
            if ( StorageManager . has ( "data" ) ) {
                $ ( "textarea" ) . val ( StorageManager . get ( "data" ) ) ;
            } else {
                // First-time visit: Load example markdown via AJAX.
                $ . ajax ( {
                    url : window . example_url || "./example.md" ,
                } ) . success ( function ( data ) {
                    $ ( "textarea" ) . val ( data ) ;
                    resizeHandler ( ) ;
                    update ( ) ;
                } ) ;
            }

            // Load saved markup type.
            if ( StorageManager . has ( "type" ) ) {
                console . log ( StorageManager . get ( 'type' ) ) ;
                $ ( "#type" ) . children ( "option" ) . removeAttr ( "selected" ) ;
                $ ( "#type" ) . children ( "option" ) . each ( function ( ) {
                    if ( $ ( this ) . val ( ) == StorageManager . get ( "type" ) ) {
                        $ ( this ) . attr ( "selected" , "selected" ) ;
                    }
                } ) ;
                // Trigger an update after setting the type.
                update ( ) ;
            } else {
                // Set default markup type if none is saved.
                $ ( "#type" ) . children ( "option" ) . each ( function ( ) {
                    if ( $ ( this ) . val ( ) == window . markup_type ) {
                        $ ( this ) . attr ( "selected" , "selected" ) ;
                    }
                } ) ;
            }

            // Load saved layout preference and trigger click.
            if ( StorageManager . has ( "layout" ) ) {
                $ ( "#" + StorageManager . get ( "layout" ) ) . trigger ( "click" ) ;
            }

            // Event listener for type change dropdown.
            $ ( "#type" ) . change ( update ) ;
            // Event listener for window resize.
            $ ( window ) . resize ( resizeHandler ) ;

            // Perform initial layout adjustment and content update.
            resizeHandler ( ) ;
            update ( ) ;
        }
    } ;

} ) ( ) ;

// jQuery document ready function to initialize the MarkupPreview module.
$ ( document ) . ready ( function ( ) {
    MarkupPreview . init ( ) ;
} ) ;