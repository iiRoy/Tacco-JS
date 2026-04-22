// This is a comprehensive jQuery i18n plugin for internationalization purposes.
// It allows for easy translation of strings and dynamic content within a web application.

// @project    jQuery i18n Plugin
// @version    <%= pkg.version %> (Built on <%= meta.date %>)
// @author     Your Name / Original Author(s)
// @license    MIT License - Freely distributable and open source.
// @repository https://github.com/recurser/jquery-i18n

// This module is designed to work with jQuery version 1.1 or later.
// Please ensure jQuery is loaded before this script.

( function ( $ ) {


  // The core i18n functionality is encapsulated within this self-executing anonymous function (IIFE).
  // It takes jQuery as an argument to avoid conflicts and ensure scope.


  /**
   * i18n provides a robust mechanism for translating strings
   * using a simple JavaScript dictionary.
   * It supports string interpolation similar to printf.
   */



  // A reference to Array.prototype.slice for efficient argument handling.
  var __slice = Array.prototype.slice;



  /**
   * The main i18n object literal.
   * It holds the translation dictionary and provides translation methods.
   */
  var i18n = {


    // The dictionary where all translations are stored.
    // Initially null, it gets populated by the load method.
    dict: null,



    /**
     * load() method
     *
     * This function is responsible for loading new translations into the plugin's dictionary.
     * It can either initialize the dictionary or extend an existing one.
     *
     * @param   Object i18n_dict   The dictionary object containing key-value pairs for translations.
     *                                 Keys are original strings, values are translated strings.
     * @returns void
     */
    load: function ( i18n_dict ) {

      // Check if a dictionary already exists.
      if ( this.dict !== null ) {

        // If it exists, extend it with the new translations.
        // This allows for loading multiple translation files or partial updates.
        $.extend( this.dict, i18n_dict );

      } else {

        // If no dictionary exists, initialize it with the provided translations.
        this.dict = i18n_dict;

      } // End of if-else for dictionary initialization/extension.

    }, // End of 'load' method definition.



    /**
     * _() method (shorthand for translate)
     *
     * This is the primary translation function. It looks up the given string in the loaded dictionary.
     * If a translation is found, it returns the translated string.
     * If no translation is available, the original string is returned.
     * This method also supports string formatting using printf-like placeholders.
     *
     * @param   String str           The string to be translated.
     * @param   Mixed  params...     Optional additional parameters for printf-style substitution.
     *
     * @return  String               The translated string, or the original string if no translation is found.
     *                                 The string will also have any printf-like substitutions applied.
     */
    _: function ( str ) {

        // Store a reference to the current translation dictionary for quicker access.
        var dict = this.dict;


        // Check if the dictionary exists and if it contains a translation for the given string.
        if ( dict && dict.hasOwnProperty( str ) ) {

            // If a translation is found, update 'str' to its translated value.
            str = dict[ str ];

        } // End of dictionary lookup.


        // Convert the arguments object into a real array.
        // This includes the string to be translated and any subsequent printf parameters.
        var args = __slice.call( arguments );


        // The first element of the 'args' array should always be the (potentially translated) string.
        // This ensures the printf method receives the correct base string.
        args[ 0 ] = str;


        // Substitute any printf parameters into the string.
        // The 'printf' method is called with 'this' context and the modified arguments array.
        return this.printf.apply( this, args );

    }, // End of '_' method definition.



    /**
     * printf() method
     *
     * This utility function performs string substitution similar to the C sprintf function.
     * It replaces '%s' placeholders in a string with values from a given list of arguments.
     * Numbered placeholders like '%1$s' are also supported for specific argument indexing.
     * '%%s' can be used to escape a literal '%s'.
     *
     * @param   String str    The string containing placeholders to be substituted.
     * @param   Array  args   An array of arguments to be inserted into the string.
     *
     * @return  String        The string with all placeholders substituted.
     */
    printf: function ( str, args ) {

        // If there are fewer than 2 arguments (i.e., only the string and no substitution values),
        // return the string as is, as there's nothing to substitute.
        if ( arguments.length < 2 ) {
          return str;
        }


        // Determine the actual arguments array for substitution.
        // If 'args' is already an array, use it directly.
        // Otherwise, slice the 'arguments' object from the second element onwards.
        args = $.isArray( args ) ? args : __slice.call( arguments, 1 );


        // Perform the primary substitution using a regular expression.
        // This regex matches '%s' or '%N$s' (where N is a digit), but not '%%s'.
        var substitutedString = str.replace( /([^%]|^)%(?:(\d+)\$)?s/g, function ( p0, p, position ) {

            // If a numbered position is specified (e.g., '%1$s').
            if ( position ) {

                // Retrieve the argument at the specified index (1-based, so subtract 1).
                // 'p' captures the character before '%', ensuring we don't accidentally replace '%%s'.
                return p + args[ parseInt( position, 10 ) - 1 ];

            }

            // If no numbered position is specified (e.g., '%s'),
            // use the next argument from the front of the 'args' array (FIFO).
            return p + args.shift();

        } ); // End of first replace operation.


        // Finally, replace any escaped '%%s' sequences with a single '%s'.
        return substitutedString.replace( /%%s/g, '%s' );

    } // End of 'printf' method definition.

  }; // End of i18n object definition.



  /**
   * _t() jQuery plugin method
   *
   * This method extends jQuery's prototype, allowing direct translation of elements' HTML content.
   * It leverages the core i18n._() function to translate a given string and then sets the result
   * as the HTML content of the selected jQuery elements.
   *
   * Example usage:
   *   $('h1')._t('some text to translate %s', 'param1');
   *   $('#welcome-message')._t('Hello World!');
   *
   * @param   String str           The string to be translated.
   * @param   Mixed  params...     Optional additional parameters for printf-style substitution.
   *
   * @return  jQuery               The jQuery object, allowing for method chaining.
   */
  $.fn._t = function ( str, params ) {

    // 'this' refers to the jQuery object representing the selected elements.
    // We call the core i18n._() method with the appropriate context and arguments.
    // The result (translated string) is then used to set the HTML content of the elements.
    return $( this ).html( i18n._.apply( i18n, arguments ) );

  }; // End of $.fn._t method.



  // Expose the i18n object globally via the jQuery namespace.
  // This makes the i18n.load(), i18n._(), and i18n.printf() methods directly accessible.
  // Example: $.i18n.load({ 'hello': 'Hola' });
  //          $.i18n._('hello'); // Returns 'Hola'
  $.i18n = i18n;


} )( jQuery ); // Pass jQuery to the IIFE.