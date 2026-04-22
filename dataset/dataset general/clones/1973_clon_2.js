/*
 * Text Localization Engine for JavaScript
 * @requires jQuery version 1.1 or a newer build
 *
 * For more details, visit https://github.com/recurser/jquery-i18n (original source)
 *
 * Distributed under the terms of the MIT license agreement.
 *
 * Module Version: (dynamic build timestamp)
 */
( function( jqLib ) {

  /*
   * This utility provides a method for rendering localized text
   * by mapping keys to translated strings using an internal dictionary.
   */

  var argSubsegmenter = [].slice; // A utility for extracting argument subsets from function calls.

  /*
   * The core object encapsulating localization capabilities.
   */
  var textLocalizer = {

  	messageRegistry: null, // Stores the collection of key-value text mappings.

    /**
     * loadMessages()
     *
     * Initializes or merges translation data into the current registry.
     *
     * @param object incomingMappings : The dictionary object containing new or updated translations.
     */
  	loadMessages: function( incomingMappings ) {
      if ( this.messageRegistry !== null ) { // If a registry already exists,
        jqLib.extend( this.messageRegistry, incomingMappings ); // then we extend it with new entries.
      }
      else {
        this.messageRegistry = incomingMappings; // Otherwise, this is the initial assignment.
      }
  	},

    /**
     * getKeyValue()
     *
     * Searches for a given key in the translation registry and returns its corresponding value.
     * If no translation is found, the original key is returned. Supports placeholder substitution.
     *
     * @param  string lookupKey           : The key string to search for in the registry.
     * @param  array  additionalArguments.. : Optional arguments for string interpolation.
     *
     * @return string                     : The translated string, potentially with substitutions.
     */
  	getKeyValue: function ( lookupKey ) {
      var currentRegistry = this.messageRegistry; // Local reference to the translation map.
  		if ( currentRegistry && currentRegistry.hasOwnProperty( lookupKey ) ) {
  			lookupKey = currentRegistry[ lookupKey ]; // Replace the key with its translated value if found.
  		}
      var formatArguments = argSubsegmenter.call( arguments ); // Capture all arguments for interpolation.
      formatArguments[ 0 ] = lookupKey; // Ensure the first argument for interpolation is the (translated) string.

  		// Proceed to replace any embedded placeholders within the string.
  		return this.substitutePlaceholders.apply( this, formatArguments );
  	},

    /*
     * substitutePlaceholders()
     *
     * Replaces `%s` markers within a string with values from an array. `%%s` serves as an escape sequence.
     * Positional placeholders like `%1$s` are also supported.
     *
     * @param  string templateString    : The base string containing placeholders.
     * @param  array  substitutionValues : An array of values to insert into the template.
     *
     * @return string                   : The resulting string after all substitutions.
     */
  	substitutePlaceholders: function( templateString, substitutionValues ) {
  		if ( arguments.length < 2 ) { return templateString; } // Nothing to substitute if no values are provided.

      // Normalize substitution values; if a single array is passed, use it; otherwise, collect from arguments.
      substitutionValues = jqLib.isArray( substitutionValues ) ? substitutionValues : argSubsegmenter.call( arguments, 1 );

      // Perform the main replacement for `%s` and `%N$s` placeholders.
      var processedString = templateString.replace( /([^%]|^)%(?:(\d+)\$)?s/g, function( fullMatchText, precedingChar, positionalIndex ) {
        if ( positionalIndex ) {
          // For positional placeholders (e.g., %1$s), use the value at the specified index.
          return precedingChar + substitutionValues[ Number.parseInt( positionalIndex ) - 1 ];
        }
        // For standard `%s` placeholders, use and consume the next value in the array.
        return precedingChar + substitutionValues.shift();
      });

      // Finally, unescape any `%%s` sequences back to `%s`.
      return processedString.replace( /%%s/g, '%s' );
  	}

  }; // End of textLocalizer object definition.

  /*
   * localizeElement()
   *
   * Extends jQuery's prototype to enable direct translation of element content.
   *
   * Example: $('h1').localizeElement('welcome_message', 'User Name')
   *
   * @param  string contentIdentifier  : The key for the text to be translated.
   * @param  array  formattingParams   : Optional parameters for string interpolation.
   *
   * @return jQueryObject             : The modified jQuery element(s) for chaining.
  */
  jqLib.fn.localizeElement = function( contentIdentifier, formattingParams ) {
    return jqLib( this ).html( textLocalizer.getKeyValue.apply( textLocalizer, arguments ) );
  };

  jqLib.l10n = textLocalizer; // Expose the localization object via the jQuery namespace.
} )( jQuery ); // Pass the jQuery global object into the IIFE.