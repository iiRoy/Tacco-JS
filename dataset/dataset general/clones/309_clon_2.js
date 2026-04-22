/*
 * @copyright
 * (c) 2009-2012 Mark Lieberman
 * mark{dot}lieberman{at}gmail{dot}com
 * http://github.com/mleibman/slickgrid
 *
 * Licensed under the MIT license.
 * All rights reserved for this version.
 *
 * VisualDataMatrix v2.1
 *
 * KEY POINTS:
 *     Element manipulations for cells and rows are performed directly, bypassing jQuery's DOM methods.
 *     This approach significantly boosts performance, and it's safe because no event handlers
 *     or data are linked to these cell/row DOM elements.
 *     Cell editors must ensure they implement a .dispose() method for proper resource cleanup.
 */

// Verify that essential JavaScript utilities are loaded
if (typeof JQUtil === "undefined") {
    throw "VisualDataMatrix requires the JQUtil module to be present.";
}

if (!JQUtil.fn.drag) {
    throw "VisualDataMatrix requires the JQUtil.event.drag module to be loaded for drag functionality.";
}

if (typeof DataGridCore === "undefined") {
    throw "datagrid.core.js was not loaded; core framework missing.";
}


(function (jq) {
    // DataGridCore.VisualDataMatrix
    jq.extend(true, globalScope, {
        DataGridCore: {
            VisualDataMatrix: DataDisplayGrid
        }
    });

    // These variables are shared among all grid instances on the current page
    var scrollBarMetrics;
    var maxRenderableCssDimension; // The browser's maximum supported rendering height

    //////////////////////////////////////////////////////////////////////////////////////////////
    // DataDisplayGrid class implementation (exposed as DataGridCore.VisualDataMatrix)

    /**
     * Initializes a fresh instance of the data grid.
     * @class DataDisplayGrid
     * @constructor
     * @param {Node}              hostElement   DOM node serving as the grid's parent.
     * @param {Array,Object}      inputRecords  An array of objects used for data binding.
     * @param {Array}             fieldDefinitions     An array specifying column properties.
     * @param {Object}            configSettings     Grid configuration parameters.
     **/
    function DataDisplayGrid(hostElement, inputRecords, fieldDefinitions, configSettings) {
        // configuration properties
        var standardConfiguration = {
            manualInitialization: false,
            recordHeightPx: 25,
            standardFieldWidthPx: 80,
            allowNewRows: false,
            reserveSpaceForAdditions: false,
            canEdit: false,
            enableAutoEdit: true,
            canNavigateCells: true,
            allowColumnReordering: true,
            asyncEditComponentLoad: false,
            asyncEditLoadDelay: 100,
            fitColumnsToViewport: false,
            asyncPostRenderActive: false,
            postRenderDelayMs: 50,
            dynamicHeight: false,
            cellEditorLock: DataGridCore.TotalEditGuard,
            displayHeaderRow: false,
            headingRowHeight: 25,
            displayUpperPanel: false,
            controlPanelHeight: 25,
            displayFormatterFactory: null,
            editComponentFactory: null,
            highlightCellClass: "flashing",
            activeCellClass: "selected",
            multipleSelectionEnabled: true,
            canSelectCellText: false,
            dataEntryFieldExtractor: null,
            stretchRowsToFullWidth: false,
            enableMultiFieldSort: false,
            standardCellFormatter: standardValueFormatter,
            enforceSynchronousScrolling: false
        };

        var fieldConfigurationDefaults = {
            fieldLabel: "",
            canAdjustSize: true,
            canBeSorted: false,
            minimumDimension: 30,
            refreshOnResize: false,
            headingCssClass: null,
            sortAscByDefault: true,
            isFocusable: true,
            isSelectable: true
        };

        // scroll management
        var totalVirtualHeight;   // total virtual height in pixels
        var actualScrollableHeight;    // actual height that can be scrolled
        var pageSizeHeight;   // height of a single "page"
        var numDisplayPages;    // number of pages
        var scrollJumpinessFactor;   // "jumpiness" coefficient for scroll calculations

        var currentPageIndex = 0;       // the current display page
        var currentScrollOffset = 0;     // offset within the current page
        var verticalScrollDirection = 1;

        // internal state variables
        var isComponentReady = false;
        var $mainWrapper;
        var instanceGuid = "visualgrid_" + Math.round(1000000 * Math.random());
        var thisController = this;
        var $tabTrapA, $tabTrapB;
        var $columnHeaderScrollContainer;
        var $columnHeaders;
        var $filterRowDisplay, $filterRowScrollArea, $filterRowSpacingDiv;
        var $upperPanelContainer;
        var $upperPanelContent;
        var $gridViewport;
        var $drawingCanvas;
        var $dynamicStyleTag;
        var $ancestorScrollElements;
        var styleSheetRef, leftColStyleRules, rightColStyleRules;
        var viewportHeight, viewportWidth;
        var contentAreaWidth;
        var hasHorizontalScrollbar, hasVerticalScrollbar;
        var headerColWidthOffset = 0, headerColHeightOffset = 0, // border+padding differences
            dataCellWidthOffset = 0, dataCellHeightOffset = 0;
        var fixedMinColumnWidth;
        var totalDisplayedRows = 0;

        var focusMovementDirection = 1;
        var currentFocusPositionX;
        var focusedRowIndex;
        var focusedCellIndex;
        var focusedCellDomNode = null;
        var activeCellEditor = null;
        var editorContentSnapshot;
        var cellEditSupervisor;

        var dataRowCache = {};
        var numRenderedRows = 0;
        var visibleRowCount;
        var lastVerticalScrollPos = 0;
        var currentVerticalScrollPos = 0;
        var lastRenderedTopCoord = 0;
        var lastRenderedLeftCoord = 0;
        var lastHorizontalScrollPos = 0;
        var currentHorizontalScrollPos = 0;

        var gridSelectionManager;
        var chosenRowIndices = [];

        var registeredExtensions = [];
        var customCellCssMap = {};

        var fieldDefinitionsById = {};
        var activeSortDefinitions = [];
        var fieldLeftPositions = [];
        var fieldRightPositions = [];


        // handles for asynchronous operations
        var editorLoadHandle = null;
        var renderCycleHandle = null;
        var postRenderHandle = null;
        var postProcessedItemMap = {};
        var postProcessEndRow = null;
        var postProcessStartRow = null;

        // performance counters
        var renderedItemsCounter = 0;
        var removedItemsCounter = 0;


        //////////////////////////////////////////////////////////////////////////////////////////////
        // Component Initialization Logic

        function initializeGrid() {
            $mainWrapper = jq(hostElement);
            if ($mainWrapper.length < 1) {
                throw new Error("VisualDataMatrix requires a valid container element; " + hostElement + " does not exist in the DOM.");
            }

            // compute these values only once and share across grid instances
            maxRenderableCssDimension = maxRenderableCssDimension || queryBrowserMaxRenderHeight();
            scrollBarMetrics = scrollBarMetrics || calculateScrollbarOffsets();

            configSettings = jq.extend({}, standardConfiguration, configSettings);
            validateAndApplyConfig();
            fieldConfigurationDefaults.size = configSettings.standardFieldWidthPx;

            fieldDefinitionsById = {};
            for (var i = 0; i < fieldDefinitions.length; i++) {
                var fieldMeta = fieldDefinitions[i] = jq.extend({}, fieldConfigurationDefaults, fieldDefinitions[i]);
                fieldDefinitionsById[fieldMeta.identifier] = i;
                if (fieldMeta.minimumDimension && fieldMeta.size < fieldMeta.minimumDimension) {
                    fieldMeta.size = fieldMeta.minimumDimension;
                }
                if (fieldMeta.maximumDimension && fieldMeta.size > fieldMeta.maximumDimension) {
                    fieldMeta.size = fieldMeta.maximumDimension;
                }
            }

            // verify loaded JavaScript modules against requested options
            if (configSettings.allowColumnReordering && !jq.fn.sortable) {
                throw new Error("VisualDataMatrix's 'allowColumnReordering = true' option necessitates the jquery-ui.sortable module.");
            }

            cellEditSupervisor = {
                "applyCurrentEdit": finalizeActiveEdit,
                "discardCurrentEdit": revertCurrentCellEdit
            };

            $mainWrapper
                .empty()
                .css("overflow", "hidden")
                .css("outline", 0)
                .addClass(instanceGuid)
                .addClass("ui-widget");

            // set up a positioning container if necessary
            if (!/relative|absolute|fixed/.test($mainWrapper.css("position"))) {
                $mainWrapper.css("position", "relative");
            }

            $tabTrapA = jq("<div tabIndex='0' hideFocus style='position:fixed;width:0;height:0;top:0;left:0;outline:0;'></div>").appendTo($mainWrapper);

            $columnHeaderScrollContainer = jq("<div class='slick-header ui-state-default' style='overflow:hidden;position:relative;' />").appendTo($mainWrapper);
            $columnHeaders = jq("<div class='slick-header-columns' style='left:-1000px' />").appendTo($columnHeaderScrollContainer);
            $columnHeaders.width(determineHeaderPanelWidth());

            $filterRowScrollArea = jq("<div class='slick-headerrow ui-state-default' style='overflow:hidden;position:relative;' />").appendTo($mainWrapper);
            $filterRowDisplay = jq("<div class='slick-headerrow-columns' />").appendTo($filterRowScrollArea);
            $filterRowSpacingDiv = jq("<div style='display:block;height:1px;position:absolute;top:0;left:0;'></div>")
                .css("width", determineContentAreaWidth() + scrollBarMetrics.width + "px")
                .appendTo($filterRowScrollArea);

            $upperPanelContainer = jq("<div class='slick-top-panel-scroller ui-state-default' style='overflow:hidden;position:relative;' />").appendTo($mainWrapper);
            $upperPanelContent = jq("<div class='slick-top-panel' style='width:10000px' />").appendTo($upperPanelContainer);

            if (!configSettings.displayUpperPanel) {
                $upperPanelContainer.hide();
            }

            if (!configSettings.displayHeaderRow) {
                $filterRowScrollArea.hide();
            }

            $gridViewport = jq("<div class='slick-viewport' style='width:100%;overflow:auto;outline:0;position:relative;;'>").appendTo($mainWrapper);
            $gridViewport.css("overflow-y", configSettings.dynamicHeight ? "hidden" : "auto");

            $drawingCanvas = jq("<div class='grid-canvas' />").appendTo($gridViewport);

            $tabTrapB = $tabTrapA.clone().appendTo($mainWrapper);

            if (!configSettings.manualInitialization) {
                completeGridSetup();
            }
        }

        function completeGridSetup() {
            if (!isComponentReady) {
                isComponentReady = true;

                viewportWidth = parseFloat(jq.css($mainWrapper[0], "width", true));

                // Column headers and cells may have differing padding/border values, affecting width calculations (box-sizing, anyone?)
                // Compute the difference to ensure consistent sizing
                determineCellSpacingAndBorders();

                // For enhanced usability, all text selection within VisualDataMatrix is disabled,
                // with the exception of input and textarea elements (selection must
                // be enabled there for editor functionality); note that
                // selection in grid data cells (main grid body) is already unavailable in
                // all browsers except Internet Explorer.
                blockTextSelection($columnHeaders); // disable all text selection in header (including input and textarea)

                if (!configSettings.canSelectCellText) {
                    // disable text selection in grid data cells, except for input and textarea elements
                    // (this is IE-specific, as the selectstart event fires only in IE)
                    $gridViewport.bind("selectstart.ui", function (evt) {
                        return jq(evt.target).is("input,textarea");
                    });
                }

                updateColumnCaches();
                generateHeaderElements();
                configureHeaderSorting();
                buildGridCssRules();
                adjustDrawingSurface();
                hookUpParentScrollEvents();

                $mainWrapper
                    .bind("resize.visualgrid", adjustDrawingSurface);
                $gridViewport
                    .bind("scroll", processScrollEvent);
                $columnHeaderScrollContainer
                    .bind("contextmenu", processHeaderContextMenu)
                    .bind("click", processHeaderClick)
                    .delegate(".slick-header-column", "mouseenter", onHeaderHoverEnter)
                    .delegate(".slick-header-column", "mouseleave", onHeaderHoverExit);
                $filterRowScrollArea
                    .bind("scroll", processFilterRowScroll);
                $tabTrapA.add($tabTrapB)
                    .bind("keydown", processKeyPress);
                $drawingCanvas
                    .bind("keydown", processKeyPress)
                    .bind("click", onElementClick)
                    .bind("dblclick", onElementDblClick)
                    .bind("contextmenu", processGridContextMenu)
                    .bind("draginit", onDragBegin)
                    .bind("dragstart", {distance: 3}, onDragInitiate)
                    .bind("drag", onDragMove)
                    .bind("dragend", onDragFinish)
                    .delegate(".slick-cell", "mouseenter", onCellHoverEnter)
                    .delegate(".slick-cell", "mouseleave", onCellHoverExit);
            }
        }

        function attachGridExtension(gridExtension) {
            registeredExtensions.unshift(gridExtension);
            gridExtension.setup(thisController);
        }

        function detachGridExtension(gridExtension) {
            for (var i = registeredExtensions.length - 1; i >= 0; i--) {
                if (registeredExtensions[i] === gridExtension) {
                    if (registeredExtensions[i].dispose) {
                        registeredExtensions[i].dispose();
                    }
                    registeredExtensions.splice(i, 1);
                    break;
                }
            }
        }

        function assignSelectionModule(selectionHandler) {
            if (gridSelectionManager) {
                gridSelectionManager.onSelectionRangesModified.unsubscribe(processSelectionChange);
                if (gridSelectionManager.dispose) {
                    gridSelectionManager.dispose();
                }
            }

            gridSelectionManager = selectionHandler;
            if (gridSelectionManager) {
                gridSelectionManager.setup(thisController);
                gridSelectionManager.onSelectionRangesModified.subscribe(processSelectionChange);
            }
        }

        function retrieveSelectionModule() {
            return gridSelectionManager;
        }

        function getDrawingSurfaceDomNode() {
            return $drawingCanvas[0];
        }

        function calculateScrollbarOffsets() {
            var $tempDiv = jq("<div style='position:absolute; top:-10000px; left:-10000px; width:100px; height:100px; overflow:scroll;'></div>").appendTo("body");
            var dimensions = {
                width: $tempDiv.width() - $tempDiv[0].clientWidth,
                height: $tempDiv.height() - $tempDiv[0].clientHeight
            };
            $tempDiv.remove();
            return dimensions;
        }

        function determineHeaderPanelWidth() {
            var totalHeadersWidth = 0;
            for (var i = 0, len = fieldDefinitions.length; i < len; i++) {
                var currentFieldSize = fieldDefinitions[i].size;
                totalHeadersWidth += currentFieldSize;
            }
            totalHeadersWidth += scrollBarMetrics.width;
            return Math.max(totalHeadersWidth, viewportWidth) + 1000;
        }

        function determineContentAreaWidth() {
            var availableDisplayWidth = hasVerticalScrollbar ? viewportWidth - scrollBarMetrics.width : viewportWidth;
            var currentRowWidth = 0;
            var i = fieldDefinitions.length;
            while (i--) {
                currentRowWidth += fieldDefinitions[i].size;
            }
            return configSettings.stretchRowsToFullWidth ? Math.max(currentRowWidth, availableDisplayWidth) : currentRowWidth;
        }

        function refreshContentAreaWidth(forceFieldWidthsUpdate) {
            var oldContentAreaWidth = contentAreaWidth;
            contentAreaWidth = determineContentAreaWidth();

            if (contentAreaWidth != oldContentAreaWidth) {
                $drawingCanvas.width(contentAreaWidth);
                $filterRowDisplay.width(contentAreaWidth);
                $columnHeaders.width(determineHeaderPanelWidth());
                hasHorizontalScrollbar = (contentAreaWidth > viewportWidth - scrollBarMetrics.width);
            }

            $filterRowSpacingDiv.width(contentAreaWidth + (hasVerticalScrollbar ? scrollBarMetrics.width : 0));

            if (contentAreaWidth != oldContentAreaWidth || forceFieldWidthsUpdate) {
                distributeColumnWidths();
            }
        }

        function blockTextSelection($targetElement) {
            if ($targetElement && $targetElement.jquery) {
                $targetElement
                    .attr("unselectable", "on")
                    .css("MozUserSelect", "none")
                    .bind("selectstart.ui", function () {
                        return false;
                    }); // derived from jquery:ui.core.js 1.7.2
            }
        }

        function queryBrowserMaxRenderHeight() {
            var maxAllowedHeight = 1000000;
            // Firefox reports the height correctly but renders blank after approximately 6 million pixels
            var testLimit = navigator.userAgent.toLowerCase().match(/firefox/) ? 6000000 : 1000000000;
            var tempDiv = jq("<div style='display:none' />").appendTo(document.body);

            while (true) {
                var currentTestHeight = maxAllowedHeight * 2;
                tempDiv.css("height", currentTestHeight);
                if (currentTestHeight > testLimit || tempDiv.height() !== currentTestHeight) {
                    break;
                } else {
                    maxAllowedHeight = currentTestHeight;
                }
            }

            tempDiv.remove();
            return maxAllowedHeight;
        }

        // IMPORTANT: This function is static. It does not account for changes in the DOM structure after initial binding.
        function hookUpParentScrollEvents() {
            var currentElem = $drawingCanvas[0];
            while ((currentElem = currentElem.parentNode) != document.body && currentElem != null) {
                // only bind to elements that are actual scroll containers
                if (currentElem == $gridViewport[0] || currentElem.scrollWidth != currentElem.clientWidth || currentElem.scrollHeight != currentElem.clientHeight) {
                    var $elemRef = jq(currentElem);
                    if (!$ancestorScrollElements) {
                        $ancestorScrollElements = $elemRef;
                    } else {
                        $ancestorScrollElements = $ancestorScrollElements.add($elemRef);
                    }
                    $elemRef.bind("scroll." + instanceGuid, processActiveCellMove);
                }
            }
        }

        function unhookParentScrollEvents() {
            if (!$ancestorScrollElements) {
                return;
            }
            $ancestorScrollElements.unbind("scroll." + instanceGuid);
            $ancestorScrollElements = null;
        }

        function modifyColumnHeadingDisplay(fieldIdentifier, newCaption, newToolTip) {
            if (!isComponentReady) {
                return;
            }
            var fieldIdx = getColumnIndex(fieldIdentifier);
            if (fieldIdx == null) {
                return;
            }

            var fieldSpec = fieldDefinitions[fieldIdx];
            var $fieldHeader = $columnHeaders.children().eq(fieldIdx);
            if ($fieldHeader) {
                if (newCaption !== undefined) {
                    fieldDefinitions[fieldIdx].fieldLabel = newCaption;
                }
                if (newToolTip !== undefined) {
                    fieldDefinitions[fieldIdx].toolTip = newToolTip;
                }

                trigger(thisController.onHeaderCellAboutToDestroy, {
                    "node": $fieldHeader[0],
                    "column": fieldSpec
                });

                $fieldHeader
                    .attr("title", newToolTip || "")
                    .children().eq(0).html(newCaption);

                trigger(thisController.headerCellRenderComplete, {
                    "node": $fieldHeader[0],
                    "column": fieldSpec
                });
            }