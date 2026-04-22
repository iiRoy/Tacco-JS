/*
 *  @author Andrew Fedoniouk <andrew@terrainformatica.com>
 *  @name jQuery Single Page Application micro framework - Type I Clone
 *  @license MIT - This code is subject to the MIT License.
 *  @purpose Provides core functionalities for routing and dynamic content management
 *           within single-page web applications using jQuery.
 *  @version 1.0.0 (Type I Clone Edition)
 */


( function ( $,
             window ) {


    // Stores handlers for different pages, keyed by page name.
    var pageHandlers    = {};


    // Variables to keep track of the currently active page.
    var currentPageName = null;
    var $currentPage    = null;


    /**
     * Displays a specified page and executes its associated handler.
     * @param {string} pageName - The ID of the section element representing the page.
     * @param {any}    param    - An optional parameter to pass to the page handler.
     */
    function show( pageName,
                   param ) {

        // Attempt to find the page section in the DOM.
        var $page = $( "section#" + pageName );

        // If the page section is not found, log a warning and exit.
        if ( $page.length == 0 ) {

            console.warn( "Section with id=%s not found!",
                          pageName );
            return;
        }

        // Retrieve the handler function for the specified page.
        var ph = pageHandlers[ pageName ];

        // If a page handler exists, execute it.
        if ( ph ) {

            // Determine the context ('this') for the handler call.
            var that = $page.length > 0
                         ? $page[ 0 ]
                         : null;

            // Call the page handler with the current context and parameter.
            var r = ph.call( that,
                             param );

            // If the handler returns a function, it means it's a rendering function.
            if ( typeof r == "function" ) { // It returns the function that's used for view rendering.

                // Update the page handler to the returned rendering function for subsequent calls.
                pageHandlers[ pageName ] = r;

                // Immediately call the rendering function to display the view.
                r.call( that,
                        param ); // Call that rendering function.
            }
        }

        // If there was a previously active page, perform cleanup.
        if ( currentPageName ) { // "Close" current page view.

            // Remove the CSS class corresponding to the old page name from the body.
            $( document.body ).removeClass( currentPageName ); // Remove old page class.

            // If there's a reference to the old page element, trigger a 'page.hidden' event.
            if ( $currentPage )
                $currentPage.trigger( "page.hidden",
                                      currentPageName );
        }

        // Set the new page as active.
        // First, update the currentPageName and add its class to the body.
        $( document.body ).addClass( currentPageName = pageName );

        // Then, update the $currentPage reference and trigger a 'page.shown' event.
        if ( $currentPage = $page )
            $currentPage.trigger( "page.shown",
                                  currentPageName );
    }


    /**
     * Main application function to load and display pages, handling external content.
     * @param {string} pageName - The ID of the page to load.
     * @param {any}    param    - Optional parameter for the page handler.
     */
    function app( pageName,
                  param ) {

        // Find the target page section within the document body.
        var $page = $( document.body ).find( "section#" + pageName );


        // Check if the page has a 'src' attribute and is currently empty.
        var src = $page.attr( "src" );
        if ( src && $page.find( ">:first-child" ).length == 0 ) { // It has src and is empty.

            // If so, fetch content from the 'src' URL.
            $.get( src,
                   "html" )
                .done( function ( html ) {
                    $page.html( html ); // Insert fetched HTML into the page.
                    show( pageName,
                          param );      // Then, show the page.
                } )
                .fail( function () {
                    alert( "Failed to get:" + src ); // Handle fetch failure.
                } );
        } else {
            // If no 'src' or not empty, just show the page directly.
            show( pageName,
                  param );
        }
    }


    /**
     * Registers a handler function for a specific page.
     * @param {string}   pageName - The name (ID) of the page.
     * @param {function} handler  - The function to execute when the page is shown.
     */
    app.page = function ( pageName,
                          handler ) {

        pageHandlers[ pageName ] = handler;
    };


    /**
     * Handler for the 'hashchange' event, responsible for routing.
     * Parses the URL hash and calls the app function.
     */
    function onhashchange() {

        // Get the current hash or default to the ID of the section with 'default' attribute.
        var hash = location.hash || "#" + $( "section[default]" ).attr( 'id' );

        // Regular expression to parse the hash: #pageName:param
        var re    = /#([-0-9A-Za-z]+)(\:(.+))?/;
        var match = re.exec( hash );

        // Extract the page name and optional parameter from the hash.
        hash      = match[ 1 ];
        var param = match[ 3 ];

        // Call the main application function to load and display the page.
        app( hash,
             param );
    }


    // Attach the 'onhashchange' function as an event listener to the window.
    $( window ).on( "hashchange",
                    onhashchange );


    // Expose the 'app' function globally for external access.
    window.app = app;


    // Call 'onhashchange' once on document ready to handle the initial page load.
    $( onhashchange ); // Call it for the initialization.


} )( jQuery,
     this ); // Pass jQuery and the global 'this' (window) into the IIFE.