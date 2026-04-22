const MapVizModule = {};

MapVizModule.NumericToolbox = (function() {
    function formatWithSeparators(value) {
        if (typeof value !== 'number') {
            value = Number(value);
            if (isNaN(value)) return String(value);
        }
        return new Intl.NumberFormat('en-US').format(value);
    }

    function roundToDecimalPercentage(numberValue, decimalPlaces) {
        if (typeof numberValue !== 'number') {
            numberValue = Number(numberValue);
            if (isNaN(numberValue)) return NaN;
        }
        const factor = Math.pow(10, decimalPlaces);
        return Math.round(numberValue * 100 * factor) / factor;
    }

    return {
        formatWithSeparators: formatWithSeparators,
        roundToDecimalPercentage: roundToDecimalPercentage
    };
})();

MapVizModule.ColorProcessor = (function() {
    const colorSpectrum = chroma.scale(['#00CCFF', "#FFF", '#FF0099'])
        .domain([0.0, 0.25, 0.50], 20)
        .mode('lab');

    function retrieveHexColor(fraction) {
        return colorSpectrum(fraction).hex();
    }

    return {
        retrieveHexColor: retrieveHexColor
    };
})();

MapVizModule.CSVParser = (function() {
    function parseText(csvString) {
        const lines = csvString.trim().split('\n');
        if (lines.length === 0) return [];

        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length !== headers.length) continue;

            const row = {};
            headers.forEach((header, index) => {
                let value = values[index];
                if (!isNaN(Number(value)) && value !== '') {
                    row[header] = Number(value);
                } else {
                    row[header] = value;
                }
            });
            data.push(row);
        }
        return data;
    }
    return { parseText: parseText };
})();

MapVizModule.LegendDisplay = (function() {
    const BAR_COUNT_DIVISIONS = 10;
    const MAX_LEGEND_VALUE = 0.5;

    function constructLegendHtmlContent() {
        const barWidthPercentage = 100 / (BAR_COUNT_DIVISIONS + 1);
        let barsHtml = '';
        for (let i = 0; i <= BAR_COUNT_DIVISIONS; i++) {
            const currentFraction = MAX_LEGEND_VALUE * i / BAR_COUNT_DIVISIONS;
            const barColor = MapVizModule.ColorProcessor.retrieveHexColor(currentFraction);
            barsHtml += `<div class='legend-bar-segment' style='width: ${barWidthPercentage}%; background: ${barColor}'></div>`;
        }

        return `<div class='legend-wrapper-container'>` +
            `<div class='legend-color-strip-area'>${barsHtml}</div>` +
            `<div class='legend-text-labels'>` +
            `<span class='legend-label-begin'>0%</span>` +
            `<span class='legend-label-center-text'>Female Ridership</span>` +
            `<span class='legend-label-end'>50%+</span>` +
            `</div>` +
            `</div>`;
    }

    return {
        generateHtml: constructLegendHtmlContent
    };
})();

MapVizModule.InformationPanel = function(containerElement) {
    let panelDiv;
    let detailTemplateFunction;

    const guidanceTextHtml = `<div class='guidance-message-box'>` +
        `<span class='guidance-primary'>Hover over any location for details. Double-click on a location to zoom in.</span>` +
        `<span class='guidance-mobile-tip'>Tap on any location for details.</span>` +
        `</div>`;

    const defaultPanelContent = guidanceTextHtml + MapVizModule.LegendDisplay.generateHtml();

    function initializePanel(templateSelector) {
        panelDiv = document.createElement('div');
        panelDiv.className = 'information-panel-control map-ui-element';
        containerElement.appendChild(panelDiv);

        const templateElement = document.querySelector(templateSelector);
        if (templateElement) {
            const templateString = templateElement.innerHTML;
            detailTemplateFunction = (data) => {
                let output = templateString;
                for (const key in data) {
                    output = output.replace(new RegExp(`<%= ${key} %>`, 'g'), data[key]);
                }
                return output;
            };
        } else {
            console.warn(`Template element not found for selector: ${templateSelector}`);
            detailTemplateFunction = (data) => JSON.stringify(data);
        }

        refreshContent();
    }

    function refreshContent(stationData = null) {
        if (stationData) {
            const formattedData = {
                name: stationData.name,
                trips_total: MapVizModule.NumericToolbox.formatWithSeparators(stationData.trips_total),
                fpct_total: MapVizModule.NumericToolbox.roundToDecimalPercentage(stationData.fpct_total, 1),
                mpct_total: MapVizModule.NumericToolbox.roundToDecimalPercentage(stationData.mpct_total, 1)
            };
            panelDiv.innerHTML = detailTemplateFunction(formattedData);
        } else {
            panelDiv.innerHTML = defaultPanelContent;
        }
    }

    function getPanelElement() {
        return panelDiv;
    }

    return {
        initialize: initializePanel,
        refreshContent: refreshContent,
        getPanelElement: getPanelElement
    };
};

MapVizModule.MarkerInteractionHandlers = (function() {
    const activeMarkerStyle = {
        fillColor: "#ffee00",
        weight: 2,
        opacity: 1
    };

    function activateMarker(leafletCircle, infoPanel) {
        if (!leafletCircle._originalVisualStyle) {
            leafletCircle._originalVisualStyle = { ...leafletCircle.options
            };
        }
        leafletCircle.setStyle(activeMarkerStyle);
        leafletCircle.bringToFront();
        infoPanel.refreshContent(leafletCircle.locationData);
    }

    function deactivateMarker(leafletCircle, infoPanel) {
        if (leafletCircle._originalVisualStyle) {
            leafletCircle.setStyle(leafletCircle._originalVisualStyle);
        }
        infoPanel.refreshContent();
    }

    function focusMapOnSpecificMarker(leafletCircle, mapInstance) {
        mapInstance.setView(leafletCircle.getLatLng(), mapInstance.getZoom() + 1);
    }

    function centerMapOnSpecificMarker(leafletCircle, mapInstance) {
        mapInstance.panTo(leafletCircle.getLatLng());
    }

    return {
        activateMarker: activateMarker,
        deactivateMarker: deactivateMarker,
        focusMapOnSpecificMarker: focusMapOnSpecificMarker,
        centerMapOnSpecificMarker: centerMapOnSpecificMarker
    };
})();

MapVizModule.StationPointCreator = function(mapInstance, infoPanelInstance) {
    let generatedPoints = [];
    let overallMaxTripCount = 0;

    function determinePointRadius(currentTrips, maximumTrips) {
        const tripRatio = currentTrips / maximumTrips;
        const constrainedRatio = Math.max(0.2, tripRatio);
        return 8 * Math.sqrt(constrainedRatio);
    }

    function createAllPoints(stationDataArray) {
        generatedPoints = [];

        const tripCounts = stationDataArray.map(s => s.trips_total);
        overallMaxTripCount = Math.max(...tripCounts);

        stationDataArray.forEach(locationData => {
            const pointRadius = determinePointRadius(locationData.trips_total, overallMaxTripCount);
            const pointColor = MapVizModule.ColorProcessor.retrieveHexColor(locationData.fpct_total);

            const newLeafletPoint = L.circleMarker([locationData.lat, locationData.lng], {
                radius: pointRadius,
                weight: 1,
                opacity: 1,
                color: "#000",
                fillOpacity: 1,
                fillColor: pointColor,
            });

            newLeafletPoint.locationData = locationData;

            newLeafletPoint.on({
                mouseover: (e) => MapVizModule.MarkerInteractionHandlers.activateMarker(e.target, infoPanelInstance),
                mouseout: (e) => MapVizModule.MarkerInteractionHandlers.deactivateMarker(e.target, infoPanelInstance),
                dblclick: (e) => MapVizModule.MarkerInteractionHandlers.focusMapOnSpecificMarker(e.target, mapInstance),
            });

            generatedPoints.push(newLeafletPoint);
        });

        return generatedPoints;
    }

    function getAllPoints() {
        return generatedPoints;
    }

    return {
        createAllPoints: createAllPoints,
        getAllPoints: getAllPoints
    };
};

MapVizModule.ProminentStationList = function(containerElement, mapReference, infoReference) {
    let listingControlDiv;
    let allLeafletPoints = [];

    const categoryHtmlTemplate = `<div class='station-grouping-section'><h3><%= categoryName %></h3><div class='station-entries-container'></div></div>`;
    const stationItemHtmlTemplate = `<div class='station-entry-item' data-station-id='<%= identifier %>'><h4><%= stationTitle %></h4><p>Total Trips: <%= tripCount %></p><p>Female Riders: <%= femalePercentage %>%</p></div>`;

    function initializeList(markerArray) {
        allLeafletPoints = markerArray;
        listingControlDiv = document.createElement('div');
        listingControlDiv.className = 'prominent-station-list map-ui-element';
        containerElement.appendChild(listingControlDiv);

        renderListCategories();
    }

    function renderListCategories() {
        const minTripThreshold = 1000;
        const filteredPoints = allLeafletPoints.filter(lp => lp.locationData.trips_total >= minTripThreshold);

        const pointsSortedByFemaleRatio = [...filteredPoints].sort((a, b) => a.locationData.fpct_total - b.locationData.fpct_total);

        const groupDisplaySize = 5;

        const pointCategories = [{
            name: "Lowest-Female Ridership",
            points: pointsSortedByFemaleRatio.slice(0, groupDisplaySize)
        }, {
            name: "Highest-Female Ridership",
            points: pointsSortedByFemaleRatio.slice(-1 * groupDisplaySize).reverse()
        }];

        listingControlDiv.innerHTML = '';

        pointCategories.forEach(category => {
            let categorySectionHtml = categoryHtmlTemplate.replace('<%= categoryName %>', category.name);
            const categoryElement = document.createElement('div');
            categoryElement.innerHTML = categorySectionHtml;
            const entriesContainer = categoryElement.querySelector('.station-entries-container');

            category.points.forEach(lp => {
                const itemData = {
                    identifier: lp.locationData.id,
                    stationTitle: lp.locationData.name,
                    tripCount: MapVizModule.NumericToolbox.formatWithSeparators(lp.locationData.trips_total),
                    femalePercentage: MapVizModule.NumericToolbox.roundToDecimalPercentage(lp.locationData.fpct_total, 1)
                };
                let itemHtml = stationItemHtmlTemplate;
                for (const key in itemData) {
                    itemHtml = itemHtml.replace(new RegExp(`<%= ${key} %>`, 'g'), itemData[key]);
                }
                const itemWrapper = document.createElement('div');
                itemWrapper.innerHTML = itemHtml;
                const actualItemElement = itemWrapper.firstElementChild;

                actualItemElement.addEventListener('mouseover', () => MapVizModule.MarkerInteractionHandlers.activateMarker(lp, infoReference));
                actualItemElement.addEventListener('mouseout', () => MapVizModule.MarkerInteractionHandlers.deactivateMarker(lp, infoReference));
                actualItemElement.addEventListener('dblclick', () => MapVizModule.MarkerInteractionHandlers.focusMapOnSpecificMarker(lp, mapReference));
                actualItemElement.addEventListener('click', () => MapVizModule.MarkerInteractionHandlers.centerMapOnSpecificMarker(lp, mapReference));

                entriesContainer.appendChild(actualItemElement);
            });
            listingControlDiv.appendChild(categoryElement.firstElementChild);
        });
    }

    function getListElement() {
        return listingControlDiv;
    }

    return {
        initialize: initializeList,
        getListElement: getListElement
    };
};

MapVizModule.MapDisplayManager = function(targetDivId) {
    let mainLeafletMap;
    let infoDisplayComponent;
    let pointFactoryComponent;
    let stationSummaryComponent;
    let mapHostElement;

    function configureMapAndComponents(incomingStationData, tileLayerConfigs) {
        mapHostElement = document.getElementById(targetDivId);
        if (!mapHostElement) {
            console.error(`Map container element with ID '${targetDivId}' not found.`);
            return;
        }

        const enrichedStationData = incomingStationData.map(s => ({
            ...s,
            leafletCoordinate: new L.LatLng(s.lat, s.lng)
        }));

        const allCoordinates = enrichedStationData.map(s => s.leafletCoordinate);
        const mapViewingBounds = L.latLngBounds(allCoordinates);

        mainLeafletMap = new L.Map(mapHostElement, {
            scrollWheelZoom: false,
            doubleClickZoom: false,
            minZoom: 9,
            attributionControl: false
        });
        L.control.attribution({
            position: 'bottomleft'
        }).addTo(mainLeafletMap);

        mainLeafletMap.fitBounds(mapViewingBounds);

        tileLayerConfigs.forEach(layer => {
            mainLeafletMap.addLayer(layer);
        });

        infoDisplayComponent = MapVizModule.InformationPanel(mapHostElement);
        infoDisplayComponent.initialize('.tmpl.station');

        pointFactoryComponent = MapVizModule.StationPointCreator(mainLeafletMap, infoDisplayComponent);
        const createdMarkers = pointFactoryComponent.createAllPoints(enrichedStationData);

        stationSummaryComponent = MapVizModule.ProminentStationList(mapHostElement, mainLeafletMap, infoDisplayComponent);
        stationSummaryComponent.initialize(createdMarkers);

        L.layerGroup(createdMarkers).addTo(mainLeafletMap);

        // Manually position custom UI elements
        infoDisplayComponent.getPanelElement().style.position = 'absolute';
        infoDisplayComponent.getPanelElement().style.bottom = '20px';
        infoDisplayComponent.getPanelElement().style.left = '10px';
        infoDisplayComponent.getPanelElement().style.zIndex = '1000';

        stationSummaryComponent.getListElement().style.position = 'absolute';
        stationSummaryComponent.getListElement().style.bottom = '20px';
        stationSummaryComponent.getListElement().style.right = '10px';
        stationSummaryComponent.getListElement().style.zIndex = '1000';
    }

    async function retrieveDataAndVisualize(dataEndpointUrl, tileLayers) {
        try {
            const response = await fetch(dataEndpointUrl);
            if (!response.ok) {
                throw new Error(`HTTP fetch error! Status: ${response.status}`);
            }
            const csvContent = await response.text();
            const parsedContent = MapVizModule.CSVParser.parseText(csvContent);
            configureMapAndComponents(parsedContent, tileLayers);
        } catch (error) {
            console.error("Failed to load or process station data:", error);
        }
    }

    return {
        initiateMapVisualization: retrieveDataAndVisualize
    };
};

(function(globalContext) {
    globalContext.DataVisualizer = globalContext.DataVisualizer || {};
    globalContext.DataVisualizer.LocationAnalytics = {
        renderStationMap: function(stationDataSource, mapLayers, targetElementId) {
            const managerInstance = MapVizModule.MapDisplayManager(targetElementId);
            managerInstance.initiateMapVisualization(stationDataSource, mapLayers);
        }
    };
})(this);