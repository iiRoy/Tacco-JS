/*
 *  Module: VisualForge
 *  Purpose: Provides client-side image manipulation and upload features
 *  Author: Alex D.
 *  License: Apache 2.0
 */

// A preceding semicolon acts as a safeguard, preventing issues if scripts are concatenated
// and the previous one lacks a terminating semicolon.
;( function ( $, currentWindow, currentDocument, notDefined ) {
    "use strict";
    // `notDefined` is employed here to guarantee its value is truly undefined,
    // protecting against potential modifications in older ECMAScript 3 environments.
    // In ES5 and later, `undefined` is no longer mutable.

    // Passing `currentWindow` as a local variable can slightly improve
    // performance by quickening resolution and aids minification,
    // especially when frequently referenced within the component.

    // Establish the initial configuration object
    var componentIdentifier = 'visualForge',
        initialSettings = {
			graphicRefreshed: function(visual){},	// Callback upon image update
			submissionHandled: function(outcome){},	// Callback post-form submission
			destinationLink: false,				// URL for redirection after form submission
			maximumWidth: 400,					// Constraint for maximum width
			maximumHeight: 'auto',				// Constraint for maximum height
			keepProportions: true,				// Maintain aspect ratio
            fallbackGraphic: false              // Default image for the component
        };

    // The core component constructor
    function Component( hostElement, customSettings ) {
        this.entryNode = hostElement;
        this.rootElement = hostElement;

        // jQuery's extend method merges properties from multiple objects into the first.
        // An empty object is typically used as the first argument to avoid modifying
        // the default settings for subsequent component instances.
        this.config = $.extend( {}, initialSettings, customSettings) ;

        this._initialConfig = initialSettings;
        this._componentID = componentIdentifier;
        // Pointer to the currently loaded image
        this._currentGraphic = false;
        // Name of the loaded image file
        this._graphicFileName = "";
        // Runtime variables (user interface synchronized data)
        this._runtimeData = {};

        /* Prepare the visual layout */
        /* display_in_production */
         this._setupLayout(); 
        /* display_in_production */

        /* hide_in_production */ /* 
        this.bootUp();
         */ /* hide_in_production */
    }

	Component.prototype = {
		bootUp: function () {
				// Implement initialization logic here.
				// Access to the DOM element and configuration is available
				// via the instance, e.g., this.rootElement and this.config.
				
				// Store a reference to this instance for use in nested functions.
				var selfRef = this;
                // Determine the type of the host element (supports "file" and custom "visualforge" types).
                var inputType = $(this.entryNode).prop("type");
                if(inputType === "file")
                    this._fileSelectionControl = $(this.entryNode);
                else {
                    // Create a hidden file input for image selection.
                    $(this.entryNode).after('<input type="file" style="display:none" accept="image/*">');
				    this._fileSelectionControl = $(this.entryNode).next("input");
                }
                // For browsers lacking advanced capabilities, revert to a standard file upload.
                if(!this.verifyPlatformCompatibility()) {
                    if(inputType !== "file") {
                        $(this.entryNode).prop("type", "file");
                        $(this._fileSelectionControl).remove();
                    }
                    $(this.entryNode).show();
                    $(this.rootElement).remove();
                    return;
                }
				// Obtain reference to the primary drawing surface element.
				this._drawingSurface = $(this.rootElement).find(".picedit_canvas > canvas")[0];
				// Initialize the 2D rendering context for the canvas.
				this._drawingContext = this._drawingSurface.getContext("2d");
				// Reference to the video display container.
				this._videoCaptureContainer = $(this.rootElement).find(".picedit_video");
				// Reference to the drawing tool element.
				this._drawingTool = $(this.rootElement).find(".picedit_painter");
				this._drawingToolSurface = this._drawingTool.children("canvas")[0];
				this._drawingToolContext = this._drawingToolSurface.getContext("2d");
				this._isDrawingActive = false;
				// Keep a reference to the notification display panel.
		 		this._notificationPanel = $(this.rootElement).find(".picedit_message");
		 		this._messageTimer = false;
				// Reference to the main control buttons container.
				this._mainControls = $(this.rootElement).find(".picedit_action_btns");
				// Dimensions of the area where the image is displayed (after resizing).
				 this._displayArea = {
					"width": 0,
					"height": 0
				 };
				 // All variables pertaining to the cropping functionality.
				 this._cropManager = {
					 isMoving: false,
					 isScaling: false,
					 offsetX: 0,
					 offsetY: 0,
					 currentWidth: 0,
					 currentHeight: 0,
					 cropBoundary: $(this.rootElement).find(".picedit_drag_resize"),
					 cropFrameElement: $(this.rootElement).find(".picedit_drag_resize_box")
				 };
				 function constructImageFromFile(filesInput) {
					if(!filesInput || !filesInput.length) return;
					var selectedFile = filesInput[0];
					if(!selfRef._graphicFileName) {
						selfRef._graphicFileName = selectedFile.name;
					}
					var fileReader = new FileReader();
					fileReader.onload = function(event) { 
						selfRef._generateGraphicFromSource(event.target.result, false, selectedFile); 
					};
					fileReader.readAsDataURL(selectedFile);
				 }
				// Attach drag-and-drop behavior for file uploads.
				$(this.rootElement).find(".picedit_canvas_box").on("drop", function(event) {
					event.preventDefault();
					$(this).removeClass('dragging');
					var droppedFiles = (event.dataTransfer || event.originalEvent.dataTransfer).files;
					constructImageFromFile(droppedFiles);
				}).on("dragover", function(event) {
					event.preventDefault();
					$(this).addClass('dragging');
				}).on("dragleave", function(event) {
					event.preventDefault();
					$(this).removeClass('dragging');
				});
				// Bind the change event to the file input to process selected images.
				$(this._fileSelectionControl).on("change", function() {
					constructImageFromFile(this.files);
				});
				// For browsers lacking Clipboard API support (e.g., Firefox), create a temporary DIV for pasted images.
				if (!currentWindow.Clipboard) { // Firefox specific handling
					var pasteBufferElement = $(currentDocument.createElement("div"));
					pasteBufferElement.prop("contenteditable","true").css({
						"position" : "absolute", 
						"left" : -999,
						"width" : 0,
						"height" : 0,
						"overflow" : "hidden",
						"outline" : 0,
						"opacity" : 0
					});
					$(currentDocument.body).prepend(pasteBufferElement);
				}
				// Bind the paste event to capture images from the clipboard.
				$(currentDocument).on("paste", function(event) {
					var clipboardItems = (event.clipboardData  || event.originalEvent.clipboardData).items;
					var imageBlob;
					if(!clipboardItems) {
						pasteBufferElement.get(0).focus();
                        pasteBufferElement.on('DOMSubtreeModified', function(){
                            var childElement = pasteBufferElement.children().last().get(0);
							pasteBufferElement.html("");
							if (childElement) {
								if (childElement.tagName === "IMG" && childElement.src.substring(0, 5) === 'data:') {
									selfRef._generateGraphicFromSource(childElement.src);
								}
                                else if (childElement.tagName === "IMG" && childElement.src.substring(0, 4) === 'http') {
									selfRef._generateGraphicFromSource(childElement.src, false, false, true);
								}
							}
                        });
					}
					else {
						for (var i = 0; i < clipboardItems.length; i++) {
						  if (clipboardItems[i].type.indexOf("image") === 0) {
							imageBlob = clipboardItems[i].getAsFile();
						  }
						}
						if(imageBlob) {
						  var fileReader = new FileReader();
						  fileReader.onload = function(event) { selfRef._generateGraphicFromSource(event.target.result); };
						  fileReader.readAsDataURL(imageBlob);
						}
					}
				});
				// Initialize form data container.
				this._formDataInstance = false;
				this._parentForm = $(this.entryNode).parents("form");
                // Attach form submission event handler.
				if(this._parentForm.length) {
					this._parentForm.on("submit", function(){ return selfRef._handleFormSubmission(); });
				}
				// Invoke helper functions for setup.
				this._attachControlHandlers();
				this._linkInputData();
				this._activateSelectionManipulation();
				// Assign default values to interface variables.
				this._runtimeData.brushColor = "black";
				this._runtimeData.brushSize = false;
				this._runtimeData.lastPosition = false;
                // Load a default image if specified in the configuration.
                if(this.config.fallbackGraphic) selfRef.setDefaultVisual(this.config.fallbackGraphic);
		},
        // Verify browser capabilities (determines if the visual forge should run or if a standard file input is used).
        verifyPlatformCompatibility: function () {
            if(!!currentWindow.CanvasRenderingContext2D === false) return false; // Check for Canvas API support.
            if(!currentWindow.FileReader) return false; // Check for FileReader API support.
            return true;    // Otherwise, all necessary capabilities are present.
        },
        // Set the default displayed image.
        setDefaultVisual: function (sourcePath) {
            this._generateGraphicFromSource(sourcePath, false, false, true);
        },
		// Clear all notification text and hide the message panel.
		concealNotification: function () {
			var panelRef = this._notificationPanel;
			panelRef.removeClass("active no_close_button");
			setTimeout(function() {panelRef.children("div").html("")}, 200);
		},
		// Display a loading or "working" spinner notification.
		displaySpinner: function (statusText) {
			if(statusText && statusText === 1) {
				return this.showNotification("Working...", false, false);
			}
			else return this.showNotification("Please Wait...", false, false);
		},
		// Show a message panel alert with specified text, optional auto-dismiss, and close button.
		showNotification: function (textMessage, autoDismiss, dismissButton) {
			autoDismiss = typeof autoDismiss !== 'undefined' ? autoDismiss : 3000;
			dismissButton = typeof dismissButton !== 'undefined' ? dismissButton : true;
			var styleClasses = "active";
			if(!dismissButton) styleClasses += " no_close_button";
			if(autoDismiss) {
				clearTimeout(this._messageTimer);
				var selfRef = this;
				this._messageTimer = setTimeout(function(){ selfRef.concealNotification(); }, autoDismiss);
			}
			return this._notificationPanel.addClass(styleClasses).children("div").html(textMessage);
		},
		// Toggle a control button's active state and update associated variables.
		activateControl: function (controlElement) {
			if($(controlElement).hasClass("active")) {
				var isActive = false;
				$(controlElement).removeClass("active");
			}
			else {
				var isActive = true;
				$(controlElement).siblings().removeClass("active");
				$(controlElement).addClass("active");
			}
			var dataKey = $(controlElement).data("variable");
			if(dataKey) {
				var overrideValue = $(controlElement).data("value");
				if(!overrideValue) overrideValue = $(controlElement).val();
				if(overrideValue && isActive) isActive = overrideValue;
				this._setVariable(dataKey, isActive);
			}
			if(this._runtimeData.brushColor && this._runtimeData.brushSize) this.openBrushTool();
			else this.closeBrushTool();
		},
		// Initiate image loading when the upload button is clicked.
		loadGraphic: function () {
			this._fileSelectionControl.click();
		},
		// Activate the brush drawing tool.
		openBrushTool: function () {
			if(!this._currentGraphic) return this._hideAllNav(1); // Hide navigation if no image.
			this.configureBrushSettings();
			this._drawingTool.addClass("active");
			this._hideAllNav();
		},
		// Configure the brush tool's canvas and context properties.
		configureBrushSettings: function () {
			this._drawingToolSurface.width = 0;
			this._drawingToolSurface.width = this._drawingSurface.width;
			this._drawingToolSurface.height = this._drawingSurface.height;
			this._drawingToolContext.lineJoin = "round";
			this._drawingToolContext.lineCap = "round";
			this._drawingToolContext.strokeStyle = this._runtimeData.brushColor;
      		this._drawingToolContext.lineWidth = this._runtimeData.brushSize;
		},
		// Deactivate the brush drawing tool.
		closeBrushTool: function () {
			this._drawingTool.removeClass("active");
		},
		// Rotate the image 90 degrees counter-clockwise.
		turnLeft: function () {
			if(!this._currentGraphic) return this._hideAllNav(1); // Hide navigation if no image.
			var selfRef = this;
			// Execute task with a loading spinner, as it might be time-consuming.
			this.displaySpinner(1).delay(200).promise().done(function() {
				selfRef._performRotation(-90);
				selfRef._adjustDisplayBounds();
				// Dismiss the loading spinner.
				selfRef.concealNotification();
			});
			// Conceal all open navigation elements.
			this._hideAllNav();
		},
		// Rotate the image 90 degrees clockwise.
		turnRight: function () {
			if(!this._currentGraphic) return this._hideAllNav(1); // Hide navigation if no image.
			var selfRef = this;
			// Execute task with a loading spinner, as it might be time-consuming.
			this.displaySpinner(1).delay(200).promise().done(function() {
				selfRef._performRotation(90);
				selfRef._adjustDisplayBounds();
				// Dismiss the loading spinner.
				selfRef.concealNotification();
			});
			// Conceal all open navigation elements.
			this._hideAllNav();
		},
		// Resize the current image.
		rescaleGraphic: function () {
			if(!this._currentGraphic) return this._hideAllNav(1); // Hide navigation if no image.
			var selfRef = this;
			this.displaySpinner(1).delay(200).promise().done(function() {
				// Begin image resizing operation.
				var tempCanvas = currentDocument.createElement('canvas');
				var tempContext = tempCanvas.getContext("2d");
				tempCanvas.width = selfRef._runtimeData.targetWidth;
				tempCanvas.height = selfRef._runtimeData.targetHeight;
				tempContext.drawImage(selfRef._currentGraphic, 0, 0, tempCanvas.width, tempCanvas.height);
				selfRef._generateGraphicFromSource(tempCanvas.toDataURL("image/png"), function() {
					selfRef.concealNotification();
				});
			});
			this._hideAllNav();
		},
		// Open the video element and start capturing from the camera.
		launchCamera: function() {
			var mediaAccessFunction;
			var browserMediaSupport = navigator.webkitGetUserMedia	||	// WebKit browsers
									 navigator.mozGetUserMedia	||	// Mozilla Firefox
									 navigator.getUserMedia;			// Standard (2013+)
			if (!browserMediaSupport) return this.showNotification("Sorry, your browser doesn't support WebRTC!");
			var selfRef = this;
			mediaAccessFunction = browserMediaSupport.bind(navigator);
			mediaAccessFunction({
					audio: false,
					video: true
				},
				function(mediaStream) {
					var liveVideoFeed = selfRef._videoCaptureContainer.find("video")[0];
					liveVideoFeed.src = URL.createObjectURL(mediaStream);
					// Adjust display area based on video dimensions.
					liveVideoFeed.onloadedmetadata = function() {
						if(liveVideoFeed.videoWidth && liveVideoFeed.videoHeight) {
							if(!selfRef._currentGraphic) selfRef._currentGraphic = {};
							selfRef._currentGraphic.width = liveVideoFeed.videoWidth;
							selfRef._currentGraphic.height = liveVideoFeed.videoHeight;
							selfRef._adjustDisplayBounds();
						}
					};
					selfRef._videoCaptureContainer.addClass("active");
				},
				function(errorObject) {
					return selfRef.showNotification("No video source detected! Please allow camera access!");
				}
			);
		},
		// Close the video capture interface.
		shutCamera: function() {
			this._videoCaptureContainer.removeClass("active");
		},
		// Capture a still image from the live video feed.
		captureSnapshot: function() {
			var selfRef = this;
			var liveVideoElement = this._videoCaptureContainer.find("video")[0];
			var tempCanvas = currentDocument.createElement('canvas');
			var tempContext = tempCanvas.getContext("2d");
			tempCanvas.width = liveVideoElement.clientWidth;
			tempCanvas.height = liveVideoElement.clientHeight;
			tempContext.drawImage(liveVideoElement, 0, 0, tempCanvas.width, tempCanvas.height);
			this._generateGraphicFromSource(tempCanvas.toDataURL("image/png"), function() {
				selfRef._videoCaptureContainer.removeClass("active");
			});
		},
		// Crop the current image based on the selection.
		trimGraphic: function() {
			var cropDimensions = this._determineCropArea();
			var selfRef = this;
			this.displaySpinner(1).delay(200).promise().done(function() {
				var tempCanvas = currentDocument.createElement('canvas');
				var tempContext = tempCanvas.getContext("2d");
				tempCanvas.width = cropDimensions.width;
				tempCanvas.height = cropDimensions.height;
				tempContext.drawImage(selfRef._currentGraphic, cropDimensions.left, cropDimensions.top, cropDimensions.width, cropDimensions.height, 0, 0, cropDimensions.width, cropDimensions.height);
				selfRef._generateGraphicFromSource(tempCanvas.toDataURL("image/png"), function() {
					selfRef.concealNotification();
				});
			});
			this.closeTrimTool();
		},
		// Open the cropping tool interface.
		openTrimTool: function () {
			if(!this._currentGraphic) return this._hideAllNav(1); // Hide navigation if no image.
			this._cropManager.cropBoundary.addClass("active");
			this._hideAllNav();
		},
		// Close the cropping tool interface.
		closeTrimTool: function () {
			this._cropManager.cropBoundary.removeClass("active");
		},
		// Create or update the image from a data source.
		_generateGraphicFromSource: function(sourceData, completionCallback, inputSourceFile, isDataUrl) {
			var selfRef = this;
			var loadedGraphic = currentDocument.createElement("img");
            if(isDataUrl) loadedGraphic.setAttribute('crossOrigin', 'anonymous');
			if(inputSourceFile) loadedGraphic.file = inputSourceFile;
			loadedGraphic.src = sourceData;
			loadedGraphic.onload = function() {
				if(isDataUrl) {
                    var tempCanvas = currentDocument.createElement('canvas');
                    var tempContext = tempCanvas.getContext('2d');
                    tempCanvas.width = loadedGraphic.width;
                    tempCanvas.height = loadedGraphic.height;
                    tempContext.drawImage(loadedGraphic, 0, 0);
                    loadedGraphic.src = tempCanvas.toDataURL('image/png');
                }
                selfRef._currentGraphic = loadedGraphic;
				selfRef._adjustDisplayBounds();
				selfRef._renderToSurface();
				selfRef.config.graphicRefreshed(selfRef._currentGraphic);
				selfRef._mainControls.removeClass("active");
				if(completionCallback && typeof(completionCallback) === "function") completionCallback();
			};
		},
		// Functions to manage cropping box manipulation (dragging & resizing).
		_attachSelectionHandlers: function() {
			var selfRef = this;
			var interactionBox = this._cropManager.cropFrameElement;
			var drawingInterface = this._drawingTool;
			var resizeHandle = this._cropManager.cropBoundary.find(".picedit_drag_resize_box_corner_wrap");
			$(currentWindow).on("mousedown touchstart", function(event) {
				var eventPosition = (event.clientX) ? event : event.originalEvent.touches[0];
				selfRef._cropManager.startX = eventPosition.clientX;
   				selfRef._cropManager.startY = eventPosition.clientY;
				selfRef._cropManager.initialWidth = interactionBox[0].clientWidth;
   				selfRef._cropManager.initialHeight = interactionBox[0].clientHeight;
				interactionBox.on("mousemove touchmove", function(moveEvent) {
					moveEvent.stopPropagation();
        			moveEvent.preventDefault();
					selfRef._cropManager.isMoving = true;
					if(!selfRef._cropManager.isScaling) selfRef._moveSelectionBox(moveEvent);
				});
				resizeHandle.on("mousemove touchmove", function(moveEvent) {
					moveEvent.stopPropagation();
        			moveEvent.preventDefault();
					selfRef._cropManager.isScaling = true;
					selfRef._scaleSelectionBox(moveEvent);
				});
				drawingInterface.on("mousemove touchmove", function(moveEvent) {
					moveEvent.stopPropagation();
        			moveEvent.preventDefault();
					selfRef._isDrawingActive = true;
					selfRef._brushStrokeMovement(moveEvent);
				});
			}).on("mouseup touchend", function() {
				if (selfRef._isDrawingActive) {
					selfRef._mergeBrushStrokes();
				}
				selfRef._cropManager.isMoving = false;
				selfRef._cropManager.isScaling = false;
				selfRef._isDrawingActive = false;
				selfRef._runtimeData.lastPosition = false;
				interactionBox.off("mousemove touchmove");
				resizeHandle.off("mousemove touchmove");
				drawingInterface.off("mousemove touchmove");
			});
		},
		_scaleSelectionBox: function(event) {
			var selectionFrame = this._cropManager.cropFrameElement[0];
			var eventPosition = (event.clientX) ? event : event.originalEvent.touches[0];
			selectionFrame.style.width = (this._cropManager.initialWidth + eventPosition.clientX - this._cropManager.startX) + 'px';
   			selectionFrame.style.height = (this._cropManager.initialHeight + eventPosition.clientY - this._cropManager.startY) + 'px';
		},
		_moveSelectionBox: function(event) {
			var selectionFrame = this._cropManager.cropFrameElement[0];
			var eventPosition = (event.pageX) ? event : event.originalEvent.touches[0];
			this._cropManager.cropFrameElement.offset({
				top: eventPosition.pageY - parseInt(selectionFrame.clientHeight / 2, 10),
				left: eventPosition.pageX - parseInt(selectionFrame.clientWidth / 2, 10)
			});
		},
		_brushStrokeMovement: function(event) {
			var coords = {};
			var eventTarget = event.target || event.srcElement,
			targetBounds = eventTarget.getBoundingClientRect(),
			eventPosition = (event.clientX) ? event : event.originalEvent.touches[0];
			coords.x = eventPosition.clientX - targetBounds.left;