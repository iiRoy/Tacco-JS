window.SketchCanvas = typeof SketchCanvas !== "undefined" ? SketchCanvas : {};

/**
 * Provides an interactive drawing panel within a specified HTML element.
 *
 * @param {string} elementIdentifier The ID of the HTML element where the drawing panel will be initialized.
 * @param {object} panelConfiguration Optional settings for the drawing panel:
 *   - `toolSet`: An array of tools to include. Default tools are 'ColorTool', 'BrushSize', and 'NavigationTool'.
 *     You can also pass objects for tool-specific configurations, e.g., `['ColorTool', { NavigationTool: { allowReset: false }}]`.
 *   - `controlPlacement`: Defines where the tools are positioned. Default is "top left". Options: "top", "bottom", "left", "right", "center".
 *   - `defaultBackground`: The background color or image URL for the drawing surface. Default is "#ffffff" (white).
 *   - `drawColor`: The initial color for drawing. Default is "#000000" (black).
 *   - `brushSize`: The initial size for the drawing brush. Default is 3.
 *   - `dataPersistence`: 'session', 'local', or `false`. Default is 'session'. Stores the current drawing in web storage.
 *   - `allowImageDrop`: `true` or `false`. If `true`, users can drag-and-drop images onto the canvas to draw over them. Default is `false`.
 *   - `errorDisplayMessage`: HTML string shown if the browser does not support canvas.
 *   - `stretchImageToFit`: `true` or `false`. If `true`, dropped or set images will be stretched to fit the canvas dimensions. Default is `false`.
 */
SketchCanvas.Panel = function(elementIdentifier, panelConfiguration) {
  this.configuration = this.combineSettings(panelConfiguration);

  this.eventNotifier = new SketchCanvas.Helpers.EventPublisher();

  this.domId = elementIdentifier;
  this.$containerElement = $(document.getElementById(elementIdentifier));
  if (!this.$containerElement.length) {
    return false;
  }

  // Define the base HTML structure for the drawing panel
  var layoutMarkup = '<div class="sketch-panel-area-container"></div><canvas class="sketch-panel-drawing-surface"></canvas><div class="sketch-panel-pointer sketch-panel-utils-hidden"></div></div>';
  if (this.configuration.controlPlacement.includes("bottom")) {
    layoutMarkup += '<div class="sketch-panel-user-controls"></div>'; // Controls at the bottom
  } else {
    layoutMarkup = '<div class="sketch-panel-user-controls"></div>' + layoutMarkup; // Controls at the top (default)
  }

  this.$containerElement.addClass('sketch-panel').append(layoutMarkup);
  this.domElements = {
    $drawingAreaContainer: this.$containerElement.find('.sketch-panel-area-container'),
    $drawingSurface: this.$containerElement.find('.sketch-panel-drawing-surface'),
    $drawingPointer: this.$containerElement.find('.sketch-panel-pointer'),
    $userControls: this.$containerElement.find('.sketch-panel-user-controls')
  };

  // Set alignment for the control bar based on configuration
  $.each(['left', 'right', 'center'], $.proxy(function(idx, alignmentValue) {
    if (this.configuration.controlPlacement.includes(alignmentValue)) {
      this.domElements.$userControls.attr('data-alignment', alignmentValue);
      return false; // Break the loop once alignment is found
    }
  }, this));

  this.drawingContext = this.domElements.$drawingSurface.get(0);
  this.graphicContext = this.drawingContext && this.drawingContext.getContext && this.drawingContext.getContext('2d') ? this.drawingContext.getContext('2d') : null;
  this.activeColor = this.configuration.drawColor;

  // If canvas context is not available, display an error message
  if (!this.graphicContext) {
    if (this.configuration.errorDisplayMessage) {
      this.$containerElement.html(this.configuration.errorDisplayMessage);
    }
    return false;
  }

  this.dataStore = this._determineStorageMethod();

  this.setupHistoryTracking();
  // Initialize default drawing parameters (like brush color and size) before tools are added
  this.clearAndConfigure({ dataPersistence: false, versionHistory: false, surfaceBackground: false });
  // Initialize user interface tools (they depend on default panel values)
  this.initializeToolbars();
  // Adjust canvas dimensions after controls are added to the DOM
  this.adjustCanvasSize();
  // Re-apply settings to the resized canvas and record current state
  this.clearAndConfigure({ dataPersistence: false, versionHistory: true, surfaceBackground: true });
  this.recoverPersistentData();
  this.enableDropFunctionality();
  this.activateDrawingHandlers();
};



SketchCanvas.Panel.standardSettings = {
  toolSet: ['ColorTool', 'OperationMode', 'BrushSize', 'NavigationTool'],
  controlPlacement: "top left",
  drawColor: "#000000",
  brushSize: 1,
  defaultBackground: "#fff",
  eraseToolColor: "background",
  floodFillTolerance: 100,
  antiAliasingHack: true, // Attempt to mitigate anti-aliasing artifacts by default
  dataPersistence: 'session',
  allowImageDrop: false,
  expandContainerToFit: false,
  errorDisplayMessage: "<p>It seems your browser is outdated. <a href=\"http://browsehappy.com/\" target=\"_blank\">Please update it</a> to use the drawing panel.</p>",
  stretchImageToFit: false // When setting an image, stretch it to the full canvas size if this option is enabled
};



SketchCanvas.Panel.prototype = {

  /**
   * Merges user-provided settings with default options.
   *
   * @param {object} inputSettings User-defined options.
   * @returns {object} The combined settings.
   */
  combineSettings: function(inputSettings) {
    inputSettings = $.extend({}, SketchCanvas.Panel.standardSettings, inputSettings);
    // If no background is set and eraser color is 'background', default to transparent
    if (!inputSettings.defaultBackground && inputSettings.eraseToolColor === "background") {
      inputSettings.eraseToolColor = "transparent";
    }
    return inputSettings;
  },

  /**
   * Canvas reset and resize operations.
   *
   * Resets the canvas to its default state based on provided options,
   * potentially setting color, size, and background, and saving the state
   * to web storage and history. Canvas dimensions are adjusted according
   * to the `expandContainerToFit` setting.
   *
   * @param {object} resetOptions Options for the reset operation.
   */

  clearAndConfigure: function(resetOptions) {
    resetOptions = $.extend({
      drawColor: this.configuration.drawColor,
      brushSize: this.configuration.brushSize,
      dataPersistence: true,
      versionHistory: true,
      surfaceBackground: false
    }, resetOptions);

    this.setOperationMode('pencil'); // Always start in pencil mode

    if (resetOptions.surfaceBackground) {
      this.resetDrawingBackground(this.configuration.defaultBackground, false);
    }

    if (resetOptions.drawColor) {
      this.setStrokeColor(resetOptions.drawColor);
    }
    if (resetOptions.brushSize) {
      this.graphicContext.lineWidth = resetOptions.brushSize;
    }

    this.graphicContext.lineCap = "round";
    this.graphicContext.lineJoin = "round";
    // this.graphicContext.clearRect(0, 0, this.graphicContext.canvas.width, this.graphicContext.canvas.width); // This line is commented in original

    if (resetOptions.dataPersistence) {
      this.persistToWebStorage();
    }

    if (resetOptions.versionHistory) {
      this.recordRevision();
    }

    this.emptySurfaceImage = this.retrieveImageAsDataUrl();

    this.eventNotifier.trigger('panel:cleared', resetOptions);
  },

  /**
   * Resets the canvas background to a specified color or image.
   *
   * @param {string} newBackground The background color (hex) or image URL.
   * @param {boolean} trackHistory Whether to save this action to history. Defaults to true.
   */
  resetDrawingBackground: function(newBackground, trackHistory) {
    newBackground = newBackground || this.configuration.defaultBackground;
    trackHistory = typeof trackHistory !== "undefined" ? trackHistory : true;
    var isBgAColor = SketchCanvas.Helpers.isColorValue(newBackground);
    var previousOperationMode = this.getCurrentOperationMode();
    this.setOperationMode('pencil'); // Temporarily switch to pencil mode for background operations
    this.graphicContext.clearRect(0, 0, this.graphicContext.canvas.width, this.graphicContext.canvas.height);
    if (isBgAColor) {
      this.graphicContext.fillStyle = newBackground;
      this.graphicContext.fillRect(0, 0, this.graphicContext.canvas.width, this.graphicContext.canvas.height);
    } else if (newBackground) {
      this.setImageContent(newBackground);
    }
    this.setOperationMode(previousOperationMode);
    if (trackHistory) {
      this.recordRevision();
    }
  },

  /**
   * Adjusts the canvas and its container's dimensions.
   *
   * The size adjustment depends on the `expandContainerToFit` option.
   */
  adjustCanvasSize: function() {
    // Toggle hidden class for controls if no controls are present
    this.domElements.$userControls.toggleClass('sketch-panel-controls-hidden', (!this.controls || !this.controls.length));

    var surfaceWidth, surfaceHeight;
    // Calculate total widths considering padding, borders, etc.
    var widthMeasurements = [
      this.$containerElement.width(),
      SketchCanvas.Helpers.getElementBorderWidth(this.$containerElement),
      SketchCanvas.Helpers.getElementBorderWidth(this.domElements.$drawingAreaContainer, true, true)
    ];
    // Calculate total heights considering padding, borders, etc., including control bar height
    var heightMeasurements = [
      this.$containerElement.height(),
      SketchCanvas.Helpers.getElementBorderHeight(this.$containerElement),
      this.domElements.$userControls.height(),
      SketchCanvas.Helpers.getElementBorderHeight(this.domElements.$userControls, false, true),
      SketchCanvas.Helpers.getElementBorderHeight(this.domElements.$drawingAreaContainer, true, true)
    ];
    var selfRef = this; // Reference to 'this' for nested functions
    var calculateTotal = function(valuesArray, multiplier) { // Sum all values in an array
      multiplier = multiplier || 1;
      var total = valuesArray[0];
      for (var i = 1; i < valuesArray.length; i++) {
        total = total + (valuesArray[i] * multiplier);
      }
      return total;
    };
    var calculateDifference = function(valuesArray) { // Subtract all subsequent values from the first
      return calculateTotal(valuesArray, -1);
    };

    if (this.configuration.expandContainerToFit) {
      surfaceWidth = this.$containerElement.width();
      surfaceHeight = this.$containerElement.height();

      this.$containerElement.width( calculateTotal(widthMeasurements) );
      this.$containerElement.height( calculateTotal(heightMeasurements) );
    } else {
      surfaceWidth = calculateDifference(widthMeasurements);
      surfaceHeight = calculateDifference(heightMeasurements);
    }

    // Apply calculated dimensions to canvas wrapper and canvas itself
    this.domElements.$drawingAreaContainer.css('width', surfaceWidth + 'px');
    this.domElements.$drawingAreaContainer.css('height', surfaceHeight + 'px');

    this.domElements.$drawingSurface.css('width', surfaceWidth + 'px');
    this.domElements.$drawingSurface.css('height', surfaceHeight + 'px');

    this.drawingContext.width = surfaceWidth;
    this.drawingContext.height = surfaceHeight;
  },



  /**
   * Toolbars:
   * The drawing panel can integrate various UI tools.
   * Each tool is represented by a class within the `SketchCanvas.Tool` namespace.
   * A tool must have a `$el` property (jQuery object) representing its HTML element.
   *
   */

  initializeToolbars: function() {
    this.controls = [];
    if (!this.configuration.toolSet.length || !SketchCanvas.Tool) {
      return false;
    }
    for (var toolIdx = 0; toolIdx < this.configuration.toolSet.length; toolIdx++) {
      var currentTool = null;
      if (typeof this.configuration.toolSet[toolIdx] == "string") {
        currentTool = new window['SketchCanvas']['Tool'][this.configuration.toolSet[toolIdx]](this);
      } else if (typeof this.configuration.toolSet[toolIdx] == "object") {
        // Extract the tool identifier from the object key
        for (var toolIdentifier in this.configuration.toolSet[toolIdx]) {
          break;
        }
        currentTool = new window['SketchCanvas']['Tool'][toolIdentifier](this, this.configuration.toolSet[toolIdx][toolIdentifier]);
      }
      if (currentTool) {
        this.appendTool(currentTool);
      }
    }
  },

  /**
   * Adds a new tool component to the panel, or places an existing one.
   *
   * @param {string|object} toolComponent Either a string representing the tool class name, or an instance of SketchCanvas.Tool.
   * @param {object|number} settingsOrPosition Optional settings for the tool, or the numerical position for insertion.
   * @param {number} placementIndex The specific index at which to insert the tool.
   */
  appendTool: function(toolComponent, settingsOrPosition, placementIndex) {
    if (typeof toolComponent !== "string" && (typeof toolComponent !== "object" || !toolComponent instanceof SketchCanvas.Tool)) {
      return false;
    }

    var toolSettings = typeof settingsOrPosition == "object" ? settingsOrPosition : {};
    placementIndex = placementIndex ? placementIndex * 1 : (typeof settingsOrPosition == "number" ? settingsOrPosition : null);

    if (typeof toolComponent == "string") {
      toolComponent = new window['SketchCanvas']['Tool'][toolComponent](this, toolSettings);
    }

    if (placementIndex) {
      this.domElements.$userControls.children().eq(placementIndex).before(toolComponent.$el);
    } else {
      this.domElements.$userControls.append(toolComponent.$el);
    }

    if (!this.controls) {
      this.controls = [];
    }
    this.controls.push(toolComponent);
    this.domElements.$userControls.removeClass('sketch-panel-controls-hidden');
  },



  /**
   * Revision history methods: allows undoing and redoing drawing actions.
   */

  setupHistoryTracking: function() {
    this.revisionLog = {
      entries: [],
      currentPosition: 0
    };
  },

  /**
   * Records the current canvas state into the revision history.
   * Manages history size to prevent excessive memory usage.
   */
  recordRevision: function () {
    // Keep history limited to 30 states
    while (this.revisionLog.entries.length > 30) {
      this.revisionLog.entries.shift(); // Remove oldest entry
      this.revisionLog.currentPosition--;
    }
    // If current position is not at the end of history, truncate forward history
    if (this.revisionLog.currentPosition !== 0 && this.revisionLog.currentPosition < this.revisionLog.entries.length) {
      this.revisionLog.entries = this.revisionLog.entries.slice(0, this.revisionLog.currentPosition);
      this.revisionLog.currentPosition++;
    } else {
      this.revisionLog.currentPosition = this.revisionLog.entries.length + 1;
    }
    this.revisionLog.entries.push(this.retrieveImageAsDataUrl());
    this.eventNotifier.trigger('revision:navigate', this.revisionLog.currentPosition);
  },

  /**
   * Navigates through the revision history (undo/redo).
   *
   * @param {boolean} moveForward If true, moves to a newer state; otherwise, moves to an older state.
   * @private
   */
  _navigateRevisionLog: function(moveForward) {
    // Prevent navigating beyond available history
    if ((moveForward && this.revisionLog.currentPosition == this.revisionLog.entries.length) ||
        (!moveForward && this.revisionLog.currentPosition == 1)) {
      return;
    }
    var targetPosition = moveForward ? this.revisionLog.currentPosition + 1 : this.revisionLog.currentPosition - 1;
    if (this.revisionLog.entries.length && this.revisionLog.entries[targetPosition - 1] !== undefined) {
      this.revisionLog.currentPosition = targetPosition;
      this.setImageContent(this.revisionLog.entries[targetPosition - 1]);
    }
    this.eventNotifier.trigger('revision:navigate', targetPosition);
    this.persistToWebStorage();
  },

  /**
   * Reverts the canvas to the previous state in history.
   */
  undoLastAction: function() {
    this._navigateRevisionLog(false);
  },

  /**
   * Advances the canvas to the next state in history.
   */
  redoNextAction: function() {
    this._navigateRevisionLog(true);
  },



  /**
   * Image handling methods: allows setting, retrieving, and downloading canvas content.
   */

  /**
   * Sets the canvas content from an image source.
   *
   * @param {string} imageSource The URL or data URL of the image.
   * @param {object} imageSettings Options for image placement, e.g., `stretch: true`.
   */
  setImageContent: function(imageSource, imageSettings) {
    imageSettings = $.extend({
      stretch: this.configuration.stretchImageToFit
    }, imageSettings);
    var graphicContextRef = this.graphicContext;
    var loadedImage = new Image();
    var previousGlobalCompositeOperation = graphicContextRef.globalCompositeOperation;
    loadedImage.onload = function() {
      graphicContextRef.globalCompositeOperation = "source-over";
      graphicContextRef.clearRect(0, 0, graphicContextRef.canvas.width, graphicContextRef.canvas.height);

      if (imageSettings.stretch) {
        graphicContextRef.drawImage(loadedImage, 0, 0, graphicContextRef.canvas.width, graphicContextRef.canvas.height);
      } else {
        graphicContextRef.drawImage(loadedImage, 0, 0);
      }

      graphicContextRef.globalCompositeOperation = previousGlobalCompositeOperation;
    };
    loadedImage.src = imageSource;
  },

  /**
   * Retrieves the current canvas content as a PNG data URL.
   *
   * @returns {string} The base64 encoded data URL of the canvas image.
   */
  retrieveImageAsDataUrl: function() {
    return this.drawingContext.toDataURL("image/png");
  },

  /**
   * Initiates a download of the current canvas image.
   */
  exportImageForDownload: function() {
    var imageDataUrl = this.retrieveImageAsDataUrl();
    imageDataUrl = imageDataUrl.replace("image/png", "image/octet-stream"); // Change MIME type for download
    window.location.href = imageDataUrl;
  },



  /**
   * Web storage management: saving and restoring canvas state to local or session storage.
   */

  /**
   * Saves the current canvas image to web storage.
   */
  persistToWebStorage: function() {
    if (window[this.dataStore]) {
      window[this.dataStore].setItem('sketch-panel-' + this.domId, this.retrieveImageAsDataUrl());
      this.eventNotifier.trigger('panel:saved' + this.dataStore.charAt(0).toUpperCase() + this.dataStore.slice(1), this.retrieveImageAsDataUrl());
    }
  },

  /**
   * Restores the canvas image from web storage if available.
   */
  loadFromWebStorage: function() {
    if (window[this.dataStore] && window[this.dataStore].getItem('sketch-panel-' + this.domId) !== null) {
      this.setImageContent(window[this.dataStore].getItem('sketch-panel-' + this.domId));
      this.eventNotifier.trigger('panel:restored' + this.dataStore.charAt(0).toUpperCase() + this.dataStore.slice(1), window[this.dataStore].getItem('sketch-panel-' + this.domId));
    }
  },

  /**
   * Clears the saved canvas image from web storage.
   */
  removeWebStorageEntry: function() {
    if (window[this.dataStore] && window[this.dataStore].getItem('sketch-panel-' + this.domId) !== null) {
      window[this.dataStore].removeItem('sketch-panel-' + this.domId);
      this.eventNotifier.trigger('panel:cleared' + this.dataStore.charAt(0).toUpperCase() + this.dataStore.slice(1));
    }
  },

  /**
   * Determines the appropriate web storage mechanism (session or local).
   *
   * @returns {string|boolean} The storage key ('sessionStorage' or 'localStorage') or false if not configured.
   * @private
   */
  _determineStorageMethod: function() {
    if (!this.configuration.dataPersistence || !(this.configuration.dataPersistence === 'session' || this.configuration.dataPersistence === 'local')) {
      return false;
    }
    return this.configuration.dataPersistence + 'Storage';
  },



  /**
   * Enables functionality for dropping images onto the canvas.
   */

  enableDropFunctionality: function() {
    if (!this.configuration.allowImageDrop) {
      return false;
    }

    // Prevent default drag behaviors to allow drop
    this.domElements.$drawingSurface.on('dragover dragenter drop', function(dragEvent) {
      dragEvent.stopPropagation();
      dragEvent.preventDefault();
    });

    // Handle the actual drop event
    this.domElements.$drawingSurface.on('drop', $.proxy(this._handleSurfaceDrop, this));
  },

  /**
   * Processes an image file dropped onto the canvas.
   *
   * @param {Event} dropEvent The drop event object.
   * @private
   */
  _handleSurfaceDrop: function(dropEvent) {
    dropEvent = dropEvent.originalEvent ? dropEvent.originalEvent : dropEvent;
    var droppedFiles = dropEvent.dataTransfer.files;
    // Check if files exist, if the first file is an image, and if FileReader is supported
    if (!droppedFiles || !droppedFiles.length || droppedFiles[0].type.indexOf('image') == -1 || !window.FileReader) {
      return false;
    }
    var fileReader = new FileReader();
    fileReader.readAsDataURL(droppedFiles[0]);
    fileReader.onload = $.proxy(function(loadEvent) {
      this.setImageContent(loadEvent.target.result);
      this.eventNotifier.trigger('panel:imageDropped', loadEvent.target.result);
      this.eventNotifier.trigger('panel:userInteraction'); // Indicate user activity
      this.recordRevision(); // Save this state to history
    }, this);
  },



  /**
   * Sets and retrieves the current drawing mode.
   *
   * Available modes include "pencil" (standard drawing), "eraser" (draws transparently), and "filler" (flood fill).
   */

  /**
   * Configures the current drawing operation mode.
   *
   * @param {string} chosenMode The desired mode ('pencil', 'eraser', 'filler').
   * @param {boolean} suppressEvents If true, mode change events will not be triggered.
   */
  setOperationMode: function(chosenMode, suppressEvents) {
    suppressEvents = suppressEvents || false;
    chosenMode = chosenMode || 'pencil';

    // Unbind flood fill handler if previously active
    this.eventNotifier.unbind('panel:startDrawing', $.proxy(this.floodFillArea, this));

    if (this.configuration.eraseToolColor === "transparent") {
      this.graphicContext.globalCompositeOperation = chosenMode === "eraser" ? "destination-out" : "source-over";
    } else {
      if (chosenMode === "eraser") {
        if (this.configuration.eraseToolColor === "background" && SketchCanvas.Helpers.isColorValue(this.configuration.defaultBackground)) {
          this.graphicContext.strokeStyle = this.configuration.defaultBackground;
        } else if (SketchCanvas.Helpers.isColorValue(this.configuration.eraseToolColor)) {
          this.graphicContext.strokeStyle = this.configuration.eraseToolColor;
        }
      } else if (!this.currentMode || this.currentMode === "eraser") {
        this.graphicContext.strokeStyle = this.activeColor; // Revert to active color if coming from eraser
      }

      if (chosenMode === "filler") {
        this.eventNotifier.bind('panel:startDrawing', $.proxy(this.floodFillArea, this));
      }
    }
    this.currentMode = chosenMode;
    if (!suppressEvents) {
      this.eventNotifier.trigger('panel:modeChanged', this.currentMode);
    }
  },

  /**
   * Retrieves the current drawing operation mode.
   *
   * @returns {string} The current mode, defaulting to "pencil".
   */
  getCurrentOperationMode: function() {
    return this.currentMode || "pencil";
  },

  /**
   * Sets the current stroke color for drawing.
   *
   * @param {string} newColorValue The new color in hex format.
   */
  setStrokeColor: function(newColorValue) {
    var selfRef = this;
    newColorValue = newColorValue || this.activeColor;
    if (!SketchCanvas.Helpers.isColorValue(newColorValue)) {
      return false;
    }
    this.activeColor = newColorValue;
    // If in non-transparent eraser mode, special handling for color changes
    if (this.configuration.eraseToolColor !== "transparent" && this.currentMode === "eraser") {
      var updateStrokeStyle = function(mode) {
        if (mode !== "eraser") {
          selfRef.graphicContext.strokeStyle = selfRef.activeColor;
        }
        selfRef.eventNotifier.unbind('panel:modeChanged', updateStrokeStyle);
      };
      this.eventNotifier.bind('panel:modeChanged', updateStrokeStyle);
    } else {
      this.graphicContext.strokeStyle = this.activeColor;
    }
  },

  /**
   * Fills a contiguous area on the canvas with the current stroke color (flood fill).
   *
   * @param {Event} fillEvent The event object containing coordinates for the fill start.
   */
  floodFillArea: function(fillEvent) {
    // If canvas is blank, just fill the entire canvas
    if (this.retrieveImageAsDataUrl() === this.emptySurfaceImage) {
      this.graphicContext.clearRect(0, 0, this.graphicContext.canvas.width, this.graphicContext.canvas.width);
      this.graphicContext.fillStyle = this.activeColor;
      this.graphicContext.fillRect(0, 0, this.graphicContext.canvas.width, this.graphicContext.canvas.height);
      return;
    }

    var imageData = this.graphicContext.getImageData(0, 0, this.drawingContext.width, this.drawingContext.height);

    // Constants for pixel data array components (RGBA)
    var PIXEL_DATA_INDEX = 0, X_COORDINATE = 1, Y_COORDINATE = 2, COLOR_COMPONENT = 3;

    // Target fill color components from the current stroke style
    var currentStrokeColor = this.graphicContext.strokeStyle;
    var redVal = parseInt(currentStrokeColor.substr(1, 2), 16);
    var greenVal = parseInt(currentStrokeColor.substr(3, 2), 16);
    var blueVal = parseInt(currentStrokeColor.substr(5, 2), 16);

    // Get the color of the starting pixel
    var startingPoint = SketchCanvas.Helpers.getPixelAt(imageData, parseInt(fillEvent.coords.x, 10), parseInt(fillEvent.coords.y, 10));
    var initialPixelColor = startingPoint[COLOR_COMPONENT];
    var fillTolerance = this.configuration.floodFillTolerance;
    var applyHack = this.configuration.antiAliasingHack; // Refer to https://github.com/Leimi/drawingboard.js/pull/38 for context

    // If starting color and target fill color are already similar, no fill needed
    if (SketchCanvas.Helpers.areColorsSimilar(initialPixelColor, SketchCanvas.Helpers.convertRGBtoInteger(redVal, greenVal, blueVal), fillTolerance)) {
      return;
    }

    // Queue for pixels to be evaluated
    var pixelVisitQueue = [startingPoint];

    // Loop variables
    var currentPixelData, coordX, coordY;
    var maxCoordX = imageData.width - 1;
    // Code continues here...
};