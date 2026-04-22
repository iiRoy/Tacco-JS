/*
 * This is a Type I clone of the original Pannellum source code.
 * All identifiers, operators, and expressions are strictly preserved.
 * Only whitespace and comments have been altered to demonstrate a Type I clone.
 *
 * Original Copyright (c) 2011-2015 Matthew Petroff
 * Permission notice from original:
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */


'use strict'; // Enforce strict mode for better code quality and fewer silent errors.

// Global variables declaration.
// These variables hold the state and configuration of the panorama viewer.
var config, // Main configuration object for the current panorama.
    tourConfig = {}, // Configuration for a multi-panorama tour, if applicable.
    configFromURL, // Configuration parameters parsed from the URL.
    renderer, // The WebGL renderer instance.
    oldRenderer, // Holds a reference to a previous renderer if it needs to be disposed.
    preview, // Placeholder for a panorama preview image.
    container = document.getElementById('container'), // The main DOM element hosting the viewer.
    isUserInteracting = false, // Flag to track if the user is currently interacting (e.g., dragging).
    latestInteraction = Date.now(), // Timestamp of the most recent user interaction.
    onPointerDownPointerX = 0, // X-coordinate of the pointer when interaction started.
    onPointerDownPointerY = 0, // Y-coordinate of the pointer when interaction started.
    onPointerDownPointerDist = -1, // Distance between two pointers for touch gestures.
    onPointerDownYaw = 0, // Yaw angle at the start of interaction.
    onPointerDownPitch = 0, // Pitch angle at the start of interaction.
    keysDown = new Array(10), // Array to track currently pressed keyboard keys.
    fullscreenActive = false, // Indicates if the viewer is in fullscreen mode.
    loaded = false, // True if the panorama image has been successfully loaded.
    error = false, // True if an error occurred during loading or rendering.
    isTimedOut = false, // Flag for timeout events.
    listenersAdded = false, // Ensures event listeners are added only once.
    panoImage, // The actual image or video element for the panorama.
    prevTime, // Timestamp of the previous animation frame.
    yawSpeed = 0, // Current rotation speed around the Y-axis (yaw).
    pitchSpeed = 0, // Current rotation speed around the X-axis (pitch).
    zoomSpeed = 0, // Current zoom speed.
    animating = false, // Flag to indicate if an animation loop is active.
    hotspotsCreated = false; // Flag to check if hotspots have been initialized.

// Default configuration settings for the panorama viewer.
var defaultConfig = {
    hfov: 100, // Horizontal field of view in degrees.
    minHfov: 50, // Minimum horizontal field of view.
    maxHfov: 120, // Maximum horizontal field of view.
    pitch: 0, // Initial pitch angle in degrees.
    minPitch: -85, // Minimum pitch angle.
    maxPitch: 85, // Maximum pitch angle.
    yaw: 0, // Initial yaw angle in degrees.
    minYaw: -360, // Minimum yaw angle.
    maxYaw: 360, // Maximum yaw angle.
    haov: 360, // Horizontal angle of view (total panorama width).
    vaov: 180, // Vertical angle of view (total panorama height).
    vOffset: 0, // Vertical offset of the panorama.
    autoRotate: false, // Whether the panorama should auto-rotate.
    autoRotateInactivityDelay: -1, // Delay before auto-rotation starts after inactivity.
    type: 'equirectangular', // Type of panorama (e.g., 'equirectangular', 'cubemap').
    northOffset: 0, // Offset to align a specific direction as north.
    showFullscreenCtrl: true, // Display fullscreen control button.
    video: false, // Is the panorama a video?
    keyboardZoom: true // Enable keyboard zoom controls.
};

// Add a CSS class to the main container element.
container.className += ' container';


// Prepare and display "about" information on right-click context menu.
var aboutMsg = document.createElement('span');
aboutMsg.className = 'about_msg';
aboutMsg.innerHTML = '<a href="http://pannellum.org/" target="_blank">Pannellum</a>';
container.appendChild(aboutMsg);
document.addEventListener('contextmenu', onRightClick); // Attach right-click event listener.


// Create a dedicated container for the WebGL renderer.
var renderContainer = document.createElement('div');
renderContainer.className = 'render_container';
container.appendChild(renderContainer);
var dragFix = document.createElement('div'); // An element to help with drag events.
dragFix.className = 'dragfix';
container.appendChild(dragFix);


// Initialize an object to manage various display elements.
var infoDisplay = {};

// Panorama title and author information display.
infoDisplay.container = document.createElement('div');
infoDisplay.container.className = 'panorama_info';
infoDisplay.title = document.createElement('div');
infoDisplay.title.className = 'title_box';
infoDisplay.container.appendChild(infoDisplay.title);
infoDisplay.author = document.createElement('div');
infoDisplay.author.className = 'author_box';
infoDisplay.container.appendChild(infoDisplay.author);
container.appendChild(infoDisplay.container);

// Loading indicator box.
infoDisplay.load = {};
infoDisplay.load.box = document.createElement('div');
infoDisplay.load.box.className = 'load_box';
infoDisplay.load.box.innerHTML = '<p>Loading...</p>';
infoDisplay.load.lbox = document.createElement('div');
infoDisplay.load.lbox.className = 'lbox';
infoDisplay.load.lbox.innerHTML = '<div class="loading"></div>';
infoDisplay.load.box.appendChild(infoDisplay.load.lbox);
infoDisplay.load.lbar = document.createElement('div');
infoDisplay.load.lbar.className = 'lbar';
infoDisplay.load.lbarFill = document.createElement('div');
infoDisplay.load.lbarFill.className = 'lbar_fill';
infoDisplay.load.lbar.appendChild(infoDisplay.load.lbarFill);
infoDisplay.load.box.appendChild(infoDisplay.load.lbar);
infoDisplay.load.msg = document.createElement('p');
infoDisplay.load.msg.className = 'lmsg';
infoDisplay.load.box.appendChild(infoDisplay.load.msg);
container.appendChild(infoDisplay.load.box);

// Error message display area.
infoDisplay.errorMsg = document.createElement('div');
infoDisplay.errorMsg.className = 'error_msg infobox';
container.appendChild(infoDisplay.errorMsg);


// Initialize an object to manage user controls.
var controls = {};

// Manual load button (e.g., for initial user interaction).
controls.load = document.createElement('div');
controls.load.className = 'load_button';
controls.load.innerHTML = '<p>Click to<br>Load<br>Panorama<p>';
controls.load.addEventListener('click', load); // Attach click handler.
container.appendChild(controls.load);

// Zoom controls (zoom in / zoom out buttons).
controls.zoom = document.createElement('div');
controls.zoom.className = 'zoom_controls controls';
controls.zoomIn = document.createElement('div');
controls.zoomIn.className = 'zoom_in sprite control';
controls.zoomIn.addEventListener('click', zoomIn); // Zoom in on click.
controls.zoom.appendChild(controls.zoomIn);
controls.zoomOut = document.createElement('div');
controls.zoomOut.className = 'zoom_out sprite control';
controls.zoomOut.addEventListener('click', zoomOut); // Zoom out on click.
controls.zoom.appendChild(controls.zoomOut);
container.appendChild(controls.zoom);

// Fullscreen toggle button.
controls.fullscreen = document.createElement('div');
controls.fullscreen.addEventListener('click', toggleFullscreen); // Toggle fullscreen on click.
controls.fullscreen.className = 'fullscreentoggle_button sprite fullscreentoggle_button_inactive controls control';
container.appendChild(controls.fullscreen);

// Compass element for orientation.
var compass = document.createElement('div');
compass.className = 'compass controls control';
container.appendChild(compass);

// Parse URL parameters to override default settings.
parseURLParameters();

/**
 * Initializes the panorama viewer.
 * This function sets up the image loading, renderer, and event listeners.
 */
function init() {
    // Check for Internet Explorer 9 compatibility and display an error if detected.
    // This specific check targets IE9, which lacks necessary WebGL features.
    var div = document.createElement("div");
    div.innerHTML = "<!--[if lte IE 9]><i></i><![endif]-->";
    if (div.getElementsByTagName("i").length == 1) {
        anError(); // Call error handler for unsupported browser.
    }

    var i, p; // Loop counter and path variable.

    // Determine panorama image source based on configuration type.
    if (config.type == 'cubemap') {
        // For cubemap panoramas, create an array of Image objects.
        panoImage = [];
        for (i = 0; i < 6; i++) {
            panoImage.push(new Image());
            panoImage[i].crossOrigin = 'anonymous'; // Enable cross-origin loading.
        }
        infoDisplay.load.lbox.style.display = 'block'; // Show loading spinner.
        infoDisplay.load.lbar.style.display = 'none'; // Hide progress bar.
    } else if (config.type == 'multires') {
        // For multi-resolution panoramas, deep copy the configuration.
        var c = JSON.parse(JSON.stringify(config.multiRes)); // Create a deep copy.
        // Construct the base path for multi-resolution tiles.
        if (config.basePath && config.multiRes.basePath) {
            c.basePath = config.basePath + config.multiRes.basePath;
        } else if (config.basePath) {
            c.basePath = config.basePath;
        } else if (tourConfig.basePath && config.multiRes.basePath) {
            c.basePath = tourConfig.basePath + config.multiRes.basePath;
        } else if (tourConfig.basePath) {
            c.basePath = tourConfig.basePath;
        }
        panoImage = c; // The panoImage becomes the multi-res config object.
    } else {
        // For single image (equirectangular) or video panoramas.
        if (config.video === true) {
            panoImage = document.createElement('video'); // Create a video element.
            infoDisplay.load.lbox.style.display = 'block'; // Show loading spinner.
            infoDisplay.load.lbar.style.display = 'none'; // Hide progress bar.
        } else {
            panoImage = new Image(); // Create a standard image element.
        }
    }

    /**
     * Callback function executed once the panorama image (or video) is loaded.
     * Initializes the renderer and sets up event listeners.
     */
    function onImageLoad() {
        // Create a new renderer instance with the loaded image.
        renderer = new libpannellum.renderer(renderContainer, panoImage, config.type, config.video);

        // Add event listeners only if they haven't been added before.
        if (!listenersAdded) {
            listenersAdded = true;
            document.addEventListener('mousedown', onDocumentMouseDown, false);
            document.addEventListener('mousemove', onDocumentMouseMove, false);
            document.addEventListener('mouseup', onDocumentMouseUp, false);
            document.addEventListener('mousewheel', onDocumentMouseWheel, false); // Standard mouse wheel.
            document.addEventListener('DOMMouseScroll', onDocumentMouseWheel, false); // Firefox specific mouse wheel.
            document.addEventListener('onresize', onDocumentResize, false); // Custom resize event.
            document.addEventListener('mozfullscreenchange', onFullScreenChange, false); // Firefox fullscreen event.
            document.addEventListener('webkitfullscreenchange', onFullScreenChange, false); // WebKit fullscreen event.
            document.addEventListener('msfullscreenchange', onFullScreenChange, false); // IE fullscreen event.
            document.addEventListener('fullscreenchange', onFullScreenChange, false); // Standard fullscreen event.
            window.addEventListener('resize', onDocumentResize, false); // Window resize event.
            document.addEventListener('keydown', onDocumentKeyPress, false); // Keyboard key down.
            document.addEventListener('keyup', onDocumentKeyUp, false); // Keyboard key up.
            window.addEventListener('blur', clearKeys, false); // Clear keys if window loses focus.
            document.addEventListener('mouseout', onDocumentMouseUp, false); // Mouse leaves document.
            document.addEventListener('touchstart', onDocumentTouchStart, false); // Touch screen start.
            document.addEventListener('touchmove', onDocumentTouchMove, false); // Touch screen move.
            document.addEventListener('touchend', onDocumentTouchEnd, false); // Touch screen end.
        }

        renderInit(); // Initialize rendering loop.
        setTimeout(function(){isTimedOut = true;}, 500); // Set timeout flag after a delay.
    }

    /**
     * Helper function to check if a URL is absolute.
     * @param {string} url The URL to check.
     * @returns {boolean} True if the URL is absolute, false otherwise.
     */
    var absoluteURL = function(url) {
        return new RegExp('^(?:[a-z]+:)?//', 'i').test(url);
    };

    // Configure the loading process based on the panorama type.
    if (config.type == 'cubemap') {
        // Cubemap loading: wait for all six images to load.
        var itemsToLoad = 6; // Counter for the number of images to load.

        var onLoad = function() {
            itemsToLoad--;
            if (itemsToLoad === 0) {
                onImageLoad(); // All cubemap faces loaded, proceed to renderer initialization.
            }
        };

        var onError = function(e) {
            // Handle errors during image loading.
            var a = document.createElement('a');
            a.href = e.target.src;
            a.innerHTML = a.href;
            anError('The file ' + a.outerHTML + ' could not be accessed.'); // Display error message.
        };

        // Assign onload and onerror handlers and set the source for each cubemap face.
        for (i = 0; i < panoImage.length; i++) {
            panoImage[i].onload = onLoad;
            panoImage[i].onerror = onError;
            p = config.cubeMap[i];
            // Prepend basePath if the path is relative.
            if (config.basePath && !absoluteURL(p)) {
                p = config.basePath + p;
            } else if (tourConfig.basePath && !absoluteURL(p)) {
                p = tourConfig.basePath + p;
            }
            panoImage[i].src = p;
        }
    } else if (config.type == 'multires') {
        // Multi-resolution panoramas are handled differently; no direct image loading here.
        onImageLoad(); // Proceed to renderer initialization, which handles tile loading.
    } else {
        // Single image (equirectangular) or video panorama loading.
        p = ''; // Initialize path variable.
        if (config.basePath) {
            p = config.basePath;
        } else if (tourConfig.basePath) {
            p = tourConfig.basePath;
        }

        if (config.video === true) {
            // Video panorama loading.
            panoImage.addEventListener('loadeddata', function() {
                panoImage.play(); // Start playing the video once data is loaded.
                onImageLoad(); // Initialize renderer.
            });
            // Try to find a video source that the browser can play.
            for (i = 0; i < config.panoramas.length; i++) {
                if (panoImage.canPlayType(config.panoramas[i].type).length > 0) {
                    panoImage.crossOrigin = 'anonymous';
                    // Set video source, handling absolute vs. relative paths.
                    panoImage.src = absoluteURL(config.panoramas[i].file) ? config.panoramas[i].file : p + config.panoramas[i].file;
                    break; // Found a playable format, stop searching.
                }
            }
            if (panoImage.src.length < 1) {
                // If no playable video format was found.
                console.log('Error: provided video formats are not supported');
                anError('Your browser doesn\'t support any of the provided' +
                    ' video formats. Please try using a different browser or' +
                    ' device.');
            }
        } else {
            // Still image panorama loading.
            p = absoluteURL(config.panorama) ? config.panorama : p + config.panorama; // Final image path.

            panoImage.onload = function() {
                window.URL.revokeObjectURL(this.src); // Clean up the Blob URL after image is loaded.
                onImageLoad(); // Initialize renderer.
            };

            // Use XMLHttpRequest to load image as a blob for progress tracking and XMP parsing.
            var xhr = new XMLHttpRequest();
            xhr.onloadend = function() {
                if (xhr.status != 200) {
                    // Display an error if the image could not be loaded.
                    var a = document.createElement('a');
                    a.href = p;
                    a.innerHTML = a.href;
                    anError('The file ' + a.outerHTML + ' could not be accessed.');
                }
                var img = this.response; // The image data (blob).
                parseGPanoXMP(img); // Parse Google Photo Sphere XMP metadata.
                infoDisplay.load.msg.innerHTML = ''; // Clear loading message.
            };
            xhr.onprogress = function(e) {
                if (e.lengthComputable) {
                    // Update progress bar and message during download.
                    var percent = e.loaded / e.total * 100;
                    infoDisplay.load.lbarFill.style.width = percent + '%';
                    var unit, numerator, denominator;
                    if (e.total > 1e6) { // If total is in MB range.
                        unit = 'MB';
                        numerator = (e.loaded / 1e6).toFixed(2);
                        denominator = (e.total / 1e6).toFixed(2);
                    } else if (e.total > 1e3) { // If total is in KB range.
                        unit = 'kB';
                        numerator = (e.loaded / 1e3).toFixed(1);
                        denominator = (e.total / 1e3).toFixed(1);
                    } else { // If total is in Bytes range.
                        unit = 'B';
                        numerator = e.loaded;
                        denominator = e.total;
                    }
                    infoDisplay.load.msg.innerHTML = numerator + ' / ' + denominator + ' ' + unit;
                } else {
                    // If progress is not computable, show a generic loading spinner.
                    infoDisplay.load.lbox.style.display = 'block';
                    infoDisplay.load.lbar.style.display = 'none';
                }
            };
            xhr.open('GET', p, true); // Open a GET request asynchronously.
            xhr.responseType = 'blob'; // Request the response as a Blob.
            xhr.send(); // Send the request.
        }
    }

    // Update cursor styles to indicate interactivity.
    container.classList.add('grab');
    container.classList.remove('grabbing');
}

/**
 * Parses Google Photo Sphere XMP Metadata from an image blob.
 * This metadata can contain information about the panorama's dimensions and orientation.
 * @param {Blob} image The image data as a Blob.
 * @see https://developers.google.com/photo-sphere/metadata/
 */
function parseGPanoXMP(image) {
    var reader = new FileReader();
    reader.addEventListener('loadend', function() {
        var img = reader.result; // Get the image content as text.

        var start = img.indexOf('<x:xmpmeta');
        // Check if XMP metadata exists and if parsing is not ignored by config.
        if (start > -1 && config.ignoreGPanoXMP !== true) {
            var xmpData = img.substring(start, img.indexOf('</x:xmpmeta>') + 12); // Extract the XMP block.

            /**
             * Extracts a specific tag's value from the XMP data.
             * @param {string} tag The XMP tag name (e.g., 'GPano:FullPanoWidthPixels').
             * @returns {number|null} The numerical value of the tag, or null if not found.
             */
            var getTag = function(tag) {
                var result = xmpData.substring(xmpData.indexOf(tag + '="') + tag.length + 2);
                result = result.substring(0, result.indexOf('"'));
                if (result.length === 0) {
                    return null;
                }
                return Number(result); // Convert extracted string to a number.
            };

            // Extract relevant GPano XMP data.
            var xmp = {
                fullWidth: getTag('GPano:FullPanoWidthPixels'),
                croppedWidth: getTag('GPano:CroppedAreaImageWidthPixels'),
                fullHeight: getTag('GPano:FullPanoHeightPixels'),
                croppedHeight: getTag('GPano:CroppedAreaImageHeightPixels'),
                topPixels: getTag('GPano:CroppedAreaTopPixels'),
                heading: getTag('GPano:PoseHeadingDegrees')
            };

            // If critical XMP data is present, apply it to the configuration.
            if (xmp.fullWidth !== null && xmp.croppedWidth !== null &&
                xmp.fullHeight !== null && xmp.croppedHeight !== null &&
                xmp.topPixels !== null) {

                // Adjust viewer configuration based on GPano XMP data.
                config.haov = xmp.croppedWidth / xmp.fullWidth * 360; // Calculate horizontal angle of view.
                config.vaov = xmp.croppedHeight / xmp.fullHeight * 180; // Calculate vertical angle of view.
                // Calculate vertical offset to correctly center the cropped area.
                config.vOffset = ((xmp.topPixels + xmp.croppedHeight / 2) / xmp.fullHeight - 0.5) * -180;
                if (xmp.heading !== null) {
                    // Set north offset if heading data is available.
                    // TODO: This part might need further refinement for partial panoramas.
                    config.northOffset = xmp.heading;
                    if (config.compass !== false) {
                        config.compass = true; // Enable compass if not explicitly disabled.
                    }
                }

                // TODO: Future enhancement: add support for initial view settings from XMP.
            }
        }

        // Create an object URL for the image blob and set it as the source for panoImage.
        panoImage.src = window.URL.createObjectURL(image);
    });
    reader.readAsText(image); // Read the image blob as text to parse XMP.
}

/**
 * Displays an error message to the user and hides other UI elements.
 * @param {string} [error] Optional custom error message. If not provided, a default WebGL error message is used.
 */
function anError(error) {
    if (error !== undefined) {
        infoDisplay.errorMsg.innerHTML = '<p>' + error + '</p>';
    } else {
        infoDisplay.errorMsg.innerHTML = '<p>Your browser does not have the necessary WebGL support to display this panorama.</p>';
    }
    controls.load.style.display = 'none'; // Hide the load button.
    infoDisplay.load.box.style.display = 'none'; // Hide the loading box.
    infoDisplay.errorMsg.style.display = 'table'; // Show the error message.
    error = true; // Set the global error flag.
    renderContainer.style.display = 'none'; // Hide the renderer container.
}

/**
 * Clears any currently displayed error messages.
 */
function clearError() {
    infoDisplay.load.box.style.display = 'none'; // Hide loading box.
    infoDisplay.errorMsg.style.display = 'none'; // Hide error message.
    error = false; // Reset the global error flag.
}

/**
 * Handles the right-click event to display the "about" message.
 * @param {Event} event The mouse event.
 */
function onRightClick(event) {
    // Position the "about" message at the mouse click coordinates.
    aboutMsg.style.left = event.clientX + 'px';
    aboutMsg.style.top = event.clientY + 'px';
    clearTimeout(onRightClick.t1); // Clear any existing fade-out timers.
    clearTimeout(onRightClick.t2);
    aboutMsg.style.display = 'block'; // Make the message visible.
    aboutMsg.style.opacity = 1; // Ensure full opacity.
    // Set timers for fading out and hiding the message.
    onRightClick.t1 = setTimeout(function() {aboutMsg.style.opacity = 0;}, 2000);
    onRightClick.t2 = setTimeout(function() {aboutMsg.style.display = 'none';}, 2500);
    event.preventDefault(); // Prevent the browser's default context menu.
}

/**
 * Handles the mouse down event for user interaction.
 * @param {Event} event The mouse event.
 */
function onDocumentMouseDown(event) {
    // Prevent default browser actions like text selection.
    event.preventDefault();
    // Ensure the window has focus, which is important for keyboard events.
    window.focus();

    // Do nothing if the panorama hasn't finished loading.
    if (!loaded) {
        return;
    }

    // If hot spot debugging is enabled, log the pitch/yaw of the click point.
    if (config.hotSpotDebug) {
        var x = event.clientX / renderer.canvas.width * 2 - 1; // Normalize X coordinate to [-1, 1].
        // Normalize Y coordinate, adjusting for aspect ratio, to [-1, 1].
        var y = (1 - event.clientY / renderer.canvas.height * 2) * renderer.canvas.height / renderer.canvas.width;
        var focal = 1 / Math.tan(config.hfov * Math.PI / 360); // Calculate focal length from HFOV.
        var s = Math.sin(config.pitch * Math.PI / 180); // Sine of current pitch.
        var c = Math.cos(config.pitch * Math.PI / 180); // Cosine of current pitch.
        var a = focal * c - y * s;
        var root = Math.sqrt(x*x + a*a);
        var pitch = Math.atan((y * c + focal * s) / root) * 180 / Math.PI; // Calculate pitch of click.
        var yaw = Math.atan2(x / root, a / root) * 180 / Math.PI + config.yaw; // Calculate yaw of click.
        console.log('Pitch: ' + pitch + ', Yaw: ' + yaw);
    }

    // If auto-rotation is active, disable it upon user interaction.
    config.autoRotate = false;

    isUserInteracting = true; // Mark user interaction as active.
    latestInteraction = Date.now(); // Update interaction timestamp.

    // Store initial pointer coordinates.
    onPointerDownPointerX = event.clientX;
    onPointerDownPointerY = event.clientY;

    // Store current panorama angles.
    onPointerDownYaw = config.yaw;
    onPointerDownPitch = config.pitch;

    // Update cursor style to indicate dragging.
    container.classList.add('grabbing');
    container.classList.remove('grab');

    animateInit(); // Ensure animation loop is running.
}

/**
 * Handles the mouse move event for panorama dragging.
 * @param {Event} event The mouse event.
 */
function onDocumentMouseMove(event) {
    if (isUserInteracting && loaded) {