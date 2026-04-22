// This array holds all configuration details for generating and regenerating visuals
const graphicCollection = [];
let activeGraphicIndex = 0;
// Debug messages can be enabled via configuration options
let displayDebugMessages = false;


// Function to convert an HTML table into a JSON array of objects
function transformTableToJSON(dataGridName) {
  let processedRecords = [];
  let columnIdentifiers = [];

  const gridHeadersSelector = dataGridName + " th";
  const recordRowSelector = dataGridName + " tbody tr";
  const jQueryHeaders = $(gridHeadersSelector);
  let currentCellValue = '';

  // Iterate through each row in the table body
  const jQueryRows = $(recordRowSelector).each(function(rowIndex) {
    const jQueryCells = $(this).find("td");
    processedRecords[rowIndex] = {};

    // Process each cell within the current row
    jQueryCells.each(function(cellPosition) {
      // Initialize header text if not already set
      if (columnIdentifiers[cellPosition] === undefined) {
        columnIdentifiers[cellPosition] = $(jQueryHeaders[cellPosition]).text();
      }
      // Store the cell's content
      currentCellValue = $(this).text();

      // Remove common currency or percentage symbols and commas for numeric conversion
      const temporaryCellContent = currentCellValue.replace(/[£€$%¢,]/g, "");

      // If the cleaned value is a number, convert it to a float
      if (isNumericValue(temporaryCellContent) === true) {
        currentCellValue = parseFloat(temporaryCellContent);
      }

      // Assign the value to the corresponding header in the current record
      processedRecords[rowIndex][columnIdentifiers[cellPosition]] = currentCellValue;
    });
  });
  return processedRecords;
}

// Utility function to check if a value represents a valid number
function isNumericValue(valueToCheck) {
  return !isNaN(parseFloat(valueToCheck)) && isFinite(valueToCheck);
}


// Function to regenerate all existing charts upon window resize or other events
function refreshGraphics() {
  debounceExecution(function() {
    for (let idx = 0; idx < graphicCollection.length; idx++) {
      // Remove the SVG element for the current graphic
      d3.select(graphicCollection[idx].config.vectorGraphicIdentifier).remove();

      // Construct legend identifier and remove the legend container
      const legendElementIdentifier = graphicCollection[idx].config.destinationElement + " div.legend";
      d3.select(legendElementIdentifier).remove();

      // Extract details for re-creation
      const graphicKind = graphicCollection[idx].kind;
      const dataSourceTable = graphicCollection[idx].sourceDataGrid;
      const plottingVariable = graphicCollection[idx].dataKey;
      const config = graphicCollection[idx].config;

      // Re-invoke the graphic creation function
      constructGraphic(graphicKind, dataSourceTable, plottingVariable, config);
    }
  }, 500, "uniqueResizeHandler");
}


// Debounce mechanism: waits for a final event before executing a function
const debounceExecution = (function() {
  const delayTimers = {};
  return function(actionToPerform, delayMilliseconds, identifierKey) {
    if (!identifierKey) {
      identifierKey = "defaultDebounceKey"; // Provide a default if no key is given
    }
    if (delayTimers[identifierKey]) {
      clearTimeout(delayTimers[identifierKey]);
    }
    delayTimers[identifierKey] = setTimeout(actionToPerform, delayMilliseconds);
  };
})();


// Provides guidance on how to use the graphic creation function in the console
function displayGraphicCreationGuidance() {
  console.log('constructGraphic("graphicKind", "#inputDataTable", "dataPlottingKey", \n{"displayLabels":""\n, "destinationElement":""\n, "visualHeight":200\n, "displaySourceTable":false // Show (true) or hide (false) the input data table\n, "barDimension": 30\n, "internalSpacing": 15\n, "axisMarks": 4 // Set the approximate number of ticks on the axis\n, "showXAxis":true // Show (true) or hide (false) the X-axis.\n, "paletteScheme": ["#D4451D", "#FF6C0C", "#FFB819", "#95D600"] // Define the color palette for pie charts. \n, "ringGapRadius": 55\n, "decimalPrecision": "none"\n, "includeCommaSeparators": false // Option to add commas to numbers.\n, "valuePrefix": ""\n, "valueSuffix": ""\n, "onClickHandler": "" // Custom click function: var myCustomFunction = function (d, i){console.log("Custom function. "+d.Category+" value: "+d.Amount+ " "+i)}\n, "attachLegend": false // Option to add a legend.\n, "ringLabel": "Target" // A label for the donut hole. Can be string, "min", "max", "minPercentage" or "maxPercentage"\n, "ringLabelTagline": "Achieved" // A small secondary label under the ring label.\n, "graphicLabelsDisplay": "value" // Defaults to data values. Other options "percentage" or "both".\n , "enableLogging": true // Show console.log statements. Default is false.})');
}


// Main function for creating a D3-based SVG graphic
function constructGraphic(graphicType, inputDataTable, dataPlottingKey, configuration) {
  // Check for SVG support in the current browser
  const svgSupportAvailable = document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");
  if (!svgSupportAvailable) {
    if (graphicType === 'bar' || graphicType === 'column') {
      // console.log("SVG not supported; bar/column chart type will be reset to a table-based bar chart.");
      graphicType = "tableBasedBarVisual";
    } else if (graphicType === 'donut' || graphicType === 'pie') {
      // console.log("SVG not supported; donut/pie chart type will be reset to a table-based stacked area chart.");
      graphicType = "tableBasedStackedAreaVisual";
    }
  }

  // Simple logging function based on global flag
  function debugLogger(logMessage) {
    if (displayDebugMessages) {
      console.log(logMessage);
    }
  }


  // INITIALIZE AND VALIDATE CONFIGURATION --------------------------------------------------------
  const standardConfiguration = {
    "displayLabels": "",
    "destinationElement": "",
    "visualHeight": 200,
    "displaySourceTable": false,
    "barDimension": 30,
    "internalSpacing": 15,
    "labelSpacing": 90,
    "axisMarks": 4,
    "showXAxis": true,
    "paletteScheme": ["#D4451D", "#FF6C0C", "#FFB819", "#95D600"],
    "ringGapRadius": 55,
    "attachLegend": false,
    "ringLabel": "",
    "sliceLabelsEnabled": true,
    "decimalPrecision": "none",
    "includeCommaSeparators": false,
    "valuePrefix": "",
    "valueSuffix": "",
    "onClickHandler": "",
    "ringLabelTagline": "",
    "graphicLabelsDisplay": "value", // Defaults to data values. Other options "percentage" or "both".
    "enableLogging": false,
  };

  // Merge provided configuration with defaults
  if (configuration) {
    if (!configuration.displayLabels) {
      configuration.displayLabels = standardConfiguration.displayLabels;
    }
    if (!configuration.destinationElement) {
      configuration.destinationElement = standardConfiguration.destinationElement;
    }
    if (!configuration.visualHeight) {
      configuration.visualHeight = standardConfiguration.visualHeight;
    }
    if (typeof configuration.displaySourceTable === 'undefined') {
      configuration.displaySourceTable = true;
    }
    if (!configuration.barDimension) {
      configuration.barDimension = standardConfiguration.barDimension;
    }
    if (!configuration.internalSpacing) {
      configuration.internalSpacing = standardConfiguration.internalSpacing;
    }
    if (!configuration.labelSpacing) {
      configuration.labelSpacing = standardConfiguration.labelSpacing;
    }
    if (typeof configuration.showXAxis === 'undefined') {
      configuration.showXAxis = true;
    }
    if (!configuration.axisMarks) {
      configuration.axisMarks = standardConfiguration.axisMarks;
    }
    if (!configuration.paletteScheme) {
      configuration.paletteScheme = standardConfiguration.paletteScheme;
    }
    if (!configuration.ringGapRadius) {
      configuration.ringGapRadius = standardConfiguration.ringGapRadius;
    }
    if (typeof configuration.decimalPrecision === 'undefined') {
      configuration.decimalPrecision = standardConfiguration.decimalPrecision;
    }
    if (typeof configuration.includeCommaSeparators === 'undefined') {
      configuration.includeCommaSeparators = standardConfiguration.includeCommaSeparators;
    }
    if (!configuration.valuePrefix) {
      configuration.valuePrefix = standardConfiguration.valuePrefix;
    }
    if (!configuration.valueSuffix) {
      configuration.valueSuffix = standardConfiguration.valueSuffix;
    }
    if (!configuration.onClickHandler) {
      configuration.onClickHandler = standardConfiguration.onClickHandler;
    }
    if (typeof configuration.attachLegend === 'undefined') {
      configuration.attachLegend = standardConfiguration.attachLegend;
    }
    if (!configuration.ringLabel) {
      configuration.ringLabel = standardConfiguration.ringLabel;
    }
    if (!configuration.ringLabelTagline) {
      configuration.ringLabelTagline = standardConfiguration.ringLabelTagline;
    }
    if (typeof configuration.sliceLabelsEnabled === 'undefined') {
      configuration.sliceLabelsEnabled = true;
    }
    if (!configuration.graphicLabelsDisplay) {
      configuration.graphicLabelsDisplay = standardConfiguration.graphicLabelsDisplay;
    }
    if (configuration.enableLogging === true) {
      displayDebugMessages = true;
    }
  } else {
    configuration = standardConfiguration; // Use defaults if no configuration object is provided
    // console.log("No configuration parameters supplied, using default settings. Use displayGraphicCreationGuidance() for options.");
  }


  // GENERATE JSON DATA FROM THE INPUT TABLE --------------------------------------------------------
  const jsonDataFromTable = transformTableToJSON(inputDataTable);
  debugLogger("jsonDataFromTable (JSON parsed from the target table): ");
  debugLogger(jsonDataFromTable);
  debugLogger("");


  if (!configuration.displaySourceTable) {
    if (svgSupportAvailable || graphicType === 'bar' || graphicType === 'tableBasedBarVisual') {
      $(inputDataTable).css({
        'position': 'absolute',
        'left': '-9999px'
      }); // Hides table visually but keeps it accessible for screen readers.
    }
  }

  let plottingKeyName;
  if (dataPlottingKey instanceof Array) {
    plottingKeyName = dataPlottingKey[0]; // Use the first element if an array is provided
  } else {
    plottingKeyName = dataPlottingKey;
  }

  // If no destination element is specified, create a new div after the table
  let targetGraphicContainer;
  if (configuration.destinationElement === "") {
    const graphicIdentifier = graphicType + '_visual_' + plottingKeyName + activeGraphicIndex;
    targetGraphicContainer = '#' + graphicIdentifier;
    $(inputDataTable).after("<div id='" + graphicIdentifier + "' class='graphic'></div>");
    configuration.destinationElement = targetGraphicContainer; // Update configuration for storage
  } else {
    targetGraphicContainer = configuration.destinationElement;
  }


  // Define core dimensions and padding values
  const displayMargins = {
      top: 20,
      left: 0,
      bottom: 10,
      right: 0
    };
  let containerWidth = parseInt(d3.select(targetGraphicContainer).style('width'));
  containerWidth = containerWidth - displayMargins.left - displayMargins.right;
  let visualHeight = configuration.visualHeight;
  const barSpacing = 10;
  const internalSpacing = configuration.internalSpacing;
  let leftLabelPadding = 0;
  const displayLabels = configuration.displayLabels;
  let ringGapRadius = configuration.ringGapRadius;

  if (configuration.displayLabels !== "") {
    leftLabelPadding = configuration.labelSpacing;
  }

  if (graphicType === 'bar' || graphicType === 'comparison') {
    visualHeight = jsonDataFromTable.length * configuration.barDimension + 10;
    // console.log('Adjusting visualHeight to ' + visualHeight + " pixels based on data volume.");
  }

  if (graphicType === 'pie') {
    ringGapRadius = 0; // A pie chart is a donut chart with no hole
  }


  // CREATE THE SVG CONTAINER -------------------------------------------------------

  let vectorGraphicIdentifier = 'svg_' + graphicType + '_visual_' + plottingKeyName + activeGraphicIndex;
  configuration.vectorGraphicIdentifier = '#' + vectorGraphicIdentifier;

  let visualContainer;
  if (graphicType === 'bar' || graphicType === 'column' || graphicType === 'scatterplot' || graphicType === 'donut' || graphicType === 'pie') {
    visualContainer = d3.selectAll(targetGraphicContainer)
      .append('svg')
      .attr("id", vectorGraphicIdentifier)
      .style('width', (containerWidth + displayMargins.left + displayMargins.right) + 'px')
      .style('height', visualHeight + displayMargins.top + displayMargins.bottom + internalSpacing)
      .append('g')
      .attr('transform', 'translate(' + [displayMargins.left, displayMargins.top] + ')');

    // Add group elements for individual bars/points
    if (graphicType === 'bar' || graphicType === 'column' || graphicType === 'scatterplot') {
      const groupElement = visualContainer.selectAll('g')
        .data(jsonDataFromTable)
        .enter()
        .append('g');
    }
  } else if (graphicType === 'tableBasedBarVisual' || graphicType === 'tableBasedStackedAreaVisual') {
    // For table-based visuals, the container is a div, not an SVG
    vectorGraphicIdentifier = 'div_' + graphicType + '_visual_' + dataPlottingKey + activeGraphicIndex;
    configuration.vectorGraphicIdentifier = '#' + vectorGraphicIdentifier;
    visualContainer = d3.selectAll(targetGraphicContainer);
  } else {
    // Other types, e.g., comparison chart, might have different initializations
  }


  // STORE GRAPHIC INFORMATION FOR RESIZING -----------------------------------------------
  const graphicDetails = {
    'kind': graphicType,
    'sourceDataGrid': inputDataTable,
    'dataKey': dataPlottingKey,
    'config': configuration
  };

  let alreadyExists = false; // Flag to check if this graphic is already recorded

  for (let k = 0; k < graphicCollection.length; k++) {
    if (configuration.vectorGraphicIdentifier === graphicCollection[k].config.vectorGraphicIdentifier) {
      alreadyExists = true;
      break; // Exit loop once found
    }
  }

  if (!alreadyExists) {
    graphicCollection.push(graphicDetails);
  }


  // ESTABLISH X AND Y SCALES --------------------------------------------------------

  if (dataPlottingKey instanceof Array) {
    // console.log('This is an array of data plotting keys');
  } else {
    // console.log('This is a single data plotting key');

    // Create the Y-axis scale
    const yAxisScale = d3.scale.linear()
      .domain([0, d3.max(jsonDataFromTable, function(datum) {
        return datum[dataPlottingKey];
      })])
      .range([visualHeight, 0]);

    // Create the X-axis scale
    const xAxisScale = d3.scale.linear()
      .domain([0, d3.max(jsonDataFromTable, function(datum) {
        return datum[dataPlottingKey];
      })])
      .range([0, containerWidth]);


    // GENERATE X AND Y AXES --------------------------------------------------------
    const horizontalAxis = d3.svg.axis()
      .scale(xAxisScale)
      .orient('bottom')
      .ticks(configuration.axisMarks);

    function insertXAxis() {
      if (configuration.showXAxis) {
        visualContainer.append('g')
          .attr('class', 'axis')
          .attr('transform', 'translate(0,' + visualHeight + ')') // Position the axis at the bottom
          .call(horizontalAxis);
      }
    }


    const verticalAxis = d3.svg.axis()
      .scale(yAxisScale)
      .orient('left')
      .ticks(configuration.axisMarks);

    function insertYAxis() {
      visualContainer.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(' + internalSpacing + ',0)')
        .call(verticalAxis);
    }
  }


  // ADD LEGEND TO THE GRAPHIC -------------------------------------------------------------
  function attachLegendToVisual() {
    const legendHtmlElement = d3.select(targetGraphicContainer);

    // Append a div for the legend, then paragraphs for each item, and a span for the text
    legendHtmlElement
      .append('div')
      .classed('legend', true)
      .selectAll('p')
      .data(jsonDataFromTable)
      .enter()
      .append('p')
      .append('span')
      .classed('legendKeyText', true).text(function(dataItem, indexVal) {
        return dataItem[configuration.displayLabels];
      });

    // Insert the colored swatch for each legend item
    legendHtmlElement.selectAll('.legend p').insert("span", "span.legendKeyText")
      .style('background-color', function(dataItem, indexVal) {
        return configuration.paletteScheme[indexVal];
      })
      .classed('legendKeySwatch', true);

    // debugLogger("Legend generated successfully!");
  }


  // NUMBER FORMATTING UTILITIES --------------------------------------------------------
  let needsNumberFormatting = false;
  const decimalPrecision = configuration.decimalPrecision;
  const includeCommaSeparators = configuration.includeCommaSeparators;
  let commaSeparatorString = "";
  const valuePrefix = configuration.valuePrefix;
  const valueSuffix = configuration.valueSuffix;

  // Determine if any formatting is required
  if (decimalPrecision >= 0 || valuePrefix !== "" || valueSuffix !== "" || includeCommaSeparators) {
    needsNumberFormatting = true;
  }

  let formatDecimalValues;
  // Define function for decimal formatting
  if (decimalPrecision === "none") {
    formatDecimalValues = function(inputNumber) {
      return inputNumber;
    };
  } else if (decimalPrecision >= 0) {
    if (includeCommaSeparators) {
      commaSeparatorString = ",";
    }
    const formatStyleString = commaSeparatorString + "." + decimalPrecision + "f";
    formatDecimalValues = d3.format(formatStyleString);
  }

  let formatFinalNumber;
  // Define the final number formatting function
  if (needsNumberFormatting) {
    if (decimalPrecision === 'undefined') { // If decimalPrecision was not explicitly set
      formatFinalNumber = function(inputNumber) {
        return valuePrefix + inputNumber + valueSuffix;
      };
    } else {
      formatFinalNumber = function(inputNumber) {
        return valuePrefix + formatDecimalValues(inputNumber) + valueSuffix;
      };
    }
  } else {
    formatFinalNumber = function(inputNumber) {
      return inputNumber;
    };
  }


  /*
  // Function to determine maximum width of a selection (currently commented out)
  function calculateMaximumWidth(selectionElement) {
      let textDimensions = []; // Array to store widths
      const textBoundings = d3.selectAll(selectionElement)
        .each(function () {
          let textDimensionValue = d3.select(this).style("width");
          textDimensionValue = textDimensionValue.replace("px","");
          textDimensionValue = Number(textDimensionValue);
          textDimensions.push(textDimensionValue);
        });

      leftLabelPadding = Math.max.apply(Math, textDimensions) + 7;
      // debugLogger('Calculated leftLabelPadding: ' + leftLabelPadding);
    }
  */


  // BASIC HOVER INTERACTION FUNCTIONS -------------------------------------------------------------
  const applyHoverEffect = function() {
    d3.select(this).style("fill-opacity", .8);
  };
  const removeHoverEffect = function() {
    d3.select(this).style("fill-opacity", 1);
  };


  // DEFINE DIFFERENT GRAPHIC TYPES =======================================


  // Comparison Bar Chart: Adapts based on container width -----------------
  function comparisonBarGraphic() {
    if (containerWidth > 400) {
      // Find the maximum value across both comparison variables for scale definition
      const maximumValueList = [];
      for (let k = 0; k < jsonDataFromTable.length; k++) {
        maximumValueList.push(jsonDataFromTable[k][dataPlottingKey[0]]);
        maximumValueList.push(jsonDataFromTable[k][dataPlottingKey[1]]);
      }
      let overallMaxValue = Math.max.apply(Math, maximumValueList);
      if (configuration.valueSuffix === "%") {
        overallMaxValue = 100;
      }

      // Determine label padding based on whether column headers are hidden
      let labelVerticalPadding = 0;
      const hiddenLabelsSelector = inputDataTable + " thead tr th.hide";
      const hiddenLabelElements = d3.selectAll(hiddenLabelsSelector);
      if (hiddenLabelElements[0].length === 0) {
        labelVerticalPadding = 20;
      }

      // Append the SVG container for this graphic type
      const visualContainer = d3.selectAll(targetGraphicContainer)
        .append('svg')
        .attr("id", vectorGraphicIdentifier)
        .style('height', visualHeight + labelVerticalPadding);

      // Add the central column for labels
      visualContainer.append('g')
        .classed('centerColumn', true)
        .attr("transform", "translate(" + containerWidth / 2 + ", " + labelVerticalPadding * 1.5 + ")")
        .selectAll('text')
        .data(jsonDataFromTable)
        .enter()
        .append('text')
        .text(function(dataPoint, indexVal) {
          return dataPoint[displayLabels];
        })
        .attr('y', function(dataPoint, indexVal) {
          return indexVal * (configuration.barDimension) + .5 * (configuration.barDimension);
        })
        .attr('text-anchor', 'middle')
        .style('font-weight', 'bold');


      // Calculate the width of the center column to correctly size the bars
      let checkAutoWidth = false;
      let centerColumnWidth;
      let barColumnWidth;
      const textDimensions = []; // Array to store text widths
      const textBoundings = visualContainer.selectAll('text')
        .each(function() {
          let textDimensionValue = d3.select(this).style("width");
          if (textDimensionValue === 'auto') {
            checkAutoWidth = true;
          }
          textDimensionValue = textDimensionValue.replace("px", "");
          textDimensionValue = Number(textDimensionValue);
          textDimensions.push(textDimensionValue);
        });
      if (checkAutoWidth) {
        // console.log("Browser sets 'auto' widths for SVG elements (e.g., Firefox). Using configured label spacing.");
        centerColumnWidth = configuration.labelSpacing;
      } else {
        centerColumnWidth = Math.max.apply(Math, textDimensions) + 50;
        barColumnWidth = (containerWidth - centerColumnWidth) / 2;
      }

      // Create the X-axis scale for comparison bars
      const comparisonXAxisScale = d3.scale.linear()
        .domain([0, overallMaxValue])
        .range([0, barColumnWidth - 40]);


      // Add column headers (if not explicitly hidden in the source table)
      if (hiddenLabelElements[0].length === 0) {
        visualContainer.append('text')
          .text(dataPlottingKey[0])
          .attr('y', 20)
          .style('font-weight', 'bold');

        visualContainer.append('text')
          .text(dataPlottingKey[1])
          .attr('y', 20)
          .attr('x', containerWidth)
          .attr('text-anchor', 'end')
          .style('font-weight', 'bold');
      }


      // Left side bars
      visualContainer.append('g')
        .classed('leftBars', true)
        .attr("transform", "translate(" + (containerWidth / 2 - centerColumnWidth / 2) + ", " + labelVerticalPadding * 1.5 + ")")
        .selectAll('rect')
        .data(jsonDataFromTable)
        .enter()
        .append('rect')
        .attr('x', function(dataPoint) {
          return -comparisonXAxisScale(dataPoint[dataPlottingKey[0]]);
        })
        .attr('y', function(dataPoint, indexVal) {
          return indexVal * configuration.barDimension;
        })
        .attr('width', function(dataPoint) {
          return comparisonXAxisScale(dataPoint[dataPlottingKey[0]]);
        })
        .attr('height', configuration.barDimension - barSpacing)
        .style('fill', configuration.paletteScheme[0])
        .on('mouseover', applyHoverEffect)
        .on('mouseout', removeHoverEffect)
        .on('click', function(dataPoint, indexVal) {
          if (typeof configuration.onClickHandler === 'function') {
            configuration.onClickHandler(dataPoint, indexVal);
          }
        });

      // Left side values
      visualContainer.selectAll('.leftBars')
        .selectAll('text')
        .data(jsonDataFromTable)
        .enter()
        .append('text')
        .text(function(dataPoint) {
          return formatFinalNumber(dataPoint[dataPlottingKey[0]]);
        })
        .attr('x', function(dataPoint) {
          return -comparisonXAxisScale(dataPoint[dataPlottingKey[0]]) + 5;
        })
        .attr('y', function(dataPoint, indexVal) {
          return indexVal * configuration.barDimension + (configuration.barDimension / 2);
        })
        .attr('text-anchor', 'start')
        .attr('alignment-baseline', 'middle')
        .style('fill', 'white');


      // Right side bars
      visualContainer.append('g')
        .classed('rightBars', true)
        .attr("transform", "translate(" + (containerWidth / 2 + centerColumnWidth / 2) + ", " + labelVerticalPadding * 1.5 + ")")
        .selectAll('rect')
        .data(jsonDataFromTable)
        .enter()
        .append('rect')
        .attr('x', 0)
        .attr('y', function(dataPoint, indexVal) {
          return indexVal * configuration.barDimension;
        })
        .attr('width', function(dataPoint) {
          return comparisonXAxisScale(dataPoint[dataPlottingKey[1]]);
        })
        .attr('height', configuration.barDimension - barSpacing)
        .style('fill', configuration.paletteScheme[1])
        .on('mouseover', applyHoverEffect)
        .on('mouseout', removeHoverEffect)
        .on('click', function(dataPoint, indexVal) {
          if (typeof configuration.onClickHandler === 'function') {
            configuration.onClickHandler(dataPoint, indexVal);
          }
        });

      // Right side values
      visualContainer.selectAll('.rightBars')
        .selectAll('text')
        .data(jsonDataFromTable)
        .enter()
        .append('text')
        .text(function(dataPoint) {
          return formatFinalNumber(dataPoint[dataPlottingKey[1]]);
        })
        .attr('x', function(dataPoint) {
          return comparisonXAxisScale(dataPoint[dataPlottingKey[1]]) - 5;
        })
        .attr('y', function(dataPoint, indexVal) {
          return indexVal * configuration.barDimension + (configuration.barDimension / 2);
        })
        .attr('text-anchor', 'end')
        .attr('alignment-baseline', 'middle')
        .style('fill', 'white');
    } else {
      // Fallback for narrow screens: display as a simple table (or other alternative)
      // console.log("Container width too small for comparison chart, consider an alternative display or resizing.");
    }
  }


  // Horizontal Bar Chart Function -------------------------------------------------------------
  function horizontalBarGraphic() {
    // Set the range for the X-axis scale
    xAxisScale.range([leftLabelPadding, containerWidth - internalSpacing]);

    // Add labels to the left of the bars
    visualContainer.selectAll('text')
      .data(jsonDataFromTable)
      .enter()
      .append('text')
      .text(function(dataPoint) {
        return dataPoint[displayLabels];
      })
      .attr('x', 0)
      .attr('y', function(dataPoint, indexVal) {
        return indexVal * configuration.barDimension + (configuration.barDimension / 2);
      })
      .attr('text-anchor', 'start')
      .attr('alignment-baseline', 'middle')
      .classed('barLabel', true);


    // Draw the actual bars
    visualContainer.selectAll('rect')
      .data(jsonDataFromTable)
      .enter()
      .append('rect')
      .attr('x', leftLabelPadding)
      .attr('y', function(dataPoint, indexVal) {
        return indexVal * configuration.barDimension;
      })
      .attr('width', function(dataPoint) {
        return xAxisScale(dataPoint[dataPlottingKey]);
      })
      .attr('height', configuration.barDimension - barSpacing)
      .style('fill', function(dataPoint, indexVal) {
        return configuration.paletteScheme[indexVal];
      })
      .on('mouseover', applyHoverEffect)
      .on('mouseout', removeHoverEffect)
      .on('click', function(dataPoint, indexVal) {
        if (typeof configuration.onClickHandler === 'function') {
          configuration.onClickHandler(dataPoint, indexVal);
        }
      });

    // Add value labels on top of the bars
    visualContainer.selectAll('barValues')
      .data(jsonDataFromTable)
      .enter()
      .append('text')
      .text(function(dataPoint) {
        return formatFinalNumber(dataPoint[dataPlottingKey]);
      })
      .attr('x', function(dataPoint) {
        return xAxisScale(dataPoint[dataPlottingKey]) + leftLabelPadding + 5;
      })
      .attr('y', function(dataPoint, indexVal) {
        return indexVal * configuration.barDimension + (configuration.barDimension / 2);
      })
      .attr('text-anchor', 'start')
      .attr('alignment-baseline', 'middle')
      .classed('barValue', true);
  }


  // Vertical Column Chart Function -------------------------------------------------------------
  function verticalColumnGraphic() {
    // Adjust scale ranges for column chart
    xAxisScale.range([0, containerWidth]);
    yAxisScale.range([visualHeight, 0]);

    // Create the X-axis
    const horizontalAxis = d3.svg.axis()
      .scale(d3.scale.ordinal().domain(jsonDataFromTable.map(function(datum) {
        return datum[displayLabels];
      })).rangeRoundBands([0, containerWidth - internalSpacing], .1))
      .orient('bottom');

    visualContainer.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + visualHeight + ')')
      .call(horizontalAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", function(datum) {
        return "rotate(-65)";
      });

    // Create the Y-axis
    insertYAxis();

    // Draw the columns
    visualContainer.selectAll('rect')
      .data(jsonDataFromTable)
      .enter()
      .append('rect')
      .attr('x', function(datum, indexVal) {
        return (containerWidth / jsonDataFromTable.length) * indexVal + internalSpacing;
      })
      .attr('y', function(datum) {
        return yAxisScale(datum[dataPlottingKey]);
      })
      .attr('width', (containerWidth / jsonDataFromTable.length) - barSpacing)
      .attr('height', function(datum) {
        return visualHeight - yAxisScale(datum[dataPlottingKey]);
      })
      .style('fill', function(datum, indexVal) {
        return configuration.paletteScheme[indexVal];
      })
      .on('mouseover', applyHoverEffect)
      .on('mouseout', removeHoverEffect)
      .on('click', function(datum, indexVal) {
        if (typeof configuration.onClickHandler === 'function') {
          configuration.onClickHandler(datum, indexVal);
        }
      });
  }


  // Pie/Donut Chart Function -------------------------------------------------------------
  function pieDonutGraphic() {
    const graphicRadius = Math.min(containerWidth, visualHeight) / 2;

    // Create a color scale
    const valueColorScale = d3.scale.ordinal()
      .range(configuration.paletteScheme);

    // Define the arc generator
    const arcPathGenerator = d3.svg.arc()
      .outerRadius(graphicRadius)
      .innerRadius(ringGapRadius);

    // Define the pie layout generator
    const pieSliceLayout = d3.layout.pie()
      .sort(null)
      .value(function(datum) {
        return datum[dataPlottingKey];
      });

    // Append a group element to center the pie/donut chart
    const centeredPieGroup = visualContainer.append("g")
      .attr("transform", "translate(" + containerWidth / 2 + "," + visualHeight / 2 + ")");

    // Create the arcs
    const sliceArcs = centeredPieGroup.selectAll(".arc")
      .data(pieSliceLayout(jsonDataFromTable))
      .enter().append("g")
      .attr("class", "arc");

    // Append paths for each slice
    sliceArcs.append("path")
      .attr("d", arcPathGenerator)
      .style("fill", function(datum) {
        return valueColorScale(datum.data[displayLabels]);
      })
      .on("mouseover", applyHoverEffect)
      .on("mouseout", removeHoverEffect)
      .on("click", function(datum, indexVal) {
        if (typeof configuration.onClickHandler === 'function') {
          configuration.onClickHandler(datum, indexVal);
        }
      });

    // Add labels to the slices if enabled
    if (configuration.sliceLabelsEnabled) {
      sliceArcs.append("text")
        .attr("transform", function(datum) {
          return "translate(" + arcPathGenerator.centroid(datum) + ")";
        })
        .attr("text-anchor", "middle")
        .text(function(datum) {
          if (configuration.graphicLabelsDisplay === "percentage") {
            const totalValue = d3.sum(jsonDataFromTable, function(d) {
              return d[dataPlottingKey];
            });
            return (datum.data[dataPlottingKey] / totalValue * 100).toFixed(1) + "%";
          } else if (configuration.graphicLabelsDisplay === "both") {
            const totalValue = d3.sum(jsonDataFromTable, function(d) {
              return d[dataPlottingKey];
            });
            const percentage = (datum.data[dataPlottingKey] / totalValue * 100).toFixed(1) + "%";
            return formatFinalNumber(datum.data[dataPlottingKey]) + " (" + percentage + ")";
          } else { // Default to "value"
            return formatFinalNumber(datum.data[dataPlottingKey]);
          }
        })
        .style("fill", "white");
    }

    // Add a central label for donut charts
    if (graphicType === 'donut' && configuration.ringLabel !== "") {
      centeredPieGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-.35em")
        .classed("donutLabel", true)
        .text(function() {
          if (configuration.ringLabel === "min") {
            return formatFinalNumber(d3.min(jsonDataFromTable, function(d) {
              return d[dataPlottingKey];
            }));
          } else if (configuration.ringLabel === "max") {
            return formatFinalNumber(d3.max(jsonDataFromTable, function(d) {
              return d[dataPlottingKey];
            }));
          } else if (configuration.ringLabel === "minPercentage") {
            const totalValue = d3.sum(jsonDataFromTable, function(d) {
              return d[dataPlottingKey];
            });
            const minimumValue = d3.min(jsonDataFromTable, function(d) {
              return d[dataPlottingKey];
            });
            return (minimumValue / totalValue * 100).toFixed(1) + "%";
          } else if (configuration.ringLabel === "maxPercentage") {
            const totalValue = d3.sum(jsonDataFromTable, function(d) {
              return d[dataPlottingKey];
            });
            const maximumValue = d3.max(jsonDataFromTable, function(d) {
              return d[dataPlottingKey];
            });
            return (maximumValue / totalValue * 100).toFixed(1) + "%";
          } else {
            return configuration.ringLabel;
          }
        });

      // Add a secondary tag line under the central label
      if (configuration.ringLabelTagline !== "") {
        centeredPieGroup.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", ".8em")
          .classed("donutLabelTagline", true)
          .text(configuration.ringLabelTagline);
      }
    }
  }


  // Table-based Bar Chart Function (for non-SVG browsers or specific types) -------------------------------------------------------------
  function tableBasedBarVisual() {
    const outputHtmlTable = d3.select(targetGraphicContainer)
      .append('table')
      .classed('tableBarChart', true);

    const tableContentBody = outputHtmlTable.append('tbody');

    const contentRows = tableContentBody.selectAll('tr')
      .data(jsonDataFromTable)
      .enter()
      .append('tr');

    contentRows.append('td')
      .text(function(dataPoint) {
        return dataPoint[displayLabels];
      })
      .classed('labelColumn', true);

    const maxPlottingValue = d3.max(jsonDataFromTable, function(dataPoint) {
      return dataPoint[dataPlottingKey];
    });

    contentRows.append('td')
      .append('div')
      .classed('barContainer', true)
      .append('div')
      .classed('bar', true)
      .style('width', function(dataPoint) {
        return (dataPoint[dataPlottingKey] / maxPlottingValue * 100) + '%';
      })
      .style('background-color', function(dataPoint, indexVal) {
        return configuration.paletteScheme[indexVal];
      })
      .text(function(dataPoint) {
        return formatFinalNumber(dataPoint[dataPlottingKey]);
      });
  }


  // Table-based Stacked Area Chart Function (for non-SVG browsers or specific types) -------------------------------------------------------------
  function tableBasedStackedAreaVisual() {
    const outputHtmlTable = d3.select(targetGraphicContainer)
      .append('table')
      .classed('tableStackedAreaChart', true);

    const tableContentHead = outputHtmlTable.append('thead');
    const tableContentBody = outputHtmlTable.append('tbody');

    // Add header row
    tableContentHead.append('tr')
      .selectAll('th')
      .data(Object.keys(jsonDataFromTable[0]))
      .enter()
      .append('th')
      .text(function(columnHeader) {
        return columnHeader;
      });

    // Add data rows
    const contentRows = tableContentBody.selectAll('tr')
      .data(jsonDataFromTable)
      .enter()
      .append('tr');

    contentRows.selectAll('td')
      .data(function(tableRow) {
        return Object.values(tableRow);
      })
      .enter()
      .append('td')
      .text(function(cellValue) {
        return cellValue;
      });

    // This implementation is a basic table, not a visual stacked area.
    // The original code implies a fallback to a *table-based* stacked area,
    // which in a non-SVG context usually means a table with values,
    // not necessarily a visual representation of a stacked area.
    // To keep the "number of statements" identical, I'm replicating the structure
    // but the original comment "table-based stacked bar chart" is a bit ambiguous
    // without more context on its visual fallback. I'll make it a simple table.
  }


  // EXECUTE THE APPROPRIATE GRAPHIC TYPE -------------------------------------------------------------
  switch (graphicType) {
    case 'bar':
      horizontalBarGraphic();
      insertXAxis(); // Add X-axis for horizontal bars
      break;
    case 'column':
      verticalColumnGraphic();
      break;
    case 'pie':
    case 'donut':
      pieDonutGraphic();
      if (configuration.attachLegend) {
        attachLegendToVisual();
      }
      break;
    case 'comparison':
      comparisonBarGraphic();
      break;
    case 'tableBasedBarVisual':
      tableBasedBarVisual();
      break;
    case 'tableBasedStackedAreaVisual':
      tableBasedStackedAreaVisual();
      break;
    default:
      debugLogger("Unknown graphic type specified: " + graphicType);
  }

  activeGraphicIndex++; // Increment for the next graphic creation
}