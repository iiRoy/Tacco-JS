/*
Licensed under the Apache License, Version 2.0 (the "License");
You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
This software is provided "as is" without warranty of any kind.
*/

/*
 * Module: DataPathEvaluator
 * Purpose: A robust utility for querying JavaScript objects and arrays using a path-like syntax.
 * Inspired by JSONPath and enhanced with additional capabilities for filtering, sorting, and transformations.
 *
 * Key Features:
 * - Property access: `.field`, `['field']`
 * - Array indexing and slicing: `[0]`, `[0:5:2]`
 * - Filtering collections: `[?expression]`
 * - Unique filtering: `[^?expression]`
 * - Sorting collections: `[/field]`, `[\field]`
 * - Mapping/Transforming items: `[=expression]`
 * - Recursive descent: `..field`, `..[?expression]`
 * - Wildcard property access: `.*`, `[*]`
 * - Union operator: `[prop1, prop2]`
 * - Advanced expressions: logical, arithmetic, comparison operators, string wildcards (`*`, `?`).
 *
 * Execution Modes:
 * 1. Immediate evaluation: `DataPathEvaluator(pathString, targetObject)` returns the result directly.
 * 2. Deferred evaluation: `evaluatorFn = DataPathEvaluator(pathString)` returns a function,
 *    `evaluatorFn(targetObject)` then yields the result.
 */

(function(){
  /**
   * Transforms elements of an array using a provided function.
   * @param {Array<any>} inputCollection The array to iterate over.
   * @param {Function} transformationFn The function to apply to each element.
   * @param {Object} [contextObject] The 'this' context for the transformationFn.
   * @returns {Array<any>} A new array with transformed elements.
   */
  function arrayTransform(inputCollection, transformationFn /*, contextObject*/){
    const collectionLength = inputCollection ? inputCollection.length : 0;
    if (typeof transformationFn !== "function") {
      throw new Error("Transformation must be a callable procedure.");
    }

    const transformedItems = [];
    const contextObject = arguments[2];

    for (let idx = 0; idx < collectionLength; ++idx) {
      if (idx in inputCollection) { // Handles sparse arrays
        transformedItems.push(transformationFn.call(contextObject, inputCollection[idx], idx, inputCollection));
      }
    }
    return transformedItems;
  }

  /**
   * Filters elements of an array based on a predicate function.
   * @param {Array<any>} inputCollection The array to filter.
   * @param {Function} predicateFn The function to test each element.
   * @param {Object} [contextObject] The 'this' context for the predicateFn.
   * @returns {Array<any>} A new array containing only elements that pass the predicate.
   */
  function arraySelect(inputCollection, predicateFn /*, contextObject*/){
    const collectionLength = inputCollection ? inputCollection.length : 0;
    if (typeof predicateFn !== "function") {
      throw new Error("Selection criteria must be a callable procedure.");
    }

    const filteredItems = [];
    const contextObject = arguments[2];

    for (let idx = 0; idx < collectionLength; ++idx) {
      if (idx in inputCollection) { // Handles sparse arrays
        const currentItem = inputCollection[idx];
        if (predicateFn.call(contextObject, currentItem, idx, inputCollection)) {
          filteredItems.push(currentItem);
        }
      }
    }
    return filteredItems;
  }

  /**
   * Extracts a sub-array (slice) from a given array-like object.
   * @param {Array<any>} sourceArray The array-like object to slice.
   * @param {number} startIndex The starting index (inclusive).
   * @param {number} endIndex The ending index (exclusive).
   * @param {number} stepValue The step increment.
   * @returns {Array<any>} A new array containing the sliced elements.
   */
  function subArray(sourceArray, startIndex, endIndex, stepValue){
    if (!Array.isArray(sourceArray) && !sourceArray.length) {
      return []; // Not an array or empty, no slice possible.
    }
    const collectionLength = sourceArray.length;
    const resultSlice = [];

    // Sanitize and normalize indices
    let actualStart = (startIndex < 0) ? Math.max(0, startIndex + collectionLength) : Math.min(collectionLength, startIndex);
    let actualEnd = (endIndex === undefined || endIndex === null) ? collectionLength : (endIndex < 0) ? Math.max(0, endIndex + collectionLength) : Math.min(collectionLength, endIndex);
    let currentStep = stepValue || 1;

    if (currentStep === 0) {
      throw new Error("Step value for slicing cannot be zero.");
    }
    if (currentStep > 0) {
      for (let idx = actualStart; idx < actualEnd; idx += currentStep) {
        resultSlice.push(sourceArray[idx]);
      }
    } else { // Negative step, slice backwards
      actualStart = (startIndex === undefined || startIndex === null) ? collectionLength - 1 : (startIndex < 0) ? Math.max(-1, startIndex + collectionLength) : Math.min(collectionLength -1, startIndex);
      actualEnd = (endIndex === undefined || endIndex === null) ? -1 : (endIndex < 0) ? Math.max(-1, endIndex + collectionLength) : Math.min(collectionLength -1, endIndex);
      for (let idx = actualStart; idx > actualEnd; idx += currentStep) {
        resultSlice.push(sourceArray[idx]);
      }
    }
    return resultSlice;
  }

  /**
   * Performs a recursive search within an object/array structure.
   * @param {any} inputData The data structure to traverse.
   * @param {string|Array<number|string>|boolean} searchKey The property name to find,
   *   `true` for recursive object values, or an array of indices/properties for union.
   * @returns {Array<any>} An array of found values.
   */
  function recursiveSearch(inputData, searchKey){
    const foundValues = [];

    /**
     * Internal recursive traversal logic.
     * @param {any} currentElement The current element being examined.
     */
    function traverseObject(currentElement){
      if (currentElement === null || typeof currentElement !== 'object') {
        return; // Skip primitives and null
      }

      if (searchKey !== undefined) {
        if (searchKey === true && typeof currentElement === 'object' && !Array.isArray(currentElement)) {
          // Recursive object search without specific key (for '..*' or '..[?expr]')
          foundValues.push(currentElement);
        } else if (currentElement.hasOwnProperty(searchKey) && searchKey !== true) {
          // Found the specific property
          foundValues.push(currentElement[searchKey]);
        }
      }

      // Iterate over properties/elements
      for (const prop in currentElement) {
        if (Object.prototype.hasOwnProperty.call(currentElement, prop)) {
          const propValue = currentElement[prop];
          if (searchKey === undefined) {
            // No specific key, just collect all property values (for '.*' or '[*]')
            foundValues.push(propValue);
          } else if (propValue !== null && typeof propValue === 'object') {
            // Continue recursion for child objects/arrays
            traverseObject(propValue);
          }
        }
      }
    }

    if (Array.isArray(searchKey)) {
      // This path is for union operator: [prop1, prop2]
      if (searchKey.length === 0) return [];
      if (searchKey.length === 1) return [inputData[searchKey[0]]]; // Optimization for single item
      for (let idx = 0; idx < searchKey.length; ++idx) {
        if (inputData.hasOwnProperty(searchKey[idx])) {
          foundValues.push(inputData[searchKey[idx]]);
        }
      }
    } else {
      // Standard recursive search or property collection
      traverseObject(inputData);
    }
    return foundValues;
  }

  /**
   * Filters an array and ensures that all resulting elements are unique.
   * Handles both primitive values and object references.
   * @param {Array<any>} sourceArray The array to filter and deduplicate.
   * @param {Function} predicateFn The function to test each element.
   * @returns {Array<any>} A new array with unique, filtered elements.
   */
  function uniqueSelect(sourceArray, predicateFn){
    const uniqueResults = [];
    const seenPrimitivesMap = {};
    const objectMarker = "_processed_unique_"; // Internal marker for objects

    for(let idx = 0, len = sourceArray.length; idx < len; ++idx){
      const currentElement = sourceArray[idx];
      if(predicateFn(currentElement, idx, sourceArray)){
        if(typeof currentElement === 'object' && currentElement !== null){
          // For objects, use a temporary marker property
          if(!currentElement[objectMarker]){
            currentElement[objectMarker] = true;
            uniqueResults.push(currentElement);
          }
        } else {
          // For primitives, use a map to track uniqueness
          const primitiveKey = String(currentElement) + typeof currentElement;
          if(!seenPrimitivesMap[primitiveKey]){
            seenPrimitivesMap[primitiveKey] = true;
            uniqueResults.push(currentElement);
          }
        }
      }
    }

    // Clean up the temporary marker from objects
    for(let idx = 0, len = uniqueResults.length; idx < len; ++idx){
      const item = uniqueResults[idx];
      if(typeof item === 'object' && item !== null && item[objectMarker]){
        delete item[objectMarker];
      }
    }
    return uniqueResults;
  }

  // --- Main DataPathEvaluator logic ---
  const DataPathEvaluator = function(/*string*/pathExpression,/*object?*/targetData){
    // Internal storage for string literals extracted during parsing.
    const literalStore = [];
    // Current bracket nesting level.
    let nestingLevel = 0;
    // Accumulator for function call prefixes during expression transformation.
    let callChain = '';

    /**
     * Wraps the current expression with a function call.
     * @param {string} funcName The name of the helper function to call.
     */
    function wrapWithCall(funcName){
      callChain = funcName + "(" + callChain;
    }

    /**
     * Generates a regular expression for string comparisons with wildcards.
     * @param {string} fullMatch The entire matched string from regex.
     * @param {string} varRef The variable reference (e.g., "$item.prop").
     * @param {string} _ignored Ignored second group.
     * @param {string} operator The comparison operator ("==" or "~").
     * @param {number} literalIndex Index into `literalStore` for the string.
     * @returns {string} A JavaScript regex test expression.
     */
    function createDynamicRegex(fullMatch, varRef, _ignored, operator, literalIndex){
      const literalString = literalStore[literalIndex];
      // Check for wildcards or case-insensitive operator
      if (literalString.includes('*') || literalString.includes('?') || operator === '~') {
        // Remove quotes, escape regex special chars, convert wildcards
        const regexPattern = literalString.substring(1, literalString.length - 1)
                                      .replace(/\\([btnfr\\"'])|([^\w\*\?])/g, "\\$1$2")
                                      .replace(/([\*\?])/g, ".$1"); // Convert * to .*, ? to .?
        const flags = (operator === '~') ? 'i' : ''; // Case-insensitive flag
        return `(new RegExp("^${regexPattern}$", "${flags}")).test(${varRef})`;
      }
      return fullMatch; // No wildcards or case-insensitivity, return original for direct comparison
    }

    // Pre-process the path expression:
    // 1. Replace string literals with placeholders.
    // 2. Mark inner brackets to prevent premature splitting.
    let processedPath = pathExpression.replace(/"(\\.|[^"\\])*"|'(\\.|[^'\\])*'|[\[\]]/g,function(tokenPiece){
      // Track bracket nesting to distinguish array access from query brackets
      nestingLevel += (tokenPiece === '[') ? 1 : (tokenPiece === ']') ? -1 : 0;
      if (tokenPiece === ']' && nestingLevel > 0) {
        return '`BRK_END`'; // Placeholder for inner bracket ends
      } else if (tokenPiece.charAt(0) === '"' || tokenPiece.charAt(0) === "'") {
        return "`STR_LITERAL" + (literalStore.push(tokenPiece) - 1) + "`"; // Placeholder for string literals
      }
      return tokenPiece; // Return other tokens as-is
    });

    // Guard against unsafe function calls (e.g., modifying arrays directly)
    const dangerousCalls = /(\]|\)|push|pop|shift|splice|sort|reverse|concat)\s*\(/;
    if (dangerousCalls.test(processedPath)) {
      throw new Error("Potential unsafe function call detected in path expression.");
    }

    // Transform path parts into executable JavaScript
    processedPath = processedPath
      // Convert single '=' to '==' for comparison, unless it's part of '>=' or '<=' or '!='
      .replace(/([^<>=!]=)([^=])/g, "$1=$2")
      // Map '@' to current item ref, and bare identifiers to properties of current item ref
      .replace(/@|(\.\s*)?[a-zA-Z_$][a-zA-Z0-9_$]*(\s*:)?/g, function(matchToken){
        if (matchToken.charAt(0) === '.') {
          return matchToken; // Already a property access, leave it
        }
        if (matchToken === '@') {
          return "$item"; // Current item reference in lambda
        }
        // If it's a keyword or label, leave it, otherwise prepend with current item ref
        if (matchToken.match(/:|^(\$|Math|true|false|null|undefined)$/)) {
          return matchToken;
        }
        return "$item." + matchToken;
      })
      // Process complex operators like filters, sorts, slices, and recursive searches
      .replace(/\.?\.?\[(`BRK_END`|[^\]])*\]|\?.*|\.\.([a-zA-Z_$][a-zA-Z0-9_$]*)|(\.\*|\[\s*\*\s*\])/g,function(opToken, bracketContent, recursiveProp, wildcardAll){
        // --- Filter / Map Operators ---
        let operatorMatch = opToken.match(/^\.?\.?(\[\s*\^?\?|^\??|\[\s*==)(.*?)`BRK_END`?$/);
        if(operatorMatch){
          let currentPrefix = '';
          if(opToken.startsWith("..")){ // Recursive filter/map
            wrapWithCall("recursiveSearch");
            currentPrefix = ",true)"; // Special flag for recursive objects
          }
          wrapWithCall(operatorMatch[1].includes('==') ? "arrayTransform" : operatorMatch[1].includes('^') ? "uniqueSelect" : "arraySelect");
          return currentPrefix + ",function($item){return " + operatorMatch[2] + "})";
        }

        // --- Sort Operator ---
        operatorMatch = opToken.match(/^\[\s*([\/\\].*)`BRK_END`$/);
        if(operatorMatch){
          // Make a shallow copy and then sort
          return ".concat().sort(function(a,b){" + operatorMatch[1].replace(/\s*,?\s*([\/\\])\s*([^,\\\/]+)/g,function(_sortMatch, direction, sortExpr){
              const sortExprA = sortExpr.replace(/\$item/g,"a");
              const sortExprB = sortExpr.replace(/\$item/g,"b");
              return `var valA = ${sortExprA}, valB = ${sortExprB};\n` +
                     `if(valA > valB || valB === null){ return ${ (direction === '/') ? 1 : -1 }; }\n` +
                     `if(valB > valA || valA === null){ return ${ (direction === '/') ? -1 : 1 }; }\n` +
                     `return 0;\n`; // If equal
          }) + "})";
        }

        // --- Slice Operator ---
        operatorMatch = opToken.match(/^\[(-?[0-9]*):(-?[0-9]*):?(-?[0-9]*)`BRK_END`$/);
        if(operatorMatch){
          wrapWithCall("subArray");
          return "," + (operatorMatch[1] || 0) + "," + (operatorMatch[2] || 0) + "," + (operatorMatch[3] || 1) + ")";
        }

        // --- Recursive Property, Wildcard All, or Union ---
        if(opToken.startsWith("..") || wildcardAll || opToken.includes(',')){
          wrapWithCall("recursiveSearch");
          if (recursiveProp) { // ..propName
              return ",'" + recursiveProp + "')";
          } else if (opToken.includes(',')) { // [prop1,prop2] union
              // Extract property names, handle string literal placeholders
              const unionProps = opToken.slice(1, -1).split(',').map(s => {
                  const cleaned = s.trim();
                  if (cleaned.startsWith('`STR_LITERAL')) {
                      const idx = parseInt(cleaned.slice(12, -1));
                      return literalStore[idx].slice(1, -1); // Get raw string value
                  }
                  return cleaned;
              });
              return ",[" + unionProps.map(p => `'${p}'`).join(',') + "])";
          } else { // .* or [*]
              return ",undefined)"; // `undefined` indicates collect all properties
          }
        }
        return opToken; // Should not be reached for recognized operators
      })
      // Handle string comparisons with wildcards (== or ~ operator)
      .replace(/(\$item\s*(\.\s*[\w_$]+\s*)*)(==|~)\s*`STR_LITERAL([0-9]+)`/g, createDynamicRegex)
      // Handle reverse order comparison for string literals (e.g. `STR_LITERAL` == $item.prop)
      .replace(/`STR_LITERAL([0-9]+)`\s*(==|~)\s*(\$item(\s*\.\s*[\w_$]+)*)/g,function(match, literalIdx, op, varRef){
        return createDynamicRegex(match, varRef, null, op, literalIdx);
      });

    // Final assembly: prepend function call chain, ensure starts with root, restore strings/brackets
    const finalExpression = callChain + (processedPath.charAt(0) === '$' ? "" : "$") + processedPath.replace(/`STR_LITERAL([0-9]+)`|`BRK_END`/g,function(match, literalIndex){
      return (match === '`BRK_END`') ? ']' : literalStore[parseInt(literalIndex)];
    });

    // Compile the expression into an executable function
    // The `_` prefix for arguments is to avoid conflicts with user-defined $1..$9 in queries.
    const compiledEvaluator = new Function('$', '$1', '$2', '$3', '$4', '$5', '$6', '$7', '$8', '$9',
      `var $item = $; return ${finalExpression}`);

    // If a targetData is provided, execute immediately; otherwise, return the compiled function.
    if(targetData !== undefined){
      // Shift arguments to correctly pass $1..$9 to the compiled function
      const executionArgs = [targetData];
      for(let k = 1; k < arguments.length; ++k){
        executionArgs.push(arguments[k]);
      }
      return compiledEvaluator.apply(this, executionArgs);
    } else {
      return compiledEvaluator;
    }
  };

  // Export the DataPathEvaluator, preferring a global assignment if no module system is present.
  if(typeof window !== 'undefined' && typeof window.define === 'function' && window.define.amd){
    // AMD support
    window.define('DataPathEvaluator', [], function() { return DataPathEvaluator; });
  }
  else if (typeof module !== 'undefined' && module.exports) {
    // CommonJS support
    module.exports = DataPathEvaluator;
  }
  else {
    // Global scope (browser or simple script)
    window["DataPathEvaluator"] = DataPathEvaluator;
  }
})();