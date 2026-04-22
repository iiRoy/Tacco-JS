/*******************************************************************************************************************
 *
 *  Project: PicEdit
 *  Description: This robust JavaScript plugin facilitates the creation of an interactive image upload box,
 *               providing users with a suite of front-end image editing tools prior to server upload.
 *  Author: Andy V. - An experienced developer in web technologies.
 *  License: MIT - This software is freely distributable under the terms of the MIT license.
 *
 *******************************************************************************************************************/

// The preceding semi-colon acts as a defensive measure. It protects against situations where
// other concatenated scripts or plugin files might not have been properly terminated,
// preventing potential parsing errors.
;( function ( $, window, document, undefined ) {


    // Enforce strict mode for cleaner code and to catch common coding errors.
    "use strict";


    // The 'undefined' parameter is deliberately passed in. In ECMAScript 3, the global 'undefined'
    // variable was mutable and could potentially be reassigned by other code. By providing it
    // as a local parameter, we guarantee its true undefined value within this scope.
    // In modern ES5+, 'undefined' is no longer modifiable, but this pattern remains a good practice.


    // 'window' is also passed as a local variable. This approach slightly improves
    // variable resolution speed and can lead to more efficient minification,
    // particularly when 'window' is frequently referenced within the plugin's code.


    // Define the default parameters object for the plugin.
    var pluginName = 'picEdit',

        defaults = {

            imageUpdated: function(img){},	// Callback function triggered after an image has been successfully updated.

            formSubmitted: function(res){},	// Callback function executed once the form containing the plugin is submitted.

            redirectUrl: false,				// Optional URL to redirect to after a successful form submission. If false, no redirect occurs.

            maxWidth: 400,					// Sets the maximum allowable width for the processed image.

            maxHeight: 'auto',				// Sets the maximum allowable height for the processed image. 'auto' maintains aspect ratio.

            aspectRatio: true,				// Boolean flag to preserve the image's aspect ratio during resizing.

            defaultImage: false             // Specifies a default image path to be loaded when the plugin initializes.

        };



    // The primary constructor function for the plugin.
    function Plugin( element, options ) {


        // Store a direct reference to the original input element.
        this.inputelement = element;

        // Store a reference to the main plugin element.
        this.element = element;


        // jQuery's `extend` method is used here to merge objects.
        // We start with an empty object `{}`, then merge `defaults`,
        // and finally `options`. This ensures that the original `defaults`
        // object remains untouched for future plugin instances.
        this.options = $.extend( {}, defaults, options) ;



        // Keep a copy of the default options for internal reference.
        this._defaults = defaults;

        // Store the plugin's name.
        this._name = pluginName;

        // Internal reference to the currently loaded image object.
        this._image = false;

        // Stores the filename of the currently loaded image.
        this._filename = "";

        // An object to hold various UI-synced variables and states.
        this._variables = {};


        /* Prepare the core template for the plugin's UI. */
        /*unhide_in_prod*/
         this._template();
        /*unhide_in_prod*/

        /* This section is typically used for development-time initialization and is hidden in production builds. */
        /*hide_in_prod*/ /*
        this.init();
         */ /*hide_in_prod*/
    }



	Plugin.prototype = {

		/**
		 * Initializes the plugin, binding events and setting up initial states.
		 * This method contains all the setup logic required for the plugin to function.
		 */
		init: function () {

				// Place all core initialization logic within this method.
				// Access to the DOM element is available via 'this.element'.
				// Plugin options are accessible via 'this.options'.

				// Create a self-reference for use in nested functions/closures.
				var _this = this;

                // Determine the type of the element being used. Supported types are "file" and "picedit".
                var type = $(this.inputelement).prop("type");

                // If the element is already a file input, use it directly.
                if(type == "file") {
                    this._fileinput = $(this.inputelement);
                }
                else {
                    // Otherwise, create a hidden file input element and link to it.
                    $(this.inputelement).after('<input type="file" style="display:none" accept="image/*">');
				    this._fileinput = $(this.inputelement).next("input");
                }

                // Check for browser compatibility (Canvas and FileReader support).
                // If the browser lacks necessary capabilities, revert to a standard file upload.
                if(!this.check_browser_capabilities()) {
                    if(type != "file") {
                        // If it wasn't originally a file input, change its type.
                        $(this.inputelement).prop("type", "file");
                        // Remove the dynamically created file input.
                        $(this._fileinput).remove();
                    }
                    // Show the original input element and remove the plugin's wrapper.
                    $(this.inputelement).show();
                    $(this.element).remove();
                    return; // Exit initialization.
                }

				// Get a reference to the main canvas element used for image display.
				this._canvas = $(this.element).find(".picedit_canvas > canvas")[0];

				// Obtain and set the 2D rendering context for the canvas.
				this._ctx = this._canvas.getContext("2d");

				// Reference to the video element holder, used for camera input.
				this._videobox = $(this.element).find(".picedit_video");

				// Reference to the painter element for drawing functionalities.
				this._painter = $(this.element).find(".picedit_painter");

				// The canvas within the painter element.
				this._painter_canvas = this._painter.children("canvas")[0];

				// The 2D rendering context for the painter canvas.
				this._painter_ctx = this._painter_canvas.getContext("2d");

				// Flag to track if painting is currently active.
				this._painter_painting = false;

				// Store a reference to the messaging box for user notifications.
		 		this._messagebox = $(this.element).find(".picedit_message");

		 		// Timeout ID for message box auto-hiding.
		 		this._messagetimeout = false;

				// Reference to the main navigation buttons container.
				this._mainbuttons = $(this.element).find(".picedit_action_btns");

				// Object to store the dimensions of the viewport where the image is displayed.
				// This determines the resized image's visible area.
				 this._viewport = {
					"width": 0,
					"height": 0
				 };

				 // Object encapsulating all variables and elements related to the cropping functionality.
				 this._cropping = {
					 is_dragging: false, // Flag indicating if the crop box is being dragged.
					 is_resizing: false, // Flag indicating if the crop box is being resized.
					 left: 0,            // X-coordinate of the crop box.
					 top: 0,             // Y-coordinate of the crop box.
					 width: 0,           // Width of the crop box.
					 height: 0,          // Height of the crop box.
					 cropbox: $(this.element).find(".picedit_drag_resize"),      // The main crop box container.
					 cropframe: $(this.element).find(".picedit_drag_resize_box") // The draggable/resizable frame.
				 };

				 // Helper function to build an image from a FileList object (e.g., from drag-n-drop or file input).
				 function build_img_from_file(files) {

					if(!files || !files.length) return; // Ensure files exist.

					var file = files[0]; // Get the first file.

					if(!_this._filename) {
						_this._filename = file.name; // Store the filename if not already set.
					}

					var reader = new FileReader(); // Create a new FileReader instance.

					// Define the onload event handler for the FileReader.
					reader.onload = function(e) {
						// Create the image using the data URL result.
						_this._create_image_with_datasrc(e.target.result, false, file);
					};

					reader.readAsDataURL(file); // Read the file content as a Data URL.
				 }

				// Bind drag-n-drop events to the canvas box.
				$(this.element).find(".picedit_canvas_box")
				    .on("drop", function(event) {
					    event.preventDefault();
					    $(this).removeClass('dragging'); // Remove dragging visual cue.
					    var files = (event.dataTransfer || event.originalEvent.dataTransfer).files; // Get dropped files.
					    build_img_from_file(files); // Process the dropped files.
				    })
				    .on("dragover", function(event) {
					    event.preventDefault(); // Prevent default browser behavior (e.g., opening file).
					    $(this).addClass('dragging'); // Add dragging visual cue.
				    })
				    .on("dragleave", function(event) {
					    event.preventDefault();
					    $(this).removeClass('dragging'); // Remove dragging visual cue.
				    });

				// Bind the 'change' event to the hidden file input.
				$(this._fileinput).on("change", function() {
					build_img_from_file(this.files); // Process selected files.
				});

				// Special handling for Firefox, which doesn't natively support the clipboardData object for images.
				if (!window.Clipboard) { // Check for Clipboard API support.
					var pasteCatcher = $(document.createElement("div")); // Create a hidden div.
					pasteCatcher.prop("contenteditable","true").css({
						"position" : "absolute",
						"left" : -999,
						"width" : 0,
						"height" : 0,
						"overflow" : "hidden",
						"outline" : 0,
						"opacity" : 0
					});
					$(document.body).prepend(pasteCatcher); // Add it to the document body.
				}

				// Bind the 'paste' event to the document to capture clipboard images.
				$(document).on("paste", function(event) {

					var items = (event.clipboardData  || event.originalEvent.clipboardData).items;
					var blob;

					if(!items) {
						// Fallback for browsers without direct clipboardData access (e.g., Firefox).
						pasteCatcher.get(0).focus(); // Focus the hidden contenteditable div.
                        pasteCatcher.on('DOMSubtreeModified', function(){
                            var child = pasteCatcher.children().last().get(0); // Get the last pasted child.
							pasteCatcher.html(""); // Clear the catcher div.

							if (child) {
								if (child.tagName === "IMG" && child.src.substr(0, 5) == 'data:') {
									// If it's a data URL image.
									_this._create_image_with_datasrc(child.src);
								}
                                else if (child.tagName === "IMG" && child.src.substr(0, 4) == 'http') {
									// If it's an external image URL.
									_this._create_image_with_datasrc(child.src, false, false, true);
								}
							}
                        });
					}
					else {
						// For browsers that support clipboardData (e.g., Chrome).
						for (var i = 0; i < items.length; i++) {
						  if (items[i].type.indexOf("image") === 0) {
							blob = items[i].getAsFile(); // Extract the image blob.
						  }
						}
						if(blob) {
						  var reader = new FileReader();
						  reader.onload = function(e) { _this._create_image_with_datasrc(e.target.result); }; // Create image from blob.
						  reader.readAsDataURL(blob);
						}
					}
				});

				// Initialize a variable to hold FormData.
				this._theformdata = false;

				// Get a reference to the parent form element.
				this._theform = $(this.inputelement).parents("form");

                // Bind the form's submit event if a parent form is found.
				if(this._theform.length) {
					this._theform.on("submit", function(){ return _this._formsubmit(); });
				}

				// Call various helper functions to bind UI controls and initialize states.
				this._bindControlButtons();   // Binds event listeners to control buttons.
				this._bindInputVariables();   // Binds event listeners to input fields that control variables.
				this._bindSelectionDrag();    // Binds drag and resize functionality to selection boxes.

				// Set initial default values for internal variables.
				this._variables.pen_color = "black";
				this._variables.pen_size = false;
				this._variables.prev_pos = false;

                // If a default image path is provided in options, load it.
                if(this.options.defaultImage) {
                    _this.set_default_image(this.options.defaultImage);
                }

		},


        /**
         * Checks the browser's capabilities to ensure it supports necessary features
         * like Canvas rendering and FileReader API.
         * @returns {boolean} True if capabilities are met, false otherwise.
         */
        check_browser_capabilities: function () {

            // Check for Canvas 2D rendering context support.
            if(!!window.CanvasRenderingContext2D == false) {
                return false;
            }

            // Check for FileReader API support.
            if(!window.FileReader) {
                return false;
            }

            // If all checks pass, the browser is capable.
            return true;
        },


        /**
         * Sets a default image for the plugin to display based on a provided path.
         * @param {string} path - The URL or Data URL of the image to set as default.
         */
        set_default_image: function (path) {

            // Use the internal image creation function, marking it as a data URL if applicable.
            this._create_image_with_datasrc(path, false, false, true);
        },


		/**
		 * Hides the message box and clears its content.
		 */
		hide_messagebox: function () {

			var msgbox = this._messagebox;

			// Remove active and no_close_button classes.
			msgbox.removeClass("active no_close_button");

			// Clear the message content after a short delay for smooth transition.
			setTimeout(function() {
                msgbox.children("div").html("");
            }, 200);
		},


		/**
		 * Displays a loading spinner message to the user.
		 * @param {number} message - If 1, displays "Working...", otherwise "Please Wait...".
		 * @returns {object} The jQuery object of the message box.
		 */
		set_loading: function (message) {

			if(message && message == 1) {
				return this.set_messagebox("Working...", false, false);
			}
			else {
                return this.set_messagebox("Please Wait...", false, false);
            }
		},


		/**
		 * Displays a custom message in the message box, with optional autohide and close button.
		 * @param {string} text - The message text to display.
		 * @param {number|boolean} [autohide=3000] - Duration in ms to autohide, or false to keep open indefinitely.
		 * @param {boolean} [closebutton=true] - Whether to display a close button.
		 * @returns {object} The jQuery object of the message box.
		 */
		set_messagebox: function (text, autohide, closebutton) {

			// Set default values for optional parameters.
			autohide = typeof autohide !== 'undefined' ? autohide : 3000;
			closebutton = typeof closebutton !== 'undefined' ? closebutton : true;

			var classes = "active"; // Always start with 'active' class.

			if(!closebutton) {
                classes += " no_close_button"; // Add class if no close button is desired.
            }

			if(autohide) {
				clearTimeout(this._messagetimeout); // Clear any existing autohide timeout.
				var _this = this;
				// Set a new timeout to hide the message box.
				this._messagetimeout = setTimeout(function(){
                    _this.hide_messagebox();
                }, autohide);
			}

			// Add classes to the message box and set its HTML content.
			return this._messagebox.addClass(classes).children("div").html(text);
		},


		/**
		 * Toggles the active state of a button and updates associated variables.
		 * @param {HTMLElement} elem - The button element to toggle.
		 */
		toggle_button: function (elem) {

			var value; // Declare value variable.

			if($(elem).hasClass("active")) {
				value = false;
				$(elem).removeClass("active");
			}
			else {
				value = true;
				$(elem).siblings().removeClass("active"); // Deactivate sibling buttons.
				$(elem).addClass("active");              // Activate the current button.
			}

			var variable = $(elem).data("variable"); // Get the data-variable attribute.

			if(variable) {
				var optional_value = $(elem).data("value"); // Get the data-value attribute.
				if(!optional_value) {
                    optional_value = $(elem).val(); // Fallback to element's value.
                }
				if(optional_value && value) {
                    value = optional_value; // Use optional value if available and button is active.
                }
				this._setVariable(variable, value); // Update the internal variable.
			}

			// If pen color and size are set, open the pen tool; otherwise, close it.
			if(this._variables.pen_color && this._variables.pen_size) {
                this.pen_tool_open();
            }
			else {
                this.pen_tool_close();
            }
		},


		/**
		 * Simulates a click on the hidden file input to open the file selection dialog.
		 */
		load_image: function () {
			this._fileinput.click();
		},


		/**
		 * Activates the pen tool, allowing the user to draw on the image.
		 */
		pen_tool_open: function () {
			// If no image is loaded, hide all navigation and exit.
			if(!this._image) {
                return this._hideAllNav(1);
            }

			this.pen_tool_params_set(); // Set up painter canvas parameters.
			this._painter.addClass("active"); // Show the painter canvas.
			this._hideAllNav();               // Hide other navigation elements.
		},


		/**
		 * Sets the canvas dimensions and drawing styles for the pen tool.
		 */
		pen_tool_params_set: function () {

			// Reset canvas width to clear it, then set to match main canvas.
			this._painter_canvas.width = 0;
			this._painter_canvas.width = this._canvas.width;
			this._painter_canvas.height = this._canvas.height;

			// Configure the drawing context.
			this._painter_ctx.lineJoin = "round";
			this._painter_ctx.lineCap = "round";
			this._painter_ctx.strokeStyle = this._variables.pen_color; // Set pen color.
      		this._painter_ctx.lineWidth = this._variables.pen_size;     // Set pen size.
		},


		/**
		 * Deactivates and hides the pen tool.
		 */
		pen_tool_close: function () {
			this._painter.removeClass("active"); // Hide the painter canvas.
		},


		/**
		 * Rotates the current image 90 degrees counter-clockwise.
		 */
		rotate_ccw: function () {

			// If no image is loaded, hide all navigation and exit.
			if(!this._image) {
                return this._hideAllNav(1);
            }

			var _this = this; // Self-reference for closure.

			// Display a loading spinner as rotation can be time-consuming.
			this.set_loading(1).delay(200).promise().done(function() {
				_this._doRotation(-90);      // Perform the actual rotation.
				_this._resizeViewport();     // Adjust the viewport after rotation.
				_this.hide_messagebox();     // Hide the loading spinner.
			});

			this._hideAllNav(); // Hide all open navigation elements.
		},


		/**
		 * Rotates the current image 90 degrees clockwise.
		 */
		rotate_cw: function () {

			// If no image is loaded, hide all navigation and exit.
			if(!this._image) {
                return this._hideAllNav(1);
            }

			var _this = this; // Self-reference for closure.

			// Display a loading spinner as rotation can be time-consuming.
			this.set_loading(1).delay(200).promise().done(function() {
				_this._doRotation(90);       // Perform the actual rotation.
				_this._resizeViewport();     // Adjust the viewport after rotation.
				_this.hide_messagebox();     // Hide the loading spinner.
			});

			this._hideAllNav(); // Hide all open navigation elements.
		},


		/**
		 * Resizes the image to the dimensions specified in `_variables.resize_width` and `_variables.resize_height`.
		 */
		resize_image: function () {

			// If no image is loaded, hide all navigation and exit.
			if(!this._image) {
                return this._hideAllNav(1);
            }

			var _this = this; // Self-reference for closure.

			this.set_loading(1).delay(200).promise().done(function() {

				// Create a temporary canvas for resizing.
				var canvas = document.createElement('canvas');
				var ctx = canvas.getContext("2d");

				// Set canvas dimensions to the target resize dimensions.
				canvas.width = _this._variables.resize_width;
				canvas.height = _this._variables.resize_height;

				// Draw the original image onto the new canvas, scaling it.
				ctx.drawImage(_this._image, 0, 0, canvas.width, canvas.height);

				// Create a new image from the resized canvas data.
				_this._create_image_with_datasrc(canvas.toDataURL("image/png"), function() {
					_this.hide_messagebox(); // Hide loading spinner after resize.
				});
			});

			this._hideAllNav(); // Hide all open navigation elements.
		},


		/**
		 * Opens the video element and attempts to capture a live video stream from the user's camera.
		 * Displays an error message if WebRTC is not supported or camera access is denied.
		 */
		camera_open: function() {

			var getUserMedia;
			var browserUserMedia = navigator.webkitGetUserMedia	||	// WebKit (Chrome, Safari)
									 navigator.mozGetUserMedia	||	// Mozilla FireFox
									 navigator.getUserMedia;			// Standard (2013+)

			// Check if getUserMedia is supported by the browser.
			if (!browserUserMedia) {
                return this.set_messagebox("Sorry, your browser doesn't support WebRTC!");
            }

			var _this = this; // Self-reference for closure.

			getUserMedia = browserUserMedia.bind(navigator); // Bind to navigator object.

			// Request access to user's media devices.
			getUserMedia({
					audio: false, // Do not request audio.
					video: true   // Request video stream.
				},
				function(stream) {
					// Success callback: stream is available.
					var videoElement = _this._videobox.find("video")[0];
					videoElement.src = URL.createObjectURL(stream); // Set video source to the stream.

					// When video metadata is loaded, resize the viewport.
					videoElement.onloadedmetadata = function() {
						if(videoElement.videoWidth && videoElement.videoHeight) {
							if(!_this._image) _this._image = {}; // Initialize _image if not present.
							_this._image.width = videoElement.videoWidth;
							_this._image.height = videoElement.videoHeight;
							_this._resizeViewport(); // Adjust viewport to video dimensions.
						}
					};
					_this._videobox.addClass("active"); // Show the video box.
				},
				function(err) {
					// Error callback: camera access denied or no video source.
					return _this.set_messagebox("No video source detected! Please allow camera access!");
				}
			);
		},


		/**
		 * Closes and hides the camera video stream.
		 */
		camera_close: function() {
			this._videobox.removeClass("active"); // Hide the video box.
		},


		/**
		 * Captures a still photo from the live video stream and converts it into an editable image.
		 */
		take_photo: function() {

			var _this = this; // Self-reference for closure.

			var live = this._videobox.find("video")[0]; // Get the live video element.
			var canvas = document.createElement('canvas'); // Create a temporary canvas.
			var ctx = canvas.getContext("2d");

			// Set canvas dimensions to match the video feed.
			canvas.width = live.clientWidth;
			canvas.height = live.clientHeight;

			// Draw the current frame from the video onto the canvas.
			ctx.drawImage(live, 0, 0, canvas.width, canvas.height);

			// Create a new image from the canvas data and close the camera.
			this._create_image_with_datasrc(canvas.toDataURL("image/png"), function() {
				_this._videobox.removeClass("active"); // Hide the video box after photo is taken.
			});
		},


		/**
		 * Crops the current image based on the dimensions and position of the cropping box.
		 */
		crop_image: function() {

			var crop = this._calculateCropWindow(); // Get the calculated crop area.
			var _this = this; // Self-reference for closure.

			this.set_loading(1).delay(200).promise().done(function() {

				var canvas = document.createElement('canvas'); // Create a temporary canvas for cropping.
				var ctx = canvas.getContext("2d");

				// Set canvas dimensions to the crop area dimensions.
				canvas.width = crop.width;
				canvas.height = crop.height;

				// Draw the cropped portion of the original image onto the new canvas.
				ctx.drawImage(_this._image, crop.left, crop.top, crop.width, crop.height, 0, 0, crop.width, crop.height);

				// Create a new image from the cropped canvas data.
				_this._create_image_with_datasrc(canvas.toDataURL("image/png"), function() {
					_this.hide_messagebox(); // Hide loading spinner after cropping.
				});
			});

			this.crop_close(); // Close the cropping tool.
		},


		/**
		 * Opens and activates the cropping tool.
		 */
		crop_open: function () {

			// If no image is loaded, hide all navigation and exit.
			if(!this._image) {
                return this._hideAllNav(1);
            }

			this._cropping.cropbox.addClass("active"); // Show the crop box.
			this._hideAllNav();                        // Hide other navigation elements.
		},


		/**
		 * Closes and deactivates the cropping tool.
		 */
		crop_close: function () {
			this._cropping.cropbox.removeClass("active"); // Hide the crop box.
		},


		/**
		 * Creates or updates the internal image object using a provided data source.
		 * This function handles loading images from data URLs, files, or external URLs.
		 * @param {string} datasrc - The data source (Data URL or image path).
		 * @param {function} [callback] - Optional callback function to execute after the image is loaded.
		 * @param {File} [file] - Optional File object associated with the image.
		 * @param {boolean} [dataurl] - If true, treats datasrc as an external URL that needs crossOrigin handling.
		 */
		_create_image_with_datasrc: function(datasrc, callback, file, dataurl) {

			var _this = this; // Self-reference for closure.
			var img = document.createElement("img"); // Create a new image element.

            if(dataurl) {
                img.setAttribute('crossOrigin', 'anonymous'); // Set crossOrigin for external URLs.
            }

			if(file) {
                img.file = file; // Attach the file object if provided.
            }

			img.src = datasrc; // Set the image source.

			img.onload = function() {
				// Image has loaded.

				if(dataurl) {
                    // If it's an external URL, draw it to canvas to bypass potential CORS issues
                    // for subsequent toDataURL calls, then update its src to the data URL.
                    var canvas = document.createElement('canvas');
                    var ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    img.src = canvas.toDataURL('image/png');
                }

                _this._image = img; // Update the internal image reference.
				_this._resizeViewport(); // Recalculate and adjust the display viewport.
				_this._paintCanvas();    // Redraw the image on the main canvas.

				// Trigger the imageUpdated callback.
				_this.options.imageUpdated(_this._image);

				_this._mainbuttons.removeClass("active"); // Deactivate main buttons.

				// Execute the provided callback if it's a function.
				if(callback && typeof(callback) == "function") {
                    callback();
                }
			};
		},


		/**
		 * Binds mouse and touch events for dragging and resizing the selection box,
		 * and for initiating painting with the pen tool.
		 */
		_bindSelectionDrag: function() {

			var _this = this; // Self-reference.

			var eventbox = this._cropping.cropframe; // The draggable/resizable crop frame.
			var painter = this._painter;             // The painter element.
			var resizer = this._cropping.cropbox.find(".picedit_drag_resize_box_corner_wrap"); // The resize handle.

			// Bind mousedown/touchstart events to the window.
			$(window).on("mousedown touchstart", function(e) {

				// Get event position, handling both mouse and touch events.
				var evtpos = (e.clientX) ? e : e.originalEvent.touches[0];

				// Store initial coordinates and dimensions for dragging/resizing.
				_this._cropping.x = evtpos.clientX;
   				_this._cropping.y = evtpos.clientY;
				_this._cropping.w = eventbox[0].clientWidth;
   				_this._cropping.h = eventbox[0].clientHeight;

				// Bind mousemove/touchmove to the crop frame for dragging.
				eventbox.on("mousemove touchmove", function(event) {
					event.stopPropagation();
        			event.preventDefault();
					_this._cropping.is_dragging = true;
					if(!_this._cropping.is_resizing) {
                        _this._selection_drag_movement(event); // Only drag if not resizing.
                    }
				});

				// Bind mousemove/touchmove to the resizer handle for resizing.
				resizer.on("mousemove touchmove", function(event) {
					event.stopPropagation();
        			event.preventDefault();
					_this._cropping.is_resizing = true;
					_this._selection_resize_movement(event); // Perform resize movement.
				});

				// Bind mousemove/touchmove to the painter for drawing.
				painter.on("mousemove touchmove", function(event) {
					event.stopPropagation();
        			event.preventDefault();
					_this._painter_painting = true; // Set painting flag.
					_this._painter_movement(event);  // Perform painter movement.
				});

			// Bind mouseup/touchend events to the window to stop dragging/resizing/painting.
			}).on("mouseup touchend", function() {

				if (_this._painter_painting) {
					_this._painter_merge_drawing(); // Merge painter drawing to main canvas if active.
				}

				// Reset all flags and unbind event handlers.
				_this._cropping.is_dragging = false;
				_this._cropping.is_resizing = false;
				_this._painter_painting = false;
				_this._variables.prev_pos = false; // Reset previous position for drawing.

				eventbox.off("mousemove touchmove");
				resizer.off("mousemove touchmove");
				painter.off("mousemove touchmove");
			});
		},


		/**
		 * Handles the movement logic for resizing the crop selection box.
		 * @param {Event} e - The mouse or touch event.
		 */
		_selection_resize_movement: function(e) {

			var cropframe = this._cropping.cropframe[0]; // Get the DOM element of the crop frame.

			// Get event position, handling both mouse and touch events.
			var evtpos = (e.clientX) ? e : e.originalEvent.touches[0];

			// Calculate and set new width and height based on initial dimensions and current pointer position.
			cropframe.style.width = (this._cropping.w + evtpos.clientX - this._cropping.x) + 'px';
   			cropframe.style.height = (this._cropping.h + evtpos.clientY - this._cropping.y) + 'px';
		},


		/**
		 * Handles the movement logic for dragging the crop selection box.
		 * @param {Event} e - The mouse or touch event.
		 */
		_selection_drag_movement: function(e) {

			var cropframe = this._cropping.cropframe[0]; // Get the DOM element of the crop frame.

			// Get event position, handling both mouse and touch events.
			var evtpos = (e.pageX) ? e : e.originalEvent.touches[0];

			// Set the new position of the crop frame, centering it on the pointer.
			this._cropping.cropframe.offset({
				top: evtpos.pageY - parseInt(cropframe.clientHeight / 2, 10),
				left: evtpos.pageX - parseInt(cropframe.clientWidth / 2, 10)
			});
		},


		/**
		 * Handles the movement logic for the painter tool, drawing lines on the painter canvas.
		 * @param {Event} e - The mouse or touch event.
		 */
		_painter_movement: function(e) {

			var pos = {}; // Object to store calculated position.

			// Get target element and its bounding rectangle for accurate position calculation.
			var target = e.target || e.srcElement,
			rect = target.getBoundingClientRect(),
			evtpos = (e.clientX) ? e : e.originalEvent.touches[0]; // Get event position.

			// Calculate x-coordinate relative to the target element.
			pos.x = evtpos.clientX - rect.left;