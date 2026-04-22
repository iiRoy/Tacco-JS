(function () {
    "use strict";

    const editorModuleName = 'visualEditor';

    const configPresets = {
        imageTransformationComplete: function(img){},
        submissionComplete: function(response){},
        redirectOnSubmit: false,
        maximumWidth: 400,
        maximumHeight: 'auto',
        maintainAspectRatio: true,
        initialImageData: false
    };

    class ImageTransformer {
        constructor(triggerElement, userOptions) {
            this.triggerElement = triggerElement;
            this.settings = Object.assign({}, configPresets, userOptions);

            this.initialSettings = configPresets;
            this.moduleName = editorModuleName;

            this.currentImageObject = null;
            this.sourceFileName = "";
            this.internalState = {};

            this.initializeModule();
        }

        initializeModule() {
            // Assume the necessary DOM structure is already present and correctly identified.
            // This replaces the _template() call and various $(this.element).find(...)
            // The user must ensure these elements exist with the specified IDs/classes.

            const initialElementType = this.triggerElement.type;
            if (initialElementType === "file") {
                this.fileInputWidget = this.triggerElement;
            } else {
                const hiddenInput = document.createElement("input");
                hiddenInput.type = "file";
                hiddenInput.style.display = "none";
                hiddenInput.accept = "image/*";
                this.triggerElement.parentNode.insertBefore(hiddenInput, this.triggerElement.nextSibling);
                this.fileInputWidget = hiddenInput;
            }

            if (!this.verifyEnvironmentSupport()) {
                if (initialElementType !== "file") {
                    this.triggerElement.type = "file";
                    this.fileInputWidget.remove();
                }
                this.triggerElement.style.display = ""; // Make original element visible if it was hidden
                if (this.triggerElement.parentNode) {
                    // Assuming this.triggerElement is inside the main editor container
                    // We need to remove the whole editor container, not just the trigger.
                    // This is an inference based on `$(this.element).remove()`
                    // For a Type IV clone, I'll assume the container has a specific ID.
                    const editorContainer = document.getElementById('visual-editor-container'); // new ID
                    if (editorContainer) editorContainer.remove();
                }
                return;
            }

            this.displayCanvas = document.querySelector(".editor-display-area > canvas");
            this.displayContext = this.displayCanvas.getContext("2d");
            this.cameraViewContainer = document.querySelector(".editor-camera-feed");
            this.drawingOverlay = document.querySelector(".editor-drawing-layer");
            this.drawingCanvas = this.drawingOverlay.querySelector("canvas");
            this.drawingContext = this.drawingCanvas.getContext("2d");
            this.isDrawingActive = false;

            this.feedbackPanel = document.querySelector(".editor-feedback-box");
            this.feedbackTimer = null;

            this.toolbarControls = document.querySelector(".editor-action-buttons");

            this.renderDimensions = {
                viewWidth: 0,
                viewHeight: 0
            };

            this.cropRegion = {
                isDragging: false,
                isResizing: false,
                leftOffset: 0,
                topOffset: 0,
                currentWidth: 0,
                currentHeight: 0,
                boundaryBox: document.querySelector(".editor-crop-handle-area"),
                frameBox: document.querySelector(".editor-crop-selection-frame")
            };

            const imageDropZone = document.querySelector(".editor-display-box");
            imageDropZone.addEventListener("drop", (event) => {
                event.preventDefault();
                imageDropZone.classList.remove('drag-over');
                const transferFiles = (event.dataTransfer || event.originalEvent.dataTransfer).files;
                this.loadImageFromFiles(transferFiles);
            });
            imageDropZone.addEventListener("dragover", (event) => {
                event.preventDefault();
                imageDropZone.classList.add('drag-over');
            });
            imageDropZone.addEventListener("dragleave", (event) => {
                event.preventDefault();
                imageDropZone.classList.remove('drag-over');
            });

            this.fileInputWidget.addEventListener("change", (event) => {
                this.loadImageFromFiles(event.target.files);
            });

            // Clipboard paste handling
            if (!window.ClipboardEvent) { // Firefox fallback
                const pasteCatcher = document.createElement("div");
                pasteCatcher.contentEditable = "true";
                Object.assign(pasteCatcher.style, {
                    position: "absolute",
                    left: "-9999px",
                    width: "0",
                    height: "0",
                    overflow: "hidden",
                    outline: "none",
                    opacity: "0"
                });
                document.body.prepend(pasteCatcher);

                let observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                            const addedNode = mutation.addedNodes[0];
                            if (addedNode.tagName === "IMG") {
                                if (addedNode.src.startsWith('data:')) {
                                    this.processImageSource(addedNode.src);
                                } else if (addedNode.src.startsWith('http')) {
                                    this.processImageSource(addedNode.src, null, true);
                                }
                            }
                            pasteCatcher.innerHTML = ""; // Clear after processing
                        }
                    });
                });
                observer.observe(pasteCatcher, { childList: true });
                // To trigger paste, focus the hidden div
                document.addEventListener("paste", (event) => {
                    if (!event.clipboardData || !event.clipboardData.items) {
                        pasteCatcher.focus();
                    }
                });
            }

            document.addEventListener("paste", (event) => {
                const items = (event.clipboardData || event.originalEvent.clipboardData).items;
                let imageBlob = null;
                if (items) {
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].type.indexOf("image") === 0) {
                            imageBlob = items[i].getAsFile();
                            break;
                        }
                    }
                }

                if (imageBlob) {
                    const reader = new FileReader();
                    reader.onload = (e) => { this.processImageSource(e.target.result); };
                    reader.readAsDataURL(imageBlob);
                }
            });

            this.submissionData = null;
            this.associatedForm = this.triggerElement.closest("form");
            if (this.associatedForm) {
                this.associatedForm.addEventListener("submit", (event) => this.handleFormSubmission(event));
            }

            this.setupToolbarEvents();
            this.monitorInputState();
            this.attachInteractionHandlers();

            this.internalState.drawingColor = "black";
            this.internalState.drawingSize = false;
            this.internalState.lastDrawingPosition = false;

            if (this.settings.initialImageData) {
                this.loadInitialImage(this.settings.initialImageData);
            }
        }

        verifyEnvironmentSupport() {
            return !!window.CanvasRenderingContext2D && !!window.FileReader;
        }

        loadInitialImage(path) {
            this.processImageSource(path, null, true);
        }

        clearFeedback() {
            this.feedbackPanel.classList.remove("is-active", "no-dismiss-button");
            setTimeout(() => { this.feedbackPanel.querySelector("div").innerHTML = ""; }, 200);
        }

        showProgressIndicator(message) {
            const displayMsg = message === 1 ? "Working..." : "Please Wait...";
            return this.displayFeedback(displayMsg, false, false);
        }

        displayFeedback(text, autoDismiss = 3000, showDismissButton = true) {
            let panelClasses = ["is-active"];
            if (!showDismissButton) panelClasses.push("no-dismiss-button");

            if (autoDismiss) {
                clearTimeout(this.feedbackTimer);
                this.feedbackTimer = setTimeout(() => { this.clearFeedback(); }, autoDismiss);
            }
            this.feedbackPanel.classList.add(...panelClasses);
            this.feedbackPanel.querySelector("div").innerHTML = text;
            return {
                delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
                promise: () => Promise.resolve(), // Mock jQuery promise for chaining
                done: (fn) => { setTimeout(fn, autoDismiss || 0); } // Execute after delay or immediately if no autoDismiss
            };
        }

        handleControlToggle(element) {
            let isActive = false;
            if (element.classList.contains("is-active")) {
                element.classList.remove("is-active");
            } else {
                isActive = true;
                Array.from(element.parentNode.children).forEach(sibling => {
                    if (sibling !== element) sibling.classList.remove("is-active");
                });
                element.classList.add("is-active");
            }

            const stateKey = element.dataset.stateKey;
            if (stateKey) {
                let stateValue = element.dataset.stateValue;
                if (!stateValue) stateValue = element.value;
                if (stateValue && isActive) {
                    this.updateInternalState(stateKey, stateValue);
                } else {
                    this.updateInternalState(stateKey, isActive);
                }
            }
            if (this.internalState.drawingColor && this.internalState.drawingSize) {
                this.activateDrawingTool();
            } else {
                this.deactivateDrawingTool();
            }
        }

        triggerFileInput() {
            this.fileInputWidget.click();
        }

        activateDrawingTool() {
            if (!this.currentImageObject) return this.collapseAllPanels(1);
            this.configureDrawingTool();
            this.drawingOverlay.classList.add("is-active");
            this.collapseAllPanels();
        }

        configureDrawingTool() {
            this.drawingCanvas.width = this.displayCanvas.width;
            this.drawingCanvas.height = this.displayCanvas.height;
            this.drawingContext.lineJoin = "round";
            this.drawingContext.lineCap = "round";
            this.drawingContext.strokeStyle = this.internalState.drawingColor;
            this.drawingContext.lineWidth = this.internalState.drawingSize;
        }

        deactivateDrawingTool() {
            this.drawingOverlay.classList.remove("is-active");
        }

        rotateImageCounterClockwise() {
            if (!this.currentImageObject) return this.collapseAllPanels(1);
            this.showProgressIndicator(1).delay(200).promise().done(() => {
                this.performRotationTransform(-90);
                this.adjustCanvasDisplay();
                this.clearFeedback();
            });
            this.collapseAllPanels();
        }

        rotateImageClockwise() {
            if (!this.currentImageObject) return this.collapseAllPanels(1);
            this.showProgressIndicator(1).delay(200).promise().done(() => {
                this.performRotationTransform(90);
                this.adjustCanvasDisplay();
                this.clearFeedback();
            });
            this.collapseAllPanels();
        }

        adjustImageDimensions() {
            if (!this.currentImageObject) return this.collapseAllPanels(1);
            this.showProgressIndicator(1).delay(200).promise().done(() => {
                const tempCanvas = document.createElement('canvas');
                const tempContext = tempCanvas.getContext("2d");
                tempCanvas.width = this.internalState.resizeWidth;
                tempCanvas.height = this.internalState.resizeHeight;
                tempContext.drawImage(this.currentImageObject, 0, 0, tempCanvas.width, tempCanvas.height);
                this.processImageSource(tempCanvas.toDataURL("image/png"), () => {
                    this.clearFeedback();
                });
            });
            this.collapseAllPanels();
        }

        startCameraCapture() {
            const getMedia = navigator.mediaDevices && navigator.mediaDevices.getUserMedia ?
                (constraints) => navigator.mediaDevices.getUserMedia(constraints) :
                navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia;

            if (!getMedia) {
                return this.displayFeedback("Sorry, your browser doesn't support WebRTC!", 5000);
            }

            getMedia({ audio: false, video: true })
                .then(stream => {
                    const videoElement = this.cameraViewContainer.querySelector("video");
                    videoElement.srcObject = stream;
                    videoElement.play(); // Start playing the stream

                    videoElement.onloadedmetadata = () => {
                        if (videoElement.videoWidth && videoElement.videoHeight) {
                            if (!this.currentImageObject) this.currentImageObject = {};
                            this.currentImageObject.width = videoElement.videoWidth;
                            this.currentImageObject.height = videoElement.videoHeight;
                            this.adjustCanvasDisplay();
                        }
                    };
                    this.cameraViewContainer.classList.add("is-active");
                })
                .catch(err => {
                    console.error("Camera access error:", err);
                    return this.displayFeedback("No video source detected! Please allow camera access!", 5000);
                });
        }

        stopCameraCapture() {
            const videoElement = this.cameraViewContainer.querySelector("video");
            if (videoElement.srcObject) {
                videoElement.srcObject.getTracks().forEach(track => track.stop());
                videoElement.srcObject = null;
            }
            this.cameraViewContainer.classList.remove("is-active");
        }

        captureSnapshot() {
            const videoElement = this.cameraViewContainer.querySelector("video");
            const tempCanvas = document.createElement('canvas');
            const tempContext = tempCanvas.getContext("2d");
            tempCanvas.width = videoElement.videoWidth;
            tempCanvas.height = videoElement.videoHeight;
            tempContext.drawImage(videoElement, 0, 0, tempCanvas.width, tempCanvas.height);
            this.processImageSource(tempCanvas.toDataURL("image/png"), () => {
                this.stopCameraCapture();
            });
        }

        applyCropOperation() {
            const cropArea = this.determineCropCoordinates();
            this.showProgressIndicator(1).delay(200).promise().done(() => {
                const tempCanvas = document.createElement('canvas');
                const tempContext = tempCanvas.getContext("2d");
                tempCanvas.width = cropArea.width;
                tempCanvas.height = cropArea.height;
                tempContext.drawImage(this.currentImageObject, cropArea.left, cropArea.top, cropArea.width, cropArea.height, 0, 0, cropArea.width, cropArea.height);
                this.processImageSource(tempCanvas.toDataURL("image/png"), () => {
                    this.clearFeedback();
                });
            });
            this.hideCropOverlay();
        }

        showCropOverlay() {
            if (!this.currentImageObject) return this.collapseAllPanels(1);
            this.cropRegion.boundaryBox.classList.add("is-active");
            this.collapseAllPanels();
        }

        hideCropOverlay() {
            this.cropRegion.boundaryBox.classList.remove("is-active");
        }

        processImageSource(dataSource, callback, isExternalURL = false) {
            const img = new Image();
            if (isExternalURL) img.crossOrigin = 'anonymous'; // For CORS issues
            img.src = dataSource;
            img.onload = () => {
                if (isExternalURL && !img.src.startsWith('data:')) {
                    // Draw to canvas to handle potential tainted canvas for external images
                    const tempCanvas = document.createElement('canvas');
                    const tempContext = tempCanvas.getContext('2d');
                    tempCanvas.width = img.width;
                    tempCanvas.height = img.height;
                    tempContext.drawImage(img, 0, 0);
                    img.src = tempCanvas.toDataURL('image/png'); // Convert to data URL
                }
                this.currentImageObject = img;
                this.adjustCanvasDisplay();
                this.renderCurrentImage();
                this.settings.imageTransformationComplete(this.currentImageObject);
                this.toolbarControls.classList.remove("is-active");
                if (callback && typeof(callback) === "function") callback();
            };
            img.onerror = (e) => {
                console.error("Error loading image:", e);
                this.displayFeedback("Failed to load image. Check URL or network.", 5000);
            };
        }

        attachInteractionHandlers() {
            const frame = this.cropRegion.frameBox;
            const resizer = this.cropRegion.boundaryBox.querySelector(".editor-crop-resize-handle");
            const painter = this.drawingOverlay;

            let currentInteractionType = null; // 'drag', 'resize', 'paint'

            const startInteraction = (event) => {
                const evt = event.touches ? event.touches[0] : event;
                this.cropRegion.startX = evt.clientX;
                this.cropRegion.startY = evt.clientY;
                this.cropRegion.startWidth = frame.offsetWidth;
                this.cropRegion.startHeight = frame.offsetHeight;
                this.cropRegion.startLeft = frame.offsetLeft;
                this.cropRegion.startTop = frame.offsetTop;

                if (event.target === resizer) {
                    currentInteractionType = 'resize';
                } else if (event.target === frame || frame.contains(event.target)) {
                    currentInteractionType = 'drag';
                } else if (event.target === painter || painter.contains(event.target)) {
                    currentInteractionType = 'paint';
                    this.isDrawingActive = true;
                } else {
                    currentInteractionType = null;
                    return;
                }

                document.addEventListener("mousemove", duringInteraction);
                document.addEventListener("mouseup", endInteraction);
                document.addEventListener("touchmove", duringInteraction, { passive: false });
                document.addEventListener("touchend", endInteraction);
                event.preventDefault(); // Prevent default browser actions like text selection
            };

            const duringInteraction = (event) => {
                const evt = event.touches ? event.touches[0] : event;
                if (!currentInteractionType) return;

                event.preventDefault(); // Prevent scrolling on touch devices during drag/resize/paint

                if (currentInteractionType === 'resize') {
                    this.updateCropResize(evt);
                } else if (currentInteractionType === 'drag') {
                    this.updateCropPosition(evt);
                } else if (currentInteractionType === 'paint') {
                    this.updateDrawingStroke(evt);
                }
            };

            const endInteraction = () => {
                document.removeEventListener("mousemove", duringInteraction);
                document.removeEventListener("mouseup", endInteraction);
                document.removeEventListener("touchmove", duringInteraction);
                document.removeEventListener("touchend", endInteraction);

                if (this.isDrawingActive) {
                    this.mergeDrawingIntoImage();
                }
                this.isDrawingActive = false;
                this.internalState.lastDrawingPosition = false;
                currentInteractionType = null;
            };

            frame.addEventListener("mousedown", startInteraction);
            resizer.addEventListener("mousedown", startInteraction);
            painter.addEventListener("mousedown", startInteraction);

            frame.addEventListener("touchstart", startInteraction, { passive: false });
            resizer.addEventListener("touchstart", startInteraction, { passive: false });
            painter.addEventListener("touchstart", startInteraction, { passive: false });
        }

        updateCropResize(event) {
            const frame = this.cropRegion.frameBox;
            const deltaX = event.clientX - this.cropRegion.startX;
            const deltaY = event.clientY - this.cropRegion.startY;

            const newWidth = this.cropRegion.startWidth + deltaX;
            const newHeight = this.cropRegion.startHeight + deltaY;

            frame.style.width = Math.max(20, newWidth) + 'px'; // Minimum size
            frame.style.height = Math.max(20, newHeight) + 'px';
        }

        updateCropPosition(event) {
            const frame = this.cropRegion.frameBox;
            const deltaX = event.clientX - this.cropRegion.startX;
            const deltaY = event.clientY - this.cropRegion.startY;

            frame.style.left = (this.cropRegion.startLeft + deltaX) + 'px';
            frame.style.top = (this.cropRegion.startTop + deltaY) + 'px';
        }

        updateDrawingStroke(event) {
            if (!this.isDrawingActive) return;

            const rect = this.drawingCanvas.getBoundingClientRect();
            const currentX = event.clientX - rect.left;
            const currentY = event.clientY - rect.top;

            if (this.internalState.lastDrawingPosition) {
                this.drawingContext.beginPath();
                this.drawingContext.moveTo(this.internalState.lastDrawingPosition.x, this.internalState.lastDrawingPosition.y);
                this.drawingContext.lineTo(currentX, currentY);
                this.drawingContext.stroke();
            }
            this.internalState.lastDrawingPosition = { x: currentX, y: currentY };
        }

        mergeDrawingIntoImage() {
            if (!this.currentImageObject) return;

            const tempCanvas = document.createElement('canvas');
            const tempContext = tempCanvas.getContext('2d');
            tempCanvas.width = this.displayCanvas.width;
            tempCanvas.height = this.displayCanvas.height;

            // Draw current image first
            tempContext.drawImage(this.currentImageObject, 0, 0, tempCanvas.width, tempCanvas.height);
            // Then draw the drawing overlay on top
            tempContext.drawImage(this.drawingCanvas, 0, 0, tempCanvas.width, tempCanvas.height);

            // Update the main image and clear the drawing canvas
            this.processImageSource(tempCanvas.toDataURL("image/png"));
            this.drawingContext.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
        }

        // --- Internal Helper Functions (renamed from original) ---

        loadImageFromFiles(fileList) {
            if (!fileList || !fileList.length) return;
            const file = fileList[0];
            if (!this.sourceFileName) {
                this.sourceFileName = file.name;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                this.processImageSource(e.target.result, null, false);
            };
            reader.readAsDataURL(file);
        }

        performRotationTransform(degrees) {
            if (!this.currentImageObject) return;

            const tempCanvas = document.createElement('canvas');
            const tempContext = tempCanvas.getContext('2d');

            const imgWidth = this.currentImageObject.width;
            const imgHeight = this.currentImageObject.height;

            const radians = degrees * Math.PI / 180;

            // Calculate new canvas dimensions after rotation
            if (degrees === 90 || degrees === -90 || degrees === 270 || degrees === -270) {
                tempCanvas.width = imgHeight;
                tempCanvas.height = imgWidth;
            } else {
                tempCanvas.width = imgWidth;
                tempCanvas.height = imgHeight;
            }

            tempContext.translate(tempCanvas.width / 2, tempCanvas.height / 2);
            tempContext.rotate(radians);
            tempContext.drawImage(this.currentImageObject, -imgWidth / 2, -imgHeight / 2);

            this.processImageSource(tempCanvas.toDataURL("image/png"));
        }

        adjustCanvasDisplay() {
            if (!this.currentImageObject) return;

            let targetWidth = this.settings.maximumWidth;
            let targetHeight = this.settings.maximumHeight === 'auto' ? this.currentImageObject.height : this.settings.maximumHeight;

            let actualWidth = this.currentImageObject.width;
            let actualHeight = this.currentImageObject.height;

            let ratio = actualWidth / actualHeight;

            if (this.settings.maintainAspectRatio) {
                if (targetWidth && actualWidth > targetWidth) {
                    actualWidth = targetWidth;
                    actualHeight = actualWidth / ratio;
                }
                if (targetHeight && actualHeight > targetHeight) {
                    actualHeight = targetHeight;
                    actualWidth = actualHeight * ratio;
                }
            } else {
                if (targetWidth) actualWidth = targetWidth;
                if (targetHeight && targetHeight !== 'auto') actualHeight = targetHeight;
            }

            this.displayCanvas.width = actualWidth;
            this.displayCanvas.height = actualHeight;
            this.renderDimensions.viewWidth = actualWidth;
            this.renderDimensions.viewHeight = actualHeight;

            // Reset crop box size and position to fit new canvas if it was active
            if (this.cropRegion.boundaryBox.classList.contains("is-active")) {
                this.cropRegion.frameBox.style.width = `${actualWidth / 2}px`; // Default to half size
                this.cropRegion.frameBox.style.height = `${actualHeight / 2}px`;
                this.cropRegion.frameBox.style.left = `${actualWidth / 4}px`;
                this.cropRegion.frameBox.style.top = `${actualHeight / 4}px`;
            }
            this.renderCurrentImage();
        }

        renderCurrentImage() {
            if (!this.currentImageObject) {
                this.displayContext.clearRect(0, 0, this.displayCanvas.width, this.displayCanvas.height);
                return;
            }
            this.displayContext.clearRect(0, 0, this.displayCanvas.width, this.displayCanvas.height);
            this.displayContext.drawImage(this.currentImageObject, 0, 0, this.displayCanvas.width, this.displayCanvas.height);
        }

        determineCropCoordinates() {
            const frame = this.cropRegion.frameBox;
            const canvasRect = this.displayCanvas.getBoundingClientRect();
            const frameRect = frame.getBoundingClientRect();

            // Calculate positions relative to the canvas
            const left = Math.max(0, frameRect.left - canvasRect.left);
            const top = Math.max(0, frameRect.top - canvasRect.top);
            const width = Math.min(frameRect.width, canvasRect.width - left);
            const height = Math.min(frameRect.height, canvasRect.height - top);

            // Scale these coordinates to the actual image dimensions
            const scaleX = this.currentImageObject.width / this.displayCanvas.width;
            const scaleY = this.currentImageObject.height / this.displayCanvas.height;

            return {
                left: left * scaleX,
                top: top * scaleY,
                width: width * scaleX,
                height: height * scaleY
            };
        }

        setupToolbarEvents() {
            // Assuming buttons have a 'data-action' attribute
            this.toolbarControls.addEventListener('click', (event) => {
                const targetButton = event.target.closest('[data-action]');
                if (!targetButton) return;

                const action = targetButton.dataset.action;
                const stateKey = targetButton.dataset.stateKey;

                if (stateKey) {
                    this.handleControlToggle(targetButton);
                }

                switch (action) {
                    case 'load': this.triggerFileInput(); break;
                    case 'rotate-ccw': this.rotateImageCounterClockwise(); break;
                    case 'rotate-cw': this.rotateImageClockwise(); break;
                    case 'resize': this.adjustImageDimensions(); break;
                    case 'camera-open': this.startCameraCapture(); break;
                    case 'camera-close': this.stopCameraCapture(); break;
                    case 'take-photo': this.captureSnapshot(); break;
                    case 'crop-open': this.showCropOverlay(); break;
                    case 'crop-close': this.hideCropOverlay(); break;
                    case 'crop-apply': this.applyCropOperation(); break;
                    case 'pen-toggle':
                        if (targetButton.classList.contains('is-active')) {
                            this.activateDrawingTool();
                        } else {
                            this.deactivateDrawingTool();
                        }
                        break;
                    case 'message-close': this.clearFeedback(); break;
                    // Add other actions as needed
                }
            });
        }

        monitorInputState() {
            // Listen for changes on input fields that update internalState
            document.querySelectorAll('[data-state-key-input]').forEach(input => {
                input.addEventListener('change', (event) => {
                    this.updateInternalState(event.target.dataset.stateKeyInput, event.target.value);
                });
                input.addEventListener('input', (event) => { // For range inputs etc.
                    this.updateInternalState(event.target.dataset.stateKeyInput, event.target.value);
                });
            });
        }

        updateInternalState(key, value) {
            this.internalState[key] = value;
            // Additional logic if state changes need immediate UI updates
            if (key === 'drawingColor' || key === 'drawingSize') {
                if (this.drawingOverlay.classList.contains('is-active')) {
                    this.configureDrawingTool();
                }
            }
        }

        collapseAllPanels(hideToolbar = 0) {
            // This method needs to know which panels can be active.
            // For now, it will hide crop and drawing overlays.
            this.hideCropOverlay();
            this.deactivateDrawingTool();
            this.stopCameraCapture();
            if (hideToolbar === 1) {
                this.toolbarControls.classList.remove("is-active");
            }
        }

        handleFormSubmission(event) {
            event.preventDefault(); // Prevent default form submission

            if (!this.currentImageObject) {
                console.warn("No image to submit.");
                // Allow form to submit if no image is present, or prevent entirely?
                // Original code implies it might prevent submission if no image processed.
                // For now, let's just warn and prevent.
                return;
            }

            this.showProgressIndicator().delay(200).promise().done(async () => {
                const formData = new FormData(this.associatedForm);
                const imageData = this.currentImageObject.src; // Assuming currentImageObject.src is a data URL

                // Append image data to form data
                // The original implementation likely had a hidden input where the base64 string was placed.
                // Here, we'll append it directly to FormData.
                // Using a Blob is more efficient than a raw base64 string for large images.
                try {
                    const response = await fetch(imageData);
                    const blob = await response.blob();
                    formData.append('edited_image', blob, this.sourceFileName || 'edited_image.png');
                } catch (error) {
                    console.error("Error converting image data to blob:", error);
                    this.displayFeedback("Failed to prepare image for submission.", 5000);
                    this.clearFeedback();
                    return;
                }

                // Append other form fields (e.g., from original file input or custom elements)
                // This is already handled by `new FormData(this.associatedForm)` if the elements are within the form.

                // Perform the actual submission using Fetch API
                try {
                    const submitResponse = await fetch(this.associatedForm.action, {
                        method: this.associatedForm.method || 'POST',
                        body: formData
                    });

                    if (!submitResponse.ok) {
                        throw new Error(`HTTP error! status: ${submitResponse.status}`);
                    }

                    const result = await submitResponse.json(); // Assuming JSON response
                    this.settings.submissionComplete(result);
                    this.clearFeedback();

                    if (this.settings.redirectOnSubmit) {
                        window.location.href = this.settings.redirectOnSubmit;
                    }
                } catch (error) {
                    console.error("Form submission failed:", error);
                    this.displayFeedback(`Submission error: ${error.message}`, 5000);
                    this.clearFeedback();
                }
            });
        }
    }

    // Expose the class globally or via a factory function for plugin-like usage
    window.createImageEditor = function (element, options) {
        return new ImageTransformer(element, options);
    };

    // Or, if mimicking jQuery plugin style where it's attached to jQuery.fn
    // This part is kept as a comment because the request was for raw JS, not jQuery plugin structure.
    /*
    if (typeof jQuery !== 'undefined') {
        jQuery.fn[editorModuleName] = function (options) {
            return this.each(function () {
                if (!jQuery.data(this, 'plugin_' + editorModuleName)) {
                    jQuery.data(this, 'plugin_' + editorModuleName, new ImageTransformer(this, options));
                }
            });
        };
    }
    */

})();