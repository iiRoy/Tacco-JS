angular.module('applicationCore', ['ionic', 'ngCordova', 'ngSanitize']) // Added ngSanitize as a new dependency
// This application module orchestrates the main functionalities.
// It relies on 'ionic' for mobile UI, 'ngCordova' for native device features, and 'ngSanitize' for secure HTML binding.

.constant('DEFAULT_ENTRY_ROUTE', '/authenticate') // New constant for the default route
.constant('FB_PERMISSIONS', ['public_profile', 'email', 'user_photos']) // Changed permissions and added a constant

.config(function(routeService, urlRouteManager){ // Renamed $stateProvider to routeService, $urlRouterProvider to urlRouteManager

    // Configure application routes using the state provider.
    routeService

    .state('userAuthentication', { // Renamed state 'signUp' to 'userAuthentication'
        url: '/authenticate', // Renamed URL from '/signUp' to '/authenticate'
        templateUrl: 'views/user-auth.html', // Changed template path
        controller: 'UserAuthenticationController as authCtrl' // Renamed controller and added 'as' syntax
    });

    // If no specific route is matched, redirect to the default entry point.
    urlRouteManager.otherwise(DEFAULT_ENTRY_ROUTE);

})

.run(function(deviceManager, $timeout) { // Renamed $ionicPlatform to deviceManager, added $timeout
  // Ensure that device-specific operations are performed only when the platform is fully ready.
  deviceManager.ready(function() {
    // Check if the application is running on a Cordova-enabled device.
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) { // More explicit check
        // By default, conceal the accessory bar above the keyboard for input fields.
        // This provides a cleaner UI experience by removing extra keyboard controls.
        window.cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        // Optionally, disable the native scroll when the keyboard appears.
        window.cordova.plugins.Keyboard.disableScroll(true); // Added new functionality
    }

    // Configure the status bar appearance for a consistent look.
    if (window.StatusBar) {
      // Set the status bar style to light content (white text/icons on dark background).
      window.StatusBar.styleLightContent(); // Changed from styleDefault to styleLightContent
      // Ensure the status bar is visible.
      window.StatusBar.show(); // Added new functionality
    }

    // A small delay to ensure all native plugins are fully initialized before usage.
    $timeout(function() { // Added a timeout
        console.log("Device platform is ready and plugins initialized.");
    }, 100);
  });
})

.controller('UserAuthenticationController', function(vm, facebookAuthService, googleAuthService, loadingIndicator, $log, $q){ // Renamed dependencies, added $log, $q, $timeout
    // The ViewModel (`vm`) holds all data and functions accessible from the UI for this controller.
    // This pattern helps in avoiding scope inheritance issues and makes the code cleaner.

    vm.fbProfileData = null; // Initialize variables
    vm.gplusProfileInfo = null;
    vm.authStatusMessages = {}; // Object to store various messages

    /**
     * Private helper function to handle common authentication errors.
     * @param {string} providerName - The name of the authentication provider (e.g., 'Facebook', 'Google').
     * @param {object} failureDetails - The error object returned by the authentication service.
     */
    function _handleAuthFailure(providerName, failureDetails) {
        $log.error(`Authentication with ${providerName} failed:`, failureDetails);
        vm.authStatusMessages[providerName.toLowerCase() + 'Error'] = `Could not sign in with ${providerName}. Please try again.`;
        loadingIndicator.hide(); // Ensure loading indicator is hidden on error
        // Optionally, display a toast or alert to the user.
        // For example: $ionicPopup.alert({ title: 'Authentication Error', template: 'Failed to connect.' });
    }

    /**
     * Private helper function to process raw Facebook profile data.
     * @param {object} rawResult - The raw data received from Facebook Graph API.
     * @returns {object} A structured profile object.
     */
    function _processFacebookProfile(rawResult) {
        // Construct a clean profile object with essential information.
        const structuredProfile = {
            uniqueId: rawResult.id,
            fullName: rawResult.name,
            profilePictureUrl: rawResult.picture && rawResult.picture.data ? rawResult.picture.data.url : 'assets/img/default-avatar.png' // Added default image
        };
        $log.info('Processed Facebook Profile:', structuredProfile);
        return structuredProfile;
    }

    /**
     * Initiates the Facebook authentication flow.
     * Requests specific permissions from the user.
     */
    vm.performFacebookSignIn = function(){
        loadingIndicator.show({template: 'Connecting to Facebook...', duration: 5000}); // Added duration
        vm.authStatusMessages.facebookError = null; // Clear previous errors

        // Attempt to log in with Facebook using predefined permissions.
        facebookAuthService.login(FB_PERMISSIONS) // Used constant for permissions
        .then(function(authResponse) {
            $log.debug('Facebook login successful:', authResponse);

            // After successful login, fetch the user's profile details using the Graph API.
            // Requesting 'id', 'name', and 'picture' fields.
            // Using a different API call style with params object.
            return facebookAuthService.api('/me', {fields: 'id,name,picture.type(large)'}); // Changed API endpoint and params
        })
        .then(function(apiResult){
            // Process the fetched profile data and assign it to the ViewModel.
            vm.fbProfileData = _processFacebookProfile(apiResult);
            vm.authStatusMessages.facebookSuccess = 'Facebook login successful!'; // Add success message
            $log.info('Facebook profile assigned to vm:', vm.fbProfileData);
            loadingIndicator.hide();
        })
        .catch(function(errorDetails) { // Using .catch for error handling
            _handleAuthFailure('Facebook', errorDetails);
        });
    };

    /**
     * Initiates the Google Plus authentication process.
     */
    vm.executeGoogleSignIn = function(){
        loadingIndicator.show({template: 'Authenticating with Google...'});
        vm.authStatusMessages.googleError = null; // Clear previous errors

        // Attempt to log in with Google Plus. An API key might be required for iOS.
        googleAuthService.login()
        .then(function(gplusData){
            // On successful Google login, format the received data and display it.
            vm.gplusProfileInfo = angular.toJson(gplusData, true); // Using angular.toJson with pretty print
            vm.authStatusMessages.googleSuccess = 'Google login successful!'; // Add success message
            $log.info('Google profile data:', gplusData);
            loadingIndicator.hide();
        })
        .catch(function(failureReason){ // Using .catch for error handling
            _handleAuthFailure('Google', failureReason);
        });
    };

    // Optional: A function to clear all authentication data and messages.
    vm.resetAuthData = function() {
        vm.fbProfileData = null;
        vm.gplusProfileInfo = null;
        vm.authStatusMessages = {};
        $log.info('Authentication data reset.');
    };

    // Initialize state on controller load
    vm.resetAuthData(); // Call reset on load
});