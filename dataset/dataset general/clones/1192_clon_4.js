class SurveyInsightGenerator {
    static engineVersion = "1.0.0";

    constructor(targetElementId, surveyData) {
        this.hostElementId = targetElementId;
        this.originalData = surveyData;

        this.processedRecords = [];
        this.questionDetails = [];
        this.choiceToNumericMap = new Map();
        this.numericToChoiceMap = new Map();

        this.allParticipantsTotal = 0;
        this.activeParticipantsTotal = 0;

        this.activeFilterRanges = new Map();

        this.chartVisualizers = [];
        this.globalMaximumYValue = 0;

        this.prepareSourceData();
        this.constructInterface();
        this.refreshInterface();
    }

    prepareSourceData() {
        this.questionDetails = this.originalData.questions.map((q, qIndex) => {
            const currentChoiceToNumeric = new Map();
            const currentNumericToChoice = new Map();
            q.choices.forEach((choiceText, numericIndex) => {
                currentChoiceToNumeric.set(choiceText, numericIndex);
                currentNumericToChoice.set(numericIndex, choiceText);
            });
            this.choiceToNumericMap.set(q.number, currentChoiceToNumeric);
            this.numericToChoiceMap.set(q.number, currentNumericToChoice);
            return {
                uniqueId: q.number,
                displayLabel: q.text,
                availableChoices: q.choices,
                categoryType: q.type,
                originalOrder: qIndex
            };
        });

        this.processedRecords = this.originalData.responses.map(resp => {
            const newRecord = {};
            this.questionDetails.forEach(q => {
                const choice = resp[q.uniqueId];
                const numericRepresentation = this.choiceToNumericMap.get(q.uniqueId).get(choice);
                newRecord[q.uniqueId] = numericRepresentation;
            });
            return newRecord;
        });
        this.allParticipantsTotal = this.processedRecords.length;
    }

    getFilteredParticipants() {
        if (this.activeFilterRanges.size === 0) {
            return this.processedRecords;
        }

        return this.processedRecords.filter(record => {
            for (let [questionId, filterLimits] of this.activeFilterRanges.entries()) {
                const value = record[questionId];
                if (value < filterLimits.minimum || value > filterLimits.maximum) {
                    return false;
                }
            }
            return true;
        });
    }

    tallyCategoryFrequencies(recordsCollection, questionId) {
        const frequencies = new Map();
        this.questionDetails.find(q => q.uniqueId === questionId).availableChoices.forEach((_, idx) => {
            frequencies.set(idx, 0);
        });

        recordsCollection.forEach(record => {
            const value = record[questionId];
            frequencies.set(value, frequencies.get(value) + 1);
        });

        const result = Array.from(frequencies.entries()).map(([key, value]) => ({ key, value }));
        result.sort((a, b) => a.key - b.key);
        return result;
    }

    formatNumericOutput(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    constructInterface() {
        const hostElement = document.getElementById(this.hostElementId);
        if (!hostElement) {
            console.error(`Container element with ID '${this.hostElementId}' not found.`);
            return;
        }

        hostElement.innerHTML = '';

        this.questionDetails.forEach((q, idx) => {
            const chartContainer = document.createElement('div');
            chartContainer.id = `${q.uniqueId}-chart-container`;
            chartContainer.className = 'survey-chart-panel';
            hostElement.appendChild(chartContainer);

            const titleDiv = document.createElement('div');
            titleDiv.className = 'chart-title-label';
            titleDiv.innerText = `${q.uniqueId}. ${q.displayLabel}`;
            chartContainer.appendChild(titleDiv);

            const vizComponent = new CategoryVisualizer({
                parentElement: chartContainer,
                questionData: q,
                numericOptionMap: this.numericToChoiceMap.get(q.uniqueId),
                onRangeModified: (questionId, range) => this.handleRangeModification(questionId, range)
            });
            this.chartVisualizers.push(vizComponent);
        });

        let currentMaxY = 0;
        this.chartVisualizers.forEach(viz => {
            const allCounts = this.tallyCategoryFrequencies(this.processedRecords, viz.questionData.uniqueId);
            const maxForThisChart = allCounts.reduce((max, item) => Math.max(max, item.value), 0);
            currentMaxY = Math.max(currentMaxY, maxForThisChart);
        });
        this.globalMaximumYValue = currentMaxY;

        this.chartVisualizers.forEach(viz => {
            viz.updateGlobalYDomain(this.globalMaximumYValue);
        });

        const statusPanel = document.createElement('aside');
        statusPanel.id = 'status-panel';
        statusPanel.className = 'survey-status';
        statusPanel.innerHTML = `
            <div style='clear:both;margin-top:20px'></div>
            <span id='active-count'>-</span> / <span id='total-count'>-</span> <br/> active participants
        `;
        hostElement.appendChild(statusPanel);

        const legendSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        legendSVG.setAttribute('width', 300);
        legendSVG.setAttribute('height', 120);
        statusPanel.insertBefore(legendSVG, statusPanel.querySelector('div'));

        const legendGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        legendSVG.appendChild(legendGroup);

        const barSegmentWidth = 80;
        const barSegmentGap = 3;
        const legendPanelWidth = 300;

        const legendPathData = [
            `M${(legendPanelWidth - (barSegmentWidth - 2 * barSegmentGap)) / 2},10v100h${barSegmentWidth - 2 * barSegmentGap}v-100Z`,
            `M${(legendPanelWidth - (barSegmentWidth - 2 * barSegmentGap)) / 2},80v30h${barSegmentWidth - 2 * barSegmentGap}v-30Z`,
            `M${(legendPanelWidth - (barSegmentWidth - 2 * barSegmentGap)) / 2},40h${barSegmentWidth - 2 * barSegmentGap}M${legendPanelWidth / 2},15v44`
        ];
        const legendGraphicClasses = [
            'viz-bg-full',
            'viz-fg-part',
            'viz-prop-line'
        ];

        legendPathData.forEach((dPath, i) => {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', dPath);
            path.setAttribute('class', `survey-legend-item ${legendGraphicClasses[i]}`);
            legendGroup.appendChild(path);
        });

        const bottomClearDiv = document.createElement('div');
        bottomClearDiv.style.clear = 'both';
        hostElement.appendChild(bottomClearDiv);

        const distinctCategoryTypes = new Set(this.questionDetails.map(q => q.categoryType));
        if (distinctCategoryTypes.size > 1) {
            const swatchSize = 20;
            const swatchSpacing = 5;

            const colorLegendClearDiv = document.createElement('div');
            colorLegendClearDiv.style.clear = 'both';
            statusPanel.insertBefore(colorLegendClearDiv, legendSVG);

            const colorLegendSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            colorLegendSVG.setAttribute('width', legendPanelWidth);
            colorLegendSVG.setAttribute('height', distinctCategoryTypes.size * (swatchSize + swatchSpacing) + swatchSpacing);
            colorLegendSVG.style.marginBottom = '20px';
            statusPanel.insertBefore(colorLegendSVG, colorLegendClearDiv.nextSibling);

            const colorLegendGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            colorLegendSVG.appendChild(colorLegendGroup);

            Array.from(distinctCategoryTypes).forEach((type, i) => {
                const rectPath = `M${legendPanelWidth / 2 - swatchSize / 2},${swatchSpacing + i * (swatchSize + swatchSpacing)}h${swatchSize}v${swatchSize}h${-swatchSize}Z`;
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('class', `viz-fg-part viz-type-${type}`);
                path.setAttribute('d', rectPath);
                colorLegendGroup.appendChild(path);

                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('class', 'survey-legend-label');
                text.setAttribute('x', legendPanelWidth / 2 + swatchSize / 2 + barSegmentGap);
                text.setAttribute('y', swatchSpacing + i * (swatchSize + swatchSpacing) + swatchSize / 2);
                text.setAttribute('dy', '0.35em');
                text.textContent = type;
                colorLegendGroup.appendChild(text);
            });
        }
    }

    handleRangeModification(questionId, selectionRange) {
        if (selectionRange === null) {
            this.activeFilterRanges.delete(questionId);
        } else {
            this.activeFilterRanges.set(questionId, selectionRange);
        }
        this.refreshInterface();
    }

    refreshInterface() {
        const currentActiveRecords = this.getFilteredParticipants();
        this.activeParticipantsTotal = currentActiveRecords.length;

        document.getElementById('active-count').textContent = this.formatNumericOutput(this.activeParticipantsTotal);
        document.getElementById('total-count').textContent = this.formatNumericOutput(this.allParticipantsTotal);

        this.chartVisualizers.forEach(viz => {
            const allCategoryFrequencies = this.tallyCategoryFrequencies(this.processedRecords, viz.questionData.uniqueId);
            const filteredCategoryFrequencies = this.tallyCategoryFrequencies(currentActiveRecords, viz.questionData.uniqueId);
            viz.drawVisualization(allCategoryFrequencies, filteredCategoryFrequencies, this.activeParticipantsTotal, this.allParticipantsTotal);
        });
    }

    applyExternalFilter(filterDescriptions) {
        filterDescriptions.forEach(desc => {
            this.activeFilterRanges.set(desc.qId, desc.range);
        });
        this.refreshInterface();
    }

    clearQuestionFilter(questionId) {
        this.activeFilterRanges.delete(questionId);
        this.chartVisualizers.find(v => v.questionData.uniqueId === questionId)?.clearActiveSelection();
        this.refreshInterface();
    }
}

class NumericAxisScaler {
    constructor() {
        this.domainLimits = [0, 1];
        this.rangeLimits = [0, 1];
    }

    domain(values) {
        if (!arguments.length) return this.domainLimits;
        this.domainLimits = values;
        return this;
    }

    range(values) {
        if (!arguments.length) return this.rangeLimits;
        this.rangeLimits = values;
        return this;
    }

    transform(value) {
        const [d0, d1] = this.domainLimits;
        const [r0, r1] = this.rangeLimits;
        return r0 + (r1 - r0) * ((value - d0) / (d1 - d0));
    }

    inverseTransform(value) {
        const [d0, d1] = this.domainLimits;
        const [r0, r1] = this.rangeLimits;
        return d0 + (d1 - d0) * ((value - r0) / (r1 - r0));
    }

    rangeRounded(values) {
        if (!arguments.length) return this.rangeLimits;
        this.rangeLimits = values.map(Math.round);
        return this;
    }
}

class CategoryVisualizer {
    static componentIdCounter = 0;

    constructor(config) {
        this.config = config;
        this.questionData = config.questionData;
        this.numericOptionMap = config.numericOptionMap;
        this.onRangeModified = config.onRangeModified;
        this.componentIdentifier = CategoryVisualizer.componentIdCounter++;

        this.parentContainer = config.parentElement;
        this.svgCanvas = null;
        this.selectionLayer = null;
        this.currentActiveSelection = null;

        this.layoutMargins = { top: 10, right: 10, bottom: 20, left: 10 };
        this.barDimensions = { width: 80, spacing: 3 };

        this.horizontalScaler = new NumericAxisScaler();
        this.verticalScaler = new NumericAxisScaler().range([100, 0]);

        this.setupChartElements();
    }

    updateGlobalYDomain(newMaxY) {
        this.verticalScaler.domain([0, newMaxY]);
    }

    setupChartElements() {
        const chartDisplayArea = document.createElement('div');
        chartDisplayArea.className = 'chart-area';
        this.parentContainer.appendChild(chartDisplayArea);

        const resetControl = document.createElement('a');
        resetControl.href = 'javascript:void(0)';
        resetControl.className = 'reset-filter-button';
        resetControl.textContent = 'reset';
        resetControl.style.display = 'none';
        resetControl.onclick = () => {
            this.clearActiveSelection();
            this.onRangeModified(this.questionData.uniqueId, null);
        };
        this.parentContainer.querySelector('.chart-title-label').appendChild(resetControl);

        this.svgCanvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svgCanvas.setAttribute('width', this.barDimensions.width * this.questionData.availableChoices.length + this.layoutMargins.left + this.layoutMargins.right);
        this.svgCanvas.setAttribute('height', 100 + this.layoutMargins.top + this.layoutMargins.bottom);
        chartDisplayArea.appendChild(this.svgCanvas);

        const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroup.setAttribute('transform', `translate(${this.layoutMargins.left},${this.layoutMargins.top})`);
        this.svgCanvas.appendChild(chartGroup);

        const hatchPattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        hatchPattern.setAttribute('id', `diag-hatch-${this.componentIdentifier}`);
        hatchPattern.setAttribute('patternUnits', 'userSpaceOnUse');
        hatchPattern.setAttribute('width', 10);
        hatchPattern.setAttribute('height', 10);
        const hatchPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        hatchPath.setAttribute('class', 'hatch-pattern-line');
        hatchPath.setAttribute('d', 'M-1,1l2,-2M0,10l10,-10M9,11l2,-2');
        hatchPattern.appendChild(hatchPath);
        this.svgCanvas.insertBefore(hatchPattern, chartGroup);

        const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
        clipPath.setAttribute('id', `clip-${this.componentIdentifier}`);
        const clipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        clipRect.setAttribute('width', this.barDimensions.width * this.questionData.availableChoices.length);
        clipRect.setAttribute('height', 100);
        clipPath.appendChild(clipRect);
        chartGroup.appendChild(clipPath);

        const xAxisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        xAxisGroup.setAttribute('class', 'category-axis');
        xAxisGroup.setAttribute('transform', `translate(0,${100})`);
        chartGroup.appendChild(xAxisGroup);

        this.horizontalScaler.domain([-0.5, this.questionData.availableChoices.length - 0.5])
                             .rangeRounded([0, this.barDimensions.width * this.questionData.availableChoices.length]);

        for (let i = 0; i < this.questionData.availableChoices.length; i++) {
            const xPosition = this.horizontalScaler.transform(i);
            const tickLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            tickLine.setAttribute('x1', xPosition);
            tickLine.setAttribute('y1', 0);
            tickLine.setAttribute('x2', xPosition);
            tickLine.setAttribute('y2', 6);
            tickLine.setAttribute('stroke', 'black');
            xAxisGroup.appendChild(tickLine);

            const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            labelText.setAttribute('x', xPosition + this.barDimensions.width / 2 - this.barDimensions.spacing);
            labelText.setAttribute('y', 9);
            labelText.setAttribute('dy', '0.71em');
            labelText.setAttribute('text-anchor', 'middle');
            labelText.setAttribute('class', 'category-label');

            let choiceLabel = this.numericOptionMap.get(i);
            if (choiceLabel.length > 20) {
                choiceLabel = choiceLabel.substring(0, 17) + '...';
            }
            labelText.textContent = choiceLabel;
            xAxisGroup.appendChild(labelText);

            labelText.setAttribute('title', this.numericOptionMap.get(i));
        }

        this.selectionLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.selectionLayer.setAttribute('class', 'selection-brush');
        chartGroup.appendChild(this.selectionLayer);

        const selectionTriggerRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        selectionTriggerRect.setAttribute('class', 'selection-area');
        selectionTriggerRect.setAttribute('x', 0);
        selectionTriggerRect.setAttribute('y', 0);
        selectionTriggerRect.setAttribute('width', this.barDimensions.width * this.questionData.availableChoices.length);
        selectionTriggerRect.setAttribute('height', 100);
        selectionTriggerRect.setAttribute('fill', 'none');
        selectionTriggerRect.setAttribute('pointer-events', 'all');
        this.selectionLayer.appendChild(selectionTriggerRect);

        this.attachSelectionHandlers(selectionTriggerRect);
    }

    attachSelectionHandlers(triggerRect) {
        let startingXCoordinate = 0;
        let isDraggingActive = false;
        let selectionVisual = null;

        const svgGlobalXOffset = this.svgCanvas.getBoundingClientRect().left + this.layoutMargins.left;
        const effectiveChartWidth = this.barDimensions.width * this.questionData.availableChoices.length;

        const initiateSelection = (event) => {
            isDraggingActive = true;
            startingXCoordinate = event.clientX - svgGlobalXOffset;

            if (selectionVisual) {
                selectionVisual.remove();
            }

            selectionVisual = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            selectionVisual.setAttribute('class', 'selection-indicator');
            selectionVisual.setAttribute('y', 0);
            selectionVisual.setAttribute('height', 100);
            selectionVisual.setAttribute('fill', `url(#diag-hatch-${this.componentIdentifier})`);
            selectionVisual.setAttribute('stroke', 'black');
            selectionVisual.setAttribute('stroke-width', 1);
            this.selectionLayer.appendChild(selectionVisual);

            this.parentContainer.querySelector('.reset-filter-button').style.display = 'none';
        };

        const updateSelection = (event) => {
            if (!isDraggingActive) return;

            const currentXCoordinate = Math.max(0, Math.min(effectiveChartWidth, event.clientX - svgGlobalXOffset));
            const x1 = Math.min(startingXCoordinate, currentXCoordinate);
            const x2 = Math.max(startingXCoordinate, currentXCoordinate);

            selectionVisual.setAttribute('x', x1);
            selectionVisual.setAttribute('width', x2 - x1);
        };

        const finalizeSelection = (event) => {
            if (!isDraggingActive) return;
            isDraggingActive = false;

            const finalXCoordinate = Math.max(0, Math.min(effectiveChartWidth, event.clientX - svgGlobalXOffset));
            const x1 = Math.min(startingXCoordinate, finalXCoordinate);
            const x2 = Math.max(startingXCoordinate, finalXCoordinate);

            if (x2 - x1 < 5) {
                this.clearActiveSelection();
                this.onRangeModified(this.questionData.uniqueId, null);
                return;
            }

            const startDataIndex = Math.round(this.horizontalScaler.inverseTransform(x1 + this.barDimensions.spacing));
            const endDataIndex = Math.round(this.horizontalScaler.inverseTransform(x2 - this.barDimensions.spacing));

            this.currentActiveSelection = {
                minimum: Math.max(0, startDataIndex),
                maximum: Math.min(this.questionData.availableChoices.length - 1, endDataIndex)
            };

            const snappedX1 = this.horizontalScaler.transform(this.currentActiveSelection.minimum - 0.5);
            const snappedX2 = this.horizontalScaler.transform(this.currentActiveSelection.maximum + 0.5);
            selectionVisual.setAttribute('x', snappedX1);
            selectionVisual.setAttribute('width', snappedX2 - snappedX1);

            this.onRangeModified(this.questionData.uniqueId, this.currentActiveSelection);

            this.parentContainer.querySelector('.reset-filter-button').style.display = 'inline';
        };

        triggerRect.addEventListener('mousedown', initiateSelection);
        this.svgCanvas.addEventListener('mousemove', updateSelection);
        this.svgCanvas.addEventListener('mouseup', finalizeSelection);
        this.svgCanvas.addEventListener('mouseleave', finalizeSelection);
    }

    clearActiveSelection() {
        if (this.selectionLayer) {
            const existingVisual = this.selectionLayer.querySelector('.selection-indicator');
            if (existingVisual) {
                existingVisual.remove();
            }
        }
        this.currentActiveSelection = null;
        this.parentContainer.querySelector('.reset-filter-button').style.display = 'none';
    }

    drawVisualization(allCategoryFrequencies, filteredCategoryFrequencies, activeParticipantsCount, totalParticipantsCount) {
        const chartGroup = this.svgCanvas.querySelector('g');
        const maxBarHeight = this.verticalScaler.range()[0];

        chartGroup.querySelectorAll('.category-bar-segment').forEach(el => el.remove());
        chartGroup.querySelectorAll('.proportion-line').forEach(el => el.remove());
        chartGroup.querySelectorAll('.confidence-interval-line').forEach(el => el.remove());
        chartGroup.querySelectorAll('.significance-marker').forEach(el => el.remove());

        allCategoryFrequencies.forEach(allData => {
            const filteredData = filteredCategoryFrequencies.find(d => d.key === allData.key);
            const xPosition = this.horizontalScaler.transform(allData.key - 0.5) + this.barDimensions.spacing;
            const visualBarWidth = this.barDimensions.width - 2 * this.barDimensions.spacing;

            const allBarHeightPx = maxBarHeight - this.verticalScaler.transform(allData.value);
            const filteredBarHeightPx = filteredData ? maxBarHeight - this.verticalScaler.transform(filteredData.value) : maxBarHeight;

            const allBackgroundPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            allBackgroundPath.setAttribute('d', `M${xPosition},${maxBarHeight}V${maxBarHeight - allBarHeightPx}h${visualBarWidth}V${maxBarHeight}Z`);
            allBackgroundPath.setAttribute('class', `category-bar-segment viz-bg-full viz-type-${this.questionData.categoryType}`);
            chartGroup.appendChild(allBackgroundPath);

            if (filteredData && filteredData.value > 0) {
                const foregroundPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                foregroundPath.setAttribute('d', `M${xPosition},${maxBarHeight}V${maxBarHeight - filteredBarHeightPx}h${visualBarWidth}V${maxBarHeight}Z`);
                foregroundPath.setAttribute('class', `category-bar-segment viz-fg-part viz-type-${this.questionData.categoryType}`);
                foregroundPath.setAttribute('clip-path', `url(#clip-${this.componentIdentifier})`);
                chartGroup.appendChild(foregroundPath);
            }

            if (!this.currentActiveSelection) {
                const expectedProportion = allData.value / totalParticipantsCount;
                const expectedFilteredCount = expectedProportion * activeParticipantsCount;
                const expectedLineY = this.verticalScaler.transform(expectedFilteredCount);

                const proportionLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                proportionLine.setAttribute('x1', xPosition);
                proportionLine.setAttribute('y1', expectedLineY);
                proportionLine.setAttribute('x2', xPosition + visualBarWidth);
                proportionLine.setAttribute('y2', expectedLineY);
                proportionLine.setAttribute('class', `proportion-line viz-type-${this.questionData.categoryType}`);
                chartGroup.appendChild(proportionLine);

                if (totalParticipantsCount > 0 && activeParticipantsCount > 0) {
                    const N = totalParticipantsCount;
                    const n = activeParticipantsCount;
                    const alpha = 1;
                    const pSmoothed = (allData.value + alpha) / (N + alpha * allCategoryFrequencies.length);

                    const standardError = Math.sqrt((pSmoothed * (1 - pSmoothed)) / n);
                    const zScore = 1.96;
                    const marginOfError = zScore * standardError;

                    const lowerBoundCount = n * Math.max(pSmoothed - marginOfError, 0);
                    const upperBoundCount = n * Math.min(pSmoothed + marginOfError, 1);

                    const lowerY = this.verticalScaler.transform(lowerBoundCount);
                    const upperY = this.verticalScaler.transform(upperBoundCount);

                    const confidenceLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    confidenceLine.setAttribute('x1', xPosition + visualBarWidth / 2);
                    confidenceLine.setAttribute('y1', lowerY);
                    confidenceLine.setAttribute('x2', xPosition + visualBarWidth / 2);
                    confidenceLine.setAttribute('y2', upperY);
                    confidenceLine.setAttribute('class', `confidence-interval-line viz-type-${this.questionData.categoryType}`);
                    chartGroup.appendChild(confidenceLine);

                    if (filteredData && filteredData.value > 0) {
                        const actualFilteredY = this.verticalScaler.transform(filteredData.value);
                        if (actualFilteredY < upperY || actualFilteredY > lowerY) {
                            const asteriskSymbol = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                            asteriskSymbol.setAttribute('x', xPosition + visualBarWidth / 2);
                            asteriskSymbol.setAttribute('y', 5);
                            asteriskSymbol.setAttribute('text-anchor', 'middle');
                            asteriskSymbol.setAttribute('font-size', '16px');
                            asteriskSymbol.setAttribute('fill', 'red');
                            asteriskSymbol.textContent = '*';
                            asteriskSymbol.setAttribute('class', 'significance-marker');
                            chartGroup.appendChild(asteriskSymbol);
                        }
                    }
                }
            }
        });

        if (this.currentActiveSelection) {
            const selectionVisual = this.selectionLayer.querySelector('.selection-indicator');
            if (selectionVisual) {
                this.selectionLayer.appendChild(selectionVisual);
            }
            this.parentContainer.querySelector('.reset-filter-button').style.display = 'inline';
        } else {
            this.parentContainer.querySelector('.reset-filter-button').style.display = 'none';
        }
    }
}

window.InsightEngine = SurveyInsightGenerator;