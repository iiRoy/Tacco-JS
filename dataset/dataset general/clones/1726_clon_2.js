/*
 *  VizLib.js (c) 2023 ChartGen | https://chartgen.github.io/vizlib/LICENSE
 *  A library for generating various chart types.
 */

function utilSanitizeMarkup(textContent) {
    // Defines a mapping for common HTML entities to prevent injection.
    var htmlReplacementDict = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };
    // Converts the input to a string and replaces special characters.
    return String(textContent).replace(/[&<>"'\/]/g, function (charMatch) {
        return htmlReplacementDict[charMatch];
    });
}

function ChartKey(hostElement) {

    // Configuration for displaying group labels within the key.
    this.displayGroupLabels = false;
    // Determines if key items should have an outline.
    this.outlineEnabled = true;
    // Determines if key items should have transparency.
    this.transparencyEnabled = false;
    // The alpha value for transparent key items.
    this.alphaValue = 0.6;
    // The total width allocated for the key panel.
    this.keyPanelWidth = 300;

    // Internal constants for key element dimensions.
    var borderThickness = 2;
    var symbolWidth = 22;
    var symbolHeight = 16;

    // Renders the visual key elements based on provided data.
    this.renderKeyElements = function (visualData) {
        // Selects the target host element and assigns a CSS class.
        var guideWrapper = d3.select(hostElement).attr('class', 'viz-key-container');

        // Appends the main key panel division.
        var keyPanel = guideWrapper.append("div").attr("class", "viz-key-panel");
        keyPanel.style('width', this.keyPanelWidth+'px');

        // Iterates through each data series to create a key entry.
        visualData.forEach(function(dataPoint, idx) {
            var keyEntryRow = keyPanel.append("div");

            // Creates a container for the symbol (rectangle) and inserts an SVG.
            var symbolHolder = keyEntryRow.append("div").attr("class", "viz-symbol-holder")
                                .insert("svg").attr('width', symbolWidth).attr('height', symbolHeight);

            // Draws the symbol rectangle.
            var symbolRect = symbolHolder.append("rect")
                .attr("x", 0+borderThickness/2)
                .attr("y", 0+borderThickness/2).attr("rx", 3).attr("ry", 3)
                .attr("width", (symbolWidth - borderThickness))
                .attr("height", (symbolHeight - borderThickness))
                .style("fill", dataPoint.color);
            // Applies outline if enabled.
            if (this.outlineEnabled === true) {
                symbolRect.attr("stroke", dataPoint.color );
                symbolRect.style("stroke-width", borderThickness) 
            }
            // Applies transparency if enabled.
            if (this.transparencyEnabled === true) {
                symbolRect.style('fill-opacity', this.alphaValue);
            }

            // Constructs the label text for the key entry.
            var labelParts = [], partIndex = -1;
            labelParts[++partIndex] = utilSanitizeMarkup(dataPoint.label);
            if (this.displayGroupLabels === true) {
                labelParts[++partIndex] = ' - '+utilSanitizeMarkup(dataPoint.group);
            }
            if (dataPoint.units) {
                labelParts[++partIndex] = ' ('+utilSanitizeMarkup(dataPoint.units)+')';
            };

            // Appends the label text to the key entry row.
            keyEntryRow.append("span").html(labelParts.join('')).attr('class', 'viz-key-text');
        }, this); // 'this' context for forEach refers to ChartKey instance
    }
}

function GraphCanvas(parentDiv) {

    // Standard height for text labels.
    var textBandHeight = 20;

    // Configuration properties for the graph.
    this.isCircularLayout = false;
    this.displayGraphTitle = true;
    this.displayHorizontalLabel = true;
    this.displayVerticalLabel = true;

    // References to the parent DOM element.
    this.parentDivRef = parentDiv;
    // Margins around the plotting area.
    this.spacing = {top: 14, right: 25, bottom: 35, left: 45};
    // Default dimensions for the chart.
    this.chartWidth = 600;
    this.chartHeight = 400;
    // Radius for radial charts.
    this.circularRadius = 150; 

    // Default text for labels and title.
    this.graphTitle = 'Graph Title';
    this.horizontalLabel = 'X-axis Label';
    this.verticalLabel = 'Y-axis Label';

    // Initializes the axis manager for this canvas.
    this.chartAxes = new ChartAxes(this);

    // Calculates the effective width for the SVG drawing area.
    this.calculateSvgWidth = function() {
        var yLabelSpace = this.displayVerticalLabel === true ? textBandHeight : 0;
        var plotAreaWidth = this.chartWidth - yLabelSpace - this.spacing.left - this.spacing.right;
        return plotAreaWidth;
    }

    // Calculates the effective height for the SVG drawing area.
    this.calculateSvgHeight = function() {
        var titleSpace = this.displayGraphTitle === true ? textBandHeight : 0;
        var xLabelSpace = this.displayHorizontalLabel === true ? textBandHeight : 0;
        var plotAreaHeight = this.chartHeight - titleSpace - xLabelSpace - this.spacing.top - this.spacing.bottom;
        return plotAreaHeight;
    }

    // Draws the main structure of the visualization.
    this.drawVisualization = function() {

        // Selects the container and applies the base chart class.
        var vizWrapper = d3.select(parentDiv).attr('class', 'viz-chart');

        // Inserts the primary plot area with a clearing class.
        var vizPanel = vizWrapper.insert("div").attr("class", "viz-plot viz-clear-after");
        // Container for the left side, potentially holding the Y-axis label.
        var leftSidePanel = vizPanel.insert("div").attr("class", "viz-left-container");
        if (this.displayVerticalLabel === true) {
            leftSidePanel.style('width', textBandHeight+'px');
        }
        if (this.displayVerticalLabel === true) {
            // Adds the Y-axis label, rotated and positioned.
            leftSidePanel.insert("div").html(utilSanitizeMarkup(this.verticalLabel)).attr("class", "viz-y-label")
                                .style('height', textBandHeight+'px').style('line-height', textBandHeight+'px')
                                .style('width', (this.calculateSvgHeight()+this.spacing.top+this.spacing.bottom)+'px'); // Must match SVG area height + margins.
        }
        // Main content area including title, SVG, and X-axis label.
        var mainContentPanel = vizPanel.insert("div").attr("class", "viz-main-container");
        if (this.displayGraphTitle === true) {
            // Adds the chart title.
            mainContentPanel.insert("div").html(utilSanitizeMarkup(this.graphTitle)).attr("class", "viz-title")
                                .style('height', textBandHeight+'px').style('line-height', textBandHeight+'px');
        }
        // Container for the actual SVG drawing element.
        var svgDrawingArea = mainContentPanel.insert("div").attr("class", "viz-svg-container");
        if (this.displayHorizontalLabel === true) {
            // Adds the X-axis label.
            mainContentPanel.insert("div").html(utilSanitizeMarkup(this.horizontalLabel)).attr("class", "viz-x-label")
                                .style('height', textBandHeight+'px').style('line-height', textBandHeight+'px');
        }

        // Inserts the SVG element into its container with calculated dimensions.
        this.svg = svgDrawingArea.insert("svg")
                    .attr('width', this.calculateSvgWidth() + this.spacing.left + this.spacing.right)
                    .attr('height', this.calculateSvgHeight() + this.spacing.top + this.spacing.bottom);

        // Sets up mousemove event for tooltip positioning.
        svgDrawingArea.on("mousemove", function() {
            var hoverTip = d3.select(".viz-tooltip");
            var coordinates = d3.mouse(this);
            hoverTip.style("left", (d3.event.pageX) + "px" );
            hoverTip.style("top", (d3.event.pageY) + "px");     
        });

        // Applies initial SVG transformation based on layout type (linear or radial).
        if (this.isCircularLayout === false) {
            this.svg = this.svg.append("g")
                        .attr("transform", "translate(" + this.spacing.left + "," + this.spacing.top + ")");
        } else {
            this.svg = this.svg.append("g")
                        .attr("transform", "translate(" + this.circularRadius + "," + this.circularRadius + ")");
        }
    };
}

function ChartAxis (chartInstance) {

    var chartRef = chartInstance;
    // Determines if tick marks should be shown.
    this.displayTickMarks = true;
    // Number of ticks to display.
    this.numberOfTicks = 5;
    // Offset for axis positioning.
    this.tickOffset = 0;

    // Renders the axis line and tick marks.
    this.renderAxisLine = function (dataScale, orientation, tickValues) {

        // For bottom axis, draws a 'fake' line to cover potential gaps from bar charts.
        if (orientation === 'bottom') {
            chartRef.svg.append('line')
                .attr('x1', 0)
                .attr('y1', chartRef.calculateSvgHeight())
                .attr('x2', chartRef.calculateSvgWidth())
                .attr('y2', chartRef.calculateSvgHeight())
                .attr('class', 'viz-fake-axis');
        }

        // Creates the D3 axis generator.
        var d3AxisGenerator = d3.svg.axis()
                    .scale(dataScale)
                    .orient(orientation).ticks(tickValues);

        // Appends a group element for the axis.
        var renderedGroup = chartRef.svg.append("g")
            .attr("class", "viz-axis");

        // Applies transformation for bottom axis.
        if (orientation === 'bottom') {
            renderedGroup.attr('transform', 'translate('+this.tickOffset+',' + chartRef.calculateSvgHeight() + ')');
        }

        // Calls the D3 axis generator to render the axis.
        renderedGroup.call(d3AxisGenerator);
    }

    // Renders grid lines for the axis.
    this.renderGridLines = function (dataScaleGrid, orientationGrid) {
        if (this.displayTickMarks) {

            // Creates a D3 axis generator for grid lines.
            var d3GridGenerator = d3.svg.axis()
                        .scale(dataScaleGrid)
                        .orient(orientationGrid).ticks(this.numberOfTicks);

            // Renders X-axis grid lines.
            if (orientationGrid === 'bottom') {
                chartRef.svg.append('g')
                    .attr('class', 'viz-grid viz-x-grid')
                    .attr('transform', "translate("+this.tickOffset+"," + chartRef.calculateSvgHeight() + ")")
                    .call(d3GridGenerator
                        .tickSize(-chartRef.calculateSvgHeight(), 0, 0)
                        .tickFormat("") // No labels for grid ticks.
                    );
            } else { // Renders Y-axis grid lines.
                chartRef.svg.append('g')         
                    .attr('class', 'viz-grid viz-y-grid')
                    .call(d3GridGenerator
                        .tickSize(-chartRef.calculateSvgWidth(), 0, 0)
                        .tickFormat('') // No labels for grid ticks.
                    );
            }
        }
    }
}

function ChartAxes (chartObj) {

    var chartContext = chartObj;
    // Instantiates horizontal and vertical axes.
    this.horizontalAxis = new ChartAxis(chartObj);
    this.verticalAxis = new ChartAxis(chartObj);

    // Renders both horizontal and vertical axes.
    this.renderAxes = function(hScale, vScale) {
        this.horizontalAxis.renderAxisLine(hScale, 'bottom', 5);
        this.verticalAxis.renderAxisLine(vScale, 'left', 5);
    };

    // Renders grid lines for both horizontal and vertical axes.
    this.renderGrids = function(hGridScale, vGridScale) {
        this.horizontalAxis.renderGridLines(hGridScale, 'bottom', 5);
        this.verticalAxis.renderGridLines(vGridScale, 'left', 5);
    };
}

function LineSeries (chartTarget) {
    var seriesData;
    var chartReference = chartTarget;
    var that = this; // Self-reference for callbacks.

    // Configuration for line series.
    this.isVisible = true;
    this.curveType = 'linear'; // Type of interpolation for lines.
    this.strokeWidth = 2; // Thickness of the lines.

    // Initializes the data for the line series.
    this.initializeData = function (sourceDataObject) {
        if (this.isVisible === true) {
            seriesData = sourceDataObject;
        }
    }

    // Renders the line series on the chart.
    this.renderLines = function(horizontalScale, verticalScale) {
        if (this.isVisible === true) {

            // Creates a D3 line generator with specified interpolation and X-axis mapping.
            var d3LineGenerator = d3.svg.line().interpolate(this.curveType).x(function(d) { return horizontalScale(d.x); });
            // Defines Y-axis mapping based on whether data is stacked.
            if (seriesData.isStackedData === true) {
                d3LineGenerator.y(function(d) { return verticalScale(d.y0 + d.y); });
            } else {
                d3LineGenerator.y(function(d) { return verticalScale(d.y); });
            }

            // Appends a path for each data series.
            seriesData.getProcessedData().forEach(function (dataSeries) {     
                var lineElement = chartReference.svg.append("path")
                    .attr("class", "viz-line")
                    .style("stroke", dataSeries.color)
                    .style("stroke-width", this.strokeWidth)
                    .attr("d", d3LineGenerator(dataSeries.values));
            }, this); // 'this' context refers to LineSeries instance.
        }
    }
}

function AreaSeries (chartCanvas) {
    var areaDataSet;
    var canvasReference = chartCanvas;
    var instanceRef = this; // Self-reference for callbacks.

    // Configuration for area series.
    this.displayAreas = false;
    this.curveStyle = 'linear'; // Type of interpolation for area boundaries.
    this.isTranslucent = false; // Determines if areas should have transparency.
    this.fillAlpha = 0.6; // Alpha value for transparent areas.

    // Initializes the data for the area series.
    this.setupData = function (inputDataObject) {
        if (this.displayAreas === true) {
            areaDataSet = inputDataObject;
        }
    }

    // Renders the area series on the chart.
    this.renderAreas = function(xCoordScale, yCoordScale) {
        if (this.displayAreas === true) {

            // Creates a D3 area generator with specified interpolation and X-axis mapping.
            var d3AreaGenerator = d3.svg.area().interpolate(this.curveStyle).x(function(d) { return xCoordScale(d.x); });
            // Defines Y-axis mappings based on whether data is stacked.
            if (areaDataSet.isStackedData === true) {
                d3AreaGenerator.y0(function(d) { return yCoordScale(d.y0); })
                d3AreaGenerator.y1(function(d) { return yCoordScale(d.y0 + d.y); });
            } else {
                d3AreaGenerator.y0(canvasReference.calculateSvgHeight())
                d3AreaGenerator.y1(function(d) { return yCoordScale(d.y); });
            }

            // Appends an area path for each data series.
            areaDataSet.getProcessedData().forEach(function (areaSeries) {     
                var areaPathElement = canvasReference.svg.append("path")
                        .attr("class", "viz-area")
                        .style("fill", areaSeries.color)
                        .attr("d", d3AreaGenerator(areaSeries.values));
                // Applies transparency if enabled.
                if (this.isTranslucent === true) {
                    areaPathElement.style('fill-opacity', this.fillAlpha);
                }
            }, this); // 'this' context refers to AreaSeries instance.
        }
    }
}

function DataPoints (chartPlane) {
    var pointData;
    var thisRef = this; // Self-reference for callbacks.
    var planeRef = chartPlane;

    // Configuration for data points.
    this.areMarkersVisible = false;
    this.markerSize = 4; // Radius of the data points.
    this.fillMarker = false; // Whether the points should be filled.

    // Initializes the data for the data points.
    this.preparePointData = function (dataInput) {
        if (this.areMarkersVisible === true) {
            pointData = dataInput;
        }
    }

    // Renders the data points on the chart.
    this.plotPoints = function(xMapping, yMapping) {
        if (this.areMarkersVisible === true) {
            pointData.getProcessedData().forEach(function (pointSeries) {     
                //------------------------------------------------------------------------------------------------------
                // Appends a tooltip div to the chart container.
                d3.select(planeRef.parentDivRef)
                    .append("div")
                    .attr("class", "viz-tooltip").html("<p>Tooltip</p>");

                // Selects all circles, binds data, and appends new circles for data points.
                var dataPointCircle = planeRef.svg.selectAll(".chart")
                    .data(pointSeries.values)
                    .enter()
                    .append("circle")
                      .attr("transform", function(d) {
                        // Positions points based on stacking configuration.
                        if (pointData.isStackedData === true) {
                            return "translate(" + xMapping(d.x) + ", " + yMapping(d.y0+d.y) + ")";
                        } else {
                            return "translate(" + xMapping(d.x) + ", " + yMapping(d.y) + ")";
                        }
                    })
                    .attr("r", function(d){ return thisRef.markerSize; }) // Uses the instance's marker size.
                    .style("stroke", pointSeries.color)
                    .on("mouseover", this.onMarkerHover) // Event handler for mouseover.
                    .on("mouseout", this.onMarkerLeave); // Event handler for mouseout.

                // Applies fill color based on configuration.
                if (this.fillMarker) {
                    dataPointCircle.attr("fill", pointSeries.color);
                } else {
                    dataPointCircle.attr("fill", "white");
                }
                //------------------------------------------------------------------------------------------------------
            }, this); // 'this' context refers to DataPoints instance.
        }
    }

    // Event handler for when mouse hovers over a marker.
    this.onMarkerHover = function(hoverData, indexVal) {     
        var dateFormatter = d3.time.format("%A %d. %B %Y");
        var selectedCircle = d3.select(this);
        // Animates the circle to a larger radius.
        selectedCircle.transition().duration(500).attr("r", 10);

        // Shows and fades in the tooltip.
        d3.select(".viz-tooltip")
        .style("display", "block")
        .style('opacity', 0)
        .transition().delay(200).duration(500).style('opacity', 1);  
          
        // Populates the tooltip with data.
        d3.select(".viz-tooltip p")
            .html("<strong>Date:</strong> " 
                + dateFormatter(new Date(hoverData.x)) 
                + "<br/>" 
                + "<strong>Value:</strong> " 
                + hoverData.y
                );
    }

    // Event handler for when mouse leaves a marker.
    this.onMarkerLeave = function() {
        var selectedCircle = d3.select(this);
        // Animates the circle back to its original size.
        selectedCircle.transition().duration(500).attr("r", thisRef.markerSize);
        // Hides the tooltip.
        d3.select(".viz-tooltip").style("display", "none"); 
    }
}

function ColumnGraphs(chartSurface) {

    var surfaceRef = chartSurface;
    var barData;

    // Configuration for bar graphs.
    this.areBarsVisible = false;
    this.withBorder = true; // Whether bars should have an outline.
    this.borderThicknessPx = 2; // Thickness of the bar outline.
    this.isTranslucent = false; // Whether bars should have transparency.
    this.translucencyValue = 0.6; // Alpha value for transparent bars.

    // Internal variables for bar layout calculations.
    var numSamples;
    var numGroups;
    var outerSpacing = 20; // Gap around each sample group.
    var innerSpacing = 5; // Gap between bars within a group.

    var sampleSectionWidth;
    var groupSectionWidth;
    var barElementWidth;

    // Retrieves the calculated width for a single sample box.
    this.retrieveSampleSectionWidth = function () {
        return sampleSectionWidth;
    }

    // Initializes the data and calculates bar dimensions.
    this.setupBarData = function (inputBarData) {
        if (this.areBarsVisible === true) {
            barData = inputBarData;
            numSamples = barData.calculateSampleCount();
            numGroups = barData.countGroups(); // This function is not in the provided snippet.

            sampleSectionWidth = surfaceRef.calculateSvgWidth() / numSamples;
            groupSectionWidth = (sampleSectionWidth - (2 * outerSpacing));
            // Calculates individual bar width considering inner gaps.
            barElementWidth = (groupSectionWidth / numGroups) - innerSpacing + (innerSpacing / numGroups); 

            // Offsets the x-axis tick to the center of the sample box.
            surfaceRef.chartAxes.horizontalAxis.tickOffset = sampleSectionWidth/2;
        }
    }

    // Renders the bar elements on the chart.
    this.renderBars = function(xCoordMapper, yCoordMapper) {
        if (this.areBarsVisible === true) {
            var dataGroups = barData.getGroups(); // This function is not in the provided snippet.
            var maxValue = barData.yExtent()[1]; // Gets max Y value from data.
            barData.getProcessedData().forEach(function(currentSeries, i) {
                currentSeries.values.forEach(function(currentValue) {
                    var barElement = surfaceRef.svg.append("rect")
                        .attr("class", "viz-rect-line viz-rect-area")
                        .style("fill", currentSeries.color)
                        .attr("x", function(d) {
                            var xPosition = xCoordMapper(currentValue.x)+outerSpacing;
                            //------------------------------------------------------------------------------------------
                            // Adds offset for group position within a sample.
                            var groupOffset = dataGroups.indexOf(currentSeries.group);
                            xPosition += (barElementWidth+innerSpacing)*groupOffset;
                            return xPosition;
                        })
                        .attr("width", barElementWidth)
                        // For y-axis, D3 uses a top-left coordinate system.
                        // Todo: account for line size / line overlap?
                        .attr("y", function(d) { return surfaceRef.calculateSvgHeight()-yCoordMapper(maxValue-currentValue.y-currentValue.y0); })
                        .attr("height", function(d) { return yCoordMapper(maxValue-currentValue.y); });
                    // Applies outline if enabled.
                    if (this.withBorder === true) {
                        barElement.style("stroke", currentSeries.color);
                        barElement.style("stroke-width", this.borderThicknessPx);
                    }
                    // Applies transparency if enabled.
                    if (this.isTranslucent === true) {
                        barElement.style('fill-opacity', this.translucencyValue);
                    }
                }, this); // 'this' context refers to ColumnGraphs instance.
            }, this); // 'this' context refers to ColumnGraphs instance.
        }
    }
}

//----------------------------------------------------------------------------------------------------------------------

function DataSetHandler() {

    var instanceSelf = this;
    var rawData;

    // Configuration for data processing.
    this.isStackedData = false;
    this.isGroupStacked = false; // Not used in provided snippet, but kept for consistency.
    this.stackingMethod = 'zero'; // Method for stacking data.

    // Initializes the data set.
    this.initializeDataSet = function(inputArray) {
        rawData = inputArray;
        processDateStrings(); // Parses date strings to Date objects.
        // fetchGroups(); // Placeholder: gathers unique groups from data.
        if (this.isStackedData) {
            // applyStacking(); // Placeholder: applies D3 stacking logic.
        }
        // determineXRange(); // Placeholder: calculates X-axis extent.
        // determineYRange(); // Placeholder: calculates Y-axis extent.
    }

    // Todo: implement interpolation for missing data points, similar to D3 examples.

    // Retrieves the processed data.
    this.getProcessedData = function() {
        return rawData;
    }

    //------------------------------------------------------------------------------------------------------------------

    // Calculates the number of samples (data points per series).
    this.calculateSampleCount = function () {
        
        return rawData[0].values.length; // Assumes all series have the same length.
    }

    //------------------------------------------------------------------------------------------------------------------

    // Internal function to parse date strings in the data.
    var processDateStrings = function () {
        var dateParser = d3.time.format("%Y-%m-%d %H:%M:%S").parse;
        rawData.forEach(function (dataSeries) {
            dataSeries.values.forEach(function (dataValue) {
                dataValue.x = dateParser(dataValue.x);
            });
        });
    }