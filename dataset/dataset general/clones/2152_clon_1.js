/*
 * Bootstrap Multiselect (https://github.com/davidstutz/bootstrap-multiselect)
 *
 * Apache License, Version 2.0:
 * Copyright (c) 2012 - 2015 David Stutz
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * BSD 3-Clause License:
 * Copyright (c) 2012 - 2015 David Stutz
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *   - Redistributions of source code must retain the above copyright notice,
 *     this list of conditions and the following disclaimer.
 *
 *   - Redistributions in binary form must reproduce the above copyright notice,
 *     this list of conditions and the following disclaimer in the documentation
 *     and/or other materials provided with the distribution.
 *
 *   - Neither the name of David Stutz nor the names of its contributors may be
 *     used to endorse or promote products derived from this software without
 *     specific prior written permission.
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
!function ($) {

    "use strict"; // Enforce strict mode for better code quality and fewer silent errors.

    // Check if Knockout.js is available and if multiselect binding handler is not already defined.
    if (typeof ko !== 'undefined' && ko.bindingHandlers && !ko.bindingHandlers.multiselect) {

        // Define the multiselect binding handler for Knockout.js.
        ko.bindingHandlers.multiselect = {

            // Specify dependencies for this binding handler.
            after: ['options', 'value', 'selectedOptions'],


            /**
             * Initialization logic for the multiselect binding.
             * This runs once when the binding is applied to an element.
             *
             * @param {HTMLElement} element The DOM element involved in this binding.
             * @param {function} valueAccessor A function that returns the value being bound to.
             * @param {object} allBindings An object whose properties represent all the bindings for this element.
             * @param {object} viewModel The view model that was bound to this region of the UI.
             * @param {object} bindingContext The binding context for this element.
             */
            init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {

                var $element = $(element);
                var config = ko.toJS(valueAccessor()); // Convert observable values to plain JavaScript objects.


                $element.multiselect(config); // Initialize the Bootstrap Multiselect plugin.


                // Handle 'options' binding updates.
                if (allBindings.has('options')) {

                    var options = allBindings.get('options');

                    if (ko.isObservable(options)) {

                        ko.computed({

                            read: function() {
                                // Trigger a re-evaluation when options change.
                                options();

                                // Defer the rebuild to ensure DOM updates have propagated.
                                setTimeout(function() {

                                    var ms = $element.data('multiselect');

                                    if (ms) {
                                        ms.updateOriginalOptions(); // Update internal representation of options.
                                    }

                                    $element.multiselect('rebuild'); // Rebuild the multiselect dropdown.

                                }, 1); // A minimal delay.
                            },

                            disposeWhenNodeIsRemoved: element // Clean up the computed observable when the element is removed.

                        });

                    }

                }


                // Handle 'value' binding updates.
                // Note: 'value' and 'selectedOptions' are two-way, so care must be taken to avoid infinite loops.
                // It's a slight processing overhead but typically doesn't loop.
                if (allBindings.has('value')) {

                    var value = allBindings.get('value');

                    if (ko.isObservable(value)) {

                        ko.computed({

                            read: function() {

                                value(); // Subscribe to changes in the 'value' observable.

                                setTimeout(function() {

                                    $element.multiselect('refresh'); // Refresh the multiselect to reflect new value.

                                }, 1);

                            },

                            disposeWhenNodeIsRemoved: element // Dispose computed when element is removed.

                        }).extend({ rateLimit: 100, notifyWhenChangesStop: true }); // Rate limit updates for performance.

                    }

                }


                // Handle 'selectedOptions' binding updates.
                // Switched from arrayChange subscription to a general subscription using 'refresh'.
                // Performance with 'select' and 'deselect' methods might not be significantly better.
                if (allBindings.has('selectedOptions')) {

                    var selectedOptions = allBindings.get('selectedOptions');

                    if (ko.isObservable(selectedOptions)) {

                        ko.computed({

                            read: function() {

                                selectedOptions(); // Subscribe to changes in the 'selectedOptions' observable.

                                setTimeout(function() {

                                    $element.multiselect('refresh'); // Refresh the multiselect to reflect new selected options.

                                }, 1);

                            },

                            disposeWhenNodeIsRemoved: element // Dispose computed when element is removed.

                        }).extend({ rateLimit: 100, notifyWhenChangesStop: true }); // Apply rate limiting.

                    }

                }


                // Add a disposal callback for when the DOM node is removed.
                ko.utils.domNodeDisposal.addDisposeCallback(element, function() {

                    $element.multiselect('destroy'); // Destroy the multiselect instance to prevent memory leaks.

                });

            },


            /**
             * Update logic for the multiselect binding.
             * This runs when any observable accessed in valueAccessor or allBindings changes.
             *
             * @param {HTMLElement} element The DOM element involved in this binding.
             * @param {function} valueAccessor A function that returns the value being bound to.
             * @param {object} allBindings An object whose properties represent all the bindings for this element.
             * @param {object} viewModel The view model that was bound to this region of the UI.
             * @param {object} bindingContext The binding context for this element.
             */
            update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {

                var $element = $(element);
                var config = ko.toJS(valueAccessor()); // Get the latest configuration.


                $element.multiselect('setOptions', config); // Update the multiselect options.
                $element.multiselect('rebuild'); // Rebuild the multiselect to apply changes.

            }

        };

    }


    /**
     * Helper function to iterate over an array.
     *
     * @param {Array} array The array to iterate.
     * @param {Function} callback The function to call for each element.
     */
    function forEach(array, callback) {

        for (var index = 0; index < array.length; ++index) {

            callback(array[index], index); // Execute callback with element and its index.

        }

    }


    /**
     * Constructor function for creating a new multiselect instance.
     *
     * @param {jQuery} select The jQuery object representing the original select element.
     * @param {Object} options Configuration options for the multiselect.
     * @returns {Multiselect} A new Multiselect instance.
     */
    function Multiselect(select, options) {

        this.$select = $(select); // Store the jQuery object of the original select element.
        this.options = this.mergeOptions($.extend({}, options, this.$select.data())); // Merge default, user, and data attributes options.

        // Initialize internal state variables.
        // We clone the original select options to maintain a reference to their initial state.
        this.originalOptions = this.$select.clone()[0].options;
        this.query = ''; // Current search query for filtering.
        this.searchTimeout = null; // Timeout for debouncing search input.
        this.lastToggledInput = null; // Reference to the last input element that was toggled.


        this.options.multiple = this.$select.attr('multiple') === "multiple"; // Determine if the select is a multiple-selection type.

        // Bind event handlers to the Multiselect instance context.
        this.options.onChange = $.proxy(this.options.onChange, this);
        this.options.onDropdownShow = $.proxy(this.options.onDropdownShow, this);
        this.options.onDropdownHide = $.proxy(this.options.onDropdownHide, this);
        this.options.onDropdownShown = $.proxy(this.options.onDropdownShown, this);
        this.options.onDropdownHidden = $.proxy(this.options.onDropdownHidden, this);


        // Build various components of the multiselect in sequence.
        this.buildContainer(); // Create the main container div.
        this.buildButton(); // Create the dropdown toggle button.
        this.buildDropdown(); // Create the dropdown menu (UL).
        this.buildSelectAll(); // Add "Select All" option if enabled.
        this.buildDropdownOptions(); // Populate the dropdown with options from the original select.
        this.buildFilter(); // Add the search filter input if enabled.


        this.updateButtonText(); // Set the initial text of the multiselect button.
        this.updateSelectAll(); // Update the state of the "Select All" checkbox.


        // Disable the multiselect if no options are present and disableIfEmpty is true.
        if (this.options.disableIfEmpty && $('option', this.$select).length <= 0) {

            this.disable(); // Call the disable method.

        }

        // Hide the original select element and insert the new multiselect structure after it.
        this.$select.hide().after(this.$container);

    }

    // Define prototype methods for the Multiselect class.
    Multiselect.prototype = {

        /**
         * Default options for the multiselect plugin.
         */
        defaults: {

            /**
             * Function to generate the text displayed on the multiselect button.
             *
             * @param {jQuery} options The jQuery object containing the selected options.
             * @param {jQuery} select The jQuery object of the original select element.
             * @returns {String} The text to display on the button.
             */
            buttonText: function(options, select) {

                if (options.length === 0) {

                    return this.nonSelectedText; // Return text for no selection.

                }
                else if (this.allSelectedText && options.length === $('option', $(select)).length) {
                    // All options are selected.

                    if (this.selectAllNumber) {

                        return this.allSelectedText + ' (' + options.length + ')'; // Show count if enabled.

                    }
                    else {

                        return this.allSelectedText; // Just the "All selected" text.

                    }

                }
                else if (options.length > this.numberDisplayed) {

                    return options.length + ' ' + this.nSelectedText; // Show count of selected items.

                }
                else {

                    var selected = ''; // Initialize an empty string for selected labels.

                    options.each(function() {

                        // Get label from 'label' attribute or text content.
                        var label = ($(this).attr('label') !== undefined) ? $(this).attr('label') : $(this).text();

                        selected += label + ', '; // Append label and a comma.

                    });

                    // Remove the trailing comma and space.
                    return selected.substr(0, selected.length - 2);

                }

            },

            /**
             * Function to generate the title attribute for the multiselect button.
             *
             * @param {jQuery} options The jQuery object containing the selected options.
             * @param {jQuery} select The jQuery object of the original select element.
             * @returns {String} The text for the button's title attribute.
             */
            buttonTitle: function(options, select) {

                if (options.length === 0) {

                    return this.nonSelectedText; // Title for no selection.

                }
                else {

                    var selected = ''; // Initialize an empty string.

                    options.each(function () {

                        selected += $(this).text() + ', '; // Accumulate text of selected options.

                    });

                    return selected.substr(0, selected.length - 2); // Remove trailing comma and space.

                }

            },

            /**
             * Function to get the label for an option element.
             *
             * @param {HTMLElement} element The option element.
             * @returns {String} The label text.
             */
            optionLabel: function(element){

                return $(element).attr('label') || $(element).text(); // Prefer 'label' attribute, fallback to text.

            },

            /**
             * Callback function triggered when the selection changes.
             * This is not triggered when options are selected/deselected manually via code.
             *
             * @param {jQuery} option The jQuery object of the option that changed.
             * @param {Boolean} checked True if the option was checked, false if unchecked.
             */
            onChange : function(option, checked) {
                // Default empty implementation.
            },

            /**
             * Callback function triggered when the dropdown is about to be shown.
             *
             * @param {jQuery.Event} event The jQuery event object.
             */
            onDropdownShow: function(event) {
                // Default empty implementation.
            },

            /**
             * Callback function triggered when the dropdown is about to be hidden.
             *
             * @param {jQuery.Event} event The jQuery event object.
             */
            onDropdownHide: function(event) {
                // Default empty implementation.
            },

            /**
             * Callback function triggered after the dropdown has been shown.
             *
             * @param {jQuery.Event} event The jQuery event object.
             */
            onDropdownShown: function(event) {
                // Default empty implementation.
            },

            /**
             * Callback function triggered after the dropdown has been hidden.
             *
             * @param {jQuery.Event} event The jQuery event object.
             */
            onDropdownHidden: function(event) {
                // Default empty implementation.
            },

            /**
             * Callback function triggered when "Select all" is clicked.
             */
            onSelectAll: function() {
                // Default empty implementation.
            },

            buttonClass: 'btn btn-default', // CSS class for the multiselect button.
            inheritClass: false, // Whether to inherit classes from the original select.
            buttonWidth: 'auto', // Width of the button ('auto' or specific CSS value).
            buttonContainer: '<div class="btn-group" />', // HTML structure for the button container.
            dropRight: false, // Whether the dropdown menu should drop to the right.
            selectedClass: 'active', // CSS class to apply to selected items.

            // Maximum height of the dropdown menu.
            // If maximum height is exceeded, a scrollbar will be displayed.
            maxHeight: false, // Set to a number (e.g., 200) for max height.

            checkboxName: false, // Name attribute for checkboxes, if required.
            includeSelectAllOption: false, // Whether to include a "Select All" option.
            includeSelectAllIfMoreThan: 0, // Only show "Select All" if more than this number of options.
            selectAllText: ' Select all', // Text for the "Select All" option.
            selectAllValue: 'multiselect-all', // Value for the "Select All" option.
            selectAllName: false, // Name attribute for the "Select All" checkbox.
            selectAllNumber: true, // Whether to show the number of selected items next to "All selected".

            enableFiltering: false, // Enable search filtering.
            enableCaseInsensitiveFiltering: false, // Enable case-insensitive filtering.
            enableClickableOptGroups: false, // Make optgroups clickable to select/deselect all options within them.

            filterPlaceholder: 'Search', // Placeholder text for the filter input.
            // Possible options: 'text', 'value', 'both' - determines what to filter by.
            filterBehavior: 'text',
            includeFilterClearBtn: true, // Whether to include a clear button for the filter.
            preventInputChangeEvent: false, // Prevent the 'change' event on the original select.

            nonSelectedText: 'None selected', // Text when no options are selected.
            nSelectedText: 'selected', // Text used with the count (e.g., "3 selected").
            allSelectedText: 'All selected', // Text when all options are selected.
            numberDisplayed: 3, // Number of selected options to display before showing a count.
            disableIfEmpty: false, // Disable the multiselect if the original select has no options.

            /**
             * Templates for various UI components of the multiselect.
             */
            templates: {

                button: '<button type="button" class="multiselect dropdown-toggle" data-toggle="dropdown"><span class="multiselect-selected-text"></span> <b class="caret"></b></button>',
                ul: '<ul class="multiselect-container dropdown-menu"></ul>',
                filter: '<li class="multiselect-item filter"><div class="input-group"><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span><input class="form-control multiselect-search" type="text"></div></li>',
                filterClearBtn: '<span class="input-group-btn"><button class="btn btn-default multiselect-clear-filter" type="button"><i class="glyphicon glyphicon-remove-circle"></i></button></span>',
                li: '<li><a tabindex="0"><label></label></a></li>',
                divider: '<li class="multiselect-item divider"></li>',
                liGroup: '<li class="multiselect-item multiselect-group"><label></label></li>'

            }

        },


        constructor: Multiselect, // Set the constructor property.


        /**
         * Builds the main container element for the multiselect.
         * This container holds the button and the dropdown menu.
         */
        buildContainer: function() {

            this.$container = $(this.options.buttonContainer); // Create the container using the specified template.

            // Attach event listeners for dropdown visibility changes.
            this.$container.on('show.bs.dropdown', this.options.onDropdownShow);
            this.$container.on('hide.bs.dropdown', this.options.onDropdownHide);
            this.$container.on('shown.bs.dropdown', this.options.onDropdownShown);
            this.$container.on('hidden.bs.dropdown', this.options.onDropdownHidden);

        },


        /**
         * Builds the button component of the multiselect.
         * This button acts as the dropdown toggle.
         */
        buildButton: function() {

            this.$button = $(this.options.templates.button).addClass(this.options.buttonClass); // Create button and add base class.

            // Inherit classes from the original select element if `inheritClass` is true.
            if (this.$select.attr('class') && this.options.inheritClass) {

                this.$button.addClass(this.$select.attr('class'));

            }

            // Adopt the disabled state from the original select.
            if (this.$select.prop('disabled')) {

                this.disable(); // Disable the multiselect button.

            }
            else {

                this.enable(); // Ensure the multiselect button is enabled.

            }

            // Apply manual button width if specified and not 'auto'.
            if (this.options.buttonWidth && this.options.buttonWidth !== 'auto') {

                this.$button.css({
                    'width' : this.options.buttonWidth, // Set explicit width.
                    'overflow' : 'hidden', // Hide overflow content.
                    'text-overflow' : 'ellipsis' // Add ellipsis for truncated text.
                });

                this.$container.css({
                    'width': this.options.buttonWidth // Apply width to the container as well.
                });

            }

            // Transfer the tabindex attribute from the original select to the new button.
            var tabindex = this.$select.attr('tabindex');

            if (tabindex) {

                this.$button.attr('tabindex', tabindex);

            }

            this.$container.prepend(this.$button); // Insert the button into the container.

        },


        /**
         * Builds the unordered list (UL) element that serves as the dropdown menu.
         */
        buildDropdown: function() {

            // Create the UL element using the specified template.
            this.$ul = $(this.options.templates.ul);


            // Add 'pull-right' class if the dropdown should open to the right.
            if (this.options.dropRight) {

                this.$ul.addClass('pull-right');

            }


            // Apply maximum height and scrollbars if `maxHeight` is set.
            if (this.options.maxHeight) {

                // TODO: Consider adding a dedicated CSS class for these styles instead of inline.
                this.$ul.css({
                    'max-height': this.options.maxHeight + 'px', // Set the maximum height.
                    'overflow-y': 'auto', // Enable vertical scrolling.
                    'overflow-x': 'hidden' // Hide horizontal overflow.
                });

            }

            this.$container.append(this.$ul); // Append the dropdown UL to the container.

        },


        /**
         * Populates the dropdown menu with options derived from the original select element.
         * This method also binds necessary event handlers to the dropdown elements.
         * It uses `createDivider` and `createOptionValue` internally.
         */
        buildDropdownOptions: function() {

            // Iterate over each child element of the original select.
            this.$select.children().each($.proxy(function(index, element) {

                var $element = $(element); // Wrap the current element in a jQuery object.

                // Get the tag name and convert to lowercase for consistent comparison.
                var tag = $element.prop('tagName').toLowerCase();


                // Skip the "Select All" option if it's already handled separately or its value matches.
                if ($element.prop('value') === this.options.selectAllValue) {

                    return; // Continue to the next iteration.

                }


                // Handle optgroup elements.
                if (tag === 'optgroup') {

                    this.createOptgroup(element); // Create a corresponding optgroup in the dropdown.

                }
                // Handle option elements.
                else if (tag === 'option') {

                    // Check if the option is intended to be a divider.
                    if ($element.data('role') === 'divider') {

                        this.createDivider(); // Create a visual divider in the dropdown.

                    }
                    else {

                        this.createOptionValue(element); // Create a standard option entry in the dropdown.

                    }

                }

                // Other unrecognized or illegal tags will be silently ignored.

            }, this)); // Ensure 'this' context refers to the Multiselect instance.


            // Bind the 'change' event to all input elements within the dropdown's list items.
            $('li input', this.$ul).on('change', $.proxy(function(event) {

                var $target = $(event.target); // The input element that triggered the change.

                var checked = $target.prop('checked') || false; // Current checked state of the input.
                var isSelectAllOption = $target.val() === this.options.selectAllValue; // Check if it's the "Select All" option.


                // Apply or remove the configured selected class based on the checked state.
                if (this.options.selectedClass) {

                    if (checked) {

                        $target.closest('li').addClass(this.options.selectedClass); // Add class if checked.

                    }
                    else {

                        $target.closest('li').removeClass(this.options.selectedClass); // Remove class if unchecked.

                    }

                }


                // Retrieve the value of the changed option and find the corresponding original select option.
                var value = $target.val();
                var $option = this.getOptionByValue(value);


                // Get all other options and checkboxes, excluding the current one.
                var $optionsNotThis = $('option', this.$select).not($option);
                var $checkboxesNotThis = $('input', this.$container).not($target);


                // Handle the "Select All" option's behavior.
                if (isSelectAllOption) {

                    if (checked) {

                        this.selectAll(); // Select all options.

                    }
                    else {

                        this.deselectAll(); // Deselect all options.

                    }

                }


                // Handle individual option selection/deselection.
                if(!isSelectAllOption){

                    if (checked) {

                        $option.prop('selected', true); // Mark the original option as selected.

                        if (this.options.multiple) {

                            // For multiple select, simply select the additional option.
                            $option.prop('selected', true);

                        }
                        else {

                            // For single select, unselect all other options and their corresponding checkboxes.
                            if (this.options.selectedClass) {

                                $($checkboxesNotThis).closest('li').removeClass(this.options.selectedClass);

                            }

                            $($checkboxesNotThis).prop('checked', false); // Uncheck other checkboxes.
                            $optionsNotThis.prop('selected', false); // Unselect other original options.

                            // In single selection mode, close the dropdown after selection.
                            this.$button.click();

                        }

                        // Remove outline if selectedClass is "active" (common Bootstrap style).
                        if (this.options.selectedClass === "active") {

                            $optionsNotThis.closest("a").css("outline", "");

                        }

                    }
                    else {
                        /* ... (rest of the else block for unchecked state) */