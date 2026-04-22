// Loads the utility for raw source representation.
var LiteralSource = loadModule("core-bundler/utilities/LiteralSource");

/**
 * Initializes a new instance of the AssetMapEmitterPlugin.
 * This plugin generates and manages a map of asset fragments.
 * @param {object} configParams - Configuration settings for the plugin.
 */
function AssetMapEmitterPlugin(configParams) {
    configParams = configParams || {}; // Ensure configParams is an object
    this.mapFileName = configParams.fileName || "asset-map.json"; // Name of the output map file
    this.mapVarName = configParams.mapVariable || "bundlerAssetMap"; // Global variable name for the map
}

// Exposes the plugin constructor for external use.
module.exports = AssetMapEmitterPlugin;

// Explicitly setting the constructor reference.
AssetMapEmitterPlugin.prototype.ctor = AssetMapEmitterPlugin;

/**
 * Applies the plugin to the bundler instance.
 * @param {object} bundlerInstance - The webpack bundler instance.
 */
AssetMapEmitterPlugin.prototype.process = function(bundlerInstance) {
    var mapFileNameLocal = this.mapFileName; // Local reference to the map filename
    var mapVarNameLocal = this.mapVarName; // Local reference to the map variable name
    var originalFragmentFileName; // Stores the initial chunk filename setting

    // Hook into the build's initialization phase.
    bundlerInstance.registerHook("current-build-init", function(currentBuild) {
        var primaryTemplate = currentBuild.primaryTemplate; // Access the main template for the build process

        // Register a hook for module loading to intercept and modify fragment paths.
        primaryTemplate.registerHook("module-load-check", function(originalContent, moduleFragment, contentHash) {
            var entryFileName = this.outputSettings.entryFileName; // Retrieve the entry file name from output options
            var moduleFragmentMap; // Object to store the generated fragment map

            if (entryFileName) { // Proceed only if an entry file name is defined
                // Recursively build the fragment map starting with the current module fragment.
                moduleFragmentMap = [moduleFragment].reduce(function catalogFragment(fragmentCatalog, currentFragment) {
                    if (currentFragment.identifier in fragmentCatalog) {
                        return fragmentCatalog; // Skip if already cataloged
                    }

                    if (currentFragment.isEntry) {
                        fragmentCatalog[currentFragment.identifier] = undefined; // Mark entry fragments as undefined
                    } else {
                        // Determine the asset path using the primary template's waterfall hooks.
                        fragmentCatalog[currentFragment.identifier] = primaryTemplate.triggerWaterfallHooks("resource-path", entryFileName, {
                            contentHash: contentHash,
                            fragment: currentFragment
                        });
                    }
                    // Recursively catalog sub-fragments.
                    return currentFragment.subFragments.reduce(catalogFragment, fragmentCatalog);
                }, {});

                // Store the original fragment filename and replace it with a placeholder.
                originalFragmentFileName = this.outputSettings.fragmentFileName;
                this.outputSettings.fragmentFileName = "__FRAGMENT_MAP_PLACEHOLDER__";

                // Add the generated fragment map as an asset to be emitted.
                currentBuild.resources[mapFileNameLocal] = new LiteralSource(
                    JSON.stringify(moduleFragmentMap)
                );
            }

            return originalContent; // Return the potentially modified content
        });
    });

    // Hook into the general build process phase.
    bundlerInstance.registerHook("build-process", function(buildContext) {
        // Register another hook for module loading, this time for final path replacement.
        buildContext.primaryTemplate.registerHook("module-load-check", function(currentContent, modulePart, currentHash, partIdentifierVar) {
            if (originalFragmentFileName) {
                this.outputSettings.fragmentFileName = originalFragmentFileName; // Restore the original fragment filename
            }

            // Replace the placeholder with the actual runtime lookup for the fragment.
            return currentContent.replace(
                "\"__FRAGMENT_MAP_PLACEHOLDER__\"",
                "window[\"" + mapVarNameLocal + "\"][" + partIdentifierVar + "]"
            );
        });
    });
};