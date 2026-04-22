/***********************************************************************************************************************
 * This file has been commented primarily to support Visual Studio Intellisense.
 *
 * It is IMPORTANT to understand that you should NOT use this file at runtime within the browser environment.
 * Its SOLE purpose is for design-time IntelliSense assistance during development.
 * For any production usage, always employ the standard jQuery library.
 *
 * Current Comment Version: 1.3.2a (an internal versioning note)
 ***********************************************************************************************************************/

/***********************************************************************************************************************
 * jQuery JavaScript Library v1.3.2 - A concise, fast, and feature-rich JavaScript library.
 *
 * Copyright (c) 2009 John Resig, (see project homepage for more details: http://jquery.com/)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
 * OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Date of release: 2009-02-19 17:34:21 -0500 (Thursday, 19 February 2009)
 * Source Revision: 6246
 ***********************************************************************************************************************/

( function( ) { // Immediately-invoked function expression to create a private scope

  var // Declaring a block of global variables for performance and context management.
    // Alias to 'this' (window in a browser environment) for faster access and minification.
    window = this,
    // Declaring 'undefined' locally ensures its value is truly undefined, even if globally overwritten.
    undefined,
    // Store original jQuery for noConflict()
    _jQuery = window.jQuery,
    // Store original $ for noConflict()
    _$ = window.$,

    // The main jQuery function itself. This is the entry point for all jQuery operations.
    jQuery = window.jQuery = window.$ = function( selector, context ) {
      /// <summary>
      /// This is the primary jQuery function, acting as both a factory and a wrapper.
      /// It can be used in several ways:
      /// 1: $(expression, context) - Selects elements based on a CSS selector.
      /// 2: $(html) - Creates new DOM elements from an HTML string.
      /// 3: $(elements) - Wraps existing DOM element(s) with jQuery functionality.
      /// 4: $(callback) - A convenient shorthand for `$(document).ready()`.
      /// </summary>
      /// <param name="selector" type="String">
      ///   1: expression - A CSS selector string to query the DOM.
      ///   2: html - An HTML string to be parsed into DOM elements.
      ///   3: elements - One or more existing DOM elements to wrap.
      ///   4: callback - A function to execute once the DOM is fully loaded.
      /// </param>
      /// <param name="context" type="jQuery">
      ///   1: context - An optional DOM Element, Document, or jQuery object to narrow the search scope.
      /// </param>
      /// <field name="selector" Type="Object">
      ///   The original DOM node context passed to jQuery(), or the document if none was specified.
      /// </field>
      /// <field name="context" Type="String">
      ///   The selector string originally passed to jQuery().
      /// </field>
      /// <returns type="jQuery" />

      // The core jQuery object is an 'enhanced' instance of the init constructor.
      return new jQuery.fn.init( selector, context );
    },

    // Regular expression to quickly check for HTML strings or ID selectors.
    // This optimization helps jQuery efficiently handle common input patterns.
    quickExpr = /^[^<]*(<(.|\s)+>)[^>]*$|^#([\w-]+)$/,
    // Regular expression to determine if a selector is 'simple' (e.g., tag, .class, #id).
    isSimple = /^.[^:#\[\.,]*$/;

  // Extend jQuery's prototype (`jQuery.fn`) to add all public methods.
  // This makes `jQuery.fn` and `jQuery.prototype` reference the same object.
  jQuery.fn = jQuery.prototype = {

    // The 'init' constructor, responsible for creating new jQuery objects.
    // It's the actual constructor called when you do `new jQuery.fn.init(...)`.
    init: function( selector, context ) {
      /// <summary>
      /// The internal constructor for creating jQuery objects.
      /// It supports various types of selectors and contexts.
      /// </summary>
      /// <param name="selector" type="String">
      ///   1: expression - A CSS selector.
      ///   2: html - An HTML string.
      ///   3: elements - DOM element(s).
      ///   4: callback - A function for document ready.
      /// </param>
      /// <param name="context" type="jQuery">
      ///   1: context - A DOM Element, Document, or jQuery object as context.
      /// </param>
      /// <returns type="jQuery" />

      // Ensure a selector is always provided; default to 'document' if none.
      selector = selector || document;

      // Handle the case where a direct DOM Element is passed.
      if ( selector.nodeType ) {
        this[0] = selector; // Assign the element to the first position.
        this.length = 1; // Set length to 1.
        this.context = selector; // Store the context.
        return this; // Return the new jQuery object.
      }

      // Handle HTML strings or ID selectors.
      if ( typeof selector === "string" ) {
        // Attempt to match the selector against quickExpr to identify HTML or ID.
        var match = quickExpr.exec( selector );

        // If there's a match AND either it's an HTML string or no context was specified for an ID.
        if ( match && ( match[1] || !context ) ) {

          // HANDLE: $(html) -> jQuery.clean() handles HTML string conversion.
          if ( match[1] ) {
            selector = jQuery.clean( [ match[1] ], context );
          }
          // HANDLE: $("#id") -> Optimized for ID selection.
          else {
            var elem = document.getElementById( match[3] ); // Directly get element by ID.

            // Edge case: IE/Opera might return elements by name if ID isn't unique.
            if ( elem && elem.id != match[3] ) {
              return jQuery( ) . find( selector ); // Fallback to find if ID mismatch.
            }

            // Otherwise, inject the found element (or an empty array if not found) into the jQuery object.
            var ret = jQuery( elem || [ ] );
            ret.context = document; // Context is the document.
            ret.selector = selector; // Store the original selector.
            return ret; // Return the new jQuery object.
          }

          // HANDLE: $(expr, [context]) - Equivalent to `jQuery(context).find(expr)`.
        } else {
          return jQuery( context ) . find( selector );
        }

        // HANDLE: $(function) - Shortcut for document ready.
      } else if ( jQuery.isFunction( selector ) ) {
        return jQuery( document ) . ready( selector );
      }

      // Preserve selector and context from an existing jQuery object if passed.
      if ( selector.selector && selector.context ) {
        this.selector = selector.selector;
        this.context = selector.context;
      }

      // Populate the jQuery object with elements from an array or an array-like object.
      return this.setArray(
        jQuery.isArray( selector ) ?
        selector :
        jQuery.makeArray( selector )
      );
    },

    // The selector string used to create this jQuery object.
    selector: "",

    // The current version of jQuery.
    jquery: "1.3.2",

    // Returns the number of elements in the matched set.
    size: function( ) {
      /// <summary>
      /// Returns the number of elements currently matched by the jQuery object.
      /// Part of Core functionality.
      /// </summary>
      /// <returns type="Number" />

      return this.length;
    },

    // Retrieves an element by its index or the entire matched set as a clean array.
    get: function( num ) {
      /// <summary>
      /// Accesses a single matched element by its Nth position, or returns the entire set.
      /// Part of Core functionality.
      /// </summary>
      /// <returns type="Element" />
      /// <param name="num" type="Number">
      ///   The zero-based index of the element to retrieve. If undefined, returns all.
      /// </param>

      return num == undefined ?
        // If 'num' is undefined, return a 'clean' array of all elements.
        Array.prototype.slice.call( this ) :
        // Otherwise, return the specific element at 'num'.
        this[ num ];
    },

    // Pushes a new set of elements onto the jQuery stack, preserving the previous state.
    pushStack: function( elems, name, selector ) {
      /// <summary>
      /// Sets the jQuery object to a new array of elements, while maintaining the stack (for chaining).
      /// Part of Core functionality.
      /// </summary>
      /// <returns type="jQuery" />
      /// <param name="elems" type="Elements">
      ///   An array of DOM elements to form the new matched set.
      /// </param>

      // Create a new jQuery object from the provided elements.
      var ret = jQuery( elems );

      // Store a reference to the previous jQuery object on the stack.
      ret.prevObject = this;

      // Inherit the context from the current object.
      ret.context = this.context;

      // Construct the selector string for the new object based on the operation.
      if ( name === "find" ) {
        ret.selector = this.selector + ( this.selector ? " " : "" ) + selector;
      } else if ( name ) {
        ret.selector = this.selector + "." + name + "(" + selector + ")";
      }

      // Return the newly formed element set.
      return ret;
    },

    // Forcefully replaces the current matched set with a new array of elements.
    // This is a destructive operation; use pushStack() to maintain the stack.
    setArray: function( elems ) {
      /// <summary>
      /// Replaces the current jQuery object's elements with a new array.
      /// This is a destructive operation; use .pushStack() to preserve the stack.
      /// Part of Core functionality.
      /// </summary>
      /// <returns type="jQuery" />
      /// <param name="elems" type="Elements">
      ///   An array of DOM elements to become the new matched set.
      /// </param>

      // Resetting length to 0 and then using native Array.prototype.push.apply
      // is an efficient way to populate an object with array-like properties.
      this.length = 0;
      Array.prototype.push.apply( this, elems );

      return this; // Return 'this' for chaining.
    },

    // Iterates over each element in the matched set and executes a callback function.
    each: function( callback, args ) {
      /// <summary>
      /// Executes a function for each element in the matched set, with 'this'
      /// pointing to the current element and its index passed as an argument.
      /// Part of Core functionality.
      /// </summary>
      /// <returns type="jQuery" />
      /// <param name="callback" type="Function">
      ///   The function to execute for each element.
      /// </param>

      // Delegate to the global `jQuery.each` utility function.
      return jQuery.each( this, callback, args );
    },

    // Determines the position of a given element within the matched set.
    index: function( elem ) {
      /// <summary>
      /// Searches for the specified object within the matched elements and
      /// returns its zero-based index, or -1 if not found.
      /// Part of Core functionality.
      /// </summary>
      /// <returns type="Number" />
      /// <param name="elem" type="Element">
      ///   The DOM element or jQuery object to search for.
      /// </param>

      // Locate the position of the desired element using `jQuery.inArray`.
      return jQuery.inArray(
        // If 'elem' is a jQuery object, use its first element; otherwise, use 'elem' directly.
        elem && elem.jquery ? elem[0] : elem,
        this
      );
    },

    // Sets or gets attributes/properties on the matched elements.
    attr: function( name, value, type ) {
      /// <summary>
      /// Sets a single property to a computed value on all matched elements,
      /// or retrieves the value of a property from the first element.
      /// Part of DOM/Attributes functionality.
      /// </summary>
      /// <returns type="jQuery" />
      /// <param name="name" type="String">
      ///   The name of the attribute/property to set or get.
      /// </param>
      /// <param name="value" type="Function">
      ///   A function that returns the value to set for each element.
      /// </param>

      var options = name; // Initialize options with 'name'.

      // If 'name' is a string:
      if ( typeof name === "string" ) {
        // If 'value' is undefined, it's a getter operation.
        if ( value === undefined ) {
          return this[0] && jQuery[ type || "attr" ]( this[0], name );
        }
        // Otherwise, it's a setter operation for a single attribute.
        else {
          options = {}; // Re-initialize options as an object.
          options[ name ] = value; // Assign the single attribute/value pair.
        }
      }

      // Iterate over each matched element to set attributes/properties.
      return this.each( function( i ) {
        // Loop through all names in the 'options' object.
        for ( name in options ) {
          jQuery.attr(
            // If 'type' is specified, target 'this.style'; otherwise, target 'this' (the element itself).
            type ? this.style : this,
            name,
            jQuery.prop( this, options[ name ], type, i, name )
          );
        }
      } );
    },

    // Sets or gets CSS properties on the matched elements.
    css: function( key, value ) {
      /// <summary>
      /// Sets a single CSS property to a value on all matched elements.
      /// Numbers are automatically converted to pixel values.
      /// Part of CSS functionality.
      /// </summary>
      /// <returns type="jQuery" />
      /// <param name="key" type="String">
      ///   The name of the CSS property to set.
      /// </param>
      /// <param name="value" type="String">
      ///   The value to set the property to.
      /// </param>

      // Ignore negative width and height values, treating them as undefined.
      if ( ( key == 'width' || key == 'height' ) && parseFloat( value ) < 0 ) {
        value = undefined;
      }
      // Delegate to `attr` method, specifying 'curCSS' as the type for CSS handling.
      return this.attr( key, value, "curCSS" );
    },

    // Sets or gets the text content of the matched elements.
    text: function( text ) {
      /// <summary>
      /// Sets the text contents of all matched elements.
      /// Similar to html(), but escapes HTML characters.
      /// Part of DOM/Attributes functionality.
      /// </summary>
      /// <returns type="String" />
      /// <param name="text" type="String">
      ///   The text value to set as the content of the elements.
      /// </param>

      // If 'text' is not an object and not null, set the text content.
      if ( typeof text !== "object" && text != null ) {
        return this.empty( ) . append( ( this[0] && this[0].ownerDocument || document ) . createTextNode( text ) );
      }

      var ret = ""; // Initialize an empty string to accumulate text.

      // Iterate over 'text' (if provided) or 'this' (the matched set).
      jQuery.each( text || this, function( ) {
        // Iterate over child nodes of the current element.
        jQuery.each( this.childNodes, function( ) {
          // Exclude comment nodes (nodeType 8).
          if ( this.nodeType != 8 ) {
            // If not an element node (type 1), append its nodeValue.
            // Otherwise, recursively call text() on the element node.
            ret += this.nodeType != 1 ?
              this.nodeValue :
              jQuery.fn.text( [ this ] );
          }
        } );
      } );

      return ret; // Return the accumulated text.
    },

    // Wraps a single HTML structure around all matched elements.
    wrapAll: function( html ) {
      /// <summary>
      /// Wraps all matched elements collectively with a structure of other elements.
      /// Useful for injecting additional structure without altering semantics.
      /// This finds the deepest ancestor in the wrapping structure.
      /// Part of DOM/Manipulation functionality.
      /// </summary>
      /// <returns type="jQuery" />
      /// <param name="html" type="Element">
      ///   A DOM element or HTML string that will wrap the target elements.
      /// </param>

      if ( this[0] ) { // Ensure there is at least one element in the set.
        // Create a clone of the wrapper HTML/element in the context of the first element's document.
        var wrap = jQuery( html, this[0].ownerDocument ) . clone( );

        // If the first element has a parent, insert the wrapper before it.
        if ( this[0].parentNode ) {
          wrap.insertBefore( this[0] );
        }

        // Find the deepest child of the wrapper and append all matched elements to it.
        wrap.map( function( ) {
          var elem = this;

          while ( elem.firstChild ) {
            elem = elem.firstChild; // Traverse to the deepest child.
          }

          return elem; // Return the deepest child.
        } ) . append( this ); // Append 'this' (the original matched elements) to the deepest child.
      }

      return this; // Return 'this' for chaining.
    },

    // Wraps an HTML structure around the inner contents of each matched element.
    wrapInner: function( html ) {
      /// <summary>
      /// Wraps the inner child contents (including text nodes) of each matched element
      /// with the specified HTML structure.
      /// </summary>
      /// <param name="html" type="String">
      ///   An HTML string or DOM element to wrap around the target contents.
      /// </param>
      /// <returns type="jQuery" />

      return this.each( function( ) {
        jQuery( this ) . contents( ) . wrapAll( html ); // Get contents and wrap them all.
      } );
    },

    // Wraps an HTML structure around each matched element individually.
    wrap: function( html ) {
      /// <summary>
      /// Wraps each individual matched element with a structure of other elements.
      /// This process is useful for adding structural elements without semantic alteration.
      /// Part of DOM/Manipulation functionality.
      /// </summary>
      /// <returns type="jQuery" />
      /// <param name="html" type="Element">
      ///   A DOM element or HTML string that will wrap each target.
      /// </param>

      return this.each( function( ) {
        jQuery( this ) . wrapAll( html ); // Delegate to wrapAll for each element.
      } );
    },

    // Appends content to the inside of each matched element.
    append: function( ) {
      /// <summary>
      /// Appends content to the inside of every matched element.
      /// Similar to `appendChild` but can handle multiple elements and types.
      /// Part of DOM/Manipulation functionality.
      /// </summary>
      /// <returns type="jQuery" />
      /// <param name="content" type="Content">
      ///   The content to append (HTML string, DOM element, text node, or jQuery object).
      /// </param>

      return this.domManip( arguments, true, function( elem ) {
        // Only append to element nodes.
        if ( this.nodeType == 1 ) {
          this.appendChild( elem );
        }
      } );
    },

    // Prepends content to the inside of each matched element.
    prepend: function( ) {
      /// <summary>
      /// Prepends content to the inside of every matched element.
      /// Inserts elements at the beginning of all matched elements.
      /// Part of DOM/Manipulation functionality.
      /// </summary>
      /// <returns type="jQuery" />
      /// <param name="" type="Content">
      ///   The content to prepend (HTML string, DOM element, text node, or jQuery object).
      /// </param>

      return this.domManip( arguments, true, function( elem ) {
        // Only prepend to element nodes.
        if ( this.nodeType == 1 ) {
          this.insertBefore( elem, this.firstChild );
        }
      } );
    },

    // Inserts content before each of the matched elements.
    before: function( ) {
      /// <summary>
      /// Inserts content before each of the matched elements in the DOM.
      /// Part of DOM/Manipulation functionality.
      /// </summary>
      /// <returns type="jQuery" />
      /// <param name="" type="Content">
      ///   The content to insert (HTML string, DOM element, text node, or jQuery object).
      /// </param>