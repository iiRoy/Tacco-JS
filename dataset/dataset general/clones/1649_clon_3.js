/*
 * jQuery Weather Forecast Plugin
 * A robust and configurable widget for displaying OpenWeatherMap data.
 * Author: SyntheticDev (inspired by original work)
 * Version: 3.0.0
 * License: MIT
 */

;(function($) {

    // Define a jQuery plugin to fetch and present weather information.
    $.fn.displayLiveWeather = function(widgetOptions) {

        // Pre-check: Ensure the plugin is bound to at least one DOM element.
        // Returns the jQuery object to maintain chainability even if no elements are found.
        if (this.length === 0) {
            console.warn('LiveWeatherDisplay: No target elements were found for binding. Please ensure your selector matches existing DOM elements.');
            return this;
        }

        // Establish core configuration defaults for the weather widget.
        const widgetDefaultSettings = {
            descriptionOutputTarget: null, // CSS selector for displaying weather condition (e.g., '.weather-desc')
            maxTemperatureOutputTarget: null, // Selector for maximum daily temperature
            minTemperatureOutputTarget: null, // Selector for minimum daily temperature
            windSpeedOutputTarget: null, // Selector for wind speed
            humidityOutputTarget: null, // Selector for humidity percentage
            sunriseOutputTarget: null, // Selector for sunrise time
            sunsetOutputTarget: null, // Selector for sunset time
            locationNameOutputTarget: null, // Selector for city and country name
            weatherIconOutputTarget: null, // Selector for weather condition icon (e.g., 'img.weather-icon')
            customIconSetBaseURL: null, // Base URL for custom weather icon images (e.g., 'path/to/icons/')
            temperatureUnit: 'metric', // 'metric' (Celsius) or 'imperial' (Fahrenheit)
            cityName: null, // Specific city name (e.g., 'London')
            latitudeCoordinate: null, // Geographic latitude
            longitudeCoordinate: null, // Geographic longitude
            openWeatherAPIKey: null, // Required OpenWeatherMap API key
            displayLanguage: 'en', // Language code for weather descriptions (e.g., 'es', 'fr')
            onFetchSuccess: function(weatherData) {}, // Callback function on successful API response
            onFetchError: function(errorMessage) { console.error('LiveWeatherDisplay API Error:', errorMessage); } // Callback on API error or data issues
        };

        // Reference to the current plugin instance and the target jQuery element.
        const currentPluginInstance = this;
        const mainTargetElement = $(this);

        // Merge user-provided options with the defaults. A deep merge ensures nested objects are handled.
        currentPluginInstance.currentConfiguration = $.extend(true, {}, widgetDefaultSettings, widgetOptions);

        const activeConfig = currentPluginInstance.currentConfiguration; // Alias for easier access.

        // Construct the base URL for the OpenWeatherMap API.
        let weatherServiceURL = 'https://api.openweathermap.org/data/2.5/weather';

        // Internal helper function to safely append query parameters to a URL.
        const attachQueryParam = (baseUrl, paramKey, paramValue) => {
            if (paramValue === null || paramValue === undefined || paramValue === '') {
                return baseUrl; // Skip if value is empty or null.
            }
            const separator = baseUrl.includes('?') ? '&' : '?';
            return `${baseUrl}${separator}${paramKey}=${encodeURIComponent(paramValue)}`;
        };

        // Build the API request URL based on location settings.
        weatherServiceURL = attachQueryParam(weatherServiceURL, 'lang', activeConfig.displayLanguage);

        if (activeConfig.cityName) {
            weatherServiceURL = attachQueryParam(weatherServiceURL, 'q', activeConfig.cityName);
        } else if (activeConfig.latitudeCoordinate !== null && activeConfig.longitudeCoordinate !== null) {
            weatherServiceURL = attachQueryParam(weatherServiceURL, 'lat', activeConfig.latitudeCoordinate);
            weatherServiceURL = attachQueryParam(weatherServiceURL, 'lon', activeConfig.longitudeCoordinate);
        } else {
            // Early exit if no valid location information is provided.
            activeConfig.onFetchError('No valid location (city name or coordinates) supplied for weather lookup.');
            return this;
        }

        // Validate and append the API key.
        if (!activeConfig.openWeatherAPIKey) {
            activeConfig.onFetchError('OpenWeatherMap API key is missing. Please provide a valid key.');
            return this;
        }
        weatherServiceURL = attachQueryParam(weatherServiceURL, 'APPID', activeConfig.openWeatherAPIKey);

        // Append units parameter for temperature. OpenWeatherMap uses 'metric' or 'imperial'.
        // The plugin's `temperatureUnit` is 'metric'/'imperial' for direct mapping.
        weatherServiceURL = attachQueryParam(weatherServiceURL, 'units', activeConfig.temperatureUnit);


        // Utility function to convert a Unix timestamp to a 12-hour time string with AM/PM.
        const formatUnixTimestampTo12Hour = (timestampSeconds) => {
            if (typeof timestampSeconds !== 'number' || isNaN(timestampSeconds)) {
                return 'Invalid Time'; // Gracefully handle non-numeric inputs.
            }
            const dateTime = new Date(timestampSeconds * 1000); // Convert seconds to milliseconds.
            let hours = dateTime.getHours();
            const minutes = dateTime.getMinutes();
            const period = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12; // Convert 0-hour to 12.
            const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;
            return `${hours}:${paddedMinutes} ${period}`;
        };

        // Utility function to update a specific DOM element using its selector.
        // Supports updating text content or image `src` attributes.
        const updateDomElement = (selector, valueToSet, updateType = 'text') => {
            if (selector && valueToSet !== null && valueToSet !== undefined) {
                const targetElement = $(selector);
                if (targetElement.length) {
                    if (updateType === 'text') {
                        targetElement.text(valueToSet);
                    } else if (updateType === 'src') {
                        targetElement.attr('src', valueToSet);
                    }
                    // Could extend with other update types like 'html', 'val', etc.
                } else {
                    console.info(`LiveWeatherDisplay: Could not find element for selector "${selector}". Skipping update.`);
                }
            }
        };

        // Initiate the AJAX request to the OpenWeatherMap API.
        $.ajax({
            type: 'GET',
            url: weatherServiceURL,
            dataType: 'jsonp', // Use JSONP for cross-domain compatibility.
            timeout: 15000, // Set a reasonable timeout for the API request.

            success: function(apiResponseData) {
                // Perform robust validation of the API response structure.
                if (!apiResponseData || apiResponseData.cod !== 200 || !apiResponseData.main || !apiResponseData.weather || apiResponseData.weather.length === 0) {
                    activeConfig.onFetchError(`API response indicates an issue: Code ${apiResponseData.cod || 'N/A'}, Message: ${apiResponseData.message || 'Malformed data.'}`);
                    return; // Exit if response is invalid.
                }

                // The OpenWeatherMap API returns temperatures in the requested units ('metric' or 'imperial')
                // when the 'units' parameter is used. So, no manual conversion from Kelvin is needed here.
                const currentTemperatureValue = `${Math.round(apiResponseData.main.temp)}°${activeConfig.temperatureUnit === 'metric' ? 'C' : 'F'}`;
                const minTemperatureValue = `${Math.round(apiResponseData.main.temp_min)}°${activeConfig.temperatureUnit === 'metric' ? 'C' : 'F'}`;
                const maxTemperatureValue = `${Math.round(apiResponseData.main.temp_max)}°${activeConfig.temperatureUnit === 'metric' ? 'C' : 'F'}`;

                // Update the main target element with the current temperature.
                mainTargetElement.html(currentTemperatureValue);

                // Update various weather data points using the helper function.
                updateDomElement(activeConfig.minTemperatureOutputTarget, minTemperatureValue);
                updateDomElement(activeConfig.maxTemperatureOutputTarget, maxTemperatureValue);
                updateDomElement(activeConfig.descriptionOutputTarget, apiResponseData.weather[0].description);

                // Handle the weather icon display logic.
                if (activeConfig.weatherIconOutputTarget && apiResponseData.weather[0].icon) {
                    let iconSourceURL;
                    const weatherIconCode = apiResponseData.weather[0].icon;

                    if (activeConfig.customIconSetBaseURL) {
                        const isDaylight = weatherIconCode.endsWith('d');
                        const timeSegment = isDaylight ? 'day' : 'night';
                        let descriptiveIconName;

                        // Map OpenWeatherMap icon codes to more descriptive names for custom icon sets.
                        const iconSemanticMapping = {
                            '01': 'clear', // Clear sky
                            '02': 'few-clouds', // Few clouds
                            '03': 'scattered-clouds', // Scattered clouds
                            '04': 'broken-clouds', // Broken clouds
                            '09': 'shower-rain', // Shower rain
                            '10': 'rain', // Rain
                            '11': 'thunderstorm', // Thunderstorm
                            '13': 'snow', // Snow
                            '50': 'mist' // Mist
                        };
                        const shortIconPrefix = weatherIconCode.substring(0, 2);
                        descriptiveIconName = iconSemanticMapping[shortIconPrefix] || 'unknown'; // Fallback

                        iconSourceURL = `${activeConfig.customIconSetBaseURL}${timeSegment}/${descriptiveIconName}.png`;

                    } else {
                        // Use default OpenWeatherMap icons if no custom base URL is provided.
                        iconSourceURL = `https://openweathermap.org/img/w/${weatherIconCode}.png`;
                    }
                    updateDomElement(activeConfig.weatherIconOutputTarget, iconSourceURL, 'src');
                }

                // Update location, wind speed, humidity, and sunrise/sunset times.
                updateDomElement(activeConfig.locationNameOutputTarget, `${apiResponseData.name}, ${apiResponseData.sys.country}`);
                updateDomElement(activeConfig.windSpeedOutputTarget, `${Math.round(apiResponseData.wind.speed)} m/s`);
                updateDomElement(activeConfig.humidityOutputTarget, `${apiResponseData.main.humidity}%`);

                const sunriseFormatted = formatUnixTimestampTo12Hour(apiResponseData.sys.sunrise);
                updateDomElement(activeConfig.sunriseOutputTarget, sunriseFormatted);

                const sunsetFormatted = formatUnixTimestampTo12Hour(apiResponseData.sys.sunset);
                updateDomElement(activeConfig.sunsetOutputTarget, sunsetFormatted);

                // Execute the user-defined success callback, passing the raw API response data.
                activeConfig.onFetchSuccess.call(currentPluginInstance, apiResponseData);
            },

            error: function(jqXHR, textStatus, errorThrown) {
                // Consolidate error message for the callback.
                const detailedErrorMessage = errorThrown || textStatus || 'An unknown network error occurred.';
                activeConfig.onFetchError.call(currentPluginInstance, detailedErrorMessage);
            }
        }); // End of AJAX call.

        // Always return the jQuery object for method chaining.
        return this;
    }; // End of $.fn.displayLiveWeather plugin definition.

})(jQuery);