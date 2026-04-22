/*
 * Enhanced Dropdown Input Module
 * A jQuery UI extension that transforms standard HTML select elements into an interactive combobox,
 * allowing users to input values not present in the original dropdown list.
 *
 * Copyright (c) October 2023 Advanced UI Solutions Inc.
 * Distributed under the MIT License, visit http://opensource.org/licenses/MIT
 */

(function (externalLib) {
    externalLib.widget("ui.comboInput", {
        options: {
            convertToUpper: false,
            maxInputLength: 0
        },

        _initializeComponent: function () {
            const contextRef = this;
            const sourceElement = contextRef.element;
            const componentOptions = contextRef.options;

            // Retrieve essential attributes from the original select element
            const sourceId = sourceElement.prop('id');
            const sourceName = sourceElement.prop('name');

            // Define selectors for the newly created elements
            const hiddenFieldQuery = `#${sourceId}`; // This will be the ID of the new hidden input
            const displayFieldId = `ComboDisplay-${sourceId}`;
            const displayFieldQuery = `#${displayFieldId}`;

            // Capture initial state
            const initialValue = sourceElement.find('option:selected').val();
            const initialText = sourceElement.find('option:selected').text();
            const dropdownOptions = sourceElement.find('option');

            // Prepare data for autocomplete suggestions
            const suggestionList = dropdownOptions.map((_idx, opt) => externalLib(opt).text()).get();

            // Conceal the original dropdown from view
            sourceElement.hide();

            // Construct and inject the new combobox HTML structure
            const comboboxHtml = `
                <div class="combo-container">
                    <span class="combo-wrapper">
                        <input type="hidden" class="value-holder" id="${sourceId}" name="${sourceName}" value="${initialValue}">
                        <input type="text" id="${displayFieldId}" class="display-input" value="${initialText}" autocomplete="off">
                        <a class="dropdown-trigger"></a>
                    </span>
                </div>
            `;
            sourceElement.before(comboboxHtml);

            // Strip ID and name from the original select to prevent conflicts,
            // as these are now managed by the hidden input.
            // Also, prevent its change event from propagating unexpectedly.
            sourceElement
                .removeAttr('id')
                .removeAttr('name')
                .on('change.comboInput', event => event.stopPropagation());

            // Initialize autocomplete functionality for the text input
            externalLib(displayFieldQuery).autocomplete({
                source: suggestionList,
                minLength: 0, // Allow showing all options on empty input
                select: function (event, ui) {
                    // Update display and hidden fields upon selection from autocomplete
                    this.value = ui.item.value; // Manually update input value as it might not trigger automatically
                    const selectedOption = sourceElement.find('option').filter((_idx, opt) => externalLib(opt).text() === ui.item.value).first();
                    const selectedOptionValue = selectedOption.val();

                    externalLib(hiddenFieldQuery).val(selectedOptionValue || ui.item.value); // Use option value, or item value if no match
                    externalLib(this).trigger('change'); // Explicitly trigger change event
                }
            })
            .on('change.comboInput', function() {
                const currentDisplayValue = externalLib(this).val();
                const matchedOption = sourceElement.find('option').filter((_idx, opt) => externalLib(opt).text() === currentDisplayValue).first();

                // If no matching option text is found, set hidden input to the entered value.
                // Otherwise, use the value of the matched option.
                if (!matchedOption.length) {
                    externalLib(hiddenFieldQuery).val(currentDisplayValue);
                } else {
                    externalLib(hiddenFieldQuery).val(matchedOption.val());
                }
            })
            .on('blur.comboInput', function () {
                // Ensure change event is fired when input loses focus
                externalLib(this).trigger('change');
            });

            // Apply capitalization logic if enabled
            if (componentOptions.convertToUpper) {
                const displayInput = externalLib(displayFieldQuery);
                displayInput.css("text-transform", "uppercase").data('previousVal', displayInput.val());

                displayInput.on('keyup.comboInput', function () {
                    const currentInput = externalLib(this);
                    const previousVal = currentInput.data('previousVal');

                    // Convert to uppercase only if the value has genuinely changed
                    if (previousVal !== this.value) {
                        currentInput.val(this.value.toUpperCase());
                    }
                    currentInput.data('previousVal', this.value); // Store current value for next comparison
                });
            }

            // Enforce maximum input length if specified
            if (componentOptions.maxInputLength > 0) {
                externalLib(displayFieldQuery).on('input.comboInput', function () { // Use 'input' event for real-time check
                    const currentInput = externalLib(this);
                    if (currentInput.val().length > componentOptions.maxInputLength) {
                        const truncatedVal = currentInput.val().substring(0, componentOptions.maxInputLength);
                        currentInput.val(truncatedVal);
                    }
                });
            }

            // Synchronize the new text input with the original select's changes
            sourceElement.on('change.comboInput', function () {
                const actualHiddenInput = externalLib(this).prev('.combo-container').find(hiddenFieldQuery).first();
                const currentSelectedValue = externalLib(this).val();
                const currentSelectedText = externalLib(this).find('option:selected').text();

                // Find the option by text to ensure case-insensitive match if needed (though `option:selected` is more direct)
                const textOption = externalLib(this).find('option').filter((_idx, opt) => externalLib(opt).text() === currentSelectedText).first();

                actualHiddenInput.val(currentSelectedValue); // Set hidden value
                externalLib(displayFieldQuery).val(textOption.text()); // Update visible textbox
                actualHiddenInput.trigger('change'); // Propagate change from hidden input
            });

            // Initialize the dropdown trigger button
            const dropdownButton = sourceElement.prev('.combo-container').find(".dropdown-trigger");
            dropdownButton.button({
                icons: { primary: "ui-icon-triangle-1-s" },
                text: false
            });

            // Attach click handler to the dropdown trigger button
            dropdownButton.on('click.comboInput', function (event) {
                event.stopPropagation();
                const currentButton = externalLib(this);
                const minimumWidth = currentButton.prev('.display-input').first().outerWidth();
                contextRef._toggleOptionPanel(currentButton, event, minimumWidth);
            });

            // Handle keyboard navigation for Alt + DownArrow
            externalLib(displayFieldQuery).on('keydown.comboInput', function (event) {
                const associatedList = externalLib(this).closest('.combo-container').next('select'); // Target original select directly

                if (event.which === 40 && event.altKey) { // Down arrow + Alt key
                    event.preventDefault();
                    event.stopPropagation();

                    // If the list is already visible, hide it. Otherwise, open it.
                    if (associatedList.is(":visible")) {
                        associatedList.hide();
                    } else {
                        // Ensure text input value is processed before opening, especially for capitalization
                        if (componentOptions.convertToUpper) {
                            this.value = this.value.toUpperCase();
                        }
                        externalLib(displayFieldQuery).autocomplete("close"); // Close autocomplete if open
                        contextRef._toggleOptionPanel(externalLib(this), event, externalLib(this).outerWidth());
                    }
                }
            });

            // Attach a change event to the *original select* when it's acting as an expanded list
            // to close itself after a selection is made.
            sourceElement.on('change.comboInput', function () {
                externalLib(this).hide();
            });
        },

        // Private method to manage the visibility and styling of the dropdown list
        _toggleOptionPanel: function (triggerElement, event, minDisplayWidth) {
            const contextRef = this;
            const sourceElement = contextRef.element;
            const displayFieldQuery = `#ComboDisplay-${sourceElement.prop('id')}`; // Re-derive display field query
            const currentList = sourceElement; // The original select element is used as the dropdown list

            // Check if the list is already open or if the autocomplete widget is active
            if (currentList.is(":visible") || externalLib(displayFieldQuery).autocomplete("widget").is(":visible")) {
                currentList.hide();
                return;
            }

            // Calculate display size for the list
            const totalOptions = sourceElement.find('option').length;
            const displaySize = Math.min(totalOptions, 30); // Max 30 items or actual count

            // Adjust size for single item to ensure it's still clickable as a listbox
            const sizeAttribute = totalOptions === 1 ? 2 : displaySize;

            // Position and style the list to appear as a dropdown panel
            currentList.css({
                "width": "auto",
                "position": "absolute",
                "z-index": "1000" // Ensure it's on top of other elements
            })
            .prop("size", sizeAttribute) // Change to listbox style
            .show();

            // Ensure the list width matches or exceeds the text input width
            if (minDisplayWidth > currentList.outerWidth()) {
                currentList.css("width", minDisplayWidth);
            }

            // Calculate height based on font size and number of visible items for consistent look
            const firstOption = currentList.find('option').first();
            if (firstOption.length) {
                const listItemHeight = parseInt(firstOption.css('line-height') || firstOption.css('font-size'), 10) || 20; // Default if not found
                currentList.css("height", listItemHeight * displaySize + 'px');
            } else {
                 currentList.css("height", listItemHeight * 1 + 'px'); // Fallback for no options
            }


            // Attach a one-time click handler to the document to close the list
            // if the user clicks anywhere outside it.
            externalLib(document).one("click.comboInputClose", function (docEvent) {
                if (!externalLib(docEvent.target).closest(currentList).length && !externalLib(docEvent.target).closest(triggerElement).length) {
                    currentList.hide();
                }
            });

            // Helper function for keyboard navigation within the dropdown
            const navigateListItems = function (keyEvent) {
                const directionDown = "down";
                const directionUp = "up";

                // Prevent default scrolling for arrow keys
                if ([38, 40, 13].includes(keyEvent.which) && currentList.is(":visible")) {
                    keyEvent.preventDefault();
                    keyEvent.stopPropagation();
                }

                // Move selection up
                if (keyEvent.which === 38 && currentList.is(":visible")) {
                    performSelectionMove(directionUp);
                    return;
                }

                // Move selection down
                if (keyEvent.which === 40 && currentList.is(":visible")) {
                    performSelectionMove(directionDown);
                    return;
                }

                // On Enter key, trigger change and hide list
                if (keyEvent.which === 13 && currentList.is(":visible")) {
                    currentList.trigger("change");
                    currentList.hide();
                    return;
                }

                // If any other key is pressed while list is visible, hide it
                if (currentList.is(":visible") && keyEvent.which !== 9) { // Ignore Tab key
                    currentList.hide();
                }

                function performSelectionMove(direction) {
                    const currentlySelected = currentList.find(":selected");
                    let targetItem;

                    if (direction === directionDown) {
                        targetItem = currentlySelected.next('option');
                        if (!targetItem.length) { // Loop to first if at end
                            targetItem = currentList.find('option').first();
                        }
                    } else { // directionUp
                        targetItem = currentlySelected.prev('option');
                        if (!targetItem.length) { // Loop to last if at beginning
                            targetItem = currentList.find('option').last();
                        }
                    }

                    if (targetItem.length) {
                        currentlySelected.prop('selected', false);
                        targetItem.prop('selected', true);
                        currentList.val(targetItem.val()); // Update the select's value property
                        currentList.trigger('change'); // Trigger change for the actual select
                    }
                }
            };

            // Attach keyboard navigation handler to the document
            externalLib(document)
                .off("keydown.comboInputNav") // Ensure only one handler is active
                .on("keydown.comboInputNav", navigateListItems);
        },

        // Clean up and restore the original select element
        _cleanupComponent: function() {
            const sourceElement = this.element;
            const createdContainer = sourceElement.prev('.combo-container');
            const hiddenValueInput = createdContainer.find('.value-holder');

            const originalId = hiddenValueInput.prop('id');
            const originalName = hiddenValueInput.prop('name');

            // Reassign original ID and name to the source select
            sourceElement.attr({
                id: originalId,
                name: originalName,
            });

            // Remove all custom event handlers
            sourceElement.off('.comboInput');
            externalLib(document).off('.comboInputClose .comboInputNav');
            createdContainer.find('.display-input').autocomplete("destroy").off('.comboInput');
            createdContainer.find('.dropdown-trigger').button("destroy").off('.comboInput');

            // Remove the newly created HTML elements
            createdContainer.remove();

            // Make the original select visible again
            sourceElement.show();
        }
    });
})(jQuery);