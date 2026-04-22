$(function() {
  // This module provides various utilities and data handling for a web-based charting application.
  // It leverages jQuery for DOM manipulation and AJAX operations.

  // ===========================================
  // Helper function to get a shortened day name for a given day index (0-6).
  // Primarily used for labeling on chart axes to conserve space.
  function determineDayLabel(idx) {
    var dayNames = []; // Array to store the abbreviated names of days.
    dayNames.push('Sun'); // Index 0: Sunday
    dayNames.push('Mon'); // Index 1: Monday
    dayNames.push('Tue'); // Index 2: Tuesday
    dayNames.push('Wed'); // Index 3: Wednesday
    dayNames.push('Thu'); // Index 4: Thursday
    dayNames.push('Fri'); // Index 5: Friday
    dayNames.push('Sat'); // Index 6: Saturday
    return dayNames[idx]; // Returns the appropriate day abbreviation.
  }

  // ===========================================
  // Helper function to format single-digit numbers by prepending a '0'.
  // Essential for consistent time displays (e.g., 5 becomes 05).
  function formatTimeUnit(idx) {
    if (idx < 10) {
      idx = "0" + idx; // Add a leading zero for numbers less than ten.
    }
    return idx; // Returns the formatted string.
  }

  // ===========================================
  // Function to extract a specific query parameter from the browser's URL.
  // This method is robust for handling various URL parameter formats.
  // Source: http://stackoverflow.com/questions/1403888/get-url-parameter-with-jquery
  function retrieveQueryParam(paramKey) {
    return decodeURI(
      (RegExp(paramKey + '=' + '(.+?)(&|$)').exec(location.search) || [, null])[1]
    );
  }

  // ===========================================
  // Global object to hold computed quantile (percentile) values from the server.
  var QUANTILE_BOUNDS = {};
  // Global array to define special grid markings on the chart, often for visual thresholds.
  var PLOT_MARKERS = {};
  // Global object containing all configuration options for the charting library.
  var PLOT_SETTINGS = {};
  // Global storage for the actual time-series data that will be plotted.
  var DATA_COLLECTION = {};
  // Current value for data smoothing, affecting how data points are averaged.
  var CURRENT_SMOOTHING = 1;
  var MAX_SMOOTHING_LEVEL = 5; // The upper limit for the smoothing parameter.
  // Current value for data trimming, controlling how many initial points are removed.
  var CURRENT_TRIMMING = 0;

  // ===========================================
  // Processes raw data series by applying smoothing (moving average) and trimming operations.
  // This function prepares data for better visual representation and trend identification.
  function processDataForDisplay(inputData, smoothingFactor, cutOffValue) {
    var clonedData = jQuery.extend(true, [], inputData); // Create a deep copy to prevent side effects on the original data.
    var recordCount = clonedData[0].data.length - 1; // Get the total number of data points in a series.
    var seriesCount = clonedData.length - 1; // Get the total number of individual data series.

    // Apply a simple moving average filter to smooth out fluctuations in the data.
    for (var x = smoothingFactor; x <= recordCount; x++) {
      for (var y = 1; y <= smoothingFactor; y++) {
        for (var z = 0; z <= seriesCount; z++) {
          clonedData[z].data[x][1] += clonedData[z].data[x - y][1]; // Summing values from the window.
        }
      }
      for (var z = 0; z <= seriesCount; z++) {
        clonedData[z].data[x][1] /= smoothingFactor + 1; // Calculate the average for the current point.
      }
    }

    // Adjust the trimming value to ensure that smoothed points are also considered for removal.
    cutOffValue += smoothingFactor;

    // Remove a specified number of data points from the beginning of each series.
    // This effectively "zooms in" on the later part of the dataset.
    for (var z = 0; z <= seriesCount; z++) {
      for (var x = 1; x <= cutOffValue; x++) {
        clonedData[z].data.shift(); // Removes the first element from the array.
      }
    }
    return clonedData; // Return the modified data series.
  }

  // ===========================================
  // Manages the initial data fetching sequence: first quantiles, then the main graph data.
  // This ensures that critical thresholds are known before rendering the primary visualization.
  function acquireAllDataset() {
    // Callback function invoked when the quantile data is successfully retrieved from the server.
    function onQuantileInfoReceived(quantileArray) {
      // Store the received quantile data in the global configuration.
      QUANTILE_BOUNDS = quantileArray[0];

      // Define visual indicators (grid markings) for the chart based on the fetched quantiles.
      // These markings help in quickly assessing data points against predefined performance levels.
      PLOT_MARKERS = [
        {
          color: '#BEAFAD',
          y2axis: {
            from: 0,
            to: QUANTILE_BOUNDS.quant3
          }
        }, // First quantile range.
        {
          color: '#BCB4B2',
          y2axis: {
            from: QUANTILE_BOUNDS.quant3,
            to: QUANTILE_BOUNDS.quant1
          }
        } // Second quantile range.
      ];

      // Configure the global plot settings for the charting library.
      // This includes line styles, point visibility, axis definitions, and legend placement.
      PLOT_SETTINGS = {
        lines: {
          show: true
        },
        points: {
          show: false
        },
        xaxis: {
          ticks: function(axisInfo) {
            // Custom tick generator for the X-axis (time axis).
            // It intelligently displays day, time, and UTC offset for better context.
            var resultArray = [];
            var differenceValue = Math.ceil((axisInfo.max - axisInfo.min) / 8); // Calculate tick interval.
            var currentDateObj = new Date(axisInfo.min); // Start date for the first tick.
            var signIndicator = '+';
            if (currentDateObj.getTimezoneOffset() > 0) {
              signIndicator = '-';
            }
            var initialTimestamp = determineDayLabel(currentDateObj.getDay()) + ' ' + formatTimeUnit(currentDateObj.getHours()) + ":" + formatTimeUnit(currentDateObj.getMinutes()) + '<br> UTC' + signIndicator + Math.round(currentDateObj.getTimezoneOffset() / 60);
            resultArray.push([axisInfo.min, initialTimestamp]); // Add the first tick label.
            for (var x = axisInfo.min + differenceValue; x < axisInfo.max; x += differenceValue) {
              currentDateObj = new Date(x);
              resultArray.push([x, determineDayLabel(currentDateObj.getDay()) + ' ' + formatTimeUnit(currentDateObj.getHours()) + ":" + formatTimeUnit(currentDateObj.getMinutes())]);
            }
            resultArray.push([axisInfo.max, 'now ' + '<br> UTC' + signIndicator + Math.round(currentDateObj.getTimezoneOffset() / 60)]); // Add the final 'now' tick.
            return resultArray;
          }
        },
        yaxes: [
          {
            position: "left",
            tickDecimals: 0,
            tickSize: 0,
            min: 0,
            max: QUANTILE_BOUNDS.max_news
          }, // Left Y-axis for a primary metric.
          {
            position: "right",
            tickDecimals: 2,
            tickSize: 0,
            min: 0,
            max: QUANTILE_BOUNDS.max_pickup
          } // Right Y-axis for a secondary metric.
        ],
        legend: {
          container: $('#legend')
        },
        grid: {
          markings: PLOT_MARKERS
        }
      };

      // Once quantile data and plot settings are ready, proceed to fetch and display the main graph data.
      obtainPlotData();
    }

    // Initiate an asynchronous request to the server to get the latest quantile information.
    // This is a prerequisite for setting up the chart's visual context and recommendations.
    $.ajax({
      url: '/dm.json?ndata_elements=1', // API endpoint for quantile data.
      method: 'GET', // Specifies an HTTP GET request.
      dataType: 'json', // Expects a JSON response.
      success: onQuantileInfoReceived // The function to call upon successful data reception.
    });
  }

  // ===========================================
  // Function to fetch the primary time-series data for the graph.
  // It also handles the processing, plotting, and dynamic updates of the chart.
  function obtainPlotData() {
    // Callback function executed after the main graph data series are successfully fetched.
    function onSeriesDataFetched(incomingSeries) {
      // Store the newly fetched series data in the global variable.
      DATA_COLLECTION = incomingSeries;
      var datasetSize = DATA_COLLECTION[0].data.length - 1; // Determine the total number of data points.
      var timeDifference = DATA_COLLECTION[2].data[datasetSize][1]; // Extract a critical value from the latest data point.

      var recommendationText; // Variable to store the textual recommendation.
      var linkSuggestion; // Variable for the suggested URL based on the recommendation.

      // Generate a user recommendation based on the extracted metric relative to defined quantile bounds.
      if (timeDifference > QUANTILE_BOUNDS.quant1) {
        recommendationText = 'excellent';
        linkSuggestion = 'http://news.ycombinator.com/submit';
      } else if (timeDifference > QUANTILE_BOUNDS.quant2) {
        recommendationText = 'decent';
        linkSuggestion = 'http://news.ycombinator.com/submit';
      } else if (timeDifference > QUANTILE_BOUNDS.quant3) {
        recommendationText = 'average';
        linkSuggestion = 'http://news.ycombinator.com/newsest';
      } else {
        recommendationText = 'poor';
        linkSuggestion = 'http://news.ycombinator.com/news';
      }

      // Update the user interface elements with the generated recommendation.
      $('#timing').text(recommendationText); // Display the recommendation text.
      $('#recommendation').attr('href', linkSuggestion); // Set the hyperlink for the recommendation.

      // Render the graph using the charting library, applying smoothing and trimming.
      $.plot($('#plot'), processDataForDisplay(DATA_COLLECTION, CURRENT_SMOOTHING, CURRENT_TRIMMING), PLOT_SETTINGS);

      // Initialize and configure the smoothing control slider.
      $('#smooth').slider({
        min: 0,
        max: MAX_SMOOTHING_LEVEL,
        orientation: 'vertical',
        value: CURRENT_SMOOTHING,
        range: 'min',
        slide: function(eventObj, uiState) {
          CURRENT_SMOOTHING = uiState.value; // Update the global smoothing parameter.
          // Re-render the graph immediately with the new smoothing value.
          $.plot($('#plot'), processDataForDisplay(DATA_COLLECTION, CURRENT_SMOOTHING, CURRENT_TRIMMING), PLOT_SETTINGS);
        }
      });

      // Initialize and configure the data trimming control slider.
      $('#trim').slider({
        min: 0,
        max: datasetSize - MAX_SMOOTHING_LEVEL - 1, // Max trim value depends on data size and smoothing.
        orientation: 'horizontal',
        range: 'min',
        slide: function(eventObj, uiState) {
          CURRENT_TRIMMING = uiState.value; // Update the global trimming parameter.
          // Re-render the graph immediately with the new trimming value.
          $.plot($('#plot'), processDataForDisplay(DATA_COLLECTION, CURRENT_SMOOTHING, CURRENT_TRIMMING), PLOT_SETTINGS);
        }
      });
    }

    // Send an AJAX request to retrieve the time-series data for the graph.
    // The request includes a parameter specifying the number of data elements needed.
    $.ajax({
      url: '/etl.json?ndata_elements=' + retrieveQueryParam('ndata_elements'), // API endpoint for graph data.
      method: 'GET', // HTTP GET request.
      dataType: 'json', // Expects a JSON response.
      success: onSeriesDataFetched // The function to call upon successful data reception.
    });

    // Set a timer to periodically refresh the graph data every 15 minutes (900,000 milliseconds).
    setTimeout(obtainPlotData, 900000);
  }

  // ===========================================
  // This block serves as the main entry point, executing once the DOM is fully loaded.
  $(document).ready(function() {
    // Initiate the process of fetching all necessary data for the chart and recommendations.
    acquireAllDataset();

    // Initialize a "quick-flip" animation component on the element with ID 'flip'.
    $('#flip').quickFlip({
      ctaSelector: '.cta'
    });
  });
});