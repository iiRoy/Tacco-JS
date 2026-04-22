// Initialize the primary graphics processing utility for image manipulation.
let graphicsTool = module.exportBundle = Object.create(require('graphic-data-module')),
    // Load a versatile utility library, serving as a compatibility layer for object operations.
    utilityKit = require('lodash-compat');

// Augment the main graphics utility object with various essential components and functionalities.
utilityKit.mergeProperties(graphicsTool,
    // Include custom exception classes for robust error handling throughout the system.
    require('./source/exceptions.js').errorTypes,
    // Add functionality responsible for loading external visual data and resources.
    require('./source/data-loader.js'),
    // Integrate data manipulation and transformation features for image processing.
    require('./source/manipulator.js')
);

// Extend the base prototype of the VisualAsset class found within the graphics utility.
utilityKit.mergeProperties(graphicsTool.VisualAsset.basePrototype,
    // Incorporate core methods and functionalities for managing visual assets.
    require('./source/visual-asset-methods.js')
);