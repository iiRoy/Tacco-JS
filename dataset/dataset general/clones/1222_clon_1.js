CodeMirror.defineMode( "rust", function( ) {
  // This mode provides syntax highlighting for the Rust programming language.
  // It defines rules for tokenizing and parsing Rust code.

  // Indentation units used throughout the mode.
  var indentUnit      = 4
    , altIndentUnit   = 2
  ; // Standard and alternative indentation levels.

  // A mapping of Rust keywords to their corresponding token categories
  // when encountered in a value context (e.g., expressions, statements).
  var valKeywords = {
      "if"        : "if-style"
    , "while"     : "if-style"
    , "else"      : "else-style"
    , "do"        : "else-style"
    , "ret"       : "else-style"
    , "fail"      : "else-style"
    , "break"     : "atom"
    , "cont"      : "atom"
    , "const"     : "let"
    , "resource"  : "fn"
    , "let"       : "let"
    , "fn"        : "fn"
    , "for"       : "for"
    , "alt"       : "alt"
    , "obj"       : "fn"
    , "lambda"    : "fn"
    , "type"      : "type"
    , "tag"       : "tag"
    , "mod"       : "mod"
    , "as"        : "op"
    , "true"      : "atom"
    , "false"     : "atom"
    , "assert"    : "op"
    , "check"     : "op"
    , "claim"     : "op"
    , "native"    : "ignore"
    , "unsafe"    : "ignore"
    , "import"    : "else-style"
    , "export"    : "else-style"
    , "copy"      : "op"
    , "log"       : "op"
    , "log_err"   : "op"
  };

  // Keywords specific to type contexts.
  // This is an immediately invoked function expression (IIFE)
  // to initialize the typeKeywords object.
  var typeKeywords = ( function( ) {
    var keywords = {
        "fn"    : "fn"
      , "block" : "fn"
      , "obj"   : "obj"
    };

    // Rust's primitive atomic types.
    var atoms = "bool uint int i8 i16 i32 i64 u8 u16 u32 u64 float f32 f64 str char".split( " " );

    // Add all primitive types to the keywords map for type contexts.
    for ( var i = 0, e = atoms.length; i < e; ++i ) {
      keywords[ atoms[ i ] ] = "atom";
    }

    return keywords; // Return the populated type keywords object.

  } )( ); // Execute the function to set `typeKeywords`.

  // Regular expression to identify characters commonly used in operators.
  var operatorChar = /[+\-*&%=<>!?|\.@]/;


  // --- Tokenizer Implementation -----------------------------------------------

  // These variables are used globally within the tokenizer functions
  // to avoid passing them repeatedly or creating many temporary objects.
  // `tcat` stores the token category, `content` stores the actual text of the token.
  var tcat
    , content
  ;

  /**
   * Helper function to set the global token category and return the style string.
   * This simplifies token classification and style assignment.
   * @param {string} tc The token category (e.g., "atom", "op", "name").
   * @param {string} style The CSS class name for CodeMirror styling.
   * @returns {string} The provided style string.
   */
  function r( tc, style ) {
    tcat = tc; // Assign the token category.
    return style; // Return the style.
  }

  /**
   * The base tokenizer function. It determines the type of the next token
   * by examining the current character and the stream.
   * It handles strings, comments, numbers, keywords, and identifiers.
   * @param {CodeMirror.Stream} stream The CodeMirror stream object.
   * @param {object} state The current parser state.
   * @returns {string|null} The CSS class for the token, or null if no specific style.
   */
  function tokenBase( stream, state ) {
    var ch = stream.next( ); // Consume the next character.

    // Handle string literals.
    if ( ch == '"' ) {
      state.tokenize = tokenString; // Switch to string parsing mode.
      return state.tokenize( stream, state ); // Continue tokenizing in string mode.
    }

    // Handle character literals.
    if ( ch == "'" ) {
      tcat = "atom"; // Character literals are considered atomic values.
      if ( stream.eat( "\\" ) ) { // Check for an escape sequence.
        // If an escape sequence is present, skip until the closing quote.
        if ( stream.skipTo( "'" ) ) {
          stream.next( ); // Consume the closing quote.
          return "string";
        }
        else {
          return "error"; // Unclosed character literal with escape.
        }
      } else {
        stream.next( ); // Consume the character itself.
        // Check if the next character is the closing quote.
        return stream.eat( "'" ) ? "string" : "error";
      }
    }

    // Handle comments.
    if ( ch == "/" ) {
      if ( stream.eat( "/" ) ) { // Line comment `//`.
        stream.skipToEnd( ); // Consume the rest of the line.
        return "comment";
      }
      if ( stream.eat( "*" ) ) { // Block comment `/*`.
        state.tokenize = tokenComment( 1 ); // Switch to block comment parsing mode, depth 1.
        return state.tokenize( stream, state );
      }
    }

    // Handle attributes (e.g., `#![allow(unused_variables)]`).
    if ( ch == "#" ) {
      if ( stream.eat( "[" ) ) {
        tcat = "open-attr"; // Special category for attribute opening.
        return null; // Attributes don't have a direct style here.
      }
      stream.eatWhile( /\w/ ); // Consume the macro name.
      return r( "macro", "meta" ); // Treat attributes as meta-information.
    }

    // Handle the generic path separator operator `::<`.
    if ( ch == ":" && stream.match( ":<" ) ) {
      return r( "op", null ); // It's an operator.
    }

    // Handle numeric literals (integers, floating points, hex, binary, etc.).
    // This includes numbers starting with a digit or a decimal point followed by a digit.
    if ( ch.match( /\d/ ) || ( ch == "." && stream.eat( /\d/ ) ) ) {
      var flp = false; // Flag to indicate if it's a floating-point number.

      // Check for hexadecimal (`0x...`) or binary (`0b...`) prefixes.
      if ( !stream.match( /^x[\da-f]+/i ) && !stream.match( /^b[01]+/ ) ) {
        stream.eatWhile( /\d/ ); // Consume integer part.
        if ( stream.eat( "." ) ) { // Check for decimal point.
          flp = true; // Mark as float.
          stream.eatWhile( /\d/ ); // Consume fractional part.
        }
        if ( stream.match( /^e[+\-]?\d+/i ) ) { // Check for exponent (e.g., `1.2e-3`).
          flp = true; // Mark as float.
        }
      }

      // Handle type suffixes for numbers (e.g., `1.0f32`, `1u64`).
      if ( flp ) {
        stream.match( /^f(?:32|64)/ ); // Float suffixes.
      }
      else {
        stream.match( /^[ui](?:8|16|32|64)/ ); // Integer suffixes.
      }

      return r( "atom", "number" ); // Numeric literals are atomic.
    }

    // Handle punctuation characters that serve as structural elements.
    if ( ch.match( /[()\[\]{}:;,]/ ) ) {
      return r( ch, null ); // The character itself is its category.
    }

    // Handle the `->` (arrow) operator for function return types.
    if ( ch == "-" && stream.eat( ">" ) ) {
      return r( "->", null );
    }

    // Handle other general operators.
    if ( ch.match( operatorChar ) ) {
      stream.eatWhile( operatorChar ); // Consume all contiguous operator characters.
      return r( "op", null ); // Categorize as an operator.
    }

    // If none of the above, it's likely an identifier or keyword.
    stream.eatWhile( /\w/ ); // Consume alphanumeric and underscore characters.
    content = stream.current( ); // Store the text of the token.

    // Check for fully qualified paths (e.g., `module::item`).
    if ( stream.match( /^::\w/ ) ) {
      stream.backUp( 1 ); // Back up to include the last char of the current token.
      return r( "prefix", "variable-2" ); // Treat as a prefix in a path.
    }

    // Check if the current token is a keyword in the current context.
    if ( state.keywords.propertyIsEnumerable( content ) ) {
      return r( state.keywords[ content ], "keyword" ); // Apply keyword style.
    }

    return r( "name", "variable" ); // Otherwise, it's a regular variable/identifier name.
  }

  /**
   * Tokenizer for string literals. Remains in this mode until a closing quote is found.
   * Handles escape sequences.
   * @param {CodeMirror.Stream} stream The CodeMirror stream object.
   * @param {object} state The current parser state.
   * @returns {string} The CSS class for string tokens.
   */
  function tokenString( stream, state ) {
    var ch
      , escaped = false
    ;

    while ( ch = stream.next( ) ) {
      if ( ch == '"' && !escaped ) {
        state.tokenize = tokenBase; // String ended, revert to base tokenizer.
        return r( "atom", "string" );
      }
      // If `ch` is a backslash and not already escaped, set `escaped` to true.
      // Otherwise, set `escaped` to false.
      escaped = !escaped && ch == "\\";
    }

    // This is a "hack" to ensure the parser doesn't get confused if a string
    // is split across lines or if the file ends before a string is closed.
    // It temporarily treats it as an operator.
    return r( "op", "string" );
  }

  /**
   * Factory function that creates a tokenizer for block comments (/* ... *\/).
   * It handles nested block comments by maintaining a `depth` counter.
   * @param {number} depth The current nesting level of block comments.
   * @returns {function(CodeMirror.Stream, object): string} The comment tokenizer function.
   */
  function tokenComment( depth ) {
    return function( stream, state ) {
      var lastCh = null
        , ch
      ;

      while ( ch = stream.next( ) ) {
        if ( ch == "/" && lastCh == "*" ) { // End of a block comment segment: `*/`
          if ( depth == 1 ) {
            state.tokenize = tokenBase; // Outermost comment ended, revert to base.
            break; // Exit the loop.
          } else {
            state.tokenize = tokenComment( depth - 1 ); // Decrement depth for nested comments.
            return state.tokenize( stream, state ); // Recurse with new depth.
          }
        }
        if ( ch == "*" && lastCh == "/" ) { // Start of a nested block comment segment: `/*`
          state.tokenize = tokenComment( depth + 1 ); // Increment depth for nested comments.
          return state.tokenize( stream, state ); // Recurse with new depth.
        }
        lastCh = ch; // Store the current character for the next iteration.
      }

      return "comment"; // Always return "comment" style while in comment mode.
    };
  }


  // --- Parser Combinator Functions --------------------------------------------

  // The global context object `cx` is used by parser combinators
  // to access the current state, stream, and to communicate results.
  var cx = {
      state: null // Current CodeMirror state.
    , stream: null // Current CodeMirror stream.
    , marked: null // Style to apply, if overridden by parser.
    , cc: null // Combinator continuation stack.
  };

  /**
   * Schedules a sequence of combinators to be executed.
   * Pushes the arguments onto the continuation stack in reverse order.
   */
  function pass( ) {
    for ( var i = arguments.length - 1; i >= 0; i-- ) {
      cx.cc.push( arguments[ i ] );
    }
  }

  /**
   * A convenience function that calls `pass` and then returns `true`.
   * This signals that the current combinator has successfully processed its token
   * and scheduled further parsing steps.
   * @returns {boolean} Always true.
   */
  function cont( ) {
    pass.apply( null, arguments ); // Apply all arguments to `pass`.
    return true; // Indicate successful continuation.
  }

  /**
   * Creates a lexical environment object and pushes it onto the state's lexical stack.
   * This is crucial for correct indentation and context management.
   * @param {string} type The type of lexical context (e.g., "{", "(", "stat").
   * @param {any} info Additional context-specific information.
   * @returns {function(): void} A function that, when executed, pushes the lexical state.
   */
  function pushlex( type, info ) {
    var result = function( ) {
      var state = cx.state;
      state.lexical = {
          indented: state.indented // Indentation level before this lexical block.
        , column: cx.stream.column( ) // Column where this lexical block started.
        , type: type // Type of the block (e.g., "}", ")").
        , prev: state.lexical // Previous lexical environment.
        , info: info // Extra information.
      };
    };
    result.lex = true; // Mark this function as a lexical operation.
    return result;
  }

  /**
   * Pops the current lexical environment from the state's lexical stack.
   * Restores the previous indentation context.
   */
  function poplex( ) {
    var state = cx.state;
    if ( state.lexical.prev ) { // Ensure there is a previous lexical state.
      // If closing a parenthesis, restore the indentation to the level
      // before the opening parenthesis, for better alignment.
      if ( state.lexical.type == ")" ) {
        state.indented = state.lexical.indented;
      }
      state.lexical = state.lexical.prev; // Revert to the previous lexical state.
    }
  }

  /**
   * Switches the parser's active keyword set to `typeKeywords`.
   * Used when parsing type annotations.
   */
  function typecx( ) {
    cx.state.keywords = typeKeywords;
  }

  /**
   * Switches the parser's active keyword set to `valKeywords`.
   * Used when parsing value expressions and statements.
   */
  function valcx( ) {
    cx.state.keywords = valKeywords;
  }

  // Mark these functions as lexical operations. This ensures they are
  // executed immediately when encountered in the combinator stack,
  // rather than waiting for the next token.
  poplex.lex = typecx.lex = valcx.lex = true;

  /**
   * Creates a combinator for parsing comma-separated lists of elements.
   * @param {function(string): boolean} comb The combinator function for a single element in the list.
   * @param {string} end The token type that marks the end of the list (e.g., "]").
   * @returns {function(string): boolean} A combinator for the entire comma-separated list.
   */
  function commasep( comb, end ) {
    // Inner function to handle subsequent elements after the first.
    function more( type ) {
      if ( type == "," ) {
        return cont( comb, more ); // If comma, expect another element and then `more`.
      }
      if ( type == end ) {
        return cont( ); // If end token, the list is complete.
      }
      return cont( more ); // Otherwise, keep looking for elements or the end.
    }

    return function( type ) {
      if ( type == end ) {
        return cont( ); // Handle empty list (e.g., `[]`).
      }
      return pass( comb, more ); // Expect an element, then `more`.
    };
  }

  /**
   * Parses a block of statements or expressions. This is a central combinator
   * that dispatches to specific parsing functions based on the initial token type.
   * @param {string} type The current token's category.
   * @returns {boolean} True if the token is handled and parsing continues.
   */
  function block( type ) {
    if ( type == "}" ) {
      return cont( ); // End of a code block.
    }
    if ( type == "let" ) {
      return cont( pushlex( "stat", "let" ), letdef, poplex, block ); // `let` statement.
    }
    if ( type == "fn" ) {
      return cont( pushlex( "stat" ), fndef, poplex, block ); // Function definition.
    }
    if ( type == "type" ) {
      return cont( pushlex( "stat" ), tydef, endstatement, poplex, block ); // Type alias definition.
    }
    if ( type == "tag" ) {
      return cont( pushlex( "stat" ), tagdef, poplex, block ); // Enum/ADT definition.
    }
    if ( type == "mod" ) {
      return cont( pushlex( "stat" ), mod, poplex, block ); // Module definition.
    }
    if ( type == "open-attr" ) {
      // Attribute list, e.g., `#[attribute(arg)]`.
      return cont( pushlex( "]" ), commasep( expression, "]" ), poplex );
    }
    if ( type == "ignore" ) {
      return cont( block ); // Ignore token (e.g., `native`, `unsafe`) and continue block parsing.
    }
    // Default case: treat as a general expression followed by a statement end.
    return pass( pushlex( "stat" ), expression, poplex, endstatement, block );
  }

  /**
   * Checks for the end of a statement, typically a semicolon.
   * @param {string} type The current token's category.
   * @returns {boolean} True if the statement ends here.
   */
  function endstatement( type ) {
    if ( type == ";" ) {
      return cont( ); // Semicolon explicitly ends the statement.
    }
    return pass( ); // Implicit end of statement (e.g., last expression in a block).
  }

  /**
   * Parses an expression. This is a complex combinator that handles various
   * types of expressions in Rust, including atoms, blocks, function calls,
   * control flow, and macros.
   * @param {string} type The current token's category.
   * @returns {boolean} True if a part of an expression is handled.
   */
  function expression( type ) {
    if ( type == "atom" || type == "name" ) {
      return cont( maybeop ); // Atomic values or names can be followed by operators.
    }
    if ( type == "{" ) {
      return cont( pushlex( "}" ), exprbrace, poplex ); // Block expressions.
    }
    if ( type.match( /[\[\(]/ ) ) {
      return matchBrackets( type, expression ); // Parenthesized or bracketed expressions.
    }
    if ( type.match( /[\]\)\};,]/ ) ) {
      return pass( ); // Closing punctuation or separators end the expression context.
    }
    if ( type == "if-style" ) {
      return cont( expression, expression ); // `if`/`while` followed by condition and body.
    }
    if ( type == "else-style" || type == "op" ) {
      return cont( expression ); // `else`/`do` or an operator followed by an expression.
    }
    if ( type == "for" ) {
      return cont( pattern, maybetype, inop, expression, expression ); // `for` loop structure.
    }
    if ( type == "alt" ) {
      return cont( expression, altbody ); // `alt` (match) expression.
    }
    if ( type == "fn" ) {
      return cont( fndef ); // Function definition as an expression (e.g., closures).
    }
    if ( type == "macro" ) {
      return cont( macro ); // Macro invocation.
    }
    return cont( ); // Default: continue parsing.
  }

  /**
   * Checks for an optional operator or related construct following an expression.
   * Handles member access, generic type arguments, and function calls.
   * @param {string} type The current token's category.
   * @returns {boolean} True if an operator or related construct is handled.
   */
  function maybeop( type ) {
    if ( content == "." ) {
      return cont( maybeprop ); // Member access (e.g., `obj.field`).
    }
    if ( content == "::<" ) {
      return cont( typarams, maybeop ); // Path with generic type arguments (e.g., `Vec::<T>::new()`).
    }
    if ( type == "op" || content == ":" ) {
      return cont( expression ); // Binary operator or type annotation.
    }
    if ( type == "(" || type == "[" ) {
      return matchBrackets( type, expression ); // Function call or array indexing.
    }
    return pass( ); // No operator, continue.
  }

  /**
   * Parses a potential property access (e.g., `object.property`).
   * @param {string} type The current token's category.
   * @returns {boolean} True if a property name is handled.
   */
  function maybeprop( type ) {
    if ( content.match( /^\w+$/ ) ) {
      cx.marked = "variable"; // Mark the property name as a variable.
      return cont( maybeop ); // Property access can be chained with other operators.
    }
    return pass( expression ); // Not a property, continue with general expression parsing.
  }

  /**
   * Parses the content within curly braces (`{ ... }`) for expressions.
   * This includes closures, record literals, and general code blocks.
   * @param {string} type The current token's category.
   * @returns {boolean} True if the brace content is handled.
   */
  function exprbrace( type ) {
    if ( type == "op" ) {
      if ( content == "|" ) {
        // Closure with explicit parameters (e.g., `|a, b| { ... }`).
        return cont( blockvars, poplex, pushlex( "}", "block" ), block );
      }
      if ( content == "||" ) {
        // Closure with no parameters (e.g., `|| { ... }`).
        return cont( poplex, pushlex( "}", "block" ), block );
      }
    }

    // Check for record literals (struct instantiation).
    // This heuristic checks for "mutable" or an identifier followed by a colon,
    // ensuring it's not a fully qualified path.
    if ( content == "mutable" || ( content.match( /^\w+$/ ) && cx.stream.peek( ) == ":"
                                 && !cx.stream.match( "::", false ) ) ) {
      return pass( recliteral );
    }

    return pass( block ); // Otherwise, it's a generic code block.
  }

  /**
   * Parses a record literal (struct instantiation syntax: `MyStruct { field: value, ... }`).
   * @param {string} type The current token's category.
   * @returns {boolean} True if a part of the record literal is handled.
   */
  function recliteral( type ) {
    if ( content == "mutable" || content == "with" ) {
      cx.marked = "keyword"; // Keywords like `mutable` or `with` in record syntax.
      return cont( recliteral );
    }
    if ( content.match( /^\w*$/ ) ) {
      cx.marked = "variable"; // Field names are marked as variables.
      return cont( recliteral );
    }
    if ( type == ":" ) {
      return cont( expression, recliteral ); // Field name followed by colon and expression.
    }
    if ( type == "}" ) {
      return cont( ); // End of record literal.
    }
    return cont( recliteral ); // Continue parsing fields.
  }

  /**
   * Parses the variable names within a closure's parameter list (e.g., `|a, b|`).
   * @param {string} type The current token's category.
   * @returns {boolean} True if a variable is handled.
   */
  function blockvars( type ) {
    if ( type == "name" ) {
      cx.marked = "def"; // Mark variable names as definitions.
      return cont( blockvars );
    }
    if ( type == "op" && content == "|" ) {
      return cont( ); // Closing pipe `|` marks the end of parameters.
    }
    return cont( blockvars ); // Continue parsing variables.
  }

  /**
   * Parses a `let` statement (`let x: Type = value;`).
   * @param {string} type The current token's category.
   * @returns {boolean} True if a part of the `let` statement is handled.
   */
  function letdef( type ) {
    if ( type == ";" ) {
      return cont( ); // End of statement.
    }
    if ( content == "=" ) {
      return cont( expression, letdef ); // Assignment part.
    }
    if ( type == "," ) {
      return cont( letdef ); // Multiple declarations in one `let`.
    }
    return pass( pattern, maybetype, letdef ); // Pattern, optional type, then more.
  }

  /**
   * Parses an optional type annotation (`: Type`).
   * @param {string} type The current token's category.
   * @returns {boolean} True if a type annotation is handled.
   */
  function maybetype( type ) {
    if ( type == ":" ) {
      // Switch to type context, parse the type, then switch back to value context.
      return cont( typecx, rtype, valcx );
    }
    return pass( ); // No type annotation.
  }

  /**
   * Parses the `in` keyword in a `for` loop (`for pattern in expression`).
   * @param {string} type The current token's category.
   * @returns {boolean} True if `in` is handled.
   */
  function inop( type ) {
    if ( type == "name" && content == "in" ) {
      cx.marked = "keyword";
      return cont( );
    }
    return pass( ); // Not the `in` keyword.
  }

  /**
   * Parses a function definition (`fn name<T>(args) -> RetType { body }`).
   * @param {string} type The current token's category.
   * @returns {boolean} True if a part of the function definition is handled.
   */
  function fndef( type ) {
    if ( type == "name" ) {
      cx.marked = "def"; // Mark function name as a definition.
      return cont( fndef );
    }
    if ( content == "<" ) {
      return cont( typarams, fndef ); // Generic type parameters.
    }
    if ( type == "{" ) {
      return pass( expression ); // Function body, which is an expression.
    }
    if ( type == "(" ) {
      // Function parameters list.
      return cont( pushlex( ")" ), commasep( argdef, ")" ), poplex, fndef );
    }
    if ( type == "->" ) {
      // Return type annotation.
      return cont( typecx, rtype, valcx, fndef );
    }
    return cont( fndef ); // Continue parsing function parts.
  }

  /**
   * Parses a type alias definition (`type MyAlias = SomeType;`).
   * @param {string} type The current token's category.
   * @returns {boolean} True if a part of the type definition is handled.
   */
  function tydef( type ) {
    if ( type == "name" ) {
      cx.marked = "def"; // Mark type alias name as a definition.
      return cont( tydef );
    }
    if ( content == "<" ) {
      return cont( typarams, tydef ); // Generic type parameters.
    }
    if ( content == "=" ) {
      return cont( typecx, rtype, valcx ); // Assignment to the actual type.
    }
    return cont( tydef ); // Continue parsing type definition parts.
  }

  /**
   * Parses a tag (enum or algebraic data type) definition (`tag MyEnum { Variant1, Variant2(Type) }`).
   * @param {string} type The current token's category.
   * @returns {boolean} True if a part of the tag definition is handled.
   */
  function tagdef( type ) {
    if ( type == "name" ) {
      cx.marked = "def"; // Mark tag name as a definition.
      return cont( tagdef );
    }
    if ( content == "<" ) {
      return cont( typarams, tagdef ); // Generic type parameters.
    }
    if ( content == "=" ) {
      return cont( typecx, rtype, valcx, endstatement ); // Assignment (for type-like tags).
    }
    if ( type == "{" ) {
      // Enclosed block for enum variants.
      return cont( pushlex( "}" ), typecx, tagblock, valcx, poplex );
    }
    return cont( tagdef ); // Continue parsing tag definition parts.
  }

  /**
   * Parses the body of a tag/enum definition, which consists of its variants.
   * @param {string} type The current token's category.
   * @returns {boolean} True if a part of the tag block is handled.
   */
  function tagblock( type ) {
    if ( type == "}" ) {
      return cont( ); // End of the tag block.
    }
    if ( type == "(" ) {
      // Tuple-like variant (e.g., `Variant(Type1, Type2)`).
      return cont( pushlex( ")" ), commasep( rtype, ")" ), poplex, tagblock );
    }
    if ( content.match( /^\w+$/ ) ) {
      cx.marked = "def"; // Mark variant names as definitions.
    }
    return cont( tagblock ); // Continue parsing variants.
  }

  /**
   * Parses a module definition (`mod my_module { ... }`).
   * @param {string} type The current token's category.
   * @returns {boolean} True if a part of the module definition is handled.
   */
  function mod( type ) {
    if ( type == "name" ) {
      cx.marked = "def"; // Mark module name as a definition.
      return cont( mod );
    }
    if ( type == "{" ) {
      return cont( pushlex( "}" ), block, poplex ); // Module body.
    }
    return pass( ); // Module can also be declared without a block (e.g., `mod my_module;`).
  }

  /**
   * Parses generic type parameters (e.g., `<T, U>`).
   * @param {string} type The current token's category.
   * @returns {boolean} True if a part of the type parameters is handled.
   */
  function typarams( type ) {
    if ( content == ">" ) {
      return cont( ); // End of type parameters.
    }
    if ( content == "," ) {
      return cont( typarams ); // Comma separator.
    }
    return pass( rtype, typarams ); // Parse a type, then look for more parameters.
  }

  /**
   * Parses an argument definition in a function signature (`name: Type`).
   * @param {string} type The current token's category.
   * @returns {boolean} True if a part of the argument definition is handled.
   */
  function argdef( type ) {
    if ( type == "name" ) {
      cx.marked = "def"; // Mark argument name as a definition.
      return cont( argdef );
    }
    if ( type == ":" ) {
      // Optional type annotation.
      return cont( typecx, rtype, valcx );
    }
    return pass( ); // End of argument definition.
  }

  /**
   * Parses a Rust type. This is a recursive combinator for complex type structures.
   * @param {string} type The current token's category.
   * @returns {boolean} True if a part of the type is handled.
   */
  function rtype( type ) {
    if ( type == "name" ) {
      cx.marked = "variable-3"; // Mark type names as specific variables.
      return cont( rtypemaybeparam ); // May have generic parameters.
    }
    if ( content == "mutable" ) {
      cx.marked = "keyword"; // `mutable` keyword in type context.
      return cont( rtype );
    }
    if ( type == "atom" ) {
      return cont( rtypemaybeparam ); // Primitive types.
    }
    if ( type == "op" || type == "obj" ) {
      return cont( rtype ); // Pointers, references, object types.
    }
    if ( type == "fn" ) {
      return cont( fntype ); // Function pointer/closure type.
    }
    return matchBrackets( type, rtype ); // Bracketed types (e.g., `[T]`, `(T, U)`).
  }

  /**
   * Checks for optional generic parameters after a type name.
   * @param {string} type The current token's category.
   * @returns {boolean} True if generic parameters are handled.
   */
  function rtypemaybeparam( type ) {
    if ( content == "<" ) {
      return cont( typarams ); // Generic parameters.
    }
    return pass( ); // No generic parameters.
  }

  /**
   * Parses a function type signature (e.g., `fn(A, B) -> C`).
   * @param {string} type The current token's category.
   * @returns {boolean} True if a part of the function type is handled.
   */
  function fntype( type ) {
    if ( type == "(" ) {
      // Function parameters in type signature.
      return cont( pushlex( "(" ), commasep( rtype, ")" ), poplex, fntype );
    }
    if ( type == "->" ) {
      return cont( rtype ); // Return type.
    }
    return pass( ); // End of function type signature.
  }

  /**
   * Parses a pattern (used in `let`, `for`, `match` statements).
   * Patterns can be complex, including names, literals, operators, and structured bindings.
   * @param {string} type The current token's category.
   * @returns {boolean} True if a part of the pattern is handled.
   */
  function pattern( type ) {
    if ( type == "name" ) {
      cx.marked = "def"; // Mark pattern variable as a definition.
      return cont( patternmaybeop );
    }
    if ( type == "atom" ) {
      return cont( patternmaybeop ); // Literal pattern.
    }
    if ( type == "op" ) {
      return cont( pattern ); // Operator within a pattern (e.g., `&mut x`).
    }
    return matchBrackets( type, pattern ); // Tuple or slice pattern.
  }

  /**
   * Checks for optional operators or keywords after a pattern element.
   * @param {string} type The current token's category.
   * @returns {boolean} True if an operator or keyword is handled.
   */
  function patternmaybeop( type ) {
    if ( type == "op" && content == "." ) {
      return cont( ); // Range operator in pattern (e.g., `0..10`).
    }
    if ( content == "to" ) {
      cx.marked = "keyword"; // `to` keyword in pattern.
      return cont( pattern );
    }
    else {
      return pass( ); // No operator.
    }
  }

  /**
   * Parses the body of an `alt` (match) expression.
   * @param {string} type The current token's category.
   * @returns {boolean} True if the `alt` body is handled.
   */
  function altbody( type ) {
    if ( type == "{" ) {
      // Match arms block.
      return cont( pushlex( "}", "alt" ), altblock, poplex );
    }
    return pass( ); // No `alt` body.
  }

  /**
   * Parses the individual arms within an `alt` (match) block.
   * @param {string} type The current token's category.
   * @returns {boolean} True if a part of an `alt` arm is handled.
   */
  function altblock( type ) {
    if ( type == "}" ) {
      return cont( ); // End of match block.
    }
    if ( type == "|" ) {
      return cont( altblock ); // Separator between match arms.
    }
    if ( content == "when" ) {
      cx.marked = "keyword"; // `when` guard for a match arm.
      return cont( expression, altblock );
    }
    if ( type == "{" ) {
      // Block expression for a match arm.
      return cont( pushlex( "}", "alt" ), block, poplex, altblock );
    }
    return pass( pattern, altblock ); // Pattern for a match arm.
  }

  /**
   * Parses a macro invocation.
   * @param {string} type The current token's category.
   * @returns {boolean} True if the macro invocation is handled.
   */
  function macro( type ) {
    if ( type.match( /[\[\(\{]/ ) ) {
      // Macro arguments can be enclosed in square brackets, parentheses, or curly braces.
      return matchBrackets( type, expression );
    }
    return pass( ); // No arguments, or malformed macro.
  }

  /**
   * A generic combinator to match and parse content within brackets, parentheses, or braces.
   * @param {string} type The token type of the opening bracket (e.g., "[", "(", "{").
   * @param {function(string): boolean} comb The combinator for the content inside the brackets.
   * @returns {boolean} True if the bracketed expression is handled.
   */
  function matchBrackets( type, comb ) {
    if ( type == "[" ) {
      return cont( pushlex( "]" ), commasep( comb, "]" ), poplex );
    }
    if ( type == "(" ) {
      return cont( pushlex( ")" ), commasep( comb, ")" ), poplex );
    }
    if ( type == "{" ) {
      return cont( pushlex( "}" ), commasep( comb, "}" ), poplex );
    }
    return cont( ); // Should not be reached if called with valid bracket type.
  }

  /**
   * The core parser loop. It repeatedly applies combinators from the
   * continuation stack (`cx.cc`) until a combinator successfully processes
   * the current token.
   * @param {object} state The current parser state.
   * @param {CodeMirror.Stream} stream The CodeMirror stream object.
   * @param {string} style The CSS style determined by the tokenizer.
   * @returns {string|null} The final CSS style for the token, potentially overridden by `cx.marked`.
   */
  function parse( state, stream, style ) {
    var cc = state.cc; // Get the combinator stack.

    // Update the global context object with current state.
    cx.state = state;
    cx.stream = stream;
    cx.marked = null; // Reset marked style for this token.
    cx.cc = cc;

    // Loop until a combinator successfully processes the token.
    while ( true ) {
      // Pop the next combinator from the stack, or use `block` as the default
      // if the stack is empty (top-level statement).
      var combinator = cc.length ? cc.pop( ) : block;

      if ( combinator( tcat ) ) { // If the combinator handles the token successfully...
        // Execute any pending lexical operations immediately.
        while ( cc.length && cc[ cc.length - 1 ].lex ) {
          cc.pop( )( );
        }
        return cx.marked || style; // Return the style, preferring `cx.marked`.
      }
    }
  }


  // --- CodeMirror Mode Interface ----------------------------------------------

  return {

    /**
     * `startState` function is called by CodeMirror to get the initial parser state.
     * @returns {object} The initial state object.
     */
    startState: function( ) {
      return {
          tokenize  : tokenBase // Start with the base tokenizer.
        , cc        : [ ] // Empty combinator stack.
        , lexical   : { // Initial lexical environment for indentation.
              indented: -indentUnit
            , column: 0
            , type: "top"
            , align: false
          }
        , keywords  : valKeywords // Start in value context.
        , indented  : 0 // Current indentation level.
      };
    }

    /**
     * `token` function is the main entry point for CodeMirror's tokenizing loop.
     * It consumes a token from the stream and returns its style.
     * @param {CodeMirror.Stream} stream The CodeMirror stream object.
     * @param {object} state The current parser state.
     * @returns {string|null} The CSS class for the token, or null for no styling.
     */
    , token: function( stream, state ) {
      // If at the start of a line, update indentation information.
      if ( stream.sol( ) ) {
        if ( !state.lexical.hasOwnProperty( "align" ) ) {
          state.lexical.align = false;
        }
        state.indented = stream.indentation( );
      }

      // Skip leading whitespace.
      if ( stream.eatSpace( ) ) {
        return null;
      }

      tcat = content = null; // Reset global scratch variables for the new token.

      // Get the raw style from the current tokenizer.
      var style = state.tokenize( stream, state );

      // Comments are processed by the tokenizer but don't affect the parser state.
      if ( style == "comment" ) {
        return style;
      }

      // If lexical alignment hasn't been set, set it to true after the first non-whitespace token.
      if ( !state.lexical.hasOwnProperty( "align" ) ) {
        state.lexical.align = true;
      }

      // Special handling for "prefix" tokens; they don't go through the parser combinators.
      if ( tcat == "prefix" ) {
        return style;
      }

      // If `content` was not explicitly set by the tokenizer, grab the token text.
      if ( !content ) {
        content = stream.current( );
      }

      // Pass the token to the parser combinator system.
      return parse( state, stream, style );
    }

    /**
     * `indent` function is used by CodeMirror to calculate the indentation level for a new line.
     * @param {object} state The current parser state.
     * @param {string} textAfter The text on the next line, after leading whitespace.
     * @returns {number} The desired indentation level in spaces.
     */
    , indent: function( state, textAfter ) {
      // If not in the base tokenizing mode (e.g., inside a string or comment),
      // do not apply special indentation rules.
      if ( state.tokenize != tokenBase ) {
        return 0;
      }

      var firstChar = textAfter && textAfter.charAt( 0 ) // First non-whitespace character of the next line.
        , lexical = state.lexical // Current lexical environment.
        , type = lexical.type // Type of the current lexical block.
        , closing = firstChar == type // True if the next char is a closing bracket matching `type`.
      ;

      // Indentation for statements.
      if ( type == "stat" ) {
        return lexical.indented + indentUnit;
      }

      // If alignment is active, align to the column of the opening bracket/keyword.
      if ( lexical.align ) {
        return lexical.column + ( closing ? 0 : 1 );
      }

      // Default indentation: based on the previous indentation plus unit,
      // adjusted for closing brackets or specific block types like "alt".
      return lexical.indented + ( closing ? 0 : ( lexical.info == "alt" ? altIndentUnit : indentUnit ) );
    }

    // Characters that, when typed, cause CodeMirror to re-indent the current line.
    , electricChars: "{}"

  }; // End of CodeMirror mode definition.

} ); // End of CodeMirror.defineMode call.


// Associate the "rust" mode with its official MIME type.
CodeMirror.defineMIME( "text/x-rustsrc", "rust" );

// This concludes the Type I clone of the CodeMirror Rust mode.
// All functional aspects are identical to the original; only formatting
// and comments have been extensively modified.