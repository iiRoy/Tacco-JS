/*
 *  Module: ImageForge
 *  Purpose: Provides a front-end image manipulation and upload utility, enabling users to edit images before server submission.
 *  Author: A.V.
 *  License: MIT
 */

// Encapsulates the module to prevent global namespace pollution and ensure jQuery is available.
;(function ( jQuery, windowObj, documentObj, undefinedValue ) {
    "use strict";
    // `undefinedValue` is used to ensure its true undefined state, as the global `undefined` could theoretically be reassigned in older JS environments.
    // `windowObj` and `documentObj` are passed as local variables for slight performance improvements and better minification.

    // Define the core module identifier and its default configuration settings.
    const moduleKey = 'imageForge';
    const configPresets = {
        imageUpdated: function(processedImg){}, // Callback for when the internal image object is modified.
        submissionCompleted: function(response){}, // Callback after the form containing the image is successfully submitted.
        redirectUrl: false,                     // An optional URL to navigate to after form submission.
        maxWidth: 400,                          // Maximum display width for the image within the editor.
        maxHeight: 'auto',                      // Maximum display height for the image within the editor.
        keepAspectRatio: true,                  // Flag to maintain the image's aspect ratio during display/resize.
        initialImageSource: false               // Path or URL to a default image to load upon initialization.
    };

    /**
     * The main constructor for the ImageForge module.
     * @param {HTMLElement} inputElementRef - The DOM element that triggered the module's creation (e.g., a file input).
     * @param {object} customOptions - User-provided settings to override the default configuration.
     */
    function ImageForge( inputElementRef, customOptions ) {
        this.sourceElement = inputElementRef; // The original input element.
        this.containerElement = inputElementRef; // The primary container for the editor UI.

        // Merge default settings with user-provided options.
        // `jQuery.extend` creates a new object, preserving `configPresets`.
        this.moduleSettings = jQuery.extend( {}, configPresets, customOptions );

        this._baseConfig = configPresets;
        this._moduleIdentifier = moduleKey;
        this._activeImageObject = null;         // Holds the currently loaded image as an HTMLImageElement.
        this._originalFileName = "";            // Stores the name of the file if loaded from a local source.
        this._interfaceData = {};               // Stores dynamic values from the UI (e.g., pen color, resize dimensions).

        // Construct the editor's visual components.
        // The `_buildUserInterface` method is conditionally included based on build environment.
        /*unhide_in_prod*/
         this._buildUserInterface();
        /*unhide_in_prod*/

        /*hide_in_prod*/ /*
        this.initializeModule();
         */ /*hide_in_prod*/
    }

    // Define methods and properties for the ImageForge prototype.
    ImageForge.prototype = {
        /**
         * Initializes the module, setting up DOM references, event listeners, and initial state.
         */
        initializeModule: function () {
            // Store a reference to the current instance for use within nested functions.
            const selfRef = this;

            // Determine the type of the initial input element.
            let inputKind = jQuery(this.sourceElement).prop("type");
            if (inputKind === "file") {
                this._hiddenFileInput = jQuery(this.sourceElement);
            } else {
                // If not a standard file input, create a hidden one for actual file selection.
                jQuery(this.sourceElement).after('<input type="file" style="display:none" accept="image/*">');
                this._hiddenFileInput = jQuery(this.sourceElement).next("input");
            }

            // Check if the browser supports required features; if not, revert to a basic file input.
            if (!this.verifyEnvironmentSupport()) {
                if (inputKind !== "file") {
                    jQuery(this.sourceElement).prop("type", "file");
                    jQuery(this._hiddenFileInput).remove();
                }
                jQuery(this.sourceElement).show();
                jQuery(this.containerElement).remove();
                console.warn("ImageForge: Browser lacks required capabilities. Reverting to standard file input.");
                return;
            }

            // Acquire references to key DOM elements within the editor UI.
            this._mainCanvas = jQuery(this.containerElement).find(".picedit_canvas > canvas")[0];
            this._mainContext = this._mainCanvas.getContext("2d"); // 2D rendering context for the main canvas.

            this._cameraStreamBox = jQuery(this.containerElement).find(".picedit_video"); // Video element for camera input.
            this._drawingOverlay = jQuery(this.containerElement).find(".picedit_painter"); // Drawing layer container.
            this._drawingCanvas = this._drawingOverlay.children("canvas")[0];
            this._drawingContext = this._drawingCanvas.getContext("2d");
            this._isDrawingActive = false; // State flag for drawing operations.

            this._notificationPanel = jQuery(this.containerElement).find(".picedit_message"); // Message display area.
            this._notificationTimer = null; // Timer ID for auto-hiding notifications.

            this._actionButtonContainer = jQuery(this.containerElement).find(".picedit_action_btns"); // Container for main action buttons.

            // Object to store the dimensions of the visible image area.
            this._displayArea = {
                "width": 0,
                "height": 0
            };

            // State and references for the cropping functionality.
            this._cropState = {
                isDragging: false,
                isResizing: false,
                currentX: 0,
                currentY: 0,
                initialWidth: 0,
                initialHeight: 0,
                selectionBox: jQuery(this.containerElement).find(".picedit_drag_resize"),
                selectionFrame: jQuery(this.containerElement).find(".picedit_drag_resize_box")
            };

            /**
             * Processes a file input event to load an image.
             * @param {FileList} fileList - The list of files from the input or drag/drop.
             */
            const processInputFiles = (fileList) => {
                if (!fileList || fileList.length === 0) {
                    console.log("ImageForge: No files provided for processing.");
                    return;
                }
                const firstFile = fileList[0];
                if (!this._originalFileName) { // Only set filename if not already set (e.g., from paste).
                    this._originalFileName = firstFile.name;
                }
                const fileReader = new FileReader();
                fileReader.onload = (event) => {
                    selfRef._loadImageFromSource(event.target.result, false, firstFile);
                };
                fileReader.readAsDataURL(firstFile);
            };

            // Bind events for file drag-and-drop.
            jQuery(this.containerElement).find(".picedit_canvas_box")
                .on("drop", function(event) {
                    event.preventDefault();
                    jQuery(this).removeClass('dragging');
                    const droppedFiles = (event.dataTransfer || event.originalEvent.dataTransfer).files;
                    processInputFiles(droppedFiles);
                })
                .on("dragover", function(event) {
                    event.preventDefault();
                    jQuery(this).addClass('dragging');
                })
                .on("dragleave", function(event) {
                    event.preventDefault();
                    jQuery(this).removeClass('dragging');
                });

            // Bind the change event to the hidden file input.
            jQuery(this._hiddenFileInput).on("change", function() {
                processInputFiles(this.files);
            });

            // Setup clipboard paste functionality.
            // For browsers like Firefox that might not fully support `clipboardData` directly,
            // a contenteditable div acts as a fallback.
            let pasteCatchDiv;
            if (!windowObj.ClipboardEvent) { // Check for ClipboardEvent support.
                pasteCatchDiv = jQuery("<div/>").prop("contenteditable", "true").css({
                    "position": "absolute",
                    "left": -9999,
                    "width": 1,
                    "height": 1,
                    "overflow": "hidden",
                    "outline": "none",
                    "opacity": 0
                });
                jQuery(documentObj.body).prepend(pasteCatchDiv);
            }

            jQuery(documentObj).on("paste", (event) => {
                const clipboardItems = (event.clipboardData || event.originalEvent.clipboardData).items;
                let imageBlob = null;

                if (!clipboardItems) { // Fallback for browsers without direct clipboardData access.
                    if (pasteCatchDiv) {
                        pasteCatchDiv.get(0).focus();
                        pasteCatchDiv.one('DOMSubtreeModified', function() { // Use .one() to prevent multiple bindings.
                            const pastedChild = pasteCatchDiv.children().last().get(0);
                            if (pastedChild) {
                                if (pastedChild.tagName === "IMG" && pastedChild.src.startsWith('data:')) {
                                    selfRef._loadImageFromSource(pastedChild.src);
                                } else if (pastedChild.tagName === "IMG" && pastedChild.src.startsWith('http')) {
                                    selfRef._loadImageFromSource(pastedChild.src, false, false, true);
                                }
                            }
                            pasteCatchDiv.html(""); // Clear the catcher after processing.
                        });
                    } else {
                        console.warn("ImageForge: Clipboard data not available and no paste catcher fallback.");
                    }
                } else {
                    for (let i = 0; i < clipboardItems.length; i++) {
                        if (clipboardItems[i].type.startsWith("image")) {
                            imageBlob = clipboardItems[i].getAsFile();
                            break; // Found an image, no need to check further.
                        }
                    }
                    if (imageBlob) {
                        const blobReader = new FileReader();
                        blobReader.onload = (e) => { selfRef._loadImageFromSource(e.target.result); };
                        blobReader.readAsDataURL(imageBlob);
                    }
                }
            });

            // Initialize form data and bind form submission.
            this._formDataInstance = null; // Will hold the FormData object.
            this._parentForm = jQuery(this.sourceElement).parents("form");
            if (this._parentForm.length) {
                this._parentForm.on("submit", () => selfRef._handleFormSubmission());
            }

            // Call helper methods to bind UI controls and set initial variable values.
            this._attachControlHandlers();
            this._syncInputVariables();
            this._activateCropInteraction(); // Setup drag/resize for cropping.

            // Set initial values for internal interface data.
            this._interfaceData.pen_color = "black";
            this._interfaceData.pen_size = 5; // Default pen size.
            this._interfaceData.prev_pos = null; // Used for drawing.

            // Load a default image if specified in the settings.
            if (this.moduleSettings.initialImageSource) {
                thisRef.loadDefaultPicture(this.moduleSettings.initialImageSource);
            }
        },

        /**
         * Verifies the browser's capability to run the image editor.
         * @returns {boolean} True if capabilities are met, false otherwise.
         */
        verifyEnvironmentSupport: function () {
            // Check for HTML5 Canvas support.
            if (!windowObj.CanvasRenderingContext2D) {
                console.warn("ImageForge: Canvas 2D context not supported.");
                return false;
            }
            // Check for FileReader API support (essential for local file processing).
            if (!windowObj.FileReader) {
                console.warn("ImageForge: FileReader API not supported.");
                return false;
            }
            // All essential capabilities are present.
            return true;
        },

        /**
         * Loads a default image into the editor from a given path.
         * @param {string} imagePath - The URL or path to the default image.
         */
        loadDefaultPicture: function (imagePath) {
            if (typeof imagePath !== 'string' || imagePath.trim() === '') {
                console.error("ImageForge: Invalid image path provided for default picture.");
                return;
            }
            this._loadImageFromSource(imagePath, false, false, true);
        },

        /**
         * Clears all messages and hides the notification panel.
         */
        concealNotification: function () {
            const notificationBox = this._notificationPanel;
            notificationBox.removeClass("active no_close_button");
            // Delay clearing content to allow for CSS transitions.
            setTimeout(() => { notificationBox.children("div").html(""); }, 200);
        },

        /**
         * Displays a loading or processing message in the notification panel.
         * @param {number|string} messageType - 1 for "Working...", any other value for "Please Wait...".
         * @returns {jQuery} The notification panel element for chaining.
         */
        displayProcessingMessage: function (messageType) {
            if (messageType === 1) {
                return this.showNotification("Working...", false, false);
            }
            return this.showNotification("Please Wait...", false, false);
        },

        /**
         * Displays a custom message in the notification panel.
         * @param {string} messageText - The message content to display.
         * @param {number|boolean} [autoHideDuration=3000] - Duration in ms to auto-hide, or false to keep visible.
         * @param {boolean} [showCloseButton=true] - Whether to display a close button.
         * @returns {jQuery} The notification panel element for chaining.
         */
        showNotification: function (messageText, autoHideDuration, showCloseButton) {
            autoHideDuration = (typeof autoHideDuration !== 'undefined') ? autoHideDuration : 3000;
            showCloseButton = (typeof showCloseButton !== 'undefined') ? showCloseButton : true;

            let cssClasses = "active";
            if (!showCloseButton) {
                cssClasses += " no_close_button";
            }

            if (autoHideDuration) {
                clearTimeout(this._notificationTimer);
                this._notificationTimer = setTimeout(() => { this.concealNotification(); }, autoHideDuration);
            }

            return this._notificationPanel.addClass(cssClasses).children("div").html(messageText);
        },

        /**
         * Toggles the active state of a feature button and updates associated internal variables.
         * @param {HTMLElement} buttonElement - The button element that was clicked.
         */
        toggleFeatureButton: function (buttonElement) {
            const $button = jQuery(buttonElement);
            let isActive = $button.hasClass("active");
            let newValue = !isActive; // Determine the new state.

            if (isActive) {
                $button.removeClass("active");
            } else {
                // Deactivate sibling buttons if this one is being activated.
                $button.siblings().removeClass("active");
                $button.addClass("active");
            }

            const variableName = $button.data("variable");
            if (variableName) {
                let assignedValue = $button.data("value");
                if (!assignedValue) {
                    assignedValue = $button.val(); // Fallback to button value if no data-value.
                }

                // If button is active and has an assigned value, use that. Otherwise, use the boolean state.
                const finalVariableValue = (assignedValue && newValue) ? assignedValue : newValue;
                this._updateInterfaceVariable(variableName, finalVariableValue);
            }

            // Conditionally open/close drawing tool based on pen settings.
            if (this._interfaceData.pen_color && this._interfaceData.pen_size) {
                this.activateDrawingTool();
            } else {
                this.deactivateDrawingTool();
            }
        },

        /**
         * Triggers the hidden file input to open the file selection dialog.
         */
        triggerImageSelection: function () {
            this._hiddenFileInput.click();
        },

        /**
         * Activates the drawing tool overlay if an image is loaded.
         */
        activateDrawingTool: function () {
            if (!this._activeImageObject) {
                return this._hideAllToolPanels(true); // Hide all panels and show message if no image.
            }
            this.configureDrawingTool();
            this._drawingOverlay.addClass("active");
            this._hideAllToolPanels(); // Hide other tool panels.
        },

        /**
         * Configures the drawing canvas context based on current pen settings.
         */
        configureDrawingTool: function () {
            // Reset canvas width to clear, then set to match main canvas.
            this._drawingCanvas.width = 0;
            this._drawingCanvas.width = this._mainCanvas.width;
            this._drawingCanvas.height = this._mainCanvas.height;
            this._drawingContext.lineJoin = "round";
            this._drawingContext.lineCap = "round";
            this._drawingContext.strokeStyle = this._interfaceData.pen_color;
            this._drawingContext.lineWidth = this._interfaceData.pen_size;
        },

        /**
         * Deactivates and hides the drawing tool overlay.
         */
        deactivateDrawingTool: function () {
            this._drawingOverlay.removeClass("active");
        },

        /**
         * Rotates the current image 90 degrees counter-clockwise.
         */
        rotateImageCounterClockwise: function () {
            if (!this._activeImageObject) {
                return this._hideAllToolPanels(true);
            }
            this._executeRotationTask(-90);
            this._hideAllToolPanels();
        },

        /**
         * Rotates the current image 90 degrees clockwise.
         */
        rotateImageClockwise: function () {
            if (!this._activeImageObject) {
                return this._hideAllToolPanels(true);
            }
            this._executeRotationTask(90);
            this._hideAllToolPanels();
        },

        /**
         * Helper to perform image rotation with loading feedback.
         * @param {number} angle - Rotation angle in degrees.
         */
        _executeRotationTask: function(angle) {
            const selfRef = this;
            this.displayProcessingMessage(1).delay(200).promise().done(function() {
                selfRef._performImageRotation(angle);
                selfRef._adjustDisplayArea();
                selfRef.concealNotification();
            });
        },

        /**
         * Resizes the current image based on user-defined dimensions.
         */
        executeImageResize: function () {
            if (!this._activeImageObject) {
                return this._hideAllToolPanels(true);
            }
            const selfRef = this;
            this.displayProcessingMessage(1).delay(200).promise().done(function() {
                const tempCanvas = documentObj.createElement('canvas');
                const tempCtx = tempCanvas.getContext("2d");

                const targetWidth = selfRef._interfaceData.resize_width;
                const targetHeight = selfRef._interfaceData.resize_height;

                if (!targetWidth || !targetHeight || targetWidth <= 0 || targetHeight <= 0) {
                    selfRef.showNotification("Invalid resize dimensions.", 3000, true);
                    return;
                }

                tempCanvas.width = targetWidth;
                tempCanvas.height = targetHeight;
                tempCtx.drawImage(selfRef._activeImageObject, 0, 0, tempCanvas.width, tempCanvas.height);

                selfRef._loadImageFromSource(tempCanvas.toDataURL("image/png"), function() {
                    selfRef.concealNotification();
                });
            });
            this._hideAllToolPanels();
        },

        /**
         * Initiates camera stream capture and displays it in the video box.
         */
        initiateCameraCapture: function() {
            const browserGetUserMedia = navigator.mediaDevices && navigator.mediaDevices.getUserMedia ?
                                        (constraints) => navigator.mediaDevices.getUserMedia(constraints) :
                                        (navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia);

            if (!browserGetUserMedia) {
                return this.showNotification("Sorry, your browser doesn't support WebRTC!", 5000);
            }

            const selfRef = this;
            const videoElement = this._cameraStreamBox.find("video")[0];

            browserGetUserMedia({ audio: false, video: true })
                .then(function(stream) {
                    if ("srcObject" in videoElement) {
                        videoElement.srcObject = stream;
                    } else {
                        videoElement.src = windowObj.URL.createObjectURL(stream);
                    }
                    videoElement.onloadedmetadata = function() {
                        if (videoElement.videoWidth && videoElement.videoHeight) {
                            // Update internal image dimensions to match video stream for display area adjustment.
                            if (!selfRef._activeImageObject) {
                                selfRef._activeImageObject = {};
                            }
                            selfRef._activeImageObject.width = videoElement.videoWidth;
                            selfRef._activeImageObject.height = videoElement.videoHeight;
                            selfRef._adjustDisplayArea();
                        }
                    };
                    videoElement.play(); // Start playing the stream.
                    selfRef._cameraStreamBox.addClass("active");
                })
                .catch(function(error) {
                    console.error("ImageForge: Camera access denied or error:", error);
                    selfRef.showNotification("No video source detected! Please allow camera access!", 5000);
                });
        },

        /**
         * Terminates camera stream and hides the video box.
         */
        terminateCameraCapture: function() {
            const videoElement = this._cameraStreamBox.find("video")[0];
            const stream = videoElement.srcObject;
            if (stream) {
                stream.getTracks().forEach(track => track.stop()); // Stop all tracks in the stream.
                videoElement.srcObject = null;
            } else if (videoElement.src) { // Fallback for older src=URL.createObjectURL
                URL.revokeObjectURL(videoElement.src);
                videoElement.src = "";
            }
            this._cameraStreamBox.removeClass("active");
        },

        /**
         * Captures a still image from the active camera stream.
         */
        captureSnapshot: function() {
            const selfRef = this;
            const liveVideo = this._cameraStreamBox.find("video")[0];
            const captureCanvas = documentObj.createElement('canvas');
            const captureCtx = captureCanvas.getContext("2d");

            captureCanvas.width = liveVideo.videoWidth || liveVideo.clientWidth;
            captureCanvas.height = liveVideo.videoHeight || liveVideo.clientHeight;

            captureCtx.drawImage(liveVideo, 0, 0, captureCanvas.width, captureCanvas.height);

            this._loadImageFromSource(captureCanvas.toDataURL("image/png"), function() {
                selfRef.terminateCameraCapture(); // Close camera after capture.
            });
        },

        /**
         * Applies the defined crop region to the current image.
         */
        applyImageCrop: function() {
            const cropDimensions = this._determineCropRegion();
            const selfRef = this;

            if (!this._activeImageObject || !cropDimensions) {
                this.showNotification("No image or invalid crop region.", 3000, true);
                this.deactivateCropMode();
                return;
            }

            this.displayProcessingMessage(1).delay(200).promise().done(function() {
                const cropCanvas = documentObj.createElement('canvas');
                const cropCtx = cropCanvas.getContext("2d");

                cropCanvas.width = cropDimensions.width;
                cropCanvas.height = cropDimensions.height;

                // Draw the cropped portion from the original image onto the new canvas.
                cropCtx.drawImage(
                    selfRef._activeImageObject,
                    cropDimensions.left, cropDimensions.top, // Source X, Y
                    cropDimensions.width, cropDimensions.height, // Source Width, Height
                    0, 0, // Destination X, Y
                    cropDimensions.width, cropDimensions.height // Destination Width, Height
                );

                selfRef._loadImageFromSource(cropCanvas.toDataURL("image/png"), function() {
                    selfRef.concealNotification();
                });
            });
            this.deactivateCropMode(); // Close the crop tool after applying.
        },

        /**
         * Activates the cropping tool interface.
         */
        activateCropMode: function () {
            if (!this._activeImageObject) {
                return this._hideAllToolPanels(true);
            }
            this._cropState.selectionBox.addClass("active");
            this._hideAllToolPanels();
        },

        /**
         * Deactivates and hides the cropping tool interface.
         */
        deactivateCropMode: function () {
            this._cropState.selectionBox.removeClass("active");
            this._resetCroppingState(); // Reset internal crop state.
        },

        /**
         * Creates a new image object from a data source (URL or data URL) and updates the editor.
         * @param {string} dataSource - The URL or Data URL of the image.
         * @param {function} [callback] - An optional callback to execute after the image is loaded.
         * @param {File} [fileObject] - The original File object if loaded from local.
         * @param {boolean} [isExternalUrl=false] - True if dataSource is an external URL, requiring crossOrigin attribute.
         */
        _loadImageFromSource: function(dataSource, callback, fileObject, isExternalUrl = false) {
            const selfRef = this;
            const newImage = documentObj.createElement("img");

            if (isExternalUrl) {
                newImage.setAttribute('crossOrigin', 'anonymous'); // Required for canvas security with external images.
            }
            if (fileObject) {
                newImage.file = fileObject;
                selfRef._originalFileName = fileObject.name; // Ensure filename is updated.
            } else if (!selfRef._originalFileName && !isExternalUrl) {
                // If no file object and not external URL, it might be a paste or data URL without origin file.
                selfRef._originalFileName = "pasted_image.png"; // Generic name.
            }

            newImage.src = dataSource;
            newImage.onload = function() {
                // If loaded from an external URL, draw it to a canvas to handle potential tainted canvas issues
                // and convert to data URL for internal consistency.
                if (isExternalUrl) {
                    const tempCanvas = documentObj.createElement('canvas');
                    const tempCtx = tempCanvas.getContext('2d');
                    tempCanvas.width = newImage.width;
                    tempCanvas.height = newImage.height;
                    tempCtx.drawImage(newImage, 0, 0);
                    newImage.src = tempCanvas.toDataURL('image/png'); // Convert to data URL.
                }

                selfRef._activeImageObject = newImage;
                selfRef._adjustDisplayArea(); // Adjust viewport to new image dimensions.
                selfRef._renderCurrentImage(); // Draw the image on the main canvas.
                selfRef.moduleSettings.imageUpdated(selfRef._activeImageObject); // Trigger update callback.
                selfRef._actionButtonContainer.removeClass("active"); // Hide any active button containers.

                if (typeof callback === "function") {
                    callback();
                }
            };
            newImage.onerror = function() {
                console.error("ImageForge: Failed to load image from source:", dataSource);
                selfRef.showNotification("Failed to load image. Please check the source.", 5000, true);
                if (typeof callback === "function") {
                    callback(new Error("Image load failed"));
                }
            };
        },

        /**
         * Sets up global event listeners for cropping box drag and resize, and drawing strokes.
         */
        _setupInteractionListeners: function() {
            const selfRef = this;
            const cropFrame = this._cropState.selectionFrame;
            const drawingTool = this._drawingOverlay;
            const resizeHandle = this._cropState.selectionBox.find(".picedit_drag_resize_box_corner_wrap");

            // Helper to get event coordinates (handles both mouse and touch events).
            const getEventCoords = (e) => {
                const event = e.originalEvent || e;
                return event.touches && event.touches[0] ? event.touches[0] : event;
            };

            jQuery(windowObj).on("mousedown touchstart", function(e) {
                const initialCoords = getEventCoords(e);
                selfRef._cropState.currentX = initialCoords.clientX;
                selfRef._cropState.currentY = initialCoords.clientY;
                selfRef._cropState.initialWidth = cropFrame[0].clientWidth;
                selfRef._cropState.initialHeight = cropFrame[0].clientHeight;

                // Bind move handlers to window to capture events even if pointer leaves the element.
                jQuery(windowObj).on("mousemove.imageForge touchmove.imageForge", function(moveEvent) {
                    moveEvent.stopPropagation();
                    moveEvent.preventDefault();

                    const target = moveEvent.target || moveEvent.srcElement;
                    if (jQuery.contains(cropFrame[0], target) || target === cropFrame[0]) {
                        selfRef._cropState.isDragging = true;
                        if (!selfRef._cropState.isResizing) {
                            selfRef._handleCropDrag(moveEvent);
                        }
                    } else if (jQuery.contains(resizeHandle[0], target) || target === resizeHandle[0]) {
                        selfRef._cropState.isResizing = true;
                        selfRef._handleCropResize(moveEvent);
                    } else if (jQuery.contains(drawingTool[0], target) || target === drawingTool[0]) {
                        selfRef._isDrawingActive = true;
                        selfRef._handleDrawingStroke(moveEvent);
                    }
                });
            });

            jQuery(windowObj).on("mouseup touchend", function() {
                if (selfRef._isDrawingActive) {
                    selfRef._integrateDrawingLayer();
                }
                selfRef._resetCroppingState(); // Reset crop flags and drawing state.
                selfRef._interfaceData.prev_pos = null; // Clear previous drawing position.

                // Unbind the temporary move handlers.
                jQuery(windowObj).off("mousemove.imageForge touchmove.imageForge");
            });
        },

        /**
         * Handles the resizing movement of the cropping box.
         * @param {Event} e - The mouse or touch event.
         */
        _handleCropResize: function(e) {
            if (!this._cropState.isResizing) return;

            const currentCropFrame = this._cropState.selectionFrame[0];
            const eventCoordinates = getEventCoords(e);

            const newWidth = this._cropState.initialWidth + (eventCoordinates.clientX - this._cropState.currentX);
            const newHeight = this._cropState.initialHeight + (eventCoordinates.clientY - this._cropState.currentY);

            // Ensure minimum dimensions.
            currentCropFrame.style.width = Math.max(20, newWidth) + 'px';
            currentCropFrame.style.height = Math.max(20, newHeight) + 'px';
        },

        /**
         * Handles the dragging movement of the cropping box.
         * @param {Event} e - The mouse or touch event.
         */
        _handleCropDrag: function(e) {
            if (!this._cropState.isDragging || this._cropState.isResizing) return;

            const currentCropFrame = this._cropState.selectionFrame[0];
            const eventCoordinates = getEventCoords(e);

            // Calculate new position based on current mouse/touch and half of the crop frame dimensions.
            const newTop = eventCoordinates.pageY - parseInt(currentCropFrame.clientHeight / 2, 10);
            const newLeft = eventCoordinates.pageX - parseInt(currentCropFrame.clientWidth / 2, 10);

            this._cropState.selectionFrame.offset({
                top: newTop,
                left: newLeft
            });
        },

        /**
         * Handles drawing strokes on the painter canvas.
         * @param {Event} e - The mouse or touch event.
         */
        _handleDrawingStroke: function(e) {
            if (!this._isDrawingActive) return;

            const drawingCanvasRect = this._drawingCanvas.getBoundingClientRect();
            const eventCoordinates = getEventCoords(e);

            const currentX = eventCoordinates.clientX - drawingCanvasRect.left;
            const currentY = eventCoordinates.clientY - drawingCanvasRect.top;

            if (this._interfaceData.prev_pos) {
                this._drawingContext.beginPath();
                this._drawingContext.moveTo(this._interfaceData.prev_pos.x, this._interfaceData.prev_pos.y);
                this._drawingContext.lineTo(currentX, currentY);
                this._drawingContext.stroke();
            }
            this._interfaceData.prev_pos = { x: currentX, y: currentY };
        },

        /**
         * Resets the cropping interaction flags.
         */
        _resetCroppingState: function() {
            this._cropState.isDragging = false;
            this._cropState.isResizing = false;
            this._isDrawingActive = false;
        },

        // --- Private Helper Methods (renamed and potentially refactored) ---

        /**
         * (Placeholder for UI template rendering, typically from `_template` method).
         * This method would dynamically build the editor's HTML structure.
         */
        _buildUserInterface: function() {
            // Original code had a `_template()` call here.
            // In a real Type III clone, this would involve rewriting how the HTML is generated
            // (e.g., using different jQuery methods, or a different templating approach).
            // For this exercise, we acknowledge its presence and skip detailed rewrite as the prompt
            // focuses on JS logic.
            console.log("ImageForge: UI template rendering placeholder.");
            // Example of a re-imagined template setup:
            const templateHtml = `
                <div class="${this._moduleIdentifier}_wrapper">
                    <div class="${this._moduleIdentifier}_canvas_box">
                        <canvas class="${this._moduleIdentifier}_main_canvas"></canvas>
                        <div class="${this._moduleIdentifier}_video">
                            <video autoplay playsinline muted></video>
                            <button class="${this._moduleIdentifier}_capture_btn">Capture</button>
                        </div>
                        <div class="${this._moduleIdentifier}_painter">
                            <canvas class="${this._moduleIdentifier}_drawing_canvas"></canvas>
                        </div>
                        <div class="${this._moduleIdentifier}_drag_resize">
                            <div class="${this._moduleIdentifier}_drag_resize_box">
                                <div class="${this._moduleIdentifier}_drag_resize_box_corner_wrap"></div>
                            </div>
                        </div>
                    </div>
                    <div class="${this._moduleIdentifier}_tools">
                        <div class="${this._moduleIdentifier}_action_btns">
                            <!-- Buttons for load, rotate, crop, draw, camera, etc. -->
                        </div>
                        <div class="${this._moduleIdentifier}_message"><div></div></div>
                    </div>
                </div>`;
            jQuery(this.containerElement).html(templateHtml);
            // Update internal references after rendering template.
            this._mainCanvas = jQuery(this.containerElement).find(`.${this._moduleIdentifier}_main_canvas`)[0];
            this._cameraStreamBox = jQuery(this.containerElement).find(`.${this._moduleIdentifier}_video`);
            this._drawingOverlay = jQuery(this.containerElement).find(`.${this._moduleIdentifier}_painter`);
            this._drawingCanvas = jQuery(this.containerElement).find(`.${this._moduleIdentifier}_drawing_canvas`)[0];
            this._cropState.selectionBox = jQuery(this.containerElement).find(`.${this._moduleIdentifier}_drag_resize`);
            this._cropState.selectionFrame = jQuery(this.containerElement).find(`.${this._moduleIdentifier}_drag_resize_box`);
            this._notificationPanel = jQuery(this.containerElement).find(`.${this._moduleIdentifier}_message`);
            this._actionButtonContainer = jQuery(this.containerElement).find(`.${this._moduleIdentifier}_action_btns`);
            this.initializeModule(); // Now initialize the functional parts.
        },

        /**
         * Performs image rotation on a temporary canvas and updates the current image.
         * @param {number} degrees - The rotation angle in degrees.
         */
        _performImageRotation: function(degrees) {
            if (!this._activeImageObject) return;

            const tempCanvas = documentObj.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            const img = this._activeImageObject;

            let newWidth, newHeight;
            const absDegrees = Math.abs(degrees);

            if (absDegrees === 90 || absDegrees === 270) {
                // If rotating by 90 or 270 degrees, swap width and height.
                newWidth = img.height;
                newHeight = img.width;
            } else {
                // For 0, 180, 360 degrees, dimensions remain the same.
                newWidth = img.width;
                newHeight = img.height;
            }

            tempCanvas.width = newWidth;
            tempCanvas.height = newHeight;

            tempCtx.translate(newWidth / 2, newHeight / 2); // Move origin to center of canvas.
            tempCtx.rotate(degrees * Math.PI / 180);       // Rotate.
            tempCtx.drawImage(img, -img.width / 2, -img.height / 2); // Draw image centered.

            // Update the internal image object with the rotated version.
            this._loadImageFromSource(tempCanvas.toDataURL("image/png"));
        },

        /**
         * Adjusts the main canvas and viewport dimensions to fit the current image.
         */
        _adjustDisplayArea: function() {
            if (!this._activeImageObject) return;

            const img = this._activeImageObject;
            let targetWidth = img.width;
            let targetHeight = img.height;

            const maxAllowedWidth = this.moduleSettings.maxWidth;
            const maxAllowedHeight = (this.moduleSettings.maxHeight === 'auto') ? img.height : this.moduleSettings.maxHeight;

            // Apply max width constraint.
            if (targetWidth > maxAllowedWidth) {
                targetHeight = (targetHeight / targetWidth) * maxAllowedWidth;
                targetWidth = maxAllowedWidth;
            }

            // Apply max height constraint, maintaining aspect ratio if enabled.
            if (targetHeight > maxAllowedHeight) {
                targetWidth = (targetWidth / targetHeight) * maxAllowedHeight;
                targetHeight = maxAllowedHeight;
            }

            // Update canvas dimensions.
            this._mainCanvas.width = targetWidth;
            this._mainCanvas.height = targetHeight;

            // Update viewport dimensions (used for other calculations like cropping).
            this._displayArea.width = targetWidth;
            this._displayArea.height = targetHeight;

            // Redraw image to fit new canvas size.
            this._renderCurrentImage();
        },

        /**
         * Draws the current active image onto the main canvas.
         */
        _renderCurrentImage: function() {
            if (!this._activeImageObject || !this._mainCanvas) return;

            // Clear the canvas before drawing.
            this._mainContext.clearRect(0, 0, this._mainCanvas.width, this._mainCanvas.height);
            // Draw the image scaled to fit the canvas.
            this._mainContext.drawImage(
                this._activeImageObject,
                0, 0,
                this._mainCanvas.width, this._mainCanvas.height
            );
        },

        /**
         * Calculates the actual pixel coordinates and dimensions of the cropping window
         * relative to the original image's size.
         * @returns {object|null} An object with `left`, `top`, `width`, `height` or null if no image.
         */
        _determineCropRegion: function() {
            if (!this._activeImageObject) return null;

            const mainCanvasRect = this._mainCanvas.getBoundingClientRect();
            const cropFrameRect = this._cropState.selectionFrame[0].getBoundingClientRect();

            // Calculate crop frame position relative to the main canvas.
            let cropLeft = cropFrameRect.left - mainCanvasRect.left;
            let cropTop = cropFrameRect.top - mainCanvasRect.top;
            let cropWidth = cropFrameRect.width;
            let cropHeight = cropFrameRect.height;

            // Clamp crop region to canvas boundaries.
            cropLeft = Math.max(0, cropLeft);
            cropTop = Math.max(0, cropTop);
            cropWidth = Math.min(this._mainCanvas.width - cropLeft, cropWidth);
            cropHeight = Math.min(this._mainCanvas.height - cropTop, cropHeight);

            // Scale these dimensions to the original image's pixel size.
            const scaleX = this._activeImageObject.width / this._mainCanvas.width;
            const scaleY = this._activeImageObject.height / this._mainCanvas.height;

            return {
                left: Math.round(cropLeft * scaleX),
                top: Math.round(cropTop * scaleY),
                width: Math.round(cropWidth * scaleX),
                height: Math.round(cropHeight * scaleY)
            };
        },

        /**
         * Merges the drawing from the overlay canvas onto the main image.
         */
        _integrateDrawingLayer: function() {
            if (!this._activeImageObject || !this._drawingCanvas || !this._drawingContext) return;

            const selfRef = this;
            this.displayProcessingMessage(1).delay(100).promise().done(function() {
                // First, draw the current main image onto a temporary canvas.
                const tempMergeCanvas = documentObj.createElement('canvas');
                const tempMergeCtx = tempMergeCanvas.getContext('2d');
                tempMergeCanvas.width = selfRef._activeImageObject.width;
                tempMergeCanvas.height = selfRef._activeImageObject.height;
                tempMergeCtx.drawImage(selfRef._activeImageObject, 0, 0);

                // Now, scale and draw the drawing overlay onto the temporary canvas.
                // The drawing canvas might be scaled down, so we need to scale up to original image size.
                const scaleX = selfRef._activeImageObject.width / selfRef._drawingCanvas.width;
                const scaleY = selfRef._activeImageObject.height / selfRef._drawingCanvas.height;

                tempMergeCtx.drawImage(
                    selfRef._drawingCanvas,
                    0, 0, selfRef._drawingCanvas.width, selfRef._drawingCanvas.height, // Source region from drawing canvas.
                    0, 0, tempMergeCanvas.width, tempMergeCanvas.height // Destination region on tempMergeCanvas.
                );

                // Update the main image with the merged result.
                selfRef._loadImageFromSource(tempMergeCanvas.toDataURL("image/png"), function() {
                    selfRef.deactivateDrawingTool(); // Hide drawing tool.
                    selfRef._drawingContext.clearRect(0, 0, selfRef._drawingCanvas.width, selfRef._drawingCanvas.height); // Clear drawing layer.
                    selfRef.concealNotification();
                });
            });
        },

        /**
         * Hides all active tool panels (cropping, drawing, video).
         * @param {boolean} [showMessageIfNoImage=false] - If true, displays a message if no image is loaded.
         */
        _hideAllToolPanels: function(showMessageIfNoImage = false) {
            this._cropState.selectionBox.removeClass("active");
            this._drawingOverlay.removeClass("active");
            this._cameraStreamBox.removeClass("active");
            this._actionButtonContainer.removeClass("active"); // Also hide any open action menus.

            if (showMessageIfNoImage && !this._activeImageObject) {
                this.showNotification("Please load an image first!", 3000, true);
            }
        },

        /**
         * Binds event handlers to the main control buttons.
         */
        _attachControlHandlers: function() {
            const selfRef = this;
            // Example: Find buttons by data attributes and attach click handlers.
            jQuery(this.containerElement).on('click', '[data-action]', function() {
                const action = jQuery(this).data('action');
                switch (action) {
                    case 'load': selfRef.triggerImageSelection(); break;
                    case 'rotate_ccw': selfRef.rotateImageCounterClockwise(); break;
                    case 'rotate_cw': selfRef.rotateImageClockwise(); break;
                    case 'crop_open': selfRef.activateCropMode(); break;
                    case 'crop_apply': selfRef.applyImageCrop(); break;
                    case 'crop_cancel': selfRef.deactivateCropMode(); break;
                    case 'draw_toggle': selfRef.toggleFeatureButton(this); break;
                    case 'camera_open': selfRef.initiateCameraCapture(); break;
                    case 'camera_capture': selfRef.captureSnapshot(); break;
                    case 'camera_close': selfRef.terminateCameraCapture(); break;
                    case 'resize_apply': selfRef.executeImageResize(); break;
                    default: console.warn(`ImageForge: Unrecognized action: ${action}`);
                }
            });

            // Bind specific toggle logic for buttons that modify variables.
            jQuery(this.containerElement).on('click', '[data-variable]', function() {
                selfRef.toggleFeatureButton(this);
            });
        },

        /**
         * Synchronizes input fields with internal variables.
         */
        _syncInputVariables: function() {
            const selfRef = this;
            jQuery(this.containerElement).on('change keyup', 'input[data-variable], select[data-variable]', function() {
                const variableName = jQuery(this).data('variable');
                let value = jQuery(this).val();

                // Attempt to parse numbers.
                if (!isNaN(parseFloat(value)) && isFinite(value)) {
                    value = parseFloat(value);
                }
                selfRef._updateInterfaceVariable(variableName, value);
            });
        },

        /**
         * Updates an internal interface variable.
         * @param {string} name - The name of the variable.
         * @param {*} value - The new value for the variable.
         */
        _updateInterfaceVariable: function(name, value) {
            this._interfaceData[name] = value;
            // Additional logic could be added here, e.g., re-render UI, update tool settings.
            if (name === 'pen_color' || name === 'pen_size') {
                this.configureDrawingTool(); // Reconfigure pen if settings change.
            }
            console.log(`ImageForge: Variable '${name}' updated to:`, value);
        },

        /**
         * Handles the form submission event.
         * @returns {boolean} False to prevent default form submission if processing, true otherwise.
         */
        _handleFormSubmission: function() {
            if (!this._activeImageObject) {
                this.showNotification("No image to submit!", 3000, true);
                return false; // Prevent submission if no image.
            }

            const selfRef = this;
            this.displayProcessingMessage(1); // Show "Working..." message.

            // Convert the current image on the main canvas to a data URL.
            const imageData = this._mainCanvas.toDataURL("image/png");

            // Create a new FormData object.
            this._formDataInstance = new FormData(this._parentForm[0]);

            // Append the image data as a file.
            // We need to convert the data URL to a Blob first.
            const dataURLtoBlob = (dataurl) => {
                const arr = dataurl.split(',');
                const mime = arr[0].match(/:(.*?);/)[1];
                const bstr = atob(arr[1]);
                let n = bstr.length;
                const u8arr = new Uint8Array(n);
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                return new Blob([u8arr], {type:mime});
            };

            const imageBlob = dataURLtoBlob(imageData);
            this._formDataInstance.append("picedit_processed_image", imageBlob, this._originalFileName || "processed_image.png");

            // Perform AJAX submission.
            jQuery.ajax({
                url: this._parentForm.attr('action') || windowObj.location.href, // Use form action or current page.
                type: this._parentForm.attr('method') || 'POST',
                data: this._formDataInstance,
                processData: false, // Don't process the data, let FormData handle it.
                contentType: false, // Don't set content type, let FormData handle it.
                success: function(response) {
                    selfRef.concealNotification();
                    selfRef.moduleSettings.submissionCompleted(response);
                    if (selfRef.moduleSettings.redirectUrl) {
                        windowObj.location.href = selfRef.moduleSettings.redirectUrl;
                    } else {
                        selfRef.showNotification("Image submitted successfully!", 3000);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    selfRef.concealNotification();
                    selfRef.showNotification(`Submission failed: ${textStatus} - ${errorThrown}`, 5000, true);
                    console.error("ImageForge: Form submission error:", textStatus, errorThrown, jqXHR);
                }
            });

            return false; // Prevent the default form submission.
        }
    };

    // Attach the module to jQuery's fn object, allowing it to be called on a jQuery selection.
    jQuery.fn[moduleKey] = function ( options ) {
        return this.each(function () {
            // Prevent multiple instantiations on the same element.
            if (!jQuery.data(this, 'plugin_' + moduleKey)) {
                jQuery.data(this, 'plugin_' + moduleKey, new ImageForge( this, options ));
            }
        });
    };

})( jQuery, window, document );