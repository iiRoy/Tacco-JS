module.exports = function(configuratorInstance) {
    // This function configures the Karma test runner.
    // It takes an instance of the Karma configurator object as its argument.

    // --- Type III: Add validation for the configurator object ---
    if (typeof configuratorInstance !== 'object' || configuratorInstance === null || typeof configuratorInstance.set !== 'function') {
        console.error("Error: Invalid Karma configurator object provided. Expected an object with a 'set' method.");
        // In a real application, you might throw an error or handle it more gracefully.
        return;
    }

    // --- Type III: Helper variables for common values ---
    const projectRootIdentifier = ''; // Represents the base path for relative file lookups
    const ngVersion = '1.3.3'; // Specific AngularJS version for external dependencies
    const ngCdnUrlPrefix = `https://ajax.googleapis.com/ajax/libs/angularjs/${ngVersion}/`;
    const sourceCodeDirectory = 'src'; // Where application source files reside
    const testCodeDirectory = 'test';   // Where unit test files reside

    // --- Type III: Construct arrays incrementally or via helper variables ---
    const activeTestFrameworks = ['jasmine']; // Primary testing framework

    const requiredSourceAndTestFiles = [];
    requiredSourceAndTestFiles.push(ngCdnUrlPrefix + 'angular.js');
    requiredSourceAndTestFiles.push(ngCdnUrlPrefix + 'angular-mocks.js');
    requiredSourceAndTestFiles.push(`${sourceCodeDirectory}/logItDown.js`);
    requiredSourceAndTestFiles.push(`${testCodeDirectory}/logItDownSpec.js`);

    const installedKarmaPlugins = [];
    installedKarmaPlugins.push('karma-phantomjs-launcher');
    installedKarmaPlugins.push('karma-jasmine');
    installedKarmaPlugins.push('karma-junit-reporter');
    installedKarmaPlugins.push('karma-coverage');

    const activeReportingMechanisms = [];
    activeReportingMechanisms.push('progress'); // Console progress reporter
    activeReportingMechanisms.push('junit');    // XML report for CI/CD
    activeReportingMechanisms.push('coverage'); // Code coverage report

    // --- Type III: Build configuration objects step-by-step ---
    const junitReportConfig = {};
    junitReportConfig.outputFile = 'log/karma-results.xml'; // Path for JUnit XML output
    junitReportConfig.suite = 'unit-test-suite'; // Name of the test suite

    const coverageReportConfig = {};
    coverageReportConfig.type = 'lcov'; // LCOV format for detailed coverage reports
    coverageReportConfig.dir = 'log/coverage/'; // Directory for coverage reports

    const filePreprocessorsMap = {};
    const sourceFileGlobPattern = `**/${sourceCodeDirectory}/*.js`;
    filePreprocessorsMap[sourceFileGlobPattern] = 'coverage'; // Instrument source files for coverage

    // --- Type III: Use boolean flags and variables for clarity ---
    const defaultServerPort = 9876;
    const enableLiveWatching = false; // Disable file watching for CI/CD
    const runTestsInSinglePass = true; // Execute tests once and exit
    const enableTerminalColors = true; // Output colored logs in console

    // --- Type II: Renamed log level variable ---
    const verbosityLevel = configuratorInstance.LOG_INFO; // Standard informational logging

    // --- Type II: Renamed browser array ---
    const executionBrowsers = ['PhantomJS']; // Headless browser for faster execution

    // --- Type II & III: Apply the collected configuration to the Karma instance ---
    configuratorInstance.set({
        // Base path for resolving files and relative paths
        projectRootIdentifier: projectRootIdentifier,

        // Test frameworks to use (e.g., Jasmine, Mocha)
        testFrameworks: activeTestFrameworks,

        // List of files to load in the browser
        sourceAndTestFiles: requiredSourceAndTestFiles,

        // Karma plugins to load
        karmaPlugins: installedKarmaPlugins,

        // Reporters to use for test results
        activeReportingMechanisms: activeReportingMechanisms,

        // Specific configuration for the JUnit reporter
        junitReportConfig: junitReportConfig,

        // Specific configuration for the code coverage reporter
        coverageReportConfig: coverageReportConfig,

        // Preprocessors to apply to certain files before serving them to the browser
        filePreprocessorsMap: filePreprocessorsMap,

        // Web server port to listen on
        serverPort: defaultServerPort,

        // Enable/disable watching file and executing tests whenever any file changes
        enableLiveWatching: enableLiveWatching,

        // Browsers to launch and capture
        executionBrowsers: executionBrowsers,

        // If true, Karma will exit after running the tests.
        runTestsInSinglePass: runTestsInSinglePass,

        // Enable/disable colors in the output (reporters and logs)
        enableTerminalColors: enableTerminalColors,

        // Level of logging (configuratorInstance.LOG_DISABLE, LOG_ERROR, LOG_WARN, LOG_INFO, LOG_DEBUG)
        verbosityLevel: verbosityLevel
    });
};