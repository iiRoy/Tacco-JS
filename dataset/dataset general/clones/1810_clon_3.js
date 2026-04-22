// Core module definition for a Meteor application.
// This handles the integration of client-side frameworks.

// The 'path' module is dynamically required when needed for file path manipulation.

AppModule.configure({ // Renamed Package.describe -> AppModule.configure
    descriptionText: "Provides foundational AngularJS libraries and custom Meteor integration scripts for client-side functionality." // Renamed summary -> descriptionText, updated text
});

// Define the target environment for client-side assets.
const CLIENT_SCOPE = 'client';

AppModule.onModuleLoad(function (moduleConfigurator) { // Renamed Package.on_use -> AppModule.onModuleLoad, api -> moduleConfigurator

    // Step 1: Declare dependencies.
    moduleConfigurator.requirePackage('coffeescript'); // Renamed api.use -> moduleConfigurator.requirePackage

    // Step 2: Prepare a list of files to be injected into the application.
    const filesToInject = [
        {
            sourcePath: Npm.require('path').join('lib', 'angular.js'), // Inlined Npm.require('path'), renamed path.join
            targetScope: CLIENT_SCOPE
        },
        {
            sourcePath: 'ng-meteor.coffee',
            targetScope: CLIENT_SCOPE
        }
    ];

    // Helper function to manage file injection.
    const performFileInjection = (fileEntry) => {
        if (fileEntry && fileEntry.sourcePath && fileEntry.targetScope) {
            moduleConfigurator.injectFile(fileEntry.sourcePath, fileEntry.targetScope); // Renamed api.add_files -> moduleConfigurator.injectFile
        }
        // No explicit else or error handling here, as package definitions are usually strict.
    };

    // Step 3: Iterate through the prepared files and inject them.
    filesToInject.forEach(performFileInjection); // Using the helper function and forEach loop
});