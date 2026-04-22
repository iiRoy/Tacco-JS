(function() {
    // This module orchestrates the client-side interaction for our data exploration tool.
    // It depends on a custom HTTP service to communicate with the backend.
    angular.module('dataExplorerApp', ['apiConnector']).
        // Configure the application's routing mechanism.
        config(function(routeProviderConfig) {
            routeProviderConfig.
                // Define a route for the main query interface.
                // The 'ExplorerController' manages the logic, and 'queryPanel.html' provides the UI.
                when('/explorer', {
                    controller: 'ExplorerController',
                    templateUrl: 'views/queryPanel.html'
                }).
                // If no specific route is matched, redirect to the default explorer view.
                otherwise({
                    redirectTo: '/explorer'
                });
        });
})();

/**
 * @ngdoc controller
 * @name dataExplorerApp.controller:ExplorerController
 * @description
 * Manages the user interface and logic for sending requests to the backend API and displaying results.
 * Handles request configuration, execution, and response processing.
 * @param {object} viewModel - The AngularJS scope object, renamed for clarity.
 * @param {object} apiService - A custom service for making HTTP requests (e.g., GET, POST, DELETE).
 */
function ExplorerController(viewModel, apiService) {
    // Define the default configuration for API requests.
    // These values can be modified by the user in the UI.
    const DEFAULT_HOST = '127.0.0.1';
    const DEFAULT_PORT = '9200';
    const DEFAULT_PATH = '/_search';
    const DEFAULT_METHOD = 'get';
    const DEFAULT_PAYLOAD = '{ "query" : { "match_all" : {}}}';

    viewModel.requestSettings = {
        serverAddress: DEFAULT_HOST,
        connectionPort: DEFAULT_PORT,
        endpointPath: DEFAULT_PATH,
        httpMethod: DEFAULT_METHOD,
        requestBody: DEFAULT_PAYLOAD, // JSON payload for POST/PUT requests
        requestTimeoutMs: 10000 // Timeout for API calls in milliseconds
    };

    // Initialize state variables for results, errors, and loading status.
    viewModel.lastOperationOutput = null;
    viewModel.currentOperationError = null;
    viewModel.isOperationActive = false; // Flag to indicate if a request is currently in progress
    viewModel.lastExecutionTimestamp = null; // Timestamp of the last successful or failed request

    /**
     * @ngdoc method
     * @name isPayloadEditorDisabled
     * @methodOf dataExplorerApp.controller:ExplorerController
     * @returns {boolean} True if the request body editor should be disabled (e.g., for GET/DELETE methods).
     * @description
     * Determines whether the payload input field should be interactable based on the selected HTTP method.
     */
    viewModel.isPayloadEditorDisabled = function() {
        const method = viewModel.requestSettings.httpMethod ? viewModel.requestSettings.httpMethod.toLowerCase() : '';
        return method !== 'post' && method !== 'put';
    };

    /**
     * @ngdoc method
     * @name hasNoOperationResults
     * @methodOf dataExplorerApp.controller:ExplorerController
     * @returns {boolean} True if there are no results from the last operation.
     * @description
     * Checks if the last API call yielded any data.
     */
    viewModel.hasNoOperationResults = function() {
        return !viewModel.lastOperationOutput;
    };

    /**
     * @ngdoc method
     * @name hasNoOperationErrors
     * @methodOf dataExplorerApp.controller:ExplorerController
     * @returns {boolean} True if there are no errors from the last operation.
     * @description
     * Checks if the last API call encountered an error.
     */
    viewModel.hasNoOperationErrors = function() {
        return !viewModel.currentOperationError;
    };

    /**
     * @private
     * @name processApiResponse
     * @param {object} responseData - The data received from the API.
     * @param {boolean} isErrorResponse - Flag indicating if this is an error response.
     * @description
     * Internal helper function to handle both success and error responses from the API.
     * Updates the view model with the response data or error information and resets the loading state.
     */
    const processApiResponse = function(responseData, isErrorResponse) {
        viewModel.isOperationActive = false; // Operation has completed
        viewModel.lastExecutionTimestamp = Date.now(); // Record completion time

        if (isErrorResponse) {
            viewModel.currentOperationError = responseData;
            viewModel.lastOperationOutput = null; // Clear previous successful results
        } else {
            viewModel.lastOperationOutput = responseData;
            viewModel.currentOperationError = null; // Clear previous errors
        }
    };

    /**
     * @ngdoc method
     * @name initiateApiRequest
     * @methodOf dataExplorerApp.controller:ExplorerController
     * @description
     * Triggers an API request based on the current `requestSettings`.
     * Clears previous results/errors, sets loading state, validates parameters,
     * and calls the appropriate method on the `apiService`.
     */
    viewModel.initiateApiRequest = function() {
        // Prevent multiple simultaneous requests.
        if (viewModel.isOperationActive) {
            console.warn("An API operation is already in progress. Please wait.");
            return;
        }

        // Reset previous state before starting a new request.
        viewModel.lastOperationOutput = null;
        viewModel.currentOperationError = null;
        viewModel.isOperationActive = true;

        // Basic validation for critical request parameters.
        const { serverAddress, connectionPort, httpMethod } = viewModel.requestSettings;
        if (!serverAddress || !connectionPort || !httpMethod) {
            viewModel.currentOperationError = {
                message: "Missing essential request parameters (host, port, or method).",
                details: "Please ensure all required fields are filled."
            };
            viewModel.isOperationActive = false;
            viewModel.lastExecutionTimestamp = Date.now();
            return;
        }

        // Prepare the configuration object for the API service.
        const requestConfiguration = {
            host: serverAddress,
            port: connectionPort,
            path: viewModel.requestSettings.endpointPath,
            timeout: viewModel.requestSettings.requestTimeoutMs
        };

        // Determine the HTTP method and call the corresponding API service function.
        const selectedMethod = httpMethod.toLowerCase();

        // Define success and error callbacks using the internal handler.
        const successCallback = (data) => processApiResponse(data, false);
        const errorCallback = (err) => processApiResponse(err, true);

        // Dispatch the request based on the HTTP method.
        switch (selectedMethod) {
            case 'post':
                // For POST requests, include the request body.
                apiService.post(
                    requestConfiguration,
                    viewModel.requestSettings.requestBody,
                    successCallback,
                    errorCallback
                );
                break;
            case 'delete':
                apiService.delete(
                    requestConfiguration,
                    successCallback,
                    errorCallback
                );
                break;
            case 'put': // Added PUT as a new supported method
                apiService.put(
                    requestConfiguration,
                    viewModel.requestSettings.requestBody,
                    successCallback,
                    errorCallback
                );
                break;
            case 'get':
            default: // Default to GET for any unrecognized method.
                apiService.get(
                    requestConfiguration,
                    successCallback,
                    errorCallback
                );
                break;
        }
    };
}