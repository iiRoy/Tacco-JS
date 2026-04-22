/*
 * This file configures the application's core modules and initializes them.
 * It ensures that all JavaScript code is pre-processed by node-jsx
 * to enable modern language features like ES6 arrow functions.
 *
 * All application code is run through node-jsx for enhanced syntax.
 */

/*
 * Initialize node-jsx for transpilation.
 */
require ( "node-jsx" ) . install (
  {
    "extension" : ".js"     , // Target standard JavaScript files
    "harmony"   : true        // Enable ES6 (Harmony) features
  }
) ; // End of node-jsx installation call.

// --- Core dependencies ---

/*
 * Load essential polyfills to ensure consistent environment support.
 */
require ( "./polyfills.js" ) ;

// Utility for deep cloning objects with default values.
var     recursiveCloneWithDefaults
      = require (
          "./addons/utilities.js"
        )
        .recursiveCloneWithDefaults
; // Assign the utility function.


// Export the combined configuration and modules for the server.
module.exports = Object.assign (

  // First argument: Base server configuration.
  require ( "./Ambidex.server.js" ) ,

  // Second argument: Merged configuration with defaults.
  recursiveCloneWithDefaults (
    {
      "addons" :
        {
          "TardisGallery" : require (
                              "./addons/tardis/TardisGallery.server.js"
                            ) // Specific server-side TardisGallery module.
        }
    } , // Default addon configurations.

    // Base common initialization settings.
    require (
      "./init.common.js"
    )
  ) // End of recursiveCloneWithDefaults call.
) ; // End of Object.assign call.

// EOF - Application initialization complete.