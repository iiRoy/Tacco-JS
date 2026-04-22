// This file contains a suite of interactive UI components for a web application.
// It is developed under the provisions of the MIT License.
//
// MIT License
//
// Copyright (c) 2024 [Your Name/Organization]
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

/**
 * Global application configuration settings.
 * This object centralizes various configurable parameters used across the UI components.
 */
const appConfig = {
    // Default color for interactive button elements when active or hovered.
    interactionButtonColor: "#3498db",
    // The URL target for the utility script download.
    scriptDownloadTarget: "https://example.com/app/utility-script.js",
    // Standard dimension for square UI widgets.
    defaultWidgetSize: 64,
    // Font styling for text elements within widgets.
    widgetFont: "bold 16px 'Segoe UI', Arial, sans-serif"
};

/**
 * A utility class for loading and caching image assets.
 * This helps prevent redundant image requests and ensures images are ready before use.
 */
class ImageLoader {
    // A private static cache to store loaded Image objects.
    static #imageAssetCache = new Map();

    /**
     * Retrieves an image from the cache or loads it if not present.
     * Returns an HTMLImageElement, which may not be fully loaded immediately.
     * @param {string} assetPath The URL path to the image resource.
     * @returns {HTMLImageElement} The Image object.
     */
    static fetchOrCacheImage(assetPath) {
        if (typeof assetPath !== 'string' || assetPath.trim() === '') {
            console.error("ImageLoader: An invalid or empty asset path was provided.");
            return new Image(); // Return a blank image to avoid runtime errors.
        }
        if (ImageLoader.#imageAssetCache.has(assetPath)) {
            return ImageLoader.#imageAssetCache.get(assetPath);
        }

        const imgElement = new Image();
        imgElement.src = assetPath;
        // Optional: Log success or failure for debugging.
        imgElement.onload = () => { /* console.log(`Image loaded successfully: ${assetPath}`); */ };
        imgElement.onerror = (error) => {
            console.error(`ImageLoader: Failed to load image from ${assetPath}. Error:`, error);
        };
        ImageLoader.#imageAssetCache.set(assetPath, imgElement);
        return imgElement;
    }
}

/**
 * Base class for all interactive user interface elements (widgets).
 * Provides fundamental properties and methods for positioning, sizing, and interaction.
 */
class BaseWidget {
    /**
     * Initializes a new instance of a BaseWidget.
     * @param {number} startX The initial X coordinate of the widget's top-left corner.
     * @param {number} startY The initial Y coordinate of the widget's top-left corner.
     * @param {number} elemWidth The width of the widget in pixels.
     * @param {number} elemHeight The height of the widget in pixels.
     */
    constructor(startX, startY, elemWidth, elemHeight) {
        // Input validation for coordinates.
        if (!Number.isFinite(startX) || !Number.isFinite(startY) || startX < 0 || startY < 0) {
            console.warn(`BaseWidget: Invalid initial coordinates (${startX},${startY}). Setting to (0,0).`);
            this._coordX = 0;
            this._coordY = 0;
        } else {
            this._coordX = startX;
            this._coordY = startY;
        }

        // Input validation for dimensions, ensuring positive values.
        this._dimWidth = Math.max(1, Number.isFinite(elemWidth) ? elemWidth : appConfig.defaultWidgetSize);
        this._dimHeight = Math.max(1, Number.isFinite(elemHeight) ? elemHeight : appConfig.defaultWidgetSize);

        this._isPointerOver = false; // Tracks if the mouse pointer is currently hovering over the widget.
    }

    /**
     * Updates the widget's position on the display canvas.
     * @param {number} newX The new X coordinate.
     * @param {number} newY The new Y coordinate.
     */
    setWidgetPosition(newX, newY) {
        this._coordX = newX;
        this._coordY = newY;
    }

    /**
     * Executes the primary function or logic associated with this widget.
     * This method is a placeholder and should be overridden by specialized widget classes.
     */
    performWidgetAction() {
        // Default behavior: log a message. Specific actions are implemented in derived classes.
        console.log(`BaseWidget action triggered at (${this._coordX}, ${this._coordY}).`);
    }

    /**
     * Renders the visual representation of the widget onto the provided 2D rendering context.
     * This method is a placeholder and must be overridden by concrete widget implementations.
     * @param {CanvasRenderingContext2D} graphicContext The 2D rendering context of the canvas.
     */
    renderWidget(graphicContext) {
        if (!graphicContext) {
            console.error("BaseWidget.renderWidget: A valid graphic context is required for rendering.");
            return;
        }
        // For debugging, render a semi-transparent rectangle representing the widget's bounds.
        graphicContext.fillStyle = this._isPointerOver ? "rgba(200, 200, 200, 0.4)" : "rgba(100, 100, 100, 0.3)";
        graphicContext.fillRect(this._coordX, this._coordY, this._dimWidth, this._dimHeight);
    }

    /**
     * Determines if a given point (e.g., mouse coordinates) falls within the widget's bounding box.
     * Automatically updates the widget's internal pointer-over state.
     * @param {number} queryX The X coordinate of the point to check.
     * @param {number} queryY The Y coordinate of the point to check.
     * @returns {boolean} True if the point is within the widget's bounds, false otherwise.
     */
    checkBoundsForPoint(queryX, queryY) {
        const isCurrentlyOver = (queryX >= this._coordX) &&
                                (queryY >= this._coordY) &&
                                (queryX <= (this._coordX + this._dimWidth)) &&
                                (queryY <= (this._coordY + this._dimHeight));
        
        // Update the internal state only if it has changed, optimizing for redraws.
        if (isCurrentlyOver !== this._isPointerOver) {
            this._isPointerOver = isCurrentlyOver;
            // A redraw signal could be emitted here if needed for granular updates.
        }
        return isCurrentlyOver;
    }

    /**
     * Provides read-only access to the current pointer-over status.
     * @returns {boolean} True if the pointer is currently over the widget.
     */
    get pointerHoverState() {
        return this._isPointerOver;
    }
}

/**
 * A specialized widget designed to toggle between different display states,
 * such as fullscreen and windowed modes.
 */
class DisplayToggleWidget extends BaseWidget {
    // Static property for the default dimensions of this specific widget type.
    static WIDGET_DEFAULT_SIZE = appConfig.defaultWidgetSize;

    /**
     * Constructs a new DisplayToggleWidget instance.
     * @param {number} startX The initial X coordinate.
     * @param {number} startY The initial Y coordinate.
     */
    constructor(startX, startY) {
        super(startX, startY, DisplayToggleWidget.WIDGET_DEFAULT_SIZE, DisplayToggleWidget.WIDGET_DEFAULT_SIZE);
        this._isMaximizedView = false; // State variable: true for maximized, false for normal.

        // Pre-load all required image assets for different visual states.
        this._iconShrinkColored = ImageLoader.fetchOrCacheImage("assets/images/icon-shrink-active.png");
        this._iconExpandColored = ImageLoader.fetchOrCacheImage("assets/images/icon-expand-active.png");
        this._iconShrinkNormal = ImageLoader.fetchOrCacheImage("assets/images/icon-shrink-normal.png");
        this._iconExpandNormal = ImageLoader.fetchOrCacheImage("assets/images/icon-expand-normal.png");
    }

    /**
     * Renders the DisplayToggleWidget, adjusting its appearance based on current state and hover.
     * @param {CanvasRenderingContext2D} ctx The 2D rendering context.
     */
    renderWidget(ctx) {
        if (!ctx) {
            console.error("DisplayToggleWidget.renderWidget: Missing rendering context.");
            return;
        }

        let iconToDraw;
        // Select the appropriate icon based on the current display state and hover status.
        if (this._isMaximizedView) {
            iconToDraw = this._isPointerOver ? this._iconShrinkColored : this._iconShrinkNormal;
        } else {
            iconToDraw = this._isPointerOver ? this._iconExpandColored : this._iconExpandNormal;
        }

        // Provide visual feedback for hover state by drawing a subtle background.
        if (this._isPointerOver) {
            ctx.fillStyle = "rgba(100, 100, 100, 0.2)"; // Light grey overlay.
            ctx.fillRect(this._coordX, this._coordY, this._dimWidth, this._dimHeight);
        }
        
        // Draw the selected icon, ensuring it has completed loading.
        if (iconToDraw.complete && iconToDraw.naturalWidth > 0) {
            ctx.drawImage(iconToDraw, this._coordX, this._coordY, this._dimWidth, this._dimHeight);
        } else {
            // Fallback: draw a solid colored rectangle if the image isn't ready.
            ctx.fillStyle = this._isPointerOver ? appConfig.interactionButtonColor : "darkgrey";
            ctx.fillRect(this._coordX, this._coordY, this._dimWidth, this._dimHeight);
        }
    }

    /**
     * Toggles the internal display state between maximized and normal views.
     * In a full application, this would interface with the browser's Fullscreen API.
     */
    performWidgetAction() {
        this._isMaximizedView = !this._isMaximizedView;
        console.log(`Display mode has been switched to: ${this._isMaximizedView ? 'Maximized' : 'Normal'}.`);
        // Actual fullscreen API calls (e.g., document.documentElement.requestFullscreen()) would go here.
    }
}

/**
 * A widget designed to trigger the download of a specific script file.
 */
class ScriptAcquireWidget extends BaseWidget {
    // Static property for the default dimensions of this specific widget type.
    static WIDGET_DEFAULT_SIZE = appConfig.defaultWidgetSize;

    /**
     * Constructs a new ScriptAcquireWidget instance.
     * @param {number} startX The initial X coordinate.
     * @param {number} startY The initial Y coordinate.
     */
    constructor(startX, startY) {
        super(startX, startY, ScriptAcquireWidget.WIDGET_DEFAULT_SIZE, ScriptAcquireWidget.WIDGET_DEFAULT_SIZE);
        
        // Pre-load download icon assets.
        this._iconDownloadColored = ImageLoader.fetchOrCacheImage("assets/images/icon-download-active.png");
        this._iconDownloadNormal = ImageLoader.fetchOrCacheImage("assets/images/icon-download-normal.png");
    }

    /**
     * Renders the ScriptAcquireWidget. Displays informational text when hovered.
     * @param {CanvasRenderingContext2D} ctx The 2D rendering context.
     */
    renderWidget(ctx) {
        if (!ctx) {
            console.error("ScriptAcquireWidget.renderWidget: Missing rendering context.");
            return;
        }

        let iconToDraw = this._isPointerOver ? this._iconDownloadColored : this._iconDownloadNormal;

        // Draw the main download icon.
        if (iconToDraw.complete && iconToDraw.naturalWidth > 0) {
            ctx.drawImage(iconToDraw, this._coordX, this._coordY, this._dimWidth, this._dimHeight);
        } else {
            // Fallback: draw a solid rectangle if the image is not yet loaded.
            ctx.fillStyle = this._isPointerOver ? appConfig.interactionButtonColor : "grey";
            ctx.fillRect(this._coordX, this._coordY, this._dimWidth, this._dimHeight);
        }

        // Display additional text information if the widget is currently hovered.
        if (this._isPointerOver) {
            const informationalText = "Obtain Utility Script";
            ctx.font = appConfig.widgetFont;
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";

            // Calculate text positioning to appear centered above the widget.
            const textDrawX = this._coordX + (this._dimWidth / 2);
            const textDrawY = this._coordY - 12; // Offset above the widget.

            // Measure text to draw a background rectangle for better readability.
            const textMetrics = ctx.measureText(informationalText);
            const actualTextWidth = textMetrics.width;
            const estimatedTextHeight = parseInt(ctx.font) * 1.2; // Approximate line height.

            // Draw a semi-transparent dark background for the text.
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(textDrawX - actualTextWidth / 2 - 5, textDrawY - estimatedTextHeight,
                         actualTextWidth + 10, estimatedTextHeight + 5);

            // Draw the text itself in a contrasting color.
            ctx.fillStyle = "white";
            ctx.fillText(informationalText, textDrawX, textDrawY);
        }
    }

    /**
     * Initiates the script download by redirecting the browser's location.
     */
    performWidgetAction() {
        // This action will cause the browser to navigate to the specified download link.
        window.location.href = appConfig.scriptDownloadTarget;
        console.log(`Attempting to download script from: ${appConfig.scriptDownloadTarget}`);
    }
}

/**
 * Manages a collection of various interactive widgets, handling their layout, rendering,
 * and user input events (mouse movements and clicks).
 */
class WidgetCollection {
    /**
     * Initializes a new WidgetCollection.
     */
    constructor() {
        this._managedWidgets = []; // An array to hold all BaseWidget instances.
        this._currentWidgetCount = 0; // Tracks the number of widgets actively managed.
    }

    /**
     * Adds a new widget instance to the collection.
     * @param {BaseWidget} newWidgetInstance The widget object to add.
     * @returns {boolean} True if the widget was successfully added, false otherwise.
     */
    addInteractiveWidget(newWidgetInstance) {
        if (!(newWidgetInstance instanceof BaseWidget)) {
            console.warn("WidgetCollection.addInteractiveWidget: Only instances derived from BaseWidget can be added.");
            return false;
        }
        this._managedWidgets.push(newWidgetInstance);
        this._currentWidgetCount++;
        this.layoutWidgets(); // Re-layout all widgets after an addition.
        return true;
    }

    /**
     * Returns the total number of widgets currently managed by this collection.
     * @returns {number} The count of widgets.
     */
    get totalWidgetCount() {
        return this._currentWidgetCount;
    }

    /**
     * Arranges all widgets within the collection, typically in a horizontal line.
     * Parameters allow customization of starting position, spacing, and vertical alignment.
     * @param {number} [initialX=20] The X coordinate for the first widget.
     * @param {number} [bottomOffset=64] The vertical offset from the bottom of the canvas.
     * @param {number} [horizontalGap=15] The spacing between consecutive widgets.
     * @param {number} [canvasDisplayHeight=window.innerHeight] The total height of the rendering area.
     */
    layoutWidgets(initialX = 20, bottomOffset = 64, horizontalGap = 15, canvasDisplayHeight = window.innerHeight) {
        let currentPlacementX = initialX;
        // Determine the common height or maximum height to align widgets properly.
        const referenceWidgetHeight = this._managedWidgets.length > 0 ? this._managedWidgets[0]._dimHeight : appConfig.defaultWidgetSize;
        const targetPlacementY = canvasDisplayHeight - bottomOffset - referenceWidgetHeight;

        for (const widgetItem of this._managedWidgets) {
            widgetItem.setWidgetPosition(currentPlacementX, targetPlacementY);
            currentPlacementX += widgetItem._dimWidth + horizontalGap; // Advance X for the next widget.
        }
    }

    /**
     * Renders every widget in the collection onto the provided 2D canvas context.
     * @param {CanvasRenderingContext2D} ctx The 2D rendering context.
     */
    renderAllWidgets(ctx) {
        if (!ctx) {
            console.error("WidgetCollection.renderAllWidgets: No rendering context supplied.");
            return;
        }
        for (const widgetItem of this._managedWidgets) {
            widgetItem.renderWidget(ctx);
        }
    }

    /**
     * Processes a mouse movement event, updating the hover state for all widgets.
     * @param {MouseEvent} pointerEvent The mouse movement event object.
     */
    processPointerMove(pointerEvent) {
        const pointerX = pointerEvent.clientX;
        const pointerY = pointerEvent.clientY;
        let anyWidgetHovered = false;

        for (const widgetItem of this._managedWidgets) {
            const previousHoverState = widgetItem.pointerHoverState;
            widgetItem.checkBoundsForPoint(pointerX, pointerY); // Updates internal hover state.
            if (widgetItem.pointerHoverState) {
                anyWidgetHovered = true;
            }
            // If hover state changed, a partial redraw might be triggered in a more complex system.
            // For this example, we assume a full canvas redraw loop.
            if (previousHoverState !== widgetItem.pointerHoverState) {
                // console.log(`Widget hover state changed: ${widgetItem.constructor.name}`);
            }
        }
        // Could return `anyWidgetHovered` to inform if the pointer is over any UI element.
    }

    /**
     * Processes a mouse click event, triggering actions for any widgets that were clicked.
     * @param {MouseEvent} clickEvent The mouse click event object.
     */
    processPointerClick(clickEvent) {
        const clickX = clickEvent.clientX;
        const clickY = clickEvent.clientY;

        for (const widgetItem of this._managedWidgets) {
            // Check if the click occurred within the widget's bounds.
            if (widgetItem.checkBoundsForPoint(clickX, clickY)) {
                widgetItem.performWidgetAction(); // Execute the widget's associated action.
            }
        }
    }

    /**
     * Resets the pointer-over (hover) state for all widgets in the collection.
     * This is useful, for example, when the mouse leaves the entire canvas area.
     */
    clearAllHoverStates() {
        for (const widgetItem of this._managedWidgets) {
            widgetItem._isPointerOver = false;
        }
    }
}