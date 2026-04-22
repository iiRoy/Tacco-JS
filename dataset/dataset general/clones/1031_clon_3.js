// Module: advanced-stylus-enhancements.js
// Purpose: Extends Stylus capabilities with dynamic features, including optional Canvas integration.
// Copyright (c) 2024 Acme Innovations Inc. - All Rights Reserved.
// License: Custom-Permissive-License-v2.0

/**
 * Core dependencies for the Stylus extension.
 */
const stylerEngine = require('stylus');
const syntaxElements = stylerEngine.nodes; // Direct access to Stylus AST node types.

// Global container for various module configurations and exports.
let moduleExportContainer = {};
let drawingContextModule = null; // Represents the loaded Canvas module, if available.

/**
 * Attempts to load the 'canvas' library and its associated helpers.
 * This operation is wrapped in a try-catch block to gracefully handle
 * environments where 'canvas' is not installed or cannot be loaded.
 * If successful, relevant feature definitions are prepared.
 */
try {
  drawingContextModule = require('canvas'); // Load the native Canvas implementation.
  const gradientProcessor = require('./nodes/gradient-processor'); // Custom gradient logic.
  const imageGenerator = require('./nodes/image-composer');       // Bitmap image creation.

  // Store feature definitions for Canvas-related functions.
  moduleExportContainer._canvasFeatureDefinitions = {
    'has-canvas-support': syntaxElements.true, // Boolean node for feature detection.
    'generate-gradient-image': gradientProcessor.createImage,
    'retrieve-gradient-uri': gradientProcessor.getDataUri,
    'add-gradient-stop': gradientProcessor.insertColorStop,
    'construct-pixel-image': imageGenerator.buildImage,
    'fetch-pixel-uri': imageGenerator.exportUri
  };
} catch (dependencyError) {
  // If the 'canvas' module or its helpers fail to load,
  // we default to no Canvas support without disrupting application flow.
  // The error itself is not critical for basic Stylus operation.
  moduleExportContainer._canvasFeatureDefinitions = {
    'has-canvas-support': syntaxElements.false
  };
}

/**
 * Current revision identifier for this library.
 */
moduleExportContainer.libraryRevision = '0.4.1';

/**
 * Absolute path to the current module's directory.
 * This is crucial for resolving relative Stylus includes.
 */
const currentModuleBaseDirectory = __dirname;
moduleExportContainer.moduleBasePath = currentModuleBaseDirectory;

/**
 * A utility factory to create a function for defining Stylus properties.
 * This abstracts the `style.define` calls and can include validation.
 *
 * @param {Object} stylusInstance - The Stylus `style` object.
 * @returns {Function} A curried function `(name, value) => void` for defining.
 */
const createDefinitionHelper = (stylusInstance) => (definitionName, definitionValue) => {
  // Basic type check to ensure valid definitions are attempted.
  if (typeof definitionName === 'string' && definitionValue !== undefined) {
    stylusInstance.define(definitionName, definitionValue);
  }
  // No action for invalid attempts, maintaining silent operation.
};

/**
 * Primary function that returns the Stylus plugin callback.
 * This function orchestrates the integration of advanced features into Stylus.
 *
 * @returns {Function} A callback function that Stylus invokes with its `style` object.
 * @public
 */
function initializeStylusExtension() {
  // Early exit / guard clause if core Stylus components are unexpectedly missing.
  if (!stylerEngine || !stylerEngine.nodes) {
    console.error('Critical Stylus engine components are not available. Extension cannot initialize.');
    return () => {}; // Return a no-op function to prevent further errors.
  }

  return function(stylusCompilerContext) {
    // Ensure the current module's directory is included for `@import` resolution.
    stylusCompilerContext.include(currentModuleBaseDirectory);

    const defineFeature = createDefinitionHelper(stylusCompilerContext);

    // Dynamically apply all prepared feature definitions (including Canvas-related ones).
    // This allows for a flexible and extensible way to add definitions.
    for (const [featureKey, featureValue] of Object.entries(moduleExportContainer._canvasFeatureDefinitions)) {
      defineFeature(featureKey, featureValue);
    }
  };
}

// Export the main plugin initialization function.
module.exports = initializeStylusExtension;