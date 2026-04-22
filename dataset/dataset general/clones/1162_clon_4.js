(function (globalReference) {
    'use strict';

    // Helper function to safely extract integer values from CSS strings
    const extractNumericValue = (cssDeclaration, fallback = 0) => {
        const parsed = parseInt(cssDeclaration, 10);
        return Number.isNaN(parsed) ? fallback : parsed;
    };

    // A lightweight internal event system to manage subscriptions
    class EventPublisher {
        constructor() {
            this._subscribers = new Map();
        }

        subscribe(eventName, handler) {
            if (!this._subscribers.has(eventName)) {
                this._subscribers.set(eventName, new Set());
            }
            this._subscribers.get(eventName).add(handler);
            return () => this.unsubscribe(eventName, handler); // Return a cleanup function
        }

        unsubscribe(eventName, handler) {
            if (this._subscribers.has(eventName)) {
                this._subscribers.get(eventName).delete(handler);
            }
        }

        publish(eventName, eventData) {
            if (this._subscribers.has(eventName)) {
                this._subscribers.get(eventName).forEach(handler => handler(eventData));
            }
        }
    }

    // Factory function to create an image cropping component
    const constructImageProcessor = (settings) => {
        const componentEvents = new EventPublisher();

        let outerBoundaryElement = null;
        let cropOverlayElement = null;
        let loadingIndicatorElement = null;
        let loadedImageObject = null;

        let currentScalingFactor = 1;
        let interactionState = {
            isActivelyDragging: false,
            lastPointerX: 0,
            lastPointerY: 0
        };

        // Locate and validate required DOM elements
        const locateElements = () => {
            outerBoundaryElement = document.querySelector(settings.containerSelector);
            if (!outerBoundaryElement) throw new Error('Image container element not found.');

            cropOverlayElement = outerBoundaryElement.querySelector(settings.overlaySelector);
            if (!cropOverlayElement) throw new Error('Crop overlay element not found.');

            loadingIndicatorElement = outerBoundaryElement.querySelector(settings.indicatorSelector);
            if (!loadingIndicatorElement) throw new Error('Loading indicator element not found.');
        };

        // Update the visual display of the background image based on current state
        const refreshImageDisplay = () => {
            if (!loadedImageObject || !loadedImageObject.complete) return;

            if (currentScalingFactor === 0) currentScalingFactor = 1; // Ensure non-zero scale

            const imageDisplayWidth = extractNumericValue(loadedImageObject.width) * currentScalingFactor;
            const imageDisplayHeight = extractNumericValue(loadedImageObject.height) * currentScalingFactor;

            const horizontalOffset = (outerBoundaryElement.clientWidth - imageDisplayWidth) / 2;
            const verticalOffset = (outerBoundaryElement.clientHeight - imageDisplayHeight) / 2;

            outerBoundaryElement.style.backgroundImage = `url(${loadedImageObject.src})`;
            outerBoundaryElement.style.backgroundSize = `${imageDisplayWidth}px ${imageDisplayHeight}px`;
            outerBoundaryElement.style.backgroundPosition = `${horizontalOffset}px ${verticalOffset}px`;
            outerBoundaryElement.style.backgroundRepeat = 'no-repeat';
        };

        // Callback for when the image successfully loads
        const onImageContentReady = () => {
            loadingIndicatorElement.style.display = 'none'; // Hide loader
            refreshImageDisplay();
            attachInteractionListeners();
        };

        // Initiate image loading process
        const initiateImageLoading = () => {
            loadingIndicatorElement.style.display = 'block'; // Show loader

            loadedImageObject = new Image();
            loadedImageObject.onload = onImageContentReady;
            loadedImageObject.onerror = () => {
                loadingIndicatorElement.style.display = 'none';
                console.error('Failed to load image from source:', settings.imageSource);
            };
            loadedImageObject.src = settings.imageSource;
        };

        // Event handler for mouse down on the image container
        const beginDragOperation = (event) => {
            event.stopPropagation();
            interactionState.isActivelyDragging = true;
            interactionState.lastPointerX = event.clientX;
            interactionState.lastPointerY = event.clientY;
            outerBoundaryElement.style.cursor = 'grabbing';
        };

        // Event handler for mouse move on the image container
        const executeDragOperation = (event) => {
            event.stopPropagation();
            if (interactionState.isActivelyDragging) {
                const displacementX = event.clientX - interactionState.lastPointerX;
                const displacementY = event.clientY - interactionState.lastPointerY;

                const currentBackgroundPosition = outerBoundaryElement.style.backgroundPosition.split(' ');
                const currentBgPosX = extractNumericValue(currentBackgroundPosition[0]);
                const currentBgPosY = extractNumericValue(currentBackgroundPosition[1]);

                const newBgPosX = displacementX + currentBgPosX;
                const newBgPosY = displacementY + currentBgPosY;

                outerBoundaryElement.style.backgroundPosition = `${newBgPosX}px ${newBgPosY}px`;

                interactionState.lastPointerX = event.clientX;
                interactionState.lastPointerY = event.clientY;
            }
        };

        // Event handler for mouse up (global listener)
        const concludeDragOperation = (event) => {
            event.stopPropagation();
            interactionState.isActivelyDragging = false;
            outerBoundaryElement.style.cursor = 'grab';
        };

        // Event handler for mouse wheel scroll to zoom
        const modifyZoomLevel = (event) => {
            event.stopPropagation();
            event.preventDefault(); // Prevent page scrolling

            const scrollDirection = event.wheelDelta || -event.detail; // Standard vs. Firefox
            if (scrollDirection > 0) {
                currentScalingFactor *= 1.1;
            } else {
                currentScalingFactor *= 0.9;
            }
            refreshImageDisplay();
        };

        let globalMouseUpCleanup = null; // To store unsubscribe function

        // Attach all necessary event listeners
        const attachInteractionListeners = () => {
            outerBoundaryElement.addEventListener('mousedown', beginDragOperation);
            outerBoundaryElement.addEventListener('mousemove', executeDragOperation);
            globalMouseUpCleanup = componentEvents.subscribe('globalPointerUp', concludeDragOperation);

            // Cross-browser wheel event handling
            const wheelEventType = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';
            outerBoundaryElement.addEventListener(wheelEventType, modifyZoomLevel);
            outerBoundaryElement.addEventListener('DOMMouseScroll', modifyZoomLevel); // Firefox specific
        };

        // Remove all attached event listeners
        const detachInteractionListeners = () => {
            outerBoundaryElement.removeEventListener('mousedown', beginDragOperation);
            outerBoundaryElement.removeEventListener('mousemove', executeDragOperation);
            if (globalMouseUpCleanup) globalMouseUpCleanup();

            const wheelEventType = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';
            outerBoundaryElement.removeEventListener(wheelEventType, modifyZoomLevel);
            outerBoundaryElement.removeEventListener('DOMMouseScroll', modifyZoomLevel);
        };

        // Global mouseup listener to ensure drag state is reset even if mouse leaves container
        document.addEventListener('mouseup', (event) => {
            componentEvents.publish('globalPointerUp', event);
        });

        // Component initialization sequence
        const initializeComponent = () => {
            locateElements();
            initiateImageLoading();
        };

        initializeComponent(); // Execute initialization upon creation

        // Public API for the image processor component
        return {
            magnifyImage: () => {
                currentScalingFactor *= 1.1;
                refreshImageDisplay();
            },
            shrinkImage: () => {
                currentScalingFactor *= 0.9;
                refreshImageDisplay();
            },
            retrieveCroppedDataURI: () => {
                if (!loadedImageObject || !loadedImageObject.complete) {
                    console.warn('Image not fully loaded for cropping.');
                    return '';
                }

                const outputCanvas = document.createElement("canvas");
                const cropAreaWidth = cropOverlayElement.clientWidth;
                const cropAreaHeight = cropOverlayElement.clientHeight;

                outputCanvas.width = cropAreaWidth;
                outputCanvas.height = cropAreaHeight;
                const canvasContext = outputCanvas.getContext("2d");

                const currentBackgroundPosition = outerBoundaryElement.style.backgroundPosition.split(' ');
                const currentBackgroundSize = outerBoundaryElement.style.backgroundSize.split(' ');

                const bgPositionX = extractNumericValue(currentBackgroundPosition[0]);
                const bgPositionY = extractNumericValue(currentBackgroundPosition[1]);
                const bgSizeWidth = extractNumericValue(currentBackgroundSize[0]);
                const bgSizeHeight = extractNumericValue(currentBackgroundSize[1]);

                // Calculate destination coordinates on the canvas
                // This determines where the scaled background image starts relative to the canvas's top-left
                const destCanvasX = bgPositionX - (outerBoundaryElement.clientWidth / 2) + (cropAreaWidth / 2);
                const destCanvasY = bgPositionY - (outerBoundaryElement.clientHeight / 2) + (cropAreaHeight / 2);

                const originalImgWidth = loadedImageObject.width;
                const originalImgHeight = loadedImageObject.height;

                // Draw the entire original image, scaled and positioned, onto the canvas
                canvasContext.drawImage(
                    loadedImageObject,
                    0, 0, originalImgWidth, originalImgHeight, // Source rectangle (entire original image)
                    destCanvasX, destCanvasY, bgSizeWidth, bgSizeHeight // Destination rectangle on canvas
                );

                return outputCanvas.toDataURL('image/png');
            },
            obtainCroppedBinaryData: () => {
                const dataUrl = this.retrieveCroppedDataURI();
                if (!dataUrl) return null;

                const base64Part = dataUrl.replace('data:image/png;base64,', '');
                const byteCharacters = atob(base64Part);
                const byteNumbersArray = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbersArray[i] = byteCharacters.charCodeAt(i);
                }
                return new Blob([new Uint8Array(byteNumbersArray)], { type: 'image/png' });
            },
            destroyComponent: () => { // Equivalent to destructor
                detachInteractionListeners();
                // Clean up any applied styles
                outerBoundaryElement.style.backgroundImage = '';
                outerBoundaryElement.style.backgroundSize = '';
                outerBoundaryElement.style.backgroundPosition = '';
                outerBoundaryElement.style.backgroundRepeat = '';
                outerBoundaryElement.style.cursor = '';
                // Optionally nullify references to prevent memory leaks in long-running apps
                outerBoundaryElement = null;
                cropOverlayElement = null;
                loadingIndicatorElement = null;
                loadedImageObject = null;
            }
        };
    };

    // Expose the factory function to the global scope (e.g., window)
    globalReference.ImageCroppingUtility = constructImageProcessor;

})(window);