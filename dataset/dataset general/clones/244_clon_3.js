;(($, windowRef, documentRef) => {
  // Core configuration details for the widget
  const WIDGET_IDENTIFIER = 'enhancedOptionPicker';
  const DEFAULT_CONFIG = {
    enableLegacySkin: false, // Renamed from bootstrap2Compatible
    clearFilterLabel: 'Show All Options', // Renamed from filterTextClear
    filterSearchPrompt: 'Type to search...', // Renamed from filterPlaceHolder
    moveSingleLabel: 'Move Selected Item(s)', // Renamed from moveSelectedLabel
    moveAllItemsLabel: 'Move All Items', // Renamed from moveAllLabel
    removeSingleLabel: 'Remove Selected Item(s)', // Renamed from removeSelectedLabel
    removeAllItemsLabel: 'Remove All Items', // Renamed from removeAllLabel
    autoMoveOnSelect: true, // Renamed from moveOnSelect, forced true on Android
    maintainSelectionOnTransfer: false, // Renamed from preserveSelectionOnMove ('all' / 'moved' / false)
    rightListTitle: false, // Renamed from selectedListLabel
    leftListTitle: false, // Renamed from nonSelectedListLabel
    hiddenSelectSuffix: '_auxiliary', // Renamed from helperSelectNamePostfix
    minimumOptionHeight: 100, // Renamed from selectOrMinimalHeight
    displaySearchInputs: true, // Renamed from showFilterInputs
    leftPaneFilter: '', // Renamed from nonSelectedFilter
    rightPaneFilter: '', // Renamed from selectedFilter
    statusTextAll: 'Showing {0} available entries', // Renamed from infoText
    statusTextFiltered: '<span class="picker-alert-badge">Filtered</span> {0} of {1} visible', // Renamed from infoTextFiltered
    statusTextEmpty: 'No items in list', // Renamed from infoTextEmpty
    searchByOptionValue: false, // Renamed from filterOnValues
    animationSpeedMs: 100 // New setting: duration for visual feedback animations
  };

  // Check for known Android browser issues with select elements
  const IS_ANDROID_SELECT_BUGGY = /android/i.test(navigatorRef.userAgent.toLowerCase());

  // Helper function: Trigger a custom change event on the original select
  function emitSelectionUpdate(pickerInstance) {
    pickerInstance.targetElement.trigger('change');
  }

  // Helper function: Initialize or update data attributes for each option
  function initializeOptionMetadata(pickerInstance) {
    let currentOptionCount = 0;
    pickerInstance.targetElement.find('option').each(function(idx, optItem) {
      const $optItem = $(optItem);
      // Ensure each option has a unique original index
      if ($optItem.data('original-idx') == null) { // Using == null for undefined or null
        $optItem.data('original-idx', currentOptionCount++);
      }
      // Ensure each option has a selection state
      if ($optItem.data('current-selection') == null) {
        $optItem.data('current-selection', false);
      }
    });
    pickerInstance.totalOptionsCount = currentOptionCount; // Store total count
  }

  // Helper function: Update the 'selected' property of an option in the original select
  function adjustOptionSelectionStatus(pickerInstance, originalIndex, shouldBeSelected) {
    pickerInstance.targetElement.find('option').each(function(idx, optItem) {
      const $optItem = $(optItem);
      if ($optItem.data('original-idx') === originalIndex) {
        $optItem.prop('selected', shouldBeSelected);
        // Add a visual cue with a short animation
        if (pickerInstance.currentConfig.animationSpeedMs > 0) {
          $optItem.stop(true, true).animate({ opacity: 0.5 }, pickerInstance.currentConfig.animationSpeedMs / 2, function() {
            $(this).animate({ opacity: 1 }, pickerInstance.currentConfig.animationSpeedMs / 2);
          });
        }
        return false; // Break from loop once found
      }
    });
  }

  // Helper function: Format a string with positional arguments
  function interpolateText(templateStr, replacements) {
    if (typeof templateStr !== 'string' || !Array.isArray(replacements)) {
      console.error("Invalid arguments for interpolateText. Expected (string, array).");
      return templateStr; // Return original string on error
    }
    return templateStr.replace(/\{(\d+)\}/g, (match, index) => {
      return (replacements[index] !== undefined && replacements[index] !== null) ? replacements[index] : match;
    });
  }

  // Helper function: Update the information text for both lists
  function updateStatusDisplay(pickerInstance) {
    // Exit early if info text is disabled
    if (!pickerInstance.currentConfig.statusTextAll) {
      pickerInstance.domElements.leftInfo.empty();
      pickerInstance.domElements.rightInfo.empty();
      return;
    }

    // Get counts for left (non-selected) list
    const visibleLeft = pickerInstance.domElements.leftSelect.find('option').length;
    const totalLeft = pickerInstance.totalOptionsCount - pickerInstance.selectedItemsCount;
    let leftContent = '';

    if (totalLeft === 0) {
      leftContent = pickerInstance.currentConfig.statusTextEmpty;
    } else if (visibleLeft === totalLeft) {
      leftContent = interpolateText(pickerInstance.currentConfig.statusTextAll, [visibleLeft]);
    } else {
      leftContent = interpolateText(pickerInstance.currentConfig.statusTextFiltered, [visibleLeft, totalLeft]);
    }

    pickerInstance.domElements.leftInfo.html(leftContent);
    pickerInstance.domElements.leftContainer.toggleClass('filter-active', !(visibleLeft === totalLeft || totalLeft === 0));

    // Get counts for right (selected) list
    const visibleRight = pickerInstance.domElements.rightSelect.find('option').length;
    const totalRight = pickerInstance.selectedItemsCount;
    let rightContent = '';

    if (totalRight === 0) {
      rightContent = pickerInstance.currentConfig.statusTextEmpty;
    } else if (visibleRight === totalRight) {
      rightContent = interpolateText(pickerInstance.currentConfig.statusTextAll, [visibleRight]);
    } else {
      rightContent = interpolateText(pickerInstance.currentConfig.statusTextFiltered, [visibleRight, totalRight]);
    }

    pickerInstance.domElements.rightInfo.html(rightContent);
    pickerInstance.domElements.rightContainer.toggleClass('filter-active', !(visibleRight === totalRight || totalRight === 0));
  }

  // Helper function: Rebuild the visible select elements based on the original select's state
  function rebuildOptionContainers(pickerInstance) {
    pickerInstance.selectedItemsCount = 0; // Reset count

    pickerInstance.domElements.leftSelect.empty();
    pickerInstance.domElements.rightSelect.empty();

    pickerInstance.targetElement.find('option').each(function(idx, optItem) {
      const $optItem = $(optItem);
      // Clone the option, retaining its data and properties
      const clonedOption = $optItem.clone(true).prop('selected', $optItem.data('current-selection'));

      if ($optItem.prop('selected')) {
        pickerInstance.selectedItemsCount++;
        pickerInstance.domElements.rightSelect.append(clonedOption);
      } else {
        pickerInstance.domElements.leftSelect.append(clonedOption);
      }
    });

    // Apply filters if enabled
    if (pickerInstance.currentConfig.displaySearchInputs) {
      applyListFilter(pickerInstance, 1); // Left list
      applyListFilter(pickerInstance, 2); // Right list
    }
    updateStatusDisplay(pickerInstance);
  }

  // Helper function: Apply filter to a specific list (1 for left, 2 for right)
  function applyListFilter(pickerInstance, listIdentifier) {
    // Guard clause: do not filter if inputs are hidden
    if (!pickerInstance.currentConfig.displaySearchInputs) {
      return;
    }

    persistCurrentSelections(pickerInstance, listIdentifier); // Save current selections before filtering

    const targetSelect = pickerInstance.domElements[`${listIdentifier === 1 ? 'leftSelect' : 'rightSelect'}`];
    targetSelect.empty().scrollTop(0); // Clear and reset scroll

    const filterInput = pickerInstance.domElements[`${listIdentifier === 1 ? 'leftFilterInput' : 'rightFilterInput'}`];
    const filterTerm = $.trim(filterInput.val());
    const filterRegex = new RegExp(filterTerm, 'gi');

    let optionsToFilter = pickerInstance.targetElement.find('option');

    if (listIdentifier === 1) { // Non-selected list
      optionsToFilter = optionsToFilter.not(':selected');
    } else { // Selected list
      optionsToFilter = optionsToFilter.filter(':selected');
    }

    optionsToFilter.each(function(idx, optItem) {
      const $optItem = $(optItem);
      const optionText = optItem.text;
      const optionValue = $optItem.attr('value');

      let isHiddenByFilter = true; // Assume hidden until match found

      // Check if option text or value matches the filter term
      const textMatches = optionText.match(filterRegex);
      const valueMatches = pickerInstance.currentConfig.searchByOptionValue && optionValue && optionValue.match(filterRegex);

      if (textMatches || valueMatches) {
        isHiddenByFilter = false;
        // Append a clone of the option, preserving its selection state
        targetSelect.append($optItem.clone(true).prop('selected', $optItem.data('current-selection')));
      }

      // Update original option's filter status
      pickerInstance.targetElement.find('option').eq($optItem.data('original-idx')).data(`filtered-${listIdentifier}`, isHiddenByFilter);
    });

    updateStatusDisplay(pickerInstance);
  }

  // Helper function: Save the current selection state of options displayed in a list back to the original options data
  function persistCurrentSelections(pickerInstance, listIdentifier) {
    const sourceSelect = pickerInstance.domElements[`${listIdentifier === 1 ? 'leftSelect' : 'rightSelect'}`];
    sourceSelect.find('option').each(function(idx, optItem) {
      const $optItem = $(optItem);
      // Update the 'current-selection' data attribute on the original option
      pickerInstance.targetElement.find('option').eq($optItem.data('original-idx')).data('current-selection', $optItem.prop('selected'));
    });
  }

  // Helper function: Sort options within a select element by their original index
  function reorderOptionsByOriginalIndex(selectElement) {
    const sortedOptions = selectElement.find('option').sort((optA, optB) => {
      const indexA = $(optA).data('original-idx');
      const indexB = $(optB).data('original-idx');
      return (indexA > indexB) ? 1 : -1;
    });
    selectElement.append(sortedOptions); // Append sorted options back
  }

  // Helper function: Transfers selected options from left to right list
  function transferSelected(pickerInstance) {
    // Handle selection preservation logic
    const preserveMode = pickerInstance.currentConfig.maintainSelectionOnTransfer;
    const isAutoMove = pickerInstance.currentConfig.autoMoveOnSelect;

    if (preserveMode === 'all' && !isAutoMove) {
      persistCurrentSelections(pickerInstance, 1); // Left list
      persistCurrentSelections(pickerInstance, 2); // Right list
    } else if (preserveMode === 'moved' && !isAutoMove) {
      persistCurrentSelections(pickerInstance, 1); // Only left list
    }

    // Mark selected options in the original select as 'selected'
    pickerInstance.domElements.leftSelect.find('option:selected').each(function(idx, optItem) {
      const $optItem = $(optItem);
      // Only process options not hidden by filter
      if (!$optItem.data('filtered-1')) {
        adjustOptionSelectionStatus(pickerInstance, $optItem.data('original-idx'), true);
      }
    });

    rebuildOptionContainers(pickerInstance);
    emitSelectionUpdate(pickerInstance);
    reorderOptionsByOriginalIndex(pickerInstance.domElements.rightSelect); // Sort the right list
  }

  // Helper function: Transfers selected options from right to left list
  function returnSelected(pickerInstance) {
    const preserveMode = pickerInstance.currentConfig.maintainSelectionOnTransfer;
    const isAutoMove = pickerInstance.currentConfig.autoMoveOnSelect;

    if (preserveMode === 'all' && !isAutoMove) {
      persistCurrentSelections(pickerInstance, 1);
      persistCurrentSelections(pickerInstance, 2);
    } else if (preserveMode === 'moved' && !isAutoMove) {
      persistCurrentSelections(pickerInstance, 2); // Only right list
    }

    pickerInstance.domElements.rightSelect.find('option:selected').each(function(idx, optItem) {
      const $optItem = $(optItem);
      if (!$optItem.data('filtered-2')) {
        adjustOptionSelectionStatus(pickerInstance, $optItem.data('original-idx'), false);
      }
    });

    rebuildOptionContainers(pickerInstance);
    emitSelectionUpdate(pickerInstance);
    reorderOptionsByOriginalIndex(pickerInstance.domElements.leftSelect); // Sort the left list
  }

  // Helper function: Transfers all options from left to right list
  function transferAll(pickerInstance) {
    const preserveMode = pickerInstance.currentConfig.maintainSelectionOnTransfer;
    const isAutoMove = pickerInstance.currentConfig.autoMoveOnSelect;

    if (preserveMode === 'all' && !isAutoMove) {
      persistCurrentSelections(pickerInstance, 1);
      persistCurrentSelections(pickerInstance, 2);
    } else if (preserveMode === 'moved' && !isAutoMove) {
      persistCurrentSelections(pickerInstance, 1);
    }

    pickerInstance.targetElement.find('option').each(function(idx, optItem) {
      const $optItem = $(optItem);
      if (!$optItem.data('filtered-1')) { // Only move non-filtered options
        $optItem.prop('selected', true);
      }
    });

    rebuildOptionContainers(pickerInstance);
    emitSelectionUpdate(pickerInstance);
  }

  // Helper function: Transfers all options from right to left list
  function returnAll(pickerInstance) {
    const preserveMode = pickerInstance.currentConfig.maintainSelectionOnTransfer;
    const isAutoMove = pickerInstance.currentConfig.autoMoveOnSelect;

    if (preserveMode === 'all' && !isAutoMove) {
      persistCurrentSelections(pickerInstance, 1);
      persistCurrentSelections(pickerInstance, 2);
    } else if (preserveMode === 'moved' && !isAutoMove) {
      persistCurrentSelections(pickerInstance, 2);
    }

    pickerInstance.targetElement.find('option').each(function(idx, optItem) {
      const $optItem = $(optItem);
      if (!$optItem.data('filtered-2')) { // Only move non-filtered options
        $optItem.prop('selected', false);
      }
    });

    rebuildOptionContainers(pickerInstance);
    emitSelectionUpdate(pickerInstance);
  }

  // Helper function: Bind all necessary event handlers
  function attachEventHandlers(pickerInstance) {
    // Prevent form submission on filter input focus
    pickerInstance.domElements.formHandle.submit(function(event) {
      if (pickerInstance.domElements.leftFilterInput.is(':focus') || pickerInstance.domElements.rightFilterInput.is(':focus')) {
        event.preventDefault();
        // Blur the input to release focus after preventing submission
        $(event.target).find(':focus').blur();
      }
    });

    // Custom event to refresh the picker
    pickerInstance.targetElement.on(`${WIDGET_IDENTIFIER}.refresh`, function(event, shouldClearSelections) {
      pickerInstance.refreshView(shouldClearSelections);
    });

    // Clear filter buttons
    pickerInstance.domElements.leftFilterClear.on('click', function() {
      pickerInstance.setLeftPaneFilter('');
    });
    pickerInstance.domElements.rightFilterClear.on('click', function() {
      pickerInstance.setRightPaneFilter('');
    });

    // Transfer buttons
    pickerInstance.domElements.transferSelectedBtn.on('click', function() {
      transferSelected(pickerInstance);
    });
    pickerInstance.domElements.transferAllBtn.on('click', function() {
      transferAll(pickerInstance);
    });
    pickerInstance.domElements.returnSelectedBtn.on('click', function() {
      returnSelected(pickerInstance);
    });
    pickerInstance.domElements.returnAllBtn.on('click', function() {
      returnAll(pickerInstance);
    });

    // Filter input keyup/change
    pickerInstance.domElements.leftFilterInput.on('change keyup', function() {
      applyListFilter(pickerInstance, 1);
    });
    pickerInstance.domElements.rightFilterInput.on('change keyup', function() {
      applyListFilter(pickerInstance, 2);
    });

    // Auto-move on select/deselect is handled in setAutoMoveOnSelect, which binds/unbinds these.
    // Initial binding is done during initComponent via setAutoMoveOnSelect.
  }

  // Main plugin constructor function
  function OptionPicker(originalElement, userOptions) {
    this.targetElement = $(originalElement);
    this.currentConfig = $.extend(true, {}, DEFAULT_CONFIG, userOptions); // Deep merge
    this._defaultConfig = DEFAULT_CONFIG;
    this._widgetIdentifier = WIDGET_IDENTIFIER;

    // Internal state variables
    this.selectedItemsCount = 0;
    this.totalOptionsCount = 0;
    this.domElements = {}; // Container for all cached DOM elements

    this.initComponent(); // Initialize the picker
  }

  // OptionPicker prototype methods
  OptionPicker.prototype = {
    // Main initialization method
    initComponent: function () {
      // Construct the main HTML wrapper for the dual listbox
      this.wrapperDiv = $(`
        <div class="option-picker-widget-container">
          <div class="picker-pane left-pane">
            <label class="picker-label"></label>
            <span class="info-status-wrapper">
              <span class="status-display"></span>
              <button type="button" class="btn btn-clear-filter pull-right"></button>
            </span>
            <input class="search-input" type="text">
            <div class="btn-group action-buttons">
              <button type="button" class="btn btn-transfer-all" title="${this.currentConfig.moveAllItemsLabel}">
                <i class="icon-arrow-right-double"></i>
              </button>
              <button type="button" class="btn btn-transfer-single" title="${this.currentConfig.moveSingleLabel}">
                <i class="icon-arrow-right-single"></i>
              </button>
            </div>
            <select multiple="multiple"></select>
          </div>
          <div class="picker-pane right-pane">
            <label class="picker-label"></label>
            <span class="info-status-wrapper">
              <span class="status-display"></span>
              <button type="button" class="btn btn-clear-filter pull-right"></button>
            </span>
            <input class="search-input" type="text">
            <div class="btn-group action-buttons">
              <button type="button" class="btn btn-return-single" title="${this.currentConfig.removeSingleLabel}">
                <i class="icon-arrow-left-single"></i>
              </button>
              <button type="button" class="btn btn-return-all" title="${this.currentConfig.removeAllItemsLabel}">
                <i class="icon-arrow-left-double"></i>
              </button>
            </div>
            <select multiple="multiple"></select>
          </div>
        </div>
      `).insertBefore(this.targetElement);

      // Cache DOM elements for efficient access
      this.domElements = {
        originalSelect: this.targetElement,
        leftContainer: $('.left-pane', this.wrapperDiv),
        rightContainer: $('.right-pane', this.wrapperDiv),
        leftFilterInput: $('.left-pane .search-input', this.wrapperDiv),
        rightFilterInput: $('.right-pane .search-input', this.wrapperDiv),
        leftFilterClear: $('.left-pane .btn-clear-filter', this.wrapperDiv),
        rightFilterClear: $('.right-pane .btn-clear-filter', this.wrapperDiv),
        leftLabel: $('.left-pane > .picker-label', this.wrapperDiv),
        rightLabel: $('.right-pane > .picker-label', this.wrapperDiv),
        leftInfo: $('.left-pane .status-display', this.wrapperDiv),
        rightInfo: $('.right-pane .status-display', this.wrapperDiv),
        leftSelect: $('.left-pane select', this.wrapperDiv),
        rightSelect: $('.right-pane select', this.wrapperDiv),
        transferSelectedBtn: $('.left-pane .btn-transfer-single', this.wrapperDiv),
        returnSelectedBtn: $('.right-pane .btn-return-single', this.wrapperDiv),
        transferAllBtn: $('.left-pane .btn-transfer-all', this.wrapperDiv),
        returnAllBtn: $('.right-pane .btn-return-all', this.wrapperDiv),
        formHandle: $(this.domElements.leftFilterInput[0].form) // Get form reference from first filter input
      };

      // Set unique IDs for the actual select elements and link labels
      const originalSelectName = this.targetElement.attr('name') || 'unnamed_select';
      const leftSelectId = `${WIDGET_IDENTIFIER}-nonselected-${originalSelectName}`;
      const rightSelectId = `${WIDGET_IDENTIFIER}-selected-${originalSelectName}`;
      this.domElements.leftSelect.attr('id', leftSelectId);
      this.domElements.rightSelect.attr('id', rightSelectId);
      this.domElements.leftLabel.attr('for', leftSelectId);
      this.domElements.rightLabel.attr('for', rightSelectId);

      // Apply all initial settings via their respective setter methods
      this._applyAllSettings();

      // Initialize data attributes for all options
      initializeOptionMetadata(this);

      // Hide the original select element
      this.targetElement.hide();

      // Attach all event listeners
      attachEventHandlers(this);

      // Perform initial refresh to populate lists
      rebuildOptionContainers(this);

      return this.targetElement; // Return the original element for chaining
    },

    // Helper to apply all settings from the config object
    _applyAllSettings: function() {
      const config = this.currentConfig;
      this.setLegacySkin(config.enableLegacySkin);
      this.setClearFilterText(config.clearFilterLabel);
      this.setFilterPrompt(config.filterSearchPrompt);
      this.setMoveSingleLabel(config.moveSingleLabel);
      this.setMoveAllLabel(config.moveAllItemsLabel);
      this.setRemoveSingleLabel(config.removeSingleLabel);
      this.setRemoveAllLabel(config.removeAllItemsLabel);
      this.setAutoMoveOnSelect(config.autoMoveOnSelect); // This method handles its own refresh/rebind
      this.setMaintainSelectionOnTransfer(config.maintainSelectionOnTransfer);
      this.setRightListTitle(config.rightListTitle);
      this.setLeftListTitle(config.leftListTitle);
      this.setHiddenSelectSuffix(config.hiddenSelectSuffix);
      this.setMinimumOptionHeight(config.minimumOptionHeight);
      this.setDisplaySearchInputs(config.displaySearchInputs);
      this.setLeftPaneFilter(config.leftPaneFilter);
      this.setRightPaneFilter(config.rightPaneFilter);
      this.setStatusTextAll(config.statusTextAll);
      this.setStatusTextFiltered(config.statusTextFiltered);
      this.setStatusTextEmpty(config.statusTextEmpty);
      this.setSearchByOptionValue(config.searchByOptionValue);
    },

    // Refresh the picker view
    refreshView: function(resetSelections = false) {
      if (resetSelections) {
        this.targetElement.find('option').each(function() {
          $(this).data('current-selection', false);
          $(this).prop('selected', false); // Ensure original select is also reset
        });
        this.selectedItemsCount = 0; // Reset internal counter
      }
      rebuildOptionContainers(this); // Rebuild lists
      updateStatusDisplay(this); // Update info texts
      return this.targetElement;
    },

    // --- Setter methods for configuration options (renamed and slightly altered) ---
    setLegacySkin: function(value) {
      this.currentConfig.enableLegacySkin = value;
      const container = this.wrapperDiv;
      const leftPane = this.domElements.leftContainer;
      const rightPane = this.domElements.rightContainer;
      const clearBtns = container.find('.btn-clear-filter');
      const inputsAndSelects = container.find('input, select');
      const allBtns = container.find('.btn');
      const transferAllIcon = container.find('.btn-transfer-all > i');
      const transferSingleIcon = container.find('.btn-transfer-single > i');
      const returnAllIcon = container.find('.btn-return-all > i');
      const returnSingleIcon = container.find('.btn-return-single > i');

      if (value) {
        container.removeClass('row').addClass('row-fluid legacy-skin');
        leftPane.removeClass('col-md-6').addClass('span6');
        rightPane.removeClass('col-md-6').addClass('span6');
        clearBtns.removeClass('btn-default btn-xs').addClass('btn-mini');
        inputsAndSelects.removeClass('form-control');
        allBtns.removeClass('btn-default');
        transferAllIcon.removeClass('icon-arrow-right-double').addClass('icon-double-right-legacy');
        transferSingleIcon.removeClass('icon-arrow-right-single').addClass('icon-right-legacy');
        returnAllIcon.removeClass('icon-arrow-left-double').addClass('icon-double-left-legacy');
        returnSingleIcon.removeClass('icon-arrow-left-single').addClass('icon-left-legacy');
      } else {
        container.removeClass('row-fluid legacy-skin').addClass('row');
        leftPane.removeClass('span6').addClass('col-md-6');
        rightPane.removeClass('span6').addClass('col-md-6');
        clearBtns.removeClass('btn-mini').addClass('btn-default btn-xs');
        inputsAndSelects.addClass('form-control');
        allBtns.addClass('btn-default');
        transferAllIcon.removeClass('icon-double-right-legacy').addClass('icon-arrow-right-double');
        transferSingleIcon.removeClass('icon-right-legacy').addClass('icon-arrow-right-single');
        returnAllIcon.removeClass('icon-double-left-legacy').addClass('icon-arrow-left-double');
        returnSingleIcon.removeClass('icon-left-legacy').addClass('icon-arrow-left-single');
      }
      rebuildOptionContainers(this); // Always refresh after style changes
      return this.targetElement;
    },
    setClearFilterText: function(text) {
      this.currentConfig.clearFilterLabel = text;
      this.domElements.leftFilterClear.html(text);
      this.domElements.rightFilterClear.html(text);
      return this.targetElement;
    },
    setFilterPrompt: function(text) {
      this.currentConfig.filterSearchPrompt = text;
      this.domElements.leftFilterInput.attr('placeholder', text);
      this.domElements.rightFilterInput.attr('placeholder', text);
      return this.targetElement;
    },
    setMoveSingleLabel: function(text) {
      this.currentConfig.moveSingleLabel = text;
      this.domElements.transferSelectedBtn.attr('title', text);
      return this.targetElement;
    },
    setMoveAllLabel: function(text) {
      this.currentConfig.moveAllItemsLabel = text;
      this.domElements.transferAllBtn.attr('title', text);
      return this.targetElement;
    },
    setRemoveSingleLabel: function(text) {
      this.currentConfig.removeSingleLabel = text;
      this.domElements.returnSelectedBtn.attr('title', text);
      return this.targetElement;
    },
    setRemoveAllLabel: function(text) {
      this.currentConfig.removeAllItemsLabel = text;
      this.domElements.returnAllBtn.attr('title', text);
      return this.targetElement;
    },
    setAutoMoveOnSelect: function(value) {
      // Android bug workaround: always enable auto-move
      const actualValue = IS_ANDROID_SELECT_BUGGY ? true : value;
      this.currentConfig.autoMoveOnSelect = actualValue;

      // Re-bind change events based on the new setting
      this.domElements.leftSelect.off('change');
      this.domElements.rightSelect.off('change');
      if (actualValue) {
        this.domElements.leftSelect.on('change', () => transferSelected(this));
        this.domElements.rightSelect.on('change', () => returnSelected(this));
      }
      return this.targetElement;
    },
    setMaintainSelectionOnTransfer: function(value) {
      this.currentConfig.maintainSelectionOnTransfer = value;
      return this.targetElement;
    },
    setRightListTitle: function(text) {
      this.currentConfig.rightListTitle = text;
      if (text) {
        this.domElements.rightLabel.html(text);
        this.domElements.rightLabel.show();
      } else {
        this.domElements.rightLabel.hide();
      }
      return this.targetElement;
    },
    setLeftListTitle: function(text) {
      this.currentConfig.leftListTitle = text;
      if (text) {
        this.domElements.leftLabel.html(text);
        this.domElements.leftLabel.show();
      } else {
        this.domElements.leftLabel.hide();
      }
      return this.targetElement;
    },
    setHiddenSelectSuffix: function(value) {
      this.currentConfig.hiddenSelectSuffix = value;
      // This value is primarily used during initialization, no direct DOM update here
      return this.targetElement;
    },
    setMinimumOptionHeight: function(height) {
      this.currentConfig.minimumOptionHeight = height;
      const calculatedHeight = Math.max(height, 50); // Ensure a minimum sensible height
      this.domElements.leftSelect.css('min-height', `${calculatedHeight}px`);
      this.domElements.rightSelect.css('min-height', `${calculatedHeight}px`);
      return this.targetElement;
    },
    setDisplaySearchInputs: function(value) {
      this.currentConfig.displaySearchInputs = value;
      if (value) {
        this.domElements.leftFilterInput.show();
        this.domElements.rightFilterInput.show();
        this.domElements.leftFilterClear.show();
        this.domElements.rightFilterClear.show();
      } else {
        this.domElements.leftFilterInput.hide();
        this.domElements.rightFilterInput.hide();
        this.domElements.leftFilterClear.hide();
        this.domElements.rightFilterClear.hide();
      }
      rebuildOptionContainers(this); // Re-apply filters as visibility changes
      return this.targetElement;
    },
    setLeftPaneFilter: function(value) {
      this.currentConfig.leftPaneFilter = value;
      this.domElements.leftFilterInput.val(value);
      applyListFilter(this, 1);
      return this.targetElement;
    },
    setRightPaneFilter: function(value) {
      this.currentConfig.rightPaneFilter = value;
      this.domElements.rightFilterInput.val(value);
      applyListFilter(this, 2);
      return this.targetElement;
    },
    setStatusTextAll: function(text) {
      this.currentConfig.statusTextAll = text;
      updateStatusDisplay(this);
      return this.targetElement;
    },
    setStatusTextFiltered: function(text) {
      this.currentConfig.statusTextFiltered = text;
      updateStatusDisplay(this);
      return this.targetElement;
    },
    setStatusTextEmpty: function(text) {
      this.currentConfig.statusTextEmpty = text;
      updateStatusDisplay(this);
      return this.targetElement;
    },
    setSearchByOptionValue: function(value) {
      this.currentConfig.searchByOptionValue = value;
      rebuildOptionContainers(this); // Re-apply filters with new setting
      return this.targetElement;
    },

    // New public method: Get an array of selected option values
    getSelectionValues: function() {
      const selectedValues = [];
      this.targetElement.find('option:selected').each(function() {
        selectedValues.push($(this).val());
      });
      return selectedValues;
    },

    // New public method: Destroy the picker and revert to original select
    destroy: function() {
      this.wrapperDiv.remove(); // Remove the generated HTML
      this.targetElement.show(); // Show the original select
      this.targetElement.off(`${WIDGET_IDENTIFIER}.refresh`); // Remove custom event handler
      this.targetElement.removeData(WIDGET_IDENTIFIER); // Remove plugin instance data
      return this.targetElement;
    }
  };

  // jQuery plugin definition
  $.fn[WIDGET_IDENTIFIER] = function (optionParam) {
    const args = Array.prototype.slice.call(arguments, 1);
    let returnValue;

    this.each(function () {
      let $this = $(this);
      let data = $this.data(WIDGET_IDENTIFIER);
      const options = typeof optionParam === 'object' && optionParam;

      if (!data) {
        // Initialize new instance if not already present
        $this.data(WIDGET_IDENTIFIER, (data = new OptionPicker(this, options)));
      }

      if (typeof optionParam === 'string') {
        // Call a method on the plugin instance
        // Prevent calling private methods (starting with '_')
        if (typeof data[optionParam] === 'function' && optionParam.charAt(0) !== '_') {
          returnValue = data[optionParam].apply(data, args);
        } else {
          console.warn(`Method "${optionParam}" does not exist or is private on ${WIDGET_IDENTIFIER}.`);
        }
      } else if (optionParam === 'refresh') { // Special handling for 'refresh' for consistency
          data.refreshView.apply(data, args);
      }
    });

    // Return value for methods that return something (e.g., getSelectionValues)
    return (returnValue === undefined) ? this : returnValue;
  };

  // Set default configuration accessible via the plugin
  $.fn[WIDGET_IDENTIFIER].defaults = DEFAULT_CONFIG;

  // Make the constructor public for advanced usage
  $.fn[WIDGET_IDENTIFIER].Constructor = OptionPicker;

  // Add custom icon classes for legacy mode and custom badge style
  // This is a new fragment, providing more specific CSS class changes
  const styleEl = documentRef.createElement('style');
  styleEl.innerHTML = `
    .icon-arrow-right-double::before { content: "\\21D2"; } /* Right arrow with double head */
    .icon-arrow-right-single::before { content: "\\2192"; } /* Right arrow */
    .icon-arrow-left-double::before { content: "\\21D0"; } /* Left arrow with double head */
    .icon-arrow-left-single::before { content: "\\2190"; } /* Left arrow */
    /* Legacy mode icons (example, using different unicode or simple text) */
    .icon-double-right-legacy::before { content: ">>"; }
    .icon-right-legacy::before { content: ">"; }
    .icon-double-left-legacy::before { content: "<<"; }
    .icon-left-legacy::before { content: "<"; }
    .picker-alert-badge {
      display: inline-block;
      padding: .2em .6em .3em;
      font-size: 75%;
      font-weight: 700;
      line-height: 1;
      color: #fff;
      text-align: center;
      white-space: nowrap;
      vertical-align: baseline;
      border-radius: .25em;
      background-color: #f0ad4e; /* warning color */
    }
  `;
  documentRef.head.appendChild(styleEl);

})(jQuery, window, document);