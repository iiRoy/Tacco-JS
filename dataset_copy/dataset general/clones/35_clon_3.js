var mainModule = angular.module('clientApp', ['resourceMod', 'routeMod'])
  .config(function($pathProvider, $urlProvider, $requestProvider) {

    /*
     *  Constant for the API endpoint used to verify user session status.
     *  Ensures consistency and easy modification of the authentication URL.
     */
    const AUTH_CHECK_ENDPOINT = '/api/session_status_check';

    /*
     *  Function to asynchronously verify the current user's login state.
     *  This resolver is used by the router to protect routes requiring authentication.
     *  It returns a promise that resolves if the user is active, or rejects otherwise.
     */
    var obtainSessionVerification = function($promiseService, $delayService, $ajaxService, $navService, $globalScope){
      const sessionAssuranceHandle = $promiseService.defer(); // Initialize deferred object

      // Execute an AJAX GET request to the server to check for an active session.
      $ajaxService.get(AUTH_CHECK_ENDPOINT).then(function(serverReply){
        const activeUserPayload = serverReply.data; // Extract data from the server's response.

        // Check if the payload indicates an authenticated and active user.
        // Assuming serverReply.data contains an object with an 'isAuthenticated' boolean.
        if (activeUserPayload && activeUserPayload.isAuthenticated === true) {
          sessionAssuranceHandle.resolve(activeUserPayload); // User is authenticated, resolve the promise.
        } else {
          // User is not authenticated or session is invalid.
          $globalScope.appStatusNotification = 'You must be logged in to access this resource.';
          sessionAssuranceHandle.reject('ACCESS_DENIED_NOT_AUTHENTICATED'); // Reject with a specific reason.
          $navService.path('/auth-page'); // Redirect the user to the authentication page.
        }
      }, function(errorDetails) {
          // Handle cases where the AJAX call itself fails (e.g., network error, server down).
          $globalScope.appStatusNotification = 'Session verification failed due to a server error.';
          sessionAssuranceHandle.reject('SESSION_VERIFICATION_FAILED_SERVER_ERROR');
          $navService.path('/error-page'); // Redirect to a general error page.
      });

      return sessionAssuranceHandle.promise; // Return the promise for route resolution.
    };

    /*
     *  Configuration for HTTP request interceptors.
     *  This interceptor specifically handles 401 Unauthorized responses,
     *  redirecting the user to a login page and providing a notification.
     */
    $requestProvider.interceptors.push(function($promiseService, $navService, $globalScope) {
      return {
        // Intercept successful responses (optional: for logging or data transformation).
        response: function(httpResponse) {
          // console.log('HTTP request completed successfully:', httpResponse.config.url);
          return httpResponse;
        },
        // Intercept responses that indicate an error.
        responseError: function(httpResponse) {
          // If the server returns a 401 (Unauthorized) status code.
          if (httpResponse.status === 401) {
            $globalScope.appStatusNotification = 'Your session has expired or is invalid. Please log in again.';
            $navService.path('/auth-page'); // Force navigation to the login page.
            // Additionally, clear any stored user data from the global scope for security.
            delete $globalScope.currentAuthenticatedUser;
          }
          return $promiseService.reject(httpResponse); // Propagate the error for other handlers.
        }
      };
    });

    /*
     *  Definition of all client-side application routes.
     *  Each route maps a URL path to a template and a controller,
     *  with some routes requiring session verification.
     */
    $pathProvider
      .when('/', {
        templateUrl: '/app_components/home.html' // Home page template.
      })
      .when('/secure-dashboard', { // Route for an authenticated user dashboard.
        templateUrl: 'app_components/dashboard-view.html',
        controller: 'ManagementConsoleController', // Controller for the dashboard.
        resolve: {
          // Ensure user is logged in before allowing access to this route.
          // The promise from obtainSessionVerification must resolve.
          userSessionData: obtainSessionVerification
        }
      })
      .when('/auth-page', { // Route for user login/authentication.
        templateUrl: 'app_components/authentication-form.html',
        controller: 'UserAuthenticationController' // Controller handling login logic.
      })
      .otherwise({
        redirectTo: '/' // Default fallback route for unknown paths.
      });

  }) // End of the main module's configuration block.
  .run(function($globalScope, $ajaxService){
    // Initialize a global status message that can be displayed across the application.
    $globalScope.appStatusNotification = 'Application initialized. Ready for user interaction.';

    /*
     *  A global function accessible from any part of the application ($rootScope)
     *  to initiate the user logout process.
     */
    $globalScope.terminateUserSession = function(){
      $globalScope.appStatusNotification = 'Attempting to log out...';
      $ajaxService.post('/api/user_logout').then(function() { // Send a POST request to the logout endpoint.
          $globalScope.appStatusNotification = 'You have been successfully logged out.';
          // Clear any user-specific data from global scope upon successful logout.
          delete $globalScope.currentAuthenticatedUser;
      }, function(logoutError) {
          $globalScope.appStatusNotification = 'Logout failed: ' + (logoutError.data ? logoutError.data.message : logoutError.statusText);
          console.error('Logout operation failed:', logoutError);
      });
    };
  });


/*
 *  Controller responsible for handling user authentication processes,
 *  including login attempts and managing input credentials.
 */
mainModule.controller('UserAuthenticationController', function($viewScope, $globalScope, $ajaxService, $navService) {
  // Model to bind user input from the login form.
  $viewScope.loginCredentials = {
      usernameInput: '',
      passwordInput: ''
  };

  /*
   *  Helper function to reset the login form fields and clear any related messages.
   */
  $viewScope.resetLoginForm = function() {
      $viewScope.loginCredentials.usernameInput = '';
      $viewScope.loginCredentials.passwordInput = '';
      $globalScope.appStatusNotification = ''; // Clear previous status messages.
      console.info('Login form has been reset.'); // Debugging log.
  };

  /*
   *  Function triggered when the user attempts to log in.
   *  Performs client-side validation and sends credentials to the server.
   */
  $viewScope.processLoginAttempt = function(){
    const userIdentifier = $viewScope.loginCredentials.usernameInput;
    const userSecret = $viewScope.loginCredentials.passwordInput;

    // Client-side validation: ensure both fields are filled.
    if (!userIdentifier || !userSecret) {
        $globalScope.appStatusNotification = 'Both username and password are required for login.';
        return; // Halt execution if validation fails.
    }

    $globalScope.appStatusNotification = 'Authenticating user...'; // Provide immediate feedback.

    // Send the login credentials to the server-side authentication endpoint.
    $ajaxService.post('/api/authenticate_user', {
      username: userIdentifier,
      password: userSecret
    })
    .then(function(loginResponse){
      // Authentication was successful.
      const userProfile = loginResponse.data; // Server usually returns user details.
      $globalScope.appStatusNotification = `Welcome back, ${userProfile.displayName || userIdentifier}!`;
      $globalScope.currentAuthenticatedUser = userProfile; // Store user profile globally.
      $navService.path('/secure-dashboard'); // Redirect to the secure dashboard.
    })
    .catch(function(loginError){
      // Authentication failed.
      const errorPayload = loginError.data; // Extract error message from server response.
      $globalScope.appStatusNotification = errorPayload && errorPayload.message ? errorPayload.message : 'Login failed. Please check your credentials.';
      $navService.path('/auth-page'); // Remain on the login page.
      $viewScope.resetLoginForm(); // Clear form fields after a failed attempt.
      console.warn('User login attempt failed:', loginError);
    });
  };
});


/*
 *  Controller for the management console/dashboard view.
 *  Responsible for fetching and displaying a list of registered users.
 */
mainModule.controller('ManagementConsoleController', function($viewScope, $ajaxService, $globalScope) {
  // Array to hold the list of registered users fetched from the server.
  $viewScope.registeredAccounts = [];
  $viewScope.isDataLoading = true; // Flag to indicate data loading state.
  $viewScope.lastFetchTime = null; // Timestamp for the last data fetch.

  // Function to fetch the list of users from the backend API.
  const fetchRegisteredAccounts = function() {
      $viewScope.isDataLoading = true;
      $globalScope.appStatusNotification = 'Retrieving user list from server...';
      $viewScope.registeredAccounts = []; // Clear current list before fetching new data.

      $ajaxService.get('/api/get_all_users').then(function(response){
        $viewScope.isDataLoading = false; // Data loading complete.
        $viewScope.lastFetchTime = new Date(); // Update last fetch timestamp.
        const fetchedUserRecords = response.data; // Extract the user array.

        // Validate that the received data is indeed an array.
        if (Array.isArray(fetchedUserRecords)) {
            // Populate the scope array with fetched user records.
            fetchedUserRecords.forEach(function(individualUser) {
                $viewScope.registeredAccounts.push(individualUser);
            });
            $globalScope.appStatusNotification = `Successfully loaded ${fetchedUserRecords.length} user accounts.`;
        } else {
            $globalScope.appStatusNotification = 'Warning: Received user data was malformed or empty.';
            console.warn('Expected an array of users, but received:', fetchedUserRecords);
        }
      }).catch(function(errorDetails) {
          $viewScope.isDataLoading = false;
          $globalScope.appStatusNotification = 'Failed to retrieve user list: ' + (errorDetails.data ? errorDetails.data.message : errorDetails.statusText);
          console.error('Error during user list retrieval:', errorDetails);
      });
  };

  // Initial call to fetch users when the controller loads.
  fetchRegisteredAccounts();

  // Expose the refresh function to the view scope.
  $viewScope.triggerAccountListRefresh = function() {
      $globalScope.appStatusNotification = 'Refreshing user account list...';
      fetchRegisteredAccounts(); // Re-run the fetch operation.
  };
});