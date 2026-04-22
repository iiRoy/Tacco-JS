( function ( moduleExports ) {
	"use strict"; /* Enforce strict JavaScript parsing rules. */

	/**
	 * Removes leading and trailing whitespace from a given string.
	 * If the input is not a string, it is returned as-is.
	 * @param {any} inputText - The string or other value to process.
	 * @returns {any} The trimmed string or original input.
	 */
	function cleanWhitespace( inputText ) {
		if ( typeof inputText === 'string' ) {
			return inputText.replace( /^\s+/g, '' ).replace( /\s+$/g, '' );
		} else {
			return inputText;
		}
	}

	/**
	 * Divides a text segment by a specific delimiter, but only if that delimiter
	 * is not found within quotation marks or nested parentheses.
	 * @param {string} dividerMark - The character or string to split by.
	 * @param {string} sourceText - The original text to be divided.
	 * @returns {Array<string>} An array of text segments.
	 */
	function shieldedDivide( dividerMark, sourceText ) {
		var tempPlaceholder = '###TEMP_DELIM_MARK###'; /* Internal placeholder for protected delimiters. */

		var inQuoteMode = false;
		var parenNestingLevel = 0;
		var resultantText = "";

		for ( var charIndex = 0; charIndex < sourceText.length; charIndex++ ) {
			var currentSymbol = sourceText[ charIndex ];

			// Manage quote state
			if ( !inQuoteMode && /['"`]/.test( currentSymbol ) ) {
				inQuoteMode = currentSymbol;
			} else if ( inQuoteMode && currentSymbol === inQuoteMode ) {
				inQuoteMode = false;
			}
			// Manage parenthesis nesting
			else if ( !inQuoteMode && currentSymbol === '(' ) {
				parenNestingLevel++;
			} else if ( !inQuoteMode && currentSymbol === ')' ) {
				parenNestingLevel--;
			}

			// Replace delimiter if within protected context
			if ( currentSymbol === dividerMark && ( parenNestingLevel > 0 || inQuoteMode ) ) {
				resultantText += tempPlaceholder;
			} else {
				resultantText += currentSymbol;
			}
		}
		sourceText = resultantText; /* Update the source with temporary marks. */

		var segmentedList = sourceText.split( dividerMark );
		segmentedList = segmentedList.map( function ( segmentEntry ) {
			return cleanWhitespace( segmentEntry.replace( new RegExp( tempPlaceholder, 'g' ), dividerMark ) );
		} );

		return segmentedList;
	}

	/**
	 * Inserts special marking characters around each character of an input string.
	 * This helps prevent the string from being matched by certain regex patterns or split operations.
	 * @param {string} originalText - The string to be marked.
	 * @returns {string} The marked string.
	 */
	function insertDelimiters( originalText ) {
		var markedOutcome = '$'; /* Starting delimiter. */
		var textLength = originalText.length;
		for ( var charPos = 0; charPos < textLength; charPos++ ) {
			markedOutcome += originalText[ charPos ] + "$"; /* Add delimiter after each char. */
		}
		return markedOutcome;
	}

	/**
	 * Reverts a string processed by `insertDelimiters` back to its original state.
	 * Removes the special marking characters.
	 * @param {string} delimitedText - The string with delimiters.
	 * @returns {string} The restored original string.
	 */
	function removeDelimiters( delimitedText ) {
		var restoredOutcome = '';
		var textSpan = delimitedText.length;
		for ( var charIndex = 1; charIndex < textSpan; charIndex += 2 ) {
			restoredOutcome += delimitedText[ charIndex ];
		}
		return restoredOutcome;
	}


	/**
	 * Converts an SQL query string into an Abstract Syntax Tree (AST) representation.
	 * @param {string} sqlText - The SQL query string to be parsed.
	 * @param {boolean} processConditions - Flag to enable or disable parsing of WHERE and JOIN conditions. Defaults to true.
	 * @returns {object} An object representing the AST of the SQL query.
	 */
	moduleExports.queryToAbstractTree = function ( sqlText, processConditions ) {
		if ( typeof processConditions === 'undefined' || processConditions === null ) {
			processConditions = true;
		}

		// Normalize semicolons: temporarily replace semicolons inside quoted literals,
		// then split by top-level semicolons to process only the first statement.
		var semicolonSubstitute = '$$$semicolon_mark$$$';
		sqlText = sqlText.replace( /[("'`].*;.*[)"'`]/g, function ( matchedFragment ) {
			return matchedFragment.replace( /;/g, semicolonSubstitute );
		} );
		var statementEndMarker = '$$$STATEMENT_END$$$';
		sqlText = sqlText.replace( /;/g, statementEndMarker );
		sqlText = sqlText.split( statementEndMarker )[ 0 ];
		sqlText = sqlText.replace( new RegExp( semicolonSubstitute, 'g' ), ';' );

		// Identify SQL keywords that act as structural delimiters.
		var sqlClauseMarkers = [ 'SELECT', 'FROM', 'DELETE FROM', 'INSERT INTO', 'UPDATE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'ORDER BY', 'GROUP BY', 'HAVING', 'WHERE', 'LIMIT', 'VALUES', 'SET' ];
		var clauseRegexPatterns = sqlClauseMarkers.map( function ( clauseKeyword ) {
			return clauseKeyword + ' ';
		} );
		clauseRegexPatterns = clauseRegexPatterns.concat( sqlClauseMarkers.map( function ( clauseKeyword ) {
			return clauseKeyword + '(';
		} ) );
		clauseRegexPatterns = clauseRegexPatterns.concat( clauseRegexPatterns.map( function ( patternItem ) {
			return patternItem.toLowerCase();
		} ) );
		var safeClausePatterns = clauseRegexPatterns.map( function ( patternItem ) {
			return patternItem.replace( '(', '[\\(]' );
		} );

		// Temporarily obscure clause markers that appear within string literals or parentheses
		// to prevent them from being mistaken as structural delimiters during the initial split.
		sqlText = sqlText.replace( /\((.+?)\)|"(.+?)"|'(.+?)'|`(.+?)`/gi, function ( matchedFragment ) {
			return matchedFragment.replace( new RegExp( safeClausePatterns.join( '|' ), 'gi' ), insertDelimiters );
		} );

		// Record the positions of the structural delimiters within the query.
		var clauseLocations = [];
		function extractBaseName( matchedPart, nameSegment ) {
			return nameSegment;
		}
		clauseRegexPatterns.forEach( function ( patternElement ) {
			var searchOffset = 0;
			var foundPosition;

			do {
				foundPosition = sqlText.indexOf( patternElement, searchOffset );
				if ( foundPosition !== -1 ) {
					var baseName = patternElement.replace( /^((\w|\s)+?)\s?\(?$/i, extractBaseName );
					clauseLocations[ foundPosition ] = baseName; /* Store clause name at its starting index. */
					searchOffset = foundPosition + baseName.length;
				}
			} while ( foundPosition !== -1 );
		} );

		// Filter out redundant clause markers (e.g., 'JOIN' might be found before 'INNER JOIN').
		var occupiedRangeEnd = 0;
		clauseLocations.forEach( function ( clauseName, positionIndex ) {
			if ( occupiedRangeEnd > positionIndex ) {
				delete clauseLocations[ positionIndex ]; /* Remove if overlapping with a previously processed longer keyword. */
			} else {
				occupiedRangeEnd = parseInt( positionIndex, 10 ) + clauseName.length;

				// Standardize 'JOIN' to 'INNER JOIN' for consistency.
				if ( clauseName === 'JOIN' ) {
					clauseLocations[ positionIndex ] = 'INNER JOIN';
				}
			}
		} );

		// Prepare a list of obscured keywords to reverse the `insertDelimiters` process later.
		var obscuredKeywords = safeClausePatterns.slice( 0 );
		obscuredKeywords = obscuredKeywords.map( function ( patternElement ) {
			return insertDelimiters( patternElement );
		} );
		obscuredKeywords = obscuredKeywords.join( '|' );

		// Split the main query string into its constituent clauses based on the identified delimiters.
		var querySections = sqlText.split( new RegExp( safeClausePatterns.join( '|' ), 'i' ) );

		// Restore the originally obscured keywords within string literals and parentheses in the main query text.
		sqlText = sqlText.replace( /\((.+?)\)|"(.+?)"|'(.+?)'|`(.+?)`/gi, function ( matchedFragment ) {
			return matchedFragment.replace( new RegExp( obscuredKeywords, 'gi' ), removeDelimiters );
		} );
		querySections = querySections.map( function ( sectionItem ) {
			return sectionItem.replace( /\((.+?)\)|"(.+?)"|'(.+?)'|`(.+?)`/gi, function ( matchedFragment ) {
				return matchedFragment.replace( new RegExp( obscuredKeywords, 'gi' ), removeDelimiters );
			} );
		} );

		// Define specialized functions for parsing the content of each SQL clause.
		var clauseHandlers = [];

		clauseHandlers[ 'SELECT' ] = function ( sectionContent ) {
			var outcome = shieldedDivide( ',', sectionContent );
			outcome = outcome.filter( function ( entry ) {
				return entry !== '';
			} ).map( function ( entry ) {
				return {
					name: entry
				};
			} );
			return outcome;
		};

		clauseHandlers[ 'SET' ] = function ( sectionContent ) {
			var outcome = shieldedDivide( ',', sectionContent );
			outcome = outcome.filter( function ( entry ) {
				return entry !== '';
			} ).map( function ( entry ) {
				return {
					expression: entry
				};
			} );
			return outcome;
		};

		clauseHandlers[ 'FROM' ] = clauseHandlers[ 'DELETE FROM' ] = clauseHandlers[ 'UPDATE' ] = function ( sectionContent ) {
			var outcome = sectionContent.split( ',' );
			outcome = outcome.map( function ( entry ) {
				return cleanWhitespace( entry );
			} );
			// Remove empty entries that might result from multiple commas or trailing commas.
			for ( var i = outcome.length - 1; i >= 0; i-- ) {
				if ( outcome[ i ] === '' ) {
					outcome.splice( i, 1 );
				}
			}
			outcome = outcome.map( function ( entry ) {
				var dataEntity = entry.split( ' AS ' );
				var entityAlias = dataEntity[ 1 ] || '';
				// Strip quotes from alias if present.
				if ( entityAlias.indexOf( '"' ) === 0 && entityAlias.lastIndexOf( '"' ) === entityAlias.length - 1 ) {
					entityAlias = entityAlias.substring( 1, entityAlias.length - 1 );
				}
				return {
					table: dataEntity[ 0 ],
					designation: entityAlias
				};
			} );
			return outcome;
		};

		clauseHandlers[ 'LEFT JOIN' ] = clauseHandlers[ 'JOIN' ] = clauseHandlers[ 'INNER JOIN' ] = clauseHandlers[ 'RIGHT JOIN' ] = function ( sectionContent ) {
			sectionContent = sectionContent.split( ' ON ' );
			var dataEntity = sectionContent[ 0 ].split( ' AS ' );
			var joinDetails = {};
			joinDetails[ 'table' ] = cleanWhitespace( dataEntity[ 0 ] );
			joinDetails[ 'designation' ] = cleanWhitespace( dataEntity[ 1 ] ) || '';
			joinDetails[ 'clause' ] = cleanWhitespace( sectionContent[ 1 ] );

			return joinDetails;
		};

		clauseHandlers[ 'WHERE' ] = function ( sectionContent ) {
			return cleanWhitespace( sectionContent );
		};

		clauseHandlers[ 'ORDER BY' ] = function ( sectionContent ) {
			sectionContent = sectionContent.split( ',' );
			var orderedColumns = [];
			sectionContent.forEach( function ( entryItem, entryIndex ) {
				var sortSpecification = /([A-Za-z0-9_\.]+)\s*(ASC|DESC){0,1}/gi;
				var matchedSpec = sortSpecification.exec( entryItem );
				if ( matchedSpec !== null ) {
					var tempObject = {};
					tempObject[ 'field' ] = cleanWhitespace( matchedSpec[ 1 ] );
					tempObject[ 'direction' ] = cleanWhitespace( matchedSpec[ 2 ] );
					if ( matchedSpec[ 2 ] === undefined ) {
						tempObject[ 'direction' ] = "ASC"; /* Default to ascending if not specified. */
					}
					orderedColumns.push( tempObject );
				}
			} );
			return orderedColumns;
		};

		clauseHandlers[ 'GROUP BY' ] = function ( sectionContent ) {
			sectionContent = sectionContent.split( ',' );
			var groupedColumns = [];
			sectionContent.forEach( function ( entryItem, entryIndex ) {
				var groupingSpecification = /([A-Za-z0-9_\.]+)/gi;
				var matchedSpec = groupingSpecification.exec( entryItem );
				if ( matchedSpec !== null ) {
					var tempObject = {};
					tempObject[ 'field' ] = cleanWhitespace( matchedSpec[ 1 ] );
					groupedColumns.push( tempObject );
				}
			} );
			return groupedColumns;
		};

		clauseHandlers[ 'LIMIT' ] = function ( sectionContent ) {
			var limitSpecification = /((\d+)\s*,\s*)?(\d+)/gi;
			var matchedLimit = limitSpecification.exec( sectionContent );
			if ( typeof matchedLimit[ 2 ] === 'undefined' ) {
				matchedLimit[ 2 ] = 0; /* Default offset to 0 if only count is provided. */
			}
			var limitDetails = {};
			limitDetails[ 'count' ] = parseInt( cleanWhitespace( matchedLimit[ 3 ] ), 10 );
			limitDetails[ 'offset' ] = parseInt( cleanWhitespace( matchedLimit[ 2 ] ), 10 );
			return limitDetails;
		};

		clauseHandlers[ 'INSERT INTO' ] = function ( sectionContent ) {
			var insertionSpecification = /([A-Za-z0-9_\.]+)\s*(\(([A-Za-z0-9_\., ]+)\))?/gi;
			var matchedInsert = insertionSpecification.exec( sectionContent );
			var insertionDetails = {};
			insertionDetails[ 'targetTable' ] = cleanWhitespace( matchedInsert[ 1 ] );
			if ( typeof matchedInsert[ 3 ] !== 'undefined' ) {
				insertionDetails[ 'targetColumns' ] = matchedInsert[ 3 ].split( ',' );
				insertionDetails[ 'targetColumns' ] = insertionDetails[ 'targetColumns' ].map( function ( entry ) {
					return cleanWhitespace( entry );
				} );
			}
			return insertionDetails;
		};

		clauseHandlers[ 'VALUES' ] = function ( sectionContent ) {
			sectionContent = cleanWhitespace( sectionContent );
			if ( sectionContent[ 0 ] !== '(' ) {
				sectionContent = '(' + sectionContent; /* Prepend parenthesis if missing (e.g., "VALUES 1,2,3" instead of "VALUES (1,2,3)"). */
			}
			var valueTuples = shieldedDivide( ',', sectionContent );
			var finalValues = [];
			valueTuples.forEach( function ( tupleEntry ) {
				tupleEntry = tupleEntry.replace( /^\(/g, '' ).replace( /\)$/g, '' ); /* Remove outer parentheses from each tuple. */
				tupleEntry = shieldedDivide( ',', tupleEntry ); /* Split values within the tuple. */
				finalValues.push( tupleEntry );
			} );
			return finalValues;
		};

		// NOTE: Future implementation may include handling for the 'HAVING' clause.

		// Process each identified clause using its dedicated handler function.
		var finalSyntaxTree = {};
		var sectionIterator = 0;
		clauseLocations.forEach( function ( clauseName, positionIndex ) {
			clauseName = clauseName.toUpperCase();
			sectionIterator++; /* Advance to the next part of the query. */
			if ( typeof clauseHandlers[ clauseName ] !== 'undefined' ) {
				var clauseOutput = clauseHandlers[ clauseName ]( querySections[ sectionIterator ] );

				if ( typeof finalSyntaxTree[ clauseName ] !== 'undefined' ) {
					// If multiple clauses of the same type exist (e.g., multiple JOINs), consolidate them into an array.
					if ( typeof finalSyntaxTree[ clauseName ] === 'string' || typeof finalSyntaxTree[ clauseName ][ 0 ] === 'undefined' ) {
						var temporaryStore = finalSyntaxTree[ clauseName ];
						finalSyntaxTree[ clauseName ] = [];
						finalSyntaxTree[ clauseName ].push( temporaryStore );
					}
					finalSyntaxTree[ clauseName ].push( clauseOutput );
				} else {
					finalSyntaxTree[ clauseName ] = clauseOutput;
				}
			} else {
				console.log( 'Warning: No specific handler found for clause type: "' + clauseName + '"' );
			}
		} );

		// Consolidate different JOIN types into a single 'JOIN' array for a unified structure.
		if ( typeof finalSyntaxTree[ 'LEFT JOIN' ] !== 'undefined' ) {
			if ( typeof finalSyntaxTree[ 'JOIN' ] === 'undefined' ) {
				finalSyntaxTree[ 'JOIN' ] = [];
			}
			if ( Array.isArray( finalSyntaxTree[ 'LEFT JOIN' ] ) ) {
				finalSyntaxTree[ 'LEFT JOIN' ].forEach( function ( joinEntry ) {
					joinEntry.joinType = 'left';
					finalSyntaxTree[ 'JOIN' ].push( joinEntry );
				} );
			} else {
				finalSyntaxTree[ 'LEFT JOIN' ].joinType = 'left';
				finalSyntaxTree[ 'JOIN' ].push( finalSyntaxTree[ 'LEFT JOIN' ] );
			}
			delete finalSyntaxTree[ 'LEFT JOIN' ];
		}
		if ( typeof finalSyntaxTree[ 'INNER JOIN' ] !== 'undefined' ) {
			if ( typeof finalSyntaxTree[ 'JOIN' ] === 'undefined' ) {
				finalSyntaxTree[ 'JOIN' ] = [];
			}
			if ( Array.isArray( finalSyntaxTree[ 'INNER JOIN' ] ) ) {
				finalSyntaxTree[ 'INNER JOIN' ].forEach( function ( joinEntry ) {
					joinEntry.joinType = 'inner';
					finalSyntaxTree[ 'JOIN' ].push( joinEntry );
				} );
			} else {
				finalSyntaxTree[ 'INNER JOIN' ].joinType = 'inner';
				finalSyntaxTree[ 'JOIN' ].push( finalSyntaxTree[ 'INNER JOIN' ] );
			}
			delete finalSyntaxTree[ 'INNER JOIN' ];
		}
		if ( typeof finalSyntaxTree[ 'RIGHT JOIN' ] !== 'undefined' ) {
			if ( typeof finalSyntaxTree[ 'JOIN' ] === 'undefined' ) {
				finalSyntaxTree[ 'JOIN' ] = [];
			}
			if ( Array.isArray( finalSyntaxTree[ 'RIGHT JOIN' ] ) ) {
				finalSyntaxTree[ 'RIGHT JOIN' ].forEach( function ( joinEntry ) {
					joinEntry.joinType = 'right';
					finalSyntaxTree[ 'JOIN' ].push( joinEntry );
				} );
			} else {
				finalSyntaxTree[ 'RIGHT JOIN' ].joinType = 'right';
				finalSyntaxTree[ 'JOIN' ].push( finalSyntaxTree[ 'RIGHT JOIN' ] );
			}
			delete finalSyntaxTree[ 'RIGHT JOIN' ];
		}

		// If condition parsing is enabled, process WHERE and JOIN ON clauses into their own ASTs.
		if ( processConditions ) {
			if ( typeof finalSyntaxTree[ 'WHERE' ] === 'string' ) {
				finalSyntaxTree[ 'WHERE' ] = ClauseExpressionParser.parse( finalSyntaxTree[ 'WHERE' ] );
			}
			if ( typeof finalSyntaxTree[ 'JOIN' ] !== 'undefined' ) {
				finalSyntaxTree[ 'JOIN' ].forEach( function ( joinEntry, entryKey ) {
					finalSyntaxTree[ 'JOIN' ][ entryKey ][ 'clause' ] = ClauseExpressionParser.parse( joinEntry[ 'clause' ] );
				} );
			}
		}

		return finalSyntaxTree;
	};


	/*
	 * LEXICAL ANALYZER AND PARSER FOR SQL CONDITION EXPRESSIONS
	 * This component draws inspiration from the concepts presented in
	 * 'Essentials of Interpretation' by Dmitry Soshnikov.
	 */

	/**
	 * Constructor for the ClauseLexer, responsible for breaking down a condition string into tokens.
	 * @param {string} expressionSource - The input string containing the condition expression.
	 */
	function ClauseLexer( expressionSource ) {
		this.inputExpression = expressionSource;
		this.readPointer = 0;
		this.activeCharacter = "";

		this.fetchNextSymbol(); /* Initialize by reading the first character. */
	}

	ClauseLexer.prototype = {
		constructor: ClauseLexer,

		/**
		 * Advances the internal pointer and sets `activeCharacter` to the next character in the input.
		 * Returns an empty string if the end of the input is reached.
		 */
		fetchNextSymbol: function () {
			if ( typeof this.inputExpression !== 'string' ) {
				this.activeCharacter = "";
			} else {
				this.activeCharacter = this.inputExpression[ this.readPointer++ ] || "";
			}
		},

		/**
		 * Determines the type of the next token based on the `activeCharacter` and extracts its value.
		 * @returns {object} An object with 'type' and 'value' properties representing the token.
		 */
		getNextLexeme: function () {
			if ( /\w/.test( this.activeCharacter ) ) {
				return this.scanIdentifier();
			}
			if ( /["'`]/.test( this.activeCharacter ) ) {
				return this.scanLiteral();
			}
			if ( /[()]/.test( this.activeCharacter ) ) {
				return this.scanPunctuation();
			}
			if ( /[!=<>]/.test( this.activeCharacter ) ) {
				return this.scanOperation();
			}

			if ( this.activeCharacter === "" ) {
				return {
					type: 'end_of_tokens',
					value: ''
				};
			} else {
				this.fetchNextSymbol(); /* Skip unrecognized character. */
				return {
					type: 'skipped',
					value: ''
				};
			}
		},

		/**
		 * Extracts a word (identifier or keyword) from the input stream.
		 * Handles spaces within function calls and respects string boundaries.
		 * @returns {object} A token object of type 'boolean_logic', 'comparison_operator', or 'identifier'.
		 */
		scanIdentifier: function () {
			var lexemeContent = "";
			var parenthesisNestCount = 0;
			var inLiteral = false;

			while ( /./.test( this.activeCharacter ) ) {
				// Manage string literal state
				if ( !inLiteral && /['"`]/.test( this.activeCharacter ) ) {
					inLiteral = this.activeCharacter;
				} else if ( inLiteral && this.activeCharacter === inLiteral ) {
					inLiteral = false;
				} else {
					// Allow spaces within parentheses if not in a string.
					if ( !inLiteral ) {
						// A closing parenthesis terminates the word if it's not nested.
						if ( this.activeCharacter === ')' && parenthesisNestCount <= 0 ) {
							break;
						}

						if ( this.activeCharacter === '(' ) {
							parenthesisNestCount++;
						} else if ( this.activeCharacter === ')' ) {
							parenthesisNestCount--;
						}

						// An operator symbol also terminates the word.
						if ( /[!=<>]/.test( this.activeCharacter ) ) {
							break;
						}
					}

					// A space terminates the word if it's outside a string or a function call.
					if ( this.activeCharacter === ' ' && parenthesisNestCount <= 0 ) {
						break;
					}
				}

				lexemeContent += this.activeCharacter;
				this.fetchNextSymbol();
			}

			if ( /^(AND|OR)$/i.test( lexemeContent ) ) {
				return {
					type: 'boolean_logic',
					value: lexemeContent
				};
			}
			if ( /^(IN|IS|NOT|LIKE)$/i.test( lexemeContent ) ) {
				return {
					type: 'comparison_operator',
					value: lexemeContent
				};
			} else {
				return {
					type: 'identifier',
					value: lexemeContent
				};
			}
		},

		/**
		 * Extracts a string literal from the input stream, including its quotes.
		 * Handles backtick-quoted identifiers that might contain dots (e.g., `schema`.`table`).
		 * @returns {object} A token object of type 'string_literal' or 'identifier'.
		 */
		scanLiteral: function () {
			var lexemeContent = "";
			var currentQuote = this.activeCharacter;

			lexemeContent += this.activeCharacter;
			this.fetchNextSymbol();

			while ( this.activeCharacter !== currentQuote && this.activeCharacter !== "" ) {
				lexemeContent += this.activeCharacter;
				this.fetchNextSymbol();
			}

			lexemeContent += this.activeCharacter; /* Include the closing quote. */
			this.fetchNextSymbol();

			// Special handling for backtick-quoted identifiers like `table`.`column`
			if ( this.activeCharacter === '.' ) {
				lexemeContent += this.activeCharacter;
				this.fetchNextSymbol();
				lexemeContent += this.scanLiteral().value; /* Recursively read the next quoted part. */

				return {
					type: 'identifier',
					value: lexemeContent
				};
			}

			return {
				type: 'string_literal',
				value: lexemeContent
			};
		},

		/**
		 * Extracts a grouping symbol (parenthesis).
		 * @returns {object} A token object of type 'grouping_symbol'.
		 */
		scanPunctuation: function () {
			var lexemeContent = this.activeCharacter;
			this.fetchNextSymbol();

			return {
				type: 'grouping_symbol',
				value: lexemeContent
			};
		},

		/**
		 * Extracts an operator symbol (e.g., =, <, >=).
		 * @returns {object} A token object of type 'comparison_operator'.
		 */
		scanOperation: function () {
			var lexemeContent = this.activeCharacter;
			this.fetchNextSymbol();

			// Check for two-character operators like <=, >=, !=
			if ( /[=<>]/.test( this.activeCharacter ) ) {
				lexemeContent += this.activeCharacter;
				this.fetchNextSymbol();
			}

			return {
				type: 'comparison_operator',
				value: lexemeContent
			};
		},
	};

	/**
	 * Static method to tokenize an entire condition string.
	 * Primarily useful for debugging the lexer.
	 * @param {string} sourceString - The input condition string.
	 * @returns {Array<object>} A list of token objects.
	 */
	ClauseLexer.tokenStream = function ( sourceString ) {
		var lexerInstance = new ClauseLexer( sourceString );
		var lexemeList = [];
		do {
			var currentLexeme = lexerInstance.getNextLexeme();
			if ( currentLexeme.type !== 'skipped' ) {
				lexemeList.push( currentLexeme );
			}
		} while ( lexerInstance.activeCharacter ); /* Continue as long as there are characters to process. */
		return lexemeList;
	};


	/**
	 * Constructor for the ClauseExpressionParser, which builds an AST from a token stream.
	 * @param {string} expressionSource - The input string representing the condition.
	 */
	function ClauseExpressionParser( expressionSource ) {
		this.tokenScanner = new ClauseLexer( expressionSource );
		this.activeToken = null;

		this.advanceToNextToken(); /* Initialize by fetching the first meaningful token. */
	}

	ClauseExpressionParser.prototype = {
		constructor: ClauseExpressionParser,

		/**
		 * Reads the next token from the lexer, skipping any 'skipped' tokens.
		 * Updates the `activeToken` property.
		 * @returns {object} The next meaningful token.
		 */
		advanceToNextToken: function () {
			this.activeToken = this.tokenScanner.getNextLexeme();
			while ( this.activeToken.type === 'skipped' ) {
				this.activeToken = this.tokenScanner.getNextLexeme();
			}
			return this.activeToken;
		},

		/**
		 * Entry point for parsing the entire condition expression.
		 * Delegates to the most general expression parsing function.
		 * @returns {object} The root node of the parsed expression tree.
		 */
		evaluateExpressions: function () {
			return this.parseBooleanExpression();
			/* The original code snippet ended here. The rest of the parser would typically follow,
			 * including methods like parseBooleanExpression, parseComparison, parsePrimary, etc. */
		},
	};

	/**
	 * Static method to parse a condition string directly.
	 * Creates a parser instance and calls its main parsing method.
	 * @param {string} conditionString - The raw condition string to parse.
	 * @returns {object} The AST of the condition.
	 */
	ClauseExpressionParser.parse = function ( conditionString ) {
		var parserInstance = new ClauseExpressionParser( conditionString );
		return parserInstance.evaluateExpressions();
	};

} )( typeof exports === 'undefined' ? ( this.sqlParser = {} ) : exports );