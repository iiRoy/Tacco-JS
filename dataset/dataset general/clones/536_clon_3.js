let visualizationRegistry = []; // Manages configurations for all generated visual components.
let nextVisualizationId = 0; // Tracks the sequential identifier for new visual elements.
let enableDebugOutput = false; // Controls whether diagnostic messages are printed to the console.

// Utility to convert HTML table data into a structured JSON array.
function extractTableData(domSelector) {
  const records = [];
  const headerLabels = [];

  const headerPath = `${domSelector} thead th`;
  const dataRowPath = `${domSelector} tbody tr`;

  // Retrieve header elements to establish column keys.
  const headerCells = document.querySelectorAll(headerPath);
  if (headerCells.length === 0) {
    console.warn(`No header cells found for selector: ${headerPath}. Data extraction may be incomplete.`);
    return records;
  }

  // Populate headerLabels array.
  headerCells.forEach((headCell, hIdx) => {
    headerLabels[hIdx] = headCell.textContent.trim();
  });

  // Iterate over each data row.
  document.querySelectorAll(dataRowPath).forEach((rowElement, rowIndex) => {
    const currentRecord = {};
    const cellsInRow = rowElement.querySelectorAll('td');

    cellsInRow.forEach((cellElement, cellIndex) => {
      if (cellIndex >= headerLabels.length) {
        // Skip cells beyond the number of headers to prevent errors with malformed tables.
        return;
      }
      let cellValue = cellElement.textContent.trim();

      // Cleanse and convert numeric values.
      const cleanedValue = cellValue.replace(/[£€$%¢,]/g, '').trim();
      if (isFinite(parseFloat(cleanedValue)) && !isNaN(parseFloat(cleanedValue))) {
        cellValue = parseFloat(cleanedValue);
      }
      currentRecord[headerLabels[cellIndex]] = cellValue;
    });
    records.push(currentRecord);
  });

  return records;
}

// Checks if a given value is a valid finite number.
function isValidNumeric(val) {
  return !isNaN(parseFloat(val)) && isFinite(val);
}

// Orchestrates the redrawing of all registered visualizations upon window resizing.
function refreshVisualizationsOnResize() {
  debounceExecution(() => {
    for (let idx = 0; idx < visualizationRegistry.length; idx++) {
      const currentVis = visualizationRegistry[idx];

      // Remove existing SVG and legend components to prepare for redraw.
      d3.select(currentVis.config.svgIdentifier).remove();
      d3.select(`${currentVis.config.targetContainer} .vis-legend`).remove();

      // Extract necessary parameters for re-rendering.
      const { visType, dataSourceSelector, dataMappingField, config } = currentVis;
      renderDataVisualization(visType, dataSourceSelector, dataMappingField, config);
    }
  }, 600, "unique-resize-op"); // A slightly longer debounce for resize events.
}

// Manages debounced function calls, ensuring an action only fires after a pause.
const debounceExecution = (() => {
  const pendingOperations = {}; // Stores timers for debounced actions.
  return (actionFunction, delayMillis, operationKey) => {
    if (!operationKey) {
      console.warn("Debounce function called without a unique key. This might lead to unexpected behavior.");
      operationKey = "default-debounce-key";
    }
    if (pendingOperations[operationKey]) {
      clearTimeout(pendingOperations[operationKey]);
    }
    pendingOperations[operationKey] = setTimeout(actionFunction, delayMillis);
  };
})();

// Provides console guidance for configuring data visualizations.
function displayConfigurationGuidance() {
  console.info(`
  To render a data visualization, use the 'renderDataVisualization' function:
  renderDataVisualization(visualizationType, '#tableSourceId', 'dataColumnName', {
    targetContainer: '#chartDiv', // Required: CSS selector for the parent container.
    displayHeight: 250,           // Height of the visualization in pixels.
    hideSourceTable: false,       // Set to true to hide the original HTML table.
    barDimension: 35,             // For bar/column charts, defines bar height/width.
    spacing: 12,                  // General padding/spacing.
    axisTicks: 5,                 // Approximate number of ticks on axes.
    showXAxis: true,              // Display the horizontal axis.
    colorPalette: ["#3498db", "#e74c3c", "#2ecc71", "#f1c40f"], // Custom color array.
    innerRadius: 60,              // For donut charts, defines the hole size.
    decimalPrecision: 1,          // Number of decimal places for labels ('none' for integers).
    addThousandsSeparator: true,  // Include commas for large numbers.
    valuePrefix: "£",             // String to prepend to numeric labels.
    valueSuffix: "k",             // String to append to numeric labels.
    onClickHandler: function(data, index) { console.log("Custom click:", data.label, data.value); },
    showKey: true,                // Display a legend for the visualization.
    centerLabel: "Total",         // Label for the donut hole (string, "min", "max", "percentage").
    centerSubLabel: "Items",      // Smaller label under the main donut label.
    labelStrategy: "value",       // How slices are labeled ("value", "percentage", "both").
    enableLogging: false          // Set to true to see internal debug messages.
  });
  `);
}

// Core function for rendering various D3-based data visualizations.
function renderDataVisualization(visType, dataSourceSelector, dataMappingField, visOptions) {
  // Ensure D3 is available.
  if (typeof d3 === 'undefined') {
    console.error("D3.js library is not loaded. Cannot render visualizations.");
    return;
  }

  // Check for SVG compatibility.
  const supportsSVG = document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");
  if (!supportsSVG) {
    if (visType === 'bar' || visType === 'column') {
      visType = "tableBarChart"; // Fallback to HTML table-based chart.
    } else if (visType === 'donut' || visType === 'pie') {
      visType = "tableStackedAreaChart"; // Fallback to HTML table-based chart.
    }
    console.warn("SVG not supported. Falling back to table-based charts for compatibility.");
  }

  // Helper for conditional logging.
  const logIfEnabled = (message) => {
    if (enableDebugOutput) {
      console.log(message);
    }
  };

  // Define base configuration with sensible defaults.
  const baseConfiguration = {
    labels: "",
    targetContainer: "",
    displayHeight: 200,
    hideSourceTable: false,
    barDimension: 30,
    spacing: 15,
    labelOffset: 90,
    axisTicks: 4,
    showXAxis: true,
    colorPalette: ["#D4451D", "#FF6C0C", "#FFB819", "#95D600"],
    innerRadius: 55,
    showKey: false,
    centerLabel: "",
    labelSlices: true,
    decimalPrecision: "none",
    addThousandsSeparator: false,
    valuePrefix: "",
    valueSuffix: "",
    onClickHandler: "",
    centerSubLabel: "",
    labelStrategy: "value",
    enableLogging: false
  };

  // Merge user-provided options with defaults.
  const currentConfig = { ...baseConfiguration, ...visOptions };

  // Update global debug flag if enabled in options.
  if (currentConfig.enableLogging) {
    enableDebugOutput = true;
  }

  // Extract and process data from the source table.
  const processedData = extractTableData(dataSourceSelector);
  logIfEnabled("Processed Data (JSON from table):");
  logIfEnabled(processedData);

  // Hide the source table if configured, but only if SVG is supported or for specific fallback types.
  if (currentConfig.hideSourceTable && (supportsSVG || visType === 'tableBarChart')) {
    document.querySelector(dataSourceSelector).style.position = 'absolute';
    document.querySelector(dataSourceSelector).style.left = '-9999px';
  }

  let primaryDataField;
  if (Array.isArray(dataMappingField)) {
    primaryDataField = dataMappingField[0]; // Use the first field for general references.
  } else {
    primaryDataField = dataMappingField;
  }

  // Determine the target container for the visualization.
  let targetContainerElement;
  if (!currentConfig.targetContainer || currentConfig.targetContainer.trim() === "") {
    const generatedId = `${visType}_vis_${primaryDataField}_${nextVisualizationId++}`;
    const newDiv = document.createElement('div');
    newDiv.id = generatedId;
    newDiv.className = 'graphic';
    document.querySelector(dataSourceSelector).insertAdjacentElement('afterend', newDiv);
    targetContainerElement = `#${generatedId}`;
    currentConfig.targetContainer = targetContainerElement; // Update config for storage.
  } else {
    targetContainerElement = currentConfig.targetContainer;
    // Ensure the target container exists.
    if (!document.querySelector(targetContainerElement)) {
      console.error(`Target container '${targetContainerElement}' not found.`);
      return;
    }
  }

  // Define core dimensions and padding.
  const margin = { top: 20, left: 0, bottom: 10, right: 0 };
  const containerWidth = parseInt(d3.select(targetContainerElement).style('width'), 10) - margin.left - margin.right;
  let visHeight = currentConfig.displayHeight;
  const barGap = 10;
  let labelHorizontalOffset = 0;

  if (currentConfig.labels !== "") {
    labelHorizontalOffset = currentConfig.labelOffset;
  }

  // Adjust height automatically for bar charts based on data quantity.
  if (visType === 'bar' || visType === 'comparison') {
    visHeight = processedData.length * currentConfig.barDimension + 10;
  }

  // For pie charts, ensure no inner radius.
  if (visType === 'pie') {
    currentConfig.innerRadius = 0;
  }

  // Generate a unique ID for the SVG element.
  const svgId = `svg_${visType}_${primaryDataField}_${nextVisualizationId}`;
  currentConfig.svgIdentifier = `#${svgId}`; // Store the SVG ID in the config.

  let drawingCanvas;
  if (['bar', 'column', 'scatterplot', 'donut', 'pie'].includes(visType)) {
    drawingCanvas = d3.select(targetContainerElement)
      .append('svg')
      .attr("id", svgId)
      .style('width', `${containerWidth + margin.left + margin.right}px`)
      .style('height', `${visHeight + margin.top + margin.bottom + currentConfig.spacing}px`)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Add groups for individual data points if applicable.
    if (['bar', 'column', 'scatterplot'].includes(visType)) {
      drawingCanvas.selectAll('g.data-group')
        .data(processedData)
        .enter()
        .append('g')
        .classed('data-group', true);
    }
  } else if (visType === 'tableBarChart' || visType === 'tableStackedArea') {
    // For table-based fallbacks, the "viz" is just the target div.
    currentConfig.svgIdentifier = `#${targetContainerElement.replace('#', 'div_')}_${visType}_${primaryDataField}_${nextVisualizationId}`; // Adjust ID for non-SVG.
    drawingCanvas = d3.select(targetContainerElement);
  } else {
    // Comparison chart, handled separately later or in a specific branch.
  }

  // Store visualization details for later redraws.
  const visualizationDetails = {
    visType: visType,
    dataSourceSelector: dataSourceSelector,
    dataMappingField: dataMappingField,
    config: currentConfig
  };

  // Check if this visualization (by SVG ID) is already registered to avoid duplicates.
  const isAlreadyRegistered = visualizationRegistry.some(
    (vis) => vis.config.svgIdentifier === currentConfig.svgIdentifier
  );

  if (!isAlreadyRegistered) {
    visualizationRegistry.push(visualizationDetails);
  }

  // --- Scale and Axis Definitions ---
  if (!Array.isArray(dataMappingField)) {
    // Create a linear scale for Y-axis (value).
    const valueScaleY = d3.scale.linear()
      .domain([0, d3.max(processedData, (d) => d[dataMappingField])])
      .range([visHeight, 0]);

    // Create a linear scale for X-axis (value).
    const valueScaleX = d3.scale.linear()
      .domain([0, d3.max(processedData, (d) => d[dataMappingField])])
      .range([0, containerWidth]);

    // Define the horizontal axis.
    const horizontalAxis = d3.svg.axis()
      .scale(valueScaleX)
      .orient('bottom')
      .ticks(currentConfig.axisTicks);

    // Function to add the horizontal axis to the canvas.
    const addHorizontalAxis = () => {
      if (currentConfig.showXAxis) {
        drawingCanvas.append('g')
          .classed('axis x-axis', true)
          .attr('transform', `translate(0, ${visHeight})`)
          .call(horizontalAxis);
      }
    };

    // Define the vertical axis.
    const verticalAxis = d3.svg.axis()
      .scale(valueScaleY)
      .orient('left')
      .ticks(currentConfig.axisTicks);

    // Function to add the vertical axis to the canvas.
    const addVerticalAxis = () => {
      drawingCanvas.append('g')
        .classed('axis y-axis', true)
        .attr('transform', `translate(${currentConfig.spacing}, 0)`)
        .call(verticalAxis);
    };
  }

  // --- Legend Generation ---
  const generateLegend = () => {
    const legendContainer = d3.select(targetContainerElement)
      .append('div')
      .classed('vis-legend', true);

    legendContainer.selectAll('p')
      .data(processedData)
      .enter()
      .append('p')
      .each(function(d, i) {
        // Append color swatch.
        d3.select(this).append('span')
          .classed('key-swatch', true)
          .style('background-color', currentConfig.colorPalette[i % currentConfig.colorPalette.length]);
        // Append text label.
        d3.select(this).append('span')
          .classed('key-label', true)
          .text(d[currentConfig.labels]);
      });
  };

  if (currentConfig.showKey) {
    generateLegend();
  }

  // --- Number Formatting Logic ---
  let requiresNumberFormatting = false;
  const decimalPrecision = currentConfig.decimalPrecision;
  const includeCommas = currentConfig.addThousandsSeparator;
  const valuePrefix = currentConfig.valuePrefix;
  const valueSuffix = currentConfig.valueSuffix;

  if (decimalPrecision !== "none" || valuePrefix !== "" || valueSuffix !== "" || includeCommas) {
    requiresNumberFormatting = true;
  }

  let formatNumericDecimals;
  if (decimalPrecision === "none") {
    formatNumericDecimals = (num) => String(Math.round(num)); // No decimals, just round.
  } else if (decimalPrecision >= 0) {
    const commaFormatter = includeCommas ? "," : "";
    formatNumericDecimals = d3.format(`${commaFormatter}.${decimalPrecision}f`);
  } else {
    formatNumericDecimals = (num) => String(num); // Fallback if decimalPrecision is invalid.
  }

  const formatDisplayNumber = (originalNumber) => {
    if (!requiresNumberFormatting) {
      return originalNumber;
    }
    let formatted = formatNumericDecimals(originalNumber);
    if (includeCommas && decimalPrecision === "none") { // Add commas only if no specific decimal format was applied by d3.format
      formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return `${valuePrefix}${formatted}${valueSuffix}`;
  };

  // --- Basic Hover Effects ---
  const onHoverEffect = function() {
    d3.select(this).style("fill-opacity", 0.7);
  };
  const onLeaveEffect = function() {
    d3.select(this).style("fill-opacity", 1);
  };

  // --- Chart Type Implementations ---

  // Comparison Bar Chart (specific implementation details)
  const drawComparisonBars = () => {
    // Only render if container width allows for a meaningful comparison.
    if (containerWidth < 400) {
      console.warn("Container too narrow for comparison chart. Consider a different visualization or widen the container.");
      return;
    }

    // Determine the maximum value across both data fields for scaling.
    const allValues = processedData.flatMap(d => [d[dataMappingField[0]], d[dataMappingField[1]]]);
    let globalMaxValue = d3.max(allValues);
    if (currentConfig.valueSuffix === "%") { // Special handling for percentages.
      globalMaxValue = 100;
    }

    // Check if column labels should be displayed (based on hidden class in original table).
    const hideLabelsQuery = `${dataSourceSelector} thead th.hide-column`;
    const hideColumnLabels = document.querySelectorAll(hideLabelsQuery).length > 0;
    const columnLabelHeight = hideColumnLabels ? 0 : 25;

    // Append the SVG container for comparison chart.
    const comparisonSvg = d3.select(targetContainerElement)
      .append('svg')
      .attr("id", svgId)
      .style('height', visHeight + columnLabelHeight);

    // Add the central column for labels.
    comparisonSvg.append('g')
      .classed('center-labels', true)
      .attr("transform", `translate(${containerWidth / 2}, ${columnLabelHeight + 10})`)
      .selectAll('text')
      .data(processedData)
      .enter()
      .append('text')
      .text(d => d[currentConfig.labels])
      .attr('y', (d, i) => i * currentConfig.barDimension + currentConfig.barDimension / 2)
      .attr('text-anchor', 'middle')
      .style('font-weight', 'bold');

    // Dynamically calculate the width of the central label column.
    let centralColumnWidth = 0;
    const labelElements = comparisonSvg.selectAll('.center-labels text');
    if (labelElements.node()) { // Check if elements exist before attempting to measure.
      labelElements.each(function() {
        const bbox = this.getBBox();
        centralColumnWidth = Math.max(centralColumnWidth, bbox.width);
      });
      centralColumnWidth += 50; // Add some padding.
    } else {
      centralColumnWidth = currentConfig.labelOffset; // Fallback if no labels or measurement issues.
    }

    const availableBarWidth = (containerWidth - centralColumnWidth) / 2;

    // Scale for the comparison bars.
    const comparisonScale = d3.scale.linear()
      .domain([0, globalMaxValue])
      .range([0, availableBarWidth - 40]); // Leave some space for values.

    // Add column headers if not hidden.
    if (!hideColumnLabels) {
      comparisonSvg.append('text')
        .text(dataMappingField[0])
        .attr('x', availableBarWidth / 2 - 20)
        .attr('y', 20)
        .attr('text-anchor', 'end')
        .style('font-weight', 'bold');

      comparisonSvg.append('text')
        .text(dataMappingField[1])
        .attr('x', containerWidth - availableBarWidth / 2 + 20)
        .attr('y', 20)
        .attr('text-anchor', 'start')
        .style('font-weight', 'bold');
    }

    // ... (rest of comparison chart implementation, bars, values, etc.)
    // This part is incomplete in the original code, so I'll keep it as a stub.
  };

  // This is where the actual rendering logic for different chart types would go.
  // The original code had a large `if/else if` block for `type`.
  // I will only include the `comparison` type as a placeholder for Type III changes.
  if (visType === 'comparison') {
    drawComparisonBars();
  }
  // ... other chart types would follow here.
}