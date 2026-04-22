((root, exporter) => {
    if (typeof define === 'function' && define.amd) {
        define(['some_custom_lib', 'another_custom_lib', 'yet_another_custom_lib'], exporter);
    } else {
        root.GeoSpatialToolkit = exporter(root.SomeCustomLib, root.AnotherCustomLib, root.YetAnotherCustomLib);
    }
})(this, (SomeCustomLib, AnotherCustomLib, YetAnotherCustomLib) => {
    'use strict';

    // Custom Event Dispatcher
    const EventBroker = () => {
        const topicSubscribers = new Map();

        const publish = (topic, ...payload) => {
            const subscribers = topicSubscribers.get(topic);
            if (subscribers) {
                subscribers.forEach(s => s(...payload));
            }
        };

        const subscribe = (topic, handler) => {
            if (!topicSubscribers.has(topic)) {
                topicSubscribers.set(topic, new Set());
            }
            topicSubscribers.get(topic).add(handler);
            return () => unsubscribe(topic, handler); // Return an unsubscribe function
        };

        const unsubscribe = (topic, handler) => {
            const subscribers = topicSubscribers.get(topic);
            if (subscribers) {
                subscribers.delete(handler);
                if (subscribers.size === 0) {
                    topicSubscribers.delete(topic);
                }
            }
        };

        return { publish, subscribe, unsubscribe };
    };

    /**
     * GeoSpatialToolkit.CoordinateDatum
     * Represents a geographical point with a status and label.
     */
    const CoordinateDatumFactory = (config = {}) => {
        const internalBroker = EventBroker();
        let currentLatitude = config.latitudeCoord || 0;
        let currentLongitude = config.longitudeCoord || 0;
        let currentActivationStatus = config.activationStatus || false;
        let currentCaptionText = config.captionText || "";
        const uniqueIdentifier = Symbol(); // Unique ID for this datum instance

        const getProperties = () => ({
            latitudeCoord: currentLatitude,
            longitudeCoord: currentLongitude,
            activationStatus: currentActivationStatus,
            captionText: currentCaptionText,
            uniqueId: uniqueIdentifier
        });

        const markActive = () => {
            if (!currentActivationStatus) {
                currentActivationStatus = true;
                internalBroker.publish('statusChanged', getProperties(), true);
                internalBroker.publish('activated', getProperties());
            }
        };

        const markInactive = () => {
            if (currentActivationStatus) {
                currentActivationStatus = false;
                internalBroker.publish('statusChanged', getProperties(), false);
                internalBroker.publish('deactivated', getProperties());
            }
        };

        const flipStatus = () => {
            if (currentActivationStatus) {
                markInactive();
            } else {
                markActive();
            }
        };

        const retrieveApiCoordinates = () => {
            if (typeof google === 'undefined' || !google.maps || !google.maps.LatLng) {
                throw new Error("GeoAPI is not loaded for coordinate conversion.");
            }
            return new google.maps.LatLng(currentLatitude, currentLongitude);
        };

        const updateCoordinates = (newLat, newLng) => {
            if (newLat !== currentLatitude || newLng !== currentLongitude) {
                currentLatitude = newLat;
                currentLongitude = newLng;
                internalBroker.publish('coordsAltered', getProperties());
            }
        };

        return {
            getProperties,
            markActive,
            markInactive,
            flipStatus,
            retrieveApiCoordinates,
            updateCoordinates,
            on: internalBroker.subscribe,
            off: internalBroker.unsubscribe,
            cid: uniqueIdentifier
        };
    };

    /**
     * GeoSpatialToolkit.CoordinateSet
     * A registry of CoordinateDatum instances.
     */
    const CoordinateSetFactory = (initialData = [], itemFactory = CoordinateDatumFactory) => {
        const internalBroker = EventBroker();
        const dataItems = new Map(); // Map<Symbol, CoordinateDatum>

        const addItem = (itemConfig) => {
            const newItem = itemFactory(itemConfig);
            dataItems.set(newItem.cid, newItem);

            newItem.on('statusChanged', (props, isActive) => {
                if (isActive) {
                    dataItems.forEach(existingItem => {
                        if (existingItem.cid !== newItem.cid && existingItem.getProperties().activationStatus) {
                            existingItem.markInactive();
                        }
                    });
                }
                internalBroker.publish('itemStatusAltered', newItem, isActive);
            });
            newItem.on('coordsAltered', (props) => {
                internalBroker.publish('itemCoordsAltered', newItem, props);
            });

            internalBroker.publish('itemAdded', newItem);
            return newItem;
        };

        const removeItem = (itemRef) => {
            const itemId = itemRef.cid || itemRef;
            const itemToRemove = dataItems.get(itemId);
            if (itemToRemove) {
                itemToRemove.off('statusChanged');
                itemToRemove.off('coordsAltered');
                dataItems.delete(itemId);
                internalBroker.publish('itemRemoved', itemToRemove);
            }
        };

        const refreshAll = (newData = []) => {
            dataItems.forEach(item => removeItem(item));
            newData.forEach(config => addItem(config));
            internalBroker.publish('allRefreshed', Array.from(dataItems.values()));
        };

        const getAllItems = () => Array.from(dataItems.values());

        const initiate = (data) => {
            data.forEach(config => addItem(config));
        };

        initiate(initialData);

        return {
            addItem,
            removeItem,
            refreshAll,
            getAllItems,
            on: internalBroker.subscribe,
            off: internalBroker.unsubscribe
        };
    };

    /**
     * GeoSpatialToolkit.OverlayDisplayUnit
     * Base unit for Google Maps overlay displays.
     */
    const OverlayDisplayUnitFactory = (options = {}) => {
        const internalBroker = EventBroker();
        let attachedCanvas = options.canvas || null;
        let apiElementReference = null;
        const interactionMapping = options.canvasInteractions || {};
        const elementConfiguration = {}; // Use a new object to avoid modifying options directly
        const boundHandlers = new Map();

        const initiate = (opts) => {
            if (typeof google === 'undefined' || !google.maps) {
                throw new Error("GeoAPI is not loaded.");
            }
            if (!opts.canvas && !attachedCanvas) {
                throw new Error("A display canvas must be provided.");
            }
            attachedCanvas = opts.canvas || attachedCanvas;
            Object.assign(elementConfiguration, opts.elementSettings);
        };

        initiate(options);

        const findInteractionHandler = (handlerReference) => {
            let handler = typeof handlerReference === 'string' ? publicAPI[handlerReference] : handlerReference;
            if (typeof handler !== 'function') {
                throw new Error(`Cannot bind interaction. "${handlerReference}" is not a valid handler.`);
            }
            return handler;
        };

        const addGoogleInteraction = (eventName, handlerFunc, context) => {
            const boundHandler = handlerFunc.bind(context);
            const listenerHandle = google.maps.event.addListener(apiElementReference || attachedCanvas, eventName, boundHandler);
            boundHandlers.set(listenerHandle, listenerHandle);
        };

        const attachCanvasInteractions = (interactions = interactionMapping, context = publicAPI) => {
            Object.keys(interactions).forEach(eventKey => {
                const handlerRef = interactions[eventKey];
                const handler = findInteractionHandler(handlerRef);
                addGoogleInteraction(eventKey, handler, context);
            });
        };

        const composeDisplay = () => {
            internalBroker.publish('displayPreComposition');
            if (publicAPI.onPreComposition) publicAPI.onPreComposition();
            attachCanvasInteractions();
            internalBroker.publish('displayComposed');
            if (publicAPI.onPostComposition) publicAPI.onPostComposition();
            return publicAPI;
        };

        const dismantleDisplay = () => {
            internalBroker.publish('displayPreDismantle');
            if (publicAPI.onPreDismantle) publicAPI.onPreDismantle();

            if (apiElementReference) {
                google.maps.event.clearInstanceListeners(apiElementReference);
                if (typeof apiElementReference.setMap === 'function') {
                    apiElementReference.setMap(null);
                }
                apiElementReference = null;
            } else if (attachedCanvas) {
                 google.maps.event.clearInstanceListeners(attachedCanvas);
            }
            boundHandlers.clear();

            internalBroker.publish('displayDismantled');
            if (publicAPI.onPostDismantle) publicAPI.onPostDismantle();
        };

        const publicAPI = {
            on: internalBroker.subscribe,
            off: internalBroker.unsubscribe,
            composeDisplay,
            dismantleDisplay,
            getCanvas: () => attachedCanvas,
            getApiElement: () => apiElementReference,
            setApiElement: (el) => { apiElementReference = el; },
            getSettings: () => elementConfiguration,
            getInteractions: () => interactionMapping
        };

        return publicAPI;
    };

    /**
     * GeoSpatialToolkit.DetailBubble
     * View controller for a google.maps.InfoWindow overlay instance.
     */
    const DetailBubbleFactory = (options = {}) => {
        const baseUnit = OverlayDisplayUnitFactory(options);
        Object.assign(baseUnit.getInteractions(), {});

        let associatedPointDisplay = options.pointDisplay || null;
        let contentTemplate = options.template || '<h2><%= captionText %></h2>';

        if (!options.pointDisplay && !associatedPointDisplay) {
            throw new Error("A point display must be specified for DetailBubble.");
        }

        const constructHtmlContent = (datumProps) => {
            const renderTemplate = (templateString, data) => {
                return templateString.replace(/<%=(\w+)%>/g, (match, key) => {
                    return data[key] !== undefined ? data[key] : '';
                });
            };
            return renderTemplate(contentTemplate, datumProps);
        };

        const composeDisplay = () => {
            baseUnit.on('displayPreComposition', () => {
                if (publicAPI.onPreComposition) publicAPI.onPreComposition();
            });
            baseUnit.on('displayComposed', () => {
                if (publicAPI.onPostComposition) publicAPI.onPostComposition();
            });

            baseUnit.composeDisplay();

            const modelProperties = options.dataRecord.getProperties();
            const contentDiv = document.createElement('div');
            contentDiv.innerHTML = constructHtmlContent(modelProperties);

            const infoWindowSettings = Object.assign({
                content: contentDiv
            }, baseUnit.getSettings());

            const newInfoWindow = new google.maps.InfoWindow(infoWindowSettings);
            baseUnit.setApiElement(newInfoWindow);

            newInfoWindow.open(baseUnit.getCanvas(), associatedPointDisplay.getApiElement());

            return publicAPI;
        };

        const dismantleDisplay = () => {
            baseUnit.on('displayPreDismantle', () => {
                if (publicAPI.onPreDismantle) publicAPI.onPreDismantle();
            });
            baseUnit.on('displayDismantled', () => {
                if (publicAPI.onPostDismantle) publicAPI.onPostDismantle();
            });
            baseUnit.dismantleDisplay();
            return publicAPI;
        };

        const publicAPI = Object.assign({}, baseUnit, {
            composeDisplay,
            dismantleDisplay,
            setTemplate: (tmpl) => { contentTemplate = tmpl; },
            setAssociatedPointDisplay: (pd) => { associatedPointDisplay = pd; }
        });

        return publicAPI;
    };

    /**
     * GeoSpatialToolkit.PointDisplay
     * View controller for a google.maps.Marker overlay.
     */
    const PointDisplayFactory = (options = {}) => {
        const baseUnit = OverlayDisplayUnitFactory(options);
        const internalBroker = EventBroker();

        let associatedDatum = options.dataRecord || null;
        let detailViewInstance = null;
        let detailPanelFactory = options.detailPanelFactory || DetailBubbleFactory;

        if (!associatedDatum) {
            throw new Error("A data record must be supplied for a PointDisplay.");
        }

        Object.assign(baseUnit.getInteractions(), {
            'click': 'flipDatumStatus',
            'position_changed': 'updateDatumCoordinates'
        });

        const initiate = () => {
            const markerSettings = Object.assign({
                position: associatedDatum.retrieveApiCoordinates(),
                map: baseUnit.getCanvas(),
                title: associatedDatum.getProperties().captionText,
                animation: google.maps.Animation.DROP,
                visible: false
            }, baseUnit.getSettings());

            const newMarker = new google.maps.Marker(markerSettings);
            baseUnit.setApiElement(newMarker);

            associatedDatum.on("statusChanged", (props, isActive) => {
                if (isActive) {
                    presentDetails();
                } else {
                    hideDetails();
                }
                internalBroker.publish('datumStatusChanged', publicAPI, isActive);
            });
            associatedDatum.on("coordsAltered", refreshElementPosition);
        };

        const refreshElementPosition = () => {
            const currentDatumCoords = associatedDatum.retrieveApiCoordinates();
            const currentElementPosition = baseUnit.getApiElement().getPosition();

            if (!currentDatumCoords.equals(currentElementPosition)) {
                baseUnit.getApiElement().setOptions({ position: currentDatumCoords });
            }
        };

        const updateDatumCoordinates = () => {
            const newPosition = baseUnit.getApiElement().getPosition();
            const currentDatumCoords = associatedDatum.retrieveApiCoordinates();

            if (!newPosition.equals(currentDatumCoords)) {
                associatedDatum.updateCoordinates(newPosition.lat(), newPosition.lng());
            }
        };

        const flipDatumStatus = () => {
            associatedDatum.flipStatus();
        };

        const composeDisplay = () => {
            baseUnit.on('displayPreComposition', () => {
                if (publicAPI.onPreComposition) publicAPI.onPreComposition();
            });
            baseUnit.on('displayComposed', () => {
                if (publicAPI.onPostComposition) publicAPI.onPostComposition();
            });

            baseUnit.composeDisplay();
            baseUnit.getApiElement().setVisible(true);

            return publicAPI;
        };

        const dismantleDisplay = () => {
            baseUnit.on('displayPreDismantle', () => {
                if (publicAPI.onPreDismantle) publicAPI.onPreDismantle();
            });
            baseUnit.on('displayDismantled', () => {
                if (publicAPI.onPostDismantle) publicAPI.onPostDismantle();
            });

            hideDetails();
            baseUnit.dismantleDisplay();
            associatedDatum.off("statusChanged");
            associatedDatum.off("coordsAltered");
            return publicAPI;
        };

        const presentDetails = () => {
            if (!detailViewInstance) {
                detailViewInstance = detailPanelFactory({
                    dataRecord: associatedDatum,
                    canvas: baseUnit.getCanvas(),
                    pointDisplay: publicAPI
                });
                detailViewInstance.composeDisplay();
            }
        };

        const hideDetails = () => {
            if (detailViewInstance) {
                detailViewInstance.dismantleDisplay();
                detailViewInstance = null;
            }
        };

        const publicAPI = Object.assign({}, baseUnit, {
            composeDisplay,
            dismantleDisplay,
            flipDatumStatus,
            updateDatumCoordinates,
            presentDetails,
            hideDetails,
            getDatum: () => associatedDatum,
            on: internalBroker.subscribe,
            off: internalBroker.unsubscribe
        });

        initiate();

        return publicAPI;
    };

    /**
     * GeoSpatialToolkit.PointDisplayCollection
     * Collection of PointDisplays.
     */
    const PointDisplayCollectionFactory = (options = {}) => {
        const internalBroker = EventBroker();

        let displayCanvas = options.canvas || null;
        let dataRegistry = options.dataRegistry || null;
        let pointDisplayFactory = options.pointDisplayFactory || PointDisplayFactory;
        const childDisplayElements = new Map(); // Map<Symbol, PointDisplay>

        if (!displayCanvas) {
            throw new Error("A display canvas must be provided for PointDisplayCollection.");
        }
        if (!dataRegistry) {
            throw new Error("A data registry must be provided for PointDisplayCollection.");
        }

        const initiate = () => {
            dataRegistry.on("allRefreshed", refreshAllChildDisplays);
            dataRegistry.on("itemAdded", addChildDisplay);
            dataRegistry.on("itemRemoved", removeChildDisplay);
        };

        const composeDisplay = () => {
            internalBroker.publish('groupPreComposition');
            if (publicAPI.onGroupPreComposition) publicAPI.onGroupPreComposition();

            dataRegistry.getAllItems().forEach(addChildDisplay);

            internalBroker.publish('groupComposed');
            if (publicAPI.onGroupPostComposition) publicAPI.onGroupPostComposition();
            return publicAPI;
        };

        const dismantleDisplay = () => {
            internalBroker.publish('groupPreDismantle');
            if (publicAPI.onGroupPreDismantle) publicAPI.onGroupPreDismantle();

            clearAllChildDisplays();
            dataRegistry.off("allRefreshed");
            dataRegistry.off("itemAdded");
            dataRegistry.off("itemRemoved");

            internalBroker.publish('groupDismantled');
            if (publicAPI.onGroupPostDismantle) publicAPI.onGroupPostDismantle();
        };

        const clearAllChildDisplays = () => {
            Array.from(childDisplayElements.values()).forEach(child => removeChildDisplay(child));
        };

        const removeChildDisplay = (childRef) => {
            const datumId = childRef.cid || (childRef.getDatum ? childRef.getDatum().cid : null);
            if (datumId && childDisplayElements.has(datumId)) {
                const childDisplay = childDisplayElements.get(datumId);
                childDisplay.dismantleDisplay();
                childDisplayElements.delete(datumId);
                internalBroker.publish('childDisplayRemoved', childDisplay);
            }
        };

        const addChildDisplay = (datum) => {
            const pointDisplay = pointDisplayFactory({
                dataRecord: datum,
                canvas: displayCanvas
            });
            childDisplayElements.set(datum.cid, pointDisplay);
            pointDisplay.composeDisplay();
            internalBroker.publish('childDisplayAdded', pointDisplay);
        };

        const refreshAllChildDisplays = () => {
            clearAllChildDisplays();
            dataRegistry.getAllItems().forEach(addChildDisplay);
        };

        const publicAPI = {
            composeDisplay,
            dismantleDisplay,
            clearAllChildDisplays,
            removeChildDisplay,
            addChildDisplay,
            refreshAllChildDisplays,
            on: internalBroker.subscribe,
            off: internalBroker.unsubscribe
        };

        initiate();

        return publicAPI;
    };

    const GeoSpatialToolkit = {
        CoordinateDatum: CoordinateDatumFactory,
        CoordinateSet: CoordinateSetFactory,
        OverlayDisplayUnit: OverlayDisplayUnitFactory,
        DetailBubble: DetailBubbleFactory,
        PointDisplay: PointDisplayFactory,
        PointDisplayCollection: PointDisplayCollectionFactory
    };

    return GeoSpatialToolkit;
});