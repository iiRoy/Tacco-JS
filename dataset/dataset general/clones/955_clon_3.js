(function() {
    // This self-executing function encapsulates the library's modules.
    // It simulates a simplified module system, replacing the original complex Browserify bundle.

    const moduleRegistry = {}; // Stores our 'modules' by their internal identifier.

    /**
     * Defines and registers a module within the library's internal registry.
     * @param {string} moduleIdentifier - A unique name for the module.
     * @param {function} moduleFactory - The factory function that provides the module's exports.
     *                                 It receives 'obtain' (local require), 'currentModule' (module object),
     *                                 and 'currentExports' (exports object) as arguments.
     */
    function provideModule(moduleIdentifier, moduleFactory) {
        // Initialize the module entry with an empty exports object.
        moduleRegistry[moduleIdentifier] = {
            exports: {}
        };

        // Create a local 'require' function for this module to resolve dependencies.
        const obtain = (dependencyId) => {
            if (!moduleRegistry[dependencyId]) {
                console.error(`Dependency '${dependencyId}' not found for module '${moduleIdentifier}'.`);
                throw new Error(`Dependency '${dependencyId}' not found.`);
            }
            return moduleRegistry[dependencyId].exports;
        };

        // Execute the module factory, populating its exports.
        try {
            moduleFactory(obtain, moduleRegistry[moduleIdentifier], moduleRegistry[moduleIdentifier].exports);
        } catch (error) {
            console.error(`Error initializing module '${moduleIdentifier}':`, error);
            throw error;
        }
    }

    // --- Internal Module: Library Info (simplified from package.json) ---
    // Original module '1' content (package.json) is now streamlined.
    provideModule('libraryInfo', (obtain, currentModule, currentExports) => {
        "use strict";
        // This module provides basic library information.
        currentExports.version = '0.4.5-clone'; // A new version for this cloned library.
        currentExports.name = 'd3-map-visualizer-clone';
        currentExports.description = 'Enhanced layer-based geographical visualization for D3.js';
    });

    // --- Internal Module: Component Layer Definition (formerly layer.js) ---
    // Original module '3' content.
    provideModule('componentLayer', (obtain, currentModule, currentExports) => {
        "use strict";

        // Attempt to get D3 from various global contexts.
        const d3Reference = (typeof window !== "undefined" && window.d3) ||
                            (typeof global !== "undefined" && global.d3) ||
                            (typeof self !== "undefined" && self.d3);

        if (!d3Reference) {
            console.error("D3 library not found. GeoVisualizer components may not function correctly.");
            // We'll proceed, but methods relying on D3 might fail.
        }

        /**
         * Represents a configurable data layer for the geographical visualizer.
         * This function serves as the constructor for new layer instances.
         * @returns {object} A new layer instance with chainable methods.
         */
        const MapComponentProvider = function() {
            // Internal state variables for the layer.
            let sourceDataLocator = ""; // Path or URL to data.
            let componentContentType = ""; // Type of data (e.g., "geojson", "csv").
            let componentIsVisible = true; // Layer visibility toggle.
            let componentIsActive = true; // Layer interaction toggle.
            let renderingStrategy = "canvas"; // How the layer should be drawn ("canvas" or "svg").
            let cssClassName = "default-component-style"; // CSS class for styling.
            let displayLabelText = "unlabeled-component"; // Human-readable label.
            let xValueAccessor = (d) => d["x"]; // Function to get X coordinate.
            let yValueAccessor = (d) => d["y"]; // Function to get Y coordinate.
            let svgGroupElementRef; // Reference to the SVG group element for this layer.
            let internalComponentRef; // General object reference for internal use (e.g., D3 selection).
            let featureDataSet; // The actual data array for features.
            let baseTileStyle = "mapbox"; // For tile layers, specifies the tile provider.
            let specificFeatureIdentifier = "all"; // Used to filter specific features.
            let pointVisualSizeCalc = () => 5; // Function to determine marker size.
            let pointFillColorCalc; // Function to determine marker color.
            let outlineColorCalc; // Function to determine stroke color.
            let outlineThicknessCalc; // Function to determine stroke width.
            let clusteringEnabled = false; // Flag to enable/disable point clustering.
            let interactiveElements = false; // Flag for clickable features.
            let linkedDialogInstance; // Reference to a D3 modal/dialog component.
            let rawDataCollection; // The original dataset before processing.
            const creationTimestamp = Date.now(); // Timestamp for layer creation.
            const componentUniqueId = `layer-${Math.random().toString(36).substring(2, 9)}`; // Unique ID for this component.

            // Event dispatcher for custom events like load, recluster, newmodal.
            const componentEventBus = d3Reference ? d3Reference.dispatch('dataLoaded', 'reclusterTriggered', 'dialogBound') : null;

            // Helper for setting properties with getter/setter pattern.
            const propertySetter = (currentValue, newValue, handler = null) => {
                if (newValue === undefined) { // If no argument, act as a getter.
                    return currentValue;
                }
                // If a new value is provided, update and return 'this' for chaining.
                currentValue = newValue;
                if (handler && typeof handler === 'function') handler();
                return component;
            };

            /**
             * The core layer instance function.
             */
            const component = function() {
                // Initial setup or rendering logic can go here.
            };

            // --- Getter/Setter Methods for Layer Properties ---

            component.dataLocation = function(newPath) {
                return propertySetter(sourceDataLocator, newPath, () => {
                    if (typeof newPath !== 'string' && newPath !== undefined) {
                        console.warn(`Layer '${displayLabelText}': dataLocation expects a string, received ${typeof newPath}.`);
                    }
                    sourceDataLocator = newPath;
                });
            };

            component.contentType = function(newType) {
                return propertySetter(componentContentType, newType, () => {
                    if (typeof newType !== 'string' && newType !== undefined) {
                        console.warn(`Layer '${displayLabelText}': contentType expects a string, received ${typeof newType}.`);
                    }
                    componentContentType = newType;
                });
            };

            component.visibilityState = function(newVisibility) {
                return propertySetter(componentIsVisible, newVisibility, () => {
                    if (typeof newVisibility !== 'boolean' && newVisibility !== undefined) {
                        console.warn(`Layer '${displayLabelText}': visibilityState expects a boolean, received ${typeof newVisibility}.`);
                    }
                    componentIsVisible = newVisibility;
                });
            };

            component.renderMethod = function(newMode) {
                return propertySetter(renderingStrategy, newMode, () => {
                    if (typeof newMode !== 'string' && newMode !== undefined) {
                        console.warn(`Layer '${displayLabelText}': renderMethod expects a string, received ${typeof newMode}.`);
                    }
                    renderingStrategy = newMode;
                });
            };

            component.interactiveState = function(newState) {
                return propertySetter(interactiveElements, newState, () => {
                    if (typeof newState !== 'boolean' && newState !== undefined) {
                        console.warn(`Layer '${displayLabelText}': interactiveState expects a boolean, received ${typeof newState}.`);
                    }
                    interactiveElements = newState;
                });
            };

            component.bindDialog = function(newDialog) {
                return propertySetter(linkedDialogInstance, newDialog, () => {
                    linkedDialogInstance = newDialog;
                    componentEventBus && componentEventBus.dialogBound();
                });
            };

            // Accessor setters with type-dependent logic
            const createAccessorSetter = (currentAccessor, accessorVarName) => function(newVal) {
                if (newVal === undefined) return currentAccessor;
                if (typeof newVal === "function") {
                    currentAccessor = newVal;
                } else if (typeof newVal === "number") {
                    currentAccessor = (d) => newVal;
                } else if (typeof newVal === "string") { // Assume it's a property name
                    currentAccessor = (d) => d[newVal];
                } else {
                    console.warn(`Layer '${displayLabelText}': Invalid type for ${accessorVarName}, expected function, number, or string. Received ${typeof newVal}.`);
                    return component; // Return early on invalid input.
                }
                return component;
            };

            component.setXAccessor = createAccessorSetter(xValueAccessor, "X accessor");
            component.setYAccessor = createAccessorSetter(yValueAccessor, "Y accessor");
            component.pointSize = createAccessorSetter(pointVisualSizeCalc, "point size");
            component.pointColor = createAccessorSetter(pointFillColorCalc, "point color");
            component.lineColor = createAccessorSetter(outlineColorCalc, "line color");
            component.lineWidth = createAccessorSetter(outlineThicknessCalc, "line width");

            component.applyCssClass = function(newClass) {
                return propertySetter(cssClassName, newClass, () => {
                    if (typeof newClass !== 'string' && newClass !== undefined) {
                        console.warn(`Layer '${displayLabelText}': applyCssClass expects a string, received ${typeof newClass}.`);
                    }
                    cssClassName = newClass;
                });
            };

            component.assignSvgGroup = function(newSvgGroup) {
                return propertySetter(svgGroupElementRef, newSvgGroup, () => {
                    svgGroupElementRef = newSvgGroup;
                });
            };

            component.setInternalObject = function(newObject) {
                return propertySetter(internalComponentRef, newObject, () => {
                    internalComponentRef = newObject;
                    componentEventBus && componentEventBus.dataLoaded();
                });
            };

            component.setFeatureData = function(newFeatures) {
                return propertySetter(featureDataSet, newFeatures, () => {
                    featureDataSet = newFeatures;
                });
            };

            component.tileProvider = function(newType) {
                return propertySetter(baseTileStyle, newType, () => {
                    if (typeof newType !== 'string' && newType !== undefined) {
                        console.warn(`Layer '${displayLabelText}': tileProvider expects a string, received ${typeof newType}.`);
                    }
                    baseTileStyle = newType;
                });
            };

            component.displayLabel = function(newLabel) {
                return propertySetter(displayLabelText, newLabel, () => {
                    if (typeof newLabel !== 'string' && newLabel !== undefined) {
                        console.warn(`Layer '${displayLabelText}': displayLabel expects a string, received ${typeof newLabel}.`);
                    }
                    displayLabelText = newLabel;
                });
            };

            component.targetSpecificFeature = function(newSpecific) {
                return propertySetter(specificFeatureIdentifier, newSpecific, () => {
                    if (typeof newSpecific !== 'string' && newSpecific !== undefined) {
                        console.warn(`Layer '${displayLabelText}': targetSpecificFeature expects a string, received ${typeof newSpecific}.`);
                    }
                    specificFeatureIdentifier = newSpecific;
                });
            };

            component.setRawDataSet = function(newDataset) {
                return propertySetter(rawDataCollection, newDataset, () => {
                    rawDataCollection = newDataset;
                });
            };

            component.enableClustering = function(newClusterSetting) {
                return propertySetter(clusteringEnabled, newClusterSetting, () => {
                    if (typeof newClusterSetting !== 'boolean' && newClusterSetting !== undefined) {
                        console.warn(`Layer '${displayLabelText}': enableClustering expects a boolean, received ${typeof newClusterSetting}.`);
                    }
                    clusteringEnabled = newClusterSetting;
                });
            };

            // Trigger methods
            component.triggerReclustering = function() {
                clusteringEnabled && componentEventBus && componentEventBus.reclusterTriggered();
                return component;
            };

            component.getClusterLayerRef = function() {
                return internalComponentRef && internalComponentRef.qtreeLayer;
            };

            // Expose internal ID for debugging/management
            component.getUniqueId = () => componentUniqueId;
            component.getCreationTime = () => creationTimestamp;

            // Rebind D3 event handling to the component (if D3 is available)
            if (d3Reference && componentEventBus) {
                d3Reference.rebind(component, componentEventBus, "on");
            } else if (!d3Reference) {
                console.warn(`D3 not found, event binding for layer '${displayLabelText}' will not be available.`);
            }

            return component;
        };

        // --- Factory Methods for Pre-configured Layer Types ---

        /** Creates a layer configured for TopoJSON data. */
        MapComponentProvider.fromJsonTopo = () => MapComponentProvider().contentType("topojson");

        /** Creates a layer configured for GeoJSON data. */
        MapComponentProvider.fromJsonGeo = () => MapComponentProvider().contentType("geojson");

        /** Creates a layer configured for CSV data. */
        MapComponentProvider.fromCsvData = () => MapComponentProvider().contentType("csv");

        /** Creates a layer configured for simple XY coordinate arrays. */
        MapComponentProvider.fromCoordinateArray = () => MapComponentProvider().contentType("xyarray");

        /** Creates a layer configured for feature arrays. */
        MapComponentProvider.fromFeatureArray = () => MapComponentProvider().contentType("featurearray");

        /** Creates a layer configured for base map tiles. */
        MapComponentProvider.fromTileSource = () => MapComponentProvider().contentType("tile");

        currentExports.create = MapComponentProvider;
    });

    // --- Internal Module: Main GeoVisualizer (formerly map.js) ---
    // Original module '4' content.
    provideModule('visualizerCore', (obtain, currentModule, currentExports) => {
        "use strict";

        // Obtain D3 reference from global context.
        const d3Access = (typeof window !== "undefined" && window.d3) ||
                         (typeof global !== "undefined" && global.d3) ||
                         (typeof self !== "undefined" && self.d3);

        if (!d3Access) {
            console.error("D3 library not found. GeoVisualizer core functions will be limited.");
            // Proceeding, but core D3 functionality will be missing.
        }

        // Obtain the Component Layer constructor.
        const ComponentLayer = obtain("./componentLayer").create;
        // Obtain the Dialog Box component (placeholder).
        const DialogComponent = obtain("./dialogBox").create;

        /**
         * GeoVisualizerFactory - A constructor for creating interactive geographic maps.
         * @returns {object} A map instance with configuration and interaction methods.
         */
        const GeoVisualizerFactory = function() {
            // Core DOM elements for the visualizer.
            let primarySvgSurface; // Main SVG container for interactive elements.
            let reprojectionTargetDiv; // Hidden div for raster reprojection.
            let backgroundTileLayerSvg; // SVG for rendering base map tiles.
            let mainDisplayElement; // The main container div provided by the user.
            let overlayCanvasElement; // Canvas for high-performance rendering.

            // UI Control elements.
            let layerManagementPanel; // Div for layer controls.
            let zoomControlContainer; // Div for zoom buttons.
            let panControlContainer; // Div for pan buttons.

            // Map projection and interaction state.
            let currentGeoProjection; // The D3 geographic projection in use.
            let activeZoomBehavior; // The D3 zoom behavior instance.
            let initialGeographicCenter = [12, 42]; // Default center coordinates.
            let viewportDimensionHeight = 10; // Initial height of the map.
            let viewportDimensionWidth = 10; // Initial width of the map.
            let isRasterProjectionInProgress = false; // Flag for ongoing raster operations.
            let interactionThreshold = 100; // General distance threshold for interactions.
            let dragStartCoordinates; // Stores mouse/touch start position for dragging.
            let rotationPivot; // Center point for rotation gestures.
            let initialTouchDistance; // For multi-touch scaling.
            let initialTouchAngle; // For multi-touch rotation.
            let initialGestureMagnitude; // For generic multi-touch magnitude.
            let initialZoomScale; // Initial scale during a zoom gesture.
            let quadtreeDensityThreshold = 0.1; // Threshold for quadtree clustering.
            let currentInteractionOperatingMode = "transform"; // "transform" or "select".

            // D3 related instances.
            let d3TileProcessor = () => {}; // D3 tile generator.
            if (d3Access && d3Access.geo && d3Access.geo.tile) {
                d3TileProcessor = d3Access.geo.tile().size([10, 10]); // Initial size, will be updated.
            } else {
                console.warn("D3.geo.tile not found. Tile layers may not function as expected.");
            }

            let d3GeoPathGenerator = d3Access ? d3Access.geo.path() : null; // D3 path generator.
            let d3ZoomHandlerInstance = d3Access ? d3Access.behavior.zoom() : null; // D3 zoom behavior.

            // Callbacks for zoom events.
            let onZoomStartCallback;
            let onZoomUpdateCallback;
            let onZoomEndCallback;

            // Layer management arrays.
            let allManagedVisualLayers = []; // All layers, regardless of type.
            let tileSvgGroups = []; // G elements for tile layers.
            let baseTileComponentLayers = []; // ComponentLayer instances for tiles.
            let canvasPointDataBuffer = []; // Data for canvas-rendered points.
            let svgPointGroups = []; // G elements for SVG points.
            let svgPointComponentLayers = []; // ComponentLayer instances for SVG points.
            let rasterPointComponentLayers = []; // ComponentLayer instances for raster points.
            let rasterFeatureComponentLayers = []; // ComponentLayer instances for raster features.
            let svgFeatureGroups = []; // G elements for SVG features.
            let svgFeatureComponentLayers = []; // ComponentLayer instances for SVG features.

            // Placeholder for new layers during creation process.
            let pendingPointLayer;
            let pendingFeatureLayer;

            // Linked map instances for synchronized views.
            let synchronousViewports = [];

            // Configuration for various tile providers.
            const availableTileSources = {
                stamen: {
                    baseUrl: "tile.stamen.com",
                    fileExtension: "jpg",
                    reprojectionTemplate: "http://{s}.tile.stamen.com/{z}/{x}/{y}.jpg"
                },
                mapbox: {
                    baseUrl: "tiles.mapbox.com/v3",
                    fileExtension: "png",
                    reprojectionTemplate: "http://{s}.tiles.mapbox.com/v3/{z}/{x}/{y}.png"
                },
                cartodb: {
                    baseUrl: "basemaps.cartocdn.com",
                    fileExtension: "png",
                    reprojectionTemplate: "http://{s}.basemaps.cartocdn.com/{z}/{x}/{y}.png"
                }
            };

            const visualizerInstanceId = `viz-${Math.random().toString(36).substring(2, 9)}`;
            const instanceCreationTime = Date.now();

            /**
             * Initializes the geographical visualizer within a specified DOM element.
             * @param {d3.selection} targetElement - The D3 selection of the container div.
             * @returns {object} The GeoVisualizer instance for chaining.
             */
            function visualizer(targetElement) {
                if (!d3Access) {
                    console.error("D3 is not available. GeoVisualizer cannot be initialized.");
                    return visualizer;
                }
                if (!targetElement || targetElement.empty()) {
                    console.error("GeoVisualizer: A valid D3 selection for the target element is required.");
                    return visualizer;
                }

                mainDisplayElement = targetElement;
                mainDisplayElement.attr("data-viz-id", visualizerInstanceId); // Add instance ID to root element.

                // Create and append the necessary DOM elements.
                reprojectionTargetDiv = mainDisplayElement.append("div")
                    .attr("id", "reprojection-zone-" + visualizerInstanceId)
                    .style("overflow", "hidden")
                    .style("height", "100%")
                    .style("width", "100%")
                    .style("position", "absolute");

                backgroundTileLayerSvg = mainDisplayElement.append("svg")
                    .style("height", "100%")
                    .style("width", "100%")
                    .style("position", "absolute")
                    .style("z-index", -1)
                    .append("g")
                    .attr("class", "rotation-wrapper-g")
                    .attr("id", "d3-tile-svg-" + visualizerInstanceId);

                overlayCanvasElement = mainDisplayElement.append("canvas")
                    .attr("id", "d3-map-canvas-" + visualizerInstanceId)
                    .style("height", "100%")
                    .style("width", "100%")
                    .style("pointer-events", "none") // Canvas doesn't capture events.
                    .attr("height", 5) // Initial small size, will be resized.
                    .attr("width", 5)
                    .style("position", "absolute")
                    .style("z-index", 0);

                primarySvgSurface = mainDisplayElement.append("svg")
                    .attr("id", "d3-map-svg-" + visualizerInstanceId)
                    .style("height", "100%")
                    .style("width", "100%")
                    .style("position", "absolute")
                    .style("z-index", 1)
                    .call(d3ZoomHandlerInstance) // Apply D3 zoom behavior.
                    // Using pointer events for broader compatibility (mouse, touch, pen).
                    .on("pointerdown", handlePointerStart)
                    .on("pointermove", handlePointerMove)
                    .on("pointerup", handlePointerEnd)
                    .append("g")
                    .attr("class", "rotation-wrapper-g");

                // Canvas image group for transitioning canvas content.
                const canvasImageWrapper = primarySvgSurface.append("g").attr("id", "canvas-image-group-" + visualizerInstanceId);
                canvasImageWrapper.append("image").attr("id", "canvas-snapshot-image-" + visualizerInstanceId);

                // UI control panels.
                layerManagementPanel = mainDisplayElement.insert("div", "svg") // Insert before SVG elements.
                    .attr("id", "layer-control-panel-" + visualizerInstanceId);
                layerManagementPanel.append("div").attr("id", "layer-content-area-" + visualizerInstanceId);

                zoomControlContainer = mainDisplayElement.insert("div", "svg")
                    .attr("id", "zoom-controls-" + visualizerInstanceId)
                    .attr("class", "map-control-box");
                panControlContainer = mainDisplayElement.insert("div", "svg")
                    .attr("id", "pan-controls-" + visualizerInstanceId)
                    .attr("class", "map-control-box");

                // Create zoom buttons.
                const zoomButtonsData = [{ action: "zoomIn", label: "+" }, { action: "zoomOut", label: "-" }];
                zoomControlContainer.selectAll("button.zoom-action-btn")
                    .data(zoomButtonsData)
                    .enter()
                    .append("button")
                    .attr("class", "zoom-action-btn")
                    .attr("id", d => `btn-${d.action}-${visualizerInstanceId}`)
                    .on("click", d => triggerManualZoom(d.action === "zoomIn" ? 1 : -1))
                    .html(d => d.label);

                // Create pan buttons.
                const panSymbols = { "up": "&#8593;", "down": "&#8595;", "left": "&#8592;", "right": "&#8594;" };
                const panButtonsData = ["up", "down", "left", "right"];
                panControlContainer.selectAll("button.pan-action-btn")
                    .data(panButtonsData)
                    .enter()
                    .append("button")
                    .attr("class", "pan-action-btn")
                    .attr("id", d => `btn-pan-${d}-${visualizerInstanceId}`)
                    .on("click", d => triggerManualPan(d, 0.5))
                    .html(d => panSymbols[d]);

                visualizer.setInteractionMode("transform"); // Set initial interaction mode.

                // Attach resize listener more robustly.
                const existingOnResize = window.onresize || (() => {});
                window.addEventListener('resize', () => {
                    visualizer.refreshViewport();
                    existingOnResize();
                });

                // Initial refresh and centering.
                visualizer.refreshViewport();
                visualizer.centerOn(initialGeographicCenter, "latlong", 0);

                console.info(`GeoVisualizer instance '${visualizerInstanceId}' initialized.`);
                return visualizer;
            }

            // --- Internal Helper Functions ---

            /** Handles pointerdown event for unified input (mouse/touch). */
            function handlePointerStart() {
                // Implement touch/mouse start logic here.
                // Original code used touchstart. This can be expanded to handle multi-touch.
                // For simplicity, we'll keep it basic for Type III, assuming D3's zoom behavior handles most.
                dragStartCoordinates = d3Access.mouse(this);
                // console.log("Pointer down at:", dragStartCoordinates);
            }

            /** Handles pointermove event. */
            function handlePointerMove() {
                // Implement touch/mouse move logic.
                // D3 zoom behavior primarily handles movement.
            }

            /** Handles pointerup event. */
            function handlePointerEnd() {
                // Implement touch/mouse end logic.
                dragStartCoordinates = null;
                // console.log("Pointer up.");
            }

            /**
             * Manually triggers a zoom action.
             * @param {number} direction - 1 for zoom in, -1 for zoom out.
             */
            function triggerManualZoom(direction) {
                if (!d3Access || !d3ZoomHandlerInstance) return;

                const currentScale = d3ZoomHandlerInstance.scale();
                const zoomFactor = 1.5; // How much to zoom in/out.
                const newScale = direction === 1 ? currentScale * zoomFactor : currentScale / zoomFactor;

                // Apply the new scale and re-center.
                // d3ZoomHandlerInstance.scale(newScale).event(primarySvgSurface);
                // The above line would trigger the zoom behavior directly.
                // For a more controlled manual zoom, we might need to adjust the translate as well.
                // This is a simplified approach for the clone.
                console.log(`Manual zoom: ${direction === 1 ? 'in' : 'out'}. New scale: ${newScale}`);
                // In a full implementation, this would involve updating d3ZoomHandlerInstance.translate()
                // and then calling .event() to trigger the zoom.
                // For Type III, we acknowledge the presence but simplify the implementation detail.
            }

            /**
             * Manually triggers a pan action.
             * @param {string} direction - "up", "down", "left", "right".
             * @param {number} magnitude - How much to pan (e.g., 0.5 for half viewport).
             */
            function triggerManualPan(direction, magnitude) {
                if (!d3Access || !d3ZoomHandlerInstance) return;

                const currentTranslate = d3ZoomHandlerInstance.translate();
                const currentScale = d3ZoomHandlerInstance.scale();
                let deltaX = 0;
                let deltaY = 0;

                const panAmount = 50 * magnitude / currentScale; // Pan fixed pixels, scaled by current zoom.

                switch (direction) {
                    case "up": deltaY = panAmount; break;
                    case "down": deltaY = -panAmount; break;
                    case "left": deltaX = panAmount; break;
                    case "right": deltaX = -panAmount; break;
                }

                const newTranslate = [currentTranslate[0] + deltaX, currentTranslate[1] + deltaY];
                d3ZoomHandlerInstance.translate(newTranslate).event(primarySvgSurface.node());
                console.log(`Manual pan: ${direction}. New translate: ${newTranslate}`);
            }


            /**
             * Refreshes the layer control panel in the UI.
             */
            function refreshLayerControls() {
                layerManagementPanel.select(`#layer-content-area-${visualizerInstanceId}`).selectAll("*").remove();

                const componentList = layerManagementPanel.select(`#layer-content-area-${visualizerInstanceId}`)
                    .append("ul")
                    .attr("class", "component-list");

                // Combine all layer arrays for display.
                const allDisplayableLayers = [
                    ...baseTileComponentLayers,
                    ...svgPointComponentLayers,
                    ...rasterPointComponentLayers.filter(l => !l.getInternalObject().mixed), // Exclude mixed duplicates.
                    ...svgFeatureComponentLayers,
                    ...rasterFeatureComponentLayers
                ].filter(l => !l.enableClustering()); // Filter out clustered layers from direct display.

                const layerItems = componentList.selectAll("li.component-item")
                    .data(allDisplayableLayers, d => d.getUniqueId()) // Use unique ID for data key.
                    .enter()
                    .append("li")
                    .attr("class", "component-item")
                    .attr("data-layer-id", d => d.getUniqueId()) // Use data attribute for ID.
                    .on("click", toggleLayerVisibility);

                layerItems.append("input")
                    .attr("type", "checkbox")
                    .property("checked", d => d.visibilityState());

                layerItems.append("span")
                    .attr("class", "component-label")
                    .html(d => d.displayLabel());

                console.log("Layer controls refreshed.");
            }

            /**
             * Toggles the visibility of a specific layer.
             * @param {object} layerData - The data object for the layer.
             * @param {number} index - The index of the layer (unused in this clone).
             * @param {HTMLElement} nodeContext - The DOM element that triggered the event.
             */
            function toggleLayerVisibility(layerData, index, nodeContext) {
                const targetNode = nodeContext || this; // Use provided node or current context.
                const currentCheckbox = d3Access.select(targetNode).select("input[type='checkbox']");

                // Capture canvas state before modifications for smoother transitions.
                if (overlayCanvasElement.node() && typeof overlayCanvasElement.node().toDataURL === 'function') {
                    const canvasSnapshot = overlayCanvasElement.node().toDataURL("image/png");
                    d3Access.select(`#canvas-snapshot-image-${visualizerInstanceId}`)
                        .attr("xlink:href", canvasSnapshot)
                        .style("opacity", 1);
                } else {
                    console.warn("Canvas or toDataURL not supported, skipping canvas snapshot for transition.");
                }

                if (!layerData.visibilityState()) { // If layer is currently hidden.
                    layerData.visibilityState(true);
                    // If it's a 'mixed' raster layer, also enable its duplicate.
                    const internalObject = layerData.getInternalObject();
                    if (internalObject && internalObject.mixed) {
                        rasterPointComponentLayers.forEach(pLayer => {
                            if (pLayer.getInternalObject().id === internalObject.mixedupDup) {
                                pLayer.visibilityState(true);
                            }
                        });
                    }
                    visualizer.refreshTileSet(); // Re-render tiles if necessary.

                    // Attempt a fade-in animation for SVG layers.
                    mainDisplayElement.select(`g#${internalObject.id}`)
                        .style("opacity", 0)
                        .transition()
                        .duration(1000)
                        .style("opacity", 1)
                        .each("end", () => console.log(`Layer '${layerData.displayLabel()}' faded in.`));

                    currentCheckbox.property("checked", true);
                } else { // If layer is currently visible.
                    // Attempt a fade-out animation for SVG layers.
                    mainDisplayElement.select(`g#${layerData.getInternalObject().id}`)
                        .transition()
                        .duration(1000)
                        .style("opacity", 0)
                        .each("end", () => console.log(`Layer '${layerData.displayLabel()}' faded out.`));

                    currentCheckbox.property("checked", false);
                    layerData.visibilityState(false);
                    // Handle 'mixed' raster layers.
                    const internalObject = layerData.getInternalObject();
                    if (internalObject && internalObject.mixed) {
                        rasterPointComponentLayers.forEach(pLayer => {
                            if (pLayer.getInternalObject().id === internalObject.mixedupDup) {
                                pLayer.visibilityState(false);
                            }
                        });
                    }
                }
            }

            // --- Public GeoVisualizer Methods ---

            /**
             * Sets the interaction mode of the map.
             * @param {string} newMode - "transform" (pan/zoom) or "select" (custom interaction).
             * @returns {object} The GeoVisualizer instance.
             */
            visualizer.setInteractionMode = function(newMode) {
                const validModes = ["transform", "select"];
                if (!validModes.includes(newMode)) {
                    console.warn(`Invalid interaction mode '${newMode}'. Must be one of: ${validModes.join(', ')}. Defaulting to 'transform'.`);
                    newMode = "transform";
                }
                currentInteractionOperatingMode = newMode;
                if (d3ZoomHandlerInstance) {
                    // Enable/disable zoom behavior based on mode.
                    if (newMode === "transform") {
                        primarySvgSurface.call(d3ZoomHandlerInstance);
                        console.log("Interaction mode set to 'transform' (pan/zoom enabled).");
                    } else {
                        primarySvgSurface.on(".zoom", null); // Remove all zoom listeners.
                        console.log("Interaction mode set to 'select' (pan/zoom disabled).");
                    }
                }
                return visualizer;
            };

            /**
             * Refreshes the map viewport dimensions and updates components.
             * @returns {object} The GeoVisualizer instance.
             */
            visualizer.refreshViewport = function() {
                if (!mainDisplayElement) return visualizer;

                // Get current dimensions of the main container.
                viewportDimensionWidth = parseInt(mainDisplayElement.style("width"), 10);
                viewportDimensionHeight = parseInt(mainDisplayElement.style("height"), 10);

                // Update canvas dimensions.
                overlayCanvasElement
                    .attr("width", viewportDimensionWidth)
                    .attr("height", viewportDimensionHeight);

                // Update tile generator size.
                if (d3TileProcessor && typeof d3TileProcessor.size === 'function') {
                    d3TileProcessor.size([viewportDimensionWidth, viewportDimensionHeight]);
                }

                console.log(`Viewport refreshed: ${viewportDimensionWidth}x${viewportDimensionHeight}.`);
                return visualizer;
            };

            /**
             * Centers the map on a given coordinate.
             * @param {Array<number>} coords - [longitude, latitude] or [x, y].
             * @param {string} coordType - "latlong" or "pixels".
             * @param {number} durationMs - Animation duration in milliseconds.
             * @returns {object} The GeoVisualizer instance.
             */
            visualizer.centerOn = function(coords, coordType = "latlong", durationMs = 0) {
                if (!d3Access || !currentD3Projection || !d3ZoomHandlerInstance) {
                    console.warn("Cannot center map: D3 or projection/zoom not initialized.");
                    return visualizer;
                }
                if (!Array.isArray(coords) || coords.length !== 2 || !coords.every(n => typeof n === 'number')) {
                    console.error("Invalid coordinates for centering. Expected [number, number].");
                    return visualizer;
                }

                let targetPixelCoords;
                if (coordType === "latlong") {
                    targetPixelCoords = currentD3Projection(coords);
                } else if (coordType === "pixels") {
                    targetPixelCoords = coords;
                } else {
                    console.warn(`Unknown coordinate type '${coordType}'. Defaulting to 'latlong'.`);
                    targetPixelCoords = currentD3Projection(coords);
                }

                // Calculate translation to center the target point.
                const currentScale = d3ZoomHandlerInstance.scale();
                const newTranslateX = viewportDimensionWidth / 2 - targetPixelCoords[0] * currentScale;
                const newTranslateY = viewportDimensionHeight / 2 - targetPixelCoords[1] * currentScale;
                const newTranslate = [newTranslateX, newTranslateY];

                const transition = primarySvgSurface.transition().duration(durationMs);
                d3ZoomHandlerInstance.translate(newTranslate).scale(currentScale);
                transition.call(d3ZoomHandlerInstance.event);

                console.log(`Map centered on [${coords}] (${coordType}).`);
                return visualizer;
            };

            /** Refreshes the tile layers. */
            visualizer.refreshTileSet = function() {
                // This is a placeholder for the actual tile rendering logic.
                // In the original code, this would involve recalculating tiles based on zoom/pan.
                console.log("Tile set refresh triggered.");
                // For a Type III clone, we can simplify or omit the full rendering logic
                // if it's too complex or relies on external libraries not included.
                return visualizer;
            };

            // Add a method to get the current state of the visualizer.
            visualizer.getState = function() {
                return {
                    id: visualizerInstanceId,
                    creationTime: instanceCreationTime,
                    currentCenter: initialGeographicCenter, // This would ideally be dynamic.
                    currentZoom: d3ZoomHandlerInstance ? d3ZoomHandlerInstance.scale() : 1,
                    viewport: {
                        width: viewportDimensionWidth,
                        height: viewportDimensionHeight
                    },
                    interactionMode: currentInteractionOperatingMode,
                    activeLayerCount: allManagedVisualLayers.length
                };
            };

            return visualizer;
        };

        currentExports.create = GeoVisualizerFactory;
    });

    // --- Main Library Entry Point (formerly d3.carto) ---
    // Original module '2' content.
    provideModule('mainLibrary', (obtain, currentModule, currentExports) => {
        "use strict";
        // Obtain references to our internal modules.
        const coreVisualizer = obtain('visualizerCore').create; // Renamed from map
        const layerComponent = obtain('componentLayer').create; // Renamed from layer
        const miniViewComponent = obtain('miniView').create; // Renamed from minimap (simplified)
        const dialogBoxComponent = obtain('dialogBox').create; // Renamed from modal (simplified)
        const libInformation = obtain('libraryInfo'); // Our simplified package info

        /**
         * The main entry point for the GeoVisualizer library.
         * Exposes core components and library information.
         * Renamed from 'd3.carto' to 'geoViz'.
         */
        currentExports.geoViz = {
            core: coreVisualizer, // The main map visualizer.
            layer: layerComponent, // Layer definition factory.
            mini: miniViewComponent, // Mini-map component (simplified).
            dialog: dialogBoxComponent, // Modal/dialog component (simplified).
            version: libInformation.version, // Library version string.
            description: libInformation.description
        };
    });

    // --- Global Exposure (UMD-like pattern, simplified) ---
    // This part mimics the original UMD wrapper to expose the library.
    const mainExport = moduleRegistry['mainLibrary'].exports.geoViz;

    if (typeof exports === 'object' && typeof module === 'object') {
        // CommonJS environment (e.g., Node.js, Browserify).
        module.exports = mainExport;
    } else if (typeof define === 'function' && define.amd) {
        // AMD environment (e.g., RequireJS).
        define([], () => mainExport);
    } else {
        // Browser global environment.
        const rootContext = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};
        rootContext.d3 = rootContext.d3 || {}; // Ensure d3 namespace exists.
        rootContext.d3.carto = mainExport; // Expose under original d3.carto for compatibility.
        console.log("GeoVisualizer library exposed globally as d3.carto.");
    }
})();