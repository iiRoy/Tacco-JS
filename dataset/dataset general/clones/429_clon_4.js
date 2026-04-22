class SpatialPathInstrument {
    constructor(geospatialCanvas, stylePreferences) {
        this.geospatialCanvas = geospatialCanvas;
        this.stylePreferences = stylePreferences;

        this.isHandlerEnabled = false;
        this.isPathInProgress = false;
        this.currentVectorTrace = null;
        this.anchorPoints = [];
        this.anchorPointCollection = new L.LayerGroup();
        this.temporaryTip = null;

        this.pointerMoveObserver = this.handlePointerMovement.bind(this);
        this.canvasClickObserver = this.handleCanvasClick.bind(this);
        this.canvasDblClickObserver = this.handleCanvasDoubleClick.bind(this);
        this.keyPressObserver = this.handleKeyInput.bind(this);

        this.eventListeners = {
            'operationActivated': [],
            'operationDeactivated': []
        };
    }

    on(eventName, callback, context) {
        if (this.eventListeners[eventName]) {
            this.eventListeners[eventName].push({ callback, context });
        }
    }

    fire(eventName, data) {
        if (this.eventListeners[eventName]) {
            this.eventListeners[eventName].forEach(({ callback, context }) => {
                callback.call(context, data);
            });
        }
    }

    initiateOperation() {
        if (this.isHandlerEnabled) return;
        this.isHandlerEnabled = true;

        this.geospatialCanvas.addLayer(this.anchorPointCollection);

        this.geospatialCanvas.on('mousemove', this.pointerMoveObserver);
        this.geospatialCanvas.on('click', this.canvasClickObserver);
        this.geospatialCanvas.on('dblclick', this.canvasDblClickObserver);
        document.addEventListener('keydown', this.keyPressObserver);

        this.commencePath();
        this.fire('operationActivated');
    }

    terminateOperation() {
        if (!this.isHandlerEnabled) return;
        this.isHandlerEnabled = false;

        this.geospatialCanvas.off('mousemove', this.pointerMoveObserver);
        this.geospatialCanvas.off('click', this.canvasClickObserver);
        this.geospatialCanvas.off('dblclick', this.canvasDblClickObserver);
        document.removeEventListener('keydown', this.keyPressObserver);

        this.concludePath();
        this.purgePathElements();
        this.geospatialCanvas.removeLayer(this.anchorPointCollection);
        this.fire('operationDeactivated');
    }

    commencePath() {
        this.isPathInProgress = true;
        this.purgePathElements();
        this.currentVectorTrace = new L.Polyline([], this.stylePreferences.shapeOptions);
        this.geospatialCanvas.addLayer(this.currentVectorTrace);
        this.geospatialCanvas._container.style.cursor = 'crosshair';
        this.setupInstructionalOverlay();
        this.updateInstructionalOverlay();
    }

    concludePath() {
        this.isPathInProgress = false;
        this.geospatialCanvas._container.style.cursor = '';

        if (this.currentVectorTrace && this.currentVectorTrace.getLatLngs().length > this.anchorPoints.length) {
            this.currentVectorTrace.setLatLngs(this.anchorPoints);
        }
        this.updateInstructionalOverlay();
    }

    purgePathElements() {
        if (this.currentVectorTrace) {
            this.geospatialCanvas.removeLayer(this.currentVectorTrace);
            this.currentVectorTrace = null;
        }
        this.anchorPointCollection.clearLayers();
        this.anchorPoints = [];
        this.removeInstructionalOverlay();
    }

    handleCanvasClick(event) {
        if (!this.isHandlerEnabled) return;

        if (!this.isPathInProgress) {
            this.commencePath();
        }

        const newPoint = event.latlng;
        this.anchorPoints.push(newPoint);
        this.currentVectorTrace.addLatLng(newPoint);

        const pointMarker = L.circleMarker(newPoint, this.stylePreferences.markerOptions || {
            radius: 5,
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
            color: '#000',
            fillColor: '#fff'
        });
        this.anchorPointCollection.addLayer(pointMarker);

        this.updateInstructionalOverlay(newPoint);
    }

    handlePointerMovement(event) {
        if (!this.isHandlerEnabled || !this.isPathInProgress || !this.currentVectorTrace) {
            return;
        }

        const mousePosition = event.latlng;
        const currentPoints = this.currentVectorTrace.getLatLngs();

        if (this.anchorPoints.length === 0) {
            this.updateInstructionalOverlay(mousePosition);
            return;
        }

        if (currentPoints.length > this.anchorPoints.length) {
            currentPoints[currentPoints.length - 1] = mousePosition;
            this.currentVectorTrace.setLatLngs(currentPoints);
        } else {
            this.currentVectorTrace.addLatLng(mousePosition);
        }
        this.updateInstructionalOverlay(mousePosition);
    }

    handleCanvasDoubleClick(event) {
        if (!this.isHandlerEnabled || !this.isPathInProgress) {
            return;
        }
        this.concludePath();
    }

    handleKeyInput(event) {
        if (!this.isHandlerEnabled) return;
        if (event.key === 'Escape') {
            if (this.isPathInProgress) {
                this.purgePathElements();
                this.concludePath();
            }
        }
    }

    setupInstructionalOverlay() {
        if (!this.temporaryTip) {
            this.temporaryTip = L.DomUtil.create('div', 'leaflet-draw-tooltip');
            document.body.appendChild(this.temporaryTip);
            this.temporaryTip.style.position = 'absolute';
            this.temporaryTip.style.pointerEvents = 'none';
            this.temporaryTip.style.zIndex = '1000';
            this.temporaryTip.style.backgroundColor = 'white';
            this.temporaryTip.style.padding = '5px';
            this.temporaryTip.style.border = '1px solid gray';
            this.temporaryTip.style.borderRadius = '3px';
            this.temporaryTip.style.display = 'none';
        }
    }

    updateInstructionalOverlay(currentMouseLatLng) {
        if (!this.temporaryTip) return;

        let content = '';
        if (!this.isHandlerEnabled) {
            content = '';
            this.temporaryTip.style.display = 'none';
        } else if (!this.isPathInProgress) {
            content = 'Click to initiate a new measurement.';
            this.temporaryTip.style.display = 'block';
        } else if (this.anchorPoints.length === 0) {
            content = 'Click to set the initial point.';
            this.temporaryTip.style.display = 'block';
        } else {
            let totalDistance = 0;
            const allPoints = this.currentVectorTrace.getLatLngs();
            if (allPoints.length > 1) {
                for (let i = 0; i < allPoints.length - 1; i++) {
                    totalDistance += allPoints[i].distanceTo(allPoints[i + 1]);
                }
            }
            content = `Total: ${this.formatDistance(totalDistance)}`;
            if (this.anchorPoints.length > 0 && currentMouseLatLng && currentMouseLatLng !== allPoints[allPoints.length - 1]) {
                 const lastAnchor = this.anchorPoints[this.anchorPoints.length - 1];
                 const segmentDistance = lastAnchor.distanceTo(currentMouseLatLng);
                 content += `<br>Segment: ${this.formatDistance(segmentDistance)}`;
            }
            content += '<br>Click to continue, double-click to finalize.';
            this.temporaryTip.style.display = 'block';
        }

        this.temporaryTip.innerHTML = content;

        if (currentMouseLatLng && this.isHandlerEnabled && this.isPathInProgress) {
            const pixelPoint = this.geospatialCanvas.latLngToContainerPoint(currentMouseLatLng);
            this.temporaryTip.style.left = (pixelPoint.x + 10) + 'px';
            this.temporaryTip.style.top = (pixelPoint.y + 10) + 'px';
        } else if (!this.isPathInProgress && this.isHandlerEnabled) {
            const centerPoint = this.geospatialCanvas.getCenter();
            const pixelPoint = this.geospatialCanvas.latLngToContainerPoint(centerPoint);
            this.temporaryTip.style.left = (pixelPoint.x - this.temporaryTip.offsetWidth / 2) + 'px';
            this.temporaryTip.style.top = (pixelPoint.y - this.temporaryTip.offsetHeight - 20) + 'px';
        } else {
            this.temporaryTip.style.display = 'none';
        }
    }

    removeInstructionalOverlay() {
        if (this.temporaryTip) {
            this.temporaryTip.style.display = 'none';
        }
    }

    formatDistance(meters) {
        if (meters > 1000) {
            return (meters / 1000).toFixed(2) + ' km';
        }
        return meters.toFixed(2) + ' m';
    }
}

const LinearDistanceGaugeFactory = function(controlOptions) {
    const defaultOptions = {
        position: 'topleft',
        drawingPreferences: {}
    };
    const mergedOptions = { ...defaultOptions, ...controlOptions };

    let geospatialCanvasReference = null;
    let mainControlPanel = null;
    let controlActionLink = null;
    let pathInteractionAgent = null;

    const controlTitle = 'Measure spatial distances';

    const switchOperationalMode = function() {
        if (pathInteractionAgent.isHandlerEnabled) {
            pathInteractionAgent.terminateOperation();
        } else {
            pathInteractionAgent.initiateOperation();
        }
    };

    const controlObject = {
        options: mergedOptions,
        _boundHandleControlClick: null,

        onAdd: function(mapInstance) {
            geospatialCanvasReference = mapInstance;

            mainControlPanel = document.createElement('div');
            mainControlPanel.className = 'leaflet-bar';

            controlActionLink = document.createElement('a');
            controlActionLink.className = 'leaflet-control-draw-measure-alt';
            controlActionLink.href = '#';
            controlActionLink.title = controlTitle;
            controlActionLink.innerHTML = '<span style="font-size:1.2em;">📏</span>';

            mainControlPanel.appendChild(controlActionLink);

            pathInteractionAgent = new SpatialPathInstrument(geospatialCanvasReference, mergedOptions.drawingPreferences);

            pathInteractionAgent.on('operationActivated', function() {
                mainControlPanel.classList.add('active-drawing-mode');
            }, this);

            pathInteractionAgent.on('operationDeactivated', function() {
                mainControlPanel.classList.remove('active-drawing-mode');
            }, this);

            this._boundHandleControlClick = (evt) => {
                evt.stopPropagation();
                evt.preventDefault();
                switchOperationalMode();
            };
            controlActionLink.addEventListener('click', this._boundHandleControlClick);

            return mainControlPanel;
        },

        onRemove: function(mapInstance) {
            if (pathInteractionAgent) {
                pathInteractionAgent.terminateOperation();
            }
            if (controlActionLink && this._boundHandleControlClick) {
                controlActionLink.removeEventListener('click', this._boundHandleControlClick);
            }
            geospatialCanvasReference = null;
        },

        switchMode: switchOperationalMode
    };

    return controlObject;
};

(function() {
    const originalAddInitHook = L.Map.addInitHook;

    L.Map.addInitHook = function() {
        if (this.options.enableDistanceMeasurement) {
            this.distanceMeasurementTool = L.Control.createDistanceGauge().addTo(this);
        }
        if (originalAddInitHook) { // Ensure original hook exists before calling
            originalAddInitHook.apply(this, arguments);
        }
    };

    if (L.Map.prototype.options) {
        L.Map.prototype.options.enableDistanceMeasurement = false;
    } else {
        L.Map.prototype.options = {
            enableDistanceMeasurement: false
        };
    }
})();

L.Control.createDistanceGauge = function(configuration) {
    return LinearDistanceGaugeFactory(configuration);
};