/*
 * This file is based on code originally developed by Steve Faulkner in 2003/2004.
 * It primarily deals with analyzing HTML headings and frames.
 */
/* File: Headings.js - Main script for heading analysis. */

function main()
{

    /*
     * NEW SECTION, May 2014: This function was introduced to correctly
     * handle elements that are hidden via 'display: none' in their
     * CSS properties or inherited styles.
     * It prevents counting such hidden elements as valid headings.
     */
    function check_parents ( element )
    {
        // This function returns 'false' if 'display: none' is found
        // anywhere in the element's direct or ancestral hierarchy.
        var vis = false;
        var par = element;

        // Uncomment the line below for debugging parent element values.
        // alert("par is " + par + " and element is " + element);

        while ( par )
        {
            // Ensure 'par' is a valid object before attempting property access.
            if ( par != '[object]' )
            {
                // Debugging line: alert('par is ' + par);

                // Attempt to get the computed style for 'display'.
                // Note: currentStyle is an IE-specific property.
                var dis = par . currentStyle . getPropertyValue ( 'display' ) ;

                // Debugging line: alert("dis returned is " + dis);

                // If 'display' is 'none', the element is not visible.
                if ( dis == 'none' )
                {
                    par = false; // Terminate the loop.
                    vis = true;  // Mark as not visible.
                }
                else
                {
                    // Move up to the next parent in the DOM tree.
                    // The loop should stop before reaching the Document object,
                    // as attempting to access 'currentStyle' on it might fail.
                    par = par . parentNode;

                    // Debugging line: alert("par is " + Object.prototype.toString(par));

                    // Check if the current parent is the Document or HTMLDocument object.
                    // If so, we've reached the top of the relevant hierarchy.
                    if ( ( par == '[object Document]' ) || ( par == '[object HTMLDocument]' ) )
                    {
                        par = false; // Terminate the loop.
                        vis = false; // Element is considered visible (no 'none' found).
                    }
                }
            }
            else
            {
                // This block handles cases where 'par' might not be a standard DOM object,
                // or if it's an attribute node etc.
                // The original commented-out block is restored and then modified.
                /*
                {
                    par=false;
                    vis = false;
                }
                */

                // If 'par' has a 'style' property, it's likely a valid element.
                if ( par . style )
                {
                    // Debugging line: d.document.write("<p>type is " + par.nodeType + " </p>\n\n");

                    // Directly check the 'display' attribute on the style object.
                    // This might be more robust for some browser/element types.
                    if ( par . style . getAttribute ( 'display' ) == 'none' )
                    {
                        par = false; // Terminate loop.
                        vis = true;  // Mark as not visible.
                    }
                    par = par . parentNode; // Move to the next parent.
                }
                else
                {
                    // If no 'style' property, assume it's not a relevant element
                    // for 'display: none' checks, or we've reached the top.
                    par = false; // Terminate loop.
                    vis = false; // Element is considered visible.
                }
            }
        }
        return vis; // Return the visibility status.
    }
    // END OF NEW SECTION, May 2014 - 'display: none' check functionality.


    /*
     * FrameGuard Function:
     * This function checks for the presence of <frame> elements within the document.
     * If frames are found, it alerts the user and opens a new window displaying
     * details about each frame, including its name, title, and source URL.
     * It also checks for the 'title' attribute, which is important for accessibility.
     */
    function FrameGuard()
    {

        // Create a temporary 'var' element to detect IE7-specific attribute handling.
        var jt_generic_obj = document . createElement ( "var" ) ;
        var jt_ie7         = false;

        // If 'attributes.length' is greater than 0 on a newly created element,
        // it suggests an IE7-like attribute collection behavior.
        if ( jt_generic_obj . attributes . length > 0 )
        {
            jt_ie7 = true;
        }

        // HTML snippet for an error message when a title attribute is missing.
        var error = "<span style=\'color:red;font: bold;\'><strong> Error no title attribute</strong></span>";
        var tag   = 'frame'; // The HTML tag name we are searching for.

        // Retrieve all elements with the tag name 'frame'.
        t = document . getElementsByTagName ( tag ) ;

        // If no frames are found, the function returns true, allowing other checks to proceed.
        if ( t . length == 0 )
        {
            return true;
        }
        else
        {
            // Alert the user about the number of frames found.
            alert ( 'Found ' + t . length + ' frames\rCheck out list of frames that opens next.' ) ;

            var s = ''; // Initialize an empty string to build the report.
            s += '<p>This is a Frame site consiting of ' + t . length + ' frames.<br>\r';
            s += 'Check the  required title attributes of the frames for appropriateness.<br>\r';
            s += '<ul>\r';

            // Debugging line: // alert('boo');

            // Iterate through each found frame element.
            for ( i = 0 ; i < t . length ; i ++ )
            {

                var titletext = ''; // Variable to hold the frame's title.

                // Determine if the 'title' attribute is specified,
                // handling differences between IE7 and modern browsers.
                if ( ( jt_ie7 && t [ i ] . attributes . title . specified ) || ( ! ( jt_ie7 ) && t [ i ] . hasAttribute ( 'title' ) ) )
                {
                    titletext = t [ i ] . title;
                }
                else
                {
                    titletext = error; // Assign the error message if title is missing.
                }

                s += '<li>';
                s += tag + '-' + ( i + 1 ) + '</li>\r';
                s += '\t<ul>\r\t\t<li> Name (' + t [ i ] . name + ')</li>\r';
                s += '\t\t<li>Title (' + titletext + ')</li>\r';
                s += '\t\t<li>Src (<a href=\"' + t [ i ] . src + '\">' + t [ i ] . src + '</a>)</li>\r';
                s += '\t</ul>\r';
            }
            s += '</ul>\r';

            // Debugging line: // alert( s);

            // Open a new popup window to display the frame report.
            var lw = window . open ( '' , 'lw' ) ;
            if ( lw != null )
            {
                lw . document . open ( ) ;
                lw . document . write ( s ) ;
                lw . document . close ( ) ;
            }
            else
            {
                // Alert if the popup window was blocked by the browser.
                alert ( 'Popup windows for frame list blocked' ) ;
            }

            return false; // Frames were found and processed, so return false.
        }

    } // End of FrameGuard function.


    /*
     * heading Function:
     * This is the core function for analyzing HTML heading elements (h1-h6).
     * It counts headings, checks for display:none and empty text content,
     * and visually highlights them on the page while providing a summary alert.
     */
    function heading ( )
    {

        var z           = 0,
            tag         = new Array ( 'h1' , 'h2' , 'h3' , 'h4' , 'h5' , 'h6' ) ;
        var count       = new Array ( 0 , 0 , 0 , 0 , 0 , 0 ) ;
        var msg         = '';

        // NEW SECTION, May 2014: Variables to track specific heading conditions.
        var non_heading = 0; // Counts headings with 'display: none'.
        var non_text    = 0; // Counts headings with empty innerHTML.

        // Only proceed with heading analysis if no frames were found (or if FrameGuard returned true).
        if ( FrameGuard ( ) )
        {
            // Loop through each heading tag type (h1 to h6).
            for ( n = 0 ; n < tag . length ; n ++ )
            {

                // Get all elements for the current heading tag.
                t = document . getElementsByTagName ( tag [ n ] ) ;
                count [ n ] = t . length; // Store the initial count for this tag.

                // Debugging lines:
                // alert("count of " + tag[n] + " is " + count[n]);
                // alert("t is " + t + " and t.length is " + t.length); // t.length is how many headings found at each particular level
                // alert( t.length);

                /*
                 * NEW SUB-SECTION, May 2014: Filtering out headings with 'display:none'.
                 * This loop iterates through the found headings of the current type.
                 */
                for ( i = 0 ; i < t . length ; i ++ )
                {
                    // Check if the current heading element or any of its parents has 'display: none'.
                    if ( check_parents ( t [ i ] ) )
                    {
                        // Debugging: alert ('none found on element' + t[i].innerHTML);
                        // If 'display: none' is found, increment the non_heading counter.
                        non_heading ++;
                        // Decrement the count for this specific heading type if it's not already zero.
                        if ( count [ n ] != 0 )
                        {
                            count [ n ] --;
                        }
                        // Debugging: alert ('count is ' + count[n]);
                    }
                }
                // END OF NEW SUB-SECTION, May 2014: 'display: none' check.

                // Accumulate the total count of *visible* headings.
                z = z + count [ n ] ;
                // Debugging: alert ("z is " + z);

                // If visible headings of the current type are found, process them.
                if ( count [ n ] > 0 )
                {
                    // Append the count of this heading type to the message string.
                    msg = msg + '; ' + count [ n ] + ' h' + ( n + 1 ) ;
                    // Debugging: alert( msg); // msg is built on the fly as each 'h' is found

                    // Iterate through all headings of the current type *again*
                    // to modify their innerHTML for visual highlighting.
                    // This loop still processes all original 't.length' elements,
                    // but the `if (check_parents(t[i]))` above ensures `count[n]` is accurate.
                    for ( i = 0 ; i < t . length ; i ++ )
                    {
                        var h;
                        // Debugging: // alert( t[i].style);
                        h = t [ i ] . innerHTML;

                        try
                        {
                            // Wrap the heading's content with styling to make it visible and distinct.
                            void ( t [ i ] . innerHTML = '<span style=\'color:navy;font:small bold;background-color:#f5deb3\'><strong>&lt; ' + tag [ n ] + '&gt; </strong></span> ' + h + '<span style=\'color:navy;font:small bold;background-color:#f5deb3\'><strong>&lt;/' + tag [ n ] + '&gt; </strong></span> ' ) ;
                        }
                        catch ( e )
                        {
                            // Catch and ignore potential errors during innerHTML manipulation.
                            // alert(e);
                        }

                        // Original commented-out code, not used for final 'z' count.
                        // if (h!='')
                        //    z=z+1;

                        // NEW SECTION, May 2014: Check for headings with empty text content.
                        if ( h == '' )
                        {
                            non_text ++; // Increment counter for headings without text.
                        }
                    }
                }
            } // End of loop for heading tags.

            // Debugging: // alert( 'boo');

            // After processing all heading types, display the final summary.
            if ( z == 0 ) // z = total number of *visible* headings found.
            {
                alert ( 'No Heading Elements Used' ) ;
            }
            else
            {
                // NEW SECTION, May 2014: Enhanced alert messages based on hidden/empty headings.
                if ( ( non_heading == 0 ) && ( non_text == 0 ) )
                {
                    alert ( z + ' Headings' + msg ) ;
                }
                else if ( ( non_heading != 0 ) && ( non_text == 0 ) )
                {
                    alert ( z + ' Headings' + msg + ", (display:none " + non_heading + " headings)" ) ;
                }
                else if ( ( non_heading == 0 ) && ( non_text != 0 ) )
                {
                    alert ( z + ' Headings' + msg + ", ( " + non_text + " headings without text)" ) ;
                }
                else
                {
                    alert ( z + ' Headings' + msg + ", (display:none " + non_heading + " headings, including " + non_text + " headings without text)" ) ;
                }
            }
        }
    } // End of heading function.


    // Execute the main heading analysis function when `main` is called.
    heading ( ) ;

} // End of main function.