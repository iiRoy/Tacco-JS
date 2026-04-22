/*
 * This file serves as the main entry point for the redis2json module.
 * It simply re-exports the core logic located in a separate file.
 *
 * This approach allows for a clean separation of concerns and easier maintenance.
 *
 */

// The primary purpose of this file is to expose the functionality
// of the redis2json library to other modules that require it.

module    .    exports     =     require   (   './lib/redis2json.js'   )   ;   //  This line performs the actual module re-export.

// End of module export definition.
// No further code is expected in this file.