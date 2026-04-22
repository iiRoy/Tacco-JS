const SERVICE_PATH_DESCRIPTOR = './docblockr-worker.js';

// Core utility responsible for processing and generating block comments.
// This dependency is crucial for the module's primary function.
const BlockCommentProcessor = require(SERVICE_PATH_DESCRIPTOR);

/**
 * Manages the configuration and lifecycle of the Docblockr comment generation service.
 * This module exports default settings and methods to initialize and control
 * the underlying comment processing engine.
 */
module.exports = {
    /**
     * Default configuration parameters for the comment processing engine.
     * These settings dictate how docblocks are generated, formatted, and aligned.
     * Users can typically override these values via application preferences.
     */
    defaultConfigurationParameters: {
        enableDeepIndentation: true,         // Determines if generated blocks should use deep indentation.
        autoExpandDoubleSlash: true,         // Automatically convert `//` comments to docblocks.
        baseIndentationSpaces: 1,            // Number of spaces for general code indentation.
        paragraphIndentationSpaces: 1,       // Spaces for indentation within a multi-line paragraph.
        tagAlignmentMode: 'strict',          // Controls how `@tags` are aligned: 'none', 'loose', 'strict'.
        supplementaryTags: [],               // An array of additional, custom tags to include.
        positionSupplementaryTagsAfter: false, // If custom tags should be appended at the end of the block.
        typeMappingDefinitions: [],          // Custom mappings for specific type notations.
        returnTagIdentifier: '@returns',     // The specific tag used for return values.
        generateReturnDescription: true,     // Should the description for the return value be automatically created?
        generateParameterDescriptions: true, // Should descriptions for function parameters be automatically created?
        insertSectionSpacer: false,          // Add a blank line between different tag sections (e.g., params and returns).
        sectionSpecificIndentation: false,   // Apply indentation on a per-section basis within the docblock.
        minimumColumnSpacing: 2,             // Minimum spaces between columns when aligning tags.
        automaticallyAddMethodTag: false,    // Automatically insert an `@method` tag for function definitions.
        useLowercasePrimitiveTypes: false,   // Format primitive types (e.g., `string`) in lowercase.
        useAbbreviatedPrimitiveTypes: false, // Use short names for primitive types (e.g., `str` instead of `string`).
        enableDiagnosticLogging: false       // Activates verbose logging for debugging purposes within the module.
    },
    
    /**
     * Initializes the core Docblockr processing service.
     * This method ensures that the `BlockCommentProcessor` is instantiated
     * and made available within the module's execution context.
     *
     * @returns {BlockCommentProcessor} The active instance of the comment processor.
     */
    initializeService: function() {
        // Prevent re-initialization if the processor is already active.
        if (this.activeProcessorInstance) {
            if (this.defaultConfigurationParameters.enableDiagnosticLogging) {
                console.warn('[Docblockr] Service already initialized. Returning existing instance.');
            }
            return this.activeProcessorInstance;
        }

        // Create a new instance of our block comment processing utility.
        const newProcessor = new BlockCommentProcessor();
        
        // Store the newly created instance for future reference within the module.
        this.activeProcessorInstance = newProcessor;

        // Log the successful initialization if diagnostics are enabled.
        if (this.defaultConfigurationParameters.enableDiagnosticLogging) {
            console.info('[Docblockr] Core service successfully initialized.');
        }

        return this.activeProcessorInstance; // Provide access to the initialized processor.
    },

    /**
     * Placeholder method for deactivating the service.
     * In a more complex scenario, this would handle resource cleanup,
     * event unsubscriptions, or state resets.
     */
    deactivateService: function() {
        if (this.defaultConfigurationParameters.enableDiagnosticLogging) {
            console.log('[Docblockr] Service deactivation triggered (no specific cleanup implemented).');
        }
        this.activeProcessorInstance = null; // Dereference the processor instance.
    }
};