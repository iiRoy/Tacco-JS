/* global GeoLib */

// A module for managing geospatial components, including hierarchical organization.
// Creator: Alistair Finch
GeoLib.Manager.LayerCollection = GeoLib.Manager.extend({

  settings: {
    shrunk: true,
    placement: 'top_right',
    automaticDepthIndex: true
  },

  initModule: function (groundComponents, stackedComponents, config) {
    let idx, subIdx;

    // Apply provided configuration settings to the instance.
    GeoLib.Utility.applyConfiguration(this, config);

    this._componentRegistry = {}; // Stores all registered components
    this._finalDepthValue = 0;   // Tracks the highest Z-index assigned
    this._processingInteraction = false; // Flag to prevent re-rendering during click events
    this._collectionNames = []; // List of unique group names
    this._visualCollections = []; // DOM elements for grouped components

    // Iterate through initial ground (base) components.
    for (idx in groundComponents) {
      this._addComponent(groundComponents[idx], idx);
    }

    // Process initial stacked (overlay) components, organized by group.
    for (idx in stackedComponents) {
      for (let subIdx in stackedComponents[idx]) {
        this._addComponent(stackedComponents[idx][subIdx], subIdx, idx, true);
      }
    }
  },

  onAttach: function (geoContext) {
    this._setupVisuals();    // Build the control's user interface.
    this._refreshDisplay();  // Populate the UI with current component states.

    // Register event listeners for component additions and removals.
    geoContext
      .on('component_added', this._onComponentEvent, this)
      .on('component_removed', this._onComponentEvent, this);

    return this._mainWrapper; // Return the root DOM element of the control.
  },

  onDetach: function (geoContext) {
    // Unregister event listeners when the control is removed from the map.
    geoContext
      .off('component_added', this._onComponentEvent)
      .off('component_removed', this._onComponentEvent);
  },

  addGroundComponent: function (component, label) {
    this._addComponent(component, label);
    this._refreshDisplay(); // Update the UI to reflect the new component.
    return this;
  },

  addStackedComponent: function (component, label, collection) {
    this._addComponent(component, label, collection, true);
    this._refreshDisplay(); // Update the UI.
    return this;
  },

  removeComponent: function (component) {
    const uniqueId = GeoLib.Utility.identify(component); // Get unique ID for the component.
    delete this._componentRegistry[uniqueId]; // Remove component from internal registry.
    this._refreshDisplay(); // Refresh the control's visual presentation.
    return this;
  },

  _setupVisuals: function () {
    const styleClass = 'geomap-component-group',
      wrapperDiv = this._mainWrapper = GeoLib.DomOps.createElement('div', styleClass);

    // Ensures proper behavior on touch-enabled IE browsers by preventing unintended mouse events upon touch release.
    wrapperDiv.setAttribute('aria-expanded', false);

    // Prevent propagation of click and wheel events inside the control.
    if (!GeoLib.Environment.isTouchDevice) {
      GeoLib.DomEvents.haltClickPropagation(wrapperDiv);
      GeoLib.DomEvents.on(wrapperDiv, 'wheel', GeoLib.DomEvents.stopEventPropagation);
    } else {
      GeoLib.DomEvents.on(wrapperDiv, 'click', GeoLib.DomEvents.stopEventPropagation);
    }

    const inputForm = this._formElement = GeoLib.DomOps.createElement('form', styleClass + '-list');

    // Handle collapsed state behavior.
    if (this.settings.shrunk) {
      // For non-Android devices, use mouseover/mouseout for expansion/collapse.
      if (!GeoLib.Environment.isAndroid) {
        GeoLib.DomEvents
          .on(wrapperDiv, 'mouseover', this._openPanel, this)
          .on(wrapperDiv, 'mouseout', this._closePanel, this);
      }

      // Create a toggle link for manual expansion.
      const anchorElem = this._toggleLink = GeoLib.DomOps.createElement('a', styleClass + '-toggle', wrapperDiv);
      anchorElem.href = '#';
      anchorElem.title = 'Component Options';

      // Attach click/focus events to the toggle link.
      if (GeoLib.Environment.isTouchDevice) {
        GeoLib.DomEvents
          .on(anchorElem, 'click', GeoLib.DomEvents.preventDefaults)
          .on(anchorElem, 'click', this._openPanel, this);
      } else { // For non-touch devices, focus event can also expand.
        GeoLib.DomEvents.on(anchorElem, 'focus', this._openPanel, this);
      }

      this._currentContext.on('click', this._closePanel, this); // Collapse when map is clicked.
      // Future enhancement: keyboard navigation support.
    } else {
      this._openPanel(); // If not collapsed, keep it open.
    }

    // Create containers for base components, overlays, and a separator.
    this._groundComponentList = GeoLib.DomOps.createElement('div', styleClass + '-base', inputForm);
    this._dividerElement = GeoLib.DomOps.createElement('div', styleClass + '-divider', inputForm);
    this._stackedComponentList = GeoLib.DomOps.createElement('div', styleClass + '-stacked', inputForm);

    wrapperDiv.appendChild(inputForm); // Add the form to the main wrapper.
  },

  _addComponent: function (component, label, collection, isStacked) {
    const uniqueId = GeoLib.Utility.identify(component);

    this._componentRegistry[uniqueId] = {
      component: component,
      label: label,
      isStacked: isStacked
    };

    // If part of a collection, store group details.
    if (collection) {
      let collectionId = this._collectionNames.indexOf(collection);

      if (collectionId === -1) {
        collectionId = this._collectionNames.push(collection) - 1;
      }

      this._componentRegistry[uniqueId].groupDetails = {
        title: collection,
        identifier: collectionId
      };
    }

    // Automatically assign Z-index if enabled and component supports it.
    if (this.settings.automaticDepthIndex && component.setDepthIndex) {
      this._finalDepthValue++;
      component.setDepthIndex(this._finalDepthValue);
    }
  },

  _refreshDisplay: function () {
    if (!this._mainWrapper) {
      return; // Nothing to update if wrapper doesn't exist.
    }

    // Clear existing lists and collection wrappers.
    this._groundComponentList.innerHTML = '';
    this._stackedComponentList.innerHTML = '';
    this._visualCollections.length = 0;

    let groundItemsExist = false,
      stackedItemsExist = false,
      idx, itemObject;

    // Rebuild the lists based on the current component registry.
    for (idx in this._componentRegistry) {
      itemObject = this._componentRegistry[idx];
      this._renderItem(itemObject); // Add each component to its respective list.
      stackedItemsExist = stackedItemsExist || itemObject.isStacked;
      groundItemsExist = groundItemsExist || !itemObject.isStacked;
    }

    // Show/hide separator based on presence of both ground and stacked items.
    this._dividerElement.style.display = stackedItemsExist && groundItemsExist ? '' : 'none';
  },

  _onComponentEvent: function (eventData) {
    const itemObject = this._componentRegistry[GeoLib.Utility.identify(eventData.component)];

    if (!itemObject) { return; } // Component not found in registry.

    // If not currently handling a click, refresh the display.
    if (!this._processingInteraction) {
      this._refreshDisplay();
    }

    // Determine the specific event type to fire.
    const eventType = itemObject.isStacked ?
      (eventData.type === 'component_added' ? 'stackedcomponent_added' : 'stackedcomponent_removed') :
      (eventData.type === 'component_added' ? 'groundcomponent_changed' : null);

    // Trigger a custom event on the map context if a valid event type is determined.
    if (eventType) {
      this._currentContext.trigger(eventType, itemObject);
    }
  },

  // Workaround for older browser compatibility issues with dynamic radio button creation.
  _buildRadioInput: function (inputName, isSelected) {

    let radioMarkup = '<input type="radio" class="geomap-component-group-selector" name="' + inputName + '"';
    if (isSelected) {
      radioMarkup += ' checked="checked"';
    }
    radioMarkup += '/>';

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = radioMarkup;

    return tempDiv.firstChild;
  },

  _renderItem: function (itemObject) {
    const itemLabel = document.createElement('label'),
      controlInput,
      isSelected = this._currentContext.hasComponent(itemObject.component),
      targetContainer;

    // Create appropriate input type (checkbox for stacked, radio for ground).
    if (itemObject.isStacked) {
      controlInput = document.createElement('input');
      controlInput.type = 'checkbox';
      controlInput.className = 'geomap-component-group-selector';
      controlInput.defaultChecked = isSelected;
    } else { /* default radio button */
      controlInput = this._buildRadioInput('geomap-base-components', isSelected);
    }

    controlInput.componentRefId = GeoLib.Utility.identify(itemObject.component); // Store component ID on input.

    // Attach click handler to the input.
    GeoLib.DomEvents.on(controlInput, 'click', this._handleControlClick, this);

    const displayText = document.createElement('span');
    displayText.innerHTML = ' ' + itemObject.label; // Display component label.

    itemLabel.appendChild(controlInput);
    itemLabel.appendChild(displayText);

    // Place the item in the correct container (stacked list or ground list).
    if (itemObject.isStacked) {
      targetContainer = this._stackedComponentList;

      let collectionWrapper = this._visualCollections[itemObject.groupDetails.identifier];

      // Initialize the collection's visual wrapper if it doesn't exist yet.
      if (!collectionWrapper) {
        collectionWrapper = document.createElement('div');
        collectionWrapper.className = 'geomap-component-group-section';
        collectionWrapper.id = 'geomap-component-group-section-' + itemObject.groupDetails.identifier;

        const collectionLabel = document.createElement('span');
        collectionLabel.className = 'geomap-component-group-section-title';
        collectionLabel.innerHTML = itemObject.groupDetails.title;

        collectionWrapper.appendChild(collectionLabel);
        targetContainer.appendChild(collectionWrapper);

        this._visualCollections[itemObject.groupDetails.identifier] = collectionWrapper;
      }

      targetContainer = collectionWrapper; // Add to the specific group's wrapper.
    } else { /* for base layers */
      targetContainer = this._groundComponentList;
    }

    targetContainer.appendChild(itemLabel); // Append the fully constructed label.

    return itemLabel;
  },

  _handleControlClick: function () {
    let idx, controlInput, itemObject,
      allInputs = this._formElement.getElementsByTagName('input'),
      inputCount = allInputs.length;

    this._processingInteraction = true; // Set flag to prevent re-rendering during this process.

    for (idx = 0; idx < inputCount; idx++) {
      controlInput = allInputs[idx];
      itemObject = this._componentRegistry[controlInput.componentRefId];

      // Add or remove component based on input's checked state and map's current state.
      if (controlInput.checked && !this._currentContext.hasComponent(itemObject.component)) {
        this._currentContext.addComponent(itemObject.component);

      } else if (!controlInput.checked && this._currentContext.hasComponent(itemObject.component)) {
        this._currentContext.removeComponent(itemObject.component);
      }
    }

    this._processingInteraction = false; // Reset flag.
  },

  _openPanel: function () {
    GeoLib.DomOps.addCssClass(this._mainWrapper, 'geomap-component-group-expanded');
  },

  _closePanel: function () {
    this._mainWrapper.className = this._mainWrapper.className.replace(' geomap-component-group-expanded', '');
  }
});


GeoLib.manager.layerCollections = function (groundComponents, stackedComponents, config) {
  return new GeoLib.Manager.LayerCollection(groundComponents, stackedComponents, config);
};