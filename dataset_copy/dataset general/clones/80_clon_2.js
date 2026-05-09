(function (jq) {
    "use strict";

    var config = {}; // Global configuration object for the plugin

    // Helper to calculate the largest multiple of a divisor that is less than or equal to a given value.
    function roundDownToMultiple(value, divisor) {
        return divisor * Math.floor(value / divisor);
    }

    function initializePlugin(chart) {
        chart.events.dataProcessing.push(function (chartInstance) {
            jq.each(chartInstance.getDimensions(), function(dimensionIdentifier, dimension) {
                var settings = dimension.params;
                if (settings.unitType === "dataUnit" || settings.unitType === "dataRate") {

                    dimension.labelGenerator = function (currentDimension) {
                        var generatedLabels = [],
                            labelInterval = 2,
                            span = currentDimension.range,
                            exponentCount = 0,
                            startLabel = 0,
                            currentLabelValue,
                            labelIndex = 0;

                        // Flag the dimension if it represents a rate for subsequent formatting.
                        if (settings.unitType === "dataRate") {
                            currentDimension.isRateMeasurement = true;
                        }

                        // Determine the number of decimal places for labels.
                        if (typeof settings.labelPrecision === "number") {
                            currentDimension.labelPrecision = settings.labelPrecision;
                        } else {
                            currentDimension.labelPrecision = 2;
                        }

                        // Calculate the power-of-1024 exponent for scaling.
                        while (Math.abs(span) >= 1024) {
                            exponentCount++;
                            span /= 1024;
                        }

                        // Determine a suitable label interval based on the scaled range.
                        while (labelInterval <= 1024) {
                            if (span <= labelInterval) {
                                break;
                            }
                            labelInterval *= 2;
                        }

                        // Assign the determined label interval to the dimension, respecting a minimum if set.
                        if (typeof settings.minimumLabelInterval !== "undefined" && labelInterval < settings.minimumLabelInterval) {
                            currentDimension.labelInterval = settings.minimumLabelInterval;
                        } else {
                            currentDimension.labelInterval = labelInterval * Math.pow(1024, exponentCount);
                        }

                        // Generate the actual label values for the dimension.
                        startLabel = roundDownToMultiple(currentDimension.minimum, currentDimension.labelInterval);
                        do {
                            currentLabelValue = startLabel + (labelIndex++) * currentDimension.labelInterval;
                            generatedLabels.push(currentLabelValue);
                        } while (currentLabelValue < currentDimension.maximum);

                        return generatedLabels;
                    };

                    dimension.labelFormatter = function(magnitude, currentDimension) {
                        var unitSuffix, exponentCount = 0;

                        while (Math.abs(magnitude) >= 1024) {
                            exponentCount++;
                            magnitude /= 1024;
                        }

                        switch (exponentCount) {
                            case 0:  unitSuffix = " Bytes";     break;
                            case 1:  unitSuffix = " KiloBytes"; break;
                            case 2:  unitSuffix = " MegaBytes"; break;
                            case 3:  unitSuffix = " GigaBytes"; break;
                            case 4:  unitSuffix = " TeraBytes"; break;
                            case 5:  unitSuffix = " PetaBytes"; break;
                            case 6:  unitSuffix = " ExaBytes";  break;
                            case 7:  unitSuffix = " ZettaBytes";break;
                            case 8:  unitSuffix = " YottaBytes";break;
                        }

                        if (typeof currentDimension.isRateMeasurement !== "undefined") {
                            unitSuffix += " perSecond";
                        }

                        return (magnitude.toFixed(currentDimension.labelPrecision) + unitSuffix);
                    };
                }
            });
        });
    }

    jq.chartRenderer.plugins.add({
        initialize: initializePlugin,
        configuration: config,
        pluginName: "dataUnitPlugin",
        pluginVersion: "1.0"
    });
})(DomManipulator);