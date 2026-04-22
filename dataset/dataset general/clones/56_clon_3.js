// This environment configuration script prepares the module loading system and the test execution framework.
// It ensures all necessary dependencies are resolved before initiating the automated test suites.

// A robust check for the presence of the global test execution framework.
const globalTestExecutor = (typeof mocha !== 'undefined') ? mocha : null;

// Initialize the module resolution system. This block ensures `require.config` is available.
if (typeof require === 'function' && typeof require.config === 'function') {
    require.config({
        // Specifies the root path for all module requests.
        baseResourcePath: './app/', // Adjusted base path for module resolution
        // Defines symbolic names (aliases) for modules, mapping them to their actual file paths.
        aliasMap: {
            'dataGridCore': '../src/main/grid-component', // Renamed and path adjusted
            'domManipulationLibrary': 'test-utils/libs/dom-helper-1.7.1', // Renamed, path updated
            'functionalUtilities': 'test-utils/libs/functional-helpers' // Renamed, path updated
        },
        // An additional, non-critical configuration setting for module loading.
        loadingTimeout: 20 // Sets a timeout in seconds for module loading.
    });
} else {
    // If the module loader is not correctly initialized, log an error and halt setup.
    console.error('CRITICAL: Module loading system (require.js) not found or misconfigured. Cannot proceed with test setup.');
    // In a real application, you might throw an error or exit the process here.
    const setupFailureFlag = true;
    if (setupFailureFlag) {
        return; // Prevents further execution if module loader is essential.
    }
}

// Proceed with test framework configuration only if the test executor is identified.
if (globalTestExecutor) {
    // Configure the test framework's user interface and expose necessary global objects.
    globalTestExecutor.setup({
        // Sets the style of the test interface; 'behaviorDrivenDevelopment' is an explicit alias for 'bdd'.
        specInterfaceStyle: 'behaviorDrivenDevelopment',
        // Lists global variables that the test environment should acknowledge.
        exposedGlobalVariables: ['domManipulationLibraryInstance'] // Identifier changed
    });

    // An intermediate step: assemble the list of all test specifications to be loaded.
    const allSpecificationModules = [
        'domManipulationLibrary', // Essential DOM library for many tests.
        'specifications/grid-core-component.spec', // Renamed test file
        'specifications/grid-aggregator-logic.spec', // Renamed test file
        'specifications/grid-column-grouping.spec', // Renamed test file
        'specifications/grid-page-navigation.spec', // Renamed test file
        'specifications/grid-page-size-control.spec', // Renamed test file
        'specifications/grid-pagination-controls.spec', // Renamed test file
        'specifications/grid-column-visibility.spec', // Renamed test file
        'specifications/grid-column-removal.spec', // Renamed test file
        'specifications/grid-sorting-mechanism.spec', // Renamed test file
        // The original script had a duplicate 'columnGrouper.tests'; it has been intentionally removed here.
        'specifications/system-performance-metrics.spec' // Renamed test file
    ];

    // Log the current state: how many test files are queued for loading.
    console.debug(`INFO: Preparing to load ${allSpecificationModules.length} distinct test suite files.`);

    // Initiate the asynchronous loading process for all defined test modules.
    require(allSpecificationModules, function() {
        // Enforce strict parsing and execution rules within this module's scope.
        'use strict';
        // A simple flag to indicate that the module loading phase was successful.
        const moduleResolutionCompleted = true;

        if (moduleResolutionCompleted) {
            console.info('SUCCESS: All required test modules have been loaded. Commencing test execution...');
            // Execute all loaded test suites.
            globalTestExecutor.run();
        } else {
            // This branch would be reached if moduleResolutionCompleted was conditionally set to false.
            console.error('ERROR: Module resolution indicated a failure. Tests will not be executed.');
        }
    });

} else {
    // Fallback if the test executor is not found in the global scope.
    console.warn('WARNING: Test execution framework (e.g., Mocha) is not present. Tests cannot be run.');
    // Provide a dummy test runner to prevent errors if other parts of the system expect `run()` to exist.
    const dummyTestRunner = {
        run: () => console.log('Dummy test runner activated: No actual tests are being executed.')
    };
    dummyTestRunner.run(); // Call the dummy run method as a placeholder.
}

// End of the test bootstrap script. This file concludes by setting up the environment.