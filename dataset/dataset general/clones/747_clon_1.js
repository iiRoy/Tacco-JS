/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain exactly the same.
 * Only whitespace (indentation, spacing, blank lines) and comments have been
 * extensively modified to create a visually distinct but logically identical version.
 */
// Start of the first Immediately Invoked Function Expression (IIFE)
( function () {

    // Check if the global HAML object is not yet defined.
    // If it's null or undefined, initialize it as an empty object.
    if ( window.HAML == null ) {

        window.HAML = { /* An empty object for HAML templates */ };

    } // End of HAML initialization check

    /*
     * Define the 'coffee1' template function within the HAML namespace.
     * This function takes a 'context' object as an argument.
     */
    window.HAML[ 'coffee1' ] = function ( context ) {

        // The template's rendering logic is encapsulated in another IIFE.
        return ( function () {

            var $o; // Declare a variable to hold the output array.

            // Initialize the output array.
            $o = [ ];

            /*
             * Push the main HTML content string into the output array.
             * This string contains a static HTML structure for a quick notes section.
             */
            $o.push( "<!DOCTYPE html>\n<div id='main'>\n  <div class='note'>\n    <h2>Quick Notes</h2>\n    <ul>\n      <li>\n        Haml Coffee is usually indented with two spaces,\n        although more than two is allowed.\n        You have to be consistent, though.\n      </li>\n      <li>\n        The first character of any line is called\n        the \"control character\" - it says \"make a tag\"\n        or \"run CoffeeScript code\" or all sorts of things.\n      </li>\n      <li>\n        Haml takes care of nicely indenting your HTML.\n      </li>\n      <li>\n        Haml Coffee allows CoffeeScript code and blocks.\n      </li>\n    </ul>\n  </div>\n  <div class='note'>\n    You can get more information by reading the\n    <a href='https://github.com/netzpirat/haml-coffee'>\n      Official Haml Coffee Documentation\n    </a>\n  </div>\n  <div class='note'>\n    <p>\n      CoffeeScript code is included by using = at the\n      beginning of a line.\n    </p>\n    <p>\n      Read the tutorial for more information.\n    </p>\n  </div>\n</div>" );

            // Join the array elements with newline characters and then
            // remove any `id='id'` or `class='class'` attributes that have
            // identical values for both key and value (e.g., `id='id'`).
            return $o.join( "\n" ).replace( /\s(?:id|class)=(['"])(\1)/mg, "" );

        } ).call( context ); // Execute the inner IIFE with the provided context.

    }; // End of 'coffee1' template function definition.

} ).call( this ); // Execute the outer IIFE, binding 'this' to the global context (e.g., window).


/*
 * This is the second self-executing anonymous function.
 * It also defines a template for the HAML object.
 */
( function ( ) {

    // Ensure window.HAML exists before proceeding.
    if ( window.HAML == null ) {

        window.HAML = { }; // Initialize HAML if it's not already.

    }


    /*
     * Define the 'coffee2' template function.
     * This function will also receive a 'context' object.
     */
    window.HAML[ 'coffee2' ] = function ( context ) {

        // The template rendering logic is wrapped in an inner IIFE.
        return ( function ( ) {

            var $c, $e, $o; // Declare variables for escaping, coercing, and output.

            /**
             * Helper function $e for HTML escaping.
             * It converts special HTML characters to their entity equivalents.
             */
            $e = function ( text, escape ) {

                return ( "" + text )
                    .replace( /&/g, '&amp;' )
                    .replace( /</g, '&lt;' )
                    .replace( />/g, '&gt;' )
                    .replace( /'/g, '&#39;' )
                    .replace( /\//g, '&#47;' )
                    .replace( /"/g, '&quot;' );

            };

            /*
             * Helper function $c for coercing values to strings or special markers.
             * Handles null, undefined, boolean values, and defaults to text itself.
             */
            $c = function ( text ) {

                switch ( text ) {

                    case null:
                    case void 0:
                        return ''; // Return empty string for null or undefined.

                    case true:
                    case false:
                        return '' + text; // Prefix booleans with a special character.

                    default:
                        return text; // Return the text as is for other types.

                }

            };


            $o = [ ]; // Initialize the output array for collecting HTML parts.

            // Push the main HTML string with interpolated CoffeeScript expressions.
            // The expressions involve HTML escaping ($e) and value coercion ($c)
            // based on the current context ('this').
            $o.push( "<article>\n  <h1>" + ( $e( $c( "hello " + this.greet ) ) ) + "</h1>\n  <section id='note'>I've an id</section>\n  <div class='" + ( [ 'am', 'i', "" + ( $e( $c( this[ "class" ] ) ) ) ].sort( ).join( ' ' ).replace( /^\s+|\s+$/g, '' ) ) + "'>I've three* classes</div>\n</article>" );

            // Join the array elements with newlines.
            // Then, perform several replacements:
            // 1. Remove special 'true' markers, leaving just the attribute name.
            // 2. Remove attributes with 'false' markers entirely.
            // 3. Remove redundant `id='id'` or `class='class'` attributes.
            return $o.join( "\n" )
                .replace( /\s([\w-]+)='true'/mg, ' $1' )
                .replace( /\s([\w-]+)='false'/mg, '' )
                .replace( /\s(?:id|class)=(['"])(\1)/mg, "" );

        } ).call( context ); // Execute the inner IIFE with the provided context.

    }; // End of 'coffee2' template function.

} ).call( this ); // Execute the outer IIFE.