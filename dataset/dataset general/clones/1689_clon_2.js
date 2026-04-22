/*!
 * Bootstrap Selector Interface
 * http://example.com/selector-interface/
 *
 * Modified from an original work by (c) 2012 A. Developer
 * Licensed under the MIT License
 * https://example.com/license
 *
 */

(function (moduleCreator) {
  "use strict";

  // Check for AMD environment
  if (typeof defineModule === 'function' && defineModule.isAmd) {
    defineModule(['jquery'], moduleCreator);
  } else if (window.jQuery && !window.jQuery.fn.selectorUtil) {
    // Fallback for global jQuery
    moduleCreator(window.jQuery);
  }
}
(function (jqInstance) {
  'use strict';

  // Helper methods for common checks
  var utilityFunctions = {
    isValEmpty: function (valueToCheck) {
      return ((valueToCheck === false) || (valueToCheck === '') || (valueToCheck === null) || (valueToCheck === undefined));
    },
    isObjEmpty: function (valueToCheck) {
      return (this.isValEmpty(valueToCheck) === true) || (valueToCheck.length === 0);
    },
    isDomElement: function (elementSelector) {
      // Check if a jQuery selector finds any elements
      return (jqInstance(elementSelector).length > 0);
    },
    isTextString: function (valueToCheck) {
      return ((typeof valueToCheck === 'string') || (valueToCheck instanceof String));
    },
    isArr: function (valueToCheck) {
      return jqInstance.isArray(valueToCheck);
    },
    isInArr: function (valueToCheck, targetArr) {
      return (jqInstance.inArray(valueToCheck, targetArr) !== -1);
    },
    raiseException: function (errorMsg) {
      throw "Interface Selector Error: " + errorMsg;
    }
  };

  // Main ItemSelector class definition
  var ItemSelector = function (targetElement, configOptions) {
    // Assign a unique ID to this instance
    this._instanceId = ItemSelector._instanceCounter++;
    this.targetElement = jqInstance(targetElement).addClass('selector-origin');
    this._emitEvent('selectorInit'); // Trigger initialization event

    // Merge default settings, element data attributes, and provided options
    this.configOptions = jqInstance.extend({}, ItemSelector.baseSettings, this.targetElement.data(), configOptions);
    this.configOptions.markupTemplates = jqInstance.extend({}, ItemSelector.baseSettings.markupTemplates, this.configOptions.markupTemplates);
    this.configOptions.initialPosition = this.configOptions.positioning; // Store original placement

    // Determine the host container for the overlay panel
    this.hostContainer = (utilityFunctions.isDomElement(this.configOptions.appendToContainer) ? jqInstance(this.configOptions.appendToContainer) : null);
    if (this.hostContainer === null) {
      this.hostContainer = (this.targetElement.is('input') ? this.targetElement.parent() : this.targetElement);
    }
    // Adjust positioning if inside a dropdown menu
    if (this.hostContainer.addClass('selector-wrapper').is('.menu-panel')) {
      this.configOptions.positioning = 'inline';
    }

    // Identify the associated input field
    this.dataInput = (this.targetElement.is('input') ? this.targetElement.addClass('selector-input') : null);
    if (this.dataInput === null) {
      this.dataInput = (this.hostContainer.find(this.configOptions.inputFieldSelector));
    }

    // Locate the component that triggers the selector
    this.triggerComponent = this.hostContainer.find(this.configOptions.componentSelector).addClass('selector-component');
    if (this.triggerComponent.length === 0) {
      this.triggerComponent = null;
    }

    // Construct the overlay panel and the selector itself
    this._buildOverlay();
    this._buildSelector();

    // Check for presence of an accept button
    if (this.getConfirmButton().length === 0) {
      // If no accept button, disable the 'must accept' option
      this.configOptions.requireConfirmation = false;
    }

    // Append the overlay panel to the correct DOM location
    if (this.hostContainer.is('.input-group-wrapper')) {
      this.hostContainer.parent().append(this.overlayPanel);
    } else {
      this.hostContainer.append(this.overlayPanel);
    }

    // Attach event listeners
    this._attachElementHandlers();
    this._attachGlobalHandlers();

    // Initialize the display with current selection
    this.refreshDisplay(this.configOptions.initialSelection);

    // Show immediately if in inline mode
    if (this.isDisplayedInline()) {
      this.display();
    }

    this._emitEvent('selectorInitialized');
  };

  // Static counter for unique instance IDs
  ItemSelector._instanceCounter = 0;

  // Default configuration settings for ItemSelector instances
  ItemSelector.baseSettings = {
    panelTitle: null, // Title for the overlay header (optional)
    initialSelection: null, // Use this as the current item, overriding element's value
    fallbackValue: null, // Value to use if input/element is empty
    positioning: 'bottom', // 'auto', 'top', 'bottom', 'left', 'right'
    overlapBehavior: 'none', // If true, repositions panel to avoid window borders
    animateDisplay: true, // Enable CSS transitions
    // Automatically hide after selection, ignored if confirmation is required
    autoHideOnSelection: false,
    displayFooter: false, // Show the footer section
    searchInPanelFooter: false, // If true, search input moves to footer
    requireConfirmation: false, // Only applicable if an accept button exists
    activeItemClass: 'bg-primary', // Class applied to the selected item
    // List of values available for selection
    availableItems: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'],
    inputFieldSelector: 'input', // Selector for child input field
    componentSelector: '.addon-element', // Selector for the triggering component
    appendToContainer: null, // Element to append the overlay to. If null, appends to hostContainer.
    // HTML templates used for building the interface parts
    markupTemplates: {
      overlay: '<div class="selector-overlay popover"><div class="pointer"></div>' +
        '<div class="overlay-header"></div><div class="overlay-body"></div></div>',
      panelFooter: '<div class="panel-footer"></div>',
      actionButtons: '<button class="selector-btn selector-btn-cancel btn btn-default btn-sm">Cancel</button>' +
        ' <button class="selector-btn selector-btn-confirm btn btn-primary btn-sm">Accept</button>',
      searchField: '<input type="search" class="form-control selector-search" placeholder="Filter items..." />',
      itemContainer: '<div class="item-container"><div class="item-list"></div></div>',
      listItem: '<div class="panel-item"><i></i></div>',
    }
  };

  // Static method to operate on multiple ItemSelector instances
  ItemSelector.operateOnInstances = function (targetSelector, actionMethod) {
    var methodArgs = Array.prototype.slice.call(arguments, 2);
    return jqInstance(targetSelector).each(function () {
      var currentInst = jqInstance(this).data('itemSelector');
      if (!!currentInst) {
        currentInst[actionMethod].apply(currentInst, methodArgs);
      }
    });
  };

  // Prototype methods for ItemSelector instances
  ItemSelector.prototype = {
    constructor: ItemSelector,
    configOptions: {}, // Instance-specific configuration
    _instanceId: 0, // Unique identifier for this instance

    /**
     * Emits a custom event on the target element.
     * @param {string} eventName The name of the event to trigger.
     * @param {object} [eventData] Additional data to pass with the event.
     * @private
     */
    _emitEvent: function (eventName, eventData) {
      eventData = eventData || {};
      this.targetElement.trigger(jqInstance.extend({
        type: eventName,
        selectorInstance: this
      }, eventData));
      // console.log(eventName + ' triggered for instance #' + this._instanceId);
    },

    /**
     * Builds the main overlay panel structure (popover).
     * @returns {jQuery} The created overlay panel element.
     * @private
     */
    _buildOverlay: function () {
      this.overlayPanel = jqInstance(this.configOptions.markupTemplates.overlay);

      // Handle header (title and search)
      var headerElement = this.overlayPanel.find('.overlay-header');
      if (!!this.configOptions.panelTitle) {
        headerElement.append(jqInstance('<div class="overlay-header-text">' + this.configOptions.panelTitle + '</div>'));
      }
      if (!this.configOptions.searchInPanelFooter && !utilityFunctions.isValEmpty(this.configOptions.markupTemplates.actionButtons)) {
        headerElement.append(this.configOptions.markupTemplates.searchField);
      } else if (!this.configOptions.panelTitle) {
        headerElement.remove(); // Remove header if no title and search is in footer
      }

      // Handle footer (search and buttons)
      if (this.configOptions.displayFooter && !utilityFunctions.isValEmpty(this.configOptions.markupTemplates.panelFooter)) {
        var footerElement = jqInstance(this.configOptions.markupTemplates.panelFooter);
        if (!utilityFunctions.isValEmpty(this.configOptions.markupTemplates.searchField) && this.configOptions.searchInPanelFooter) {
          footerElement.append(jqInstance(this.configOptions.markupTemplates.searchField));
        }
        if (!utilityFunctions.isValEmpty(this.configOptions.markupTemplates.actionButtons)) {
          footerElement.append(jqInstance(this.configOptions.markupTemplates.actionButtons));
        }
        this.overlayPanel.append(footerElement);
      }

      // Apply animation class if enabled
      if (this.configOptions.animateDisplay === true) {
        this.overlayPanel.addClass('fade');
      }

      return this.overlayPanel;
    },

    /**
     * Creates the selectable item list within the overlay.
     * @returns {jQuery} The created item container element.
     * @private
     */
    _buildSelector: function () {
      var thisRef = this;
      this.itemContainer = jqInstance(this.configOptions.markupTemplates.itemContainer);

      // Define click handler for individual items
      var selectItemHandler = function (eventObj) {
        var clickedItem = jqInstance(this);
        if (clickedItem.is('i')) {
          clickedItem = clickedItem.parent();
        }

        thisRef._emitEvent('selectorSelecting', {
          selectedPanelItem: clickedItem,
          currentSelectionValue: thisRef.currentSelectionValue
        });

        // Update selection based on confirmation requirement
        if (thisRef.configOptions.requireConfirmation === false) {
          thisRef.refreshDisplay(clickedItem.data('selectorVal'));
          thisRef._emitEvent('selectorSelected', {
            selectedPanelItem: this,
            currentSelectionValue: thisRef.currentSelectionValue
          });
        } else {
          thisRef.refreshDisplay(clickedItem.data('selectorVal'), true);
        }

        // Hide the panel if auto-hide is enabled and no confirmation is needed
        if (thisRef.configOptions.autoHideOnSelection && (thisRef.configOptions.requireConfirmation === false)) {
          thisRef.conceal();
        }
      };

      // Populate the item list from availableItems
      for (var idx in this.configOptions.availableItems) {
        var panelItemElement = jqInstance(this.configOptions.markupTemplates.listItem);
        panelItemElement.find('i').html(this.configOptions.availableItems[idx]);
        panelItemElement.data('selectorVal', this.configOptions.availableItems[idx])
          .on('click.selector', selectItemHandler); // Attach click event
        this.itemContainer.find('.item-list').append(panelItemElement);
      }

      this.overlayPanel.find('.overlay-body').append(this.itemContainer);

      return this.itemContainer;
    },

    /**
     * Checks if a given event originated inside the selector's UI.
     * @param {Event} eventObj The event object.
     * @returns {boolean} True if the event is inside, false otherwise.
     * @private
     */
    _isClickWithinPanel: function (eventObj) {
      var targetElem = jqInstance(eventObj.target);
      if ((!targetElem.hasClass('selector-origin') ||
          (targetElem.hasClass('selector-origin') && !targetElem.is(this.targetElement))) &&
        (targetElem.parents('.selector-overlay').length === 0)) {
        return false;
      }
      return true;
    },

    /**
     * Attaches event handlers to various elements of the selector.
     * @private
     */
    _attachElementHandlers: function () {
      var thisRef = this;

      // Search input keyup event
      this.getSearchField().on('keyup', function () {
        thisRef.applyFilter(jqInstance(this).getValue().toLower());
      });

      // Accept button click event
      this.getConfirmButton().on('click.selector', function () {
        var chosenPanelItem = thisRef.itemContainer.find('.selector-active').get(0);

        thisRef.refreshDisplay(thisRef.currentSelectionValue); // Finalize selection

        thisRef._emitEvent('selectorSelected', {
          selectedPanelItem: chosenPanelItem,
          currentSelectionValue: thisRef.currentSelectionValue
        });
        if (!thisRef.isDisplayedInline()) {
          thisRef.conceal(); // Hide if not inline
        }
      });

      // Cancel button click event
      this.getDismissButton().on('click.selector', function () {
        if (!thisRef.isDisplayedInline()) {
          thisRef.conceal(); // Hide if not inline
        }
      });

      // Target element focus event
      this.targetElement.on('focus.selector', function (eventObj) {
        thisRef.display();
        eventObj.stopPropagation();
      });

      // Trigger component click event
      if (this.hasTriggerComponent()) {
        this.triggerComponent.on('click.selector', function () {
          thisRef.toggleVisibility();
        });
      }

      // Input field keyup event (for direct input)
      if (this.hasInputField()) {
        this.dataInput.on('keyup.selector', function (eventObj) {
          // Ignore navigation keys, modifiers, etc.
          if (!utilityFunctions.isInArr(eventObj.keyCode, [38, 40, 37, 39, 16, 17, 18, 9, 8, 91, 93, 20, 46, 186, 190, 46, 78, 188, 44, 86])) {
            thisRef.refreshDisplay(); // Update based on input value
          } else {
            thisRef._adjustFormGroupState(thisRef.isValidInput(this.currentValue) !== null);
          }
        });
      }
    },

    /**
     * Attaches global event handlers (window resize, document mouseup).
     * @private
     */
    _attachGlobalHandlers: function () {
      var documentRef = jqInstance(window.document);
      var thisRef = this;

      // Unique namespace for instance-specific events
      var eventNamespace = '.selector.inst' + this._instanceId;

      jqInstance(window).on('resize.selector' + eventNamespace + ' orientationChange.selector' + eventNamespace, function (eventObj) {
        // Reposition overlay on window resize/orientation change
        if (thisRef.overlayPanel.hasClass('visible')) {
          thisRef.adjustPosition();
        }
      });

      // Hide panel on outside click if not inline
      if (!thisRef.isDisplayedInline()) {
        documentRef.on('mouseUp' + eventNamespace, function (eventObj) {
          if (!thisRef._isClickWithinPanel(eventObj) && !thisRef.isDisplayedInline()) {
            thisRef.conceal();
          }
          eventObj.stopPropagation();
          eventObj.preventDefault();
          return false;
        });
      }

      return false;
    },

    /**
     * Detaches event handlers from elements.
     * @private
     */
    _detachElementHandlers: function () {
      this.overlayPanel.off('.selector');
      this.targetElement.off('.selector');

      if (this.hasInputField()) {
        this.dataInput.off('.selector');
      }

      if (this.hasTriggerComponent()) {
        this.triggerComponent.off('.selector');
      }

      if (this.hasContainer()) {
        this.hostContainer.off('.selector');
      }
    },

    /**
     * Detaches global event handlers.
     * @private
     */
    _detachGlobalHandlers: function () {
      jqInstance(window).off('.selector.inst' + this._instanceId);
      jqInstance(window.document).off('.selector.inst' + this._instanceId);
    },

    /**
     * Updates the position of the overlay panel.
     * @param {string|object} [positionSettings] New placement setting or position object.
     * @param {string|boolean} [overlapConfig] Collision behavior.
     */
    adjustPosition: function (positionSettings, overlapConfig) {
      positionSettings = positionSettings || this.configOptions.positioning;
      this.configOptions.positioning = positionSettings; // Update current placement
      overlapConfig = overlapConfig || this.configOptions.overlapBehavior;
      overlapConfig = (overlapConfig === true ? 'flip' : overlapConfig);

      var positionConfig = {
        // 'at': Defines alignment point on the target element: "horizontal vertical"
        alignTarget: "right bottom",
        // 'my': Defines alignment point on the overlay itself: "horizontal vertical"
        alignSelf: "right top",
        // 'of': Element to position relative to
        relativeTo: this.hasInputField() ? this.dataInput : this.hostContainer,
        // 'collision': Strategy for when element overflows boundaries
        overlapBehavior: (overlapConfig === true ? 'flip' : overlapConfig),
        // 'within': Element to contain the positioned item
        constrainWithin: window
      };

      // Remove all previous position-related classes
      this.overlayPanel.removeClass('inline cornerTopLeft topStart above topEnd cornerTopRight ' +
        'rightTop rightSide rightBottom cornerBottomRight ' +
        'bottom bottomEnd bottomStart cornerBottomLeft leftBottom leftSide leftTop');

      if (typeof positionSettings === 'object') {
        // If a custom position object is provided
        return this.overlayPanel.setPos(jqInstance.extend({}, positionConfig, positionSettings));
      }

      // Apply positioning based on predefined names
      switch (positionSettings) {
        case 'inline':
          {
            positionConfig = null; // No specific positioning, just inline display
          }
          break;
        case 'cornerTopLeft':
          {
            positionConfig.alignSelf = 'right bottom';
            positionConfig.alignTarget = 'left top';
          }
          break;

        case 'topStart':
          {
            positionConfig.alignSelf = 'left bottom';
            positionConfig.alignTarget = 'left top';
          }
          break;

        case 'above':
          {
            positionConfig.alignSelf = 'center bottom';
            positionConfig.alignTarget = 'center top';
          }
          break;

        case 'topEnd':
          {
            positionConfig.alignSelf = 'right bottom';
            positionConfig.alignTarget = 'right top';
          }
          break;

        case 'cornerTopRight':
          {
            positionConfig.alignSelf = 'left bottom';
            positionConfig.alignTarget = 'right top';
          }
          break;

        case 'rightTop':
          {
            positionConfig.alignSelf = 'left bottom';
            positionConfig.alignTarget = 'right center';
          }
          break;

        case 'rightSide':
          {
            positionConfig.alignSelf = 'left center';
            positionConfig.alignTarget = 'right center';
          }
          break;

        case 'rightBottom':
          {
            positionConfig.alignSelf = 'left top';
            positionConfig.alignTarget = 'right center';
          }
          break;

        case 'cornerBottomRight':
          {
            positionConfig.alignSelf = 'left top';
            positionConfig.alignTarget = 'right bottom';
          }
          break;

        case 'bottomEnd':
          {
            positionConfig.alignSelf = 'right top';
            positionConfig.alignTarget = 'right bottom';
          }
          break;
        case 'bottom':
          {
            positionConfig.alignSelf = 'center top';
            positionConfig.alignTarget = 'center bottom';
          }
          break;

        case 'bottomStart':
          {
            positionConfig.alignSelf = 'left top';
            positionConfig.alignTarget = 'left bottom';
          }
          break;

        case 'cornerBottomLeft':
          {
            positionConfig.alignSelf = 'right top';
            positionConfig.alignTarget = 'left bottom';
          }
          break;

        case 'leftBottom':
          {
            positionConfig.alignSelf = 'right top';
            positionConfig.alignTarget = 'left center';
          }
          break;

        case 'leftSide':
          {
            positionConfig.alignSelf = 'right center';
            positionConfig.alignTarget = 'left center';
          }
          break;

        case 'leftTop':
          {
            positionConfig.alignSelf = 'right bottom';
            positionConfig.alignTarget = 'left center';
          }
          break;

        default:
          {
            return false; // Unknown placement
          }
          break;
      }

      // Apply the calculated position if not inline
      if (positionConfig) {
        this.overlayPanel.setPos(positionConfig);
      } else {
        this.overlayPanel.addClass(positionSettings); // Add inline class
      }
    },

    /**
     * Checks if the selector is in inline display mode.
     * @returns {boolean} True if inline, false otherwise.
     */
    isDisplayedInline: function () {
      return this.configOptions.positioning === 'inline';
    },

    /**
     * Shows the overlay panel.
     */
    display: function () {
      if (this.overlayPanel.hasClass('visible')) {
        return; // Already visible
      }

      this.overlayPanel.addClass('visible');
      this.adjustPosition(); // Position the panel correctly
      this._emitEvent('selectorShown'); // Trigger shown event
    },

    /**
     * Hides the overlay panel.
     */
    conceal: function () {
      if (!this.overlayPanel.hasClass('visible')) {
        return; // Already hidden
      }

      this.overlayPanel.removeClass('visible');
      this._emitEvent('selectorHidden'); // Trigger hidden event
    },

    /**
     * Toggles the visibility of the overlay panel.
     */
    toggleVisibility: function () {
      if (this.overlayPanel.hasClass('visible')) {
        this.conceal();
      } else {
        this.display();
      }
    },

    /**
     * Retrieves the search input element.
     * @returns {jQuery} The search input element.
     */
    getSearchField: function () {
      return this.overlayPanel.find('.selector-search');
    },

    /**
     * Retrieves the accept (confirm) button element.
     * @returns {jQuery} The accept button element.
     */
    getConfirmButton: function () {
      return this.overlayPanel.find('.selector-btn-confirm');
    },

    /**
     * Retrieves the cancel (dismiss) button element.
     * @returns {jQuery} The cancel button element.
     */
    getDismissButton: function () {
      return this.overlayPanel.find('.selector-btn-cancel');
    },

    /**
     * Checks if the instance has an associated triggering component.
     * @returns {boolean} True if a component exists, false otherwise.
     */
    hasTriggerComponent: function () {
      return (this.triggerComponent && this.triggerComponent.length);
    },

    /**
     * Checks if the instance has an associated input field.
     * @returns {boolean} True if an input field exists, false otherwise.
     */
    hasInputField: function () {
      return (this.dataInput && this.dataInput.length);
    },

    /**
     * Checks if the instance has a custom host container.
     * @returns {boolean} True if a container exists, false otherwise.
     */
    hasContainer: function () {
      return (this.hostContainer && this.hostContainer.length);
    },

    /**
     * Filters the displayed items based on a search term.
     * @param {string} searchTerm The text to filter by.
     */
    applyFilter: function (searchTerm) {
      if (utilityFunctions.isValEmpty(searchTerm)) {
        this.itemContainer.find('.panel-item').show(); // Show all items
        return;
      }

      this.itemContainer.find('.panel-item').each(function () {
        var itemText = jqInstance(this).text().toLower();
        if (itemText.indexOf(searchTerm) !== -1) {
          jqInstance(this).show();
        } else {
          jqInstance(this).hide();
        }
      });
    },

    /**
     * Gets the currently selected value.
     * @returns {string|null} The selected value, or null if none.
     */
    getCurrentValue: function () {
      return this.currentSelectionValue;
    },

    /**
     * Sets the value of the input field (if present) and marks an item as selected.
     * @param {string} valueToSet The value to set.
     * @param {boolean} [highlightOnly=false] If true, only highlights the item without setting the input.
     */
    refreshDisplay: function (valueToSet, highlightOnly) {
      var _value = valueToSet;
      var _isFromInput = false;

      // Determine the value to use
      if (utilityFunctions.isValEmpty(_value)) {
        if (this.hasInputField()) {
          _value = this.dataInput.getValue();
          _isFromInput = true;
        } else {
          _value = this.targetElement.data('selectorVal');
        }
        if (utilityFunctions.isValEmpty(_value)) {
          _value = this.configOptions.fallbackValue;
        }
      }

      // Update input field if not just highlighting
      if (!highlightOnly && this.hasInputField() && _value !== this.dataInput.getValue()) {
        this.dataInput.getValue(_value);
      }

      // Mark the corresponding item as active
      this.itemContainer.find('.panel-item').removeClass(this.configOptions.activeItemClass);
      if (!utilityFunctions.isValEmpty(_value)) {
        this.itemContainer.find('.panel-item').filter(function () {
          return jqInstance(this).data('selectorVal') === _value;
        }).addClass(this.configOptions.activeItemClass);
      }

      this.currentSelectionValue = _value; // Store the current selection
      this._adjustFormGroupState(this.isValidInput(_value) !== null);

      if (!_isFromInput) {
        this._emitEvent('selectorUpdated', {
          currentSelectionValue: _value
        });
      }
    },

    /**
     * Validates an input value against the available items.
     * @param {string} testValue The value to validate.
     * @returns {string|null} The valid value if found, otherwise null.
     */
    isValidInput: function (testValue) {
      if (utilityFunctions.isValEmpty(testValue)) {
        return null;
      }
      var _validValue = null;
      jqInstance.each(this.configOptions.availableItems, function (idx, item) {
        if (item === testValue) {
          _validValue = item;
          return false; // Break loop
        }
      });
      return _validValue;
    },

    /**
     * Adjusts the validation state of the parent form group.
     * @param {boolean} isValid True if the input is valid, false otherwise.
     * @private
     */
    _adjustFormGroupState: function (isValid) {
      if (this.hasInputField()) {
        var formGroup = this.dataInput.parents('.form-group');
        if (formGroup.length) {
          formGroup.removeClass('has-error has-success');
          if (isValid === true) {
            formGroup.addClass('has-success');
          } else if (isValid === false) {
            formGroup.addClass('has-error');
          }
        }
      }
    },

    /**
     * Destroys the ItemSelector instance, removing all generated elements and event handlers.
     */
    destroy: function () {
      this._detachElementHandlers();
      this._detachGlobalHandlers();
      this.overlayPanel.remove();
      this.targetElement.removeClass('selector-origin');
      this.targetElement.removeData('itemSelector'); // Remove stored instance
      this._emitEvent('selectorDestroyed');
    }
  };

  // jQuery plugin definition
  jqInstance.fn.selectorUtil = function (action, param1, param2) {
    var instance = jqInstance(this),
      data = instance.data('itemSelector'),
      options = typeof action === 'object' && action;

    // Initialize a new instance if not already present
    if (!data) {
      // Ensure the element is not already processed
      if (!/no-selector-util/.test(instance.attr('class'))) {
        data = new ItemSelector(this, options);
        instance.data('itemSelector', data);
      }
    }

    // Call a method if 'action' is a string
    if (typeof action === 'string') {
      if (data[action] === undefined) {
        utilityFunctions.raiseException('Method "' + action + '" does not exist.');
      }
      return data[action](param1, param2);
    }

    return instance;
  };

  // Set default options for the plugin
  jqInstance.fn.selectorUtil.defaults = ItemSelector.baseSettings;

  // Make ItemSelector accessible for external use
  jqInstance.fn.selectorUtil.Constructor = ItemSelector;
})(window.jQuery));