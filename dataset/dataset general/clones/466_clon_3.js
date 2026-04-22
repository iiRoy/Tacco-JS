(function() {
  // Main application namespace for geographical visualization components.
  // This object orchestrates the creation and management of various map entities.
  this.GeoCanvas = {
    // Entry point for constructing a specific geographical component.
    // It dynamically selects or uses a provided handler based on the options.
    assemble: function(componentType, configSettings) {
      // Ensure configuration settings are always an object to prevent errors.
      const operationalConfig = configSettings || {};

      // Determine the concrete builder class to use.
      // If a custom handler function is provided in configSettings, use it.
      // Otherwise, fall back to the default component orchestrator.
      const componentOrchestrator = typeof operationalConfig.orchestrator === 'function' ?
        operationalConfig.orchestrator :
        GeoCanvas.Structures.ComponentOrchestrator;

      // Instantiate and return the chosen orchestrator with the given type and settings.
      return new componentOrchestrator(componentType, operationalConfig);
    },
    // Collection of component factories.
    ComponentFactories: {},
    // Collection of core data structures and models.
    Structures: {},
    // Specific implementation details for Google Maps API.
    GoogleAPI: {
      Structures: {},
      ComponentFactories: {}
    }
  };

}).call(this);
(function() {
  // Keywords that are reserved for internal module lifecycle hooks.
  // These properties should not be directly copied as regular members during extension.
  const lifecycleHooks = ['extended', 'integrated'];

  // Helper function for checking if an item is present in an array.
  // Provides compatibility for older environments if `Array.prototype.includes` is unavailable.
  const arrayContains = Array.prototype.includes ?
    function(arr, item) { return arr.includes(item); } :
    function(arr, item) {
      for (let i = 0, len = arr.length; i < len; i++) {
        if (arr[i] === item) return true;
      }
      return false;
    };

  // Base class for all extendable and includable objects within GeoCanvas.
  // Provides static methods for mixing in properties and methods.
  this.GeoCanvas.BaseModule = (function() {
    function BaseModule() {
      // Constructor is intentionally empty for this base class.
      // Derived classes will implement their own initialization logic.
    }

    // Static method to extend the class itself with new static properties and methods.
    // Properties with names matching `lifecycleHooks` are treated specially.
    BaseModule.augmentStatic = function(staticProps) {
      for (const propName in staticProps) {
        if (Object.prototype.hasOwnProperty.call(staticProps, propName)) {
          const propValue = staticProps[propName];
          // Only copy properties that are not internal lifecycle hooks.
          if (!arrayContains(lifecycleHooks, propName)) {
            this[propName] = propValue;
          }
        }
      }
      // If an 'extended' hook is provided, invoke it in the context of the current class.
      if (staticProps.extended && typeof staticProps.extended === 'function') {
        staticProps.extended.apply(this);
      }
      return this; // Allow chaining.
    };

    // Static method to add new instance methods and properties to the prototype of the class.
    // Properties with names matching `lifecycleHooks` are treated specially.
    BaseModule.integrateInstance = function(instanceProps) {
      for (const propName in instanceProps) {
        if (Object.prototype.hasOwnProperty.call(instanceProps, propName)) {
          const propValue = instanceProps[propName];
          // Only copy properties that are not internal lifecycle hooks.
          if (!arrayContains(lifecycleHooks, propName)) {
            this.prototype[propName] = propValue;
          }
        }
      }
      // If an 'integrated' hook is provided, invoke it in the context of the current class.
      if (instanceProps.integrated && typeof instanceProps.integrated === 'function') {
        instanceProps.integrated.apply(this);
      }
      return this; // Allow chaining.
    };

    return BaseModule;
  })();

}).call(this);
(function() {
  // Abstract base class for all builder components within GeoCanvas.
  // Builders are responsible for creating service-specific objects (e.g., Google Maps objects).
  this.GeoCanvas.Structures.ServiceBuilder = (function() {
    function ServiceBuilder() {
      // The constructor for the base builder is kept minimal.
      // Subclasses will handle specific initialization.
    }

    // Creates an instance of the model class associated with this builder,
    // passing its service object.
    ServiceBuilder.prototype.constructModel = function() {
      const ModelClass = this.retrieveModelClass();
      return new ModelClass(this.serviceObject);
    };

    // Placeholder for pre-initialization logic.
    // Subclasses can override this to perform setup before `serviceObject` is created.
    ServiceBuilder.prototype.preConstructionHook = function() {
      // No operation by default.
    };

    // Placeholder for post-initialization logic.
    // Subclasses can override this to perform setup after `serviceObject` is created.
    ServiceBuilder.prototype.postConstructionHook = function() {
      // No operation by default.
    };

    // Attaches an event listener to the underlying service object.
    ServiceBuilder.prototype.attachListener = function(eventName, callbackFunction) {
      const primitives = this.getServicePrimitives();
      const serviceObj = this.getUnderlyingServiceObject();
      return primitives.addListener(serviceObj, eventName, callbackFunction);
    };

    // Retrieves the underlying service object managed by this builder.
    ServiceBuilder.prototype.getUnderlyingServiceObject = function() {
      return this.serviceObject;
    };

    // Retrieves the service primitives (e.g., Google Maps API objects like `google.maps.LatLng`).
    ServiceBuilder.prototype.getServicePrimitives = function() {
      // The primitives are typically stored as a static property on the constructor.
      return this.constructor.PRIMITIVE_API_ACCESSOR;
    };

    // Retrieves the model class that this builder is responsible for constructing.
    ServiceBuilder.prototype.retrieveModelClass = function() {
      // The model class is typically stored as a static property on the constructor.
      return this.constructor.ASSOCIATED_MODEL;
    };

    return ServiceBuilder;
  })();

}).call(this);
(function() {
  // Factory function to create a specialized builder factory.
  // This helps in setting up static properties on builder and object classes consistently.
  this.GeoCanvas.Structures.BuilderAssembler = function(targetBuilderClass, targetObjectClass, apiPrimitivesProvider) {
    return {
      // The core method to build and return an object using the specified builder.
      create: function(inputArguments, providerSpecificOptions, internalControlOptions) {
        // Ensure the object class and builder class have access to the API primitives.
        targetObjectClass.PRIMITIVE_API_ACCESSOR = apiPrimitivesProvider;
        targetBuilderClass.ASSOCIATED_MODEL = targetObjectClass;
        targetBuilderClass.PRIMITIVE_API_ACCESSOR = apiPrimitivesProvider;

        // Instantiate the builder with the provided arguments and options.
        const activeBuilder = new targetBuilderClass(inputArguments, providerSpecificOptions, internalControlOptions);
        // Instruct the builder to construct and return its associated model.
        return activeBuilder.constructModel();
      }
    };
  };

}).call(this);
(function() {
  // The main orchestrator for geographical components, managing map interactions and objects.
  this.GeoCanvas.Structures.ComponentOrchestrator = (function() {
    function ComponentOrchestrator(componentKind, initOptions) {
      this.componentKind = componentKind;
      // Ensure initialization options are always an object.
      const safeInitOptions = initOptions || {};

      // Validate componentKind early.
      if (typeof componentKind !== 'string' || componentKind.trim() === '') {
        console.warn('GeoCanvas: ComponentOrchestrator initialized with an invalid componentKind. Defaulting to "default".');
        this.componentKind = 'default';
      }

      // Set up the API primitives access.
      this.initializePrimitives(safeInitOptions);
      // Process and store various configuration options.
      this.configureSettings(safeInitOptions);
      // Pre-cache all available builders for performance.
      this.primeBuilderCache();
      // Initialize the bounds tracking mechanism.
      this.resetSpatialBounds();
    }

    // Constructs the primary map interface.
    ComponentOrchestrator.prototype.constructMap = function(mapOptions, onMapReadyCallback) {
      // Default to an empty function if no callback is provided.
      const mapReadyHandler = onMapReadyCallback || (() => {});
      const self = this; // Capture 'this' for the callback context.

      // Use the 'Map' builder to create the map instance.
      // The builder will handle API-specific map creation.
      this.currentMapInstance = this.getComponentBuilder('Map').create(mapOptions, function() {
        // Once the map is loaded, initialize the clustering mechanism.
        self.createMarkerAggregator();
        // Execute the user-defined callback.
        mapReadyHandler();
      });
      return this.currentMapInstance;
    };

    // Adds multiple markers to the map.
    ComponentOrchestrator.prototype.addMultipleMarkers = function(markerDataArray, providerSpecificOptions) {
      // Use Array.prototype.map for functional iteration and transformation.
      return markerDataArray.map(markerDataItem => {
        return this.addSingleMarker(markerDataItem, providerSpecificOptions);
      });
    };

    // Adds a single marker to the map.
    ComponentOrchestrator.prototype.addSingleMarker = function(markerData, providerSpecificOptions) {
      // Build the marker using the 'Marker' component builder.
      const newMarker = this.getComponentBuilder('Marker').create(markerData, providerSpecificOptions, this.markerConfig);
      // Set the marker's map to the currently active map.
      newMarker.setMap(this.getMapServiceReference());
      // Add the marker to the aggregator (clusterer or null clusterer).
      this.markerAggregator.addMarker(newMarker);
      return newMarker;
    };

    // Adds multiple circles to the map.
    ComponentOrchestrator.prototype.addMultipleCircles = function(circleDataArray, providerSpecificOptions) {
      return circleDataArray.map(circleDataItem => {
        return this.addSingleCircle(circleDataItem, providerSpecificOptions);
      });
    };

    // Adds a single circle to the map.
    ComponentOrchestrator.prototype.addSingleCircle = function(circleData, providerSpecificOptions) {
      return this.addGeoResource('Circle', circleData, providerSpecificOptions);
    };

    // Adds multiple polylines to the map.
    ComponentOrchestrator.prototype.addMultiplePolylines = function(polylineDataArray, providerSpecificOptions) {
      return polylineDataArray.map(polylineDataItem => {
        return this.addSinglePolyline(polylineDataItem, providerSpecificOptions);
      });
    };

    // Adds a single polyline to the map.
    ComponentOrchestrator.prototype.addSinglePolyline = function(polylineData, providerSpecificOptions) {
      return this.addGeoResource('Polyline', polylineData, providerSpecificOptions);
    };

    // Adds multiple polygons to the map.
    ComponentOrchestrator.prototype.addMultiplePolygons = function(polygonDataArray, providerSpecificOptions) {
      return polygonDataArray.map(polygonDataItem => {
        return this.addSinglePolygon(polygonDataItem, providerSpecificOptions);
      });
    };

    // Adds a single polygon to the map.
    ComponentOrchestrator.prototype.addSinglePolygon = function(polygonData, providerSpecificOptions) {
      return this.addGeoResource('Polygon', polygonData, providerSpecificOptions);
    };

    // Adds multiple KML layers to the map.
    ComponentOrchestrator.prototype.addMultipleKMLs = function(kmlDataArray, providerSpecificOptions) {
      return kmlDataArray.map(kmlDataItem => {
        return this.addSingleKML(kmlDataItem, providerSpecificOptions);
      });
    };

    // Adds a single KML layer to the map.
    ComponentOrchestrator.prototype.addSingleKML = function(kmlData, providerSpecificOptions) {
      return this.addGeoResource('Kml', kmlData, providerSpecificOptions);
    };

    // Removes multiple markers from the map and the aggregator.
    ComponentOrchestrator.prototype.removeMultipleMarkers = function(canvasMarkers) {
      return canvasMarkers.map(canvasMarker => {
        return this.removeSingleMarker(canvasMarker);
      });
    };

    // Removes a single marker from the map and the aggregator.
    ComponentOrchestrator.prototype.removeSingleMarker = function(canvasMarker) {
      // Clear the marker from the map (set its map to null).
      canvasMarker.clear();
      // Remove it from the marker aggregator.
      this.markerAggregator.removeMarker(canvasMarker);
      return canvasMarker;
    };

    // Adjusts the map's viewport to encompass all currently tracked bounds.
    ComponentOrchestrator.prototype.adjustMapViewport = function() {
      // Ensure a map instance exists before attempting to fit bounds.
      if (this.currentMapInstance) {
        this.currentMapInstance.fitToBounds(this.spatialBounds.getUnderlyingServiceObject());
      } else {
        console.warn('GeoCanvas: Cannot adjust map viewport, map instance not yet built.');
      }
    };

    // Retrieves the underlying service object reference for the current map.
    ComponentOrchestrator.prototype.getMapServiceReference = function() {
      return this.currentMapInstance ? this.currentMapInstance.getUnderlyingServiceObject() : null;
    };

    // Configures various settings from the initial options.
    ComponentOrchestrator.prototype.configureSettings = function(options) {
      // Merge default marker options with user-provided marker options.
      this.markerConfig = Object.assign(this.getDefaultMarkerOptions(), options.markers);
      // Merge default builder configurations.
      this.componentBuilders = Object.assign(this.getDefaultBuilderConfigs(), options.builders);
      // Merge default model configurations, potentially overriding the clusterer if clustering is disabled.
      this.componentModels = Object.assign(this.getDefaultModelConfigs(), options.models);
    };

    // Resets the spatial bounds accumulator.
    ComponentOrchestrator.prototype.resetSpatialBounds = function() {
      this.spatialBounds = this.getComponentBuilder('Bound').create();
    };

    // Initializes the API primitives accessor.
    ComponentOrchestrator.prototype.initializePrimitives = function(options) {
      if (typeof options.primitives === 'function') {
        // If primitives is a function, invoke it to get the accessor.
        this.apiPrimitives = options.primitives();
      } else if (options.primitives !== undefined) {
        // If primitives is explicitly provided (and not undefined), use it directly.
        this.apiPrimitives = options.primitives;
      } else {
        // Otherwise, use the default primitives accessor from the root module.
        this.apiPrimitives = this.retrieveRootModule().Primitives();
      }
    };

    // Returns the currently active infowindow instance managed by a marker builder, if any.
    ComponentOrchestrator.prototype.getActiveInfoWindow = function() {
      // This assumes the Marker builder stores a reference to the active infowindow.
      return this.componentBuilders.Marker.CURRENT_INFO_WINDOW;
    };

    // Helper to add a generic geographical resource (circle, polyline, polygon, KML).
    ComponentOrchestrator.prototype.addGeoResource = function(resourceName, resourceData, providerSpecificOptions) {
      const resource = this.getComponentBuilder(resourceName).create(resourceData, providerSpecificOptions);
      resource.setMap(this.getMapServiceReference());
      return resource;
    };

    // Populates an internal cache of builder factories for quicker access.
    ComponentOrchestrator.prototype.primeBuilderCache = function() {
      const builderKinds = ['Bound', 'Circle', 'Clusterer', 'Kml', 'Map', 'Marker', 'Polygon', 'Polyline'];
      // Use `forEach` for iteration without returning a new array.
      builderKinds.forEach(kind => {
        this.getComponentBuilder(kind); // Accessing it once creates and caches it.
      });
    };

    // Determines if marker clustering is enabled based on configuration.
    ComponentOrchestrator.prototype.isClusteringEnabled = function() {
      // Clustering is enabled if the 'clusterer' option is a non-null object.
      return typeof this.markerConfig.clusterer === 'object' && this.markerConfig.clusterer !== null;
    };

    // Creates the appropriate marker aggregator (clusterer or a null object if disabled).
    ComponentOrchestrator.prototype.createMarkerAggregator = function() {
      if (this.isClusteringEnabled()) {
        this.markerAggregator = this.getComponentBuilder('Clusterer').create({
          map: this.getMapServiceReference()
        }, this.markerConfig.clusterer);
      } else {
        // If clustering is not enabled, use a "null object" pattern to avoid conditional logic later.
        this.markerAggregator = new GeoCanvas.Structures.NoOpAggregator();
      }
    };

    // Provides default options for markers.
    ComponentOrchestrator.prototype.getDefaultMarkerOptions = function() {
      // Use `Object.assign` with an empty object to create a shallow clone.
      return Object.assign({}, {
        singleInfoWindow: true, // Only one infowindow open at a time.
        randomOffsetDistance: 0, // No random offset for markers.
        clusterer: { // Default clustering options.
          maxZoom: 15, // Max zoom level for clustering.
          gridSize: 60 // Grid size for clustering.
        }
      });
    };

    // Retrieves or creates a component builder factory from cache.
    // Uses a simple object for caching.
    ComponentOrchestrator.prototype.getComponentBuilder = function(builderKey) {
      const normalizedKey = this.capitalizeString(builderKey);
      const cachePropertyName = `_cachedBuilder_${normalizedKey}`;

      // If the builder factory is not already cached, create and store it.
      if (!this[cachePropertyName]) {
        this[cachePropertyName] = GeoCanvas.Structures.BuilderAssembler(
          this.componentBuilders[normalizedKey],
          this.componentModels[normalizedKey],
          this.apiPrimitives
        );
      }
      return this[cachePropertyName];
    };

    // Provides default model configurations.
    ComponentOrchestrator.prototype.getDefaultModelConfigs = function() {
      // Start with a clone of the root module's object structures.
      const models = Object.assign({}, this.retrieveRootModule().Structures);
      // If clustering is NOT enabled, ensure the Clusterer model is the NoOpAggregator.
      if (!this.isClusteringEnabled()) {
        models.Clusterer = GeoCanvas.Structures.NoOpAggregator;
      }
      return models;
    };

    // Capitalizes the first letter of a string.
    ComponentOrchestrator.prototype.capitalizeString = function(inputString) {
      if (typeof inputString !== 'string' || inputString.length === 0) {
        return '';
      }
      return inputString.charAt(0).toUpperCase() + inputString.slice(1);
    };

    // Provides default builder configurations.
    ComponentOrchestrator.prototype.getDefaultBuilderConfigs = function() {
      // Return a shallow clone of the root module's builder factories.
      return Object.assign({}, this.retrieveRootModule().ComponentFactories);
    };

    // Retrieves the root module based on the componentKind (e.g., GeoCanvas.GoogleAPI).
    ComponentOrchestrator.prototype.retrieveRootModule = function() {
      // Cache the root module lookup for efficiency.
      if (!this._rootModuleCache) {
        this._rootModuleCache = GeoCanvas[this.componentKind];
      }
      return this._rootModuleCache;
    };

    return ComponentOrchestrator;

  })();

}).call(this);
(function() {
  // A "null object" implementation for the marker aggregator when clustering is disabled.
  // It provides the same interface as a real clusterer but performs no operations,
  // preventing errors from calling methods on an undefined object.
  this.GeoCanvas.Structures.NoOpAggregator = (function() {
    function NoOpAggregator() {
      // Constructor is empty as no state needs to be managed.
    }

    NoOpAggregator.prototype.addMarkers = function() { /* No operation */ };
    NoOpAggregator.prototype.addMarker = function() { /* No operation */ };
    NoOpAggregator.prototype.clear = function() { /* No operation */ };
    NoOpAggregator.prototype.removeMarker = function() { /* No operation */ };

    return NoOpAggregator;

  })();

}).call(this);
(function() {
  // Common functionalities shared by various Google Maps API-related objects.
  // This mixin provides methods for interacting with the service object.
  this.GeoCanvas.GoogleAPI.Structures.CommonMapObject = {
    // Retrieves the underlying Google Maps service object.
    getUnderlyingServiceObject: function() {
      return this.serviceObject;
    },
    // Sets the map for the service object.
    setMap: function(targetMap) {
      // Guard against null serviceObject.
      if (!this.serviceObject) {
        console.warn('GeoCanvas: Attempted to set map on a null serviceObject.');
        return;
      }
      return this.getUnderlyingServiceObject().setMap(targetMap);
    },
    // Clears the object from the map by setting its map to null.
    clear: function() {
      return this.setMap(null); // Re-use setMap for consistency.
    },
    // Makes the service object visible on the map.
    makeVisible: function() {
      // Optional: Add a check if setVisible is available.
      if (typeof this.getUnderlyingServiceObject().setVisible === 'function') {
        return this.getUnderlyingServiceObject().setVisible(true);
      }
    },
    // Hides the service object from the map.
    hideObject: function() {
      if (typeof this.getUnderlyingServiceObject().setVisible === 'function') {
        return this.getUnderlyingServiceObject().setVisible(false);
      }
    },
    // Checks if the service object is currently visible.
    isCurrentlyVisible: function() {
      if (typeof this.getUnderlyingServiceObject().getVisible === 'function') {
        return this.getUnderlyingServiceObject().getVisible();
      }
      return true; // Default to visible if method not found.
    },
    // Retrieves the API primitives associated with this object's constructor.
    getServicePrimitives: function() {
      return this.constructor.PRIMITIVE_API_ACCESSOR;
    }
  };

}).call(this);
(function() {
  // Helper for JavaScript inheritance, mimicking CoffeeScript's `extends`.
  // This is kept consistent with the original code's inheritance pattern.
  const __hasOwn = {}.hasOwnProperty;
  const __inherit = function(child, parent) {
    for (const key in parent) {
      if (__hasOwn.call(parent, key)) child[key] = parent[key];
    }

    function TempConstructor() {
      this.constructor = child;
    }
    TempConstructor.prototype = parent.prototype;
    child.prototype = new TempConstructor();
    child.__super__ = parent.prototype;
    return child;
  };

  // Builder for geographical bounds (LatLngBounds in Google Maps).
  // This object represents a rectangular area on the map.
  this.GeoCanvas.GoogleAPI.ComponentFactories.GeoBoundaryBuilder = (function(_super) {
    __inherit(GeoBoundaryBuilder, _super);

    function GeoBoundaryBuilder(initialOptions) {
      // Call pre-construction hook.
      this.preConstructionHook();
      // Initialize the Google Maps LatLngBounds object.
      const primitives = this.getServicePrimitives();
      this.serviceObject = new primitives.latLngBounds();
      // Call post-construction hook.
      this.postConstructionHook();

      // Example of adding a new fragment: storing initial options for potential future use.
      this.initialBoundaryOptions = initialOptions;
    }

    // Overriding the base builder's constructModel to add bounds logic.
    GeoBoundaryBuilder.prototype.constructModel = function() {
      const ModelClass = this.retrieveModelClass();
      const modelInstance = new ModelClass(this.serviceObject);

      // Example of adding an intermediate step: if initial options contain coordinates, extend the bounds.
      if (this.initialBoundaryOptions && this.initialBoundaryOptions.coords) {
        this.initialBoundaryOptions.coords.forEach(coord => {
          modelInstance.extend(coord.lat, coord.lng);
        });
      }
      return modelInstance;
    };

    return GeoBoundaryBuilder;

  })(this.GeoCanvas.Structures.ServiceBuilder);

}).call(this);
(function() {
  const __hasOwn = {}.hasOwnProperty;
  const __inherit = function(child, parent) {
    for (const key in parent) {
      if (__hasOwn.call(parent, key)) child[key] = parent[key];
    }

    function TempConstructor() {
      this.constructor = child;
    }
    TempConstructor.prototype = parent.prototype;
    child.prototype = new TempConstructor();
    child.__super__ = parent.prototype;
    return child;
  };

  // Builder for geographical circles.
  this.GeoCanvas.GoogleAPI.ComponentFactories.CircleComponentBuilder = (function(_super) {
    __inherit(CircleComponentBuilder, _super);

    function CircleComponentBuilder(creationArgs, configOverrides) {
      this.creationArgs = creationArgs;
      // Ensure configOverrides is an object, default to empty.
      this.configOverrides = configOverrides || {};

      this.preConstructionHook();
      this.serviceObject = this.generateCircleObject();
      this.postConstructionHook();

      // Guard clause: warn if essential arguments are missing.
      if (!this.creationArgs || typeof this.creationArgs.lat === 'undefined' || typeof this.creationArgs.lng === 'undefined' || typeof this.creationArgs.radius === 'undefined') {
        console.error('GeoCanvas: CircleComponentBuilder missing essential creation arguments (lat, lng, radius).');
      }
    }

    // Creates the Google Maps Circle object.
    CircleComponentBuilder.prototype.generateCircleObject = function() {
      const primitives = this.getServicePrimitives();
      return new primitives.circle(this.getCircleConfiguration());
    };

    // Constructs the configuration object for the Google Maps Circle.
    CircleComponentBuilder.prototype.getCircleConfiguration = function() {
      const primitives = this.getServicePrimitives();
      const baseConfiguration = {
        center: new primitives.latLng(this.creationArgs.lat, this.creationArgs.lng),
        radius: this.creationArgs.radius // Radius in meters.
      };
      // Merge base configuration with any provider-specific overrides.
      return Object.assign(baseConfiguration, this.configOverrides);
    };

    // Overriding hooks to add some console logging for demonstration.
    CircleComponentBuilder.prototype.preConstructionHook = function() {
      // console.log('Circle builder: Starting pre-construction...');
    };

    CircleComponentBuilder.prototype.postConstructionHook = function() {
      // console.log('Circle builder: Completed post-construction.');
    };

    return CircleComponentBuilder;

  })(this.GeoCanvas.Structures.ServiceBuilder);

}).call(this);
(function() {
  const __hasOwn = {}.hasOwnProperty;
  const __inherit = function(child, parent) {
    for (const key in parent) {
      if (__hasOwn.call(parent, key)) child[key] = parent[key];
    }

    function TempConstructor() {
      this.constructor = child;
    }
    TempConstructor.prototype = parent.prototype;
    child.prototype = new TempConstructor();
    child.__super__ = parent.prototype;
    return child;
  };

  // Builder for marker clusterers.
  this.GeoCanvas.GoogleAPI.ComponentFactories.MarkerAggregatorBuilder = (function(_super) {
    __inherit(MarkerAggregatorBuilder, _super);

    function MarkerAggregatorBuilder(inputArguments, aggregationOptions) {
      this.inputArguments = inputArguments;
      this.aggregationOptions = aggregationOptions;

      this.preConstructionHook();
      const primitives = this.getServicePrimitives();
      // Ensure map is provided in inputArguments.
      if (!this.inputArguments || !this.inputArguments.map) {
        console.error('GeoCanvas: MarkerAggregatorBuilder requires a map object in inputArguments.');
        this.serviceObject = null; // Prevent errors if map is missing.
      } else {
        this.serviceObject = new primitives.clusterer(this.inputArguments.map, [], this.aggregationOptions);
      }
      this.postConstructionHook();
    }

    return MarkerAggregatorBuilder;

  })(this.GeoCanvas.Structures.ServiceBuilder);

}).call(this);
(function() {
  const __hasOwn = {}.hasOwnProperty;
  const __inherit = function(child, parent) {
    for (const key in parent) {
      if (__hasOwn.call(parent, key)) child[key] = parent[key];
    }

    function TempConstructor() {
      this.constructor = child;
    }
    TempConstructor.prototype = parent.prototype;
    child.prototype = new TempConstructor();
    child.__super__ = parent.prototype;
    return child;
  };

  // Builder for KML (Keyhole Markup Language) layers.
  this.GeoCanvas.GoogleAPI.ComponentFactories.KMLLayerBuilder = (function(_super) {
    __inherit(KMLLayerBuilder, _super);

    function KMLLayerBuilder(layerArguments, layerProviderOptions) {
      this.layerArguments = layerArguments;
      this.layerProviderOptions = layerProviderOptions || {};

      this.preConstructionHook();
      this.serviceObject = this.createKMLLayer();
      this.postConstructionHook();

      // Validation: Check if KML URL is provided.
      if (!this.layerArguments || !this.layerArguments.url) {
        console.error('GeoCanvas: KMLLayerBuilder requires a URL in layerArguments.');
      }
    }

    // Creates the Google Maps KML Layer object.
    KMLLayerBuilder.prototype.createKMLLayer = function() {
      const primitives = this.getServicePrimitives();
      return new primitives.kml(this.layerArguments.url, this.getKMLLayerOptions());
    };

    // Constructs options for the KML layer.
    KMLLayerBuilder.prototype.getKMLLayerOptions = function() {
      const baseLayerOptions = {
        // Add any common KML options here, e.g., suppress info windows.
        suppressInfoWindows: false
      };
      // Merge base options with provider-specific options.
      return Object.assign(baseLayerOptions, this.layerProviderOptions);
    };

    return KMLLayerBuilder;

  })(this.GeoCanvas.Structures.ServiceBuilder);

}).call(this);
(function() {
  const __hasOwn = {}.hasOwnProperty;
  const __inherit = function(child, parent) {
    for (const key in parent) {
      if (__hasOwn.call(parent, key)) child[key] = parent[key];
    }

    function TempConstructor() {
      this.constructor = child;
    }
    TempConstructor.prototype = parent.prototype;
    child.prototype = new TempConstructor();
    child.__super__ = parent.prototype;
    return child;
  };

  // Builder for the main map instance.
  this.GeoCanvas.GoogleAPI.ComponentFactories.MapInstanceBuilder = (function(_super) {
    __inherit(MapInstanceBuilder, _super);

    function MapInstanceBuilder(mapConfiguration, mapLoadCallback) {
      this.preConstructionHook();

      // Extract provider-specific options, ensuring defaults are applied.
      const providerSpecificMapOptions = Object.assign(this.getStandardMapOptions(), mapConfiguration.provider);
      this.internalMapOptions = mapConfiguration.internal;

      // Validate map container ID.
      if (!this.internalMapOptions || !this.internalMapOptions.id || !document.getElementById(this.internalMapOptions.id)) {
        console.error('GeoCanvas: MapInstanceBuilder requires a valid DOM element ID for the map container.');
        this.serviceObject = null; // Prevent errors if container is missing.
        return;
      }

      const primitives = this.getServicePrimitives();
      this.serviceObject = new primitives.map(document.getElementById(this.internalMapOptions.id), providerSpecificMapOptions);

      // Attach the map load event listener.
      this.setupMapLoadListener(mapLoadCallback);
      this.postConstructionHook();
    }

    // Overrides the base constructModel to pass primitives to the map model.
    MapInstanceBuilder.prototype.constructModel = function() {
      const ModelClass = this.retrieveModelClass();
      return new ModelClass(this.serviceObject, this.getServicePrimitives());
    };

    // Configures the callback to execute once the map is fully loaded and idle.
    MapInstanceBuilder.prototype.setupMapLoadListener = function(readyCallback) {
      const primitives = this.getServicePrimitives();
      return primitives.addListenerOnce(this.serviceObject, 'idle', readyCallback);
    };

    // Defines the default options for a Google Map.
    MapInstanceBuilder.prototype.getStandardMapOptions = function() {
      const primitives = this.getServicePrimitives();
      // Example: Adding a new helper variable for default zoom.
      const defaultZoomLevel = 10;
      return {
        mapTypeId: primitives.mapTypes('HYBRID'), // Changed default map type.
        center: new primitives.latLng(34.0522, -118.2437), // Changed default center (Los Angeles).
        zoom: defaultZoomLevel,
        zoomControl: true, // Added a new default option.
        fullscreenControl: false // Another new default option.
      };
    };

    return MapInstanceBuilder;

  })(this.GeoCanvas.Structures.ServiceBuilder);

}).call(this);
(function() {
  const __bindMethod = function(fn, context) {
    return function() {
      return fn.apply(context, arguments);
    };
  };
  const __hasOwn = {}.hasOwnProperty;
  const __inherit = function(child, parent) {
    for (const key in parent) {
      if (__hasOwn.call(parent, key)) child[key] = parent[key];
    }

    function TempConstructor() {
      this.constructor = child;
    }
    TempConstructor.prototype = parent.prototype;
    child.prototype = new TempConstructor();
    child.__super__ = parent.prototype;
    return child;
  };

  // Builder for geographical markers.
  this.GeoCanvas.GoogleAPI.ComponentFactories.MarkerCreator = (function(_super) {
    __inherit(MarkerCreator, _super);

    // Static property to track the currently open infowindow across all markers.
    MarkerCreator.CURRENT_INFO_WINDOW = null;

    // A simple cache for frequently used marker icons or data.
    MarkerCreator.RESOURCE_CACHE = new Map();

    function MarkerCreator(markerDetails, displayOptions, handlerConfiguration) {
      this.markerDetails = markerDetails;
      this.displayOptions = displayOptions || {};
      this.handlerConfiguration = handlerConfiguration || {};

      // Bind methods that might be used as callbacks to ensure correct 'this' context.
      this.openInfoWindow = __bindMethod(this.openInfoWindow, this);
      this.closeInfoWindow = __bindMethod(this.closeInfoWindow, this);

      this.preConstructionHook();
      this.serviceObject = this.generateMarkerObject();
      this.attachMarkerEvents();
      this.postConstructionHook();
    }

    // Creates the Google Maps Marker object.
    MarkerCreator.prototype.generateMarkerObject = function() {
      const primitives = this.getServicePrimitives();
      const markerOptions = this.getMarkerConfiguration();
      const newMarker = new primitives.marker(markerOptions);

      // If infowindow content is provided, create the infowindow.
      if (this.markerDetails.infoWindowContent) {
        this.infoWindow = new primitives.infoWindow({
          content: this.markerDetails.infoWindowContent
        });
        // Store a reference to the marker on the infowindow for easier access.
        this.infoWindow.__associatedMarker = newMarker;
      }
      return newMarker;
    };

    // Constructs the configuration object for the Google Maps Marker.
    MarkerCreator.prototype.getMarkerConfiguration = function() {
      const primitives = this.getServicePrimitives();
      const position = new primitives.latLng(this.markerDetails.lat, this.markerDetails.lng);
      const baseMarkerOptions = {
        position: position,
        title: this.markerDetails.title || '',
        draggable: this.displayOptions.draggable || false
      };
      // Merge with display options from handler configuration and direct display options.
      return Object.assign(baseMarkerOptions, this.handlerConfiguration, this.displayOptions);
    };

    // Attaches event listeners to the marker, particularly for infowindows.
    MarkerCreator.prototype.attachMarkerEvents = function() {
      if (this.infoWindow) {
        const primitives = this.getServicePrimitives();
        primitives.addListener(this.serviceObject, 'click', this.openInfoWindow);

        // Add a validation check for singleInfoWindow option.
        if (this.handlerConfiguration.singleInfoWindow) {
          primitives.addListener(this.infoWindow, 'closeclick', this.closeInfoWindow);
        }
      }
    };

    // Opens the marker's infowindow, closing any previously open one if configured.
    MarkerCreator.prototype.openInfoWindow = function() {
      if (this.infoWindow) {
        // If single infowindow mode is active, close the previous one.
        if (this.handlerConfiguration.singleInfoWindow && MarkerCreator.CURRENT_INFO_WINDOW && MarkerCreator.CURRENT_INFO_WINDOW !== this.infoWindow) {
          MarkerCreator.CURRENT_INFO_WINDOW.close();
        }
        this.infoWindow.open(this.serviceObject.getMap(), this.serviceObject);
        MarkerCreator.CURRENT_INFO_WINDOW = this.infoWindow;
      }
    };

    // Closes the marker's infowindow and clears the global tracker if it was the active one.
    MarkerCreator.prototype.closeInfoWindow = function() {
      if (this.infoWindow && MarkerCreator.CURRENT_INFO_WINDOW === this.infoWindow) {
        this.infoWindow.close();
        MarkerCreator.CURRENT_INFO_WINDOW = null;
      }
    };

    // Overriding hooks to add some console logging for demonstration.
    MarkerCreator.prototype.preConstructionHook = function() {
      // console.log('Marker creator: Starting pre-construction for ' + (this.markerDetails.title || 'untitled marker'));
    };

    MarkerCreator.prototype.postConstructionHook = function() {
      // console.log('Marker creator: Completed post-construction for ' + (this.markerDetails.title || 'untitled marker'));
    };

    return MarkerCreator;

  })(this.GeoCanvas.Structures.ServiceBuilder);

}).call(this);