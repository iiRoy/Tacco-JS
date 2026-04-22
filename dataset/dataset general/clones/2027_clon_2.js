(function(){
	"use strict"; var
	globalScope = this,
	Plotter = globalScope.Plotter,
	utilities = Plotter.utilities;

	Plotter.VisualizerType.augment({
		chartName: "SpiderPlot",
		presetOptions: {
			// A flag indicating if lines should be shown for each axis point
			axisDisplayLine : true,
			// A flag indicating if radial lines should extend from the center
			radialArmDisplay : true,
			// A flag indicating if labels should be visible on the axis
			axisLabelVisibility : false,
			// Determines if the axis should start its values at zero
			axisStartAtOrigin : true,
			// The color specification for the radial arms
			radialArmHue : "rgba(0,0,0,0.15)",
			// The pixel thickness of the radial arms
			radialArmThickness : 2,
			// The font family specification for data point labels
			markerTextFont : "'Verdana'",
			// The font style specification for data point labels
			markerTextStyle : "regular",
			// The font size in pixels for data point labels
			markerTextSize : 12,
			// The color specification for data point labels
			markerTextTint : "#999",
			// A flag indicating whether a dot should be shown for each data point
			dataPointMarker : true,
			// The pixel radius of each data point dot
			dataPointMarkerRadius : 4,
			// The pixel width of the border around each data point dot
			dataPointMarkerBorderWidth : 1,
			// Additional radius in pixels to consider for hit detection around data points
			dataPointHitAreaRadius : 25,
			// A flag indicating if data series should have an outline
			dataSeriesOutline : true,
			// The pixel width of the data series outline
			dataSeriesOutlineWidth : 3,
			// A flag indicating if the area under the data series should be filled with color
			dataSeriesAreaFill : true,
			// A string template used for generating the chart's legend
			keyFormatString : "<ul class=\"<%=chartName.toLowerCase()%>-legend-items\"><% for (var idx=0; idx<dataSeriesCollection.length; idx++){%><li><span style=\"background-color:<%=dataSeriesCollection[idx].borderHue%>\"></span><%if(dataSeriesCollection[idx].descriptor){%><%=dataSeriesCollection[idx].descriptor%><%}%></li><%}%></ul>"
		},
		setupChart: function(inputData) {
			this.DataMarkerType = Plotter.PointElement.augment({
				borderThickness : this.options.dataPointMarkerBorderWidth,
				sphereRadius : this.options.dataPointMarkerRadius,
				visibility: this.options.dataPointMarker,
				touchDetectionRadius : this.options.dataPointHitAreaRadius,
				drawingContext : this.chart.drawingContext
			});
			this.dataSeriesCollection = [];

			this.constructGrid(inputData);

			// Configuration for handling tooltip interactions on the chart surface
			if (this.options.displayTooltips) {
				utilities.attachHandlers(this, this.options.tipInteractionEvents, function(interactionEvent) {
					var engagedMarkersList = (interactionEvent.type !== 'mouseOut') ? this.locateMarkersAtInteraction(interactionEvent) : [];

					this.traverseMarkers(function(currentMarker) {
						currentMarker.revertStyle(['fillHue', 'borderHue']);
					});
					utilities.forEachElement(engagedMarkersList, function(activeMarker) {
						activeMarker.fillHue = activeMarker.emphasisFill;
						activeMarker.borderHue = activeMarker.emphasisBorder;
					});

					this.presentTooltip(engagedMarkersList);
				});
			}

			// Processing each data series provided and integrating it into the chart's properties
			utilities.forEachElement(inputData.series, function(seriesEntry) {
				var seriesRecord = {
					descriptor: seriesEntry.descriptor || null,
					fillHue : seriesEntry.fillHue,
					borderHue : seriesEntry.borderHue,
					markerHue : seriesEntry.markerHue,
					markerBorderHue : seriesEntry.markerBorderHue,
					markers : []
				};

				this.dataSeriesCollection.push(seriesRecord);

				utilities.forEachElement(seriesEntry.data, function(datumValue, position) {
					// Is this the optimal location for this logic, or better in drawing?
					if (utilities.isNumeric(datumValue)) {
					// Create a new marker for each data piece, supplying necessary drawing information.
						var markerPosition;
						if (!this.grid.transitionEffect) {
							markerPosition = this.grid.fetchMarkerCoordinates(position, this.grid.computeOriginOffset(datumValue));
						}
						seriesRecord.markers.push(new this.DataMarkerType({
							metric : datumValue,
							descriptor : inputData.categories[position],
							seriesDescriptor: seriesEntry.descriptor,
							hCoord: (this.options.transitionEffect) ? this.grid.hOrigin : markerPosition.hCoord,
							vCoord: (this.options.transitionEffect) ? this.grid.vOrigin : markerPosition.vCoord,
							borderHue : seriesEntry.markerBorderHue,
							fillHue : seriesEntry.markerHue,
							accentFill : seriesEntry.markerAccentFill || seriesEntry.markerHue,
							accentBorder : seriesEntry.markerAccentBorder || seriesEntry.markerBorderHue
						}));
					}
				}, this);
			}, this);

			this.drawGraph();
		},
		traverseMarkers : function(processCallback){
			utilities.forEachElement(this.dataSeriesCollection, function(seriesEntry){
				utilities.forEachElement(seriesEntry.markers, processCallback, this);
			}, this);
		},

		locateMarkersAtInteraction : function(interactionEvent){
			var cursorLocation = utilities.obtainRelativeLocation(interactionEvent),
				fromOrigin = utilities.calculateAngleFromPoint({
					hCoord: this.grid.hOrigin,
					vCoord: this.grid.vOrigin
				}, cursorLocation);

			var segmentAngle = (Math.PI * 2) / this.grid.dataCount,
				markerIndex = Number.round((fromOrigin.angle - Math.PI * 1.5) / segmentAngle),
				engagedMarkersList = [];

			// If at the very top, ensure the marker index is 0 for the first element.
			if (markerIndex >= this.grid.dataCount || markerIndex < 0){
				markerIndex = 0;
			}

			if (fromOrigin.separation <= this.grid.renderZone){
				utilities.forEachElement(this.dataSeriesCollection, function(seriesEntry){
					engagedMarkersList.push(seriesEntry.markers[markerIndex]);
				});
			}

			return engagedMarkersList;
		},

		constructGrid : function(inputData){
			this.grid = new Plotter.CircularGrid({
				showGrid: this.options.showScale,
				textStyle: this.options.scaleFontStyle,
				textSize: this.options.scaleFontSize,
				textFont: this.options.scaleFontFamily,
				textColor: this.options.scaleFontColor,
				displayLabels: this.options.scaleShowLabels,
				labelBackgroundVisible: this.options.scaleShowLabelBackdrop,
				backgroundColor: this.options.scaleBackdropColor,
				backgroundPadY : this.options.scaleBackdropPaddingY,
				backgroundPadX: this.options.scaleBackdropPaddingX,
				lineThickness: (this.options.axisDisplayLine) ? this.options.scaleLineWidth : 0,
				lineHue: this.options.scaleLineColor,
				radialLineHue : this.options.radialArmHue,
				radialLineThickness : (this.options.radialArmDisplay) ? this.options.radialArmThickness : 0,
				// Labels for points at the perimeter of each line
				markerLabelColor : this.options.markerTextTint,
				markerLabelSize : this.options.markerTextSize,
				markerLabelFont : this.options.markerTextFont,
				markerLabelStyle : this.options.markerTextStyle,
				canvasHeight : this.chart.canvasHeight,
				canvasWidth: this.chart.canvasWidth,
				hOrigin: this.chart.canvasWidth/2,
				vOrigin: this.chart.canvasHeight/2,
				drawingContext : this.chart.drawingContext,
				formatString: this.options.scaleLabel,
				categories: inputData.categories,
				dataCount: inputData.series[0].data.length
			});

			this.grid.adjustGridSize();
			this.refreshGridRange(inputData.series);
			this.grid.generateYLabels();
		},
		refreshGridRange: function(seriesCollection){
			var measurementValues = (function(){
				var combinedDataPoints = [];
				utilities.forEachElement(seriesCollection, function(seriesEntry){
					if (seriesEntry.data){
						combinedDataPoints = combinedDataPoints.concat(seriesEntry.data);
					}
					else {
						utilities.forEachElement(seriesEntry.markers, function(dataPoint){
							combinedDataPoints.push(dataPoint.metric);
						});
					}
				});
				return combinedDataPoints;
			})();


			var gridDimensions = (this.options.gridRangeOverride) ?
				{
					steps: this.options.gridSteps,
					stepValue: this.options.gridStepSize,
					min: this.options.gridStartValue,
					max: this.options.gridStartValue + (this.options.gridSteps * this.options.gridStepSize)
				} :
				utilities.determineGridRange(
					measurementValues,
					utilities.minimumValue([this.chart.canvasWidth, this.chart.canvasHeight])/2,
					this.options.scaleFontSize,
					this.options.axisStartAtOrigin,
					this.options.gridIntegerOnly
				);

			utilities.assignProperties(
				this.grid,
				gridDimensions
			);

		},
		appendDataPoint : function(newValues, descriptor){
			// Map the new values array to each existing data series
			this.grid.dataCount++;
			utilities.forEachElement(newValues, function(dataItem, seriesIndex){
					if (utilities.isNumeric(dataItem)){
						var markerPosition = this.grid.fetchMarkerCoordinates(this.grid.dataCount, this.grid.computeOriginOffset(dataItem));
						this.dataSeriesCollection[seriesIndex].markers.push(new this.DataMarkerType({
							metric : dataItem,
							descriptor : descriptor,
							hCoord: markerPosition.hCoord,
							vCoord: markerPosition.vCoord,
							borderHue : this.dataSeriesCollection[seriesIndex].markerBorderHue,
							fillHue : this.dataSeriesCollection[seriesIndex].markerHue
						}));
					}
			}, this);

			this.grid.categories.push(descriptor);

			this.recalculateLayout();

			this.refreshChart();
		},
		deleteDataPoint : function(){
			this.grid.dataCount--;
			this.grid.categories.removeFirst();
			utilities.forEachElement(this.dataSeriesCollection, function(seriesEntry){
				seriesEntry.markers.removeFirst();
			}, this);
			this.recalculateLayout();
			this.refreshChart();
		},
		refreshChart : function(){
			this.traverseMarkers(function(currentMarker){
				currentMarker.storeState();
			});
			this.recalculateLayout();
			this.drawGraph();
		},
		recalculateLayout: function(){
			utilities.assignProperties(this.grid, {
				canvasWidth : this.chart.canvasWidth,
				canvasHeight: this.chart.canvasHeight,
				size : utilities.minimumValue([this.chart.canvasWidth, this.chart.canvasHeight]),
				hOrigin: this.chart.canvasWidth/2,
				vOrigin: this.chart.canvasHeight/2
			});
			this.refreshGridRange(this.dataSeriesCollection);
			this.grid.adjustGridSize();
			this.grid.generateYLabels();
		},
		drawGraph : function(animationProgress){
			var progressFactor = animationProgress || 1,
				drawingContext = this.chart.drawingContext;
			this.eraseCanvas();
			this.grid.draw();

			utilities.forEachElement(this.dataSeriesCollection, function(seriesEntry){
				// Animate each data point first to keep line and point drawing synchronized
				utilities.forEachElement(seriesEntry.markers, function(currentMarker, position){
					currentMarker.animateTo(this.grid.fetchMarkerCoordinates(position, this.grid.computeOriginOffset(currentMarker.metric)), progressFactor);
				}, this);

				// Render the connecting line between all data points
				drawingContext.lineWidth = this.options.dataSeriesOutlineWidth;
				drawingContext.strokeStyle = seriesEntry.borderHue;
				drawingContext.beginPath();
				utilities.forEachElement(seriesEntry.markers, function(currentMarker, position){
					if (position === 0){
						drawingContext.beginPathAt(currentMarker.hCoord, currentMarker.vCoord);
					}
					else{
						drawingContext.continuePathTo(currentMarker.hCoord, currentMarker.vCoord);
					}
				}, this);
				drawingContext.finalizePath();
				drawingContext.drawOutline();

				drawingContext.fillStyle = seriesEntry.fillHue;
				drawingContext.paintArea();

				// Now, render the data points on top of the line
				// This involves a slightly inefficient double loop, but prevents points from lagging the line
				utilities.forEachElement(seriesEntry.markers, function(currentMarker){
					currentMarker.draw();
				});

			}, this);

		}

	});
}).call(this);