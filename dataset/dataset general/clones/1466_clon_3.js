/*
 * VisualDataGen.js - A utility for crafting dynamic data visualizations.
 * Version 2.1.0
 * (c) 2024 DataViz Innovations Corp.
 * Licensed under a permissive open-source agreement.
 */

/* eslint-disable no-unused-vars, no-undef, no-console */
/* global window, document, Highcharts, google, jQuery */

(function initVisualizerModule() {
  'use strict';

  // Core utility functions for data processing

  /**
   * Determines if a given input is an array type.
   * @param {any} inputSubject - The variable to check.
   * @returns {boolean} True if the input is an array, false otherwise.
   */
  function isInputAnArray(inputSubject) {
    // A robust method for array detection, even across different JS contexts.
    return Object.prototype.toString.call(inputSubject) === "[object Array]";
  }

  /**
   * Checks if an input is a plain JavaScript object (not an array, null, or primitive).
   * @param {any} inputObject - The variable to verify.
   * @returns {boolean} True if the input is a plain object, false otherwise.
   */
  function isJustAnObject(inputObject) {
    // Ensuring it's an object, not null, and not an array.
    return typeof inputObject === 'object' && inputObject !== null && !isInputAnArray(inputObject);
  }

  /**
   * Recursively merges properties from a source object into a target object.
   * This function performs a deep merge for objects and arrays.
   * @param {object} primaryTarget - The object to receive merged properties.
   * @param {object} sourceData - The object containing properties to merge.
   */
  function deepObjectMerge(primaryTarget, sourceData) {
    if (!primaryTarget || typeof primaryTarget !== 'object' || !sourceData || typeof sourceData !== 'object') {
      // Basic validation: ensure both inputs are valid objects.
      console.warn("Invalid inputs for deepObjectMerge. Both target and source must be objects.");
      return;
    }

    Object.keys(sourceData).forEach(function(propKey) {
      const sourceVal = sourceData[propKey];
      const targetVal = primaryTarget[propKey];

      if (isJustAnObject(sourceVal) || isInputAnArray(sourceVal)) {
        // Handle deep merging for nested objects and arrays.
        if (isJustAnObject(sourceVal) && !isJustAnObject(targetVal)) {
          primaryTarget[propKey] = {}; // Initialize target property if it's not an object.
        } else if (isInputAnArray(sourceVal) && !isInputAnArray(targetVal)) {
          primaryTarget[propKey] = []; // Initialize target property if it's not an array.
        }
        deepObjectMerge(primaryTarget[propKey], sourceVal); // Recurse for nested structures.
      } else if (sourceVal !== undefined) {
        // Assign primitive values or functions, excluding undefined source values.
        primaryTarget[propKey] = sourceVal;
      }
    });
  }

  /**
   * Creates a new object by deeply merging two source objects.
   * @param {object} objA - The first object.
   * @param {object} objB - The second object, whose properties override those in objA.
   * @returns {object} A new object containing the merged properties.
   */
  function createMergedObject(objA, objB) {
    let finalResult = {};
    deepObjectMerge(finalResult, objA); // Start with properties from the first object.
    deepObjectMerge(finalResult, objB); // Then deeply merge the second object.
    return finalResult;
  }

  // Constants for date parsing
  const ISO_DATE_REGEX = /(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(Z|([+-]\d{2}):?(\d{2})?)?)?/i;
  const DECIMAL_POINT_CHAR = (1.5).toLocaleString().charAt(1); // Locale-aware decimal separator

  /**
   * Parses an ISO 8601 formatted string into a JavaScript Date object.
   * Supports various ISO 8601 formats and handles timezones.
   * @param {string|Date} dateString - The string or Date object to parse.
   * @returns {Date|undefined} A Date object if parsing is successful, otherwise undefined.
   */
  function extractIsoDate(dateString) {
    if (dateString instanceof Date) {
      return dateString; // Already a Date object, return as is.
    }
    if (typeof dateString !== 'string') {
      return undefined; // Not a string, cannot parse.
    }

    const dateMatches = dateString.match(ISO_DATE_REGEX);
    if (!dateMatches) {
      return undefined; // No match for ISO 8601 pattern.
    }

    // Extract components from the regex matches.
    const yearVal = parseInt(dateMatches[1], 10);
    const monthVal = parseInt(dateMatches[2], 10) - 1; // Month is 0-indexed.
    const dayVal = parseInt(dateMatches[3], 10);
    const hourVal = parseInt(dateMatches[4] || '0', 10);
    const minuteVal = parseInt(dateMatches[5] || '0', 10);
    const secondVal = parseInt(dateMatches[6] || '0', 10);
    const millisecondVal = dateMatches[7] ? parseFloat(`0.${dateMatches[7].slice(0, 3)}`) * 1000 : 0; // Take max 3 digits for ms.

    let utcTime = Date.UTC(yearVal, monthVal, dayVal, hourVal, minuteVal, secondVal, millisecondVal);

    // Handle timezone offset.
    const timezoneIndicator = dateMatches[8];
    if (timezoneIndicator && timezoneIndicator !== 'Z') {
      const offsetSign = (timezoneIndicator[0] === '-') ? -1 : 1;
      const offsetHours = parseInt(dateMatches[9], 10);
      const offsetMinutes = parseInt(dateMatches[10] || '0', 10);
      const totalOffsetMinutes = (offsetHours * 60 + offsetMinutes) * offsetSign;
      utcTime -= totalOffsetMinutes * 60 * 1000; // Adjust for timezone.
    }

    return new Date(utcTime);
  }

  /**
   * Checks if any series in the dataset contains negative values.
   * This is useful for determining default Y-axis minimums.
   * @param {Array<object>} dataSeries - An array of series objects, each with a 'data' array.
   * @returns {boolean} True if any value is negative, false otherwise.
   */
  function hasAnyNegativeValues(dataSeries) {
    if (!dataSeries || !isInputAnArray(dataSeries)) {
        return false; // Guard against invalid input
    }
    // Iterate through each series and its data points.
    for (let currentSeriesIndex = 0; currentSeriesIndex < dataSeries.length; currentSeriesIndex++) {
      const seriesPoints = dataSeries[currentSeriesIndex].data;
      if (!seriesPoints || !isInputAnArray(seriesPoints)) {
          continue; // Skip if data is missing or not an array
      }
      for (let pointIndex = 0; pointIndex < seriesPoints.length; pointIndex++) {
        if (seriesPoints[pointIndex][1] < 0) {
          return true; // Found a negative value.
        }
      }
    }
    return false; // No negative values found.
  }

  /**
   * Factory function to create a standardized options generator for charting libraries.
   * @param {object} baseConfig - Default configuration for the chart.
   * @param {function} legendHider - Function to disable the legend in the config.
   * @param {function} minYSetter - Function to set the minimum Y-axis value.
   * @param {function} maxYSetter - Function to set the maximum Y-axis value.
   * @returns {function(Array<object>, object): object} A function that generates chart options.
   */
  function createChartOptionGenerator(baseConfig, legendHider, minYSetter, maxYSetter) {
    return function generateOptions(seriesInput, customSettings) {
      let currentOptions = createMergedObject({}, baseConfig); // Start with a fresh copy of base config.

      // Apply legend visibility setting.
      if (customSettings.hideLegend) {
        legendHider(currentOptions);
      }

      // Determine and apply Y-axis minimum.
      if ("min" in customSettings) {
        minYSetter(currentOptions, customSettings.min);
      } else if (!hasAnyNegativeValues(seriesInput)) {
        minYSetter(currentOptions, 0); // Default to 0 if no negative values.
      }

      // Apply Y-axis maximum if specified.
      if ("max" in customSettings) {
        maxYSetter(currentOptions, customSettings.max);
      }

      // Merge library-specific options last, allowing them to override.
      if (customSettings.library) {
        deepObjectMerge(currentOptions, customSettings.library);
      }

      return currentOptions;
    };
  }

  // Declare placeholders for chart rendering functions.
  let drawLinePlot, drawPieSliceChart, drawBarColumnChart;

  // Branch for Highcharts library
  if ("Highcharts" in window) {
    // Default Highcharts configuration.
    const highchartsBaseOptions = {
      xAxis: {
        labels: {
          style: {
            fontSize: "12px",
            color: "#333" // Added color for clarity
          }
        },
        title: {
            text: null // Suppress X-axis title by default
        }
      },
      yAxis: {
        title: {
          text: null // Suppress Y-axis title.
        },
        labels: {
          style: {
            fontSize: "12px",
            color: "#333" // Added color for clarity
          }
        },
        minPadding: 0.05, // Added for better visualization
        maxPadding: 0.05
      },
      title: {
        text: null // No chart title by default.
      },
      credits: {
        enabled: false // Disable Highcharts branding.
      },
      legend: {
        borderWidth: 0,
        itemStyle: {
            fontSize: "11px",
            fontWeight: "normal" // Added for clarity
        }
      },
      tooltip: {
        style: {
          fontSize: "12px"
        },
        backgroundColor: 'rgba(255, 255, 255, 0.85)', // Added for better readability
        borderColor: '#ccc',
        borderWidth: 1
      },
      chart: {
          style: {
              fontFamily: "'Helvetica Neue', Arial, sans-serif" // Added font family
          }
      }
    };

    /** Helper to hide legend for Highcharts. */
    const hideHighchartsLegend = (optionsConfig) => {
      optionsConfig.legend.enabled = false;
    };

    /** Helper to set Y-axis min for Highcharts. */
    const setHighchartsMinY = (optionsConfig, minValue) => {
      optionsConfig.yAxis.min = minValue;
    };

    /** Helper to set Y-axis max for Highcharts. */
    const setHighchartsMaxY = (optionsConfig, maxValue) => {
      optionsConfig.yAxis.max = maxValue;
    };

    // Create the Highcharts options generator.
    const highchartsOptionAdapter = createChartOptionGenerator(
      highchartsBaseOptions,
      hideHighchartsLegend,
      setHighchartsMinY,
      setHighchartsMaxY
    );

    /**
     * Renders a line chart using Highcharts.
     * @param {HTMLElement} targetElement - The DOM element to render the chart in.
     * @param {Array<object>} seriesData - Data series for the chart.
     * @param {object} chartOptions - User-provided chart options.
     */
    drawLinePlot = function(targetElement, seriesData, chartOptions) {
      if (!targetElement || !seriesData) {
          console.error("Missing element or data for line plot.");
          return;
      }

      const processedOptions = highchartsOptionAdapter(seriesData, chartOptions);
      processedOptions.xAxis.type = "datetime"; // Ensure X-axis is time-based.
      processedOptions.chart = {
        type: "spline",
        renderTo: targetElement.id
      };

      // Convert date objects in series data to Unix timestamps.
      seriesData.forEach(function(currentSeries) {
        currentSeries.data.forEach(function(dataPoint) {
          if (dataPoint[0] instanceof Date) {
            dataPoint[0] = dataPoint[0].getTime();
          }
        });
        currentSeries.marker = {
          symbol: "circle",
          radius: 4, // Added marker size
          lineWidth: 1 // Added marker border
        };
      });

      processedOptions.series = seriesData;
      new Highcharts.Chart(processedOptions);
    };

    /**
     * Renders a pie chart using Highcharts.
     * @param {HTMLElement} targetElement - The DOM element to render the chart in.
     * @param {Array<Array>} seriesData - Data for the pie slices.
     * @param {object} chartOptions - User-provided chart options.
     */
    drawPieSliceChart = function(targetElement, seriesData, chartOptions) {
      if (!targetElement || !seriesData) {
          console.error("Missing element or data for pie chart.");
          return;
      }
      // Pie charts don't typically use the min/max/legend logic from the adapter,
      // so we merge directly with the base options.
      const pieSpecificOptions = createMergedObject(highchartsBaseOptions, chartOptions.library || {});
      pieSpecificOptions.chart = {
        renderTo: targetElement.id,
        type: "pie" // Explicitly set chart type
      };
      pieSpecificOptions.plotOptions = {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
            style: {
              color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
            }
          },
          showInLegend: true // Ensure legend is shown for pie slices
        }
      };
      pieSpecificOptions.series = [{
        type: "pie",
        name: "Data Value", // Renamed series name
        data: seriesData
      }];
      new Highcharts.Chart(pieSpecificOptions);
    };

    /**
     * Renders a column (bar) chart using Highcharts.
     * @param {HTMLElement} targetElement - The DOM element to render the chart in.
     * @param {Array<object>} seriesData - Data series for the chart.
     * @param {object} chartOptions - User-provided chart options.
     */
    drawBarColumnChart = function(targetElement, seriesData, chartOptions) {
      if (!targetElement || !seriesData) {
          console.error("Missing element or data for column chart.");
          return;
      }
      const processedOptions = highchartsOptionAdapter(seriesData, chartOptions);
      processedOptions.chart = {
        type: "column",
        renderTo: targetElement.id
      };

      const categoryMap = {}; // Maps categories to an array of values for each series.
      let categoryKeys = []; // Stores unique category names in order of appearance.

      // Process raw series data into a Highcharts-friendly format.
      seriesData.forEach(function(currentSeries, seriesIdx) {
        currentSeries.data.forEach(function(dataPoint) {
          const categoryName = String(dataPoint[0]); // Ensure category is a string.
          const value = dataPoint[1];

          if (!categoryMap[categoryName]) {
            categoryMap[categoryName] = new Array(seriesData.length).fill(null); // Initialize with nulls.
            categoryKeys.push(categoryName); // Add new category to ordered list.
          }
          categoryMap[categoryName][seriesIdx] = value;
        });
      });

      // Sort categories to ensure consistent rendering.
      categoryKeys.sort();

      processedOptions.xAxis.categories = categoryKeys;

      const transformedSeries = seriesData.map(function(originalSeries, seriesIdx) {
        const seriesValues = categoryKeys.map(function(cat) {
          return categoryMap[cat][seriesIdx];
        });
        return {
          name: originalSeries.name,
          data: seriesValues
        };
      });

      processedOptions.series = transformedSeries;
      new Highcharts.Chart(processedOptions);
    };

  } else if ("google" in window && window.google && window.google.visualization) { // Google Charts
    let googleChartsLoaded = false;

    // Google's setOnLoadCallback can be called multiple times; this ensures our flag is set.
    google.setOnLoadCallback(function() {
      googleChartsLoaded = true;
    });

    // Load necessary Google Visualization packages.
    google.load("visualization", "1.0", {
      "packages": ["corechart"]
    });

    /**
     * Ensures a callback runs only after Google Charts API is fully loaded.
     * @param {function} actionCallback - The function to execute once Google Charts is ready.
     */
    const ensureGoogleChartsReady = function(actionCallback) {
      // Always use setOnLoadCallback to handle cases where script might load later
      // or for subsequent calls.
      google.setOnLoadCallback(actionCallback);
      // Immediately invoke if already loaded to avoid unnecessary delays for subsequent charts.
      if (googleChartsLoaded) {
        actionCallback();
      }
    };

    // Default Google Charts configuration.
    const googleChartsBaseOptions = {
      fontName: "'Roboto', 'Open Sans', Arial, sans-serif", // Modern font choice
      pointSize: 7, // Slightly larger points
      legend: {
        textStyle: {
          fontSize: 12,
          color: "#555"
        },
        alignment: "center",
        position: "right",
        maxLines: 3 // Limit legend lines
      },
      curveType: "function", // Smooth curves for line charts.
      hAxis: {
        textStyle: {
          color: "#666",
          fontSize: 12
        },
        gridlines: {
          color: "transparent", // Hide horizontal grid lines on hAxis
          count: 5 // Example: set specific count
        },
        baselineColor: "#bbb", // Lighter baseline color
        title: null // Suppress hAxis title
      },
      vAxis: {
        textStyle: {
          color: "#666",
          fontSize: 12
        },
        baselineColor: "#bbb",
        viewWindow: {
          min: null, // Placeholder for min/max
          max: null
        },
        gridlines: {
            color: "#eee" // Light gridlines on vAxis
        },
        title: null // Suppress vAxis title
      },
      tooltip: {
        textStyle: {
          color: "#333",
          fontSize: 13
        },
        showColorCode: true // Show color swatch in tooltip
      },
      chartArea: {
          left: '10%',
          top: '10%',
          width: '80%',
          height: '75%'
      }
    };

    /** Helper to hide legend for Google Charts. */
    const hideGoogleChartsLegend = (optionsConfig) => {
      optionsConfig.legend.position = "none";
    };

    /** Helper to set V-axis min for Google Charts. */
    const setGoogleChartsMinV = (optionsConfig, minValue) => {
      optionsConfig.vAxis.viewWindow.min = minValue;
    };

    /** Helper to set V-axis max for Google Charts. */
    const setGoogleChartsMaxV = (optionsConfig, maxValue) => {
      optionsConfig.vAxis.viewWindow.max = maxValue;
    };

    // Create the Google Charts options generator.
    const googleChartsOptionAdapter = createChartOptionGenerator(
      googleChartsBaseOptions,
      hideGoogleChartsLegend,
      setGoogleChartsMinV,
      setGoogleChartsMaxV
    );

    /**
     * Converts raw series data into a Google DataTable format.
     * @param {Array<object>} inputSeries - The series data.
     * @param {string} firstColumnType - The data type for the first column (e.g., 'datetime', 'string').
     * @returns {google.visualization.DataTable} A Google DataTable object.
     */
    const assembleGoogleDataTable = function(inputSeries, firstColumnType) {
      const dataTable = new google.visualization.DataTable();
      dataTable.addColumn(firstColumnType, "Category"); // Renamed column title

      const rowCollection = {}; // Intermediate object to group values by category key.

      inputSeries.forEach(function(currentSeries, seriesIndex) {
        dataTable.addColumn("number", currentSeries.name); // Add a column for each series.

        currentSeries.data.forEach(function(dataPoint) {
          const rawKey = dataPoint[0];
          const value = parseFloat(dataPoint[1]); // Ensure value is a float.

          // Normalize key for consistent grouping (timestamp for datetime, string otherwise).
          const processedKey = (firstColumnType === "datetime") ? rawKey.getTime() : String(rawKey);

          if (!rowCollection[processedKey]) {
            rowCollection[processedKey] = new Array(inputSeries.length).fill(null); // Initialize with nulls.
          }
          rowCollection[processedKey][seriesIndex] = value;
        });
      });

      // Transform the grouped data into an array of rows suitable for DataTable.
      const finalRows = Object.keys(rowCollection).map(function(key) {
        const categoryValue = (firstColumnType === "datetime") ? new Date(parseFloat(key)) : key;
        return [categoryValue].concat(rowCollection[key]);
      });

      // Sort rows for datetime charts to ensure correct chronological order.
      if (firstColumnType === "datetime") {
        finalRows.sort((rowA, rowB) => rowA[0].getTime() - rowB[0].getTime());
      }

      dataTable.addRows(finalRows);
      return dataTable;
    };

    /**
     * Renders a line chart using Google Charts.
     * @param {HTMLElement} targetElement - The DOM element.
     * @param {Array<object>} seriesData - Chart data.
     * @param {object} chartOptions - Options.
     */
    drawLinePlot = function(targetElement, seriesData, chartOptions) {
      ensureGoogleChartsReady(function() {
        const currentOptions = googleChartsOptionAdapter(seriesData, chartOptions);
        const chartDataTable = assembleGoogleDataTable(seriesData, "datetime");
        const lineChart = new google.visualization.LineChart(targetElement);
        lineChart.draw(chartDataTable, currentOptions);
      });
    };

    /**
     * Renders a pie chart using Google Charts.
     * @param {HTMLElement} targetElement - The DOM element.
     * @param {Array<Array>} seriesData - Chart data.
     * @param {object} chartOptions - Options.
     */
    drawPieSliceChart = function(targetElement, seriesData, chartOptions) {
      ensureGoogleChartsReady(function() {
        const pieOptions = createMergedObject(googleChartsBaseOptions, chartOptions.library || {});
        pieOptions.chartArea = {
          left: '5%',
          top: '5%',
          width: '90%',
          height: '90%' // Adjust for pie chart
        };
        pieOptions.pieSliceText = 'percentage'; // Show percentage on slices
        pieOptions.is3D = false; // Default to 2D pie chart
        pieOptions.legend.position = 'labeled'; // Place legend directly on slices

        const pieDataTable = new google.visualization.DataTable();
        pieDataTable.addColumn("string", "Label"); // Renamed column
        pieDataTable.addColumn("number", "Value");
        pieDataTable.addRows(seriesData);

        const pieChart = new google.visualization.PieChart(targetElement);
        pieChart.draw(pieDataTable, pieOptions);
      });
    };

    /**
     * Renders a column chart using Google Charts.
     * @param {HTMLElement} targetElement - The DOM element.
     * @param {Array<object>} seriesData - Chart data.
     * @param {object} chartOptions - Options.
     */
    drawBarColumnChart = function(targetElement, seriesData, chartOptions) {
      ensureGoogleChartsReady(function() {
        const currentOptions = googleChartsOptionAdapter(seriesData, chartOptions);
        const chartDataTable = assembleGoogleDataTable(seriesData, "string");
        const columnChart = new google.visualization.ColumnChart(targetElement);
        columnChart.draw(chartDataTable, currentOptions);
      });
    };

  } else { // No supported chart library found.
    // Assign a fallback function that throws an error.
    drawLinePlot = drawPieSliceChart = drawBarColumnChart = function() {
      throw new Error("Charting library (Google Charts or Highcharts) not detected. Please ensure one is loaded.");
    };
  }

  // --- Utility functions for DOM manipulation and data fetching ---

  /**
   * Sets the text content of a DOM element, handling browser compatibility.
   * @param {HTMLElement} domElement - The target DOM element.
   * @param {string} newTextContent - The text to set.
   */
  function updateElementText(domElement, newTextContent) {
    if (domElement.innerText !== undefined) { // Check for innerText support.
      domElement.innerText = newTextContent;
    } else { // Fallback for older browsers (e.g., Firefox before 45 for innerText).
      domElement.textContent = newTextContent;
    }
  }

  /**
   * Displays an error message within a chart's DOM element.
   * @param {HTMLElement} chartContainer - The element where the chart was supposed to render.
   * @param {string} errorMessage - The error message to display.
   */
  function displayChartError(chartContainer, errorMessage) {
    updateElementText(chartContainer, "Chart Render Issue: " + errorMessage);
    chartContainer.style.color = "#FF3333"; // Set text color to red.
    chartContainer.style.backgroundColor = "#FFF0F0"; // Light red background.
    chartContainer.style.padding = "10px";
    chartContainer.style.border = "1px solid #FF3333";
    chartContainer.style.textAlign = "center";
  }

  /**
   * Fetches JSON data from a given URL using jQuery AJAX.
   * @param {HTMLElement} domTarget - The element associated with the chart (for error reporting).
   * @param {string} dataUrl - The URL to fetch JSON from.
   * @param {function} successHandler - Callback for successful data retrieval.
   */
  function retrieveJsonData(domTarget, dataUrl, successHandler) {
    // Ensure jQuery is available for AJAX requests.
    if (typeof jQuery === 'undefined' || !jQuery.ajax) {
        displayChartError(domTarget, "jQuery is required for AJAX data fetching but not found.");
        return;
    }

    jQuery.ajax({
      dataType: "json",
      url: dataUrl,
      success: successHandler,
      error: function(jqXHR, textStatus, errorThrown) {
        // Extract meaningful error message.
        const errorMsg = (typeof errorThrown === "string") ? errorThrown : (errorThrown && errorThrown.message ? errorThrown.message : "Unknown error");
        displayChartError(domTarget, `Failed to load data: ${errorMsg} (Status: ${textStatus})`);
      }
    });
  }

  /**
   * Catches errors during chart rendering and displays them.
   * @param {HTMLElement} chartElement - The DOM element for the chart.
   * @param {any} chartData - The data to be passed to the renderer.
   * @param {object} chartOptions - The options for the chart.
   * @param {function} renderFunction - The actual chart rendering function.
   */
  function safelyRenderChart(chartElement, chartData, chartOptions, renderFunction) {
    try {
      renderFunction(chartElement, chartData, chartOptions);
    } catch (renderError) {
      displayChartError(chartElement, renderError.message);
      console.error("Chart rendering error:", renderError); // Log error for debugging.
      throw renderError; // Re-throw to prevent silent failures.
    }
  }

  /**
   * Handles fetching data for a chart, either from a URL or directly from an object.
   * @param {HTMLElement} chartElement - The DOM element.
   * @param {string|object} sourceData - URL string or direct data object.
   * @param {object} chartOptions - Options for the chart.
   * @param {function} renderCallback - The function to call once data is ready.
   */
  function fetchDataAndRender(chartElement, sourceData, chartOptions, renderCallback) {
    if (typeof sourceData === "string") {
      // If data source is a URL, fetch JSON.
      retrieveJsonData(chartElement, sourceData, function(fetchedData) {
        safelyRenderChart(chartElement, fetchedData, chartOptions, renderCallback);
      });
    } else {
      // Otherwise, assume data is directly provided.
      safelyRenderChart(chartElement, sourceData, chartOptions, renderCallback);
    }
  }

  // --- Data Type Conversion Functions ---

  /**
   * Converts any value to its string representation.
   * @param {any} value - The input value.
   * @returns {string} The string representation.
   */
  function convertToString(value) {
    return String(value);
  }

  /**
   * Converts any value to a floating-point number.
   * @param {any} value - The input value.
   * @returns {number} The floating-point number.
   */
  function convertToFloat(value) {
    return parseFloat(value);
  }

  /**
   * Converts a value to a Date object. Handles numbers (Unix timestamp in seconds)
   * and various string formats (tries ISO 8601, then native Date parsing).
   * @param {any} value - The input value.
   * @returns {Date} A Date object.
   */
  function convertToDate(value) {
    if (value instanceof Date) {
      return value; // Already a Date.
    }

    if (typeof value === "number") {
      return new Date(value * 1000); // Assume Unix timestamp in seconds.
    }

    if (typeof value === "string") {
      // Attempt ISO 8601 parsing first for robust handling.
      // Normalize common non-ISO separators to ISO format for better parsing.
      const cleanedStr = value
        .replace(/(\s)UTC(\s|$)/i, 'Z') // Handle "UTC" abbreviation
        .replace(/(\s)(?=\d{2}:\d{2}:\d{2})/i, 'T') // Replace space before time with 'T'
        .trim();

      const isoDate = extractIsoDate(cleanedStr);
      if (isoDate) {
        return isoDate;
      }

      // Fallback to native Date parsing if ISO fails.
      const nativeDate = new Date(value);
      if (!isNaN(nativeDate.getTime())) { // Check if native parsing resulted in a valid date.
          return nativeDate;
      }
    }
    // If all attempts fail, return an invalid Date object or throw error.
    console.warn("Could not convert value to Date:", value);
    return new Date(NaN);
  }

  /**
   * Converts an object or non-array value into an array of [key, value] pairs.
   * If already an array, it is returned as-is.
   * @param {any} inputData - The data to convert.
   * @returns {Array<Array>} An array of [key, value] pairs.
   */
  function ensureArrayFormat(inputData) {
    if (isInputAnArray(inputData)) {
      return inputData; // Already in the desired array format.
    }

    if (isJustAnObject(inputData)) {
      // Convert object properties into an array of [key, value] pairs.
      return Object.keys(inputData).map(function(propKey) {
        return [propKey, inputData[propKey]];
      });
    }

    // If it's a primitive or unexpected type, wrap it as a single data point.
    console.warn("Input data was not an array or object, treating as single series point.", inputData);
    return [["Value", inputData]];
  }

  // --- Data Processing and Transformation ---

  /**
   * Comparator function for sorting data points by their timestamp.
   * @param {Array<any>} pointA - First data point [date, value].
   * @param {Array<any>} pointB - Second data point [date, value].
   * @returns {number} Comparison result.
   */
  function compareByTimestamp(pointA, pointB) {
    // Ensure both points have valid Date objects as their first element.
    const timeA = pointA[0] instanceof Date ? pointA[0].getTime() : NaN;
    const timeB = pointB[0] instanceof Date ? pointB[0].getTime() : NaN;

    // Handle invalid dates by pushing them to the end or beginning.
    if (isNaN(timeA) && isNaN(timeB)) return 0;
    if (isNaN(timeA)) return 1;
    if (isNaN(timeB)) return -1;

    return timeA - timeB;
  }

  /**
   * Processes and normalizes chart series data.
   * Ensures data is in the correct format for charting libraries and applies type conversions.
   * @param {Array<object>|object} rawSeriesData - The input series data.
   * @param {object} chartSettings - Chart configuration options.
   * @param {boolean} isTimeBased - True if the X-axis represents time, false for categories.
   * @returns {Array<object>} Processed series data.
   */
  function normalizeChartSeries(rawSeriesData, chartSettings, isTimeBased) {
    let finalSeries = rawSeriesData;
    let singleSeriesMode = false;

    // Determine if input is a single series or multiple.
    if (!isInputAnArray(rawSeriesData) || !isJustAnObject(rawSeriesData[0]) || isInputAnArray(rawSeriesData[0])) {
      // If it's not an array of objects (e.g., [{name:..,data:..}]), assume single series.
      finalSeries = [{
        name: "Data Set",
        data: rawSeriesData
      }];
      singleSeriesMode = true;
    } else {
        // If it's an array of objects, but some don't have a 'name' property, provide a default.
        finalSeries = finalSeries.map((s, idx) => ({
            name: s.name || `Series ${idx + 1}`,
            data: s.data
        }));
    }

    // If it's a single series, hide the legend by default.
    if (singleSeriesMode) {
      chartSettings.hideLegend = true;
    }

    // Iterate through each series to normalize its data points.
    finalSeries.forEach(function(seriesItem) {
      let transformedPoints = [];
      const originalPoints = ensureArrayFormat(seriesItem.data);

      originalPoints.forEach(function(dataPoint) {
        const key = isTimeBased ? convertToDate(dataPoint[0]) : convertToString(dataPoint[0]);
        const val = convertToFloat(dataPoint[1]);
        transformedPoints.push([key, val]);
      });

      // Sort time-based data chronologically.
      if (isTimeBased) {
        transformedPoints.sort(compareByTimestamp);
      }

      seriesItem.data = transformedPoints;
    });

    return finalSeries;
  }

  // --- Public API for Chartkick-like functionality ---

  // Export functions to the global scope (window object).
  window.VisualDataGen = {
    lineChart: function(element, dataSource, options = {}) {
      const processedSeries = normalizeChartSeries(dataSource, options, true);
      fetchDataAndRender(element, processedSeries, options, drawLinePlot);
    },
    pieChart: function(element, dataSource, options = {}) {
      // Pie charts typically don't use time-based axes.
      const processedSeries = normalizeChartSeries(dataSource, options, false);
      // For pie charts, we often need data as a simple array of [label, value] pairs.
      // If `processedSeries` is [{name: "Data Set", data: [["A",10], ["B",20]]}],
      // we extract just the inner data array.
      const pieData = processedSeries.length > 0 ? processedSeries[0].data : [];
      fetchDataAndRender(element, pieData, options, drawPieSliceChart);
    },
    columnChart: function(element, dataSource, options = {}) {
      // Column charts are usually categorical, not time-based.
      const processedSeries = normalizeChartSeries(dataSource, options, false);
      fetchDataAndRender(element, processedSeries, options, drawBarColumnChart);
    },
    // Expose helpers for debugging/advanced use if needed
    _helpers: {
        isInputAnArray,
        isJustAnObject,
        deepObjectMerge,
        createMergedObject,
        extractIsoDate,
        hasAnyNegativeValues,
        createChartOptionGenerator,
        updateElementText,
        displayChartError,
        retrieveJsonData,
        safelyRenderChart,
        fetchDataAndRender,
        convertToString,
        convertToFloat,
        convertToDate,
        ensureArrayFormat,
        compareByTimestamp,
        normalizeChartSeries
    }
  };

})();