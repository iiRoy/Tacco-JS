module.exports = (function(moduleDefinitions) {
    const moduleCache = {};

    function moduleLoader(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        const currentModule = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };

        moduleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, moduleLoader);
        currentModule.loaded = true;
        return currentModule.exports;
    }

    moduleLoader.moduleDefinitions = moduleDefinitions;
    moduleLoader.cache = moduleCache;

    const defineExportGetter = (targetObject, propertyName, getterFunction) => {
        if (!Object.prototype.hasOwnProperty.call(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };
    moduleLoader.define = defineExportGetter;

    const markAsEsModule = (exportsObject) => {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, { value: 'Module' });
        }
        Object.defineProperty(exportsObject, '__esModule', { value: true });
    };
    moduleLoader.markEsModule = markAsEsModule;

    moduleLoader.interop = (moduleExports, modeFlags) => {
        let processedExports = moduleExports;

        if (modeFlags & 1) {
            processedExports = moduleLoader(moduleExports);
        }
        if (modeFlags & 8) {
            return processedExports;
        }
        if (modeFlags & 4 && typeof processedExports === 'object' && processedExports && processedExports.__esModule) {
            return processedExports;
        }

        const defaultExportContainer = Object.create(null);
        moduleLoader.markEsModule(defaultExportContainer);
        Object.defineProperty(defaultExportContainer, 'default', { enumerable: true, value: processedExports });

        if (modeFlags & 2 && typeof processedExports !== 'string') {
            for (const key in processedExports) {
                moduleLoader.define(defaultExportContainer, key, ((k) => () => processedExports[k]).bind(null, key));
            }
        }
        return defaultExportContainer;
    };

    moduleLoader.getDefaultExport = (moduleExports) => {
        const getterFunction = moduleExports && moduleExports.__esModule ?
            () => moduleExports.default :
            () => moduleExports;
        
        const exportWrapper = function() { return getterFunction(); };
        moduleLoader.define(exportWrapper, 'a', getterFunction);
        return exportWrapper;
    };

    moduleLoader.hasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);

    moduleLoader.publicPath = "";

    moduleLoader.entryModuleId = 0;
    return moduleLoader(moduleLoader.entryModuleId);

})([
    function(moduleObj, moduleExports, requireModule) {
        const fsModule = requireModule(2);
        const inputContent = fsModule.readFileSync("/dev/stdin", "UTF-8");
        requireModule(1)(inputContent);
    },
    function(moduleObj, moduleExports) {
        moduleExports.exports = function(inputString) {
            const firstLine = inputString.split("\n")[0];
            const charArray = firstLine.split("");

            if (charArray.length < 2) {
                return;
            }

            const hasMatchingPrefixSubstring = (fullChars, prefixLastIndex) => {
                for (let subStringStart = 0; subStringStart <= prefixLastIndex; subStringStart++) {
                    const initialPrefixSegment = fullChars.slice(0, subStringStart).join("");
                    const innerSubstringSegment = fullChars.slice(subStringStart, prefixLastIndex + 1).join("");

                    if (initialPrefixSegment === innerSubstringSegment) {
                        return true;
                    }
                }
                return false;
            };

            for (let currentPrefixLastIndex = charArray.length - 2; currentPrefixLastIndex >= 0; currentPrefixLastIndex--) {
                if (hasMatchingPrefixSubstring(charArray, currentPrefixLastIndex)) {
                    const matchedLength = currentPrefixLastIndex + 1;
                    console.log(matchedLength);
                    return;
                }
            }
        };
    },
    function(moduleObj, moduleExports) {
        moduleExports.exports = require("fs");
    }
]);
