(function (globalScope) {
    const gridConfigurations = new WeakMap();

    const deepMergeObjects = (target, ...sources) => {
        if (target === null || typeof target !== 'object') {
            return target;
        }
        for (const source of sources) {
            if (source === null || typeof source !== 'object') {
                continue;
            }
            for (const key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                        if (!target[key] || typeof target[key] !== 'object') {
                            target[key] = {};
                        }
                        deepMergeObjects(target[key], source[key]);
                    } else {
                        target[key] = source[key];
                    }
                }
            }
        }
        return target;
    };

    const defaultGridSettings = {
        breakpoints: {},
        debounceDelay: 250,
        domClasses: {
            expanded: 'responsive-grid-expanded-row',
            collapsed: 'responsive-grid-collapsed-row',
            detailRow: 'responsive-grid-detail-row'
        },
        expanderColumnPos: null,
        columnDefinitions: [],
        columnMapIndices: [],
        sortedBreakpoints: [],
        initialTableWidth: null,
        testBreakpoint: null,
        managerVersion: '1.0.0',
        contentExpanderCallback: null,
        contentCollapserCallback: null
    };

    const retrieveViewportDimension = (inputSettings) => {
        let currentViewportWidth = globalScope.innerWidth || (document.body ? document.body.offsetWidth : 0);
        if (inputSettings.testBreakpoint !== null && inputSettings.testBreakpoint < currentViewportWidth) {
            currentViewportWidth = inputSettings.testBreakpoint;
        }
        return currentViewportWidth;
    };

    const applyElementDisplay = (elements, shouldShow) => {
        elements.forEach(el => {
            el.style.display = shouldShow ? '' : 'none';
        });
    };

    const updateExpanderVisibility = (gridElement, expanderShouldBeActive) => {
        const currentConfig = gridConfigurations.get(gridElement);
        if (!currentConfig) return;

        const dataRows = Array.from(gridElement.querySelectorAll(':scope > tbody:first-of-type > tr:not(.responsive-grid-detail-row)'));
        dataRows.forEach(row => {
            const indicatorCell = row.children[currentConfig.expanderColumnPos - 1];
            if (indicatorCell) {
                if (expanderShouldBeActive) {
                    indicatorCell.classList.add(currentConfig.domClasses.collapsed);
                } else {
                    indicatorCell.classList.remove(currentConfig.domClasses.collapsed);
                    indicatorCell.classList.remove(currentConfig.domClasses.expanded);
                }
            }
        });
        currentConfig.expanderActive = expanderShouldBeActive;
    };

    const adjustGridResponsiveness = (gridElement) => {
        const currentConfig = gridConfigurations.get(gridElement);
        if (!currentConfig) return false;

        const actualViewportWidth = retrieveViewportDimension(currentConfig);
        let expanderRequired = false;

        const currentlyHiddenBreakpointNames = new Set(['always']);
        currentConfig.sortedBreakpoints.forEach(bp => {
            if (bp.width >= actualViewportWidth) {
                currentlyHiddenBreakpointNames.add(bp.name);
            }
        });

        const previouslyOpenRows = Array.from(
            gridElement.querySelectorAll(`:scope > tbody:first-of-type > tr.${currentConfig.domClasses.expanded}`)
        );
        previouslyOpenRows.forEach(row => row.dispatchEvent(new Event('toggleGridRowContent')));

        const headerCells = Array.from(gridElement.querySelectorAll(':scope > thead:first-of-type > tr:last-of-type > th, :scope > thead:first-of-type > tr:last-of-type > td'));
        const gridBodyRows = Array.from(gridElement.querySelectorAll(':scope > tbody:first-of-type > tr:not(.responsive-grid-detail-row)'));

        currentConfig.columnDefinitions.forEach(colDef => {
            const headerCell = headerCells[colDef.originalHeaderIndex];
            if (!headerCell) return;

            const shouldBeInvisible = Array.from(currentlyHiddenBreakpointNames).some(bp => colDef.hideSpecification && colDef.hideSpecification.includes(bp));

            const [startColumnIdx, endColumnIdx] = Array.isArray(colDef.columnSpanRange) ? colDef.columnSpanRange : [colDef.columnSpanRange, colDef.columnSpanRange];

            if (shouldBeInvisible) {
                if (colDef.hideSpecification !== 'always') {
                    expanderRequired = true;
                }
                applyElementDisplay([headerCell], false);
                gridBodyRows.forEach(row => {
                    Array.from(row.children).slice(startColumnIdx, endColumnIdx + 1).forEach(cell => applyElementDisplay([cell], false));
                });
            } else {
                applyElementDisplay([headerCell], true);
                gridBodyRows.forEach(row => {
                    Array.from(row.children).slice(startColumnIdx, endColumnIdx + 1).forEach(cell => applyElementDisplay([cell], true));
                });
            }
        });

        if (expanderRequired && previouslyOpenRows.length > 0) {
            previouslyOpenRows.forEach(row => row.dispatchEvent(new Event('toggleGridRowContent')));
        }

        if (currentConfig.testBreakpoint !== null) {
            gridElement.style.width = `${actualViewportWidth}px`;
        } else if (currentConfig.initialTableWidth !== null) {
            gridElement.style.width = `${currentConfig.initialTableWidth}px`;
        } else {
            gridElement.style.width = '';
        }

        return expanderRequired;
    };

    const provideDefaultContent = (gridConfig, visibleColumns, hiddenColumns, targetContainer) => {
        let generatedHtml = '';
        for (const hiddenColInfo of hiddenColumns) {
            generatedHtml += `<div><span class='responsive-grid-header' style='font-weight:bold;text-decoration:underline'>${hiddenColInfo.columnDefinition.displayLabel}</span><br>`;
            for (const cellContent of hiddenColInfo.cellElements) {
                generatedHtml += `<span class='responsive-grid-data' style='margin-left:10px'>${cellContent.textContent}</span><br>`;
            }
            generatedHtml += `</div>`;
        }
        targetContainer.innerHTML = generatedHtml;
    };

    const handleRowContentToggle = (event) => {
        const clickedRow = event.currentTarget;
        const parentGrid = clickedRow.closest('table');
        if (!parentGrid) return;

        const currentConfig = gridConfigurations.get(parentGrid);
        if (!currentConfig || !currentConfig.expanderActive) {
            return;
        }

        const hiddenCells = Array.from(clickedRow.children).filter(cell => cell.style.display === 'none');
        const visibleCells = Array.from(clickedRow.children).filter(cell => cell.style.display !== 'none');

        let collectedHidden = [];
        let collectedVisible = [];

        let cellIndex = 0;
        while (cellIndex < visibleCells.length) {
            const cell = visibleCells[cellIndex];
            const colDefIndex = currentConfig.columnMapIndices[Array.from(clickedRow.children).indexOf(cell)];
            const colDef = currentConfig.columnDefinitions[colDefIndex];

            const spanLength = Array.isArray(colDef.columnSpanRange) ? (colDef.columnSpanRange[1] - colDef.columnSpanRange[0]) + 1 : 1;
            collectedVisible.push({
                columnDefinition: colDef,
                cellElements: visibleCells.slice(cellIndex, cellIndex + spanLength)
            });
            cellIndex += spanLength;
        }

        cellIndex = 0;
        while (cellIndex < hiddenCells.length) {
            const cell = hiddenCells[cellIndex];
            const colDefIndex = currentConfig.columnMapIndices[Array.from(clickedRow.children).indexOf(cell)];
            const colDef = currentConfig.columnDefinitions[colDefIndex];

            const spanLength = Array.isArray(colDef.columnSpanRange) ? (colDef.columnSpanRange[1] - colDef.columnSpanRange[0]) + 1 : 1;

            if (colDef.hideSpecification !== 'always') {
                collectedHidden.push({
                    columnDefinition: colDef,
                    cellElements: hiddenCells.slice(cellIndex, cellIndex + spanLength)
                });
            }
            cellIndex += spanLength;
        }

        let nextSiblingRow = clickedRow.nextElementSibling;
        let contentDestination;

        if (clickedRow.classList.contains(currentConfig.domClasses.expanded)) {
            if (currentConfig.contentCollapserCallback) {
                contentDestination = nextSiblingRow ? nextSiblingRow.querySelector('td:first-of-type') : null;
                currentConfig.contentCollapserCallback(currentConfig, collectedVisible, collectedHidden, contentDestination);
            }
            if (nextSiblingRow && nextSiblingRow.classList.contains(currentConfig.domClasses.detailRow)) {
                nextSiblingRow.style.display = 'none';
            }
            clickedRow.classList.remove(currentConfig.domClasses.expanded);
            clickedRow.classList.add(currentConfig.domClasses.collapsed);
            clickedRow.querySelector(`:nth-child(${currentConfig.expanderColumnPos})`).classList.remove(currentConfig.domClasses.expanded);
            clickedRow.querySelector(`:nth-child(${currentConfig.expanderColumnPos})`).classList.add(currentConfig.domClasses.collapsed);
        } else {
            if (!nextSiblingRow || !nextSiblingRow.classList.contains(currentConfig.domClasses.detailRow)) {
                nextSiblingRow = document.createElement('tr');
                nextSiblingRow.classList.add(currentConfig.domClasses.detailRow);
                const detailCell = document.createElement('td');
                nextSiblingRow.appendChild(detailCell);
                clickedRow.after(nextSiblingRow);
            }

            const visibleCellCount = visibleCells.length;
            nextSiblingRow.querySelector('td:first-of-type').setAttribute('colspan', visibleCellCount);
            contentDestination = nextSiblingRow.querySelector('td:first-of-type');
            contentDestination.innerHTML = '';

            if (currentConfig.contentExpanderCallback) {
                currentConfig.contentExpanderCallback(currentConfig, collectedVisible, collectedHidden, contentDestination);
            } else {
                provideDefaultContent(currentConfig, collectedVisible, collectedHidden, contentDestination);
            }

            nextSiblingRow.style.display = '';
            clickedRow.classList.remove(currentConfig.domClasses.collapsed);
            clickedRow.classList.add(currentConfig.domClasses.expanded);
            clickedRow.querySelector(`:nth-child(${currentConfig.expanderColumnPos})`).classList.remove(currentConfig.domClasses.collapsed);
            clickedRow.querySelector(`:nth-child(${currentConfig.expanderColumnPos})`).classList.add(currentConfig.domClasses.expanded);
        }
    };

    const applyColumnVisibilityToNewRows = (gridConfig, gridElement, newRowElements) => {
        const currentViewportWidth = retrieveViewportDimension(gridConfig);
        const currentlyHiddenBreakpointNames = new Set(['always']);
        gridConfig.sortedBreakpoints.forEach(bp => {
            if (bp.width >= currentViewportWidth) {
                currentlyHiddenBreakpointNames.add(bp.name);
            }
        });

        const headerCells = Array.from(gridElement.querySelectorAll(':scope > thead:first-of-type > tr:last-of-type > th, :scope > thead:first-of-type > tr:last-of-type > td'));

        gridConfig.columnDefinitions.forEach(colDef => {
            const headerCell = headerCells[colDef.originalHeaderIndex];
            if (!headerCell) return;

            const shouldBeInvisible = Array.from(currentlyHiddenBreakpointNames).some(bp => colDef.hideSpecification && colDef.hideSpecification.includes(bp));

            const [startColumnIdx, endColumnIdx] = Array.isArray(colDef.columnSpanRange) ? colDef.columnSpanRange : [colDef.columnSpanRange, colDef.columnSpanRange];

            if (shouldBeInvisible) {
                newRowElements.forEach(row => {
                    Array.from(row.children).slice(startColumnIdx, endColumnIdx + 1).forEach(cell => applyElementDisplay([cell], false));
                });
            } else {
                newRowElements.forEach(row => {
                    Array.from(row.children).slice(startColumnIdx, endColumnIdx + 1).forEach(cell => applyElementDisplay([cell], true));
                });
            }
        });

        if (!gridConfig.expanderActive) return;

        newRowElements.forEach(row => {
            const indicatorCell = row.children[gridConfig.expanderColumnPos - 1];
            if (indicatorCell) {
                indicatorCell.classList.add(gridConfig.domClasses.collapsed);
            }
        });
    };

    const TableGridController = {
        initializeGridElements: function (elements, options = {}) {
            if (!elements || elements.length === 0) return;

            Array.from(elements).forEach(gridElement => {
                let currentConfig = gridConfigurations.get(gridElement);
                if (currentConfig) {
                    deepMergeObjects(currentConfig, options);
                } else {
                    currentConfig = deepMergeObjects({}, defaultGridSettings, globalScope.tableGridDefaults || {}, options);
                    gridConfigurations.set(gridElement, currentConfig);
                }

                currentConfig.sortedBreakpoints.length = 0;
                currentConfig.columnDefinitions.length = 0;
                currentConfig.columnMapIndices.length = 0;

                Object.entries(currentConfig.breakpoints).forEach(([name, width]) => {
                    currentConfig.sortedBreakpoints.push({ name, width });
                });
                currentConfig.sortedBreakpoints.sort((a, b) => a.width - b.width);

                let currentCalculatedColumnIndex = 0;
                const headerCells = Array.from(gridElement.querySelectorAll(':scope > thead:first-of-type > tr:last-of-type > th, :scope > thead:first-of-type > tr:last-of-type > td'));

                headerCells.forEach((headerCell, headerCellDomIndex) => {
                    const colspanAttribute = headerCell.getAttribute('colspan');
                    const columnSpanValue = colspanAttribute ? Number.parseInt(colspanAttribute) : 1;
                    let hideData = headerCell.dataset.hide;

                    if (hideData && hideData.includes('always')) {
                        hideData = 'always';
                    }

                    const columnDefinition = {
                        originalHeaderIndex: headerCellDomIndex,
                        columnId: headerCell.dataset.name || headerCell.textContent.trim(),
                        displayLabel: headerCell.textContent.trim(),
                        hideSpecification: hideData,
                        columnSpanRange: null
                    };

                    if (columnSpanValue > 1) {
                        columnDefinition.columnSpanRange = [currentCalculatedColumnIndex, currentCalculatedColumnIndex + columnSpanValue - 1];
                    } else {
                        columnDefinition.columnSpanRange = currentCalculatedColumnIndex;
                    }

                    currentConfig.columnDefinitions.push(columnDefinition);

                    for (let c = 0; c < columnSpanValue; c++) {
                        currentConfig.columnMapIndices[currentCalculatedColumnIndex + c] = currentConfig.columnDefinitions.length - 1;
                    }

                    if (headerCell.dataset.expander) {
                        currentConfig.expanderColumnPos = currentCalculatedColumnIndex + 1;
                    }

                    currentCalculatedColumnIndex += columnSpanValue;
                });

                if (!currentConfig.initialTableWidth) {
                    currentConfig.initialTableWidth = gridElement.offsetWidth;
                }

                updateExpanderVisibility(gridElement, adjustGridResponsiveness(gridElement));

                gridElement.removeEventListener('toggleGridRowContent', handleRowContentToggle);
                gridElement.addEventListener('toggleGridRowContent', handleRowContentToggle, true);

                gridElement.removeEventListener('click', (e) => {
                    const clickedDataRow = e.target.closest(`:scope > tbody:first-of-type > tr:not(.${currentConfig.domClasses.detailRow})`);
                    if (clickedDataRow) {
                        clickedDataRow.dispatchEvent(new Event('toggleGridRowContent'));
                    }
                }, true);
                gridElement.addEventListener('click', (e) => {
                    const clickedDataRow = e.target.closest(`:scope > tbody:first-of-type > tr:not(.${currentConfig.domClasses.detailRow})`);
                    if (clickedDataRow) {
                        clickedDataRow.dispatchEvent(new Event('toggleGridRowContent'));
                    }
                }, true);

                gridElement.classList.add('responsive-grid-initialized');

                let globalResizeTimeout;
                const globalResizeEventHandler = () => {
                    clearTimeout(globalResizeTimeout);
                    globalResizeTimeout = setTimeout(() => {
                        document.querySelectorAll('.responsive-grid-initialized').forEach(initializedGrid => {
                            updateExpanderVisibility(initializedGrid, adjustGridResponsiveness(initializedGrid));
                            initializedGrid.dispatchEvent(new Event('gridDisplayUpdated'));
                        });
                    }, currentConfig.debounceDelay);
                };

                if (!globalScope.responsiveGridGlobalResizeHandler) {
                    globalScope.addEventListener('resize', globalResizeEventHandler);
                    globalScope.responsiveGridGlobalResizeHandler = globalResizeEventHandler;
                }
            });
        },

        getGridConfiguration: function (gridElement) {
            return gridConfigurations.get(gridElement);
        },

        getSystemInfo: function (gridElement) {
            const config = gridConfigurations.get(gridElement);
            if (!config) return null;
            return { componentName: "TableGridController", version: config.managerVersion };
        },

        getDisplayRowCount: function (gridElement) {
            if (!gridElement || !gridElement.tBodies[0]) return 0;
            return gridElement.tBodies[0].rows.length -
                gridElement.querySelectorAll(`tr.${gridConfigurations.get(gridElement).domClasses.detailRow}`).length;
        },

        modifyGridRows: function (gridElement, ...args) {
            const config = gridConfigurations.get(gridElement);
            if (!config) return;

            let newRowHtmlOrElements = null;
            let targetBody = gridElement.querySelector(':scope > tbody:first-of-type');

            if (args.length > 0) {
                const lastArgument = args[args.length - 1];
                if (typeof lastArgument === 'string' || lastArgument instanceof HTMLElement || (Array.isArray(lastArgument) && lastArgument.every(el => el instanceof HTMLElement))) {
                    newRowHtmlOrElements = lastArgument;
                }
            }

            if (args.length < 2) {
                Array.from(gridElement.querySelectorAll(`:scope > tbody:first-of-type > tr.${config.domClasses.expanded}`))
                    .forEach(row => row.dispatchEvent(new Event('toggleGridRowContent')));

                targetBody.innerHTML = '';

                if (newRowHtmlOrElements) {
                    const tempWrapper = document.createElement('div');
                    tempWrapper.innerHTML = newRowHtmlOrElements;
                    const newRows = Array.from(tempWrapper.children).filter(el => el.tagName === 'TR');
                    applyColumnVisibilityToNewRows(config, gridElement, newRows);
                    newRows.forEach(row => targetBody.appendChild(row));
                }
            } else if (args.length === 2) {
                const insertionPoint = args[0];
                let beforeTargetElement = null;

                if (typeof insertionPoint === 'number') {
                    beforeTargetElement = targetBody.children[insertionPoint];
                } else if (insertionPoint instanceof HTMLElement) {
                    beforeTargetElement = insertionPoint;
                }

                if (newRowHtmlOrElements && beforeTargetElement) {
                    const tempWrapper = document.createElement('div');
                    tempWrapper.innerHTML = newRowHtmlOrElements;
                    const newRows = Array.from(tempWrapper.children).filter(el => el.tagName === 'TR');
                    applyColumnVisibilityToNewRows(config, gridElement, newRows);
                    newRows.forEach(row => targetBody.insertBefore(row, beforeTargetElement));
                }
            } else if (args.length === 3) {
                const startIndex = args[0];
                const endIndex = args[1];

                const existingRows = Array.from(targetBody.children);
                for (let i = endIndex - 1; i >= startIndex; i--) {
                    if (existingRows[i]) {
                        existingRows[i].remove();
                    }
                }

                if (newRowHtmlOrElements) {
                    const tempWrapper = document.createElement('div');
                    tempWrapper.innerHTML = newRowHtmlOrElements;
                    const newRows = Array.from(tempWrapper.children).filter(el => el.tagName === 'TR');
                    applyColumnVisibilityToNewRows(config, gridElement, newRows);
                    const insertBeforeElement = targetBody.children[startIndex];
                    newRows.forEach(row => targetBody.insertBefore(row, insertBeforeElement));
                }
            }
            gridElement.dispatchEvent(new Event('gridRowsAltered'));
        }
    };

    globalScope.tableGrid = TableGridController;
    globalScope.tableGridDefaults = deepMergeObjects({}, defaultGridSettings);

})(window);