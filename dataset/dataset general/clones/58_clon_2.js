(function() {
    // Establish the global context for module exposure
    var globalScope = this;

    /**
     * Formats a given number by inserting commas as thousands separators.
     * @param {number|string} inputNumberValue - The number to format.
     * @returns {string} The formatted string.
     */
    globalScope.formatNumberWithCommas = function ( inputNumberValue ) {
        // Variable to hold the regular expression for digit grouping
        var separatorRegex;

        // Ensure the input is treated as a string for manipulation
        inputNumberValue += "";

        // Define the regex to find one or more digits followed by exactly three digits
        separatorRegex = /(\d+)(\d{3})/;

        // Loop while the regex finds a match in the string
        while (separatorRegex.test(inputNumberValue)) {
            // Replace the matched pattern with the first group, a comma, and the second group
            inputNumberValue = inputNumberValue.replace(separatorRegex, "$1,$2");
        }

        // Return the fully formatted string
        return inputNumberValue;
    };

    /**
     * Calculates a percentage value and rounds it to a specified number of decimal places.
     * @param {number} baseValue - The base number to convert to a percentage.
     * @param {number} decimalPlaces - The number of decimal places for rounding.
     * @returns {number} The rounded percentage value.
     */
    globalScope.calculatePercentage = function (baseValue, decimalPlaces) {
        // Calculate the multiplier for rounding
        var multiplierFactor = Math.pow(10, decimalPlaces);

        // Perform the percentage calculation and rounding
        return Math.round(baseValue * 100 * multiplierFactor) / multiplierFactor;
    };

    // Initialize a color gradient using an external utility library.
    // This gradient ranges from cool blue to white to warm pink.
    var visualColorGradient = colorUtility.scale(['#00CCFF', "#FFF", '#FF0099'])
                                      .domain([0.0, 0.25, 0.50], 20) // Define the domain and number of steps
                                      .mode('lab'); // Use LAB color space for smoother transitions

    /**
     * Retrieves a hexadecimal color string based on a given percentage value.
     * @param {number} percentageValue - The percentage to map to a color.
     * @returns {string} The hexadecimal color code.
     */
    var obtainScaledColor = function (percentageValue) {
        return visualColorGradient(percentageValue).hex(); // Get the hex color from the gradient
    };

    /**
     * Constructs a Leaflet control for displaying a legend with color bars.
     * This version uses a fixed number of chunks and maximum value.
     * @returns {object} A Leaflet control object representing the legend.
     */
    var constructMapLegend = function () {
        // Create a new Leaflet control positioned at the bottom left
        var legendContainer = L.control({ position: "bottomleft" });

        // Initialize the legend element and assign it to the container's internal div
        var legendElement = legendContainer._div = L.DomUtil.create("div", "legend map-control");

        // Define constants for legend segmentation
        var SEGMENTS = 10;
        var UPPER_LIMIT = 0.5;

        // Generate the HTML for the individual legend bars
        var segmentMarkup = utilities.map(utilities.range(10), function (idx) {
            // Each bar represents a segment of the total range
            return "<div class='legend-bar' style='width: " + 100 / SEGMENTS +
                "%; background: " + obtainScaledColor(UPPER_LIMIT * idx / SEGMENTS) + "'></div>";
        }).join(""); // Join all bar HTML strings together

        // Wrap the bars in a container div
        var fullMarkup = "<div class='legend-bars'>" + segmentMarkup + "</div>";

        // Set the inner HTML of the legend element
        legendElement.innerHTML = fullMarkup;

        // Define the onAdd method for the Leaflet control
        legendContainer.onAdd = function (currentMapInstance) {
            return this._div; // Return the control's main div element
        };

        // Return the complete legend control
        return legendContainer;
    };

    /**
     * Generates the full HTML markup for a detailed map legend, including text labels.
     * @returns {string} The HTML string for the legend.
     */
    var generateLegendMarkup = function () {
        // Constants for the legend's visual representation
        var SEGMENTS = 10;
        var UPPER_LIMIT = 0.5;

        // Generate the HTML for the color gradient bars
        var internalContent = utilities.map(utilities.range(SEGMENTS + 1), function (idx) {
            return "<div class='legend-bar' style='width: " + 100 / (SEGMENTS + 1) +
                "%; background: " + obtainScaledColor(UPPER_LIMIT * idx / SEGMENTS) + "'></div>";
        }).join("");

        // Assemble the complete legend HTML, including bars and descriptive text
        var fullLegendHtml = "<div class='legend'>" +
            "<div class='legend-bars'>" + internalContent + "</div>" +
            "<div class='legend-text'>" +
            "<span class='legend-text-left'>0%</span>" +
            "<span class='legend-text-center'>Female Ridership</span>" +
            "<span class='legend-text-right'>50%+</span>" +
            "</div>";

        // Return the final HTML string
        return fullLegendHtml;
    };

    /**
     * Creates and configures a Leaflet control for displaying station information.
     * @returns {object} A Leaflet control object for the info panel.
     */
    var createInformationPanel = function () {
        // Initialize a new Leaflet control without a specific position initially
        var displayInfoPanel = L.control();

        // Get a template renderer for station details from the DOM
        var stationTemplateRenderer = utilities.template(jq(".template.station-view").html());

        // Define HTML for user interaction guidance
        var interactionGuidance = "<div class='helptext'>" +
            "<span class='helptext-main'>Hover over any station for details. Double-click on a station to zoom in.</span>" +
            "<span class='helptext-mobile'>Tap on any station for details.</span>" +
            "</div>";

        // Generate the HTML for the static legend part
        var legendMarkup = generateLegendMarkup();

        // Combine help text and legend for the default display
        var initialPanelContent = interactionGuidance + legendMarkup;

        // Define the onAdd method for the information control
        displayInfoPanel.onAdd = function (currentMap) {
            // Create the main div for the info panel and assign classes
            this._div = L.DomUtil.create('div', 'info map-control');
            this.update(); // Initialize the content
            return this._div;
        };

        /**
         * Updates the content of the information panel.
         * @param {object} [stationDetailsObject] - The station data to display, if any.
         */
        displayInfoPanel.update = function (stationDetailsObject) {
            // If station data is provided, render it; otherwise, show default content
            this._div.innerHTML = stationDetailsObject ? stationTemplateRenderer(stationDetailsObject) : initialPanelContent;
        };

        // Return the configured information panel control
        return displayInfoPanel;
    };

    /**
     * Applies a highlight style to a given marker and updates the info panel.
     * @param {object} targetMarker - The Leaflet marker to highlight.
     * @param {object} infoDisplay - The info panel control to update.
     */
    var emphasizePointMarker = function (targetMarker, infoDisplay) {
        // Store the marker's current styles before changing them
        targetMarker.originalStyles = targetMarker.options;

        // Apply new styles for highlighting
        targetMarker.setStyle({
            fillColor: "#ffee00", // Bright yellow fill
            weight: 2,             // Thicker border
            opacity: 1             // Fully opaque
        });

        // Store the marker's current position within its container for later restoration
        targetMarker.previousPositionIndex = targetMarker.markerContainerElement.index();
        targetMarker.bringToFront(); // Bring the highlighted marker to the front

        // Update the info panel with details of the highlighted station
        infoDisplay.update(targetMarker.stationInfo);
    };

    /**
     * Resets a marker to its original style and restores the info panel to default.
     * @param {object} targetMarker - The Leaflet marker to reset.
     * @param {object} infoDisplay - The info panel control to update.
     */
    var restorePointMarker = function (targetMarker, infoDisplay) {
        // Reapply the stored original styles
        targetMarker.setStyle(targetMarker.originalStyles);

        // Get a reference to the marker's container element
        var containerRef = targetMarker.markerContainerElement;

        // Restore the marker's original DOM position
        containerRef.insertBefore(containerRef.parent().children()[targetMarker.previousPositionIndex]);

        // Reset the info panel to its default content
        infoDisplay.update();
    };

    /**
     * Zooms the map to a specific marker's location.
     * @param {object} targetMarker - The Leaflet marker to zoom to.
     * @param {object} currentMap - The Leaflet map instance.
     */
    var magnifyToPoint = function (targetMarker, currentMap) {
        // Set the map view to the marker's coordinates and increase zoom level
        currentMap.setView(targetMarker.markerCoordinates, currentMap.getZoom() + 1);
    };

    /**
     * Pans the map to center on a specific marker's location.
     * @param {object} targetMarker - The Leaflet marker to pan to.
     * @param {object} currentMap - The Leaflet map instance.
     */
    var centerOnPoint = function (targetMarker, currentMap) {
        // Pan the map to the marker's geographical coordinates
        currentMap.panTo(targetMarker.markerCoordinates);
    };

    /**
     * Generates a collection of Leaflet circle markers for a list of station data.
     * Each marker is styled based on station properties and has interaction events.
     * @param {Array<object>} stationDataList - An array of station data objects.
     * @param {object} activeMap - The Leaflet map instance.
     * @param {object} displayPanel - The info panel control for updates.
     * @returns {Array<object>} An array of Leaflet circle marker objects.
     */
    var assembleStationMarkers = function (stationDataList, activeMap, displayPanel) {
        // Extract all trip totals to determine the maximum
        var journeyCounts = utilities.pluck(stationDataList, "trips_total");
        var maximumJourneys = Math.max.apply(Math.max, journeyCounts);

        /**
         * Calculates the radius for a circle marker based on trip total, scaled relative to the maximum.
         * @param {number} currentTotal - The trip total for the current station.
         * @param {number} overallMax - The maximum trip total across all stations.
         * @returns {number} The calculated radius for the marker.
         */
        var adjustCircleRadius = function (currentTotal, overallMax) {
            var proportion = currentTotal / overallMax;
            var adjustedProportion = Math.max(0.2, proportion); // Ensure a minimum radius
            return 8 * Math.sqrt(adjustedProportion); // Scale radius using square root for visual effect
        };

        // Create a Leaflet marker for each station in the provided list
        var generatedMarkers = utilities.map(stationDataList, function (stationEntry) {
            // Instantiate a new circle marker with calculated radius and styles
            var currentMarker = L.circleMarker(stationEntry.lat_lng, {
                radius: adjustCircleRadius(stationEntry.trips_total, maximumJourneys),
                weight: 1, // Border thickness
                opacity: 1, // Border opacity
                color: "#000", // Border color (black)
                fillOpacity: 1, // Fill opacity
                fillColor: obtainScaledColor(stationEntry.fpct_total), // Fill color based on female percentage
            });

            // Attach the original station data to the marker object
            currentMarker.stationInfo = stationEntry;

            // Assign event listeners for user interactions
            currentMarker.on({
                mouseover: function (eventObject) { emphasizePointMarker(eventObject.target, displayPanel); },
                mouseout: function (eventObject) { restorePointMarker(eventObject.target, displayPanel); },
                dblclick: function (eventObject) { magnifyToPoint(eventObject.target, activeMap); },
                add: function (eventObject) {
                    // When the marker is added to the map, store a jQuery reference to its DOM element
                    currentMarker.markerContainerElement = jq(currentMarker._container);
                }
            });

            // Return the configured marker
            return currentMarker;
        });

        // Return the array of all generated markers
        return generatedMarkers;
    };

    /**
     * Creates a Leaflet control displaying lists of "least-female" and "most-female" stations.
     * Provides interaction functionality for these stations.
     * @param {Array<object>} allMarkers - An array of all station markers.
     * @param {object} targetMap - The Leaflet map instance.
     * @param {object} panelReference - The info panel control.
     * @returns {object} A Leaflet control object for the prominent stations list.
     */
    var generateProminentStationsDisplay = function (allMarkers, targetMap, panelReference) {
        // Create a new Leaflet control positioned at the bottom right
        var controlPanelHolder = L.control({ position: "bottomright" });

        // Get template renderers for station group and individual station items
        var stationGroupTemplate = utilities.template(jq(".template.station-group").html());
        var stationItemTemplate = utilities.template(jq(".template.station-item").html());

        // Filter markers to include only stations with a significant number of trips
        var qualifyingMarkers = utilities.filter(allMarkers, function (currentMarker) {
            return currentMarker.stationInfo.trips_total >= 1000;
        });

        // Sort the filtered markers by female percentage
        var orderedMarkers = utilities.sortBy(qualifyingMarkers, function (currentMarker) {
            return currentMarker.stationInfo.fpct_total;
        });

        // Define the number of stations in each 'top' category
        var categorySize = 5;

        // Define the categories of prominent stations
        var stationCategories = [
            {
                name: "Least-Female",
                markers: orderedMarkers.slice(0, categorySize) // First N stations
            },
            {
                name: "Most-Female",
                markers: orderedMarkers.slice(-1 * categorySize).reverse() // Last N stations, reversed for highest first
            }
        ];

        // Define the onAdd method for this control
        controlPanelHolder.onAdd = function (currentMap) {
            // Create the main div for the control and apply classes
            var innerDivElement = L.DomUtil.create('div', 'map-control station-list top-stations');
            var jQueryInnerDiv = jq(innerDivElement);

            // Generate HTML for each station group (Least-Female, Most-Female)
            var jQueryGroupElements = utilities.map(stationCategories, function (stationGroup) {
                var jQueryGroupElement = jq(stationGroupTemplate({ group: stationGroup }));

                // Generate HTML for each station item within the group
                var jQueryStationElements = utilities.map(stationGroup.markers, function (currentMarker) {
                    var jQueryStationItem = jq(stationItemTemplate({ station: currentMarker.stationInfo }));

                    // Attach event handlers for interaction with the list item
                    jQueryStationItem.on("mouseover", function (eventObject) {
                        emphasizePointMarker(currentMarker, panelReference);
                    });
                    jQueryStationItem.on("mouseout", function (eventObject) {
                        restorePointMarker(currentMarker, panelReference);
                    });
                    jQueryStationItem.on("dblclick", function (eventObject) {
                        magnifyToPoint(currentMarker, targetMap);
                    });
                    jQueryStationItem.on("click", function (eventObject) {
                        centerOnPoint(currentMarker, targetMap);
                    });
                    return jQueryStationItem;
                });
                // Append station items to their respective group container
                jQueryGroupElement.find(".station-group-stations").append(jQueryStationElements);
                return jQueryGroupElement;
            });
            // Append all group elements to the main control div
            jQueryInnerDiv.append(jQueryGroupElements);
            return innerDivElement;
        };

        // Return the created control
        return controlPanelHolder;
    };

    /**
     * Initializes and constructs a Leaflet map with stations, tile layers, and custom controls.
     * @param {Array<object>} collectionOfStations - List of station data objects.
     * @param {Array<object>} mapTileLayers - Array of Leaflet tile layer objects.
     * @param {string|HTMLElement} mapContainerDiv - The ID or DOM element for the map container.
     */
    var constructInteractiveMap = function (collectionOfStations, mapTileLayers, mapContainerDiv) {
        // Pre-process station data to create Leaflet LatLng objects
        utilities.each(collectionOfStations, function (stationObject) {
            stationObject.lat_lng = new L.LatLng(stationObject.lat, stationObject.lng);
        });

        // Extract all LatLng objects to calculate map bounds
        var coordinatesList = utilities.pluck(collectionOfStations, "lat_lng");
        var mapBoundaries = L.latLngBounds(coordinatesList);

        // Initialize the Leaflet map instance
        var leafletMapInstance = new L.Map(mapContainerDiv, {
            scrollWheelZoom: false,    // Disable scroll wheel zooming
            doubleClickZoom: false,    // Disable double-click zooming
            minZoom: 9,                // Set minimum zoom level
            attributionControl: false  // Disable default attribution
        });

        // Add a custom attribution control to the map
        L.control.attribution({ position: 'bottomleft' }).addTo(leafletMapInstance);

        // Adjust map view to fit all station boundaries
        leafletMapInstance.fitBounds(mapBoundaries);

        // Add all specified tile layers to the map
        utilities.each(mapTileLayers, function (currentLayer) {
            leafletMapInstance.addLayer(currentLayer);
        });

        // Build and add custom map controls
        var mapInfoControl = createInformationPanel();
        var allStationMarkers = assembleStationMarkers(collectionOfStations, leafletMapInstance, mapInfoControl);
        var prominentStationsControl = generateProminentStationsDisplay(allStationMarkers, leafletMapInstance, mapInfoControl);

        mapInfoControl.addTo(leafletMapInstance);
        prominentStationsControl.addTo(leafletMapInstance);

        // Add all station markers to the map as a layer group
        L.layerGroup(allStationMarkers).addTo(leafletMapInstance);
    };

    /**
     * Fetches station data from a URL, parses it, and then builds the map.
     * @param {string} stationDataEndpoint - The URL to fetch station CSV data from.
     * @param {Array<object>} baseMapLayers - Array of Leaflet tile layer objects.
     * @param {string|HTMLElement} targetDivElement - The ID or DOM element for the map container.
     */
    var initializeStationMapping = function (stationDataEndpoint, baseMapLayers, targetDivElement) {
        // Use jQuery's AJAX get method to fetch CSV data
        jq.get(stationDataEndpoint, function (csvDataString) {
            // Parse the CSV string into an array of station records
            var parsedStationRecords = jq.parse(csvDataString).results.rows;

            // Proceed to build the map with the parsed data
            constructInteractiveMap(parsedStationRecords, baseMapLayers, targetDivElement);
        });
    };

    // Expose functionality under a global namespace
    globalScope.NewsAggregation = globalScope.NewsAggregation || {};
    globalScope.NewsAggregation.regionalData = {
        mapStations: initializeStationMapping
    };

}).call(this); // Invoke the anonymous function, binding 'this' to the global object