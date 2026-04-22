/*
 * This is an immediately invoked function expression (IIFE)
 * used to encapsulate variables and prevent global pollution.
 * It ensures that 'device_ready' and 'jqm_mobile_init'
 * are private to this specific scope.
 */
( function ()
{
    // Declare a flag to track if the device is ready (e.g., in a Cordova/PhoneGap environment).
    var device_ready = false ;


    // Declare another flag to track if jQuery Mobile's 'mobileinit' event has fired.
    var jqm_mobile_init  =  false ;


    /**
     * This function is responsible for initiating the main application logic.
     * It acts as a gatekeeper, ensuring that all necessary prerequisites
     * (device readiness and jQuery Mobile initialization) are met before
     * proceeding to call the 'startApp' function.
     */
    var initApp = function ()
    {
        // The application can start if:
        // 1. Both the device is ready AND jQuery Mobile is initialized, OR
        // 2. jQuery Mobile is initialized AND it's not a mobile system (fallback for browser testing).
        if  (  ( device_ready  &&  jqm_mobile_init )  ||  ( jqm_mobile_init  &&  ! mobile_system )  )
        {
            // Call the core application startup function.
            startApp ( ) ;
        }
    } ; // End of initApp function definition.


    /*
     * This is the callback function for the 'deviceready' event.
     * This event is typically fired by Cordova/PhoneGap when the native device
     * APIs are fully loaded and ready for use.
     */
    var onDeviceReady = function ( )
    {
        // Update the 'device_ready' flag to indicate readiness.
        device_ready = true ;
        // Original code contained a commented-out alert, which is now removed.

        // After setting the flag, attempt to initialize the main application.
        initApp ( ) ;
    } ; // End of onDeviceReady function.


    /*
     * This is the callback function for jQuery Mobile's 'mobileinit' event.
     * This event fires before jQuery Mobile starts its own initialization process,
     * allowing for configuration changes like enabling CORS.
     */
    var onMobileInit = function ( )
    {
        // Enable Cross-Origin Resource Sharing (CORS) for jQuery's AJAX requests.
        $.support.cors  =  true ;

        // Allow jQuery Mobile to navigate to pages loaded from different domains.
        $.mobile.allowCrossDomainPages  =  true ;

        // Update the 'jqm_mobile_init' flag to indicate jQuery Mobile initialization readiness.
        jqm_mobile_init  =  true ;
        // Original code contained a commented-out alert, which is now removed.

        // After setting the flag, attempt to initialize the main application.
        initApp ( ) ;
    } ; // End of onMobileInit function.


    // Bind the 'mobileinit' event to our custom 'onMobileInit' handler.
    // This must be done *before* jQuery Mobile's JavaScript file is loaded.
    $ ( document ) . bind ( 'mobileinit', onMobileInit ) ;

    // Add an event listener for the 'deviceready' event, which is crucial for Cordova/PhoneGap apps.
    document.addEventListener ( "deviceready", onDeviceReady, false ) ;

} ) ( ) ; // End of the Immediately Invoked Function Expression.