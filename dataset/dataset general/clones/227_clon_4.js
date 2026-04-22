(function (L) {
    const createMapOverview = (initialLayer, customConfig) => {

        const defaultSettings = {
            placement: 'bottomright',
            canToggleVisibility: false,
            zoomDelta: -5,
            fixedZoomLevel: false,
            animateZoom: false,
            autoHide: false,
            panelWidth: 150,
            panelHeight: 150,
            minimizedWidth: 19,
            minimizedHeight: 19,
            targetAreaStyling: { color: "#ff7800", weight: 1, clickable: false },
            dragGhostStyling: { color: "#000000", weight: 1, clickable: false, opacity: 0, fillOpacity: 0 }
        };

        const config = { ...defaultSettings, ...customConfig };

        config.targetAreaStyling.clickable = false;
        config.dragGhostStyling.clickable = false;

        let primaryMapInstance;
        let secondaryMapView;
        let displayLayer = initialLayer;
        let controlPanel;
        let viewFinderRect;
        let dragGhostRect;
        let isPrimaryMoving = false;
        let isSecondaryMoving = false;
        let userOverrodeVisibility = false;
        let isCurrentlyHidden = false;
        let visibilityToggleButton;
        let lastViewFinderPosition;
        let previousSecondaryZoom = null;

        const hideCaption = 'Conceal Overview';
        const showCaption = 'Reveal Overview';

        const generateControlLink = (markup, titleText, cssClass, parentElement, actionHandler) => {
            const linkElement = document.createElement('a');
            linkElement.className = cssClass;
            linkElement.innerHTML = markup;
            linkElement.href = '#';
            linkElement.title = titleText;
            parentElement.appendChild(linkElement);

            const preventPropagation = (e) => {
                L.DomEvent.stopPropagation(e);
            };

            L.DomEvent
                .on(linkElement, 'click', preventPropagation)
                .on(linkElement, 'mousedown', preventPropagation)
                .on(linkElement, 'dblclick', preventPropagation)
                .on(linkElement, 'click', L.DomEvent.preventDefault)
                .on(linkElement, 'click', actionHandler);

            return linkElement;
        };

        const setupVisibilityToggle = () => {
            if (config.canToggleVisibility) {
                visibilityToggleButton = generateControlLink(
                    '',
                    hideCaption,
                    `leaflet-control-overview-toggle-display leaflet-control-overview-toggle-display-${config.placement}`,
                    controlPanel,
                    onToggleClicked
                );
                visibilityToggleButton.style.width = config.minimizedWidth + 'px';
                visibilityToggleButton.style.height = config.minimizedHeight + 'px';
            }
        };

        const concealPanel = () => {
            if (config.canToggleVisibility) {
                controlPanel.style.width = config.minimizedWidth + 'px';
                controlPanel.style.height = config.minimizedHeight + 'px';
                if (visibilityToggleButton) {
                    visibilityToggleButton.className += ` minimized-${config.placement}`;
                }
            } else {
                controlPanel.style.display = 'none';
            }
            isCurrentlyHidden = true;
        };

        const revealPanel = () => {
            if (config.canToggleVisibility) {
                controlPanel.style.width = config.panelWidth + 'px';
                controlPanel.style.height = config.panelHeight + 'px';
                if (visibilityToggleButton) {
                    visibilityToggleButton.className = visibilityToggleButton.className
                        .replace(`minimized-${config.placement}`, '');
                }
            } else {
                controlPanel.style.display = 'block';
            }
            isCurrentlyHidden = false;
        };

        const adjustVisibility = (shouldBeHidden) => {
            if (shouldBeHidden !== isCurrentlyHidden) {
                if (!isCurrentlyHidden) {
                    concealPanel();
                } else {
                    revealPanel();
                }
            }
        };

        const shouldPanelBeHidden = () => {
            if (userOverrodeVisibility) {
                return isCurrentlyHidden;
            }
            if (config.autoHide) {
                return primaryMapInstance.getBounds().contains(secondaryMapView.getBounds());
            }
            return isCurrentlyHidden;
        };

        const determineZoomLevel = (sourceIsPrimary) => {
            if (config.fixedZoomLevel !== false) {
                return sourceIsPrimary ? config.fixedZoomLevel : primaryMapInstance.getZoom();
            } else {
                if (sourceIsPrimary) {
                    return primaryMapInstance.getZoom() + config.zoomDelta;
                } else {
                    const currentZoomDifference = secondaryMapView.getZoom() - primaryMapInstance.getZoom();
                    const candidateZoom = secondaryMapView.getZoom() - config.zoomDelta;
                    let finalZoom;

                    if (currentZoomDifference > config.zoomDelta && primaryMapInstance.getZoom() < secondaryMapView.getMinZoom() - config.zoomDelta) {
                        if (secondaryMapView.getZoom() > previousSecondaryZoom) {
                            finalZoom = primaryMapInstance.getZoom() + 1;
                            secondaryMapView.setZoom(secondaryMapView.getZoom() - 1);
                        } else {
                            finalZoom = primaryMapInstance.getZoom();
                        }
                    } else {
                        finalZoom = candidateZoom;
                    }
                    previousSecondaryZoom = secondaryMapView.getZoom();
                    return finalZoom;
                }
            }
        };

        const onToggleClicked = () => {
            userOverrodeVisibility = true;
            if (!isCurrentlyHidden) {
                concealPanel();
                if (visibilityToggleButton) visibilityToggleButton.title = showCaption;
            } else {
                revealPanel();
                if (visibilityToggleButton) visibilityToggleButton.title = hideCaption;
            }
        };

        const handlePrimaryMapMoveEnd = () => {
            if (!isSecondaryMoving) {
                isPrimaryMoving = true;
                secondaryMapView.setView(primaryMapInstance.getCenter(), determineZoomLevel(true));
                adjustVisibility(shouldPanelBeHidden());
            } else {
                isSecondaryMoving = false;
            }
            viewFinderRect.setBounds(primaryMapInstance.getBounds());
        };

        const handlePrimaryMapMovement = () => {
            viewFinderRect.setBounds(primaryMapInstance.getBounds());
        };

        const handleSecondaryMapDragStart = () => {
            const currentFinderBounds = viewFinderRect.getBounds();
            const swPoint = secondaryMapView.latLngToContainerPoint(currentFinderBounds.getSouthWest());
            const nePoint = secondaryMapView.latLngToContainerPoint(currentFinderBounds.getNorthEast());
            lastViewFinderPosition = { sw: swPoint, ne: nePoint };
        };

        const handleSecondaryMapDragging = () => {
            if (!isPrimaryMoving && lastViewFinderPosition) {
                const newBounds = new L.LatLngBounds(
                    secondaryMapView.containerPointToLatLng(lastViewFinderPosition.sw),
                    secondaryMapView.containerPointToLatLng(lastViewFinderPosition.ne)
                );
                dragGhostRect.setBounds(newBounds);
                dragGhostRect.setStyle({ opacity: 1, fillOpacity: 0.3 });
            }
        };

        const handleSecondaryMapDragEnd = () => {
            if (!isPrimaryMoving) {
                isSecondaryMoving = true;
                primaryMapInstance.setView(secondaryMapView.getCenter(), determineZoomLevel(false));
                dragGhostRect.setStyle({ opacity: 0, fillOpacity: 0 });
            } else {
                isPrimaryMoving = false;
            }
        };

        const overviewControl = {
            options: config,

            addTo: function (targetMap) {
                targetMap.addControl(this);
                return this;
            },

            onAdd: function (attachedMap) {
                primaryMapInstance = attachedMap;

                controlPanel = document.createElement('div');
                controlPanel.className = 'leaflet-control-minimap';
                controlPanel.style.width = config.panelWidth + 'px';
                controlPanel.style.height = config.panelHeight + 'px';
                L.DomEvent.disableClickPropagation(controlPanel);
                L.DomEvent.on(controlPanel, 'mousewheel', L.DomEvent.stopPropagation);

                secondaryMapView = new L.Map(controlPanel, {
                    attributionControl: false,
                    zoomControl: false,
                    zoomAnimation: config.animateZoom,
                    autoToggleDisplay: config.autoHide,
                    touchZoom: !config.fixedZoomLevel,
                    scrollWheelZoom: !config.fixedZoomLevel,
                    doubleClickZoom: !config.fixedZoomLevel,
                    boxZoom: !config.fixedZoomLevel,
                    crs: attachedMap.options.crs
                });

                if (displayLayer) {
                    secondaryMapView.addLayer(displayLayer);
                }

                setupVisibilityToggle();

                secondaryMapView.whenReady(() => {
                    viewFinderRect = L.rectangle(primaryMapInstance.getBounds(), config.targetAreaStyling).addTo(secondaryMapView);
                    dragGhostRect = L.rectangle(primaryMapInstance.getBounds(), config.dragGhostStyling).addTo(secondaryMapView);

                    primaryMapInstance.on('moveend', handlePrimaryMapMoveEnd);
                    primaryMapInstance.on('move', handlePrimaryMapMovement);
                    secondaryMapView.on('movestart', handleSecondaryMapDragStart);
                    secondaryMapView.on('move', handleSecondaryMapDragging);
                    secondaryMapView.on('moveend', handleSecondaryMapDragEnd);

                    secondaryMapView.setView(primaryMapInstance.getCenter(), determineZoomLevel(true));
                    adjustVisibility(shouldPanelBeHidden());
                });

                return controlPanel;
            },

            onRemove: function () {
                primaryMapInstance.off('moveend', handlePrimaryMapMoveEnd);
                primaryMapInstance.off('move', handlePrimaryMapMovement);
                secondaryMapView.off('movestart', handleSecondaryMapDragStart);
                secondaryMapView.off('move', handleSecondaryMapDragging);
                secondaryMapView.off('moveend', handleSecondaryMapDragEnd);

                if (displayLayer) {
                    secondaryMapView.removeLayer(displayLayer);
                }
                secondaryMapView.remove();
            },

            swapDisplayLayer: function (newLayer) {
                if (secondaryMapView && displayLayer) {
                    secondaryMapView.removeLayer(displayLayer);
                }
                displayLayer = newLayer;
                if (secondaryMapView && displayLayer) {
                    secondaryMapView.addLayer(displayLayer);
                }
            }
        };

        return overviewControl;
    };

    L.Map.mergeOptions({
        overviewPanel: false
    });

    L.Map.addInitHook(function () {
        if (this.options.overviewPanel) {
            this.overviewPanelInstance = createMapOverview().addTo(this);
        }
    });

    L.control.mapoverview = function (layer, options) {
        return createMapOverview(layer, options);
    };

})(L);