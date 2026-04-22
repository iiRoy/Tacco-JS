/*!
 * Item Selection Module
 * A refined component for interactive item selection.
 *
 * Adapted from (c) 2012 Stefan Petre's original work
 * Licensed under Apache License v2.0
 *
 */

(function(constructorFn) {
    "use strict";
    // Universal Module Definition (UMD) pattern
    if (typeof define === 'function' && define.amd) {
        // AMD support
        define(['jquery'], constructorFn);
    } else if (window.jQuery && !window.jQuery.fn.itemSelector) {
        // Browser global, if jQuery is present and plugin not yet registered
        constructorFn(window.jQuery);
    }
}
(function($) {
    'use strict';

    // Core utility functions for internal use
    var internalTools = {
        // Checks if a value is effectively empty
        isValEmpty: function(currentValue) {
            return (currentValue === false || currentValue === '' || currentValue === null || currentValue === undefined);
        },
        // Checks if an object or array is empty
        isCollectionEmpty: function(collection) {
            return this.isValEmpty(collection) || (collection.length === 0 && typeof collection.length === 'number');
        },
        // Validates if a jQuery selector finds any elements
        selectorExists: function(domSelector) {
            return ($(domSelector).length > 0);
        },
        // Determines if a value is a string type
        isTextType: function(txt) {
            return (typeof txt === 'string' || txt instanceof String);
        },
        // Checks if a value is an array
        isListType: function(listCandidate) {
            return $.isArray(listCandidate);
        },
        // Verifies if a value is present in an array
        valueInList: function(item, targetList) {
            return ($.inArray(item, targetList) !== -1);
        },
        // Throws a standardized error message
        throwComponentError: function(messageText) {
            throw "Item Selector Component Error: " + messageText;
        }
    };

    // The main ItemSelector class definition
    var ItemSelector = function(elementNode, customOptions) {
        // Assign a unique key for this instance
        this.instanceKey = ItemSelector.globalInstanceCount++;

        // Store the main element and add a marker class
        this.hostElement = $(elementNode).addClass('selector-base-element');
        if (!this.hostElement.length) {
            internalTools.throwComponentError("Host element not found or invalid.");
            return; // Guard clause for invalid element
        }

        // Trigger an event indicating creation has started
        this.fireCustomEvent('selectorInitialization');

        // Merge default settings with element data and user-provided options
        this.currentSettings = $.extend(true, {}, ItemSelector.baseSettings, this.hostElement.data(), customOptions);
        // Ensure templates are deeply merged
        this.currentSettings.renderTemplates = $.extend(true, {}, ItemSelector.baseSettings.renderTemplates, this.currentSettings.renderTemplates);
        this.currentSettings.initialPlacement = this.currentSettings.displayPlacement; // Store original for potential resets

        // Determine the parent wrapper element for positioning
        this.wrapperElement = (internalTools.selectorExists(this.currentSettings.parentContainer) ? $(this.currentSettings.parentContainer) : false);
        if (this.wrapperElement === false) {
            this.wrapperElement = (this.hostElement.is('input') ? this.hostElement.parent() : this.hostElement);
        }
        if (this.wrapperElement.addClass('selector-wrapper').is('.dropdown-menu')) {
            this.currentSettings.displayPlacement = 'inline'; // Force inline for dropdown menus
        }

        // Identify the linked input element, if any
        this.linkedInput = (this.hostElement.is('input') ? this.hostElement.addClass('selector-input-field') : false);
        if (this.linkedInput === false) {
            this.linkedInput = (this.wrapperElement.find(this.currentSettings.inputField));
        }

        // Identify the trigger component (e.g., an addon button)
        this.triggerComponent = this.wrapperElement.find(this.currentSettings.activationComponent).addClass('selector-activation-btn');
        if (this.triggerComponent.length === 0) {
            this.triggerComponent = false;
        }

        // Generate the popover and the actual item selection content
        this.popoverContainer = this.constructPopoverShell();
        this.selectionPanel = this.constructSelectionPanel();

        // Check for the presence of an 'Accept' button
        if (this.getAcceptActionElement().length === 0) {
            this.currentSettings.requireAccept = false; // Disable if button is missing
        }

        // Attach the popover to the correct DOM location
        if (this.wrapperElement.is('.input-group')) {
            this.wrapperElement.parent().append(this.popoverContainer);
        } else {
            this.wrapperElement.append(this.popoverContainer);
        }

        // Set up event listeners
        this.bindUserInteractionEvents();
        this.bindWindowAndDocumentEvents();

        // Initialize the selection based on configuration
        this.setSelection(this.currentSettings.selectedItemValue);

        // If inline, show immediately
        if (this.isDisplayInline()) {
            this.displayPanel();
        }

        // Event indicating creation is complete
        this.fireCustomEvent('selectorReady');
    };

    // Static counter for unique instance IDs
    ItemSelector.globalInstanceCount = 0;

    // Default configuration settings for ItemSelector instances
    ItemSelector.baseSettings = {
        panelTitle: false, // Optional title for the popover panel
        selectedItemValue: false, // Initial selected item value
        fallbackValue: false, // Value to use if no other is provided
        displayPlacement: 'bottom', // 'auto', 'top', 'bottom', 'left', 'right'
        collisionStrategy: 'none', // 'none', 'flip', 'fit' for repositioning
        enableAnimation: true, // Apply CSS transitions
        // Auto-hide panel after selection, ignored if requireAccept is true and accept button is visible
        autoHideOnSelect: false,
        showFooterSection: false,
        searchInFooter: false, // If true, search input moves to footer
        requireAccept: false, // Only applies if an accept button is present in footer
        activeItemClass: 'bg-primary', // CSS class for the selected item
        // Default list of selectable items
        availableItems: ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'],
        inputField: 'input', // Selector for child input element
        activationComponent: '.input-group-addon', // Selector for trigger element
        parentContainer: false, // Element to append popover to. If false, appends to wrapperElement.
        // HTML templates for rendering the component
        renderTemplates: {
            popoverShell: '<div class="item-selector-popover popover"><div class="arrow"></div>' +
                    '<div class="popover-title"></div><div class="popover-content"></div></div>',
            footerContent: '<div class="popover-footer"></div>',
            actionButtons: '<button class="selector-action-btn selector-cancel-btn btn btn-default btn-sm">Cancel</button>' +
                    ' <button class="selector-action-btn selector-accept-btn btn btn-primary btn-sm">Accept</button>',
            searchInput: '<input type="search" class="form-control selector-search-input" placeholder="Filter items..." />',
            selectionArea: '<div class="item-selection-area"><div class="item-list-container"></div></div>',
            listItem: '<div class="selectable-item"><span></span></div>', // Using span instead of i
        }
    };

    // Static method to operate on multiple ItemSelector instances
    ItemSelector.processMultiple = function(targetSelector, methodName) {
        var operationArgs = Array.prototype.slice.call(arguments, 2);
        return $(targetSelector).each(function() {
            var instanceRef = $(this).data('itemSelector');
            if (!!instanceRef && typeof instanceRef[methodName] === 'function') {
                instanceRef[methodName].apply(instanceRef, operationArgs);
            }
        });
    };

    // ItemSelector prototype methods
    ItemSelector.prototype = {
        // Ensure constructor points to ItemSelector
        constructor: ItemSelector,
        // Active settings for this instance
        currentSettings: {},
        // Unique identifier for this instance
        uniqueId: 0,
        // Current selected value (can be temporary before accept)
        temporarySelectionValue: null,

        // Fires a custom event on the host element
        fireCustomEvent: function(eventName, eventData) {
            eventData = eventData || {};
            this.hostElement.trigger($.extend({
                type: eventName,
                selectorInstance: this
            }, eventData));
            //console.log(eventName + ' triggered for instance #' + this.uniqueId);
        },

        // Creates the base popover structure
        constructPopoverShell: function() {
            var popoverElement = $(this.currentSettings.renderTemplates.popoverShell);

            // Handle the title/header section
            var headerSection = popoverElement.find('.popover-title');
            if (this.currentSettings.panelTitle) {
                headerSection.append($('<div class="popover-header-text">' + this.currentSettings.panelTitle + '</div>'));
            }

            // Add search input to title if not in footer and buttons are present
            if (!this.currentSettings.searchInFooter && !internalTools.isValEmpty(this.currentSettings.renderTemplates.actionButtons)) {
                headerSection.append(this.currentSettings.renderTemplates.searchInput);
            } else if (!this.currentSettings.panelTitle && headerSection.children().length === 0) {
                // If no title text and no search added, remove the title section
                headerSection.remove();
            }

            // Handle the footer section
            if (this.currentSettings.showFooterSection && !internalTools.isValEmpty(this.currentSettings.renderTemplates.footerContent)) {
                var footerSection = $(this.currentSettings.renderTemplates.footerContent);
                if (this.currentSettings.searchInFooter && !internalTools.isValEmpty(this.currentSettings.renderTemplates.searchInput)) {
                    footerSection.append($(this.currentSettings.renderTemplates.searchInput));
                }
                if (!internalTools.isValEmpty(this.currentSettings.renderTemplates.actionButtons)) {
                    footerSection.append($(this.currentSettings.renderTemplates.actionButtons));
                }
                popoverElement.append(footerSection);
            }

            // Add animation class if enabled
            if (this.currentSettings.enableAnimation) {
                popoverElement.addClass('fade');
            }

            return popoverElement;
        },

        // Creates the actual item selection panel content
        constructSelectionPanel: function() {
            var instanceRef = this;
            var panelElement = $(this.currentSettings.renderTemplates.selectionArea);

            // Handler for when an item is clicked
            var itemSelectionHandler = function(eventObj) {
                var clickedItem = $(this);
                if (clickedItem.is('span')) { // If inner span was clicked
                    clickedItem = clickedItem.parent();
                }

                var selectedValue = clickedItem.data('item-value');
                instanceRef.temporarySelectionValue = selectedValue; // Store temporarily

                instanceRef.fireCustomEvent('itemSelectionAttempt', {
                    selectedPanelItem: clickedItem,
                    selectedValue: selectedValue
                });

                if (!instanceRef.currentSettings.requireAccept) {
                    // If no explicit accept is needed, update immediately
                    instanceRef.setSelection(selectedValue);
                    instanceRef.fireCustomEvent('itemConfirmed', {
                        selectedPanelItem: clickedItem,
                        selectedValue: selectedValue
                    });
                } else {
                    // Highlight the item, but don't finalize selection yet
                    instanceRef.highlightItem(clickedItem);
                }

                // Hide if configured and no accept button required
                if (instanceRef.currentSettings.autoHideOnSelect && !instanceRef.currentSettings.requireAccept) {
                    instanceRef.hidePanel();
                }
            };

            // Populate the panel with items from availableItems
            var itemListContainer = panelElement.find('.item-list-container');
            this.currentSettings.availableItems.forEach(function(itemValue) {
                var listItemElement = $(instanceRef.currentSettings.renderTemplates.listItem);
                listItemElement.find('span').text(itemValue); // Use text() for safety
                listItemElement.data('item-value', itemValue)
                               .on('click.itemSelector', itemSelectionHandler);
                itemListContainer.append(listItemElement);
            });

            this.popoverContainer.find('.popover-content').append(panelElement);
            return panelElement;
        },

        // Checks if a given event originated within the selector's popover or host
        isEventOriginWithinSelector: function(event) {
            var targetElement = $(event.target);
            // Check if target is the host element itself, and not an ancestor
            var isHost = targetElement.is(this.hostElement);
            // Check if target is inside the popover or the host element
            var isInsidePopover = targetElement.parents('.item-selector-popover').length > 0;
            var isInsideHostWrapper = targetElement.parents('.selector-base-element').length > 0;

            return isHost || isInsidePopover || isInsideHostWrapper;
        },

        // Binds events to the component's elements
        bindUserInteractionEvents: function() {
            var instanceRef = this;

            // Search input filtering
            this.getSearchInputField().on('keyup.itemSelector', function() {
                instanceRef.filterItems($(this).val().toLowerCase());
            });

            // Accept button action
            this.getAcceptActionElement().on('click.itemSelector', function() {
                var currentlyHighlighted = instanceRef.selectionPanel.find('.' + instanceRef.currentSettings.activeItemClass);
                var finalizedValue = instanceRef.temporarySelectionValue || instanceRef.getSelection();

                instanceRef.setSelection(finalizedValue); // Finalize the selection

                instanceRef.fireCustomEvent('itemConfirmed', {
                    selectedPanelItem: currentlyHighlighted,
                    selectedValue: finalizedValue
                });

                if (!instanceRef.isDisplayInline()) {
                    instanceRef.hidePanel();
                }
            });

            // Cancel button action
            this.getCancelActionElement().on('click.itemSelector', function() {
                if (!instanceRef.isDisplayInline()) {
                    instanceRef.hidePanel();
                }
            });

            // Host element focus to show panel
            this.hostElement.on('focus.itemSelector', function(e) {
                instanceRef.displayPanel();
                e.stopPropagation(); // Prevent bubbling to document
            });

            // Trigger component click to toggle panel
            if (this.hasTriggerComponent()) {
                this.triggerComponent.on('click.itemSelector', function() {
                    instanceRef.togglePanelVisibility();
                });
            }

            // Input field keyup events
            if (this.hasLinkedInput()) {
                this.linkedInput.on('keyup.itemSelector', function(e) {
                    // Ignore common navigation/modifier keys
                    var ignoredKeys = [38, 40, 37, 39, 16, 17, 18, 9, 8, 91, 93, 20, 46, 186, 190, 46, 78, 188, 44, 86];
                    if (!internalTools.valueInList(e.keyCode, ignoredKeys)) {
                        instanceRef.setSelection(instanceRef.linkedInput.val()); // Update based on input
                    } else {
                        // Validate input field if a specific key was pressed
                        instanceRef.updateInputValidityState(instanceRef.isValidChoice(this.value));
                    }
                });
            }
        },

        // Binds global window and document events
        bindWindowAndDocumentEvents: function() {
            var documentBody = $(window.document);
            var instanceRef = this;
            var eventNamespace = '.itemSelector.instance' + this.instanceKey; // Unique namespace

            // Reposition popover on window resize/orientation change
            $(window).on('resize' + eventNamespace + ' orientationchange' + eventNamespace, function(e) {
                if (instanceRef.popoverContainer.hasClass('in')) {
                    instanceRef.refreshPanelPosition();
                }
            });

            // Hide panel when clicking outside
            if (!instanceRef.isDisplayInline()) {
                documentBody.on('mouseup' + eventNamespace, function(e) {
                    if (!instanceRef.isEventOriginWithinSelector(e)) {
                        instanceRef.hidePanel();
                    }
                    e.stopPropagation();
                    // e.preventDefault(); // Sometimes prevents other interactions, keep commented unless needed
                    // return false; // This also stops propagation and default, be careful
                });
            }
        },

        // Unbinds all events from the component's elements
        releaseElementEvents: function() {
            this.popoverContainer.off('.itemSelector');
            this.hostElement.off('.itemSelector');

            if (this.hasLinkedInput()) {
                this.linkedInput.off('.itemSelector');
            }
            if (this.hasTriggerComponent()) {
                this.triggerComponent.off('.itemSelector');
            }
            if (this.hasWrapperElement()) {
                this.wrapperElement.off('.itemSelector');
            }
        },

        // Unbinds global window and document events for this instance
        releaseGlobalEvents: function() {
            $(window).off('.itemSelector.instance' + this.instanceKey);
            $(window.document).off('.itemSelector.instance' + this.instanceKey);
        },

        // Updates the popover's position and collision handling
        refreshPanelPosition: function(newPlacement, newCollisionStrategy) {
            newPlacement = newPlacement || this.currentSettings.displayPlacement;
            this.currentSettings.displayPlacement = newPlacement; // Update stored placement
            newCollisionStrategy = newCollisionStrategy || this.currentSettings.collisionStrategy;
            newCollisionStrategy = (newCollisionStrategy === true ? 'flip' : newCollisionStrategy);

            var positioningOptions = {
                at: "right bottom", // Default alignment of target point
                my: "right top", // Default alignment of popover point
                of: this.linkedInput || this.wrapperElement, // Element to position against
                collision: newCollisionStrategy,
                within: window // Element for collision detection
            };

            // Remove all previous placement classes
            this.popoverContainer.removeClass('inline topLeftCorner topLeft top topRight topRightCorner ' +
                    'rightTop right rightBottom bottomRight bottomRightCorner ' +
                    'bottom bottomLeft bottomLeftCorner leftBottom left leftTop');

            if (typeof newPlacement === 'object') {
                // Allows for custom positioning objects
                return this.popoverContainer.pos($.extend({}, positioningOptions, newPlacement));
            }

            // Apply specific positioning based on the placement string
            switch (newPlacement) {
                case 'inline':
                    {
                        positioningOptions = false; // No positioning needed for inline
                    }
                    break;
                case 'topLeftCorner':
                    {
                        positioningOptions.my = 'right bottom';
                        positioningOptions.at = 'left top';
                    }
                    break;
                case 'topLeft':
                    {
                        positioningOptions.my = 'left bottom';
                        positioningOptions.at = 'left top';
                    }
                    break;
                case 'top':
                    {
                        positioningOptions.my = 'center bottom';
                        positioningOptions.at = 'center top';
                    }
                    break;
                case 'topRight':
                    {
                        positioningOptions.my = 'right bottom';
                        positioningOptions.at = 'right top';
                    }
                    break;
                case 'topRightCorner':
                    {
                        positioningOptions.my = 'left bottom';
                        positioningOptions.at = 'right top';
                    }
                    break;
                case 'rightTop':
                    {
                        positioningOptions.my = 'left bottom';
                        positioningOptions.at = 'right center';
                    }
                    break;
                case 'right':
                    {
                        positioningOptions.my = 'left center';
                        positioningOptions.at = 'right center';
                    }
                    break;
                case 'rightBottom':
                    {
                        positioningOptions.my = 'left top';
                        positioningOptions.at = 'right center';
                    }
                    break;
                case 'bottomRightCorner':
                    {
                        positioningOptions.my = 'left top';
                        positioningOptions.at = 'right bottom';
                    }
                    break;
                case 'bottomRight':
                    {
                        positioningOptions.my = 'right top';
                        positioningOptions.at = 'right bottom';
                    }
                    break;
                case 'bottom':
                    {
                        positioningOptions.my = 'center top';
                        positioningOptions.at = 'center bottom';
                    }
                    break;
                case 'bottomLeft':
                    {
                        positioningOptions.my = 'left top';
                        positioningOptions.at = 'left bottom';
                    }
                    break;
                case 'bottomLeftCorner':
                    {
                        positioningOptions.my = 'right top';
                        positioningOptions.at = 'left bottom';
                    }
                    break;
                case 'leftBottom':
                    {
                        positioningOptions.my = 'right top';
                        positioningOptions.at = 'left center';
                    }
                    break;
                case 'left':
                    {
                        positioningOptions.my = 'right center';
                        positioningOptions.at = 'left center';
                    }
                    break;
                case 'leftTop':
                    {
                        positioningOptions.my = 'right bottom';
                        positioningOptions.at = 'left center';
                    }
                    break;
                default:
                    {
                        // Fallback or do nothing for unknown placement
                        return false;
                    }
            }

            if (positioningOptions) {
                this.popoverContainer.pos(positioningOptions);
            } else {
                // For 'inline' or no positioning, ensure it's visible and positioned statically
                this.popoverContainer.css({position: 'static', left: 'auto', top: 'auto'}).addClass('inline');
            }
            return true;
        },

        // Shows the item selection panel
        displayPanel: function() {
            if (!this.popoverContainer.hasClass('in')) {
                this.popoverContainer.addClass('in');
                this.refreshPanelPosition();
                this.fireCustomEvent('panelShown');
            }
        },

        // Hides the item selection panel
        hidePanel: function() {
            if (this.popoverContainer.hasClass('in')) {
                this.popoverContainer.removeClass('in');
                this.fireCustomEvent('panelHidden');
            }
        },

        // Toggles the visibility of the item selection panel
        togglePanelVisibility: function() {
            if (this.popoverContainer.hasClass('in')) {
                this.hidePanel();
            } else {
                this.displayPanel();
            }
        },

        // Updates the currently selected item
        setSelection: function(newValue, temporaryHighlightOnly) {
            newValue = newValue || (this.hasLinkedInput() ? this.linkedInput.val() : this.hostElement.text());
            if (internalTools.isValEmpty(newValue) && this.currentSettings.fallbackValue !== false) {
                newValue = this.currentSettings.fallbackValue;
            }

            var matchingItem = this.selectionPanel.find('[data-item-value="' + newValue + '"]');

            this.selectionPanel.find('.selectable-item').removeClass(this.currentSettings.activeItemClass);

            if (matchingItem.length > 0) {
                this.highlightItem(matchingItem);
                if (!temporaryHighlightOnly) {
                    this.temporarySelectionValue = newValue;
                }
            } else {
                // If no match, clear temporary selection
                this.temporarySelectionValue = null;
            }

            // Update associated input field
            if (this.hasLinkedInput()) {
                this.linkedInput.val(newValue);
                this.updateInputValidityState(matchingItem.length > 0);
            }

            this.fireCustomEvent('selectionUpdated', {
                selectedItem: matchingItem,
                currentValue: newValue
            });
        },

        // Retrieves the currently selected item's value
        getSelection: function() {
            return this.temporarySelectionValue || (this.hasLinkedInput() ? this.linkedInput.val() : this.hostElement.text());
        },

        // Highlights a specific item in the panel
        highlightItem: function(itemElement) {
            this.selectionPanel.find('.selectable-item').removeClass(this.currentSettings.activeItemClass);
            itemElement.addClass(this.currentSettings.activeItemClass);
        },

        // Filters the items displayed in the panel based on a search term
        filterItems: function(searchTerm) {
            var allItems = this.selectionPanel.find('.selectable-item');
            if (internalTools.isValEmpty(searchTerm)) {
                allItems.show(); // Show all if search term is empty
                return;
            }

            allItems.each(function() {
                var itemText = $(this).text().toLowerCase();
                if (itemText.includes(searchTerm)) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
            this.fireCustomEvent('itemsFiltered', {searchTerm: searchTerm});
        },

        // Checks if the given value is one of the available items
        isValidChoice: function(valueToCheck) {
            return internalTools.valueInList(valueToCheck, this.currentSettings.availableItems);
        },

        // Updates the validity state of the linked input's form group
        updateInputValidityState: function(isValid) {
            if (this.hasLinkedInput()) {
                var formGroup = this.linkedInput.closest('.form-group');
                if (formGroup.length) {
                    formGroup.toggleClass('has-error', !isValid);
                    formGroup.toggleClass('has-success', isValid);
                }
            }
        },

        // Helper to check if a linked input exists
        hasLinkedInput: function() {
            return this.linkedInput && this.linkedInput.length > 0;
        },

        // Helper to check if a trigger component exists
        hasTriggerComponent: function() {
            return this.triggerComponent && this.triggerComponent.length > 0;
        },

        // Helper to check if a wrapper element exists
        hasWrapperElement: function() {
            return this.wrapperElement && this.wrapperElement.length > 0;
        },

        // Helper to check if the panel is configured for inline display
        isDisplayInline: function() {
            return this.currentSettings.displayPlacement === 'inline';
        },

        // Retrieves the search input field element
        getSearchInputField: function() {
            return this.popoverContainer.find('.selector-search-input');
        },

        // Retrieves the 'Accept' button element
        getAcceptActionElement: function() {
            return this.popoverContainer.find('.selector-accept-btn');
        },

        // Retrieves the 'Cancel' button element
        getCancelActionElement: function() {
            return this.popoverContainer.find('.selector-cancel-btn');
        },

        // Destroys the ItemSelector instance
        dispose: function() {
            this.releaseElementEvents();
            this.releaseGlobalEvents();
            this.popoverContainer.remove();
            this.hostElement.removeClass('selector-base-element').removeData('itemSelector');
            if (this.hasLinkedInput()) {
                this.linkedInput.removeClass('selector-input-field');
            }
            if (this.hasTriggerComponent()) {
                this.triggerComponent.removeClass('selector-activation-btn');
            }
            if (this.hasWrapperElement()) {
                this.wrapperElement.removeClass('selector-wrapper');
            }
            this.fireCustomEvent('selectorDisposed');
        }
    };

    // jQuery plugin definition
    $.fn.itemSelector = function(option) {
        var args = Array.prototype.slice.call(arguments, 1);
        var returnValue = this;

        this.each(function() {
            var $this = $(this);
            var data = $this.data('itemSelector');
            var options = typeof option === 'object' && option;

            if (!data) {
                // Initialize a new instance if one doesn't exist
                $this.data('itemSelector', (data = new ItemSelector(this, options)));
            }
            if (typeof option === 'string') {
                // Call a method on the instance
                if (typeof data[option] === 'function') {
                    returnValue = data[option].apply(data, args);
                } else {
                    internalTools.throwComponentError('Method "' + option + '" does not exist on ItemSelector.');
                }
            }
        });

        return returnValue;
    };

    // Expose defaults
    $.fn.itemSelector.defaults = ItemSelector.baseSettings;
    $.fn.itemSelector.Constructor = ItemSelector;
}));