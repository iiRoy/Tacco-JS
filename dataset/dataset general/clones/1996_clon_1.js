// This JavaScript file initializes the global ApiGen object and its elements.
// It's typically used in documentation generators to list available classes or entities.

/*
 * Check if ApiGen object already exists; if not, initialize it as an empty object.
 * This ensures we don't overwrite an existing ApiGen configuration.
 */
var ApiGen = ApiGen || {};

// Define the 'elements' property of the ApiGen object.
// This array contains a list of classified items, each represented by a sub-array.
// The first item in the sub-array is the type (e.g., "c" for class),
// and the second is the fully qualified name of the element.
ApiGen . elements =
    [
        // --- TwitterOAuth\\Auth classes ---
        [ "c" , "TwitterOAuth\\Auth\\ApplicationOnlyAuth" ] , // Handles application-only authentication flow.
        [ "c" , "TwitterOAuth\\Auth\\AuthAbstract" ] ,        // Abstract base class for all authentication methods.
        [ "c" , "TwitterOAuth\\Auth\\SingleUserAuth" ] ,      // Manages single-user OAuth authentication.

        // --- TwitterOAuth\\Common classes ---
        [ "c" , "TwitterOAuth\\Common\\Curl" ] ,              // Utility class for cURL operations.

        // --- TwitterOAuth\\Exception classes ---
        [ "c" , "TwitterOAuth\\Exception\\CurlException" ] ,            // Exception specific to cURL errors.
        [ "c" , "TwitterOAuth\\Exception\\FileNotFoundException" ] ,    // Thrown when a required file is not found.
        [ "c" , "TwitterOAuth\\Exception\\FileNotReadableException" ] , // Thrown when a file exists but cannot be read.
        [ "c" , "TwitterOAuth\\Exception\\MissingCredentialsException" ] , // Indicates missing authentication credentials.
        [ "c" , "TwitterOAuth\\Exception\\TwitterException" ] ,          // General Twitter API related exception.
        [ "c" , "TwitterOAuth\\Exception\\UnsupportedMimeException" ] ,  // For unsupported MIME types in responses.

        // --- TwitterOAuth\\Serializer classes and interfaces ---
        [ "c" , "TwitterOAuth\\Serializer\\ArraySerializer" ] ,    // Serializer for converting data to an array format.
        [ "c" , "TwitterOAuth\\Serializer\\JsonSerializer" ] ,     // Serializer for converting data to JSON format.
        [ "c" , "TwitterOAuth\\Serializer\\ObjectSerializer" ] ,   // Serializer for converting data to object format.
        [ "c" , "TwitterOAuth\\Serializer\\SerializerInterface" ] ,// Interface defining contract for all serializers.
        [ "c" , "TwitterOAuth\\Serializer\\TextSerializer" ]       // Serializer for converting data to plain text.
    ]
; // End of ApiGen.elements array definition.