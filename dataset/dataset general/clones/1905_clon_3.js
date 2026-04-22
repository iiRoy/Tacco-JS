!function(jQ) {
    // Defines the core component class for enhanced dropdown functionality.
    // This component transforms a standard <select> element into a styled dropdown.
    var DropdownSelector = function(targetElement, configSettings, domEvent) {
        // Halt event propagation and prevent default actions if an event is provided.
        if (domEvent) {
            domEvent.stopPropagation();
            domEvent.preventDefault();
        }

        // Store references to the original select element and the new UI elements.
        this.originalInput = jQ(targetElement);
        this.componentWrapper = null; // Will hold the new rendered dropdown container.
        this.controlButton = null;    // Will hold the interactive button element.

        // Merge default settings, user-provided options, and data attributes from the element.
        // Data attributes take precedence over defaults, and explicit options over data attributes.
        this.componentOptions = jQ.extend(
            {},
            jQ.fn.dropdownSelector.standardSettings,
            this.originalInput.data(),
            typeof configSettings === 'object' && configSettings
        );

        // If no title is explicitly set in options or data, check the original element's 'title' attribute.
        if (this.componentOptions.title === null) {
            this.componentOptions.title = this.originalInput.attr('title');
        }

        // Expose public methods directly on the instance for easier access.
        this.getSetValue = DropdownSelector.prototype.getSetValue;
        this.updateDisplay = DropdownSelector.prototype.updateDisplay;

        // Begin the initialization process for the component.
        this.initializeComponent();
    };

    // Prototype methods for the DropdownSelector class.
    DropdownSelector.prototype = {

        // Explicitly set the constructor reference.
        constructor: DropdownSelector,

        /**
         * Initializes the dropdown component, hiding the original select and constructing the new UI.
         * @param {Event} [domEvent] - Optional event object, primarily for internal use if triggered by an event.
         */
        initializeComponent: function (domEvent) {
            var selfRef = this; // Cache 'this' for use in nested functions.

            // Hide the native select element as it's replaced by our custom UI.
            this.originalInput.hide();
            // Determine if the original select allows multiple selections.
            this.isMultiSelect = this.originalInput.prop('multiple');

            // Extract classes and ID from the original select element.
            var elementClasses = this.originalInput.attr('class') !== undefined ?
                                 this.originalInput.attr('class').split(/\s+/) : [];
            var elementId = this.originalInput.attr('id');

            // Insert the newly created UI structure immediately after the original select.
            this.originalInput.after(this.assembleComponentUI());
            // Get a reference to the newly created dropdown container.
            this.componentWrapper = this.originalInput.next('.custom-dropdown');

            // Cache common jQuery elements within the new component.
            var currentWrapper = this.componentWrapper;
            var dropdownMenu = this.componentWrapper.find('.selector-menu');
            var menuIndicator = this.componentWrapper.find('.menu-indicator');
            var menuLinks = dropdownMenu.find('li > a');

            // Temporarily open the dropdown to measure list item height accurately, then close it.
            currentWrapper.addClass('is-open');
            var listItemHeight = currentWrapper.find('.selector-menu li > a').outerHeight();
            currentWrapper.removeClass('is-open');

            // Measure divider height for calculations.
            var dividerHeight = dropdownMenu.find('li .item-separator').outerHeight(true);

            // Get initial positioning data for the dropdown.
            var wrapperOffsetTop = this.componentWrapper.offset().top;
            var componentHeight = this.componentWrapper.outerHeight();
            this.controlButton = this.componentWrapper.find('> button');

            // If the original element had an ID, transfer it to the new button and link labels.
            if (elementId !== undefined) {
                this.controlButton.attr('id', elementId);
                jQ('label[for="' + elementId + '"]').on('click', function() {
                    currentWrapper.find('button#' + elementId).focus();
                });
            }

            // Copy non-'selectpicker' classes from the original element to the new wrapper.
            jQ.each(elementClasses, function(idx, className) {
                if (className !== 'selectpicker') { // Exclude the original plugin class name.
                    selfRef.componentWrapper.addClass(className);
                }
            });

            // Add a specific class for multi-select functionality.
            if (this.isMultiSelect) {
                 this.componentWrapper.addClass('multi-select-enabled');
            }

            // Apply styling from options to the button and menu.
            this.controlButton.addClass(this.componentOptions.buttonStyle);
            dropdownMenu.addClass(this.componentOptions.menuStyle);
            menuIndicator.addClass(function() {
                if (selfRef.componentOptions.menuStyle) {
                    return selfRef.componentOptions.menuStyle.replace('dropdown-', 'indicator-');
                }
            });

            // Perform initial checks for disabled state and tab index.
            this.evaluateControlState();
            this.transferTabIndex();

            // Setup event listeners for user interactions.
            this.attachEventHandlers();

            // Calculate padding and border for the dropdown menu.
            var menuVerticalPadding = parseInt(dropdownMenu.css('padding-top')) +
                                      parseInt(dropdownMenu.css('padding-bottom')) +
                                      parseInt(dropdownMenu.css('border-top-width')) +
                                      parseInt(dropdownMenu.css('border-bottom-width'));

            // Handle 'auto' sizing or fixed size based on options.
            if (this.componentOptions.menuSize === 'auto') {
                var calculateMenuDimensions = function() {
                    // Current scroll position relative to the window.
                    var wrapperOffsetTopScroll = wrapperOffsetTop - jQ(window).scrollTop();
                    var windowInnerHeight = jQ(window).innerHeight();
                    // Additional vertical space taken by menu margins and other elements.
                    var menuExtraSpace = menuVerticalPadding +
                                         parseInt(dropdownMenu.css('margin-top')) +
                                         parseInt(dropdownMenu.css('margin-bottom')) + 2;

                    // Calculate available space below the component.
                    var availableSpaceBelow = windowInnerHeight - wrapperOffsetTopScroll - componentHeight - menuExtraSpace;
                    var dynamicMenuHeight = availableSpaceBelow;

                    // If the dropdown is set to 'dropup' mode, calculate space above.
                    if (currentWrapper.hasClass('dropup')) {
                        dynamicMenuHeight = wrapperOffsetTopScroll - menuExtraSpace;
                    }

                    // Apply calculated max-height and overflow properties.
                    dropdownMenu.css({
                        'max-height': dynamicMenuHeight + 'px',
                        'overflow-y': 'auto',
                        'min-height': listItemHeight * 3 + 'px' // Ensure a minimum visible height.
                    });
                };
                calculateMenuDimensions(); // Initial calculation.
                jQ(window).on('resize', calculateMenuDimensions); // Recalculate on window resize.
                jQ(window).on('scroll', calculateMenuDimensions); // Recalculate on window scroll.
                this.originalInput.on('DOMNodeInserted', calculateMenuDimensions); // Recalculate on DOM changes.
            } else if (this.componentOptions.menuSize && this.componentOptions.menuSize !== 'auto' &&
                       dropdownMenu.find('li').length > this.componentOptions.menuSize) {
                // For fixed size, calculate height based on number of items.
                var visibleItemCount = dropdownMenu.find("li > *").filter(':not(.item-separator)').slice(0, this.componentOptions.menuSize).last().parent().index();
                var separatorCount = dropdownMenu.find("li").slice(0, visibleItemCount + 1).find('.item-separator').length;
                var fixedMenuHeight = listItemHeight * this.componentOptions.menuSize + separatorCount * dividerHeight + menuVerticalPadding;
                dropdownMenu.css({
                    'max-height': fixedMenuHeight + 'px',
                    'overflow-y': 'scroll'
                });
            }

            // Listen for DOM changes in the original select to refresh the list items.
            this.originalInput.on('DOMNodeInserted', jQ.proxy(this.refreshListItems, this));

            // Perform an initial rendering of the component's display text.
            this.updateDisplay();
        },

        /**
         * Creates the outer HTML structure for the dropdown component.
         * @returns {jQuery} A jQuery object representing the dropdown shell.
         */
        buildComponentShell: function() {
            var shellHtml =
                "<div class='btn-group custom-dropdown'>" +
                    "<button class='btn dropdown-toggle clearfix' data-toggle='dropdown'>" +
                        "<span class='selected-value-display pull-left'></span>&nbsp;" +
                        "<span class='caret'></span>" +
                    "</button>" +
                    "<span class='menu-indicator'></span>" +
                    "<ul class='selector-menu' role='menu'>" +
                    "</ul>" +
                "</div>";
            return jQ(shellHtml);
        },

        /**
         * Assembles the complete UI for the dropdown by combining the shell and list items.
         * @returns {jQuery} A jQuery object representing the full component UI.
         */
        assembleComponentUI: function() {
            var dropdownContainer = this.buildComponentShell();
            var generatedListItems = this.generateListElements();
            dropdownContainer.find('ul').append(generatedListItems);
            return dropdownContainer;
        },

        /**
         * Clears existing list items and rebuilds them from the original select element.
         */
        refreshListItems: function() {
            this.clearListItems(); // Remove all current list items.
            var regeneratedItems = this.generateListElements(); // Generate new ones.
            this.componentWrapper.find('ul').append(regeneratedItems); // Add to the UI.
            this.updateDisplay(); // Refresh the visible display.
        },

        /**
         * Removes all `<li>` elements from the custom dropdown menu.
         */
        clearListItems: function() {
            this.componentWrapper.find('li').remove();
        },

        /**
         * Generates the `<li>` elements for the dropdown menu based on the original `<option>` tags.
         * @returns {jQuery} A jQuery object containing the generated `<li>` elements.
         */
        generateListElements: function() {
            var selfRef = this;
            var optionTexts = [];
            var optionLinks = [];
            var fullListHtml = '';

            // First pass: collect option texts (not strictly necessary but mimics original structure).
            this.originalInput.find('option').each(function() {
                optionTexts.push(jQ(this).text());
            });

            // Second pass: generate the actual list item HTML.
            this.originalInput.find('option').each(function(index) {
                var currentOption = jQ(this);
                var itemClass = currentOption.attr("class") !== undefined ? currentOption.attr("class") : '';
                var itemText = currentOption.text();
                var itemSubtext = currentOption.data('subtext') !== undefined ?
                                  '<small class="muted-info">' + currentOption.data('subtext') + '</small>' : '';

                // Append subtext to the main text.
                itemText += itemSubtext;

                // Handle optgroups, dividers, and hidden options.
                if (currentOption.parent().is('optgroup') && currentOption.data('divider') !== true) {
                    if (currentOption.index() === 0) {
                        var groupLabel = currentOption.parent().attr('label');
                        var groupSubtext = currentOption.parent().data('subtext') !== undefined ?
                                           '<small class="muted-info">' + currentOption.parent().data('subtext') + '</small>' : '';
                        groupLabel += groupSubtext;

                        if (currentOption[0].index !== 0) {
                            optionLinks.push(
                                '<div class="item-separator"></div>' +
                                '<dt class="group-label">' + groupLabel + '</dt>' +
                                selfRef.createListItemLink(itemText, "option-item " + itemClass)
                            );
                        } else {
                            optionLinks.push(
                                '<dt class="group-label">' + groupLabel + '</dt>' +
                                selfRef.createListItemLink(itemText, "option-item " + itemClass)
                            );
                        }
                    } else {
                        optionLinks.push(selfRef.createListItemLink(itemText, "option-item " + itemClass));
                    }
                } else if (currentOption.data('divider') === true) {
                    optionLinks.push('<div class="item-separator"></div>');
                } else if (currentOption.data('hidden') === true) {
                    // Hidden options generate an empty string, effectively skipping the item.
                    optionLinks.push('');
                } else {
                    optionLinks.push(selfRef.createListItemLink(itemText, itemClass));
                }
            });

            // Assemble the full HTML string for the list.
            if (optionLinks.length > 0) {
                for (var i = 0; i < optionLinks.length; i++) {
                    fullListHtml += "<li data-index=" + i + ">" + optionLinks[i] + "</li>";
                }
            }

            // If no option is selected and no title is provided, select the first option by default.
            if (this.originalInput.find('option:selected').length === 0 && !selfRef.componentOptions.title) {
                this.originalInput.find('option').eq(0).prop('selected', true).attr('selected', 'selected');
            }

            return jQ(fullListHtml);
        },

        /**
         * Creates the anchor tag HTML for a list item.
         * @param {string} displayContent - The text and subtext to be displayed.
         * @param {string} additionalClasses - Any extra CSS classes for the anchor tag.
         * @returns {string} The HTML string for the list item's anchor.
         */
        createListItemLink: function(displayContent, additionalClasses) {
            return '<a tabindex="-1" href="#" class="' + additionalClasses + '">' +
                   '<span class="content-display pull-left">' + displayContent + '</span>' +
                   '</a>';
        },

        /**
         * Updates the visual display of the dropdown component to reflect the current selection.
         */
        updateDisplay: function() {
            var selfRef = this;

            // Adjust component width based on options.
            if (this.componentOptions.widthType === 'auto') {
                var menuWidth = this.componentWrapper.find('.selector-menu').css('width');
                this.componentWrapper.css('width', menuWidth);
            } else if (this.componentOptions.widthType && this.componentOptions.widthType !== 'auto') {
                this.componentWrapper.css('width', this.componentOptions.widthType);
            }

            // Iterate through original options to update selected/disabled states in the UI.
            this.originalInput.find('option').each(function(index) {
                var currentOption = jQ(this);
                selfRef.setOptionDisabled(index, currentOption.is(':disabled') || currentOption.parent().is(':disabled'));
                selfRef.markOptionSelected(index, currentOption.is(':selected'));
            });

            // Collect text for selected items.
            var selectedItemTexts = this.originalInput.find('option:selected').map(function() {
                var currentSelected = jQ(this);
                return currentSelected.attr('data-title') !== undefined ?
                       currentSelected.attr('data-title') : currentSelected.text();
            }).toArray();

            // Format the selected items into a display string.
            var displayTitle = selectedItemTexts.join(", ");

            // Handle multi-select count display format.
            if (selfRef.isMultiSelect && selfRef.componentOptions.selectedTextFormat.indexOf('count') > -1) {
                var maxCountParts = selfRef.componentOptions.selectedTextFormat.split(">");
                // Check if the number of selected items exceeds a threshold or if it's 2 or more.
                if ((maxCountParts.length > 1 && selectedItemTexts.length > parseInt(maxCountParts[1], 10)) ||
                    (maxCountParts.length === 1 && selectedItemTexts.length >= 2)) {
                    displayTitle = selectedItemTexts.length + ' of ' +
                                   this.originalInput.find('option').length + ' items selected';
                }
            }

            // If no title is available, use the component's title option or a default "none selected" text.
            if (!displayTitle) {
                displayTitle = selfRef.componentOptions.title !== undefined ?
                               selfRef.componentOptions.title : selfRef.componentOptions.noSelectionMessage;
            }

            // Update the text in the display area of the component button.
            this.componentWrapper.find('.selected-value-display').html(displayTitle);
        },

        /**
         * Marks a specific list item as selected or unselected in the UI.
         * @param {number} itemIndex - The index of the item to modify.
         * @param {boolean} isSelected - True to mark as selected, false to unmark.
         */
        markOptionSelected: function(itemIndex, isSelected) {
            var targetListItem = this.componentWrapper.find('li').eq(itemIndex);
            if (isSelected) {
                targetListItem.addClass('selected');
            } else {
                targetListItem.removeClass('selected');
            }
        },

        /**
         * Marks a specific list item as disabled or enabled in the UI.
         * @param {number} itemIndex - The index of the item to modify.
         * @param {boolean} isDisabled - True to mark as disabled, false to enable.
         */
        setOptionDisabled: function(itemIndex, isDisabled) {
            var targetListItem = this.componentWrapper.find('li').eq(itemIndex);
            if (isDisabled) {
                targetListItem.addClass('disabled');
            } else {
                targetListItem.removeClass('disabled');
            }
        },

        /**
         * Checks the disabled state of the original select element and applies it to the custom button.
         */
        evaluateControlState: function() {
            if (this.originalInput.is(':disabled')) {
                this.controlButton.addClass('disabled');
                // Prevent click on disabled button.
                this.controlButton.on('click', function(e) {
                    e.preventDefault();
                });
            } else {
                this.controlButton.removeClass('disabled');
                this.controlButton.off('click'); // Remove the prevention if it was added.
            }
        },

        /**
         * Transfers the tabindex attribute from the original select element to the custom button.
         */
        transferTabIndex: function() {
            if (this.originalInput.is('[tabindex]')) {
                var originalTabIndex = this.originalInput.attr("tabindex");
                this.controlButton.attr('tabindex', originalTabIndex);
            }
        },

        /**
         * Attaches all necessary event handlers for the dropdown component's interactivity.
         */
        attachEventHandlers: function() {
            var selfRef = this;

            // Prevent dropdown menu from closing on touch events on mobile.
            jQ('body').on('touchstart.dropdown', '.selector-menu', function (e) {
                e.stopPropagation();
            });

            // Handle clicks on individual list items (options).
            this.componentWrapper.on('click', 'li a', function(e) {
                var clickedItemIndex = jQ(this).parent().data('index');
                var currentListItem = jQ(this).parent();
                var parentDropdown = currentListItem.parents('.custom-dropdown');

                // For multi-select, prevent the dropdown from closing immediately.
                if (selfRef.isMultiSelect) {
                    e.stopPropagation();
                }

                e.preventDefault(); // Prevent default link behavior.

                // Only proceed if the original select is not disabled and the list item is not disabled.
                if (!parentDropdown.prev('select').is(':disabled') && !currentListItem.hasClass('disabled')) {
                    var originalOptions = parentDropdown.prev('select').find('option');

                    if (!selfRef.isMultiSelect) {
                        // For single select, deselect all others and select the clicked one.
                        originalOptions.prop('selected', false).removeAttr('selected');
                        originalOptions.eq(clickedItemIndex).prop('selected', true).attr('selected', 'selected');
                    } else {
                        // For multi-select, toggle the selected state of the clicked option.
                        var isCurrentlySelected = originalOptions.eq(clickedItemIndex).prop('selected');
                        if (isCurrentlySelected) {
                            originalOptions.eq(clickedItemIndex).prop('selected', false).removeAttr('selected');
                        } else {
                            originalOptions.eq(clickedItemIndex).prop('selected', true).attr('selected', 'selected');
                        }
                    }

                    // Update the display text on the button.
                    selfRef.updateDisplay();
                    // Return focus to the button after selection.
                    parentDropdown.find('button').focus();

                    // Trigger a 'change' event on the original select element.
                    parentDropdown.prev('select').trigger('change');
                }
            });

            // Prevent interaction with disabled items, optgroup labels, or dividers.
            this.componentWrapper.on('click', 'li.disabled a, li dt, li .item-separator', function(e) {
                e.preventDefault();
                e.stopPropagation();
                var parentDropdown = jQ(this).parents('.custom-dropdown');
                parentDropdown.find('button').focus(); // Keep focus on the button.
            });

            // Listen for changes on the original select element to re-render the custom component.
            this.originalInput.on('change', function() {
                selfRef.updateDisplay();
            });
        },

        /**
         * Gets or sets the value of the original select element.
         * @param {*} [newValue] - The value to set. If undefined, returns the current value.
         * @returns {jQuery|*} Returns the jQuery object for chaining if setting a value,
         *                     otherwise returns the current value of the select element.
         */
        getSetValue: function(newValue) {
            if (newValue !== undefined) {
                // Set the value of the original select and trigger a change event.
                this.originalInput.val(newValue);
                this.originalInput.trigger('change');
                return this.originalInput;
            } else {
                // Return the current value of the original select.
                return this.originalInput.val();
            }
        }
    };

    // jQuery plugin definition.
    jQ.fn.dropdownSelector = function(actionOrOptions, eventObject) {
       var methodArgs = arguments; // Capture all arguments for method calls.
       var methodResult; // Stores the return value if a method is called.
       var jQChain = this.each(function () {
            var currentElement = jQ(this);
            var instanceData = currentElement.data('dropdownSelectorInstance');
            var initialOptions = typeof actionOrOptions === 'object' && actionOrOptions;

            // If no instance exists, create a new one.
            if (!instanceData) {
            	currentElement.data('dropdownSelectorInstance', (instanceData = new DropdownSelector(this, initialOptions, eventObject)));
            } else if (typeof actionOrOptions === 'object') {
                // If an instance exists and options are passed, update its options.
            	jQ.extend(true, instanceData.componentOptions, actionOrOptions);
            }

            // If the first argument is a string, attempt to call a method on the instance.
            if (typeof actionOrOptions === 'string') {
                var methodName = actionOrOptions;
                // Check if the method exists and is a function.
                if (typeof instanceData[methodName] === 'function') {
                    // Shift arguments to pass only method parameters.
                    [].shift.apply(methodArgs);
                    methodResult = instanceData[methodName].apply(instanceData, methodArgs);
                } else {
                    // If method is not a function, assume it's a property.
                    methodResult = instanceData[methodName];
                }
            }
        });

        // If a method returned a value, return that value; otherwise, return the jQuery chain.
        return methodResult !== undefined ? methodResult : jQChain;
    };

    // Default configuration settings for the DropdownSelector plugin.
    jQ.fn.dropdownSelector.standardSettings = {
        buttonStyle: null,            // CSS class for the main button.
        menuSize: 'auto',             // 'auto' or a number for fixed visible items.
        title: null,                  // Default title if no option is selected.
        selectedTextFormat : 'values', // How selected text is displayed ('values', 'count', 'count > X').
        noSelectionMessage : 'No items selected', // Message when nothing is selected.
        widthType: null,              // 'auto' or specific CSS width (e.g., '200px').
        menuStyle: null,              // CSS class for the dropdown menu.
        animationSpeed: 150           // Speed for animations (e.g., dropdown open/close).
    };

}(window.jQuery);