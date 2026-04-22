/*
 * DualChoice v1.0.0 - A two-panel selection utility
 * Copyright (c) 2023 Your Name
 *
 * This utility is provided under the terms of the Unlicense.
 * For more details, refer to the Unlicense text or visit unlicense.org.
 *
 * It comes with absolutely no warranty, as permitted by law.
 * Feel free to use, modify, and distribute it for any purpose.
 */

!function (jQ) {

    "use strict";


    // DUALCHOICE WIDGET DEFINITION
    // ======================================

    var DualChoice = function (inputElement, configSettings) {
        // Store configuration options
        this.configSettings = configSettings;
        // Reference to the original select input
        this.originalInput = jQ(inputElement);
        // Main wrapper for the entire component
        this.mainWrapper = jQ('<div/>', { 'class': "dc-wrapper" });
        // Container for selectable options (left panel)
        this.leftPanel = jQ('<div/>', { 'class': 'dc-available' });
        // Container for selected options (right panel)
        this.rightPanel = jQ('<div/>', { 'class': 'dc-selected' });
        // Unordered list for selectable options
        this.leftList = jQ('<ul/>', { 'class': "dc-item-list", 'tabindex': '-1' });
        // Unordered list for selected options
        this.rightList = jQ('<ul/>', { 'class': "dc-item-list", 'tabindex': '-1' });
        // Tracks scroll position for keyboard navigation
        this.scrollPosition = 0;
        // Selector for visible, non-group, non-disabled list items
        this.itemFilter = 'li:visible:not(.dc-group-label,.dc-group-container,.' + configSettings.disabledClass + ')';
    };

    DualChoice.prototype = {
        // Assign the constructor back to the prototype
        initializer: DualChoice,

        // Component initialization method
        setupComponent: function () {
            var selfRef = this,
                sourceInput = this.originalInput;

            // Check if the component has already been initialized for this input
            if (sourceInput.next('.dc-wrapper').length === 0) {
                // Hide the original select element
                sourceInput.css({ position: 'absolute', left: '-9999px' });
                // Ensure the original select has an ID, generate if missing
                sourceInput.attr('id', sourceInput.attr('id') ? sourceInput.attr('id') : Math.ceil(Math.random() * 1000) + 'dualchoice');
                // Set an ID for the main wrapper based on the original input's ID
                this.mainWrapper.attr('id', 'dc-' + sourceInput.attr('id'));
                // Apply custom CSS class from options
                this.mainWrapper.addClass(selfRef.configSettings.cssClass);
                // Iterate over each option in the original select to build list items
                sourceInput.find('option').each(function () {
                    selfRef.buildListItemFromOption(this);
                });

                // Initially hide group labels in the right panel (selected items)
                this.rightList.find('.dc-group-label').hide();

                // Append custom header for the available items panel if provided
                if (selfRef.configSettings.selectableHeader) {
                    selfRef.leftPanel.append(selfRef.configSettings.selectableHeader);
                }
                // Append the available items list itself
                selfRef.leftPanel.append(selfRef.leftList);
                // Append custom footer for the available items panel if provided
                if (selfRef.configSettings.selectableFooter) {
                    selfRef.leftPanel.append(selfRef.configSettings.selectableFooter);
                }

                // Append custom header for the selected items panel if provided
                if (selfRef.configSettings.selectionHeader) {
                    selfRef.rightPanel.append(selfRef.configSettings.selectionHeader);
                }
                // Append the selected items list itself
                selfRef.rightPanel.append(selfRef.rightList);
                // Append custom footer for the selected items panel if provided
                if (selfRef.configSettings.selectionFooter) {
                    selfRef.rightPanel.append(selfRef.configSettings.selectionFooter);
                }

                // Assemble the main wrapper with both panels
                selfRef.mainWrapper.append(selfRef.leftPanel);
                selfRef.mainWrapper.append(selfRef.rightPanel);
                // Insert the main wrapper after the original select element
                sourceInput.after(selfRef.mainWrapper);

                // Enable mouse interaction for both lists
                selfRef.enableMouseInteractions(selfRef.leftList);
                selfRef.enableKeyboardNavigation(selfRef.leftList);

                // Determine the action type (click or double-click)
                var actionType = selfRef.configSettings.dblClick ? 'dblclick' : 'click';

                // Attach event handler for selecting items from the left list
                selfRef.leftList.on(actionType, '.dc-item-available', function () {
                    selfRef.selectItems(jQ(this).data('dc-val'));
                });
                // Attach event handler for deselecting items from the right list
                selfRef.rightList.on(actionType, '.dc-item-chosen', function () {
                    selfRef.deselectItems(jQ(this).data('dc-val'));
                });

                // Enable mouse and keyboard navigation for the selected items list
                selfRef.enableMouseInteractions(selfRef.rightList);
                selfRef.enableKeyboardNavigation(selfRef.rightList);

                // Focus the available list when the original select gains focus
                sourceInput.on('focus', function () {
                    selfRef.leftList.focus();
                })
            }

            // Get pre-selected values from the original select
            var preSelectedItems = sourceInput.find('option:selected').map(function () { return jQ(this).val(); }).get();
            // Select these items in the new component (initialization call)
            selfRef.selectItems(preSelectedItems, 'init');

            // Execute the afterInit callback if provided
            if (typeof selfRef.configSettings.afterInit === 'function') {
                selfRef.configSettings.afterInit.call(this, this.mainWrapper);
            }
        },

        // Creates list items (LI) for both panels from an HTML option element
        'buildListItemFromOption': function (itemOption, positionIdx, targetContainer) {
            var selfRef = this,
                sourceInput = selfRef.originalInput,
                htmlAttributes = "",
                jQueryOption = jQ(itemOption);

            // Extract non-value and non-disabled attributes
            for (var counter = 0; counter < itemOption.attributes.length; counter++) {
                var htmlAttr = itemOption.attributes[counter];

                if (htmlAttr.name !== 'value' && htmlAttr.name !== 'disabled') {
                    htmlAttributes += htmlAttr.name + '="' + htmlAttr.value + '" ';
                }
            }
            // Create the base list item structure
            var leftDisplayItem = jQ('<li ' + htmlAttributes + '><span>' + selfRef.sanitizeHtmlContent(jQueryOption.text()) + '</span></li>'),
                rightDisplayItem = leftDisplayItem.clone(), // Clone for the right panel
                itemValue = jQueryOption.val(),
                uniqueItemId = selfRef.generateHashId(itemValue); // Generate a unique ID from the value

            // Configure the item for the left (available) panel
            leftDisplayItem
                .data('dc-val', itemValue)
                .addClass('dc-item-available')
                .attr('id', uniqueItemId + '-available');

            // Configure the item for the right (selected) panel
            rightDisplayItem
                .data('dc-val', itemValue)
                .addClass('dc-item-chosen')
                .attr('id', uniqueItemId + '-chosen')
                .hide(); // Initially hidden

            // Apply disabled class if the option or the select element is disabled
            if (jQueryOption.prop('disabled') || sourceInput.prop('disabled')) {
                rightDisplayItem.addClass(selfRef.configSettings.disabledClass);
                leftDisplayItem.addClass(selfRef.configSettings.disabledClass);
            }

            // Check if the option belongs to an optgroup
            var optGroupElement = jQueryOption.parent('optgroup');

            if (optGroupElement.length > 0) {
                var groupLabelText = optGroupElement.attr('label'),
                    groupIdHash = selfRef.generateHashId(groupLabelText),
                    leftGroupContainer = selfRef.leftList.find('#group-available-' + groupIdHash),
                    rightGroupContainer = selfRef.rightList.find('#group-chosen-' + groupIdHash);

                // If optgroup containers don't exist yet, create them
                if (leftGroupContainer.length === 0) {
                    var groupContainerTemplate = '<li class="dc-group-container"></li>',
                        groupListTemplate = '<ul class="dc-group"><li class="dc-group-label"><span>' + groupLabelText + '</span></li></ul>';

                    leftGroupContainer = jQ(groupContainerTemplate);
                    rightGroupContainer = jQ(groupContainerTemplate);
                    leftGroupContainer.attr('id', 'group-available-' + groupIdHash);
                    rightGroupContainer.attr('id', 'group-chosen-' + groupIdHash);
                    leftGroupContainer.append(jQ(groupListTemplate));
                    rightGroupContainer.append(jQ(groupListTemplate));
                    // Add click handlers to group labels if enabled
                    if (selfRef.configSettings.selectableOptgroup) {
                        leftGroupContainer.find('.dc-group-label').on('click', function () {
                            var itemValues = optGroupElement.children(':not(:selected, :disabled)').map(function () { return jQ(this).val() }).get();
                            selfRef.selectItems(itemValues);
                        });
                        rightGroupContainer.find('.dc-group-label').on('click', function () {
                            var itemValues = optGroupElement.children(':selected:not(:disabled)').map(function () { return jQ(this).val() }).get();
                            selfRef.deselectItems(itemValues);
                        });
                    }
                    selfRef.leftList.append(leftGroupContainer);
                    selfRef.rightList.append(rightGroupContainer);
                }
                // Insert the list items into their respective optgroup lists
                positionIdx = positionIdx == undefined ? leftGroupContainer.find('ul').children().length : positionIdx + 1;
                leftDisplayItem.insertAt(positionIdx, leftGroupContainer.children());
                rightDisplayItem.insertAt(positionIdx, rightGroupContainer.children());
            } else {
                // If not in an optgroup, insert directly into the main lists
                positionIdx = positionIdx == undefined ? selfRef.leftList.children().length : positionIdx;

                leftDisplayItem.insertAt(positionIdx, selfRef.leftList);
                rightDisplayItem.insertAt(positionIdx, selfRef.rightList);
            }
        },

        // Adds new options to the original select and updates the component
        'addNewOption': function (newOptionSettings) {
            var selfRef = this;

            // Handle single option object vs. array of options
            if (newOptionSettings.value !== undefined && newOptionSettings.value !== null) {
                newOptionSettings = [newOptionSettings];
            }
            jQ.each(newOptionSettings, function (idx, optionData) {
                // Only add if value is defined and not already present
                if (optionData.value !== undefined && optionData.value !== null &&
                    selfRef.originalInput.find("option[value='" + optionData.value + "']").length === 0) {
                    var jQueryOption = jQ('<option value="' + optionData.value + '">' + optionData.text + '</option>'),
                        insertIndex = parseInt((typeof optionData.index === 'undefined' ? selfRef.originalInput.children().length : optionData.index)),
                        targetContainer = optionData.nested == undefined ? selfRef.originalInput : jQ("optgroup[label='" + optionData.nested + "']")

                    jQueryOption.insertAt(insertIndex, targetContainer);
                    selfRef.buildListItemFromOption(jQueryOption.get(0), insertIndex, optionData.nested);
                }
            })
        },

        // Escapes HTML entities in a string
        'sanitizeHtmlContent': function (rawText) {
            return jQ("<div>").text(rawText).html();
        },

        // Enables keyboard navigation for a given list
        'enableKeyboardNavigation': function (targetList) {
            var selfRef = this;

            targetList.on('focus', function () {
                jQ(this).addClass('dc-focused');
            })
                .on('blur', function () {
                    jQ(this).removeClass('dc-focused');
                })
                .on('keydown', function (eventObject) {
                    switch (eventObject.which) {
                        case 40: // Down arrow
                        case 38: // Up arrow
                            eventObject.preventDefault();
                            eventObject.stopPropagation();
                            selfRef.shiftHighlight(jQ(this), (eventObject.which === 38) ? -1 : 1);
                            return;
                        case 37: // Left arrow
                        case 39: // Right arrow
                            eventObject.preventDefault();
                            eventObject.stopPropagation();
                            selfRef.toggleActiveList(targetList);
                            return;
                        case 9: // Tab key
                            if (selfRef.originalInput.is('[tabindex]')) {
                                eventObject.preventDefault();
                                var tabSequence = parseInt(selfRef.originalInput.attr('tabindex'), 10);
                                tabSequence = (eventObject.shiftKey) ? tabSequence - 1 : tabSequence + 1;
                                jQ('[tabindex="' + (tabSequence) + '"]').focus();
                                return;
                            } else {
                                if (eventObject.shiftKey) {
                                    selfRef.originalInput.trigger('focus');
                                }
                            }
                    }
                    // Check if the key pressed is in the configured selection keys
                    if (jQ.inArray(eventObject.which, selfRef.configSettings.keySelect) > -1) {
                        eventObject.preventDefault();
                        eventObject.stopPropagation();
                        selfRef.performSelectionOnHighlighted(targetList);
                        return;
                    }
                });
        },

        // Moves the highlight up or down within a list
        'shiftHighlight': function (targetList, direction) {
            var listElements = targetList.find(this.itemFilter),
                currentElement = listElements.filter('.dc-hover').first(),
                nextElement = null,
                elementHeight = listElements.first().outerHeight(),
                panelHeight = targetList.height(),
                wrapperSelector = '#' + this.mainWrapper.prop('id'); // Not directly used, but kept for structural similarity

            listElements.removeClass('dc-hover');
            if (direction === 1) { // Moving DOWN
                nextElement = currentElement.nextAll(this.itemFilter).first();
                if (nextElement.length === 0) {
                    var groupUlElement = currentElement.parent();

                    if (groupUlElement.hasClass('dc-group')) {
                        var groupLiElement = groupUlElement.parent(),
                            nextGroupLi = groupLiElement.next(':visible');

                        if (nextGroupLi.length > 0) {
                            nextElement = nextGroupLi.find(this.itemFilter).first();
                        } else {
                            nextElement = listElements.first();
                        }
                    } else {
                        nextElement = listElements.first();
                    }
                }
            } else if (direction === -1) { // Moving UP
                nextElement = currentElement.prevAll(this.itemFilter).first();
                if (nextElement.length === 0) {
                    var groupUlElement = currentElement.parent();

                    if (groupUlElement.hasClass('dc-group')) {
                        var groupLiElement = groupUlElement.parent(),
                            prevGroupLi = groupLiElement.prev(':visible');

                        if (prevGroupLi.length > 0) {
                            nextElement = prevGroupLi.find(this.itemFilter).last();
                        } else {
                            nextElement = listElements.last();
                        }
                    } else {
                        nextElement = listElements.last();
                    }
                }
            }
            if (nextElement.length > 0) {
                nextElement.addClass('dc-hover');
                // Adjust scroll position to keep the highlighted element in view
                var scrollTarget = targetList.scrollTop() + nextElement.position().top -
                    panelHeight / 2 + elementHeight / 2;

                targetList.scrollTop(scrollTarget);
            }
        },

        // Selects or deselects the currently highlighted item
        'performSelectionOnHighlighted': function (targetList) {
            var listElements = targetList.find(this.itemFilter),
                highlightedItem = listElements.filter('.dc-hover').first();

            if (highlightedItem.length > 0) {
                if (targetList.parent().hasClass('dc-available')) {
                    this.selectItems(highlightedItem.data('dc-val'));
                } else {
                    this.deselectItems(highlightedItem.data('dc-val'));
                }
                listElements.removeClass('dc-hover'); // Clear highlight after action
            }
        },

        // Switches focus between the available and selected lists
        'toggleActiveList': function (activeList) {
            activeList.blur();
            this.mainWrapper.find(this.itemFilter).removeClass('dc-hover'); // Clear all highlights
            if (activeList.parent().hasClass('dc-available')) {
                this.rightList.focus();
            } else {
                this.leftList.focus();
            }
        },

        // Enables mouse hover interactions for list items
        'enableMouseInteractions': function (targetList) {
            var selfRef = this;

            // Mouse enter event for list items
            jQ('body').on('mouseenter', '.dc-item-available, .dc-item-chosen', function () {
                // Remove existing highlights in all lists within the same component
                jQ(this).parents('.dc-wrapper').find(selfRef.itemFilter).removeClass('dc-hover');
                // Add highlight to the current item
                jQ(this).addClass('dc-hover');
            });

            // Mouse leave event for list items
            jQ('body').on('mouseleave', '.dc-item-available, .dc-item-chosen', function () {
                // Remove highlight from all items in the component
                jQ(this).parents('.dc-wrapper').find(selfRef.itemFilter).removeClass('dc-hover');
            });
        },

        // Reinitializes the component (destroys and recreates)
        'reinitializeComponent': function () {
            this.removeComponent();
            this.originalInput.dualChoice(this.configSettings); // Use the new plugin name
        },

        // Removes the component and restores the original select
        'removeComponent': function () {
            jQ("#dc-" + this.originalInput.attr("id")).remove(); // Remove the wrapper
            this.originalInput.css('position', '').css('left', '') // Restore original CSS
            this.originalInput.removeData('dualchoice'); // Remove stored data
        },

        // Selects one or more items
        'selectItems': function (itemValue, callMethod) {
            // Ensure itemValue is an array
            if (typeof itemValue === 'string') { itemValue = [itemValue]; }

            var selfRef = this,
                sourceInput = this.originalInput,
                itemHashes = jQ.map(itemValue, function (val) { return (selfRef.generateHashId(val)); }),
                // Find selectable items based on their generated IDs, excluding disabled ones
                availableItems = this.leftList.find('#' + itemHashes.join('-available, #') + '-available').filter(':not(.' + selfRef.configSettings.disabledClass + ')'),
                // Find chosen items based on their generated IDs, excluding disabled ones
                chosenItems = this.rightList.find('#' + itemHashes.join('-chosen, #') + '-chosen').filter(':not(.' + selfRef.configSettings.disabledClass + ')'),
                // Find corresponding options in the original select element that are not disabled
                sourceOptions = sourceInput.find('option:not(:disabled)').filter(function () { return (jQ.inArray(this.value, itemValue) > -1); });

            // Special handling for initial setup to include all items, even disabled
            if (callMethod === 'init') {
                availableItems = this.leftList.find('#' + itemHashes.join('-available, #') + '-available'),
                    chosenItems = this.rightList.find('#' + itemHashes.join('-chosen, #') + '-chosen');
            }

            if (availableItems.length > 0) {
                // Mark available items as selected and hide them
                availableItems.addClass('dc-selected').hide();
                // Mark chosen items as selected and show them
                chosenItems.addClass('dc-selected').show();

                // Update the 'selected' property of the original options
                sourceOptions.prop('selected', true);

                // Clear any lingering hover states
                selfRef.mainWrapper.find(selfRef.itemFilter).removeClass('dc-hover');

                // Handle optgroups for the available items panel
                var availableGroups = selfRef.leftList.children('.dc-group-container');
                if (availableGroups.length > 0) {
                    availableGroups.each(function () {
                        var availableGroupItems = jQ(this).find('.dc-item-available');
                        // If all items in an optgroup are selected, hide its label
                        if (availableGroupItems.length === availableGroupItems.filter('.dc-selected').length) {
                            jQ(this).find('.dc-group-label').hide();
                        }
                    });

                    // Handle optgroups for the selected items panel
                    var chosenGroups = selfRef.rightList.children('.dc-group-container');
                    chosenGroups.each(function () {
                        var chosenGroupItems = jQ(this).find('.dc-item-chosen');
                        // If any items in an optgroup are selected, show its label
                        if (chosenGroupItems.filter('.dc-selected').length > 0) {
                            jQ(this).find('.dc-group-label').show();
                        }
                    });
                } else {
                    // If no optgroups and 'keepOrder' is enabled (and not during init)
                    if (selfRef.configSettings.keepOrder && callMethod !== 'init') {
                        var lastChosenItem = selfRef.rightList.find('.dc-selected');
                        // If there are multiple selected items and the last one isn't the current one, reorder
                        if ((lastChosenItem.length > 1) && (lastChosenItem.last().get(0) != chosenItems.get(0))) {
                            chosenItems.insertAfter(lastChosenItem.last());
                        }
                    }
                }
                // Trigger change event on original select, unless it's during init
                if (callMethod !== 'init') {
                    sourceInput.trigger('change');
                    // Execute afterSelect callback if provided
                    if (typeof selfRef.configSettings.afterSelect === 'function') {
                        selfRef.configSettings.afterSelect.call(this, itemValue);
                    }
                }
            }
        },

        // Deselects one or more items
        'deselectItems': function (itemValue) {
            // Ensure itemValue is an array
            if (typeof itemValue === 'string') { itemValue = [itemValue]; }

            var selfRef = this,
                sourceInput = this.originalInput,
                itemHashes = jQ.map(itemValue, function (val) { return (selfRef.generateHashId(val)); }),
                // Find selectable items
                availableItems = this.leftList.find('#' + itemHashes.join('-available, #') + '-available'),
                // Find selected items to deselect, excluding disabled ones
                chosenItems = this.rightList.find('#' + itemHashes.join('-chosen, #') + '-chosen').filter('.dc-selected').filter(':not(.' + selfRef.configSettings.disabledClass + ')'),
                // Find corresponding options in the original select element
                sourceOptions = sourceInput.find('option').filter(function () { return (jQ.inArray(this.value, itemValue) > -1); });

            if (chosenItems.length > 0) {
                // Mark selectable items as not selected and show them
                availableItems.removeClass('dc-selected').show();
                // Mark chosen items as not selected and hide them
                chosenItems.removeClass('dc-selected').hide();
                // Update the 'selected' property of the original options
                sourceOptions.prop('selected', false);

                // Clear any lingering hover states
                selfRef.mainWrapper.find(selfRef.itemFilter).removeClass('dc-hover');

                // Handle optgroups for the available items panel
                var availableGroups = selfRef.leftList.children('.dc-group-container');
                if (availableGroups.length > 0) {
                    availableGroups.each(function () {
                        var availableGroupItems = jQ(this).find('.dc-item-available');
                        // If any items in an optgroup are not selected, show its label
                        if (availableGroupItems.filter(':not(.dc-selected)').length > 0) {
                            jQ(this).find('.dc-group-label').show();
                        }
                    });

                    // Handle optgroups for the selected items panel
                    var chosenGroups = selfRef.rightList.children('.dc-group-container');
                    chosenGroups.each(function () {
                        var chosenGroupItems = jQ(this).find('.dc-item-chosen');
                        // If all items in an optgroup are deselected, hide its label
                        if (chosenGroupItems.filter('.dc-selected').length === 0) {
                            jQ(this).find('.dc-group-label').hide();
                        }
                    });
                }
                // Trigger change event on original select
                sourceInput.trigger('change');
                // Execute afterDeselect callback if provided
                if (typeof selfRef.configSettings.afterDeselect === 'function') {
                    selfRef.configSettings.afterDeselect.call(this, itemValue);
                }
            }
        },

        // Selects all available options
        'selectAllOptions': function () {
            var sourceInput = this.originalInput,
                currentValues = sourceInput.val(); // Get values before modification

            // Mark all non-disabled options as selected
            sourceInput.find('option:not(":disabled")').prop('selected', true);
            // Mark all available items as selected and hide them
            this.leftList.find('.dc-item-available').filter(':not(.' + this.configSettings.disabledClass + ')').addClass('dc-selected').hide();
            // Show all group labels in the selected panel
            this.rightList.find('.dc-group-label').show();
            // Hide all group labels in the available panel
            this.leftList.find('.dc-group-label').hide();
            // Mark all chosen items as selected and show them
            this.rightList.find('.dc-item-chosen').filter(':not(.' + this.configSettings.disabledClass + ')').addClass('dc-selected').show();
            this.rightList.focus(); // Focus the selected list
            sourceInput.trigger('change'); // Trigger change event
            // Execute afterSelect callback with newly selected values
            if (typeof this.configSettings.afterSelect === 'function') {
                var newlySelected = jQ.grep(sourceInput.val(), function (item) {
                    return jQ.inArray(item, currentValues) < 0;
                });
                this.configSettings.afterSelect.call(this, newlySelected);
            }
        },

        // Deselects all selected options
        'deselectAllOptions': function () {
            var sourceInput = this.originalInput,
                currentValues = sourceInput.val(); // Get values before modification

            // Mark all options as not selected
            sourceInput.find('option').prop('selected', false);
            // Mark all available items as not selected and show them
            this.leftList.find('.dc-item-available').removeClass('dc-selected').show();
            // Hide all group labels in the selected panel
            this.rightList.find('.dc-group-label').hide();
            // Show all group labels in the available panel
            this.leftList.find('.dc-group-label').show();
            // Mark all chosen items as not selected and hide them
            this.rightList.find('.dc-item-chosen').removeClass('dc-selected').hide();
            this.leftList.focus(); // Focus the available list
            sourceInput.trigger('change'); // Trigger change event
            // Execute afterDeselect callback with the deselected values
            if (typeof this.configSettings.afterDeselect === 'function') {
                this.configSettings.afterDeselect.call(this, currentValues);
            }
        },

        // Generates a simple hash ID for a given string value
        generateHashId: function (valString) {
            var computedHash = 0, idx, charValue;
            if (valString.length === 0) return computedHash;
            var len = 0;
            for (idx = 0, len = valString.length; idx < len; idx++) {
                charValue = valString.charCodeAt(idx);
                computedHash = ((computedHash << 5) - computedHash) + charValue;
                computedHash |= 0; // Convert to 32-bit integer
            }
            return computedHash;
        }
    };

    // JQUERY PLUGIN DEFINITION FOR DUALCHOICE
    // ======================================

    jQ.fn.dualChoice = function () {
        var pluginAction = arguments[0], // The method name or options object
            methodArgs = arguments;      // Remaining arguments

        return this.each(function () {
            var currentElement = jQ(this),
                instanceData = currentElement.data('dualchoice'),
                initialSettings = typeof pluginAction == 'object' && pluginAction;

            // If no instance exists, create a new one
            if (!instanceData) {
                currentElement.data('dualchoice', (instanceData = new DualChoice(this, initialSettings)));
            }

            // If the action is a string and represents a method
            if (typeof pluginAction == 'string') {
                instanceData[pluginAction](methodArgs[1], methodArgs[2]);
            }
            // If it's an initialization call (object or no args), perform setup
            else if (initialSettings) {
                instanceData.setupComponent();
            }
        });
    };

    // Default configuration options for the DualChoice plugin
    jQ.fn.dualChoice.defaults = {
        selectableHeader: false,        // Custom header for available items
        selectionHeader: false,         // Custom header for selected items
        selectableFooter: false,        // Custom footer for available items
        selectionFooter: false,         // Custom footer for selected items
        dblClick: false,                // Use double-click instead of single-click
        keepOrder: false,               // Maintain order of selected items
        cssClass: '',                   // Custom CSS class for the main wrapper
        disabledClass: 'dc-disabled',   // Class applied to disabled items
        selectableOptgroup: false,      // Allow clicking optgroup labels to select/deselect all
        keySelect: [32],                // Key codes to trigger selection (default: spacebar)
        afterInit: function () { },     // Callback after initialization
        afterSelect: function () { },   // Callback after item(s) selected
        afterDeselect: function () { }  // Callback after item(s) deselected
    };

    // Helper function to insert elements at a specific index
    jQ.fn.insertAt = function (positionIdx, parentElement) {
        return this.each(function () {
            if (positionIdx === 0) {
                parentElement.prepend(this);
            } else {
                jQ(parentElement.children().get(positionIdx - 1)).after(this);
            }
        });
    };

}(window.jQuery);