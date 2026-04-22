/*
 * table-fixer.js - The jQuery table-fixer plugin for sticky headers and columns
 *
 * Copyright (c) 2023 Renamed Author
 * Licensed under a modified BSD license.
 *
 * Version: 2.0
 * Release Date: October 26th, 2023
 *
 * All sizing values (width, height) are expected in pixels (px)
 */

(function (jQueryAlias) {

  // Define plugin entry point
  jQueryAlias.fn.stickyTableHeaders = function (action) {

    // Default configuration options for the plugin
    var initialConfiguration = {
      desiredWidth:       'auto', // Overall width of the component
      desiredHeight:      'auto', // Overall height of the component
      stylingPreset:      'stk-default', // CSS class for theme
      collapseBorders:     true, // Should table borders collapse?
      leadingColumns:      0, // Number of fixed columns at the start
      legacyFixedCol:      false, // Backward-compatibility for single fixed column
      canSort:             false, // Is sorting enabled?
      displayOnStart:      true, // Show table immediately after creation
      showFooterSection:   false, // Render a footer section
      mirrorHeadToFoot:    false, // Clone header content for the footer
      dynamicResize:       false, // Auto-resize if parent container changes
      onModuleReady:       null, // Callback after plugin initialization
      alternateRowClass:   'stk-alt-row', // Class for alternating rows
      enableDebugLogging:  false // Enable console logs for debugging
    };

    var activePreferences = {}; // Stores the merged settings for the current instance

    // Internal helper for logging
    var logToConsole = function(message, type = 'info') {
      if (activePreferences.enableDebugLogging) {
        console[type](`[stickyTableHeaders] ${message}`);
      }
    };

    // Public API methods accessible via the plugin
    var publicActions = {
      // Primary initialization method
      initializeModule: function (options) {
        // Merge user options with defaults
        activePreferences = jQueryAlias.extend({}, initialConfiguration, options);

        // Iterate through each selected DOM element
        return this.each(function () {
          var $targetElement = jQueryAlias(this); // Reference to the current jQuery object

          // Ensure the element is a valid table structure
          if (utilityFunctions._isValidTableStructure($targetElement)) {
            logToConsole('Table structure validated. Proceeding with setup.');
            // Call the setup method, passing along any additional arguments
            publicActions.configureLayout.apply(this, Array.from(arguments).slice(1));
            // Execute the user-defined creation callback if it exists
            if (typeof activePreferences.onModuleReady === 'function') {
              activePreferences.onModuleReady.call(this);
            }
          } else {
            logToConsole('Invalid table markup. Missing thead or tbody.', 'error');
            jQueryAlias.error('Invalid table mark-up detected for stickyTableHeaders');
          }
        });
      },

      /*
       * Sets up the core table structure for fixed headers and optional footer.
       */
      configureLayout: function () {
        var $currentTable       = jQueryAlias(this),
            domElementRef       = this,
            $headerSection      = $currentTable.find('thead'),
            $footerSection      = $currentTable.find('tfoot'),
            footerHeightPx      = 0,
            $mainWrapper,
            $headerContainer,
            $bodyContainer,
            $fixedBodyContainer,
            effectiveTableWidth;

        // Store a deep clone of the original table for potential restoration
        activePreferences.originalTableSnapshot = $currentTable.clone(true, true);
        activePreferences.paddingIncluded = utilityFunctions._checkPaddingModel();
        activePreferences.scrollBarPixelOffset = utilityFunctions._getNativeScrollbarWidth();
        activePreferences.wrapperThemeClass = activePreferences.stylingPreset;

        logToConsole(`Initial width: ${activePreferences.desiredWidth}, height: ${activePreferences.desiredHeight}`);

        // Calculate effective table width, accounting for scrollbar if percentage width is used
        if (typeof activePreferences.desiredWidth === 'string' && activePreferences.desiredWidth.includes('%')) {
            effectiveTableWidth = $currentTable.parent().width() - activePreferences.scrollBarPixelOffset;
            logToConsole(`Percentage width detected. Parent width: ${$currentTable.parent().width()}, effective table width: ${effectiveTableWidth}`);
        } else {
            effectiveTableWidth = parseInt(activePreferences.desiredWidth, 10) - activePreferences.scrollBarPixelOffset;
            if (isNaN(effectiveTableWidth)) effectiveTableWidth = $currentTable.width() - activePreferences.scrollBarPixelOffset; // Fallback
            logToConsole(`Fixed width detected: ${effectiveTableWidth}`);
        }

        // Apply calculated width to the original table
        $currentTable.css({ 'width': effectiveTableWidth });

        // Wrap the table if it's not already within a plugin wrapper
        if (!$currentTable.closest('.stk-table-main-wrapper').length) {
          $currentTable.addClass('stk-main-table');
          $currentTable.wrap('<div class="stk-table-main-wrapper"></div>');
          logToConsole('Table wrapped in main container.');
        }

        $mainWrapper = $currentTable.closest('.stk-table-main-wrapper');

        // Handle legacy fixed column setting
        if (activePreferences.legacyFixedCol === true && activePreferences.leadingColumns <= 0) {
          activePreferences.leadingColumns = 1;
          logToConsole('Legacy fixed column setting activated, setting leadingColumns to 1.');
        }

        // Setup for fixed columns if enabled
        if (activePreferences.leadingColumns > 0 && $mainWrapper.find('.stk-fixed-left-column').length === 0) {
          $currentTable.wrap('<div class="stk-scrollable-body"></div>'); // Wrap original table in scrollable body
          jQueryAlias('<div class="stk-fixed-left-column"></div>').prependTo($mainWrapper); // Add fixed column container
          $fixedBodyContainer = $mainWrapper.find('.stk-scrollable-body');
          logToConsole(`Fixed column setup initiated for ${activePreferences.leadingColumns} columns.`);
        }

        // Apply wrapper styles and theme class
        $mainWrapper.css({
          width: activePreferences.desiredWidth,
          height: activePreferences.desiredHeight
        }).addClass(activePreferences.wrapperThemeClass);
        logToConsole(`Wrapper styled with width: ${activePreferences.desiredWidth}, height: ${activePreferences.desiredHeight} and class: ${activePreferences.wrapperThemeClass}`);

        // Wrap table body if not already initialized
        if (!$currentTable.hasClass('stk-initialized-table')) {
          $currentTable.wrap('<div class="stk-table-body-scrollable"></div>');
          logToConsole('Table body wrapped for scrollability.');
        }

        $bodyContainer = $currentTable.closest('.stk-table-body-scrollable');

        // Get table properties (borders, etc.)
        var tableMetrics = utilityFunctions._getTableMetrics($currentTable);

        // Prepare a clone of the body for fixed columns if applicable
        utilityFunctions._prepareClonedSection($bodyContainer, tableMetrics.bodySection);

        // Create header container if not already existing from a re-initialization
        if (!$currentTable.hasClass('stk-initialized-table')) {
          var headerHtml = '<div class="stk-header-container"><table class="stk-header-table"></table></div>';
          if (activePreferences.leadingColumns > 0) {
            $headerContainer = jQueryAlias(headerHtml).prependTo($fixedBodyContainer);
          } else {
            $headerContainer = jQueryAlias(headerHtml).prependTo($mainWrapper);
          }

          // Copy original table's class and style to the cloned header table
          $headerContainer.find('table.stk-header-table')
            .addClass($currentTable.prop('className'))
            .attr('style', $currentTable.attr('style')); // Using attr for style for broader compatibility

          // Clone the original table's thead into the new header container
          $headerSection.clone().appendTo($headerContainer.find('table'));
          logToConsole('Header container created and populated.');
        } else {
          $headerContainer = $mainWrapper.find('div.stk-header-container');
          logToConsole('Header container already exists.');
        }

        // Final setup for the cloned header section
        utilityFunctions._prepareClonedSection($headerContainer, tableMetrics.headSection);

        // Adjust original table's top margin to hide its own header underneath the cloned one
        $currentTable.css({
          'margin-top': -$headerContainer.outerHeight(true)
        });
        logToConsole(`Adjusted table margin-top by ${-$headerContainer.outerHeight(true)}px.`);

        // Handle footer section setup
        if (activePreferences.showFooterSection === true || activePreferences.mirrorHeadToFoot === true) {
          utilityFunctions._setupTableFooter($currentTable, domElementRef, tableMetrics);
          // Re-select footer if it was just created or cloned
          if (!$footerSection.length) {
            $footerSection = $mainWrapper.find('div.stk-footer-container table');
          }
          footerHeightPx = $footerSection.outerHeight(true);
          logToConsole(`Footer section configured with height: ${footerHeightPx}px.`);
        }

        // Calculate and set the height for the scrollable body
        var availableBodyHeight = $mainWrapper.height() - $headerSection.outerHeight(true) - footerHeightPx - tableMetrics.borderWidth;
        // Ensure minimum height
        if (availableBodyHeight < 50) { // A new guard clause for minimum height
          logToConsole(`Calculated body height ${availableBodyHeight}px is too small, clamping to 50px.`, 'warn');
          availableBodyHeight = 50;
        }

        $bodyContainer.css({ 'height': availableBodyHeight });
        logToConsole(`Scrollable body height set to ${availableBodyHeight}px.`);

        // Mark table as initialized
        $currentTable.addClass('stk-initialized-table');

        // Apply alternating row styles if configured
        if (typeof(activePreferences.alternateRowClass) !== 'undefined') {
          publicActions.styleAlternatingRows.apply(domElementRef);
          logToConsole('Alternating row styling applied.');
        }

        // Setup fixed columns if enabled
        if (activePreferences.leadingColumns > 0) {
          utilityFunctions._initializeFixedColumn($currentTable, domElementRef, tableMetrics);
          logToConsole('Fixed columns initialized.');
        }

        // Hide the wrapper if autoShow is false
        if (!activePreferences.displayOnStart) {
          $mainWrapper.hide();
          logToConsole('Table hidden on start as per configuration.');
        }

        // Attach scroll event handlers
        utilityFunctions._attachScrollHandlers($bodyContainer, tableMetrics);

        return domElementRef;
      },

      /*
       * Adjusts the table dimensions. (Currently a placeholder)
       */
      adjustDimensions: function() {
        logToConsole('Adjust dimensions method called (currently a placeholder).');
        return this; // Return self for chainability
      },

      /*
       * Applies a CSS class to alternating rows within the table body.
       */
      styleAlternatingRows: function(customClass) {
        var $currentTable = jQueryAlias(this),
            classToApply  = (typeof(customClass) !== 'undefined') ? customClass : activePreferences.alternateRowClass;

        if (!classToApply) { // New guard clause
          logToConsole('No alternating row class specified.', 'warn');
          return this;
        }

        $currentTable.closest('.stk-table-main-wrapper')
          .find('tbody tr:odd:not(:hidden)') // Select odd, visible rows
          .addClass(classToApply);
        logToConsole(`Alternating rows styled with class: ${classToApply}.`);
        return this;
      },

      /*
       * Reveals a previously hidden stickyTableHeaders table.
       */
      revealTable: function(duration, effect, onCompleteCallback) {
        var $currentTable = jQueryAlias(this),
            tableReference  = this,
            $containerWrapper = $currentTable.closest('.stk-table-main-wrapper');

        // Determine arguments based on type and count
        var finalDuration = typeof duration === 'number' ? duration : undefined;
        var finalEffect = typeof duration === 'string' ? duration : (typeof effect === 'string' ? effect : undefined);
        var finalCallback = typeof effect === 'function' ? effect : (typeof onCompleteCallback === 'function' ? onCompleteCallback : (typeof duration === 'function' ? duration : undefined));

        // Use jQuery's show method with optional arguments
        if (finalDuration !== undefined || finalEffect !== undefined) {
          $containerWrapper.show(finalEffect, finalDuration, function() {
            if (typeof finalCallback === 'function') {
              finalCallback.call(tableReference);
            }
          });
        } else {
          $containerWrapper.show();
          if (typeof finalCallback === 'function') {
            finalCallback.call(tableReference);
          }
        }
        logToConsole('Table revealed.');
        return tableReference;
      },

      /*
       * Conceals a stickyTableHeaders table.
       */
      concealTable: function(duration, effect, onCompleteCallback) {
        var $currentTable   = jQueryAlias(this),
            tableReference  = this,
            $containerWrapper = $currentTable.closest('.stk-table-main-wrapper');

        // Determine arguments based on type and count, similar to revealTable
        var finalDuration = typeof duration === 'number' ? duration : undefined;
        var finalEffect = typeof duration === 'string' ? duration : (typeof effect === 'string' ? effect : undefined);
        var finalCallback = typeof effect === 'function' ? effect : (typeof onCompleteCallback === 'function' ? onCompleteCallback : (typeof duration === 'function' ? duration : undefined));

        if (finalDuration !== undefined || finalEffect !== undefined) {
          $containerWrapper.hide(finalEffect, finalDuration, function() {
            if (typeof finalCallback === 'function') {
              finalCallback.call(tableReference);
            }
          });
        } else {
          $containerWrapper.hide();
          if (typeof finalCallback === 'function') {
            finalCallback.call(tableReference);
          }
        }
        logToConsole('Table concealed.');
        return tableReference;
      },

      /*
       * Destroys the fixedHeaderTable instance and reverts the table to its original state.
       */
      tearDown: function() {
        var $currentTable    = jQueryAlias(this),
            tableReference   = this,
            $containerWrapper = $currentTable.closest('.stk-table-main-wrapper');

        // Restore original table structure and attributes
        $currentTable.insertBefore($containerWrapper)
          .removeAttr('style') // Remove inline styles added by plugin
          .append($containerWrapper.find('tfoot')) // Re-append footer to original table
          .removeClass('stk-main-table stk-initialized-table') // Remove plugin classes
          .find('.stk-cell-shim') // Remove any added shim elements
          .remove();

        $containerWrapper.remove(); // Remove the entire plugin wrapper

        logToConsole('Plugin instance torn down. Table restored to original state.');
        return tableReference;
      }

    };

    // Private utility functions
    var utilityFunctions = {

      /*
       * Checks if the provided jQuery object represents a valid table structure
       * (i.e., is a <table> with <thead> and <tbody>).
       * Returns boolean.
       */
      _isValidTableStructure: function($element) {
        var isTableElement = $element.is('table');
        var hasHeaderSection = $element.children('thead').length > 0; // Use children for direct descendants
        var hasBodySection = $element.children('tbody').length > 0;

        if (!isTableElement) {
          logToConsole('Element is not a <table>.', 'warn');
        }
        if (!hasHeaderSection) {
          logToConsole('Table is missing <thead>.', 'warn');
        }
        if (!hasBodySection) {
          logToConsole('Table is missing <tbody>.', 'warn');
        }

        return isTableElement && hasHeaderSection && hasBodySection;
      },

      /*
       * Attaches scroll event handlers to synchronize header/footer and fixed columns.
       * Returns void.
       */
      _attachScrollHandlers: function($scrollableBody) {
        var $mainWrapper = $scrollableBody.closest('.stk-table-main-wrapper'),
            $headerContainer = $scrollableBody.siblings('.stk-header-container'),
            $footerContainer = $scrollableBody.siblings('.stk-footer-container');

        $scrollableBody.on('scroll', function() {
          var currentScrollLeft = this.scrollLeft;
          var currentScrollTop = this.scrollTop;

          logToConsole(`Scroll event: Top=${currentScrollTop}, Left=${currentScrollLeft}`);

          // Synchronize fixed column vertical scroll
          if (activePreferences.leadingColumns > 0) {
            var $fixedColumn = $mainWrapper.find('.stk-fixed-left-column');
            $fixedColumn.find('.stk-table-body-scrollable table')
              .css({ 'margin-top': -currentScrollTop }); // Negative margin moves content up
          }

          // Synchronize header horizontal scroll
          $headerContainer.find('table')
            .css({ 'margin-left': -currentScrollLeft }); // Negative margin moves content left

          // Synchronize footer horizontal scroll if enabled
          if (activePreferences.showFooterSection || activePreferences.mirrorHeadToFoot) {
            $footerContainer.find('table')
              .css({ 'margin-left': -currentScrollLeft });
          }
        });
      },

      /*
       * Adjusts the height of an element, accounting for border if padding is included.
       * Returns void.
       */
      _adjustElementHeight: function ($element, metrics) {
        // Ensure element exists before attempting to modify
        if (!$element || $element.length === 0) {
          logToConsole('Attempted to adjust height of non-existent element.', 'warn');
          return;
        }

        if (activePreferences.paddingIncluded) {
          $element.css({ 'height': $element.height() + metrics.borderWidth });
        } else {
          // Assuming parent's height if not padding included, might need refinement
          $element.css({ 'height': $element.parent().height() + metrics.borderWidth });
        }
      },

      /*
       * Adjusts the width of an element, accounting for border if padding is included.
       * Returns void.
       */
      _adjustElementWidth: function($elements, metrics, explicitWidth = null) {
        if (!$elements || $elements.length === 0) {
          logToConsole('Attempted to adjust width of non-existent elements.', 'warn');
          return;
        }

        $elements.each(function() {
          var $thisElement = jQueryAlias(this);
          var targetWidth = explicitWidth !== null ? explicitWidth : $thisElement.width();
          var finalWidth = activePreferences.paddingIncluded ? (targetWidth + metrics.borderWidth) : (targetWidth + metrics.borderWidth); // This logic might need review based on box model
          $thisElement.css({ 'width': finalWidth });
        });
      },

      /*
       * Initializes the fixed column structure and behavior.
       * Returns void.
       */
      _initializeFixedColumn: function ($originalTable, domRef, metrics) {
        var $mainWrapper          = $originalTable.closest('.stk-table-main-wrapper'),
            $scrollableBody       = $mainWrapper.find('.stk-scrollable-body'),
            $fixedColumnContainer = $mainWrapper.find('.stk-fixed-left-column'),
            $clonedHeadContainer  = jQueryAlias('<div class="stk-header-container"><table class="stk-header-table"><thead><tr></tr></thead></table></div>'),
            $clonedBodyContainer  = jQueryAlias('<div class="stk-table-body-scrollable"><table class="stk-header-table"><tbody></tbody></table></div>'),
            $clonedFootContainer  = jQueryAlias('<div class="stk-footer-container"><table class="stk-header-table"><tfoot><tr></tr></tfoot></table></div>'),
            scrollableBodyCurrentWidth    = $scrollableBody.width(),
            scrollableBodyCurrentHeight   = $scrollableBody.find('.stk-table-body-scrollable').height() - activePreferences.scrollBarPixelOffset,
            $firstHeaderCells,
            $firstBodyCells,
            fixedColumnCalculatedWidth = 0,
            $newBodyRow,
            bodyCellSelector;

        logToConsole('Initializing fixed column...');

        // Apply original table class to cloned fixed column tables
        var originalTableClasses = $originalTable.prop('className');
        $clonedHeadContainer.find('table.stk-header-table').addClass(originalTableClasses);
        $clonedBodyContainer.find('table.stk-header-table').addClass(originalTableClasses);
        $clonedFootContainer.find('table.stk-header-table').addClass(originalTableClasses);

        // Select the first N header cells for cloning
        $firstHeaderCells = $scrollableBody.find('.stk-header-container thead tr > *:lt(' + activePreferences.leadingColumns + ')');
        fixedColumnCalculatedWidth = activePreferences.leadingColumns * metrics.borderWidth; // Start with border width
        $firstHeaderCells.each(function() {
          fixedColumnCalculatedWidth += jQueryAlias(this).outerWidth(true);
        });

        // Ensure minimum width for fixed columns
        if (fixedColumnCalculatedWidth < 20) { // New validation
          logToConsole(`Calculated fixed column width ${fixedColumnCalculatedWidth}px is too small, clamping to 20px.`, 'warn');
          fixedColumnCalculatedWidth = 20;
        }

        // Adjust height and width for header cells
        utilityFunctions._adjustElementHeight($firstHeaderCells, metrics);
        utilityFunctions._adjustElementWidth($firstHeaderCells, metrics);

        // Store widths of fixed header cells to apply to body cells
        var headerCellWidths = [];
        $firstHeaderCells.each(function() {
          headerCellWidths.push(jQueryAlias(this).width());
        });

        // Select the first N body cells for cloning
        bodyCellSelector = 'tbody tr > *:not(:nth-child(n+' + (activePreferences.leadingColumns + 1) + '))';
        $firstBodyCells = $scrollableBody.find(bodyCellSelector)
          .each(function(index) {
            utilityFunctions._adjustElementHeight(jQueryAlias(this), metrics);
            // Apply width from corresponding header cell
            utilityFunctions._adjustElementWidth(jQueryAlias(this), metrics, headerCellWidths[index % activePreferences.leadingColumns] );
          });

        // Clone header cells into the fixed column header
        $clonedHeadContainer.appendTo($fixedColumnContainer)
          .find('tr')
          .append($firstHeaderCells.clone());

        // Clone body cells into the fixed column body
        $clonedBodyContainer.appendTo($fixedColumnContainer)
          .css({
            'margin-top': -1, // Small adjustment for border alignment
            'height': scrollableBodyCurrentHeight + metrics.borderWidth
          });

        $firstBodyCells.each(function(index) {
          if (index % activePreferences.leadingColumns === 0) { // Start a new row for each original table row
            $newBodyRow = jQueryAlias('<tr></tr>').appendTo($clonedBodyContainer.find('tbody'));

            if (activePreferences.alternateRowClass && jQueryAlias(this).parent().hasClass(activePreferences.alternateRowClass)) {
              $newBodyRow.addClass(activePreferences.alternateRowClass);
            }
          }

          jQueryAlias(this).clone()
            .appendTo($newBodyRow);
        });

        // Set the width of the fixed column wrapper
        $fixedColumnContainer.css({
          'height': 0, // This seems counter-intuitive, likely a bug or specific design choice
          'width': fixedColumnCalculatedWidth
        });
        logToConsole(`Fixed column container width set to ${fixedColumnCalculatedWidth}px.`);

        // Bind mousewheel events for vertical scrolling synchronization in fixed column
        var maxScrollTop = $fixedColumnContainer.find('.stk-table-body-scrollable .stk-header-table').height() - $fixedColumnContainer.find('.stk-table-body-scrollable').height();
        $fixedColumnContainer.find('.stk-table-body-scrollable .stk-header-table').on('mousewheel DOMMouseScroll', function(event) { // Added DOMMouseScroll for broader compatibility
          var deltaY = event.originalEvent.wheelDelta || -event.originalEvent.detail; // Normalize delta

          if (deltaY === 0) {
            return;
          }
          event.preventDefault(); // Prevent page scroll

          var currentTop = parseInt(jQueryAlias(this).css('marginTop'), 10) || 0;
          var newTop = currentTop + (deltaY > 0 ? 120 : -120); // Scroll sensitivity

          // Clamp scroll position
          if (newTop > 0) {
            newTop = 0;
          }
          if (newTop < -maxScrollTop) {
            newTop = -maxScrollTop;
          }
          jQueryAlias(this).css('marginTop', newTop);
          $scrollableBody.find('.stk-table-body-scrollable').scrollTop(-newTop).trigger('scroll'); // Trigger general scroll event
        });


        // Set width of the scrollable body wrapper
        $scrollableBody.css({
          'width': scrollableBodyCurrentWidth
        });
        logToConsole(`Scrollable body width set to ${scrollableBodyCurrentWidth}px.`);


        // Setup cloned footer for fixed column if footers are enabled
        if (activePreferences.showFooterSection === true || activePreferences.mirrorHeadToFoot === true) {
          var $firstFooterCells = $scrollableBody.find('.stk-footer-container tr > *:lt(' + activePreferences.leadingColumns + ')');

          utilityFunctions._adjustElementHeight($firstFooterCells, metrics);
          $clonedFootContainer.appendTo($fixedColumnContainer)
            .find('tr')
            .append($firstFooterCells.clone());
          // Set (view width) of $clonedFootContainer div to width of table (this accounts for footers with a colspan)
        }
      },

      /*
       * Helper to determine if padding is included in element width/height (box-sizing).
       * Returns boolean.
       */
      _checkPaddingModel: function() {
        var $testDiv = jQueryAlias('<div style="width:1px;height:1px;padding:1px;position:absolute;top:-1000px;left:-1000px;"></div>').appendTo('body');
        var includesPadding = ($testDiv.width() === 3); // 1px width + 1px left padding + 1px right padding
        $testDiv.remove();
        logToConsole(`Padding included in width calculation: ${includesPadding}`);
        return includesPadding;
      },

      /*
       * Gets the width of the browser's scrollbar.
       * Returns number (pixels).
       */
      _getNativeScrollbarWidth: function() {
        var $scrollTestDiv = jQueryAlias('<div style="width:100px;height:100px;overflow:scroll;position:absolute;top:-1000px;left:-1000px;"></div>').appendTo('body');
        var scrollbarWidth = $scrollTestDiv[0].offsetWidth - $scrollTestDiv[0].clientWidth;
        $scrollTestDiv.remove();
        logToConsole(`Native scrollbar width: ${scrollbarWidth}px`);
        return scrollbarWidth;
      },

      /*
       * Gathers various metrics about the table, like border width.
       * Returns an object with metrics.
       */
      _getTableMetrics: function($table) {
        // This is a simplification; a more robust solution would inspect CSS.
        // Assuming a single border thickness for now.
        var borderWidth = parseInt($table.css('border-left-width'), 10) || 0;
        if ($table.css('border-collapse') === 'collapse' && activePreferences.collapseBorders) {
          borderWidth = 0; // Collapsed borders don't add to layout dimensions in the same way
        }

        return {
          borderWidth: borderWidth,
          headSection: $table.find('thead'),
          bodySection: $table.find('tbody'),
          footSection: $table.find('tfoot')
        };
      },

      /*
       * Prepares a cloned section (e.g., header or body for fixed columns) by adjusting cell widths.
       * Returns void.
       */
      _prepareClonedSection: function($container, $originalSection) {
        // This function is currently a placeholder for more specific cloning logic if needed.
        // The original plugin had a placeholder here as well.
        logToConsole('Preparing cloned section (placeholder).');
      },

      /*
       * Sets up the footer section, either by cloning or creating.
       * Returns void.
       */
      _setupTableFooter: function($originalTable, domElement, metrics) {
        var $mainWrapper = $originalTable.closest('.stk-table-main-wrapper'),
            $footerContainer;

        if (activePreferences.mirrorHeadToFoot) {
          // Clone header for footer
          $footerContainer = jQueryAlias('<div class="stk-footer-container"><table class="stk-header-table"></table></div>').appendTo($mainWrapper);
          $footerContainer.find('table.stk-header-table')
            .addClass($originalTable.prop('className'))
            .attr('style', $originalTable.attr('style'));
          $originalTable.find('thead').clone().appendTo($footerContainer.find('table'));
          logToConsole('Footer created by mirroring header.');
        } else if (metrics.footSection.length > 0) {
          // Use existing tfoot
          $footerContainer = jQueryAlias('<div class="stk-footer-container"><table class="stk-header-table"></table></div>').appendTo($mainWrapper);
          $footerContainer.find('table.stk-header-table')
            .addClass($originalTable.prop('className'))
            .attr('style', $originalTable.attr('style'));
          metrics.footSection.clone().appendTo($footerContainer.find('table')); // Clone original tfoot
          logToConsole('Footer created from existing tfoot.');
        } else {
          logToConsole('No footer section to setup.', 'info');
          return; // No footer to set up
        }

        utilityFunctions._prepareClonedSection($footerContainer, metrics.footSection); // Apply any specific footer cloning adjustments
      }

    };

    // --- Plugin method invocation logic ---
    // If a method name is passed, call it; otherwise, initialize.
    if (publicActions[action]) {
      return publicActions[action].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof action === 'object' || !action) {
      return publicActions.initializeModule.apply(this, arguments);
    } else {
      jQueryAlias.error('Method ' + action + ' does not exist on jQuery.stickyTableHeaders');
    }

  };

})(jQuery);