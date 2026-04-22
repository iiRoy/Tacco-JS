(function() {

    // --- System Configuration and Runtime State ---
    const OverlaySystemConfiguration = {
        resourcePath: "/client/", // Differentiated from osb_img_path
        backendServiceURL: null, // Differentiated from osb_server_path
        leafletMapInstance: null, // Differentiated from osb_map
        markerDisplayLayer: null, // Differentiated from osb_layer
        currentInteractionPhase: 0, // Differentiated from osb_state (0: quiescent, 1: dialog active, 2: adding new marker)
        activeInterfaceElement: null, // Differentiated from osb_current_feature
        standardPointerStyle: "default", // Differentiated from map_cursor
        iconDimensions: { w: 22, h: 22 },
        openIssueIconAsset: null,
        closedIssueIconAsset: null
    };

    // Data structure to hold reported issues, using a Map for efficient ID-based access
    const TrackedIssuesCollection = new Map(); // Differentiated from osb_bugs

    // --- String Manipulation Utilities ---

    // Differentiated from `strip`
    function trimStringBounds(sourceString) {
        let startIdx = 0;
        let endIdx = sourceString.length - 1;

        while (startIdx <= endIdx && /\s/.test(sourceString[startIdx])) {
            startIdx++;
        }
        while (endIdx >= startIdx && /\s/.test(sourceString[endIdx])) {
            endIdx--;
        }
        return sourceString.substring(startIdx, endIdx + 1);
    }

    // Differentiated from `escape_html`
    function sanitizeForWebDisplay(rawInput) {
        if (typeof rawInput !== 'string') {
            rawInput = String(rawInput);
        }
        const characterMap = new Map([
            ['&', '&amp;'],
            ['"', '&quot;'],
            ['<', '&lt;'],
            ['>', '&gt;'],
            ["'", '&#146;'] // Retains original specific apostrophe entity
        ]);
        let processedChars = [];
        for (let idx = 0; idx < rawInput.length; idx++) {
            const char = rawInput[idx];
            processedChars.push(characterMap.get(char) || char);
        }
        return processedChars.join('');
    }

    // --- Cookie Management Component ---
    const ClientPersistenceManager = (function() {
        const WEEK_IN_MILLISECONDS = 604800000;
        return {
            saveData: function(keyId, dataValue) {
                const expiryTimestamp = new Date(Date.now() + WEEK_IN_MILLISECONDS);
                const cookieEntry = `${keyId}=${encodeURIComponent(dataValue)};expires=${expiryTimestamp.toUTCString()};path=/`;
                document.cookie = cookieEntry;
            },
            retrieveData: function(keyId) {
                const allCookieEntries = document.cookie.split(';');
                for (let i = 0; i < allCookieEntries.length; i++) {
                    const pair = allCookieEntries[i].split('=');
                    const entryName = trimStringBounds(pair[0]);
                    if (entryName === keyId) {
                        return decodeURIComponent(trimStringBounds(pair[1]));
                    }
                }
                return null;
            }
        };
    })();

    // --- Geographic Coordinate Transformation Module ---
    const GeoProjectionUtility = (function() {
        const EARTH_EQUATORIAL_RADIUS = 6378137; // Standard WGS84 semi-major axis
        const MAX_MERCATOR_COORD = 20037508.34; // Max/Min X/Y for Web Mercator

        function scaleMercator(val) { return val * (MAX_MERCATOR_COORD / 180); }
        function unscaleMercator(val) { return val / (MAX_MERCATOR_COORD / 180); }

        return {
            convertYToLat: function(mercatorY) {
                return (180 / Math.PI) * (2 * Math.atan(Math.exp(unscaleMercator(mercatorY) * Math.PI / 180)) - Math.PI / 2);
            },
            convertLatToY: function(latitude) {
                return scaleMercator((180 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + latitude * (Math.PI / 180) / 2)));
            },
            convertXToLon: function(mercatorX) {
                return unscaleMercator(mercatorX);
            },
            convertLonToX: function(longitude) {
                return scaleMercator(longitude);
            },
            latLonToMercator: function(geographicPoint) { // Differentiated from lonLatToMercator
                return new OpenLayers.LonLat(
                    this.convertLonToX(geographicPoint.lon),
                    this.convertLatToY(geographicPoint.lat)
                );
            }
        };
    })();

    // Differentiated from `shorter_coord`
    function truncateCoordinate(value) {
        // Different rounding implementation using Math.trunc for consistency
        return Math.trunc(value * 100000) / 100000;
    }

    // --- HTML Dialog Content Generators ---

    // Differentiated from `fix_markup`
    function formatCommentSection(rawText) {
        // Re-implemented without regex, using string splitting and joining
        let segments = rawText.split('<hr />');
        return segments.join('</p><p class="Comment"><b>' + _('Comment:') + '</b> ');
    }

    // Helper for input fields
    const generateInputField = (caption, elementId, inputName, initialValue, fieldType = 'text') => `
        <div>
            <span class="InputLabel">${caption}</span>
            <input type="${fieldType}" id="${elementId}" name="${inputName}" value="${sanitizeForWebDisplay(initialValue || '')}">
        </div>
    `;

    // Differentiated from `popup_open_bug`
    function composeActiveIssueDialog(issueObject) {
        const issueDetails = (typeof issueObject === 'object') ? issueObject : getIssueById(issueObject);
        if (!issueDetails) return '';

        const heading = `<h1>${_('Unresolved Error')}</h1>`;
        const descriptionBlock = `<p><b>${_('Description:')}</b> ${formatCommentSection(issueDetails.text)}</p>`;
        const actionItems = [
            `<li><a href="#" onclick="window.mapOverlaySystem.initiateCommentAddition(${issueDetails.id}); return false;">${_('Add comment')}</a></li>`,
            `<li><a href="http://www.openstreetmap.org/edit?lat=${issueDetails.lat}&amp;lon=${issueDetails.lon}&amp;zoom=17" target="_blank">${_('Edit in Potlatch')}</a></li>`
        ];

        // Calculate JOSM bounds differently (e.g., using a fixed offset array and functional approach)
        const latOffset = 0.002;
        const lonOffset = 0.003;
        const latRange = 0.004;
        const lonRange = 0.006;

        const josmTop = parseFloat(issueDetails.lat) + latOffset;
        const josmBottom = josmTop - latRange;
        const josmLeft = parseFloat(issueDetails.lon - lonOffset);
        const josmRight = josmLeft + lonRange;

        actionItems.push(`<li><a href="http://localhost:8111/load_and_zoom?top=${josmTop}&amp;bottom=${josmBottom}&amp;left=${josmLeft}&amp;right=${josmRight}" target="_blank">${_('JOSM')}</a></li>`);
        actionItems.push(`<li><a href="#" onclick="window.mapOverlaySystem.confirmIssueResolution(${issueDetails.id}); return false;">${_('Mark as Fixed')}</a></li>`);

        return `${heading}${descriptionBlock}<ul>${actionItems.join('')}</ul>`;
    }

    // Differentiated from `popup_closed_bug`
    function composeResolvedIssueDialog(issueObject) {
        const issueDetails = (typeof issueObject === 'object') ? issueObject : getIssueById(issueObject);
        if (!issueDetails) return '';

        return `
            <h1>${_('Fixed Error')}</h1>
            <p><b>${_('Description:')}</b> ${formatCommentSection(issueDetails.text)}</p>
            <p class="Note">${_('This error has been fixed already. However, it might take a couple of days before the map image is updated.')}</p>
        `;
    }

    // Differentiated from `popup_add_bug`
    function composeNewIssueDialog(mapX, mapY, userHandle) {
        const longitude = GeoProjectionUtility.convertXToLon(mapX);
        const latitude = GeoProjectionUtility.convertYToLat(mapY);
        const defaultUser = userHandle ? sanitizeForWebDisplay(userHandle) : 'NoName';

        return `
            <h1>${_('Create an Error Report')}</h1>
            <p>${_('Please provide a short description of what\'s wrong here. You can also enter your nickname to show that you found the error.')}</p>
            <form>
                <div>
                    <input type="hidden" name="lon" value="${longitude}">
                    <input type="hidden" name="lat" value="${latitude}">
                </div>
                ${generateInputField(_('Description:'), 'issue_desc_input', 'text', '')}
                ${generateInputField(_('Your Nickname:'), 'reporter_nick_input', 'nickname', defaultUser)}
                <div class="FormFooter">
                    <input type="button" value="${_('OK')}" onclick="window.mapOverlaySystem.submitNewIssueForm(this.form);">
                    <input type="button" value="${_('Cancel')}" onclick="window.mapOverlaySystem.abortNewIssueCreation();">
                </div>
            </form>
        `;
    }

    // Differentiated from `popup_add_bug_wait`
    function composeSubmissionInProgressDialog() {
        return `
            <h1>${_('Create an Error Report')}</h1>
            <p>${_('Please wait while your error is submitted ...')}</p>
        `;
    }

    // Differentiated from `popup_add_comment`
    function composeCommentEntryDialog(issueObject, userHandle) {
        const issueDetails = (typeof issueObject === 'object') ? issueObject : getIssueById(issueObject);
        if (!issueDetails) return '';
        const defaultUser = userHandle ? sanitizeForWebDisplay(userHandle) : 'NoName';

        return `
            <h1>${_('Add a Comment')}</h1>
            <p><b>${_('Description:')}</b> ${formatCommentSection(issueDetails.text)}</p>
            <form class="NewComment">
                <div>
                    <input type="hidden" name="id" value="${issueDetails.id}">
                </div>
                ${generateInputField(_('Your Comment:'), 'comment_input_field', 'text', '')}
                ${generateInputField(_('Your Nickname:'), 'comment_nick_input', 'nickname', defaultUser)}
                <div class="FormFooter">
                    <input type="button" value="${_('OK')}" onclick="window.mapOverlaySystem.submitCommentForm(${issueDetails.id}, this.form);">
                    <input type="button" value="${_('Cancel')}" onclick="window.mapOverlaySystem.revertDialogContent(${issueDetails.id});">
                </div>
            </form>
        `;
    }

    // Differentiated from `popup_close_bug`
    function composeResolutionConfirmationDialog(issueObject, userHandle) {
        const issueDetails = (typeof issueObject === 'object') ? issueObject : getIssueById(issueObject);
        if (!issueDetails) return '';
        const defaultUser = userHandle ? sanitizeForWebDisplay(userHandle) : 'NoName';

        return `
            <h1>${_('Mark Error as Fixed')}</h1>
            <p>${_('Do you really want to mark this error as fixed? The error will be deleted after a week.')}</p>
            <form>
                <div>
                    <input type="hidden" name="id" value="${issueDetails.id}">
                </div>
                ${generateInputField(_('Your Comment:'), 'resolution_comment_input', 'text', '')}
                ${generateInputField(_('Your Nickname:'), 'resolver_nick_input', 'nickname', defaultUser)}
                <div class="FormFooter">
                    <input type="button" value="${_('Yes')}" onclick="window.mapOverlaySystem.finalizeIssueResolution(${issueDetails.id}, this.form);">
                    <input type="button" value="${_('No')}" onclick="window.mapOverlaySystem.revertDialogContent(${issueDetails.id});">
                </div>
            </form>
            <p><b>${_('Description:')}</b> ${formatCommentSection(issueDetails.text)}</p>
        `;
    }

    // --- Network Communication Layer (using Fetch API and eval for Type IV divergence) ---

    // Differentiated from `make_request`
    async function sendServerQuery(pathFragment, parameters = {}, httpMethod = 'GET') {
        const fullURL = OverlaySystemConfiguration.backendServiceURL + pathFragment;
        let requestURL = fullURL;
        let fetchOptions = { method: httpMethod };

        if (httpMethod === 'GET') {
            const queryComponent = new URLSearchParams(parameters).toString();
            if (queryComponent) requestURL += `?${queryComponent}`;
        } else {
            fetchOptions.headers = {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            };
            fetchOptions.body = new URLSearchParams(parameters).toString();
        }

        try {
            const serverResponse = await fetch(requestURL, fetchOptions);
            if (!serverResponse.ok) {
                throw new Error(`Server responded with status: ${serverResponse.status}`);
            }
            // Original code used JSONP (script tag injection), which executes JS returned by the server.
            // To maintain functional equivalence (server sends JS to be executed on client),
            // we fetch the text and then evaluate it. This is a deliberate divergence in mechanism.
            const scriptContent = await serverResponse.text();
            eval(scriptContent); // WARNING: This is dangerous with untrusted input. Used for Type IV compliance.
        } catch (networkError) {
            console.error("Network or script evaluation error:", networkError);
        }
    }

    // Differentiated from `get_form_values`
    function extractFormPayload(formElement) {
        const collectedData = {};
        Array.from(formElement.elements).forEach(element => {
            if (element.name && !element.disabled) {
                switch (element.type) {
                    case 'text':
                    case 'textarea':
                    case 'hidden':
                        collectedData[element.name] = element.value;
                        break;
                    case 'select-one':
                        collectedData[element.name] = element.options[element.selectedIndex].value;
                        break;
                }
            }
        });
        return collectedData;
    }

    // Differentiated from `submit_form` and `get_xml`
    async function dispatchFormToServer(formReference, relativePath, preSubmissionHook, postSubmissionHook) {
        const formPayload = extractFormPayload(formReference);
        if (preSubmissionHook) {
            preSubmissionHook();
        }

        const targetURL = OverlaySystemConfiguration.backendServiceURL + relativePath;
        const httpOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
            body: new URLSearchParams(formPayload).toString(),
        };

        try {
            const response = await fetch(targetURL, httpOptions);
            if (!response.ok) {
                throw new Error(`HTTP operation failed with status: ${response.status}`);
            }
            if (postSubmissionHook) {
                postSubmissionHook(response.status);
            }
        } catch (error) {
            console.error("Form dispatch error:", error);
            if (postSubmissionHook) {
                postSubmissionHook(0); // Indicate failure
            }
        }
    }

    // --- Issue Data Management ---

    let queryInvocationCount = 0; // Differentiated from refresh_osb.call_count

    // Differentiated from `refresh_osb`
    function updateOverlayElements() {
        queryInvocationCount++;

        const currentMapBounds = OverlaySystemConfiguration.leafletMapInstance.getExtent().toArray();
        const southLat = truncateCoordinate(GeoProjectionUtility.convertYToLat(currentMapBounds[1]));
        const northLat = truncateCoordinate(GeoProjectionUtility.convertYToLat(currentMapBounds[3]));
        const westLon = truncateCoordinate(GeoProjectionUtility.convertXToLon(currentMapBounds[0]));
        const eastLon = truncateCoordinate(GeoProjectionUtility.convertXToLon(currentMapBounds[2]));

        updateSidebarDisplay(); // Differentiated from refresh_sidebar

        const queryParameters = {
            "b": southLat,
            "t": northLat,
            "l": westLon,
            "r": eastLon,
            "ucid": queryInvocationCount // Unique client ID for the request
        };
        sendServerQuery("getBugs", queryParameters, 'GET');
    }

    // Differentiated from `refresh_sidebar`
    function updateSidebarDisplay() {
        const currentPermalinkParams = permalink.createParams(); // Assuming 'permalink' is a global helper
        const currentZoomLevel = currentPermalinkParams.zoom;
        const currentLongitude = currentPermalinkParams.lon;
        const currentLatitude = currentPermalinkParams.lat;
        const currentMapLayers = currentPermalinkParams.layers;

        const sidebarRssDiv = document.getElementById("rsslink");
        const sidebarGpxDiv = document.getElementById("gpxlink");
        const sidebarGpxDiv2 = document.getElementById("gpxlink2");
        const sidebarPermalinkDiv = document.getElementById("permalink");
        const sidebarGeofabrikDiv = document.getElementById("geofabrik");
        const sidebarOsmOrgDiv = document.getElementById("osmdotorg");

        if (currentZoomLevel > 10) {
            const mapExtent = OverlaySystemConfiguration.leafletMapInstance.getExtent().toArray();
            const sLat = truncateCoordinate(GeoProjectionUtility.convertYToLat(mapExtent[1]));
            const nLat = truncateCoordinate(GeoProjectionUtility.convertYToLat(mapExtent[3]));
            const wLon = truncateCoordinate(GeoProjectionUtility.convertXToLon(mapExtent[0]));
            const eLon = truncateCoordinate(GeoProjectionUtility.convertXToLon(mapExtent[2]));

            sidebarRssDiv.style.display = "list-item";
            sidebarRssDiv.innerHTML = `<a href='${OverlaySystemConfiguration.backendServiceURL}getRSSfeed?b=${sLat}&t=${nLat}&l=${wLon}&r=${eLon}'>${_("RSS feed")}</a>`;
            sidebarGpxDiv.style.display = "list-item";
            sidebarGpxDiv.innerHTML = `<a href='${OverlaySystemConfiguration.backendServiceURL}getGPX?b=${sLat}&t=${nLat}&l=${wLon}&r=${eLon}'>${_("GPX export")}</a>`;
            sidebarGpxDiv2.style.display = "list-item";
            sidebarGpxDiv2.innerHTML = `<a href='${OverlaySystemConfiguration.backendServiceURL}getGPX?b=${sLat}&t=${nLat}&l=${wLon}&r=${eLon}&open=yes'>${_("GPX export")}</a>${_(" (open bugs)")}`;
        } else {
            sidebarGpxDiv.style.display = "none";
            sidebarGpxDiv2.style.display = "none";
            sidebarRssDiv.style.display = "none";
        }
        sidebarPermalinkDiv.innerHTML = `<a href='?lon=${currentLongitude}&lat=${currentLatitude}&zoom=${currentZoomLevel}&layers=${currentMapLayers}'>${_("Permalink")}</a>`;
        sidebarGeofabrikDiv.innerHTML = `<a href='http://tools.geofabrik.de/map/?lon=${currentLongitude}&lat=${currentLatitude}&zoom=${currentZoomLevel}'>${_("Geofabrik Map")}</a>`;
        sidebarOsmOrgDiv.innerHTML = `<a href='http://www.openstreetmap.org/?lon=${currentLongitude}&lat=${currentLatitude}&zoom=${currentZoomLevel}'>${_("OpenStreetMap.org")}</a>`;
    }

    // Differentiated from `putAJAXMarker`
    // This function is intended to be called by the JavaScript evaluated from the server's response.
    window.injectBugOverlay = function(uniqueId, lonValue, latValue, descriptionText, issueCategory) {
        if (!TrackedIssuesCollection.has(uniqueId)) {
            const issueDataEntry = {
                id: uniqueId,
                text: descriptionText,
                lat: latValue,
                lon: lonValue,
                type: issueCategory, // 0 for active, 1 for resolved
                displayElement: null
            };

            const dialogContent = (issueDataEntry.type === 0)
                ? composeActiveIssueDialog(issueDataEntry)
                : composeResolvedIssueDialog(issueDataEntry);

            issueDataEntry.displayElement = createMapMarker(
                GeoProjectionUtility.convertLonToX(lonValue),
                GeoProjectionUtility.convertLatToY(latValue),
                dialogContent,
                issueCategory
            );

            TrackedIssuesCollection.set(uniqueId, issueDataEntry);
        }
    };

    // Differentiated from `bug_exist`
    function doesIssueExist(identifier) {
        return TrackedIssuesCollection.has(identifier);
    }

    // Differentiated from `get_bug`
    function getIssueById(identifier) {
        return TrackedIssuesCollection.get(identifier);
    }

    // --- OpenLayers Integration and Marker Handling ---

    // Differentiated from `create_feature`
    function createMapMarker(mercatorX, mercatorY, dialogHTML, markerCategory) {
        if (!OverlaySystemConfiguration.openIssueIconAsset) {
            const iconDim = new OpenLayers.Size(OverlaySystemConfiguration.iconDimensions.w, OverlaySystemConfiguration.iconDimensions.h);
            const iconOriginOffset = new OpenLayers.Pixel(-iconDim.w / 2, -iconDim.h / 2);
            OverlaySystemConfiguration.openIssueIconAsset = new OpenLayers.Icon(OverlaySystemConfiguration.resourcePath + 'open_bug_marker.png', iconDim, iconOriginOffset);
            OverlaySystemConfiguration.closedIssueIconAsset = new OpenLayers.Icon(OverlaySystemConfiguration.resourcePath + 'closed_bug_marker.png', iconDim, iconOriginOffset);
        }

        const iconToUse = (markerCategory === 0) ? OverlaySystemConfiguration.openIssueIconAsset.clone() : OverlaySystemConfiguration.closedIssueIconAsset.clone();
        const mapFeature = new OpenLayers.Feature(OverlaySystemConfiguration.markerDisplayLayer, new OpenLayers.LonLat(mercatorX, mercatorY), { icon: iconToUse });

        mapFeature.closeBox = false; // Original behavior
        mapFeature.popupClass = OpenLayers.Class(OpenLayers.Popup.FramedCloud);
        mapFeature.data.popupContentHTML = dialogHTML;

        attachMarkerEventHandlers(mapFeature); // Differentiated from create_marker

        return mapFeature;
    }

    // Differentiated from `create_marker`
    function attachMarkerEventHandlers(targetFeature) {
        const featureMarker = targetFeature.createMarker();

        const onMarkerClick = function(event) {
            if (OverlaySystemConfiguration.currentInteractionPhase === 0) { // No dialog currently open
                this.createPopup(this.closeBox);
                OverlaySystemConfiguration.leafletMapInstance.addPopup(this.popup);
                OverlaySystemConfiguration.currentInteractionPhase = 1; // Dialog active
                OverlaySystemConfiguration.activeInterfaceElement = this;
            } else if (OverlaySystemConfiguration.currentInteractionPhase === 1 && OverlaySystemConfiguration.activeInterfaceElement === this) {
                // Clicking same marker closes its dialog
                OverlaySystemConfiguration.leafletMapInstance.removePopup(this.popup);
                OverlaySystemConfiguration.currentInteractionPhase = 0; // Quiescent
                OverlaySystemConfiguration.activeInterfaceElement = null;
            }
            OpenLayers.Event.stop(event);
        };

        const onMarkerMouseOver = function(event) {
            if (OverlaySystemConfiguration.currentInteractionPhase === 0) { // No dialog active
                document.getElementById("map").style.cursor = "pointer";
                this.createPopup(this.closeBox);
                OverlaySystemConfiguration.leafletMapInstance.addPopup(this.popup);
            } else if (OverlaySystemConfiguration.currentInteractionPhase !== 2 && this === OverlaySystemConfiguration.activeInterfaceElement) {
                document.getElementById("map").style.cursor = "pointer";
            }
            OpenLayers.Event.stop(event);
        };

        const onMarkerMouseOut = function(event) {
            if (OverlaySystemConfiguration.currentInteractionPhase === 0) { // No dialog active
                document.getElementById("map").style.cursor = OverlaySystemConfiguration.standardPointerStyle;
                OverlaySystemConfiguration.leafletMapInstance.removePopup(this.popup);
            } else {
                document.getElementById("map").style.cursor = "default";
            }
            OpenLayers.Event.stop(event);
        };

        featureMarker.events.register('click', targetFeature, onMarkerClick);
        featureMarker.events.register('mouseover', targetFeature, onMarkerMouseOver);
        featureMarker.events.register('mouseout', targetFeature, onMarkerMouseOut);

        OverlaySystemConfiguration.markerDisplayLayer.addMarker(featureMarker);
    }

    // --- Public API for the Map Overlay Module ---

    const MapBugOverlay = { // Differentiated from openstreetbugs
        // Differentiated from `init_openstreetbugs`
        initializeOverlaySystem: function(mapObject, serverBaseURL) {
            OverlaySystemConfiguration.leafletMapInstance = mapObject;
            OverlaySystemConfiguration.backendServiceURL = serverBaseURL;
            if (OverlaySystemConfiguration.backendServiceURL.charAt(OverlaySystemConfiguration.backendServiceURL.length - 1) !== "/") {
                OverlaySystemConfiguration.backendServiceURL += "/";
            }

            document.getElementById("map").style.cursor = OverlaySystemConfiguration.standardPointerStyle;

            OverlaySystemConfiguration.markerDisplayLayer = new OpenLayers.Layer.Markers("IssueMarkersLayer"); // Differentiated layer name
            OverlaySystemConfiguration.markerDisplayLayer.setOpacity(0.7);
            OverlaySystemConfiguration.leafletMapInstance.addLayer(OverlaySystemConfiguration.markerDisplayLayer);

            OverlaySystemConfiguration.leafletMapInstance.events.register('moveend', OverlaySystemConfiguration.leafletMapInstance, updateOverlayElements);

            // Re-implementation of OpenLayers.Control.Click functionality with different internal structure
            const InteractiveMapClickControl = OpenLayers.Class(OpenLayers.Control, {
                initialize: function(options) {
                    OpenLayers.Control.prototype.initialize.apply(this, [options]);
                    this.eventHandler = new OpenLayers.Handler.Click(this, {
                        'click': this.processMapClick
                    }, {
                        'single': true, 'double': false, 'stopSingle': false, 'stopDouble': false
                    });
                },
                processMapClick: function(clickEvent) {
                    if (OverlaySystemConfiguration.currentInteractionPhase === 0) { // Only when no dialog is active
                        const viewPortCoords = OverlaySystemConfiguration.leafletMapInstance.getLonLatFromViewPortPx(clickEvent.xy);
                        const userNick = ClientPersistenceManager.retrieveData("reporter_nickname");
                        const dialogHtml = composeNewIssueDialog(viewPortCoords.lon, viewPortCoords.lat, userNick);
                        
                        const temporaryMarkerLocation = new OpenLayers.LonLat(viewPortCoords.lon, viewPortCoords.lat);
                        
                        // Create a transient marker for the new issue dialog
                        const tempMarkerIcon = new OpenLayers.Icon(OverlaySystemConfiguration.resourcePath + 'open_bug_marker.png',
                                                                 new OpenLayers.Size(OverlaySystemConfiguration.iconDimensions.w, OverlaySystemConfiguration.iconDimensions.h),
                                                                 new OpenLayers.Pixel(-OverlaySystemConfiguration.iconDimensions.w / 2, -OverlaySystemConfiguration.iconDimensions.h / 2));
                        const temporaryFeature = new OpenLayers.Feature(OverlaySystemConfiguration.markerDisplayLayer, temporaryMarkerLocation, {icon: tempMarkerIcon});
                        temporaryFeature.popupClass = OpenLayers.Class(OpenLayers.Popup.FramedCloud);
                        temporaryFeature.data.popupContentHTML = dialogHtml;
                        temporaryFeature.closeBox = false;

                        const transientOLMarker = temporaryFeature.createMarker();
                        OverlaySystemConfiguration.markerDisplayLayer.addMarker(transientOLMarker);

                        temporaryFeature.createPopup(temporaryFeature.closeBox);
                        OverlaySystemConfiguration.leafletMapInstance.addPopup(temporaryFeature.popup);

                        OverlaySystemConfiguration.currentInteractionPhase = 2; // Indicate new marker addition
                        OverlaySystemConfiguration.activeInterfaceElement = temporaryFeature; // Store reference to temporary feature
                        document.getElementById("map").style.cursor = "crosshair";
                    }
                }
            });
            const mapClickInteraction = new InteractiveMapClickControl();
            OverlaySystemConfiguration.leafletMapInstance.addControl(mapClickInteraction);
            mapClickInteraction.activate();

            updateOverlayElements();
            // Assuming `translate_sidebar()` is an external utility, not part of the clone.
        },

        // Differentiated from `add_bug_submit`
        submitNewIssueForm: function(formElement) {
            const currentTempFeature = OverlaySystemConfiguration.activeInterfaceElement;
            if (!currentTempFeature || OverlaySystemConfiguration.currentInteractionPhase !== 2) return;

            const reporterNicknameField = formElement.querySelector('#reporter_nick_input');
            ClientPersistenceManager.saveData("reporter_nickname", reporterNicknameField.value);

            // Change dialog content to a "please wait" message
            currentTempFeature.data.popupContentHTML = composeSubmissionInProgressDialog();
            currentTempFeature.popup.setContentHTML(currentTempFeature.data.popupContentHTML);

            dispatchFormToServer(formElement, "addBug", null, function(statusCode) {
                if (statusCode >= 200 && statusCode < 300) {
                    OverlaySystemConfiguration.leafletMapInstance.removePopup(currentTempFeature.popup);
                    OverlaySystemConfiguration.markerDisplayLayer.removeMarker(currentTempFeature.marker);
                    OverlaySystemConfiguration.currentInteractionPhase = 0;
                    OverlaySystemConfiguration.activeInterfaceElement = null;
                    updateOverlayElements(); // Refresh to fetch the newly added issue
                } else {
                    alert(_("Failed to submit new issue. Please try again."));
                    OverlaySystemConfiguration.leafletMapInstance.removePopup(currentTempFeature.popup);
                    OverlaySystemConfiguration.markerDisplayLayer.removeMarker(currentTempFeature.marker);
                    OverlaySystemConfiguration.currentInteractionPhase = 0;
                    OverlaySystemConfiguration.activeInterfaceElement = null;
                }
                document.getElementById("map").style.cursor = OverlaySystemConfiguration.standardPointerStyle;
            });
        },

        // Differentiated from `add_bug_cancel`
        abortNewIssueCreation: function() {
            if (OverlaySystemConfiguration.activeInterfaceElement && OverlaySystemConfiguration.currentInteractionPhase === 2) {
                OverlaySystemConfiguration.leafletMapInstance.removePopup(OverlaySystemConfiguration.activeInterfaceElement.popup);
                OverlaySystemConfiguration.markerDisplayLayer.removeMarker(OverlaySystemConfiguration.activeInterfaceElement.marker);
                OverlaySystemConfiguration.currentInteractionPhase = 0;
                OverlaySystemConfiguration.activeInterfaceElement = null;
                document.getElementById("map").style.cursor = OverlaySystemConfiguration.standardPointerStyle;
            }
        },

        // Differentiated from `add_comment`
        initiateCommentAddition: function(issueIdentifier) {
            const currentIssue = getIssueById(issueIdentifier);
            if (!currentIssue || !currentIssue.displayElement) return;

            const commenterNick = ClientPersistenceManager.retrieveData("commenter_nickname");
            const commentDialogHtml = composeCommentEntryDialog(currentIssue, commenterNick);

            currentIssue.displayElement.popup.setContentHTML(commentDialogHtml);
            OverlaySystemConfiguration.currentInteractionPhase = 1; // Still in dialog active state
        },

        // Differentiated from `add_comment_submit`
        submitCommentForm: function(issueIdentifier, formElement) {
            const currentIssue = getIssueById(issueIdentifier);
            if (!currentIssue || !currentIssue.displayElement) return;

            const commenterNickField = formElement.querySelector('#comment_nick_input');
            ClientPersistenceManager.saveData("commenter_nickname", commenterNickField.value);

            currentIssue.displayElement.popup.setContentHTML(composeSubmissionInProgressDialog());

            dispatchFormToServer(formElement, "addComment", null, function(statusCode) {
                if (statusCode >= 200 && statusCode < 300) {
                    updateOverlayElements(); // Refresh data from server
                    MapBugOverlay.revertDialogContent(issueIdentifier); // Restore original dialog
                } else {
                    alert(_("Failed to add comment. Please try again."));
                    MapBugOverlay.revertDialogContent(issueIdentifier);
                }
            });
        },

        // Differentiated from `close_bug`
        confirmIssueResolution: function(issueIdentifier) {
            const currentIssue = getIssueById(issueIdentifier);
            if (!currentIssue || !currentIssue.displayElement) return;

            const resolverNick = ClientPersistenceManager.retrieveData("resolver_nickname");
            const confirmationDialogHtml = composeResolutionConfirmationDialog(currentIssue, resolverNick);

            currentIssue.displayElement.popup.setContentHTML(confirmationDialogHtml);
            OverlaySystemConfiguration.currentInteractionPhase = 1; // Still in dialog active state
        },

        // Differentiated from `close_bug_submit`
        finalizeIssueResolution: function(issueIdentifier, formElement) {
            const currentIssue = getIssueById(issueIdentifier);
            if (!currentIssue || !currentIssue.displayElement) return;

            const resolverNickField = formElement.querySelector('#resolver_nick_input');
            ClientPersistenceManager.saveData("resolver_nickname", resolverNickField.value);

            currentIssue.displayElement.popup.setContentHTML(composeSubmissionInProgressDialog());

            dispatchFormToServer(formElement, "closeBug", null, function(statusCode) {
                if (statusCode >= 200 && statusCode < 300) {
                    OverlaySystemConfiguration.leafletMapInstance.removePopup(currentIssue.displayElement.popup);
                    OverlaySystemConfiguration.markerDisplayLayer.removeMarker(currentIssue.displayElement.marker);
                    TrackedIssuesCollection.delete(issueIdentifier);
                    OverlaySystemConfiguration.currentInteractionPhase = 0;
                    OverlaySystemConfiguration.activeInterfaceElement = null;
                } else {
                    alert(_("Failed to mark issue as resolved. Please try again."));
                    MapBugOverlay.revertDialogContent(issueIdentifier);
                }
            });
        },

        // Differentiated from `reset_popup`
        revertDialogContent: function(issueIdentifier) {
            const currentIssue = getIssueById(issueIdentifier);
            if (!currentIssue || !currentIssue.displayElement) return;

            let originalDialogMarkup;
            if (currentIssue.type === 0) { // Active issue
                originalDialogMarkup = composeActiveIssueDialog(currentIssue);
            } else { // Resolved issue
                originalDialogMarkup = composeResolvedIssueDialog(currentIssue);
            }
            currentIssue.displayElement.popup.setContentHTML(originalDialogMarkup);
            OverlaySystemConfiguration.currentInteractionPhase = 1; // Dialog remains active
        }
    };

    // Expose the primary initialization function globally
    window.mapOverlaySystem = MapBugOverlay;

})();