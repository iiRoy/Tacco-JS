/*
 * This module is responsible for visualizing hierarchical data as a heatmap layout.
 * It takes a tree-like data structure, where each node has a label, one or more numeric values,
 * and optional child nodes. Leaf nodes represent the deepest level of detail.
 *
 * Example structure interpretation:
 *		Company
 *			Division A
 *				Team Alpha
 *				Team Beta
 *			Division B
 *				Team Gamma
 *
 * This would be rendered as a stacked header layout with a heatmap of leaf cells:
 *		|                             Company                             |
 *		|         Division A          |         Division B            |
 *		| Team Alpha | Team Beta | Team Gamma | [Empty/Placeholder] |
 *
 *
 *
 *
 * The `initializeHierarchicalVisualization` function serves as the primary entry point.
 * It constructs a visualization object that manages rendering within a specified DOM element,
 * using the provided hierarchical dataset and display configurations.
 *
 *   sourceData: Each node within this tree structure must possess the following properties:
 *		 nodeLabel:   Text to be displayed for the node.
 *		 nodeValues:  An array of numerical data points. The `activeValueIdx` config determines which index to render.
 *		 children:    An array of child node objects, or `undefined`/`null` for terminal (leaf) nodes.
 *
 *   configuration: An object containing display and behavior settings:
 *		titleText:			Main title for the visualization.
 *		renderDepth:		Maximum hierarchy depth to display. Must be >= 1.
 *		activeValueIdx:		Index within `nodeValues` array to use for rendering. Defaults to 0.
 *		valueUnitType: 		Defines how values are formatted: 'NONE', 'CURRENCY', 'PERCENT'.
 *		maxCellDimension:	Optional. Sets a maximum width for individual leaf cells. Otherwise, cells expand to fit.
 *		onCellInteraction:	A callback function(isDrilldown, triggeredNode) invoked on cell click/tap.
 *								`isDrilldown` is true for single-click, false for double-click.
 *								`triggeredNode` is the data node associated with the interacted cell.
 */
function initializeHierarchicalVisualization(targetContainer, sourceData, configuration) {

    // Ensure D3 is available before proceeding
    if (typeof d3 === 'undefined') {
        console.error("D3.js library is required for this visualization.");
        return null;
    }

    let appSettings = null; // Global parameters for rendering
    let mapInstance = null; // The main visualization object

    /**
     * Sets up core constants and calculated dimensions for the visualization.
     * This includes spacing, heights, fonts, colors, and initial positioning.
     */
    function setupGlobalParameters() {
        appSettings = {
            valueUnits: { 'NONE': 0, 'CURRENCY': 1, 'PERCENT': 2 },

            // Horizontal and vertical gaps between visual blocks
            blockGap: { horizontal: 3, vertical: 2 },

            // Inner heights for each header level (excluding margins)
            levelHeights: [75, 55, 43, 43], // Slightly different values

            // Base height for leaf cells (excluding margins)
            baseLeafHeight: 42, // Slightly different value

            // Font sizes for different parts of the visualization
            typeSizes: {
                heatmapLevels: [22, 19, 14, 14, 11], // Slightly different values
                legendFontSize: "14px",
            },

            // Color scheme for cell backgrounds and text
            colorPalette: {
                leafBg: ['#c0f0bb', '#70c070', '#208030', '#005000', '#005000'], // Slightly different shades
                leafText: ['#303020', '#303020', '#fff', '#fff', '#fff'],
                headerBg: ['#053050', '#0f5075', '#1970a0', '#1970a0', '#1970a0']
            },

            // Pre-calculated Y-coordinates for the start of each header level
            verticalOffsets: [],

            currencyFormatFn: d3.format(',.0f'), // Custom D3 format for currency
        };

        // Adjust header heights by adding vertical spacing
        appSettings.levelHeights = appSettings.levelHeights.map(h => h + 2 * appSettings.blockGap.vertical);

        // Adjust base leaf height similarly
        appSettings.baseLeafHeight += 2 * appSettings.blockGap.vertical;

        // Calculate cumulative Y offsets for each header level
        let currentY = 0;
        appSettings.levelHeights.forEach(height => {
            appSettings.verticalOffsets.push(currentY);
            currentY += height;
        });
        // Add the total height as the last offset for the start of leaf cells
        appSettings.verticalOffsets.push(currentY);

        // console.log("Application Settings:", appSettings);
    }

    /**
     * Clears any existing SVG content within the target container.
     */
    function resetCanvas() {
        d3.select(targetContainer).selectAll("svg").remove();
    }

    /**
     * Initializes the main visualization object and sets up the SVG canvas.
     * @param {HTMLElement} container - The DOM element to render into.
     * @param {object} dataRoot - The root node of the hierarchical data.
     * @param {object} config - Configuration options.
     */
    function initVisualization(container, dataRoot, config) {
        config = config || {};

        // Basic input validation
        if (!container || !dataRoot) {
            console.warn("Target container or source data is missing.");
            return;
        }

        resetCanvas(); // Clear previous renderings

        const containerRect = container.getBoundingClientRect();
        const availableWidth = containerRect.width;
        const availableHeight = containerRect.height;

        setupGlobalParameters(); // Initialize global parameters

        mapInstance = {
            mainSvg: null, // The D3 SVG selection
            drawingWidth: availableWidth,
            drawingHeight: availableHeight,

            vizTitle: config.titleText || '',
            datasetRoot: dataRoot,
            desiredDepthLimit: Math.max(1, config.renderDepth || 1), // Ensure depth is at least 1
            activeValueIdx: config.activeValueIdx || 0,
            currentUnitType: appSettings.valueUnits[config.valueUnitType],
            maxCellDim: config.maxCellDimension || availableWidth,
            cellActionHandler: config.onCellInteraction,
        };

        // Set default unit if not recognized
        if (mapInstance.currentUnitType === undefined) {
            mapInstance.currentUnitType = appSettings.valueUnits.CURRENCY;
        }

        // Calculate top offset for the main content area (title + legend + padding)
        mapInstance.contentTopOffset = (mapInstance.vizTitle ? 55 : 0) + 35; // 55 for title, 35 for legend

        mapInstance.mainSvg = d3.select(container)
            .append("svg")
            .attr("width", mapInstance.drawingWidth)
            .attr("height", mapInstance.drawingHeight)
            .attr("class", "hierarchical-heatmap");

        // Create a main group element to hold all chart components, allowing for easy transformations
        mapInstance.vizContainerGroup = mapInstance.mainSvg.append("g")
            .attr("transform", `translate(0, ${mapInstance.contentTopOffset})`);

        // Add chart title
        if (mapInstance.vizTitle) {
            mapInstance.mainSvg.append("text")
                .attr("class", "chart-title")
                .attr("x", mapInstance.drawingWidth / 2)
                .attr("y", 25)
                .attr("text-anchor", "middle")
                .style("font-size", "18px")
                .style("font-weight", "bold")
                .text(mapInstance.vizTitle);
        }
    }

    /**
     * Safely retrieves a numeric value from a node, handling undefined/null cases.
     * @param {object} node - The data node.
     * @param {number} index - The index within nodeValues to retrieve.
     * @returns {number} The numeric value, or 0 if not found.
     */
    function _getNodeValue(node, index) {
        return (node && node.nodeValues && typeof node.nodeValues[index] === 'number') ? node.nodeValues[index] : 0;
    }

    /**
     * Prepares the data structure for rendering.
     * This involves traversing the tree, calculating spans, and organizing nodes into a 2D grid.
     */
    function processInputData() {
        let currentLeafColumn = -1; // Tracks the horizontal position for leaf nodes
        let nextNodeId = 0; // Unique ID generator for processed nodes
        let minLeafVal = null;
        let maxLeafVal = null;

        mapInstance.gridLayout = []; // Array of arrays, representing rows and cells
        mapInstance.widestSpan = 1; // Maximum number of effective columns across any row
        mapInstance.effectiveLeafWidth = 0;
        mapInstance.effectiveLeafHeight = 0;

        /**
         * Recursively calculates the number of leaf units a node spans horizontally.
         * @param {object} currentNode - The node to calculate span for.
         * @param {number} currentLevel - The current depth level of the node.
         * @returns {number} The colspan value.
         */
        function determineSpanUnits(currentNode, currentLevel) {
            if (!currentNode || !currentNode.children || currentLevel + 1 >= mapInstance.determinedDepth) {
                return 1; // Base case: leaf node or beyond max depth, spans 1 unit
            }
            return currentNode.children.reduce((sum, child) => sum + determineSpanUnits(child, currentLevel + 1), 0);
        }

        /**
         * Extracts and formats relevant data for a given node into a renderable object.
         * Also tracks min/max values for color scaling.
         * @param {object} nodeRef - The original data node.
         * @param {number} level - The depth level of the node.
         * @returns {object} A processed data object for rendering.
         */
        function extractNodeDetails(nodeRef, level) {
            const isTerminalLeaf = (level === mapInstance.determinedDepth);
            const detail = {
                id: nextNodeId++,
                originalNode: nodeRef,
                isEmpty: nodeRef === null,
                level: level,
                isLeaf: isTerminalLeaf,
                span: determineSpanUnits(nodeRef, level),
                value: _getNodeValue(nodeRef, mapInstance.activeValueIdx),
            };

            // Update min/max leaf values for color scaling
            if (isTerminalLeaf && !detail.isEmpty) {
                if (minLeafVal === null || detail.value < minLeafVal) minLeafVal = detail.value;
                if (maxLeafVal === null || detail.value > maxLeafVal) maxLeafVal = detail.value;
            }
            return detail;
        }

        /**
         * Creates an array representing an empty row of leaf cells, useful for padding.
         * @returns {Array<object>} An array of empty leaf cell data objects.
         */
        function fabricateEmptyLeafRow() {
            const emptyRow = [];
            for (let i = 0; i < mapInstance.widestSpan; i++) {
                emptyRow.push({ isEmpty: true, span: 1, isLeaf: true });
            }
            return emptyRow;
        }

        /**
         * Traverses the data tree recursively to build the gridLayout array.
         * @param {object} node - The current node in the traversal.
         * @param {number} level - The current depth level.
         */
        function traverseAndStructureData(node, level) {
            let rowIdx = level;

            // Ensure the row exists in the gridLayout
            if (rowIdx >= mapInstance.gridLayout.length) {
                mapInstance.gridLayout.push([]);
            }

            mapInstance.gridLayout[rowIdx].push(extractNodeDetails(node, level));

            // If we are at the level just above the final leaf level
            if (level === mapInstance.determinedDepth - 1) {
                rowIdx++; // Move to the next row for children
                currentLeafColumn++; // Increment the global leaf column tracker

                const childNodes = node.children || [null]; // If no children, treat as a single empty child

                childNodes.forEach((child, index) => {
                    // Ensure enough rows exist for all children
                    if (rowIdx + index >= mapInstance.gridLayout.length) {
                        mapInstance.gridLayout.push(fabricateEmptyLeafRow());
                    }
                    const childData = extractNodeDetails(child, level + 1);
                    mapInstance.gridLayout[rowIdx + index][currentLeafColumn] = childData;
                });
            } else if (node.children) {
                // Recursively process children for deeper levels
                node.children.forEach(child => traverseAndStructureData(child, level + 1));
            }
        }

        /**
         * Assigns row and column indices to each cell object in the gridLayout.
         */
        function assignGridCoordinates() {
            mapInstance.gridLayout.forEach((row, rowIndex) => {
                let currentX = 0;
                row.forEach(cell => {
                    cell.rowIndex = rowIndex;
                    cell.colIndex = currentX;
                    currentX += cell.span;
                });
            });
        }

        /**
         * Calculates the total pixel height occupied by all header rows.
         * @returns {number} Total header height.
         */
        function calculateHeaderSpace() {
            let total = 0;
            for (let i = 0; i < mapInstance.headerLevelsCount; i++) {
                if (i < appSettings.levelHeights.length) {
                    total += appSettings.levelHeights[i];
                }
            }
            return total;
        }

        /**
         * Determines the optimal pixel height for leaf cells based on available space.
         * @returns {number} Optimal leaf cell height.
         */
        function computeLeafBlockHeight() {
            const numLeafRows = mapInstance.gridLayout.length - mapInstance.headerLevelsCount;
            if (numLeafRows <= 0) return appSettings.baseLeafHeight;

            const remainingVerticalSpace = mapInstance.drawingHeight - mapInstance.contentTopOffset - mapInstance.cumulativeHeaderHeight;
            const calculatedHeight = remainingVerticalSpace / numLeafRows;

            return Math.max(appSettings.baseLeafHeight, calculatedHeight); // Ensure a minimum height
        }

        /**
         * Determines the maximum actual depth of the tree, capped by the desired display depth.
         * @param {object} node - The current node to check depth from.
         * @returns {number} The maximum depth from this node.
         */
        function calculateMaxTreeDepth(node) {
            if (!node || !node.children || node.children.length === 0) {
                return 1; // Leaf node or node with no children has depth 1
            }
            const childDepths = node.children.map(child => calculateMaxTreeDepth(child));
            return 1 + Math.max(...childDepths);
        }

        // Determine the effective maximum depth for rendering
        mapInstance.determinedDepth = Math.min(calculateMaxTreeDepth(mapInstance.datasetRoot), mapInstance.desiredDepthLimit);

        // Calculate the maximum number of columns a single row will span
        mapInstance.widestSpan = determineSpanUnits(mapInstance.datasetRoot, 0);

        // The number of header rows corresponds to the determined depth
        mapInstance.headerLevelsCount = mapInstance.determinedDepth;

        // Calculate total height dedicated to headers
        mapInstance.cumulativeHeaderHeight = calculateHeaderSpace();

        // Populate the gridLayout array by traversing the tree
        traverseAndStructureData(mapInstance.datasetRoot, 0);

        // Assign grid coordinates to each cell for positioning
        assignGridCoordinates();

        // Calculate the effective width for a single leaf cell unit
        mapInstance.effectiveLeafWidth = Math.min(mapInstance.maxCellDim, mapInstance.drawingWidth / mapInstance.widestSpan);

        // Calculate the effective height for a single leaf cell unit
        mapInstance.effectiveLeafHeight = computeLeafBlockHeight();

        // Determine if text should be rendered within leaf cells (based on available height)
        mapInstance.showLeafContent = (mapInstance.effectiveLeafHeight - 2 * appSettings.blockGap.vertical) >= 12;

        // Update the color scale thresholds based on min/max leaf values
        adjustColorScaleBoundaries(minLeafVal, maxLeafVal);

        // console.log("Map Instance State:", mapInstance);
    }

    /**
     * Divides the range of leaf cell values into quartiles to define color scale breaks.
     * @param {number} minValue - The minimum leaf cell value found.
     * @param {number} maxValue - The maximum leaf cell value found.
     */
    function adjustColorScaleBoundaries(minValue, maxValue) {
        // Ensure min value is not greater than 0 for better visual representation of negative values
        minValue = Math.min(0, minValue);
        const step = (maxValue - minValue) / 4;
        // Store three thresholds for four color ranges
        mapInstance.colorScaleBreaks = [
            d3.round(minValue + step, 0),
            d3.round(minValue + 2 * step, 0),
            d3.round(minValue + 3 * step, 0)
        ];
    }

    /**
     * Generates and displays the legend for the heatmap colors.
     */
    function constructLegendDisplay() {
        const legendBoxSize = 16;
        const legendBoxMargin = 5;
        const legendItemSpacing = 12;

        /**
         * Formats a value as a percentage relative to the root node's value.
         * @param {number} val - The value to format.
         * @returns {string} Formatted percentage string.
         */
        function formatAsPercentage(val) {
            const rootValue = _getNodeValue(mapInstance.datasetRoot, mapInstance.activeValueIdx);
            return d3.round(val * 100 / rootValue, 1) + '%';
        }

        /**
         * Formats a value as currency using the defined formatter.
         * @param {number} val - The value to format.
         * @returns {string} Formatted currency string.
         */
        function formatAsCurrency(val) {
            return appSettings.currencyFormatFn(val);
        }

        /**
         * Creates label objects for the legend based on current unit type.
         * @returns {Array<object>} An array of label objects with text and positioning.
         */
        function generateLegendLabels() {
            const separator = '—'; // Em-dash for ranges
            const thresholds = mapInstance.colorScaleBreaks;
            let labelSet;

            if (mapInstance.currentUnitType === appSettings.valueUnits.PERCENT) {
                labelSet = [
                    `< ${formatAsPercentage(thresholds[0])}`,
                    `${formatAsPercentage(thresholds[0])}${separator}${formatAsPercentage(thresholds[1])}`,
                    `${formatAsPercentage(thresholds[1])}${separator}${formatAsPercentage(thresholds[2])}`,
                    `> ${formatAsPercentage(thresholds[2])}`
                ];
            } else {
                labelSet = [
                    `< ${formatAsCurrency(thresholds[0])}`,
                    `${formatAsCurrency(thresholds[0])}${separator}${formatAsCurrency(thresholds[1])}`,
                    `${formatAsCurrency(thresholds[1])}${separator}${formatAsCurrency(thresholds[2])}`,
                    `> ${formatAsCurrency(thresholds[2])}`
                ];
            }

            let currentXPosition = 0;
            return labelSet.map(text => {
                // Estimate text width (rough, for layout)
                const estimatedWidth = text.length * 7; // Approximation
                const labelObject = { text: text, x: currentXPosition };
                currentXPosition += legendBoxSize + legendBoxMargin + estimatedWidth + legendItemSpacing;
                return labelObject;
            });
        }

        // Remove any existing legend before drawing a new one
        mapInstance.mainSvg.select('g.chart-legend').remove();

        const legendGroup = mapInstance.mainSvg.append('g')
            .attr('class', 'chart-legend')
            .attr('transform', `translate(10, ${mapInstance.contentTopOffset - 25})`); // Position above main heatmap

        const legendItemsData = generateLegendLabels();

        const legendElements = legendGroup.selectAll('g.legend-item')
            .data(legendItemsData)
            .enter()
            .append('g')
            .attr('class', 'legend-item');

        legendElements.append('rect')
            .attr("x", d => d.x)
            .attr('y', 0)
            .attr('width', legendBoxSize)
            .attr('height', legendBoxSize)
            .attr('fill', (d, i) => appSettings.colorPalette.leafBg[i])
            .attr("rx", 3)
            .attr("ry", 3);

        legendElements.append('text')
            .text(d => d.text)
            .attr("font-size", appSettings.typeSizes.legendFontSize)
            .attr("fill", '#444')
            .attr("x", d => d.x + legendBoxSize + legendBoxMargin)
            .attr("y", legendBoxSize / 2 + 4); // Vertically center text
    }

    /* --- Cell Property Accessor Functions (for D3 rendering) --- */

    /** Calculates the X position of a cell. */
    function getCellXPosition(cellData) {
        return (cellData.colIndex * mapInstance.effectiveLeafWidth) + appSettings.blockGap.horizontal;
    }

    /** Calculates the Y position of a cell. */
    function getCellYPosition(cellData) {
        let yCoord;
        if (!cellData.isLeaf) {
            yCoord = appSettings.verticalOffsets[cellData.rowIndex];
        } else {
            // For leaf cells, position relative to the end of headers and their row index
            yCoord = appSettings.verticalOffsets[mapInstance.headerLevelsCount] + (cellData.rowIndex - mapInstance.headerLevelsCount) * mapInstance.effectiveLeafHeight;
        }
        return yCoord + appSettings.blockGap.vertical;
    }

    /** Calculates the width of a cell. */
    function getCellRenderWidth(cellData) {
        return (cellData.span * mapInstance.effectiveLeafWidth) - 2 * appSettings.blockGap.horizontal;
    }

    /** Calculates the height of a cell. */
    function getCellRenderHeight(cellData) {
        const baseHeight = !cellData.isLeaf ? appSettings.levelHeights[cellData.rowIndex] : mapInstance.effectiveLeafHeight;
        return baseHeight - 2 * appSettings.blockGap.vertical;
    }

    /** Determines the CSS class for a cell. */
    function getCellStylingClass(cellData) {
        return cellData.isLeaf ? 'data-cell leaf-cell' : 'data-cell header-cell';
    }

    /** Determines the font size for cell text. */
    function getCellTextSize(cellData) {
        return !cellData.isLeaf ? appSettings.typeSizes.heatmapLevels[cellData.rowIndex] : appSettings.typeSizes.heatmapLevels[3];
    }

    /** Determines the opacity of cell text. */
    function getCellVisibility(cellData) {
        // Hide leaf text if not enough space or if unit is NONE (no value to show)
        return cellData.isLeaf && (!mapInstance.showLeafContent || mapInstance.currentUnitType === appSettings.valueUnits.NONE) ? 0 : 1;
    }

    /** Formats the cell's value for display. */
    function getFormattedCellValue(cellData) {
        if (cellData.isEmpty) return "";

        const rawValue = cellData.value;

        switch (mapInstance.currentUnitType) {
            case appSettings.valueUnits.PERCENT:
                const rootValue = _getNodeValue(mapInstance.datasetRoot, mapInstance.activeValueIdx);
                return d3.round(rawValue * 100 / rootValue, 1) + '%';
            case appSettings.valueUnits.CURRENCY:
                return appSettings.currencyFormatFn(d3.round(rawValue, 0));
            case appSettings.valueUnits.NONE:
            default:
                return ""; // No value displayed for NONE unit
        }
    }

    /** Determines the background fill color for a cell. */
    function getCellBackgroundColor(cellData) {
        if (cellData.isEmpty) {
            return "#ffffff"; // White for empty cells
        } else if (cellData.isLeaf) {
            const val = cellData.value;
            const breaks = mapInstance.colorScaleBreaks;
            if (val < breaks[0]) return appSettings.colorPalette.leafBg[0];
            if (val < breaks[1]) return appSettings.colorPalette.leafBg[1];
            if (val < breaks[2]) return appSettings.colorPalette.leafBg[2];
            return appSettings.colorPalette.leafBg[3]; // Fallback for highest quartile
        } else {
            // Header cells use colors based on their row index, cycling if needed
            return appSettings.colorPalette.headerBg[cellData.rowIndex % appSettings.colorPalette.headerBg.length];
        }
    }

    /** Determines the text color for a cell. */
    function getCellTextColor(cellData) {
        if (cellData.isEmpty) {
            return ""; // No text color for empty cells
        } else if (cellData.isLeaf) {
            const val = cellData.value;
            const breaks = mapInstance.colorScaleBreaks;
            if (val < breaks[0]) return appSettings.colorPalette.leafText[0];
            if (val < breaks[1]) return appSettings.colorPalette.leafText[1];
            if (val < breaks[2]) return appSettings.colorPalette.leafText[2];
            return appSettings.colorPalette.leafText[3]; // Fallback for highest quartile
        } else {
            return "#ffffff"; // White text for header cells
        }
    }

    /**
     * Renders the entire heatmap visualization.
     */
    function renderVisualization() {
        // Select all rows and bind data
        const gridRows = mapInstance.vizContainerGroup.selectAll(".grid-row")
            .data(mapInstance.gridLayout);

        gridRows.enter().append("g")
            .attr("class", "grid-row")
            .merge(gridRows)
            .each(function(rowData) {
                // For each row, select cells and bind data
                const rowSelection = d3.select(this);
                const cells = rowSelection.selectAll(".data-cell")
                    .data(rowData, d => d.id); // Use unique ID for data binding

                // Enter selection: Create new cells
                const newCells = cells.enter().append("g")
                    .attr("class", getCellStylingClass)
                    .on("click", function(event, d) {
                        if (mapInstance.cellActionHandler && !d.isEmpty) {
                            mapInstance.cellActionHandler(true, d.originalNode); // Single click is drill-down
                        }
                    })
                    .on("dblclick", function(event, d) {
                        if (mapInstance.cellActionHandler && !d.isEmpty) {
                            mapInstance.cellActionHandler(false, d.originalNode); // Double click is not drill-down
                        }
                    });

                // Append rectangle for cell background
                newCells.append("rect")
                    .attr("class", "cell-background");

                // Append text for node label
                newCells.append("text")
                    .attr("class", "cell-label")
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "middle");

                // Append text for value display (only for leaf cells that show content)
                newCells.append("text")
                    .attr("class", "cell-value")
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "middle")
                    .style("opacity", getCellVisibility);

                // Update selection: Apply attributes to existing and new cells
                const allCells = newCells.merge(cells);

                allCells.attr("transform", cellData => `translate(${getCellXPosition(cellData)}, ${getCellYPosition(cellData)})`);

                allCells.select(".cell-background")
                    .attr("width", getCellRenderWidth)
                    .attr("height", getCellRenderHeight)
                    .attr("fill", getCellBackgroundColor);

                allCells.select(".cell-label")
                    .text(cellData => cellData.isEmpty ? "" : cellData.originalNode.nodeLabel)
                    .attr("x", cellData => getCellRenderWidth(cellData) / 2)
                    .attr("y", cellData => getCellRenderHeight(cellData) / 2 - (cellData.isLeaf && mapInstance.showLeafContent ? 10 : 0)) // Adjust for value text
                    .style("font-size", getCellTextSize)
                    .attr("fill", getCellTextColor);

                allCells.select(".cell-value")
                    .text(getFormattedCellValue)
                    .attr("x", cellData => getCellRenderWidth(cellData) / 2)
                    .attr("y", cellData => getCellRenderHeight(cellData) / 2 + (cellData.isLeaf && mapInstance.showLeafContent ? 10 : 0)) // Position below label
                    .style("font-size", appSettings.typeSizes.heatmapLevels[4]) // Smaller font for value
                    .attr("fill", getCellTextColor)
                    .style("opacity", getCellVisibility);

                // Exit selection: Remove old cells
                cells.exit().remove();
            });

        gridRows.exit().remove(); // Remove old rows
    }

    // --- Main Execution Flow ---
    initVisualization(targetContainer, sourceData, configuration);
    if (!mapInstance) return null; // If initialization failed

    processInputData();
    constructLegendDisplay();
    renderVisualization();

    // Expose a public method to re-render if data or options change
    mapInstance.update = function(newData, newConfig) {
        if (newData) mapInstance.datasetRoot = newData;
        if (newConfig) {
            // Merge new config with existing
            Object.assign(configuration, newConfig);
            // Re-initialize to apply new settings like depth, unit, etc.
            initVisualization(targetContainer, mapInstance.datasetRoot, configuration);
            if (!mapInstance) return;
        }

        processInputData();
        constructLegendDisplay();
        renderVisualization();
    };

    return mapInstance;
}