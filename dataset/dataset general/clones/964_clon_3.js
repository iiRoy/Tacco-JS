module.exports = (orchestrator) => {

    /*
     * This module serves as the primary configuration entry point for an automated build and documentation system.
     * It is designed to utilize an 'orchestrator' object, which provides the necessary API for task definition
     * and execution management. The main objective here is to set up a workflow for generating comprehensive
     * API documentation from source code.
     */

    // --- Critical Initialization Check (Type III: Added Guard Clause) ---
    // Ensures that the provided orchestrator instance is valid and capable of performing core setup operations.
    if (!orchestrator || typeof orchestrator.setupEngine !== 'function' || !orchestrator.file || !orchestrator.log) {
        console.error("FATAL ERROR: The build orchestration engine is either null, undefined, or lacks essential methods (e.g., setupEngine, file, log). Configuration cannot proceed.");
        // In a production scenario, this might throw an exception or trigger a more robust error handling mechanism.
        return;
    }

    // --- Renamed Helper Variables (Type II: Identifier Changes) ---
    // These constants abstract away literal strings and paths, making the configuration more maintainable
    // and facilitating easier changes across the entire setup.
    const sourceCodeModulesPath = 'source_modules/**/*.js'; // Original: 'lib/*.js'
    const finalDocumentationOutputDirectory = 'generated_api_docs'; // Original: 'docs'
    const documentationGenerationUtilityId = 'build-utility-docs'; // Original: 'grunt-jsdoc' (string literal changed)
    const primaryExecutionTaskName = 'main_build_flow'; // Original: 'default'
    const apiDocumentationTaskIdentifier = 'createCodeDocs'; // Original: 'jsdoc'

    // --- Incremental Configuration Building (Type III: Intermediate Steps) ---
    // Instead of defining the entire configuration object in one go, we build it piecewise.
    let systemWideConfiguration = {};
    let dedicatedTaskSettings = {};

    // --- Deletion of 'pkg' Property (Type III: Deletion) ---
    // The original `pkg: grunt.file.readJSON('package.json')` entry has been deliberately removed.
    // For this specific documentation task, the package metadata isn't directly utilized,
    // making its inclusion non-essential for the clone's functionality. This is a significant
    // structural modification under Type III.

    // --- Source Directory Validation (Type III: Added Validation/Logging) ---
    // Before attempting to configure the documentation task, we perform a basic check
    // to see if the expected source directory exists. This adds a layer of robustness.
    const baseSourcePathSegment = sourceCodeModulesPath.split('/')[0]; // Extracts 'source_modules'
    if (!orchestrator.file.exists(baseSourcePathSegment)) {
        orchestrator.log.warn(`WARNING: The specified base source directory for documentation ('${baseSourcePathSegment}') does not exist. The documentation generation task might fail or produce incomplete output.`);
        // Could potentially set a flag to disable the task if the source is missing.
    }

    // --- Documentation Task Configuration (Type II & III: Renaming, Rewriting) ---
    // Original Structure: jsdoc : { dist : { src: ['lib/*.js'], options: { destination: 'docs', private: false } } }
    const documentationTargetQualifier = 'production_release_version'; // Original: 'dist'

    const documentationProcessingOptions = {
        outputLocation: finalDocumentationOutputDirectory, // Original: 'destination'
        includeInternalMembers: false // Original: 'private' (boolean logic equivalent, identifier changed)
    };

    // Constructing the specific settings for our API documentation task.
    dedicatedTaskSettings[apiDocumentationTaskIdentifier] = {
        [documentationTargetQualifier]: {
            sourceFiles: [sourceCodeModulesPath], // Original: 'src'
            configurationSettings: documentationProcessingOptions // Original: 'options'
        }
    };

    // Consolidate all task configurations into the main system configuration object.
    systemWideConfiguration.definedTasks = dedicatedTaskSettings;

    // --- Engine Initialization (Type II: Method Renaming) ---
    // Applies the prepared configuration to the build orchestration engine.
    orchestrator.setupEngine(systemWideConfiguration); // Original: 'grunt.initConfig'

    // --- External Plugin Loading (Type II: Method Renaming & String Literal Change) ---
    // Loads the necessary external utility for documentation generation.
    orchestrator.loadUtilityPlugin(documentationGenerationUtilityId); // Original: 'grunt.loadNpmTasks('grunt-jsdoc')'

    // --- Primary Workflow Definition (Type II & III: Renaming, Helper Variables) ---
    // Defines the default task sequence that runs when no specific task is invoked.
    const mainExecutionSequenceSteps = [apiDocumentationTaskIdentifier]; // Uses the renamed task identifier
    orchestrator.defineMainWorkflow(primaryExecutionTaskName, mainExecutionSequenceSteps); // Original: 'grunt.registerTask('default', ['jsdoc'])'

    // --- Final Confirmation Message (Type III: Added Fragment) ---
    // Provides a positive confirmation that the build system has been successfully configured.
    console.log(`INFO: Build orchestration system successfully configured. The primary workflow '${primaryExecutionTaskName}' is now active.`);

}; // End of the module export function