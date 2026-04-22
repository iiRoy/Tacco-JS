function OneBit ( pluginPath ) { /* This is the main constructor function for the OneBit MP3 player.
                                                                           It initializes various properties and methods for the player instance. */

    // --- Object Variables Declaration Section ---

    // Path to the main SWF file for the player.
    // If no path is provided, it defaults to '1bit.swf'.
    this.pluginPath = pluginPath || '1bit.swf';

    // --- Style Configuration Options ---

    // Flag to indicate if a custom color is set for the player.
    // If false, color will be automatically determined.
    this.color = false;

    // Background color of the player. Defaults to white.
    this.background = '#FFFFFF';

    // Size of the player (width and height). If false, size is auto-calculated.
    this.playerSize = false;

    // Position of the player relative to the link ('before' or 'after').
    this.position = 'after';

    // Flag to enable or disable analytics tracking.
    this.analytics = false;


    // --- Semi-Internal Properties ---

    // CSS class name used for the player wrapper element.
    this.wrapperClass = 'onebit_mp3';


    // --- Internal State Variables ---

    // Counter for assigning unique IDs to player instances.
    this.playerCount = 1;

    // Minimum Flash Player version required.
    this.flashVersion = 9;


    // --- Core Methods Section ---

    /*
     * Method: specify
     * Description: Allows setting optional configuration parameters for the player.
     * Parameters:
     *   key   - The name of the option to set (e.g., "color", "background").
     *   value - The value to assign to the specified option.
     */
    this.specify = function ( key, value ) {

        // Check if the key is "color"
        if ( key == "color" ) {
            this.color = value; // Set the custom color
        }

        // Check if the key is "background"
        if ( key == "background" ) {
            this.background = value; // Set the custom background
        }

        // Check if the key is "playerSize"
        if ( key == "playerSize" ) {
            this.playerSize = value; // Set the custom player size
        }

        // Check if the key is "position"
        if ( key == "position" ) {
            this.position = value; // Set the player's position
        }

        // Check if the key is "analytics"
        if ( key == "analytics" ) {
            this.analytics = value; // Enable/disable analytics
        }

    };


    /*
     * Method: apply
     * Description: Iterates through elements matching a CSS selector and inserts an MP3 player for each.
     * Parameters:
     *   selector - A CSS selector string to find target links.
     */
    this.apply = function ( selector ) {

        // Retrieve all elements that match the given CSS selector.
        var links = this.getElementsBySelector( selector );

        // Loop through each found link element.
        for ( var i = 0; i < links.length; i++ ) {

            // --- Pre-insertion checks ---

            // If the link's parent already has the player wrapper class,
            // it means a player has already been applied. Skip to the next link.
            if ( this.hasClass( links[i].parentNode, this.wrapperClass ) ) {
                continue;
            }

            // Ensure that the link's href ends with '.mp3' to be considered a valid audio file.
            if ( links[i].href.substr( links[i].href.length - 4 ) != '.mp3' ) {
                continue; // Skip if not an MP3 link.
            }

            // If all checks pass, insert the player for the current link.
            this.insertPlayer( links[i] );
        }

    };


    /*
     * Method: insertPlayer
     * Description: Inserts the Flash MP3 player next to a given DOM element (link).
     * Parameters:
     *   elem - The DOM element (typically an <a> tag) for which to insert the player.
     */
    this.insertPlayer = function ( elem ) {

        // Determine player size if not explicitly set.
        if ( !this.playerSize ) {
            // Automatically set playerSize based on a percentage of the element's scroll height.
            this.autoPlayerSize = Math.floor( elem.scrollHeight * 0.65 );
        }

        // Determine player color if not explicitly set.
        if ( !this.color ) {

            // Attempt to get the foreground color from the element's computed style.
            this.autoColor = this.getStyle( elem, 'color' );

            // Flash player expects 6-digit hex codes. Convert 3-digit hex (e.g., #F00) to 6-digit (e.g., #FF0000).
            if ( this.autoColor.substr( 0, 1 ) == '#' && this.autoColor.length == 4 ) {
                this.autoColor = this.autoColor.substr( 0, 2 ) + '0' + this.autoColor.substr( 2, 1 ) + '0' + this.autoColor.substr( 3, 1 ) + '0';
            }

            // If the color is in RGB format (e.g., "rgb(255, 0, 0)"), convert it to hex.
            if ( this.autoColor.substr( 0, 1 ) != '#' ) {
                this.autoColor = this.autoColor.substr( 4, this.autoColor.indexOf( ')' ) - 4 );
                var rgbSplit = new Array();
                rgbSplit = this.autoColor.split( ', ' );
                // Convert RGB components to numbers and then to a hex string.
                this.autoColor = '#' + this.convertColor( Number( rgbSplit[2] ), Number( rgbSplit[1] ), Number( rgbSplit[0] ) );
            }
        }

        // Create a new span element to act as a wrapper for the link and the Flash player.
        var playerWrapper = document.createElement( 'span' );
        // Add the custom wrapper class to the newly created span.
        this.addClass( playerWrapper, this.wrapperClass );

        // Generate a unique ID for the Flash player's container.
        var hook_id = 'oneBitInsert_' + this.playerCount;
        var span = document.createElement( 'span' );
        // Assign the unique ID to this span, which will be targeted by SWFObject.
        span.setAttribute( 'id', hook_id );

        // --- DOM Manipulation to position elements ---

        // Insert the player wrapper before the original link element.
        elem.parentNode.insertBefore( playerWrapper, elem );

        // Determine the order of elements within the wrapper based on 'position' setting.
        if ( this.position == 'before' ) {
            // If position is 'before', the Flash player span comes first.
            playerWrapper.appendChild( span );
            playerWrapper.innerHTML += '&nbsp;'; // Add a non-breaking space for separation.
            playerWrapper.appendChild( elem ); // Then the original link.
        } else {
            // If position is 'after' (default), the original link comes first.
            playerWrapper.appendChild( elem );
            playerWrapper.innerHTML += '&nbsp;'; // Add a non-breaking space.
            playerWrapper.appendChild( span ); // Then the Flash player span.
        }

        // --- Prepare and insert the Flash player ---

        // Determine the final player size to be used.
        if ( !this.playerSize ) {
            this.insertPlayerSize = this.autoPlayerSize; // Use auto-calculated size.
        } else {
            this.insertPlayerSize = this.playerSize; // Use explicitly set size.
        }

        // Create a new SWFObject instance to embed the Flash player.
        var so = new SWFObject(
            this.pluginPath,        // Path to the SWF file.
            hook_id,                // ID of the HTML element where the SWF will be embedded.
            this.insertPlayerSize,  // Width of the player.
            this.insertPlayerSize,  // Height of the player.
            this.flashVersion,      // Required Flash Player version.
            this.background         // Background color of the Flash content.
        );

        // If the background is 'transparent', set the wmode parameter for transparency.
        if ( this.background == 'transparent' ) {
            so.addParam( 'wmode', 'transparent' );
        }

        // Set the foreground color variable for the Flash player.
        if ( !this.color ) {
            so.addVariable( 'foreColor', this.autoColor ); // Use auto-determined color.
        } else {
            so.addVariable( 'foreColor', this.color );     // Use custom color.
        }

        // Pass the analytics flag to the Flash player.
        so.addVariable( 'analytics', this.analytics );

        // Pass the URL of the MP3 file to the Flash player.
        so.addVariable( 'filename', elem.href );

        // Write the Flash content into the designated HTML element.
        so.write( hook_id );

        // Increment the player count for the next player instance.
        this.playerCount++;

    };


    /*
     * Method: getStyle
     * Description: Retrieves the computed style value for a given CSS property of an element.
     *              Based on http://www.quirksmode.org/dom/getstyles.html
     * Parameters:
     *   el        - The DOM element.
     *   styleProp - The CSS property name (e.g., 'color', 'font-size').
     * Returns:
     *   The computed style value as a string.
     */
    this.getStyle = function ( el, styleProp ) {

        var value; // Declare a variable to hold the style value.

        // For Internet Explorer (and older browsers)
        if ( el.currentStyle ) {
            value = el.currentStyle[styleProp];
        } else {
            // For modern browsers supporting W3C standard
            value = document.defaultView.getComputedStyle( el, null ).getPropertyValue( styleProp );
        }

        return value; // Return the obtained style value.
    };


    /*
     * Method: convertColor
     * Description: Converts RGB color components into a hexadecimal color string.
     * Parameters:
     *   red   - The red component (0-255).
     *   green - The green component (0-255).
     *   blue  - The blue component (0-255).
     * Returns:
     *   A hexadecimal color string (e.g., "FF0000" for red).
     */
    this.convertColor = function ( red, green, blue ) {
        // Combine RGB values into a single decimal number.
        var decColor = red + ( 256 * green ) + ( 65536 * blue );
        // Convert the decimal number to a hexadecimal string.
        return decColor.toString( 16 );
    };


    /*
     * Method: getElementsBySelector
     * Description: Finds DOM elements based on a CSS selector string.
     *              Supports tag, ID, class, and attribute selectors.
     *              V 1.00.A Beta - http://www.openjs.com/scripts/dom/css_selector/
     * Parameters:
     *   all_selectors - A string containing one or more CSS selectors, comma-separated.
     * Returns:
     *   An array of matching DOM elements.
     */
    this.getElementsBySelector = function ( all_selectors ) {

        var selected = new Array(); // Initialize an array to store found elements.

        // If document.getElementsByTagName is not supported, return an empty array.
        if ( !document.getElementsByTagName ) return selected;

        // Remove unnecessary whitespace around operators in the selector string.
        all_selectors = all_selectors.replace( /\s*([^\w])\s*/g, "$1" );

        // Split the combined selectors into individual selectors.
        var selectors = all_selectors.split( "," );

        /*
         * Helper Function: getElements
         * Description: Retrieves elements matching a tag name within a given context.
         * Parameters:
         *   context - An array of DOM elements to search within.
         *   tag     - The tag name to search for (e.g., 'div', 'a', or '*' for all).
         * Returns:
         *   An array of elements matching the tag within the context.
         */
        var getElements = function ( context, tag ) {
            if ( !tag ) tag = '*'; // Default tag to '*' if not specified.
            var found = new Array; // Array to store found elements.

            // Iterate through each element in the context.
            for ( var a = 0, len = context.length; con = context[a], a < len; a++ ) {
                var eles;
                // Get elements by tag name. If tag is '*', handle IE's 'all' collection.
                if ( tag == '*' ) eles = con.all ? con.all : con.getElementsByTagName( "*" );
                else eles = con.getElementsByTagName( tag );

                // Add all found elements to the 'found' array.
                for ( var b = 0, leng = eles.length; b < leng; b++ ) found.push( eles[b] );
            }
            return found; // Return the collected elements.
        };

        // --- Main Loop: Process Each Comma-Separated Selector ---
        COMMA:
        for ( var i = 0, len1 = selectors.length; selector = selectors[i], i < len1; i++ ) {

            var context = new Array( document ); // Start with 'document' as the initial context.
            var inheriters = selector.split( " " ); // Split selector into individual parts (e.g., "div #id .class").

            // --- Inner Loop: Process Each Space-Separated Inheriter (Contextual Selection) ---
            SPACE:
            for ( var j = 0, len2 = inheriters.length; element = inheriters[j], j < len2; j++ ) {

                // Check for ID selector (e.g., "div#myId").
                var left_bracket = element.indexOf( "[" );
                var right_bracket = element.indexOf( "]" );
                var pos = element.indexOf( "#" ); // Position of '#' character.

                // If '#' is found and it's not part of an attribute selector.
                if ( pos + 1 && !( pos > left_bracket && pos < right_bracket ) ) {
                    var parts = element.split( "#" );
                    var tag = parts[0]; // Tag name before the ID (can be empty).
                    var id = parts[1];  // The ID itself.
                    var ele = document.getElementById( id ); // Get element by ID.

                    // If element not found, or tag doesn't match the found element's tag.
                    if ( !ele || ( tag && ele.nodeName.toLowerCase() != tag ) ) {
                        continue COMMA; // Skip this entire comma-separated selector.
                    }

                    context = new Array( ele ); // Set the found element as the new context.
                    continue SPACE; // Move to the next inheriter.
                }

                // Check for Class selector (e.g., "p.myClass").
                pos = element.indexOf( "." ); // Position of '.' character.

                // If '.' is found and it's not part of an attribute selector.
                if ( pos + 1 && !( pos > left_bracket && pos < right_bracket ) ) {
                    var parts = element.split( '.' );
                    var tag = parts[0];       // Tag name before the class (can be empty).
                    var class_name = parts[1]; // The class name.

                    var found = getElements( context, tag ); // Get elements matching tag within current context.
                    context = new Array; // Reset context.

                    // Filter the found elements by class name.
                    for ( var l = 0, len = found.length; fnd = found[l], l < len; l++ ) {
                        // Use regex to check for the class name in the element's className property.
                        if ( fnd.className && fnd.className.match( new RegExp( '(^|\\s)' + class_name + '(\\s|$)' ) ) ) context.push( fnd );
                    }
                    continue SPACE; // Move to the next inheriter.
                }

                // Check for Attribute selectors (e.g., "input[type='text']").
                if ( element.indexOf( '[' ) + 1 ) { // If '[' character appears.

                    // Use regex to parse the attribute selector components.
                    if ( element.match( /^(\w*)\[(\w+)([=~\|\^\$\*]?)=?['"]?([^\]'"]*)['"]?\]$/ ) ) {
                        var tag = RegExp.$1;       // Tag name (e.g., 'input').
                        var attr = RegExp.$2;      // Attribute name (e.g., 'type').
                        var operator = RegExp.$3;  // Operator (e.g., '=', '~', '|', '^', '$', '*').
                        var value = RegExp.$4;     // Attribute value.
                    }

                    var found = getElements( context, tag ); // Get elements matching tag within current context.
                    context = new Array; // Reset context.

                    // Filter elements based on the attribute and its value/operator.
                    for ( var l = 0, len = found.length; fnd = found[l], l < len; l++ ) {

                        // Strict equality: attribute value must be exactly 'value'.
                        if ( operator == '=' && fnd.getAttribute( attr ) != value ) continue;

                        // List of words: attribute value must contain 'value' as a whole word.
                        if ( operator == '~' && !fnd.getAttribute( attr ).match( new RegExp( '(^|\\s)' + value + '(\\s|$)' ) ) ) continue;

                        // Hyphen-separated list: attribute value must start with 'value-' or be exactly 'value'.
                        if ( operator == '|' && !fnd.getAttribute( attr ).match( new RegExp( '^' + value + '-?' ) ) ) continue;

                        // Starts with: attribute value must begin with 'value'.
                        if ( operator == '^' && fnd.getAttribute( attr ).indexOf( value ) != 0 ) continue;

                        // Ends with: attribute value must end with 'value'.
                        if ( operator == '$' && fnd.getAttribute( attr ).lastIndexOf( value ) != ( fnd.getAttribute( attr ).length - value.length ) ) continue;

                        // Contains substring: attribute value must contain 'value' anywhere.
                        if ( operator == '*' && !( fnd.getAttribute( attr ).indexOf( value ) + 1 ) ) continue;

                        // If no operator, just check if attribute exists. If it doesn't, skip.
                        else if ( !fnd.getAttribute( attr ) ) continue;

                        context.push( fnd ); // Add element to new context if it passes the filter.
                    }
                    continue SPACE; // Move to the next inheriter.
                }

                // --- Tag selectors (no class or ID specified) ---
                var found = getElements( context, element ); // Get elements matching the tag within current context.
                context = found; // The found elements become the new context.
            }
            // After processing all inheriters for a selector, add the final context elements to 'selected'.
            for ( var o = 0, len = context.length; o < len; o++ ) selected.push( context[o] );
        }
        return selected; // Return the array of all selected elements.
    };


    // --- Support Methods for DOM Manipulation ---

    /*
     * Method: hasClass
     * Description: Checks if an element has a specific CSS class.
     * Parameters:
     *   elem - The DOM element to check.
     *   cls  - The class name to look for.
     * Returns:
     *   Boolean - true if the element has the class, false otherwise.
     */
    this.hasClass = function ( elem, cls ) {
        // Use a regular expression to match the class name, ensuring it's a whole word.
        return elem.className.match( new RegExp( '(^|\\s)' + cls + '(\\s|$)' ) );
    };


    /*
     * Method: addClass
     * Description: Adds a CSS class to an element if it doesn't already have it.
     * Parameters:
     *   elem - The DOM element to modify.
     *   cls  - The class name to add.
     */
    this.addClass = function ( elem, cls ) {
        // Only add the class if the element doesn't already have it.
        if ( !this.hasClass( elem, cls ) ) elem.className += " " + cls;
    };


    /*
     * Method: removeClass
     * Description: Removes a CSS class from an element.
     * Parameters:
     *   elem - The DOM element to modify.
     *   cls  - The class name to remove.
     */
    this.removeClass = function ( elem, cls ) {
        // Check if the element actually has the class before attempting to remove it.
        if ( hasClass( elem, cls ) ) { // Note: This calls a global 'hasClass' if 'this' is not used. (Original code behavior preserved)
            var reg = new RegExp( '(^|\\s)' + cls + '(\\s|$)' ); // Create a regex to find the class.
            // Replace the class name (with surrounding spaces) with a single space.
            elem.className = ele.className.replace( reg, ' ' ); // Note: Original code uses 'ele.className' instead of 'elem.className'. (Original code behavior preserved)
        }
    };


    // --- Event Handling Methods ---

    /*
     * Method: ready
     * Description: Attaches a function to be executed when the window's onload event fires.
     *              Handles multiple onload functions gracefully.
     * Parameters:
     *   func - The function to execute on load.
     */
    this.ready = function ( func ) {

        var oldonload = window.onload; // Store any existing window.onload function.

        // If no function is currently assigned to window.onload.
        if ( typeof window.onload != 'function' ) {
            window.onload = func; // Assign the new function directly.
        } else {
            // If window.onload already has a function, wrap it.
            window.onload = function () {
                if ( oldonload ) {
                    oldonload(); // Execute the previously assigned onload function first.
                }
                func(); // Then execute the new function.
            };
        }
    };

} // End of OneBit constructor function.