// This is a dual selection component, version 3.0.1
// A responsive widget for managing two lists, built for Bootstrap. Works across modern browsers and touch devices.
// Project page: http://www.virtuosoft.eu/code/bootstrap-duallistbox/
// Author: István Ujj-Mészáros
// Licensed under the Apache License v2.0
;(function (jQ, wnd, doc, _undef) {

  // Establish default configuration once
  var moduleKey = 'multiSelectWidget', // Unique identifier for the jQuery plugin
    initialSettings = {
      legacyBootstrapMode: false,                                    // Compatibility with older Bootstrap versions (v2)
      filterClearText: 'display all',                                // Text for the filter clear button
      filterPrompt: 'Search items',                                  // Placeholder for filter input fields
      moveOneItemText: 'Transfer chosen',                            // Label for moving single items
      moveAllItemsText: 'Transfer all',                              // Label for moving all items
      removeOneItemText: 'Return chosen',                            // Label for returning single items
      removeAllItemsText: 'Return all',                              // Label for returning all items
      autoMoveOnPick: true,                                          // If true, items move automatically upon selection (always true on Android due to browser quirks)
      retainSelectionsAfterMove: false,                              // 'all' / 'shifted' / false: how to handle selection states after moving
      rightListCaption: false,                                       // Custom label for the selected items list (string or false)
      leftListCaption: false,                                        // Custom label for the unselected items list (string or false)
      auxiliaryElementNameSuffix: '_support',                        // Suffix for names of helper elements (e.g., input_support)
      minimumListHeight: 100,                                        // Minimum height for the select elements in pixels
      displayFilterFields: true,                                     // Controls visibility of filter input fields
      unselectedItemsFilter: '',                                     // Initial filter string for the unselected list
      selectedItemsFilter: '',                                       // Initial filter string for the selected list
      statusDisplayFormat: 'Showing {0} total options',              // Format for status message when all items are visible
      filteredStatusFormat: '<span class="label label-info">Filtered</span> {0} of {1} items shown', // Format for status message when items are filtered
      emptyListStatus: 'No items found',                             // Status message when a list is empty
      filterByOptionValues: false                                    // If true, filter will apply to option values as well as text content (boolean)
    },
    // Check for Android browser issues with select element styling
    // Specific issue: selections are invisible on Android if the containing select is styled with CSS.
    // Reference: http://code.google.com/p/android/issues/detail?id=16922
    androidBugDetected = /android/i.test(wnd.navigator.userAgent.toLowerCase());

  // The actual widget constructor function
  function MultiSelectWidget(hostElement, configData) {
    this.targetElement = jQ(hostElement);
    // jQ provides an extend method to merge object contents.
    // An empty object is typically used as the first argument to avoid modifying original defaults.
    this.currentSettings = jQ.extend({}, initialSettings, configData);
    this._initialSettings = initialSettings; // Keep a reference to the base configuration
    this._widgetIdentifier = moduleKey;      // Store the unique module key
    this.initialize();                       // Start the widget setup
  }

  // Dispatches a 'change' event on the original select element.
  function signalModification(managerObject) {
    managerObject.targetElement.trigger('change');
  }

  // Updates internal data attributes for each option to track original index and selection state.
  function synchronizeItemStatus(managerObject) {
    managerObject.targetElement.find('option').each(function(idx, optionElement) {
      var jQOption = jQ(optionElement);
      // Assign an initial position if not already present
      if (typeof(jQOption.data('initial-position')) === 'undefined') {
        jQOption.data('initial-position', managerObject.itemCounter++);
      }
      // Set a default internal selection state if not present
      if (typeof(jQOption.data('_chosen')) === 'undefined') {
        jQOption.data('_chosen', false);
      }
    });
  }

  // Modifies the selection property of an option based on its original index.
  function modifyChoiceState(managerObject, originalPosition, isChosen) {
    managerObject.targetElement.find('option').each(function(idx, optionElement) {
      var jQOption = jQ(optionElement);
      if (jQOption.data('initial-position') === originalPosition) {
        jQOption.prop('selected', isChosen); // Update the actual 'selected' property
      }
    });
  }

  // Replaces placeholders in a string with provided arguments.
  // Example: renderTextPattern('Hello {0}, {1}!', ['World', 'how are you?']) -> 'Hello World, how are you?!'
  function renderTextPattern(templateString, replacements) {
    return templateString.replace(/\{(\d+)\}/g, function(fullMatch, indexValue) {
      return typeof replacements[indexValue] !== _undef ? replacements[indexValue] : fullMatch;
    });
  }

  // Refreshes the information text displayed for each listbox.
  function rebuildStatusText(managerObject) {
    // Skip if info text is disabled in settings
    if (!managerObject.currentSettings.statusDisplayFormat) {
      return;
    }

    // Get counts for left list (unselected)
    var visibleCountOne = managerObject.domElements.choiceListA.find('option').length,
      visibleCountTwo = managerObject.domElements.choiceListB.find('option').length,
      // Total options not currently selected in the original list
      totalCountOne = managerObject.targetElement.find('option').length - managerObject.selectedItemCount,
      // Total options currently selected in the original list
      totalCountTwo = managerObject.selectedItemCount,
      displayContent = '';

    // Determine content for the left list's info area
    if (totalCountOne === 0) {
      displayContent = managerObject.currentSettings.emptyListStatus;
    } else if (visibleCountOne === totalCountOne) {
      displayContent = renderTextPattern(managerObject.currentSettings.statusDisplayFormat, [visibleCountOne, totalCountOne]);
    } else {
      displayContent = renderTextPattern(managerObject.currentSettings.filteredStatusFormat, [visibleCountOne, totalCountOne]);
    }

    managerObject.domElements.statusInfoA.html(displayContent);
    // Add/remove 'filtered' class based on filter state
    managerObject.domElements.sectionOne.toggleClass('filtered', !(visibleCountOne === totalCountOne || totalCountOne === 0));

    // Determine content for the right list's info area
    if (totalCountTwo === 0) {
      displayContent = managerObject.currentSettings.emptyListStatus;
    } else if (visibleCountTwo === totalCountTwo) {
      displayContent = renderTextPattern(managerObject.currentSettings.statusDisplayFormat, [visibleCountTwo, totalCountTwo]);
    } else {
      displayContent = renderTextPattern(managerObject.currentSettings.filteredStatusFormat, [visibleCountTwo, totalCountTwo]);
    }

    managerObject.domElements.statusInfoB.html(displayContent);
    // Add/remove 'filtered' class based on filter state
    managerObject.domElements.sectionTwo.toggleClass('filtered', !(visibleCountTwo === totalCountTwo || totalCountTwo === 0));
  }

  // Empties and repopulates the visible select elements based on the original select's state.
  function reconstructSelectors(managerObject) {
    managerObject.selectedItemCount = 0; // Reset selected item counter

    managerObject.domElements.choiceListA.empty(); // Clear left list
    managerObject.domElements.choiceListB.empty(); // Clear right list

    // Iterate through all options in the original select element
    managerObject.targetElement.find('option').each(function(idx, optionElement) {
      var jQOption = jQ(optionElement);
      if (jQOption.prop('selected')) {
        // If option is selected, add to right list
        managerObject.selectedItemCount++;
        managerObject.domElements.choiceListB.append(jQOption.clone(true).prop('selected', jQOption.data('_chosen')));
      } else {
        // Otherwise, add to left list
        managerObject.domElements.choiceListA.append(jQOption.clone(true).prop('selected', jQOption.data('_chosen')));
      }
    });

    // Apply filters if enabled
    if (managerObject.currentSettings.displayFilterFields) {
      applyFiltering(managerObject, 1); // Filter left list
      applyFiltering(managerObject, 2); // Filter right list
    }
    rebuildStatusText(managerObject); // Update status information
  }

  // Applies filtering to a specific listbox (1 for left, 2 for right).
  function applyFiltering(managerObject, listIdentifier) {
    // If filter inputs are not shown, filtering is disabled
    if (!managerObject.currentSettings.displayFilterFields) {
      return;
    }

    // Save current selections before applying filter
    persistOptionStates(managerObject, listIdentifier);

    // Clear the target list and reset scroll position
    managerObject.domElements['choiceList'+listIdentifier].empty().scrollTop(0);
    var filterRegex = new RegExp(jQ.trim(managerObject.domElements['filterField'+listIdentifier].val()), 'gi'),
      availableOptions = managerObject.targetElement;

    // Determine which options to filter based on list identifier
    if (listIdentifier === 1) {
      availableOptions = availableOptions.find('option').not(':selected'); // Unselected options for left list
    } else  {
      availableOptions = availableOptions.find('option:selected'); // Selected options for right list
    }

    // Iterate through options and append those that match the filter
    availableOptions.each(function(idx, optionElement) {
      var jQOption = jQ(optionElement),
        isCurrentlyFiltered = true; // Assume filtered until a match is found
      // Check if option text or value matches the filter regex
      if (optionElement.textContent.match(filterRegex) || (managerObject.currentSettings.filterByOptionValues && jQOption.attr('value').match(filterRegex) ) ) {
        isCurrentlyFiltered = false; // Not filtered if it matches
        managerObject.domElements['choiceList'+listIdentifier].append(jQOption.clone(true).prop('selected', jQOption.data('_chosen')));
      }
      // Update the 'filtered' data attribute on the original option
      managerObject.targetElement.find('option').eq(jQOption.data('initial-position')).data('isFiltered'+listIdentifier, isCurrentlyFiltered);
    });

    rebuildStatusText(managerObject); // Update status after filtering
  }

  // Persists the selection state of options from a visible listbox back to the original select element.
  function persistOptionStates(managerObject, listIdentifier) {
    managerObject.domElements['choiceList'+listIdentifier].find('option').each(function(idx, optionElement) {
      var jQOption = jQ(optionElement);
      // Update the '_chosen' data attribute on the corresponding original option
      managerObject.targetElement.find('option').eq(jQOption.data('initial-position')).data('_chosen', jQOption.prop('selected'));
    });
  }

  // Sorts options within a given select element based on their original index.
  function orderListItems(targetSelector) {
    targetSelector.find('option').sort(function(optionA, optionB) {
      return (jQ(optionA).data('initial-position') > jQ(optionB).data('initial-position')) ? 1 : -1;
    }).appendTo(targetSelector); // Re-append sorted options
  }

  // Clears all internal selection states (`_chosen` data attribute) for options in the first list.
  function unmarkAllItems(managerObject) {
    managerObject.domElements.choiceListA.find('option').each(function() {
      managerObject.targetElement.find('option').data('_chosen', false);
    });
  }

  // Transfers selected items from the left list to the right list.
  function transferSelected(managerObject) {
    // Handle selection preservation based on settings
    if (managerObject.currentSettings.retainSelectionsAfterMove === 'all' && !managerObject.currentSettings.autoMoveOnPick) {
      persistOptionStates(managerObject, 1);
      persistOptionStates(managerObject, 2);
    } else if (managerObject.currentSettings.retainSelectionsAfterMove === 'shifted' && !managerObject.currentSettings.autoMoveOnPick) {
      persistOptionStates(managerObject, 1);
    }

    // Mark selected options in the original list as chosen (selected)
    managerObject.domElements.choiceListA.find('option:selected').each(function(idx, optionElement) {
      var jQOption = jQ(optionElement);
      // Only move if not filtered out
      if (!jQOption.data('isFiltered1')) {
        modifyChoiceState(managerObject, jQOption.data('initial-position'), true);
      }
    });

    reconstructSelectors(managerObject); // Rebuild visible lists
    signalModification(managerObject);   // Trigger change event
    orderListItems(managerObject.domElements.choiceListB); // Sort the destination list
  }

  // Returns selected items from the right list to the left list.
  function returnChosenItems(managerObject) {
    // Handle selection preservation based on settings
    if (managerObject.currentSettings.retainSelectionsAfterMove === 'all' && !managerObject.currentSettings.autoMoveOnPick) {
      persistOptionStates(managerObject, 1);
      persistOptionStates(managerObject, 2);
    } else if (managerObject.currentSettings.retainSelectionsAfterMove === 'shifted' && !managerObject.currentSettings.autoMoveOnPick) {
      persistOptionStates(managerObject, 2);
    }

    // Mark selected options in the original list as unchosen (unselected)
    managerObject.domElements.choiceListB.find('option:selected').each(function(idx, optionElement) {
      var jQOption = jQ(optionElement);
      // Only return if not filtered out
      if (!jQOption.data('isFiltered2')) {
        modifyChoiceState(managerObject, jQOption.data('initial-position'), false);
      }
    });

    reconstructSelectors(managerObject); // Rebuild visible lists
    signalModification(managerObject);   // Trigger change event
    orderListItems(managerObject.domElements.choiceListA); // Sort the destination list
  }

  // Transfers all items from the left list to the right list.
  function transferAllItems(managerObject) {
    // Handle selection preservation based on settings
    if (managerObject.currentSettings.retainSelectionsAfterMove === 'all' && !managerObject.currentSettings.autoMoveOnPick) {
      persistOptionStates(managerObject, 1);
      persistOptionStates(managerObject, 2);
    } else if (managerObject.currentSettings.retainSelectionsAfterMove === 'shifted' && !managerObject.currentSettings.autoMoveOnPick) {
      persistOptionStates(managerObject, 1);
    }

    // Mark all options in the original list as selected, unless filtered
    managerObject.targetElement.find('option').each(function(idx, optionElement) {
      var jQOption = jQ(optionElement);
      if (!jQOption.data('isFiltered1')) {
        jQOption.prop('selected', true);
      }
    });

    reconstructSelectors(managerObject); // Rebuild visible lists
    signalModification(managerObject);   // Trigger change event
  }

  // Returns all items from the right list to the left list.
  function returnAllSelected(managerObject) {
    // Handle selection preservation based on settings
    if (managerObject.currentSettings.retainSelectionsAfterMove === 'all' && !managerObject.currentSettings.autoMoveOnPick) {
      persistOptionStates(managerObject, 1);
      persistOptionStates(managerObject, 2);
    } else if (managerObject.currentSettings.retainSelectionsAfterMove === 'shifted' && !managerObject.currentSettings.autoMoveOnPick) {
      persistOptionStates(managerObject, 2);
    }

    // Mark all options in the original list as unselected, unless filtered
    managerObject.targetElement.find('option').each(function(idx, optionElement) {
      var jQOption = jQ(optionElement);
      if (!jQOption.data('isFiltered2')) {
        jQOption.prop('selected', false);
      }
    });

    reconstructSelectors(managerObject); // Rebuild visible lists
    signalModification(managerObject);   // Trigger change event
  }

  // Attaches all necessary event listeners to the widget's DOM elements.
  function attachEventHandlers(managerObject) {
    // Prevent form submission if filter input is focused
    managerObject.domElements.parentForm.submit(function(evt) {
      if (managerObject.domElements.filterFieldA.is(':focus')) {
        evt.preventDefault();
        managerObject.domElements.filterFieldA.focusout();
      } else if (managerObject.domElements.filterFieldB.is(':focus')) {
        evt.preventDefault();
        managerObject.domElements.filterFieldB.focusout();
      }
    });

    // Custom event to trigger a refresh
    managerObject.targetElement.on('multiSelectWidget.refresh', function(evt, clearPreviousSelections) {
      managerObject.refresh(clearPreviousSelections);
    });

    // Event for clearing filter on list A
    managerObject.domElements.clearFilterBtnA.on('click', function() {
      managerObject.setUnpickedFilterValue('', true);
    });

    // Event for clearing filter on list B
    managerObject.domElements.clearFilterBtnB.on('click', function() {
      managerObject.setPickedFilterValue('', true);
    });

    // Event for moving selected items from A to B
    managerObject.domElements.moveBtn.on('click', function() {
      transferSelected(managerObject);
    });

    // Event for moving all items from A to B
    managerObject.domElements.moveAllBtn.on('click', function() {
      transferAllItems(managerObject);
    });

    // Event for returning selected items from B to A
    managerObject.domElements.removeBtn.on('click', function() {
      returnChosenItems(managerObject);
    });

    // Event for returning all items from B to A
    managerObject.domElements.removeAllBtn.on('click', function() {
      returnAllSelected(managerObject);
    });

    // Events for filter input on list A (change and keyup)
    managerObject.domElements.filterFieldA.on('change keyup', function() {
      applyFiltering(managerObject, 1);
    });

    // Events for filter input on list B (change and keyup)
    managerObject.domElements.filterFieldB.on('change keyup', function() {
      applyFiltering(managerObject, 2);
    });
  }

  MultiSelectWidget.prototype = {
    // Widget initialization method
    initialize: function () {
      // Inject the custom HTML structure into the DOM
      this.componentContainer = jQ('' +
        '<div class="multi-select-widget-wrapper">' +
        ' <div class="section-one-items">' +
        '   <label></label>' +
        '   <span class="status-info-area">' +
        '     <span class="status-text"></span>' +
        '     <button type="button" class="btn clear-filter-one pull-right"></button>' +
        '   </span>' +
        '   <input class="item-filter-field" type="text">' +
        '   <div class="btn-group action-buttons">' +
        '     <button type="button" class="btn transfer-all">' +
        '       <i></i>' + // First arrow icon
        '       <i></i>' + // Second arrow icon
        '     </button>' +
        '     <button type="button" class="btn transfer-one">' +
        '       <i></i>' + // Single arrow icon
        '     </button>' +
        '   </div>' +
        '   <select multiple="multiple"></select>' +
        ' </div>' +
        ' <div class="section-two-items">' +
        '   <label></label>' +
        '   <span class="status-info-area">' +
        '     <span class="status-text"></span>' +
        '     <button type="button" class="btn clear-filter-two pull-right"></button>' +
        '   </span>' +
        '   <input class="item-filter-field" type="text">' +
        '   <div class="btn-group action-buttons">' +
        '     <button type="button" class="btn return-one">' +
        '       <i></i>' + // Single arrow icon
        '     </button>' +
        '     <button type="button" class="btn return-all">' +
        '       <i></i>' + // First arrow icon
        '       <i></i>' + // Second arrow icon
        '     </button>' +
        '   </div>' +
        '   <select multiple="multiple"></select>' +
        ' </div>' +
        '</div>')
        .insertBefore(this.targetElement);

      // Store references to key DOM elements for quick access
      this.domElements = {
        sourceSelector: this.targetElement,
        sectionOne: jQ('.section-one-items', this.componentContainer),
        sectionTwo: jQ('.section-two-items', this.componentContainer),
        filterFieldA: jQ('.section-one-items .item-filter-field', this.componentContainer),
        filterFieldB: jQ('.section-two-items .item-filter-field', this.componentContainer),
        clearFilterBtnA: jQ('.section-one-items .clear-filter-one', this.componentContainer),
        clearFilterBtnB: jQ('.section-two-items .clear-filter-two', this.componentContainer),
        labelForA: jQ('.section-one-items > label', this.componentContainer),
        labelForB: jQ('.section-two-items > label', this.componentContainer),
        statusInfoA: jQ('.section-one-items .status-text', this.componentContainer),
        statusInfoB: jQ('.section-two-items .status-text', this.componentContainer),
        choiceListA: jQ('.section-one-items select', this.componentContainer),
        choiceListB: jQ('.section-two-items select', this.componentContainer),
        moveBtn: jQ('.section-one-items .transfer-one', this.componentContainer),
        removeBtn: jQ('.section-two-items .return-one', this.componentContainer),
        moveAllBtn: jQ('.section-one-items .transfer-all', this.componentContainer),
        removeAllBtn: jQ('.section-two-items .return-all', this.componentContainer),
        parentForm: jQ(jQ('.section-one-items .item-filter-field', this.componentContainer)[0].form) // Get the parent form
      };

      // Assign unique IDs to the helper select elements
      this.sourceSelectorName = this.targetElement.attr('name') || '';
      var listAIdentifier = 'multi-select-widget-unpicked-list_' + this.sourceSelectorName,
        listBIdentifier = 'multi-select-widget-picked-list_' + this.sourceSelectorName;
      this.domElements.choiceListA.attr('id', listAIdentifier);
      this.domElements.choiceListB.attr('id', listBIdentifier);
      this.domElements.labelForA.attr('for', listAIdentifier);
      this.domElements.labelForB.attr('for', listBIdentifier);

      // Initialize internal counters and apply all configuration settings
      this.selectedItemCount = 0; // Number of items currently marked as selected
      this.itemCounter = 0;       // Counter for assigning unique original indices
      this.setLegacyCompatibility(this.currentSettings.legacyBootstrapMode);
      this.setClearFilterText(this.currentSettings.filterClearText);
      this.setFilterPrompt(this.currentSettings.filterPrompt);
      this.setMoveOneLabel(this.currentSettings.moveOneItemText);
      this.setMoveAllText(this.currentSettings.moveAllItemsText);
      this.setRemoveOneLabel(this.currentSettings.removeOneItemText);
      this.setRemoveAllText(this.currentSettings.removeAllItemsText);
      this.setAutoMoveOnPick(this.currentSettings.autoMoveOnPick);
      this.setMaintainSelectionOnTransfer(this.currentSettings.retainSelectionsAfterMove);
      this.setPickedListCaption(this.currentSettings.rightListCaption);
      this.setUnpickedListCaption(this.currentSettings.leftListCaption);
      this.setAuxiliaryListNameSuffix(this.currentSettings.auxiliaryElementNameSuffix);
      this.setMinListHeight(this.currentSettings.minimumListHeight);

      synchronizeItemStatus(this); // Ensure all options have initial data states

      this.setDisplayFilterFields(this.currentSettings.displayFilterFields);
      this.setUnpickedFilterValue(this.currentSettings.unselectedItemsFilter);
      this.setPickedFilterValue(this.currentSettings.selectedItemsFilter);
      this.setStatusText(this.currentSettings.statusDisplayFormat);
      this.setFilteredStatusText(this.currentSettings.filteredStatusFormat);
      this.setEmptyStatusText(this.currentSettings.emptyListStatus);
      this.setFilterByValues(this.currentSettings.filterByOptionValues);

      // Hide the original <select> element as it's replaced by the widget
      this.targetElement.hide();

      attachEventHandlers(this);   // Bind all user interaction events
      reconstructSelectors(this);  // Populate the visible lists for the first time

      return this.targetElement; // Return the original element for chaining
    },

    // Configures Bootstrap 2 compatibility styling.
    setLegacyCompatibility: function(settingValue, shouldRefresh) {
      this.currentSettings.legacyBootstrapMode = settingValue;
      if (settingValue) {
        this.componentContainer.removeClass('row').addClass('row-fluid bs2compatible');
        this.componentContainer.find('.section-one-items, .section-two-items').removeClass('col-md-6').addClass('span6');
        this.componentContainer.find('.clear-filter-one, .clear-filter-two').removeClass('btn-default btn-xs').addClass('btn-mini');
        this.componentContainer.find('input, select').removeClass('form-control');
        this.componentContainer.find('.btn').removeClass('btn-default');
        this.componentContainer.find('.transfer-all > i, .transfer-one > i').removeClass('glyphicon glyphicon-arrow-right').addClass('icon-arrow-right');
        this.componentContainer.find('.return-all > i, .return-one > i').removeClass('glyphicon glyphicon-arrow-left').addClass('icon-arrow-left');
      } else {
        this.componentContainer.removeClass('row-fluid bs2compatible').addClass('row');
        this.componentContainer.find('.section-one-items, .section-two-items').removeClass('span6').addClass('col-md-6');
        this.componentContainer.find('.clear-filter-one, .clear-filter-two').removeClass('btn-mini').addClass('btn-default btn-xs');
        this.componentContainer.find('input, select').addClass('form-control');
        this.componentContainer.find('.btn').addClass('btn-default');
        this.componentContainer.find('.transfer-all > i, .transfer-one > i').removeClass('icon-arrow-right').addClass('glyphicon glyphicon-arrow-right');
        this.componentContainer.find('.return-all > i, .return-one > i').removeClass('icon-arrow-left').addClass('glyphicon glyphicon-arrow-left');
      }
      if (shouldRefresh) {
        reconstructSelectors(this); // Rebuild lists if requested
      }
      return this.targetElement;
    },

    // Sets the text for the filter clear buttons.
    setClearFilterText: function(settingValue, shouldRefresh) {
      this.currentSettings.filterClearText = settingValue;
      this.domElements.clearFilterBtnA.html(settingValue);
      this.domElements.clearFilterBtnB.html(settingValue);
      if (shouldRefresh) {
        reconstructSelectors(this);
      }
      return this.targetElement;
    },

    // Sets the placeholder text for the filter input fields.
    setFilterPrompt: function(settingValue, shouldRefresh) {
      this.currentSettings.filterPrompt = settingValue;
      this.domElements.filterFieldA.attr('placeholder', settingValue);
      this.domElements.filterFieldB.attr('placeholder', settingValue);
      if (shouldRefresh) {
        reconstructSelectors(this);
      }
      return this.targetElement;
    },

    // Sets the tooltip/label for the 'move selected' button.
    setMoveOneLabel: function(settingValue, shouldRefresh) {
      this.currentSettings.moveOneItemText = settingValue;
      this.domElements.moveBtn.attr('title', settingValue);
      if (shouldRefresh) {
        reconstructSelectors(this);
      }
      return this.targetElement;
    },

    // Sets the tooltip/label for the 'move all' button.
    setMoveAllText: function(settingValue, shouldRefresh) {
      this.currentSettings.moveAllItemsText = settingValue;
      this.domElements.moveAllBtn.attr('title', settingValue);
      if (shouldRefresh) {
        reconstructSelectors(this);
      }
      return this.targetElement;
    },

    // Sets the tooltip/label for the 'remove selected' button.
    setRemoveOneLabel: function(settingValue, shouldRefresh) {
      this.currentSettings.removeOneItemText = settingValue;
      this.domElements.removeBtn.attr('title', settingValue);
      if (shouldRefresh) {
        reconstructSelectors(this);
      }
      return this.targetElement;
    },

    // Sets the tooltip/label for the 'remove all' button.
    setRemoveAllText: function(settingValue, shouldRefresh) {
      this.currentSettings.removeAllItemsText = settingValue;
      this.domElements.removeAllBtn.attr('title', settingValue);
      if (shouldRefresh) {
        reconstructSelectors(this);
      }
      return this.targetElement;
    },

    // Sets whether items move automatically on selection.
    setAutoMoveOnPick: function(settingValue, shouldRefresh) {
      // Force auto-move on Android due to UI limitations
      if (androidBugDetected) {
        settingValue = true;
      }
      this.currentSettings.autoMoveOnPick = settingValue;
      if (settingValue) {
        this.componentContainer.addClass('auto-move-on-pick');
      } else {
        this.componentContainer.removeClass('auto-move-on-pick');
      }
      if (shouldRefresh) {
        reconstructSelectors(this);
      }
      return this.targetElement;
    },

    // Defines how selections are preserved when items are moved.
    setMaintainSelectionOnTransfer: function(settingValue, shouldRefresh) {
      this.currentSettings.retainSelectionsAfterMove = settingValue;
      if (shouldRefresh) {
        reconstructSelectors(this);
      }
      return this.targetElement;
    },

    // Sets the label for the right (selected) listbox.
    setPickedListCaption: function(settingValue, shouldRefresh) {
      this.currentSettings.rightListCaption = settingValue;
      if (settingValue) {
        this.domElements.labelForB.html(settingValue);
      } else {
        this.domElements.labelForB.empty();
      }
      if (shouldRefresh) {
        reconstructSelectors(this);
      }
      return this.targetElement;
    },

    // Sets the label for the left (unselected) listbox.
    setUnpickedListCaption: function(settingValue, shouldRefresh) {
      this.currentSettings.leftListCaption = settingValue;
      if (settingValue) {
        this.domElements.labelForA.html(settingValue);
      } else {
        this.domElements.labelForA.empty();
      }
      if (shouldRefresh) {
        reconstructSelectors(this);
      }
      return this.targetElement;
    },

    // Sets the postfix for the helper select element names.
    setAuxiliaryListNameSuffix: function(settingValue, shouldRefresh) {
      this.currentSettings.auxiliaryElementNameSuffix = settingValue;
      if (settingValue) {
        this.domElements.choiceListA.attr('name', this.sourceSelectorName + settingValue + '[]');
        this.domElements.choiceListB.attr('name', this.sourceSelectorName + settingValue + '[]');
      } else {
        this.domElements.choiceListA.removeAttr('name');
        this.domElements.choiceListB.removeAttr('name');
      }
      if (shouldRefresh) {
        reconstructSelectors(this);
      }
      return this.targetElement;
    },

    // Sets the minimum height for the listbox select elements.
    setMinListHeight: function(settingValue, shouldRefresh) {
      this.currentSettings.minimumListHeight = settingValue;
      this.domElements.choiceListA.css('height', settingValue + 'px');
      this.domElements.choiceListB.css('height', settingValue + 'px');
      if (shouldRefresh) {
        reconstructSelectors(this);
      }
      return this.targetElement;
    },

    // Shows or hides the filter input fields.
    setDisplayFilterFields: function(settingValue, shouldRefresh) {
      this.currentSettings.displayFilterFields = settingValue;
      if (settingValue) {
        this.domElements.filterFieldA.show();
        this.domElements.filterFieldB.show();
        this.domElements.clearFilterBtnA.show();
        this.domElements.clearFilterBtnB.show();
      } else {
        this.domElements.filterFieldA.hide();
        this.domElements.filterFieldB.hide();
        this.domElements.clearFilterBtnA.hide();
        this.domElements.clearFilterBtnB.hide();
      }
      if (shouldRefresh) {
        reconstructSelectors(this);
      }
      return this.targetElement;
    },

    // Sets the filter value for the unselected (left) list.
    setUnpickedFilterValue: function(settingValue, shouldRefresh) {
      this.currentSettings.unselectedItemsFilter = settingValue;
      this.domElements.filterFieldA.val(settingValue);
      if (shouldRefresh) {
        reconstructSelectors(this);
      }
      return this.targetElement;
    },

    // Sets the filter value for the selected (right) list.
    setPickedFilterValue: function(settingValue, shouldRefresh) {
      this.currentSettings.selectedItemsFilter = settingValue;
      this.domElements.filterFieldB.val(settingValue);
      if (shouldRefresh) {
        reconstructSelectors(this);
      }
      return this.targetElement;
    },

    // Sets the info text format for when all options are visible.
    setStatusText: function(settingValue, shouldRefresh) {
      this.currentSettings.statusDisplayFormat = settingValue;
      if (shouldRefresh) {
        reconstructSelectors(this);
      }
      return this.targetElement;
    },

    // Sets the info text format for when options are filtered.
    setFilteredStatusText: function(settingValue, shouldRefresh) {
      this.currentSettings.filteredStatusFormat = settingValue;
      if (shouldRefresh) {
        reconstructSelectors(this);
      }
      return this.targetElement;
    },

    // Sets the info text for an empty list.
    setEmptyStatusText: function(settingValue, shouldRefresh) {
      this.currentSettings.emptyListStatus = settingValue;
      if (shouldRefresh) {
        reconstructSelectors(this);
      }
      return this.targetElement;
    },

    // Sets whether filtering should also consider option values.
    setFilterByValues: function(settingValue, shouldRefresh) {
      this.currentSettings.filterByOptionValues = settingValue;
      if (shouldRefresh) {
        reconstructSelectors(this);
      }
      return this.targetElement;
    },

    // Refreshes the widget, optionally clearing all current selections.
    refresh: function(clearPreviousSelections) {
      if (clearPreviousSelections) {
        unmarkAllItems(this); // Clear internal selection states
      }
      reconstructSelectors(this); // Rebuild lists
      signalModification(this);   // Trigger change event
    },

    // Destroys the widget instance, restoring the original select element.
    destroy: function() {
      this.targetElement.show();            // Show the original select
      this.componentContainer.remove();     // Remove the widget's HTML
      jQ.data(this, 'plugin_' + moduleKey, null); // Remove plugin data
      return this.targetElement;
    }
  };

  // jQuery plugin definition
  jQ.fn[moduleKey] = function(configOptions) {
    var instanceArgs = arguments; // Store arguments for method calls

    // Iterate over each matched element
    if (configOptions === _undef || typeof configOptions === 'object') {
      return this.each(function() {
        // Only initialize if not already an instance
        if (!jQ.data(this, 'plugin_' + moduleKey)) {
          jQ.data(this, 'plugin_' + moduleKey, new MultiSelectWidget(this, configOptions));
        }
      });
    } else if (typeof configOptions === 'string' && configOptions[0] !== '_' && configOptions !== 'init') {
      var returnedValue;
      this.each(function() {
        var widgetInstance = jQ.data(this, 'plugin_' + moduleKey);
        if (widgetInstance instanceof MultiSelectWidget && typeof widgetInstance[configOptions] === 'function') {
          // Call method and store return value (only the last one for multiple elements)
          returnedValue = widgetInstance[configOptions].apply(widgetInstance, Array.prototype.slice.call(instanceArgs, 1));
        }
      });
      return returnedValue !== _undef ? returnedValue : this; // Return method result or jQuery object
    }
    return this; // Return jQuery object for chaining
  };

})(jQuery, window, document);