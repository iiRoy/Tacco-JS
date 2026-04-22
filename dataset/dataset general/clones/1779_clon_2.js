(function()
{
    "use strict";

    var globalScope = this,
        Graph = globalScope.Graph,
        utilities = Graph.utilities;


    var standardSettings = {
        // Flag indicating if the axis should commence its range from zero
        axisStartAtZero : true,

        // Flag to show or hide the grid lines on the chart
        axisDisplayGridlines : true,

        // Color specification for the grid lines
        axisGridlineColor : "rgba(0,0,0,0.05)",

        // Numeric value for the thickness of the grid lines
        axisGridlineWidth : 1,

        // Determines visibility of horizontal grid lines (excluding the X-axis)
        axisShowHorizLines: true,

        // Determines visibility of vertical grid lines (excluding the Y-axis)
        axisShowVertLines: true,

        // Boolean indicating if each column should have an outline
        columnOutlineVisible : true,

        // Numerical value for the width of the column outlines
        columnOutlineThickness : 2,

        // Gap between individual X-axis data segments
        columnSegmentGap : 5,

        // Gap between different data groups within a single X-axis segment
        columnGroupSpacing : 1,

        // String template for rendering the chart's legend
        keyPattern : "<ul class=\"<%=description.toLowerCase()%>-legend\"><% for (var i=0; i<dataGroups.length; i++){%><li><span style=\"background-color:<%=dataGroups[i].fillShade%>\"></span><%if(dataGroups[i].description){%><%=dataGroups[i].description%><%}%></li><%}%></ul>"

    };


    Graph.Kind.prolong({
        title: "ColumnGraph",
        preset : standardSettings,
        initiate:  function(inputData){

            // Make graphOptions accessible to the AxisModel
            var graphOptions = this.graphOptions;

            this.AxisModel = Graph.Scale.extend({
                shiftGridLines : true,
                determineColumnX : function(dataGroupCount, dataGroupIdx, columnIndex){
                    // Method to compute the x-coordinate for a given column
                    var xDimension = this.determineBaseDimension(),
                        xCoordAbsolute = this.calculateX(columnIndex) - (xDimension/2),
                        columnDimension = this.determineColumnDimension(dataGroupCount);

                    return xCoordAbsolute + (columnDimension * dataGroupIdx) + (dataGroupIdx * graphOptions.columnGroupSpacing) + columnDimension/2;
                },
                determineBaseDimension : function(){
                    return (this.calculateX(1) - this.calculateX(0)) - (2*graphOptions.columnSegmentGap);
                },
                determineColumnDimension : function(dataGroupCount){
                    // Space between data groups is applied to the right of each column, if multiple groups exist
                    var baseDimension = this.determineBaseDimension() - ((dataGroupCount - 1) * graphOptions.columnGroupSpacing);

                    return (baseDimension / dataGroupCount);
                }
            });

            this.dataCollections = [];

            // Set up event handlers for tooltip interactions
            if (this.graphOptions.displayTooltips){
                utilities.bindEvents(this, this.graphOptions.tipEvents, function(eventObj){
                    var activeColumns = (eventObj.type !== 'mouseout') ? this.getColumnsAtEvent(eventObj) : [];

                    this.iterateColumns(function(column){
                        column.revertState(['fillShade', 'outlineShade']);
                    });
                    utilities.each(activeColumns, function(activeColumn){
                        activeColumn.fillShade = activeColumn.emphasisFill;
                        activeColumn.outlineShade = activeColumn.emphasisStroke;
                    });
                    this.presentTooltip(activeColumns);
                });
            }

            // Define the ColumnShape class, inheriting from RectangularShape
            this.ColumnShape = Graph.RectangularShape.extend({
                outlineThickness : this.graphOptions.columnOutlineThickness,
                displayOutline : this.graphOptions.columnOutlineVisible,
                renderContext : this.chart.ctx
            });

            // Process each data group from the input and populate internal collections
            utilities.each(inputData.dataGroups,function(dataGroup,dataGroupIdx){

                var dataGroupEntity = {
                    description : dataGroup.description || null,
                    fillShade : dataGroup.fillShade,
                    outlineShade : dataGroup.outlineShade,
                    columns : []
                };

                this.dataCollections.push(dataGroupEntity);

                utilities.each(dataGroup.measures,function(datumPoint,idx){
                    // Create a new column object for each data point
                    dataGroupEntity.columns.push(new this.ColumnShape({
                        metric : datumPoint,
                        description : inputData.categories[idx],
                        dataGroupDescription: dataGroup.description,
                        outlineShade : dataGroup.outlineShade,
                        fillShade : dataGroup.fillShade,
                        emphasisFill : dataGroup.emphasisFill || dataGroup.fillShade,
                        emphasisStroke : dataGroup.emphasisStroke || dataGroup.outlineShade
                    }));
                },this);

            },this);

            this.constructAxis(inputData.categories);

            this.ColumnShape.prototype.origin = this.chartAxis.endPoint;

            this.iterateColumns(function(column, idx, dataGroupIdx){
                utilities.mergeProps(column, {
                    dimension : this.chartAxis.determineColumnDimension(this.dataCollections.length),
                    xPos: this.chartAxis.determineColumnX(this.dataCollections.length, dataGroupIdx, idx),
                    yPos: this.chartAxis.endPoint
                });
                column.storeState();
            }, this);

            this.renderVisual();
        },
        refresh : function(){
            this.chartAxis.update();
            // Clear any previously highlighted items before re-rendering.
            utilities.each(this.activeItems, function(activeItem){
                activeItem.revertState(['fillShade', 'outlineShade']);
            });

            this.iterateColumns(function(column){
                column.storeState();
            });
            this.renderVisual();
        },
        iterateColumns : function(actionFunc){
            utilities.each(this.dataCollections,function(dataGroup, dataGroupIdx){
                utilities.each(dataGroup.columns, actionFunc, this, dataGroupIdx);
            },this);
        },
        getColumnsAtEvent : function(eventObj){
            var columnsCollection = [],
                eventLocation = utilities.getRelativePosition(eventObj),
                dataGroupProcessor = function(dataGroup){
                    columnsCollection.push(dataGroup.columns[colIdx]);
                },
                colIdx;

            for (var dataGroupIdx = 0; dataGroupIdx < this.dataCollections.length; dataGroupIdx++) {
                for (colIdx = 0; colIdx < this.dataCollections[dataGroupIdx].columns.length; colIdx++) {
                    if (this.dataCollections[dataGroupIdx].columns[colIdx].isWithinBounds(eventLocation.x,eventLocation.y)){
                        utilities.each(this.dataCollections, dataGroupProcessor);
                        return columnsCollection;
                    }
                }
            }

            return columnsCollection;
        },
        constructAxis : function(categories){
            var thisInstance = this;

            var aggregateMetrics = function(){
                var measures = [];
                thisInstance.iterateColumns(function(column){
                    measures.push(column.metric);
                });
                return measures;
            };

            var axisSettings = {
                formatString : this.graphOptions.scaleLabel,
                chartHeight : this.chart.height,
                chartWidth : this.chart.width,
                renderContext : this.chart.ctx,
                fontColor : this.graphOptions.scaleFontColor,
                fontMetric : this.graphOptions.scaleFontSize,
                fontVariant : this.graphOptions.scaleFontStyle,
                fontType : this.graphOptions.scaleFontFamily,
                measureCount : categories.length,
                startFromZero : this.graphOptions.axisStartAtZero,
                wholeNumbersOnly : this.graphOptions.scaleIntegersOnly,
                determineYRange: function(currentChartHeight){
                    var modifiedRanges = utilities.calculateScaleRange(
                        aggregateMetrics(),
                        currentChartHeight,
                        this.fontMetric,
                        this.startFromZero,
                        this.wholeNumbersOnly
                    );
                    utilities.mergeProps(this, modifiedRanges);
                },
                xCategories : categories,
                fontDescriptor : utilities.fontString(this.graphOptions.scaleFontSize, this.graphOptions.scaleFontStyle, this.graphOptions.scaleFontFamily),
                lineThickness : this.graphOptions.scaleLineWidth,
                lineShade : this.graphOptions.scaleLineColor,
                displayHorizLines : this.graphOptions.axisShowHorizLines,
                displayVertLines : this.graphOptions.axisShowVertLines,
                gridLineThickness : (this.graphOptions.axisDisplayGridlines) ? this.graphOptions.axisGridlineWidth : 0,
                gridLineShade : (this.graphOptions.axisDisplayGridlines) ? this.graphOptions.axisGridlineColor : "rgba(0,0,0,0)",
                innerSpacing : (this.graphOptions.displayAxis) ? 0 : (this.graphOptions.columnOutlineVisible) ? this.graphOptions.columnOutlineThickness : 0,
                showLabels : this.graphOptions.scaleShowLabels,
                isVisible : this.graphOptions.displayAxis
            };

            if (this.graphOptions.axisOverride){
                utilities.mergeProps(axisSettings, {
                    determineYRange: utilities.noOpFunction,
                    axisSteps: this.graphOptions.scaleSteps,
                    stepIncrement: this.graphOptions.scaleStepWidth,
                    minimumVal: this.graphOptions.scaleStartValue,
                    maximumVal: this.graphOptions.scaleStartValue + (this.graphOptions.scaleSteps * this.graphOptions.scaleStepWidth)
                });
            }

            this.chartAxis = new this.AxisModel(axisSettings);
        },
        appendData : function(metricArray,itemLabel){
            // Map the new metric array to each existing data collection
            utilities.each(metricArray,function(metric,dataGroupIdx){
                // Add a new column instance for each new data point
                this.dataCollections[dataGroupIdx].columns.push(new this.ColumnShape({
                    metric : metric,
                    description : itemLabel,
                    xPos: this.chartAxis.determineColumnX(this.dataCollections.length, dataGroupIdx, this.chartAxis.measureCount+1),
                    yPos: this.chartAxis.endPoint,
                    dimension : this.chartAxis.determineColumnDimension(this.dataCollections.length),
                    origin : this.chartAxis.endPoint,
                    outlineShade : this.dataCollections[dataGroupIdx].outlineShade,
                    fillShade : this.dataCollections[dataGroupIdx].fillShade
                }));
            },this);

            this.chartAxis.addXCategory(itemLabel);
            // Then trigger a re-render of the chart.
            this.refresh();
        },
        deleteData : function(){
            this.chartAxis.removeXCategory();
            // Then trigger a re-render of the chart.
            utilities.each(this.dataCollections,function(dataGroup){
                dataGroup.columns.removeFirst();
            },this);
            this.refresh();
        },
        rearrange : function(){
            utilities.mergeProps(this.ColumnShape.prototype,{
                yPos: this.chartAxis.endPoint,
                origin : this.chartAxis.endPoint
            });
            var updatedAxisProps = utilities.mergeProps({
                chartHeight : this.chart.height,
                chartWidth : this.chart.width
            });
            this.chartAxis.update(updatedAxisProps);
        },
        renderVisual : function(animationProgress){
            var progressFraction = animationProgress || 1;
            this.eraseCanvas();

            var renderContext = this.chart.ctx;

            this.chartAxis.draw(progressFraction);

            // Iterate and draw all columns for every data collection
            utilities.each(this.dataCollections,function(dataGroup,dataGroupIdx){
                utilities.each(dataGroup.columns,function(column,idx){
                    if (column.holdsValue()){
                        column.origin = this.chartAxis.endPoint;
                        // Animate and then draw the column
                        column.animateProperties({
                            xPos : this.chartAxis.determineColumnX(this.dataCollections.length, dataGroupIdx, idx),
                            yPos : this.chartAxis.determineY(column.metric),
                            dimension : this.chartAxis.determineColumnDimension(this.dataCollections.length)
                        }, progressFraction).draw();
                    }
                },this);

            },this);
        }
    });


}).call(this);