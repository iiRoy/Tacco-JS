/*
 *  DOM BUILDER - This library facilitates the dynamic creation of DOM elements.
 *  Project Homepage: http://github.com/skyzyx/dombuilder/
 *  License: BSD Licensed (refer to http://creativecommons.org/licenses/BSD/ for details).
 *
 *  Comprehensive usage instructions and examples are available on the project's website.
 */

// ==ClosureCompiler==
// @compilation_level SIMPLE_OPTIMIZATIONS  // Optimization level for Google Closure Compiler.
// ==/ClosureCompiler==

/*jslint
    white: false,   // Allow mixed whitespace.
    onevar: true,   // Allow multiple var statements in a function.
    browser: true,  // Assume browser environment.
    undef: true,    // Warn if a variable is used before it is defined.
    nomen: false,   // Allow leading/trailing underscores in identifiers.
    eqeqeq: true,   // Require triple equals (===) for comparison.
    plusplus: false,// Prohibit ++ and -- operators.
    bitwise: true,  // Require bitwise operators.
    regexp: true,   // Require regular expressions.
    strict: false,  // Do not require "use strict".
    newcap: true,   // Require constructors to start with a capital letter.
    immed: false    // Prohibit immediate function invocation without parentheses.
*/
/*global window */ // Declare 'window' as a global variable to avoid JSLint warnings.


( function () {

    /**
     *  DOMBuilder: A constructor function designed to generate DOM nodes
     *  using an object-oriented syntax for easier manipulation.
     *
     *  @param  {string}    elem  - (Required) The tag name of the HTML element to be created.
     *  @param  {object}    attr  - (Optional) A JavaScript object (hash) containing
     *                               key-value pairs representing the attributes to apply to the element.
     *  @returns {DOMBuilder}     - Returns a new DOMBuilder object instance.
     */
    var X = function ( elem, attr ) {

        var _ = this,       // Cache 'this' for internal use within the constructor and its methods.
            d = document,   // Shorthand for the document object to improve readability and reduce typing.
            key;            // Variable to iterate over object keys.

        // Step 1: Create the HTML element.
        // The newly created element is stored in the 'e' property of the DOMBuilder instance.
        _.e = d.createElement( elem );


        // Step 2: Process and apply attributes, if any were provided.
        if ( attr ) {

            // Iterate over each key-value pair in the 'attr' object.
            for ( key in attr ) {

                // Special handling for the 'class' attribute due to IE's older DOM API.
                if ( key.toString() === 'class' ) {

                    // Assign the class name using the 'className' property for broader compatibility.
                    _.e.className = attr[ key ];

                } else {

                    // For all other attributes, use the standard 'setAttribute' method.
                    _.e.setAttribute( key, attr[ key ] );

                }
            }
        }


        /**
         *  Appends one or more child nodes to the current DOMBuilder element.
         *  This method allows for chaining.
         *
         *  @param  {HTMLElement|DOMBuilder|Array}  obj - (Required)
         *      Can be a single native DOM HTMLElement, another DOMBuilder object,
         *      or an array containing any combination of these types for multiple children.
         *  @returns {DOMBuilder} - The original DOMBuilder object, enabling method chaining.
         */
        _.child = function ( obj ) {

            // Check if the provided object is not already an array.
            // This check ensures 'obj' is an array, simplifying subsequent iteration.
            if ( typeof obj !== 'object' || typeof obj.length !== 'number' || typeof obj.splice !== 'function' ) {

                // Convert the single object into a single-element array.
                obj = [ obj ];
            }

            // Loop through each item in the (now guaranteed) array of children.
            for ( var i = 0, max = obj.length; i < max; i++ ) {

                // If an element in the array is 'undefined' (e.g., due to a trailing comma in an array literal),
                // skip it to prevent errors.
                if ( typeof obj[ i ] === 'undefined' ) {
                    break;
                }

                // Determine if the current child is a DOMBuilder object.
                // DOMBuilder objects have an 'asDOM' method.
                if ( typeof obj[ i ].asDOM !== 'undefined' ) {

                    // If it's a DOMBuilder object, append its native DOM element representation.
                    _.e.appendChild( obj[ i ].asDOM() );

                } else {

                    // Otherwise, assume it's a standard native DOM 'HTMLElement' and append it directly.
                    _.e.appendChild( obj[ i ] );

                }
            }

            // Return the current DOMBuilder instance to allow for further method chaining.
            return _;
        };


        /**
         *  Sets or appends HTML content to the DOMBuilder element's innerHTML.
         *  This method supports chaining.
         *
         *  @param  {string}   str     - (Required) The HTML string to be assigned.
         *  @param  {boolean}  replace - (Optional) If true, the new string replaces existing content.
         *                                 Defaults to false (appends to existing content).
         *  @returns {DOMBuilder}     - The original DOMBuilder object for chaining.
         */
        _.html = function ( str, replace ) {

            // Default 'replace' to false if not explicitly provided.
            replace = replace || false;

            // Apply the HTML string based on the 'replace' flag.
            if ( replace ) {

                // Overwrite existing innerHTML.
                _.e.innerHTML = str;

            } else {

                // Append to existing innerHTML.
                _.e.innerHTML += str;

            }

            // Return the current DOMBuilder instance for chaining.
            return _;
        };


        /**
         *  Retrieves the underlying native DOM HTMLElement from the DOMBuilder object.
         *  This is particularly useful when integrating with native DOM methods
         *  or other libraries that expect standard DOM elements.
         *
         *  @returns {HTMLElement} - The native HTML element managed by this DOMBuilder instance.
         */
        _.asDOM = function () {

            // Simply return the stored native DOM element.
            return _.e;
        };


        /**
         *  Converts the DOMBuilder object's content into an HTML string representation.
         *  This involves temporarily attaching the element to an in-memory DIV.
         *
         *  @returns {string} - The HTML string representing the DOMBuilder element and its children.
         */
        _.asHTML = function () {

            // Create a temporary, in-memory 'div' element.
            var t = d.createElement( 'div' );

            // Append our DOMBuilder's native element to this temporary div.
            t.appendChild( _.e );

            // Extract and return the innerHTML of the temporary div, which now contains our element.
            return t.innerHTML;
        };

        // The constructor itself returns the DOMBuilder instance, enabling direct chaining
        // immediately after instantiation (e.g., DOMBuilder('div').child(...)).
        return _;
    };


    // Expose the DOMBuilder functionality globally through the 'window' object.
    // This factory function simplifies instantiation by hiding the 'new' keyword.
    window.DOMBuilder = function ( elem, attr ) {
        return new X( elem, attr );
    };


    // Provide a static method on DOMBuilder to create a DocumentFragment.
    // This is useful for efficiently adding multiple nodes to the DOM.
    window.DOMBuilder.DOM = function ( nodes ) {

        // Initialize a new DocumentFragment.
        var f = document.createDocumentFragment(),
            i, // Loop counter (not used in final while loop, but kept from original structure).
            max, // Max value for loop (not used in final while loop, but kept from original structure).

            // Create a temporary 'div' DOMBuilder instance, append the provided nodes,
            // get its native DOM element, and then access its childNodes collection.
            // This effectively converts the 'nodes' input into a live NodeList.
            n = new X( 'div' ).child( nodes ).asDOM().childNodes;

        // Loop through the live NodeList 'n'. As elements are appended to 'f',
        // they are removed from 'n', causing 'n.length' to decrease.
        while ( n.length ) {

            // Append the first child from 'n' to the DocumentFragment 'f'.
            // This automatically removes it from 'n'.
            f.appendChild( n[ 0 ] );
        }

        // Return the fully populated DocumentFragment.
        return f;
    };

} )(); // Immediately-invoked function expression (IIFE) to encapsulate the code and prevent global namespace pollution.