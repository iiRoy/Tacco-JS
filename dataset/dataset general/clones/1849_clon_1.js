var mm = { version: '0.1.2' }; // Initializing MissMatch version. This object holds various utilities.

/*
 * This section defines the makeParser function, responsible for
 * converting a pattern string into an Abstract Syntax Tree (AST).
 * The AST is later used by the compiler to generate a matcher function.
 *
 * The pattern syntax allows for complex matching of JavaScript objects,
 * arrays, and primitive values.
 *
 * Example Usage:
 * var myAST = mm.makeParser('o(.x, .y)').parse();
 */
mm.makeParser = function(src) {
  "use strict"; // Enforce strict mode for cleaner code.

  var index = 0; // Current position in the source string.

  // Helper function to get the next character and advance the index.
  function next() {
    return src[index++];
  }

  // Checks if there are more characters to process.
  function hasNext() { return index < src.length; }

  // Advances the index without returning a character.
  function consume() { index++; }

  // Peeks at the current character without advancing.
  function peek() { return src[index]; }

  // Skips any whitespace characters from the current position.
  function clear() {
    while (peek() === ' ') {
      consume();
    }
  }

  // A simple one-time flag function. Returns true on first call, then false.
  function once(i) {
    var a = !i;
    return function() {
      return a == !i ? (a = !a) : !i;
    };
  }

  // Creates a new node for the AST and adds it to the parent's 'nodes' array.
  function newNode(type, AST) {
    var node = {
      type: type, // Type of the node (e.g., 'a' for array, 'o' for object).
      nodes: [], // Child nodes.
      binding: false // Flag for pattern binding.
    };
    AST.push(node); // Add the new node to the current AST level.
    return node;
  }

  /*
   * Validates if a character is suitable for a JavaScript variable name.
   * `isFirst` parameter determines if it's the first character (no digits).
   */
  function validChar(c, isFirst) {
    return isFirst ? /[a-zA-Z$_]/.test(c) : /[0-9a-zA-Z$_]/.test(c);
  }


  // Checks if a character is valid for a numeric literal.
  function validNum(c) {
    return /[0-9eE\+\-\.]/.test(c);
  }

  // Throws an error for unexpected tokens during parsing.
  function unexpectedTokenException(expected) {
    throw "Unexpected token at index " + index +
      " expected '" + expected + "' but found " +
      (peek() || "''");
  }

  /**
   * Parses a binding declaration, e.g., `@x` in `n@x`.
   * This binds the matched value to a variable named 'x'.
   * @param {object} node - The AST node to attach the binding to.
   */
  function parseBinding(node) {
    consume(); // Consume the '@' character.
    var binding = [],
      first = once(true); // Flag to check for the first character of the binding name.

    while (hasNext()) {
      if (validChar(peek(), first())) {
        binding[binding.length] = next();
      } else {
        break; // End of binding name.
      }
    }

    if (binding.length > 0) {
      node.binding = binding.join(''); // Store the binding name.
    } else {
      throw "No binding name given at " + index + " for " + node.type;
    }
  }

  // Parses the content of an array pattern, e.g., `(item1, item2, |rest)`.
  function parseArrayList(node) {
    consume(); // Consume the opening parenthesis '('.

    // Handle empty array pattern like `a()`.
    if (peek() === ')') {
      node.type = '()'; // Special type for empty array.
      return;
    }

    while (true) {
      // The '|' character indicates the "rest" of the array.
      if (peek() === '|') {
        break;
      }

      /*
       * Clear whitespace around array elements for flexibility,
       * but not within bindings.
       */
      clear();
      stage1(node.nodes); // Recursively parse the array element.
      clear();

      if (peek() !== ',') {
        break; // No more elements or not a comma separator.
      }
      consume(); // Consume the comma separator.
    }
  }

  // Parses an array pattern, e.g., `a@name`, `a(item1, item2)`, or `a(|@rest)`.
  function parseArray(AST) {
    var rest,
      node = newNode(next(), AST); // Create a node for the array, consume 'a'.

    if (hasNext()) {
      // Check for array binding or pattern list.
      switch (peek()) {
        case '@': // Array bound to a name (e.g., `a@myArray`).
          parseBinding(node);
          return;
        case '(': // Array pattern list (e.g., `a(item1, item2)`).
          parseArrayList(node);
          break;
        default:
          /*
           * Allows patterns like `a(a)` to match nested arrays
           * without explicit binding.
           */
          return;
      }

      // Check for the "rest" of the array, indicated by '|'.
      if (peek() === '|') {
        rest = newNode(next(), node.nodes); // Create a node for the rest, consume '|'.
        clear();

        // Check if the "rest" is bound to a name (e.g., `a(|@remaining)`).
        if (peek() === '@') {
          parseBinding(rest);
          clear();
        }
      }

      // Ensure the closing parenthesis for array patterns.
      if (peek() !== ')') {
        unexpectedTokenException(')');
      } else {
        consume(); // Consume the closing parenthesis.
        // Check if the entire array pattern is bound to a name (e.g., `a(item1)@fullArray`).
        if (hasNext() && peek() === '@') {
          parseBinding(node);
        }
      }
    }
  }

  /*
   * Parses a single object property.
   * Properties can be own ('.') or prototype (':').
   * Example: `.name` or `:method`.
   */
  function parseProperty(node, proto) {
    consume(); // Consume '.' or ':'.
    var name = [],
      property,
      first = once(true);

    while (hasNext() && validChar(peek(), first())) {
      name[name.length] = next(); // Collect characters for the property name.
    }

    if (name.length > 0) {
      property = newNode(proto ? ':' : '.', node.nodes); // Create property node.
      property.name = name.join(''); // Set the property name.

      /*
       * Properties can have type specifiers for nested objects,
       * e.g., `o(.coord:o(.x, .y))`.
       */
      if (hasNext() && peek() === ':') {
        consume(); // Consume the ':' indicating a type specifier.
        stage1(property.nodes); // Recursively parse the nested type.
      }

      // Check if the property value is bound to a name.
      if (hasNext() && peek() === '@') {
        parseBinding(property);
      }
    } else {
      throw "No property name given at " + index + " for " + node.type;
    }
  }

  // Parses the list of properties within an object pattern, e.g., `o(.x, :y)`.
  function parseProperties(node) {
    consume(); // Consume the opening parenthesis '('.

    while (true) {
      clear(); // Clear whitespace.

      /*
       * Properties must start with '.' (own) or ':' (prototype).
       * e.g., `o(.x)` matches `{ x: ... }`.
       * e.g., `o(:y)` matches `{ y: ... }` or `{ __proto__: { y: ... } }`.
       */
      if (peek() === '.') {
        parseProperty(node, false); // Parse own property.
      } else if (peek() === ':') {
        parseProperty(node, true); // Parse prototype property.
      } else {
        unexpectedTokenException('. or :');
      }
      clear();

      if (peek() !== ',') {
        break; // No more properties or not a comma separator.
      }
      consume(); // Consume the comma.
    }
  }

  // Parses an object pattern, e.g., `o@name`, `o(.prop1, .prop2)`.
  function parseObject(AST) {
    var node = newNode(next(), AST); // Create object node, consume 'o'.

    if (hasNext()) {
      // Check for object binding or property list.
      switch (peek()) {
        case '@': // Object bound to a name (e.g., `o@myObject`).
          parseBinding(node);
          return;
        case '(': // Object property list (e.g., `o(.prop1, .prop2)`).
          parseProperties(node);
          break;
        default:
          /*
           * Allows patterns like `a(o)` to match nested objects
           * without explicit binding.
           */
          return;
      }

      // Ensure the closing parenthesis for object patterns.
      if (peek() !== ')') {
        unexpectedTokenException(')');
      } else {
        consume(); // Consume the closing parenthesis.
        // Check if the entire object pattern is bound to a name.
        if (hasNext() && peek() === '@') {
          parseBinding(node);
        }
      }
    }
  }

  /*
   * Parses a list of literals within a type pattern, e.g., `s("a", "b")`.
   * The `parseFunction` determines how each individual literal is parsed.
   */
  function parseLiteralList(AST, parseFunction) {
    consume(); // Consume the opening parenthesis '('.

    while (true) {
      clear();
      parseFunction(AST); // Parse a single literal using the provided function.
      clear();

      if (peek() !== ',') {
        break; // No more literals or not a comma.
      }
      consume(); // Consume the comma.
    }
  }

  // Extracts a string literal, including its enclosing quotes.
  function extractStringLiteral() {
    var literal = [],
      enclosing = next(); // Get the opening quote (either single or double).

    if (!(enclosing === '"' || enclosing === "'")) {
      throw "Unexpected token at index " + index +
        " expected 'string' but found " + enclosing;
    }

    while (hasNext() && peek() !== enclosing) {
      literal[literal.length] = next(); // Collect characters until the closing quote.
    }

    consume(); // Consume the closing quote.
    return literal.join('');
  }

  // Extracts a regular expression literal, including its enclosing slashes.
  function extractRegex() {
    var literal = [];
    consume(); // Consume the opening slash '/'.

    while (hasNext() && peek() !== '/') {
      literal[literal.length] = next(); // Collect characters until the closing slash.
    }

    consume(); // Consume the closing slash.
    return new RegExp(literal.join(''));
  }

  // Parses a string literal or a regular expression literal.
  function parseStringLiteral(AST) {
    if (peek() === '/') {
      newNode(extractRegex(), newNode('r=', AST).nodes); // Regex literal.
    } else {
      newNode(extractStringLiteral(), newNode('=', AST).nodes); // String literal.
    }
  }

  // Parses a numeric literal (integers, floats, scientific notation).
  function parseNumericLiteral(AST) {
    var literal = [],
      value;

    while (hasNext() && validNum(peek())) {
      literal[literal.length] = next(); // Collect numeric characters.
    }

    value = parseFloat(literal.join('')); // Convert to float.

    /*
     * Validate the parsed number.
     * Reference: http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
     */
    if (!isNaN(value) && isFinite(value)) {
      newNode(value, newNode('=', AST).nodes); // Create node with numeric value.
    } else {
      unexpectedTokenException('numeric');
    }
  }

  // Parses a boolean literal ('true' or 'false').
  function parseBooleanLiteral(AST) {
    var literal = [],
      code,
      lc = /[a-z]/; // Regex for lowercase letters.

    while (hasNext() && lc.test(peek())) {
      literal[literal.length] = next(); // Collect characters.
    }

    literal = literal.join('');
    if (literal === 'true' || literal === 'false') {
      newNode(literal[0] === 't' ? true : false, newNode('=', AST).nodes); // Create boolean node.
    } else {
      unexpectedTokenException('boolean');
    }
  }

  // Parses a date literal from a string.
  function parseDateLiteral(AST) {
    var literal = extractStringLiteral(),
      date = new Date(literal); // Attempt to create a Date object.

    if (isNaN(date.getTime())) { // Check for invalid date.
      unexpectedTokenException('date');
    } else {
      newNode(date, newNode('d=', AST).nodes); // Create node with Date object.
    }
  }

  /*
   * Parses generic type patterns like `n` (number), `s` (string), `_` (any).
   * Also handles literal lists for these types, e.g., `s("hello", "world")`.
   */
  function parseGeneric(AST, type) {
    var node = newNode(next(), AST); // Create node for the generic type, consume type char.

    // Check for a literal list associated with this type.
    if (peek() === '(') {
      switch (type) {
        case "s":
          parseLiteralList(node.nodes, parseStringLiteral);
          break;
        case "n":
          parseLiteralList(node.nodes, parseNumericLiteral);
          break;
        case "b":
          parseLiteralList(node.nodes, parseBooleanLiteral);
          break;
        case "d":
          parseLiteralList(node.nodes, parseDateLiteral);
          break;
      }

      node.type = '||'; // Indicate a "logical OR" list of literals.
      consume(); // Consume the closing parenthesis.
    }

    // Check for binding on the generic type (e.g., `n@myNumber`).
    if (peek() === '@') {
      parseBinding(node);
    }
  }

  /*
   * The main entry point for parsing a segment of the pattern.
   * It determines the type of the next token and dispatches to the appropriate parser.
   * @param {Array} AST - The current level of the Abstract Syntax Tree.
   */
  function stage1(AST) {
    if (hasNext()) {
      switch (peek()) {
        case 'a': // Array pattern.
          parseArray(AST);
          break;
        case 'o': // Object pattern.
          parseObject(AST);
          break;
        default:
          // Generic types: number, string, boolean, function, date, regex, any.
          if (/[nsSbfdr_]/.test(peek())) {
            parseGeneric(AST, peek());
          } else {
            unexpectedTokenException('one of (a,o,n,s,S,b,f,d,r,_)');
          }
      }
    }
    return AST;
  }

  // Public interface for the parser.
  return {
    parse: function() {
      if (!src || !src.length) {
        throw "Cannot parse empty pattern"; // Pattern must not be empty.
      }

      var AST = stage1([]); // Start parsing from an empty AST.
      clear(); // Clear any trailing whitespace.

      if (index !== src.length) {
        throw "Expected end of input but tokens found: " + src.substring(index); // Ensure entire input was consumed.
      }
      return AST; // Return the generated AST.
    }
  };
};

/*
 * This section defines the makeCompiler function.
 * It takes an Abstract Syntax Tree (AST), generated by makeParser,
 * and compiles it into a matcher function.
 * This matcher function can then be used to test values against the original pattern.
 */
mm.makeCompiler = function(AST) {
  "use strict"; // Strict mode for the compiler.
  var bindingContext = {}; // Stores bound variables during matching.

  /*
   * A currying utility function.
   * It takes a function and a partial list of arguments,
   * returning a new function that can be called with the remaining arguments.
   *
   * Example:
   * var add = (a, b) => a + b;
   * var addFive = curry(add, [5]);
   * addFive(3); // returns 8
   */
  function curry(fun, args) {
    return function(x) {
      return fun.apply(bindingContext, args.concat([x]));
    };
  }

  /*
   * Robust `isArray` check.
   * Thanks to Kangax for this implementation:
   * http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
   */
  function is(o, type) {
    return Object.prototype.toString.call(o) === type;
  }

  /*
   * The `bind` function acts as a predicate but also handles variable binding.
   * It attempts to match a value `v` using predicate `p`. If successful,
   * it binds the relevant part of `v` to the name `n` in `bindingContext`.
   *
   * Parameters:
   * n: The binding name (e.g., 'x' in `n@x`).
   * p: The actual predicate function to evaluate.
   * v: The value being tested.
   *
   * The first two parameters (`n`, `p`) are typically curried by the compiler.
   * The third parameter (`v`) is passed at runtime when the matcher is executed.
   */
  function bind(n, p, v) {
    var m = p(v); // Execute the underlying predicate.
    if (m.result) { // If the predicate matches successfully.
      // Prevent binding to an already used name.
      if (bindingContext.hasOwnProperty(n)) {
        throw "Name '" + n + "' is already used in another binding.";
      }

      // Store the bound value. It might be a direct parameter or a property.
      bindingContext[n] = m.obj ? m.obj[m.param] : m.param;
    }

    /*
     * If the 'rest' of an array is matched, its binding value
     * needs to be updated *after* the `bind` call.
     * `this_binding` stores the name for this post-processing.
     */
    m.this_binding = n;
    return m;
  }

  /*
   * Predicate Functions
   * These functions evaluate if a given value `x` matches a specific pattern type.
   * They return an object `{ result: boolean, param: any, obj: any }`.
   * `result`: true if match, false otherwise.
   * `param`: The matched value or property name.
   * `obj`: The parent object if a property was matched.
   */

  // Matches any value. Always returns true.
  function any(x) {
    return {
      result: true,
      param: x
    };
  }