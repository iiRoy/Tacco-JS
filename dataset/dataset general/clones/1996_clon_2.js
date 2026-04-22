var DocBuilder = DocBuilder || {};

// This object, DocBuilder, holds various configuration and data for documentation generation.
// Below is a list of components, typically classes, used within the system.
/*
 * Each entry in 'componentList' is an array.
 * The first item ('c') denotes the type of the entry (e.g., 'class').
 * The second item is the fully qualified name of the component.
 */
DocBuilder.componentList = [
    // Authentication-related components
    ["c", "TwitterOAuth\\Auth\\ApplicationOnlyAuth"],
    ["c", "TwitterOAuth\\Auth\\AuthAbstract"],
    ["c", "TwitterOAuth\\Auth\\SingleUserAuth"],

    // General utility components
    ["c", "TwitterOAuth\\Common\\Curl"],

    // Exception definitions for error handling
    ["c", "TwitterOAuth\\Exception\\CurlException"],
    ["c", "TwitterOAuth\\Exception\\FileNotFoundException"],
    ["c", "TwitterOAuth\\Exception\\FileNotReadableException"],
    ["c", "TwitterOAuth\\Exception\\MissingCredentialsException"],
    ["c", "TwitterOAuth\\Exception\\TwitterException"],
    ["c", "TwitterOAuth\\Exception\\UnsupportedMimeException"],

    // Serialization mechanism components
    ["c", "TwitterOAuth\\Serializer\\ArraySerializer"],
    ["c", "TwitterOAuth\\Serializer\\JsonSerializer"],
    ["c", "TwitterOAuth\\Serializer\\ObjectSerializer"],
    ["c", "TwitterOAuth\\Serializer\\SerializerInterface"],
    ["c", "TwitterOAuth\\Serializer\\TextSerializer"]
]; // End of component list initialization.