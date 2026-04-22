/* This setup integrates a specific dependency into a global host object. */

( function ( hostApp )
{
  // Acquire the necessary module for integration.
  var controllerModule = require('arbiter');

  // Register the acquired module with the host application.
  hostApp.registerComponent( controllerModule );
} ( mainHost ) ); // Execute the function with the primary host object.