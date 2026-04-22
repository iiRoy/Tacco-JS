/**
 *  browser-deeplink v0.1
 *
 *  Author: Hampus Ohlsson, November 2014
 *  GitHub Repository: http://github.com/hampusohlsson/browser-deeplink
 *
 *  This software is distributed under the MIT License.
 *  Please see the accompanying LICENSE file for details.
 */

( function ( root, factory ) {

    // Check if RequireJS is available for AMD module definition.
    if ( typeof define === 'function' && define.amd ) {
        // Define an AMD module named "deeplink".
        define( "deeplink", factory( root ) );

    // Check if CommonJS (Node.js/Browserify) is available for module export.
    } else if ( typeof exports === 'object' ) {
        // Export the module for CommonJS environments.
        module.exports = factory( root );

    // If neither AMD nor CommonJS, expose the module globally.
    } else {
        // Attach the 'deeplink' object to the global root object.
        root[ "deeplink" ] = factory( root );
    }

} )( window || this, function( root ) {

    "use strict" ; // Enforce strict mode for cleaner code and fewer errors.

    // --- Core Module Initialization Checks ---

    /**
     *  This library requires access to the DOM (Document Object Model)
     *  and the user-agent information (navigator object) to function correctly.
     *  If either is not available, the module cannot operate, so we return early.
     */
    if ( ! root.document || ! root.navigator )
    {
        return ;
    }


    // --- Internal Variables and Default Configuration ---

    /**
     *  A variable to hold the timeout ID for the fallback mechanism.
     *  This allows clearing the timeout if the app opens successfully.
     */
    var timeout ;

    /**
     *  Stores the current runtime settings, initialized as an empty object
     *  and later populated by merging defaults with user-provided options.
     */
    var settings = { } ;

    /**
     *  Default configuration options for the deeplink functionality.
     *  These can be overridden by the user during setup.
     */
    var defaults = {
        // iOS-specific settings
        iOS:         { },
        // Android-specific settings
        android:     { },
        // Whether to attempt falling back to the app store if deeplink fails.
        fallback:    true,
        // Delay (in milliseconds) before attempting to open the app store link.
        delay:       1000,
        // Time delta (in milliseconds) used to prevent delayed app store redirects.
        delta:       500
    } ;


    // --- Utility Functions ---

    /**
     *  Merges default settings with user-provided options.
     *  This creates a new object containing all properties from both,
     *  with user options overriding defaults if keys conflict.
     *
     *  @private
     *  @param {Object} defaultsObj - The object containing default configuration values.
     *  @param {Object} optionsObj  - The object containing user-specified options.
     *  @returns {Object} A new object with merged properties.
     */
    var extend = function( defaultsObj, optionsObj ) {
        var extended = { } ;

        // Copy properties from the defaults object first.
        for ( var key in defaultsObj ) {
            extended[ key ] = defaultsObj[ key ] ;
        } ;

        // Then, copy properties from the options object,
        // overwriting any existing default values.
        for ( var key in optionsObj ) {
            extended[ key ] = optionsObj[ key ] ;
        } ;

        return extended ;
    } ;


    /**
     *  Constructs the appropriate URL for the Apple App Store based on
     *  the configured iOS app name and ID.
     *
     *  @private
     *  @returns {String|null} The `itms-apps://` URL for the App Store,
     *                         or `null` if app ID or name is missing.
     */
    var getStoreURLiOS = function() {
        var baseurl = "itms-apps://itunes.apple.com/app/" ;
        var name    = settings.iOS.appName ;
        var id      = settings.iOS.appId ;

        // Only return a URL if both app name and ID are provided.
        return ( id && name ) ? ( baseurl + name + "/id" + id + "?mt=8" ) : null ;
    } ;


    /**
     *  Constructs the appropriate URL for the Google Play Store based on
     *  the configured Android app ID.
     *
     *  @private
     *  @returns {String|null} The `market://` URL for the Play Store,
     *                         or `null` if the app ID is missing.
     */
    var getStoreURLAndroid = function() {
        var baseurl = "market://details?id=" ;
        var id      = settings.android.appId ;

        // Only return a URL if the app ID is provided.
        return id ? ( baseurl + id ) : null ;
    } ;


    /**
     *  Determines and returns the correct app store link based on the
     *  detected platform (iOS or Android) and configured settings.
     *
     *  @private
     *  @returns {String|null} The app store URL for the current platform,
     *                         or `null` if no link can be determined.
     */
    var getStoreLink = function() {
        // Map platform types to their respective store URL generation logic.
        var linkmap = {
            "ios":     settings.iOS.storeUrl || getStoreURLiOS(),
            "android": settings.android.storeUrl || getStoreURLAndroid()
        } ;

        // Return the store URL for the currently detected platform.
        return linkmap[ settings.platform ] ;
    } ;


    /**
     *  Checks the user-agent string to determine if the device is an Android device.
     *
     *  @private
     *  @returns {Boolean} `true` if the user-agent matches 'Android', `false` otherwise.
     */
    var isAndroid = function() {
        return navigator.userAgent.match( 'Android' ) ;
    } ;


    /**
     *  Checks the user-agent string to determine if the device is an iOS device
     *  (iPad, iPhone, or iPod).
     *
     *  @private
     *  @returns {Boolean} `true` if the user-agent matches any iOS device pattern,
     *                         `false` otherwise.
     */
    var isIOS = function() {
        return navigator.userAgent.match( 'iPad' )    ||
               navigator.userAgent.match( 'iPhone' )  ||
               navigator.userAgent.match( 'iPod' )    ;
    } ;


    /**
     *  Checks if the current device is a mobile device (either Android or iOS).
     *
     *  @private
     *  @returns {Boolean} `true` if the device is identified as mobile, `false` otherwise.
     */
    var isMobile = function() {
        return isAndroid() || isIOS() ;
    } ;


    /**
     *  This function is designed to be executed after a delay using `setTimeout`.
     *  It attempts to redirect the user to the appropriate app store if the
     *  deeplink attempt has not succeeded within a certain timeframe.
     *  The timestamp (`ts`) helps prevent delayed redirects if the user
     *  already opened the app and returned to the browser later.
     *
     *  @private
     *  @param {Number} ts - The timestamp (milliseconds since epoch) when the deeplink
     *                       attempt was initiated.
     *  @returns {Function} A closure that performs the app store redirection logic.
     */
    var openAppStore = function( ts ) {
        return function() {
            var link = getStoreLink() ;
            var wait = settings.delay + settings.delta ;

            // Only redirect if a valid store link exists AND
            // the current time is still within the expected window
            // after the initial deeplink attempt.
            if ( typeof link === "string" && ( Date.now() - ts ) < wait ) {
                window.location.href = link ;
            }
        } ;
    } ;


    // --- Public API Functions ---

    /**
     *  Initializes the deeplink library with user-specific configuration options.
     *  This function must be called before attempting to open any deeplinks.
     *  It merges the provided options with the default settings and detects
     *  the current mobile platform.
     *
     *  @public
     *  @param {object} options - An object containing configuration settings
     *                            for iOS and/or Android apps.
     */
    var setup = function( options ) {
        // Merge user options with default settings.
        settings = extend( defaults, options ) ;

        // Detect the current platform and store it in settings.
        if ( isAndroid() ) {
            settings.platform = "android" ;
        }

        if ( isIOS() ) {
            settings.platform = "ios" ;
        }
    } ;


    /**
     *  Attempts to open a specified deeplink URI.
     *  If the device is not mobile, the function returns immediately.
     *  It also includes a fallback mechanism to redirect to the app store
     *  if the deeplink fails to open the app.
     *
     *  @public
     *  @param {String} uri - The deeplink URI to attempt to open.
     */
    var open = function( uri ) {
        // If the user is not on a mobile device, deeplinking is not applicable.
        if ( ! isMobile() )
        {
            return ;
        }

        // Special handling for Android devices, converting standard URIs to
        // Android Intent URIs, unless the browser is Firefox.
        if ( isAndroid() && ! navigator.userAgent.match( /Firefox/ ) ) {
            var matches = uri.match( /([^:]+):\/\/(.+)$/i ) ;
            // Construct the Android Intent URI format.
            uri = "intent://" + matches[ 2 ] + "#Intent;scheme=" + matches[ 1 ] ;
            uri += ";package=" + settings.android.appId + ";end" ;
        }

        // If the fallback mechanism is enabled, set a timeout to
        // potentially open the app store.
        if ( settings.fallback ) {
            timeout = setTimeout( openAppStore( Date.now() ), settings.delay ) ;
        }

        // Create a hidden iframe to attempt opening the deeplink.
        var iframe = document.createElement( "iframe" ) ;

        // The onload event for the iframe fires whether the deeplink succeeds or not.
        iframe.onload = function() {
            // Clear the app store fallback timeout, as the iframe has loaded (or tried to).
            clearTimeout( timeout ) ;
            // Remove the iframe from the DOM to clean up.
            iframe.parentNode.removeChild( iframe ) ;
            // Attempt to navigate to the deeplink URI.
            // This is the primary method for opening the app.
            window.location.href = uri ;
        } ;

        // Set the source of the iframe to the deeplink URI.
        iframe.src = uri ;
        // Hide the iframe from the user's view.
        iframe.setAttribute( "style", "display:none;" ) ;
        // Append the iframe to the document body to trigger the navigation attempt.
        document.body.appendChild( iframe ) ;
    } ;


    // --- Module Export ---

    // Expose the public API methods.
    return {
        setup: setup,  // Function to configure the deeplink library.
        open:  open    // Function to initiate a deeplink attempt.
    } ;

} ) ;