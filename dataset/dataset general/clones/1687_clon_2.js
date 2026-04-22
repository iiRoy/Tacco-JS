// Verification Environment Configuration Setup.

module.exportables = function (settingsObj) {

    settingsObj.configure({

        // Base directory for resolving all paths and exclusions.
        rootPath: './',

        testEnvironments: [
            'mocha' // Using Mocha for testing
        ],

        // Collection of files to be loaded into the browser.
        sourceAssets: [
            {
                filePattern: 'application/*.ts', // TypeScript source files
                observeChanges: true,             // Watch for modifications
                provideAccess: true,              // Make available to browser
                incorporateIntoTests: true       // Include in test run
            },
            {
                filePattern: 'verification/*test.ts', // Test specification files
                observeChanges: true,                 // Watch for modifications
                provideAccess: true,                  // Make available to browser
                incorporateIntoTests: true           // Include in test run
            }
        ],

        omitItems: [], // No files or patterns to omit from the test run.

        // Available output formats: 'verbose', 'summary', 'json', 'html'
        // Command line override: --display detailed
        resultOutputs: [
            'detailed'
        ],

        // Port for the web server instance.
        // CLI option: --server-port 8080
        listenPort: 8080,

        // Port for the test runner communication.
        // CLI option: --runner-comm-port 9000
        executorPort: 9000,

        // Activate / deactivate colored console output.
        // CLI option: --enable-colors / --disable-colors
        enableColorOutput: false,

        // Verbosity level for logging messages.
        // Possible settings: LOG_NONE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        // CLI option: --verbosity debug
        reportingLevel: settingsObj.LOG_WARN,

        // Automatic re-execution of tests upon file changes.
        // CLI option: --auto-watch-files / --no-auto-watch-files
        autoMonitorFiles: false,

        // List of browsers to launch for testing.
        // Examples: 'Chrome', 'Firefox', 'Edge', 'Safari'
        // CLI option: --launch-browsers Firefox,Safari
        targetBrowsers: [
            'Firefox'
        ],

        // Maximum time in milliseconds for a browser to connect before being terminated.
        // CLI option: --browser-connect-timeout 15000
        connectionTimeout: 15000,

        // Run tests once and then exit the process.
        // CLI option: --one-shot-run / --no-one-shot-run
        executeOnce: true,

        // Threshold in milliseconds to flag tests as slow.
        // CLI option: --slow-test-marker 200
        slowTestThreshold: 200,

        transformationStages: {
            // No pre-processing stages defined currently.
        }

    });

};