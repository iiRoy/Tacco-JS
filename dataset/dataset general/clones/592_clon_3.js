// This module serves as a configuration provider, detailing various assets or resources.
// It's designed to expose a structured collection of files for consumption by other modules.

/**
 * Defines the primary script file responsible for the core modal functionality.
 * This is typically the main JavaScript source for the component.
 * @constant {string}
 */
const primaryComponentScript = 'jquery.smartModal.js';

/**
 * Specifies the manifest or package metadata file associated with the component.
 * This often contains versioning, dependencies, or other descriptive information.
 * @constant {string}
 */
const componentManifestFile = 'smartModal.jquery.json';

// Initialize a mutable array to accumulate all relevant resource paths.
// This allows for dynamic assembly of the resource list.
let collectedResources = [];

// Ensure the primary script is always included as it's fundamental.
if (typeof primaryComponentScript === 'string' && primaryComponentScript.length > 0) {
  collectedResources.push(primaryComponentScript);
} else {
  // Log a warning or handle error if primary script is missing/invalid, though not expected here.
  console.warn("Primary component script definition is invalid or missing.");
}

// Conditionally add the manifest file. In a more complex setup, this might depend on
// build configurations, environment variables, or other logic. For this example, it's always included.
if (componentManifestFile.endsWith('.json')) { // A simple validation check
  collectedResources.push(componentManifestFile);
}

// Construct the final export object. We use a temporary object first
// to structure it before assigning to module.exports.
const exportableAssetConfig = {};

// Assign the assembled list of resources to a specific property within the configuration object.
// Using Object.assign for a slightly different syntactic approach than direct property assignment.
Object.assign(exportableAssetConfig, {
  componentAssets: collectedResources // Renamed property from 'all' to 'componentAssets'
});

// Freeze the array to prevent external modification if desired,
// though for this Type III clone, we'll keep it mutable to show a different flow.
// Object.freeze(exportableAssetConfig.componentAssets);

// Finally, expose the complete configuration object for external modules.
module.exports = exportableAssetConfig;