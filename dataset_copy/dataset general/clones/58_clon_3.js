(function () {
    // Establish a reference to the global object, typically `window` in browsers or `global` in Node.js.
    const appGlobalContext = this;

    /**
     * Formats a numeric value by adding thousands separators (commas).
     *
     * @param {number|string} inputNumber The number to format.
     * @returns {string} The formatted string.
     */
    appGlobalContext.formatNumberWithCommas = function (inputNumber) {
        if (typeof inputNumber === 'undefined' || inputNumber === null) {
            console.warn("formatNumberWithCommas received null/undefined input, returning empty string.");
            return '';
        }
        let stringifiedNumber = String(inputNumber); // Ensure it's a string for regex operations.
        const separatorPattern = /(\d+)(\d{3})/; // Regex to find groups of three digits.
        let iterationCount = 0; // Guard against infinite loops for malformed input.
        const MAX_ITERATIONS = 10;

        // Loop until no more matches are found, inserting commas.
        while (separatorPattern.test(stringifiedNumber) && iterationCount < MAX_ITERATIONS) {
            stringifiedNumber = stringifiedNumber.replace(separatorPattern, "$1,$2");
            iterationCount++;
        }
        return stringifiedNumber;
    };

    /**
     * Converts a number to a percentage string, rounded to a specified number of decimal places.
     * Includes a default for decimal places.
     *
     * @param {number} rawValue The numeric value to convert.
     * @param {number} [decimalDigits=1] The number of decimal places for rounding.
     * @returns {string} The formatted percentage string.
     */
    appGlobalContext.convertToPercentage = function (rawValue, decimalDigits = 1) {
        if (typeof rawValue !== 'number' || isNaN(rawValue)) {
            console.error("convertToPercentage received non-numeric input:", rawValue);
            return 'N/A%';
        }
        // Ensure decimalDigits is a non-negative integer.
        const effectiveDecimals = Math.max(0, Math.floor(decimalDigits));

        // Multiply by 100 to get percentage, then round.
        const multiplier = Math.pow(10, effectiveDecimals);
        const roundedValue = Math.round(rawValue * 100 * multiplier) / multiplier;

        return `${roundedValue.toFixed(effectiveDecimals)}%`;
    };

    // Configuration for the color gradient used in the visualization.
    // Utilizes the chroma.js library for advanced color scaling.
    const visualColorGradient = chroma.scale(['#1e90ff', "#ffffff", '#ff4500']) // DodgerBlue, White, OrangeRed
        .domain([0.0, 0.30, 0.60], 15) // Define the color stops and number of samples.
        .mode('lch'); // Use LCH color space for perceptually uniform transitions.

    /**
     * Retrieves a hexadecimal color string from the predefined color gradient based on a percentage value.
     * Includes basic input validation and a simple cache.
     *
     * @param {number} percentageValue A value between 0 and 1 representing the position on the gradient.
     * @returns {string} The hexadecimal color string.
     */
    const getGradientHexColor = (percentageValue) => {
        if (typeof percentageValue !== 'number' || isNaN(percentageValue)) {
            console.error("getGradientHexColor received invalid percentageValue:", percentageValue);
            return '#cccccc'; // Default grey color for invalid input.
        }
        // Clamp the value to ensure it's within the [0, 1] range.
        const clampedPct = Math.max(0, Math.min(1, percentageValue));
        return visualColorGradient(clampedPct).hex();
    };

    /**
     * Generates the HTML markup for the interactive legend display.
     * This legend visually represents the color scale.
     *
     * @returns {string} The complete HTML string for the legend.
     */
    const generateDisplayKeyHtml = () => {
        const totalSegments = 12; // Number of color bars in the legend.
        const maximumDisplayedValue = 0.55; // Represents 55% at the end of the scale.

        let segmentBarsMarkup = '';
        const segmentWidth = 100 / totalSegments;

        // Create individual color bars for the legend.
        for (let i = 0; i < totalSegments; i++) {
            const currentPercentage = maximumDisplayedValue * i / (totalSegments - 1); // Adjust for 0-indexed loop
            const barColor = getGradientHexColor(currentPercentage);
            segmentBarsMarkup += `<div class='map-legend-bar' style='width: ${segmentWidth}%; background: ${barColor};'></div>`;
        }

        // Assemble the full legend HTML structure.
        const fullLegendHtml = `
            <div class='map-legend-container'>
                <div class='map-legend-bars'>${segmentBarsMarkup}</div>
                <div class='map-legend-labels'>
                    <span class='map-legend-label-start'>0%</span>
                    <span class='map-legend-label-mid'>Female Participation Rate</span>
                    <span class='map-legend-label-end'>${appGlobalContext.convertToPercentage(maximumDisplayedValue, 0)}+</span>
                </div>
            </div>`;
        return fullLegendHtml;
    };

    /**
     * Initializes and returns a Leaflet control for displaying information about stations.
     * This panel updates dynamically based on user interaction (hover/click).
     *
     * @returns {L.Control} The Leaflet information control.
     */
    const createDynamicInfoPanel = () => {
        const infoDisplay = L.control({ position: 'topright' }); // Position control at top-right.

        // Get templates from the DOM using jQuery.
        // Ensure that these templates exist in the HTML with the specified classes.
        const stationDetailViewTemplate = _.template($(".tmpl.station-details").html() || "<div>Station details not available.</div>");
        
        // Default message displayed when no station is highlighted.
        const userGuidanceHtml = `
            <div class='interaction-guide'>
                <p class='guide-main'><strong>Hover over a circle</strong> for station specifics. Double-click to zoom in.</p>
                <p class='guide-mobile'><strong>Tap a circle</strong> to view station details.</p>
            </div>`;
        
        const generatedLegendHtml = generateDisplayKeyHtml();
        const initialPanelContent = userGuidanceHtml + generatedLegendHtml;

        // Method to be called when the control is added to the map.
        infoDisplay.onAdd = function (mapRef) {
            this._uiDiv = L.DomUtil.create('div', 'map-data-panel leaflet-control');
            L.DomEvent.disableClickPropagation(this._uiDiv); // Prevent map clicks when interacting with panel.
            L.DomEvent.disableScrollPropagation(this._uiDiv); // Prevent map scroll when interacting with panel.
            this.refreshContent(); // Initialize content.
            return this._uiDiv;
        };

        // Method to update the panel's content.
        infoDisplay.refreshContent = function (stationDataObject) {
            let contentToDisplay;
            if (stationDataObject && stationDataObject.stationName) { // Check for a valid station object.
                // Augment station data with formatted values before rendering.
                const enrichedStationData = {
                    ...stationDataObject,
                    formattedTripsTotal: appGlobalContext.formatNumberWithCommas(stationDataObject.trips_total),
                    formattedFemalePct: appGlobalContext.convertToPercentage(stationDataObject.fpct_total),
                    // Add other formatted fields as needed
                };
                contentToDisplay = stationDetailViewTemplate(enrichedStationData);
            } else {
                contentToDisplay = initialPanelContent;
            }
            this._uiDiv.innerHTML = contentToDisplay;
            // Add a small delay for smoother UI updates, preventing rapid flickers.
            // clearTimeout(this._updateTimer);
            // this._updateTimer = setTimeout(() => { this._uiDiv.innerHTML = contentToDisplay; }, 50);
        };

        return infoDisplay;
    };

    /**
     * Applies a highlighting style to a given Leaflet marker and updates the info panel.
     *
     * @param {L.CircleMarker} targetMarker The marker to highlight.
     * @param {L.Control} infoPanelRef Reference to the info panel control.
     */
    const applyMarkerHighlight = (targetMarker, infoPanelRef) => {
        if (!targetMarker || !infoPanelRef) {
            console.warn("Missing marker or info panel for highlight operation.");
            return;
        }

        // Store original styles to revert later.
        targetMarker._cachedStyles = targetMarker.options;

        targetMarker.setStyle({
            fillColor: "#ffcc00", // Bright yellow for highlight.
            weight: 3, // Thicker border.
            opacity: 1,
            color: "#333", // Darker border color.
            fillOpacity: 0.9
        });
        targetMarker.bringToFront(); // Ensure highlighted marker is on top.
        infoPanelRef.refreshContent(targetMarker.stationData); // Update info panel with station details.
        console.log(`Marker "${targetMarker.stationData.stationName}" highlighted.`);
    };

    /**
     * Resets a Leaflet marker to its original style and clears the info panel.
     *
     * @param {L.CircleMarker} targetMarker The marker to reset.
     * @param {L.Control} infoPanelRef Reference to the info panel control.
     */
    const revertMarkerStyle = (targetMarker, infoPanelRef) => {
        if (!targetMarker || !infoPanelRef || !targetMarker._cachedStyles) {
            // console.warn("Missing marker, info panel, or cached styles for reset operation.");
            return;
        }
        targetMarker.setStyle(targetMarker._cachedStyles);
        infoPanelRef.refreshContent(); // Clear info panel or show default message.
    };

    /**
     * Zooms the map to a specific marker's location.
     *
     * @param {L.CircleMarker} targetMarker The marker to zoom to.
     * @param {L.Map} currentMap The Leaflet map instance.
     */
    const focusMapOnMarker = (targetMarker, currentMap) => {
        if (!targetMarker || !targetMarker.getLatLng || !currentMap) {
            console.warn("Invalid marker or map for zoom operation.");
            return;
        }
        const currentZoom = currentMap.getZoom();
        const targetZoom = Math.min(currentMap.getMaxZoom(), currentZoom + 2); // Zoom in by 2 levels, maxing out at map's max.
        currentMap.setView(targetMarker.getLatLng(), targetZoom, { animate: true, duration: 0.7 });
        console.log(`Zoomed to marker at ${targetMarker.getLatLng().lat}, ${targetMarker.getLatLng().lng}`);
    };

    /**
     * Pans the map to center on a specific marker's location.
     *
     * @param {L.CircleMarker} targetMarker The marker to pan to.
     * @param {L.Map} currentMap The Leaflet map instance.
     */
    const centerMapOnMarker = (targetMarker, currentMap) => {
        if (!targetMarker || !targetMarker.getLatLng || !currentMap) {
            console.warn("Invalid marker or map for pan operation.");
            return;
        }
        currentMap.panTo(targetMarker.getLatLng(), { animate: true, duration: 0.5 });
        console.log(`Panned to marker at ${targetMarker.getLatLng().lat}, ${targetMarker.getLatLng().lng}`);
    };

    /**
     * Calculates the radius for a Leaflet circle marker based on total trips.
     *
     * @param {number} currentTotal The total trips for the current station.
     * @param {number} overallMax The maximum trip count among all stations.
     * @returns {number} The calculated radius.
     */
    const computeMarkerRadius = (currentTotal, overallMax) => {
        if (overallMax === 0) return 3; // Prevent division by zero.
        const normalizedValue = currentTotal / overallMax;
        // Use a logarithmic scale for better visual distinction across wide ranges.
        const scaledRadius = 5 + Math.log10(normalizedValue * 100 + 1) * 3; // Base radius + log-scaled part.
        return Math.max(3, scaledRadius); // Minimum radius of 3.
    };

    /**
     * Creates Leaflet circle markers for each station data point.
     *
     * @param {Array<Object>} stationRecords An array of station data objects.
     * @param {L.Map} mapInstance The Leaflet map instance.
     * @param {L.Control} infoPanel The info panel control.
     * @returns {Array<L.CircleMarker>} An array of created Leaflet markers.
     */
    const generateDataPointMarkers = (stationRecords, mapInstance, infoPanel) => {
        if (!Array.isArray(stationRecords) || stationRecords.length === 0) {
            console.warn("No station records provided for marker generation.");
            return [];
        }

        // Extract all trip totals to find the maximum for radius scaling.
        const allTripCounts = stationRecords.map(s => s.trips_total || 0);
        const maxOverallTripCount = allTripCounts.length > 0 ? Math.max(...allTripCounts) : 1; // Avoid zero.

        // Helper function for marker event handling.
        const onMarkerEvent = (e) => {
            const currentTargetMarker = e.target;
            switch (e.type) {
                case 'mouseover':
                    applyMarkerHighlight(currentTargetMarker, infoPanel);
                    break;
                case 'mouseout':
                    revertMarkerStyle(currentTargetMarker, infoPanel);
                    break;
                case 'dblclick':
                    focusMapOnMarker(currentTargetMarker, mapInstance);
                    break;
                // Add an 'add' event listener if needed for DOM manipulation
                // case 'add':
                //     // Example: Store a jQuery reference to the marker's DOM element
                //     currentTargetMarker.$domElement = $(currentTargetMarker._container);
                //     break;
            }
        };

        const createdMarkers = stationRecords.map(individualStation => {
            // Ensure necessary properties exist.
            if (!individualStation.lat_lng || typeof individualStation.trips_total === 'undefined' || typeof individualStation.fpct_total === 'undefined') {
                console.warn("Skipping station due to missing data:", individualStation);
                return null;
            }

            const currentMarkerRadius = computeMarkerRadius(individualStation.trips_total, maxOverallTripCount);

            // Create the Leaflet circle marker.
            const newMarker = L.circleMarker(individualStation.lat_lng, {
                radius: currentMarkerRadius,
                weight: 1.5, // Border thickness.
                opacity: 0.8, // Border opacity.
                color: "#000000", // Black border.
                fillOpacity: 0.7, // Fill opacity.
                fillColor: getGradientHexColor(individualStation.fpct_total), // Color based on female percentage.
                pane: 'markerPane' // Ensure markers are in the correct pane for z-indexing.
            });

            // Attach original station data to the marker for easy access.
            newMarker.stationData = individualStation;

            // Attach event listeners.
            newMarker.on({
                mouseover: onMarkerEvent,
                mouseout: onMarkerEvent,
                dblclick: onMarkerEvent
            });

            return newMarker;
        }).filter(Boolean); // Filter out any null markers from skipped data.

        console.log(`Generated ${createdMarkers.length} markers.`);
        return createdMarkers;
    };

    /**
     * Builds and returns a Leaflet control containing lists of "most female" and "least female" stations.
     *
     * @param {Array<L.CircleMarker>} allMarkers An array of all generated Leaflet markers.
     * @param {L.Map} mapInstance The Leaflet map instance.
     * @param {L.Control} infoPanel The info panel control.
     * @returns {L.Control} The Leaflet control for featured stations.
     */
    const createFeaturedLocationWidget = (allMarkers, mapInstance, infoPanel) => {
        const widgetPanel = L.control({ position: "bottomright" });

        // Load templates for the group and individual station items.
        const stationGroupHtmlTemplate = _.template($(".tmpl.station-group-listing").html() || "<h3><%= group.name %></h3><div class='station-group-items'></div>");
        const stationItemHtmlTemplate = _.template($(".tmpl.station-list-item").html() || "<div class='station-list-item'><%= station.stationName %></div>");

        // Filter for stations with significant activity (e.g., more than 500 total trips).
        const activeStations = allMarkers.filter(m => m.stationData.trips_total >= 500);

        // Sort stations by female participation rate.
        const sortedByFemalePct = _.sortBy(activeStations, m => m.stationData.fpct_total);

        const groupDisplaySize = 6; // Number of stations to show in each group.

        // Categorize into "Least Female" and "Most Female" groups.
        const categorizedStationGroups = [
            {
                name: "Lowest Female Participation",
                markers: sortedByFemalePct.slice(0, groupDisplaySize)
            },
            {
                name: "Highest Female Participation",
                markers: sortedByFemalePct.slice(-1 * groupDisplaySize).reverse() // Reverse to show highest first.
            }
        ];

        widgetPanel.onAdd = function (currentMap) {
            const widgetDiv = L.DomUtil.create('div', 'map-control station-summary-list featured-locations');
            L.DomEvent.disableClickPropagation(widgetDiv);
            L.DomEvent.disableScrollPropagation(widgetDiv);
            const $widgetDiv = $(widgetDiv); // Use jQuery for easier DOM manipulation.

            // Iterate through defined groups and build their HTML.
            const $groupElements = _.map(categorizedStationGroups, function (groupData) {
                const $groupContainer = $(stationGroupHtmlTemplate({ group: groupData }));
                const $stationItems = _.map(groupData.markers, function (individualMarker) {
                    const $stationListItem = $(stationItemHtmlTemplate({ station: individualMarker.stationData }));

                    // Attach interaction events to each listed station.
                    $stationListItem.on("mouseover", function (e) {
                        applyMarkerHighlight(individualMarker, infoPanel);
                    });
                    $stationListItem.on("mouseout", function (e) {
                        revertMarkerStyle(individualMarker, infoPanel);
                    });
                    $stationListItem.on("dblclick", function (e) {
                        focusMapOnMarker(individualMarker, currentMap);
                    });
                    $stationListItem.on("click", function (e) {
                        centerMapOnMarker(individualMarker, currentMap);
                    });
                    return $stationListItem;
                });
                $groupContainer.find(".station-group-items").append($stationItems);
                return $groupContainer;
            });
            $widgetDiv.append($groupElements); // Add all groups to the widget.
            return widgetDiv;
        };

        return widgetPanel;
    };

    /**
     * Initializes the Leaflet map, adds tile layers, markers, and custom controls.
     *
     * @param {Array<Object>} stationDataCollection An array of station data objects.
     * @param {Array<L.TileLayer>} basemapLayers An array of Leaflet tile layer instances.
     * @param {string|HTMLElement} mapTargetId The ID of the HTML element where the map will be rendered.
     */
    const initializeGeoVisualization = (stationDataCollection, basemapLayers, mapTargetId) => {
        if (!mapTargetId || !document.getElementById(mapTargetId)) {
            console.error("Map target element not found:", mapTargetId);
            return;
        }
        console.log(`Initializing map on element: #${mapTargetId}`);

        // Pre-process station data to include Leaflet LatLng objects.
        stationDataCollection.forEach(singleStation => {
            if (typeof singleStation.lat === 'number' && typeof singleStation.lng === 'number') {
                singleStation.lat_lng = new L.LatLng(singleStation.lat, singleStation.lng);
            } else {
                console.warn("Station missing valid lat/lng, skipping:", singleStation);
                singleStation.lat_lng = null; // Mark as invalid.
            }
        });
        const validCoordinates = stationDataCollection
            .filter(s => s.lat_lng !== null)
            .map(s => s.lat_lng);

        // Calculate bounds from valid station coordinates.
        const mapBoundary = validCoordinates.length > 0 ? L.latLngBounds(validCoordinates) : null;

        // Initialize the Leaflet map instance.
        const leafletMapInstance = new L.Map(mapTargetId, {
            scrollWheelZoom: 'center', // Zoom around mouse pointer.
            doubleClickZoom: false, // Custom double-click handler for markers.
            minZoom: 8, // Minimum zoom level.
            maxZoom: 16, // Maximum zoom level.
            attributionControl: false // Add custom attribution later.
        });

        // Add custom attribution control.
        L.control.attribution({
            position: 'bottomleft',
            prefix: 'Leaflet | Data by &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(leafletMapInstance);

        // Fit map to calculated bounds, if any.
        if (mapBoundary && mapBoundary.isValid()) {
            leafletMapInstance.fitBounds(mapBoundary, { padding: [50, 50] }); // Add some padding.
        } else {
            // Fallback view if no valid stations or bounds.
            leafletMapInstance.setView([40.7128, -74.0060], 12); // Default to NYC.
            console.warn("No valid bounds found, setting default map view.");
        }

        // Add all specified tile layers to the map.
        basemapLayers.forEach(layer => {
            leafletMapInstance.addLayer(layer);
        });

        // Initialize custom Leaflet controls and markers.
        const interactiveInfoPanel = createDynamicInfoPanel();
        const dataPointMarkers = generateDataPointMarkers(stationDataCollection, leafletMapInstance, interactiveInfoPanel);
        const featuredStationsControl = createFeaturedLocationWidget(dataPointMarkers, leafletMapInstance, interactiveInfoPanel);

        // Add controls and marker layer to the map.
        interactiveInfoPanel.addTo(leafletMapInstance);
        featuredStationsControl.addTo(leafletMapInstance);
        L.layerGroup(dataPointMarkers).addTo(leafletMapInstance);

        console.log("Map visualization fully rendered.");
    };

    /**
     * Fetches station data from a URL (CSV format), parses it, and then initializes the map visualization.
     *
     * @param {string} dataResourceUrl The URL to fetch CSV station data from.
     * @param {Array<L.TileLayer>} mapBaseLayers An array of Leaflet tile layer instances.
     * @param {string|HTMLElement} targetMapDiv The ID of the HTML element for the map.
     */
    const fetchAndDisplayGeoData = (dataResourceUrl, mapBaseLayers, targetMapDiv) => {
        console.log(`Attempting to load station data from: ${dataResourceUrl}`);

        // Simple loading indicator (can be more sophisticated).
        const mapContainer = typeof targetMapDiv === 'string' ? document.getElementById(targetMapDiv) : targetMapDiv;
        if (mapContainer) {
            mapContainer.innerHTML = "<div class='map-loading-overlay'>Loading map data...</div>";
        }

        // Use jQuery's AJAX for fetching CSV data.
        $.ajax({
            url: dataResourceUrl,
            method: 'GET',
            dataType: 'text' // Expect plain text (CSV).
        })
        .done(function (csvContent) {
            // Use jQuery-CSV plugin to parse the CSV string into an array of objects.
            const parsedRecords = $.parse(csvContent).results.rows;
            console.log(`Successfully loaded and parsed ${parsedRecords.length} station records.`);

            // Remove loading indicator.
            if (mapContainer) {
                mapContainer.innerHTML = '';
            }

            initializeGeoVisualization(parsedRecords, mapBaseLayers, targetMapDiv);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.error(`Failed to load station data from ${dataResourceUrl}:`, textStatus, errorThrown);
            if (mapContainer) {
                mapContainer.innerHTML = "<div class='map-error-overlay'>Failed to load map data. Please try again later.</div>";
            }
        });
    };

    // Expose core functionality under a custom namespace on the global object.
    appGlobalContext.DataVizApp = appGlobalContext.DataVizApp || {};
    appGlobalContext.DataVizApp.geoVisuals = {
        loadAndRenderMap: fetchAndDisplayGeoData
    };

    console.log("DataVizApp module initialized.");

}).apply(this); // Execute the IIFE, passing 'this' as the global context.