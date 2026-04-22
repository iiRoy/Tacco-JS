(function (globalScope, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    globalScope.TemplateRenderer = factory();
  }
}(this, function () {
  "use strict";

  // Environment detection
  const isServerEnvironment = typeof process !== "undefined" && process.versions && process.versions.node;

  // Global storage for block definitions created during code emission
  let globalBlockDefinitions = [];

  // Helper to adjust variable names to reference the data context
  function scopeAdjuster(inputExpression) {
    let adjustedExpression = '';
    let inString = false;
    let stringDelimiter = '';
    let i = 0;

    while (i < inputExpression.length) {
      const char = inputExpression[i];

      if (inString) {
        adjustedExpression += char;
        if (char === '\\') { // Handle escaped characters within strings
          i++;
          if (i < inputExpression.length) adjustedExpression += inputExpression[i];
        } else if (char === stringDelimiter) {
          inString = false;
          stringDelimiter = '';
        }
      } else {
        if (char === "'" || char === '"' || char === '`') {
          inString = true;
          stringDelimiter = char;
          adjustedExpression += char;
        } else if (/[_$a-zA-Z]/.test(char)) { // Start of an identifier
          let identifierSegment = char;
          let j = i + 1;
          while (j < inputExpression.length && /[_$a-zA-Z0-9]/.test(inputExpression[j])) {
            identifierSegment += inputExpression[j];
            j++;
          }

          let fullIdentifier = identifierSegment;

          // Handle property access (e.g., 'foo.bar')
          while (j < inputExpression.length && inputExpression[j] === '.') {
            let k = j + 1;
            let propertySegment = '';
            while (k < inputExpression.length && /[_$a-zA-Z0-9]/.test(inputExpression[k])) {
              propertySegment += inputExpression[k];
              k++;
            }
            if (propertySegment.length > 0) { // Found a valid property
              fullIdentifier += '.' + propertySegment;
              j = k;
            } else { // Trailing dot or invalid property character, stop here
              break;
            }
          }

          // Prefix with 'dataContext.' if not already a 'this' reference
          if (!fullIdentifier.startsWith('this.') && !fullIdentifier.startsWith('this[')) {
            adjustedExpression += 'dataContext.' + fullIdentifier;
          } else {
            adjustedExpression += fullIdentifier;
          }
          i = j - 1; // Move index to the end of the full identifier or property chain
        } else { // Other characters (operators, whitespace, etc.)
          adjustedExpression += char;
        }
      }
      i++;
    }
    return adjustedExpression;
  }

  // Helper to create a new block that inherits from parent context, returning an async function
  function nestedScopeBuilder(parentContext, childFunction) {
    return async function(locals, callback) {
      const childContext = Object.create(parentContext);
      for (const prop in locals) {
        if (Object.prototype.hasOwnProperty.call(locals, prop)) {
          childContext[prop] = locals[prop];
        }
      }
      try {
        // The childFunction is expected to be an async function itself, taking (dataContext, callback)
        await childFunction.call(childContext, childContext, callback);
      } catch (err) {
        callback(err);
      }
    };
  }

  // Helper to locate error position in source
  function locateErrorPosition(sourceText, offset, originIdentifier) {
    let line = 0;
    let currentPos = 0;
    let lastNewline = 0;
    for (currentPos = 0; currentPos < offset; currentPos++) {
      if (sourceText[currentPos] === '\n') {
        line++;
        lastNewline = currentPos;
      }
    }
    return `(${originIdentifier}:${line + 1}:${offset - lastNewline})`;
  }

  // Helper to extract a segment of the source text
  function extractSourceSegment(sourceText, token) {
    return sourceText.substring(token.start, token.end);
  }

  // Provides template source content based on environment
  let sourceProvider;
  if (isServerEnvironment) {
    const fsPromises = require('fs').promises;
    sourceProvider = async function(artifactName) {
      return fsPromises.readFile(artifactName, 'utf8');
    };
  } else {
    sourceProvider = async function(artifactName) {
      return new Promise((resolve, reject) => {
        const scriptElement = document.querySelector(`script[data-template-id="${artifactName}"]`);
        if (!scriptElement) {
          return reject(new Error(`Template with id '${artifactName}' not found in DOM.`));
        }
        resolve(scriptElement.textContent);
      });
    };
  }

  // Lexical Analysis: Converts source string into a stream of tokens
  function lexicalAnalyzer(sourceText) {
    const tokens = [];
    let currentPosition = 0;
    let state = 'TEXT';
    let buffer = '';
    let tagStart = -1;
    let parenCount = 0;
    let tagName = '';
    let tagArgs = '';
    let tagKind = ''; // 'expression', 'block_open', 'block_close', 'variable_or_function'

    while (currentPosition < sourceText.length) {
      const char = sourceText[currentPosition];
      const nextChar = sourceText[currentPosition + 1];

      switch (state) {
        case 'TEXT':
          if (char === '{' && nextChar === '{') {
            if (buffer.length > 0) {
              tokens.push({ type: 'text', value: buffer });
              buffer = '';
            }
            currentPosition++; // Skip first '{'
            state = 'IN_TAG_EXPRESSION';
            tagStart = currentPosition;
          } else if (char === '{' && (nextChar === '#' || nextChar === '/' || /[a-zA-Z_$]/.test(nextChar))) {
            if (buffer.length > 0) {
              tokens.push({ type: 'text', value: buffer });
              buffer = '';
            }
            state = 'IN_TAG_START'; // Generic tag start
            tagStart = currentPosition;
          } else {
            buffer += char;
          }
          break;

        case 'IN_TAG_EXPRESSION':
          if (char === '}' && nextChar === '}') {
            tokens.push({ type: 'expression', content: buffer.trim(), start: tagStart, end: currentPosition + 1 });
            buffer = '';
            currentPosition++; // Skip second '}'
            state = 'TEXT';
          } else {
            buffer += char;
          }
          break;

        case 'IN_TAG_START': // For {#, {/, {name
          if (char === '#' || char === '/') {
            tagKind = (char === '#') ? 'block_open' : 'block_close';
            currentPosition++; // Consume # or /
            tagName = '';
            tagArgs = '';
            parenCount = 0;
            state = 'READ_TAG_NAME';
          } else if (/[a-zA-Z_$]/.test(char)) {
            tagKind = 'variable_or_function';
            tagName = char;
            tagArgs = '';
            parenCount = 0;
            state = 'READ_TAG_NAME';
          } else {
            // Not a tag, treat the '{' as literal text
            tokens.push({ type: 'text', value: '{' });
            currentPosition = tagStart + 1; // Re-process from where we thought a tag started
            state = 'TEXT';
            buffer = '';
            continue;
          }
          break;

        case 'READ_TAG_NAME':
          if (char === '(' && tagKind !== 'block_close') { // Arguments start
            state = 'READ_TAG_ARGS';
            parenCount = 1; // We've seen one opening paren
          } else if (char === '}') { // End of tag
            tokens.push({ type: tagKind, name: tagName.trim(), args: tagArgs.trim() || undefined, start: tagStart, end: currentPosition });
            tagName = '';
            tagArgs = '';
            state = 'TEXT';
          } else if (/\s/.test(char) && tagName.length > 0 && tagKind !== 'block_close') { // Whitespace after name, before args or end
            // Append to name, trim later.
            tagName += char;
          } else if (/[a-zA-Z0-9_$ .]/.test(char)) { // Valid character for name or property access
            tagName += char;
          } else {
            throw new Error(`Unexpected character '${char}' in tag name at ${locateErrorPosition(sourceText, currentPosition, 'tokenizer')}`);
          }
          break;

        case 'READ_TAG_ARGS':
          if (char === '(') {
            parenCount++;
            tagArgs += char;
          } else if (char === ')') {
            parenCount--;
            if (parenCount === 0) { // End of arguments
              state = 'EXPECT_TAG_CLOSE';
            } else {
              tagArgs += char;
            }
          } else {
            tagArgs += char;
          }
          break;

        case 'EXPECT_TAG_CLOSE': // After args, expecting '}'
          if (char === '}') {
            tokens.push({ type: tagKind, name: tagName.trim(), args: tagArgs.trim(), start: tagStart, end: currentPosition });
            tagName = '';
            tagArgs = '';
            state = 'TEXT';
          } else {
            throw new Error(`Expected '}' after tag arguments at ${locateErrorPosition(sourceText, currentPosition, 'tokenizer')}`);
          }
          break;
      }
      currentPosition++;
    }

    if (buffer.length > 0) {
      tokens.push({ type: 'text', value: buffer });
    }

    // Handle unclosed tags
    if (state !== 'TEXT') {
      throw new Error(`Unclosed tag starting at ${locateErrorPosition(sourceText, tagStart, 'tokenizer')} to end of file.`);
    }

    return tokens;
  }

  // Syntactic Construction: Builds an AST from tokens using recursive descent
  function syntacticConstructor(inputTokens, sourceText, originIdentifier) {
    let tokenIndex = 0;

    function parseBlock(parentBlock) {
      const blockNodes = [];
      while (tokenIndex < inputTokens.length) {
        const token = inputTokens[tokenIndex];

        if (token.type === 'block_close') {
          if (!parentBlock || parentBlock.name !== token.name) {
            throw new Error(`Mismatched closing tag for '${parentBlock ? parentBlock.name : 'root'}' at ${locateErrorPosition(sourceText, token.start, originIdentifier)}. Found '${token.name}'.`);
          }
          tokenIndex++; // Consume closing token
          return blockNodes;
        } else if (token.type === 'block_open') {
          tokenIndex++; // Consume opening token
          const nestedBlock = {
            type: 'block',
            name: token.name,
            args: token.args,
            children: parseBlock(token), // Recursive call
            start: token.start,
            end: token.end // Will be updated by its closing tag's end
          };
          // After parseBlock returns, tokenIndex is at the closing tag of the nested block.
          // The closing tag is consumed by the recursive call.
          // Update the end of the nested block to its closing tag's end.
          if (inputTokens[tokenIndex - 1] && inputTokens[tokenIndex - 1].type === 'block_close') {
            nestedBlock.end = inputTokens[tokenIndex - 1].end;
          }
          blockNodes.push(nestedBlock);
        } else {
          blockNodes.push(token);
          tokenIndex++;
        }
      }
      if (parentBlock) {
        throw new Error(`Unclosed block '${parentBlock.name}' starting at ${locateErrorPosition(sourceText, parentBlock.start, originIdentifier)}.`);
      }
      return blockNodes;
    }

    return parseBlock(null); // Start parsing from the root
  }

  // Code Emission: Generates JavaScript code from the AST, using async/await
  function codeEmittor(abstractSyntaxTree, currentLevel = 0) {
    const emittedCodeLines = [];
    let requiresNestedScopeUtility = false;
    let partIndex = 0; // To track part indices for array assignments

    function processNode(node) {
      if (node.type === 'text') {
        emittedCodeLines.push(`outputParts[${partIndex++}] = ${JSON.stringify(node.value)};`);
      } else if (node.type === 'expression') {
        emittedCodeLines.push(`outputParts[${partIndex++}] = String((${scopeAdjuster(node.content)}));`);
      } else if (node.type === 'variable_or_function') {
        const fnCall = node.args ? `${scopeAdjuster(node.name)}(${scopeAdjuster(node.args)})` : scopeAdjuster(node.name);
        emittedCodeLines.push(`outputParts[${partIndex++}] = await (${fnCall});`);
      } else if (node.type === 'block') {
        requiresNestedScopeUtility = true;
        const childBlockEmission = codeEmittor(node.children, currentLevel + 1);
        const blockIdentifier = `block_${currentLevel}_${node.name}_${Math.random().toString(36).substr(2, 5)}`;
        
        // Define the child block function in the global definitions array
        globalBlockDefinitions.push(`const ${blockIdentifier} = nestedScopeBuilder(this, async (dataContext, cb) => {\n  const outputParts = new Array(${childBlockEmission.maxPartIndex});\n  try {\n    ${childBlockEmission.code.join('\n    ')}\n    cb(null, outputParts.join(''));\n  } catch (err) {\n    cb(err);\n  }\n});`);
        
        const args = node.args ? `${scopeAdjuster(node.args)}` : '';
        emittedCodeLines.push(`outputParts[${partIndex++}] = await ${scopeAdjuster(node.name)}(${args}, ${blockIdentifier});`);
      }
    }

    // Reset global definitions for the root level call
    if (currentLevel === 0) {
      globalBlockDefinitions = [];
    }

    abstractSyntaxTree.forEach(processNode);

    return {
      code: emittedCodeLines,
      requiresNestedScopeUtility: requiresNestedScopeUtility,
      maxPartIndex: partIndex
    };
  }

  // Transpiles source text into an executable template function
  async function transpileArtifact(sourceText, originIdentifier) {
    const tokenStream = lexicalAnalyzer(sourceText);
    const abstractSyntaxTree = syntacticConstructor(tokenStream, sourceText, originIdentifier);

    globalBlockDefinitions = []; // Reset for each new compilation

    const generated = codeEmittor(abstractSyntaxTree);
    const generatedCodeLines = generated.code;

    let finalFunctionBody = `'use strict';\n\n`;

    // Append block definitions collected during emission
    finalFunctionBody += globalBlockDefinitions.join('\n') + '\n\n';

    finalFunctionBody += `return async function(dataContext, completionCallback) {\n`;
    finalFunctionBody += `  const outputParts = new Array(${generated.maxPartIndex});\n`;
    finalFunctionBody += `  try {\n`;
    finalFunctionBody += `    ${generatedCodeLines.join('\n    ')}\n`;
    finalFunctionBody += `    completionCallback(null, outputParts.join(''));\n`;
    finalFunctionBody += `  } catch (err) {\n`;
    finalFunctionBody += `    completionCallback(err);\n`;
    finalFunctionBody += `  }\n`;
    finalFunctionBody += `};\n`;

    const newFunctionArguments = [];
    const newFunctionValues = [];

    if (generated.requiresNestedScopeUtility) {
      newFunctionArguments.push('nestedScopeBuilder');
      newFunctionValues.push(nestedScopeBuilder);
    }

    // Create a factory function to produce the actual template rendering function
    const templateFactory = new Function(...newFunctionArguments, finalFunctionBody);

    // Call the factory function to get the runnable template function
    return templateFactory(...newFunctionValues);
  }

  // Caching and batching mechanism for template compilation
  const compilationCache = new Map();
  const pendingCompilation = new Map();

  const TemplateRenderer = function(artifactName, completionCallback) {
    if (typeof artifactName !== 'string') {
      throw new Error("First argument to TemplateRenderer must be an artifact name (string).");
    }
    if (typeof completionCallback !== 'function') {
      throw new Error("Second argument to TemplateRenderer must be a completion callback (function).");
    }

    // Check cache for hot entries
    if (compilationCache.has(artifactName)) {
      const cachedEntry = compilationCache.get(artifactName);
      if (Date.now() < cachedEntry.expiry) {
        completionCallback(null, cachedEntry.templateFn);
        return;
      } else {
        compilationCache.delete(artifactName); // Expired entry
      }
    }

    // Check for pending compilation requests and join them
    if (pendingCompilation.has(artifactName)) {
      pendingCompilation.get(artifactName).then(
        (templateFn) => completionCallback(null, templateFn),
        (error) => completionCallback(error)
      );
      return;
    }

    // Start a new compilation process
    const compilationPromise = processArtifactFromFile(artifactName);
    pendingCompilation.set(artifactName, compilationPromise);

    compilationPromise.then(templateFn => {
      // Cache the result if an expiration duration is set
      if (TemplateRenderer.artifactExpirationDuration > 0) {
        compilationCache.set(artifactName, {
          templateFn: templateFn,
          expiry: Date.now() + TemplateRenderer.artifactExpirationDuration
        });
      }
      pendingCompilation.delete(artifactName); // Remove from pending
      completionCallback(null, templateFn); // Fulfill current request
    }).catch(error => {
      pendingCompilation.delete(artifactName); // Clear pending on error
      completionCallback(error);
    });
  };

  // Loads a file from disk/DOM and compiles it
  async function processArtifactFromFile(artifactName) {
    let sourceContent;
    try {
      sourceContent = await TemplateRenderer.sourceProvider(artifactName);
    } catch (err) {
      throw new Error(`Failed to load artifact '${artifactName}': ${err.message}`);
    }

    try {
      const compiledFunction = await transpileArtifact(sourceContent, artifactName);
      return compiledFunction;
    } catch (err) {
      throw new Error(`Failed to transpile artifact '${artifactName}': ${err.message}`);
    }
  }

  // Expose public interface
  TemplateRenderer.sourceProvider = sourceProvider;
  TemplateRenderer.artifactExpirationDuration = 1000;
  TemplateRenderer.lexicalAnalyzer = lexicalAnalyzer;
  TemplateRenderer.syntacticConstructor = syntacticConstructor;
  TemplateRenderer.codeEmittor = codeEmittor;
  TemplateRenderer.transpileArtifact = transpileArtifact;
  TemplateRenderer.scopeAdjuster = scopeAdjuster;

  return TemplateRenderer;
}));