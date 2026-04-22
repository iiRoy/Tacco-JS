(function(globalScope){
    "use strict";

    const VisualizerEngine = globalScope.VisualizerEngine || {};
    globalScope.VisualizerEngine = VisualizerEngine;

    VisualizerEngine.UtilityBelt = {
        iterateOver: (collection, processor, context) => {
            if (!collection) return;
            Array.prototype.forEach.call(collection, processor, context);
        },
        isNumeric: (datum) => typeof datum === 'number' && isFinite(datum),
        acquireRelativePosition: (evnt) => {
            const canvasRect = evnt.target.getBoundingClientRect();
            return {
                x: evnt.clientX - canvasRect.left,
                y: evnt.clientY - canvasRect.top
            };
        },
        computeAngularOffset: (centerCoord, eventCoord) => {
            const dx = eventCoord.x - centerCoord.x;
            const dy = eventCoord.y - centerCoord.y;
            const angle = Math.atan2(dy, dx);
            const distance = Math.sqrt(dx * dx + dy * dy);
            return { angle: angle, distance: distance };
        },
        smallestValue: (numericArray) => Math.min(...numericArray),
        mergeProperties: (target, ...sources) => Object.assign(target, ...sources),
        determineRange: (dataValues, availableDimension, fontSz, startFromZero, onlyIntegers) => {
            const allValues = dataValues.filter(VisualizerEngine.UtilityBelt.isNumeric);
            if (allValues.length === 0) return { stepCount: 1, stepIncrement: 1, minimumExtent: 0, maximumExtent: 1 };

            let minValue = Math.min(...allValues);
            let maxValue = Math.max(...allValues);

            if (startFromZero) {
                minValue = 0;
            }

            if (minValue === maxValue) {
                minValue = 0;
                maxValue = (maxValue === 0) ? 1 : maxValue * 2;
            }

            const range = maxValue - minValue;
            const minSteps = 2;
            const maxSteps = Math.floor(availableDimension / (fontSz * 2));
            const targetSteps = Math.max(minSteps, Math.min(maxSteps, 5));

            let rawStepCandidate = range / targetSteps;
            let magnitude = Math.pow(10, Math.floor(Math.log10(rawStepCandidate)));
            let adjustedStep = Math.ceil(rawStepCandidate / magnitude) * magnitude;

            if (adjustedStep * targetSteps < range) {
                adjustedStep = Math.ceil(adjustedStep * 1.2 / magnitude) * magnitude;
            }

            let finalMax = Math.ceil(maxValue / adjustedStep) * adjustedStep;
            let finalMin = Math.floor(minValue / adjustedStep) * adjustedStep;

            if (startFromZero) finalMin = 0;

            let actualSteps = Math.round((finalMax - finalMin) / adjustedStep);
            if (onlyIntegers) {
                adjustedStep = Math.max(1, Math.round(adjustedStep));
                finalMax = Math.ceil(maxValue / adjustedStep) * adjustedStep;
                finalMin = Math.floor(minValue / adjustedStep) * adjustedStep;
                if (startFromZero) finalMin = 0;
                actualSteps = Math.round((finalMax - finalMin) / adjustedStep);
            }

            return {
                stepCount: actualSteps,
                stepIncrement: adjustedStep,
                minimumExtent: finalMin,
                maximumExtent: finalMax
            };
        }
    };

    class PlotVertexBase {
        constructor(settings) {
            VisualizerEngine.UtilityBelt.mergeProperties(this, settings);
            this.savedState = {};
        }
        preserve(keys) {
            keys.forEach(k => { this.savedState[k] = this[k]; });
        }
        restore(keys) {
            keys.forEach(k => {
                if (this.savedState.hasOwnProperty(k)) {
                    this[k] = this.savedState[k];
                }
            });
        }
        moveAnimated(targetCoordinates, animationProgress) {
            this.currentX = this.savedX + (targetCoordinates.x - this.savedX) * animationProgress;
            this.currentY = this.savedY + (targetCoordinates.y - this.savedY) * animationProgress;
        }
        display(renderContext) { /* to be overridden */ }
    }
    VisualizerEngine.PlotVertexBase = PlotVertexBase;

    class RadialCoordinateSystem {
        constructor(params) {
            VisualizerEngine.UtilityBelt.mergeProperties(this, params);
            this.labels = params.labels || [];
            this.valuesCount = params.valuesCount || 0;
            this.totalArea = 0;
            this.yAxisLabels = [];
            this.maximumExtent = 0;
            this.minimumExtent = 0;
            this.stepIncrement = 0;
            this.stepCount = 0;
        }

        computeDimensions() {
            this.totalArea = VisualizerEngine.UtilityBelt.smallestValue([this.plotWidth, this.plotHeight]) / 2;
        }

        determineRadiusForValue(dataValue) {
            if (this.maximumExtent === this.minimumExtent) return 0;
            return this.totalArea * ((dataValue - this.minimumExtent) / (this.maximumExtent - this.minimumExtent));
        }

        fetchPointCoordinates(index, radius) {
            const angularStep = (Math.PI * 2) / this.valuesCount;
            const currentAngle = (angularStep * index) - (Math.PI / 2);
            return {
                x: this.centerX + Math.cos(currentAngle) * radius,
                y: this.centerY + Math.sin(currentAngle) * radius
            };
        }

        constructAxisLabels() {
            this.yAxisLabels = [];
            for (let i = 0; i < this.stepCount; i++) {
                const labelValue = this.minimumExtent + (i * this.stepIncrement);
                this.yAxisLabels.push({
                    value: labelValue,
                    text: this.labelFormatString ? this.labelFormatString.replace(/<%=value%>/g, labelValue.toString()) : labelValue.toString()
                });
            }
        }

        renderGrid() {
            if (this.showDisplay) {
                const renderCtx = this.renderContext;

                if (this.showAngularLinesOut && this.angularLineWidth > 0) {
                    renderCtx.strokeStyle = this.angularLineColor;
                    renderCtx.lineWidth = this.angularLineWidth;
                    renderCtx.beginPath();
                    for (let i = 0; i < this.valuesCount; i++) {
                        const coords = this.fetchPointCoordinates(i, this.totalArea);
                        renderCtx.moveTo(this.centerX, this.centerY);
                        renderCtx.lineTo(coords.x, coords.y);
                    }
                    renderCtx.stroke();
                }

                if (this.showRadialLines && this.radialLineWidth > 0) {
                    renderCtx.strokeStyle = this.radialLineColor;
                    renderCtx.lineWidth = this.radialLineWidth;
                    for (let i = 0; i < this.stepCount; i++) {
                        const radius = this.determineRadiusForValue(this.yAxisLabels[i].value);
                        const firstPoint = this.fetchPointCoordinates(0, radius);
                        renderCtx.beginPath();
                        renderCtx.moveTo(firstPoint.x, firstPoint.y);
                        for (let j = 1; j < this.valuesCount; j++) {
                            const nextPoint = this.fetchPointCoordinates(j, radius);
                            renderCtx.lineTo(nextPoint.x, nextPoint.y);
                        }
                        renderCtx.closePath();
                        renderCtx.stroke();
                    }
                }

                if (this.showPointLabels) {
                    renderCtx.font = `${this.pointLabelFontStyle} ${this.pointLabelFontSize}px ${this.pointLabelFontFamily}`;
                    renderCtx.fillStyle = this.pointLabelFontColor;
                    renderCtx.textBaseline = 'middle';
                    renderCtx.textAlign = 'center';
                    const labelOffset = this.pointLabelFontSize / 2;
                    for (let i = 0; i < this.valuesCount; i++) {
                        const coords = this.fetchPointCoordinates(i, this.totalArea + labelOffset);
                        renderCtx.fillText(this.labels[i], coords.x, coords.y);
                    }
                }

                if (this.showLabels) {
                    renderCtx.font = `${this.fontStyle} ${this.fontSize}px ${this.fontFamily}`;
                    renderCtx.fillStyle = this.fontColor;
                    const labelSpokeIndex = 0;
                    renderCtx.textAlign = 'left';
                    renderCtx.textBaseline = 'middle';

                    for (let i = 0; i < this.yAxisLabels.length; i++) {
                        const radius = this.determineRadiusForValue(this.yAxisLabels[i].value);
                        const coords = this.fetchPointCoordinates(labelSpokeIndex, radius);
                        if (this.showLabelBackdrop) {
                            renderCtx.fillStyle = this.backdropColor;
                            const textMetrics = renderCtx.measureText(this.yAxisLabels[i].text);
                            const backdropX = coords.x - this.backdropPaddingX;
                            const backdropY = coords.y - this.fontSize / 2 - this.backdropPaddingY;
                            renderCtx.fillRect(backdropX, backdropY, textMetrics.width + 2 * this.backdropPaddingX, this.fontSize + 2 * this.backdropPaddingY);
                            renderCtx.fillStyle = this.fontColor;
                        }
                        renderCtx.fillText(this.yAxisLabels[i].text, coords.x + this.backdropPaddingX, coords.y);
                    }
                }
            }
        }
    }
    VisualizerEngine.RadialCoordinateSystem = RadialCoordinateSystem;

    class RadialPlotter {
        static defaultSettings = {
            radialLinesVisible: true,
            angularLinesVisible: true,
            axisLabelsVisible: false,
            zeroPointOrigin: true,
            displayScale: true,

            angularLineTint: "rgba(0,0,0,.1)",
            angularLineThickness: 1,
            vertexLabelFontFamily: "'Arial'",
            vertexLabelFontStyle: "normal",
            vertexLabelFontSize: 10,
            vertexLabelFontColor: "#666",
            scaleFontStyle: "normal",
            scaleFontSize: 12,
            scaleFontFamily: "'Arial'",
            scaleFontColor: "#666",
            scaleLineColor: "rgba(0,0,0,.1)",
            scaleLineWidth: 1,
            scaleShowLabelBackdrop: true,
            scaleBackdropColor: "rgba(255,255,255,0.75)",
            scaleBackdropPaddingY: 2,
            scaleBackdropPaddingX: 2,
            scaleLabel: "<%=value%>",
            scaleIntegersOnly: true,

            vertexIndicator: true,
            vertexIndicatorRadius: 3,
            vertexIndicatorBorderWidth: 1,
            vertexInteractionRadius: 20,

            seriesBorder: true,
            seriesBorderWidth: 2,
            seriesFill: true,

            captionTemplate: "<ul class=\"<%=id.toLowerCase()%>-caption\"><% for (var i=0; i<seriesCollection.length; i++){%><li><span style=\"background-color:<%=seriesCollection[i].lineColor%>\"></span><%if(seriesCollection[i].caption){%><%=seriesCollection[i].caption%><%}%></li><%}%></ul>",

            displayTooltips: true,
            tooltipActivationEvents: ['mousemove', 'mouseout'],
            animation: true,

            scaleOverride: false,
            scaleSteps: null,
            scaleStepWidth: null,
            scaleStartValue: null
        };

        constructor(renderingContext, configuration) {
            this.displayContext = renderingContext;
            this.config = VisualizerEngine.UtilityBelt.mergeProperties({}, RadialPlotter.defaultSettings, configuration);

            this.VertexPrototype = class extends VisualizerEngine.PlotVertexBase {
                constructor(params) {
                    super(VisualizerEngine.UtilityBelt.mergeProperties({
                        strokeWidth: RadialPlotter.defaultSettings.vertexIndicatorBorderWidth,
                        radius: RadialPlotter.defaultSettings.vertexIndicatorRadius,
                        display: RadialPlotter.defaultSettings.vertexIndicator,
                        hitDetectionRadius: RadialPlotter.defaultSettings.vertexInteractionRadius,
                        ctx: renderingContext.renderContext,
                        currentX: params.x,
                        currentY: params.y,
                        savedX: params.x,
                        savedY: params.y
                    }, params));
                }
                display(renderContext) {
                    if (this.display) {
                        renderContext.beginPath();
                        renderContext.arc(this.currentX, this.currentY, this.radius, 0, Math.PI * 2);
                        renderContext.closePath();
                        renderContext.strokeStyle = this.strokeColor;
                        renderContext.lineWidth = this.strokeWidth;
                        renderContext.fillStyle = this.fillColor;
                        renderContext.fill();
                        renderContext.stroke();
                    }
                }
            };

            this.dataSeries = [];
            this.polarGrid = null;

            this.prepareLayout(configuration.data);
        }

        prepareLayout(sourceData) {
            this.constructPolarGrid(sourceData);

            if (this.config.displayTooltips) {
                this.attachInteractionHandlers(this.config.tooltipActivationEvents, (interactionEvent) => {
                    const activeVertices = (interactionEvent.type !== 'mouseout') ? this.identifyInteractedVertices(interactionEvent) : [];

                    this.traverseVertices((vert) => {
                        vert.restore(['fillColor', 'strokeColor']);
                    });
                    VisualizerEngine.UtilityBelt.iterateOver(activeVertices, (activeVert) => {
                        activeVert.fillColor = activeVert.highlightFill;
                        activeVert.strokeColor = activeVert.highlightStroke;
                    });

                    this.presentTooltip(activeVertices);
                });
            }

            VisualizerEngine.UtilityBelt.iterateOver(sourceData.seriesCollection, (seriesEntry) => {
                const seriesObject = {
                    caption: seriesEntry.caption || null,
                    fillColor: seriesEntry.fillColor,
                    lineColor: seriesEntry.lineColor,
                    vertexColor: seriesEntry.vertexColor,
                    vertexBorderColor: seriesEntry.vertexBorderColor,
                    vertices: []
                };
                this.dataSeries.push(seriesObject);

                VisualizerEngine.UtilityBelt.iterateOver(seriesEntry.dataPoints, (pointValue, idx) => {
                    if (VisualizerEngine.UtilityBelt.isNumeric(pointValue)) {
                        let vertexLocation;
                        if (!this.config.animation) {
                            vertexLocation = this.polarGrid.fetchPointCoordinates(idx, this.polarGrid.determineRadiusForValue(pointValue));
                        }
                        seriesObject.vertices.push(new this.VertexPrototype({
                            value: pointValue,
                            label: sourceData.categories[idx],
                            seriesCaption: seriesEntry.caption,
                            x: (this.config.animation) ? this.polarGrid.centerX : vertexLocation.x,
                            y: (this.config.animation) ? this.polarGrid.centerY : vertexLocation.y,
                            strokeColor: seriesEntry.vertexBorderColor,
                            fillColor: seriesEntry.vertexColor,
                            highlightFill: seriesEntry.vertexHighlightFill || seriesEntry.vertexColor,
                            highlightStroke: seriesEntry.vertexHighlightBorder || seriesEntry.vertexBorderColor
                        }));
                    }
                });
            });

            this.renderVisualization();
        }

        traverseVertices(processingCallback) {
            VisualizerEngine.UtilityBelt.iterateOver(this.dataSeries, (series) => {
                VisualizerEngine.UtilityBelt.iterateOver(series.vertices, processingCallback);
            });
        }

        identifyInteractedVertices(interactionEvent) {
            const pointerPosition = VisualizerEngine.UtilityBelt.acquireRelativePosition(interactionEvent);
            const angleAndDistance = VisualizerEngine.UtilityBelt.computeAngularOffset({
                x: this.polarGrid.centerX,
                y: this.polarGrid.centerY
            }, pointerPosition);

            const sectorAngle = (Math.PI * 2) / this.polarGrid.valuesCount;
            let sectorIndex = Math.round((angleAndDistance.angle - Math.PI * 1.5) / sectorAngle);

            if (sectorIndex >= this.polarGrid.valuesCount || sectorIndex < 0){
                sectorIndex = 0;
            }

            const detectedVertices = [];
            if (angleAndDistance.distance <= this.polarGrid.totalArea) {
                VisualizerEngine.UtilityBelt.iterateOver(this.dataSeries, (series) => {
                    detectedVertices.push(series.vertices[sectorIndex]);
                });
            }
            return detectedVertices;
        }

        constructPolarGrid(sourceData) {
            this.polarGrid = new VisualizerEngine.RadialCoordinateSystem({
                showDisplay: this.config.displayScale,
                fontStyle: this.config.scaleFontStyle,
                fontSize: this.config.scaleFontSize,
                fontFamily: this.config.scaleFontFamily,
                fontColor: this.config.scaleFontColor,
                showLabels: this.config.axisLabelsVisible,
                showLabelBackdrop: this.config.scaleShowLabelBackdrop,
                backdropColor: this.config.scaleBackdropColor,
                backdropPaddingY: this.config.scaleBackdropPaddingY,
                backdropPaddingX: this.config.scaleBackdropPaddingX,
                radialLineWidth: (this.config.radialLinesVisible) ? this.config.scaleLineWidth : 0,
                radialLineColor: this.config.scaleLineColor,
                angularLineColor: this.config.angularLineTint,
                angularLineWidth: (this.config.angularLinesVisible) ? this.config.angularLineThickness : 0,
                pointLabelFontColor: this.config.vertexLabelFontColor,
                pointLabelFontSize: this.config.vertexLabelFontSize,
                pointLabelFontFamily: this.config.vertexLabelFontFamily,
                pointLabelFontStyle: this.config.vertexLabelFontStyle,
                plotHeight: this.displayContext.canvasHeight,
                plotWidth: this.displayContext.canvasWidth,
                centerX: this.displayContext.canvasWidth / 2,
                centerY: this.displayContext.canvasHeight / 2,
                renderContext: this.displayContext.renderContext,
                labelFormatString: this.config.scaleLabel,
                labels: sourceData.categories,
                valuesCount: sourceData.seriesCollection[0].dataPoints.length
            });

            this.polarGrid.computeDimensions();
            this.calibrateGridLimits(sourceData.seriesCollection);
            this.polarGrid.constructAxisLabels();
        }

        calibrateGridLimits(seriesData) {
            const aggregatedValues = (() => {
                let allDataPoints = [];
                VisualizerEngine.UtilityBelt.iterateOver(seriesData, (series) => {
                    if (series.dataPoints) {
                        allDataPoints = allDataPoints.concat(series.dataPoints);
                    } else {
                        VisualizerEngine.UtilityBelt.iterateOver(series.vertices, (vertex) => {
                            allDataPoints.push(vertex.value);
                        });
                    }
                });
                return allDataPoints;
            })();

            const calculatedRanges = (this.config.scaleOverride) ?
                {
                    stepCount: this.config.scaleSteps,
                    stepIncrement: this.config.scaleStepWidth,
                    minimumExtent: this.config.scaleStartValue,
                    maximumExtent: this.config.scaleStartValue + (this.config.scaleSteps * this.config.scaleStepWidth)
                } :
                VisualizerEngine.UtilityBelt.determineRange(
                    aggregatedValues,
                    VisualizerEngine.UtilityBelt.smallestValue([this.displayContext.canvasWidth, this.displayContext.canvasHeight]) / 2,
                    this.config.scaleFontSize,
                    this.config.zeroPointOrigin,
                    this.config.scaleIntegersOnly
                );

            VisualizerEngine.UtilityBelt.mergeProperties(this.polarGrid, calculatedRanges);
        }

        appendEntry(newValues, entryLabel) {
            this.polarGrid.valuesCount++;
            VisualizerEngine.UtilityBelt.iterateOver(newValues, (val, seriesIdx) => {
                if (VisualizerEngine.UtilityBelt.isNumeric(val)) {
                    const newVertexPosition = this.polarGrid.fetchPointCoordinates(this.polarGrid.valuesCount -1, this.polarGrid.determineRadiusForValue(val));
                    this.dataSeries[seriesIdx].vertices.push(new this.VertexPrototype({
                        value: val,
                        label: entryLabel,
                        x: newVertexPosition.x,
                        y: newVertexPosition.y,
                        strokeColor: this.dataSeries[seriesIdx].vertexBorderColor,
                        fillColor: this.dataSeries[seriesIdx].vertexColor
                    }));
                }
            });

            this.polarGrid.labels.push(entryLabel);
            this.repositionElements();
            this.refreshDisplay();
        }

        pruneEntry() {
            this.polarGrid.valuesCount--;
            this.polarGrid.labels.shift();
            VisualizerEngine.UtilityBelt.iterateOver(this.dataSeries, (series) => {
                series.vertices.shift();
            });
            this.repositionElements();
            this.refreshDisplay();
        }

        refreshDisplay() {
            this.traverseVertices((vert) => {
                vert.preserve(['fillColor', 'strokeColor', 'currentX', 'currentY']);
            });
            this.repositionElements();
            this.renderVisualization();
        }

        repositionElements() {
            VisualizerEngine.UtilityBelt.mergeProperties(this.polarGrid, {
                plotWidth: this.displayContext.canvasWidth,
                plotHeight: this.displayContext.canvasHeight,
                totalArea: VisualizerEngine.UtilityBelt.smallestValue([this.displayContext.canvasWidth, this.displayContext.canvasHeight]) / 2,
                centerX: this.displayContext.canvasWidth / 2,
                centerY: this.displayContext.canvasHeight / 2
            });
            this.calibrateGridLimits(this.dataSeries);
            this.polarGrid.computeDimensions();
            this.polarGrid.constructAxisLabels();
        }

        renderVisualization(animationProgress = 1) {
            const renderCtx = this.displayContext.renderContext;
            this.displayContext.clearCanvas();

            this.polarGrid.renderGrid();

            VisualizerEngine.UtilityBelt.iterateOver(this.dataSeries, (series) => {

                VisualizerEngine.UtilityBelt.iterateOver(series.vertices, (vert, idx) => {
                    const targetCoords = this.polarGrid.fetchPointCoordinates(idx, this.polarGrid.determineRadiusForValue(vert.value));
                    vert.moveAnimated(targetCoords, animationProgress);
                });

                if (this.config.seriesBorder) {
                    renderCtx.lineWidth = this.config.seriesBorderWidth;
                    renderCtx.strokeStyle = series.lineColor;
                    renderCtx.beginPath();
                    VisualizerEngine.UtilityBelt.iterateOver(series.vertices, (vert, idx) => {
                        if (idx === 0) {
                            renderCtx.moveTo(vert.currentX, vert.currentY);
                        } else {
                            renderCtx.lineTo(vert.currentX, vert.currentY);
                        }
                    });
                    renderCtx.closePath();
                    renderCtx.stroke();
                }

                if (this.config.seriesFill) {
                    renderCtx.fillStyle = series.fillColor;
                    renderCtx.fill();
                }

                VisualizerEngine.UtilityBelt.iterateOver(series.vertices, (vert) => {
                    vert.display(renderCtx);
                });
            });
        }

        presentTooltip(activeElements) {
            if (this.displayContext.displayTooltip) {
                this.displayContext.displayTooltip(activeElements);
            }
        }

        attachInteractionHandlers(eventTypes, handlerCallback) {
            eventTypes.forEach(eventType => {
                if (this.displayContext.canvasElement && typeof this.displayContext.canvasElement.addEventListener === 'function') {
                    this.displayContext.canvasElement.addEventListener(eventType, handlerCallback.bind(this));
                }
            });
        }
    }

    VisualizerEngine.registerPlotter = (id, plotterClass) => {
        VisualizerEngine[id] = plotterClass;
    };

    VisualizerEngine.registerPlotter("RadialPlot", RadialPlotter);

})(this);