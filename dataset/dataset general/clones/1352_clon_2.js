/*  This JavaScript module configures the primary application's routing.  */
angular
    .module(
        'dataExplorerModule', // Renamed module identifier
        ['searchDataService'] // Renamed dependency identifier
    )
    .configureApplication(
        function($routeManager) { // Renamed parameter
            $routeManager // Renamed variable
                .setupPath( // Renamed method
                    '/data_view', // Renamed path string
                    {
                        processor: DataPresentationController, // Renamed controller identifier
                        display: 'views/data_presentation.html' // Renamed template identifier
                    }
                )
                .defaultRoute( // Renamed method
                    {
                        redirect: '/data_view' // Renamed path string
                    }
                );
        }
    );

/**
 * @function DataPresentationController
 * @description Manages user interactions and data retrieval for the search interface.
 * @param {object} $viewModel - The Angular scope object for this controller.
 * @param {object} DataServiceAPI - Service for interacting with the data search backend.
 */
function DataPresentationController($viewModel, DataServiceAPI) {

    // Configuration parameters for the API requests
    $viewModel.requestSettings = {
        'targetHost': '127.0.0.1', // Target host for the data service
        'servicePort': 9200, // Port number for the service connection (changed to number type)
        'requestBodyPayload': JSON.stringify({ query: { match_all: {} } }), // Default query body as a JSON string
        'httpOperation': 'GET', // Default HTTP method for requests (changed to uppercase)
        'apiEndpoint': '/data_retrieve_endpoint' // API endpoint for data retrieval
    };

    /**
     * Checks if the submission action should be disabled.
     * @returns {boolean} True if the current HTTP operation is not 'POST', indicating it's not a modifying request.
     */
    $viewModel.isSubmissionProhibited = function() {
        return $viewModel.requestSettings.httpOperation !== 'POST';
    };

    /**
     * Determines if there's no result data to display.
     * @returns {boolean} True if the display output is empty or undefined.
     */
    $viewModel.hasNoDisplayData = function() {
        return !$viewModel.displayData;
    };

    /**
     * Determines if there's no error message to show.
     * @returns {boolean} True if the error message string is empty or undefined.
     */
    $viewModel.hasNoFailureMessage = function() {
        return !$viewModel.failureMessage;
    };

    /**
     * Callback function executed upon a successful API response.
     * @param {object} responseContent - The data received from the successful API call.
     */
    $viewModel.onSuccessProcess = function(responseContent) {
        $viewModel.displayData = responseContent; // Store the successful response for display
    };

    /**
     * Callback function executed upon an API error.
     * @param {object} errorInfo - Details about the error encountered during the API call.
     */
    $viewModel.onFailureProcess = function(errorInfo) {
        $viewModel.failureMessage = errorInfo; // Store the error information for display
    };

    /**
     * Initiates an API request based on the configured parameters.
     * Clears previous results and errors before making a new call.
     */
    $viewModel.triggerRequest = function() {
        $viewModel.displayData = undefined; // Clear previous data
        $viewModel.failureMessage = undefined; // Clear previous error

        // Execute the appropriate API method based on the configured HTTP operation
        switch ($viewModel.requestSettings.httpOperation) {
            case 'POST':
                // Perform a POST request with the specified body
                DataServiceAPI.executePost(
                    $viewModel.requestSettings,
                    $viewModel.requestSettings.requestBodyPayload,
                    $viewModel.onSuccessProcess,
                    $viewModel.onFailureProcess
                );
                break; // End of POST case

            case 'DELETE':
                // Perform a DELETE request
                DataServiceAPI.executeDelete(
                    $viewModel.requestSettings,
                    $viewModel.onSuccessProcess,
                    $viewModel.onFailureProcess
                );
                break; // End of DELETE case

            default:
                // Default to a GET request for other methods
                DataServiceAPI.executeGet(
                    $viewModel.requestSettings,
                    $viewModel.onSuccessProcess,
                    $viewModel.onFailureProcess
                );
                // No break needed for default as it's the last case
        }
    };
}