module.exports = function(moduleDefinitions) {
    var moduleCache = {};

    // Helper to define a property on an object, always using a getter function
    const defineObjectProperty = (obj, prop, getterFunc, isEnumerable = true) => {
        Object.defineProperty(obj, prop, {
            enumerable: isEnumerable,
            get: getterFunc
        });
    };

    function requireModule(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }
        var module = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };
        moduleDefinitions[moduleId].call(module.exports, module, module.exports, requireModule);
        module.loaded = true;
        return module.exports;
    }

    requireModule.modules = moduleDefinitions;
    requireModule.cache = moduleCache;

    // Helper to define a property on exports (used by t.d in original)
    requireModule.defineExport = function(exportsObj, propertyName, getter) {
        if (!requireModule.hasOwnProperty(exportsObj, propertyName)) {
            defineObjectProperty(exportsObj, propertyName, getter);
        }
    };

    // Helper to register a module as an ES module (used by t.r in original)
    requireModule.registerESModule = function(exportsObj) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            defineObjectProperty(exportsObj, Symbol.toStringTag, () => "Module");
        }
        defineObjectProperty(exportsObj, "__esModule", () => true);
    };

    // Helper to create a namespace object for interop (used by t.t in original)
    requireModule.createNamespace = function(moduleRef, mode) {
        if (1 & mode) {
            moduleRef = requireModule(moduleRef);
        }
        if (8 & mode) return moduleRef;
        if (4 & mode && typeof moduleRef === "object" && moduleRef && moduleRef.__esModule) return moduleRef;

        var namespaceObject = Object.create(null);
        requireModule.registerESModule(namespaceObject);
        defineObjectProperty(namespaceObject, "default", () => moduleRef);

        if (2 & mode && typeof moduleRef !== "string") {
            for (var key in moduleRef) {
                requireModule.defineExport(namespaceObject, key, ((k) => moduleRef[k]).bind(null, key));
            }
        }
        return namespaceObject;
    };

    // Helper to get module exports (for default export) (used by t.n in original)
    requireModule.getModuleDefault = function(moduleRef) {
        const defaultGetter = moduleRef && moduleRef.__esModule ?
            () => moduleRef.default :
            () => moduleRef;
        requireModule.defineExport(defaultGetter, "a", defaultGetter);
        return defaultGetter;
    };

    // Helper for hasOwnProperty check (used by t.o in original)
    requireModule.hasOwnProperty = function(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };

    requireModule.publicPath = "";

    return requireModule(requireModule.startupModule = 0);
}([
    /* Module 0 */
    function(module, exports, requireModule) {
        requireModule(1)(requireModule(2).readFileSync("/dev/stdin", "UTF-8").split("\n"));
    },
    /* Module 1 */
    function(module, exports) {
        // Helper for robust array destructuring, preserving original behavior
        function safeDestructure(inputArray, expectedLength) {
            if (Array.isArray(inputArray)) return inputArray;

            let tempElements = [];
            let iterationComplete = false;
            let caughtError = false;
            let thrownError;

            try {
                for (let itemIterator = inputArray[Symbol.iterator](); !(iterationComplete = (itemIterator.next()).done) && (tempElements.push(itemIterator.value), !expectedLength || tempElements.length !== expectedLength); /* no update here, as original's update was redundant */ );
            } catch (err) {
                caughtError = true;
                thrownError = err;
            } finally {
                try {
                    if (!iterationComplete && itemIterator && typeof itemIterator.return === 'function') {
                        itemIterator.return();
                    }
                } finally {
                    if (caughtError) throw thrownError;
                }
            }
            return tempElements;
        }

        module.exports = function(inputLines) {
            // Helper to parse a string of space-separated numbers
            const parseNumbersFromString = (lineContent) => lineContent.split(" ").map(Number);

            const firstInputLineNumbers = parseNumbersFromString(inputLines[0]);
            const [countN, targetM] = safeDestructure(firstInputLineNumbers, 2);

            const numbersDataArray = parseNumbersFromString(inputLines[1]);

            numbersDataArray.sort((valA, valB) => valA - valB);

            let hasNonDivisibleByFirstElement = false;
            let hasValueGreaterThanTargetM = false;
            let isTargetMFoundDirectly = false;

            // Cache the first element after sorting for repeated checks
            const firstSortedElement = numbersDataArray[0];

            for (let currentIdx = 0; currentIdx < countN; currentIdx++) {
                const currentValue = numbersDataArray[currentIdx];

                // Condition 1: Check if any element is exactly M
                if (currentValue === targetM) {
                    isTargetMFoundDirectly = true;
                    break; // Found M, no need to check further
                }

                // Condition 2: Check if any element is greater than M
                if (currentValue > targetM) {
                    hasValueGreaterThanTargetM = true;
                }

                // Condition 3: Check if any element (after the first) is not divisible by the first element
                // The original code `u[f]%u[0]!=0` handles `u[0] === 0` by `NaN != 0` being true.
                if (currentIdx > 0 && currentValue % firstSortedElement !== 0) {
                    hasNonDivisibleByFirstElement = true;
                }
            }

            // Determine the final output based on collected flags
            if (isTargetMFoundDirectly) {
                console.log("POSSIBLE");
            } else if (hasNonDivisibleByFirstElement && hasValueGreaterThanTargetM) {
                console.log("POSSIBLE");
            } else {
                console.log("IMPOSSIBLE");
            }
        };
    },
    /* Module 2 */
    function(module, exports) {
        module.exports = require("fs");
    }
]);
