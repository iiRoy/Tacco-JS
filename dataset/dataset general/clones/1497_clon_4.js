const visualSpecs = new Map();
visualSpecs.set('unitMap', new Map([['NONE', 0], ['CURRENCY', 1], ['PERCENT', 2]]));
visualSpecs.set('cellSpacing', { x: 3, y: 2 });
visualSpecs.set('headerHeightSeries', [71, 53, 41, 41]); // Inner heights
visualSpecs.set('defaultLeafHeightValue', 40); // Inner height
visualSpecs.set('fontSizesHierarchy', [21, 18, 13, 13, 10]);
visualSpecs.set('legendFontSize', "13px");
visualSpecs.set('leafCellBackgroundPalette', ['#c5f2bc', '#78c875', '#2d9234', '#005b01', '#005b01']);
visualSpecs.set('leafCellTextPalette', ['#383628', '#383628', '#fff', '#fff', '#fff']);
visualSpecs.set('headerCellBackgroundPalette', ['#063256', '#10527e', '#1a72a5', '#1a72a5', '#1a72a5']);
visualSpecs.set('currencyFormatFunction', (val) => {
    if (typeof val !== 'number') return String(val);
    return val.toLocaleString('en-US', { style: 'decimal' });
});

let adjustedHeaderHeights = visualSpecs.get('headerHeightSeries').map(h => h + 2 * visualSpecs.get('cellSpacing').y);
visualSpecs.set('adjustedHeaderHeights', adjustedHeaderHeights);

let headerVerticalPositions = [0];
for (let i = 0; i < adjustedHeaderHeights.length; i++) {
    headerVerticalPositions.push(headerVerticalPositions[i] + adjustedHeaderHeights[i]);
}
visualSpecs.set('headerVerticalPositions', headerVerticalPositions);


function createVisualGrid(targetElement, startNode, visualSettings) {
    const internalState = {
        canvas: null,
        totalDimension: { width: 0, height: 0 },
        displayTitle: '',
        primaryNode: null,
        maxVisualDepth: 1, // Will be adjusted based on input and actual tree depth
        valueIndexToUse: 0,
        displayUnitType: visualSpecs.get('unitMap').get('CURRENCY'),
        maximumCellWidth: 0,
        interactionHandler: null,
        topOffset: 0,
        processedVisualElements: [],
        legendThresholds: [],
        minDataValue: null,
        maxDataValue: null
    };

    function getElementDimensions(element) {
        if (!element) return { width: 0, height: 0 };
        const rect = element.getBoundingClientRect();
        return { width: rect.width || element.clientWidth, height: rect.height || element.clientHeight };
    }

    function setupRenderer() {
        visualSettings = visualSettings || {};
        if (!targetElement || !startNode) return;

        const dims = getElementDimensions(targetElement);
        internalState.totalDimension.width = dims.width;
        internalState.totalDimension.height = dims.height;

        internalState.displayTitle = visualSettings.title || '';
        internalState.primaryNode = startNode;
        internalState.maxVisualDepth = visualSettings.depth || 1;
        internalState.valueIndexToUse = visualSettings.value_index || 0;
        internalState.displayUnitType = visualSpecs.get('unitMap').get(visualSettings.unit) || visualSpecs.get('unitMap').get('CURRENCY');
        internalState.maximumCellWidth = visualSettings.max_cell_width || internalState.totalDimension.width;
        internalState.interactionHandler = visualSettings.click_handler;

        internalState.topOffset = (internalState.displayTitle ? 50 : 0) + 30; // Title + legend space

        internalState.canvas = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        internalState.canvas.setAttribute("width", internalState.totalDimension.width);
        internalState.canvas.setAttribute("height", internalState.totalDimension.height);
        internalState.canvas.setAttribute("class", "visual-hierarchy-grid");
        targetElement.appendChild(internalState.canvas);
    }

    function prepareVisuals() {
        let uniqueIdCounter = 0;
        let currentHorizontalLeafPosition = -1;
        let maxChildrenCountAtLeafParentLevel = 0;

        const levelHorizontalOffsets = new Map();

        function calculateSpanRecursive(node, level, maxDepth) {
            if (!node || level + 1 >= maxDepth) {
                return 1;
            }
            return (node.children || []).reduce((sum, child) => sum + calculateSpanRecursive(child, level + 1, maxDepth), 0);
        }

        function calculateActualTreeDepth(node, currentDepth) {
            if (!node || !node.children || node.children.length === 0) {
                return currentDepth;
            }
            return Math.max(...node.children.map(child => calculateActualTreeDepth(child, currentDepth + 1)));
        }
        const actualTreeDepth = calculateActualTreeDepth(internalState.primaryNode, 0);
        internalState.maxVisualDepth = Math.min(actualTreeDepth + 1, internalState.maxVisualDepth);


        function generateAllVisualElements(node, currentLevel) {
            const currentCellId = uniqueIdCounter++;
            const nodeValue = node ? node.values[internalState.valueIndexToUse] : 0;

            if (node && node.values[internalState.valueIndexToUse] !== undefined) {
                if (internalState.minDataValue === null || nodeValue < internalState.minDataValue) {
                    internalState.minDataValue = nodeValue;
                }
                if (internalState.maxDataValue === null || nodeValue > internalState.maxDataValue) {
                    internalState.maxDataValue = nodeValue;
                }
            }

            const nodeSpan = calculateSpanRecursive(node, currentLevel, internalState.maxVisualDepth);

            const currentXOffsetForLevel = levelHorizontalOffsets.get(currentLevel) || 0;
            levelHorizontalOffsets.set(currentLevel, currentXOffsetForLevel + nodeSpan);

            if (currentLevel < internalState.maxVisualDepth) {
                const headerCell = {
                    elementId: currentCellId,
                    nodeRef: node,
                    isHeader: true,
                    level: currentLevel,
                    label: node ? node.label : '',
                    value: nodeValue,
                    horizontalStartCol: currentXOffsetForLevel,
                    horizontalSpan: nodeSpan,
                    layoutX: 0, layoutY: 0, layoutWidth: 0, layoutHeight: 0,
                    backgroundColor: '', textColor: '', fontSize: ''
                };
                internalState.processedVisualElements.push(headerCell);
            }

            if (node && node.children) {
                if (currentLevel === internalState.maxVisualDepth - 1) {
                    currentHorizontalLeafPosition++;
                    maxChildrenCountAtLeafParentLevel = Math.max(maxChildrenCountAtLeafParentLevel, node.children.length);

                    node.children.forEach((child, childIdx) => {
                        const leafCellId = uniqueIdCounter++;
                        const leafNodeValue = child ? child.values[internalState.valueIndexToUse] : 0;

                        const leafCell = {
                            elementId: leafCellId,
                            nodeRef: child,
                            isHeader: false,
                            level: internalState.maxVisualDepth,
                            label: child ? child.label : '',
                            value: leafNodeValue,
                            horizontalStartCol: currentHorizontalLeafPosition,
                            horizontalSpan: 1,
                            verticalLeafIndex: childIdx,
                            layoutX: 0, layoutY: 0, layoutWidth: 0, layoutHeight: 0,
                            backgroundColor: '', textColor: '', fontSize: ''
                        };
                        internalState.processedVisualElements.push(leafCell);
                    });
                } else {
                    node.children.forEach(child => {
                        generateAllVisualElements(child, currentLevel + 1);
                    });
                }
            } else if (currentLevel === internalState.maxVisualDepth - 1 && (!node || !node.children || node.children.length === 0)) {
                currentHorizontalLeafPosition++;
                maxChildrenCountAtLeafParentLevel = Math.max(maxChildrenCountAtLeafParentLevel, 1);

                const leafCellId = uniqueIdCounter++;
                const leafCell = {
                    elementId: leafCellId,
                    nodeRef: null,
                    isHeader: false,
                    level: internalState.maxVisualDepth,
                    label: '',
                    value: 0,
                    horizontalStartCol: currentHorizontalLeafPosition,
                    horizontalSpan: 1,
                    verticalLeafIndex: 0,
                    layoutX: 0, layoutY: 0, layoutWidth: 0, layoutHeight: 0,
                    backgroundColor: '', textColor: '', fontSize: ''
                };
                internalState.processedVisualElements.push(leafCell);
            }
        }

        generateAllVisualElements(internalState.primaryNode, 0);

        const totalLeafColumnsActual = currentHorizontalLeafPosition === -1 ? 1 : currentHorizontalLeafPosition + 1;
        const cellUnitWidth = Math.min(internalState.maximumCellWidth, internalState.totalDimension.width / totalLeafColumnsActual);
        const adjustedHeaderHeights = visualSpecs.get('adjustedHeaderHeights');
        const headerVerticalPositions = visualSpecs.get('headerVerticalPositions');

        let totalHeaderPixelHeight = 0;
        for (let i = 0; i < internalState.maxVisualDepth; i++) {
            totalHeaderPixelHeight += adjustedHeaderHeights[i];
        }

        const cellUnitHeight = (internalState.totalDimension.height - internalState.topOffset - totalHeaderPixelHeight) / (maxChildrenCountAtLeafParentLevel === 0 ? 1 : maxChildrenCountAtLeafParentLevel);
        const actualLeafHeight = cellUnitHeight > visualSpecs.get('adjustedDefaultLeafHeight') ? visualSpecs.get('adjustedDefaultLeafHeight') : cellUnitHeight;

        updateLegendThresholds(internalState.minDataValue, internalState.maxDataValue);

        internalState.processedVisualElements.forEach(element => {
            if (element.isHeader) {
                element.layoutX = element.horizontalStartCol * cellUnitWidth + visualSpecs.get('cellSpacing').x;
                element.layoutY = headerVerticalPositions[element.level] + visualSpecs.get('cellSpacing').y + internalState.topOffset;
                element.layoutWidth = element.horizontalSpan * cellUnitWidth - 2 * visualSpecs.get('cellSpacing').x;
                element.layoutHeight = adjustedHeaderHeights[element.level] - 2 * visualSpecs.get('cellSpacing').y;
                element.backgroundColor = visualSpecs.get('headerCellBackgroundPalette')[element.level] || visualSpecs.get('headerCellBackgroundPalette')[visualSpecs.get('headerCellBackgroundPalette').length - 1];
                element.textColor = '#fff';
                element.fontSize = visualSpecs.get('fontSizesHierarchy')[element.level] + 'px';
            } else {
                element.layoutX = element.horizontalStartCol * cellUnitWidth + visualSpecs.get('cellSpacing').x;
                element.layoutY = totalHeaderPixelHeight + internalState.topOffset + (element.verticalLeafIndex * actualLeafHeight) + visualSpecs.get('cellSpacing').y;
                element.layoutWidth = element.horizontalSpan * cellUnitWidth - 2 * visualSpecs.get('cellSpacing').x;
                element.layoutHeight = actualLeafHeight - 2 * visualSpecs.get('cellSpacing').y;

                const colorIdx = getHeatmapColorIndex(element.value);
                element.backgroundColor = visualSpecs.get('leafCellBackgroundPalette')[colorIdx];
                element.textColor = visualSpecs.get('leafCellTextPalette')[colorIdx];
                element.fontSize = visualSpecs.get('fontSizesHierarchy')[3] + 'px';
                element.displayText = formatValueForDisplay(element.value, internalState.displayUnitType, internalState.primaryNode.values[internalState.valueIndexToUse]);
                element.showText = (element.layoutHeight - 2 * visualSpecs.get('cellSpacing').y) >= 12;
            }
        });

        if (internalState.displayTitle) {
            internalState.processedVisualElements.push({
                elementId: 'chart-title',
                isTitle: true,
                label: internalState.displayTitle,
                layoutX: internalState.totalDimension.width / 2,
                layoutY: internalState.topOffset - 40,
                fontSize: '24px',
                textColor: '#333'
            });
        }
    }

    function updateLegendThresholds(minVal, maxVal) {
        minVal = Math.min(0, minVal);
        const step = (maxVal - minVal) / 4;
        internalState.legendThresholds = [
            Math.round(minVal + step),
            Math.round(minVal + 2 * step),
            Math.round(minVal + 3 * step)
        ];
    }

    function getHeatmapColorIndex(val) {
        if (val < internalState.legendThresholds[0]) return 0;
        if (val < internalState.legendThresholds[1]) return 1;
        if (val < internalState.legendThresholds[2]) return 2;
        return 3;
    }

    function formatValueForDisplay(val, unitType, totalRootValue) {
        if (unitType === visualSpecs.get('unitMap').get('PERCENT')) {
            return (val * 100 / totalRootValue).toFixed(1) + '%';
        } else if (unitType === visualSpecs.get('unitMap').get('CURRENCY')) {
            return visualSpecs.get('currencyFormatFunction')(Math.round(val));
        }
        return String(val);
    }

    function renderLegend() {
        let existingLegend = internalState.canvas.querySelector('.visual-legend');
        if (existingLegend) internalState.canvas.removeChild(existingLegend);

        const legendGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        legendGroup.setAttribute('class', 'visual-legend');
        legendGroup.setAttribute('transform', `translate(6,${internalState.topOffset - 25})`);

        const boxSize = 14;
        const boxMargin = 4;
        const itemMargin = 10;
        let currentX = 0;

        const labels = createLegendLabels(internalState.legendThresholds, internalState.displayUnitType, internalState.primaryNode.values[internalState.valueIndexToUse]);

        labels.forEach((item, idx) => {
            const itemGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            itemGroup.setAttribute('class', 'legend-item');

            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute('x', currentX);
            rect.setAttribute('y', 0);
            rect.setAttribute('width', boxSize);
            rect.setAttribute('height', boxSize);
            rect.setAttribute('fill', visualSpecs.get('leafCellBackgroundPalette')[idx]);
            rect.setAttribute('rx', 3);
            rect.setAttribute('ry', 3);
            itemGroup.appendChild(rect);

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.textContent = item.text;
            text.setAttribute('font-size', visualSpecs.get('legendFontSize'));
            text.setAttribute('fill', '#333');
            text.setAttribute('x', currentX + boxSize + boxMargin);
            text.setAttribute('y', 11);
            itemGroup.appendChild(text);

            legendGroup.appendChild(itemGroup);
            currentX += boxSize + boxMargin + item.width + itemMargin;
        });
        internalState.canvas.appendChild(legendGroup);
    }

    function createLegendLabels(thresholds, unitType, totalRootValue) {
        const separator = '―';
        let formattedLabels = [];
        const formatter = (val) => formatValueForDisplay(val, unitType, totalRootValue);

        formattedLabels.push({ text: `< ${formatter(thresholds[0])}`, width: String(`< ${formatter(thresholds[0])}`).length * 8 });
        formattedLabels.push({ text: `${formatter(thresholds[0])}${separator}${formatter(thresholds[1])}`, width: String(`${formatter(thresholds[0])}${separator}${formatter(thresholds[1])}`).length * 8 });
        formattedLabels.push({ text: `${formatter(thresholds[1])}${separator}${formatter(thresholds[2])}`, width: String(`${formatter(thresholds[1])}${separator}${formatter(thresholds[2])}`).length * 8 });
        formattedLabels.push({ text: `> ${formatter(thresholds[2])}`, width: String(`> ${formatter(thresholds[2])}`).length * 8 });

        return formattedLabels;
    }

    function drawChartElements() {
        while (internalState.canvas.firstChild) {
            internalState.canvas.removeChild(internalState.canvas.firstChild);
        }

        internalState.processedVisualElements.forEach(elementData => {
            if (elementData.isTitle) {
                const titleText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                titleText.textContent = elementData.label;
                titleText.setAttribute('x', elementData.layoutX);
                titleText.setAttribute('y', elementData.layoutY);
                titleText.setAttribute('text-anchor', 'middle');
                titleText.setAttribute('font-size', elementData.fontSize);
                titleText.setAttribute('fill', elementData.textColor);
                internalState.canvas.appendChild(titleText);
            } else {
                const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
                group.setAttribute('class', elementData.isHeader ? 'visual-header-cell' : 'visual-leaf-cell');
                group.setAttribute('transform', `translate(${elementData.layoutX},${elementData.layoutY})`);

                const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                rect.setAttribute('width', elementData.layoutWidth);
                rect.setAttribute('height', elementData.layoutHeight);
                rect.setAttribute('fill', elementData.backgroundColor);
                rect.setAttribute('rx', 3);
                rect.setAttribute('ry', 3);
                group.appendChild(rect);

                if (elementData.showText || elementData.isHeader) {
                    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    text.textContent = elementData.isHeader ? elementData.label : elementData.displayText;
                    text.setAttribute('x', elementData.layoutWidth / 2);
                    text.setAttribute('y', elementData.layoutHeight / 2);
                    text.setAttribute('dy', '0.35em');
                    text.setAttribute('text-anchor', 'middle');
                    text.setAttribute('font-size', elementData.fontSize);
                    text.setAttribute('fill', elementData.textColor);
                    if (!elementData.isHeader && !elementData.showText) {
                        text.style.display = 'none';
                    }
                    group.appendChild(text);
                }
                
                if (internalState.interactionHandler && elementData.nodeRef) {
                    group.addEventListener('click', (e) => {
                        const isDrillDown = e.detail === 1;
                        internalState.interactionHandler(isDrillDown, elementData.nodeRef);
                    });
                    group.style.cursor = 'pointer';
                }

                internalState.canvas.appendChild(group);
            }
        });
        renderLegend();
    }

    function displayHierarchy() {
        setupRenderer();
        prepareVisuals();
        drawChartElements();
    }

    return {
        display: displayHierarchy
    };
}