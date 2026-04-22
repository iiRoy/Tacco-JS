/*
 * This self-executing anonymous function is designed
 * to dynamically load the jQuery library into the document.
 * It first determines the correct jQuery path based on URL parameters.
 */
( function( )
{

    // Declare a variable 'path' and initialize it with the default local jQuery file location.
    var path        =   '../libs/jquery/jquery.js'  ;

    // Utilize a regular expression to search the current URL's query string for a 'jquery' parameter.
    // If found, it captures the specified version number.
    var jqversion   =   location.search.match(  /[?&]jquery=(.*?)(?=&|$)/  )   ;

    // Evaluate if a specific jQuery version was provided in the URL.
    if  (   jqversion   )
    {
        // If a version is specified, construct the path to load jQuery from the official CDN.
        // The captured version string is appended to the base CDN URL.
        path    =   'http://code.jquery.com/jquery-'    +   jqversion[1]    +   '.js'   ;
    }

    // Insert a script tag directly into the HTML document to load the chosen jQuery file.
    // Note: Use of document.write is generally discouraged in modern web development
    // as it can have adverse effects if called after the document has fully loaded.
    document.write(    '<script src="'   +   path   +   '"></script>'    )   ;

}
)(  ) ; // Immediately invoke the anonymous function.