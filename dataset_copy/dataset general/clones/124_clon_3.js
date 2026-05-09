!function(moduleFactory){
  // Check if running in a CommonJS environment (e.g., Node.js)
  if (typeof exports === "object" && typeof module === "object") {
    module.exports = moduleFactory();
  } 
  // Check if running in an AMD environment (e.g., RequireJS)
  else if (typeof define === "function" && define.amd) {
    define(moduleFactory);
  } 
  // Otherwise, assume a plain browser environment
  else {
    let globalScope;
    // Determine the global object (window, global, or self)
    if (typeof window !== "undefined") {
      globalScope = window;
    } else if (typeof global !== "undefined") {
      globalScope = global;
    } else if (typeof self !== "undefined") {
      globalScope = self;
    }
    // Attach the module output to a specific property on the global object
    globalScope.YASQE = moduleFactory();
  }
}(function(){
  // Internal variables for the module bundler, mimicking CommonJS/AMD
  let localDefine, localModule, localExports;

  // This is a simplified CommonJS-like module bundling function.
  // It takes module definitions, a cache, and entry points.
  return (function bundleRequire(moduleDefinitions, moduleCache, entryPoints){
    // Helper function to obtain a module by its identifier
    function obtainModule(requestedId, noLoad){
      // If the module is not in the cache, attempt to load it
      if (!moduleCache[requestedId]){
        if (!moduleDefinitions[requestedId]){
          // If the module definition is missing, try a global require
          let aliasReq = typeof require === "function" && require;
          if (!noLoad && aliasReq) return aliasReq(requestedId, true);
          let cachedReq; // This variable is not used after this point, can be removed but kept for structural similarity.
          if (cachedReq) return cachedReq(requestedId, true);
          // If all attempts fail, throw an error
          throw new Error("Cannot locate module with ID: '" + requestedId + "'");
        }
        // Create a new module object and store it in the cache
        let moduleObject = moduleCache[requestedId] = {exports:{}};
        // Execute the module's definition function
        moduleDefinitions[requestedId][0].call(
          moduleObject.exports,
          function(dependencyId){
            let resolvedDependency = moduleDefinitions[requestedId][1][dependencyId];
            return obtainModule(resolvedDependency ? resolvedDependency : dependencyId);
          },
          moduleObject,
          moduleObject.exports,
          bundleRequire,
          moduleDefinitions,
          moduleCache,
          entryPoints
        );
      }
      // Return the cached module's exports
      return moduleCache[requestedId].exports;
    }
    let cachedReq = typeof require === "function" && require; // Similar to above, this variable is redundant.
    // Process all entry points
    for(let entryIdx = 0; entryIdx < entryPoints.length; entryIdx++){
      obtainModule(entryPoints[entryIdx]);
    }
    return obtainModule; // The bundler returns its internal require function.
  })({1:[function(reqFn, localModule, localExports){
    /*
      This utility is an adaptation of the 'deparam' functionality
      originally found in Ben Alman's jQuery BBQ plugin.
      See: http://benalman.com/projects/jquery-bbq-plugin/
      It facilitates parsing URL query strings into JavaScript objects.
    */
    const jqUtil = reqFn("jquery");

    // Extend jQuery with the deparam function
    jqUtil.deparam = function(inputQueryString, applyTypeCoercion) {
      let parsedResult = {};
      
      // Define a mapping for boolean and null string values
      const typeMap = { 'true': true, 'false': false, 'null': null };

      // Pre-process the query string: replace '+' with spaces and split by '&'
      const paramPairs = inputQueryString.replace(/\+/g, ' ').split('&');

      // Iterate over each 'name=value' pair in the query string
      paramPairs.forEach(function(paramPair) {
        let pairParts = paramPair.split('=');
        let currentKey = decodeURIComponent(pairParts[0]);
        let currentValue;
        let currentPointer = parsedResult;
        let loopIndex = 0;
        
        // Split the key into segments if it represents a complex structure (e.g., 'a[b][c]')
        let keySegments = currentKey.split('][');
        let lastSegmentIndex = keySegments.length - 1;

        // Check for balanced square brackets to determine if it's an array/object notation
        const hasOpeningBracket = keySegments[0].includes('[');
        const hasClosingBracket = keySegments[lastSegmentIndex].endsWith(']');

        if (hasOpeningBracket && hasClosingBracket) {
          // If balanced, remove the trailing ']' from the last segment
          keySegments[lastSegmentIndex] = keySegments[lastSegmentIndex].slice(0, -1);
          
          // Split the first segment by '[' and prepend to the rest of the segments
          keySegments = keySegments[0].split('[').concat(keySegments.slice(1));
          
          lastSegmentIndex = keySegments.length - 1;
        } else {
          // For simple keys (e.g., 'foo'), the key itself is the only segment
          lastSegmentIndex = 0;
        }
        
        // Check if a value was explicitly provided (i.e., 'name=value' vs 'name')
        if (pairParts.length === 2) {
          currentValue = decodeURIComponent(pairParts[1]);
          
          // Apply type coercion if enabled
          if (applyTypeCoercion) {
            // Helper function for coercion logic
            const performCoercion = (val) => {
              if (val && !isNaN(Number(val))) return Number(val); // Numeric values
              if (val === 'undefined') return undefined;         // 'undefined' string
              if (typeMap[val] !== undefined) return typeMap[val]; // 'true', 'false', 'null' strings
              return val;                                        // Default to string
            };
            currentValue = performCoercion(currentValue);
          }
          
          // Handle complex keys (nested objects/arrays)
          if (lastSegmentIndex > 0) {
            // Traverse or build the object structure based on key segments
            for (; loopIndex <= lastSegmentIndex; loopIndex++) {
              currentKey = keySegments[loopIndex] === '' ? currentPointer.length : keySegments[loopIndex];
              
              // If not the last segment, ensure the next level exists (object or array)
              if (loopIndex < lastSegmentIndex) {
                if (currentPointer[currentKey] === undefined) {
                  // Determine if the next segment implies an array (numeric index) or object
                  const nextSegmentIsNumeric = keySegments[loopIndex + 1] && !isNaN(Number(keySegments[loopIndex + 1]));
                  currentPointer[currentKey] = nextSegmentIsNumeric ? [] : {};
                }
                currentPointer = currentPointer[currentKey]; // Move the pointer to the next level
              } else {
                // At the last segment, assign the final value
                currentPointer[currentKey] = currentValue;
              }
            }
          } else {
            // Handle simple scalar or shallow array keys
            if (jqUtil.isArray(parsedResult[currentKey])) {
              // If the key already holds an array, push the new value
              parsedResult[currentKey].push(currentValue);
              
            } else if (parsedResult[currentKey] !== undefined) {
              // If the key exists but isn't an array, convert it to an array
              parsedResult[currentKey] = [parsedResult[currentKey], currentValue];
              
            } else {
              // Otherwise, assign the value directly
              parsedResult[currentKey] = currentValue;
            }
          }
          
        } else if (currentKey) {
          // If no value was defined (e.g., 'name'), set a default based on coercion setting
          parsedResult[currentKey] = applyTypeCoercion ? undefined : '';
        }
      });
      
      return parsedResult;
    };

  },{"jquery":9}],2:[function(reqFn, localModule, localExports){
    // CodeMirror mode definition wrapper
    (function(modeInitializer) {
      // CommonJS environment detection
      if (typeof exports === "object" && typeof localModule === "object") {
        modeInitializer(reqFn("codemirror"));
      } 
      // AMD environment detection
      else if (typeof define === "function" && define.amd) {
        define(["codemirror"], modeInitializer);
      } 
      // Browser global environment
      else {
        modeInitializer(CodeMirror); // Assumes CodeMirror is globally available
      }
    })(function(cmInstance) {
      "use strict";
      
      // Define the SPARQL 1.1 mode for CodeMirror
      cmInstance.defineMode("sparql11", function(modeConfiguration, languageParserSettings) {
        
        // Extract indentation unit from configuration
        const initialIndentSize = modeConfiguration.indentUnit;
        
        // This 'sparqlGrammarTable' is automatically generated from the SPARQL grammar.
        // It should not be modified manually to ensure correct parsing behavior.
        // %%%table%%%
        const sparqlGrammarTable = {
          "*[&&,valueLogical]" : {
             "&&": ["[&&,valueLogical]","*[&&,valueLogical]"], 
             "AS": [], 
             ")": [], 
             ",": [], 
             "||": [], 
             ";": []}, 
          "*[,,expression]" : {
             ",": ["[,,expression]","*[,,expression]"], 
             ")": []}, 
          "*[,,objectPath]" : {
             ",": ["[,,objectPath]","*[,,objectPath]"], 
             ".": [], 
             ";": [], 
             "]": [], 
             "{": [], 
             "OPTIONAL": [], 
             "MINUS": [], 
             "GRAPH": [], 
             "SERVICE": [], 
             "FILTER": [], 
             "BIND": [], 
             "VALUES": [], 
             "}": []}, 
          "*[,,object]" : {
             ",": ["[,,object]","*[,,object]"], 
             ".": [], 
             ";": [], 
             "]": [], 
             "}": [], 
             "GRAPH": [], 
             "{": [], 
             "OPTIONAL": [], 
             "MINUS": [], 
             "SERVICE": [], 
             "FILTER": [], 
             "BIND": [], 
             "VALUES": []}, 
          "*[/,pathEltOrInverse]" : {
             "/": ["[/,pathEltOrInverse]","*[/,pathEltOrInverse]"], 
             "|": [], 
             ")": [], 
             "(": [], 
             "[": [], 
             "VAR1": [], 
             "VAR2": [], 
             "NIL": [], 
             "IRI_REF": [], 
             "TRUE": [], 
             "FALSE": [], 
             "BLANK_NODE_LABEL": [], 
             "ANON": [], 
             "PNAME_LN": [], 
             "PNAME_NS": [], 
             "STRING_LITERAL1": [], 
             "STRING_LITERAL2": [], 
             "STRING_LITERAL_LONG1": [], 
             "STRING_LITERAL_LONG2": [], 
             "INTEGER": [], 
             "DECIMAL": [], 
             "DOUBLE": [], 
             "INTEGER_POSITIVE": [], 
             "DECIMAL_POSITIVE": [], 
             "DOUBLE_POSITIVE": [], 
             "INTEGER_NEGATIVE": [], 
             "DECIMAL_NEGATIVE": [], 
             "DOUBLE_NEGATIVE": []}, 
          "*[;,?[or([verbPath,verbSimple]),objectList]]" : {
             ";": ["[;,?[or([verbPath,verbSimple]),objectList]]","*[;,?[or([verbPath,verbSimple]),objectList]]"], 
             ".": [], 
             "]": [], 
             "{": [], 
             "OPTIONAL": [], 
             "MINUS": [], 
             "GRAPH": [], 
             "SERVICE": [], 
             "FILTER": [], 
             "BIND": [], 
             "VALUES": [], 
             "}": []}, 
          "*[;,?[verb,objectList]]" : {
             ";": ["[;,?[verb,objectList]]","*[;,?[verb,objectList]]"], 
             ".": [], 
             "]": [], 
             "}": [], 
             "GRAPH": [], 
             "{": [], 
             "OPTIONAL": [], 
             "MINUS": [], 
             "SERVICE": [], 
             "FILTER": [], 
             "BIND": [], 
             "VALUES": []}, 
          "*[UNION,groupGraphPattern]" : {
             "UNION": ["[UNION,groupGraphPattern]","*[UNION,groupGraphPattern]"], 
             "VAR1": [], 
             "VAR2": [], 
             "NIL": [], 
             "(": [], 
             "[": [], 
             "IRI_REF": [], 
             "TRUE": [], 
             "FALSE": [], 
             "BLANK_NODE_LABEL": [], 
             "ANON": [], 
             "PNAME_LN": [], 
             "PNAME_NS": [], 
             "STRING_LITERAL1": [], 
             "STRING_LITERAL2": [], 
             "STRING_LITERAL_LONG1": [], 
             "STRING_LITERAL_LONG2": [], 
             "INTEGER": [], 
             "DECIMAL": [], 
             "DOUBLE": [], 
             "INTEGER_POSITIVE": [], 
             "DECIMAL_POSITIVE": [], 
             "DOUBLE_POSITIVE": [], 
             "INTEGER_NEGATIVE": [], 
             "DECIMAL_NEGATIVE": [], 
             "DOUBLE_NEGATIVE": [], 
             ".": [], 
             "{": [], 
             "OPTIONAL": [], 
             "MINUS": [], 
             "GRAPH": [], 
             "SERVICE": [], 
             "FILTER": [], 
             "BIND": [], 
             "VALUES": [], 
             "}": []}, 
          "*[graphPatternNotTriples,?.,?triplesBlock]" : {
             "{": ["[graphPatternNotTriples,?.,?triplesBlock]","*[graphPatternNotTriples,?.,?triplesBlock]"], 
             "OPTIONAL": ["[graphPatternNotTriples,?.,?triplesBlock]","*[graphPatternNotTriples,?.,?triplesBlock]"], 
             "MINUS": ["[graphPatternNotTriples,?.,?triplesBlock]","*[graphPatternNotTriples,?.,?triplesBlock]"], 
             "GRAPH": ["[graphPatternNotTriples,?.,?triplesBlock]","*[graphPatternNotTriples,?.,?triplesBlock]"], 
             "SERVICE": ["[graphPatternNotTriples,?.,?triplesBlock]","*[graphPatternNotTriples,?.,?triplesBlock]"], 
             "FILTER": ["[graphPatternNotTriples,?.,?triplesBlock]","*[graphPatternNotTriples,?.,?triplesBlock]"], 
             "BIND": ["[graphPatternNotTriples,?.,?triplesBlock]","*[graphPatternNotTriples,?.,?triplesBlock]"], 
             "VALUES": ["[graphPatternNotTriples,?.,?triplesBlock]","*[graphPatternNotTriples,?.,?triplesBlock]"], 
             "}": []}, 
          "*[quadsNotTriples,?.,?triplesTemplate]" : {
             "GRAPH": ["[quadsNotTriples,?.,?triplesTemplate]","*[quadsNotTriples,?.,?triplesTemplate]"], 
             "}": []}, 
          "*[|,pathOneInPropertySet]" : {
             "|": ["[|,pathOneInPropertySet]","*[|,pathOneInPropertySet]"], 
             ")": []}, 
          "*[|,pathSequence]" : {
             "|": ["[|,pathSequence]","*[|,pathSequence]"], 
             ")": [], 
             "(": [], 
             "[": [], 
             "VAR1": [], 
             "VAR2": [], 
             "NIL": [], 
             "IRI_REF": [], 
             "TRUE": [], 
             "FALSE": [], 
             "BLANK_NODE_LABEL": [], 
             "ANON": [], 
             "PNAME_LN": [], 
             "PNAME_NS": [], 
             "STRING_LITERAL1": [], 
             "STRING_LITERAL2": [], 
             "STRING_LITERAL_LONG1": [], 
             "STRING_LITERAL_LONG2": [], 
             "INTEGER": [], 
             "DECIMAL": [], 
             "DOUBLE": [], 
             "INTEGER_POSITIVE": [], 
             "DECIMAL_POSITIVE": [], 
             "DOUBLE_POSITIVE": [], 
             "INTEGER_NEGATIVE": [], 
             "DECIMAL_NEGATIVE": [], 
             "DOUBLE_NEGATIVE": []}, 
          "*[||,conditionalAndExpression]" : {
             "||": ["[||,conditionalAndExpression]","*[||,conditionalAndExpression]"], 
             "AS": [], 
             ")": [], 
             ",": [], 
             ";": []}, 
          "*dataBlockValue" : {
             "UNDEF": ["dataBlockValue","*dataBlockValue"], 
             "IRI_REF": ["dataBlockValue","*dataBlockValue"], 
             "TRUE": ["dataBlockValue","*dataBlockValue"], 
             "FALSE": ["dataBlockValue","*dataBlockValue"], 
             "PNAME_LN": ["dataBlockValue","*dataBlockValue"], 
             "PNAME_NS": ["dataBlockValue","*dataBlockValue"], 
             "STRING_LITERAL1": ["dataBlockValue","*dataBlockValue"], 
             "STRING_LITERAL2": ["dataBlockValue","*dataBlockValue"], 
             "STRING_LITERAL_LONG1": ["dataBlockValue","*dataBlockValue"], 
             "STRING_LITERAL_LONG2": ["dataBlockValue","*dataBlockValue"], 
             "INTEGER": ["dataBlockValue","*dataBlockValue"], 
             "DECIMAL": ["dataBlockValue","*dataBlockValue"], 
             "DOUBLE": ["dataBlockValue","*dataBlockValue"], 
             "INTEGER_POSITIVE": ["dataBlockValue","*dataBlockValue"], 
             "DECIMAL_POSITIVE": ["dataBlockValue","*dataBlockValue"], 
             "DOUBLE_POSITIVE": ["dataBlockValue","*dataBlockValue"], 
             "INTEGER_NEGATIVE": ["dataBlockValue","*dataBlockValue"], 
             "DECIMAL_NEGATIVE": ["dataBlockValue","*dataBlockValue"], 
             "DOUBLE_NEGATIVE": ["dataBlockValue","*dataBlockValue"], 
             "}": [], 
             ")": []}, 
          "*datasetClause" : {
             "FROM": ["datasetClause","*datasetClause"], 
             "WHERE": [], 
             "{": []}, 
          "*describeDatasetClause" : {
             "FROM": ["describeDatasetClause","*describeDatasetClause"], 
             "ORDER": [], 
             "HAVING": [], 
             "GROUP": [], 
             "LIMIT": [], 
             "OFFSET": [], 
             "WHERE": [], 
             "{": [], 
             "VALUES": [], 
             "$": []}, 
          "*graphNode" : {
             "(": ["graphNode","*graphNode"], 
             "[": ["graphNode","*graphNode"], 
             "VAR1": ["graphNode","*graphNode"], 
             "VAR2": ["graphNode","*graphNode"], 
             "NIL": ["graphNode","*graphNode"], 
             "IRI_REF": ["graphNode","*graphNode"], 
             "TRUE": ["graphNode","*graphNode"], 
             "FALSE": ["graphNode","*graphNode"], 
             "BLANK_NODE_LABEL": ["graphNode","*graphNode"], 
             "ANON": ["graphNode","*graphNode"], 
             "PNAME_LN": ["graphNode","*graphNode"], 
             "PNAME_NS": ["graphNode","*graphNode"], 
             "STRING_LITERAL1": ["graphNode","*graphNode"], 
             "STRING_LITERAL2": ["graphNode","*graphNode"], 
             "STRING_LITERAL_LONG1": ["graphNode","*graphNode"], 
             "STRING_LITERAL_LONG2": ["graphNode","*graphNode"], 
             "INTEGER": ["graphNode","*graphNode"], 
             "DECIMAL": ["graphNode","*graphNode"], 
             "DOUBLE": ["graphNode","*graphNode"], 
             "INTEGER_POSITIVE": ["graphNode","*graphNode"], 
             "DECIMAL_POSITIVE": ["graphNode","*graphNode"], 
             "DOUBLE_POSITIVE": ["graphNode","*graphNode"], 
             "INTEGER_NEGATIVE": ["graphNode","*graphNode"], 
             "DECIMAL_NEGATIVE": ["graphNode","*graphNode"], 
             "DOUBLE_NEGATIVE": ["graphNode","*graphNode"], 
             ")": []}, 
          "*graphNodePath" : {
             "(": ["graphNodePath","*graphNodePath"], 
             "[": ["graphNodePath","*graphNodePath"], 
             "VAR1": ["graphNodePath","*graphNodePath"], 
             "VAR2": ["graphNodePath","*graphNodePath"], 
             "NIL": ["graphNodePath","*graphNodePath"], 
             "IRI_REF": ["graphNodePath","*graphNodePath"], 
             "TRUE": ["graphNodePath","*graphNodePath"], 
             "FALSE": ["graphNodePath","*graphNodePath"], 
             "BLANK_NODE_LABEL": ["graphNodePath","*graphNodePath"], 
             "ANON": ["graphNodePath","*graphNodePath"], 
             "PNAME_LN": ["graphNodePath","*graphNodePath"], 
             "PNAME_NS": ["graphNodePath","*graphNodePath"], 
             "STRING_LITERAL1": ["graphNodePath","*graphNodePath"], 
             "STRING_LITERAL2": ["graphNodePath","*graphNodePath"], 
             "STRING_LITERAL_LONG1": ["graphNodePath","*graphNodePath"], 
             "STRING_LITERAL_LONG2": ["graphNodePath","*graphNodePath"], 
             "INTEGER": ["graphNodePath","*graphNodePath"], 
             "DECIMAL": ["graphNodePath","*graphNodePath"], 
             "DOUBLE": ["graphNodePath","*graphNodePath"], 
             "INTEGER_POSITIVE": ["graphNodePath","*graphNodePath"], 
             "DECIMAL_POSITIVE": ["graphNodePath","*graphNodePath"], 
             "DOUBLE_POSITIVE": ["graphNodePath","*graphNodePath"], 
             "INTEGER_NEGATIVE": ["graphNodePath","*graphNodePath"], 
             "DECIMAL_NEGATIVE": ["graphNodePath","*graphNodePath"], 
             "DOUBLE_NEGATIVE": ["graphNodePath","*graphNodePath"], 
             ")": []}, 
          "*groupCondition" : {
             "(": ["groupCondition","*groupCondition"], 
             "STR": ["groupCondition","*groupCondition"], 
             "LANG": ["groupCondition","*groupCondition"], 
             "LANGMATCHES": ["groupCondition","*groupCondition"], 
             "DATATYPE": ["groupCondition","*groupCondition"], 
             "BOUND": ["groupCondition","*groupCondition"], 
             "IRI": ["groupCondition","*groupCondition"], 
             "URI": ["groupCondition","*groupCondition"], 
             "BNODE": ["groupCondition","*groupCondition"], 
             "RAND": ["groupCondition","*groupCondition"], 
             "ABS": ["groupCondition","*groupCondition"], 
             "CEIL": ["groupCondition","*groupCondition"], 
             "FLOOR": ["groupCondition","*groupCondition"], 
             "ROUND": ["groupCondition","*groupCondition"], 
             "CONCAT": ["groupCondition","*groupCondition"], 
             "STRLEN": ["groupCondition","*groupCondition"], 
             "UCASE": ["groupCondition","*groupCondition"], 
             "LCASE": ["groupCondition","*groupCondition"], 
             "ENCODE_FOR_URI": ["groupCondition","*groupCondition"], 
             "CONTAINS": ["groupCondition","*groupCondition"], 
             "STRSTARTS": ["groupCondition","*groupCondition"], 
             "STRENDS": ["groupCondition","*groupCondition"], 
             "STRBEFORE": ["groupCondition","*groupCondition"], 
             "STRAFTER": ["groupCondition","*groupCondition"], 
             "YEAR": ["groupCondition","*groupCondition"], 
             "MONTH": ["groupCondition","*groupCondition"], 
             "DAY": ["groupCondition","*groupCondition"], 
             "HOURS": ["groupCondition","*groupCondition"], 
             "MINUTES": ["groupCondition","*groupCondition"], 
             "SECONDS": ["groupCondition","*groupCondition"], 
             "TIMEZONE": ["groupCondition","*groupCondition"], 
             "TZ": ["groupCondition","*groupCondition"], 
             "NOW": ["groupCondition","*groupCondition"], 
             "UUID": ["groupCondition","*groupCondition"], 
             "STRUUID": ["groupCondition","*groupCondition"], 
             "MD5": ["groupCondition","*groupCondition"], 
             "SHA1": ["groupCondition","*groupCondition"], 
             "SHA256": ["groupCondition","*groupCondition"], 
             "SHA384": ["groupCondition","*groupCondition"], 
             "SHA512": ["groupCondition","*groupCondition"], 
             "COALESCE": ["groupCondition","*groupCondition"], 
             "IF": ["groupCondition","*groupCondition"], 
             "STRLANG": ["groupCondition","*groupCondition"], 
             "STRDT": ["groupCondition","*groupCondition"], 
             "SAMETERM": ["groupCondition","*groupCondition"], 
             "ISIRI": ["groupCondition","*groupCondition"], 
             "ISURI": ["groupCondition","*groupCondition"], 
             "ISBLANK": ["groupCondition","*groupCondition"], 
             "ISLITERAL": ["groupCondition","*groupCondition"], 
             "ISNUMERIC": ["groupCondition","*groupCondition"], 
             "VAR1": ["groupCondition","*groupCondition"], 
             "VAR2": ["groupCondition","*groupCondition"], 
             "SUBSTR": ["groupCondition","*groupCondition"], 
             "REPLACE": ["groupCondition","*groupCondition"], 
             "REGEX": ["groupCondition","*groupCondition"], 
             "EXISTS": ["groupCondition","*groupCondition"], 
             "NOT": ["groupCondition","*groupCondition"], 
             "IRI_REF": ["groupCondition","*groupCondition"], 
             "PNAME_LN": ["groupCondition","*groupCondition"], 
             "PNAME_NS": ["groupCondition","*groupCondition"], 
             "VALUES": [], 
             "LIMIT": [], 
             "OFFSET": [], 
             "ORDER": [], 
             "HAVING": [], 
             "$": [], 
             "}": []}, 
          "*havingCondition" : {
             "(": ["havingCondition","*havingCondition"], 
             "STR": ["havingCondition","*havingCondition"], 
             "LANG": ["havingCondition","*havingCondition"], 
             "LANGMATCHES": ["havingCondition","*havingCondition"], 
             "DATATYPE": ["havingCondition","*havingCondition"], 
             "BOUND": ["havingCondition","*havingCondition"], 
             "IRI": ["havingCondition","*havingCondition"], 
             "URI": ["havingCondition","*havingCondition"], 
             "BNODE": ["havingCondition","*havingCondition"], 
             "RAND": ["havingCondition","*havingCondition"], 
             "ABS": ["havingCondition","*havingCondition"], 
             "CEIL": ["havingCondition","*havingCondition"], 
             "FLOOR": ["havingCondition","*havingCondition"], 
             "ROUND": ["havingCondition","*havingCondition"], 
             "CONCAT": ["havingCondition","*havingCondition"], 
             "STRLEN": ["havingCondition","*havingCondition"], 
             "UCASE": ["havingCondition","*havingCondition"], 
             "LCASE": ["havingCondition","*havingCondition"], 
             "ENCODE_FOR_URI": ["havingCondition","*havingCondition"], 
             "CONTAINS": ["havingCondition","*havingCondition"], 
             "STRSTARTS": ["havingCondition","*havingCondition"], 
             "STRENDS": ["havingCondition","*havingCondition"], 
             "STRBEFORE": ["havingCondition","*havingCondition"], 
             "STRAFTER": ["havingCondition","*havingCondition"], 
             "YEAR": ["havingCondition","*havingCondition"], 
             "MONTH": ["havingCondition","*havingCondition"], 
             "DAY": ["havingCondition","*havingCondition"], 
             "HOURS": ["havingCondition","*havingCondition"], 
             "MINUTES": ["havingCondition","*havingCondition"], 
             "SECONDS": ["havingCondition","*havingCondition"], 
             "TIMEZONE": ["havingCondition","*havingCondition"], 
             "TZ": ["havingCondition","*havingCondition"], 
             "NOW": ["havingCondition","*havingCondition"], 
             "UUID": ["havingCondition","*havingCondition"], 
             "STRUUID": ["havingCondition","*havingCondition"], 
             "MD5": ["havingCondition","*havingCondition"], 
             "SHA1": ["havingCondition","*havingCondition"], 
             "SHA256": ["havingCondition","*havingCondition"], 
             "SHA384": ["havingCondition","*havingCondition"], 
             "SHA512": ["havingCondition","*havingCondition"], 
             "COALESCE": ["havingCondition","*havingCondition"], 
             "IF": ["havingCondition","*havingCondition"],