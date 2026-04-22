var patternProcessor = { version: '0.1.2' };

patternProcessor.createSyntaxAnalyzer = function (patternInput) {
  "use strict";
  let currentPosition = 0;
  const inputLength = patternInput.length;
  let parsedAbstractTree = []; // Renamed AST

  /**
   * Fetches the character at the current position and advances the cursor.
   * @returns {string} The character at the original currentPosition.
   */
  function advanceAndFetchChar() {
    if (currentPosition >= inputLength) {
      throw new Error(`Attempted to read past end of input at position ${currentPosition}.`);
    }
    return patternInput[currentPosition++];
  }

  /**
   * Checks if there are more characters to process in the input string.
   * @returns {boolean} True if more input is available, false otherwise.
   */
  function isMoreInputAvailable() {
    return currentPosition < inputLength;
  }

  /**
   * Moves the current position pointer forward by one character.
   */
  function incrementPosition() {
    if (currentPosition >= inputLength) {
      throw new Error(`Attempted to increment past end of input at position ${currentPosition}.`);
    }
    currentPosition++;
  }

  /**
   * Returns the character at the current position without advancing.
   * @returns {string|undefined} The character at currentPosition, or undefined if at end.
   */
  function getCurrentChar() {
    return patternInput[currentPosition];
  }

  /**
   * Skips over any whitespace characters from the current position.
   */
  function skipWhitespace() {
    while (getCurrentChar() === ' ') {
      incrementPosition();
    }
  }

  /**
   * Creates a boolean flag that toggles its state only once when called.
   * @param {boolean} initialValue - The initial value of the flag.
   * @returns {function(): boolean} A function that returns the current flag state and flips it on first call.
   */
  function createToggleFlag(initialValue) {
    let internalFlag = initialValue;
    let hasBeenCalled = false;
    return function() {
      if (!hasBeenCalled) {
        hasBeenCalled = true;
        return internalFlag;
      }
      internalFlag = !initialValue; // Flip only if it was the initial value
      return internalFlag;
    };
  }

  /**
   * Constructs a new node for the Abstract Syntax Tree.
   * @param {string} nodeKind - The type of the AST node (e.g., 'a', 'o', '.', ':').
   * @param {Array<object>} parentNodesList - The array where this new node should be pushed.
   * @returns {object} The newly created AST node.
   */
  function constructASTNode(nodeKind, parentNodesList) {
    const newNodeEntry = {
      kind: nodeKind, // Renamed 'type' to 'kind'
      children: [],   // Renamed 'nodes' to 'children'
      boundIdentifier: null, // Renamed 'binding' to 'boundIdentifier' and set default to null
      sourceIndex: currentPosition // Added source index for debugging
    };

    parentNodesList.push(newNodeEntry);
    return newNodeEntry;
  }

  /**
   * Determines if a character is valid for an identifier name.
   * @param {string} charToCheck - The character to validate.
   * @param {boolean} isFirstPosition - True if checking the first character of an identifier.
   * @returns {boolean} True if valid, false otherwise.
   */
  function isValidIdentifierChar(charToCheck, isFirstPosition) {
    const validFirst = /[a-zA-Z$_]/;
    const validSubsequent = /[0-9a-zA-Z$_]/;
    return isFirstPosition ? validFirst.test(charToCheck) : validSubsequent.test(charToCheck);
  }

  /**
   * Checks if a character is valid within a numeric literal.
   * @param {string} charToCheck - The character to validate.
   * @returns {boolean} True if valid, false otherwise.
   */
  function isValidNumericChar(charToCheck) {
    return /[0-9eE+\-.]/.test(charToCheck);
  }

  /**
   * Throws a parsing error with detailed information.
   * @param {string} expectedDescription - Description of what was expected.
   * @param {string|undefined} foundToken - The token that was found, or an empty string if EOF.
   */
  function throwParseError(expectedDescription, foundToken = getCurrentChar() || "''") {
    const errorMsg = `Syntax Error at position ${currentPosition}: Expected '${expectedDescription}' but encountered '${foundToken}'.`;
    throw new Error(errorMsg);
  }

  /**
   * Processes a binding declaration (e.g., '@myVar').
   * @param {object} targetNode - The AST node to which the binding will be attached.
   */
  function processBindingDeclaration(targetNode) {
    incrementPosition(); // Consume the '@' symbol
    const identifierChars = [];
    const firstCharFlag = createToggleFlag(true); // Tracks if it's the first character of the identifier

    while (isMoreInputAvailable() && isValidIdentifierChar(getCurrentChar(), firstCharFlag())) {
      identifierChars.push(advanceAndFetchChar());
    }

    if (identifierChars.length > 0) {
      targetNode.boundIdentifier = identifierChars.join('');
    } else {
      throw new Error(`Binding identifier missing at position ${currentPosition} for node type '${targetNode.kind}'.`);
    }
  }

  /**
   * Parses the content within parentheses for an array pattern, e.g., 'a(element1, element2)'.
   * @param {object} parentArrayNode - The AST node representing the array.
   */
  function processArrayStructure(parentArrayNode) {
    incrementPosition(); // Consume the opening '('

    // Special case for empty array pattern 'a()'
    if (getCurrentChar() === ')') {
      parentArrayNode.kind = 'empty_array'; // Renamed type for clarity
      return;
    }

    let isFirstElement = true;
    while (true) {
      if (getCurrentChar() === '|') { // Check for array rest operator
        break;
      }
      if (!isFirstElement) {
        if (getCurrentChar() !== ',') {
          break; // No comma, so this is the end of the element list
        }
        incrementPosition(); // Consume the comma
      }
      skipWhitespace();
      parseInitialSegment(parentArrayNode.children); // Recursively parse the element
      skipWhitespace();
      isFirstElement = false;
    }
  }

  /**
   * Handles parsing of array patterns, like 'a@myArr' or 'a(elem1, elem2)'.
   * @param {Array<object>} currentASTList - The list of nodes to which new nodes are added.
   */
  function handleArrayPattern(currentASTList) {
    const arrayNode = constructASTNode(advanceAndFetchChar(), currentASTList); // 'a'

    if (!isMoreInputAvailable()) {
      return; // Simple array 'a' without further specifiers
    }

    const nextChar = getCurrentChar();
    switch (nextChar) {
      case '@':
        processBindingDeclaration(arrayNode);
        return;
      case '(':
        processArrayStructure(arrayNode);
        break;
      default:
        // Allows for patterns like 'a(a)' for nested arrays without binding.
        return;
    }

    // Check for array rest operator '|' after elements
    if (getCurrentChar() === '|') {
      const restNode = constructASTNode(advanceAndFetchChar(), arrayNode.children); // '|'
      skipWhitespace();
      if (getCurrentChar() === '@') {
        processBindingDeclaration(restNode);
        skipWhitespace();
      }
    }

    if (getCurrentChar() !== ')') {
      throwParseError(')');
    }
    incrementPosition(); // Consume ')'

    // Optional binding for the entire array after its definition
    if (isMoreInputAvailable() && getCurrentChar() === '@') {
      processBindingDeclaration(arrayNode);
    }
  }

  /**
   * Parses a single property within an object pattern.
   * @param {object} parentObjectNode - The AST node representing the object.
   * @param {boolean} isPrototypeProperty - True if it's a prototype property (starts with ':').
   */
  function processObjectProperty(parentObjectNode, isPrototypeProperty) {
    incrementPosition(); // Consume '.' or ':'
    const propertyNameChars = [];
    const firstCharFlag = createToggleFlag(true);

    while (isMoreInputAvailable() && isValidIdentifierChar(getCurrentChar(), firstCharFlag())) {
      propertyNameChars.push(advanceAndFetchChar());
    }

    if (propertyNameChars.length === 0) {
      throw new Error(`Missing property name at position ${currentPosition} for object node type '${parentObjectNode.kind}'.`);
    }

    const propertyNode = constructASTNode(isPrototypeProperty ? 'prototype_prop' : 'own_prop', parentObjectNode.children);
    propertyNode.propertyName = propertyNameChars.join(''); // Renamed 'name' to 'propertyName'

    if (isMoreInputAvailable() && getCurrentChar() === ':') {
      incrementPosition(); // Consume ':'
      // Recursively parse the value pattern for this property
      parseInitialSegment(propertyNode.children);
    }

    if (isMoreInputAvailable() && getCurrentChar() === '@') {
      processBindingDeclaration(propertyNode);
    }
  }

  /**
   * Parses the property list within an object pattern, e.g., 'o(.prop1, :prop2)'.
   * @param {object} parentObjectNode - The AST node representing the object.
   */
  function processObjectProperties(parentObjectNode) {
    incrementPosition(); // Consume the opening '('

    let isFirstProperty = true;
    while (true) {
      skipWhitespace();
      const currentChar = getCurrentChar();
      if (currentChar === '.') {
        processObjectProperty(parentObjectNode, false); // Own property
      } else if (currentChar === ':') {
        processObjectProperty(parentObjectNode, true);  // Prototype property
      } else {
        if (!isFirstProperty && currentChar !== ')') { // If not the first and not closing paren, it's an error
          throwParseError('. or :', currentChar);
        }
        break; // End of properties or syntax error will be caught later
      }
      skipWhitespace();

      if (getCurrentChar() !== ',') {
        break;
      }
      incrementPosition(); // Consume ','
      isFirstProperty = false;
    }
  }

  /**
   * Handles parsing of object patterns, like 'o@myObj' or 'o(.prop1, :prop2)'.
   * @param {Array<object>} currentASTList - The list of nodes to which new nodes are added.
   */
  function handleObjectPattern(currentASTList) {
    const objectNode = constructASTNode(advanceAndFetchChar(), currentASTList); // 'o'

    if (!isMoreInputAvailable()) {
      return; // Simple object 'o' without further specifiers
    }

    const nextChar = getCurrentChar();
    switch (nextChar) {
      case '@':
        processBindingDeclaration(objectNode);
        return;
      case '(':
        processObjectProperties(objectNode);
        break;
      default:
        // Allows for patterns like 'a(o)' for nested objects without binding.
        return;
    }

    if (getCurrentChar() !== ')') {
      throwParseError(')');
    }
    incrementPosition(); // Consume ')'

    // Optional binding for the entire object after its definition
    if (isMoreInputAvailable() && getCurrentChar() === '@') {
      processBindingDeclaration(objectNode);
    }
  }

  /**
   * Parses a comma-separated list of literals within parentheses.
   * @param {Array<object>} parentNodeChildren - The children list of the parent node to add literals to.
   * @param {function(Array<object>): void} literalParseFunction - Function to parse individual literals.
   */
  function parseDelimitedLiterals(parentNodeChildren, literalParseFunction) {
    incrementPosition(); // Consume '('

    let isFirstLiteral = true;
    while (true) {
      skipWhitespace();
      if (!isFirstLiteral) {
        if (getCurrentChar() !== ',') {
          break; // No comma, so this is the end of the literal list
        }
        incrementPosition(); // Consume the comma
        skipWhitespace();
      }

      literalParseFunction(parentNodeChildren);
      isFirstLiteral = false;
    }
  }

  /**
   * Extracts a string literal enclosed in single or double quotes.
   * @returns {string} The extracted string value.
   */
  function extractQuotedString() {
    const stringChars = [];
    const enclosingQuote = advanceAndFetchChar(); // Consume and get the opening quote

    if (!(enclosingQuote === '"' || enclosingQuote === "'")) {
      throwParseError('string literal (enclosed in " or \')', enclosingQuote);
    }

    while (isMoreInputAvailable() && getCurrentChar() !== enclosingQuote) {
      stringChars.push(advanceAndFetchChar());
    }

    if (!isMoreInputAvailable()) {
      throw new Error(`Unclosed string literal starting at position ${currentPosition - stringChars.length - 1}.`);
    }

    incrementPosition(); // Consume the closing quote
    return stringChars.join('');
  }

  /**
   * Extracts a regular expression literal enclosed in forward slashes.
   * @returns {RegExp} The constructed RegExp object.
   */
  function extractRegexPattern() {
    const regexChars = [];
    incrementPosition(); // Consume the opening '/'

    while (isMoreInputAvailable() && getCurrentChar() !== '/') {
      regexChars.push(advanceAndFetchChar());
    }

    if (!isMoreInputAvailable()) {
      throw new Error(`Unclosed regex literal starting at position ${currentPosition - regexChars.length - 1}.`);
    }

    incrementPosition(); // Consume the closing '/'
    return new RegExp(regexChars.join(''));
  }

  /**
   * Parses a string or regex literal and adds it to the AST.
   * @param {Array<object>} parentChildren - The children list of the parent node.
   */
  function handleStringOrRegexLiteral(parentChildren) {
    if (getCurrentChar() === '/') {
      constructASTNode(extractRegexPattern(), constructASTNode('regex_match', parentChildren).children);
    } else {
      constructASTNode(extractQuotedString(), constructASTNode('value_match', parentChildren).children);
    }
  }

  /**
   * Parses a numeric literal (e.g., 1, 1.05, .05, 8e5).
   * @param {Array<object>} parentChildren - The children list of the parent node.
   */
  function handleNumericLiteral(parentChildren) {
    const numericChars = [];
    while (isMoreInputAvailable() && isValidNumericChar(getCurrentChar())) {
      numericChars.push(advanceAndFetchChar());
    }

    const numericValue = Number.parseFloat(numericChars.join(''));

    if (!Number.isNaN(numericValue) && Number.isFinite(numericValue)) {
      constructASTNode(numericValue, constructASTNode('value_match', parentChildren).children);
    } else {
      throwParseError('valid numeric value', numericChars.join('') || 'empty string');
    }
  }

  /**
   * Parses a boolean literal ('true' or 'false').
   * @param {Array<object>} parentChildren - The children list of the parent node.
   */
  function handleBooleanLiteral(parentChildren) {
    const booleanChars = [];
    const lowerCaseRegex = /[a-z]/;

    while (isMoreInputAvailable() && lowerCaseRegex.test(getCurrentChar())) {
      booleanChars.push(advanceAndFetchChar());
    }

    const literalString = booleanChars.join('');
    if (literalString === 'true') {
      constructASTNode(true, constructASTNode('value_match', parentChildren).children);
    } else if (literalString === 'false') {
      constructASTNode(false, constructASTNode('value_match', parentChildren).children);
    } else {
      throwParseError('boolean literal (true or false)', literalString || 'empty string');
    }
  }

  /**
   * Parses a date literal (string that can be parsed by `new Date()`).
   * @param {Array<object>} parentChildren - The children list of the parent node.
   */
  function handleDateLiteral(parentChildren) {
    const dateString = extractQuotedString();
    const parsedDate = new Date(dateString);

    if (Number.isNaN(parsedDate.getTime())) {
      throwParseError('valid date string', dateString);
    } else {
      constructASTNode(parsedDate, constructASTNode('date_match', parentChildren).children);
    }
  }

  /**
   * Matches generic types (n, s, b, f, d, r, _, S).
   * @param {Array<object>} currentASTList - The list of nodes to which new nodes are added.
   * @param {string} typeSpecifier - The character specifying the generic type.
   */
  function handleGenericTypePattern(currentASTList, typeSpecifier) {
    const genericNode = constructASTNode(advanceAndFetchChar(), currentASTList);

    if (getCurrentChar() === '(') {
      switch (typeSpecifier) {
        case "s":
          parseDelimitedLiterals(genericNode.children, handleStringOrRegexLiteral);
          break;
        case "n":
          parseDelimitedLiterals(genericNode.children, handleNumericLiteral);
          break;
        case "b":
          parseDelimitedLiterals(genericNode.children, handleBooleanLiteral);
          break;
        case "d":
          parseDelimitedLiterals(genericNode.children, handleDateLiteral);
          break;
        default:
          throw new Error(`Literal list not supported for type '${typeSpecifier}' at position ${currentPosition}.`);
      }
      genericNode.kind = 'or_match'; // Indicates a list of alternatives
      incrementPosition(); // Consume ')'
    }

    if (getCurrentChar() === '@') {
      processBindingDeclaration(genericNode);
    }
  }

  /**
   * Entry point for parsing a segment of the pattern.
   * @param {Array<object>} targetNodeList - The list to which parsed nodes will be added.
   * @returns {Array<object>} The updated targetNodeList.
   */
  function parseInitialSegment(targetNodeList) {
    if (!isMoreInputAvailable()) {
      return targetNodeList; // Nothing to parse
    }

    const char = getCurrentChar();
    if (char === 'a') {
      handleArrayPattern(targetNodeList);
    } else if (char === 'o') {
      handleObjectPattern(targetNodeList);
    } else if (/[nsSbfdr_]/.test(char)) {
      handleGenericTypePattern(targetNodeList, char);
    } else {
      throwParseError('one of (a, o, n, s, S, b, f, d, r, _)', char);
    }
    return targetNodeList;
  }

  return {
    /**
     * Initiates the parsing process for the provided pattern string.
     * @returns {Array<object>} The Abstract Syntax Tree (AST) representing the pattern.
     * @throws {Error} If the pattern is empty or contains syntax errors.
     */
    analyze: function () {
      if (!patternInput || patternInput.length === 0) {
        throw new Error("Cannot analyze an empty pattern string.");
      }

      parsedAbstractTree = parseInitialSegment([]);
      skipWhitespace(); // Clear any trailing whitespace

      if (currentPosition !== inputLength) {
        throw new Error(`Unexpected tokens remaining at end of input: '${patternInput.substring(currentPosition)}' starting at position ${currentPosition}.`);
      }
      return parsedAbstractTree;
    }
  };
};

patternProcessor.createMatcherGenerator = function (syntaxTreeStructure) {
  "use strict";
  const evaluationScope = {}; // Renamed bindingContext

  /**
   * Creates a new function by partially applying arguments to an existing function.
   * @param {function} originalFunction - The function to curry.
   * @param {Array<any>} initialArguments - Arguments to be pre-applied.
   * @returns {function(any): any} A new function that takes the remaining arguments.
   */
  function partiallyApply(originalFunction, initialArguments) {
    return function (dynamicArgument) {
      return originalFunction.apply(evaluationScope, [...initialArguments, dynamicArgument]);
    };
  }

  /**
   * Robustly checks the type of an object using Object.prototype.toString.
   * @param {any} obj - The object to check.
   * @param {string} expectedTypeString - The expected type string (e.g., '[object Array]').
   * @returns {boolean} True if the types match, false otherwise.
   */
  function checkType(obj, expectedTypeString) {
    return Object.prototype.toString.call(obj) === expectedTypeString;
  }

  /**
   * Acts as a predicate that also captures a matched value and stores it in the evaluation scope.
   * @param {string} identifierName - The name under which the value will be bound.
   * @param {function(any): object} predicateFunction - The actual matching predicate, returning a result object.
   * @param {any} valueToEvaluate - The value being tested and potentially bound.
   * @returns {object} The result object from the predicate, possibly augmented with binding info.
   * @throws {Error} If an attempt is made to bind the same identifier name multiple times.
   */
  function captureAndValidate(identifierName, predicateFunction, valueToEvaluate) {
    const matchResult = predicateFunction(valueToEvaluate);

    if (matchResult.outcome) { // Renamed 'result' to 'outcome'
      if (evaluationScope.hasOwnProperty(identifierName)) {
        throw new Error(`Binding identifier '${identifierName}' is already in use within this scope.`);
      }

      // Safely define property to prevent accidental overwrites or redefinitions
      Object.defineProperty(evaluationScope, identifierName, {
        value: matchResult.extractedValue !== undefined ? matchResult.extractedValue : matchResult.matchedItem, // Renamed 'param' to 'matchedItem', 'obj' to 'extractedValue'
        writable: true,
        enumerable: true,
        configurable: true
      });
    }

    // Add a property to the result for handling array rest bindings later
    matchResult.lastBoundIdentifier = identifierName;
    return matchResult;
  }

  /* --- Predicate Functions --- */

  /**
   * Matches any input value. Always returns true.
   * @param {any} inputData - The data to match.
   * @returns {object} A match result object.
   */
  function matchAny(inputData) {
    return {
      outcome: true,
      matchedItem: inputData
    };
  }
};