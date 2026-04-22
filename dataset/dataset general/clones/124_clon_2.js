!function(moduleFactory){
  if(typeof module.exports === "object") {
    // CommonJS environment: assign the module factory's output to module.exports.
    module.exports = moduleFactory();
  } else if (typeof define === "function" && define.amd) {
    // AMD environment: define the module using the factory.
    define(moduleFactory);
  } else {
    // Browser global environment: attach the module's output to a global object.
    let globalExportTarget;
    if (typeof window !== "undefined") {
      globalExportTarget = window;
    } else if (typeof global !== "undefined") {
      globalExportTarget = global;
    } else if (typeof self !== "undefined") {
      globalExportTarget = self;
    }
    globalExportTarget.SPARQL_EDITOR = moduleFactory();
  }
}(function(){
  // Local variables for module definition (e.g., for Browserify's internal workings).
  let localDefine, localModule, localExports;
  
  // This is a self-executing function that implements a simplified module loader (like Browserify).
  // It handles module definitions, caching, and resolution.
  return (function bundleRequire(moduleDefinitions, loadedModules, entryPoints){
    /**
     * Resolves and loads a module by its identifier.
     * @param {string} moduleIdentifier - The unique ID of the module to resolve.
     * @param {boolean} isSilent - If true, suppresses errors for external requires.
     * @returns {*} The exports of the resolved module.
     */
    function resolveModule(moduleIdentifier, isSilent){
      if(!loadedModules[moduleIdentifier]){
        if(!moduleDefinitions[moduleIdentifier]){
          // If the module is not found in the bundle, try a system-wide require (e.g., Node.js).
          let systemRequire = typeof require === "function" && require;
          if(!isSilent && systemRequire) return systemRequire(moduleIdentifier, true);
          if(cachedSystemRequire) return cachedSystemRequire(moduleIdentifier, true);
          throw new Error("Could not find required module '" + moduleIdentifier + "'");
        }
        // Initialize module container and execute its factory function.
        let moduleContainer = loadedModules[moduleIdentifier] = { exports: {} };
        moduleDefinitions[moduleIdentifier][0].call(
          moduleContainer.exports,
          function(depId){
            // Custom require function for dependencies within the bundle.
            let depPath = moduleDefinitions[moduleIdentifier][1][depId];
            return resolveModule(depPath ? depPath : depId);
          },
          moduleContainer,
          moduleContainer.exports,
          bundleRequire,
          moduleDefinitions,
          loadedModules,
          entryPoints
        );
      }
      return loadedModules[moduleIdentifier].exports;
    }
    
    // Cache the global `require` function if available.
    let cachedSystemRequire = typeof require === "function" && require;
    
    // Load all specified entry points.
    for(let i = 0; i < entryPoints.length; i++) {
      resolveModule(entryPoints[i]);
    }
    
    // Return the exports of the primary entry point.
    return resolveModule(entryPoints[0]);
  })({
    1:[function(_dependencyResolver_, currentModuleContext, moduleExportsOutput){
      /*
        This JavaScript segment extracts and adapts the `deparam` method
        originally found in Ben Alman's jQuery BBQ plugin.
        More information can be found at: http://benalman.com/projects/jquery-bbq-plugin/
      */
      const externalJQuery = _dependencyResolver_("jqueryLib");
      
      // Extend the jQuery utility object with a new function to parse query strings into an object.
      externalJQuery.parseQueryString = function (inputQueryString, enableTypeCoercion) {
        let constructedResult = {};
        
        // Define a mapping for common string-to-type coercions.
        const coercionMapping = {
          'true': true,
          'false': false,
          'null': null
        };
        
        // Iterate over each 'name=value' pair obtained by splitting the query string.
        // Plus signs are converted to spaces, as per URL encoding standards for form data.
        externalJQuery.each(inputQueryString.replace(/\+/g, ' ').split('&'), function (entryIndex, pairSegment) {
          let keyValuePair = pairSegment.split('='),
              decodedSegmentKey = decodeURIComponent(keyValuePair[0]),
              parsedValue,
              currentObjectPath = constructedResult,
              iterationCount = 0,
              
              // If the key suggests a nested structure (e.g., 'a[b][c]'), split it into components.
              keyPathComponents = decodedSegmentKey.split(']['),
              finalPathComponentIndex = keyPathComponents.length - 1;
          
          // Check for and correct bracket imbalances in complex key paths.
          if (decodedSegmentKey.includes('[') && keyPathComponents[finalPathComponentIndex].endsWith(']')) {
            // Remove the closing bracket from the last component.
            keyPathComponents[finalPathComponentIndex] = keyPathComponents[finalPathComponentIndex].slice(0, -1);
            
            // Re-split the first component by the opening bracket and prepend to the array.
            keyPathComponents = keyPathComponents.shift().split('[').concat(keyPathComponents);
            
            finalPathComponentIndex = keyPathComponents.length - 1;
          } else {
            // For simple keys, the path has only one component.
            finalPathComponentIndex = 0;
          }
          
          // Proceed if a value is actually provided in the key-value pair.
          if (keyValuePair.length === 2) {
            parsedValue = decodeURIComponent(keyValuePair[1]);
            
            // Apply type coercion based on the `enableTypeCoercion` flag.
            if (enableTypeCoercion) {
              parsedValue = parsedValue && !Number.isNaN(Number(parsedValue)) ? Number(parsedValue) : // Convert to number if numeric
                            parsedValue === 'undefined' ? undefined : // Convert 'undefined' string to actual undefined
                            coercionMapping[parsedValue] !== undefined ? coercionMapping[parsedValue] : // Convert 'true', 'false', 'null' strings
                            parsedValue; // Default to string if no other coercion applies
            }
            
            if (finalPathComponentIndex > 0) {
              // Build a deep object structure for keys with multiple components.
              // `currentObjectPath` tracks the current position in the nested object.
              // Empty brackets `[]` signify an array, pushing new elements.
              // Numeric `[n]` implies an array index, otherwise it's an object property.
              // If an intermediate path is undefined, it's initialized as an object or array.
              for (; iterationCount <= finalPathComponentIndex; iterationCount++) {
                decodedSegmentKey = keyPathComponents[iterationCount] === '' ? currentObjectPath.length : keyPathComponents[iterationCount];
                currentObjectPath = currentObjectPath[decodedSegmentKey] = iterationCount < finalPathComponentIndex
                  ? currentObjectPath[decodedSegmentKey] || (keyPathComponents[iterationCount+1] && Number.isNaN(Number(keyPathComponents[iterationCount+1])) ? {} : [])
                  : parsedValue;
              }
              
            } else {
              // Handle simple keys, allowing for scalar values or shallow arrays.
              
              if (Array.isArray(constructedResult[decodedSegmentKey])) {
                // If the key already holds an array, append the new value to it.
                constructedResult[decodedSegmentKey].push( parsedValue );
                
              } else if (constructedResult[decodedSegmentKey] !== undefined) {
                // If a scalar value exists, convert it to an array, then add the new value.
                constructedResult[decodedSegmentKey] = [constructedResult[decodedSegmentKey], parsedValue];
                
              } else {
                // Assign the scalar value directly to the key.
                constructedResult[decodedSegmentKey] = parsedValue;
              }
            }
            
          } else if (decodedSegmentKey) {
            // If the key exists but no value is specified, assign a default based on coercion.
            constructedResult[decodedSegmentKey] = enableTypeCoercion ? undefined : '';
          }
        });
        
        return constructedResult;
      };
      
    },{"jqueryLib":9}], // The `jquery` dependency is mapped to `jqueryLib` for this bundle.
    2:[function(_dependencyResolver_, currentModuleContext, moduleExportsOutput){
      // This section defines the SPARQL 1.1 mode for CodeMirror editor.
      (function(modeConfigurationFactory) {
        if (typeof moduleExportsOutput === "object" && typeof currentModuleContext === "object") {
          // CommonJS environment: Uses `require` to get CodeMirror.
          modeConfigurationFactory(_dependencyResolver_("codemirrorCore"));
        } else if (typeof localDefine === "function" && localDefine.amd) {
          // AMD environment: Uses `define` to load CodeMirror.
          localDefine(["codemirrorCore"], modeConfigurationFactory);
        } else {
          // Browser global environment: Assumes `CodeMirror` is globally available.
          modeConfigurationFactory(window.CodeMirror);
        }
      })(function(codeMirrorCore) {
        "use strict";
        
        // Define the "sparql11" mode within the CodeMirror instance.
        codeMirrorCore.defineMode("sparql11", function(modeSettings, parserSettings) {
          
          let defaultIndentationUnit = modeSettings.indentUnit;
          
          // This `grammarParsingTable` is an LL(1) lookup table.
          // It is automatically generated from the SPARQL grammar specification.
          // Direct manual modification of this table is strongly discouraged.
          // %%%table%%%
          const grammarParsingTable =
          {
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
               "STRLANG": ["havingCondition","*havingCondition"],
               "STRDT": ["havingCondition","*havingCondition"],
               "SAMETERM": ["havingCondition","*havingCondition"],
               "ISIRI": ["havingCondition","*havingCondition"],
               "ISURI": ["havingCondition","*havingCondition"],
               "ISBLANK": ["havingCondition","*havingCondition"],
               "ISLITERAL": ["havingCondition","*havingCondition"],
               "ISNUMERIC": ["havingCondition","*havingCondition"],
               "VAR1": ["havingCondition","*havingCondition"],
               "VAR2": ["havingCondition","*havingCondition"],
               "SUBSTR": ["havingCondition","*havingCondition"],
               "REPLACE": ["havingCondition","*havingCondition"],
               "REGEX": ["havingCondition","*havingCondition"],
               "EXISTS": ["havingCondition","*havingCondition"],
               "NOT": ["havingCondition","*havingCondition"],
               "IRI_REF": ["havingCondition","*havingCondition"],
               "PNAME_LN": ["havingCondition","*havingCondition"],
               "PNAME_NS": ["havingCondition","*havingCondition"],
               "ORDER": [],
               "LIMIT": [],
               "OFFSET": [],
               "$": [],
               "}": []},
          };
          
          // The actual tokenizing and parsing logic for the CodeMirror mode would typically
          // be implemented here, consuming the grammarParsingTable.
          // As the original snippet was truncated, a minimal, syntactically valid mode object is returned.
          return {
            startState: function() {
              return {
                currentContext: null,
                currentTokenType: null,
                indentationLevel: 0
              };
            },
            token: function(lineStream, currentState) {
              // This is a placeholder for the actual tokenizing logic.
              // In a complete mode, this would classify text into different token types.
              if (lineStream.eatWhile(/\S/)) {
                return "text"; // Example: highlight any non-whitespace as 'text'
              }
              lineStream.next(); // Advance the stream by one character if no token found
              return null; // Return null if no token is matched
            },
            indent: function(state, textAfter) {
              // Placeholder for indentation logic.
              // A real implementation would calculate indentation based on syntax.
              return defaultIndentationUnit * state.indentationLevel;
            },
            lineComment: "#" // Specifies the character used for single-line comments in SPARQL
          };
        });
      });
    }]
  });
});