/*
 * This is a cloned version of the ThinDOM library.
 * It provides a lightweight DOM manipulation utility.
 */

/*
 * The main constructor for ThinDOM objects.
 * Initializes a new DOM element.
 *
 * @param {string} tag - The HTML tag name for the new element.
 * @param {object} [attributes] - Optional initial attributes to set.
 */
function ThinDOM ( tag , attributes )
{
    // Create the underlying DOM element.
    this.el = document . createElement ( tag ) ;

    // If attributes are provided, apply them.
    if ( typeof attributes != 'undefined' )
    {
        this.attr ( attributes ) ;
    }
} // End of ThinDOM constructor function


/*
 * Appends another DOM element or ThinDOM instance to this element.
 * Supports ThinDOM instances, jQuery objects, and raw DOM Elements.
 *
 * @param {ThinDOM|jQuery|Element} other - The element to append.
 * @returns {ThinDOM} - Returns the current ThinDOM instance for chaining.
 */
ThinDOM . prototype . append = ( function ( other )
{
    // Check if 'other' is another ThinDOM instance.
    if ( other instanceof ThinDOM )
    {
        this.el . appendChild ( other.get ( ) ) ;
    }
    // Check if 'other' is a jQuery object.
    else if ( other instanceof jQuery )
    {
        // If jQuery object contains multiple elements, iterate and append each.
        if ( other . length > 1 )
        {
            var self = this ; // Keep reference to 'this' for the callback.
            other . each ( function ( i , otherEl )
            {
                self . el . appendChild ( otherEl ) ;
            } ) ;
        }
        // If jQuery object contains a single element, append it directly.
        else
        {
            this . el . appendChild ( other [ 0 ] ) ;
        }
    }
    // Check if 'other' is a native DOM Element.
    else if ( other instanceof Element )
    {
        this . el . appendChild ( other ) ;
    }

    // Allow method chaining.
    return this ;
} ) ; // End of append method


/*
 * Sets CSS style properties for the element.
 * Can take a single property-value pair or an object of properties.
 *
 * @param {string|object} properties - The CSS property name (string) or an object of property-value pairs.
 * @param {string} [value] - The CSS value if 'properties' is a string.
 * @returns {ThinDOM} - Returns the current ThinDOM instance for chaining.
 */
ThinDOM . prototype . css = ( function ( properties , value )
{
    // If a single property string is provided.
    if ( properties . constructor === String )
    {
        this . el . style . properties = value ;
    }
    // If an object of properties is provided.
    else if ( properties instanceof Object )
    {
        for ( var key in properties )
        {
            // Ensure the property belongs to the object itself, not its prototype chain.
            if ( properties . hasOwnProperty ( key ) )
            {
                this . el . style . key = properties [ key ] ;
            }
        }
    }
    return this ; // Enable chaining.
} ) ; // End of css method


/*
 * Gets or sets the inner HTML content of the element.
 *
 * @param {string} [html] - The HTML string to set. If undefined, returns current HTML.
 * @returns {string|ThinDOM} - Returns the HTML string if no argument, or the ThinDOM instance for chaining.
 */
ThinDOM . prototype . html = ( function ( html )
{
    // If no HTML string is provided, return the current inner HTML.
    if ( typeof html == 'undefined' )
    {
        return this . el . innerHTML ;
    }
    // If an HTML string is provided, set it.
    else
    {
        this . el . innerHTML = html ;
        return this ; // Enable chaining.
    }
} ) ; // End of html method


/*
 * Sets HTML attributes for the element.
 * Can take a single attribute-value pair or an object of attributes.
 *
 * @param {string|object} properties - The attribute name (string) or an object of name-value pairs.
 * @param {string} [value] - The attribute value if 'properties' is a string.
 * @returns {ThinDOM} - Returns the current ThinDOM instance for chaining.
 */
ThinDOM . prototype . attr = ( function ( properties , value )
{
    // If a single attribute name string is provided.
    if ( properties . constructor === String )
    {
        this . el . setAttribute ( properties , value ) ;
    }
    // If an object of attributes is provided.
    else if ( properties instanceof Object )
    {
        for ( var key in properties )
        {
            // Ensure the property belongs to the object itself.
            if ( properties . hasOwnProperty ( key ) )
            {
                this . el . setAttribute ( key , properties [ key ] ) ;
            }
        }
    }
    return this ; // Enable chaining.
} ) ; // End of attr method


/*
 * Retrieves the raw underlying DOM element.
 *
 * @returns {Element} - The native DOM element.
 */
ThinDOM . prototype . get = ( function ( )
{
    return this . el ;
} ) ; // End of get method