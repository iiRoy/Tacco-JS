/*
 * ========================================================================
 * itemgroup-display-manager.js v2.0.0
 * https://myproject.example.com/itemgroup-display-manager
 * ========================================================================
 * Copyright 2023 MyCompany, Inc.
 * Licensed under Apache 2.0 (https://www.apache.org/licenses/LICENSE-2.0)
 * ========================================================================
 */


+function ($) {
    "use strict";

    // Define some constant strings for CSS classes and data attributes
    const ACTIVE_CLASS = 'active-selection';
    const DISABLED_CLASS = 'ui-disabled';
    const HIDDEN_CLASS = 'visually-hidden';
    const ITEM_CLASS = 'group-item-display';
    const DATA_VALUE_ATTR = 'data-item-value';
    const DATA_TOGGLE_ATTR = 'data-selection-mode';
    const DEFAULT_TOGGLE_MODE = 'single'; // Default mode if not specified

    /**
     * Core logic for managing interactive item collections.
     * This class handles the display and interaction of a generic list of items.
     * @param {HTMLElement} domElementRef - The DOM element representing the list container.
     * @param {Object} configurationObject - Configuration settings for the item collection.
     */
    var ItemCollectionManager = function (domElementRef, configurationObject) {
        if (!domElementRef) {
            console.warn("ItemCollectionManager: No DOM element provided.");
            return;
        }
        this.$mainContainer = $(domElementRef);
        this.componentConfig = $.extend({}, ItemCollectionManager.DEFAULTS, configurationObject || {});
        this.initializeComponent();
    };

    // Default configuration options for the ItemCollectionManager
    ItemCollectionManager.DEFAULTS = {
        toggleMode: DEFAULT_TOGGLE_MODE, // Can be 'single' or 'multiple'
        onItemClick: null // Callback function for item clicks
    };

    /**
     * Initializes the component by setting up event handlers and attributes.
     */
    ItemCollectionManager.prototype.initializeComponent = function () {
        var selfReference = this; // Reference to the current instance
        var $mainContainer = this.$mainContainer;
        var componentConfig = this.componentConfig;

        // Set the data-selection-mode attribute if specified, otherwise use default
        $mainContainer.attr(DATA_TOGGLE_ATTR, componentConfig.toggleMode);

        // Attach a delegated click event listener to the main container
        // This handles clicks on individual items within the collection.
        $mainContainer.on('click.itemCollection', '.' + ITEM_CLASS, function (event) {
            var $triggeredItem = $(this); // The specific item that was clicked

            // Prevent default link behavior
            event.preventDefault();

            // Only proceed if the clicked item is not disabled
            if (!$triggeredItem.hasClass(DISABLED_CLASS)) {
                var currentToggleMode = $mainContainer.attr(DATA_TOGGLE_ATTR);

                if (currentToggleMode === 'multiple') {
                    // In 'multiple' selection mode, toggle the active state
                    $triggeredItem.toggleClass(ACTIVE_CLASS);
                } else {
                    // In 'single' selection mode, deactivate all other items first, then activate the clicked one
                    selfReference.deactivateItems('*'); // Deactivate all items
                    selfReference.activateItems($triggeredItem); // Activate the clicked item
                }

                // Execute the custom click handler if provided in the configuration
                if (typeof componentConfig.onItemClick === 'function') {
                    componentConfig.onItemClick.apply(this, [event]); // Pass event to handler
                }
            }

            // Remove focus from the clicked item to prevent outline
            $triggeredItem.blur();
        });
    };

    /**
     * Activates (marks as selected) one or more items in the collection.
     * @param {jQuery|string|string[]|null} selectionTarget - The item(s) to activate.
     *   Can be a jQuery object, a single data-item-value string, or an array of such strings.
     * @returns {ItemCollectionManager} - The current instance for chaining.
     */
    ItemCollectionManager.prototype.activateItems = function (selectionTarget) {
        if (!selectionTarget) {
            console.debug("ItemCollectionManager: No selection target provided for activation.");
            return this;
        }

        // If it's a jQuery object, directly add the active class
        if (selectionTarget.jquery) {
            selectionTarget.addClass(ACTIVE_CLASS);
            return this;
        }

        // Ensure selectionTarget is an array for consistent iteration
        let itemsToProcess = [];
        if (typeof selectionTarget === 'string') {
            itemsToProcess = [selectionTarget];
        } else if (Array.isArray(selectionTarget)) {
            itemsToProcess = selectionTarget;
        } else {
            console.warn("ItemCollectionManager: Invalid selection target type for activation.", selectionTarget);
            return this;
        }

        // Iterate through the array of values and activate corresponding items
        itemsToProcess.forEach(function (itemValue) {
            if (itemValue) { // Ensure itemValue is not empty or null
                this.$mainContainer
                    .find(`.${ITEM_CLASS}[${DATA_VALUE_ATTR}='${itemValue}']`)
                    .addClass(ACTIVE_CLASS);
            }
        }, this); // Pass 'this' as context for forEach

        return this;
    };

    /**
     * Deactivates (marks as unselected) items in the collection based on a filter.
     * @param {string} [exclusionFilter='*'] - A jQuery selector to filter which active items to deactivate.
     *   Defaults to '*' to deactivate all active items.
     * @returns {ItemCollectionManager} - The current instance for chaining.
     */
    ItemCollectionManager.prototype.deactivateItems = function (exclusionFilter) {
        const filterCriteria = exclusionFilter || '*'; // Use '*' if no filter is provided

        this.$mainContainer
            .find(`.${ITEM_CLASS}.${ACTIVE_CLASS}`) // Find all currently active items
            .filter(filterCriteria) // Apply the additional filter
            .removeClass(ACTIVE_CLASS); // Remove the active class

        return this;
    };


    /**
     * Component responsible for converting a standard HTML <select> element
     * into a visually enhanced interactive list, managed by ItemCollectionManager.
     * @param {HTMLElement} hostElement - The original <select> DOM element.
     * @param {Object} panelSettings - Configuration settings for the dropdown panel.
     */
    var DropdownPanel = function (hostElement, panelSettings) {
        if (!hostElement || hostElement.tagName.toLowerCase() !== 'select') {
            throw new Error("DropdownPanel: Host element must be a <select> element.");
        }
        this.$originalSelect = $(hostElement);
        this.panelSettings = panelSettings || {};
        this.$generatedListComponent = this.constructVisualComponent();
    };

    /**
     * Sets the selected values in the original <select> element and triggers a change event.
     * @param {jQuery|string[]|string|null} itemsToActivate - The value(s) to set as selected.
     *   Can be a jQuery object of options, an array of values, or a single value string.
     */
    DropdownPanel.prototype.setSelection = function (itemsToActivate) {
        let finalValues = [];

        if (itemsToActivate && itemsToActivate.jquery && itemsToActivate.is('option')) {
            // If jQuery object of options, extract their values
            finalValues = itemsToActivate.map(function () {
                return $(this).val();
            }).get(); // .get() converts jQuery collection to a plain array
        } else if (Array.isArray(itemsToActivate)) {
            finalValues = itemsToActivate;
        } else if (itemsToActivate !== null && itemsToActivate !== undefined) {
            finalValues = [itemsToActivate]; // Wrap single value in an array
        }

        // Set the value(s) on the original select element and trigger change
        this.$originalSelect.val(finalValues);
        this.$originalSelect.trigger('change');
    };

    /**
     * Removes specified values from the current selection of the original <select> element.
     * @param {string[]|string} itemsToDeactivate - The value(s) to remove from selection.
     */
    DropdownPanel.prototype.removeSelection = function (itemsToDeactivate) {
        let currentSelectedItems = this.$originalSelect.val();

        // Ensure currentSelectedItems is always an array for consistent processing
        if (!Array.isArray(currentSelectedItems)) {
            currentSelectedItems = (currentSelectedItems === null || currentSelectedItems === undefined) ? [] : [currentSelectedItems];
        }

        // Ensure itemsToDeactivate is always an array
        const valuesToRemove = Array.isArray(itemsToDeactivate) ? itemsToDeactivate : [itemsToDeactivate];

        // Filter out the items that need to be deactivated
        const updatedSelection = currentSelectedItems.filter(item => !valuesToRemove.includes(item));

        // Update the original select element's value and trigger change
        this.$originalSelect.val(updatedSelection);
        this.$originalSelect.trigger('change');
    };

    /**
     * Constructs the visual replacement for the <select> element, typically an <ul> with <a> items.
     * @returns {jQuery} The newly created jQuery object representing the visual component.
     */
    DropdownPanel.prototype.constructVisualComponent = function () {
        const $sourceSelectElement = this.$originalSelect;
        const $displayListContainer = $('<ul>').addClass('item-group-wrapper'); // Changed class name

        // Determine if the original select is 'multiple' and set the toggle mode accordingly
        const isMultipleSelection = $sourceSelectElement.prop('multiple');
        if (isMultipleSelection) {
            $displayListContainer.attr(DATA_TOGGLE_ATTR, 'multiple');
        } else {
            $displayListContainer.attr(DATA_TOGGLE_ATTR, DEFAULT_TOGGLE_MODE);
        }

        // Iterate over each <option> in the original <select> and create corresponding list items
        $sourceSelectElement.find('option').each(function (index, optionElement) {
            const $currentOption = $(optionElement);

            // Create a new anchor element to represent the list item
            const $listItemAnchor = $('<a>')
                .attr('role', 'listitem-link') // Add a role for accessibility/identification
                .addClass(ITEM_CLASS)
                .attr(DATA_VALUE_ATTR, $currentOption.val())
                .text($currentOption.text());

            // Apply disabled state if the original option is disabled
            if ($currentOption.is(':disabled')) {
                $listItemAnchor.addClass(DISABLED_CLASS);
            }

            // Apply hidden state if the original option is styled with display: none
            if ($currentOption.css('display') === 'none') {
                $listItemAnchor.addClass(HIDDEN_CLASS);
            }

            $displayListContainer.append($listItemAnchor); // Add the new item to the list container
        });

        // Attach a change event handler to the original select element.
        // This keeps the visual list synchronized with programmatic changes to the select.
        $sourceSelectElement.on('change.dropdownPanel', () => {
            const selectedValues = $sourceSelectElement.val();
            // Update the ItemCollectionManager instance to reflect the new selection
            $displayListContainer.itemGroupPlugin({
                deactivate: '*', // Deactivate all current selections
                activate: selectedValues // Activate the new selections
            });
        });

        // Initialize the ItemCollectionManager on the newly created visual list.
        // This binds the interaction logic to our custom list.
        $displayListContainer.itemGroupPlugin({
            activate: $sourceSelectElement.val(), // Initial selection based on the select element
            onItemClick: function () {
                const selectedValuesFromDisplay = [];
                // Collect values from all active items in the visual list
                $displayListContainer.find(`.${ITEM_CLASS}.${ACTIVE_CLASS}`).each(function () {
                    selectedValuesFromDisplay.push($(this).attr(DATA_VALUE_ATTR));
                });

                // Update the original select element with the new selection from the visual list
                // If only one item is selected and it's not a multiple select, pass a single value
                const finalSelectionForSelect = (!isMultipleSelection && selectedValuesFromDisplay.length === 1)
                    ? selectedValuesFromDisplay[0]
                    : selectedValuesFromDisplay;

                $sourceSelectElement.val(finalSelectionForSelect);
                $sourceSelectElement.trigger('change'); // Trigger change event on original select
            }
        });

        // Insert the new visual component before the original select element
        // and then hide the original select element.
        $sourceSelectElement.before($displayListContainer);
        $sourceSelectElement.hide();

        console.log("DropdownPanel: Visual component created and original select hidden.", $displayListContainer[0]); // Debugging

        return $displayListContainer;
    };


    // JQUERY PLUGIN DEFINITION
    // ======================================

    /**
     * jQuery plugin for managing item groups, either standalone or as a replacement for <select> elements.
     * @param {Object|string} pluginOptions - Configuration options or a method name to call.
     * @returns {jQuery} The jQuery object for chaining.
     */
    $.fn.itemGroupPlugin = function (pluginOptions) {
        return this.each(function (idx, currentDomElement) {
            const $elementRef = $(currentDomElement);
            let componentHandler = $elementRef.data('item.group.handler');

            // If no handler exists, create one based on the element type
            if (!componentHandler) {
                const isSelectElement = $elementRef.is('select');
                componentHandler = isSelectElement
                    ? new DropdownPanel(currentDomElement, pluginOptions)
                    : new ItemCollectionManager(currentDomElement, pluginOptions);
                $elementRef.data('item.group.handler', componentHandler); // Store the handler
            }

            // If options are provided, apply them
            if (pluginOptions && typeof pluginOptions === 'object') {
                if (pluginOptions.deactivate) {
                    // Check for specific deactivate method for DropdownPanel if applicable
                    if (componentHandler instanceof DropdownPanel && pluginOptions.deactivate !== '*') {
                        componentHandler.removeSelection(pluginOptions.deactivate);
                    } else if (componentHandler instanceof ItemCollectionManager) {
                        componentHandler.deactivateItems(pluginOptions.deactivate);
                    }
                }
                if (pluginOptions.activate) {
                    // Check for specific activate method for DropdownPanel if applicable
                    if (componentHandler instanceof DropdownPanel) {
                        componentHandler.setSelection(pluginOptions.activate);
                    } else if (componentHandler instanceof ItemCollectionManager) {
                        componentHandler.activateItems(pluginOptions.activate);
                    }
                }
            }
        });
    };

    // Auto-initialization on DOM ready for elements with the 'item-group-wrapper' class
    $(function () {
        $('.item-group-wrapper').itemGroupPlugin();
    });

}(jQuery);