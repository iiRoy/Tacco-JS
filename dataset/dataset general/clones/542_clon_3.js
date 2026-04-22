// This script facilitates the dynamic visualization of climate-related metrics.
// It operates by fetching structured data from designated, initially concealed,
// HTML tables and then employing a custom graphing library to render various
// chart types on predefined canvas elements across the webpage.

jQuery(document).ready(function() {

    // --- Data Acquisition and Processing Module ---
    // Initialize storage arrays for different environmental parameters and their associated temporal markers.
    let historicalObservationLabels = []; // Stores labels like months or periods for temperature data.
    let recordedPositiveTemperatures = []; // Collection of positive temperature readings.
    let recordedNegativeTemperatures = []; // Collection of negative temperature readings (e.g., minimums or anomalies).

    // A utility function designed to safely extract text content from a jQuery element collection,
    // convert it to a floating-point number, and append it to a target array.
    // Includes basic validation and logging for robust data processing.
    const retrieveAndValidateNumericValues = (elementSelector, destinationArray, contextElement = document) => {
        const targetElements = jQuery(elementSelector, contextElement);
        if (targetElements.length === 0) {
            console.warn(`[Data Extraction] No DOM elements matched selector: "${elementSelector}" within the given context. Skipping data extraction.`);
            return false; // Indicate that no data was processed for this selector.
        }

        let successfulParses = 0;
        targetElements.each(function() {
            const rawTextValue = jQuery(this).text().trim();
            const numericValue = parseFloat(rawTextValue);

            // Basic validation: ensure the parsed value is a valid number.
            if (!isNaN(numericValue)) {
                destinationArray.push(numericValue);
                successfulParses++;
            } else {
                console.warn(`[Data Parsing Error] Unable to convert "${rawTextValue}" to a number from element:`, this);
            }
        });
        if (successfulParses === 0 && targetElements.length > 0) {
            console.error(`[Data Extraction Failure] Despite finding elements, no valid numeric data was parsed for selector: "${elementSelector}".`);
            return false;
        }
        return true; // Indicate successful processing of some data.
    };

    // Reference to the temperature data source table.
    const temperatureDataSource = jQuery("#temp-data");
    if (temperatureDataSource.length > 0) {
        // Extract temporal labels from the table's footer for temperature graphs.
        temperatureDataSource.find("tfoot th").each(function() {
            const labelContent = jQuery(this).text().trim();
            if (labelContent) {
                historicalObservationLabels.push(labelContent);
            }
        });

        // Populate arrays with actual temperature figures using the helper.
        retrieveAndValidateNumericValues("tbody td.pos", recordedPositiveTemperatures, temperatureDataSource);
        retrieveAndValidateNumericValues("tbody td.neg", recordedNegativeTemperatures, temperatureDataSource);
        console.info(`[Data Load] Temperature data processed. Labels: ${historicalObservationLabels.length}, Positives: ${recordedPositiveTemperatures.length}, Negatives: ${recordedNegativeTemperatures.length}.`);
    } else {
        console.error("[Initialization Error] Temperature data table (#temp-data) not found on the page. Temperature visualizations will be unavailable.");
    }


    let precipitationPeriodMarkers = []; // Labels for rainfall data.
    let aggregatedRainfallMeasurements = []; // Numerical rainfall figures.

    // Reference to the rainfall data source table.
    const rainfallDataSource = jQuery("#rain-data");
    if (rainfallDataSource.length > 0) {
        // Extract temporal labels for rainfall graphs, similar to temperature.
        rainfallDataSource.find("tfoot th").each(function() {
            const markerText = jQuery(this).text().trim();
            if (markerText) {
                precipitationPeriodMarkers.push(markerText);
            }
        });

        // Populate rainfall data array.
        retrieveAndValidateNumericValues("tbody td", aggregatedRainfallMeasurements, rainfallDataSource);
        console.info(`[Data Load] Rainfall data processed. Labels: ${precipitationPeriodMarkers.length}, Measurements: ${aggregatedRainfallMeasurements.length}.`);
    } else {
        console.error("[Initialization Error] Rainfall data table (#rain-data) not found on the page. Rainfall visualizations will be unavailable.");
    }


    // --- User Interface Adjustment Phase ---
    // Hide the original data tables from view as their content has been extracted.
    // Using `css('display', 'none')` for explicit style manipulation.
    rainfallDataSource.css("display", "none");
    temperatureDataSource.css("display", "none");
    console.log("[UI Update] Source data tables have been hidden from the display.");


    // --- Chart Rendering and Configuration Phase ---
    // Standard configuration object for some shared graphing properties.
    const baseGraphConfig = {
        drawPoints: true, // Generally show data points on lines.
        leftGutter: 50    // Default spacing on the left for Y-axis.
    };

    // Chart 1: Unadorned Temperature Plot
    const basicTemperatureChartElement = jQuery("#simplest_graph_holder");
    if (basicTemperatureChartElement.length > 0 && recordedPositiveTemperatures.length > 0) {
        basicTemperatureChartElement.simplegraph(recordedPositiveTemperatures, historicalObservationLabels);
        console.log("[Chart Rendered] Basic temperature line graph initialized.");
    } else {
        console.warn("[Chart Skip] Basic temperature graph not rendered. Target element or data missing.");
    }

    // Chart 2: Stylized Temperature Graph with Specific Visuals
    const enhancedTemperatureChartElement = jQuery("#temp_graph_holder");
    if (enhancedTemperatureChartElement.length > 0 && recordedPositiveTemperatures.length > 0) {
        const temperatureVisualSettings = {
            penColor: "#FF0000", // Bright red for heat.
            fillUnderLine: true, // Shade the area beneath the line.
            units: "°C", // Units for the Y-axis.
            minYAxisValue: 25, // Lower bound of the Y-axis for better focus.
            drawPoints: true,
            ...baseGraphConfig // Merge with base settings, specific settings override.
        };
        enhancedTemperatureChartElement.simplegraph(recordedPositiveTemperatures, historicalObservationLabels, temperatureVisualSettings);
        console.log("[Chart Rendered] Enhanced temperature graph with custom styling initialized.");
    } else {
        console.warn("[Chart Skip] Enhanced temperature graph not rendered. Target element or data missing.");
    }

    // Chart 3: Rainfall Accumulation Plot
    const precipitationChartElement = jQuery("#rain_graph_holder");
    if (precipitationChartElement.length > 0 && aggregatedRainfallMeasurements.length > 0) {
        const rainfallVisualSettings = {
            penColor: "#0000FF", // Deep blue for water.
            units: "mm", // Millimeters for rainfall.
            leftGutter: 65, // Slightly wider gutter for this graph's caption.
            minYAxisValue: 5, // Y-axis starts lower to show smaller rainfall.
            yAxisCaption: "Total Precipitation", // Clear Y-axis description.
            yAxisLabelFont: "Arial, sans-serif", // Custom font for axis labels.
            ...baseGraphConfig
        };
        precipitationChartElement.simplegraph(aggregatedRainfallMeasurements, precipitationPeriodMarkers, rainfallVisualSettings);
        console.log("[Chart Rendered] Precipitation graph with custom caption initialized.");
    } else {
        console.warn("[Chart Skip] Precipitation graph not rendered. Target element or data missing.");
    }

    // Chart 4: Dual-Axis Combined Climate Data Visualization
    const dualAxisClimateChartElement = jQuery("#combined_graph_holder");
    if (dualAxisClimateChartElement.length > 0 && recordedNegativeTemperatures.length > 0 && aggregatedRainfallMeasurements.length > 0) {
        const primarySeriesOptions = {
            penColor: "#D00000", // Darker red for main temperature series.
            leftGutter: 95, // Extra wide gutter for two Y-axes.
            units: "°C",
            minYAxisValue: 5,
            yAxisCaption: "Min Temperature",
            lowerBound: -15, // Explicit lower bound for negative temperatures.
            drawPoints: true
        };
        const secondarySeriesOptions = {
            penColor: "#0000CC", // Darker blue for secondary rainfall series.
            units: "mm",
            minYAxisValue: 5,
            yAxisCaption: "Avg Rainfall",
            lowerBound: 0
        };

        // Chaining the `simplegraph` and `simplegraph_more` calls for dual-axis plotting.
        dualAxisClimateChartElement
            .simplegraph(recordedNegativeTemperatures, historicalObservationLabels, primarySeriesOptions)
            .simplegraph_more(aggregatedRainfallMeasurements, secondarySeriesOptions);
        console.log("[Chart Rendered] Combined dual-axis temperature and rainfall graph initialized.");
    } else {
        console.warn("[Chart Skip] Combined dual-axis graph not rendered. Target element(s) or data missing.");
    }

    // Chart 5: Bar Chart Representation of Temperature Data
    const temperatureBarChartElement = jQuery("#bar_graph_holder");
    if (temperatureBarChartElement.length > 0 && recordedPositiveTemperatures.length > 0) {
        const barChartSpecifics = {
            penColor: "#CC3333", // A more muted red for bars.
            units: "°C",
            minYAxisValue: 20, // Y-axis starts lower for bar chart context.
            drawBars: true, // Crucial setting to render bars.
            drawLine: false, // Disable line graph component.
            drawPoints: false, // Disable individual points.
            drawGrid: false, // Optionally remove grid lines for a cleaner bar look.
            barWidth: 25 // Width of each bar in pixels.
        };
        temperatureBarChartElement.simplegraph(recordedPositiveTemperatures, historicalObservationLabels, barChartSpecifics);
        console.log("[Chart Rendered] Bar chart for temperature data initialized.");
    } else {
        console.warn("[Chart Skip] Bar chart for temperature not rendered. Target element or data missing.");
    }

    console.info("All climate data visualization components have been processed and initialized.");

});