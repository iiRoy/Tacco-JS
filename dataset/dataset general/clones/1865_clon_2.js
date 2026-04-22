window.PerfViz = window.PerfViz || {};
//
// Object to hold various performance visualization utilities.
//

PerfViz.findMeasurementCaption = function(measurementKey) {
  const termGlossary = {
    peakMemUsage: "Maximum Memory Consumption", // Maximum memory usage
    memUsage: "Current Memory Use", // Current memory usage
    cpuTime: "Central Processing Unit Time", // CPU processing time
    wallTime: "Elapsed Wall Clock Time", // Real-world elapsed time
    exclPeakMemUsage: "Exclusive Peak Memory Consumption", // Peak memory for exclusive operations
    exclMemUsage: "Exclusive Memory Utilization", // Memory for exclusive operations
    exclCpuTime: "Exclusive CPU Processing", // CPU time for exclusive operations
    exclWallTime: "Exclusive Wall Clock Duration" // Wall time for exclusive operations
  };
  // Check if the measurement key exists in our glossary.
  if (!termGlossary[measurementKey]) {
    return "Undefined Metric";
  }
  return termGlossary[measurementKey];
};

/**
 * Provides a sequential color generator for graphical elements.
 * Generates a distinct set of colors for chart segments.
 */
PerfViz.visualHues = function() {
  const hueArray = [
    '#4ECDC4', // Teal
    '#C7F464', // Lime Green
    '#FF6B6B', // Red-Orange
    '#C44D58', // Dark Red
    '#7D3C93', // Purple
    '#2ECC71', // Emerald Green
    '#F39C12'  // Orange
  ];
  return d3.scale.ordinal().range(hueArray);
};

/**
 * Formats a given Date object into a standard SQL-like datetime string.
 *
 * @param {Date} dateObj The Date object to be formatted.
 * @returns {string} The formatted date string.
 */
PerfViz.sqlDateTimeFormatter = d3.time.format('%y-%m-%d %H:%M:%S');

/**
 * A flexible date/time format string, adjusted based on data granularity.
 */
PerfViz.flexibleTimeFormat;

/**
 * Formats a numerical value by adding thousand separators and handling decimal places.
 * Any input will be coerced into a Number type.
 *
 * @param {any} inputVal The number or string that represents a number to format.
 * @param {number} precisionDigits The desired number of decimal places.
 * @returns {string} The formatted numerical string.
 */
PerfViz.numericPresenter = function(inputVal, precisionDigits) {
  if (precisionDigits === undefined) {
    precisionDigits = 2; // Default to two decimal places if not specified.
  }
  const delimiterChar = ',';

  let processedValue = +inputVal; // Type coercion to number
  let formattedString = processedValue.toFixed(precisionDigits);
  if (formattedString < 1000) {
    return formattedString;
  }
  let partsArray = formattedString.split(/\./);
  let integerPart = partsArray[0];
  let initialSliceIndex = integerPart.length % 3 || 3;

  integerPart = integerPart.slice(0, initialSliceIndex) + integerPart.slice(initialSliceIndex).replace(/(\d{3})/g, delimiterChar + '$1');
  partsArray[0] = integerPart;
  return partsArray.join('.');
};

//
// Utility for adding a legend entry to an SVG chart.
//
PerfViz.createChartKey = function(graphicsContainer, labelText, chartHeight, chartMargins, fillColor) {
  if (!labelText) {
    return; // Do nothing if no label is provided.
  }

  // Determine the vertical placement of the legend entry.
  let verticalPosition = chartHeight + chartMargins.bottom - 3; // 3 accounts for descenders.

  // Calculate horizontal offset based on previously added legend entries.
  let keyGroups = graphicsContainer.select('.legend-group');
  let horizontalPosition = 0;

  if (keyGroups[0].length && keyGroups[0][0]) {
    let boundsRect = keyGroups[keyGroups.length - 1][0].getBBox();
    // 20 pixels for spacing between legend items.
    horizontalPosition = boundsRect.x + boundsRect.width + 20;
  }

  let legendEntryGroup = graphicsContainer.append('g')
    .attr('class', 'legend-group');

  // Attach the small colored marker dot.
  legendEntryGroup.append('circle')
    .attr('fill', fillColor)
    .attr('r', 3)
    .attr('cx', 0)
    .attr('cy', -5);

  // Add the descriptive text for the legend entry.
  legendEntryGroup.append('text')
    .attr('x', 5)
    .attr('y', 0)
    .text(labelText);

  // Apply the calculated position to the entire legend group.
  legendEntryGroup.attr('transform', 'translate(' + horizontalPosition + ', ' + verticalPosition + ')');
};

/**
 * Attaches a dynamic tooltip/hover card to specified elements within a D3 chart.
 *
 * @param {d3.Selection} targetElement The D3 selection of the container element for the chart.
 * @param {Object} configuration Options object containing formatter, positioner, and bindTo properties.
 * @throws {Error} If required options (formatter, positioner, bindTo) are missing.
 */
PerfViz.attachHoverCard = function(targetElement, configuration) {
  if (
    !configuration.formatter ||
    !configuration.positioner ||
    !configuration.bindTo
  ) {
    throw new Error('The "formatter", "positioner", and "bindTo" options are mandatory.');
  }

  function haltEventPropagation() {
    d3.event.stopPropagation(); // Prevents event bubbling.
  }

  function initializeHoverCard(cardContainer) {
    let existingCardNode = cardContainer.select('#chart-popover'),
      hoverCardElement,
      cardContentArea;

    if (existingCardNode.empty()) {
      hoverCardElement = cardContainer.append('div');

      hoverCardElement.attr('class', 'popover top')
        .attr('id', 'chart-popover')
        .append('div').attr('class', 'arrow');

      cardContentArea = hoverCardElement.append('div')
        .attr('class', 'popover-content');

      // Prevent flickering by stopping mouseout events on the container and card itself.
      cardContainer.on('mouseout', haltEventPropagation);
      hoverCardElement.on('mouseout', haltEventPropagation);
      return {
        frame: hoverCardElement,
        content: cardContentArea
      };
    }
    hoverCardElement = existingCardNode;
    cardContentArea = existingCardNode.select('.popover-content');
    return {
      frame: hoverCardElement,
      content: cardContentArea
    };
  }

  const activeHoverCard = initializeHoverCard(d3.select(document.body));

  function concealHoverCard() {
    activeHoverCard.frame.transition().style('opacity', 0);
    d3.select(document).on('mouseout', null); // Remove global mouseout listener.
  }

  configuration.bindTo.on('mouseover', function(dataPoint, dataIndex) {
    let cardTop, cardLeft,
      cardHeight, cardWidth,
      content, cardPlacement;

    // Retrieve the content for the hover card.
    content = configuration.formatter.call(this, dataPoint, dataIndex);

    activeHoverCard.content.html(content);
    activeHoverCard.frame.style({
      display: 'block',
      opacity: 1
    });

    // Determine the position for the hover card.
    cardPlacement = configuration.positioner.call(this, dataPoint, dataIndex, activeHoverCard);

    cardWidth = parseInt(activeHoverCard.frame.style('width'), 10);
    cardHeight = parseInt(activeHoverCard.frame.style('height'), 10);

    let boundNode = targetElement.node();

    // Adjust position based on the dimensions of the hover card.
    // Magic numbers 7 & 5 are for arrow alignment.
    cardTop = boundNode.offsetTop + cardPlacement.y - (cardHeight / 2) - 7;
    cardLeft = boundNode.offsetLeft + cardPlacement.x - (cardWidth / 2) + 5;

    activeHoverCard.frame.style({
      top: cardTop + 'px',
      left: cardLeft + 'px'
    });

    d3.select(document).on('mouseout', concealHoverCard);
  });
};

/**
 * Generates and renders a pie chart within a specified container.
 *
 * @param {string} chartCanvas Selector for the HTML element where the chart will be rendered.
 * @param {Array<Object>} inputDataSet Array of data objects, each with 'name' and 'value' properties.
 * @param {Object} chartSettings Configuration options for the chart (e.g., height, width).
 */
PerfViz.drawCircleChart = function(chartCanvas, inputDataSet, chartSettings) {
  chartSettings = chartSettings || {};
  let chartRenderHeight = chartSettings.height || 400,
    chartRenderWidth = chartSettings.width || 400,
    segmentRadius = Math.min(chartRenderWidth, chartRenderHeight) / 2;

  let arcGenerator = d3.svg.arc()
    .outerRadius(segmentRadius - 10)
    .innerRadius(0);

  let pieLayout = d3.layout.pie()
    .sort(null) // No sorting of segments.
    .value(function(d) {
      return d.value;
    });

  let paletteGen = PerfViz.visualHues();

  chartCanvas = d3.select(chartCanvas);

  let svgContainer = chartCanvas.append('svg')
    .attr('width', chartRenderWidth)
    .attr('height', chartRenderHeight)
    .append('g')
    .attr('transform', "translate(" + chartRenderWidth / 2 + "," + chartRenderHeight / 2 + ")");

  let segmentGroups = svgContainer.selectAll('.chart-arc')
    .data(pieLayout(inputDataSet))
    .enter().append('g')
    .attr('class', 'chart-arc');

  segmentGroups.append('path')
    .attr('d', arcGenerator)
    .style('fill', function(d) {
      return paletteGen(d.data.value);
    });

  PerfViz.attachHoverCard(chartCanvas, {
    bindTo: segmentGroups,
    positioner: function(dataPoint, dataIndex) {
      let segmentCentroid, centerX, centerY;

      segmentCentroid = arcGenerator.centroid(dataPoint, dataIndex);

      // Adjust centroid coordinates based on the outer SVG group's transform.
      centerX = segmentCentroid[0] + (chartRenderHeight / 2);
      centerY = segmentCentroid[1] + (chartRenderWidth / 2);
      return {
        x: centerX,
        y: centerY
      };
    },
    formatter: function(dataPoint, dataIndex) {
      let tooltipText = '<strong>' + dataPoint.data.name +
        '</strong><br />' +
        PerfViz.numericPresenter(dataPoint.data.value, 0) + chartSettings.postfix;
      return tooltipText;
    }
  });
};

/**
 * Creates and displays a column chart (bar chart) using D3.js.
 *
 * @param {string} chartTarget Selector for the HTML element to contain the chart.
 * @param {Array<Object>} sourceData An array of objects, each having 'name' and 'value' properties.
 * @param {Object} graphOptions Optional settings for the chart (e.g., height, width, postfix).
 */
PerfViz.plotColumnGraph = function(chartTarget, sourceData, graphOptions) {
  graphOptions = graphOptions || {};
  let graphHeight = graphOptions.height || 400,
    graphWidth = graphOptions.width || 400,
    graphMargins = {
      top: 20,
      right: 20,
      bottom: 30,
      left: 50
    };

  let yScale = d3.scale.linear()
    .range([graphHeight, 0]);

  let xScale = d3.scale.ordinal()
    .rangeRoundBands([0, graphWidth], 0.1);

  let verticalAxis = d3.svg.axis()
    .scale(yScale)
    .tickFormat(d3.format('2s')) // Format large numbers with SI prefixes.
    .tickSize(6, 6, 0)
    .orient("left");

  let horizontalAxis = d3.svg.axis()
    .scale(xScale)
    .tickSize(6, 6, 0)
    .orient("bottom");

  chartTarget = d3.select(chartTarget);

  let mainSvgElement = chartTarget.append("svg")
    .attr("width", graphWidth + graphMargins.left + graphMargins.right)
    .attr("height", graphHeight + graphMargins.top + graphMargins.bottom)
    .append("g")
    .attr("transform", "translate(" + graphMargins.left + "," + graphMargins.top + ")");

  xScale.domain(sourceData.map(function(d, i) {
    return i + 1;
  })); // Use index for x-axis domain.
  yScale.domain([0, d3.max(sourceData, function(d) {
    return d.value;
  })]); // Y-axis from 0 to max value.

  mainSvgElement.append("g")
    .attr("class", "chart-axis x-axis")
    .attr("transform", "translate(0," + graphHeight + ")")
    .call(horizontalAxis);

  mainSvgElement.append("g")
    .attr("class", "chart-axis y-axis")
    .call(verticalAxis);

  mainSvgElement.selectAll('.chart-bar')
    .data(sourceData)
    .enter().append("rect")
    .attr("class", "chart-bar")
    .attr("x", function(d) {
      return xScale(d.value);
    }) // This seems incorrect, should be based on index or name. Original code uses `d.value` for x position, which is unusual for a bar chart where x is typically categorical. I'll preserve this original logic for Type II clone.
    .attr("width", xScale.rangeBand())
    .attr("y", function(d) {
      return yScale(d.value);
    })
    .attr("height", function(d) {
      return graphHeight - yScale(d.value);
    });

  PerfViz.attachHoverCard(chartTarget, {
    bindTo: mainSvgElement.selectAll('.chart-bar'),
    positioner: function(dataPoint, dataIndex) {
      let elementBox, posX, posY;
      elementBox = this.getBBox(); // Get the bounding box of the bar.

      // Adjust position based on the element's bounding box and some magic numbers for arrow.
      posX = elementBox.x + (elementBox.width * 1.5) - 7; // Adjusted X for tooltip.
      posY = elementBox.y; // Y position is top of the bar.
      return {
        x: posX,
        y: posY
      };
    },
    formatter: function(dataPoint, dataIndex) {
      let barLabelContent = '<strong>' + dataPoint.name +
        '</strong><br />' +
        PerfViz.numericPresenter(dataPoint.value, 0) + graphOptions.postfix;
      return barLabelContent;
    }
  });
};

/**
 * Generates a single or multi-series line graph with interactive tooltips.
 *
 * @param {string} plotArea Selector for the HTML container element.
 * @param {Array<Object>} seriesData An array of data objects, each containing keys for xAxis and series.
 * @param {Object} graphConfiguration Options object including xAxis, series, title, legend, postfix, height.
 * @throws {Error} If `xAxis` or `series` are not defined in `graphConfiguration`.
 */
PerfViz.plotLineChart = function(plotArea, seriesData, graphConfiguration) {
  graphConfiguration = graphConfiguration || {};
  if (!graphConfiguration.xAxis || !graphConfiguration.series) {
    throw new Error('The configuration must specify both "series" and "xAxis" properties.');
  }

  plotArea = d3.select(plotArea);

  let plotMargins = {
      top: 30,
      right: 20,
      bottom: 40,
      left: 50
    },
    plotHeight = graphConfiguration.height || (parseInt(plotArea.style('height'), 10) - plotMargins.top - plotMargins.bottom),
    plotWidth = graphConfiguration.width || (parseInt(plotArea.style('width'), 10) - plotMargins.left - plotMargins.right),
    finalDataIndex = seriesData.length - 1;

  if (!Array.isArray(graphConfiguration.series)) {
    graphConfiguration.series = [graphConfiguration.series];
  }

  // Convert X-axis string values into Date objects.
  seriesData = seriesData.map(function(d) {
    if (d[graphConfiguration.xAxis] instanceof Date) {
      return d; // Already a Date object.
    }

    let dateColumnValue = d[graphConfiguration.xAxis];

    let dtComponents, dComponents, tComponents;
    // Check for timestamp presence.
    if (dateColumnValue.includes(":")) {
      dtComponents = dateColumnValue.split(" ");
      dComponents = dtComponents[0].split('-');
      tComponents = dtComponents[1].split(':');
      PerfViz.flexibleTimeFormat = '%H:%M:%S'; // Format for time.
    } else {
      dComponents = dateColumnValue.split('-');
      tComponents = [0, 0, 0]; // Default time to midnight.
      PerfViz.flexibleTimeFormat = '%y-%m-%d'; // Format for date only.
    }

    let parsedDateObject = new Date(dComponents[0], dComponents[1] - 1, dComponents[2], tComponents[0], tComponents[1], tComponents[2]);
    d[graphConfiguration.xAxis] = parsedDateObject;
    return d;
  });

  let dateRangeExtent = d3.extent(seriesData, function(d) {
    return d[graphConfiguration.xAxis];
  });

  let timeScale = d3.scale.linear()
    .range([0, plotWidth])
    .domain(dateRangeExtent);

  let timeSpan = dateRangeExtent[1] - dateRangeExtent[0];

  // Determine maximum values across all series.
  let seriesMaxValues = [];
  graphConfiguration.series.forEach(function(seriesKeyIdentifier) {
    let currentSeriesMax = d3.max(seriesData, function(d) {
      return d[seriesKeyIdentifier];
    });
    seriesMaxValues.push(currentSeriesMax);
  });
  let verticalDomain = [0, d3.max(seriesMaxValues)];

  let valueScale = d3.scale.linear()
    .range([plotHeight, 0])
    .domain(verticalDomain);

  let timeLabelFormatter = d3.time.format(PerfViz.flexibleTimeFormat);

  let horizontalTimeAxis = d3.svg.axis()
    .scale(timeScale)
    .tickFormat(function(d) {
      return timeLabelFormatter(new Date(d));
    })
    .tickSize(9, 6, 0)
    .orient('bottom');

  // Adjust number of ticks to prevent label overlap (assuming 70px per label).
  horizontalTimeAxis.ticks(Math.abs(timeScale.range()[1] - timeScale.range()[0]) / 70);

  let verticalValueAxis = d3.svg.axis()
    .scale(valueScale)
    .tickFormat(d3.format('2s')) // SI prefix formatting.
    .tickSize(6, 6, 0)
    .orient("left");

  // Reduce number of ticks if chart height is too small.
  if (plotHeight / 18 < 10) {
    verticalValueAxis = verticalValueAxis.ticks(plotHeight / 18);
  }

  let chartSvgElement = plotArea.append("svg")
    .attr("width", plotWidth + plotMargins.left + plotMargins.right)
    .attr("height", plotHeight + plotMargins.top + plotMargins.bottom)
    .append("g")
    .attr("transform", "translate(" + plotMargins.left + "," + plotMargins.top + ")");

  // Render the X-axis.
  chartSvgElement.append("g")
    .attr("class", "chart-axis x-axis")
    .attr("transform", "translate(0," + plotHeight + ")")
    .call(horizontalTimeAxis);

  // Render the Y-axis.
  chartSvgElement.append("g")
    .attr("class", "chart-axis y-axis")
    .call(verticalValueAxis);

  // Add chart title if provided in options.
  if (graphConfiguration.title) {
    chartSvgElement.append('text')
      .attr('y', 10)
      .attr('x', plotWidth / 2)
      .style('text-anchor', 'middle')
      .text(graphConfiguration.title)
      .attr('transform', 'translate(0, ' + (plotMargins.top * -1) + ')');
  }

  let colorGenerator = PerfViz.visualHues();

  function renderLinePath(seriesIndex, seriesKey) {
    let pathGenerator = d3.svg.line()
      .x(function(d) {
        return timeScale(d[graphConfiguration.xAxis]);
      })
      .y(function(d) {
        return valueScale(d[seriesKey]);
      });

    chartSvgElement.append("path")
      .datum(seriesData)
      .attr("class", "chart-line")
      .style('stroke', function(d) {
        return colorGenerator(seriesIndex); // Assign color based on series index.
      })
      .attr("d", pathGenerator);
  }

  function renderDataPoints(seriesIndex, seriesKey) {
    let dotGroup = chartSvgElement.append('g')
      .attr('class', 'chart-dots');

    let dataPointCircle = dotGroup.selectAll('circle')