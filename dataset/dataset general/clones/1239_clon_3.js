define(['ngAmplify', 'dataStore', 'timeUtility'], function (ngAmplify, dataStore, timeUtil) {
    // This module encapsulates core application logic for the main dashboard.
    var appModules = angular.module('appModules', ['services']);

    appModules.controller('MainPanelController', function ($vm, $timer, $webSvc, appDataSvc, txtRes) {

        // Constant for converting Kelvin to Celsius temperature.
        const KELVIN_OFFSET_TO_CELSIUS = 273.15;

        // Private variables to hold application state and configuration.
        let currentUserConfig;         // User preferences loaded from a service.
        let cachedResources = {};      // Data stored persistently in local storage.
        let canvasElement;             // Reference to the main background canvas.
        let currentDateTimeObj;        // Standard JavaScript Date object.
        let todayIdentifier;           // Unique string for the current day (e.g., '1225' for Dec 25th).
        let currentHourOfDay;          // Integer representing the current hour (0-23).
        let isProcessingData = false;  // Flag to prevent concurrent persistence operations.

        /**
         * Safely persists application state to local storage.
         * Includes basic error handling and an attempt to recover.
         */
        $vm.refreshPersistence = function () {
            if (isProcessingData) {
                console.warn("Skipping persistence: another operation is already active.");
                return; // Exit if another save is in progress.
            }
            isProcessingData = true; // Set flag to indicate an operation is starting.
            try {
                cachedResources.lastSavedDate = todayIdentifier;
                cachedResources.lastSavedHour = currentHourOfDay;
                appDataSvc.storeData(JSON.stringify(cachedResources));
            } catch (persistenceError) {
                console.error("Critical storage error encountered: ", persistenceError.message);
                console.info("Attempting automatic recovery: clearing local storage and re-initializing the application.");
                localStorage.clear(); // Clear all data.
                $vm.initializeApplication(); // Re-run the startup sequence.
            } finally {
                isProcessingData = false; // Reset flag regardless of outcome.
            }
        };

        /**
         * Generates a random integer within a specified positive range.
         * @param {number} maxExclusive - The upper bound (exclusive) for the random number.
         * @returns {number} A random integer between 1 (inclusive) and maxExclusive (exclusive).
         */
        const generateRandomPositiveInt = (maxExclusive) => {
            if (maxExclusive <= 0) return 1; // Guard against invalid input.
            return Math.floor(Math.random() * maxExclusive) + 1;
        };

        /**
         * Configures the visual background theme on the canvas element.
         * Selects a new image if forced, or if the cached one is outdated/missing.
         * @param {boolean} triggerNewImageSelection - If true, forces the selection of a new background image.
         */
        $vm.configureVisualTheme = function (triggerNewImageSelection) {
            canvasElement = document.getElementById('background');
            if (!canvasElement) {
                console.error("Background canvas element with ID 'background' was not found in the DOM.");
                return; // Abort if canvas element is missing.
            }

            // Dynamically adjust canvas dimensions to match the viewport.
            canvasElement.width = window.innerWidth > 0 ? window.innerWidth : 1024; // Provide default fallback.
            canvasElement.height = window.innerHeight > 0 ? window.innerHeight : 768;

            const renderingContext = canvasElement.getContext('2d');
            const visualAsset = new Image();

            // Define the callback for when the image has successfully loaded.
            visualAsset.onload = function () {
                if (this.src) { // Ensure the image source is valid before drawing.
                    renderingContext.drawImage(this, 0, 0, this.width, this.height, 0, 0, canvasElement.width, canvasElement.height);
                }
            };

            // Determine if a new background image URL needs to be fetched or generated.
            const isThemeDataObsolete = typeof cachedResources.visualTheme === "undefined" || triggerNewImageSelection || appDataSvc.isDateExpired(todayIdentifier);
            if (isThemeDataObsolete) {
                // Assuming images are named 1.jpg, 2.jpg, ..., 63.jpg.
                const newImagePath = `img/${generateRandomPositiveInt(63)}.jpg`;
                cachedResources.visualTheme = newImagePath;
                $vm.refreshPersistence(); // Save the newly selected background path.
            }
            
            // Assign the image source to trigger loading.
            visualAsset.src = cachedResources.visualTheme;
        };

        /**
         * Internal helper to update the ViewModel with the current inspirational message from cache.
         */
        const applyQuoteToDisplay = function () {
            $vm.inspirationalQuote = cachedResources.inspirationalQuote;
        };

        /**
         * Retrieves an inspirational message. It checks cache first, then fetches if necessary.
         */
        $vm.retrieveInspirationalMessage = function () {
            const isQuoteCacheInvalid = typeof cachedResources.inspirationalQuote === "undefined" || appDataSvc.isDateExpired(todayIdentifier);

            if (isQuoteCacheInvalid) {
                appDataSvc.getQuotes().then(function (apiResponse) {
                    if (apiResponse && apiResponse.data && Array.isArray(apiResponse.data.quotes) && apiResponse.data.quotes.length > 0) {
                        const randomQuoteIndex = generateRandomPositiveInt(apiResponse.data.quotes.length) - 1; // Adjust for 0-based index.
                        cachedResources.inspirationalQuote = apiResponse.data.quotes[randomQuoteIndex];
                        $vm.refreshPersistence(); // Persist the new quote.
                        applyQuoteToDisplay();
                    } else {
                        console.warn("API response for quotes was empty or malformed.");
                        $vm.inspirationalQuote = "Unable to load an inspirational message at this time.";
                    }
                }).catch(function(apiError) {
                    console.error("Failed to fetch inspirational quotes:", apiError);
                    $vm.inspirationalQuote = "Error: Could not retrieve quotes.";
                });
            } else {
                applyQuoteToDisplay(); // Use the cached quote directly.
            }
        };

        /**
         * Internal helper to update the ViewModel with the current weather information from cache.
         */
        const applyWeatherToDisplay = function () {
            $vm.currentTemperature = cachedResources.currentTemperature;
            $vm.locationDisplay = cachedResources.locationDisplay;
        };

        /**
         * Fetches and caches weather data for the user's location, then updates the display.
         */
        $vm.fetchAndCacheWeather = function () {
            // Check if cached weather data is missing, location has changed, or data is too old.
            const isWeatherCacheInvalid = typeof cachedResources.currentTemperature === "undefined" ||
                                       cachedResources.locationDisplay !== currentUserConfig.location ||
                                       appDataSvc.isHourExpired(currentHourOfDay);

            if (isWeatherCacheInvalid) {
                appDataSvc.getWeather(currentUserConfig.location).then(function (apiResponse) {
                    if (apiResponse && apiResponse.data && apiResponse.data.main) {
                        const rawKelvinTemperature = apiResponse.data.main.temp;
                        let formattedTemperature;

                        // Convert temperature based on user's preference (0 for Celsius, otherwise Fahrenheit).
                        if (currentUserConfig.temperatureType === 0) {
                            formattedTemperature = Math.round(rawKelvinTemperature - KELVIN_OFFSET_TO_CELSIUS) + "°C";
                        } else {
                            formattedTemperature = Math.round(((rawKelvinTemperature - KELVIN_OFFSET_TO_CELSIUS) * 9 / 5) + 32) + "°F";
                        }

                        cachedResources.locationDisplay = currentUserConfig.location;
                        cachedResources.currentTemperature = formattedTemperature;
                        $vm.refreshPersistence(); // Save updated weather info.
                        applyWeatherToDisplay();
                    } else {
                        console.warn("Weather API response did not contain expected data.");
                        $vm.currentTemperature = "N/A";
                        $vm.locationDisplay = "Unknown";
                    }
                }).catch(function(apiError) {
                    console.error("Failed to fetch weather data:", apiError);
                    $vm.currentTemperature = "Error";
                    $vm.locationDisplay = "Service Issue";
                });
            } else {
                applyWeatherToDisplay(); // Display cached data.
            }
        };

        /**
         * Determines a localized greeting label based on the current hour of the day.
         * @param {number} currentHour - The hour of the day (0-23).
         * @returns {string} A string key for the time-of-day greeting.
         */
        $vm.determineTimePeriodLabel = function (currentHour) {
            // A clearer, sequential check for time periods.
            if (currentHour >= 6 && currentHour < 12) {
                return "time.morning";
            } else if (currentHour >= 12 && currentHour < 14) {
                return "time.afternoon";
            } else if (currentHour >= 14 && currentHour < 18) {
                return "time.day";
            } else if (currentHour >= 18 && currentHour < 22) {
                return "time.evening";
            } else {
                return "time.night";
            }
        };

        /**
         * Updates the displayed date and time on the ViewModel using moment.js and locale resources.
         */
        $vm.updateClockAndCalendar = function () {
            // Ensure locale resources are fully loaded before attempting string retrieval.
            txtRes.ready('time').then(function () {
                timeUtil.locale(currentUserConfig.locale); // Set the active locale for moment.js.
                const currentMomentInstance = timeUtil(); // Create a moment object for the current time.
                const hourForGreeting = currentMomentInstance.hour(); // Get the hour from the moment object.

                $vm.userName = currentUserConfig.name;
                $vm.timeOfDayGreeting = txtRes.getString($vm.determineTimePeriodLabel(hourForGreeting));
                $vm.currentDateDisplay = currentMomentInstance.format(currentUserConfig.displayDateFormat);
            });

            // Update the digital clock display instantly without waiting for locale resources.
            $vm.digitalClockDisplay = timeUtil().format('HH:mm');
        };

        /**
         * The primary initialization function for the application dashboard.
         * Loads user settings, initializes cached data, and sets up recurring updates.
         */
        $vm.initializeApplication = function () {
            // Load user configuration asynchronously.
            appDataSvc.loadUser().then(function (apiResponse) {
                if (apiResponse && apiResponse.data) {
                    currentUserConfig = apiResponse.data;
                    timeUtil.locale(currentUserConfig.locale); // Set moment.js locale based on user config.

                    // Load existing cached data, or initialize an empty object if none exists.
                    const rawCachedData = appDataSvc.getData();
                    cachedResources = rawCachedData ? JSON.parse(rawCachedData) : {};
                    
                    // Update current time variables for cache validation.
                    currentDateTimeObj = new Date();
                    todayIdentifier = (currentDateTimeObj.getMonth() + 1).toString() + currentDateTimeObj.getDate().toString();
                    currentHourOfDay = currentDateTimeObj.getHours();

                    // Trigger initial UI component updates and data fetches.
                    $vm.configureVisualTheme();
                    $vm.fetchAndCacheWeather();
                    $vm.retrieveInspirationalMessage();
                    $vm.updateClockAndCalendar(); // Perform an immediate clock update.

                } else {
                    console.error("User configuration could not be loaded. Dashboard functionality is impaired.");
                    // Consider showing a user-friendly error message or redirecting.
                }
            }).catch(function(initializationError) {
                console.error("An error occurred during application initialization:", initializationError);
                // Handle network errors or service unavailability gracefully.
            });

            // Set up a recurring interval to update the clock and calendar every second.
            $timer(function () {
                $vm.updateClockAndCalendar();
            }, 1000);
        };

        // Begin the application startup sequence when the controller is instantiated.
        $vm.initializeApplication();
    });
});