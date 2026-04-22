/*
 * DualListBox jQuery Widget v1.0.0
 * Copyright (c) 2024 Your Name/Organization
 *
 * This software is provided "as is", without warranty of any kind, express or implied,
 * including but not limited to the warranties of merchantability, fitness for a particular
 * purpose and non-infringement. In no event shall the authors or copyright holders be liable
 * for any claim, damages or other liability, whether in an action of contract, tort or
 * otherwise, arising from, out of or in connection with the software or the use or other
 * dealings in the software.
 */

; (function ($) {

  "use strict";

  // Define default settings for the widget
  const DEFAULT_WIDGET_SETTINGS = {
    disabledClass: 'dlb-disabled-item',
    cssClass: '',
    dblClick: false,
    keySelect: [32], // Spacebar key code
    selectableHeader: null,
    selectableFooter: null,
    selectionHeader: null,
    selectionFooter: null,
    selectableOptgroup: false,
    keepOrder: false,
    afterInit: null,
    afterSelect: null,
    afterDeselect: null
  };

  /* DUAL LIST BOX WIDGET CLASS DEFINITION
   * ===================================== */

  var DualListBoxWidget = function (targetElement, widgetSettings) {
    // Merge default settings with user-provided options
    this.widgetSettings = $.extend(true, {}, DEFAULT_WIDGET_SETTINGS, widgetSettings);

    this.$originalSelect = $(targetElement);
    this.$mainWrapper = $('<div/>', { 'class': "dlb-main-wrapper" });
    this.$availableItemsWrapper = $('<div/>', { 'class': 'dlb-available-pane' });
    this.$chosenItemsWrapper = $('<div/>', { 'class': 'dlb-chosen-pane' });
    this.$availableList = $('<ul/>', { 'class': "dlb-list", 'tabindex': '0' }); // Changed to 0 for accessibility
    this.$chosenList = $('<ul/>', { 'class': "dlb-list", 'tabindex': '0' }); // Changed to 0 for accessibility
    this.itemNodeSelector = `li:visible:not(.dlb-group-label,.dlb-group-container, .${this.widgetSettings.disabledClass})`;
  };

  DualListBoxWidget.prototype = {
    constructor: DualListBoxWidget,

    // Initializes the dual list box widget
    initialize: function () {
      const selfRef = this;
      const $sourceSelect = this.$originalSelect;

      // Prevent re-initialization if already set up
      if ($sourceSelect.data('dlb-initialized')) {
        console.warn('DualListBoxWidget: Widget already initialized for this element.');
        return;
      }

      // Hide the original select element and mark as initialized
      $sourceSelect.css({ position: 'absolute', left: '-9999px' }).data('dlb-initialized', true);

      // Ensure the original select has an ID for unique container generation
      const originalSelectId = $sourceSelect.attr('id') || `dlb-rand-${Math.ceil(Math.random() * 1000000)}`;
      $sourceSelect.attr('id', originalSelectId);
      this.$mainWrapper.attr('id', `dlb-wrapper-${originalSelectId}`);
      this.$mainWrapper.addClass(selfRef.widgetSettings.cssClass);

      // Populate lists from original select options
      $sourceSelect.find('option').each(function () {
        selfRef.createListItemFromOption(this);
      });

      // Initially hide all optgroup labels in the chosen list (they will show if items are selected)
      this.$chosenList.find('.dlb-group-label').hide();

      // Append headers and footers if provided in settings
      selfRef.appendOptionalContent(selfRef.$availableItemsWrapper, selfRef.widgetSettings.selectableHeader, 'header');
      selfRef.$availableItemsWrapper.append(selfRef.$availableList);
      selfRef.appendOptionalContent(selfRef.$availableItemsWrapper, selfRef.widgetSettings.selectableFooter, 'footer');

      selfRef.appendOptionalContent(selfRef.$chosenItemsWrapper, selfRef.widgetSettings.selectionHeader, 'header');
      selfRef.$chosenItemsWrapper.append(selfRef.$chosenList);
      selfRef.appendOptionalContent(selfRef.$chosenItemsWrapper, selfRef.widgetSettings.selectionFooter, 'footer');

      // Assemble the main wrapper
      selfRef.$mainWrapper.append(selfRef.$availableItemsWrapper);
      selfRef.$mainWrapper.append(selfRef.$chosenItemsWrapper);
      $sourceSelect.after(selfRef.$mainWrapper);

      // Enable interaction
      selfRef.enableMouseInteraction();
      selfRef.enableKeyboardNavigation(selfRef.$availableList);
      selfRef.enableKeyboardNavigation(selfRef.$chosenList);

      // Determine action type for list item clicks
      const itemActionType = selfRef.widgetSettings.dblClick ? 'dblclick' : 'click';

      // Event handlers for item selection/deselection
      selfRef.$availableList.on(itemActionType, '.dlb-item-available', function () {
        selfRef.transferToChosen($(this).data('dlb-value'));
      });
      selfRef.$chosenList.on(itemActionType, '.dlb-item-chosen', function () {
        selfRef.transferToAvailable($(this).data('dlb-value'));
      });

      // Focus original select element to transfer focus to the available list
      $sourceSelect.on('focus', function () {
        selfRef.$availableList.focus();
      });

      // Initial selection based on original select's pre-selected options
      const initialSelectedValues = $sourceSelect.find('option:selected').map(function () { return $(this).val(); }).get();
      if (initialSelectedValues.length > 0) {
        selfRef.transferToChosen(initialSelectedValues, 'initialization');
      }

      // Execute afterInit callback if provided
      if (typeof selfRef.widgetSettings.afterInit === 'function') {
        selfRef.widgetSettings.afterInit.call(this, this.$mainWrapper);
      }
    },

    // Helper to append header/footer content
    appendOptionalContent: function ($container, content, type) {
      if (content) {
        let $contentElement;
        if (typeof content === 'string') {
          $contentElement = $(content);
        } else if (typeof content === 'function') {
          $contentElement = $(content.call(this, $container));
        } else {
          $contentElement = content; // Assume it's already a jQuery object
        }
        $container.append($contentElement.addClass(`dlb-${type}-area`));
      }
    },

    // Generates list items from a given HTML option element
    createListItemFromOption: function (selectOption) {
      const selfRef = this;
      const $sourceSelect = selfRef.$originalSelect;
      const $currentOption = $(selectOption);

      if (!$currentOption.is('option')) {
        console.warn('DualListBoxWidget: Provided element is not an <option>.', selectOption);
        return;
      }

      let elementAttributes = "";
      // Extract custom attributes, excluding 'value' and 'disabled'
      Array.from(selectOption.attributes).forEach(attr => {
        if (attr.name !== 'value' && attr.name !== 'disabled') {
          elementAttributes += `${attr.name}="${attr.value}" `;
        }
      });

      const itemValue = $currentOption.val();
      const sanitizedId = selfRef.generateUniqueHashId(String(itemValue)); // Ensure value is string for hashing

      // Create base list item structure
      const $baseListItem = $(`<li ${elementAttributes}><span>${selfRef.sanitizeHtmlString($currentOption.text())}</span></li>`);

      const $availableItem = $baseListItem.clone()
        .data('dlb-value', itemValue)
        .addClass('dlb-item-available')
        .attr('id', `${sanitizedId}-available`);

      const $chosenItem = $baseListItem.clone()
        .data('dlb-value', itemValue)
        .addClass('dlb-item-chosen')
        .attr('id', `${sanitizedId}-chosen`)
        .hide(); // Hidden until selected

      // Apply disabled class if option or select is disabled
      if ($currentOption.prop('disabled') || $sourceSelect.prop('disabled')) {
        $chosenItem.addClass(selfRef.widgetSettings.disabledClass);
        $availableItem.addClass(selfRef.widgetSettings.disabledClass);
      }

      const $optionGroup = $currentOption.parent('optgroup');

      if ($optionGroup.length > 0) {
        const groupLabelText = $optionGroup.attr('label');
        const sanitizedGroupId = selfRef.generateUniqueHashId(groupLabelText);

        let $availableGroupContainer = selfRef.$availableList.find(`#dlb-group-available-${sanitizedGroupId}`);
        let $chosenGroupContainer = selfRef.$chosenList.find(`#dlb-group-chosen-${sanitizedGroupId}`);

        // Create optgroup containers if they don't exist
        if ($availableGroupContainer.length === 0) {
          const groupWrapperMarkup = '<li class="dlb-group-container"></li>';
          const groupListMarkup = `<ul class="dlb-group"><li class="dlb-group-label"><span>${selfRef.sanitizeHtmlString(groupLabelText)}</span></li></ul>`;

          $availableGroupContainer = $(groupWrapperMarkup).attr('id', `dlb-group-available-${sanitizedGroupId}`).append($(groupListMarkup));
          $chosenGroupContainer = $(groupWrapperMarkup).attr('id', `dlb-group-chosen-${sanitizedGroupId}`).append($(groupListMarkup));

          // Enable optgroup selection/deselection if setting is active
          if (selfRef.widgetSettings.selectableOptgroup) {
            $availableGroupContainer.find('.dlb-group-label').on('click', function () {
              const valuesToSelect = $optionGroup.children(':not(:selected, :disabled)').map((_, el) => $(el).val()).get();
              selfRef.transferToChosen(valuesToSelect);
            });
            $chosenGroupContainer.find('.dlb-group-label').on('click', function () {
              const valuesToDeselect = $optionGroup.children(':selected:not(:disabled)').map((_, el) => $(el).val()).get();
              selfRef.transferToAvailable(valuesToDeselect);
            });
          }
          selfRef.$availableList.append($availableGroupContainer);
          selfRef.$chosenList.append($chosenGroupContainer);
        }

        // Insert items into the correct optgroup list
        const $availableGroupItemsList = $availableGroupContainer.children('ul');
        const $chosenGroupItemsList = $chosenGroupContainer.children('ul');

        // Original logic for index was based on children length if undefined.
        // Let's make it more robust. If insertionIndex is provided, use it. Otherwise, append.
        const insertionIndex = $availableGroupItemsList.children().length; // Always append to end of group after label
        $availableItem.insertAt(insertionIndex, $availableGroupItemsList);
        $chosenItem.insertAt(insertionIndex, $chosenGroupItemsList);

      } else {
        // Insert items directly into the main list
        const insertionIndex = selfRef.$availableList.children().length; // Always append to end of list
        $availableItem.insertAt(insertionIndex, selfRef.$availableList);
        $chosenItem.insertAt(insertionIndex, selfRef.$chosenList);
      }
    },

    // Adds new options to the select element and updates the dual list box
    appendOption: function (optionsConfig) {
      const selfRef = this;

      // Ensure optionsConfig is an array for consistent processing
      const optionsArray = Array.isArray(optionsConfig) ? optionsConfig : [optionsConfig];

      optionsArray.forEach(function (optionData) {
        // Basic validation for option data
        if (!optionData || optionData.value === undefined || optionData.value === null) {
          console.warn('DualListBoxWidget: Invalid option data provided for appendOption.', optionData);
          return;
        }

        // Check for duplicate value to prevent adding the same option multiple times
        if (selfRef.$originalSelect.find(`option[value="${optionData.value}"]`).length > 0) {
          console.log(`DualListBoxWidget: Option with value "${optionData.value}" already exists. Skipping.`);
          return;
        }

        const $newOption = $(`<option value="${optionData.value}">${optionData.text || optionData.value}</option>`);
        if (optionData.disabled) {
          $newOption.prop('disabled', true);
        }

        // Determine insertion parent (optgroup or main select)
        let $insertionParent = selfRef.$originalSelect;
        if (optionData.nested && typeof optionData.nested === 'string') {
          const $targetOptgroup = selfRef.$originalSelect.find(`optgroup[label="${optionData.nested}"]`);
          if ($targetOptgroup.length === 0) {
            // Create optgroup if it doesn't exist
            $insertionParent = $(`<optgroup label="${optionData.nested}"></optgroup>`);
            selfRef.$originalSelect.append($insertionParent);
          } else {
            $insertionParent = $targetOptgroup;
          }
        }

        // Determine insertion index
        const actualIndex = (typeof optionData.index === 'number' && optionData.index >= 0)
          ? optionData.index
          : $insertionParent.children().length; // Append to end by default

        $newOption.insertAt(actualIndex, $insertionParent);
        selfRef.createListItemFromOption($newOption.get(0)); // Pass the DOM element
      });

      // Re-apply selections if needed (new options might be selected)
      const selectedValues = selfRef.$originalSelect.find('option:selected').map((_, el) => $(el).val()).get();
      selfRef.transferToChosen(selectedValues, 'refresh');
    },

    // Escapes HTML entities in a string
    sanitizeHtmlString: function (rawText) {
      // Create a temporary div, set its text, then get its HTML
      return $('<div>').text(rawText).html();
    },

    // Enables keyboard navigation for a given list
    enableKeyboardNavigation: function ($targetList) {
      const selfRef = this;
      const KEY_ARROW_DOWN = 40;
      const KEY_ARROW_UP = 38;
      const KEY_ARROW_LEFT = 37;
      const KEY_ARROW_RIGHT = 39;
      const KEY_TAB = 9;

      $targetList
        .on('focus', function () {
          $(this).addClass('dlb-focus-active');
        })
        .on('blur', function () {
          $(this).removeClass('dlb-focus-active');
          // Clear any active hover state on blur
          $(this).find(selfRef.itemNodeSelector).removeClass('dlb-hover-highlight');
        })
        .on('keydown', function (e) {
          const keyCode = e.which || e.keyCode; // Use e.which for cross-browser compatibility

          switch (keyCode) {
            case KEY_ARROW_DOWN:
            case KEY_ARROW_UP:
              e.preventDefault();
              e.stopPropagation();
              selfRef.shiftHighlight($(this), (keyCode === KEY_ARROW_UP) ? -1 : 1); // -1 for up, 1 for down
              return;
            case KEY_ARROW_LEFT:
            case KEY_ARROW_RIGHT:
              e.preventDefault();
              e.stopPropagation();
              selfRef.toggleActiveList($(this));
              return;
            case KEY_TAB:
              // Handle tab navigation to other form elements
              if (selfRef.$originalSelect.is('[tabindex]')) {
                e.preventDefault();
                const currentTabindex = parseInt(selfRef.$originalSelect.attr('tabindex'), 10);
                const nextTabindex = e.shiftKey ? currentTabindex - 1 : currentTabindex + 1;
                $(`[tabindex="${nextTabindex}"]`).focus();
                return;
              } else {
                // If no tabindex on original select, allow natural tab flow
                if (e.shiftKey) {
                  selfRef.$originalSelect.trigger('focus');
                }
              }
              return;
          }

          // Check for custom selection keys (e.g., Spacebar)
          if (selfRef.widgetSettings.keySelect.includes(keyCode)) {
            e.preventDefault();
            e.stopPropagation();
            selfRef.performSelectionViaHighlight($(this));
            return;
          }
        });
    },

    // Moves the highlight up or down in the list
    shiftHighlight: function ($currentList, moveDirection) {
      const $visibleItems = $currentList.find(this.itemNodeSelector);

      if ($visibleItems.length === 0) {
        return; // No items to highlight
      }

      let $currentHighlighted = $visibleItems.filter('.dlb-hover-highlight');
      let $nextHighlight = null;

      $visibleItems.removeClass('dlb-hover-highlight'); // Clear existing highlight

      if ($currentHighlighted.length === 0) {
        // If no item is highlighted, highlight the first or last visible item
        $nextHighlight = (moveDirection === 1) ? $visibleItems.first() : $visibleItems.last();
      } else if (moveDirection === 1) { // Moving DOWN
        $nextHighlight = $currentHighlighted.nextAll(this.itemNodeSelector).first();
        if ($nextHighlight.length === 0) {
          // Check for next optgroup
          const $parentGroupUl = $currentHighlighted.parent('ul.dlb-group');
          if ($parentGroupUl.length > 0) {
            const $parentGroupLi = $parentGroupUl.parent('.dlb-group-container');
            const $nextGroupLi = $parentGroupLi.nextAll('.dlb-group-container:visible').first();
            if ($nextGroupLi.length > 0) {
              $nextHighlight = $nextGroupLi.find(this.itemNodeSelector).first();
            } else {
              $nextHighlight = $visibleItems.first(); // Wrap around to the beginning
            }
          } else {
            $nextHighlight = $visibleItems.first(); // Wrap around to the beginning
          }
        }
      } else if (moveDirection === -1) { // Moving UP
        $nextHighlight = $currentHighlighted.prevAll(this.itemNodeSelector).first();
        if ($nextHighlight.length === 0) {
          // Check for previous optgroup
          const $parentGroupUl = $currentHighlighted.parent('ul.dlb-group');
          if ($parentGroupUl.length > 0) {
            const $parentGroupLi = $parentGroupUl.parent('.dlb-group-container');
            const $prevGroupLi = $parentGroupLi.prevAll('.dlb-group-container:visible').first();
            if ($prevGroupLi.length > 0) {
              $nextHighlight = $prevGroupLi.find(this.itemNodeSelector).last();
            } else {
              $nextHighlight = $visibleItems.last(); // Wrap around to the end
            }
          } else {
            $nextHighlight = $visibleItems.last(); // Wrap around to the end
          }
        }
      }

      if ($nextHighlight.length > 0) {
        $nextHighlight.addClass('dlb-hover-highlight');

        // Scroll into view if necessary
        const singleItemHeight = $nextHighlight.outerHeight();
        const listContainerHeight = $currentList.height();
        const itemTopPosition = $nextHighlight.position().top;
        const currentScroll = $currentList.scrollTop();

        // Calculate new scroll position to center the item
        const newScrollPosition = currentScroll + itemTopPosition - (listContainerHeight / 2) + (singleItemHeight / 2);

        $currentList.scrollTop(newScrollPosition);
      }
    },

    // Performs selection/deselection based on the currently highlighted item
    performSelectionViaHighlight: function ($currentList) {
      const $activeHighlightedItem = $currentList.find(this.itemNodeSelector).filter('.dlb-hover-highlight').first();

      if ($activeHighlightedItem.length > 0) {
        const itemValue = $activeHighlightedItem.data('dlb-value');
        if ($currentList.parent().hasClass('dlb-available-pane')) {
          this.transferToChosen(itemValue);
        } else {
          this.transferToAvailable(itemValue);
        }
        $activeHighlightedItem.removeClass('dlb-hover-highlight'); // Clear highlight after action
      }
    },

    // Switches focus between the available and chosen lists
    toggleActiveList: function ($currentList) {
      $currentList.blur();
      this.$mainWrapper.find(this.itemNodeSelector).removeClass('dlb-hover-highlight'); // Clear all highlights
      if ($currentList.parent().hasClass('dlb-available-pane')) {
        this.$chosenList.focus();
      } else {
        this.$availableList.focus();
      }
    },

    // Enables mouse interaction (hover) for list items
    enableMouseInteraction: function () {
      const selfRef = this;

      // Delegate mouseenter/mouseleave events to the main wrapper
      this.$mainWrapper
        .on('mouseenter', this.itemNodeSelector, function () {
          // Clear highlight from all items in both lists within this widget
          $(this).parents('.dlb-main-wrapper').find(selfRef.itemNodeSelector).removeClass('dlb-hover-highlight');
          $(this).addClass('dlb-hover-highlight');
        })
        .on('mouseleave', this.itemNodeSelector, function () {
          $(this).removeClass('dlb-hover-highlight');
        });
    },

    // Reinitializes the widget, useful after AJAX updates to the original select
    reinitializeWidget: function () {
      // Consider adding a confirmation prompt for destructive action (Type III addition)
      if (confirm('Reinitializing the widget will reset its state. Continue?')) {
        this.removeWidget();
        this.$originalSelect.dualListBox(this.widgetSettings); // Re-create with original settings
      }
    },

    // Destroys the widget, removing its UI and restoring the original select
    removeWidget: function () {
      const originalSelectId = this.$originalSelect.attr('id');
      if (!originalSelectId) {
        console.error('DualListBoxWidget: Cannot destroy, original select element has no ID.');
        return;
      }
      $(`#dlb-wrapper-${originalSelectId}`).remove();
      this.$originalSelect
        .css({ position: '', left: '' }) // Restore original CSS
        .removeData('duallistbox') // Remove plugin data
        .removeData('dlb-initialized'); // Remove initialization flag
    },

    // Transfers items from the available list to the chosen list
    transferToChosen: function (itemValues, callingContext) {
      // Ensure itemValues is an array
      const valuesToProcess = Array.isArray(itemValues) ? itemValues : [itemValues];

      if (valuesToProcess.length === 0) {
        return; // Nothing to transfer
      }

      const selfRef = this;
      const $sourceSelect = this.$originalSelect;
      const disabledClass = selfRef.widgetSettings.disabledClass;

      // Construct selectors for finding list items based on sanitized IDs
      const sanitizedIds = valuesToProcess.map(val => selfRef.generateUniqueHashId(String(val)));
      const availableItemSelector = sanitizedIds.map(id => `#${id}-available`).join(', ');
      const chosenItemSelector = sanitizedIds.map(id => `#${id}-chosen`).join(', ');

      const $availableItemsToProcess = this.$availableList.find(availableItemSelector).filter(`:not(.${disabledClass})`);
      const $chosenItemsToProcess = this.$chosenList.find(chosenItemSelector).filter(`:not(.${disabledClass})`);

      // Find corresponding options in the original select element
      const $correspondingOptions = $sourceSelect.find('option').filter(function () {
        return valuesToProcess.includes(this.value);
      });

      if ($availableItemsToProcess.length > 0) {
        $availableItemsToProcess.addClass('dlb-selected-item').hide();
        $chosenItemsToProcess.addClass('dlb-selected-item').show();
        $correspondingOptions.prop('selected', true);

        // Clear any active hover state across both lists
        selfRef.$mainWrapper.find(selfRef.itemNodeSelector).removeClass('dlb-hover-highlight');

        // Handle optgroup visibility after selection
        this.$availableList.children('.dlb-group-container').each(function () {
          const $groupAvailableItems = $(this).find('.dlb-item-available');
          // If all items in an optgroup are selected, hide its label in the available list
          if ($groupAvailableItems.length > 0 && $groupAvailableItems.length === $groupAvailableItems.filter('.dlb-selected-item').length) {
            $(this).find('.dlb-group-label').hide();
          }
        });

        this.$chosenList.children('.dlb-group-container').each(function () {
          const $groupChosenItems = $(this).find('.dlb-item-chosen');
          // If any item in an optgroup is selected, show its label in the chosen list
          if ($groupChosenItems.filter('.dlb-selected-item').length > 0) {
            $(this).find('.dlb-group-label').show();
          }
        });

        // Maintain order if enabled and not during initial setup
        if (selfRef.widgetSettings.keepOrder && callingContext !== 'initialization') {
          const $currentChosenItems = selfRef.$chosenList.find('.dlb-selected-item');
          if ($currentChosenItems.length > 1) {
            // Check if the newly chosen items are not already at the end
            const $lastChosen = $currentChosenItems.last();
            if ($lastChosen.length > 0 && $lastChosen.get(0) !== $chosenItemsToProcess.get(0)) {
              $chosenItemsToProcess.insertAfter($lastChosen);
            }
          }
        }

        // Trigger change event and afterSelect callback
        if (callingContext !== 'initialization') {
          $sourceSelect.trigger('change');
          if (typeof selfRef.widgetSettings.afterSelect === 'function') {
            selfRef.widgetSettings.afterSelect.call(this, valuesToProcess);
          }
        }
      }
    },

    // Transfers items from the chosen list back to the available list
    transferToAvailable: function (itemValues) {
      // Ensure itemValues is an array
      const valuesToProcess = Array.isArray(itemValues) ? itemValues : [itemValues];

      if (valuesToProcess.length === 0) {
        return; // Nothing to transfer
      }

      const selfRef = this;
      const $sourceSelect = this.$originalSelect;
      const disabledClass = selfRef.widgetSettings.disabledClass;

      // Construct selectors for finding list items based on sanitized IDs
      const sanitizedIds = valuesToProcess.map(val => selfRef.generateUniqueHashId(String(val)));
      const availableItemSelector = sanitizedIds.map(id => `#${id}-available`).join(', ');
      const chosenItemSelector = sanitizedIds.map(id => `#${id}-chosen`).join(', ');

      const $availableItemsToProcess = this.$availableList.find(availableItemSelector);
      const $chosenItemsToProcess = this.$chosenList.find(chosenItemSelector).filter('.dlb-selected-item').filter(`:not(.${disabledClass})`);

      // Find corresponding options in the original select element
      const $correspondingOptions = $sourceSelect.find('option').filter(function () {
        return valuesToProcess.includes(this.value);
      });

      if ($chosenItemsToProcess.length > 0) {
        $availableItemsToProcess.removeClass('dlb-selected-item').show();
        $chosenItemsToProcess.removeClass('dlb-selected-item').hide();
        $correspondingOptions.prop('selected', false);

        // Clear any active hover state across both lists
        selfRef.$mainWrapper.find(selfRef.itemNodeSelector).removeClass('dlb-hover-highlight');

        // Handle optgroup visibility after deselection
        this.$availableList.children('.dlb-group-container').each(function () {
          const $groupAvailableItems = $(this).find('.dlb-item-available');
          // If any item in an optgroup becomes available, show its label in the available list
          if ($groupAvailableItems.filter(':not(.dlb-selected-item)').length > 0) {
            $(this).find('.dlb-group-label').show();
          }
        });

        this.$chosenList.children('.dlb-group-container').each(function () {
          const $groupChosenItems = $(this).find('.dlb-item-chosen');
          // If all items in an optgroup are deselected, hide its label in the chosen list
          if ($groupChosenItems.filter('.dlb-selected-item').length === 0) {
            $(this).find('.dlb-group-label').hide();
          }
        });

        // Trigger change event and afterDeselect callback
        $sourceSelect.trigger('change');
        if (typeof selfRef.widgetSettings.afterDeselect === 'function') {
          selfRef.widgetSettings.afterDeselect.call(this, valuesToProcess);
        }
      }
    },

    // Transfers all available items to the chosen list
    transferAllToChosen: function () {
      const selfRef = this;
      const $sourceSelect = this.$originalSelect;
      const previousSelectedValues = $sourceSelect.val() || []; // Get currently selected values

      // Select all non-disabled options in the original select
      $sourceSelect.find('option:not(:disabled)').prop('selected', true);

      // Visually update the list items
      this.$availableList.find(`.dlb-item-available:not(.${this.widgetSettings.disabledClass})`).addClass('dlb-selected-item').hide();
      this.$chosenList.find(`.dlb-item-chosen:not(.${this.widgetSettings.disabledClass})`).addClass('dlb-selected-item').show();

      // Update optgroup label visibility
      this.$chosenList.find('.dlb-group-label').show(); // All chosen labels visible
      this.$availableList.find('.dlb-group-label').hide(); // All available labels hidden

      this.$chosenList.focus(); // Set focus to the chosen list

      $sourceSelect.trigger('change'); // Trigger change event

      // Call afterSelect for newly selected items
      if (typeof this.widgetSettings.afterSelect === 'function') {
        const newlySelectedValues = $sourceSelect.val().filter(val => !previousSelectedValues.includes(val));
        if (newlySelectedValues.length > 0) {
          this.widgetSettings.afterSelect.call(this, newlySelectedValues);
        }
      }
    },

    // Transfers all chosen items back to the available list
    transferAllToAvailable: function () {
      const selfRef = this;
      const $sourceSelect = this.$originalSelect;
      const previouslySelectedValues = $sourceSelect.val() || []; // Get currently selected values

      // Deselect all options in the original select
      $sourceSelect.find('option').prop('selected', false);

      // Visually update the list items
      this.$availableList.find('.dlb-item-available').removeClass('dlb-selected-item').show();
      this.$chosenList.find('.dlb-item-chosen').removeClass('dlb-selected-item').hide();

      // Update optgroup label visibility
      this.$chosenList.find('.dlb-group-label').hide(); // All chosen labels hidden
      this.$availableList.find('.dlb-group-label').show(); // All available labels visible

      this.$availableList.focus(); // Set focus to the available list

      $sourceSelect.trigger('change'); // Trigger change event

      // Call afterDeselect for all previously selected items
      if (typeof this.widgetSettings.afterDeselect === 'function' && previouslySelectedValues.length > 0) {
        this.widgetSettings.afterDeselect.call(this, previouslySelectedValues);
      }
    },

    // Generates a simple hash from a string to use as a unique ID
    generateUniqueHashId: function (inputString) {
      let computedHash = 0;
      if (!inputString || inputString.length === 0) return `dlb_empty_${computedHash}`; // Handle empty string

      // A simple, non-cryptographic hash function
      for (let i = 0; i < inputString.length; i++) {
        const charValue = inputString.charCodeAt(i);
        computedHash = (computedHash << 7) - computedHash + charValue; // Stronger shift than original
        computedHash |= 0; // Convert to 32bit integer
      }
      return `dlb_hash_${Math.abs(computedHash)}`; // Prefix and absolute value to ensure valid ID
    }
  };

  /* JQUERY PLUGIN DEFINITION
   * ======================== */

  // Custom jQuery method to insert an element at a specific index
  $.fn.insertAt = function (index, $parent) {
    if (typeof index === 'number' && index >= 0) {
      const $children = $parent.children();
      if (index >= $children.length) {
        $parent.append(this);
      } else {
        $children.eq(index).before(this);
      }
    } else {
      $parent.append(this); // Default to append if index is invalid
    }
    return this;
  };

  $.fn.dualListBox = function (actionOrOptions) {
    const methodArguments = Array.prototype.slice.call(arguments, 1); // Get all args except the first

    return this.each(function () {
      const $targetElement = $(this);
      let widgetInstance = $targetElement.data('duallistbox');

      // If no instance, create one
      if (!widgetInstance) {
        // If first argument is an object, it's options for initialization
        if (typeof actionOrOptions === 'object' || !actionOrOptions) {
          widgetInstance = new DualListBoxWidget(this, actionOrOptions);
          $targetElement.data('duallistbox', widgetInstance);
          widgetInstance.initialize();
        } else {
          // If first argument is a string but no instance, it's an error
          $.error(`Method ${actionOrOptions} cannot be called before initialization of DualListBoxWidget`);
        }
      } else if (typeof actionOrOptions === 'string') {
        // If instance exists and first argument is a string, attempt to call a method
        if (typeof widgetInstance[actionOrOptions] === 'function') {
          widgetInstance[actionOrOptions].apply(widgetInstance, methodArguments);
        } else {
          $.error(`Method ${actionOrOptions} does not exist on DualListBoxWidget`);
        }
      }
      // If instance exists and actionOrOptions is an object, it means re-initialization
      // which is handled by the reinitializeWidget method if explicitly called.
      // Otherwise, ignore repeated initialization calls with options.
    });
  };

  // Set default options directly on the plugin function
  $.fn.dualListBox.defaults = DEFAULT_WIDGET_SETTINGS;

}(window.jQuery));