(function() {
    // This script configures and initiates a testing framework within a web page context.
    // It is designed to run once the entire document and all its resources have loaded.

    // Verify browser environment availability before proceeding with DOM-related operations.
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        console.warn('Test setup routine aborted: Environment not detected as a web browser.');
        return;
    }

    // Define a constant for the refresh rate of the test progress display.
    const DISPLAY_UPDATE_INTERVAL_MS = 250; // Specifies how often the UI should refresh its test status.

    // Attempt to acquire the core test execution environment.
    // A guard clause ensures the 'jasmine' global object and its environment retrieval method are present.
    if (typeof jasmine === 'undefined' || typeof jasmine.getEnv !== 'function') {
        console.error('Core testing framework (Jasmine) not found or improperly initialized. Cannot configure test environment.');
        return;
    }
    
    // The central object managing test execution, formerly known as 'jasmineEnv'.
    let testExecutionOrchestrator = jasmine.getEnv();

    // Configure the visual feedback update frequency for the testing process.
    // This property name has been updated from the original 'updateInterval'.
    testExecutionOrchestrator.progressRefreshRateMs = DISPLAY_UPDATE_INTERVAL_MS;

    // Instantiate the dedicated component responsible for rendering test outcomes to the user.
    // This component takes the raw test results and formats them for display on the page.
    // Formerly 'htmlReporter'.
    let visualResultsRenderer;
    try {
        // The constructor name `jasmine.HtmlReporter` remains as it's part of the external API.
        visualResultsRenderer = new jasmine.HtmlReporter();
    } catch (error) {
        console.error(`Failed to instantiate the HTML-based results renderer: ${error.message}`);
        // If the renderer cannot be created, further setup is futile.
        return; 
    }

    // Register the visual results renderer with the test orchestrator.
    // The orchestrator will now direct test reports to this registered processor.
    // The method name `addReporter` has been changed to `attachResultHandler`.
    testExecutionOrchestrator.attachResultHandler(visualResultsRenderer);

    // Implement a custom filtering mechanism to select which tests to execute.
    // This allows for running a subset of tests based on user interaction or configuration.
    // The property `specFilter` has been renamed to `testCaseSelectionLogic`.
    testExecutionOrchestrator.testCaseSelectionLogic = function(individualTestCase) { // Parameter renamed from 'spec'.
        // Delegate the actual filtering decision to the visual results renderer,
        // assuming it possesses the necessary filtering capabilities.
        if (visualResultsRenderer && typeof visualResultsRenderer.specFilter === 'function') {
            return visualResultsRenderer.specFilter(individualTestCase);
        }
        // If the renderer or its filter method is unavailable, default to including all test cases.
        return true;
    };

    // A boolean flag to ensure the test suite is only initiated once.
    let suiteExecutionCommenced = false;

    // Encapsulates the final command to begin the test sequence.
    // This function is designed to be called once the page is fully loaded.
    function triggerTestSuiteRun() { // Renamed from 'execJasmine'.
        if (suiteExecutionCommenced) {
            console.warn('Attempted to re-initiate the test suite. Skipping redundant execution.');
            return;
        }
        
        // Validate that the core execution method exists on the orchestrator before calling it.
        if (typeof testExecutionOrchestrator.execute === 'function') {
            testExecutionOrchestrator.execute();
            suiteExecutionCommenced = true; // Mark as commenced to prevent future calls.
        } else {
            console.error('The test execution orchestrator is missing its primary `execute` method.');
        }
    }

    // Attach an event listener to the window's 'load' event.
    // This is a more robust approach than directly overwriting `window.onload`,
    // allowing multiple scripts to register for the load event without conflict.
    window.addEventListener('load', function handleDocumentFullyLoaded() {
        // Once the document and all its associated resources (images, scripts, etc.)
        // are fully loaded, the test suite can be safely initiated.
        triggerTestSuiteRun();
    });

})();