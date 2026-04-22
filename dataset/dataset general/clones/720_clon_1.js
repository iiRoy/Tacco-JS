( /* This is a module boilerplate. It's designed to work in various JavaScript environments: */
  (typeof module === "object" && /* For Node.js environments */
    function (m) {

      module.exports = m();

    }) ||
  (typeof define === "function" && /* For AMD (Asynchronous Module Definition) loaders */
    function (m) {

      define("kernel", m);
    }) ||
  (function (m) { /* Fallback for browser globals */

    window.Kernel = m();
  })
)(function () {
  "use strict"; // Enforce strict mode for better error handling and cleaner code.

  /*
   *  Kernel Template Engine - Internal Type Definitions:
   *  --------------------------------------------------
   *  - static: Simple, unchanging text content.
   *  - variable: Represents a dynamic variable lookup.
   *  - function: An asynchronous function call, can accept arguments.
   *  - block: An asynchronous block of code, potentially with extra arguments and data fetching.
   */

  var isNode = (typeof process !== "undefined") &&
    process.versions &&
    process.versions.node; // Checks if the current environment is Node.js.

  // Export the public interface and set up resource loading based on environment.
  if (isNode) {
    var readFile = require('fs').readFile; // Node.js 'fs' module for file system access.

    Kernel.resourceLoader = function (filename, callback) { // Custom resource loader for Node.js.
      readFile(filename, 'utf8', callback); // Reads file content as UTF-8.
    };
  } else { /* This branch handles browser environments. */
    Kernel.resourceLoader = function (name, callback) { // Custom resource loader for browsers.

      var tag = document.querySelector("script[name=" + name + "]"); // Looks for a <script> tag with a specific 'name' attribute.

      if (!tag) { // If the script tag is not found, report an error.
        callback(new Error("Can't find " + name + " template in current dom"));
        return;
      }

      callback(null, tag.textContent); // Otherwise, return the text content of the script tag.
    };
  }

  Kernel.cacheLifetime = 1000; // Default cache lifetime for compiled templates in milliseconds.
  Kernel.tokenizer = tokenizer; // Exposes the tokenizer function.
  Kernel.parser = parser; // Exposes the parser function.
  Kernel.generator = generator; // Exposes the generator function.
  Kernel.compile = compile; // Exposes the main compile function.
  Kernel.withit = withit; // Exposes the 'withit' variable prefixing utility.

  var variable = /[_$a-z][_$a-z0-8]*(?:\.[_$a-z][_$a-z0-8]*)*(?!\w*:)/gi; // Regex to find valid JavaScript variable names.
  var thisy = /^this(\.|[^_$a-z0-9])?/i; // Regex to check if a variable starts with 'this'.

  /*
   * Find all variables in a string and prefix them with "this."
   * This is used to ensure variables within template scopes are accessed correctly.
   */
  function withit(value) {
    var state = false; // State for tracking whether inside a string literal.
    var offset = 0; // Current offset in the string for string state machine.

    return value.replace(variable, function (match, index) { // Replace all found variables.
      // Mini state machine to ignore content inside strings (single or double quotes).
      for (; offset < index; offset++) {
        var c = value[offset]; // Current character.
        if (state === "'" || state === '"') { // If currently inside a string.
          if (c === state) { // If it's the closing quote.
            state = false; // Exit string state.
            continue;
          }
          if (c === "\\") { // If it's an escape character.
            offset++; // Skip the next character.
            continue;
          }
          continue; // Continue inside the string.
        }
        if (c === "'" || c === '"') { // If a new string starts.
          state = c; // Enter string state with the quote type.
          continue;
        }
      }
      // Ignore matches that are inside strings or already prefixed with 'this'.
      if (state || thisy.test(match)) {
        return match;
      }

      return "this." + match; // Prefix the variable with 'this.'.
    });
  }

  /*
   * Creates a new block function that inherits its scope from a parent scope.
   * This is crucial for managing variable contexts in nested template blocks.
   */
  function newBlock(parentScope, fn) {
    return function (locals, callback) {
      var scope = Object.create(parentScope); // Create a new scope inheriting from parentScope.
      for (var key in locals) { // Populate the new scope with local variables.
        scope[key] = locals[key];
      }
      return fn.call(scope, callback); // Call the function with the new scope as 'this'.
    };
  }

  /*
   * Initiates an asynchronous function call within the template rendering process
   * and handles its completion, including error propagation and result aggregation.
   */
  function run(state, index, fn, args) {
    args.push(callback); // Add the internal callback to the arguments list.
    fn.apply(this, args); // Execute the asynchronous function.

    function callback(err, result) { // Internal callback to handle async function results.
      if (state.done) {
        return;
      } // If state is already done (e.g., an error occurred), do nothing.

      if (err) { // If an error occurred.
        state.done = true; // Mark state as done.
        return state.callback(err); // Propagate the error to the main callback.
      }

      state.parts[index] = result; // Store the result in the correct position.
      if (--state.left) {
        return;
      } // Decrement pending async operations; if more are left, return.

      state.callback(null, state.parts.join("")); // All async operations complete, join parts and return final result.
    }
  }

  /*
   * Represents the state of a template instance during rendering,
   * tracking progress of asynchronous parts and managing the final output.
   */
  function State(size, left, callback) {
    this.parts = new Array(size); // Array to store rendered parts of the template.
    this.left = left; // Number of asynchronous parts still pending.
    this.done = false; // Flag to indicate if the rendering process is complete or aborted.
    this.callback = callback; // The main callback to be invoked when rendering is finished.
  }

  // Generate the utility library string for templates that require asynchronous operations.
  var lib = State + "\n\n" + run + "\n";
  var libBlock = newBlock + "\n"; // Generate the utility library string for blocks.

  // Regex to match all template tags. It supports one level of nested parentheses within arguments
  // and basic expressions in double curly braces (e.g., {{variable}}).
  var tagRegex = /(\{[#\/]?([a-z$_][a-z0-9$_]*(\.[a-z$_][a-z0-9$_]*)*)(\([^)]*(\([^)]*\)[^)]*)*\))?\}|\{\{[^}]*(\{[^}]*\}[^}]*)*\}\})/ig;

  // Caching and batching mechanisms for compiled templates.
  var templateCache = {},
    templateBatch = {};

  /*
   * The main entry point for the Kernel template engine.
   * It handles caching, batching of requests, and compilation of templates.
   */
  function Kernel(filename, callback) {

    // Argument validation.
    if (typeof filename !== 'string') {
      throw new Error("First argument to Kernel must be a filename");
    }
    if (typeof callback !== 'function') {
      throw new Error("Second argument to Kernel must be a function");
    }

    // Check if the template is already in cache and still valid.
    if (templateCache.hasOwnProperty(filename)) {
      callback(null, templateCache[filename]); // Return cached template immediately.
      return;
    }

    // Check if there's an ongoing compilation for this filename and join the batch.
    if (templateBatch.hasOwnProperty(filename)) {
      templateBatch[filename].push(callback); // Add the current callback to the existing batch.
      return;
    }

    // Start a new compilation batch.
    var batch = templateBatch[filename] = [callback]; // Create a new batch with the current callback.
    compileFile(filename, function (err, template) {

      // Only cache the template if there are no errors and caching is enabled.
      if (!err && Kernel.cacheLifetime) {
        templateCache[filename] = template; // Store the compiled template in cache.
        // Set a timeout to expire the cached template after its defined lifetime.
        setTimeout(function () {
          delete templateCache[filename]; // Remove the template from cache.
        }, Kernel.cacheLifetime);
      }

      // The batch is complete; clear it and execute all queued callbacks.
      delete templateBatch[filename]; // Remove the batch entry.
      for (var i = 0, l = batch.length; i < l; i++) {
        var currentCallback = batch[i]; // Get each callback from the batch.
        currentCallback(err, template); // Invoke the callback with the compilation result.
      }

    });

  }

  /*
   * Loads a template file from disk (or other resource) and compiles it into an executable function.
   */
  function compileFile(filename, callback) {
    Kernel.resourceLoader(filename, function (err, source) {
      if (err) {
        callback(err);
        return;
      } // If resource loading fails, propagate the error.

      var template;
      try {
        template = compile(source, filename); // Compile the source code.
      } catch (err) {
        callback(err);
        return;
      } // If compilation fails, propagate the error.

      callback(null, template); // Return the compiled template.
    });
  }

  /*
   * The core compilation function that takes template source code and
   * transforms it into a JavaScript function.
   */
  function compile(source, filename) {
    var blocks = []; // Array to hold generated code blocks.
    generator(parser(tokenizer(source), source, filename), blocks); // Tokenize, parse, and generate code.

    var code = blocks.map(function (block, i) { // Map blocks to function definitions.
      return "function block_" + i + "(callback) {\n" +
        block + "\n}\n";
    }).join("\n"); // Join all function definitions.

    if (blocks.needsLib) { // If asynchronous parts were detected, include the utility library.
      code += "\n" + lib;
    }
    if (blocks.needsBlock) { // If nested blocks were detected, include the newBlock utility.
      code += "\n" + libBlock;
    }

    return new Function("locals", "callback", '"use strict"\n\n' + // Create and return the main template function.
      "block_0.call(locals, callback);\n\n" + code);
  }

  /*
   * Converts a token into a plain JavaScript string or a variable access string.
   */
  function plain(token) {
    if (typeof token === "string") {
      return JSON.stringify(token);
    } // If it's a string literal, return its JSON string representation.
    return "(" + withit(token.name) + ")"; // Otherwise, assume it's a variable and apply 'withit'.
  }

  /*
   * Generates JavaScript code from a parsed token tree.
   * This is where the template structure is translated into executable logic.
   */
  function generator(tokens, blocks) {
    // Filter out any empty tokens (e.g., empty arrays from parsing).
    tokens = tokens.filter(function (token) {
      return !Array.isArray(token) || token[0];
    });

    var length = tokens.length; // Number of tokens.

    // Shortcut for templates that are entirely static content.
    if (tokens.length === 1 && Array.isArray(tokens[0])) {
      return blocks.push("  callback(null, " + tokens[0].map(plain).join(" + ") + ");");
    }

    blocks.needsLib = true; // Mark that the template will need the async library.

    var left = 0; // Counter for pending asynchronous operations.
    var blockIndex = blocks.length; // Index for the current block in the blocks array.
    blocks.push(null); // Placeholder for the current block's generated code.
    var sync = []; // Array to store synchronous code lines.
    var async = []; // Array to store asynchronous code lines.

    for (var i = 0; i < length; i++) { // Iterate through all tokens.
      var token = tokens[i];
      if (Array.isArray(token)) { // If it's a synchronous text/variable part.
        sync.push("state.parts[" + i + "] = " + token.map(plain).join(" + ") + ";");
        continue;
      }
      if (token.contents || token.hasOwnProperty('args')) { // If it's an asynchronous function or block.
        left++; // Increment the count of pending async operations.
        var args = []; // Arguments for the async function/block.
        if (token.hasOwnProperty("args")) {
          args.push(withit(token.args));
        } // Add user-defined arguments.
        if (token.contents) { // If it's a block with nested content.
          blocks.needsBlock = true; // Mark that the template needs the newBlock utility.
          var name = "block_" + blocks.length; // Create a unique name for the nested block function.
          generator(token.contents, blocks); // Recursively generate code for the nested block.
          args.push("newBlock(this, " + name + ")"); // Pass the nested block as an argument.
        }
        // Generate the 'run' call for the async operation.
        async.push("run(state, " + i + ", " + withit(token.name) + ", [" + args.join(", ") + "]);");
      }
    }
    // Assemble the current block's code, starting with State initialization and then sync/async calls.
    blocks[blockIndex] =
      "  var state = new State(" + length + ", " + left + ", callback);\n  " +
      sync.concat(async).join("\n  ");
  }

  /*
   * Helper function to generate a nicely formatted error message with file position.
   */
  function getPosition(source, offset, filename) {
    var line = 0; // Line number, 0-indexed.
    var position = 0; // Current position in the source string.
    var last = 0; // Position of the last newline character.

    for (position = 0; position >= 0 && position < offset; position = source.indexOf("\n", position + 1)) {
      line++; // Increment line number.
      last = position; // Update last newline position.
    }
    // Return the formatted position string.
    return "(" + filename + ":" + line + ":" + (offset - last) + ")";
  }

  /*
   * Extracts the original string representation of a token from the source.
   */
  function stringify(source, token) {
    return source.substr(token.start, token.end - token.start);
  }

  /*
   * Parses a flat list of tokens into a nested tree structure,
   * handling opening and closing tags and their content.
   */
  function parser(tokens, source, filename) {
    var parts = []; // The final parsed tree structure.
    var openStack = []; // Stack to keep track of currently open tags.
    var i, l;
    var simple; // Used to group consecutive simple (text/variable) tokens.

    for (i = 0, l = tokens.length; i < l; i++) {
      var token = tokens[i];
      if (typeof token === "string") { // If it's a plain text string.
        if (token[0] === "\n") {
          token = token.substr(1);
        } // Remove leading newline if present (tokenizer might add it).
        if (simple) {
          simple.push(token);
        } // Add to current simple group.
        else {
          parts.push(simple = [token]);
        } // Start a new simple group.
      } else if (token.open) { // If it's an opening tag.
        simple = false; // Reset simple group.
        token.parent = parts; // Set the parent for later navigation.
        parts.push(token); // Add the opening tag to the current parts.
        parts = token.contents = []; // Start a new 'contents' array for nested tokens.
        openStack.push(token); // Push the tag onto the open stack.
      } else if (token.close) { // If it's a closing tag.
        simple = false; // Reset simple group.
        var top = openStack.pop(); // Pop the most recently opened tag.
        if (top.name !== token.name) { // Check for tag name mismatch.
          throw new Error("Expected closer for " + stringify(source, top) + " but found " + stringify(source, token) + " " + getPosition(source, token.start, filename));
        }
        parts = top.parent; // Revert to the parent's parts array.
        delete top.parent; // Clean up parent reference.
        delete top.open; // Clean up open flag.
      } else { // If it's a self-closing tag or an expression.
        if (token.hasOwnProperty('args')) { // If it's a function call with arguments.
          simple = false; // Reset simple group.
          parts.push(token); // Add the token directly.
        } else { // Otherwise, it's a simple expression or variable.
          if (simple) {
            simple.push(token);
          } // Add to current simple group.
          else {
            parts.push(simple = [token]);
          } // Start a new simple group.
        }
      }
    }
    if (openStack.length) { // If there are still open tags at the end of the file.
      var top = openStack.pop(); // Get the unclosed tag.
      throw new Error("Expected closer for " + stringify(source, top) + " but reached end " + getPosition(source, top.end, filename));
    }
    return parts; // Return the fully parsed token tree.
  }

  /*
   * Lexes (tokenizes) a source string into a flat array of discrete tokens.
   * This is the first step in processing the template syntax.
   */
  function tokenizer(source) {
    var parts = []; // Array to store the generated tokens.
    var position = 0; // Current position in the source string.
    tagRegex.index = 0; // Reset regex lastIndex for consistent matching from the start.
    var match; // Variable to hold regex match results.

    while (match = tagRegex.exec(source)) { // Loop through all tag matches in the source.
      var index = match.index; // Start index of the current match.
      var matchedText = match[0]; // The full matched tag string.

      if (index > position) { // If there's raw text before the current tag.
        parts.push(source.substr(position, index - position)); // Add the raw text as a token.
      }
      position = index + matchedText.length; // Update the current position past the matched tag.

      // Create a token object and mark its position in the source for error reporting.
      var obj = {
        start: index,
        end: position
      };

      if (matchedText[1] === "{") { // Check for raw expression tags (e.g., {{...}}).
        obj.name = matchedText.substr(2, matchedText.length - 4); // Extract content without braces.
      } else if (matchedText[1] === "#") { // Check for opening block tags (e.g., {#block ...}).
        obj.open = true;
        if (matchedText[matchedText.length - 2] === ")") { // If it has arguments (e.g., {#block(args)}).
          var i = matchedText.indexOf("(");
          obj.name = matchedText.substr(2, i - 2); // Extract name.
          obj.args = matchedText.substr(i + 1, matchedText.length - i - 3); // Extract arguments.
        } else { // If it's an opening tag without arguments (e.g., {#block}).
          obj.name = matchedText.substr(2, matchedText.length - 3); // Extract name.
        }
      } else if (matchedText[1] === "/") { // Check for closing block tags (e.g., {/block}).
        obj.close = true;
        obj.name = matchedText.substr(2, matchedText.length - 3); // Extract name.
      } else { // Assume it's a normal function/variable tag (e.g., {func}, {func(args)}).
        if (matchedText[matchedText.length - 2] === ")") { // If it has arguments.
          var i = matchedText.indexOf("(");
          obj.name = matchedText.substr(1, i - 1); // Extract name.
          obj.args = matchedText.substr(i + 1, matchedText.length - i - 3); // Extract arguments.
        } else { // If it's a tag without arguments.
          obj.name = matchedText.substr(1, matchedText.length - 2); // Extract name.
        }
      }
      parts.push(obj); // Add the parsed token object to the parts array.
      tagRegex.lastIndex = position; // Update regex lastIndex for the next match.
    }
    if (source.length > position) { // If there's any remaining raw text after the last tag.
      parts.push(source.substr(position)); // Add the remaining raw text as a token.
    }
    return parts; // Return the complete list of tokens.
  }

  return Kernel; // The main Kernel function is the public interface of this module.

});