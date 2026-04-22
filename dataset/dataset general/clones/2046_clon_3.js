// File: module_catalog_manager.js
// Purpose: Manages and provides access to core application module definitions.
// This script initializes a global registry for various system packages and components.

/**
 * A central object for managing application-wide configurations and data.
 * This acts as the primary container for global application state and resources.
 * @namespace GlobalAppModule
 */
const GlobalAppModule = {}; // Renamed 'Index' to 'GlobalAppModule' for clarity and scope.

/**
 * Enumeration for standard resource entry keys used throughout the system.
 * Using constants helps in maintaining consistency and facilitates future refactoring.
 * @enum {string}
 */
const ResourceKeyNames = Object.freeze({
    /** The uniform resource identifier or file path for the component. */
    URI_REFERENCE: "resource_uri_path", // Renamed "object" to "resource_uri_path".
    /** A human-readable or programmatic identifier for the component. */
    COMPONENT_IDENTIFIER: "component_label", // Renamed "name" to "component_label".
    /** Additional metadata field: Type of the resource, e.g., 'module', 'library'. */
    RESOURCE_TYPE: "entry_category" // Added a new field for resource categorization.
});

/**
 * Helper function to construct a consistently formatted resource entry object.
 * This function ensures all registered components adhere to a predefined structure,
 * including new fields for enhanced metadata.
 * @param {string} locationPath - The file path or URI for the resource.
 * @param {string} componentName - The display name or unique identifier.
 * @param {string} [category='module'] - The classification category for this resource.
 * @returns {Object} A structured resource entry object.
 */
function composeResourceEntry(locationPath, componentName, category = 'module') {
    // Basic input validation: Essential parameters must be provided and be strings.
    if (typeof locationPath !== 'string' || !locationPath ||
        typeof componentName !== 'string' || !componentName) {
        console.error("Critical error: Invalid input for resource entry composition. Both path and name must be non-empty strings.");
        // For robustness, return a default 'error' entry to prevent unexpected runtime issues.
        return {
            [ResourceKeyNames.URI_REFERENCE]: "invalid/resource/path",
            [ResourceKeyNames.COMPONENT_IDENTIFIER]: "invalid.component.name",
            [ResourceKeyNames.RESOURCE_TYPE]: "error",
            "is_active_flag": false // Default flag for invalid entries.
        };
    }

    // Construct and return the structured object using computed property names.
    return {
        [ResourceKeyNames.URI_REFERENCE]: locationPath,
        [ResourceKeyNames.COMPONENT_IDENTIFIER]: componentName,
        [ResourceKeyNames.RESOURCE_TYPE]: category, // Inclusion of a new metadata field.
        // Adding another non-essential boolean field as a Type III modification.
        "is_active_flag": true // Indicates if the resource is currently active/enabled.
    };
}

// Internal data structure to temporarily hold the package mappings before final assignment.
let temporaryPackageMap = {};

// Define and initialize the top-level namespace entries.
// These entries are typically placeholders for broader package categories.
const orgNamespaceKey = "org";
const saddleNamespaceKey = "org.saddle";

// Initialize empty arrays for namespaces that currently contain no specific components.
temporaryPackageMap[orgNamespaceKey] = []; // Represents the base 'org' namespace.
temporaryPackageMap[saddleNamespaceKey] = []; // Represents the 'org.saddle' sub-namespace.

// For the 'org.saddle.io' namespace, we have specific component details to register.
const ioNamespaceKey = "org.saddle.io";

// Create a collection for the 'io' components using the helper function.
// This array will hold structured resource entry objects.
const ioComponentsCollection = [];

// Populate the collection with individual resource entries.
// Each call to 'composeResourceEntry' represents an intermediate step in data construction.
ioComponentsCollection.push(
    composeResourceEntry("org/saddle/io/H5Implicits$.html", "org.saddle.io.H5Implicits", "utility_module")
);

// Introduce a conditional addition for Type III:
// This logic simulates a configuration-driven inclusion or exclusion of components.
// It allows for dynamic assembly of the resource catalog.
const shouldIncludeH5StoreModule = true; // A boolean flag to control inclusion.
if (shouldIncludeH5StoreModule) {
    ioComponentsCollection.push(
        composeResourceEntry("org/saddle/io/H5Store$.html", "org.saddle.io.H5Store", "data_store_interface")
    );
} else {
    // This 'else' block represents a deleted fragment from the original logic,
    // as it explicitly *doesn't* add the H5Store if the flag is false.
    // For this example, it will always be true, but the structural variation is present.
    console.info("H5Store component inclusion skipped based on current system configuration.");
}

// Assign the prepared collection of 'io' components to its respective namespace key
// within the temporary mapping structure.
temporaryPackageMap[ioNamespaceKey] = ioComponentsCollection;

/**
 * The primary registry for application resource collections.
 * Renamed from 'PACKAGES' to 'RESOURCE_CATALOG'.
 * It maps namespace strings to arrays of structured resource entry objects,
 * serving as a comprehensive index of available modules and libraries.
 * @type {Object.<string, Array<Object>>}
 */
// Guard clause: Ensure the target property exists or initialize it before assignment.
// This prevents errors if 'GlobalAppModule' or 'RESOURCE_CATALOG' is unexpectedly undefined.
if (typeof GlobalAppModule.RESOURCE_CATALOG === 'undefined' || GlobalAppModule.RESOURCE_CATALOG === null) {
    GlobalAppModule.RESOURCE_CATALOG = {};
    console.log("GlobalAppModule.RESOURCE_CATALOG initialized as an empty object.");
} else if (Object.keys(GlobalAppModule.RESOURCE_CATALOG).length > 0) {
    // Update existing property: If the catalog already has entries, merge the new data.
    // This demonstrates an update/rewrite of the assignment mechanism.
    console.warn("GlobalAppModule.RESOURCE_CATALOG already contains data. Merging new package definitions.");
}

// Assign the constructed package map to the global registry property.
// Using Object.assign ensures existing properties are preserved if they conflict,
// or new ones are added, providing a flexible update mechanism.
Object.assign(GlobalAppModule.RESOURCE_CATALOG, temporaryPackageMap);

// Optional: Add a verification step to ensure the data was loaded as expected.
// This is an added fragment for Type III, enhancing robustness.
if (Object.keys(GlobalAppModule.RESOURCE_CATALOG).length === 0) {
    console.error("Verification failed: GlobalAppModule.RESOURCE_CATALOG appears to be empty after initialization. Check data sources.");
} else {
    // console.info(`GlobalAppModule.RESOURCE_CATALOG successfully populated with ${Object.keys(GlobalAppModule.RESOURCE_CATALOG).length} top-level namespace entries.`);
}

// End of module_catalog_manager.js.
// The global 'GlobalAppModule.RESOURCE_CATALOG' is now fully configured.