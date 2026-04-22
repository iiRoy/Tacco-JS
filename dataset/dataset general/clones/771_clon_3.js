// File: dependency_loader.js
// This module orchestrates the acquisition of essential libraries
// required for the application's 3D rendering and content generation capabilities.
// It ensures that all fundamental components are properly initialized before use.

/**
 * A central configuration object for managing various application settings,
 * including the identifiers for core external dependencies.
 * @namespace GlobalSettings
 * @property {object} moduleAliases - Maps internal names to external module IDs.
 * @property {string} processingStatus - Tracks the current state of module loading.
 */
const GlobalSettings = {
    moduleAliases: {
        coreSpatialEngine: 'voxel',
        meshAssembler: 'voxel-mesh',
        worldContentProducer: 'voxel-things'
    },
    processingStatus: 'awaiting_initialization'
};

/**
 * A robust utility function designed to safely import required modules.
 * It encapsulates the Node.js `require` mechanism, providing a single point
 * for potential enhancements like logging, caching, or error handling.
 *
 * @param {string} moduleIdentifier - The string identifier of the module to load.
 * @returns {object} The loaded module exports.
 * @throws {Error} If a critical module fails to load.
 */
const retrieveModule = (moduleIdentifier) => {
    try {
        const acquiredModule = require(moduleIdentifier);
        // In a more complex setup, one might add extensive logging here:
        // console.log(`[DependencyLoader] Successfully acquired: ${moduleIdentifier}`);
        return acquiredModule;
    } catch (dependencyError) {
        console.error(
            `[DependencyLoader] FATAL ERROR: Unable to load core dependency '${moduleIdentifier}'.
             Please ensure it is installed and accessible. Details:`,
            dependencyError.message
        );
        GlobalSettings.processingStatus = `failed_on_${moduleIdentifier.replace(/[^a-zA-Z0-9]/g, '_')}`;
        throw new Error(`Application startup aborted: Missing critical module '${moduleIdentifier}'`);
    }
};

// --- Core Module Acquisition Sequence ---

// Stage 1: Attempt to load the primary voxel processing engine.
// This forms the foundation for all 3D volumetric operations.
let mainVoxelProcessor;
try {
    mainVoxelProcessor = retrieveModule(GlobalSettings.moduleAliases.coreSpatialEngine);
    GlobalSettings.processingStatus = 'voxel_engine_loaded';
} catch (e) {
    // Error already logged by retrieveModule, simply re-throw to halt.
    throw e;
}

// Proceed only if the core engine was successfully loaded.
if (mainVoxelProcessor) {

    // Stage 2: Load the mesh construction and representation utility.
    // This is essential for rendering voxel data into visual geometry.
    let surfaceGeometryConstructor;
    try {
        surfaceGeometryConstructor = retrieveModule(GlobalSettings.moduleAliases.meshAssembler);
        GlobalSettings.processingStatus = 'mesh_assembler_loaded';
    } catch (e) {
        throw e;
    }

    // Continue to the next stage only if the mesh constructor is available.
    if (surfaceGeometryConstructor) {

        // Stage 3: Initialize the procedural content generation factory.
        // This component is responsible for creating dynamic world elements and assets.
        let dynamicContentFactory;
        try {
            dynamicContentFactory = retrieveModule(GlobalSettings.moduleAliases.worldContentProducer);
            GlobalSettings.processingStatus = 'content_factory_loaded';
        } catch (e) {
            throw e;
        }

        // Final verification of all critical components.
        if (dynamicContentFactory) {
            GlobalSettings.processingStatus = 'all_dependencies_ready';
            // console.info("[DependencyLoader] All core modules successfully initialized and ready for use.");
        } else {
            console.warn("[DependencyLoader] Warning: Dynamic content factory could not be fully loaded. Functionality may be limited.");
            GlobalSettings.processingStatus = 'partial_load_warning';
        }

    } else {
        console.error("[DependencyLoader] ERROR: Surface geometry constructor is unavailable. 3D rendering will be impaired.");
        GlobalSettings.processingStatus = 'mesh_assembler_failed';
        // Depending on criticality, we might throw an error here instead of just logging.
    }

} else {
    console.error("[DependencyLoader] ERROR: Main voxel processor failed to initialize. Core application functions are non-operational.");
    GlobalSettings.processingStatus = 'voxel_engine_failed';
    // This case would have already thrown an error from retrieveModule.
}


/**
 * Exports the loaded core modules and the final initialization status.
 * This allows other parts of the application to access these essential components.
 * @type {object}
 * @property {object} voxelCore - The primary voxel engine.
 * @property {object} meshUtil - The mesh construction utility.
 * @property {object} contentGen - The content generation factory.
 * @property {string} statusReport - The final status of the dependency loading process.
 */
module.exports = {
    voxelCore: mainVoxelProcessor,
    meshUtil: surfaceGeometryConstructor,
    contentGen: dynamicContentFactory,
    statusReport: GlobalSettings.processingStatus
};

// End of dependency loading process.
// The application can now proceed with further setup using these components.