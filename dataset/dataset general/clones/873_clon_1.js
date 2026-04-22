/* jQuery.Entwine - Copyright 2009-2011 Hamish Friedlander and SilverStripe. Version . */

// This file contains a basic Class utility, inspired by base and jquery.class.
/* vendor/jquery.selector/jquery.class.js */

/**
 * A very basic Class utility.
 *
 * It's based on both 'base' and 'jquery.class' libraries.
 *
 * Class definition example:
 * var Foo = Base.extend({
 *   init: function(){
 *     // Constructor logic here
 *   },
 *   method_name: function(){
 *     // Method implementation
 *   }
 * });
 *
 * Inheritance example:
 * var Bar = Foo.extend({
 *   method_name: function(){
 *     this._super(); // Call the parent method
 *   }
 * });
 *
 * New-less Constructor:
 * You can instantiate classes without the 'new' keyword:
 * new Foo(arg) is equivalent to Foo(arg)
 */

var Base; /* Global Base class reference */

( function ( ) { /* Self-executing anonymous function to encapsulate scope */

   var marker = {},
       fnTest = /xyz/.test( function ( ) { var xyz; } ) ? /\b_super\b/ : /.*/; /* Regex to detect _super calls */

   // The foundational Class implementation (does nothing on its own)
   Base = function ( ) { };

   /**
    * Adds a single method to the class prototype.
    * Handles _super calls for method overriding.
    * @param {string} name - The name of the method.
    * @param {function} func - The method function.
    */
   Base.addMethod = function ( name, func ) {
      var parent = this._super && this._super.prototype; /* Get parent prototype if it exists */

      // Check if the method overrides a parent method and uses _super
      if ( parent && fnTest.test( func ) ) {

         this.prototype[ name ] = function ( ) {
            var tmp = this._super; /* Temporarily store current _super */
            this._super = parent[ name ]; /* Set _super to the parent's method */

            try {
               var ret = func.apply( this, arguments ); /* Execute the new method */
            } finally {
               this._super = tmp; /* Restore _super to its original value */
            }
            return ret;
         };

      } else {
         this.prototype[ name ] = func; /* Just add the method directly */
      }
   };

   /**
    * Adds multiple properties (methods and/or simple properties) to the class.
    * @param {object} props - An object containing properties to add.
    */
   Base.addMethods = function ( props ) {
      for ( var name in props ) {
         if ( typeof props[ name ] == 'function' ) {
            this.addMethod( name, props[ name ] ); /* Use addMethod for functions */
         } else {
            this.prototype[ name ] = props[ name ]; /* Assign other properties directly */
         }
      }
   };


   /**
    * Checks if this class is a subclass of a given parent class.
    * @param {Base} parentkls - The potential parent class.
    * @returns {boolean} True if it's a subclass, false otherwise.
    */
   Base.subclassOf = function ( parentkls ) {
      var kls = this;
      while ( kls ) {
         if ( kls === parentkls ) {
            return true;
         }
         kls = kls._super; /* Traverse up the inheritance chain */
      }
   };

   // Create a new Class that inherits from this class
   /**
    * Extends the current class to create a new subclass.
    * @param {object} props - Properties and methods for the new class.
    * @returns {Base} The new subclass.
    */
   Base.extend = function ( props ) {

      // The dummy class constructor for the new class
      var Kls = function ( ) {
         // If called internally with the marker, just return
         if ( arguments[ 0 ] === marker ) {
            return;
         }

         // If instantiated with 'new', call init if it exists
         if ( this instanceof Kls ) {
            if ( this.init ) {
               this.init.apply( this, arguments );
            }
         }
         // If called without 'new', create a new instance and then call init
         else {
            var ret = new Kls( marker );
            if ( ret.init ) {
               ret.init.apply( ret, arguments );
            }
            return ret;
         }
      };

      // Add the common class variables and methods to the new class
      Kls.constructor = Kls;
      Kls.extend = Base.extend; /* Allow further extension */
      Kls.addMethod = Base.addMethod;
      Kls.addMethods = Base.addMethods;
      Kls.subclassOf = Base.subclassOf;

      Kls._super = this; /* Reference to the parent class */

      // Attach the parent's prototype to the new class's prototype for inheritance
      Kls.prototype = new this( marker );
      Kls.prototype.constructor = Kls;

      // Copy the properties from the 'props' object onto the new prototype
      Kls.addMethods( props );

      return Kls;
   };

} ) ( ); /* End of Base class definition */ ;


// This section handles CSS selector parsing and matching functionality.
/* vendor/jquery.selector/jquery.selector.js */

( function ( $ ) { /* jQuery wrapper for plugin */

   /* Regular expression tokens used for parsing CSS selectors. */
   var tokens = {
      UNICODE:    /\\[0-9a-f]{1,6}(?:\r\n|[ \n\r\t\f])?/,
      ESCAPE:     /(?:UNICODE)|\\[^\n\r\f0-9a-f]/,
      NONASCII:   /[^\x00-\x7F]/,
      NMSTART:    /[_a-z]|(?:NONASCII)|(?:ESCAPE)/,
      NMCHAR:     /[_a-z0-9-]|(?:NONASCII)|(?:ESCAPE)/,
      IDENT:      /-?(?:NMSTART)(?:NMCHAR)*/,

      NL:         /\n|\r\n|\r|\f/, /* Newline characters */

      STRING:     /(?:STRING1)|(?:STRING2)|(?:STRINGBARE)/,
      STRING1:    /"(?:(?:ESCAPE)|\\(?:NL)|[^\n\r\f\"])*"/,
      STRING2:    /'(?:(?:ESCAPE)|\\(?:NL)|[^\n\r\f\'])*'/,
      STRINGBARE: /(?:(?:ESCAPE)|\\(?:NL)|[^\n\r\f\]])*/, /* For attribute values without quotes */

      FUNCTION:   /(?:IDENT)\(\)/, /* CSS function syntax */

      INTEGER:    /[0-9]+/, /* Integer numbers */

      WITHN:      /([-+])?(INTEGER)?(n)\s*(?:([-+])\s*(INTEGER))?/, /* For nth-child with 'n' */
      WITHOUTN:   /([-+])?(INTEGER)/ /* For nth-child without 'n' (just a number) */
   };

   /* Regex rules for various parts of a CSS selector. */
   var rx = {
      not:         /:not\(/, /* Start of :not() pseudo-class */
      not_end:     /\)/,     /* End of :not() pseudo-class */

      tag:         /((?:IDENT)|\*)/, /* Element tag name or universal selector */
      id:          /#(IDENT)/,       /* ID selector */
      cls:         /\.(IDENT)/,      /* Class selector */
      attr:        /\[\s*(IDENT)\s*(?:([^=]?=)\s*(STRING)\s*)?\]/, /* Attribute selector */
      pseudo_el:   /(?::(first-line|first-letter|before|after))|(?:::((?:FUNCTION)|(?:IDENT)))/, /* Pseudo-elements */
      pseudo_cls_nth: /:nth-child\(\s*(?:(?:WITHN)|(?:WITHOUTN)|(odd|even))\s*\)/, /* :nth-child pseudo-class */
      pseudo_cls:  /:(IDENT)/, /* Generic pseudo-class */

      comb:        /\s*(\+|~|>)\s*|\s+/, /* Combinators: +, ~, >, or descendant space */
      comma:       /\s*,\s*/, /* Selector group separator */
      important:   /\s+!important\s*$/ /* !important flag (though not used for matching) */
   };

   /* Replace placeholders in regexes with their actual token definitions, and set all to case-insensitive. */
   var token = /[A-Z][A-Z0-9]+/; /* Pattern to find token placeholders */
   for ( var k in rx ) {
      var m,
          src = rx[ k ].source;
      while ( ( m = src.match( token ) ) ) {
         src = src.replace( m[ 0 ], tokens[ m[ 0 ] ].source ); /* Substitute token source */
      }
      rx[ k ] = new RegExp( src, 'gi' ); /* Create new RegExp, global and case-insensitive */
   }

   /**
    * A string wrapper that allows matching against regexes while keeping track of the current position.
    * Acts like a stream or a "consumable" input.
    */
   var ConsumableString = Base.extend( {
      init: function ( str ) {
         this.str = str; /* The original string */
         this.pos = 0;   /* Current position in the string */
      },

      /**
       * Attempts to match a regex at the current position and advances the position if successful.
       * @param {RegExp} rx - The regular expression to match.
       * @returns {Array|null} The match array if successful, otherwise null.
       */
      match: function ( rx ) {
         var m;
         rx.lastIndex = this.pos; /* Start regex search from current position */
         if ( ( m = rx.exec( this.str ) ) && m.index == this.pos ) {
            this.pos = rx.lastIndex ? rx.lastIndex : this.str.length; /* Advance position */
            return m;
         }
         return null;
      },

      /**
       * Peeks ahead to see if a regex matches, without advancing the position.
       * @param {RegExp} rx - The regular expression to peek with.
       * @returns {Array|null} The match array if successful, otherwise null.
       */
      peek: function ( rx ) {
         var m;
         rx.lastIndex = this.pos; /* Start regex search from current position */
         if ( ( m = rx.exec( this.str ) ) && m.index == this.pos ) {
            return m;
         }
         return null;
      },

      /**
       * Returns a string representation indicating the current parsing position.
       * @returns {string} The string with a marker at the current position.
       */
      showpos: function ( ) {
         return this.str.slice( 0, this.pos ) + '<HERE>' + this.str.slice( this.pos );
      },

      /**
       * Checks if the entire string has been consumed.
       * @returns {boolean} True if parsing is complete, false otherwise.
       */
      done: function ( ) {
         return this.pos == this.str.length;
      }
   } );

   /* A base class that all Selector components inherit from. */
   var SelectorBase = Base.extend( { } );

   /**
    * Represents a Simple Selector, as defined by the CSS3 selector specification.
    * A simple selector consists of a type selector (e.g., tag name), followed by zero or more
    * attribute selectors, ID selectors, class selectors, and pseudo-classes/elements.
    */
   var SimpleSelector = SelectorBase.extend( {
      init: function ( ) {
         this.tag = null;           /* The element tag name (e.g., 'div', 'p', or '*') */
         this.id = null;            /* The ID selector value */
         this.classes = [ ];        /* Array of class names */
         this.attrs = [ ];          /* Array of attribute selectors [name, operator, value] */
         this.nots = [ ];           /* Array of :not() selectors */
         this.pseudo_classes = [ ]; /* Array of pseudo-classes (e.g., :hover, :nth-child) */
         this.pseudo_els = [ ];     /* Array of pseudo-elements (e.g., ::before, ::first-line) */
      },

      /**
       * Parses a simple selector from a ConsumableString.
       * @param {ConsumableString} selector - The string to parse.
       * @returns {SimpleSelector} This instance, populated with parsed data.
       * @throws {string} If an invalid :not term is encountered.
       */
      parse: function ( selector ) {
         var m;

         /* First, attempt to pull out the initial tag (type selector) if one exists */
         if ( ( m = selector.match( rx.tag ) ) ) {
            this.tag = m[ 1 ];
         }

         /* Then, in a loop, try to find and parse various selection types */
         do {
            if ( ( m = selector.match( rx.not ) ) ) {
               // Handle :not() pseudo-class, which contains a nested selector group
               this.nots[ this.nots.length ] = SelectorsGroup( ).parse( selector );
               if ( !( m = selector.match( rx.not_end ) ) ) {
                  throw 'Invalid :not term in selector'; // Ensure the closing parenthesis is present
               }
            } else if ( ( m = selector.match( rx.id ) ) ) {
               this.id = m[ 1 ];
            } else if ( ( m = selector.match( rx.cls ) ) ) {
               this.classes[ this.classes.length ] = m[ 1 ];
            } else if ( ( m = selector.match( rx.attr ) ) ) {
               this.attrs[ this.attrs.length ] = [ m[ 1 ], m[ 2 ], m[ 3 ] ]; // [name, operator, value]
            } else if ( ( m = selector.match( rx.pseudo_el ) ) ) {
               this.pseudo_els[ this.pseudo_els.length ] = m[ 1 ] || m[ 2 ]; // Capture the pseudo-element name
            } else if ( ( m = selector.match( rx.pseudo_cls_nth ) ) ) {
               // Handle :nth-child(an+b), :nth-child(odd), :nth-child(even)
               var a, b;
               if ( m[ 3 ] ) { /* 'odd' or 'even' */
                  a = 2; // For odd/even, 'a' is 2
                  b = ( m[ 3 ] == 'odd' ? 1 : 0 ); // 'b' is 1 for odd, 0 for even
               } else {
                  // For an+b, parse 'a' and 'b' values
                  a = parseInt( ( m[ 1 ] || '' ) + ( m[ 2 ] || '1' ) );
                  b = parseInt( ( m[ 4 ] || '' ) + ( m[ 5 ] || '0' ) );
               }
               this.pseudo_classes[ this.pseudo_classes.length ] = [ 'nth-child', [ a, b ] ];
            } else if ( ( m = selector.match( rx.pseudo_cls ) ) ) {
               this.pseudo_classes[ this.pseudo_classes.length ] = [ m[ 1 ] ]; // Generic pseudo-class
            }

         } while ( m && !selector.done( ) ); // Continue as long as matches are found and string is not consumed

         return this;
      }
   } );

   /**
    * Represents a Selector, which is a sequence of simple selectors and combinators.
    * E.g., "div.foo > span#bar"
    */
   var Selector = SelectorBase.extend( {
      init: function ( ) {
         this.parts = [ ]; // Array of SimpleSelector objects and combinator strings
      },

      /**
       * Parses a selector from a ConsumableString.
       * @param {ConsumableString} cons - The string to parse.
       * @returns {SimpleSelector|Selector} Either a SimpleSelector if only one, or this Selector instance.
       */
      parse: function ( cons ) {
         this.parts[ this.parts.length ] = SimpleSelector( ).parse( cons ); // Parse the first simple selector

         // Continue parsing combinators and subsequent simple selectors
         while ( !cons.done( ) && !cons.peek( rx.comma ) && ( m = cons.match( rx.comb ) ) ) {
            this.parts[ this.parts.length ] = m[ 1 ] || ' '; // Add the combinator (or default to space for descendant)
            this.parts[ this.parts.length ] = SimpleSelector( ).parse( cons ); // Parse the next simple selector
         }

         return this.parts.length == 1 ? this.parts[ 0 ] : this; // If only one part, return it directly
      }
   } );

   /**
    * Represents a Selectors Group, which is a comma-separated list of selectors.
    * E.g., "h1, h2, #foo p"
    */
   var SelectorsGroup = SelectorBase.extend( {
      init: function ( ) {
         this.parts = [ ]; // Array of Selector objects
      },

      /**
       * Parses a selectors group from a ConsumableString.
       * @param {ConsumableString} cons - The string to parse.
       * @returns {Selector|SelectorsGroup} Either a Selector if only one, or this SelectorsGroup instance.
       */
      parse: function ( cons ) {
         this.parts[ this.parts.length ] = Selector( ).parse( cons ); // Parse the first selector

         // Continue parsing comma-separated selectors
         while ( !cons.done( ) && ( m = cons.match( rx.comma ) ) ) {
            this.parts[ this.parts.length ] = Selector( ).parse( cons ); // Parse the next selector
         }

         return this.parts.length == 1 ? this.parts[ 0 ] : this; // If only one part, return it directly
      }
   } );


   /**
    * The main entry point for parsing CSS selectors.
    * @param {string} s - The CSS selector string.
    * @returns {SelectorBase} A parsed selector object.
    * @throws {string} If the selector cannot be fully parsed.
    */
   $.selector = function ( s ) {
      var cons = ConsumableString( s ); // Create a consumable string from the input
      var res = SelectorsGroup( ).parse( cons ); // Start parsing from the highest level (SelectorsGroup)

      res.selector = s; // Store the original selector string for reference

      if ( !cons.done( ) ) {
         throw 'Could not parse selector - ' + cons.showpos( ); // Throw error if not all characters were consumed
      } else {
         return res;
      }
   };

   // Expose the internal selector classes for potential external use or testing.
   $.selector.SelectorBase = SelectorBase;
   $.selector.SimpleSelector = SimpleSelector;
   $.selector.Selector = Selector;
   $.selector.SelectorsGroup = SelectorsGroup;

} ) ( jQuery ) ; /* End of jQuery selector plugin */ ;


/* vendor/jquery.selector/jquery.selector.specifity.js */
// This file extends the selector classes with a `specifity` method.

( function ( $ ) {

   /**
    * Calculates the specificity of a SimpleSelector.
    * @returns {Array<number>} An array [a, b, c] representing specificity.
    */
   $.selector.SimpleSelector.addMethod( 'specifity', function ( ) {
      if ( this.spec ) {
         return this.spec; // Return cached specificity if available
      }

      var spec = [
         this.id ? 1 : 0, /* 'a' value: 1 for an ID selector, 0 otherwise */
         this.classes.length + this.attrs.length + this.pseudo_classes.length, /* 'b' value: count of classes, attributes, and pseudo-classes */
         ( ( this.tag && this.tag != '*' ) ? 1 : 0 ) + this.pseudo_els.length /* 'c' value: 1 for a tag selector (not universal), plus pseudo-elements */
      ];

      // Recursively add specificity from nested :not() selectors
      $.each( this.nots, function ( i, not ) {
         var ns = not.specifity( );
         spec[ 0 ] += ns[ 0 ];
         spec[ 1 ] += ns[ 1 ];
         spec[ 2 ] += ns[ 2 ];
      } );

      return this.spec = spec; // Cache and return the calculated specificity
   } );

   /**
    * Calculates the specificity of a Selector (sequence of simple selectors and combinators).
    * @returns {Array<number>} An array [a, b, c] representing specificity.
    */
   $.selector.Selector.addMethod( 'specifity', function ( ) {
      if ( this.spec ) {
         return this.spec; // Return cached specificity if available
      }

      var spec = [ 0, 0, 0 ];
      // Sum specificities of all SimpleSelector parts (skipping combinators)
      $.each( this.parts, function ( i, part ) {
         if ( i % 2 ) {
            return; // Skip combinator strings (at odd indices)
         }
         var ps = part.specifity( );
         spec[ 0 ] += ps[ 0 ];
         spec[ 1 ] += ps[ 1 ];
         spec[ 2 ] += ps[ 2 ];
      } );

      return this.spec = spec; // Cache and return the calculated specificity
   } );

   /**
    * Calculates the specificity of a SelectorsGroup (comma-separated list of selectors).
    * @returns {Array<number>} An array [a, b, c] representing specificity.
    */
   $.selector.SelectorsGroup.addMethod( 'specifity', function ( ) {
      if ( this.spec ) {
         return this.spec; // Return cached specificity if available
      }

      var spec = [ 0, 0, 0 ];
      // Sum specificities of all individual Selector parts
      $.each( this.parts, function ( i, part ) {
         var ps = part.specifity( );
         spec[ 0 ] += ps[ 0 ];
         spec[ 1 ] += ps[ 1 ];
         spec[ 2 ] += ps[ 2 ];
      } );

      return this.spec = spec; // Cache and return the calculated specificity
   } );


} ) ( jQuery ) ; /* End of specificity extension */ ;


/* vendor/jquery.selector/jquery.selector.matches.js */

/*
   This module provides functionality to determine if a given DOM element
   matches a CSS selector. This is in contrast to Sizzle, which is primarily
   designed for finding elements that match a selector.
*/

( function ( $ ) { /* jQuery plugin wrapper */

   /**** CAPABILITY TESTS ****/

   var div = document.createElement( 'div' );
   div.innerHTML = '<form id="test"><input name="id" type="text"/></form>';

   // Test for IE 6-7 getAttribute behavior.
   // In these browsers, getAttribute often returns property values instead of attribute values.
   // We need to use getAttributeNode for reliable attribute access.
   var getAttributeDodgy = div.firstChild.getAttribute( 'id' ) !== 'test';

   // Test for Element Traversal API support (firstElementChild, previousElementSibling, etc.).
   // These properties provide direct access to element siblings, skipping text nodes.
   var hasElementTraversal = div.firstElementChild && div.firstElementChild.tagName == 'FORM';

   // Test for Element.children support.
   // Element.children returns only element nodes, unlike childNodes which returns all node types.
   var hasChildren = div.children && div.children[ 0 ].tagName == 'FORM';


   // Regular expressions to strip function boilerplate for `funcToString`.
   var FUNC_IN  = /^\s*function\s*\([^)]*\)\s*\{/;
   var FUNC_OUT = /}\s*$/;

   // Helper function to get the body of a function as a string.
   var funcToString = function ( f ) {
      return ( '' + f ).replace( FUNC_IN, '' ).replace( FUNC_OUT, '' );
   };

   // Can we reliably use Function#toString to get function body?
   // Some environments (e.g., older IE) might have issues or return non-executable strings.
   try {
      var testFunc = function ( ) { return 'good'; };
      if ( ( new Function( '', funcToString( testFunc ) ) )( ) != 'good' ) {
         funcToString = false; // If not reliable, disable it.
      }
   }
   catch ( e ) {
      funcToString = false; // If an error occurs, disable it.
      console.log( e.message ); /* Log the error but continue */
   }


   /**** INTRO UTILITIES ****/

   // Placeholder regexes used in generated code for conditional logic.
   var GOOD = /GOOD/g;
   var BAD = /BAD/g;

   // Regex to check if a string starts with quotes.
   var STARTS_WITH_QUOTES = /^['"]/g;

   // Joins an array of JavaScript code lines into a single string.
   var join = function ( js ) {
      return js.join( '\n' );
   };

   // Joins an array of JavaScript code lines into a string,
   // and marks the resulting string as 'complex' (for internal use).
   var join_complex = function ( js ) {
      var code = new String( js.join( '\n' ) ); // String objects can have properties, primitive strings cannot.
      code.complex = true;
      return code;
   };


   /**** ATTRIBUTE ACCESSORS ****/

   // Generates a valid JavaScript variable name for a given attribute name.
   // Non-identifier characters are hex-encoded to prevent syntax errors.
   var varForAttr = function ( attr ) {
      return '_' + attr.replace( /^[^A-Za-z]|[^A-Za-z0-9]/g, function ( m ) {
         return '_0x' + m.charCodeAt( 0 ).toString( 16 ) + '_';
      } );
   };

   var getAttr; // Function to generate JS code for attribute access.

   // For modern browsers: direct `el.getAttribute()` is reliable.
   if ( !getAttributeDodgy ) {
      getAttr = function ( attr ) {
         return 'var ' + varForAttr( attr ) + ' = el.getAttribute("' + attr + '");';
      };
   }
   // For IE 6, 7: `getAttribute` is problematic, use `getAttributeNode` or property mirror.
   else {
      // Map common attribute names to their corresponding DOM property names for IE.
      var getAttrIEMap = { 'class': 'className', 'for': 'htmlFor' };

      getAttr = function ( attr ) {
         var ieattr = getAttrIEMap[ attr ] || attr; // Use mapped name if available.
         // Try getAttribute with flag 2 (for property value), fallback to getAttributeNode.
         return 'var ' + varForAttr( attr ) + ' = el.getAttribute("' + ieattr + '",2) || (el.getAttributeNode("' + attr + '")||{}).nodeValue;';
      };
   }


   /**** ATTRIBUTE COMPARITORS ****/

   // Map of attribute comparison operators to their corresponding JavaScript checks.
   // K = variable holding attribute value, V = value to compare against.
   var attrchecks = {
      '-':  '!K',                                    /* Attribute must not exist */
      '=':  'K != "V"',                              /* Attribute value must be exactly 'V' */
      '!=': 'K == "V"',                              /* Attribute value must NOT be 'V' */
      '~=': '_WS_K.indexOf(" V ") == -1',            /* Attribute value must contain 'V' as a whole word */
      '^=': '!K || K.indexOf("V") != 0',             /* Attribute value must start with 'V' */
      '*=': '!K || K.indexOf("V") == -1',            /* Attribute value must contain 'V' anywhere */
      '$=': '!K || K.substr(K.length-"V".length) != "V"' /* Attribute value must end with 'V' */
   };


   /**** STATE TRACKER FOR CODE GENERATION ****/

   /**
    * Manages the state for generating JavaScript code, particularly for element traversal
    * and attribute access, optimizing by tracking what attributes have already been accessed.
    */
   var State = $.selector.State = Base.extend( {
      init: function ( ) {
         this.reset( ); /* Initialize state variables */
      },

      /** Resets the attribute tracking. */
      reset: function ( ) {
         this.attrs = { };    /* Tracks which attributes have been fetched */
         this.wsattrs = { };  /* Tracks which whitespace-padded attributes have been prepared */
      },

      /** Generates code to move to the previous sibling element. */
      prev: function ( ) {
         this.reset( ); /* Reset state as element changes */
         if ( hasElementTraversal ) {
            return 'el = el.previousElementSibling';
         }
         return 'while((el = el.previousSibling) && el.nodeType != 1) {}'; /* Fallback for older browsers */
      },

      /** Generates code to move to the next sibling element. */
      next: function ( ) {
         this.reset( ); /* Reset state as element changes */
         if ( hasElementTraversal ) {
            return 'el = el.nextElementSibling';
         }
         return 'while((el = el.nextSibling) && el.nodeType != 1) {}'; /* Fallback for older browsers */
      },

      /** Generates code for a loop iterating through previous sibling elements. */
      prevLoop: function ( body ) {
         this.reset( ); /* Reset state inside the loop */
         if ( hasElementTraversal ) {
            return join( [ 'while(el = el.previousElementSibling){', body ] );
         }
         return join( [
            'while(el = el.previousSibling){',
            'if (el.nodeType != 1) continue;', /* Filter out non-element nodes */
            body
         ] );
      },

      /** Generates code to move to the parent element. */
      parent: function ( ) {
         this.reset( ); /* Reset state as element changes */
         return 'el = el.parentNode;';
      },

      /** Generates code for a loop iterating through parent elements. */
      parentLoop: function ( body ) {
         this.reset( ); /* Reset state inside the loop */
         return join( [
            'while((el = el.parentNode) && el.nodeType == 1){',
            body,
            '}'
         ] );
      },

      /**
       * Generates code to get an attribute's value, ensuring it's only fetched once.
       * @param {string} attr - The attribute name.
       * @returns {string|undefined} Generated JS code or undefined if already fetched.
       */
      uses_attr: function ( attr ) {
         if ( this.attrs[ attr ] ) {
            return; /* Already fetched */
         }
         this.attrs[ attr ] = true; /* Mark as fetched */
         return getAttr( attr );
      },

      /**
       * Generates code to get an attribute's value and prepare a whitespace-padded version,
       * ensuring it's only fetched once. Useful for '~=' operator.
       * @param {string} attr - The attribute name.
       * @returns {string|undefined} Generated JS code or undefined if already fetched.
       */
      uses_wsattr: function ( attr ) {
         if ( this.wsattrs[ attr ] ) {
            return; /* Already prepared */
         }
         this.wsattrs[ attr ] = true; /* Mark as prepared */
         return join( [ this.uses_attr( attr ), 'var _WS_' + varForAttr( attr ) + ' = " "+' + varForAttr( attr ) + '+" ";' ] );
      },

      /**
       * Generates code to save the current element reference.
       * @param {string} lbl - A label for the saved element variable.
       * @returns {string} Generated JS code.
       */
      save: function ( lbl ) {
         return 'var el' + lbl + ' = el;';
      },

      /**
       * Generates code to restore a previously saved element reference.
       * @param {string} lbl - The label of the saved element variable.
       * @returns {string} Generated JS code.
       */
      restore: function ( lbl ) {
         this.reset( ); /* Reset state as element changes */
         return 'el = el' + lbl + ';';
      }
   } );


   /**** PSEUDO-CLASS DETAILS AND CODE GENERATION ****/

   // Map of pseudo-class names to functions that generate their matching logic.
   var pseudoclschecks = {
      'first-child': join( [
         'var cel = el;',
         'while(cel = cel.previousSibling){ if (cel.nodeType === 1) BAD; }' /* Check if any previous element sibling exists */
      ] ),
      'last-child': join( [
         'var cel = el;',
         'while(cel = cel.nextSibling){ if (cel.nodeType === 1) BAD; }' /* Check if any next element sibling exists */
      ] ),
      'nth-child': function ( a, b ) { /* Function for :nth-child(an+b) */
         var get_i = join( [
            'var i = 1, cel = el;',
            'while(cel = cel.previousSibling){',
            'if (cel.nodeType === 1) i++;', /* Count previous element siblings */
         ] );