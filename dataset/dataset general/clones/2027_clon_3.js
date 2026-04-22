(function(){
	"use strict";

	var globalScope = this,
		GraphEngine = globalScope.GraphEngine || globalScope.Chart, // Use Chart as fallback
		utilityFns = GraphEngine.utility || GraphEngine.helpers; // Use helpers as fallback


	// Define a new graph type by extending the base GraphEngine type.
	GraphEngine.Type.extend({
		displayIdentifier: "PolarGraph", // Renamed from "Radar"
		configPresets:{ // Renamed from "defaults"
			// Flag - Should the grid lines emanate from the center?
			drawGridLines : true,

			// Flag - Should the radial spokes extending from the center be visible?
			drawRadialSpokes : true,

			// Flag - Should labels be displayed along the grid axes?
			displayAxisLabels : false,

			// Flag - Should the axis always start its value at zero?
			startFromOrigin : true,

			// String - Paint color for the radial spokes
			spokeColor : "rgba(0,0,0,0.15)", // Slightly updated color alpha

			// Numeric - Thickness in pixels for the radial spokes
			spokeWidth : 1,

			// String - Font family for data point labels
			dataPointLabelFont : "'Helvetica Neue', 'Arial', sans-serif", // Updated font
			
			// String - Font style for data point labels
			dataPointLabelStyle : "normal",

			// Numeric - Font size for data point labels in pixels
			dataPointLabelSize : 11, // Slightly updated size

			// String - Color for data point labels
			dataPointLabelColor : "#555", // Slightly updated color

			// Flag - Should individual data points be marked with a dot/shape?
			showDataMarkers : true,

			// Numeric - Radius of the marker dot for each data point
			dataMarkerRadius : 4, // Slightly updated radius

			// Numeric - Pixel width of the border around each marker dot
			dataMarkerBorderWidth : 1,

			// Numeric - Additional radius for mouse hit detection around data points
			hitDetectAreaRadius : 25, // Slightly updated radius

			// Flag - Should a stroke (line) be drawn for each data series?
			drawSeriesOutline : true,

			// Numeric - Pixel width of the stroke for each data series
			seriesOutlineWidth : 2,

			// Flag - Should the area beneath each data series line be filled with color?
			fillSeriesArea : true,

			// String - Template for rendering the graph legend
			legendMarkupPattern : "<ul class=\"<%=name.toLowerCase()%>-chart-legend\"><% for (var i=0; i<chartSeries.length; i++){%><li><span style=\"background-color:<%=chartSeries[i].outlinePaint%>\"></span><%if(chartSeries[i].seriesLabel){%><%=chartSeries[i].seriesLabel%><%}%></li><%}%></ul>", // Renamed variables in template

			// Custom added option: enable verbose logging for debugging
			enableVerboseLogging: false
		},

		/**
		 * Initializes the polar graph instance.
		 * @param {object} incomingGraphData - The data object for the graph.
		 */
		initGraph: function(incomingGraphData){ // Renamed from initialize
			const currentOptions = this.options; // Introduce helper variable

			// Guard clause: Ensure essential data is present
			if (!incomingGraphData || !incomingGraphData.series || incomingGraphData.series.length === 0) {
				if (currentOptions.enableVerboseLogging) {
					console.warn("PolarGraph: No valid series data provided for initialization. Graph might not render.");
				}
				this.chartSeries = []; // Ensure it's an array even if empty
				this.initCoordinateSystem(incomingGraphData); // Still try to build scale for labels
				this.drawVisuals();
				return;
			}

			// Define the prototype for individual data point markers
			this.DataMarkerPrototype = GraphEngine.Point.extend({ // Renamed from PointClass
				outlineThick : currentOptions.dataMarkerBorderWidth, // Renamed from strokeWidth
				shapeSize : currentOptions.dataMarkerRadius, // Renamed from radius
				isVisible: currentOptions.showDataMarkers, // Renamed from display
				hitRegion : currentOptions.hitDetectAreaRadius, // Renamed from hitDetectionRadius
				renderContext : this.chart.ctx // Renamed from ctx
			});

			this.chartSeries = []; // Renamed from datasets

			// Construct the radial coordinate system
			this.initCoordinateSystem(incomingGraphData); // Renamed from buildScale

			// Set up interaction events for tooltips, if enabled
			if (currentOptions.enableTooltips){ // Renamed from showTooltips
				utilityFns.bindEvents(this, currentOptions.tooltipInteractionEvents, (eventObject) => { // Renamed from tooltipEvents, changed to arrow function
					let hoveredMarkers = []; // Renamed from activePointsCollection

					// Determine if the event is a 'mouseout' to clear tooltips
					const isMouseOut = (eventObject.type === 'mouseout');
					if (!isMouseOut) {
						hoveredMarkers = this.getMarkersAtEvent(eventObject); // Renamed from getPointsAtEvent
					}

					// Restore original styles for all markers
					this.iterateMarkers(function(markerInstance){ // Renamed from eachPoints, point -> markerInstance
						markerInstance.revertStyles(['fillPaint', 'outlinePaint']); // Renamed from restore, fillColor, strokeColor
					});

					// Apply highlight styles to hovered markers
					utilityFns.each(hoveredMarkers, function(activeMarker){ // Renamed from activePoint
						activeMarker.fillPaint = activeMarker.hoverFillPaint; // Renamed from fillColor, highlightFill
						activeMarker.outlinePaint = activeMarker.hoverOutlinePaint; // Renamed from strokeColor, highlightStroke
					});

					this.displayTooltip(hoveredMarkers); // Renamed from showTooltip
				});
			}

			// Process each data series and create marker instances
			utilityFns.each(incomingGraphData.series, (currentSeries) => { // Renamed from dataset
				if (!currentSeries.data || currentSeries.data.length === 0) {
					if (currentOptions.enableVerboseLogging) {
						console.warn(`PolarGraph: Series "${currentSeries.seriesLabel || 'Unnamed'}" has no data, skipping.`);
					}
					return; // Skip series without data
				}

				const seriesConfig = { // Renamed from datasetObject
					seriesLabel: currentSeries.seriesLabel || null, // Renamed from label
					fillPaint : currentSeries.fillPaint, // Renamed from fillColor
					outlinePaint : currentSeries.outlinePaint, // Renamed from strokeColor
					markerFillPaint : currentSeries.markerFillPaint, // Renamed from pointColor
					markerOutlinePaint : currentSeries.markerOutlinePaint, // Renamed from pointStrokeColor
					dataMarkers : [] // Renamed from points
				};

				this.chartSeries.push(seriesConfig);

				utilityFns.each(currentSeries.data, (datumValue, datumIndex) => { // Renamed from dataPoint, index
					// Only process numeric data values
					if (utilityFns.isNumeric(datumValue)){ // Renamed from isNumber
						let markerCoord; // Renamed from pointPosition

						// Calculate initial marker position, considering animation state
						if (currentOptions.animateDrawing){ // Renamed from animation
							markerCoord = { coordX: this.radialAxis.centerX, coordY: this.radialAxis.centerY }; // Center for animation start
						} else {
							markerCoord = this.radialAxis.retrievePointCoord(datumIndex, this.radialAxis.computeCenterOffset(datumValue)); // Renamed from getPointPosition, calculateCenterOffset
						}

						// Create a new marker instance and add to the series
						seriesConfig.dataMarkers.push(new this.DataMarkerPrototype({
							metricValue : datumValue, // Renamed from value
							categoryLabel : incomingGraphData.categories[datumIndex], // Renamed from label, data.labels
							seriesIdentifier: currentSeries.seriesLabel, // Renamed from datasetLabel
							coordX: markerCoord.coordX, // Renamed from x
							coordY: markerCoord.coordY, // Renamed from y
							outlinePaint : currentSeries.markerOutlinePaint, // Renamed from pointStrokeColor
							fillPaint : currentSeries.markerFillPaint, // Renamed from pointColor
							hoverFill : currentSeries.pointHighlightFill || currentSeries.markerFillPaint, // Renamed from highlightFill, pointColor
							hoverOutline : currentSeries.pointHighlightStroke || currentSeries.markerOutlinePaint // Renamed from highlightStroke, pointStrokeColor
						}));
					} else {
						if (currentOptions.enableVerboseLogging) {
							console.warn(`PolarGraph: Non-numeric data point found at index ${datumIndex} in series "${currentSeries.seriesLabel || 'Unnamed'}". Skipping.`);
						}
					}
				}, this); // Pass 'this' context for inner loop

			}, this); // Pass 'this' context for outer loop

			this.drawVisuals(); // Renamed from render
		},

		/**
		 * Iterates over all data markers in all series and executes a callback.
		 * @param {function} callback - The function to execute for each marker.
		 */
		iterateMarkers : function(callback){ // Renamed from eachPoints
			utilityFns.each(this.chartSeries, function(series){ // Renamed from datasets
				utilityFns.each(series.dataMarkers, callback, this); // Renamed from points
			},this);
		},

		/**
		 * Determines which data markers are under the mouse cursor at a given event.
		 * @param {object} eventObject - The mouse event object.
		 * @returns {Array<object>} An array of marker objects under the cursor.
		 */
		getMarkersAtEvent : function(eventObject){ // Renamed from getPointsAtEvent
			if (!this.radialAxis) { // Guard for axis not being initialized
				if (this.options.enableVerboseLogging) {
					console.warn("PolarGraph: Radial axis not initialized, cannot detect markers at event.");
				}
				return [];
			}

			const cursorLocation = utilityFns.fetchRelativeCoords(eventObject); // Renamed from mousePosition, getRelativePosition
			const graphCenter = {
				coordX: this.radialAxis.centerX, // Renamed from xCenter
				coordY: this.radialAxis.centerY // Renamed from yCenter
			};
			const polarCoordinates = utilityFns.calcAngleFromPoint(graphCenter, cursorLocation); // Renamed from fromCenter, getAngleFromPoint

			const segmentAngle = (Math.PI * 2) / this.radialAxis.valueSegments; // Renamed from anglePerIndex, valuesCount

			// Calculate the index of the segment the mouse is in.
			// Adjust angle to start from top (12 o'clock) for 0 index.
			let markerSegmentIdx = Math.round((polarCoordinates.angle - (Math.PI * 1.5)) / segmentAngle); // Renamed from pointIndex

			// Ensure the index wraps correctly around the circle.
			if (markerSegmentIdx < 0) {
				markerSegmentIdx += this.radialAxis.valueSegments; // Correct negative indices
			}
			if (markerSegmentIdx >= this.radialAxis.valueSegments) {
				markerSegmentIdx %= this.radialAxis.valueSegments; // Wrap around if over max
			}

			const selectedMarkers = []; // Renamed from activePointsCollection

			// Check if the cursor is within the drawing area of the graph
			if (polarCoordinates.distance <= this.radialAxis.plotAreaRadius){ // Renamed from drawingArea
				utilityFns.each(this.chartSeries, function(series){ // Renamed from dataset
					// Add the marker corresponding to the detected segment index
					if (series.dataMarkers[markerSegmentIdx]) {
						selectedMarkers.push(series.dataMarkers[markerSegmentIdx]);
					} else {
						if (this.options.enableVerboseLogging) {
							console.log(`PolarGraph: No marker found at segment ${markerSegmentIdx} for series "${series.seriesLabel || 'Unnamed'}".`);
						}
					}
				}, this);
			}

			return selectedMarkers;
		},

		/**
		 * Constructs and configures the radial coordinate system (scale).
		 * @param {object} sourceData - The raw data used to build the scale.
		 */
		initCoordinateSystem : function(sourceData){ // Renamed from buildScale
			const options = this.options; // Helper variable
			const chartArea = this.chart;

			this.radialAxis = new GraphEngine.PolarGrid({ // Renamed from scale, Chart.RadialScale
				visible: options.showScale, // Renamed from display
				labelStyle: options.scaleFontStyle, // Renamed from fontStyle
				labelSize: options.scaleFontSize, // Renamed from fontSize
				labelFamily: options.scaleFontFamily, // Renamed from fontFamily
				labelColor: options.scaleFontColor, // Renamed from fontColor
				displayLabels: options.scaleShowLabels, // Renamed from showLabels
				showLabelBackground: options.scaleShowLabelBackdrop, // Renamed from showLabelBackdrop
				backgroundColor: options.scaleBackdropColor, // Renamed from backdropColor
				backgroundPadY : options.scaleBackdropPaddingY, // Renamed from backdropPaddingY
				backgroundPadX: options.scaleBackdropPaddingX, // Renamed from backdropPaddingX
				lineThickness: (options.drawGridLines) ? options.scaleLineWidth : 0, // Renamed from lineWidth, scaleShowLine
				linePaint: options.scaleLineColor, // Renamed from lineColor
				radialLinePaint : options.spokeColor, // Renamed from angleLineColor
				radialLineThickness : (options.drawRadialSpokes) ? options.spokeWidth : 0, // Renamed from angleLineWidth, angleShowLineOut
				
				// Configuration for point labels along the circumference
				dataLabelPaint : options.dataPointLabelColor, // Renamed from pointLabelFontColor
				dataLabelSize : options.dataPointLabelSize, // Renamed from pointLabelFontSize
				dataLabelFamily : options.dataPointLabelFont, // Renamed from pointLabelFontFamily
				dataLabelStyle : options.dataPointLabelStyle, // Renamed from pointLabelFontStyle
				
				canvasHeight : chartArea.height, // Renamed from height
				canvasWidth: chartArea.width, // Renamed from width
				centerX: chartArea.width / 2, // Renamed from xCenter
				centerY: chartArea.height / 2, // Renamed from yCenter
				renderContext : chartArea.ctx, // Renamed from ctx
				labelFormatString: options.scaleLabel, // Renamed from templateString
				categories: sourceData.categories, // Renamed from labels, data.labels
				valueSegments: (sourceData.series && sourceData.series.length > 0) ? sourceData.series[0].data.length : 0 // Renamed from valuesCount, data.datasets[0].data.length
			});

			this.radialAxis.adjustGridSize(); // Renamed from setScaleSize
			this.recalculateAxisRange(sourceData.series); // Renamed from updateScaleRange, data.datasets
			this.radialAxis.generateYAxisLabels(); // Renamed from buildYLabels
		},

		/**
		 * Recalculates the value range for the radial axis based on current data.
		 * @param {Array<object>} currentSeriesCollection - The collection of data series.
		 */
		recalculateAxisRange: function(currentSeriesCollection){ // Renamed from updateScaleRange, datasets
			let combinedMetrics = []; // Renamed from totalDataArray

			// Aggregate all numeric data values from all series
			utilityFns.each(currentSeriesCollection, function(seriesItem){ // Renamed from dataset
				if (seriesItem && seriesItem.data){ // Check for existence of data array
					combinedMetrics = combinedMetrics.concat(seriesItem.data);
				} else if (seriesItem && seriesItem.dataMarkers) { // Fallback if already processed into markers
					utilityFns.each(seriesItem.dataMarkers, function(marker){ // Renamed from point
						combinedMetrics.push(marker.metricValue); // Renamed from value
					});
				}
			});

			if (combinedMetrics.length === 0) { // Guard clause for no data
				if (this.options.enableVerboseLogging) {
					console.warn("PolarGraph: No metrics found to calculate axis range. Defaulting to empty range.");
				}
				// Set a default minimal range if no data
				utilityFns.assignProps(this.radialAxis, {
					steps: 1, stepIncrement: 10, startingValue: 0, max: 10
				});
				return;
			}

			let calculatedRange = {}; // Renamed from scaleSizes
			const currentOptions = this.options; // Helper variable

			if (currentOptions.customScaleSettings) { // Renamed from scaleOverride
				calculatedRange = {
					steps: currentOptions.numSteps, // Renamed from scaleSteps
					stepIncrement: currentOptions.stepIncrement, // Renamed from scaleStepWidth
					startingValue: currentOptions.startingValue, // Renamed from scaleStartValue
					max: currentOptions.startingValue + (currentOptions.numSteps * currentOptions.stepIncrement)
				};
			} else {
				// Determine dynamic scale range based on data and chart dimensions
				const availableDimension = utilityFns.findMin([this.chart.width, this.chart.height]) / 2; // Renamed from min
				calculatedRange = utilityFns.determineScalingRange( // Renamed from calculateScaleRange
					combinedMetrics,
					availableDimension,
					currentOptions.axisLabelSize, // Renamed from scaleFontSize
					currentOptions.startAtZero, // Renamed from scaleBeginAtZero
					currentOptions.integerStepsOnly // Renamed from scaleIntegersOnly
				);
			}

			utilityFns.assignProps( // Renamed from extend
				this.radialAxis,
				calculatedRange
			);
		},

		/**
		 * Adds a new data entry (a set of values for each series) to the graph.
		 * @param {Array<number>} newMetricValues - An array of values, one for each series.
		 * @param {string} categoryLabel - The label for the new category.
		 */
		addEntry : function(newMetricValues, categoryLabel){ // Renamed from addData, valuesArray, label
			if (!Array.isArray(newMetricValues)) { // Guard clause
				if (this.options.enableVerboseLogging) {
					console.error("PolarGraph: addEntry expects an array of values.");
				}
				return;
			}

			this.radialAxis.valueSegments++; // Renamed from valuesCount
			utilityFns.each(newMetricValues, function(valueToAdd, seriesIdx){ // Renamed from value, datasetIndex
					if (utilityFns.isNumeric(valueToAdd)){ // Renamed from isNumber
						const pointCoord = this.radialAxis.retrievePointCoord(this.radialAxis.valueSegments, this.radialAxis.computeCenterOffset(valueToAdd)); // Renamed from pointPosition
						const targetSeries = this.chartSeries[seriesIdx];
						if (targetSeries) {
							targetSeries.dataMarkers.push(new this.DataMarkerPrototype({
								metricValue : valueToAdd, // Renamed from value
								categoryLabel : categoryLabel, // Renamed from label
								coordX: pointCoord.coordX, // Renamed from x
								coordY: pointCoord.coordY, // Renamed from y
								outlinePaint : targetSeries.markerOutlinePaint, // Renamed from strokeColor
								fillPaint : targetSeries.markerFillPaint // Renamed from fillColor
							}));
						} else {
							if (this.options.enableVerboseLogging) {
								console.warn(`PolarGraph: No series found at index ${seriesIdx} for new data point.`);
							}
						}
					}
			},this);

			this.radialAxis.categories.push(categoryLabel); // Renamed from labels

			this.repositionElements(); // Renamed from reflow

			this.refreshGraph(); // Renamed from update
		},

		/**
		 * Removes the oldest data entry (first category) from the graph.
		 */
		deleteEntry : function(){ // Renamed from removeData
			if (this.radialAxis.valueSegments <= 0) { // Guard for empty graph
				if (this.options.enableVerboseLogging) {
					console.warn("PolarGraph: No data entries to remove.");
				}
				return;
			}

			this.radialAxis.valueSegments--;
			this.radialAxis.categories.removeFirst(); // Renamed from labels.shift()
			utilityFns.each(this.chartSeries,function(series){ // Renamed from dataset
				if (series.dataMarkers.length > 0) {
					series.dataMarkers.removeFirst(); // Renamed from points.shift()
				}
			},this);
			this.repositionElements(); // Renamed from reflow
			this.refreshGraph(); // Renamed from update
		},

		/**
		 * Refreshes the graph, saving current marker states and redrawing.
		 */
		refreshGraph : function(){ // Renamed from update
			this.iterateMarkers(function(marker){ // Renamed from eachPoints, point
				marker.storeState(); // Renamed from save
			});
			this.repositionElements(); // Renamed from reflow
			this.drawVisuals(); // Renamed from render
		},

		/**
		 * Recalculates positions and sizes of graph elements based on current chart dimensions.
		 */
		repositionElements: function(){ // Renamed from reflow
			const chartDimensions = this.chart; // Helper variable
			utilityFns.assignProps(this.radialAxis, { // Renamed from extend, scale
				canvasWidth : chartDimensions.width, // Renamed from width
				canvasHeight: chartDimensions.height, // Renamed from height
				renderDimension : utilityFns.findMin([chartDimensions.width, chartDimensions.height]), // Renamed from size
				centerX: chartDimensions.width/2, // Renamed from xCenter
				centerY: chartDimensions.height/2 // Renamed from yCenter
			});
			this.recalculateAxisRange(this.chartSeries); // Renamed from updateScaleRange, datasets
			this.radialAxis.adjustGridSize(); // Renamed from setScaleSize
			this.radialAxis.generateYAxisLabels(); // Renamed from buildYLabels
		},

		/**
		 * Renders the graph on the canvas.
		 * @param {number} [animationProgress=1] - A factor indicating animation progress (0 to 1).
		 */
		renderFrame : function(animationProgress){ // Renamed from draw, ease
			const interpolationFactor = animationProgress || 1; // Renamed from easeDecimal
			const drawingContext = this.chart.ctx; // Renamed from ctx

			this.clearCanvas(); // Renamed from clear
			this.radialAxis.draw(); // Renamed from scale.draw()

			if (!this.chartSeries || this.chartSeries.length === 0) { // Guard clause
				if (this.options.enableVerboseLogging) {
					console.log("PolarGraph: No series to draw.");
				}
				return;
			}

			utilityFns.each(this.chartSeries, function(seriesItem){ // Renamed from dataset

				// First, transition all markers to their current animated positions
				utilityFns.each(seriesItem.dataMarkers, function(markerInstance, markerIndex){ // Renamed from point, index
					const targetPosition = this.radialAxis.retrievePointCoord(markerIndex, this.radialAxis.computeCenterOffset(markerInstance.metricValue)); // Renamed from getPointPosition, calculateCenterOffset, point.value
					markerInstance.animatePosition(targetPosition, interpolationFactor); // Renamed from transition, easeDecimal
				},this);


				// Draw the connecting lines for the series
				drawingContext.lineWidth = this.options.seriesOutlineWidth; // Renamed from datasetStrokeWidth
				drawingContext.strokeStyle = seriesItem.outlinePaint; // Renamed from strokeColor
				drawingContext.startPath(); // Renamed from beginPath()

				// Iterate through markers to draw the series line
				if (seriesItem.dataMarkers.length > 0) {
					drawingContext.moveToPoint(seriesItem.dataMarkers[0].coordX, seriesItem.dataMarkers[0].coordY); // Renamed from moveTo, point.x, point.y
					for (let i = 1; i < seriesItem.dataMarkers.length; i++) {
						const currentMarker = seriesItem.dataMarkers[i];
						drawingContext.lineToPoint(currentMarker.coordX, currentMarker.coordY); // Renamed from lineTo
					}
				}
				drawingContext.closeShape(); // Renamed from closePath()
				drawingContext.strokePath(); // Renamed from stroke()

				// Fill the area for the series, if enabled
				drawingContext.fillPaintStyle = seriesItem.fillPaint; // Renamed from fillStyle
				drawingContext.fillShape(); // Renamed from fill()

				// Finally, draw the individual data markers on top of the lines
				utilityFns.each(seriesItem.dataMarkers, function(markerInstance){ // Renamed from point
					markerInstance.draw();
				});

			},this); // Pass 'this' context for outer loop
		}
	});

}).call(this);