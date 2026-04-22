class GeographicOverlayManager {
    #mapSurface;
    #currentOverlayIdentifier = null;
    #overlayRegistry = new Map();
    #pinCollection = [];

    constructor(containerElementSelector, initialLatitude, initialLongitude, initialZoom = 5, mapDisplayType = google.maps.MapTypeId.ROADMAP) {
        const initialCoordinates = { lat: initialLatitude, lng: initialLongitude };
        const mapConfiguration = {
            zoom: initialZoom,
            center: initialCoordinates,
            mapTypeId: mapDisplayType
        };

        const mapContainerElement = document.querySelector(containerElementSelector);
        if (!mapContainerElement) {
            console.error(`Map container element with selector '${containerElementSelector}' not found.`);
            return;
        }
        this.#mapSurface = new google.maps.Map(mapContainerElement, mapConfiguration);
    }

    #activatePointDetails(uniquePointId, associatedLocationPin) {
        if (this.#currentOverlayIdentifier !== null && this.#overlayRegistry.has(this.#currentOverlayIdentifier)) {
            const priorOverlay = this.#overlayRegistry.get(this.#currentOverlayIdentifier);
            if (priorOverlay && typeof priorOverlay.close === 'function') {
                priorOverlay.close();
            }
        }

        const desiredOverlay = this.#overlayRegistry.get(uniquePointId);
        if (desiredOverlay && typeof desiredOverlay.open === 'function') {
            desiredOverlay.open(this.#mapSurface, associatedLocationPin);
            this.#currentOverlayIdentifier = uniquePointId;
        }
    }

    async ingestGeographicData(dataSourceUrl) {
        try {
            const response = await fetch(dataSourceUrl);
            if (!response.ok) {
                throw new Error(`Data retrieval failed: ${response.status} ${response.statusText}`);
            }
            const receivedPoints = await response.json();

            const geographicBoundaryAccumulator = new google.maps.LatLngBounds();
            const collectedPinsForClustering = [];

            receivedPoints.forEach(pointEntry => {
                const pinGeographicPosition = { lat: pointEntry.Latitude, lng: pointEntry.Longitude };
                
                const locationPin = new google.maps.Marker({
                    position: pinGeographicPosition,
                    title: "Customized Location Marker! :-)",
                    icon: 'img/marcador.png'
                });

                const contentMarkup = `<div><p>${pointEntry.Descricao}</p></div>`;
                const detailWindowOptions = {
                    content: contentMarkup,
                    pixelOffset: new google.maps.Size(-150, 0)
                };

                const detailWindowInstance = new InfoBox(detailWindowOptions);
                this.#overlayRegistry.set(pointEntry.Id, detailWindowInstance);

                google.maps.event.addListener(locationPin, 'click', () => {
                    this.#activatePointDetails(pointEntry.Id, locationPin);
                });

                this.#pinCollection.push(locationPin);
                collectedPinsForClustering.push(locationPin);
                geographicBoundaryAccumulator.extend(pinGeographicPosition);
            });

            if (typeof MarkerClusterer !== 'undefined' && collectedPinsForClustering.length > 0) {
                new MarkerClusterer(this.#mapSurface, collectedPinsForClustering);
            }

            if (!geographicBoundaryAccumulator.isEmpty()) {
                this.#mapSurface.fitBounds(geographicBoundaryAccumulator);
            }

        } catch (dataLoadError) {
            console.error("Failed to process geographic data:", dataLoadError);
        }
    }
}

(async () => {
    const geoDisplayController = new GeographicOverlayManager(
        "#mapa",
        -18.8800397,
        -47.05878999999999
    );

    await geoDisplayController.ingestGeographicData('js/pontos.json');
})();