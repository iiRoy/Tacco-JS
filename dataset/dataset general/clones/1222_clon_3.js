CM.registerSyntaxHighlighting("rust_lang", function() {
  // Configuration parameters for indentation and token categorization.
  const baseIndentationStep = 4; // Standard indentation amount.
  const alternativeIndentationStep = 2; // Special indentation for 'match_arm' blocks.
  const defaultTokenStyle = null; // Default style for tokens without specific styling.

  // A comprehensive map of value-related keywords and their associated categories.
  // This helps the parser assign appropriate styles and manage context.
  const keywordMapping = {
    "if": "conditional_start", "while": "conditional_start", "else": "conditional_end",
    "do": "conditional_end", "return": "flow_control", "panic": "flow_control",
    "break": "atomic_statement", "continue": "atomic_statement", "constant": "variable_declaration", "resource": "function_declaration",
    "let": "variable_declaration", "function": "function_declaration", "loop": "loop_statement", "match": "match_statement",
    "object": "function_declaration", "closure": "function_declaration", "type": "type_definition", "enum": "enum_definition",
    "module": "module_scope", "as": "operator_keyword", "true": "boolean_literal", "false": "boolean_literal",
    "assert": "operator_keyword", "verify": "operator_keyword", "claim": "operator_keyword", "external": "ignore_token",
    "unsafe": "ignore_token", "use": "conditional_end", "export": "conditional_end", "clone": "operator_keyword",
    "print": "operator_keyword", "debug_log": "operator_keyword"
  };

  // Dynamically constructed map for type-related identifiers.
  // Includes primitive types and structural keywords.
  const typeIdentifierMap = (() => {
    const typeRegistry = { "function": "function_declaration", "block": "function_declaration", "object": "object_type" };
    const primitiveTypes = "boolean unsigned_int signed_int i8_t i16_t i32_t i64_t u8_t u16_t u32_t u64_t float32 float64 string character".split(" ");
    for (let currentIdx = 0; currentIdx < primitiveTypes.length; ++currentIdx) {
      typeRegistry[primitiveTypes[currentIdx]] = "primitive_type";
    }
    return typeRegistry;
  })();

  // Regular expression to identify common operator characters.
  const operatorPattern = /[+\-*/&%=<>!?|\.@#^~]/;

  // --- Tokenization Engine ---

  // Scratchpad variables for communicating token information without
  // creating new objects repeatedly.
  let tokenCategory, tokenContent;

  /**
   * Helper function to set token information.
   * @param {string} category The category of the token (e.g., "op", "name").
   * @param {string|null} style The CSS style class for the token.
   * @returns {string|null} The provided style.
   */
  function createTokenInfo(category, style) {
    tokenCategory = category;
    return style;
  }

  /**
   * Core tokenizer routine: processes the input stream character by character
   * to identify the basic type and content of tokens.
   * @param {object} inputFlow The CodeMirror stream object.
   * @param {object} parsingState The current parser state.
   * @returns {string|null} The CSS style class for the token.
   */
  function mainTokenizerRoutine(inputFlow, parsingState) {
    if (inputFlow.eol()) return null; // Guard clause for end of line.
    const currentChar = inputFlow.next(); // Get the next character from the stream.

    switch (currentChar) {
      case '"': // Handle string literals.
        parsingState.tokenizerState = stringTokenizer;
        return parsingState.tokenizerState(inputFlow, parsingState);
      case "'": // Handle character literals.
        tokenCategory = "primitive_type"; // Categorize as atom for char literals.
        if (inputFlow.eat("\\")) { // Check for escaped character.
          if (inputFlow.skipTo("'")) { // Skip until the closing quote.
            inputFlow.next(); // Consume the closing quote.
            return "literal_string";
          } else {
            return "error_token"; // Unclosed character literal with escape.
          }
        } else {
          inputFlow.next(); // Consume the character itself.
          return inputFlow.eat("'") ? "literal_string" : "error_token"; // Check for closing quote.
        }
      case '/': // Handle comments.
        if (inputFlow.eat('/')) { // Single-line comment.
          inputFlow.skipToEnd();
          return "comment_line";
        }
        if (inputFlow.eat('*')) { // Block comment.
          parsingState.tokenizerState = commentBlockTokenizer(1); // Start nested comment tracking.
          return parsingState.tokenizerState(inputFlow, parsingState);
        }
        break; // Fall through if not a comment start.
      case '#': // Handle attributes/macros.
        if (inputFlow.eat('[')) {
          tokenCategory = "open_attribute";
          return defaultTokenStyle;
        }
        inputFlow.eatWhile(/\w/); // Consume macro identifier.
        return createTokenInfo("macro_identifier", "metadata_style");
      case ':': // Handle specific Rust operators like `::<`.
        if (inputFlow.match("::<")) {
          return createTokenInfo("operator_symbol", defaultTokenStyle);
        }
        break; // Fall through if not `::<`.
    }

    // Helper for digit check.
    const isDigitChar = (c) => /\d/.test(c);

    // Handle numeric literals (integers, floats, various bases).
    if (isDigitChar(currentChar) || (currentChar === '.' && inputFlow.eat(isDigitChar))) {
      let isFloatingPoint = false;
      // Handle hex (0x...), binary (0b...)
      if (!inputFlow.match(/^x[\da-f]+/i) && !inputFlow.match(/^b[01]+/)) {
        inputFlow.eatWhile(isDigitChar);
        if (inputFlow.eat('.')) { // Decimal point indicates a float.
          isFloatingPoint = true;
          inputFlow.eatWhile(isDigitChar);
        }
        if (inputFlow.match(/^e[+\-]?\d+/i)) { // Exponent indicates a float.
          isFloatingPoint = true;
        }
      }
      // Suffixes for floats (f32, f64) or integers (u8, i32, etc.)
      if (isFloatingPoint) inputFlow.match(/^f(?:32|64)/);
      else inputFlow.match(/^[ui](?:8|16|32|64)/);
      return createTokenInfo("numeric_literal", "number_value");
    }

    // Handle structural characters.
    if (currentChar.match(/[()\[\]{}:;,]/)) return createTokenInfo(currentChar, defaultTokenStyle);

    // Handle "arrow" operator.
    if (currentChar === '-' && inputFlow.eat('>')) return createTokenInfo("arrow_operator", defaultTokenStyle);

    // Handle general operators.
    if (currentChar.match(operatorPattern)) {
      inputFlow.eatWhile(operatorPattern);
      return createTokenInfo("operator_symbol", defaultTokenStyle);
    }

    // Handle identifiers (keywords, variables, types, etc.).
    inputFlow.eatWhile(/\w/);
    tokenContent = inputFlow.current();

    // Check for path separators like `::` which might indicate a prefix.
    if (inputFlow.match(/^::\w/)) {
      inputFlow.backUp(1); // Back up to the start of `::`.
      return createTokenInfo("path_prefix", "variable_declaration_2");
    }

    // Look up in current keyword map.
    if (parsingState.keywordDictionary.hasOwnProperty(tokenContent)) {
      return createTokenInfo(parsingState.keywordDictionary[tokenContent], "keyword_style");
    }

    // Default to a generic name token.
    return createTokenInfo("identifier_name", "variable_identifier");
  }

  /**
   * Tokenizes string literals.
   * @param {object} inputFlow The CodeMirror stream object.
   * @param {object} parsingState The current parser state.
   * @returns {string|null} The CSS style class for the token.
   */
  function stringTokenizer(inputFlow, parsingState) {
    let charRead, isEscaped = false;
    while ((charRead = inputFlow.next()) !== null) { // Loop until end of stream or string close.
      if (charRead === '"' && !isEscaped) {
        parsingState.tokenizerState = mainTokenizerRoutine; // Restore base tokenizer.
        return createTokenInfo("numeric_literal", "literal_string");
      }
      isEscaped = (charRead === '\\' && !isEscaped); // Toggle escape state.
    }
    // If we reach here, the string was not properly closed.
    // console.warn("Unclosed string literal detected."); // Non-essential debug/validation.
    return createTokenInfo("operator_symbol", "literal_string"); // Still return string style, but it's an error.
  }

  /**
   * Tokenizes block comments, handling nesting.
   * @param {number} currentDepth The current nesting level of block comments.
   * @returns {Function} A tokenizer function for block comments.
   */
  function commentBlockTokenizer(currentDepth) {
    return function(inputFlow, parsingState) {
      let lastChar = null, scannedChar;
      while ((scannedChar = inputFlow.next()) !== null) {
        if (scannedChar === '*' && lastChar === '/') { // End of a nested comment or main comment.
          currentDepth--;
          if (currentDepth === 0) {
            parsingState.tokenizerState = mainTokenizerRoutine;
            break; // Exit the loop and return.
          }
        } else if (scannedChar === '/' && lastChar === '*') { // Start of a nested comment.
          currentDepth++;
        }
        lastChar = scannedChar; // Update last character for next iteration.
      }
      return "comment_block";
    };
  }

  // --- Parser Core Utilities ---

  // Context object shared across all parser combinators for efficiency.
  const parserContext = {
    state: null,      // Current parser state.
    stream: null,     // Input stream.
    markedToken: null, // Style to apply to the current token.
    combinatorStack: null // Stack of combinator functions.
  };

  /**
   * Pushes multiple combinator functions onto the stack.
   * @param {...Function} combinators Functions to push.
   */
  function pushCombinators(...combinators) {
    for (let i = combinators.length - 1; i >= 0; i--) {
      parserContext.combinatorStack.push(combinators[i]);
    }
  }

  /**
   * Signals that parsing should continue with the next combinator.
   * @param {...Function} combinators Additional combinators to push before continuing.
   * @returns {boolean} Always true, indicating successful continuation.
   */
  function continueParsing(...combinators) {
    pushCombinators(...combinators);
    return true;
  }

  /**
   * Enters a new lexical scope, updating indentation and context.
   * @param {string} scopeType The type of the new scope (e.g., "{", "[", "statement").
   * @param {any} scopeInfo Additional information about the scope.
   * @returns {Function} A function that performs the scope entry.
   */
  function enterLexicalScope(scopeType, scopeInfo) {
    const scopeEntryFn = function() {
      const currentState = parserContext.state;
      currentState.lexicalScope = {
        indentationLevel: currentState.currentIndentation,
        columnPosition: parserContext.stream.column(),
        scopeType: scopeType,
        previousScope: currentState.lexicalScope,
        scopeDetails: scopeInfo
      };
    };
    scopeEntryFn.isLexicalOp = true; // Mark as a lexical operation.
    return scopeEntryFn;
  }

  /**
   * Exits the current lexical scope, restoring the previous one.
   * @returns {Function} A function that performs the scope exit.
   */
  function exitLexicalScope() {
    const scopeExitFn = function() {
      const currentState = parserContext.state;
      if (currentState.lexicalScope && currentState.lexicalScope.previousScope) {
        // Special handling for closing parentheses to revert indentation.
        if (currentState.lexicalScope.scopeType === ")") {
          currentState.currentIndentation = currentState.lexicalScope.indentationLevel;
        }
        currentState.lexicalScope = currentState.lexicalScope.previousScope;
      } else {
          // Guard for trying to pop the root scope, should not happen in normal flow.
          // console.warn("Attempted to pop root lexical scope or null scope.");
      }
    };
    scopeExitFn.isLexicalOp = true;
    return scopeExitFn;
  }

  /**
   * Switches the parser's keyword dictionary to type-related keywords.
   * @returns {Function} A function to set type context.
   */
  function setTypeContext() {
    const setTypeFn = function() { parserContext.state.keywordDictionary = typeIdentifierMap; };
    setTypeFn.isLexicalOp = true;
    return setTypeFn;
  }

  /**
   * Switches the parser's keyword dictionary to value-related keywords.
   * @returns {Function} A function to set value context.
   */
  function setValueContext() {
    const setValueFn = function() { parserContext.state.keywordDictionary = keywordMapping; };
    setValueFn.isLexicalOp = true;
    return setValueFn;
  }

  // Mark these functions for special handling in the parser loop.
  exitLexicalScope.isLexicalOp = setTypeContext.isLexicalOp = setValueContext.isLexicalOp = true;

  /**
   * Handles parsing of comma-separated lists of elements.
   * @param {Function} elementParser The combinator function for parsing individual elements.
   * @param {string} closingDelimiter The token type that marks the end of the list.
   * @returns {Function} A combinator function for the comma-separated list.
   */
  function handleCommaSeparated(elementParser, closingDelimiter) {
    function parseMore(tokenType) {
      if (tokenType === ",") return continueParsing(elementParser, parseMore);
      if (tokenType === closingDelimiter) return continueParsing();
      // If an unexpected token, try to skip and continue.
      // This is a simple error recovery mechanism.
      return continueParsing(parseMore);
    }
    return function(tokenType) {
      if (tokenType === closingDelimiter) return continueParsing();
      return pushCombinators(elementParser, parseMore);
    };
  }

  // --- Parser Combinator Definitions ---

  /**
   * Parses a general code block, handling various statements within it.
   * @param {string} tokenType The type of the current token.
   * @returns {boolean} True if parsing continues, false otherwise.
   */
  function processCodeBlock(tokenType) {
    if (tokenType === "}") return continueParsing(); // End of block.

    // Handle different statement types. Order matters for precedence.
    if (tokenType === "variable_declaration") return continueParsing(enterLexicalScope("statement", "let_decl"), letStatementDefinition, exitLexicalScope, processCodeBlock);
    if (tokenType === "function_declaration") return continueParsing(enterLexicalScope("statement"), functionDefinition, exitLexicalScope, processCodeBlock);
    if (tokenType === "type_definition") return continueParsing(enterLexicalScope("statement"), typeDefinition, finalizeStatement, exitLexicalScope, processCodeBlock);
    if (tokenType === "enum_definition") return continueParsing(enterLexicalScope("statement"), tagDeclaration, exitLexicalScope, processCodeBlock);
    if (tokenType === "module_scope") return continueParsing(enterLexicalScope("statement"), moduleDefinition, exitLexicalScope, processCodeBlock);
    if (tokenType === "open_attribute") return continueParsing(enterLexicalScope("]"), handleCommaSeparated(parseExpression, "]"), exitLexicalScope);
    if (tokenType === "ignore_token") return continueParsing(processCodeBlock); // Skip ignored tokens.

    // Default: treat as an expression followed by a statement.
    return pushCombinators(enterLexicalScope("statement"), parseExpression, exitLexicalScope, finalizeStatement, processCodeBlock);
  }

  /**
   * Finalizes a statement, typically by consuming a semicolon.
   * @param {string} tokenType The type of the current token.
   * @returns {boolean} True if parsing continues, false otherwise.
   */
  function finalizeStatement(tokenType) {
    if (tokenType === ";") return continueParsing();
    // If no semicolon, assume it's optional or implied (e.g., in blocks).
    return pushCombinators();
  }

  /**
   * Parses a general expression.
   * @param {string} tokenType The type of the current token.
   * @returns {boolean} True if parsing continues, false otherwise.
   */
  function parseExpression(tokenType) {
    // Handle basic literals and identifiers.
    if (tokenType === "numeric_literal" || tokenType === "identifier_name" || tokenType === "primitive_type" || tokenType === "boolean_literal") {
      return continueParsing(maybeOperator);
    }
    // Handle block expressions.
    if (tokenType === "{") return continueParsing(enterLexicalScope("}", "block"), processBraceExpression, exitLexicalScope);
    // Handle parenthesized/bracketed expressions.
    if (tokenType.match(/[\[\(]/)) return matchParenthesized(tokenType, parseExpression);
    // If it's a closing bracket/brace/parenthesis or a comma/semicolon, it signals end of current expression.
    if (tokenType.match(/[\]\)\};,]/)) return pushCombinators();
    // Handle control flow keywords.
    if (tokenType === "conditional_start") return continueParsing(parseExpression, parseExpression); // e.g., if (cond) { ... }
    if (tokenType === "conditional_end" || tokenType === "operator_symbol" || tokenType === "flow_control") return continueParsing(parseExpression);
    if (tokenType === "loop_statement") return continueParsing(parsePattern, optionalTypeAnnotation, inOperatorCheck, parseExpression, parseExpression);
    if (tokenType === "match_statement") return continueParsing(parseExpression, alternativeBody);
    if (tokenType === "function_declaration") return continueParsing(functionDefinition);
    if (tokenType === "macro_identifier") return continueParsing(handleMacroCall);

    // If none matched, simply continue (may be an empty expression or error recovery).
    return continueParsing();
  }

  /**
   * Checks for optional operators following an expression.
   * @param {string} tokenType The type of the current token.
   * @returns {boolean} True if parsing continues, false otherwise.
   */
  function maybeOperator(tokenType) {
    if (tokenContent === ".") return continueParsing(maybePropertyAccess);
    if (tokenContent === "::<") return continueParsing(typeParameters, maybeOperator);
    if (tokenType === "operator_symbol" || tokenContent === ":") return continueParsing(parseExpression);
    if (tokenType === "(" || tokenType === "[") return matchParenthesized(tokenType, parseExpression);
    return pushCombinators(); // No operator, so pass.
  }

  /**
   * Checks for property access after a dot operator.
   * @param {string} tokenType The type of the current token.
   * @returns {boolean} True if parsing continues, false otherwise.
   */
  function maybePropertyAccess(tokenType) {
    if (tokenContent && tokenContent.match(/^\w+$/)) {
      parserContext.markedToken = "variable_property";
      return continueParsing(maybeOperator);
    }
    return pushCombinators(parseExpression); // Not a property, perhaps another expression.
  }

  /**
   * Processes expressions within curly braces, including closures and record literals.
   * @param {string} tokenType The type of the current token.
   * @returns {boolean} True if parsing continues, false otherwise.
   */
  function processBraceExpression(tokenType) {
    // Check for closure syntax.
    if (tokenType === "operator_symbol") {
      if (tokenContent === "|") return continueParsing(blockVariableDeclaration, exitLexicalScope, enterLexicalScope("}", "block"), processCodeBlock);
      if (tokenContent === "||") return continueParsing(exitLexicalScope, enterLexicalScope("}", "block"), processCodeBlock);
    }

    // Check for record literal or struct initialization.
    const isRecordFieldStart = (tokenContent === "mutable" || (tokenContent && tokenContent.match(/^\w+$/) && parserContext.stream.peek() === ":" && !parserContext.stream.match("::", false)));
    if (isRecordFieldStart) {
      return pushCombinators(recordLiteralParsing);
    }

    return pushCombinators(processCodeBlock); // Default to a standard code block.
  }

  /**
   * Parses a record/struct literal.
   * @param {string} tokenType The type of the current token.
   * @returns {boolean} True if parsing continues, false otherwise.
   */
  function recordLiteralParsing(tokenType) {
    if (tokenContent === "mutable" || tokenContent === "with") {
      parserContext.markedToken = "keyword_style";
      return continueParsing(recordLiteralParsing);
    }
    if (tokenContent && tokenContent.match(/^\w*$/)) {
      parserContext.markedToken = "variable_field";
      return continueParsing(recordLiteralParsing);
    }
    if (tokenType === ":") return continueParsing(parseExpression, recordLiteralParsing);
    if (tokenType === "}") return continueParsing(); // End of record literal.
    return continueParsing(recordLiteralParsing); // Continue parsing fields.
  }

  /**
   * Parses block variable declarations (e.g., `|a, b|`).
   * @param {string} tokenType The type of the current token.
   * @returns {boolean} True if parsing continues, false otherwise.
   */
  function blockVariableDeclaration(tokenType) {
    if (tokenType === "identifier_name") {
      parserContext.markedToken = "definition_name";
      return continueParsing(blockVariableDeclaration);
    }
    if (tokenType === "operator_symbol" && tokenContent === "|") return continueParsing(); // End of block var list.
    return continueParsing(blockVariableDeclaration);
  }

  /**
   * Parses a `let` statement definition.
   * @param {string} tokenType The type of the current token.
   * @returns {boolean} True if parsing continues, false otherwise.
   */
  function letStatementDefinition(tokenType) {
    if (tokenType === ";") return continueParsing(); // Statement ends.
    if (tokenContent === "=") return continueParsing(parseExpression, letStatementDefinition);
    if (tokenType === ",") return continueParsing(letStatementDefinition);
    return pushCombinators(parsePattern, optionalTypeAnnotation, letStatementDefinition);
  }

  /**
   * Parses an optional type annotation (e.g., `: Type`).
   * @param {string} tokenType The type of the current token.
   * @returns {boolean} True if parsing continues, false otherwise.
   */
  function optionalTypeAnnotation(tokenType) {
    if (tokenType === ":") return continueParsing(setTypeContext, resolveType, setValueContext);
    return pushCombinators(); // No type annotation.
  }

  /**
   * Checks for the `in` operator in loop statements.
   * @param {string} tokenType The type of the current token.
   * @returns {boolean} True if parsing continues, false otherwise.
   */
  function inOperatorCheck(tokenType) {
    if (tokenType === "identifier_name" && tokenContent === "in") {
      parserContext.markedToken = "keyword_style";
      return continueParsing();
    }
    return pushCombinators(); // No 'in' operator.
  }

  /**
   * Parses a function definition.
   * @param {string} tokenType The type of the current token.
   * @returns {boolean} True if parsing continues, false otherwise.
   */
  function functionDefinition(tokenType) {
    if (tokenType === "identifier_name") {
      parserContext.markedToken = "definition_name";
      return continueParsing(functionDefinition);
    }
    if (tokenContent === "<") return continueParsing(typeParameters, functionDefinition);
    if (tokenType === "{") return pushCombinators(parseExpression); // Function body is an expression.
    if (tokenType === "(") return continueParsing(enterLexicalScope(")"), handleCommaSeparated(argumentDefinition, ")"), exitLexicalScope, functionDefinition);
    if (tokenType === "arrow_operator") return continueParsing(setTypeContext, resolveType, setValueContext, functionDefinition);
    return continueParsing(functionDefinition); // Continue parsing function parts.
  }

  /**
   * Parses a type definition.
   * @param {string} tokenType The type of the current token.
   * @returns {boolean} True if parsing continues, false otherwise.
   */
  function typeDefinition(tokenType) {
    if (tokenType === "identifier_name") {
      parserContext.markedToken = "definition_name";
      return continueParsing(typeDefinition);
    }
    if (tokenContent === "<") return continueParsing(typeParameters, typeDefinition);
    if (tokenContent === "=") return continueParsing(setTypeContext, resolveType, setValueContext);
    return continueParsing(typeDefinition);
  }

  /**
   * Parses an enum (tag) declaration.
   * @param {string} tokenType The type of the current token.
   * @returns {boolean} True if parsing continues, false otherwise.
   */
  function tagDeclaration(tokenType) {
    if (tokenType === "identifier_name") {
      parserContext.markedToken = "definition_name";
      return continueParsing(tagDeclaration);
    }
    if (tokenContent === "<") return continueParsing(typeParameters, tagDeclaration);
    if (tokenContent === "=") return continueParsing(setTypeContext, resolveType, setValueContext, finalizeStatement);
    if (tokenType === "{") return continueParsing(enterLexicalScope("}"), setTypeContext, tagBlockContent, setValueContext, exitLexicalScope);
    return continueParsing(tagDeclaration);
  }

  /**
   * Parses the content of an enum (tag) block.
   * @param {string} tokenType The type of the current token.
   * @returns {boolean} True if parsing continues, false otherwise.
   */
  function tagBlockContent(tokenType) {
    if (tokenType === "}") return continueParsing(); // End of enum block.
    if (tokenType === "(") return continueParsing(enterLexicalScope(")"), handleCommaSeparated(resolveType, ")"), exitLexicalScope, tagBlockContent);
    if (tokenContent && tokenContent.match(/^\w+$/)) parserContext.markedToken = "enum_variant_name";
    return continueParsing(tagBlockContent);
  }

  /**
   * Parses a module definition.
   * @param {string} tokenType The type of the current token.
   * @returns {boolean} True if parsing continues, false otherwise.
   */
  function moduleDefinition(tokenType) {
    if (tokenType === "identifier_name") {
      parserContext.markedToken = "definition_name";
      return continueParsing(moduleDefinition);
    }
    if (tokenType === "{") return continueParsing(enterLexicalScope("}"), processCodeBlock, exitLexicalScope);
    return pushCombinators(); // Assume module definition ends here if no block.
  }

  /**
   * Parses type parameters (e.g., `<T, U>`).
   * @param {string} tokenType The type of the current token.
   * @returns {boolean} True if parsing continues, false otherwise.
   */
  function typeParameters(tokenType) {
    if (tokenContent === ">") return continueParsing();
    if (tokenContent === ",") return continueParsing(typeParameters);
    return pushCombinators(resolveType, typeParameters);
  }

  /**
   * Parses an argument definition in a function signature.
   * @param {string} tokenType The type of the current token.
   * @returns {boolean} True if parsing continues, false otherwise.
   */
  function argumentDefinition(tokenType) {
    if (tokenType === "identifier_name") {
      parserContext.markedToken = "definition_name";
      return continueParsing(argumentDefinition);
    }
    if (tokenType === ":") return continueParsing(setTypeContext, resolveType, setValueContext);
    return pushCombinators(); // Argument definition ends.
  }

  /**
   * Resolves and styles a type.
   * @param {string} tokenType The type of the current token.
   * @returns {boolean} True if parsing continues, false otherwise.
   */
  function resolveType(tokenType) {
    if (tokenType === "identifier_name") {
      parserContext.markedToken = "type_identifier_3";
      return continueParsing(resolveTypeWithOptionalParam);
    }
    if (tokenContent === "mutable") {
      parserContext.markedToken = "keyword_style";
      return continueParsing(resolveType);
    }
    if (tokenType === "primitive_type") return continueParsing(resolveTypeWithOptionalParam);
    if (tokenType === "operator_symbol" || tokenType === "object_type") return continueParsing(resolveType);
    if (tokenType === "function_declaration") return continueParsing(functionTypeSignature);

    // If it's a bracket, match it as part of a complex type.
    if (tokenType.match(/[\[\(]/)) return matchParenthesized(tokenType, resolveType);

    // Default: try to continue, perhaps it's an unrecognized type part.
    return continueParsing();
  }

  /**
   * Handles optional type parameters after a type identifier.
   * @param {string} tokenType The type of the current token.
   * @returns {boolean} True if parsing continues, false otherwise.
   */
  function resolveTypeWithOptionalParam(tokenType) {
    if (tokenContent === "<") return continueParsing(typeParameters);
    return pushCombinators();
  }

  /**
   * Parses a function type signature.
   * @param {string} tokenType The type of the current token.
   * @returns {boolean} True if parsing continues, false otherwise.
   */
  function functionTypeSignature(tokenType) {
    if (tokenType === "(") return continueParsing(enterLexicalScope("("), handleCommaSeparated(resolveType, ")"), exitLexicalScope, functionTypeSignature);
    if (tokenType === "arrow_operator") return continueParsing(resolveType);
    return pushCombinators();
  }

  /**
   * Parses a pattern (e.g., in `let` statements, `for` loops, `match` arms).
   * @param {string} tokenType The type of the current token.
   * @returns {boolean} True if parsing continues, false otherwise.
   */
  function parsePattern(tokenType) {
    if (tokenType === "identifier_name") {
      parserContext.markedToken = "definition_name";
      return continueParsing(patternMaybeOperator);
    }
    if (tokenType === "primitive_type" || tokenType === "numeric_literal" || tokenType === "boolean_literal") return continueParsing(patternMaybeOperator);
    if (tokenType === "operator_symbol") return continueParsing(parsePattern);
    return matchParenthesized(tokenType, parsePattern); // Handle tuple/struct patterns.
  }

  /**
   * Handles optional operators after a pattern element.
   * @param {string} tokenType The type of the current token.
   * @returns {boolean} True if parsing continues, false otherwise.
   */
  function patternMaybeOperator(tokenType) {
    if (tokenType === "operator_symbol" && tokenContent === ".") return continueParsing(); // Field access in pattern.
    if (tokenContent === "to") {
      parserContext.markedToken = "keyword_style";
      return continueParsing(parsePattern);
    }
    return pushCombinators();
  }

  /**
   * Parses the body of a `match` expression.
   * @param {string} tokenType The type of the current token.
   * @returns {boolean} True if parsing continues, false otherwise.
   */
  function alternativeBody(tokenType) {
    if (tokenType === "{") return continueParsing(enterLexicalScope("}", "match_arm"), alternativeBlockContent, exitLexicalScope);
    return pushCombinators();
  }

  /**
   * Parses the content within a `match` block.
   * @param {string} tokenType The type of the current token.
   * @returns {boolean} True if parsing continues, false otherwise.
   */
  function alternativeBlockContent(tokenType) {
    if (tokenType === "}") return continueParsing(); // End of match block.
    if (tokenType === "|") return continueParsing(alternativeBlockContent); // Separator for match arms.
    if (tokenContent === "when") {
      parserContext.markedToken = "keyword_style";
      return continueParsing(parseExpression, alternativeBlockContent); // Guard clause.
    }
    if (tokenType === "{") return continueParsing(enterLexicalScope("}", "match_arm_block"), processCodeBlock, exitLexicalScope, alternativeBlockContent);
    return pushCombinators(parsePattern, alternativeBlockContent); // Match arm pattern.
  }

  /**
   * Handles macro calls.
   * @param {string} tokenType The type of the current token.
   * @returns {boolean} True if parsing continues, false otherwise.
   */
  function handleMacroCall(tokenType) {
    if (tokenType.match(/[\[\(\{]/)) return matchParenthesized(tokenType, parseExpression);
    return pushCombinators();
  }

  /**
   * Generic function to match opening and closing brackets/parentheses/braces.
   * @param {string} openingType The type of the opening bracket.
   * @param {Function} contentParser The combinator function for the content inside.
   * @returns {boolean} True if parsing continues, false otherwise.
   */
  function matchParenthesized(openingType, contentParser) {
    let closingType;
    if (openingType === "[") closingType = "]";
    else if (openingType === "(") closingType = ")";
    else if (openingType === "{") closingType = "}";
    else return pushCombinators(); // Unrecognized opening type.

    return continueParsing(enterLexicalScope(closingType), handleCommaSeparated(contentParser, closingType), exitLexicalScope);
  }

  /**
   * Executes the parser logic using the combinator stack.
   * @param {object} parsingState The current parser state.
   * @param {object} inputFlow The CodeMirror stream object.
   * @param {string|null} initialStyle The style determined by the tokenizer.
   * @returns {string|null} The final style for the current token.
   */
  function executeParser(parsingState, inputFlow, initialStyle) {
    // Populate parserContext for the current token.
    parserContext.state = parsingState;
    parserContext.stream = inputFlow;
    parserContext.markedToken = null;
    parserContext.combinatorStack = parsingState.combinatorStack;

    // Process combinators until the stack is empty or a combinator returns true.
    while (parserContext.combinatorStack.length > 0) {
      const currentCombinator = parserContext.combinatorStack.pop();
      if (currentCombinator(tokenCategory)) {
        // If a combinator returns true, it means it handled the token and pushed
        // subsequent combinators. Now, process any lexical operations immediately.
        while(parserContext.combinatorStack.length > 0 && parserContext.combinatorStack[parserContext.combinatorStack.length - 1].isLexicalOp) {
          parserContext.combinatorStack.pop()(); // Execute lexical operation.
        }
        return parserContext.markedToken || initialStyle;
      }
    }
    // If no combinator handles the token, default to the initial style.
    return parserContext.markedToken || initialStyle;
  }

  // --- CodeMirror Mode Interface ---

  return {
    /**
     * Initializes the parser state for a new file or mode instance.
     * @returns {object} The initial parser state.
     */
    initializeParserState: function() {
      return {
        tokenizerState: mainTokenizerRoutine, // Start with the main tokenizer.
        combinatorStack: [], // Parser combinator stack.
        lexicalScope: {
          indentationLevel: -baseIndentationStep, // Initial indentation.
          columnPosition: 0,
          scopeType: "root_scope",
          previousScope: null,
          scopeDetails: null
        },
        keywordDictionary: keywordMapping, // Start with value keywords.
        currentIndentation: 0, // Current line's indentation.
        isAligned: false // Flag for alignment.
      };
    },

    /**
     * Processes a single token from the input stream.
     * This is the main entry point for CodeMirror's tokenization.
     * @param {object} inputFlow The CodeMirror stream object.
     * @param {object} parsingState The current parser state.
     * @returns {string|null} The CSS style class for the token.
     */
    processToken: function(inputFlow, parsingState) {
      // const startTime = performance.now(); // Non-essential debug fragment.

      if (inputFlow.sol()) { // Start of line.
        // Reset alignment for new lines if not explicitly set.
        if (!parsingState.lexicalScope.hasOwnProperty("isAligned")) {
          parsingState.lexicalScope.isAligned = false;
        }
        parsingState.currentIndentation = inputFlow.indentation();
      }

      // Skip whitespace.
      if (inputFlow.eatSpace()) return null;

      tokenCategory = null; // Clear scratchpad variables.
      tokenContent = null;

      const styleFromTokenizer = parsingState.tokenizerState(inputFlow, parsingState);

      // Early exit for comments, as they don't affect parser state in this mode.
      if (styleFromTokenizer && styleFromTokenizer.startsWith("comment_")) return styleFromTokenizer;

      // Ensure alignment is set after non-whitespace token.
      if (!parsingState.lexicalScope.hasOwnProperty("isAligned")) {
        parsingState.lexicalScope.isAligned = true;
      }

      // Handle path prefixes directly.
      if (tokenCategory === "path_prefix") return styleFromTokenizer;

      // If tokenContent was not set by the tokenizer, grab it from the stream.
      if (tokenContent === null) tokenContent = inputFlow.current();

      // Execute the parser combinator logic.
      const finalStyle = executeParser(parsingState, inputFlow, styleFromTokenizer);

      // const endTime = performance.now();
      // console.log(`Token processing time: ${endTime - startTime} ms`); // Non-essential debug fragment.

      return finalStyle;
    },

    /**
     * Calculates the indentation level for the next line.
     * @param {object} parsingState The current parser state.
     * @param {string} textAfter The text following the cursor on the current line.
     * @returns {number} The calculated indentation level.
     */
    calculateIndentation: function(parsingState, textAfter) {
      // If not in the base tokenizer, indentation might be complex or irrelevant.
      if (parsingState.tokenizerState !== mainTokenizerRoutine) return 0;

      const firstCharNextLine = textAfter && textAfter.charAt(0);
      const currentLexical = parsingState.lexicalScope;
      const scopeType = currentLexical.scopeType;

      let isClosingScope = (firstCharNextLine === scopeType); // e.g., '}' matches scopeType '}'.

      // Adjust indentation based on scope type.
      if (scopeType === "statement") return currentLexical.indentationLevel + baseIndentationStep;
      if (currentLexical.isAligned) return currentLexical.columnPosition + (isClosingScope ? 0 : 1);

      // Special handling for alternative indentation.
      const effectiveIndent = currentLexical.indentationLevel +
                              (isClosingScope ? 0 : (currentLexical.scopeDetails === "match_arm" ? alternativeIndentationStep : baseIndentationStep));

      // Guard for negative indentation.
      return Math.max(0, effectiveIndent);
    },

    // Characters that trigger re-indentation when typed.
    triggerCharacters: "{}"
  };
});

CM.associateMimeType("text/x-rust-source", "rust_lang");