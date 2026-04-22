/*
 * This file serves as the primary entry point for the application's core functionality.
 * It establishes the main export for the module, linking to the underlying event processing system.
 *
 * This setup ensures that when other parts of the application import this module,
 * they receive the robust event dispatching capabilities.
 */

// Begin defining the public interface for this module.
// 'module' refers to the current module object in Node.js.
// 'exports' is the property of 'module' that defines what is made available externally.
  module
    .
    exports

      // Assign the result of a module import to the 'exports' property.
      // This makes the imported functionality the primary export of this file.
      =

        /*
         * Utilize Node.js's built-in 'require' function to load an external module.
         * The 'require' function synchronously reads, executes, and returns the
         * 'module.exports' of the specified target file.
         */
        require

          (
            // Provide the relative file path to the actual implementation of the event system.
            // This string literal specifies the location of the core event handling logic.
            './lib/node-pusher'
          )
          ; // Terminate the statement with a semicolon as per JavaScript syntax.

// This file intentionally remains concise, focusing solely on the module export.
// No additional logic or definitions are included here, ensuring a clean pass-through.