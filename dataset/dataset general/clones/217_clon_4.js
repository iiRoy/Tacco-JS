const injectScriptElement = (sourceUrl, completionCallback) => {
    const scriptElement = document.createElement("SCRIPT");
    scriptElement.src = sourceUrl;
    scriptElement.onload = completionCallback;
    document.head.appendChild(scriptElement);
};

class ValueHolder {
    constructor(initialValue) {
        let currentVal = initialValue;
        const subscribers = new Set();

        this.get = () => currentVal;
        this.set = (newValue) => {
            if (newValue !== currentVal) {
                currentVal = newValue;
                subscribers.forEach(sub => sub(currentVal));
            }
        };
        this.subscribe = (callback) => {
            subscribers.add(callback);
            return () => subscribers.delete(callback);
        };
    }
}

class DerivedValue {
    constructor(computeFunction, dependencies) {
        let cachedValue;
        let isDirty = true;
        const subscribers = new Set();

        const update = () => {
            const newValue = computeFunction();
            if (newValue !== cachedValue) {
                cachedValue = newValue;
                subscribers.forEach(sub => sub(cachedValue));
            }
            isDirty = false;
        };

        dependencies.forEach(dep => {
            if (dep instanceof ValueHolder || dep instanceof DerivedValue) {
                dep.subscribe(() => {
                    isDirty = true;
                    update();
                });
            }
        });

        this.get = () => {
            if (isDirty) {
                update();
            }
            return cachedValue;
        };
        this.subscribe = (callback) => {
            subscribers.add(callback);
            return () => subscribers.delete(callback);
        };
        update();
    }
}

const applyCustomBindings = (viewModel, rootElement) => {
    const bindableElements = rootElement.querySelectorAll('[data-bind]');

    bindableElements.forEach(element => {
        const bindingString = element.getAttribute('data-bind');
        const bindings = bindingString.split(',').map(b => b.trim().split(':').map(p => p.trim()));

        bindings.forEach(([bindingType, propertyPath]) => {
            const property = propertyPath.split('.').reduce((obj, key) => obj && obj[key], viewModel);

            if (property && (property instanceof ValueHolder || property instanceof DerivedValue)) {
                if (bindingType === 'text') {
                    property.subscribe(value => element.textContent = value);
                    element.textContent = property.get();
                } else if (bindingType === 'value') {
                    property.subscribe(value => element.value = value);
                    element.value = property.get();
                    element.addEventListener('change', () => property.set(element.value));
                } else if (bindingType === 'checked') {
                    property.subscribe(value => element.checked = value);
                    element.checked = property.get();
                    element.addEventListener('change', () => property.set(element.checked));
                } else if (bindingType === 'visible') {
                    property.subscribe(value => element.style.display = value ? '' : 'none');
                    element.style.display = property.get() ? '' : 'none';
                }
            }
        });
    });
};

const activeGlobeInstances = new WeakMap();
const activeOverlayInstances = new WeakMap();
const activeVectorInstances = new WeakMap();

class GlobeContext {
    constructor(globeInstance) {
        const instanceRef = this;
        instanceRef.currentGlobe = globeInstance;
        instanceRef._zoomLevel = new ValueHolder(instanceRef.currentGlobe.getZoom());
        instanceRef._centerCoords = {
            latitude: new ValueHolder(instanceRef.currentGlobe.getCenter().lat),
            longitude: new ValueHolder(instanceRef.currentGlobe.getCenter().lng)
        };
        instanceRef._pointerLocation = {
            latitude: new ValueHolder(0.00),
            longitude: new ValueHolder(0.00)
        };

        globeInstance.on("zoomend", (eventData) => {
            instanceRef._zoomLevel.set(eventData.target.getZoom());
        });
        globeInstance.on("zoomend", (eventData) => {
            instanceRef._centerCoords.latitude.set(eventData.target.getCenter().lat);
            instanceRef._centerCoords.longitude.set(eventData.target.getCenter().lng);
        });
        globeInstance.on("moveend", (eventData) => {
            instanceRef._centerCoords.latitude.set(eventData.target.getCenter().lat);
            instanceRef._centerCoords.longitude.set(eventData.target.getCenter().lng);
        });

        instanceRef.zoomProperty = new DerivedValue(
            () => instanceRef._zoomLevel.get(),
            [instanceRef._zoomLevel]
        );
        instanceRef.zoomProperty.subscribe(newValue => {
            instanceRef.currentGlobe.setZoom(newValue);
            instanceRef._zoomLevel.set(newValue);
        });

        instanceRef.centerProperty = new DerivedValue(
            () => ({
                latitude: instanceRef._centerCoords.latitude.get(),
                longitude: instanceRef._centerCoords.longitude.get()
            }),
            [instanceRef._centerCoords.latitude, instanceRef._centerCoords.longitude]
        );
        instanceRef.centerProperty.subscribe(value => {
            if (value.latitude !== undefined && value.longitude !== undefined) {
                instanceRef.currentGlobe.setView(new L.LatLng(value.latitude, value.longitude), instanceRef.currentGlobe.getZoom());
            } else if (Array.isArray(value) && value.length === 2) {
                instanceRef.currentGlobe.setView(new L.LatLng(value[0], value[1]));
            }
        });

        globeInstance.on("mousemove", (eventData) => {
            instanceRef._pointerLocation.latitude.set(eventData.latlng.lat);
            instanceRef._pointerLocation.longitude.set(eventData.latlng.lng);
        });
        instanceRef.pointerLocationProperty = new DerivedValue(
            () => ({
                latitude: instanceRef._pointerLocation.latitude.get(),
                longitude: instanceRef._pointerLocation.longitude.get()
            }),
            [instanceRef._pointerLocation.latitude, instanceRef._pointerLocation.longitude]
        );
    }
}

class OverlayDisplay {
    constructor(layerReference, configurationElement) {
        const displayRef = this;
        displayRef.layerHandle = layerReference;
        displayRef.configElement = configurationElement;
        displayRef.uniqueId = configurationElement.id || layerReference._leaflet_id;
        displayRef.titleText = configurationElement.dataset.atlasLayerTitle || displayRef.uniqueId;
        displayRef.associatedFeatures = new ValueHolder([]);

        displayRef._visibilityState = new ValueHolder(true);
        displayRef.visibilityToggle = new DerivedValue(
            () => displayRef._visibilityState.get(),
            [displayRef._visibilityState]
        );
        displayRef.visibilityToggle.subscribe(value => {
            if (!value) {
                displayRef.layerHandle.setOpacity(0);
            } else {
                displayRef.layerHandle.setOpacity(1.0);
            }
            displayRef._visibilityState.set(value);
        });
    }
}

class ElementDisplay {
    constructor(layerReference, configurationElement) {
        const displayRef = this;
        displayRef.layerHandle = layerReference;
        displayRef.configElement = configurationElement;
        displayRef.uniqueId = configurationElement.id || layerReference._leaflet_id;
        displayRef.titleText = configurationElement.dataset.atlasLayerTitle || displayRef.uniqueId;
        displayRef.associatedFeatures = new ValueHolder([]);
        displayRef.selectedItems = new ValueHolder([]);

        const containedElements = displayRef.layerHandle.getLayers();
        containedElements.forEach(featureItem => {
            try {
                displayRef.associatedFeatures.get().push(new GeoElementDisplay(featureItem, displayRef.layerHandle));
            } catch (error) {
                console.error("Error creating GeoElementDisplay:", featureItem, error);
            }
        });
        displayRef.associatedFeatures.set([...displayRef.associatedFeatures.get()]);

        displayRef._visibilityState = new ValueHolder(layerReference._map && layerReference._map.hasLayer(layerReference));
        displayRef.visibilityToggle = new DerivedValue(
            () => displayRef._visibilityState.get(),
            [displayRef._visibilityState]
        );
        displayRef.visibilityToggle.subscribe(value => {
            if (displayRef.layerHandle._map) {
                if (!value && displayRef.layerHandle._map.hasLayer(displayRef.layerHandle)) {
                    displayRef.layerHandle._map.removeLayer(displayRef.layerHandle);
                } else if (value && !displayRef.layerHandle._map.hasLayer(displayRef.layerHandle)) {
                    displayRef.layerHandle._map.addLayer(displayRef.layerHandle);
                }
            }
            displayRef._visibilityState.set(displayRef.layerHandle._map && displayRef.layerHandle._map.hasLayer(displayRef.layerHandle));
        });
    }
}

class GeoElementDisplay {
    constructor(featureItem, parentLayer) {
        const displayRef = this;
        displayRef.rawFeature = featureItem;
        displayRef.featureData = featureItem.feature;
        displayRef.parentLayer = parentLayer;
        displayRef.iconData = displayRef.rawFeature._icon || null;

        if (displayRef.iconData) {
            displayRef.iconDetails = {
                source: displayRef.iconData.src,
                markup: displayRef.iconData.outerHTML
            };
        } else {
            displayRef.iconDetails = {
                source: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                markup: ""
            };
        }

        displayRef.geographicShape = displayRef.featureData.geometry;
        const propContainer = {};
        for (const propName in displayRef.featureData.properties) {
            if (typeof(displayRef.featureData.properties[propName]) !== "function") {
                propContainer[propName] = new ValueHolder(displayRef.featureData.properties[propName]);
            }
        }
        displayRef.attributes = propContainer;
        displayRef.isSelected = new ValueHolder(false);

        displayRef.displayPopup = () => {
            displayRef.rawFeature.openPopup();
        };

        displayRef.hidePopup = () => {
            displayRef.rawFeature.closePopup();
        };
    }
}

const AtlasForge = (() => {
    const defaultGlobeSettings = {
        operation: "",
        geographicCenter: "51.505, -0.09",
        geographicZoom: 13,
        baseLayerType: "Esri.WorldGrayCanvas",
        showOverlays: true
    };

    const defaultTileOverlaySettings = {
        operation: "",
        overlayType: "Esri.WorldGrayCanvas"
    };

    const defaultVectorOverlaySettings = {
        operation: "",
        vectorDataType: "geojson"
    };

    const createGlobeInstance = (element, options) => {
        const settings = Object.assign({}, defaultGlobeSettings, options);

        settings.geographicCenter = settings.geographicCenter.split(",").map(coord => parseFloat(coord.trim()));

        const mapContainer = element;
        const mapIdentifier = mapContainer.id;

        const instanceData = {
            settings: settings,
            mapIdentifier: mapIdentifier
        };
        activeGlobeInstances.set(mapContainer, instanceData);
        mapContainer.classList.add("atlas-globe-active");

        let initialLayers = [];
        let baseLayerSpecified = true;
        const baseLayerCollection = {};

        if (settings.baseLayerType === "None") {
            baseLayerSpecified = false;
        } else {
            const primaryBaseLayer = L.tileLayer.provider(settings.baseLayerType);
            baseLayerCollection[settings.baseLayerType.replace(".", " - ")] = primaryBaseLayer;
            initialLayers.push(primaryBaseLayer);
        }

        document.querySelectorAll(`[data-atlas-type='base-layer'][data-atlas-map='${mapIdentifier}']`).forEach(layerElement => {
            const layerData = layerElement.dataset;
            const customBaseLayer = L.tileLayer.provider(layerData.atlasBasemap);
            baseLayerCollection[layerData.atlasBasemap.replace(".", " - ")] = customBaseLayer;
            if (!baseLayerSpecified) {
                initialLayers.push(customBaseLayer);
            }
        });

        document.querySelectorAll(`[data-atlas-type='tile-overlay'][data-atlas-map='${mapIdentifier}']`).forEach(layerElement => {
            const overlayHandle = AtlasForge.initializeTileOverlay(layerElement, layerElement.dataset);
            if (overlayHandle && overlayHandle.leafLayer) {
                initialLayers.push(overlayHandle.leafLayer);
            }
        });

        const leafletMap = L.map(mapContainer, {
            center: new L.LatLng(settings.geographicCenter[0], settings.geographicCenter[1]),
            zoom: settings.geographicZoom,
            layers: initialLayers
        });

        leafletMap.onAdd = function(ll) {
            console.log("GLOBE ONADD", ll);
        };
        mapContainer.internalMapRef = leafletMap;

        document.querySelectorAll(`[data-atlas-binding='${mapIdentifier}']`).forEach(uiElement => {
            const globeViewModel = new GlobeContext(mapContainer.internalMapRef);
            mapContainer.globeViewModelRef = globeViewModel;
            applyCustomBindings(globeViewModel, uiElement);
        });

        document.querySelectorAll(`[data-atlas-type='tile-overlay'][data-atlas-map='${mapIdentifier}']`).forEach(layerElement => {
            document.querySelectorAll(`[data-atlas-binding='${layerElement.id}']`).forEach(uiElement => {
                if (!layerElement.overlayViewModelRef) {
                    layerElement.overlayViewModelRef = new OverlayDisplay(layerElement.internalLayerRef, layerElement);
                }
                applyCustomBindings(layerElement.overlayViewModelRef, uiElement);
            });
        });

        document.querySelectorAll(`[data-atlas-type='vector-overlay'][data-atlas-map='${mapIdentifier}']`).forEach(layerElement => {
            AtlasForge.initializeVectorOverlay(layerElement, layerElement.dataset);
        });

        return {
            globeInstance: leafletMap,
            data: instanceData,
            destroy: () => {
                leafletMap.remove();
                mapContainer.internalMapRef = null;
                mapContainer.globeViewModelRef = null;
                activeGlobeInstances.delete(mapContainer);
                mapContainer.classList.remove("atlas-globe-active");
            }
        };
    };

    const initializeTileOverlay = (element, options) => {
        const settings = Object.assign({}, defaultTileOverlaySettings, options);

        const existingInstance = activeOverlayInstances.get(element);
        if (element.classList.contains("atlas-tile-overlay-active")) {
            return {
                leafLayer: element.internalLayerRef,
                data: existingInstance
            };
        }

        element.classList.add("atlas-tile-overlay-active");
        const layerIdentifier = element.id;

        const instanceData = {
            settings: settings,
            layerIdentifier: layerIdentifier
        };
        activeOverlayInstances.set(element, instanceData);

        let leafletLayer;
        if (settings.overlayType === "ArcGIS") {
            leafletLayer = L.tileLayer(settings.geoLayerUrl + "/tile/{z}/{y}/{x}");
        } else if (settings.overlayType === "TMS") {
            leafletLayer = L.tileLayer(settings.geoLayerUrl);
        } else if (settings.overlayType === "WMS") {
            const wmsParams = {
                layers: settings.wmsLayers || '*',
                format: settings.wmsFormat || 'image/png',
                transparent: settings.wmsTransparent !== undefined ? (settings.wmsTransparent === "true" || settings.wmsTransparent === true) : true
            };
            leafletLayer = L.tileLayer.wms(settings.geoLayerUrl, wmsParams);
        } else {
            leafletLayer = L.tileLayer.provider(settings.overlayType);
        }
        element.internalLayerRef = leafletLayer;

        return {
            leafLayer: leafletLayer,
            data: instanceData,
            destroy: () => {
                if (leafletLayer._map) {
                    leafletLayer._map.removeLayer(leafletLayer);
                }
                element.internalLayerRef = null;
                element.overlayViewModelRef = null;
                activeOverlayInstances.delete(element);
                element.classList.remove("atlas-tile-overlay-active");
            }
        };
    };

    const initializeVectorOverlay = (element, options) => {
        const settings = Object.assign({}, defaultVectorOverlaySettings, options);

        const existingInstance = activeVectorInstances.get(element);
        if (element.classList.contains("atlas-vector-overlay-active")) {
            return {
                leafLayer: element.internalLayerRef,
                data: existingInstance
            };
        }

        element.classList.add("atlas-vector-overlay-active");
        const layerIdentifier = element.id;

        const instanceData = {
            settings: settings,
            layerIdentifier: layerIdentifier
        };
        activeVectorInstances.set(element, instanceData);
        let leafletVectorLayer;
        const mapElement = document.getElementById(settings.geoMap);

        let popupRenderer = null;
        const popupTemplateElement = document.querySelector(`[data-atlas-type='layer-popup'][data-atlas-layer='${layerIdentifier}']`);
        if (popupTemplateElement) {
            const templateContentType = popupTemplateElement.dataset.contentType;
            if (templateContentType && templateContentType.toLowerCase() === "script") {
                try {
                    popupRenderer = new Function('properties', popupTemplateElement.innerHTML.trim());
                } catch (err) {
                    console.error("Error parsing popup template script:", err);
                }
            } else {
                const templateContent = popupTemplateElement.innerHTML.trim();
                if (templateContent.length > 0) {
                    popupRenderer = (properties) => {
                        let html = templateContent;
                        for (const key in properties) {
                            html = html.replace(new RegExp(`{{${key}}}`, 'g'), properties[key]);
                        }
                        return html;
                    };
                }
            }
        }

        let symbologyConfig = null;
        const styleElement = document.querySelector(`[data-atlas-type='geo-style'][data-atlas-layer='${layerIdentifier}']`);
        if (styleElement) {
            try {
                symbologyConfig = new Function(`return ${styleElement.innerHTML.trim()}`)();
            } catch (err) {
                console.error("Error parsing symbology object:", err);
            }
        }

        const getFeatureStyle = (feature, styleRules) => {
            if (!styleRules) return {};
            if (typeof styleRules === 'function') {
                return styleRules(feature);
            }
            return styleRules;
        };

        const getPointMarker = (feature, latlng, styleRules) => {
            const markerOptions = getFeatureStyle(feature, styleRules);
            return L.marker(latlng, markerOptions);
        };


        if (settings.vectorDataType === "geojson") {
            if (settings.geoLayerUrl) {
                fetch(settings.geoLayerUrl)
                    .then(response => response.json())
                    .then(geoJsonData => {
                        leafletVectorLayer = L.geoJson(geoJsonData, {
                            pointToLayer: (feature, latlng) => getPointMarker(feature, latlng, symbologyConfig),
                            style: (feature) => getFeatureStyle(feature, symbologyConfig),
                            onEachFeature: (feature, layer) => {
                                if (popupRenderer) {
                                    layer.bindPopup(() => popupRenderer(feature.properties));
                                }
                            }
                        });
                        element.internalLayerRef = leafletVectorLayer;

                        if (mapElement && mapElement.internalMapRef) {
                            leafletVectorLayer.addTo(mapElement.internalMapRef);

                            document.querySelectorAll(`[data-atlas-binding='${layerIdentifier}']`).forEach(uiElement => {
                                if (!element.vectorViewModelRef) {
                                    element.vectorViewModelRef = new ElementDisplay(element.internalLayerRef, element);
                                }
                                applyCustomBindings(element.vectorViewModelRef, uiElement);
                            });
                        }
                    })
                    .catch(error => console.error("Error fetching GeoJSON data:", error));
            }
        }

        return {
            leafLayer: leafletVectorLayer,
            data: instanceData,
            destroy: () => {
                if (leafletVectorLayer && leafletVectorLayer._map) {
                    leafletVectorLayer._map.removeLayer(leafletVectorLayer);
                }
                element.internalLayerRef = null;
                element.vectorViewModelRef = null;
                activeVectorInstances.delete(element);
                element.classList.remove("atlas-vector-overlay-active");
            }
        };
    };

    return {
        initializeGlobe: (targetElement, options) => {
            const existingInstance = activeGlobeInstances.get(targetElement);
            if (existingInstance) {
                if (typeof options === 'string' && existingInstance[options]) {
                    console.warn(`AtlasForge: Method '${options}' called on existing globe instance. Re-initialization ignored.`);
                    return existingInstance[options]();
                } else {
                    console.warn("AtlasForge: Globe already initialized on this element. Re-initializing with new options.");
                    return createGlobeInstance(targetElement, options);
                }
            }
            return createGlobeInstance(targetElement, options);
        },
        initializeTileOverlay: (targetElement, options) => {
            const existingInstance = activeOverlayInstances.get(targetElement);
            if (existingInstance) {
                if (typeof options === 'string' && existingInstance[options]) {
                    console.warn(`AtlasForge: Method '${options}' called on existing tile overlay. Re-initialization ignored.`);
                    return existingInstance[options]();
                } else {
                    console.warn("AtlasForge: Tile overlay already initialized on this element. Re-initializing with new options.");
                    return initializeTileOverlay(targetElement, options);
                }
            }
            return initializeTileOverlay(targetElement, options);
        },
        initializeVectorOverlay: (targetElement, options) => {
            const existingInstance = activeVectorInstances.get(targetElement);
            if (existingInstance) {
                if (typeof options === 'string' && existingInstance[options]) {
                    console.warn(`AtlasForge: Method '${options}' called on existing vector overlay. Re-initialization ignored.`);
                    return existingInstance[options]();
                } else {
                    console.warn("AtlasForge: Vector overlay already initialized on this element. Re-initializing with new options.");
                    return initializeVectorOverlay(targetElement, options);
                }
            }
            return initializeVectorOverlay(targetElement, options);
        },
        globeSettings: defaultGlobeSettings,
        tileOverlaySettings: defaultTileOverlaySettings,
        vectorOverlaySettings: defaultVectorOverlaySettings,
        loadExternalScript: injectScriptElement
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    console.log("AtlasForge Activated!");

    document.querySelectorAll('[data-atlas-type="globe"]').forEach(mapElement => {
        const mapOptions = mapElement.dataset;
        AtlasForge.initializeGlobe(mapElement, mapOptions);
    });
});