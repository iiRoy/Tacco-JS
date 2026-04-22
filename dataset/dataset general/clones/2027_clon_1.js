(function() {
    "use strict"; // Enforce strict mode for better code quality and error handling.


    // Define core variables from the global scope.
    var root = this,
        Chart = root.Chart, // Get the Chart object from the root context.
        helpers = Chart.helpers; // Access the Chart's utility helper functions.



    // Extend the base Chart type to create a new "Radar" chart type.
    Chart.Type.extend({
        name: "Radar", // The official name of this chart type.

        // Default options for the Radar chart. These can be overridden by user configurations.
        defaults: {
            // Boolean - Whether to show lines for each scale point.
            scaleShowLine: true,

            // Boolean - Whether we show the angle lines out of the radar.
            angleShowLineOut: true,

            // Boolean - Whether to show labels on the scale.
            scaleShowLabels: false,

            // Boolean - Whether the scale should begin at zero.
            scaleBeginAtZero: true,

            // String - Colour of the angle line.
            angleLineColor: "rgba(0,0,0,.1)",

            // Number - Pixel width of the angle line.
            angleLineWidth: 1,

            // String - Point label font declaration.
            pointLabelFontFamily: "'Arial'",

            // String - Point label font weight.
            pointLabelFontStyle: "normal",

            // Number - Point label font size in pixels.
            pointLabelFontSize: 10,

            // String - Point label font colour.
            pointLabelFontColor: "#666",

            // Boolean - Whether to show a dot for each point.
            pointDot: true,

            // Number - Radius of each point dot in pixels.
            pointDotRadius: 3,

            // Number - Pixel width of point dot stroke.
            pointDotStrokeWidth: 1,

            // Number - amount extra to add to the radius to cater for hit detection outside the drawn point.
            pointHitDetectionRadius: 20,

            // Boolean - Whether to show a stroke for datasets.
            datasetStroke: true,

            // Number - Pixel width of dataset stroke.
            datasetStrokeWidth: 2,

            // Boolean - Whether to fill the dataset with a colour.
            datasetFill: true,

            // String - A legend template for the chart.
            legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

        }, // End of the 'defaults' configuration object.


        // Initialization method for the Radar chart instance.
        initialize: function(data) {
            // Create a custom PointClass based on Chart.Point, incorporating specific chart options.
            this.PointClass = Chart.Point.extend({
                strokeWidth: this.options.pointDotStrokeWidth,
                radius: this.options.pointDotRadius,
                display: this.options.pointDot,
                hitDetectionRadius: this.options.pointHitDetectionRadius,
                ctx: this.chart.ctx
            });


            this.datasets = []; // Initialize an empty array to hold dataset objects for this chart.


            this.buildScale(data); // Build the radial scale for the chart based on the provided data.


            // Set up tooltip events on the chart if the 'showTooltips' option is enabled.
            if (this.options.showTooltips) {
                helpers.bindEvents(this, this.options.tooltipEvents, function(evt) {
                    var activePointsCollection = (evt.type !== 'mouseout') ? this.getPointsAtEvent(evt) : [];

                    // Restore all points to their original state before highlighting new ones.
                    this.eachPoints(function(point) {
                        point.restore(['fillColor', 'strokeColor']);
                    });

                    // Highlight active points based on the event.
                    helpers.each(activePointsCollection, function(activePoint) {
                        activePoint.fillColor = activePoint.highlightFill;
                        activePoint.strokeColor = activePoint.highlightStroke;
                    });

                    this.showTooltip(activePointsCollection); // Display the tooltip for the active points.
                });
            }


            // Iterate through each of the datasets provided in the initial data and build chart properties.
            helpers.each(data.datasets, function(dataset) {

                // Create a dataset object with specific properties derived from the input dataset.
                var datasetObject = {
                    label: dataset.label || null,
                    fillColor: dataset.fillColor,
                    strokeColor: dataset.strokeColor,
                    pointColor: dataset.pointColor,
                    pointStrokeColor: dataset.pointStrokeColor,
                    points: [] // An array to hold individual point instances for this dataset.
                };

                this.datasets.push(datasetObject); // Add the newly created dataset object to the chart's datasets array.

                helpers.each(dataset.data, function(dataPoint, index) {
                    // Best way to do this? or in draw sequence...? This comment is from original, keeping it.
                    // Only process if the data point is a valid number.
                    if (helpers.isNumber(dataPoint)) {
                        // Add a new point for each piece of data, passing any required data to draw.
                        var pointPosition;
                        // If animation is disabled, calculate the immediate point position.
                        if (!this.scale.animation) {
                            pointPosition = this.scale.getPointPosition(index, this.scale.calculateCenterOffset(dataPoint));
                        }

                        // Push a new PointClass instance into the dataset's points array.
                        datasetObject.points.push(new this.PointClass({
                            value: dataPoint,
                            label: data.labels[index],
                            datasetLabel: dataset.label,
                            x: (this.options.animation) ? this.scale.xCenter : pointPosition.x, // Initial X position for animation.
                            y: (this.options.animation) ? this.scale.yCenter : pointPosition.y, // Initial Y position for animation.
                            strokeColor: dataset.pointStrokeColor,
                            fillColor: dataset.pointColor,
                            highlightFill: dataset.pointHighlightFill || dataset.pointColor,
                            highlightStroke: dataset.pointHighlightStroke || dataset.pointStrokeColor
                        }));
                    }
                }, this); // Ensure 'this' context is preserved for the inner callback.

            }, this); // Ensure 'this' context is preserved for the outer callback.


            this.render(); // Render the chart after all initialization is complete.
        }, // End of the 'initialize' method.


        // Helper method to iterate over all points across all datasets.
        eachPoints: function(callback) {
            helpers.each(this.datasets, function(dataset) {
                helpers.each(dataset.points, callback, this); // Iterate over points within each dataset.
            }, this);
        }, // End of the 'eachPoints' method.


        // Gets a collection of points that are "active" at a given event (e.g., mouse click or hover).
        getPointsAtEvent: function(evt) {
            var mousePosition = helpers.getRelativePosition(evt), // Get mouse coordinates relative to the chart canvas.
                fromCenter = helpers.getAngleFromPoint({
                    x: this.scale.xCenter,
                    y: this.scale.yCenter
                }, mousePosition); // Calculate angle and distance from the chart's center.

            var anglePerIndex = (Math.PI * 2) / this.scale.valuesCount, // Calculate the angle covered by each point on the radar.
                pointIndex = Math.round((fromCenter.angle - Math.PI * 1.5) / anglePerIndex), // Determine which point index was hit.
                activePointsCollection = []; // Initialize an array to store points found at the event.

            // If we're at the top, make the pointIndex 0 to get the first of the array.
            // Adjust pointIndex if it falls out of the valid range.
            if (pointIndex >= this.scale.valuesCount || pointIndex < 0) {
                pointIndex = 0;
            }

            // Check if the mouse click/hover is within the drawing area of the scale.
            if (fromCenter.distance <= this.scale.drawingArea) {
                helpers.each(this.datasets, function(dataset) {
                    activePointsCollection.push(dataset.points[pointIndex]); // Add the corresponding point from each dataset.
                });
            }

            return activePointsCollection; // Return the collection of active points.
        }, // End of the 'getPointsAtEvent' method.


        // Builds the radial scale for the chart.
        buildScale: function(data) {
            this.scale = new Chart.RadialScale({
                display: this.options.showScale,
                fontStyle: this.options.scaleFontStyle,
                fontSize: this.options.scaleFontSize,
                fontFamily: this.options.scaleFontFamily,
                fontColor: this.options.scaleFontColor,
                showLabels: this.options.scaleShowLabels,
                showLabelBackdrop: this.options.scaleShowLabelBackdrop,
                backdropColor: this.options.scaleBackdropColor,
                backdropPaddingY: this.options.scaleBackdropPaddingY,
                backdropPaddingX: this.options.scaleBackdropPaddingX,
                lineWidth: (this.options.scaleShowLine) ? this.options.scaleLineWidth : 0,
                lineColor: this.options.scaleLineColor,
                angleLineColor: this.options.angleLineColor,
                angleLineWidth: (this.options.angleShowLineOut) ? this.options.angleLineWidth : 0,
                // Point labels at the edge of each line.
                pointLabelFontColor: this.options.pointLabelFontColor,
                pointLabelFontSize: this.options.pointLabelFontSize,
                pointLabelFontFamily: this.options.pointLabelFontFamily,
                pointLabelFontStyle: this.options.pointLabelFontStyle,
                height: this.chart.height,
                width: this.chart.width,
                xCenter: this.chart.width / 2,
                yCenter: this.chart.height / 2,
                ctx: this.chart.ctx,
                templateString: this.options.scaleLabel,
                labels: data.labels,
                valuesCount: data.datasets[0].data.length // Number of points on the radar.
            });

            this.scale.setScaleSize(); // Calculate the appropriate dimensions for the scale.
            this.updateScaleRange(data.datasets); // Determine the range of the scale based on the data.
            this.scale.buildYLabels(); // Generate the Y-axis labels for the scale.
        }, // End of the 'buildScale' method.


        // Updates the range of the chart scale based on the current datasets.
        updateScaleRange: function(datasets) {
            var valuesArray = (function() { // Immediately Invoked Function Expression (IIFE) to collect all data values.
                var totalDataArray = [];
                helpers.each(datasets, function(dataset) {
                    if (dataset.data) {
                        totalDataArray = totalDataArray.concat(dataset.data);
                    } else {
                        helpers.each(dataset.points, function(point) {
                            totalDataArray.push(point.value);
                        });
                    }
                });
                return totalDataArray;
            })();


            var scaleSizes = (this.options.scaleOverride) ?
                { // If scale override is enabled, use provided steps and values.
                    steps: this.options.scaleSteps,
                    stepValue: this.options.scaleStepWidth,
                    min: this.options.scaleStartValue,
                    max: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
                } :
                helpers.calculateScaleRange( // Otherwise, calculate the range automatically.
                    valuesArray,
                    helpers.min([this.chart.width, this.chart.height]) / 2, // Max size for scale.
                    this.options.scaleFontSize,
                    this.options.scaleBeginAtZero,
                    this.options.scaleIntegersOnly
                );

            helpers.extend( // Extend the scale object with the calculated or overridden sizes.
                this.scale,
                scaleSizes
            );

        }, // End of the 'updateScaleRange' method.


        // Adds new data to the chart.
        addData: function(valuesArray, label) {
            // Map the values array for each of the datasets.
            this.scale.valuesCount++; // Increment the count of values on the scale.

            helpers.each(valuesArray, function(value, datasetIndex) {
                if (helpers.isNumber(value)) {
                    var pointPosition = this.scale.getPointPosition(this.scale.valuesCount, this.scale.calculateCenterOffset(value));
                    this.datasets[datasetIndex].points.push(new this.PointClass({
                        value: value,
                        label: label,
                        x: pointPosition.x,
                        y: pointPosition.y,
                        strokeColor: this.datasets[datasetIndex].pointStrokeColor,
                        fillColor: this.datasets[datasetIndex].pointColor
                    }));
                }
            }, this);

            this.scale.labels.push(label); // Add the new label to the scale.

            this.reflow(); // Recalculate layout and positions.

            this.update(); // Update and redraw the chart.
        }, // End of the 'addData' method.


        // Removes data from the chart.
        removeData: function() {
            this.scale.valuesCount--; // Decrement the count of values on the scale.
            this.scale.labels.shift(); // Remove the first label from the scale.

            helpers.each(this.datasets, function(dataset) {
                dataset.points.shift(); // Remove the first point from each dataset.
            }, this);

            this.reflow(); // Recalculate layout.
            this.update(); // Update and redraw.
        }, // End of the 'removeData' method.


        // Updates the chart by saving point states, reflowing, and re-rendering.
        update: function() {
            this.eachPoints(function(point) {
                point.save(); // Save the current state of each point.
            });

            this.reflow(); // Recalculate layout.
            this.render(); // Render the chart again.
        }, // End of the 'update' method.


        // Reflows the chart layout, recalculating sizes and positions based on current dimensions.
        reflow: function() {
            helpers.extend(this.scale, {
                width: this.chart.width,
                height: this.chart.height,
                size: helpers.min([this.chart.width, this.chart.height]),
                xCenter: this.chart.width / 2,
                yCenter: this.chart.height / 2
            });

            this.updateScaleRange(this.datasets); // Update the scale's range based on current data.
            this.scale.setScaleSize(); // Recalculate the scale dimensions.
            this.scale.buildYLabels(); // Rebuild the Y-axis labels.
        }, // End of the 'reflow' method.


        // Draws the chart on the canvas.
        draw: function(ease) {
            var easeDecimal = ease || 1, // Ease value for animations, defaults to 1 (no easing).
                ctx = this.chart.ctx; // Get the 2D rendering context for the chart canvas.

            this.clear(); // Clear the entire canvas before drawing.
            this.scale.draw(); // Draw the radial scale background and labels.

            helpers.each(this.datasets, function(dataset) {

                // Transition each point first so that the line and point drawing isn't out of sync.
                helpers.each(dataset.points, function(point, index) {
                    point.transition(this.scale.getPointPosition(index, this.scale.calculateCenterOffset(point.value)), easeDecimal);
                }, this);


                // Draw the line connecting all the points in the dataset.
                ctx.lineWidth = this.options.datasetStrokeWidth; // Set line width from options.
                ctx.strokeStyle = dataset.strokeColor; // Set stroke color from dataset.
                ctx.beginPath(); // Start a new path for the line.

                helpers.each(dataset.points, function(point, index) {
                    if (index === 0) {
                        ctx.moveTo(point.x, point.y); // Move to the first point without drawing a line.
                    } else {
                        ctx.lineTo(point.x, point.y); // Draw a line to subsequent points.
                    }
                }, this);

                ctx.closePath(); // Close the path to form a polygon.
                ctx.stroke(); // Draw the stroke of the path.

                ctx.fillStyle = dataset.fillColor; // Set fill color from dataset.
                ctx.fill(); // Fill the path with the specified color.

                // Now draw the points over the line.
                // A little inefficient double looping, but better than the line
                // lagging behind the point positions.
                helpers.each(dataset.points, function(point) {
                    point.draw(); // Draw each individual point.
                });

            }, this); // Ensure 'this' context for dataset iteration.

        } // End of the 'draw' method.

    }); // End of Chart.Type.extend call.


}).call(this); // Execute the anonymous function, binding 'this' to the global context (e.g., window in browsers).