/**
 * @license
 * (c) 2009-2012 Michael Leibman
 * michael{dot}leibman{at}gmail{dot}com
 * http://github.com/mleibman/slickgrid
 *
 * Distributed under MIT license.
 * All rights reserved.
 *
 * SlickGrid v2.1
 *
 * NOTES:
 *     Cell/row DOM manipulations are done directly bypassing jQuery's DOM manipulation methods.
 *     This increases the speed dramatically, but can only be done safely because there are no event handlers
 *     or data associated with any cell/row DOM nodes.  Cell editors must make sure they implement .destroy()
 *     and do proper cleanup.
 */

// This section ensures all necessary JavaScript modules are properly loaded before proceeding.
// If jQuery is not defined, it means the core jQuery library is missing.
if (typeof jQuery === "undefined") {
  throw "SlickGrid requires jquery module to be loaded";
}
// If jQuery.fn.drag is not defined, it means the jquery.event.drag plugin is missing.
if (!jQuery.fn.drag) {
  throw "SlickGrid requires jquery.event.drag module to be loaded";
}
// If Slick is not defined, it means slick.core.js (the core SlickGrid library) is missing.
if (typeof Slick === "undefined") {
  throw "slick.core.js not loaded";
}


(function ($) {
  // Extend the global window object to expose Slick.Grid.
  $.extend(true, window, {
    Slick: {
      Grid: SlickGrid
    }
  });

  // Variables shared across all SlickGrid instances on the page.
  var scrollbarDimensions; // Stores the width and height of scrollbars, calculated once.
  var maxSupportedCssHeight;  // Stores the maximum CSS height a browser can reliably render without issues.

  //////////////////////////////////////////////////////////////////////////////////////////////
  // SlickGrid class implementation (available as Slick.Grid)

  /**
   * Creates a new instance of the grid.
   * @class SlickGrid
   * @constructor
   * @param {Node}              container   Container node (DOM element) to create the grid in.
   * @param {Array,Object}      data        An array of objects for databinding (the data source).
   * @param {Array}             columns     An array of column definitions, specifying grid columns.
   * @param {Object}            options     Grid options, configuring behavior and appearance.
   **/
  function SlickGrid(container, data, columns, options) {
    // Default settings for the grid, can be overridden by the 'options' parameter.
    var defaults = {
      explicitInitialization: false,           // If true, init() must be called manually.
      rowHeight: 25,                           // Height of each data row in pixels.
      defaultColumnWidth: 80,                  // Default width for columns without a specified width.
      enableAddRow: false,                     // If true, a new row can be added at the bottom.
      leaveSpaceForNewRows: false,             // If true, reserves space for new rows even if none are added.
      editable: false,                         // If true, cells can be edited.
      autoEdit: true,                          // If true, clicking a cell immediately enters edit mode.
      enableCellNavigation: true,              // If true, allows keyboard navigation between cells.
      enableColumnReorder: true,               // If true, columns can be reordered by dragging headers.
      asyncEditorLoading: false,               // If true, editors are loaded asynchronously.
      asyncEditorLoadDelay: 100,               // Delay in ms for asynchronous editor loading.
      forceFitColumns: false,                  // If true, column widths are adjusted to fill the viewport.
      enableAsyncPostRender: false,            // If true, enables asynchronous post-rendering of cells.
      asyncPostRenderDelay: 50,                // Delay in ms for asynchronous post-rendering.
      autoHeight: false,                       // If true, grid height adjusts to fit all rows.
      editorLock: Slick.GlobalEditorLock,      // The editor lock instance to use.
      showHeaderRow: false,                    // If true, displays an additional header row for filters/inputs.
      headerRowHeight: 25,                     // Height of the header row.
      showTopPanel: false,                     // If true, displays a top panel above headers.
      topPanelHeight: 25,                      // Height of the top panel.
      formatterFactory: null,                  // Factory for creating cell formatters.
      editorFactory: null,                     // Factory for creating cell editors.
      cellFlashingCssClass: "flashing",        // CSS class for flashing cells.
      selectedCellCssClass: "selected",        // CSS class for selected cells.
      multiSelect: true,                       // If true, multiple cells/rows can be selected.
      enableTextSelectionOnCells: false,       // If true, allows text selection within grid cells.
      dataItemColumnValueExtractor: null,      // Function to extract column values from data items.
      fullWidthRows: false,                    // If true, rows always fill the full width of the viewport.
      multiColumnSort: false,                  // If true, allows sorting by multiple columns.
      defaultFormatter: defaultFormatter,      // Default formatter function for cells.
      forceSyncScrolling: false                // If true, forces synchronous scrolling.
    };

    // Default properties for individual columns.
    var columnDefaults = {
      name: "",                                // Default column name (header text).
      resizable: true,                         // If true, column can be resized.
      sortable: false,                         // If true, column can be sorted.
      minWidth: 30,                            // Minimum allowed width for the column.
      rerenderOnResize: false,                 // If true, grid rerenders when column is resized.
      headerCssClass: null,                    // CSS class for the column header.
      defaultSortAsc: true,                    // Default sort direction (ascending).
      focusable: true,                         // If true, cell in this column can receive focus.
      selectable: true                         // If true, cell in this column can be selected.
    };

    // Scroller-related variables.
    var th;   // Virtual height of the grid content.
    var h;    // Real scrollable height of the grid.
    var ph;   // Height of one "page" (viewport height).
    var n;    // Number of pages.
    var cj;   // "Jumpiness" coefficient for scrolling.

    var page = 0;       // Current virtual page number.
    var offset = 0;     // Current page offset for virtual scrolling.
    var vScrollDir = 1; // Vertical scroll direction (1 for down, -1 for up).

    // Private variables for internal grid state and DOM elements.
    var initialized = false;     // Flag indicating if the grid has been initialized.
    var $container;              // jQuery object for the main grid container.
    var uid = "slickgrid_" + Math.round(1000000 * Math.random()); // Unique ID for this grid instance.
    var self = this;             // Reference to the SlickGrid instance itself.
    var $focusSink, $focusSink2; // Hidden elements used for managing keyboard focus.
    var $headerScroller;         // jQuery object for the header scroller.
    var $headers;                // jQuery object for the column headers.
    var $headerRow, $headerRowScroller, $headerRowSpacer; // Elements for the optional header row.
    var $topPanelScroller;       // jQuery object for the top panel scroller.
    var $topPanel;               // jQuery object for the top panel.
    var $viewport;               // jQuery object for the main scrollable viewport.
    var $canvas;                 // jQuery object for the grid canvas (where rows are rendered).
    var $style;                  // jQuery object for the dynamically created style element.
    var $boundAncestors;         // jQuery object for ancestor elements that have scroll events bound.
    var stylesheet, columnCssRulesL, columnCssRulesR; // CSS rules for columns.
    var viewportH, viewportW;    // Current height and width of the viewport.
    var canvasWidth;             // Current width of the grid canvas.
    var viewportHasHScroll, viewportHasVScroll; // Flags indicating horizontal/vertical scrollbars.
    var headerColumnWidthDiff = 0, headerColumnHeightDiff = 0; // Differences due to padding/border in headers.
    var cellWidthDiff = 0, cellHeightDiff = 0;                 // Differences due to padding/border in cells.
    var absoluteColumnMinWidth;  // Minimum allowed width for any column.
    var numberOfRows = 0;        // Total number of rows in the data.

    var tabbingDirection = 1;    // Direction of tabbing (1 for forward, -1 for backward).
    var activePosX;              // X position of the active cell.
    var activeRow, activeCell;   // Current active row and cell indices.
    var activeCellNode = null;   // DOM node of the active cell.
    var currentEditor = null;    // Current active cell editor.
    var serializedEditorValue;   // Value serialized by the editor.
    var editController;          // Object managing cell editing.

    var rowsCache = {};          // Cache for rendered row DOM elements.
    var renderedRows = 0;        // Number of rows currently rendered in the DOM.
    var numVisibleRows;          // Number of rows visible in the viewport.
    var prevScrollTop = 0;       // Previous vertical scroll position.
    var scrollTop = 0;           // Current vertical scroll position.
    var lastRenderedScrollTop = 0; // Vertical scroll position at last render.
    var lastRenderedScrollLeft = 0; // Horizontal scroll position at last render.
    var prevScrollLeft = 0;      // Previous horizontal scroll position.
    var scrollLeft = 0;          // Current horizontal scroll position.

    var selectionModel;          // The selection model instance.
    var selectedRows = [];       // Array of currently selected row indices.

    var plugins = [];            // Array of registered plugins.
    var cellCssClasses = {};     // Object storing custom CSS classes for cells.

    var columnsById = {};        // Map of column IDs to their index.
    var sortColumns = [];        // Array of columns currently sorted.
    var columnPosLeft = [];      // Array storing left pixel positions of columns.
    var columnPosRight = [];     // Array storing right pixel positions of columns.


    // Asynchronous call handles (for debouncing/throttling).
    var h_editorLoader = null;   // Handle for delayed editor loading.
    var h_render = null;         // Handle for delayed grid rendering.
    var h_postrender = null;     // Handle for delayed post-rendering.
    var postProcessedRows = {};  // Rows that have undergone post-processing.
    var postProcessToRow = null; // End row for post-processing range.
    var postProcessFromRow = null; // Start row for post-processing range.

    // Performance counters.
    var counter_rows_rendered = 0; // Number of rows rendered.
    var counter_rows_removed = 0;  // Number of rows removed from DOM.


    //////////////////////////////////////////////////////////////////////////////////////////////
    // Initialization functions.

    function init() {
      // Get the container element as a jQuery object.
      $container = $(container);
      // Validate that the container exists in the DOM.
      if ($container.length < 1) {
        throw new Error("SlickGrid requires a valid container, " + container + " does not exist in the DOM.");
      }

      // Calculate max supported CSS height and scrollbar dimensions only once per page load.
      maxSupportedCssHeight = maxSupportedCssHeight || getMaxSupportedCssHeight();
      scrollbarDimensions = scrollbarDimensions || measureScrollbar();

      // Merge user-provided options with default options.
      options = $.extend({}, defaults, options);
      validateAndEnforceOptions(); // Apply option validation and enforcement.
      columnDefaults.width = options.defaultColumnWidth; // Set default column width.

      // Process columns: extend with defaults, store by ID, and enforce min/max widths.
      columnsById = {};
      for (var i = 0; i < columns.length; i++) {
        var m = columns[i] = $.extend({}, columnDefaults, columns[i]);
        columnsById[m.id] = i; // Store column index by its ID.
        if (m.minWidth && m.width < m.minWidth) {
          m.width = m.minWidth;
        }
        if (m.maxWidth && m.width > m.maxWidth) {
          m.width = m.maxWidth;
        }
      }

      // Validate required jQuery UI modules based on enabled options.
      if (options.enableColumnReorder && !$.fn.sortable) {
        throw new Error("SlickGrid's 'enableColumnReorder = true' option requires jquery-ui.sortable module to be loaded");
      }

      // Initialize the edit controller with commit and cancel functions.
      editController = {
        "commitCurrentEdit": commitCurrentEdit,
        "cancelCurrentEdit": cancelCurrentEdit
      };

      // Prepare the grid container: clear content, set styles, add unique class.
      $container
          .empty() // Remove all child elements.
          .css("overflow", "hidden") // Hide overflow.
          .css("outline", 0) // Remove outline on focus.
          .addClass(uid) // Add unique ID class.
          .addClass("ui-widget"); // Add jQuery UI widget class.

      // Ensure the container has a relative, absolute, or fixed position.
      if (!/relative|absolute|fixed/.test($container.css("position"))) {
        $container.css("position", "relative");
      }

      // Create and append focus sink elements for keyboard navigation.
      $focusSink = $("<div tabIndex='0' hideFocus style='position:fixed;width:0;height:0;top:0;left:0;outline:0;'></div>").appendTo($container);

      // Create and append header elements.
      $headerScroller = $("<div class='slick-header ui-state-default' style='overflow:hidden;position:relative;' />").appendTo($container);
      $headers = $("<div class='slick-header-columns' style='left:-1000px' />").appendTo($headerScroller);
      $headers.width(getHeadersWidth());

      // Create and append header row elements (for filters/inputs).
      $headerRowScroller = $("<div class='slick-headerrow ui-state-default' style='overflow:hidden;position:relative;' />").appendTo($container);
      $headerRow = $("<div class='slick-headerrow-columns' />").appendTo($headerRowScroller);
      // Spacer for the header row to account for scrollbar width.
      $headerRowSpacer = $("<div style='display:block;height:1px;position:absolute;top:0;left:0;'></div>")
          .css("width", getCanvasWidth() + scrollbarDimensions.width + "px")
          .appendTo($headerRowScroller);

      // Create and append top panel elements.
      $topPanelScroller = $("<div class='slick-top-panel-scroller ui-state-default' style='overflow:hidden;position:relative;' />").appendTo($container);
      $topPanel = $("<div class='slick-top-panel' style='width:10000px' />").appendTo($topPanelScroller);

      // Hide top panel if not enabled in options.
      if (!options.showTopPanel) {
        $topPanelScroller.hide();
      }

      // Hide header row if not enabled in options.
      if (!options.showHeaderRow) {
        $headerRowScroller.hide();
      }

      // Create and append the main viewport and canvas.
      $viewport = $("<div class='slick-viewport' style='width:100%;overflow:auto;outline:0;position:relative;;'>").appendTo($container);
      $viewport.css("overflow-y", options.autoHeight ? "hidden" : "auto"); // Set vertical overflow based on autoHeight option.

      $canvas = $("<div class='grid-canvas' />").appendTo($viewport);

      // Append a second focus sink.
      $focusSink2 = $focusSink.clone().appendTo($container);

      // If explicit initialization is not required, call finishInitialization immediately.
      if (!options.explicitInitialization) {
        finishInitialization();
      }
    }

    function finishInitialization() {
      // Only proceed if not already initialized.
      if (!initialized) {
        initialized = true;

        // Get the current width of the viewport.
        viewportW = parseFloat($.css($container[0], "width", true));

        // Measure cell padding and border to ensure consistent width calculations.
        measureCellPaddingAndBorder();

        // Disable text selection in headers (except for input/textarea elements).
        disableSelection($headers);

        // If text selection on cells is disabled, bind an event to prevent it in IE.
        if (!options.enableTextSelectionOnCells) {
          $viewport.bind("selectstart.ui", function (event) {
            return $(event.target).is("input,textarea");
          });
        }

        // Update column caches, create headers, setup sorting, and create CSS rules.
        updateColumnCaches();
        createColumnHeaders();
        setupColumnSort();
        createCssRules();
        resizeCanvas(); // Resize the canvas based on current dimensions.
        bindAncestorScrollEvents(); // Bind scroll events to parent elements.

        // Bind various event handlers to grid elements.
        $container
            .bind("resize.slickgrid", resizeCanvas); // Handle container resize.
        $viewport
            .bind("scroll", handleScroll); // Handle viewport scrolling.
        $headerScroller
            .bind("contextmenu", handleHeaderContextMenu) // Context menu on header.
            .bind("click", handleHeaderClick) // Click on header.
            .delegate(".slick-header-column", "mouseenter", handleHeaderMouseEnter) // Mouse enter header column.
            .delegate(".slick-header-column", "mouseleave", handleHeaderMouseLeave); // Mouse leave header column.
        $headerRowScroller
            .bind("scroll", handleHeaderRowScroll); // Scroll on header row.
        $focusSink.add($focusSink2)
            .bind("keydown", handleKeyDown); // Keyboard navigation.
        $canvas
            .bind("keydown", handleKeyDown) // Keyboard navigation on canvas.
            .bind("click", handleClick) // Click on canvas.
            .bind("dblclick", handleDblClick) // Double-click on canvas.
            .bind("contextmenu", handleContextMenu) // Context menu on canvas.
            .bind("draginit", handleDragInit) // Drag initialization.
            .bind("dragstart", {distance: 3}, handleDragStart) // Drag start with distance threshold.
            .bind("drag", handleDrag) // During drag.
            .bind("dragend", handleDragEnd) // Drag end.
            .delegate(".slick-cell", "mouseenter", handleMouseEnter) // Mouse enter cell.
            .delegate(".slick-cell", "mouseleave", handleMouseLeave); // Mouse leave cell.
      }
    }

    // Registers a plugin with the grid.
    function registerPlugin(plugin) {
      plugins.unshift(plugin); // Add plugin to the beginning of the array.
      plugin.init(self);       // Initialize the plugin, passing the grid instance.
    }

    // Unregisters a plugin from the grid.
    function unregisterPlugin(plugin) {
      for (var i = plugins.length - 1; i >= 0; i--) { // Iterate backwards.
        if (plugins[i] === plugin) { // Find the matching plugin.
          if (plugins[i].destroy) {
            plugins[i].destroy(); // Call its destroy method if it exists.
          }
          plugins.splice(i, 1); // Remove it from the plugins array.
          break;
        }
      }
    }

    // Sets the selection model for the grid.
    function setSelectionModel(model) {
      if (selectionModel) {
        selectionModel.onSelectedRangesChanged.unsubscribe(handleSelectedRangesChanged); // Unsubscribe old model's event.
        if (selectionModel.destroy) {
          selectionModel.destroy(); // Destroy the old model if it has a destroy method.
        }
      }

      selectionModel = model; // Assign the new selection model.
      if (selectionModel) {
        selectionModel.init(self); // Initialize the new model.
        selectionModel.onSelectedRangesChanged.subscribe(handleSelectedRangesChanged); // Subscribe to its event.
      }
    }

    // Returns the current selection model.
    function getSelectionModel() {
      return selectionModel;
    }

    // Returns the DOM node of the grid canvas.
    function getCanvasNode() {
      return $canvas[0];
    }

    // Measures the width and height of scrollbars in the current environment.
    function measureScrollbar() {
      // Create a temporary div with scrollbars.
      var $c = $("<div style='position:absolute; top:-10000px; left:-10000px; width:100px; height:100px; overflow:scroll;'></div>").appendTo("body");
      // Calculate dimensions by comparing outer and client dimensions.
      var dim = {
        width: $c.width() - $c[0].clientWidth,
        height: $c.height() - $c[0].clientHeight
      };
      $c.remove(); // Remove the temporary div.
      return dim;
    }

    // Calculates the total width required for all headers.
    function getHeadersWidth() {
      var headersWidth = 0;
      for (var i = 0, ii = columns.length; i < ii; i++) {
        var width = columns[i].width;
        headersWidth += width;
      }
      headersWidth += scrollbarDimensions.width; // Add scrollbar width.
      // Ensure headers are at least as wide as viewport, plus some extra.
      return Math.max(headersWidth, viewportW) + 1000;
    }

    // Calculates the total width required for the grid canvas.
    function getCanvasWidth() {
      // Available width considers whether a vertical scrollbar is present.
      var availableWidth = viewportHasVScroll ? viewportW - scrollbarDimensions.width : viewportW;
      var rowWidth = 0;
      var i = columns.length;
      while (i--) { // Iterate backwards to sum column widths.
        rowWidth += columns[i].width;
      }
      // If fullWidthRows is enabled, canvas fills available width, otherwise it's the sum of column widths.
      return options.fullWidthRows ? Math.max(rowWidth, availableWidth) : rowWidth;
    }

    // Updates the canvas width and related elements.
    function updateCanvasWidth(forceColumnWidthsUpdate) {
      var oldCanvasWidth = canvasWidth;
      canvasWidth = getCanvasWidth(); // Recalculate canvas width.

      if (canvasWidth != oldCanvasWidth) {
        $canvas.width(canvasWidth);     // Set canvas width.
        $headerRow.width(canvasWidth);  // Set header row width.
        $headers.width(getHeadersWidth()); // Set headers width.
        viewportHasHScroll = (canvasWidth > viewportW - scrollbarDimensions.width); // Check for horizontal scroll.
      }

      // Update header row spacer width, accounting for vertical scrollbar.
      $headerRowSpacer.width(canvasWidth + (viewportHasVScroll ? scrollbarDimensions.width : 0));

      // If canvas width changed or forced, apply column widths.
      if (canvasWidth != oldCanvasWidth || forceColumnWidthsUpdate) {
        applyColumnWidths();
      }
    }

    // Disables text selection for a given jQuery target.
    function disableSelection($target) {
      if ($target && $target.jquery) { // Ensure it's a jQuery object.
        $target
            .attr("unselectable", "on") // IE-specific attribute.
            .css("MozUserSelect", "none") // Firefox-specific style.
            .bind("selectstart.ui", function () {
              return false;
            }); // Prevent selection for other browsers (from jquery:ui.core.js).
      }
    }

    // Determines the maximum CSS height supported by the browser.
    function getMaxSupportedCssHeight() {
      var supportedHeight = 1000000; // Start with a reasonable guess.
      // Firefox has a lower practical limit for height rendering.
      var testUpTo = navigator.userAgent.toLowerCase().match(/firefox/) ? 6000000 : 1000000000;
      var div = $("<div style='display:none' />").appendTo(document.body);

      while (true) {
        var test = supportedHeight * 2; // Double the test height.
        div.css("height", test);
        // If test height exceeds browser's limit or the div's reported height is less than test, break.
        if (test > testUpTo || div.height() !== test) {
          break;
        } else {
          supportedHeight = test; // Otherwise, update supported height and continue.
        }
      }

      div.remove(); // Clean up the temporary div.
      return supportedHeight;
    }

    // Binds scroll events to ancestor elements of the canvas.
    // TODO: This is static. Need to handle page mutation.
    function bindAncestorScrollEvents() {
      var elem = $canvas[0];
      // Traverse up the DOM tree until document.body or null.
      while ((elem = elem.parentNode) != document.body && elem != null) {
        // Only bind to scroll containers (elements with scrollbars).
        if (elem == $viewport[0] || elem.scrollWidth != elem.clientWidth || elem.scrollHeight != elem.clientHeight) {
          var $elem = $(elem);
          if (!$boundAncestors) {
            $boundAncestors = $elem; // Initialize if first ancestor found.
          } else {
            $boundAncestors = $boundAncestors.add($elem); // Add to existing set.
          }
          $elem.bind("scroll." + uid, handleActiveCellPositionChange); // Bind scroll event.
        }
      }
    }

    // Unbinds previously bound ancestor scroll events.
    function unbindAncestorScrollEvents() {
      if (!$boundAncestors) {
        return; // Nothing to unbind.
      }
      $boundAncestors.unbind("scroll." + uid); // Unbind all events with our unique namespace.
      $boundAncestors = null; // Clear the reference.
    }

    // Updates the header of a specific column.
    function updateColumnHeader(columnId, title, toolTip) {
      if (!initialized) {
        return;
      }
      var idx = getColumnIndex(columnId); // Get column index by ID.
      if (idx == null) {
        return; // Column not found.
      }

      var columnDef = columns[idx];
      var $header = $headers.children().eq(idx); // Get the header DOM element.
      if ($header) {
        if (title !== undefined) {
          columns[idx].name = title; // Update column definition name.
        }
        if (toolTip !== undefined) {
          columns[idx].toolTip = toolTip; // Update column definition tooltip.
        }

        // Trigger an event before destroying the header cell content.
        trigger(self.onBeforeHeaderCellDestroy, {
          "node": $header[0],
          "column": columnDef
        });

        $header
            .attr("title", toolTip || "") // Set tooltip attribute.
            .children().eq(0).html(title); // Update inner HTML of the header text element.

        // Trigger an event after the header cell has been rendered.
        trigger(self.onHeaderCellRendered, {
          "node": $header[0],
          "column": columnDef
        });
      }