function connectMethods(instanceObject, methodNames) {
    methodNames.forEach(function(methodName) {
        if (typeof instanceObject[methodName] === 'function') {
            instanceObject[methodName] = instanceObject[methodName].bind(instanceObject);
        }
    });
}

Number.prototype.formatWithCommas = Number.prototype.formatWithCommas || function() {
    return this.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

function createLinearScale() {
    let inputExtent = [0, 1], outputExtent = [0, 1];
    const scaleFunction = function(inputValue) {
        const inputMin = inputExtent[0];
        const inputMax = inputExtent[1];
        const outputMin = outputExtent[0];
        const outputMax = outputExtent[1];
        const normalizedValue = (inputValue - inputMin) / (inputMax - inputMin);
        return outputMin + normalizedValue * (outputMax - outputMin);
    };
    scaleFunction.domain = function(newExtent) {
        if (!arguments.length) return inputExtent;
        inputExtent = newExtent;
        return scaleFunction;
    };
    scaleFunction.range = function(newExtent) {
        if (!arguments.length) return outputExtent;
        outputExtent = newExtent;
        return scaleFunction;
    };
    return scaleFunction;
}

function generateNestedRectangleLayout() {
    let blockSpacing = 1;
    let containerWidth = 1;
    let containerHeight = 1;
    let sizeAccessor = item => item.size;
    let elementSorter = (e1, e2) => e1.value - e2.value;

    function processLayout(inputData) {
        const computedElements = [];
        // Create a deep copy to avoid modifying original data and ensure all necessary properties are present
        const dataRoot = JSON.parse(JSON.stringify(inputData));

        // Initial root node properties
        dataRoot.x = 0;
        dataRoot.y = 0;
        dataRoot.dx = containerWidth;
        dataRoot.dy = containerHeight;
        dataRoot.level = 0;
        dataRoot.value = sizeAccessor(dataRoot); // Will be re-calculated later if children exist

        computedElements.push(dataRoot);

        function recursivelyDivide(currentBlock, currentLevel, divisionAxis) {
            if (!currentBlock.children || currentBlock.children.length === 0) {
                return;
            }

            currentBlock.children.sort(elementSorter);

            let totalChildrenValue = currentBlock.children.reduce((sum, child) => sum + sizeAccessor(child), 0);
            if (totalChildrenValue === 0) return;

            let currentXOffset = currentBlock.x + blockSpacing;
            let currentYOffset = currentBlock.y + blockSpacing;
            let availableWidth = currentBlock.dx - 2 * blockSpacing;
            let availableHeight = currentBlock.dy - 2 * blockSpacing;

            if (availableWidth <= 0 || availableHeight <= 0) {
                return;
            }

            currentBlock.children.forEach(child => {
                const childValue = sizeAccessor(child);
                const proportion = childValue / totalChildrenValue;

                let childX, childY, childDX, childDY;

                if (divisionAxis === 'horizontal') {
                    childX = currentXOffset;
                    childY = currentYOffset;
                    childDX = availableWidth;
                    childDY = availableHeight * proportion;
                    currentYOffset += childDY;
                } else {
                    childX = currentXOffset;
                    childY = currentYOffset;
                    childDX = availableWidth * proportion;
                    childDY = availableHeight;
                    currentXOffset += childDX;
                }

                const newElement = {
                    ...child,
                    x: childX,
                    y: childY,
                    dx: childDX,
                    dy: childDY,
                    level: currentLevel + 1,
                    parent: currentBlock,
                    value: childValue
                };
                computedElements.push(newElement);

                recursivelyDivide(newElement, currentLevel + 1, divisionAxis === 'horizontal' ? 'vertical' : 'horizontal');
            });
        }
        
        // Initial division for root's children, starting horizontally
        recursivelyDivide(dataRoot, 0, 'horizontal');

        // Post-processing to ensure parent `value`, `furloughed_total`, `exempt_total` are correct
        function aggregateNodeMetrics(node) {
            if (node.children) {
                node.value = 0;
                node.furloughed_total = 0;
                node.exempt_total = 0;
                node.children.forEach(child => {
                    aggregateNodeMetrics(child); // Recurse first
                    node.value += child.value;
                    if (child.name === 'furloughed') {
                        node.furloughed_total += child.value;
                    } else if (child.name && child.name.startsWith('exempt')) {
                        node.exempt_total += child.value;
                    }
                });
            }
        }
        aggregateNodeMetrics(dataRoot);

        return computedElements;
    }

    processLayout.padding = function(val) {
        if (!arguments.length) return blockSpacing;
        blockSpacing = val;
        return processLayout;
    };
    processLayout.size = function(dimensions) {
        if (!arguments.length) return [containerWidth, containerHeight];
        containerWidth = dimensions[0];
        containerHeight = dimensions[1];
        return processLayout;
    };
    processLayout.value = function(accessor) {
        if (!arguments.length) return sizeAccessor;
        sizeAccessor = accessor;
        return processLayout;
    };
    processLayout.sort = function(comparator) {
        if (!arguments.length) return elementSorter;
        elementSorter = comparator;
        return processLayout;
    };

    return processLayout;
}


function CrisisMonitorModule(configuration) {
    const componentRepository = {};

    class InfoPopupComponent {
        constructor() {
            connectMethods(this, ['reveal', 'conceal', 'setContent', 'setText', 'applyStyle', 'placeAt']);
            this.popupElement = document.querySelector('div.tooltip');
            if (!this.popupElement) {
                this.popupElement = document.createElement('div');
                this.popupElement.classList.add('tooltip');
                document.body.appendChild(this.popupElement);
            }
            this.popupDimensions = 200; // Represents fixed width
        }

        reveal() {
            this.popupElement.style.display = 'block';
            return this;
        }

        conceal() {
            this.popupElement.style.display = 'none';
            return this;
        }

        setContent(contentHTML) {
            this.popupElement.innerHTML = contentHTML;
            return this;
        }

        setText(contentText) {
            this.popupElement.textContent = contentText;
            return this;
        }

        applyStyle(styles) {
            Object.assign(this.popupElement.style, styles);
            return this;
        }

        placeAt(eventData) {
            const currentPopupHeight = this.popupElement.offsetHeight;
            const viewportWidth = window.innerWidth;
            let leftPosition = eventData.pageX - (this.popupDimensions / 2);
            let topPosition = eventData.pageY - (currentPopupHeight + 15);

            leftPosition = Math.min(Math.max(leftPosition, 20), viewportWidth - (this.popupDimensions + 40));
            this.popupElement.style.top = topPosition + 'px';
            this.popupElement.style.left = leftPosition + 'px';
            return this;
        }
    }
    componentRepository.InfoPopupComponent = InfoPopupComponent;

    class WorkforceDisplayComponent {
        constructor(agencyInputData, popupUtility) {
            connectMethods(this, ['drawVisualization', 'adjustDisplay', 'trimLabel', 'updateHoverInfo', 'handleGlobalClick']);
            this.displayRegionWidth = 1280 - 80;
            this.displayRegionHeight = 800 - 280;
            this.horizontalScale = createLinearScale().range([0, this.displayRegionWidth]);
            this.verticalScale = createLinearScale().range([0, this.displayRegionHeight]);

            this.categorizationItems = [
                ['furloughed', "Furloughed Employees"],
                ['exempt_a', "Furlough-Exempt: Law enforcement, health & safety"],
                ['exempt_b', "Furlough-Exempt: Financed from available funds"],
                ['exempt_c', "Furlough-Exempt: Protecting life and property"],
                ['exempt_d', "Furlough-Exempt: Other/Unknown"]
            ];
            this.categoryMap = Object.fromEntries(this.categorizationItems);

            this.layoutProcessor = generateNestedRectangleLayout()
                .padding(1)
                .size([this.displayRegionWidth, this.displayRegionHeight])
                .value(item => item.size)
                .sort((itemA, itemB) => {
                    if (itemA.name && itemA.name.startsWith('exempt')) { return 1; }
                    else if (itemA.name === 'furloughed') { return -1; }
                    return itemA.value - itemB.value;
                });

            this.mainDisplayArea = document.querySelector('#furlough-map-container .chart');
            this.mainDisplayArea.style.width = this.displayRegionWidth + 'px';
            this.mainDisplayArea.style.height = this.displayRegionHeight + 'px';

            this.svgRootElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.svgRootElement.setAttribute("width", this.displayRegionWidth);
            this.svgRootElement.setAttribute("height", this.displayRegionHeight);
            this.svgGroupElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
            this.svgGroupElement.setAttribute("transform", "translate(.5,.5)");
            this.svgRootElement.appendChild(this.svgGroupElement);
            this.mainDisplayArea.appendChild(this.svgRootElement);

            this.detailInfoPanel = document.querySelector('.chart .agency-details');
            this.hoverPopup = popupUtility;
            this.initialDataSource = agencyInputData;
            this.currentDisplayFocus = agencyInputData;

            this.drawVisualization();
        }

        drawVisualization(inputData) {
            inputData = inputData || this.initialDataSource;
            this.currentDisplayFocus = inputData;
            this.initialDataSource = inputData;

            if (this.initialDataSource.children) {
                this.initialDataSource.children.sort((agencyA, agencyB) => {
                    const totalA = agencyA.children ? agencyA.children.reduce((sum, child) => sum + child.size, 0) : 0;
                    const totalB = agencyB.children ? agencyB.children.reduce((sum, child) => sum + child.size, 0) : 0;
                    return totalB - totalA;
                });
            }

            const allProcessedNodes = this.layoutProcessor.nodes(this.initialDataSource);
            const terminalNodes = allProcessedNodes.filter(item => !item.children);

            const parentElements = this.retrieveParentNodes(terminalNodes);

            while (this.svgGroupElement.firstChild) {
                this.svgGroupElement.removeChild(this.svgGroupElement.firstChild);
            }

            const primaryBlocks = this.constructPrimaryBlocks(parentElements);
            this.constructSecondaryBlocks(primaryBlocks);

            const legendContainer = document.querySelector('#furlough-map-legend');
            if (legendContainer) {
                const totalStaffElement = legendContainer.querySelector('.total-employees');
                const totalExemptElement = legendContainer.querySelector('.total-exempt');
                const totalFurloughedElement = legendContainer.querySelector('.total-furloughed');

                if (totalStaffElement) totalStaffElement.textContent = this.initialDataSource.value.formatWithCommas();
                if (totalExemptElement) totalExemptElement.textContent = (this.initialDataSource.value - this.initialDataSource.furloughed_total).formatWithCommas();
                if (totalFurloughedElement) totalFurloughedElement.textContent = this.initialDataSource.furloughed_total.formatWithCommas();
            }

            this.generateBottomLegend();

            this.svgRootElement.addEventListener('mousemove', this.updateHoverInfo);
            this.svgRootElement.addEventListener('mouseenter', this.updateHoverInfo);
            this.svgRootElement.addEventListener('mouseleave', this.hoverPopup.conceal);

            window.addEventListener("click", this.handleGlobalClick);
        }

        constructPrimaryBlocks(parentItems) {
            const blockGroupElements = [];
            parentItems.forEach(itemData => {
                const groupElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
                groupElement.classList.add("parentCell");
                groupElement.setAttribute('data-agency-name', itemData.name);
                groupElement.setAttribute('data-total-staff', itemData.value);
                groupElement.setAttribute('data-furloughed-staff', itemData.furloughed_total);
                groupElement.setAttribute('data-exempt-staff', itemData.exempt_total);
                groupElement._elementData = itemData; // Store full data object
                this.svgGroupElement.appendChild(groupElement);
                blockGroupElements.push(groupElement);
            });
            return blockGroupElements;
        }

        constructSecondaryBlocks(primaryBlockElements) {
            primaryBlockElements.forEach(primaryBlock => {
                const parentNodeData = primaryBlock._elementData;
                if (parentNodeData.children) {
                    parentNodeData.children.forEach(childNode => {
                        const groupElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
                        groupElement.classList.add('cell');
                        groupElement.setAttribute("transform", `translate(${childNode.x},${childNode.y})`);
                        groupElement.setAttribute("data-category-type", childNode.name);
                        groupElement.setAttribute("data-category-value", childNode.value);
                        groupElement._elementData = childNode;

                        groupElement.addEventListener("click", (evt) => {
                            evt.stopPropagation();
                            this.adjustDisplay(this.currentDisplayFocus === childNode.parent ? this.initialDataSource : childNode.parent);
                        });
                        groupElement.addEventListener('mouseover', () => primaryBlock.classList.add('active'));
                        groupElement.addEventListener('mouseout', () => primaryBlock.classList.remove('active'));

                        const rectangleElement = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                        rectangleElement.setAttribute("width", childNode.dx);
                        rectangleElement.setAttribute("height", childNode.dy);
                        rectangleElement.classList.add(childNode.name);
                        groupElement.appendChild(rectangleElement);

                        primaryBlock.appendChild(groupElement);
                    });
                }
                this.constructSegmentLabels(primaryBlock, parentNodeData);
            });
        }

        constructSegmentLabels(parentGroup, itemData) {
            const textContentElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
            textContentElement.classList.add('abbrevText');
            textContentElement.setAttribute("x", itemData.dx / 2);
            textContentElement.setAttribute("y", itemData.dy / 2);
            textContentElement.setAttribute("dy", ".35em");
            textContentElement.setAttribute("text-anchor", "middle");
            textContentElement.setAttribute("transform", `translate(${itemData.x},${itemData.y})`);
            textContentElement.textContent = itemData.name;

            parentGroup.appendChild(textContentElement);
            this.trimLabel(textContentElement, itemData);
        }

        generateBottomLegend() {
            const lowerLegendArea = document.querySelector('#furlough-legend-bottom');
            if (!lowerLegendArea) return;
            lowerLegendArea.innerHTML = '';

            this.categorizationItems.forEach(item => {
                const spanElement = document.createElement('span');
                spanElement.classList.add('legend-bottom-item');

                const colorSwatch = document.createElement('span');
                colorSwatch.classList.add('swatch', 'swatch-' + item[0]);
                spanElement.appendChild(colorSwatch);

                const labelHeading = document.createElement('h6');
                labelHeading.classList.add(item[0]);
                labelHeading.textContent = item[1];
                spanElement.appendChild(labelHeading);

                lowerLegendArea.appendChild(spanElement);
            });
        }

        retrieveParentNodes(allLeafNodes) {
            const uniqueParentNames = new Set();
            const collectedParents = [];
            allLeafNodes.forEach(node => {
                if (node.parent && !uniqueParentNames.has(node.parent.name)) {
                    collectedParents.push(node.parent);
                    uniqueParentNames.add(node.parent.name);
                }
            });
            return collectedParents;
        }

        handleGlobalClick(evt) {
            if (evt.target === window || evt.target === document.body || evt.target === this.svgRootElement) {
                this.adjustDisplay(this.initialDataSource);
            }
        }

        adjustDisplay(targetDataItem) {
            const scaleFactorX = this.displayRegionWidth / targetDataItem.dx;
            const scaleFactorY = this.displayRegionHeight / targetDataItem.dy;
            this.horizontalScale.domain([targetDataItem.x, targetDataItem.x + targetDataItem.dx]);
            this.verticalScale.domain([targetDataItem.y, targetDataItem.y + targetDataItem.dy]);

            const animationTiming = (window.event && window.event.altKey) ? 7500 : 750;

            const allMinorCells = this.svgGroupElement.querySelectorAll("g.cell");
            allMinorCells.forEach(cellElement => {
                const elementData = cellElement._elementData;
                const transformedX = this.horizontalScale(elementData.x);
                const transformedY = this.verticalScale(elementData.y);

                cellElement.style.transition = `transform ${animationTiming}ms ease-in-out`;
                cellElement.style.transform = `translate(${transformedX}px, ${transformedY}px)`;

                const rectShape = cellElement.querySelector('rect');
                if (rectShape) {
                    rectShape.style.transition = `width ${animationTiming}ms ease-in-out, height ${animationTiming}ms ease-in-out`;
                    rectShape.setAttribute("width", scaleFactorX * elementData.dx);
                    rectShape.setAttribute("height", scaleFactorY * elementData.dy);
                }
            });

            const currentZoomState = (targetDataItem === this.initialDataSource) ? 'out' : 'in';
            const allParentLabels = this.svgGroupElement.querySelectorAll("g.parentCell text.abbrevText");
            allParentLabels.forEach(labelElement => {
                const parentGroup = labelElement.parentNode;
                const elementData = parentGroup._elementData;

                const transformedX = this.horizontalScale(elementData.x);
                const transformedY = this.verticalScale(elementData.y);

                labelElement.style.transition = `transform ${animationTiming}ms ease-in-out, opacity ${animationTiming}ms ease-in-out`;
                labelElement.style.transform = `translate(${transformedX}px, ${transformedY}px)`;
                labelElement.setAttribute("x", (scaleFactorX * elementData.dx) / 2);
                labelElement.setAttribute("y", (scaleFactorY * elementData.dy) / 2);
                labelElement.style.opacity = (currentZoomState === 'out' ? 1 : 0);
            });

            if (currentZoomState === 'in') {
                this.populateDetailPanel(targetDataItem, this.detailInfoPanel);
                this.detailInfoPanel.style.display = 'block';
                this.isCurrentlyZoomed = true;
                this.lastHoveredElement = undefined;
                this.hoverPopup.conceal();
            } else {
                this.detailInfoPanel.style.display = 'none';
                this.isCurrentlyZoomed = false;
            }

            this.currentDisplayFocus = targetDataItem;
            if (window.event) window.event.stopPropagation();
        }

        populateDetailPanel(dataItem, panelElement) {
            const heading = panelElement.querySelector('h3');
            if (heading) heading.textContent = dataItem.name;

            const percentCells = panelElement.querySelectorAll('tr.agency-staff-percent td');
            const countCells = panelElement.querySelectorAll('tr.agency-staff-count td');

            if (percentCells[0]) percentCells[0].textContent = Math.round(100 * (dataItem.exempt_total / dataItem.value)) + "%";
            if (percentCells[1]) percentCells[1].textContent = Math.round(100 * (dataItem.furloughed_total / dataItem.value)) + "%";
            if (countCells[0]) countCells[0].textContent = dataItem.exempt_total.formatWithCommas();
            if (countCells[1]) countCells[1].textContent = dataItem.furloughed_total.formatWithCommas();

            panelElement.style.left = ((this.displayRegionWidth / 2) - 150) + 'px';
            return this;
        }

        trimLabel(labelElement, itemData) {
            const processAbbreviation = (abbrIndex) => {
                if (!itemData.abbreviations || !itemData.abbreviations[abbrIndex]) {
                    labelElement.textContent = '';
                    return;
                }
                labelElement.textContent = itemData.abbreviations[abbrIndex];
                const parentRect = labelElement.parentNode.querySelector('rect');
                if (parentRect && labelElement.getComputedTextLength() + 4 > parseFloat(parentRect.getAttribute('width'))) {
                    if (abbrIndex + 1 < itemData.abbreviations.length) {
                        processAbbreviation(abbrIndex + 1);
                    } else {
                        labelElement.textContent = '';
                    }
                }
            };
            processAbbreviation(0);
            return labelElement;
        }

        updateHoverInfo(eventObject) {
            if (eventObject.target !== this.lastHoveredElement) {
                this.lastHoveredElement = eventObject.target;
                const targetDomElement = eventObject.target;

                if (this.isCurrentlyZoomed) {
                    let currentCell = targetDomElement;
                    while (currentCell && !currentCell.classList.contains('cell') && currentCell !== this.svgGroupElement) {
                        currentCell = currentCell.parentNode;
                    }
                    if (currentCell && currentCell.classList.contains('cell')) {
                        const cellData = currentCell._elementData;
                        if (cellData && cellData.name && this.categoryMap[cellData.name]) {
                            const categoryLabel = this.categoryMap[cellData.name];
                            this.hoverPopup.setContent(`<p>${cellData.value.formatWithCommas()}</p><h6 class="${cellData.name}">${categoryLabel}</h6>`);
                        } else {
                            this.hoverPopup.conceal();
                            return;
                        }
                    } else {
                        this.hoverPopup.conceal();
                        return;
                    }
                } else {
                    let currentAgency = targetDomElement;
                    while (currentAgency && !currentAgency.classList.contains('parentCell') && currentAgency !== this.svgGroupElement) {
                        currentAgency = currentAgency.parentNode;
                    }
                    if (currentAgency && currentAgency.classList.contains('parentCell')) {
                        const agencyData = currentAgency._elementData;
                        const popupContent = `<h3>${agencyData.name}</h3>` +
                            `<h6 class="text-red">${Math.round(100 * (agencyData.furloughed_total / agencyData.value))}% furloughed</h6>` +
                            `<h6 class="text-gray"><em>click for details</em></h6>`;
                        this.hoverPopup.setContent(popupContent);
                    } else {
                        this.hoverPopup.conceal();
                        return;
                    }
                }
            }
            this.hoverPopup.placeAt(eventObject).reveal();
        }
    }
    componentRepository.WorkforceDisplayComponent = WorkforceDisplayComponent;

    class ProgramStatusComponent {
        constructor(programList, popupUtility) {
            connectMethods(this, ['refreshProgramHover']);
            this.programEntries = programList || configuration.programData;
            this.hoverPopup = popupUtility;
            this.listContainer = document.querySelector('#services-container');
            this.categorizedSections = {
                'ok': this.listContainer.querySelector('#services-ok'),
                'risk': this.listContainer.querySelector('#services-risk'),
                'halted': this.listContainer.querySelector('#services-halted')
            };
            this.displayProgramList();
            return this;
        }

        displayProgramList() {
            this.programEntries.forEach(entry => {
                const itemElement = document.createElement('li');
                itemElement.classList.add('service', entry.status);
                itemElement.textContent = entry.name;
                itemElement.dataset.description = entry.description;

                const targetSection = this.categorizedSections[entry.status];
                if (targetSection) {
                    targetSection.appendChild(itemElement);
                }
            });

            this.listContainer.addEventListener('mousemove', this.refreshProgramHover);
            this.listContainer.addEventListener('mouseenter', this.refreshProgramHover);
            this.listContainer.addEventListener('mouseleave', this.hoverPopup.conceal);
        }

        refreshProgramHover(eventObject) {
            if (eventObject.target !== this.lastHoveredElement) {
                if (eventObject.target.tagName !== 'LI') {
                    this.hoverPopup.conceal();
                    return;
                }
                this.lastHoveredElement = eventObject.target;
                const targetElement = eventObject.target;
                const descriptionText = targetElement.dataset.description;
                if (descriptionText) {
                    this.hoverPopup.setText(descriptionText);
                } else {
                    this.hoverPopup.conceal();
                    return;
                }
            }
            this.hoverPopup.placeAt(eventObject).reveal();
        }
    }
    componentRepository.ProgramStatusComponent = ProgramStatusComponent;

    class FiscalTrackerComponent {
        constructor(workforceMonitorInstance, appConstants) {
            connectMethods(this, ['performCalculations']);
            this.durationOutput = document.querySelector('#shutdown-duration');
            this.unpaidSalaryOutput = document.querySelector('#unpaid-salary');
            this.foodAidOutput = document.querySelector('#food-vouchers');

            this.commencementDate = new Date(2013, 9, 1);
            this.cessationDate = new Date(2013, 9, 17, 0, 30);

            this.workforceReference = workforceMonitorInstance;
            this.applicationConstants = appConstants;

            // setInterval(() => this.performCalculations(), 1000); // Replicates original commented-out line
            this.performCalculations();
        }

        performCalculations() {
            const totalMilliseconds = this.cessationDate.getTime() - this.commencementDate.getTime();
            const totalElapsedSeconds = Math.floor(totalMilliseconds / 1000);

            const SECONDS_PER_DAY = 60 * 60 * 24;
            const SECONDS_PER_HOUR = 60 * 60;
            const SECONDS_PER_MINUTE = 60;

            const days = Math.floor(totalElapsedSeconds / SECONDS_PER_DAY);
            const hours = Math.floor((totalElapsedSeconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR);
            const minutes = Math.floor((totalElapsedSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
            const seconds = totalElapsedSeconds % SECONDS_PER_MINUTE;

            if (this.durationOutput) {
                this.durationOutput.textContent = `${days}d : ${hours}h : ${minutes}m : ${seconds}s`;
            }

            const AVERAGE_DAYS_IN_YEAR = 365.25;
            const foodCostPerSecond = this.applicationConstants.WIC_FOOD_COST_2012 / (AVERAGE_DAYS_IN_YEAR * SECONDS_PER_DAY);
            const totalFoodAidCost = Math.floor(foodCostPerSecond * totalElapsedSeconds);
            if (this.foodAidOutput) {
                this.foodAidOutput.textContent = '$' + totalFoodAidCost.formatWithCommas();
            }

            if (this.workforceReference && this.workforceReference.initialDataSource && this.workforceReference.initialDataSource.furloughed_total !== undefined) {
                const totalFurloughedWorkers = this.workforceReference.initialDataSource.furloughed_total;
                const averageAnnualSalary = this.applicationConstants.AVG_SALARY;
                const furloughedSalaryRatePerSecond = (averageAnnualSalary * totalFurloughedWorkers) / (AVERAGE_DAYS_IN_YEAR * SECONDS_PER_DAY);
                const totalUnpaidAmount = Math.floor(furloughedSalaryRatePerSecond * totalElapsedSeconds);
                if (this.unpaidSalaryOutput) {
                    this.unpaidSalaryOutput.textContent = '$' + totalUnpaidAmount.formatWithCommas();
                }
            }
        }
    }
    componentRepository.FiscalTrackerComponent = FiscalTrackerComponent;

    return componentRepository;
}