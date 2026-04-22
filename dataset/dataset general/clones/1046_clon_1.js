/* This file contains the core logic for the browser extension's
 * primary functionality. It listens for clicks on the browser action icon
 * and injects a dynamic bookmarklet-like script into the current tab.
 */

// Register a listener for when the browser action (extension icon) is clicked.
chrome . browserAction . onClicked . addListener (

  function ( tab ) { // The 'tab' object provides context about the current tab.

    // Declare a variable to hold the URL of our custom JavaScript file.
    // This file is loaded from within the extension's package.
    var sp_url = chrome . extension . getURL ( "savepublishing.js" ) ;

    // Construct the full JavaScript bookmarklet string.
    // This string is a self-executing anonymous function (IIFE)
    // that handles dynamic script loading (jQuery, jQuery UI, Twitter widgets, and our script).
    var action_url
      =   "javascript:"                                                                                                                   // Standard bookmarklet prefix.
      +   "(function(e,a,g,h,f,c,b,d){"                                                                                                      // IIFE start. Parameters are for minified script loaders.
      +       "if(!(f=e.jQuery)||g>f.fn.jquery||h(f)){"                                                                                     // Check for jQuery existence and version.
      +           "c=a.createElement('script');"                                                                                           // Create a new script element.
      +           "c.type='text/javascript';"                                                                                               // Set script type.
      +           "c.src='//ajax.googleapis.com/ajax/libs/jquery/'+g+'/jquery.min.js';"                                                    // Load jQuery from Google CDN.
      +           "c.onload=c.onreadystatechange=function(){"                                                                               // Event handlers for script loading.
      +               "if(!b&&(!(d=this.readyState)||d=='loaded'||d=='complete')){"                                                        // Check script load status.
      +                   "h((f=e.jQuery).noConflict(1),b=1);"                                                                              // Execute callback with jQuery, handling noconflict.
      +                   "f(c).remove()"                                                                                                   // Remove the temporary script element.
      +               "}"
      +           "};"
      +           "a.body.appendChild(c);"                                                                                                  // Append jQuery script to body.
      +       "}"
      +   "})"                                                                                                                              // End of jQuery loader IIFE.
      +   "(window,document,'1.8.3',function($,L){"                                                                                         // Call jQuery loader IIFE with window, document, version, and main callback.
      +       "y=document.createElement('script');"                                                                                        // Create script for Twitter widgets.
      +       "y.type='text/javascript';"
      +       "y.src='//platform.twitter.com/widgets.js';"
      +       "z=document.createElement('script');"                                                                                        // Create script for jQuery UI.
      +       "z.type='text/javascript';"
      +       "z.src='//ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min.js';"
      +       "x=document.createElement('script');"                                                                                        // Create script for our extension's custom logic.
      +       "x.type='text/javascript';"
      +       "x.src='" + sp_url + "';"                                                                                                    // Set source to our locally hosted script.
      +       "window.JQ=$;window.jQuery=$;"                                                                                                // Ensure jQuery is available globally under JQ and jQuery.
      +       "document.body.appendChild(y);"                                                                                               // Append Twitter script.
      +       "document.body.appendChild(z);"                                                                                               // Append jQuery UI script.
      +       "document.body.appendChild(x);"                                                                                               // Append our custom script.
      +   "});"                                                                                                                             // End of main callback for bookmarklet.
      ; // Termination of 'action_url' variable assignment.


    // Finally, update the current tab's URL.
    // This effectively executes the constructed JavaScript string as if it were a bookmarklet.
    chrome . tabs . update ( tab . id , { url : action_url } ) ;

  } // End of the anonymous function passed to addListener.

) ; // Final closing parenthesis and semicolon for the addListener call.