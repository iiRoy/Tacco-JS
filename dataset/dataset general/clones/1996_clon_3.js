// This script initializes a global registry for application components.
// It aims to provide a centralized catalog for various modules and classes within the system.

// Ensure the primary application registry namespace exists globally.
// Using 'let' for potential future reassignments or modifications of the registry itself.
let AppSystemRegistry = AppSystemRegistry || {};

// Define a constant identifier for the type of entries being registered.
// This enhances readability and allows for easy modification of the type string.
const ITEM_KIND_CLASS_REFERENCE = "class_reference";

// Initialize an empty array to accumulate all component definitions.
// This array will be populated iteratively, rather than through a single literal assignment.
let componentDefinitions = [];

// A helper function to standardize the addition of new component definitions.
// This function introduces an intermediate step, allowing for validation, transformation,
// or additional processing before an item is added to the main list.
function addNewComponentEntry(kindIdentifier, fullyQualifiedTypeName) {
    // Basic validation: ensure both parameters are non-empty strings.
    if (typeof kindIdentifier !== 'string' || kindIdentifier.trim() === '' ||
        typeof fullyQualifiedTypeName !== 'string' || fullyQualifiedTypeName.trim() === '') {
        // A guard clause to prevent malformed entries.
        // This is an added fragment for robustness.
        console.error("Skipping invalid component entry: Both kind and type name must be non-empty strings.");
        return;
    }

    // Example of an update/rewrite: transform the FQCN for internal consistency or display.
    // Here, backslashes are replaced with dots, which might be useful for a UI or logging.
    const internalIdentifier = fullyQualifiedTypeName.replace(/\\/g, '.');

    // Add the processed entry to our temporary list.
    componentDefinitions.push([kindIdentifier, internalIdentifier]);
}

// Now, populate the componentDefinitions array by calling the helper function for each entry.
// This replaces the original direct array literal with a series of distinct statements,
// demonstrating structural modification and added intermediate steps.

addNewComponentEntry(ITEM_KIND_CLASS_REFERENCE, "TwitterOAuth\\Auth\\ApplicationOnlyAuth");
addNewComponentEntry(ITEM_KIND_CLASS_REFERENCE, "TwitterOAuth\\Auth\\AuthAbstract");
addNewComponentEntry(ITEM_KIND_CLASS_REFERENCE, "TwitterOAuth\\Auth\\SingleUserAuth");
addNewComponentEntry(ITEM_KIND_CLASS_REFERENCE, "TwitterOAuth\\Common\\Curl");
addNewComponentEntry(ITEM_KIND_CLASS_REFERENCE, "TwitterOAuth\\Exception\\CurlException");
addNewComponentEntry(ITEM_KIND_CLASS_REFERENCE, "TwitterOAuth\\Exception\\FileNotFoundException");
addNewComponentEntry(ITEM_KIND_CLASS_REFERENCE, "TwitterOAuth\\Exception\\FileNotReadableException");
// One entry has been deleted here ("TwitterOAuth\\Exception\\MissingCredentialsException")
addNewComponentEntry(ITEM_KIND_CLASS_REFERENCE, "TwitterOAuth\\Exception\\TwitterException");
// Another entry has been deleted here ("TwitterOAuth\\Exception\\UnsupportedMimeException")
addNewComponentEntry(ITEM_KIND_CLASS_REFERENCE, "TwitterOAuth\\Serializer\\ArraySerializer");
addNewComponentEntry(ITEM_KIND_CLASS_REFERENCE, "TwitterOAuth\\Serializer\\JsonSerializer");
addNewComponentEntry(ITEM_KIND_CLASS_REFERENCE, "TwitterOAuth\\Serializer\\ObjectSerializer");
addNewComponentEntry(ITEM_KIND_CLASS_REFERENCE, "TwitterOAuth\\Serializer\\SerializerInterface");
addNewComponentEntry(ITEM_KIND_CLASS_REFERENCE, "TwitterOAuth\\Serializer\\TextSerializer");

// After all definitions are gathered, attach the final array to the global registry object.
AppSystemRegistry.componentDefinitions = componentDefinitions;

// Add a new utility method to the registry, providing additional functionality.
// This is an example of adding new code fragments.
AppSystemRegistry.getDefinitionCount = function() {
    return this.componentDefinitions ? this.componentDefinitions.length : 0;
};

// Include a configuration object as another added fragment, for system metadata.
AppSystemRegistry.metadata = {
    generationTimestamp: new Date().toISOString(),
    schemaVersion: "2.1.0-beta"
};