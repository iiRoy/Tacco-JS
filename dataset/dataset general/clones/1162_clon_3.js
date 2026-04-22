/**
 * @file YUI Module for an advanced image trimming and cropping tool.
 * @author Original concept: ezgoing, 2014-09-14
 * @license MIT (assumed, as original had no license)
 * @version 1.1.0
 *
 * This module provides a robust, interactive image cropping interface
 * allowing users to pan and zoom an image within a defined display area,
 * and then export a specific region as a Data URL or Blob.
 */
'use strict';
YUI.add('image-trimmer', function (Y) {

    // --- Configuration Constants ---
    // Defines the fractional increment for zoom operations.
    const ZOOM_STEP_FRACTION = 0.1;
    // The base multiplier for scaling, derived from the step fraction.
    const ZOOM_BASE_MULTIPLIER = 1 + ZOOM_STEP_FRACTION;
    // Minimum allowable image scaling factor to prevent excessive shrinking.
    const MIN_IMAGE_SCALE = 0.1;
    // Maximum allowable image scaling factor to prevent excessive enlargement.
    const MAX_IMAGE_SCALE = 10;
    // Default image format for export operations.
    const EXPORT_IMAGE_FORMAT = 'image/png';
    // Default quality for image export (0.0 to 1.0).
    const EXPORT_IMAGE_QUALITY = 0.9;

    /**
     * @class ImageTrimmer
     * @extends Y.Base
     * @param {Object} initializationOptions - Configuration parameters for the component.
     * @constructor
     * @description Core class for the interactive image cropping and manipulation component.
     */
    Y.ImageTrimmer = Y.Base.create('image-trimmer', Y.Base, [],
        {
            /**
             * Stores the validated and merged configuration object for the component.
             * @property {Object} _componentConfiguration
             * @private
             */
            _componentConfiguration: null,

            /**
             * Manages the dynamic state of user interactions (e.g., dragging status, mouse coordinates).
             * @property {Object} _interactionState
             * @private
             */
            _interactionState: null,

            /**
             * The YUI Node representing the main container where the image is displayed and interactions occur.
             * @property {Y.Node} _imageDisplayContainer
             * @private
             */
            _imageDisplayContainer: null,

            /**
             * The YUI Node representing the visible cropping preview area.
             * This element defines the dimensions of the final cropped output.
             * @property {Y.Node} _cropPreviewRegion
             * @private
             */
            _cropPreviewRegion: null,

            /**
             * The YUI Node for the loading indicator (e.g., a spinner) shown during image loading.
             * @property {Y.Node} _loadingSpinnerElement
             * @private
             */
            _loadingSpinnerElement: null,

            /**
             * The native HTML `Image` element used to load and render the source image.
             * @property {HTMLImageElement} _sourceImageElement
             * @private
             */
            _sourceImageElement: null,

            /**
             * The current scaling factor applied to the displayed image.
             * This affects both its size and position calculations.
             * @property {Number} _currentScalingFactor
             * @private
             */
            _currentScalingFactor: 1,

            // --- Event Handles for Detachment ---
            /** @property {Y.EventHandle} _mouseDownHandler - Handle for the mousedown event. */
            _mouseDownHandler: null,
            /** @property {Y.EventHandle} _mouseMoveHandler - Handle for the mousemove event. */
            _mouseMoveHandler: null,
            /** @property {Y.EventHandle} _mouseUpHandler - Handle for the global mouseup event. */
            _mouseUpHandler: null,
            /** @property {Y.EventHandle} _mouseWheelHandler - Handle for the mouse wheel event. */
            _mouseWheelHandler: null,
            // --- End Event Handles ---

            /**
             * Initializes the ImageTrimmer component.
             * This is the entry point for component setup.
             * @param {Object} initializationOptions - Configuration object provided during instantiation.
             * @method initializer
             */
            initializer: function (initializationOptions)
            {
                // Validate and store configuration parameters.
                this._componentConfiguration = Y.merge({
                    initialScale: 1,
                    imageBox: null,
                    thumbBox: null,
                    spinner: null,
                    imgSrc: null
                }, initializationOptions);

                // Initialize the interactive state object.
                this._interactionState = {
                    isBeingDragged: false,
                    lastPointerX: 0,
                    lastPointerY: 0,
                    initialBackgroundOffsetX: 0,
                    initialBackgroundOffsetY: 0,
                    hasImageBeenLoaded: false
                };

                // Set the initial scaling factor, ensuring it's within defined bounds.
                let initialScale = this._componentConfiguration.initialScale;
                this._currentScalingFactor = Math.max(MIN_IMAGE_SCALE, Math.min(MAX_IMAGE_SCALE, initialScale));

                // Proceed with DOM element referencing and image loading.
                this._locateDomElements();
                this._beginImageLoading();
            },

            /**
             * Locates and assigns references to the necessary DOM elements based on selectors
             * provided in the component configuration. Validates their existence.
             * @method _locateDomElements
             * @private
             */
            _locateDomElements: function ()
            {
                const config = this._componentConfiguration;

                // Attempt to find the main image display container. This is a mandatory element.
                if (!config.imageBox) {
                    Y.error('ImageTrimmer: Configuration error: "imageBox" selector is required.', 'ImageTrimmer');
                    return;
                }
                this._imageDisplayContainer = Y.one(config.imageBox);
                if (!this._imageDisplayContainer) {
                    Y.error(`ImageTrimmer: Critical error: Image display container not found for selector: ${config.imageBox}`, 'ImageTrimmer');
                    return; // Component cannot function without this.
                }

                // Attempt to find the cropping preview region, expected within the display container.
                this._cropPreviewRegion = this._imageDisplayContainer.one(config.thumbBox);
                if (!this._cropPreviewRegion) {
                    Y.warn(`ImageTrimmer: Cropping preview region not found for selector: ${config.thumbBox}. Cropping functionality may be impaired.`, 'ImageTrimmer');
                }

                // Attempt to find the loading spinner element, also expected within the display container.
                this._loadingSpinnerElement = this._imageDisplayContainer.one(config.spinner);
                if (!this._loadingSpinnerElement) {
                    Y.warn(`ImageTrimmer: Loading spinner element not found for selector: ${config.spinner}. Visual loading feedback will be absent.`, 'ImageTrimmer');
                }

                Y.log('ImageTrimmer: DOM elements referenced successfully.', 'info', 'ImageTrimmer');
            },

            /**
             * Initiates the asynchronous loading of the image specified by `imgSrc`.
             * Handles success and error states, and updates the UI accordingly.
             * @method _beginImageLoading
             * @private
             */
            _beginImageLoading: function()
            {
                const currentComponent = this; // Capture 'this' for event callbacks.
                const imageUri = this._componentConfiguration.imgSrc;

                // Pre-flight checks for mandatory elements and image source.
                if (!this._imageDisplayContainer) {
                    Y.error('ImageTrimmer: Cannot load image: Display container is not initialized.', 'ImageTrimmer');
                    return;
                }
                if (!imageUri) {
                    Y.error('ImageTrimmer: Cannot load image: No image source (imgSrc) provided in configuration.', 'ImageTrimmer');
                    return;
                }

                // Show the loading indicator if it exists.
                if (this._loadingSpinnerElement) {
                    this._loadingSpinnerElement.show();
                    Y.log('ImageTrimmer: Displaying loading indicator.', 'info', 'ImageTrimmer');
                }

                // Create a new Image object for loading.
                this._sourceImageElement = new Image();

                // Define the handler for successful image loading.
                this._sourceImageElement.onload = function() {
                    currentComponent._interactionState.hasImageBeenLoaded = true;
                    if (currentComponent._loadingSpinnerElement) {
                        currentComponent._loadingSpinnerElement.hide();
                        Y.log('ImageTrimmer: Loading indicator hidden.', 'info', 'ImageTrimmer');
                    }
                    currentComponent._refreshDisplayBackground(); // Update the display with the loaded image.
                    currentComponent._attachInteractionListeners(); // Attach user interaction events.
                    Y.log(`ImageTrimmer: Image loaded successfully from ${imageUri}`, 'info', 'ImageTrimmer');
                };

                // Define the handler for image loading errors.
                this._sourceImageElement.onerror = function(errorEvent) {
                    currentComponent._interactionState.hasImageBeenLoaded = false;
                    if (currentComponent._loadingSpinnerElement) {
                        currentComponent._loadingSpinnerElement.hide();
                    }
                    Y.error(`ImageTrimmer: Failed to load image from ${imageUri}. Event type: ${errorEvent.type}`, 'ImageTrimmer');
                    // Optionally, implement fallback UI (e.g., placeholder image, error message).
                };

                // Set the source to start loading the image.
                this._sourceImageElement.src = imageUri;
            },

            /**
             * Attaches all necessary DOM event listeners for user interaction
             * (panning, zooming) to the relevant elements.
             * @method _attachInteractionListeners
             * @private
             */
            _attachInteractionListeners: function() {
                const currentComponent = this;

                // First, detach any existing listeners to prevent duplicates if called multiple times.
                this._detachInteractionListeners();

                // Attach mousedown, mousemove, and global mouseup handlers for panning.
                this._mouseDownHandler = this._imageDisplayContainer.on('mousedown', this._handlePointerDown, currentComponent);
                this._mouseMoveHandler = this._imageDisplayContainer.on('mousemove', this._handlePointerMove, currentComponent);
                this._mouseUpHandler = Y.one('body').on('mouseup', this._handlePointerUp, currentComponent); // Global mouseup for drag release outside container.

                // Attach mouse wheel event for zooming, adapting to browser specifics (Gecko vs. others).
                if (Y.UA.gecko > 0) {
                    this._mouseWheelHandler = this._imageDisplayContainer.on('DOMMouseScroll', this._handleWheelZoom, currentComponent);
                    Y.log('ImageTrimmer: Attached DOMMouseScroll listener for zoom.', 'info', 'ImageTrimmer');
                } else {
                    this._mouseWheelHandler = this._imageDisplayContainer.on('mousewheel', this._handleWheelZoom, currentComponent);
                    Y.log('ImageTrimmer: Attached mousewheel listener for zoom.', 'info', 'ImageTrimmer');
                }
                Y.log('ImageTrimmer: All interaction event listeners attached.', 'info', 'ImageTrimmer');
            },

            /**
             * Updates the `background-image` CSS style of the display container
             * based on the current scaling factor and calculated position.
             * @method _refreshDisplayBackground
             * @private
             */
            _refreshDisplayBackground: function()
            {
                // Guard clause: Ensure image is loaded and display container is ready.
                if (!this._interactionState.hasImageBeenLoaded || !this._imageDisplayContainer || !this._sourceImageElement) {
                    Y.warn('ImageTrimmer: Cannot update background. Image not loaded or display container not ready.', 'ImageTrimmer');
                    return;
                }

                // Clamp the scaling factor to stay within the defined min/max limits.
                this._currentScalingFactor = Math.max(MIN_IMAGE_SCALE, Math.min(MAX_IMAGE_SCALE, this._currentScalingFactor));

                // Calculate the scaled dimensions of the image based on its natural (original) size.
                const scaledImageWidth = Math.round(this._sourceImageElement.naturalWidth * this._currentScalingFactor);
                const scaledImageHeight = Math.round(this._sourceImageElement.naturalHeight * this._currentScalingFactor);

                // Get the client dimensions of the display container.
                const containerClientWidth = this._imageDisplayContainer.get('clientWidth');
                const containerClientHeight = this._imageDisplayContainer.get('clientHeight');

                // Calculate the default offset to center the scaled image within the container.
                const defaultCenteredOffsetX = Math.round((containerClientWidth - scaledImageWidth) / 2);
                const defaultCenteredOffsetY = Math.round((containerClientHeight - scaledImageHeight) / 2);

                let backgroundPositionX = defaultCenteredOffsetX;
                let backgroundPositionY = defaultCenteredOffsetY;

                // Attempt to preserve the previous background position if available, especially during zoom.
                const currentBgStyle = this._imageDisplayContainer.getStyle('backgroundPosition');
                if (currentBgStyle && currentBgStyle !== '0% 0%') { // '0% 0%' is the default for no explicit pixel value.
                    const bgParts = currentBgStyle.split(' ');
                    if (bgParts.length === 2) {
                        // Use parseFloat to accurately parse pixel values (e.g., "123.45px").
                        const existingBgX = parseFloat(bgParts[0]) || 0;
                        const existingBgY = parseFloat(bgParts[1]) || 0;

                        // A more advanced implementation would calculate the new position
                        // to keep the visual center point fixed during zoom. For Type III,
                        // we'll simply recenter for now or add a basic offset preservation.
                        // For simplicity, we re-center it.
                        backgroundPositionX = defaultCenteredOffsetX;
                        backgroundPositionY = defaultCenteredOffsetY;
                    }
                }

                // Construct the complete `background` CSS style string using template literals.
                const newBackgroundStyle =
                    `background-image: url('${this._sourceImageElement.src}'); ` +
                    `background-size: ${scaledImageWidth}px ${scaledImageHeight}px; ` +
                    `background-position: ${backgroundPositionX}px ${backgroundPositionY}px; ` +
                    `background-repeat: no-repeat;`;

                // Apply the new style to the display container.
                this._imageDisplayContainer.setAttribute('style', newBackgroundStyle);
                Y.log(`ImageTrimmer: Display background updated. Scale: ${this._currentScalingFactor.toFixed(2)}, Size: ${scaledImageWidth}x${scaledImageHeight}, Pos: ${backgroundPositionX}x${backgroundPositionY}`, 'info', 'ImageTrimmer');
            },

            /**
             * Handles the `mousedown` event on the display container to start an image drag operation.
             * @param {Event} eventObject - The DOM event object.
             * @method _handlePointerDown
             * @private
             */
            _handlePointerDown: function(eventObject)
            {
                eventObject.stopImmediatePropagation(); // Prevent event from bubbling up.
                eventObject.preventDefault();          // Prevent default browser drag/selection behavior.

                // Only allow dragging if an image is successfully loaded.
                if (!this._interactionState.hasImageBeenLoaded) {
                    Y.warn('ImageTrimmer: Cannot initiate drag; image not yet loaded.', 'ImageTrimmer');
                    return;
                }

                this._interactionState.isBeingDragged = true;
                this._interactionState.lastPointerX = eventObject.clientX;
                this._interactionState.lastPointerY = eventObject.clientY;

                // Store the current background position at the start of the drag.
                const currentBgPos = this._imageDisplayContainer.getStyle('backgroundPosition').split(' ');
                this._interactionState.initialBackgroundOffsetX = parseFloat(currentBgPos[0]) || 0;
                this._interactionState.initialBackgroundOffsetY = parseFloat(currentBgPos[1]) || 0;

                // Add a CSS class to indicate dragging state (e.g., for cursor change).
                this._imageDisplayContainer.addClass('is-dragging');
                Y.log('ImageTrimmer: Image dragging initiated.', 'info', 'ImageTrimmer');
            },

            /**
             * Handles the `mousemove` event while an image drag is active, updating its position.
             * @param {Event} eventObject - The DOM event object.
             * @method _handlePointerMove
             * @private
             */
            _handlePointerMove: function(eventObject)
            {
                eventObject.stopImmediatePropagation();

                // Only process movement if a drag operation is active.
                if (!this._interactionState.isBeingDragged) {
                    return;
                }

                // Calculate the change in mouse position since the last event.
                const deltaX = eventObject.clientX - this._interactionState.lastPointerX;
                const deltaY = eventObject.clientY - this._interactionState.lastPointerY;

                // Calculate the new background position based on the initial position and mouse deltas.
                const newBackgroundPositionX = this._interactionState.initialBackgroundOffsetX + deltaX;
                const newBackgroundPositionY = this._interactionState.initialBackgroundOffsetY + deltaY;

                // Apply the new position to the background style.
                this._imageDisplayContainer.setStyle('backgroundPosition', `${newBackgroundPositionX}px ${newBackgroundPositionY}px`);

                // Update the stored initial background position and last mouse coordinates for the next move event.
                this._interactionState.initialBackgroundOffsetX = newBackgroundPositionX;
                this._interactionState.initialBackgroundOffsetY = newBackgroundPositionY;
                this._interactionState.lastPointerX = eventObject.clientX;
                this._interactionState.lastPointerY = eventObject.clientY;
            },

            /**
             * Handles the `mouseup` event, signaling the end of an image drag operation.
             * This listener is attached to the document body to ensure it catches releases
             * even if the mouse leaves the display container during the drag.
             * @param {Event} eventObject - The DOM event object.
             * @method _handlePointerUp
             * @private
             */
            _handlePointerUp: function(eventObject)
            {
                eventObject.stopImmediatePropagation();
                // If dragging was active, reset the state.
                if (this._interactionState.isBeingDragged) {
                    this._interactionState.isBeingDragged = false;
                    this._imageDisplayContainer.removeClass('is-dragging'); // Remove visual feedback class.
                    Y.log('ImageTrimmer: Image dragging concluded.', 'info', 'ImageTrimmer');
                }
            },

            /**
             * Handles `mousewheel` or `DOMMouseScroll` events to adjust the image zoom level.
             * @param {Event} eventObject - The DOM event object.
             * @method _handleWheelZoom
             * @private
             */
            _handleWheelZoom: function(eventObject)
            {
                eventObject.stopImmediatePropagation();
                eventObject.preventDefault(); // Prevent default page scrolling.

                // Guard clause: Only allow zooming if an image is loaded.
                if (!this._interactionState.hasImageBeenLoaded) {
                    Y.warn('ImageTrimmer: Cannot zoom; image not yet loaded.', 'ImageTrimmer');
                    return;
                }

                // Determine zoom direction: positive for zoom in, negative for zoom out.
                // `wheelDelta` is standard, `detail` is for Gecko-based browsers (inverted).
                const zoomDirection = (eventObject.wheelDelta > 0 || eventObject.detail < 0) ? 1 : -1;

                // Apply the zoom multiplier based on direction.
                if (zoomDirection > 0) {
                    this._currentScalingFactor *= ZOOM_BASE_MULTIPLIER; // Zoom in.
                } else {
                    this._currentScalingFactor /= ZOOM_BASE_MULTIPLIER; // Zoom out.
                }

                // Clamp the scaling factor to prevent extreme zoom levels.
                this._currentScalingFactor = Math.max(MIN_IMAGE_SCALE, Math.min(MAX_IMAGE_SCALE, this._currentScalingFactor));

                this._refreshDisplayBackground(); // Re-render the background with the new scale.
                Y.log(`ImageTrimmer: Zoom adjusted to ${this._currentScalingFactor.toFixed(2)}.`, 'info', 'ImageTrimmer');
            },

            /**
             * Exports the currently cropped image region as a Data URL (base64 encoded string).
             * @returns {String|null} The Data URL string (e.g., `data:image/png;base64,...`),
             *                          or `null` if the image is not loaded or an error occurs.
             * @method exportCroppedImageURL
             * @public
             */
            exportCroppedImageURL: function ()
            {
                // Pre-flight checks for image loading and essential DOM elements.
                if (!this._interactionState.hasImageBeenLoaded || !this._sourceImageElement) {
                    Y.error('ImageTrimmer: Export failed: Image not loaded.', 'ImageTrimmer');
                    return null;
                }
                if (!this._cropPreviewRegion || !this._imageDisplayContainer) {
                    Y.error('ImageTrimmer: Export failed: Preview region or display container not available.', 'ImageTrimmer');
                    return null;
                }

                // Create an off-screen canvas element for drawing the cropped image.
                const outputCanvas = document.createElement("canvas");
                const canvasOutputWidth = this._cropPreviewRegion.get('clientWidth');
                const canvasOutputHeight = this._cropPreviewRegion.get('clientHeight');

                // Set the canvas dimensions to match the preview region.
                outputCanvas.width = canvasOutputWidth;
                outputCanvas.height = canvasOutputHeight;

                const canvasContext = outputCanvas.getContext("2d");
                if (!canvasContext) {
                    Y.error('ImageTrimmer: Export failed: Could not obtain 2D rendering context for canvas.', 'ImageTrimmer');
                    return null;
                }

                // Retrieve the current background position and size from the display container's style.
                // These values define where and how large the *scaled* image is displayed.
                const backgroundPositionParts = this._imageDisplayContainer.getStyle('backgroundPosition').split(' ');
                const backgroundSizeParts = this._imageDisplayContainer.getStyle('backgroundSize').split(' ');

                // Parse pixel values; use parseFloat for better precision.
                const displayedImageOffsetX = parseFloat(backgroundPositionParts[0]) || 0;
                const displayedImageOffsetY = parseFloat(backgroundPositionParts[1]) || 0;
                const displayedImageWidth = parseFloat(backgroundSizeParts[0]) || 0;
                const displayedImageHeight = parseFloat(backgroundSizeParts[1]) || 0;

                // Get the original (natural) dimensions of the source image.
                const originalImageNaturalWidth = this._sourceImageElement.naturalWidth;
                const originalImageNaturalHeight = this._sourceImageElement.naturalHeight;

                // Calculate the scaling ratio between the original image and its *displayed* (scaled) version.
                // This is crucial for mapping canvas coordinates back to the original image.
                const horizontalScaleRatio = originalImageNaturalWidth / displayedImageWidth;
                const verticalScaleRatio = originalImageNaturalHeight / displayedImageHeight;

                // Determine the position of the crop preview region relative to the display container.
                // The preview region is typically centered.
                const containerWidth = this._imageDisplayContainer.get('clientWidth');
                const containerHeight = this._imageDisplayContainer.get('clientHeight');
                const previewRegionTopLeftX = (containerWidth - canvasOutputWidth) / 2;
                const previewRegionTopLeftY = (containerHeight - canvasOutputHeight) / 2;

                // Calculate the source rectangle (sx, sy, sWidth, sHeight) on the *original* image.
                // This is the portion of the original image that needs to be drawn onto the canvas.
                const sourceCropStartX = Math.round((previewRegionTopLeftX - displayedImageOffsetX) * horizontalScaleRatio);
                const sourceCropStartY = Math.round((previewRegionTopLeftY - displayedImageOffsetY) * verticalScaleRatio);
                const sourceCropWidth = Math.round(canvasOutputWidth * horizontalScaleRatio);
                const sourceCropHeight = Math.round(canvasOutputHeight * verticalScaleRatio);

                // Draw the calculated portion of the original image onto the canvas.
                // The destination rectangle (dx, dy, dWidth, dHeight) fills the entire canvas.
                canvasContext.drawImage(
                    this._sourceImageElement,
                    sourceCropStartX,
                    sourceCropStartY,
                    sourceCropWidth,
                    sourceCropHeight,
                    0, // dx: Draw at the top-left corner of the canvas.
                    0, // dy: Draw at the top-left corner of the canvas.
                    canvasOutputWidth, // dWidth: Fill the entire canvas width.
                    canvasOutputHeight // dHeight: Fill the entire canvas height.
                );

                // Convert the canvas content to a Data URL.
                const imageDataUrl = outputCanvas.toDataURL(EXPORT_IMAGE_FORMAT, EXPORT_IMAGE_QUALITY);

                Y.log('ImageTrimmer: Cropped image Data URL successfully generated.', 'info', 'ImageTrimmer');
                return imageDataUrl;
            },

            /**
             * Exports the cropped image region as a `Blob` object, suitable for file uploads.
             * @returns {Blob|null} The `Blob` object representing the cropped image,
             *                        or `null` if the operation fails.
             * @method exportCroppedImageBlob
             * @public
             */
            exportCroppedImageBlob: function()
            {
                const imageDataUrl = this.exportCroppedImageURL();

                if (!imageDataUrl) {
                    Y.error('ImageTrimmer: Failed to obtain Data URL required for Blob creation.', 'ImageTrimmer');
                    return null;
                }

                // Extract the base64 encoded part of the Data URL.
                const base64Data = imageDataUrl.split(',')[1];
                if (!base64Data) {
                    Y.error('ImageTrimmer: Invalid Data URL format; missing base64 data.', 'ImageTrimmer');
                    return null;
                }

                // Decode the base64 string into a raw binary string.
                let binaryString;
                try {
                    binaryString = atob(base64Data);
                } catch (e) {
                    Y.error(`ImageTrimmer: Error during base64 decoding for Blob: ${e.message}`, 'ImageTrimmer');
                    return null;
                }

                // Convert the binary string into an array of 8-bit unsigned integers (bytes).
                const byteArray = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    byteArray[i] = binaryString.charCodeAt(i);
                }

                // Create and return the Blob object.
                try {
                    const imageBlob = new Blob([byteArray], { type: EXPORT_IMAGE_FORMAT });
                    Y.log('ImageTrimmer: Cropped image Blob successfully generated.', 'info', 'ImageTrimmer');
                    return imageBlob;
                } catch (e) {
                    Y.error(`ImageTrimmer: Error creating Blob object: ${e.message}`, 'ImageTrimmer');
                    return null;
                }
            },

            /**
             * Public method to programmatically increase the image zoom level.
             * @method performZoomIn
             * @public
             */
            performZoomIn: function ()
            {
                this._currentScalingFactor *= ZOOM_BASE_MULTIPLIER;
                this._refreshDisplayBackground();
                Y.log('ImageTrimmer: Programmatic zoom-in triggered.', 'info', 'ImageTrimmer');
            },

            /**
             * Public method to programmatically decrease the image zoom level.
             * @method performZoomOut
             * @public
             */
            performZoomOut: function ()
            {
                this._currentScalingFactor /= ZOOM_BASE_MULTIPLIER;
                this._refreshDisplayBackground();
                Y.log('ImageTrimmer: Programmatic zoom-out triggered.', 'info', 'ImageTrimmer');
            },

            /**
             * Detaches all event listeners previously attached by this component.
             * This is crucial for preventing memory leaks and ensuring proper cleanup.
             * @method _detachInteractionListeners
             * @private
             */
            _detachInteractionListeners: function() {
                // Check if handles exist before attempting to detach.
                if (this._mouseDownHandler) {
                    this._mouseDownHandler.detach();
                    this._mouseDownHandler = null;
                }
                if (this._mouseMoveHandler) {
                    this._mouseMoveHandler.detach();
                    this._mouseMoveHandler = null;
                }
                if (this._mouseUpHandler) {
                    this._mouseUpHandler.detach();
                    this._mouseUpHandler = null;
                }
                if (this._mouseWheelHandler) {
                    this._mouseWheelHandler.detach();
                    this._mouseWheelHandler = null;
                }
                Y.log('ImageTrimmer: All interaction event listeners detached.', 'info', 'ImageTrimmer');
            },

            /**
             * Lifecycle method: Cleans up all resources and event listeners
             * when the ImageTrimmer instance is destroyed.
             * @method destructor
             */
            destructor: function ()
            {
                this._detachInteractionListeners(); // Ensure all events are cleaned up.

                // Nullify DOM references to aid garbage collection.
                this._imageDisplayContainer = null;
                this._cropPreviewRegion = null;
                this._loadingSpinnerElement = null;
                this._sourceImageElement = null; // Clear the image element reference.

                // Clear internal state and configuration objects.
                this._interactionState = null;
                this._componentConfiguration = null;

                Y.log('ImageTrimmer: Destructor called. Component resources cleaned up.', 'info', 'ImageTrimmer');
            }
        });
}, '1.1.0', // Module version number.
{
    // Required YUI modules for this component's functionality.
    requires: [
        'node',         // For Y.Node functionality.
        'base',         // For Y.Base class extension.
        'event-dom',    // For general DOM event handling.
        'event-mousewheel', // For cross-browser mouse wheel events.
        'yui-base'      // For Y.UA (User Agent detection).
    ]
});