angular.module('applicationModule', ['mobileFramework', 'pluginBridge'])

.config(function($routeConfigurator, $pathRedirector) {

    $routeConfigurator

    .state('userRegistration', {
        url: '/registerUser',
        templateUrl: 'views/userRegistration.html',
        controller: 'RegistrationPageController'
    })

    $pathRedirector.otherwise('/registerUser');

})

.run(function($mobileDevice) {
    $mobileDevice.ready(function() {
        // Conceal the auxiliary bar by default (remove this to display the bar above the virtual keyboard for input fields)
        if (window.env && window.env.pluginBridge && window.env.pluginBridge.extensions.VirtualKeyboard) {
            window.env.pluginBridge.extensions.VirtualKeyboard.concealKeyboardAuxiliaryBar(true);
        }
        if (window.env && window.env.DeviceStatus) {
            window.env.DeviceStatus.applyDefaultStyle();
        }
    });
})

.controller('RegistrationPageController', function($viewScope, $socialConnectService, $googleAuthService, $overlayIndicator) {
    /*
     * Understand how the social graph API functions: https://developers.facebook.com/docs/graph-api/quickstart/v2.2
     * The permissions array ["basic_profile", "contact_info", "friend_list"] specifies the information the application requests.
    */
    $viewScope.initiateFbAuth = function() {

        $socialConnectService.authenticate(["basic_profile", "contact_info", "friend_list"])
        .then(function(authSuccess) {
            /*
             * Retrieve user's personal details here.
             * For more options, explore the graph API explorer: https://developers.facebook.com/tools/explorer/
             * "current_user" refers to the authenticated individual. It is not a fixed string variable.
             *
            */
            // To discover more available data fields, visit https://developers.facebook.com/tools/explorer/
            $socialConnectService.fetchData("current_user?fields=identifier,display_name,profile_image", [])
            .then(function(apiResponse) {
                /*
                 * As an illustration, we are retrieving the user's unique ID, their visible name, and their profile picture,
                 * then assigning these to an object and logging the result.
                */
                var profileDetails = {
                    identifier: apiResponse.identifier,
                    displayName: apiResponse.display_name,
                    avatarUrl: apiResponse.profile_image.data.url
                }
                // Perform actions with profileDetails as required. Here, it is merely displayed in the UI.
                $viewScope.facebookProfileData = JSON.stringify(profileDetails, null, 4);


            }, function(apiError) {
                // An error occurred during API data retrieval
            })

        }, function(authFailure) {
            // Social login service reported an error, indicating the login process was cancelled.
            // Based on the operating system, present the message within an appropriate UI element.
            // For example, on Android, show the error message in a temporary toast notification.
        });

    }

    /*
     * Google authentication procedure
    */

    $viewScope.startGoogleAuth = function() {

        $overlayIndicator.display({ message: 'Authenticating...' });
        /*
         * Google sign-in. This requires an API key if the target platform is "iOS".
         * Example: $googleAuthService.performSignIn('yourAppKey')
        */
        $googleAuthService.performSignIn()
        .then(function(authResult) {

            $viewScope.googleProfileData = JSON.stringify(authResult, null, 4);
            $overlayIndicator.conceal();

        }, function(authError) {

            // Google service returned an error, implying the sign-in was aborted.
            // Depending on the platform, display the error message using a suitable UI component.
            // For instance, on Android, present the error within a toast message.
            $overlayIndicator.conceal();

        });
    }
})