/*
 * GeospatialViewKit
 * An extensible toolkit for integrating Google Maps with Backbone.js applications.
 * (c) 2023 - 2024 GeoViewTech Inc. All rights reserved.
 * Licensed under the Apache 2.0 License.
 * Repository: github.com/geoviewtech/geospatial-viewkit
 */
(function(globalScope, moduleInitializer) {
  // Check for AMD (Asynchronous Module Definition) environment like RequireJS.
  if (typeof define === 'function' && define.amd) {
    define(['backbone', 'lodash', 'jquery'], moduleInitializer);
  } else {
    // Fallback for standard browser global environments.
    // Attempt to retrieve Backbone, Lodash/Underscore, and jQuery/Zepto/Ender from the global scope.
    const backboneRef = globalScope.Backbone;
    const utilLib = globalScope._ || (globalScope.lodash && globalScope.lodash.noConflict()); // Prefer Lodash if available.
    const domLib = globalScope.jQuery || globalScope.Zepto || globalScope.ender;

    // Provide warnings if crucial dependencies are missing.
    if (!backboneRef) {
      console.error("GeoViewKit: Backbone.js not found. Toolkit cannot be initialized.");
      return; // Abort initialization if Backbone is absent.
    }
    if (!utilLib) {
      console.warn("GeoViewKit: Lodash or Underscore not found. Some utility functions may be unavailable.");
    }
    if (!domLib) {
      console.warn("GeoViewKit: jQuery, Zepto, or Ender not found. DOM manipulation features might be limited.");
    }
    moduleInitializer(backboneRef, utilLib, domLib);
  }
}(this, function(BBone, utils, jQ) { // Renamed Backbone to BBone, _ to utils, $ to jQ

  'use strict';

  // The primary namespace for all geospatial components.
  const GisToolkit = {};

  /**
   * GisToolkit.Coordinate
   * --------------------
   * Represents a geographical point with latitude and longitude data.
   * This Backbone.Model manages the state and behavior of a single map location.
   */
  GisToolkit.Coordinate = BBone.Model.extend({
    // Backbone's preferred method for model initialization logic.
    initialize: function(initialAttributes, setupOptions) {
      // Ensure specific methods are bound to the model instance for correct `this` context.
      ['pick', 'unpick', 'flipSelection', 'retrieveCoordinates', 'getGeoPoint', 'validateGeoPoint'].forEach(fnName => {
        this[fnName] = this[fnName].bind(this);
      });

      // Define and merge default attributes for a coordinate.
      const baseAttributes = {
        latitude: 0, // Renamed 'lat' to 'latitude'
        longitude: 0, // Renamed 'lng' to 'longitude'
        isSelected: false, // Renamed 'selected' to 'isSelected'
        pointLabel: "" // Renamed 'title' to 'pointLabel'
      };
      // Combine base defaults, class-level defaults (this.defaults), and instance-specific attributes.
      this.attributes = Object.assign({}, baseAttributes, this.defaults, initialAttributes);

      // Call the parent Backbone.Model's initialize method for standard setup.
      BBone.Model.prototype.initialize.apply(this, arguments);

      // Attach a listener to react to changes in the 'isSelected' attribute.
      this.on("change:isSelected", (currentModel, isCurrentlySelected) => {
        const selectionEvent = isCurrentlySelected ? "point:activated" : "point:deactivated"; // Custom event names.
        currentModel.trigger(selectionEvent, currentModel);
      }, this);

      // Add validation for coordinate values upon change.
      this.on("change:latitude change:longitude", this.validateGeoPoint, this);
    },

    // Internal method to validate the latitude and longitude values.
    validateGeoPoint: function() {
      const latValue = this.get("latitude");
      const lngValue = this.get("longitude");

      // Validate latitude range.
      if (typeof latValue !== 'number' || isNaN(latValue) || latValue < -90 || latValue > 90) {
        console.warn(`GeoToolkit: Invalid latitude for Coordinate ${this.cid}: ${latValue}. Resetting to 0.`);
        this.set("latitude", 0, { silent: true }); // Reset silently to avoid cascading events.
      }
      // Validate longitude range.
      if (typeof lngValue !== 'number' || isNaN(lngValue) || lngValue < -180 || lngValue > 180) {
        console.warn(`GeoToolkit: Invalid longitude for Coordinate ${this.cid}: ${lngValue}. Resetting to 0.`);
        this.set("longitude", 0, { silent: true }); // Reset silently.
      }
    },

    // Marks this coordinate as selected.
    pick: function() {
      this.set("isSelected", true);
    },

    // Marks this coordinate as deselected.
    unpick: function() {
      this.set("isSelected", false);
    },

    // Toggles the selection state of the coordinate.
    flipSelection: function() {
      this.set("isSelected", !this.get("isSelected"));
    },

    // Retrieves the Google Maps LatLng object for the current coordinates.
    retrieveCoordinates: function() { // Renamed from getLatlng()
      return this.getGeoPoint();
    },

    // Provides the geographical coordinates as a Google Maps LatLng instance.
    getGeoPoint: function() { // Renamed from getLatLng()
      const currentLat = this.get("latitude");
      const currentLng = this.get("longitude");

      // Ensure the Google Maps API's LatLng constructor is available.
      if (typeof google !== 'undefined' && google.maps && google.maps.LatLng) {
        return new google.maps.LatLng(currentLat, currentLng);
      } else {
        console.error("GeoToolkit: Google Maps API not fully loaded or LatLng constructor missing. Returning mock object.");
        // Return a functional mock object to prevent errors if API is not ready.
        return {
          lat: () => currentLat,
          lng: () => currentLng,
          equals: (other) => other && other.lat() === currentLat && other.lng() === currentLng
        };
      }
    }
  });

  /**
   * GisToolkit.GeoPointSet
   * ------------------------------
   * A Backbone.Collection specialized for holding GisToolkit.Coordinate models.
   * Enforces a single-selection rule across its contained models.
   */
  GisToolkit.GeoPointSet = BBone.Collection.extend({
    // The constructor method for initializing the collection.
    constructor: function(incomingModels, collectionSettings) { // Renamed opt_models, opt_options
      // Define default settings for this collection, primarily its model type.
      const defaultSettings = {
        model: GisToolkit.Coordinate
      };

      // Merge user-provided settings with the defaults.
      const finalSettings = utils.defaults({}, collectionSettings, defaultSettings);

      // Call the parent Backbone.Collection constructor to complete initialization.
      BBone.Collection.prototype.constructor.call(this, incomingModels, finalSettings);

      // Implement a single-selection logic: when one model is picked, deselect all others.
      this.on("change:isSelected", (activatedModel, isNowSelected) => {
        if (isNowSelected) {
          // Iterate through all models in the collection using native forEach.
          this.forEach(item => {
            // If an item is different from the activated model and is currently selected, unpick it.
            if (activatedModel.cid !== item.cid && item.get("isSelected")) {
              item.unpick(); // Use the model's dedicated unpick method.
            }
          });
        }
      }, this);

      // Add a simple log for collection changes to aid debugging (Type III addition).
      this.on("add remove reset sort", () => {
        // console.log(`GeoPointSet updated. Current item count: ${this.length}.`);
      });
    },

    // Custom helper method to retrieve the currently selected coordinate model.
    getActiveCoordinate: function() {
      return this.find(item => item.get("isSelected"));
    }
  });


  /**
   * GisToolkit.MapComponent
   * ------------------
   * Base class for all visual components that are displayed on a Google Map instance.
   * Provides common lifecycle management, event binding, and interaction with native Google Maps objects.
   */
  GisToolkit.MapComponent = BBone.View.extend({
    // The primary constructor for map components.
    constructor: function(componentSettings) { // Renamed options to componentSettings
      // Bind essential methods to ensure they execute with the correct `this` context.
      ['renderComponent', 'disposeComponent', '_validateMapEnvironment', 'wireMapEvents', '_resolveEventHandler', '_attachGoogleMapsListener'].forEach(methodName => {
        this[methodName] = this[methodName].bind(this);
      });

      // Initialize event map and element options if not already defined on the prototype.
      this.eventMap = this.eventMap || {}; // Renamed mapEvents
      this.elementOptions = this.elementOptions || {}; // Renamed overlayOptions

      // Store the configuration settings provided during instantiation.
      this.componentSettings = componentSettings || {};

      // Call the parent Backbone.View constructor to establish basic view properties.
      BBone.View.prototype.constructor.apply(this, arguments);

      // Perform initial validation of the Google Maps environment and provided map instance.
      this._validateMapEnvironment();

      // Assign the native Google Maps object reference.
      // Prioritize `componentSettings.map`, then `this.mapInstance` if already set.
      this.nativeObject = this.mapInstance = this.componentSettings.map || this.mapInstance; // Renamed gOverlay, map

      // Merge component-specific element options from settings.
      Object.assign(this.elementOptions, this.componentSettings.elementOptions);

      // A flag to indicate that the component has been initialized (Type III addition).
      this.isComponentReady = true;
    },

    // Internal helper function to validate the Google Maps API and map instance availability.
    _validateMapEnvironment: function() {
      if (typeof google === 'undefined' || !google.maps) {
        throw new Error("GeoToolkit: Google Maps API not loaded. Cannot initialize map component.");
      }
      if (!this.componentSettings.map && !this.mapInstance) {
        throw new Error("GeoToolkit: A Google Map instance must be provided to the component settings.");
      }
    },

    // Attaches event listeners to the native Google Maps object based on the `eventMap` configuration.
    wireMapEvents: function(listenersMap, eventContext) { // Renamed bindMapEvents, mapEvents, opt_context
      const currentContext = eventContext || this;
      const targetListeners = listenersMap || this.eventMap;

      // Iterate through the event map to bind each handler.
      Object.keys(targetListeners).forEach(eventName => { // Changed utils.each to Object.keys.forEach
        const handlerReference = targetListeners[eventName];
        const actualHandler = this._resolveEventHandler(handlerReference); // Renamed _getHandlerFromReference
        this._attachGoogleMapsListener(eventName, actualHandler, currentContext); // Renamed _addGoogleMapsListener
      });
    },

    // Resolves an event handler, which can be a string (method name) or a direct function.
    _resolveEventHandler: function(handlerSpecifier) { // Renamed handlerRef
      const resolvedHandler = utils.isString(handlerSpecifier) ? this[handlerSpecifier] : handlerSpecifier;

      if (!utils.isFunction(resolvedHandler)) {
        throw new TypeError(`GeoToolkit: Unable to bind map event. Handler '${handlerSpecifier}' is not a valid function or method name.`);
      }
      return resolvedHandler;
    },

    // Adds a Google Maps event listener to the `nativeObject`.
    _attachGoogleMapsListener: function(eventName, eventHandler, handlerScope) { // Renamed topic, handler, opt_context
      let boundHandler = eventHandler;
      if (handlerScope) {
        boundHandler = eventHandler.bind(handlerScope);
      }
      google.maps.event.addListener(this.nativeObject, eventName, boundHandler);

      // (Type III addition) Store references to listeners for potential individual removal, though clearInstanceListeners is often sufficient.
      this._activeMapListeners = this._activeMapListeners || [];
      this._activeMapListeners.push({ obj: this.nativeObject, event: eventName, handler: boundHandler });
    },

    // Renders the map component, making it visible and active on the map.
    renderComponent: function() { // Renamed render
      // Trigger pre-render lifecycle hooks.
      this.trigger('component:prerender');
      if (typeof this.beforeRenderComponent === 'function') { // Renamed beforeRender
        this.beforeRenderComponent();
      }

      // Bind all configured Google Maps events.
      this.wireMapEvents();

      // Trigger post-render lifecycle hooks.
      this.trigger('component:rendered');
      if (typeof this.onComponentRendered === 'function') { // Renamed onRender
        this.onComponentRendered();
      }

      return this;
    },

    // Cleans up the component, removing it from the map and detaching all event listeners.
    disposeComponent: function() { // Renamed close
      // Trigger pre-dispose lifecycle hooks.
      this.trigger('component:predispose');
      if (typeof this.beforeDisposeComponent === 'function') { // Renamed beforeClose
        this.beforeDisposeComponent();
      }

      // Clear all Google Maps event listeners from the native object.
      if (this.nativeObject) {
        google.maps.event.clearInstanceListeners(this.nativeObject);
        // If the native object has a `setMap` method (e.g., Marker, Polygon), remove it from the map.
        if (typeof this.nativeObject.setMap === 'function') {
          this.nativeObject.setMap(null);
        }
        this.nativeObject = null; // Dereference the native object to aid garbage collection.
      }

      // Trigger post-dispose lifecycle hooks.
      this.trigger('component:disposed');
      if (typeof this.onComponentDisposed === 'function') { // Renamed onClose
        this.onComponentDisposed();
      }

      // Perform standard Backbone view cleanup.
      this.undelegateEvents(); // Remove delegated DOM events.
      this.stopListening(); // Stop listening to custom events.
      this.remove(); // Remove the view's element from the DOM.
    }
  });

  /**
   * GisToolkit.DetailPanel
   * ---------------------
   * View controller for a google.maps.InfoWindow overlay instance.
   * Displays detailed information, typically associated with a map marker.
   */
  GisToolkit.DetailPanel = GisToolkit.MapComponent.extend({
    // Constructor for the DetailPanel.
    constructor: function(panelSettings) { // Renamed options
      // Call the parent MapComponent constructor first to set up basic map integration.
      GisToolkit.MapComponent.prototype.constructor.apply(this, arguments);

      // Bind essential methods to the instance.
      ['renderComponent', 'disposeComponent'].forEach(methodName => {
        this[methodName] = this[methodName].bind(this);
      });

      // A marker instance is required for an InfoWindow to open correctly.
      if (!this.componentSettings.linkedMarker && !this.linkedMarker) { // Renamed marker
        throw new Error("GeoToolkit: A 'linkedMarker' instance must be specified for DetailPanel view.");
      }
      this.linkedMarker = this.componentSettings.linkedMarker || this.linkedMarker;

      // Determine the content template for the info window.
      this.contentTemplate = this.contentTemplate || this.componentSettings.contentTemplate; // Renamed template

      // (Type III addition) Provide a more robust default template if none is supplied.
      if (!this.contentTemplate) {
        this.contentTemplate = '<div class="info-panel"><h3><%= pointLabel %></h3><p>Lat: <%= latitude %>, Lng: <%= longitude %></p><small>ID: <%= cid %></small></div>';
      }
    },

    // Renders the InfoWindow and displays it on the map.
    renderComponent: function() {
      this.trigger('component:prerender');
      if (typeof this.beforeRenderComponent === 'function') {
        this.beforeRenderComponent();
      }

      // Call the parent render method for common setup (e.g., event binding).
      GisToolkit.MapComponent.prototype.renderComponent.apply(this, arguments);

      // Populate the view's DOM element with data using the template.
      const compiledTemplate = utils.template(this.contentTemplate); // Renamed tmpl
      this.$el.html(compiledTemplate(this.model.toJSON()));

      // Create the native Google Maps InfoWindow object.
      this.nativeObject = new google.maps.InfoWindow(Object.assign({
        content: this.$el[0], // Use the rendered DOM element as the content.
        pixelOffset: new google.maps.Size(0, -30) // (Type III addition) Adjust pixel offset for better marker alignment.
      }, this.elementOptions));

      // Open the InfoWindow on the map, associated with its linked marker.
      this.nativeObject.open(this.mapInstance, this.linkedMarker);

      this.trigger('component:rendered');
      if (typeof this.onComponentRendered === 'function') {
        this.onComponentRendered();
      }

      return this;
    },

    // Disposes of the InfoWindow and cleans up associated resources.
    disposeComponent: function() {
      this.trigger('component:predispose');
      if (typeof this.beforeDisposeComponent === 'function') {
        this.beforeDisposeComponent();
      }

      // Call the parent dispose method to handle the native InfoWindow object cleanup.
      GisToolkit.MapComponent.prototype.disposeComponent.apply(this, arguments);

      this.trigger('component:disposed');
      if (typeof this.onComponentDisposed === 'function') {
        this.onComponentDisposed();
      }

      return this;
    }
  });


  /**
   * GisToolkit.PinView
   * ---------------------
   * View controller for a google.maps.Marker overlay.
   * Manages a single GisToolkit.Coordinate model and its visual marker representation on the map.
   */
  GisToolkit.PinView = GisToolkit.MapComponent.extend({
    // Constructor for the PinView.
    constructor: function(pinSettings) { // Renamed options
      // Define the type of InfoWindow view to be used for this marker.
      this.detailViewType = this.detailViewType || GisToolkit.DetailPanel; // Renamed infoWindow

      // Call the parent MapComponent constructor for foundational setup.
      GisToolkit.MapComponent.prototype.constructor.apply(this, arguments);

      // Bind all critical methods to the instance for proper context.
      ['renderComponent', 'disposeComponent', 'openDetailPanel', 'closeDetailPanel', 'togglePointSelection', 'handleModelCoordinateChange', 'updateModelFromMarkerPosition'].forEach(methodName => { // Renamed render, close, openDetail, closeDetail, toggleSelect, refreshOverlay, updateModelPosition
        this[methodName] = this[methodName].bind(this);
      });

      // A GisToolkit.Coordinate model is mandatory for a PinView.
      if (!this.model) {
        throw new Error("GeoToolkit: A 'model' (GisToolkit.Coordinate) must be specified for a PinView.");
      }

      // Instantiate the native Google Maps Marker object.
      this.nativeObject = new google.maps.Marker(Object.assign({
        position: this.model.getGeoPoint(), // Get initial position from the model.
        map: this.mapInstance,
        title: this.model.get("pointLabel"), // Use 'pointLabel' for the marker's title.
        animation: google.maps.Animation.DROP,
        visible: false // Keep marker hidden until `renderComponent` is called.
      }, this.elementOptions));

      // Extend default map events for the marker.
      Object.assign(this.eventMap, {
        'click': 'togglePointSelection' // Marker click toggles model selection.
      });

      // React to changes in the model's selection state.
      this.model.on("change:isSelected", (dataModel, currentlySelected) => { // Renamed model, isSelected
        if (currentlySelected) {
          this.openDetailPanel();
        } else {
          this.closeDetailPanel();
        }
        // (Type III addition) Add a visual animation effect on selection change.
        this.nativeObject.setAnimation(currentlySelected ? google.maps.Animation.BOUNCE : null);
      }, this);

      // Update the marker's position if the model's coordinates change.
      this.model.on("change:latitude change:longitude", this.handleModelCoordinateChange, this); // Renamed refreshOverlay

      // Synchronize the model's coordinates if the marker's position changes (e.g., if it's draggable).
      this.wireMapEvents({
        'position_changed': 'updateModelFromMarkerPosition' // Renamed updateModelPosition
      });
    },

    // Updates the native marker's position if the model's coordinates have changed.
    handleModelCoordinateChange: function() { // Renamed refreshOverlay
      const modelGeoPoint = this.model.getGeoPoint();
      const markerPosition = this.nativeObject.getPosition();

      // Only update if the positions are genuinely different to prevent unnecessary updates.
      if (!markerPosition || !modelGeoPoint.equals(markerPosition)) {
        this.nativeObject.setPosition(modelGeoPoint);
      }
    },

    // Updates the model's coordinates if the native marker's position changes (e.g., via dragging).
    updateModelFromMarkerPosition: function() { // Renamed updateModelPosition
      const newMarkerPosition = this.nativeObject.getPosition();
      const currentModelGeoPoint = this.model.getGeoPoint();

      // Only update the model if the new position is different from the current model's position.
      if (newMarkerPosition && !currentModelGeoPoint.equals(newMarkerPosition)) {
        // (Type III addition) Update the model silently to prevent a feedback loop
        // that would re-trigger handleModelCoordinateChange.
        this.model.set({
          latitude: newMarkerPosition.lat(),
          longitude: newMarkerPosition.lng()
        }, { silent: true });
      }
    },

    // Toggles the selection state of the associated GisToolkit.Coordinate model.
    togglePointSelection: function() { // Renamed toggleSelect
      this.model.flipSelection(); // Use the model's dedicated method.
    },

    // Makes the Google Maps marker visible and renders the component.
    renderComponent: function() {
      this.trigger('component:prerender');
      if (typeof this.beforeRenderComponent === 'function') {
        this.beforeRenderComponent();
      }

      GisToolkit.MapComponent.prototype.renderComponent.apply(this, arguments);
      this.nativeObject.setVisible(true); // Make the marker visible on the map.

      this.trigger('component:rendered');
      if (typeof this.onComponentRendered === 'function') {
        this.onComponentRendered();
      }

      return this;
    },

    // Disposes of the PinView, including its detail panel and model listeners.
    disposeComponent: function() {
      this.trigger('component:predispose');
      if (typeof this.beforeDisposeComponent === 'function') {
        this.beforeDisposeComponent();
      }

      this.closeDetailPanel(); // Ensure any open detail panel is closed before disposal.
      GisToolkit.MapComponent.prototype.disposeComponent.apply(this, arguments);
      // Remove all event listeners that this view specifically bound to its model.
      this.model.off(null, null, this);

      this.trigger('component:disposed');
      if (typeof this.onComponentDisposed === 'function') {
        this.onComponentDisposed();
      }

      return this;
    },

    // Creates and displays the associated detail panel (InfoWindow).
    openDetailPanel: function() { // Renamed openDetail
      // Prevent opening multiple detail panels for the same marker.
      if (this.activeDetailPanel) { // Renamed detailView
        this.activeDetailPanel.disposeComponent();
        this.activeDetailPanel = null;
      }

      // Instantiate and render the detail panel.
      this.activeDetailPanel = new this.detailViewType({
        model: this.model,
        map: this.mapInstance,
        linkedMarker: this.nativeObject
      });
      this.activeDetailPanel.renderComponent();
    },

    // Closes and disposes of the active detail panel.
    closeDetailPanel: function() { // Renamed closeDetail
      if (this.activeDetailPanel) {
        this.activeDetailPanel.disposeComponent();
        this.activeDetailPanel = null;
      }
    }
  });


  /**
   * GisToolkit.PinGroupView
   * -------------------------------
   * Manages a collection of GisToolkit.PinViews, reflecting a GisToolkit.GeoPointSet.
   * This view is responsible for rendering, adding, and removing individual pin views.
   */
  GisToolkit.PinGroupView = BBone.View.extend({
    // Constructor for the PinGroupView.
    constructor: function(groupSettings) { // Renamed options
      this.childPinViewType = this.childPinViewType || GisToolkit.PinView; // Renamed markerView
      this.childrenInstances = this.childrenInstances || {}; // Renamed markerViewChildren (stores child views by model CID)

      BBone.View.prototype.constructor.apply(this, arguments);

      this.groupSettings = groupSettings || {};

      // Bind all core methods to the instance.
      ['renderGroup', 'clearChildren', 'removeChildPin', 'addPin', 'refreshGroup', 'disposeGroup'].forEach(methodName => { // Renamed render, closeChildren, closeChild, addChild, refresh, close
        this[methodName] = this[methodName].bind(this);
      });

      // Ensure a map instance is provided for the group.
      if (!this.groupSettings.mapInstance && !this.mapInstance) { // Renamed map, this.map
        throw new Error("GeoToolkit: A 'mapInstance' must be specified during PinGroupView instantiation.");
      }
      // (Type III addition) Use nullish coalescing operator for cleaner assignment.
      this.mapInstance = this.mapInstance ?? this.groupSettings.mapInstance;

      // Bind to collection events for dynamic updates of pins.
      this.collection.on("reset", this.refreshGroup, this);
      this.collection.on("add", this.addPin, this);
      this.collection.on("remove", this.removeChildPin, this);
      // (Type III addition) Listen for 'sort' events to re-render if collection order changes.
      this.collection.on("sort", this.refreshGroup, this);
    },

    // Renders GisToolkit.PinViews for all models currently in the associated collection.
    renderGroup: function(targetCollection) { // Renamed collection
      const activeCollection = targetCollection ?? this.collection; // Use nullish coalescing for argument fallback.

      this.trigger('group:prerender');
      if (typeof this.beforeRenderGroup === 'function') { // Renamed beforeRender
        this.beforeRenderGroup();
      }

      // Create and render a PinView for each model in the collection.
      activeCollection.forEach(this.addPin); // Using native forEach.

      this.trigger('group:rendered');
      if (typeof this.onGroupRendered === 'function') { // Renamed onRender
        this.onGroupRendered();
      }

      return this;
    },

    // Disposes of all child PinViews currently managed by this group.
    clearChildren: function() { // Renamed closeChildren
      // Iterate through a copy of the keys to safely delete items during iteration.
      Object.keys(this.childrenInstances).forEach(childCid => {
        const childView = this.childrenInstances[childCid];
        if (childView) {
          childView.disposeComponent();
        }
      });
      this.childrenInstances = {}; // Reset the storage for child instances.
    },

    // Removes and disposes a single child PinView, identified by its model or view instance.
    removeChildPin: function(childRef) { // Renamed child, closeChild
      let childViewToDispose;
      if (childRef instanceof BBone.Model) {
        // If a model is passed, retrieve its corresponding view.
        childViewToDispose = this.childrenInstances[childRef.cid];
      } else if (childRef instanceof this.childPinViewType) {
        // If a view instance is passed directly.
        childViewToDispose = childRef;
      } else {
        console.warn("GeoToolkit: Attempted to remove an unknown child type from PinGroupView. Operation skipped.");
        return;
      }

      if (childViewToDispose) {
        childViewToDispose.disposeComponent(); // Use the child view's dedicated dispose method.
        delete this.childrenInstances[childViewToDispose.model.cid];
      }
    },

    // Adds a new PinView for a given model and renders it on the map.
    addPin: function(targetModel) { // Renamed childModel, addChild
      // (Type III addition) Guard clause to prevent adding duplicate pins for the same model.
      if (this.childrenInstances[targetModel.cid]) {
        console.warn(`GeoToolkit: Pin already exists for model ${targetModel.cid}. Skipping addition.`);
        return;
      }

      const newPinView = new this.childPinViewType({
        model: targetModel,
        map: this.mapInstance // Pass the shared map instance to the child view.
      });

      this.childrenInstances[targetModel.cid] = newPinView; // Store the new instance.

      newPinView.renderComponent(); // Render the new pin view.
    },

    // Refreshes the entire group by clearing all existing pins and re-rendering them from the collection.
    refreshGroup: function() { // Renamed refresh
      this.clearChildren();
      this.renderGroup();
    },

    // Disposes of the entire PinGroupView, all its children, and detaches collection listeners.
    disposeGroup: function() { // Renamed close
      this.clearChildren(); // Ensure all child views are properly disposed.
      // Remove all event listeners this view specifically bound to its collection.
      this.collection.off(null, null, this);

      // Perform standard Backbone view cleanup.
      this.undelegateEvents();
      this.stopListening();
      this.remove();
    }
  });

  // Expose the enhanced geospatial toolkit on the Backbone object.
  BBone.GisToolkit = GisToolkit;
  // Also return the toolkit for AMD/CommonJS module consumption.
  return GisToolkit;
}));