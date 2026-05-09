((jq, windowReference, undef) => {
    if (windowReference.footable === undef || windowReference.footable === null) {
        throw new Error('Please verify that the primary "footable.js" script is loaded and accessible before this sorting extension.');
    }

    const defaultArrangementSettings = {
        arrangementEnabled: true,
        comparerFns: {
            lexicalComparer: (valA, valB) => {
                if (valA === valB) return 0;
                return valA < valB ? -1 : 1;
            },
            numericalComparer: (valA, valB) => valA - valB
        },
        styleTokens: {
            sortControl: 'footable-sortable-header',
            sortedAscClass: 'footable-sorted-asc',
            sortedDescClass: 'footable-sorted-desc',
            sortMarker: 'footable-sort-marker-icon'
        },
        notificationEvents: {
            preArrangeEvent: 'footable_presort_data',
            postArrangeEvent: 'footable_postsort_data'
        }
    };

    const TableDataArrangerModule = (() => {
        let currentOrderedRowData = [];

        function acquireTableRows(coreApi, dataContainerElement, columnObj) {
            const detailClass = coreApi.options.classes.detail;
            const allChildren = Array.from(dataContainerElement.children);
            const structureList = [];

            for (let rowIter = 0; rowIter < allChildren.length; rowIter++) {
                const currentRow = allChildren[rowIter];
                if (currentRow.classList.contains(detailClass)) {
                    continue;
                }

                let nextItem = null;
                if (allChildren[rowIter + 1] && allChildren[rowIter + 1].classList.contains(detailClass)) {
                    nextItem = allChildren[rowIter + 1];
                    rowIter++;
                }

                const rowStructure = {
                    mainElement: currentRow,
                    supplementalElement: nextItem,
                    sortValue: null
                };

                if (columnObj && currentRow.cells[columnObj.sort.match]) {
                    rowStructure.sortValue = coreApi.parse(currentRow.cells[columnObj.sort.match], columnObj);
                }
                structureList.push(rowStructure);
            }
            return structureList;
        }

        function placeRowsIntoBody(targetBody, orderedRowStructures) {
            while (targetBody.firstChild) {
                targetBody.removeChild(targetBody.firstChild);
            }

            orderedRowStructures.forEach(structure => {
                targetBody.appendChild(structure.mainElement);
                if (structure.supplementalElement) {
                    targetBody.appendChild(structure.supplementalElement);
                }
            });
        }

        function processRowOrder(coreApi, dataContainerElement, columnObj, isFullSort) {
            if (isFullSort) {
                currentOrderedRowData = acquireTableRows(coreApi, dataContainerElement, columnObj);
                const activeComparer = coreApi.options.sorters[columnObj.type] || defaultArrangementSettings.comparerFns.lexicalComparer;
                currentOrderedRowData.sort((entryA, entryB) => activeComparer(entryA.sortValue, entryB.sortValue));
            } else {
                currentOrderedRowData.reverse();
            }
            placeRowsIntoBody(dataContainerElement, currentOrderedRowData);
        }

        return {
            moduleName: 'Table Data Arranger',
            initiate: function(coreApi) {
                if (coreApi.options.sort === true) {
                    const tableHost = coreApi.table;
                    const classConfig = defaultArrangementSettings.styleTokens;
                    const eventNames = defaultArrangementSettings.notificationEvents;

                    tableHost.addEventListener('footable_initialized', (eventInfo) => {
                        if (tableHost.dataset.sort === 'false') return;

                        const headerRowCells = Array.from(tableHost.querySelectorAll('thead > tr:last-child > th, thead > tr:last-child > td'));
                        headerRowCells.forEach((headerCell, colIter) => {
                            const columnObj = coreApi.columns[colIter];
                            if (columnObj.sort.ignore !== true && !headerCell.classList.contains(classConfig.sortControl)) {
                                headerCell.classList.add(classConfig.sortControl);
                                const sortMarker = document.createElement('span');
                                sortMarker.classList.add(classConfig.sortMarker);
                                headerCell.appendChild(sortMarker);
                            }
                        });

                        tableHost.addEventListener('click', (clickEvt) => {
                            const clickedElement = clickEvt.target.closest(`th.${classConfig.sortControl}, td.${classConfig.sortControl}`);
                            if (!clickedElement) return;

                            clickEvt.preventDefault();

                            const clickedColIndex = Array.from(clickedElement.parentNode.children).indexOf(clickedElement);
                            const columnObj = coreApi.columns[clickedColIndex];

                            if (columnObj.sort.ignore === true) return;

                            let currentSortState = 'none';
                            if (clickedElement.classList.contains(classConfig.sortedAscClass)) {
                                currentSortState = 'asc';
                            } else if (clickedElement.classList.contains(classConfig.sortedDescClass)) {
                                currentSortState = 'desc';
                            }

                            let newDirection;
                            let performFullArrangement = false;

                            switch (currentSortState) {
                                case 'none':
                                    newDirection = 'ASC';
                                    performFullArrangement = true;
                                    break;
                                case 'asc':
                                    newDirection = 'DESC';
                                    performFullArrangement = false;
                                    break;
                                case 'desc':
                                    newDirection = 'ASC';
                                    performFullArrangement = false;
                                    break;
                            }

                            const preArrangeEventResult = coreApi.raise(eventNames.preArrangeEvent, { column: columnObj, direction: newDirection });
                            if (preArrangeEventResult && preArrangeEventResult.result === false) return;

                            tableHost.dataset.currentArrangedColumn = clickedColIndex;

                            headerRowCells.forEach(cell => {
                                if (cell !== clickedElement) {
                                    cell.classList.remove(classConfig.sortedAscClass, classConfig.sortedDescClass);
                                }
                            });

                            if (newDirection === 'ASC') {
                                clickedElement.classList.remove(classConfig.sortedDescClass);
                                clickedElement.classList.add(classConfig.sortedAscClass);
                            } else {
                                clickedElement.classList.remove(classConfig.sortedAscClass);
                                clickedElement.classList.add(classConfig.sortedDescClass);
                            }

                            const bodyHost = tableHost.querySelector('tbody');
                            processRowOrder(coreApi, bodyHost, columnObj, performFullArrangement);

                            coreApi.bindToggleSelectors();
                            coreApi.raise(eventNames.postArrangeEvent, { column: columnObj, direction: newDirection });
                        });

                        let initialArrangementDone = false;
                        for (let colIter in coreApi.columns) {
                            const colDefinition = coreApi.columns[colIter];
                            if (colDefinition.sort.initial) {
                                const initialArrangementHeader = tableHost.querySelector(`thead > tr:last-child > th:nth-child(${parseInt(colIter) + 1}), thead > tr:last-child > td:nth-child(${parseInt(colIter) + 1})`);
                                const bodyHost = tableHost.querySelector('tbody');

                                processRowOrder(coreApi, bodyHost, colDefinition, true);
                                initialArrangementDone = true;

                                if (colDefinition.sort.initial === 'descending') {
                                    processRowOrder(coreApi, bodyHost, colDefinition, false);
                                    initialArrangementHeader.classList.add(classConfig.sortedDescClass);
                                } else {
                                    initialArrangementHeader.classList.add(classConfig.sortedAscClass);
                                }

                                tableHost.dataset.currentArrangedColumn = colIter;
                                break;
                            }
                        }
                        if (initialArrangementDone) {
                            coreApi.bindToggleSelectors();
                        }
                    });

                    tableHost.addEventListener('footable_column_data', (eventInfo) => {
                        const headerCell = eventInfo.detail.column.th;
                        eventInfo.detail.column.data.sort = eventInfo.detail.column.data.sort || {};
                        eventInfo.detail.column.data.sort.initial = headerCell.dataset.sortInitial || false;
                        eventInfo.detail.column.data.sort.ignore = headerCell.dataset.sortIgnore || false;
                        eventInfo.detail.column.data.sort.selector = headerCell.dataset.sortSelector || null;

                        let matchPosition = parseInt(headerCell.dataset.sortMatch) || 0;
                        if (matchPosition >= eventInfo.detail.column.data.matches.length) matchPosition = 0;
                        eventInfo.detail.column.data.sort.match = eventInfo.detail.column.data.matches[matchPosition];
                    });
                }
            }
        };
    })();

    windowReference.footable.plugins.register(TableDataArrangerModule, defaultArrangementSettings);

})(jQuery, window, undefined);