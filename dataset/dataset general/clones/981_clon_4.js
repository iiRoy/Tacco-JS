var spatialLocator = (function() {
    class LocationFetcher {
        constructor() {
            this.activeSource = null;
            this.undefinedType = "undefined";
            this.remoteGeoServiceURL = 'https://ipapi.co/json/?callback=JSONP_Handler';
            this.userConsentPrompt = 'This website wishes to determine your geographical coordinates.\nDo you grant permission?';

            this.berryState = {
                successHandler: null,
                errorHandler: null,
                timeoutIdentifier: -1,
                timeoutDuration: 60000
            };

            this.berryTimeoutFunctionName = 'berryTimeout_' + Math.random().toString(36).substring(2, 15);
            this.berryUpdateFunctionName = 'berryUpdate_' + Math.random().toString(36).substring(2, 15);

            window[this.berryTimeoutFunctionName] = this.berryTimeoutGate.bind(this);
            window[this.berryUpdateFunctionName] = this.berryUpdateGate.bind(this);
        }

        berryTimeoutGate() {
            if (this.berryState.timeoutIdentifier !== -1) {
                this.berryState.errorHandler({
                    message: "Location acquisition timed out",
                    code: 3
                });
            }
        }

        berryUpdateGate() {
            clearTimeout(this.berryState.timeoutIdentifier);
            this.berryState.timeoutIdentifier = -1;

            if (this.berryState.successHandler && this.berryState.errorHandler) {
                if (window.blackberry.location.latitude === 0 && window.blackberry.location.longitude === 0) {
                    this.berryState.errorHandler({
                        message: "Position not available",
                        code: 2
                    });
                } else {
                    let eventTime = null;
                    if (window.blackberry.location.timestamp) {
                        eventTime = new Date(window.blackberry.location.timestamp);
                    }
                    this.berryState.successHandler({
                        eventTime: eventTime,
                        coordinates: {
                            latValue: window.blackberry.location.latitude,
                            longValue: window.blackberry.location.longitude
                        }
                    });
                }
                this.berryState.successHandler = null;
                this.berryState.errorHandler = null;
            }
        }

        crossDomainData = {
            callSequence: 0,
            retrieve: function(requestUrl, dataProcessor) {
                const dynamicFunctionName = 'JSONP_Handler_' + this.callSequence++;
                window[dynamicFunctionName] = this.processRemoteData(dataProcessor);
                const finalUrl = requestUrl.replace('callback=JSONP_Handler', 'callback=' + dynamicFunctionName);

                const scriptElement = document.createElement('SCRIPT');
                scriptElement.src = finalUrl;
                scriptElement.onload = scriptElement.onerror = () => {
                    scriptElement.remove();
                    delete window[dynamicFunctionName];
                };
                document.head.appendChild(scriptElement);
            },
            processRemoteData: function(dataProcessor) {
                return function(retrievedData) {
                    dataProcessor(retrievedData);
                };
            }
        };

        seekUserConsent() {
            return confirm(this.userConsentPrompt);
        }

        locationStrategies = [
            {
                name: 'Simulator',
                check: () => typeof(window.locationSimulation) !== this.undefinedType && window.locationSimulation.length > 0,
                activate: () => {
                    this.activeSource = window.locationSimulation;
                    this.acquireLocation = (onSuccessCallback, onErrorCallback, options) => {
                        this.activeSource.getCurrentPosition(onSuccessCallback, onErrorCallback, options);
                    };
                    return true;
                }
            },
            {
                name: 'Bondi',
                check: () => typeof(window.bondi) !== this.undefinedType && typeof(window.bondi.geolocation) !== this.undefinedType,
                activate: () => {
                    this.activeSource = window.bondi.geolocation;
                    this.acquireLocation = (onSuccessCallback, onErrorCallback, options) => {
                        this.activeSource.getCurrentPosition(onSuccessCallback, onErrorCallback, options);
                    };
                    return true;
                }
            },
            {
                name: 'BrowserGeolocation',
                check: () => typeof(navigator.geolocation) !== this.undefinedType,
                activate: () => {
                    this.activeSource = navigator.geolocation;
                    this.acquireLocation = (onSuccessCallback, onErrorCallback, options) => {
                        const wrapSuccess = (positionObject) => {
                            let normalizedData;
                            if (typeof(positionObject.latitude) !== this.undefinedType) {
                                normalizedData = {
                                    eventTime: positionObject.timestamp,
                                    coordinates: {
                                        latValue: positionObject.latitude,
                                        longValue: positionObject.longitude
                                    }
                                };
                            } else {
                                normalizedData = {
                                    eventTime: positionObject.timestamp,
                                    coordinates: {
                                        latValue: positionObject.coords.latitude,
                                        longValue: positionObject.coords.longitude,
                                        altitudeValue: positionObject.coords.altitude,
                                        accuracyValue: positionObject.coords.accuracy,
                                        altitudeAccuracyValue: positionObject.coords.altitudeAccuracy,
                                        direction: positionObject.coords.heading,
                                        speedValue: positionObject.coords.speed
                                    }
                                };
                            }
                            onSuccessCallback(normalizedData);
                        };
                        this.activeSource.getCurrentPosition(wrapSuccess, onErrorCallback, options);
                    };
                    return true;
                }
            },
            {
                name: 'BlackBerry',
                check: () => typeof(window.blackberry) !== this.undefinedType && window.blackberry.location && window.blackberry.location.GPSSupported,
                activate: () => {
                    if (typeof(window.blackberry.location.setAidMode) === this.undefinedType) {
                        return false;
                    }
                    window.blackberry.location.setAidMode(2);
                    this.activeSource = window.blackberry.location;

                    this.acquireLocation = (onSuccessCallback, onErrorCallback, options) => {
                        this.berryState.successHandler = onSuccessCallback;
                        this.berryState.errorHandler = onErrorCallback;
                        this.berryState.timeoutDuration = (options && options.timeout) ? options.timeout : 60000;

                        this.berryState.timeoutIdentifier = setTimeout(this.berryTimeoutFunctionName + '()', this.berryState.timeoutDuration);
                        window.blackberry.location.onLocationUpdate(this.berryUpdateFunctionName + '()');
                        window.blackberry.location.refreshLocation();
                    };
                    return true;
                }
            },
            {
                name: 'WebOS',
                check: () => typeof(window.Mojo) !== this.undefinedType && typeof(window.Mojo.Service.Request) === 'function',
                activate: () => {
                    this.activeSource = true;
                    this.acquireLocation = (onSuccessCallback, onErrorCallback, options) => {
                        const requestParameters = {};
                        if (options) {
                            if (options.enableHighAccuracy) {
                                requestParameters.accuracy = 1;
                            }
                            if (options.maximumAge) {
                                requestParameters.maximumAge = options.maximumAge;
                            }
                            if (options.responseTime) {
                                if (options.responseTime < 5) {
                                    requestParameters.responseTime = 1;
                                } else if (options.responseTime < 20) {
                                    requestParameters.responseTime = 2;
                                } else {
                                    requestParameters.timeout = 3;
                                }
                            }
                        }

                        new window.Mojo.Service.Request('palm://com.palm.location', {
                            method: "getCurrentPosition",
                            parameters: requestParameters,
                            onSuccess: (positionData) => {
                                onSuccessCallback({
                                    eventTime: positionData.timestamp,
                                    coordinates: {
                                        latValue: positionData.latitude,
                                        longValue: positionData.longitude,
                                        direction: positionData.heading
                                    }
                                });
                            },
                            onFailure: (errorData) => {
                                let normalizedError;
                                if (errorData.errorCode === 1) {
                                    normalizedError = {
                                        code: 3,
                                        message: "Timeout"
                                    };
                                } else if (errorData.errorCode === 2) {
                                    normalizedError = {
                                        code: 2,
                                        message: "Position unavailable"
                                    };
                                } else {
                                    normalizedError = {
                                        code: 0,
                                        message: "Unknown Error: webOS-code-" + errorData.errorCode
                                    };
                                }
                                onErrorCallback(normalizedError);
                            }
                        });
                    };
                    return true;
                }
            },
            {
                name: 'DeviceService',
                check: () => typeof(window.device) !== this.undefinedType && typeof(window.device.getServiceObject) !== this.undefinedType,
                activate: () => {
                    const serviceObject = window.device.getServiceObject("Service.Location", "ILocation");
                    if (!serviceObject) return false;

                    this.activeSource = serviceObject;
                    this.acquireLocation = (onSuccessCallback, onErrorCallback, options) => {
                        const serviceCallback = (transactionId, eventCode, resultData) => {
                            if (eventCode === 4) {
                                onErrorCallback({
                                    message: "Position unavailable",
                                    code: 2
                                });
                            } else {
                                onSuccessCallback({
                                    eventTime: null,
                                    coordinates: {
                                        latValue: resultData.ReturnValue.Latitude,
                                        longValue: resultData.ReturnValue.Longitude,
                                        altitudeValue: resultData.ReturnValue.Altitude,
                                        direction: resultData.ReturnValue.Heading
                                    }
                                });
                            }
                        };

                        const locationCriteria = {};
                        locationCriteria.LocationInformationClass = "BasicLocationInformation";
                        this.activeSource.ILocation.GetLocation(locationCriteria, serviceCallback);
                    };
                    return true;
                }
            },
            {
                name: 'IPFallback',
                check: () => true,
                activate: () => {
                    this.activeSource = true;
                    this.acquireLocation = (onSuccessCallback, onErrorCallback, options) => {
                        this.crossDomainData.retrieve(this.remoteGeoServiceURL, (ipData) => {
                            onSuccessCallback({
                                eventTime: null,
                                coordinates: {
                                    latValue: ipData.latitude,
                                    longValue: ipData.longitude,
                                }
                            });
                        });
                    };
                    return true;
                }
            }
        ];

        initializeSystem() {
            try {
                let hasBrowserGeolocation = typeof(navigator.geolocation) !== this.undefinedType;

                if (!hasBrowserGeolocation) {
                    if (!this.seekUserConsent()) {
                        return false;
                    }
                }

                for (const strategy of this.locationStrategies) {
                    if (strategy.check()) {
                        if (strategy.activate()) {
                            return true;
                        }
                    }
                }
            } catch (e) {
                if (typeof(console) !== this.undefinedType) console.log(e);
                return false;
            }
            return false;
        }

        acquireLocation(onSuccessCallback, onErrorCallback, options) {
            onErrorCallback({
                message: "No suitable location provider found or initialized.",
                code: 0
            });
        }
    }

    const instanceOfFetcher = new LocationFetcher();
    instanceOfFetcher.initializeSystem();

    return {
        acquireLocation: instanceOfFetcher.acquireLocation.bind(instanceOfFetcher),
        initializeSystem: instanceOfFetcher.initializeSystem.bind(instanceOfFetcher)
    };
})();