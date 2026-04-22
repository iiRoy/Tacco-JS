(function(globalScope) {
    "use strict";

    var currentGlobalRealm = globalScope,
        VisualizerEngine = currentGlobalRealm.Visualizer || currentGlobalRealm.Chart,
        utilityKit = VisualizerEngine.utilityBelt || VisualizerEngine.helpers;

    var standardGraphConfiguration = {
        valueAxisOriginatesAtZero: true,
        graphGridLinesVisible: true,
        gridLineVisualColor: "rgba(0,0,0,.05)",
        gridLineStrokeWidth: 1,
        showHorizontalDivisions: true,
        showVerticalDivisions: true,
        columnElementOutlined: true,
        columnElementOutlineWidth: 2,
        columnGroupSeparation: 5,
        dataSeriesGap: 1,
        legendDisplayTemplate: "<ul class=\"<%=chartNameKey.toLowerCase()%>-key\"><% for (var idx=0; idx<dataSeries.length; idx++){%><li><span style=\"background-color:<%=dataSeries[idx].fillColorProperty%>\"></span><%if(dataSeries[idx].labelValue){%><%=dataSeries[idx].labelValue%><%}%></li><%}%></ul>"
    };

    class ColumnGraph {
        constructor(chartInstance, inputData, userOptions) {
            this.chart = chartInstance;
            this.data = inputData;
            this.options = utilityKit.mergeObjects({}, standardGraphConfiguration, userOptions);

            this.activeVisualElements = [];
            this.dataSeries = [];

            const currentGraphOptions = this.options;

            class CoordinateSystemBuilder extends (VisualizerEngine.CoordinateBase || Object) {
                constructor(scaleConfig, graphCurrentOptions) {
                    super(scaleConfig);
                    this.gridLineOffsetEnabled = true;
                    this.graphConfigRef = graphCurrentOptions;
                }

                determineColumnXCoord(seriesCount, seriesIndex, itemIndex) {
                    const baseDimension = this.deriveFundamentalItemWidth();
                    const absoluteXCoordinate = this.calculateX(itemIndex) - (baseDimension / 2);
                    const itemSpan = this.computeColumnItemWidth(seriesCount);

                    return absoluteXCoordinate + (itemSpan * seriesIndex) + (seriesIndex * this.graphConfigRef.dataSeriesGap) + itemSpan / 2;
                }

                deriveFundamentalItemWidth() {
                    return (this.calculateX(1) - this.calculateX(0)) - (2 * this.graphConfigRef.columnGroupSeparation);
                }

                computeColumnItemWidth(seriesCount) {
                    const coreWidth = this.deriveFundamentalItemWidth() - ((seriesCount - 1) * this.graphConfigRef.dataSeriesGap);
                    return (coreWidth / seriesCount);
                }
            }
            this.coordinateSystemConstructor = CoordinateSystemBuilder;

            if (currentGraphOptions.showTooltips) {
                utilityKit.attachEventHandlers(this, currentGraphOptions.tooltipEvents, (eventPayload) => {
                    const focusedColumns = (eventPayload.type !== 'mouseout') ? this.retrieveColumnsAtEvent(eventPayload) : [];

                    this.performOnAllColumns(columnItem => {
                        columnItem.restoreAppearance(['fillColorProperty', 'lineColorProperty']);
                    });
                    utilityKit.iterateOverCollection(focusedColumns, activeColumn => {
                        activeColumn.fillColorProperty = activeColumn.highlightFillProperty;
                        activeColumn.lineColorProperty = activeColumn.highlightLineProperty;
                    });
                    this.displayHoverTooltip(focusedColumns);
                });
            }

            class ColumnElementRepresentation extends (VisualizerEngine.GeometricBlock || Object) {
                constructor(elementDefinition) {
                    super(elementDefinition);
                    this.outlineThickness = currentGraphOptions.columnElementOutlineWidth;
                    this.isOutlined = currentGraphOptions.columnElementOutlined;
                    this.drawingContext = chartInstance.ctx;
                }
            }
            this.columnElementConstructor = ColumnElementRepresentation;

            utilityKit.iterateOverCollection(inputData.dataSeries, (series, seriesIndex) => {
                const seriesObject = {
                    labelValue: series.labelValue || null,
                    fillColorProperty: series.fillColorProperty,
                    lineColorProperty: series.lineColorProperty,
                    columns: []
                };

                this.dataSeries.push(seriesObject);

                utilityKit.iterateOverCollection(series.dataPoints, (pointValue, dataPointIndex) => {
                    seriesObject.columns.push(new this.columnElementConstructor({
                        valueIdentity: pointValue,
                        labelIdentity: inputData.labels[dataPointIndex],
                        seriesLabelIdentity: series.labelValue,
                        lineColorProperty: series.lineColorProperty,
                        fillColorProperty: series.fillColorProperty,
                        highlightFillProperty: series.highlightFillProperty || series.fillColorProperty,
                        highlightLineProperty: series.highlightLineProperty || series.lineColorProperty
                    }));
                });
            });

            this.constructCoordinateSystem(inputData.labels);

            this.columnElementConstructor.prototype.baseLevel = this.coordinateSystem.endPoint;

            this.performOnAllColumns((columnItem, dataPointIndex, seriesIndex) => {
                utilityKit.mergeObjects(columnItem, {
                    dimensionWidth: this.coordinateSystem.computeColumnItemWidth(this.dataSeries.length),
                    xPosition: this.coordinateSystem.determineColumnXCoord(this.dataSeries.length, seriesIndex, dataPointIndex),
                    yPosition: this.coordinateSystem.endPoint
                });
                columnItem.storeCurrentAppearance();
            });

            this.renderGraph();
        }

        refreshGraphView() {
            this.coordinateSystem.updateAxis();
            utilityKit.iterateOverCollection(this.activeVisualElements, activeElement => {
                activeElement.restoreAppearance(['fillColorProperty', 'lineColorProperty']);
            });

            this.performOnAllColumns(columnItem => {
                columnItem.storeCurrentAppearance();
            });
            this.renderGraph();
        }

        performOnAllColumns(callbackFunction) {
            utilityKit.iterateOverCollection(this.dataSeries, (series, seriesIndex) => {
                utilityKit.iterateOverCollection(series.columns, callbackFunction, this, seriesIndex);
            });
        }

        retrieveColumnsAtEvent(eventPayload) {
            const locatedColumns = [];
            const eventScreenPosition = utilityKit.getRelativePosition(eventPayload);
            let foundColumnIdentifier;

            for (const series of this.dataSeries) {
                foundColumnIdentifier = series.columns.findIndex(columnItem =>
                    columnItem.isWithinBounds(eventScreenPosition.x, eventScreenPosition.y)
                );
                if (foundColumnIdentifier !== -1) {
                    this.dataSeries.forEach(s => {
                        if (s.columns[foundColumnIdentifier]) {
                            locatedColumns.push(s.columns[foundColumnIdentifier]);
                        }
                    });
                    return locatedColumns;
                }
            }
            return locatedColumns;
        }

        constructCoordinateSystem(axisLabelNames) {
            const graphContext = this;

            const collectAllDataValues = () => {
                const valuesAccumulator = [];
                graphContext.performOnAllColumns(columnItem => {
                    valuesAccumulator.push(columnItem.valueIdentity);
                });
                return valuesAccumulator;
            };

            const coordinateSystemSettings = {
                templateStringRef: this.options.scaleLabel,
                heightMeasure: this.chart.height,
                widthMeasure: this.chart.width,
                drawingContext: this.chart.ctx,
                labelTextColor: this.options.scaleFontColor,
                labelFontSize: this.options.scaleFontSize,
                labelFontStyle: this.options.scaleFontStyle,
                labelFontFamily: this.options.scaleFontFamily,
                dataPointCount: axisLabelNames.length,
                startFromZero: this.options.valueAxisOriginatesAtZero,
                integerValuesOnly: this.options.scaleIntegersOnly,
                calculateValueRange: function(currentDisplayHeight) {
                    const updatedRangeData = utilityKit.determineScaleRange(
                        collectAllDataValues(),
                        currentDisplayHeight,
                        this.labelFontSize,
                        this.startFromZero,
                        this.integerValuesOnly
                    );
                    utilityKit.mergeObjects(this, updatedRangeData);
                },
                xAxisLabelCollection: axisLabelNames,
                fontDescriptorString: utilityKit.composeFontString(this.options.scaleFontSize, this.options.scaleFontStyle, this.options.scaleFontFamily),
                lineStrokeWidth: this.options.scaleLineWidth,
                lineStrokeColor: this.options.scaleLineColor,
                showHorizontalLines: this.options.showHorizontalDivisions,
                showVerticalLines: this.options.showVerticalDivisions,
                gridLineStrokeWidth: (this.options.graphGridLinesVisible) ? this.options.gridLineStrokeWidth : 0,
                gridLineStrokeColor: (this.options.graphGridLinesVisible) ? this.options.gridLineVisualColor : "rgba(0,0,0,0)",
                contentPadding: (this.options.showScale) ? 0 : (this.options.columnElementOutlined) ? this.options.columnElementOutlineWidth : 0,
                displayLabelVisibility: this.options.scaleShowLabels,
                displayComponent: this.options.showScale
            };

            if (this.options.scaleOverride) {
                utilityKit.mergeObjects(coordinateSystemSettings, {
                    calculateValueRange: utilityKit.noOperationFunction,
                    stepIntervals: this.options.scaleSteps,
                    stepValueIncrement: this.options.scaleStepWidth,
                    minimumDataValue: this.options.scaleStartValue,
                    maximumDataValue: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
                });
            }

            this.coordinateSystem = new this.coordinateSystemConstructor(coordinateSystemSettings, this.options);
        }

        addGraphData(newValuesArray, newLabelEntry) {
            utilityKit.iterateOverCollection(newValuesArray, (valueToAdd, seriesIndex) => {
                this.dataSeries[seriesIndex].columns.push(new this.columnElementConstructor({
                    valueIdentity: valueToAdd,
                    labelIdentity: newLabelEntry,
                    xPosition: this.coordinateSystem.determineColumnXCoord(this.dataSeries.length, seriesIndex, this.coordinateSystem.dataPointCount + 1),
                    yPosition: this.coordinateSystem.endPoint,
                    dimensionWidth: this.coordinateSystem.computeColumnItemWidth(this.dataSeries.length),
                    baseLevel: this.coordinateSystem.endPoint,
                    lineColorProperty: this.dataSeries[seriesIndex].lineColorProperty,
                    fillColorProperty: this.dataSeries[seriesIndex].fillColorProperty
                }));
            });

            this.coordinateSystem.addXAxisLabel(newLabelEntry);
            this.refreshGraphView();
        }

        removeGraphData() {
            this.coordinateSystem.removeXAxisLabel();
            utilityKit.iterateOverCollection(this.dataSeries, series => {
                series.columns.shift();
            });
            this.refreshGraphView();
        }

        adjustGraphLayout() {
            utilityKit.mergeObjects(this.columnElementConstructor.prototype, {
                yPosition: this.coordinateSystem.endPoint,
                baseLevel: this.coordinateSystem.endPoint
            });
            const newCoordinateProperties = utilityKit.mergeObjects({
                heightMeasure: this.chart.height,
                widthMeasure: this.chart.width
            });
            this.coordinateSystem.updateAxis(newCoordinateProperties);
        }

        renderGraph(animationEasing) {
            const easingFactor = animationEasing || 1;
            this.clearDrawingSurface();

            const currentDrawingContext = this.chart.ctx;

            this.coordinateSystem.renderAxis(easingFactor);

            utilityKit.iterateOverCollection(this.dataSeries, (series, seriesIndex) => {
                utilityKit.iterateOverCollection(series.columns, (columnItem, dataPointIndex) => {
                    if (columnItem.hasValue()) {
                        columnItem.baseLevel = this.coordinateSystem.endPoint;
                        columnItem.animateAndDraw({
                            xPosition: this.coordinateSystem.determineColumnXCoord(this.dataSeries.length, seriesIndex, dataPointIndex),
                            yPosition: this.coordinateSystem.calculateY(columnItem.valueIdentity),
                            dimensionWidth: this.coordinateSystem.computeColumnItemWidth(this.dataSeries.length)
                        }, easingFactor).drawVisualElement();
                    }
                });
            });
        }

        clearDrawingSurface() {
            if (this.chart && typeof this.chart.clear === 'function') {
                this.chart.clear();
            }
        }
        displayHoverTooltip(elements) {
            if (this.chart && typeof this.chart.tooltip === 'function') {
                this.chart.tooltip(elements, this);
            }
        }
    }

    VisualizerEngine.ColumnGraph = ColumnGraph;

    if (!VisualizerEngine.CoordinateBase) {
        VisualizerEngine.CoordinateBase = class {
            constructor(options) { Object.assign(this, options); }
            calculateX(index) { return index * 10; }
            calculateY(value) { return value * 10; }
            updateAxis() {}
            renderAxis() {}
            addXAxisLabel() {}
            removeXAxisLabel() {}
            get endPoint() { return 0; }
            get dataPointCount() { return this.xAxisLabelCollection ? this.xAxisLabelCollection.length : 0; }
        };
    }
    if (!VisualizerEngine.GeometricBlock) {
        VisualizerEngine.GeometricBlock = class {
            constructor(props) { Object.assign(this, props); this._savedProps = {}; }
            isWithinBounds(x, y) { return false; }
            hasValue() { return typeof this.valueIdentity === 'number'; }
            restoreAppearance(props) { props.forEach(p => this[p] = this._savedProps[p]); }
            storeCurrentAppearance() { for (const p in this) { if (Object.prototype.hasOwnProperty.call(this, p)) this._savedProps[p] = this[p]; } }
            animateAndDraw(targetProps, easing) { Object.assign(this, targetProps); return this; }
            drawVisualElement() {}
        };
    }
    if (!utilityKit) {
        utilityKit = {
            mergeObjects: function(target, ...sources) { return Object.assign(target, ...sources); },
            attachEventHandlers: function(instance, events, handler) { /* mock */ },
            iterateOverCollection: function(collection, callback, context, arg4) {
                if (!collection) return;
                for (let i = 0; i < collection.length; i++) {
                    callback.call(context, collection[i], i, arg4);
                }
            },
            getRelativePosition: function(e) { return { x: e.clientX || 0, y: e.clientY || 0 }; },
            composeFontString: function(size, style, family) { return `${style} ${size}px ${family}`; },
            determineScaleRange: function(values, height, fontSize, beginAtZero, integersOnly) { return { min: 0, max: 100, steps: 10, stepValue: 10 }; },
            noOperationFunction: function() {}
        };
        VisualizerEngine.utilityBelt = utilityKit;
    }

}).call(this);