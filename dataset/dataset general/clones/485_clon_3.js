module.exports = function configureKarma(karmaContext) {
    // Validate the incoming Karma configuration context to ensure it's usable.
    // This is a Type III guard clause addition.
    if (!karmaContext || typeof karmaContext.set !== 'function') {
        console.error("Error: Invalid Karma configuration context provided. Expected an object with a 'set' method.");
        // For robustness, we might exit or throw here, but for a configuration function,
        // simply returning might prevent a crash in a larger system.
        return;
    }

    // --- Type II: Renaming properties and reformatting ---
    // The original `basePath` property is renamed and extracted into a constant.
    const rootProjectPath = './'; // Specifies the base path for resolving files.

    // The original `frameworks` array is renamed and stored in a constant.
    const activeTestFrameworks = ['jasmine']; // Declares the testing framework(s) to be used.

    // --- Type III: Extensive modification of the 'files' array ---
    // The original monolithic 'files' array is broken down into logical segments
    // and then reassembled, demonstrating structural changes.

    // Essential third-party libraries required for the testing environment.
    const thirdPartyLibs = [
        'test/lib/jquery.min.js',
        'test/lib/helpers.js'
    ];

    // Core Angular.js files, including specific versions and modules.
    const angularJsModules = [
        'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.0-beta.5/angular.js',
        'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.0-beta.5/angular-route.js',
        'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.0-beta.5/angular-animate.js',
        'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.0-beta.5/angular-mocks.js' // Angular Mocks for unit testing.
    ];

    // Application source code files to be loaded and potentially tested.
    const applicationSources = [
        'src/**/*.js' // Includes all JavaScript files within 'src' and its subdirectories.
    ];

    // Unit test specification files themselves.
    const unitTestSpecs = [
        'test/unit/**/*.js' // All unit test files located in 'test/unit'.
    ];

    // Concatenate all file groups into a single array for Karma to process.
    // This is an intermediate step, illustrating Type III restructuring.
    let allIncludedFiles = [].concat(
        thirdPartyLibs,
        angularJsModules,
        applicationSources,
        unitTestSpecs
    );

    // Type III: Conditional addition of a file based on an environment variable.
    // This demonstrates adding new logic and external dependencies.
    if (process.env.ENABLE_TEST_HARNESS_DEBUG === 'true') {
        console.log("Debug mode detected: Adding test harness debug utilities.");
        allIncludedFiles.push('test/lib/debug-harness.js'); // Hypothetical debug utility script.
    }

    // --- Type III: Deletion of 'autoWatch' property ---
    // The 'autoWatch' property has been removed. This assumes it will either
    // be configured via command-line arguments or is not desired in this specific setup.
    // A comment could be added here to explain its absence if needed.
    // // Note: `autoWatch` is deliberately omitted; configure via CLI or default settings.

    // --- Type II & III: Renaming and conditional modification of 'browsers' ---
    // The original `browsers` property is renamed and its value can be conditionally altered.
    const executionEnvironments = ['PhantomJS']; // Default browser for testing.

    // Type III: Adding a browser conditionally for CI environments.
    if (process.env.CONTINUOUS_INTEGRATION_BUILD === 'true') {
        console.log("CI environment detected: Including ChromeHeadless for automated builds.");
        executionEnvironments.push('ChromeHeadless'); // Add ChromeHeadless for headless CI execution.
    }

    // --- Type III: Adding new, common Karma configuration properties ---
    // These properties are not in the original code but are standard in Karma configs.
    const additionalReporters = ['progress', 'coverage']; // Report progress and generate code coverage.
    const loggingLevel = karmaContext.LOG_INFO; // Set the logging verbosity.

    // Define preprocessors, e.g., for code coverage instrumentation.
    const codePreprocessors = {
        'src/**/*.js': ['coverage'] // Instrument all source JS files for coverage.
    };

    // Assemble the final configuration object with all modified, added, and renamed properties.
    // This uses an intermediate variable for the entire configuration object.
    const comprehensiveTestConfiguration = {
        // Renamed `basePath`
        projectRootPath: rootProjectPath,
        // Renamed `frameworks`
        testFrameworks: activeTestFrameworks,
        // Renamed `files` and using the dynamically constructed array
        filesToLoad: allIncludedFiles,
        // Added `reporters` property
        reporters: additionalReporters,
        // Added `logLevel` property
        logLevel: loggingLevel,
        // Renamed `browsers` and using the potentially modified array
        targetBrowsers: executionEnvironments,
        // Added `preprocessors` property
        preprocessors: codePreprocessors,
        // Example of another common Karma option not in original, but could be added:
        // singleRun: false // Keep browser open after tests, useful for debugging.
    };

    // Call the `set` method on the Karma context with the new configuration object.
    karmaContext.set(comprehensiveTestConfiguration);
};