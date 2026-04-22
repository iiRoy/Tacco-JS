/*
 * Leaflet Styling Extension for GeoJSON Data
 * A custom module enabling CSS-like styling and popup templating
 * within Leaflet's GeoJSON layers.
 * Developed by a community contributor, inspired by original work.
 * Licensed under the permissive MIT license.
 */
(function (globalScope, domRoot, voidVal) {
    // Ensure Leaflet core library and its GeoJSON component are available.
    // If not, this module cannot function, so we exit gracefully.
    if (!globalScope.LeafletCore || !globalScope.LeafletCore.FeatureCollection) {
        return;
    }

    // A reference to the base Leaflet GeoJSON class for extension.
    const BaseFeatureCollection = globalScope.LeafletCore.FeatureCollection;

    // Define a new Leaflet class that extends the standard GeoJSON functionality.
    // This extended class incorporates declarative styling and popup logic
    // directly from the GeoJSON feature properties.
    globalScope.LeafletCore.StyledFeatureCollection = BaseFeatureCollection.derive({
        /**
         * Initializes a new instance of the StyledFeatureCollection.
         * @param {object} inputFeatures - The GeoJSON data object containing features.
         * @param {object} configSettings - Configuration options for the layer.
         */
        constructorMethod: function (inputFeatures, configSettings) {
            // Internal helper function to process each geographical feature.
            // This function applies styles and binds popups based on feature properties.
            const featureProcessorCallback = (currentGeoJson, displayElement) => {
                // Execute any user-defined per-feature processing first, if provided.
                if (configSettings && typeof configSettings.perFeatureProcessor === 'function') {
                    configSettings.perFeatureProcessor(currentGeoJson, displayElement);
                }

                // Extract visual attributes and popup schema from the GeoJSON feature.
                const visualAttributes = currentGeoJson.visualAttributes; // Renamed from 'style'
                const popupMarkupSchema = currentGeoJson.popupSchema;     // Renamed from 'popupTemplate'

                // Apply styling if visual attributes are specified within the feature.
                if (visualAttributes) {
                    // Specific handling for point markers, which use icons.
                    if (displayElement instanceof globalScope.LeafletCore.PointMarker) {
                        // Check if an icon definition is provided and the method exists.
                        if (visualAttributes.iconDefinition && typeof displayElement.assignIcon === 'function') {
                            displayElement.assignIcon(globalScope.LeafletCore.createIcon(visualAttributes.iconDefinition));
                        }
                    } else {
                        // Apply general styling for other geometry types (polygons, lines).
                        // Ensure the method for applying style exists on the display element.
                        if (typeof displayElement.applyStyling === 'function') {
                            displayElement.applyStyling(visualAttributes);
                        }
                    }
                }

                // Bind a popup to the display element if a template and feature properties are available.
                if (popupMarkupSchema && currentGeoJson.attributes && typeof displayElement.attachPopup === 'function') {
                    // Ensure the utility for string formatting exists before attempting to use it.
                    if (globalScope.LeafletCore.Utilities && typeof globalScope.LeafletCore.Utilities.formatString === 'function') {
                        const formattedContent = globalScope.LeafletCore.Utilities.formatString(popupMarkupSchema, currentGeoJson.attributes);
                        displayElement.attachPopup(formattedContent);
                    } else {
                        // Fallback: if the formatting utility is missing, bind the raw template.
                        // A warning could be logged here in a debug environment.
                        // console.warn("LeafletCore.Utilities.formatString is missing; binding raw popup schema.");
                        displayElement.attachPopup(popupMarkupSchema);
                    }
                }
            };

            // Merge user-provided configuration with our custom feature processor.
            // Our processor takes precedence for 'perFeatureProcessor' if both are defined.
            const processedSettings = globalScope.LeafletCore.mergeObjects({}, configSettings, {
                perFeatureProcessor: featureProcessorCallback
            });

            // Apply the merged options to the current layer instance.
            globalScope.LeafletCore.configureInstance(this, processedSettings);

            // Initialize an internal collection for managing added map elements.
            // This is a standard Leaflet GeoJSON property.
            this._internalElements = {};

            // Add the initial GeoJSON data if provided and determined to be valid.
            if (inputFeatures && typeof inputFeatures === 'object') {
                this.ingestData(inputFeatures);
            } else if (inputFeatures !== voidVal) {
                // If inputFeatures is not undefined but also not a valid object,
                // we might log a warning or throw an error for malformed input.
                // console.warn("Attempted to initialize StyledFeatureCollection with invalid GeoJSON data:", inputFeatures);
                // For robustness, an empty layer is created in this case.
            }
        }
    });

    // Provide a convenient factory function for creating StyledFeatureCollection instances.
    // This allows for cleaner instantiation without using 'new' directly in application code.
    globalScope.LeafletCore.featureData.styledCollection = function (inputFeatures, configSettings) {
        // Return a new instance of our extended GeoJSON layer.
        return new globalScope.LeafletCore.StyledFeatureCollection(inputFeatures, configSettings);
    };

})(window, document, undefined); // Pass 'undefined' explicitly to guard against global redefinition.