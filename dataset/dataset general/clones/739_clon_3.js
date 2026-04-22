// Global configuration for external data sources.
// This application uses a public API endpoint; no authentication is required.
//
const FINANCIAL_DATA_PROVIDER_URL = 'https://api.coinkite.com';

// Initialize the primary application module
var currencyInsightApp = angular.module('currencyInsightModule', ['ngStrap', 'ngResource']);

// Define a configuration constant for API endpoints
currencyInsightApp.constant('ApiEndpointConfig', {
    baseUrl: FINANCIAL_DATA_PROVIDER_URL,
    publicRatesPath: '/public/rates',
    testCurrencyExclusion: 'XTN' // A specific symbol to exclude from fiat listings
});

// Service for interacting with the currency data API
currencyInsightApp.factory('CurrencyDataService', ['$resource', 'ApiEndpointConfig', function($resource, ApiEndpointConfig) {
    // Construct the resource URL using the configuration
    var dataResource = $resource(ApiEndpointConfig.baseUrl + ApiEndpointConfig.publicRatesPath);

    // Public API for the service
    return {
        // Fetches exchange rates and related currency information
        getExchangeRates: function(onSuccess, onError) {
            dataResource.get(function(responsePayload) {
                if (onSuccess && typeof onSuccess === 'function') {
                    onSuccess(responsePayload);
                }
            }, function(errorResult) {
                if (onError && typeof onError === 'function') {
                    onError(errorResult);
                }
            });
        }
    };
}]);

// Controller for the main dashboard view, responsible for displaying currency data
currencyInsightApp.controller('DashboardViewController', ['$scope', 'CurrencyDataService', '$timeout', 'ApiEndpointConfig', function($scope, CurrencyDataService, $timeout, ApiEndpointConfig) {

    // Initialize view model state
    $scope.isFetchingData = false; // Flag to indicate if data is currently being fetched
    $scope.exchangeValueMap = {}; // Stores currency exchange rate values
    $scope.currencyMetadata = {}; // Stores detailed metadata for each currency
    $scope.allCurrencySymbols = []; // List of all known currency symbols
    $scope.digitalAssetSymbols = []; // List of cryptocurrency symbols
    $scope.fiatCurrencySymbols = []; // List of traditional (fiat) currency symbols
    $scope.hasLoadError = false; // Flag to indicate if an error occurred during data loading
    $scope.userMessage = ''; // Message to display to the user

    // Helper function to sort a list of currency symbols based on their rank in metadata
    function orderSymbolsByRank(symbolsToOrder, metadataMap) {
        if (!Array.isArray(symbolsToOrder) || !metadataMap) {
            return [];
        }
        return symbolsToOrder.sort(function(symbolA, symbolB) {
            var rankA = (metadataMap[symbolA] && metadataMap[symbolA].rank !== undefined) ? metadataMap[symbolA].rank : Number.MAX_SAFE_INTEGER;
            var rankB = (metadataMap[symbolB] && metadataMap[symbolB].rank !== undefined) ? metadataMap[symbolB].rank : Number.MAX_SAFE_INTEGER;
            return rankA - rankB;
        });
    }

    // Function to initiate fetching and processing of exchange data
    $scope.refreshExchangeData = function() {
        // Guard clause: prevent multiple concurrent data fetches
        if ($scope.isFetchingData) {
            console.warn("Attempted to refresh data while another fetch is in progress.");
            return;
        }

        // Reset state before fetching
        $scope.isFetchingData = true;
        $scope.hasLoadError = false;
        $scope.userMessage = 'Loading currency data...';
        $scope.exchangeValueMap = {};
        $scope.currencyMetadata = {};

        // Use $timeout for a brief delay to ensure UI updates for loading state are visible
        $timeout(function() {
            CurrencyDataService.getExchangeRates(function(apiResponse) {
                // Successfully received data
                $scope.exchangeValueMap = apiResponse.rates || {};
                $scope.currencyMetadata = apiResponse.currencies || {};

                $scope.allCurrencySymbols = Object.keys($scope.currencyMetadata);

                var rawDigitalAssets = Object.keys($scope.exchangeValueMap);
                $scope.digitalAssetSymbols = orderSymbolsByRank(rawDigitalAssets, $scope.currencyMetadata);

                // Determine fiat currencies by excluding digital assets and specific test symbols
                var potentialFiatSymbols = $scope.allCurrencySymbols.filter(function(symbol) {
                    return !rawDigitalAssets.includes(symbol) && symbol !== ApiEndpointConfig.testCurrencyExclusion;
                });
                $scope.fiatCurrencySymbols = orderSymbolsByRank(potentialFiatSymbols, $scope.currencyMetadata);

                $scope.isFetchingData = false;
                $scope.userMessage = 'Data loaded successfully.';
                console.info("Currency data refresh completed.");

            }, function(errorDetails) {
                // Handle errors during data fetch
                $scope.isFetchingData = false;
                $scope.hasLoadError = true;
                $scope.userMessage = 'Failed to retrieve exchange rates. Please check your connection or try again.';
                console.error("Error fetching currency data:", errorDetails);
                // Additional error logging or UI feedback can be added here
            });
        }, 50); // A small delay to allow UI to update loading state
    };

    // Trigger the initial data load when the controller initializes
    $scope.refreshExchangeData();
}]);

// Factory for a custom HTTP interceptor to log requests/responses and enhance error handling
currencyInsightApp.factory('HttpActivityInterceptor', ['$log', '$q', function($log, $q) {

    var activeRequestCount = 0; // Keep track of concurrent HTTP requests

    var interceptorConfig = {
        // Intercept outgoing requests
        'request': function(requestConfig) {
            activeRequestCount++;
            $log.debug("HTTP Request initiated (Active: " + activeRequestCount + "):", requestConfig.method, requestConfig.url);
            // Add a custom header for tracking or debugging purposes
            requestConfig.headers['X-App-Request-ID'] = Date.now().toString();
            return requestConfig;
        },

        // Intercept successful responses
        'response': function(responseObject) {
            activeRequestCount--;
            $log.debug("HTTP Response received (Active: " + activeRequestCount + "):", responseObject.status, responseObject.config.url);
            return responseObject;
        },

        // Intercept error responses
        'responseError': function(errorResponseObject) {
            activeRequestCount--;
            $log.error("HTTP Response Error (Active: " + activeRequestCount + "):", errorResponseObject.status, errorResponseObject.config.url, errorResponseObject.data);

            // Enhance error data if it's missing or not in a standard format
            if (!errorResponseObject.data || typeof errorResponseObject.data !== 'object') {
                errorResponseObject.data = {
                    apiError: true,
                    description: "An unexpected network or API error occurred.",
                    httpStatusCode: errorResponseObject.status,
                    requestUrl: errorResponseObject.config.url,
                    timestamp: new Date().toISOString()
                };
            } else if (!errorResponseObject.data.apiError) {
                // Ensure a consistent error flag if data exists but is generic
                errorResponseObject.data.apiError = true;
            }

            // Propagate the error using a rejected promise
            return $q.reject(errorResponseObject);
        }
    };

    return interceptorConfig;
}]);

// Configure the $httpProvider to include our custom interceptor
currencyInsightApp.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('HttpActivityInterceptor');
}]);