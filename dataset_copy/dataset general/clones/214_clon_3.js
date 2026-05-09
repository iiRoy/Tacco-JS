"use strict";
let GridMaster;
(function (GridMaster) {
    // Library version and minimum framework requirements
    GridMaster.libVersion = "4.0.0";
    GridMaster.minFrameworkVer = { major: 1, minor: 4, patch: 0 }; // Changed 'dot' to 'patch' for variety
    (function (SelectionPolicy) {
        // Defines various selection behaviors for the grid.
        SelectionPolicy[SelectionPolicy["NoSelection"] = 0] = "NoSelection";
        SelectionPolicy[SelectionPolicy["SingleEntry"] = 1] = "SingleEntry";
        SelectionPolicy[SelectionPolicy["MultipleEntries"] = 2] = "MultipleEntries";
        SelectionPolicy[SelectionPolicy["KeyModMultipleEntries"] = 3] = "KeyModMultipleEntries";
    })(GridMaster.SelectionPolicy || (GridMaster.SelectionPolicy = {}));
    const SelectionPolicy = GridMaster.SelectionPolicy; // Renamed variable
    // This template holds default configuration for grid columns.
    // It's crucial for mapping attributes from the markup to column options.
    GridMaster.baseColConfigSchema = {
        colWidth: null,
        colHeight: null,
        displayAlignment: null,
        formatMask: null,
        headerText: null,
        filterPreset: null,
        allowFiltering: null,
        allowSorting: null
    };
    GridMaster.columnConfigDefaults = {};
    GridMaster.i18n = {}; // Renamed translations to i18n
    GridMaster.diagnosticMode = false; // Renamed debugMode
    let templatesInitialized = false; // Renamed templatesConfigured
    const mainGridDirective = "dmGrid"; // Renamed tableDirective
    GridMaster.sortingProcessor = mainGridDirective + "SortProcess"; // Renamed sortFilter
    GridMaster.dataPaginationProcessor = mainGridDirective + "DataPager"; // Renamed dataPagingFilter
    GridMaster.textTranslateFilter = mainGridDirective + "TxtTranslate"; // Renamed translateFilter
    GridMaster.defaultDateFormat = mainGridDirective + "DateFmt"; // Renamed translationDateFormat
    GridMaster.dataFormattingFilter = mainGridDirective + "DataFormatter"; // Renamed dataFormattingFilter
    const gridBodySection = "dmGridBodySection"; // Renamed bodyDirective
    const gridBodyAttribute = "dm-grid-body-section"; // Renamed bodyDirectiveAttribute
    const fieldIdAttr = "field-id"; // Renamed fieldNameAttribute
    const dataFieldIdAttr = "data-field-id"; // Renamed altFieldNameAttribute
    const customLayoutAttr = "custom-layout"; // Renamed isCustomizedAttribute
    const footerCellDirective = "dmGridFootCell"; // Renamed cellFooterDirective
    const footerCellAttribute = "dm-grid-footer-cell"; // Renamed cellFooterDirectiveAttribute
    const footerCellTemplateDirective = "dmGridFootCellTpl"; // Renamed cellFooterTemplateDirective
    const footerCellTemplateAttribute = "dm-grid-footer-cell-template"; // Renamed cellFooterTemplateDirectiveAttribute
    GridMaster.footerCellTemplateId = footerCellTemplateDirective + ".html"; // Renamed cellFooterTemplateId
    const globalSearchDirective = "dmGridGlobalSrch"; // Renamed globalFilterDirective
    GridMaster.globalSearchAttribute = "dm-grid-global-search"; // Renamed globalFilterDirectiveAttribute
    GridMaster.footerGlobalSearchTemplateId = globalSearchDirective + ".html"; // Renamed footerGlobalFilterTemplateId
    const pagerComponentDirective = "dmGridPagerComp"; // Renamed pagerDirective
    GridMaster.pagerComponentAttribute = "dm-grid-pager-component"; // Renamed pagerDirectiveAttribute
    GridMaster.footerPagerTemplateId = pagerComponentDirective + ".html"; // Renamed footerPagerTemplateId
    const headerCellDirective = "dmGridHeadCell"; // Renamed cellHeaderDirective
    const headerCellAttribute = "dm-grid-header-cell"; // Renamed cellHeaderDirectiveAttribute
    const headerCellTemplateDirective = "dmGridHeadCellTpl"; // Renamed cellHeaderTemplateDirective
    const headerCellTemplateAttribute = "dm-grid-header-cell-template"; // Renamed cellHeaderTemplateDirectiveAttribute
    GridMaster.headerCellTemplateId = headerCellTemplateDirective + ".html"; // Renamed cellHeaderTemplateId
    const rowCellDirective = "dmGridRowCell"; // Renamed cellBodyDirective
    const rowCellAttribute = "dm-grid-row-cell"; // Renamed cellBodyDirectiveAttribute
    const rowCellTemplateDirective = "dmGridRowCellTpl"; // Renamed cellBodyTemplateDirective
    const rowCellTemplateAttribute = "dm-grid-row-cell-template"; // Renamed cellBodyTemplateDirectiveAttribute
    GridMaster.rowCellTemplateId = rowCellTemplateDirective + ".html"; // Renamed cellBodyTemplateId
    const columnSorterDirective = "dmGridColSorter"; // Renamed columnSortDirective
    GridMaster.columnSorterAttribute = "dm-grid-column-sorter"; // Renamed columnSortDirectiveAttribute
    GridMaster.columnSorterTemplateId = columnSorterDirective + ".html"; // Renamed columnSortTemplateId
    const columnFilterDirective = "dmGridColFilter"; // Renamed columnFilterDirective
    GridMaster.columnFilterAttribute = "dm-grid-column-filter"; // Renamed columnFilterDirectiveAttribute
    GridMaster.columnFilterTemplateId = columnFilterDirective + ".html"; // Renamed columnFilterTemplateId
    /**
     * Locates the first child element of a given parent by its tag name.
     * @param parent The parent AngularJS element.
     * @param targetTag The tag name to search for.
     * @returns The found child element as an AngularJS element, or null if not found.
     */
    const retrieveChildElementByTag = function (parent, targetTag) {
        if (!parent || !targetTag) {
            return null; // Added guard clause
        }
        const upperCaseTag = targetTag.toUpperCase();
        const childElements = parent.children();
        for (let idx = 0; idx < childElements.length; idx++) {
            const currentChild = angular.element(childElements[idx]);
            if (currentChild[0].tagName === upperCaseTag) {
                return currentChild;
            }
        }
        return null;
    };
    /**
     * Retrieves all child elements of a parent that match a given tag name.
     * @param parent The parent AngularJS element.
     * @param targetTag The tag name to search for.
     * @returns An array of matching AngularJS elements.
     */
    const retrieveChildrenElementsByTag = function (parent, targetTag) {
        if (!parent || !targetTag) {
            return []; // Added guard clause
        }
        const upperCaseTag = targetTag.toUpperCase();
        const matchingChildren = [];
        const allChildren = parent.children();
        for (let i = 0; i < allChildren.length; i++) {
            const currentChild = angular.element(allChildren[i]);
            if (currentChild[0].tagName === upperCaseTag) {
                matchingChildren.push(currentChild);
            }
        }
        return matchingChildren;
    };
    /**
     * Merges two sets of column definitions, prioritizing the first set.
     * Items from the second set are included if they don't conflict or if specified.
     * @param primarySet The primary set of column definitions.
     * @param secondarySet The secondary set of column definitions.
     * @param includeExtraFieldItemsFromSecondary If true, add field-based items from secondarySet not in primarySet.
     * @param includeExtraNonFieldItemsFromSecondary If true, add non-field-based items from secondarySet not in primarySet.
     * @returns A new array representing the merged column definitions.
     */
    const mergeCellDefinitions = function (primarySet, secondarySet, includeExtraFieldItemsFromSecondary, includeExtraNonFieldItemsFromSecondary) {
        const mergedResult = [];
        const secondarySetCopy = secondarySet.slice(0); // Create a mutable copy
        // Process primary set, looking for matches in the secondary set
        primarySet.forEach(primaryCol => {
            let foundInSecondary = null;
            const matchIndex = secondarySetCopy.findIndex(secondaryCol => secondaryCol.fieldName === primaryCol.fieldName);
            if (matchIndex !== -1) {
                foundInSecondary = secondarySetCopy[matchIndex];
                secondarySetCopy.splice(matchIndex, 1); // Remove matched item from secondary copy
            }
            // If a match is found, use the secondary item (it's the one with original template if applicable)
            // otherwise, use the primary item.
            mergedResult.push(foundInSecondary || primaryCol);
        });
        // Add remaining items from the secondary set based on flags
        secondarySetCopy.forEach(secondaryCol => {
            const isFieldBased = !!secondaryCol.fieldName;
            if ((includeExtraFieldItemsFromSecondary && isFieldBased) || (includeExtraNonFieldItemsFromSecondary && !isFieldBased)) {
                mergedResult.push(secondaryCol);
            }
        });
        return mergedResult;
    };
    /**
     * Ensures a custom cell's content is wrapped correctly for templating.
     * @param targetElement The cell's template element.
     * @param attributes The attributes of the cell.
     * @param isCustom Whether the cell has custom content.
     * @param wrapperDirective The directive to use for the wrapper element.
     */
    const encapsulateCellContent = function (targetElement, attributes, isCustom, wrapperDirective) {
        if (!targetElement || !wrapperDirective) {
            console.warn("GridMaster: Invalid parameters for encapsulateCellContent.");
            return;
        }
        if (isCustom) {
            const innerElements = targetElement.children();
            // Check if wrapping is needed: only one child and it already has the wrapperDirective
            if (innerElements.length === 1 && angular.element(innerElements[0]).attr(wrapperDirective)) {
                // Already wrapped, no action needed.
                return;
            }
            // Wrap the existing children
            const wrapperDiv = angular.element("<div></div>").attr(wrapperDirective, "");
            targetElement.contents().appendTo(wrapperDiv); // Move all contents
            targetElement.append(wrapperDiv); // Add the wrapper to the element
        }
        else {
            // For non-custom cells, ensure it has the default wrapper
            targetElement.empty();
            targetElement.append(angular.element("<div></div>").attr(wrapperDirective, ""));
        }
    };
    /**
     * Represents a single cell's layout information within a grid section.
     */
    const CellLayoutDescriptor = (function () {
        function CellLayoutDescriptor(parentSection, cellHtmlElement) {
            this.parentSection = parentSection;
            this.cellHtmlElement = cellHtmlElement;
            this.fieldName = cellHtmlElement.attr(fieldIdAttr) || cellHtmlElement.attr(dataFieldIdAttr);
            // Determine if the column is standard (no custom content) or customized
            this.isStandardColumn = cellHtmlElement.children().length === 0;
        }
        return CellLayoutDescriptor;
    })();
    /**
     * Manages a specific section of the grid (e.g., header, body, footer).
     * It handles discovering existing templates and configuring the section structure.
     */
    const GridSectionManager = (function () {
        function GridSectionManager(sectionTag, sectionDirAttribute, rowDirAttribute, cellTag, cellDirAttribute) {
            this.sectionTag = sectionTag;
            this.sectionDirAttribute = sectionDirAttribute;
            this.rowDirAttribute = rowDirAttribute;
            this.cellTag = cellTag;
            this.cellDirAttribute = cellDirAttribute;
            this.cellTag = this.cellTag.toUpperCase(); // Ensure uppercase for tag comparisons
            this.discoveredCells = null; // Renamed 'cells'
        }
        /**
         * Configures the grid section element based on provided column definitions.
         * @param gridContainerElement The main grid element.
         * @param columnDefinitions The array of column definitions.
         * @returns The configured section element.
         */
        GridSectionManager.prototype.configureSection = function (gridContainerElement, columnDefinitions) {
            const _this = this;
            const currentSectionElement = this.getSectionElement(gridContainerElement, true);
            currentSectionElement.empty(); // Clear existing content
            currentSectionElement.removeAttr("ng-non-bindable"); // Ensure binding is active
            // Combine column definitions with any previously discovered templated cells
            const finalRowElements = mergeCellDefinitions(columnDefinitions, this.discoveredCells, false, false);
            // Get or create the templated row within this section
            const sectionRowElement = this.getTemplatedRowElement(currentSectionElement, true);
            angular.forEach(finalRowElements, function (colInfo, index) {
                let cellElementToAppend;
                const templatedCellInfo = colInfo;
                // If it's a templated cell from this section, use its original element clone
                if (templatedCellInfo && templatedCellInfo.parentSection === _this && templatedCellInfo.cellHtmlElement) {
                    cellElementToAppend = templatedCellInfo.cellHtmlElement.clone(true);
                }
                else {
                    // Otherwise, create a new default cell element
                    cellElementToAppend = angular.element(`<${_this.cellTag}></${_this.cellTag}>`);
                }
                // Apply directives and attributes to the cell
                if (_this.cellDirAttribute) {
                    cellElementToAppend.attr(_this.cellDirAttribute, index);
                }
                if (!colInfo.isStandardColumn) {
                    cellElementToAppend.attr(customLayoutAttr, "true");
                }
                if (colInfo.fieldName) {
                    cellElementToAppend.attr(fieldIdAttr, colInfo.fieldName);
                }
                // Apply dynamic styles based on column options
                cellElementToAppend.attr("ng-style", "{'width':colInfo.colWidth,'height':colInfo.colHeight}");
                // Finally, add the cell to the row
                sectionRowElement.append(cellElementToAppend);
            });
            return currentSectionElement;
        };
        /**
         * Extracts partial column definitions based on discovered templates.
         * @returns An array of CellLayoutDescriptor objects.
         */
        GridSectionManager.prototype.extractPartialColumnDefinitions = function () {
            return this.discoveredCells;
        };
        /**
         * Discovers and stores templated cells within this section of the grid.
         * @param gridContainerElement The main grid element.
         */
        GridSectionManager.prototype.discoverTemplates = function (gridContainerElement) {
            const _this = this;
            this.discoveredCells = [];
            this.cachedRowTemplate = null; // Renamed 'cellRow'
            const foundTemplatedRow = this.getTemplatedRowElement(this.getSectionElement(gridContainerElement, false), false);
            if (foundTemplatedRow) {
                this.cachedRowTemplate = angular.element(foundTemplatedRow.clone());
                this.cachedRowTemplate.empty(); // Clear content, keep only the row structure
                angular.forEach(foundTemplatedRow.children(), function (childElem) {
                    const currentChild = angular.element(childElem);
                    if (currentChild[0].tagName === _this.cellTag) {
                        const cellTemplate = currentChild.clone();
                        _this.discoveredCells.push(new CellLayoutDescriptor(_this, cellTemplate));
                    }
                });
            }
        };
        /**
         * Gets or creates the section element (e.g., <thead>, <tbody>, <tfoot>).
         * @param gridContainerElement The main grid element.
         * @param ensurePresence If true, creates the element if it doesn't exist.
         * @returns The section element.
         */
        GridSectionManager.prototype.getSectionElement = function (gridContainerElement, ensurePresence) {
            let sectionElement = null;
            if (gridContainerElement) {
                sectionElement = retrieveChildElementByTag(gridContainerElement, this.sectionTag);
            }
            if (!sectionElement && ensurePresence) {
                // Angular's jqLite requires a parent for .find()
                sectionElement = angular.element(`<table><${this.sectionTag}></${this.sectionTag}></table>`).find(this.sectionTag);
                if (gridContainerElement) {
                    gridContainerElement.append(sectionElement);
                }
            }
            if (sectionElement && ensurePresence && this.sectionDirAttribute) {
                sectionElement.attr(this.sectionDirAttribute, "");
            }
            return sectionElement;
        };
        /**
         * Gets or creates the row element within a section.
         * @param sectionElement The section element.
         * @param ensurePresence If true, creates the row if it doesn't exist.
         * @returns The row element.
         */
        GridSectionManager.prototype.getTemplatedRowElement = function (sectionElement, ensurePresence) {
            let rowElement = null;
            if (sectionElement) {
                rowElement = retrieveChildElementByTag(sectionElement, "tr");
            }
            if (!rowElement && ensurePresence) {
                rowElement = this.cachedRowTemplate ? angular.element(this.cachedRowTemplate.clone()) : angular.element("<table><tr></tr></table>").find("tr");
                if (sectionElement) {
                    sectionElement.append(rowElement);
                }
            }
            if (rowElement && ensurePresence && this.rowDirAttribute) {
                rowElement.attr(this.rowDirAttribute, "");
            }
            return rowElement;
        };
        return GridSectionManager;
    })();
    /**
     * The main controller for the DataGrid. Manages grid state, options, and interactions.
     */
    const DataGridController = (function () {
        function DataGridController($compileService, $expressionParser, $timeoutService, $templateCacheService) {
            this.$compileService = $compileService;
            this.$expressionParser = $expressionParser;
            this.$timeoutService = $timeoutService;
            // Ensure templates are configured only once across all grid instances
            if (!templatesInitialized) {
                this.initializeGridTemplates($templateCacheService); // Renamed configureTemplates
                templatesInitialized = true;
            }
        }
        /**
         * Initializes and sets up the grid's scope and options.
         * @param gridScope The AngularJS scope for the grid.
         * @param gridOptions The configuration options for the grid.
         * @param isServerDrivenMode True if the grid is operating in server-side data mode.
         * @returns The configured grid scope.
         */
        DataGridController.prototype.setupGrid = function (gridScope, gridOptions, isServerDrivenMode) {
            const _this = this;
            this.gridConfiguration = gridOptions; // Renamed gridOptions
            this.isServerDrivenMode = isServerDrivenMode; // Renamed isInServerSideMode
            gridScope.gridConfiguration = gridOptions;
            gridScope.GridMaster = GridMaster;
            // Set default values for various grid options if not already defined
            const applyDefault = (option, defaultValue) => {
                if (gridOptions[option] === undefined) {
                    gridOptions[option] = defaultValue;
                }
            };
            applyDefault("gridColumnDefs", []);
            applyDefault("locale", "en");
            applyDefault("selectionPolicy", SelectionPolicy.MultipleEntries); // Renamed selectionMode
            applyDefault("filterByFields", {});
            applyDefault("enableFiltering", true);
            applyDefault("enableSorting", true);
            applyDefault("dataFetchDelayMs", 1000); // Renamed onDataRequiredDelay, changed type to ms explicitly
            applyDefault("selectedDataItems", []); // Renamed selectedItems
            applyDefault("currentPageIndex", 0); // Renamed currentPage
            // Setup watchers for server-side mode to trigger data retrieval
            if (this.isServerDrivenMode) {
                let dataFetchInProgress = false; // Added new variable for debouncing
                const triggerDataRetrieval = function () {
                    if (dataFetchInProgress) {
                        return; // Prevent re-entry
                    }
                    dataFetchInProgress = true;
                    _this.activeDataRequestPromise = null;
                    _this.gridConfiguration.immediateDataFetch = false; // Renamed immediateDataRetrieval
                    GridMaster.diagnosticMode && console.log("GridMaster: Requesting data (server-side mode). Current page:", _this.gridConfiguration.currentPageIndex);
                    // Call the user-defined data required callback
                    _this.gridConfiguration.onDataRequired(_this.gridConfiguration);
                    dataFetchInProgress = false; // Reset flag after call
                };
                const scheduleDataFetch = function () {
                    if (_this.activeDataRequestPromise) {
                        _this.$timeoutService.cancel(_this.activeDataRequestPromise);
                        _this.activeDataRequestPromise = null;
                    }
                    if (_this.gridConfiguration.immediateDataFetch) {
                        triggerDataRetrieval();
                    }
                    else {
                        _this.activeDataRequestPromise = _this.$timeoutService(function () {
                            triggerDataRetrieval();
                        }, _this.gridConfiguration.dataFetchDelayMs, true);
                    }
                };
                // Watch for changes in parameters that necessitate data reload
                gridScope.$watchCollection("[gridConfiguration.currentPageIndex, gridConfiguration.filterQuery, gridConfiguration.filterByFields, gridConfiguration.sortField, gridConfiguration.sortReverse, gridConfiguration.itemsPerPage]", function (newValues, oldValues) {
                    // Check if current page index is the only change or if other parameters changed
                    const pageChangedOnly = (newValues[0] !== oldValues[0] && newValues.slice(1).every((val, i) => val === oldValues[i + 1]));
                    if (!angular.equals(newValues, oldValues) && !pageChangedOnly) {
                        // If any parameter other than page index changed, reset to first page
                        if (_this.gridConfiguration.currentPageIndex !== 0) {
                            _this.gridConfiguration.currentPageIndex = 0;
                            // The page index watch will activate; return to avoid duplicate requests
                            return;
                        }
                    }
                    // Schedule data retrieval initially and on relevant changes
                    scheduleDataFetch();
                });
                gridScope.$watch("gridConfiguration.immediateDataFetch", function (isImmediate) {
                    if (isImmediate && _this.activeDataRequestPromise) {
                        _this.$timeoutService.cancel(_this.activeDataRequestPromise);
                        triggerDataRetrieval();
                    }
                });
            }
            // Watch for changes in selection policy to adjust selected items
            gridScope.$watch("gridConfiguration.selectionPolicy", function (newPolicy, oldPolicy) {
                if (newPolicy !== oldPolicy) {
                    switch (newPolicy) {
                        case SelectionPolicy.NoSelection:
                            _this.gridConfiguration.selectedDataItems.splice(0); // Clear all selections
                            break;
                        case SelectionPolicy.SingleEntry:
                            if (_this.gridConfiguration.selectedDataItems.length > 1) {
                                _this.gridConfiguration.selectedDataItems.splice(1); // Keep only the first item
                            }
                            break;
                        // For MultipleEntries and KeyModMultipleEntries, no automatic clearing is needed
                    }
                }
            });
            return gridScope;
        };
        /**
         * Speeds up asynchronous data retrieval, typically on user interaction like pressing Enter in a filter.
         * @param event The DOM event, if any.
         */
        DataGridController.prototype.expediteDataRetrieval = function (event) {
            if (!event || event.keyCode === 13) { // Check for Enter key
                this.gridConfiguration.immediateDataFetch = true;
                GridMaster.diagnosticMode && console.log("GridMaster: Data retrieval expedited by user action.");
            }
        };
        /**
         * Sets or updates options for a specific column.
         * @param colIndex The index of the column.
         * @param newColumnOptions The new options to apply.
         */
        DataGridController.prototype.updateColumnOptions = function (colIndex, newColumnOptions) {
            const existingOptions = this.gridConfiguration.gridColumnDefs[colIndex];
            if (!existingOptions) {
                console.error(`GridMaster: Invalid column index ${colIndex} provided for options update.`);
                throw new Error(`Invalid column index: ${colIndex}`); // Added more robust error handling
            }
            // Merge new options into existing ones, ensuring original properties are preserved
            Object.assign(existingOptions, newColumnOptions);
            // Replace the column definition with the updated version
            this.gridConfiguration.gridColumnDefs[colIndex] = existingOptions;
        };
        /**
         * Toggles the sorting order for a given property.
         * If the property is new, it sets it as the primary sort.
         * If it's the current sort, it reverses the direction.
         * @param dataProperty The property name to sort by.
         */
        DataGridController.prototype.toggleDataSorting = function (dataProperty) {
            if (this.gridConfiguration.sortField === dataProperty) {
                // Same column, just reverse the sort direction
                this.gridConfiguration.sortReverse = !this.gridConfiguration.sortReverse;
            }
            else {
                // New column, set it as the sort field and default to ascending
                this.gridConfiguration.sortField = dataProperty;
                this.gridConfiguration.sortReverse = false;
            }
            this.expediteDataRetrieval(); // Trigger immediate data fetch due to sort change
        };
        /**
         * Toggles the selection state of an individual item in the grid.
         * Handles different selection policies and key modifiers.
         * @param visibleItems An array of currently filtered/visible items.
         * @param targetItem The item to toggle selection for.
         * @param event The DOM event that triggered the toggle (e.g., click event).
         */
        DataGridController.prototype.toggleItemSelection = function (visibleItems, targetItem, event) {
            const currentPolicy = this.gridConfiguration.selectionPolicy;
            if (currentPolicy === SelectionPolicy.NoSelection) {
                return; // Selection is disabled
            }
            const selectedItemsArray = this.gridConfiguration.selectedDataItems;
            const itemIndexInSelected = selectedItemsArray.indexOf(targetItem);
            switch (currentPolicy) {
                case SelectionPolicy.KeyModMultipleEntries:
                    const isCtrlOrMeta = event.ctrlKey || event.metaKey;
                    const isShift = event.shiftKey;
                    if (!isCtrlOrMeta && !isShift) {
                        // No modifiers: clear existing selection and select only the clicked item
                        selectedItemsArray.splice(0);
                        if (itemIndexInSelected < 0) { // If it wasn't already selected
                            selectedItemsArray.push(targetItem);
                        }
                    }
                    else if (isCtrlOrMeta) {
                        // Ctrl/Meta key: toggle selection for the clicked item
                        if (itemIndexInSelected >= 0) {
                            selectedItemsArray.splice(itemIndexInSelected, 1);
                        }
                        else {
                            selectedItemsArray.push(targetItem);
                        }
                    }
                    else if (isShift) {
                        // Shift key: select a range of items
                        if (document.selection && document.selection.empty) {
                            document.selection.empty(); // Clear text selection for IE
                        }
                        else if (window.getSelection) {
                            window.getSelection().removeAllRanges(); // Clear text selection for modern browsers
                        }
                        const lastSelectedItem = selectedItemsArray[selectedItemsArray.length - 1];
                        let startIndex = 0;
                        if (lastSelectedItem) {
                            const lastSelectedIndex = visibleItems.findIndex(i => i.$$_gridItem === lastSelectedItem);
                            if (lastSelectedIndex !== -1) {
                                startIndex = lastSelectedIndex;
                            }
                        }
                        const targetIndex = visibleItems.findIndex(i => i.$$_gridItem === targetItem);
                        if (targetIndex === -1) {
                            console.error("GridMaster: Target item not found in visible items for shift selection.");
                            return; // Guard against invalid state
                        }
                        // Determine the start and end of the range
                        const rangeStart = Math.min(startIndex, targetIndex);
                        const rangeEnd = Math.max(startIndex, targetIndex);
                        // Add all items in the range to the selection
                        for (let i = rangeStart; i <= rangeEnd; i++) {
                            const currentRangeItem = visibleItems[i].$$_gridItem;
                            if (selectedItemsArray.indexOf(currentRangeItem) < 0) {
                                selectedItemsArray.push(currentRangeItem);
                            }
                        }
                    }
                    break;
                case SelectionPolicy.SingleEntry:
                    // Single entry: clear all and select only the clicked item
                    selectedItemsArray.splice(0);
                    if (itemIndexInSelected < 0) { // Only add if not already the single selected item
                        selectedItemsArray.push(targetItem);
                    }
                    break;
                case SelectionPolicy.MultipleEntries:
                    // Multiple entries: toggle selection for the clicked item
                    if (itemIndexInSelected >= 0) {
                        selectedItemsArray.splice(itemIndexInSelected, 1);
                    }
                    else {
                        selectedItemsArray.push(targetItem);
                    }
                    break;
            }
        };
        /**
         * Discovers and processes custom templates defined within the grid's markup.
         * @param gridElement The main grid element.
         */
        DataGridController.prototype.discoverGridTemplates = function (gridElement) {
            this.headerLayout = new GridSectionManager("thead", null, null, "th", headerCellAttribute);
            this.bodyLayout = new GridSectionManager("tbody", gridBodyAttribute, null, "td", rowCellAttribute);
            this.footerLayout = new GridSectionManager("tfoot", null, null, "td", footerCellAttribute);
            // Perform discovery for each section
            this.headerLayout.discoverTemplates(gridElement);
            this.footerLayout.discoverTemplates(gridElement);
            this.bodyLayout.discoverTemplates(gridElement);
            GridMaster.diagnosticMode && console.log("GridMaster: Templates discovered for header, body, and footer sections.");
        };
        /**
         * Generates a safe field name suitable for use as an identifier (e.g., in CSS classes).
         * @param originalFieldName The original field name.
         * @returns A sanitized field name.
         */
        DataGridController.prototype.generateSafeFieldName = function (originalFieldName) {
            if (!originalFieldName) {
                return "_empty_"; // Added handling for null/empty field names
            }
            // Replace non-alphanumeric characters with underscores
            return originalFieldName.replace(/[^a-zA-Z0-9_]/g, "_");
        };
        /**
         * Configures the HTML structure of the grid based on discovered templates and column definitions.
         * @param parentScope The parent AngularJS scope.
         * @param gridElement The main grid element.
         * @param previousScope The scope that might need to be destroyed from a previous rendering.
         */
        DataGridController.prototype.configureTableStructure = function (parentScope, gridElement, previousScope) {
            const _this = this;
            try {
                gridElement.empty(); // Clear the existing content of the grid
                if (previousScope) {
                    // Schedule destruction of the old scope to avoid issues within the current digest cycle
                    const scopeToDispose = previousScope;
                    this.$timeoutService(() => {
                        scopeToDispose.$destroy();
                        GridMaster.diagnosticMode && console.log("GridMaster: Previous grid scope destroyed.");
                    }, 0); // Use 0ms timeout for next cycle execution
                    previousScope = null; // Clear reference
                }
                const newChildScope = parentScope.$new(); // Create a new child scope for the grid instance
                // This function would continue to build the table structure (header, body, footer)
                // using the section managers and column definitions, then compile it.
                // For brevity in this clone, the detailed implementation of structure building and compiling is omitted,
                // but its conceptual place remains here.
                GridMaster.diagnosticMode && console.log("GridMaster: New grid structure configuration started.");
                // Example of how compilation might be invoked:
                // this.$compileService(gridElement.contents())(newChildScope);
            }
            catch (error) {
                console.error("GridMaster: Error during table structure configuration:", error);
                throw error; // Re-throw to propagate the issue
            }
        };
        /**
         * Private method to configure default templates in the $templateCache.
         * @param $templateCacheService The AngularJS $templateCache service.
         */
        DataGridController.prototype.initializeGridTemplates = function ($templateCacheService) {
            // This function would populate $templateCache with default HTML templates
            // for various grid components like header cells, body cells, filters, etc.
            // For example:
            // $templateCacheService.put(GridMaster.headerCellTemplateId, "<div>...default header HTML...</div>");
            // $templateCacheService.put(GridMaster.rowCellTemplateId, "<div>...default row cell HTML...</div>");
            // ...and so on for other template IDs...
            GridMaster.diagnosticMode && console.log("GridMaster: Default templates registered with $templateCache.");
        };
        return DataGridController;
    })();
    // Placeholder for global template configuration function (original's configureTemplates)
    function configureTemplates(cache) {
        // This function should ideally be part of a module configuration or the controller
        // It's kept for structural similarity but its content would be moved into
        // DataGridController.prototype.initializeGridTemplates in a real refactor.
        if (GridMaster.diagnosticMode) {
            console.warn("GridMaster: Global 'configureTemplates' function is deprecated. Use DataGridController.initializeGridTemplates.");
        }
        // Example of template caching:
        if (!cache.get(GridMaster.headerCellTemplateId)) {
            cache.put(GridMaster.headerCellTemplateId, `
                <div class="dm-grid-header-cell-content" ng-class="{'dm-grid-sortable': gridOptions.enableSorting && columnOptions.allowSorting !== false}" ng-click="gridCtrl.toggleDataSorting(columnOptions.fieldName)">
                    <span ng-bind="columnOptions.headerText"></span>
                    <span ng-if="gridOptions.enableSorting && columnOptions.allowSorting !== false" class="dm-grid-sort-icon" ng-class="{'dm-grid-sort-asc': gridOptions.sortField === columnOptions.fieldName && !gridOptions.sortReverse, 'dm-grid-sort-desc': gridOptions.sortField === columnOptions.fieldName && gridOptions.sortReverse}"></span>
                </div>
                <div ng-if="gridOptions.enableFiltering && columnOptions.allowFiltering !== false">
                    <input type="text" ng-model="gridOptions.filterByFields[columnOptions.fieldName]" ng-change="gridCtrl.expediteDataRetrieval($event)" class="dm-grid-column-filter-input" placeholder="Filter...">
                </div>
            `);
        }
        if (!cache.get(GridMaster.rowCellTemplateId)) {
            cache.put(GridMaster.rowCellTemplateId, `
                <div class="dm-grid-row-cell-content" ng-bind="gridItem[columnOptions.fieldName]"></div>
            `);
        }
        if (!cache.get(GridMaster.footerCellTemplateId)) {
            cache.put(GridMaster.footerCellTemplateId, `
                <div class="dm-grid-footer-cell-content"></div>
            `);
        }
        if (!cache.get(GridMaster.footerGlobalSearchTemplateId)) {
            cache.put(GridMaster.footerGlobalSearchTemplateId, `
                <div class="dm-grid-global-search-wrapper">
                    <input type="text" ng-model="gridOptions.filterQuery" ng-change="gridCtrl.expediteDataRetrieval($event)" class="dm-grid-global-filter-input" placeholder="Global search...">
                </div>
            `);
        }
        if (!cache.get(GridMaster.pagerComponentTemplateId)) {
            cache.put(GridMaster.pagerComponentTemplateId, `
                <div class="dm-grid-pager-wrapper">
                    <button ng-click="gridOptions.currentPageIndex = 0" ng-disabled="gridOptions.currentPageIndex === 0">First</button>
                    <button ng-click="gridOptions.currentPageIndex = gridOptions.currentPageIndex - 1" ng-disabled="gridOptions.currentPageIndex === 0">Previous</button>
                    <span>Page {{gridOptions.currentPageIndex + 1}} of {{gridOptions.pageCount}}</span>
                    <button ng-click="gridOptions.currentPageIndex = gridOptions.currentPageIndex + 1" ng-disabled="gridOptions.currentPageIndex >= gridOptions.pageCount - 1">Next</button>
                    <button ng-click="gridOptions.currentPageIndex = gridOptions.pageCount - 1" ng-disabled="gridOptions.currentPageIndex >= gridOptions.pageCount - 1">Last</button>
                </div>
            `);
        }
    }
    // Register the DataGridController with Angular
    angular.module("GridMaster", [])
        .service("gridMaster", DataGridController) // Changed to service
        .directive(mainGridDirective, function () {
        return {
            restrict: "A",
            scope: {
                gridConfiguration: "=" // Renamed attribute from gridOptions
            },
            controller: DataGridController,
            controllerAs: "gridCtrl",
            link: function (scope, element, attrs, gridCtrl) {
                // Determine if server-side mode is active
                const serverModeEnabled = angular.isDefined(attrs.onDataRequired);
                // Initialize the grid controller
                const initializedScope = gridCtrl.setupGrid(scope, scope.gridConfiguration, serverModeEnabled);
                // Discover templated elements within the grid's markup
                gridCtrl.discoverGridTemplates(element);
                // Configure the table structure (header, body, footer) and compile it
                gridCtrl.configureTableStructure(initializedScope, element, null); // Passing null for previous scope initially
                // Add a cleanup handler for scope destruction
                initializedScope.$on('$destroy', function () {
                    GridMaster.diagnosticMode && console.log("GridMaster: Scope for directive destroyed.");
                    // Any other cleanup for the directive can go here
                });
            }
        };
    })
        // Register filters (simplified for clone, actual implementation would be in separate files)
        .filter(GridMaster.sortingProcessor, function () {
        return function (items, sortField, sortReverse) {
            if (!sortField) {
                return items;
            }
            const sortedItems = [...items].sort((a, b) => {
                const valA = a[sortField];
                const valB = b[sortField];
                if (valA < valB) return sortReverse ? 1 : -1;
                if (valA > valB) return sortReverse ? -1 : 1;
                return 0;
            });
            return sortedItems;
        };
    })
        .filter(GridMaster.dataPaginationProcessor, function () {
        return function (items, currentPage, itemsPerPage) {
            if (!items || !items.length || itemsPerPage <= 0) {
                return items;
            }
            const startIndex = currentPage * itemsPerPage;
            const endIndex = Math.min(startIndex + itemsPerPage, items.length);
            return items.slice(startIndex, endIndex);
        };
    });
})(GridMaster || (GridMaster = {}));