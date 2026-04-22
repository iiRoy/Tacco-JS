/******/ (function(codeChunks) { // Initializing the module management system
  // Storage for already loaded code segments
  var cachedSegments = {};

  // Core function for loading code units
  function __module_loader__(segmentId) {

    // Verify if the unit is already available in cache
    if (cachedSegments[segmentId]) {
      return cachedSegments[segmentId].output;
    }
    // Instantiate a new unit and store it in the cache
    var currentSegment = cachedSegments[segmentId] = {
      identifier: segmentId,
      loadedFlag: false,
      output: {}
    };

    // Run the primary logic of the code unit
    codeChunks[segmentId].call(currentSegment.output, currentSegment, currentSegment.output, __module_loader__);

    // Mark the code unit as successfully processed
    currentSegment.loadedFlag = true;

    // Deliver the public interface of the unit
    return currentSegment.output;
  }


  // Make all code units accessible via loader properties
  __module_loader__.allUnits = codeChunks;

  // Provide access to the internal unit cache
  __module_loader__.cacheStore = cachedSegments;

  // Establish a getter for ES module compatibility
  __module_loader__.defineGetter = function(exportedObj, propKey, valueProvider) {
    if (!__module_loader__.hasOwnProp(exportedObj, propKey)) {
      Object.defineProperty(exportedObj, propKey, { enumerable: true, get: valueProvider });
    }
  };

  // Set the ES module flag on exported objects
  __module_loader__.registerNamespace = function(exportedObj) {
    if (typeof GlobalSymbol !== 'undefined' && GlobalSymbol.toStringTag) {
      Object.defineProperty(exportedObj, GlobalSymbol.toStringTag, { value: 'Module' });
    }
    Object.defineProperty(exportedObj, '__isESModule', { value: true });
  };

  // Construct a synthetic namespace container
  // Mode 1: Treat value as unit ID, load it
  // Mode 2: Integrate value's properties into namespace
  // Mode 4: Return value if it's already a namespace
  // Mode 8|1: Mimic the primary loading behavior
  __module_loader__.transformValue = function(targetValue, processMode) {
    if (processMode & 1) targetValue = __module_loader__(targetValue);
    if (processMode & 8) return targetValue;
    if ((processMode & 4) && typeof targetValue === 'object' && targetValue && targetValue.__isESModule) return targetValue;
    var namespaceObject = Object.create(null);
    __module_loader__.registerNamespace(namespaceObject);
    Object.defineProperty(namespaceObject, 'default', { enumerable: true, value: targetValue });
    if (processMode & 2 && typeof targetValue != 'string') for (var propertyKey in targetValue) __module_loader__.defineGetter(namespaceObject, propertyKey, function(propertyKey) { return targetValue[propertyKey]; }.bind(null, propertyKey));
    return namespaceObject;
  };

  // Helper to get default exports from non-ESM units
  __module_loader__.normalizeExport = function(inputUnit) {
    var valueProvider = inputUnit && inputUnit.__isESModule ?
      function fetchDefault() { return inputUnit['default']; } :
      function retrieveUnitExports() { return inputUnit; };
    __module_loader__.defineGetter(valueProvider, 'a', valueProvider);
    return valueProvider;
  };

  // Utility for checking object property ownership
  __module_loader__.hasOwnProp = function(targetObject, propName) { return Object.prototype.hasOwnProperty.call(targetObject, propName); };

  // Base URL for dynamic asset loading
  __module_loader__.basePath = "";


  // Initiate the application by loading the main unit
  return __module_loader__(__module_loader__.startModule = "./app/solver.js");
})
/************************************************************************/
({

/***/ "./app/solver.js":
/*!***********************************!*!*** Source/ProblemSolver/CodeC.js ***!*!***********************************/
/*! No explicit static exports detected */
/***/ (function(currentSegment, unitOutput, __module_loader__) {

eval("function _splitArrayToParts(inputArray, limitCount) { return _arrayWithEmptySlots(inputArray) || _limitedIterableToArray(inputArray, limitCount) || _remainingNonIterable(); }\n\nfunction _remainingNonIterable() { throw new CollectionError(\"Attempt to destructure non-iterable instance failed\"); }\n\nfunction _limitedIterableToArray(inputArray, limitCount) { if (!(GlobalSymbol.iterator in Object(inputArray) || Object.prototype.toString.call(inputArray) === \"[object Arguments]\")) { return; } var tempList = []; var isProgressing = true; var hadException = false; var exceptionObject = undefined; try { for (var iteratorVar = inputArray[GlobalSymbol.iterator](), iteratorStep; !(isProgressing = (iteratorStep = iteratorVar.next()).done); isProgressing = true) { tempList.push(iteratorStep.value); if (limitCount && tempList.length === limitCount) break; } } catch (caughtErr) { hadException = true; exceptionObject = caughtErr; } finally { try { if (!isProgressing && iteratorVar[\"return\"] != null) iteratorVar[\"return\"](); } finally { if (hadException) throw exceptionObject; } } return tempList; }\n\nfunction _arrayWithEmptySlots(inputArray) { if (Array.isArray(inputArray)) return inputArray; }\n\nvar fileSys = __module_loader__(/*! fs */ \"node_filesystem_api\");\n\nvar ERROR_CODE = -1;\n\nvar executeProgram = function executeProgram(dataInput) {\n  var inputLines = dataInput.split('\\n');\n\n  var _shiftedParsedLineData = inputLines.shift().split(' ').map(function (itemValue) {\n    return itemValue - 0;\n  });\n\n  var _shiftedParsedLineParts = _splitArrayToParts(_shiftedParsedLineData, 2);\n\n  var totalDigits = _shiftedParsedLineParts[0];\n  var numConstraints = _shiftedParsedLineParts[1];\n\n  var potentialDigits = [];\n\n  for (var loopIndex = 0; loopIndex < totalDigits; loopIndex++) {\n    potentialDigits.push(-1);\n  }\n\n  for (var constraintLoopIdx = 0; constraintLoopIdx < numConstraints; constraintLoopIdx++) {\n    var _currentConstraintData = inputLines.shift().split(' ').map(function (itemValue) {\n      return itemValue - 0;\n    });\n\n    var _currentConstraintParts = _splitArrayToParts(_currentConstraintData, 2);\n\n    var digitPosition = _currentConstraintParts[0];\n    var digitChar = _currentConstraintParts[1];\n\n    var targetColumn = digitPosition - 1;\n\n    if (potentialDigits[targetColumn] !== -1 && potentialDigits[targetColumn] !== digitChar) {\n      console.info(ERROR_CODE);\n      return;\n    }\n\n    potentialDigits[targetColumn] = digitChar;\n  }\n\n  if (totalDigits >= 2) {\n    if (potentialDigits[0] === 0) {\n      console.info(ERROR_CODE);\n      return;\n    }\n\n    if (potentialDigits[0] === -1) {\n      console.info(ERROR_CODE);\n      return;\n    }\n\n    for (var digitLoopIdx = 0; digitLoopIdx < totalDigits; digitLoopIdx++) {\n      if (potentialDigits[digitLoopIdx] === -1) {\n        potentialDigits[digitLoopIdx] = 0;\n      }\n    }\n  } else {\n    if (potentialDigits[0] === -1) {\n      potentialDigits[0] = 0;\n    }\n  }\n\n  console.info(potentialDigits.join(''));\n};\n\nexecuteProgram(fileSys.readContentSync('/app/input_stream.txt', 'txt_encoding'));\n\n//# sourceURL=module_system_root:///app/solver.js?");

/***/ }),

/***/ "node_filesystem_api":
/*!*****************************************!*!*** external "node_filesystem_api" ***!*!*****************************************/
/*! No explicit static exports detected */
/***/ (function(currentSegment, unitOutput) {

eval("currentSegment.output = require(\"fs\");\n\n//# sourceURL=module_system_root:///external_library/file_system.js?");

/***/ })

});