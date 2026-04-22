// This is the initial setup for the document.
// It ensures that the 'replaceLinks' function is called
// once the entire HTML document has been completely loaded and parsed.
document. addEventListener ( 'DOMContentLoaded' ,  function ( )  {
    // Call the function to set up link event listeners.
    replaceLinks ( ) ;

} ) ; // End of DOMContentLoaded event listener.


/*
 * Function: replaceLinks
 * Description: Finds all anchor tags on the page and attaches a click event listener
 *              to each one, preventing default navigation and handling it via AJAX.
 */
function replaceLinks ( )
{
    // Retrieve all 'a' (anchor) elements present in the document.
    var  links  =  document . querySelectorAll ( 'a' ) ;


    // Iterate through the collection of links.
    for  ( i = 0 ;  i < links . length ;  i ++ )
    {
        // Get the current link in the iteration.
        var  link  =  links [ i ] ;
        // Attach a click event listener to prevent default navigation and
        // call 'replacePage' for custom handling. The 'false' indicates
        // event bubbling phase.
        link . addEventListener ( "click" , replacePage ,  false ) ;
    }
} // End of replaceLinks function definition.


/**
 * Function: replacePage
 * Description: Handles the click event for a link, preventing default navigation.
 *              It fetches new page content via AJAX, applies a transition effect,
 *              and updates the page body.
 */
function  replacePage ( )
{
    // Prevent the browser's default behavior for the link click (i.e., navigating to the href).
    event . preventDefault ( ) ;

    // Capture the 'href' attribute of the clicked link (this refers to the element that triggered the event).
    var  href  =  this . href ;


    // Create a new XMLHttpRequest object to perform an AJAX request.
    var  ajax  =  new  XMLHttpRequest ( ) ;

    // Initialize the AJAX request:
    // "GET" method, the target URL (href), asynchronous request (true).
    ajax . open ( "GET" , href ,  true ) ;

    // Send the AJAX request.
    ajax . send ( ) ;


    // Define the callback function to be executed when the AJAX request's state changes.
    ajax . onreadystatechange  =  function ( )
    {
        // Check if the request is complete (readyState 4) and successful (status 200 OK).
        if  ( ajax . readyState  ==  4  &&  ( ajax . status  ==  200 ) )
        {
            // Get a reference to the <body> element of the current document.
            var  body  =  document . querySelector ( 'body' ) ;

            // Extract the content of the <body> tag from the AJAX response text.
            var  bodyContent  =   grabBody ( ajax . responseText ,  "body" ) ;

            // Add an event listener for the 'webkitTransitionEnd' event (for CSS transitions).
            // When the transition ends, call 'moveToRight'.
            body . addEventListener ( 'webkitTransitionEnd' ,  moveToRight ,  false ) ;

            // Start the transition by moving the body off-screen to the left.
            body . style . left  =  "-100%" ;

            // Add an event listener for the 'popstate' event, which fires when
            // the active history entry changes (e.g., browser back/forward buttons).
            window . addEventListener ( "popstate" ,  handleBackButton ) ;


            // --- Nested Function: moveToRight ---
            // This function is called when the first transition to the left completes.
            function  moveToRight ( event )
            {
                var  body  =  document . querySelector ( 'body' ) ;
                // Remove the current transition end listener to prevent multiple calls.
                body . removeEventListener ( 'webkitTransitionEnd' ,  moveToRight ,  false ) ;
                // Add a new listener for the next transition, which will bring content back to center.
                body . addEventListener ( 'webkitTransitionEnd' ,  returnToCenter ,  false ) ;
                // Fade out the body and move it off-screen to the right.
                body . style . opacity  =  0 ;
                body . style . left  =  "100%"
            } // End of moveToRight


            // --- Nested Function: returnToCenter ---
            // This function is called when the second transition (moving right) completes.
            function  returnToCenter ( event )
            {
                var  body  =  document . querySelector ( 'body' ) ;
                // Remove the 'returnToCenter' listener.
                body . removeEventListener ( 'webkitTransitionEnd' ,  returnToCenter ,  false ) ;
                // Update the inner HTML of the body with the new content fetched via AJAX.
                body . innerHTML  =  bodyContent ;
                // Add a new entry to the browser's history, allowing back/forward navigation.
                history . pushState ( null ,  null ,  href ) ;
                // Make the body visible and position it back in the center.
                body . style . opacity  =  1 ;
                body . style . left  =  0 ;
                // Re-initialize event listeners for new links in the updated body content.
                replaceLinks ( ) ;
            } // End of returnToCenter


            // --- Nested Function: handleBackButton ---
            // This function is triggered when the browser's back/forward button is used.
            function  handleBackButton ( e )
            {
                // Create another XMLHttpRequest for fetching content for back navigation.
                var  ajaxBack  =  new  XMLHttpRequest ( ) ;

                // Open a GET request for the current path (which is the previous page after popstate).
                ajaxBack . open ( "GET" , location . pathname ,  true ) ;
                // Send the request.
                ajaxBack . send ( ) ;

                // Define the callback for the back AJAX request.
                ajaxBack . onreadystatechange  =  function ( )
                {
                    // Get the body element.
                    var  bodyBack  =  document . querySelector ( 'body' ) ;
                    // Grab the body content from the back-navigated page.
                    var  bodyBackContent  =   grabBody ( ajaxBack . responseText ,  "body" ) ;
                    // Add a transition end listener for moving the body to the left.
                    bodyBack . addEventListener ( 'webkitTransitionEnd' ,  moveToLeft ,  false ) ;
                    // Start the transition by setting the body's left position.
                    bodyBack . style . left  =  "100%" ;


                    // --- Nested Function: backToCenter ---
                    // Called after the body has moved left and is ready to be replaced.
                    function  backToCenter ( event )
                    {
                        var  body  =  document . querySelector ( 'body' ) ;
                        // Remove the listener.
                        body . removeEventListener ( 'webkitTransitionEnd' ,  backToCenter ,  false ) ;
                        // Update body with content from the previous page.
                        body . innerHTML  =  bodyBackContent ;
                        // Make it visible and centered.
                        body . style . opacity  =  1 ;
                        body . style . left  =  0 ;
                        // Re-attach link handlers.
                        replaceLinks ( ) ;
                    } // End of backToCenter


                    // --- Nested Function: moveToLeft ---
                    // Called when the initial back transition starts.
                    function  moveToLeft ( event )
                    {
                        var  body  =  document . querySelector ( 'body' ) ;
                        // Remove the listener.
                        body . removeEventListener ( 'webkitTransitionEnd' ,  moveToLeft ,  false ) ;
                        // Add the next listener.
                        body . addEventListener ( 'webkitTransitionEnd' ,  backToCenter ,  false ) ;
                        // Fade out and move off-screen.
                        body . style . opacity  =  0 ;
                        body . style . left  =  "-100%"
                    } // End of moveToLeft
                } // End of ajaxBack.onreadystatechange
            } // End of handleBackButton
        } // End of if (ajax.readyState == 4 && ajax.status == 200)
    } // End of ajax.onreadystatechange
} // End of replacePage function


/*
 * Function: grabBody
 * Description: Parses an HTML string and extracts the content found within
 *              the <body> tags.
 * Parameters:
 *   html (string): The full HTML document as a string.
 * Returns:
 *   string: The inner HTML content of the <body> tag.
 */
function  grabBody ( html )
{
    // Find the starting position of the '<body' tag.
    var  tagStart  =  html . indexOf ( "<body" ) ;

    // Find the position of the closing '>' character after the '<body' tag,
    // and add 1 to get the actual start of the body content.
    var  start  =  html . indexOf ( ">" ,  tagStart )  +  1 ;

    // Find the starting position of the '</body>' closing tag, searching
    // from the 'start' position of the body content.
    var  end  =  html . indexOf ( "</body" ,  start ) ;

    // Extract and return the substring between the start and end markers.
    return  html . slice ( start ,  end ) ;
} // End of grabBody function.