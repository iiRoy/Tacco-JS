(function (universalWindow, universalDocument, undefined) {

    class SignalBroadcaster {
        constructor() {
            this._subscribers = new Map();
        }

        tuneIn(channelIdentifier, subscriberFunction, contextObject) {
            if (!this._subscribers.has(channelIdentifier)) {
                this._subscribers.set(channelIdentifier, []);
            }
            this._subscribers.get(channelIdentifier).push({ func: subscriberFunction, scope: contextObject });
            return this;
        }

        tuneOut(channelIdentifier, subscriberFunction, contextObject) {
            if (!this._subscribers.has(channelIdentifier)) {
                return this;
            }
            const currentSubscribers = this._subscribers.get(channelIdentifier);
            this._subscribers.set(channelIdentifier, currentSubscribers.filter(item => !(item.func === subscriberFunction && item.scope === contextObject)));
            return this;
        }

        emit(channelIdentifier, dataPayload) {
            if (!this._subscribers.has(channelIdentifier)) {
                return;
            }
            const subscribersToNotify = [...this._subscribers.get(channelIdentifier)];
            for (const item of subscribersToNotify) {
                item.func.call(item.scope || this, dataPayload);
            }
        }

        isChannelActive(channelIdentifier) {
            return this._subscribers.has(channelIdentifier) && this._subscribers.get(channelIdentifier).length > 0;
        }
    }

    const ElementModifier = {
        constructElement: function(tag, styleClasses, initialContent = '') {
            const element = universalDocument.createElement(tag);
            if (styleClasses) {
                element.className = styleClasses;
            }
            element.innerHTML = initialContent;
            return element;
        },
        addVisualClass: function(element, className) {
            if (element) element.classList.add(className);
        },
        removeVisualClass: function(element, className) {
            if (element) element.classList.remove(className);
        },
        setVisualOpacity: function(element, value) {
            if (element) element.style.opacity = value;
        },
        applyPositionalTransform: function(element, point) {
            if (element) element.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
        }
    };

    const UserInteraction = {
        registerEvent: function(element, eventType, handler, context) {
            if (element) element.addEventListener(eventType, handler.bind(context));
        },
        deregisterEvent: function(element, eventType, handler, context) {
            if (element) element.removeEventListener(eventType, handler.bind(context));
        },
        stopEventFlow: function(event) {
            if (event) event.stopPropagation();
        },
        preventDefaultBehavior: function(event) {
            if (event) event.preventDefault();
        }
    };

    class PixelPoint {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }

        combine(other) {
            return new PixelPoint(this.x + other.x, this.y + other.y);
        }

        quantize() {
            return new PixelPoint(Math.round(this.x), Math.round(this.y));
        }
    }

    class GeodeticPoint {
        constructor(latitude, longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
        }
    }

    const GeoPixelConverter = {
        createPixel: function(x, y) { return new PixelPoint(x, y); },
        createGeodetic: function(lat, lng) { return new GeodeticPoint(lat, lng); }
    };

    const SystemCapabilities = {
        supportsHardwareAcceleration: (function() {
            const el = universalDocument.createElement('p');
            const transforms = {
                'webkitTransform': '-webkit-transform',
                'OTransform': '-o-transform',
                'msTransform': '-ms-transform',
                'MozTransform': '-moz-transform',
                'transform': 'transform'
            };
            universalDocument.body.insertBefore(el, null);
            for (const t in transforms) {
                if (el.style[t] !== undefined) {
                    el.style[t] = 'translate3d(1px,1px,1px)';
                    const computed = universalWindow.getComputedStyle(el).getPropertyValue(transforms[t]);
                    universalDocument.body.removeChild(el);
                    return computed && computed.length > 0 && computed !== 'none';
                }
            }
            universalDocument.body.removeChild(el);
            return false;
        })(),
        isTouchDevice: 'ontouchstart' in universalWindow || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)
    };

    class AnnotationPanel extends SignalBroadcaster {
        constructor(initialConfiguration, attachedEntityReference) {
            super();
            this._settings = Object.assign({}, AnnotationPanel.standardConfiguration, initialConfiguration);

            this._attachedEntityReference = attachedEntityReference;
            this._mapInterface = null;
            this._animatesWithZoom = SystemCapabilities.supportsHardwareAcceleration && this._settings.animateOnZoom;
            this._isCurrentlyAttached = false;
            this._priorContentValue = null;
            this._currentContentValue = null;
            this._visualDisplayElement = null;
        }

        static standardConfiguration = {
            cssClassIdentifier: '',
            isInteractive: false,
            displayOrientation: 'right',
            permanentVisibility: false,
            visualOffset: [12, -15],
            initialVisualOpacity: 1,
            animateOnZoom: true
        };

        connectToMapInterface(mapContext) {
            this._mapInterface = mapContext;

            let targetLayerPane;
            if (this._attachedEntityReference && typeof this._attachedEntityReference.getPaneDesignation === 'function') {
                targetLayerPane = this._mapInterface.getLayerPaneElement(this._attachedEntityReference.getPaneDesignation());
            } else {
                targetLayerPane = this._mapInterface.getLayerPaneElement('default');
            }

            if (!this._visualDisplayElement) {
                this._establishVisualElement();
            }

            targetLayerPane.appendChild(this._visualDisplayElement);

            this._activateInteractions();
            this._refreshVisualState();
            this.setVisualOpacity(this._settings.initialVisualOpacity);

            this._mapInterface
                .tuneIn('mapMoveComplete', this._handleMapMoveEnd, this)
                .tuneIn('mapStateReset', this._handleMapStateReset, this);

            if (this._animatesWithZoom) {
                this._mapInterface.tuneIn('mapZoomAnimation', this._performZoomAnimation, this);
            }

            if (SystemCapabilities.isTouchDevice && !this._settings.permanentVisibility) {
                UserInteraction.registerEvent(this._visualDisplayElement, 'click', this.hideVisual, this);
            }
            this._isCurrentlyAttached = true;
        }

        disconnectFromMapInterface(mapContext) {
            if (!this._visualDisplayElement || !this._visualDisplayElement.parentNode) return;

            this._visualDisplayElement.parentNode.removeChild(this._visualDisplayElement);

            mapContext.tuneOut('mapZoomAnimation', this._performZoomAnimation, this);
            mapContext.tuneOut('mapMoveComplete', this._handleMapMoveEnd, this);
            mapContext.tuneOut('mapStateReset', this._handleMapStateReset, this);

            this._deactivateInteractions();

            this._mapInterface = null;
            this._isCurrentlyAttached = false;
        }

        setPosition(geodeticCoordinate) {
            this._currentGeodeticPosition = GeoPixelConverter.createGeodetic(geodeticCoordinate.latitude, geodeticCoordinate.longitude);
            if (this._mapInterface) {
                this._refreshPosition();
            }
            return this;
        }

        setDisplayText(newTextContent) {
            this._priorContentValue = this._currentContentValue;
            this._currentContentValue = newTextContent;

            this._refreshDisplayText();

            return this;
        }

        hideVisual() {
            const map = this._mapInterface;

            if (map) {
                if (SystemCapabilities.isTouchDevice && !this._settings.permanentVisibility) {
                    UserInteraction.deregisterEvent(this._visualDisplayElement, 'click', this.hideVisual);
                }
                map.removeAnnotationElement(this);
            }
        }

        setVisualDepth(depthValue) {
            this._depthLevel = depthValue;

            if (this._visualDisplayElement && this._depthLevel) {
                this._visualDisplayElement.style.zIndex = depthValue;
            }
        }

        setVisualOpacity(opacityValue) {
            this._settings.initialVisualOpacity = opacityValue;

            if (this._visualDisplayElement) {
                ElementModifier.setVisualOpacity(this._visualDisplayElement, opacityValue);
            }
        }

        _establishVisualElement() {
            this._visualDisplayElement = ElementModifier.constructElement('div', 'map-annotation ' + this._settings.cssClassIdentifier + ' map-animated-element');
            this.setVisualDepth(this._depthLevel);
        }

        _refreshVisualState() {
            if (!this._mapInterface) { return; }

            this._visualDisplayElement.style.visibility = 'hidden';

            this._refreshDisplayText();
            this._refreshPosition();

            this._visualDisplayElement.style.visibility = '';
        }

        _refreshDisplayText() {
            if (!this._currentContentValue || !this._mapInterface || this._priorContentValue === this._currentContentValue) {
                return;
            }

            if (typeof this._currentContentValue === 'string') {
                this._visualDisplayElement.innerHTML = this._currentContentValue;

                this._priorContentValue = this._currentContentValue;

                this._contentWidth = this._visualDisplayElement.offsetWidth;
            }
        }

        _refreshPosition() {
            const pixelPoint = this._mapInterface.convertGeodeticToPixel(this._currentGeodeticPosition);
            this._applyPixelPosition(pixelPoint);
        }

        _applyPixelPosition(pixelPoint) {
            const map = this._mapInterface;
            const element = this._visualDisplayElement;
            const centerScreenPoint = map.convertGeodeticToScreen(map.getMapCenterGeodetic());
            const annotationScreenPoint = map.convertPixelToScreen(pixelPoint);
            const orientation = this._settings.displayOrientation;
            const contentWidth = this._contentWidth;
            const offset = GeoPixelConverter.createPixel(this._settings.visualOffset[0], this._settings.visualOffset[1]);

            let finalPixelPosition = pixelPoint;

            if (orientation === 'right' || (orientation === 'auto' && annotationScreenPoint.x < centerScreenPoint.x)) {
                ElementModifier.addVisualClass(element, 'map-annotation-right');
                ElementModifier.removeVisualClass(element, 'map-annotation-left');

                finalPixelPosition = finalPixelPosition.combine(offset);
            } else {
                ElementModifier.addVisualClass(element, 'map-annotation-left');
                ElementModifier.removeVisualClass(element, 'map-annotation-right');

                finalPixelPosition = finalPixelPosition.combine(GeoPixelConverter.createPixel(-offset.x - contentWidth, offset.y));
            }

            ElementModifier.applyPositionalTransform(element, finalPixelPosition);
        }

        _performZoomAnimation(animationData) {
            const newPixelPosition = this._mapInterface.transformGeodeticForZoom(this._currentGeodeticPosition, animationData.newZoomLevel, animationData.newCenterGeodetic).quantize();

            this._applyPixelPosition(newPixelPosition);
        }

        _handleMapMoveEnd() {
            if (!this._animatesWithZoom || this._settings.displayOrientation === 'auto') {
                this._refreshPosition();
            }
        }

        _handleMapStateReset(eventPayload) {
            if (eventPayload && eventPayload.forceUpdate) {
                this._refreshVisualState();
            }
        }

        _activateInteractions() {
            if (!this._settings.isInteractive) { return; }

            const element = this._visualDisplayElement;
            const eventTypes = ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'contextmenu'];

            ElementModifier.addVisualClass(element, 'map-interactive');
            UserInteraction.registerEvent(element, 'click', this._onElementClick, this);

            for (let i = 0; i < eventTypes.length; i++) {
                UserInteraction.registerEvent(element, eventTypes[i], this._broadcastCustomEvent, this);
            }
        }

        _deactivateInteractions() {
            if (!this._settings.isInteractive) { return; }

            const element = this._visualDisplayElement;
            const eventTypes = ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'contextmenu'];

            ElementModifier.removeVisualClass(element, 'map-interactive');
            UserInteraction.deregisterEvent(element, 'click', this._onElementClick, this);

            for (let i = 0; i < eventTypes.length; i++) {
                UserInteraction.deregisterEvent(element, eventTypes[i], this._broadcastCustomEvent, this);
            }
        }

        _onElementClick(domEvent) {
            if (this.isChannelActive(domEvent.type)) {
                UserInteraction.stopEventFlow(domEvent);
            }

            this.emit(domEvent.type, {
                originalDOMEvent: domEvent
            });
        }

        _broadcastCustomEvent(domEvent) {
            this.emit(domEvent.type, {
                originalDOMEvent: domEvent
            });

            if (domEvent.type === 'contextmenu' && this.isChannelActive(domEvent.type)) {
                UserInteraction.preventDefaultBehavior(domEvent);
            }
            if (domEvent.type !== 'mousedown') {
                UserInteraction.stopEventFlow(domEvent);
            } else {
                UserInteraction.preventDefaultBehavior(domEvent);
            }
        }
    }

    universalWindow.MapRenderer = {
        utilityVersion: '1.0.0-dev',
        AnnotationPanel: AnnotationPanel
    };

    const AnnotatableFeatureMixin = {
        displayAttachedAnnotation: function() {
            if (this._associatedAnnotation && this._mapInterface) {
                this._associatedAnnotation.setPosition(this.getGeodeticLocation());
                this._mapInterface.addAnnotationElement(this._associatedAnnotation);
            }
            return this;
        },

        hideAttachedAnnotation: function() {
            if (this._associatedAnnotation) {
                this._associatedAnnotation.hideVisual();
            }
            return this;
        },

        configureAnnotationPersistence: function(shouldPersist) {
            if (this._annotationShouldPersist === shouldPersist) {
                return;
            }

            this._annotationShouldPersist = shouldPersist;

            if (shouldPersist) {
                this._removeAutoAnnotationBehavior();
                this.displayAttachedAnnotation();
            } else {
                this._addAutoAnnotationBehavior();
                this.hideAttachedAnnotation();
            }
        },

        attachAnnotation: function(content, configuration) {
            let anchorPoint = (this.getAnnotationAnchorPoint && this.getAnnotationAnchorPoint()) || GeoPixelConverter.createPixel(0, 0);
            anchorPoint = anchorPoint.combine(GeoPixelConverter.createPixel(
                AnnotationPanel.standardConfiguration.visualOffset[0],
                AnnotationPanel.standardConfiguration.visualOffset[1]
            ));

            if (configuration && configuration.visualOffset) {
                anchorPoint = anchorPoint.combine(GeoPixelConverter.createPixel(configuration.visualOffset[0], configuration.visualOffset[1]));
            }

            const mergedConfig = Object.assign({visualOffset: [anchorPoint.x, anchorPoint.y]}, configuration);

            this._annotationShouldPersist = mergedConfig.permanentVisibility;

            if (!this._associatedAnnotation) {
                if (!this._annotationShouldPersist) {
                    this._addAutoAnnotationBehavior();
                }

                this
                    .tuneIn('entityRemoved', this.hideAttachedAnnotation, this)
                    .tuneIn('entityMoved', this._updateAnnotationPosition, this)
                    .tuneIn('entityAdded', this._onEntityConnected, this);

                this._hasAnnotationListeners = true;
            }

            this._associatedAnnotation = new AnnotationPanel(mergedConfig, this)
                .setDisplayText(content);

            return this;
        },

        detachAnnotation: function() {
            if (this._associatedAnnotation) {
                this.hideAttachedAnnotation();

                this._associatedAnnotation = null;

                if (this._hasAnnotationListeners) {
                    if (!this._annotationShouldPersist) {
                        this._removeAutoAnnotationBehavior();
                    }

                    this
                        .tuneOut('entityRemoved', this.hideAttachedAnnotation, this)
                        .tuneOut('entityMoved', this._updateAnnotationPosition, this)
                        .tuneOut('entityAdded', this._onEntityConnected, this);
                }

                this._hasAnnotationListeners = false;
            }
            return this;
        },

        updateAnnotationText: function(content) {
            if (this._associatedAnnotation) {
                this._associatedAnnotation.setDisplayText(content);
            }
        },

        retrieveAnnotation: function() {
            return this._associatedAnnotation;
        },

        _onEntityConnected: function() {
            if (this._annotationShouldPersist) {
                this.displayAttachedAnnotation();
            }
        },

        _addAutoAnnotationBehavior: function() {
            this
                .tuneIn('entityMouseOver', this.displayAttachedAnnotation, this)
                .tuneIn('entityMouseOut', this.hideAttachedAnnotation, this);

            if (SystemCapabilities.isTouchDevice) {
                this.tuneIn('entityClick', this.displayAttachedAnnotation, this);
            }
        },

        _removeAutoAnnotationBehavior: function() {
            this
                .tuneOut('entityMouseOver', this.displayAttachedAnnotation, this)
                .tuneOut('entityMouseOut', this.hideAttachedAnnotation, this);

            if (SystemCapabilities.isTouchDevice) {
                this.tuneOut('entityClick', this.displayAttachedAnnotation, this);
            }
        },

        _updateAnnotationPosition: function(eventDetails) {
            this._associatedAnnotation.setPosition(eventDetails.newGeodeticLocation);
        },

        _adjustVisualDepth: function(offsetAmount) {
            const newDepth = this._currentVisualDepth + offsetAmount;
            if (this._associatedAnnotation) {
                this._associatedAnnotation.setVisualDepth(newDepth);
            }
            this._currentVisualDepth = newDepth;
        },

        configureVisualOpacity: function(opacityValue, annotationSemiTransparent) {
            this._annotationSemiTransparent = annotationSemiTransparent;
            this._currentVisualOpacity = opacityValue;
            this._refreshVisualOpacity();
        },

        _refreshVisualOpacity: function() {
            const absoluteTransparency = this._currentVisualOpacity === 0 ? 0 : 1;
            if (this._associatedAnnotation) {
                this._associatedAnnotation.setVisualOpacity(this._annotationSemiTransparent ? this._currentVisualOpacity : absoluteTransparency);
            }
        },

        setGeodeticLocation: function(newGeodeticLocation) {
            if (this._associatedAnnotation && !this._annotationShouldPersist) {
                this.hideAttachedAnnotation();
            }
            return this.updateGeodeticLocation(newGeodeticLocation);
        }
    };

    class MapInterface extends SignalBroadcaster {
        constructor(containerDOMElement) {
            super();
            this._container = containerDOMElement;
            this._activeAnnotations = new Set();
            this._currentMapCenter = GeoPixelConverter.createGeodetic(0, 0);
            this._currentMapZoom = 10;
            this._layerPanes = {
                markerPane: ElementModifier.constructElement('div', 'map-marker-layer'),
                popupPane: ElementModifier.constructElement('div', 'map-popup-layer'),
                default: ElementModifier.constructElement('div', 'map-default-layer')
            };
            this._container.appendChild(this._layerPanes.markerPane);
            this._container.appendChild(this._layerPanes.popupPane);
            this._container.appendChild(this._layerPanes.default);
        }

        getLayerPaneElement(type) {
            return this._layerPanes[type] || this._layerPanes.default;
        }

        addAnnotationElement(annotationInstance) {
            this._activeAnnotations.add(annotationInstance);
            annotationInstance.connectToMapInterface(this);
        }

        removeAnnotationElement(annotationInstance) {
            if (this._activeAnnotations.has(annotationInstance)) {
                annotationInstance.disconnectFromMapInterface(this);
                this._activeAnnotations.delete(annotationInstance);
            }
        }

        convertGeodeticToPixel(geodeticCoord) {
            return GeoPixelConverter.createPixel(geodeticCoord.longitude * 100, geodeticCoord.latitude * -100);
        }

        convertPixelToScreen(pixelCoord) {
            return pixelCoord;
        }

        convertGeodeticToScreen(geodeticCoord) {
            return this.convertPixelToScreen(this.convertGeodeticToPixel(geodeticCoord));
        }

        getMapCenterGeodetic() {
            return this._currentMapCenter;
        }

        getCurrentMapZoom() {
            return this._currentMapZoom;
        }

        transformGeodeticForZoom(geodeticCoord, newZoom, newCenterGeodetic) {
            const currentPixel = this.convertGeodeticToPixel(geodeticCoord);
            const currentCenterPixel = this.convertGeodeticToPixel(this._currentMapCenter);
            const newCenterPixel = this.convertGeodeticToPixel(newCenterGeodetic);

            const zoomFactor = Math.pow(2, newZoom - this._currentMapZoom);

            const transformedPixel = currentPixel
                .combine(GeoPixelConverter.createPixel(-currentCenterPixel.x, -currentCenterPixel.y))
                .combine(GeoPixelConverter.createPixel(currentCenterPixel.x * zoomFactor, currentCenterPixel.y * zoomFactor))
                .combine(GeoPixelConverter.createPixel(newCenterPixel.x - currentCenterPixel.x * zoomFactor, newCenterPixel.y - currentCenterPixel.y * zoomFactor));

            return transformedPixel;
        }

        mockMapMoveEnd() {
            this.emit('mapMoveComplete');
        }

        mockMapStateReset(forceUpdate = false) {
            this.emit('mapStateReset', { forceUpdate });
        }

        mockMapZoomAnimation(newZoomLevel, newCenterGeodetic) {
            this.emit('mapZoomAnimation', { newZoomLevel, newCenterGeodetic });
            this._currentMapZoom = newZoomLevel;
            this._currentMapCenter = newCenterGeodetic;
        }
    }

    class DisplayEntity extends SignalBroadcaster {
        constructor(geodeticLocation, mapContext) {
            super();
            this._geodeticLocation = geodeticLocation;
            this._mapInterface = mapContext;
            this._associatedAnnotation = null;
            this._annotationShouldPersist = false;
            this._hasAnnotationListeners = false;
            this._currentVisualOpacity = 1;
            this._currentVisualDepth = 0;
            this._originalSetGeodeticLocation = this.setGeodeticLocation;
            this._originalConfigureVisualOpacity = this.configureVisualOpacity;
            this._originalAdjustVisualDepth = this._adjustVisualDepth;
            this._originalRefreshVisualOpacity = this._refreshVisualOpacity;
        }

        getGeodeticLocation() {
            return this._geodeticLocation;
        }

        updateGeodeticLocation(newGeodeticLocation) {
            this._geodeticLocation = newGeodeticLocation;
            this.emit('entityMoved', { newGeodeticLocation: newGeodeticLocation });
            return this;
        }

        getPaneDesignation() {
            return 'markerPane';
        }

        addToMap(map) {
            this._mapInterface = map;
            this.emit('entityAdded');
            return this;
        }

        removeFromMap() {
            this.emit('entityRemoved');
            this._mapInterface = null;
            return this;
        }
    }

    class VisualSpot extends DisplayEntity {
        constructor(geodeticLocation, mapContext, config = {}) {
            super(geodeticLocation, mapContext);
            this._spotConfig = Object.assign({}, VisualSpot.defaultSpotSettings, config);
            this._spotElement = ElementModifier.constructElement('div', 'visual-spot-icon');
            this._spotElement.style.backgroundColor = this._spotConfig.spotColor;
            this._spotElement.style.width = '18px';
            this._spotElement.style.height = '25px';
            this._spotElement.style.position = 'absolute';
            this._mapInterface.getLayerPaneElement('markerPane').appendChild(this._spotElement);
            this._updateSpotPosition();
            this.tuneIn('entityMoved', this._updateSpotPosition, this);
            this.setGeodeticLocation = AnnotatableFeatureMixin.setGeodeticLocation;
            this.configureVisualOpacity = AnnotatableFeatureMixin.configureVisualOpacity;
            this._refreshVisualOpacity = AnnotatableFeatureMixin._refreshVisualOpacity;
            this._adjustVisualDepth = AnnotatableFeatureMixin._adjustVisualDepth;
        }

        static defaultSpotSettings = {
            annotationAnchor: [9, -20],
            spotColor: 'red'
        };

        getAnnotationAnchorPoint() {
            return GeoPixelConverter.createPixel(this._spotConfig.annotationAnchor[0], this._spotConfig.annotationAnchor[1]);
        }

        _updateSpotPosition() {
            const pixelPos = this._mapInterface.convertGeodeticToPixel(this._geodeticLocation);
            ElementModifier.applyPositionalTransform(this._spotElement, pixelPos);
        }

        configureVisualOpacity(value, annotationSemiTransparent) {
            this._originalConfigureVisualOpacity.call(this, value, annotationSemiTransparent);
            this._spotElement.style.opacity = value;
        }

        _adjustVisualDepth(offsetAmount) {
            this._originalAdjustVisualDepth.call(this, offsetAmount);
            this._spotElement.style.zIndex = this._currentVisualDepth;
        }
    }
    Object.assign(VisualSpot.prototype, AnnotatableFeatureMixin);

    class CircularSpot extends DisplayEntity {
        constructor(geodeticLocation, mapContext, config = {}) {
            super(geodeticLocation, mapContext);
            this._circleConfig = Object.assign({}, CircularSpot.defaultCircleSettings, config);
            this._circleElement = ElementModifier.constructElement('div', 'visual-circle-spot');
            this._circleElement.style.backgroundColor = this._circleConfig.fillColor;
            this._circleElement.style.width = this._circleConfig.radius * 2 + 'px';
            this._circleElement.style.height = this._circleConfig.radius * 2 + 'px';
            this._circleElement.style.borderRadius = '50%';
            this._circleElement.style.position = 'absolute';
            this._mapInterface.getLayerPaneElement('markerPane').appendChild(this._circleElement);
            this._updateCirclePosition();
            this.tuneIn('entityMoved', this._updateCirclePosition, this);
            this.setGeodeticLocation = AnnotatableFeatureMixin.setGeodeticLocation;
            this.configureVisualOpacity = AnnotatableFeatureMixin.configureVisualOpacity;
            this._refreshVisualOpacity = AnnotatableFeatureMixin._refreshVisualOpacity;
            this._adjustVisualDepth = AnnotatableFeatureMixin._adjustVisualDepth;
        }

        static defaultCircleSettings = {
            annotationAnchor: [0, 0],
            radius: 10,
            fillColor: 'blue'
        };

        getAnnotationAnchorPoint() {
            return GeoPixelConverter.createPixel(this._circleConfig.annotationAnchor[0], this._circleConfig.annotationAnchor[1]);
        }

        _updateCirclePosition() {
            const pixelPos = this._mapInterface.convertGeodeticToPixel(this._geodeticLocation);
            const adjustedPos = pixelPos.combine(GeoPixelConverter.createPixel(-this._circleConfig.radius, -this._circleConfig.radius));
            ElementModifier.applyPositionalTransform(this._circleElement, adjustedPos);
        }

        configureVisualOpacity(value, annotationSemiTransparent) {
            this._originalConfigureVisualOpacity.call(this, value, annotationSemiTransparent);
            this._circleElement.style.opacity = value;
        }

        _adjustVisualDepth(offsetAmount) {
            this._originalAdjustVisualDepth.call(this, offsetAmount);
            this._circleElement.style.zIndex = this._currentVisualDepth;
        }
    }
    Object.assign(CircularSpot.prototype, AnnotatableFeatureMixin);

    class VectorShape extends DisplayEntity {
        constructor(geodeticLocationsArray, mapContext, config = {}) {
            super(geodeticLocationsArray[0], mapContext);
            this._pathLocations = geodeticLocationsArray;
            this._shapeConfig = config;
            this._shapeElement = ElementModifier.constructElement('div', 'visual-vector-shape');
            this._shapeElement.style.border = '2px solid green';
            this._shapeElement.style.width = '50px';
            this._shapeElement.style.height = '50px';
            this._shapeElement.style.position = 'absolute';
            this._mapInterface.getLayerPaneElement('default').appendChild(this._shapeElement);
            this._updateShapeVisual();
        }

        _updateShapeVisual() {
            if (this._pathLocations.length > 0) {
                const firstPointPixel = this._mapInterface.convertGeodeticToPixel(this._pathLocations[0]);
                ElementModifier.applyPositionalTransform(this._shapeElement, firstPointPixel);
            }
        }

        attachAnnotation: function(content, configuration) {
            if (!this._associatedAnnotation || JSON.stringify(this._associatedAnnotation._settings) !== JSON.stringify(configuration)) {
                this._associatedAnnotation = new AnnotationPanel(configuration, this);
            }

            this._associatedAnnotation.setDisplayText(content);

            if (!this._hasPathAnnotationListeners) {
                this
                    .tuneIn('entityMouseOver', this._displayPathAnnotation, this)
                    .tuneIn('entityMouseMove', this._relocatePathAnnotation, this)
                    .tuneIn('entityMouseOut', this._hidePathAnnotation, this)
                    .tuneIn('entityRemoved', this._hidePathAnnotation, this);

                if (SystemCapabilities.isTouchDevice) {
                    this.tuneIn('entityClick', this._displayPathAnnotation, this);
                }
                this._hasPathAnnotationListeners = true;
            }

            return this;
        },

        _displayPathAnnotation: function() {
            if (this._associatedAnnotation && this._mapInterface) {
                this._associatedAnnotation.setPosition(this.getGeodeticLocation());
                this._mapInterface.addAnnotationElement(this._associatedAnnotation);
            }
        },
        _hidePathAnnotation: function() {
            if (this._associatedAnnotation) {
                this._associatedAnnotation.hideVisual();
            }
        },
        _relocatePathAnnotation: function(eventDetails) {
            if (eventDetails && eventDetails.geodeticLocation) {
                this._associatedAnnotation.setPosition(eventDetails.geodeticLocation);
            }
        }
    }
    Object.assign(VectorShape.prototype, {
        ...AnnotatableFeatureMixin,
        attachAnnotation: VectorShape.prototype.attachAnnotation,
        _displayPathAnnotation: VectorShape.prototype._displayPathAnnotation,
        _hidePathAnnotation: VectorShape.prototype._hidePathAnnotation,
        _relocatePathAnnotation: VectorShape.prototype._relocatePathAnnotation
    });

})(window, document);