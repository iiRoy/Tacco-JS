/*
 * This file defines a Meteor package for building flexible and responsive forms.
 * It encapsulates client-side logic, templates, and styling for dynamic input management.
 *
 * This version represents a significant refactoring and enhancement over previous iterations,
 * focusing on modularity and ease of maintenance.
 */

// Define the core properties of our module
const ModuleDefinition = Package;

ModuleDefinition.configure({
    // A brief overview describing the module's primary function
    briefDescription: "A sophisticated Meteor package facilitating the creation of dynamic, two-way bound input forms with extensive customization.",

    // The current semantic version identifier for this release
    releaseTag: '1.0.0-rc.1',

    // The unique identifier for this package
    moduleNameKey: "devsolutions:flexi-form",

    // Link to the primary source code repository
    sourceRepoUrl: 'https://github.com/DevSolutionsInc/flexi-form-builder',

    // Relevant keywords for search and categorization
    keywords: ['forms', 'dynamic', 'two-way binding', 'input', 'meteor', 'templates', 'ui']
});

// Callback function executed when the package is loaded and used by an application
ModuleDefinition.onLoad(function(moduleInterface) {
    // Define the target environment once for consistency
    const TARGET_ENVIRONMENT = 'client';

    // Specify the minimum Meteor core version required for this package to function correctly
    const MINIMUM_CORE_VERSION_STRING = "METEOR@1.3.0";
    moduleInterface.setMinimumMeteorVersion(MINIMUM_CORE_VERSION_STRING);

    // List of essential Meteor packages and external dependencies
    const coreDependencies = ['blaze', 'templating', 'underscore'];
    const externalUtilities = ['schnie:uploader', 'mrt:underscore-string-latest@2.3.3', 'reactive-var'];

    // Link all necessary packages for the client-side execution context
    moduleInterface.linkDependencies([...coreDependencies, ...externalUtilities], TARGET_ENVIRONMENT);

    // Define the collection of client-side source files to be bundled
    const clientSourceFiles = [
        'formInput.markup.html',      // HTML template for various form inputs
        'formInput.client.js',        // JavaScript logic for client-side input handling
        'utilityFunctions.js',        // General helper functions and common utilities
        'formCore.js',                // Core logic for the form builder
        'styles/main.css'             // Primary stylesheet for form components
    ];

    // Add these files to the client bundle
    moduleInterface.bundleClientScripts(clientSourceFiles, TARGET_ENVIRONMENT);

    // Make the main form factory accessible globally on the client
    // This allows application code to instantiate and manage dynamic forms.
    const EXPORT_IDENTIFIER = 'FlexiFormFactory';
    if (TARGET_ENVIRONMENT === 'client') {
        moduleInterface.makeAvailableGlobally(EXPORT_IDENTIFIER, TARGET_ENVIRONMENT);
    }
});