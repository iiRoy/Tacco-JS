module.exports = (function(moduleDefinitions) {
    const moduleRegistry = {};

    function obtainModule(identifier) {
        if (moduleRegistry[identifier]) {
            return moduleRegistry[identifier].exports;
        }
        const moduleRecord = { exports: {} };
        moduleRegistry[identifier] = moduleRecord;
        moduleDefinitions[identifier](moduleRecord, moduleRecord.exports, obtainModule);
        return moduleRecord.exports;
    }

    obtainModule.m = moduleDefinitions;
    obtainModule.c = moduleRegistry;
    obtainModule.d = function(targetObject, propertyName, getterFunction) {
        if (!Object.prototype.hasOwnProperty.call(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, { enumerable: true, get: getterFunction });
        }
    };
    obtainModule.r = function(targetObject) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(targetObject, Symbol.toStringTag, { value: 'Module' });
        }
        Object.defineProperty(targetObject, '__esModule', { value: true });
    };
    obtainModule.t = function(value, mode) {
        if (mode & 1) value = obtainModule(value);
        if (mode & 8) return value;
        if ((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
        var namespaceObject = Object.create(null);
        obtainModule.r(namespaceObject);
        Object.defineProperty(namespaceObject, 'default', { enumerable: true, value: value });
        if (mode & 2 && typeof value != 'string') {
            for (var key in value) {
                obtainModule.d(namespaceObject, key, ((key) => value[key]).bind(null, key));
            }
        }
        return namespaceObject;
    };
    obtainModule.n = function(module) {
        var accessor = module && module.__esModule ?
            () => module['default'] :
            () => module;
        obtainModule.d(accessor, 'a', accessor);
        return accessor;
    };
    obtainModule.o = (targetObject, propertyName) => Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    obtainModule.p = "";

    return obtainModule(0);
})([
    // Module 0: Entry point
    function(moduleRecord, moduleExports, localObtain) {
        const fileSystemUtility = localObtain(2);
        const primaryCalculation = localObtain(1);
        primaryCalculation(fileSystemUtility.readFileSync("/dev/stdin", "UTF-8"));
    },
    // Module 1: Core logic for calculation
    function(moduleRecord, moduleExports, localObtain) {
        moduleExports = function(inputContent) {
            const [initialLine] = inputContent.split("\n");
            const [paramN, paramA, paramB] = initialLine.split(" ").map(BigInt);

            let computedOutcome;

            if (paramN === 1n) {
                computedOutcome = (paramA === paramB) ? 1n : 0n;
            } else {
                if (paramA > paramB) {
                    computedOutcome = 0n;
                } else {
                    const differenceValue = paramB - paramA;
                    const adjustmentFactor = paramN - 2n;
                    computedOutcome = differenceValue * adjustmentFactor + 1n;
                }
            }
            console.log(computedOutcome.toString());
        };
    },
    // Module 2: File System Access
    function(moduleRecord, moduleExports) {
        moduleExports = require("fs");
    }
]);
