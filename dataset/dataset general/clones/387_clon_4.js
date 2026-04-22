(function (globalScope, domInterface, undefValue) {
    const _MappingCore = globalScope.L; // Alias for Leaflet library

    // Essential library components availability check
    if (!_MappingCore || !_MappingCore.GeoJSON) {
        return;
    }

    // Divergent aliases for Leaflet's core types and functions
    _MappingCore.GeographicDataFormat = _MappingCore.GeoJSON;
    _MappingCore.PointVisualizer = _MappingCore.Marker;
    _MappingCore.createVisualIcon = _MappingCore.icon;

    // Custom utility for merging configuration objects (replaces L.extend)
    const _SettingsManager = {
        combine: function (...sources) {
            return Object.assign({}, ...sources);
        },
        // Custom utility to apply configuration to an instance (replaces L.setOptions)
        applyToInstance: function (targetInstance, newSettings) {
            if (!targetInstance.options) {
                targetInstance.options = {};
            }
            Object.assign(targetInstance.options, newSettings);
        }
    };

    // Custom string formatting utility (replaces L.Util.template)
    const _StringFormatter = {
        interpolate: function (textPattern, dataFields) {
            return textPattern.replace(/\{ *(\w+) *\}/g, function (match, key) {
                return dataFields && dataFields.hasOwnProperty(key) ? dataFields[key] : match;
            });
        }
    };

    // Encapsulated logic for processing individual GeoJSON features
    const _FeatureProcessor = {
        processElement: function (inputFeature, displayComponent, initialConfig) {
            // Execute any user-defined callback first
            if (initialConfig && initialConfig.perFeatureCallback) {
                initialConfig.perFeatureCallback(inputFeature, displayComponent);
            }

            const visualDefinition = inputFeature.elementStyle;
            const notificationTemplate = inputFeature.notificationTemplate;

            // Apply visual styling based on feature properties
            if (visualDefinition) {
                if (displayComponent instanceof _MappingCore.PointVisualizer) {
                    if (visualDefinition.iconDescription) {
                        // Call Leaflet's original setIcon method
                        displayComponent.setIcon(_MappingCore.createVisualIcon(visualDefinition.iconDescription));
                    }
                } else {
                    // Call Leaflet's original setStyle method
                    displayComponent.setStyle(visualDefinition);
                }
            }

            // Bind popup if a template and properties are available
            if (notificationTemplate && inputFeature.attributeDetails) {
                const formattedContent = _StringFormatter.interpolate(notificationTemplate, inputFeature.attributeDetails);
                // Call Leaflet's original bindPopup method
                displayComponent.bindPopup(formattedContent);
            }
        }
    };

    // Definition of the new specialized GeoJSON handler class
    function VisualizedGeoContainer(initialDataPayload, specificSettings) {
        // Construct the combined configuration, incorporating the custom feature processor
        const processedSettings = _SettingsManager.combine({}, specificSettings, {
            onEachFeature: function(featureData, displayElement) {
                _FeatureProcessor.processElement(featureData, displayElement, specificSettings);
            }
        });

        // Apply the processed settings to this instance (mimics L.setOptions)
        _SettingsManager.applyToInstance(this, processedSettings);

        // Initialize internal registry for components (mimics this._layers = {})
        this._componentRegistry = {};

        // If initial data is provided, add it (mimics this.addData(geojson))
        if (initialDataPayload) {
            this.insertData(initialDataPayload);
        }
    }

    // Establish inheritance from Leaflet's GeoJSON class
    VisualizedGeoContainer.prototype = Object.create(_MappingCore.GeographicDataFormat.prototype);
    VisualizedGeoContainer.prototype.constructor = VisualizedGeoContainer;

    // Delegate and rename common methods from the parent L.GeoJSON class
    VisualizedGeoContainer.prototype.insertData = _MappingCore.GeographicDataFormat.prototype.addData;
    VisualizedGeoContainer.prototype.removeComponent = _MappingCore.GeographicDataFormat.prototype.removeLayer;
    VisualizedGeoContainer.prototype.clearComponents = _MappingCore.GeographicDataFormat.prototype.clearLayers;
    VisualizedGeoContainer.prototype.getComponents = _MappingCore.GeographicDataFormat.prototype.getLayers;
    VisualizedGeoContainer.prototype.iterateComponents = _MappingCore.GeographicDataFormat.prototype.eachLayer;
    VisualizedGeoContainer.prototype.attachToMap = _MappingCore.GeographicDataFormat.prototype.addTo;

    // Attach the new class to the Leaflet namespace under a new name
    _MappingCore.GeographicDataFormat.Visualizer = VisualizedGeoContainer;

    // Create a new factory function for convenient instantiation
    _MappingCore.geoJson = _MappingCore.geoJson || {};
    _MappingCore.geoJson.visualized = function (inputData, configuration) {
        return new VisualizedGeoContainer(inputData, configuration);
    };

})(window, document);