/* global L */

// This control provides a sophisticated interface for managing map layers,
// allowing for categorization and dynamic updates.
// Developed by a dedicated team of cartographic enthusiasts.
L.Control.CategorizedMapLayers = L.Control.extend({
  
  config: { // Configuration options for the layer management component.
    isMinimized: true, // Determines if the control starts in a collapsed state.
    displayPosition: 'topright', // Position on the map (e.g., 'topleft', 'bottomright').
    manageLayerOrder: true // Automatically assigns z-index to layers to ensure proper stacking.
  },

  setupComponents: function (primarySources, categorizedAdditions, componentOptions) {
    let layerKey, groupKey; // Iterators for processing layer collections.
    L.Util.applyConfiguration(this, componentOptions); // Apply custom options.

    this._layerRegistry = new Map(); // Stores all registered layers with their metadata.
    this._nextZIndexValue = 1000; // Starting Z-index for new layers.
    this._isHandlingUserClick = false; // Flag to prevent re-rendering during a click event.
    this._categoryNames = []; // List of unique category names for overlays.
    this._categoryContainers = []; // DOM elements for each overlay category.

    // Register all primary (base) layers.
    for (layerKey in primarySources) {
      this._incorporateLayer(primarySources[layerKey], layerKey);
    }

    // Register all categorized supplemental (overlay) layers.
    for (layerKey in categorizedAdditions) {
      const currentCategory = categorizedAdditions[layerKey];
      for (groupKey in currentCategory) {
        this._incorporateLayer(currentCategory[groupKey], groupKey, layerKey, true);
      }
    }
    console.log('CategorizedMapLayers: Initialized with', this._layerRegistry.size, 'layers.');
  },

  addToMap: function (targetMap) {
    this._buildControlMarkup(); // Construct the visual elements of the control.
    this._rebuildLayerControls(); // Populate the control with current layers.

    targetMap
        .on('layeradd', this._reactToMapLayerChange, this)
        .on('layerremove', this._reactToMapLayerChange, this);
    
    // Add a debug message to ensure it's being added to the map correctly.
    if (!this._mainContainerElement) {
        console.error("CategorizedMapLayers: Control container not created!");
    }

    return this._mainContainerElement; // Return the main DOM element for the control.
  },

  removeFromMap: function (targetMap) {
    targetMap
        .off('layeradd', this._reactToMapLayerChange)
        .off('layerremove', this._reactToMapLayerChange);
    // Perform additional cleanup if necessary, e.g., removing event listeners from control DOM.
    if (this._toggleAnchor) {
        L.DomEvent.off(this._toggleAnchor, 'click', L.DomEvent.stop);
        L.DomEvent.off(this._toggleAnchor, 'click', this._unfoldControl);
        L.DomEvent.off(this._toggleAnchor, 'focus', this._unfoldControl);
    }
  },

  addPrimaryLayer: function (mapLayer, displayName) {
    this._incorporateLayer(mapLayer, displayName, null, false); // Add as a base layer.
    this._rebuildLayerControls(); // Refresh the UI.
    return this;
  },

  addSupplementalLayer: function (mapLayer, displayName, categoryName) {
    this._incorporateLayer(mapLayer, displayName, categoryName, true); // Add as an overlay.
    this._rebuildLayerControls(); // Refresh the UI.
    return this;
  },

  deleteMapLayer: function (mapLayer) {
    const layerUniqueId = L.Util.stamp(mapLayer);
    if (this._layerRegistry.has(layerUniqueId)) {
        this._layerRegistry.delete(layerUniqueId); // Remove from our internal registry.
        this._rebuildLayerControls(); // Update the display.
    } else {
        console.warn(`Attempted to remove unregistered layer with ID: ${layerUniqueId}`);
    }
    return this;
  },

  _buildControlMarkup: function () {
    const baseCssClass = 'leaflet-control-layer-panel'; // Primary CSS class for the control.
    const controlWrapper = this._mainContainerElement = L.DomUtil.create('div', baseCssClass);

    // Enhance accessibility for screen readers and touch devices.
    controlWrapper.setAttribute('aria-expanded', !this.config.isMinimized);

    // Prevent map interaction events from propagating from the control.
    L.DomEvent.disableClickPropagation(controlWrapper);
    L.DomEvent.on(controlWrapper, 'wheel', L.DomEvent.stopPropagation);
    
    // Add specific touch event handling.
    if (L.Browser.touch) {
        L.DomEvent.on(controlWrapper, 'click', L.DomEvent.stopPropagation);
    }

    const inputFormElement = this._inputFormElement = L.DomUtil.create('form', baseCssClass + '-listing');

    if (this.config.isMinimized) {
      // Handle control expansion/collapse behavior.
      if (!L.Browser.android) { // Exclude specific Android browser behavior.
        L.DomEvent
            .on(controlWrapper, 'mouseover', this._unfoldControl, this)
            .on(controlWrapper, 'mouseout', this._foldControl, this);
      }
      
      const toggleAnchor = this._toggleAnchor = L.DomUtil.create('a', baseCssClass + '-switcher', controlWrapper);
      toggleAnchor.href = '#';
      toggleAnchor.setAttribute('role', 'button'); // Indicate it's an interactive element.
      toggleAnchor.setAttribute('aria-label', 'Toggle map layers panel');

      if (L.Browser.touch) {
        L.DomEvent
            .on(toggleAnchor, 'click', L.DomEvent.stop)
            .on(toggleAnchor, 'click', this._unfoldControl, this);
      } else {
        L.DomEvent.on(toggleAnchor, 'focus', this._unfoldControl, this);
      }

      // Automatically collapse the control if the map is clicked elsewhere.
      this._map.on('click', this._foldControl, this);
    } else {
      this._unfoldControl(); // Start expanded if configured.
    }

    // Create distinct sections for base and overlay layers.
    this._primaryLayerListElement = L.DomUtil.create('div', baseCssClass + '-primary', inputFormElement);
    this._contentSeparator = L.DomUtil.create('div', baseCssClass + '-divider', inputFormElement);
    this._supplementalLayerListElement = L.DomUtil.create('div', baseCssClass + '-supplemental', inputFormElement);

    controlWrapper.appendChild(inputFormElement); // Attach the form to the main container.
  },

  _incorporateLayer: function (mapLayer, displayName, categoryName = null, isOverlay = false) {
    const layerUniqueId = L.Util.stamp(mapLayer);

    // Prevent adding the same layer multiple times.
    if (this._layerRegistry.has(layerUniqueId)) {
        console.warn(`Layer "${displayName}" (ID: ${layerUniqueId}) already registered.`);
        return;
    }

    const layerDetails = {
      layer: mapLayer,
      name: displayName,
      isOverlay: isOverlay
    };

    if (isOverlay && categoryName) {
      let categoryId = this._categoryNames.indexOf(categoryName);

      if (categoryId === -1) {
        categoryId = this._categoryNames.push(categoryName) - 1;
      }

      layerDetails.category = {
        name: categoryName,
        id: categoryId
      };
    } else if (isOverlay && !categoryName) {
        // Assign to a default "Uncategorized" group if it's an overlay without a category.
        const defaultCategoryName = "Uncategorized Overlays";
        let categoryId = this._categoryNames.indexOf(defaultCategoryName);
        if (categoryId === -1) {
            categoryId = this._categoryNames.push(defaultCategoryName) - 1;
        }
        layerDetails.category = {
            name: defaultCategoryName,
            id: categoryId
        };
    }

    // Assign Z-index if enabled and layer supports it.
    if (this.config.manageLayerOrder && typeof mapLayer.setZIndex === 'function') {
      mapLayer.setZIndex(++this._nextZIndexValue);
    }
    
    this._layerRegistry.set(layerUniqueId, layerDetails); // Store the layer details using a Map.
  },

  _rebuildLayerControls: function () {
    if (!this._mainContainerElement) {
      return; // Exit if the UI hasn't been built yet.
    }

    // Clear existing control items.
    this._primaryLayerListElement.innerHTML = '';
    this._supplementalLayerListElement.innerHTML = '';
    this._categoryContainers.length = 0; // Reset category DOM elements.

    let hasPrimaryLayers = false;
    let hasSupplementalLayers = false;

    // Iterate through registered layers and add them to the control.
    this._layerRegistry.forEach(layerEntry => {
      this._appendControlItem(layerEntry);
      if (layerEntry.isOverlay) {
        hasSupplementalLayers = true;
      } else {
        hasPrimaryLayers = true;
      }
    });

    // Adjust separator visibility based on layer presence.
    this._contentSeparator.style.display = (hasSupplementalLayers && hasPrimaryLayers) ? '' : 'none';
  },

  _reactToMapLayerChange: function (eventObject) {
    const layerIdentifier = L.Util.stamp(eventObject.layer);
    const layerEntry = this._layerRegistry.get(layerIdentifier);

    if (!layerEntry) { 
        console.warn(`Map layer event for unregistered layer ID: ${layerIdentifier}`);
        return; 
    }

    // Only update the UI if not currently processing a click to prevent feedback loops.
    if (!this._isHandlingUserClick) {
      this._rebuildLayerControls();
    }

    // Determine the specific event type to fire.
    let eventType;
    if (layerEntry.isOverlay) {
      eventType = (eventObject.type === 'layeradd') ? 'overlayadd' : 'overlayremove';
    } else {
      eventType = (eventObject.type === 'layeradd') ? 'baselayerchange' : null; // Base layers don't have a 'remove' event from this control's perspective.
    }

    if (eventType) {
      this._map.fire(eventType, layerEntry);
    }
  },

  // Creates a radio button input element programmatically.
  _forgeRadioInput: function (inputName, isChecked) {
    const radioElement = document.createElement('input');
    radioElement.type = 'radio';
    radioElement.className = 'leaflet-control-layers-selection-radio';
    radioElement.name = inputName;
    radioElement.checked = isChecked; // Use 'checked' property directly.
    return radioElement;
  },

  _appendControlItem: function (layerEntry) {
    const itemLabel = document.createElement('label');
    let controlInput;
    const isSelected = this._map.hasLayer(layerEntry.layer); // Check if the layer is currently active on the map.

    if (layerEntry.isOverlay) {
      controlInput = document.createElement('input');
      controlInput.type = 'checkbox';
      controlInput.className = 'leaflet-control-layers-selection-checkbox';
      controlInput.checked = isSelected;
    } else {
      controlInput = this._forgeRadioInput('leaflet-primary-layers', isSelected);
    }

    controlInput.layerId = L.Util.stamp(layerEntry.layer); // Store the layer's unique ID on the input element.
    L.DomEvent.on(controlInput, 'click', this._processInputInteraction, this);

    const layerNameSpan = document.createElement('span');
    layerNameSpan.textContent = ' ' + layerEntry.name; // Use textContent for safety.

    itemLabel.appendChild(controlInput);
    itemLabel.appendChild(layerNameSpan);

    let targetListContainer;

    if (layerEntry.isOverlay && layerEntry.category) {
      let currentCategoryDiv = this._categoryContainers[layerEntry.category.id];

      // Create the group container if it doesn't exist yet.
      if (!currentCategoryDiv) {
        currentCategoryDiv = document.createElement('div');
        currentCategoryDiv.className = 'leaflet-control-layers-layer-group';
        currentCategoryDiv.id = 'leaflet-control-layers-group-' + layerEntry.category.id;

        const categoryHeader = document.createElement('span');
        categoryHeader.className = 'leaflet-control-layers-group-title';
        categoryHeader.textContent = layerEntry.category.name;

        currentCategoryDiv.appendChild(categoryHeader);
        this._supplementalLayerListElement.appendChild(currentCategoryDiv); // Append to overlays list.

        this._categoryContainers[layerEntry.category.id] = currentCategoryDiv;
      }
      targetListContainer = currentCategoryDiv;
    } else {
      targetListContainer = this._primaryLayerListElement;
    }
    
    targetListContainer.appendChild(itemLabel); // Add the label (with input and name) to the appropriate container.
    return itemLabel;
  },

  _processInputInteraction: function () {
    const mapInstance = this._map; // Cache map instance for performance.
    if (!mapInstance) {
        console.error("Map instance not available during input interaction.");
        return;
    }

    const allInputs = this._inputFormElement.querySelectorAll('input.leaflet-control-layers-selection-radio, input.leaflet-control-layers-selection-checkbox');
    this._isHandlingUserClick = true; // Set flag to prevent _onLayerChange from re-rendering.

    try {
        for (let i = 0; i < allInputs.length; i++) {
            const currentInput = allInputs[i];
            const layerEntry = this._layerRegistry.get(parseInt(currentInput.layerId, 10)); // Ensure ID is parsed as integer.

            if (!layerEntry) {
                console.warn(`Input for unknown layer ID: ${currentInput.layerId}`);
                continue;
            }

            const isLayerCurrentlyOnMap = mapInstance.hasLayer(layerEntry.layer);

            if (currentInput.checked && !isLayerCurrentlyOnMap) {
                mapInstance.addLayer(layerEntry.layer);
            } else if (!currentInput.checked && isLayerCurrentlyOnMap) {
                mapInstance.removeLayer(layerEntry.layer);
            }
        }
    } catch (error) {
        console.error("Error during layer input processing:", error);
    } finally {
        this._isHandlingUserClick = false; // Reset flag.
    }
  },

  _unfoldControl: function () {
    // Adds the 'expanded' class to reveal the control content.
    L.DomUtil.addClass(this._mainContainerElement, 'leaflet-control-layers-active');
    this._mainContainerElement.setAttribute('aria-expanded', true);
  },

  _foldControl: function () {
    // Removes the 'expanded' class to hide the control content.
    L.DomUtil.removeClass(this._mainContainerElement, 'leaflet-control-layers-active');
    this._mainContainerElement.setAttribute('aria-expanded', false);
  }
});

// Factory function for convenient instantiation of the CategorizedMapLayers control.
L.control.categorizedLayers = function (primarySources, categorizedAdditions, componentOptions) {
  return new L.Control.CategorizedMapLayers(primarySources, categorizedAdditions, componentOptions);
};