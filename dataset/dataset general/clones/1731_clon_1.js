/*
 * This file defines a Meteor package.
 * It's responsible for describing the package and its dependencies.
 */
Package.describe ( {

    name   :   "mystor:device-detection", // Package name for identification
    summary:   "Client-Side Device Type Detection & Template Switching with Optional Meteor-Router Support", // A brief description
    version:   "0.2.0", // Current version of the package
    git    :   "https://github.com/mystor/meteor-device-detection.git" // Git repository URL

} ); // End of Package.describe configuration

// This section defines what happens when the package is used in an application.
Package.on_use ( function ( api ) {

    // Specify the minimum Meteor version required for this package.
    api.versionsFrom ( 'METEOR@0.9.0' ); /* Requires Meteor 0.9.0 or higher */

    // Declare client-side dependencies.
    api.use ( [
        'meteor',       // Core Meteor functionality
        'underscore',   // Utility library
        'deps',         // Reactive dependencies
        'session',      // Reactive session variables
        'templating',   // Blaze templating engine
        'ui'            // UI helpers and components
    ], 'client' ); // These packages are only used on the client-side

    // Add client-side files to the package.
    api.add_files ( [
        'device_detection.js', // Main device detection logic
        'device_helpers.js'    // Helper functions for device detection
    ], 'client' ); // These files are also only for the client-side

} ); // End of Package.on_use function