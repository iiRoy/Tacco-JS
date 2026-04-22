(function visualModuleInitialization() {
  // Enforce strict parsing and execution rules for cleaner code.
  'use strict';

  // Define the core module name as a constant for easy reference and modification.
  const MODULE_NAME = 'graphicalView';

  // Initialize the Angular module that will house our visualization components.
  // This module depends on no other modules initially.
  var graphicalView = angular.module(MODULE_NAME, []);

  // A mapping of simplified component keys to their full Chart.js type names.
  // This helps in creating dynamic directives and abstracting the underlying Chart.js API.
  const visualMapping = {
    ln: 'line',       // Represents a Line chart
    br: 'bar',        // Represents a Bar chart
    rd: 'radar',      // Represents a Radar chart
    pr: 'polarArea',  // Represents a Polar Area chart
    pe: 'pie',        // Represents a Pie chart
    dn: 'doughnut'    // Represents a Doughnut chart
  };

  /**
   * Helper function to dynamically establish an Angular directive for a specific chart type.
   * This reduces boilerplate code for creating multiple similar directives.
   * @param {string} componentKey - The short key identifying the chart type (e.g., 'ln' for Line).
   * @returns {void}
   */
  const establishVisualComponent = function (componentKey) {
    // Validate the component key to ensure it's not empty or invalid.
    if (!componentKey || typeof visualMapping[componentKey] === 'undefined') {
      console.warn(`[${MODULE_NAME}] Skipping directive creation for invalid component key: "${componentKey}".`);
      return;
    }

    // Capitalize the first letter of the key to form part of the directive name.
    // Example: 'ln' -> 'Ln'
    const capitalizedKey = componentKey.charAt(0).toUpperCase() + componentKey.slice(1);
    
    // Define the directive name with a custom prefix 'gv' (Graphical View).
    const directiveName = 'gv' + capitalizedKey;

    // Register the directive with the Angular module.
    // It uses the 'VisualDataFactory' to get its definition object.
    graphicalView.directive(directiveName, ['VisualDataFactory', function (VisualDataFactory) {
      // The factory function returns the directive definition object tailored for this chart type.
      return new VisualDataFactory(componentKey);
    }]);
  };

  // Iterate over all defined visual mappings to create a directive for each chart type.
  // This ensures that all supported chart types get their corresponding Angular components.
  for (let componentAlias in visualMapping) {
    // It's good practice to check if the property belongs to the object itself,
    // not its prototype chain.
    if (Object.prototype.hasOwnProperty.call(visualMapping, componentAlias)) {
      establishVisualComponent(componentAlias);
    }
  }

  /**
   * Angular factory that generates directive definition objects for various Chart.js visualizations.
   * It encapsulates the logic for setting up a chart based on its type and provided data/options.
   * @returns {function(string): Object} A function that takes a chart type key and returns a directive definition.
   */
  graphicalView.factory('VisualDataFactory', function () {
    // Define some default global settings for the directive itself.
    const defaultDirectiveSettings = {
      restrict: 'EAC', // Can be used as an element, attribute, or class.
      // A more descriptive template with a div for the legend, wrapped in a container.
      template: `
        <div class="gv-chart-container">
          <canvas class="gv-canvas-area"></canvas>
          <div class="gv-legend-display"></div>
        </div>
      `, 
      scope: {
        inputData: '=',  // Two-way binding for the chart's dataset.
        userSettings: '=' // Two-way binding for chart configuration options.
      }
    };

    /**
     * Helper function to extract specific options from element attributes,
     * overriding default settings if present.
     * @param {Object} baseConfiguration - The base options object to merge into.
     * @param {Object} elementAttributes - The attributes object from the directive.
     * @returns {Object} An object containing extracted and merged options.
     */
    const pullConfigurationAttributes = function (baseConfiguration, elementAttributes) {
      const collectedSettings = {};
      // Iterate over the keys of the base configuration to find matching attributes.
      for (let settingKey in baseConfiguration) {
        // Ensure we only process own properties and check if the attribute exists.
        if (Object.prototype.hasOwnProperty.call(baseConfiguration, settingKey) && 
            Object.prototype.hasOwnProperty.call(elementAttributes, settingKey)) {
          // If the attribute is present, use its value.
          collectedSettings[settingKey] = elementAttributes[settingKey];
        }
      }
      return collectedSettings;
    };

    // The main factory function that gets called for each specific chart directive.
    return function (displayKind) {
      // Resolve the short display key to its full Chart.js type name.
      const chartJsTypeName = visualMapping[displayKind];

      // Perform an early exit if the chart type is not recognized or mapped.
      if (!chartJsTypeName) {
        console.error(`[${MODULE_NAME}] Unknown chart type key provided: "${displayKind}". Cannot create visualization.`);
        return null; // Return null to indicate failure to create the directive definition.
      }

      // Check if ChartJS global object is available.
      // Assuming 'Chart' is the global constructor name for Chart.js.
      if (typeof Chart === 'undefined') { 
        console.error(`[${MODULE_NAME}] Chart.js library not found. Please ensure it's loaded.`);
        return null; // Cannot proceed without the Chart.js library.
      }
      
      // Return the complete directive definition object, extending the defaults.
      return angular.extend({}, defaultDirectiveSettings, {
        link: function visualizationLinkFunction(modelScope, domElement, elementAttributes) {
          let activeVisualizationInstance = null; // Variable to hold the Chart.js instance.
          // Select the canvas and legend elements using querySelector for robustness.
          const chartCanvasElement = domElement[0].querySelector('.gv-canvas-area');
          const legendDisplayElement = domElement[0].querySelector('.gv-legend-display');

          // Ensure the canvas element exists before attempting to get context.
          if (!chartCanvasElement) {
            console.error(`[${MODULE_NAME}] Canvas element not found within directive template for "${displayKind}" chart.`);
            return;
          }

          // Get the 2D rendering context for the canvas.
          const renderContext = chartCanvasElement.getContext('2d');

          // If context is unavailable, log an error and exit.
          if (!renderContext) {
            console.error(`[${MODULE_NAME}] Failed to get 2D rendering context for canvas for "${displayKind}" chart.`);
            return;
          }

          // Function to safely destroy and re-create the chart instance.
          const refreshVisualization = function() {
            // Destroy any existing chart instance to prevent memory leaks and ensure fresh rendering.
            if (activeVisualizationInstance) {
              activeVisualizationInstance.destroy(); 
              activeVisualizationInstance = null;
            }

            let effectiveOptions = {}; // Object to hold all merged options.

            // Start with global Chart.js defaults, then type-specific defaults.
            // Using Object.assign for clarity in merging.
            Object.assign(
              effectiveOptions,
              Chart.defaults.global, // Using original Chart.defaults.global
              Chart.defaults[chartJsTypeName] // Using original Chart.defaults[chartType]
            );

            // Merge user-provided settings from the scope, giving them higher precedence.
            angular.extend(effectiveOptions, modelScope.userSettings);

            // Extract and merge specific options from directive attributes,
            // giving them highest precedence.
            const attributeOptions = pullConfigurationAttributes(effectiveOptions, elementAttributes);
            angular.extend(effectiveOptions, attributeOptions);

            try {
              // Instantiate the Chart.js visualization.
              // This uses the Chart.js 2+ constructor syntax.
              activeVisualizationInstance = new Chart(renderContext, {
                type: chartJsTypeName, // Use the full Chart.js type name here.
                data: modelScope.inputData,
                options: effectiveOptions
              });

              // Generate and display the legend if the element exists and the function is available.
              if (legendDisplayElement && typeof activeVisualizationInstance.generateLegend === 'function') {
                legendDisplayElement.innerHTML = activeVisualizationInstance.generateLegend();
              }
              console.info(`[${MODULE_NAME}] "${displayKind}" chart successfully rendered.`);

            } catch (error) {
              console.error(`[${MODULE_NAME}] Error creating "${displayKind}" chart of type "${chartJsTypeName}":`, error);
              activeVisualizationInstance = null; // Clear reference on error.
            }
          };

          // Initial setup and rendering of the visualization.
          refreshVisualization();

          // Watch for changes in the dataset.
          // When data changes, we update the chart data and re-render.
          modelScope.$watch('inputData', function (updatedDataModel, previousDataModel) {
            // Only update if data has actually changed, is not null/undefined, and a chart instance exists.
            if (updatedDataModel && updatedDataModel !== previousDataModel && activeVisualizationInstance) {
              // Update chart's data directly and call update.
              activeVisualizationInstance.data = updatedDataModel;
              activeVisualizationInstance.update();
              // Re-generate legend if data might affect it (e.g., labels).
              if (legendDisplayElement && typeof activeVisualizationInstance.generateLegend === 'function') {
                legendDisplayElement.innerHTML = activeVisualizationInstance.generateLegend();
              }
              console.info(`[${MODULE_NAME}] Data model updated for "${displayKind}" chart.`);
            }
          }, true); // Deep watch for changes within the data object.

          // Watch for changes in the user-defined options.
          // When options change, we merge them and update the chart.
          modelScope.$watch('userSettings', function (updatedSettings, previousSettings) {
            if (updatedSettings && updatedSettings !== previousSettings && activeVisualizationInstance) {
              // Merge updated settings into the chart's options.
              angular.extend(activeVisualizationInstance.options, updatedSettings);
              activeVisualizationInstance.update();
              console.info(`[${MODULE_NAME}] User settings updated for "${displayKind}" chart.`);
            }
          }, true); // Deep watch for changes within the options object.

          // Cleanup when the directive's scope is destroyed to prevent memory leaks.
          modelScope.$on('$destroy', function () {
            if (activeVisualizationInstance) {
              activeVisualizationInstance.destroy();
              activeVisualizationInstance = null; // Dereference the chart instance.
              console.log(`[${MODULE_NAME}] Chart instance for "${displayKind}" destroyed.`);
            }
          });
        }
      });
    };
  });

})(); // End of the immediately invoked function expression.