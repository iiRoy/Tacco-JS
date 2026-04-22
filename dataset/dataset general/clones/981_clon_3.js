let _mobileLocationContext = {
    onSuccessCallback: null,
    onErrorCallback: null,
    deviceTimeoutIdentifier: -1,
    // Configuration for timeout
    defaultTimeoutMs: 65000
};

function _handleDeviceLocationTimeout() {
    if (_mobileLocationContext.deviceTimeoutIdentifier !== -1) {
        // Ensure error callback is a function before calling
        if (typeof _mobileLocationContext.onErrorCallback === 'function') {
            _mobileLocationContext.onErrorCallback({
                message: "Location acquisition timed out",
                code: 3
            });
        }
        _mobileLocationContext.deviceTimeoutIdentifier = -1; // Reset after handling
    }
}

function _processDeviceLocationResult() {
    // Clear any pending timeouts as location data has arrived
    if (_mobileLocationContext.deviceTimeoutIdentifier !== -1) {
        clearTimeout(_mobileLocationContext.deviceTimeoutIdentifier);
        _mobileLocationContext.deviceTimeoutIdentifier = -1;
    }

    // Validate that both success and error handlers are available
    if (typeof _mobileLocationContext.onSuccessCallback !== 'function' || typeof _mobileLocationContext.onErrorCallback !== 'function') {
        // If handlers are not properly set, we can't proceed
        // Optionally log or throw an error here, but for Type III, we might just silently exit
        return;
    }

    const {
        location: deviceLoc
    } = window.blackberry;

    if (!deviceLoc || (deviceLoc.latitude === 0 && deviceLoc.longitude === 0)) {
        // According to W3C Geo API, this indicates position unavailable
        _mobileLocationContext.onErrorCallback({
            message: "Device position unavailable or invalid",
            code: 2
        });
    } else {
        let positionTimestamp = null;
        // Check for timestamp availability which often implies newer device OS
        if (deviceLoc.timestamp) {
            positionTimestamp = new Date(deviceLoc.timestamp);
        }

        const acquiredPosition = {
            timestamp: positionTimestamp,
            coordinates: {
                latitude: deviceLoc.latitude,
                longitude: deviceLoc.longitude
            }
        };
        _mobileLocationContext.onSuccessCallback(acquiredPosition);
    }

    // Nullify callbacks to prevent accidental re-use and signal completion
    // The BlackBerry API often requires this manual cleanup
    _mobileLocationContext.onSuccessCallback = null;
    _mobileLocationContext.onErrorCallback = null;
}

const LocationServiceFactory = function() {

    const publicMethods = {}; // The object to be returned as the public API
    let activeLocationProvider = null; // Stores the detected geolocation provider
    const undefinedTypeString = "undefined"; // String constant for type checking

    // Fallback service for IP-based geolocation
    const ipGeoServiceUrl = 'https://freegeoip.app/json/?callback=JSONP_CALLBACK_PLACEHOLDER'; // Updated URL

    /**
     * Internal utility for JSONP requests.
     */
    publicMethods.jsonpFetcher = {
        requestCounter: 0, // Unique counter for JSONP callbacks

        // Executes a JSONP request to the given URL
        initiateRequest: function(serviceUrl, completionCallback) {
            const callbackFuncName = 'jsonpCb_' + this.requestCounter++;
            window[callbackFuncName] = this._generateCallbackHandler(completionCallback); // Assign handler to global scope

            const finalUrl = serviceUrl.replace('JSONP_CALLBACK_PLACEHOLDER', callbackFuncName);

            const scriptElement = document.createElement('SCRIPT');
            scriptElement.src = finalUrl;
            scriptElement.async = true; // Non-blocking script loading
            scriptElement.onerror = function() {
                console.error("JSONP script failed to load:", finalUrl);
                // Optionally call error callback if available
                if (typeof completionCallback === 'function' && completionCallback.error) {
                    completionCallback.error({
                        message: "Network error fetching IP geolocation",
                        code: 0
                    });
                }
                // Clean up script element
                if (scriptElement.parentNode) {
                    scriptElement.parentNode.removeChild(scriptElement);
                }
                delete window[callbackFuncName]; // Clean up global function
            };

            // Append script to document body for execution
            document.body.appendChild(scriptElement);
        },

        // Creates a wrapper for the actual callback to ensure cleanup
        _generateCallbackHandler: function(originalCallback) {
            return function(responseData) {
                if (typeof originalCallback === 'function') {
                    originalCallback(responseData);
                }
                // Clean up the global callback function after execution
                // This 'this' refers to jsonpFetcher
                const currentCallbackName = Object.keys(window).find(key => window[key] === arguments.callee);
                if (currentCallbackName) {
                    delete window[currentCallbackName];
                }
            };
        }
    };

    /**
     * Prompts the user for permission to access location.
     * @returns {boolean} True if permission is granted, false otherwise.
     */
    publicMethods.requestUserPermission = function() {
        return confirm('This application requires access to your physical location. Do you grant permission?');
    };

    /**
     * Retrieves the current geographical position.
     * @param {function} successHandler - Callback for successful position retrieval.
     * @param {function} errorHandler - Callback for errors during position retrieval.
     * @param {object} [options] - Optional parameters for position retrieval.
     */
    publicMethods.fetchCurrentPosition = function(successHandler, errorHandler, options) {
        // Basic validation for handlers
        if (typeof successHandler !== 'function') {
            console.error("Geolocation: Success handler must be a function.");
            return;
        }
        if (typeof errorHandler !== 'function') {
            console.warn("Geolocation: Error handler is not a function. Errors might not be reported.");
            // Create a dummy error handler to prevent crashes if not provided
            errorHandler = (err) => console.error("Geolocation error (no handler provided):", err);
        }

        if (!activeLocationProvider) {
            // If init was not called or failed, we can't get location
            errorHandler({
                message: "Location service not initialized or no provider found.",
                code: 0
            });
            return;
        }

        // Delegate to the specific provider's implementation
        activeLocationProvider.getCurrentPosition(successHandler, errorHandler, options);
    };

    /**
     * Initializes the location service by detecting the best available provider.
     * @returns {boolean} True if a provider was successfully initialized, false otherwise.
     */
    publicMethods.initializeService = function() {
        // Exit early if service is already initialized
        if (activeLocationProvider) {
            console.warn("Location service already initialized.");
            return true;
        }

        try {
            const hasStandardGeolocation = typeof(navigator.geolocation) !== undefinedTypeString;

            // Step 1: Check for standard W3C Geolocation API
            if (hasStandardGeolocation) {
                activeLocationProvider = navigator.geolocation;
                // Wrap the standard getCurrentPosition to unify the output structure
                publicMethods.fetchCurrentPosition = function(succCb, errCb, opts) {
                    const standardSuccessWrapper = (positionObj) => {
                        let formattedPosition;
                        // Handle potential variations in returned position object (e.g., older Firefox Geode)
                        if (typeof(positionObj.latitude) !== undefinedTypeString && typeof(positionObj.longitude) !== undefinedTypeString) {
                            formattedPosition = {
                                timestamp: positionObj.timestamp,
                                coordinates: {
                                    latitude: positionObj.latitude,
                                    longitude: positionObj.longitude,
                                    altitude: positionObj.altitude,
                                    accuracy: positionObj.accuracy,
                                    altitudeAccuracy: positionObj.altitudeAccuracy,
                                    heading: positionObj.heading,
                                    speed: positionObj.speed
                                }
                            };
                        } else {
                            formattedPosition = {
                                timestamp: positionObj.timestamp,
                                coordinates: positionObj.coords // Assume coords object is already W3C compliant
                            };
                        }
                        succCb(formattedPosition);
                    };
                    activeLocationProvider.getCurrentPosition(standardSuccessWrapper, errCb, opts);
                };
            }
            // Step 2: Check for a simulated geolocation provider (for testing/development)
            else if (typeof(window.geoPositionSimulator) !== undefinedTypeString && window.geoPositionSimulator.length > 0) {
                activeLocationProvider = window.geoPositionSimulator;
            }
            // Step 3: Check for Bondi API (older mobile platforms)
            else if (typeof(window.bondi) !== undefinedTypeString && typeof(window.bondi.geolocation) !== undefinedTypeString) {
                activeLocationProvider = window.bondi.geolocation;
            }
            // Step 4: Check for BlackBerry-specific geolocation
            else if (typeof(window.blackberry) !== undefinedTypeString && window.blackberry.location && window.blackberry.location.GPSSupported) {
                // Ensure setAidMode exists before calling
                if (typeof window.blackberry.location.setAidMode === undefinedTypeString) {
                    console.warn("BlackBerry setAidMode not available, cannot configure GPS.");
                    return false;
                }
                window.blackberry.location.setAidMode(2); // Set to autonomous mode

                publicMethods.fetchCurrentPosition = function(succCb, errCb, optionsParam) {
                    _mobileLocationContext.onSuccessCallback = succCb;
                    _mobileLocationContext.onErrorCallback = errCb;

                    // Determine timeout for BlackBerry
                    let currentTimeout = _mobileLocationContext.defaultTimeoutMs;
                    if (optionsParam && typeof optionsParam.timeout === 'number' && optionsParam.timeout > 0) {
                        currentTimeout = optionsParam.timeout;
                    }

                    _mobileLocationContext.deviceTimeoutIdentifier = setTimeout("_handleDeviceLocationTimeout()", currentTimeout);

                    // BlackBerry API often requires function names as strings for callbacks
                    window.blackberry.location.onLocationUpdate("_processDeviceLocationResult()");
                    window.blackberry.location.refreshLocation();
                };
                activeLocationProvider = window.blackberry.location; // Assign dummy provider to signify detection
            }
            // Step 5: Check for Palm WebOS Mojo API
            else if (typeof(window.Mojo) !== undefinedTypeString && typeof(window.Mojo.Service) !== undefinedTypeString && typeof(window.Mojo.Service.Request) !== undefinedTypeString) {
                activeLocationProvider = {
                    // Create a mock provider object to hold the WebOS specific logic
                    getCurrentPosition: function(succCb, errCb, optionsParam) {
                        const webosRequestParameters = {};
                        if (optionsParam) {
                            if (optionsParam.enableHighAccuracy === true) {
                                webosRequestParameters.accuracy = 1; // High accuracy for WebOS
                            }
                            if (optionsParam.maximumAge) {
                                webosRequestParameters.maximumAge = optionsParam.maximumAge;
                            }
                            // Map W3C responseTime to WebOS specifics
                            if (optionsParam.responseTime) {
                                if (optionsParam.responseTime < 5) {
                                    webosRequestParameters.responseTime = 1;
                                } else if (optionsParam.responseTime < 20) {
                                    webosRequestParameters.responseTime = 2;
                                } else {
                                    webosRequestParameters.timeout = 3; // WebOS timeout option
                                }
                            }
                        }

                        new Mojo.Service.Request('palm://com.palm.location', {
                            method: "getCurrentPosition",
                            parameters: webosRequestParameters,
                            onSuccess: function(webosPos) {
                                succCb({
                                    timestamp: webosPos.timestamp,
                                    coordinates: {
                                        latitude: webosPos.latitude,
                                        longitude: webosPos.longitude,
                                        heading: webosPos.heading
                                    }
                                });
                            },
                            onFailure: function(webosError) {
                                let errorDetails = {
                                    code: 0,
                                    message: "Unknown WebOS error"
                                };
                                switch (webosError.errorCode) {
                                    case 1:
                                        errorDetails = {
                                            code: 3,
                                            message: "WebOS Geolocation Timeout"
                                        };
                                        break;
                                    case 2:
                                        errorDetails = {
                                            code: 2,
                                            message: "WebOS Position Unavailable"
                                        };
                                        break;
                                    default:
                                        errorDetails.message += `: ${webosError.errorCode}`;
                                }
                                errCb(errorDetails);
                            }
                        });
                    }
                };
            }
            // Step 6: Check for "device" object (older proprietary mobile APIs, e.g., for Symbian/Bada)
            else if (typeof(window.device) !== undefinedTypeString && typeof(window.device.getServiceObject) !== undefinedTypeString) {
                const deviceServiceProvider = window.device.getServiceObject("Service.Location", "ILocation");
                if (deviceServiceProvider) {
                    activeLocationProvider = {
                        getCurrentPosition: function(succCb, errCb, optionsParam) {
                            const deviceLocationCallback = function(transactionId, eventStatus, locationResult) {
                                if (eventStatus === 4) { // Event code 4 often means error/unavailable
                                    errCb({
                                        message: "Device location service unavailable or failed",
                                        code: 2
                                    });
                                } else {
                                    // Map proprietary result to W3C-like format
                                    const deviceCoords = locationResult.ReturnValue;
                                    succCb({
                                        timestamp: null, // Proprietary APIs often lack timestamp
                                        coordinates: {
                                            latitude: deviceCoords.Latitude,
                                            longitude: deviceCoords.Longitude,
                                            altitude: deviceCoords.Altitude,
                                            heading: deviceCoords.Heading
                                        }
                                    });
                                }
                            };
                            // Define location criteria for the device service
                            const locationCriteria = {
                                LocationInformationClass: "BasicLocationInformation"
                            };
                            deviceServiceProvider.ILocation.GetLocation(locationCriteria, deviceLocationCallback);
                        }
                    };
                }
            }
            // Step 7: Fallback to IP-based geolocation via JSONP if no other provider is found
            else {
                // Before confirming, check if the user allows IP-based tracking
                if (!publicMethods.requestUserPermission()) {
                    console.warn("IP-based geolocation denied by user.");
                    return false;
                }
                activeLocationProvider = {
                    getCurrentPosition: function(succCb, errCb, optionsParam) {
                        publicMethods.jsonpFetcher.initiateRequest(ipGeoServiceUrl, (ipData) => {
                            if (ipData && ipData.latitude && ipData.longitude) {
                                succCb({
                                    timestamp: new Date().getTime(), // Generate current timestamp
                                    coordinates: {
                                        latitude: ipData.latitude,
                                        longitude: ipData.longitude,
                                        heading: null // IP-based data usually lacks heading
                                    }
                                });
                            } else {
                                errCb({
                                    message: "Failed to retrieve IP-based geolocation data.",
                                    code: 0
                                });
                            }
                        });
                    }
                };
            }

            // If after all checks, no provider was set, and the user didn't grant permission for fallback, then fail.
            if (!activeLocationProvider && !hasStandardGeolocation && !publicMethods.requestUserPermission()) {
                console.warn("Geolocation service initialization failed: No provider found and user denied permission for fallback.");
                return false;
            }

        } catch (initializationError) {
            // Catch any unexpected errors during the initialization process
            console.error("An error occurred during geolocation service initialization:", initializationError);
            // Optionally, re-throw or log more aggressively in a production environment
            return false;
        }

        // Return true if an active provider was successfully identified and configured
        return activeLocationProvider !== null;
    };

    return publicMethods;
}();