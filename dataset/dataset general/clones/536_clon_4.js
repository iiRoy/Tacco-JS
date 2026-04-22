const renderManager = (function() {
    let visualizationConfigurations = [];
    let nextVisualizationId = 0;
    let enableConsoleOutput = false;

    function output(message) {
        if (enableConsoleOutput) {
            console.log(message);
        }
    }

    class DelayProcessor {
        constructor() {
            this.activeTimers = new Map();
        }

        scheduleOperation(taskFunction, delayDuration, taskKey) {
            if (this.activeTimers.has(taskKey)) {
                clearTimeout(this.activeTimers.get(taskKey));
            }
            const newTimer = setTimeout(() => {
                this.activeTimers.delete(taskKey);
                taskFunction();
            }, delayDuration);
            this.activeTimers.set(taskKey, newTimer);
        }
    }
    const windowResizerDebouncer = new DelayProcessor();

    function refreshAllVisuals() {
        windowResizerDebouncer.scheduleOperation(() => {
            for (const config of visualizationConfigurations) {
                const oldSvg = document.getElementById(config.displayOptions.svgElementId);
                if (oldSvg) oldSvg.remove();

                const legendSelector = config.displayOptions.destinationContainer + " .visual-legend";
                const oldLegend = document.querySelector(legendSelector);
                if (oldLegend) oldLegend.remove();

                renderVisualization(
                    config.kind,
                    config.originElementSelector,
                    config.dataField,
                    config.displayOptions
                );
            }
        }, 500, "unique-resize-event-key");
    }

    function isNumeric(value) {
        return !Number.isNaN(Number.parseFloat(value)) && Number.isFinite(Number(value));
    }

    function extractTableData(identifier) {
        const targetTable = document.querySelector(identifier);
        if (!targetTable) {
            output(`Table with selector ${identifier} not found.`);
            return [];
        }

        const headerElements = Array.from(targetTable.querySelectorAll('thead th'));
        const columnLabels = headerElements.map(th => th.textContent.trim());

        const rowElements = Array.from(targetTable.querySelectorAll('tbody tr'));
        const extractedRows = rowElements.map(row => {
            const rowObject = {};
            const cellElements = Array.from(row.querySelectorAll('td'));
            cellElements.forEach((cell, cellIndex) => {
                const header = columnLabels[cellIndex];
                if (header) {
                    let cellText = cell.textContent.trim();
                    const cleanedValue = cellText.replace(/[\u00A3\u20AC\u0024\u0025\u00A2,]/g, "");

                    if (isNumeric(cleanedValue)) {
                        rowObject[header] = Number.parseFloat(cleanedValue);
                    } else {
                        rowObject[header] = cellText;
                    }
                }
            });
            return rowObject;
        });
        return extractedRows;
    }

    function deepMerge(target, source) {
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) && typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])) {
                    target[key] = deepMerge(target[key] || {}, source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
        return target;
    }

    function renderVisualization(kind, originElementSelector, dataField, customOptions) {
        const svgSupported = document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");

        let effectiveKind = kind;
        if (!svgSupported) {
            if (kind === 'bar' || kind === 'column') {
                effectiveKind = "tableBarChartAlternative";
            } else if (kind === 'donut' || kind === 'pie') {
                effectiveKind = "tableStackedAreaAlternative";
            }
        }

        const baseOptions = {
            elementLabels: "",
            destinationContainer: "",
            canvasHeight: 200,
            displaySourceTable: false,
            barHeightUnit: 30,
            spacingUnit: 15,
            labelPaddingOffset: 90,
            axisTicks: 4,
            showXAxis: true,
            palette: ["#D4451D", "#FF6C0C", "#FFB819", "#95D600"],
            centerHoleRadius: 55,
            includeLegend: false,
            donutCenterLabel: "",
            sliceDecimalPlaces: "none",
            addThousandsSeparator: false,
            valuePrefix: "",
            valueSuffix: "",
            clickAction: "",
            donutCenterTag: "",
            dataPointLabels: "value",
            enableLogging: false
        };

        const finalOptions = deepMerge(Object.assign({}, baseOptions), customOptions || {});
        if (finalOptions.enableLogging) {
            enableConsoleOutput = true;
        }

        const structuredData = extractTableData(originElementSelector);
        output("Structured data from table: ");
        output(structuredData);

        if (!finalOptions.displaySourceTable) {
            const sourceTableElement = document.querySelector(originElementSelector);
            if (sourceTableElement) {
                sourceTableElement.style.position = 'absolute';
                sourceTableElement.style.left = '-9999px';
            }
        }

        let fieldName;
        if (Array.isArray(dataField)) {
            fieldName = dataField[0];
        } else {
            fieldName = dataField;
        }

        let targetContainerElement;
        if (finalOptions.destinationContainer === "") {
            const generatedId = `visual_${effectiveKind}_${fieldName}_${nextVisualizationId++}`;
            const newDiv = document.createElement('div');
            newDiv.id = generatedId;
            newDiv.className = 'graphic-render';
            document.querySelector(originElementSelector).insertAdjacentElement('afterend', newDiv);
            targetContainerElement = newDiv;
            finalOptions.destinationContainer = `#${generatedId}`;
        } else {
            targetContainerElement = document.querySelector(finalOptions.destinationContainer);
        }

        if (!targetContainerElement) {
            output("Target container for visualization not found.");
            return;
        }

        const visualMargins = { top: 20, left: 0, bottom: 10, right: 0 };
        const containerWidth = targetContainerElement.offsetWidth;
        let actualWidth = containerWidth - visualMargins.left - visualMargins.right;
        let actualHeight = finalOptions.canvasHeight;
        const spacing = finalOptions.spacingUnit;
        let labelOffset = 0;
        if (finalOptions.elementLabels !== "") {
            labelOffset = finalOptions.labelPaddingOffset;
        }

        if (effectiveKind === 'bar' || effectiveKind === 'comparison') {
            actualHeight = structuredData.length * finalOptions.barHeightUnit + 10;
        }
        if (effectiveKind === 'pie') {
            finalOptions.centerHoleRadius = 0;
        }

        const currentVisualConfig = {
            kind: kind,
            originElementSelector: originElementSelector,
            dataField: dataField,
            displayOptions: finalOptions
        };

        currentVisualConfig.displayOptions.svgElementId = `svg_${effectiveKind}_${fieldName}_${nextVisualizationId - 1}`;

        const existingConfigIndex = visualizationConfigurations.findIndex(cfg =>
            cfg.displayOptions.svgElementId === currentVisualConfig.displayOptions.svgElementId
        );
        if (existingConfigIndex === -1) {
            visualizationConfigurations.push(currentVisualConfig);
        } else {
            visualizationConfigurations[existingConfigIndex] = currentVisualConfig;
        }

        function formatDisplayValue(value) {
            let formatted = value;
            if (finalOptions.sliceDecimalPlaces !== "none" && !Number.isNaN(Number(value))) {
                formatted = Number(value).toFixed(finalOptions.sliceDecimalPlaces);
            }
            if (finalOptions.addThousandsSeparator && !Number.isNaN(Number(formatted))) {
                formatted = Number(formatted).toLocaleString();
            }
            return finalOptions.valuePrefix + formatted + finalOptions.valueSuffix;
        }

        switch (effectiveKind) {
            case 'comparison':
                renderComparisonBarChart(targetContainerElement, structuredData, dataField, finalOptions, actualWidth, actualHeight, visualMargins, formatDisplayValue);
                break;
            default:
                output(`Visualization type "${effectiveKind}" not yet implemented in this renderer.`);
                break;
        }

        function attachLegend(container, data, labelKey, colorScale) {
            const legendDiv = document.createElement('div');
            legendDiv.className = 'visual-legend';
            data.forEach((d, i) => {
                const paragraph = document.createElement('p');
                const swatch = document.createElement('span');
                swatch.className = 'key-swatch';
                swatch.style.backgroundColor = colorScale[i % colorScale.length];

                const textSpan = document.createElement('span');
                textSpan.className = 'key-label';
                textSpan.textContent = d[labelKey];

                paragraph.appendChild(swatch);
                paragraph.appendChild(textSpan);
                legendDiv.appendChild(paragraph);
            });
            container.appendChild(legendDiv);
        }

        if (finalOptions.includeLegend && finalOptions.elementLabels) {
            attachLegend(targetContainerElement, structuredData, finalOptions.elementLabels, finalOptions.palette);
        }
    }

    function renderComparisonBarChart(container, data, fields, options, chartWidth, chartHeight, margins, formatter) {
        if (!Array.isArray(fields) || fields.length < 2) {
            output("Comparison chart requires at least two data fields.");
            return;
        }

        const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgElement.setAttribute('id', options.svgElementId);
        svgElement.setAttribute('width', chartWidth + margins.left + margins.right);
        svgElement.setAttribute('height', chartHeight + margins.top + margins.bottom);
        container.appendChild(svgElement);

        const mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        mainGroup.setAttribute('transform', `translate(${margins.left}, ${margins.top})`);
        svgElement.appendChild(mainGroup);

        const maxValue = Math.max(...data.flatMap(d => [d[fields[0]], d[fields[1]]]));
        const isPercentage = options.valueSuffix === "%";
        const effectiveMaxValue = isPercentage ? 100 : maxValue;

        const headerVisibilityCheck = document.querySelector(options.originElementSelector + " thead th.hide");
        const hasHiddenHeaders = headerVisibilityCheck !== null;
        const headerLabelOffset = hasHiddenHeaders ? 0 : 20;

        const maxLabelLength = Math.max(...data.map(d => (d[options.elementLabels] || '').length));
        const estimatedMiddleWidth = Math.max(options.labelPaddingOffset, maxLabelLength * 8 + 50);
        const barColumnWidth = (chartWidth - estimatedMiddleWidth) / 2;

        const scaleLeft = (value) => (barColumnWidth - 40) - (value / effectiveMaxValue) * (barColumnWidth - 40);
        const scaleRight = (value) => (value / effectiveMaxValue) * (barColumnWidth - 40);

        const centerLabelsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        centerLabelsGroup.setAttribute('transform', `translate(${chartWidth / 2}, ${headerLabelOffset * 1.5})`);
        mainGroup.appendChild(centerLabelsGroup);

        data.forEach((d, i) => {
            const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            labelText.textContent = d[options.elementLabels];
            labelText.setAttribute('y', i * options.barHeightUnit + options.barHeightUnit * 0.5);
            labelText.setAttribute('text-anchor', 'middle');
            labelText.style.fontWeight = 'bold';
            centerLabelsGroup.appendChild(labelText);
        });

        if (!hasHiddenHeaders) {
            const leftHeader = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            leftHeader.textContent = fields[0];
            leftHeader.setAttribute('x', barColumnWidth / 2);
            leftHeader.setAttribute('y', 20);
            leftHeader.setAttribute('text-anchor', 'middle');
            leftHeader.style.fontWeight = 'bold';
            mainGroup.appendChild(leftHeader);

            const rightHeader = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            rightHeader.textContent = fields[1];
            rightHeader.setAttribute('x', chartWidth - barColumnWidth / 2);
            rightHeader.setAttribute('y', 20);
            rightHeader.setAttribute('text-anchor', 'middle');
            rightHeader.style.fontWeight = 'bold';
            mainGroup.appendChild(rightHeader);
        }

        data.forEach((d, i) => {
            const yPosition = i * options.barHeightUnit + headerLabelOffset * 2;
            const barHeight = options.barHeightUnit - options.spacingUnit;

            const leftValue = d[fields[0]];
            const leftBarX = scaleLeft(leftValue);
            const leftBarWidth = (barColumnWidth - 40) - leftBarX;

            const leftRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            leftRect.setAttribute('x', leftBarX);
            leftRect.setAttribute('y', yPosition);
            leftRect.setAttribute('width', leftBarWidth);
            leftRect.setAttribute('height', barHeight);
            leftRect.setAttribute('fill', options.palette[0] || '#D4451D');
            mainGroup.appendChild(leftRect);

            const leftValueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            leftValueText.textContent = formatter(leftValue);
            leftValueText.setAttribute('x', leftBarX - 5);
            leftValueText.setAttribute('y', yPosition + barHeight / 2 + 5);
            leftValueText.setAttribute('text-anchor', 'end');
            leftValueText.style.fill = 'black';
            mainGroup.appendChild(leftValueText);

            const rightValue = d[fields[1]];
            const rightBarX = chartWidth - barColumnWidth + 40;
            const rightBarWidth = scaleRight(rightValue);

            const rightRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rightRect.setAttribute('x', rightBarX);
            rightRect.setAttribute('y', yPosition);
            rightRect.setAttribute('width', rightBarWidth);
            rightRect.setAttribute('height', barHeight);
            rightRect.setAttribute('fill', options.palette[1] || '#FF6C0C');
            mainGroup.appendChild(rightRect);

            const rightValueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            rightValueText.textContent = formatter(rightValue);
            rightValueText.setAttribute('x', rightBarX + rightBarWidth + 5);
            rightValueText.setAttribute('y', yPosition + barHeight / 2 + 5);
            rightValueText.setAttribute('text-anchor', 'start');
            rightValueText.style.fill = 'black';
            mainGroup.appendChild(rightValueText);

            const hoverOpacity = 0.8;
            const originalOpacity = 1;

            const applyHover = (element) => {
                element.addEventListener('mouseenter', () => element.setAttribute('fill-opacity', hoverOpacity));
                element.addEventListener('mouseleave', () => element.setAttribute('fill-opacity', originalOpacity));
            };
            applyHover(leftRect);
            applyHover(rightRect);

            if (typeof options.clickAction === 'function') {
                leftRect.style.cursor = 'pointer';
                rightRect.style.cursor = 'pointer';
                const clickHandler = (event) => options.clickAction(d, i, event);
                leftRect.addEventListener('click', clickHandler);
                rightRect.addEventListener('click', clickHandler);
            }
        });
    }

    function provideRenderHelp() {
        console.log('Call initiateVisualization("chartType", "#tableId", "dataColumnName", \n{ elementLabels: "labelColumn"\n, destinationContainer: "#targetDiv"\n, canvasHeight: 200\n, displaySourceTable: false\n, barHeightUnit: 30\n, spacingUnit: 15\n, axisTicks: 4\n, showXAxis: true\n, palette: ["#D4451D", "#FF6C0C", "#FFB819", "#95D600"]\n, centerHoleRadius: 55\n, sliceDecimalPlaces: "none"\n, addThousandsSeparator: false\n, valuePrefix: ""\n, valueSuffix: ""\n, clickAction: "" // Function (data, index, event)\n, includeLegend: false\n, donutCenterLabel: "Goals"\n, donutCenterTag: "Goals"\n, dataPointLabels: "value"\n, enableLogging: true // Expose console.log statements\n})');
    }

    return {
        initiateVisualization: renderVisualization,
        requestVisualRefresh: refreshAllVisuals,
        provideRenderHelp: provideRenderHelp
    };
})();

const initiateVisualization = renderManager.initiateVisualization;
const requestVisualRefresh = renderManager.requestVisualRefresh;
const provideRenderHelp = renderManager.provideRenderHelp;