document.addEventListener('DOMContentLoaded', function () {

    // Visualization Display Manager
    const visualizationDisplayManager = {
        locateTargets: function(searchArea) {
            return searchArea.querySelectorAll('.shinyGoogleChart');
        },
        retrieveIdentifier: function(presenterElement) {
            return presenterElement.id;
        },
        presentVisual: function(presenterElement, payloadContent) {
            const onVisualizationAPIReady = function() {
                const columnDefinitions = JSON.parse(payloadContent.dataLabels);
                const tableContent = new google.visualization.DataTable();

                // Functional approach for adding columns
                Object.entries(columnDefinitions).forEach(([key, value]) => {
                    tableContent.addColumn(value, key);
                });

                tableContent.addRows(JSON.parse(payloadContent.dataJSON));

                const chartRenderer = new google.visualization.ChartWrapper({
                    dataTable: tableContent,
                    containerId: presenterElement.id,
                    chartType: payloadContent.chartType,
                    options: JSON.parse(payloadContent.options)
                });
                chartRenderer.draw();

                // Store chart instance using a WeakMap
                chartRegistry.set(presenterElement, chartRenderer);
            };

            // This external API call cannot be fundamentally changed, only its wrapper
            google.load("visualization", "1", {
                "callback": onVisualizationAPIReady,
                "packages": ["charteditor"]
            });
        },
        displayFailure: function(presenterElement, errorDetails) {
            // Implementation for error display (currently empty in original)
        },
        removeFailure: function(presenterElement) {
            // Implementation for clearing error (currently empty in original)
        }
    };
    Shiny.outputBindings.register(visualizationDisplayManager);

    // Chart Configuration Observer
    const chartConfigurationObserver = {
        locateTargets: function(searchArea) {
            return searchArea.querySelectorAll('.chartEditor');
        },
        fetchSettings: function(controlElement) {
            return {
                chartType: controlElement.getAttribute('chartType'),
                options: controlElement.getAttribute('options')
            };
        },
        applySettings: function(controlElement, newSettings) {
            // Implementation for setting values (currently empty in original)
        },
        activateListener: function(controlElement, notificationTrigger) {
            const changeProcessor = function(event) {
                notificationTrigger();
            };
            controlElement.addEventListener("change", changeProcessor);
            // Store handler to allow removal
            eventHandlerRegistry.set(controlElement, changeProcessor);
        },
        deactivateListener: function(controlElement) {
            const storedHandler = eventHandlerRegistry.get(controlElement);
            if (storedHandler) {
                controlElement.removeEventListener("change", storedHandler);
                eventHandlerRegistry.delete(controlElement);
            }
        }
    };
    Shiny.inputBindings.register(chartConfigurationObserver);

    // WeakMaps for private storage
    // These are used instead of jQuery's .data() or custom properties on DOM elements.
    const chartRegistry = new WeakMap();
    const eventHandlerRegistry = new WeakMap();

});