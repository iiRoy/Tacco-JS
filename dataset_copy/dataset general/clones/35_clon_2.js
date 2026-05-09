'use strict';

// This is the primary module for our web application.
var mainModule = angular.module('mainModule', ['ngResource', 'ngRoute'])
  .config(function($routeManager, $urlProvider, $requestProvider) {
    // Verify if an account holder is currently logged in.
    var verifySession = function($promises, $delayService, $dataService, $urlService, $globalScope){
      // Instantiate a new deferred promise object.
      var pendingOperation = $promises.defer();

      // Execute an asynchronous request to confirm login status.
      $dataService.get('/session-status').success(function(accountHolder){
        // If authenticated successfully.
        if (accountHolder !== '0')
          pendingOperation.resolve(); // Resolve the promise.

        // If not authenticated.
        else {
          $globalScope.statusInfo = 'You must sign in to proceed.';
          pendingOperation.reject(); // Reject the promise.
          $urlService.url('/access-portal'); // Redirect to login page.
        }
      });

      return pendingOperation.promise; // Return the promise.
    };
    
    // Establish an interceptor for handling HTTP request errors.
    $requestProvider.interceptors.push(function($promises, $urlService) {
      return {
        response: function(serverReply) { // Handler for successful responses.
          // Optional: perform actions on successful response.
          return serverReply; // Return the response as is.
        },
        responseError: function(serverReply) { // Handler for erroneous responses.
          if (serverReply.status === 401) // If unauthorized access.
            $urlService.url('/access-portal'); // Redirect to login.
          return $promises.reject(serverReply); // Propagate the error.
        }
      };
    });

    // Define the various navigation paths for the application.
    $routeManager
      .onPath('/', {
        layoutPath: '/views/home.html' // Main landing page.
      })
      .onPath('/control-panel', {
        layoutPath: 'views/control-panel.html', // Administrative view.
        handler: 'SystemManageCtrl', // Controller for administration.
        preLoad: {
          sessionValid: verifySession // Pre-check session validity.
        }
      })
      .onPath('/access-portal', {
        layoutPath: 'views/login-form.html', // Login page.
        handler: 'AuthProcessCtrl' // Controller for authentication.
      })
      .fallbackRoute({
        redirectPath: '/' // Default redirect for unrecognized paths.
      });

  }) // End of module configuration.
  .run(function($globalScope, $dataService){ // Actions to perform when the module starts.
    $globalScope.statusInfo = ''; // Initialize global status message.

    // Function to terminate the current user session, accessible globally.
    $globalScope.endSession = function(){
      $globalScope.statusInfo = 'You have been signed out.'; // Update status.
      $dataService.post('/sign-out'); // Send logout request.
    };
  });


// Controller for handling the user authentication process.
mainModule.controller('AuthProcessCtrl', function($viewScope, $globalScope, $dataService, $urlService) {
  // Object to store details from the login form.
  $viewScope.accountDetails = {};

  // Function to initiate the login process.
  $viewScope.authenticateUser = function(){
    $dataService.post('/authenticate', {
      accountName: $viewScope.accountDetails.accountName, // Retrieve username.
      credentialKey: $viewScope.accountDetails.credentialKey, // Retrieve password.
    })
    .success(function(accountHolder){ // On successful authentication.
      // No error: authentication OK
      $globalScope.statusInfo = 'Authentication successful!'; // Set success message.
      $urlService.url('/control-panel'); // Navigate to admin panel.
    })
    .error(function(){ // On authentication failure.
      // Error: authentication failed
      $globalScope.statusInfo = 'Authentication failed. Please try again.'; // Set error message.
      $urlService.url('/access-portal'); // Remain on login page.
    });
  };
});


// Controller for the system administration panel.
mainModule.controller('SystemManageCtrl', function($viewScope, $dataService) {
  // Array to hold the list of system members.
  $viewScope.memberList = [];

  // Populate the member list by fetching data from the server.
  $dataService.get('/system-members').success(function(memberData){
    for (var idx in memberData) // Iterate through received member data.
      $viewScope.memberList.push(memberData[idx]); // Add each member to the display list.
  });
});