function protectMarkup(input) {
    let resultText = String(input);
    resultText = resultText.replaceAll("&", "&amp;");
    resultText = resultText.replaceAll("<", "&lt;");
    resultText = resultText.replaceAll(">", "&gt;");
    resultText = resultText.replaceAll('"', '&quot;');
    resultText = resultText.replaceAll("'", '&#39;');
    resultText = resultText.replaceAll("/", '&#x2F;');
    return resultText;
}

function createNumericScale(inputMin, inputMax, outputMin, outputMax) {
    const inputRange = inputMax - inputMin;
    const outputRange = outputMax - outputMin;

    const scaleFunction = (value) => {
        if (inputRange === 0) return outputMin;
        return outputMin + ((value - inputMin) / inputRange) * outputRange;
    };

    scaleFunction.domain = () => [inputMin, inputMax];
    scaleFunction.range = () => [outputMin, outputMax];

    scaleFunction.ticks = (count) => {
        const start = inputMin;
        const end = inputMax;
        const step = (end - start) / (count - 1);
        const generatedTicks = [];
        for (let i = 0; i < count; i++) {
            generatedTicks.push(start + i * step);
        }
        return generatedTicks;
    };

    return scaleFunction;
}

function createVisualKey(hostElement) {
    const keyProps = {
        displayGroups: false,
        hasBorder: true,
        useTransparency: false,
        transparencyLevel: 0.6,
        visualWidth: 300
    };

    const borderThickness = 2;
    const itemWidth = 22;
    const itemHeight = 16;

    const renderKey = (seriesData) => {
        const wrapElement = document.querySelector(hostElement);
        if (!wrapElement) throw new Error("Host element not found for visual key.");
        wrapElement.className = 'visual-key-wrapper';

        const keyPanel = document.createElement("div");
        keyPanel.className = 'visual-key-panel';
        keyPanel.style.width = keyProps.visualWidth + 'px';
        wrapElement.appendChild(keyPanel);

        seriesData.forEach((item, index) => {
            const entryRow = document.createElement("div");
            keyPanel.appendChild(entryRow);

            const itemSymbolContainer = document.createElement("div");
            itemSymbolContainer.className = 'visual-key-symbol-container';
            entryRow.appendChild(itemSymbolContainer);

            const svgSymbol = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svgSymbol.setAttribute('width', itemWidth);
            svgSymbol.setAttribute('height', itemHeight);
            itemSymbolContainer.appendChild(svgSymbol);

            const rectSymbol = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rectSymbol.setAttribute("x", borderThickness / 2);
            rectSymbol.setAttribute("y", borderThickness / 2);
            rectSymbol.setAttribute("rx", 3);
            rectSymbol.setAttribute("ry", 3);
            rectSymbol.setAttribute("width", (itemWidth - borderThickness));
            rectSymbol.setAttribute("height", (itemHeight - borderThickness));
            rectSymbol.style.fill = item.color;

            if (keyProps.hasBorder === true) {
                rectSymbol.setAttribute("stroke", item.color);
                rectSymbol.style.strokeWidth = borderThickness + 'px';
            }
            if (keyProps.useTransparency === true) {
                rectSymbol.style.fillOpacity = keyProps.transparencyLevel;
            }
            svgSymbol.appendChild(rectSymbol);

            const labelParts = [];
            let partIndex = -1;
            labelParts[++partIndex] = protectMarkup(item.label);
            if (keyProps.displayGroups === true) {
                labelParts[++partIndex] = ' - ' + protectMarkup(item.group);
            }
            if (item.units) {
                labelParts[++partIndex] = ' (' + protectMarkup(item.units) + ')';
            }

            const labelSpan = document.createElement("span");
            labelSpan.innerHTML = labelParts.join('');
            labelSpan.className = 'visual-key-label-text';
            entryRow.appendChild(labelSpan);
        });
    };

    return {
        config: keyProps,
        present: renderKey
    };
}

function makeSingleAxis(drawingCanvas) {
    const axisSettings = {
        displayTicks: true,
        tickQuantity: 5,
        positionOffset: 0
    };

    const renderAxisLines = (dataScale, orientation, tickDensity) => {
        const graphArea = drawingCanvas.getGraphElement();
        const innerHeight = drawingCanvas.getInnerGraphHeight();
        const innerWidth = drawingCanvas.getInnerGraphWidth();

        if (orientation === 'bottom') {
            const axisLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            axisLine.setAttribute('x1', 0);
            axisLine.setAttribute('y1', innerHeight);
            axisLine.setAttribute('x2', innerWidth);
            axisLine.setAttribute('y2', innerHeight);
            axisLine.setAttribute('class', 'graph-fake-axis');
            graphArea.appendChild(axisLine);
        }

        const axisGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        axisGroup.setAttribute("class", "graph-coord-axis");

        if (orientation === 'bottom') {
            axisGroup.setAttribute('transform', `translate(${axisSettings.positionOffset}, ${innerHeight})`);
        }
        graphArea.appendChild(axisGroup);

        const ticks = dataScale.ticks(tickDensity);
        const tickLength = 6;

        ticks.forEach((tickVal) => {
            const coord = dataScale(tickVal instanceof Date ? tickVal.getTime() : tickVal);

            const tickLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            const tickLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
            tickLabel.textContent = tickVal instanceof Date ? tickVal.toLocaleDateString() : tickVal.toLocaleString();

            if (orientation === 'bottom') {
                tickLine.setAttribute('x1', coord);
                tickLine.setAttribute('y1', 0);
                tickLine.setAttribute('x2', coord);
                tickLine.setAttribute('y2', tickLength);
                tickLabel.setAttribute('x', coord);
                tickLabel.setAttribute('y', tickLength + 3);
                tickLabel.setAttribute('dy', '0.71em');
                tickLabel.style.textAnchor = 'middle';
            } else {
                tickLine.setAttribute('x1', 0);
                tickLine.setAttribute('y1', coord);
                tickLine.setAttribute('x2', -tickLength);
                tickLine.setAttribute('y2', coord);
                tickLabel.setAttribute('x', -tickLength - 3);
                tickLabel.setAttribute('y', coord);
                tickLabel.setAttribute('dy', '0.32em');
                tickLabel.style.textAnchor = 'end';
            }
            tickLine.setAttribute('class', 'graph-tick-line');
            tickLabel.setAttribute('class', 'graph-tick-label');

            axisGroup.appendChild(tickLine);
            axisGroup.appendChild(tickLabel);
        });
    };

    const renderGridLines = (dataScale, orientation) => {
        if (axisSettings.displayTicks) {
            const graphArea = drawingCanvas.getGraphElement();
            const innerHeight = drawingCanvas.getInnerGraphHeight();
            const innerWidth = drawingCanvas.getInnerGraphWidth();

            const gridGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            gridGroup.setAttribute('class', `graph-grid-lines graph-${orientation}-grid`);

            if (orientation === 'bottom') {
                gridGroup.setAttribute('transform', `translate(${axisSettings.positionOffset}, ${innerHeight})`);
            }
            graphArea.appendChild(gridGroup);

            const ticks = dataScale.ticks(axisSettings.tickQuantity);

            ticks.forEach((tickVal) => {
                const coord = dataScale(tickVal instanceof Date ? tickVal.getTime() : tickVal);
                const gridLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
                gridLine.setAttribute('class', 'graph-grid-line');

                if (orientation === 'bottom') {
                    gridLine.setAttribute('x1', coord);
                    gridLine.setAttribute('y1', 0);
                    gridLine.setAttribute('x2', coord);
                    gridLine.setAttribute('y2', -innerHeight);
                } else {
                    gridLine.setAttribute('x1', 0);
                    gridLine.setAttribute('y1', coord);
                    gridLine.setAttribute('x2', innerWidth);
                    gridLine.setAttribute('y2', coord);
                }
                gridGroup.appendChild(gridLine);
            });
        }
    };

    return {
        config: axisSettings,
        drawComponent: renderAxisLines,
        drawGridComponent: renderGridLines,
        setOffset: (val) => { axisSettings.positionOffset = val; }
    };
}

function makeCoordinateSystem(graphCanvas) {
    const horizontalAxis = makeSingleAxis(graphCanvas);
    const verticalAxis = makeSingleAxis(graphCanvas);

    const renderAllAxes = (horizScale, vertScale) => {
        horizontalAxis.drawComponent(horizScale, 'bottom', 5);
        verticalAxis.drawComponent(vertScale, 'left', 5);
    };

    const renderAllGrids = (horizScale, vertScale) => {
        horizontalAxis.drawGridComponent(horizScale, 'bottom');
        verticalAxis.drawGridComponent(vertScale, 'left');
    };

    return {
        horizontal: horizontalAxis,
        vertical: verticalAxis,
        drawBoth: renderAllAxes,
        drawBothGrids: renderAllGrids
    };
}

function createChartCanvas(targetContainer) {
    const canvasConfig = {
        isCircular: false,
        showHeading: true,
        showXAxisTitle: true,
        showYAxisTitle: true,

        hostElement: targetContainer,
        padding: { top: 14, right: 25, bottom: 35, left: 45 },
        drawAreaWidth: 600,
        drawAreaHeight: 400,
        circleRadius: 150,

        chartTitle: 'Main Graph',
        horizontalLabel: 'Horizontal Axis',
        verticalLabel: 'Vertical Axis',
    };

    const titleHeight = 20;
    let mainSvgElement;

    const calculateInnerWidth = () => {
        const yAxisTitleWidth = canvasConfig.showYAxisTitle ? titleHeight : 0;
        return canvasConfig.drawAreaWidth - yAxisTitleWidth - canvasConfig.padding.left - canvasConfig.padding.right;
    };

    const calculateInnerHeight = () => {
        const headingHeight = canvasConfig.showHeading ? titleHeight : 0;
        const xAxisTitleHeight = canvasConfig.showXAxisTitle ? titleHeight : 0;
        return canvasConfig.drawAreaHeight - headingHeight - xAxisTitleHeight - canvasConfig.padding.top - canvasConfig.padding.bottom;
    };

    const canvasProxy = {
        getGraphElement: () => mainSvgElement,
        getInnerGraphWidth: calculateInnerWidth,
        getInnerGraphHeight: calculateInnerHeight,
        settings: canvasConfig
    };
    const coordinateSystem = makeCoordinateSystem(canvasProxy);

    const renderBaseLayout = () => {
        const rootContainer = document.querySelector(canvasConfig.hostElement);
        if (!rootContainer) throw new Error("Host element not found for chart canvas.");
        rootContainer.className = 'graph-root-container';

        const graphWrapper = document.createElement("div");
        graphWrapper.className = 'graph-plot-wrapper graph-clear-after';
        rootContainer.appendChild(graphWrapper);

        const leftPanel = document.createElement("div");
        leftPanel.className = 'graph-left-panel';
        if (canvasConfig.showYAxisTitle) {
            leftPanel.style.width = titleHeight + 'px';
            const yLabelDiv = document.createElement("div");
            yLabelDiv.innerHTML = protectMarkup(canvasConfig.verticalLabel);
            yLabelDiv.className = 'graph-y-label';
            yLabelDiv.style.height = titleHeight + 'px';
            yLabelDiv.style.lineHeight = titleHeight + 'px';
            yLabelDiv.style.width = (calculateInnerHeight() + canvasConfig.padding.top + canvasConfig.padding.bottom) + 'px';
            leftPanel.appendChild(yLabelDiv);
        }
        graphWrapper.appendChild(leftPanel);

        const centralPanel = document.createElement("div");
        centralPanel.className = 'graph-central-panel';
        if (canvasConfig.showHeading) {
            const titleDiv = document.createElement("div");
            titleDiv.innerHTML = protectMarkup(canvasConfig.chartTitle);
            titleDiv.className = 'graph-title-heading';
            titleDiv.style.height = titleHeight + 'px';
            titleDiv.style.lineHeight = titleHeight + 'px';
            centralPanel.appendChild(titleDiv);
        }

        const svgWrapper = document.createElement("div");
        svgWrapper.className = 'graph-svg-wrapper';
        centralPanel.appendChild(svgWrapper);

        if (canvasConfig.showXAxisTitle) {
            const xLabelDiv = document.createElement("div");
            xLabelDiv.innerHTML = protectMarkup(canvasConfig.horizontalLabel);
            xLabelDiv.className = 'graph-x-label';
            xLabelDiv.style.height = titleHeight + 'px';
            xLabelDiv.style.lineHeight = titleHeight + 'px';
            centralPanel.appendChild(xLabelDiv);
        }
        graphWrapper.appendChild(centralPanel);

        const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgElement.setAttribute('width', calculateInnerWidth() + canvasConfig.padding.left + canvasConfig.padding.right);
        svgElement.setAttribute('height', calculateInnerHeight() + canvasConfig.padding.top + canvasConfig.padding.bottom);
        svgWrapper.appendChild(svgElement);

        svgWrapper.addEventListener("mousemove", (evt) => {
            const tooltip = document.querySelector(".data-tooltip");
            if (tooltip) {
                tooltip.style.left = (evt.pageX) + "px";
                tooltip.style.top = (evt.pageY) + "px";
            }
        });

        mainSvgElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
        if (canvasConfig.isCircular === false) {
            mainSvgElement.setAttribute("transform", `translate(${canvasConfig.padding.left},${canvasConfig.padding.top})`);
        } else {
            mainSvgElement.setAttribute("transform", `translate(${canvasConfig.circleRadius},${canvasConfig.circleRadius})`);
        }
        svgElement.appendChild(mainSvgElement);
    };

    return {
        settings: canvasConfig,
        getInnerGraphWidth: calculateInnerWidth,
        getInnerGraphHeight: calculateInnerHeight,
        drawBase: renderBaseLayout,
        getGraphElement: () => mainSvgElement,
        coordinateSystem: coordinateSystem
    };
}

function prepareChartData() {
    let rawSeriesData;
    const dataProcessorConfig = {
        isStackedMode: false,
        stackByGroupKey: false,
        stackLayoutMethod: 'zero'
    };

    let cachedXExtent = [0, 0];
    let cachedYExtent = [0, 0];
    let cachedGroupKeys = [];

    const parseDateTimeString = (dateString) => {
        const parts = dateString.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
        if (parts) {
            return new Date(
                parseInt(parts[1]),
                parseInt(parts[2]) - 1,
                parseInt(parts[3]),
                parseInt(parts[4]),
                parseInt(parts[5]),
                parseInt(parts[6])
            );
        }
        return new Date(dateString);
    };

    const processDates = () => {
        rawSeriesData.forEach((series) => {
            series.values.forEach((value) => {
                value.x = parseDateTimeString(value.x);
            });
        });
    };

    const collectGroupKeys = () => {
        const groups = new Set();
        rawSeriesData.forEach(series => {
            if (series.group) {
                groups.add(series.group);
            }
        });
        cachedGroupKeys = Array.from(groups);
    };

    const calculateXBounds = () => {
        let minX = Infinity;
        let maxX = -Infinity;
        rawSeriesData.forEach(series => {
            series.values.forEach(value => {
                const time = value.x instanceof Date ? value.x.getTime() : value.x;
                if (time < minX) minX = time;
                if (time > maxX) maxX = time;
            });
        });
        cachedXExtent = [minX, maxX];
    };

    const calculateYBounds = () => {
        let minY = Infinity;
        let maxY = -Infinity;
        rawSeriesData.forEach(series => {
            series.values.forEach(value => {
                const yVal = dataProcessorConfig.isStackedMode ? (value.y0 + value.y) : value.y;
                if (yVal < minY) minY = yVal;
                if (yVal > maxY) maxY = yVal;
            });
        });
        cachedYExtent = [minY, maxY];
    };

    const performStacking = () => {
        if (!dataProcessorConfig.isStackedMode) return;

        if (rawSeriesData.length === 0 || rawSeriesData[0].values.length === 0) return;

        const numSamples = rawSeriesData[0].values.length;

        rawSeriesData.forEach(series => {
            series.values.forEach(value => {
                value.y0 = 0;
            });
        });

        for (let i = 0; i < numSamples; i++) {
            let currentBase = 0;
            rawSeriesData.forEach(series => {
                const point = series.values[i];
                point.y0 = currentBase;
                currentBase += point.y;
            });
        }
    };

    const initializeData = (inputDataArray) => {
        rawSeriesData = inputDataArray;
        processDates();
        collectGroupKeys();
        if (dataProcessorConfig.isStackedMode) {
            performStacking();
        }
        calculateXBounds();
        calculateYBounds();
    };

    const retrieveProcessedData = () => rawSeriesData;
    const getSamplePointCount = () => rawSeriesData[0] ? rawSeriesData[0].values.length : 0;
    const getGroupKeyCount = () => cachedGroupKeys.length;
    const getGroupKeyList = () => cachedGroupKeys;
    const getXRange = () => cachedXExtent;
    const getYRange = () => cachedYExtent;

    return {
        config: dataProcessorConfig,
        setup: initializeData,
        getSeries: retrieveProcessedData,
        getSampleCount: getSamplePointCount,
        getGroupCount: getGroupKeyCount,
        getGroups: getGroupKeyList,
        getXExtent: getXRange,
        getYExtent: getYRange,
        recalculate: () => {
            if (dataProcessorConfig.isStackedMode) {
                performStacking();
            }
            calculateXBounds();
            calculateYBounds();
        }
    };
}

function drawGraphLines(drawingCanvas) {
    let processedData;
    const lineConfig = {
        shouldDisplay: true,
        lineInterpolation: 'linear',
        strokeThickness: 2
    };

    const setupLineData = (dataObject) => {
        if (lineConfig.shouldDisplay) {
            processedData = dataObject;
        }
    };

    const renderLines = (horizScale, vertScale) => {
        if (lineConfig.shouldDisplay && processedData) {
            const graphArea = drawingCanvas.getGraphElement();

            processedData.getSeries().forEach((series) => {
                let pathD = '';
                series.values.forEach((point, index) => {
                    const xCoord = horizScale(point.x instanceof Date ? point.x.getTime() : point.x);
                    const yVal = processedData.config.isStackedMode ? (point.y0 + point.y) : point.y;
                    const yCoord = vertScale(yVal);

                    if (index === 0) {
                        pathD += `M${xCoord},${yCoord}`;
                    } else {
                        pathD += `L${xCoord},${yCoord}`;
                    }
                });

                const lineElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
                lineElement.setAttribute("class", "graph-line-segment");
                lineElement.style.stroke = series.color;
                lineElement.style.strokeWidth = lineConfig.strokeThickness + 'px';
                lineElement.style.fill = 'none';
                lineElement.setAttribute("d", pathD);
                graphArea.appendChild(lineElement);
            });
        }
    };

    return {
        config: lineConfig,
        initData: setupLineData,
        render: renderLines
    };
}

function drawGraphAreas(drawingCanvas) {
    let processedData;
    const areaConfig = {
        shouldDisplay: false,
        areaInterpolation: 'linear',
        useTransparency: false,
        transparencyLevel: 0.6
    };

    const setupAreaData = (dataObject) => {
        if (areaConfig.shouldDisplay) {
            processedData = dataObject;
        }
    };

    const renderAreas = (horizScale, vertScale) => {
        if (areaConfig.shouldDisplay && processedData) {
            const graphArea = drawingCanvas.getGraphElement();
            const innerHeight = drawingCanvas.getInnerGraphHeight();

            processedData.getSeries().forEach((series) => {
                let pathD = '';
                series.values.forEach((point, index) => {
                    const xCoord = horizScale(point.x instanceof Date ? point.x.getTime() : point.x);
                    const yVal = processedData.config.isStackedMode ? (point.y0 + point.y) : point.y;
                    const yCoord = vertScale(yVal);

                    if (index === 0) {
                        pathD += `M${xCoord},${yCoord}`;
                    } else {
                        pathD += `L${xCoord},${yCoord}`;
                    }
                });

                if (processedData.config.isStackedMode) {
                    for (let i = series.values.length - 1; i >= 0; i--) {
                        const point = series.values[i];
                        const xCoord = horizScale(point.x instanceof Date ? point.x.getTime() : point.x);
                        const y0Coord = vertScale(point.y0);
                        pathD += `L${xCoord},${y0Coord}`;
                    }
                } else {
                    for (let i = series.values.length - 1; i >= 0; i--) {
                        const point = series.values[i];
                        const xCoord = horizScale(point.x instanceof Date ? point.x.getTime() : point.x);
                        pathD += `L${xCoord},${innerHeight}`;
                    }
                }
                pathD += 'Z';

                const areaElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
                areaElement.setAttribute("class", "graph-area-shape");
                areaElement.style.fill = series.color;
                areaElement.setAttribute("d", pathD);
                if (areaConfig.useTransparency) {
                    areaElement.style.fillOpacity = areaConfig.transparencyLevel;
                }
                graphArea.appendChild(areaElement);
            });
        }
    };

    return {
        config: areaConfig,
        initData: setupAreaData,
        render: renderAreas
    };
}

function drawGraphPoints(drawingCanvas) {
    let processedData;
    const pointConfig = {
        shouldDisplay: false,
        pointSize: 4,
        fillPoints: false
    };

    let tooltipElement = null;

    const setupPointData = (dataObject) => {
        if (pointConfig.shouldDisplay) {
            processedData = dataObject;
            if (!tooltipElement) {
                const rootContainer = document.querySelector(drawingCanvas.settings.hostElement);
                if (rootContainer) {
                    tooltipElement = document.createElement("div");
                    tooltipElement.className = "data-tooltip";
                    tooltipElement.innerHTML = "<p>Data Info</p>";
                    tooltipElement.style.position = 'absolute';
                    tooltipElement.style.display = 'none';
                    tooltipElement.style.opacity = 0;
                    rootContainer.appendChild(tooltipElement);
                }
            }
        }
    };

    const handlePointHover = function(evt, dataPoint) {
        const pointCircle = evt.target;
        pointCircle.setAttribute("r", 10);

        if (tooltipElement) {
            tooltipElement.style.display = "block";
            setTimeout(() => {
                tooltipElement.style.opacity = 1;
            }, 200);

            const dateObj = new Date(dataPoint.x);
            const dateStr = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString()}`;

            const tooltipContent = tooltipElement.querySelector("p");
            if (tooltipContent) {
                tooltipContent.innerHTML = `<strong>Time:</strong> ${dateStr}<br/><strong>Value:</strong> ${dataPoint.y}`;
            }
        }
    };

    const handlePointLeave = function(evt) {
        const pointCircle = evt.target;
        pointCircle.setAttribute("r", pointConfig.pointSize);

        if (tooltipElement) {
            tooltipElement.style.display = "none";
            tooltipElement.style.opacity = 0;
        }
    };

    const renderPoints = (horizScale, vertScale) => {
        if (pointConfig.shouldDisplay && processedData) {
            const graphArea = drawingCanvas.getGraphElement();

            processedData.getSeries().forEach((series) => {
                series.values.forEach((point) => {
                    const xCoord = horizScale(point.x instanceof Date ? point.x.getTime() : point.x);
                    const yVal = processedData.config.isStackedMode ? (point.y0 + point.y) : point.y;
                    const yCoord = vertScale(yVal);

                    const circleElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    circleElement.setAttribute("cx", xCoord);
                    circleElement.setAttribute("cy", yCoord);
                    circleElement.setAttribute("r", pointConfig.pointSize);
                    circleElement.style.stroke = series.color;

                    if (pointConfig.fillPoints) {
                        circleElement.style.fill = series.color;
                    } else {
                        circleElement.style.fill = "white";
                    }
                    circleElement.setAttribute("class", "graph-data-point");

                    circleElement.addEventListener("mouseover", (evt) => handlePointHover(evt, point));
                    circleElement.addEventListener("mouseout", handlePointLeave);

                    graphArea.appendChild(circleElement);
                });
            });
        }
    };

    return {
        config: pointConfig,
        initData: setupPointData,
        render: renderPoints
    };
}

function drawGraphBars(drawingCanvas) {
    let processedData;
    const barConfig = {
        shouldDisplay: false,
        hasBorder: true,
        borderThickness: 2,
        useTransparency: false,
        transparencyLevel: 0.6
    };

    let sampleCellWidth;
    let groupCellWidth;
    let individualBarWidth;

    const outerPadding = 20;
    const innerPadding = 5;

    const initializeBarMetrics = (dataObject) => {
        if (barConfig.shouldDisplay) {
            processedData = dataObject;
            const sampleCount = processedData.getSampleCount();
            const groupCount = processedData.getGroupCount();

            sampleCellWidth = drawingCanvas.getInnerGraphWidth() / sampleCount;
            groupCellWidth = (sampleCellWidth - (2 * outerPadding));
            individualBarWidth = (groupCellWidth / groupCount) - innerPadding + (innerPadding / groupCount);

            drawingCanvas.coordinateSystem.horizontal.setOffset(sampleCellWidth / 2);
        }
    };

    const renderBars = (horizScale, vertScale) => {
        if (barConfig.shouldDisplay && processedData) {
            const graphArea = drawingCanvas.getGraphElement();

            const groupOrder = processedData.getGroups();

            processedData.getSeries().forEach((series) => {
                series.values.forEach((value) => {
                    const barElement = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                    barElement.setAttribute("class", "graph-bar-element");
                    barElement.style.fill = series.color;

                    const xPos = horizScale(value.x instanceof Date ? value.x.getTime() : value.x) + outerPadding;
                    const groupIndex = groupOrder.indexOf(series.group);
                    const finalX = xPos + (individualBarWidth + innerPadding) * groupIndex;

                    const barTopY = vertScale(processedData.config.isStackedMode ? (value.y0 + value.y) : value.y);
                    const barBottomY = vertScale(processedData.config.isStackedMode ? value.y0 : 0);
                    const barHeight = barBottomY - barTopY;

                    barElement.setAttribute("x", finalX);
                    barElement.setAttribute("width", individualBarWidth);
                    barElement.setAttribute("y", barTopY);
                    barElement.setAttribute("height", barHeight);

                    if (barConfig.hasBorder) {
                        barElement.style.stroke = series.color;
                        barElement.style.strokeWidth = barConfig.borderThickness + 'px';
                    }
                    if (barConfig.useTransparency) {
                        barElement.style.fillOpacity = barConfig.transparencyLevel;
                    }
                    graphArea.appendChild(barElement);
                });
            });
        }
    };

    return {
        config: barConfig,
        initMetrics: initializeBarMetrics,
        render: renderBars,
        getSampleBarWidth: () => sampleCellWidth
    };
}