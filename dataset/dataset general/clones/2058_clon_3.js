const SYSTEM_CONFIGURATION = {
    // Defines system-wide settings and connection parameters.
    TELEMETRY_SERVER_HOST: 'localhost',
    TELEMETRY_SERVER_PORT: 61613,
    TELEMETRY_TOPIC_SUBSCRIPTION: '/topic/graph',
    RECONNECTION_DELAY_MS: 5000, // Delay before attempting to reconnect
};

const DOM_ELEMENT_IDENTIFIERS = {
    // Centralized mapping for all dynamic and static DOM element IDs.
    MAIN_CONTAINER: 'data-display-area',
    COLUMN_PREFIX: 'data-column-',
    PLOT_AREA_PREFIX: 'chart-plot-',
    VALUE_DISPLAY_PREFIX: 'metric-value-',
};

const CSS_CLASSES = {
    // Standard CSS class names used throughout the application.
    COLUMN_CONTAINER: 'display-column',
    CHART_PLOT: 'data-plot',
    METRIC_READOUT: 'value-display',
    ERROR_MESSAGE: 'system-error',
};

// Application's core data structure definitions.
// These are the logical indices for the display columns.
const displayColumnIndices = [0, 1];
// These are the unique keys identifying each telemetry metric.
const telemetryMetricKeys = [
    'rpm', 'cache0', 'cache1', 'http_status', 'wp_login',
    'aurt', 'aurtli', 'mysql', 'df',
];

/**
 * Safely retrieves a DOM element by its ID.
 * Logs an error if the element is not found and returns null.
 * @param {string} elementId - The ID of the element to retrieve.
 * @returns {HTMLElement|null} The DOM element or null if not found.
 */
function obtainDomElement(elementId) {
    const targetElement = document.getElementById(elementId);
    if (!targetElement) {
        console.error(`DOM Error: Element with ID "${elementId}" not found. Cannot proceed.`);
    }
    return targetElement;
}

/**
 * Creates a new DOM element with specified tag, classes, and ID, and appends it to a parent.
 * @param {string} tagName - The HTML tag name (e.g., 'div', 'span').
 * @param {string[]} classNames - An array of CSS class names to add.
 * @param {string} elementId - The ID to assign to the new element.
 * @param {HTMLElement} [parentElement=null] - The parent element to append to.
 * @returns {HTMLElement} The newly created DOM element.
 */
function constructDomElement(tagName, classNames = [], elementId = '', parentElement = null) {
    const newElement = document.createElement(tagName);
    if (classNames.length > 0) {
        newElement.className = classNames.join(' ');
    }
    if (elementId) {
        newElement.id = elementId;
    }
    if (parentElement) {
        parentElement.appendChild(newElement);
    }
    return newElement;
}

/**
 * Initializes the entire display layout, creating columns, plot areas, and value displays.
 * This is the primary setup function for the UI structure.
 */
const prepareDisplayEnvironment = function() {
    // Guard clause: Ensure we have data to display.
    if (!Array.isArray(displayColumnIndices) || displayColumnIndices.length === 0 ||
        !Array.isArray(telemetryMetricKeys) || telemetryMetricKeys.length === 0) {
        console.warn('Initialization skipped: No column indices or metric keys defined.');
        return;
    }

    const mainDisplayArea = obtainDomElement(DOM_ELEMENT_IDENTIFIERS.MAIN_CONTAINER);
    if (!mainDisplayArea) {
        return; // Error already logged by obtainDomElement.
    }

    // Phase 1: Create individual data columns and their respective metric plot areas.
    displayColumnIndices.forEach(colIdentifier => {
        const currentColumnId = DOM_ELEMENT_IDENTIFIERS.COLUMN_PREFIX + colIdentifier;
        const currentColumnDiv = constructDomElement('div', [CSS_CLASSES.COLUMN_CONTAINER], currentColumnId, mainDisplayArea);

        telemetryMetricKeys.forEach(metricId => {
            const plotId = DOM_ELEMENT_IDENTIFIERS.PLOT_AREA_PREFIX + colIdentifier + '-' + metricId;
            constructDomElement('div', [CSS_CLASSES.CHART_PLOT], plotId, currentColumnDiv);
        });
    });

    // Phase 2: Create a dedicated 'summary' column for displaying individual metric values.
    // This column is distinct from the regular data columns and only hosts value displays.
    const summaryColumnIndex = displayColumnIndices.length; // Use next available index for summary.
    const summaryColumnId = DOM_ELEMENT_IDENTIFIERS.COLUMN_PREFIX + summaryColumnIndex;
    const summaryColumnDiv = constructDomElement('div', [CSS_CLASSES.COLUMN_CONTAINER], summaryColumnId, mainDisplayArea);

    telemetryMetricKeys.forEach(metricId => {
        const valueId = DOM_ELEMENT_IDENTIFIERS.VALUE_DISPLAY_PREFIX + metricId;
        constructDomElement('div', [CSS_CLASSES.METRIC_READOUT], valueId, summaryColumnDiv);
    });
};

/**
 * Processes an incoming telemetry payload, parses it, and updates all relevant visualizations.
 * @param {string} telemetryDataPayload - The raw JSON string containing telemetry data.
 */
const handleIncomingTelemetryData = function(telemetryDataPayload) {
    let parsedTelemetryInfo;
    try {
        parsedTelemetryInfo = JSON.parse(telemetryDataPayload);
    } catch (parseError) {
        console.error('Telemetry Processing Error: Failed to parse JSON payload.', parseError);
        console.error('Corrupt payload:', telemetryDataPayload);
        return;
    }

    // Validate essential data points in the parsed payload.
    if (!parsedTelemetryInfo || typeof parsedTelemetryInfo !== 'object' ||
        !parsedTelemetryInfo.hasOwnProperty('index') ||
        !parsedTelemetryInfo.hasOwnProperty('labels') ||
        !parsedTelemetryInfo.hasOwnProperty('history') ||
        !parsedTelemetryInfo.hasOwnProperty('flot_options')) {
        console.warn('Telemetry Processing Warning: Incomplete or malformed telemetry data received.', parsedTelemetryInfo);
        return;
    }

    const targetColumnIdentifier = parsedTelemetryInfo.index;
    const metricLabelsLookup = parsedTelemetryInfo.labels;
    const metricHistoryRecords = parsedTelemetryInfo.history;
    const plotConfigurationMap = parsedTelemetryInfo.flot_options;
    const currentHistoryLength = parsedTelemetryInfo.history_length; // Added for completeness, though not always used directly in this clone.

    telemetryMetricKeys.forEach(metricKey => {
        // Ensure all necessary data for this metric is present.
        if (!metricHistoryRecords[metricKey] || !metricLabelsLookup[metricKey] || !plotConfigurationMap[metricKey]) {
            console.warn(`Telemetry Processing Warning: Missing data for metric "${metricKey}". Skipping update.`);
            return;
        }

        const metricTimeSeriesData = metricHistoryRecords[metricKey];
        const displayLabel = metricLabelsLookup[metricKey];
        const plotOptions = plotConfigurationMap[metricKey];

        updateMetricVisualization(targetColumnIdentifier, metricKey, metricTimeSeriesData, displayLabel, currentHistoryLength, plotOptions);
    });
};

/**
 * Updates a specific metric's graph visualization and its corresponding value display.
 * @param {number} colIndex - The index of the column where the plot is located.
 * @param {string} metricKey - The identifier for the specific metric.
 * @param {Array<Array<number>>} timeSeriesValues - The data points for the plot.
 * @param {string} metricLabelText - The label to display for the metric value.
 * @param {number} dataHistoryLength - The total length of the historical data (optional, for future use).
 * @param {object} plotOptions - Configuration options for the Flot plot.
 */
const updateMetricVisualization = function(colIndex, metricKey, timeSeriesValues, metricLabelText, dataHistoryLength, plotOptions) {
    // Guard clauses for essential parameters.
    if (!Array.isArray(timeSeriesValues) || timeSeriesValues.length === 0) {
        console.warn(`Visualization Update Warning: No time series data provided for metric "${metricKey}" in column ${colIndex}.`);
        return;
    }
    if (typeof plotOptions !== 'object' || plotOptions === null) {
        console.warn(`Visualization Update Warning: Invalid plot options for metric "${metricKey}" in column ${colIndex}.`);
        return;
    }

    // Construct the unique ID for the plot element.
    const plotElementId = DOM_ELEMENT_IDENTIFIERS.PLOT_AREA_PREFIX + colIndex + '-' + metricKey;
    const plotElement = obtainDomElement(plotElementId);

    // If the plot element exists, update the graph using Flot.
    if (plotElement) {
        // Using jQuery for Flot integration.
        $.plot($(plotElement), [timeSeriesValues], plotOptions);
    } else {
        console.error(`Visualization Error: Plot element with ID "${plotElementId}" not found for updating.`);
    }

    // Update the numerical value display for this metric.
    const valueDisplayId = DOM_ELEMENT_IDENTIFIERS.VALUE_DISPLAY_PREFIX + metricKey;
    const valueDisplayElement = obtainDomElement(valueDisplayId);

    if (valueDisplayElement) {
        valueDisplayElement.innerHTML = metricLabelText;
    } else {
        console.error(`Visualization Error: Value display element with ID "${valueDisplayId}" not found for updating.`);
    }
};

let telemetryConnectionClient = null; // Global variable for the STOMP client instance.
let reconnectAttemptTimer = null; // Timer for handling reconnection attempts.

/**
 * Initializes and configures the STOMP telemetry client.
 * Handles connection, disconnection, error, and message events.
 */
const setupTelemetryConnection = function() {
    telemetryConnectionClient = new STOMPClient();

    telemetryConnectionClient.onopen = function() {
        console.log('Telemetry connection established.');
        if (reconnectAttemptTimer) {
            clearTimeout(reconnectAttemptTimer);
            reconnectAttemptTimer = null;
        }
    };

    telemetryConnectionClient.onclose = function(closeEventCode) {
        console.warn(`Telemetry connection closed. Code: ${closeEventCode}. Attempting to reconnect in ${SYSTEM_CONFIGURATION.RECONNECTION_DELAY_MS / 1000} seconds...`);
        // Implement a basic reconnection strategy.
        if (!reconnectAttemptTimer) {
            reconnectAttemptTimer = setTimeout(() => {
                console.log('Attempting to re-establish telemetry connection...');
                telemetryConnectionClient.connect(SYSTEM_CONFIGURATION.TELEMETRY_SERVER_HOST, SYSTEM_CONFIGURATION.TELEMETRY_SERVER_PORT);
            }, SYSTEM_CONFIGURATION.RECONNECTION_DELAY_MS);
        }
    };

    telemetryConnectionClient.onerror = function(errorDescription) {
        console.error('Telemetry Connection Error:', errorDescription);
        // Display a user-friendly error in the UI if possible.
        const mainContainer = obtainDomElement(DOM_ELEMENT_IDENTIFIERS.MAIN_CONTAINER);
        if (mainContainer) {
            let errorDiv = obtainDomElement('global-error-message');
            if (!errorDiv) {
                errorDiv = constructDomElement('div', [CSS_CLASSES.ERROR_MESSAGE], 'global-error-message', mainContainer);
            }
            errorDiv.textContent = `Connection Problem: ${errorDescription}. Please check server status.`;
        }
    };

    telemetryConnectionClient.onerrorframe = function(errorFrame) {
        console.error('Telemetry Error Frame Received:', errorFrame.body);
        // More detailed error handling for STOMP protocol errors.
    };

    telemetryConnectionClient.onconnectedframe = function() {
        console.log('STOMP client connected and ready to subscribe.');
        telemetryConnectionClient.subscribe(SYSTEM_CONFIGURATION.TELEMETRY_TOPIC_SUBSCRIPTION);
        console.log(`Subscribed to topic: ${SYSTEM_CONFIGURATION.TELEMETRY_TOPIC_SUBSCRIPTION}`);
    };

    telemetryConnectionClient.onmessageframe = function(messageFrame) {
        // Process the incoming message.
        if (messageFrame && messageFrame.body) {
            handleIncomingTelemetryData(messageFrame.body);
        } else {
            console.warn('Received empty or invalid message frame from telemetry stream.');
        }
    };

    // Initiate the connection.
    console.log(`Attempting to connect to telemetry server at ${SYSTEM_CONFIGURATION.TELEMETRY_SERVER_HOST}:${SYSTEM_CONFIGURATION.TELEMETRY_SERVER_PORT}`);
    telemetryConnectionClient.connect(SYSTEM_CONFIGURATION.TELEMETRY_SERVER_HOST, SYSTEM_CONFIGURATION.TELEMETRY_SERVER_PORT);
};

// Execute initialization routines once the DOM is fully loaded.
$(document).ready(function() {
    console.log('DOM is ready. Starting application initialization...');
    prepareDisplayEnvironment();
    setupTelemetryConnection();
    console.log('Application initialization complete.');
});