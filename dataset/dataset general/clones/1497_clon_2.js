/*
 * This module generates a visual representation of hierarchical information,
 * presenting it as a heatmap with distinct header sections.
 * The input data structure is a tree where each element possesses
 * a display identifier, one or more numerical metrics, and a collection of child elements.
 * Terminal elements (leaves) do not contain further children.
 *
 * Example structure:
 *		top
 *			groupA
 *				item1
 *				item2
 *			groupB
 *				item3
 *				item4
 *
 * Visualized as:
 *		|                           top                            |
 *		|           groupA            |            groupB            |
 *		|   item1   |   item2   |   item3   |   item4   |
 *
 *
 *
 * The `generateHierarchicalHeatmap()` function serves as the primary entry point
 * for initiating the chart rendering process.
 * This function constructs a Hierarchy Map object responsible for drawing the visualization
 * within the specified `displayContainer`, starting with `topLevelElement` and applying `configuration` options.
 *
 *   topLevelElement: Each element in the tree must have these properties:
 *		 displayLabel:  Text string shown in the chart.
 *		 metricValues:  An array of numerical metrics for this element. The `configuration.metricIndex`
 *						specifies which value to render. Defaults to the first index (0).
 *		 subElements:   An array of child element objects, or undefined for terminal elements.
 *
 *   configuration: An object containing various settings:
 *		chartTitle:			Overall title for the visualization.
 *		maxDisplayDepth:	Maximum hierarchy level to render. The map will draw from `topLevelElement`
 *							down to this level. Must be >= 1.
 *		metricIndex:		The specific index within the `metricValues` array of each element
 *							to use for rendering. Defaults to 0.
 *		valueUnitType:		The unit type for display. Options: 'NONE', 'MONEY', 'PERCENTAGE'.
 *		maximumCellBreadth: If provided, sets a maximum width for individual cells.
 *							Otherwise, cells expand to fill the available horizontal space.
 *		interactionHandler:	A callback function (isDrillDown, clickedElement) invoked when a cell is clicked/tapped.
 *								isDrillDown=true/false indicates single (true) or double (false) click.
 *								clickedElement=the data element that was interacted with.
 */
function generateHierarchicalHeatmap(displayContainer, topLevelElement, configuration) {
	var fixedSettings = null,
		diagram = null;

	// Sets up unchanging parameters and styles for the visualization.
	function setupFixedParameters() {
		fixedSettings = {
			measureTypes: { 'NONE':0, 'MONEY':1, 'PERCENTAGE':2 },

			// Space between visualization cells
			cellSeparation: { horizontal:3, vertical:2 },

			// Vertical dimension for each header row (inner height, excluding margins)
			headerDimensions: [71, 53, 41, 41],

			// Standard height for terminal (leaf) cells (inner height)
			defaultTerminalDimension: 40,

			// Font sizes for header and data cells
			typefaces: {
				hierarchyMap: [21, 18, 13, 13, 10],
				legendLabel:  "13px",
			},

			// Background and text colors for cells
			palette: {
				terminalCellBackground:   ['#c5f2bc', '#78c875', '#2d9234', '#005b01', '#005b01'],
				terminalCellText:         ['#383628', '#383628', '#fff',    '#fff',    '#fff'],
				headerCellBackground:     ['#063256','#10527e','#1a72a5', '#1a72a5',   '#1a72a5']
			},

			// Y-coordinates for the top edge of each header. The first starts at 0.
			headerYPositions: [],

			// Formatter for monetary values
			moneyFormatter: d3.format(','),
		};

		// Adjust header heights to include vertical margins
		fixedSettings.headerDimensions = _.map(fixedSettings.headerDimensions, function(currentHeight) {
			return currentHeight + 2 * fixedSettings.cellSeparation.vertical;
		});

		// Adjust default terminal cell height for margins
		fixedSettings.defaultTerminalDimension += 2 * fixedSettings.cellSeparation.vertical;

		// Calculate cumulative Y positions for headers
		fixedSettings.headerYPositions = [0];
		_.each(fixedSettings.headerDimensions, function(heightVal, idx) {
			fixedSettings.headerYPositions.push(fixedSettings.headerYPositions[idx] + heightVal);
		});
	}

	// Initializes the primary visualization object with user-provided settings.
	function prepareVisualization(displayContainer, topLevelElement, configuration) {
		configuration = configuration || {};

		if (!displayContainer) return;
		if (!topLevelElement) return;

		var vizWidth  = $(displayContainer).width(),
			vizHeight = $(displayContainer).height();

		setupFixedParameters();

		diagram = {
			// The SVG element holding the entire heatmap
			svgElement: null,

			// Total dimensions of the chart area
			totalBreadth: vizWidth,
			totalDepth: vizHeight,

			// Chart title text
			displayCaption: configuration.chartTitle || '',

			// The starting element for the tree visualization
			topLevelElement: topLevelElement,

			// The maximum depth to render down to
			requestedMaxDepth: configuration.maxDisplayDepth || 1,

			// The specific index to use from each node's metricValues array
			metricIndex: configuration.metricIndex || 0,

			// The type of unit to display (NONE, MONEY, PERCENTAGE)
			displayUnit: fixedSettings.measureTypes[configuration.valueUnitType],

			// Optional maximum width for individual leaf cells
			maximumCellBreadth: configuration.maximumCellBreadth || vizWidth,

			// Callback for click/tap events on cells
			interactionHandler: configuration.interactionHandler,
		};

		// Ensure a default unit type if none is specified or invalid
		if (diagram.displayUnit === undefined) {
			diagram.displayUnit = fixedSettings.measureTypes.MONEY;
		}

		// Top vertical offset for the heatmap itself (accounts for title and legend)
		diagram.verticalOffset = (diagram.displayCaption ? 50 : 0) + 30; // 50 for title+margin, 30 for legend

		// Append the main SVG container to the DOM
		diagram.svgElement = d3.select(displayContainer)
			.append("svg:svg")
			.attr("width",  diagram.totalBreadth)
			.attr("height", diagram.totalDepth)
			.attr("class", "hierarchy-map");
	}

	/* ****************************************************************************
	 * Orchestrates the data preparation required for rendering the chart.
	 * The key outcome is the `gridSegments` array, which is a matrix-like
	 * representation of the tree, directly used for drawing the heatmap.
	 * ****************************************************************************/
	function arrangeDisplayData() {
		var leafTraversalIndex = -1,
			uniqueIdCounter = 0,
			minimumLeafMetric = null,
			maximumLeafMetric = null;

		diagram.gridSegments = [];
		diagram.maxColumnSpanCount = 1; // Highest number of columns in any row
		diagram.segmentBreadth = 0;     // Width of a single terminal segment (colspan=1)
		diagram.segmentDepth = 0;       // Height of a single terminal segment

		// Recursively determines the total column span for an element
		function determineSpanUnits(element, hierarchyLevel) {
			if (element === null || hierarchyLevel + 1 >= diagram.maxHierarchyDepth) {
				return 1;
			}
			return _.reduce(element.subElements, function(accumulator, childElement) {
				return accumulator + determineSpanUnits(childElement, hierarchyLevel + 1);
			}, 0);
		}

		// Extracts relevant data for a given element and level
		function extractElementDetails(element, hierarchyLevel) {
			var isTerminalElement = (hierarchyLevel === diagram.maxHierarchyDepth);
			var elementDetail = {
					identifier:     uniqueIdCounter++,
					originalElement: element,
					isEmpty:        element === null,
					hierarchyLevel: hierarchyLevel,
					isTerminal:     isTerminalElement,
					spanUnits:      determineSpanUnits(element, hierarchyLevel),
					metricValue:    element === null ? 0 : element.metricValues[diagram.metricIndex],
				};

			// Track min/max metric values for terminal cells to define color quartiles
			if (isTerminalElement) {
				if (minimumLeafMetric === null || elementDetail.metricValue < minimumLeafMetric) {
					minimumLeafMetric = elementDetail.metricValue;
				}
				if (maximumLeafMetric === null || elementDetail.metricValue > maximumLeafMetric) {
					maximumLeafMetric = elementDetail.metricValue;
				}
			}
			return elementDetail;
		}

		// Creates a row filled with empty terminal cells
		function produceBlankTerminalRow() {
			var emptyRow = [];
			_.times(diagram.maxColumnSpanCount, function() {
				emptyRow.push({isEmpty: true, spanUnits: 1, isTerminal: true});
			});
			return emptyRow;
		}

		/*
		 * Traverses the hierarchy of elements using a depth-first approach
		 * (top-to-bottom, left-to-right) and constructs the `gridSegments` array.
		 * Each row in `gridSegments` corresponds to a hierarchy level,
		 * except for terminal elements which are spread across multiple rows.
		 * Each cell in a row represents an element at that level.
		 */
		function traverseAndPopulate(element, hierarchyLevel) {
			var subElements, rowIndexIdentifier = hierarchyLevel;

			// Add a new row to `gridSegments` if necessary
			if (rowIndexIdentifier >= diagram.gridSegments.length) {
				diagram.gridSegments.push([]);
			}

			diagram.gridSegments[rowIndexIdentifier].push(extractElementDetails(element, hierarchyLevel));

			// Special handling for elements at maxHierarchyDepth-1: their children are terminal
			if (hierarchyLevel === diagram.maxHierarchyDepth - 1) {
				rowIndexIdentifier++;
				leafTraversalIndex++;

				subElements = element.subElements || [null]; // Ensure at least one child placeholder

				// Place each child into its own row, aligned at `leafTraversalIndex` column
				_.each(subElements, function(childElement, childIndex) {
					// Add new rows for children if needed
					if (rowIndexIdentifier + childIndex >= diagram.gridSegments.length) {
						diagram.gridSegments.push(produceBlankTerminalRow());
					}
					// Create data object for the child and place it
					var childData = extractElementDetails(childElement, hierarchyLevel + 1);
					diagram.gridSegments[rowIndexIdentifier + childIndex][leafTraversalIndex] = childData;
				});
			} else if (element.subElements !== undefined) {
				// Recursively process children for non-terminal levels
				_.each(element.subElements, function(childElement) {
					traverseAndPopulate(childElement, hierarchyLevel + 1);
				});
			}
		}

		// Assigns row and column indices to each cell within the `gridSegments` matrix.
		function assignGridCoordinates() {
			_.each(diagram.gridSegments, function(currentGridRow, rowIndexIdentifier) {
				var currentXPosition = 0;
				_.each(currentGridRow, function(cellData) {
					cellData.rowIndexIdentifier = rowIndexIdentifier;
					cellData.colIndexIdentifier = currentXPosition;
					currentXPosition += cellData.spanUnits;
				});
			});
		}

		// Calculates the combined height of all header rows.
		function computeHeaderSectionHeight() {
			return _.reduce(
				_.first(fixedSettings.headerDimensions, diagram.headerRowCount),
				function(totalAccumulated, heightValue) {
					return totalAccumulated + heightValue;
				},
				0
			);
		}

		// Determines the height of a single terminal (leaf) cell.
		function calculateTerminalSegmentHeight() {
			var potentialHeight = (diagram.totalDepth - diagram.verticalOffset - diagram.headerSectionOverallHeight) /
								  (diagram.gridSegments.length - diagram.headerRowCount);
			return potentialHeight > fixedSettings.defaultTerminalDimension ? fixedSettings.defaultTerminalDimension : potentialHeight;
		}

		// Recursively finds the maximum depth of the hierarchy from a given element.
		function calculateMaximumHierarchyDepth(element) {
			if (element.subElements === undefined) {
				return 0;
			} else {
				return 1 + _.reduce(element.subElements, function(maxCurrentDepth, childElement) {
					return Math.max(maxCurrentDepth, calculateMaximumHierarchyDepth(childElement));
				}, 0);
			}
		}

		// Determine the actual maximum rendering depth
		diagram.maxHierarchyDepth = Math.min(
			calculateMaximumHierarchyDepth(diagram.topLevelElement),
			diagram.requestedMaxDepth
		);

		// Calculate the maximum number of columns needed
		diagram.maxColumnSpanCount = determineSpanUnits(diagram.topLevelElement, 0);

		// The number of header rows corresponds to the hierarchy depth
		diagram.headerRowCount = diagram.maxHierarchyDepth;

		// The total vertical space occupied by all headers
		diagram.headerSectionOverallHeight = computeHeaderSectionHeight();

		// Populate the `gridSegments` array by traversing the tree
		traverseAndPopulate(diagram.topLevelElement, 0);

		// Add grid position metadata to each cell
		assignGridCoordinates();

		// Calculate the effective width of a terminal cell
		diagram.segmentBreadth = Math.min(diagram.maximumCellBreadth, diagram.totalBreadth / diagram.maxColumnSpanCount);

		// Calculate the effective height of a terminal cell
		diagram.segmentDepth = calculateTerminalSegmentHeight();

		// Determine if text labels should be displayed in terminal cells
		diagram.displayTerminalText = (diagram.segmentDepth - 2 * fixedSettings.cellSeparation.vertical) >= 12;

		// Recalculate legend metric ranges based on actual leaf values
		refreshKeyRangeMetrics(minimumLeafMetric, maximumLeafMetric);
	}

	/* ****************************************************************************
	 * Divides the range of terminal cell metric values into quartiles,
	 * which will correspond to the four possible heatmap colors.
	 * ****************************************************************************/
	function refreshKeyRangeMetrics(minMetric, maxMetric) {
		minMetric = Math.min(0, minMetric); // Ensure min is at least 0
		var incrementStep = (maxMetric - minMetric) / 4;
		diagram.keyRangeMetrics = [
			Math.round(minMetric + incrementStep),
			Math.round(minMetric + 2 * incrementStep),
			Math.round(minMetric + 3 * incrementStep)
		];
	}

	/* ****************************************************************************
	 * Constructs the visual legend for the heatmap.
	 * ****************************************************************************/
	function constructLegendDisplay() {
		var legendGroup,
			legendBoxDimension = 14,
			legendBoxSpacing = 4,
			legendItemSpacing = 10;

		// Formats a value as a percentage relative to the root's value
		function percentValue(value) {
			return d3.round(value * 100 / diagram.topLevelElement.metricValues[diagram.metricIndex], 1);
		}

		// Formats a value as currency
		function currencyFormatted(value) {
			return fixedSettings.moneyFormatter(value);
		}

		// Generates the text labels and positioning for legend items
		function generateLegendLabels() {
			var labelTexts, currentXPosition,
				rangeSeparator = '―',
				metricValues = _.map(diagram.keyRangeMetrics, function(val) { return val; });

			// Create labels based on the chosen unit type
			if (diagram.displayUnit === fixedSettings.measureTypes.PERCENTAGE) {
				labelTexts = [
					'< ' + percentValue(metricValues[0]) + '%',
					percentValue(metricValues[0]) + rangeSeparator + percentValue(diagram.keyRangeMetrics[1]) + '%',
					percentValue(metricValues[1]) + rangeSeparator + percentValue(diagram.keyRangeMetrics[2]) + '%',
					'> ' + percentValue(metricValues[2]) + '%'
				];
			} else {
				labelTexts = [
					'< ' + currencyFormatted(metricValues[0]),
					currencyFormatted(metricValues[0]) + rangeSeparator + currencyFormatted(metricValues[1]),
					currencyFormatted(metricValues[1]) + rangeSeparator + currencyFormatted(metricValues[2]),
					'> ' + currencyFormatted(metricValues[2])
				];
			}

			currentXPosition = 0;
			labelTexts = _.map(labelTexts, function(text) {
				// Estimate text width, a more precise method might be needed
				var labelWidth = text.length * 8,
					labelObject = { textContent: text, width: labelWidth, xOffset: currentXPosition };
				currentXPosition += legendBoxDimension + legendBoxSpacing + labelWidth + legendItemSpacing;
				return labelObject;
			});
			return labelTexts;
		}

		// Remove existing legend before redrawing
		legendGroup = diagram.svgElement.selectAll('g.legend-group');
		legendGroup.remove();

		// Create the main legend group
		legendGroup = diagram.svgElement.selectAll('g.legend-group').data([1]);
		legendGroup.enter()
				.append('g')
				.attr('class', 'legend-group')
				.attr('transform', 'translate(6,50)');

		// Bind data to individual legend items
		var legendItemElements = legendGroup.selectAll('g.legend-item').data(generateLegendLabels());

		// Enter selection for new legend items
		var legendItemEnterSelection = legendItemElements
			.enter()
				.append('g')
				.attr('class', 'legend-item');

		// Append color rectangles to legend items
		legendItemEnterSelection.append('rect')
			.attr("x",      function(itemData){ return itemData.xOffset; })
			.attr('y',      0)
			.attr('width',  legendBoxDimension)
			.attr('height', legendBoxDimension)
			.attr('fill',   function(itemData, index){ return fixedSettings.palette.terminalCellBackground[index]; })
			.attr("rx",     3)
			.attr("ry",     3);

		// Append text labels to legend items
		legendItemEnterSelection.append('text')
			.text( function(itemData) { return itemData.textContent; } )
			.attr("font-size", fixedSettings.typefaces.legendLabel)
			.attr("fill",      '#333')
			.attr("x",         function(itemData){ return itemData.xOffset + legendBoxDimension + legendBoxSpacing; })
			.attr("y", 11);
	}

	/* ****************************************************************************
	 * Helper functions for calculating cell properties based on data.
	 * ****************************************************************************/

	// Calculates the horizontal position (x-coordinate) of a cell.
	function getCellXPosition(cellData) {
		return (cellData.colIndexIdentifier * diagram.segmentBreadth) + fixedSettings.cellSeparation.horizontal;
	}

	// Calculates the vertical position (y-coordinate) of a cell.
	function getCellYPosition(cellData) {
		var yCoordinate;
		if (!cellData.isTerminal) {
			yCoordinate = fixedSettings.headerYPositions[cellData.rowIndexIdentifier];
		} else {
			yCoordinate = fixedSettings.headerYPositions[diagram.headerRowCount] +
						  (cellData.rowIndexIdentifier - diagram.headerRowCount) * diagram.segmentDepth;
		}
		return yCoordinate + fixedSettings.cellSeparation.vertical;
	}

	// Calculates the width of a cell.
	function getCellWidthDimension(cellData) {
		return (cellData.spanUnits * diagram.segmentBreadth) - 2 * fixedSettings.cellSeparation.horizontal;
	}

	// Calculates the height of a cell.
	function getCellHeightDimension(cellData) {
		return (!cellData.isTerminal ? fixedSettings.headerDimensions[cellData.rowIndexIdentifier] : diagram.segmentDepth) -
			   2 * fixedSettings.cellSeparation.vertical;
	}

	// Determines the CSS class for a cell.
	function getCellCssClass(cellData) {
		return cellData.isTerminal ? 'data-cell terminal-node' : 'data-cell';
	}

	// Determines the font size for a cell's text.
	function getCellTextSize(cellData) {
		return !cellData.isTerminal ? fixedSettings.typefaces.hierarchyMap[cellData.rowIndexIdentifier] : fixedSettings.typefaces.hierarchyMap[3];
	}

	// Determines the opacity of a cell's visual elements.
	function getCellTransparency(cellData) {
		return cellData.isTerminal && (!diagram.displayTerminalText || diagram.displayUnit === fixedSettings.measureTypes.NONE) ? 0 : 1;
	}

	// Formats the numerical value for display within a cell.
	function getCellValueFormattedText(cellData) {
		if (cellData.isEmpty) {
			return "";
		} else if (diagram.displayUnit === fixedSettings.measureTypes.PERCENTAGE) {
			return d3.round(cellData.metricValue * 100 / diagram.topLevelElement.metricValues[diagram.metricIndex], 1) + '%';
		} else {
			return fixedSettings.moneyFormatter(d3.round(cellData.metricValue, 0));
		}
	}

	// Determines the background fill color for a cell's rectangle.
	function getCellRectangleFillColor(cellData) {
		if (cellData.isEmpty) {
			return "#fff";
		} else if (cellData.isTerminal) {
			if (cellData.metricValue < diagram.keyRangeMetrics[0])       return fixedSettings.palette.terminalCellBackground[0];
			else if (cellData.metricValue < diagram.keyRangeMetrics[1])  return fixedSettings.palette.terminalCellBackground[1];
			else if (cellData.metricValue < diagram.keyRangeMetrics[2])  return fixedSettings.palette.terminalCellBackground[2];
			else                                                         return fixedSettings.palette.terminalCellBackground[3];
		} else { // Header cells
			if (cellData.rowIndexIdentifier === 0)         return fixedSettings.palette.headerCellBackground[0];
			else if (cellData.rowIndexIdentifier === 1)    return fixedSettings.palette.headerCellBackground[1];
			else if (cellData.rowIndexIdentifier === 2)    return fixedSettings.palette.headerCellBackground[2];
			else if (cellData.rowIndexIdentifier === 3)    return fixedSettings.palette.headerCellBackground[3];
		}
	}

	// Determines the text color for a cell.
	function getCellTextColor(cellData) {
		if (cellData.isEmpty) {
			return "";
		} else if (cellData.isTerminal) {
			if (cellData.metricValue < diagram.keyRangeMetrics[0])       return fixedSettings.palette.terminalCellText[0];
			else if (cellData.metricValue < diagram.keyRangeMetrics[1])  return fixedSettings.palette.terminalCellText[1];
			else if (cellData.metricValue < diagram.keyRangeMetrics[2])  return fixedSettings.palette.terminalCellText[2];
			else                                                         return fixedSettings.palette.terminalCellText[3];