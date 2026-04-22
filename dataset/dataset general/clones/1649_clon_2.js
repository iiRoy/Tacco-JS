/*
 * Module: Weather Information Retriever
 * Dependencies: jQuery Library, OpenWeatherMap API Service
 * Author: Code Clone Generator
 * Creation Date: March 15, 2023
 * License: Permissive Open-Source (e.g., MIT equivalent)
 */

;(function(jq) {

  jq.fn.getWeatherData = function(configSettings) {

    // Exit if no DOM elements were matched by the selector
    // This allows method chaining to continue unaffected.
    if (!this.itemCount) {
      return this;
    }

    // Establish a set of predefined configuration attributes
    var standardOptions = {
      conditionDisplay: null,
      highTempDisplay: null,
      lowTempDisplay: null,
      windVelocityDisplay: null,
      moistureDisplay: null,
      dawnDisplay: null,
      duskDisplay: null,
      locationDisplay: null,
      symbolDisplay: null,
      userDefinedIcons: null,
      tempUnits: 'c', // 'c' for Celsius, 'f' for Fahrenheit
      cityName: null,
      latitudeCoord: null,
      longitudeCoord: null,
      apiKey: null,
      languageCode: 'en',
      onSuccess: function() {}, // Callback for successful data retrieval
      onError: function(issueMsg) {} // Callback for errors during retrieval
    };

    // Reference to the current plugin instance
    var weatherPlugin = this;

    // The jQuery-wrapped target HTML element
    var targetElement = jq(this);

    // Variable to hold the constructed API request URL
    var apiEndpoint;

    // Initialize the plugin's internal configuration storage
    weatherPlugin.settings = {};

    // Combine default and user-provided settings
    weatherPlugin.settings = jq.extend({}, standardOptions, configSettings);

    // Create a shorthand reference for plugin settings
    var currentConfig = weatherPlugin.settings;

    // Formulate the base API request URL
    apiEndpoint = 'http://api.openweathermap.org/data/2.5/weather?lang=' + currentConfig.languageCode;

    // Check if a city name was provided
    if (currentConfig.cityName != null) {

      // Append city name to the API URL, removing any spaces
      apiEndpoint += '&q=' + currentConfig.cityName.replace(' ', '');

    } else if (currentConfig.latitudeCoord != null && currentConfig.longitudeCoord != null) {

      // Append geographic coordinates (latitude and longitude) to the API URL
      apiEndpoint += '&lat=' + currentConfig.latitudeCoord + '&lon=' + currentConfig.longitudeCoord;
    }

    // Check if an API key is available
    if (currentConfig.apiKey != null) {

      // Add the API key parameter to the request URL
      apiEndpoint += '&APPID=' + currentConfig.apiKey;

    }

    // Helper function to convert Unix timestamps into a formatted time string
    var convertUnixToTime = function(timestampValue) {

      // Convert Unix timestamp (seconds) to milliseconds
      var milliSeconds = timestampValue * 1000;

      // Create a Date object from the milliseconds
      var dateTimeObj = new Date(milliSeconds);

      // Extract the hour component
      var currentHours = dateTimeObj.getHours();

      // Adjust hours for 12-hour format if greater than 12
      if (currentHours > 12) {

        // Calculate remaining hours in a 24-hour cycle
        var remainingHours = 24 - currentHours;

        // Convert to 12-hour format (e.g., 13 becomes 1)
        currentHours = 12 - remainingHours;
      }

      // Extract the minute component
      var currentMinutes = dateTimeObj.getMinutes();

      // Convert minutes to a string for padding
      var minuteString = currentMinutes.toString();

      // Pad minutes with a leading zero if less than 10
      if (minuteString.length < 2) {

        minuteString = '0' + minuteString;
      }

      // Construct the final time string (e.g., "9:05")
      var formattedTimeStr = currentHours + ':' + minuteString;

      return formattedTimeStr;
    };

    // Execute an asynchronous HTTP request to the OpenWeatherMap API
    jq.ajax({
      type: 'GET',
      url: apiEndpoint,
      dataType: 'jsonp', // Use JSONP for cross-domain requests
      success: function(apiResponse) {

        // Determine temperature display based on specified units
        if (currentConfig.tempUnits == 'f') {

          // Calculate and format current temperature in Fahrenheit
          var currentTemp = Math.round(((apiResponse.main.temp - 273.15) * 1.8) + 32) + '°F';

          // Calculate and format minimum temperature in Fahrenheit
          var minimumTemp = Math.round(((apiResponse.main.temp_min - 273.15) * 1.8) + 32) + '°F';

          // Calculate and format maximum temperature in Fahrenheit
          var maximumTemp = Math.round(((apiResponse.main.temp_max - 273.15) * 1.8) + 32) + '°F';

        } else { // Default to Celsius

          // Calculate and format current temperature in Celsius
          var currentTemp = Math.round(apiResponse.main.temp - 273.15) + '°C';

          // Calculate and format minimum temperature in Celsius
          var minimumTemp = Math.round(apiResponse.main.temp_min - 273.15) + '°C';

          // Calculate and format maximum temperature in Celsius
          var maximumTemp = Math.round(apiResponse.main.temp_max - 273.15) + '°C';

        }

        // Update the primary element with the current temperature
        targetElement.html(currentTemp);

        // If a target for minimum temperature exists, update it
        if (currentConfig.lowTempDisplay != null) {

          jq(currentConfig.lowTempDisplay).text(minimumTemp);
        }

        // If a target for maximum temperature exists, update it
        if (currentConfig.highTempDisplay != null) {

          jq(currentConfig.highTempDisplay).text(maximumTemp);
        }

        // Update the weather description display
        jq(currentConfig.conditionDisplay).text(apiResponse.weather[0].description);

        // Handle weather icon display if a target and icon data are present
        if (currentConfig.symbolDisplay != null && apiResponse.weather[0].icon != null) {

          // Check if custom icon paths are provided
          if (currentConfig.userDefinedIcons != null) {

            // Retrieve the default icon identifier from the API response
            var defaultIconId = apiResponse.weather[0].icon;

            var visualIconName;

            var dayPart;

            // Determine if it's day or night based on the icon ID
            if (defaultIconId.indexOf('d') !== -1) {

              dayPart = 'day'; // 'd' indicates daytime
            } else {

              dayPart = 'night'; // 'n' indicates nighttime
            }

            // Map OpenWeatherMap icon IDs to custom icon names
            if (defaultIconId == '01d' || defaultIconId == '01n') {
              visualIconName = 'clear'; // Clear sky
            }

            if (defaultIconId == '02d' || defaultIconId == '02n' || defaultIconId == '03d' || defaultIconId == '03n' || defaultIconId == '04d' || defaultIconId == '04n') {
              visualIconName = 'clouds'; // Clouds
            }

            if (defaultIconId == '09d' || defaultIconId == '09n' || defaultIconId == '10d' || defaultIconId == '10n') {
              visualIconName = 'rain'; // Rain
            }

            if (defaultIconId == '11d' || defaultIconId == '11n') {
              visualIconName = 'storm'; // Thunderstorm
            }

            if (defaultIconId == '13d' || defaultIconId == '13n') {
              visualIconName = 'snow'; // Snow
            }

            if (defaultIconId == '50d' || defaultIconId == '50n') {
              visualIconName = 'mist'; // Mist/Fog
            }

            // Construct the URL for the custom icon
            var iconSourceURL = currentConfig.userDefinedIcons + dayPart + '/' + visualIconName + '.png';

          } else {

            // Use the default OpenWeatherMap icon URL
            var iconSourceURL = 'http://openweathermap.org/img/w/' + apiResponse.weather[0].icon + '.png';

          }

          // Set the src attribute of the icon display element
          jq(currentConfig.symbolDisplay).attr('src', iconSourceURL);

        }

        // If a target for location name exists, update it
        if (currentConfig.locationDisplay != null) {

          jq(currentConfig.locationDisplay).text(apiResponse.name + ', ' + apiResponse.sys.country);
        }

        // If a target for wind speed exists, update it
        if (currentConfig.windVelocityDisplay != null) {

          jq(currentConfig.windVelocityDisplay).text(Math.round(apiResponse.wind.speed) + ' Mps');
        }

        // If a target for humidity exists, update it
        if (currentConfig.moistureDisplay != null) {

          jq(currentConfig.moistureDisplay).text(apiResponse.main.humidity + '%');
        }

        // If a target for sunrise time exists, update it
        if (currentConfig.dawnDisplay != null) {

          var dawnTime = convertUnixToTime(apiResponse.sys.sunrise);

          jq(currentConfig.dawnDisplay).text(dawnTime + ' AM');
        }

        // If a target for sunset time exists, update it
        if (currentConfig.duskDisplay != null) {

          var duskTime = convertUnixToTime(apiResponse.sys.sunset);

          jq(currentConfig.duskDisplay).text(duskTime + ' PM');
        }

        // Invoke the user-defined success callback
        currentConfig.onSuccess.call(this);

      }, // End of success callback

      error: function(xhrObject, statusMsg, errorDetails) {

        // Invoke the user-defined error callback
        currentConfig.onError.call(this, statusMsg);
      }

    }); // End of jq.ajax call

  }; // End of jq.fn.getWeatherData

})(jQuery);