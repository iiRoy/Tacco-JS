// Acknowledgment: This code is a derivation, adaptation, and reimagining
// of an original open-source project. While the core functionality of
// geospatial issue reporting is retained, significant architectural,
// stylistic, and structural modifications have been applied.
//
// This derivative work is distributed under the terms of the
// MIT License.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.


/**
 * This module facilitates client-side interaction with a geospatial issue
 * tracking system. To integrate, include this script and invoke
 * `initializeGeoBugTracker` with an OpenLayers map object and the
 * endpoint URL for the backend services.
 *
 * Refer to `example-map.html` for a practical implementation guide.
 */


/**
 * Collection of general-purpose string and data manipulation routines.
 */

/**
 * Removes leading and trailing whitespace from a given string.
 * @param {string} inputString - The string to trim.
 * @returns {string} The trimmed string.
 */
const cleanStringEdges = (inputString) => {
    // Ensure input is treated as a string, then apply trimming.
    if (typeof inputString !== 'string') {
        console.warn('cleanStringEdges received non-string input:', inputString);
        return String(inputString).trim();
    }
    return inputString.trim();
};

/**
 * Sanitizes a string by escaping HTML special characters, preventing XSS.
 * @param {string} unsafeString - The string potentially containing HTML.
 * @returns {string} The HTML-safe string.
 */
function sanitizeMarkup(unsafeString) {
    if (unsafeString === null || unsafeString === undefined) {
        return ''; // Handle null/undefined input gracefully
    }
    let processedContent = String(unsafeString); // Ensure it's a string
    processedContent = processedContent.replace(/&/g, "&amp;");
    processedContent = processedContent.replace(/"/g, "&quot;");
    processedContent = processedContent.replace(/</g, "&lt;");
    processedContent = processedContent.replace(/>/g, "&gt;");
    // Using a more standard apostrophe entity
    processedContent = processedContent.replace(/'/g, "&#39;");
    return processedContent;
}

/**
 * Stores a key-value pair in a session-persistent cookie.
 * The cookie expires after a predefined duration (e.g., one week).
 * @param {string} keyName - The name of the cookie.
 * @param {string} keyValue - The value to store.
 */
const storeEphemeralData = (keyName, keyValue) => {
    // Calculate expiration for one week from now.
    const expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days in milliseconds
    const expires = "expires=" + expirationDate.toUTCString();
    // Encode the value to handle special characters.
    document.cookie = `${keyName}=${encodeURIComponent(keyValue)};${expires};path=/`;
};

/**
 * Retrieves the value of a specific cookie by its name.
 * @param {string} keyName - The name of the cookie to retrieve.
 * @returns {string|null} The decoded cookie value, or null if not found.
 */
function retrieveEphemeralData(keyName) {
    const allCookies = document.cookie;
    if (!allCookies) {
        return null;
    }

    const cookieSegments = allCookies.split(';');
    for (const segment of cookieSegments) {
        let [cookieKey, cookieValue] = segment.split('=');
        // Clean whitespace from the key for accurate comparison.
        cookieKey = cleanStringEdges(cookieKey);
        if (cookieKey === keyName) {
            try {
                return decodeURIComponent(cookieValue);
            } catch (error) {
                console.error('Failed to decode cookie value:', error);
                return null; // Return null on decoding error
            }
        }
    }
    return null;
}

/**
 * Geographic coordinate transformation utilities, converting between
 * standard WGS84 Lat/Lon and Spherical Mercator projections.
 */
const MercatorConstants = {
    SPHERE_RADIUS_FACTOR: 20037508.34, // Earth's circumference in meters / 2 * PI
    RADIAN_TO_DEGREE: 180 / Math.PI,
    DEGREE_TO_RADIAN: Math.PI / 180
};

/**
 * Scales a value for Mercator projection.
 * @param {number} val - Input value.
 * @returns {number} Scaled value.
 */
const scaleForMercator = (val) => val * (MercatorConstants.SPHERE_RADIUS_FACTOR / MercatorConstants.RADIAN_TO_DEGREE);

/**
 * Descales a value from Mercator projection.
 * @param {number} val - Input value.
 * @returns {number} Descaled value.
 */
const descaleFromMercator = (val) => val / (MercatorConstants.SPHERE_RADIUS_FACTOR / MercatorConstants.RADIAN_TO_DEGREE);

/**
 * Converts Mercator Y coordinate to Latitude (WGS84).
 * @param {number} mercatorY - Mercator Y coordinate.
 * @returns {number} Latitude in degrees.
 */
const mercatorYToLatitude = (mercatorY) => {
    const descaledY = descaleFromMercator(mercatorY);
    return MercatorConstants.RADIAN_TO_DEGREE * (2 * Math.atan(Math.exp(descaledY * MercatorConstants.DEGREE_TO_RADIAN)) - Math.PI / 2);
};

/**
 * Converts Latitude (WGS84) to Mercator Y coordinate.
 * @param {number} latitude - Latitude in degrees.
 * @returns {number} Mercator Y coordinate.
 */
const latitudeToMercatorY = (latitude) => {
    const radLat = latitude * MercatorConstants.DEGREE_TO_RADIAN;
    return scaleForMercator(MercatorConstants.RADIAN_TO_DEGREE * Math.log(Math.tan(Math.PI / 4 + radLat / 2)));
};

/**
 * Converts Mercator X coordinate to Longitude (WGS84).
 * @param {number} mercatorX - Mercator X coordinate.
 * @returns {number} Longitude in degrees.
 */
const mercatorXToLongitude = (mercatorX) => descaleFromMercator(mercatorX);

/**
 * Converts Longitude (WGS84) to Mercator X coordinate.
 * @param {number} longitude - Longitude in degrees.
 * @returns {number} Mercator X coordinate.
 */
const longitudeToMercatorX = (longitude) => scaleForMercator(longitude);

/**
 * Transforms a WGS84 LonLat object to an OpenLayers.LonLat in Spherical Mercator.
 * @param {object} geoCoords - An object with `lon` and `lat` properties.
 * @returns {OpenLayers.LonLat} A new OpenLayers.LonLat object in Mercator projection.
 */
const convertLonLatToMercator = (geoCoords) => {
    if (!geoCoords || typeof geoCoords.lon !== 'number' || typeof geoCoords.lat !== 'number') {
        console.error('Invalid geoCoords object provided for conversion.');
        return new OpenLayers.LonLat(0, 0); // Return a default or throw error
    }
    return new OpenLayers.LonLat(longitudeToMercatorX(geoCoords.lon), latitudeToMercatorY(geoCoords.lat));
};


/**
 * HTML content generators for various issue popup displays.
 */

/**
 * Replaces specific HTML break tags with paragraph structures for comment formatting.
 * @param {string} rawText - The text content with placeholder breaks.
 * @returns {string} Formatted HTML string.
 */
function formatCommentSections(rawText) {
    if (!rawText) return '';
    // Use a more robust regex for various <hr> forms and ensure proper closing tags.
    // Also, wrap the initial part in a paragraph.
    return `<p class="IssueComment">${rawText.replace(/<hr\s*\/?>/gi, '</p><p class="IssueComment"><b>' + _('Comment:') + '</b> ')}</p>`;
}

/**
 * Generates HTML markup for a popup displaying an unresolved issue.
 * @param {object|number} issueRef - The issue object or its ID.
 * @returns {string} HTML content for the popup.
 */
const renderActiveIssuePopup = (issueRef) => {
    const currentIssue = typeof issueRef === 'object' ? issueRef : getIssueDetails(issueRef);
    if (!currentIssue) return `<h1>${_('Error')}</h1><p>${_('Issue data not found.')}</p>`;

    const { id, description, latitude, longitude } = currentIssue;

    // Helper for action links
    const createActionLink = (label, handler, target = '_self') =>
        `<li><a href="#" onclick="${handler}; return false;">${label}</a></li>`;

    const descriptiveContent = `
        <h1>${_('Unresolved Incident')}</h1>
        <p><b>${_('Details:')}</b> ${formatCommentSections(description)}</p>
    `;

    const actionList = `
        <ul>
            ${createActionLink(_('Add Note'), `addNoteToIssue(${id})`)}
            <li><a href="https://www.openstreetmap.org/edit?lat=${latitude}&amp;lon=${longitude}&amp;zoom=17" target="_blank">${_('Edit with Potlatch')}</a></li>
    `;

    // Dynamic coordinates for JOSM link (slightly different calculation)
    const mapCenterLat = parseFloat(latitude);
    const mapCenterLon = parseFloat(longitude);
    const josmBoundsTop = (mapCenterLat + 0.0025).toFixed(6);
    const josmBoundsBottom = (mapCenterLat - 0.0025).toFixed(6);
    const josmBoundsLeft = (mapCenterLon - 0.0035).toFixed(6);
    const josmBoundsRight = (mapCenterLon + 0.0035).toFixed(6);

    const josmAction = `
            <li><a href="http://localhost:8111/load_and_zoom?top=${josmBoundsTop}&amp;bottom=${josmBoundsBottom}&amp;left=${josmBoundsLeft}&amp;right=${josmBoundsRight}" target="_blank">${_('Load in JOSM')}</a></li>
    `;

    const closeAction = `
            ${createActionLink(_('Mark as Resolved'), `initiateIssueClosure(${id})`)}
        </ul>
    `;

    return descriptiveContent + actionList + josmAction + closeAction;
};

/**
 * Generates HTML markup for a popup displaying a fixed issue.
 * @param {object|number} issueRef - The issue object or its ID.
 * @returns {string} HTML content for the popup.
 */
const renderClosedIssuePopup = (issueRef) => {
    const currentIssue = typeof issueRef === 'object' ? issueRef : getIssueDetails(issueRef);
    if (!currentIssue) return `<h1>${_('Error')}</h1><p>${_('Issue data not found.')}</p>`;

    const descriptiveContent = `
        <h1>${_('Resolved Incident')}</h1>
        <p><b>${_('Details:')}</b> ${formatCommentSections(currentIssue.description)}</p>
    `;
    const informationalNote = `
        <p class="StatusNote">${_('This incident has been marked as resolved. Map updates may take some time to reflect this change.')}</p>
    `;

    return descriptiveContent + informationalNote;
};

/**
 * Generates HTML markup for a popup allowing creation of a new issue report.
 * @param {number} xCoord - Mercator X coordinate for the new issue.
 * @param {number} yCoord - Mercator Y coordinate for the new issue.
 * @param {string} [suggestedAlias] - A pre-filled nickname.
 * @returns {string} HTML content for the new issue form.
 */
const renderNewIssueFormPopup = (xCoord, yCoord, suggestedAlias = 'AnonymousUser') => {
    const introSection = `
        <h1>${_('Report a New Incident')}</h1>
        <p>${_('Please provide a concise description of the problem at this location. Optionally, include your nickname.')}</p>
    `;

    const formHiddenInputs = `
        <input type="hidden" name="longitude" value="${mercatorXToLongitude(xCoord)}">
        <input type="hidden" name="latitude" value="${mercatorYToLatitude(yCoord)}">
    `;

    const formFields = `
        <div class="FormField">
            <label for="incidentDescription" class="InputLabel">${_('Description:')}</label>
            <input type="text" id="incidentDescription" name="incidentDescription" required>
        </div>
        <div class="FormField">
            <label for="reporterAlias" class="InputLabel">${_('Your Alias:')}</label>
            <input type="text" id="reporterAlias" name="reporterAlias" value="${sanitizeMarkup(suggestedAlias)}">
        </div>
    `;

    const formActions = `
        <div class="FormActions">
            <button type="button" onclick="submitNewIssueForm(this.form);">${_('Submit Report')}</button>
            <button type="button" onclick="cancelNewIssueForm();">${_('Discard')}</button>
        </div>
    `;

    return `
        ${introSection}
        <form class="NewIssueForm">
            ${formHiddenInputs}
            ${formFields}
            ${formActions}
        </form>
    `;
};

/**
 * Generates HTML markup for a temporary popup displayed while a new issue is being submitted.
 * @returns {string} HTML content for the submission status.
 */
const renderIssueSubmissionProgressPopup = () => `
    <h1>${_('Report a New Incident')}</h1>
    <p>${_('Processing your incident report, please wait...')}</p>
`;

/**
 * Generates HTML markup for a popup to add a comment to an existing issue.
 * @param {object|number} issueRef - The issue object or its ID.
 * @param {string} [suggestedAlias] - A pre-filled nickname.
 * @returns {string} HTML content for the comment form.
 */
const renderAddCommentFormPopup = (issueRef, suggestedAlias = 'AnonymousUser') => {
    const currentIssue = typeof issueRef === 'object' ? issueRef : getIssueDetails(issueRef);
    if (!currentIssue) return `<h1>${_('Error')}</h1><p>${_('Issue data not found.')}</p>`;

    const { id, description } = currentIssue;

    const introAndDescription = `
        <h1>${_('Add a Note')}</h1>
        <p><b>${_('Original Description:')}</b> ${formatCommentSections(description)}</p>
    `;

    const formHiddenInput = `<input type="hidden" name="issueId" value="${id}">`;

    const formFields = `
        <div class="FormField">
            <label for="commentContent" class="InputLabel">${_('Your Note:')}</label>
            <textarea id="commentContent" name="commentContent" rows="3" required></textarea>
        </div>
        <div class="FormField">
            <label for="commenterAlias" class="InputLabel">${_('Your Alias:')}</label>
            <input type="text" id="commenterAlias" name="commenterAlias" value="${sanitizeMarkup(suggestedAlias)}">
        </div>
    `;

    const formActions = `
        <div class="FormActions">
            <button type="button" onclick="submitCommentToIssue(${id}, this.form);">${_('Post Note')}</button>
            <button type="button" onclick="restorePreviousPopup(${id});">${_('Cancel')}</button>
        </div>
    `;

    return `
        ${introAndDescription}
        <form class="IssueCommentForm">
            ${formHiddenInput}
            ${formFields}
            ${formActions}
        </form>
    `;
};

/**
 * Generates HTML markup for a popup confirming issue closure.
 * @param {object|number} issueRef - The issue object or its ID.
 * @param {string} [suggestedAlias] - A pre-filled nickname.
 * @returns {string} HTML content for the closure confirmation form.
 */
const renderCloseIssueConfirmationPopup = (issueRef, suggestedAlias = 'AnonymousUser') => {
    const currentIssue = typeof issueRef === 'object' ? issueRef : getIssueDetails(issueRef);
    if (!currentIssue) return `<h1>${_('Error')}</h1><p>${_('Issue data not found.')}</p>`;

    const { id, description } = currentIssue;

    const warningMessage = `
        <h1>${_('Confirm Issue Resolution')}</h1>
        <p>${_('Are you certain you want to mark this incident as resolved? It will be archived after approximately one week.')}</p>
        <p><b>${_('Original Description:')}</b> ${formatCommentSections(description)}</p>
    `;

    const formHiddenInput = `<input type="hidden" name="issueId" value="${id}">`;

    const formFields = `
        <div class="FormField">
            <label for="closureComment" class="InputLabel">${_('Reason for Closure (Optional):')}</label>
            <textarea id="closureComment" name="closureComment" rows="2"></textarea>
        </div>
        <div class="FormField">
            <label for="closerAlias" class="InputLabel">${_('Your Alias:')}</label>
            <input type="text" id="closerAlias" name="closerAlias" value="${sanitizeMarkup(suggestedAlias)}">
        </div>
    `;

    const formActions = `
        <div class="FormActions">
            <button type="button" onclick="confirmIssueClosureSubmission(${id}, this.form);">${_('Yes, Resolve')}</button>
            <button type="button" onclick="restorePreviousPopup(${id});">${_('No, Keep Open')}</button>
        </div>
    `;

    return `
        ${warningMessage}
        <form class="IssueClosureForm">
            ${formHiddenInput}
            ${formFields}
            ${formActions}
        </form>
    `;
};


/**
 * Core OpenStreetBugs (now GeoBugTracker) system initialization and state management.
 */

/** Base path for all system-related images. */
let assetPath = "/assets/";

/** The OpenLayers map instance this system operates on. */
let activeMapInstance = null;

/** The root URL for the backend API endpoints. */
let backendApiEndpoint = null;

/** The OpenLayers layer specifically for displaying issue markers. */
let issueOverlayLayer = null;

/** In-memory cache of downloaded issue objects. */
const trackedIssuesCache = new Map(); // Using a Map for better lookup performance

/** Manages the current state of the user interface regarding popups.
 * 0: No popup active or in interaction mode.
 * 1: An existing issue popup is displayed.
 * 2: User is in the process of adding a new issue.
 * 3: User is adding a comment to an issue.
 * 4: User is closing an issue.
 */
let uiInteractionState = 0;
let currentInteractiveFeature = null; // The OpenLayers feature currently interacted with.

/** Cursor style for the map: 'default' or 'crosshair' for adding issues. */
let mapPointerStyle = "default";

/**
 * Initializes the GeoBugTracker system on a given OpenLayers map.
 * @param {OpenLayers.Map} mapObj - The OpenLayers map object.
 * @param {string} apiPath - The base URL for the server-side API.
 */
function initializeGeoBugTracker(mapObj, apiPath) {
    if (!mapObj || !mapObj instanceof OpenLayers.Map) {
        console.error('Invalid OpenLayers map object provided for initialization.');
        return;
    }
    if (!apiPath || typeof apiPath !== 'string') {
        console.error('Invalid API path provided for initialization.');
        return;
    }

    activeMapInstance = mapObj;
    backendApiEndpoint = apiPath.endsWith('/') ? apiPath : `${apiPath}/`;

    const mapElement = document.getElementById("map");
    if (mapElement) {
        mapElement.style.cursor = mapPointerStyle;
    } else {
        console.warn('Map element with ID "map" not found. Cursor styling may not apply.');
    }


    issueOverlayLayer = new OpenLayers.Layer.Markers("GeoBugTracker_Issues");
    issueOverlayLayer.setOpacity(0.75); // Slightly different opacity

    activeMapInstance.addLayer(issueOverlayLayer);

    // Register map event for refreshing issues when map view changes.
    activeMapInstance.events.register('moveend', activeMapInstance, updateDisplayedIssues);

    // Custom click control for adding new bugs
    const customClickControl = new OpenLayers.Control();
    OpenLayers.Util.extend(customClickControl, {
        draw: function () {
            this.handler = new OpenLayers.Handler.Click(customClickControl, {
                'click': handleMapClick
            }, {
                'single': true,
                'double': false,
                'stopSingle': true
            });
        }
    });
    activeMapInstance.addControl(customClickControl);
    customClickControl.activate();

    updateDisplayedIssues(); // Initial load of issues.
    updateSidebarContent(); // Update auxiliary sidebar information.
}


/**
 * Asynchronous Communication Utilities (AJAX).
 */

let uniqueCallIdentifier = 0; // Ensures unique callbacks for script injection requests.

/**
 * Dispatches a request to the backend server by injecting a script tag.
 * @param {string} apiRoute - The specific API route (e.g., "getBugs").
 * @param {object} queryParams - An object containing key-value pairs for URL parameters.
 */
function dispatchServerQuery(apiRoute, queryParams) {
    if (!backendApiEndpoint) {
        console.error('Backend API endpoint is not set. Cannot dispatch query.');
        return;
    }

    let requestUrl = `${backendApiEndpoint}${apiRoute}`;
    const urlParams = new URLSearchParams();

    // Append queryParams
    for (const key in queryParams) {
        if (Object.prototype.hasOwnProperty.call(queryParams, key)) {
            urlParams.append(key, queryParams[key]);
        }
    }

    // Add a unique ID to prevent caching and ensure unique callbacks if needed.
    urlParams.append('reqId', uniqueCallIdentifier++);

    requestUrl += `?${urlParams.toString()}`;

    const scriptTag = document.createElement("script");
    scriptTag.src = requestUrl;
    scriptTag.type = "application/javascript"; // More specific MIME type
    scriptTag.async = true; // Non-blocking script loading

    scriptTag.onerror = () => {
        console.error(`Failed to load script from: ${requestUrl}`);
        scriptTag.remove(); // Clean up on error
    };
    scriptTag.onload = () => {
        // Script loaded successfully, potential callback executed
        scriptTag.remove(); // Clean up after execution
    };

    document.head.appendChild(scriptTag); // Append to head for better practice
}

/**
 * Callback function used by dynamically loaded scripts to integrate new issue markers.
 * @param {string|number} issueIdentifier - Unique ID of the issue.
 * @param {number} geoLon - Longitude of the issue.
 * @param {number} geoLat - Latitude of the issue.
 * @param {string} issueDescription - Textual description of the issue.
 * @param {number} issueStatusType - 0 for open, 1 for closed.
 */
function integrateIssueMarker(issueIdentifier, geoLon, geoLat, issueDescription, issueStatusType) {
    // Basic validation
    if (!issueIdentifier || typeof geoLon !== 'number' || typeof geoLat !== 'number') {
        console.warn('Skipping invalid issue data:', { issueIdentifier, geoLon, geoLat });
        return;
    }

    // Check if issue already exists in cache to avoid duplicates
    if (trackedIssuesCache.has(issueIdentifier)) {
        // console.log(`Issue ${issueIdentifier} already cached, skipping re-addition.`);
        return;
    }

    const newIssue = {
        id: issueIdentifier,
        description: issueDescription, // Renamed from 'text'
        latitude: geoLat, // Renamed from 'lat'
        longitude: geoLon, // Renamed from 'lon'
        status: issueStatusType, // Renamed from 'type'
        mapFeature: null // Placeholder for the OpenLayers feature
    };

    let popupHtmlContent;
    if (newIssue.status === 0) { // Open bug
        popupHtmlContent = renderActiveIssuePopup(newIssue);
    } else { // Closed bug
        popupHtmlContent = renderClosedIssuePopup(newIssue);
    }

    // Create and store the OpenLayers feature
    newIssue.mapFeature = generateMapFeature(longitudeToMercatorX(geoLon), latitudeToMercatorY(geoLat), popupHtmlContent, newIssue.status);
    trackedIssuesCache.set(newIssue.id, newIssue); // Store in Map

    // Add the marker to the map layer
    addMarkerToLayer(newIssue.mapFeature);
}

/**
 * Extracts form field values into a URL-encoded string.
 * @param {HTMLFormElement} formElement - The form to serialize.
 * @returns {string} URL-encoded string of form data.
 */
function serializeFormData(formElement) {
    const formData = new FormData(formElement);
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
        // Ensure values are properly converted to string before appending.
        params.append(key, String(value));
    }
    return params.toString();
}

/**
 * Submits a form's data to a specified URL using an XMLHttpRequest.
 * @param {HTMLFormElement} formElement - The form to submit.
 * @param {string} apiRoute - The API route for submission.
 * @param {Function} [onSubmissionStart] - Callback before submission begins.
 * @param {Function} [onSubmissionComplete] - Callback after submission finishes.
 */
function submitFormViaXHR(formElement, apiRoute, onSubmissionStart, onSubmissionComplete) {
    if (!backendApiEndpoint) {
        console.error('Backend API endpoint is not set. Cannot submit form.');
        return;
    }
    const targetUrl = `${backendApiEndpoint}${apiRoute}`;
    const serializedData = serializeFormData(formElement);

    if (onSubmissionStart && typeof onSubmissionStart === 'function') {
        onSubmissionStart();
    }

    executeXmlHttpRequest(targetUrl, serializedData, onSubmissionComplete);
}

/**
 * Executes a basic XMLHttpRequest POST request.
 * @param {string} urlPath - The target URL.
 * @param {string} postData - The URL-encoded string of data to send.
 * @param {Function} [completionCallback] - Callback function (status) on request completion.
 */
function executeXmlHttpRequest(urlPath, postData, completionCallback) {
    const httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (completionCallback && typeof completionCallback === 'function') {
                completionCallback(httpRequest.status, httpRequest.responseText);
            }
        }
    };

    httpRequest.onerror = () => {
        console.error('XMLHttpRequest encountered an error for URL:', urlPath);
        if (completionCallback && typeof completionCallback === 'function') {
            completionCallback(0, 'Network Error'); // Status 0 for network errors
        }
    };

    httpRequest.open('POST', urlPath, true);
    httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    httpRequest.send(postData);
}


/**
 * Issue Management Logic.
 */

let refreshCycleCounter = 0; // Tracks number of refresh calls.

/**
 * Initiates the download of new issues from the server based on current map bounds.
 * Also triggers sidebar and UI updates.
 */
function updateDisplayedIssues() {
    if (!activeMapInstance) {
        console.warn('Map instance not available for issue refresh.');
        return;
    }

    refreshCycleCounter++; // Increment call counter

    const currentBounds = activeMapInstance.getExtent().toArray(); // [minx, miny, maxx, maxy]
    if (currentBounds.length !== 4) {
        console.error('Could not determine map bounds for refreshing issues.');
        return;
    }

    // Convert Mercator bounds to WGS84 Lat/Lon
    const bottomLat = truncateCoord(mercatorYToLatitude(currentBounds[1]));
    const topLat = truncateCoord(mercatorYToLatitude(currentBounds[3]));
    const leftLon = truncateCoord(mercatorXToLongitude(currentBounds[0]));
    const rightLon = truncateCoord(mercatorXToLongitude(currentBounds[2]));

    // Update sidebar information based on new map view
    updateSidebarContent(leftLon, bottomLat, rightLon, topLat);

    const requestParameters = {
        "bottomBoundary": bottomLat,
        "topBoundary": topLat,
        "leftBoundary": leftLon,
        "rightBoundary": rightLon,
        "uniqueClientSessionId": refreshCycleCounter
    };
    dispatchServerQuery("fetchIssues", requestParameters);
}

/**
 * Truncates a coordinate value to a fixed number of decimal places.
 * @param {number} coordinateValue - The coordinate to truncate.
 * @returns {number} The truncated coordinate.
 */
function truncateCoord(coordinateValue) {
    if (typeof coordinateValue !== 'number' || isNaN(coordinateValue)) {
        return 0; // Return a safe default for invalid input
    }
    // Using Math.round for consistent behavior as original, but to 6 decimal places.
    return Math.round(coordinateValue * 1000000) / 1000000;
}

/**
 * Updates the content of the sidebar with relevant map links and information.
 * @param {number} [lon] - Current map center longitude.
 * @param {number} [lat] - Current map center latitude.
 * @param {number} [zoom] - Current map zoom level.
 * @param {string} [layers] - Active map layers.
 */
function updateSidebarContent(lon, lat, zoom, layers) {
    // Attempt to get map view parameters if not provided
    const mapParams = permalink.createParams(); // Assuming 'permalink' object is globally available.
    const currentZoom = zoom !== undefined ? zoom : mapParams.zoom;
    const currentLon = lon !== undefined ? lon : mapParams.lon;
    const currentLat = lat !== undefined ? lat : mapParams.lat;
    const currentLayers = layers !== undefined ? layers : mapParams.layers;

    const rssLinkElem = document.getElementById("rssFeedLink");
    const gpxLinkElem = document.getElementById("gpxExportLink");
    const permalinkElem = document.getElementById("mapPermalink");
    const geofabrikLinkElem = document.getElementById("geofabrikMapLink");
    const osmOrgLinkElem = document.getElementById("osmOrgMapLink");

    const hideElement = (elem) => { if (elem) elem.style.display = "none"; };
    const showElement = (elem) => { if (elem) elem.style.display = "list-item"; };

    // Conditional visibility for export links based on zoom level
    if (currentZoom > 10) {
        if (rssLinkElem) {
            showElement(rssLinkElem);
            rssLinkElem.innerHTML = `<a href='${backendApiEndpoint}getRSSfeed?b=${currentLat}&t=${currentLat}&l=${currentLon}&r=${currentLon}'>${_("RSS Feed")}</a>`;
        }
        if (gpxLinkElem) {
            showElement(gpxLinkElem);
            gpxLinkElem.innerHTML = `<a href='${backendApiEndpoint}getGPX?b=${currentLat}&t=${currentLat}&l=${currentLon}&r=${currentLon}'>${_("GPX Export")}</a>`;
        }
    } else {
        hideElement(rssLinkElem);
        hideElement(gpxLinkElem);
    }

    // Update permanent links
    if (permalinkElem) {
        permalinkElem.innerHTML = `<a href='?lon=${currentLon}&lat=${currentLat}&zoom=${currentZoom}&layers=${currentLayers}'>${_("Permalink")}</a>`;
    }
    if (geofabrikLinkElem) {
        geofabrikLinkElem.innerHTML = `<a href='http://tools.geofabrik.de/map/?lon=${currentLon}&lat=${currentLat}&zoom=${currentZoom}' target='_blank'>${_("Geofabrik Map")}</a>`;
    }
    if (osmOrgLinkElem) {
        osmOrgLinkElem.innerHTML = `<a href='http://www.openstreetmap.org/?lon=${currentLon}&lat=${currentLat}&zoom=${currentZoom}' target='_blank'>${_("OpenStreetMap.org")}</a>`;
    }
}


/**
 * Retrieves an issue object from the cache by its ID.
 * @param {string|number} issueId - The ID of the issue.
 * @returns {object|undefined} The issue object, or undefined if not found.
 */
const getIssueDetails = (issueId) => trackedIssuesCache.get(issueId);

/**
 * Creates an OpenLayers Feature for an issue marker and configures its popup.
 * @param {number} mercatorX - Mercator X coordinate.
 * @param {number} mercatorY - Mercator Y coordinate.
 * @param {string} popupContentHtml - HTML content for the popup.
 * @param {number} statusType - 0 for open, 1 for closed.
 * @returns {OpenLayers.Feature} The configured OpenLayers Feature.
 */
function generateMapFeature(mercatorX, mercatorY, popupContentHtml, statusType) {
    // Initialize icons only once, store them as properties of the function
    if (!generateMapFeature.iconCache) {
        const iconDimensions = new OpenLayers.Size(24, 24); // Slightly larger icon
        const iconAnchorOffset = new OpenLayers.Pixel(-iconDimensions.w / 2, -iconDimensions.h); // Anchor at bottom-center

        generateMapFeature.iconCache = {
            openIssue: new OpenLayers.Icon(`${assetPath}icon_open_issue.png`, iconDimensions, iconAnchorOffset),
            closedIssue: new OpenLayers.Icon(`${assetPath}icon_closed_issue.png`, iconDimensions, iconAnchorOffset)
        };
    }

    const selectedIcon = statusType === 0 ? generateMapFeature.iconCache.openIssue.clone() : generateMapFeature.iconCache.closedIssue.clone();
    const featureLocation = new OpenLayers.LonLat(mercatorX, mercatorY);
    const newFeature = new OpenLayers.Feature(issueOverlayLayer, featureLocation, { icon: selectedIcon });

    // Set popup properties. Using FramedCloud for consistency.
    newFeature.popupClass = OpenLayers.Class(OpenLayers.Popup.FramedCloud, {
        autoSize: true,
        panMapIfOutOfView: true,
        closeOnMove: false, // Keep popup open when map moves
        keepInMap: true // Prevent popup from going off map edges
    });
    newFeature.data.popupContentHTML = popupContentHtml;
    newFeature.closeBox = false; // Managed by custom logic

    return newFeature;
}

/**
 * Adds an OpenLayers Feature's marker to the map layer and attaches event listeners.
 * @param {OpenLayers.Feature} featureToRender - The feature to add.
 */
function addMarkerToLayer(featureToRender) {
    const marker = featureToRender.createMarker();

    // Event handler for marker clicks
    const onMarkerClick = (event) => {
        // Prevent map click handler from firing
        OpenLayers.Event.stop(event);

        if (uiInteractionState === 0) {
            // No interaction active, open this feature's popup
            featureToRender.createPopup(featureToRender.closeBox);
            activeMapInstance.addPopup(featureToRender.popup);
            uiInteractionState = 1;
            currentInteractiveFeature = featureToRender;
        } else if (uiInteractionState === 1 && currentInteractiveFeature === featureToRender) {
            // This feature's popup is already open, close it
            activeMapInstance.removePopup(featureToRender.popup);
            uiInteractionState = 0;
            currentInteractiveFeature = null;
        }
        // If uiInteractionState is 2 (adding new bug), do nothing on click of existing marker.
    };

    // Event handler for mouseover (hover)
    const onMarkerHover = (event) => {
        OpenLayers.Event.stop(event);
        const mapElement = document.getElementById("map");

        if (uiInteractionState === 0) {
            // If no interaction is active, show temporary popup on hover
            mapElement.style.cursor = "pointer";
            featureToRender.createPopup(featureToRender.closeBox);
            activeMapInstance.addPopup(featureToRender.popup);
        } else if (uiInteractionState !== 2 && currentInteractiveFeature === featureToRender) {
            // If this is the currently active feature (state 1) and not adding a new bug (state 2)
            mapElement.style.cursor = "pointer";
        }
    };

    // Event handler for mouseout
    const onMarkerLeave = (event) => {
        OpenLayers.Event.stop(event);
        const mapElement = document.getElementById("map");

        if (uiInteractionState === 0) {
            // If no interaction is active, remove temporary popup on mouseout
            mapElement.style.cursor = mapPointerStyle; // Restore default map cursor
            activeMapInstance.removePopup(featureToRender.popup);
        } else {
            mapElement.style.cursor = "default"; // Restore default if an interaction is active
        }
    };

    marker.events.register("click", featureToRender, onMarkerClick);
    marker.events.register("mouseover", featureToRender, onMarkerHover);
    marker.events.register("mouseout", featureToRender, onMarkerLeave);

    issueOverlayLayer.addMarker(marker);
}

/**
 * Handles clicks on the map itself (not on markers). Used for adding new issues.
 * @param {OpenLayers.Event} event - The OpenLayers click event.
 */
function handleMapClick(event) {
    if (uiInteractionState === 0) { // Only allow adding a new bug if no interaction is active
        const mapElement = document.getElementById("map");
        if (mapElement) mapElement.style.cursor = "crosshair"; // Change cursor to indicate drawing mode

        // Convert click coordinates to Mercator
        const clickPx = activeMapInstance.getEventPixel(event.xy);
        const lonLat = activeMapInstance.getLonLatFromPixel(clickPx);

        const newIssuePopup = new OpenLayers.Popup.FramedCloud(
            "newIssuePopup",
            new OpenLayers.LonLat(lonLat.lon, lonLat.lat),
            null, // Auto size
            renderNewIssueFormPopup(lonLat.lon, lonLat.lat, retrieveEphemeralData('reporterAliasCookie')), // Pass current lon/lat
            null,
            true // Close box enabled for new issue form
        );
        newIssuePopup.autoSize = true;
        newIssuePopup.panMapIfOutOfView = true;
        newIssuePopup.closeOnMove = false;
        newIssuePopup.keepInMap = true;
        newIssuePopup.events.register("featureunselected", newIssuePopup, cancelNewIssueForm); // If popup is closed by its own close button

        activeMapInstance.addPopup(newIssuePopup);
        uiInteractionState = 2; // Set state to "adding new bug"
        currentInteractiveFeature = { popup: newIssuePopup, lon: lonLat.lon, lat: lonLat.lat }; // Store temporary feature data
    } else if (uiInteractionState === 2) {
        // If already in "add new bug" mode, ignore subsequent map clicks.
        console.log('Already in new issue creation mode. Ignoring extra clicks.');
    }
}

/**
 * Submits the form for adding a new issue.
 * @param {HTMLFormElement} form - The form element.
 */
function submitNewIssueForm(form) {
    const descriptionInput = form.querySelector('#incidentDescription');
    if (!descriptionInput || descriptionInput.value.trim() === '') {
        alert(_('Please provide a description for the incident.'));
        return;
    }

    // Cache the nickname for future use.
    const aliasInput = form.querySelector('#reporterAlias');
    if (aliasInput && aliasInput.value.trim() !== '') {
        storeEphemeralData('reporterAliasCookie', aliasInput.value.trim());
    }

    // Update the popup content to show submission progress
    if (currentInteractiveFeature && currentInteractiveFeature.popup) {
        currentInteractiveFeature.popup.setContentHTML(renderIssueSubmissionProgressPopup());
    }

    submitFormViaXHR(form, "reportNewIssue",
        () => {
            // Optional: UI feedback before submission
        },
        (status, response) => {
            if (status >= 200 && status < 300) {
                alert(_('Incident reported successfully!'));
                // Force a refresh to show the new bug.
                updateDisplayedIssues();
            } else {
                alert(_('Failed to report incident. Server responded with status: ') + status + '\n' + response);
            }
            cancelNewIssueForm(); // Close the popup regardless of success/failure
        }
    );
}

/**
 * Cancels the new issue creation process and closes the popup.
 */
function cancelNewIssueForm() {
    if (currentInteractiveFeature && currentInteractiveFeature.popup) {
        activeMapInstance.removePopup(currentInteractiveFeature.popup);
    }
    uiInteractionState = 0;
    currentInteractiveFeature = null;
    const mapElement = document.getElementById("map");
    if (mapElement) mapElement.style.cursor = mapPointerStyle; // Restore default cursor
}

/**
 * Initiates the process of adding a comment to an existing issue.
 * @param {string|number} issueId - The ID of the issue to comment on.
 */
function addNoteToIssue(issueId) {
    const issue = getIssueDetails(issueId);
    if (!issue || !issue.mapFeature || !issue.mapFeature.popup) {
        console.error('Issue or its popup not found for adding comment:', issueId);
        return;
    }

    // Store original content to restore later
    issue.mapFeature.popup.originalContent = issue.mapFeature.popup.contentHTML;
    issue.mapFeature.popup.setContentHTML(renderAddCommentFormPopup(issue, retrieveEphemeralData('reporterAliasCookie')));
    uiInteractionState = 3; // State: adding comment
    currentInteractiveFeature = issue.mapFeature; // Keep track of which feature is being modified
}

/**
 * Submits the comment form for an issue.
 * @param {string|number} issueId - The ID of the issue.
 * @param {HTMLFormElement} form - The comment form element.
 */
function submitCommentToIssue(issueId, form) {
    const commentInput = form.querySelector('#commentContent');
    if (!commentInput || commentInput.value.trim() === '') {
        alert(_('Please enter your comment.'));
        return;
    }

    const aliasInput = form.querySelector('#commenterAlias');
    if (aliasInput && aliasInput.value.trim() !== '') {
        storeEphemeralData('reporterAliasCookie', aliasInput.value.trim());
    }

    // Placeholder for submission progress
    if (currentInteractiveFeature && currentInteractiveFeature.popup) {
        currentInteractiveFeature.popup.setContentHTML(`<h1>${_('Adding Note')}</h1><p>${_('Submitting your comment...')}</p>`);
    }

    submitFormViaXHR(form, "addIssueComment",
        null, // No specific action on submission start
        (status, response) => {
            if (status >= 200 && status < 300) {
                alert(_('Note added successfully!'));
                updateDisplayedIssues(); // Refresh to show new comment (if backend sends it with bug data)
            } else {
                alert(_('Failed to add note. Server responded with status: ') + status + '\n' + response);
            }
            restorePreviousPopup(issueId); // Restore original popup or close
        }
    );
}

/**
 * Initiates the process of closing an issue.
 * @param {string|number} issueId - The ID of the issue to close.
 */
function initiateIssueClosure(issueId) {
    const issue = getIssueDetails(issueId);
    if (!issue || !issue.mapFeature || !issue.mapFeature.popup) {
        console.error('Issue or its popup not found for closing:', issueId);
        return;
    }

    issue.mapFeature.popup.originalContent = issue.mapFeature.popup.contentHTML;
    issue.mapFeature.popup.setContentHTML(renderCloseIssueConfirmationPopup(issue, retrieveEphemeralData('reporterAliasCookie')));
    uiInteractionState = 4; // State: closing issue
    currentInteractiveFeature = issue.mapFeature;
}

/**
 * Submits the form for closing an issue.
 * @param {string|number} issueId - The ID of the issue.
 * @param {HTMLFormElement} form - The closure form element.
 */
function confirmIssueClosureSubmission(issueId, form) {
    const aliasInput = form.querySelector('#closerAlias');
    if (aliasInput && aliasInput.value.trim() !== '') {
        storeEphemeralData('reporterAliasCookie', aliasInput.value.trim());
    }

    if (currentInteractiveFeature && currentInteractiveFeature.popup) {
        currentInteractiveFeature.popup.setContentHTML(`<h1>${_('Resolving Incident')}</h1><p>${_('Submitting closure request...')}</p>`);
    }

    submitFormViaXHR(form, "closeIssue",
        null, // No specific action on submission start
        (status, response) => {
            if (status >= 200 && status < 300) {
                alert(_('Incident marked as resolved!'));
                updateDisplayedIssues(); // Refresh to show updated bug status
            } else {
                alert(_('Failed to mark incident as resolved. Server responded with status: ') + status + '\n' + response);
            }
            restorePreviousPopup(issueId); // Close or restore
        }
    );
}

/**
 * Restores the original popup content or closes the popup if no original content was saved.
 * @param {string|number} [issueId] - The ID of the issue whose popup should be restored/closed.
 */
function restorePreviousPopup(issueId) {
    const feature = issueId ? getIssueDetails(issueId)?.mapFeature : currentInteractiveFeature;

    if (feature && feature.popup) {
        if (feature.popup.originalContent) {
            feature.popup.setContentHTML(feature.popup.originalContent);
            delete feature.popup.originalContent; // Clean up
            uiInteractionState = 1; // Back to viewing an existing bug
            currentInteractiveFeature = feature;
        } else {
            // No original content, just close it.
            activeMapInstance.removePopup(feature.popup);
            uiInteractionState = 0;
            currentInteractiveFeature = null;
        }
    } else {
        // If no feature or popup, just reset state
        uiInteractionState = 0;
        currentInteractiveFeature = null;
    }
    const mapElement = document.getElementById("map");
    if (mapElement) mapElement.style.cursor = mapPointerStyle; // Restore default cursor
}

// Global translation function placeholder (assuming it's defined elsewhere)
if (typeof _ === 'undefined') {
    window._ = (str) => str; // Default passthrough if not provided
}