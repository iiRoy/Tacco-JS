/*
 * app-launcher-bridge v1.0
 *
 * Creator: AI Assistant, 2023
 * Project: Simulated Code Clone
 *
 * Permissive License (e.g., MIT equivalent)
 */

( function ( globalObj, moduleCreator ) {

    if ( typeof defineModule === 'function' && defineModule.isAmd ) {
        // AMD (Asynchronous Module Definition) environment detected
        defineModule( "appLinker", moduleCreator( globalObj ) );
    } else if ( typeof exportObj === 'object' ) {
        // CommonJS-like environment for Node.js or similar
        currentModule.exportObj = moduleCreator( globalObj );
    } else {
        // Standard browser environment, attach to global object
        globalObj[ "appLinker" ] = moduleCreator( globalObj );
    }

} )( window || this, function ( globalObj ) {

    "use strict"; // Enforce strict parsing and error handling

    /*
     * This utility requires a Document Object Model and user agent information.
     * Exit gracefully if these are unavailable.
     */
    if ( !globalObj.document || !globalObj.navigator ) {
        return;
    }

    /*
     * Declare internal variables and set up initial configuration options.
     */
    var delayTimer; // Timer ID for delayed actions
    var currentConfig = {}; // Stores runtime configuration
    var initialSettings = { // Default values for the application
        apple: {},      // iOS specific settings
        robot: {},    // Android specific settings
        useFallback: true, // Whether to attempt opening app store as fallback
        initialDelay: 1 * 1000, // Time to wait before fallback (in ms)
        timeOffset: 0.5 * 1000  // Additional time buffer for comparison (in ms)
    };

    /*
     * Combines default configuration with user-provided options.
     * @private
     * @param {Object} baseOptions - The foundational, default settings.
     * @param {Object} userOptions - The custom settings provided by the user.
     * @returns {Object} A new object containing merged property values.
     */
    var mergeOptions = function ( baseOptions, userOptions ) {
        var mergedResult = {};
        for ( var propName in baseOptions ) {
            mergedResult[ propName ] = baseOptions[ propName ];
        };
        for ( var propName in userOptions ) {
            mergedResult[ propName ] = userOptions[ propName ];
        };
        return mergedResult;
    };

    /*
     * Constructs the URL for the Apple App Store.
     *
     * @private
     * @returns {String|null} The iTunes App Store URL or null if data is missing.
     */
    var retrieveAppleStoreURL = function () {
        var appleBase = "itms-apps://itunes.apple.com/app/";
        var appNameVal = currentConfig.apple.appName;
        var appIdentifier = currentConfig.apple.appId;
        return ( appIdentifier && appNameVal ) ? ( appleBase + appNameVal + "/id" + appIdentifier + "?mt=8" ) : null;
    };

    /*
     * Generates the link for the Google Play Store.
     *
     * @private
     * @returns {String|null} The Play Store URL or null if the app ID is absent.
     */
    var retrieveRobotStoreURL = function () {
        var robotBase = "market://details?id=";
        var appIdentifier = currentConfig.robot.appId;
        return appIdentifier ? ( robotBase + appIdentifier ) : null;
    };

    /*
     * Determines the appropriate app store link based on the detected platform.
     *
     * @private
     * @returns {String|null} The relevant app store URL.
     */
    var obtainStoreLink = function () {
        var platformLinks = {
            "ios": currentConfig.apple.storeUrl || retrieveAppleStoreURL(),
            "android": currentConfig.robot.storeUrl || retrieveRobotStoreURL()
        };

        return platformLinks[ currentConfig.platform ];
    };

    /*
     * Checks if the user's browser agent indicates an Android device.
     *
     * @private
     * @returns {Boolean} True if Android, false otherwise.
     */
    var checkIsRobot = function () {
        return globalObj.navigator.userAgent.match( 'Android' );
    };

    /*
     * Checks for iOS devices (iPad, iPhone, iPod) in the user agent string.
     *
     * @private
     * @returns {Boolean} True if an iOS device, false otherwise.
     */
    var checkIsApple = function () {
        return globalObj.navigator.userAgent.match( 'iPad' ) ||
               globalObj.navigator.userAgent.match( 'iPhone' ) ||
               globalObj.navigator.userAgent.match( 'iPod' );
    };

    /*
     * Determines if the current device is a mobile phone or tablet.
     *
     * @private
     * @returns {Boolean} True if mobile (Android or iOS), false otherwise.
     */
    var checkIsHandheld = function () {
        return checkIsRobot() || checkIsApple();
    };

    /*
     * A function designed to be executed after a delay, which attempts to
     * redirect to the app store if the app wasn't launched.
     * This includes a timestamp check to prevent redirects if the user
     * returned to the browser after successfully opening the app.
     *
     * @private
     * @param {Number} invocationTimestamp - The time (in milliseconds) when the deeplink was first attempted.
     * @returns {Function} A closure to be called by `setTimeout`.
     */
    var launchAppMarket = function ( invocationTimestamp ) {
        return function () {
            var marketURL = obtainStoreLink();
            var totalWaitDuration = currentConfig.initialDelay + currentConfig.timeOffset;
            if ( typeof marketURL === "string" && ( Date.now() - invocationTimestamp ) < totalWaitDuration ) {
                globalObj.location.href = marketURL;
            }
        };
    };

    /*
     * Initializes the app-linker with specific platform configurations.
     * This method must be called before attempting to open any links.
     *
     * @public
     * @param {Object} configOptions - An object containing iOS and/or Android settings.
     */
    var configure = function ( configOptions ) {
        currentConfig = mergeOptions( initialSettings, configOptions );

        if ( checkIsRobot() ) currentConfig.platform = "android";
        if ( checkIsApple() ) currentConfig.platform = "ios";
    };

    /*
     * Attempts to open a specific URI scheme, potentially launching a mobile application.
     * If the app doesn't open within a set time, it may fall back to the app store.
     *
     * @public
     * @param {String} targetURI - The URI to be opened (e.g., "myapp://path/data").
     */
    var initiateLink = function ( targetURI ) {
        // Do not proceed if not on a recognized mobile device.
        if ( !checkIsHandheld() ) {
            return;
        }

        // Special handling for Android (excluding Firefox, which has its own intent handling)
        if ( checkIsRobot() && !globalObj.navigator.userAgent.match( /Firefox/ ) ) {
            var uriParts = targetURI.match( /([^:]+):\/\/(.+)$/i );
            targetURI = "intent://" + uriParts[ 2 ] + "#Intent;scheme=" + uriParts[ 1 ];
            targetURI += ";package=" + currentConfig.robot.appId + ";end";
        }

        // If fallback is enabled, set a timer to redirect to the app store.
        if ( currentConfig.useFallback ) {
            delayTimer = setTimeout( launchAppMarket( Date.now() ), currentConfig.initialDelay );
        }

        var hiddenFrame = globalObj.document.createElement( "iframe" );
        hiddenFrame.onload = function () {
            clearTimeout( delayTimer ); // Clear fallback timer if iframe loads (app potentially opened)
            hiddenFrame.parentNode.removeChild( hiddenFrame ); // Clean up the temporary iframe
            globalObj.location.href = targetURI; // Attempt to navigate to the URI
        };

        hiddenFrame.src = targetURI;
        hiddenFrame.setAttribute( "style", "display:none;" ); // Keep iframe invisible
        globalObj.document.body.appendChild( hiddenFrame ); // Append iframe to the document body
    };

    // Expose the public API for module consumers.
    return {
        configure: configure,
        initiateLink: initiateLink
    };

} );