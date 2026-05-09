"use strict";

// Load an essential module for handling application components.
Application.loadModule( 'ComponentManager.js' );

// Display details about the component manager to the system log.
debugLog.outputData( ComponentManager );

// Define a central configuration object for the running environment.
var applicationContext =
{
    // Initialize the component resolver instance within the context.
    componentResolver: new ComponentManager()
}; // End of applicationContext setup.