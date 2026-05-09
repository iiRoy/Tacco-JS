window.CanvasSketcher = typeof CanvasSketcher !== "undefined" ? CanvasSketcher : {};

/**
 * Main class for the interactive sketching environment.
 *
 * This constructor takes the ID of an HTML element to host the drawing pad
 * and a configuration object.
 *
 * Configuration properties include:
 *  - tools: An array defining the controls to be initialized. Defaults to basic tools like 'ColorPicker', 'StrokeWidth', 'HistoryNavigator'.
 *           Can be simple strings or objects for tool-specific settings (e.g., ['ColorPicker', { HistoryNavigator: { canReset: false }}]).
 *  - toolPlacement: Specifies where the tool controls are positioned. "top left" is default. Options: "top", "bottom", combined with "left", "right", "center".
 *  - backgroundColor: The canvas background. Can be a hex code or an image URL. "#ffffff" (white) by default.
 *  - defaultStrokeColor: Initial color for drawing ("#000000" by default).
 *  - initialStrokeSize: Initial line thickness (3 pixels by default).
 *  - persistentStorage: 'session', 'local', or false ('session' by default). Determines if the drawing is saved and restored from web storage.
 *  - allowImageDrops: Boolean (false by default). If true, users can drag-and-drop images onto the canvas to draw over them.
 *  - noCanvasSupportMessage: HTML string displayed if the browser lacks canvas support.
 *  - scaleDroppedImages: When an image is loaded, should it stretch to fit the canvas? False by default.
 */
CanvasSketcher.SketchPad = function(containerId, configOptions) {
    // Merge provided options with defaults.
    this.configuration = this.combineSettings(configOptions);

    // Initialize an internal event messaging system.
    this.eventBus = new CanvasSketcher.Utility.EventHub();

    // Store the host element's ID and its jQuery wrapped reference.
    this.hostId = containerId;
    this.mainElement = $(document.getElementById(containerId));

    // Guard clause: if the host element is not found, cannot proceed.
    if (!this.mainElement.length) {
        console.error("CanvasSketcher: Host element with ID '" + containerId + "' not found.");
        return false;
    }

    // Prepare the HTML structure for the drawing pad.
    let layoutTemplate = `
        <div class="sketch-area-viewport">
            <canvas class="sketch-main-canvas"></canvas>
            <div class="sketch-pointer-indicator sketch-util-hidden"></div>
        </div>
    `;
    // Determine placement of control panel (top or bottom).
    if (this.configuration.toolPlacement.includes("bottom")) {
        layoutTemplate += '<div class="sketch-control-panel"></div>';
    } else {
        layoutTemplate = '<div class="sketch-control-panel"></div>' + layoutTemplate;
    }

    // Apply base class and append the generated template to the host element.
    this.mainElement.addClass('canvas-sketcher-container').append(layoutTemplate);

    // Cache references to key DOM elements for quicker access.
    this.elements = {
        drawingArea: this.mainElement.find('.sketch-area-viewport'),
        drawingCanvas: this.mainElement.find('.sketch-main-canvas'),
        pointerIndicator: this.mainElement.find('.sketch-pointer-indicator'),
        controlPanel: this.mainElement.find('.sketch-control-panel')
    };

    // Set alignment for the control panel based on configuration.
    const alignmentOptions = ['left', 'right', 'center'];
    for (let i = 0; i < alignmentOptions.length; i++) {
        const align = alignmentOptions[i];
        if (this.configuration.toolPlacement.includes(align)) {
            this.elements.controlPanel.attr('data-alignment', align);
            break; // Found alignment, no need to check further.
        }
    }

    // Get the native canvas element and its 2D rendering context.
    this.nativeCanvas = this.elements.drawingCanvas.get(0);
    this.renderContext = this.nativeCanvas && this.nativeCanvas.getContext && this.nativeCanvas.getContext('2d') ? this.nativeCanvas.getContext('2d') : null;

    // Set the initial drawing color.
    this.strokeColor = this.configuration.defaultStrokeColor;

    // Critical check: if canvas context is not available, display error and exit.
    if (!this.renderContext) {
        if (this.configuration.noCanvasSupportMessage) {
            this.mainElement.html(this.configuration.noCanvasSupportMessage);
        }
        console.error("CanvasSketcher: 2D rendering context not supported by browser.");
        return false;
    }

    // Determine the type of web storage to use (session/local/none).
    this.persistentStorage = this.determineStorageType();

    // Initialize history tracking for undo/redo.
    this.setupHistory();

    // Apply initial canvas settings (color, size, background) before tools are added.
    // This ensures tools can read correct initial values.
    this.clearAndConfigure({
        useWebStorage: false,
        trackHistory: false,
        resetBackground: false
    });

    // Initialize the drawing tools. These tools will depend on the initial canvas state.
    this.initializeTools();

    // Adjust canvas dimensions to fill its container, taking controls into account.
    this.adjustDimensions();

    // Perform a full reset after resizing to ensure the canvas is properly cleared and state saved.
    this.clearAndConfigure({
        useWebStorage: false,
        trackHistory: true,
        resetBackground: true
    });

    // Attempt to restore a previous drawing from web storage.
    this.loadFromWebStorage();

    // Set up event listeners for drag-and-drop functionality.
    this.setupDragAndDrop();

    // Initialize core drawing event handlers (mouse/touch interactions).
    this.initDrawingInteractions();
};

// Define default settings for the SketchPad.
CanvasSketcher.SketchPad.baseSettings = {
    tools: ['ColorPicker', 'DrawingModeSelector', 'StrokeWidth', 'HistoryNavigator'],
    toolPlacement: "top left",
    defaultStrokeColor: "#000000",
    initialStrokeSize: 1,
    backgroundColor: "#fff",
    eraserTone: "background", // Can be "background" or a hex color.
    fillThreshold: 100, // Tolerance for flood fill algorithm.
    antiAliasingHack: true, // Attempt to mitigate anti-aliasing issues for flood fill.
    persistentStorage: 'session', // 'session', 'local', or false.
    allowImageDrops: false, // Enable drag-and-drop images.
    expandContainer: false, // If true, the sketcher will adjust its container dimensions.
    noCanvasSupportMessage: "<p>Your browser is outdated and does not support HTML5 Canvas. Please <a href=\"http://browsehappy.com/\" target=\"_blank\">update your browser</a> to use this drawing tool.</p>",
    scaleDroppedImages: false // When an image is dropped, stretch it to canvas size.
};

// Prototype methods for CanvasSketcher.SketchPad.
CanvasSketcher.SketchPad.prototype = {

    /**
     * Merges user-provided options with the default settings.
     * Also handles a specific case for eraser color if no background is set.
     * @param {object} userOptions - The options provided by the user.
     * @returns {object} The merged and processed configuration.
     */
    combineSettings: function(userOptions) {
        let mergedConfig = $.extend({}, CanvasSketcher.SketchPad.baseSettings, userOptions);
        // If no explicit background is set and eraser is set to "background",
        // ensure eraser tone is transparent to avoid issues.
        if (!mergedConfig.backgroundColor && mergedConfig.eraserTone === "background") {
            mergedConfig.eraserTone = "transparent";
        }
        return mergedConfig;
    },

    /**
     * Resets the canvas to a clean state, configuring color, size, and background.
     * Optionally saves to web storage and history.
     * @param {object} [options] - Configuration for the reset operation.
     * @param {string} [options.newColor] - New stroke color.
     * @param {number} [options.newSize] - New stroke size.
     * @param {boolean} [options.useWebStorage] - Whether to save current state to web storage.
     * @param {boolean} [options.trackHistory] - Whether to save current state to history.
     * @param {boolean} [options.resetBackground] - Whether to reset the background.
     */
    clearAndConfigure: function(options) {
        // Apply default options for this method.
        const resetOpts = $.extend({
            newColor: this.configuration.defaultStrokeColor,
            newSize: this.configuration.initialStrokeSize,
            useWebStorage: true,
            trackHistory: true,
            resetBackground: false
        }, options);

        // Ensure drawing mode is set to 'pencil' for consistent resets.
        this.setDrawingMode('pencil');

        // Handle background reset if specified.
        if (resetOpts.resetBackground) {
            this.updateBackground(this.configuration.backgroundColor, false); // Don't historize this internal step.
        }

        // Apply new color and size.
        if (resetOpts.newColor) {
            this.setStrokeColor(resetOpts.newColor);
        }
        if (resetOpts.newSize) {
            this.renderContext.lineWidth = resetOpts.newSize;
        }

        // Standard canvas drawing properties.
        this.renderContext.lineCap = "round";
        this.renderContext.lineJoin = "round";

        // Save state to web storage and history if enabled.
        if (resetOpts.useWebStorage) {
            this.saveToWebStorage();
        }
        if (resetOpts.trackHistory) {
            this.recordState();
        }

        // Store a blank canvas image for comparison later (e.g., in flood fill).
        this.emptyCanvasSnapshot = this.exportCanvasAsImage();

        // Notify subscribers of the reset event.
        this.eventBus.trigger('sketchPad:reset', resetOpts);
    },

    /**
     * Updates the canvas background. Can be a solid color or an image.
     * @param {string} backgroundSource - Hex color string or image URL.
     * @param {boolean} [shouldHistorize=true] - Whether to record this change in history.
     */
    updateBackground: function(backgroundSource, shouldHistorize = true) {
        const sourceIsColor = CanvasSketcher.Utility.isHexColor(backgroundSource);
        const previousMode = this.getCurrentDrawingMode();

        // Temporarily switch to pencil mode to avoid eraser conflicts.
        this.setDrawingMode('pencil', true); // Silent mode change.

        // Clear the entire canvas before applying new background.
        this.renderContext.clearRect(0, 0, this.renderContext.canvas.width, this.renderContext.canvas.height);

        if (sourceIsColor) {
            this.renderContext.fillStyle = backgroundSource;
            this.renderContext.fillRect(0, 0, this.renderContext.canvas.width, this.renderContext.canvas.height);
        } else if (backgroundSource) {
            this.loadImageOnCanvas(backgroundSource); // Use existing image loading method.
        }

        // Restore the previous drawing mode.
        this.setDrawingMode(previousMode, true); // Silent mode change.

        // Record state in history if required.
        if (shouldHistorize) {
            this.recordState();
        }
    },

    /**
     * Adjusts the dimensions of the canvas and its wrapper to fit the container.
     * Considers control panel size and 'expandContainer' option.
     */
    adjustDimensions: function() {
        // Hide controls temporarily if they don't exist, affects layout calculations.
        const hasControls = this.tools && this.tools.length > 0;
        this.elements.controlPanel.toggleClass('sketch-control-panel-hidden', !hasControls);

        let calculatedCanvasWidth, calculatedCanvasHeight;

        // Get outer dimensions including padding and border for calculations.
        const containerOuterWidth = this.mainElement.outerWidth(true);
        const containerOuterHeight = this.mainElement.outerHeight(true);
        const wrapperPaddingBorderWidth = CanvasSketcher.Utility.measureBoxModel(this.elements.drawingArea, 'horizontal');
        const wrapperPaddingBorderHeight = CanvasSketcher.Utility.measureBoxModel(this.elements.drawingArea, 'vertical');
        const controlPanelHeight = this.elements.controlPanel.outerHeight(true);

        if (this.configuration.expandContainer) {
            // If container should expand, canvas takes full width/height, and container adjusts.
            calculatedCanvasWidth = this.mainElement.width();
            calculatedCanvasHeight = this.mainElement.height();

            this.mainElement.width(containerOuterWidth + wrapperPaddingBorderWidth);
            this.mainElement.height(containerOuterHeight + wrapperPaddingBorderHeight + controlPanelHeight);
        } else {
            // Canvas width is container width minus its own padding/border.
            calculatedCanvasWidth = this.mainElement.width() - wrapperPaddingBorderWidth;
            // Canvas height is container height minus controls height and its own padding/border.
            calculatedCanvasHeight = this.mainElement.height() - controlPanelHeight - wrapperPaddingBorderHeight;
        }

        // Apply calculated dimensions to wrapper and canvas.
        this.elements.drawingArea.css({
            'width': calculatedCanvasWidth + 'px',
            'height': calculatedCanvasHeight + 'px'
        });
        this.elements.drawingCanvas.css({
            'width': calculatedCanvasWidth + 'px',
            'height': calculatedCanvasHeight + 'px'
        });

        // Update native canvas dimensions, which clears its content.
        this.nativeCanvas.width = calculatedCanvasWidth;
        this.nativeCanvas.height = calculatedCanvasHeight;
    },

    /**
     * Initializes the drawing tools (controls) based on configuration.
     * Each tool is an instance of a class in CanvasSketcher.Control.
     */
    initializeTools: function() {
        this.tools = []; // Stores instances of active tools.
        const configuredTools = this.configuration.tools;

        // If no tools are configured or the base Control class is missing, exit.
        if (!configuredTools || configuredTools.length === 0 || !CanvasSketcher.Control) {
            return;
        }

        for (let i = 0; i < configuredTools.length; i++) {
            let currentTool = null;
            const toolDefinition = configuredTools[i];

            if (typeof toolDefinition === "string") {
                // If definition is a string, assume default options.
                currentTool = new window['CanvasSketcher']['Control'][toolDefinition](this);
            } else if (typeof toolDefinition === "object") {
                // If definition is an object, extract tool name and specific options.
                const toolName = Object.keys(toolDefinition)[0];
                const toolOptions = toolDefinition[toolName];
                currentTool = new window['CanvasSketcher']['Control'][toolName](this, toolOptions);
            }

            // If a tool instance was successfully created, add it to the panel.
            if (currentTool) {
                this.appendTool(currentTool);
            }
        }
    },

    /**
     * Adds a new tool instance to the control panel.
     * Can create a tool from a string name or add an already instantiated tool.
     * @param {string|object} toolToAdd - The tool class name (string) or an instance of a tool.
     * @param {object|number} [optionsOrPosition] - Options for the tool if `toolToAdd` is a string, or the numeric position to insert.
     * @param {number} [position] - Numeric position to insert the tool.
     */
    appendTool: function(toolToAdd, optionsOrPosition, position) {
        // Validate input: must be a string (tool name) or an actual tool object.
        const isToolName = typeof toolToAdd === "string";
        const isToolInstance = typeof toolToAdd === "object" && toolToAdd instanceof CanvasSketcher.Control.BaseTool;

        if (!isToolName && !isToolInstance) {
            console.warn("CanvasSketcher: Invalid tool provided for appendTool.");
            return false;
        }

        let toolOptions = {};
        let insertionPosition = null;

        // Determine if options or position were provided.
        if (typeof optionsOrPosition === "object") {
            toolOptions = optionsOrPosition;
        } else if (typeof optionsOrPosition === "number") {
            insertionPosition = optionsOrPosition;
        }

        // If a separate position argument is given, it overrides others.
        if (typeof position === "number") {
            insertionPosition = position;
        }

        // If toolToAdd is a string, instantiate the tool.
        let toolInstance = toolToAdd;
        if (isToolName) {
            toolInstance = new window['CanvasSketcher']['Control'][toolToAdd](this, toolOptions);
        }

        // If no tool instance, something went wrong.
        if (!toolInstance) {
            console.error("CanvasSketcher: Failed to instantiate tool:", toolToAdd);
            return false;
        }

        // Insert the tool's element into the control panel.
        if (insertionPosition !== null && insertionPosition >= 0) {
            this.elements.controlPanel.children().eq(insertionPosition).before(toolInstance.domElement);
        } else {
            this.elements.controlPanel.append(toolInstance.domElement);
        }

        // Ensure the tools array exists and add the new tool.
        if (!this.tools) {
            this.tools = [];
        }
        this.tools.push(toolInstance);

        // Make sure the control panel is visible.
        this.elements.controlPanel.removeClass('sketch-control-panel-hidden');
    },

    /**
     * Sets up the history tracking mechanism for undo/redo operations.
     */
    setupHistory: function() {
        this.actionHistory = {
            states: [], // Array to store canvas states (images).
            currentIndex: 0 // Current position in the states array.
        };
        // Define a maximum number of history states to prevent excessive memory usage.
        this.maxHistoryStates = 30;
    },

    /**
     * Records the current canvas state into the history stack.
     * Manages history length and current position for undo/redo.
     */
    recordState: function() {
        let history = this.actionHistory;

        // Trim older states if history exceeds maximum length.
        while (history.states.length >= this.maxHistoryStates) {
            history.states.shift(); // Remove the oldest state.
            history.currentIndex--; // Adjust current index accordingly.
        }

        // If we are not at the end of history (i.e., we've undone some actions),
        // discard all future (redo-able) states before adding a new one.
        if (history.currentIndex < history.states.length) {
            history.states = history.states.slice(0, history.currentIndex);
        }

        // Add the current canvas image to the history.
        history.states.push(this.exportCanvasAsImage());
        history.currentIndex = history.states.length; // Update current index to the new end.

        // Notify subscribers about history navigation for UI updates (e.g., enable/disable undo/redo buttons).
        this.eventBus.trigger('history:navigated', history.currentIndex);
    },

    /**
     * Internal method to navigate through the history states.
     * @param {boolean} moveForward - True for redo, false for undo.
     */
    navigateHistory: function(moveForward) {
        let history = this.actionHistory;
        let newIndex;

        if (moveForward) { // Redo
            newIndex = history.currentIndex + 1;
            // Prevent going beyond the last recorded state.
            if (newIndex > history.states.length) {
                return;
            }
        } else { // Undo
            newIndex = history.currentIndex - 1;
            // Prevent going before the first state (which is state 1, index 0).
            if (newIndex < 1) {
                return;
            }
        }

        // If a valid state exists at the new index, load it.
        if (history.states[newIndex - 1] !== undefined) {
            history.currentIndex = newIndex;
            this.loadImageOnCanvas(history.states[newIndex - 1]);
        }

        // Notify about history navigation and save current state to web storage.
        this.eventBus.trigger('history:navigated', newIndex);
        this.saveToWebStorage();
    },

    /**
     * Undoes the last drawing action by reverting to a previous history state.
     */
    undoLastAction: function() {
        this.navigateHistory(false); // Move backward.
    },

    /**
     * Redoes a previously undone drawing action by advancing to a future history state.
     */
    redoNextAction: function() {
        this.navigateHistory(true); // Move forward.
    },

    /**
     * Loads an image onto the canvas from a given source URL (Data URL or regular URL).
     * @param {string} imageSource - The URL of the image to load.
     * @param {object} [options] - Options for loading the image.
     * @param {boolean} [options.stretch=false] - Whether to stretch the image to fit the canvas.
     */
    loadImageOnCanvas: function(imageSource, options) {
        // Merge default options with any provided.
        const imageLoadOpts = $.extend({
            stretch: this.configuration.scaleDroppedImages
        }, options);

        const ctx = this.renderContext;
        const img = new Image();
        const originalCompositeOperation = ctx.globalCompositeOperation; // Store current composite mode.

        img.onload = () => {
            ctx.globalCompositeOperation = "source-over"; // Ensure image is drawn over existing content.
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear current canvas.

            if (imageLoadOpts.stretch) {
                // Draw image stretched to canvas dimensions.
                ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
            } else {
                // Draw image at its natural size, starting from top-left.
                ctx.drawImage(img, 0, 0);
            }

            // Restore original composite operation.
            ctx.globalCompositeOperation = originalCompositeOperation;
        };

        // Set the image source; this triggers the onload event.
        img.src = imageSource;
    },

    /**
     * Exports the current canvas content as a Data URL (PNG format).
     * @returns {string} The Data URL of the canvas image.
     */
    exportCanvasAsImage: function() {
        // A simple validation for canvas state.
        if (!this.nativeCanvas || !this.nativeCanvas.toDataURL) {
            console.error("CanvasSketcher: Canvas element or toDataURL method not available.");
            return "";
        }
        return this.nativeCanvas.toDataURL("image/png");
    },

    /**
     * Initiates a download of the current canvas image.
     * The image is converted to a data URL and then forced as a download.
     */
    downloadCanvasImage: function() {
        const imageData = this.exportCanvasAsImage();
        // Change the MIME type to force download.
        const downloadData = imageData.replace("image/png", "image/octet-stream");
        window.location.href = downloadData; // Trigger download.
    },

    /**
     * Saves the current canvas state to the configured web storage (session/local).
     */
    saveToWebStorage: function() {
        const storageType = this.persistentStorage;
        if (storageType && window[storageType]) {
            const storageKey = 'sketch-pad-data-' + this.hostId;
            window[storageType].setItem(storageKey, this.exportCanvasAsImage());
            // Trigger an event, capitalizing the storage type for event name.
            const eventName = 'sketchPad:savedTo' + storageType.charAt(0).toUpperCase() + storageType.slice(1);
            this.eventBus.trigger(eventName, this.exportCanvasAsImage());
        }
    },

    /**
     * Restores a saved canvas state from web storage, if available.
     */
    loadFromWebStorage: function() {
        const storageType = this.persistentStorage;
        if (storageType && window[storageType]) {
            const storageKey = 'sketch-pad-data-' + this.hostId;
            const storedImage = window[storageType].getItem(storageKey);
            if (storedImage !== null) {
                this.loadImageOnCanvas(storedImage);
                // Trigger an event for successful restoration.
                const eventName = 'sketchPad:restoredFrom' + storageType.charAt(0).toUpperCase() + storageType.slice(1);
                this.eventBus.trigger(eventName, storedImage);
            }
        }
    },

    /**
     * Clears the saved canvas state from web storage.
     */
    eraseWebStorage: function() {
        const storageType = this.persistentStorage;
        if (storageType && window[storageType]) {
            const storageKey = 'sketch-pad-data-' + this.hostId;
            if (window[storageType].getItem(storageKey) !== null) {
                window[storageType].removeItem(storageKey);
                // Trigger an event for clearing.
                const eventName = 'sketchPad:cleared' + storageType.charAt(0).toUpperCase() + storageType.slice(1);
                this.eventBus.trigger(eventName);
            }
        }
    },

    /**
     * Determines the appropriate web storage API to use based on configuration.
     * @returns {string|boolean} 'sessionStorage', 'localStorage', or false if disabled/invalid.
     */
    determineStorageType: function() {
        const configuredStorage = this.configuration.persistentStorage;
        if (!configuredStorage || (configuredStorage !== 'session' && configuredStorage !== 'local')) {
            return false; // No storage or invalid type.
        }
        return configuredStorage + 'Storage'; // Return the global object name.
    },

    /**
     * Sets up event listeners for drag-and-drop functionality on the canvas.
     * Only active if `allowImageDrops` is true in configuration.
     */
    setupDragAndDrop: function() {
        if (!this.configuration.allowImageDrops) {
            return; // Feature disabled.
        }

        // Prevent default browser behavior for drag events over the canvas.
        this.elements.drawingCanvas.on('dragover dragenter drop', (e) => {
            e.stopPropagation();
            e.preventDefault();
        });

        // Handle the actual drop event, using a bound function for context.
        this.elements.drawingCanvas.on('drop', this.handleDroppedImage.bind(this));
    },

    /**
     * Handler for when an image file is dropped onto the canvas.
     * Reads the file and loads it onto the canvas.
     * @param {Event} event - The drop event.
     */
    handleDroppedImage: function(event) {
        const dropEvent = event.originalEvent || event; // Normalize event object.
        const files = dropEvent.dataTransfer && dropEvent.dataTransfer.files;

        // Basic validation: ensure files exist, first file is an image, and FileReader is supported.
        if (!files || files.length === 0 || files[0].type.indexOf('image') === -1 || !window.FileReader) {
            console.warn("CanvasSketcher: Dropped item is not a valid image or FileReader is not supported.");
            return false;
        }

        const fileReader = new FileReader();
        fileReader.readAsDataURL(files[0]); // Read the image file as a Data URL.

        fileReader.onload = (readEvent) => {
            this.loadImageOnCanvas(readEvent.target.result); // Load the image onto the canvas.
            this.eventBus.trigger('sketchPad:imageDropped', readEvent.target.result);
            this.eventBus.trigger('sketchPad:userInteraction'); // Indicate user activity.
            this.recordState(); // Save this action to history.
        };
    },

    /**
     * Sets the current drawing mode (pencil, eraser, filler).
     * Adjusts canvas context properties accordingly.
     * @param {string} modeName - The new drawing mode.
     * @param {boolean} [silent=false] - If true, no 'sketchPad:modeChanged' event is triggered.
     */
    setDrawingMode: function(modeName, silent = false) {
        const currentMode = modeName || 'pencil';

        // Unbind previous 'fill' handler to prevent multiple bindings.
        // We need to re-bind it with the correct 'this' context.
        this.eventBus.unbind('sketchPad:startDrawing', this.floodFillArea.bind(this));

        // Handle eraser mode based on 'eraserTone' configuration.
        if (this.configuration.eraserTone === "transparent") {
            // "Destination-out" makes new strokes transparent, effectively erasing.
            this.renderContext.globalCompositeOperation = currentMode === "eraser" ? "destination-out" : "source-over";
        } else {
            // If eraser has a color, change stroke style.
            if (currentMode === "eraser") {
                if (this.configuration.eraserTone === "background" && CanvasSketcher.Utility.isHexColor(this.configuration.backgroundColor)) {
                    this.renderContext.strokeStyle = this.configuration.backgroundColor;
                } else if (CanvasSketcher.Utility.isHexColor(this.configuration.eraserTone)) {
                    this.renderContext.strokeStyle = this.configuration.eraserTone;
                }
            } else if (!this.currentDrawingMode || this.currentDrawingMode === "eraser") {
                // If switching from eraser or initial setup, revert to original stroke color.
                this.renderContext.strokeStyle = this.strokeColor;
            }

            // If new mode is 'filler', bind the flood fill function to drawing start event.
            if (currentMode === "filler") {
                this.eventBus.bind('sketchPad:startDrawing', this.floodFillArea.bind(this));
            }
        }

        this.currentDrawingMode = currentMode; // Update the internal mode state.

        // Trigger event unless silent flag is set.
        if (!silent) {
            this.eventBus.trigger('sketchPad:modeChanged', this.currentDrawingMode);
        }
    },

    /**
     * Returns the currently active drawing mode.
     * @returns {string} The current mode (e.g., "pencil", "eraser", "filler").
     */
    getCurrentDrawingMode: function() {
        return this.currentDrawingMode || "pencil";
    },

    /**
     * Sets the stroke color for drawing operations.
     * @param {string} newColor - The new hex color string.
     * @returns {boolean} True if color was set, false otherwise (e.g., invalid color).
     */
    setStrokeColor: function(newColor) {
        const colorToSet = newColor || this.strokeColor;
        if (!CanvasSketcher.Utility.isHexColor(colorToSet)) {
            console.warn("CanvasSketcher: Invalid color format provided:", colorToSet);
            return false;
        }

        this.strokeColor = colorToSet; // Update internal color state.

        // If eraser tone is not transparent and current mode is eraser,
        // temporarily defer color change until mode changes.
        if (this.configuration.eraserTone !== "transparent" && this.currentDrawingMode === "eraser") {
            const restoreColorOnModeChange = (mode) => {
                if (mode !== "eraser") {
                    this.renderContext.strokeStyle = this.strokeColor;
                    this.eventBus.unbind('sketchPad:modeChanged', restoreColorOnModeChange);
                }
            };
            this.eventBus.bind('sketchPad:modeChanged', restoreColorOnModeChange);
        } else {
            // Otherwise, apply the color directly.
            this.renderContext.strokeStyle = this.strokeColor;
        }
        return true;
    },

    /**
     * Implements a flood fill algorithm to fill a contiguous area with the current stroke color.
     * Triggered by a 'sketchPad:startDrawing' event when in 'filler' mode.
     * @param {Event} drawEvent - The event containing coordinates for the fill start point.
     */
    floodFillArea: function(drawEvent) {
        // If the canvas is completely blank, just fill the whole thing.
        if (this.exportCanvasAsImage() === this.emptyCanvasSnapshot) {
            this.renderContext.clearRect(0, 0, this.nativeCanvas.width, this.nativeCanvas.height);
            this.renderContext.fillStyle = this.strokeColor;
            this.renderContext.fillRect(0, 0, this.nativeCanvas.width, this.nativeCanvas.height);
            this.recordState(); // Record this fill action.
            return;
        }

        // Get all pixel data from the canvas.
        const imageData = this.renderContext.getImageData(0, 0, this.nativeCanvas.width, this.nativeCanvas.height);
        const pixels = imageData.data; // Raw pixel data array [R, G, B, A, R, G, B, A, ...]

        // Helper constants for pixel data array indexing.
        const PIXEL_RED_OFFSET = 0;
        const PIXEL_GREEN_OFFSET = 1;
        const PIXEL_BLUE_OFFSET = 2;
        const PIXEL_ALPHA_OFFSET = 3;

        // Convert current stroke color (hex) to RGB components.
        const hexColor = this.renderContext.strokeStyle;
        if (!CanvasSketcher.Utility.isHexColor(hexColor)) {
            console.error("CanvasSketcher: Invalid stroke color for flood fill.");
            return;
        }
        const targetR = parseInt(hexColor.substr(1, 2), 16);
        const targetG = parseInt(hexColor.substr(3, 2), 16);
        const targetB = parseInt(hexColor.substr(5, 2), 16);
        const targetA = 255; // Always opaque for flood fill.

        // Get starting coordinates from the event.
        const startX = parseInt(drawEvent.coords.x, 10);
        const startY = parseInt(drawEvent.coords.y, 10);

        // Get the color of the pixel at the starting point.
        const startPixelColor = CanvasSketcher.Utility.getPixelRGBA(imageData, startX, startY);
        if (!startPixelColor) {
            return; // Clicked outside canvas or invalid coordinates.
        }
        const [startR, startG, startB, startA] = startPixelColor;

        const fillTolerance = this.configuration.fillThreshold;
        const useAntiAliasingHack = this.configuration.antiAliasingHack;

        // If the starting color is already the target color (within tolerance), no fill needed.
        if (CanvasSketcher.Utility.areColorsSimilar(
                [startR, startG, startB, startA],
                [targetR, targetG, targetB, targetA],
                fillTolerance
            )) {
            return;
        }

        const queue = [{ x: startX, y: startY }]; // Queue for pixels to process.
        const processedPixels = new Uint8Array(imageData.width * imageData.height); // Keep track of visited pixels.

        const markPixelAsProcessed = (x, y) => {
            if (x >= 0 && x < imageData.width && y >= 0 && y < imageData.height) {
                processedPixels[y * imageData.width + x] = 1;
            }
        };

        const isPixelProcessed = (x, y) => {
            if (x >= 0 && x < imageData.width && y >= 0 && y < imageData.height) {
                return processedPixels[y * imageData.width + x] === 1;
            }
            return true; // Treat out-of-bounds as processed.
        };

        // Main flood fill loop (BFS).
        while (queue.length > 0) {
            const currentPoint = queue.shift();
            const x = currentPoint.x;
            const y = currentPoint.y;

            // Boundary check.
            if (x < 0 || x >= imageData.width || y < 0 || y >= imageData.height) {
                continue;
            }

            // If already processed, skip.
            if (isPixelProcessed(x, y)) {
                continue;
            }

            const currentPixelIndex = (y * imageData.width + x) * 4;
            const currentPixelColor = [
                pixels[currentPixelIndex + PIXEL_RED_OFFSET],
                pixels[currentPixelIndex + PIXEL_GREEN_OFFSET],
                pixels[currentPixelIndex + PIXEL_BLUE_OFFSET],
                pixels[currentPixelIndex + PIXEL_ALPHA_OFFSET]
            ];

            // If the current pixel's color is similar to the starting color, fill it.
            if (CanvasSketcher.Utility.areColorsSimilar(currentPixelColor, [startR, startG, startB, startA], fillTolerance)) {
                pixels[currentPixelIndex + PIXEL_RED_OFFSET] = targetR;
                pixels[currentPixelIndex + PIXEL_GREEN_OFFSET] = targetG;
                pixels[currentPixelIndex + PIXEL_BLUE_OFFSET] = targetB;
                pixels[currentPixelIndex + PIXEL_ALPHA_OFFSET] = targetA; // Set alpha to fully opaque.

                markPixelAsProcessed(x, y);

                // Add neighbors to the queue.
                queue.push({ x: x + 1, y: y });
                queue.push({ x: x - 1, y: y });
                queue.push({ x: x, y: y + 1 });
                queue.push({ x: x, y: y - 1 });

                // Anti-aliasing hack: also check diagonal neighbors to fill small gaps.
                if (useAntiAliasingHack) {
                    queue.push({ x: x + 1, y: y + 1 });
                    queue.push({ x: x - 1, y: y - 1 });
                    queue.push({ x: x + 1, y: y - 1 });
                    queue.push({ x: x - 1, y: y + 1 });
                }
            }
        }

        // Put the modified image data back onto the canvas.
        this.renderContext.putImageData(imageData, 0, 0);
        this.recordState(); // Record this fill action.
    },

    /**
     * Initializes mouse/touch drawing events on the canvas.
     */
    initDrawingInteractions: function() {
        let isDrawing = false;
        let lastX = 0, lastY = 0;

        const startDrawing = (e) => {
            isDrawing = true;
            // Get coordinates relative to canvas.
            const coords = CanvasSketcher.Utility.getRelativeCoords(e, this.nativeCanvas);
            lastX = coords.x;
            lastY = coords.y;
            this.renderContext.beginPath();
            this.renderContext.moveTo(lastX, lastY);
            this.eventBus.trigger('sketchPad:startDrawing', { coords: { x: lastX, y: lastY }, event: e });
            this.eventBus.trigger('sketchPad:userInteraction');
        };

        const draw = (e) => {
            if (!isDrawing) return;
            const coords = CanvasSketcher.Utility.getRelativeCoords(e, this.nativeCanvas);
            this.renderContext.lineTo(coords.x, coords.y);
            this.renderContext.stroke();
            this.eventBus.trigger('sketchPad:drawing', { coords: { x: coords.x, y: coords.y }, event: e });
            lastX = coords.x;
            lastY = coords.y;
        };

        const stopDrawing = (e) => {
            if (!isDrawing) return;
            isDrawing = false;
            this.recordState(); // Save to history after each completed stroke.
            this.saveToWebStorage(); // Save to web storage.
            this.eventBus.trigger('sketchPad:endDrawing', { event: e });
        };

        // Mouse events
        this.elements.drawingCanvas.on('mousedown', startDrawing);
        this.elements.drawingCanvas.on('mousemove', draw);
        this.elements.drawingCanvas.on('mouseup', stopDrawing);
        this.elements.drawingCanvas.on('mouseleave', stopDrawing); // Stop drawing if mouse leaves canvas.

        // Touch events (simplified)
        this.elements.drawingCanvas.on('touchstart', (e) => {
            if (e.touches.length === 1) startDrawing(e.touches[0]);
            e.preventDefault(); // Prevent scrolling on touch.
        });
        this.elements.drawingCanvas.on('touchmove', (e) => {
            if (e.touches.length === 1) draw(e.touches[0]);
            e.preventDefault();
        });
        this.elements.drawingCanvas.on('touchend', (e) => {
            stopDrawing(e);
            e.preventDefault();
        });

        // Event for cursor indicator (e.g. for pencil size visualization)
        this.elements.drawingCanvas.on('mousemove', (e) => {
            const coords = CanvasSketcher.Utility.getRelativeCoords(e, this.nativeCanvas);
            const cursorSize = this.renderContext.lineWidth;
            this.elements.pointerIndicator.css({
                left: coords.x - cursorSize / 2 + 'px',
                top: coords.y - cursorSize / 2 + 'px',
                width: cursorSize + 'px',
                height: cursorSize + 'px',
                borderRadius: cursorSize + 'px' // Make it a circle
            }).removeClass('sketch-util-hidden');
        });

        this.elements.drawingCanvas.on('mouseleave', () => {
            this.elements.pointerIndicator.addClass('sketch-util-hidden');
        });

    }
};

// --- Utility functions ---
CanvasSketcher.Utility = {
    /**
     * Checks if a string is a valid hex color.
     * @param {string} colorString - The string to check.
     * @returns {boolean} True if it's a hex color, false otherwise.
     */
    isHexColor: function(colorString) {
        return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(colorString);
    },

    /**
     * Calculates combined horizontal or vertical padding/border for a jQuery element.
     * @param {jQuery} $element - The jQuery element.
     * @param {string} dimension - 'horizontal' or 'vertical'.
     * @returns {number} The total pixel value.
     */
    measureBoxModel: function($element, dimension) {
        let total = 0;
        if (dimension === 'horizontal') {
            total += parseInt($element.css('padding-left'), 10) || 0;
            total += parseInt($element.css('padding-right'), 10) || 0;
            total += parseInt($element.css('border-left-width'), 10) || 0;
            total += parseInt($element.css('border-right-width'), 10) || 0;
        } else if (dimension === 'vertical') {
            total += parseInt($element.css('padding-top'), 10) || 0;
            total += parseInt($element.css('padding-bottom'), 10) || 0;
            total += parseInt($element.css('border-top-width'), 10) || 0;
            total += parseInt($element.css('border-bottom-width'), 10) || 0;
        }
        return total;
    },

    /**
     * Extracts RGBA components from image data at a specific pixel.
     * @param {ImageData} imageData - The ImageData object.
     * @param {number} x - X coordinate.
     * @param {number} y - Y coordinate.
     * @returns {number[]} Array [R, G, B, A] or null if out of bounds.
     */
    getPixelRGBA: function(imageData, x, y) {
        if (x < 0 || x >= imageData.width || y < 0 || y >= imageData.height) {
            return null; // Out of bounds.
        }
        const index = (y * imageData.width + x) * 4;
        return [
            imageData.data[index],
            imageData.data[index + 1],
            imageData.data[index + 2],
            imageData.data[index + 3]
        ];
    },

    /**
     * Compares two RGBA colors within a given tolerance.
     * @param {number[]} color1 - [R, G, B, A] array for the first color.
     * @param {number[]} color2 - [R, G, B, A] array for the second color.
     * @param {number} tolerance - Max difference allowed for each component.
     * @returns {boolean} True if colors are similar, false otherwise.
     */
    areColorsSimilar: function(color1, color2, tolerance) {
        if (!color1 || !color2 || color1.length !== 4 || color2.length !== 4) {
            return false; // Invalid input.
        }
        return (
            Math.abs(color1[0] - color2[0]) <= tolerance &&
            Math.abs(color1[1] - color2[1]) <= tolerance &&
            Math.abs(color1[2] - color2[2]) <= tolerance &&
            Math.abs(color1[3] - color2[3]) <= tolerance
        );
    },

    /**
     * Gets coordinates relative to a canvas element from a mouse/touch event.
     * @param {Event} event - The mouse or touch event.
     * @param {HTMLCanvasElement} canvas - The canvas element.
     * @returns {{x: number, y: number}} Relative coordinates.
     */
    getRelativeCoords: function(event, canvas) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }
};

// --- EventHub (MicroEvent equivalent) ---
CanvasSketcher.Utility.EventHub = function() {
    this._events = {};
};

CanvasSketcher.Utility.EventHub.prototype = {
    on: function(eventName, callback) {
        this._events[eventName] = this._events[eventName] || [];
        this._events[eventName].push(callback);
    },
    off: function(eventName, callback) {
        if (!this._events[eventName]) return;
        this._events[eventName] = this._events[eventName].filter(cb => cb !== callback);
    },
    trigger: function(eventName, ...args) {
        if (!this._events[eventName]) return;
        this._events[eventName].forEach(callback => callback.apply(this, args));
    },
    bind: function(eventName, callback) { // Alias for 'on'
        this.on(eventName, callback);
    },
    unbind: function(eventName, callback) { // Alias for 'off'
        this.off(eventName, callback);
    }
};

// --- Placeholder for Control classes ---
CanvasSketcher.Control = {};

/**
 * Base class for all drawing tools (controls).
 * @param {CanvasSketcher.SketchPad} sketchPadInstance - The main SketchPad instance.
 * @param {object} [options] - Tool-specific options.
 */
CanvasSketcher.Control.BaseTool = function(sketchPadInstance, options) {
    this.sketchPad = sketchPadInstance;
    this.options = options || {};
    this.domElement = $('<div class="sketch-tool-button"></div>'); // Placeholder for tool's UI element.
    // Each specific tool would override this.domElement and add its own logic.
};

// Example specific tool: ColorPicker
CanvasSketcher.Control.ColorPicker = function(sketchPadInstance, options) {
    CanvasSketcher.Control.BaseTool.call(this, sketchPadInstance, options);
    this.domElement.addClass('sketch-tool-color-picker');
    this.domElement.text('C'); // Placeholder text.
    this.domElement.on('click', () => {
        const newColor = prompt("Enter hex color (e.g., #FF0000):", this.sketchPad.strokeColor);
        if (newColor && CanvasSketcher.Utility.isHexColor(newColor)) {
            this.sketchPad.setStrokeColor(newColor);
        }
    });
};
CanvasSketcher.Control.ColorPicker.prototype = Object.create(CanvasSketcher.Control.BaseTool.prototype);
CanvasSketcher.Control.ColorPicker.prototype.constructor = CanvasSketcher.Control.ColorPicker;

// Example DrawingModeSelector
CanvasSketcher.Control.DrawingModeSelector = function(sketchPadInstance, options) {
    CanvasSketcher.Control.BaseTool.call(this, sketchPadInstance, options);
    this.domElement.addClass('sketch-tool-mode-selector');
    this.domElement.html(`
        <button data-mode="pencil">Pencil</button>
        <button data-mode="eraser">Eraser</button>
        <button data-mode="filler">Fill</button>
    `);
    this.domElement.on('click', 'button', (e) => {
        const mode = $(e.target).data('mode');
        this.sketchPad.setDrawingMode(mode);
        this.domElement.find('button').removeClass('active');
        $(e.target).addClass('active');
    });
    // Set initial active state
    this.sketchPad.eventBus.on('sketchPad:modeChanged', (mode) => {
        this.domElement.find('button').removeClass('active');
        this.domElement.find(`button[data-mode="${mode}"]`).addClass('active');
    });
    // Trigger initial setup
    setTimeout(() => {
        this.domElement.find(`button[data-mode="${this.sketchPad.getCurrentDrawingMode()}"]`).addClass('active');
    }, 0); // Defer to ensure sketchPad is fully initialized.
};
CanvasSketcher.Control.DrawingModeSelector.prototype = Object.create(CanvasSketcher.Control.BaseTool.prototype);
CanvasSketcher.Control.DrawingModeSelector.prototype.constructor = CanvasSketcher.Control.DrawingModeSelector;

// Example StrokeWidth
CanvasSketcher.Control.StrokeWidth = function(sketchPadInstance, options) {
    CanvasSketcher.Control.BaseTool.call(this, sketchPadInstance, options);
    this.domElement.addClass('sketch-tool-stroke-width');
    this.domElement.html(`
        <label for="stroke-size-${this.sketchPad.hostId}">Size:</label>
        <input type="range" id="stroke-size-${this.sketchPad.hostId}" min="1" max="50" value="${this.sketchPad.renderContext.lineWidth}">
    `);
    this.inputElement = this.domElement.find('input');
    this.inputElement.on('input', () => {
        this.sketchPad.renderContext.lineWidth = parseInt(this.inputElement.val(), 10);
    });
    // Update input if sketchPad's size changes via other means
    this.sketchPad.eventBus.on('sketchPad:reset', () => {
        this.inputElement.val(this.sketchPad.renderContext.lineWidth);
    });
};
CanvasSketcher.Control.StrokeWidth.prototype = Object.create(CanvasSketcher.Control.BaseTool.prototype);
CanvasSketcher.Control.StrokeWidth.prototype.constructor = CanvasSketcher.Control.StrokeWidth;

// Example HistoryNavigator
CanvasSketcher.Control.HistoryNavigator = function(sketchPadInstance, options) {
    CanvasSketcher.Control.BaseTool.call(this, sketchPadInstance, options);
    this.canReset = this.options.canReset !== undefined ? this.options.canReset : true;
    this.domElement.addClass('sketch-tool-history-nav');
    this.domElement.html(`
        <button class="undo-btn">Undo</button>
        <button class="redo-btn">Redo</button>
        ${this.canReset ? '<button class="reset-btn">Reset</button>' : ''}
    `);
    this.undoButton = this.domElement.find('.undo-btn');
    this.redoButton = this.domElement.find('.redo-btn');
    this.resetButton = this.domElement.find('.reset-btn');

    this.undoButton.on('click', () => this.sketchPad.undoLastAction());
    this.redoButton.on('click', () => this.sketchPad.redoNextAction());
    if (this.canReset) {
        this.resetButton.on('click', () => {
            if (confirm("Are you sure you want to clear the canvas? This action cannot be undone.")) {
                this.sketchPad.clearAndConfigure({
                    useWebStorage: true,
                    trackHistory: true,
                    resetBackground: true,
                    newColor: this.sketchPad.configuration.defaultStrokeColor,
                    newSize: this.sketchPad.configuration.initialStrokeSize
                });
            }
        });
    }

    // Update button states based on history.
    this.sketchPad.eventBus.on('history:navigated', (currentIndex) => {
        const totalStates = this.sketchPad.actionHistory.states.length;
        this.undoButton.prop('disabled', currentIndex <= 1);
        this.redoButton.prop('disabled', currentIndex >= totalStates);
    });
    // Initial state setup.
    setTimeout(() => {
        const totalStates = this.sketchPad.actionHistory.states.length;
        this.undoButton.prop('disabled', this.sketchPad.actionHistory.currentIndex <= 1);
        this.redoButton.prop('disabled', this.sketchPad.actionHistory.currentIndex >= totalStates);
    }, 0);
};
CanvasSketcher.Control.HistoryNavigator.prototype = Object.create(CanvasSketcher.Control.BaseTool.prototype);
CanvasSketcher.Control.HistoryNavigator.prototype.constructor = CanvasSketcher.Control.HistoryNavigator;