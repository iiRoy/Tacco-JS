document.addEventListener('DOMContentLoaded', function() {
    const SVG_NAMESPACE_URI = 'http://www.w3.org/2000/svg';

    var GraphForge = GraphForge || {};

    GraphForge.createVisualizer = function(containerQuery, configParams) {
        var visualSettings = {
            drawingWidth: 240,
            drawingHeight: 120,
            plotMargins: [20, 20, 30, 50] // Top, Right, Bottom, Left
        };

        if (configParams) {
            if (configParams.width != null) { visualSettings.drawingWidth = configParams.width; }
            if (configParams.height != null) { visualSettings.drawingHeight = configParams.height; }
            if (configParams.margin != null) { visualSettings.plotMargins = configParams.margin; }
        }

        let hostElement = document.querySelector(containerQuery);
        if (!hostElement) {
            console.error("Host element not found for selector: " + containerQuery);
            return;
        }

        let chartCanvas = document.createElementNS(SVG_NAMESPACE_URI, 'svg');
        let totalWidth = visualSettings.drawingWidth + visualSettings.plotMargins[1] + visualSettings.plotMargins[3];
        let totalHeight = visualSettings.drawingHeight + visualSettings.plotMargins[0] + visualSettings.plotMargins[2];
        chartCanvas.setAttribute('width', totalWidth);
        chartCanvas.setAttribute('height', totalHeight);
        hostElement.appendChild(chartCanvas);

        let mainGroup = document.createElementNS(SVG_NAMESPACE_URI, 'g');
        mainGroup.setAttribute('transform', `translate(${visualSettings.plotMargins[3]},${visualSettings.plotMargins[0]})`);
        chartCanvas.appendChild(mainGroup);

        let verticalAxisComponent = document.createElementNS(SVG_NAMESPACE_URI, 'g');
        verticalAxisComponent.setAttribute('class', 'vertical-axis');
        mainGroup.appendChild(verticalAxisComponent);

        let dataLineComponent = document.createElementNS(SVG_NAMESPACE_URI, 'path');
        dataLineComponent.setAttribute('class', 'data-trace');
        mainGroup.appendChild(dataLineComponent);

        return {
            refreshDisplay: function(incomingData) {
                if (!Array.isArray(incomingData) || incomingData.length === 0) {
                    dataLineComponent.setAttribute('d', '');
                    while (verticalAxisComponent.firstChild) {
                        verticalAxisComponent.removeChild(verticalAxisComponent.firstChild);
                    }
                    return;
                }

                let currentDataMin = incomingData.reduce((a, b) => Math.min(a, b), Infinity);
                let currentDataMax = incomingData.reduce((a, b) => Math.max(a, b), -Infinity);
                let currentDataLength = incomingData.length;

                let maxIndexDomain = (currentDataLength > 1) ? (currentDataLength - 1) : 0;
                let maxRangeX = currentDataLength * visualSettings.drawingWidth / 60;

                let calculateXPosition = (index) => {
                    if (maxIndexDomain === 0) return 0;
                    return (index / maxIndexDomain) * maxRangeX;
                };

                let calculateYPosition = (value) => {
                    if (currentDataMin === currentDataMax) {
                        return visualSettings.drawingHeight / 2;
                    }
                    return visualSettings.drawingHeight - ((value - currentDataMin) / (currentDataMax - currentDataMin)) * visualSettings.drawingHeight;
                };

                let pathSegments = incomingData.map((val, idx) => {
                    let coordinateX = calculateXPosition(idx);
                    let coordinateY = calculateYPosition(val);
                    return `${coordinateX},${coordinateY}`;
                }).join('L');
                dataLineComponent.setAttribute('d', `M${pathSegments}`);

                while (verticalAxisComponent.firstChild) {
                    verticalAxisComponent.removeChild(verticalAxisComponent.firstChild);
                }

                let tickValues = [];
                tickValues.push(currentDataMin);
                if (currentDataMin !== currentDataMax) {
                    tickValues.push(currentDataMax);
                }

                tickValues.forEach(tickVal => {
                    let tickY = calculateYPosition(tickVal);

                    let lineTick = document.createElementNS(SVG_NAMESPACE_URI, 'line');
                    lineTick.setAttribute('x1', 0);
                    lineTick.setAttribute('y1', tickY);
                    lineTick.setAttribute('x2', -6);
                    lineTick.setAttribute('y2', tickY);
                    lineTick.setAttribute('stroke', 'currentColor');
                    verticalAxisComponent.appendChild(lineTick);

                    let textTick = document.createElementNS(SVG_NAMESPACE_URI, 'text');
                    textTick.setAttribute('x', -9);
                    textTick.setAttribute('y', tickY);
                    textTick.setAttribute('dy', '.32em');
                    textTick.setAttribute('text-anchor', 'end');
                    textTick.textContent = tickVal;
                    verticalAxisComponent.appendChild(textTick);
                });
            },

            destroy: function() {
                if (chartCanvas && hostElement) {
                    hostElement.removeChild(chartCanvas);
                }
            }
        };
    };
});