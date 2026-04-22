(function(){
    this.GeoVis = {
        createInstance: function(entityCategory, config) {
            let blueprint;
            if (config === void 0) {
                config = {};
            }
            blueprint = _utility.isFunc(config.manager) ? config.manager : GeoVis.Components.Manager;
            return new blueprint(entityCategory, config);
        },
        Fabricators: {},
        Components: {},
        Alpha: {
            Components: {},
            Fabricators: {}
        }
    };
}).call(this);
(function(){
    let extensionTokens;
    const arrayContains = Array.prototype.indexOf || function(searchItem) {
        for (let idx = 0, arrayLen = this.length; idx < arrayLen; idx++) {
            if (idx in this && this[idx] === searchItem) return idx;
        }
        return -1;
    };
    extensionTokens = ['augmented', 'injected'];
    this.GeoVis.Foundation = (function() {
        function Foundation() {}
        Foundation.augment = function(sourceObj) {
            let attributeName, attributeValue, tempRef;
            for (attributeName in sourceObj) {
                attributeValue = sourceObj[attributeName];
                if (arrayContains.call(extensionTokens, attributeName) < 0) {
                    this[attributeName] = attributeValue;
                }
            }
            if ((tempRef = sourceObj.augmented) !== void 0) {
                tempRef.apply(this);
            }
            return this;
        };
        Foundation.incorporate = function(sourceObj) {
            let attributeName, attributeValue, tempRef;
            for (attributeName in sourceObj) {
                attributeValue = sourceObj[attributeName];
                if (arrayContains.call(extensionTokens, attributeName) < 0) {
                    this.protoObject[attributeName] = attributeValue;
                }
            }
            if ((tempRef = sourceObj.injected) !== void 0) {
                tempRef.apply(this);
            }
            return this;
        };
        return Foundation;
    })();
}).call(this);
(function(){
    this.GeoVis.Components.ResourceMaker = (function() {
        function ResourceMaker() {}
        ResourceMaker.protoObject.construct = function() {
            return new (this.targetComponentClass())(this.platformInstance);
        };
        ResourceMaker.protoObject.preSetup = function() {};
        ResourceMaker.protoObject.postSetup = function() {};
        ResourceMaker.protoObject.attachEventListener = function(eventName, eventCallback) {
            return this.coreApi().attachEventListener(this.getPlatformInstance(), eventName, eventCallback);
        };
        ResourceMaker.protoObject.getPlatformInstance = function() {
            return this.platformInstance;
        };
        ResourceMaker.protoObject.coreApi = function() {
            return this.classInitializer.API_FUNCTIONS;
        };
        ResourceMaker.protoObject.targetComponentClass = function() {
            return this.classInitializer.COMPONENT_CLASS;
        };
        return ResourceMaker;
    })();
}).call(this);
(function(){
    this.GeoVis.Components.Fabricators = function(fabricatorClassRef, componentClassRef, apiProviderRef) {
        return {
            construct: function(inputData, providerConfig, privateConfig) {
                let fabricator;
                componentClassRef.API_FUNCTIONS = apiProviderRef;
                fabricatorClassRef.COMPONENT_CLASS = componentClassRef;
                fabricatorClassRef.API_FUNCTIONS = apiProviderRef;
                fabricator = new fabricatorClassRef(inputData, providerConfig, privateConfig);
                return fabricator.construct();
            }
        };
    };
}).call(this);
(function(){
    this.GeoVis.Components.Manager = (function() {
        function Manager(entityCategory, config) {
            this.entityCategory = entityCategory;
            if (config === void 0) {
                config = {};
            }
            this.setCoreApi(config);
            this.configureManager(config);
            this._preloadAllFabricators();
            this.resetSpatialBounds();
        }
        Manager.protoObject.createVisualMap = function(config, onDisplayReady) {
            let selfInstance = this;
            if (onDisplayReady === void 0) {
                onDisplayReady = function() {};
            }
            return this.visualMap = this._getComponentFabricator('DisplayMap').construct(config, function() {
                selfInstance._initiateGroupingAgent();
                return onDisplayReady();
            });
        };
        Manager.protoObject.addDisplayMarkers = function(markerDataSet, providerConfig) {
            let selfInstance = this;
            return _utility.transformArray(markerDataSet, function(singleMarkerEntry) {
                return selfInstance.addDisplayMarker(singleMarkerEntry, providerConfig);
            });
        };
        Manager.protoObject.addDisplayMarker = function(singleMarkerEntry, providerConfig) {
            let displayMarker = this._getComponentFabricator('DisplayMarker').construct(singleMarkerEntry, providerConfig, this.displayMarkerConfig);
            displayMarker.assignToVisualMap(this.getVisualMap());
            this.groupingAgent.receiveMarker(displayMarker);
            return displayMarker;
        };
        Manager.protoObject.addDisplayCircles = function(circleDataSet, providerConfig) {
            let selfInstance = this;
            return _utility.transformArray(circleDataSet, function(singleCircleEntry) {
                return selfInstance.addDisplayCircle(singleCircleEntry, providerConfig);
            });
        };
        Manager.protoObject.addDisplayCircle = function(singleCircleEntry, providerConfig) {
            return this._addVisualComponent('DisplayCircle', singleCircleEntry, providerConfig);
        };
        Manager.protoObject.addDisplayPolylines = function(polylineDataSet, providerConfig) {
            let selfInstance = this;
            return _utility.transformArray(polylineDataSet, function(singlePolylineEntry) {
                return selfInstance.addDisplayPolyline(singlePolylineEntry, providerConfig);
            });
        };
        Manager.protoObject.addDisplayPolyline = function(singlePolylineEntry, providerConfig) {
            return this._addVisualComponent('DisplayPolyline', singlePolylineEntry, providerConfig);
        };
        Manager.protoObject.addDisplayPolygons = function(polygonDataSet, providerConfig) {
            let selfInstance = this;
            return _utility.transformArray(polygonDataSet, function(singlePolygonEntry) {
                return selfInstance.addDisplayPolygon(singlePolygonEntry, providerConfig);
            });
        };
        Manager.protoObject.addDisplayPolygon = function(singlePolygonEntry, providerConfig) {
            return this._addVisualComponent('DisplayPolygon', singlePolygonEntry, providerConfig);
        };
        Manager.protoObject.addDisplayKmls = function(kmlDataSet, providerConfig) {
            let selfInstance = this;
            return _utility.transformArray(kmlDataSet, function(singleKmlEntry) {
                return selfInstance.addDisplayKml(singleKmlEntry, providerConfig);
            });
        };
        Manager.protoObject.addDisplayKml = function(singleKmlEntry, providerConfig) {
            return this._addVisualComponent('KeyholeMarkup', singleKmlEntry, providerConfig);
        };
        Manager.protoObject.removeDisplayMarkers = function(visualResourceMarkers) {
            let selfInstance = this;
            return _utility.transformArray(visualResourceMarkers, function(individualResourceMarker) {
                return selfInstance.removeDisplayMarker(individualResourceMarker);
            });
        };
        Manager.protoObject.removeDisplayMarker = function(individualResourceMarker) {
            individualResourceMarker.removeSelfFromMap();
            return this.groupingAgent.releaseSingleMarker(individualResourceMarker);
        };
        Manager.protoObject.adjustMapToBoundaries = function() {
            return this.visualMap.fitToBounds(this.spatialBounds.getPlatformInstance());
        };
        Manager.protoObject.getVisualMap = function() {
            return this.visualMap.getPlatformInstance();
        };
        Manager.protoObject.configureManager = function(config) {
            this.displayMarkerConfig = _utility.deepMerge(this._standardMarkerSettings(), config.markers);
            this.fabricators = _utility.deepMerge(this._standardFabricatorDefinitions(), config.fabricators);
            return this.componentModels = _utility.deepMerge(this._standardComponentModels(), config.models);
        };
        Manager.protoObject.resetSpatialBounds = function() {
            return this.spatialBounds = this._getComponentFabricator('SpatialBoundary').construct();
        };
        Manager.protoObject.setCoreApi = function(config) {
            return this.coreApi = config.coreApi === void 0 ? this._baseEntryModule().API_FUNCTIONS() : _utility.isFunc(config.coreApi) ? config.coreApi() : config.coreApi;
        };
        Manager.protoObject.activeInfoPanel = function() {
            return this.fabricators.DisplayMarker.ACTIVE_INFO_PANEL;
        };
        Manager.protoObject._addVisualComponent = function(componentName, resourcePayload, providerConfig) {
            let visualResource = this._getComponentFabricator(componentName).construct(resourcePayload, providerConfig);
            visualResource.assignToVisualMap(this.getVisualMap());
            return visualResource;
        };
        Manager.protoObject._preloadAllFabricators = function() {
            let currentManager = this;
            return _utility.iterateOver(['SpatialBoundary', 'DisplayCircle', 'GroupingAgent', 'KeyholeMarkup', 'DisplayMap', 'DisplayMarker', 'DisplayPolygon', 'DisplayPolyline'], function(resourceKind) {
                return currentManager._getComponentFabricator(resourceKind);
            });
        };
        Manager.protoObject._isClusteringRequired = function() {
            return _utility.isObj(this.displayMarkerConfig.groupingAgent);
        };
        Manager.protoObject._initiateGroupingAgent = function() {
            return this.groupingAgent = this._getComponentFabricator('GroupingAgent').construct({
                visualMap: this.getVisualMap()
            }, this.displayMarkerConfig.groupingAgent);
        };
        Manager.protoObject._standardMarkerSettings = function() {
            return _utility.makeCopy({
                singleInfoPanel: true,
                maximumRandomDistance: 0,
                groupingAgent: {
                    maximumZoom: 5,
                    gridDimension: 50
                }
            });
        };
        Manager.protoObject._getComponentFabricator = function(componentTypeName) {
            let _tempName;
            componentTypeName = this._toPascalCase(componentTypeName);
            if (this[_tempName = "__cachedFabricator_" + componentTypeName] === void 0) {
                this[_tempName] = GeoVis.Components.Fabricators(this.fabricators[componentTypeName], this.componentModels[componentTypeName], this.coreApi);
            }
            return this["__cachedFabricator_" + componentTypeName];
        };
        Manager.protoObject._standardComponentModels = function() {
            let componentModels = _utility.makeCopy(this._baseEntryModule().Components);
            if (this._isClusteringRequired()) {
                return componentModels;
            } else {
                componentModels.GroupingAgent = GeoVis.Components.DummyGroupingAgent;
                return componentModels;
            }
        };
        Manager.protoObject._toPascalCase = function(textInput) {
            return textInput.charAt(0).toUpperCase() + textInput.slice(1);
        };
        Manager.protoObject._standardFabricatorDefinitions = function() {
            return _utility.makeCopy(this._baseEntryModule().Fabricators);
        };
        Manager.protoObject._baseEntryModule = function() {
            if (this.__cachedBaseModule === void 0) {
                this.__cachedBaseModule = GeoVis[this.entityCategory];
            }
            return this.__cachedBaseModule;
        };
        return Manager;
    })();
}).call(this);
(function(){
    this.GeoVis.Components.DummyGroupingAgent = (function() {
        function DummyGroupingAgent() {}
        DummyGroupingAgent.protoObject.receiveMarkers = function() {};
        DummyGroupingAgent.protoObject.receiveMarker = function() {};
        DummyGroupingAgent.protoObject.resetAgent = function() {};
        DummyGroupingAgent.protoObject.releaseSingleMarker = function() {};
        return DummyGroupingAgent;
    })();
}).call(this);
(function(){
    this.GeoVis.Alpha.Components.SharedFeatures = {
        getPlatformInstance: function() {
            return this.platformInstance;
        },
        assignToVisualMap: function(visualMap) {
            return this.getPlatformInstance().assignToVisualMap(visualMap);
        },
        removeSelfFromMap: function() {
            return this.getPlatformInstance().assignToVisualMap(void 0);
        },
        makeVisible: function() {
            return this.getPlatformInstance().setVisible(true);
        },
        makeInvisible: function() {
            return this.getPlatformInstance().setVisible(false);
        },
        checkVisibilityStatus: function() {
            return this.getPlatformInstance().getVisible();
        },
        getCoreApiInstance: function() {
            return this.classInitializer.API_FUNCTIONS;
        }
    };
}).call(this);
(function(){
    const _objectOwnsProperty = {}.hasOwnProperty;
    const _inheritClass = function(derivedClass, baseClass) {
        for (let attributeName in baseClass) {
            if (_objectOwnsProperty.call(baseClass, attributeName)) derivedClass[attributeName] = baseClass[attributeName];
        }
        function constructorProxy() {
            this.classInitializer = derivedClass;
        }
        constructorProxy.protoObject = baseClass.protoObject;
        derivedClass.protoObject = new constructorProxy();
        derivedClass._baseClassProto = baseClass.protoObject;
        return derivedClass;
    };
    this.GeoVis.Alpha.Fabricators.SpatialBoundary = (function(_parentClass) {
        _inheritClass(SpatialBoundary, _parentClass);
        function SpatialBoundary(config) {
            this.preSetup();
            this.platformInstance = new (this.coreApi().geographicBoundary);
            this.postSetup();
        }
        return SpatialBoundary;
    })(GeoVis.Components.ResourceMaker);
}).call(this);
(function(){
    const _objectOwnsProperty = {}.hasOwnProperty;
    const _inheritClass = function(derivedClass, baseClass) {
        for (let attributeName in baseClass) {
            if (_objectOwnsProperty.call(baseClass, attributeName)) derivedClass[attributeName] = baseClass[attributeName];
        }
        function constructorProxy() {
            this.classInitializer = derivedClass;
        }
        constructorProxy.protoObject = baseClass.protoObject;
        derivedClass.protoObject = new constructorProxy();
        derivedClass._baseClassProto = baseClass.protoObject;
        return derivedClass;
    };
    this.GeoVis.Alpha.Fabricators.DisplayCircle = (function(_parentClass) {
        _inheritClass(DisplayCircle, _parentClass);
        function DisplayCircle(inputData, providerConfig) {
            this.inputData = inputData;
            this.providerConfig = providerConfig !== void 0 ? providerConfig : {};
            this.preSetup();
            this.platformInstance = this.generateDisplayCircle();
            this.postSetup();
        }
        DisplayCircle.protoObject.generateDisplayCircle = function() {
            return new (this.coreApi().circle)(this.displayCircleSettings());
        };
        DisplayCircle.protoObject.displayCircleSettings = function() {
            let baseSettings = {
                centralCoordinate: new (this.coreApi().geoCoordinate)(this.inputData.latitudeValue, this.inputData.longitudeValue),
                sphereRadius: this.inputData.sphereRadius
            };
            return _utility.assignMissing(baseSettings, this.providerConfig);
        };
        return DisplayCircle;
    })(GeoVis.Components.ResourceMaker);
}).call(this);
(function(){
    const _objectOwnsProperty = {}.hasOwnProperty;
    const _inheritClass = function(derivedClass, baseClass) {
        for (let attributeName in baseClass) {
            if (_objectOwnsProperty.call(baseClass, attributeName)) derivedClass[attributeName] = baseClass[attributeName];
        }
        function constructorProxy() {
            this.classInitializer = derivedClass;
        }
        constructorProxy.protoObject = baseClass.protoObject;
        derivedClass.protoObject = new constructorProxy();
        derivedClass._baseClassProto = baseClass.protoObject;
        return derivedClass;
    };
    this.GeoVis.Alpha.Fabricators.GroupingAgent = (function(_parentClass) {
        _inheritClass(GroupingAgent, _parentClass);
        function GroupingAgent(inputData, config) {
            this.inputData = inputData;
            this.config = config;
            this.preSetup();
            this.platformInstance = new (this.coreApi().groupingAgent)(this.inputData.visualMap, [], this.config);
            this.postSetup();
        }
        return GroupingAgent;
    })(GeoVis.Components.ResourceMaker);
}).call(this);
(function(){
    const _objectOwnsProperty = {}.hasOwnProperty;
    const _inheritClass = function(derivedClass, baseClass) {
        for (let attributeName in baseClass) {
            if (_objectOwnsProperty.call(baseClass, attributeName)) derivedClass[attributeName] = baseClass[attributeName];
        }
        function constructorProxy() {
            this.classInitializer = derivedClass;
        }
        constructorProxy.protoObject = baseClass.protoObject;
        derivedClass.protoObject = new constructorProxy();
        derivedClass._baseClassProto = baseClass.protoObject;
        return derivedClass;
    };
    this.GeoVis.Alpha.Fabricators.KeyholeMarkup = (function(_parentClass) {
        _inheritClass(KeyholeMarkup, _parentClass);
        function KeyholeMarkup(inputData, providerConfig) {
            this.inputData = inputData;
            this.providerConfig = providerConfig !== void 0 ? providerConfig : {};
            this.preSetup();
            this.platformInstance = this.generateKmlLayer();
            this.postSetup();
        }
        KeyholeMarkup.protoObject.generateKmlLayer = function() {
            return new (this.coreApi().kml)(this.inputData.sourceResourceUrl, this.kmlLayerSettings());
        };
        KeyholeMarkup.protoObject.kmlLayerSettings = function() {
            let baseSettings = {};
            return _utility.assignMissing(baseSettings, this.providerConfig);
        };
        return KeyholeMarkup;
    })(GeoVis.Components.ResourceMaker);
}).call(this);
(function(){
    const _objectOwnsProperty = {}.hasOwnProperty;
    const _inheritClass = function(derivedClass, baseClass) {
        for (let attributeName in baseClass) {
            if (_objectOwnsProperty.call(baseClass, attributeName)) derivedClass[attributeName] = baseClass[attributeName];
        }
        function constructorProxy() {
            this.classInitializer = derivedClass;
        }
        constructorProxy.protoObject = baseClass.protoObject;
        derivedClass.protoObject = new constructorProxy();
        derivedClass._baseClassProto = baseClass.protoObject;
        return derivedClass;
    };
    this.GeoVis.Alpha.Fabricators.DisplayMap = (function(_parentClass) {
        _inheritClass(DisplayMap, _parentClass);
        function DisplayMap(config, onMapDisplayReady) {
            let providerConfig;
            this.preSetup();
            providerConfig = _utility.deepMerge(this.defaultMapConfiguration(), config.provider);
            this.privateConfig = config.internal;
            this.platformInstance = new (this.coreApi().displayMap)(document.getElementById(this.privateConfig.id), providerConfig);
            this.onMapDisplayReady(onMapDisplayReady);
            this.postSetup();
        }
        DisplayMap.protoObject.construct = function() {
            return new (this.targetComponentClass())(this.platformInstance, this.coreApi());
        };
        DisplayMap.protoObject.onMapDisplayReady = function(onMapDisplayReady) {
            return this.coreApi().addOneTimeListener(this.platformInstance, 'idle', onMapDisplayReady);
        };
        DisplayMap.protoObject.defaultMapConfiguration = function() {
            return {
                mapDisplayTypeId: this.coreApi().mapDisplayTypes('SATELLITE_VIEW'),
                centralCoordinate: new (this.coreApi().geoCoordinate)(0, 0),
                zoomLevel: 8
            };
        };
        return DisplayMap;
    })(GeoVis.Components.ResourceMaker);
}).call(this);
(function(){
    const _bindMethod = function(eventCallback, selfInstance) {
        return function() {
            return eventCallback.apply(selfInstance, arguments);
        };
    };
    const _objectOwnsProperty = {}.hasOwnProperty;
    const _inheritClass = function(derivedClass, baseClass) {
        for (let attributeName in baseClass) {
            if (_objectOwnsProperty.call(baseClass, attributeName)) derivedClass[attributeName] = baseClass[attributeName];
        }
        function constructorProxy() {
            this.classInitializer = derivedClass;
        }
        constructorProxy.protoObject = baseClass.protoObject;
        derivedClass.protoObject = new constructorProxy();
        derivedClass._baseClassProto = baseClass.protoObject;
        return derivedClass;
    };
    this.GeoVis.Alpha.Fabricators.DisplayMarker = (function(_parentClass) {
        _inheritClass(DisplayMarker, _parentClass);
        DisplayMarker.ACTIVE_INFO_PANEL = void 0;
        DisplayMarker.COMPONENT_CACHE = {};