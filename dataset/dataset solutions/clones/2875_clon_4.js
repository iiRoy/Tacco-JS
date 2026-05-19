module.exports = (function(moduleDefinitions) {
    const moduleCache = new Map();

    function moduleResolver(moduleId) {
        if (moduleCache.has(moduleId)) {
            return moduleCache.get(moduleId).exports;
        }

        const moduleContainer = {
            identifier: moduleId,
            isLoaded: false,
            exports: {}
        };
        moduleCache.set(moduleId, moduleContainer);

        moduleDefinitions[moduleId].call(moduleContainer.exports, moduleContainer, moduleContainer.exports, moduleResolver);

        moduleContainer.isLoaded = true;
        return moduleContainer.exports;
    }

    moduleResolver.moduleMap = moduleDefinitions;
    moduleResolver.moduleCache = moduleCache;

    moduleResolver.defineExport = function(targetObject, propertyKey, valueGetter) {
        if (!Reflect.has(targetObject, propertyKey)) {
            Reflect.defineProperty(targetObject, propertyKey, {
                enumerable: true,
                get: valueGetter
            });
        }
    };

    moduleResolver.registerEsModule = function(targetModule) {
        const symTag = typeof Symbol !== 'undefined' && Symbol.toStringTag;
        if (symTag) {
            Reflect.defineProperty(targetModule, symTag, { value: "Module" });
        }
        Reflect.defineProperty(targetModule, "__esModule", { value: true });
    };

    moduleResolver.interopRequire = function(moduleValue, flags) {
        let processedModule = (flags & 1) ? moduleResolver(moduleValue) : moduleValue;

        if (flags & 8) return processedModule;
        if ((flags & 4) && typeof processedModule === 'object' && processedModule && processedModule.__esModule) return processedModule;

        const defaultExportWrapper = Object.create(null);
        moduleResolver.registerEsModule(defaultExportWrapper);
        Reflect.defineProperty(defaultExportWrapper, "default", { enumerable: true, value: processedModule });

        if ((flags & 2) && typeof processedModule !== 'string') {
            for (const key in processedModule) {
                moduleResolver.defineExport(defaultExportWrapper, key, () => processedModule[key]);
            }
        }
        return defaultExportWrapper;
    };

    moduleResolver.getDefaultExport = function(moduleObject) {
        const exportAccessor = (moduleObject && moduleObject.__esModule) ? () => moduleObject.default : () => moduleObject;
        const accessorContainer = {};
        moduleResolver.defineExport(accessorContainer, "a", exportAccessor);
        return accessorContainer;
    };

    moduleResolver.hasProperty = function(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };

    moduleResolver.publicPath = "";

    return moduleResolver(0);
})([
    function(mod, exp, load) {
        const fileSystemModule = load(2);
        const mainLogicFunction = load(1);
        mainLogicFunction(fileSystemModule.readFileSync("/dev/stdin", "UTF-8"));
    },
    function(mod, exp, load) {
        mod.exports = function(inputData) {
            const [firstLineData, charGridString] = inputData.split('\n');
            const [gridLength, initialPosition, finalPosition, barrierPosition, _extra] = firstLineData.split(' ').map(Number);

            if (charGridString.includes('##')) {
                console.log("No");
                return;
            }

            if (finalPosition < barrierPosition) {
                console.log("Yes");
                return;
            }

            const relevantSegment = charGridString.substring(initialPosition, barrierPosition - 1);
            if (relevantSegment.includes('...')) {
                console.log("Yes");
            } else {
                console.log("No");
            }
        };
    },
    function(mod, exp, load) {
        mod.exports = require("fs");
    }
]);
