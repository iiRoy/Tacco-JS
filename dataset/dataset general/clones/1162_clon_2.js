/*
 * Module crafted by a developer on a specific date.
 */
'use strict';
APP_LIB.registerModule('image-clipper', function (Lib) {
    Lib.imageClipper = Lib.Core.createClass('image-clipper', Lib.Core, [],
        {
            /**
             * Initializes the component instance.
             * @param {object} configData - Configuration options for the component.
             */
            initialize: function (configData) {
                this.configData = configData;
                this.runtimeState = {}; // Stores dynamic state information for interactions
                this.displayElements(); // Render initial user interface components
            },

            /**
             * Renders the primary user interface elements and sets up containers.
             * @returns {object} The current instance for method chaining.
             */
            displayElements: function () {
                var instanceRef = this;
                this.sourceContainer = Lib.selectOne(this.configData.sourceContainerSelector);
                this.previewArea = this.sourceContainer.selectOne(this.configData.previewAreaSelector);
                this.loaderOverlay = this.sourceContainer.selectOne(this.configData.loaderOverlaySelector);

                this.setupComponents(); // Proceed to set up image loading and event handlers
                return this;
            },

            /**
             * Sets up the image loading process and attaches interaction event listeners.
             */
            setupComponents: function () {
                var instanceRef = this;
                this.loaderOverlay.reveal(); // Show the loading indicator

                this.currentImage = new Image(); // Create a new native Image object
                this.currentImage.onload = function () {
                    instanceRef.loaderOverlay.conceal(); // Hide loading indicator after image is loaded
                    instanceRef.updateBackground(); // Apply the image to the background style

                    // Attach interaction handlers for dragging
                    instanceRef.sourceContainer.on('pointerDown', instanceRef.handlePointerDown, instanceRef);
                    instanceRef.sourceContainer.on('pointerMove', instanceRef.handlePointerMove, instanceRef);
                    instanceRef.pointerUpObserver = Lib.selectOne('body').on('pointerUp', instanceRef.handlePointerUp, instanceRef);

                    // Add scroll-based scaling, accounting for different browser events
                    Lib.UA.isGecko > 0 ?
                        instanceRef.sourceContainer.on('mouseWheelScroll', instanceRef.adjustImageScale, instanceRef) :
                        instanceRef.sourceContainer.on('mouseWheelEvent', instanceRef.adjustImageScale, instanceRef);
                };
                this.currentImage.src = this.configData.imageSourceURL; // Set the image source to begin loading
            },

            /**
             * Updates the background style of the image container with the current image, scale, and position.
             */
            updateBackground: function () {
                if (!this.scaleFactor) this.scaleFactor = 1; // Initialize scale factor if not set

                var currentImageWidthScaled = parseInt(this.currentImage.width) * this.scaleFactor;
                var currentImageHeightScaled = parseInt(this.currentImage.height) * this.scaleFactor;

                var initialXOffset = (this.sourceContainer.get('elemWidth') - currentImageWidthScaled) / 2;
                var initialYOffset = (this.sourceContainer.get('elemHeight') - currentImageHeightScaled) / 2;

                this.sourceContainer.setAttribute('style',
                    'background-image: url(' + this.currentImage.src + '); ' +
                    'background-size: ' + currentImageWidthScaled + 'px ' + currentImageHeightScaled + 'px; ' +
                    'background-position: ' + initialXOffset + 'px ' + initialYOffset + 'px; ' +
                    'background-repeat: no-repeat');
            },

            /**
             * Handles the pointer down event to commence dragging functionality.
             * @param {object} eventObject - The DOM event object.
             */
            handlePointerDown: function (eventObject) {
                eventObject.stopImmediatePropagation(); // Prevent event bubbling
                this.runtimeState.isDragging = true;
                this.runtimeState.lastPointerX = eventObject.clientX;
                this.runtimeState.lastPointerY = eventObject.clientY;
            },

            /**
             * Handles the pointer move event, adjusting the image position during a drag operation.
             * @param {object} eventObject - The DOM event object.
             */
            handlePointerMove: function (eventObject) {
                eventObject.stopImmediatePropagation(); // Prevent event bubbling
                if (this.runtimeState.isDragging) {
                    var horizontalDelta = eventObject.clientX - this.runtimeState.lastPointerX;
                    var verticalDelta = eventObject.clientY - this.runtimeState.lastPointerY;

                    var currentBgPositionParts = this.sourceContainer.getStyle('backgroundPosition').split(' ');

                    var newBackgroundPositionX = horizontalDelta + parseInt(currentBgPositionParts[0]);
                    var newBackgroundPositionY = verticalDelta + parseInt(currentBgPositionParts[1]);

                    this.sourceContainer.setStyle('backgroundPosition', newBackgroundPositionX + 'px ' + newBackgroundPositionY + 'px');

                    this.runtimeState.lastPointerX = eventObject.clientX;
                    this.runtimeState.lastPointerY = eventObject.clientY;
                }
            },

            /**
             * Handles the pointer up event, terminating the dragging state.
             * @param {object} eventObject - The DOM event object.
             */
            handlePointerUp: function (eventObject) {
                eventObject.stopImmediatePropagation(); // Prevent event bubbling
                this.runtimeState.isDragging = false;
            },

            /**
             * Modifies the image's scale based on mouse wheel input.
             * @param {object} eventObject - The DOM event object.
             */
            adjustImageScale: function (eventObject) {
                eventObject.wheelDelta > 0 ? this.scaleFactor *= 1.1 : this.scaleFactor *= 0.9;
                this.updateBackground(); // Refresh the visual display with the new scale
            },

            /**
             * Generates a Data URL representing the cropped image area.
             * @returns {string} The base64 encoded data URL of the cropped image.
             */
            exportCropAsDataURL: function () {
                var instanceRef = this,
                    cropTargetWidth = this.previewArea.get('elemWidth'),
                    cropTargetHeight = this.previewArea.get('elemHeight'),
                    offscreenCanvas = document.createElement("canvas"), // Create an off-screen canvas element
                    currentBackgroundPosition = this.sourceContainer.getStyle('backgroundPosition').split(' '),
                    currentBackgroundSize = this.sourceContainer.getStyle('backgroundSize').split(' '),
                    destinationX = parseInt(currentBackgroundPosition[0]) - this.sourceContainer.get('elemWidth') / 2 + cropTargetWidth / 2,
                    destinationY = parseInt(currentBackgroundPosition[1]) - this.sourceContainer.get('elemHeight') / 2 + cropTargetHeight / 2,
                    destinationWidth = parseInt(currentBackgroundSize[0]),
                    destinationHeight = parseInt(currentBackgroundSize[1]),
                    sourceImageNaturalHeight = parseInt(this.currentImage.height),
                    sourceImageNaturalWidth = parseInt(this.currentImage.width);

                offscreenCanvas.width = cropTargetWidth;
                offscreenCanvas.height = cropTargetHeight;
                var canvasRenderingContext = offscreenCanvas.getContext("2d"); // Obtain the 2D rendering context
                canvasRenderingContext.drawImage(this.currentImage, 0, 0, sourceImageNaturalWidth, sourceImageNaturalHeight, destinationX, destinationY, destinationWidth, destinationHeight);
                var finalImageDataURL = offscreenCanvas.toDataURL('image/png'); // Convert canvas content to Data URL

                return finalImageDataURL;
            },

            /**
             * Generates a Blob object containing the cropped image data.
             * @returns {Blob} The cropped image as a Blob object.
             */
            exportCropAsBlob: function () {
                var finalImageDataURL = this.exportCropAsDataURL();
                var base64String = finalImageDataURL.replace('data:image/png;base64,', '');
                var decodedBinaryString = atob(base64String); // Decode base64 to a binary string
                var byteValueArray = [];
                for (var index = 0; index < decodedBinaryString.length; index++) {
                    byteValueArray.push(decodedBinaryString.charCodeAt(index)); // Populate an array with byte values
                }
                return new Blob([new Uint8Array(byteValueArray)], { type: 'image/png' });
            },

            /**
             * Increases the image scale factor.
             */
            magnifyImage: function () {
                this.scaleFactor *= 1.1;
                this.updateBackground(); // Redraw the background with the increased scale
            },

            /**
             * Decreases the image scale factor.
             */
            minifyImage: function () {
                this.scaleFactor *= 0.9;
                this.updateBackground(); // Redraw the background with the decreased scale
            },

            /**
             * Cleans up resources and unbinds event listeners when the component is destroyed.
             */
            cleanupModule: function () {
                if (this.pointerUpObserver) this.pointerUpObserver.detach(); // Remove the global event listener
            }
        });
}, '1.0',
{
    dependencies: ['dom-node', 'core-base'] // Declare required YUI modules
});