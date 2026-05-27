module.exports = ((moduleDefinitions) => {
    const moduleCache = new Map();

    const moduleLoader = (moduleId) => {
        if (moduleCache.has(moduleId)) {
            return moduleCache.get(moduleId).exports;
        }

        const moduleRecord = {
            id: moduleId,
            loaded: false,
            exports: {}
        };
        moduleCache.set(moduleId, moduleRecord);

        moduleDefinitions[moduleId].call(moduleRecord.exports, moduleRecord, moduleRecord.exports, moduleLoader);

        moduleRecord.loaded = true;
        return moduleRecord.exports;
    };

    moduleLoader.moduleDefinitions = moduleDefinitions;
    moduleLoader.cache = moduleCache;

    moduleLoader.defineExport = (targetObject, propertyKey, propertyGetter) => {
        if (!Object.prototype.hasOwnProperty.call(targetObject, propertyKey)) {
            Object.defineProperty(targetObject, propertyKey, {
                enumerable: true,
                get: propertyGetter
            });
        }
    };

    moduleLoader.markEsModule = (targetObject) => {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(targetObject, Symbol.toStringTag, { value: 'Module' });
        }
        Object.defineProperty(targetObject, '__esModule', { value: true });
    };

    moduleLoader.interopRequire = (moduleId, interopMode) => {
        let resolvedExports = moduleLoader(moduleId);
        if (interopMode & 1) return resolvedExports;
        if (interopMode & 8) return resolvedExports;
        if (interopMode & 4 && typeof resolvedExports === 'object' && resolvedExports && resolvedExports.__esModule) return resolvedExports;

        let interopContainer = Object.create(null);
        moduleLoader.markEsModule(interopContainer);
        Object.defineProperty(interopContainer, 'default', { enumerable: true, value: resolvedExports });

        if (interopMode & 2 && typeof resolvedExports !== 'string') {
            for (let exportKey in resolvedExports) {
                moduleLoader.defineExport(interopContainer, exportKey, () => resolvedExports[exportKey]);
            }
        }
        return interopContainer;
    };

    moduleLoader.getDefaultExport = (moduleExports) => {
        const exportAccessor = moduleExports && moduleExports.__esModule ? () => moduleExports.default : () => moduleExports;
        moduleLoader.defineExport(exportAccessor, 'a', exportAccessor);
        return exportAccessor;
    };

    moduleLoader.hasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);

    moduleLoader.publicPath = "";

    moduleLoader.entryPointId = 0;
    return moduleLoader(moduleLoader.entryPointId);
})([
    // Module 0: Entry point
    (module, exports, requireModule) => {
        requireModule(1)(requireModule(2).readFileSync("/dev/stdin", "UTF-8"));
    },
    // Module 1: Application logic
    (module, exports) => {
        module.exports = (inputContent) => {
            const contentLines = inputContent.split('\n');

            const dimensionParts = contentLines[0].split(' ').map(Number);
            const gridHeight = dimensionParts[0];
            const gridWidth = dimensionParts[1];

            const ignoredNumericValue = Number(contentLines[1]);

            const blockTypeQuantities = contentLines[2].split(' ').map(Number);

            let currentBlockIdentifier = 0;
            let currentBlockFillCount = 0;

            Array.from({ length: gridHeight }, (_, rowIndex) => {
                const rowData = Array(gridWidth);
                const columnTraversalOrder = (rowIndex % 2 === 0)
                    ? Array.from({ length: gridWidth }, (_, idx) => idx)
                    : Array.from({ length: gridWidth }, (_, idx) => gridWidth - 1 - idx);

                for (const colIdx of columnTraversalOrder) {
                    rowData[colIdx] = currentBlockIdentifier + 1;
                    currentBlockFillCount++;

                    if (currentBlockFillCount >= blockTypeQuantities[currentBlockIdentifier]) {
                        currentBlockFillCount = 0;
                        currentBlockIdentifier++;
                    }
                }
                console.log(rowData.join(' '));
                return rowData;
            });
        };
    },
    // Module 2: fs module
    (module, exports) => {
        module.exports = require("fs");
    }
]);
