// This file initializes the 'gd' object by extending it with various modules.
// It leverages the 'node-gd' library for image manipulation capabilities
// and 'underscore' for various utility functions, particularly object extension.
//
// Author: Code Clone Generator
// Version: 1.0
// Date: October 27, 2023

/*
 * Declare the primary 'gd' object, which serves as the main export of this module.
 * It is initialized by creating an object based on the 'node-gd' library,
 * providing core image processing functionalities.
 */
var gd = module.exports = Object.create( require( 'node-gd' ) ),
    // Initialize the underscore library. It's used here for its 'extend' method,
    // which facilitates merging properties from multiple source objects into a target object.
    _  = require( 'underscore' ); // End of the 'var' statement.


// --- Extend the 'gd' Object with Core Functionalities ---
// The 'gd' object is augmented with various utility modules.
// This makes error classes, image opening functionalities, and transformation tools
// directly accessible as properties of the 'gd' object.
_.extend(
    gd,                                             // The target object to be extended (our main 'gd' export)
    require( './lib/errors.js' ).classes,           // Incorporate custom error classes
    require( './lib/opener.js' ),                   // Add image opening and loading capabilities
    require( './lib/transform.js' )                 // Integrate image transformation functions (e.g., resizing, cropping)
); // End of the first '_.extend' call.


/*
 * Extend the prototype of 'gd.Image'.
 * This operation adds methods and properties defined in 'image.js' directly to
 * the prototype chain of 'gd.Image'. Consequently, all instances of 'gd.Image'
 * will inherit these new functionalities, making them part of the image object's API.
 */
_.extend(
    gd.Image.prototype,        // The target object for extension: the prototype of the Image class
    require( './lib/image.js' )// The source object containing methods and properties for gd.Image instances
); // End of the second '_.extend' call.

// Module initialization complete. 'gd' is now fully configured and ready for use.