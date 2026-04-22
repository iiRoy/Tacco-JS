const VisualizerEngine = (function() {
  'use strict';

  // --- Core Utility Functions ---

  const isList = (item) => Array.isArray(item);
  const isRecord = (item) => typeof item === 'object' && item !== null && item.constructor === Object;

  // Deep merge function, mutates 'destination'
  const incorporate = (destination, origin) => {
    if (!isRecord(destination) && !isList(destination) && isRecord(origin)) {
      // If destination is a primitive but origin is an object, replace it
      // This case is typically handled by `destination[propKey] = {}` or `[]` before recursive call
      // Or if originValue is a primitive, it's assigned directly.
      // This function assumes destination is an object or array when recursively called.
      return destination;
    }

    for (const propKey in origin) {
      if (Object.prototype.hasOwnProperty.call(origin, propKey)) {
        const originValue = origin[propKey];
        const destinationValue = destination[propKey];

        const isOriginRecord = isRecord(originValue);
        const isOriginList = isList(originValue);
        const isDestinationRecord = isRecord(destinationValue);
        const isDestinationList = isList(destinationValue);

        if (isOriginRecord || isOriginList) {
          if (isOriginRecord && !isDestinationRecord) {
            destination[propKey] = {};
          } else if (isOriginList && !isDestinationList) {
            destination[propKey] = [];
          }
          // Ensure destination[propKey] is now an object or array before recursing
          if ((isOriginRecord && isRecord(destination[propKey])) || (isOriginList && isList(destination[propKey]))) {
            incorporate(destination[propKey], originValue);
          } else {
            // Fallback for cases where destination[propKey] couldn't be made into expected type
            // (e.g., if destination[propKey] was null/undefined and originValue is complex)
            destination[propKey] = isOriginList ? [...originValue] : { ...originValue };
          }
        } else if (originValue !== undefined) {
          destination[propKey] = originValue;
        }
      }
    }
    return destination;
  };

  // Shallow merge, creates a new object
  const combineRecords = (first, second) => {
    const result = {};
    incorporate(result, first);
    incorporate(result, second);
    return result;
  };

  // Date parsing, manual string splitting for divergence from original regex
  const interpretDateString = (inputTxt) => {
    if (Object.prototype.toString.call(inputTxt) === '[object Date]') {
      return inputTxt;
    }
    if (typeof inputTxt !== 'string') {
      return undefined;
    }

    const nativeDate = new Date(inputTxt);
    if (!isNaN(nativeDate.getTime())) {
        return nativeDate; // Prefer native parsing for robustness
    }

    // Manual parsing if native fails for specific ISO-like patterns
    let year = 0, month = 0, day = 1, hour = 0, minute = 0, second = 0, millisecond = 0;
    let offsetMinutes = 0;

    const upperCaseInput = inputTxt.toUpperCase();
    const parts = upperCaseInput.split('T');
    const datePart = parts[0];
    const timePart = parts[1] || '';

    const dateComponents = datePart.split('-');
    if (dateComponents.length >= 3) { // YYYY-MM-DD
        year = parseInt(dateComponents[0], 10);
        month = parseInt(dateComponents[1], 10) - 1;
        day = parseInt(dateComponents[2], 10);
    } else if (dateComponents.length === 1 && dateComponents[0].length === 8) { // YYYYMMDD
        year = parseInt(dateComponents[0].substring(0,4), 10);
        month = parseInt(dateComponents[0].substring(4,6), 10) - 1;
        day = parseInt(dateComponents[0].substring(6,8), 10);
    } else if (dateComponents.length === 1 && dateComponents[0].length === 6) { // YYYYMMDD (without DD, assume 01)
        year = parseInt(dateComponents[0].substring(0,4), 10);
        month = parseInt(dateComponents[0].substring(4,6), 10) - 1;
        day = 1;
    }


    const timeMatch = timePart.match(/(\d{2})?:?(\d{2})?:?(\d{2})?(\.\d+)?(Z|[\+\-]\d{2}(:?\d{2})?)?/);
    if (timeMatch) {
        hour = parseInt(timeMatch[1] || '0', 10);
        minute = parseInt(timeMatch[2] || '0', 10);
        second = parseInt(timeMatch[3] || '0', 10);
        if (timeMatch[4]) {
            millisecond = parseFloat('0' + timeMatch[4]) * 1000;
        }
        const zoneInfo = timeMatch[5] || '';
        if (zoneInfo === 'Z') {
            offsetMinutes = 0;
        } else if (zoneInfo.match(/[\+\-]\d{2}(:?\d{2})?/)) {
            const sign = zoneInfo.startsWith('-') ? -1 : 1;
            const zoneNums = zoneInfo.substring(1).replace(':', '');
            const tzHour = parseInt(zoneNums.substring(0, 2), 10);
            const tzMinute = parseInt(zoneNums.substring(2, 4) || '0', 10);
            offsetMinutes = sign * (tzHour * 60 + tzMinute);
        }
    }

    let resultTimestamp = Date.UTC(year, month, day, hour, minute, second, millisecond);
    if (offsetMinutes !== 0) {
        resultTimestamp -= offsetMinutes * 60 * 1000;
    }

    return new Date(resultTimestamp);
  };

  // Checks for negative values in series data
  const hasNegativeMeasurements = (seriesCollection) => {
    return seriesCollection.some(item =>
      item.data.some(point => point[1] < 0)
    );
  };

  // Processes chart options
  const chartSettingFactory = (baseSettings, legendHider, minSetter, maxSetter) => (seriesData, chartOptions) => {
    const currentSettings = combineRecords({}, baseSettings);

    if (chartOptions.hideLegend) {
      legendHider(currentSettings);
    }

    if ("min" in chartOptions) {
      minSetter(currentSettings, chartOptions.min);
    } else if (!hasNegativeMeasurements(seriesData)) {
      minSetter(currentSettings, 0);
    }

    if ("max" in chartOptions) {
      maxSetter(currentSettings, chartOptions.max);
    }

    return incorporate(currentSettings, chartOptions.library || {});
  };

  // --- Data Transformation Functions ---

  const castToString = (val) => String(val);
  const castToNumber = (val) => parseFloat(val);

  // Transforms value to Date object
  const transformToMoment = (val) => {
    if (typeof val !== "object") {
      if (typeof val === "number") {
        return new Date(val * 1000); // Unix timestamp in seconds to milliseconds
      } else { // string
        const cleanedStr = val.replace(/ /, "T").replace(" ", "").replace("UTC", "Z");
        return interpretDateString(cleanedStr) || new Date(val);
      }
    }
    return val;
  };

  // Converts object to array of [key, value] pairs
  const convertToList = (input) => {
    return isList(input) ? input : Object.entries(input);
  };

  // Sorts by time
  const chronologicalSort = (a, b) => a[0].getTime() - b[0].getTime();

  // Prepares series data for charting
  const prepareSeriesData = (rawData, processingOptions, useTime) => {
    let seriesCollection;

    // Determine if it's a single series or multiple, and normalize
    if (isList(rawData) && rawData.length > 0 && isRecord(rawData[0]) && !isList(rawData[0][0])) {
      // Already an array of series objects: [{name: "Series1", data: [...]}]
      seriesCollection = rawData;
      processingOptions.hideLegend = false;
    } else if (isRecord(rawData) || (isList(rawData) && rawData.length > 0 && !isRecord(rawData[0]))) {
      // Single series: { "2023-01-01": 10 } or [10, 20, 30] or [[key, val], ...]
      seriesCollection = [{ name: "Value", data: rawData }];
      processingOptions.hideLegend = true;
    } else {
      // Default to empty if unknown format
      seriesCollection = [{ name: "Value", data: [] }];
      processingOptions.hideLegend = true;
    }

    const processed = seriesCollection.map(seriesItem => {
      // Ensure data is an array of [key, value] pairs
      const dataPoints = convertToList(seriesItem.data).map(point => {
        const key = useTime ? transformToMoment(point[0]) : castToString(point[0]);
        const value = castToNumber(point[1]);
        return [key, value];
      });
      return { ...seriesItem, data: dataPoints };
    });

    if (useTime) {
      processed.forEach(seriesItem => {
        seriesItem.data.sort(chronologicalSort);
      });
    }

    return processed;
  };

  // --- DOM & Error Handling ---

  const displayMessage = (targetElement, content) => {
    targetElement.textContent = content;
  };

  const signalDisplayIssue = (targetElement, issueText) => {
    displayMessage(targetElement, "Chart Display Problem: " + issueText);
    targetElement.style.color = "#cc0000";
  };

  // Fetches data via HTTP using native `fetch`
  const acquireDataViaHTTP = async (targetElement, dataURL) => {
    try {
      const response = await fetch(dataURL);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      signalDisplayIssue(targetElement, error.message);
      throw error;
    }
  };

  // Guards execution with error handling
  const guardExecution = (targetElement, payload, opts, operation) => {
    try {
      operation(targetElement, payload, opts);
    } catch (err) {
      signalDisplayIssue(targetElement, err.message);
      throw err;
    }
  };

  // Obtains chart content from various sources
  const obtainContent = async (targetElement, sourceContent, opts, completionCallback) => {
    if (typeof sourceContent === "string") {
      try {
        const data = await acquireDataViaHTTP(targetElement, sourceContent);
        guardExecution(targetElement, data, opts, completionCallback);
      } catch (error) {
        // Error already signaled by acquireDataViaHTTP
      }
    } else {
      guardExecution(targetElement, sourceContent, opts, completionCallback);
    }
  };

  // --- Chart Library Abstraction ---

  let lineVisualizer, pieVisualizer, barVisualizer;

  // Highcharts integration
  if ("Highcharts" in window) {
    const highchartBaseSettings = {
      xAxis: {
        labels: { style: { fontSize: "12px" } },
        type: "datetime"
      },
      yAxis: {
        title: { text: null },
        labels: { style: { fontSize: "12px" } }
      },
      title: { text: null },
      credits: { enabled: false },
      legend: { borderWidth: 0 },
      tooltip: { style: { fontSize: "12px" } }
    };

    const concealLegend = (settings) => { settings.legend.enabled = false; };
    const establishLowerBound = (settings, lower) => { settings.yAxis.min = lower; };
    const establishUpperBound = (settings, upper) => { settings.yAxis.max = upper; };

    const highchartSettingProcessor = chartSettingFactory(
      highchartBaseSettings,
      concealLegend,
      establishLowerBound,
      establishUpperBound
    );

    lineVisualizer = (targetElement, seriesSet, chartOpts) => {
      const processedOpts = highchartSettingProcessor(seriesSet, chartOpts);
      processedOpts.chart = { type: "spline", renderTo: targetElement.id };

      const transformedSeries = seriesSet.map(seriesItem => ({
        ...seriesItem,
        data: seriesItem.data.map(point => [point[0].getTime(), point[1]]),
        marker: { symbol: "circle" }
      }));
      processedOpts.series = transformedSeries;
      new Highcharts.Chart(processedOpts);
    };

    pieVisualizer = (targetElement, seriesSet, chartOpts) => {
      const processedOpts = combineRecords(highchartBaseSettings, chartOpts.library || {});
      processedOpts.chart = { renderTo: targetElement.id };
      processedOpts.series = [{
        type: "pie",
        name: "Value",
        data: seriesSet
      }];
      new Highcharts.Chart(processedOpts);
    };

    barVisualizer = (targetElement, seriesSet, chartOpts) => {
      const processedOpts = highchartSettingProcessor(seriesSet, chartOpts);
      processedOpts.chart = { type: "column", renderTo: targetElement.id };

      const categoryMap = new Map(); // Using Map for categories
      seriesSet.forEach((seriesItem, seriesIndex) => {
        seriesItem.data.forEach(point => {
          const categoryKey = castToString(point[0]);
          if (!categoryMap.has(categoryKey)) {
            categoryMap.set(categoryKey, new Array(seriesSet.length).fill(null));
          }
          categoryMap.get(categoryKey)[seriesIndex] = point[1];
        });
      });

      const categories = Array.from(categoryMap.keys());
      processedOpts.xAxis.categories = categories;
      processedOpts.xAxis.type = undefined;

      const newSeriesStructure = seriesSet.map((seriesItem, seriesIndex) => {
        const dataPoints = categories.map(cat => {
          const rowData = categoryMap.get(cat);
          return rowData ? rowData[seriesIndex] : null;
        });
        return { name: seriesItem.name, data: dataPoints };
      });
      processedOpts.series = newSeriesStructure;

      new Highcharts.Chart(processedOpts);
    };

  } else if ("google" in window) { // Google Charts integration
    let chartLibraryReady = false;
    google.setOnLoadCallback(() => { chartLibraryReady = true; });
    google.load("visualization", "1.0", { packages: ["corechart"] });

    const awaitReadiness = (callbackAction) => {
      google.setOnLoadCallback(callbackAction);
      if (chartLibraryReady) {
        callbackAction();
      }
    };

    const googleChartBaseSettings = {
      fontName: "'Lucida Grande', 'Lucida Sans Unicode', Verdana, Arial, Helvetica, sans-serif",
      pointSize: 6,
      legend: {
        textStyle: { fontSize: 12, color: "#444" },
        alignment: "center",
        position: "right"
      },
      curveType: "function",
      hAxis: {
        textStyle: { color: "#666", fontSize: 12 },
        gridlines: { color: "transparent" },
        baselineColor: "#ccc"
      },
      vAxis: {
        textStyle: { color: "#666", fontSize: 12 },
        baselineColor: "#ccc",
        viewWindow: {}
      },
      tooltip: {
        textStyle: { color: "#666", fontSize: 12 }
      }
    };

    const concealLegend = (settings) => { settings.legend.position = "none"; };
    const establishLowerBound = (settings, lower) => { settings.vAxis.viewWindow.min = lower; };
    const establishUpperBound = (settings, upper) => { settings.vAxis.viewWindow.max = upper; };

    const googleChartSettingProcessor = chartSettingFactory(
      googleChartBaseSettings,
      concealLegend,
      establishLowerBound,
      establishUpperBound
    );

    // Creates Google DataTable
    const constructGridData = (seriesCollection, columnDataType) => {
      const dataGrid = new google.visualization.DataTable();
      dataGrid.addColumn(columnDataType, "");

      const rowMatrix = new Map();

      seriesCollection.forEach((seriesItem, seriesIndex) => {
        dataGrid.addColumn("number", seriesItem.name);
        seriesItem.data.forEach(point => {
          const key = (columnDataType === "datetime") ? point[0].getTime() : point[0];
          if (!rowMatrix.has(key)) {
            rowMatrix.set(key, new Array(seriesCollection.length).fill(null));
          }
          rowMatrix.get(key)[seriesIndex] = castToNumber(point[1]);
        });
      });

      let finalRows = Array.from(rowMatrix.entries()).map(([key, values]) => {
        const firstCol = (columnDataType === "datetime") ? new Date(castToNumber(key)) : key;
        return [firstCol, ...values];
      });

      if (columnDataType === "datetime") {
        finalRows.sort(chronologicalSort);
      }

      dataGrid.addRows(finalRows);
      return dataGrid;
    };

    lineVisualizer = (targetElement, seriesSet, chartOpts) => {
      awaitReadiness(() => {
        const processedOpts = googleChartSettingProcessor(seriesSet, chartOpts);
        const dataGrid = constructGridData(seriesSet, "datetime");
        const chartInstance = new google.visualization.LineChart(targetElement);
        chartInstance.draw(dataGrid, processedOpts);
      });
    };

    pieVisualizer = (targetElement, seriesSet, chartOpts) => {
      awaitReadiness(() => {
        const processedOpts = combineRecords(googleChartBaseSettings, chartOpts.library || {});
        processedOpts.chartArea = { top: "10%", height: "80%" };

        const dataGrid = new google.visualization.DataTable();
        dataGrid.addColumn("string", "");
        dataGrid.addColumn("number", "Value");
        dataGrid.addRows(seriesSet);

        const chartInstance = new google.visualization.PieChart(targetElement);
        chartInstance.draw(dataGrid, processedOpts);
      });
    };

    barVisualizer = (targetElement, seriesSet, chartOpts) => {
      awaitReadiness(() => {
        const processedOpts = googleChartSettingProcessor(seriesSet, chartOpts);
        const dataGrid = constructGridData(seriesSet, "string");
        const chartInstance = new google.visualization.ColumnChart(targetElement);
        chartInstance.draw(dataGrid, processedOpts);
      });
    };

  } else { // No chart library found
    lineVisualizer = pieVisualizer = barVisualizer = () => {
      throw new Error("Missing Highcharts or Google Charts library for visualization.");
    };
  }

  // --- Public Interface ---

  const createChart = (chartType, elementId, sourceData, chartSettings) => {
    const targetElement = typeof elementId === 'string' ? document.getElementById(elementId) : elementId;
    if (!targetElement) {
        console.error(`Element with ID '${elementId}' not found.`);
        return;
    }

    const currentSettings = { ...chartSettings };
    const useTimeAxis = chartType === 'line';

    obtainContent(targetElement, sourceData, currentSettings, (elem, data, opts) => {
      const processedSeries = prepareSeriesData(data, opts, useTimeAxis);
      switch (chartType) {
        case 'line':
          lineVisualizer(elem, processedSeries, opts);
          break;
        case 'pie':
          pieVisualizer(elem, processedSeries, opts);
          break;
        case 'column':
          barVisualizer(elem, processedSeries, opts);
          break;
        default:
          throw new Error(`Unsupported chart type: ${chartType}`);
      }
    });
  };

  return {
    LineVisual: (elemId, dataSrc, opts) => createChart('line', elemId, dataSrc, opts),
    PieVisual: (elemId, dataSrc, opts) => createChart('pie', elemId, dataSrc, opts),
    BarVisual: (elemId, dataSrc, opts) => createChart('column', elemId, dataSrc, opts)
  };

})();

window.VisualizerEngine = VisualizerEngine;