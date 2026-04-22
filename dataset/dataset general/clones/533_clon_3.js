// This configuration block initiates the module loading system for the application.
// It establishes aliases for script locations and defines explicit loading dependencies.
// The structure has been modified for enhanced clarity, modularity, and error handling.

// Safely obtain a reference to the global module loader.
// This guard clause ensures that the RequireJS environment is present before proceeding.
const moduleLoaderInstance = window.require;

if (typeof moduleLoaderInstance !== 'undefined' && typeof moduleLoaderInstance.config === 'function') {

    // Define a consistent base directory for all JavaScript assets to simplify path management.
    const javascriptAssetBase = 'app/scripts/';

    // Construct a comprehensive map of module identifiers to their respective file paths.
    // This allows for cleaner code by using short aliases instead of full file paths.
    const modulePathMappings = {
        // Core utility library, serving as the foundation (originally jQuery).
        coreUtility: javascriptAssetBase + 'libs/main_lib_v3',
        // User interface enhancement framework for mobile devices (originally jQuery Mobile).
        mobileUiToolkit: javascriptAssetBase + 'plugins/mobile_ui_framework_1.3.2'
    };

    // Prepare the dependency declaration rules for modules that are not natively AMD-compliant.
    // This ensures proper loading order and global variable availability.
    const dependencyConfiguration = {};

    // Define the specific loading rules for the mobile UI toolkit.
    // It explicitly states its reliance on the core utility library.
    const toolkitLoadingRules = {
        prerequisiteModules: ['coreUtility'], // Renamed from 'deps'
        // The original 'exports: 'jquery'' for jQuery Mobile was likely a misconfiguration or placeholder.
        // jQuery Mobile extends jQuery, it doesn't export 'jquery' itself.
        // This property is omitted here as it's non-essential and potentially misleading for this module.
    };
    dependencyConfiguration['mobileUiToolkit'] = toolkitLoadingRules;

    // Apply the prepared path mappings and dependency rules to the module loader.
    moduleLoaderInstance.config({
        modulePaths: modulePathMappings,      // Renamed from 'paths'
        moduleDependencies: dependencyConfiguration // Renamed from 'shim'
    });

    // --- Application Startup Sequence ---

    // Define the essential modules that must be loaded before the application's entry point can execute.
    const essentialApplicationModules = [
        "coreUtility",    // Renamed from "jquery"
        "mobileUiToolkit" // Renamed from "jqueryMobile"
    ];

    // This function serves as the primary entry point for the application
    // once all specified modules have been successfully loaded.
    const initializeApplicationAfterLoad = function (primaryLibraryHandle) { // Renamed parameter from '$'
        // Perform a basic validation to ensure the core utility library was loaded correctly.
        if (primaryLibraryHandle && typeof primaryLibraryHandle.fn === 'object' && primaryLibraryHandle.fn.jquery) {
            // The original console log was a development-time diagnostic.
            // It has been removed as part of streamlining for production, or
            // would be replaced by a more robust logging mechanism if needed.
            // console.info(`Application initialized. Core utility library version: ${primaryLibraryHandle.fn.jquery}`);
        } else {
            // Log a critical error if the core library is missing or malformed,
            // which would indicate a significant issue with module loading.
            console.error('CRITICAL ERROR: The core utility library failed to load or is not properly structured.');
        }
    };

    // Initiate the asynchronous loading of all required modules and, upon completion,
    // execute the application's initializer function.
    moduleLoaderInstance.load(essentialApplicationModules, initializeApplicationAfterLoad); // Renamed from 'require'

} else {
    // If the module loader is not found, output an error to the console,
    // indicating that the prerequisite for module management is missing.
    console.error('INITIALIZATION FAILED: Module loader (RequireJS equivalent) is not available on the window object.');
}