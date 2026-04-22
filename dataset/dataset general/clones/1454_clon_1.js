/*
 * This script is responsible for highlighting the currently active navigation item.
 * It identifies the current page's URL and matches it against the navigation links.
 */

// Retrieve all 'a' (anchor) elements within the 'navigation' div.
var    nav_items    =    document.getElementById(   'navigation'   )   .getElementsByTagName(   'a'   )   ;


// Extract the relevant part of the current URL (e.g., "about" from "http://example.com/about/").
// This regex captures the last path segment before a potential hash.
var stripped_url = document.location.href.match( /([^\/]+)\/(#.+)?$/ )[1]   ;


// Loop through each navigation item to find a match.
for   (   var   i   =   0   ;   i   <   nav_items.length   ;   i++   )
{
    // For each navigation item, extract its slug (e.g., "contact" from "http://example.com/contact/").
    var   slug   =   nav_items[   i   ]   .href.match(   /([^\/]+)\/$/   )   ;

    // Determine the stripped href based on whether a slug was found.
    var   stripped_href   =   (   slug   )   ?   slug[1]   :   ''   ;

    // Check if the current page's URL matches the navigation item's URL.
    if   (   stripped_url   ==   stripped_href   )
    {
        // If there's a match, set the parent node's class to 'selected'.
        nav_items[   i   ]   .parentNode.className   =   'selected'   ;

        // Insert a Unicode right-pointing double angle quotation mark (») before the matched item.
        nav_items[   i   ]   .parentNode.insertBefore(   document.createTextNode(   "\u203a "   )   ,   nav_items[   i   ]   )   ;

        // Exit the loop as the active item has been found and marked.
        break   ;
    }
}
// End of navigation highlighting script.