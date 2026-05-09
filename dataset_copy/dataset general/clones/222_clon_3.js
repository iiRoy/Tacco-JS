"use strict";

(function(jQuery, documentElement, currentWindow, VectorDrawingAPI, undefinedValue) {
  // A sophisticated factory for generating jQuery plugins.
  // This module encapsulates the logic for creating reusable UI components.
  function createJQueryWidget(jqInstance, widgetIdentifier, behaviorDefinition, getterMethodNames) {
    // Validate and normalize the list of getter method names.
    const validGetterMethodNames = Array.isArray(getterMethodNames) ? getterMethodNames : [];
    
    // Efficient lookup table to quickly determine if a method is a getter.
    const isGetterLookup = {};
    for (let currentLookupIndex = 0; currentLookupIndex < validGetterMethodNames.length; currentLookupIndex++) {
      isGetterLookup[validGetterMethodNames[currentLookupIndex]] = true;
    }
  
    // The fundamental constructor for each widget instance.
    // Each instance manages a single DOM element and its associated state.
    const WidgetInstanceCore = function(managedDomElement) {
      this.managedElement = managedDomElement;
      this._isFullyInitialized = false; // Internal flag to track initialization status.
      // Additional internal properties can be added here, e.g., this._widgetState = {};
    };

    // Extend the prototype of the WidgetInstanceCore with the provided behavior methods.
    // This makes the core functionality available to all instances.
    Object.assign(WidgetInstanceCore.prototype, behaviorDefinition);
    
    // Attach the new widget to jQuery's prototype, enabling chainable calls.
    jqInstance.fn[widgetIdentifier] = function() {
      const functionArguments = arguments;
      let finalReturnValue = this; // By default, return the jQuery object for chaining.
      
      // Process each selected DOM element independently.
      this.each(function() {
        const currentJqElement = jqInstance(this);
        let activeWidget = currentJqElement.data('widget-' + widgetIdentifier);

        // If no widget instance is associated with the element, create a new one.
        if (!activeWidget) {
          activeWidget = new WidgetInstanceCore(currentJqElement);
          currentJqElement.data('widget-' + widgetIdentifier, activeWidget);

          // Invoke the primary initialization method if it exists.
          if (typeof activeWidget.initializeWidget === 'function') {
            activeWidget.initializeWidget.apply(activeWidget, functionArguments);
            activeWidget._isFullyInitialized = true; // Mark as successfully initialized.
          }
        } else if (typeof functionArguments[0] === 'string') {
          // If a method name string is passed, attempt to execute that method.
          const requestedMethodName = functionArguments[0];
          
          // Enforce convention: private methods (starting with '_') cannot be called externally.
          // Also, ensure the method actually exists on the widget instance.
          if (requestedMethodName.charAt(0) !== '_' && typeof activeWidget[requestedMethodName] === 'function') {
            // Prepare arguments for the method call, excluding the method name itself.
            const methodCallArguments = Array.from(functionArguments).slice(1);
            const methodExecutionResult = activeWidget[requestedMethodName].apply(activeWidget, methodCallArguments);

            // If the invoked method is identified as a getter, its return value
            // becomes the overall return value of the jQuery plugin call.
            if (isGetterLookup[requestedMethodName]) {
              finalReturnValue = methodExecutionResult;
            }
          } else {
             // Provide feedback for invalid or disallowed method calls.
             console.warn(`Widget "${widgetIdentifier}" on`, currentJqElement[0], `attempted to call an invalid or private method: "${requestedMethodName}".`);
          }
        } else {
            // If an active widget exists but no valid method name is provided,
            // assume a re-initialization attempt or an error.
            console.warn(`Widget "${widgetIdentifier}" on`, currentJqElement[0], `already initialized. Re-initialization with new options is not yet supported via direct call.`);
        }
      });
      
      return finalReturnValue; // Return either the jQuery object or a getter's result.
    };
  }
  
  // Fundamental dimensions for the map canvas, used for scaling calculations.
  const CANVAS_BASE_WIDTH = 930; // Original design width of the map.
  const CANVAS_BASE_HEIGHT = 630; // Original design height of the map.
  const SIDEBAR_LABEL_AREA_WIDTH = 70; // Fixed width for a label sidebar.
  
  // Comprehensive default configuration for the map visualization widget.
  // These settings provide a baseline and can be customized by users.
  const defaultConfiguration = {
    // Default visual styles applied to all geographical regions.
    'regionVisuals': {
      fill: "#333",
      stroke: "#666",
      "stroke-width": 1,
      "stroke-linejoin": "round",
      scale: [1, 1] // No initial scaling applied here; handled by Raphael viewBox.
    },
    
    // Styles applied to a region when the user's mouse hovers over it.
    'regionHoverVisuals': {
      fill: "#33c",
      stroke: "#000",
      scale: [1.1, 1.1] // Slightly enlarge on hover.
    },
    
    // Duration for the visual transition during hover events (in milliseconds).
    // Set to 0 or null to disable animations.
    'regionHoverTransitionDuration': 500,
    
    // Object for defining region-specific style overrides (e.g., {'NY': { fill: 'blue' }}).
    'perRegionVisuals': {},
    
    // Object for defining region-specific hover style overrides.
    'perRegionHoverVisuals': {},
    
    // Callback functions for user interaction events.
    'onRegionClick': null, // Executed when a region is clicked.
    'onRegionMouseEnter': null, // Executed when mouse enters a region.
    'onRegionMouseLeave': null, // Executed when mouse leaves a region.
    
    // Deprecated: Older event callback maps. Use 'onRegionClick' etc. for global handling.
    'legacyClickMap': {},
    'legacyMouseOverMap': {},
    'legacyMouseOutMap': {},
    
    // Configuration for displaying additional labels (e.g., for small states).
    'displayRegionLabels': true, // Boolean: true to show labels, false to hide.
    'labelBoxWidth': 20, // Base width of the rectangular background for labels.
    'labelBoxHeight': 15, // Base height of the label background.
    'labelSpacing': 6, // Horizontal/vertical spacing between label boxes.
    'labelCornerRadius': 3, // Radius for rounded corners of label backgrounds.
    
    // Visual styles for the background rectangle of labels.
    'labelBackgroundVisuals': {
      fill: "#333",
      stroke: "#666",
      "stroke-width": 1,
      "stroke-linejoin": "round",
      scale: [1, 1]
    },
    
    // Hover styles for label backgrounds.
    'labelBackgroundHoverVisuals': {
      fill: "#33c",
      stroke: "#000"
    },
    
    // Region-specific overrides for label background styles.
    'perRegionLabelBackgroundVisuals': {},
    
    // Region-specific overrides for label background hover styles.
    'perRegionLabelBackgroundHoverVisuals': {},
    
    // Visual styles for the text content of labels.
    'labelTextVisuals': {
      fill: "#fff",
      'stroke': 'none',
      'font-weight': 300,
      'stroke-width': 0,
      'font-size': '10px' // Base font size for labels.
    },
    
    // Hover styles for label text (often left default if background handles highlight).
    'labelTextHoverVisuals': {},
    
    // Region-specific overrides for label text styles.
    'perRegionLabelTextVisuals': {},
    
    // Region-specific overrides for label text hover styles.
    'perRegionLabelTextHoverVisuals': {}
  };
  
  // The primary behavioral methods that define the map widget's functionality.
  const widgetBehavior = {
    /**
     * Entry point for widget initialization. Configures the Raphael canvas,
     * processes user options, and orchestrates the drawing of map elements.
     * @param {object} userProvidedOptions - Custom options to override defaults.
     */
    initializeWidget: function(userProvidedOptions) {
      if (!this.managedElement || this.managedElement.length === 0) {
          console.error("Widget initialization failed: No valid DOM element to manage.");
          return;
      }

      // Deep merge user-provided options with the default configuration.
      this.widgetOptions = jQuery.extend(true, {}, defaultConfiguration, userProvidedOptions);
      
      // Capture the current dimensions of the container element.
      const containerWidth = this.managedElement.width();
      const containerHeight = this.managedElement.height();

      if (containerWidth <= 0 || containerHeight <= 0) {
          console.warn("Widget container has zero or negative dimensions. Map may not be visible.");
          // Attempt to proceed, but visuals might be off.
      }
      
      // Calculate the uniform scaling factor to fit the map within the container
      // while maintaining its original aspect ratio.
      const horizontalScaleFactor = containerWidth / CANVAS_BASE_WIDTH;
      const verticalScaleFactor = containerHeight / CANVAS_BASE_HEIGHT;
      this.overallScaling = Math.min(horizontalScaleFactor, verticalScaleFactor);

      // Compute the scaled width for the label sidebar, ensuring it's an integer.
      this.calculatedLabelAreaWidth = Math.ceil(SIDEBAR_LABEL_AREA_WIDTH / this.overallScaling);
      
      // Determine the total effective width for the Raphael canvas. This accounts
      // for the main map area and any additional space required by the label sidebar.
      const effectivePaperWidth = CANVAS_BASE_WIDTH + Math.max(0, this.calculatedLabelAreaWidth - SIDEBAR_LABEL_AREA_WIDTH);
      
      // Instantiate the Raphael canvas, binding it to the raw DOM element.
      if (this.raphaelCanvas) {
          this.raphaelCanvas.clear(); // Clear any previous drawings if re-initializing.
          this.raphaelCanvas.remove(); // Remove the old canvas instance.
      }
      this.raphaelCanvas = VectorDrawingAPI(this.managedElement.get(0), effectivePaperWidth, CANVAS_BASE_HEIGHT);
      
      // Adjust the Raphael canvas size to match the container and set its view box.
      this.raphaelCanvas.setSize(containerWidth, containerHeight);
      this.raphaelCanvas.setViewBox(0, 0, effectivePaperWidth, CANVAS_BASE_HEIGHT, false);
      
      // Initialize internal data structures to hold references to Raphael elements.
      this.regionClickTargets = {}; // Invisible shapes for capturing user input.
      this.regionVectorShapes = {}; // The visible graphical paths of regions.
      this.regionBoundingBoxes = {}; // Pre-calculated bounding boxes for scaled regions.
      this.lastDrawnShape = null; // A reference to the most recently drawn Raphael element.
      
      // Delegate to a helper method to create and configure all