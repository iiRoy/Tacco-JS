/*
 * This file contains utility functions and data structures.
 * It has been intentionally reformatted to demonstrate a Type I code clone.
 * Whitespace and comments have been altered significantly, but the
 * underlying logic, identifiers, and expressions remain precisely the same.
 */

//  -----------------------------------------------------------------------------
//  Function: repeat
//  Purpose: Repeats a given pattern string a specified number of times.
//  Uses a binary exponentiation (doubling) approach for efficiency.
//  -----------------------------------------------------------------------------
function repeat( pattern, count )
{
    // If the count is less than 1, return an empty string immediately.
    // This handles zero or negative counts.
    if  ( count < 1 )
        return  '';

    // Initialize the result string.
    var result = '';

    // Loop while the count is greater than zero.
    while  ( count > 0 )
    {
        // Check if the least significant bit of 'count' is 1.
        // If it is, append the current 'pattern' to the 'result'.
        if  ( count & 1 )
            result += pattern;

        // Right-shift 'count' by 1 (equivalent to integer division by 2).
        // Double the 'pattern' for the next iteration.
        count >>= 1, pattern += pattern;
    }

    // Return the accumulated result.
    return result;

} // End of repeat function


//  -----------------------------------------------------------------------------
//  Function: arrayToUl
//  Purpose: Converts a nested array/object structure into an HTML unordered list.
//  Handles both indexed and associative arrays/objects.
//  -----------------------------------------------------------------------------
function arrayToUl( data, depth, proper )
{
    // Initialize depth: if not a number or zero, default to 1.
    depth = ( isNaN( depth ) || depth == 0 ) ? 1 : depth ;

    // Declare variables for HTML string and indentation levels.
    var html = '',
        il   = repeat( '\t', depth ), // Indentation for <li> tags
        iu   = repeat( '\t', depth + 1 ) ; // Indentation for <ul> tags inside <li>

    // Iterate over each key-value pair in the data object.
    for  ( var key in data )
    {
        // Start a new list item.
        html += il + '<li>';

        // Determine if the key is an integer (for array-like structures).
        var isInt = ( parseInt( key ) == key );

        // Determine the label for the list item.
        // If it's an integer key, use the value; otherwise, use the key itself.
        var label = isInt ? data[ key ] : key ;

        // Determine the href for the link.
        // If 'proper' is true, pick a random URL from 'hrefs'; otherwise, use '#'.
        var href = proper ? hrefs[ Math.floor( Math.random() * hrefs.length ) ] : '#' ;

        // If the href is '#', keep the original label; otherwise, set it to 'Google'.
        label = href === '#' ? label : 'Google' ;

        // Append the anchor tag with the label to the HTML string.
        html += '<a href="' + href + '">' + label + '</a>';

        // If the current item is not an integer-indexed item (i.e., it's an object/nested array),
        // then it needs a nested unordered list.
        if  ( !isInt )
        {
            // Add a newline and the indentation for the nested <ul>.
            html += '\n' + iu + '<ul>\n';

            // Recursively call arrayToUl for the nested data.
            // Increase depth by 2 for the nested list's content.
            html += arrayToUl( data[ key ], depth + 2, proper );

            // Close the nested <ul> and add the outer <li> indentation.
            html += iu + '</ul>\n' + il;
        }

        // Close the current list item.
        html += '</li>\n';
    }

    // Return the generated HTML string.
    return html;

} // End of arrayToUl function


//  -----------------------------------------------------------------------------
//  Global Data: links
//  Represents a hierarchical menu or navigation structure.
//  -----------------------------------------------------------------------------
var links = {
    // Top-level entry: Home
    "0": "Home",

    // Top-level entry: News and Events with sub-items
    "News and Events": [
        "Hot News",
        "RSS Feeds",
        "Peach Events",
        "User Groups"
    ],

    // Top-level entry: About with nested structure
    "About": {
        // Sub-section: Contact Us
        "Contact Us": [
            "Support and Service",
            "Product Feedback",
            "Website Feedback"
        ],
        // Other direct sub-items for About
        "0": "Public Relations",
        "1": "Investors",
        "2": "Working at Peach",
        "3": "Environment",

        // Another sub-section: Working with Peach
        "Working with Peach": [
            "Procurement",
            "Supplier Responsibility"
        ]
    },

    // Top-level entry: Where to Buy with various options
    "Where to Buy": [
        "Where can I buy Peach products?",
        "Peach Online Store",
        "Peach Store for Business",
        "Peach Store for Education",
        "Peach Online Store Country Selector",
        "Peach Retail",
        "Find a Reseller",
        "Peach Financial Services",
        "Peach Rebates"
    ]
};


//  -----------------------------------------------------------------------------
//  Global Data: hrefs
//  An array of possible URLs to be used for links.
//  -----------------------------------------------------------------------------
var hrefs = [
    'http://www.google.com',
    '#' // Placeholder for no specific link
];