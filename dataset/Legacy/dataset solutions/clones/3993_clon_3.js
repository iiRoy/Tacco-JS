module.exports = (function(moduleDefinitions) {
    const moduleCache = {};

    const moduleLoader = function(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }
        const currentModule = moduleCache[moduleId] = { id: moduleId, loaded: false, exports: {} };
        moduleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, moduleLoader);
        currentModule.loaded = true;
        return currentModule.exports;
    };

    const setupLoaderHelpers = function(loaderInstance, definitions) {
        loaderInstance.m = definitions;
        loaderInstance.c = moduleCache;
        loaderInstance.d = function(targetObject, propertyName, getterFunction) {
            if (!loaderInstance.o(targetObject, propertyName)) {
                Object.defineProperty(targetObject, propertyName, { enumerable: true, get: getterFunction });
            }
        };
        loaderInstance.r = function(targetObject) {
            if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
                Object.defineProperty(targetObject, Symbol.toStringTag, { value: "Module" });
            }
            Object.defineProperty(targetObject, "__esModule", { value: true });
        };
        loaderInstance.t = function(value, mode) {
            if (mode & 1) value = loaderInstance(value);
            if (mode & 8) return value;
            if (mode & 4 && typeof value === "object" && value && value.__esModule) return value;
            const namespaceObject = Object.create(null);
            loaderInstance.r(namespaceObject);
            Object.defineProperty(namespaceObject, "default", { enumerable: true, value: value });
            if (mode & 2 && typeof value !== "string") {
                for (const prop in value) {
                    loaderInstance.d(namespaceObject, prop, ((p) => value[p]).bind(null, prop));
                }
            }
            return namespaceObject;
        };
        loaderInstance.n = function(moduleObject) {
            const defaultGetter = moduleObject && moduleObject.__esModule ? () => moduleObject.default : () => moduleObject;
            loaderInstance.d(defaultGetter, "a", defaultGetter);
            return defaultGetter;
        };
        loaderInstance.o = function(objectToCheck, propertyToCheck) {
            return Object.prototype.hasOwnProperty.call(objectToCheck, propertyToCheck);
        };
        loaderInstance.p = "";
    };

    setupLoaderHelpers(moduleLoader, moduleDefinitions);

    return moduleLoader(moduleLoader.s = 0);
})([
    function(moduleObject, moduleExports, moduleLoader) {
        const STDIN_FILE_PATH = "/dev/stdin";
        const fileSystemModule = moduleLoader(2);
        const fileContent = fileSystemModule.readFileSync(STDIN_FILE_PATH, "UTF-8");
        moduleLoader(1)(fileContent);
    },
    function(moduleObject, moduleExports) {
        function _iterableToArrayLimit(iterableInput, limitCount) {
            var resultArray = [];
            var iterationDone = false;
            var iterationError = false;
            var errorCaught = undefined;
            var nextIterationItem;

            try {
                for (var iteratorInstance = iterableInput[Symbol.iterator](); !(iterationDone = (nextIterationItem = iteratorInstance.next()).done) && (resultArray.push(nextIterationItem.value), !limitCount || resultArray.length !== limitCount);) {}
            } catch (err) {
                iterationError = true;
                errorCaught = err;
            } finally {
                try {
                    if (!iterationDone && iteratorInstance.return != null) {
                        iteratorInstance.return();
                    }
                } finally {
                    if (iterationError) throw errorCaught;
                }
            }
            return resultArray;
        }

        const ensureNonNegative = (value) => Math.max(0, value);

        moduleExports.exports = function(inputStringData) {
            const inputLines = inputStringData.split("\n");
            const firstLineOfInput = inputLines[0];
            const stringNumbers = firstLineOfInput.split(" ");
            const numericValues = stringNumbers.map(Number);

            const [paramN, paramO] = _iterableToArrayLimit(numericValues, 2);

            let finalCalculatedSum = 0;

            for (let currentDivisor = 1; currentDivisor <= paramN; currentDivisor++) {
                const currentRemainder = paramN % currentDivisor;

                const termFromQuotient = Math.floor(paramN / currentDivisor);
                const termFromDivisorOffset = ensureNonNegative(currentDivisor - paramO);
                const termFromRemainderOffset = ensureNonNegative(currentRemainder - paramO + 1);

                const productTerm = termFromQuotient * termFromDivisorOffset;
                finalCalculatedSum += productTerm + termFromRemainderOffset;
            }

            if (paramO === 0) {
                finalCalculatedSum -= paramN;
            }

            console.log(finalCalculatedSum);
        };
    },
    function(moduleObject, moduleExports) {
        moduleObject.exports = require("fs");
    }
]);
