/**
 * Enhanced Dropdown Selector (https://github.com/your-repo/enhanced-dropdown-selector)
 *
 * This code is derived from the Bootstrap Multiselect project.
 * Original License Information:
 * Apache License, Version 2.0:
 * Copyright (c) 2012 - 2015 David Stutz
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a
 * copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * BSD 3-Clause License:
 * Copyright (c) 2012 - 2015 David Stutz
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *    - Redistributions of source code must retain the above copyright notice,
 *      this list of conditions and the following disclaimer.
 *    - Redistributions in binary form must reproduce the above copyright notice,
 *      this list of conditions and the following disclaimer in the documentation
 *      and/or other materials provided with the distribution.
 *    - Neither the name of David Stutz nor the names of its contributors may be
 *      used to endorse or promote products derived from this software without
 *      specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 * OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
(function ($) {
    "use strict"; // Strict mode for clean JS.

    // Knockout.js binding integration
    if (typeof ko !== 'undefined' && ko.bindingHandlers && !ko.bindingHandlers.dropdownSelector) {
        ko.bindingHandlers.dropdownSelector = {
            after: ['options', 'value', 'selectedOptions'],

            init: function (boundElement, valAccessor, allBoundProps, vmContext, bindContext) {
                const elementWrapper = $(boundElement);
                const configSettings = ko.toJS(valAccessor());

                elementWrapper.dropdownSelector(configSettings);

                // Handle 'options' changes
                if (allBoundProps.has('options')) {
                    const optionsSource = allBoundProps.get('options');
                    if (ko.isObservable(optionsSource)) {
                        ko.computed(function () {
                            optionsSource(); // Subscribe to changes
                            // Defer the rebuild to allow KO to update the DOM first
                            Promise.resolve().then(() => {
                                const componentInstance = elementWrapper.data('dropdownSelector');
                                if (componentInstance) {
                                    componentInstance.refreshSourceOptions(); // Update internal state if necessary
                                    elementWrapper.dropdownSelector('reconstruct');
                                }
                            });
                        }, null, { disposeWhenNodeIsRemoved: boundElement });
                    }
                }

                // Handle 'value' changes (for single select)
                if (allBoundProps.has('value')) {
                    const valueSource = allBoundProps.get('value');
                    if (ko.isObservable(valueSource)) {
                        ko.computed(function () {
                            valueSource(); // Subscribe to changes
                            Promise.resolve().then(() => {
                                elementWrapper.dropdownSelector('updateDisplayedSelection');
                            });
                        }, null, { disposeWhenNodeIsRemoved: boundElement })
                            .extend({ rateLimit: 150, notifyWhenChangesStop: true });
                    }
                }

                // Handle 'selectedOptions' changes (for multi-select)
                if (allBoundProps.has('selectedOptions')) {
                    const selectedOptionsSource = allBoundProps.get('selectedOptions');
                    if (ko.isObservable(selectedOptionsSource)) {
                        ko.computed(function () {
                            selectedOptionsSource(); // Subscribe to changes
                            Promise.resolve().then(() => {
                                elementWrapper.dropdownSelector('updateDisplayedSelection');
                            });
                        }, null, { disposeWhenNodeIsRemoved: boundElement })
                            .extend({ rateLimit: 150, notifyWhenChangesStop: true });
                    }
                }

                // Cleanup on element removal
                ko.utils.domNodeDisposal.addDisposeCallback(boundElement, function () {
                    elementWrapper.dropdownSelector('dispose');
                });
            },

            update: function (boundElement, valAccessor, allBoundProps, vmContext, bindContext) {
                const elementWrapper = $(boundElement);
                const newConfig = ko.toJS(valAccessor());

                elementWrapper.dropdownSelector('configureOptions', newConfig);
                elementWrapper.dropdownSelector('reconstruct');
            }
        };
    }

    /**
     * Utility function to iterate over an array-like structure.
     * @param {Array<any>} sourceArray The array or array-like object to iterate over.
     * @param {function(any, number): void} processingCallback The function to call for each item.
     */
    function processArrayItems(sourceArray, processingCallback) {
        if (!Array.isArray(sourceArray)) {
            // Attempt to convert NodeList/HTMLCollection to array
            sourceArray = Array.from(sourceArray);
        }
        for (let idx = 0; idx < sourceArray.length; ++idx) {
            processingCallback(sourceArray[idx], idx);
        }
    }

    /**
     * Constructor for the DropdownSelector component.
     * Manages a <select> element and transforms it into a styled dropdown.
     *
     * @param {jQuery} hostSelect The jQuery wrapped <select> element.
     * @param {object} componentSettings Configuration options for the selector.
     * @returns {DropdownSelector} The instance of the selector component.
     */
    function DropdownSelector(hostSelect, componentSettings) {
        this.hostElement = $(hostSelect);

        // Merge default settings with provided and data attributes.
        this.componentSettings = this.combineSettings(
            $.extend({}, componentSettings, this.hostElement.data())
        );

        // Store a deep copy of the original options for rebuilds.
        // Using a modern approach to clone options.
        this.initialOptionsState = Array.from(this.hostElement[0].options).map(opt => opt.cloneNode(true));

        this.currentSearchQuery = '';
        this.searchDelayTimer = null;
        this.lastInputInteraction = null; // Tracks the last checkbox toggled.

        this.componentSettings.isMultiSelect = this.hostElement.prop('multiple') === true;

        // Bind event handlers to the current instance context.
        this.componentSettings.onSelectionChange = this.componentSettings.onSelectionChange.bind(this);
        this.componentSettings.onDropdownOpening = this.componentSettings.onDropdownOpening.bind(this);
        this.componentSettings.onDropdownClosing = this.componentSettings.onDropdownClosing.bind(this);
        this.componentSettings.onDropdownOpened = this.componentSettings.onDropdownOpened.bind(this);
        this.componentSettings.onDropdownClosed = this.componentSettings.onDropdownClosed.bind(this);

        // Construct the UI elements.
        this.constructWrapper();
        this.constructToggleButton();
        this.constructDropdownMenu();
        this.constructSelectAllOption();
        this.populateDropdownOptions();
        this.constructSearchInput();

        this.updateButtonDisplay();
        this.updateSelectAllState();

        // Disable if no options and `disableIfEmpty` is true.
        if (this.componentSettings.disableIfEmpty && this.hostElement.children('option').length === 0) {
            this.disableComponent();
        }

        // Hide the original select and insert the new UI.
        this.hostElement.hide().after(this.uiContainer);
    }

    DropdownSelector.prototype = {

        // Default configuration settings for the component.
        defaultSettings: {
            /**
             * Determines the text to display on the main button.
             * @param {jQuery} currentSelections The currently selected options.
             * @param {jQuery} originalSelect The original <select> element.
             * @returns {string} The button text.
             */
            buttonDisplayFormatter: function (currentSelections, originalSelect) {
                if (currentSelections.length === 0) {
                    return this.unselectedDisplayText;
                } else if (this.allSelectedDisplayText && currentSelections.length === originalSelect.children('option').length) {
                    return this.includeCountInAllSelected ? `${this.allSelectedDisplayText} (${currentSelections.length})` : this.allSelectedDisplayText;
                } else if (currentSelections.length > this.maxOptionsToDisplay) {
                    return `${currentSelections.length} ${this.itemsSelectedText}`;
                } else {
                    let textParts = [];
                    currentSelections.each(function () {
                        textParts.push($(this).attr('label') || $(this).text());
                    });
                    return textParts.join(', ');
                }
            },
            /**
             * Sets the title attribute for the button, often a full list of selected items.
             * @param {jQuery} currentSelections The currently selected options.
             * @param {jQuery} originalSelect The original <select> element.
             * @returns {string} The button title text.
             */
            buttonTitleFormatter: function (currentSelections, originalSelect) {
                if (currentSelections.length === 0) {
                    return this.unselectedDisplayText;
                } else {
                    let titleParts = [];
                    currentSelections.each(function () {
                        titleParts.push($(this).text());
                    });
                    return titleParts.join(', ');
                }
            },
            /**
             * Retrieves the display label for an option element.
             * @param {HTMLElement} optElement The option element.
             * @returns {string} The label for the option.
             */
            optionLabelExtractor: function (optElement) {
                return $(optElement).attr('label') || $(optElement).text();
            },
            /**
             * Callback invoked when a selection changes.
             * @param {jQuery} changedOption The option that was just changed.
             * @param {boolean} isChecked True if the option was selected, false otherwise.
             */
            onSelectionChange: function (changedOption, isChecked) { /* No-op by default */ },
            /**
             * Callback invoked when the dropdown is about to show.
             * @param {jQuery.Event} event The dropdown event object.
             */
            onDropdownOpening: function (event) { /* No-op by default */ },
            /**
             * Callback invoked when the dropdown is about to hide.
             * @param {jQuery.Event} event The dropdown event object.
             */
            onDropdownClosing: function (event) { /* No-op by default */ },
            /**
             * Callback invoked after the dropdown has shown.
             * @param {jQuery.Event} event The dropdown event object.
             */
            onDropdownOpened: function (event) { /* No-op by default */ },
            /**
             * Callback invoked after the dropdown has hidden.
             * @param {jQuery.Event} event The dropdown event object.
             */
            onDropdownClosed: function (event) { /* No-op by default */ },
            /**
             * Callback invoked when the "Select All" option is used.
             */
            onAllSelected: function () { /* No-op by default */ },

            buttonStyleClass: 'btn btn-default',
            inheritHostClass: false,
            buttonWidthSetting: 'auto',
            buttonContainerTemplate: '<div class="btn-group" />',
            dropdownAlignRight: false,
            activeSelectionClass: 'active',
            maxDropdownHeight: false, // e.g., 200 (pixels)
            checkboxInputName: false,
            includeSelectAllCheckbox: false,
            selectAllThreshold: 0, // Only show select all if more than this many options.
            selectAllLabel: ' Select All',
            selectAllValueId: 'dds-all-select',
            selectAllInputName: false,
            includeCountInAllSelected: true,
            enableOptionFiltering: false,
            caseInsensitiveFiltering: false,
            enableGroupClickable: false,
            filterPromptText: 'Search options',
            filterCriterion: 'text', // 'text', 'value', 'both'
            showFilterClearButton: true,
            preventChangeEvent: false, // Prevent original select's change event from firing.
            unselectedDisplayText: 'Nothing chosen',
            itemsSelectedText: 'selected',
            allSelectedDisplayText: 'All items',
            maxOptionsToDisplay: 3,
            disableIfEmpty: false,

            // Templates for UI components
            uiTemplates: {
                toggleButton: '<button type="button" class="multiselect dropdown-toggle" data-toggle="dropdown"><span class="multiselect-selected-text"></span> <b class="caret"></b></button>',
                dropdownList: '<ul class="multiselect-container dropdown-menu"></ul>',
                filterSection: '<li class="multiselect-item filter"><div class="input-group"><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span><input class="form-control multiselect-search" type="text"></div></li>',
                filterClearBtn: '<span class="input-group-btn"><button class="btn btn-default multiselect-clear-filter" type="button"><i class="glyphicon glyphicon-remove-circle"></i></button></span>',
                listItem: '<li><a tabindex="0"><label></label></a></li>',
                listDivider: '<li class="multiselect-item divider"></li>',
                listGroupHeader: '<li class="multiselect-item multiselect-group"><label></label></li>'
            }
        },

        constructor: DropdownSelector,

        /**
         * Merges provided settings with defaults.
         * @param {object} customSettings Custom settings to apply.
         * @returns {object} The merged settings.
         */
        combineSettings: function (customSettings) {
            return $.extend(true, {}, this.defaultSettings, customSettings);
        },

        /**
         * Constructs the main wrapper container for the dropdown.
         */
        constructWrapper: function () {
            this.uiContainer = $(this.componentSettings.buttonContainerTemplate);
            this.uiContainer.on('show.bs.dropdown', this.componentSettings.onDropdownOpening);
            this.uiContainer.on('hide.bs.dropdown', this.componentSettings.onDropdownClosing);
            this.uiContainer.on('shown.bs.dropdown', this.componentSettings.onDropdownOpened);
            this.uiContainer.on('hidden.bs.dropdown', this.componentSettings.onDropdownClosed);
        },

        /**
         * Constructs the interactive button that toggles the dropdown.
         */
        constructToggleButton: function () {
            this.mainButton = $(this.componentSettings.uiTemplates.toggleButton).addClass(this.componentSettings.buttonStyleClass);

            if (this.hostElement.attr('class') && this.componentSettings.inheritHostClass) {
                this.mainButton.addClass(this.hostElement.attr('class'));
            }

            // Reflect disabled state of the original select.
            if (this.hostElement.prop('disabled')) {
                this.disableComponent();
            } else {
                this.enableComponent();
            }

            // Apply custom width if specified.
            if (this.componentSettings.buttonWidthSetting && this.componentSettings.buttonWidthSetting !== 'auto') {
                this.mainButton.css({
                    'width': this.componentSettings.buttonWidthSetting,
                    'overflow': 'hidden',
                    'text-overflow': 'ellipsis'
                });
                this.uiContainer.css({
                    'width': this.componentSettings.buttonWidthSetting
                });
            }

            // Transfer tabindex from original select to the new button.
            const tabOrder = this.hostElement.attr('tabindex');
            if (tabOrder) {
                this.mainButton.attr('tabindex', tabOrder);
            }

            this.uiContainer.prepend(this.mainButton);
        },

        /**
         * Constructs the unordered list that serves as the dropdown menu.
         */
        constructDropdownMenu: function () {
            this.dropdownList = $(this.componentSettings.uiTemplates.dropdownList);

            if (this.componentSettings.dropdownAlignRight) {
                this.dropdownList.addClass('pull-right');
            }

            // Apply max height and scrolling if configured.
            if (this.componentSettings.maxDropdownHeight) {
                this.dropdownList.css({
                    'max-height': `${this.componentSettings.maxDropdownHeight}px`,
                    'overflow-y': 'auto',
                    'overflow-x': 'hidden'
                });
            }

            this.uiContainer.append(this.dropdownList);
        },

        /**
         * Populates the dropdown menu with options and binds necessary events.
         * Delegates to helper methods for creating individual elements.
         */
        populateDropdownOptions: function () {
            // Clear existing options in the dropdown list before repopulating.
            this.dropdownList.empty();

            processArrayItems(this.hostElement.children(), (childElement) => {
                const childWrapper = $(childElement);
                const elementType = childWrapper.prop('tagName').toLowerCase();

                // Skip the special 'select all' value if it exists as a standard option.
                if (childWrapper.prop('value') === this.componentSettings.selectAllValueId) {
                    return;
                }

                if (elementType === 'optgroup') {
                    this.createOptionGroup(childElement);
                } else if (elementType === 'option') {
                    if (childWrapper.data('role') === 'divider') {
                        this.createListDivider();
                    } else {
                        this.createSelectableOption(childElement);
                    }
                }
                // Ignore other invalid HTML tags.
            });

            // Attach a single delegated event handler for all checkbox changes.
            this.dropdownList.on('change', 'li input[type="checkbox"], li input[type="radio"]', (event) => {
                const targetInput = $(event.target);
                const isSelected = targetInput.prop('checked') || false;
                const isSelectAllTrigger = targetInput.val() === this.componentSettings.selectAllValueId;

                // Toggle the active class on the parent list item.
                if (this.componentSettings.activeSelectionClass) {
                    targetInput.closest('li').toggleClass(this.componentSettings.activeSelectionClass, isSelected);
                }

                const optionValue = targetInput.val();
                const relatedOption = this.findOriginalOptionByValue(optionValue);

                if (!relatedOption.length && !isSelectAllTrigger) {
                    // Safety check: if no original option found, something is wrong.
                    console.warn(`DropdownSelector: Could not find original option for value: ${optionValue}`);
                    return;
                }

                if (isSelectAllTrigger) {
                    if (isSelected) {
                        this.performSelectAll();
                    } else {
                        this.performDeselectAll();
                    }
                } else { // Standard option selection logic
                    if (isSelected) {
                        relatedOption.prop('selected', true);

                        if (!this.componentSettings.isMultiSelect) {
                            // Single select mode: deselect all other options and close.
                            this.hostElement.children('option').not(relatedOption).prop('selected', false);
                            this.dropdownList.find('input[type="checkbox"], input[type="radio"]').not(targetInput).prop('checked', false)
                                .closest('li').removeClass(this.componentSettings.activeSelectionClass);

                            // Close the dropdown after single selection.
                            this.mainButton.trigger('click');
                        }
                    } else {
                        relatedOption.prop('selected', false);
                    }
                    this.componentSettings.onSelectionChange(relatedOption, isSelected);
                }

                this.updateButtonDisplay();
                this.updateSelectAllState();

                // Trigger change event on original select if not prevented.
                if (!this.componentSettings.preventChangeEvent) {
                    this.hostElement.trigger('change');
                }
            });
        },

        /**
         * Creates an optgroup in the dropdown menu.
         * @param {HTMLElement} optgroupElement The original <optgroup> element.
         */
        createOptionGroup: function (optgroupElement) {
            const groupWrapper = $(optgroupElement);
            const groupHeader = $(this.componentSettings.uiTemplates.listGroupHeader);
            groupHeader.find('label').text(groupWrapper.attr('label') || '');

            if (groupWrapper.prop('disabled')) {
                groupHeader.addClass('disabled');
            }

            this.dropdownList.append(groupHeader);

            // If optgroups are clickable, add an event handler
            if (this.componentSettings.enableGroupClickable) {
                groupHeader.on('click', (event) => {
                    const groupOptions = groupWrapper.children('option:enabled');
                    const allChecked = groupOptions.length === groupWrapper.children('option:selected:enabled').length;

                    // Toggle selection for all options within this group.
                    groupOptions.each((idx, option) => {
                        const optionWrapper = $(option);
                        const correspondingCheckbox = this.dropdownList.find(`input[value="${optionWrapper.val()}"]`);
                        if (correspondingCheckbox.length && optionWrapper.prop('selected') === allChecked) {
                            correspondingCheckbox.prop('checked', !allChecked).trigger('change');
                        }
                    });
                });
            }

            processArrayItems(groupWrapper.children('option'), (optionElement) => {
                this.createSelectableOption(optionElement, groupHeader);
            });
        },

        /**
         * Creates a single selectable option (checkbox/radio) in the dropdown menu.
         * @param {HTMLElement} optionElement The original <option> element.
         * @param {jQuery} [parentGroup] The jQuery wrapper for the parent optgroup header.
         */
        createSelectableOption: function (optionElement, parentGroup = null) {
            const optionWrapper = $(optionElement);
            const isSelected = optionWrapper.prop('selected');
            const isDisabled = optionWrapper.prop('disabled') || (parentGroup && parentGroup.hasClass('disabled'));

            const listItem = $(this.componentSettings.uiTemplates.listItem);
            const label = listItem.find('label');
            const inputType = this.componentSettings.isMultiSelect ? 'checkbox' : 'radio';

            const optionInput = $('<input/>', {
                type: inputType,
                value: optionWrapper.val(),
                name: this.componentSettings.checkboxInputName || (this.hostElement.attr('id') || this.hostElement.attr('name')), // Use name from original select if no custom name
                checked: isSelected,
                disabled: isDisabled
            });

            label.append(optionInput);
            label.append(` ${this.componentSettings.optionLabelExtractor(optionElement)}`);

            if (optionWrapper.data('description')) {
                label.append(`<br><small class="text-muted">${optionWrapper.data('description')}</small>`);
            }

            if (isSelected && this.componentSettings.activeSelectionClass) {
                listItem.addClass(this.componentSettings.activeSelectionClass);
            }
            if (isDisabled) {
                listItem.addClass('disabled');
            }

            this.dropdownList.append(listItem);
        },

        /**
         * Creates a divider element in the dropdown.
         */
        createListDivider: function () {
            this.dropdownList.append(this.componentSettings.uiTemplates.listDivider);
        },

        /**
         * Constructs the "Select All" option in the dropdown if enabled.
         */
        constructSelectAllOption: function () {
            if (!this.componentSettings.includeSelectAllCheckbox || this.hostElement.children('option').length <= this.componentSettings.selectAllThreshold) {
                this.selectAllListItem = null; // Ensure it's null if not included.
                return;
            }

            this.selectAllListItem = $(this.componentSettings.uiTemplates.listItem);
            const label = this.selectAllListItem.find('label');
            const selectAllInput = $('<input/>', {
                type: 'checkbox',
                value: this.componentSettings.selectAllValueId,
                name: this.componentSettings.selectAllInputName || 'multiselect_selectall'
            });

            label.append(selectAllInput);
            label.append(` ${this.componentSettings.selectAllLabel}`);

            this.dropdownList.prepend(this.selectAllListItem);

            // Add a divider after "Select All" if it's the first element.
            if (this.hostElement.children('option').length > 0) {
                this.dropdownList.prepend(this.componentSettings.uiTemplates.listDivider);
            }
        },

        /**
         * Constructs the search input field for filtering options.
         */
        constructSearchInput: function () {
            if (!this.componentSettings.enableOptionFiltering) {
                this.filterSection = null;
                return;
            }

            this.filterSection = $(this.componentSettings.uiTemplates.filterSection);
            const searchInput = this.filterSection.find('.multiselect-search');
            searchInput.attr('placeholder', this.componentSettings.filterPromptText);

            if (this.componentSettings.showFilterClearButton) {
                const clearButton = $(this.componentSettings.uiTemplates.filterClearBtn);
                clearButton.find('.multiselect-clear-filter').on('click', () => {
                    searchInput.val('');
                    this.currentSearchQuery = '';
                    this.applyFiltering();
                });
                this.filterSection.find('.input-group').append(clearButton);
            }

            searchInput.on('keydown', (event) => {
                // Prevent form submission on Enter key in filter.
                if (event.which === 13) {
                    event.preventDefault();
                }
            });
            searchInput.on('input', (event) => {
                if (this.searchDelayTimer) {
                    clearTimeout(this.searchDelayTimer);
                }
                this.currentSearchQuery = $(event.target).val();
                this.searchDelayTimer = setTimeout(() => this.applyFiltering(), 300); // Debounce
            });

            this.dropdownList.prepend(this.filterSection);
            this.dropdownList.prepend(this.componentSettings.uiTemplates.listDivider); // Divider before filter.
        },

        /**
         * Applies the current filter query to the dropdown options.
         */
        applyFiltering: function () {
            const query = this.currentSearchQuery.trim();
            const filterActive = query.length > 0;
            const searchPattern = new RegExp(query, this.componentSettings.caseInsensitiveFiltering ? 'i' : '');

            this.dropdownList.find('li:not(.filter)').each((idx, listItem) => {
                const itemWrapper = $(listItem);
                const input = itemWrapper.find('input');

                // Skip non-option items or the select-all item.
                if (!input.length || input.val() === this.componentSettings.selectAllValueId) {
                    itemWrapper.toggle(!filterActive); // Show/hide dividers and optgroup headers based on filter activity
                    return;
                }

                const optionValue = input.val();
                const originalOption = this.findOriginalOptionByValue(optionValue);

                if (!originalOption.length) {
                    itemWrapper.hide();
                    return;
                }

                let match = false;
                switch (this.componentSettings.filterCriterion) {
                    case 'value':
                        match = searchPattern.test(optionValue);
                        break;
                    case 'both':
                        match = searchPattern.test(this.componentSettings.optionLabelExtractor(originalOption[0])) || searchPattern.test(optionValue);
                        break;
                    case 'text':
                    default:
                        match = searchPattern.test(this.componentSettings.optionLabelExtractor(originalOption[0]));
                        break;
                }
                itemWrapper.toggle(match);
            });

            // Adjust visibility of optgroup headers based on their children.
            this.dropdownList.find('.multiselect-group').each((idx, groupHeader) => {
                const groupChildren = $(groupHeader).nextUntil('.multiselect-group, .divider');
                const visibleChildren = groupChildren.filter(':visible').not('.divider');
                $(groupHeader).toggle(visibleChildren.length > 0);
            });
        },

        /**
         * Updates the text and title of the main toggle button.
         */
        updateButtonDisplay: function () {
            const selectedOptions = this.hostElement.find('option:selected');
            const buttonText = this.componentSettings.buttonDisplayFormatter(selectedOptions, this.hostElement);
            const buttonTitle = this.componentSettings.buttonTitleFormatter(selectedOptions, this.hostElement);

            this.mainButton.find('.multiselect-selected-text').html(buttonText);
            this.mainButton.attr('title', buttonTitle);
        },

        /**
         * Updates the state of the "Select All" checkbox.
         */
        updateSelectAllState: function () {
            if (!this.selectAllListItem) {
                return;
            }

            const allOptions = this.hostElement.find('option:enabled:not([data-role="divider"])');
            const selectedOptions = allOptions.filter(':selected');
            const selectAllInput = this.selectAllListItem.find('input');

            if (allOptions.length === 0) {
                selectAllInput.prop('checked', false).prop('indeterminate', false).closest('li').addClass('disabled');
            } else if (selectedOptions.length === allOptions.length) {
                selectAllInput.prop('checked', true).prop('indeterminate', false).closest('li').removeClass('disabled');
            } else if (selectedOptions.length > 0) {
                selectAllInput.prop('checked', false).prop('indeterminate', true).closest('li').removeClass('disabled');
            } else {
                selectAllInput.prop('checked', false).prop('indeterminate', false).closest('li').removeClass('disabled');
            }
        },

        /**
         * Selects all available options in the dropdown.
         */
        performSelectAll: function () {
            this.hostElement.find('option:enabled').prop('selected', true);
            this.dropdownList.find('input[type="checkbox"]:enabled').prop('checked', true);
            this.dropdownList.find('li:not(.disabled)').addClass(this.componentSettings.activeSelectionClass);
            this.componentSettings.onAllSelected();
        },

        /**
         * Deselects all options in the dropdown.
         */
        performDeselectAll: function () {
            this.hostElement.find('option:enabled').prop('selected', false);
            this.dropdownList.find('input[type="checkbox"]:enabled').prop('checked', false);
            this.dropdownList.find('li').removeClass(this.componentSettings.activeSelectionClass);
        },

        /**
         * Finds the original <option> element by its value.
         * @param {string} val The value to search for.
         * @returns {jQuery} The jQuery wrapped original <option> element.
         */
        findOriginalOptionByValue: function (val) {
            return this.hostElement.find(`option[value="${val}"]`);
        },

        /**
         * Disables the entire dropdown component.
         */
        disableComponent: function () {
            this.mainButton.prop('disabled', true).addClass('disabled');
        },

        /**
         * Enables the entire dropdown component.
         */
        enableComponent: function () {
            this.mainButton.prop('disabled', false).removeClass('disabled');
        },

        /**
         * Reconstructs the dropdown menu entirely.
         * Useful after programmatic changes to the original select's options.
         */
        reconstruct: function () {
            this.populateDropdownOptions();
            this.updateButtonDisplay();
            this.updateSelectAllState();
            this.applyFiltering(); // Ensure filter state is reapplied.
        },

        /**
         * Updates the original options cached state.
         * This is useful if the original select's options are manipulated externally.
         */
        refreshSourceOptions: function () {
            this.initialOptionsState = Array.from(this.hostElement[0].options).map(opt => opt.cloneNode(true));
        },

        /**
         * Updates the displayed selection state without rebuilding the entire dropdown.
         * Useful for external changes to selected options.
         */
        updateDisplayedSelection: function () {
            this.dropdownList.find('input[type="checkbox"], input[type="radio"]').each((idx, inputElement) => {
                const inputWrapper = $(inputElement);
                const optionValue = inputWrapper.val();

                if (optionValue === this.componentSettings.selectAllValueId) {
                    return; // Skip select all for individual option update.
                }

                const originalOption = this.findOriginalOptionByValue(optionValue);
                if (originalOption.length) {
                    const isSelected = originalOption.prop('selected');
                    inputWrapper.prop('checked', isSelected);
                    inputWrapper.closest('li').toggleClass(this.componentSettings.activeSelectionClass, isSelected);
                }
            });
            this.updateButtonDisplay();
            this.updateSelectAllState();
        },

        /**
         * Sets new configuration options for the component.
         * @param {object} newOptions The new options to apply.
         */
        configureOptions: function (newOptions) {
            this.componentSettings = this.combineSettings(newOptions);
            // Re-bind proxied functions as settings might change.
            this.componentSettings.onSelectionChange = this.componentSettings.onSelectionChange.bind(this);
            this.componentSettings.onDropdownOpening = this.componentSettings.onDropdownOpening.bind(this);
            this.componentSettings.onDropdownClosing = this.componentSettings.onDropdownClosing.bind(this);
            this.componentSettings.onDropdownOpened = this.componentSettings.onDropdownOpened.bind(this);
            this.componentSettings.onDropdownClosed = this.componentSettings.onDropdownClosed.bind(this);
        },

        /**
         * Destroys the dropdown component, reverting the original select element.
         */
        dispose: function () {
            // Remove event handlers from container.
            this.uiContainer.off('show.bs.dropdown', this.componentSettings.onDropdownOpening);
            this.uiContainer.off('hide.bs.dropdown', this.componentSettings.onDropdownClosing);
            this.uiContainer.off('shown.bs.dropdown', this.componentSettings.onDropdownOpened);
            this.uiContainer.off('hidden.bs.dropdown', this.componentSettings.onDropdownClosed);

            // Remove event handlers from dropdown list.
            this.dropdownList.off('change');

            // Remove the constructed UI elements.
            this.uiContainer.remove();

            // Show the original select element.
            this.hostElement.show();

            // Remove the data attribute storing the instance.
            this.hostElement.removeData('dropdownSelector');
        }
    };

    // jQuery plugin definition
    $.fn.dropdownSelector = function (option, parameter, extraParameter) {
        return this.each(function () {
            let instance = $(this).data('dropdownSelector');
            const isInitialized = instance !== undefined;
            const settings = typeof option === 'object' && option;

            if (!isInitialized) {
                instance = new DropdownSelector(this, settings);
                $(this).data('dropdownSelector', instance);
            }

            // Call a method if 'option' is a string.
            if (typeof option === 'string') {
                const method = instance[option];
                if (typeof method === 'function') {
                    method.apply(instance, [parameter, extraParameter]);
                } else {
                    $.error('Method ' + option + ' does not exist on jQuery.dropdownSelector');
                }
            }
        });
    };

    // Expose default settings for modification.
    $.fn.dropdownSelector.Constructor = DropdownSelector;
    $.fn.dropdownSelector.defaults = DropdownSelector.prototype.defaultSettings;

    // Auto-initialize on elements with data-role="multiselect"
    $(function () {
        $('select[data-role="multiselect"]').dropdownSelector();
    });

}(window.jQuery));