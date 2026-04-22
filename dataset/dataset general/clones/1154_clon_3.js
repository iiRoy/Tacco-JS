;

(function(jq) {
  // Ensure jQuery is available
  if (typeof jq === 'undefined') {
    console.error('jQuery is required for this plugin.');
    return;
  }

  // Define the plugin for generating charts from HTML tables
  jq.fn.chartifyHtmlTable = function() {

    // Acceptable plot visualization kinds
    const acceptablePlotKinds = ['column', 'line', 'area', 'spline', 'pie', 'bar']; // Added 'bar' as it's used internally

    /**
     * Attempts to resolve a string path into a callable function reference.
     * Expected format: "globalFunctionName" or "Namespace.SubNamespace.functionName".
     * @param {HTMLElement} originElement - The DOM element where the data attribute is defined.
     * @param {string} propertyKey - The name of the data attribute holding the function path.
     * @returns {Function|undefined} The resolved function or undefined if not found/invalid.
     */
    const fetchCallbackRef = function(originElement, propertyKey) {
      const funcPathStr = jq(originElement).data(propertyKey);
      if (funcPathStr === undefined || typeof funcPathStr !== 'string' || funcPathStr.trim() === '') {
        return undefined; // No function path provided or invalid type
      }

      const pathSegments = funcPathStr.split('.');
      let currentRef = window; // Start with the global scope

      // Traverse the path segments to find the function
      for (let i = 0; i < pathSegments.length; i++) {
        const segment = pathSegments[i];
        if (typeof currentRef === 'object' && currentRef !== null && currentRef.hasOwnProperty(segment)) {
          currentRef = currentRef[segment];
        } else {
          // Path segment not found, or currentRef is not an object
          console.warn(`chartifyHtmlTable: Could not resolve part of callback path "${funcPathStr}" at segment "${segment}".`);
          return undefined;
        }
      }

      // Ensure the final resolved reference is actually a function
      if (typeof currentRef === 'function') {
        return currentRef;
      } else {
        console.warn(`chartifyHtmlTable: Resolved path "${funcPathStr}" does not point to a function.`);
        return undefined;
      }
    };

    /**
     * Parses a date string in 'YYYY-MM-DD HH:MM' format into a Date object.
     * @param {string} dtString - The date/time string to parse.
     * @returns {Date} A Date object.
     */
    const decodeDateTimeString = function(dtString) {
      if (!dtString || typeof dtString !== 'string') {
        console.warn('chartifyHtmlTable: Invalid date string provided for parsing:', dtString);
        return new Date(NaN); // Return an invalid date
      }

      const dtParts = dtString.split(' ');
      const dateComponents = dtParts[0].split('-').map(Number); // YYYY, MM, DD

      let hourVal = 0;
      let minuteVal = 0;

      // Check if time components are present
      if (dtParts.length > 1 && dtParts[1]) {
        const timeComponents = dtParts[1].split(':').map(Number); // HH, MM
        hourVal = timeComponents[0] || 0;
        minuteVal = timeComponents[1] || 0;
      }

      // Note: Month is 0-indexed in Date constructor (MM-1)
      return new Date(dateComponents[0], dateComponents[1] - 1, dateComponents[2], hourVal, minuteVal);
    };

    /**
     * Retrieves X-axis boundary (min/max) value, converting datetime if necessary.
     * @param {HTMLElement} sourceTable - The table element.
     * @param {string} boundaryType - 'min' or 'max'.
     * @returns {number|null} The parsed boundary value or null.
     */
    const retrieveAxisBoundaryValue = function(sourceTable, boundaryType) {
      const $sourceTable = jq(sourceTable);
      const dataAttrKey = `plot-x-axis-${boundaryType}`;
      const rawValue = $sourceTable.data(dataAttrKey);

      if (rawValue === undefined) {
        return null;
      }

      if ($sourceTable.data('plot-x-axis-type') === 'datetime') {
        const dateObj = decodeDateTimeString(rawValue);
        if (isNaN(dateObj.getTime())) {
          console.error(`chartifyHtmlTable: Failed to parse datetime for X-axis ${boundaryType}: "${rawValue}"`);
          return null;
        }
        // Return UTC milliseconds to avoid timezone issues with Highcharts
        return dateObj.getTime() - dateObj.getTimezoneOffset() * 60 * 1000;
      }
      // For non-datetime types, assume it's already a number or can be coerced
      return parseFloat(rawValue);
    };

    // Iterate over each selected HTML table to transform it into a chart
    this.each(function() {
      const $currentGrid = jq(this);
      let yAxisCount = 1; // Default to a single Y-axis

      // Extract chart header from table caption
      const tableCaptions = jq('caption', $currentGrid);
      const chartHeaderTxt = tableCaptions.length ? jq(tableCaptions[0]).text().trim() : '';

      let renderTargetElem; // The DOM element where the Highcharts chart will be rendered

      // Determine where the chart should be displayed
      const renderBeforeGrid = $currentGrid.data('plot-container-before') === true; // Use boolean for clarity
      if (!renderBeforeGrid) {
        const targetSelectorString = $currentGrid.data('plot-container');
        if (!targetSelectorString) {
          throw new Error("chartifyHtmlTable: 'data-plot-container' attribute is mandatory to specify chart render location.");
        }

        // Check if selector is absolute or relative
        if (targetSelectorString.startsWith('#') || targetSelectorString.indexOf('..') === -1) {
          // Absolute selector path or simple selector
          renderTargetElem = jq(targetSelectorString);
        } else {
          // Relative selector path (e.g., '.. .sibling-chart-area')
          let contextNode = this; // Start context from the current table
          let dynamicSelector = targetSelectorString;

          // Traverse up the DOM tree based on '..'
          while (dynamicSelector.startsWith('.. ')) {
            dynamicSelector = dynamicSelector.substring(3); // Remove '.. '
            contextNode = contextNode.parentElement;
            if (!contextNode) {
              throw new Error(`chartifyHtmlTable: Relative selector "${targetSelectorString}" went beyond document root.`);
            }
          }
          renderTargetElem = jq(dynamicSelector, contextNode);
        }

        if (renderTargetElem.length !== 1) {
          const errMsg = renderTargetElem.length === 0 ?
            `chartifyHtmlTable: Target container "${targetSelectorString}" not found in DOM.` :
            `chartifyHtmlTable: Target container "${targetSelectorString}" matched multiple elements. Only one allowed.`;
          throw new Error(errMsg);
        }
        renderTargetElem = renderTargetElem[0]; // Get the raw DOM element
      } else {
        // Render the chart directly before the table
        $currentGrid.before('<div class="chartify-auto-container"></div>');
        renderTargetElem = $currentGrid.prev()[0];
      }

      // Retrieve primary chart type and validate
      const primaryPlotType = $currentGrid.data('plot-kind');
      if (!primaryPlotType) {
        throw new Error("chartifyHtmlTable: 'data-plot-kind' attribute is mandatory (e.g., 'column', 'line').");
      }
      if (!acceptablePlotKinds.includes(primaryPlotType)) {
        throw new Error(`chartifyHtmlTable: Invalid 'data-plot-kind' "${primaryPlotType}". Must be one of: ${acceptablePlotKinds.join(', ')}.`);
      }

      // Determine series stacking behavior
      const seriesStackingMode = $currentGrid.data('plot-stacking') || 'normal'; // Default to 'normal'

      // Global data label settings
      const globalLabelVisibility = $currentGrid.data('plot-datalabels-enabled') === true;
      const isChartOrientationInverted = $currentGrid.data('plot-inverted') === true; // Use boolean comparison

      // --- Process Table Header (<thead>) for Series Definitions ---
      const headerCells = jq('thead th', $currentGrid);
      const columnDefinitions = [];
      const verticalMarkers = [];
      let omittedColumnCount = 0;
      let isStackedSeriesPresent = false; // Flag to indicate if any series has a stack group

      headerCells.each(function(cellIdx, headerCell) {
        const $headerCell = jq(headerCell);

        const shouldSkipColumn = $headerCell.data('plot-skip') === true;
        if (shouldSkipColumn) {
          omittedColumnCount++;
          return; // Skip this header cell
        }

        const valueScalingFactor = parseFloat($headerCell.data('plot-value-scale')) || 1;
        let individualPlotType = $headerCell.data('plot-kind') || primaryPlotType;
        if (!acceptablePlotKinds.includes(individualPlotType)) {
          console.warn(`chartifyHtmlTable: Invalid individual plot type "${individualPlotType}" for column "${$headerCell.text()}". Falling back to global type "${primaryPlotType}".`);
          individualPlotType = primaryPlotType;
        }

        const stackGroupIdentifier = $headerCell.data('plot-stack-group');
        if (stackGroupIdentifier) {
          isStackedSeriesPresent = true;
        }

        const individualLabelVisibility = $headerCell.data('plot-datalabels-enabled') === true || globalLabelVisibility; // Inherit or override

        const axisIndex = $headerCell.data('plot-y-axis'); // '0' or '1'
        if (axisIndex === '1') {
          yAxisCount = Math.max(yAxisCount, 2); // Ensure we have at least 2 Y-axes if one column uses the second
        }

        // Common configuration for a column/series
        const currentColumnConfig = {
          headerText: $headerCell.text().trim(),
          omit: shouldSkipColumn,
          computedDataIndex: cellIdx - omittedColumnCount, // Adjusted index for non-skipped columns
          seriesColor: $headerCell.data('plot-color'),
          isVisible: $headerCell.data('plot-hidden') !== true, // True by default
          yAxisTarget: axisIndex !== undefined ? parseInt(axisIndex, 10) : 0,
          lineStyle: $headerCell.data('plot-dash-style') || 'Solid', // Highcharts uses 'Solid' for solid line
          labelsEnabled: individualLabelVisibility,
          labelsColor: $headerCell.data('plot-datalabels-color') || $currentGrid.data('plot-datalabels-color')
        };

        const markerXPosition = $headerCell.data('plot-vline-x');
        if (markerXPosition === undefined) {
          // This is a regular data series column
          currentColumnConfig.valueScale = valueScalingFactor;
          // Highcharts converts 'column' to 'bar' automatically if chart is inverted, but explicit can be clearer
          currentColumnConfig.plotKind = individualPlotType === 'column' && isChartOrientationInverted ? 'bar' : individualPlotType;
          currentColumnConfig.stackGroup = stackGroupIdentifier;
          currentColumnConfig.unitSuffix = $headerCell.data('plot-unit');
          columnDefinitions[cellIdx] = currentColumnConfig; // Keep original index for alignment with TD loop
        } else {
          // This is a vertical line marker definition
          currentColumnConfig.xPosition = markerXPosition;
          currentColumnConfig.markerHeight = $headerCell.data('plot-vline-height');
          currentColumnConfig.markerName = $headerCell.data('plot-vline-name');
          verticalMarkers[cellIdx] = currentColumnConfig;
        }
      });

      // --- Initialize Chart Series Data Structures ---
      const chartSeriesData = [];

      // Populate series from column definitions
      columnDefinitions.forEach(function(colDef, originalColIndex) {
        // Skip the first column (assumed X-axis categories) and any explicitly omitted columns
        if (originalColIndex > 0 && !colDef.omit) {
          const currentSeriesConfig = {
            name: `${colDef.headerText}${colDef.unitSuffix ? ` (${colDef.unitSuffix})` : ''}`,
            data: [], // This will be populated from table body
            type: colDef.plotKind,
            stack: colDef.stackGroup,
            color: colDef.seriesColor,
            visible: colDef.isVisible,
            yAxis: colDef.yAxisTarget,
            dashStyle: colDef.lineStyle,
            marker: {
              enabled: false // Typically, markers are disabled for most chart types by default
            },
            dataLabels: {
              enabled: colDef.labelsEnabled,
              color: colDef.labelsColor,
              // Align labels based on chart type and inversion
              align: $currentGrid.data('plot-datalabels-align') ||
                (colDef.plotKind === 'column' && isChartOrientationInverted ? 'right' : 'center') // 'right' for inverted columns
            }
          };

          if (colDef.labelsEnabled) {
            const labelFormatterFn = fetchCallbackRef($currentGrid[0], 'plot-datalabels-formatter');
            if (labelFormatterFn) {
              currentSeriesConfig.dataLabels.formatter = function() {
                return labelFormatterFn(this.y);
              };
            }
          }
          chartSeriesData.push(currentSeriesConfig);
        }
      });

      // Add vertical line markers to series data
      verticalMarkers.forEach(function(markerDef) {
        if (markerDef !== undefined && !markerDef.omit) {
          chartSeriesData.push({
            name: markerDef.headerText,
            data: [{
              x: markerDef.xPosition,
              y: 0,
              name: markerDef.markerName
            }, {
              x: markerDef.xPosition,
              y: markerDef.markerHeight,
              name: markerDef.markerName
            }],
            type: 'spline', // Vertical lines are typically rendered as splines or lines
            color: markerDef.seriesColor,
            visible: markerDef.isVisible,
            marker: {
              enabled: false
            },
            enableMouseTracking: false // Often, markers are purely visual and not interactive
          });
        }
      });

      // --- Process Table Body (<tbody>) for Data Points ---
      const categoryLabels = []; // Stores X-axis categories
      const pointClickHandler = fetchCallbackRef($currentGrid[0], 'plot-point-callback');
      const isDateTimeAxis = $currentGrid.data('plot-x-axis-type') === 'datetime';

      const dataRows = jq('tbody:first tr', $currentGrid);
      dataRows.each(function(rowIdx, dataRow) {
        // Skip rows marked with data-plot-skip
        if (jq(dataRow).data('plot-skip') === true) {
          return;
        }

        const dataCells = jq('td', dataRow);
        dataCells.each(function(cellIdx, dataCell) {
          const colDef = columnDefinitions[cellIdx]; // Get definition for current column

          if (!colDef || colDef.omit) {
            return; // Skip if column definition is missing or marked to be omitted
          }

          const $dataCell = jq(dataCell);
          if (cellIdx === 0) {
            // This is the X-axis category cell
            categoryLabels.push($dataCell.text().trim());
          } else {
            // This is a data point cell for a series
            const rawContent = $dataCell.text().trim();
            const targetSeries = chartSeriesData[colDef.computedDataIndex]; // Use computed index for series array

            if (!targetSeries) {
              console.warn(`chartifyHtmlTable: No series found for column index ${cellIdx}. Data will be skipped.`);
              return;
            }

            if (rawContent.length === 0) {
              // Push null for empty cells, useful for gaps in line charts
              if (!isDateTimeAxis) { // Datetime axis should handle missing data differently or not explicitly push null
                targetSeries.data.push(null);
              }
            } else {
              const sanitizedValue = parseFloat(rawContent.replace(/\s/g, '').replace(/,/, '.'));
              if (isNaN(sanitizedValue)) {
                console.warn(`chartifyHtmlTable: Non-numeric value "${rawContent}" found in data cell for series "${targetSeries.name}". Skipping this point.`);
                targetSeries.data.push(null); // Or handle as appropriate
                return;
              }

              const parsedCellValue = Math.round(sanitizedValue * colDef.valueScale * 100) / 100; // Scale and round

              let customXValue = $dataCell.data('plot-x'); // Explicit X-value from cell
              if (isDateTimeAxis) {
                // For datetime axis, X-value is derived from the first cell of the row
                const dateString = jq('td', dataRow).first().text().trim();
                const dateObj = decodeDateTimeString(dateString);
                if (isNaN(dateObj.getTime())) {
                  console.error(`chartifyHtmlTable: Failed to parse datetime for X-axis from row "${dateString}". Skipping data point.`);
                  targetSeries.data.push(null);
                  return;
                }
                customXValue = dateObj.getTime() - dateObj.getTimezoneOffset() * 60 * 1000;
              }

              const dataPointName = $dataCell.data('plot-item-name') || rawContent; // Name for tooltip/data labels
              const dataPointObject = {
                name: dataPointName,
                y: parsedCellValue,
                x: customXValue // Will be undefined if no custom X and not datetime, letting Highcharts assign index
              };

              if (pointClickHandler) {
                dataPointObject.events = {
                  click: function() {
                    return pointClickHandler(this); // 'this' refers to the Highcharts point object
                  }
                };
              }

              // Specific handling for pie chart items
              if (colDef.plotKind === 'pie') {
                if ($dataCell.data('plot-item-highlight') === true) {
                  dataPointObject.sliced = true; // Highlight/slice the pie segment
                }
              }

              const dataPointColor = $dataCell.data('plot-item-color');
              if (dataPointColor !== undefined) {
                dataPointObject.color = dataPointColor;
              }

              targetSeries.data.push(dataPointObject);
            }
          }
        });
      });

      // --- Y-Axis Configuration ---
      const yAxisConfigurationCollection = [];
      for (let axisCounter = 0; axisCounter < yAxisCount; axisCounter++) {
        const axisKeyPrefix = `plot-y-axis-${axisCounter+1}`; // data-plot-y-axis-1, data-plot-y-axis-2
        const currentAxisSettings = {
          title: {
            text: $currentGrid.data(`${axisKeyPrefix}-title-text`) || null
          },
          max: $currentGrid.data(`${axisKeyPrefix}-max`) || null,
          min: $currentGrid.data(`${axisKeyPrefix}-min`) || null,
          reversed: $currentGrid.data(`${axisKeyPrefix}-reversed`) === true,
          opposite: $currentGrid.data(`${axisKeyPrefix}-opposite`) === true,
          tickInterval: $currentGrid.data(`${axisKeyPrefix}-tick-interval`) || null,
          labels: {
            rotation: $currentGrid.data(`${axisKeyPrefix}-rotation`) || 0
          },
          startOnTick: $currentGrid.data(`${axisKeyPrefix}-start-on-tick`) !== false, // Default true
          endOnTick: $currentGrid.data(`${axisKeyPrefix}-end-on-tick`) !== false, // Default true
          stackLabels: {
            enabled: $currentGrid.data(`${axisKeyPrefix}-stacklabels-enabled`) === true
          },
          gridLineInterpolation: $currentGrid.data(`${axisKeyPrefix}-grid-line-interpolation`) || null
        };

        const yAxisLabelFormatCallback = fetchCallbackRef($currentGrid[0], `${axisKeyPrefix}-formatter-callback`);
        if (yAxisLabelFormatCallback) {
          currentAxisSettings.labels.formatter = function() {
            return yAxisLabelFormatCallback(this.value);
          };
        }
        yAxisConfigurationCollection.push(currentAxisSettings);
      }

      // --- Color Palette Setup ---
      const standardPalette = [
        '#4572A7', '#AA4643', '#89A54E', '#80699B', '#3D96AE',
        '#DB843D', '#92A8CD', '#A47D7C', '#B5CA92'
      ];
      const chartColorSet = [];

      // Check for Highcharts theme colors
      const highchartsThemeColors = (typeof Highcharts !== 'undefined' && Highcharts.theme && Highcharts.theme.colors) || [];

      // Combine and override colors from data attributes, theme, and default palette
      const colorCountThreshold = Math.max(standardPalette.length, highchartsThemeColors.length);
      for (let i = 0; i < colorCountThreshold; i++) {
        const colorAttrKey = `plot-color-${i+1}`;
        const customColor = $currentGrid.data(colorAttrKey);
        if (customColor !== undefined) {
          chartColorSet.push(customColor);
        } else if (highchartsThemeColors[i] !== undefined) {
          chartColorSet.push(highchartsThemeColors[i]);
        } else {
          chartColorSet.push(standardPalette[i]);
        }
      }

      const seriesLineShadow = $currentGrid.data('plot-line-shadow');
      const seriesLineWidth = $currentGrid.data('plot-line-width') || 2;

      // Chart margins
      const topMarginPx = $currentGrid.data('plot-margin-top');
      const rightMarginPx = $currentGrid.data('plot-margin-right');
      const bottomMarginPx = $currentGrid.data('plot-margin-bottom');
      const leftMarginPx = $currentGrid.data('plot-margin-left');

      const xAxisLabelsAreVisible = $currentGrid.data('plot-x-axis-labels-enabled');
      const xAxisLabelTextSize = $currentGrid.data('plot-x-axis-labels-font-size');
      const xAxisLabelDisplayProps = {};
      if (xAxisLabelTextSize !== undefined) {
        xAxisLabelDisplayProps.fontSize = xAxisLabelTextSize;
      }

      // --- Construct Highcharts Options Object ---
      const highchartsOptionsObject = {
        colors: chartColorSet,
        chart: {
          renderTo: renderTargetElem,
          inverted: isChartOrientationInverted,
          marginTop: topMarginPx !== undefined ? topMarginPx : null,
          marginRight: rightMarginPx !== undefined ? rightMarginPx : null,
          marginBottom: bottomMarginPx !== undefined ? bottomMarginPx : null,
          marginLeft: leftMarginPx !== undefined ? leftMarginPx : null,
          spacingTop: $currentGrid.data('plot-spacing-top') || 10,
          height: $currentGrid.data('plot-height') || null,
          zoomType: $currentGrid.data('plot-zoom-type') || null,
          polar: $currentGrid.data('plot-polar') || null
        },
        title: {
          text: chartHeaderTxt
        },
        subtitle: {
          text: $currentGrid.data('plot-subtitle-text') || ''
        },
        legend: {
          enabled: $currentGrid.data('plot-legend-disabled') !== true, // Enabled by default
          layout: $currentGrid.data('plot-legend-layout') || 'horizontal',
          symbolWidth: $currentGrid.data('plot-legend-width') || 30,
          x: $currentGrid.data('plot-legend-x') || 15,
          y: $currentGrid.data('plot-legend-y') || 0
        },
        xAxis: {
          categories: !isDateTimeAxis ? categoryLabels : undefined,
          type: isDateTimeAxis ? 'datetime' : undefined,
          reversed: $currentGrid.data('plot-x-axis-reversed') === true,
          opposite: $currentGrid.data('plot-x-axis-opposite') === true,
          showLastLabel: $currentGrid.data('plot-x-axis-show-last-label') !== false, // Default true
          tickInterval: $currentGrid.data('plot-x-axis-tick-interval') || null,
          dateTimeLabelFormats: { // Default formats for datetime axis labels
            second: '%e. %b %H:%M',
            minute: '%e. %b %H:%M',
            hour: '%e. %b %H:%M',
            day: '%e. %b',
            week: '%e. %b',
            month: '%b \'%y',
            year: '%Y'
          },
          labels: {
            rotation: $currentGrid.data('plot-x-axis-rotation') || 0,
            align: $currentGrid.data('plot-x-axis-align') || 'center',
            enabled: xAxisLabelsAreVisible !== false, // Default true
            style: xAxisLabelDisplayProps
          },
          startOnTick: $currentGrid.data('plot-x-axis-start-on-tick'),
          endOnTick: $currentGrid.data('plot-x-axis-end-on-tick'),
          min: retrieveAxisBoundaryValue(this, 'min'),
          max: retrieveAxisBoundaryValue(this, 'max'),
          alternateGridColor: $currentGrid.data('plot-x-axis-alternate-grid-color') || null,
          title: {
            text: $currentGrid.data('plot-x-axis-title-text') || null
          },
          gridLineWidth: $currentGrid.data('plot-x-axis-grid-line-width') || 0,
          gridLineDashStyle: $currentGrid.data('plot-x-axis-grid-line-style') || 'ShortDot',
          tickmarkPlacement: $currentGrid.data('plot-x-axis-tickmark-placement') || 'between',
          lineWidth: $currentGrid.data('plot-x-axis-line-width') || 0
        },
        yAxis: yAxisConfigurationCollection,
        tooltip: {
          formatter: function() {
            if (isDateTimeAxis) {
              return `<b>${this.series.name}</b><br/>${Highcharts.dateFormat('%e. %b %Y', this.x)} : ${this.y}`;
            } else {
              const xLabel = categoryLabels[this.point.x] !== undefined ? categoryLabels[this.point.x] : this.point.x;
              if (primaryPlotType === 'pie') {
                return `<strong>${this.series.name}</strong><br />${xLabel} : ${this.point.y}`;
              }
              // For other types, use point name if available, otherwise xLabel
              return `<strong>${this.series.name}</strong><br />${xLabel} : ${this.point.name || this.point.y}`;
            }
          }
        },
        credits: {
          enabled: false // Disable Highcharts.com credit by default
        },
        plotOptions: {
          line: {
            dataLabels: {
              enabled: true // Always enabled for lines unless overridden
            },
            lineWidth: seriesLineWidth
          },
          area: {
            lineWidth: seriesLineWidth,
            shadow: seriesLineShadow !== undefined ? seriesLineShadow : true, // Default true
            fillOpacity: $currentGrid.data('plot-area-fill-opacity') || 0.75
          },
          pie: {
            allowPointSelect: true,
            cursor: 'pointer', // Indicate interactivity
            dataLabels: {
              enabled: true
            },
            showInLegend: $currentGrid.data('plot-pie-show-in-legend') === true,
            size: '80%'
          },
          series: {
            animation: false, // Disable animation for faster rendering
            stickyTracking: false, // Prevent tooltip from sticking to series
            stacking: isStackedSeriesPresent ? seriesStackingMode : null,
            groupPadding: $currentGrid.data('plot-group-padding') || 0
          }
        },
        series: chartSeriesData,
        exporting: {
          filename: chartHeaderTxt.replace(/ /g, '_') || 'chart_export', // Default filename
          buttons: {
            exportButton: {
              menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG'], // Default export options
              onclick: function() {
                this.exportChart();
              }
            }
          }
        }
      };

      // Allow external scripts to modify the Highcharts configuration before rendering
      $currentGrid.trigger('chartifyHtmlTable.preRenderEvent', [highchartsOptionsObject]);

      // Check if Highcharts library is loaded before attempting to create a chart
      if (typeof Highcharts === 'undefined' || typeof Highcharts.Chart === 'undefined') {
        console.error('Highcharts library not found. Please ensure it is loaded before initializing chartifyHtmlTable.');
        return;
      }

      // Finally, create the Highcharts chart
      new Highcharts.Chart(highchartsOptionsObject);

    });

    // Return the jQuery object for method chaining
    return this;
  };

})(jQuery);