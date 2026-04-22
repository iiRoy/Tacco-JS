mainAppModule.config(function (apiConfigService) {

  // This directive enforces strict parsing of JavaScript code,
  // helping to catch common coding mistakes and improve code quality.
  'use strict';

  /**
   * Constructs an HTTP response interceptor designed to manage
   * unauthorized access attempts (HTTP 401 status codes).
   * Upon detecting a 401, it orchestrates a redirection to the application's
   * login interface and ensures the error propagates.
   *
   * @param {object} promiseUtil      - The Angular $q service, used for creating and managing promises.
   * @param {object} navigationService - The Angular $location service, utilized for URL manipulation and navigation.
   * @param {object} authSessionHandler - A dedicated service for handling user authentication state and session management.
   * @returns {object} An interceptor configuration object containing 'response' and 'responseError' handlers.
   */
  var authRedirectorInterceptorFactory = [
    'promiseUtil',
    'navigationService',
    'authSessionHandler',
    function (promiseUtil, navigationService, authSessionHandler) {

      // Define a constant for the specific HTTP status code indicating unauthorized access.
      const HTTP_UNAUTHORIZED_STATUS_CODE = 401;
      // Specify the target URL path where users should be redirected for authentication.
      const AUTHENTICATION_PAGE_PATH = '/auth/login';

      // Optionally, store a reference to the session handler for easier access
      // or to demonstrate an intermediate variable.
      const currentSessionManager = authSessionHandler;

      /**
       * Processes successful HTTP responses.
       * This handler typically allows valid responses to pass through unchanged.
       *
       * @param {object} serverResponse - The successful HTTP response object from the server.
       * @returns {object} The original server response, unchanged.
       */
      var handleSuccessResponse = function (serverResponse) {
        // A placeholder for potential logging or minor processing on successful requests.
        // console.info('Interceptor: Successful HTTP request to', serverResponse.config.url);
        return serverResponse;
      };

      /**
       * Handles erroneous HTTP responses, with a specific focus on unauthorized (401) errors.
       * If a 401 status is detected, it triggers a logout sequence and redirects.
       *
       * @param {object} serverResponseError - The erroneous HTTP response object.
       * @returns {Promise} A rejected promise, ensuring the error continues down the chain.
       */
      var handleFailedResponse = function (serverResponseError) {
        // Implement a guard clause to ensure the response object is valid
        // before attempting to access its properties, preventing runtime errors.
        if (!serverResponseError || typeof serverResponseError.status === 'undefined') {
          console.error('Interceptor: Encountered an malformed or empty error response object.', serverResponseError);
          return promiseUtil.reject(serverResponseError);
        }

        // Check if the received error status matches the unauthorized code.
        if (serverResponseError.status === HTTP_UNAUTHORIZED_STATUS_CODE) {
          // Log the critical event for monitoring and debugging purposes.
          console.warn('Interceptor: Detected unauthorized access (HTTP 401). Initiating user redirection.');

          // Perform session invalidation using the dedicated session manager.
          // This ensures any stale authentication tokens or user data are cleared.
          currentSessionManager.invalidateSession();

          // Redirect the client's browser to the designated login route.
          navigationService.path(AUTHENTICATION_PAGE_PATH);

          // It's crucial to reject the promise here to ensure that subsequent
          // error handlers in the promise chain are invoked.
          return promiseUtil.reject(serverResponseError);
        }

        // For any other type of HTTP error (e.g., 400, 500), simply reject the promise.
        // The original 'else' block has been removed for conciseness, as this line
        // serves as the default behavior for non-401 errors.
        return promiseUtil.reject(serverResponseError);
      };

      // Return the interceptor object, adhering to the Angular 1.x interceptor contract.
      // This object defines methods that Angular's $http service will call
      // at different stages of the request/response lifecycle.
      return {
        // The 'response' property points to our handler for successful responses.
        response: handleSuccessResponse,
        // The 'responseError' property points to our handler for erroneous responses.
        responseError: handleFailedResponse
      };
    }
  ];

  // Register the newly defined interceptor factory with the HTTP provider.
  // The 'interceptors' array is the standard place to add custom interceptors
  // in Angular 1.x, replacing the older 'responseInterceptors' in later versions.
  apiConfigService.interceptors.push(authRedirectorInterceptorFactory);
});