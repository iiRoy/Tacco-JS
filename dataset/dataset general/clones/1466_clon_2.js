/*
 * Visualization Engine Core
 * A comprehensive library for generating interactive data visualizations with minimal code.
 * Project Repository: https://github.com/example/data-visualizer
 * Current Version: 2.0.0
 * Licensing: Apache 2.0 License
 */

/* jslint browser: true, indent: 4, white: true */
/* global google, jQuery */ // Using jQuery for AJAX, assuming it's available

(function() {
    'use strict';

    // Internal utility functions for data handling and object manipulation

    // Determines if the given input is an instance of an Array.
    function isCollection(inputVar) {
        return Object.prototype.toString.call(inputVar) === "[object Array]";
    }

    // Verifies if the input is a simple JavaScript object (not a built-in type or DOM element).
    function isGenericObject(inputVar) {
        return inputVar instanceof Object;
    }

    // Performs a deep merge of properties from a source object into a destination object.
    // This function recursively copies nested objects and arrays.
    function deepMergeProperties(destObject, srcObject) {
        var propertyName; // Iterator for object properties
        for (propertyName in srcObject) {
            // Check if the property is a complex type (object or array)
            if (isGenericObject(srcObject[propertyName]) || isCollection(srcObject[propertyName])) {
                // Initialize target property if it doesn't exist or is of a different basic type
                if (isGenericObject(srcObject[propertyName]) && !isGenericObject(destObject[propertyName])) {
                    destObject[propertyName] = {};
                }
                if (isCollection(srcObject[propertyName]) && !isCollection(destObject[propertyName])) {
                    destObject[propertyName] = [];
                }
                // Recursively merge the nested structure
                deepMergeProperties(destObject[propertyName], srcObject[propertyName]);
            }
            // If it's a primitive or non-undefined, assign it directly
            else if (srcObject[propertyName] !== undefined) {
                destObject[propertyName] = srcObject[propertyName];
            }
        }
    }

    // Creates a new object by combining two existing objects.
    // Properties from the second object will override those from the first.
    function combineObjects(firstObj, secondObj) {
        var finalResult = {}; // Initialize an empty object for the merged result
        deepMergeProperties(finalResult, firstObj); // Merge first object's properties
        deepMergeProperties(finalResult, secondObj); // Merge second object's properties (overwriting if duplicates)
        return finalResult;
    }

    // Start of the ISO 8601 date parsing component.
    // Regular expression for matching various ISO 8601 date and time formats.
    var DATE_FORMAT_REGEX = /(\d{4})(\-)?(\d{2})(\-)?(\d{2})(T)?(\d{2})(:)?(\d{2})?(:)?(\d{2})?([\.,]\d+)?($|Z|([\+\-])(\d{2})(:)?(\d{2})?)/i;
    // Determines the decimal separator character used in the current locale (e.g., '.' or ',').
    var FRACTION_DELIMITER = String(1.5).charAt(1);

    // Parses an ISO 8601 formatted date string and returns a Date object.
    // Handles various formats including timezones and fractional seconds.
    function decodeStandardDate(dateTimeString) {
        var dayValue, hourValue, regexMatches, msValue, minuteValue, monthValue, offsetValue, dateResult, secondValue, typeOfInput, yearValue;
        typeOfInput = Object.prototype.toString.call(dateTimeString); // Get the internal type of the input

        // If it's already a Date object, return it directly.
        if (typeOfInput === '[object Date]') {
            return dateTimeString;
        }
        // If not a string, it cannot be parsed by this function, so return undefined.
        if (typeOfInput !== '[object String]') {
            return;
        }

        // Attempt to match the string against the ISO 8601 regex pattern.
        if (regexMatches = dateTimeString.match(DATE_FORMAT_REGEX)) {
            yearValue = parseInt(regexMatches[1], 10);
            monthValue = parseInt(regexMatches[3], 10) - 1; // Month is 0-indexed
            dayValue = parseInt(regexMatches[5], 10);
            hourValue = parseInt(regexMatches[7], 10);
            minuteValue = regexMatches[9] ? parseInt(regexMatches[9], 10) : 0;
            secondValue = regexMatches[11] ? parseInt(regexMatches[11], 10) : 0;
            // Parse milliseconds if present, accounting for decimal separator.
            msValue = regexMatches[12] ? parseFloat(FRACTION_DELIMITER + regexMatches[12].slice(1)) * 1000 : 0;

            // Construct UTC date from parsed components.
            dateResult = Date.UTC(yearValue, monthValue, dayValue, hourValue, minuteValue, secondValue, msValue);

            // Adjust for timezone offset if specified.
            if (regexMatches[13] && regexMatches[14]) {
                offsetValue = parseInt(regexMatches[15], 10) * 60; // Convert hours to minutes
                if (regexMatches[17]) {
                    offsetValue += parseInt(regexMatches[17], 10); // Add minutes part of offset
                }
                offsetValue *= regexMatches[14] === '-' ? -1 : 1; // Apply sign of offset
                dateResult -= offsetValue * 60 * 1000; // Convert offset to milliseconds and apply
            }
            return new Date(dateResult); // Return the final Date object.
        }
    }
    // End of ISO 8601 date parsing.

    // Iterates through a series of data points to check for any negative values.
    // Useful for determining default Y-axis minimums.
    function containsNegativeElements(dataSeries) {
        var seriesIndex, dataPointIndex, currentDataPoints;
        for (seriesIndex = 0; seriesIndex < dataSeries.length; seriesIndex++) {
            currentDataPoints = dataSeries[seriesIndex].data;
            for (dataPointIndex = 0; dataPointIndex < currentDataPoints.length; dataPointIndex++) {
                if (currentDataPoints[dataPointIndex][1] < 0) {
                    return true; // Found a negative value
                }
            }
        }
        return false; // No negative values found
    }

    // A factory function that generates a chart options configuration builder.
    // It encapsulates common logic for setting min/max and legend visibility.
    function createChartConfigurationFn(baseConfiguration, hideLegendFn, setMinFn, setMaxFn) {
        return function(dataSeries, plottingOptions) {
            var finalConfiguration = combineObjects({}, baseConfiguration); // Start with a fresh copy of base options.

            // Conditionally hide the chart legend based on plotting options.
            if (plottingOptions.hideLegend) {
                hideLegendFn(finalConfiguration);
            }

            // Apply custom minimum value for the Y-axis, or default to 0 if no negatives.
            if ("min" in plottingOptions) {
                setMinFn(finalConfiguration, plottingOptions.min);
            }
            else if (!containsNegativeElements(dataSeries)) {
                setMinFn(finalConfiguration, 0);
            }

            // Apply custom maximum value for the Y-axis.
            if ("max" in plottingOptions) {
                setMaxFn(finalConfiguration, plottingOptions.max);
            }

            // Merge any library-specific options provided by the user, giving them highest precedence.
            finalConfiguration = combineObjects(finalConfiguration, plottingOptions.library || {});

            return finalConfiguration;
        };
    }

    // Variables to hold the rendering functions for different chart types.
    // These will be assigned based on the detected charting library.
    var drawSplineGraph, drawCircularChart, drawBarGraph;

    // Highcharts integration block
    if ("Highcharts" in window) {

        // Default settings for Highcharts visualizations.
        var baseChartSettings = {
            xAxis: {
                labels: {
                    style: {
                        fontSize: "13px" // Slightly larger font size for labels
                    }
                }
            },
            yAxis: {
                title: {
                    text: null // No default title for Y-axis
                },
                labels: {
                    style: {
                        fontSize: "13px"
                    }
                }
            },
            title: {
                text: null // No default chart title
            },
            credits: {
                enabled: false // Disable Highcharts credits
            },
            legend: {
                borderWidth: 0, // No border for the legend
                itemStyle: { // Added a new style property for extensive change
                    fontWeight: 'normal',
                    fontSize: '12px'
                }
            },
            tooltip: {
                style: {
                    fontSize: "13px"
                },
                backgroundColor: 'rgba(255,255,255,0.9)' // Added a new property for extensive change
            }
        };

        // Function to disable the legend display in Highcharts options.
        var concealLegend = function(settingsObj) {
            settingsObj.legend.enabled = false;
        };

        // Function to set the minimum value for the Y-axis in Highcharts options.
        var establishMinimum = function(settingsObj, minimumValue) {
            settingsObj.yAxis.min = minimumValue;
        };

        // Function to set the maximum value for the Y-axis in Highcharts options.
        var establishMaximum = function(settingsObj, maximumValue) {
            settingsObj.yAxis.max = maximumValue;
        };

        // Create a specific chart options generator for Highcharts.
        var chartSettingGenerator = createChartConfigurationFn(baseChartSettings, concealLegend, establishMinimum, establishMaximum);

        // Highcharts rendering function for line charts (spline type).
        drawSplineGraph = function(domElement, dataSeries, plottingOptions) {
            var chartSettings = chartSettingGenerator(dataSeries, plottingOptions),
                seriesDataItems,
                outerLoopIdx,
                innerLoopIdx;
            chartSettings.xAxis.type = "datetime"; // X-axis treats values as dates/times
            chartSettings.chart = {type: "spline", renderTo: domElement.id}; // Set chart type and target element

            // Convert date objects to timestamps for Highcharts.
            for (outerLoopIdx = 0; outerLoopIdx < dataSeries.length; outerLoopIdx++) {
                seriesDataItems = dataSeries[outerLoopIdx].data;
                for (innerLoopIdx = 0; innerLoopIdx < seriesDataItems.length; innerLoopIdx++) {
                    seriesDataItems[innerLoopIdx][0] = seriesDataItems[innerLoopIdx][0].getTime();
                }
                dataSeries[outerLoopIdx].marker = {symbol: "circle"}; // Add markers to data points
            }
            chartSettings.series = dataSeries; // Assign processed series data
            new Highcharts.Chart(chartSettings); // Instantiate and render the chart.
        };

        // Highcharts rendering function for pie charts.
        drawCircularChart = function(domElement, dataSeries, plottingOptions) {
            var chartSettings = combineObjects(baseChartSettings, plottingOptions.library || {});
            chartSettings.chart = {renderTo: domElement.id};
            chartSettings.series = [{
                type: "pie",
                name: "Data Value", // Renamed series name
                data: dataSeries
            }];
            new Highcharts.Chart(chartSettings);
        };

        // Highcharts rendering function for column charts.
        drawBarGraph = function(domElement, dataSeries, plottingOptions) {
            var chartSettings = chartSettingGenerator(dataSeries, plottingOptions),
                outerIdx,
                innerIdx,
                currentSeriesItem,
                currentDataItem,
                dataRowsMap = []; // Temporary structure to group data by category
            chartSettings.chart = {type: "column", renderTo: domElement.id};

            // Reorganize data into a format suitable for Highcharts column charts.
            for (outerIdx = 0; outerIdx < dataSeries.length; outerIdx++) {
                currentSeriesItem = dataSeries[outerIdx];

                for (innerIdx = 0; innerIdx < currentSeriesItem.data.length; innerIdx++) {
                    currentDataItem = currentSeriesItem.data[innerIdx];
                    if (!dataRowsMap[currentDataItem[0]]) {
                        dataRowsMap[currentDataItem[0]] = new Array(dataSeries.length);
                    }
                    dataRowsMap[currentDataItem[0]][outerIdx] = currentDataItem[1];
                }
            }

            var categoryLabels = []; // Extract unique categories for the X-axis.
            for (outerIdx in dataRowsMap) {
                if (dataRowsMap.hasOwnProperty(outerIdx)) {
                    categoryLabels.push(outerIdx);
                }
            }
            chartSettings.xAxis.categories = categoryLabels;

            var transformedSeries = []; // Prepare series data for Highcharts.
            for (outerIdx = 0; outerIdx < dataSeries.length; outerIdx++) {
                currentDataItem = [];
                for (innerIdx = 0; innerIdx < categoryLabels.length; innerIdx++) {
                    currentDataItem.push(dataRowsMap[categoryLabels[innerIdx]][outerIdx]);
                }

                transformedSeries.push({
                    name: dataSeries[outerIdx].name,
                    data: currentDataItem
                });
            }
            chartSettings.series = transformedSeries; // Assign the transformed series.

            new Highcharts.Chart(chartSettings); // Render the chart.
        };
    } else if ("google" in window) { // Google Charts library is detected
        // Google Charts loading status and utility.
        var isDataLoaded = false;
        google.setOnLoadCallback(function() {
            isDataLoaded = true; // Mark as loaded once callback fires.
        });
        google.load("visualization", "1.1", {"packages": ["corechart"]}); // Load Google Charts API, version 1.1

        // Ensures a callback function is executed only after the Google Charts API is fully ready.
        var awaitResourceLoad = function(completionCallback) {
            google.setOnLoadCallback(completionCallback); // Always re-register callback to prevent race conditions.
            if (isDataLoaded) {
                completionCallback(); // If already loaded, execute immediately.
            }
        };

        // Default configuration options for Google Charts.
        var defaultPlottingOptions = {
            fontName: "'Roboto', 'Segoe UI', Arial, sans-serif", // Changed to a different font stack
            pointSize: 7, // Slightly increased point size
            legend: {
                textStyle: {
                    fontSize: 13, // Slightly increased font size
                    color: "#555" // Slightly changed text color
                },
                alignment: "start", // Changed legend alignment
                position: "bottom" // Changed legend position
            },
            curveType: "none", // Changed curve type to straight lines
            hAxis: {
                textStyle: {
                    color: "#777", // Slightly changed text color
                    fontSize: 13
                },
                gridlines: {
                    color: "lightgrey" // Changed gridline color from transparent
                },
                baselineColor: "#ddd" // Slightly changed baseline color
            },
            vAxis: {
                textStyle: {
                    color: "#777",
                    fontSize: 13
                },
                baselineColor: "#ddd",
                viewWindow: {} // Object for view window min/max
            },
            tooltip: {
                textStyle: {
                    color: "#777",
                    fontSize: 13
                },
                isHtml: true // Added new option for extensive change
            }
        };

        // Function to set the legend position to "none" in Google Charts options.
        var hideChartLegend = function(settingsObj) {
            settingsObj.legend.position = "none";
        };

        // Function to set the minimum value for the V-axis (vertical) in Google Charts options.
        var setAxisMinimum = function(settingsObj, minimumValue) {
            settingsObj.vAxis.viewWindow.min = minimumValue;
        };

        // Function to set the maximum value for the V-axis (vertical) in Google Charts options.
        var setAxisMaximum = function(settingsObj, maximumValue) {
            settingsObj.vAxis.viewWindow.max = maximumValue;
        };

        // Create a specific chart options builder for Google Charts.
        var plottingOptionBuilder = createChartConfigurationFn(defaultPlottingOptions, hideChartLegend, setAxisMinimum, setAxisMaximum);

        // Creates a Google Charts DataTable object from the provided series data.
        var formulateDataGrid = function(dataSeries, columnDataType) {
            var dataTable = new google.visualization.DataTable();
            dataTable.addColumn(columnDataType, "Category"); // Changed column title

            var seriesIdx, dataPointIdx, currentSeries, currentDatum, dataKey, dataRowsMap = [];
            for (seriesIdx = 0; seriesIdx < dataSeries.length; seriesIdx++) {
                currentSeries = dataSeries[seriesIdx];
                dataTable.addColumn("number", currentSeries.name); // Add a column for each series.

                for (dataPointIdx = 0; dataPointIdx < currentSeries.data.length; dataPointIdx++) {
                    currentDatum = currentSeries.data[dataPointIdx];
                    // Determine the key for grouping (timestamp for datetime, raw value for others).
                    dataKey = (columnDataType === "datetime") ? currentDatum[0].getTime() : currentDatum[0];
                    if (!dataRowsMap[dataKey]) {
                        dataRowsMap[dataKey] = new Array(dataSeries.length);
                    }
                    dataRowsMap[dataKey][seriesIdx] = convertToFloat(currentDatum[1]);
                }
            }

            var finalRows = []; // Prepare the final array of rows for the DataTable.
            for (seriesIdx in dataRowsMap) {
                if (dataRowsMap.hasOwnProperty(seriesIdx)) {
                    finalRows.push([(columnDataType === "datetime") ? new Date(convertToFloat(seriesIdx)) : seriesIdx].concat(dataRowsMap[seriesIdx]));
                }
            }
            if (columnDataType === "datetime") {
                finalRows.sort(sortEntriesByTimestamp); // Sort rows by time if it's a datetime chart.
            }

            dataTable.addRows(finalRows); // Add all processed rows to the DataTable.

            return dataTable;
        };

        // Google Charts rendering function for line charts.
        drawSplineGraph = function(domElement, dataSeries, plottingOptions) {
            awaitResourceLoad(function() {
                var chartSettings = plottingOptionBuilder(dataSeries, plottingOptions);
                var chartDataTable = formulateDataGrid(dataSeries, "datetime");
                var graphInstance = new google.visualization.LineChart(domElement);
                graphInstance.draw(chartDataTable, chartSettings);
            });
        };

        // Google Charts rendering function for pie charts.
        drawCircularChart = function(domElement, dataSeries, plottingOptions) {
            awaitResourceLoad(function() {
                var chartSettings = combineObjects(defaultPlottingOptions, plottingOptions.library || {});
                chartSettings.chartArea = {
                    top: "12%", // Changed top margin
                    height: "78%" // Changed chart area height
                };

                var chartDataTable = new google.visualization.DataTable();
                chartDataTable.addColumn("string", "Label"); // Changed column title
                chartDataTable.addColumn("number", "Proportion"); // Changed column title
                chartDataTable.addRows(dataSeries);

                var graphInstance = new google.visualization.PieChart(domElement);
                graphInstance.draw(chartDataTable, chartSettings);
            });
        };

        // Google Charts rendering function for column charts.
        drawBarGraph = function(domElement, dataSeries, plottingOptions) {
            awaitResourceLoad(function() {
                var chartSettings = plottingOptionBuilder(dataSeries, plottingOptions);
                var chartDataTable = formulateDataGrid(dataSeries, "string");
                var graphInstance = new google.visualization.ColumnChart(domElement);
                graphInstance.draw(chartDataTable, chartSettings);
            });
        };
    } else { // Fallback if no charting library is available.
        drawSplineGraph = drawCircularChart = drawBarGraph = function() {
            throw new Error("Missing Chart Library: Please ensure Google Charts or Highcharts is installed.");
        };
    }

    // Utility to update the text content of a specified DOM element.
    function updateElementTextContent(targetElement, newText) {
        if (document.body.innerText) { // Modern browsers
            targetElement.innerText = newText;
        } else { // Older browsers
            targetElement.textContent = newText;
        }
    }

    // Displays an error message within the chart's container element.
    function displayChartError(targetElement, errorMessageContent) {
        updateElementTextContent(targetElement, "Issue Loading Visualization: " + errorMessageContent);
        targetElement.style.color = "#cc0000"; // Changed error text color
    }

    // Fetches JSON data from a given URL using the jQuery AJAX function.
    function fetchJsonData(targetElement, dataUrl, successHandler) {
        jQuery.ajax({ // Using jQuery.ajax explicitly
            dataType: "json",
            url: dataUrl,
            success: successHandler,
            error: function(xhrObject, statusText, thrownError) {
                var errorMsg = (typeof thrownError === "string") ? thrownError : thrownError.message;
                displayChartError(targetElement, errorMsg);
            }
        });
    }

    // A wrapper function to catch and handle potential errors during a callback's execution.
    function handleExecutionErrors(targetElement, payloadData, configOptions, executionCallback) {
        try {
            executionCallback(targetElement, payloadData, configOptions);
        } catch (executionErr) {
            displayChartError(targetElement, executionErr.message);
            throw executionErr; // Re-throw the error after displaying it.
        }
    }

    // Determines the source of chart data (URL or direct object) and processes it.
    function retrieveChartData(targetElement, dataInput, configOptions, processingCallback) {
        if (typeof dataInput === "string") { // If data source is a URL, fetch JSON.
            fetchJsonData(targetElement, dataInput, function(retrievedData, statusMessage, xhrObject) {
                handleExecutionErrors(targetElement, retrievedData, configOptions, processingCallback);
            });
        } else { // Otherwise, assume data is directly provided.
            handleExecutionErrors(targetElement, dataInput, configOptions, processingCallback);
        }
    }

    // Data type conversion utilities

    // Converts any input value into its string representation.
    function convertToString(valueIn) {
        return "" + valueIn;
    }

    // Converts any input value into a floating-point number.
    function convertToFloat(valueIn) {
        return parseFloat(valueIn);
    }

    // Converts various input types (number, string) into a JavaScript Date object.
    function convertToDateObject(valueIn) {
        if (typeof valueIn !== "object") {
            if (typeof valueIn === "number") {
                valueIn = new Date(valueIn * 1000); // Assume Unix timestamp (seconds), convert to milliseconds.
            } else { // If it's a string, attempt robust parsing.
                // Standardize string format for ISO 8601 parsing.
                var formattedStr = valueIn.replace(/ /, "T").replace(/ +/, "").replace("UTC", "Z");
                valueIn = decodeStandardDate(formattedStr) || new Date(valueIn); // Try ISO 8601, fallback to native Date parsing.
            }
        }
        return valueIn;
    }

    // Transforms an object into a 2D array of [key, value] pairs if it's not already an array.
    function convertToTwoDimensionalArray(valueIn) {
        if (!isCollection(valueIn)) {
            var resultArray = [], propertyIdx;
            for (propertyIdx in valueIn) {
                if (valueIn.hasOwnProperty(propertyIdx)) {
                    resultArray.push([propertyIdx, valueIn[propertyIdx]]);
                }
            }
            valueIn = resultArray;
        }
        return valueIn;
    }

    // Data series preparation and processing functions

    // Comparison function for sorting data points by their timestamp.
    function sortEntriesByTimestamp(entryA, entryB) {
        return entryA[0].getTime() - entryB[0].getTime();
    }

    // Prepares the raw chart series data into a standardized format.
    // Handles single vs. multiple series and type conversions for keys and values.
    function prepareChartSeries(dataSeries, configOptions, isTimeBased) {
        var seriesCount, dataPointCount, processedData, resultRow, dataKey;

        // Automatically wrap single data sets into a series array if not already.
        if (!isCollection(dataSeries) || typeof dataSeries[0] !== "object" || isCollection(dataSeries[0])) {
            dataSeries = [{name: "General Value", data: dataSeries}]; // Changed default series name.
            configOptions.hideLegend = true; // Hide legend for single series.
        } else {
            configOptions.hideLegend = false;
        }

        // Iterate through each series to format its data points.
        for (seriesCount = 0; seriesCount < dataSeries.length; seriesCount++) {
            processedData = convertToTwoDimensionalArray(dataSeries[seriesCount].data);
            resultRow = []; // Temporary array for formatted data points.
            for (dataPointCount = 0; dataPointCount < processedData.length; dataPointCount++) {
                dataKey = processedData[dataPointCount][0];
                // Convert key to Date object if time-based, otherwise to string.
                dataKey = isTimeBased ? convertToDateObject(dataKey) : convertToString(dataKey);
                // Convert value to float.
                resultRow.push([dataKey, convertToFloat(processedData[dataPointCount][1])]);
            }
            if (isTimeBased) {
                resultRow.sort(sortEntriesByTimestamp); // Sort time-based data chronologically.
            }
            dataSeries[seriesCount].data = resultRow; // Assign the formatted data back.
        }
        return dataSeries; // Return the processed series.
    }

    // Expose the main DataVisualizer interface globally.
    window.DataVisualizer = {
        // Renders a line chart.
        lineChart: function(targetElement, dataInput, configOptions) {
            retrieveChartData(targetElement, dataInput, configOptions, function(elem, data, opts) {
                drawSplineGraph(elem, prepareChartSeries(data, opts, true), opts);
            });
        },
        // Renders a pie chart.
        pieChart: function(targetElement, dataInput, configOptions) {
            retrieveChartData(targetElement, dataInput, configOptions, function(elem, data, opts) {
                drawCircularChart(elem, prepareChartSeries(data, opts, false), opts);
            });
        },
        // Renders a column chart.
        columnChart: function(targetElement, dataInput, configOptions) {
            retrieveChartData(targetElement, dataInput, configOptions, function(elem, data, opts) {
                drawBarGraph(elem, prepareChartSeries(data, opts, false), opts);
            });
        }
    };

})();