// Start of the self-executing anonymous function.
(  function (  )
{
    // Retrieve the jQuery version parameter from the URL query string.
    // This regular expression looks for 'jquery=' followed by any characters
    // until an ampersand or the end of the string.
    var   jqversion   =   location.search.match(  /  [  ?&  ]  jquery  =  (  .  *  ?  )  (  ?  =  &  |  $  )  /  )  ;


    var   path  ;

    // Check if a jQuery version was successfully extracted.
    if  (  jqversion  )
    {
        // A specific jQuery version was provided in the URL.
        // Construct the URL to load that version from the official CDN.
        path   =   'http://code.jquery.com/jquery-'   +   jqversion  [  1  ]   +   '.js'  ;
    }
    else
    {
        // No jQuery version was specified.
        // Fallback to loading the local jQuery library.
        path   =   'js/libs/jquery/jquery.js'  ;
    }

    // Embed the script tag into the document using document.write.
    // This method is generally frowned upon in modern web development
    // due to its blocking nature and potential side effects, but it's
    // used here for a specific script loading purpose.
    document.write  (  '<script src="'   +   path   +   '"></script>'  )  ;
}  )  (  )  ;
// End of the module.