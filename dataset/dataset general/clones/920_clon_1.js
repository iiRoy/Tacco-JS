( function ( exports ) {
	"use strict" ;

	function trim ( str ) {
		// Checks if the input 'str' is indeed a string type.
		if ( typeof str == 'string' ) {
			// If it's a string, remove leading and trailing whitespace using regex.
			return str.replace( /^\s+/g , '' ) . replace( /\s+$/g , '' ) ;
		} else {
			// If not a string, return it as is.
			return str ;
		}
	}


	// Split a string using a separator, but only if this separator isn't inside brackets or quotes.
	function protect_split ( separator , str ) {

		var sep = '######' ; // A unique temporary separator to replace actual separators within protected regions.

		var string = false ; // Flag to indicate if we are inside a string (single, double, or backtick).
		var nb_brackets = 0 ; // Counter for nested brackets.
		var new_str = "" ; // Accumulator for the modified string.

		// Iterate through each character of the input string.
		for ( var i = 0 ; i < str.length ; i++ ) {

			// Check for string boundaries.
			if ( ! string && /['"`]/.test( str[ i ] ) ) {
				string = str[ i ] ; // Mark the start of a string and store its type of quote.
			}
			else if ( string && str[ i ] == string ) {
				string = false ; // Mark the end of the current string.
			}
			// Check for bracket boundaries, only if not inside a string.
			else if ( ! string && str[ i ] == '(' ) {
				nb_brackets ++ ; // Increment bracket counter.
			}
			else if ( ! string && str[ i ] == ')' ) {
				nb_brackets -- ; // Decrement bracket counter.
			}

			// If the current character is the separator AND it's inside brackets OR inside a string,
			// replace it with the temporary separator.
			if ( str[ i ] == separator && ( nb_brackets > 0 || string ) ) {
				new_str += sep ;
			}
			else {
				new_str += str[ i ] ; // Otherwise, append the original character.
			}
		}
		str = new_str ; // Update the string with temporary separators.


		str = str.split( separator ) ; // Split the string by the original separator, now only outside protected regions.

		// Map over the split parts to restore the original separators that were replaced by 'sep'.
		str = str.map( function ( item ) {
			return trim( item.replace( new RegExp( sep , 'g' ) , separator ) ) ;
		} ) ;

		return str ; // Return the array of split and trimmed parts.
	}


	// Add some '#' characters inside a string to prevent it from matching a regex/split.
	function protect ( str ) {
		var result = '#' ; // Start with a hash.
		var length = str.length ; // Get the length of the input string.

		// Iterate through each character of the input string.
		for ( var i = 0 ; i < length ; i++ ) {
			result += str[ i ] + "#" ; // Append the character followed by a hash.
		}
		return result ; // Return the 'protected' string.
	}


	// Restore a string output by protect() to its original state.
	function unprotect ( str ) {
		var result = '' ; // Initialize an empty string for the result.
		var length = str.length ; // Get the length of the input 'protected' string.

		// Iterate through the 'protected' string, skipping every other character (the '#').
		for ( var i = 1 ; i < length ; i = i + 2 ) {
			result += str[ i ] ; // Append the actual character.
		}
		return result ; // Return the original string.
	}


	// Parse a SQL query string into an Abstract Syntax Tree (AST) like structure.
	// parseCond: (bool) parse conditions in WHERE and JOIN (default true).
	exports.sql2ast = function ( query , parseCond ) {

		// Set default value for parseCond if not provided or null.
		if ( typeof parseCond == 'undefined' || parseCond === null ) {
			parseCond = true ;
		}


		// Remove semi-colons and keep only the first query encountered.
		var semi_colon = '###semi-colon###' ; // Unique placeholder for semi-colons inside strings/brackets.

		// Replace semi-colons within quoted strings or parentheses to protect them during the main split.
		query = query.replace( /[("'`].*;.*[)"'`]/g , function ( match ) {
			return match.replace( /;/g , semi_colon ) ;
		} ) ;

		var eor = '###EOR###' ; // End-of-query placeholder.

		// Replace remaining semi-colons (which are actual query terminators) with EOR.
		query = query.replace( /;/g , eor ) ;

		// Split by EOR and take only the first part, effectively handling multiple queries.
		query = query.split( eor ) [ 0 ] ;

		// Restore semi-colons that were originally inside strings/brackets.
		query = query.replace( new RegExp( semi_colon , 'g' ) , ';' ) ;


		// Define SQL keywords that act as separators for parsing different query parts.
		var keywords = [
			'SELECT' , 'FROM' , 'DELETE FROM' , 'INSERT INTO' , 'UPDATE' ,
			'JOIN' , 'LEFT JOIN' , 'RIGHT JOIN' , 'INNER JOIN' ,
			'ORDER BY' , 'GROUP BY' , 'HAVING' , 'WHERE' , 'LIMIT' , 'VALUES' , 'SET'
		] ;

		// Generate a list of part names, including trailing space for exact matching.
		var parts_name = keywords.map( function ( item ) {
			return item + ' ' ;
		} ) ;

		// Add variations with an opening parenthesis (e.g., "SELECT(").
		parts_name = parts_name.concat( keywords.map( function ( item ) {
			return item + '(' ;
		} ) ) ;

		// Add lowercase versions of all generated part names.
		parts_name = parts_name.concat( parts_name.map( function ( item ) {
			return item.toLowerCase() ;
		} ) ) ;

		// Escape parentheses in part names for use in regular expressions.
		var parts_name_escaped = parts_name.map( function ( item ) {
			return item.replace( '(' , '[\\(]' ) ;
		} ) ;


		// Hide words defined as separators that might appear inside brackets, quotes, or backticks
		// by applying the `protect` function to them. This prevents them from being treated as actual separators.
		query = query.replace( /\((.+?)\)|"(.+?)"|'(.+?)'|`(.+?)`/gi , function ( match ) {
			return match.replace( new RegExp( parts_name_escaped.join( '|' ) , 'gi' ) , protect ) ;
		} ) ;


		// Determine the positions of these separators in the query string to establish the order of parts.
		var parts_order = [] ;

		// Helper callback to extract the real keyword name from a matched string (e.g., 'SELECT ' -> 'SELECT').
		function realNameCallback ( match , name ) {
			return name ;
		}

		// Iterate through each potential part name.
		parts_name.forEach( function ( item ) {
			var pos = 0 ; // Start search position.
			var part ;

			do {
				part = query.indexOf( item , pos ) ; // Find the next occurrence of the part name.
				if ( part != -1 ) {
					// Extract the canonical name (e.g., 'SELECT' from 'SELECT ').
					var realName = item.replace( /^((\w|\s)+?)\s?\(?$/i , realNameCallback ) ;

					// Store the real name at its starting position in the query.
					// Note: Position might be slightly off due to `protect()`/`unprotect()` but order is preserved.
					parts_order[ part ] = realName ;
					pos = part + realName.length ; // Move the search position past the found part.
				}
			}
			while ( part != -1 ) ; // Continue until no more occurrences are found.
		} ) ;


		// Delete duplicate entries (e.g., 'JOIN' and 'INNER JOIN' might both match at the same spot).
		var busy_until = 0 ; // Tracks the end position of the last valid keyword found.

		parts_order.forEach( function ( item , key ) {
			// If the current keyword starts before the previous one ended, it's a duplicate or overlapping.
			if ( busy_until > key ) {
				delete parts_order[ key ] ; // Remove it.
			}
			else {
				// Update busy_until to mark the end of the current keyword.
				busy_until = parseInt( key , 10 ) + item.length ;

				// Replace 'JOIN' with 'INNER JOIN' for consistency in parsing.
				if ( item == 'JOIN' ) {
					parts_order[ key ] = 'INNER JOIN' ;
				}
			}
		} ) ;


		// Generate a list of 'protected' words to reverse the `protect()` operation later.
		var words = parts_name_escaped.slice( 0 ) ; // Create a copy.
		words = words.map( function ( item ) {
			return protect( item ) ; // Protect each escaped part name.
		} ) ;
		words = words.join( '|' ) ; // Join them into a single regex alternation string.


		// Split the query into its main parts using the escaped keyword regex.
		var parts = query.split( new RegExp( parts_name_escaped.join( '|' ) , 'i' ) ) ;


		// Unhide words that were previously hidden with `protect()` inside quotes/brackets.
		query = query.replace( /\((.+?)\)|"(.+?)"|'(.+?)'|`(.+?)`/gi , function ( match ) {
			return match.replace( new RegExp( words , 'gi' ) , unprotect ) ;
		} ) ;

		// Apply the same unhiding logic to each of the split parts.
		parts = parts.map( function ( item ) {
			return item.replace( /\((.+?)\)|"(.+?)"|'(.+?)'|`(.+?)`/gi , function ( match ) {
				return match.replace( new RegExp( words , 'gi' ) , unprotect ) ;
			} ) ;
		} ) ;


		// Define analysis functions for each SQL keyword type.
		var analysis = [] ;


		// Analysis for 'SELECT' clause.
		analysis[ 'SELECT' ] = function ( str ) {
			var result = protect_split( ',' , str ) ; // Split by comma, respecting quotes/brackets.
			result = result.filter( function ( item ) {
				return item !== '' ; // Remove empty items.
			} ) . map( function ( item ) {
				return { name : item } ; // Map to an object with a 'name' property.
			} ) ;
			return result ;
		} ;


		// Analysis for 'SET' clause (used in UPDATE statements).
		analysis[ 'SET' ] = function ( str ) {
			var result = protect_split( ',' , str ) ; // Split by comma.
			result = result.filter( function ( item ) {
				return item !== '' ; // Remove empty items.
			} ) . map( function ( item ) {
				return { expression : item } ; // Map to an object with an 'expression' property.
			} ) ;
			return result ;
		} ;


		// Analysis for 'FROM', 'DELETE FROM', and 'UPDATE' clauses (table identification).
		analysis[ 'FROM' ] = analysis[ 'DELETE FROM' ] = analysis[ 'UPDATE' ] = function ( str ) {
			var result = str.split( ',' ) ; // Split by comma.
			result = result.map( function ( item ) {
				return trim( item ) ; // Trim each item.
			} ) ;
			result.forEach( function ( item , key ) {
				if ( item === '' ) {
					result.splice( key ) ; // Remove any empty items.
				}
			} ) ;
			result = result.map( function ( item ) {
				var table = item.split( ' AS ' ) ; // Split by ' AS ' to find alias.
				var alias = table[ 1 ] || '' ; // Get alias or empty string if none.
				// Remove quotes from alias if present.
				if ( alias.indexOf( '"' ) === 0 && alias.lastIndexOf( '"' ) == alias.length - 1 ) {
					alias = alias.substring( 1 , alias.length - 1 ) ;
				}
				return { table : table[ 0 ] , as : alias } ; // Return object with table and alias.
			} ) ;
			return result ;
		} ;


		// Analysis for 'JOIN' clauses (LEFT, INNER, RIGHT).
		analysis[ 'LEFT JOIN' ] = analysis[ 'JOIN' ] = analysis[ 'INNER JOIN' ] = analysis[ 'RIGHT JOIN' ] = function ( str ) {
			str = str.split( ' ON ' ) ; // Split by ' ON ' to separate table from condition.
			var table = str[ 0 ] . split( ' AS ' ) ; // Split table part by ' AS '.
			var result = {} ;
			result[ 'table' ] = trim( table[ 0 ] ) ; // Table name.
			result[ 'as' ] = trim( table[ 1 ] ) || '' ; // Alias or empty string.
			result[ 'cond' ] = trim( str[ 1 ] ) ; // Join condition.

			return result ;
		} ;


		// Analysis for 'WHERE' clause.
		analysis[ 'WHERE' ] = function ( str ) {
			return trim( str ) ; // Simply trim the condition string.
		} ;


		// Analysis for 'ORDER BY' clause.
		analysis[ 'ORDER BY' ] = function ( str ) {
			str = str.split( ',' ) ; // Split by comma.
			var result = [] ;
			str.forEach( function ( item ) {
				var order_by = /([A-Za-z0-9_\.]+)\s*(ASC|DESC){0,1}/gi ; // Regex to capture column and order.
				order_by = order_by.exec( item ) ;
				if ( order_by !== null ) {
					var tmp = {} ;
					tmp[ 'column' ] = trim( order_by[ 1 ] ) ; // Column name.
					tmp[ 'order' ] = trim( order_by[ 2 ] ) ; // Order (ASC/DESC).
					if ( order_by[ 2 ] === undefined ) {
						tmp[ 'order' ] = "ASC" ; // Default to ASC if not specified.
					}
					result.push( tmp ) ;
				}
			} ) ;
			return result ;
		} ;


		// Analysis for 'GROUP BY' clause.
		analysis[ 'GROUP BY' ] = function ( str ) {
			str = str.split( ',' ) ; // Split by comma.
			var result = [] ;
			str.forEach( function ( item ) {
				var group_by = /([A-Za-z0-9_\.]+)/gi ; // Regex to capture column.
				group_by = group_by.exec( item ) ;
				if ( group_by !== null ) {
					var tmp = {} ;
					tmp[ 'column' ] = trim( group_by[ 1 ] ) ; // Column name.
					result.push( tmp ) ;
				}
			} ) ;
			return result ;
		} ;


		// Analysis for 'LIMIT' clause.
		analysis[ 'LIMIT' ] = function ( str ) {
			var limit = /((\d+)\s*,\s*)?(\d+)/gi ; // Regex to capture offset and limit.
			limit = limit.exec( str ) ;
			if ( typeof limit[ 2 ] == 'undefined' ) {
				limit[ 2 ] = 0 ; // Default offset to 0 if not specified.
			}
			var result = {} ;
			result[ 'nb' ] = parseInt( trim( limit[ 3 ] ) , 10 ) ; // Number of rows.
			result[ 'from' ] = parseInt( trim( limit[ 2 ] ) , 10 ) ; // Starting offset.
			return result ;
		} ;


		// Analysis for 'INSERT INTO' clause.
		analysis[ 'INSERT INTO' ] = function ( str ) {
			var insert = /([A-Za-z0-9_\.]+)\s*(\(([A-Za-z0-9_\., ]+)\))?/gi ; // Regex for table and optional columns.
			insert = insert.exec( str ) ;
			var result = {} ;
			result[ 'table' ] = trim( insert[ 1 ] ) ; // Table name.
			if ( typeof insert[ 3 ] != 'undefined' ) {
				result[ 'columns' ] = insert[ 3 ] . split( ',' ) ; // Split columns.
				result[ 'columns' ] = result[ 'columns' ] . map( function ( item ) {
					return trim( item ) ; // Trim each column name.
				} ) ;
			}
			return result ;
		} ;


		// Analysis for 'VALUES' clause.
		analysis[ 'VALUES' ] = function ( str ) {
			str = trim( str ) ;
			if ( str[ 0 ] != '(' ) {
				str = '(' + str ; // Prepend '(' if missing (e.g., "VALUES(...)" instead of "VALUES (...)").
			}
			var groups = protect_split( ',' , str ) ; // Split by comma to get value groups.
			var result = [] ;
			groups.forEach( function ( group ) {
				group = group.replace( /^\(/g , '' ) . replace( /\)$/g , '' ) ; // Remove outer parentheses from group.
				group = protect_split( ',' , group ) ; // Split individual values within the group.
				result.push( group ) ;
			} ) ;
			return result ;
		} ;

		// TODO: handle HAVING clause, as it's currently not implemented in the analysis functions.


		// Analyze the parts of the query based on their identified order and types.
		var result = {} ; // The final AST-like object.
		var j = 0 ; // Counter for the `parts` array.

		// Iterate through `parts_order` which contains keywords indexed by their position.
		parts_order.forEach( function ( item , key ) {
			item = item.toUpperCase() ; // Convert keyword to uppercase for consistent lookup.
			j ++ ; // Increment parts array index.

			// If an analysis function exists for the current keyword.
			if ( typeof analysis[ item ] != 'undefined' ) {
				var part_result = analysis[ item ] ( parts[ j ] ) ; // Apply the analysis function to the corresponding part content.

				// Handle cases where a keyword might appear multiple times (e.g., multiple JOINs).
				if ( typeof result[ item ] != 'undefined' ) {
					// If it's a single string or an array not yet initialized for multiple items, convert it.
					if ( typeof result[ item ] == 'string' || typeof result[ item ] [ 0 ] == 'undefined' ) {
						var tmp = result[ item ] ;
						result[ item ] = [] ;
						result[ item ] . push( tmp ) ;
					}
					result[ item ] . push( part_result ) ; // Add the new part result to the array.
				}
				else {
					result[ item ] = part_result ; // Assign the result directly if it's the first occurrence.
				}
			}
			else {
				// Log a warning if an unknown statement is encountered.
				console.log( 'Can\'t analyze statement "' + item + '"' ) ;
			}
		} ) ;


		// Reorganize JOIN types into a single 'JOIN' array with 'type' property.
		if ( typeof result[ 'LEFT JOIN' ] != 'undefined' ) {
			if ( typeof result[ 'JOIN' ] == 'undefined' ) {
				result[ 'JOIN' ] = [] ; // Initialize 'JOIN' array if it doesn't exist.
			}
			if ( typeof result[ 'LEFT JOIN' ] [ 0 ] != 'undefined' ) {
				// If multiple LEFT JOINs, iterate and add type.
				result[ 'LEFT JOIN' ] . forEach( function ( item ) {
					item.type = 'left' ;
					result[ 'JOIN' ] . push( item ) ;
				} ) ;
			}
			else {
				// If a single LEFT JOIN.
				result[ 'LEFT JOIN' ] . type = 'left' ;
				result[ 'JOIN' ] . push( result[ 'LEFT JOIN' ] ) ;
			}
			delete result[ 'LEFT JOIN' ] ; // Remove the specific 'LEFT JOIN' key.
		}

		if ( typeof result[ 'INNER JOIN' ] != 'undefined' ) {
			if ( typeof result[ 'JOIN' ] == 'undefined' ) {
				result[ 'JOIN' ] = [] ;
			}
			if ( typeof result[ 'INNER JOIN' ] [ 0 ] != 'undefined' ) {
				result[ 'INNER JOIN' ] . forEach( function ( item ) {
					item.type = 'inner' ;
					result[ 'JOIN' ] . push( item ) ;
				} ) ;
			}
			else {
				result[ 'INNER JOIN' ] . type = 'inner' ;
				result[ 'JOIN' ] . push( result[ 'INNER JOIN' ] ) ;
			}
			delete result[ 'INNER JOIN' ] ;
		}

		if ( typeof result[ 'RIGHT JOIN' ] != 'undefined' ) {
			if ( typeof result[ 'JOIN' ] == 'undefined' ) {
				result[ 'JOIN' ] = [] ;
			}
			if ( typeof result[ 'RIGHT JOIN' ] [ 0 ] != 'undefined' ) {
				result[ 'RIGHT JOIN' ] . forEach( function ( item ) {
					item.type = 'right' ;
					result[ 'JOIN' ] . push( item ) ;
				} ) ;
			}
			else {
				result[ 'RIGHT JOIN' ] . type = 'right' ;
				result[ 'JOIN' ] . push( result[ 'RIGHT JOIN' ] ) ;
			}
			delete result[ 'RIGHT JOIN' ] ;
		}


		// Parse conditions using CondParser if `parseCond` is true.
		if ( parseCond ) {
			if ( typeof result[ 'WHERE' ] == 'string' ) {
				result[ 'WHERE' ] = CondParser.parse( result[ 'WHERE' ] ) ;
			}
			if ( typeof result[ 'JOIN' ] != 'undefined' ) {
				result[ 'JOIN' ] . forEach( function ( item , key ) {
					result[ 'JOIN' ] [ key ] [ 'cond' ] = CondParser.parse( item[ 'cond' ] ) ;
				} ) ;
			}
		}

		return result ; // Return the final AST.
	} ;


	/*
	 * LEXER & PARSER FOR SQL CONDITIONS
	 * Inspired by https://github.com/DmitrySoshnikov/Essentials-of-interpretation
	 */

	// Constructor for the Condition Lexer.
	function CondLexer ( source ) {
		this.source = source ; // The input SQL condition string.
		this.cursor = 0 ; // Current position in the source string.
		this.currentChar = "" ; // The character at the current cursor position.

		this.readNextChar() ; // Initialize by reading the first character.
	}

	CondLexer.prototype = {
		constructor : CondLexer , // Explicitly set constructor for prototype.

		// Read the next character from the source string.
		// Returns an empty string if the cursor is at the end of the source.
		readNextChar : function () {
			if ( typeof this.source != 'string' ) {
				this.currentChar = "" ; // If source is not a string, reset current char.
			}
			else {
				this.currentChar = this.source[ this.cursor++ ] || "" ; // Get char and advance cursor.
			}
		} ,

		// Determine and return the next token from the input stream.
		readNextToken : function () {
			if ( /\w/.test( this.currentChar ) ) {
				return this.readWord() ; // If alphanumeric, read a word.
			}
			if ( /["'`]/.test( this.currentChar ) ) {
				return this.readString() ; // If quote, read a string.
			}
			if ( /[()]/.test( this.currentChar ) ) {
				return this.readGroupSymbol() ; // If parenthesis, read group symbol.
			}
			if ( /[!=<>]/.test( this.currentChar ) ) {
				return this.readOperator() ; // If operator symbol, read operator.
			}

			if ( this.currentChar === "" ) {
				return { type : 'eot' , value : '' } ; // End of text token.
			}
			else {
				this.readNextChar() ; // Skip unrecognized character.
				return { type : 'empty' , value : '' } ; // Return an empty token.
			}
		} ,

		// Read a sequence of characters that forms a word (identifier, keyword, etc.).
		readWord : function () {
			var tokenValue = "" ;
			var nb_brackets = 0 ; // Counter for nested parentheses within a word.
			var string = false ; // Flag to detect if inside a quoted string within a word.

			while ( /./.test( this.currentChar ) ) { // While there are characters to read.
				// Check for string boundaries within the word.
				if ( ! string && /['"`]/.test( this.currentChar ) ) {
					string = this.currentChar ;
				}
				else if ( string && this.currentChar == string ) {
					string = false ;
				}
				else {
					// Allow spaces inside functions (only if not in a string).
					if ( ! string ) {
						// Token finishes if a closing bracket is found without an open one (or balanced).
						if ( this.currentChar == ')' && nb_brackets <= 0 ) {
							break ;
						}

						if ( this.currentChar == '(' ) {
							nb_brackets ++ ;
						}
						else if ( this.currentChar == ')' ) {
							nb_brackets -- ;
						}

						// Token finishes if an operator symbol is found outside a string.
						if ( /[!=<>]/.test( this.currentChar ) ) {
							break ;
						}
					}

					// Token finishes on the first space which is outside a string or a function.
					if ( this.currentChar == ' ' && nb_brackets <= 0 ) {
						break ;
					}
				}

				tokenValue += this.currentChar ; // Accumulate character into token value.
				this.readNextChar() ; // Move to the next character.
			}

			// Determine the type of word token.
			if ( /^(AND|OR)$/i.test( tokenValue ) ) {
				return { type : 'logic' , value : tokenValue } ; // Logical operator.
			}
			if ( /^(IN|IS|NOT|LIKE)$/i.test( tokenValue ) ) {
				return { type : 'operator' , value : tokenValue } ; // SQL operator.
			}
			else {
				return { type : 'word' , value : tokenValue } ; // General word.
			}
		} ,

		// Read a quoted string literal.
		readString : function () {
			var tokenValue = "" ;
			var quote = this.currentChar ; // Store the type of quote (', ", `).

			tokenValue += this.currentChar ; // Include the opening quote.
			this.readNextChar() ;

			// Read characters until the closing quote or end of source.
			while ( this.currentChar != quote && this.currentChar !== "" ) {
				tokenValue += this.currentChar ;
				this.readNextChar() ;
			}

			tokenValue += this.currentChar ; // Include the closing quote.
			this.readNextChar() ;

			// Handle cases like `table`.`column` where dot connects two quoted identifiers.
			if ( this.currentChar == '.' ) {
				tokenValue += this.currentChar ; // Include the dot.
				this.readNextChar() ;
				tokenValue += this.readString() . value ; // Recursively read the next quoted part.

				return { type : 'word' , value : tokenValue } ; // Treat as a single word/identifier.
			}

			return { type : 'string' , value : tokenValue } ; // Return as a string literal token.
		} ,

		// Read a grouping symbol (parentheses).
		readGroupSymbol : function () {
			var tokenValue = this.currentChar ;
			this.readNextChar() ;

			return { type : 'group' , value : tokenValue } ;
		} ,

		// Read an operator symbol (e.g., =, !=, <, >=).
		readOperator : function () {
			var tokenValue = this.currentChar ;
			this.readNextChar() ;

			// Check for multi-character operators (e.g., <=, >=, !=, ==).
			if ( /[=<>]/.test( this.currentChar ) ) {
				tokenValue += this.currentChar ;
				this.readNextChar() ;
			}

			return { type : 'operator' , value : tokenValue } ;
		} ,
	} ;

	// Static method to tokenize a string (primarily for debugging CondLexer).
	CondLexer.tokenize = function ( source ) {
		var lexer = new CondLexer( source ) ; // Create a new lexer instance.
		var tokens = [] ; // Array to store tokens.
		do {
			var token = lexer.readNextToken() ; // Read next token.
			if ( token.type != 'empty' ) {
				tokens.push( token ) ; // Add non-empty tokens.
			}
		}
		while ( lexer.currentChar ) ; // Continue until end of source.
		return tokens ;
	} ;


	// Constructor for the Condition Parser.
	function CondParser ( source ) {
		this.lexer = new CondLexer( source ) ; // Initialize with a CondLexer.
		this.currentToken = "" ; // The current token being processed.

		this.readNextToken() ; // Read the first token to start parsing.
	}

	CondParser.prototype = {
		constructor : CondParser , // Explicitly set constructor for prototype.

		// Read the next token from the lexer, skipping any 'empty' tokens.
		readNextToken : function () {
			this.currentToken = this.lexer.readNextToken() ;
			while ( this.currentToken.type == 'empty' ) {
				this.currentToken = this.lexer.readNextToken() ;
			}
			return this.currentToken ;
		} ,

		// Wrapper function to start the recursive parsing of logical expressions.
		parseExpressionsRecursively : function () {
			return this.parseLogicalExpression() ;
		} ,