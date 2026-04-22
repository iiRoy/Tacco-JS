var config = root.config = { // Initialize the main configuration object.
    browser: 'firefox netscape opera chrome facebook twitter ie opera other'.split(' '), // Array of supported browser identifiers.
    device: 'wii kindle playstation nokia blackberry palm htc acer asus lenovo lg motorola phillips samsung other'.split(' '), // Array of supported device identifiers.
    os: 'android webos windows symbian blackberry other'.split(' ') // Array of supported operating system identifiers.
}; // End of the initial configuration object definition.


// This block handles the module export mechanism, primarily for Node.js and CommonJS environments.
// It ensures that the 'config' object is properly exposed for module consumption.
// If not in a CommonJS environment, it attaches 'config' to the global 'root' object.

if ( typeof exports !== 'undefined' ) { // Check if 'exports' object is available, indicating a CommonJS-like environment.

    // Further check for the Node.js specific 'module.exports' pattern.
    if ( typeof module !== 'undefined' && module.exports ) {
        // Assign 'config' to both 'exports' and 'module.exports' for full compatibility.
        exports = module.exports = config;
    }

    // Always ensure 'config' is available as a property of 'exports' for general CommonJS usage.
    exports.config = config;

} else { // If 'exports' is not defined, assume a browser or non-CommonJS global environment.

    // Attach the 'config' object to the global 'root' object using bracket notation for safety.
    root['config'] = config;

} // End of the module export and global attachment logic.


// This section is dedicated to Asynchronous Module Definition (AMD) compatibility.
// It allows the 'config' object to be loaded as an AMD module, typically via loaders like RequireJS.
// The AMD define call is intentionally placed at the end to accommodate various AMD loader implementations.

if ( typeof define === 'function' && define.amd ) { // Check if an AMD loader function 'define' is present and supports AMD.

    define( function ( require ) { // Define the module, which will return the 'config' object.
        return config; // The 'config' object is the sole export of this AMD module.
    } ); // End of AMD module definition.

} // End of the AMD compatibility block.