(function($) {
    const globalRepository = {
        valueProcessors: [],
        visualTransformers: []
    };

    const coreUtilities = {
        // Renamed benchmark
        measureExecutionTime: function(label, startMark) {
            if (this.runtimeConfig && this.runtimeConfig.debuggingActive) {
                console.log(label + ": " + (new Date().getTime() - startMark.getTime()) + "ms");
            }
        },
        // Renamed log
        outputDebugMessage: function(content) {
            if (typeof console !== "undefined" && typeof console.log !== "undefined") {
                console.log(content);
            } else {
                alert(content);
            }
        },
        // Renamed findInMap
        locateMappedEntries: function(mappingSet, keyIndex, reverseLookup) {
            const resultList = [];
            for (let i = 0; i < mappingSet.length; ++i) {
                if (mappingSet[i][reverseLookup ? 1 : 0] == keyIndex) {
                    const entry = mappingSet[i][reverseLookup ? 1 : 0];
                    if (Array.isArray(entry)) {
                        resultList.push(...entry);
                    } else {
                        resultList.push(entry);
                    }
                    break;
                }
            }
            return resultList.length > 0 ? resultList : [keyIndex];
        },
        // Renamed getParserById
        retrieveValueProcessor: function(processorId) {
            for (let i = 0; i < globalRepository.valueProcessors.length; ++i) {
                if (globalRepository.valueProcessors[i].identifier.toLowerCase() === processorId.toLowerCase()) {
                    return globalRepository.valueProcessors[i];
                }
            }
            return null;
        },
        // Renamed getWidgetById
        retrieveVisualTransformer: function(transformerId) {
            for (let i = 0; i < globalRepository.visualTransformers.length; ++i) {
                if (globalRepository.visualTransformers[i].identifier.toLowerCase() === transformerId.toLowerCase()) {
                    return globalRepository.visualTransformers[i];
                }
            }
            return null;
        },
        // Renamed formatSortingOrder
        normalizeSortOrder: function(orderSpecifier) {
            if (typeof orderSpecifier !== "number") {
                return (orderSpecifier.toLowerCase() === "descending") ? 1 : 0;
            } else {
                return (orderSpecifier === 0 || orderSpecifier === 1) ? orderSpecifier : 0;
            }
        },
        // Renamed isValueInArray
        hasSortCriterion: function(value, criteriaArray) {
            for (let i = 0; i < criteriaArray.length; ++i) {
                if (criteriaArray[i][0] === value) {
                    return true;
                }
            }
            return false;
        },
        // Renamed parser.unparsed logic to a direct comparison method
        compareColumnValues: function(valA, valB, processor, currentConfig) {
            if (currentConfig.useLocaleBasedComparison && processor.dataType === "text") {
                return String(valA || '').localeCompare(String(valB || ''));
            } else {
                // Assume processor.comparisonMethod is a function (a, b) => -1, 0, 1
                return processor.comparisonMethod(valA, valB);
            }
        }
    };

    // Default value processors (replaces parsers array)
    globalRepository.valueProcessors.push({
        identifier: "genericText",
        dataType: "text",
        processContent: (content, table, cell) => (content || '').trim(),
        comparisonMethod: (valA, valB) => {
            if (valA < valB) return -1;
            if (valA > valB) return 1;
            return 0;
        },
        recognizeType: (text, table, cell) => true // Always matches as default
    });
    globalRepository.valueProcessors.push({
        identifier: "numerical",
        dataType: "numeric",
        processContent: (content, table, cell) => parseFloat((content || '').replace(/[^0-9.-]/g, '')),
        comparisonMethod: (valA, valB) => valA - valB,
        recognizeType: (text) => /^-?\d+(\.\d+)?$/.test(text.trim())
    });
    // Add more default processors here as needed, mirroring original parsers.

    // Default visual transformers (replaces widgets array)
    globalRepository.visualTransformers.push({
        identifier: "stripeRows",
        applyTransformation: function(tableElement, configuration) {
            const dataRows = Array.from(tableElement.tBodies[0].rows);
            const classSet = configuration.stripeSettings.classNames;
            dataRows.forEach((row, index) => {
                row.classList.remove(classSet[0], classSet[1]);
                row.classList.add(classSet[index % 2]);
            });
        }
    });

    const dataGridSorter = function(options) {
        const defaultSettings = {
            headerClass: "sortableHeader",
            ascendingClass: "sortUp",
            descendingClass: "sortDown",
            initialSortDirection: "asc",
            multiSortKey: "shiftKey",
            precedingSortRules: null,
            succeedingSortRules: null,
            contentExtractionStrategy: "simple",
            columnProcessors: {},
            enabledTransformers: [],
            stripeSettings: {classNames: ["evenRow","oddRow"]},
            columnConfigurations: {},
            fixedWidths: false,
            preventTextSelection: true,
            activeSortPlan: [],
            headerNodeList: [],
            dateParsingFormat: "us",
            decimalDelimiter: '.',
            debuggingActive: false,
            customColumnMappings: []
        };

        const currentSettings = Object.assign({}, defaultSettings, options);
        coreUtilities.runtimeConfig = currentSettings; // Expose config for utilities

        // Renamed buildParserCache
        function initializeColumnProcessors(targetTable, headerElements) {
            if (currentSettings.debuggingActive) { var procDebugTime = new Date(); }
            const processorsForColumns = [];
            const firstBodyRowCells = targetTable.tBodies[0] && targetTable.tBodies[0].rows[0] ? targetTable.tBodies[0].rows[0].cells : [];

            if (firstBodyRowCells.length > 0) {
                for (let i = 0; i < firstBodyRowCells.length; i++) {
                    let processor = null;

                    // Check header configurations (e.g., from metadata or direct settings)
                    const headerNode = headerElements[i];
                    if (headerNode && headerNode.getAttribute('data-processor')) { // Simplified metadata check
                        processor = coreUtilities.retrieveValueProcessor(headerNode.getAttribute('data-processor'));
                    } else if (currentSettings.columnConfigurations[i] && currentSettings.columnConfigurations[i].processor) {
                        processor = coreUtilities.retrieveValueProcessor(currentSettings.columnConfigurations[i].processor);
                    }

                    // Auto-detect if not explicitly set
                    if (!processor) {
                        processor = identifyProcessorForColumn(targetTable, firstBodyRowCells[i]);
                    }
                    processorsForColumns.push(processor);
                }
            }
            if (currentSettings.debuggingActive) { coreUtilities.measureExecutionTime("Initialized column processors", procDebugTime); }
            return processorsForColumns;
        }

        // Renamed detectParserForColumn
        function identifyProcessorForColumn(targetTable, sampleCell) {
            for (let i = 1; i < globalRepository.valueProcessors.length; i++) { // Skip default text processor (index 0)
                if (globalRepository.valueProcessors[i].recognizeType(extractCellContent(currentSettings, sampleCell), targetTable, sampleCell)) {
                    return globalRepository.valueProcessors[i];
                }
            }
            return globalRepository.valueProcessors[0]; // Default to generic text
        }

        // Renamed buildCache
        function constructDataSnapshot(targetTable) {
            if (currentSettings.debuggingActive) { var snapshotTime = new Date(); }

            const allBodyRows = Array.from(targetTable.tBodies[0].rows);
            const snapshot = {
                originalRowElements: [],
                normalizedColumnData: []
            };

            for (let i = 0; i < allBodyRows.length; ++i) {
                const currentRow = allBodyRows[i];
                const cellsInRow = Array.from(currentRow.cells);
                const processedValues = [];

                snapshot.originalRowElements.push(currentRow);

                for (let j = 0; j < cellsInRow.length; ++j) {
                    const cellNode = cellsInRow[j];
                    const processor = currentSettings.columnProcessors[j];
                    const cellText = extractCellContent(currentSettings, cellNode);
                    processedValues.push(processor.processContent(cellText, targetTable, cellNode));
                }
                processedValues.push(i); // Store original row index
                snapshot.normalizedColumnData.push(processedValues);
            }

            if (currentSettings.debuggingActive) { coreUtilities.measureExecutionTime("Constructed data snapshot for " + allBodyRows.length + " rows", snapshotTime); }
            return snapshot;
        }

        // Renamed getElementText
        function extractCellContent(config, cellNode) {
            if (!cellNode) return "";

            if (config.contentExtractionStrategy === "simple") {
                if (cellNode.childNodes[0] && cellNode.childNodes[0].hasChildNodes()) {
                    return cellNode.childNodes[0].textContent || cellNode.childNodes[0].innerText || '';
                } else {
                    return cellNode.textContent || cellNode.innerText || '';
                }
            } else if (typeof config.contentExtractionStrategy === "function") {
                return config.contentExtractionStrategy(cellNode);
            } else {
                return cellNode.textContent || cellNode.innerText || '';
            }
        }

        // Renamed appendToTable
        function refreshTableDisplay(targetTable, dataSnapshot) {
            if (currentSettings.debuggingActive) { var displayTime = new Date(); }

            const bodyElement = targetTable.tBodies[0];
            const sortedOriginalIndices = dataSnapshot.normalizedColumnData.map(row => row[row.length - 1]);

            const fragment = document.createDocumentFragment();
            for (let i = 0; i < sortedOriginalIndices.length; ++i) {
                fragment.appendChild(dataSnapshot.originalRowElements[sortedOriginalIndices[i]]);
            }

            while (bodyElement.firstChild) {
                bodyElement.removeChild(bodyElement.firstChild);
            }
            bodyElement.appendChild(fragment);

            if (currentSettings.customAppender) { // Allow custom appender as in original
                const reorderedRows = sortedOriginalIndices.map(idx => dataSnapshot.originalRowElements[idx]);
                currentSettings.customAppender(targetTable, reorderedRows);
            }

            if (currentSettings.debuggingActive) { coreUtilities.measureExecutionTime("Table display refreshed", displayTime); }

            applyVisualTransformations(targetTable);

            setTimeout(() => {
                const customEvent = new Event('gridContentSorted');
                targetTable.dispatchEvent(customEvent);
            }, 0);
        }

        // Renamed buildHeaders
        function prepareHeaderStructures(targetTable) {
            if (currentSettings.debuggingActive) { var headerPrepTime = new Date(); }

            const headerCells = Array.from(targetTable.tHead.querySelectorAll('th'));

            headerCells.forEach((cellNode, index) => {
                cellNode.sortCycleCount = 0;
                cellNode.associatedColumnIndex = index;
                cellNode.currentSortDirection = coreUtilities.normalizeSortOrder(currentSettings.initialSortDirection);

                const isDisabledByAttribute = cellNode.getAttribute('data-sort-enabled') === 'false';
                const isDisabledByConfig = currentSettings.columnConfigurations[index] && currentSettings.columnConfigurations[index].sortEnabled === false;
                if (isDisabledByAttribute || isDisabledByConfig) {
                    cellNode.sortingDisabled = true;
                }

                if (!cellNode.sortingDisabled) {
                    cellNode.classList.add(currentSettings.headerClass);
                }
                currentSettings.headerNodeList[index] = cellNode;
            });

            if (currentSettings.debuggingActive) { coreUtilities.measureExecutionTime("Header structures prepared", headerPrepTime); }
            return headerCells;
        }

        // Renamed checkHeaderMetadata
        function checkMetaForSortDisable(cellNode) {
            // Simplified check, assuming data-sort-enabled attribute
            return cellNode.getAttribute('data-sort-enabled') === 'false';
        }

        // Renamed checkHeaderOptions
        function checkConfigForSortDisable(targetTable, columnIndex) {
            return currentSettings.columnConfigurations[columnIndex] && currentSettings.columnConfigurations[columnIndex].sortEnabled === false;
        }

        // Renamed applyWidget
        function applyVisualTransformations(targetTable) {
            for (let i = 0; i < currentSettings.enabledTransformers.length; i++) {
                const transformer = coreUtilities.retrieveVisualTransformer(currentSettings.enabledTransformers[i]);
                if (transformer) {
                    transformer.applyTransformation(targetTable, currentSettings);
                }
            }
        }

        // Renamed setHeadersCss
        function updateHeaderStyling(targetTable, headerNodes, activeSortPlan, classNames) {
            headerNodes.forEach(h => h.classList.remove(classNames[0], classNames[1]));

            const headerMap = {};
            headerNodes.forEach(h => {
                if (!h.sortingDisabled) {
                    headerMap[h.associatedColumnIndex] = h;
                }
            });

            for (let i = 0; i < activeSortPlan.length; i++) {
                const criterion = activeSortPlan[i];
                const colIdx = criterion[0];
                const directionIdx = criterion[1];

                const mappedIndices = coreUtilities.locateMappedEntries(currentSettings.customColumnMappings, colIdx, true);
                for (const mappedIdx of mappedIndices) {
                    if (headerMap[mappedIdx]) {
                        headerMap[mappedIdx].classList.add(classNames[directionIdx]);
                    }
                }
            }
        }

        // Renamed fixColumnWidth
        function establishColumnDimensions(targetTable) {
            if (currentSettings.fixedWidths) {
                const colGroup = document.createElement('colgroup');
                const firstDataRow = targetTable.tBodies[0].rows[0];
                if (firstDataRow) {
                    Array.from(firstDataRow.cells).forEach(cell => {
                        const colElement = document.createElement('col');
                        colElement.style.width = cell.offsetWidth + 'px';
                        colGroup.appendChild(colElement);
                    });
                    targetTable.prepend(colGroup);
                }
            }
        }

        // Renamed updateHeaderSortCount
        function adjustHeaderSortState(targetTable, sortPlan) {
            for (let i = 0; i < sortPlan.length; i++) {
                const instruction = sortPlan[i];
                const headerRef = currentSettings.headerNodeList[instruction[0]];
                if (headerRef) {
                    headerRef.sortCycleCount = instruction[1];
                    headerRef.sortCycleCount++; // Increment count
                }
            }
        }

        // Renamed multisort
        const performMultiColumnSort = function(targetTable, sortPlan, dataCache) {
            if (currentSettings.debuggingActive) {
                var sortOperationStart = new Date();
            }

            const primaryComparatorFunction = (recordA, recordB) => {
                for (let i = 0; i < sortPlan.length; ++i) {
                    const currentInstruction = sortPlan[i];
                    const columnIndex = currentInstruction[0];
                    const sortDirection = currentInstruction[1]; // 0: ascending, 1: descending

                    const valueA = recordA[columnIndex];
                    const valueB = recordB[columnIndex];

                    const columnProcessor = currentSettings.columnProcessors[columnIndex];

                    const comparisonResult = coreUtilities.compareColumnValues(valueA, valueB, columnProcessor, currentSettings);

                    if (comparisonResult !== 0) {
                        return (sortDirection === 0) ? comparisonResult : (comparisonResult * -1);
                    }
                }
                return 0; // All sorting criteria yielded equality
            };

            dataCache.normalizedColumnData.sort(primaryComparatorFunction);

            if (currentSettings.debuggingActive) {
                coreUtilities.measureExecutionTime("Multi-column sort execution", sortOperationStart);
            }
        };

        // Main initialization logic (replaces the jQuery plugin function itself)
        return this.each(function() {
            const currentTableElement = this;
            currentTableElement.activeSettings = currentSettings; // Attach settings to table DOM element

            const headerNodes = prepareHeaderStructures(currentTableElement);
            currentSettings.columnProcessors = initializeColumnProcessors(currentTableElement, headerNodes);
            let tableDataCache = constructDataSnapshot(currentTableElement);

            headerNodes.forEach(header => {
                if (!header.sortingDisabled) {
                    header.addEventListener('click', function(event) {
                        let newSortPlan = [];
                        const clickedColumn = this.associatedColumnIndex;

                        if (event[currentSettings.multiSortKey]) { // Multi-sort key (e.g., Shift)
                            let criterionFound = false;
                            for (let i = 0; i < currentSettings.activeSortPlan.length; ++i) {
                                if (currentSettings.activeSortPlan[i][0] === clickedColumn) {
                                    currentSettings.activeSortPlan[i][1] = 1 - currentSettings.activeSortPlan[i][1]; // Toggle direction
                                    criterionFound = true;
                                    break;
                                }
                            }
                            if (!criterionFound) {
                                currentSettings.activeSortPlan.push([clickedColumn, this.currentSortDirection]);
                            }
                            newSortPlan = [...currentSettings.activeSortPlan];
                        } else { // Single column sort
                            if (currentSettings.activeSortPlan.length === 1 && currentSettings.activeSortPlan[0][0] === clickedColumn) {
                                currentSettings.activeSortPlan[0][1] = 1 - currentSettings.activeSortPlan[0][1];
                            } else {
                                currentSettings.activeSortPlan = [[clickedColumn, this.currentSortDirection]];
                            }
                            newSortPlan = [...currentSettings.activeSortPlan];
                        }

                        // Apply preceding/succeeding sort rules
                        if (currentSettings.precedingSortRules) {
                            newSortPlan = [...currentSettings.precedingSortRules, ...newSortPlan];
                        }
                        if (currentSettings.succeedingSortRules) {
                            newSortPlan = [...newSortPlan, ...currentSettings.succeedingSortRules];
                        }

                        // Update header states
                        currentSettings.headerNodeList.forEach(h => {
                            h.sortCycleCount = 0;
                            h.currentSortDirection = coreUtilities.normalizeSortOrder(currentSettings.initialSortDirection);
                        });
                        newSortPlan.forEach(sortItem => {
                            const hdr = currentSettings.headerNodeList[sortItem[0]];
                            if (hdr) {
                                hdr.sortCycleCount++;
                                hdr.currentSortDirection = sortItem[1];
                            }
                        });

                        performMultiColumnSort(currentTableElement, newSortPlan, tableDataCache);
                        refreshTableDisplay(currentTableElement, tableDataCache);
                        updateHeaderStyling(currentTableElement, headerNodes, newSortPlan, [currentSettings.ascendingClass, currentSettings.descendingClass]);
                    });
                }
            });

            // Initial sort if an activeSortPlan is provided
            if (currentSettings.activeSortPlan.length > 0) {
                performMultiColumnSort(currentTableElement, currentSettings.activeSortPlan, tableDataCache);
                refreshTableDisplay(currentTableElement, tableDataCache);
                updateHeaderStyling(currentTableElement, headerNodes, currentSettings.activeSortPlan, [currentSettings.ascendingClass, currentSettings.descendingClass]);
            } else {
                applyVisualTransformations(currentTableElement); // Apply widgets even if no initial sort
            }

            establishColumnDimensions(currentTableElement);

            if (currentSettings.preventTextSelection) {
                currentTableElement.style.userSelect = 'none';
                currentTableElement.style.webkitUserSelect = 'none';
                currentTableElement.style.mozUserSelect = 'none';
                currentTableElement.style.msUserSelect = 'none';
            }
        });
    };

    $.fn.sortableDataGrid = dataGridSorter;
})(jQuery);