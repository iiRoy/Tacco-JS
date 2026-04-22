// This file defines the comprehensive build configuration for the client-side application.
// It orchestrates the module bundling process, including source entry points,
// output directory and naming conventions, transpilation rules for different file types,
// and a suite of optimization plugins for production readiness.

/**
 * Safely loads a Node.js module.
 * Logs an error if the module cannot be found or loaded.
 * @param {string} moduleReference - The name or path of the module to load.
 * @returns {*} The loaded module, or null if an error occurred.
 */
const acquireModule = (moduleReference) => {
  try {
    return require(moduleReference);
  } catch (loadError) {
    console.error(`ERROR: Could not load essential module '${moduleReference}'. Details: ${loadError.message}`);
    // In a production build system, this might trigger a more severe failure.
    return null;
  }
};

// Import necessary core modules for path resolution and bundling capabilities.
const fileSystemPathUtility = acquireModule('path');
const applicationBundler = acquireModule('webpack');

// --- Core Configuration Parameters and Constants ---
const APP_SOURCE_ENTRY_POINT = "./example/app.jsx";
const MAIN_BUNDLE_ID = "app";
const OUTPUT_BUNDLE_FILE_FORMAT = '[name].js';
const DYNAMIC_CHUNK_FILE_FORMAT = '[chunkhash].js';
const WEB_ASSET_ROOT_URL = '/';
const CURRENT_BUILD_ENVIRONMENT = "production"; // Indicates the target environment for the build.

// --- Helper Functions for Constructing Configuration Sections ---

/**
 * Generates the entry point configuration object for the bundler.
 * @param {string} entryKey - The identifier for the main entry.
 * @param {string} entrySourcePath - The file path to the primary application entry.
 * @returns {Object} An object defining the application's entry points.
 */
const composeEntryPoints = (entryKey, entrySourcePath) => ({
  [entryKey]: entrySourcePath
});

/**
 * Creates the output settings object for the bundled assets.
 * @param {string} baseDirectory - The current working directory (e.g., __dirname).
 * @param {Object} pathResolver - The Node.js 'path' utility module.
 * @param {string} publicAssetPath - The public URL path for assets.
 * @param {string} mainBundleFileNamePattern - Pattern for the primary output bundle.
 * @param {string} dynamicChunkFileNamePattern - Pattern for code-split chunks.
 * @returns {Object} An object detailing where and how bundled files are output.
 */
const formulateOutputSettings = (baseDirectory, pathResolver, publicAssetPath, mainBundleFileNamePattern, dynamicChunkFileNamePattern) => {
  // A basic validation to ensure essential path information is available.
  if (!baseDirectory || typeof baseDirectory !== 'string' || baseDirectory.trim() === '') {
    console.warn("Warning: Base directory for output path is undefined or empty. Using current process directory.");
    baseDirectory = process.cwd(); // Fallback
  }
  return {
    targetDirectory: pathResolver.join(baseDirectory),
    publicUrlBase: publicAssetPath,
    primaryBundleFileName: mainBundleFileNamePattern,
    splitChunkFileName: dynamicChunkFileNamePattern
  };
};

/**
 * Defines a single rule for processing specific file types.
 * @param {RegExp} fileTestPattern - A regular expression to match file names.
 * @param {string} loaderModuleSpec - The string specification for the loader module.
 * @returns {Object} An object representing a module processing rule.
 */
const defineModuleProcessingRule = (fileTestPattern, loaderModuleSpec) => ({
  fileMatcher: fileTestPattern, // Renamed 'test' to 'fileMatcher'
  processor: loaderModuleSpec // Renamed 'loader' to 'processor'
});

/**
 * Assembles the complete module processing rules configuration.
 * @returns {Object} An object containing all defined rules for modules.
 */
const buildModuleRulesConfiguration = () => {
  const baseJsxLoader = 'jsx-loader';
  const esHarmonyOption = '?harmony';
  const reactDomPragmaOption = '?insertPragma=React.DOM';

  const jsFileRule = defineModuleProcessingRule(/\.js$/, baseJsxLoader + esHarmonyOption);
  const jsxFileRule = defineModuleProcessingRule(/\.jsx$/, baseJsxLoader + reactDomPragmaOption + esHarmonyOption);

  return {
    assetProcessors: [ // Renamed 'loaders' to 'assetProcessors'
      jsFileRule,
      jsxFileRule
    ]
  };
};

/**
 * Constructs the array of plugin instances used for various build optimizations and tasks.
 * @param {Object} bundlerReference - A reference to the webpack module for instantiating plugins.
 * @param {string} currentEnvMode - The string indicating the current build environment (e.g., "production").
 * @returns {Array<Object>} An array of initialized webpack plugin objects.
 */
const generatePluginInstances = (bundlerReference, currentEnvMode) => {
  // Robustness check: Ensure bundlerReference has the necessary plugin constructors.
  if (!bundlerReference || !bundlerReference.optimize || !bundlerReference.DefinePlugin) {
    console.error("Critical: Bundler reference is incomplete or invalid for plugin generation.");
    // Return an empty array or minimal set if the bundler is not fully functional.
    return [];
  }

  const dedupePlugin = new bundlerReference.optimize.DedupePlugin();
  const codeMinifierPlugin = new bundlerReference.optimize.UglifyJsPlugin();
  const environmentInjectorPlugin = new bundlerReference.DefinePlugin({
    "global.environment.variables": { // Renamed "process.env" to "global.environment.variables"
      // This flag signals the current operational environment to client-side libraries, especially React.
      BUILD_MODE: JSON.stringify(currentEnvMode) // Renamed NODE_ENV to BUILD_MODE
    }
  });

  return [
    dedupePlugin,
    codeMinifierPlugin,
    environmentInjectorPlugin
  ];
};

// --- Main Configuration Object Assembly ---
let finalBundlerConfiguration = {};

// Primary guard clause: Ensure essential modules were successfully loaded.
if (!fileSystemPathUtility || !applicationBundler) {
  console.error("Cannot proceed with configuration: Core bundling dependencies are missing.");
  // Export an empty object to prevent further errors if modules are missing.
  module.exports = {};
} else {
  // Intermediate variables hold the results of helper functions for better readability.
  const enableBuildCaching = true; // Controls caching for faster incremental builds.

  const configuredEntryPoints = composeEntryPoints(MAIN_BUNDLE_ID, APP_SOURCE_ENTRY_POINT);
  const configuredOutputSettings = formulateOutputSettings(
    __dirname,
    fileSystemPathUtility,
    WEB_ASSET_ROOT_URL,
    OUTPUT_BUNDLE_FILE_FORMAT,
    DYNAMIC_CHUNK_FILE_FORMAT
  );
  const configuredModuleRules = buildModuleRulesConfiguration();
  const configuredPlugins = generatePluginInstances(applicationBundler, CURRENT_BUILD_ENVIRONMENT);

  // Assemble the final Webpack configuration object.
  finalBundlerConfiguration = {
    // Specifies whether to enable caching for module resolution and transformed modules.
    enableCacheForBuild: enableBuildCaching, // Renamed 'cache' to 'enableCacheForBuild'
    // Defines the entry points where the bundler starts building the dependency graph.
    applicationEntryPoints: configuredEntryPoints, // Renamed 'entry' to 'applicationEntryPoints'
    // Configures how the bundled output files are named and where they are saved.
    buildOutputParameters: configuredOutputSettings, // Renamed 'output' to 'buildOutputParameters'
    // Rules for how different types of modules (e.g., JS, JSX) are processed by loaders.
    moduleProcessingDefinition: configuredModuleRules, // Renamed 'module' to 'moduleProcessingDefinition'
    // An array of plugins to extend the bundling process with various features like optimization, environment injection.
    bundlerPluginsCollection: configuredPlugins // Renamed 'plugins' to 'bundlerPluginsCollection'
  };

  // Export the generated configuration object for use by the bundler CLI or API.
  module.exports = finalBundlerConfiguration;
}