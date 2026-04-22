'use strict';

// This module provides a flexible tokenization utility for CSS-like languages.
// It leverages a state machine approach to parse an input character stream.

(function(jQ) {
    // Ensure the tokenizer namespace exists on the core utility object.
    jQ.tokenizer = jQ.tokenizer || {};

    /**
     * Defines the various types of lexemes (tokens) recognized by the tokenizer.
     * Each type is assigned a unique identifier.
     * @typedef {object} LexemeKind
     */
    const Lexeme = {};

    // Using negative numbers for special markers like EOF/EOL to distinguish from regular token types (0 and positive).
    Lexeme.kind = {
        END_OF_STREAM       : -99, // Corresponds to jQ.Stream.END_OF_FILE_MARKER
        LINE_BREAK          : -98, // Corresponds to jQ.Stream.END_OF_LINE_MARKER
        WHITESPACE          : 0,
        MEASUREMENT_UNIT    : 1,
        CODE_COMMENT        : 2,
        PUNCTUATION         : 3,
        NUMERIC_LITERAL     : 4,
        CSS_PROPERTY        : 5,
        CSS_VALUE           : 6,
        CSS_SELECTOR        : 7,
        UNRECOGNIZED        : 8
    };

    /**
     * Creates a reverse lookup map from lexeme ID to its lowercase string name.
     * This is useful for debugging or human-readable output.
     * @type {object.<number, string>}
     */
    Lexeme.typeLookup = (function(kinds) {
        const reverseMap = {};
        // Iterate over the entries to build the reverse map
        Object.entries(kinds).forEach(([name, id]) => {
            reverseMap[id] = name.toLowerCase();
        });
        return reverseMap;
    }(Lexeme.kind));

    /**
     * Enumerates the possible parsing stages of the state machine.
     * @typedef {object} ParsingStage
     */
    const ParsingStage = {
        INITIAL                 : 0, // Starting state
        PARSING_NUMBER          : 1, // Inside a numeric literal
        PARSING_COMMENT         : 2, // Inside a multi-line comment (e.g., /* ... */)
        COMMENT_END_DELIMITER   : 4, // Just after '*' in a potential comment end
        PARSING_SELECTOR        : 5, // Parsing a CSS selector
        PROPERTY_NAME_END       : 6, // After a property name, expecting ':'
        PARSING_PROPERTY_NAME   : 7, // Inside a CSS property name
        IN_DOUBLE_QUOTE_STRING  : 8, // Inside a double-quoted string
        IN_SINGLE_QUOTE_STRING  : 9, // Inside a single-quoted string
        INSIDE_CURLY_BRACES     : 10, // Inside a `{...}` block
        INSIDE_PARENTHESES      : 11, // Inside a `(...)` block
        PARSING_WHITESPACE      : 12, // Inside a sequence of whitespace characters
        PARSING_VALUE_EXPRESSION: 13, // Inside the value part of a CSS declaration
        PARSING_SIMPLE_VALUE    : 14, // Inside a simple, unquoted value
        PARSING_UNIT            : 15, // Inside a measurement unit (e.g., px, em)
        COMPLETED               : 16  // Tokenization finished
    };

    /**
     * Manages the state transitions for the tokenizer using a stack.
     * @class
     * @param {number} startingStage - The initial stage for the stack.
     */
    function StageStack(startingStage) {
        /** @type {Array<number>} */
        this.stages = [startingStage];
    }

    /**
     * Pushes a new stage onto the stack.
     * @param {number} newStage - The stage to add.
     */
    StageStack.prototype.addStage = function(newStage) {
        this.stages.push(newStage);
    };

    /**
     * Replaces the current top stage with a new one.
     * @param {number} nextStage - The stage to set as the new top.
     */
    StageStack.prototype.replaceTopStage = function(nextStage) {
        this.stages.pop(); // Remove the current stage
        this.stages.push(nextStage); // Add the new stage
    };

    /**
     * Removes and returns the top stage from the stack.
     * @returns {number|undefined} The removed stage, or undefined if stack is empty.
     */
    StageStack.prototype.removeTopStage = function() {
        return this.stages.pop();
    };

    /**
     * Returns the current top stage without removing it.
     * @returns {number|undefined} The current top stage, or undefined if stack is empty.
     */
    StageStack.prototype.getCurrentStage = function() {
        return this.stages[this.stages.length - 1];
    };

    /**
     * Pops stages from the stack until a specific target stage is found.
     * If the target stage is not found, the stack will be emptied.
     * @param {number} targetStage - The stage to revert to.
     */
    StageStack.prototype.revertToStage = function(targetStage) {
        while (this.stages.length > 0 && this.getCurrentStage() !== targetStage) {
            this.removeTopStage();
        }
        // If targetStage was not found and stack is empty, it indicates an error in state management.
    };

    // --- Core Tokenization Logic ---

    // Define some common character constants for readability and potential future customization.
    const CH_SLASH = '/';
    const CH_ASTERISK = '*';
    const CH_COLON = ':';
    const CH_SEMICOLON = ';';
    const CH_CURLY_OPEN = '{';
    const CH_CURLY_CLOSE = '}';
    const CH_PAREN_OPEN = '(';
    const CH_PAREN_CLOSE = ')';
    const CH_SINGLE_QUOTE = '\'';
    const CH_DOUBLE_QUOTE = '"';
    const CH_HYPHEN = '-';
    const CH_DOT = '.';
    const CH_COMMA = ',';
    const CH_BANG = '!';

    /**
     * Scans a character stream and produces a list of lexemes (tokens).
     * @param {object} charSource - An object with `read()` and `putBack()` methods for stream access.
     * @param {object} [options] - Configuration options for tokenization.
     * @param {number} [options.indentationWidth=4] - Number of spaces to use for tab replacement.
     * @returns {Array<{value: string, kind: number}>} An array of recognized lexemes.
     */
    const tokenizeInput = function (charSource, options) {
        /** @type {Array<{value: string, kind: number}>} */
        const resultLexemes = [];
        let pendingLexemeKind = null;
        let currentChar = '';
        let lexemeBuffer = '';
        const parsingStack = new StageStack(ParsingStage.INITIAL);
        let shouldAppendChar = true; // Controls whether currentChar is added to lexemeBuffer

        // Default options
        const processingOptions = {
            indentationWidth: 4 // Default tab space for formatting output
        };

        // Merge user-provided options, if any.
        if (options && typeof options === 'object') {
            Object.assign(processingOptions, options);
        }

        // Pre-calculate indentation string for tab replacement
        const indentString = ' '.repeat(processingOptions.indentationWidth);

        /**
         * Appends a new lexeme to the results list.
         * Resets the lexeme buffer and the 'lexeme ready' flag.
         * @param {string} textContent - The textual content of the lexeme.
         * @param {number} lexemeType - The kind/type of the lexeme.
         */
        function appendLexeme(textContent, lexemeType) {
            resultLexemes.push({ value: textContent, kind: lexemeType });
            pendingLexemeKind = null; // Clear the pending kind after capture
        }

        /**
         * Instructs the tokenizer to capture the current buffer as a lexeme
         * of the specified type at the next opportunity.
         * @param {number} type - The kind of lexeme to mark.
         */
        function markLexemeForCapture(type) {
            pendingLexemeKind = type;
        }

        /**
         * Puts the last read character back into the stream.
         * This ensures it's processed in the next iteration or by a different state.
         */
        function retreatSource() {
            charSource.putBack();
            shouldAppendChar = false; // Do not append the current char to buffer if put back
        }

        // Main tokenization loop
        while (parsingStack.getCurrentStage() !== ParsingStage.COMPLETED) {
            currentChar = charSource.read();
            shouldAppendChar = true; // Assume char should be appended unless putBack() is called

            const currentStage = parsingStack.getCurrentStage();

            // Handle common end-of-file condition
            if (currentChar === jQ.Stream.END_OF_FILE_MARKER) {
                 // If EOF is encountered, we need to flush any pending buffer as UNRECOGNIZED
                 // before transitioning to COMPLETED.
                 if (lexemeBuffer.length > 0) {
                     appendLexeme(lexemeBuffer, pendingLexemeKind || Lexeme.kind.UNRECOGNIZED);
                     lexemeBuffer = ''; // Clear buffer after appending
                 }
                 markLexemeForCapture(Lexeme.kind.END_OF_STREAM); // Mark EOF as a final token
                 parsingStack.replaceTopStage(ParsingStage.COMPLETED); // Transition to final state
                 retreatSource(); // Put back EOF so the final appendLexeme works if needed
                 continue; // Skip the rest of the loop for this iteration
            }

            // State machine logic
            switch (currentStage) {

                case ParsingStage.INITIAL:
                    if (jQ.utils.isAlphabetic(currentChar) || currentChar === CH_DOT || currentChar === '#' || currentChar === CH_ASTERISK || currentChar === '$' || currentChar === CH_COLON) {
                        parsingStack.addStage(ParsingStage.PARSING_SELECTOR);
                    } else if (jQ.utils.isWhitespace(currentChar)) {
                        parsingStack.addStage(ParsingStage.PARSING_WHITESPACE);
                    } else if (currentChar === CH_COMMA || currentChar === '[' || currentChar === ']' || currentChar === '>') {
                        markLexemeForCapture(Lexeme.kind.PUNCTUATION);
                    } else if (currentChar === CH_CURLY_OPEN){
                        markLexemeForCapture(Lexeme.kind.PUNCTUATION);
                        parsingStack.addStage(ParsingStage.INSIDE_CURLY_BRACES);
                    } else if (currentChar === jQ.Stream.END_OF_LINE_MARKER) {
                        markLexemeForCapture(Lexeme.kind.LINE_BREAK);
                    } else if (currentChar === CH_SLASH) {
                        if (charSource.pick() === CH_ASTERISK) {
                            parsingStack.addStage(ParsingStage.PARSING_COMMENT);
                        } else {
                            markLexemeForCapture(Lexeme.kind.UNRECOGNIZED);
                        }
                    } else {
                        markLexemeForCapture(Lexeme.kind.UNRECOGNIZED);
                    }
                    break;

                case ParsingStage.PARSING_WHITESPACE:
                    if (!jQ.utils.isWhitespace(currentChar) ) {
                        retreatSource();
                        markLexemeForCapture(Lexeme.kind.WHITESPACE);
                        parsingStack.removeTopStage();
                    }
                    break;

                case ParsingStage.PARSING_SELECTOR:
                    if (!jQ.utils.isAlphabetic(currentChar) && !jQ.utils.isNumeric(currentChar) && currentChar !== CH_HYPHEN) {
                        retreatSource();
                        parsingStack.removeTopStage();
                        markLexemeForCapture(Lexeme.kind.CSS_SELECTOR);
                    }
                    break;

                case ParsingStage.INSIDE_CURLY_BRACES:
                    if (currentChar === CH_CURLY_CLOSE) {
                        parsingStack.removeTopStage();
                        markLexemeForCapture(Lexeme.kind.PUNCTUATION);
                    } else if (jQ.utils.isWhitespace(currentChar)) {
                        parsingStack.addStage(ParsingStage.PARSING_WHITESPACE);
                    } else if (jQ.utils.isAlphabetic(currentChar) || currentChar === CH_HYPHEN) {
                        parsingStack.addStage(ParsingStage.PARSING_PROPERTY_NAME);
                    } else if (currentChar === CH_SLASH) {
                        if (charSource.pick() === CH_ASTERISK) {
                            parsingStack.addStage(ParsingStage.PARSING_COMMENT);
                        } else {
                            markLexemeForCapture(Lexeme.kind.UNRECOGNIZED);
                        }
                    } else if (currentChar === jQ.Stream.END_OF_LINE_MARKER) {
                        markLexemeForCapture(Lexeme.kind.LINE_BREAK);
                    } else {
                        markLexemeForCapture(Lexeme.kind.UNRECOGNIZED);
                    }
                    break;

                case ParsingStage.PARSING_PROPERTY_NAME:
                    if (!jQ.utils.isAlphabetic(currentChar) && currentChar !== CH_HYPHEN) {
                        retreatSource();
                        markLexemeForCapture(Lexeme.kind.CSS_PROPERTY);
                        parsingStack.replaceTopStage(ParsingStage.PROPERTY_NAME_END);
                    }
                    break;

                case ParsingStage.PROPERTY_NAME_END:
                    if (jQ.utils.isWhitespace(currentChar)) {
                        parsingStack.addStage(ParsingStage.PARSING_WHITESPACE);
                    } else if (currentChar === CH_COLON) {
                        markLexemeForCapture(Lexeme.kind.PUNCTUATION);
                        parsingStack.replaceTopStage(ParsingStage.PARSING_VALUE_EXPRESSION);
                    } else if (currentChar === CH_SLASH) {
                        if (charSource.pick() === CH_ASTERISK) {
                            parsingStack.addStage(ParsingStage.PARSING_COMMENT);
                        } else {
                            markLexemeForCapture(Lexeme.kind.UNRECOGNIZED);
                        }
                    } else if (currentChar === CH_SEMICOLON) {
                        parsingStack.removeTopStage(); // Pop PROPERTY_NAME_END
                        markLexemeForCapture(Lexeme.kind.PUNCTUATION);
                    } else if (currentChar === CH_CURLY_CLOSE) {
                        markLexemeForCapture(Lexeme.kind.PUNCTUATION);
                        parsingStack.revertToStage(ParsingStage.INSIDE_CURLY_BRACES); // Pop until curly brace
                        parsingStack.removeTopStage(); // Then pop the curly brace itself
                    } else {
                        markLexemeForCapture(Lexeme.kind.UNRECOGNIZED);
                    }
                    break;

                case ParsingStage.PARSING_VALUE_EXPRESSION:
                    if (jQ.utils.isWhitespace(currentChar)) {
                        parsingStack.addStage(ParsingStage.PARSING_WHITESPACE);
                    } else if (currentChar === CH_SEMICOLON) {
                        parsingStack.removeTopStage(); // Pop PARSING_VALUE_EXPRESSION
                        markLexemeForCapture(Lexeme.kind.PUNCTUATION);
                    } else if (jQ.utils.isNumeric(currentChar) || currentChar === CH_DOT) {
                        parsingStack.addStage(ParsingStage.PARSING_NUMBER);
                    } else if (jQ.utils.isAlphabetic(currentChar) || currentChar === '#') {
                        parsingStack.addStage(ParsingStage.PARSING_SIMPLE_VALUE);
                    } else if (currentChar === CH_CURLY_CLOSE) {
                        parsingStack.revertToStage(ParsingStage.INSIDE_CURLY_BRACES);
                        markLexemeForCapture(Lexeme.kind.PUNCTUATION);
                    } else if (currentChar === CH_SLASH) {
                        if (charSource.pick() === CH_ASTERISK) {
                            parsingStack.addStage(ParsingStage.PARSING_COMMENT);
                        } else {
                            markLexemeForCapture(Lexeme.kind.UNRECOGNIZED);
                        }
                    } else if (currentChar === CH_PAREN_OPEN){
                        markLexemeForCapture(Lexeme.kind.PUNCTUATION);
                        parsingStack.addStage(ParsingStage.INSIDE_PARENTHESES);
                    } else if (currentChar === CH_SINGLE_QUOTE){
                        parsingStack.addStage(ParsingStage.IN_SINGLE_QUOTE_STRING);
                    } else if (currentChar === CH_DOUBLE_QUOTE){
                        parsingStack.addStage(ParsingStage.IN_DOUBLE_QUOTE_STRING);
                    } else if (currentChar === CH_BANG){
                        markLexemeForCapture(Lexeme.kind.PUNCTUATION);
                    } else {
                        markLexemeForCapture(Lexeme.kind.UNRECOGNIZED);
                    }
                    break;

                case ParsingStage.PARSING_SIMPLE_VALUE:
                    if (!jQ.utils.isAlphabetic(currentChar) && currentChar !== CH_HYPHEN) {
                        markLexemeForCapture(Lexeme.kind.CSS_VALUE);
                        retreatSource();
                        parsingStack.removeTopStage();
                    }
                    break;

                case ParsingStage.INSIDE_PARENTHESES:
                    if (jQ.utils.isNumeric(currentChar) || currentChar === CH_DOT) {
                        parsingStack.addStage(ParsingStage.PARSING_NUMBER);
                    } else if (currentChar === CH_COMMA) {
                        markLexemeForCapture(Lexeme.kind.PUNCTUATION);
                    } else if (currentChar === CH_PAREN_CLOSE) {
                        markLexemeForCapture(Lexeme.kind.PUNCTUATION);
                        parsingStack.removeTopStage();
                    } else if (jQ.utils.isAlphabetic(currentChar) || currentChar === '#'){
                        // If it's alphanumeric, it could be part of a value expression (e.g., url(image.png))
                        // Put back the char and transition to value expression parsing.
                        retreatSource();
                        parsingStack.addStage(ParsingStage.PARSING_VALUE_EXPRESSION);
                    } else if (currentChar === CH_SINGLE_QUOTE){
                        parsingStack.addStage(ParsingStage.IN_SINGLE_QUOTE_STRING);
                    } else if (currentChar === CH_DOUBLE_QUOTE){
                        parsingStack.addStage(ParsingStage.IN_DOUBLE_QUOTE_STRING);
                    } else if (currentChar === jQ.Stream.END_OF_LINE_MARKER) {
                        markLexemeForCapture(Lexeme.kind.LINE_BREAK);
                    } else if (currentChar === CH_CURLY_CLOSE) {
                        markLexemeForCapture(Lexeme.kind.PUNCTUATION);
                        parsingStack.revertToStage(ParsingStage.INSIDE_CURLY_BRACES);
                    } else if (jQ.utils.isWhitespace(currentChar)) {
                        parsingStack.addStage(ParsingStage.PARSING_WHITESPACE);
                    }
                    break;

                case ParsingStage.PARSING_NUMBER:
                    if (!jQ.utils.isNumeric(currentChar) && currentChar !== CH_DOT) {
                        if (jQ.utils.isAlphabetic(currentChar) || currentChar === '%') {
                            parsingStack.replaceTopStage(ParsingStage.PARSING_UNIT);
                        } else {
                            parsingStack.removeTopStage(); // Exit number state
                        }
                        retreatSource();
                        markLexemeForCapture(Lexeme.kind.NUMERIC_LITERAL);
                    }
                    break;

                case ParsingStage.PARSING_UNIT:
                    if (!jQ.utils.isAlphabetic(currentChar)) {
                        parsingStack.removeTopStage(); // Exit unit state
                        retreatSource();
                        markLexemeForCapture(Lexeme.kind.MEASUREMENT_UNIT);
                    }
                    break;

                case ParsingStage.IN_SINGLE_QUOTE_STRING:
                    if (currentChar === CH_SINGLE_QUOTE) {
                        parsingStack.removeTopStage();
                        markLexemeForCapture(Lexeme.kind.CSS_VALUE);
                    } else if (currentChar === jQ.Stream.END_OF_LINE_MARKER){
                        markLexemeForCapture(Lexeme.kind.LINE_BREAK);
                    }
                    break;

                case ParsingStage.IN_DOUBLE_QUOTE_STRING:
                    if (currentChar === CH_DOUBLE_QUOTE) {
                        parsingStack.removeTopStage();
                        markLexemeForCapture(Lexeme.kind.CSS_VALUE);
                    } else if (currentChar === jQ.Stream.END_OF_LINE_MARKER){
                        // EOL within a double-quoted string is generally treated as part of the string literal.
                    }
                    break;

                case ParsingStage.PARSING_COMMENT:
                    // Inside /* ... */ comment
                    if (currentChar === CH_ASTERISK) {
                        if (charSource.pick() === CH_SLASH) {
                            parsingStack.replaceTopStage(ParsingStage.COMMENT_END_DELIMITER);
                            retreatSource(); // Keep '*' in buffer, next char '/' will be processed by COMMENT_END_DELIMITER
                        }
                    }
                    break;

                case ParsingStage.COMMENT_END_DELIMITER:
                    // After seeing '*' and now processing '/'
                    if (currentChar === CH_SLASH) {
                        parsingStack.removeTopStage(); // Pop COMMENT_END_DELIMITER
                        markLexemeForCapture(Lexeme.kind.CODE_COMMENT);
                    }
                    // If it's not '/', it implies a malformed comment (e.g., `/* *x` instead of `/* */`)
                    // In this case, the `*` and `x` would remain in the buffer for the comment.
                    break;

                default :
                    // This case should ideally not be reached if all states are properly handled.
                    // If it does, it indicates an unhandled state or a bug in state transitions.
                    console.warn(`Tokenizer entered an unhandled state: ${currentStage}. Forcing completion.`);
                    parsingStack.replaceTopStage(ParsingStage.COMPLETED); // Force exit to prevent infinite loop
                    break;
            }

            // Append character to buffer if not put back or ignored
            if (shouldAppendChar) {
                if (currentChar === '\t') {
                    lexemeBuffer += indentString;
                } else {
                    lexemeBuffer += currentChar;
                }
            }

            // If a lexeme was marked for capture, append it to results.
            if (pendingLexemeKind !== null) {
                // If the buffer is empty but a lexeme was marked (e.g., for a single-char punctuation),
                // use the current char directly.
                const finalBuffer = lexemeBuffer.length > 0 ? lexemeBuffer : (shouldAppendChar ? currentChar : '');
                if (finalBuffer.length > 0 || pendingLexemeKind === Lexeme.kind.END_OF_STREAM) { // Ensure actual content or EOF
                    appendLexeme(finalBuffer, pendingLexemeKind);
                }
                lexemeBuffer = ''; // Reset buffer after capture
            }
        }

        // Final check for any remaining buffer after loop exits (e.g., if EOF hits mid-token)
        if (lexemeBuffer.length > 0) {
            appendLexeme(lexemeBuffer, Lexeme.kind.UNRECOGNIZED); // Treat remaining as unknown
        }

        return resultLexemes;
    };

    // Expose the tokenizer and its lexeme kind map
    jQ.tokenizer['css'] = {
        scan: tokenizeInput,
        lexemeTypes: Lexeme.typeLookup
    };

}(lighter));