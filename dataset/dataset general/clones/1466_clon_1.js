/*
 *   Chartkick.js - A JavaScript library for creating beautiful charts.
 *   This file is part of the Chartkick project.
 *   Repository: https://github.com/ankane/chartkick.js
 *   Version: 1.0.2
 *   License: MIT
 *   (c) 2013-2014 Andrew Kane
 */

/*
 *   JSLint directives for code quality and style.
 *   browser: true - Assumes a browser environment.
 *   indent: 2 - Enforces 2-space indentation. (I will change this for cloning purposes)
 *   plusplus: true - Allows the use of ++ and -- operators.
 *   global: google, $ - Declares global variables that are defined outside this file.
 */

( function () {

    'use strict'; /* Enforce strict mode for cleaner code and fewer errors. */


    /*
     *   ====================================================================
     *   Helper Functions Section
     *   These are general utility functions used throughout the Chartkick library.
     *   They provide basic checks and object manipulation capabilities.
     *   ====================================================================
     */


    /**
     *   Checks if the given variable is an array.
     *
     *   @param {any} variable - The variable to check.
     *   @returns {boolean} True if the variable is an array, false otherwise.
     */
    function isArray ( variable ) {

        return Object.prototype.toString.call(variable) === "[object Array]";

    }


    /**
     *   Checks if the given variable is a plain JavaScript object (i.e., not null,
     *   not an array, and not a DOM element, etc.).
     *
     *   @param {any} variable - The variable to check.
     *   @returns {boolean} True if the variable is a plain object, false otherwise.
     */
    function isPlainObject ( variable ) {

        return variable instanceof Object;

    }


    /**
     *   Extends a target object with properties from a source object.
     *   This function performs a deep merge for plain objects and arrays.
     *   Inspired by Zepto.js's extend function:
     *   https://github.com/madrobby/zepto/blob/master/src/zepto.js
     *
     *   @param {object} target - The object to extend.
     *   @param {object} source - The object providing properties to extend with.
     */
    function extend ( target, source ) {

        var key; // Declare loop variable.

        for ( key in source ) {
            // Iterate over all enumerable properties of the source object.

            if ( isPlainObject( source[key] ) || isArray( source[key] ) ) {
                // If the property is an object or an array, perform a deep merge.

                if ( isPlainObject( source[key] ) && !isPlainObject( target[key] ) ) {
                    // If source property is an object but target is not, initialize target property as empty object.
                    target[key] = {};
                }

                if ( isArray( source[key] ) && !isArray( target[key] ) ) {
                    // If source property is an array but target is not, initialize target property as empty array.
                    target[key] = [];
                }

                // Recursively extend the nested object/array.
                extend( target[key], source[key] );

            } else if ( source[key] !== undefined ) {
                // If the property is not an object/array and is defined, copy it directly.
                target[key] = source[key];
            }
        }

    }


    /**
     *   Merges two objects into a new object.
     *   Properties from obj2 will overwrite properties from obj1 in case of conflict.
     *
     *   @param {object} obj1 - The first object.
     *   @param {object} obj2 - The second object.
     *   @returns {object} A new object containing merged properties.
     */
    function merge ( obj1, obj2 ) {

        var target = {}; // Initialize an empty object to store the merged result.

        extend( target, obj1 ); // Extend with properties from the first object.
        extend( target, obj2 ); // Extend with properties from the second object, overwriting if necessary.

        return target; // Return the merged object.

    }


    /*
     *   ====================================================================
     *   ISO 8601 Date Parsing Function
     *   This section provides a utility to parse ISO 8601 formatted date strings.
     *   Adapted from https://github.com/Do/iso8601.js
     *   ====================================================================
     */

    // Regular expression pattern for ISO 8601 date strings.
    var ISO8601_PATTERN = /(\d\d\d\d)(\-)?(\d\d)(\-)?(\d\d)(T)?(\d\d)(:)?(\d\d)?(:)?(\d\d)?([\.,]\d+)?($|Z|([\+\-])(\d\d)(:)?(\d\d)?)/i;

    // Determine the decimal separator used in the current locale (e.g., '.' or ',').
    var DECIMAL_SEPARATOR = String(1.5).charAt(1);


    /**
     *   Parses an ISO 8601 formatted string or returns a Date object if already one.
     *
     *   @param {string|Date} input - The string or Date object to parse.
     *   @returns {Date|undefined} A Date object if parsing is successful, or undefined.
     */
    function parseISO8601 ( input ) {

        var day, hour, matches, milliseconds, minutes, month, offset, result, seconds, type, year;

        type = Object.prototype.toString.call( input ); // Get the internal [[Class]] of the input.

        if ( type === '[object Date]' ) {
            // If it's already a Date object, return it directly.
            return input;
        }

        if ( type !== '[object String]' ) {
            // If it's not a string, we cannot parse it; return undefined.
            return;
        }

        // Attempt to match the input string against the ISO 8601 pattern.
        if ( ( matches = input.match(ISO8601_PATTERN) ) ) {

            year = parseInt( matches[1], 10 ); // Extract year.
            month = parseInt( matches[3], 10 ) - 1; // Extract month (0-indexed).
            day = parseInt( matches[5], 10 ); // Extract day.
            hour = parseInt( matches[7], 10 ); // Extract hour.
            minutes = matches[9] ? parseInt( matches[9], 10 ) : 0; // Extract minutes, default to 0.
            seconds = matches[11] ? parseInt( matches[11], 10 ) : 0; // Extract seconds, default to 0.
            milliseconds = matches[12] ? parseFloat( DECIMAL_SEPARATOR + matches[12].slice(1) ) * 1000 : 0; // Extract milliseconds.

            // Create a UTC date from the extracted components.
            result = Date.UTC( year, month, day, hour, minutes, seconds, milliseconds );

            if ( matches[13] && matches[14] ) {
                // If a timezone offset is present.
                offset = matches[15] * 60; // Convert hours to minutes.

                if ( matches[17] ) {
                    offset += parseInt( matches[17], 10 ); // Add minute component of offset.
                }

                offset *= matches[14] === '-' ? -1 : 1; // Apply sign of the offset.

                result -= offset * 60 * 1000; // Adjust the UTC timestamp by the timezone offset.
            }

            return new Date( result ); // Return the new Date object.

        }

    } // End of parseISO8601 function.

    // end iso8601.js


    /**
     *   Checks if any data point in the provided series has negative Y values.
     *   This is typically used to determine default chart axis minimums.
     *
     *   @param {Array<Object>} series - An array of series data, where each series has a 'data' array.
     *   @returns {boolean} True if any value is negative, false otherwise.
     */
    function negativeValues ( series ) {

        var i, j, data; // Loop counters and data reference.

        for ( i = 0; i < series.length; i++ ) {
            // Iterate through each series.
            data = series[i].data; // Get the data points for the current series.

            for ( j = 0; j < data.length; j++ ) {
                // Iterate through each data point.
                if ( data[j][1] < 0 ) {
                    // If the Y-value (second element) is negative.
                    return true; // Immediately return true.
                }
            }
        }

        return false; // No negative values found.

    }


    /**
     *   A factory function to create a JS options processing function for chart libraries.
     *   It handles common chart options like legend visibility, min/max values, and library-specific overrides.
     *
     *   @param {object} defaultOptions - The base default options for the chart library.
     *   @param {Function} hideLegend - A function to hide the legend in the options.
     *   @param {Function} setMin - A function to set the minimum value for the y-axis.
     *   @param {Function} setMax - A function to set the maximum value for the y-axis.
     *   @returns {Function} A function that takes series data and user options, and returns merged chart options.
     */
    function jsOptionsFunc ( defaultOptions, hideLegend, setMin, setMax ) {

        return function ( series, opts ) {

            var options = merge( {}, defaultOptions ); // Start with a fresh copy of default options.

            // Handle legend visibility based on 'hideLegend' option.
            // Note: This is an internal option, not directly exposed to end-users in all contexts.
            if ( opts.hideLegend ) {
                hideLegend( options ); // Call the library-specific function to hide the legend.
            }

            // Handle minimum value for the y-axis.
            if ( "min" in opts ) {
                setMin( options, opts.min ); // Use user-defined minimum.
            } else if ( !negativeValues( series ) ) {
                setMin( options, 0 ); // Default to 0 if no negative values and no min specified.
            }

            // Handle maximum value for the y-axis.
            if ( "max" in opts ) {
                setMax( options, opts.max ); // Use user-defined maximum.
            }

            // Merge library-specific options last, allowing them to override previous settings.
            options = merge( options, opts.library || {} );

            return options; // Return the final, processed options object.

        };

    }


    /*
     *   ====================================================================
     *   Chart Rendering Functions
     *   These variables will hold references to the actual rendering functions
     *   depending on which charting library is detected (Highcharts or Google Charts).
     *   ====================================================================
     */

    var renderLineChart, renderPieChart, renderColumnChart; // Declare render functions.


    // Check if Highcharts library is available in the global scope.
    if ( "Highcharts" in window ) {

        /*
         *   ====================================================================
         *   Highcharts Specific Implementation
         *   This block contains the logic for rendering charts using Highcharts.
         *   It defines default options and specific rendering functions.
         *   ====================================================================
         */

        var defaultOptions = {
            // Default options for Highcharts charts.
            xAxis: {
                labels: {
                    style: {
                        fontSize: "12px"
                    }
                }
            },
            yAxis: {
                title: {
                    text: null // No default Y-axis title.
                },
                labels: {
                    style: {
                        fontSize: "12px"
                    }
                }
            },
            title: {
                text: null // No default chart title.
            },
            credits: {
                enabled: false // Disable Highcharts credits watermark.
            },
            legend: {
                borderWidth: 0 // No border for the legend.
            },
            tooltip: {
                style: {
                    fontSize: "12px"
                }
            }
        };


        /**
         *   Highcharts specific function to hide the legend.
         *   @param {object} options - The Highcharts options object.
         */
        var hideLegend = function ( options ) {
            options.legend.enabled = false;
        };


        /**
         *   Highcharts specific function to set the minimum value for the y-axis.
         *   @param {object} options - The Highcharts options object.
         *   @param {number} min - The minimum value.
         */
        var setMin = function ( options, min ) {
            options.yAxis.min = min;
        };


        /**
         *   Highcharts specific function to set the maximum value for the y-axis.
         *   @param {object} options - The Highcharts options object.
         *   @param {number} max - The maximum value.
         */
        var setMax = function ( options, max ) {
            options.yAxis.max = max;
        };


        // Create the Highcharts-specific options processing function.
        var jsOptions = jsOptionsFunc( defaultOptions, hideLegend, setMin, setMax );


        /**
         *   Renders a line chart using Highcharts.
         *
         *   @param {HTMLElement} element - The DOM element to render the chart into.
         *   @param {Array} series - The data series for the chart.
         *   @param {object} opts - User-provided options.
         */
        renderLineChart = function ( element, series, opts ) {

            var options = jsOptions( series, opts ),
                data,
                i,
                j; // Declare variables for options, data, and loop counters.

            options.xAxis.type = "datetime"; // Set X-axis type to datetime for line charts.
            options.chart = {
                type: "spline",
                renderTo: element.id // Specify the target DOM element by its ID.
            };

            // Process series data: convert dates to timestamps and add marker styles.
            for ( i = 0; i < series.length; i++ ) {
                data = series[i].data;
                for ( j = 0; j < data.length; j++ ) {
                    data[j][0] = data[j][0].getTime(); // Convert date objects to milliseconds.
                }
                series[i].marker = {
                    symbol: "circle"
                }; // Add circle markers to data points.
            }

            options.series = series; // Assign the processed series data to chart options.

            new Highcharts.Chart( options ); // Create and render the Highcharts chart.

        };


        /**
         *   Renders a pie chart using Highcharts.
         *
         *   @param {HTMLElement} element - The DOM element to render the chart into.
         *   @param {Array} series - The data series for the chart.
         *   @param {object} opts - User-provided options.
         */
        renderPieChart = function ( element, series, opts ) {

            // Merge default options with library-specific overrides.
            var options = merge( defaultOptions, opts.library || {} );

            options.chart = {
                renderTo: element.id
            }; // Specify the target DOM element by its ID.

            options.series = [ {
                type: "pie", // Set chart type to pie.
                name: "Value", // Default name for pie slice values.
                data: series // Assign the series data directly for pie charts.
            } ];

            new Highcharts.Chart( options ); // Create and render the Highcharts pie chart.

        };


        /**
         *   Renders a column chart using Highcharts.
         *
         *   @param {HTMLElement} element - The DOM element to render the chart into.
         *   @param {Array} series - The data series for the chart.
         *   @param {object} opts - User-provided options.
         */
        renderColumnChart = function ( element, series, opts ) {

            var options = jsOptions( series, opts ),
                i,
                j,
                s,
                d,
                rows = []; // Declare variables for options, loop counters, series/data points, and temporary rows array.

            options.chart = {
                type: "column",
                renderTo: element.id
            }; // Set chart type to column and target element.

            // Reorganize data into 'rows' format suitable for Highcharts column categories.
            for ( i = 0; i < series.length; i++ ) {
                s = series[i]; // Current series.

                for ( j = 0; j < s.data.length; j++ ) {
                    d = s.data[j]; // Current data point [category, value].
                    if ( !rows[d[0]] ) {
                        // If this category hasn't been seen, initialize an array for it.
                        rows[d[0]] = new Array( series.length );
                    }
                    rows[d[0]][i] = d[1]; // Assign value to the correct series slot for this category.
                }
            }

            var categories = []; // Array to hold unique categories.
            for ( i in rows ) {
                if ( rows.hasOwnProperty(i) ) {
                    categories.push( i ); // Collect all unique categories.
                }
            }
            options.xAxis.categories = categories; // Assign categories to the X-axis.

            var newSeries = []; // Array to hold Highcharts-formatted series data.
            for ( i = 0; i < series.length; i++ ) {
                d = []; // Initialize data array for the current series.
                for ( j = 0; j < categories.length; j++ ) {
                    d.push( rows[categories[j]][i] ); // Populate data for the current series based on categories.
                }

                newSeries.push( {
                    name: series[i].name, // Keep original series name.
                    data: d // Assign processed data.
                } );
            }
            options.series = newSeries; // Assign the new series data to chart options.

            new Highcharts.Chart( options ); // Create and render the Highcharts column chart.

        };


    } else if ( "google" in window ) { // Check if Google Charts library is available.

        /*
         *   ====================================================================
         *   Google Charts Specific Implementation
         *   This block contains the logic for rendering charts using Google Charts.
         *   It handles loading the library, defining default options, and specific
         *   rendering functions.
         *   ====================================================================
         */

        // Flag to track if Google Charts packages have been loaded.
        var loaded = false;

        // Set a callback to update the 'loaded' flag once Google Charts is ready.
        google.setOnLoadCallback( function () {
            loaded = true;
        } );

        // Load the corechart package for Google Visualization API.
        google.load( "visualization", "1.0", {
            "packages": ["corechart"]
        } );


        /**
         *   Ensures a callback is executed after Google Charts has finished loading.
         *   It calls the callback immediately if already loaded, otherwise defers it.
         *
         *   @param {Function} callback - The function to execute after loading.
         */
        var waitForLoaded = function ( callback ) {
            // Always set a new callback to handle potential race conditions,
            // though this might cause the callback to fire multiple times if not handled carefully.
            google.setOnLoadCallback( callback );
            if ( loaded ) {
                // If already loaded, execute callback immediately.
                callback();
            }
        };


        // Default options for Google Charts visualizations.
        var defaultOptions = {
            fontName: "'Lucida Grande', 'Lucida Sans Unicode', Verdana, Arial, Helvetica, sans-serif", // Consistent font.
            pointSize: 6, // Size of data points.
            legend: {
                textStyle: {
                    fontSize: 12,
                    color: "#444"
                },
                alignment: "center",
                position: "right"
            },
            curveType: "function", // Smooth curves for line charts.
            hAxis: { // Horizontal axis options.
                textStyle: {
                    color: "#666",
                    fontSize: 12
                },
                gridlines: {
                    color: "transparent"
                }, // Hide gridlines.
                baselineColor: "#ccc" // Color of the axis line.
            },
            vAxis: { // Vertical axis options.
                textStyle: {
                    color: "#666",
                    fontSize: 12
                },
                baselineColor: "#ccc",
                viewWindow: {} // Placeholder for min/max view window settings.
            },
            tooltip: {
                textStyle: {
                    color: "#666",
                    fontSize: 12
                }
            }
        };


        /**
         *   Google Charts specific function to hide the legend.
         *   @param {object} options - The Google Charts options object.
         */
        var hideLegend = function ( options ) {
            options.legend.position = "none";
        };


        /**
         *   Google Charts specific function to set the minimum value for the y-axis.
         *   @param {object} options - The Google Charts options object.
         *   @param {number} min - The minimum value.
         */
        var setMin = function ( options, min ) {
            options.vAxis.viewWindow.min = min;
        };


        /**
         *   Google Charts specific function to set the maximum value for the y-axis.
         *   @param {object} options - The Google Charts options object.
         *   @param {number} max - The maximum value.
         */
        var setMax = function ( options, max ) {
            options.vAxis.viewWindow.max = max;
        };


        // Create the Google Charts-specific options processing function.
        var jsOptions = jsOptionsFunc( defaultOptions, hideLegend, setMin, setMax );


        /**
         *   Creates a Google Visualization DataTable from series data.
         *   This function transforms the input series into a format Google Charts expects.
         *
         *   @param {Array<Object>} series - The raw series data.
         *   @param {string} columnType - The type for the first column (e.g., "datetime", "string").
         *   @returns {google.visualization.DataTable} The prepared DataTable.
         */
        var createDataTable = function ( series, columnType ) {

            var data = new google.visualization.DataTable(); // Initialize a new DataTable.
            data.addColumn( columnType, "" ); // Add the first column for categories/time.

            var i, j, s, d, key, rows = []; // Loop counters, series/data points, key, and temporary rows array.

            for ( i = 0; i < series.length; i++ ) {
                s = series[i]; // Current series.
                data.addColumn( "number", s.name ); // Add a number column for each series.

                for ( j = 0; j < s.data.length; j++ ) {
                    d = s.data[j]; // Current data point [category/time, value].
                    key = ( columnType === "datetime" ) ? d[0].getTime() : d[0]; // Get key (timestamp or raw value).

                    if ( !rows[key] ) {
                        rows[key] = new Array( series.length ); // Initialize row for new key.
                    }
                    rows[key][i] = toFloat( d[1] ); // Assign value to correct series slot.
                }
            }

            var rows2 = []; // Final array for rows to be added to DataTable.
            for ( i in rows ) {
                if ( rows.hasOwnProperty(i) ) {
                    // Convert key back to Date object if datetime, then concatenate series values.
                    rows2.push( [ ( columnType === "datetime" ) ? new Date( toFloat(i) ) : i ].concat( rows[i] ) );
                }
            }

            if ( columnType === "datetime" ) {
                rows2.sort( sortByTime ); // Sort by time if it's a datetime chart.
            }

            data.addRows( rows2 ); // Add all processed rows to the DataTable.

            return data; // Return the populated DataTable.

        };


        /**
         *   Renders a line chart using Google Charts.
         *
         *   @param {HTMLElement} element - The DOM element to render the chart into.
         *   @param {Array} series - The data series for the chart.
         *   @param {object} opts - User-provided options.
         */
        renderLineChart = function ( element, series, opts ) {

            waitForLoaded( function () {
                var options = jsOptions( series, opts ); // Process chart options.
                var data = createDataTable( series, "datetime" ); // Create DataTable with datetime axis.
                var chart = new google.visualization.LineChart( element ); // Instantiate LineChart.
                chart.draw( data, options ); // Draw the chart.
            } );

        };


        /**
         *   Renders a pie chart using Google Charts.
         *
         *   @param {HTMLElement} element - The DOM element to render the chart into.
         *   @param {Array} series - The data series for the chart.
         *   @param {object} opts - User-provided options.
         */
        renderPieChart = function ( element, series, opts ) {

            waitForLoaded( function () {
                var options = merge( defaultOptions, opts.library || {} ); // Merge options.
                options.chartArea = {
                    top: "10%",
                    height: "80%"
                }; // Adjust chart area for pie charts.

                var data = new google.visualization.DataTable(); // New DataTable for pie chart.
                data.addColumn( "string", "" ); // Column for slice labels.
                data.addColumn( "number", "Value" ); // Column for slice values.
                data.addRows( series ); // Add series data (expects [label, value] pairs).

                var chart = new google.visualization.PieChart( element ); // Instantiate PieChart.
                chart.draw( data, options ); // Draw the chart.
            } );

        };


        /**
         *   Renders a column chart using Google Charts.
         *
         *   @param {HTMLElement} element - The DOM element to render the chart into.
         *   @param {Array} series - The data series for the chart.
         *   @param {object} opts - User-provided options.
         */
        renderColumnChart = function ( element, series, opts ) {

            waitForLoaded( function () {
                var options = jsOptions( series, opts ); // Process chart options.
                var data = createDataTable( series, "string" ); // Create DataTable with string axis.
                var chart = new google.visualization.ColumnChart( element ); // Instantiate ColumnChart.
                chart.draw( data, options ); // Draw the chart.
            } );

        };


    } else { // If neither Highcharts nor Google Charts is found.

        /*
         *   ====================================================================
         *   Fallback for Missing Chart Libraries
         *   This block provides a default behavior when no supported charting
         *   library is detected in the global scope.
         *   ====================================================================
         */

        // Assign a function that throws an error for all render methods.
        renderLineChart = renderPieChart = renderColumnChart = function () {
            throw new Error( "Please install Google Charts or Highcharts" );
        };

    }


    /*
     *   ====================================================================
     *   DOM Manipulation and Error Handling Utilities
     *   These functions assist with updating the DOM and managing errors
     *   during chart rendering and data fetching.
     *   ====================================================================
     */


    /**
     *   Sets the text content of a given DOM element, handling cross-browser differences.
     *
     *   @param {HTMLElement} element - The DOM element to update.
     *   @param {string} text - The text content to set.
     */
    function setText ( element, text ) {

        if ( document.body.innerText ) {
            // Use innerText for browsers that support it.
            element.innerText = text;
        } else {
            // Fallback to textContent for other browsers.
            element.textContent = text;
        }

    }


    /**
     *   Displays an error message within a chart's DOM element.
     *
     *   @param {HTMLElement} element - The DOM element where the chart would be.
     *   @param {string} message - The error message to display.
     */
    function chartError ( element, message ) {

        setText( element, "Error Loading Chart: " + message ); // Set error text.
        element.style.color = "#ff0000"; // Set text color to red.

    }


    /**
     *   Fetches JSON data from a given URL using jQuery's AJAX function.
     *   Handles success and error cases, displaying errors in the chart element.
     *
     *   @param {HTMLElement} element - The DOM element associated with the chart.
     *   @param {string} url - The URL to fetch JSON data from.
     *   @param {Function} success - Callback function for successful data retrieval.
     */
    function getJSON ( element, url, success ) {

        $.ajax( {
            dataType: "json", // Expect JSON data.
            url: url, // The URL to request.
            success: success, // Callback on success.
            error: function ( jqXHR, textStatus, errorThrown ) {
                // Error handler for AJAX requests.
                var message = ( typeof errorThrown === "string" ) ? errorThrown : errorThrown.message;
                chartError( element, message ); // Display the error message in the chart element.
            }
        } );

    }


    /**
     *   Catches errors that occur during a callback execution and displays them.
     *   This prevents uncaught exceptions from breaking the entire application.
     *
     *   @param {HTMLElement} element - The DOM element associated with the chart.
     *   @param {any} data - Data passed to the callback.
     *   @param {object} opts - Options passed to the callback.
     *   @param {Function} callback - The function whose execution needs error catching.
     */
    function errorCatcher ( element, data, opts, callback ) {

        try {
            callback( element, data, opts ); // Attempt to execute the callback.
        } catch ( err ) {
            chartError( element, err.message ); // Display any error message.
            throw err; // Re-throw the error to maintain stack trace and allow further debugging.
        }

    }


    /**
     *   Fetches data for a chart, either from a URL (string) or directly from provided data.
     *   It wraps the data processing in an error catcher.
     *
     *   @param {HTMLElement} element - The DOM element associated with the chart.
     *   @param {string|Array|Object} dataSource - The data source (URL or actual data).
     *   @param {object} opts - Chart options.
     *   @param {Function} callback - The function to call with the fetched/processed data.
     */
    function fetchDataSource ( element, dataSource, opts, callback ) {

        if ( typeof dataSource === "string" ) {
            // If dataSource is a string, assume it's a URL and fetch JSON.
            getJSON( element, dataSource, function ( data, textStatus, jqXHR ) {
                errorCatcher( element, data, opts, callback ); // Process fetched data with error catching.
            } );
        } else {
            // Otherwise, assume dataSource is directly the data.
            errorCatcher( element, dataSource, opts, callback ); // Process data directly with error catching.
        }

    }


    /*
     *   ====================================================================
     *   Type Conversion Functions
     *   These utilities convert various data types to a consistent format
     *   expected by the charting libraries.
     *   ====================================================================
     */


    /**
     *   Converts a given value to a string.
     *   @param {any} n - The value to convert.
     *   @returns {string} The string representation of the value.
     */
    function toStr ( n ) {
        return "" + n;
    }


    /**
     *   Converts a given value to a floating-point number.
     *   @param {any} n - The value to convert.
     *   @returns {number} The floating-point number.
     */
    function toFloat ( n ) {
        return parseFloat( n );
    }


    /**
     *   Converts a given value to a Date object. Handles numbers (timestamps),
     *   strings (ISO 8601 or general date strings), and existing Date objects.
     *
     *   @param {any} n - The value to convert to a Date.
     *   @returns {Date} The converted Date object.
     */
    function toDate ( n ) {

        if ( typeof n !== "object" ) {
            // If it's not already an object (like a Date).
            if ( typeof n === "number" ) {
                n = new Date( n * 1000 ); // Assume number is a Unix timestamp (seconds), convert to milliseconds.
            } else { // If it's a string.
                // Attempt to make the string more ISO 8601 compliant for parsing.
                // This is a best-effort attempt; more robust parsing might be needed for varied formats.
                var str = n.replace( / /, "T" ).replace( " ", "" ).replace( "UTC", "Z" );
                n = parseISO8601( str ) || new Date( n ); // Try ISO 8601 first, then fallback to native Date parsing.
            }
        }
        return n; // Return the Date object.

    }


    /**
     *   Converts a value to an array. If the input is an object, it converts
     *   its enumerable properties into an array of [key, value] pairs.
     *
     *   @param {any} n - The value to convert to an array.
     *   @returns {Array} The converted array.
     */
    function toArr ( n ) {

        if ( !isArray( n ) ) {
            // If it's not already an array.
            var arr = [],
                i; // Initialize an empty array and loop variable.
            for ( i in n ) {
                // Iterate over properties of the object.
                if ( n.hasOwnProperty(i) ) {
                    arr.push( [i, n[i]] ); // Add [key, value] pair to the array.
                }
            }
            n = arr; // Replace the original value with the new array.
        }
        return n; // Return the array.

    }


    /*
     *   ====================================================================
     *   Data Processing Functions
     *   These functions prepare and transform the raw chart data into a format
     *   that can be consumed by the charting libraries.
     *   ====================================================================
     */


    /**
     *   Comparison function for sorting arrays of data points by their time (first element).
     *   @param {Array} a - The first data point [time, value].
     *   @param {Array} b - The second data point [time, value].
     *   @returns {number} A negative, zero, or positive value indicating sort order.
     */
    function sortByTime ( a, b ) {

        return a[0].getTime() - b[0].getTime();

    }


    /**
     *   Processes the input series data, ensuring it's in a consistent format
     *   (an array of series objects) and converting data types as needed.
     *
     *   @param {Array|Object} series - The raw series data. Can be a single series or multiple.
     *   @param {object} opts - Chart options.
     *   @param {boolean} time - Flag indicating if the x-axis represents time.
     *   @returns {Array<Object>} The processed series data.
     */
    function processSeries ( series, opts, time ) {

        var i, j, data, r, key; // Loop counters and temporary variables.

        // Determine if the input represents a single series or multiple series.
        if ( !isArray( series ) || typeof series[0] !== "object" || isArray( series[0] ) ) {
            // If it's not an array of objects (e.g., a single array of data points or a single object).
            series = [ {
                name: "Value",
                data: series
            } ]; // Wrap it as a single series with a default name.
            opts.hideLegend = true; // Hide legend for single series.
        } else {
            opts.hideLegend = false; // Show legend for multiple series.
        }

        // Iterate through each series to ensure data is in the correct format and types.
        for ( i = 0; i < series.length; i++ ) {
            data = toArr( series[i].data ); // Ensure data is an array of [key, value] pairs.
            r = []; // Initialize a new array for processed data points.

            for ( j = 0; j < data.length; j++ ) {
                key = data[j][0]; // Get the key (x-value).
                key = time ? toDate( key ) : toStr( key ); // Convert key to Date if time, otherwise to String.
                r.push( [key, toFloat( data[j][1] )] ); // Convert value to Float and add to new array.
            }

            if ( time ) {
                // If it's a time-based chart, sort the data points by time.
                r.sort( sortByTime );
            }
            series[i].data = r; // Update the series with the processed data.
        }

        return series; // Return the processed series data.
    }


    /*
     *   ====================================================================
     *   Public Chartkick API
     *   This section defines the global Chartkick object and its methods,
     *   which are exposed to the end-user for creating charts.
     *   ====================================================================
     */


    var Chartkick = {
        // The main Chartkick object.

        // Base function for creating charts.
        charts: function () {
            // This function is intended to be implemented elsewhere or extended.
        },


        // Renders a line chart.
        lineChart: function ( element, dataSource, opts ) {
            opts = opts || {}; // Ensure opts is an object.
            fetchDataSource( element, dataSource, opts, function ( element, data, opts ) {
                var series = processSeries( data, opts, true ); // Process data for time-based chart.
                renderLineChart( element, series, opts ); // Call the library-specific render function.
            } );
        },


        // Renders a pie chart.
        pieChart: function ( element, dataSource, opts ) {
            opts = opts || {}; // Ensure opts is an object.
            fetchDataSource( element, dataSource, opts, function ( element, data, opts ) {
                var series = toArr( data ); // Convert data to array format for pie chart.
                renderPieChart( element, series, opts ); // Call the library-specific render function.
            } );
        },


        // Renders a column chart.
        columnChart: function ( element, dataSource, opts ) {
            opts = opts || {}; // Ensure opts is an object.
            fetchDataSource( element, dataSource, opts, function ( element, data, opts ) {
                var series = processSeries( data, opts, false ); // Process data for category-based chart.
                renderColumnChart( element, series, opts ); // Call the library-specific render function.
            } );
        },


        // Renders a bar chart (currently aliases to column chart).
        barChart: function ( element, dataSource, opts ) {
            opts = opts || {};
            fetchDataSource( element, dataSource, opts, function ( element, data, opts ) {
                var series = processSeries( data, opts, false );
                renderColumnChart( element, series, opts ); // Bar charts often use similar logic to column charts, just transposed.
            } );
        },


        // Renders an area chart (currently aliases to line chart).
        areaChart: function ( element, dataSource, opts ) {
            opts = opts || {};
            fetchDataSource( element, dataSource, opts, function ( element, data, opts ) {
                var series = processSeries( data, opts, true );
                renderLineChart( element, series, opts ); // Area charts are essentially filled line charts.
            } );
        }

    }; // End of Chartkick object.


    // Expose Chartkick to the global window object.
    window.Chartkick = Chartkick;


    // Auto-load charts if data attributes are present in the HTML.
    // This provides a declarative way to create charts without explicit JavaScript calls.
    $( function () { // jQuery document ready equivalent.

        $( "[data-chart]" ).each( function ( i, element ) {
            // Iterate over all elements with a 'data-chart' attribute.
            var chart = $( element ).data( "chart" ); // Get the chart type (e.g., "line", "pie").
            var dataSource = $( element ).data( "datasource" ); // Get the data source (URL or inline data).
            var options = $( element ).data( "options" ) || {}; // Get chart options from 'data-options'.

            if ( Chartkick[chart + "Chart"] ) {
                // If a corresponding chart rendering function exists.
                Chartkick[chart + "Chart"]( element, dataSource, options ); // Render the chart.
            }
        } );

    } ); // End of jQuery document ready.


} )(); // End of IIFE (Immediately Invoked Function Expression).