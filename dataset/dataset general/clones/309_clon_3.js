/*
 * @license
 * (c) 2023 Acqua Solutions Inc.
 * dev{at}acquasolutions{dot}com
 * http://github.com/acquasolutions/flexiview
 *
 * Distributed under BSD-3-Clause license.
 * All rights reserved.
 *
 * FlexiView DataPresenter v3.0
 *
 * IMPORTANT NOTE:
 *     Element manipulation for cells and rows is performed directly on the DOM,
 *     bypassing typical jQuery methods. This approach significantly boosts performance,
 *     but relies on the absence of complex event handlers or attached data on these nodes.
 *     Custom cell editors must ensure they implement a proper 'release()' method
 *     to handle resource deallocation and prevent memory leaks.
 *     Additionally, this component expects a modern browser environment supporting ES5+.
 */

// Ensure core JavaScript dependencies are available
if (typeof jQuery === "undefined") {
  throw new Error("FlexiView requires the jQuery library to be loaded.");
}
const JQ = jQuery; // Alias jQuery for internal use
if (!JQ.fn.drag) {
  throw new Error("FlexiView requires the jquery.event.drag plugin for drag-and-drop functionality.");
}
if (typeof FlexiView === "undefined") {
  throw new Error("flexiview.core.js not found. Core FlexiView utilities must be loaded first.");
}
if (typeof window === "undefined") { // Added a non-essential check
  throw new Error("FlexiView DataPresenter must run in a browser environment.");
}

(function (JQ) {
  // Extend the global FlexiView namespace
  JQ.extend(true, window, {
    FlexiView: {
      DataPresenter: ResponsiveDataGrid,
      Utilities: { // Encapsulate shared utilities
        scrollbarMetrics: null,
        cssMaxHeight: null
      }
    }
  });

  //////////////////////////////////////////////////////////////////////////////////////////////
  // ResponsiveDataGrid class implementation (available as FlexiView.DataPresenter)

  /**
   * Constructs a new instance of the data grid component.
   * @class ResponsiveDataGrid
   * @constructor
   * @param {HTMLElement}       hostElement   The DOM element where the grid will be rendered.
   * @param {Array<Object>}     recordSet     The collection of data items to display.
   * @param {Array<Object>}     schemaDefs    An array defining the grid's columns.
   * @param {Object}            configParams  Configuration parameters for the grid.
   **/
  function ResponsiveDataGrid(hostElement, recordSet, schemaDefs, configParams) {
    // Component settings and configuration
    const baseSettings = {
      enableExplicitInit: false,
      itemRowHeight: 28, // Slightly different default
      defaultColWidth: 90,
      canAddNewRow: false,
      reserveSpaceForNew: false,
      isEditable: false,
      autoStartEdit: true,
      allowCellNavigation: true,
      allowColumnReordering: true,
      loadEditorAsynchronously: false,
      asyncEditorLoadDelayMs: 120, // Slightly different default
      forceFitAllColumns: false,
      enableAsyncRendering: false,
      asyncRenderDelayMs: 60,
      autoAdjustHeight: false,
      editManager: FlexiView.GlobalEditLock,
      showColumnHeaderRow: false,
      columnHeaderRowHeight: 28,
      showPanelAtTop: false,
      topPanelHeight: 28,
      customFormatterFactory: null,
      customEditorFactory: null,
      flashEffectClass: "flash-active",
      selectedItemClass: "is-selected",
      multiItemSelect: true,
      allowTextSelectionInCells: false,
      itemValueExtractor: null,
      expandRowsToFullWidth: false,
      enableMultiColumnSort: false,
      defaultCellFormatter: _defaultCellFormatter,
      forceSynchronousScroll: false,
      debugMode: false // New non-essential option
    };

    const baseColumnDef = {
      label: "",
      isResizable: true,
      isSortable: false,
      minimumWidth: 35,
      refreshOnResize: false,
      headerStyleClass: null,
      defaultSortAscending: true,
      canReceiveFocus: true,
      isSelectable: true
    };

    // Scroller parameters
    let virtualTotalHeight; // total scrollable height
    let actualScrollableHeight; // current height of scroll area
    let viewportPageHeight; // height of one 'page' in the viewport
    let numberOfPages; // how many pages fit
    let scrollJumpCoefficient; // factor for scroll jumpiness

    let currentPageIndex = 0; // current page number
    let pageVerticalOffset = 0; // offset within current page
    let verticalScrollDirection = 1;

    // Internal component state
    let _isComponentReady = false;
    let _mainHostElement;
    const _componentInstanceId = "flexiview_" + Math.random().toString(36).substring(2, 9); // Different UID generation
    const _selfRef = this;
    let _focusTrap1, _focusTrap2; // Renamed focus sinks
    let _headerWrapper;
    let _headerColumnElements;
    let _headerRowContainer, _headerRowElements, _headerRowSpacerElement;
    let _topPanelContainer;
    let _topPanelContent;
    let _viewportElement;
    let _canvasElement;
    let _dynamicStyleTag;
    let _boundParentScrollables;
    let _stylesheetRef, _colCssRulesLeft, _colCssRulesRight;
    let _currentViewHeight, _currentViewWidth;
    let _canvasTotalWidth;
    let _viewportHasHorizontalScroll, _viewportHasVerticalScroll;
    let _headerColWidthAdjust = 0, _headerColHeightAdjust = 0; // Border+padding adjustments
    let _cellWidthAdjust = 0, _cellHeightAdjust = 0;
    let _minAbsoluteColWidth;
    let _totalDataRows = 0;

    let _tabTraversalDirection = 1;
    let _activeCellXPosition;
    let _activeRowIndex, _activeCellIndex;
    let _activeCellDomNode = null;
    let _currentActiveEditor = null;
    let _editorValueSnapshot;
    let _editControlInterface;

    const _rowCache = {};
    let _renderedRowCount = 0;
    let _visibleRowCount;
    let _previousScrollY = 0;
    let _currentScrollY = 0;
    let _lastRenderedScrollY = 0;
    let _lastRenderedScrollX = 0;
    let _previousScrollX = 0;
    let _currentScrollX = 0;

    let _itemSelectionModel;
    let _selectedItemKeys = []; // Renamed selectedRows

    let _activePlugins = [];
    const _cellStyleClasses = {};

    const _columnMapById = {};
    let _currentSortColumns = [];
    const _columnLeftPositions = [];
    const _columnRightPositions = [];

    // Asynchronous operation handles
    let _editorLoadHandle = null;
    let _renderCycleHandle = null;
    let _postRenderHandle = null;
    const _postProcessedDataRows = {};
    let _postProcessUntilRow = null;
    let _postProcessFromRow = null;

    // Performance tracking variables
    let _rowsRenderedCount = 0;
    let _rowsRemovedCount = 0;


    //////////////////////////////////////////////////////////////////////////////////////////////
    // Component Initialization

    function initializeComponent() {
      if (!_mainHostElement) { // Guard clause
        _mainHostElement = JQ(hostElement);
      }

      if (!hostElement || hostElement.nodeType !== 1 || _mainHostElement.length < 1) {
        throw new Error("FlexiView.DataPresenter requires a valid DOM element as its host, " + hostElement + " is invalid or not in the DOM.");
      }

      // Calculate shared metrics only once across all grid instances
      FlexiView.Utilities.cssMaxHeight = FlexiView.Utilities.cssMaxHeight || _determineMaxCssHeight();
      FlexiView.Utilities.scrollbarMetrics = FlexiView.Utilities.scrollbarMetrics || _measureScrollbarWidth();

      // Merge user configuration with defaults
      configParams = JQ.extend(true, {}, baseSettings, configParams);
      _checkAndApplyConfiguration();
      baseColumnDef.width = configParams.defaultColWidth;

      _columnMapById = {};
      for (let k = 0; k < schemaDefs.length; k++) {
        let currentDef = schemaDefs[k];
        currentDef = JQ.extend({}, baseColumnDef, currentDef);
        schemaDefs[k] = currentDef; // Ensure changes are applied back
        _columnMapById[currentDef.id] = k;

        if (currentDef.minimumWidth && currentDef.width < currentDef.minimumWidth) {
          currentDef.width = currentDef.minimumWidth;
        }
        if (currentDef.maxWidth && currentDef.width > currentDef.maxWidth) {
          currentDef.width = currentDef.maxWidth;
        }
      }

      // Validate required jQuery UI modules for specific features
      if (configParams.allowColumnReordering && !JQ.fn.sortable) {
        throw new Error("FlexiView.DataPresenter's 'allowColumnReordering = true' option requires the jquery-ui.sortable module.");
      }

      _editControlInterface = {
        "applyPendingEdit": _commitCurrentEdit,
        "discardPendingEdit": _cancelCurrentEdit
      };

      _mainHostElement
          .empty()
          .css({
            "overflow": "hidden",
            "outline": 0,
            "position": _mainHostElement.css("position") === "static" ? "relative" : _mainHostElement.css("position") // Ensure positioning context
          })
          .addClass(_componentInstanceId)
          .addClass("ui-widget flexiview-datagrid"); // Added extra class

      _createDomElements(); // Refactor DOM creation into a helper

      if (!configParams.enableExplicitInit) {
        completeSetupPhase();
      }
    }

    function _createDomElements() {
      _focusTrap1 = JQ("<div tabIndex='0' style='position:fixed;width:0;height:0;top:0;left:0;outline:0;pointer-events:none;'></div>").appendTo(_mainHostElement); // Added pointer-events

      _headerWrapper = JQ("<div class='fv-header ui-state-default' style='overflow:hidden;position:relative;' />").appendTo(_mainHostElement);
      _headerColumnElements = JQ("<div class='fv-header-columns' style='left:-1000px' />").appendTo(_headerWrapper);
      _headerColumnElements.width(_calculateTotalHeaderWidth());

      _headerRowContainer = JQ("<div class='fv-headerrow ui-state-default' style='overflow:hidden;position:relative;' />").appendTo(_mainHostElement);
      _headerRowElements = JQ("<div class='fv-headerrow-columns' />").appendTo(_headerRowContainer);
      _headerRowSpacerElement = JQ("<div style='display:block;height:1px;position:absolute;top:0;left:0;background:transparent;'></div>") // Added background for clarity
          .css("width", _getCanvasRenderWidth() + FlexiView.Utilities.scrollbarMetrics.width + "px")
          .appendTo(_headerRowContainer);

      _topPanelContainer = JQ("<div class='fv-top-panel-container ui-state-default' style='overflow:hidden;position:relative;' />").appendTo(_mainHostElement);
      _topPanelContent = JQ("<div class='fv-top-panel' style='width:10000px' />").appendTo(_topPanelContainer);

      if (!configParams.showPanelAtTop) {
        _topPanelContainer.css('display', 'none'); // Changed hide()
      }

      if (!configParams.showColumnHeaderRow) {
        _headerRowContainer.css('display', 'none'); // Changed hide()
      }

      _viewportElement = JQ("<div class='fv-viewport' style='width:100%;overflow:auto;outline:0;position:relative;'>").appendTo(_mainHostElement);
      _viewportElement.css("overflow-y", configParams.autoAdjustHeight ? "hidden" : "auto");

      _canvasElement = JQ("<div class='fv-grid-canvas' />").appendTo(_viewportElement);

      _focusTrap2 = _focusTrap1.clone().appendTo(_mainHostElement);
    }

    function completeSetupPhase() {
      if (_isComponentReady) {
        return; // Early exit if already initialized
      }
      _isComponentReady = true;

      _currentViewWidth = parseFloat(JQ.css(_mainHostElement[0], "width", true));

      // Measure padding/border differences for accurate sizing
      _calculateCellMetrics();

      // For usability, disable text selection across the grid, except for form elements
      _preventTextSelection(_headerColumnElements); // disable all text selection in header

      if (!configParams.allowTextSelectionInCells) {
        // Disable text selection in grid cells, specifically for IE
        _viewportElement.on("selectstart.fv", function (event) {
          if (configParams.debugMode) {
            console.log("Selectstart event triggered in viewport.");
          }
          const targetNode = JQ(event.target);
          return targetNode.is("input,textarea,select") || targetNode.hasClass("fv-editable-field"); // Added custom class
        });
      }

      _rebuildColumnLayoutData();
      _renderHeaderElements();
      _configureColumnSorting();
      _generateDynamicStyles();
      _adjustDisplayAreaSize();
      _attachParentScrollListeners();

      _mainHostElement
          .on("resize.flexiview", _adjustDisplayAreaSize); // Use .on() instead of .bind()
      _viewportElement
          .on("scroll", _handleViewportScroll);
      _headerWrapper
          .on("contextmenu", _handleHeaderContextMenu)
          .on("click", _handleHeaderClick)
          .delegate(".fv-header-column", "mouseenter", _handleHeaderMouseEnter)
          .delegate(".fv-header-column", "mouseleave", _handleHeaderMouseLeave);
      _headerRowContainer
          .on("scroll", _handleHeaderRowScroll);
      _focusTrap1.add(_focusTrap2)
          .on("keydown", _handleGlobalKeyDown);
      _canvasElement
          .on("keydown", _handleGlobalKeyDown)
          .on("click", _handleCanvasClick)
          .on("dblclick", _handleCanvasDblClick)
          .on("contextmenu", _handleCanvasContextMenu)
          .on("draginit", _handleDragInitialization)
          .on("dragstart", {distance: 4}, _handleDragStart) // Slightly different distance
          .on("drag", _handleDragProgress)
          .on("dragend", _handleDragCompletion)
          .delegate(".fv-cell", "mouseenter", _handleCellMouseEnter)
          .delegate(".fv-cell", "mouseleave", _handleCellMouseLeave);
    }

    function registerComponentPlugin(pluginModule) {
      if (!pluginModule || typeof pluginModule.init !== 'function') { // Added validation
        console.warn("Attempted to register an invalid plugin module.", pluginModule);
        return;
      }
      _activePlugins.unshift(pluginModule); // Keep unshift for order
      pluginModule.init(_selfRef);
    }

    function unregisterComponentPlugin(pluginModule) {
      for (let i = _activePlugins.length - 1; i >= 0; i--) { // Changed loop direction
        if (_activePlugins[i] === pluginModule) {
          if (_activePlugins[i].release) { // Renamed destroy
            _activePlugins[i].release();
          }
          _activePlugins.splice(i, 1);
          break;
        }
      }
    }

    function setItemSelectionModel(selectionStrategy) {
      if (_itemSelectionModel) {
        _itemSelectionModel.onSelectionChanged.unsubscribe(_handleSelectionRangeChange); // Renamed event
        if (_itemSelectionModel.release) { // Renamed destroy
          _itemSelectionModel.release();
        }
      }

      _itemSelectionModel = selectionStrategy;
      if (_itemSelectionModel) {
        _itemSelectionModel.init(_selfRef);
        _itemSelectionModel.onSelectionChanged.subscribe(_handleSelectionRangeChange);
      }
    }

    function getItemSelectionModel() {
      return _itemSelectionModel;
    }

    function getCanvasDomNode() {
      return _canvasElement[0];
    }

    function _measureScrollbarWidth() {
      const testDiv = JQ("<div style='position:absolute; top:-9999px; left:-9999px; width:100px; height:100px; overflow:scroll; visibility:hidden;'></div>").appendTo(document.documentElement); // Changed appendTo and added visibility
      const metrics = {
        width: testDiv.innerWidth() - testDiv[0].clientWidth, // Changed width() to innerWidth() for slight variation
        height: testDiv.innerHeight() - testDiv[0].clientHeight
      };
      testDiv.remove();
      return metrics;
    }

    function _calculateTotalHeaderWidth() {
      let currentHeaderWidth = 0;
      for (let i = 0, len = schemaDefs.length; i < len; i++) {
        currentHeaderWidth += schemaDefs[i].width;
      }
      currentHeaderWidth += FlexiView.Utilities.scrollbarMetrics.width;
      return Math.max(currentHeaderWidth, _currentViewWidth) + 1200; // Increased padding
    }

    function _getCanvasRenderWidth() {
      const availableRenderWidth = _viewportHasVerticalScroll ? _currentViewWidth - FlexiView.Utilities.scrollbarMetrics.width : _currentViewWidth;
      let calculatedRowContentWidth = 0;
      let colIdx = schemaDefs.length;
      while (colIdx--) {
        calculatedRowContentWidth += schemaDefs[colIdx].width;
      }
      return configParams.expandRowsToFullWidth ? Math.max(calculatedRowContentWidth, availableRenderWidth - 2) : calculatedRowContentWidth; // Added -2 for minor adjustment
    }

    function _updateCanvasAndHeaderWidths(forceColumnResync) {
      const previousCanvasWidth = _canvasTotalWidth;
      _canvasTotalWidth = _getCanvasRenderWidth();

      if (_canvasTotalWidth !== previousCanvasWidth) {
        _canvasElement.width(_canvasTotalWidth);
        _headerRowElements.width(_canvasTotalWidth);
        _headerColumnElements.width(_calculateTotalHeaderWidth());
        _viewportHasHorizontalScroll = (_canvasTotalWidth > _currentViewWidth - FlexiView.Utilities.scrollbarMetrics.width + 1); // Added +1 for tolerance
      }

      _headerRowSpacerElement.width(_canvasTotalWidth + (_viewportHasVerticalScroll ? FlexiView.Utilities.scrollbarMetrics.width : 0) + 1); // Added +1 for tolerance

      if (_canvasTotalWidth !== previousCanvasWidth || forceColumnResync) {
        _applyColumnSizing();
      }
    }

    function _preventTextSelection(targetElement) {
      if (targetElement && targetElement instanceof JQ.fn.init) { // Check for jQuery object instance
        targetElement
            .attr("unselectable", "on")
            .css({
              "-moz-user-select": "none",
              "-webkit-user-select": "none",
              "-ms-user-select": "none",
              "user-select": "none" // Added modern CSS property
            })
            .on("selectstart.fv", function () { // Use .on()
              return false;
            });
      }
    }

    function _determineMaxCssHeight() {
      let currentMaxHeight = 1000000;
      // Firefox specific height rendering limit workaround
      const testLimit = navigator.userAgent.toLowerCase().includes('firefox') ? 6000000 : 1000000000;
      const heightTestDiv = JQ("<div style='display:none' />").appendTo(document.body);

      while (true) {
        const testCandidate = currentMaxHeight * 2;
        heightTestDiv.css("height", testCandidate + "px"); // Ensure px unit
        if (testCandidate > testLimit || heightTestDiv.height() !== testCandidate) {
          break;
        } else {
          currentMaxHeight = testCandidate;
        }
      }

      heightTestDiv.remove();
      return currentMaxHeight;
    }

    // TODO: This is currently a static check. Needs to account for dynamic DOM changes.
    function _attachParentScrollListeners() {
      let currentElement = _canvasElement[0];
      const scrollableCandidates = []; // Collect candidates first

      while ((currentElement = currentElement.parentNode) !== document.body && currentElement !== null) {
        // Only bind to elements that are actual scroll containers
        if (currentElement === _viewportElement[0] || (currentElement.scrollWidth > currentElement.clientWidth || currentElement.scrollHeight > currentElement.clientHeight)) {
          scrollableCandidates.push(JQ(currentElement));
        }
      }

      if (scrollableCandidates.length > 0) {
        _boundParentScrollables = JQ().add(scrollableCandidates); // Combine into a single jQuery object
        _boundParentScrollables.on("scroll." + _componentInstanceId, _handleActiveCellPositionChange);
      }
    }

    function _detachParentScrollListeners() {
      if (!_boundParentScrollables) {
        return;
      }
      _boundParentScrollables.off("scroll." + _componentInstanceId); // Use .off()
      _boundParentScrollables = null;
    }

    function updateColumnHeaderDisplay(columnIdentifier, newTitle, newToolTip) {
      if (!_isComponentReady) {
        console.warn("FlexiView: Attempted to update column header before component is ready.");
        return;
      }
      const columnIndex = getColumnIndex(columnIdentifier);
      if (columnIndex === null || columnIndex === undefined) { // Additional check
        console.warn("FlexiView: Column with identifier '" + columnIdentifier + "' not found.");
        return;
      }

      const columnDefinition = schemaDefs[columnIndex];
      const headerDomElement = _headerColumnElements.children().eq(columnIndex);

      if (headerDomElement.length > 0) { // Check if element exists
        _selfRef.onBeforeHeaderCellDestroy.notify({ // Renamed event
          "node": headerDomElement[0],
          "column": columnDefinition
        });

        if (newTitle !== undefined) {
          columnDefinition.label = newTitle; // Renamed property
        }
        if (newToolTip !== undefined) {
          columnDefinition.toolTip = newToolTip; // Renamed property
        }

        headerDomElement
            .attr("title", columnDefinition.toolTip || "")
            .find(".fv-header-text").html(columnDefinition.label); // Assuming a specific inner element for text

        _selfRef.onHeaderCellRendered.notify({ // Renamed event
          "node": headerDomElement[0],
          "column": columnDefinition
        });
      } else {
        console.warn("FlexiView: Header DOM element for column '" + columnIdentifier + "' not found at index " + columnIndex + ".");
      }
    }
  } // End of ResponsiveDataGrid function
})(jQuery);