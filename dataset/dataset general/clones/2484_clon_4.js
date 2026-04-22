const delayExecution = (operation, pauseDuration) => {
    let timerRef;
    return function (...args) {
        const context = this;
        clearTimeout(timerRef);
        timerRef = setTimeout(() => operation.apply(context, args), pauseDuration);
    };
};

const globalTooltip = (() => {
    let tooltipElement = null;

    const createTooltipElement = () => {
        const tip = document.createElement('div');
        tip.style.cssText = `
            position: absolute;
            display: none;
            padding: 8px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            border-radius: 4px;
            pointer-events: none;
            font-size: 12px;
            line-height: 1.4;
            z-index: 10000;
            white-space: nowrap;
        `;
        document.body.appendChild(tip);
        return tip;
    };

    const displayTooltip = (content, event) => {
        if (!tooltipElement) tooltipElement = createTooltipElement();
        tooltipElement.innerHTML = content;
        tooltipElement.style.display = 'block';
        adjustTooltipPosition(event);
    };

    const concealTooltip = () => {
        if (tooltipElement) {
            tooltipElement.style.display = 'none';
        }
    };

    const adjustTooltipPosition = (event) => {
        if (tooltipElement) {
            const currentTargetRect = event.currentTarget.getBoundingClientRect();
            const scrollXOffset = window.scrollX || document.documentElement.scrollLeft;
            const scrollYOffset = window.scrollY || document.documentElement.scrollTop;

            const tipWidth = tooltipElement.offsetWidth;
            const tipHeight = tooltipElement.offsetHeight;

            let topCoord = currentTargetRect.top + scrollYOffset - tipHeight - 10;
            let leftCoord = currentTargetRect.left + scrollXOffset + (currentTargetRect.width / 2) - (tipWidth / 2);

            if (leftCoord < 0) leftCoord = 0;
            if (topCoord < 0) topCoord = 0;

            tooltipElement.style.top = `${topCoord}px`;
            tooltipElement.style.left = `${leftCoord}px`;
        }
    };

    const initializeTooltipTargets = (rootElement) => {
        const targets = rootElement.querySelectorAll('[data-info-bubble]');
        targets.forEach(target => {
            const content = target.getAttribute('data-info-bubble');
            if (content) {
                target.removeEventListener('mouseover', (e) => displayTooltip(content, e)); // Prevent duplicate listeners
                target.removeEventListener('mousemove', adjustTooltipPosition);
                target.removeEventListener('mouseout', concealTooltip);

                target.addEventListener('mouseover', (e) => displayTooltip(content, e));
                target.addEventListener('mousemove', adjustTooltipPosition);
                target.addEventListener('mouseout', concealTooltip);
            }
        });
    };

    return {
        updateTargets: initializeTooltipTargets,
        hideAll: concealTooltip
    };
})();

const VisualizationEngine = (() => {

    const createNumericScale = (inputDomain, outputRange) => {
        const [domainMin, domainMax] = inputDomain;
        const [rangeMin, rangeMax] = outputRange;
        const domainSpan = domainMax - domainMin;
        const rangeSpan = rangeMax - rangeMin;

        return (value) => {
            if (domainSpan === 0) return rangeMin;
            const normalizedValue = (value - domainMin) / domainSpan;
            return rangeMin + (normalizedValue * rangeSpan);
        };
    };

    const createLogarithmicScale = (inputDomain, outputRange) => {
        const [domainMin, domainMax] = inputDomain;
        const [rangeMin, rangeMax] = outputRange;

        if (domainMin <= 0 || domainMax <= 0) {
            return createNumericScale(inputDomain, outputRange); // Fallback
        }

        const logDomainMin = Math.log(domainMin);
        const logDomainMax = Math.log(domainMax);
        const logDomainSpan = logDomainMax - logDomainMin;
        const rangeSpan = rangeMax - rangeMin;

        return (value) => {
            if (value <= 0) return rangeMin;
            if (logDomainSpan === 0) return rangeMin;
            const normalizedValue = (Math.log(value) - logDomainMin) / logDomainSpan;
            return rangeMin + (normalizedValue * rangeSpan);
        };
    };

    const createCategoricalScale = (categoryValues, outputRange, paddingRatio = 0) => {
        const [rangeMin, rangeMax] = outputRange;
        const totalRange = rangeMax - rangeMin;
        const numberOfCategories = categoryValues.length;
        const stepSize = totalRange / numberOfCategories;
        const bandSize = stepSize * (1 - paddingRatio);
        const paddingAmount = stepSize * paddingRatio;

        const scaleMap = new Map();
        categoryValues.forEach((value, index) => {
            scaleMap.set(value, rangeMin + (index * stepSize) + (paddingAmount / 2));
        });

        const getPosition = (value) => scaleMap.get(value);
        getPosition.barDimension = () => bandSize;

        return getPosition;
    };

    const generateSvgElement = (tagName, attributes = {}) => {
        const element = document.createElementNS('http://www.w3.org/2000/svg', tagName);
        for (const key in attributes) {
            if (attributes.hasOwnProperty(key)) {
                element.setAttribute(key, attributes[key]);
            }
        }
        return element;
    };

    const gatherAlignmentInfo = (sourceElement, displayOffset, displayLimit) => {
        const hitPanelElements = Array.from(sourceElement.querySelectorAll('.hitn'))
            .slice(0, displayOffset + displayLimit);
        const alignmentRecords = [];

        hitPanelElements.forEach(panel => {
            const hspSubElements = Array.from(panel.querySelectorAll('.hsp'));
            const panelHsps = [];

            hspSubElements.forEach(hspEl => {
                const hspData = { ...hspEl.dataset };
                hspData.hspIdentifier = hspEl.id;
                panelHsps.push(hspData);
            });

            panelHsps.hitIdentifier = panel.id;
            panelHsps.hitDescription = panel.dataset.hitDef;
            panelHsps.hitEvalue = parseFloat(panel.dataset.hitEvalue);
            alignmentRecords.push(panelHsps);
        });
        return alignmentRecords;
    };

    const constructSvgCanvas = (container, visualWidth, visualHeight, chartMargins) => {
        Array.from(container.querySelectorAll('svg')).forEach(el => el.remove());

        const svgCanvas = generateSvgElement('svg', {
            width: visualWidth,
            height: visualHeight,
        });

        const mainGroup = generateSvgElement('g', {
            transform: `translate(${chartMargins / 4}, ${chartMargins / 4})`
        });
        svgCanvas.appendChild(mainGroup);

        container.prepend(svgCanvas);

        return { svg: svgCanvas, drawingArea: mainGroup };
    };

    const renderHorizontalAxis = (targetGroup, scaleFunction, chartMargins, dataLength) => {
        const axisGroup = generateSvgElement('g', {
            transform: `translate(0, ${chartMargins})`,
            class: 'x axis'
        });
        targetGroup.appendChild(axisGroup);

        const desiredTickCount = 11;
        const rawTicks = [];
        const tickIncrement = dataLength / (desiredTickCount - 1);
        for (let i = 0; i < desiredTickCount; i++) {
            rawTicks.push(Math.round(1 + i * tickIncrement));
        }
        if (!rawTicks.includes(1)) rawTicks.unshift(1);
        if (!rawTicks.includes(dataLength)) rawTicks.push(dataLength);

        const filteredTicks = rawTicks.filter((t, i, arr) => {
            if (i === 0 || i === arr.length - 1) return true;
            const previousTick = arr[i - 1];
            return (scaleFunction(t) - scaleFunction(previousTick)) > 30;
        });

        filteredTicks.forEach(tickValue => {
            const xPosition = scaleFunction(tickValue);
            axisGroup.appendChild(generateSvgElement('line', {
                x1: xPosition, y1: 0, x2: xPosition, y2: 6, stroke: '#000', 'stroke-width': 1
            }));
            axisGroup.appendChild(generateSvgElement('text', {
                x: xPosition, y: -5, 'text-anchor': 'middle', fill: '#000'
            })).textContent = tickValue;
        });

        axisGroup.appendChild(generateSvgElement('path', {
            d: `M0,0H${scaleFunction(dataLength)}`,
            fill: 'none',
            stroke: '#000',
            'stroke-width': 1
        }));
    };

    const createColorGradientDefinition = (svgContainer) => {
        const gradient = generateSvgElement('linearGradient', { id: 'intensity-gradient' });
        svgContainer.appendChild(gradient);

        const colorStops = [
            { offset: "0%", color: "#ccc" },
            { offset: '50%', color: '#888' },
            { offset: "100%", color: "#000" }
        ];

        colorStops.forEach(stopData => {
            gradient.appendChild(generateSvgElement('stop', {
                offset: stopData.offset,
                'stop-color': stopData.color
            }));
        });
    };

    const visualizeStrengthLegend = (svgContainer, options, visualWidth, visualHeight) => {
        const legendGroup = generateSvgElement('g', {
            transform: `translate(0, ${visualHeight - options.chartMargins - options.legendHeight * 1.25})`
        });
        svgContainer.appendChild(legendGroup);

        legendGroup.appendChild(generateSvgElement('rect', {
            x: 7 * (visualWidth - 2 * options.chartMargins) / 10,
            width: 2 * (visualWidth - 4 * options.chartMargins) / 10,
            height: options.legendHeight,
            fill: 'url(#intensity-gradient)'
        }));

        legendGroup.appendChild(generateSvgElement('text', {
            transform: `translate(0, ${options.legendHeight})`,
            x: 6 * (visualWidth - 2 * options.chartMargins) / 10 - options.chartMargins / 2,
            fill: '#000'
        })).textContent = "Weaker hits";

        legendGroup.appendChild(generateSvgElement('text', {
            transform: `translate(0, ${options.legendHeight})`,
            x: 9 * (visualWidth - 2 * options.chartMargins) / 10 + options.chartMargins / 2,
            fill: '#000'
        })).textContent = "Stronger hits";

        createColorGradientDefinition(svgContainer);
    };

    const handleLinkNavigation = (container) => {
        container.querySelectorAll('a[data-destination]').forEach(link => {
            link.removeEventListener('click', preventDefaultAndNavigate);
            link.addEventListener('click', preventDefaultAndNavigate);
        });
    };

    const preventDefaultAndNavigate = (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        window.location.hash = evt.currentTarget.getAttribute('data-destination');
    };

    const manageDisplayButtons = (sourceElement, targetElement, isInitialRender, redrawFunction) => {
        const MINIMUM_VISIBLE_COUNT = 20;
        let totalRecordsAvailable, currentlyDisplayedRecords;
        let showLessButton, showMoreButton;

        const updateRecordCounts = () => {
            totalRecordsAvailable = parseInt(sourceElement.dataset.hitCount || '0', 10);
            currentlyDisplayedRecords = targetElement.querySelectorAll('.alignment-group > g').length;
        };

        const generateControlButtons = (sourceId) => {
            const moreBtn = document.createElement('button');
            moreBtn.className = 'btn btn-link more-results';
            moreBtn.type = 'button';
            moreBtn.dataset.parentQuery = sourceId;
            moreBtn.innerHTML = 'View More&nbsp;<i class="fa fa-angle-double-down"></i>';

            const lessBtn = document.createElement('button');
            lessBtn.className = 'btn btn-link less-results';
            lessBtn.type = 'button';
            lessBtn.dataset.parentQuery = sourceId;
            lessBtn.innerHTML = 'View Less&nbsp;<i class="fa fa-angle-double-up"></i>';

            targetElement.appendChild(moreBtn);
            targetElement.appendChild(lessBtn);

            showLessButton = lessBtn;
            showMoreButton = moreBtn;
        };

        const syncButtonVisibility = () => {
            updateRecordCounts();
            if (totalRecordsAvailable === MINIMUM_VISIBLE_COUNT || currentlyDisplayedRecords < MINIMUM_VISIBLE_COUNT) {
                showLessButton.style.display = 'none';
                showMoreButton.style.display = 'none';
            } else if (currentlyDisplayedRecords === totalRecordsAvailable) {
                showMoreButton.style.display = 'none';
                showLessButton.style.display = 'block';
            } else if (currentlyDisplayedRecords === MINIMUM_VISIBLE_COUNT) {
                showLessButton.style.display = 'none';
                showMoreButton.style.display = 'block';
            } else {
                showLessButton.style.display = 'block';
                showMoreButton.style.display = 'block';
            }
        };

        if (isInitialRender) {
            generateControlButtons(sourceElement.id);
            syncButtonVisibility();

            showMoreButton.addEventListener('click', (e) => {
                updateRecordCounts();
                redrawFunction(sourceElement, targetElement, currentlyDisplayedRecords, MINIMUM_VISIBLE_COUNT);
                syncButtonVisibility();
                globalTooltip.updateTargets(targetElement);
                e.stopPropagation();
            });

            showLessButton.addEventListener('click', (e) => {
                updateRecordCounts();
                const difference = currentlyDisplayedRecords - MINIMUM_VISIBLE_COUNT;

                if (difference >= MINIMUM_VISIBLE_COUNT) {
                    redrawFunction(sourceElement, targetElement, currentlyDisplayedRecords, -MINIMUM_VISIBLE_COUNT);
                } else if (difference !== 0) {
                    redrawFunction(sourceElement, targetElement, currentlyDisplayedRecords, MINIMUM_VISIBLE_COUNT - currentlyDisplayedRecords);
                }
                syncButtonVisibility();
                globalTooltip.updateTargets(targetElement);
                e.stopPropagation();
            });
        } else {
            syncButtonVisibility();
        }
    };

    const monitorWindowSize = (sourceElement, targetElement, startOffset, diagramOptions, redrawFunction) => {
        let lastViewportWidth = window.innerWidth;
        const debouncedResizeHandler = delayExecution(() => {
            if (lastViewportWidth !== window.innerWidth) {
                const currentVisibleHits = targetElement.querySelectorAll('.alignment-group > g').length;
                redrawFunction(sourceElement, targetElement, currentVisibleHits, 0, diagramOptions);
                lastViewportWidth = window.innerWidth;
            }
        }, 125);
        window.addEventListener('resize', debouncedResizeHandler);
    };

    const renderAlignmentDiagram = (sourceContainer, targetContainer, startOffset, displayCount, diagramOptions) => {
        const defaultSettings = {
            trackHeight: 4,
            trackSpacing: 5,
            legendHeight: 10,
            chartMargins: 20
        };
        const activeOptions = { ...defaultSettings, ...diagramOptions };

        const alignmentRecords = gatherAlignmentInfo(sourceContainer, startOffset, displayCount);

        if (alignmentRecords.length < 1) return false;

        const isInitialCall = (startOffset === 0);

        const queryLength = parseInt(sourceContainer.dataset.queryLen, 10);
        const queryIdentifier = sourceContainer.id;

        const visualWidth = targetContainer.offsetWidth;
        const visualHeight = alignmentRecords.length * (activeOptions.trackHeight + activeOptions.trackSpacing) +
            5 * activeOptions.chartMargins + activeOptions.legendHeight * 3;

        const { svg, drawingArea } = constructSvgCanvas(targetContainer, visualWidth, visualHeight, activeOptions.chartMargins);

        const horizontalPositionScale = createNumericScale([1, queryLength], [0, visualWidth - activeOptions.chartMargins]);
        renderHorizontalAxis(drawingArea, horizontalPositionScale, activeOptions.chartMargins, queryLength);

        const verticalCategoryScale = createCategoricalScale(
            alignmentRecords.map(d => d.hitIdentifier),
            [0, visualHeight - 3 * activeOptions.chartMargins - 2 * activeOptions.legendHeight],
            0.3
        );

        const colorIntensityScale = createLogarithmicScale(
            [
                Math.min(1e-5, ...alignmentRecords.map(d => d.hitEvalue > 0 ? d.hitEvalue : Infinity)),
                Math.max(...alignmentRecords.map(d => d.hitEvalue))
            ],
            [40, 150]
        );

        const alignmentGroupsContainer = generateSvgElement('g', {
            class: 'alignment-group',
            transform: `translate(0, ${2 * activeOptions.chartMargins - activeOptions.legendHeight})`
        });
        drawingArea.appendChild(alignmentGroupsContainer);

        alignmentRecords.forEach((record, index) => {
            const hitVisualGroup = generateSvgElement('g', {
                'data-info-bubble': (() => {
                    const evalue = record.hitEvalue;
                    const regex = /(\d*\.\d*)e?([+-]\d*)?/;
                    const parsedVal = regex.exec(evalue.toString());
                    let formattedEvalue = parseFloat(parsedVal[1]).toFixed(3);
                    let tooltipString = record.hitDescription + '<br><strong>E value:</strong> ' + formattedEvalue;
                    if (parsedVal[2] !== undefined) {
                        tooltipString += ' &times; 10<sup>' + parsedVal[2] + '</sup>';
                    }
                    return tooltipString;
                })(),
                'data-identifier': record.hitIdentifier
            });
            alignmentGroupsContainer.appendChild(hitVisualGroup);

            const hitColorValue = colorIntensityScale(record.hitEvalue);
            const hitDisplayColor = `rgb(${hitColorValue},${hitColorValue},${hitColorValue})`;

            record.forEach((hsp, hspIndex) => {
                const linkElement = generateSvgElement('a', {
                    'data-destination': `#${queryIdentifier}_hit_${index + 1}`
                });
                hitVisualGroup.appendChild(linkElement);

                linkElement.appendChild(generateSvgElement('rect', {
                    x: horizontalPositionScale(parseInt(hsp.hspStart, 10)),
                    y: verticalCategoryScale(record.hitIdentifier),
                    width: horizontalPositionScale(parseInt(hsp.hspEnd, 10) - parseInt(hsp.hspStart, 10) + 1) - horizontalPositionScale(1),
                    height: activeOptions.trackHeight,
                    fill: hitDisplayColor
                }));

                if (hspIndex + 1 < record.length) {
                    const nextHsp = record[hspIndex + 1];
                    const yLinePosition = verticalCategoryScale(record.hitIdentifier) + activeOptions.trackHeight / 2;

                    let xStartLine, xEndLine;
                    if (parseInt(hsp.hspEnd, 10) <= parseInt(nextHsp.hspStart, 10)) {
                        xStartLine = horizontalPositionScale(parseInt(hsp.hspEnd, 10));
                        xEndLine = horizontalPositionScale(parseInt(nextHsp.hspStart, 10));
                    } else if (parseInt(hsp.hspStart, 10) > parseInt(nextHsp.hspEnd, 10)) {
                        xStartLine = horizontalPositionScale(parseInt(nextHsp.hspEnd, 10));
                        xEndLine = horizontalPositionScale(parseInt(hsp.hspStart, 10));
                    }

                    if (xStartLine !== undefined && xEndLine !== undefined) {
                        hitVisualGroup.appendChild(generateSvgElement('line', {
                            x1: xStartLine, y1: yLinePosition, x2: xEndLine, y2: yLinePosition, stroke: hitDisplayColor, 'stroke-width': 1
                        }));
                    }
                }
            });
        });

        if (alignmentRecords.length > 1) {
            visualizeStrengthLegend(svg, activeOptions, visualWidth, visualHeight);
        }

        if (isInitialCall) {
            manageDisplayButtons(sourceContainer, targetContainer, true, renderAlignmentDiagram);
            monitorWindowSize(sourceContainer, targetContainer, startOffset, diagramOptions, renderAlignmentDiagram);
        }

        globalTooltip.updateTargets(targetContainer);
        handleLinkNavigation(targetContainer);
    };

    return {
        initializeDiagram: renderAlignmentDiagram
    };
})();

(function (root) {
    if (typeof root.jQuery !== 'undefined') {
        root.jQuery.extend({
            graphIt: VisualizationEngine.initializeDiagram
        });
    } else {
        root.VisualizationEngine = VisualizationEngine;
    }
})(window);