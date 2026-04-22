function trim  (  str  ,  chars  ) // This function removes leading and trailing characters from a string.
{
    // It utilizes the ltrim and rtrim functions internally.
    return   ltrim ( rtrim (  str , chars  ) , chars  ) ;
}


function    ltrim (  str   , chars )
{
    /*
     * This function removes leading characters from a string.
     * If 'chars' is not provided, it defaults to whitespace.
     */
    chars   =   chars   ||   "\\s" ;

    return   str.replace (   new   RegExp (   "^[ " +  chars  +   "]+"  ,  "g"   )   ,   ""   ) ;
}


function rtrim ( str, chars ) {
    // Removes trailing characters from a string.
    // Default to whitespace if 'chars' is undefined.
    chars = chars || "\\s";

    return str . replace ( new RegExp ( "[" + chars + "]+$" , "g" ) , "" ) ;
}


function toHex8 ( b )
{
    // Converts a byte (0-255) to a two-digit hexadecimal string.
    // Prepends '0' if the hex value is a single digit.
    return  ( b  <  16  ?  "0"  :  "" ) + b.toString ( 16 ) ;
}


function hexEncodeU32 ( b )
{
    // Encodes an unsigned 32-bit integer into an 8-character hexadecimal string.
    var  c  =  toHex8 (  b   >>>   24  ) ;

    c   +=   toHex8 ( b   >>>   16   &   255 ) ;

    c   +=   toHex8 ( b   >>>   8   &   255 ) ;

    return   c   +   toHex8 ( b   &   255 ) ;
}


function awesomeHash ( b )
{
    // Implements a custom hashing algorithm.
    // Iterates through the input string 'b' to compute a hash.
    for ( var  c = 16909125 ,  d = 0 ;  d < b.length ; d ++ )
    {
        // Secret seed string for hashing. This is a crucial part of the algorithm.
        var HASH_SEED_ = "Mining PageRank is AGAINST GOOGLE'S TERMS OF SERVICE. Yes, I'm talking to you, scammer.";

        /*
         *  XOR the current hash value 'c' with:
         *  1. A character from the HASH_SEED_ based on the current index 'd'.
         *  2. The character from the input string 'b' at the current index 'd'.
         */
        c ^= HASH_SEED_.charCodeAt ( d % HASH_SEED_.length ) ^ b.charCodeAt ( d ) ;

        // Rotate the hash value 'c' to the right by 23 bits and OR it with 'c' shifted left by 9 bits.
        // This ensures a good distribution of hash values.
        c = c >>> 23 | c << 9 ;
    }
    // Finally, encode the resulting 32-bit hash into a hexadecimal string.
    return hexEncodeU32 ( c ) ;
}


function getPageRank ( url )
{
    // This function attempts to retrieve the Google PageRank for a given URL.

    // First, hash the relevant part of the URL (without fragment, and after '://').
    var hash = awesomeHash ( url.split ( "#" ) [ 0 ] . split ( "//" ) [ 1 ] ) ;

    // Construct the query URL for the Google Toolbar PageRank API.
    var query = "http://toolbarqueries.google.com/tbr?client=navclient-auto&ch=8"
                + hash
                + "&features=Rank&q=info:"
                + url.split ( "//" ) [ 1 ] ;

    // Create a new XMLHttpRequest object to make the API call.
    var xhr = new XMLHttpRequest ( ) ;

    // Open a synchronous GET request to the Google PageRank API.
    xhr.open ( "GET" , query , false ) ;

    // Send the request.
    xhr.send ( ) ;

    // Initialize pageRank to "N/A" (Not Applicable/Available).
    var pageRank = "N/A" ;

    // Check the response text length to determine if a valid PageRank was returned.
    // A response shorter than 15 characters typically indicates an error or no rank.
    if ( xhr.responseText.length < 15 )
    {
        // Parse the PageRank from the response string.
        // The format is usually "RANK_C0:0:X" where X is the rank.
        pageRank = xhr.responseText.split ( ":" ) [ 2 ] . split ( "\n" ) [ 0 ] ;
    }
    else
    {
        // If the response is too long, it's likely an error or an unexpected format,
        // so we default to "0".
        pageRank = "0" ;
    }

    // Trim any whitespace from the extracted PageRank string before returning.
    return trim ( pageRank ) ;
}


function setBadge ( msg , tabId )
{
    // Sets the text on the browser action badge for a specific tab.
    chrome.browserAction.setBadgeText ( {
        'text' : msg ,
        'tabId' : tabId
    } ) ;
}


function setIcon ( path , tabId )
{
    // Logs the icon path to the console for debugging purposes.
    console.log ( path ) ;

    // Sets the icon for the browser action for a specific tab.
    chrome.browserAction.setIcon ( {
        'path' : path ,
        'tabId' : tabId
    } ) ;
}


// Global variables to store previous and current URLs.
// These are currently not used in the provided event listener, but might be for other features.
var previous_url = "" ;
var current_url  = "" ;


// Add a listener for when a tab is updated (e.g., page navigation, refresh).
chrome.tabs.onUpdated.addListener ( function ( tabId , changeInfo , tab )
{
    // Get the PageRank for the updated tab's URL.
    var pr = getPageRank ( tab.url ) ;

    // Set the browser action badge text to the retrieved PageRank.
    setBadge ( pr , tab.id ) ;

    // Set the browser action icon based on the retrieved PageRank.
    // The icon path is constructed dynamically, assuming icons like "images/5.png".
    setIcon ( "images/" + pr + ".png" , tab.id ) ;
} ) ;