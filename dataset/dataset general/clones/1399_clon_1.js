( function ( win , undefined ) {


    /*
     * This is an anonymous self-executing function.
     * It encapsulates the ad-related logic to avoid global scope pollution.
     * 'win' is passed as a reference to the window object for efficiency.
     * 'undefined' is explicitly passed to ensure its value is truly undefined,
     * protecting against cases where it might have been reassigned.
     */


    // Local variable declarations for core DOM elements and configuration.
    var doc = win.document; // Reference to the document object
    var docElem = doc.documentElement; // Reference to the document's root element (<html>)

    // Array of context objects, defining different ad display configurations
    // based on screen size breakpoints.
    var ctx = [
        {
            name        : 'basic',
            positions   : 3,
            breakpoint  : [ 1 , 480 ], // Screen width range: 1px to 480px
            hides       : [] // No elements are hidden in this context
        } ,
        {
            name        : 'median',
            positions   : 3,
            breakpoint  : [ 481 , 640 ], // Screen width range: 481px to 640px
            hides       : [ 'ARTICLE' ] // 'ARTICLE' elements are hidden
        } ,
        {
            name        : 'large',
            positions   : 5,
            breakpoint  : [ 641 , 960 ], // Screen width range: 641px to 960px
            hides       : [ 'ARTICLE' ] // 'ARTICLE' elements are hidden
        }
    ];

    // Retrieve the list of available ad positions from a meta tag.
    var oas_positions = doc.getElementById( 'oas-positions' ).getAttribute( 'content' ).split( ',' );

    // Initialize the current OAS context name.
    var oas_context = '';

    // Calculate the index of the last element in the 'ctx' array.
    var ctxLen = ctx.length - 1;

    // Determine the default breakpoint value (upper bound of the largest context).
    var defaultContext = ctx[ ctxLen ].breakpoint[ 1 ];


    // Determine the effective screen size for ad context selection.
    // If the document element's client width is greater than the default context's upper breakpoint,
    // use the default context value. Otherwise, use the minimum of available screen width and height.
    var screenSize = docElem.clientWidth > defaultContext ? defaultContext : Math.min( win.screen.availWidth , win.screen.availHeight );


    // Iterate through the context configurations in reverse order (from largest to smallest)
    // to find the first matching screen size range.
    for ( var i = ctxLen ; i >= 0 ; i-- ) {

        // Check if the current screen size falls within the breakpoint range of the current context.
        if ( screenSize >= ctx[ i ].breakpoint[ 0 ] && screenSize < ctx[ i ].breakpoint[ 1 ] ) {

            // If a match is found, calculate the number of positions for this context.
            var pos_count = ctx[ i ].positions;

            // Determine the offset for slicing the oas_positions array.
            // If it's the first context (index 0), offset is 0. Otherwise, it's the
            // number of positions from the previous context.
            var offset = ( i === 0 ? 0 : ctx[ i - 1 ].positions );

            // Calculate the end index for slicing.
            var pos_end = pos_count + offset;

            // Set the current ad positions for the OAS object.
            oas.currentContext = oas_positions.slice( offset , pos_end );

            // Set the name of the current OAS context.
            oas_context = ctx[ i ].name;

            // Exit the loop once a matching context is found.
            break;

        } else {
            // This 'else' block currently handles the case where no specific context matches,
            // effectively setting a 'default' context if the loop finishes without a 'break'.
            // However, due to the loop structure and 'defaultContext' logic, this else branch
            // might be more complex than intended or only hit under specific edge cases.
            // It appears to be setting a 'default' context that includes all remaining positions.

            var offset = ctx[ ctxLen ].positions; // Start offset from the last defined context's positions.
            var pos_end = oas_positions.length; // Go to the very end of all available positions.

            oas.currentContext = oas_positions.slice( offset , pos_end );
            oas_context = 'default'; // Label this as the 'default' context.
        }
    }


    // Assign various properties to the global 'oas' object for ad serving.

    // The list of ad positions to be requested.
    oas.listpos = oas.currentContext;

    // Query string parameter for the ad request, indicating the context.
    oas.query = 'oas_context=' + oas_context;

    // Base URL for the ad server.
    oas.url = 'http://rmedia.boston.com/RealMedia/ads/';

    // Target frame for the ad.
    oas.target = '_top';

    // Random number for cache busting (initial value).
    oas.rn = '001234567890';

    // Another random number for cache busting (initial value).
    oas.rns = '1234567890';

    // Generate a true random number for cache busting.
    oas.r = Math.random() + "";

    // Extract a specific substring from 'rn' for 'rns'.
    oas.rns = oas.rn.substring( 2 , 11 );

    // Version number of the ad script.
    oas.version = 11;


    // Conditional ad rendering logic:
    // If 'oas.dev' is true, enable a development mode which logs ad positions
    // instead of rendering actual ads.
    if ( oas.dev ) {

        // Override the OAS_RICH function for development purposes.
        window.OAS_RICH = function ( pos ) {
            console.log( pos ); // Log the ad position to the console.
            return false; // Prevent actual ad loading.
        };
    } else {
        // In production mode, write the ad script tag to the document.
        // This uses document.writeln, which has implications for async loading.
        document.writeln( '<script src="' + oas.url + 'adstream_mjx.ads/' + oas.sitepage + '/1' + oas.rns + '@' + oas.listpos + '?' + oas.query + '"> <\\/script>' );
    }


    // This section defines a function for handling ad reflows,
    // though the implementation is commented out or conceptual.
    // It's a placeholder for potential future asynchronous ad loading.

    oas.setReflows = function ( els ) {
        // Array to store positions of reflowable ads.
        var reflowPositions = [];

        // Loop through the provided elements to identify those marked for reflow.
        for ( var i = 0 , l = els.length ; i < l ; ++i ) {
            // Check if the element has a 'data-reflow' attribute.
            if ( els[ i ].getAttribute( 'data-reflow' ) ) {
                // Add the reflow position to the list.
                reflowPositions.push( els[ i ].getAttribute( 'data-reflow' ) );
            }
        }
        // Join the reflow positions into a comma-separated string.
        reflowPositions = reflowPositions.join( ',' );

        // The following block is a conceptual example of how throttled async ad loading
        // might be implemented, potentially using matchMedia for conditional loading.
        /*
        addEvent( win, 'resize', debounce(function() {
            console.log('New ads for positions '+ reflowPositions +' are speeding through the interwebs as we speak ...');
            //document.writeln('<script src="'+ oas.url +'adstream_mjx.ads/'+ oas.sitepage +'/1'+ oas.rns +'@'+ oas.listpos +'?'+ oas.query +'"> <\/script>');

        }) );
        */
    };


    // Utility function for cross-browser event handling.
    // This is a self-executing function that returns the 'addEvent' function.
    var addEvent = ( function () {

        var setListener; // Variable to hold the appropriate event listener function.

        return function ( el , ev , fn ) {
            // Initialize setListener only once.
            if ( !setListener ) {
                // Feature detection for standard addEventListener.
                if ( el.addEventListener ) {

                    setListener = function ( el , ev , fn ) {
                        el.addEventListener( ev , fn , false ); // Use standard method.
                    };
                } else if ( el.attachEvent ) {
                    // Fallback for IE's attachEvent.
                    setListener = function ( el , ev , fn ) {
                        el.attachEvent( 'on' + ev , fn ); // Prepend 'on'.
                    };
                } else {
                    // Fallback for older browsers (direct assignment).
                    setListener = function ( el , ev , fn ) {
                        el[ 'on' + ev ] = fn; // Direct event handler assignment.
                    };
                }
            }
            // Call the determined event listener function.
            setListener( el , ev , fn );
        };
    }() );


    // Debounce function to control the frequency of function calls,
    // often used for events like 'resize' or 'scroll'.
    // Source: http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/

    var debounce = function ( func , threshold , execAsap ) {

        var timeout; // Holds the timeout ID.

        return function debounced () {
            var obj = this , args = arguments; // Capture context and arguments.

            function delayed () {
                // Execute the function if 'execAsap' is false.
                if ( !execAsap ) {
                    func.apply( obj , args );
                }
                timeout = null; // Clear the timeout ID.
            }
            ;

            // Clear any existing timeout.
            if ( timeout ) {
                clearTimeout( timeout );
            } else if ( execAsap ) {
                // Execute immediately if 'execAsap' is true and no timeout is active.
                func.apply( obj , args );
            }

            // Set a new timeout to call the 'delayed' function.
            timeout = setTimeout( delayed , threshold || 200 ); // Default threshold is 200ms.
        };
    };


    // End of the main ad initialization script.
    // Any debugging or testing outputs would typically go here.


} )( this );