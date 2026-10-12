module.exports = function (moduleDefinitions) {
    var moduleCache = {};

    function moduleLoader(currentModuleId) {
        if (moduleCache[currentModuleId]) {
            return moduleCache[currentModuleId].exports;
        }

        var moduleInstance = moduleCache[currentModuleId] = {
            id: currentModuleId,
            loaded: false,
            exports: {}
        };

        moduleDefinitions[currentModuleId].call(moduleInstance.exports, moduleInstance, moduleInstance.exports, moduleLoader);

        moduleInstance.loaded = true;

        return moduleInstance.exports;
    }

    moduleLoader.modules = moduleDefinitions;
    moduleLoader.cache = moduleCache;

    moduleLoader.define = function (exportObject, propertyName, getterFunction) {
        if (!moduleLoader.hasOwn(exportObject, propertyName)) {
            Object.defineProperty(exportObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    moduleLoader.register = function (targetModule) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(targetModule, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(targetModule, "__esModule", {
            value: true
        });
    };

    moduleLoader.createNamespace = function (value, mode) {
        if (mode & 1) {
            value = moduleLoader(value);
        }
        if (mode & 8) {
            return value;
        }
        if (mode & 4 && typeof value === "object" && value && value.__esModule) {
            return value;
        }

        var namespaceObject = Object.create(null);
        moduleLoader.register(namespaceObject);

        Object.defineProperty(namespaceObject, "default", {
            enumerable: true,
            value: value
        });

        if (mode & 2 && typeof value !== "string") {
            for (var propKey in value) {
                moduleLoader.define(namespaceObject, propKey, (function (propName) {
                    return value[propName];
                }).bind(null, propKey));
            }
        }
        return namespaceObject;
    };

    moduleLoader.getDefaultExport = function (moduleExport) {
        var exportGetter = moduleExport && moduleExport.__esModule ?
            function () {
                return moduleExport.default;
            } :
            function () {
                return moduleExport;
            };
        moduleLoader.define(exportGetter, "a", exportGetter);
        return exportGetter;
    };

    moduleLoader.hasOwn = function (obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };

    moduleLoader.publicPath = "";

    return moduleLoader(moduleLoader.startModule = 0);
}([
    function (module0Exports, module0Context, module0Require) {
        module0Require(1)(module0Require(2).readFileSync("/dev/stdin", "UTF-8"));
    },
    function (module1Exports, module1Context) {
        module1Exports.exports = function (inputString) {
            var characterArray = inputString.split("\n")[0].split("");
            var finalLength = 0;

            for (var outerLoopIndex = characterArray.length - 2; outerLoopIndex >= 0; outerLoopIndex--) {
                var isMatchFound = false;

                for (var innerLoopIndex = 0; innerLoopIndex <= outerLoopIndex; innerLoopIndex++) {
                    if (characterArray.slice(0, innerLoopIndex).join("") === characterArray.slice(innerLoopIndex, outerLoopIndex + 1).join("")) {
                        isMatchFound = true;
                        break;
                    }
                }

                if (isMatchFound) {
                    finalLength = outerLoopIndex + 1;
                    return void console.log(finalLength);
                }
            }
        };
    },
    function (module2Exports, module2Context) {
        module2Exports.exports = require("fs");
    }
]);
