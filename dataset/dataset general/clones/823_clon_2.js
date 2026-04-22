;(function(modSources, modCache, modNames){
  // This is a custom module loading system.
  // modSources: Contains the module definitions.
  // modCache: Stores already loaded modules.
  // modNames: Array of module IDs to be loaded initially.

  /**
   * Internal function to resolve and load modules.
   * @param {string} moduleName - The ID of the module to load.
   * @param {boolean} currentIdx - Flag indicating if this is an initial load.
   * @returns {object} The exports of the requested module.
   */
  function resolver(moduleName, currentIdx){
    // If module is already in cache, return its exports
    if(!modCache[moduleName]){
      // If module definition doesn't exist, try external require or throw error
      if(!modSources[moduleName]){
        var externalRequire = typeof require === "function" && require;
        if(!currentIdx && externalRequire) return externalRequire(moduleName, true);
        if(localRequire) return localRequire(moduleName, true);
        throw new Error("Cannot locate module '" + moduleName + "'");
      }
      // Create a new module entry in cache
      var modExports = modCache[moduleName] = {exports:{}};
      // Execute the module's definition function
      modSources[moduleName][0].call(modExports.exports, function(depName){
        // Resolve module dependencies recursively
        var resolvedDep = modSources[moduleName][1][depName];
        return resolver(resolvedDep ? resolvedDep : depName);
      }, modExports, modExports.exports);
    }
    return modCache[moduleName].exports;
  }
  // Capture global require if available
  var localRequire = typeof require === "function" && require;
  // Load all specified initial modules
  for(var currentIdx = 0; currentIdx < modNames.length; currentIdx++) resolver(modNames[currentIdx]);
  return resolver;
})({1:[function(getDependency, currentModule, moduleExports){
  // Main application entry point and presenter logic.
  var ApplicationPresenter, StatusDisplay, ControlPanel, Listener, ColorManager, Visualizer, DataSource, Notifier, ActionButtons, HelperFunctions, appPresenterInstance,
    // Utility for checking object's own properties during inheritance
    __hasOwnProperty = {}.hasOwnProperty,
    // Custom function for extending classes (CoffeeScript style)
    __extendClass = function(derivedClass, baseClass) {
      for (var propKey in baseClass) {
        if (__hasOwnProperty.call(baseClass, propKey)) derivedClass[propKey] = baseClass[propKey];
      }
      function constructorRef() { this.constructor = derivedClass; }
      constructorRef.prototype = baseClass.prototype;
      derivedClass.prototype = new constructorRef();
      derivedClass.__super__ = baseClass.prototype;
      return derivedClass;
    };

  // Import all necessary modules
  Notifier = getDependency('./Notifier.coffee');
  Listener = getDependency('./Listener.coffee');
  HelperFunctions = getDependency('./HelperFunctions.coffee');
  ColorManager = getDependency('./ColorManager.coffee');
  DataSource = getDependency('./DataSource.coffee');
  ActionButtons = getDependency('./ActionButtons.coffee');
  ControlPanel = getDependency('./ControlPanel.coffee');
  StatusDisplay = getDependency('./StatusDisplay.coffee');
  Visualizer = getDependency('./Visualizer.coffee');

  // Definition of the main ApplicationPresenter class
  ApplicationPresenter = (function(_super) {
    __extendClass(ApplicationPresenter, _super);

    // References to other application components
    ApplicationPresenter.prototype.dataSourceRef = null;
    ApplicationPresenter.prototype.actionButtonsRef = null;
    ApplicationPresenter.prototype.controlPanelRef = null;
    ApplicationPresenter.prototype.statusDisplayRef = null;
    ApplicationPresenter.prototype.visualizerRef = null;
    ApplicationPresenter.prototype.colorManagerRef = null;
    ApplicationPresenter.prototype.colorPalette = null;

    /**
     * Constructor for the ApplicationPresenter.
     * Initializes all core components and establishes communication.
     */
    function ApplicationPresenter() {
      // Initialize data source and subscribe for data events
      this.dataSourceRef = new DataSource();
      this.dataSourceRef.subscribe(this);
      this.dataSourceRef.fetchData();

      // Initialize action buttons and subscribe for UI events
      this.actionButtonsRef = new ActionButtons('#controlPanel');
      this.actionButtonsRef.subscribe(this);

      // Initialize control panel and subscribe for menu events
      this.controlPanelRef = new ControlPanel('#navigation');
      this.controlPanelRef.subscribe(this);

      // Initialize status display and subscribe for info panel events
      this.statusDisplayRef = new StatusDisplay('#statusPanel');
      this.statusDisplayRef.subscribe(this);

      // Initialize visualizer and subscribe for rendering events
      this.visualizerRef = new Visualizer();
      this.visualizerRef.subscribe(this);
    }

    /**
     * Central notification handler for all subscribed components.
     * Delegates events to specific handlers based on the originator.
     * @param {object} originator - The object that sent the notification.
     * @param {string} eventKind - The type of event.
     * @param {object} eventPayload - Data associated with the event.
     */
    ApplicationPresenter.prototype.receiveNotification = function(originator, eventKind, eventPayload) {
      if (originator instanceof DataSource) {
        this.onDataSourceEvent(eventKind, eventPayload);
      }
      if (originator instanceof ActionButtons) {
        this.onActionButtonsEvent(eventKind, eventPayload);
      }
      if (originator instanceof ControlPanel) {
        this.onControlPanelEvent(eventKind, eventPayload);
      }
      if (originator instanceof Visualizer) {
        return this.onVisualizerEvent(eventKind, eventPayload);
      }
    };

    /**
     * Handles events specifically from the DataSource.
     * @param {string} eventKind - Type of event from DataSource.
     * @param {object} eventPayload - Data from DataSource event.
     */
    ApplicationPresenter.prototype.onDataSourceEvent = function(eventKind, eventPayload) {
      switch (eventKind) {
        case DataSource.DATA_LOAD_COMPLETE:
          this.statusDisplayRef.showMessage("Processed " + (this.dataSourceRef.getPointCount()) + " data points.");
          this.statusDisplayRef.showMessage("Identified " + (this.dataSourceRef.getGroupCount()) + " data groups.");
          return this.setupApplication(); // Proceed with app setup once data is ready
        case DataSource.SCREENSHOT_SUCCESS:
          return this.statusDisplayRef.showMessage("Screenshot " + (this.dataSourceRef.getSaved()) + " successfully captured.");
      }
    };

    /**
     * Handles events specifically from the ActionButtons.
     * @param {string} eventKind - Type of event from ActionButtons.
     * @param {object} eventPayload - Data from ActionButtons event.
     */
    ApplicationPresenter.prototype.onActionButtonsEvent = function(eventKind, eventPayload) {
      var currentStatus; // Variable to store UI component visibility state
      switch (eventKind) {
        case ActionButtons.MENU_BUTTON_CLICKED:
          currentStatus = this.controlPanelRef.switchVisibility();
          return this.actionButtonsRef.markControlButtonActive(currentStatus);
        case ActionButtons.INFO_BUTTON_CLICKED:
          currentStatus = this.statusDisplayRef.switchVisibility();
          return this.actionButtonsRef.markStatusButtonActive(currentStatus);
        case ActionButtons.PERSPECTIVE_VIEW_SELECTED:
          this.visualizerRef.setVisualizationMode(Visualizer.VISUALIZATION_MODE.PERSPECTIVE_3D);
          return this.actionButtonsRef.markCameraButtonState(true, false, false);
        case ActionButtons.ORTHOGRAPHIC_VIEW_SELECTED:
          this.visualizerRef.setVisualizationMode(Visualizer.VISUALIZATION_MODE.ORTHOGRAPHIC_2D);
          return this.actionButtonsRef.markCameraButtonState(false, true, false);
        case ActionButtons.DUAL_VIEW_SELECTED:
          this.visualizerRef.setVisualizationMode(Visualizer.VISUALIZATION_MODE.DUAL_VIEW);
          return this.actionButtonsRef.markCameraButtonState(false, false, true);
        case ActionButtons.RESET_VIEW_REQUESTED:
          this.visualizerRef.resetViewpoint(true);
          return this.actionButtonsRef.flashResetButton();
        case ActionButtons.CLEAR_MESSAGES_REQUESTED:
          this.statusDisplayRef.resetMessages();
          return this.actionButtonsRef.flashClearButton();
        case ActionButtons.TOGGLE_BOUNDING_BOX:
          currentStatus = this.visualizerRef.switchBoundingBox();
          return this.actionButtonsRef.markBoundingBoxButtonState(currentStatus);
        case ActionButtons.TOGGLE_VIEWPORT_BOUNDARY:
          currentStatus = this.visualizerRef.switchViewBoundary();
          return this.actionButtonsRef.markViewBoundaryButtonState(currentStatus);
        case ActionButtons.TOGGLE_SELECTION_TOOL:
          currentStatus = this.visualizerRef.switchSelectionTool();
          return this.actionButtonsRef.markSelectionToolButtonState(currentStatus);
        case ActionButtons.VIEW_FROM_TOP:
          this.visualizerRef.adjustViewAngle(HelperFunctions.VIEW_DIRECTION.TOP_DOWN);
          return this.actionButtonsRef.markViewAngleButtonState(true, false, false);
        case ActionButtons.VIEW_FROM_FRONT:
          this.visualizerRef.adjustViewAngle(HelperFunctions.VIEW_DIRECTION.FRONT_ON);
          return this.actionButtonsRef.markViewAngleButtonState(false, true, false);
        case ActionButtons.VIEW_FROM_SIDE:
          this.visualizerRef.adjustViewAngle(HelperFunctions.VIEW_DIRECTION.SIDE_ON);
          return this.actionButtonsRef.markViewAngleButtonState(false, false, true);
        case ActionButtons.ROTATE_LEFT_SELECTED:
          this.visualizerRef.setRotationDirection(Visualizer.ROTATION_DIRECTION.COUNTER_CLOCKWISE);
          return this.actionButtonsRef.markRotationButtonState(true, false, false);
        case ActionButtons.STOP_ROTATION_SELECTED:
          this.visualizerRef.setRotationDirection(Visualizer.ROTATION_DIRECTION.STOPPED);
          return this.actionButtonsRef.markRotationButtonState(false, true, false);
        case ActionButtons.ROTATE_RIGHT_SELECTED:
          this.visualizerRef.setRotationDirection(Visualizer.ROTATION_DIRECTION.CLOCKWISE);
          return this.actionButtonsRef.markRotationButtonState(false, false, true);
        case ActionButtons.TOGGLE_ANIMATION:
          currentStatus = this.visualizerRef.switchAnimationState();
          return this.actionButtonsRef.markAnimationButtonState(currentStatus);
        case ActionButtons.CAPTURE_SCREEN_REQUESTED:
          this.dataSourceRef.captureScreen(this.visualizerRef.getCanvasImage());
          return this.actionButtonsRef.flashCaptureButton();
      }
    };

    /**
     * Handles events specifically from the ControlPanel (menu).
     * @param {string} eventKind - Type of event from ControlPanel.
     * @param {object} eventPayload - Data from ControlPanel event.
     */
    ApplicationPresenter.prototype.onControlPanelEvent = function(eventKind, eventPayload) {
      switch (eventKind) {
        case ControlPanel.TOGGLE_ALL_GROUPS_ON:
          return this.visualizerRef.setAllGroupsVisible(true);
        case ControlPanel.TOGGLE_ALL_GROUPS_OFF:
          return this.visualizerRef.setAllGroupsVisible(false);
        case ControlPanel.TOGGLE_GROUP_BY_ID:
          return this.visualizerRef.toggleGroupVisibility(eventPayload.entityId);
        case ControlPanel.SELECT_GROUP_BY_ID:
          return this.visualizerRef.toggleGroupSelection(eventPayload.entityId);
      }
    };

    /**
     * Handles events specifically from the Visualizer.
     * @param {string} eventKind - Type of event from Visualizer.
     * @param {object} eventPayload - Data from Visualizer event.
     */
    ApplicationPresenter.prototype.onVisualizerEvent = function(eventKind, eventPayload) {
      // Log visualizer events for debugging purposes
      console.log("ApplicationPresenter.onVisualizerEvent " + eventKind + " : " + eventPayload);
      switch (eventKind) {
        case Visualizer.VISUALIZER_DATA_LOADED:
          return console.log("ApplicationPresenter.onVisualizerEvent " + eventKind);
        case Visualizer.POINTS_CHOSEN:
          return this.statusDisplayRef.showMessage("Selected " + eventPayload.points + " data points.");
        case Visualizer.GROUP_CHOSEN:
          if (eventPayload.entityId > -1) {
            return this.statusDisplayRef.showMessage("Data group " + eventPayload.entityId + " chosen");
          } else {
            return this.statusDisplayRef.showMessage("No data group chosen");
          }
      }
    };

    /**
     * Initializes the application's visual components after data is loaded.
     */
    ApplicationPresenter.prototype.setupApplication = function() {
      this.colorManagerRef = new ColorManager(this.dataSourceRef.getGroupCount());
      this.colorPalette = this.colorManagerRef.retrieveColors();
      this.controlPanelRef.buildUI(this.dataSourceRef.getGroupCount(), this.colorManagerRef.retrieveColors());
      this.visualizerRef.applyColors(this.colorPalette);
      this.visualizerRef.loadData(this.dataSourceRef);
      // Start with a default rotation animation
      return this.onActionButtonsEvent(ActionButtons.ROTATE_RIGHT_SELECTED);
    };

    return ApplicationPresenter;

  })(Listener);

  // Create a global instance of the application presenter
  appPresenterInstance = new ApplicationPresenter();

},{
  "./StatusDisplay.coffee":2,
  "./ControlPanel.coffee":3,
  "./Listener.coffee":4,
  "./ColorManager.coffee":5,
  "./Visualizer.coffee":7,
  "./DataSource.coffee":9,
  "./Notifier.coffee":10,
  "./ActionButtons.coffee":11,
  "./HelperFunctions.coffee":12
}],2:[function(getDependency, currentModule, moduleExports){
  // Module for displaying status messages and information.
  var StatusDisplay, UIComponent,
    __hasOwnProperty = {}.hasOwnProperty,
    __extendClass = function(derivedClass, baseClass) {
      for (var propKey in baseClass) {
        if (__hasOwnProperty.call(baseClass, propKey)) derivedClass[propKey] = baseClass[propKey];
      }
      function constructorRef() { this.constructor = derivedClass; }
      constructorRef.prototype = baseClass.prototype;
      derivedClass.prototype = new constructorRef();
      derivedClass.__super__ = baseClass.prototype;
      return derivedClass;
    };

  UIComponent = getDependency('./UIComponent.coffee');

  // Defines the StatusDisplay class, inheriting from UIComponent
  StatusDisplay = (function(_super) {
    __extendClass(StatusDisplay, _super);

    /**
     * Constructor for StatusDisplay.
     * @param {string} elementId - The DOM selector for the status panel.
     */
    function StatusDisplay(elementId) {
      StatusDisplay.__super__.constructor.call(this, elementId);
    }

    /**
     * Appends a message to the status display area.
     * @param {string} displayMessage - The message string to show.
     */
    StatusDisplay.prototype.showMessage = function(displayMessage) {
      return $('#outputLog').append(displayMessage + "<br/>");
    };

    /**
     * Clears all messages from the status display area.
     */
    StatusDisplay.prototype.resetMessages = function() {
      return $('#outputLog').text("");
    };

    return StatusDisplay;

  })(UIComponent);

  currentModule.exports = StatusDisplay;

},{
  "./UIComponent.coffee":6
}],3:[function(getDependency, currentModule, moduleExports){
  // Module for the interactive control panel (menu).
  var ControlPanel, UIComponent,
    // Helper function to bind a method's 'this' context
    __bindMethod = function(methodFunc, contextObj){ return function(){ return methodFunc.apply(contextObj, arguments); }; },
    __hasOwnProperty = {}.hasOwnProperty,
    __extendClass = function(derivedClass, baseClass) {
      for (var propKey in baseClass) {
        if (__hasOwnProperty.call(baseClass, propKey)) derivedClass[propKey] = baseClass[propKey];
      }
      function constructorRef() { this.constructor = derivedClass; }
      constructorRef.prototype = baseClass.prototype;
      derivedClass.prototype = new constructorRef();
      derivedClass.__super__ = baseClass.prototype;
      return derivedClass;
    };

  UIComponent = getDependency('./UIComponent.coffee');

  // Defines the ControlPanel class, inheriting from UIComponent
  ControlPanel = (function(_super) {
    __extendClass(ControlPanel, _super);

    // Event constants for notifying about menu actions
    ControlPanel.TOGGLE_ALL_GROUPS_ON = "TOGGLE_ALL_GROUPS_ON_EVENT";
    ControlPanel.TOGGLE_ALL_GROUPS_OFF = "TOGGLE_ALL_GROUPS_OFF_EVENT";
    ControlPanel.TOGGLE_GROUP_BY_ID = "TOGGLE_GROUP_BY_ID_EVENT";
    ControlPanel.SELECT_GROUP_BY_ID = "SELECT_GROUP_BY_ID_EVENT";

    // Text labels for toggle button states
    ControlPanel.STATE_ACTIVE = "[ON]";
    ControlPanel.STATE_INACTIVE = "[OFF]";
    ControlPanel.STATE_MIXED = "[MIX]";

    ControlPanel.prototype.groupCount = 0; // Total number of data groups
    ControlPanel.prototype.chosenIndex = -1; // Index of the currently selected group
    ControlPanel.prototype.colorArray = null; // Array of colors for groups

    /**
     * Constructor for ControlPanel.
     * Binds event handlers and calls super constructor.
     * @param {string} elementId - The DOM selector for the control panel.
     */
    function ControlPanel(elementId) {
      this.handleGroupSelection = __bindMethod(this.handleGroupSelection, this);
      this.handleGroupToggle = __bindMethod(this.handleGroupToggle, this);
      this.handleAllGroupsToggle = __bindMethod(this.handleAllGroupsToggle, this);
      ControlPanel.__super__.constructor.call(this, elementId);
    }

    /**
     * Handles the click event for the "toggle all groups" button.
     * Switches the state of all group toggles and notifies.
     * @param {Event} domEvent - The DOM click event.
     */
    ControlPanel.prototype.handleAllGroupsToggle = function(domEvent) {
      var itemIndex, currentStatus, _i, _j, _ref, _ref1;
      currentStatus = $("#toggleAllGroups").text();
      switch (currentStatus) {
        case ControlPanel.STATE_INACTIVE:
        case ControlPanel.STATE_MIXED:
          $("#toggleAllGroups").text(ControlPanel.STATE_ACTIVE);
          for (itemIndex = _i = 0, _ref = this.groupCount; 0 <= _ref ? _i < _ref : _i > _ref; itemIndex = 0 <= _ref ? ++_i : --_i) {
            $("#toggleBtn" + String(itemIndex)).text(ControlPanel.STATE_ACTIVE);
          }
          return this.notify(ControlPanel.TOGGLE_ALL_GROUPS_ON);
        case ControlPanel.STATE_ACTIVE:
          $("#toggleAllGroups").text(ControlPanel.STATE_INACTIVE);
          for (itemIndex = _j = 0, _ref1 = this.groupCount; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; itemIndex = 0 <= _ref1 ? ++_j : --_j) {
            $("#toggleBtn" + String(itemIndex)).text(ControlPanel.STATE_INACTIVE);
          }
          return this.notify(ControlPanel.TOGGLE_ALL_GROUPS_OFF);
      }
    };

    /**
     * Handles the click event for an individual group toggle button.
     * Toggles its state and notifies about the specific group.
     * @param {Event} domEvent - The DOM click event.
     */
    ControlPanel.prototype.handleGroupToggle = function(domEvent) {
      var entityId, domElementId, itemIndex;
      domElementId = domEvent.target.id;
      entityId = domElementId.replace("toggleBtn", "");
      itemIndex = parseInt(entityId);
      this.performToggle(itemIndex);
      return this.notify(ControlPanel.TOGGLE_GROUP_BY_ID, {
        entityId: itemIndex
      });
    };

    /**
     * Handles the click event for an individual group selection button.
     * Toggles its selection state and notifies.
     * @param {Event} domEvent - The DOM click event.
     */
    ControlPanel.prototype.handleGroupSelection = function(domEvent) {
      var itemIndex;
      itemIndex = parseInt(domEvent.target.id.replace("selectBtn", ""));
      if (this.chosenIndex === itemIndex) {
        this.chosenIndex = -1; // Deselect if already chosen
      } else {
        this.chosenIndex = itemIndex; // Select new group
      }
      this.refreshColorSwatches();
      this.refreshActionButtons();
      return this.notify(ControlPanel.SELECT_GROUP_BY_ID, {
        entityId: itemIndex
      });
    };

    /**
     * Performs the actual state change for a single group toggle button.
     * @param {number} itemIndex - The index of the group to toggle.
     */
    ControlPanel.prototype.performToggle = function(itemIndex) {
      var currentStatus, htmlTag;
      htmlTag = "#toggleBtn" + String(itemIndex);
      currentStatus = $(htmlTag).text();
      switch (currentStatus) {
        case ControlPanel.STATE_ACTIVE:
          $(htmlTag).text(ControlPanel.STATE_INACTIVE);
          break;
        case ControlPanel.STATE_INACTIVE:
          $(htmlTag).text(ControlPanel.STATE_ACTIVE);
      }
      return this.refreshGlobalToggle(); // Update the "toggle all" button
    };

    /**
     * Dynamically builds the control panel UI based on provided group data.
     * @param {number} groupQuantity - The total number of data groups.
     * @param {Array<THREE.Color>} colorsForGroups - Array of colors for each group.
     */
    ControlPanel.prototype.buildUI = function(groupQuantity, colorsForGroups) {
      var itemIndex, htmlContent, _i, _j, _ref, _ref1;
      this.groupCount = groupQuantity;
      this.colorArray = colorsForGroups;

      for (itemIndex = _i = 0, _ref = this.groupCount; 0 <= _ref ? _i < _ref : _i > _ref; itemIndex = 0 <= _ref ? ++_i : --_i) {
        // Construct HTML for each group's toggle, select button, and color swatch
        htmlContent = "<span class='group-toggle' id='toggleBtn" + itemIndex + "'>[ON]</span>" +
                      "<span class='group-button' id='selectBtn" + itemIndex + "'> Group </span>" +
                      "<span class='group-color-swatch' id='swatch" + itemIndex + "'> " + itemIndex + " </span><br/>";
        $("#navigation").append(htmlContent);
      }

      // Attach event listener for the master toggle
      $("#toggleAllGroups").click(this.handleAllGroupsToggle);

      // Attach event listeners for individual group buttons
      for (itemIndex = _j = 0, _ref1 = this.groupCount; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; itemIndex = 0 <= _ref1 ? ++_j : --_j) {
        $("#toggleBtn" + String(itemIndex)).click(this.handleGroupToggle);
        $("#selectBtn" + String(itemIndex)).click(this.handleGroupSelection);
      }
      return this.refreshColorSwatches(); // Update initial swatch colors
    };

    /**
     * Counts how many individual group toggles are currently in the 'ON' state.
     * @returns {number} The count of active toggles.
     */
    ControlPanel.prototype.activeTogglesCount = function() {
      var itemIndex, resultCount, currentStatus, htmlTag, _i, _ref;
      resultCount = 0;
      for (itemIndex = _i = 0, _ref = this.groupCount; 0 <= _ref ? _i < _ref : _i > _ref; itemIndex = 0 <= _ref ? ++_i : --_i) {
        htmlTag = "#toggleBtn" + String(itemIndex);
        currentStatus = $(htmlTag).text();
        if (currentStatus === ControlPanel.STATE_ACTIVE) {
          resultCount++;
        }
      }
      return resultCount;
    };

    /**
     * Updates the text of the main "toggle all groups" button
     * to reflect the combined state of individual group toggles.
     */
    ControlPanel.prototype.refreshGlobalToggle = function() {
      var visibleCount;
      visibleCount = this.activeTogglesCount();
      switch (visibleCount) {
        case 0:
          return $("#toggleAllGroups").text(ControlPanel.STATE_INACTIVE);
        case this.groupCount:
          return $("#toggleAllGroups").text(ControlPanel.STATE_ACTIVE);
        default:
          return $("#toggleAllGroups").text(ControlPanel.STATE_MIXED);
      }
    };

    /**
     * Updates the display color of each group's color swatch.
     * Highlights the selected group's swatch.
     */
    ControlPanel.prototype.refreshColorSwatches = function() {
      var itemIndex, _i, _ref, _results;
      _results = [];
      for (itemIndex = _i = 0, _ref = this.groupCount; 0 <= _ref ? _i < _ref : _i > _ref; itemIndex = 0 <= _ref ? ++_i : --_i) {
        if (itemIndex === this.chosenIndex) {
          _results.push($("#swatch" + String(itemIndex)).css('color', ColorManager.SELECTION_HIGHLIGHT.getStyle()));
        } else {
          _results.push($("#swatch" + String(itemIndex)).css('color', this.colorArray[itemIndex].getStyle()));
        }
      }
      return _results;
    };

    /**
     * Updates the visual style of each group's selection button.
     * Highlights the button for the selected group.
     */
    ControlPanel.prototype.refreshActionButtons = function() {
      var itemIndex, _i, _ref, _results;
      _results = [];
      for (itemIndex = _i = 0, _ref = this.groupCount; 0 <= _ref ? _i < _ref : _i > _ref; itemIndex = 0 <= _ref ? ++_i : --_i) {
        if (itemIndex === this.chosenIndex) {
          _results.push($("#selectBtn" + String(itemIndex)).css('color', ColorManager.SELECTION_HIGHLIGHT.getStyle()));
        } else {
          _results.push($("#selectBtn" + String(itemIndex)).css('color', ColorManager.DEFAULT_BUTTON_COLOR.getStyle()));
        }
      }
      return _results;
    };

    return ControlPanel;

  })(UIComponent);

  currentModule.exports = ControlPanel;

},{
  "./UIComponent.coffee":6
}],4:[function(getDependency, currentModule, moduleExports){
  // Base class for objects that can receive notifications from Notifiers.
  var Listener;

  // Defines the Listener class.
  Listener = (function() {
    /**
     * Constructor for Listener.
     */
    function Listener() {}

    /**
     * Default method to receive notifications.
     * Should be overridden by concrete listener implementations.
     * @param {object} originator - The object that sent the notification.
     * @param {string} eventKind - The type of event.
     * @param {object} eventPayload - Data associated with the event.
     */
    Listener.prototype.receiveNotification = function(originator, eventKind, eventPayload) {};

    return Listener;

  })();

  currentModule.exports = Listener;

},{
}],5:[function(getDependency, currentModule, moduleExports){
  // Manages the generation and provision of colors for data visualization.
  var ColorManager;

  // Defines the ColorManager class.
  ColorManager = (function() {
    // Predefined color constants for various UI elements and rendering.
    // Assumes THREE.Color is available (e.g., from THREE.js library).
    ColorManager.CANVAS_BACKGROUND = new THREE.Color(0x1a1a1a);
    ColorManager.SELECTION_HIGHLIGHT = new THREE.Color(0xFFFFFF);
    ColorManager.SELECTION_RECTANGLE = new THREE.Color(0xCC0000);
    ColorManager.DEFAULT_BUTTON_COLOR = new THREE.Color(0xCCCCCC);
    ColorManager.ACTIVE_BUTTON_COLOR = new THREE.Color(0xFF9900);

    ColorManager.prototype.colorArray = null; // Stores the generated color palette.

    /**
     * Constructor for ColorManager.
     * @param {number} itemQuantity - The number of distinct colors to generate.
     */
    function ColorManager(itemQuantity) {
      this.colorArray = new Array();
      this.createColorSet(itemQuantity);
    }

    /**
     * Generates a set of distinct colors using HSL color space.
     * Colors are distributed evenly across the hue spectrum.
     * @param {number} itemQuantity - The number of colors to generate.
     */
    ColorManager.prototype.createColorSet = function(itemQuantity) {
      var singleColor, hueValue, satValue, lightValue, increment, itemIndex, _i, _results;
      hueValue = 0;
      satValue = 0.75; // Constant saturation
      lightValue = 0.5; // Constant lightness
      increment = 1 / itemQuantity; // Step size for hue
      _results = [];
      for (itemIndex = _i = 0; 0 <= itemQuantity ? _i < itemQuantity : _i > itemQuantity; itemIndex = 0 <= itemQuantity ? ++_i : --_i) {
        hueValue = (itemIndex + 1) * increment; // Increment hue
        singleColor = new THREE.Color();
        singleColor.setHSL(hueValue, satValue, lightValue);
        _results.push(this.colorArray.push(singleColor));
      }
      return _results;
    };

    /**
     * Retrieves the array of generated colors.
     * @returns {Array<THREE.Color>} An array of THREE.Color objects.
     */
    ColorManager.prototype.retrieveColors = function() {
      return this.colorArray;
    };

    /**
     * Logs details of each generated color to the console.
     * Includes HSL values and CSS style string.
     */
    ColorManager.prototype.logColors = function() {
      var colorObject, styleString, hslObject, hueValue, itemIndex, lightValue, satValue, _i, _len, _ref, _results;
      itemIndex = 0;
      _ref = this.colorArray;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        colorObject = _ref[_i];
        styleString = colorObject.getStyle();
        hslObject = colorObject.getHSL();
        hueValue = hslObject.h.toFixed(1);
        satValue = hslObject.s.toFixed(1);
        lightValue = hslObject.l.toFixed(1);
        _results.push(console.log(itemIndex++ + " >> H:" + hueValue + " S:" + satValue + " L:" + lightValue + " | CSS:" + styleString));
      }
      return _results;
    };

    return ColorManager;

  })();

  currentModule.exports = ColorManager;

},{
}],6:[function(getDependency, currentModule, moduleExports){
  // Base class for UI components that can be shown/hidden and emit events.
  var UIComponent, Notifier,
    __hasOwnProperty = {}.hasOwnProperty,
    __extendClass = function(derivedClass, baseClass) {
      for (var propKey in baseClass) {
        if (__hasOwnProperty.call(baseClass, propKey)) derivedClass[propKey] = baseClass[propKey];
      }
      function constructorRef() { this.constructor = derivedClass; }
      constructorRef.prototype = baseClass.prototype;
      derivedClass.prototype = new constructorRef();
      derivedClass.__super__ = baseClass.prototype;
      return derivedClass;
    };

  Notifier = getDependency('./Notifier.coffee');

  // Defines the UIComponent class, inheriting from Notifier.
  UIComponent = (function(_super) {
    __extendClass(UIComponent, _super);

    // Event constants for component visibility changes.
    UIComponent.COMPONENT_REVEALED = "COMPONENT_REVEALED_EVENT";
    UIComponent.COMPONENT_CONCEALED = "COMPONENT_CONCEALED_EVENT";

    UIComponent.prototype.isVisible = true; // Current visibility state.
    UIComponent.prototype.elementId = null; // DOM selector for the component.

    /**
     * Constructor for UIComponent.
     * @param {string} elementId - The DOM selector for the component.
     */
    function UIComponent(elementId) {
      this.elementId = elementId;
      UIComponent.__super__.constructor.call(this);
    }

    /**
     * Makes the UI component visible in the DOM.
     * Notifies listeners that the component has been revealed.
     */
    UIComponent.prototype.revealPanel = function() {
      $(this.elementId).show();
      this.isVisible = true;
      return this.notify(UIComponent.COMPONENT_REVEALED);
    };

    /**
     * Hides the UI component from the DOM.
     * Notifies listeners that the component has been concealed.
     */
    UIComponent.prototype.concealPanel = function() {
      $(this.elementId).hide();
      this.isVisible = false;
      return this.notify(UIComponent.COMPONENT_CONCEALED);
    };

    /**
     * Toggles the visibility state of the UI component.
     * If visible, it hides it; if hidden, it reveals it.
     * @returns {boolean} The new visibility state.
     */
    UIComponent.prototype.switchVisibility = function() {
      if (this.isVisible) {
        this.concealPanel();
      } else {
        this.revealPanel();
      }
      return this.isVisible;
    };

    return UIComponent;

  })(Notifier);

  currentModule.exports = UIComponent;

},{
  "./Notifier.coffee":10
}],7:[function(getDependency, currentModule, moduleExports){
  // Placeholder module for the 3D data visualizer.
  // In a real application, this would contain THREE.js or WebGL rendering logic.
  var Visualizer, Listener,
    __hasOwnProp = {}.hasOwnProperty,
    __extends = function(childClass, parentClass) {
      for (var propName in parentClass) {
        if (__hasOwnProp.call(parentClass, propName)) childClass[propName] = parentClass[propName];
      }
      function Ctor() { this.constructor = childClass; }
      Ctor.prototype = parentClass.prototype;
      childClass.prototype = new Ctor();
      childClass.__super__ = parentClass.prototype;
      return childClass;
    };

  Listener = getDependency('./Listener.coffee'); // Visualizer is a Listener

  // Defines the Visualizer class.
  Visualizer = (function(_super) {
    __extends(Visualizer, _super);

    // Constants for different visualization modes.
    Visualizer.VISUALIZATION_MODE = {
      PERSPECTIVE_3D: 'PERSPECTIVE_3D',
      ORTHOGRAPHIC_2D: 'ORTHOGRAPHIC_2D',
      DUAL_VIEW: 'DUAL_VIEW'
    };

    // Constants for rotation directions.
    Visualizer.ROTATION_DIRECTION = {
      COUNTER_CLOCKWISE: 'LEFT',
      STOPPED: 'NONE',
      CLOCKWISE: 'RIGHT'
    };

    // Event constants for notifying about visualizer state changes.
    Visualizer.VISUALIZER_DATA_LOADED = "VISUALIZER_DATA_LOADED_EVENT";
    Visualizer.POINTS_CHOSEN = "POINTS_CHOSEN_EVENT";
    Visualizer.GROUP_CHOSEN = "GROUP_CHOSEN_EVENT";

    /**
     * Constructor for Visualizer.
     * Initializes internal state variables.
     */
    function Visualizer() {
      Visualizer.__super__.constructor.call(this);
      // Default state for various visualizer features
      this.currentMode = Visualizer.VISUALIZATION_MODE.PERSPECTIVE_3D;
      this.isBoxVisible = false;
      this.isViewportVisible = false;
      this.isSelectorActive = false;
      this.isAnimationPlaying = false;
      this.currentRotation = Visualizer.ROTATION_DIRECTION.STOPPED;
    }

    /**
     * Sets the current visualization mode (e.g., 3D perspective, 2D orthographic).
     * @param {string} newMode - The new visualization mode.
     */
    Visualizer.prototype.setVisualizationMode = function(newMode) {
      this.currentMode = newMode;
      // Actual implementation would involve changing camera projection or scene setup.
    };

    /**
     * Resets the camera viewpoint to a default position.
     * @param {boolean} instant - If true, reset immediately; otherwise, animate.
     */
    Visualizer.prototype.resetViewpoint = function(instant) {
      // Placeholder for camera reset logic.
    };

    /**
     * Toggles the visibility of a bounding box around the visualized data.
     * @returns {boolean} The new visibility state of the bounding box.
     */
    Visualizer.prototype.switchBoundingBox = function() {
      this.isBoxVisible = !this.isBoxVisible;
      return this.isBoxVisible;
    };

    /**
     * Toggles the visibility of a viewport boundary or frame.
     * @returns {boolean} The new visibility state of the viewport boundary.
     */
    Visualizer.prototype.switchViewBoundary = function() {
      this.isViewportVisible = !this.isViewportVisible;
      return this.isViewportVisible;
    };

    /**
     * Toggles the activation state of a data selection tool.
     * @returns {boolean} The new activation state of the selection tool.
     */
    Visualizer.prototype.switchSelectionTool = function() {
      this.isSelectorActive = !this.isSelectorActive;
      return this.isSelectorActive;
    };

    /**
     * Adjusts the camera view angle to a predefined direction.
     * @param {string} direction - The desired view direction (e.g., 'TOP', 'FRONT').
     */
    Visualizer.prototype.adjustViewAngle = function(direction) {
      // Placeholder for camera angle adjustment logic.
    };

    /**
     * Sets the continuous rotation direction for the visualization.
     * @param {string} direction - The desired rotation direction ('LEFT', 'NONE', 'RIGHT').
     */
    Visualizer.prototype.setRotationDirection = function(direction) {
      this.currentRotation = direction;
      // Placeholder for rotation animation control.
    };

    /**
     * Toggles the animation state of the visualization.
     * @returns {boolean} The new animation playing state.
     */
    Visualizer.prototype.switchAnimationState = function() {
      this.isAnimationPlaying = !this.isAnimationPlaying;
      return this.isAnimationPlaying;
    };

    /**
     * Captures the current visualizer canvas as an image.
     * @returns {string} A dummy base64 encoded image data string.
     */
    Visualizer.prototype.getCanvasImage = function() {
      // In a real implementation, this would render the scene to an image.
      return "base64encodedimagedata";
    };

    /**
     * Sets the visibility for all data groups in the visualization.
     * @param {boolean} visible - True to show all groups, false to hide.
     */
    Visualizer.prototype.setAllGroupsVisible = function(visible) {
      // Placeholder for logic to control visibility of all groups.
    };

    /**
     * Toggles the visibility of a specific data group.
     * @param {number} entityId - The ID of the group whose visibility to toggle.
     */
    Visualizer.prototype.toggleGroupVisibility = function(entityId) {
      // Placeholder for logic to toggle visibility of a single group.
    };

    /**
     * Toggles the selection state of a specific data group.
     * @param {number} entityId - The ID of the group whose selection to toggle.
     */
    Visualizer.prototype.toggleGroupSelection = function(entityId) {
      // Placeholder for logic to toggle selection of a single group.
    };

    /**
     * Applies a set of colors to the visualized data groups.
     * @param {Array<THREE.Color>} colorArray - An array of color objects.
     */
    Visualizer.prototype.applyColors = function(colorArray) {
      this.colorsUsed = colorArray;
      // Placeholder for applying colors to 3D objects.
    };

    /**
     * Loads data from a DataSource into the visualizer.
     * Simulates data loading and emits notification events.
     * @param {DataSource} dataSourceRef - Reference to the DataSource instance.
     */
    Visualizer.prototype.loadData = function(dataSourceRef) {
      this.dataSourceRef = dataSourceRef;
      console.log("Visualizer: Data loaded from DataSource (simulated).");
      this.notify(Visualizer.VISUALIZER_DATA_LOADED);
      // Simulate some selection events for initial state or testing
      this.notify(Visualizer.POINTS_CHOSEN, { points: 1234 });
      this.notify(Visualizer.GROUP_CHOSEN, { entityId: 5 });
    };

    return Visualizer;

  })(Listener);

  currentModule.exports = Visualizer;

},{
  "./Listener.coffee":4
}],8:[function(getDependency, currentModule, moduleExports){
  // This module ID (8) was not explicitly used in the original module mapping.
  // It is included here to maintain the numerical sequence of module IDs,
  // matching the original's implicit structure for module resolution.
  // No content is expected for this module based on the provided source.

},{}],9:[function(getDependency, currentModule, moduleExports){
  // Manages the application's data, including fetching and screenshot operations.
  var DataSource, Notifier,
    __hasOwnProperty = {}.hasOwnProperty,
    __extendClass = function(derivedClass, baseClass) {
      for (var propKey in baseClass) {
        if (__hasOwnProperty.call(baseClass, propKey)) derivedClass[propKey] = baseClass[propKey];
      }
      function constructorRef() { this.constructor = derivedClass; }
      constructorRef.prototype = baseClass.prototype;
      derivedClass.prototype = new constructorRef();
      derivedClass.__super__ = baseClass.prototype;
      return derivedClass;
    };

  Notifier = getDependency('./Notifier.coffee');

  // Defines the DataSource class, inheriting from Notifier.
  DataSource = (function(_super) {
    __extendClass(DataSource, _super);

    // Event constants for data-related operations.
    DataSource.DATA_LOAD_COMPLETE = "DATA_LOAD_COMPLETE_EVENT";
    DataSource.SCREENSHOT_SUCCESS = "SCREENSHOT_SUCCESS_EVENT";

    DataSource.prototype.pointCount = 0; // Total number of data points.
    DataSource.prototype.groupCount = 0; // Total number of data groups.
    DataSource.prototype.savedScreenshots = 0; // Counter for saved screenshots.

    /**
     * Constructor for DataSource.
     * Initializes with dummy data counts.
     */
    function DataSource() {
      DataSource.__super__.constructor.call(this);
      this.pointCount = 10000; // Example dummy data point count
      this.groupCount = 10;   // Example dummy data group count
    }

    /**
     * Simulates fetching data and notifies listeners upon completion.
     */
    DataSource.prototype.fetchData = function() {
      // In a real application, this would perform an asynchronous operation
      // like an AJAX request to load actual data from a server or file.
      console.log("DataSource: Fetching data (simulated)...");
      this.notify(DataSource.DATA_LOAD_COMPLETE);
    };

    /**
     * Returns the total count of data points.
     * @returns {number} The number of data points.
     */
    DataSource.prototype.getPointCount = function() {
      return this.pointCount;
    };

    /**
     * Returns the total count of data groups.
     * @returns {number} The number of data groups.
     */
    DataSource.prototype.getGroupCount = function() {
      return this.groupCount;
    };

    /**
     * Simulates saving an image (e.g., a screenshot).
     * Increments the saved screenshots counter and notifies.
     * @param {string} imageData - The image data to be saved (e.g., base64 string).
     */
    DataSource.prototype.captureScreen = function(imageData) {
      console.log("DataSource: Saving image (dummy operation).");
      this.savedScreenshots++;
      this.notify(DataSource.SCREENSHOT_SUCCESS);
    };

    /**
     * Returns the number of screenshots that have been saved.
     * @returns {number} The count of saved screenshots.
     */
    DataSource.prototype.getSaved = function() {
      return this.savedScreenshots;
    };

    return DataSource;

  })(Notifier);

  currentModule.exports = DataSource;

},{
  "./Notifier.coffee":10
}],10:[function(getDependency, currentModule, moduleExports){
  // Base class implementing the Subject pattern for event notification.
  var Notifier;

  // Defines the Notifier class.
  Notifier = (function() {
    /**
     * Constructor for Notifier.
     * Initializes an empty array to hold registered listeners.
     */
    function Notifier() {
      this.listeners = []; // Collection of registered Listener objects.
    }

    /**
     * Adds a new listener to the notification list.
     * @param {Listener} newListener - The listener object to add.
     */
    Notifier.prototype.subscribe = function(newListener) {
      this.listeners.push(newListener);
    };

    /**
     * Removes a listener from the notification list.
     * @param {Listener} oldListener - The listener object to remove.
     */
    Notifier.prototype.unsubscribe = function(oldListener) {
      this.listeners = this.listeners.filter(function(listener) {
        return listener !== oldListener;
      });
    };

    /**
     * Notifies all registered listeners about an event.
     * Each listener's `receiveNotification` method will be called.
     * @param {string} eventKind - The type of event being broadcast.
     * @param {object} eventPayload - An optional data object associated with the event.
     */
    Notifier.prototype.notify = function(eventKind, eventPayload) {
      var _this = this; // Capture 'this' context for use in the forEach loop.
      this.listeners.forEach(function(listener) {
        // Pass the Notifier instance itself as the originator of the event.
        listener.receiveNotification(_this, eventKind, eventPayload);
      });
    };

    return Notifier;

  })();

  currentModule.exports = Notifier;

},{
}],11:[function(getDependency, currentModule, moduleExports){
  // Module for managing the primary action buttons in the user interface.
  var ActionButtons, UIComponent,
    __hasOwnProp = {}.hasOwnProperty,
    __extendClass = function(childClass, parentClass) {
      for (var propName in parentClass) {
        if (__hasOwnProp.call(parentClass, propName)) childClass[propName] = parentClass[propName];
      }
      function Ctor() { this.constructor = childClass; }
      Ctor.prototype = parentClass.prototype;
      childClass.prototype = new Ctor();
      childClass.__super__ = parentClass.prototype;
      return childClass;
    };

  UIComponent = getDependency('./UIComponent.coffee');
  ColorManager = getDependency('./ColorManager.coffee'); // Assuming ColorManager is needed for button colors

  // Defines the ActionButtons class, inheriting from UIComponent.
  ActionButtons = (function(_super) {
    __extendClass(ActionButtons, _super);

    // Event constants representing various button clicks.
    ActionButtons.MENU_BUTTON_CLICKED = "MENU_BUTTON_CLICKED_EVENT";
    ActionButtons.INFO_BUTTON_CLICKED = "INFO_BUTTON_CLICKED_EVENT";
    ActionButtons.PERSPECTIVE_VIEW_SELECTED = "PERSPECTIVE_VIEW_SELECTED_EVENT";
    ActionButtons.ORTHOGRAPHIC_VIEW_SELECTED = "ORTHOGRAPHIC_VIEW_SELECTED_EVENT";
    ActionButtons.DUAL_VIEW_SELECTED = "DUAL_VIEW_SELECTED_EVENT";
    ActionButtons.RESET_VIEW_REQUESTED = "RESET_VIEW_REQUESTED_EVENT";
    ActionButtons.CLEAR_MESSAGES_REQUESTED = "CLEAR_MESSAGES_REQUESTED_EVENT";
    ActionButtons.TOGGLE_BOUNDING_BOX = "TOGGLE_BOUNDING_BOX_EVENT";
    ActionButtons.TOGGLE_VIEWPORT_BOUNDARY = "TOGGLE_VIEWPORT_BOUNDARY_EVENT";
    ActionButtons.TOGGLE_SELECTION_TOOL = "TOGGLE_SELECTION_TOOL_EVENT";
    ActionButtons.VIEW_FROM_TOP = "VIEW_FROM_TOP_EVENT";
    ActionButtons.VIEW_FROM_FRONT = "VIEW_FROM_FRONT_EVENT";
    ActionButtons.VIEW_FROM_SIDE = "VIEW_FROM_SIDE_EVENT";
    ActionButtons.ROTATE_LEFT_SELECTED = "ROTATE_LEFT_SELECTED_EVENT";
    ActionButtons.STOP_ROTATION_SELECTED = "STOP_ROTATION_SELECTED_EVENT";
    ActionButtons.ROTATE_RIGHT_SELECTED = "ROTATE_RIGHT_SELECTED_EVENT";
    ActionButtons.TOGGLE_ANIMATION = "TOGGLE_ANIMATION_EVENT";
    ActionButtons.CAPTURE_SCREEN_REQUESTED = "CAPTURE_SCREEN_REQUESTED_EVENT";

    /**
     * Constructor for ActionButtons.
     * Attaches click event listeners to various UI buttons.
     * @param {string} elementId - The DOM selector for the container of action buttons.
     */
    function ActionButtons(elementId) {
      ActionButtons.__super__.constructor.call(this, elementId);
      // Attach event listeners to specific DOM elements using jQuery selectors.
      // Each click notifies registered listeners about the specific action.
      $('#menuButton').click(() => this.notify(ActionButtons.MENU_BUTTON_CLICKED));
      $('#infoButton').click(() => this.notify(ActionButtons.INFO_BUTTON_CLICKED));
      $('#perspectiveButton').click(() => this.notify(ActionButtons.PERSPECTIVE_VIEW_SELECTED));
      $('#orthographicButton').click(() => this.notify(ActionButtons.ORTHOGRAPHIC_VIEW_SELECTED));
      $('#dualButton').click(() => this.notify(ActionButtons.DUAL_VIEW_SELECTED));
      $('#resetButton').click(() => this.notify(ActionButtons.RESET_VIEW_REQUESTED));
      $('#clearButton').click(() => this.notify(ActionButtons.CLEAR_MESSAGES_REQUESTED));
      $('#boxButton').click(() => this.notify(ActionButtons.TOGGLE_BOUNDING_BOX));
      $('#viewportButton').click(() => this.notify(ActionButtons.TOGGLE_VIEWPORT_BOUNDARY));
      $('#selectButton').click(() => this.notify(ActionButtons.TOGGLE_SELECTION_TOOL));
      $('#topViewButton').click(() => this.notify(ActionButtons.VIEW_FROM_TOP));
      $('#frontViewButton').click(() => this.notify(ActionButtons.VIEW_FROM_FRONT));
      $('#sideViewButton').click(() => this.notify(ActionButtons.VIEW_FROM_SIDE));
      $('#spinLeftButton').click(() => this.notify(ActionButtons.ROTATE_LEFT_SELECTED));
      $('#spinStopButton').click(() => this.notify(ActionButtons.STOP_ROTATION_SELECTED));
      $('#spinRightButton').click(() => this.notify(ActionButtons.ROTATE_RIGHT_SELECTED));
      $('#animateButton').click(() => this.notify(ActionButtons.TOGGLE_ANIMATION));
      $('#printButton').click(() => this.notify(ActionButtons.CAPTURE_SCREEN_REQUESTED));
    }

    /**
     * Sets the visual state (e.g., color) of the control panel toggle button.
     * @param {boolean} isActive - True if the button should appear active.
     */
    ActionButtons.prototype.markControlButtonActive = function(isActive) {
      $('#menuButton').css('color', isActive ? ColorManager.ACTIVE_BUTTON_COLOR.getStyle() : ColorManager.DEFAULT_BUTTON_COLOR.getStyle());
    };

    /**
     * Sets the visual state of the status display toggle button.
     * @param {boolean} isActive - True if the button should appear active.
     */
    ActionButtons.prototype.markStatusButtonActive = function(isActive) {
      $('#infoButton').css('color', isActive ? ColorManager.ACTIVE_BUTTON_COLOR.getStyle() : ColorManager.DEFAULT_BUTTON_COLOR.getStyle());
    };

    /**
     * Updates the visual state of the camera perspective selection buttons.
     * @param {boolean} isPerspective - True if perspective view is selected.
     * @param {boolean} isOrthographic - True if orthographic view is selected.
     * @param {boolean} isDual - True if dual view is selected.
     */
    ActionButtons.prototype.markCameraButtonState = function(isPerspective, isOrthographic, isDual) {
      $('#perspectiveButton').css('color', isPerspective ? ColorManager.ACTIVE_BUTTON_COLOR.getStyle() : ColorManager.DEFAULT_BUTTON_COLOR.getStyle());
      $('#orthographicButton').css('color', isOrthographic ? ColorManager.ACTIVE_BUTTON_COLOR.getStyle() : ColorManager.DEFAULT_BUTTON_COLOR.getStyle());
      $('#dualButton').css('color', isDual ? ColorManager.ACTIVE_BUTTON_COLOR.getStyle() : ColorManager.DEFAULT_BUTTON_COLOR.getStyle());
    };

    /**
     * Briefly flashes the reset button to provide visual feedback.
     */
    ActionButtons.prototype.flashResetButton = function() {
      $('#resetButton').fadeOut(100).fadeIn(100);
    };

    /**
     * Briefly flashes the clear button.
     */
    ActionButtons.prototype.flashClearButton = function() {
      $('#clearButton').fadeOut(100).fadeIn(100);
    };

    /**
     * Sets the visual state of the bounding box toggle button.
     * @param {boolean} isActive - True if the bounding box is active.
     */
    ActionButtons.prototype.markBoundingBoxButtonState = function(isActive) {
      $('#boxButton').css('color', isActive ? ColorManager.ACTIVE_BUTTON_COLOR.getStyle() : ColorManager.DEFAULT_BUTTON_COLOR.getStyle());
    };

    /**
     * Sets the visual state of the viewport boundary toggle button.
     * @param {boolean} isActive - True if the viewport boundary is active.
     */
    ActionButtons.prototype.markViewBoundaryButtonState = function(isActive) {
      $('#viewportButton').css('color', isActive ? ColorManager.ACTIVE_BUTTON_COLOR.getStyle() : ColorManager.DEFAULT_BUTTON_COLOR.getStyle());
    };

    /**
     * Sets the visual state of the selection tool toggle button.
     * @param {boolean} isActive - True if the selection tool is active.
     */
    ActionButtons.prototype.markSelectionToolButtonState = function(isActive) {
      $('#selectButton').css('color', isActive ? ColorManager.ACTIVE_BUTTON_COLOR.getStyle() : ColorManager.DEFAULT_BUTTON_COLOR.getStyle());
    };

    /**
     * Updates the visual state of the predefined view angle buttons.
     * @param {boolean} isTop - True if top view is selected.
     * @param {boolean} isFront - True if front view is selected.
     * @param {boolean} isSide - True if side view is selected.
     */
    ActionButtons.prototype.markViewAngleButtonState = function(isTop, isFront, isSide) {
      $('#topViewButton').css('color', isTop ? ColorManager.ACTIVE_BUTTON_COLOR.getStyle() : ColorManager.DEFAULT_BUTTON_COLOR.getStyle());
      $('#frontViewButton').css('color', isFront ? ColorManager.ACTIVE_BUTTON_COLOR.getStyle() : ColorManager.DEFAULT_BUTTON_COLOR.getStyle());
      $('#sideViewButton').css('color', isSide ? ColorManager.ACTIVE_BUTTON_COLOR.getStyle() : ColorManager.DEFAULT_BUTTON_COLOR.getStyle());
    };

    /**
     * Updates the visual state of the rotation control buttons.
     * @param {boolean} isLeft - True if rotate left is selected.
     * @param {boolean} isStop - True if rotation stop is selected.
     * @param {boolean} isRight - True if rotate right is selected.
     */
    ActionButtons.prototype.markRotationButtonState = function(isLeft, isStop, isRight) {
      $('#spinLeftButton').css('color', isLeft ? ColorManager.ACTIVE_BUTTON_COLOR.getStyle() : ColorManager.DEFAULT_BUTTON_COLOR.getStyle());
      $('#spinStopButton').css('color', isStop ? ColorManager.ACTIVE_BUTTON_COLOR.getStyle() : ColorManager.DEFAULT_BUTTON_COLOR.getStyle());
      $('#spinRightButton').css('color', isRight ? ColorManager.ACTIVE_BUTTON_COLOR.getStyle() : ColorManager.DEFAULT_BUTTON_COLOR.getStyle());
    };

    /**
     * Sets the visual state of the animation toggle button.
     * @param {boolean} isActive - True if animation is active.
     */
    ActionButtons.prototype.markAnimationButtonState = function(isActive) {
      $('#animateButton').css('color', isActive ? ColorManager.ACTIVE_BUTTON_COLOR.getStyle() : ColorManager.DEFAULT_BUTTON_COLOR.getStyle());
    };

    /**
     * Briefly flashes the screenshot capture button.
     */
    ActionButtons.prototype.flashCaptureButton = function() {
      $('#printButton').fadeOut(100).fadeIn(100);
    };

    return ActionButtons;

  })(UIComponent);

  currentModule.exports = ActionButtons;

},{
  "./UIComponent.coffee":6,
  "./ColorManager.coffee":5 // Added explicit dependency for ColorManager
}],12:[function(getDependency, currentModule, moduleExports){
  // Provides a collection of general utility functions and constants.
  var HelperFunctions;

  // Defines the HelperFunctions class.
  HelperFunctions = (function() {
    /**
     * Constructor for HelperFunctions.
     * (No specific initialization logic for this utility class)
     */
    function HelperFunctions() {}

    // Constants for predefined camera view directions.
    HelperFunctions.VIEW_DIRECTION = {
      TOP_DOWN: 'TOP',
      FRONT_ON: 'FRONT',
      SIDE_ON: 'SIDE'
    };

    return HelperFunctions;

  })();

  currentModule.exports = HelperFunctions;

},{
}]});