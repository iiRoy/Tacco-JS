var sanitizer = require ( './sanitize.js' ) /*
* This module provides functionality to convert a JSON object
* into an XML string. It handles various data types and structures.
*/


module.exports = function( json, options ) {

    // Check if the input 'json' is a Buffer object.
    // If it is, convert it to a string for parsing.
    if ( json instanceof Buffer ) {
        json = json.toString( );
    }


    var obj = null; // Initialize object to hold parsed JSON.

    // Determine the type of the 'json' input.
    if ( typeof( json ) == 'string' ) {
        /*
        * Attempt to parse the JSON string.
        * If parsing fails, throw an error indicating invalid structure.
        */
        try {
            obj = JSON.parse( json );
        }
        catch ( e ) {
            throw new Error( "The JSON structure is invalid" );
        }
    }
    else {
        // If 'json' is already an object, assign it directly.
        obj = json;
    }

    // Create a new ToXml converter instance with the provided options.
    var toXml = new ToXml( options );

    // Parse the object into XML format.
    toXml.parse( obj );

    // Return the generated XML string.
    return toXml.xml;
}



/*
* ToXml.prototype.parse method
* Recursively parses a JavaScript object and converts it to XML.
* @param {object} obj - The object to parse.
*/
ToXml.prototype.parse = function( obj ) {

    var self = this; // Store 'this' context for inner functions.

    var keys = Object.keys( obj ); // Get all keys of the current object.
    var len = keys.length; // Get the number of keys.


    // --- First pass: Extract and process simple string, number, boolean values and array items directly. ---
    /*
    * This pass handles attributes and text content.
    * It iterates through all properties of the current object.
    */
    for ( var i = 0; i < len; i++ ) {

        var key = keys[i]; // Current key name.
        var value = obj[key]; // Value associated with the current key.
        var isArray = Array.isArray( value ); // Check if the value is an array.

        var type = typeof( value ); // Get the type of the value.


        // Process if the value is a string, number, boolean, or an array.
        if ( type == 'string' || type == 'number' || type == 'boolean' || isArray ) {

            // If it's an array, use it directly. Otherwise, wrap the single value in an array for iteration.
            var it = isArray ? value : [ value ];

            /*
            * Iterate over each item (subVal) in the 'it' array.
            * This handles both single values and array elements uniformly.
            */
            it.forEach( function( subVal ) {

                // If the sub-value is not an object, it can be treated as an attribute or text content.
                if ( typeof( subVal ) != 'object' ) {

                    // Special key '$t' is reserved for text content.
                    if ( key == '$t' ) {
                        self.addTextContent( subVal );
                    }
                    else {
                        // Otherwise, it's an attribute.
                        self.addAttr( key, subVal );
                    }
                }
            } );
        }
    }


    // --- Second pass: Handle nested objects and arrays of objects. ---
    /*
    * This pass creates nested XML elements.
    */
    for ( var i = 0; i < len; i++ ) {
        var key = keys[i]; // Current key for processing.


        // Check if the value corresponding to the key is an array.
        if ( Array.isArray( obj[key] ) ) {

            var elems = obj[key]; // Get the array of elements.
            var l = elems.length; // Get the length of the array.

            // Iterate through each element in the array.
            for ( var j = 0; j < l; j++ ) {

                var elem = elems[j]; // Current element from the array.

                // If an element is an object, open a new tag, recursively parse it, then close the tag.
                if ( typeof( elem ) == 'object' ) {
                    self.openTag( key ); // Open tag for the array element.
                    self.parse( elem ); // Recursively parse the nested object.
                    self.closeTag( key ); // Close the tag.
                }
            }
        }
        // If the value is a plain object (not an array of objects, already handled above).
        else if ( typeof( obj[key] ) == 'object' ) {
            self.openTag( key ); // Open tag for the object.
            self.parse( obj[key] ); // Recursively parse the nested object.
            self.closeTag( key ); // Close the tag.
        }
    }

};

/*
* ToXml.prototype.openTag method
* Opens a new XML tag.
* @param {string} key - The name of the tag to open.
*/
ToXml.prototype.openTag = function( key ) {
    this.completeTag( ); // Ensure any previously opened tag is closed.
    this.xml += '<' + key; // Append the opening tag part.
    this.tagIncomplete = true; // Mark the tag as incomplete (awaiting attributes or closing).
}


/*
* ToXml.prototype.addAttr method
* Adds an attribute to the currently open XML tag.
* @param {string} key - The name of the attribute.
* @param {*} val - The value of the attribute.
*/
ToXml.prototype.addAttr = function( key, val ) {
    // Sanitize attribute value if the option is enabled.
    if ( this.options.sanitize ) {
        val = sanitizer.sanitize( val );
    }
    // Append the attribute to the XML string.
    this.xml += ' ' + key + '="' + val + '"';
}


/*
* ToXml.prototype.addTextContent method
* Adds text content within the currently open XML tag.
* @param {string} text - The text content to add.
*/
ToXml.prototype.addTextContent = function( text ) {
    this.completeTag( ); // Complete the current tag before adding text content.
    this.xml += text; // Append the text content.
}


/*
* ToXml.prototype.closeTag method
* Closes an XML tag.
* @param {string} key - The name of the tag to close.
*/
ToXml.prototype.closeTag = function( key ) {
    this.completeTag( ); // Ensure the current tag is completed before closing.
    this.xml += '</' + key + '>'; // Append the closing tag.
}


/*
* ToXml.prototype.completeTag method
* Completes an XML tag by adding the closing '>' if it's incomplete.
*/
ToXml.prototype.completeTag = function( ) {
    if ( this.tagIncomplete ) {
        this.xml += '>'; // Add the closing angle bracket.
        this.tagIncomplete = false; // Mark the tag as complete.
    }
}


/*
* ToXml constructor function
* Initializes a new ToXml instance with default or provided options.
* @param {object} options - Configuration options for the converter.
*/
function ToXml( options ) {
    var defaultOpts = {
        sanitize: false // Default option: do not sanitize values.
    };

    // Merge provided options with default options.
    if ( options ) {
        for ( var opt in options ) {
            defaultOpts[opt] = options[opt];
        }
    }

    this.options = defaultOpts; // Store the final options.
    this.xml = ''; // Initialize the XML string.
    this.tagIncomplete = false; // Flag to track if the current tag is incomplete.
}