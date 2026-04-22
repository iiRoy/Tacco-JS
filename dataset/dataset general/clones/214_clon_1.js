"use strict"
;
var TrNgGrid
;
( function(TrNgGrid)
{
  TrNgGrid.version = "3.1.2";
  TrNgGrid.minAngularVersion = {
    major: 1,
    minor: 3,
    dot: 1
  }
  ;
  // This defines the selection modes for the grid.
  ( function(SelectionMode)
  {
    SelectionMode[SelectionMode["None"] = 0] = "None"
    ;
    SelectionMode[SelectionMode["SingleRow"] = 1] = "SingleRow"
    ;
    SelectionMode[SelectionMode["MultiRow"] = 2] = "MultiRow"
    ;
    SelectionMode[SelectionMode["MultiRowWithKeyModifiers"] = 3] = "MultiRowWithKeyModifiers"
    ;
  } ) ( TrNgGrid.SelectionMode || ( TrNgGrid.SelectionMode = {} ) )
  ;
  var SelectionMode = TrNgGrid.SelectionMode
  ;

  // Default options for columns are assigned here to facilitate matching with markup attributes.
  TrNgGrid.defaultColumnOptionsTemplate = {
    cellWidth: null,
    cellHeight: null,
    displayAlign: null,
    displayFormat: null,
    displayName: null,
    filter: null,
    enableFiltering: null,
    enableSorting: null
  }
  ;
  TrNgGrid.defaultColumnOptions = { }
  ;
  TrNgGrid.translations = { }
  ;
  TrNgGrid.debugMode = false
  ;
  var templatesConfigured = false
  ;
  var tableDirective = "trNgGrid"
  ;
  TrNgGrid.sortFilter = tableDirective + "SortFilter"
  ;
  TrNgGrid.dataPagingFilter = tableDirective + "DataPagingFilter"
  ;
  TrNgGrid.translateFilter = tableDirective + "TranslateFilter"
  ;
  TrNgGrid.translationDateFormat = tableDirective + "DateFormat"
  ;
  TrNgGrid.dataFormattingFilter = tableDirective + "DataFormatFilter"
  ;
  // var headerDirective = "trNgGridHeader";
  // var headerDirectiveAttribute = "tr-ng-grid-header";
  var bodyDirective = "trNgGridBody"
  ;
  var bodyDirectiveAttribute = "tr-ng-grid-body"
  ;
  var fieldNameAttribute = "field-name"
  ;
  var altFieldNameAttribute = "data-field-name"
  ;
  var isCustomizedAttribute = "is-customized"
  ;
  var cellFooterDirective = "trNgGridFooterCell"
  ;
  var cellFooterDirectiveAttribute = "tr-ng-grid-footer-cell"
  ;
  var cellFooterTemplateDirective = "trNgGridFooterCellTemplate"
  ;
  var cellFooterTemplateDirectiveAttribute = "tr-ng-grid-footer-cell-template"
  ;
  TrNgGrid.cellFooterTemplateId = cellFooterTemplateDirective + ".html"
  ;
  var globalFilterDirective = "trNgGridGlobalFilter"
  ;
  TrNgGrid.globalFilterDirectiveAttribute = "tr-ng-grid-global-filter"
  ;
  TrNgGrid.footerGlobalFilterTemplateId = globalFilterDirective + ".html"
  ;
  var pagerDirective = "trNgGridPager"
  ;
  TrNgGrid.pagerDirectiveAttribute = "tr-ng-grid-pager"
  ;
  TrNgGrid.footerPagerTemplateId = pagerDirective + ".html"
  ;
  var cellHeaderDirective = "trNgGridHeaderCell"
  ;
  var cellHeaderDirectiveAttribute = "tr-ng-grid-header-cell"
  ;
  var cellHeaderTemplateDirective = "trNgGridHeaderCellTemplate"
  ;
  var cellHeaderTemplateDirectiveAttribute = "tr-ng-grid-header-cell-template"
  ;
  TrNgGrid.cellHeaderTemplateId = cellHeaderTemplateDirective + ".html"
  ;
  var cellBodyDirective = "trNgGridBodyCell"
  ;
  var cellBodyDirectiveAttribute = "tr-ng-grid-body-cell"
  ;
  var cellBodyTemplateDirective = "trNgGridBodyCellTemplate"
  ;
  var cellBodyTemplateDirectiveAttribute = "tr-ng-grid-body-cell-template"
  ;
  TrNgGrid.cellBodyTemplateId = cellBodyTemplateDirective + ".html"
  ;
  var columnSortDirective = "trNgGridColumnSort"
  ;
  TrNgGrid.columnSortDirectiveAttribute = "tr-ng-grid-column-sort"
  ;
  TrNgGrid.columnSortTemplateId = columnSortDirective + ".html"
  ;
  var columnFilterDirective = "trNgGridColumnFilter"
  ;
  TrNgGrid.columnFilterDirectiveAttribute = "tr-ng-grid-column-filter"
  ;
  TrNgGrid.columnFilterTemplateId = columnFilterDirective + ".html"
  ;

  /*
   * Helper function to find a single child element by its tag name.
   */
  var findChildByTagName = function(parent, childTag)
  {
    childTag = childTag.toUpperCase()
    ;
    var children = parent.children()
    ;
    for (var childIndex = 0; childIndex < children.length; childIndex++)
    {
      var childElement = children[childIndex]
      ;
      if (childElement.tagName == childTag)
      {
        return angular.element(childElement)
        ;
      }
    }
    return null
    ;
  }
  ;

  /*
   * Helper function to find all child elements by their tag name.
   */
  var findChildrenByTagName = function(parent, childTag)
  {
    childTag = childTag.toUpperCase()
    ;
    var retChildren = []
    ;
    var children = parent.children()
    ;
    for (var childIndex = 0; childIndex < children.length; childIndex++)
    {
      var childElement = children[childIndex]
      ;
      if (childElement.tagName === childTag)
      {
        retChildren.push(angular.element(childElement))
        ;
      }
    }
    return retChildren
    ;
  }
  ;

  /**
   * Combines two sets of cell infos. The first set will take precedence in the checks but the combined items will contain items from the second set if they match.
   * This function ensures that column definitions are properly merged.
   */
  var combineGridCellInfos = function(firstSet, secondSet, addExtraFieldItemsSecondSet, addExtraNonFieldItemsSecondSet)
  {
    var combinedSet = []
    ;
    var secondTempSet = secondSet.slice(0)
    ; /* Create a shallow copy */
    angular.forEach(firstSet, function(firstSetColumn)
    {
      var foundSecondSetColumn = null
      ; // Initialize search result for current column
      for (var secondSetColumnIndex = 0; !foundSecondSetColumn && secondSetColumnIndex < secondTempSet.length; secondSetColumnIndex++)
      {
        foundSecondSetColumn = secondTempSet[secondSetColumnIndex]
        ;
        if (foundSecondSetColumn.fieldName === firstSetColumn.fieldName)
        {
          secondTempSet.splice(secondSetColumnIndex, 1)
          ; /* Remove from temp set if matched */
        }
        else
        {
          foundSecondSetColumn = null
          ; /* No match, reset */
        }
      }
      if (foundSecondSetColumn)
      {
        combinedSet.push(foundSecondSetColumn)
        ;
      }
      else
      {
        combinedSet.push(firstSetColumn)
        ;
      }
    })
    ;
    // Add any remaining items from the second set based on flags
    if (addExtraFieldItemsSecondSet || addExtraNonFieldItemsSecondSet)
    {
      angular.forEach(secondTempSet, function(secondSetColumn)
      {
        if ( ( addExtraFieldItemsSecondSet && secondSetColumn.fieldName ) || ( addExtraNonFieldItemsSecondSet && !secondSetColumn.fieldName ) )
        {
          combinedSet.push(secondSetColumn)
          ;
        }
      })
      ;
    }
    return combinedSet
    ;
  }
  ;

  /*
   * Wraps a templated cell's content if it's customized and doesn't already have the template directive.
   */
  var wrapTemplatedCell = function(templateElement, tAttrs, isCustomized, cellTemplateDirective)
  {
    if (isCustomized)
    {
      var childrenElements = templateElement.children()
      ;
      var firstChildElement = angular.element(childrenElements[0])
      ;
      if (childrenElements.length !== 1 || !firstChildElement.attr(cellTemplateDirective))
      {
        // Wrap the children of the custom template cell
        templateElement.empty()
        ;
        var templateWrapElement = angular.element("<div></div>").attr(cellTemplateDirective, "")
        ;
        templateElement.append(templateWrapElement)
        ;
        angular.forEach(childrenElements, function(childElement)
        {
          templateWrapElement.append(angular.element(childElement))
          ;
        })
        ;
      }
    }
    else
    {
      templateElement.empty()
      ;
      templateElement.append(angular.element("<div></div>").attr(cellTemplateDirective, ""))
      ;
    }
  }
  ;

  /*
   * Represents a single templated cell within a grid section.
   */
  var TemplatedCell = ( function()
  {
    function TemplatedCell(parent, cellElement)
    {
      this.parent = parent
      ;
      this.cellElement = cellElement
      ;
      this.fieldName = cellElement.attr(fieldNameAttribute) || cellElement.attr(altFieldNameAttribute)
      ;
      var customContent = cellElement.children()
      ;
      this.isStandardColumn = customContent.length === 0
      ;
    }
    return TemplatedCell
    ;
  } ) ( )
  ;

  /*
   * Represents a templated section (header, body, or footer) of the grid.
   * Manages the discovery and configuration of cells within its section.
   */
  var TemplatedSection = ( function()
  {
    function TemplatedSection(sectionTagName, sectionDirectiveAttribute, rowDirectiveAttribute, cellTagName, cellDirectiveAttribute)
    {
      this.sectionTagName = sectionTagName
      ;
      this.sectionDirectiveAttribute = sectionDirectiveAttribute
      ;
      this.rowDirectiveAttribute = rowDirectiveAttribute
      ;
      this.cellTagName = cellTagName
      ;
      this.cellDirectiveAttribute = cellDirectiveAttribute
      ;
      this.cellTagName = this.cellTagName.toUpperCase()
      ; /* Ensure uppercase for tag matching */
      this.cells = null
      ;
    }

    TemplatedSection.prototype.configureSection = function(gridElement, columnDefs)
    {
      var _this = this
      ;
      var sectionElement = this.getSectionElement(gridElement, true)
      ;
      sectionElement.empty()
      ;
      sectionElement.removeAttr("ng-non-bindable")
      ;
      // Add elements in the correct order
      var rowElementDefinitions = combineGridCellInfos(columnDefs, this.cells, false, false)
      ;
      // Get the templated row element
      var templatedRowElement = this.getTemplatedRowElement(sectionElement, true)
      ;
      angular.forEach(rowElementDefinitions, function(gridCell, index)
      {
        var gridCellElement
        ;
        var templatedCell = gridCell
        ; // Type assertion
        // Handle templated cells vs. standard cells
        if (templatedCell.parent === _this && templatedCell.cellElement)
        {
          gridCellElement = templatedCell.cellElement.clone(true)
          ;
        }
        else
        {
          gridCellElement = angular.element("<table><" + _this.cellTagName + "></" + _this.cellTagName + "></table>").find(_this.cellTagName)
          ;
        }

        // Set up attributes for the cell
        if (_this.cellDirectiveAttribute)
        {
          gridCellElement.attr(_this.cellDirectiveAttribute, index)
          ;
        }
        if (!gridCell.isStandardColumn)
        {
          gridCellElement.attr(isCustomizedAttribute, "true")
          ;
        }
        if (gridCell.fieldName)
        {
          gridCellElement.attr(fieldNameAttribute, gridCell.fieldName)
          ;
        }
        gridCellElement.attr("ng-style", "{\'width\':columnOptions.cellWidth,\'height\':columnOptions.cellHeight}")
        ;
        // Append the cell to the row
        templatedRowElement.append(gridCellElement)
        ;
      })
      ;
      return sectionElement
      ;
    }
    ;

    TemplatedSection.prototype.extractPartialColumnDefinitions = function()
    {
      return this.cells
      ;
    }
    ;

    TemplatedSection.prototype.discoverTemplates = function(gridElement)
    {
      var _this = this
      ;
      this.cells = []
      ;
      this.cellRow = null
      ;
      var templatedRow = this.getTemplatedRowElement(this.getSectionElement(gridElement, false), false)
      ;
      if (templatedRow)
      {
        this.cellRow = angular.element(templatedRow.clone())
        ;
        this.cellRow.empty()
        ;
        angular.forEach(templatedRow.children(), function(childElement, childIndex)
        {
          childElement = angular.element(childElement)
          ;
          if (childElement[0].tagName === _this.cellTagName.toUpperCase())
          {
            var templateElement = childElement.clone()
            ;
            _this.cells.push(new TemplatedCell(_this, templateElement))
            ;
          }
        })
        ;
      }
    }
    ;

    TemplatedSection.prototype.getSectionElement = function(gridElement, ensurePresent)
    {
      var sectionElement = null
      ;
      if (gridElement)
      {
        sectionElement = findChildByTagName(gridElement, this.sectionTagName)
        ;
      }
      if (!sectionElement && ensurePresent)
      {
        // Angular compatibility note: https://groups.google.com/forum/#!topic/angular/7poFynsguNw
        sectionElement = angular.element("<table><" + this.sectionTagName + "></" + this.sectionTagName + "></table>").find(this.sectionTagName)
        ;
        if (gridElement)
        {
          gridElement.append(sectionElement)
          ;
        }
      }
      if (sectionElement && ensurePresent && this.sectionDirectiveAttribute)
      {
        sectionElement.attr(this.sectionDirectiveAttribute, "")
        ;
      }
      return sectionElement
      ;
    }
    ;

    TemplatedSection.prototype.getTemplatedRowElement = function(sectionElement, ensurePresent)
    {
      var rowElement = null
      ;
      if (sectionElement)
      {
        rowElement = findChildByTagName(sectionElement, "tr")
        ;
      }
      if (!rowElement && ensurePresent)
      {
        rowElement = this.cellRow ? angular.element(this.cellRow.clone()) : angular.element("<table><tr></tr></table>").find("tr")
        ;
        if (sectionElement)
        {
          sectionElement.append(rowElement)
          ;
        }
      }
      if (rowElement && ensurePresent && this.rowDirectiveAttribute)
      {
        rowElement.attr(this.rowDirectiveAttribute, "")
        ;
      }
      return rowElement
      ;
    }
    ;
    return TemplatedSection
    ;
  } ) ( )
  ;

  /*
   * The main controller for the TrNgGrid directive.
   * Handles grid setup, data retrieval, sorting, filtering, and selection.
   */
  var GridController = ( function()
  {
    function GridController($compile, $parse, $timeout, $templateCache)
    {
      this.$compile = $compile
      ;
      this.$parse = $parse
      ;
      this.$timeout = $timeout
      ;
      if (!templatesConfigured)
      {
        configureTemplates($templateCache)
        ;
        templatesConfigured = true
        ;
      }
    }

    GridController.prototype.setupGrid = function(gridScope, gridOptions, isInServerSideMode)
    {
      var _this = this
      ;
      this.gridOptions = gridOptions
      ;
      this.isInServerSideMode = isInServerSideMode
      ;
      gridScope.gridOptions = gridOptions
      ;
      gridScope.TrNgGrid = TrNgGrid
      ;

      // Set some default options for the grid if they are not defined
      /*
      gridScope.$watch("gridOptions.locale",(newLocale: string) => {
          if (!newLocale) {
              gridScope.gridOptions.locale = "en";
          }
      });
      gridScope.$watch("gridOptions.selectionMode",(newSelectionMode: string) => {
          if (!newSelectionMode) {
              gridScope.gridOptions.selectionMode = SelectionMode[SelectionMode.MultiRow];
          }
      });
      gridScope.$watch("gridOptions.onDataRequiredDelay",(newDataRequiredDelay: string) => {
          if (newDataRequiredDelay === undefined) {
              gridScope.gridOptions.onDataRequiredDelay = 1000;
          }
      });
      */
      gridOptions.gridColumnDefs = []
      ; // Initialize column definitions
      if (gridOptions.locale === undefined)
      {
        gridOptions.locale = "en"
        ;
      }
      if (gridOptions.selectionMode === undefined)
      {
        gridOptions.selectionMode = SelectionMode[2 /* MultiRow */]
        ;
      }
      if (gridOptions.filterByFields === undefined)
      {
        gridOptions.filterByFields = { }
        ;
      }
      if (gridOptions.enableFiltering === undefined)
      {
        gridOptions.enableFiltering = true
        ;
      }
      if (gridOptions.enableSorting === undefined)
      {
        gridOptions.enableSorting = true
        ;
      }
      if (gridOptions.onDataRequiredDelay === undefined)
      {
        gridOptions.onDataRequiredDelay = 1000
        ; // Default delay in milliseconds
      }
      if (gridOptions.selectedItems === undefined)
      {
        gridOptions.selectedItems = []
        ;
      }
      if (gridOptions.currentPage === undefined)
      {
        gridOptions.currentPage = 0
        ;
      }

      // Set up watchers for special attributes, especially for server-side mode
      if (isInServerSideMode)
      {
        var retrieveDataCallback = function()
        {
          _this.dataRequestPromise = null
          ;
          _this.gridOptions.immediateDataRetrieval = false
          ;
          TrNgGrid.debugMode && _this.log("Requesting data - server side mode")
          ;
          _this.gridOptions.onDataRequired(_this.gridOptions)
          ;
        }
        ;

        var scheduleDataRetrieval = function()
        {
          if (_this.dataRequestPromise)
          {
            _this.$timeout.cancel(_this.dataRequestPromise)
            ;
            _this.dataRequestPromise = null
            ;
          }
          if (_this.gridOptions.immediateDataRetrieval)
          {
            retrieveDataCallback()
            ;
          }
          else
          {
            _this.dataRequestPromise = _this.$timeout(function()
            {
              retrieveDataCallback()
              ;
            }, _this.gridOptions.onDataRequiredDelay, true)
            ;
          }
        }
        ;

        gridScope.$watchCollection(
          "[" + "gridOptions.currentPage," + "gridOptions.filterBy, " + "gridOptions.filterByFields, " + "gridOptions.orderBy, " + "gridOptions.orderByReverse, " + "gridOptions.pageItems, " + "]",
          function(newValues, oldValues)
          {
            // The first time, both arrays of values will be identical.
            var pageChanged = newValues[0] !== oldValues[0]
            ;
            if (!angular.equals(newValues, oldValues) && !pageChanged)
            {
              // If anything changes other than the page, reset the page index.
              if (_this.gridOptions.currentPage !== 0)
              {
                _this.gridOptions.currentPage = 0
                ;
                // The page index watch will trigger, so exit to avoid duplicate requests.
                return
                ;
              }
            }
            // This is called initially even without changes, which is needed to start data retrieval.
            scheduleDataRetrieval()
            ;
          }
        )
        ;

        gridScope.$watch("gridOptions.immediateDataRetrieval", function(newValue)
        {
          if (newValue && _this.dataRequestPromise)
          {
            _this.$timeout.cancel(_this.dataRequestPromise)
            ;
            retrieveDataCallback()
            ;
          }
        })
        ;
      }

      // Watch for changes in selection mode to adjust selected items
      gridScope.$watch("gridOptions.selectionMode", function(newValue, oldValue)
      {
        if (newValue !== oldValue)
        {
          switch (newValue)
          {
            case SelectionMode[0 /* None */]:
              _this.gridOptions.selectedItems.splice(0)
              ;
              break
              ;
            case SelectionMode[1 /* SingleRow */]:
              if (_this.gridOptions.selectedItems.length > 1)
              {
                _this.gridOptions.selectedItems.splice(1)
                ;
              }
              break
              ;
          }
        }
      })
      ;
      return gridScope
      ;
    }
    ;

    GridController.prototype.speedUpAsyncDataRetrieval = function($event)
    {
      if (!$event || $event.keyCode == 13)
      {
        this.gridOptions.immediateDataRetrieval = true
        ;
      }
    }
    ;

    GridController.prototype.setColumnOptions = function(columnIndex, columnOptions)
    {
      var originalOptions = this.gridOptions.gridColumnDefs[columnIndex]
      ;
      if (!originalOptions)
      {
        throw "Invalid grid column options found for column index " + columnIndex + ". Please report this error."
        ;
      }
      // Copy relevant options onto the incoming set
      columnOptions = angular.extend(columnOptions, originalOptions)
      ;
      // Replace the old options with the new, extended ones
      this.gridOptions.gridColumnDefs[columnIndex] = columnOptions
      ;
    }
    ;

    GridController.prototype.toggleSorting = function(propertyName)
    {
      if (this.gridOptions.orderBy != propertyName)
      {
        // If the column has changed, set the new order by property
        this.gridOptions.orderBy = propertyName
        ;
      }
      else
      {
        // Otherwise, just reverse the sort direction for the same column
        this.gridOptions.orderByReverse = !this.gridOptions.orderByReverse
        ;
      }
      this.speedUpAsyncDataRetrieval()
      ;
    }
    ;

    GridController.prototype.toggleItemSelection = function(filteredItems, item, $event)
    {
      if (this.gridOptions.selectionMode === SelectionMode[0 /* None */])
      {
        return
        ;
      }
      switch (this.gridOptions.selectionMode)
      {
        case SelectionMode[3 /* MultiRowWithKeyModifiers */]:
          if (!$event.ctrlKey && !$event.shiftKey && !$event.metaKey)
          {
            // If no key modifiers are pressed, clear the current selection and select only the clicked item.
            var itemIndex = this.gridOptions.selectedItems.indexOf(item)
            ;
            this.gridOptions.selectedItems.splice(0)
            ;
            if (itemIndex < 0)
            {
              this.gridOptions.selectedItems.push(item)
              ;
            }
          }
          else
          {
            if ($event.ctrlKey || $event.metaKey)
            {
              // Ctrl/Meta key toggles selection for the individual item.
              var itemIndex = this.gridOptions.selectedItems.indexOf(item)
              ;
              if (itemIndex >= 0)
              {
                this.gridOptions.selectedItems.splice(itemIndex, 1)
                ;
              }
              else
              {
                this.gridOptions.selectedItems.push(item)
                ;
              }
            }
            else if ($event.shiftKey)
            {
              // Shift key selects a range of items.
              // Clear any text selections that might occur due to rapid clicking.
              if (document.selection && document.selection.empty)
              {
                document.selection.empty()
                ;
              }
              else if (window.getSelection)
              {
                var sel = window.getSelection()
                ;
                sel.removeAllRanges()
                ;
              }

              // Determine the start point for the range selection.
              var firstItemIndex
              ;
              var lastSelectedItem = this.gridOptions.selectedItems[this.gridOptions.selectedItems.length - 1]
              ;
              for (firstItemIndex = 0; firstItemIndex < filteredItems.length && filteredItems[firstItemIndex].$$_gridItem !== lastSelectedItem; firstItemIndex++)
              {
                /* intentional empty loop */
              }
              if (firstItemIndex >= filteredItems.length)
              {
                firstItemIndex = 0
                ;
              }

              // Determine the end point for the range selection.
              var lastItemIndex
              ;
              for (lastItemIndex = 0; lastItemIndex < filteredItems.length && filteredItems[lastItemIndex].$$_gridItem !== item; lastItemIndex++)
              {
                /* intentional empty loop */
              }
              if (lastItemIndex >= filteredItems.length)
              {
                throw "Invalid selection on a key modifier selection mode"
                ;
              }

              // Ensure correct order for the loop.
              if (lastItemIndex < firstItemIndex)
              {
                var tempIndex = firstItemIndex
                ;
                firstItemIndex = lastItemIndex
                ;
                lastItemIndex = tempIndex
                ;
              }

              // Select all items in the determined range.
              for (var currentItemIndex = firstItemIndex; currentItemIndex <= lastItemIndex; currentItemIndex++)
              {
                var currentItem = filteredItems[currentItemIndex].$$_gridItem
                ;
                if (this.gridOptions.selectedItems.indexOf(currentItem) < 0)
                {
                  this.gridOptions.selectedItems.push(currentItem)
                  ;
                }
              }
            }
          }
          break
          ;
        case SelectionMode[1 /* SingleRow */]:
          // Single row mode: clear all previous selections and select only the clicked item.
          var itemIndex = this.gridOptions.selectedItems.indexOf(item)
          ;
          this.gridOptions.selectedItems.splice(0)
          ;
          if (itemIndex < 0)
          {
            this.gridOptions.selectedItems.push(item)
            ;
          }
          break
          ;
        case SelectionMode[2 /* MultiRow */]:
          // Multi-row mode: toggle selection for the clicked item.
          var itemIndex = this.gridOptions.selectedItems.indexOf(item)
          ;
          if (itemIndex >= 0)
          {
            this.gridOptions.selectedItems.splice(itemIndex, 1)
            ;
          }
          else
          {
            this.gridOptions.selectedItems.push(item)
            ;
          }
          break
          ;
      }
    }
    ;

    GridController.prototype.discoverTemplates = function(gridElement)
    {
      this.templatedHeader = new TemplatedSection("thead", null, null, "th", cellHeaderDirectiveAttribute)
      ;
      this.templatedBody = new TemplatedSection("tbody", bodyDirectiveAttribute, null, "td", cellBodyDirectiveAttribute)
      ;
      this.templatedFooter = new TemplatedSection("tfoot", null, null, "td", cellFooterDirectiveAttribute)
      ;
      this.templatedHeader.discoverTemplates(gridElement)
      ;
      this.templatedFooter.discoverTemplates(gridElement)
      ;
      this.templatedBody.discoverTemplates(gridElement)
      ;
    }
    ;

    GridController.prototype.getSafeFieldName = function(fieldName)
    {
      return fieldName.replace(/[^a-zA-Z]/g, "_")
      ; /* Replaces non-alphabetic chars with underscore */
    }
    ;

    GridController.prototype.configureTableStructure = function(parentScope, gridElement, oldScope)
    {
      var _this = this
      ;
      try
      {
        gridElement.empty()
        ;
        if (oldScope)
        {
          // It's not permitted to destroy the old scope within the same digest cycle.
          var scopeToBeDestroyed = oldScope
          ;
          this.$timeout(function()
          {
            scopeToBeDestroyed.$destroy()
            ;
          })
          ;
          oldScope = null
          ; /* Nullify reference after scheduling destruction */
        }
        var scope = parentScope.$new()
        ;