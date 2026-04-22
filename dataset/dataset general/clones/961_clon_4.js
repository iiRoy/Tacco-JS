// This script orchestrates data acquisition, processing, and visualization within the web application.

document.addEventListener('DOMContentLoaded', function() {

  // --- Core Utility Modules for Data Transformations ---

  // A mapping for numerical day indices to their abbreviated string representations.
  const weekSpanIdentifiers = new Map([
    [0, 'Sun'], [1, 'Mon'], [2, 'Tue'], [3, 'Wed'], [4, 'Thu'], [5, 'Fri'], [6, 'Sat']
  ]);
  function resolveDayAbbreviation(dayIndex) {
    return weekSpanIdentifiers.get(dayIndex);
  }

  // Formats an integer to always be represented by two digits, prepending a '0' if necessary.
  function formatDoubleDigit(numericalInput) {
    return String(numericalInput).padStart(2, '0');
  }

  // Retrieves the value associated with a specific query parameter from the browser's URL.
  function extractUrlParameter(keyIdentifier) {
    const urlQuery = new URLSearchParams(window.location.search);
    return decodeURIComponent(urlQuery.get(keyIdentifier) || '');
  }

  // --- Centralized Application State Management ---

  const applicationMetricsStore = {
    analyticQuantiles: {},      // Holds statistical quantile and maximum values.
    chartDisplayRegions: [],    // Defines colored background regions for the chart.
    chartRenderingConfig: {},   // Comprehensive settings object for the charting library.
    activeDataStreams: [],      // The primary time-series data sets for plotting.
    dataSmoothingWindow: 1,     // Current parameter for the moving average smoothing.
    maximumSmoothingWindow: 5,  // Upper bound for the smoothing window size.
    dataTrimStartIndex: 0       // Number of data points to remove from the beginning.
  };

  let mainChartVisualizer = null; // Reference to the Chart.js instance once initialized.

  // --- Advanced Data Processing Algorithms ---

  // Creates a deep copy of an array containing objects, ensuring independence from the original.
  function performDeepArrayCopy(sourceArray) {
    return JSON.parse(JSON.stringify(sourceArray));
  }

  // Applies a moving average filter and then truncates data points from the start of each series.
  function applyProcessingPipeline(inputDataSet, smoothingFactor, trimmingIndex) {
    let processedDataSet = performDeepArrayCopy(inputDataSet);
    const seriesCount = processedDataSet.length;
    if (seriesCount === 0) return [];

    const dataPointCount = processedDataSet[0].data.length;
    if (dataPointCount === 0) return processedDataSet;

    const currentSmoothingValue = Math.max(0, smoothingFactor); // Ensure non-negative smoothing.
    
    // Step 1: Smoothing - Calculate the moving average.
    // The algorithm averages the current point with 'smoothingFactor' preceding points.
    const smoothedDataSet = processedDataSet.map(seriesEntry => {
        const newSeriesPoints = seriesEntry.data.map((point, index, allPoints) => {
            if (index < currentSmoothingValue) {
                // Points before the smoothing window are not smoothed as per original logic.
                return [point[0], point[1]];
            }
            let cumulativeSum = point[1]; // Start with the current point's value.
            for (let j = 1; j <= currentSmoothingValue; j++) {
                if (index - j >= 0) { // Ensure we don't go out of bounds.
                    cumulativeSum += allPoints[index - j][1];
                }
            }
            return [point[0], cumulativeSum / (currentSmoothingValue + 1)]; // Average over (smooth + 1) points.
        });
        return { ...seriesEntry, data: newSeriesPoints };
    });

    // Step 2: Trimming - Remove points from the start.
    // The trimming amount includes the smoothing factor as per the original specification.
    const effectiveTrimAmount = trimmingIndex + currentSmoothingValue;
    const finalFilteredDataSet = smoothedDataSet.map(seriesEntry => {
      return { ...seriesEntry, data: seriesEntry.data.slice(effectiveTrimAmount) };
    });

    return finalFilteredDataSet;
  }

  // --- Charting Engine Integration Utilities (Chart.js specific) ---

  // Constructs a custom array of tick objects for the time axis, including special labels.
  function generateDynamicTimeTicks(axisMinTimestamp, axisMaxTimestamp) {
    const generatedTicks = [];
    const intervalDivision = Math.ceil((axisMaxTimestamp - axisMinTimestamp) / 8); // Aim for ~8 ticks.
    
    const initialDateTime = new Date(axisMinTimestamp);
    const tzOffsetMinutes = initialDateTime.getTimezoneOffset();
    const tzSign = (tzOffsetMinutes > 0) ? '-' : '+';
    const tzHours = Math.round(Math.abs(tzOffsetMinutes) / 60);
    
    const firstLabel = `${resolveDayAbbreviation(initialDateTime.getDay())} ${formatDoubleDigit(initialDateTime.getHours())}:${formatDoubleDigit(initialDateTime.getMinutes())}<br> UTC${tzSign}${tzHours}`;
    generatedTicks.push({ value: axisMinTimestamp, label: firstLabel });

    for (let currentMoment = axisMinTimestamp + intervalDivision; currentMoment < axisMaxTimestamp; currentMoment += intervalDivision) {
      const intermediateDateTime = new Date(currentMoment);
      generatedTicks.push({
        value: currentMoment,
        label: `${resolveDayAbbreviation(intermediateDateTime.getDay())} ${formatDoubleDigit(intermediateDateTime.getHours())}:${formatDoubleDigit(intermediateDateTime.getMinutes())}`
      });
    }
    
    // For the "now" tick, use the current time's timezone for consistency.
    const finalDateTime = new Date();
    const finalTzOffsetMinutes = finalDateTime.getTimezoneOffset();
    const finalTzSign = (finalTzOffsetMinutes > 0) ? '-' : '+';
    const finalTzHours = Math.round(Math.abs(finalTzOffsetMinutes) / 60);

    generatedTicks.push({ value: axisMaxTimestamp, label: `now <br> UTC${finalTzSign}${finalTzHours}` });
    
    return generatedTicks;
  }

  // Initializes or updates the Chart.js instance with processed data and current configuration.
  function initializeOrUpdateChart(sourceSeriesData, currentSmoothSetting, currentTrimSetting) {
    const chartCanvasElement = document.getElementById('chartCanvasDisplay');
    if (!chartCanvasElement) {
        console.error('Chart canvas element (ID: chartCanvasDisplay) not found!');
        return;
    }

    const transformedChartData = applyProcessingPipeline(sourceSeriesData, currentSmoothSetting, currentTrimSetting);

    // Prepare datasets in Chart.js format
    const chartJsDatasets = transformedChartData.map((seriesObject, index) => ({
      label: seriesObject.label,
      data: seriesObject.data.map(dataPoint => ({ x: dataPoint[0], y: dataPoint[1] })),
      borderColor: seriesObject.color || (index === 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(153, 102, 255, 1)'),
      backgroundColor: seriesObject.color || (index === 0 ? 'rgba(75, 192, 192, 0.2)' : 'rgba(153, 102, 255, 0.2)'),
      fill: false,
      yAxisID: (index === 0 || index === 1) ? 'leftYAxis' : 'rightYAxis', // Assign axes based on original Flot behavior
      tension: 0.1 // For a smoother line appearance
    }));
    
    // Determine the min/max timestamps for dynamic tick generation
    const allTimestamps = transformedChartData.flatMap(s => s.data.map(p => p[0]));
    const minimumTime = allTimestamps.length > 0 ? Math.min(...allTimestamps) : Date.now() - 3600000;
    const maximumTime = allTimestamps.length > 0 ? Math.max(...allTimestamps) : Date.now();

    const customAxisTicks = generateDynamicTimeTicks(minimumTime, maximumTime);

    // Chart.js configuration object
    const chartDisplayConfiguration = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            usePointStyle: true,
            boxWidth: 8,
            padding: 20
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
        annotation: { // Utilizes Chart.js Annotation Plugin for background regions
          annotations: applicationMetricsStore.chartDisplayRegions.map(region => ({
            type: 'box',
            yScaleID: 'rightYAxis', // These markings were specifically for the secondary Y-axis
            yMin: region.y2axis.from,
            yMax: region.y2axis.to,
            backgroundColor: region.color,
            borderColor: region.color,
            borderWidth: 1
          }))
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'minute',
            displayFormats: {
              minute: 'MMM D, HH:mm'
            }
          },
          ticks: {
            source: 'array', // Instruct Chart.js to use an explicit array of tick values
            values: customAxisTicks.map(tick => tick.value),
            callback: function(value, index, values) {
                const matchedTick = customAxisTicks.find(tick => tick.value === value);
                return matchedTick ? matchedTick.label.split('<br>') : '';
            },
            autoSkip: false // Disable automatic tick hiding by Chart.js
          },
          title: {
            display: true,
            text: 'Timestamp'
          }
        },
        leftYAxis: {
          type: 'linear',
          position: 'left',
          beginAtZero: true,
          max: applicationMetricsStore.analyticQuantiles.max_news,
          ticks: {
            precision: 0
          },
          title: {
            display: true,
            text: 'News Articles'
          }
        },
        rightYAxis: {
          type: 'linear',
          position: 'right',
          beginAtZero: true,
          max: applicationMetricsStore.analyticQuantiles.max_pickup,
          ticks: {
            precision: 2
          },
          grid: {
            drawOnChartArea: false // Prevent grid lines for the right Y-axis
          },
          title: {
            display: true,
            text: 'Engagement Rate'
          }
        }
      }
    };

    if (mainChartVisualizer) {
      mainChartVisualizer.data.datasets = chartJsDatasets;
      mainChartVisualizer.options = chartDisplayConfiguration;
      mainChartVisualizer.update(); // Update existing chart
    } else {
      mainChartVisualizer = new Chart(chartCanvasElement, {
        type: 'line',
        data: {
          datasets: chartJsDatasets
        },
        options: chartDisplayConfiguration
      });
    }
  }

  // --- Server Communication and Data Flow Control ---

  // Processes the initial set of quantile and metric data received from the backend.
  async function processInitialMetrics(serverResponse) {
    applicationMetricsStore.analyticQuantiles = serverResponse[0];

    // Define the visual regions (markings) for the chart based on quantiles.
    applicationMetricsStore.chartDisplayRegions = [
      { color: '#BEAFAD', y2axis: { from: 0, to: applicationMetricsStore.analyticQuantiles.quant3 } },
      { color: '#BCB4B2', y2axis: { from: applicationMetricsStore.analyticQuantiles.quant3, to: applicationMetricsStore.analyticQuantiles.quant1 } }
    ];

    // Once initial metrics are set, proceed to fetch the time-series data.
    await updateChartDataAndDisplay();
  }

  // Initiates the first data fetch for core metrics and quantiles.
  async function startInitialDataLoad() {
    try {
      const response = await fetch('/dm.json?ndata_elements=1');
      if (!response.ok) throw new Error(`Network response was not OK: ${response.status}`);
      const dataPayload = await response.json();
      await processInitialMetrics(dataPayload);
    } catch (error) {
      console.error('Failed to retrieve initial metrics data:', error);
    }
  }

  // Handles the arrival of time-series data, updates the UI with recommendations, and renders the chart.
  function handleSeriesDataResponse(incomingSeries) {
    applicationMetricsStore.activeDataStreams = incomingSeries;
    const lastPointIdx = applicationMetricsStore.activeDataStreams[0].data.length - 1;
    const currentPerformanceIndicator = applicationMetricsStore.activeDataStreams[2].data[lastPointIdx][1];

    let outcomeMessage = '';
    let associatedHyperlink = '';

    // Determine recommendation based on performance indicator and quantiles.
    const firstQuantile = applicationMetricsStore.analyticQuantiles.quant1;
    const secondQuantile = applicationMetricsStore.analyticQuantiles.quant2;
    const thirdQuantile = applicationMetricsStore.analyticQuantiles.quant3;

    switch (true) {
      case currentPerformanceIndicator > firstQuantile:
        outcomeMessage = 'exceptional';
        associatedHyperlink = 'http://news.ycombinator.com/submit';
        break;
      case currentPerformanceIndicator > secondQuantile:
        outcomeMessage = 'favorable';
        associatedHyperlink = 'http://news.ycombinator.com/submit';
        break;
      case currentPerformanceIndicator > thirdQuantile:
        outcomeMessage = 'satisfactory';
        associatedHyperlink = 'http://news.ycombinator.com/newsest';
        break;
      default:
        outcomeMessage = 'unfavorable';
        associatedHyperlink = 'http://news.ycombinator.com/news';
    }

    // Update textual recommendations on the page.
    const recommendationOutput = document.getElementById('recommendationTextOutput');
    if (recommendationOutput) recommendationOutput.textContent = outcomeMessage;

    const recommendationAnchor = document.getElementById('recommendationTargetLink');
    if (recommendationAnchor) recommendationAnchor.href = associatedHyperlink;

    // Render or refresh the chart with the latest data and settings.
    initializeOrUpdateChart(applicationMetricsStore.activeDataStreams, applicationMetricsStore.dataSmoothingWindow, applicationMetricsStore.dataTrimStartIndex);

    // Configure interactive sliders for smoothing and trimming.
    const smoothingSlider = document.getElementById('smoothnessControl');
    const trimmingSlider = document.getElementById('trimmingControl');

    if (smoothingSlider) {
      smoothingSlider.value = applicationMetricsStore.dataSmoothingWindow;
      smoothingSlider.max = applicationMetricsStore.maximumSmoothingWindow;
      smoothingSlider.addEventListener('input', (event) => {
        applicationMetricsStore.dataSmoothingWindow = Number(event.target.value);
        initializeOrUpdateChart(applicationMetricsStore.activeDataStreams, applicationMetricsStore.dataSmoothingWindow, applicationMetricsStore.dataTrimStartIndex);
      });
    }

    if (trimmingSlider) {
      const maxAvailableTrim = lastPointIdx - applicationMetricsStore.maximumSmoothingWindow - 1;
      trimmingSlider.value = applicationMetricsStore.dataTrimStartIndex;
      trimmingSlider.max = Math.max(0, maxAvailableTrim); // Ensure max is non-negative.
      trimmingSlider.addEventListener('input', (event) => {
        applicationMetricsStore.dataTrimStartIndex = Number(event.target.value);
        initializeOrUpdateChart(applicationMetricsStore.activeDataStreams, applicationMetricsStore.dataSmoothingWindow, applicationMetricsStore.dataTrimStartIndex);
      });
    }
  }

  // Fetches the primary time-series data and sets up a recurring refresh mechanism.
  async function updateChartDataAndDisplay() {
    try {
      const requestedElements = extractUrlParameter('element_count'); // Renamed URL parameter.
      const response = await fetch(`/etl.json?ndata_elements=${requestedElements}`);
      if (!response.ok) throw new Error(`Network response was not OK: ${response.status}`);
      const seriesData = await response.json();
      handleSeriesDataResponse(seriesData);
    } catch (error) {
      console.error('Failed to retrieve time-series data:', error);
    } finally {
      // Schedule the next data refresh after 15 minutes (900,000 milliseconds).
      setTimeout(updateChartDataAndDisplay, 900000);
    }
  }

  // --- Initial Page Load Operations ---

  // Initiate the entire process when the DOM is fully loaded.
  startInitialDataLoad();

  // Implement a custom "flip" effect for a designated container (replacing quickFlip).
  const visualFlipperContainer = document.getElementById('flipEffectWrapper'); // Assuming this ID for the container.
  const flipActionTrigger = document.querySelector('.flip-trigger-button'); // New class for the trigger.
  if (visualFlipperContainer && flipActionTrigger) {
    flipActionTrigger.addEventListener('click', (event) => {
      event.preventDefault(); // Prevent any default action of the trigger.
      visualFlipperContainer.classList.toggle('is-rotated'); // Toggle a CSS class for the flip animation.
    });
  }

});