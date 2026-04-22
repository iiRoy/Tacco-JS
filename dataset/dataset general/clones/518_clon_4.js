(function() {

    const configurationStore = {
        autoRecalculateOnResize: true,
        processRootElement: true
    };

    const classificationPatterns = {
        rowDivision: /(^|\s+)on\-(\d+)(\s+|$)/,
        itemSpan: /(^|\s+)span\-(\d+)(\s+|$)/,
        fixedItem: /(^|\s+)fixed(\s+|$)/,
        flexibleItem: /(^|\s+)elastic(\s+|$)/,
        adaptiveItem: /(^|\s+)adaptive\-(\d+)\-(\d+)(\s+|$)/,
        lastItemInRow: /(^|\s+)final(\s+|$)/,
        layoutDisplay: /(^|\s+)display\s+([\w\_\-\d]+)(\s+|$)/
    };

    const widthDistributionMemory = new Map();

    const fetchElements = (selectionString, baseNode = document) => Array.from(baseNode.querySelectorAll(selectionString));

    const measureInnerWidth = (elem) => {
        const styleProps = getComputedStyle(elem);
        return elem.clientWidth - parseFloat(styleProps.paddingLeft) - parseFloat(styleProps.paddingRight);
    };

    const measureOuterWidth = (elem, includeMargins = false) => {
        let widthValue = elem.offsetWidth;
        if (includeMargins) {
            const styleProps = getComputedStyle(elem);
            widthValue += parseFloat(styleProps.marginLeft) + parseFloat(styleProps.marginRight);
        }
        return widthValue;
    };

    const measureOuterHeight = (elem, includeMargins = false) => {
        let heightValue = elem.offsetHeight;
        if (includeMargins) {
            const styleProps = getComputedStyle(elem);
            heightValue += parseFloat(styleProps.marginTop) + parseFloat(styleProps.marginBottom);
        }
        return heightValue;
    };

    const hasClassAttribute = (elem, cssClass) => elem.classList.contains(cssClass);

    const applyStyleProperty = (elem, prop, val) => {
        elem.style[prop] = val;
    };

    const calculateDistributedWidths = (totalDimension, partitions) => {
        if (widthDistributionMemory.has(totalDimension) && widthDistributionMemory.get(totalDimension).has(partitions)) {
            return widthDistributionMemory.get(totalDimension).get(partitions);
        }

        const percentagePerPartition = 100 / partitions;
        let baseDimension = Math.round(totalDimension * (percentagePerPartition / 100));
        let dimensionArray = Array.from({ length: partitions }, () => ({ segmentDimension: baseDimension }));
        let currentSum = dimensionArray.reduce((acc, obj) => acc + obj.segmentDimension, 0);
        let remaining = totalDimension - currentSum;

        if (remaining !== 0) {
            let absoluteRemaining = Math.abs(remaining);
            let adjustmentIncrement = remaining > 0 ? 1 : -1;
            let currentIndex = 0;

            for (let i = 0; i < absoluteRemaining; i++) {
                dimensionArray[currentIndex].segmentDimension += adjustmentIncrement;
                currentIndex = (currentIndex + 1) % partitions;
            }
        }

        if (!widthDistributionMemory.has(totalDimension)) {
            widthDistributionMemory.set(totalDimension, new Map());
        }
        widthDistributionMemory.get(totalDimension).set(partitions, dimensionArray);

        return dimensionArray;
    };

    const ascertainItemDivisions = (containerDiv, itemDivs) => {
        let maxDivisions = itemDivs.length;
        let explicitDivisionSet = false;

        if (classificationPatterns.rowDivision.test(containerDiv.className)) {
            maxDivisions = Number(RegExp.$2);
            explicitDivisionSet = true;
        }

        itemDivs.forEach(item => {
            if (classificationPatterns.itemSpan.test(item.className)) {
                item.itemExtent = Number(RegExp.$2);
                if (!explicitDivisionSet) {
                    maxDivisions += item.itemExtent - 1;
                }
            } else {
                item.itemExtent = 1;
            }
        });

        return maxDivisions;
    };

    const applyRowStyles = (currentItems, containerSpace, fixedItemsTotalSpace, flexibleItems, dimensionBreakdown) => {
        if (fixedItemsTotalSpace >= containerSpace) {
            return;
        }

        let computedSegmentWidth = 0;
        let segmentPosition = 0;
        let spaceTaken = fixedItemsTotalSpace;
        const finalItemInRow = currentItems[currentItems.length - 1];

        if (finalItemInRow && !hasClassAttribute(finalItemInRow, 'elastic-row-last')) {
            finalItemInRow.classList.add('elastic-row-last');
        }

        currentItems.forEach(item => {
            if (item.isStandardItem) {
                if (item.itemExtent >= dimensionBreakdown.length) {
                    applyStyleProperty(item, 'width', containerSpace + 'px');
                    return;
                }

                for (let k = segmentPosition; k < (segmentPosition + item.itemExtent); k++) {
                    computedSegmentWidth += dimensionBreakdown[k].segmentDimension;
                }

                spaceTaken += computedSegmentWidth;
                segmentPosition += item.itemExtent;
                applyStyleProperty(item, 'width', computedSegmentWidth + 'px');
                computedSegmentWidth = 0;
            }
        });

        let flexibleItemsTotalWidth = 0;
        if (flexibleItems.length > 0) {
            const flexibleWidthsResult = calculateDistributedWidths(containerSpace - spaceTaken, flexibleItems.length);
            flexibleItems.forEach((item, idx) => {
                flexibleItemsTotalWidth += flexibleWidthsResult[idx].segmentDimension;
                applyStyleProperty(item, 'width', flexibleWidthsResult[idx].segmentDimension + 'px');
            });
        }

        if (finalItemInRow && classificationPatterns.lastItemInRow.test(finalItemInRow.className)) {
            applyStyleProperty(finalItemInRow, 'marginRight', (containerSpace - spaceTaken - flexibleItemsTotalWidth) + 'px');
        }
    };

    const processLayoutContainers = (targetLayoutParent) => {
        const innerContent = fetchElements('> .container', targetLayoutParent)[0] || targetLayoutParent;
        const childLayoutItems = fetchElements('> .column', innerContent);

        if (childLayoutItems.length === 0) {
            return;
        }

        let rowDivisionCount = ascertainItemDivisions(targetLayoutParent, childLayoutItems);
        const containerContentWidth = measureInnerWidth(innerContent);
        let divisionSpecifications = calculateDistributedWidths(containerContentWidth, rowDivisionCount);

        if (classificationPatterns.adaptiveItem.test(targetLayoutParent.className)) {
            const minimumWidthThreshold = Number(RegExp.$2);
            const maximumWidthThreshold = Number(RegExp.$3);

            while (divisionSpecifications[0].segmentDimension > maximumWidthThreshold) {
                rowDivisionCount++;
                divisionSpecifications = calculateDistributedWidths(containerContentWidth, rowDivisionCount);
                if (divisionSpecifications[0].segmentDimension < minimumWidthThreshold) break;
            }

            while (divisionSpecifications[0].segmentDimension < minimumWidthThreshold && rowDivisionCount > 1) {
                rowDivisionCount--;
                divisionSpecifications = calculateDistributedWidths(containerContentWidth, rowDivisionCount);
                if (divisionSpecifications[0].segmentDimension > maximumWidthThreshold) break;
            }
        }

        let flexibleItemsCurrentRow = [];
        let itemsForCurrentRow = [];
        let currentAccumulatedSpan = 0;
        let currentFixedItemsWidth = 0;

        childLayoutItems.forEach((item, index) => {
            item.isFlexibleItem = false;
            item.isFixedItem = false;
            item.isStandardItem = false;
            item.classList.remove('elastic-row-last');

            let itemExternalWidth = 0;

            if (classificationPatterns.fixedItem.test(item.className)) {
                itemExternalWidth = measureOuterWidth(item);
                item.computedSegmentDimension = itemExternalWidth;
                item.isFixedItem = true;
                currentFixedItemsWidth += itemExternalWidth;
            } else if (classificationPatterns.flexibleItem.test(item.className)) {
                item.isFlexibleItem = true;
                flexibleItemsCurrentRow.push(item);
            } else {
                item.isStandardItem = true;
            }

            const nextSpanTotal = currentAccumulatedSpan + item.itemExtent;
            const isLastElement = (index === childLayoutItems.length - 1);
            const isRowTerminated = classificationPatterns.lastItemInRow.test(item.className);

            if (nextSpanTotal >= rowDivisionCount || isLastElement || isRowTerminated) {
                if (nextSpanTotal <= rowDivisionCount || item.itemExtent >= rowDivisionCount) {
                    itemsForCurrentRow.push(item);
                }
                applyRowStyles(itemsForCurrentRow, containerContentWidth, currentFixedItemsWidth, flexibleItemsCurrentRow, divisionSpecifications);

                if (nextSpanTotal > rowDivisionCount) {
                    currentFixedItemsWidth = item.isFixedItem ? itemExternalWidth : 0;
                    currentAccumulatedSpan = item.itemExtent;
                    flexibleItemsCurrentRow = item.isFlexibleItem ? [item] : [];
                    itemsForCurrentRow = [item];

                    if (isLastElement) {
                        applyRowStyles(itemsForCurrentRow, containerContentWidth, currentFixedItemsWidth, flexibleItemsCurrentRow, divisionSpecifications);
                    }
                } else {
                    currentFixedItemsWidth = 0;
                    currentAccumulatedSpan = 0;
                    flexibleItemsCurrentRow = [];
                    itemsForCurrentRow = [];
                }
            } else {
                itemsForCurrentRow.push(item);
                currentAccumulatedSpan += item.itemExtent;
            }
        });
    };

    const getHelperTargets = (rootNode, selectorClass, includeRootCheck) => {
        let targets = fetchElements(selectorClass, rootNode);
        if (includeRootCheck && configurationStore.processRootElement && hasClassAttribute(rootNode, selectorClass.substring(1))) {
            targets.unshift(rootNode);
        }
        return Array.from(new Set(targets)); // Deduplicate
    };

    const layoutAdjustmentModules = new Map([
        ['stretchWidth', (rootNode, includeRootCheck) => {
            getHelperTargets(rootNode, '.full-width', includeRootCheck).forEach(element => {
                const parentDimension = element.parentElement.clientWidth;
                const elementOuterWithMargins = measureOuterWidth(element, true);
                const elementInnerContent = element.clientWidth;

                const dimensionDifference = elementOuterWithMargins - elementInnerContent;
                applyStyleProperty(element, 'width', (parentDimension - dimensionDifference) + 'px');
            });
        }],
        ['equalHeightSiblings', (rootNode, includeRootCheck) => {
            getHelperTargets(rootNode, '.same-height', includeRootCheck).forEach(container => {
                const childrenElements = fetchElements('> *', container);
                let tallest = 0;
                childrenElements.forEach(child => {
                    const currentChildHeight = measureOuterHeight(child, true);
                    if (currentChildHeight > tallest) tallest = currentChildHeight;
                });
                childrenElements.forEach(child => applyStyleProperty(child, 'height', tallest + 'px'));
            });
        }],
        ['equalRowHeightSiblings', (rootNode, includeRootCheck) => {
            getHelperTargets(rootNode, '.same-row-height', includeRootCheck).forEach(container => {
                const childrenElements = fetchElements('> *', container);
                let currentTallest = 0;
                let currentGroup = [];

                childrenElements.forEach(child => {
                    const childDimension = measureOuterHeight(child, true);
                    if (childDimension > currentTallest) currentTallest = childDimension;
                    currentGroup.push(child);

                    if (hasClassAttribute(child, 'elastic-row-last')) {
                        currentGroup.forEach(item => applyStyleProperty(item, 'height', currentTallest + 'px'));
                        currentTallest = 0;
                        currentGroup = [];
                    }
                });
            });
        }],
        ['equalMinHeightSiblings', (rootNode, includeRootCheck) => {
            getHelperTargets(rootNode, '.same-min-height', includeRootCheck).forEach(container => {
                const childrenElements = fetchElements('> *', container);
                let tallest = 0;
                childrenElements.forEach(child => {
                    const currentChildHeight = measureOuterHeight(child, true);
                    if (currentChildHeight > tallest) tallest = currentChildHeight;
                });
                childrenElements.forEach(child => applyStyleProperty(child, 'minHeight', tallest + 'px'));
            });
        }],
        ['stretchHeight', (rootNode, includeRootCheck) => {
            getHelperTargets(rootNode, '.full-height', includeRootCheck).forEach(element => {
                const parentDimension = element.parentElement.clientHeight;
                const elementOuterWithMargins = measureOuterHeight(element, true);
                const elementInnerContent = element.clientHeight;

                const dimensionDifference = elementOuterWithMargins - elementInnerContent;
                const newDimension = parentDimension - dimensionDifference;

                if (newDimension >= 0 && !isNaN(Number(newDimension))) {
                    applyStyleProperty(element, 'height', newDimension + 'px');
                }
            });
        }],
        ['stretchMinHeight', (rootNode, includeRootCheck) => {
            getHelperTargets(rootNode, '.full-min-height', includeRootCheck).forEach(element => {
                const parentDimension = element.parentElement.clientHeight;
                const elementOuterWithMargins = measureOuterHeight(element, true);
                const elementInnerContent = element.clientHeight;

                const dimensionDifference = elementOuterWithMargins - elementInnerContent;
                const newMinDimension = parentDimension - dimensionDifference;

                if (newMinDimension >= 0 && !isNaN(Number(newMinDimension))) {
                    applyStyleProperty(element, 'minHeight', newMinDimension + 'px');
                }
            });
        }]
    ]);

    const GridFlowArranger = function(workingContext = document, considerRoot = true) {
        let targetDivisions;

        if (workingContext instanceof $) {
            workingContext = workingContext[0];
        }

        let foundDivisions = fetchElements('.columns', workingContext);

        if (considerRoot && configurationStore.processRootElement) {
            if (hasClassAttribute(workingContext, 'columns')) {
                foundDivisions.unshift(workingContext);
            }
        }
        
        targetDivisions = Array.from(new Set(foundDivisions));

        targetDivisions.forEach(processLayoutContainers);

        layoutAdjustmentModules.forEach(moduleFunc => {
            moduleFunc(workingContext, considerRoot);
        });
    };

    window.GridFlowArranger = GridFlowArranger;

    GridFlowArranger.versionIdentifier = '2.1.1-redesign';
    GridFlowArranger.configurationOptions = configurationStore;

})();