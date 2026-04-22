var UtilityKit = (function(domLib) {


    /*
     * Comprehensive Utility Toolkit
     * Provides helpful routines and hardware detection logic.
     */

    var exposedMethods = {};


    /* Debugging Console - Ensure availability if absent
     * -------------------------------------------------------------- */
    if ( !window.debugLog )
    {
        (function() {
            var logMethodNames = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
                "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];
            window.debugLog = {};
            for ( var currentIdx = 0; currentIdx < logMethodNames.length; ++currentIdx ) {
                window.debugLog[logMethodNames[currentIdx]] = function() { /* No operation */ };
            }
        }());
    }


    /* Hardware Information
     * -------------------------------------------------------------- */

    // deviceInfo.isMobileDevice = boolean        - true if mobile, with more properties
    // deviceInfo.isMobileDevice.hasTouchScreen = boolean - detects touch capability
    // deviceInfo.isMobileDevice.touchKind = null/string  - type of touch device detected

    exposedMethods.deviceInfo = (function() {
        var userAgentString = navigator.userAgent.toLowerCase();
        var mobileDeviceTypes = ["iphone", "ipod", "ipad", "android", "blackberry", "symbian", "series60"];
        var isMobileDevice = false;
        var hasTouchScreen = false;
        var touchKind = null;

        var currentTypeIndex = 0;
        var totalTypes = mobileDeviceTypes.length;
        for ( currentTypeIndex; currentTypeIndex < totalTypes; currentTypeIndex++ )
        {
            if ( userAgentString.match(mobileDeviceTypes[currentTypeIndex]) )
            {
                hasTouchScreen = true;
                touchKind = mobileDeviceTypes[currentTypeIndex];
                break;
            }
        }

        if ( hasTouchScreen )
        {
            isMobileDevice = {
                touchKind: touchKind,
                kind: touchKind // Corrected original 'type' typo to use 'touchKind'
            };
        }

        return {
            isMobileDevice: isMobileDevice
        };
    }());


    /* Flash Player Information
     * -------------------------------------------------------------- */

    // flashPlayerInfo = boolean        - true if detected, with version details
    // flashPlayerInfo.minorVersion = number - minor version build
    // flashPlayerInfo.majorVersion = number - major version build
    // flashPlayerInfo.buildNumber = number - release number

    exposedMethods.flashPlayerInfo = (function() {
        var playerDetected = false;

        // Verify that swfObject utility is available
        if ( typeof swfobject === "undefined" )
        {
            debugLog.log("Cannot determine Flash player version; swfobject library is not loaded.");
        }
        else
        {
            if ( swfobject.getFlashPlayerVersion )
            {
                var versionData = swfobject.getFlashPlayerVersion();

                if ( versionData.major > 0 )
                {
                    playerDetected = {
                        minorVersion: versionData.minor,
                        majorVersion: versionData.major,
                        buildNumber: versionData.release
                    };
                }
            }
        }

        return playerDetected;
    }());


    /* Auxiliary Functions
     * -------------------------------------------------------------- */

    // assistFunctions.inspectObjectProperties( object, string ) - displays properties and methods
    // assistFunctions.openNewBrowserWindow( string, boolean ) - opens new window, second arg for focus
    // assistFunctions.cacheImagesInBackground( array ) - preloads images from array (jQuery object or native)

    exposedMethods.assistFunctions = (function() {
        var inspectObjectProperties = function( targetObject, objectIdentifier ) {
            var propertyKey, resultString = "";

            for ( propertyKey in targetObject )
            {
                if ( targetObject.hasOwnProperty(propertyKey) )
                {
                    resultString += objectIdentifier + "." + propertyKey + " = " + targetObject[propertyKey] + "\n";
                }
            }
            return resultString;
        };

        var openNewBrowserWindow = function( targetUrl, shouldFocus ) {
            var newWindowHandle = window.open(targetUrl, "_blank");
            if ( shouldFocus )
            {
                newWindowHandle.focus();
            }
            return newWindowHandle;
        };

        var generateImageElement = function( imageSource ) {
            var imageElem = document.createElement("img");
            imageElem.setAttribute("src", imageSource);
            return imageElem;
        };

        var cacheImagesInBackground = function( imageArray ) {
            var currentImageIndex = 0;
            var totalImages = imageArray.length;
            for ( currentImageIndex; currentImageIndex < totalImages; currentImageIndex++ )
            {
                generateImageElement(imageArray[currentImageIndex]);
            }
            return;
        };

        return {
            inspectObjectProperties: inspectObjectProperties,
            openNewBrowserWindow: openNewBrowserWindow,
            cacheImagesInBackground: cacheImagesInBackground
        };
    }());


    // Expose the public interface / properties
    // --------------------------------------------------------------

    return exposedMethods;

}(jQuery));