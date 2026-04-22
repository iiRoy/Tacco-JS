( // Universal module definition pattern: Supports browser global, CommonJS, and AMD.
  (typeof module !== "undefined" && typeof module.exports !== "undefined" && function (moduleFactory) { module.exports = moduleFactory(); }) ||
  (typeof define === "function" && define.amd && function (moduleFactory) { define("templatingEngine", [], moduleFactory); }) ||
  (function (moduleFactory) {
    const globalContext = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : self));
    globalContext.TemplatingEngine = moduleFactory();
  })
)(function () {
"use strict";

// Define the core types of template elements for internal processing:
// - literal: static text segments
// - dynamic: variables or expressions
// - procedure: async function calls (can accept arguments)
// - structural: async blocks (like if/else, loops, can have arguments and nested content)

/**
 * Utility to detect the current JavaScript execution environment.
 * @type {object}
 */
const _environment = {
  isNodeJS: (typeof process !== "undefined") && process.versions && process.versions.node !== undefined
};

// Expose the primary interface and its components.
const CoreModule = {};

CoreModule.config = {
  cacheDurationMs: 1500, // Duration in milliseconds for which compiled templates are cached.
  templateTagPattern: /(\{[#\/]?([a-z$_][a-z0-9$_]*(\.[a-z$_][a-z0-9$_]*)*)(\([^)]*(\([^)]*\)[^)]*)*\))?\}|\{\{[^}]*(\{[^}]*\}[^}]*)*\}\})/ig // Regex to identify template tags.
};

// Set up the resource loading mechanism based on the environment.
if (_environment.isNodeJS) {
  // In Node.js, use the built-in 'fs' module to read files.
  const fileSystem = require('fs');
  CoreModule.resourceFetcher = function (resourceIdentifier, callbackHandler) {
    fileSystem.readFile(resourceIdentifier, 'utf8', callbackHandler);
  };
} else {
  // In a browser, attempt to find script tags with specific data attributes.
  CoreModule.resourceFetcher = function (resourceIdentifier, callbackHandler) {
    const scriptElement = document.querySelector(`script[data-template-id="${resourceIdentifier}"]`);
    if (!scriptElement) {
      // If the template script isn't found, report an error.
      callbackHandler(new Error(`Template with ID '${resourceIdentifier}' not found in the current DOM.`));
      return;
    }
    // Return the text content of the script element as the template source.
    callbackHandler(null, scriptElement.textContent);
  };
}

// Assign internal processing functions to the public interface.
Object.assign(CoreModule, {
  lexicalAnalyzer: analyzeSource,
  syntaxProcessor: parseTokens,
  codeGenerator: generateCode,
  templateCompiler: compileTemplate,
  scopeDecorator: decorateScope
});

/**
 * Regex to find identifiers that might need 'this.' prefixing.
 * - Matches valid JavaScript variable names.
 * - Allows for dot notation (e.g., `user.name`).
 * - Excludes identifiers followed by a colon (potential object keys).
 */
const identifierPattern = /[_$a-z][_$a-z0-8]*(?:\.[_$a-z][_$a-z0-8]*)*(?![_$\w]*:)/gi;

/**
 * Regex to detect if an identifier already starts with "this" or "this.".
 */
const thisPrefixPattern = /^this(\.|[^_$a-z0-9])?/i;

/**
 * Prefixes all top-level identifiers in a given string with "this."
 * to ensure they are resolved within the template's execution context.
 * It intelligently skips identifiers inside string literals and those already prefixed.
 *
 * @param {string} rawExpression - The input string containing identifiers.
 * @returns {string} The modified string with "this." prefixes where appropriate.
 */
function decorateScope(rawExpression) {
  if (!rawExpression || typeof rawExpression !== 'string') {
    return rawExpression; // Return as-is if not a valid string or empty.
  }

  let inStringLiteral = false; // State flag to track if inside a string (' or ")
  let cursorPosition = 0;      // Current position in the input string

  return rawExpression.replace(identifierPattern, (matchedIdentifier, matchStartIndex) => {
    // Iterate through the characters between the last match and the current one
    // to update the `inStringLiteral` state.
    for (; cursorPosition < matchStartIndex; cursorPosition++) {
      const char = rawExpression[cursorPosition];
      if (inStringLiteral === "'" || inStringLiteral === '"') {
        // If inside a string, check for its closing quote or an escaped character.
        if (char === inStringLiteral) {
          inStringLiteral = false; // Exited the string.
          continue;
        }
        if (char === "\\") {
          cursorPosition++; // Skip the next character as it's escaped.
          continue;
        }
        continue; // Still inside the string.
      }
      // If not inside a string, check if a new string literal starts.
      if (char === "'" || char === '"') {
        inStringLiteral = char; // Entered a new string literal.
        continue;
      }
    }

    // If currently inside a string literal or the identifier already starts with "this",
    // return the original match without modification.
    if (inStringLiteral || thisPrefixPattern.test(matchedIdentifier)) {
      return matchedIdentifier;
    }

    // Otherwise, prefix the identifier with "this.".
    return `this.${matchedIdentifier}`;
  });
}

/**
 * Creates a new execution block function that inherits its scope from a parent,
 * then extends it with local variables.
 *
 * @param {object} ancestorScope - The object to be used as the prototype for the new scope.
 * @param {Function} blockLogicFn - The function containing the block's logic.
 * @returns {Function} A new function that takes local variables and a callback.
 */
function createExecutionBlock(ancestorScope, blockLogicFn) {
  return function (localBindings, completionCallback) {
    // Create a new context that prototypically inherits from the ancestor.
    const executionContext = Object.create(ancestorScope);

    // If localBindings are provided, merge them into the new context.
    if (localBindings && typeof localBindings === 'object') {
      Object.assign(executionContext, localBindings);
    }
    // Execute the block logic function within the new context.
    return blockLogicFn.call(executionContext, completionCallback);
  };
}

/**
 * Manages the asynchronous execution of a template part and updates the overall state.
 *
 * @param {TemplateExecutionState} currentExecutionState - The state object for the current template instance.
 * @param {number} segmentIndex - The index in `resultSegments` where the result of this operation should be stored.
 * @param {Function} asyncOperation - The asynchronous function to execute.
 * @param {Array<any>} operationArguments - Arguments to pass to the asynchronous function.
 */
function processAsyncOperation(currentExecutionState, segmentIndex, asyncOperation, operationArguments) {
  const onOperationComplete = (error, operationResult) => {
    // If the template execution has already finished (e.g., due to an earlier error),
    // prevent further updates.
    if (currentExecutionState.isFinished) {
      return;
    }

    if (error) {
      currentExecutionState.isFinished = true; // Mark as finished due to error.
      return currentExecutionState.finalCallback(error); // Propagate the error.
    }

    // Store the result of this async part.
    currentExecutionState.resultSegments[segmentIndex] = operationResult;

    // Decrement the count of pending operations.
    currentExecutionState.pendingOperations--;

    // If all asynchronous operations are complete, join the parts and call the final callback.
    if (currentExecutionState.pendingOperations === 0) {
      currentExecutionState.finalCallback(null, currentExecutionState.resultSegments.join(""));
    }
  };

  // Add the completion callback to the arguments and invoke the async operation.
  asyncOperation.apply(this, [...operationArguments, onOperationComplete]);
}

/**
 * Represents the state of a single template instance during its asynchronous execution.
 *
 * @class TemplateExecutionState
 * @param {number} totalSegments - The total number of parts (static and dynamic) in the template.
 * @param {number} initialPendingOps - The initial count of asynchronous operations to wait for.
 * @param {Function} finalCompletionCallback - The callback to invoke when the template finishes.
 */
function TemplateExecutionState(totalSegments, initialPendingOps, finalCompletionCallback) {
  this.resultSegments = new Array(totalSegments); // Array to store computed template parts.
  this.pendingOperations = initialPendingOps;     // Counter for remaining async operations.
  this.isFinished = false;                         // Flag to indicate if execution has completed (or errored).
  this.finalCallback = finalCompletionCallback;    // The ultimate callback for the template result.
}

// Generate library code snippets needed for compiled templates.
const asyncLibCode = TemplateExecutionState.toString() + "\n\n" + processAsyncOperation.toString() + "\n";
const blockLibCode = createExecutionBlock.toString() + "\n";

// Cache and batch management for compiled templates.
const compiledTemplateCache = new Map(); // Stores compiled template functions.
const templateRequestBatch = new Map();  // Stores callbacks for templates currently being compiled.

/**
 * The main entry point for the templating engine.
 * Fetches, compiles, and caches templates.
 *
 * @param {string} templatePath - The identifier/path for the template.
 * @param {Function} completionHandler - Callback (err, compiledTemplateFunc).
 */
function TemplatingEngine(templatePath, completionHandler) {
  // Input validation.
  if (typeof templatePath !== 'string' || templatePath.length === 0) {
    return completionHandler(new TypeError("Template path must be a non-empty string."));
  }
  if (typeof completionHandler !== 'function') {
    return completionHandler(new TypeError("Completion handler must be a function."));
  }

  // 1. Check if the template is already in a hot cache.
  if (compiledTemplateCache.has(templatePath)) {
    completionHandler(null, compiledTemplateCache.get(templatePath));
    return;
  }

  // 2. Check if compilation is already in progress for this template.
  if (templateRequestBatch.has(templatePath)) {
    templateRequestBatch.get(templatePath).push(completionHandler);
    return;
  }

  // 3. Initiate a new compilation process.
  const currentBatch = [completionHandler];
  templateRequestBatch.set(templatePath, currentBatch);

  // Helper to handle the result of compilation.
  const handleCompilationResult = (error, compiledFunction) => {
    // If successful and caching is enabled, store the compiled function.
    if (!error && CoreModule.config.cacheDurationMs > 0) {
      compiledTemplateCache.set(templatePath, compiledFunction);
      // Set a timer to invalidate the cache entry.
      setTimeout(() => {
        compiledTemplateCache.delete(templatePath);
      }, CoreModule.config.cacheDurationMs);
    }

    // Clear the batch and notify all waiting callbacks.
    templateRequestBatch.delete(templatePath);
    for (const handler of currentBatch) {
      handler(error, compiledFunction);
    }
  };

  // Call the internal function to load and compile the template source.
  loadAndCompileTemplateSource(templatePath, handleCompilationResult);
}

/**
 * Loads the raw template source from a resource and then compiles it.
 *
 * @param {string} filePath - The path or identifier of the template file.
 * @param {Function} completionCb - The callback to receive the compiled template function.
 */
function loadAndCompileTemplateSource(filePath, completionCb) {
  CoreModule.resourceFetcher(filePath, (fetchError, templateSource) => {
    if (fetchError) {
      return completionCb(fetchError);
    }

    let compiledFunction;
    try {
      compiledFunction = compileTemplate(templateSource, filePath);
    } catch (compilationError) {
      return completionCb(compilationError);
    }
    completionCb(null, compiledFunction);
  });
}

/**
 * Compiles a raw template string into an executable JavaScript function.
 * This function orchestrates the lexical analysis, parsing, and code generation.
 *
 * @param {string} rawInputCode - The raw template string content.
 * @param {string} debugIdentifier - A name or path for debugging purposes (e.g., filename).
 * @returns {Function} An executable template function.
 */
function compileTemplate(rawInputCode, debugIdentifier) {
  const codeFragments = []; // Will store generated code blocks.
  const lexedUnits = analyzeSource(rawInputCode);
  const processedStructure = parseTokens(lexedUnits, rawInputCode, debugIdentifier);

  generateCode(processedStructure, codeFragments);

  let finalCodeString = '';
  // Construct the functions for each block.
  for (let i = 0; i < codeFragments.length; i++) {
    finalCodeString += `function block_${i}(completionCb) {\n${codeFragments[i]}\n}\n`;
  }

  // Include necessary library functions if required by the generated code.
  if (codeFragments.needsAsyncLib) {
    finalCodeString += `\n${asyncLibCode}`;
  }
  if (codeFragments.needsBlockLib) {
    finalCodeString += `\n${blockLibCode}`;
  }

  // Create and return the main template function.
  // It takes 'context' (locals) and 'callback' as arguments.
  return new Function("context", "callback",
    `"use strict";\n\n` +
    `// Entry point: Call the first block with the provided context.\n` +
    `block_0.call(context, callback);\n\n` +
    finalCodeString
  );
}

/**
 * Converts a token into a JavaScript string representation suitable for concatenation.
 * Handles both plain strings and dynamic expression tokens.
 *
 * @param {string|object} unit - The token (string literal or an object representing an expression).
 * @returns {string} A JavaScript string literal or an expression string.
 */
function formatTokenForOutput(unit) {
  if (typeof unit === "string") {
    // Escape string literals for safe embedding.
    return JSON.stringify(unit);
  }
  // For dynamic tokens, apply scope decoration.
  return `(${decorateScope(unit.expression)})`;
}

/**
 * Generates the JavaScript code for each template block based on the parsed token structure.
 * This function populates the `codeFragments` array with executable code.
 *
 * @param {Array<any>} parsedUnits - The array of tokens representing the template structure.
 * @param {Array<string>} codeFragments - An array to store the generated code for each block.
 *                                       Also used to track `needsAsyncLib` and `needsBlockLib`.
 */
function generateCode(parsedUnits, codeFragments) {
  // Filter out any empty or null segments that might result from parsing.
  const effectiveUnits = parsedUnits.filter(unit => !Array.isArray(unit) || unit[0] !== undefined);

  const unitCount = effectiveUnits.length;

  // Optimization: If the block contains only a single static string part,
  // directly generate a simple callback.
  if (unitCount === 1 && Array.isArray(effectiveUnits[0])) {
    codeFragments.push(`  completionCb(null, ${effectiveUnits[0].map(formatTokenForOutput).join(" + ")});`);
    return;
  }

  // Mark that this template will require the asynchronous library functions.
  codeFragments.needsAsyncLib = true;

  let asyncOperationCount = 0; // Tracks how many async operations are in this block.
  const currentBlockIndex = codeFragments.length;
  codeFragments.push(null); // Placeholder for the current block's generated code.

  const synchronousParts = []; // Statements for synchronous processing.
  const asynchronousParts = []; // Statements for asynchronous processing.

  for (let i = 0; i < unitCount; i++) {
    const currentUnit = effectiveUnits[i];

    if (Array.isArray(currentUnit)) {
      // This is a static text segment or an inline expression.
      synchronousParts.push(`currentExecutionState.resultSegments[${i}] = ${currentUnit.map(formatTokenForOutput).join(" + ")};`);
      continue;
    }

    // This is a dynamic tag (function call or block).
    if (currentUnit.expression || currentUnit.arguments !== undefined) {
      asyncOperationCount++;
      const callArguments = [];

      if (currentUnit.arguments !== undefined) {
        callArguments.push(decorateScope(currentUnit.arguments));
      }

      if (currentUnit.nestedContent) {
        // This is a block with nested content, so it needs a new sub-block function.
        codeFragments.needsBlockLib = true;
        const subBlockName = `block_${codeFragments.length}`;
        generateCode(currentUnit.nestedContent, codeFragments); // Recursively generate code for the sub-block.
        callArguments.push(`createExecutionBlock(this, ${subBlockName})`);
      }

      asynchronousParts.push(
        `processAsyncOperation.call(this, currentExecutionState, ${i}, ${decorateScope(currentUnit.expression)}, [${callArguments.join(", ")}]);`
      );
    }
  }

  // Assemble the full code for the current block.
  codeFragments[currentBlockIndex] =
    `  const currentExecutionState = new TemplateExecutionState(${unitCount}, ${asyncOperationCount}, completionCb);\n  ` +
    synchronousParts.concat(asynchronousParts).join("\n  ");
}

/**
 * Calculates the line and column position for an offset within a source string,
 * useful for error reporting.
 *
 * @param {string} sourceText - The full source string.
 * @param {number} charOffset - The character offset from the beginning of the source.
 * @param {string} fileRef - The filename or identifier for context.
 * @returns {string} Formatted string like "(filename:line:column)".
 */
function getSourcePosition(sourceText, charOffset, fileRef) {
  let currentLine = 1;
  let lastNewlineIndex = -1; // Position of the last newline character.

  // Iterate to find the line number and the start of the current line.
  for (let i = 0; i < charOffset; i++) {
    if (sourceText[i] === '\n') {
      currentLine++;
      lastNewlineIndex = i;
    }
  }

  const column = charOffset - lastNewlineIndex;
  return `(${fileRef}:${currentLine}:${column})`;
}

/**
 * Extracts the raw text representation of a token from the original source string.
 *
 * @param {string} sourceString - The complete source string.
 * @param {object} tokenDescriptor - An object with `start` and `end` properties.
 * @returns {string} The substring corresponding to the token.
 */
function extractTokenText(sourceString, tokenDescriptor) {
  if (!tokenDescriptor || typeof tokenDescriptor.start !== 'number' || typeof tokenDescriptor.end !== 'number') {
    return "[Invalid Token]";
  }
  return sourceString.substring(tokenDescriptor.start, tokenDescriptor.end);
}

/**
 * Parses a stream of lexed tokens into a structured representation, handling nested blocks.
 * It builds a tree-like structure where blocks contain their nested content.
 *
 * @param {Array<any>} lexedTokens - The flat array of tokens from the tokenizer.
 * @param {string} rawSource - The original template source for error reporting.
 * @param {string} sourceFile - The identifier of the source file.
 * @returns {Array<any>} A structured array of parsed template components.
 * @throws {Error} If there are mismatched or unclosed tags.
 */
function parseTokens(lexedTokens, rawSource, sourceFile) {
  const structuredParts = []; // The main output array, acting as a stack for current context.
  const blockStack = [];      // Stack to keep track of open block tags.
  let currentTextSegment = null; // Accumulates adjacent string literals and simple expressions.

  for (let i = 0; i < lexedTokens.length; i++) {
    const currentToken = lexedTokens[i];

    if (typeof currentToken === "string") {
      // Handle raw text. Remove leading newline if it follows a tag.
      const textToAdd = (currentToken[0] === "\n" && i > 0 && typeof lexedTokens[i-1] === 'object')
        ? currentToken.substring(1)
        : currentToken;

      if (currentTextSegment) {
        currentTextSegment.push(textToAdd);
      } else {
        // Start a new text segment array if none exists.
        currentTextSegment = [textToAdd];
        structuredParts.push(currentTextSegment);
      }
      continue; // Move to the next token.
    }

    // If it's a structured token (object), reset the current text segment.
    currentTextSegment = null;

    if (currentToken.isOpeningTag) {
      // This token opens a new block.
      currentToken.parentContainer = structuredParts; // Keep reference to parent for stack manipulation.
      structuredParts.push(currentToken);             // Add the block token itself.
      currentToken.nestedContent = [];                // Initialize array for its children.
      structuredParts = currentToken.nestedContent;   // Switch context to parse children of this block.
      blockStack.push(currentToken);                  // Push onto the block stack.
    } else if (currentToken.isClosingTag) {
      // This token closes a block.
      if (blockStack.length === 0) {
        throw new Error(`Unexpected closing tag '${extractTokenText(rawSource, currentToken)}' at ${getSourcePosition(rawSource, currentToken.start, sourceFile)}`);
      }
      const topOfStack = blockStack.pop();

      // Validate that the closing tag matches the last open tag.
      if (topOfStack.expression !== currentToken.expression) {
        throw new Error(
          `Mismatched closing tag: Expected '${topOfStack.expression}' to close '${extractTokenText(rawSource, topOfStack)}' but found '${extractTokenText(rawSource, currentToken)}' ` +
          getSourcePosition(rawSource, currentToken.start, sourceFile)
        );
      }
      structuredParts = topOfStack.parentContainer; // Revert context to the parent.
      delete topOfStack.parentContainer; // Clean up temporary reference.
      delete currentToken.isOpeningTag;  // Clean up temporary flag.
    } else {
      // This is a simple dynamic expression (not a block start/end).
      if (currentTextSegment) {
        currentTextSegment.push(currentToken); // Add to current text segment if accumulating.
      } else {
        structuredParts.push(currentToken); // Otherwise, add as a standalone item.
      }
    }
  }

  // After processing all tokens, check for any unclosed blocks.
  if (blockStack.length > 0) {
    const unclosedTag = blockStack.pop();
    throw new Error(
      `Unclosed template block: Expected closing tag for '${extractTokenText(rawSource, unclosedTag)}' at ` +
      getSourcePosition(rawSource, unclosedTag.start, sourceFile) + ` but reached end of file.`
    );
  }

  return structuredParts;
}

/**
 * Lexes the input source string, breaking it down into a flat array of tokens.
 * Tokens can be raw strings or objects representing template tags.
 *
 * @param {string} rawSourceInput - The raw template string to tokenize.
 * @returns {Array<string|object>} A flat array of lexed tokens.
 */
function analyzeSource(rawSourceInput) {
  const tokenList = [];
  let currentParsePosition = 0;
  const regexForTags = CoreModule.config.templateTagPattern; // Use the global regex.
  regexForTags.lastIndex = 0; // Reset regex state for fresh execution.

  let foundMatch;
  while ((foundMatch = regexForTags.exec(rawSourceInput)) !== null) {
    const matchStartIdx = foundMatch.index;
    const fullMatchText = foundMatch[0];

    // If there's raw text before the current tag, add it as a string token.
    if (matchStartIdx > currentParsePosition) {
      tokenList.push(rawSourceInput.substring(currentParsePosition, matchStartIdx));
    }
    currentParsePosition = matchStartIdx + fullMatchText.length;

    // Create a descriptor object for the current tag.
    const tagDescriptor = {
      start: matchStartIdx,
      end: currentParsePosition
    };

    // Determine the type of tag based on its opening characters.
    const firstChar = fullMatchText[1]; // Character after the initial '{'

    if (firstChar === "{") { // Raw expression: {{...}}
      tagDescriptor.expression = fullMatchText.substring(2, fullMatchText.length - 2);
    } else if (firstChar === "#") { // Opening block tag: {#tag ...}
      tagDescriptor.isOpeningTag = true;
      // Check for arguments within parentheses.
      const parenStart = fullMatchText.indexOf("(");
      if (parenStart !== -1 && fullMatchText[fullMatchText.length - 2] === ")") {
        tagDescriptor.expression = fullMatchText.substring(2, parenStart);
        tagDescriptor.arguments = fullMatchText.substring(parenStart + 1, fullMatchText.length - 3);
      } else {
        tagDescriptor.expression = fullMatchText.substring(2, fullMatchText.length - 1);
      }
    } else if (firstChar === "/") { // Closing block tag: {/tag}
      tagDescriptor.isClosingTag = true;
      tagDescriptor.expression = fullMatchText.substring(2, fullMatchText.length - 1);
    } else { // Regular tag (function call): {tag ...}
      // Check for arguments within parentheses.
      const parenStart = fullMatchText.indexOf("(");
      if (parenStart !== -1 && fullMatchText[fullMatchText.length - 2] === ")") {
        tagDescriptor.expression = fullMatchText.substring(1, parenStart);
        tagDescriptor.arguments = fullMatchText.substring(parenStart + 1, fullMatchText.length - 3);
      } else {
        tagDescriptor.expression = fullMatchText.substring(1, fullMatchText.length - 1);
      }
    }
    tokenList.push(tagDescriptor);
  }

  // Add any remaining raw text after the last tag.
  if (rawSourceInput.length > currentParsePosition) {
    tokenList.push(rawSourceInput.substring(currentParsePosition));
  }

  return tokenList;
}

return TemplatingEngine;

});