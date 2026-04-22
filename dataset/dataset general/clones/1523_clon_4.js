class ScaleEngine {
    static createTimeMapping(domainValues, pixelRange) {
        const [minimumDate, maximumDate] = domainValues;
        const [minimumPixel, maximumPixel] = pixelRange;
        const domainDifference = maximumDate.getTime() - minimumDate.getTime();
        const rangeDifference = maximumPixel - minimumPixel;

        return function(inputDate) {
            if (!(inputDate instanceof Date)) return NaN;
            return ((inputDate.getTime() - minimumDate.getTime()) / domainDifference) * rangeDifference + minimumPixel;
        };
    }

    static createLinearMapping(domainValues, pixelRange) {
        let [minimumValue, maximumValue] = domainValues;
        const [minimumPixel, maximumPixel] = pixelRange;
        const rangeDifference = maximumPixel - minimumPixel;

        // Basic "nice" functionality approximation: extend max value to a rounder number
        if (maximumValue > 0 && maximumValue < 10 && maximumValue % 1 !== 0) {
            maximumValue = Math.ceil(maximumValue / 10) * 10;
        } else if (maximumValue > 10 && maximumValue % 10 !== 0) {
            maximumValue = Math.ceil(maximumValue / 10) * 10;
        }
        const adjustedDomainDifference = maximumValue - minimumValue;

        return function(inputValue) {
            if (typeof inputValue !== 'number') return NaN;
            return ((inputValue - minimumValue) / adjustedDomainDifference) * rangeDifference + minimumPixel;
        };
    }

    static generateTimeTicks(domainValues) {
        const [minimumDate, maximumDate] = domainValues;
        const tickCollection = [];
        let currentTickDate = new Date(minimumDate.getFullYear(), Math.floor(minimumDate.getMonth() / 3) * 3, 1); // Start of quarter

        while (currentTickDate.getTime() <= maximumDate.getTime() + (24 * 60 * 60 * 1000 * 30)) { // Add ~1 month buffer
            tickCollection.push(new Date(currentTickDate));
            currentTickDate.setMonth(currentTickDate.getMonth() + 3); // Move to next quarter
        }
        return tickCollection;
    }

    static generateLinearTicks(domainValues, desiredCount) {
        const [minimumValue, maximumValue] = domainValues;
        const tickCollection = [];
        if (desiredCount <= 0 || maximumValue <= minimumValue) return tickCollection;

        const valueRange = maximumValue - minimumValue;
        const niceIntervals = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];
        let chosenStep = 0;
        let scaleFactor = Math.pow(10, Math.floor(Math.log10(valueRange / desiredCount)));
        for (const interval of niceIntervals) {
            const potentialStep = interval * scaleFactor;
            if (valueRange / potentialStep <= desiredCount * 1.2) {
                chosenStep = potentialStep;
                break;
            }
        }
        if (chosenStep === 0) chosenStep = scaleFactor;

        let startValue = Math.floor(minimumValue / chosenStep) * chosenStep;
        if (startValue < minimumValue) startValue += chosenStep;

        let currentValue = startValue;
        while (currentValue <= maximumValue + chosenStep / 2) {
            tickCollection.push(currentValue);
            currentValue += chosenStep;
        }
        return tickCollection;
    }
}

class FormatHelper {
    static formatQuarterlyDate(inputDate) {
        const monthIndex = inputDate.getMonth();
        const quarterNumber = Math.floor(monthIndex / 3) + 1;
        const twoDigitYear = inputDate.getFullYear().toString().slice(-2);
        return `Q${quarterNumber}/${twoDigitYear}`;
    }

    static formatSignificantNumber(inputNumber) {
        if (inputNumber === 0) return '0';
        const absoluteNumber = Math.abs(inputNumber);
        const signIndicator = inputNumber < 0 ? '-' : '';

        if (absoluteNumber >= 1e9) return signIndicator + (absoluteNumber / 1e9).toFixed(2).replace(/\.0+$/, '') + 'G';
        if (absoluteNumber >= 1e6) return signIndicator + (absoluteNumber / 1e6).toFixed(2).replace(/\.0+$/, '') + 'M';
        if (absoluteNumber >= 1e3) return signIndicator + (absoluteNumber / 1e3).toFixed(2).replace(/\.0+$/, '') + 'k';
        return signIndicator + absoluteNumber.toString();
    }
}

class TimeValuePlotter {
    constructor(sourceRecords, configurationSettings) {
        this.baseRecords = sourceRecords;
        this.settings = configurationSettings;

        this.canvasWidth = 500;
        this.canvasHeight = 70;

        this.borderSpacings = { top: 16, bottom: 15, left: 15, right: 15 };
        this.innerClearance = { top: 0, bottom: 0, left: 0, right: 0 };

        this.filteredRecords = this.filterRecordsByDate(sourceRecords, configurationSettings.extents);
        
        this.graphicCanvas = this.createSVGContainerElement(configurationSettings.container);
        this.patternResources = this.createVisualPatterns();
        this.coordinateSystemGroup = this.graphicCanvas.appendChild(this.createSVGGroup('coordinate-system-layer', `translate(${this.borderSpacings.left},${this.canvasHeight - this.borderSpacings.bottom})`));
        this.chartElementsGroup = this.graphicCanvas.appendChild(this.createSVGGroup('chart-display-layer', `translate(${this.borderSpacings.left},${this.borderSpacings.top})`));

        this.recordRanges = this.determineRecordRanges(this.filteredRecords);
        
        this.initializePlot();
    }

    filterRecordsByDate(records, extentConfiguration) {
        if (extentConfiguration && extentConfiguration.date) {
            return records.filter(record => 
                record.date.getTime() >= extentConfiguration.date[0].getTime() && 
                record.date.getTime() <= extentConfiguration.date[1].getTime()
            );
        }
        return records;
    }

    createSVGContainerElement(containerLocator) {
        const parentElement = typeof containerLocator === 'string' ? document.querySelector(containerLocator) : containerLocator;
        const svgObject = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgObject.setAttribute('width', this.canvasWidth);
        svgObject.setAttribute('height', this.canvasHeight);
        parentElement.appendChild(svgObject);
        return svgObject;
    }

    createSVGGroup(styleClass, transformRule) {
        const groupElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        if (styleClass) groupElement.setAttribute('class', styleClass);
        if (transformRule) groupElement.setAttribute('transform', transformRule);
        return groupElement;
    }

    createVisualPatterns() {
        const definitions = this.graphicCanvas.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'defs'));
        const hatchPattern = definitions.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'pattern'));
        hatchPattern.setAttribute('id', 'diagonalHatchPattern');
        hatchPattern.setAttribute('width', '3');
        hatchPattern.setAttribute('height', '3');
        hatchPattern.setAttribute('patternTransform', 'rotate(-45 0 0)');
        hatchPattern.setAttribute('patternUnits', 'userSpaceOnUse');

        const backgroundRect = hatchPattern.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'rect'));
        backgroundRect.setAttribute('x', '0');
        backgroundRect.setAttribute('y', '0');
        backgroundRect.setAttribute('width', '4');
        backgroundRect.setAttribute('height', '4');
        backgroundRect.style.stroke = 'none';
        backgroundRect.style.fill = '#fff';

        const hatchLine = hatchPattern.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
        hatchLine.setAttribute('x1', '0');
        hatchLine.setAttribute('y1', '0');
        hatchLine.setAttribute('x2', '0');
        hatchLine.setAttribute('y2', '4');
        hatchLine.style.stroke = '#A06535';
        hatchLine.style.strokeWidth = '1';
        return definitions;
    }

    determineRecordRanges(records) {
        if (records.length === 0) return { date: [new Date(), new Date()], value: [0, 0] };

        let minDate = records[0].date, maxDate = records[0].date;
        let minValue = records[0].value, maxValue = records[0].value;

        for (const record of records) {
            if (record.date.getTime() < minDate.getTime()) minDate = record.date;
            if (record.date.getTime() > maxDate.getTime()) maxDate = record.date;
            if (record.value < minValue) minValue = record.value;
            if (record.value > maxValue) maxValue = record.value;
        }
        return { date: [minDate, maxDate], value: [minValue, maxValue] };
    }

    initializePlot() {
        const plotAreaWidth = this.canvasWidth - (this.borderSpacings.left + this.borderSpacings.right + this.innerClearance.left + this.innerClearance.right);
        const plotAreaHeight = this.canvasHeight - (this.borderSpacings.top + this.borderSpacings.bottom);

        this.horizontalPositionMapper = ScaleEngine.createTimeMapping(
            this.recordRanges.date, 
            [0, plotAreaWidth]
        );
        this.verticalPositionMapper = ScaleEngine.createLinearMapping(
            [0, this.recordRanges.value[1]], 
            [plotAreaHeight, 0] 
        );

        this.renderAreaFill(this.filteredRecords, plotAreaHeight);
        this.renderTrendPath(this.filteredRecords);
        this.renderDataPoints(this.filteredRecords, plotAreaHeight);
        this.renderCoordinateAxes(plotAreaWidth, plotAreaHeight);
        this.renderGridLines(plotAreaWidth, plotAreaHeight);

        this.dateNavigationController = new DateNavigationWidget(
            this.settings.selector, 
            ScaleEngine.generateTimeTicks(this.recordRanges.date), 
            this.settings.callback,
            (selectedDate) => this.updateChartSelection(selectedDate) 
        );
        this.updateChartSelection(this.recordRanges.date[1]); 
    }

    constructPathData(records, xAccessor, yAccessor) {
        if (records.length === 0) return "";
        let pathString = `M${xAccessor(records[0])},${yAccessor(records[0])}`;
        for (let i = 1; i < records.length; i++) {
            pathString += `L${xAccessor(records[i])},${yAccessor(records[i])}`;
        }
        return pathString;
    }

    constructAreaPathData(records, xAccessor, yAccessor, baseLineY) {
        if (records.length === 0) return "";
        let pathString = `M${xAccessor(records[0])},${baseLineY}`; 
        pathString += `L${xAccessor(records[0])},${yAccessor(records[0])}`; 
        for (let i = 1; i < records.length; i++) {
            pathString += `L${xAccessor(records[i])},${yAccessor(records[i])}`;
        }
        pathString += `L${xAccessor(records[records.length - 1])},${baseLineY}`; 
        pathString += `Z`; 
        return pathString;
    }

    renderAreaFill(records, chartBaseY) {
        const areaGraphic = this.chartElementsGroup.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
        areaGraphic.setAttribute('class', 'area-segment');
        areaGraphic.setAttribute('d', this.constructAreaPathData(
            records,
            d => this.horizontalPositionMapper(d.date),
            d => this.verticalPositionMapper(d.value),
            chartBaseY
        ));
        areaGraphic.style.fill = 'url(#diagonalHatchPattern)';
    }

    renderTrendPath(records) {
        const lineGraphic = this.chartElementsGroup.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
        lineGraphic.setAttribute('class', 'value-trend-line');
        lineGraphic.setAttribute('d', this.constructPathData(
            records,
            d => this.horizontalPositionMapper(d.date),
            d => this.verticalPositionMapper(d.value)
        ));
    }

    renderDataPoints(records, chartBaseY) {
        const segmentWidth = (this.horizontalPositionMapper(records[records.length - 1].date) - this.horizontalPositionMapper(records[0].date)) / (records.length - 1);
        
        records.forEach((record, index) => {
            const xPosition = this.horizontalPositionMapper(record.date);
            const yPosition = this.verticalPositionMapper(record.value);

            const pointContainer = this.chartElementsGroup.appendChild(this.createSVGGroup('data-point-marker', `translate(${xPosition},${yPosition})`));
            pointContainer.dataset.date = record.date.getTime(); 
            pointContainer.dataset.value = record.value; 

            const interactiveRect = pointContainer.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'rect'));
            interactiveRect.setAttribute('class', 'interaction-region');
            interactiveRect.setAttribute('x', -segmentWidth / 2);
            interactiveRect.setAttribute('y', -this.verticalPositionMapper(record.value)); 
            interactiveRect.setAttribute('width', segmentWidth);
            interactiveRect.setAttribute('height', chartBaseY + this.borderSpacings.bottom); 
            interactiveRect.style.fill = 'transparent'; 

            const mainCircle = pointContainer.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'circle'));
            mainCircle.setAttribute('cx', '0');
            mainCircle.setAttribute('cy', '0');
            mainCircle.setAttribute('r', '4');

            const pointLabel = pointContainer.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
            pointLabel.setAttribute('class', 'point-data-label');
            pointLabel.setAttribute('x', '5');
            pointLabel.setAttribute('y', '14');
            pointLabel.style.textAnchor = (index === 0) ? 'start' : (index === records.length - 1 ? 'end' : 'middle');

            const instructionSpan = pointLabel.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'tspan'));
            instructionSpan.setAttribute('class', 'action-instruction');
            instructionSpan.style.textAnchor = (index === records.length - 1) ? 'end' : 'start';
            instructionSpan.textContent = 'tap to choose';

            const valueDisplaySpan = pointLabel.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'tspan'));
            valueDisplaySpan.setAttribute('x', '5');
            valueDisplaySpan.setAttribute('y', '-8');
            valueDisplaySpan.textContent = FormatHelper.formatSignificantNumber(record.value);

            const verticalDropLine = pointContainer.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
            verticalDropLine.setAttribute('class', 'drop-marker-line');
            verticalDropLine.setAttribute('x1', '0');
            verticalDropLine.setAttribute('y1', '0');
            verticalDropLine.setAttribute('x2', '0');
            verticalDropLine.setAttribute('y2', chartBaseY - this.verticalPositionMapper(record.value)); 

            pointContainer.addEventListener('mouseover', () => {
                this.coordinateSystemGroup.querySelectorAll('.horizontal-axis-group .tick-container').forEach(tickContainer => {
                    const tickDate = new Date(parseInt(tickContainer.dataset.date));
                    if (record.date.getTime() === tickDate.getTime()) {
                        tickContainer.classList.add('highlighted-state');
                    }
                });
            });
            pointContainer.addEventListener('mouseout', () => {
                this.coordinateSystemGroup.querySelectorAll('.horizontal-axis-group .tick-container').forEach(tickContainer => {
                    tickContainer.classList.remove('highlighted-state');
                });
            });
            pointContainer.addEventListener('click', () => {
                this.updateChartSelection(record.date);
                if (this.settings.callback) {
                    this.settings.callback({ date: record.date, value: record.value });
                }
            });
        });
    }

    renderCoordinateAxes(plotAreaWidth, plotAreaHeight) {
        // Horizontal Axis
        const hAxisContainer = this.coordinateSystemGroup.appendChild(this.createSVGGroup('horizontal-axis-group', `translate(${this.innerClearance.left},0)`));
        const hAxisMainLine = hAxisContainer.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
        hAxisMainLine.setAttribute('x1', '0');
        hAxisMainLine.setAttribute('y1', '0');
        hAxisMainLine.setAttribute('x2', plotAreaWidth);
        hAxisMainLine.setAttribute('y2', '0');
        hAxisMainLine.style.stroke = 'currentColor';

        const hAxisTicks = ScaleEngine.generateTimeTicks(this.recordRanges.date); 
        hAxisTicks.forEach(tickDate => {
            const xCoord = this.horizontalPositionMapper(tickDate);
            const tickContainer = hAxisContainer.appendChild(this.createSVGGroup('tick-container', `translate(${xCoord},0)`));
            tickContainer.dataset.date = tickDate.getTime();

            const tickMarkLine = tickContainer.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
            tickMarkLine.setAttribute('y1', '0');
            tickMarkLine.setAttribute('y2', '3');
            tickMarkLine.style.stroke = 'currentColor';

            const tickLabelText = tickContainer.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
            tickLabelText.setAttribute('y', '9');
            tickLabelText.style.textAnchor = 'middle';
            tickLabelText.textContent = FormatHelper.formatQuarterlyDate(tickDate);
        });

        // Vertical Axis
        const vAxisContainer = this.coordinateSystemGroup.appendChild(this.createSVGGroup('vertical-axis-group', `translate(0,${-plotAreaHeight})`));
        const vAxisMainLine = vAxisContainer.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
        vAxisMainLine.setAttribute('x1', '0');
        vAxisMainLine.setAttribute('y1', '0');
        vAxisMainLine.setAttribute('x2', '0');
        vAxisMainLine.setAttribute('y2', plotAreaHeight);
        vAxisMainLine.style.stroke = 'currentColor';

        const vAxisTicks = ScaleEngine.generateLinearTicks([0, this.recordRanges.value[1]], 3).filter(val => val > 0);
        vAxisTicks.forEach((tickValue, index) => {
            const yCoord = this.verticalPositionMapper(tickValue);
            const tickContainer = vAxisContainer.appendChild(this.createSVGGroup('tick-container', `translate(0,${yCoord})`));

            const tickMarkLine = tickContainer.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
            tickMarkLine.setAttribute('x1', '0');
            tickMarkLine.setAttribute('x2', '-3');
            tickMarkLine.style.stroke = 'currentColor';

            const tickLabelText = tickContainer.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
            tickLabelText.setAttribute('x', this.borderSpacings.left - 22); 
            tickLabelText.setAttribute('y', '-3');
            tickLabelText.style.textAnchor = 'end';
            let labelTextContent = FormatHelper.formatSignificantNumber(tickValue);
            if (index === vAxisTicks.length - 1) { 
                labelTextContent += ' ACTIVE REPOSITORIES';
            }
            tickLabelText.textContent = labelTextContent;
        });
    }

    renderGridLines(plotAreaWidth, plotAreaHeight) {
        const vAxisTicks = ScaleEngine.generateLinearTicks([0, this.recordRanges.value[1]], 3).filter(val => val > 0);
        vAxisTicks.forEach(tickValue => {
            const yCoord = this.verticalPositionMapper(tickValue);
            const gridLineElement = this.coordinateSystemGroup.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
            gridLineElement.setAttribute('class', 'chart-grid-line');
            gridLineElement.setAttribute('x1', 0);
            gridLineElement.setAttribute('x2', plotAreaWidth);
            gridLineElement.setAttribute('y1', - (plotAreaHeight - yCoord)); 
            gridLineElement.setAttribute('y2', - (plotAreaHeight - yCoord));
        });
    }

    updateChartSelection(targetDate, suppressNavigationUpdate = false) {
        const targetTime = targetDate.getTime();

        this.chartElementsGroup.querySelectorAll('.data-point-marker').forEach(marker => {
            const markerDate = new Date(parseInt(marker.dataset.date));
            if (markerDate.getTime() === targetTime) {
                marker.classList.add('selected-point');
            } else {
                marker.classList.remove('selected-point');
            }
        });

        this.coordinateSystemGroup.querySelectorAll('.horizontal-axis-group .tick-container').forEach(tickContainer => {
            const tickDate = new Date(parseInt(tickContainer.dataset.date));
            if (tickDate.getTime() === targetTime) {
                tickContainer.classList.add('selected-tick-label');
            } else {
                tickContainer.classList.remove('selected-tick-label');
            }
        });

        if (!suppressNavigationUpdate && this.dateNavigationController) {
            this.dateNavigationController.chooseDate(targetDate, true); 
        }
    }
}

class DateNavigationWidget {
    constructor(containerLocator, allDatesAvailable, externalCallback, chartHighlightCallback) {
        this.containerElement = typeof containerLocator === 'string' ? document.querySelector(containerLocator) : containerLocator;
        this.allDates = allDatesAvailable;
        this.activeDateIndex = this.allDates.length - 1;
        this.externalNotification = externalCallback;
        this.chartUpdateFunction = chartHighlightCallback;
        this.actionDebounceTimer = null;

        this.buildWidget();
    }

    buildWidget() {
        this.containerElement.innerHTML = ''; 

        const previousArrow = this.containerElement.appendChild(document.createElement('a'));
        previousArrow.setAttribute('class', 'direction-control-arrow');
        previousArrow.setAttribute('title', 'Previous Quarter');
        previousArrow.setAttribute('href', '#');
        previousArrow.innerHTML = '&lt;';
        previousArrow.addEventListener('click', (event) => {
            event.preventDefault();
            this.shiftSelection(-1);
        });

        this.dateOptionList = this.containerElement.appendChild(document.createElement('ul'));
        this.dateOptionList.setAttribute('class', 'date-selection-options');
        this.allDates.forEach((dateItem, index) => {
            const listItem = this.dateOptionList.appendChild(document.createElement('li'));
            listItem.textContent = FormatHelper.formatQuarterlyDate(dateItem);
            listItem.dataset.date = dateItem.getTime();
            if (index === this.activeDateIndex) {
                listItem.classList.add('active-selection');
            }
            listItem.addEventListener('click', () => this.chooseDate(dateItem));
        });

        const nextArrow = this.containerElement.appendChild(document.createElement('a'));
        nextArrow.setAttribute('class', 'direction-control-arrow');
        nextArrow.setAttribute('title', 'Next Quarter');
        nextArrow.setAttribute('href', '#');
        nextArrow.innerHTML = '&gt;';
        nextArrow.addEventListener('click', (event) => {
            event.preventDefault();
            this.shiftSelection(1);
        });
    }

    shiftSelection(direction) {
        let newIndex = this.activeDateIndex + direction;
        if (newIndex >= 0 && newIndex < this.allDates.length) {
            this.chooseDate(this.allDates[newIndex]);
        }
    }

    chooseDate(selectedDate, suppressChartUpdate = false) {
        if (this.actionDebounceTimer) {
            clearTimeout(this.actionDebounceTimer);
        }
        this.actionDebounceTimer = setTimeout(() => {
            const newIndex = this.allDates.findIndex(d => d.getTime() === selectedDate.getTime());
            if (newIndex !== -1) {
                this.activeDateIndex = newIndex;
                this.dateOptionList.querySelectorAll('li').forEach(item => {
                    if (parseInt(item.dataset.date) === selectedDate.getTime()) {
                        item.classList.add('active-selection');
                    } else {
                        item.classList.remove('active-selection');
                    }
                });

                if (!suppressChartUpdate && this.externalNotification) {
                    this.chartUpdateFunction(selectedDate, true); 
                    this.externalNotification({ date: selectedDate });
                }
            }
        }, 200);
    }
}