var _checkOwnProperty = {}.hasOwnProperty;

var _extendPrototype = function (childClass, parentClass) {
  for (var propKey in parentClass) {
    if (_checkOwnProperty.call(parentClass, propKey)) {
      childClass[propKey] = parentClass[propKey];
    }
  }
  function tempCtor() {
    this.constructor = childClass;
  }
  tempCtor.prototype = parentClass.prototype;
  childClass.prototype = new tempCtor();
  childClass.__parent__ = parentClass.prototype;
  return childClass;
};

var _bindMethodToInstance = function (func, context) {
  return function () {
    return func.apply(context, arguments);
  };
};

(function (moduleDefinitions, loadedModulesCache, initialLoadList) {

  function retrieveModule(moduleIdentifier, isSilent) {
    if (loadedModulesCache[moduleIdentifier]) {
      return loadedModulesCache[moduleIdentifier];
    }

    if (!moduleDefinitions[moduleIdentifier]) {
      var globalNodeRequire = typeof require === "function" && require;
      if (!isSilent && globalNodeRequire) {
        return globalNodeRequire(moduleIdentifier, true);
      }
      if (fallbackRequire) {
        return fallbackRequire(moduleIdentifier, true);
      }
      throw new Error("Cannot locate module with ID '" + moduleIdentifier + "'");
    }

    var currentModuleExports = loadedModulesCache[moduleIdentifier] = {
      exports: {}
    };
    moduleDefinitions[moduleIdentifier][0].call(
      currentModuleExports.exports,
      function (depId) {
        var remappedDepId = moduleDefinitions[moduleIdentifier][1][depId];
        return retrieveModule(remappedDepId ? remappedDepId : depId);
      },
      currentModuleExports,
      currentModuleExports.exports
    );

    return loadedModulesCache[moduleIdentifier].exports;
  }

  var fallbackRequire = typeof require === "function" && require;

  for (let idx = 0; idx < initialLoadList.length; idx++) {
    retrieveModule(initialLoadList[idx]);
  }

  return retrieveModule(initialLoadList[0]);

})(
  {
    1: [
      function (requirer, modExports, exportsObject) {
        var ObservableEntity = requirer('./ObservableEntity.js');
        var EventHandler = requirer('./EventHandler.js');
        var AppUtils = requirer('./AppUtils.js');
        var ColorManager = requirer('./ColorManager.js');
        var DataStore = requirer('./DataStore.js');
        var ControlPanel = requirer('./ControlPanel.js');
        var NavigationMenu = requirer('./NavigationMenu.js');
        var StatusDisplay = requirer('./StatusDisplay.js');
        var Visualizer = requirer('./Visualizer.js');

        var AppCoordinator = (function (_baseClass) {
          _extendPrototype(AppCoordinator, _baseClass);

          AppCoordinator.prototype.appDataStore = null;
          AppCoordinator.prototype.mainControlPanel = null;
          AppCoordinator.prototype.navMenu = null;
          AppCoordinator.prototype.statusMonitor = null;
          AppCoordinator.prototype.dataVisualizer = null;
          AppCoordinator.prototype.colorGenerator = null;
          AppCoordinator.prototype.visualColors = null;

          function AppCoordinator() {
            this.appDataStore = new DataStore();
            this._registerComponent(this.appDataStore);
            this.appDataStore.initiateDataRequest();

            this.mainControlPanel = new ControlPanel('#controlPanel');
            this._registerComponent(this.mainControlPanel);

            this.navMenu = new NavigationMenu('#navMenu');
            this._registerComponent(this.navMenu);

            this.statusMonitor = new StatusDisplay('#statusLog');
            this._registerComponent(this.statusMonitor);

            this.dataVisualizer = new Visualizer();
            this._registerComponent(this.dataVisualizer);

            this.setupApplication();
          }

          AppCoordinator.prototype._registerComponent = function (component) {
            if (component && typeof component.registerHandler === 'function') {
              component.registerHandler(this);
            } else {
              console.warn("Attempted to register an invalid component:", component);
            }
          };

          AppCoordinator.prototype.notifyEvent = function (observedSubject, notificationType, eventPayload) {
            if (!observedSubject || !notificationType) {
              console.warn("AppCoordinator: Received an incomplete notification.");
              return;
            }

            if (observedSubject instanceof DataStore) {
              this.processDataStoreEvent(notificationType, eventPayload);
            } else if (observedSubject instanceof ControlPanel) {
              this.processControlPanelEvent(notificationType, eventPayload);
            } else if (observedSubject instanceof NavigationMenu) {
              this.processNavigationMenuEvent(notificationType, eventPayload);
            } else if (observedSubject instanceof Visualizer) {
              this.processVisualizerEvent(notificationType, eventPayload);
            } else {
              console.log(`AppCoordinator: Unhandled notification from unknown subject type: ${observedSubject.constructor.name}`);
            }
          };

          AppCoordinator.prototype.processDataStoreEvent = function (eventKind, eventData) {
            if (eventKind === DataStore.DATA_LOAD_SUCCESS) {
              this.statusMonitor.showMessage(`Processed ${this.appDataStore.getPointCount()} data points.`);
              this.statusMonitor.showMessage(`Identified ${this.appDataStore.getClusterCount()} clusters.`);
              this.initializeVisuals();
            } else if (eventKind === DataStore.IMAGE_CAPTURE_COMPLETE) {
              this.statusMonitor.showMessage(`Screenshot ${this.appDataStore.getSavedImageCount()} successfully saved.`);
            } else {
              console.info(`AppCoordinator: Unhandled DataStore event: ${eventKind}`);
            }
          };

          AppCoordinator.prototype.processControlPanelEvent = function (eventKind, eventData) {
            let componentState;

            switch (eventKind) {
              case ControlPanel.MENU_BUTTON_CLICKED:
                componentState = this.navMenu.toggleVisibility();
                this.mainControlPanel.setMenuBtnState(componentState);
                break;
              case ControlPanel.INFO_BUTTON_CLICKED:
                componentState = this.statusMonitor.toggleVisibility();
                this.mainControlPanel.setInfoBtnState(componentState);
                break;
              case ControlPanel.VIEW_MODE_PERSPECTIVE:
                this.dataVisualizer.setProjectionMode(Visualizer.VIEW_TYPES.PERSPECTIVE);
                this.mainControlPanel.setCameraBtnState(true, false, false);
                break;
              case ControlPanel.VIEW_MODE_ORTHOGRAPHIC:
                this.dataVisualizer.setProjectionMode(Visualizer.VIEW_TYPES.ORTHOGRAPHIC);
                this.mainControlPanel.setCameraBtnState(false, true, false);
                break;
              case ControlPanel.VIEW_MODE_DUAL:
                this.dataVisualizer.setProjectionMode(Visualizer.VIEW_TYPES.DUAL);
                this.mainControlPanel.setCameraBtnState(false, false, true);
                break;
              case ControlPanel.CAMERA_RESET_REQUEST:
                this.dataVisualizer.resetCameraView(true);
                this.mainControlPanel.flashResetBtn();
                break;
              case ControlPanel.MESSAGE_CLEAR_REQUEST:
                this.statusMonitor.clearMessages();
                this.mainControlPanel.flashClearBtn();
                break;
              case ControlPanel.BOUNDING_BOX_TOGGLE:
                componentState = this.dataVisualizer.toggleBoundingBox();
                this.mainControlPanel.setBoxBtnState(componentState);
                break;
              case ControlPanel.VIEWPORT_TOGGLE:
                componentState = this.dataVisualizer.toggleDisplayViewport();
                this.mainControlPanel.setViewportBtnState(componentState);
                break;
              case ControlPanel.SELECTION_TOOL_TOGGLE:
                componentState = this.dataVisualizer.toggleSelectionTool();
                this.mainControlPanel.setSelectBtnState(componentState);
                break;
              case ControlPanel.SET_VIEW_TOP:
                this.dataVisualizer.adjustCameraView(AppUtils.CARDINAL_DIRECTIONS.TOP);
                this.mainControlPanel.setViewBtnState(true, false, false);
                break;
              case ControlPanel.SET_VIEW_FRONT:
                this.dataVisualizer.adjustCameraView(AppUtils.CARDINAL_DIRECTIONS.FRONT);
                this.mainControlPanel.setViewBtnState(false, true, false);
                break;
              case ControlPanel.SET_VIEW_SIDE:
                this.dataVisualizer.adjustCameraView(AppUtils.CARDINAL_DIRECTIONS.SIDE);
                this.mainControlPanel.setViewBtnState(false, false, true);
                break;
              case ControlPanel.ROTATE_LEFT:
                this.dataVisualizer.setRotationState(Visualizer.ROTATION_MODES.LEFT);
                this.mainControlPanel.setSpinBtnState(true, false, false);
                break;
              case ControlPanel.STOP_ROTATION:
                this.dataVisualizer.setRotationState(Visualizer.ROTATION_MODES.NONE);
                this.mainControlPanel.setSpinBtnState(false, true, false);
                break;
              case ControlPanel.ROTATE_RIGHT:
                this.dataVisualizer.setRotationState(Visualizer.ROTATION_MODES.RIGHT);
                this.mainControlPanel.setSpinBtnState(false, false, true);
                break;
              case ControlPanel.ANIMATION_TOGGLE:
                componentState = this.dataVisualizer.toggleMotionAnimation();
                this.mainControlPanel.setAnimateBtnState(componentState);
                break;
              case ControlPanel.PRINT_SCREEN_REQUEST:
                const imageData = this.dataVisualizer.getCurrentImage();
                if (imageData) {
                  this.appDataStore.captureAndSaveImage(imageData);
                  this.mainControlPanel.flashPrintBtn();
                } else {
                  this.statusMonitor.showMessage("Image capture failed: no data received.");
                }
                break;
              default:
                console.info(`AppCoordinator: Unhandled ControlPanel event: ${eventKind}`);
                break;
            }
          };

          AppCoordinator.prototype.processNavigationMenuEvent = function (eventKind, eventData) {
            if (!eventData || typeof eventData.clusterId === 'undefined') {
              console.warn("AppCoordinator: NavigationMenu event missing cluster ID.");
              return;
            }
            const targetClusterId = eventData.clusterId;

            switch (eventKind) {
              case NavigationMenu.ALL_CLUSTERS_SHOW:
                this.dataVisualizer.setAllClusterVisibility(true);
                break;
              case NavigationMenu.ALL_CLUSTERS_HIDE:
                this.dataVisualizer.setAllClusterVisibility(false);
                break;
              case NavigationMenu.CLUSTER_VISIBILITY_CHANGE:
                this.dataVisualizer.toggleIndividualClusterVisibility(targetClusterId);
                break;
              case NavigationMenu.CLUSTER_SELECTION_CHANGE:
                if (targetClusterId > -1) {
                  this.dataVisualizer.toggleIndividualClusterSelection(targetClusterId);
                  this.statusMonitor.showMessage(`Cluster ${targetClusterId} selected.`);
                } else {
                  this.dataVisualizer.toggleIndividualClusterSelection(-1);
                  this.statusMonitor.showMessage("No cluster selected.");
                }
                break;
              default:
                console.info(`AppCoordinator: Unhandled NavigationMenu event: ${eventKind}`);
                break;
            }
          };

          AppCoordinator.prototype.processVisualizerEvent = function (eventKind, eventData) {
            const logPrefix = "Visualizer Event: ";

            switch (eventKind) {
              case Visualizer.VISUAL_DATA_READY:
                console.log(logPrefix + "Data loaded into visualizer.");
                break;
              case Visualizer.POINTS_HIGHLIGHTED:
                if (eventData && typeof eventData.pointCount !== 'undefined') {
                  this.statusMonitor.showMessage(`Highlighted ${eventData.pointCount} data points.`);
                }
                break;
              case Visualizer.CLUSTER_HIGHLIGHTED:
                if (eventData && typeof eventData.clusterId !== 'undefined') {
                  const displayMessage = eventData.clusterId > -1 ?
                    `Cluster ${eventData.clusterId} is now active.` :
                    "No cluster is currently active.";
                  this.statusMonitor.showMessage(displayMessage);
                }
                break;
              default:
                console.info(`AppCoordinator: Unhandled Visualizer event: ${eventKind}`);
                break;
            }
          };

          AppCoordinator.prototype.initializeVisuals = function () {
            if (!this.appDataStore || !this.navMenu || !this.dataVisualizer) {
              console.error("AppCoordinator: Cannot initialize visuals, core components are missing.");
              return;
            }

            const totalClusters = this.appDataStore.getClusterCount();
            if (totalClusters <= 0) {
              this.statusMonitor.showMessage("No clusters found to visualize.");
              return;
            }

            this.colorGenerator = new ColorManager(totalClusters);
            this.visualColors = this.colorGenerator.retrieveColorSet();

            this.navMenu.buildMenu(totalClusters, this.visualColors);

            this.dataVisualizer.assignClusterColors(this.visualColors);
            this.dataVisualizer.loadVisualData(this.appDataStore);

            this.processControlPanelEvent(ControlPanel.ROTATE_RIGHT);
          };

          AppCoordinator.prototype.setupApplication = function () {
            this.statusMonitor.showMessage("Application initialized. Waiting for data...");
          };

          return AppCoordinator;

        })(EventHandler);

        var appInstance = new AppCoordinator();
      },
      {
        "./StatusDisplay.js": 2,
        "./NavigationMenu.js": 3,
        "./EventHandler.js": 4,
        "./ColorManager.js": 5,
        "./Visualizer.js": 7,
        "./DataStore.js": 9,
        "./ObservableEntity.js": 10,
        "./ControlPanel.js": 11,
        "./AppUtils.js": 12,
      },
    ],
    2: [
      function (requirer, modExports, exportsObject) {
        var UIComponent = requirer('./UIComponent.js');

        var StatusDisplay = (function (_baseClass) {
          _extendPrototype(StatusDisplay, _baseClass);

          const MAX_DISPLAY_MESSAGES = 10;

          function StatusDisplay(elementId) {
            StatusDisplay.__parent__.constructor.call(this, elementId);
            if (!$(elementId).find('#messageLog').length) {
              $(elementId).append('<div id="messageLog"></div>');
            }
          }

          StatusDisplay.prototype.showMessage = function (messageContent) {
            if (!messageContent || messageContent.trim() === '') {
              console.warn("Attempted to display an empty message.");
              return;
            }

            const now = new Date();
            const timestamp = now.toLocaleTimeString();
            const fullMessage = `<div class="status-entry"><strong>[${timestamp}]</strong> ${messageContent}</div>`;
            const messageContainer = $('#messageLog');

            messageContainer.prepend(fullMessage);

            const currentMessages = messageContainer.children('.status-entry');
            if (currentMessages.length > MAX_DISPLAY_MESSAGES) {
              currentMessages.slice(MAX_DISPLAY_MESSAGES).remove();
            }
          };

          StatusDisplay.prototype.clearMessages = function () {
            $('#messageLog').empty();
            this.showMessage("Status log cleared.");
          };

          return StatusDisplay;

        })(UIComponent);

        modExports.exports = StatusDisplay;
      },
      {
        "./UIComponent.js": 6
      },
    ],
    3: [
      function (requirer, modExports, exportsObject) {
        var UIComponent = requirer('./UIComponent.js');

        var NavigationMenu = (function (_baseClass) {
          _extendPrototype(NavigationMenu, _baseClass);

          NavigationMenu.ALL_CLUSTERS_SHOW = "ALL_CLUSTERS_SHOW";
          NavigationMenu.ALL_CLUSTERS_HIDE = "ALL_CLUSTERS_HIDE";
          NavigationMenu.CLUSTER_VISIBILITY_CHANGE = "CLUSTER_VISIBILITY_CHANGE";
          NavigationMenu.CLUSTER_SELECTION_CHANGE = "CLUSTER_SELECTION_CHANGE";

          NavigationMenu.VISIBILITY_INDICATOR_ON = "[ON]";
          NavigationMenu.VISIBILITY_INDICATOR_OFF = "[OFF]";
          NavigationMenu.VISIBILITY_INDICATOR_MIXED = "[MIX]";

          NavigationMenu.prototype.numClusters = 0;
          NavigationMenu.prototype.activeClusterIndex = -1;
          NavigationMenu.prototype.clusterColorMap = null;

          function NavigationMenu(elementId) {
            this._handleClusterClick = _bindMethodToInstance(this._handleClusterClick, this);
            this._handleToggleClick = _bindMethodToInstance(this._handleToggleClick, this);
            this._handleToggleAllClick = _bindMethodToInstance(this._handleToggleAllClick, this);
            NavigationMenu.__parent__.constructor.call(this, elementId);
          }

          NavigationMenu.prototype._handleToggleAllClick = function (event) {
            const currentToggleState = $("#allToggleBtn").text();
            let newToggleState;
            let notificationEvent;

            if (currentToggleState === NavigationMenu.VISIBILITY_INDICATOR_OFF || currentToggleState === NavigationMenu.VISIBILITY_INDICATOR_MIXED) {
              newToggleState = NavigationMenu.VISIBILITY_INDICATOR_ON;
              notificationEvent = NavigationMenu.ALL_CLUSTERS_SHOW;
            } else {
              newToggleState = NavigationMenu.VISIBILITY_INDICATOR_OFF;
              notificationEvent = NavigationMenu.ALL_CLUSTERS_HIDE;
            }

            $("#allToggleBtn").text(newToggleState);

            for (let i = 0; i < this.numClusters; i++) {
              $(`#toggle_${i}`).text(newToggleState);
            }

            this.dispatchNotification(notificationEvent);
          };

          NavigationMenu.prototype._handleToggleClick = function (event) {
            const elementId = event.target.id;
            if (!elementId.startsWith("toggle_")) {
              console.warn(`NavigationMenu: Invalid toggle element ID format: ${elementId}`);
              return;
            }
            const clusterIndexStr = elementId.replace("toggle_", "");
            const clusterIndex = parseInt(clusterIndexStr, 10);

            if (isNaN(clusterIndex) || clusterIndex < 0 || clusterIndex >= this.numClusters) {
              console.error(`NavigationMenu: Invalid cluster index for toggle: ${clusterIndex}`);
              return;
            }

            this.performClusterToggle(clusterIndex);
            this.dispatchNotification(NavigationMenu.CLUSTER_VISIBILITY_CHANGE, {
              clusterId: clusterIndex
            });
          };

          NavigationMenu.prototype._handleClusterClick = function (event) {
            const elementId = event.target.id;
            if (!elementId.startsWith("button_")) {
              console.warn(`NavigationMenu: Invalid button element ID format: ${elementId}`);
              return;
            }
            const clusterIndexStr = elementId.replace("button_", "");
            const selectedIdx = parseInt(clusterIndexStr, 10);

            if (isNaN(selectedIdx) || selectedIdx < 0 || selectedIdx >= this.numClusters) {
              console.error(`NavigationMenu: Invalid cluster index for selection: ${selectedIdx}`);
              return;
            }

            this.activeClusterIndex = (this.activeClusterIndex === selectedIdx) ? -1 : selectedIdx;

            this.refreshColorSwatches();
            this.refreshClusterButtons();
            this.dispatchNotification(NavigationMenu.CLUSTER_SELECTION_CHANGE, {
              clusterId: selectedIdx
            });
          };

          NavigationMenu.prototype.performClusterToggle = function (index) {
            const clusterToggleSelector = `#toggle_${index}`;
            const currentToggleState = $(clusterToggleSelector).text();
            let newToggleState;

            if (currentToggleState === NavigationMenu.VISIBILITY_INDICATOR_ON) {
              newToggleState = NavigationMenu.VISIBILITY_INDICATOR_OFF;
            } else {
              newToggleState = NavigationMenu.VISIBILITY_INDICATOR_ON;
            }
            $(clusterToggleSelector).text(newToggleState);

            this.syncMasterToggleState();
            return newToggleState;
          };

          NavigationMenu.prototype.buildMenu = function (totalClusters, colors) {
            if (totalClusters <= 0 || !Array.isArray(colors) || colors.length !== totalClusters) {
              console.error("NavigationMenu: Invalid cluster count or color array for menu creation.");
              return;
            }

            this.numClusters = totalClusters;
            this.clusterColorMap = colors;

            let menuHtmlSegments = [];
            menuHtmlSegments.push(
              `<div class="menu-item-group">
                <span class='cluster-toggle-btn' id='allToggleBtn'>${NavigationMenu.VISIBILITY_INDICATOR_ON}</span>
                <span class='cluster-label-btn' id='allClustersBtn'> All Clusters</span>
                <span class='cluster-color-swatch' id='allColorSwatch'></span>
              </div>`
            );

            for (let i = 0; i < this.numClusters; i++) {
              menuHtmlSegments.push(
                `<div class="menu-item-group">
                  <span class='cluster-toggle-btn' id='toggle_${i}'>${NavigationMenu.VISIBILITY_INDICATOR_ON}</span>
                  <span class='cluster-label-btn' id='button_${i}'> Cluster ${i}</span>
                  <span class='cluster-color-swatch' id='color_${i}'> &nbsp; </span>
                </div>`
              );
            }

            $(this.elementId).append(menuHtmlSegments.join(''));

            $(this.elementId).on('click', '#allToggleBtn', this._handleToggleAllClick);
            for (let i = 0; i < this.numClusters; i++) {
              $(this.elementId).on('click', `#toggle_${i}`, this._handleToggleClick);
              $(this.elementId).on('click', `#button_${i}`, this._handleClusterClick);
            }

            this.refreshColorSwatches();
            this.refreshClusterButtons();
          };

          NavigationMenu.prototype.countVisibleClusters = function () {
            let visibleCount = 0;
            for (let i = 0; i < this.numClusters; i++) {
              const toggleElementId = `#toggle_${i}`;
              if ($(toggleElementId).text() === NavigationMenu.VISIBILITY_INDICATOR_ON) {
                visibleCount++;
              }
            }
            return visibleCount;
          };

          NavigationMenu.prototype.syncMasterToggleState = function () {
            const visibleCount = this.countVisibleClusters();
            const allToggleBtn = $("#allToggleBtn");

            if (visibleCount === 0) {
              allToggleBtn.text(NavigationMenu.VISIBILITY_INDICATOR_OFF);
            } else if (visibleCount === this.numClusters) {
              allToggleBtn.text(NavigationMenu.VISIBILITY_INDICATOR_ON);
            } else {
              allToggleBtn.text(NavigationMenu.VISIBILITY_INDICATOR_MIXED);
            }
          };

          NavigationMenu.prototype.refreshColorSwatches = function () {
            if (!this.clusterColorMap) return;

            for (let i = 0; i < this.numClusters; i++) {
              const swatchElement = $(`#color_${i}`);
              if (!swatchElement.length) continue;

              if (i === this.activeClusterIndex) {
                swatchElement.css('background-color', ColorManager.ACTIVE_HIGHLIGHT_COLOR.getStyle());
              } else {
                const clusterColor = this.clusterColorMap[i];
                if (clusterColor) {
                  swatchElement.css('background-color', clusterColor.getStyle());
                }
              }
            }
          };

          NavigationMenu.prototype.refreshClusterButtons = function () {
            for (let i = 0; i < this.numClusters; i++) {
              const buttonElement = $(`#button_${i}`);
              if (!buttonElement.length) continue;

              if (i === this.activeClusterIndex) {
                buttonElement.css('color', ColorManager.ACTIVE_HIGHLIGHT_COLOR.getStyle());
              } else {
                buttonElement.css('color', ColorManager.DEFAULT_BUTTON_COLOR.getStyle());
              }
            }
          };

          return NavigationMenu;

        })(UIComponent);

        modExports.exports = NavigationMenu;
      },
      {
        "./UIComponent.js": 6
      },
    ],
    4: [
      function (requirer, modExports, exportsObject) {
        var EventHandler = (function () {
          function EventHandler() {}

          EventHandler.prototype.notifyEvent = function (subject, type, data) {
            console.warn(`EventHandler: ${this.constructor.name} received unhandled notification of type '${type}' from ${subject.constructor.name}.`);
          };

          return EventHandler;

        })();

        modExports.exports = EventHandler;
      },
      {},
    ],
    5: [
      function (requirer, modExports, exportsObject) {
        var ColorManager = (function () {
          ColorManager.BG_COLOR = new THREE.Color(0x222222);
          ColorManager.ACTIVE_HIGHLIGHT_COLOR = new THREE.Color(0xFFFF00);
          ColorManager.SELECTION_COLOR = new THREE.Color(0xFF0000);
          ColorManager.DEFAULT_BUTTON_COLOR = new THREE.Color(0xBBBBBB);
          ColorManager.ACTIVE_BUTTON_COLOR = new THREE.Color(0xFF8C00);

          ColorManager.prototype.colorSet = null;

          function ColorManager(paletteSize) {
            this.colorSet = [];
            this.createColorSet(paletteSize);
          }

          ColorManager.prototype.createColorSet = function (totalColors) {
            if (typeof totalColors !== 'number' || totalColors <= 0) {
              console.error("ColorManager: Invalid number of colors specified for palette generation.");
              this.colorSet = [];
              return;
            }

            this.colorSet.length = 0;

            let currentHue = 0;
            const saturationValue = 0.75;
            const lightnessValue = 0.5;
            const hueStep = 1 / totalColors;

            for (let i = 0; i < totalColors; i++) {
              currentHue = (i * hueStep + 0.1) % 1;
              const newColor = new THREE.Color();
              newColor.setHSL(currentHue, saturationValue, lightnessValue);
              this.colorSet.push(newColor);
            }
          };

          ColorManager.prototype.retrieveColorSet = function () {
            return this.colorSet;
          };

          ColorManager.prototype.logColorDetails = function () {
            console.log("--- Color Palette Details ---");
            if (!this.colorSet || this.colorSet.length === 0) {
              console.log("No colors in the palette.");
              return;
            }
            this.colorSet.forEach((colorInstance, index) => {
              const hex = colorInstance.getHexString();
              const hsl = colorInstance.getHSL();
              const cssString = colorInstance.getStyle();
              console.log(
                `${index}: #` + hex +
                ` | HSL(${hsl.h.toFixed(2)}, ${hsl.s.toFixed(2)}, ${hsl.l.toFixed(2)})` +
                ` | CSS: ${cssString}`
              );
            });
            console.log("----------------------------");
          };

          return ColorManager;

        })();

        modExports.exports = ColorManager;
      },
      {},
    ],
    6: [
      function (requirer, modExports, exportsObject) {
        var ObservableEntity = requirer('./ObservableEntity.js');

        var UIComponent = (function (_baseClass) {
          _extendPrototype(UIComponent, _baseClass);

          UIComponent.COMPONENT_DISPLAYED = "COMPONENT_DISPLAYED";
          UIComponent.COMPONENT_CONCEALED = "COMPONENT_CONCEALED";

          UIComponent.prototype.elementId = null;
          UIComponent.prototype.isComponentVisible = true;

          function UIComponent(domSelector) {
            this.elementId = domSelector;
            UIComponent.__parent__.constructor.call(this);

            this.isComponentVisible = $(this.elementId).is(':visible');
          }

          UIComponent.prototype.revealComponent = function () {
            const targetElement = $(this.elementId);
            if (!targetElement.length) {
              console.warn(`UIComponent: Element with selector '${this.elementId}' not found for revealing.`);
              return false;
            }
            targetElement.show();
            this.isComponentVisible = true;
            this.dispatchNotification(UIComponent.COMPONENT_DISPLAYED);
            return true;
          };

          UIComponent.prototype.concealComponent = function () {
            const targetElement = $(this.elementId);
            if (!targetElement.length) {
              console.warn(`UIComponent: Element with selector '${this.elementId}' not found for concealing.`);
              return false;
            }
            targetElement.hide();
            this.isComponentVisible = false;
            this.dispatchNotification(UIComponent.COMPONENT_CONCEALED);
            return true;
          };

          UIComponent.prototype.toggleVisibility = function () {
            if (this.isComponentVisible) {
              this.concealComponent();
            } else {
              this.revealComponent();
            }
            return this.isComponentVisible;
          };

          return UIComponent;

        })(ObservableEntity);

        modExports.exports = UIComponent;
      },
      {
        "./ObservableEntity.js": 10
      },
    ],
    7: [
      function (requirer, modExports, exportsObject) {
        var ObservableEntity = requirer('./ObservableEntity.js');

        var Visualizer = (function (_baseClass) {
          _extendPrototype(Visualizer, _baseClass);

          Visualizer.VIEW_TYPES = {
            PERSPECTIVE: "PERSPECTIVE",
            ORTHOGRAPHIC: "ORTHOGRAPHIC",
            DUAL: "DUAL"
          };

          Visualizer.ROTATION_MODES = {
            LEFT: "LEFT",
            RIGHT: "RIGHT",
            NONE: "NONE"
          };

          Visualizer.VISUAL_DATA_READY = "VISUAL_DATA_READY";
          Visualizer.POINTS_HIGHLIGHTED = "POINTS_HIGHLIGHTED";
          Visualizer.CLUSTER_HIGHLIGHTED = "CLUSTER_HIGHLIGHTED";

          Visualizer.prototype.currentProjectionMode = Visualizer.VIEW_TYPES.PERSPECTIVE;
          Visualizer.prototype.currentRotationState = Visualizer.ROTATION_MODES.NONE;
          Visualizer.prototype.isBoundingBoxVisible = false;
          Visualizer.prototype.isViewportActive = false;
          Visualizer.prototype.isSelectionToolActive = false;
          Visualizer.prototype.isAnimationRunning = false;
          Visualizer.prototype.clusterColorMap = null;
          Visualizer.prototype.loadedDataStore = null;

          function Visualizer() {
            Visualizer.__parent__.constructor.call(this);
            console.log("Visualizer component initialized.");
          }

          Visualizer.prototype.setProjectionMode = function (mode) {
            if (!Object.values(Visualizer.VIEW_TYPES).includes(mode)) {
              console.warn(`Visualizer: Invalid projection mode specified: ${mode}`);
              return;
            }
            this.currentProjectionMode = mode;
            console.log(`Visualizer: Projection mode set to ${mode}.`);
          };

          Visualizer.prototype.resetCameraView = function (animated) {
            console.log(`Visualizer: Camera reset initiated (animated: ${animated}).`);
          };

          Visualizer.prototype.toggleBoundingBox = function () {
            this.isBoundingBoxVisible = !this.isBoundingBoxVisible;
            console.log(`Visualizer: Bounding box visibility: ${this.isBoundingBoxVisible}.`);
            return this.isBoundingBoxVisible;
          };

          Visualizer.prototype.toggleDisplayViewport = function () {
            this.isViewportActive = !this.isViewportActive;
            console.log(`Visualizer: Auxiliary viewport active: ${this.isViewportActive}.`);
            return this.isViewportActive;
          };

          Visualizer.prototype.toggleSelectionTool = function () {
            this.isSelectionToolActive = !this.isSelectionToolActive;
            console.log(`Visualizer: Selection tool active: ${this.isSelectionToolActive}.`);
            return this.isSelectionToolActive;
          };

          Visualizer.prototype.adjustCameraView = function (direction) {
            if (!Object.values(requirer('./AppUtils.js').CARDINAL_DIRECTIONS).includes(direction)) {
              console.warn(`Visualizer: Invalid view direction specified: ${direction}`);
              return;
            }
            console.log(`Visualizer: Camera view changed to ${direction}.`);
          };

          Visualizer.prototype.setRotationState = function (state) {
            if (!Object.values(Visualizer.ROTATION_MODES).includes(state)) {
              console.warn(`Visualizer: Invalid rotation state specified: ${state}`);
              return;
            }
            this.currentRotationState = state;
            console.log(`Visualizer: Rotation state set to ${state}.`);
          };

          Visualizer.prototype.toggleMotionAnimation = function () {
            this.isAnimationRunning = !this.isAnimationRunning;
            console.log(`Visualizer: Animation running: ${this.isAnimationRunning}.`);
            return this.isAnimationRunning;
          };

          Visualizer.prototype.getCurrentImage = function () {
            console.log("Visualizer: Capturing current image...");
            return "data:image/png;base64,...";
          };

          Visualizer.prototype.assignClusterColors = function (colorsArray) {
            if (!Array.isArray(colorsArray) || colorsArray.length === 0) {
              console.warn("Visualizer: Attempted to assign empty or invalid color array.");
              return;
            }
            this.clusterColorMap = colorsArray;
            console.log(`Visualizer: Assigned ${colorsArray.length} cluster colors.`);
          };

          Visualizer.prototype.loadVisualData = function (dataStoreInstance) {
            if (!(dataStoreInstance instanceof requirer('./DataStore.js'))) {
              console.error("Visualizer: Invalid DataStore instance provided for loading.");
              return;
            }
            this.loadedDataStore = dataStoreInstance;
            console.log("Visualizer: Data loaded from DataStore. Rendering...");
            this.dispatchNotification(Visualizer.VISUAL_DATA_READY);
          };

          Visualizer.prototype.setAllClusterVisibility = function (isVisible) {
            console.log(`Visualizer: Setting all clusters visibility to ${isVisible}.`);
          };

          Visualizer.prototype.toggleIndividualClusterVisibility = function (clusterId) {
            console.log(`Visualizer: Toggling visibility for cluster ID: ${clusterId}.`);
          };

          Visualizer.prototype.toggleIndividualClusterSelection = function (clusterId) {
            console.log(`Visualizer: Toggling selection for cluster ID: ${clusterId}.`);
            this.dispatchNotification(Visualizer.CLUSTER_HIGHLIGHTED, {
              clusterId: clusterId
            });
          };

          return Visualizer;

        })(ObservableEntity);

        modExports.exports = Visualizer;
      },
      {
        "./ObservableEntity.js": 10,
        "./DataStore.js": 9,
        "./AppUtils.js": 12
      },
    ],
    9: [
      function (requirer, modExports, exportsObject) {
        var ObservableEntity = requirer('./ObservableEntity.js');

        var DataStore = (function (_baseClass) {
          _extendPrototype(DataStore, _baseClass);

          DataStore.DATA_LOAD_SUCCESS = "DATA_LOAD_SUCCESS";
          DataStore.IMAGE_CAPTURE_COMPLETE = "IMAGE_CAPTURE_COMPLETE";

          DataStore.prototype._dataPoints = [];
          DataStore.prototype._clusterData = [];
          DataStore.prototype._savedImageCounter = 0;

          function DataStore() {
            DataStore.__parent__.constructor.call(this);
            console.log("DataStore component initialized.");
          }

          DataStore.prototype.initiateDataRequest = function () {
            console.log("DataStore: Requesting data...");
            setTimeout(() => {
              this._dataPoints = Array.from({
                length: 1000
              }, (_, i) => ({
                x: Math.random(),
                y: Math.random(),
                z: Math.random(),
                cluster: Math.floor(Math.random() * 5)
              }));
              this._clusterData = Array.from({
                length: 5
              }, (_, i) => ({
                id: i,
                name: `Cluster ${i}`
              }));

              console.log("DataStore: Data loaded successfully.");
              this.dispatchNotification(DataStore.DATA_LOAD_SUCCESS);
            }, 1500);
          };

          DataStore.prototype.getPointCount = function () {
            return this._dataPoints.length;
          };

          DataStore.prototype.getClusterCount = function () {
            return this._clusterData.length;
          };

          DataStore.prototype.getSavedImageCount = function () {
            return this._savedImageCounter;
          };

          DataStore.prototype.captureAndSaveImage = function (imageDataUrl) {
            if (!imageDataUrl || !imageDataUrl.startsWith("data:image/")) {
              console.error("DataStore: Invalid image data URL provided for saving.");
              return;
            }
            console.log("DataStore: Saving image (simulated)...");
            this._savedImageCounter++;
            this.dispatchNotification(DataStore.IMAGE_CAPTURE_COMPLETE);
          };

          return DataStore;

        })(ObservableEntity);

        modExports.exports = DataStore;
      },
      {
        "./ObservableEntity.js": 10
      },
    ],
    10: [
      function (requirer, modExports, exportsObject) {
        var ObservableEntity = (function () {
          ObservableEntity.prototype.registeredHandlers = null;

          function ObservableEntity() {
            this.registeredHandlers = [];
          }

          ObservableEntity.prototype.registerHandler = function (handler) {
            if (!handler || typeof handler.notifyEvent !== 'function') {
              console.warn("ObservableEntity: Attempted to register an invalid handler.");
              return false;
            }
            if (this.registeredHandlers.includes(handler)) {
              console.info("ObservableEntity: Handler already registered.");
              return false;
            }
            this.registeredHandlers.push(handler);
            return true;
          };

          ObservableEntity.prototype.unregisterHandler = function (handler) {
            const index = this.registeredHandlers.indexOf(handler);
            if (index > -1) {
              this.registeredHandlers.splice(index, 1);
              return true;
            }
            return false;
          };

          ObservableEntity.prototype.dispatchNotification = function (eventType, eventData) {
            if (!this.registeredHandlers || this.registeredHandlers.length === 0 || !eventType) {
              return;
            }
            [...this.registeredHandlers].forEach(handler => {
              try {
                handler.notifyEvent(this, eventType, eventData);
              } catch (error) {
                console.error(`Error notifying handler ${handler.constructor.name}:`, error);
              }
            });
          };

          return ObservableEntity;

        })();

        modExports.exports = ObservableEntity;
      },
      {},
    ],
    11: [
      function (requirer, modExports, exportsObject) {
        var UIComponent = requirer('./UIComponent.js');
        var ColorManager = requirer('./ColorManager.js');

        var ControlPanel = (function (_baseClass) {
          _extendPrototype(ControlPanel, _baseClass);

          ControlPanel.MENU_BUTTON_CLICKED = "MENU_BUTTON_CLICKED";
          ControlPanel.INFO_BUTTON_CLICKED = "INFO_BUTTON_CLICKED";
          ControlPanel.VIEW_MODE_PERSPECTIVE = "VIEW_MODE_PERSPECTIVE";
          ControlPanel.VIEW_MODE_ORTHOGRAPHIC = "VIEW_MODE_ORTHOGRAPHIC";
          ControlPanel.VIEW_MODE_DUAL = "VIEW_MODE_DUAL";
          ControlPanel.CAMERA_RESET_REQUEST = "CAMERA_RESET_REQUEST";
          ControlPanel.MESSAGE_CLEAR_REQUEST = "MESSAGE_CLEAR_REQUEST";
          ControlPanel.BOUNDING_BOX_TOGGLE = "BOUNDING_BOX_TOGGLE";
          ControlPanel.VIEWPORT_TOGGLE = "VIEWPORT_TOGGLE";
          ControlPanel.SELECTION_TOOL_TOGGLE = "SELECTION_TOOL_TOGGLE";
          ControlPanel.SET_VIEW_TOP = "SET_VIEW_TOP";
          ControlPanel.SET_VIEW_FRONT = "SET_VIEW_FRONT";
          ControlPanel.SET_VIEW_SIDE = "SET_VIEW_SIDE";
          ControlPanel.ROTATE_LEFT = "ROTATE_LEFT";
          ControlPanel.STOP_ROTATION = "STOP_ROTATION";
          ControlPanel.ROTATE_RIGHT = "ROTATE_RIGHT";
          ControlPanel.ANIMATION_TOGGLE = "ANIMATION_TOGGLE";
          ControlPanel.PRINT_SCREEN_REQUEST = "PRINT_SCREEN_REQUEST";

          function ControlPanel(elementId) {
            ControlPanel.__parent__.constructor.call(this, elementId);
            this._handleButtonClick = _bindMethodToInstance(this._handleButtonClick, this);

            $(this.elementId).on('click', '.toolbar-button', this._handleButtonClick);

            this._resetAllButtonColors();
          }

          ControlPanel.prototype._resetAllButtonColors = function () {
            $(this.elementId).find('.toolbar-button').css('color', ColorManager.DEFAULT_BUTTON_COLOR.getStyle());
          };

          ControlPanel.prototype._handleButtonClick = function (event) {
            const buttonId = $(event.target).closest('.toolbar-button').attr('id');
            if (!buttonId) {
              console.warn("ControlPanel: Click event on an element without a valid button ID.");
              return;
            }

            let eventToDispatch = null;
            let eventPayload = null;

            switch (buttonId) {
              case 'btnMenu':
                eventToDispatch = ControlPanel.MENU_BUTTON_CLICKED;
                break;
              case 'btnInfo':
                eventToDispatch = ControlPanel.INFO_BUTTON_CLICKED;
                break;
              case 'btnPerspective':
                eventToDispatch = ControlPanel.VIEW_MODE_PERSPECTIVE;
                break;
              case 'btnOrthographic':
                eventToDispatch = ControlPanel.VIEW_MODE_ORTHOGRAPHIC;
                break;
              case 'btnDual':
                eventToDispatch = ControlPanel.VIEW_MODE_DUAL;
                break;
              case 'btnReset':
                eventToDispatch = ControlPanel.CAMERA_RESET_REQUEST;
                break;
              case 'btnClear':
                eventToDispatch = ControlPanel.MESSAGE_CLEAR_REQUEST;
                break;
              case 'btnBox':
                eventToDispatch = ControlPanel.BOUNDING_BOX_TOGGLE;
                break;
              case 'btnViewport':
                eventToDispatch = ControlPanel.VIEWPORT_TOGGLE;
                break;
              case 'btnSelect':
                eventToDispatch = ControlPanel.SELECTION_TOOL_TOGGLE;
                break;
              case 'btnViewTop':
                eventToDispatch = ControlPanel.SET_VIEW_TOP;
                break;
              case 'btnViewFront':
                eventToDispatch = ControlPanel.SET_VIEW_FRONT;
                break;
              case 'btnViewSide':
                eventToDispatch = ControlPanel.SET_VIEW_SIDE;
                break;
              case 'btnSpinLeft':
                eventToDispatch = ControlPanel.ROTATE_LEFT;
                break;
              case 'btnSpinStop':
                eventToDispatch = ControlPanel.STOP_ROTATION;
                break;
              case 'btnSpinRight':
                eventToDispatch = ControlPanel.ROTATE_RIGHT;
                break;
              case 'btnAnimate':
                eventToDispatch = ControlPanel.ANIMATION_TOGGLE;
                break;
              case 'btnPrint':
                eventToDispatch = ControlPanel.PRINT_SCREEN_REQUEST;
                break;
              default:
                console.warn(`ControlPanel: Unrecognized button ID clicked: ${buttonId}`);
                return;
            }

            this.dispatchNotification(eventToDispatch, eventPayload);
          };

          ControlPanel.prototype._setButtonColor = function (buttonId, isActive) {
            const color = isActive ? ColorManager.ACTIVE_BUTTON_COLOR.getStyle() : ColorManager.DEFAULT_BUTTON_COLOR.getStyle();
            $(`#${buttonId}`).css('color', color);
          };

          ControlPanel.prototype.setMenuBtnState = function (isSelected) {
            this._setButtonColor('btnMenu', isSelected);
          };

          ControlPanel.prototype.setInfoBtnState = function (isSelected) {
            this._setButtonColor('btnInfo', isSelected);
          };

          ControlPanel.prototype.setCameraBtnState = function (isPerspective, isOrthographic, isDual) {
            this._setButtonColor('btnPerspective', isPerspective);
            this._setButtonColor('btnOrthographic', isOrthographic);
            this._setButtonColor('btnDual', isDual);
          };

          ControlPanel.prototype.flashResetBtn = function () {
            const btn = $('#btnReset');
            btn.css('color', ColorManager.ACTIVE_HIGHLIGHT_COLOR.getStyle());
            setTimeout(() => btn.css('color', ColorManager.DEFAULT_BUTTON_COLOR.getStyle()), 200);
          };

          ControlPanel.prototype.flashClearBtn = function () {
            const btn = $('#btnClear');
            btn.css('color', ColorManager.ACTIVE_HIGHLIGHT_COLOR.getStyle());
            setTimeout(() => btn.css('color', ColorManager.DEFAULT_BUTTON_COLOR.getStyle()), 200);
          };

          ControlPanel.prototype.setBoxBtnState = function (isSelected) {
            this._setButtonColor('btnBox', isSelected);
          };

          ControlPanel.prototype.setViewportBtnState = function (isSelected) {
            this._setButtonColor('btnViewport', isSelected);
          };

          ControlPanel.prototype.setSelectBtnState = function (isSelected) {
            this._setButtonColor('btnSelect', isSelected);
          };

          ControlPanel.prototype.setViewBtnState = function (isTop, isFront, isSide) {
            this._setButtonColor('btnViewTop', isTop);
            this._setButtonColor('btnViewFront', isFront);
            this._setButtonColor('btnViewSide', isSide);
          };

          ControlPanel.prototype.setSpinBtnState = function (isSpinLeft, isSpinStop, isSpinRight) {
            this._setButtonColor('btnSpinLeft', isSpinLeft);
            this._setButtonColor('btnSpinStop', isSpinStop);
            this._setButtonColor('btnSpinRight', isSpinRight);
          };

          ControlPanel.prototype.setAnimateBtnState = function (isSelected) {
            this._setButtonColor('btnAnimate', isSelected);
          };

          ControlPanel.prototype.flashPrintBtn = function () {
            const btn = $('#btnPrint');
            btn.css('color', ColorManager.ACTIVE_HIGHLIGHT_COLOR.getStyle());
            setTimeout(() => btn.css('color', ColorManager.DEFAULT_BUTTON_COLOR.getStyle()), 200);
          };

          return ControlPanel;

        })(UIComponent);

        modExports.exports = ControlPanel;
      },
      {
        "./UIComponent.js": 6,
        "./ColorManager.js": 5
      },
    ],
    12: [
      function (requirer, modExports, exportsObject) {
        var AppUtils = (function () {
          function AppUtils() {}

          AppUtils.CARDINAL_DIRECTIONS = {
            TOP: "TOP",
            FRONT: "FRONT",
            SIDE: "SIDE",
            BACK: "BACK"
          };

          AppUtils.clamp = function (value, min, max) {
            return Math.max(min, Math.min(value, max));
          };

          return AppUtils;

        })();

        modExports.exports = AppUtils;
      },
      {},
    ],
  },
  {},
  [1]
);