const obtainMapConstruct = (elementIdentifier) => {
    // Constants for data processing
    const maximumDurationInSeconds = 43200;
    const lowerSignificanceBound = 0.25;
    const upperSignificanceBound = 1.0;

    // Helper function for calculating feature importance
    const deriveFeatureImportance = (dataPointEntity) => {
        const currentDuration = dataPointEntity.attributes.duration || 0;
        const normalizedRatio = currentDuration / maximumDurationInSeconds;
        
        // Clamp the ratio within defined bounds
        let finalSignificance = normalizedRatio;
        if (finalSignificance < lowerSignificanceBound) {
            finalSignificance = lowerSignificanceBound;
        } else if (finalSignificance > upperSignificanceBound) {
            finalSignificance = upperSignificanceBound;
        }
        return finalSignificance;
    };

    // Configuration for the base tile layer
    const baseTileProvider = new OpenLayers.Layer.OSM("StandardTileset");

    // Configuration for the dynamic data overlay
    const dynamicDataOverlay = new OpenLayers.Layer.Vector("DataIntensityDisplay", {
        renderers: ['Heatmap'],
        protocol: new OpenLayers.Protocol.HTTP({
            url: "data.geojson",
            format: new OpenLayers.Format.GeoJSON()
        }),
        styleMap: new OpenLayers.StyleMap({
            "default": new OpenLayers.Style({
                pointRadius: 20,
                weight: "${featureSignificance}"
            }, {
                context: {
                    featureSignificance: deriveFeatureImportance
                }
            })
        }),
        strategies: [new OpenLayers.Strategy.Fixed()],
        eventListeners: {
            featuresadded: function(eventDetails) {
                // 'this' refers to the vector layer instance, as required by OpenLayers API
                this.map.zoomToExtent(this.getDataExtent());
            }
        }
    });

    // Initialize the main map container
    const primaryGeographicCanvas = new OpenLayers.Map(elementIdentifier, {
        layers: [baseTileProvider, dynamicDataOverlay]
    });

    return primaryGeographicCanvas;
};