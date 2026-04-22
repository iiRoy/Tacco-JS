var patternProcessor = { version: '1.0.0' };

/**
 * createSyntaxAnalyzer
 * Establishes a new parser instance for a given input pattern string.
 * This parser's role is to convert the pattern into an Abstract Syntax Tree (AST),
 * which can then be used to generate a matching function.
 *
 * Example Usage:
 * var analyzedTree = createSyntaxAnalyzer('obj(.propA, .propB)').analyze();
 */

/*-------------------------------------------------------------------------*/
patternProcessor.createSyntaxAnalyzer = function (inputPattern) {
  "use strict";

  var currentPosition = 0; // Tracks the current index within the input pattern string.

  // Retrieves the character at the current position and then increments the position.
  function advanceAndRetrieve() { return inputPattern[currentPosition++]; }

  // Checks if there are more characters to process in the input.
  function hasMoreInput() { return currentPosition < inputPattern.length; }

  // Simply advances the current position without returning the character.
  function stepForward() { currentPosition++; }

  // Returns the character at the current position without advancing.
  function inspectCurrent() { return inputPattern[currentPosition]; }

  // Skips over any whitespace characters from the current position.
  function skipWhitespace() { while (inspectCurrent() === ' ') { stepForward(); } }

  // Creates a function that returns true only on its first invocation.
  function firstCallFlag(initialState) {
    var isFirst = !initialState;
    return function () { return isFirst === !initialState ? (isFirst = !isFirst) : !initialState; };
  }

  // Constructs a new AST node and adds it to the provided parent list.
  function constructElement(elementType, syntaxTree) {
    var newElement = {
      kind: elementType,
      children: [],
      boundName: false // Indicates if this element is bound to a variable.
    };

    syntaxTree.push(newElement);
    return newElement;
  }

  /**
   * Determines if a character is valid for use in a JavaScript identifier name.
   * Allows letters, numbers (not as the first character), $ and _.
   */
  function isValidIdentifierChar(character, isInitialChar) {
    return isInitialChar ? /[a-zA-Z$_]/.test(character) : /[0-9a-zA-Z$_]/.test(character);
  }

  // Checks if a character is valid for representing a numeric value.
  function isValidNumericChar(character) {
    return /[0-9eE\+\-\.]/.test(character);
  }

  // Generates an error for an unexpected token encounter during parsing.
  function raiseSyntaxError(expectedToken) {
    throw "Syntax error at index " + currentPosition
      + ": Expected '" + expectedToken + "' but encountered '"
      + (inspectCurrent() || "EOF") + "'.";
  }

  /**
   * Parses variable bindings denoted by '@'. These bindings link a pattern
   * segment to a variable name, making its matched value available in handlers.
   * E.g., 'N@count' matches a number and binds it to 'count'.
   */
  function processVariableBinding(currentElement) {
    stepForward(); // Consume the '@' symbol.
    var boundVariableName = [], isInitialChar = firstCallFlag(true);

    while (hasMoreInput()) {
      if (isValidIdentifierChar(inspectCurrent(), isInitialChar())) {
        boundVariableName[boundVariableName.length] = advanceAndRetrieve();
      } else {
        break;
      }
    }

    if (boundVariableName.length > 0) {
      currentElement.boundName = boundVariableName.join('');
    } else {
      throw "Missing binding identifier at " + currentPosition + " for element of kind: " + currentElement.kind;
    }
  }

  // Parses the inner content of an array pattern, enclosed in parentheses.
  function processArrayContents(currentElement) {
    stepForward(); // Consume the opening '(' bracket.

    // Handle empty array pattern: A() matches an empty array.
    if (inspectCurrent() === ')') {
      currentElement.kind = 'emptyArray';
      return;
    }

    while (true) {
      // The entire array might be matched by 'A(|)' or simply 'A'.
      if (inspectCurrent() === '|') { break; }
      /**
       * Use skipWhitespace() to permit spaces at certain locations:
       * (N,N@val), (N, N@val), ( N , N@val ) are all valid.
       * (N, N @val) is not valid: variable bindings cannot have whitespace.
       */
      skipWhitespace();
      initialParseStage(currentElement.children);
      skipWhitespace();
      if (inspectCurrent() !== ',') {
        break;
      }
      stepForward(); // Consume the ',' separator.
    }
  }

  // Parses an array pattern, starting with 'A'.
  function processArrayPattern(syntaxTree) {
    var remainingElements, currentElement = constructElement(advanceAndRetrieve(), syntaxTree);

    if (hasMoreInput()) {
      /**
       * An array pattern can be specified by:
       * A@name: Array bound to a variable 'name'.
       * A(...): Array with specific element patterns.
       */
      switch (inspectCurrent()) {
        case '@':
          processVariableBinding(currentElement);
          return;
        case '(':
          processArrayContents(currentElement);
          break;
        default:
          /**
           * Allows patterns like A(A) to match nested arrays without
           * requiring explicit binding names.
           */
          return;
      }

      // Check for an array remainder pattern, e.g., A(..., |)
      if (inspectCurrent() === '|') {
        remainingElements = constructElement(advanceAndRetrieve(), currentElement.children);
        skipWhitespace();

        // Check if the array remainder is bound to a name, e.g., A(..., |@rest)
        if (inspectCurrent() === '@') {
          processVariableBinding(remainingElements);
          skipWhitespace();
        }
      }

      // Ensure the closing parenthesis is present for A(...) patterns.
      if (inspectCurrent() !== ')') {
        raiseSyntaxError(')');
      } else {
        stepForward(); // Consume the ')' bracket.
        // The entire array pattern might be bound to a name, e.g., A(...)@total
        if (hasMoreInput() && inspectCurrent() === '@') {
          processVariableBinding(currentElement);
        }
      }
    }
  }

  /**
   * Parses a single object property definition. Valid property names can include
   * alphanumeric characters, underscores, and dollar signs.
   */
  function processObjectProperty(currentElement, isPrototypeProperty) {
    stepForward(); // Consume the '.' or ':' symbol.
    var propertyName = [], propertyEntry, isInitialChar = firstCallFlag(true);

    while (hasMoreInput() && isValidIdentifierChar(inspectCurrent(), isInitialChar())) {
      propertyName[propertyName.length] = advanceAndRetrieve();
    }

    if (propertyName.length > 0) {
      propertyEntry = constructElement(isPrototypeProperty ? 'inhProp' : 'ownProp', currentElement.children);
      propertyEntry.name = propertyName.join('');

      /**
       * Properties can have type specifiers for matching nested objects.
       * E.g., 'O(.coordinate:O(.x, .y))' matches objects like
       *  '{coordinate: {x: 5, y: 7} }'
       */
      if (hasMoreInput() && inspectCurrent() === ':') {
        stepForward(); // Consume the ':' symbol.
        initialParseStage(propertyEntry.children);
      }

      // The value of this property might be bound to a name.
      if (hasMoreInput() && inspectCurrent() === '@') {
        processVariableBinding(propertyEntry);
      }
    } else {
      throw "Missing property name at " + currentPosition + " for element of kind: " + currentElement.kind;
    }
  }

  // Parses the list of properties within an object pattern.
  function processObjectProperties(currentElement) {
    stepForward(); // Consume the opening '(' bracket.

    while (true) {
      skipWhitespace();
      /**
       * Object properties must always begin with '.' (own) or ':' (inherited).
       * O(.x, :y) matches an object having an own property 'x' and
       * an own or inherited property 'y'.
       */
      if (inspectCurrent() === '.') {
        processObjectProperty(currentElement, false); // Own property
      } else if (inspectCurrent() === ':') {
        processObjectProperty(currentElement, true);  // Prototype property
      } else {
        raiseSyntaxError('a property indicator (. or :)');
      }
      skipWhitespace();

      if (inspectCurrent() !== ',') {
        break;
      }
      stepForward(); // Consume the ',' separator.
    }
  }

  // Parses an object pattern, starting with 'O'.
  function processObjectPattern(syntaxTree) {
    var currentElement = constructElement(advanceAndRetrieve(), syntaxTree);

    if (hasMoreInput()) {
      /**
       * An object pattern can be specified by:
       * O@name: Object bound to a variable 'name'.
       * O(...): Object with specific property patterns.
       */
      switch (inspectCurrent()) {
        case '@':
          processVariableBinding(currentElement);
          return;
        case '(':
          processObjectProperties(currentElement);
          break;
        default:
          /**
           * Allows patterns like A(O) to match nested objects without
           * explicit binding names.
           */
          return;
      }

      // Ensure the closing parenthesis is present for O(...) patterns.
      if (inspectCurrent() !== ')') {
        raiseSyntaxError(')');
      } else {
        stepForward(); // Consume the ')' bracket.
        // The entire object pattern might be bound to a name.
        if (hasMoreInput() && inspectCurrent() === '@') {
          processVariableBinding(currentElement);
        }
      }
    }
  }

  /**
   * Parses a sequence of literals. The specific type of literal is determined
   * by the provided `literalParserFunction` (e.g., for strings, numbers, booleans, dates).
   */
  function processLiteralSequence(syntaxTree, literalParserFunction) {
    stepForward(); // Consume the opening '(' bracket.

    while (true) {
      skipWhitespace();
      literalParserFunction(syntaxTree);
      skipWhitespace();

      if (inspectCurrent() !== ',') {
        break;
      }
      stepForward(); // Consume the ',' separator.
    }
  }

  // Extracts a string literal enclosed in single or double quotes.
  function extractQuotedString() {
    var literalValue = [], quoteChar = advanceAndRetrieve();

    if (!(quoteChar === '"' || quoteChar === "'")) {
      throw "Syntax error at index " + currentPosition +
        ": Expected a quoted string but found '" + quoteChar + "'.";
    }

    while (hasMoreInput() && inspectCurrent() !== quoteChar) {
      literalValue[literalValue.length] = advanceAndRetrieve();
    }

    stepForward(); // Consume the closing quote.
    return literalValue.join('');
  }

  // Extracts a regular expression literal enclosed in forward slashes.
  function extractRegularExpression() {
    var literalValue = [];
    stepForward(); // Consume the opening '/' slash.

    while (hasMoreInput() && inspectCurrent() !== '/') {
      literalValue[literalValue.length] = advanceAndRetrieve();
    }

    stepForward(); // Consume the closing '/' slash.
    return new RegExp(literalValue.join(''));
  }

  // Processes a string literal, which can be a plain string or a regular expression.
  function processStringMatcher(syntaxTree) {
    if (inspectCurrent() === '/') {
      constructElement(extractRegularExpression(), constructElement('regexMatch', syntaxTree).children);
    } else {
      constructElement(extractQuotedString(), constructElement('exactMatch', syntaxTree).children);
    }
  }

  // Processes numeric literals such as 1, 1.05, .05, 8e5.
  function processNumericMatcher(syntaxTree) {
    var literalValue = [], numericValue;

    while (hasMoreInput() && isValidNumericChar(inspectCurrent())) {
      literalValue[literalValue.length] = advanceAndRetrieve();
    }

    numericValue = parseFloat(literalValue.join(''));

    // Robust number validation (inspired by StackOverflow)
    if (!isNaN(numericValue) && isFinite(numericValue)) {
      constructElement(numericValue, constructElement('exactMatch', syntaxTree).children);
    } else {
      raiseSyntaxError('a valid numeric literal');
    }
  }

  // Processes boolean literals 'true' or 'false'.
  function processBooleanMatcher(syntaxTree) {
    var literalValue = [], lowerCaseRegEx = /[a-z]/;

    while (hasMoreInput() && lowerCaseRegEx.test(inspectCurrent())) {
      literalValue[literalValue.length] = advanceAndRetrieve();
    }

    literalValue = literalValue.join('');
    if (literalValue === 'true' || literalValue === 'false') {
      constructElement(literalValue[0] === 't' ? true : false, constructElement('exactMatch', syntaxTree).children);
    } else {
      raiseSyntaxError('a boolean literal (true or false)');
    }
  }

  // Processes date literals, which are expected as quoted strings.
  function processDateMatcher(syntaxTree) {
    var literalValue = extractQuotedString(), parsedDateObject = new Date(literalValue);

    if (isNaN(parsedDateObject.getTime())) {
      raiseSyntaxError('a valid date string');
    } else {
      constructElement(parsedDateObject, constructElement('dateMatch', syntaxTree).children);
    }
  }

  // Matches any of the generic pattern types (A, O, N, S, B, D, F, W).
  function processGenericMatcher(syntaxTree, elementKind) {
    var currentElement = constructElement(advanceAndRetrieve(), syntaxTree);

    // Parse literal sequences, e.g., S("str1", "str2", ...)
    if (inspectCurrent() === '(') {
      switch (elementKind) {
        case "S": // String type
          processLiteralSequence(currentElement.children, processStringMatcher);
          break;
        case "N": // Numeric type
          processLiteralSequence(currentElement.children, processNumericMatcher);
          break;
        case "B": // Boolean type
          processLiteralSequence(currentElement.children, processBooleanMatcher);
          break;
        case "D": // Date type
          processLiteralSequence(currentElement.children, processDateMatcher);
          break;
      }

      currentElement.kind = 'anyOfLiterals'; // Change kind to reflect multiple literal possibilities.
      stepForward(); // Consume the closing ')' bracket.
    }

    // Check if the generic element is bound to a name.
    if (inspectCurrent() === '@') { processVariableBinding(currentElement); }
  }

  // The primary entry point for parsing the input pattern.
  function initialParseStage(syntaxTree) {
    if (hasMoreInput()) {
      switch (inspectCurrent()) {
        case 'A': // Array pattern
          processArrayPattern(syntaxTree);
          break;
        case 'O': // Object pattern
          processObjectPattern(syntaxTree);
          break;
        default:
          if (/[NSBDFW]/.test(inspectCurrent())) { // N, S, B, D, F, W (Numeric, String, Boolean, Date, Function, Wildcard)
            processGenericMatcher(syntaxTree, inspectCurrent());
          } else {
            raiseSyntaxError('one of (A, O, N, S, B, D, F, W, or _ for wildcard)');
          }
      }
    }
    return syntaxTree;
  }

  return {
    // Initiates the parsing process and returns the generated AST.
    analyze: function () {
      if (!inputPattern || !inputPattern.length) {
        throw "Cannot parse an empty pattern string.";
      }

      var syntaxTree = initialParseStage([]);
      // Remove any lingering whitespace at the end of the input.
      skipWhitespace();

      if (currentPosition !== inputPattern.length) {
        throw "Unexpected characters found after parsing: '" + inputPattern.substring(currentPosition) + "'.";
      }
      return syntaxTree;
    }
  };
};
/*-------------------------------------------------------------------------*/

/**
 * createMatcherGenerator
 * Produces a matching function from a previously generated Abstract Syntax Tree (AST).
 */

/*-------------------------------------------------------------------------*/
patternProcessor.createMatcherGenerator = function (analyzedTree) {
  "use strict";
  var variableBindings = {}; // Stores values bound by '@' in the pattern.

  /**
   * partialApplication
   * Accepts a function and a preliminary list of arguments. Returns a new function
   * that can be invoked with the remaining arguments.
   *
   * Example:
   * var findMax = partialApplication(Math.max, [10, 20]);
   * findMax(15); // Returns 20
   */
  function partialApplication(targetFunction, initialArguments) {
    return function (additionalArgument) {
      return targetFunction.apply(variableBindings, initialArguments.concat([additionalArgument]));
    };
  }

  /**
   * Thanks to Kangax for the isArray implementation approach.
   * http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
   */
  function checkType(targetObject, expectedTypeString) {
    return Object.prototype.toString.call(targetObject) === expectedTypeString;
  }

  /**
   * evaluateAndBind
   * Functions as a predicate and also stores a matched value into the
   * `variableBindings` context.
   * Parameters:
   * bindingIdentifier: The name under which to store the value.
   * predicateFunction: The actual predicate that evaluates the input.
   * inputDatum: The value being evaluated.
   *
   * The first two parameters are curried during compilation. The third
   * parameter is supplied at runtime.
   */
  function evaluateAndBind(bindingIdentifier, predicateFunction, inputDatum) {
    var matchResult = predicateFunction(inputDatum);
    if (matchResult.outcome) {
      // Prevent binding to the same name multiple times.
      if (variableBindings.hasOwnProperty(bindingIdentifier)) {
        throw "Binding name '" + bindingIdentifier + "' is already in use.";
      }

      variableBindings[bindingIdentifier] = matchResult.targetObject ? matchResult.targetObject[matchResult.targetProperty] : matchResult.targetProperty;
    }

    /**
     * When an array remainder is matched, the binding value needs adjustment
     * after `evaluateAndBind` runs, as the full remainder isn't known yet.
     * The name of the last binding is stored for later retrieval.
     */
    matchResult.lastBinding = bindingIdentifier;
    return matchResult;
  }

  /* Predicate Functions */

  /* Matches any value */
  function matchAnything(evaluatedValue) {
    return {
      outcome: true,
      targetProperty: evaluatedValue
    };
  }

  /* Matches a numeric value */
  function matchNumber(evaluatedValue) {
    return {
      outcome: typeof evaluatedValue === 'number' && !isNaN(evaluatedValue),
      targetProperty: evaluatedValue
    };
  }

  /* Matches a string value */
  function matchString(evaluatedValue) {
    return {
      outcome: typeof evaluatedValue === 'string',
      targetProperty: evaluatedValue
    };
  }

  /* Matches a boolean value */
  function matchBoolean(evaluatedValue) {
    return {
      outcome: typeof evaluatedValue === 'boolean',
      targetProperty: evaluatedValue
    };
  }

  /* Matches a Date object */
  function matchDate(evaluatedValue) {
    return {
      outcome: checkType(evaluatedValue, '[object Date]'),
      targetProperty: evaluatedValue
    };
  }

  /* Matches a function */
  function matchFunction(evaluatedValue) {
    return {
      outcome: typeof evaluatedValue === 'function',
      targetProperty: evaluatedValue
    };
  }

  /* Matches an array */
  function matchArray(evaluatedValue) {
    return {
      outcome: checkType(evaluatedValue, '[object Array]'),
      targetProperty: evaluatedValue
    };
  }

  /* Matches an object (not null, not array, not date, etc.) */
  function matchObject(evaluatedValue) {
    return {
      outcome: typeof evaluatedValue === 'object' && evaluatedValue !== null && !checkType(evaluatedValue, '[object Array]') && !checkType(evaluatedValue, '[object Date]'),
      targetProperty: evaluatedValue
    };
  }

  /* Matches a value against a regular expression */
  function matchRegExp(patternRegex, evaluatedValue) {
    return {
      outcome: typeof evaluatedValue === 'string' && patternRegex.test(evaluatedValue),
      targetProperty: evaluatedValue
    };
  }

  /* Matches an object's own property by name */
  function matchOwnProperty(propertyName, subPattern, evaluatedObject) {
    var operationResult = { outcome: false, targetProperty: evaluatedObject };
    if (matchObject(evaluatedObject).outcome && Object.prototype.hasOwnProperty.call(evaluatedObject, propertyName)) {
      operationResult = subPattern(evaluatedObject[propertyName]);
      operationResult.targetObject = evaluatedObject;
      operationResult.targetProperty = propertyName;
    }
    return operationResult;
  }

  /* Matches an object's own or inherited property by name */
  function matchInheritedProperty(propertyName, subPattern, evaluatedObject) {
    var operationResult = { outcome: false, targetProperty: evaluatedObject };
    if (matchObject(evaluatedObject).outcome && propertyName in evaluatedObject) {
      operationResult = subPattern(evaluatedObject[propertyName]);
      operationResult.targetObject = evaluatedObject;
      operationResult.targetProperty = propertyName;
    }
    return operationResult;
  }

  /* Matches elements in an array against a list of sub-patterns */
  function matchArrayElements(subPatterns, evaluatedArray) {
    var operationResult = { outcome: true, targetProperty: evaluatedArray };
    if (!matchArray(evaluatedArray).outcome || evaluatedArray.length < subPatterns.length) {
      operationResult.outcome = false;
    } else {
      for (var currentIndex = 0; currentIndex < subPatterns.length; currentIndex++) {
        if (!subPatterns[currentIndex](evaluatedArray[currentIndex]).outcome) {
          operationResult.outcome = false;
          break;
        }
      }
    }
    return operationResult;
  }

  /* Matches an array remainder against a sub-pattern */
  function matchArrayRemainder(subPattern, evaluatedArray) {
    var operationResult = { outcome: true, targetProperty: evaluatedArray };
    var startIndex = evaluatedArray.length - subPattern.currentPattern.length;
    var matchedRemainder = evaluatedArray.slice(startIndex);

    if (subPattern.currentPattern.length === 0) { // If remainder is empty, just match the rest.
      operationResult = subPattern(matchedRemainder);
    } else {
      // Match individual elements in the remainder
      for (var currentIndex = 0; currentIndex < subPattern.currentPattern.length; currentIndex++) {
        if (!subPattern.currentPattern[currentIndex](matchedRemainder[currentIndex]).outcome) {
          operationResult.outcome = false;
          break;
        }
      }
    }

    if (operationResult.outcome && operationResult.lastBinding) {
      variableBindings[operationResult.lastBinding] = matchedRemainder;
    }
    return operationResult;
  }

  /* Matches properties in an object against a list of sub-patterns */
  function matchObjectProperties(subPatterns, evaluatedObject) {
    var operationResult = { outcome: true, targetProperty: evaluatedObject };
    if (!matchObject(evaluatedObject).outcome) {
      operationResult.outcome = false;
    } else {
      for (var currentIndex = 0; currentIndex < subPatterns.length; currentIndex++) {
        if (!subPatterns[currentIndex](evaluatedObject).outcome) {
          operationResult.outcome = false;
          break;
        }
      }
    }
    return operationResult;
  }

  /* Matches if any of the provided sub-patterns match */
  function matchAnyOf(subPatterns, evaluatedValue) {
    var operationResult = { outcome: false, targetProperty: evaluatedValue };
    for (var currentIndex = 0; currentIndex < subPatterns.length; currentIndex++) {
      if (subPatterns[currentIndex](evaluatedValue).outcome) {
        operationResult.outcome = true;
        break;
      }
    }
    return operationResult;
  }

  /* Matches if all provided sub-patterns match */
  function matchAllOf(subPatterns, evaluatedValue) {
    var operationResult = { outcome: true, targetProperty: evaluatedValue };
    for (var currentIndex = 0; currentIndex < subPatterns.length; currentIndex++) {
      if (!subPatterns[currentIndex](evaluatedValue).outcome) {
        operationResult.outcome = false;
        break;
      }
    }
    return operationResult;
  }

  /* Compiles the AST into a matcher function */
  function compileNode(currentPattern) {
    var childrenMatchers = [];
    for (var currentIndex = 0; currentIndex < currentPattern.children.length; currentIndex++) {
      childrenMatchers.push(compileNode(currentPattern.children[currentIndex]));
    }

    var compiledMatcher;
    switch (currentPattern.kind) {
      case 'arrayType':
        compiledMatcher = matchArray;
        break;
      case 'objectType':
        compiledMatcher = matchObject;
        break;
      case 'numericType':
        compiledMatcher = matchNumber;
        break;
      case 'stringType':
        compiledMatcher = matchString;
        break;
      case 'booleanType':
        compiledMatcher = matchBoolean;
        break;
      case 'dateType':
        compiledMatcher = matchDate;
        break;
      case 'functionType':
        compiledMatcher = matchFunction;
        break;
      case 'wildcardType':
        compiledMatcher = matchAnything;
        break;
      case 'emptyArray':
        compiledMatcher = partialApplication(matchArrayElements, [[]]);
        break;
      case 'ownProp':
        var propertyKey = currentPattern.name;
        var propertyMatcher = childrenMatchers[0] || matchAnything;
        compiledMatcher = partialApplication(matchOwnProperty, [propertyKey, propertyMatcher]);
        break;
      case 'inhProp':
        var propertyKey = currentPattern.name;
        var propertyMatcher = childrenMatchers[0] || matchAnything;
        compiledMatcher = partialApplication(matchInheritedProperty, [propertyKey, propertyMatcher]);
        break;
      case 'regexMatch':
        compiledMatcher = partialApplication(matchRegExp, [currentPattern.targetProperty]);
        break;
      case 'exactMatch':
        var literalValue = currentPattern.targetProperty;
        compiledMatcher = function (evaluatedValue) {
          return {
            outcome: evaluatedValue === literalValue,
            targetProperty: evaluatedValue
          };
        };
        break;
      case 'dateMatch':
        var dateValue = currentPattern.targetProperty;
        compiledMatcher = function (evaluatedValue) {
          return {
            outcome: matchDate(evaluatedValue).outcome && evaluatedValue.getTime() === dateValue.getTime(),
            targetProperty: evaluatedValue
          };
        };
        break;
      case 'anyOfLiterals':
        compiledMatcher = partialApplication(matchAnyOf, childrenMatchers);
        break;
      case '|': // Array remainder
        compiledMatcher = partialApplication(matchArrayRemainder, childrenMatchers);
        compiledMatcher.currentPattern = childrenMatchers; // Store for length check in matchArrayRemainder
        break;
      default: // A sequence of patterns (e.g. elements in an array or properties in an object)
        compiledMatcher = partialApplication(matchAllOf, childrenMatchers);
        break;
    }

    if (currentPattern.boundName) {
      compiledMatcher = partialApplication(evaluateAndBind, [currentPattern.boundName, compiledMatcher]);
    }
    return compiledMatcher;
  }

  return {
    // Generates the final matcher function from the AST.
    generate: function () {
      var rootMatcher = compileNode({ kind: 'root', children: analyzedTree });

      return function (dataToMatch) {
        variableBindings = {}; // Reset bindings for each new match attempt.
        var matchOutcome = rootMatcher(dataToMatch);
        matchOutcome.bindings = variableBindings; // Attach bindings to the result.
        return matchOutcome;
      };
    }
  };
};
/*-------------------------------------------------------------------------*/