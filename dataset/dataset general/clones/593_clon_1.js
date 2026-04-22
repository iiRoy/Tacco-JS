/*
 * This file defines a custom Leaflet control, L.Control.GroupedLayers.
 * It extends the standard L.Control to provide enhanced layer management,
 * specifically by allowing layers to be organized into logical groups.
 *
 * The 'L' object is assumed to be globally available, as is common in Leaflet applications.
 */

// A layer control which provides for layer groupings.
// Original Author: Ishmael Smyrnow
L.Control.GroupedLayers = L.Control.extend(
  {
    // Default options for the grouped layers control.
    options: {
      collapsed: true,      // Determines if the control box starts in a collapsed state.
      position: 'topright', // Specifies the map corner where the control will be placed.
      autoZIndex: true      // If true, layers added via this control will have their z-index automatically managed.
    }, // End of options configuration.

    /**
     * Initializes the GroupedLayers control.
     * This constructor sets up the internal state and processes initial layer definitions.
     *
     * @param {Object} baseLayers      An object where keys are layer names and values are L.Layer instances for base maps.
     * @param {Object} groupedOverlays An object where keys are group names and values are objects of overlay layers.
     *                                 Example: { "Roads": { "Streets": L.tileLayer(...), "Highways": L.tileLayer(...) } }
     * @param {Object} options         Additional configuration options to override defaults.
     */
    initialize: function ( baseLayers, groupedOverlays, options ) {
      var i, j; // Declare loop iteration variables.

      // Apply any custom options provided by the user, merging them with default options.
      L.Util.setOptions(this, options);

      // Initialize internal properties of the control instance.
      this._layers = {};        // Stores all layers (base and overlays) managed by this control, indexed by Leaflet's stamp ID.
      this._lastZIndex = 0;     // Tracks the highest z-index assigned to a layer to ensure proper stacking.
      this._handlingClick = false; // A flag to prevent re-rendering the control while processing a layer selection click.
      this._groupList = [];     // An ordered list of group names encountered, used to maintain group order.
      this._domGroups = [];     // An array to store references to the DOM elements created for each group.

      // Iterate through and add all initial base layers.
      for ( i in baseLayers ) {
        // The third argument (group name) is omitted, and the fourth (overlay flag) is implicitly false for base layers.
        this._addLayer( baseLayers[i], i );
      } // End of base layers loop.

      // Iterate through and add all initial grouped overlay layers.
      for ( i in groupedOverlays ) { // Loop through each group.
        for ( var j in groupedOverlays[i] ) { // Loop through layers within the current group.
          // Add the overlay layer, specifying its group name and setting the overlay flag to true.
          this._addLayer( groupedOverlays[i][j], j, i, true );
        } // End of inner loop for layers in a group.
      } // End of outer loop for grouped overlays.
    }, // End of initialize function definition.

    /**
     * Method called when the control is added to the map.
     * This sets up the control's DOM structure and attaches necessary event listeners.
     *
     * @param {L.Map} map The Leaflet map instance to which the control is being added.
     * @returns {HTMLElement} The main container element of the control.
     */
    onAdd: function (map) {
      this._initLayout(); // Create and arrange the HTML elements for the control.
      this._update();     // Populate the control with the current list of layers.

      // Attach event listeners to the map to react to layers being added or removed.
      // This ensures the control's display remains synchronized with the map's state.
      map
        .on('layeradd', this._onLayerChange, this)    // Listen for layers being added.
        .on('layerremove', this._onLayerChange, this); // Listen for layers being removed.

      return this._container; // Return the main DOM element that represents this control.
    }, // End of onAdd function.

    /**
     * Method called when the control is removed from the map.
     * This cleans up any event listeners attached to the map to prevent memory leaks.
     *
     * @param {L.Map} map The Leaflet map instance from which the control is being removed.
     */
    onRemove: function (map) {
      // Detach the previously attached event listeners from the map.
      map
        .off('layeradd', this._onLayerChange)
        .off('layerremove', this._onLayerChange);
    }, // End of onRemove function.

    /**
     * Public method to add a new base layer to the control after initialization.
     *
     * @param {L.Layer} layer The Leaflet layer object (e.g., L.tileLayer, L.ImageOverlay).
     * @param {string}  name  The display name for the base layer in the control.
     * @returns {L.Control.GroupedLayers} The current control instance for chaining.
     */
    addBaseLayer: function ( layer, name ) {
      this._addLayer(layer, name); // Use the internal method to register the layer.
      this._update();             // Refresh the control's UI to reflect the new layer.
      return this;                // Enable fluent interface (method chaining).
    }, // End of addBaseLayer.

    /**
     * Public method to add a new overlay layer to the control after initialization.
     *
     * @param {L.Layer} layer The Leaflet layer object.
     * @param {string}  name  The display name for the overlay layer.
     * @param {string}  group The name of the group this overlay belongs to.
     * @returns {L.Control.GroupedLayers} The current control instance for chaining.
     */
    addOverlay: function ( layer, name, group ) {
      this._addLayer(layer, name, group, true); // Register as an overlay with its group.
      this._update();                          // Refresh the control's UI.
      return this;                             // Enable method chaining.
    }, // End of addOverlay.

    /**
     * Public method to remove a layer from the control's management.
     * Note: This only removes the layer from the control, not from the map itself.
     * If the layer is currently on the map, it will remain there until explicitly removed from the map.
     *
     * @param {L.Layer} layer The Leaflet layer object to remove.
     * @returns {L.Control.GroupedLayers} The current control instance for chaining.
     */
    removeLayer: function ( layer ) {
      var id = L.Util.stamp(layer); // Obtain the unique ID associated with the layer.
      delete this._layers[id];     // Remove the layer's entry from the internal storage.
      this._update();              // Refresh the control's UI to remove the layer's item.
      return this;                 // Enable method chaining.
    }, // End of removeLayer.

    // Private method to set up the basic HTML structure of the control.
    _initLayout: function () {
      var className = 'leaflet-control-layers', // Base CSS class name for styling.
          container = this._container = L.DomUtil.create('div', className); // Create the main control container.

      // This attribute helps with accessibility and touch devices, particularly IE10.
      // It prevents a 'mouseout' event from firing on touch release, which could collapse the control prematurely.
      container.setAttribute('aria-haspopup', true);

      // Prevent click events from propagating to the map, which could interfere with map interaction.
      if ( ! L.Browser.touch ) {
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.on(container, 'wheel', L.DomEvent.stopPropagation); // Also stop wheel events.
      } else {
        // For touch devices, stop click propagation directly.
        L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
      } // End of browser touch check.

      // Create the form element that will hold the layer selection inputs.
      var form = this._form = L.DomUtil.create('form', className + '-list');

      // Logic for handling the collapsed state of the control.
      if ( this.options.collapsed ) {
        // For non-Android browsers, use mouseover/mouseout events to expand/collapse the control.
        if ( ! L.Browser.android ) {
          L.DomEvent
            .on(container, 'mouseover', this._expand, this)  // Expand on mouse over.
            .on(container, 'mouseout', this._collapse, this); // Collapse on mouse out.
        } // End of Android browser check.

        // Create the toggle link (the visible part of the control when collapsed).
        var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
        link.href = '#';        // Standard practice for anchor tags that trigger JavaScript.
        link.title = 'Layers';  // Tooltip text for the toggle link.

        // Special handling for touch devices for the toggle link.
        if ( L.Browser.touch ) {
          L.DomEvent
            .on(link, 'click', L.DomEvent.stop)    // Prevent default link behavior (e.g., scrolling to top).
            .on(link, 'click', this._expand, this); // Expand the control when the link is tapped.
        }
        else {
          // For non-touch devices, expand the control when the link gains focus (e.g., via keyboard navigation).
          L.DomEvent.on(link, 'focus', this._expand, this);
        } // End of touch link handling.

        // Collapse the control if the user clicks anywhere on the map outside the control.
        this._map.on('click', this._collapse, this);
        // Future enhancement: Add comprehensive keyboard accessibility.
      } else {
        // If the control is configured not to be collapsed, expand it immediately.
        this._expand();
      } // End of collapsed option check.

      // Create the distinct sections within the form for base layers, a separator, and overlay layers.
      this._baseLayersList = L.DomUtil.create('div', className + '-base', form);      // Container for base layer radio buttons.
      this._separator = L.DomUtil.create('div', className + '-separator', form);     // A visual separator between base and overlays.
      this._overlaysList = L.DomUtil.create('div', className + '-overlays', form); // Container for overlay checkboxes.

      container.appendChild(form); // Append the form containing layer lists to the main control container.
    }, // End of _initLayout function.

    /**
     * Internal method to register a layer with the control.
     * This stores the layer's details but does not add it to the DOM immediately.
     *
     * @param {L.Layer} layer   The Leaflet layer object.
     * @param {string}  name    The human-readable name for the layer.
     * @param {string}  [group] Optional. The name of the group if this is an overlay layer.
     * @param {boolean} [overlay] Optional. True if the layer is an overlay, false or undefined for base layers.
     */
    _addLayer: function ( layer, name, group, overlay ) {
      var id = L.Util.stamp(layer); // Get a unique identifier for the Leaflet layer.

      // Store essential layer information in the internal _layers object.
      this._layers[id] = {
        layer: layer,   // The actual Leaflet layer instance.
        name: name,     // The display name for this layer.
        overlay: overlay // Boolean flag: true if it's an overlay, false for base layer.
      };

      // If a group name is provided, process group-specific information.
      if ( group ) {
        var groupId = this._groupList.indexOf(group); // Check if this group name has been encountered before.

        // If it's a new group, add it to the list of groups.
        if ( groupId === -1 ) {
          groupId = this._groupList.push(group) - 1; // Add the group name and get its new index.
        } // End of new group identification.

        // Store the group details directly with the layer's entry.
        this._layers[id].group = {
          name: group,   // The name of the group.
          id: groupId    // The unique numerical ID assigned to this group.
        };
      } // End of group processing.

      // If autoZIndex is enabled and the layer supports `setZIndex`, assign a new z-index.
      if ( this.options.autoZIndex && layer.setZIndex ) {
        this._lastZIndex++;           // Increment the z-index counter for the next layer.
        layer.setZIndex(this._lastZIndex); // Apply the new z-index to the current layer.
      } // End of autoZIndex logic.
    }, // End of _addLayer function.

    // Private method to refresh the control's display based on the current state of layers.
    _update: function () {
      // If the control's container hasn't been created yet (e.g., not yet added to map), exit.
      if ( ! this._container ) {
        return;
      } // End of container check.

      // Clear the current content of the base layers and overlay lists.
      this._baseLayersList.innerHTML = '';
      this._overlaysList.innerHTML = '';
      this._domGroups.length = 0; // Clear the array holding references to DOM group elements.

      var baseLayersPresent = false, // Flag to track if any base layers are managed.
          overlaysPresent = false,   // Flag to track if any overlay layers are managed.
          i, obj;                    // Loop variable and temporary object reference.

      // Iterate through all registered layers and add their corresponding UI items.
      for ( i in this._layers ) {
        obj = this._layers[i];       // Get the current layer's details object.
        this._addItem(obj);          // Create and append the UI element (checkbox/radio) for this layer.
        overlaysPresent = overlaysPresent || obj.overlay;     // Update flag if an overlay is found.
        baseLayersPresent = baseLayersPresent || ! obj.overlay; // Update flag if a base layer is found.
      } // End of layers iteration.

      // Adjust the visibility of the separator based on whether both types of layers exist.
      // The separator is shown only if there are both base layers AND overlay layers.
      this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';
    }, // End of _update function.

    // Private method that handles events fired by the map when layers are added or removed.
    _onLayerChange: function (e) {
      // Retrieve the internal layer object using the unique stamp ID from the event's layer.
      var obj = this._layers[L.Util.stamp(e.layer)];

      // If the layer involved in the event is not managed by this control, ignore it.
      if ( ! obj ) {
        return;
      } // End of object existence check.

      // If the control is not currently busy handling a click event from its own UI,
      // update its display to reflect the map's layer change.
      if ( ! this._handlingClick ) {
        this._update();
      } // End of handlingClick check.

      // Determine the specific type of event to fire on the map itself,
      // allowing other components to react to changes in base layers or overlays.
      var type = obj.overlay ?
        (e.type === 'layeradd' ? 'overlayadd' : 'overlayremove') : // For overlays: 'overlayadd' or 'overlayremove'.
        (e.type === 'layeradd' ? 'baselayerchange' : null);       // For base layers: 'baselayerchange' (only on add).

      // If a relevant event type was determined, fire it on the map.
      if ( type ) {
        this._map.fire(type, obj);
      } // End of type check.
    }, // End of _onLayerChange function.

    /*
     * This is a workaround for an IE7 bug where dynamically creating radio buttons via `document.createElement('input')`
     * and setting `type='radio'` does not work reliably. Instead, innerHTML is used to parse the HTML string.
     * Further details can be found here: http://bit.ly/PqYLBe
     *
     * @param {string}  name    The 'name' attribute for the radio button group.
     * @param {boolean} checked Whether the radio button should be initially checked.
     * @returns {HTMLInputElement} The created radio button element.
     */
    _createRadioElement: function ( name, checked ) {
      var radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' + name + '"';
      if ( checked ) {
        radioHtml += ' checked="checked"'; // Add the 'checked' attribute if specified.
      }
      radioHtml += '/>'; // Close the input tag.

      var radioFragment = document.createElement('div'); // Create a temporary div element.
      radioFragment.innerHTML = radioHtml;              // Insert the HTML string into its innerHTML.

      return radioFragment.firstChild; // Return the first child, which will be the radio input.
    }, // End of _createRadioElement function.

    /**
     * Private method to create and append the UI item (checkbox/radio button and label) for a single layer.
     *
     * @param {Object} obj The internal layer object containing details like layer, name, overlay status, and group info.
     * @returns {HTMLLabelElement} The newly created label element for the layer item.
     */
    _addItem: function ( obj ) {
      var label = document.createElement('label'), // Create a <label> element to wrap the input and name.
          input,                                 // Variable to hold the <input> element (radio or checkbox).
          checked = this._map.hasLayer(obj.layer), // Check if the layer is currently active on the map.
          container;                             // Variable to reference the parent DOM element where this item will be appended.

      // Determine whether to create a checkbox (for overlays) or a radio button (for base layers).
      if ( obj.overlay ) {
        input = document.createElement('input'); // Create a standard input element.
        input.type = 'checkbox';                 // Set its type to 'checkbox'.
        input.className = 'leaflet-control-layers-selector'; // Apply the common selector class.
        input.defaultChecked = checked;          // Set its initial checked state based on map presence.
      } else {
        // For base layers, use the special method to create a radio button.
        input = this._createRadioElement('leaflet-base-layers', checked);
      } // End of overlay type check.

      input.layerId = L.Util.stamp(obj.layer); // Store the unique layer ID directly on the input element for easy lookup.

      // Attach a click event handler to the input element.
      L.DomEvent.on(input, 'click', this._onInputClick, this);

      var name = document.createElement('span'); // Create a <span> element to display the layer's name.
      name.innerHTML = ' ' + obj.name;          // Set the inner HTML to the layer's name, prefixed with a space for spacing.

      label.appendChild(input); // Append the input (checkbox/radio) to the label.
      label.appendChild(name);  // Append the layer name span to the label.

      // Determine the correct parent container for the label.
      if ( obj.overlay ) {
        container = this._overlaysList; // Start by targeting the general overlays list.

        var groupContainer = this._domGroups[obj.group.id]; // Attempt to retrieve an existing DOM container for this layer's group.

        // If a DOM container for this group doesn't exist yet, create it.
        if ( ! groupContainer ) {
          groupContainer = document.createElement('div'); // Create a new <div> for the group.
          groupContainer.className = 'leaflet-control-layers-group'; // Apply CSS class for styling.
          groupContainer.id = 'leaflet-control-layers-group-' + obj.group.id; // Assign a unique ID for the group container.

          var groupLabel = document.createElement('span'); // Create a <span> for the group's name.
          groupLabel.className = 'leaflet-control-layers-group-name'; // Apply CSS class for styling.
          groupLabel.innerHTML = obj.group.name; // Set the group's display name.

          groupContainer.appendChild(groupLabel); // Add the group name to the group container.
          container.appendChild(groupContainer);  // Append the new group container to the overlays list.

          this._domGroups[obj.group.id] = groupContainer; // Store a reference to the newly created group container.
        } // End of group container creation.

        container = groupContainer; // Now, the actual container for the label is the specific group container.
      } else {
        container = this._baseLayersList; // If it's a base layer, append it to the base layers list.
      } // End of container determination logic.

      container.appendChild(label); // Finally, append the complete label (with input and name) to its designated container.

      return label; // Return the created label element.
    }, // End of _addItem function.

    // Private method to handle the click event on a layer selection input (checkbox or radio button).
    _onInputClick: function () {
      var i, input, obj,      // Declare loop variables and references.
          inputs = this._form.getElementsByTagName('input'), // Get all input elements within the control's form.
          inputsLen = inputs.length; // Cache the length of the inputs collection for efficiency.

      this._handlingClick = true; // Set a flag to indicate that a click event is currently being processed.

      // Iterate through all input elements to determine which layers need to be added or removed from the map.
      for ( i = 0; i < inputsLen; i++ ) {
        input = inputs[i];          // Get the current input element in the loop.
        obj = this._layers[input.layerId]; // Retrieve the corresponding layer object from internal storage using its ID.

        // If the input is checked AND the layer is not currently on the map, add it.
        if ( input.checked && ! this._map.hasLayer(obj.layer) ) {
          this._map.addLayer(obj.layer);
        }
        // If the input is unchecked AND the layer IS currently on the map, remove it.
        else if ( ! input.checked && this._map.hasLayer(obj.layer) ) {
          this._map.removeLayer(obj.layer);
        } // End of layer add/remove conditional logic.
      } // End of loop through inputs.

      this._handlingClick = false; // Reset the flag once all input changes have been processed.
    }, // End of _onInputClick function.

    // Private method to expand the control's visual display.
    _expand: function () {
      // Add a CSS class to the main container, which typically applies styles to make it visible and expanded.
      L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');
    }, // End of _expand function.

    // Private method to collapse the control's visual display.
    _collapse: function () {
      // Remove the CSS class that signifies the expanded state, effectively collapsing the control.
      this._container.className = this._container.className.replace(' leaflet-control-layers-expanded', '');
    } // End of _collapse function.
  } // End of the object literal passed to L.Control.extend.
); // End of the L.Control.extend call.

// Factory function for creating an instance of L.Control.GroupedLayers.
// This provides a more convenient and idiomatic way to instantiate Leaflet controls.
L.control.groupedLayers = function ( baseLayers, groupedOverlays, options ) {
  // Returns a new instance of the GroupedLayers control with the provided layers and options.
  return new L.Control.GroupedLayers( baseLayers, groupedOverlays, options );
}; // End of groupedLayers factory function.