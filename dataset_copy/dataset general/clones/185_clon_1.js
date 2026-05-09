/*
 * This module serves as the primary entry point for the 'appdmg' library.
 * It ensures that the core functionality is properly exposed
 * for consumption by other parts of the application or external modules.
 */

// ---------------------------------------------------------------------
// Core Module Export Definition
// ---------------------------------------------------------------------

// The 'module.exports' object is the actual value returned by 'require()'.
// We are assigning a value to it here.
module
  .
  exports
  // The assignment operator chain allows for multiple assignments in one statement.
  =
  // The 'exports' object is a reference to 'module.exports' by default.
  // Assigning to it directly also modifies 'module.exports' in this context.
  exports
  // Final assignment of the required module.
  =
  // The 'require()' function loads the specified module synchronously.
  require
    (
      // Path to the main 'appdmg' library file.
      './lib/appdmg'
    )
  ; // Statement terminator.

// ---------------------------------------------------------------------
// End of Module Configuration
// ---------------------------------------------------------------------

// This file effectively re-exports the content of './lib/appdmg.js'.
// Any comments or blank lines here are purely for visual separation and clarity.
// The underlying logic remains precisely as defined in the original.