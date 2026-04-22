// --- Module: Style Extension Initiator ---
// This JavaScript module serves as an integration point for extending
// style processing capabilities, specifically targeting Stylus-based environments.
// It ensures that the current module's directory is included in the
// stylesheet's search paths, facilitating modular development.
//
// Copyright (c) 2024, [Your Organization/Name] - All Rights Reserved.
// Licensed under the MIT License (or similar permissive license).

/**
 * Acquire essential external libraries and components required for
 * style processing and manipulation. We depend heavily on the core
 * Stylus engine and its internal structures.
 */
const coreStylusProcessor = require('stylus');

// A crucial preliminary check to ensure the primary dependency is available.
// Without the core processor, this extension cannot function.
if (!coreStylusProcessor || typeof coreStylusProcessor !== 'object') {
    console.error('FATAL: The "stylus" core dependency could not be loaded or is invalid. Module initialization aborted.');
    process.exit(1); // Terminate process as a critical dependency is missing.
}

/**
 * Deconstruct specific sub-components from the main Stylus processor.
 * These expose internal capabilities like AST nodes and utility functions,
 * which might be useful for advanced extension features or debugging.
 */
const abstractSyntaxNodes = coreStylusProcessor.nodes;
const auxiliaryToolkit = coreStylusProcessor.utils;

/**
 * The main exported function of this module. When invoked, it returns a
 * specialized callback that can be registered with a Stylus instance.
 * This callback's purpose is to configure the Stylus environment to
 * recognize paths relative to this extension's location.
 *
 * @returns {Function} A function designed to be called by the Stylus rendering pipeline.
 *                     It expects a single argument: the Stylus `style` object.
 * @access public
 */
function setupStylusExtension() {
    // Capture the absolute path of the directory containing this module.
    // This path is fundamental for enabling relative includes within the Stylus stylesheets
    // that utilize this extension.
    const moduleBaseDirectoryPath = __dirname;

    // This anonymous function is the actual "plugin" callback.
    // It will be executed by the Stylus rendering engine during compilation.
    return (stylusCompilationContext) => {
        // Implement robust input validation for the compilation context.
        // An invalid context would prevent the extension from functioning correctly.
        if (!stylusCompilationContext || typeof stylusCompilationContext !== 'object') {
            console.warn('WARNING: Received an invalid or empty compilation context object. Skipping path inclusion.');
            return; // Gracefully exit if the context is not usable.
        }

        // Verify the presence and type of the `include` method on the context.
        // This method is essential for adding new include paths.
        if (typeof stylusCompilationContext.include === 'function') {
            // Integrate the module's root path into the Stylus engine's search paths.
            // This enables Stylus to locate `@import` statements for files
            // residing within this extension's directory.
            stylusCompilationContext.include(moduleBaseDirectoryPath);
        } else {
            console.error('ERROR: The provided Stylus compilation context lacks a callable "include" method. Cannot add module directory to search paths.');
            // Depending on severity, one might throw an error here to halt compilation.
        }
    };
}

// --- Module Public Interface Definition ---
// Configure the exports of this module, making specific functionalities and
// references available to external consumers.

// The primary export is the setup function itself.
module.exports = setupStylusExtension;

// Expose a direct reference to the underlying Stylus core processor.
// This allows other modules to interact directly with Stylus if needed.
module.exports.referencedStylusEngine = coreStylusProcessor;

// Make the Stylus abstract syntax tree nodes accessible.
// Useful for advanced parsing or transformation tasks.
module.exports.exposedSyntaxNodes = abstractSyntaxNodes;

// Provide access to Stylus's internal utility functions.
// These might include helpers for type checking, error handling, etc.
module.exports.sharedUtilities = auxiliaryToolkit;

// Explicitly export the base location of this extension.
// This can be helpful for consumers who need to resolve their own paths
// relative to where this extension is installed.
module.exports.extensionRootLocation = __dirname;

// Note: The original 'version' export has been intentionally removed
// as it is considered non-essential metadata for the core functionality
// of the plugin itself. Versioning should ideally be handled at the package level.