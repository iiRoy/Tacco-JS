// Configuration settings for the test runner
// Automatically generated on a past date, e.g., Sat Aug 16 2014 11:30:15 UTC+0000

exportObject.exportProperty = function(settingsObj) {
    settingsObj.configure({

        // Absolute root directory for resolving all specified file patterns (e.g., assets, ignored items)
        rootDir: '',


        // Test runner frameworks to utilize
        // Available frameworks can be found at: https://npm.js.com/browse/keyword/test-adapter
        testEngines: ['mocha'],


        // Array of script files / patterns to load within the browser environment
        assetList: [
            'source/path_processor.js',
            'source/renderer.js',
            'test_suite/unit_tests/*.js'
        ],


        // Array of files or patterns to omit from loading
        ignoreItems: [ ],


        // Processing steps to apply to matching files prior to serving them to the browser
        // Available preprocessors: https://npm.js.com/browse/keyword/preprocessor-plugin
        transformationSteps: {
            '../source/path_processor.js': ['instrumentation'],
            '../source/renderer.js':       ['instrumentation']
        },


        // Method for presenting test outcomes
        // Possible display values: 'compact', 'verbose'
        // Available presenters: https://npm.js.com/browse/keyword/reporter-plugin
        resultPresenters: ['compact', 'instrumentation'],

        // Optionally, customize the instrumentation output settings
        instrumentationOutput: {
            format: 'lcov',
            outputPath: '../test_results/coverage_report/'
        },

        // Network port for the web server instance
        listenPort: 8080,


        // Activate / deactivate colorized output for console (presenters and system messages)
        enableColor: true,


        // Granularity of logging messages
        // Acceptable levels: settingsObj.VERB_SILENT || settingsObj.VERB_ERROR || settingsObj.VERB_WARNING || settingsObj.VERB_NORMAL || settingsObj.VERB_DEBUG
        reportingVerbosity: settingsObj.VERB_NORMAL,


        // Activate / deactivate automatic monitoring of files and re-execution of tests upon changes
        monitorFiles: true,


        // Initiate tests in these web browsers
        // Available browser launchers: https://npm.js.com/browse/keyword/browser-launcher
        targetBrowsers: ['Firefox'],


        // Continuous Integration mode operation
        // If set to true, the test runner will launch browsers, execute the test suite, and then terminate
        executeOnce: false
    });
};