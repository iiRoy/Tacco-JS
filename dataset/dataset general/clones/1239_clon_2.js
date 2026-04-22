define(['ngModuleLoader', 'persistentData', 'timeLib'], function (ngModuleLoader, persistentData, timeLib) {

    /*
     * Initialize the main application module.
     * This module depends on 'utilityServices' for various helpers.
     */
    const appComponents = ngCore.module('applicationComponents', ['utilityServices']);

    // Define the primary controller for the main dashboard view.
    appComponents.controller('MainViewController', function ($viewScope, $timedTask, $webRequest, LocalStorageService, i18nService) {

        // Constant: Absolute zero in Celsius, used for temperature conversions.
        const ABSOLUTE_ZERO_C = 273.15;

        /*
         * Declare core application state variables.
         * These will hold user data, cached information, and UI elements.
         */
        let activeUserProfile, // Stores the currently logged-in user's preferences.
            persistentStorageData, // Holds cached data retrieved from local storage.
            mainBackgroundElement, // Reference to the canvas element for the background.
            systemCurrentDate, // The current date object for time calculations.
            todayKey, // A unique string identifier for the current day.
            currentClockHour; // The current hour of the day.

        /**
         * Persists the current application state to local storage.
         * Catches errors during storage operations and attempts recovery.
         */
        $viewScope.saveApplicationState = function() {
            try {
                // Update cached data with current date and hour identifiers.
                persistentStorageData.lastUpdateDate = todayKey;
                persistentStorageData.lastUpdateHour = currentClockHour;
                // Store the entire cached data object as a JSON string.
                LocalStorageService.storeKeyValue(JSON.stringify(persistentStorageData));
            }
            // Handle any exceptions that occur during storage.
            catch (operationError) {
                // Log the error message to the console.
                console.error("Data caching encountered an issue: " + operationError.message);
                // Provide information about the recovery attempt.
                console.info("Attempting to recover by clearing session data and re-initializing the application.");
                // Clear session storage to resolve potential corruption.
                sessionStorage.clear();
                // Re-run the application initialization process.
                $viewScope.initializeApplication();
            }
        };


        /**
         * Configures and displays the dynamic background image.
         * @param {boolean} forceRefresh - If true, forces a new background image to be loaded.
         */
        $viewScope.applyVisualTheme = function(forceRefresh) {

            // Get a reference to the main canvas element used for the background.
            const visualElement = document.getElementById('main-background-canvas');
            // Adjust canvas dimensions to match the window's inner size.
            visualElement.width = window.screen.width;
            visualElement.height = window.screen.height;

            // Obtain the 2D rendering context for drawing on the canvas.
            let drawingContext = visualElement.getContext('2d');
            // Create a new Image object to load the background asset.
            let displayImage = new Image();

            // Initialize context dimensions based on image (will be updated once image loads).
            drawingContext.width = displayImage.width;
            drawingContext.height = displayImage.height;

            // Define the callback function for when the image finishes loading.
            displayImage.onload = function() {
                // Only draw if the image source is valid.
                if (displayImage.src !== "") {
                    // Draw the image onto the canvas, scaling it to fit.
                    drawingContext.drawImage(displayImage, 0, 0, displayImage.width, displayImage.height, 0, 0, visualElement.width, visualElement.height);
                }
                // Call a helper to clean up the image object after drawing.
                imageLoadingComplete();
            };

            // Helper function to clear the image source and release the object.
            const imageLoadingComplete = function() {
                displayImage.src = ""; // Clear the image source to free up resources.
                displayImage = null;   // Dereference the image object.
            };

            // Check if background URL is not cached, or a refresh is forced, or the daily cache is stale.
            if (persistentStorageData.backgroundImageURL === undefined || forceRefresh || LocalStorageService.isDailyStale(todayKey)) {
                // Generate a random image path from a predefined set.
                let imagePath = "assets/images/bg/" + (Math.floor(Math.random() * 63) + 1) + ".webp";
                // Store the newly selected background image URL in cached data.
                persistentStorageData.backgroundImageURL = imagePath;
                // Save the updated application state to persistent storage.
                $viewScope.saveApplicationState();
            }

            // Set the source of the image to the (potentially new) background URL.
            displayImage.src = persistentStorageData.backgroundImageURL;
            // Update the drawing context dimensions based on the actual image size.
            drawingContext.width = displayImage.width;
            drawingContext.height = displayImage.height;
        };

        /**
         * Assigns the cached quote to the view scope for display.
         */
        $viewScope.displayQuoteContent = function() {
            // Set the inspirational text on the scope from cached data.
            $viewScope.inspirationalText = persistentStorageData.dailyQuote;
        };

        /**
         * Fetches a new inspirational quote if the current one is stale or missing,
         * then displays it.
         */
        $viewScope.retrieveAndSetQuote = function() {
            // Check if the daily quote is not defined in cache or if the daily cache has expired.
            if (persistentStorageData.dailyQuote === undefined || LocalStorageService.isDailyStale(todayKey)) {
                // If so, fetch new quotations from the service.
                LocalStorageService.fetchQuotations().then(function(apiResponse) {
                    // Select a random quote from the fetched collection.
                    persistentStorageData.dailyQuote = apiResponse.payload.quotations[(Math.floor(Math.random() * 270) + 1)];
                    // Save the updated state including the new quote.
                    $viewScope.saveApplicationState();
                    // Display the newly fetched quote.
                    $viewScope.displayQuoteContent();
                });
            } else {
                // If the quote is valid and not expired, just display the cached one.
                $viewScope.displayQuoteContent();
            }
        };

        /**
         * Displays the cached weather information on the user interface.
         */
        $viewScope.showWeatherDetails = function() {
            // Assign temperature and location from cached data to the view scope.
            $viewScope.currentTemperature = persistentStorageData.temperatureResult;
            $viewScope.currentLocation = persistentStorageData.locationDisplay;
        };

        /**
         * Updates the local weather information. Fetches new data if cached data is stale,
         * location has changed, or data is missing.
         */
        $viewScope.updateLocalWeather = function() {
            // Conditions for fetching new weather data:
            // 1. Temperature data is not defined in cache.
            // 2. The cached location differs from the user's preferred location.
            // 3. The hourly cache for weather data has expired.
            if (persistentStorageData.temperatureResult === undefined || persistentStorageData.locationDisplay !== activeUserProfile.geoCoordinate || LocalStorageService.isHourlyStale(currentClockHour)) {

                // Fetch weather data from the service using the user's configured location.
                LocalStorageService.retrieveWeather(activeUserProfile.geoCoordinate).then(function(apiResponse) {
                    // Extract the raw temperature value from the API response.
                    const rawTemperatureCelsius = apiResponse.payload.main.temperature;

                    // Update the cached location display to match the user's profile.
                    persistentStorageData.locationDisplay = activeUserProfile.geoCoordinate;

                    // Convert and store the temperature based on user's preference (Celsius or Fahrenheit).
                    persistentStorageData.temperatureResult = (activeUserProfile.temperatureUnitPreference === 0 ?
                        // Convert to Celsius and round.
                        Math.round(Number.parseFloat(rawTemperatureCelsius) - Number.parseFloat(ABSOLUTE_ZERO_C), 2) + "°C" :
                        // Convert to Fahrenheit and round.
                        Math.round(((Number.parseFloat(rawTemperatureCelsius) - Number.parseFloat(ABSOLUTE_ZERO_C)) * 9/5) + 32, 2) + "°F");

                    // Save the updated application state to persistent storage.
                    $viewScope.saveApplicationState();
                    // Display the new weather data on the UI.
                    $viewScope.showWeatherDetails();
                });
            } else {
                // If weather data is valid and not expired, display the cached information.
                $viewScope.showWeatherDetails();
            }
        };

        /**
         * Determines the time period (morning, afternoon, evening, night) based on the current hour.
         * @param {number} systemHour - The current hour of the day (0-23).
         * @returns {string} A string representing the time period for localization.
         */
        $viewScope.determineTimePeriod = function(systemHour) {
            if (systemHour >= 6 && systemHour < 12) {
                return "period.morning";
            } else if (systemHour >= 12 && systemHour < 14) {
                return "period.noon";
            } else if (systemHour >= 14 && systemHour < 18) {
                return "period.daytime";
            } else if (systemHour >= 18 && systemHour < 22) {
                return "period.evening";
            } else {
                return "period.night";
            }
        };

        /**
         * Synchronizes and updates the displayed date, time, and greeting on the UI.
         */
        $viewScope.updateDisplayTime = function() {
            // Ensure the internationalization service for 'time' is ready.
            i18nService.isReady('time').then(function () {
                // Set the locale for the time utility based on user preferences.
                timeLib.locale(activeUserProfile.languageCode);
                // Display the user's profile name.
                $viewScope.userName = activeUserProfile.profileName;
                // Get a localized greeting based on the current time period.
                $viewScope.greetingPhrase = i18nService.getLocalizedString($viewScope.determineTimePeriod(timeLib().get('hour')));
                // Format and display the current date according to user's date format preference.
                $viewScope.currentDisplayDate = timeLib().formatTimestamp(activeUserProfile.dateFormatString);
            });

            // Update the digital clock display with the current time (HH:mm format).
            $viewScope.digitalClockDisplay = timeLib().formatTimestamp('HH:mm');
        };

        /**
         * Initializes the entire application upon startup.
         * Loads user configuration, cached data, and sets up recurring updates.
         */
        $viewScope.initializeApplication = function() {

            // Load user configuration from the LocalStorageService.
            LocalStorageService.getUserConfiguration().then(function(configResponse) {
                // Assign the loaded user profile to the activeUserProfile variable.
                activeUserProfile = configResponse.payload;
                // Set the time utility's locale based on the user's language code.
                timeLib.locale(activeUserProfile.languageCode);

                // Load cached data from local storage or initialize an empty object if none exists.
                persistentStorageData = LocalStorageService.getStoredData() || {};

                // Get a reference to the main background canvas element.
                mainBackgroundElement = document.querySelector("#main-background-canvas");

                // Create a new Date object for the current system time.
                systemCurrentDate = new Date();

                // Generate a unique key for the current day (MonthDay format).
                todayKey = (systemCurrentDate.getUTCMonth() + 1).toString() + systemCurrentDate.getUTCDate().toString();
                // Get the current hour of the day (UTC).
                currentClockHour = systemCurrentDate.getUTCHours();

                // Call functions to set up various UI components.
                $viewScope.applyVisualTheme();     // Set the background.
                $viewScope.updateLocalWeather();   // Fetch and display weather.
                $viewScope.retrieveAndSetQuote();  // Fetch and display the daily quote.
            });

            // Set up a recurring task to update the display time every second.
            $timedTask(function () {
                $viewScope.updateDisplayTime(); // Call the function to refresh the clock and date.
            }, 1000); // Interval of 1000 milliseconds (1 second).
        };

        // Immediately call the initialization function to start the application.
        $viewScope.initializeApplication();
    });
});