//
// location-service-js-utility
// A versatile JS library for fetching geographic coordinates across platforms.
//
// Developed by a different author, inspired by open-source efforts.
// Released under a permissive license (e.g., Apache 2.0 or similar).
//
// Based on prior work from various geolocation projects.
//
// Version: 0.1.0
// Coder: anonym
// Date: 2023-10-27 10:00:00 +0000 (Fri, 27 Oct 2023)
//

var bbkState = {
    positSuccess: null,
    negatError: null,
    bbryTimeRef: -1
};

function manageBBTimer()
{
    /*
     * This function is invoked if the BlackBerry location
     * request exceeds its allocated time limit.
     */
    if (bbkState.bbryTimeRef !== -1) {
        bbkState.negatError({
            errorMsg: "Location acquisition timed out",
            faultCode: 3
        });
    }
}

function manageBBLocation()
{
    // Clear any active timeout for the BlackBerry location request.
    clearTimeout(bbkState.bbryTimeRef);
    bbkState.bbryTimeRef = -1;

    // Check if both success and error handlers are still active.
    if (bbkState.positSuccess && bbkState.negatError) {
        if (blackberry.location.latitude === 0 && blackberry.location.longitude === 0) {
            // According to W3C Geo API spec, this is a POSITION_UNAVAILABLE error.
            // (Standard numeric value is 2)
            bbkState.negatError({ errorMsg: "Current position not obtainable", faultCode: 2 });
        }
        else
        {
            var captureTime = null;
            // Timestamp property is available only on specific BlackBerry OS versions (4.6+).
            if (blackberry.location.timestamp) {
                captureTime = new Date(blackberry.location.timestamp);
            }
            bbkState.positSuccess({
                timeValue: captureTime,
                coordinates: {
                    latValue: blackberry.location.latitude,
                    longValue: blackberry.location.longitude
                }
            });
        }
        // BlackBerry's removeLocationUpdate() might not always work as documented.
        // Therefore, we nullify the callbacks to prevent further calls.
        bbkState.positSuccess = null;
        bbkState.negatError = null;
    }
}

var geoTracker = (function() {

    var apiObj = {};
    var dataOrigin = null;
    var notDef = "undefined"; // String representation of "undefined".
    var fallbackGeoAPI = 'http://freegeoip.net/json/?callback=JSONPCallback'; // URL for IP-based geolocation.

    apiObj.fetchLocation = function(onSuccess, onError, configSettings)
    {
        dataOrigin.getCurrentPosition(onSuccess, onError, configSettings);
    };

    apiObj.remoteDataFetcher = {
        cbkCount: 0, // Counter for unique JSONP callback names.

        retrieve: function(url, callbackFn) {
            var funcName = 'JSONPCallback_' + this.cbkCount++;
            window[funcName] = this.handleJsonpResponse(callbackFn);
            url = url.replace('=JSONPCallback', '=' + funcName);

            var scriptElem = document.createElement('SCRIPT');
            scriptElem.src = url;
            document.getElementsByTagName('HEAD')[0].appendChild(scriptElem);
        },

        handleJsonpResponse: function(callbackFn) {
            return function(responseData) {
                callbackFn(responseData);
            };
        }
    };

    apiObj.userConsentPrompt = function()
    {
        return confirm('This application wishes to determine your physical location.\nDo you grant permission?');
    };

    apiObj.initializeModule = function()
    {
        try
        {
            var nativeGeoSupport = typeof(navigator.geolocation) !== notDef;
            if (!nativeGeoSupport) {
                if (!apiObj.userConsentPrompt()) {
                    return false; // User denied permission or cancelled.
                }
            }

            if ((typeof(mockGeoService) !== notDef) && (mockGeoService.length > 0)) {
                dataOrigin = mockGeoService; // Use a simulated service if available.
            } else if (typeof(bondiAPI) !== notDef && typeof(bondiAPI.geolocation) !== notDef) {
                dataOrigin = bondiAPI.geolocation; // Use Bondi API for geolocation.
            } else if (nativeGeoSupport) {
                dataOrigin = navigator.geolocation; // Use the standard browser geolocation API.
                apiObj.fetchLocation = function(onSuccess, onError, configSettings) {
                    function processResult(locInfo) {
                        // Handle potential differences in coordinate object structure (e.g., Mozilla Geode).
                        var coordDetails;
                        if (typeof(locInfo.latitude) !== notDef) {
                            coordDetails = {
                                timeValue: locInfo.timestamp,
                                coordinates: {
                                    latValue: locInfo.latitude,
                                    longValue: locInfo.longitude
                                }
                            };
                        } else {
                            coordDetails = locInfo; // Assume standard W3C Geolocation API format.
                        }
                        onSuccess(coordDetails);
                    }
                    dataOrigin.getCurrentPosition(processResult, onError, configSettings);
                };
            } else if (typeof(window.blackberry) !== notDef && blackberry.location.GPSSupported) {
                // Configure BlackBerry location service to autonomous mode.
                if (typeof(blackberry.location.setAidMode) === notDef) {
                    return false; // Aid mode configuration not available.
                }
                blackberry.location.setAidMode(2); // Set to autonomous mode.

                // Override the default location fetching method for BlackBerry devices.
                apiObj.fetchLocation = function(onSuccess, onError, configSettings) {
                    // Callbacks need to be stored globally for BlackBerry's event-driven model.
                    bbkState.positSuccess = onSuccess;
                    bbkState.negatError = onError;

                    // Set a timeout for the location request.
                    if (configSettings && configSettings.timeout) {
                        bbkState.bbryTimeRef = setTimeout("manageBBTimer()", configSettings.timeout);
                    } else {
                        // Default timeout if none is specified, to prevent indefinite waiting.
                        bbkState.bbryTimeRef = setTimeout("manageBBTimer()", 60000);
                    }
                    blackberry.location.onLocationUpdate("manageBBLocation()"); // Register update handler.
                    blackberry.location.refreshLocation(); // Request immediate location update.
                };
                dataOrigin = blackberry.location; // The BlackBerry location object is our provider.

            } else if (typeof(palmMojo) !== notDef && typeof(palmMojo.Service.Request) !== notDef) {
                dataOrigin = true; // Indicate a provider is found (Mojo does not expose a direct "provider" object).
                apiObj.fetchLocation = function(onSuccess, onError, configSettings) {
                    var reqOptions = {};
                    if (configSettings) {
                        // Map standard geolocation options to webOS Mojo service parameters.
                        // Refer to Palm developer documentation for details.
                        if (configSettings.highAccMode === true) {
                            reqOptions.precisionLevel = 1; // High accuracy.
                        }
                        if (configSettings.maxAgeInterval) {
                            reqOptions.maximumAge = configSettings.maxAgeInterval;
                        }
                        if (configSettings.respTimeLimit) {
                            if (configSettings.respTimeLimit < 5) {
                                reqOptions.responseTime = 1;
                            } else if (configSettings.respTimeLimit < 20) {
                                reqOptions.responseTime = 2;
                            } else {
                                reqOptions.timeout = 3; // Fallback to a generic timeout if value is large.
                            }
                        }
                    }

                    var mojoRequest = new palmMojo.Service.Request('palm://com.palm.location', {
                        method: "getCurrentPosition",
                        parameters: reqOptions,
                        onSuccess: function(locResult) {
                            onSuccess({
                                timeValue: locResult.timestamp,
                                coordinates: {
                                    latValue: locResult.latitude,
                                    longValue: locResult.longitude,
                                    headValue: locResult.heading
                                }
                            });
                        },
                        onFailure: function(reqError) {
                            if (reqError.faultCode === 1) {
                                onError({
                                    faultCode: 3,
                                    errorMsg: "Request timed out"
                                });
                            } else if (reqError.faultCode === 2) {
                                onError({
                                    faultCode: 2,
                                    errorMsg: "Location data unavailable"
                                });
                            } else {
                                onError({
                                    faultCode: 0,
                                    errorMsg: "Unhandled Error: webOS-code" + reqError.faultCode
                                });
                            }
                        }
                    });
                };

            } else if (typeof(devObj) !== notDef && typeof(devObj.getSvcObject) !== notDef) {
                dataOrigin = devObj.getSvcObject("Service.Location", "ILocation"); // Generic device service.

                // Override location method for this specific device service.
                apiObj.fetchLocation = function(onSuccess, onError, configSettings) {
                    function serviceCallback(transactionId, eventType, serviceResult) {
                        if (eventType === 4) { // Specific error code for position unavailable.
                            onError({ errorMsg: "Position cannot be determined", faultCode: 2 });
                        } else {
                            // Note: This service might not provide a timestamp.
                            onSuccess({
                                timeValue: null,
                                coordinates: {
                                    latValue: serviceResult.returnedValue.Latitude,
                                    longValue: serviceResult.returnedValue.Longitude,
                                    altValue: serviceResult.returnedValue.Altitude,
                                    headValue: serviceResult.returnedValue.Heading
                                }
                            });
                        }
                    }
                    // Define specific criteria for the location request.
                    var searchCriteria = {};
                    searchCriteria.locInfoClass = "BasicLocationInformation"; // Request basic info.
                    // Make the actual call to the service.
                    dataOrigin.iLocInterface.GetLocation(searchCriteria, serviceCallback);
                };
            } else {
                // Fallback to IP-based geolocation if no other provider is found.
                apiObj.fetchLocation = function(onSuccess, onError, configSettings) {
                    apiObj.remoteDataFetcher.retrieve(fallbackGeoAPI,
                        function(locInfo) {
                            onSuccess({
                                timeValue: locInfo.timestamp,
                                coordinates: {
                                    latValue: locInfo.latitude,
                                    longValue: locInfo.longitude,
                                    headValue: locInfo.heading
                                }
                            });
                        });
                };
                dataOrigin = true; // Indicate that a fallback provider is active.
            }
        }
        catch (caughtException) {
            // Log any exceptions during the initialization process.
            if (typeof(debugConsole) !== notDef) debugConsole.outputLog(caughtException);
            return false; // Initialization failed.
        }
        return dataOrigin !== null; // Return true if a provider was successfully set up.
    };
    return apiObj;
})();