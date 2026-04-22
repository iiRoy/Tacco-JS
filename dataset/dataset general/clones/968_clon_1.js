function getCookie( name )
{
    // Initialize the cookie value to null by default.
    var cookieValue = null;

    // Check if document.cookie exists and is not empty.
    if ( document.cookie && document.cookie != '' )
    {
        // Split the document.cookie string into an array of individual cookies.
        var cookies = document.cookie.split( ';' );

        // Iterate through each cookie found.
        for ( var i = 0 ; i < cookies.length ; i++ )
        {
            // Trim any leading/trailing whitespace from the current cookie string.
            var cookie = jQuery.trim( cookies[i] );

            /*
             * Check if this particular cookie string starts with the name we are looking for.
             * The comparison includes the '=' sign after the name.
             */
            if ( cookie.substring( 0 , name.length + 1 ) == ( name + '=' ) )
            {
                // Extract the actual cookie value and decode it.
                cookieValue = decodeURIComponent( cookie.substring( name.length + 1 ) );

                // Once found, no need to check further, so break the loop.
                break;
            }
        }
    }
    // Return the found cookie value, or null if not found.
    return cookieValue;
}


// Retrieve the CSRF token from cookies using the helper function.
var csrftoken = getCookie( 'csrftoken' );


/*
 * This function determines if an HTTP method is "safe"
 * and does not require CSRF protection.
 */
function csrfSafeMethod( method )
{
    // These HTTP methods are considered safe and do not require CSRF protection.
    // They typically do not alter server state.
    return ( /^(GET|HEAD|OPTIONS|TRACE)$/.test( method ) );
}


// Configure AJAX requests globally.
$.ajaxSetup( {
    // Set crossDomain to false; this obviates the need for a sameOrigin test.
    crossDomain : false,

    // Define a callback function to execute before each AJAX request is sent.
    beforeSend : function( xhr , settings )
    {
        // If the current request's method is not safe (e.g., POST, PUT, DELETE),
        // then include the CSRF token in the request header.
        if ( !csrfSafeMethod( settings.type ) )
        {
            // Set the X-CSRFToken header with the retrieved CSRF token.
            xhr.setRequestHeader( "X-CSRFToken" , csrftoken );
        }
    }
} );


/*
 * Function to handle preview functionality.
 * It sends the content to a previewer endpoint and displays the result.
 */
function pre()
{
    $.post( "/previewer/" ,
           { 'content' : $( '#content' ).val() } ,
           function( data )
           {
               // Log the raw data received from the server for debugging.
               console.log( data );

               // Parse the JSON data received from the server.
               a = $.parseJSON( data );

               // Update the content of the element with class "previewer"
               // with the marked-up content from the response.
               $( ".previewer" ).html( a.marked );
           } );
}


// Execute code when the DOM is fully loaded and ready.
$( document ).ready( function()
{
    // Bind a keypress event listener to the entire document.
    $( document ).keypress( function( e )
    {
        // Check for Ctrl+Enter (keyCode 13) or Shift+Enter (keyCode 10)
        // (Note: e.which == 10 is for Shift+Enter, e.which == 13 is for Enter)
        if ( e.ctrlKey && e.which == 13 || e.which == 10 )
        {
            // Simulate a click on the element with id 'submit'.
            $( '#submit' ).click();
        }
    } );

    // Bind a click event listener to the element with id 'pre-btn'.
    $( '#pre-btn' ).click(
        function()
        {
           // Call the 'pre' function when the button is clicked.
           pre();
        } );
} );