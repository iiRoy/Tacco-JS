(function( venn ) {

    // This is the primary factory function for creating Venn Diagram charts.
    // It returns a configurable chart object that can be applied to a D3 selection.
    venn.VennDiagram = function() {
        // Default configuration parameters for the Venn Diagram.
        var width          = 600,
            height         = 350,
            padding        = 15,
            duration       = 1000,
            fontSize       = null, // If null, D3's default font size is used.
            colours        = d3.scale.category10(), // D3 color scale for circles.
            layoutFunction = venn.venn; // The algorithm used to position circles.

        /**
         * The main chart rendering function.
         * It takes a D3 selection (e.g., an SVG element) and renders the Venn diagram within it.
         * @param {D3.selection} selection - The D3 selection to render the chart into.
         */
        function chart(selection) {

            selection.each(function(data) {
                // Calculate initial circle positions and scale them to fit the specified dimensions.
                var circles     = venn.scaleSolution(layoutFunction(data), width, height, padding);
                var textCentres = computeTextCentres(circles, data, width, height); /* Determine optimal text positions. */

                // Select or append an SVG container for the chart.
                var svg = d3.select(this).selectAll("svg").data([circles]);
                svg.enter().append("svg"); // Add SVG if it doesn't exist.

                // Set the dimensions of the SVG container.
                svg .attr("width", width)
                    .attr("height", height);

                // To ensure smooth transitions for intersection areas,
                // we need to capture the previous positions of the circles.
                // This is done by extracting path data from existing elements.
                var previous = {},
                    hasPrevious = false;

                svg.selectAll("g")
                   .each(function (d) {
                        var path = d3.select(this).select("path").attr("d");
                        // Only single circles contribute to the 'previous' state.
                        if ((d.sets.length == 1) && path) {
                            hasPrevious = true;
                            previous[d.sets[0]] = venn.circleFromPath(path);
                        }
                    });

                // This function interpolates intersection area paths between
                // their starting (previous) and ending (current) positions during transitions.
                var pathTween = function(d) {
                    return function(t) {
                        var c = d.sets.map(function (set) {
                            var start = previous[set], // Starting circle state.
                                end   = circles[set];   // Ending circle state.

                            // If a circle was not present before, initialize it at the center with a minimal radius.
                            if (!start) {
                                start = { x : width/2, y : height/2, radius : 1 };
                            }
                            // If a circle is new, or disappears, ensure it has an end state.
                            if (!end) {
                                end = { x : width/2, y : height/2, radius : 1 };
                            }

                            // Linear interpolation for x, y, and radius.
                            return { 'x'      : start.x * (1 - t) + end.x * t,
                                     'y'      : start.y * (1 - t) + end.y * t,
                                     'radius' : start.radius * (1 - t) + end.radius * t };
                        });
                        return venn.intersectionAreaPath(c); // Generate the path for the interpolated circle(s).
                    };
                };

                // Update data binding for all group elements, joining on set IDs.
                var nodes = svg.selectAll("g")
                               .data(data, function(d) { return d.sets; });

                // Create new group elements for entering data.
                var enter = nodes.enter()
                                 .append('g')
                                 .attr("class", function(d) {
                                    // Assign CSS classes for styling (e.g., "venn-circle", "venn-intersection").
                                    return "venn-area venn-" +
                                        (d.sets.length == 1 ? "circle" : "intersection") +
                                        (" venn-sets-" + d.sets.join("_"));
                                 });

                // Append path elements to new groups.
                enter.append("path")
                     .style("fill-opacity", "0") // Start with transparent fill.
                     .filter(function (d) { return d.sets.length == 1; } ) // Only apply color to single circles.
                     .style("fill", function(d) { return colours(label(d)); } )
                     .style("fill-opacity", ".25"); // Set initial fill opacity for single circles.

                // Append text elements to new groups for labels.
                var enterText = enter.append("text")
                                     .style("fill", function(d) {
                                         // Use circle color for single sets, default grey for intersections.
                                         return d.sets.length == 1 ? colours(label(d)) : "#444";
                                     })
                                     .text(function (d) { return label(d); } ) // Set the text content.
                                     .attr("text-anchor", "middle") // Center the text horizontally.
                                     .attr("dy", ".35em") // Vertically align text.
                                     .attr("x", width/2) // Initial x position for new text (center).
                                     .attr("y", height/2); // Initial y position for new text (center).

                // Update existing nodes with transitions.
                var update = nodes.transition("venn").duration(hasPrevious ? duration : 0);
                update.select("path")
                      .attrTween("d", pathTween); // Animate path changes.

                var updateText = update.select("text")
                                       .text(function (d) { return label(d); } ) // Update text content.
                                       .each("end", venn.wrapText(circles, label)) // Wrap text if needed after transition.
                                       .attr("x", function(d) {
                                           return Math.floor(textCentres[d.sets].x); // Animate text to new x position.
                                       })
                                       .attr("y", function(d) {
                                           return Math.floor(textCentres[d.sets].y); // Animate text to new y position.
                                       });

                // If a specific font size is provided, animate the text size.
                if (fontSize !== null) {
                    enterText.style("font-size", "0px"); // New text starts invisible.
                    updateText.style("font-size", fontSize); // Transition to desired font size.
                }

                // Remove old nodes that are no longer in the data.
                var remove = nodes.exit().transition('venn').duration(duration).remove();
                remove.select("path")
                      .attrTween("d", pathTween); // Animate path removal.

                remove.select("text")
                      .text(function (d) { return label(d); } ) // Ensure text content is correct during removal.
                      .attr("x", width/2) // Move text to center.
                      .attr("y", height/2) // Move text to center.
                      .style("font-size", "0px"); // Shrink text to disappear.
            });
        }

        // Helper function to extract the label from a data object.
        function label(d) {
            if (d.label) {
                return d.label; // Use explicit label if available.
            }
            if (d.sets.length == 1) {
                return '' + d.sets[0]; // For single sets, use the set ID as label.
            }
            // No label for intersections by default in this implementation path.
        }

        // --- Chart API: Getters and Setters for configuration parameters ---

        chart.width = function(_) {
            if (!arguments.length) return width;
            width = _;
            return chart; // Return chart for method chaining.
        };

        chart.height = function(_) {
            if (!arguments.length) return height;
            height = _;
            return chart;
        };

        chart.padding = function(_) {
            if (!arguments.length) return padding;
            padding = _;
            return chart;
        };

        chart.colours = function(_) {
            if (!arguments.length) return colours;
            colours = _;
            return chart;
        };

        chart.fontSize = function(_) {
            if (!arguments.length) return fontSize;
            fontSize = _;
            return chart;
        };

        chart.duration = function(_) {
            if (!arguments.length) return duration;
            duration = _;
            return chart;
        };

        chart.layoutFunction = function(_) {
            if (!arguments.length) return layoutFunction;
            layoutFunction = _;
            return chart;
        };

        return chart; // Return the configurable chart function.
    };

    /**
     * Given a list of set objects and their corresponding overlaps,
     * this function updates the (x, y, radius) attributes on each set
     * such that their positions roughly correspond to the desired overlaps.
     * This is the core layout algorithm.
     * @param {Array} areas - Array of objects describing sets and their overlaps.
     * @param {Object} parameters - Optional parameters for the optimization.
     * @returns {Object} An object mapping set IDs to their optimized circle properties (x, y, radius).
     */
    venn.venn = function(areas, parameters) {
        parameters = parameters || {};
        parameters.maxIterations = parameters.maxIterations || 500; // Max iterations for optimization.
        var lossFunction = parameters.lossFunction || venn.lossFunction; // Function to calculate layout error.
        var initialLayout = parameters.initialLayout || venn.greedyLayout; // Initial positioning strategy.
        var fmin = parameters.fmin || venn.fmin; // Optimization algorithm (e.g., Nelder-Mead).

        // Perform an initial, greedy layout to get a good starting point.
        var circles = initialLayout(areas);

        // Transform x/y coordinates of the circles into a flat vector for optimization.
        var initial = [],
            setids = [],
            setid;

        for (setid in circles) {
            if (circles.hasOwnProperty(setid)) {
                initial.push(circles[setid].x);
                initial.push(circles[setid].y);
                setids.push(setid); // Keep track of set IDs to reconstruct circles later.
            }
        }

        // Optimize the initial layout using the provided loss function.
        var totalFunctionCalls = 0;
        var solution = fmin(
            function(values) {
                totalFunctionCalls += 1; // Track how many times the loss function is called.
                var current = {};
                for (var i = 0; i < setids.length; ++i) {
                    var setid_local = setids[i]; // Use a local variable to avoid scope issues.
                    current[setid_local] = {
                        x      : values[2 * i],
                        y      : values[2 * i + 1],
                        radius : circles[setid_local].radius, // Radius remains constant during optimization.
                        // size : circles[setid_local].size // Size is also constant.
                    };
                }
                return lossFunction(current, areas); // Calculate the error for the current layout.
            },
            initial,    // Starting vector for optimization.
            parameters  // Optimization parameters.
        );

        // Transform the optimized solution vector back into x/y points for each circle.
        var positions = solution.solution;
        for (var i = 0; i < setids.length; ++i) {
            setid = setids[i]; // Re-use setid variable.
            circles[setid].x = positions[2 * i];
            circles[setid].y = positions[2 * i + 1];
        }

        return circles; // Return the optimized circle positions.
    };

    /**
     * Calculates the distance required for two circles of given radii
     * to produce a specific overlap area.
     * @param {number} r1 - Radius of the first circle.
     * @param {number} r2 - Radius of the second circle.
     * @param {number} overlap - Desired overlap area.
     * @returns {number} The distance between the centers of the two circles.
     */
    venn.distanceFromIntersectArea = function(r1, r2, overlap) {
        // Handle cases where circles are completely overlapped or one is inside another.
        // A small epsilon (SMALL) is used for floating point comparisons.
        if (Math.min(r1, r2) * Math.min(r1,r2) * Math.PI <= overlap + SMALL) {
            return Math.abs(r1 - r2); // Distance is difference in radii if one is inside other.
        }

        // Use bisection method to find the distance that yields the desired overlap.
        // The function to bisect is `venn.circleOverlap(r1, r2, distance) - overlap`.
        // We search in the range [0, r1 + r2].
        return venn.bisect(function(distance) {
            return venn.circleOverlap(r1, r2, distance) - overlap;
        }, 0, r1 + r2);
    };

    /// Computes a matrix of Euclidean distances between all sets in the Venn diagram.
    /// This is used primarily for MDS layout.
    venn.getDistanceMatrix = function(areas, sets, setids) {
        // Initialize an empty square matrix for distances.
        var distances = [];
        for (var i = 0; i < sets.length; ++i) {
            distances.push([]);
            for (var j = 0; j < sets.length; ++j) {
                distances[i].push(0); // All distances initially zero.
            }
        }

        // Compute distances based on pairwise overlap areas.
        for (i = 0; i < areas.length; ++i) {
            var current = areas[i];
            if (current.sets.length !== 2) {
                continue; // Only consider pairwise overlaps for distance calculation.
            }

            var left_idx  = setids[current.sets[0]], // Index of the first set.
                right_idx = setids[current.sets[1]], // Index of the second set.
                r1        = Math.sqrt(sets[left_idx].size / Math.PI),  // Radius of first circle.
                r2        = Math.sqrt(sets[right_idx].size / Math.PI), // Radius of second circle.
                distance  = venn.distanceFromIntersectArea(r1, r2, current.size); // Calculated distance.

            distances[left_idx][right_idx] = distances[right_idx][left_idx] = distance; // Symmetric matrix.
        }
        return distances; // Return the distance matrix.
    };

    /**
     * Lays out a Venn diagram greedily, starting with the most overlapped sets
     * and progressively adding less overlapped sets. It attempts to position
     * each new set such that its overlapping areas with already positioned sets are correct.
     * @param {Array} areas - Array of objects describing sets and their overlaps.
     * @returns {Object} An object mapping set IDs to their initial circle properties (x, y, radius).
     */
    venn.greedyLayout = function(areas) {
        // Define a circle for each individual set.
        var circles = {},
            setOverlaps = {},
            set;

        for (var i = 0; i < areas.length; ++i) {
            var area = areas[i];
            if (area.sets.length == 1) { // Process single sets first.
                set = area.sets[0];
                circles[set] = {
                    x      : 1e10, // Initialize with large, arbitrary coordinates.
                    y      : 1e10,
                    rowid  : circles.length, // Unique ID for internal use.
                    size   : area.size,
                    radius : Math.sqrt(area.size / Math.PI) // Calculate radius from area.
                };
                setOverlaps[set] = []; // Initialize list for overlaps of this set.
            }
        }

        // Filter areas to only include pairwise overlaps for greedy positioning.
        areas = areas.filter(function(a) { return a.sets.length == 2; });

        // Map each set to a list of other sets it overlaps with.
        for (i = 0; i < areas.length; ++i) {
            var current = areas[i];
            var weight  = current.hasOwnProperty('weight') ? current.weight : 1.0; // Overlap importance.
            var left    = current.sets[0],
                right   = current.sets[1];

            // If circles are completely overlapped, their positioning doesn't need to be prioritized by this.
            if (current.size + SMALL >= Math.min(circles[left].size, circles[right].size)) {
                weight = 0; // Reduce influence if one circle fully contains another.
            }

            setOverlaps[left].push ({set:right, size:current.size, weight:weight});
            setOverlaps[right].push({set:left,  size:current.size, weight:weight});
        }

        // Create a list of sets, sorted by how much they overlap with others.
        var mostOverlapped = [];
        for (set in setOverlaps) {
            if (setOverlaps.hasOwnProperty(set)) {
                var size = 0;
                for (i = 0; i < setOverlaps[set].length; ++i) {
                    size += setOverlaps[set][i].size * setOverlaps[set][i].weight;
                }
                mostOverlapped.push({set: set, size:size});
            }
        }

        // Sort sets in descending order of their total overlap size.
        function sortOrder(a,b) {
            return b.size - a.size;
        }
        mostOverlapped.sort(sortOrder);

        // Keep track of which sets have already been positioned.
        var positioned = {};
        function isPositioned(element) {
            return element.set in positioned;
        }

        // Helper to update circle position and mark it as positioned.
        function positionSet(point, index) {
            circles[index].x = point.x;
            circles[index].y = point.y;
            positioned[index] = true;
        }

        // Position the most overlapped set at the origin (0,0).
        positionSet({x: 0, y: 0}, mostOverlapped[0].set);

        // Iterate through the remaining sets to position them.
        for (i = 1; i < mostOverlapped.length; ++i) {
            var setIndex = mostOverlapped[i].set,
                overlap  = setOverlaps[setIndex].filter(isPositioned); // Overlaps with *already positioned* sets.
            set = circles[setIndex]; // The current set to be positioned.
            overlap.sort(sortOrder); // Sort overlaps by their size.

            if (overlap.length === 0) {
                // This should not happen if all sets eventually connect.
                throw "Need overlap information for set " + JSON.stringify( set );
            }

            var points = []; // Candidate positions for the current set.
            for (var j = 0; j < overlap.length; ++j) {
                // Get the appropriate distance from an already positioned set.
                var p1 = circles[overlap[j].set],
                    d1 = venn.distanceFromIntersectArea(set.radius, p1.radius,
                                                        overlap[j].size);

                // Sample candidate positions at 90-degree angles around the positioned circle.
                points.push({x : p1.x + d1, y : p1.y});
                points.push({x : p1.x - d1, y : p1.y});
                points.push({y : p1.y + d1, x : p1.x});
                points.push({y : p1.y - d1, x : p1.x});

                // If we have at least two overlaps with positioned sets,
                // we can analytically determine intersection points of the circles.
                for (var k = j + 1; k < overlap.length; ++k) {
                    var p2 = circles[overlap[k].set],
                        d2 = venn.distanceFromIntersectArea(set.radius, p2.radius,
                                                            overlap[k].size);

                    var extraPoints = venn.circleCircleIntersection(
                        { x: p1.x, y: p1.y, radius: d1},
                        { x: p2.x, y: p2.y, radius: d2});

                    for (var l = 0; l < extraPoints.length; ++l) {
                        points.push(extraPoints[l]); // Add these intersection points as candidates.
                    }
                }
            }

            // Evaluate the loss function for each candidate position to find the best one.
            var bestLoss = 1e50, // Initialize with a very large loss.
                bestPoint = points[0];

            for (j = 0; j < points.length; ++j) {
                circles[setIndex].x = points[j].x; // Temporarily assign candidate position.
                circles[setIndex].y = points[j].y;
                var loss = venn.lossFunction(circles, areas); // Calculate loss for this position.
                if (loss < bestLoss) {
                    bestLoss = loss;
                    bestPoint = points[j]; // Update best point if current loss is lower.
                }
            }

            positionSet(bestPoint, setIndex); // Finalize the position of the current set.
        }

        return circles; // Return the greedily laid out circles.
    };

    /// Uses multidimensional scaling (MDS) to approximate an initial layout for the Venn diagram.
    venn.classicMDSLayout = function(areas) {
        // Bidirectionally map sets to a row index (necessary for matrix operations in MDS).
        var sets = [],
            setids = {};

        for (var i = 0; i < areas.length; ++i ) {
            var area = areas[i];
            if (area.sets.length == 1) { // Only consider individual sets for MDS.
                setids[area.sets[0]] = sets.length; // Map set ID to its index in the 'sets' array.
                sets.push(area); // Store the single-set area object.
            }
        }

        // Get the distance matrix between all individual sets.
        var distances = venn.getDistanceMatrix(areas, sets, setids);
        // Apply classic MDS to get 2D positions from the distance matrix.
        var positions = mds.classic(distances);

        // Translate the 2D positions back to (x, y, radius) coordinates for circles.
        var circles = {};
        for (i = 0; i < sets.length; ++i) {
            var set = sets[i];
            circles[set.sets[0]] = {
                x      : positions[i][0], // X coordinate from MDS.
                y      : positions[i][1], // Y coordinate from MDS.
                radius : Math.sqrt(set.size / Math.PI) // Radius derived from set size.
            };
        }
        return circles; // Return circles with MDS-derived positions.
    };

    /**
     * Given a collection of sets (circles with x, y, radius) and desired overlaps,
     * this function computes the squared difference (loss) between the actual overlaps
     * and the desired overlaps. This is the objective function for optimization.
     * Note: This method currently ignores overlaps of more than 2 circles in direct calculation for loss.
     * @param {Object} sets - An object mapping set IDs to their circle properties.
     * @param {Array} overlaps - Array of objects describing desired overlaps.
     * @returns {number} The total squared loss.
     */
    venn.lossFunction = function(sets, overlaps) {
        var output = 0; // Initialize total loss.

        function getCircles(indices) {
            // Helper to retrieve circle objects by their set IDs.
            return indices.map(function(i) { return sets[i]; });
        }

        for (var i = 0; i < overlaps.length; ++i) {
            var area = overlaps[i],
                overlap_actual; // Actual overlap area calculated from current circle positions.

            if (area.sets.length == 1) {
                continue; // Single sets don't contribute to overlap loss in this context.
            } else if (area.sets.length == 2) {
                var left  = sets[area.sets[0]],
                    right = sets[area.sets[1]];
                // Calculate overlap for two circles.
                overlap_actual = venn.circleOverlap(left.radius, right.radius,
                                                    venn.distance(left, right));
            } else {
                // For overlaps of 3+ sets, use the general intersectionArea function.
                // Note: The comment in the original code says "ignores overlaps of more than 2 circles".
                // This means the `venn.intersectionArea` call here might be for visualization,
                // and not directly used to optimize the layout of 3+ way overlaps in the same way as 2-way.
                overlap_actual = venn.intersectionArea(getCircles(area.sets));
            }

            var weight = area.hasOwnProperty('weight') ? area.weight : 1.0; // Weight of this overlap in the loss.
            // Add squared difference between actual and desired overlap to total loss.
            output += weight * (overlap_actual - area.size) * (overlap_actual - area.size);
        }

        return output; // Return the accumulated loss.
    };

    /**
     * Scales a solution (set of circle positions) from `venn.venn` or `venn.greedyLayout`
     * such that it fits within a specified width/height, with padding.
     * It also centers the diagram within the available space.
     * @param {Object} solution - An object mapping set IDs to their circle properties (x, y, radius).
     * @param {number} width - Target width for the scaled diagram.
     * @param {number} height - Target height for the scaled diagram.
     * @param {number} padding - Padding to apply around the diagram.
     * @returns {Object} An object mapping set IDs to their scaled circle properties.
     */
    venn.scaleSolution = function(solution, width, height, padding) {
        var circles = [],
            setids = [];

        // Convert the solution object into an array of circle objects and a list of set IDs.
        for (var setid in solution) {
            if (solution.hasOwnProperty(setid)) {
                setids.push(setid);
                circles.push(solution[setid]);
            }
        }

        // Helper function to find the min and max extent of circles along an axis.
        var minMax = function(d) {
            var hi = Math.max.apply(null, circles.map(
                                    function(c) { return c[d] + c.radius; } )), // Max extent includes radius.
                lo = Math.min.apply(null, circles.map(
                                    function(c) { return c[d] - c.radius;} )); // Min extent includes radius.
            return {max:hi, min:lo};
        };

        // Adjust available width/height for padding.
        width -= 2*padding;
        height -= 2*padding;

        var xRange    = minMax('x'), // Min/max x-coordinates of the diagram.
            yRange    = minMax('y'), // Min/max y-coordinates of the diagram.
            xScaling  = width  / (xRange.max - xRange.min), // Scaling factor for x-axis.
            yScaling  = height / (yRange.max - yRange.min), // Scaling factor for y-axis.
            scaling   = Math.min(yScaling, xScaling),      // Use the smaller scaling to ensure fit.

            // Calculate offsets to center the diagram after scaling.
            xOffset   = (width  - (xRange.max - xRange.min) * scaling) / 2,
            yOffset   = (height - (yRange.max - yRange.min) * scaling) / 2;

        var scaled = {}; // Object to hold the scaled circle properties.
        for (var i = 0; i < circles.length; ++i) {
            var circle = circles[i];
            scaled[setids[i]] = {
                radius : scaling * circle.radius, // Scale radius.
                x      : padding + xOffset + (circle.x - xRange.min) * scaling, // Scale and offset x.
                y      : padding + yOffset + (circle.y - yRange.min) * scaling, // Scale and offset y.
            };
        }
        return scaled; // Return the scaled circle positions.
})(venn);