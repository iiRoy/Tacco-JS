const BinaryAsset = require("webpack-core/lib/RawSource");

/**
 * @class AssetLocatorGenerator
 * @description A webpack plugin to generate and inject a runtime asset map for dynamic module loading.
 */
class AssetLocatorGenerator {
  /**
   * Constructs the AssetLocatorGenerator plugin.
   * @param {object} [configOptions] - Configuration settings for the plugin.
   * @param {string} [configOptions.outputMapFile="module-asset-map.json"] - The name of the file to output the asset map.
   * @param {string} [configOptions.globalRuntimeVar="assetMapLookup"] - The global variable name used in the runtime to access the map.
   */
  constructor(configOptions) {
    // Ensure configuration object is valid, providing a default if not.
    const effectiveOptions = (typeof configOptions === 'object' && configOptions !== null) ? configOptions : {};

    // Initialize plugin properties with defaults or provided values.
    this.outputMapFile = effectiveOptions.outputMapFile ?? "module-asset-map.json";
    this.globalRuntimeVar = effectiveOptions.globalRuntimeVar ?? "assetMapLookup";

    // Internal state to preserve the original chunk filename pattern across compilation phases.
    this._originalChunkOutputPattern = null;
  }

  /**
   * Applies the plugin to the webpack compiler.
   * @param {object} webpackCompiler - The webpack compiler instance.
   */
  apply(webpackCompiler) {
    const mapFileName = this.outputMapFile;
    const runtimeVarName = this.globalRuntimeVar;

    /**
     * Recursively traverses module dependencies to build the asset map.
     * @param {object} currentModule - The module being processed.
     * @param {object} runtimeCodeGenerator - The main template instance for asset path generation.
     * @param {string} buildIdentifier - The current build hash.
     * @param {object} accumulatorMap - The map accumulating module IDs and their paths.
     * @returns {object} The updated accumulator map.
     */
    const buildModulePathMap = (currentModule, runtimeCodeGenerator, buildIdentifier, accumulatorMap) => {
      // Prevent reprocessing already mapped modules.
      if (Object.prototype.hasOwnProperty.call(accumulatorMap, currentModule.id)) {
        return accumulatorMap;
      }

      // Determine the path for the current module.
      if (currentModule.entry) {
        // Entry modules might not have a direct path in the manifest, or can be marked specially.
        accumulatorMap[currentModule.id] = null; // Using null to explicitly mark as handled, no external path.
      } else {
        // Generate the asset path using webpack's internal asset-path hook.
        const moduleAssetPath = runtimeCodeGenerator.applyPluginsWaterfall(
          "asset-path",
          mapFileName, // Pass the manifest file name as context if needed.
          {
            hash: buildIdentifier,
            chunk: currentModule
          }
        );
        accumulatorMap[currentModule.id] = moduleAssetPath;
      }

      // Recursively process child modules.
      for (const childModule of currentModule.chunks) {
        buildModulePathMap(childModule, runtimeCodeGenerator, buildIdentifier, accumulatorMap);
      }
      return accumulatorMap;
    };

    // Hook into the 'thisCompilation' phase to generate the initial asset map.
    webpackCompiler.hooks.thisCompilation.tap(
      "AssetLocatorGenerator",
      (currentCompilation) => {
        const runtimeCodeGenerator = currentCompilation.mainTemplate;

        // Intercept the 'require-ensure' hook to gather chunk information.
        runtimeCodeGenerator.hooks.requireEnsure.tap(
          "AssetLocatorGenerator_MapBuilder",
          (runtimeFragment, chunkUnit, currentBuildHash) => {
            const currentOutputPattern = runtimeCodeGenerator.outputOptions.filename;
            let currentAssetMap = {};

            // Proceed only if an output filename pattern is defined.
            if (currentOutputPattern) {
              // Populate the asset map by traversing the current chunk unit and its dependencies.
              buildModulePathMap(chunkUnit, runtimeCodeGenerator, currentBuildHash, currentAssetMap);

              // Store the original chunk output filename pattern before modifying it.
              this._originalChunkOutputPattern = runtimeCodeGenerator.outputOptions.chunkFilename;

              // Temporarily set a placeholder for chunk filenames. This will be replaced later.
              runtimeCodeGenerator.outputOptions.chunkFilename = "##WEBPACK_ASSET_MAP_PLACEHOLDER##";

              // Emit the generated asset map as a new asset.
              // Use pretty-printing for JSON for better readability in the output file (a Type III change).
              currentCompilation.assets[mapFileName] = new BinaryAsset(
                JSON.stringify(currentAssetMap, null, 2)
              );
            }

            return runtimeFragment;
          }
        );
      }
    );

    // Hook into the 'compilation' phase (after assets are finalized) to inject runtime code.
    webpackCompiler.hooks.compilation.tap(
      "AssetLocatorGenerator",
      (currentCompilation) => {
        // Intercept 'require-ensure' again to modify the runtime chunk loading logic.
        currentCompilation.mainTemplate.hooks.requireEnsure.tap(
          "AssetLocatorGenerator_Injector",
          (sourceCodeSegment, chunkUnit, currentBuildHash, moduleIdVariable) => {
            // Restore the original chunk filename pattern if it was temporarily changed.
            if (this._originalChunkOutputPattern) {
              currentCompilation.mainTemplate.outputOptions.chunkFilename = this._originalChunkOutputPattern;
            }

            // Replace the temporary placeholder with the actual runtime lookup for chunk paths.
            // Using template literals for cleaner string construction.
            const modifiedSource = sourceCodeSegment.replace(
              "\"##WEBPACK_ASSET_MAP_PLACEHOLDER##\"",
              `window["${runtimeVarName}"][${moduleIdVariable}]`
            );

            return modifiedSource;
          }
        );
      }
    );
  }
}

module.exports = AssetLocatorGenerator;