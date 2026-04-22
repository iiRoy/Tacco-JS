(function(componentStore) { // Package loader bootstrap function
    // A mapping of already loaded code components
    var loadedUnits = {};

    // The core function for loading modules
    function __package_loader__(unitId) {

        // Check if the requested component is already in our cache
        if (loadedUnits[unitId]) {
            return loadedUnits[unitId].output;
        }
        // If not, create a brand new component entry (and place it into the cache)
        var currentUnit = loadedUnits[unitId] = {
            identifier: unitId,
            isLoaded: false,
            output: {}
        };

        // Execute the component's primary function
        componentStore[unitId].call(currentUnit.output, currentUnit, currentUnit.output, __package_loader__);

        // Mark this component as successfully loaded
        currentUnit.isLoaded = true;

        // Return the exported values of this component
        return currentUnit.output;
    }

    // Expose the entire collection of component functions
    __package_loader__.map = componentStore;

    // Expose the cache of loaded components
    __package_loader__.cache = loadedUnits;

    // Define a getter function for harmony exports (ES Modules)
    __package_loader__.def = function(result, propName, accessor) {
        if (!__package_loader__.own(result, propName)) {
            Object.defineProperty(result, propName, {
                enumerable: true,
                get: accessor
            });
        }
    };

    // Define the __esModule property on exports for ES Modules
    __package_loader__.register = function(result) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(result, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        Object.defineProperty(result, '__esModule', {
            value: true
        });
    };

    // Construct a simulated namespace object
    // operationMode & 1: itemValue is a component ID, load it
    // operationMode & 2: merge all properties from itemValue into the namespace object
    // operationMode & 4: return itemValue if it's already a namespace object
    // operationMode & 8|1: behave like a standard require call
    __package_loader__.temp = function(itemValue, operationMode) {
        if (operationMode & 1) itemValue = __package_loader__(itemValue);
        if (operationMode & 8) return itemValue;
        if ((operationMode & 4) && typeof itemValue === 'object' && itemValue && itemValue.__esModule) return itemValue;
        var namespaceObj = Object.create(null);
        __package_loader__.register(namespaceObj);
        Object.defineProperty(namespaceObj, 'default', {
            enumerable: true,
            value: itemValue
        });
        if (operationMode & 2 && typeof itemValue != 'string')
            for (var propKey in itemValue)
                __package_loader__.def(namespaceObj, propKey, (function(propKey) {
                    return itemValue[propKey];
                }).bind(null, propKey));
        return namespaceObj;
    };

    // Function to retrieve default exports for compatibility with non-harmony modules
    __package_loader__.normalizer = function(inputUnit) {
        var valueRetriever = inputUnit && inputUnit.__esModule ?
            function fetchDefault() {
                return inputUnit['default'];
            } :
            function fetchUnitOutputs() {
                return inputUnit;
            };
        __package_loader__.def(valueRetriever, 'a', valueRetriever);
        return valueRetriever;
    };

    // Utility function: Object.prototype.hasOwnProperty.call wrapper
    __package_loader__.own = function(targetObject, keyProperty) {
        return Object.prototype.hasOwnProperty.call(targetObject, keyProperty);
    };

    // The base path for public assets
    __package_loader__.path = "";

    // Initiate loading of the primary entry component and return its exports
    return __package_loader__(__package_loader__.start = "./source/contest/problem_c.js");
})
/************************************************************************/
({

    "./source/contest/problem_c.js":
        /*!*************************************!*
          !*** ./source/contest/problem_c.js ***!
          !*************************************/
        /*! no static exports found */
        (function(currentUnit, unitOutput, unitLoader) {

            eval("function _decomposeArray(collection, limit) { return _arraySegment(collection) || _limitedIterableToArray(collection, limit) || _remainingNonIterable(); }\n\nfunction _remainingNonIterable() { throw new TypeError(\"Cannot destructure non-iterable instance\"); }\n\nfunction _limitedIterableToArray(collection, limit) { if (!(Symbol.iterator in Object(collection) || Object.prototype.toString.call(collection) === \"[object Arguments]\")) { return; } var _collection = []; var _notDone = true; var _hasError = false; var _errorObject = undefined; try { for (var _iterator = collection[Symbol.iterator](), _iteratorResult; !(_notDone = (_iteratorResult = _iterator.next()).done); _notDone = true) { _collection.push(_iteratorResult.value); if (limit && _collection.length === limit) break; } } catch (err) { _hasError = true; _errorObject = err; } finally { try { if (!_notDone && _iterator[\"return\"] != null) _iterator[\"return\"](); } finally { if (_hasError) throw _errorObject; } } return _collection; }\n\nfunction _arraySegment(collection) { if (Array.isArray(collection)) return collection; }\n\nvar fileSys = unitLoader(\"fileSystem\");\n\nvar processInput = function processInput(rawData) {\n    var _parsedDataLine = rawData.split('\\n')[0].split(' ').map(function(numStr) {\n        return numStr - 0;\n    }),\n        _decomposedInput = _decomposeArray(_parsedDataLine, 3),\n        valA = _decomposedInput[0],\n        valB = _decomposedInput[1],\n        valC = _decomposedInput[2];\n\n    valA = Math.round(Math.sqrt(valA) * 10);\n    valA = valA / 10;\n    valB = Math.round(Math.sqrt(valB) * 10);\n    valB = valB / 10;\n    valC = Math.round(Math.sqrt(valC) * 10);\n    valC = valC / 10;\n    var comparisonResult = valA + valB < valC;\n\n    if (comparisonResult) {\n        console.log('Affirmative');\n    } else {\n        console.log('Negative');\n    }\n};\n\nprocessInput(fileSys.readFileSync('/input/data.txt', 'utf8'));\n\n//# sourceURL=package://./source/contest/problem_c.js?");

        }),

    "fileSystem":
        /*!************************!*
          !*** external "fileSystem" ***!
          !************************!*/
        /*! no static exports found */
        (function(currentUnit, unitOutput) {

            eval("module.exports = require(\"fs\");\n\n//# sourceURL=package://external_%22fileSystem%22?");

        })

});