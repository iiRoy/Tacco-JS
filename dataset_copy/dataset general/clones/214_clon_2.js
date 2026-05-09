"use strict";
var DataGrid;
(function (DataGrid) {
    DataGrid.buildVersion = "3.1.2";
    DataGrid.requiredNgVersion = { main: 1, sub: 3, patch: 1 };

    (function (ItemSelectionMode) {
        ItemSelectionMode[ItemSelectionMode["NoSelection"] = 0] = "NoSelection";
        ItemSelectionMode[ItemSelectionMode["OneItem"] = 1] = "OneItem";
        ItemSelectionMode[ItemSelectionMode["ManyItems"] = 2] = "ManyItems";
        ItemSelectionMode[ItemSelectionMode["ManyItemsWithKeys"] = 3] = "ManyItemsWithKeys";
    })(DataGrid.ItemSelectionMode || (DataGrid.ItemSelectionMode = {}));
    var ItemSelectionMode = DataGrid.ItemSelectionMode;

    // It's crucial to pre-assign all the standard column configuration settings,
    // allowing direct comparison with column attributes specified in the HTML markup.
    DataGrid.standardColumnConfigBlueprint = {
        colWidth: null,
        colHeight: null,
        textAlignment: null,
        outputFormat: null,
        displayLabel: null,
        filterFunction: null,
        allowFiltering: null,
        allowSorting: null
    };

    DataGrid.standardColumnConfig = {};
    DataGrid.localeStrings = {};
    DataGrid.verboseLogging = false;

    var configsInitialized = false;
    var gridComponent = "dataGrid";

    DataGrid.sortProcessor = gridComponent + "SortProcessor";
    DataGrid.pageProcessor = gridComponent + "PageProcessor";
    DataGrid.textTranslator = gridComponent + "TranslateProcessor";
    DataGrid.dateFormatter = gridComponent + "DateProcessor";
    DataGrid.dataFormatter = gridComponent + "FormatProcessor";

    // var headerComponent = "dataGridHeader";
    // var headerComponentAttribute = "data-grid-header";

    var mainBodyComponent = "dataGridBody";
    var mainBodyAttribute = "data-grid-body";
    var dataFieldAttribute = "field-id";
    var alternativeFieldAttribute = "alt-field-id";
    var isCustomAttr = "is-custom";

    var cellFootComponent = "dataGridFooterCell";
    var cellFootAttribute = "data-grid-footer-cell";
    var cellFootTemplateComponent = "dataGridFooterCellTemplate";
    var cellFootTemplateAttribute = "data-grid-footer-cell-template";
    DataGrid.footTemplateId = cellFootTemplateComponent + ".html";

    var globalSearchComponent = "dataGridGlobalFilter";
    DataGrid.globalSearchAttribute = "data-grid-global-filter";
    DataGrid.globalSearchTemplateId = globalSearchComponent + ".html";

    var pageNavComponent = "dataGridPager";
    DataGrid.pageNavAttribute = "data-grid-pager";
    DataGrid.pageNavTemplateId = pageNavComponent + ".html";

    var cellHeadComponent = "dataGridHeaderCell";
    var cellHeadAttribute = "data-grid-header-cell";
    var cellHeadTemplateComponent = "dataGridHeaderCellTemplate";
    var cellHeadTemplateAttribute = "data-grid-header-cell-template";
    DataGrid.headTemplateId = cellHeadTemplateComponent + ".html";

    var cellContentComponent = "dataGridBodyCell";
    var cellContentAttribute = "data-grid-body-cell";
    var cellContentTemplateComponent = "dataGridBodyCellTemplate";
    var cellContentTemplateAttribute = "data-grid-body-cell-template";
    DataGrid.bodyTemplateId = cellContentTemplateComponent + ".html";

    var columnSortComponent = "dataGridColumnSort";
    DataGrid.columnSortAttribute = "data-grid-column-sort";
    DataGrid.columnSortTemplateId = columnSortComponent + ".html";

    var columnFilterComponent = "dataGridColumnFilter";
    DataGrid.columnFilterAttribute = "data-grid-column-filter";
    DataGrid.columnFilterTemplateId = columnFilterComponent + ".html";


    var locateChildByTag = function (containerElem, targetTag) {
        targetTag = targetTag.toUpperCase();
        var childElements = containerElem.children();

        for (var idx = 0; idx < childElements.length; idx++) {
            var currentChild = childElements[idx];
            if (currentChild.nodeName === targetTag) {
                return angular.element(currentChild);
            }
        }
        return null;
    };


    var locateChildrenByTag = function (parentElem, targetTag) {
        targetTag = targetTag.toUpperCase();
        var foundChildren = [];
        var childrenList = parentElem.children();

        for (var index = 0; index < childrenList.length; index++) {
            var currentChild = childrenList[index];
            if (currentChild.nodeName === targetTag) {
                foundChildren.push(angular.element(currentChild));
            }
        }
        return foundChildren;
    };


    /**
     * Merges two collections of cell metadata. The first collection dictates the presence of items,
     * but the resulting merged items will incorporate data from the second collection if a match is found.
     */
    var mergeCellInfoCollections = function (primarySet, secondarySet, includeExtraFieldItems, includeExtraNonFieldItems) {
        var resultantSet = [];
        var tempSecondarySet = secondarySet.slice(0);

        angular.forEach(primarySet, function (primaryCol) {
            // Attempt to find a corresponding entry in the secondary collection
            var matchedSecondaryCol = null;
            for (var secondaryColIdx = 0; !matchedSecondaryCol && secondaryColIdx < tempSecondarySet.length; secondaryColIdx++) {
                matchedSecondaryCol = tempSecondarySet[secondaryColIdx];
                if (matchedSecondaryCol.propName === primaryCol.propName) {
                    tempSecondarySet.splice(secondaryColIdx, 1);
                } else {
                    matchedSecondaryCol = null;
                }
            }

            if (matchedSecondaryCol) {
                resultantSet.push(matchedSecondaryCol);
            } else {
                resultantSet.push(primaryCol);
            }
        });

        // Append any remaining items from the secondary collection to the merged set
        if (includeExtraFieldItems || includeExtraNonFieldItems) {
            angular.forEach(tempSecondarySet, function (secondaryCol) {
                if ((includeExtraFieldItems && secondaryCol.propName) || (includeExtraNonFieldItems && !secondaryCol.propName)) {
                    resultantSet.push(secondaryCol);
                }
            });
        }
        return resultantSet;
    };


    var encloseTemplateCell = function (templateNode, templateAttributes, isUserDefined, cellTemplateAttr) {
        if (isUserDefined) {
            var childNodes = templateNode.children();
            var firstNode = angular.element(childNodes[0]);

            if (childNodes.length !== 1 || !firstNode.attr(cellTemplateAttr)) {
                // If not already wrapped or multiple children, wrap the custom template cell's children
                templateNode.empty();
                var wrapperNode = angular.element("<div></div>").attr(cellTemplateAttr, "");
                templateNode.append(wrapperNode);
                angular.forEach(childNodes, function (childNode) {
                    wrapperNode.append(angular.element(childNode));
                });
            }
        } else {
            // For standard cells, just insert the default wrapper
            templateNode.empty();
            templateNode.append(angular.element("<div></div>").attr(cellTemplateAttr, ""));
        }
    };


    var TemplateCellInfo = (function () {
        function TemplateCellInfo(owningSection, cellNode) {
            this.owningSection = owningSection;
            this.cellNode = cellNode;
            this.fieldIdentifier = cellNode.attr(dataFieldAttribute) || cellNode.attr(alternativeFieldAttribute);
            var customBody = cellNode.children();
            this.isDefaultColumn = customBody.length === 0;
        }
        return TemplateCellInfo;
    })();


    var TemplatePart = (function () {
        function TemplatePart(partTagName, partDirectiveAttr, rowDirectiveAttr, itemTagName, itemDirectiveAttr) {
            this.partTagName = partTagName;
            this.partDirectiveAttr = partDirectiveAttr;
            this.rowDirectiveAttr = rowDirectiveAttr;
            this.itemTagName = itemTagName;
            this.itemDirectiveAttr = itemDirectiveAttr;
            this.itemTagName = this.itemTagName.toUpperCase();
            this.itemNodes = null;
        }


        TemplatePart.prototype.setupPart = function (gridContainer, columnDefinitions) {
            var _this = this;
            var sectionNode = this.getSectionNode(gridContainer, true);
            sectionNode.empty();
            sectionNode.removeAttr("ng-non-bindable");

            // Order the elements
            var rowItemDefinitions = mergeCellInfoCollections(columnDefinitions, this.itemNodes, false, false);

            // Retrieve the templated row structure
            var templateRow = this.getTemplateRowNode(sectionNode, true);

            angular.forEach(rowItemDefinitions, function (gridItem, idx) {
                var gridItemNode;
                var templateItem = gridItem;

                // It might not be a templated cell, be careful
                if (templateItem.owningSection === _this && templateItem.cellNode) {
                    gridItemNode = templateItem.cellNode.clone(true);
                } else {
                    gridItemNode = angular.element("<table><" + _this.itemTagName + "></" + _this.itemTagName + "></table>").find(_this.itemTagName);
                }

                // Configure its attributes
                if (_this.itemDirectiveAttr) {
                    gridItemNode.attr(_this.itemDirectiveAttr, idx);
                }
                if (!gridItem.isDefaultColumn) {
                    gridItemNode.attr(isCustomAttr, "true");
                }
                if (gridItem.fieldIdentifier) {
                    gridItemNode.attr(dataFieldAttribute, gridItem.fieldIdentifier);
                }

                gridItemNode.attr("ng-style", "{\'width\':columnOptions.colWidth,\'height\':columnOptions.colHeight}");

                // Finally, append it to the parent row
                templateRow.append(gridItemNode);
            });
            return sectionNode;
        };


        TemplatePart.prototype.retrievePartialColumnDefs = function () {
            return this.itemNodes;
        };


        TemplatePart.prototype.findTemplates = function (gridContainer) {
            var _this = this;
            this.itemNodes = [];
            this.itemRowNode = null;

            var templateRow = this.getTemplateRowNode(this.getSectionNode(gridContainer, false), false);

            if (templateRow) {
                this.itemRowNode = angular.element(templateRow.clone());
                this.itemRowNode.empty();

                angular.forEach(templateRow.children(), function (childNode, childIdx) {
                    childNode = angular.element(childNode);
                    if (childNode[0].nodeName === _this.itemTagName.toUpperCase()) {
                        var templateNode = childNode.clone();
                        _this.itemNodes.push(new TemplateCellInfo(_this, templateNode));
                    }
                });
            }
        };


        TemplatePart.prototype.getSectionNode = function (gridContainer, ensureExists) {
            var sectionNode = null;
            if (gridContainer) {
                sectionNode = locateChildByTag(gridContainer, this.partTagName);
            }

            if (!sectionNode && ensureExists) {
                // Angular's peculiar behavior workaround: https://groups.google.com/forum/#!topic/angular/7poFynsguNw
                sectionNode = angular.element("<table><" + this.partTagName + "></" + this.partTagName + "></table>").find(this.partTagName);
                if (gridContainer) {
                    gridContainer.append(sectionNode);
                }
            }

            if (sectionNode && ensureExists && this.partDirectiveAttr) {
                sectionNode.attr(this.partDirectiveAttr, "");
            }
            return sectionNode;
        };


        TemplatePart.prototype.getTemplateRowNode = function (sectionNode, ensureExists) {
            var rowNode = null;
            if (sectionNode) {
                rowNode = locateChildByTag(sectionNode, "tr");
            }

            if (!rowNode && ensureExists) {
                rowNode = this.itemRowNode ? angular.element(this.itemRowNode.clone()) : angular.element("<table><tr></tr></table>").find("tr");
                if (sectionNode) {
                    sectionNode.append(rowNode);
                }
            }

            if (rowNode && ensureExists && this.rowDirectiveAttr) {
                rowNode.attr(this.rowDirectiveAttr, "");
            }
            return rowNode;
        };

        return TemplatePart;
    })();


    var TableManager = (function () {
        function TableManager(compilerSvc, parserSvc, timerSvc, templateStorage) {
            this.compilerSvc = compilerSvc;
            this.parserSvc = parserSvc;
            this.timerSvc = timerSvc;

            if (!configsInitialized) {
                initTemplates(templateStorage);
                configsInitialized = true;
            }
        }


        TableManager.prototype.initializeTable = function (tableScope, tableOptions, isServerMode) {
            var _this = this;
            this.tableOptions = tableOptions;
            this.isServerMode = isServerMode;
            tableScope.tableOptions = tableOptions;
            tableScope.DataGrid = DataGrid;

            // Define some default values if not provided
            // tableScope.$watch("tableOptions.language", (newLocale: string) => {
            //     if (!newLocale) {
            //         tableScope.tableOptions.language = "en";
            //     }
            // });

            // tableScope.$watch("tableOptions.itemSelectionMode", (newSelectionMode: string) => {
            //     if (!newSelectionMode) {
            //         tableScope.tableOptions.itemSelectionMode = ItemSelectionMode[ItemSelectionMode.ManyItems];
            //     }
            // });

            // tableScope.$watch("tableOptions.dataRequestDelay", (newDataRequiredDelay: string) => {
            //     if (newDataRequiredDelay === undefined) {
            //         tableScope.tableOptions.dataRequestDelay = 1000;
            //     }
            // });

            tableOptions.tableColDefs = [];
            if (tableOptions.language === undefined) {
                tableOptions.language = "en";
            }
            if (tableOptions.itemSelectionMode === undefined) {
                tableOptions.itemSelectionMode = ItemSelectionMode[2 /* ManyItems */];
            }
            if (tableOptions.fieldFilters === undefined) {
                tableOptions.fieldFilters = {};
            }
            if (tableOptions.canFilter === undefined) {
                tableOptions.canFilter = true;
            }
            if (tableOptions.canSort === undefined) {
                tableOptions.canSort = true;
            }
            if (tableOptions.dataRequestDelay === undefined) {
                tableOptions.dataRequestDelay = 1000; // milliseconds
            }
            if (tableOptions.chosenItems === undefined) {
                tableOptions.chosenItems = [];
            }
            if (tableOptions.currentPageIndex === undefined) {
                tableOptions.currentPageIndex = 0;
            }

            // Set up observers for certain specialized attributes
            if (isServerMode) {
                var fetchDataAction = function () {
                    _this.dataFetchPromise = null;
                    _this.tableOptions.immediateDataFetch = false;
                    DataGrid.verboseLogging && _this.log("Requesting data - server-side processing active");
                    _this.tableOptions.onDataFetch(_this.tableOptions);
                };

                var scheduleDataFetch = function () {
                    if (_this.dataFetchPromise) {
                        _this.timerSvc.cancel(_this.dataFetchPromise);
                        _this.dataFetchPromise = null;
                    }
                    if (_this.tableOptions.immediateDataFetch) {
                        fetchDataAction();
                    } else {
                        _this.dataFetchPromise = _this.timerSvc(function () {
                            fetchDataAction();
                        }, _this.tableOptions.dataRequestDelay, true);
                    }
                };

                tableScope.$watchCollection("[" +
                    "tableOptions.currentPageIndex," +
                    "tableOptions.globalFilter, " +
                    "tableOptions.fieldFilters, " +
                    "tableOptions.sortField, " +
                    "tableOptions.sortReverse, " +
                    "tableOptions.itemsPerPage, " +
                    "]", function (currentValues, previousValues) {
                        // Initially, both arrays of values will be identical
                        var pageHasChanged = currentValues[0] !== previousValues[0];
                        if (!angular.equals(currentValues, previousValues) && !pageHasChanged) {
                            // Any change, except for a page index change, will reset the page to the first one
                            if (_this.tableOptions.currentPageIndex !== 0) {
                                _this.tableOptions.currentPageIndex = 0;
                                // The page index watcher will trigger; exit to prevent duplicate data requests
                                return;
                            }
                        }
                        // This is called initially even without changes, which is necessary to kick off the data request
                        scheduleDataFetch();
                    });

                tableScope.$watch("tableOptions.immediateDataFetch", function (newValue) {
                    if (newValue && _this.dataFetchPromise) {
                        _this.timerSvc.cancel(_this.dataFetchPromise);
                        fetchDataAction();
                    }
                });
            }

            // Observe selection mode changes
            tableScope.$watch("tableOptions.itemSelectionMode", function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    switch (newValue) {
                        case ItemSelectionMode[0 /* NoSelection */]:
                            tableOptions.chosenItems.length = 0; // Clear array
                            break;
                        case ItemSelectionMode[1 /* OneItem */]:
                            if (tableOptions.chosenItems.length > 1) {
                                tableOptions.chosenItems.splice(1);
                            }
                            break;
                    }
                }
            });

            return tableScope;
        };


        TableManager.prototype.accelerateDataFetch = function (eventObj) {
            if (!eventObj || eventObj.keyId == 13) {
                this.tableOptions.immediateDataFetch = true;
            }
        };


        TableManager.prototype.updateColumnConfig = function (colIndex, colConfig) {
            var initialConfig = this.tableOptions.tableColDefs[colIndex];
            if (!initialConfig) {
                throw "Invalid table column options located for column index " + colIndex + ". Please report this error.";
            }

            // Copy certain options onto the incoming set of configurations
            colConfig = angular.extend(colConfig, initialConfig);

            // Replace the original configurations
            this.tableOptions.tableColDefs[colIndex] = colConfig;
        };


        TableManager.prototype.cycleSortOrder = function (fieldId) {
            if (this.tableOptions.sortField != fieldId) {
                // The column for sorting has changed
                this.tableOptions.sortField = fieldId;
            } else {
                // The sorting direction has been altered
                this.tableOptions.sortReverse = !this.tableOptions.sortReverse;
            }
            this.accelerateDataFetch();
        };


        TableManager.prototype.toggleItemChoice = function (visibleItems, selectedItem, clickEvent) {
            if (this.tableOptions.itemSelectionMode === ItemSelectionMode[0 /* NoSelection */])
                return;

            switch (this.tableOptions.itemSelectionMode) {
                case ItemSelectionMode[3 /* ManyItemsWithKeys */]:
                    if (!clickEvent.controlKey && !clickEvent.shiftKey && !clickEvent.commandKey) {
                        // If no key modifiers are pressed, clear the current selection and start fresh
                        var itemIdx = this.tableOptions.chosenItems.indexOf(selectedItem);
                        this.tableOptions.chosenItems.length = 0; // Clear array
                        if (itemIdx < 0) {
                            this.tableOptions.chosenItems.push(selectedItem);
                        }
                    } else {
                        if (clickEvent.controlKey || clickEvent.commandKey) {
                            // The control key (or command key on Mac) toggles the item's selection status
                            var itemIdx = this.tableOptions.chosenItems.indexOf(selectedItem);
                            if (itemIdx >= 0) {
                                this.tableOptions.chosenItems.splice(itemIdx, 1);
                            } else {
                                this.tableOptions.chosenItems.push(selectedItem);
                            }
                        } else if (clickEvent.shiftKey) {
                            // Clear any unwanted text selections, if browser supports it
                            if (document.selection && document.selection.empty) {
                                document.selection.empty();
                            } else if (window.getSelection) {
                                var currentSelection = window.getSelection();
                                currentSelection.removeAllRanges();
                            }

                            // The shift key always selects items from the last chosen item to the current one
                            var startItemIdx;
                            var lastChosenItem = this.tableOptions.chosenItems[this.tableOptions.chosenItems.length - 1];
                            for (startItemIdx = 0; startItemIdx < visibleItems.length && visibleItems[startItemIdx].$$_tableItem !== lastChosenItem; startItemIdx++);

                            if (startItemIdx >= visibleItems.length) {
                                startItemIdx = 0;
                            }

                            var endItemIdx;
                            for (endItemIdx = 0; endItemIdx < visibleItems.length && visibleItems[endItemIdx].$$_tableItem !== selectedItem; endItemIdx++);

                            if (endItemIdx >= visibleItems.length) {
                                throw "Invalid selection detected in a key modifier selection mode";
                            }

                            if (endItemIdx < startItemIdx) {
                                var tempIdx = startItemIdx;
                                startItemIdx = endItemIdx;
                                endItemIdx = tempIdx;
                            }

                            for (var currentIdx = startItemIdx; currentIdx <= endItemIdx; currentIdx++) {
                                var currentItem = visibleItems[currentIdx].$$_tableItem;
                                if (this.tableOptions.chosenItems.indexOf(currentItem) < 0) {
                                    this.tableOptions.chosenItems.push(currentItem);
                                }
                            }
                        }
                    }
                    break;
                case ItemSelectionMode[1 /* OneItem */]:
                    var itemIdx = this.tableOptions.chosenItems.indexOf(selectedItem);
                    this.tableOptions.chosenItems.length = 0; // Clear array
                    if (itemIdx < 0) {
                        this.tableOptions.chosenItems.push(selectedItem);
                    }
                    break;
                case ItemSelectionMode[2 /* ManyItems */]:
                    var itemIdx = this.tableOptions.chosenItems.indexOf(selectedItem);
                    if (itemIdx >= 0) {
                        this.tableOptions.chosenItems.splice(itemIdx, 1);
                    } else {
                        this.tableOptions.chosenItems.push(selectedItem);
                    }
                    break;
            }
        };


        TableManager.prototype.findSectionTemplates = function (gridContainer) {
            this.headerSection = new TemplatePart("thead", null, null, "th", cellHeadAttribute);
            this.bodySection = new TemplatePart("tbody", mainBodyAttribute, null, "td", cellContentAttribute);
            this.footerSection = new TemplatePart("tfoot", null, null, "td", cellFootAttribute);

            this.headerSection.findTemplates(gridContainer);
            this.footerSection.findTemplates(gridContainer);
            this.bodySection.findTemplates(gridContainer);
        };


        TableManager.prototype.sanitizeFieldId = function (fieldId) {
            return fieldId.replace(/[^a-zA-Z]/g, "_");
        };


        TableManager.prototype.arrangeTableLayout = function (parentContext, tableElement, previousContext) {
            var _this = this;
            try {
                tableElement.empty();
                if (previousContext) {
                    // It's not permitted to destroy the old scope within the same digest cycle
                    var contextToDispose = previousContext;
                    this.timerSvc(function () {
                        contextToDispose.$destroy();
                    });
                    previousContext = null;
                }

                var newContext = parentContext.$new();