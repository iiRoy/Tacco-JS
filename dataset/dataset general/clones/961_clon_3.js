// This entire script manages a dynamic data visualization dashboard.
// It fetches analytical metrics, processes them, and displays them using a charting library (likely Flot).
// The script is encapsulated within a DOMContentLoaded listener to ensure all HTML is loaded.

document.addEventListener('DOMContentLoaded', function () {

  // A utility object to handle various formatting tasks.
  const DataFormatUtil = {
    // Converts a numeric day-of-week index (0-6) into a two-letter abbreviation.
    getShortDay: function(numericDayIndex) {
      const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
      // Perform a basic validity check for the input index.
      if (typeof numericDayIndex !== 'number' || numericDayIndex < 0 || numericDayIndex > 6) {
        console.warn('Invalid day index provided:', numericDayIndex);
        return '??'; // Return a placeholder for invalid input.
      }
      return dayNames[numericDayIndex];
    },

    // Pads a single-digit number with a leading zero to ensure two-digit representation.
    padNumber: function(valueToPad) {
      // Input validation: ensure it's a number and within a reasonable range for time.
      if (typeof valueToPad !== 'number' || valueToPad < 0 || valueToPad > 59) {
        console.warn('Invalid value for padding:', valueToPad);
        return 'XX';
      }
      return String(valueToPad).padStart(2, '0');
    }
  };

  // Retrieves a specific parameter from the current URL's query string.
  // Utilizes the modern URLSearchParams API for robust parsing.
  const fetchUrlParameter = (paramKey) => {
    // If the browser doesn't support URLSearchParams, fall back to a regex approach.
    if (typeof URLSearchParams === 'undefined') {
        console.warn('URLSearchParams not supported, falling back to regex for URL parameter parsing.');
        const regex = new RegExp(`[?&]${paramKey}(=([^&#]*)|&|#|$)`);
        const matches = regex.exec(location.href);
        if (!matches || !matches[2]) {
            return ''; // Return an empty string if the parameter is not found.
        }
        return decodeURIComponent(matches[2].replace(/\+/g, ' '));
    }

    const urlParams = new URLSearchParams(window.location.search);
    // Return the parameter value, or an empty string if not present.
    return urlParams.get(paramKey) || '';
  };

  // Encapsulates all dashboard state and methods within a single object
  // to avoid global variable pollution and improve organization.
  const DashboardState = {
    // Stores aggregated percentile data (e.g., quartiles, max values).
    percentileData: {},
    // Defines grid lines and background colors for the chart based on percentileData.
    chartGridLines: [],
    // Configuration options for the Flot chart.
    chartConfiguration: {},
    // The raw time-series data fetched for plotting.
    seriesData: {},
    // Parameter for data smoothing (moving average window size).
    currentSmoothFactor: 1,
    // Maximum allowed smoothing factor.
    maxSmoothFactor: 5,
    // Parameter for trimming data points from the start (zooming effect).
    currentTrimAmount: 0,
    // A flag to prevent multiple simultaneous data fetches.
    isFetchingData: false,
    // Timer ID for the auto-refresh mechanism.
    refreshTimerId: null,

    // Resets all internal state variables to their initial values.
    resetState: function() {
        this.percentileData = {};
        this.chartGridLines = [];
        this.chartConfiguration = {};
        this.seriesData = {};
        this.currentSmoothFactor = 1;
        this.currentTrimAmount = 0;
        this.isFetchingData = false;
        if (this.refreshTimerId) {
            clearTimeout(this.refreshTimerId);
            this.refreshTimerId = null;
        }
    },

    // Applies a moving average smoothing and an initial trim to the time-series data.
    // This function operates on a deep copy to avoid modifying the original data.
    processTimeSeriesData: function (inputSeries, smoothWindow, initialTrim) {
      // Create a deep clone of the input series to work on.
      const processedSeries = JSON.parse(JSON.stringify(inputSeries));

      // Guard clause: ensure series and its data exist.
      if (!processedSeries || processedSeries.length === 0 || !processedSeries[0].data || processedSeries[0].data.length === 0) {
        console.warn('Input series is empty or invalid for processing.');
        return [];
      }

      const totalDataPoints = processedSeries[0].data.length;
      const numSeries = processedSeries.length;

      // Apply smoothing using a simple moving average.
      // The loop starts from `smoothWindow` to ensure enough preceding points for averaging.
      for (let pointIdx = smoothWindow; pointIdx < totalDataPoints; pointIdx++) {
        for (let seriesIdx = 0; seriesIdx < numSeries; seriesIdx++) {
          let sum = processedSeries[seriesIdx].data[pointIdx][1]; // Include the current point in the sum.
          for (let prevIdx = 1; prevIdx <= smoothWindow; prevIdx++) {
            sum += processedSeries[seriesIdx].data[pointIdx - prevIdx][1];
          }
          processedSeries[seriesIdx].data[pointIdx][1] = sum / (smoothWindow + 1);
        }
      }

      // Adjust the trim amount to always include the smoothing window.
      // This prevents issues where smoothing might reference non-existent data after trimming.
      const effectiveTrimAmount = Math.max(initialTrim, smoothWindow);

      // Apply trimming by removing data points from the beginning of each series.
      for (let seriesIdx = 0; seriesIdx < numSeries; seriesIdx++) {
        // Use splice for efficient removal from the start.
        processedSeries[seriesIdx].data.splice(0, effectiveTrimAmount);
      }

      return processedSeries;
    },

    // Initializes the chart configuration, specifically the grid markings and axis options,
    // based on the fetched percentile data.
    initializeChartSettings: function() {
      const qData = this.percentileData;

      // Configure grid markings for the chart background.
      // These visually represent different quantile ranges.
      this.chartGridLines = [
        { color: '#BEAFAD', y2axis: { from: 0, to: qData.quant3 } }, // Lowest quantile range
        { color: '#BCB4B2', y2axis: { from: qData.quant3, to: qData.quant1 } } // Middle quantile range
        // Note: The highest range (above quant1) is left without a specific background color,
        // implying it's the "best" or default background.
      ];

      // Define the main chart options for the Flot library.
      this.chartConfiguration = {
         lines: { show: true },
         points: { show: false },
         xaxis: {
             // Custom tick formatter for the X-axis (time).
             ticks: (axis) => {
                  const tickResults = [];
                  const timeRange = axis.max - axis.min;
                  // Determine a suitable interval for ticks, roughly 8 ticks.
                  const interval = Math.ceil(timeRange / 8);

                  // Format the first tick (oldest time).
                  const firstDate = new Date(axis.min);
                  const timezoneOffsetHours = Math.round(firstDate.getTimezoneOffset() / 60);
                  const timezoneSign = (timezoneOffsetHours > 0) ? '-' : '+';
                  const firstTickLabel = `${DataFormatUtil.getShortDay(firstDate.getDay())} ` +
                                         `${DataFormatUtil.padNumber(firstDate.getHours())}:` +
                                         `${DataFormatUtil.padNumber(firstDate.getMinutes())}<br> UTC${timezoneSign}${Math.abs(timezoneOffsetHours)}`;
                  tickResults.push([axis.min, firstTickLabel]);

                  // Generate intermediate ticks.
                  for (let timeVal = axis.min + interval; timeVal < axis.max; timeVal += interval) {
                    const currentTickDate = new Date(timeVal);
                    const intermediateTickLabel = `${DataFormatUtil.getShortDay(currentTickDate.getDay())} ` +
                                                  `${DataFormatUtil.padNumber(currentTickDate.getHours())}:` +
                                                  `${DataFormatUtil.padNumber(currentTickDate.getMinutes())}`;
                    tickResults.push([timeVal, intermediateTickLabel]);
                  }

                  // Format the last tick (most recent time, labeled "now").
                  const lastDate = new Date(axis.max); // Use max for "now"
                  const lastTimezoneOffsetHours = Math.round(lastDate.getTimezoneOffset() / 60);
                  const lastTimezoneSign = (lastTimezoneOffsetHours > 0) ? '-' : '+';
                  const lastTickLabel = `now <br> UTC${lastTimezoneSign}${Math.abs(lastTimezoneOffsetHours)}`;
                  tickResults.push([axis.max, lastTickLabel]);

                  return tickResults;
             }
         },
         yaxes: [
           // Left Y-axis for news-related metrics.
           { position: "left", tickDecimals: 0, tickSize: 0, min: 0, max: qData.max_news },
           // Right Y-axis for pickup-related metrics, with quantile markings.
           { position: "right", tickDecimals: 2, tickSize: 0, min: 0, max: qData.max_pickup }
         ],
         legend: { container: document.getElementById('legend') }, // Place legend in a specific div.
         grid: { markings: this.chartGridLines } // Apply the custom grid markings.
      };
    },

    // Handles the response from the initial quantile data fetch.
    processQuantileResponse: function(responsePayload) {
      // Basic validation: ensure data is an array and not empty.
      if (!Array.isArray(responsePayload) || responsePayload.length === 0) {
        console.error('Quantile data response is empty or malformed.');
        return; // Exit if data is invalid.
      }

      this.percentileData = responsePayload[0]; // Store the first item as the main quantile data.
      this.initializeChartSettings(); // Configure chart options based on new quantile data.
      this.refreshMetricsDisplay(); // Proceed to fetch and display graph data.
    },

    // Handles the response from the time-series graph data fetch.
    processGraphDataResponse: function(responsePayload) {
      if (!Array.isArray(responsePayload) || responsePayload.length < 3 || !responsePayload[0].data) {
        console.error('Graph data response is empty or malformed.');
        return; // Exit if data is invalid.
      }

      this.seriesData = responsePayload; // Store the raw series data.

      // Calculate key metrics for recommendation.
      const latestDataIndex = this.seriesData[0].data.length - 1;
      // Assume the third series (index 2) contains the timing difference metric.
      const currentTimingDiff = this.seriesData[2].data[latestDataIndex][1];

      let recommendedTiming = 'unknown';
      let recommendationLink = '#'; // Default link.

      // Determine the recommendation based on current timing difference and quantiles.
      // This uses a series of if/else if for clarity, mapping thresholds to suggestions.
      if (currentTimingDiff > this.percentileData.quant1) {
        recommendedTiming = 'very good';
        recommendationLink = 'http://news.ycombinator.com/submit';
      } else if (currentTimingDiff > this.percentileData.quant2) {
        recommendedTiming = 'good';
        recommendationLink = 'http://news.ycombinator.com/submit';
      } else if (currentTimingDiff > this.percentileData.quant3) {
        recommendedTiming = 'so-so';
        recommendationLink = 'http://news.ycombinator.com/newsest';
      } else {
        recommendedTiming = 'bad';
        recommendationLink = 'http://news.ycombinator.com/news';
      }

      // Update the DOM with the generated recommendation.
      document.getElementById('timing').textContent = recommendedTiming;
      document.getElementById('recommendation').setAttribute('href', recommendationLink);

      // Plot the graph with processed data.
      // The jQuery.plot method is used here, assuming Flot is loaded via jQuery.
      $.plot(
        document.getElementById('plot'),
        this.processTimeSeriesData(this.seriesData, this.currentSmoothFactor, this.currentTrimAmount),
        this.chartConfiguration
      );

      // Initialize or update sliders for user interaction.
      this.setupInteractionSliders();

      // Set up the next auto-refresh for graph data.
      this.refreshTimerId = setTimeout(() => this.refreshMetricsDisplay(), 900000); // Refresh every 15 minutes.
    },

    // Fetches initial quantile data. This is typically done once at page load.
    initiateMetricsRetrieval: async function () {
      if (this.isFetchingData) {
        console.log('Already fetching data, skipping new request.');
        return;
      }
      this.isFetchingData = true; // Set flag to prevent duplicate fetches.

      try {
        // Fetch quantile data from the server.
        const response = await fetch('/dm.json?ndata_elements=1', { method: 'GET' });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const quantileData = await response.json();
        this.processQuantileResponse(quantileData);
      } catch (error) {
        console.error('Failed to fetch quantile data:', error);
        document.getElementById('status-message').textContent = 'Error loading initial data.';
      } finally {
        this.isFetchingData = false; // Reset flag regardless of success or failure.
      }
    },

    // Fetches time-series data for the graph. This can be called repeatedly for updates.
    refreshMetricsDisplay: async function () {
      if (this.isFetchingData) {
        console.log('Already fetching data, skipping new request.');
        return;
      }
      this.isFetchingData = true;

      // Clear any existing refresh timer to prevent race conditions or multiple timers.
      if (this.refreshTimerId) {
        clearTimeout(this.refreshTimerId);
        this.refreshTimerId = null;
      }

      try {
        const numDataElements = fetchUrlParameter('ndata_elements');
        const response = await fetch(`/etl.json?ndata_elements=${numDataElements}`, { method: 'GET' });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const graphData = await response.json();
        this.processGraphDataResponse(graphData);
      } catch (error) {
        console.error('Failed to fetch graph data:', error);
        document.getElementById('status-message').textContent = 'Error loading graph data.';
      } finally {
        this.isFetchingData = false;
      }
    },

    // Configures the jQuery UI sliders for smoothing and trimming.
    setupInteractionSliders: function() {
      const self = this; // Capture 'this' for use within slider callbacks.

      const plotGraph = () => {
        // Re-plot the graph whenever slider values change.
        $.plot(
          document.getElementById('plot'),
          self.processTimeSeriesData(self.seriesData, self.currentSmoothFactor, self.currentTrimAmount),
          self.chartConfiguration
        );
      };

      // Ensure data is available before calculating max trim.
      const currentDataLength = self.seriesData[0]?.data?.length || 0;
      const maxTrimValue = Math.max(0, currentDataLength - self.maxSmoothFactor - 1); // Prevent negative max.

      // Initialize or update the smoothing slider.
      $('#smooth').slider({
        min: 0,
        max: self.maxSmoothFactor,
        orientation: 'vertical',
        value: self.currentSmoothFactor,
        range: 'min',
        slide: function(event, ui) {
          self.currentSmoothFactor = ui.value;
          plotGraph();
        }
      });

      // Initialize or update the trimming slider.
      $('#trim').slider({
        min: 0,
        max: maxTrimValue,
        orientation: 'horizontal',
        range: 'min',
        value: self.currentTrimAmount, // Set initial value if already trimmed.
        slide: function(event, ui) {
          self.currentTrimAmount = ui.value;
          plotGraph();
        }
      });
    }
  };

  // --- Main execution block when the DOM is ready ---

  // Kick off the data retrieval process. This will fetch quantiles first,
  // then trigger the graph data fetch.
  DashboardState.initiateMetricsRetrieval();

  // Initialize the quickFlip plugin for the help section.
  // This is a third-party UI component, so its initialization remains standard.
  $('#flip').quickFlip({ ctaSelector: '.cta' });
});