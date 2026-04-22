window.ChartCrafter = window.ChartCrafter || {};

ChartCrafter.labelLookup = (inputKey) => {
    const termMap = new Map([
        ['pmu', 'Peak Memory Use'],
        ['mu', 'Memory Use'],
        ['cpu', 'CPU time'],
        ['wt', 'Wall time'],
        ['epmu', 'Exclusive peak memory use'],
        ['emu', 'Exclusive memory use'],
        ['ecpu', 'Exclusive CPU'],
        ['ewt', 'Exclusive wall time']
    ]);
    return termMap.has(inputKey) ? termMap.get(inputKey) : 'Unknown';
};

ChartCrafter.paletteGenerator = () => {
    const primaryShades = {
        sky: '#59bdd2',
        forest: '#637964',
        lava: '#d46245',
        sun: '#ffe85e',
        terra: '#e9814f',
        blush: '#e3b7b3',
        grape: '#b63c71'
    };
    const shadeArray = Object.values(primaryShades);
    return d3.scale.ordinal().range(shadeArray);
};

ChartCrafter.dateFormatter = (() => {
    const yearComponent = '%y';
    const monthComponent = '%m';
    const dayComponent = '%d';
    const hourComponent = '%H';
    const minuteComponent = '%M';
    const secondComponent = '%S';
    const completeFormatString = `${yearComponent}-${monthComponent}-${dayComponent} ${hourComponent}:${minuteComponent}:${secondComponent}`;
    return d3.time.format(completeFormatString);
})();

ChartCrafter.timeFormatSetting = null;

ChartCrafter.numericPrettyPrint = (valueToFormat, places = 2) => {
    const numberValue = Number(valueToFormat);
    if (isNaN(numberValue)) {
        return String(valueToFormat);
    }

    const baseFormatterOptions = {
        minimumFractionDigits: places,
        maximumFractionDigits: places,
        useGrouping: false
    };

    const formattedStringNoGrouping = numberValue.toLocaleString('en-US', baseFormatterOptions);

    if (Math.abs(numberValue) < 1000) {
        return formattedStringNoGrouping;
    } else {
        const groupedFormatterOptions = { ...baseFormatterOptions, useGrouping: true };
        return numberValue.toLocaleString('en-US', groupedFormatterOptions);
    }
};

ChartCrafter.insertGraphicalKey = (drawingSurface, captionText, totalHeight, viewportMargins, pigment) => {
    if (!captionText) {
        return;
    }

    const verticalPlacement = totalHeight + viewportMargins.bottom - 3;

    let horizontalAccumulation = 0;

    const existingKeyGroups = drawingSurface.selectAll('.key-group-item');
    if (existingKeyGroups.nodes().length > 0) {
        const lastGroupElement = existingKeyGroups.nodes()[existingKeyGroups.nodes().length - 1];
        const lastElementBox = lastGroupElement.getBBox();
        horizontalAccumulation = lastElementBox.x + lastElementBox.width + 20;
    }

    const newGroup = drawingSurface.append('g')
        .attr('class', 'key-group-item');

    newGroup.append('circle')
        .attr('fill', pigment)
        .attr('r', 3)
        .attr('cx', 0)
        .attr('cy', -5);

    newGroup.append('text')
        .attr('x', 5)
        .attr('y', 0)
        .text(captionText);

    newGroup.attr('transform', `translate(${horizontalAccumulation}, ${verticalPlacement})`);
};

class TipManager {
    constructor(hostElement, config) {
        if (!config.displayContent || !config.positionCalculator || !config.triggerElements) {
            throw new Error('Required configuration properties missing for TipManager: displayContent, positionCalculator, triggerElements.');
        }

        this.host = d3.select(hostElement);
        this.config = config;
        this.tooltipFrame = null;
        this.contentArea = null;

        this.initializeComponents();
        this.attachEventHandlers();
    }

    initializeComponents() {
        const existingContainer = this.host.select('#chart-info-panel');
        let panelElement;
        let contentElement;

        if (existingContainer.empty()) {
            panelElement = this.host.append('div');

            panelElement.attr('class', 'info-panel top')
                .attr('id', 'chart-info-panel')
                .append('div').attr('class', 'panel-arrow');

            contentElement = panelElement.append('div')
                .attr('class', 'panel-body');

            this.host.on('mouseout', this.blockEvent);
            panelElement.on('mouseout', this.blockEvent);
        } else {
            panelElement = existingContainer;
            contentElement = existingContainer.select('.panel-body');
        }
        this.tooltipFrame = panelElement;
        this.contentArea = contentElement;
    }

    blockEvent() {
        d3.event.stopPropagation();
    }

    hidePanel() {
        this.tooltipFrame.transition().style('opacity', 0);
        d3.select(document).on('mouseout', null);
    }

    attachEventHandlers() {
        this.config.triggerElements.on('mouseover', (dataItem, index) => {
            let topPosition, leftPosition;
            let currentPanelHeight, currentPanelWidth;
            let renderedContent, calculatedPosition;

            renderedContent = this.config.displayContent.call(d3.event.target, dataItem, index);

            this.contentArea.html(renderedContent);
            this.tooltipFrame.style({
                display: 'block',
                opacity: 1
            });

            calculatedPosition = this.config.positionCalculator.call(d3.event.target, dataItem, index, { frame: this.tooltipFrame, content: this.contentArea });

            currentPanelWidth = parseInt(this.tooltipFrame.style('width'), 10);
            currentPanelHeight = parseInt(this.tooltipFrame.style('height'), 10);

            const containerNode = this.host.node();

            topPosition = containerNode.offsetTop + calculatedPosition.y - (currentPanelHeight / 2) - 7;
            leftPosition = containerNode.offsetLeft + calculatedPosition.x - (currentPanelWidth / 2) + 5;

            this.tooltipFrame.style({
                top: `${topPosition}px`,
                left: `${leftPosition}px`
            });

            d3.select(document).on('mouseout', () => this.hidePanel());
        });
    }
}
ChartCrafter.TipManager = TipManager;

class CircularDiagram {
    constructor(targetSelector, dataPoints, chartSettings) {
        chartSettings = chartSettings || {};
        this.drawingContainer = d3.select(targetSelector);
        this.data = dataPoints;
        this.config = {
            plotHeight: chartSettings.height || 400,
            plotWidth: chartSettings.width || 400,
            postLabel: chartSettings.postfix || '',
            radius: null
        };

        this.config.radius = Math.min(this.config.plotWidth, this.config.plotHeight) / 2;

        this.arcGen = d3.svg.arc()
            .outerRadius(this.config.radius - 10)
            .innerRadius(0);

        this.pieLayout = d3.layout.pie()
            .sort(null)
            .value(datum => datum.value);

        this.colorScale = ChartCrafter.paletteGenerator();

        this.renderChart();
    }

    renderChart() {
        const svgElement = this.drawingContainer.append('svg')
            .attr('width', this.config.plotWidth)
            .attr('height', this.config.plotHeight)
            .append('g')
            .attr('transform', `translate(${this.config.plotWidth / 2}, ${this.config.plotHeight / 2})`);

        const dataSlices = svgElement.selectAll('.diagram-slice')
            .data(this.pieLayout(this.data))
            .enter().append('g')
            .attr('class', 'diagram-slice');

        dataSlices.append('path')
            .attr('d', this.arcGen)
            .style('fill', (datum) => this.colorScale(datum.data.value));

        new ChartCrafter.TipManager(this.drawingContainer.node(), {
            triggerElements: dataSlices,
            positionCalculator: (datum, idx) => {
                const centroidPos = this.arcGen.centroid(datum, idx);
                const sliceXCoord = centroidPos[0] + (this.config.plotHeight / 2);
                const sliceYCoord = centroidPos[1] + (this.config.plotWidth / 2);
                return { x: sliceXCoord, y: sliceYCoord };
            },
            displayContent: (datum, idx) => {
                const contentLabel = `<strong>${datum.data.name}</strong><br />${ChartCrafter.numericPrettyPrint(datum.data.value, 0)}${this.config.postLabel}`;
                return contentLabel;
            }
        });
    }
}
ChartCrafter.CircularDiagram = CircularDiagram;

class BarGraph {
    constructor(targetElement, graphData, diagramOptions) {
        diagramOptions = diagramOptions || {};
        this.graphicContainer = d3.select(targetElement);
        this.dataPoints = graphData;
        this.chartConfig = {
            graphicHeight: diagramOptions.height || 400,
            graphicWidth: diagramOptions.width || 400,
            boundary: { top: 20, right: 20, bottom: 30, left: 50 },
            postLabel: diagramOptions.postfix || ''
        };

        this.yScale = d3.scale.linear()
            .range([this.chartConfig.graphicHeight, 0]);

        this.xScale = d3.scale.ordinal()
            .rangeRoundBands([0, this.chartConfig.graphicWidth], 0.1);

        this.yAxisRenderer = d3.svg.axis()
            .scale(this.yScale)
            .tickFormat(d3.format('2s'))
            .tickSize(6, 6, 0)
            .orient("left");

        this.xAxisRenderer = d3.svg.axis()
            .scale(this.xScale)
            .tickSize(6, 6, 0)
            .orient("bottom");

        this.drawGraph();
    }

    drawGraph() {
        const mainSvg = this.graphicContainer.append("svg")
            .attr("width", this.chartConfig.graphicWidth + this.chartConfig.boundary.left + this.chartConfig.boundary.right)
            .attr("height", this.chartConfig.graphicHeight + this.chartConfig.boundary.top + this.chartConfig.boundary.bottom)
            .append("g")
            .attr("transform", `translate(${this.chartConfig.boundary.left}, ${this.chartConfig.boundary.top})`);

        this.xScale.domain(this.dataPoints.map((item, index) => index + 1));
        this.yScale.domain([0, d3.max(this.dataPoints, item => item.value)]);

        mainSvg.append("g")
            .attr("class", "chart-axis-x")
            .attr("transform", `translate(0, ${this.chartConfig.graphicHeight})`)
            .call(this.xAxisRenderer);

        mainSvg.append("g")
            .attr("class", "chart-axis-y")
            .call(this.yAxisRenderer);

        const barElements = mainSvg.selectAll('.graph-bar-segment')
            .data(this.dataPoints)
            .enter().append("rect")
            .attr("class", "graph-bar-segment")
            .attr("x", item => this.xScale(item.value))
            .attr("width", this.xScale.rangeBand())
            .attr("y", item => this.yScale(item.value))
            .attr("height", item => this.chartConfig.graphicHeight - this.yScale(item.value));

        new ChartCrafter.TipManager(this.graphicContainer.node(), {
            triggerElements: barElements,
            positionCalculator: (item, idx) => {
                const elementBounds = this.getBBox();
                const posX = elementBounds.x + (elementBounds.width * 1.5) - 7;
                return { x: posX, y: elementBounds.y };
            },
            displayContent: (item, idx) => {
                const labelContent = `<strong>${item.name}</strong><br />${ChartCrafter.numericPrettyPrint(item.value, 0)}${this.chartConfig.postLabel}`;
                return labelContent;
            }
        });
    }
}
ChartCrafter.BarGraph = BarGraph;

class SeriesPlot {
    constructor(targetElement, inputData, plotOptions) {
        plotOptions = plotOptions || {};
        if (!plotOptions.xDataKey || !plotOptions.seriesKeys) {
            throw new Error('SeriesPlot requires xDataKey and seriesKeys in options.');
        }

        this.plotContainer = d3.select(targetElement);
        this.rawData = inputData;
        this.plotConfig = {
            xKey: plotOptions.xDataKey,
            seriesIdentifiers: Array.isArray(plotOptions.seriesKeys) ? plotOptions.seriesKeys : [plotOptions.seriesKeys],
            graphTitle: plotOptions.title || '',
            captionLabels: plotOptions.legend || [],
            valueSuffix: plotOptions.postfix || '',
            chartHeight: plotOptions.height,
            chartWidth: plotOptions.width,
            chartMargin: { top: 30, right: 20, bottom: 40, left: 50 }
        };

        this.plotConfig.chartHeight = this.plotConfig.chartHeight || (parseInt(this.plotContainer.style('height'), 10) - this.plotConfig.chartMargin.top - this.plotConfig.chartMargin.bottom);
        this.plotConfig.chartWidth = this.plotConfig.chartWidth || (parseInt(this.plotContainer.style('width'), 10) - this.plotConfig.chartMargin.left - this.plotConfig.chartMargin.right);

        this.processedData = this.prepareData(this.rawData);
        this.lastDataIndex = this.processedData.length - 1;

        this.xScale = d3.scale.linear();
        this.yScale = d3.scale.linear();
        this.xAxisGenerator = d3.svg.axis();
        this.yAxisGenerator = d3.svg.axis();

        this.colorMapper = ChartCrafter.paletteGenerator();

        this.setupScalesAndAxes();
        this.constructPlot();
    }

    prepareData(initialData) {
        return initialData.map(dataRecord => {
            if (dataRecord[this.plotConfig.xKey] instanceof Date) {
                return dataRecord;
            }

            const xValue = dataRecord[this.plotConfig.xKey];
            let dateObj;
            let timeInfoFormat;

            if (xValue.includes(":")) {
                const [datePartStr, timePartStr] = xValue.split(" ");
                const dateComponents = datePartStr.split('-');
                const timeComponents = timePartStr.split(':');
                dateObj = new Date(dateComponents[0], dateComponents[1] - 1, dateComponents[2], timeComponents[0], timeComponents[1], timeComponents[2]);
                timeInfoFormat = '%H:%M:%S';
            } else {
                const dateComponents = xValue.split('-');
                dateObj = new Date(dateComponents[0], dateComponents[1] - 1, dateComponents[2], 0, 0, 0);
                timeInfoFormat = '%y-%m-%d';
            }

            dataRecord[this.plotConfig.xKey] = dateObj;
            ChartCrafter.timeFormatSetting = timeInfoFormat;
            return dataRecord;
        });
    }

    setupScalesAndAxes() {
        const xBounds = d3.extent(this.processedData, dataRecord => dataRecord[this.plotConfig.xKey]);
        this.xScale.range([0, this.plotConfig.chartWidth]).domain(xBounds);

        const allMaxValues = [];
        this.plotConfig.seriesIdentifiers.forEach(seriesKey => {
            const currentMax = d3.max(this.processedData, dataRecord => dataRecord[seriesKey]);
            allMaxValues.push(currentMax);
        });
        const yBounds = [0, d3.max(allMaxValues)];
        this.yScale.range([this.plotConfig.chartHeight, 0]).domain(yBounds);

        const timeOutputFormatter = d3.time.format(ChartCrafter.timeFormatSetting);

        this.xAxisGenerator
            .scale(this.xScale)
            .tickFormat(momentDate => timeOutputFormatter(new Date(momentDate)))
            .tickSize(9, 6, 0)
            .orient('bottom');

        this.xAxisGenerator.ticks(Math.abs(this.xScale.range()[1] - this.xScale.range()[0]) / 70);

        this.yAxisGenerator
            .scale(this.yScale)
            .tickFormat(d3.format('2s'))
            .tickSize(6, 6, 0)
            .orient("left");

        if (this.plotConfig.chartHeight / 18 < 10) {
            this.yAxisGenerator.ticks(this.plotConfig.chartHeight / 18);
        }
    }

    constructPlot() {
        const mainSvg = this.plotContainer.append("svg")
            .attr("width", this.plotConfig.chartWidth + this.plotConfig.chartMargin.left + this.plotConfig.chartMargin.right)
            .attr("height", this.plotConfig.chartHeight + this.plotConfig.chartMargin.top + this.plotConfig.chartMargin.bottom)
            .append("g")
            .attr("transform", `translate(${this.plotConfig.chartMargin.left}, ${this.plotConfig.chartMargin.top})`);

        mainSvg.append("g")
            .attr("class", "chart-axis-horizontal")
            .attr("transform", `translate(0, ${this.plotConfig.chartHeight})`)
            .call(this.xAxisGenerator);

        mainSvg.append("g")
            .attr("class", "chart-axis-vertical")
            .call(this.yAxisGenerator);

        if (this.plotConfig.graphTitle) {
            mainSvg.append('text')
                .attr('y', 10)
                .attr('x', this.plotConfig.chartWidth / 2)
                .style('text-anchor', 'middle')
                .text(this.plotConfig.graphTitle)
                .attr('transform', `translate(0, ${this.plotConfig.chartMargin.top * -1})`);
        }

        this.plotConfig.seriesIdentifiers.forEach((seriesKey, seriesIndex) => {
            this.drawLinePath(mainSvg, seriesKey, seriesIndex);
        });
    }

    drawLinePath(targetSvg, seriesKey, seriesIndex) {
        const pathGenerator = d3.svg.line()
            .x(dataPoint => this.xScale(dataPoint[this.plotConfig.xKey]))
            .y(dataPoint => this.yScale(dataPoint[seriesKey]));

        targetSvg.append("path")
            .datum(this.processedData)
            .attr("class", "data-series-line")
            .style('stroke', () => this.colorMapper(seriesIndex))
            .attr("d", pathGenerator);
    }
}
ChartCrafter.SeriesPlot = SeriesPlot;