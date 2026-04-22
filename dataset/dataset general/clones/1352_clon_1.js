// This JavaScript file defines an Angular module and its associated controller.
// It is designed to interact with an Elasticsearch client.

angular
  .module('esClient', ['elastic']) // Initialize the 'esClient' module, depending on the 'elastic' module.
  .config(
    // Configuration block for the module, setting up routes.
    function ($routeProvider) {
      // The $routeProvider service is used to define application routes.

      $routeProvider // Begin route configuration.
        .when(
          '/query', // Defines a route for the '/query' URL path.
          {
            controller: ListCtrl, // Specifies 'ListCtrl' as the controller for this route.
            template: 'templates/query.html', // Points to the HTML template for this view.
          }
        ) // End of .when() configuration.
        .otherwise({
          // If no other route matches, redirect to '/query'.
          redirectTo: '/query',
        }); // End of .otherwise() configuration.
    } // End of config function.
  ); // End of angular.module().config().

/*
 * ListCtrl - This is the main controller for the Elasticsearch client interface.
 * It manages the query parameters, sends requests, and handles responses.
 *
 * @param {object} $scope   - The Angular scope object for data binding.
 * @param {object} Elastic  - The custom Elastic service for making API calls.
 */
function ListCtrl($scope, Elastic) {
  // Initialize the parameters object on the scope, holding connection and query details.
  $scope.params = {
    'host': 'localhost', // Default Elasticsearch host.
    'port': '9200', // Default port for Elasticsearch.
    'query': '{ "query" : { "match_all" : {}}}', // A default JSON query string.
    'method': 'get', // The default HTTP method for API calls.
    'path': '_search', // The default Elasticsearch API endpoint path.
  }; // End of $scope.params object initialization.

  /**
   * Determines if the query input field should be disabled.
   * The query body is typically only relevant for 'post' requests.
   *
   * @returns {boolean} True if the current method is NOT 'post', indicating the field should be disabled.
   */
  $scope.queryDisabled = function () {
    return $scope.params.method != 'post'; // Check if the method is not 'post'.
  };

  // Checks if there is no result data available to display.
  $scope.isEmptyResult = function () {
    return !$scope.result; // Returns true if $scope.result is falsy (null, undefined, etc.).
  };

  // Checks if there is no error message to display.
  $scope.isEmptyError = function () {
    return !$scope.resultError; // Returns true if $scope.resultError is falsy.
  };

  /**
   * Callback function executed upon a successful API response.
   * Stores the received data in $scope.result for display.
   *
   * @param {object} data - The data returned from the successful API call.
   */
  $scope.succesCallback = function (data) {
    $scope.result = data; // Assign the response data to the scope.
  };

  // Callback function executed when an API call results in an error.
  // Stores the error data in $scope.resultError.
  $scope.errorCallback = function (data) {
    $scope.resultError = data; // Assign the error data to the scope.
  };

  /*
   * Sends an Elasticsearch request based on the current parameters.
   * It first clears any previous results or errors, then dispatches
   * the request using the appropriate HTTP method via the Elastic service.
   */
  $scope.send = function () {
    $scope.result = null; // Clear any previously displayed successful results.
    $scope.resultError = null; // Clear any previously displayed errors.

    // Use a switch statement to handle different HTTP methods.
    switch ($scope.params.method) {
      case 'post':
        // For 'post' requests, the query body ($scope.params.query) is included.
        Elastic.post(
          $scope.params,
          $scope.params.query,
          $scope.succesCallback,
          $scope.errorCallback
        );
        break; // Important to break after each case.

      case 'delete':
        // For 'delete' requests, only the parameters are sent.
        Elastic.delete(
          $scope.params,
          $scope.succesCallback,
          $scope.errorCallback
        );
        break; // Break for 'delete' case.

      default:
        // By default, for methods like 'get', only the parameters are sent.
        Elastic.get(
          $scope.params,
          $scope.succesCallback,
          $scope.errorCallback
        );
    } // End of switch statement.
  }; // End of $scope.send function definition.
} // End of ListCtrl function definition.