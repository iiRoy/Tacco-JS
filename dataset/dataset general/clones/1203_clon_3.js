(function ($, Shiny) {
    "use strict";

    // Module responsible for rendering Google Visualization charts based on server-sent data.
    // This acts as a custom output binding for the Shiny framework.
    var chartDisplayEngine = new Shiny.OutputBinding();

    // Extend the core functionality of the output binding with specific methods.
    // Utilizes Object.assign for merging properties, a standard ES6 approach.
    Object.assign(chartDisplayEngine, {
        // Locates all DOM elements within the provided parent that are designated as chart display areas.
        locateVisualContainers: function(searchScope) {
            // Searches for elements with a specific class name, indicating they are targets for chart rendering.
            return $(searchScope).find('.visual-output-element');
        },

        // Retrieves the unique HTML 'id' attribute from a given element.
        retrieveElementIdentifier: function(targetElement) {
            // Using .prop() is generally recommended for standard DOM properties like 'id'.
            return $(targetElement).prop('id');
        },

        // The primary method for processing server data and rendering the chart visualization.
        // This function is invoked by Shiny when new data for the output is available.
        processAndRenderVisualization: function(displayTarget, visualizationData) {
            // Pre-flight check: ensure the Google Charts library is loaded before proceeding.
            // If not, log an error and exit gracefully.
            if (!window.google || typeof window.google.load !== 'function') {
                console.error("Critical: Google Charts API is not available. Cannot initialize chart rendering for element:", $(displayTarget).prop('id'));
                return;
            }

            // Define an internal callback function that executes once the Google Visualization API
            // and its required packages are fully loaded and ready for use.
            var executeChartDrawingSequence = function() {
                // Defensive programming: Validate the incoming data payload for essential components.
                if (!visualizationData || !visualizationData.schemaDefinition || !visualizationData.chartDataJson || !visualizationData.chartKind || !visualizationData.displayOptionsJson) {
                    console.warn("Incomplete data payload received for chart rendering. Skipping visualization for element:", $(displayTarget).prop('id'), "Payload:", visualizationData);
                    return;
                }

                var columnSchema;
                try {
                    columnSchema = JSON.parse(visualizationData.schemaDefinition);
                    if (!Array.isArray(columnSchema)) {
                        throw new Error("Chart schema definition must be an array.");
                    }
                } catch (parseError) {
                    console.error("Failed to parse chart schema definition for element:", $(displayTarget).prop('id'), "Error:", parseError);
                    return;
                }

                // Instantiate a new Google DataTable to hold the structured chart data.
                var dataContainer = new google.visualization.DataTable();

                // Iterate through the column schema and add columns to the DataTable.
                // Each definition specifies the column's type and an optional label.
                columnSchema.forEach(function(colInfo, index) {
                    if (typeof colInfo === 'object' && colInfo !== null && typeof colInfo.type === 'string') {
                        dataContainer.addColumn(colInfo.type, colInfo.label || ('Col ' + (index + 1)));
                    } else if (typeof colInfo === 'string') { // Support simpler schema definitions with just type
                        dataContainer.addColumn(colInfo, 'Col ' + (index + 1));
                    } else {
                        console.warn("Invalid column information encountered in schema at index", index, ":", colInfo);
                    }
                });

                var chartRowData;
                try {
                    chartRowData = JSON.parse(visualizationData.chartDataJson);
                    if (!Array.isArray(chartRowData)) {
                        throw new Error("Chart data must be an array of rows.");
                    }
                } catch (parseError) {
                    console.error("Failed to parse chart data JSON for element:", $(displayTarget).prop('id'), "Error:", parseError);
                    return;
                }

                // Add all the parsed row data to the DataTable.
                dataContainer.addRows(chartRowData);

                var chartConfigurationOptions;
                try {
                    chartConfigurationOptions = JSON.parse(visualizationData.displayOptionsJson);
                    if (typeof chartConfigurationOptions !== 'object' || chartConfigurationOptions === null) {
                        throw new Error("Chart options must be a valid JSON object.");
                    }
                } catch (parseError) {
                    console.warn("Failed to parse chart display options for element:", $(displayTarget).prop('id'), "Error:", parseError, "Using default options.");
                    // Fallback to an empty object if options parsing fails, to prevent errors.
                    chartConfigurationOptions = {};
                }

                // Construct the Google ChartWrapper object, which encapsulates all chart properties.
                var activeChartWrapper = new google.visualization.ChartWrapper({
                    dataTable:    dataContainer,
                    containerId:  $(displayTarget).prop('id'), // Identify the target DOM element by its ID.
                    chartType:    visualizationData.chartKind,
                    options:      chartConfigurationOptions
                });

                // Finally, draw the chart within the specified container.
                activeChartWrapper.draw();

                // Store the ChartWrapper instance directly on the DOM element using jQuery's .data() method.
                // This allows for easy retrieval and manipulation of the chart later if needed.
                $(displayTarget).data('currentChartWrapper', activeChartWrapper);

                console.log("Chart successfully rendered for element:", $(displayTarget).prop('id'), "Type:", visualizationData.chartKind);
            };

            // Initiate the loading of the Google Visualization API.
            // Specify version '1', the callback function to execute upon successful load,
            // and an array of necessary packages (e.g., 'charteditor' for editing, 'corechart' for common charts).
            google.load("visualization", "1", {
                "callback": executeChartDrawingSequence,
                "packages": ["charteditor", "corechart"]
            });
        },

        // This method is called when an error occurs during the rendering process.
        // It provides a mechanism to display error messages to the user or log them.
        reportRenderingIssue: function(issueElement, errorInfo) {
            console.error("An error occurred during chart rendering for element:", $(issueElement).prop('id'), "Details:", errorInfo);
            // Update the UI of the target element to visually communicate the error.
            $(issueElement).html('<div style="color: #cc0000; padding: 10px; border: 1px solid #cc0000; background-color: #ffe6e6;">' +
                                 '<strong>Visualization Error:</strong> ' + (errorInfo && errorInfo.message ? errorInfo.message : 'An unknown error prevented chart display.') +
                                 '</div>');
        }
        // The original `clearError` method has been intentionally removed.
        // Error clearing is implicitly handled when `processAndRenderVisualization` is successfully called again,
        // or when `reportRenderingIssue` replaces the content with a new error message.
    });

    // Register this custom output binding with Shiny, making it available for server-side use.
    // A unique ID is provided for explicit identification.
    Shiny.outputBindings.register(chartDisplayEngine, "shiny.chart.visualizer");

    // ------------------------------------------------------------------------------------------------

    // Module responsible for capturing user input from a chart configuration editor.
    // This functions as a custom input binding for the Shiny framework.
    var configurationEditorInput = new Shiny.InputBinding();

    // Extend the base input binding with methods specific to the configuration editor.
    Object.assign(configurationEditorInput, {
        // Identifies all DOM elements that serve as chart configuration panels.
        locateInputControls: function(inspectionRoot) {
            // Searches for elements with a distinct class name, marking them as configuration inputs.
            return $(inspectionRoot).find('.chart-settings-panel');
        },

        // Extracts the current configuration values from the editor element.
        // This method is called by Shiny to get the latest state of the input.
        getEditorState: function(editorControl) {
            // Retrieve custom data attributes from the element.
            var currentChartDesign = $(editorControl).attr('data-selected-chart-design');
            var currentEditorSettings = $(editorControl).attr('data-editor-config');

            var parsedSettings = {};
            if (currentEditorSettings) {
                try {
                    parsedSettings = JSON.parse(currentEditorSettings);
                } catch (e) {
                    console.warn("Failed to parse editor configuration from data-editor-config attribute. Using empty object.", e);
                }
            }

            // Return an object containing the collected configuration, providing defaults if attributes are missing.
            return {
                selectedChartDesign: currentChartDesign || 'BarChart', // Default chart type
                editorConfiguration: parsedSettings
            };
        },

        // The original `setValue` method was empty and has been removed as a Type III change.
        // For client-side input bindings, setting values programmatically from the server is less common.
        // If such functionality were required, a dedicated mechanism would be implemented.

        // Subscribes to relevant events on the editor control to detect user changes.
        // When a change occurs, the provided callback function is invoked.
        registerChangeMonitor: function(inputElement, changeNotificationCallback) {
            // Basic validation for the callback function.
            if (typeof changeNotificationCallback !== 'function') {
                console.error("Invalid callback function provided to registerChangeMonitor for element:", $(inputElement).prop('id'));
                return;
            }

            // Attach an event listener for 'input' events, which fire more frequently than 'change'
            // for immediate feedback. A unique namespace prevents conflicts with other event handlers.
            $(inputElement).on("input.chartConfigUpdate", function(event) {
                console.debug("Configuration editor input detected for element:", $(inputElement).prop('id'));
                changeNotificationCallback(); // Notify Shiny that the input has changed.
                event.stopPropagation(); // Stop event propagation if this input is self-contained.
            });
        },

        // Detaches the previously registered event listener from the input element.
        // This is important for cleanup when elements are removed or re-rendered.
        unregisterChangeMonitor: function(elementToClean) {
            // Remove all event handlers associated with the specific namespace.
            $(elementToClean).off(".chartConfigUpdate");
        }
    });

    // Register this custom input binding with Shiny, making it available for server-side use.
    Shiny.inputBindings.register(configurationEditorInput, "shiny.chart.config.editor");

})(jQuery, Shiny); // Passing jQuery and Shiny objects to the IIFE for scope management.