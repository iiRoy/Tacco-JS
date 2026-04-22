//
// This file contains the core logic for the Zen Coding abbreviation expansion.
// It was originally developed by Sergey Chikuyonok.
//
// @author Sergey Chikuyonok (serge.che@gmail.com)
// @link http://chikuyonok.ru
// @include "settings.js"
// @include "/EclipseMonkey/scripts/monkey-doc.js"
//

var zen_coding=( function ( ) {

	// Regular expression to test if a string ends with a complete HTML/XML tag.
	// Used to determine if the '>' character belongs to an abbreviation or a tag.
	var re_tag = /<\/?[\w:\-]+(?:\s+[\w\-:]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*\s*(\/?)>$/;

	// Define constants for different abbreviation types.
	var TYPE_ABBREVIATION = 'zen-tag',
		TYPE_EXPANDO = 'zen-expando',

		// Reference to another abbreviation or tag definition.
		TYPE_REFERENCE = 'zen-reference',

		// Placeholder for content inserted during expansion.
		content_placeholder = '{%::zen-content::%}',
		// Standard newline character.
		newline = '\n';

	// Default profile settings for tag generation.
	var default_profile = {
		tag_case: 'lower', // 'lower' or 'upper' for tag names.
		attr_case: 'lower', // 'lower' or 'upper' for attribute names.
		attr_quotes: 'double', // 'single' or 'double' for attribute values.

		// Controls newline placement for tags:
		// 'true' for all tags, 'false' for no tags, 'decide' based on tag type.
		tag_nl: 'decide',

		place_cursor: true, // Whether to place a cursor placeholder.

		// Indent child tags.
		indent: true,

		// Self-closing style: 'xhtml' for <br />, 'html' for <br>, true for <br/>, false for <br>
		self_closing_tag: 'xhtml'
	};

	// Storage for custom profiles.
	var profiles = {};

	/**
	 * Checks if a character is allowed in a Zen Coding abbreviation.
	 * @param {String} ch The character to check.
	 * @return {Boolean} True if the character is allowed, false otherwise.
	 */
	function isAllowedChar(ch ) {
		var char_code = ch.charCodeAt(0),
			special_chars = '#.>+*:$-_!@';

		// Check for uppercase letters (A-Z)
		return ( char_code > 64 && char_code < 91 )
				|| ( char_code > 96 && char_code < 123 )  // Check for lowercase letters (a-z)
				|| ( char_code > 47 && char_code < 58 )   // Check for numbers (0-9)
				|| special_chars.indexOf(ch) != -1;     // Check for special characters
	}

	/**
	 * Returns the newline character used by the editor.
	 * @return {String} The newline character.
	 */
	function getNewline() {
		return zen_coding.getNewline( );
	}

	/**
	 * Splits a given text into an array of lines.
	 * Optionally removes empty lines.
	 *
	 * @param {String} text The text to split.
	 * @param {Boolean} [remove_empty] If true, empty lines will be filtered out.
	 * @return {Array} An array of strings, each representing a line.
	 */
	function splitByLines( text, remove_empty ) {

		// Normalize newlines to '\n' before splitting to handle
		// different OS newline conventions (e.g., Windows \r\n).
		var lines = text.replace(/\r\n/g, '\n').replace(/\n\r/g, '\n').split('\n');

//		var nl = getNewline(),
//			lines = text.split(new RegExp('\\r?\\n|\\n\\r|\\r|' + nl));

		// If remove_empty is true, iterate and remove any lines that are empty
		// after trimming whitespace.
		if ( remove_empty ) {
			for ( var i = lines.length - 1; i >= 0; i-- ) {
				if ( !trim( lines[i] ) )
					lines.splice(i, 1);
			}
		}

		return lines;
	}

	/**
	 * Trims leading and trailing whitespace from a string.
	 * @param {String} text The string to trim.
	 * @return {String} The trimmed string.
	 */
	function trim( text ) {
		// Ensure text is treated as a string, even if null or undefined.
		return ( text || "" ).replace( /^\s+|\s+$/g, "" );
	}

	/**
	 * Creates a profile object by merging default settings with provided options.
	 * @param {Object} options Custom options to override defaults.
	 * @return {Object} A new profile object.
	 */
	function createProfile( options ) {
		var result = {};
		for ( var p in default_profile )
			result[ p ] = ( p in options ) ? options[ p ] : default_profile[ p ];

		return result;
	}

	/**
	 * Sets up a named profile with specified options.
	 * @param {String} name The name of the profile.
	 * @param {Object} options Custom options for the profile.
	 */
	function setupProfile( name, options ) {
		profiles[ name.toLowerCase( ) ] = createProfile( options || {} );
	}

	/**
	 * Helper function that transforms a comma-separated string into a hash (object).
	 * Each item in the string becomes a key in the object with a value of 'true'.
	 * @param {String} str The comma-separated string.
	 * @return {Object} The resulting hash object.
	 */
	function stringToHash( str ) {
		var obj = {}, items = str.split(",");
		for ( var i = 0; i < items.length; i++ )
			obj[ items[i] ] = true;
		return obj;
	}

	/**
	 * Indents a given text block.
	 * @param {String} text The text to indent.
	 * @param {String|Number} pad The indentation string or number of indentation units.
	 * @return {String} The indented text.
	 */
	function padString( text, pad, verbose ) {
		var pad_str = '', result = '';
		if ( typeof ( pad ) == 'number' )
			for ( var i = 0; i < pad; i++ )
				pad_str += zen_settings.variables.indentation;
		else
			pad_str = pad;

		var lines = splitByLines( text ),
			nl = getNewline( );

		result += lines[0];
		for ( var j = 1; j < lines.length; j++ )
			result += nl + pad_str + lines[j];

		return result;
	}

	/**
	 * Checks if the given abbreviation corresponds to a snippet.
	 * @param {String} abbr The abbreviation to check.
	 * @param {String} type The type of context (e.g., 'html', 'css').
	 * @return {Boolean} True if it's a snippet, false otherwise.
	 */
	function isShippet( abbr, type ) {
		return getSnippet( type, abbr ) ? true : false;
	}

	/**
	 * Checks if a string ends with a complete HTML/XML tag.
	 * This is primarily used to determine if the '>' character belongs to
	 * an abbreviation or a tag structure.
	 * @param {String} str The string to check.
	 * @return {Boolean} True if the string ends with a tag, false otherwise.
	 */
	function isEndsWithTag( str ) {
		return re_tag.test( str );
	}

	/**
	 * Returns a specified collection of elements (e.g., 'empty', 'block_level')
	 * from a given resource. If the collection is not found, an empty object is returned.
	 * @param {Object} resource The resource object containing element types.
	 * @param {String} type The name of the collection (e.g., 'empty', 'block_level').
	 * @return {Object} The collection of elements or an empty object.
	 */
	function getElementsCollection( resource, type ) {
		if ( resource && resource.element_types )
			return resource.element_types[ type ] || {}
		else
			return {};
	}

	/**
	 * Replaces variables like ${var} in a string with their corresponding values.
	 * @param {String} str The string containing variables.
	 * @param {Object} [vars] An optional set of variables. Defaults to `zen_settings.variables`.
	 * @return {String} The string with variables replaced.
	 */
	function replaceVariables( str, vars ) {
		vars = vars || zen_settings.variables;
		return str.replace(/\$\{([\w\-]+)\}/g, function(str, p1) {
			return ( p1 in vars ) ? vars[ p1 ] : str;
		});
	}

	/**
	 * Represents an HTML/XML tag for Zen Coding expansion.
	 * @class
	 * @param {String} name The name of the tag.
	 * @param {Number} count The number of times to repeat the tag (default: 1).
	 * @param {String} type The document type (e.g., 'html', 'xml').
	 */
	function Tag( name, count, type ) {
		name = name.toLowerCase( );
		type = type || 'html';

		var abbr = getAbbreviation( type, name );
		// If it's a reference, resolve it to the actual abbreviation.
		if ( abbr && abbr.type == TYPE_REFERENCE )
			abbr = getAbbreviation( type, abbr.value );

		this.name = ( abbr ) ? abbr.value.name : name.replace('+', '');
		this.count = count || 1;
		this.children = [];
		this.attributes = [];
		this._attr_hash = {}; // Helper for quick attribute lookup.
		this._abbr = abbr; // Reference to the original abbreviation definition.
		this._res = zen_settings[ type ]; // Document type specific settings.
		this._content = ''; // Tag's internal content.
		this.repeat_by_lines = false; // Flag for repeating content by lines.

		// Add default attributes defined in the abbreviation.
		if ( this._abbr && this._abbr.value.attributes ) {
			var def_attrs = this._abbr.value.attributes;
			if ( def_attrs ) {
				for ( var i = 0; i < def_attrs.length; i++ ) {
					var attr = def_attrs[ i ];
					this.addAttribute( attr.name, attr.value );
				}
			}
		}
	}

	Tag.prototype = {
		/**
		 * Adds a new child tag to this tag.
		 * @param {Tag} tag The child tag to add.
		 */
		addChild: function( tag ) {
			this.children.push( tag );
		},

		/**
		 * Adds an attribute to the tag. If an attribute with the same name already exists,
		 * it updates its value (special handling for 'class' attribute).
		 * @param {String} name The name of the attribute.
		 * @param {String} value The value of the attribute.
		 */
		addAttribute: function( name, value ) {
			var a;
			if ( name in this._attr_hash ) {
				// Attribute already exists, update its value.
				a = this._attr_hash[ name ];
				if ( name == 'class' ) {
					// 'class' is a magic attribute: append values with a space.
					a.value += ( ( a.value ) ? ' ' : '' ) + value;
				} else {
					a.value = value; // For other attributes, simply overwrite.
				}
			} else {
				// Add new attribute.
				a = { name: name, value: value };
				this._attr_hash[ name ] = a
				this.attributes.push( a );
			}

		},

		/**
		 * Checks if the current element is an empty tag (e.g., <br>, <img>).
		 * @return {Boolean} True if the element is empty, false otherwise.
		 */
		isEmpty: function( ) {
			return ( this._abbr && this._abbr.value.is_empty ) || ( this.name in getElementsCollection( this._res, 'empty' ) );
		},

		/**
		 * Checks if the current element is an inline-level element.
		 * @return {Boolean} True if the element is inline, false otherwise.
		 */
		isInline: function( ) {
			return ( this.name in getElementsCollection( this._res, 'inline_level' ) );
		},

		/**
		 * Checks if the current element is a block-level element.
		 * @return {Boolean} True if the element is block-level, false otherwise.
		 */
		isBlock: function( ) {
			return ( this.name in getElementsCollection( this._res, 'block_level' ) );
		},

		/**
		 * Tests if the current tag's content contains xHTML tags.
		 * This function is primarily used for output formatting decisions.
		 * @return {Boolean} True if content contains tags, false otherwise.
		 */
		hasTagsInContent: function( ) {
			return this.getContent( ) && re_tag.test( this.getContent( ) );
		},

		/**
		 * Checks if the current tag has any block-level children.
		 * Used for formatting decisions, especially regarding indentation.
		 * @return {Boolean} True if block children exist, false otherwise.
		 */
		hasBlockChildren: function( ) {
			// If content itself contains tags and this is a block, consider it having block children.
			if ( this.hasTagsInContent( ) && this.isBlock( ) ) {
				return true;
			}

			// Check if any direct child is a block-level element.
			for ( var i = 0; i < this.children.length; i++ ) {
				if ( this.children[ i ].isBlock( ) )
					return true;
			}

			return false;
		},

		/**
		 * Sets the textual content for the tag.
		 * @param {String} str The content string.
		 */
		setContent: function( str ) {
			this._content = str;
		},

		/**
		 * Returns the tag's textual content.
		 * @return {String} The content string.
		 */
		getContent: function( ) {
			return this._content;
		},

		/**
		 * Searches for the deepest and latest child of the current element.
		 * This is useful for placing the cursor or content placeholder.
		 * @return {Tag|null} The deepest child tag, or null if no children exist.
		 */
		findDeepestChild: function( ) {
			if ( !this.children.length )
				return null;

			var deepest_child = this;
			while ( true ) {
				// Move to the last child of the current deepest child.
				deepest_child = deepest_child.children[ deepest_child.children.length - 1 ];
				// If this child has no children, it's the deepest.
				if ( !deepest_child.children.length )
					break;
			}

			return deepest_child;
		},

		/**
		 * Transforms and formats the tag into a string representation based on the given profile.
		 * This function is quite complex and handles attribute formatting, child rendering,
		 * indentation, and self-closing tags.
		 *
		 * @param {String} profile_name The name of the profile to use for formatting.
		 * @return {String} The formatted string representation of the tag and its children.
		 * TODO Function is too large, need refactoring
		 */
		toString: function( profile_name ) {

			var result = [],
				profile = ( profile_name in profiles ) ? profiles[ profile_name ] : profiles['plain'],
				attrs = '', // String for attributes
				content = '', // String for tag content (children)
				start_tag = '', // Opening tag string
				end_tag = '', // Closing tag string
				cursor = profile.place_cursor ? '|' : '', // Cursor placeholder
				self_closing = '', // Self-closing indicator (e.g., ' /')
				attr_quote = profile.attr_quotes == 'single' ? "'" : '"', // Attribute quote style
				attr_name, // Temporary variable for attribute name

				is_empty = ( this.isEmpty( ) && !this.children.length ); // Is this an empty tag with no children?

			// Determine self-closing tag style
			if ( profile.self_closing_tag == 'xhtml' )
				self_closing = ' /';
			else if ( profile.self_closing_tag === true )
				self_closing = '/';

			// Helper function to determine if a newline is allowed for a given tag.
			function allowNewline( tag ) {
				return ( profile.tag_nl === true || ( profile.tag_nl == 'decide' && tag.isBlock( ) ) );
			}

			// Generate the attribute string.
			for ( var i = 0; i < this.attributes.length; i++ ) {
				var a = this.attributes[ i ];
				attr_name = ( profile.attr_case == 'upper' ) ? a.name.toUpperCase( ) : a.name.toLowerCase( );
				attrs += ' ' + attr_name + '=' + attr_quote + ( a.value || cursor ) + attr_quote;
			}

			var deepest_child = this.findDeepestChild( );

			// Render children tags if this tag is not empty.
			if ( !is_empty ) {
				if ( deepest_child && this.repeat_by_lines )
					deepest_child.setContent( content_placeholder ); // Content goes into deepest child for line repetition.

				for ( var j = 0; j < this.children.length; j++ ) {
//
					content += this.children[ j ].toString( profile_name );
					// Add newline between children if allowed by profile and tag types.
					if (
						( j != this.children.length - 1 ) &&
						( allowNewline( this.children[ j ] ) || allowNewline( this.children[ j + 1 ] ) )
					)
						content += getNewline( );
				}
			}

			// Define the opening and closing tag strings.
			if ( this.name ) {
				var tag_name = ( profile.tag_case == 'upper' ) ? this.name.toUpperCase( ) : this.name.toLowerCase( );
				if ( is_empty ) {
					start_tag = '<' + tag_name + attrs + self_closing + '>';
				} else {
					start_tag = '<' + tag_name + attrs + '>';
					end_tag = '</' + tag_name + '>';
				}
			}

			// Apply formatting based on profile settings.
			if ( profile.tag_nl !== false ) {
				if (
					this.name &&
					(
						profile.tag_nl === true ||
						this.hasBlockChildren( )
					)
				) {
					if ( end_tag ) { // For non-empty tags, add indentation around content.
						start_tag += getNewline( ) + zen_settings.variables.indentation;
						end_tag = getNewline( ) + end_tag;
					} else { // Empty tag, no special handling here.

					}

				}

				if ( this.name ) {
					if ( content )
						content = padString( content, profile.indent ? 1 : 0 ); // Indent content if enabled.
					else if ( !is_empty )
						start_tag += cursor; // Place cursor inside empty non-self-closing tag.
				}

			}

			// Handle repeating tag by lines of content.
			var cur_content = '';
			if ( this.repeat_by_lines ) {
				var lines = splitByLines( trim( this.getContent( ) ), true );
				for ( var j = 0; j < lines.length; j++ ) {
					cur_content = deepest_child ? '' : content_placeholder; // If deepest_child exists, content placeholder is already set there.
					if ( content && !deepest_child )
						cur_content += getNewline( ); // Add newline if there's other content and no deepest child.

					// Replace $ with current line number (1-indexed).
					var elem_str = start_tag.replace(/\$/g, j + 1) + cur_content + content + end_tag;
					result.push( elem_str.replace( content_placeholder, trim( lines[ j ] ) ) );
				}
			}

			// If not repeating by lines, generate standard output.
			if ( !result.length ) {
				if ( this.getContent( ) ) {
					var pad = ( profile.tag_nl === true || ( this.hasTagsInContent( ) && this.isBlock( ) ) ) ? 1 : 0;
					content = padString( this.getContent( ), pad ) + content; // Indent content if it's external content.
				}

				for ( var i = 0; i < this.count; i++ )
					// Replace $ with current repetition index (1-indexed).
					result.push( start_tag.replace(/\$/g, i + 1) + content + end_tag );
			}

			var glue = '';
			if ( allowNewline( this ) )
				glue = getNewline( );

			return result.join( glue );
		}
	};

	// TODO inherit from Tag
	/**
	 * Represents a Zen Coding snippet, which is a predefined block of code.
	 * @class
	 * @param {String} name The name of the snippet.
	 * @param {Number} count The number of times to repeat the snippet.
	 * @param {String} type The document type.
	 */
	function Snippet( name, count, type ) {
		/** @type {String} */
		this.name = name;
		this.count = count || 1;
		this.children = [];
		this._content = '';
		this.repeat_by_lines = false;
		// Default attributes for snippets, often used for cursor placement.
		this.attributes = {'id': '|', 'class': '|'};
		this.value = getSnippet( type, name );
	}

	Snippet.prototype = {
		/**
		 * Adds a new child tag to this snippet.
		 * @param {Tag} tag The child tag to add.
		 */
		addChild: function( tag ) {
			this.children.push( tag );
		},

		/**
		 * Adds an attribute to the snippet.
		 * @param {String} name The name of the attribute.
		 * @param {String} value The value of the attribute.
		 */
		addAttribute: function( name, value ) {
			this.attributes[ name ] = value;
		},

		/**
		 * Snippets are generally treated as block-level elements for formatting purposes.
		 * @return {Boolean} Always returns true.
		 */
		isBlock: function( ) {
			return true;
		},