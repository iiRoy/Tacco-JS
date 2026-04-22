var AssetContentProvider = require("webpack-core/lib/RawSource");

class DynamicModuleMapInjector {
  constructor(configSettings = {}) {
    this.mapFilePath = configSettings.mapFile || "module-map.json";
    this.globalMapRef = configSettings.mapVar || "moduleLocator";
  }

  apply(buildProcess) {
    const currentMapPath = this.mapFilePath;
    const currentMapName = this.globalMapRef;
    let previousAssetPath = null;

    buildProcess.plugin("this-compilation", (compilationContext) => {
      const coreTemplateEngine = compilationContext.mainTemplate;
      coreTemplateEngine.plugin("require-ensure", (originalCodeSegment, initialModule, currentBuildHash) => {
        const assetDestination = this.outputOptions.filename;
        let modulePathMap;

        if (assetDestination) {
          modulePathMap = {};
          const visitedModules = new Set();
          const moduleQueue = [initialModule];

          while (moduleQueue.length > 0) {
            const processedModule = moduleQueue.shift();

            if (visitedModules.has(processedModule.id)) {
              continue;
            }
            visitedModules.add(processedModule.id);

            // Ensure exact JSON output by using undefined for entry chunks
            if (processedModule.entry) {
              modulePathMap[processedModule.id] = undefined;
            } else {
              modulePathMap[processedModule.id] = coreTemplateEngine.applyPluginsWaterfall(
                "asset-path",
                assetDestination,
                {
                  hash: currentBuildHash,
                  chunk: processedModule,
                }
              );
            }

            for (const childModule of processedModule.chunks) {
              if (!visitedModules.has(childModule.id)) {
                moduleQueue.push(childModule);
              }
            }
          }

          previousAssetPath = this.outputOptions.chunkFilename;
          this.outputOptions.chunkFilename = "__MODULE_MAP_PLACEHOLDER__";
          compilationContext.assets[currentMapPath] = new AssetContentProvider(JSON.stringify(modulePathMap));
        }

        return originalCodeSegment;
      });
    });

    buildProcess.plugin("compilation", (compilationContext) => {
      compilationContext.mainTemplate.plugin("require-ensure", (originalCodeSegment, initialModule, currentBuildHash, idReference) => {
        if (previousAssetPath !== null) {
          this.outputOptions.chunkFilename = previousAssetPath;
        }

        return originalCodeSegment.replace(
          "\"__MODULE_MAP_PLACEHOLDER__\"",
          `window["${currentMapName}"][${idReference}]`
        );
      });
    });
  }
}

module.exports = DynamicModuleMapInjector;