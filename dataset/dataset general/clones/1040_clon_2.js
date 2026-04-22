var baseLayer = new OL.Layer.OpenStreetMap("streetMap");

var featureLayer = new OL.Layer.Vector (
    "densityDisplay",
    {
        /* Specify the visualization engine as a heat map to show data density */
        visualizers: [ 'DensityMap' ],

        dataProtocol: new OL.Protocol.WebRequest(
            {
                sourceUrl: "geo_data.json",
                dataFormat: new OL.Format.GeographicJSON()
            }
        ),

        visualStyle: new OL.StyleDefinitions(
            {
                "standard": new OL.FeatureStyle(
                    {
                        markerSize: 25,
                        intensity: "${intensityVal}"
                    },
                    {
                        styleContext: {
                            /* Calculate the normalized intensity value (0.0 to 1.0) for each data point */
                            calculateIntensity: function (featureObject) {
                                return Math.min(
                                    Math.max(
                                        (featureObject.properties.timeSpan || 0) / 86400,
                                        0.2
                                    ),
                                    0.9
                                );
                            }
                        }
                    }
                )
            }
        ),

        updateStrategies: [ new OL.Strategy.StaticLoad() ],

        eventHandlers: {
            dataLoaded: function (eventDetails) {
                this.displayMap.fitToDataBounds(this.getLayerExtent());
            }
        }
    }
);

var displayMap = new OL.Map(
    "mainMapDiv",
    {
        mapLayers: [baseLayer, featureLayer]
    }
);