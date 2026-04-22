function circularHeatChart  ( )
{
    // Define initial configuration parameters for the circular heat chart.
    // These can be overridden later using the chart's setter methods.

    var margin       = { top: 20 , right: 20 , bottom: 20 , left: 20 },
        // The padding around the chart area.

    innerRadius      = 50,
        // The radius of the innermost circle of the chart.

    numSegments      = 24,
        // The total number of segments (slices) in the chart.
        // This determines the angular resolution.

    segmentHeight    = 20,
        // The height of each concentric ring segment.

    domain           = null,
        // The input data domain for the color scale. If null, it will be automatically
        // calculated from the data.

    range            = [ "white" , "red" ],
        // The output color range for the color scale.

    accessor         = function(d) { return d; },
        // A function to extract the value from each data point for coloring.

    radialLabels     = [ ],
    segmentLabels    = [ ]
        // Arrays to hold labels for the radial and segment axes.
        // Initialized as empty arrays.
    ; // End of variable declarations for chart configuration.



    /**
     * The main chart function that renders the circular heat chart
     * into the provided D3 selection.
     * @param {D3.selection} selection - The D3 selection to which the chart will be appended.
     */
    function chart ( selection )
    {
        selection.each(function(data)
        {
            // Select the current SVG container for drawing.
            var svg = d3.select(this);


            // Calculate the offset for centering the chart.
            // This accounts for the inner radius and the total height of the segments.
            var offset = innerRadius + Math.ceil(data.length / numSegments) * segmentHeight;


            // Append the main group element for the chart and apply transformations.
            // This group will contain all the segments and labels.
            g = svg.append("g")
                   .classed("circular-heat", true) // Add a class for styling and selection.
                   .attr("transform", "translate(" + parseInt(margin.left + offset) + "," + parseInt(margin.top + offset) + ")");


            // Determine the color scale domain.
            // If not explicitly set, calculate it from the data.
            var autoDomain = false;
            if (domain === null)
            {
                domain = d3.extent(data, accessor); // Calculate min/max from data.
                autoDomain = true; // Flag that domain was auto-calculated.
            }

            // Create the linear color scale.
            var color = d3.scale.linear()
                            .domain(domain)
                            .range(range);

            // If the domain was auto-calculated, reset it to null
            // so that it can be re-calculated for subsequent updates if needed.
            if(autoDomain)
            {
                domain = null;
            }


            // Draw the individual segments of the heat chart.
            // Bind data to path elements.
            g.selectAll("path")
             .data(data)
             .enter()
             .append("path")
             .attr("d", d3.svg.arc().innerRadius(ir).outerRadius(or).startAngle(sa).endAngle(ea))
             .attr("fill", function(d) {
                                        // Fill color based on the accessor value and color scale.
                                        return color(accessor(d));
                                      });


            // Generate a unique ID for text path definitions.
            // This helps avoid conflicts if multiple charts are on the same page.
            // TODO: Investigate if there's a more robust D3-idiomatic way to handle unique IDs.
            var id = d3.selectAll(".circular-heat")[0].length;


            // --- Radial Labels ---
            // These labels run along the concentric circles.

            var lsa = 0.01; // Label start angle (a small offset to avoid text overlapping the start of the arc).

            var labels = svg.append("g")
                            .classed("labels", true) // General class for all labels.
                            .classed("radial", true) // Specific class for radial labels.
                            .attr("transform", "translate(" + parseInt(margin.left + offset) + "," + parseInt(margin.top + offset) + ")");


            // Create path definitions for radial labels.
            // Each label gets its own circular path.
            labels.selectAll("def")
                  .data(radialLabels)
                  .enter()
                  .append("def")
                  .append("path")
                  .attr("id", function(d, i) {
                                                // Unique ID for each radial label path.
                                                return "radial-label-path-"+id+"-"+i;
                                              })
                  .attr("d", function(d, i) {
                                                // Calculate radius for the current label path.
                                                var r = innerRadius + ((i + 0.2) * segmentHeight);
                                                // SVG path data for a circular arc.
                                                return "m" + r * Math.sin(lsa) + " -" + r * Math.cos(lsa) +
                                                       " a" + r + " " + r + " 0 1 1 -1 0";
                                            });


            // Append text elements and attach them to the radial paths.
            labels.selectAll("text")
                  .data(radialLabels)
                  .enter()
                  .append("text")
                  .append("textPath")
                  .attr("xlink:href", function(d, i) {
                                                        // Link text to its corresponding path definition.
                                                        return "#radial-label-path-"+id+"-"+i;
                                                      })
                  .style("font-size", 0.6 * segmentHeight + 'px') // Dynamically set font size.
                  .text(function(d) {
                                      // Display the actual label text.
                                      return d;
                                    });


            // --- Segment Labels ---
            // These labels run along the outer circumference, marking segments.

            var segmentLabelOffset = 2; // Small offset from the outermost segment.
            var r = innerRadius + Math.ceil(data.length / numSegments) * segmentHeight + segmentLabelOffset; // Radius for segment labels.

            labels = svg.append("g") // New group for segment labels.
                        .classed("labels", true)
                        .classed("segment", true)
                        .attr("transform", "translate(" + parseInt(margin.left + offset) + "," + parseInt(margin.top + offset) + ")");


            // Create a single path definition for all segment labels.
            // All segment labels will share this path, but use different start offsets.
            labels.append("def")
                  .append("path")
                  .attr("id", "segment-label-path-"+id) // Unique ID for the segment label path.
                  .attr("d", "m0 -" + r + " a" + r + " " + r + " 0 1 1 -1 0"); // A full circle path.


            // Append text elements for segment labels and attach them to the shared path.
            labels.selectAll("text")
                  .data(segmentLabels)
                  .enter()
                  .append("text")
                  .append("textPath")
                  .attr("xlink:href", "#segment-label-path-"+id) // Link to the shared segment path.
                  .attr("startOffset", function(d, i) {
                                                        // Calculate offset to distribute labels evenly along the circle.
                                                        return i * 100 / numSegments + "%";
                                                      })
                  .text(function(d) {
                                      // Display the segment label text.
                                      return d;
                                    });
        }); // End of selection.each()
    } // End of chart function.


    /* --- Arc Calculation Functions --- */
    // These functions define the inner radius, outer radius, start angle,
    // and end angle for each segment of the circular heat chart.

    // Calculates the inner radius for a given data point 'd' at index 'i'.
    ir = function(d, i) {
        return innerRadius + Math.floor(i/numSegments) * segmentHeight;
    }; // End of ir function.

    // Calculates the outer radius for a given data point 'd' at index 'i'.
    or = function(d, i) {
        return innerRadius + segmentHeight + Math.floor(i/numSegments) * segmentHeight;
    }; // End of or function.

    // Calculates the start angle for a given data point 'd' at index 'i'.
    sa = function(d, i) {
        return (i * 2 * Math.PI) / numSegments;
    }; // End of sa function.

    // Calculates the end angle for a given data point 'd' at index 'i'.
    ea = function(d, i) {
        return ((i + 1) * 2 * Math.PI) / numSegments;
    }; // End of ea function.


    /* --- Configuration Getters/Setters --- */
    // These methods allow external code to configure the chart's properties
    // using a fluent interface (method chaining).

    chart.margin = function(_) {
        if (!arguments.length) return margin; // Getter: if no arguments, return current value.
        margin = _; // Setter: update value.
        return chart; // Return chart for chaining.
    };

    chart.innerRadius = function(_) {
        if (!arguments.length) return innerRadius;
        innerRadius = _;
        return chart;
    };

    chart.numSegments = function(_) {
        if (!arguments.length) return numSegments;
        numSegments = _;
        return chart;
    };

    chart.segmentHeight = function(_) {
        if (!arguments.length) return segmentHeight;
        segmentHeight = _;
        return chart;
    };

    chart.domain = function(_) {
        if (!arguments.length) return domain;
        domain = _;
        return chart;
    };

    chart.range = function(_) {
        if (!arguments.length) return range;
        range = _;
        return chart;
    };

    chart.radialLabels = function(_) {
        if (!arguments.length) return radialLabels;
        if (_ == null) _ = []; // Ensure it's an array, even if null is passed.
        radialLabels = _;
        return chart;
    };

    chart.segmentLabels = function(_) {
        if (!arguments.length) return segmentLabels;
        if (_ == null) _ = []; // Ensure it's an array.
        segmentLabels = _;
        return chart;
    };

    chart.accessor = function(_) {
        if (!arguments.length) return accessor;
        accessor = _;
        return chart;
    };


    // The main function returns the 'chart' function,
    // which is the entry point for rendering and configuration.
    return chart;
} // End of circularHeatChart function.