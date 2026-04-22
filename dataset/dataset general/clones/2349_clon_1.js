; ( function ( window ) {
    // Enforce strict mode for better code quality and error handling
    'use strict';


    // Get the global Angular object from the window context
    var angular  =  window.angular;


    // Initialize the main Angular module for the application
    angular
        .module( 'tuchong-daily', [
            // Core Ionic framework module for mobile UI components
            'ionic',
            // AVOS Cloud (LeanCloud) integration module for backend services
            'avoscloud',
            // ngResource module for RESTful interactions
            'ngResource',
            // ngCordova module for Cordova plugin wrappers
            'ngCordova'
        ] )
        // Define application-wide constants
        .constant( 'API_TOKEN', appConfigs.API_TOKEN )
        .constant( 'API_SERVER', appConfigs.API_SERVER )
        .constant( 'API_TOKEN_KEY', 'tuchong-daily-token' )
        .constant( 'TC_SERVER', 'http://tuchong.com/api/' )
        .constant( '$ionicLoadingConfig', { template : '<ion-spinner icon="lines"></ion-spinner>' } )
        // Configure the application using various providers and services
        .config( [
            '$httpProvider',       // HTTP service provider
            '$stateProvider',      // UI Router state provider
            '$urlRouterProvider',  // UI Router URL provider
            'avoscloudProvider',   // AVOS Cloud provider
            'API_TOKEN',           // Custom API token constant
            'API_TOKEN_KEY',       // Custom API token key constant
            config                 // Configuration function
        ] )
        // Run block executed after all modules have loaded
        .run( [
            '$ionicPlatform',      // Ionic platform service
            '$cordovaDevice',      // Cordova device plugin wrapper
            '$cordovaNetwork',     // Cordova network plugin wrapper
            '$cordovaPush',        // Cordova push notification plugin wrapper
            '$timeout',            // Angular's timeout service
            'avoscloud',           // AVOS Cloud service
            '$cordovaDialogs',     // Cordova dialogs plugin wrapper
            '$state',              // UI Router state service
            init                   // Initialization function
        ] );


    /**
     * @ngdoc function
     * @name init
     * @description
     * Main initialization function for the application, executed after module loading.
     * Handles platform readiness, device information, network checks, and push service setup.
     *
     * @param {object} $ionicPlatform Ionic platform service.
     * @param {object} $cordovaDevice Cordova device plugin wrapper.
     * @param {object} $cordovaNetwork Cordova network plugin wrapper.
     * @param {object} $cordovaPush Cordova push notification plugin wrapper.
     * @param {function} $timeout Angular's timeout service.
     * @param {object} avoscloud AVOS Cloud service.
     * @param {object} $cordovaDialogs Cordova dialogs plugin wrapper.
     * @param {object} $state UI Router state service.
     */
    function init ( $ionicPlatform, $cordovaDevice, $cordovaNetwork, $cordovaPush, $timeout, avoscloud, $cordovaDialogs, $state ) {
        // Ensure the platform is ready before executing Cordova-related code
        $ionicPlatform.ready( function ( ) {
            // Retrieve device information using ngCordova's $cordovaDevice service
            var device  =  $cordovaDevice.getDevice( );
            // Retrieve network information using ngCordova's $cordovaNetwork service
            var newtork  =  $cordovaNetwork.getNetwork( );

            // Log device and network details to console for debugging purposes
            console.log( device );
            console.log( newtork );

            // Check if the current network is not Wi-Fi (case-insensitive check for common values)
            if ( ( newtork  !==  'wifi' )  &&  ( newtork  !==  'Connection.WIFI' ) ) {
                // Display a warning dialog to the user about potential data usage on non-Wi-Fi networks
                $cordovaDialogs.alert(
                    '检查到当前使用的网络不是 Wi-Fi，除非您使用 3G/4G 网络，图虫日报不建议在非 Wi-Fi 网络下加载大图',  // Dialog message content
                    'ヾ(´ρ｀)〃 流量提示',                                                                                   // Dialog box title
                    '继续浏览'                                                                                               // Text for the confirmation button
                );
            }

            // Authenticate and register for push notifications, then synchronize installation data
            authPushService( device, function ( installation ) {
                // Log the generated installation object for inspection
                console.log( installation );

                // Post the device installation information to AVOS Cloud for push notification targeting
                avoscloud
                    .installations
                    .post( installation, syncInstallationSuccess, syncError );

                /**
                 * @ngdoc function
                 * @name syncInstallationSuccess
                 * @description
                 * Callback function executed when device installation information is successfully synced with AVOS Cloud.
                 * Logs the result of the synchronization.
                 *
                 * @param {object} result The result object returned by the AVOS Cloud API call.
                 */
                function syncInstallationSuccess ( result ) {
                    console.log( result );
                }

                /**
                 * @ngdoc function
                 * @name syncError
                 * @description
                 * Callback function executed if an error occurs during synchronization of device installation information.
                 * Currently, errors are just logged to the console and not explicitly handled in the UI.
                 *
                 * @param {object} err The error object containing details about the failure.
                 */
                function syncError ( err ) {
                    console.log( err ); // Ignoring the error for temporary purposes, could be handled more robustly in a production app
                }
            } );
        } );

        /**
         * @ngdoc function
         * @name authPushService
         * @description
         * Registers the device for push notifications and constructs an installation object suitable for AVOS Cloud.
         *
         * @param {object} device The device information object obtained from `$cordovaDevice`.
         * @param {function} callback The callback function to execute once the installation object is ready.
         *                            It receives the constructed installation object as its argument.
         */
        function authPushService ( device, callback ) {
            // Define options for push notification registration
            var options  =  {
                "badge" : "true",  // Request permission for badge notifications
                "sound" : "true",  // Request permission for sound notifications
                "alert" : "true"   // Request permission for alert notifications
            };

            // Register for push notifications using ngCordova's $cordovaPush service
            $cordovaPush
                .register( options )
                .then( function ( token ) {
                    // Initialize an empty object to store installation details
                    var installation  =  { };

                    // Determine the device type (iOS or Android) based on platform information.
                    // Defaults to 'ios' if platform is not available.
                    installation.deviceType  =  device.platform  ?
                        device.platform.toLowerCase( )  :
                        'ios';

                    // Assign the device token based on the detected platform
                    if ( installation.deviceType  ===  'ios' ) {
                        installation.deviceToken  =  token;
                    }

                    if ( installation.deviceType  ===  'android' ) {
                        installation.installationId  =  token;
                    }

                    // Iterate over common device properties ('model', 'uuid', 'version')
                    // and add them to the installation object if they exist on the device object.
                    angular.forEach( [ 'model', 'uuid', 'version' ], function ( item ) {
                        if ( device[ item ] ) {
                            installation[ item ]  =  device[ item ];
                        }
                    } );

                    // Execute the provided callback function with the fully constructed installation object
                    return callback( installation );
                }, pushSignupError ); // Handle any errors that occur during push registration

            /**
             * @ngdoc function
             * @name pushSignupError
             * @description
             * Callback function executed if push notification registration fails.
             * Displays an alert to the user informing them of the failure.
             *
             * @param {object} err The error object detailing the push registration failure.
             */
            function pushSignupError ( err ) {
                $cordovaDialogs.alert(
                    err,                          // Display the error message
                    '获取推送权限失败...',         // Title for the error dialog
                    '知道了'                      // Text for the confirmation button in the dialog
                )
            }
        }
    }


    /**
     * @ngdoc function
     * @name config
     * @description
     * Configuration function for the Angular application, setting up HTTP providers,
     * AVOS Cloud, and UI Router states. This function is executed during the module's
     * configuration phase.
     *
     * @param {object} $httpProvider HTTP service provider for global HTTP configurations.
     * @param {object} $stateProvider UI Router state provider for defining application states.
     * @param {object} $urlRouterProvider UI Router URL provider for URL routing configurations.
     * @param {object} avoscloudProvider AVOS Cloud provider for configuring AVOS Cloud SDK.
     * @param {string} API_TOKEN Custom API token constant for authentication.
     * @param {string} API_TOKEN_KEY Custom API token key constant for HTTP headers.
     */
    function config ( $httpProvider, $stateProvider, $urlRouterProvider, avoscloudProvider, API_TOKEN, API_TOKEN_KEY ) {
        // Configure AVOS Cloud SDK with application-specific settings from `appConfigs`
        avoscloudProvider.config( appConfigs.avoscloud );

        // Enable cross-domain requests for the $http service. This is crucial for CORS.
        $httpProvider.defaults.useXDomain  =  true;
        // Remove the default 'X-Requested-With' header. This header can sometimes cause issues
        // with CORS preflight requests on certain server configurations.
        delete $httpProvider.defaults.headers.common[ 'X-Requested-With' ];
        // Set a custom API token header for all outgoing HTTP requests.
        // The header name is determined by API_TOKEN_KEY or defaults to 'tuchong-daily-token'.
        $httpProvider.defaults.headers.common[ API_TOKEN_KEY  ||  'tuchong-daily-token' ]  =  API_TOKEN;


        // Define application states using UI Router's $stateProvider
        $stateProvider
            .state( 'home', {
                url         :  '/',                            // The URL path for this state
                templateUrl :  'templates/home.html',          // The path to the HTML template for this state
                controller  :  'home'                          // The controller associated with this state
            } );

        // Configure the default route for any URLs that do not match a defined state.
        // This acts as a fallback, typically redirecting to the home page or a 404 page.
        $urlRouterProvider.otherwise( '/' );
    }

} ) ( this ); // Immediately invoke the function with the global 'this' context (which is 'window' in browsers)