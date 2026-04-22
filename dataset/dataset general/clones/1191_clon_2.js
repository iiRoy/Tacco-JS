'use strict';

( function ( util ) {
	util.tokenizer = util.tokenizer || {};

	// A container for symbolic unit definitions.
	var Lexeme = {};

	// Defines various categories for the processed symbolic units.
	Lexeme.kind = {
		STREAM_END            : -2,  // Identical to util.sourceReader.STREAM_END
		LINE_BREAK            : -1,  // Identical to util.sourceReader.LINE_BREAK -- crucial
		BLANK_SPACE           :  0,
		MEASURE               :  1,
		ANNOTATION            :  2,
		PUNCTUATION           :  3,
		NUMERIC_VALUE         :  4,
		ATTRIBUTE             :  5,
		ASSIGNMENT            :  6,
		IDENTIFIER            :  7,
		UNRECOGNIZED          :  8
	};

	// Creates a lookup table from numeric kind values to their lowercase string names.
	Lexeme.kindMap = (function(kinds) {
		var resultMap = {};
		for (var kindName in kinds) {
			resultMap[kinds[kindName]] = kindName.toLowerCase();
		}
		return resultMap;
	}(Lexeme.kind));

	// Enumeration for the different stages of the parsing process.
	var ProcessPhase = {
		INITIAL                     :  0,
		IN_NUMBER                   :  1,
		IN_ANNOTATION               :  2,
		ANNOTATION_START            :  3,
		ANNOTATION_END              :  4,
		IN_IDENTIFIER               :  5,
		ATTRIBUTE_END               :  6,
		IN_ATTRIBUTE                :  7,
		IN_DOUBLE_QUOTE             :  8,
		IN_SINGLE_QUOTE             :  9,
		IN_CURLY_BRACE              : 10,
		IN_PARENTHESIS              : 11,
		IN_BLANK_SPACE              : 12,
		IN_ASSIGNMENT_AREA          : 13,
		IN_ATTRIBUTE_ASSIGNMENT     : 14,
		IN_MEASURE                  : 15,
		COMPLETED                   : 16
	};

	/**
	 * Manages the stack of processing phases.
	 * @param {number} initialPhase The first phase to start with.
	 */
	function PhaseStack(initialPhase) {
		this.phaseList = [initialPhase];
	}

	PhaseStack.prototype.push = function(nextPhase) {
		this.phaseList.push(nextPhase);
	};

	PhaseStack.prototype.change = function(newPhase) {
		this.phaseList.pop();
		this.phaseList.push(newPhase);
	};

	PhaseStack.prototype.pop = function() {
		return this.phaseList.pop();
	};

	PhaseStack.prototype.top = function() {
		return this.phaseList[this.phaseList.length - 1];
	};

	PhaseStack.prototype.popUntil = function(targetPhase) {
		while (this.pop() !== targetPhase) { /* Loop until target phase is found and popped */ }
	};

	/**
	 * Scans the input character stream and produces a list of lexemes.
	 * @param {object} charSource The character stream object.
	 * @param {object} settings Optional settings for the tokenizer.
	 * @returns {Array<object>} An array of lexeme objects.
	 */
	var tokenize = function ( charSource, settings ) {
		var currentLexeme     = null,
			lexemeList        = [],
			charVal           = '',
			charAccumulator   = '',
			currentPhases     = new PhaseStack(ProcessPhase.INITIAL),
			indentSize        = 4,
			shouldAppend      = true,
			pendingLexeme     = false,
			skipChar          = false;

		// Apply custom settings if provided.
		if ( settings !== undefined ) {
			indentSize = settings.tabWidth;
		}

		// Pre-calculate the indentation string.
		var indentString = '';
		for ( var idx = 0; idx < indentSize; idx++ ) {
			indentString += ' ';
		}

		/**
		 * Appends a new lexeme to the list.
		 * @param {string} content The textual content of the lexeme.
		 * @param {number} kind The numeric kind of the lexeme.
		 */
		function appendLexeme ( content, kind ) {
			lexemeList.push( { content: content, kind: kind } );
			pendingLexeme = false;
		}

		/**
		 * Marks a lexeme to be created from the current buffer.
		 * @param {number} kind The numeric kind of the lexeme.
		 */
		function captureLexeme ( kind ) {
			currentLexeme = kind;
			pendingLexeme = true;
		}

		/**
		 * Puts the last read character back into the stream.
		 */
		function returnChar () {
			charSource.putBack();
			shouldAppend = false;
		}

		// Main state machine loop.
		while ( currentPhases.top() !== ProcessPhase.COMPLETED ) {

			charVal = charSource.read();
			shouldAppend = true;

			// Evaluate the current processing phase.
			switch ( currentPhases.top() ) {

				case ProcessPhase.INITIAL:
					// Check for characters that could initiate an identifier (e.g., CSS selector)
					if ( util.charUtil.isAlphabetic(charVal) || charVal === '.' || charVal === '#' || charVal === '*' || charVal === '$' || charVal === ':' ) {
						currentPhases.push(ProcessPhase.IN_IDENTIFIER);
					}
					// Check for whitespace characters
					else if ( util.charUtil.isWhitespace(charVal) ) {
						currentPhases.push(ProcessPhase.IN_BLANK_SPACE);
					}
					// Handle various punctuation marks
					else if ( charVal === ',' || charVal === '[' || charVal === ']' || charVal === '>' ) {
						captureLexeme(Lexeme.kind.PUNCTUATION);
					}
					// Encountered an opening curly brace, indicating a new block
					else if ( charVal === '{' ) {
						captureLexeme(Lexeme.kind.PUNCTUATION);
						currentPhases.push(ProcessPhase.IN_CURLY_BRACE);
					}
					// End of line character
					else if ( charVal === util.sourceReader.LINE_BREAK ) {
						captureLexeme(Lexeme.kind.LINE_BREAK);
					}
					// End of file character
					else if ( charVal === util.sourceReader.STREAM_END ) {
						returnChar();
						currentPhases.change(ProcessPhase.COMPLETED);
					}
					// Potentially a comment or an unknown symbol
					else if ( charVal === '/' ) {
						// Check if it's the start of a multi-line comment
						if ( charSource.peek() === '*' ) {
							currentPhases.push(ProcessPhase.IN_ANNOTATION);
						} else {
							captureLexeme(Lexeme.kind.UNRECOGNIZED);
						}
					}
					// Any other character is unrecognized
					else {
						captureLexeme(Lexeme.kind.UNRECOGNIZED);
					}
					break;

				case ProcessPhase.IN_BLANK_SPACE:
					// Continue consuming whitespace until a non-whitespace character is found
					if ( !util.charUtil.isWhitespace(charVal) ) {
						returnChar();
						captureLexeme(Lexeme.kind.BLANK_SPACE);
						currentPhases.pop();
					}
					break;

				case ProcessPhase.IN_IDENTIFIER:
					// An identifier consists of alphanumeric characters and hyphens
					if ( !util.charUtil.isAlphabetic(charVal) && !util.charUtil.isNumeric(charVal) && charVal !== '-' ) {
						returnChar();
						currentPhases.pop();
						captureLexeme(Lexeme.kind.IDENTIFIER);
					}
					break;

				case ProcessPhase.IN_CURLY_BRACE:
					// Closing curly brace ends the block
					if ( charVal === '}' ) {
						currentPhases.pop();
						captureLexeme(Lexeme.kind.PUNCTUATION);
					}
					// Whitespace within the block
					else if ( util.charUtil.isWhitespace(charVal) ) {
						currentPhases.push(ProcessPhase.IN_BLANK_SPACE);
					}
					// Start of an attribute name (e.g., CSS property)
					else if ( util.charUtil.isAlphabetic(charVal) || charVal === '-' ) {
						currentPhases.push(ProcessPhase.IN_ATTRIBUTE);
					}
					// Potentially a comment
					else if ( charVal === '/' ) {
						if ( charSource.peek() === '*' ) {
							currentPhases.push(ProcessPhase.IN_ANNOTATION);
						} else {
							captureLexeme(Lexeme.kind.UNRECOGNIZED);
						}
					}
					// End of line
					else if ( charVal === util.sourceReader.LINE_BREAK ) {
						captureLexeme(Lexeme.kind.LINE_BREAK);
					}
					// End of file
					else if ( charVal === util.sourceReader.STREAM_END ) {
						returnChar();
						currentPhases.change(ProcessPhase.COMPLETED);
					}
					// Unrecognized character in this context
					else {
						captureLexeme(Lexeme.kind.UNRECOGNIZED);
					}
					break;

				case ProcessPhase.IN_ATTRIBUTE:
					// Continue consuming attribute name characters (alphabetic or hyphen)
					if ( util.charUtil.isAlphabetic(charVal) || charVal === '-' ) {
						/* Do nothing, just continue accumulating */
					}
					// Non-attribute character indicates the end of the attribute name
					else {
						returnChar();
						captureLexeme(Lexeme.kind.ATTRIBUTE);
						currentPhases.change(ProcessPhase.ATTRIBUTE_END);
					}
					break;

				case ProcessPhase.ATTRIBUTE_END:
					// Whitespace after the attribute name
					if ( util.charUtil.isWhitespace(charVal) ) {
						currentPhases.push(ProcessPhase.IN_BLANK_SPACE);
					}
					// Colon indicates the start of the attribute value area
					else if ( charVal === ':' ) {
						captureLexeme(Lexeme.kind.PUNCTUATION);
						currentPhases.change(ProcessPhase.IN_ASSIGNMENT_AREA);
					}
					// Potentially a comment
					else if ( charVal === '/' ) {
						if ( charSource.peek() === '*' ) {
							currentPhases.push(ProcessPhase.IN_ANNOTATION);
						} else {
							captureLexeme(Lexeme.kind.UNRECOGNIZED);
						}
					}
					// Semicolon ends the attribute declaration
					else if ( charVal === ';' ) {
						currentPhases.pop(); // Pop ATTRIBUTE_END
						captureLexeme(Lexeme.kind.PUNCTUATION);
					}
					// Closing curly brace indicates end of block, pop until IN_CURLY_BRACE
					else if ( charVal === '}' ) {
						captureLexeme(Lexeme.kind.PUNCTUATION);
						currentPhases.popUntil(ProcessPhase.IN_CURLY_BRACE);
					}
					// Unrecognized character
					else {
						captureLexeme(Lexeme.kind.UNRECOGNIZED);
					}
					break;

				case ProcessPhase.IN_ASSIGNMENT_AREA:
					// Whitespace in the value area
					if ( util.charUtil.isWhitespace(charVal) ) {
						currentPhases.push(ProcessPhase.IN_BLANK_SPACE);
					}
					// Semicolon ends the value area
					else if ( charVal === ';' ) {
						currentPhases.pop(); // Pop IN_ASSIGNMENT_AREA
						captureLexeme(Lexeme.kind.PUNCTUATION);
					}
					// Numeric value or decimal point
					else if ( util.charUtil.isNumeric(charVal) || charVal === '.' ) {
						currentPhases.push(ProcessPhase.IN_NUMBER);
					}
					// Alphanumeric value or hash (e.g., color code)
					else if ( util.charUtil.isAlphabetic(charVal) || charVal === '#' ) {
						currentPhases.push(ProcessPhase.IN_ATTRIBUTE_ASSIGNMENT);
					}
					// Closing curly brace, pop back to the block start
					else if ( charVal === '}' ) {
						currentPhases.popUntil(ProcessPhase.IN_CURLY_BRACE);
						captureLexeme(Lexeme.kind.PUNCTUATION);
					}
					// Potentially a comment
					else if ( charVal === '/' ) {
						if ( charSource.peek() === '*' ) {
							currentPhases.push(ProcessPhase.IN_ANNOTATION);
						} else {
							captureLexeme(Lexeme.kind.UNRECOGNIZED);
						}
					}
					// Opening parenthesis, usually for function calls (e.g., `url()`)
					else if ( charVal === '(' ) {
						captureLexeme(Lexeme.kind.PUNCTUATION);
						currentPhases.push(ProcessPhase.IN_PARENTHESIS);
					}
					// Single quote for string values
					else if ( charVal === '\'' ) {
						currentPhases.push(ProcessPhase.IN_SINGLE_QUOTE);
					}
					// Double quote for string values
					else if ( charVal === '"' ) {
						currentPhases.push(ProcessPhase.IN_DOUBLE_QUOTE);
					}
					// Exclamation mark (e.g., `!important`)
					else if ( charVal === '!' ) {
						captureLexeme(Lexeme.kind.PUNCTUATION);
					}
					// End of file
					else if ( charVal === util.sourceReader.STREAM_END ) {
						returnChar();
						currentPhases.change(ProcessPhase.COMPLETED);
					}
					// Unrecognized character
					else {
						captureLexeme(Lexeme.kind.UNRECOGNIZED);
					}
					break;

				case ProcessPhase.IN_ATTRIBUTE_ASSIGNMENT:
					// Value can contain alphanumeric characters and hyphens
					if ( !util.charUtil.isAlphabetic(charVal) && charVal !== '-' ) {
						captureLexeme(Lexeme.kind.ASSIGNMENT);
						returnChar();
						currentPhases.pop(); // Pop IN_ATTRIBUTE_ASSIGNMENT
					}
					break;

				case ProcessPhase.IN_PARENTHESIS:
					// Numeric value or decimal point inside parentheses
					if ( util.charUtil.isNumeric(charVal) || charVal === '.' ) {
						currentPhases.push(ProcessPhase.IN_NUMBER);
					}
					// Comma separates values
					else if ( charVal === ',' ) {
						captureLexeme(Lexeme.kind.PUNCTUATION);
					}
					// Closing parenthesis ends the current scope
					else if ( charVal === ')' ) {
						captureLexeme(Lexeme.kind.PUNCTUATION);
						currentPhases.pop(); // Pop IN_PARENTHESIS
					}
					// Alphanumeric value or hash inside parentheses
					else if ( util.charUtil.isAlphabetic(charVal) || charVal === '#' ) {
						returnChar();
						currentPhases.push(ProcessPhase.IN_ASSIGNMENT_AREA); // Re-enter assignment area for complex values
					}
					// Single quote for string values
					else if ( charVal === '\'' ) {
						currentPhases.push(ProcessPhase.IN_SINGLE_QUOTE);
					}
					// Double quote for string values
					else if ( charVal === '"' ) {
						currentPhases.push(ProcessPhase.IN_DOUBLE_QUOTE);
					}
					// End of line
					else if ( charVal === util.sourceReader.LINE_BREAK ) {
						captureLexeme(Lexeme.kind.LINE_BREAK);
					}
					// Closing curly brace, implies an error or unexpected structure, pop until IN_CURLY_BRACE
					else if ( charVal === '}' ) {
						captureLexeme(Lexeme.kind.PUNCTUATION);
						currentPhases.popUntil(ProcessPhase.IN_CURLY_BRACE);
					}
					// Whitespace inside parentheses
					else if ( util.charUtil.isWhitespace(charVal) ) {
						currentPhases.push(ProcessPhase.IN_BLANK_SPACE);
					}
					// End of file
					else if ( charVal === util.sourceReader.STREAM_END ) {
						returnChar();
						currentPhases.change(ProcessPhase.COMPLETED);
					}
					break;

				case ProcessPhase.IN_NUMBER:
					// A number continues with digits or a decimal point.
					if ( !util.charUtil.isNumeric(charVal) && charVal !== '.' ) {
						// If the next char is alphabetic or a percentage, it's a unit.
						if ( util.charUtil.isAlphabetic(charVal) || charVal === '%' ) {
							currentPhases.change(ProcessPhase.IN_MEASURE);
						} else {
							currentPhases.pop(); // Number finished.
						}
						returnChar();
						captureLexeme(Lexeme.kind.NUMERIC_VALUE);
					}
					break;

				case ProcessPhase.IN_MEASURE:
					// A unit consists of alphabetic characters.
					if ( !util.charUtil.isAlphabetic(charVal) ) {
						currentPhases.pop(); // Unit finished.
						returnChar();
						captureLexeme(Lexeme.kind.MEASURE);
					}
					break;

				case ProcessPhase.IN_SINGLE_QUOTE:
					// Single quote closes the string.
					if ( charVal === '\'' ) {
						currentPhases.pop(); // Pop IN_SINGLE_QUOTE
						captureLexeme(Lexeme.kind.ASSIGNMENT);
					}
					// End of line within a single-quoted string.
					else if ( charVal === util.sourceReader.LINE_BREAK ) {
						captureLexeme(Lexeme.kind.LINE_BREAK);
					}
					// End of file within a single-quoted string (unclosed string).
					else if ( charVal === util.sourceReader.STREAM_END ) {
						currentPhases.change(ProcessPhase.COMPLETED);
						captureLexeme(Lexeme.kind.ASSIGNMENT);
						returnChar();
					}
					break;

				case ProcessPhase.IN_DOUBLE_QUOTE:
					// Double quote closes the string.
					if ( charVal === '"' ) {
						currentPhases.pop(); // Pop IN_DOUBLE_QUOTE
						captureLexeme(Lexeme.kind.ASSIGNMENT);
					}
					// End of line within a double-quoted string.
					else if ( charVal === util.sourceReader.LINE_BREAK ) {
						charVal = '\n'; // Normalize EOL within string content.
					}
					// End of file within a double-quoted string (unclosed string).
					else if ( charVal === util.sourceReader.STREAM_END ) {
						currentPhases.change(ProcessPhase.COMPLETED);
						captureLexeme(Lexeme.kind.ASSIGNMENT);
						returnChar();
					}
					break;

				// This case is part of a commented-out section in the original, keeping it for structural fidelity.
				case ProcessPhase.ANNOTATION_START:
					if ( charAccumulator.length === 4 ) { // This condition seems unusual, check original.
						currentPhases.change(ProcessPhase.IN_ANNOTATION);
					}
					break;

				case ProcessPhase.IN_ANNOTATION:
					// Check for end of multi-line comment sequence.
					if ( charVal === '*' ) {
						if ( charSource.peek() === '/' ) {
							currentPhases.change(ProcessPhase.ANNOTATION_END);
							returnChar(); // Put back the '/' to be processed by COMMENT_END
						}
					}
					// End of file within an unclosed comment.
					else if ( charVal === util.sourceReader.STREAM_END ) {
						currentPhases.change(ProcessPhase.COMPLETED);
						returnChar();
						captureLexeme(Lexeme.kind.ANNOTATION);
					}
					break;

				case ProcessPhase.ANNOTATION_END:
					// Consume the closing '/' of the multi-line comment.
					if ( charVal === '/' ) {
						currentPhases.pop(); // Pop ANNOTATION_END
						captureLexeme(Lexeme.kind.ANNOTATION);
					}
					break;

				default :
					// This part of the code should theoretically not be reached if all states are handled.
					// It's a safety net for unexpected states.
			}

			// If the character should be accumulated into the current buffer.
			if ( shouldAppend === true ) {
				if ( charVal === '\t' ) {
					charAccumulator += indentString; // Replace tabs with spaces for consistency.
				} else {
					charAccumulator += charVal;
					// Defensive check: if buffer grows too large, return early to prevent resource exhaustion.
					if ( charAccumulator.length > 100 ) {
						return lexemeList;
					}
				}
			}


			// If a lexeme has been marked for saving, append it to the list.
			if ( pendingLexeme ) {
				appendLexeme(charAccumulator, currentLexeme);
				// Defensive check: if lexeme list grows too large, log a warning and return.
				if ( lexemeList.length > 1000 ) {
					console.warn('Potential tokenizer bug: excessively long lexeme list detected.');
					return lexemeList;
				}
				charAccumulator = ''; // Reset buffer for the next lexeme.
			}
		}

		return lexemeList;
	};

	// Expose the CSS tokenizer and its kind map through the utility object.
	util.tokenizer['css'] = {
		scan: tokenize,
		map: Lexeme.kindMap
	};

}( parserEnv ) );