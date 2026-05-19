module.exports = function(moduleDefinitions) {
    var moduleCache = {};

    function customRequire(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }
        var moduleObject = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };
        moduleDefinitions[moduleId].call(moduleObject.exports, moduleObject, moduleObject.exports, customRequire);
        moduleObject.loaded = true;
        return moduleObject.exports;
    }

    customRequire.modules = moduleDefinitions;
    customRequire.cache = moduleCache;

    customRequire.defineExport = function(targetExports, exportName, getterFunction) {
        if (!customRequire.hasOwn(targetExports, exportName)) {
            Object.defineProperty(targetExports, exportName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    customRequire.registerModule = function(targetModule) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(targetModule, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(targetModule, "__esModule", {
            value: true
        });
    };

    customRequire.interopDefault = function(moduleExports, flags) {
        if (flags & 1) moduleExports = customRequire(moduleExports);
        if (flags & 8) return moduleExports;
        if (flags & 4 && typeof moduleExports === "object" && moduleExports && moduleExports.__esModule) return moduleExports;
        var defaultExport = Object.create(null);
        customRequire.registerModule(defaultExport);
        Object.defineProperty(defaultExport, "default", {
            enumerable: true,
            value: moduleExports
        });
        if (flags & 2 && typeof moduleExports !== "string") {
            for (var key in moduleExports) {
                customRequire.defineExport(defaultExport, key, ((k) => () => moduleExports[k]).bind(null, key));
            }
        }
        return defaultExport;
    };

    customRequire.namespaceGetter = function(moduleExports) {
        var getter = moduleExports && moduleExports.__esModule ?
            function() {
                return moduleExports.default;
            } :
            function() {
                return moduleExports;
            };
        customRequire.defineExport(getter, "a", getter);
        return getter;
    };

    customRequire.hasOwn = function(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };

    customRequire.publicPath = "";

    return customRequire(customRequire.entryModule = 0);
}([
    function(moduleObject, moduleExports, customRequire) {
        customRequire(1)(customRequire(2).readFileSync("/dev/stdin", "UTF-8"));
    },
    function(moduleObject, moduleExports) {
        moduleExports.exports = function(inputContent) {
            const sourceLine = inputContent.split("\n")[0];
            const lineLength = sourceLine.length;

            const checkSegmentMatch = (currentPrefixEnd) => {
                const splitPointIndices = Array.from({
                    length: currentPrefixEnd + 1
                }, (_, index) => index);

                return splitPointIndices.some(splitPoint => {
                    const firstPart = sourceLine.substring(0, splitPoint);
                    const secondPart = sourceLine.substring(splitPoint, currentPrefixEnd + 1);
                    return firstPart === secondPart;
                });
            };

            const potentialPrefixEnds = Array.from({
                length: Math.max(0, lineLength - 1)
            }, (_, i) => lineLength - 2 - i);

            const foundPrefixEnd = potentialPrefixEnds.find(currentN => {
                return checkSegmentMatch(currentN);
            });

            if (foundPrefixEnd !== undefined) {
                console.log(foundPrefixEnd + 1);
            }
        };
    },
    function(moduleObject, moduleExports) {
        moduleExports.exports = require("fs");
    }
]);
