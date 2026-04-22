// --- Core Application Initialization & Utilities ---

// A centralized logging utility to manage application messages.
const AppLog = {
    info: (message, ...data) => console.info(`[AppInfo] ${message}`, ...data),
    warn: (message, ...data) => console.warn(`[AppWarning] ${message}`, ...data),
    error: (message, ...data) => console.error(`[AppError] ${message}`, ...data),
    debug: (message, ...data) => console.debug(`[AppDebug] ${message}`, ...data),
};

// Manages the initial loading of critical external scripts.
const ExternalScriptLoader = (() => {
    const loadDiscussionWidget = () => {
        AppLog.info("Initiating load sequence for community discussion module...");
        const widgetScript = document.createElement("script");
        widgetScript.src = "/assets/scripts/forum_embed.min.js"; // Updated path and filename
        widgetScript.type = 'application/javascript';
        widgetScript.async = true; // Non-blocking script loading

        const discussionContainer = document.getElementById("communityFeedbackZone"); // Renamed element ID
        if (discussionContainer) {
            discussionContainer.prepend(widgetScript);
            AppLog.info("Discussion module script successfully injected into the DOM.");
        } else {
            AppLog.warn("Target host element '#communityFeedbackZone' not found. Discussion module may not function.");
        }
    };

    return {
        initOnAppReady: loadDiscussionWidget // Renamed method
    };
})();

// Execute initial setup tasks when the host environment (e.g., Meteor) is ready.
// Provides a fallback for non-Meteor environments.
if (typeof Meteor !== 'undefined' && Meteor.startup) {
    Meteor.startup(() => {
        // Ensure DOM is fully loaded before script insertion.
        jQuery(document).ready(() => ExternalScriptLoader.initOnAppReady());
    });
} else {
    AppLog.warn("Meteor environment not detected. Deferring external script loading to standard DOMContentLoaded event.");
    document.addEventListener('DOMContentLoaded', () => ExternalScriptLoader.initOnAppReady());
}


// --- Global Application Configuration ---

// Immutable configuration settings for the design canvas and grid system.
const DesignConfiguration = Object.freeze({
    CANVAS_VIEWPORT_WIDTH: 780, // Increased canvas dimensions
    CANVAS_VIEWPORT_HEIGHT: 850,
    GRID_UNIT_HEIGHT: 45, // Fixed grid unit height
    GRID_UNIT_WIDTH: null, // Will be calculated dynamically based on columns
    DEFAULT_ELEMENT_TRANSPARENCY: 0.75, // Renamed and adjusted opacity
    SELECTION_OUTLINE_COLOR: '#FF6347', // New selection color (Tomato)
    GRID_GUIDE_COLOR: '#B0C4DE', // Updated grid line color (LightSteelBlue)
    GRID_GUIDE_THICKNESS: 0.6, // Adjusted grid line thickness
    DRAG_HIGHLIGHT_COLOR: 'rgba(255, 99, 71, 0.2)', // New color for drag highlight
});

// --- Component Registry and State Management ---

// Manages all visual components present on the design canvas.
const VisualComponentRegistry = (() => {
    let allRenderedComponents = []; // Renamed from allVisualComponents
    let currentlyFocusedComponent = null; // Renamed from activeVisualComponent

    const addComponentToRegistry = (componentItem) => {
        if (!componentItem || typeof componentItem.getUniqueNodeId !== 'function') {
            AppLog.error("Attempted to register an invalid component object.", componentItem);
            return;
        }
        allRenderedComponents.push(componentItem);
        AppLog.debug(`Component registered: ${componentItem.getUniqueNodeId()}`);
    };

    const focusOnComponent = (componentItem) => {
        if (!componentItem) {
            AppLog.warn("Cannot focus on a null or undefined component.");
            return;
        }

        if (currentlyFocusedComponent && currentlyFocusedComponent.getUniqueNodeId() !== componentItem.getUniqueNodeId()) {
            currentlyFocusedComponent.hideResizeHandles(); // Renamed method
            AppLog.debug(`De-focused previous component: ${currentlyFocusedComponent.getUniqueNodeId()}`);
        }
        currentlyFocusedComponent = componentItem;
        componentItem.showResizeHandles(); // Ensure handles are shown for the new focused component
        mainRenderLayer.draw(); // Redraw to show/hide handles
        AppLog.debug(`Component focused: ${componentItem.getUniqueNodeId()}`);
    };

    const clearFocusedComponents = () => {
        if (currentlyFocusedComponent) {
            currentlyFocusedComponent.hideResizeHandles();
            currentlyFocusedComponent = null;
            mainRenderLayer.draw();
            AppLog.debug("All component focus cleared.");
        }
    };

    const cloneFocusedComponent = () => {
        AppLog.warn("Cloning functionality for components is currently under development.");
        // This remains an unimplemented feature from the original code.
    };

    const removeFocusedComponent = () => {
        if (!currentlyFocusedComponent) {
            AppLog.warn("No component is currently focused for removal.");
            return;
        }

        const componentIdToRemove = currentlyFocusedComponent.getUniqueNodeId();
        const componentIdx = allRenderedComponents.findIndex(
            (comp) => comp.getKonvaElement().id() === componentIdToRemove
        );

        if (componentIdx !== -1) {
            const [removedComponent] = allRenderedComponents.splice(componentIdx, 1);
            removedComponent.destroyKonvaElement(); // Ensure Konva node is removed from the canvas
            AppLog.info(`Component '${componentIdToRemove}' successfully deregistered and removed from canvas.`);
            currentlyFocusedComponent = null; // Clear the focused component reference
            mainRenderLayer.draw(); // Trigger a redraw
        } else {
            AppLog.warn(`Focused component '${componentIdToRemove}' not found in the registry.`);
        }
    };

    return {
        addComponentToRegistry,
        focusOnComponent,
        clearFocusedComponents,
        cloneFocusedComponent,
        removeFocusedComponent,
        getAllComponents: () => [...allRenderedComponents], // Return a defensive copy
        getCurrentlyFocusedComponent: () => currentlyFocusedComponent,
    };
})();


// --- Canvas Elements and Global Variables ---

let mainRenderLayer; // Renamed from mainCanvasLayer
let headerLayoutBlock, footerLayoutBlock, contentLayoutBlock; // Renamed region elements
let gridHighlightOverlay; // Renamed from layoutHighlightBox
let elementSerialNumber = 0; // Renamed from componentSerialNumber

// --- General Utility Functions ---
const ApplicationUtils = {
    // Performs AABB collision detection between two Konva.Shape objects.
    checkOverlap: (shapeA, shapeB) => {
        const boundsA = shapeA.getClientRect();
        const boundsB = shapeB.getClientRect();
        return !(boundsA.x > boundsB.x + boundsB.width ||
                 boundsA.x + boundsA.width < boundsB.x ||
                 boundsA.y > boundsB.y + boundsB.height ||
                 boundsA.y + boundsA.height < boundsB.y);
    },
    // Determines which predefined layout region a given Konva element occupies.
    identifyCanvasRegion: (elementKonvaNode) => {
        if (!elementKonvaNode) return "UndefinedRegion";

        if (headerLayoutBlock && ApplicationUtils.checkOverlap(headerLayoutBlock.getKonvaElement(), elementKonvaNode)) {
            return "HeaderRegion";
        }
        if (footerLayoutBlock && ApplicationUtils.checkOverlap(footerLayoutBlock.getKonvaElement(), elementKonvaNode)) {
            return "FooterRegion";
        }
        return "ContentRegion"; // Default to content area
    },
    // Simple debounce function to limit function call rate.
    throttle: (func, limit) => {
        let inThrottle;
        let lastResult;
        return function(...args) {
            const context = this;
            if (!inThrottle) {
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
                lastResult = func.apply(context, args);
            }
            return lastResult;
        };
    }
};


// --- Main DOM Ready Initialization ---

// Key codes for keyboard event handling.
const KeyboardInput = Object.freeze({
    MODIFIER_CONTROL: 'Control',
    ACTION_DELETE: 'Delete',
    ACTION_COPY: 'c',
    ACTION_PASTE: 'v',
});

let isControlKeyPressed = false; // Renamed from isControlKeyActive

jQuery(document).ready(function () {
    AppLog.info("Document ready. Starting main application setup.");

    initAnalyticsTracking(); // Renamed function
    setupUserFeedbackWidget(); // Renamed function

    // Programmatically activate the default editor tab.
    jQuery('#designSystemTabs a[href="#editorPane"]').trigger('click'); // Renamed IDs

    // Global keyboard event handlers for design operations.
    jQuery('body').on('keydown', (e) => {
        if (e.key === KeyboardInput.ACTION_DELETE) {
            const activeElement = VisualComponentRegistry.getCurrentlyFocusedComponent();
            if (activeElement) {
                VisualComponentRegistry.removeFocusedComponent();
                e.preventDefault(); // Prevent browser default actions for Delete key.
                AppLog.debug("Delete key pressed: Focused component removed.");
            } else {
                AppLog.debug("Delete key pressed, but no component is focused.");
            }
        } else if (e.key === KeyboardInput.MODIFIER_CONTROL) {
            isControlKeyPressed = true;
            AppLog.debug("Control key activated.");
        }
    }).on('keyup', (e) => {
        if (e.key === KeyboardInput.MODIFIER_CONTROL) {
            isControlKeyPressed = false;
            AppLog.debug("Control key de-activated.");
        }
    });

    // Initialize the Konva (KineticJS successor) Stage and Layer.
    const canvasMountPoint = 'canvasDesignArea'; // Renamed container ID
    const canvasElementTarget = document.getElementById(canvasMountPoint);
    if (!canvasElementTarget) {
        AppLog.error(`Canvas mount point '${canvasMountPoint}' not found. Canvas rendering aborted.`);
        return;
    }

    const mainCanvasStage = new Konva.Stage({
        container: canvasMountPoint,
        width: DesignConfiguration.CANVAS_VIEWPORT_WIDTH,
        height: DesignConfiguration.CANVAS_VIEWPORT_HEIGHT
    });

    mainRenderLayer = new Konva.Layer(); // Renamed variable

    // Helper to create and add static layout blocks (header, footer, content).
    const instantiateLayoutBlock = (blockConfig) => {
        const layoutBlock = ElementFactory.createRectangle({ // Renamed ShapeConstructor to ElementFactory
            properties: blockConfig.styles,
            handlePlacement: blockConfig.resizeHandles
        });
        mainRenderLayer.add(layoutBlock.getKonvaElement());
        return layoutBlock;
    };

    headerLayoutBlock = instantiateLayoutBlock({
        styles: {
            x: 0, y: 0, width: DesignConfiguration.CANVAS_VIEWPORT_WIDTH, height: 70, // Adjusted height
            fill: '#E6F0FF', stroke: '#C0D0E0', strokeWidth: 1.2, // Updated styling
            opacity: DesignConfiguration.DEFAULT_ELEMENT_TRANSPARENCY,
            draggable: false, locked: true
        },
        resizeHandles: { top: false, right: false, bottom: true, left: false }
    });

    contentLayoutBlock = instantiateLayoutBlock({
        styles: {
            x: 0, y: 70, width: DesignConfiguration.CANVAS_VIEWPORT_WIDTH, height: DesignConfiguration.CANVAS_VIEWPORT_HEIGHT - 140, // Dynamic height calculation
            fill: '#F5F8FF', stroke: '#C0D0E0', strokeWidth: 1.2,
            opacity: 0.65, // Slightly different opacity for content
            draggable: false, locked: true
        },
        resizeHandles: { top: false, right: false, bottom: false, left: false }
    });

    footerLayoutBlock = instantiateLayoutBlock({
        styles: {
            x: 0, y: DesignConfiguration.CANVAS_VIEWPORT_HEIGHT - 70, width: DesignConfiguration.CANVAS_VIEWPORT_WIDTH, height: 70, // Dynamic Y position and height
            fill: '#E6F0FF', stroke: '#C0D0E0', strokeWidth: 1.2,
            opacity: DesignConfiguration.DEFAULT_ELEMENT_TRANSPARENCY,
            draggable: false, locked: true
        },
        resizeHandles: { top: true, right: false, bottom: false, left: false }
    });

    mainCanvasStage.add(mainRenderLayer);
    mainRenderLayer.draw(); // Perform an initial draw of the canvas.

    AppLog.info("Konva canvas stage and primary layout blocks initialized.");
});


// --- Component Abstractions and Factory ---

// Base class for all visual elements on the canvas.
class VisualElementBase {
    constructor(config) {
        this.configuration = config;
        this._konvaNode = null; // Internal Konva.js node reference
        this._uniqueId = `entity_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`; // Robust unique ID generation

        // Merge default visual properties with provided configuration.
        this.visualProperties = {
            x: 0, y: 0, width: 60, height: 60, // Default dimensions slightly larger
            fill: '#DDDDDD', stroke: '#AAAAAA', strokeWidth: 1.5,
            opacity: DesignConfiguration.DEFAULT_ELEMENT_TRANSPARENCY,
            draggable: true, locked: false,
            visible: true
        };
        Object.assign(this.visualProperties, config.properties);
    }

    getUniqueNodeId() {
        return this._uniqueId;
    }

    getKonvaElement() {
        return this._konvaNode;
    }

    destroyKonvaElement() {
        if (this._konvaNode) {
            this._konvaNode.destroy();
            AppLog.debug(`Konva node for component '${this.getUniqueNodeId()}' destroyed.`);
        }
    }

    hideResizeHandles() {
        // Placeholder for actual handle visibility logic (e.g., using Konva.Transformer)
        AppLog.debug(`Concealing resize handles for: ${this.getUniqueNodeId()}`);
    }

    showResizeHandles() {
        // Placeholder for actual handle visibility logic
        AppLog.debug(`Revealing resize handles for: ${this.getUniqueNodeId()}`);
    }
}

// Concrete implementation for a rectangular visual element.
class RectangleVisual extends VisualElementBase {
    constructor(config) {
        super(config);
        this._konvaNode = new Konva.Rect({
            ...this.visualProperties,
            id: this.getUniqueNodeId(), // Assign unique ID to Konva node
        });

        // Event listeners for user interaction.
        this._konvaNode.on('click tap', () => {
            VisualComponentRegistry.focusOnComponent(this);
        });

        this._konvaNode.on('dragend', () => {
            AppLog.debug(`Rectangle element ${this.getUniqueNodeId()} finalized drag to x:${this._konvaNode.x()}, y:${this._konvaNode.y()}`);
            // Optional: Snap to grid after drag.
        });
    }
}

// Concrete implementation for a text label visual element.
class TextLabelVisual extends VisualElementBase {
    constructor(config) {
        super(config);
        this.visualProperties.text = config.properties.text || 'Default Text Label';
        this.visualProperties.fontSize = config.properties.fontSize || 18; // Increased default font size
        this.visualProperties.fontFamily = config.properties.fontFamily || 'Verdana'; // Changed default font
        this.visualProperties.fill = config.properties.fill || '#333333'; // Darker text color

        this._konvaNode = new Konva.Text({
            ...this.visualProperties,
            id: this.getUniqueNodeId(),
        });

        this._konvaNode.on('click tap', () => {
            VisualComponentRegistry.focusOnComponent(this);
        });

        this._konvaNode.on('dragend', () => {
            AppLog.debug(`Text label element ${this.getUniqueNodeId()} finalized drag to x:${this._konvaNode.x()}, y:${this._konvaNode.y()}`);
        });
    }
}

// Factory for creating different types of visual elements.
const ElementFactory = {
    createRectangle: (config) => new RectangleVisual(config),
    createTextLabel: (config) => new TextLabelVisual(config),
    // Future expansion: createCircle, createImage, etc.
};


// --- Layout Design Management Module ---

function LayoutDesignManager(initialGridCols) { // Renamed Editor to LayoutDesignManager
    // Map component type strings to their respective factory methods.
    const componentConstructorsMap = {
        TEXT_ELEMENT: ElementFactory.createTextLabel, // Renamed and using factory
        BOX_ELEMENT: ElementFactory.createRectangle // Renamed and using factory
    };

    // A collection of visual style presets for new components.
    const componentStylePresets = {
        "style_a": { fill: "#D4EDDA", stroke: "#28A745" }, // Greenish
        "style_b": { fill: "#CCE5FF", stroke: "#007BFF" }, // Bluish
        "style_c": { fill: "#FFF3CD", stroke: "#FFC107" }, // Yellowish
        "style_d": { fill: "#F8D7DA", stroke: "#DC3545" }, // Reddish
        "style_e": { fill: "#E2E3E5", stroke: "#6C757D" }, // Grayish
        "style_f": { fill: "#D1ECF1", stroke: "#17A2B8" }  // Cyan
    };
    const styleKeys = Object.keys(componentStylePresets);

    // Generates and renders the background grid lines on the canvas.
    const generateVisualGrid = (columnCount) => {
        if (columnCount <= 0 || !Number.isInteger(columnCount)) {
            AppLog.error(`Invalid column count for grid generation: ${columnCount}. Must be a positive integer.`);
            return;
        }

        DesignConfiguration.GRID_UNIT_WIDTH = DesignConfiguration.CANVAS_VIEWPORT_WIDTH / columnCount;
        const rowCount = Math.floor(DesignConfiguration.CANVAS_VIEWPORT_HEIGHT / DesignConfiguration.GRID_UNIT_HEIGHT);

        // Grid highlight overlay for drag-and-drop feedback.
        gridHighlightOverlay = ElementFactory.createRectangle({ // Renamed and using factory
            properties: {
                x: 0, y: 0, width: DesignConfiguration.GRID_UNIT_WIDTH, height: DesignConfiguration.GRID_UNIT_HEIGHT,
                draggable: false, locked: true, opacity: 0.2, // Reduced opacity for highlight
                fill: DesignConfiguration.DRAG_HIGHLIGHT_COLOR, stroke: DesignConfiguration.SELECTION_OUTLINE_COLOR,
                strokeWidth: 1, visible: false // Initially hidden
            },
            handlePlacement: { top: false, right: false, bottom: false, left: false }
        });
        mainRenderLayer.add(gridHighlightOverlay.getKonvaElement());

        // Draw horizontal grid lines.
        for (let r = 0; r <= rowCount; r++) {
            const hLine = new Konva.Line({
                points: [0, r * DesignConfiguration.GRID_UNIT_HEIGHT, DesignConfiguration.CANVAS_VIEWPORT_WIDTH, r * DesignConfiguration.GRID_UNIT_HEIGHT],
                stroke: DesignConfiguration.GRID_GUIDE_COLOR,
                strokeWidth: DesignConfiguration.GRID_GUIDE_THICKNESS
            });
            mainRenderLayer.add(hLine);
        }

        // Draw vertical grid lines.
        for (let c = 0; c <= columnCount; c++) {
            const vLine = new Konva.Line({
                points: [c * DesignConfiguration.GRID_UNIT_WIDTH, 0, c * DesignConfiguration.GRID_UNIT_WIDTH, DesignConfiguration.CANVAS_VIEWPORT_HEIGHT],
                stroke: DesignConfiguration.GRID_GUIDE_COLOR,
                strokeWidth: DesignConfiguration.GRID_GUIDE_THICKNESS
            });
            mainRenderLayer.add(vLine);
        }

        mainRenderLayer.draw();
        AppLog.debug(`Visual grid initialized with ${columnCount} columns and ${rowCount} rows.`);
    };

    // Call grid generation on module initialization.
    generateVisualGrid(initialGridCols);

    // Adds a new component to the canvas, snapping it to the grid.
    const addNewComponentToCanvas = (targetKonvaLayer, componentIdString, dropCoordinates) => {
        if (!targetKonvaLayer || !componentIdString || typeof dropCoordinates.x === 'undefined' || typeof dropCoordinates.y === 'undefined') {
            AppLog.error("Invalid parameters for addNewComponentToCanvas.", { targetKonvaLayer, componentIdString, dropCoordinates });
            return;
        }

        const typeSegments = componentIdString.split("_");
        const baseComponentType = typeSegments[0].toUpperCase().trim();
        let assignedColumnSpan = parseInt(typeSegments[1], 10);

        if (!componentConstructorsMap[baseComponentType]) {
            AppLog.warn(`Unrecognized component type identifier: '${baseComponentType}'. Component not added.`);
            return;
        }
        if (isNaN(assignedColumnSpan) || assignedColumnSpan <= 0) {
            AppLog.warn(`Invalid column span for component '${componentIdString}'. Defaulting to 1 unit.`);
            assignedColumnSpan = 1;
        }

        // Calculate grid-snapped position.
        let gridX = Math.floor(dropCoordinates.x / DesignConfiguration.GRID_UNIT_WIDTH);
        let gridY = Math.floor(dropCoordinates.y / DesignConfiguration.GRID_UNIT_HEIGHT);

        // Snap to the nearest grid line based on the center of the dropped point.
        if ((dropCoordinates.x % DesignConfiguration.GRID_UNIT_WIDTH) > (DesignConfiguration.GRID_UNIT_WIDTH / 2)) {
            gridX++;
        }
        if ((dropCoordinates.y % DesignConfiguration.GRID_UNIT_HEIGHT) > (DesignConfiguration.GRID_UNIT_HEIGHT / 2)) {
            gridY++;
        }

        const snappedXCoord = gridX * DesignConfiguration.GRID_UNIT_WIDTH;
        const snappedYCoord = gridY * DesignConfiguration.GRID_UNIT_HEIGHT;

        // Cycle through predefined styles for new components.
        const dynamicStyle = componentStylePresets[styleKeys[elementSerialNumber % styleKeys.length]];

        const newElement = componentConstructorsMap[baseComponentType]({
            properties: {
                x: snappedXCoord,
                y: snappedYCoord,
                width: DesignConfiguration.GRID_UNIT_WIDTH * assignedColumnSpan,
                height: DesignConfiguration.GRID_UNIT_HEIGHT, // Default height for new elements
                opacity: DesignConfiguration.DEFAULT_ELEMENT_TRANSPARENCY,
                fill: dynamicStyle.fill,
                stroke: dynamicStyle.stroke,
                strokeWidth: 2.5, // Slightly more pronounced border for new elements
                text: `${baseComponentType} ${++elementSerialNumber}` // Dynamic text for labels
            }
        });

        targetKonvaLayer.add(newElement.getKonvaElement());
        targetKonvaLayer.draw();
        VisualComponentRegistry.addComponentToRegistry(newElement); // Add to the global registry
        AppLog.debug(`New component '${baseComponentType}' added to canvas at grid (${gridX}, ${gridY}), in ${ApplicationUtils.identifyCanvasRegion(newElement.getKonvaElement())}.`);
    };

    return {
        addNewComponent: addNewComponentToCanvas,
        // Potentially expose other grid-related functionality here.
    };
}


// --- Drag & Drop Interaction Handlers ---

let canvasClientOffset = { x: 0, y: 0 }; // Renamed canvasOffsetInfo
let layoutDesignInstance; // Renamed layoutDesignerInstance

// Initiates a drag operation from the component palette.
function handleComponentDragStart(event) {
    const componentIdentifier = event.target.dataset.componentId; // Using data-component-id attribute
    if (componentIdentifier) {
        event.dataTransfer.setData("application/x-design-component-type", componentIdentifier); // Custom MIME type
        event.dataTransfer.effectAllowed = 'copy'; // Explicitly allow copying
        AppLog.debug(`Drag operation started for component: ${componentIdentifier}`);
    } else {
        AppLog.warn("Dragged palette item missing 'data-component-id' attribute.");
        event.preventDefault(); // Prevent invalid drag operations
    }
}

// Handles elements being dragged over the canvas area.
function handleCanvasDragOver(event) {
    if (event.dataTransfer.types.includes("application/x-design-component-type")) {
        event.preventDefault(); // Essential to allow drop
        event.dataTransfer.dropEffect = 'copy'; // Visual feedback for a copy operation

        // Update the grid highlight overlay position.
        const targetX = event.clientX - canvasClientOffset.x;
        const targetY = event.clientY - canvasClientOffset.y;

        const snappedX = Math.floor(targetX / DesignConfiguration.GRID_UNIT_WIDTH) * DesignConfiguration.GRID_UNIT_WIDTH;
        const snappedY = Math.floor(targetY / DesignConfiguration.GRID_UNIT_HEIGHT) * DesignConfiguration.GRID_UNIT_HEIGHT;

        if (gridHighlightOverlay) {
            gridHighlightOverlay.getKonvaElement().position({ x: snappedX, y: snappedY });
            gridHighlightOverlay.getKonvaElement().show();
            mainRenderLayer.draw();
        }
    }
}

// Handles the final drop event on the canvas.
function handleCanvasDrop(event) {
    event.preventDefault();
    event.stopPropagation(); // Stop event propagation to prevent unintended side effects

    const componentTypeData = event.dataTransfer.getData("application/x-design-component-type");
    if (!componentTypeData) {
        AppLog.warn("No component type data found in drop event payload.");
        return;
    }

    const dropPositionX = event.clientX - canvasClientOffset.x;
    const dropPositionY = event.clientY - canvasClientOffset.y;

    layoutDesignInstance.addNewComponent(mainRenderLayer, componentTypeData, { x: dropPositionX, y: dropPositionY });
    AppLog.info(`Component '${componentTypeData}' successfully dropped at canvas coordinates (${dropPositionX}, ${dropPositionY}).`);

    // Hide the highlight overlay after drop.
    if (gridHighlightOverlay) {
        gridHighlightOverlay.getKonvaElement().hide();
        mainRenderLayer.draw();
    }
}

// Handles drag leave event from canvas.
function handleCanvasDragLeave(event) {
    // Hide the highlight overlay when drag leaves the canvas.
    if (gridHighlightOverlay) {
        gridHighlightOverlay.getKonvaElement().hide();
        mainRenderLayer.draw();
    }
}

// Sets up all necessary drag and drop event listeners across the application.
function initializeDragAndDrop() {
    const paletteItems = document.querySelectorAll('.component-palette-item'); // Renamed class
    paletteItems.forEach(item => {
        item.addEventListener('dragstart', handleComponentDragStart, false);
    });

    const canvasTarget = document.getElementById('canvasDesignArea'); // Renamed ID
    if (canvasTarget) {
        canvasTarget.addEventListener('dragover', handleCanvasDragOver, false);
        canvasTarget.addEventListener('drop', handleCanvasDrop, false);
        canvasTarget.addEventListener('dragleave', handleCanvasDragLeave, false); // Added dragleave handler
    } else {
        AppLog.error("Canvas drop target 'canvasDesignArea' not found for D&D setup.");
    }
}


// --- External Service Integration Functions ---

// Initializes Google Analytics tracking.
function initAnalyticsTracking() {
    AppLog.debug("Preparing Google Analytics integration...");
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-98765432-Z', 'auto'); // Updated placeholder ID and 'auto' for modern GA
    ga('send', 'pageview');
    AppLog.info("Google Analytics loaded and initial pageview event sent.");
}

// Configures the UserVoice feedback widget.
function setupUserFeedbackWidget() {
    AppLog.debug("Configuring UserVoice feedback widget...");
    // Include the UserVoice JavaScript SDK
    window.UserVoice=window.UserVoice||[];(function(){var uv=document.createElement('script');uv.type='text/javascript';uv.async=true;uv.src='//widget.uservoice.com/YOUR_CUSTOM_WIDGET_KEY.js';var s=document.getElementsByTagName('script')[0];s.parentNode.insertBefore(uv,s)})();

    // Apply custom styling for the widget.
    UserVoice.push(['set', {
      accent_color: '#3498db',
      trigger_color: '#ffffff',
      trigger_background_color: '#2ecc71'
    }]);

    // Add a default contact trigger to the bottom-right of the viewport.
    UserVoice.push(['addTrigger', { mode: 'contact', trigger_position: 'bottom-right' }]);
    AppLog.info("UserVoice feedback widget successfully configured.");
}


// --- Layout Data Export Functions ---

// Sorts visual components based on their position on the canvas (top-left first).
function sortVisualEntities(componentCollection) {
    if (!Array.isArray(componentCollection)) {
        AppLog.error("sortVisualEntities requires an array of components.");
        return [];
    }
    return [...componentCollection].sort((compA, compB) => {
        const nodeA = compA.getKonvaElement();
        const nodeB = compB.getKonvaElement();
        if (!nodeA || !nodeB) return 0; // Handle cases where a Konva node might be missing

        // Sort primarily by Y-coordinate, then by X-coordinate.
        const yDiff = nodeA.y() - nodeB.y();
        return yDiff !== 0 ? yDiff : nodeA.x() - nodeB.x();
    });
}

// Generates a structured data representation of the current layout.
function generateStandardLayoutData() {
    const sortedElements = sortVisualEntities(VisualComponentRegistry.getAllComponents());
    const layoutItems = [];
    for (const element of sortedElements) {
        const elementNode = element.getKonvaElement();
        if (!elementNode) continue; // Skip if no Konva node is present

        const absoluteCoords = elementNode.getAbsolutePosition();
        layoutItems.push({
            gridColumn: Math.floor(absoluteCoords.x / DesignConfiguration.GRID_UNIT_WIDTH),
            gridRow: Math.floor(absoluteCoords.y / DesignConfiguration.GRID_UNIT_HEIGHT),
            spanColumns: Math.floor(elementNode.width() / DesignConfiguration.GRID_UNIT_WIDTH),
            spanRows: Math.floor(elementNode.height() / DesignConfiguration.GRID_UNIT_HEIGHT),
            elementUuid: element.getUniqueNodeId(), // Unique identifier for the element
            elementType: elementNode.className // Konva's class name (e.g., 'Rect', 'Text')
        });
    }
    AppLog.debug("Standard layout data generated.", layoutItems);
    return layoutItems;
}

// Creates layout data formatted for compatibility with Gridster/Bootstrap grid systems.
function generateGridsterCompatibleLayout() {
    const sortedElements = sortVisualEntities(VisualComponentRegistry.getAllComponents());
    const gridsterEntries = [];
    for (const element of sortedElements) {
        const elementNode = element.getKonvaElement();
        if (!elementNode) continue;

        const absoluteCoords = elementNode.getAbsolutePosition();
        gridsterEntries.push({
            col: Math.floor(absoluteCoords.x / DesignConfiguration.GRID_UNIT_WIDTH) + 1, // Gridster typically 1-indexed for columns
            row: Math.floor(absoluteCoords.y / DesignConfiguration.GRID_UNIT_HEIGHT) + 1, // Gridster typically 1-indexed for rows
            size_x: Math.floor(elementNode.width() / DesignConfiguration.GRID_UNIT_WIDTH),
            size_y: Math.floor(elementNode.height() / DesignConfiguration.GRID_UNIT_HEIGHT),
            content: `<div data-element-uuid="${element.getUniqueNodeId()}" class="gridster-item-content">${elementNode.className}</div>` // Example HTML content
        });
    }
    AppLog.debug("Gridster-compatible layout data generated.", gridsterEntries);
    return gridsterEntries;
}


// --- Final Application Setup (post-DOM Ready) ---

jQuery(document).ready(function () {
    const designAreaTarget = document.getElementById("canvasDesignArea");
    if (designAreaTarget) {
        const targetOffset = jQuery(designAreaTarget).offset();
        canvasClientOffset.x = targetOffset.left;
        canvasClientOffset.y = targetOffset.top;
        AppLog.debug(`Canvas client offset determined: X=${canvasClientOffset.x}, Y=${canvasClientOffset.y}`);
    } else {
        AppLog.error("Design area element not found for client offset calculation.");
    }

    // Instantiate the layout designer with a 12-column grid.
    layoutDesignInstance = LayoutDesignManager(12);

    // Set up all user interaction for drag and drop.
    initializeDragAndDrop();

    // Attach click handler for the layout export button.
    jQuery("#exportDesignButton").on('click', function() { // Renamed ID and used .on()
        AppLog.info("Export layout button clicked. Preparing data for export...");
        const standardData = generateStandardLayoutData();
        const gridsterCompatible = generateGridsterCompatibleLayout();

        // In a production environment, this data would be downloaded or sent to a backend.
        // For demonstration, we output to console and alert.
        console.group("Layout Export Data");
        console.log("Standardized Layout Format:", standardData);
        console.log("Gridster/Bootstrap Compatible Format:", gridsterCompatible);
        console.groupEnd();
        alert("Layout data has been exported to the browser console. Check developer tools!");
    });

    AppLog.info("Application core initialization and event bindings complete.");
});