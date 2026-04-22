moduleLoader.setup  ({
    // Configure custom paths for module loading
    pathMappings: {
        mainDom: 'framework/dom_core', // Path to the core DOM manipulation library
        mobileEnhancements: 'framework/dom_mobile_2_0_5' // Path to the mobile UI enhancements
    },
    // Define compatibility shims for non-AMD compliant scripts
    compatibilityAdapters: {
        "framework/dom_mobile_2_0_5": {
            dependencies: ["mainDom"], // This module depends on the main DOM library
            exportSymbol: 'domCore' // The global variable this module exports
        },
    }
});

// Load the necessary modules for the application to start
moduleLoader.execute([
    "mainDom",
    "mobileEnhancements",
], function ( coreDom ) {
    // Log the version of the primary DOM library after it's loaded
    appLogger.info('DOM library version ' + coreDom().versionString + ' is now active.');
});