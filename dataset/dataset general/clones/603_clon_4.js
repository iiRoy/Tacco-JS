Raphael.fn.g.chartDrawingService = function (canvasX, canvasY, plotW, plotH, dataXSeries, dataYSeries, configurations) {

    const chartContext = this;
    configurations = configurations || {};

    const condenseDataPoints = (sourceArray, targetDimension) => {
        const sourceCount = sourceArray.length;
        if (sourceCount <= targetDimension) {
            return [...sourceArray];
        }

        const ratio = sourceCount / targetDimension;

        const recursiveProcessor = (index, currentSum, fractionRemainingForSegment, resultAccumulator) => {
            if (index >= sourceCount) {
                return resultAccumulator;
            }

            const currentValue = sourceArray[index];
            const nextFractionRemaining = fractionRemainingForSegment - 1;

            if (nextFractionRemaining < 0) {
                const contributionToCurrentSegment = currentValue * (1 + nextFractionRemaining);
                const nextResultAccumulator = [...resultAccumulator, (currentSum + contributionToCurrentSegment) / ratio];
                const contributionToNextSegment = currentValue * (-nextFractionRemaining);
                return recursiveProcessor(index + 1, contributionToNextSegment, ratio + nextFractionRemaining, nextResultAccumulator);
            } else {
                return recursiveProcessor(index + 1, currentSum + currentValue, nextFractionRemaining, resultAccumulator);
            }
        };
        return recursiveProcessor(0, 0, ratio, []);
    };

    const isRaphaelArray = chartContext.raphael.is;

    const adjustedXData = isRaphaelArray(dataXSeries[0], "array") ? dataXSeries : [dataXSeries];
    const adjustedYData = isRaphaelArray(dataYSeries[0], "array") ? dataYSeries : [dataYSeries];

    const allFlatX = adjustedXData.flat();
    const allFlatY = adjustedYData.flat();

    const minXVal = Math.min(...allFlatX);
    const maxXVal = Math.max(...allFlatX);
    const minYVal = Math.min(...allFlatY);
    const maxYVal = Math.max(...allFlatY);

    const xBounds = chartContext.g.snapEnds(minXVal, maxXVal, adjustedXData[0].length - 1);
    const yBounds = chartContext.g.snapEnds(minYVal, maxYVal, adjustedYData[0].length - 1);

    const effectiveMinX = xBounds.from;
    const effectiveMaxX = xBounds.to;
    const effectiveMinY = yBounds.from;
    const effectiveMaxY = yBounds.to;

    const padding = configurations.padding || 10;

    const horizontalScaleFactor = (plotW - padding * 2) / (effectiveMaxX - effectiveMinX);
    const verticalScaleFactor = (plotH - padding * 2) / (effectiveMaxY - effectiveMinY);

    const maxSeriesLength = adjustedYData.reduce((maxLen, series) => Math.max(maxLen, series.length), 0);

    const markerDesign = configurations.marker || "";
    const seriesColorPalette = configurations.palette || Raphael.fn.g.colors;

    const overallChartElements = chartContext.set();
    const areaFillShapes = chartContext.set();
    const renderedLines = chartContext.set();
    const renderedMarkers = chartContext.set();
    const chartAxes = chartContext.set();

    let interactiveColumns = null;
    let interactivePoints = null;

    const processedYSeries = adjustedYData.map((seriesY) => {
        let currentSeriesY = [...seriesY];
        if (seriesY.length > plotW - 2 * padding) {
            currentSeriesY = condenseDataPoints(currentSeriesY, plotW - 2 * padding);
        }
        return currentSeriesY;
    });

    const processedXSeries = adjustedXData.map((seriesX) => {
        let currentSeriesX = [...seriesX];
        if (seriesX && seriesX.length > plotW - 2 * padding) {
            currentSeriesX = condenseDataPoints(currentSeriesX, plotW - 2 * padding);
        }
        return currentSeriesX;
    });

    processedYSeries.forEach((seriesY, seriesIdx) => {
        if (configurations.showArea) {
            areaFillShapes.push(chartContext.path().attr({
                stroke: "none",
                fill: seriesColorPalette[seriesIdx],
                opacity: configurations.noStroke ? 1 : .3
            }));
        }
    });

    if (configurations.axesConfig) {
        const axisConfigString = String(configurations.axesConfig);
        const axisFlags = axisConfigString.split(/[,\s]+/).map(val => !!Number(val));

        const axisDefinitions = [
            {
                enabled: axisFlags[0],
                parameters: [
                    canvasX + padding, canvasY + padding, plotW - 2 * padding,
                    effectiveMinX, effectiveMaxX,
                    configurations.xAxisStep || Math.floor((plotW - 2 * padding) / 20), 2
                ]
            },
            {
                enabled: axisFlags[1],
                parameters: [
                    canvasX + plotW - padding, canvasY + plotH - padding, plotH - 2 * padding,
                    effectiveMinY, effectiveMaxY,
                    configurations.yAxisStep || Math.floor((plotH - 2 * padding) / 20), 3
                ]
            },
            {
                enabled: axisFlags[2],
                parameters: [
                    canvasX + padding, canvasY + plotH - padding, plotW - 2 * padding,
                    effectiveMinX, effectiveMaxX,
                    configurations.xAxisStep || Math.floor((plotW - 2 * padding) / 20), 0
                ]
            },
            {
                enabled: axisFlags[3],
                parameters: [
                    canvasX + padding, canvasY + plotH - padding, plotH - 2 * padding,
                    effectiveMinY, effectiveMaxY,
                    configurations.yAxisStep || Math.floor((plotH - 2 * padding) / 20), 1
                ]
            }
        ];

        axisDefinitions.filter(def => def.enabled)
                       .forEach(def => chartAxes.push(chartContext.g.axis(...def.parameters)));
    }

    processedYSeries.forEach((seriesY, seriesIndex) => {
        let currentLineElement;
        if (!configurations.noStroke) {
            currentLineElement = chartContext.path().attr({
                stroke: seriesColorPalette[seriesIndex],
                "stroke-width": configurations.lineWidth || 2,
                "stroke-linejoin": "round",
                "stroke-linecap": "round",
                "stroke-dasharray": configurations.lineDash || ""
            });
            renderedLines.push(currentLineElement);
        }

        const seriesMarkersSet = chartContext.set();
        let currentPathSegments = [];
        let lastPixelX, firstPixelX;

        seriesY.forEach((pointYValue, pointIndex) => {
            const currentXValue = (processedXSeries[seriesIndex] || processedXSeries[0])[pointIndex];
            const pixelXCoord = canvasX + padding + (currentXValue - effectiveMinX) * horizontalScaleFactor;
            const pixelYCoord = canvasY + plotH - padding - (pointYValue - effectiveMinY) * verticalScaleFactor;

            if (pointIndex === 0) firstPixelX = pixelXCoord;
            lastPixelX = pixelXCoord;

            const currentMarkerType = isRaphaelArray(markerDesign, "array") ? markerDesign[seriesIndex] : markerDesign;
            const specificMarkerType = isRaphaelArray(currentMarkerType, "array") ? currentMarkerType[pointIndex] : currentMarkerType;

            if (specificMarkerType) {
                const markerDrawer = chartContext.g[Raphael.fn.g.markers[specificMarkerType]];
                seriesMarkersSet.push(markerDrawer(pixelXCoord, pixelYCoord, (configurations.lineWidth || 2) * 3).attr({
                    fill: seriesColorPalette[seriesIndex],
                    stroke: "none"
                }));
            }
            currentPathSegments.push(pointIndex === 0 ? "M" : "L", pixelXCoord, pixelYCoord);
        });

        renderedMarkers.push(seriesMarkersSet);

        if (configurations.showArea) {
            const areaPath = [...currentPathSegments, "L", lastPixelX, canvasY + plotH - padding, "L", firstPixelX, canvasY + plotH - padding, "z"].join(",");
            areaFillShapes[seriesIndex].attr({ path: areaPath });
        }

        if (!configurations.noStroke) {
            currentLineElement.attr({ path: currentPathSegments.join(",") });
        }
    });

    let generateColumnInteractionAreas = (callbackFunction) => {
        if (interactiveColumns && !callbackFunction) return;

        const uniqueXAxisValues = Array.from(new Set(adjustedXData.flat())).sort((a, b) => a - b);
        
        const columnInteractionSet = callbackFunction ? {} : chartContext.set();

        const pixelXPositions = uniqueXAxisValues.map(val => canvasX + padding + (val - effectiveMinX) * horizontalScaleFactor);

        uniqueXAxisValues.forEach((axisValue, idx) => {
            const currentPixelX = pixelXPositions[idx];
            const prevPixelX = pixelXPositions[idx - 1] || canvasX;
            const nextPixelX = pixelXPositions[idx + 1] || (canvasX + plotW);

            const columnLeftEdge = currentPixelX - (currentPixelX - prevPixelX) / 2;
            const columnWidth = ((nextPixelX - currentPixelX) / 2) + ((currentPixelX - prevPixelX) / 2);

            let columnElement;
            const columnData = {};

            if (!callbackFunction) {
                columnElement = chartContext.rect(columnLeftEdge - 1, canvasY, Math.max(columnWidth + 1, 1), plotH).attr({ stroke: "none", fill: "#000", opacity: 0 });
                columnInteractionSet.push(columnElement);
            } else {
                columnElement = columnData;
            }

            const aggregatedYValues = [];
            const aggregatedPixelYCoords = [];
            const associatedMarkerElements = chartContext.set();

            adjustedYData.forEach((seriesY, seriesIdx) => {
                const currentXSeries = adjustedXData[seriesIdx] || adjustedXData[0];
                seriesY.forEach((pointY, pointIdx) => {
                    if (currentXSeries[pointIdx] === axisValue) {
                        aggregatedYValues.push(pointY);
                        aggregatedPixelYCoords.push(canvasY + plotH - padding - (pointY - effectiveMinY) * verticalScaleFactor);
                        if (renderedMarkers[seriesIdx] && renderedMarkers[seriesIdx][pointIdx]) {
                            associatedMarkerElements.push(renderedMarkers[seriesIdx][pointIdx]);
                        }
                    }
                });
            });

            columnElement.dataValues = aggregatedYValues;
            columnElement.markerElements = associatedMarkerElements;
            columnElement.pixelYPositions = aggregatedPixelYCoords;
            columnElement.pixelXPosition = currentPixelX;
            columnElement.xAxisValue = axisValue;

            if (callbackFunction) {
                callbackFunction.call(columnElement);
            }
        });

        if (!callbackFunction) {
            interactiveColumns = columnInteractionSet;
        }
    };

    let generatePointInteractionAreas = (callbackFunction) => {
        if (interactivePoints && !callbackFunction) return;

        const pointInteractionSet = callbackFunction ? {} : chartContext.set();

        processedYSeries.forEach((seriesY, seriesIdx) => {
            seriesY.forEach((pointYValue, pointIdx) => {
                const currentXValue = (processedXSeries[seriesIdx] || processedXSeries[0])[pointIdx];
                const pixelXCoord = canvasX + padding + (currentXValue - effectiveMinX) * horizontalScaleFactor;
                const pixelYCoord = canvasY + plotH - padding - (pointYValue - effectiveMinY) * verticalScaleFactor;

                const prevXValue = (processedXSeries[seriesIdx] || processedXSeries[0])[pointIdx ? pointIdx - 1 : 1];
                const prevPixelXCoord = canvasX + padding + (prevXValue - effectiveMinX) * horizontalScaleFactor;

                let pointElement;
                const pointData = {};

                if (!callbackFunction) {
                    pointElement = chartContext.circle(pixelXCoord, pixelYCoord, Math.abs(prevPixelXCoord - pixelXCoord) / 2).attr({ stroke: "none", fill: "#000", opacity: 0 });
                    pointInteractionSet.push(pointElement);
                } else {
                    pointElement = pointData;
                }

                pointElement.pixelX = pixelXCoord;
                pointElement.pixelY = pixelYCoord;
                pointElement.dataValue = pointYValue;
                pointElement.associatedLine = renderedLines[seriesIdx];
                pointElement.associatedAreaFill = areaFillShapes[seriesIdx];
                pointElement.individualMarker = renderedMarkers[seriesIdx][pointIdx];
                pointElement.seriesMarkers = renderedMarkers[seriesIdx];
                pointElement.xAxisValue = currentXValue;

                if (callbackFunction) {
                    callbackFunction.call(pointElement);
                }
            });
        });

        if (!callbackFunction) {
            interactivePoints = pointInteractionSet;
        }
    };

    overallChartElements.push(renderedLines, areaFillShapes, renderedMarkers, chartAxes, interactiveColumns, interactivePoints);

    overallChartElements.dataLines = renderedLines;
    overallChartElements.areaFillShapes = areaFillShapes;
    overallChartElements.markerElements = renderedMarkers;
    overallChartElements.chartAxes = chartAxes;

    overallChartElements.onColumnHover = function (enterHandler, exitHandler) {
        !interactiveColumns && generateColumnInteractionAreas();
        interactiveColumns.mouseover(enterHandler).mouseout(exitHandler);
        return this;
    };

    overallChartElements.onColumnClick = function (clickHandler) {
        !interactiveColumns && generateColumnInteractionAreas();
        interactiveColumns.click(clickHandler);
        return this;
    };

    overallChartElements.applyColumnLinks = function (linkData) {
        const linkItems = isRaphaelArray(arguments[0], "array") ? arguments[0] : Array.from(arguments);

        if (arguments.length === 1 && typeof linkData === "object" && !isRaphaelArray(linkData, "array")) {
            !interactiveColumns && generateColumnInteractionAreas();
            for (const colAxisVal in linkData) {
                interactiveColumns.forEach(col => {
                    if (col.xAxisValue == colAxisVal) {
                        col.attr("href", linkData[colAxisVal]);
                    }
                });
            }
        } else {
            !interactiveColumns && generateColumnInteractionAreas();
            linkItems.forEach((link, idx) => {
                if (interactiveColumns[idx]) {
                    interactiveColumns[idx].attr("href", link);
                }
            });
        }
        return this;
    };

    overallChartElements.onPointHover = function (enterHandler, exitHandler) {
        !interactivePoints && generatePointInteractionAreas();
        interactivePoints.mouseover(enterHandler).mouseout(exitHandler);
        return this;
    };

    overallChartElements.onPointClick = function (clickHandler) {
        !interactivePoints && generatePointInteractionAreas();
        interactivePoints.click(clickHandler);
        return this;
    };

    overallChartElements.iteratePoints = function (iteratorFunction) {
        generatePointInteractionAreas(iteratorFunction);
        return this;
    };

    overallChartElements.iterateColumns = function (iteratorFunction) {
        generateColumnInteractionAreas(iteratorFunction);
        return this;
    };

    return overallChartElements;
};