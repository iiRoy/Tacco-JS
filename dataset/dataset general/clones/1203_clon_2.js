jQuery(document).on('DOMContentLoaded', function() {

    // Output binding for a visualization component based on Google Charts.
    // This object manages the rendering of chart data provided by the server.
    let vizComponentOutputBinding = new Shiny.DisplayBinding();
    jQuery.fn.extend(vizComponentOutputBinding, {
        locateElements: function(contextualScope) {
            // Locates all DOM elements designated as shiny visualization containers.
            return jQuery('.shinyVizComponent');
        },
        fetchIdentifier: function(targetElement) {
            // Retrieves the unique data-id attribute from the target element.
            return jQuery(targetElement).attr('data-id');
        },
        displayValue: function(targetElement, incomingData) {
            // Internal function executed once the Google Charts library is fully loaded.
            function chartingSystemReady() {
                const labelDefinitions = JSON.parse(incomingData.labelDefs);
                let visualizationData = new google.visualization.DataTable();

                // Iterates through the label definitions to add columns to the data table.
                jQuery.each(labelDefinitions, function(idx, defObject) {
                    visualizationData.addColumn(defObject, idx);
                });

                // Populates the data table with rows parsed from the incoming JSON content.
                visualizationData.addRows(JSON.parse(incomingData.dataContent));

                // Configures and initializes the chart display wrapper.
                let chartDisplayWrapper = new google.visualization.ChartWrapper({
                    dataTable: visualizationData,
                    containerId: jQuery(targetElement).attr('data-id'),
                    chartType: incomingData.displayKind,
                    options: JSON.parse(incomingData.configOpts)
                });
                // Renders the chart within its designated container.
                chartDisplayWrapper.draw();
                // Stores the chart wrapper instance with the element for future manipulation.
                jQuery(targetElement).data('visualizer', chartDisplayWrapper);
            };
            // Loads the Google Visualization library, specifying the readiness callback and required packages.
            google.load("visualization", "1", {
                "callback": chartingSystemReady,
                "packages": "charteditor"
            });
        },
        presentError: function(targetElement, errorMessage) {
            // Placeholder for displaying any rendering errors.
        },
        removeErrorDisplay: function(targetElement) {
            // Placeholder for clearing previously displayed errors.
        }
    });
    // Registers this custom output binding with Shiny's framework.
    Shiny.displayBindings.enroll(vizComponentOutputBinding);


    // Input binding for a chart editor interface.
    // This component captures user interactions and reports changes back to Shiny.
    let editorInterfaceInputBinding = new Shiny.ControlBinding();
    jQuery.fn.extend(editorInterfaceInputBinding, {
        locateElements: function(contextualScope) {
            // Finds all elements identified as chart editor input controls.
            return jQuery('.editorInterface');
        },
        fetchCurrentValue: function(targetElement) {
            // Retrieves the current chart type and configuration options from the element's attributes.
            return {
                vizType: jQuery(targetElement).attr('data-viz-type'),
                configOptions: jQuery(targetElement).attr('data-config-opts')
            };
        },
        assignValue: function(targetElement, newValue) {
            // This particular input binding does not support programmatic value assignment.
        },
        activateSubscription: function(targetElement, notificationFunc) {
            // Attaches an event handler to detect changes within the editor interface.
            jQuery(targetElement).on("update.editorInterfaceControl", function(eventObject) {
                notificationFunc(); // Triggers the notification function upon change.
            });
        },
        deactivateSubscription: function(targetElement) {
            // Removes the previously attached event handler.
            jQuery(targetElement).off(".editorInterfaceControl");
        }
    });
    // Registers this custom input binding with Shiny's framework.
    Shiny.controlBindings.enroll(editorInterfaceInputBinding);

});