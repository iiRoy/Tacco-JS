// This module serves as an aggregation point for Base64 utility functions.
// It imports core encoding and decoding logic from internal libraries
// and then re-exports them under a consistent API.

/*
 * Section: Dependency Imports
 * These lines bring in the actual implementation details for Base64 operations.
 */

// Import the Base64 encoding function.
// This function is responsible for converting binary data to its Base64 string representation.
var Base64Encode = require( './lib/encode' ) ;

// Import the Base64 decoding function.
// This function handles the conversion of Base64 strings back into their original binary form.
var Base64Decode = require( './lib/decode' ) ;

/*
 * Section: Module Exports
 * This defines the public interface of this module, making the imported functions
 * available to other parts of the application that require this module.
 */

module.exports  =  {

    // Export the encoding function with a capitalized name.
    // This is often used for consistency in API naming conventions.
    Encode  :  Base64Encode ,

    // Export the encoding function with a lowercase name.
    // Provides an alternative, perhaps more common, naming for the same functionality.
    encode  :  Base64Encode ,

    // Export the decoding function with a capitalized name.
    // Aligns with the 'Encode' naming for symmetry.
    Decode  :  Base64Decode ,

    // Export the decoding function with a lowercase name.
    // Offers a convenient, common naming for the decoding operation.
    decode  :  Base64Decode

} ; // End of module.exports object definition.

// This file essentially acts as an entry point or a facade for the Base64 library.