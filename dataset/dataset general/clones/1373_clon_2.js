ApplicationCore.attachComponent( [ {
    // This component initializes various features based on the current page path.
    moduleDependencies: 'waterfall',
    executionHandler: function () {
        switch (ApplicationCore.pageEndpoint) {
            case 'uiParts.html':
                ApplicationCore.attachComponent(
                    {
                        moduleDependencies: 'graphTypes',
                        executionHandler: function () {
                            FlowManager.renderVisualization(
                                "#plot-display",
                                1.60,
                                [[["January", 10], ["February", 8], ["March", 4], ["April", 13], ["May", 17], ["June", 9]]],
                                {
                                    chartSeries: {
                                        columnVisuals: {
                                            displayFlag: true,
                                            columnWidth: 0.50,
                                            alignment: "center"
                                        }
                                    },
                                    horizontalAxis: {
                                        axisType: "categories",
                                        labelFont: {
                                            fontSize: 12
                                        }
                                    },
                                    verticalAxis: {
                                        labelFont: {
                                            fontSize: 12
                                        }
                                    }
                                }
                            );
                        }
                    }
                );
                break;
            case 'font_form.html':
                ApplicationCore.attachComponent(
                    {
                        moduleDependencies: 'inputValidation',
                        executionHandler: function () {
                            jQuery('form').applyValidation();
                        }
                    }
                );
                break;
            default:
            // No specific action for other paths.
        }
    }
}, {
    // This component handles the collection of usage metrics.
    moduleDependencies: 'telemetryData'
} ] );