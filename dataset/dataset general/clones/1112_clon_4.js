class ViewportOverviewManager {
    constructor(sourceLayer, settings = {}) {
        const defaultConfiguration = {
            placement: 'bottomright',
            allowToggle: false,
            zoomDelta: -5,
            lockZoom: false,
            animateView: false,
            autoCollapse: false,
            panelWidth: 150,
            panelHeight: 150,
            viewerRectStyle: { color: "#ff0000", weight: 1, clickable: false, opacity: 1, fillOpacity: 0.5 },
            ghostRectStyle: { color: "#000000", weight: 1, clickable: false, opacity: 0, fillOpacity: 0 }
        };

        this.configuration = { ...defaultConfiguration, ...settings };

        this.configuration.viewerRectStyle.clickable = false;
        this.configuration.ghostRectStyle.clickable = false;

        this.labelSet = {
            hideLabel: 'Hide Overview Panel',
            showLabel: 'Show Overview Panel'
        };

        this.baseLayer = sourceLayer;

        this.hostMap = null;
        this.overviewMap = null;
        this.panelElement = null;

        this.viewerBoundsIndicator = null;
        this.ghostBoundsIndicator = null;

        this.hostMapIsMoving = false;
        this.overviewMapIsMoving = false;

        this.userForcedVisibility = false;
        this.isCollapsed = false;

        this.previousOverviewZoom = null;
        this.toggleButton = null;
        this.lastViewerRectPosition = null;

        this.onHostMapMovedEnd_bound = this.onHostMapMovedEnd.bind(this);
        this.onHostMapMoving_bound = this.onHostMapMoving.bind(this);
        this.onOverviewMapMoveStart_bound = this.onOverviewMapMoveStart.bind(this);
        this.onOverviewMapMoving_bound = this.onOverviewMapMoving.bind(this);
        this.onOverviewMapMovedEnd_bound = this.onOverviewMapMovedEnd.bind(this);
        this.onOverviewMapClick_bound = this.onOverviewMapClick.bind(this);
        this.onToggleButtonClick_bound = this.onToggleButtonClick.bind(this);
        this.preventDomEventPropagation_bound = this.preventDomEventPropagation.bind(this);
        this.preventDefaultAction_bound = this.preventDefaultAction.bind(this);
    }

    createElement(tag, className, parent) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (parent) parent.appendChild(el);
        return el;
    }

    preventDomEventPropagation(e) {
        e.stopPropagation();
    }

    preventDefaultAction(e) {
        e.preventDefault();
    }

    determineZoomLevel(fromHostToOverview) {
        if (!this.configuration.lockZoom) {
            if (fromHostToOverview) {
                return this.hostMap.getZoom() + this.configuration.zoomDelta;
            } else {
                const currentDifference = this.overviewMap.getZoom() - this.hostMap.getZoom();
                const proposedZoomLevel = this.overviewMap.getZoom() - this.configuration.zoomDelta;
                let resultantZoom;

                if (currentDifference > this.configuration.zoomDelta && this.hostMap.getZoom() < this.overviewMap.getMinZoom() - this.configuration.zoomDelta) {
                    if (this.overviewMap.getZoom() > this.previousOverviewZoom) {
                        resultantZoom = this.hostMap.getZoom() + 1;
                        this.overviewMap.setZoom(this.overviewMap.getZoom() - 1);
                    } else {
                        resultantZoom = this.hostMap.getZoom();
                    }
                } else {
                    resultantZoom = proposedZoomLevel;
                }
                this.previousOverviewZoom = this.overviewMap.getZoom();
                return resultantZoom;
            }
        } else {
            return fromHostToOverview ? this.configuration.lockZoom : this.hostMap.getZoom();
        }
    }

    createInteractiveButton(markup, titleText, cssClass, parentContainer, clickHandler) {
        const anchorElement = this.createElement('a', cssClass, parentContainer);
        anchorElement.innerHTML = markup;
        anchorElement.href = '#';
        anchorElement.title = titleText;

        anchorElement.addEventListener('click', this.preventDomEventPropagation_bound);
        anchorElement.addEventListener('mousedown', this.preventDomEventPropagation_bound);
        anchorElement.addEventListener('dblclick', this.preventDomEventPropagation_bound);
        anchorElement.addEventListener('click', this.preventDefaultAction_bound);
        anchorElement.addEventListener('click', clickHandler);

        return anchorElement;
    }

    collapsePanel() {
        if (this.configuration.allowToggle) {
            this.panelElement.style.width = '19px';
            this.panelElement.style.height = '19px';
            this.toggleButton.classList.add('minimized');
        } else {
            this.panelElement.style.display = 'none';
        }
        this.isCollapsed = true;
    }

    expandPanel() {
        if (this.configuration.allowToggle) {
            this.panelElement.style.width = this.configuration.panelWidth + 'px';
            this.panelElement.style.height = this.configuration.panelHeight + 'px';
            this.toggleButton.classList.remove('minimized');
        } else {
            this.panelElement.style.display = 'block';
        }
        this.isCollapsed = false;
    }

    updatePanelVisibility(shouldCollapse) {
        if (shouldCollapse !== this.isCollapsed) {
            if (!this.isCollapsed) {
                this.collapsePanel();
            } else {
                this.expandPanel();
            }
        }
    }

    onToggleButtonClick() {
        this.userForcedVisibility = true;
        if (!this.isCollapsed) {
            this.collapsePanel();
            this.toggleButton.title = this.labelSet.showLabel;
        } else {
            this.expandPanel();
            this.toggleButton.title = this.labelSet.hideLabel;
        }
    }

    shouldPanelBeCollapsed() {
        if (this.userForcedVisibility) {
            return this.isCollapsed;
        }
        if (this.configuration.autoCollapse) {
            if (this.hostMap && this.overviewMap) {
                return this.hostMap.getBounds().contains(this.overviewMap.getBounds());
            }
            return false;
        }
        return false;
    }

    onHostMapMovedEnd() {
        if (!this.overviewMapIsMoving) {
            this.hostMapIsMoving = true;
            this.overviewMap.setView(this.hostMap.getCenter(), this.determineZoomLevel(true));
            this.updatePanelVisibility(this.shouldPanelBeCollapsed());
        } else {
            this.overviewMapIsMoving = false;
        }
        this.viewerBoundsIndicator.setBounds(this.hostMap.getBounds());
    }

    onHostMapMoving() {
        this.viewerBoundsIndicator.setBounds(this.hostMap.getBounds());
    }

    onOverviewMapMoveStart() {
        const currentViewerBounds = this.viewerBoundsIndicator.getBounds();
        const southWest = this.overviewMap.latLngToContainerPoint(currentViewerBounds.getSouthWest());
        const northEast = this.overviewMap.latLngToContainerPoint(currentViewerBounds.getNorthEast());
        this.lastViewerRectPosition = { sw: southWest, ne: northEast };
    }

    onOverviewMapMoving() {
        if (!this.hostMapIsMoving && this.lastViewerRectPosition) {
            this.ghostBoundsIndicator.setBounds(new L.LatLngBounds(
                this.overviewMap.containerPointToLatLng(this.lastViewerRectPosition.sw),
                this.overviewMap.containerPointToLatLng(this.lastViewerRectPosition.ne)
            ));
            this.ghostBoundsIndicator.setStyle({ opacity: 1, fillOpacity: 0.3 });
        }
    }

    onOverviewMapMovedEnd() {
        if (!this.hostMapIsMoving) {
            this.overviewMapIsMoving = true;
            this.hostMap.setView(this.overviewMap.getCenter(), this.determineZoomLevel(false));
            this.ghostBoundsIndicator.setStyle({ opacity: 0, fillOpacity: 0 });
        } else {
            this.hostMapIsMoving = false;
        }
    }

    onOverviewMapClick(e) {
        this.hostMap.setView(e.latlng);
    }

    initializePanel(mapInstance) {
        this.hostMap = mapInstance;

        this.panelElement = this.createElement('div', 'leaflet-control-minimap');
        this.panelElement.style.width = this.configuration.panelWidth + 'px';
        this.panelElement.style.height = this.configuration.panelHeight + 'px';
        this.panelElement.addEventListener('mousewheel', this.preventDomEventPropagation_bound);

        this.overviewMap = new L.Map(this.panelElement, {
            attributionControl: false,
            zoomControl: false,
            zoomAnimation: this.configuration.animateView,
            touchZoom: !this.configuration.lockZoom,
            scrollWheelZoom: !this.configuration.lockZoom,
            doubleClickZoom: !this.configuration.lockZoom,
            boxZoom: !this.configuration.lockZoom,
            crs: mapInstance.options.crs
        });

        this.overviewMap.addLayer(this.baseLayer);

        if (this.configuration.allowToggle) {
            this.toggleButton = this.createInteractiveButton(
                '', this.labelSet.hideLabel, 'leaflet-control-minimap-toggle-display', this.panelElement, this.onToggleButtonClick_bound
            );
        }

        this.overviewMap.whenReady(() => {
            this.viewerBoundsIndicator = L.rectangle(this.hostMap.getBounds(), this.configuration.viewerRectStyle).addTo(this.overviewMap);
            this.ghostBoundsIndicator = L.rectangle(this.hostMap.getBounds(), this.configuration.ghostRectStyle).addTo(this.overviewMap);

            this.hostMap.on('moveend', this.onHostMapMovedEnd_bound);
            this.hostMap.on('move', this.onHostMapMoving_bound);
            this.overviewMap.on('movestart', this.onOverviewMapMoveStart_bound);
            this.overviewMap.on('move', this.onOverviewMapMoving_bound);
            this.overviewMap.on('moveend', this.onOverviewMapMovedEnd_bound);
            this.overviewMap.on('click', this.onOverviewMapClick_bound);
            this.overviewMap.on('touchend', this.onOverviewMapClick_bound);

            L.DomEvent.disableClickPropagation(this.panelElement);
        });

        this.overviewMap.setView(this.hostMap.getCenter(), this.determineZoomLevel(true));
        this.updatePanelVisibility(this.shouldPanelBeCollapsed());

        return this.panelElement;
    }

    disposePanel() {
        if (!this.hostMap || !this.overviewMap) return;

        this.hostMap.off('moveend', this.onHostMapMovedEnd_bound);
        this.hostMap.off('move', this.onHostMapMoving_bound);
        this.overviewMap.off('moveend', this.onOverviewMapMovedEnd_bound);
        this.overviewMap.off('click', this.onOverviewMapClick_bound);
        this.overviewMap.off('touchend', this.onOverviewMapClick_bound);

        this.overviewMap.removeLayer(this.baseLayer);
        this.overviewMap.remove();
        if (this.panelElement && this.panelElement.parentNode) {
            this.panelElement.parentNode.removeChild(this.panelElement);
        }

        this.hostMap = null;
        this.overviewMap = null;
        this.panelElement = null;
        this.viewerBoundsIndicator = null;
        this.ghostBoundsIndicator = null;
        this.toggleButton = null;
    }

    postAttachActions(mapInstance) {
        if (this.overviewMap && this.hostMap) {
             this.overviewMap.setView(this.hostMap.getCenter(), this.determineZoomLevel(true));
             this.updatePanelVisibility(this.shouldPanelBeCollapsed());
        }
    }
}

L.Control.MapOverview = L.Control.extend({
    options: {
        position: 'bottomright'
    },

    _overviewManager: null,

    initControl: function (displayLayer, managerSettings) {
        L.Util.setOptions(this, managerSettings);
        this._overviewManager = new ViewportOverviewManager(displayLayer, managerSettings);
        return this;
    },

    onControlAdded: function (map) {
        const controlContainer = this._overviewManager.initializePanel(map);
        this._overviewManager.postAttachActions(map);
        return controlContainer;
    },

    onControlRemoved: function (map) {
        this._overviewManager.disposePanel();
        this._overviewManager = null;
    }
});

L.control.mapOverview = function (displayLayer, options) {
    return new L.Control.MapOverview().initControl(displayLayer, options);
};