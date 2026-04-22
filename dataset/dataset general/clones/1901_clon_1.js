/*
 * This module provides utility functions for encoding and decoding
 * data within a URL's hash fragment. It supports simple key-value pairs
 * and boolean flags.
 */
define(
	function ( )
	{
		'use strict' ; // Enforce strict mode for better error handling

		/**
		 * Parses a hash fragment string into an object.
		 * The hash format is expected to be '#key1:value1,key2,key3:value3'.
		 * Keys without values are treated as boolean 'true'.
		 *
		 * @param {string} hash - The hash string, potentially including the leading '#'.
		 * @returns {object} An object representation of the hash data.
		 */
		function parseHash ( hash )
		{
			var ret = { } ; // Initialize the return object

			if ( ! hash )
			{
				return ret ; // Return empty object if hash is null or empty
			}

			// Remove leading '#' if present and split by comma to get individual parts
			hash.replace( /^#/, '' ).split( ',' ).forEach(
				function ( part )
				{
					// Split each part into key and value
					var parts = part.split( ':' ) ;

					if ( parts.length === 1 )
					{
						// If only one part, it's a boolean flag (key is true)
						ret[ parts[0] ] = true ;
					}
					else if ( parts.length === 2 )
					{
						// If two parts, it's a key-value pair
						ret[ parts[0] ] = getValue( parts[1] ) ;
					}
					else
					{
						// Any other format is unsupported
						throw new Error( 'supports only simple strings' ) ;
					}
				}
			) ;

			return ret ; // Return the parsed object
		}


		/**
		 * Asserts that a given value does not contain reserved characters
		 * like ':' or ',' which are used as delimiters in the hash format.
		 *
		 * @param {string} value - The string value to check.
		 * @throws {Error} If the value contains forbidden characters.
		 */
		function assertSimple ( value )
		{
			if ( value.indexOf( ':' ) > -1 || value.indexOf( ',' ) > -1 )
			{
				throw new Error( 'supports only simple strings' ) ; // Indicate unsupported characters
			}
		}


		/**
		 * Converts a string value from the hash into its appropriate JavaScript type.
		 * Handles numbers, booleans, null, undefined, and returns string otherwise.
		 *
		 * @param {string} value - The string value to convert.
		 * @returns {*} The converted value (number, boolean, null, undefined, or string).
		 */
		function getValue ( value )
		{
			value = unescape( value ) ; // Decode URI components

			var num = parseInt( value, 10 ) ; // Attempt to parse as an integer

			if ( ! isNaN( num ) )
			{
				return num ; // Return number if parsing was successful
			}

			// Check for boolean string representations
			if ( value === 'true' )
			{
				return true ;
			}

			if ( value === 'false' )
			{
				return false ;
			}

			// Check for null and undefined string representations
			if ( value === 'null' )
			{
				return null ;
			}

			if ( value === 'undefined' )
			{
				return undefined ;
			}

			return value ; // Return original string if no special type matched
		}


		/**
		 * Converts an object into a hash fragment string.
		 *
		 * @param {object} obj - The object to convert.
		 * @returns {string} The formatted hash string, including the leading '#'.
		 */
		function makeHash ( obj )
		{
			var ret = '' ; // Initialize the return string

			if ( ! obj )
			{
				return ret ; // Return empty string if object is null or undefined
			}

			var keys = Object.keys( obj ) ; // Get all keys from the object

			if ( keys.length === 0 )
			{
				return ret ; // Return empty string if object has no properties
			}

			// Build the hash string: '#key1:value1,key2:value2'
			ret = '#' + Object.keys( obj ).map(
				function ( key )
				{
					// Escape the value to be URL-safe
					var value = escape( String( obj[ key ] ) ) ;

					// Ensure the escaped value doesn't contain delimiters
					assertSimple( value ) ;

					return key + ':' + value ; // Format as 'key:value'
				}
			).join( ',' ) ; // Join all key-value pairs with a comma

			return ret ; // Return the final hash string
		}


		// Expose the public API of this module
		return {
			getValue : getValue ,
			parseHash : parseHash ,
			makeHash : makeHash
		} ;
	}
) ;