/*
 * This JavaScript code demonstrates client-side data fetching and visualization.
 * It leverages jQuery for DOM manipulation and AJAX requests, and Flot for graphing.
 * The overall structure is an immediately invoked function expression (IIFE)
 * wrapped around the jQuery document ready handler.
 */
$(
  function ()
  {
    // ====================================================================
    // Utility function: Pretty Day Formatting
    // This function maps a numerical day index (0-6) to a two-letter
    // abbreviation for the day of the week, primarily intended for
    // display in graph ticks.
    // ====================================================================
    function checkDay (i)
    {
      var weekday = []; // Initialize an empty array to store weekday abbreviations.
      weekday.push('Su'); // 0: Sunday
      weekday.push('Mo'); // 1: Monday
      weekday.push('Tu'); // 2: Tuesday
      weekday.push('We'); // 3: Wednesday
      weekday.push('Th'); // 4: Thursday
      weekday.push('Fr'); // 5: Friday
      weekday.push('Sa'); // 6: Saturday
      return weekday[i];  // Return the abbreviation corresponding to the input index.
    }

    // ====================================================================
    // Utility function: Pretty Time Formatting
    // Ensures that single-digit numbers (e.g., hours, minutes) are
    // prepended with a "0" to maintain a consistent two-digit format.
    // Useful for displaying time components.
    // ====================================================================
    function checkTime(i) {
      if ( i < 10 )
      {
        i = "0" + i; // Prepend "0" if the number is less than 10.
      }
      return i;      // Return the formatted number (e.g., 5 becomes "05").
    }

    // ====================================================================
    // Utility function: Get URL Parameter
    // This function extracts the value of a specified URL query parameter.
    // It uses a regular expression to parse the `location.search` string.
    // Source: http://stackoverflow.com/questions/1403888/get-url-parameter-with-jquery
    // ====================================================================
    function getURLParameter(name)
    {
      // Construct a regular expression to find the parameter name and its value.
      // The `(.+?)` non-greedy match captures the value.
      const regex = new RegExp(name + '=' + '(.+?)(&|$)');

      // Execute the regex on the URL's query string.
      // `location.search` includes the '?' prefix.
      // If no match, it defaults to `[,null]` to avoid errors when accessing `[1]`.
      const match = (regex.exec(location.search) || [, null]);

      // Decode the URI component to handle special characters.
      return decodeURI(match[1]);
    }

    // ====================================================================
    // Global Data Storage and Configuration Variables
    // These variables hold application-wide state and settings.
    // ====================================================================

    // Stores quantile (percentile) data fetched from the server.
    var QUANTILES = {};

    // Defines special grid markings for the Flot graph,
    // often used to highlight specific data ranges.
    var MARKINGS = {};

    // Contains the configuration options for the Flot graph.
    var OPTIONS = {};

    // Stores the actual time-series data to be plotted on the graph.
    var SERIES = {};

    // Data smoothing parameter: controls the window size for moving average.
    var SMOOTH = 1;

    // Maximum allowed value for the smoothing parameter.
    var MAX_SMOOTH = 5;

    // Data trimming parameter: controls how many data points are removed
    // from the beginning of the series, effectively "zooming in".
    var TRIM = 0;

    // ====================================================================
    // Data Processing Function: smoothAndTrimSeries
    // This function takes a series of data, applies a smoothing (moving average)
    // operation, and then trims a specified number of data points from the
    // beginning. This helps in visualizing trends and "zooming" into recent data.
    // ====================================================================
    function smoothAndTrimSeries (series, smooth, trim)
    {
      // Create a deep copy of the original series to avoid modifying it directly.
      var series = jQuery.extend(true, [], series);

      // Determine the length of the data array (assuming all series have same length).
      var data_length = series[0].data.length - 1;

      // Determine the number of individual series within the main series array.
      var n_series = series.length - 1;

      // Apply Smoothing Average Window
      // This nested loop calculates a simple moving average for each data point.
      for (var i = smooth; i <= data_length; i++)
      {
        for (var j = 1; j <= smooth; j++)
        {
          for (var k = 0; k <= n_series; k++)
          {
            series[k].data[i][1] += series[k].data[i - j][1]; // Sum previous 'smooth' values.
          }
        }
        for (var k = 0; k <= n_series; k++)
        {
          series[k].data[i][1] /= (smooth + 1); // Divide by (smooth + 1) to get the average.
        }
      }

      // Apply Trimming
      // Trimming removes data points from the beginning of each series.
      // The `trim` parameter is adjusted to include the `smooth` window
      // to ensure consistency after smoothing.
      trim += smooth; // Adjust trim to account for the smoothing window.

      for (var k = 0; k <= n_series; k++)
      {
        for (var i = 1; i <= trim; i++)
        {
          series[k].data.shift(); // Remove the first element from the data array.
        }
      }

      return series; // Return the processed (smoothed and trimmed) data series.
    }

    // ====================================================================
    // Main Data Fetching Function: fetchAllData
    // This function initiates the process of fetching critical data
    // from the server, specifically quantile calculations and graph data.
    // It's designed to be called once when the page loads to set up
    // initial graph parameters and global variables.
    // ====================================================================
    function fetchAllData ()
    {
      // Inner callback function executed when quantile data is successfully received.
      function onDataReceived(quantiles)
      {
        // Store the received quantile data in the global QUANTILES variable.
        QUANTILES = quantiles[0];

        // Configure graph markings based on the fetched quantile data.
        // These markings define colored regions on the y2-axis to visually
        // represent different quantile ranges (e.g., good, average, bad).
        MARKINGS = [
          { color: '#BEAFAD', y2axis: { from: 0, to: QUANTILES.quant3 } }, // Lowest quantile range
          { color: '#BCB4B2', y2axis: { from: QUANTILES.quant3, to: QUANTILES.quant1 } } // Middle quantile range
        ];

        // Configure global graph options for Flot.
        // This includes settings for lines, points, axes, legend, and grid.
        OPTIONS = {
          lines: { show: true },  // Display data as lines.
          points: { show: false }, // Do not display individual data points.
          xaxis: {
            // Custom tick formatter for the x-axis (time axis).
            // This creates fancy ticks showing day, time, and UTC offset.
            ticks: function (axis)
            {
              var res = []; // Array to store custom tick objects.
              // Calculate a difference for tick spacing.
              var dif = Math.ceil((axis.max - axis.min) / 8);
              var d = new Date(axis.min); // Date object for the first tick.
              // Determine the sign for the UTC offset.
              var sgn = '+';
              if (d.getTimezoneOffset() > 0)
              {
                sgn = '-';
              }
              // Format the first tick label.
              var min_date = checkDay(d.getDay()) + ' ' + checkTime(d.getHours()) + ":" + checkTime(d.getMinutes()) + '<br> UTC' + sgn + Math.round(d.getTimezoneOffset() / 60);
              res.push([axis.min, min_date]); // Add the first tick.

              // Generate intermediate ticks.
              for (var i = axis.min + dif; i < axis.max; i += dif)
              {
                d = new Date(i);
                res.push([i, checkDay(d.getDay()) + ' ' + checkTime(d.getHours()) + ":" + checkTime(d.getMinutes())]);
              }
              // Format the last tick label (representing "now").
              res.push([axis.max, 'now ' + '<br> UTC' + sgn + Math.round(d.getTimezoneOffset() / 60)]);
              return res; // Return the array of custom ticks.
            }
          },
          yaxes: [
            // Configuration for the left y-axis.
            { position: "left", tickDecimals: 0, tickSize: 0, min: 0, max: QUANTILES.max_news },
            // Configuration for the right y-axis.
            { position: "right", tickDecimals: 2, tickSize: 0, min: 0, max: QUANTILES.max_pickup }
          ],
          legend: { container: $('#legend') }, // Place the legend in a specific HTML element.
          grid: { markings: MARKINGS }         // Apply the defined grid markings.
        };

        // Once quantiles and options are set, proceed to fetch the actual graph data.
        fetchGraphData();
      }

      // Initiate an AJAX request to fetch quantile data from the server.
      // This is a GET request to '/dm.json' with a parameter to get
      // only the latest quantile calculations.
      $.ajax({
        url: '/dm.json?ndata_elements=1', // Endpoint for quantile data.
        method: 'GET',                     // HTTP GET method.
        dataType: 'json',                  // Expect JSON response.
        success: onDataReceived            // Callback function on successful data retrieval.
      });
    }

    // ====================================================================
    // Graph Data Fetching Function: fetchGraphData
    // This function fetches the time-series data for the graph.
    // It processes the data, updates recommendations, plots the graph,
    // and sets up UI elements like sliders. It also schedules itself
    // to refresh periodically.
    // ====================================================================
    function fetchGraphData ()
    {
      // Inner callback function executed when graph data is successfully received.
      function onDataReceived(series)
      {
        // Store the received series data globally.
        SERIES = series;

        // Calculate the length of the data series.
        var data_length = SERIES[0].data.length - 1;

        // Extract the latest 'timing difference' value from the series.
        var timing_diff = SERIES[2].data[data_length][1];

        // Determine a recommendation based on the timing difference
        // relative to the precomputed quantiles.
        var timing_suggestion;
        var href_suggestion;

        if (timing_diff > QUANTILES.quant1)
        {
          timing_suggestion = 'very good';
          href_suggestion = 'http://news.ycombinator.com/submit';
        }
        else if (timing_diff > QUANTILES.quant2)
        {
          timing_suggestion = 'good';
          href_suggestion = 'http://news.ycombinator.com/submit';
        }
        else if (timing_diff > QUANTILES.quant3)
        {
          timing_suggestion = 'so-so';
          href_suggestion = 'http://news.ycombinator.com/newsest';
        }
        else
        {
          timing_suggestion = 'bad';
          href_suggestion = 'http://news.ycombinator.com/news';
        }

        // Update the HTML elements with the generated recommendation.
        $('#timing').text(timing_suggestion);
        $('#recommendation').attr('href', href_suggestion);

        // Plot the graph using Flot.
        // The data is first smoothed and trimmed using the global SMOOTH and TRIM parameters.
        $.plot($('#plot'), smoothAndTrimSeries(SERIES, SMOOTH, TRIM), OPTIONS);

        // Initialize or update the smoothing slider.
        // On slide, it updates the global SMOOTH parameter and redraws the graph.
        $('#smooth').slider({
          min: 0,
          max: MAX_SMOOTH,
          orientation: 'vertical',
          value: SMOOTH,
          range: 'min',
          slide: function (e, ui)
          {
            SMOOTH = ui.value;
            $.plot($('#plot'), smoothAndTrimSeries(SERIES, SMOOTH, TRIM), OPTIONS);
          }
        });

        // Initialize or update the trimming slider.
        // On slide, it updates the global TRIM parameter and redraws the graph.
        $('#trim').slider({
          min: 0,
          max: data_length - MAX_SMOOTH - 1, // Max trim depends on data length and max smooth.
          orientation: 'horizontal',
          range: 'min',
          slide: function (e, ui)
          {
            TRIM = ui.value;
            $.plot($('#plot'), smoothAndTrimSeries(SERIES, SMOOTH, TRIM), OPTIONS);
          }
        });
      }

      // Initiate an AJAX request to fetch graph data from the server.
      // The 'ndata_elements' parameter is retrieved from the URL.
      $.ajax({
        url: '/etl.json?ndata_elements=' + getURLParameter('ndata_elements'), // Endpoint for graph data.
        method: 'GET',                                                          // HTTP GET method.
        dataType: 'json',                                                       // Expect JSON response.
        success: onDataReceived                                                 // Callback function on success.
      });

      // Schedule the next data fetch after a delay (15 minutes = 900,000 ms).
      // This ensures the graph data is periodically refreshed.
      setTimeout(fetchGraphData, 900000);
    }

    // ====================================================================
    // Document Ready Handler
    // This block of code executes once the entire DOM is loaded and ready.
    // It initializes the application by fetching data and setting up UI components.
    // ====================================================================
    $(document).ready(function ()
    {
      // Begin the process of fetching all necessary data (quantiles and graph data).
      fetchAllData();

      // Initialize the 'quickFlip' plugin for the element with ID 'flip'.
      // This is often used for interactive UI elements like help sections.
      $('#flip').quickFlip({ ctaSelector: '.cta' });
    });
  }
);