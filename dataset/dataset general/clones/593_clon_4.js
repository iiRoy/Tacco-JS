(function (global) {
  const defaultSettings = {
    panelCollapsed: true,
    displayPosition: 'topright',
    autoLayerZIndex: true
  };

  const createLayerManager = function (initialBaseLayers, initialGroupedOverlays, customSettings) {
    const currentSettings = { ...defaultSettings, ...customSettings };

    let leafletMapInstance = null;
    let uiContainerElement = null;
    let controlFormElement = null;
    let baseLayerOutputArea = null;
    let overlayOutputArea = null;
    let contentSeparatorElement = null;
    let toggleLinkElement = null;

    const registeredLayers = new Map();
    const groupElementCache = new Map();
    const knownGroups = new Map();
    let nextGroupId = 0;
    let nextZIndex = 0;
    let inputProcessingFlag = false;

    const makeElement = (tag, className, parent) => {
      const el = document.createElement(tag);
      if (className) {
        el.className = className;
      }
      if (parent) {
        parent.append(el);
      }
      return el;
    };

    const stopEventPropagation = (evt) => {
      evt.stopPropagation();
    };

    const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    const addManagedLayer = (layerObject, layerName, groupIdentifier, isOverlayType) => {
      if (!layerObject || !layerName) return;

      const layerData = {
        name: layerName,
        isOverlay: !!isOverlayType
      };

      if (groupIdentifier && isOverlayType) {
        let currentGroupId = knownGroups.get(groupIdentifier);
        if (currentGroupId === undefined) {
          currentGroupId = nextGroupId++;
          knownGroups.set(groupIdentifier, currentGroupId);
        }
        layerData.group = {
          name: groupIdentifier,
          id: currentGroupId
        };
      }

      registeredLayers.set(layerObject, layerData);

      if (currentSettings.autoLayerZIndex && layerObject.setZIndex) {
        nextZIndex++;
        layerObject.setZIndex(nextZIndex);
      }
    };

    const removeManagedLayer = (layerObject) => {
      registeredLayers.delete(layerObject);
    };

    const setupControlPanel = () => {
      const baseClassName = 'leaflet-control-layers';
      uiContainerElement = makeElement('div', baseClassName);
      uiContainerElement.setAttribute('aria-haspopup', 'true');

      if (!isTouchDevice()) {
        ['mousedown', 'touchstart', 'dblclick', 'mousewheel', 'contextmenu', 'click'].forEach(evtType => uiContainerElement.addEventListener(evtType, stopEventPropagation));
        uiContainerElement.addEventListener('wheel', stopEventPropagation);
      } else {
        uiContainerElement.addEventListener('click', stopEventPropagation);
      }

      controlFormElement = makeElement('form', `${baseClassName}-list`, uiContainerElement);

      if (currentSettings.panelCollapsed) {
        if (!isTouchDevice()) {
          uiContainerElement.addEventListener('mouseover', expandPanel);
          uiContainerElement.addEventListener('mouseout', collapsePanel);
        }

        toggleLinkElement = makeElement('a', `${baseClassName}-toggle`, uiContainerElement);
        toggleLinkElement.href = '#';
        toggleLinkElement.title = 'Map Layers';

        if (isTouchDevice()) {
          toggleLinkElement.addEventListener('click', (evt) => {
            evt.preventDefault();
            stopEventPropagation(evt);
            expandPanel();
          });
        } else {
          toggleLinkElement.addEventListener('focus', expandPanel);
        }

        if (leafletMapInstance) {
          leafletMapInstance.on('click', collapsePanel);
        }
      } else {
        expandPanel();
      }

      baseLayerOutputArea = makeElement('div', `${baseClassName}-base`, controlFormElement);
      contentSeparatorElement = makeElement('div', `${baseClassName}-separator`, controlFormElement);
      overlayOutputArea = makeElement('div', `${baseClassName}-overlays`, controlFormElement);
    };

    const updateLayerDisplay = () => {
      if (!uiContainerElement) {
        return;
      }

      baseLayerOutputArea.innerHTML = '';
      overlayOutputArea.innerHTML = '';
      groupElementCache.clear();

      let hasBaseLayers = false;
      let hasOverlays = false;

      registeredLayers.forEach((layerData, layerObject) => {
        renderLayerControlItem(layerObject, layerData);
        if (layerData.isOverlay) {
          hasOverlays = true;
        } else {
          hasBaseLayers = true;
        }
      });

      contentSeparatorElement.style.display = (hasOverlays && hasBaseLayers) ? '' : 'none';
    };

    const layerInputMap = new WeakMap();

    const renderLayerControlItem = (currentLayer, layerDetails) => {
      const itemLabel = makeElement('label');
      let itemInput;
      const isLayerActive = leafletMapInstance && leafletMapInstance.hasLayer(currentLayer);

      if (layerDetails.isOverlay) {
        itemInput = makeElement('input');
        itemInput.type = 'checkbox';
        itemInput.className = 'leaflet-control-layers-selector';
        itemInput.checked = isLayerActive;
      } else {
        itemInput = makeElement('input');
        itemInput.type = 'radio';
        itemInput.className = 'leaflet-control-layers-selector';
        itemInput.name = 'map-base-selection';
        itemInput.checked = isLayerActive;
      }

      layerInputMap.set(itemInput, currentLayer);

      itemInput.addEventListener('change', handleControlInputInteraction);

      const itemNameSpan = makeElement('span');
      itemNameSpan.textContent = ` ${layerDetails.name}`;

      itemLabel.append(itemInput, itemNameSpan);

      let targetContainer = baseLayerOutputArea;
      if (layerDetails.isOverlay) {
        targetContainer = overlayOutputArea;
        if (layerDetails.group) {
          let groupDiv = groupElementCache.get(layerDetails.group.name);
          if (!groupDiv) {
            groupDiv = makeElement('div', 'leaflet-control-layers-group');
            groupDiv.id = `map-layer-group-${layerDetails.group.id}`;

            const groupTitle = makeElement('span', 'leaflet-control-layers-group-name');
            groupTitle.textContent = layerDetails.group.name;
            groupDiv.append(groupTitle);
            overlayOutputArea.append(groupDiv);
            groupElementCache.set(layerDetails.group.name, groupDiv);
          }
          targetContainer = groupDiv;
        }
      }
      targetContainer.append(itemLabel);
    };

    const handleControlInputInteraction = () => {
      if (!leafletMapInstance || inputProcessingFlag) return;

      inputProcessingFlag = true;

      Array.from(controlFormElement.querySelectorAll('.leaflet-control-layers-selector')).forEach(inputElement => {
        const associatedLayer = layerInputMap.get(inputElement);
        if (!associatedLayer) return;

        const isCurrentlyChecked = inputElement.checked;
        const isLayerPresentOnMap = leafletMapInstance.hasLayer(associatedLayer);

        if (isCurrentlyChecked && !isLayerPresentOnMap) {
          leafletMapInstance.addLayer(associatedLayer);
        } else if (!isCurrentlyChecked && isLayerPresentOnMap) {
          leafletMapInstance.removeLayer(associatedLayer);
        }
      });

      inputProcessingFlag = false;
    };

    const handleMapLayerStatusChange = (event) => {
      const changedLayer = event.layer;
      const layerInfo = registeredLayers.get(changedLayer);

      if (!layerInfo) { return; }

      if (!inputProcessingFlag) {
        updateLayerDisplay();
      }

      const eventType = layerInfo.isOverlay ?
        (event.type === 'layeradd' ? 'overlayAdded' : 'overlayRemoved') :
        (event.type === 'layeradd' ? 'baseLayerChanged' : null);

      if (eventType) {
        leafletMapInstance.fire(eventType, { layer: changedLayer, name: layerInfo.name, group: layerInfo.group?.name });
      }
    };

    const expandPanel = () => {
      uiContainerElement.classList.add('leaflet-control-layers-expanded');
    };

    const collapsePanel = () => {
      uiContainerElement.classList.remove('leaflet-control-layers-expanded');
    };

    const initializeLayers = () => {
      Object.keys(initialBaseLayers).forEach(name => {
        addManagedLayer(initialBaseLayers[name], name, null, false);
      });

      Object.keys(initialGroupedOverlays).forEach(groupName => {
        Object.keys(initialGroupedOverlays[groupName]).forEach(layerName => {
          addManagedLayer(initialGroupedOverlays[groupName][layerName], layerName, groupName, true);
        });
      });
    };

    const controlObject = {
      attachToMap: function (map) {
        leafletMapInstance = map;
        setupControlPanel();
        updateLayerDisplay();

        leafletMapInstance
          .on('layeradd', handleMapLayerStatusChange)
          .on('layerremove', handleMapLayerStatusChange);

        return uiContainerElement;
      },

      detachFromMap: function () {
        if (leafletMapInstance) {
          leafletMapInstance
            .off('layeradd', handleMapLayerStatusChange)
            .off('layerremove', handleMapLayerStatusChange);

          if (currentSettings.panelCollapsed) {
            if (!isTouchDevice()) {
              uiContainerElement.removeEventListener('mouseover', expandPanel);
              uiContainerElement.removeEventListener('mouseout', collapsePanel);
            }
            if (toggleLinkElement) {
              if (isTouchDevice()) {
                toggleLinkElement.removeEventListener('click', (evt) => {
                  evt.preventDefault();
                  stopEventPropagation(evt);
                  expandPanel();
                });
              } else {
                toggleLinkElement.removeEventListener('focus', expandPanel);
              }
            }
            leafletMapInstance.off('click', collapsePanel);
          }

          if (uiContainerElement && uiContainerElement.parentNode) {
            uiContainerElement.parentNode.removeChild(uiContainerElement);
          }
        }
        leafletMapInstance = null;
        uiContainerElement = null;
        controlFormElement = null;
        baseLayerOutputArea = null;
        overlayOutputArea = null;
        contentSeparatorElement = null;
        toggleLinkElement = null;
      },

      registerBaseLayer: function (layer, name) {
        addManagedLayer(layer, name, null, false);
        updateLayerDisplay();
        return this;
      },

      registerOverlayLayer: function (layer, name, group) {
        addManagedLayer(layer, name, group, true);
        updateLayerDisplay();
        return this;
      },

      removeRegisteredLayer: function (layer) {
        removeManagedLayer(layer);
        updateLayerDisplay();
        return this;
      },

      getContainer: function() {
        return uiContainerElement;
      }
    };

    initializeLayers();

    return controlObject;
  };

  global.createLayerGroupingControl = function (baseLayers, groupedOverlays, options) {
    return createLayerManager(baseLayers, groupedOverlays, options);
  };

})(window);

L.Control.AlternativeLayerManager = L.Control.extend({
  options: {
    panelCollapsed: true,
    displayPosition: 'topright',
    autoLayerZIndex: true
  },

  initialize: function (baseLayers, groupedOverlays, options) {
    L.Util.setOptions(this, options);

    this._internalManager = window.createLayerGroupingControl(
      baseLayers,
      groupedOverlays,
      this.options
    );
  },

  onAdd: function (map) {
    this._map = map;
    this._container = this._internalManager.attachToMap(map);
    return this._container;
  },

  onRemove: function (map) {
    this._internalManager.detachFromMap();
    this._map = null;
    this._container = null;
  },

  addBaseLayerEntry: function (layer, name) {
    this._internalManager.registerBaseLayer(layer, name);
    return this;
  },

  addOverlayEntry: function (layer, name, group) {
    this._internalManager.registerOverlayLayer(layer, name, group);
    return this;
  },

  removeLayerEntry: function (layer) {
    this._internalManager.removeRegisteredLayer(layer);
    return this;
  }
});

L.control.alternativeLayerManager = function (baseLayers, groupedOverlays, options) {
  return new L.Control.AlternativeLayerManager(baseLayers, groupedOverlays, options);
};