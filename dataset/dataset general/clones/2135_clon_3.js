const mapCore = org.polymaps; // Establish a concise alias for the Polymaps library namespace.

// Define a set of constants to enhance readability and maintainability.
const DATA_CATEGORY_QUANTITY = 9; // The desired number of data categories (e.g., noniles).
const INVALID_COUNTY_SUFFIX = "000"; // Specific suffix indicating a non-standard or aggregated county entry.
const COUNTY_ID_DATA_OFFSET = 7; // Starting index for extracting the core county ID from feature data.
const SUFFIX_VALIDATION_OFFSET = 9; // Starting index for checking the invalid county suffix.
const QUANTILE_SCALE_MIN = 0; // The lowest value in the output range of the quantile scale.
const QUANTILE_SCALE_MAX = DATA_CATEGORY_QUANTITY - 1; // The highest value in the output range.
const FEATURE_STYLE_PREFIX = "q"; // Prefix for CSS classes applied to map features.
const DEFAULT_VISUAL_THEME = "Blues"; // Default CSS class for the map's overall color scheme.

// Internal configuration object for map initialization parameters.
const displaySettings = {
    startLatitude: 39,
    startLongitude: -96,
    initialZoomLevel: 4,
    minimumDisplayZoom: 3,
    maximumDisplayZoom: 7,
    containerDomId: "map" // The ID of the HTML element designated for map rendering.
};

/**
 * Utility function to retrieve a DOM element by its ID, providing error handling.
 * @param {string} idString - The ID of the HTML element to retrieve.
 * @returns {HTMLElement} The found element, or a console error and a dummy element if not found.
 */
function obtainDomElement(idString) {
    const identifiedElement = document.getElementById(idString);
    if (!identifiedElement) {
        console.error(`DOM acquisition failure: Element with ID '${idString}' not present.`);
        // Returning a dummy element to prevent immediate script termination,
        // though subsequent operations on it will likely fail.
        return document.createElement('div');
    }
    return identifiedElement;
}

/**
 * Constructs the full URL for Cloudmade map tiles, embedding necessary API keys and parameters.
 * @param {string} subdomainPlaceholder - Placeholder for the tile server subdomain (e.g., "{S}").
 * @returns {string} The complete URL pattern for tile retrieval.
 */
function generateTileServiceUrl(subdomainPlaceholder) {
    const cloudmadeServiceKey = "1a1b06b230af4efdbb989ea99e9841af"; // Cloudmade developer API key.
    const tileSchemaId = "20760"; // Identifier for the specific tile set (e.g., road network).
    const standardTileSize = "256"; // Pixel dimension for individual map tiles.
    return `${subdomainPlaceholder}tile.cloudmade.com/${cloudmadeServiceKey}/${tileSchemaId}/${standardTileSize}/{Z}/{X}/{Y}.png`;
}

// Initialize a statistical data categorizer using Protovis's quantile scale.
// This component partitions a dataset into 'DATA_CATEGORY_QUANTITY' equal-sized bins.
const dataClassifier = pv.Scale.quantile()
    .quantiles(DATA_CATEGORY_QUANTITY)
    // The input domain is derived from the numerical values within the global 'unemployment' object.
    // 'unemployment' is assumed to be a pre-loaded global data structure.
    .domain(pv.values(unemployment))
    // The output range is mapped to integer indices, from 0 up to (DATA_CATEGORY_QUANTITY - 1).
    .range(QUANTILE_SCALE_MIN, QUANTILE_SCALE_MAX);

// Instantiate the primary geographical visualization component.
let geographicalViewer = mapCore.map();

// Prepare the HTML container for the map.
const mapContainerTarget = obtainDomElement(displaySettings.containerDomId);
const mapSvgRoot = mapCore.svg("svg"); // Create the root SVG element for Polymaps.

// Safely append the SVG root to the designated HTML container.
if (mapContainerTarget && mapSvgRoot) {
    mapContainerTarget.appendChild(mapSvgRoot);
    geographicalViewer.container(mapSvgRoot); // Link the Polymaps instance to the SVG element.
} else {
    console.error("Critical: Map container or SVG root could not be prepared. Aborting map rendering.");
    // In a production scenario, more robust error handling or a fallback UI would be implemented.
}

// Configure the initial view and interactive capabilities of the map.
geographicalViewer
    .center({latitude: displaySettings.startLatitude, longitude: displaySettings.startLongitude})
    .zoom(displaySettings.initialZoomLevel)
    .zoomRange([displaySettings.minimumDisplayZoom, displaySettings.maximumDisplayZoom])
    // Integrate user interaction functionalities like panning and zooming.
    .add(mapCore.interact());

// Incorporate the foundational imagery layer (base map tiles).
const baseMapLayer = mapCore.image();
const tileUrlPattern = mapCore.url(generateTileServiceUrl("{S}"));
tileUrlPattern.hosts(["a.", "b.", "c.", ""]); // Define available subdomains for tile requests.
baseMapLayer.url(tileUrlPattern);
geographicalViewer.add(baseMapLayer);

// Add a vector data layer for county boundaries.
const countyDataOverlay = mapCore.geoJson()
    .url("http://polymaps.appspot.com/county/{Z}/{X}/{Y}.json")
    .id("county-boundary-layer"); // Assign a distinct identifier for this layer.

// Attach the callback function to process loaded county data.
countyDataOverlay.on("load", processGeographicEntities);

geographicalViewer.add(countyDataOverlay);

// Add another vector data layer, this time for state boundaries, without a specific load handler.
const stateDataOverlay = mapCore.geoJson()
    .url("http://polymaps.appspot.com/state/{Z}/{X}/{Y}.json")
    .id("state-boundary-layer"); // Distinct identifier for the state layer.
geographicalViewer.add(stateDataOverlay);

// Integrate a navigation control (compass) into the map interface.
// Panning functionality via this control is explicitly disabled.
geographicalViewer.add(mapCore.compass().pan("none"));

/**
 * Callback function triggered when GeoJSON data for a layer has been successfully loaded.
 * This function is responsible for styling individual map features based on associated data.
 * @param {object} dataLoadEvent - The event object from Polymaps, containing feature data.
 */
function processGeographicEntities(dataLoadEvent) {
    // Perform initial validation of the received event data.
    if (!dataLoadEvent || !Array.isArray(dataLoadEvent.features)) {
        console.warn("Feature processing warning: Received invalid or empty feature array.");
        return;
    }

    // Iterate through each geographical feature provided in the event.
    for (const currentFeature of dataLoadEvent.features) {
        // Validate the basic structure of each feature.
        if (!currentFeature || !currentFeature.data || !currentFeature.data.id) {
            console.warn("Skipping malformed geographic feature:", currentFeature);
            continue;
        }

        const featureUniqueId = currentFeature.data.id;
        // Check if the feature ID corresponds to a known invalid or aggregated entry.
        const idSuffix = featureUniqueId.slice(SUFFIX_VALIDATION_OFFSET);
        if (idSuffix === INVALID_COUNTY_SUFFIX) {
            continue; // Skip features marked as invalid for individual data display.
        }

        // Extract the relevant portion of the ID to query the global unemployment dataset.
        const dataKey = featureUniqueId.slice(COUNTY_ID_DATA_OFFSET);
        const currentUnemploymentRate = unemployment[dataKey]; // Access global 'unemployment' data.

        // Ensure valid unemployment data exists for the current feature.
        if (currentUnemploymentRate === undefined || currentUnemploymentRate === null) {
            console.info(`No unemployment data found for feature ID: ${featureUniqueId}. Skipping styling.`);
            continue;
        }

        // Categorize the unemployment rate using the pre-configured quantile scale.
        const assignedDataCategory = dataClassifier(currentUnemploymentRate);
        // Construct the CSS class string based on the assigned category.
        const featureStyleClass = `${FEATURE_STYLE_PREFIX}${assignedDataCategory}-${DATA_CATEGORY_QUANTITY}`;

        // Apply the generated CSS class to the feature's SVG element.
        if (currentFeature.element) {
            currentFeature.element.classList.add(featureStyleClass);

            // Create and append an SVG 'title' element for tooltip functionality.
            const featureTooltipElement = mapCore.svg("title");
            const featureDisplayName = currentFeature.data.properties.name || "Unnamed Region";
            const tooltipContent = `${featureDisplayName}: ${currentUnemploymentRate}%`;
            const tooltipTextNode = document.createTextNode(tooltipContent);

            featureTooltipElement.appendChild(tooltipTextNode);
            currentFeature.element.appendChild(featureTooltipElement);
        } else {
            console.warn(`Feature element missing for ID: ${featureUniqueId}. Cannot apply styling or tooltip.`);
        }
    }
}

// After all map components are assembled, apply a global theme class to the map's container.
const finalMapHostElement = geographicalViewer.container();
if (finalMapHostElement) { // Ensure the container element is accessible.
    finalMapHostElement.classList.add(DEFAULT_VISUAL_THEME);
} else {
    console.warn("Final map container not found; unable to apply default visual theme.");
}