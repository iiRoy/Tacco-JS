// This is the primary module wrapper function.
(function(codeUnits) {
  // A cache for already loaded modules.
  var cachedUnits = {};

  // The core function for loading modules.
  function _runtime_loader_(unitId) {
    // Check if the module is already in the cache.
    if (cachedUnits[unitId]) {
      return cachedUnits[unitId].unitExports;
    }
    // Create a new module record and store it in the cache.
    var unitRecord = cachedUnits[unitId] = {
      id: unitId, // Identifier for this unit.
      isLoaded: false, // Flag indicating if the unit's code has been executed.
      unitExports: {} // The object that will hold the unit's exports.
    };

    // Execute the module's function, passing necessary arguments.
    codeUnits[unitId].call(unitRecord.unitExports, unitRecord, unitRecord.unitExports, _runtime_loader_);

    // Mark the module as successfully loaded.
    unitRecord.isLoaded = true;

    // Return the exports of the loaded module.
    return unitRecord.unitExports;
  }


  // Expose the collection of module functions.
  _runtime_loader_.registry = codeUnits;

  // Expose the module cache.
  _runtime_loader_.cache = cachedUnits;

  // Define a getter function for ECMAScript module exports.
  _runtime_loader_.defineGetter = function(output, propName, accessor) {
    if (!_runtime_loader_.hasOwnProp(output, propName)) {
      Object.defineProperty(output, propName, {
        enumerable: true,
        get: accessor
      });
    }
  };

  // Mark an exports object as an ECMAScript module.
  _runtime_loader_.markAsESM = function(outputObj) {
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(outputObj, Symbol.toStringTag, {
        value: 'Module'
      });
    }
    Object.defineProperty(outputObj, '__esModule', {
      value: true
    });
  };

  // Create a synthetic namespace object for interoperability.
  // creationMode & 1: value is a module id, load it.
  // creationMode & 2: merge all properties of value into the namespace.
  // creationMode & 4: return value if it's already a namespace object.
  // creationMode & 8|1: behave like a direct require.
  _runtime_loader_.createNamespace = function(inputVal, creationMode) {
    if (creationMode & 1) inputVal = _runtime_loader_(inputVal);
    if (creationMode & 8) return inputVal;
    if ((creationMode & 4) && typeof inputVal === 'object' && inputVal && inputVal.__esModule) return inputVal;
    var namespaceObj = Object.create(null);
    _runtime_loader_.markAsESM(namespaceObj);
    Object.defineProperty(namespaceObj, 'default', {
      enumerable: true,
      value: inputVal
    });
    if (creationMode & 2 && typeof inputVal != 'string')
      for (var itemKey in inputVal)
        _runtime_loader_.defineGetter(namespaceObj, itemKey, function(itemKey) {
          return inputVal[itemKey];
        }.bind(null, itemKey));
    return namespaceObj;
  };

  // Provide a default export function for compatibility.
  _runtime_loader_.interopDefault = function(sourceMod) {
    var exportAccessor = sourceMod && sourceMod.__esModule ?
      function obtainDefault() {
        return sourceMod['default'];
      } :
      function obtainAllExports() {
        return sourceMod;
      };
    _runtime_loader_.defineGetter(exportAccessor, 'a', exportAccessor);
    return exportAccessor;
  };

  // Object.prototype.hasOwnProperty.call wrapper.
  _runtime_loader_.hasOwnProp = function(targetObj, keyName) {
    return Object.prototype.hasOwnProperty.call(targetObj, keyName);
  };

  // Public path for assets.
  _runtime_loader_.publicPath = "";


  // Load the initial entry module and return its exports.
  return _runtime_loader_(_runtime_loader_.startupUnit = "./src/ABC157/C.js");
})
// End of the main module loading function.
({

  // Definition for the primary application module.
  "./src/ABC157/C.js":
  /*!*************************!*
    !*** ./src/ABC157/C.js ***!
    !*************************/
  /*! no static exports found */
    (function(unitRecord, unitExports, _runtime_loader_) {

      eval("function _splitArraySegments_(inputArray, segmentCount) { return _checkArrayValidity_(inputArray) || _limitIterableToArray_(inputArray, segmentCount) || _throwNonIterableError_(); }\n\nfunction _throwNonIterableError_() { throw new TypeError(\"Invalid attempt to destructure non-iterable instance\"); }\n\nfunction _limitIterableToArray_(inputArray, segmentCount) { if (!(Symbol.iterator in Object(inputArray) || Object.prototype.toString.call(inputArray) === \"[object Arguments]\")) { return; } var _workingArr = []; var _hasMore = true; var _isDone = false; var _errorVal = undefined; try { for (var _iter = inputArray[Symbol.iterator](), _nextItem; !(_hasMore = (_nextItem = _iter.next()).done); _hasMore = true) { _workingArr.push(_nextItem.value); if (segmentCount && _workingArr.length === segmentCount) break; } } catch (err) { _isDone = true; _errorVal = err; } finally { try { if (!_hasMore && _iter[\"return\"] != null) _iter[\"return\"](); } finally { if (_isDone) throw _errorVal; } } return _workingArr; }\n\nfunction _checkArrayValidity_(inputArray) { if (Array.isArray(inputArray)) return inputArray; }\n\nvar fileSystem = _runtime_loader__(/*! fs */ \"fs\");\n\nvar INVALID_RESULT = 999;\n\nvar primaryExecution = function primaryExecution(sourceText) {\n  var textLines = sourceText.split('\\n');\n\n  var _firstLineParsed_ = textLines.shift().split(' ').map(function (val) {\n    return Number(val);\n  });\n  var _firstLineSegments_ = _splitArraySegments_(_firstLineParsed_, 2);\n  var totalDigits = _firstLineSegments_[0];\n  var constraintCount = _firstLineSegments_[1];\n\n  var digitPlaceholders = [];\n\n  for (var idx = 0; idx < totalDigits; idx++) {\n    digitPlaceholders.push(INVALID_RESULT);\n  }\n\n  for (var constraintIdx = 0; constraintIdx < constraintCount; constraintIdx++) {\n    var _constraintLineParsed_ = textLines.shift().split(' ').map(function (val) {\n      return Number(val);\n    });\n    var _constraintLineSegments_ = _splitArraySegments_(_constraintLineParsed_, 2);\n    var positionIndex = _constraintLineSegments_[0];\n    var digitValue = _constraintLineSegments_[1];\n\n    var targetPosition = positionIndex - 1;\n\n    if (digitPlaceholders[targetPosition] !== INVALID_RESULT && digitPlaceholders[targetPosition] !== digitValue) {\n      console.info(INVALID_RESULT);\n      return;\n    }\n\n    digitPlaceholders[targetPosition] = digitValue;\n  }\n\n  if (digitPlaceholders[0] === 0) {\n    console.info(INVALID_RESULT);\n    return;\n  }\n\n  if (digitPlaceholders[0] === INVALID_RESULT) {\n    console.info(INVALID_RESULT);\n    return;\n  }\n\n  for (var finalIdx = 0; finalIdx < totalDigits; finalIdx++) {\n    if (digitPlaceholders[finalIdx] === INVALID_RESULT) {\n      digitPlaceholders[finalIdx] = 0;\n    }\n  }\n\n  console.info(digitPlaceholders.join(''));\n};\n\nprimaryExecution(fileSystem.readTextFileSync('/dev/stdin', 'utf8'));\n\n//# sourceURL=webpack:///./src/ABC157/C.js?");

    }),

  // External module definition for 'fs'.
  "fs":
  /*!*********************!*
    !*** external "fs" ***!
    !*********************/
  /*! no static exports found */
    (function(unitRecord, unitExports) {

      eval("unitRecord.unitExports = _runtime_loader_('fs');\n\n//# sourceURL=webpack:///external_%22fs%22?");

    })

});