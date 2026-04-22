/*
 * Open Weather Plugin for jQuery
 *
 * This plugin fetches weather data from the OpenWeatherMap API and displays it.
 *
 * Dependencies:
 *   - jQuery (version 1.x or higher)
 *   - OpenWeatherMap API key (required for most requests)
 *
 * Author: Michael Lynch
 * Author URL: http://michaelynch.com
 * Date Created: August 28, 2013
 * Last Modified: [Current Date - e.g., October 26, 2023]
 * Licensed under the MIT license
 *
 * This file contains the core logic for the Open Weather jQuery plugin.
 */


; (
    function( $ ) {

        // Define the jQuery plugin function for 'openWeather'
        $.fn.openWeather = function( options ) {

            // Early exit if no element is bound to prevent errors and allow chaining.
            if ( !this.length ) {
                return this; // Return the jQuery object for chaining
            }

            // --- Default Plugin Options ---
            // These settings can be overridden by passing an options object to the plugin.
            var defaults = {
                descriptionTarget: null,    // Selector for element to display weather description
                maxTemperatureTarget: null, // Selector for element to display max temperature
                minTemperatureTarget: null, // Selector for element to display min temperature
                windSpeedTarget: null,      // Selector for element to display wind speed
                humidityTarget: null,       // Selector for element to display humidity
                sunriseTarget: null,        // Selector for element to display sunrise time
                sunsetTarget: null,         // Selector for element to display sunset time
                placeTarget: null,          // Selector for element to display city and country
                iconTarget: null,           // Selector for img element to display weather icon
                customIcons: null,          // Base URL for custom weather icons (e.g., 'path/to/icons/')
                units: 'c',                 // Temperature units: 'c' for Celsius, 'f' for Fahrenheit
                city: null,                 // City name (e.g., 'London,uk')
                lat: null,                  // Latitude (e.g., 51.5)
                lng: null,                  // Longitude (e.g., -0.12)
                key: null,                  // OpenWeatherMap API key (mandatory for most calls)
                lang: 'en',                 // Language for weather description (e.g., 'en', 'es', 'fr')
                success: function() {},     // Callback function on successful API call
                error: function( message ) {} // Callback function on API call error
            };

            // --- Plugin Internal Variables ---

            // Reference to the plugin's context
            var plugin = this;

            // Reference to the jQuery element(s) the plugin is initialized on
            var el = $( this );

            // Variable to hold the OpenWeatherMap API URL
            var apiURL;

            // Initialize plugin settings object
            plugin.settings = {};

            // Merge default settings with user-provided options.
            // This creates the final configuration for the plugin instance.
            plugin.settings = $.extend( {}, defaults, options );

            // Shorthand for plugin settings for easier access within the plugin
            var s = plugin.settings;

            // --- API URL Construction ---

            // Base API endpoint for current weather data
            apiURL = 'http://api.openweathermap.org/data/2.5/weather?lang=' + s.lang;

            // Determine location based on provided city or coordinates.
            // If a city name is provided, use it.
            if ( s.city != null ) {

                // Append city query parameter to the API URL.
                // Spaces in city names are removed for cleaner URL.
                apiURL += '&q=' + s.city.replace( ' ', '' );

            }
            // If city is not provided, but latitude and longitude are, use them.
            else if ( s.lat != null && s.lng != null ) {

                // Append latitude and longitude parameters to the API URL.
                apiURL += '&lat=' + s.lat + '&lon=' + s.lng;
            }

            // If an API key is supplied in the settings, append it to the URL.
            // The API key is crucial for authenticating requests.
            if ( s.key != null ) {

                apiURL += '&APPID=' + s.key; // Append the API key parameter
            }

            // --- Utility Function: formatTime ---
            // Converts a Unix timestamp into a formatted time string (HH:MM).
            var formatTime = function( unixTimestamp ) {

                // Convert Unix timestamp (seconds) to milliseconds for JavaScript Date object.
                var milliseconds = unixTimestamp * 1000;

                // Create a new Date object from the milliseconds.
                var date = new Date( milliseconds );

                // Extract hours from the Date object.
                var hours = date.getHours();

                // Convert to 12-hour format if greater than 12.
                if ( hours > 12 ) {

                    // Calculate remaining hours in a 24-hour cycle.
                    hoursRemaining = 24 - hours;

                    // Adjust hours for 12-hour format (e.g., 13 -> 1, 14 -> 2).
                    hours = 12 - hoursRemaining;
                }

                // Extract minutes from the Date object.
                var minutes = date.getMinutes();

                // Convert minutes to a string for length checking.
                minutes = minutes.toString();

                // Prepend a '0' if minutes is a single digit (e.g., 5 -> "05").
                if ( minutes.length < 2 ) {

                    minutes = 0 + minutes;
                }

                // Construct the final time string.
                var time = hours + ':' + minutes;

                return time; // Return the formatted time.
            };

            // --- AJAX Request to OpenWeatherMap API ---
            // This makes the actual call to fetch weather data.
            $.ajax( {
                type: 'GET',        // HTTP method
                url: apiURL,        // Constructed API URL
                dataType: 'jsonp',  // Use JSONP for cross-domain requests
                success: function( data ) {

                    // --- Temperature Calculations and Display ---

                    var temperature;    // Current temperature
                    var minTemperature; // Minimum temperature
                    var maxTemperature; // Maximum temperature

                    // Check if units are set to Fahrenheit.
                    if ( s.units == 'f' ) {

                        // Convert Kelvin to Fahrenheit: ((K - 273.15) * 1.8) + 32
                        temperature = Math.round( ( ( data.main.temp - 273.15 ) * 1.8 ) + 32 ) + '°F';
                        minTemperature = Math.round( ( ( data.main.temp_min - 273.15 ) * 1.8 ) + 32 ) + '°F';
                        maxTemperature = Math.round( ( ( data.main.temp_max - 273.15 ) * 1.8 ) + 32 ) + '°F';

                    }
                    // Default to Celsius if units are not Fahrenheit.
                    else {

                        // Convert Kelvin to Celsius: K - 273.15
                        temperature = Math.round( data.main.temp - 273.15 ) + '°C';
                        minTemperature = Math.round( data.main.temp_min - 273.15 ) + '°C';
                        maxTemperature = Math.round( data.main.temp_max - 273.15 ) + '°C';
                    }

                    // Set the main element's HTML with the current temperature.
                    el.html( temperature );

                    // If a target for minimum temperature is specified, update its text.
                    if ( s.minTemperatureTarget != null ) {

                        $( s.minTemperatureTarget ).text( minTemperature );
                    }

                    // If a target for maximum temperature is specified, update its text.
                    if ( s.maxTemperatureTarget != null ) {

                        $( s.maxTemperatureTarget ).text( maxTemperature );
                    }

                    // --- Weather Description Display ---

                    // Set the weather description in its target element.
                    $( s.descriptionTarget ).text( data.weather[0].description );

                    // --- Weather Icon Display ---

                    // Check if an icon target and a default icon are available.
                    if ( s.iconTarget != null && data.weather[0].icon != null ) {

                        var iconURL; // Variable to hold the final icon URL.

                        // If custom icons are configured, map OpenWeatherMap icons to custom ones.
                        if ( s.customIcons != null ) {

                            var defaultIconFileName = data.weather[0].icon; // e.g., "01d", "02n"
                            var iconName;                                   // Mapped custom icon name
                            var timeOfDay;                                  // "day" or "night"

                            // Determine if it's day or night based on the icon name suffix ('d' or 'n').
                            if ( defaultIconFileName.indexOf( 'd' ) != -1 ) {

                                timeOfDay = 'day'; // Icon indicates daytime
                            } else {

                                timeOfDay = 'night'; // Icon indicates nighttime
                            }

                            // Map OpenWeatherMap icon codes to custom icon names.
                            if ( defaultIconFileName == '01d' || defaultIconFileName == '01n' ) {
                                iconName = 'clear'; // Clear sky
                            }

                            if ( defaultIconFileName == '02d' || defaultIconFileName == '02n' ||
                                defaultIconFileName == '03d' || defaultIconFileName == '03n' ||
                                defaultIconFileName == '04d' || defaultIconFileName == '04n' ) {
                                iconName = 'clouds'; // Clouds (scattered, broken, overcast)
                            }

                            if ( defaultIconFileName == '09d' || defaultIconFileName == '09n' ||
                                defaultIconFileName == '10d' || defaultIconFileName == '10n' ) {
                                iconName = 'rain'; // Rain (shower rain, rain)
                            }

                            if ( defaultIconFileName == '11d' || defaultIconFileName == '11n' ) {
                                iconName = 'storm'; // Thunderstorm
                            }

                            if ( defaultIconFileName == '13d' || defaultIconFileName == '13n' ) {
                                iconName = 'snow'; // Snow
                            }

                            if ( defaultIconFileName == '50d' || defaultIconFileName == '50n' ) {
                                iconName = 'mist'; // Mist/Fog
                            }

                            // Construct the custom icon URL.
                            iconURL = s.customIcons + timeOfDay + '/' + iconName + '.png';

                        }
                        // If no custom icons are specified, use the default OpenWeatherMap icons.
                        else {

                            iconURL = 'http://openweathermap.org/img/w/' + data.weather[0].icon + '.png';
                        }

                        // Set the 'src' attribute of the icon target element.
                        $( s.iconTarget ).attr( 'src', iconURL );
                    }

                    // --- Place (City, Country) Display ---

                    // If a target for place is specified, update its text.
                    if ( s.placeTarget != null ) {

                        $( s.placeTarget ).text( data.name + ', ' + data.sys.country );
                    }

                    // --- Wind Speed Display ---

                    // If a target for wind speed is specified, update its text.
                    if ( s.windSpeedTarget != null ) {

                        // Display wind speed in meters per second (Mps).
                        $( s.windSpeedTarget ).text( Math.round( data.wind.speed ) + ' Mps' );
                    }

                    // --- Humidity Display ---

                    // If a target for humidity is specified, update its text.
                    if ( s.humidityTarget != null ) {

                        // Display humidity as a percentage.
                        $( s.humidityTarget ).text( data.main.humidity + '%' );
                    }

                    // --- Sunrise Time Display ---

                    // If a target for sunrise time is specified, update its text.
                    if ( s.sunriseTarget != null ) {

                        var sunrise = formatTime( data.sys.sunrise ); // Format Unix timestamp
                        $( s.sunriseTarget ).text( sunrise + ' AM' ); // Display with AM suffix
                    }

                    // --- Sunset Time Display ---

                    // If a target for sunset time is specified, update its text.
                    if ( s.sunsetTarget != null ) {

                        var sunset = formatTime( data.sys.sunset ); // Format Unix timestamp
                        $( s.sunsetTarget ).text( sunset + ' PM' ); // Display with PM suffix
                    }

                    // --- Success Callback ---

                    // Execute the user-defined success callback function.
                    s.success.call( this );

                }, // End of success callback

                // --- Error Callback ---
                // This function is executed if the AJAX request fails.
                error: function( jqXHR, textStatus, errorThrown ) {

                    // Execute the user-defined error callback function, passing the error status.
                    s.error.call( this, textStatus );
                }

            } ); // End of $.ajax call

        }; // End of $.fn.openWeather plugin definition

    }
)( jQuery ); // End of Immediately Invoked Function Expression (IIFE)