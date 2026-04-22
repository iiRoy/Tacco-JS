(function($) {
    $.fn.dataGridSort = function(initOptions) {

        // Internal registry for data processing routines
        let valueProcessors = [];
        // Internal registry for table presentation adjusters
        let layoutAdjusters = [];

        // Core utility for the sorting plugin
        const coreUtility = new function() {

            // Default configuration values for the sortable grid
            this.defaultSettings = {
                headerClass: "sort-header",
                ascendingClass: "sort-asc",
                descendingClass: "sort-desc",
                initialSortDirection: "asc",
                multiSortKey: "shiftKey",
                preSortRules: null, // Rules applied before user selection
                postSortRules: null, // Rules applied after user selection
                contentExtractor: "basic", // "basic", "complex", or a custom function
                valueProcessors: {}, // Custom parser definitions
                layoutAdjusters: [], // Active widget IDs
                zebraStripe: {
                    rowClasses: ["even-row", "odd-row"]
                },
                columnConfigurations: {}, // Header-specific settings
                fixedColumnWidths: false, // Apply fixed widths to columns
                preventTextSelection: true, // Prevent header text selection
                activeSortCriteria: [], // Current sort order list
                headerElementList: [], // Cached header elements
                dateParsingFormat: "us",
                decimalSeparator: '.',
                enableDebugging: false, // Output debug info
                columnMap: [] // For complex header layouts (colspan)
            };

            /* --- Diagnostic Tools --- */

            // Measures execution time for a given operation
            function measurePerformance(label, startTime) {
                if (startTime instanceof Date) {
                    outputDiagnostic(`${label}: ${new Date().getTime() - startTime.getTime()}ms`);
                }
            }

            // Outputs diagnostic messages
            function outputDiagnostic(message) {
                if (typeof console !== 'undefined' && typeof console.info === 'function') {
                    console.info(message);
                } else if (this.defaultSettings.enableDebugging) {
                    // Fallback for environments without console, if debugging is enabled
                    alert(message);
                }
            }

            this.measurePerformance = measurePerformance; // Expose for external use

            /* --- Header Span Analysis --- */

            // Locates the mapped index for a given column, considering custom mappings
            function locateMappedIndex(mappingArray, targetIndex, reverseLookup) {
                const results = [];
                if (!Array.isArray(mappingArray) || mappingArray.length === 0) {
                    return [targetIndex]; // Return original if no map
                }

                for (let k = 0; k < mappingArray.length; ++k) {
                    const currentEntry = mappingArray[k];
                    const key = reverseLookup ? 1 : 0;
                    const value = reverseLookup ? 0 : 1;

                    if (currentEntry[key] === targetIndex) {
                        const mappedValue = currentEntry[value];
                        if (Array.isArray(mappedValue)) {
                            results.push(...mappedValue);
                        } else {
                            results.push(mappedValue);
                        }
                        break; // Found the mapping, exit loop
                    }
                }
                return results.length > 0 ? results : [targetIndex]; // Return found mappings or original
            }

            // Analyzes table headers to detect column spans and build a mapping
            function analyzeHeaderSpans(targetTable) {
                const headerRows = targetTable.tHead?.rows;
                if (!headerRows || headerRows.length === 0) {
                    return []; // No headers to analyze
                }

                const firstBodyRow = targetTable.tBodies[0]?.rows[0];
                const totalDataCols = firstBodyRow ? firstBodyRow.cells.length : 0;
                const columnAvailability = Array(totalDataCols).fill(0); // 0 = available, 1 = occupied

                const columnMap = [];
                let currentHeaderColIndex = 0;

                for (let i = 0; i < headerRows.length; i++) {
                    const currentRow = headerRows[i];
                    const headerCells = currentRow.cells;
                    let currentDataColTracker = 0; // Tracks the data column index

                    for (let j = 0; j < headerCells.length; j++) {
                        const headerCell = headerCells[j];
                        const colSpanVal = parseInt(headerCell.getAttribute("colspan") || "1", 10);

                        // Find the next available data column index
                        let actualDataCol = columnAvailability.indexOf(0, currentDataColTracker);
                        if (actualDataCol === -1) {
                            actualDataCol = currentDataColTracker; // Fallback if no available slot found (shouldn't happen with correct markup)
                        }

                        if (colSpanVal === 1) {
                            columnMap.push([currentHeaderColIndex, actualDataCol]);
                            columnAvailability[actualDataCol] = 1; // Mark as occupied
                        } else {
                            const spannedCols = [];
                            for (let k = 0; k < colSpanVal; k++) {
                                const colToOccupy = actualDataCol + k;
                                if (colToOccupy < totalDataCols) {
                                    spannedCols.push(colToOccupy);
                                    columnAvailability[colToOccupy] = 1; // Mark as occupied
                                }
                            }
                            if (spannedCols.length > 0) {
                                columnMap.push([currentHeaderColIndex, spannedCols]);
                            }
                        }
                        currentDataColTracker = actualDataCol + colSpanVal;
                        currentHeaderColIndex++;
                    }
                }
                return columnMap;
            }

            /* --- Value Processor Management --- */

            // Prepares the cache of value processors for each column
            function prepareTypeProcessors(targetTable, headerElements) {
                if (targetTable.config.enableDebugging) {
                    var debugOutput = "Column Processors:\n";
                }

                const firstBodyRow = targetTable.tBodies[0]?.rows[0];
                if (!firstBodyRow) {
                    outputDiagnostic("No data rows found to detect processors.");
                    return [];
                }

                const cellCount = firstBodyRow.cells.length;
                const processorList = [];

                for (let i = 0; i < cellCount; i++) {
                    let chosenProcessor = null;

                    // 1. Check metadata (if available)
                    if ($.metadata && $(headerElements[i]).metadata()?.sorter) {
                        chosenProcessor = retrieveProcessorById($(headerElements[i]).metadata().sorter);
                    }

                    // 2. Check column configurations
                    if (!chosenProcessor && targetTable.config.columnConfigurations[i]?.sorter) {
                        chosenProcessor = retrieveProcessorById(targetTable.config.columnConfigurations[i].sorter);
                    }

                    // 3. Auto-detect if no explicit processor found
                    if (!chosenProcessor) {
                        chosenProcessor = identifyColumnProcessor(targetTable, firstBodyRow.cells[i]);
                    }

                    if (targetTable.config.enableDebugging) {
                        debugOutput += `  Column ${i}: ${chosenProcessor.id}\n`;
                    }
                    processorList.push(chosenProcessor);
                }

                if (targetTable.config.enableDebugging) {
                    outputDiagnostic(debugOutput);
                }
                return processorList;
            }

            // Identifies the best value processor for a given column cell
            function identifyColumnProcessor(targetTable, cellElement) {
                const totalProcessors = valueProcessors.length;
                for (let i = 1; i < totalProcessors; i++) { // Start from 1, as 0 is generic text
                    const currentProcessor = valueProcessors[i];
                    const cellContent = retrieveElementContent(targetTable.config, cellElement);
                    if (currentProcessor.is($.trim(cellContent), targetTable, cellElement)) {
                        return currentProcessor;
                    }
                }
                // Default to generic text processor (always at index 0)
                return valueProcessors[0];
            }

            // Retrieves a value processor by its ID
            function retrieveProcessorById(processorId) {
                for (let i = 0; i < valueProcessors.length; i++) {
                    if (valueProcessors[i].id.toLowerCase() === processorId.toLowerCase()) {
                        return valueProcessors[i];
                    }
                }
                outputDiagnostic(`Warning: Processor '${processorId}' not found. Falling back to text processor.`);
                return valueProcessors[0]; // Fallback to default text processor
            }

            /* --- Cache and Data Handling --- */

            // Builds a cache of table data for efficient sorting
            function buildDataCache(targetTable) {
                if (targetTable.config.enableDebugging) {
                    var cacheBuildStartTime = new Date();
                }

                const bodyRows = targetTable.tBodies[0]?.rows;
                const totalRows = bodyRows ? bodyRows.length : 0;
                const totalCells = (bodyRows && bodyRows[0]) ? bodyRows[0].cells.length : 0;
                const columnProcessors = targetTable.config.valueProcessors;

                const dataCache = {
                    originalRows: [], // jQuery objects of original rows
                    processedValues: [] // Normalized values for sorting
                };

                if (totalRows === 0) {
                    return dataCache; // No rows to cache
                }

                for (let i = 0; i < totalRows; ++i) {
                    const currentRow = bodyRows[i];
                    const processedRowValues = [];

                    dataCache.originalRows.push($(currentRow));

                    for (let j = 0; j < totalCells; ++j) {
                        const cellElement = currentRow.cells[j];
                        const cellContent = retrieveElementContent(targetTable.config, cellElement);
                        processedRowValues.push(columnProcessors[j].format(cellContent, targetTable, cellElement));
                    }

                    processedRowValues.push(i); // Store original row index for stability
                    dataCache.processedValues.push(processedRowValues);
                }

                if (targetTable.config.enableDebugging) {
                    measurePerformance(`Built data cache for ${totalRows} rows`, cacheBuildStartTime);
                }
                return dataCache;
            }

            // Retrieves the text content from a table cell based on configuration
            function retrieveElementContent(config, elementNode) {
                if (!elementNode) {
                    return "";
                }

                let content = "";
                const extractionMethod = config.contentExtractor;

                if (typeof extractionMethod === "function") {
                    content = extractionMethod(elementNode);
                } else if (extractionMethod === "basic") {
                    // Optimized for simple structures: direct text or first child's innerHTML
                    const firstChild = elementNode.firstChild;
                    if (firstChild && firstChild.nodeType === Node.ELEMENT_NODE && firstChild.hasChildNodes()) {
                        content = firstChild.innerHTML;
                    } else if (elementNode.hasChildNodes()) {
                        content = elementNode.innerHTML;
                    } else {
                        content = elementNode.textContent || elementNode.innerText; // Fallback
                    }
                } else { // "complex" or any other string
                    content = $(elementNode).text();
                }
                return content;
            }

            // Appends sorted rows back to the table
            function reassembleTable(targetTable, sortedCache) {
                if (targetTable.config.enableDebugging) {
                    var reassemblyTime = new Date();
                }

                const cachedRows = sortedCache.originalRows;
                const normalizedData = sortedCache.processedValues;
                const rowCount = normalizedData.length;
                const tableBody = $(targetTable.tBodies[0]);
                const orderedRowElements = [];

                if (rowCount === 0) {
                    if (targetTable.config.enableDebugging) {
                        outputDiagnostic("No rows to reassemble.");
                    }
                    applyLayoutAdjusters(targetTable);
                    $(targetTable).trigger("sortEnd");
                    return;
                }

                // If a custom appender is provided, use it
                if (typeof targetTable.config.appender === 'function') {
                    for (let i = 0; i < rowCount; i++) {
                        // The last element in normalizedData[i] is the original row index
                        const originalIndex = normalizedData[i][normalizedData[i].length - 1];
                        orderedRowElements.push(cachedRows[originalIndex]);
                    }
                    targetTable.config.appender(targetTable, orderedRowElements);
                } else {
                    // Default appending: Clear and re-add
                    tableBody.empty(); // Clear existing rows
                    const fragment = document.createDocumentFragment();
                    for (let i = 0; i < rowCount; i++) {
                        const originalIndex = normalizedData[i][normalizedData[i].length - 1];
                        const rowToAppend = cachedRows[originalIndex][0]; // Get the DOM element from jQuery object
                        if (rowToAppend) {
                            fragment.appendChild(rowToAppend);
                        }
                    }
                    tableBody[0].appendChild(fragment);
                }

                if (targetTable.config.enableDebugging) {
                    measurePerformance("Reassembled table", reassemblyTime);
                }

                applyLayoutAdjusters(targetTable); // Apply display enhancers
                // Trigger an event when sorting is complete
                setTimeout(() => {
                    $(targetTable).trigger("sortEnd");
                }, 0);
            }

            /* --- Header Building and Configuration --- */

            // Constructs and initializes header elements for sorting
            function buildHeaderElements(targetTable) {
                if (targetTable.config.enableDebugging) {
                    var headerBuildTime = new Date();
                }

                const headerRowsCount = targetTable.tHead.rows.length;
                // Initialize an array to track if header columns have been processed, for complex headers.
                // This isn't directly used in the simple header processing below but hints at more complex logic.
                const columnProcessStatus = Array(headerRowsCount).fill(0);

                const $allHeaders = $("thead th", targetTable);

                $allHeaders.each(function(index) {
                    this.sortCount = 0; // Tracks click count for sort direction
                    this.columnIdentifier = index; // Unique identifier for this header cell
                    this.sortOrder = determineSortDirection(targetTable.config.initialSortDirection);

                    // Check if sorting is explicitly disabled for this header
                    const isSortDisabled = checkHeaderExclusion(this) || checkColumnConfigExclusion(targetTable, index);
                    this.sortDisabled = isSortDisabled;

                    if (!isSortDisabled) {
                        $(this).addClass(targetTable.config.headerClass);
                    }

                    // Store reference to the header element
                    targetTable.config.headerElementList[index] = this;
                });

                if (targetTable.config.enableDebugging) {
                    measurePerformance("Built header elements", headerBuildTime);
                    outputDiagnostic($allHeaders);
                }
                return $allHeaders;
            }

            // Checks if a header cell's metadata disables sorting
            function checkHeaderExclusion(cell) {
                return ($.metadata && $(cell).metadata()?.sorter === false);
            }

            // Checks if column configurations disable sorting for a specific column index
            function checkColumnConfigExclusion(targetTable, index) {
                return (targetTable.config.columnConfigurations[index]?.sorter === false);
            }

            /* --- Layout Adjuster (Widget) Management --- */

            // Applies registered layout adjusters (widgets) to the table
            function applyLayoutAdjusters(targetTable) {
                const activeAdjusters = targetTable.config.layoutAdjusters;
                for (let i = 0; i < activeAdjusters.length; i++) {
                    const adjuster = retrieveAdjusterById(activeAdjusters[i]);
                    if (adjuster && typeof adjuster.format === 'function') {
                        adjuster.format(targetTable);
                    } else if (targetTable.config.enableDebugging) {
                        outputDiagnostic(`Warning: Layout adjuster '${activeAdjusters[i]}' not found or lacks format method.`);
                    }
                }
            }

            // Retrieves a layout adjuster by its ID
            function retrieveAdjusterById(adjusterId) {
                for (let i = 0; i < layoutAdjusters.length; i++) {
                    if (layoutAdjusters[i].id.toLowerCase() === adjusterId.toLowerCase()) {
                        return layoutAdjusters[i];
                    }
                }
                return null;
            }

            /* --- Sorting Order Utilities --- */

            // Normalizes the sort direction string/number to 0 (asc) or 1 (desc)
            function determineSortDirection(value) {
                if (typeof value === "string") {
                    return (value.toLowerCase() === "desc") ? 1 : 0;
                } else if (typeof value === "number") {
                    return (value === 0 || value === 1) ? value : 0;
                }
                return 0; // Default to ascending
            }

            // Updates the CSS classes on header elements to reflect current sort state
            function updateHeaderDisplay(targetTable, $headerElements, sortOrderList, cssClasses) {
                // Remove all previous sort-related classes
                $headerElements.removeClass(cssClasses[0]).removeClass(cssClasses[1]);

                const headerMap = {};
                $headerElements.each(function(idx) {
                    if (!this.sortDisabled) {
                        headerMap[this.columnIdentifier] = $(this);
                    }
                });

                // Apply new classes based on the current sort order list
                for (let i = 0; i < sortOrderList.length; i++) {
                    const sortEntry = sortOrderList[i];
                    const headerColIndex = sortEntry[0];
                    const sortDirection = sortEntry[1];

                    // Find all data columns mapped to this header column (for colspan headers)
                    const mappedDataCols = locateMappedIndex(targetTable.config.columnMap, headerColIndex, true);

                    for (let j = 0; j < mappedDataCols.length; j++) {
                        const actualHeaderElement = headerMap[mappedDataCols[j]];
                        if (actualHeaderElement) {
                            actualHeaderElement.addClass(cssClasses[sortDirection]);
                        }
                    }
                }
            }

            // Fixes column widths, typically used with pager plugin
            function adjustColumnWidths(targetTable, $headerElements) {
                const config = targetTable.config;
                if (!config.fixedColumnWidths) {
                    return;
                }

                // Ensure a colgroup exists or create one
                let $colgroup = $(targetTable).children('colgroup');
                if ($colgroup.length === 0) {
                    $colgroup = $('<colgroup>').prependTo(targetTable);
                } else {
                    $colgroup.empty(); // Clear existing cols if any
                }

                // Iterate through the first row's cells in tbody to get current widths
                const firstBodyRowCells = $("tr:first td", targetTable.tBodies[0]);
                if (firstBodyRowCells.length > 0) {
                    firstBodyRowCells.each(function() {
                        $colgroup.append($('<col>').css('width', $(this).outerWidth()));
                    });
                } else if ($headerElements.length > 0) {
                    // Fallback to header widths if no body rows
                    $headerElements.each(function() {
                        $colgroup.append($('<col>').css('width', $(this).outerWidth()));
                    });
                }
            }

            // Updates the internal sort counter for each header
            function refreshHeaderSortCounters(targetTable, currentSortList) {
                const config = targetTable.config;
                for (let i = 0; i < currentSortList.length; i++) {
                    const sortRule = currentSortList[i];
                    const headerElement = config.headerElementList[sortRule[0]];
                    if (headerElement) {
                        headerElement.sortCount = sortRule[1]; // Set directly from current sort list
                        // The original incremented, but if sortList is the source of truth, direct assignment is better.
                        // For toggling, the click handler would increment before calling sort.
                    }
                }
            }

            /* --- Sorting Algorithm --- */

            // Performs multi-column sorting on the cached data
            function performMultiColumnSort(targetTable, sortInstructions, dataCache) {
                if (targetTable.config.enableDebugging) {
                    var sortStart = new Date();
                }

                if (!sortInstructions || sortInstructions.length === 0) {
                    if (targetTable.config.enableDebugging) {
                        outputDiagnostic("No sort instructions provided.");
                    }
                    return;
                }

                const columnProcessors = targetTable.config.valueProcessors;

                // Dynamically build a comparison function for performance
                // This string-based approach is faster than chaining multiple JS functions in a loop for large datasets.
                let comparisonFunctionBody = "let valA, valB, result;";
                for (let i = 0; i < sortInstructions.length; i++) {
                    const colIndex = sortInstructions[i][0];
                    const sortDirection = sortInstructions[i][1];
                    const processor = columnProcessors[colIndex];
                    const comparisonMethod = processor.type; // e.g., 'text', 'numeric', 'date'

                    // Extract values directly from the normalized cache
                    comparisonFunctionBody += `
                        valA = a[${colIndex}];
                        valB = b[${colIndex}];
                    `;

                    // Apply comparison logic based on processor type
                    if (comparisonMethod === "numeric" || comparisonMethod === "currency") {
                        comparisonFunctionBody += `
                            result = valA - valB;
                        `;
                    } else if (comparisonMethod === "date") {
                        // Dates are typically normalized to numbers (timestamps) by parsers
                        comparisonFunctionBody += `
                            result = valA - valB;
                        `;
                    } else { // Default to text comparison (case-insensitive)
                        comparisonFunctionBody += `
                            result = (valA < valB) ? -1 : ((valA > valB) ? 1 : 0);
                        `;
                    }

                    // Apply sort direction
                    comparisonFunctionBody += `
                        if (result !== 0) {
                            return ${sortDirection === 1 ? '-' : ''}result;
                        }
                    `;
                }
                comparisonFunctionBody += "return 0;"; // If all columns are equal

                // Create the dynamic sort function
                const dynamicSortComparator = new Function('a', 'b', comparisonFunctionBody);

                dataCache.processedValues.sort(dynamicSortComparator);

                if (targetTable.config.enableDebugging) {
                    measurePerformance("Performed multi-column sort", sortStart);
                }
            }

            /* --- Plugin Registration and Initialization --- */

            // Register a new value processor
            this.addValueProcessor = function(processor) {
                valueProcessors.push(processor);
            };

            // Register a new layout adjuster (widget)
            this.addLayoutAdjuster = function(adjuster) {
                layoutAdjusters.push(adjuster);
            };

            // Main initialization method for the plugin
            this.init = function(tableElement, options) {
                const config = $.extend({}, this.defaultSettings, options);
                tableElement.config = config; // Attach config to the DOM element

                if (config.enableDebugging) {
                    outputDiagnostic("Initializing dataGridSort plugin...");
                    var initStart = new Date();
                }

                // 1. Build header elements
                const $headers = buildHeaderElements(tableElement);

                // 2. Prepare value processors for each column
                tableElement.config.valueProcessors = prepareTypeProcessors(tableElement, $headers);

                // 3. Analyze header spans for complex layouts
                tableElement.config.columnMap = analyzeHeaderSpans(tableElement);

                // 4. Set up header click handlers
                $headers.click(function(event) {
                    if (this.sortDisabled) {
                        return false; // Do nothing if sorting is disabled
                    }

                    const clickedColumnIndex = this.columnIdentifier;
                    const isMultiSort = event[config.multiSortKey]; // Check for shiftKey, etc.

                    let currentSortList = [];

                    if (isMultiSort && config.activeSortCriteria.length > 0) {
                        // Add to existing sort list
                        currentSortList = $.extend(true, [], config.activeSortCriteria); // Deep copy
                        let found = false;
                        for (let i = 0; i < currentSortList.length; i++) {
                            if (currentSortList[i][0] === clickedColumnIndex) {
                                currentSortList[i][1] = 1 - currentSortList[i][1]; // Toggle direction
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            currentSortList.push([clickedColumnIndex, this.sortOrder]);
                        }
                    } else {
                        // Start a new sort list
                        this.sortCount = (this.sortCount + 1) % 2; // Toggle 0 (asc) or 1 (desc)
                        currentSortList = [
                            [clickedColumnIndex, this.sortCount]
                        ];
                    }

                    // Apply forced sort rules
                    if (config.preSortRules) {
                        currentSortList = config.preSortRules.concat(currentSortList);
                    }
                    if (config.postSortRules) {
                        currentSortList = currentSortList.concat(config.postSortRules);
                    }

                    // Store the new sort list
                    config.activeSortCriteria = currentSortList;

                    // Perform the actual sorting
                    $(tableElement).trigger("sortStart"); // Notify before sort

                    // Rebuild cache if needed (e.g., table content changed)
                    const dataCache = buildDataCache(tableElement);
                    performMultiColumnSort(tableElement, config.activeSortCriteria, dataCache);
                    reassembleTable(tableElement, dataCache);

                    // Update header display
                    updateHeaderDisplay(tableElement, $headers, config.activeSortCriteria, [config.ascendingClass, config.descendingClass]);
                    refreshHeaderSortCounters(tableElement, config.activeSortCriteria);

                    return false; // Prevent default header click behavior
                }).mousedown(function() {
                    // Prevent text selection on header click
                    if (config.preventTextSelection) {
                        return false;
                    }
                });

                // Initial sort if sortList is provided
                if (config.sortList.length > 0) {
                    config.activeSortCriteria = config.sortList;
                    const initialCache = buildDataCache(tableElement);
                    performMultiColumnSort(tableElement, config.activeSortCriteria, initialCache);
                    reassembleTable(tableElement, initialCache);
                    updateHeaderDisplay(tableElement, $headers, config.activeSortCriteria, [config.ascendingClass, config.descendingClass]);
                    refreshHeaderSortCounters(tableElement, config.activeSortCriteria);
                } else {
                    // If no initial sort, just apply widgets
                    applyLayoutAdjusters(tableElement);
                }

                // Apply fixed column widths if configured
                adjustColumnWidths(tableElement, $headers);

                if (config.enableDebugging) {
                    measurePerformance("dataGridSort initialization", initStart);
                }
            };
        };

        // --- Register default value processors ---

        // Generic text processor
        coreUtility.addValueProcessor({
            id: "text",
            type: "text",
            is: function(s) {
                return true; // Always matches
            },
            format: function(s) {
                return $.trim(s.toLowerCase());
            }
        });

        // Numeric processor
        coreUtility.addValueProcessor({
            id: "numeric",
            type: "numeric",
            is: function(s) {
                return !isNaN(s) && s.length;
            },
            format: function(s) {
                return parseFloat(s);
            }
        });

        // Currency processor (removes currency symbols and comma separators)
        coreUtility.addValueProcessor({
            id: "currency",
            type: "numeric",
            is: function(s) {
                return (s !== null && s.match(/^\$|£|€/));
            },
            format: function(s) {
                const cleaned = s.replace(/[^0-9\.-]/g, '');
                return parseFloat(cleaned);
            }
        });

        // Date processor (US format MM/DD/YYYY)
        coreUtility.addValueProcessor({
            id: "date",
            type: "date",
            is: function(s) {
                return s.match(/^[0-9]{2}[\/\-][0-9]{2}[\/\-][0-9]{4}$/); // MM/DD/YYYY or MM-DD-YYYY
            },
            format: function(s) {
                const parts = s.split(/[\/\-]/);
                const month = parseInt(parts[0], 10);
                const day = parseInt(parts[1], 10);
                const year = parseInt(parts[2], 10);
                // Return timestamp for comparison
                return new Date(year, month - 1, day).getTime();
            }
        });

        // --- Register default layout adjusters (widgets) ---

        // Zebra striping widget
        coreUtility.addLayoutAdjuster({
            id: "zebra",
            format: function(table) {
                const config = table.config;
                const $rows = $(table.tBodies[0]).children("tr");
                const classes = config.zebraStripe.rowClasses;

                if (classes && classes.length === 2) {
                    $rows.removeClass(classes[0]).removeClass(classes[1]);
                    $rows.filter(":even").addClass(classes[0]);
                    $rows.filter(":odd").addClass(classes[1]);
                }
            }
        });

        // Initialize the plugin for each selected table
        return this.each(function() {
            // Ensure this is a table element
            if (this.tagName === 'TABLE') {
                coreUtility.init(this, initOptions);
            } else if (coreUtility.defaultSettings.enableDebugging) {
                coreUtility.outputDiagnostic("Warning: dataGridSort applied to a non-TABLE element.");
            }
        });
    };
})(jQuery);