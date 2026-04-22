/*
 *  Peek.js (c) 2015 Mark Macdonald
 *  This file contains core charting utilities for data visualization.
 *  It is distributed under the LICENSE available at http://mtmacdonald.github.io/peek/LICENSE
 */


function    pkEscapeHtml(     string     )
{
    // Define a map of HTML entities for escaping special characters.
    var entityMap =   {
        "&" : "&amp;"  ,
        "<" : "&lt;"   ,
        ">" : "&gt;"   ,
        '"' : '&quot;' ,
        "'" : '&#39;'  ,
        "/" : '&#x2F;'
    }   ;

    // Convert the input to a string and replace special characters.
    return String(string).replace( /[&<>"'\/]/g , function ( s ) {
        return entityMap[s];
    }   )   ;
}


function Legend(container) {

    // Initialize properties for the legend component.
    this.showGroups   = false;
    this.hasOutline   = true;
    this.hasOpacity   = false;
    this.opacity      = 0.6;
    this.width        = 300;

    // Private variables for key dimensions.
    var outlineWidth = 2;
    var keyWidth     = 22;
    var keyHeight    = 16;


    this.draw = function( data ) {

        // Select the container and assign the legend class.
        var legendContainer = d3.select(container).attr('class', 'pk-legendContainer');

        // Append a div for the legend itself.
        var legend = legendContainer.append("div").attr("class", "pk-legend");
        legend.style( 'width', this.width + 'px' ); // Set the legend's width.

        // Iterate over each series in the data to draw legend items.
        data.forEach( function( series , i ) {

            // Create a row for each legend item.
            var row = legend.append("div");

            // Create a container for the key (color swatch).
            var keyContainer = row.append("div")
                                  .attr("class", "pk-keyContainer")
                                  .insert("svg")
                                  .attr('width', keyWidth)
                                  .attr('height', keyHeight);

            // Draw the colored rectangle for the key.
            var key = keyContainer.append("rect")
                .attr("x", 0 + outlineWidth / 2)
                .attr("y", 0 + outlineWidth / 2)
                .attr("rx", 3)
                .attr("ry", 3)
                .attr("width", (keyWidth - outlineWidth))
                .attr("height", (keyHeight - outlineWidth))
                .style("fill", series.color);

            // Add an outline if specified.
            if (this.hasOutline === true)
            {
                key.attr("stroke", series.color);
                key.style("stroke-width", outlineWidth);
            }

            // Apply opacity if specified.
            if (this.hasOpacity === true) {
                key.style('fill-opacity', this.opacity);
            }

            // Prepare the text for the legend item.
            var text = [], i = -1;
            text[++i] = pkEscapeHtml(series.label);
            if (this.showGroups === true) {
                text[++i] = ' - ' + pkEscapeHtml(series.group);
            }
            if (series.units)
            {
                text[++i] = ' (' + pkEscapeHtml(series.units) + ')';
            }
            ;

            // Append the text to the legend row.
            row.append("span").html(text.join('')).attr('class', 'pk-keyText');

        }, this ); // Ensure 'this' context is preserved for 'Legend' instance.
    }
}


function Plot(container) {

    // Constant for label height.
    var labelHeight = 20;

    // Configuration flags for the plot.
    this.isRadial   = false;
    this.showTitle  = true;
    this.showXLabel = true;
    this.showYLabel = true;

    // Reference to the DOM container.
    this.container = container;

    // Margins for the chart area.
    this.margin = { top: 14, right: 25, bottom: 35, left: 45 };

    // Dimensions of the plot.
    this.width  = 600;
    this.height = 400;
    this.radius = 150; // Only for radial charts.

    // Default labels.
    this.title  = 'Chart Title';
    this.xLabel = 'X Label';
    this.yLabel = 'Y Label';

    // Initialize axes for the plot.
    this.axes = new Axes(this);

    /**
     * Calculates the effective SVG width, accounting for margins and Y-axis label.
     * @returns {number} The calculated SVG width.
     */
    this.getSvgWidth = function() {
        var yLabelWidth = this.showYLabel === true ? labelHeight : 0;
        var plotWidth = this.width - yLabelWidth - this.margin.left - this.margin.right;
        return plotWidth;
    };

    /**
     * Calculates the effective SVG height, accounting for margins, title, and X-axis label.
     * @returns {number} The calculated SVG height.
     */
    this.getSvgHeight = function() {
        var titleHeight  = this.showTitle === true ? labelHeight : 0;
        var xLabelHeight = this.showXLabel === true ? labelHeight : 0;
        var plotHeight   = this.height - titleHeight - xLabelHeight - this.margin.top - this.margin.bottom;
        return plotHeight;
    };


    this.draw = function() {

        // Select the chart container and apply the base class.
        var chartContainer = d3.select(container).attr('class', 'pk-chart');

        // Insert the main plot area div.
        var chart = chartContainer.insert("div").attr("class", "pk-plot pk-clear-after");

        // Create a left container for the Y-axis label.
        var leftContainer = chart.insert("div").attr("class", "pk-leftContainer");
        if (this.showYLabel === true) {
            leftContainer.style('width', labelHeight + 'px');
        }

        // Add the Y-axis label if configured.
        if (this.showYLabel === true) {
            leftContainer.insert("div")
                         .html(pkEscapeHtml(this.yLabel))
                         .attr("class", "pk-yLabel")
                         .style('height', labelHeight + 'px')
                         .style('line-height', labelHeight + 'px')
                         .style('width', (this.getSvgHeight() + this.margin.top + this.margin.bottom) + 'px'); /* This width must match the total height of the SVG area plus its margins. */
        }

        // Create the main container for title, SVG, and X-axis label.
        var mainContainer = chart.insert("div").attr("class", "pk-mainContainer");

        // Add the chart title if configured.
        if (this.showTitle === true) {
            mainContainer.insert("div")
                         .html(pkEscapeHtml(this.title))
                         .attr("class", "pk-title")
                         .style('height', labelHeight + 'px')
                         .style('line-height', labelHeight + 'px');
        }

        // Create the SVG container.
        var svgContainer = mainContainer.insert("div").attr("class", "pk-svgContainer");

        // Add the X-axis label if configured.
        if (this.showXLabel === true) {
            mainContainer.insert("div")
                         .html(pkEscapeHtml(this.xLabel))
                         .attr("class", "pk-xLabel")
                         .style('height', labelHeight + 'px')
                         .style('line-height', labelHeight + 'px');
        }

        // Initialize the main SVG element.
        this.svg = svgContainer.insert("svg")
                    .attr('width', this.getSvgWidth() + this.margin.left + this.margin.right)
                    .attr('height', this.getSvgHeight() + this.margin.top + this.margin.bottom);

        // Add mousemove event listener to the SVG container for tooltip positioning.
        svgContainer.on("mousemove", function() {
            var tooltip = d3.select(".pk-tooltip");
            var coord   = d3.mouse(this); // Get mouse coordinates relative to the container.
            tooltip.style("left", (d3.event.pageX) + "px"); // Set tooltip X position.
            tooltip.style("top", (d3.event.pageY) + "px");   // Set tooltip Y position.
        });

        // Apply a translation transform to the SVG group based on chart type.
        if (this.isRadial === false) {
            this.svg = this.svg.append("g")
                        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        } else {
            // For radial charts, translate to the center.
            this.svg = this.svg.append("g")
                        .attr("transform", "translate(" + this.radius + "," + this.radius + ")");
        }
    };
}


function Axis(plot) {

    // Store a reference to the parent plot object.
    var plot = plot;

    // Axis configuration properties.
    this.showTicks = true;
    this.tickCount = 5;
    this.offset    = 0; // Used for bar chart axis alignment.

    /**
     * Draws an axis on the plot.
     * @param {d3.scale} scale - The D3 scale function for the axis.
     * @param {string} orient - The orientation of the axis ('bottom' or 'left').
     * @param {number} ticks - The desired number of ticks.
     */
    this.draw = function (scale, orient, ticks) {

        // Special handling for a "fake" X-axis (line at the bottom).
        // This is primarily for hiding gaps when using bar charts with x-axis.
        if (orient === 'bottom') {
            plot.svg.append('line')
                .attr('x1', 0)
                .attr('y1', plot.getSvgHeight())
                .attr('x2', plot.getSvgWidth())
                .attr('y2', plot.getSvgHeight())
                .attr('class', 'pk-fakeAxis');
        }

        // Configure the D3 axis generator.
        var axis = d3.svg.axis()
                    .scale(scale)
                    .orient(orient)
                    .ticks(ticks);

        // Append a 'g' element for the axis and apply class.
        var rendered = plot.svg.append("g")
            .attr("class", "pk-axis");

        // Apply a translation for the bottom axis.
        if (orient === 'bottom') {
            rendered.attr('transform', 'translate(' + this.offset + ',' + plot.getSvgHeight() + ')');
        }

        // Call the D3 axis generator to render the axis.
        rendered.call(axis);
    };

    /**
     * Draws grid lines for the axis.
     * @param {d3.scale} scale - The D3 scale function for the axis.
     * @param {string} orient - The orientation of the axis ('bottom' or 'left').
     */
    this.drawGrid = function (scale, orient) {
        // Only draw grid if ticks are visible.
        if (this.showTicks) {

            // Configure a D3 axis generator for grid lines.
            var axis = d3.svg.axis()
                        .scale(scale)
                        .orient(orient)
                        .ticks(this.tickCount);

            if (orient === 'bottom') {
                // X-grid lines.
                plot.svg.append('g')
                    .attr('class', 'pk-grid pk-xGrid')
                    .attr('transform', "translate(" + this.offset + "," + plot.getSvgHeight() + ")")
                    .call(axis
                        .tickSize(-plot.getSvgHeight(), 0, 0) // Extend ticks across the chart height.
                        .tickFormat("") // No labels for grid lines.
                    );
            } else {
                // Y-grid lines.
                plot.svg.append('g')
                    .attr('class', 'pk-grid pk-yGrid')
                    .call(axis
                        .tickSize(-plot.getSvgWidth(), 0, 0) // Extend ticks across the chart width.
                        .tickFormat('') // No labels for grid lines.
                    );
            }
        }
    };
}


function Axes(plot) {

    // Keep a reference to the parent plot.
    var plot = plot;

    // Instantiate X and Y axis components.
    this.x = new Axis(plot);
    this.y = new Axis(plot);

    /**
     * Draws both X and Y axes.
     * @param {d3.scale} xScale - The scale for the X-axis.
     * @param {d3.scale} yScale - The scale for the Y-axis.
     */
    this.draw = function(xScale, yScale) {
        this.x.draw(xScale, 'bottom', 5); // Draw X-axis at the bottom with 5 ticks.
        this.y.draw(yScale, 'left', 5);   // Draw Y-axis on the left with 5 ticks.
    };

    /**
     * Draws grid lines for both X and Y axes.
     * @param {d3.scale} xScale - The scale for the X-axis grid.
     * @param {d3.scale} yScale - The scale for the Y-axis grid.
     */
    this.drawGrid = function(xScale, yScale) {
        this.x.drawGrid(xScale, 'bottom', 5); // Draw X-grid.
        this.y.drawGrid(yScale, 'left', 5);   // Draw Y-grid.
    };
}


function Lines(plot) {
    var data;       // Private variable to hold the data.
    var plot = plot; // Reference to the parent plot object.
    var self = this; // Self-reference for inner scopes.

    // Configuration properties for lines.
    this.visible       = true;
    this.interpolation = 'linear'; // D3 interpolation type.
    this.lineWidth     = 2;

    /**
     * Initializes the line component with data.
     * @param {DataObject} dataObject - The data object containing series data.
     */
    this.init = function (dataObject) {
        if (this.visible === true) {
            data = dataObject; // Assign data only if lines are visible.
        }
    };

    /**
     * Draws the lines on the plot.
     * @param {d3.scale} xScale - The scale for the X-axis.
     * @param {d3.scale} yScale - The scale for the Y-axis.
     */
    this.draw = function(xScale, yScale) {
        if (this.visible === true) {

            // Create a D3 line generator.
            var line = d3.svg.line().interpolate(this.interpolation).x(function(d) { return xScale(d.x); });

            // Set the Y-accessor based on whether data is stacked.
            if (data.isStacked === true) {
                line.y(function(d) { return yScale(d.y0 + d.y); });
            } else {
                line.y(function(d) { return yScale(d.y); });
            }

            // Iterate over each data series and draw a line.
            data.getData().forEach(function (series) {
                var element = plot.svg.append("path")
                    .attr("class", "pk-line")
                    .style("stroke", series.color)
                    .style("stroke-width", this.lineWidth)
                    .attr("d", line(series.values)); // Generate the line path.
            }, this); // Ensure 'this' context refers to Lines instance.
        }
    };
}


function Areas(plot) {
    var data;        // Data for the areas.
    var plot = plot; // Reference to the plot.
    var self = this; // Self-reference.

    // Area specific configuration.
    this.visible       = false;
    this.interpolation = 'linear';
    this.hasOpacity    = false;
    this.opacity       = 0.6;

    /**
     * Initializes the area component with data.
     * @param {DataObject} dataObject - The data object to use.
     */
    this.init = function (dataObject) {
        if (this.visible === true) {
            data = dataObject;
        }
    };

    /**
     * Draws the area charts.
     * @param {d3.scale} xScale - X-axis scale.
     * @param {d3.scale} yScale - Y-axis scale.
     */
    this.draw = function(xScale, yScale) {
        if (this.visible === true) {

            // Create a D3 area generator.
            var area = d3.svg.area().interpolate(this.interpolation).x(function(d) { return xScale(d.x); });

            // Define y0 and y1 accessors based on stacking.
            if (data.isStacked === true) {
                area.y0(function(d) { return yScale(d.y0); });
                area.y1(function(d) { return yScale(d.y0 + d.y); });
            } else {
                area.y0(plot.getSvgHeight()); // Base of the area at the bottom of the SVG.
                area.y1(function(d) { return yScale(d.y); });
            }

            // Iterate through each series and draw its area.
            data.getData().forEach(function (series) {
                var element = plot.svg.append("path")
                        .attr("class", "pk-area")
                        .style("fill", series.color)
                        .attr("d", area(series.values)); // Generate the area path.

                // Apply fill opacity if enabled.
                if (this.hasOpacity === true) {
                    element.style('fill-opacity', this.opacity);
                }
            }, this); // Preserve 'this' context for the Areas instance.
        }
    };
}


function Points(plot) {
    var data;        // Data for the points.
    var self = this; // Self-reference for event handlers.
    var plot = plot; // Reference to the plot.

    // Point specific configuration properties.
    this.visible = false;
    this.size    = 4; // Radius of the points.
    this.fill    = false; // Whether points should be filled or just outlined.

    /**
     * Initializes the point component with data.
     * @param {DataObject} dataObject - The data object to use.
     */
    this.init = function (dataObject) {
        if (this.visible === true) {
            data = dataObject;
        }
    };

    /**
     * Draws points (circles) on the plot.
     * @param {d3.scale} xScale - X-axis scale.
     * @param {d3.scale} yScale - Y-axis scale.
     */
    this.draw = function(xScale, yScale) {
        if (this.visible === true) {
            data.getData().forEach(function (series) {

                // Create a tooltip div dynamically if it doesn't exist, or select it.
                d3.select(plot.container)
                    .append("div")
                    .attr("class", "pk-tooltip")
                    .html("<p>Tooltip</p>"); // Initial content for the tooltip.

                // Select all circles for this series and bind data.
                var point = plot.svg.selectAll(".chart")
                    .data(series.values)
                    .enter()
                    .append("circle")
                      .attr("transform", function(d) {
                        // Position points based on stacking or regular Y-value.
                        if (data.isStacked === true) {
                            return "translate(" + xScale(d.x) + ", " + yScale(d.y0 + d.y) + ")";
                        } else {
                            return "translate(" + xScale(d.x) + ", " + yScale(d.y) + ")";
                        }
                    })
                    .attr("r", function(d){ return self.size; }) // Set initial radius.
                    .style("stroke", series.color)
                    .on("mouseover", this.mouseover_circle) // Attach mouseover event.
                    .on("mouseout", this.mouseout_circle);   // Attach mouseout event.

                // Apply fill style based on configuration.
                if (this.fill) {
                    point.attr("fill", series.color);
                } else {
                    point.attr("fill", "white");
                }

            }, this); // Preserve 'this' context for the Points instance.
        }
    };

    /**
     * Event handler for mouseover on a circle.
     * Enlarges the circle and shows a tooltip.
     * @param {Object} data - The data bound to the hovered circle.
     * @param {number} i - The index of the hovered circle.
     */
    this.mouseover_circle = function(data, i) {
        var formatDate = d3.time.format("%A %d. %B %Y"); // Date formatting function.
        var circle     = d3.select(this);

        // Animate circle radius on hover.
        circle.transition().duration(500).attr("r", 10);

        // Show and fade in the tooltip.
        d3.select(".pk-tooltip")
        .style("display", "block")
        .style('opacity', 0)
        .transition().delay(200).duration(500).style('opacity', 1);

        // Update tooltip content.
        d3.select(".pk-tooltip p")
            .html("<strong>Date:</strong> "
                + formatDate(new Date(data.x))
                + "<br/>"
                + "<strong>Value:</strong> "
                + data.y
                );
    };

    /**
     * Event handler for mouseout from a circle.
     * Restores circle size and hides the tooltip.
     */
    this.mouseout_circle = function() {
        var circle = d3.select(this);

        // Animate circle radius back to original size.
        circle.transition().duration(500).attr("r", self.size);

        // Hide the tooltip.
        d3.select(".pk-tooltip").style("display", "none");
    };

}


function Bars(plot) {

    var plot = plot; // Reference to the parent plot.
    var data;        // Data for the bars.

    // Configuration for bar charts.
    this.visible      = false;
    this.hasOutline   = true;
    this.outlineWidth = 2;
    this.hasOpacity   = false;
    this.opacity      = 0.6;

    // Private variables for bar width calculations.
    var sampleCount;
    var groupCount;
    var outerGap = 20; // Gap between sample boxes.
    var innerGap = 5;  // Gap between bars within a group.

    var sampleBoxWidth;
    var groupBoxWidth;
    var barWidth;

    /**
     * Returns the calculated width of a single sample box.
     * @returns {number} The width of a sample box.
     */
    this.getSampleBoxWidth = function() {
        return sampleBoxWidth;
    };

    /**
     * Initializes the bar component, calculating widths based on data.
     * @param {DataObject} dataObject - The data object containing series data.
     */
    this.init = function(dataObject) {
        if (this.visible === true) {
            data        = dataObject;
            sampleCount = data.countSamples();
            groupCount  = data.countGroups();

            // Calculate widths for layout.
            sampleBoxWidth = plot.getSvgWidth() / sampleCount;
            groupBoxWidth  = (sampleBoxWidth - (2 * outerGap));
            // Adjust bar width to remove gap after the last bar in a group.
            barWidth       = (groupBoxWidth / groupCount) - innerGap + (innerGap / groupCount);

            // Adjust X-axis tick offset to center ticks under bars.
            plot.axes.x.offset = sampleBoxWidth / 2;
        }
    };

    /**
     * Draws the bar chart.
     * @param {d3.scale} xScale - X-axis scale.
     * @param {d3.scale} yScale - Y-axis scale.
     */
    this.draw = function(xScale, yScale) {
        if (this.visible === true) {
            var groups = data.getGroups(); // Get the list of groups for positioning.
            var max    = data.yExtent()[1]; // Get the maximum Y value for height calculation.

            // Iterate over each series.
            data.getData().forEach(function(series, i) {
                // Iterate over each value within the series.
                series.values.forEach(function(value) {
                    var bar = plot.svg.append("rect")
                        .attr("class", "pk-rect-line pk-rect-area")
                        .style("fill", series.color)
                        .attr("x", function(d) {
                            var x = xScale(value.x) + outerGap; // Base X position for the sample box.
                            // Add offset for the specific group within the sample box.
                            var offset = groups.indexOf(series.group);
                            x += (barWidth + innerGap) * offset;
                            return x;
                        })
                        .attr("width", barWidth)
                        // For Y-axis, D3 uses a top-left coordinate system.
                        // We calculate Y position and height from the bottom up.
                        .attr("y", function(d) { return plot.getSvgHeight() - yScale(max - value.y - value.y0); })
                        .attr("height", function(d) { return yScale(max - value.y); });

                    // Apply outline if enabled.
                    if (this.hasOutline === true) {
                        bar.style("stroke", series.color);
                        bar.style("stroke-width", this.outlineWidth);
                    }
                    // Apply fill opacity if enabled.
                    if (this.hasOpacity === true) {
                        bar.style('fill-opacity', this.opacity);
                    }
                }, this); // Preserve 'this' context for Bars instance.
            }, this); // Preserve 'this' context for Bars instance.
        }
    };
}


/**
 *  Data handling class for charting components.
 *  Manages data parsing, stacking, and extent calculations.
 */
function Data() {

    var self = this; // Reference to the Data instance.
    var data;        // Private variable to store the raw data array.

    // Configuration properties for data processing.
    this.isStacked      = false;
    this.isStackedByGroup = false; // Not currently used, but indicates future capability.
    this.stackOffset    = 'zero';  // D3 stack offset type.

    /**
     * Initializes the data object.
     * @param {Array} dataArray - The raw data array.
     */
    this.init = function(dataArray) {
        data = dataArray; // Store the provided data.

        parseDates();     // Convert date strings to Date objects.
        fetchGroups();    // Identify unique groups in the data.

        // Apply stacking transformation if enabled.
        if (this.isStacked) {
            stack();
        }

        fetchXExtent();   // Determine the min/max for the X-axis.
        fetchYExtent();   // Determine the min/max for the Y-axis.
    };

    // todo - Implement interpolation for missing data points.
    // Example reference: http://stackoverflow.com/questions/14713503

    /**
     * Returns the processed data array.
     * @returns {Array} The data array.
     */
    this.getData = function() {
        return data;
    };


    /**
     * Counts the number of samples (data points) in each series.
     * Assumes all series have the same length.
     * @returns {number} The number of samples.
     */
    this.countSamples = function() {
        // Todo: Ensure this handles cases where series might have different lengths.
        return data[0].values.length;
    };


    /**
     * Private helper function to parse date strings into Date objects.
     */
    var parseDates = function() {
        // Define the date format.
        var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

        // Iterate through each series and each value to parse the 'x' property.
        data.forEach(function (series) {
            series.values.forEach(function (value) {
                value.x = parseDate(value.x);
            });
        });
    };

    // Placeholder for fetchGroups - implementation would go here.
    var fetchGroups = function() {
        // Logic to extract and store unique group names.
    };

    // Placeholder for stack - implementation would go here.
    var stack = function() {
        // Logic to apply D3 stacking layout.
    };

    // Placeholder for fetchXExtent - implementation would go here.
    var fetchXExtent = function() {
        // Logic to calculate the min and max X values.
    };

    // Placeholder for fetchYExtent - implementation would go here.
    var fetchYExtent = function() {
        // Logic to calculate the min and max Y values, considering stacking.
    };

    // Placeholder for yExtent - would return the calculated Y extent.
    this.yExtent = function() {
        // This function would typically return the calculated [min, max] of Y values.
        // For demonstration, returning a dummy value.
        return [0, 100];
    };

    // Placeholder for getGroups - would return the unique groups.
    this.getGroups = function() {
        // This function would typically return an array of unique group identifiers.
        // For demonstration, returning a dummy value.
        return ["Group A", "Group B"];
    };
}