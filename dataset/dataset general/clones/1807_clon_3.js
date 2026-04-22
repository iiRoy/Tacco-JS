/*
 * @fileoverview This script orchestrates the initial setup for a client-side application,
 * handling module definition and dependency loading using an AMD-compatible loader.
 * It ensures the application's core components are available and initialized upon
 * document readiness.
 *
 * @author ApplicationArchitect (developer@example.com)
 * @license Proprietary
 */
/* jshint esversion: 5 */
/* global define:true, require:true, angular: true, console:true, window:true, document:true */

// Self-executing anonymous function to encapsulate scope and prevent global pollution.
(function() {
    'use strict'; // Enforce strict parsing and error handling rules.

    // --- Path Resolution Block ---
    // This section determines the base URL for application modules.
    // It extracts the directory path of the current script, removing any trailing file name.
    // Example: From "http://example.com/app/index.html", it derives "http://example.com/app".

    // Define a regular expression to match the last path segment (e.g., /file.html or /).
    // This pattern identifies either a trailing slash or a slash followed by one or more non-slash characters.
    const trailingPathSegmentPattern = new RegExp(/\/[^\/]+$/);

    // Retrieve the full path of the current browser location.
    const currentDocumentLocationPath = window.location.pathname;

    // Calculate the root directory for modules by removing the last segment from the path.
    // This ensures module paths are relative to the application's root, not the specific HTML file.
    let applicationModuleBaseDirectory = currentDocumentLocationPath.replace(trailingPathSegmentPattern, '');

    // Ensure a fallback or adjustment if the path resolution results in an unexpected empty string
    // or if the root is considered `/` which might need special handling for relative paths.
    if (!applicationModuleBaseDirectory && currentDocumentLocationPath === '/') {
        applicationModuleBaseDirectory = ''; // For root paths, no base directory prefix needed for relative paths
    } else if (applicationModuleBaseDirectory.length > 0 && applicationModuleBaseDirectory.charAt(0) !== '/') {
        // Prepend a slash if it's missing and not an empty string (e.g., for relative paths like 'app')
        applicationModuleBaseDirectory = '/' + applicationModuleBaseDirectory;
    }

    // --- AMD Module Definition for Angular Global ---
    // This block registers the global 'angular' object as an AMD module.
    // It provides a consistent way for other modules to depend on Angular.
    // We'll alias the global `define` for clarity within this clone.
    const amdModuleDefiner = define;

    amdModuleDefiner('angular', function() {
        let angularFrameworkReference; // Intermediate variable for the Angular global.

        // Check if the 'angular' global object is already available in the window scope.
        if (typeof window.angular !== 'undefined' && window.angular) {
            angularFrameworkReference = window.angular;
            console.debug('Angular global detected and registered as AMD module.');
        } else {
            // If Angular is not found, return an empty object as a placeholder or to prevent errors.
            // This might indicate Angular is loaded differently or not present.
            angularFrameworkReference = {};
            console.warn('Angular global not found. Providing an empty object as its AMD module.');
        }
        return angularFrameworkReference;
    });

    // --- AMD Loader Configuration ---
    // This section configures the AMD loader (e.g., RequireJS or Dojo's AMD) with aliases and package locations.
    // This is crucial for the loader to correctly resolve module paths.
    // We'll alias the global `require` for clarity within this clone.
    const amdDependencyLoader = require;

    // Prepare the configuration object for the dependency loader.
    const loaderConfigurationSettings = {
        asyncLoadingEnabled: true, // Enable asynchronous loading of modules.
        modulePathAliases: [ // Define aliases for common modules to simplify their paths.
            ['text', 'dojo/text']
        ],
        applicationModulePackages: [] // Array to hold package definitions.
    };

    // Define the base path for JavaScript files within the application.
    const jsRootPath = applicationModuleBaseDirectory + '/js';

    // Helper function to add package configurations to the settings.
    const addModulePackage = (name, subPath) => {
        // Validate inputs before adding a package.
        if (!name || typeof name !== 'string' || !subPath || typeof subPath !== 'string') {
            console.error('Invalid package name or subPath provided:', name, subPath);
            return;
        }
        loaderConfigurationSettings.applicationModulePackages.push({
            name: name,
            location: jsRootPath + subPath
        });
    };

    // Populate the application module packages using the helper.
    // These paths are relative to the 'js' root defined above.
    addModulePackage('controllers', '/controllers');
    addModulePackage('helpers', '/helpers');
    addModulePackage('widgets', '/widgets');
    addModulePackage('utilities', '/utilities'); // Added a new package for Type III.
    // The 'js' package itself, pointing to the root of the JS directory.
    addModulePackage('js', ''); // Location will be jsRootPath + '' = jsRootPath

    // Apply the constructed configuration to the AMD loader.
    amdDependencyLoader(loaderConfigurationSettings);

    // --- Application Startup Sequence ---
    // This final block loads the main application entry point and initiates it when the DOM is ready.

    // Define the essential modules required for application startup.
    const startupComponents = [
        'dojo/ready', // A module that signals when the DOM is fully loaded.
        'js/bootstrap' // The main application bootstrap module.
    ];

    // Load the startup components using the AMD loader.
    amdDependencyLoader(startupComponents, function(domReadyService, appInitializationModule) {
        // A guard clause to ensure both critical modules were loaded successfully.
        if (!domReadyService || !appInitializationModule) {
            console.error('CRITICAL ERROR: Required startup services (DOM ready or Bootstrap) could not be loaded.');
            // Optionally, throw an error or display a user-friendly message.
            return;
        }

        // Define a function to encapsulate the actual application startup logic.
        const beginApplicationInitialization = () => {
            console.log('Application startup sequence initiated. Preparing to boot...');

            try {
                // Check if the bootstrap module has a 'start' method.
                if (typeof appInitializationModule.start === 'function') {
                    appInitializationModule.start(); // Execute the main application startup routine.
                    console.info('Application bootstrap completed successfully.');
                } else {
                    console.warn('Bootstrap module does not expose a "start" method. Application may not fully initialize.');
                }
            } catch (startupError) {
                console.error('An unhandled error occurred during application startup:', startupError.message, startupError);
                // Further error handling or reporting can be added here.
            }
            // A redundant console log or a debug message can be added for Type III.
            console.debug('Application initialization callback execution finished.');
        };

        // Register the application initialization function to run once the DOM is fully ready.
        domReadyService(beginApplicationInitialization);
    });

}).apply(this); // Using .apply(this) is functionally equivalent to .call(this) for this context.