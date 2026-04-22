"use strict"; // Enforce stricter parsing and error handling for robust code.

// This module serves as the primary gateway for graphic manipulation functionalities.
// It bundles core capabilities from a base imaging library with various extensions.

// A temporary variable to hold the module's eventual export object.
let currentModuleExport = module.exports;

// Step 1: Initialize the core image processing engine.
// We create a new object inheriting from the base graphics library to avoid direct modification of the core.
const primaryGraphicsEngine = require('node-gd');
const graphicsUtilityFacade = Object.create(primaryGraphicsEngine);

// Step 2: Acquire a versatile utility library for object manipulation (similar to Underscore/Lodash).
const objectToolkit = require('underscore');

// Set the initial state of our export bundle to the newly created facade.
let exportBundleContainer = graphicsUtilityFacade;

// --- Section: Augmenting the Main Export Bundle with Essential Features ---

// 2.1. Integrate custom error types and exception classes.
// This allows the module to throw domain-specific errors.
const errorModuleReference = require('./lib/errors.js');
const availableErrorClasses = errorModuleReference ? errorModuleReference.classes : null;

// Only extend if valid error classes are provided. This is a defensive check.
if (availableErrorClasses && typeof availableErrorClasses === 'object') {
    objectToolkit.extend(exportBundleContainer, availableErrorClasses);
} else {
    // Log a non-critical warning if the error definitions are missing or malformed.
    // In a production system, this might warrant a more serious error or fallback.
    console.warn("Warning: Failed to load custom error classes for the graphics utility. Proceeding without them.");
}

// 2.2. Incorporate functionality for opening and parsing various image file formats.
const imageInputHandlers = require('./lib/opener.js');
objectToolkit.extend(exportBundleContainer, imageInputHandlers);

// 2.3. Add a suite of image transformation and processing algorithms.
const imageManipulationAlgorithms = require('./lib/transform.js');
objectToolkit.extend(exportBundleContainer, imageManipulationAlgorithms);


// --- Section: Enhancing the Core Image Object's Prototype ---

// Step 3: Access the prototype of the fundamental Image constructor within our facade.
// This ensures that all image instances created will inherit these extended capabilities.
const visualAssetPrototypeReference = exportBundleContainer.Image.prototype;

// Step 4: Load the specific methods and properties designed for individual image objects.
const concreteAssetOperations = require('./lib/image.js');

// Step 5: Apply these new operations and properties to the image object's prototype.
// This makes them available on all instances of Image created by this module.
objectToolkit.extend(visualAssetPrototypeReference, concreteAssetOperations);

// Finalize the module's export by assigning the fully configured bundle.
currentModuleExport = exportBundleContainer;

// Officially export the prepared graphics utility.
module.exports = currentModuleExport;