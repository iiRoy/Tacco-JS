(function() {
    const enhanceClass = (targetClass, additions, isPrototype = false) => {
        const specialOps = ['onStaticAdded', 'onInstanceAdded'];
        Object.keys(additions).forEach(key => {
            if (!specialOps.includes(key)) {
                if (isPrototype) {
                    targetClass.prototype[key] = additions[key];
                } else {
                    targetClass[key] = additions[key];
                }
            }
        });
        if (additions.onStaticAdded && !isPrototype) {
            additions.onStaticAdded.apply(targetClass);
        }
        if (additions.onInstanceAdded && isPrototype) {
            additions.onInstanceAdded.apply(targetClass.prototype);
        }
        return targetClass;
    };

    const utilityBelt = {
        isFunction: (val) => typeof val === 'function',
        mixObjects: (target, ...sources) => Object.assign(target, ...sources),
        transformArray: (arr, fn) => arr.map(fn),
        processArray: (arr, fn) => arr.forEach(fn),
        applyDefaults: (obj, defaults) => {
            for (const key in defaults) {
                if (obj[key] === undefined) {
                    obj[key] = defaults[key];
                }
            }
            return obj;
        },
        makeDeepCopy: (obj) => JSON.parse(JSON.stringify(obj)),
        firstCharUpper: (str) => str.charAt(0).toUpperCase() + str.slice(1)
    };

    const GeoSystem = {};

    GeoSystem.entryPoint = (componentType, configSettings) => {
        if (configSettings == null) {
            configSettings = {};
        }
        const managerClass = utilityBelt.isFunction(configSettings.controller) ? configSettings.controller : GeoSystem.Controllers.MainController;
        return new managerClass(componentType, configSettings);
    };

    GeoSystem.Controllers = {};
    GeoSystem.Constructors = {};
    GeoSystem.Components = {};
    GeoSystem.Module = {
        API: {},
        Constructors: {},
        Visuals: {}
    };

    class BaseComponentBlueprint {
        constructor() {}
        createInstance() {
            return new (this.modelIdentifier())(this.externalObject);
        }
        preSetup() {}
        postSetup() {}
        attachEvent(actionName, callbackFn) {
            return this.getToolkit().attachEvent(this.getServiceObject(), actionName, callbackFn);
        }
        getServiceObject() {
            return this.externalObject;
        }
        getToolkit() {
            return this.constructor.API_TOOLKIT;
        }
        modelIdentifier() {
            return this.constructor.VISUAL_MODEL;
        }
    }
    GeoSystem.Components.BaseComponentBlueprint = BaseComponentBlueprint;

    GeoSystem.Components.ComponentFactory = (creatorClass, visualClass, apiToolkit) => {
        return {
            produce: (details, providerOptions, internalSettings) => {
                visualClass.API_TOOLKIT = apiToolkit;
                creatorClass.VISUAL_MODEL = visualClass;
                creatorClass.API_TOOLKIT = apiToolkit;
                const creatorInstance = new creatorClass(details, providerOptions, internalSettings);
                return creatorInstance.createInstance();
            }
        };
    };

    class DummyAggregator {
        constructor() {}
        addManyItems() {}
        addOneItem() {}
        clearAll() {}
        removeOneItem() {}
    }
    GeoSystem.Components.DummyAggregator = DummyAggregator;

    const RenderableItemMixin = {
        fetchServiceObject: function() { return this.externalObject; },
        assignToCanvas: function(canvas) { return this.fetchServiceObject().assignToCanvas(canvas); },
        deactivate: function() { return this.fetchServiceObject().assignToCanvas(null); },
        display: function() { return this.fetchServiceObject().setVisibility(true); },
        conceal: function() { return this.fetchServiceObject().setVisibility(false); },
        isDisplayed: function() { return this.fetchServiceObject().getVisibility(); },
        getToolkit: function() { return this.constructor.API_TOOLKIT; }
    };

    class BoundaryCreator extends BaseComponentBlueprint {
        constructor(settings) {
            super();
            this.preSetup();
            this.externalObject = new (this.getToolkit().coordinateBounds)();
            this.postSetup();
        }
    }
    GeoSystem.Module.Constructors.Boundary = BoundaryCreator;

    class OrbCreator extends BaseComponentBlueprint {
        constructor(args, config) {
            super();
            this.inputArgs = args;
            this.configOptions = config != null ? config : {};
            this.preSetup();
            this.externalObject = this.generateOrb();
            this.postSetup();
        }
        generateOrb() {
            return new (this.getToolkit().sphere)(this.orbConfig());
        }
        orbConfig() {
            const baseConfig = {
                center: new (this.getToolkit().coordinate)(this.inputArgs.latitude, this.inputArgs.longitude),
                radius: this.inputArgs.radiusValue
            };
            return utilityBelt.applyDefaults(baseConfig, this.configOptions);
        }
    }
    GeoSystem.Module.Constructors.Orb = OrbCreator;

    class AggregatorCreator extends BaseComponentBlueprint {
        constructor(args, config) {
            super();
            this.inputArgs = args;
            this.configOptions = config;
            this.preSetup();
            this.externalObject = new (this.getToolkit().itemAggregator)(this.inputArgs.canvas, [], this.configOptions);
            this.postSetup();
        }
    }
    GeoSystem.Module.Constructors.Aggregator = AggregatorCreator;

    class DocumentLayerCreator extends BaseComponentBlueprint {
        constructor(args, config) {
            super();
            this.inputArgs = args;
            this.configOptions = config != null ? config : {};
            this.preSetup();
            this.externalObject = this.generateDocumentLayer();
            this.postSetup();
        }
        generateDocumentLayer() {
            return new (this.getToolkit().markupLayer)(this.inputArgs.sourceUrl, this.documentLayerConfig());
        }
        documentLayerConfig() {
            const baseConfig = {};
            return utilityBelt.applyDefaults(baseConfig, this.configOptions);
        }
    }
    GeoSystem.Module.Constructors.DocumentLayer = DocumentLayerCreator;

    class DisplayAreaCreator extends BaseComponentBlueprint {
        constructor(config, onLoaded) {
            super();
            this.preSetup();
            const providerConfig = utilityBelt.mixObjects(this.getDefaultConfig(), config.providerSettings);
            this.privateConfig = config.systemSettings;
            this.externalObject = new (this.getToolkit().mapDisplay)(document.getElementById(this.privateConfig.containerId), providerConfig);
            this.onDisplayLoaded(onLoaded);
            this.postSetup();
        }
        createInstance() {
            return new (this.modelIdentifier())(this.externalObject, this.getToolkit());
        }
        onDisplayLoaded(onLoaded) {
            return this.getToolkit().addSingleEvent(this.externalObject, 'ready', onLoaded);
        }
        getDefaultConfig() {
            return {
                viewType: this.getToolkit().displayTypes('STREET'),
                center: new (this.getToolkit().coordinate)(0, 0),
                zoomLevel: 8
            };
        }
    }
    GeoSystem.Module.Constructors.DisplayArea = DisplayAreaCreator;

    class PinCreator extends BaseComponentBlueprint {
        static CURRENT_POPUP = undefined;
        static ITEM_STORE = {};

        constructor(details, providerConfig, systemConfig) {
            super();
            this.itemDetails = details;
            this.providerConfig = providerConfig;
            this.systemConfig = systemConfig;
            this.preSetup();
            this.externalObject = this.generatePin();
            this.postSetup();
        }
        generatePin() {
            return new (this.getToolkit().pointMarker)(this.pinConfig());
        }
        pinConfig() {
            const baseConfig = {
                position: new (this.getToolkit().coordinate)(this.itemDetails.latitude, this.itemDetails.longitude),
                title: this.itemDetails.caption
            };
            return utilityBelt.applyDefaults(baseConfig, this.providerConfig);
        }
    }
    GeoSystem.Module.Constructors.Pin = PinCreator;

    class PathCreator extends BaseComponentBlueprint {
        constructor(args, config) {
            super();
            this.inputArgs = args;
            this.configOptions = config != null ? config : {};
            this.preSetup();
            this.externalObject = this.generatePath();
            this.postSetup();
        }
        generatePath() {
            const pathCoordinates = utilityBelt.transformArray(this.inputArgs.points, p => new (this.getToolkit().coordinate)(p.latitude, p.longitude));
            return new (this.getToolkit().pathShape)({ path: pathCoordinates, ...this.configOptions });
        }
    }
    GeoSystem.Module.Constructors.Path = PathCreator;

    class AreaCreator extends BaseComponentBlueprint {
        constructor(args, config) {
            super();
            this.inputArgs = args;
            this.configOptions = config != null ? config : {};
            this.preSetup();
            this.externalObject = this.generateArea();
            this.postSetup();
        }
        generateArea() {
            const areaCoordinates = utilityBelt.transformArray(this.inputArgs.vertices, v => new (this.getToolkit().coordinate)(v.latitude, v.longitude));
            return new (this.getToolkit().areaShape)({ paths: [areaCoordinates], ...this.configOptions });
        }
    }
    GeoSystem.Module.Constructors.Area = AreaCreator;

    class VisualDisplayArea {
        constructor(serviceObj, toolkit) {
            this.externalObject = serviceObj;
            this.constructor.API_TOOLKIT = toolkit;
            enhanceClass(this.constructor, RenderableItemMixin, true);
        }
    }
    GeoSystem.Module.Visuals.DisplayArea = VisualDisplayArea;

    class VisualPin {
        constructor(serviceObj) {
            this.externalObject = serviceObj;
            enhanceClass(this.constructor, RenderableItemMixin, true);
        }
    }
    GeoSystem.Module.Visuals.Pin = VisualPin;

    class VisualOrb {
        constructor(serviceObj) {
            this.externalObject = serviceObj;
            enhanceClass(this.constructor, RenderableItemMixin, true);
        }
    }
    GeoSystem.Module.Visuals.Orb = VisualOrb;

    class VisualDocumentLayer {
        constructor(serviceObj) {
            this.externalObject = serviceObj;
            enhanceClass(this.constructor, RenderableItemMixin, true);
        }
    }
    GeoSystem.Module.Visuals.DocumentLayer = VisualDocumentLayer;

    class VisualPath {
        constructor(serviceObj) {
            this.externalObject = serviceObj;
            enhanceClass(this.constructor, RenderableItemMixin, true);
        }
    }
    GeoSystem.Module.Visuals.Path = VisualPath;

    class VisualArea {
        constructor(serviceObj) {
            this.externalObject = serviceObj;
            enhanceClass(this.constructor, RenderableItemMixin, true);
        }
    }
    GeoSystem.Module.Visuals.Area = VisualArea;

    class MainController {
        #cachedComponentFactories = new Map();

        constructor(providerKind, settings) {
            this.providerType = providerKind;
            if (settings == null) {
                settings = {};
            }
            this.setApiToolkit(settings);
            this.setConfiguration(settings);
            this.#initializeFactories();
            this.resetGeographicBounds();
        }

        renderMap(mapConfig, onMapReady) {
            if (onMapReady == null) {
                onMapReady = () => {};
            }
            return this.activeMap = this.getComponentFactory('DisplayArea').produce(mapConfig, () => {
                this.#setupAggregator();
                return onMapReady();
            });
        }

        addManyPins(pinDataArray, providerConfig) {
            return utilityBelt.transformArray(pinDataArray, (pinDataItem) => {
                return this.addOnePin(pinDataItem, providerConfig);
            });
        }

        addOnePin(pinData, providerConfig) {
            const pin = this.getComponentFactory('Pin').produce(pinData, providerConfig, this.pinSettings);
            pin.assignToCanvas(this.activeMap.fetchServiceObject());
            this.itemAggregator.addOneItem(pin);
            return pin;
        }

        addManyOrbs(orbDataArray, providerConfig) {
            return utilityBelt.transformArray(orbDataArray, (orbDataItem) => {
                return this.addOneOrb(orbDataItem, providerConfig);
            });
        }

        addOneOrb(orbData, providerConfig) {
            return this.addResource('Orb', orbData, providerConfig);
        }

        addManyPaths(pathDataArray, providerConfig) {
            return utilityBelt.transformArray(pathDataArray, (pathDataItem) => {
                return this.addOnePath(pathDataItem, providerConfig);
            });
        }

        addOnePath(pathData, providerConfig) {
            return this.addResource('Path', pathData, providerConfig);
        }

        addManyAreas(areaDataArray, providerConfig) {
            return utilityBelt.transformArray(areaDataArray, (areaDataItem) => {
                return this.addOneArea(areaDataItem, providerConfig);
            });
        }

        addOneArea(areaData, providerConfig) {
            return this.addResource('Area', areaData, providerConfig);
        }

        addManyDocumentLayers(kmlDataArray, providerConfig) {
            return utilityBelt.transformArray(kmlDataArray, (kmlDataItem) => {
                return this.addOneDocumentLayer(kmlDataItem, providerConfig);
            });
        }

        addOneDocumentLayer(kmlData, providerConfig) {
            return this.addResource('DocumentLayer', kmlData, providerConfig);
        }

        removeManyPins(mapPins) {
            return utilityBelt.transformArray(mapPins, (mapPin) => {
                return this.removeOnePin(mapPin);
            });
        }

        removeOnePin(mapPin) {
            mapPin.deactivate();
            return this.itemAggregator.removeOneItem(mapPin);
        }

        adjustToBounds() {
            return this.activeMap.fetchServiceObject().adjustToBounds(this.currentBounds.getServiceObject());
        }

        getCanvas() {
            return this.activeMap.fetchServiceObject();
        }

        setConfiguration(settings) {
            this.pinSettings = utilityBelt.mixObjects(this.#getDefaultPinSettings(), settings.pinConfigs);
            this.constructors = utilityBelt.mixObjects(this.#getDefaultConstructors(), settings.itemConstructors);
            this.visuals = utilityBelt.mixObjects(this.#getDefaultVisuals(), settings.itemVisuals);
        }

        resetGeographicBounds() {
            return this.currentBounds = this.getComponentFactory('Boundary').produce();
        }

        setApiToolkit(settings) {
            this.apiToolkit = settings.toolkit === undefined ? this.#getModule().API : (utilityBelt.isFunction(settings.toolkit) ? settings.toolkit() : settings.toolkit);
        }

        getCurrentPopup() {
            return this.constructors.Pin.CURRENT_POPUP;
        }

        addResource(resourceName, resourceData, providerConfig) {
            const resource = this.getComponentFactory(resourceName).produce(resourceData, providerConfig);
            resource.assignToCanvas(this.getCanvas());
            return resource;
        }

        #initializeFactories() {
            const componentTypes = ['Boundary', 'Orb', 'Aggregator', 'DocumentLayer', 'DisplayArea', 'Pin', 'Area', 'Path'];
            utilityBelt.processArray(componentTypes, (kind) => {
                this.getComponentFactory(kind);
            });
        }

        #shouldAggregate() {
            return typeof this.pinSettings.aggregator !== 'undefined' && this.pinSettings.aggregator !== null;
        }

        #setupAggregator() {
            return this.itemAggregator = this.getComponentFactory('Aggregator').produce({
                canvas: this.getCanvas()
            }, this.pinSettings.aggregator);
        }

        #getDefaultPinSettings() {
            return utilityBelt.makeDeepCopy({
                singlePopup: true,
                maxRandomOffset: 0,
                aggregator: {
                    maxZoomLevel: 5,
                    gridDimension: 50
                }
            });
        }

        getComponentFactory(name) {
            const capitalizedName = utilityBelt.firstCharUpper(name);
            if (!this.#cachedComponentFactories.has(capitalizedName)) {
                const factory = GeoSystem.Components.ComponentFactory(this.constructors[capitalizedName], this.visuals[capitalizedName], this.apiToolkit);
                this.#cachedComponentFactories.set(capitalizedName, factory);
            }
            return this.#cachedComponentFactories.get(capitalizedName);
        }

        #getDefaultVisuals() {
            const visualsCopy = utilityBelt.makeDeepCopy(this.#getModule().Visuals);
            if (this.#shouldAggregate()) {
                return visualsCopy;
            } else {
                visualsCopy.Aggregator = GeoSystem.Components.DummyAggregator;
                return visualsCopy;
            }
        }

        #getDefaultConstructors() {
            return utilityBelt.makeDeepCopy(this.#getModule().Constructors);
        }

        #getModule() {
            if (this._moduleCache == null) {
                this._moduleCache = GeoSystem.Module;
            }
            return this._moduleCache;
        }
    }
    GeoSystem.Controllers.MainController = MainController;

    this.GeoSystem = GeoSystem;

}).call(this);