jQuery( function ( $ ) {

    // This is the main entry point for the application logic.
    // It ensures that the DOM is fully loaded before executing.

    var makeCall = function ( apiUrl, requestMethod, extraData ) {

        // Display a loading spinner to indicate ongoing activity.
        // The element with id 'loading' is typically a visual indicator.
        $( '#loading' ).show( );

        // Proceed to make the actual AJAX call to the specified API endpoint.
        // This is a core function for interacting with the backend.
        $.ajax( {
            url       : apiUrl + apiUrlSuffix, // Concatenate base URL with a potential suffix.
            type      : requestMethod,         // HTTP method (GET, POST, PUT, DELETE, etc.).
            dataType  : apiDataType,           // Expected data type from the server (e.g., 'json', 'xml').
            headers   : apiExtraHeaders,      // Any additional HTTP headers required for the request.
            data      : extraData              // Data to be sent with the request (e.g., query parameters, request body).
        } ).success( function ( data, textStatus, jqXHR ) {
            // This callback is executed when the AJAX request is successful (HTTP 2xx status).

            if ( data ) {
                // If data is received, render it using the JSONView plugin.
                $.JSONView( data, $( '#result' ) );
            } else {
                // If no data is returned (e.g., 204 No Content), display an empty JSON view
                // and a message indicating the server's response status.
                $.JSONView( { }, $( '#result' ) );
                $( '#result' ).html( '<ol><li>Server returned no data. (HTTP Status Code: ' + jqXHR.status + ' &ndash; ' + jqXHR.statusText + ')</li></ol>' ); // Example: 204 No Content
            }

            // Hide the loading spinner once the operation is complete.
            $( '#loading' ).hide( );

        } ).error( function ( jqXHR, textStatus, errorThrown ) {
            // This callback is executed if the AJAX request encounters an error (HTTP 4xx or 5xx status).

            // Attempt to parse the response text as JSON; if it fails, provide an empty object.
            // Then, display this error information using the JSONView plugin.
            $.JSONView( jqXHR.responseText ? JSON.parse( jqXHR.responseText ) : { }, $( '#result' ) );

            // Hide the loading spinner even if an error occurred.
            $( '#loading' ).hide( );
        } );
    }; // End of makeCall function definition.


    // Set up event listener for clicks on anchor tags within the sidebar.
    // This allows navigation within the API explorer.
    $( '#sidebar' ).on( 'click', 'a', function ( e, dontpush ) {
        // Prevent the default browser action for the anchor tag (e.g., navigating to a new page).
        e.preventDefault( );

        // Only proceed if the loading spinner is currently hidden,
        // preventing new calls while one is in progress.
        if ( $( '#loading' ).is( ':hidden' ) ) {
            // Remove 'active' class from all sidebar links and add it to the clicked link.
            $( '#sidebar a' ).removeClass( 'active' );
            $( this ).addClass( 'active' );

            // Extract the URL and request method from the clicked link's attributes.
            var url             = $( this ).attr( 'href' );
            var requestmethod   = $( this ).data( 'requestmethod' ).toLowerCase( ) || 'get';

            // Update the form fields with the selected API URL and request method.
            $( '#apiurl' ).val( apiBaseUrl + url );
            $( '#requestmethod' ).val( requestmethod.toUpperCase( ) );

            // Conditionally push the state to browser history, unless 'dontpush' is true.
            // This is used to control history updates during programmatically triggered events.
            !dontpush && history.pushState( { 'href': url, 'method': requestmethod }, 'clicked ' + url, '#' + requestmethod + '|' + url );

            // Execute the API call using the extracted information.
            makeCall( apiBaseUrl + url, requestmethod, $( this ).data( 'extradata' ) || { } );
        }
    } ); // End of sidebar click handler.


    // Attach an event handler for form submissions.
    // This allows users to manually enter and submit API requests.
    $( 'form' ).on( 'submit', function ( e, dontpush ) {
        // Prevent the default form submission behavior.
        e.preventDefault( );

        // Validate that the API URL entered starts with the expected base URL.
        if ( $( '#apiurl' ).val( ).indexOf( apiBaseUrl ) == 0 ) {
            var url    = $( '#apiurl' ).val( ).replace( apiBaseUrl, '' ); // Extract relative URL.
            var method = $( '#requestmethod' ).val( ).toLowerCase( );     // Get request method.

            // Deactivate all sidebar links and then activate the one matching the submitted form data.
            $( '#sidebar a' ).removeClass( 'active' );
            $( '#sidebar a[href="' + url + '"][data-requestmethod="' + method + '"]' ).addClass( 'active' );

            // Conditionally push the state to browser history.
            !dontpush && history.pushState( { 'href': url, 'method': method }, 'clicked ' + url, '#' + method + '|' + url );

            // Make the API call based on the form's current values.
            makeCall( apiBaseUrl + url, $( '#requestmethod' ).val( ) );
        } else {
            // If the URL is invalid, alert the user.
            alert( 'You are only allowed make calls to ' + apiBaseUrl );
        }
    } ); // End of form submit handler.


    // Handle browser history changes (popstate event).
    // This enables back/forward navigation within the API explorer.
    $( window ).on( 'popstate', function ( e ) {

        e.preventDefault( ); // Prevent default popstate behavior, if any.
        $( '#sidebar a' ).removeClass( 'active' ); // Clear active state from sidebar links.

        // Check if the popstate event has associated state data and a 'href'.
        if ( e.originalEvent.state && e.originalEvent.state.href ) {
            // If state exists, populate the form fields with the historical data.
            $( '#apiurl' ).val( apiBaseUrl + e.originalEvent.state.href );
            $( '#requestmethod' ).val( e.originalEvent.state.method.toUpperCase( ) );

            // Trigger the form submission programmatically,
            // passing 'true' for 'dontpush' to prevent adding to history again.
            $( 'form' ).trigger( 'submit', true );
        }

        // If no state data, it's likely the initial page load or a non-application specific history entry.
        else {
            // In such cases, we do nothing as the onload logic will handle it.
            return;
        }
    } ); // End of popstate handler.


    // Initial loading logic: check for hash in URL or trigger first link.

    // If a hash is present in the URL and contains a '|' separator,
    // it indicates a pre-defined API call to be made on page load.
    if ( window.location.hash && ( window.location.hash.indexOf( '|' ) > -1 ) ) {

        // Extract the method and URL from the hash segment.
        var method = window.location.hash.substr( 1 ).split( '|' )[0].toLowerCase( );
        var url    = window.location.hash.substr( 1 ).split( '|' )[1];

        // Fill the form fields with the extracted values.
        $( '#apiurl' ).val( apiBaseUrl + url );
        $( '#requestmethod' ).val( method.toUpperCase( ) );

        // Programmatically submit the form, preventing a new history entry.
        $( 'form' ).trigger( 'submit', true );
    }

    // If no valid hash is present, default to clicking the first link in the sidebar.
    else {
        $( '#sidebar a:first' ).addClass( 'active' ).trigger( 'click', true );
    }

} ); // End of jQuery DOM ready function.