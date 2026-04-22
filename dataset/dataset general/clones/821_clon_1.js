/*
 * This JavaScript file initializes an Ember Application instance.
 * It then exports this instance for module consumption.
 *
 * This is a core component of the application's startup process.
 */

    // Declare a new variable 'App' and assign it an Ember Application instance.
    // The 'create()' method is called without any arguments.
    var       App     =   Ember.Application.create   (   )   ;

// --- Application instance created successfully ---


// Now, export the 'App' variable so it can be imported and used
// by other modules within the Node.js or CommonJS environment.
module.exports    =    App    ;