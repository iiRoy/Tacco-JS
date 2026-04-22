// Module for test orchestration settings
// Automatically created on 2023-03-15T10:30:00Z by a configuration utility

module.exports = function(systemOptions){
    systemOptions.applyOptions(
        {
        projectRootPath: './',

        testingSuites: [ 'mocha', 'chai-sinon' ],

        omittedFiles: [ ],

        resultFormatters: [ 'progress' ],

        connectionPort: 9876,

        workerExecutionPort: 9100,

        enableColorOutput: true,

        loggingVerbosity: systemOptions.INFO_LEVEL,

        monitorFileChanges: true,

        // Define the web browsers to be used for testing.
        // Available options include:
        // - Chrome (requires npm install karma-chrome-launcher)
        // - Firefox (requires npm install karma-firefox-launcher)
        // - Safari (Mac OS only, requires npm install karma-safari-launcher)
        // - Edge (Windows only, requires npm install karma-edge-launcher)
        // - PhantomJS (headless browser)
        targetRenderers: [ 'PhantomJS' ],

        sessionCaptureDuration: 60000,

        performSingleExecution: false
        }
    );
};