'use strict' ; /* Strict mode enabled for the entire script */

/*
 * This is the main Angular application module.
 * It sets up routing and global configurations.
 */
var app = angular . module ( 'app', [ 'ngResource' , 'ngRoute' ] )

    . config ( function ( $routeProvider , $locationProvider , $httpProvider ) {

        // --- Helper function to check user login status ---
        var checkLoggedin = function ( $q , $timeout , $http , $location , $rootScope ) {
            // Initialize a new promise for asynchronous operations
            var deferred = $q . defer ( ) ;

            // Make an AJAX request to verify if the user is authenticated
            $http . get ( '/loggedin' ) . success ( function ( user ) {
                // If user data is returned and not '0', authentication is successful
                if ( user !== '0' ) {
                    deferred . resolve ( ) ; // Resolve the promise
                }
                // Otherwise, the user is not authenticated
                else {
                    $rootScope . message = 'You need to log in.' ; // Set an error message
                    deferred . reject ( ) ; // Reject the promise
                    $location . url ( '/login' ) ; // Redirect to the login page
                }
            } ) ; // End of $http.get success callback

            return deferred . promise ; // Return the promise object
        } ; // End of checkLoggedin function definition


        /*
         * Configure HTTP interceptors to handle specific response statuses.
         * This one specifically checks for 401 Unauthorized responses.
         */
        $httpProvider . interceptors . push ( function ( $q , $location ) {
            return {
                response : function ( response ) {
                    // Do nothing special on successful responses for now
                    return response ;
                } ,
                responseError : function ( response ) {
                    // If the response status is 401 (Unauthorized), redirect to login
                    if ( response . status === 401 ) {
                        $location . url ( '/login' ) ;
                    }
                    // Always reject the promise for error responses
                    return $q . reject ( response ) ;
                }
            } ; // End of interceptor object
        } ) ; // End of push interceptor


        // --- Define all application routes and their associated views/controllers ---
        $routeProvider
            . when ( '/' , {
                templateUrl : '/views/main.html'
            } )
            . when ( '/admin' , {
                templateUrl : 'views/admin.html' ,
                controller : 'AdminCtrl' ,
                resolve : {
                    loggedin : checkLoggedin // Use the helper function to ensure login
                }
            } )
            . when ( '/login' , {
                templateUrl : 'views/login.html' ,
                controller : 'LoginCtrl'
            } )
            . otherwise ( {
                redirectTo : '/' // Default route for any unmatched URLs
            } ) ; // End of route definitions

    } ) // End of app.config() block

    . run ( function ( $rootScope , $http ) {
        $rootScope . message = '' ; // Initialize a global message variable

        // --- Logout function, accessible from anywhere in the app ---
        $rootScope . logout = function ( ) {
            $rootScope . message = 'Logged out.' ; // Set logout message
            $http . post ( '/logout' ) ; // Send logout request to the server
        } ;
    } ) ; // End of app.run() block


/*
 * Controller for handling user login functionality.
 * Manages form data and communicates with the authentication API.
 */
app . controller ( 'LoginCtrl' , function ( $scope , $rootScope , $http , $location ) {
    // Object to hold user credentials from the login form
    $scope . user = { } ;

    // Function to handle the login process when the form is submitted
    $scope . login = function ( ) {
        $http . post ( '/login' , {
            username : $scope . user . username ,
            password : $scope . user . password
        } )
        . success ( function ( user ) {
            // If the server returns success, authentication was good
            $rootScope . message = 'Authentication successful!' ;
            $location . url ( '/admin' ) ; // Redirect to the admin panel
        } )
        . error ( function ( ) {
            // If the server returns an error, authentication failed
            $rootScope . message = 'Authentication failed.' ;
            $location . url ( '/login' ) ; // Stay on the login page
        } ) ;
    } ; // End of $scope.login function
} ) ; // End of LoginCtrl definition


/*
 * Controller for the administration panel.
 * Fetches and displays a list of users.
 */
app . controller ( 'AdminCtrl' , function ( $scope , $http ) {
    // Array to store the list of users retrieved from the server
    $scope . users = [ ] ;

    // Fetch the list of users from the backend API
    $http . get ( '/users' ) . success ( function ( users ) {
        // Populate the $scope.users array with data received
        for ( var i in users )
            $scope . users . push ( users [ i ] ) ;
    } ) ; // End of $http.get success callback
} ) ; // End of AdminCtrl definition