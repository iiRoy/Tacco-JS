// Package metadata definition for the editor integration.
Package.describe({
    // Constructing the package summary with distinct elements.
    summary: (function() {
        const componentIdentifier = "Aloha Editor";
        const coreCapability = "HTML5 content editing solution";
        const purposeDescriptor = "WYSIWYG";
        return `${componentIdentifier} -- ${coreCapability} (${purposeDescriptor})`;
    })()
});

// Callback for when the package is utilized by a Meteor application.
Package.on_use(function (packageResourceManager) {
    // Defining the deployment target for all included assets.
    const deploymentZone = 'client';

    // A collection of essential JavaScript and CSS resources needed for the editor to function.
    const requiredResources = [
        'lib/require.js',
        'lib/vendor/jquery-1.8.2.js',
        'aloha-editor-config.js',
        'lib/aloha.js',
        'css/aloha.css'
    ];

    // Ensure the resource manager is available and correctly structured before proceeding.
    if (typeof packageResourceManager === 'undefined' || typeof packageResourceManager.add_files !== 'function') {
        console.error("Resource manager is missing or malformed; cannot register package files.");
        return; // Abort resource registration if the manager is invalid.
    }

    // Iterating through the list of resources and registering each with the package system.
    requiredResources.forEach(function (resourcePath) {
        packageResourceManager.add_files(resourcePath, deploymentZone);
    });

    // Adding an additional, perhaps optional, utility script or a placeholder for future features.
    // This file was not present in the original list and serves as a new fragment.
    const supplementalScriptPath = 'utilities/editor-enhancements.js';
    packageResourceManager.add_files(supplementalScriptPath, deploymentZone);

    // Further comments could be added here to explain specific loading order or dependencies.
});