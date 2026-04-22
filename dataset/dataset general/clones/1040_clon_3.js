const APPLICATION_CONFIG = {
    MAP_TARGET_ID: "map",
    BASE_LAYER_IDENTIFIER: "Base Map Imagery",
    OVERLAY_LAYER_IDENTIFIER: "Spatial Data Heatmap",
    DATA_SOURCE_PATH: "data.geojson",
    // Configuration for heatmap point rendering
    HEATMAP_POINT_RADIUS: 20,
    DURATION_NORMALIZATION_FACTOR: 43200, // Denominator for feature duration (e.g., 12 hours in seconds)
    MINIMUM_VISUAL_INTENSITY: 0.25,      // Floor for calculated heatmap intensity
    MAXIMUM_VISUAL_INTENSITY: 1.0       // Ceiling for calculated heatmap intensity
};

/**
 * Creates and returns a configured GeoJSON format parser.
 * @returns {OpenLayers.Format.GeoJSON} A GeoJSON format instance.
 */
function createDataParserInstance() {
    return new OpenLayers.Format.GeoJSON({
        // Optional: Preserve raw data after parsing, useful for debugging or re-processing.
        keepData: false
    });
}

/**
 * Calculates the visual intensity for a given feature, used in heatmap rendering.
 * @param {OpenLayers.Feature.Vector} inputFeature - The geographic feature object.
 * @returns {number} A normalized intensity value between MINIMUM_VISUAL_INTENSITY and MAXIMUM_VISUAL_INTENSITY.
 */
const determineFeatureDisplayWeight = function(inputFeature) {
    let featureDurationValue = inputFeature.attributes ? inputFeature.attributes.duration : 0;

    // Validate and sanitize the duration attribute.
    if (typeof featureDurationValue !== 'number' || isNaN(featureDurationValue) || featureDurationValue < 0) {
        featureDurationValue = 0; // Default to zero if invalid or missing.
        console.warn(`Invalid or missing 'duration' attribute for feature ID: ${inputFeature.id || 'unknown'}. Defaulting to 0.`);
    }

    // Normalize the duration against a predefined maximum value.
    const normalizedContribution = featureDurationValue / APPLICATION_CONFIG.DURATION_NORMALIZATION_FACTOR;

    // Apply lower and upper bounds to the calculated intensity.
    let finalIntensity = Math.max(normalizedContribution, APPLICATION_CONFIG.MINIMUM_VISUAL_INTENSITY);
    finalIntensity = Math.min(finalIntensity, APPLICATION_CONFIG.MAXIMUM_VISUAL_INTENSITY);

    return finalIntensity;
};

// --- Initializing Geographic Layers ---

// Define the foundational base layer (OpenStreetMap tiles).
// This provides the underlying map context for the data visualization.
const primaryBaseLayer = new OpenLayers.Layer.OSM(APPLICATION_CONFIG.BASE_LAYER_IDENTIFIER, {
    // Enable this layer to be controlled by a layer switcher UI component.
    displayInLayerSwitcher: true,
    // Set an initial opacity for the base map.
    opacity: 0.85
});

// Configure the data communication protocol for fetching vector data.
// This specifies how to retrieve the GeoJSON data from the server.
const dataRetrievalProtocol = new OpenLayers.Protocol.HTTP({
    url: APPLICATION_CONFIG.DATA_SOURCE_PATH,
    format: createDataParserInstance()
});

// Define the visual styling rules for how data points are rendered as a heatmap.
// This includes dynamic calculation of each point's contribution to the heatmap intensity.
const heatmapPresentationStyles = new OpenLayers.StyleMap({
    // The 'default' rule applies to all features unless overridden.
    "default": new OpenLayers.Style({
        pointRadius: APPLICATION_CONFIG.HEATMAP_POINT_RADIUS,
        // The 'weight' property is dynamically determined by the feature's attributes.
        weight: "${computedWeight}"
    }, {
        // The context object provides functions that compute dynamic style properties.
        context: {
            computedWeight: determineFeatureDisplayWeight
        }
    })
});

// Define the data loading strategy for the vector layer.
// 'Fixed' means data is loaded once upon initialization and not re-fetched on map movements.
const dataLoadingPolicy = [new OpenLayers.Strategy.Fixed()];

// Define an object containing handlers for specific layer events.
const layerInteractionHandlers = {
    // Handler executed when new features have been successfully added to the layer.
    onDataFeaturesLoaded: function(eventContext) { // Renamed 'featuresadded' to 'onDataFeaturesLoaded'
        // Ensure the map instance is available before attempting to zoom.
        if (!this.map) {
            console.error("Map reference is null; cannot zoom to extent.");
            return;
        }

        // Calculate the bounding box that encompasses all features in the layer.
        const featureExtent = this.getDataExtent();

        // Only attempt to zoom if a valid extent was calculated.
        if (featureExtent && !featureExtent.empty()) {
            this.map.zoomToExtent(featureExtent);
            console.info("Map zoomed to the extent of newly loaded features.");
        } else {
            console.warn("No valid feature extent found to zoom to after data load.");
        }
    }
};

// Construct the primary data overlay layer, configured for heatmap visualization.
const dataOverlayHeatmapLayer = new OpenLayers.Layer.Vector(APPLICATION_CONFIG.OVERLAY_LAYER_IDENTIFIER, {
    // Explicitly specify the heatmap renderer.
    renderers: ['Heatmap'],
    protocol: dataRetrievalProtocol,
    styleMap: heatmapPresentationStyles,
    strategies: dataLoadingPolicy,
    eventListeners: {
        // Map the internal event name to our custom handler.
        featuresadded: layerInteractionHandlers.onDataFeaturesLoaded
    },
    // Additional non-essential display properties.
    isBaseLayer: false, // Explicitly declare this as an overlay.
    displayInLayerSwitcher: true,
    minScale: 1000000 // Only display heatmap when zoomed in past a certain scale.
});

// --- Main Map Initialization ---

// Pre-check: Verify the existence of the HTML element designated for the map.
const mapContainerElement = document.getElementById(APPLICATION_CONFIG.MAP_TARGET_ID);
if (!mapContainerElement) {
    console.error(`ERROR: HTML element with ID '${APPLICATION_CONFIG.MAP_TARGET_ID}' not found. Map cannot be initialized.`);
    // In a production scenario, you might throw an error or gracefully exit here.
    // For this example, we'll continue, but the map won't render.
}

// Initialize the main OpenLayers map instance.
// This brings together all layers and controls into an interactive viewer.
const mainGeographicViewer = new OpenLayers.Map(APPLICATION_CONFIG.MAP_TARGET_ID, {
    // Define an initial center and zoom level for the map.
    // These values may be overridden once data is loaded and the map zooms to features.
    center: new OpenLayers.LonLat(0, 0),
    zoom: 2,
    numZoomLevels: 20, // Provide a wider range of zoom levels.

    // Assign the defined layers to the map.
    layers: [primaryBaseLayer, dataOverlayHeatmapLayer],

    // Add a set of standard map controls for user interaction.
    controls: [
        new OpenLayers.Control.Navigation(),  // Enables panning and zooming with mouse.
        new OpenLayers.Control.Attribution(), // Displays layer attributions.
        new OpenLayers.Control.Zoom(),        // Zoom in/out buttons.
        new OpenLayers.Control.ScaleLine()    // Displays a scale line.
    ]
});

// Post-initialization setup: Add a layer switcher control.
// This allows users to toggle visibility of different layers.
mainGeographicViewer.addControl(new OpenLayers.Control.LayerSwitcher({
    div: document.createElement('div') // Create a temporary div for the control if not explicitly placed.
}));

console.log("Geographic viewer initialized with base and heatmap layers. Awaiting data load.");