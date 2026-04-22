const mappingUtility = (function() {

    const viewParameters = {
        initialCenterValue: osmly.settings.origin,
        baseOverlayList: [new L.BingLayer('Arzdiw4nlOJzRwOz__qailc8NiR31Tt51dN2D7cm57NrnceZnCpgOkmJhNpGoppU')],
        startingDisplayZoom: osmly.settings.zoom,
        maximumDisplayZoom: 19,
        fadeAnimationStatus: false
    };

    const iconResourcePath = 'dist/leaflet-images/';
    const apiDevString = 'dev';
    const openStreetMapTileSource = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';

    const contextualLayerStyle = osmly.settings.contextStyle;
    const featureLayerStyle = osmly.settings.featureStyle;
    const contextualFilteringRules = osmly.settings.context;
    const readApiEndpoint = osmly.settings.readApi;
    const writeApiEndpoint = osmly.settings.writeApi;

    const interfaceNotifier = (alertMessage) => osmly.ui.notify(alertMessage);

    const updateGlobalNavigationLink = (currentZoomValue, currentLatitude, currentLongitude) => {
        osmly.osmlink = `http://www.openstreetmap.org/#map=${currentZoomValue}/${currentLatitude}/${currentLongitude}`;
    };

    function createInteractiveView() {
        const visualSurface = L.map('map', {
            center: viewParameters.initialCenterValue,
            layers: viewParameters.baseOverlayList,
            zoom: viewParameters.startingDisplayZoom,
            maxZoom: viewParameters.maximumDisplayZoom,
            fadeAnimation: viewParameters.fadeAnimationStatus
        });

        L.Icon.Default.imagePath = iconResourcePath;

        visualSurface.on('moveend', () => {
            const coordinatePair = visualSurface.getCenter().wrap();
            const latitudeValue = coordinatePair.lat.toFixed(4).toString();
            const longitudeValue = coordinatePair.lng.toFixed(4).toString();
            const zoomLevel = visualSurface.getZoom().toString();
            updateGlobalNavigationLink(zoomLevel, latitudeValue, longitudeValue);
        });

        visualSurface.attributionControl.setPrefix(
            writeApiEndpoint.split(apiDevString).length > 1 ? 'DEV SERVER' : false
        );

        visualSurface.baseTileOverlay = L.tileLayer(openStreetMapTileSource, {
            maxZoom: viewParameters.maximumDisplayZoom,
            maxNativeZoom: 18
        });

        let contextualOverlayInstance = null;
        let focusedFeatureOverlayInstance = null;

        const retrieveOpenStreetMapData = (geographicBounds, completionHandler) => {
            interfaceNotifier('Requesting OpenStreetMap data');
            fetch(`${readApiEndpoint}bbox=${geographicBounds.join(',')}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(textContent => {
                    const xmlParser = new DOMParser();
                    const parsedDataPayload = xmlParser.parseFromString(textContent, "application/xml");
                    visualSurface.osmContext = parsedDataPayload;
                    completionHandler(parsedDataPayload);
                })
                .catch(error => {
                    interfaceNotifier(`Error fetching OSM data: ${error.message}`);
                    console.error("Data retrieval error:", error);
                });
        };

        const filterGeoSpatialElements = (rawGeoJsonData) => {
            const processedGeoCollection = { 'type': 'FeatureCollection', 'features': [] };
            const hasDefinedRules = Object.keys(contextualFilteringRules).length > 0;

            processedGeoCollection.features = rawGeoJsonData.features.filter(elementData => {
                if (!hasDefinedRules) return true;

                return Object.keys(elementData.properties).some(propertyIdentifier =>
                    propertyIdentifier in contextualFilteringRules &&
                    contextualFilteringRules[propertyIdentifier].includes(elementData.properties[propertyIdentifier])
                );
            });
            return processedGeoCollection;
        };

        const instantiateContextualOverlay = (filteredGeoJson) => {
            let sequentialElementIndex = 0;

            contextualOverlayInstance = L.geoJson(filteredGeoJson, {
                style: contextualLayerStyle,
                onEachFeature: (elementData, displayLayer) => {
                    const propertyKeyList = Object.keys(elementData.properties);
                    let popupContentString = '';
                    let displayLabelText = elementData.properties.name || 'NO NAME, click for tags';

                    popupContentString = propertyKeyList.reduce((accumulator, currentPropertyKey) => {
                        if (!currentPropertyKey.startsWith('osm_')) {
                            return accumulator + `<li><span class="k">${currentPropertyKey}</span>: ${elementData.properties[currentPropertyKey]}</li>`;
                        }
                        return accumulator;
                    }, '');

                    if (elementData.geometry.type === 'Point' && osmly.mode.now === 'import') {
                        popupContentString += `<li class="merge"
                            data-layer-id="${sequentialElementIndex}"
                            data-tags='${JSON.stringify(elementData.properties)}'
                            style="
                            margin-top: 10px;
                            text-align: center;
                            padding: 10px 0;
                            border: 1px solid #aaa;
                            background-color: #eee;
                            cursor: pointer;
                            ">Merge with import data</li>`;
                    }

                    elementData.properties._id = sequentialElementIndex;
                    displayLayer.bindPopup(popupContentString);
                    displayLayer._popup._content = popupContentString;
                    displayLayer.bindLabel(displayLabelText);
                    sequentialElementIndex++;
                },
                pointToLayer: (elementData, geographicLocation) => {
                    return L.circleMarker(geographicLocation, {
                        radius: 6,
                        opacity: 1,
                        fillOpacity: 0.33
                    });
                }
            });
        };

        visualSurface.obtainContextData = (geographicBounds, extentMargin, actionOnCompletion) => {
            const adjustedGeographicBounds = extentMargin
                ? geographicBounds.map((value, index) => value + (index < 2 ? -extentMargin : extentMargin))
                : geographicBounds;

            if (visualSurface.hasLayer(contextualOverlayInstance)) {
                visualSurface.removeLayer(contextualOverlayInstance);
            }

            interfaceNotifier('Acquiring nearby spatial data');

            retrieveOpenStreetMapData(adjustedGeographicBounds, (retrievedData) => {
                interfaceNotifier('Rendering spatial data');
                const filteredAndParsedGeoJson = filterGeoSpatialElements(osm_geojson.osm2geojson(retrievedData, true));
                instantiateContextualOverlay(filteredAndParsedGeoJson);
                visualSurface.addLayer(contextualOverlayInstance);
                actionOnCompletion();
            });
        };

        visualSurface.toggleOverlayVisibility = (targetOverlay) => {
            visualSurface.hasLayer(targetOverlay)
                ? visualSurface.removeLayer(targetOverlay)
                : visualSurface.addLayer(targetOverlay);
        };

        visualSurface.presentFeature = (featureGeoJson, enableModifications, makeLayerVisible) => {
            focusedFeatureOverlayInstance = L.geoJson(featureGeoJson, {
                style: featureLayerStyle,
                onEachFeature: (elementData, displayLayer) => {
                    if (enableModifications) {
                        const geometryType = elementData.geometry.type;
                        const editingActivationStrategy = new Map([
                            ['MultiPolygon', () => Object.values(displayLayer._layers).forEach(childLayer => childLayer.editing.enable())],
                            ['Point', () => { displayLayer.options.draggable = true; }],
                            ['default', () => displayLayer.editing.enable()]
                        ]);

                        const chosenStrategy = editingActivationStrategy.get(geometryType) || editingActivationStrategy.get('default');
                        chosenStrategy();
                    }
                }
            });

            visualSurface.fitBounds(focusedFeatureOverlayInstance.getBounds());

            if (makeLayerVisible) {
                focusedFeatureOverlayInstance.addTo(visualSurface);
                focusedFeatureOverlayInstance.bringToFront();
            }
        };

        return visualSurface;
    }

    return {
        createInteractiveView: createInteractiveView
    };

})();

osmly.map = mappingUtility.createInteractiveView;