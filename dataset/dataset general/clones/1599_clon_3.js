/*
 * Enhanced Select Plugin
 * A jQuery plugin to replace standard <select> elements with stylable alternatives.
 * Version 1.0.0
 * Original author: Baris Gumustas (2010)
 * Modernized and refactored for improved readability and maintainability.
 */
(function ($) {
    // Global buffer for sequential key presses for search functionality
    window.selectKeyBuffer = {
        currentInput: '',
        inputTimeout: null
    };

    /**
     * Hides all currently visible custom dropdown lists.
     */
    function hideAllCustomSelectors() {
        const activeListElements = $('.styled-select-options:visible');
        if (activeListElements.length > 0) {
            activeListElements.hide();
            // Find the parent wrapper and its associated data to remove the active class from the trigger
            activeListElements.each(function() {
                const parentWrapper = $(this).closest('.styled-select-wrapper');
                const dropdownData = parentWrapper.data('customSelect');
                if (dropdownData && dropdownData.pluginConfig && dropdownData.pluginConfig.activeTriggerClass) {
                    parentWrapper.find(`.${dropdownData.pluginConfig.triggerClass}`).removeClass(dropdownData.pluginConfig.activeTriggerClass);
                }
            });
        }
    }

    // Event delegation for stopping propagation on custom select wrappers
    $(document).on('click', '.styled-select-wrapper', function (evt) {
        evt.stopPropagation();
    });

    // Event delegation for hover effect on option links
    $(document).on('mouseover', '.styled-select-options li a', function () {
        $(this).closest('.styled-select-options').find('a').removeClass('hover-focus');
        $(this).addClass('hover-focus');
    });

    // Global keypress handler for ESC key to dismiss dropdowns
    $(document).on('keydown', function (evt) { // Using keydown for better responsiveness on ESC
        if (evt.keyCode === 27) { // ESC key
            evt.preventDefault();
            hideAllCustomSelectors();
        }
    });

    // Global click handler to dismiss dropdowns when clicking outside
    $(document).on('click', function () {
        hideAllCustomSelectors();
    });

    /**
     * Helper function to determine if an element's content overflows, making it scrollable.
     * @param {jQuery} element The jQuery element to check.
     * @returns {boolean} True if the element's content overflows, false otherwise.
     */
    function isElementScrollable(element) {
        if (!element || !element.length) return false;
        const domElement = element.get(0);
        return domElement.scrollHeight > domElement.clientHeight;
    }

    // Main plugin definition
    $.fn.customSelect = function (userOptions) {
        const defaultOptions = {
            multiSelectionPhrase: false, // e.g., "3 items selected" to display when multiple are chosen
            wrapperClass: 'styled-select-wrapper',
            listContainerClass: 'styled-select-options',
            triggerClass: 'styled-select-trigger',
            optionSelectedClass: 'selected-option',
            activeTriggerClass: 'active-trigger',
            adjustListWidthForBorder: true, // Adjusts calculated list width to account for borders
            enableKeyboardNavigation: true
        };

        // Merge user options with defaults
        const pluginConfig = $.extend({}, defaultOptions, userOptions);

        return this.each(function () {
            const originalSelect = $(this);

            // Skip if already initialized to prevent duplicate wrappers/events
            if (originalSelect.data('customSelectInitialized')) {
                return;
            }
            originalSelect.data('customSelectInitialized', true);

            // Store plugin configuration for later use, especially in global event handlers
            originalSelect.data('customSelect', {
                pluginConfig: pluginConfig
            });

            // Ensure the original select has an ID for potential accessibility or external lookup
            const currentSelectId = originalSelect.attr('id') || `custom-select-${Math.random().toString(36).substring(2, 11)}`;
            originalSelect.attr('id', currentSelectId);

            originalSelect.hide(); // Hide the original <select> element

            // Create wrapper div and transfer original select's classes
            const wrapperDiv = $('<div></div>')
                .addClass(pluginConfig.wrapperClass)
                .addClass('custom-select') // Add a generic class for easier global targeting
                .data('originalSelectId', currentSelectId); // Link wrapper to original select ID

            const originalClasses = originalSelect.attr('class');
            if (originalClasses) {
                wrapperDiv.addClass(originalClasses);
            }
            originalSelect.wrap(wrapperDiv); // Wrap the select within our new div
            const wrapper = originalSelect.parent();

            // Create the visible trigger element (replaces the <select> box)
            const displayTrigger = $('<a href="#" role="button" aria-haspopup="listbox" />')
                .addClass(pluginConfig.triggerClass)
                .appendTo(wrapper);

            // Create the unordered list for options
            const optionList = $('<ul role="listbox" />')
                .addClass(pluginConfig.listContainerClass)
                .hide()
                .css({
                    'position': 'absolute',
                    'z-index': '9999',
                    'list-style': 'none',
                    'margin': '0',
                    'padding': '0',
                    'box-sizing': 'border-box' // Ensure padding/border is included in width calculation
                })
                .appendTo(wrapper);

            // Populate the custom dropdown list
            const searchableContent = []; // Store lowercase text for keyboard search

            originalSelect.find('option').each(function () {
                const optionElement = $(this);
                const optionText = optionElement.text();
                searchableContent.push(optionText.toLowerCase());

                const listItem = $('<li role="option" />').appendTo(optionList);
                const optionLink = $('<a href="#" />').text(optionText);

                optionLink.data('associatedOption', optionElement); // Link custom link to original option
                listItem.append(optionLink);
                optionElement.data('replacementLink', optionLink); // Link original option to custom link

                // Handle initial selected state for multiple selects
                if (originalSelect.prop('multiple') && optionElement.prop('selected')) {
                    optionLink.addClass(pluginConfig.optionSelectedClass);
                }

                // Custom 'selectItem' event handler for each option link
                optionLink.on('selectItem', function (evt, shouldTriggerChange) {
                    evt.preventDefault();
                    const currentLink = $(this);
                    const currentOption = currentLink.data('associatedOption');
                    const parentSelect = wrapper.find('select');

                    if (!parentSelect.prop('multiple')) { // Single select behavior
                        parentSelect.find('option').prop('selected', false);
                        // Remove selected class from all other custom links in this list
                        parentSelect.find('option').each(function() {
                            const link = $(this).data('replacementLink');
                            if (link) link.removeClass(pluginConfig.optionSelectedClass);
                        });

                        currentOption.prop('selected', true);
                        currentLink.addClass(pluginConfig.optionSelectedClass);
                        displayTrigger.text(currentLink.text());
                        optionList.hide();
                        displayTrigger.removeClass(pluginConfig.activeTriggerClass);
                    } else { // Multiple select behavior
                        if (currentOption.prop('selected')) {
                            currentOption.prop('selected', false);
                            currentLink.removeClass(pluginConfig.optionSelectedClass);
                        } else {
                            currentOption.prop('selected', true);
                            currentLink.addClass(pluginConfig.optionSelectedClass);
                        }

                        const selectedValues = [];
                        parentSelect.find('option:selected').each(function () {
                            selectedValues.push($(this).text());
                        });

                        if (selectedValues.length === 0) {
                            displayTrigger.text(parentSelect.attr('placeholder') || '\u00A0'); // Non-breaking space
                        } else if (selectedValues.length > 1 && pluginConfig.multiSelectionPhrase) {
                            displayTrigger.text(pluginConfig.multiSelectionPhrase);
                        } else {
                            displayTrigger.text(selectedValues.join(', '));
                        }
                    }

                    if (shouldTriggerChange) {
                        parentSelect.trigger('change'); // Trigger original select's change event
                    }
                });

                // Click event for custom option links
                optionLink.on('click', function (evt) {
                    evt.preventDefault();
                    $(this).trigger('selectItem', [true]);
                });
            }); // End of option iteration

            // Initialize displayTrigger text based on current select state
            const updateTriggerText = () => {
                const selectedOptions = originalSelect.find('option:selected');
                if (selectedOptions.length === 0) {
                    displayTrigger.text(originalSelect.attr('placeholder') || '\u00A0');
                } else if (originalSelect.prop('multiple')) {
                    const selectedTexts = selectedOptions.map(function () {
                        return $(this).text();
                    }).get();

                    if (selectedTexts.length > 1 && pluginConfig.multiSelectionPhrase) {
                        displayTrigger.text(pluginConfig.multiSelectionPhrase);
                    } else {
                        displayTrigger.text(selectedTexts.join(', '));
                    }
                } else {
                    displayTrigger.text(selectedOptions.text());
                }
            };
            updateTriggerText();

            // Keyboard navigation support
            if (pluginConfig.enableKeyboardNavigation) {
                displayTrigger.on('keydown', function (evt) { // Using keydown for immediate action
                    evt.preventDefault(); // Prevent default browser behavior for arrow keys, etc.
                    clearTimeout(window.selectKeyBuffer.inputTimeout);

                    const currentHovered = optionList.find('a.hover-focus');
                    let nextItemToHover = $(); // Empty jQuery object for potential next item

                    switch (evt.keyCode) {
                        case 38: // Up arrow
                            nextItemToHover = currentHovered.closest('li').prev('li').find('a');
                            if (nextItemToHover.length === 0 && currentHovered.length > 0) { // Wrap around to last item if at top
                                nextItemToHover = optionList.find('li:last-child a');
                            }
                            break;
                        case 40: // Down arrow
                            nextItemToHover = currentHovered.closest('li').next('li').find('a');
                            if (nextItemToHover.length === 0 && currentHovered.length > 0) { // Wrap around to first item if at bottom
                                nextItemToHover = optionList.find('li:first-child a');
                            } else if (currentHovered.length === 0 && optionList.find('li').length > 0) { // If nothing hovered, focus first
                                nextItemToHover = optionList.find('li:first-child a');
                            }
                            break;
                        case 13: // Enter key
                            if (currentHovered.length > 0) {
                                currentHovered.trigger('selectItem', [true]);
                                // For single selects, enter should close the list. For multi, it stays open.
                                if (!originalSelect.prop('multiple')) {
                                    hideAllCustomSelectors();
                                }
                            }
                            return; // Don't reset buffer or set timeout for Enter
                        case 32: // Space key
                            if (currentHovered.length > 0) {
                                currentHovered.trigger('selectItem', [true]);
                            }
                            // Keep space in buffer for search, don't return.
                            break;
                        default:
                            const char = String.fromCharCode(evt.which || evt.keyCode);
                            if (char && char.match(/[a-z0-9]/i)) { // Only append alphanumeric characters for search
                                window.selectKeyBuffer.currentInput += char;
                            } else {
                                // If it's a non-alphanumeric character (e.g., shift, ctrl), clear the buffer
                                window.selectKeyBuffer.currentInput = '';
                                break;
                            }

                            const searchPattern = new RegExp(`^${window.selectKeyBuffer.currentInput.toLowerCase()}`);
                            let foundIndex = -1;
                            for (let i = 0; i < searchableContent.length; i++) {
                                if (searchableContent[i].match(searchPattern)) {
                                    foundIndex = i;
                                    break;
                                }
                            }

                            if (foundIndex !== -1) {
                                nextItemToHover = optionList.find(`li:eq(${foundIndex}) a`);
                            }
                            break;
                    }

                    if (nextItemToHover.length > 0) {
                        optionList.find('a.hover-focus').removeClass('hover-focus');
                        nextItemToHover.addClass('hover-focus');

                        // Scroll into view if necessary
                        if (isElementScrollable(optionList)) {
                            const itemTop = nextItemToHover.closest('li').position().top;
                            const listScrollTop = optionList.scrollTop();
                            const listItemHeight = nextItemToHover.closest('li').outerHeight();
                            const listHeight = optionList.height();

                            if (itemTop < 0) { // Item is above current view
                                optionList.scrollTop(listScrollTop + itemTop);
                            } else if (itemTop + listItemHeight > listHeight) { // Item is below current view
                                optionList.scrollTop(listScrollTop + itemTop - listHeight + listItemHeight);
                            }
                        }
                    }

                    // Reset key buffer after a short delay
                    window.selectKeyBuffer.inputTimeout = setTimeout(() => {
                        window.selectKeyBuffer.currentInput = '';
                    }, 500); // Increased timeout slightly for more natural typing
                });
            } // End keyboard navigation

            // Click handler for the custom dropdown trigger
            displayTrigger.on('click', function (evt) {
                evt.preventDefault();
                evt.stopPropagation(); // Stop propagation to prevent global document click from immediately closing it

                const isCurrentlyVisible = optionList.is(':visible');

                // Hide all other open dropdowns first, then toggle this one
                hideAllCustomSelectors();

                if (!isCurrentlyVisible) {
                    optionList.show();
                    $(this).addClass(pluginConfig.activeTriggerClass);

                    // Manage dropdown width to match trigger or widest option
                    let currentListWidth = $(this).outerWidth();
                    if (pluginConfig.adjustListWidthForBorder) {
                        currentListWidth -= (parseInt(optionList.css('borderLeftWidth'), 10) || 0) +
                                            (parseInt(optionList.css('borderRightWidth'), 10) || 0);
                    }
                    optionList.css('min-width', currentListWidth);

                    // Re-calculate the widest element dynamically on open
                    let widestOptionWidth = 0;
                    optionList.find('a').each(function() {
                        // Temporarily make it inline-block to get true content width
                        $(this).css('display', 'inline-block');
                        const currentOptionWidth = $(this).outerWidth();
                        $(this).css('display', ''); // Reset display
                        if (currentOptionWidth > widestOptionWidth) {
                            widestOptionWidth = currentOptionWidth;
                        }
                    });

                    // Ensure list width accommodates widest option and trigger width
                    if (widestOptionWidth > currentListWidth) {
                        optionList.width(widestOptionWidth);
                    } else {
                        optionList.width(currentListWidth);
                    }

                    // Set initial hover focus if keyboard nav is enabled and no item is focused
                    if (pluginConfig.enableKeyboardNavigation && optionList.find('a.hover-focus').length === 0) {
                        const selectedOptionLink = optionList.find(`.${pluginConfig.optionSelectedClass}`);
                        if (selectedOptionLink.length > 0) {
                            selectedOptionLink.first().addClass('hover-focus');
                            // Scroll to selected item on open
                            if (isElementScrollable(optionList)) {
                                optionList.scrollTop(selectedOptionLink.first().closest('li').position().top);
                            }
                        } else {
                            optionList.find('li:first-child a').addClass('hover-focus');
                        }
                    }
                }
            });
        }); // End of each() loop
    }; // End of $.fn.customSelect
})(jQuery);