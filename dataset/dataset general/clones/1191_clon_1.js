/* This is a Type I clone generated from the original source code. */
// The purpose is to demonstrate variations in whitespace and comments.

'use strict';


( function ( $ ) {
  // Ensure the $.lexer namespace exists, initializing it if not.
  $.lexer = $.lexer || {};


  var Token = {}; // Definition of the Token object.


  /*
   * Defines various token types used by the lexer.
   * These types categorize the parsed elements in the input stream.
   */
  Token.type = {
    EOF: -2, // End-of-file marker, corresponds to $.Stream.EOF.
    EOL: -1, // End-of-line marker, important for stream processing.
    WHITE: 0,
    UNIT: 1,
    COMMENT: 2,
    SIMBOL: 3,
    NUMBER: 4,
    PROPERTY: 5,
    VALUE: 6,
    SELECTOR: 7,
    UNKNOWN: 8 // For characters or sequences not recognized.
  };



  // Creates a mapping from token type numeric values to lowercase string names.
  Token.map = ( function ( types ) {
    var ret = {}; // Initialize an empty object for the map.

    for ( var name in types ) {
      // Populate the map: key is numeric type, value is lowercase name.
      ret[ types[ name ] ] = name.toLowerCase();
    }
    return ret;
  }( Token.type ) ); // Immediately invoke with Token.type.



  /*
   * Defines the various states the lexer can be in during scanning.
   * Each state represents a particular context in the parsing process.
   */
  var State = {
    START: 0,
    INNUM: 1,
    INCOMMENT: 2,
    COMMENTBEGIN: 3,
    COMMENTEND: 4,
    INSELECTOR: 5,
    PROPERTYEND: 6,
    INPROPERTY: 7,
    INQUOTATION: 8,
    INSINGLEQUOTATION: 9,
    INBRACKET: 10,
    INBRACE: 11,
    INWHITE: 12,
    INVALUEAREA: 13,
    INPROPERTYVALUE: 14,
    INUNIT: 15,
    DONE: 16
  };



  /**
   * Manages the state stack for the lexer.
   * Allows pushing, popping, changing, and peeking states.
   * @param {number} startup The initial state.
   * @constructor
   */
  function States ( startup ) {
    this.states = [ startup ]; // Initialize with the starting state.
  }


  // Pushes a new state onto the stack.
  States.prototype.push = function ( state ) {
    this.states.push( state );
  };


  // Changes the current state by popping the top and pushing a new one.
  States.prototype.change = function ( state ) {
    this.states.pop();
    this.states.push( state );
  };


  // Removes and returns the top state from the stack.
  States.prototype.pop = function () {
    return this.states.pop();
  };


  // Returns the top state without removing it.
  States.prototype.top = function () {
    return this.states[ this.states.length - 1 ];
  };


  // Pops states from the stack until a specific state is found.
  States.prototype.popUntil = function ( state ) {
    while ( this.pop() !== state ) {
      /* Loop until the target state is reached. */
    }
  };


  /**
   * The main scanning function for the lexer.
   * Reads from a stream and produces a list of tokens.
   * @param {object} stream The input stream to read from.
   * @param {object} opt Optional configuration object.
   * @returns {Array<object>} An array of token objects.
   */
  var scan = function ( stream, opt ) {
    var currentToken = null,       // Holds the type of the token being built.
        tokens = [],               // Array to store all generated tokens.
        c = '',                    // Current character read from the stream.
        buffer = '',               // Accumulates characters for the current token.
        state = new States( State.START ), // Manages the lexer's state.
        tabSpace = 4,              // Default number of spaces for a tab.
        save = true,               // Flag to indicate if current char should be buffered.
        _saveToken = false,        // Flag to indicate if a token should be saved.
        ignore = false;            // Unused variable, kept for structural identity.


    // Apply options if provided.
    if ( opt !== undefined ) {
      tabSpace = opt.tabSpace;
    }


    // Pre-calculate the intent string for tabs.
    var intent = '';
    for ( var i = 0; i < tabSpace; i++ ) {
      intent += ' ';
    }


    /**
     * Adds a new token to the tokens array.
     * @param {string} buffer The text content of the token.
     * @param {number} token The type of the token.
     */
    function addToken ( buffer, token ) {
      tokens.push( { text: buffer, type: token } );
      _saveToken = false; // Reset the save token flag.
    }


    /**
     * Marks a token type to be saved in the next cycle.
     * @param {number} token The type of the token.
     */
    function saveToken ( token ) {
      currentToken = token;
      _saveToken = true;
    }


    /**
     * Puts the last read character back into the stream and prevents it from being buffered.
     */
    function putBack () {
      stream.putBack();
      save = false; // Do not save the character that was put back.
    }


    // Main lexing loop: continues until the DONE state is reached.
    while ( state.top() !== State.DONE ) {

      c = stream.read(); // Read the next character.
      save = true;       // Assume character should be saved by default.

      // State machine logic based on the current lexer state.
      switch ( state.top() ) {

        case State.START:
          if ( $.type.isAlpha( c ) || c === '.' || c === '#' || c === '*' || c === '$' || c === ':' ) {
            state.push( State.INSELECTOR ); // Entering a selector.
          } else if ( $.type.isWhite( c ) ) {
            state.push( State.INWHITE ); // Entering whitespace.
          } else if ( c === ',' || c === '[' || c === ']' || c === '>' ) {
            saveToken( Token.type.SIMBOL ); // Found a standalone symbol.
          } else if ( c === '{' ) {
            saveToken( Token.type.SIMBOL );
            state.push( State.INBRACKET ); // Entering a bracketed block.
          } else if ( c === $.Stream.EOL ) {
            saveToken( Token.type.EOL ); // End of line encountered.
          } else if ( c === $.Stream.EOF ) {
            putBack(); // Put EOF back, then transition to DONE.
            state.change( State.DONE );
          } else if ( c === '/' ) {
            if ( stream.pick() === '*' ) {
              state.push( State.INCOMMENT ); // Start of a multi-line comment.
            } else {
              saveToken( Token.type.UNKNOWN ); // Unrecognized character after '/'
            }
          } else {
            saveToken( Token.type.UNKNOWN ); // Any other unrecognized character.
          }
          break; // End of State.START

        case State.INWHITE:
          if ( !$.type.isWhite( c ) ) {
            putBack(); // Not whitespace anymore, put char back.
            saveToken( Token.type.WHITE ); // Save accumulated whitespace.
            state.pop(); // Exit INWHITE state.
          }
          break; // End of State.INWHITE

        case State.INSELECTOR:
          // Selector continues as long as it's alpha, numeric, or a hyphen.
          if ( !$.type.isAlpha( c ) && !$.type.isNum( c ) && c !== '-' ) {
            putBack(); // Selector ended, put char back.
            state.pop(); // Exit INSELECTOR state.
            saveToken( Token.type.SELECTOR ); // Save the selector token.
          }
          break; // End of State.INSELECTOR

        case State.INBRACKET:
          if ( c === '}' ) {
            state.pop(); // Exit INBRACKET state.
            saveToken( Token.type.SIMBOL ); // Save the closing brace.
          } else if ( $.type.isWhite( c ) ) {
            state.push( State.INWHITE ); // Encountered whitespace inside brackets.
          } else if ( $.type.isAlpha( c ) || c === '-' ) {
            state.push( State.INPROPERTY ); // Entering a property name.
          } else if ( c === '/' ) {
            if ( stream.pick() === '*' ) {
              state.push( State.INCOMMENT ); // Start of a comment inside brackets.
            } else {
              saveToken( Token.type.UNKNOWN ); // Unrecognized.
            }
          } else if ( c === $.Stream.EOL ) {
            saveToken( Token.type.EOL ); // End of line inside brackets.
          } else if ( c === $.Stream.EOF ) {
            putBack();
            state.change( State.DONE ); // End of file inside brackets, finish.
          } else {
            saveToken( Token.type.UNKNOWN ); // Unrecognized character inside brackets.
          }
          break; // End of State.INBRACKET

        case State.INPROPERTY:
          // Property name continues as long as it's alpha or a hyphen.
          if ( $.type.isAlpha( c ) || c === '-' ) {
            // Do nothing, keep buffering the property name.
          } else {
            putBack(); // Property name ended.
            saveToken( Token.type.PROPERTY ); // Save the property token.
            state.change( State.PROPERTYEND ); // Transition to PROPERTYEND.
          }
          break; // End of State.INPROPERTY

        case State.PROPERTYEND:
          if ( $.type.isWhite( c ) ) {
            state.push( State.INWHITE ); // Whitespace after property name.
          } else if ( c === ':' ) {
            saveToken( Token.type.SIMBOL ); // Found the colon separating property and value.
            state.change( State.INVALUEAREA ); // Transition to INVALUEAREA.
          } else if ( c === '/' ) {
            if ( stream.pick() === '*' ) {
              state.push( State.INCOMMENT ); // Comment after property name.
            } else {
              saveToken( Token.type.UNKNOWN ); // Unrecognized.
            }
          } else if ( c === ';' ) {
            state.pop(); // Pop PROPERTYEND (and INPROPERTY before it).
            saveToken( Token.type.SIMBOL ); // Save the semicolon.
          } else if ( c === '}' ) {
            saveToken( Token.type.SIMBOL ); // Save the closing brace.
            state.popUntil( State.INBRACKET ); // Pop until the INBRACKET state.
          } else {
            saveToken( Token.type.UNKNOWN ); // Unrecognized character.
          }
          break; // End of State.PROPERTYEND

        case State.INVALUEAREA:
          if ( $.type.isWhite( c ) ) {
            state.push( State.INWHITE ); // Whitespace in value area.
          } else if ( c === ';' ) {
            state.pop(); // Exit INVALUEAREA.
            saveToken( Token.type.SIMBOL ); // Save semicolon.
          } else if ( $.type.isNum( c ) || c === '.' ) {
            state.push( State.INNUM ); // Entering a number.
          } else if ( $.type.isAlpha( c ) || c === '#' ) {
            state.push( State.INPROPERTYVALUE ); // Entering a property value (e.g., color name, hex code).
          } else if ( c === '}' ) {
            state.popUntil( State.INBRACKET ); // Value area ends, pop until INBRACKET.
            saveToken( Token.type.SIMBOL ); // Save closing brace.
          } else if ( c === '/' ) {
            if ( stream.pick() === '*' ) {
              state.push( State.INCOMMENT ); // Comment in value area.
            } else {
              saveToken( Token.type.UNKNOWN ); // Unrecognized.
            }
          } else if ( c === '(' ) {
            saveToken( Token.type.SIMBOL ); // Opening parenthesis for function values.
            state.push( State.INBRACE ); // Enter INBRACE state.
          } else if ( c === '\'' ) {
            state.push( State.INSINGLEQUOTATION ); // Single-quoted string.
          } else if ( c === '"' ) {
            state.push( State.INQUOTATION ); // Double-quoted string.
          } else if ( c === '!' ) {
            saveToken( Token.type.SIMBOL ); // Exclamation mark (e.g., !important).
          } else if ( c === $.Stream.EOF ) {
            putBack();
            state.change( State.DONE ); // End of file, finish.
          } else {
            saveToken( Token.type.UNKNOWN ); // Unrecognized character.
          }
          break; // End of State.INVALUEAREA

        case State.INPROPERTYVALUE:
          // Property value ends when it's not alpha and not a hyphen.
          if ( !$.type.isAlpha( c ) && c !== '-' ) {
            saveToken( Token.type.VALUE ); // Save the accumulated value.
            putBack(); // Put the non-value character back.
            state.pop(); // Exit INPROPERTYVALUE state.
          }
          break; // End of State.INPROPERTYVALUE

        case State.INBRACE:
          if ( $.type.isNum( c ) || c === '.' ) {
            state.push( State.INNUM ); // Number inside parentheses.
          } else if ( c === ',' ) {
            saveToken( Token.type.SIMBOL ); // Comma separator.
          } else if ( c === ')' ) {
            saveToken( Token.type.SIMBOL ); // Closing parenthesis.
            state.pop(); // Exit INBRACE state.
          } else if ( $.type.isAlpha( c ) || c === '#' ) {
            putBack(); // Start of a value.
            state.push( State.INVALUEAREA ); // Re-enter INVALUEAREA for nested values.
          } else if ( c === '\'' ) {
            state.push( State.INSINGLEQUOTATION ); // Single-quoted string.
          } else if ( c === '"' ) {
            state.push( State.INQUOTATION ); // Double-quoted string.
          } else if ( c === $.Stream.EOL ) {
            saveToken( Token.type.EOL ); // End of line.
          } else if ( c === '}' ) {
            saveToken( Token.type.SIMBOL ); // Closing brace.
            state.popUntil( State.INBRACKET ); // Pop states until the main bracket.
          } else if ( $.type.isWhite( c ) ) {
            state.push( State.INWHITE ); // Whitespace.
          } else if ( c === $.Stream.EOF ) {
            putBack();
            state.change( State.DONE ); // End of file, finish.
          }
          break; // End of State.INBRACE

        case State.INNUM:
          // Number ends when it's not numeric and not a dot.
          if ( !$.type.isNum( c ) && c !== '.' ) {
            if ( $.type.isAlpha( c ) || c === '%' ) {
              state.change( State.INUNIT ); // Number followed by a unit.
            } else {
              state.pop(); // Number finished.
            }
            putBack(); // Put back the non-numeric character.
            saveToken( Token.type.NUMBER ); // Save the number.
          }
          break; // End of State.INNUM

        case State.INUNIT:
          // Unit ends when it's not an alphabetic character.
          if ( !$.type.isAlpha( c ) ) {
            state.pop(); // Exit INUNIT state.
            putBack(); // Put back the non-alpha character.
            saveToken( Token.type.UNIT ); // Save the unit.
          }
          break; // End of State.INUNIT

        case State.INSINGLEQUOTATION:
          if ( c === '\'' ) {
            state.pop(); // End of single-quoted string.
            saveToken( Token.type.VALUE ); // Save the string as a value.
          } else if ( c === $.Stream.EOL ) {
            saveToken( Token.type.EOL ); // EOL inside string.
          } else if ( c === $.Stream.EOF ) {
            state.change( State.DONE ); // EOF inside string, finish.
            saveToken( Token.type.VALUE ); // Save the partial string.
            putBack();
          }
          break; // End of State.INSINGLEQUOTATION

        case State.INQUOTATION:
          if ( c === '"' ) {
            state.pop(); // End of double-quoted string.
            saveToken( Token.type.VALUE ); // Save the string as a value.
          } else if ( c === $.Stream.EOL ) {
            c = '\n'; // Convert EOL to newline character within buffer.
          } else if ( c === $.Stream.EOF ) {
            state.change( State.DONE ); // EOF inside string, finish.
            saveToken( Token.type.VALUE ); // Save the partial string.
            putBack();
          }
          break; // End of State.INQUOTATION

        case State.COMMENTBEGIN:
          // This state seems to be an intermediate, possibly deprecated,
          // as it only checks buffer length and changes to INCOMMENT.
          if ( buffer.length === 4 ) {
            state.change( State.INCOMMENT );
          }
          break; // End of State.COMMENTBEGIN

        case State.INCOMMENT:
          if ( c === '*' ) {
            if ( stream.pick() === '/' ) {
              state.change( State.COMMENTEND ); // Found '*/', transition to COMMENTEND.
              putBack(); // Put '/' back for COMMENTEND to process.
            }
          } else if ( c === $.Stream.EOF ) {
            state.change( State.DONE ); // EOF inside comment, finish.
            putBack();
            saveToken( Token.type.COMMENT ); // Save the comment.
          }
          break; // End of State.INCOMMENT

        case State.COMMENTEND:
          if ( c === '/' ) {
            state.pop(); // Exit comment state.
            saveToken( Token.type.COMMENT ); // Save the comment token.
          }
          break; // End of State.COMMENTEND

        default:
          // This case should theoretically never be reached if all states are handled.
          // It's a defensive programming measure.
      }


      // Buffer character if 'save' flag is true.
      if ( save === true ) {
        if ( c === '\t' ) {
          buffer += intent; // Replace tab with spaces.
        } else {
          buffer += c; // Append character to buffer.
          if ( buffer.length > 100 ) {
            // Safety break to prevent excessively long tokens or infinite loops.
            return tokens;
          }
        }
      }


      // If a token was marked for saving, add it to the list.
      if ( _saveToken ) {
        addToken( buffer, currentToken ); // Add the token.
        if ( tokens.length > 1000 ) {
          // Another safety break for too many tokens, indicates potential issue.
          console.log('bug');
          return tokens;
        }
        buffer = ''; // Reset buffer after saving token.
      }
    } // End of while loop.

    return tokens; // Return the list of parsed tokens.
  };


  // Expose the lexer for CSS parsing.
  $.lexer[ 'css' ] = {
    scan: scan,       // The scanning function.
    map: Token.map    // The token type map.
  };

}( lighter ) ); // Immediately invoked function expression.