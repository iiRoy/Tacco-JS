const PerformanceDashboard = {
  // Purpose: Orchestrates the fetching and display of performance analytics data.
  // This method renders a sparkline chart and a detailed metrics table.
  //
  // @param {jQuery} chartContainerElem    - The jQuery object representing the DOM element for chart visualization.
  // @param {jQuery} dataDisplayElem       - The jQuery object for the DOM element where the metric table will be placed.
  // @param {string} timePeriod            - Defines the time frame for data (e.g., 'daily', 'weekly', 'monthly').
  // @param {number} timeOffsetIndex       - An integer offset from the current time period (e.g., 0 for current, -1 for previous).
  // @param {string[]} metricIdentifiers   - An array of string keys identifying the specific metrics to retrieve.
  renderPerformanceSummary: function(chartContainerElem, dataDisplayElem, timePeriod, timeOffsetIndex, metricIdentifiers) {
    // --- Input validation and setup ---
    if (!chartContainerElem || chartContainerElem.length === 0 || !dataDisplayElem || dataDisplayElem.length === 0) {
      console.error("Dashboard renderer: Target elements for chart or data display are invalid or missing.");
      return; // Abort if essential elements are not provided.
    }
    dataDisplayElem.empty(); // Clear any previous content from the data table area.

    // Define the configuration for the sparkline chart.
    const sparklineVisualizationOptions = {
      height: '240px',
      width: '520px',
      type: 'line',
      fillColor: '#F0F0F0',
      lineColor: '#007bff', // Bootstrap primary blue
      lineWidth: 1.8,
      spotRadius: 2.5,
      chartRangeMin: 0,
      spotColor: '#444',
      minSpotColor: '#444',
      maxSpotColor: '#444'
    };

    // Helper function to format numeric values for display, handling edge cases.
    const formatDisplayNumber = (value) => {
        if (value === null || value === undefined || !Number.isFinite(value)) {
            return "0"; // Default to "0" for non-finite or missing values.
        }
        return Math.floor(value).toString(); // Use Math.floor for truncation, then convert to string.
    };

    // --- Data Fetching ---
    // Utilize jQuery.ajax for more explicit control over the request.
    jQuery.ajax({
      url: "/api/metrics/aggregated", // A slightly different endpoint name.
      method: "GET",
      dataType: "json",
      data: {
        period: timePeriod,
        offset: timeOffsetIndex,
        keys: metricIdentifiers
      },
      success: function(apiResponsePayload) {
        // --- Response processing and rendering ---
        // Validate the API response structure.
        if (!apiResponsePayload || !apiResponsePayload.seriesCollection || apiResponsePayload.seriesCollection.length === 0) {
          dataDisplayElem.html("<div class='alert alert-info'>No relevant performance data was retrieved.</div>");
          console.warn("API response for metrics was empty or malformed:", apiResponsePayload);
          return;
        }

        const retrievedMetricSeries = apiResponsePayload.seriesCollection;
        const primarySeriesDataPoints = retrievedMetricSeries[0].dataPoints;

        // Render the primary sparkline chart using the first metric's data points.
        if (primarySeriesDataPoints && primarySeriesDataPoints.length > 0) {
          chartContainerElem.sparkline(primarySeriesDataPoints, sparklineVisualizationOptions);
        } else {
          chartContainerElem.html("<div class='chart-placeholder'>Chart data unavailable.</div>");
        }

        // --- Table construction for detailed metrics ---
        const metricsSummaryTable = jQuery('<table>')
          .addClass('metric-detail-table') // Apply a class for external styling.
          .css({ 'width': '95%', 'margin': '20px auto', 'border-collapse': 'separate', 'border-spacing': '0 8px' });

        // Create table header.
        const tableHeader = jQuery('<thead>').append(
          jQuery('<tr>').append(
            jQuery('<th>').text("Metric Key").css('text-align', 'left').addClass('table-header-cell'),
            jQuery('<th>').text("Minimum").addClass('table-header-cell'),
            jQuery('<th>').text("Maximum").addClass('table-header-cell'),
            jQuery('<th>').text("Current").addClass('table-header-cell')
          )
        );
        metricsSummaryTable.append(tableHeader);
        const tableBodyContent = jQuery('<tbody>');

        // Calculate cumulative values across all series for a potential "total" row.
        const requiresTotalRow = metricIdentifiers.length > 1;
        let cumulativeData = [];
        if (requiresTotalRow) {
            let maxDataPointsLength = 0;
            retrievedMetricSeries.forEach(series => {
                if (series.dataPoints && series.dataPoints.length > maxDataPointsLength) {
                    maxDataPointsLength = series.dataPoints.length;
                }
            });

            for (let i = 0; i < maxDataPointsLength; i++) {
                let currentSum = 0;
                retrievedMetricSeries.forEach(series => {
                    const value = series.dataPoints ? series.dataPoints[i] : undefined;
                    if (value !== undefined && Number.isFinite(value)) {
                        currentSum += value;
                    }
                });
                cumulativeData.push(currentSum);
            }
        }

        // Process and append each individual metric series to the table.
        // Using lodash chain for clearer transformations and filtering.
        const orderedSeries = _.chain(retrievedMetricSeries)
          .filter(s => s.dataPoints && s.dataPoints.length > 0) // Ensure series has data
          .sortBy(s => _.last(s.dataPoints) || 0) // Sort by last value, default to 0 if null
          .reverse() // Descending order
          .value();

        orderedSeries.forEach(function(seriesEntry) {
          const seriesValuesArray = seriesEntry.dataPoints;
          const seriesNameIdentifier = seriesEntry.metricName.split("/")[0]; // Extract primary identifier

          // Use _.compact to remove null/undefined values before calculating min/max.
          const effectiveValues = _.compact(seriesValuesArray);

          const seriesMin = _.min(effectiveValues);
          const seriesMax = _.max(effectiveValues);
          const seriesLast = _.last(effectiveValues) || 0; // Default to 0 if no last value.

          tableBodyContent.append(
            jQuery('<tr>').append(
              jQuery('<td>').text(seriesNameIdentifier).addClass('metric-key-cell'),
              jQuery('<td>').text(formatDisplayNumber(seriesMin)).addClass('metric-value-cell'),
              jQuery('<td>').text(formatDisplayNumber(seriesMax)).addClass('metric-value-cell'),
              jQuery('<td>').text(formatDisplayNumber(seriesLast)).addClass('metric-value-cell')
            )
          );
        });

        // Add a "Total" row if multiple metrics were requested and cumulative data is available.
        if (requiresTotalRow && cumulativeData.length > 0) {
            const validCumulativeValues = _.compact(cumulativeData);
            const totalMinAggregate = _.min(validCumulativeValues);
            const totalMaxAggregate = _.max(validCumulativeValues);
            const totalLastAggregate = _.last(validCumulativeValues) || 0;

            tableBodyContent.append(
                jQuery('<tr>').append(
                    jQuery('<th>').text("Overall Total").css('text-align', 'right').addClass('total-label-cell'),
                    jQuery('<th>').text(formatDisplayNumber(totalMinAggregate)).css('text-align', 'right').addClass('total-value-cell'),
                    jQuery('<th>').text(formatDisplayNumber(totalMaxAggregate)).css('text-align', 'right').addClass('total-value-cell'),
                    jQuery('<th>').text(formatDisplayNumber(totalLastAggregate)).css('text-align', 'right').addClass('total-value-cell')
                )
            );
        }

        metricsSummaryTable.append(tableBodyContent);
        dataDisplayElem.html(metricsSummaryTable); // Final update of the data display element.
      },
      error: function(jqXHR, textStatus, errorThrown) {
        // Comprehensive error logging and user feedback for AJAX failures.
        dataDisplayElem.html("<div class='alert alert-danger'>Failed to load performance data. Service might be unavailable.</div>");
        console.error("AJAX request failed for metrics summary:", textStatus, errorThrown, jqXHR);
      }
    });
  }
};