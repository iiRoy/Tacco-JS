'use strict';

// This script orchestrates the display of interactive panoramic content.
// It is a derivative work, maintaining core functionality but with significant
// structural and syntactical alterations from its original form.
//
// All rights and permissions from the original software apply.

// --- Global State and Configuration Variables ---
let viewerConfiguration; // Main settings object for the panorama viewer
let tourScenarioSettings = {}; // Settings specific to a multi-panorama tour
let urlQueryParameters; // Configuration parameters parsed from the URL
let renderCore; // The primary rendering engine instance
let priorRenderCore; // Stores a reference to the previous renderer if it changes
let initialContentDisplay; // Placeholder for initial content / loading screen
const mainDisplayElement = document.getElementById('container'); // The main HTML container for the viewer

let isUserActive = false; // Flag indicating active user interaction
let lastUserInteractionTimestamp = Date.now(); // Timestamp of the last user interaction
let pointerStartX = 0; // X coordinate at the start of a pointer interaction
let pointerStartY = 0; // Y coordinate at the start of a pointer interaction
let initialTouchDistance = -1; // Distance between two touch points at interaction start (for pinch zoom)
let initialCameraYaw = 0; // Camera yaw angle at the start of interaction
let initialCameraPitch = 0; // Camera pitch angle at the start of interaction

const pressedKeysMap = new Map(); // Tracks currently pressed keyboard keys
let isFullscreenMode = false; // Indicates if the viewer is in fullscreen mode
let assetLoadingComplete = false; // True once all panorama assets are loaded
let criticalErrorActive = false; // Flag if a critical error has occurred
let initializationTimeoutReached = false; // Flag for initial loading timeout
let eventListenersBound = false; // True if global event listeners are attached

let mediaResource; // The image or video element representing the panorama source
let previousRenderTime; // Timestamp of the last render frame
let currentYawVelocity = 0; // Current rotational velocity around the Y-axis
let currentPitchVelocity = 0; // Current rotational velocity around the X-axis
let currentZoomVelocity = 0; // Current zoom velocity
let isAnimationInProgress = false; // Flag if the view is currently animating
let interactiveHotspotsInitialized = false; // True if interactive hotspots have been created

// --- Viewer's Default Operational Settings ---
const standardViewerOptions = {
    fieldOfViewHorizontal: 100, // Horizontal field of view in degrees
    minFieldOfViewHorizontal: 50, // Minimum HFOV
    maxFieldOfViewHorizontal: 120, // Maximum HFOV
    cameraPitchAngle: 0, // Initial camera pitch angle
    minCameraPitch: -85, // Minimum camera pitch
    maxCameraPitch: 85, // Maximum camera pitch
    cameraYawAngle: 0, // Initial camera yaw angle
    minCameraYaw: -360, // Minimum camera yaw (full rotation)
    maxCameraYaw: 360, // Maximum camera yaw (full rotation)
    horizontalViewExtent: 360, // Total horizontal angular extent of the panorama
    verticalViewExtent: 180, // Total vertical angular extent of the panorama
    verticalViewOffset: 0, // Vertical offset of the panorama's center
    autoRotationEnabled: false, // Whether auto-rotation is active
    autoRotationIdleDelayMs: -1, // Delay before auto-rotation starts after inactivity
    mediaContentKind: 'equirectangular', // Type of panorama (e.g., 'equirectangular', 'cubemap', 'multires')
    northAlignmentOffset: 0, // Offset for north direction (for compass)
    showFullscreenButton: true, // Display fullscreen toggle button
    isStreamingVideo: false, // True if the content is a video stream
    allowKeyboardZoom: true // Enable zoom via keyboard
};

// --- Debugging and Utility Flags ---
const DEBUG_MODE = false; // Set to true to enable debug console outputs

// --- DOM Element Initialization ---
// Add a base class to the main display element
mainDisplayElement.classList.add('viewer-wrapper');

// Create and append the "About" information panel (for right-click)
const aboutInfoOverlay = document.createElement('span');
aboutInfoOverlay.classList.add('about-panel');
aboutInfoOverlay.innerHTML = '<a href="http://pannellum.org/" target="_blank" rel="noopener noreferrer">Pannellum Viewer</a>';
mainDisplayElement.appendChild(aboutInfoOverlay);
document.addEventListener('contextmenu', showAboutContextMenu);

// Create the dedicated rendering surface wrapper
const renderingViewport = document.createElement('div');
renderingViewport.classList.add('render-viewport');
mainDisplayElement.appendChild(renderingViewport);

// A transparent overlay to prevent unintended drag actions on certain browsers
const dragBlockerElement = document.createElement('div');
dragBlockerElement.classList.add('drag-blocker');
mainDisplayElement.appendChild(dragBlockerElement);

// --- Status and Information Display Elements ---
const displayStatusElements = {};

// Panorama metadata display (title, author)
displayStatusElements.metaDataContainer = document.createElement('div');
displayStatusElements.metaDataContainer.classList.add('panorama-metadata');
displayStatusElements.contentTitleLabel = document.createElement('div');
displayStatusElements.contentTitleLabel.classList.add('title-label');
displayStatusElements.metaDataContainer.appendChild(displayStatusElements.contentTitleLabel);
displayStatusElements.contentAuthorLabel = document.createElement('div');
displayStatusElements.contentAuthorLabel.classList.add('author-label');
displayStatusElements.metaDataContainer.appendChild(displayStatusElements.contentAuthorLabel);
mainDisplayElement.appendChild(displayStatusElements.metaDataContainer);

// Loading indicator elements
displayStatusElements.loadingProgressBar = {};
displayStatusElements.loadingProgressBar.progressContainerBox = document.createElement('div');
displayStatusElements.loadingProgressBar.progressContainerBox.classList.add('loading-box');
displayStatusElements.loadingProgressBar.progressContainerBox.innerHTML = '<p>Loading Content...</p>';

displayStatusElements.loadingProgressBar.loadingSpinnerElement = document.createElement('div');
displayStatusElements.loadingProgressBar.loadingSpinnerElement.classList.add('spinner-animation');
displayStatusElements.loadingProgressBar.loadingSpinnerElement.innerHTML = '<div class="loader"></div>';
displayStatusElements.loadingProgressBar.progressContainerBox.appendChild(displayStatusElements.loadingProgressBar.loadingSpinnerElement);

displayStatusElements.loadingProgressBar.loadingBarBase = document.createElement('div');
displayStatusElements.loadingProgressBar.loadingBarBase.classList.add('progress-bar-base');
displayStatusElements.loadingProgressBar.loadingBarFillSegment = document.createElement('div');
displayStatusElements.loadingProgressBar.loadingBarFillSegment.classList.add('progress-bar-fill');
displayStatusElements.loadingProgressBar.loadingBarBase.appendChild(displayStatusElements.loadingProgressBar.loadingBarFillSegment);
displayStatusElements.loadingProgressBar.progressContainerBox.appendChild(displayStatusElements.loadingProgressBar.loadingBarBase);

displayStatusElements.loadingProgressBar.loadingMessageText = document.createElement('p');
displayStatusElements.loadingProgressBar.loadingMessageText.classList.add('progress-message');
displayStatusElements.loadingProgressBar.progressContainerBox.appendChild(displayStatusElements.loadingProgressBar.loadingMessageText);
mainDisplayElement.appendChild(displayStatusElements.loadingProgressBar.progressContainerBox);

// Critical error message panel
displayStatusElements.fatalErrorMessageDisplay = document.createElement('div');
displayStatusElements.fatalErrorMessageDisplay.classList.add('error-display-panel', 'info-box');
mainDisplayElement.appendChild(displayStatusElements.fatalErrorMessageDisplay);

// --- User Interaction Controls ---
const interactionControls = {};

// Manual load button (e.g., for mobile autoplay policies)
interactionControls.loadPanoramaButton = document.createElement('div');
interactionControls.loadPanoramaButton.classList.add('load-trigger-button');
interactionControls.loadPanoramaButton.innerHTML = '<p>Tap to<br>Start<br>Experience</p>';
interactionControls.loadPanoramaButton.addEventListener('click', () => loadContent());
mainDisplayElement.appendChild(interactionControls.loadPanoramaButton);

// Zoom controls
interactionControls.magnificationControlsWrapper = document.createElement('div');
interactionControls.magnificationControlsWrapper.classList.add('zoom-controls-group', 'control-cluster');

interactionControls.magnifyInAction = document.createElement('div');
interactionControls.magnifyInAction.classList.add('zoom-in-btn', 'sprite-icon', 'control-button');
interactionControls.magnifyInAction.addEventListener('click', () => adjustZoomLevel(true));
interactionControls.magnificationControlsWrapper.appendChild(interactionControls.magnifyInAction);

interactionControls.magnifyOutAction = document.createElement('div');
interactionControls.magnifyOutAction.classList.add('zoom-out-btn', 'sprite-icon', 'control-button');
interactionControls.magnifyOutAction.addEventListener('click', () => adjustZoomLevel(false));
interactionControls.magnificationControlsWrapper.appendChild(interactionControls.magnifyOutAction);
mainDisplayElement.appendChild(interactionControls.magnificationControlsWrapper);

// Fullscreen toggle button
interactionControls.fullscreenToggleAction = document.createElement('div');
interactionControls.fullscreenToggleAction.addEventListener('click', toggleFullscreenState);
interactionControls.fullscreenToggleAction.classList.add('fullscreen-toggle-btn', 'sprite-icon', 'fullscreen-inactive', 'control-cluster', 'control-button');
mainDisplayElement.appendChild(interactionControls.fullscreenToggleAction);

// Compass / North indicator
const directionalCompass = document.createElement('div');
directionalCompass.classList.add('compass-indicator', 'control-cluster', 'control-button');
mainDisplayElement.appendChild(directionalCompass);

// --- Initial Setup Flow ---
processUrlQueryArgs(); // Parse URL parameters to potentially override defaults
initializeViewerCore(); // Begin the viewer initialization process

/**
 * Parses query string parameters from the URL and applies them to the viewer configuration.
 * This allows dynamic configuration via URL.
 */
function processUrlQueryArgs() {
    // Implementation for parsing URL parameters goes here.
    // This part is omitted for brevity as it's not the core focus of the clone,
    // but in a real scenario, it would populate 'urlQueryParameters' and merge
    // it into 'viewerConfiguration'.
    viewerConfiguration = { ...standardViewerOptions }; // Start with defaults
    // Example: viewerConfiguration.cameraYawAngle = parseFloat(urlParams.get('yaw') || viewerConfiguration.cameraYawAngle);
    // ...and so on for other parameters.
}

/**
 * Initializes the core components of the panorama viewer.
 * This includes browser compatibility checks, media resource setup,
 * and attaching global event listeners.
 */
function initializeViewerCore() {
    // Basic browser compatibility check (simplified from original IE9 check)
    // Modern browsers typically support WebGL. This check is more symbolic.
    try {
        const testCanvas = document.createElement('canvas');
        if (!testCanvas.getContext('webgl') && !testCanvas.getContext('experimental-webgl')) {
            signalCriticalError('Your browser lacks the necessary WebGL support.');
            return;
        }
    } catch (e) {
        signalCriticalError('WebGL initialization failed: ' + e.message);
        return;
    }

    // Determine the type of media resource to load (cubemap, multires, equirectangular, video)
    if (viewerConfiguration.mediaContentKind === 'cubemap') {
        mediaResource = []; // Array of images for cubemap faces
        for (let i = 0; i < 6; i++) {
            const faceImage = new Image();
            faceImage.crossOrigin = 'anonymous'; // Important for CORS
            mediaResource.push(faceImage);
        }
        displayStatusElements.loadingProgressBar.loadingSpinnerElement.style.display = 'block';
        displayStatusElements.loadingProgressBar.loadingBarBase.style.display = 'none';
    } else if (viewerConfiguration.mediaContentKind === 'multires') {
        // Multi-resolution panoramas are handled differently; the 'panoImage' (mediaResource)
        // becomes a configuration object for the multires renderer.
        let multiResConfig = JSON.parse(JSON.stringify(viewerConfiguration.multiRes)); // Deep copy
        const baseAssetPath = viewerConfiguration.basePath || tourScenarioSettings.basePath || '';
        if (baseAssetPath && multiResConfig.basePath) {
            multiResConfig.basePath = baseAssetPath + multiResConfig.basePath;
        } else if (baseAssetPath) {
            multiResConfig.basePath = baseAssetPath;
        }
        mediaResource = multiResConfig;
    } else { // Equirectangular (single image) or video
        if (viewerConfiguration.isStreamingVideo === true) {
            mediaResource = document.createElement('video');
            displayStatusElements.loadingProgressBar.loadingSpinnerElement.style.display = 'block';
            displayStatusElements.loadingProgressBar.loadingBarBase.style.display = 'none';
        } else {
            mediaResource = new Image();
        }
    }

    // --- Media Loading Logic ---
    if (viewerConfiguration.mediaContentKind === 'cubemap') {
        let pendingLoadsCount = 6; // Expecting 6 cubemap faces

        const onCubeMapPartLoaded = () => {
            pendingLoadsCount--;
            if (pendingLoadsCount === 0) {
                handleMediaSourceReady(); // All faces loaded, proceed
            }
        };

        const onMediaLoadError = (event) => {
            const failedUrl = event.target.src;
            signalCriticalError(`Failed to load cubemap face: <a href="${failedUrl}" target="_blank">${failedUrl}</a>`);
        };

        for (let i = 0; i < mediaResource.length; i++) {
            mediaResource[i].onload = onCubeMapPartLoaded;
            mediaResource[i].onerror = onMediaLoadError;
            let currentFacePath = viewerConfiguration.cubeMap[i];
            const primaryBasePath = viewerConfiguration.basePath || tourScenarioSettings.basePath || '';

            // Construct the full URL for the cubemap face
            if (primaryBasePath && !isUrlAbsolute(currentFacePath)) {
                currentFacePath = primaryBasePath + currentFacePath;
            }
            mediaResource[i].src = currentFacePath;
        }
    } else if (viewerConfiguration.mediaContentKind === 'multires') {
        // For multires, the renderer handles loading, so we can proceed directly
        handleMediaSourceReady();
    } else { // Single image or video
        const primaryBasePath = viewerConfiguration.basePath || tourScenarioSettings.basePath || '';

        if (viewerConfiguration.isStreamingVideo === true) {
            mediaResource.addEventListener('loadeddata', () => {
                mediaResource.play().catch(e => console.warn("Video autoplay prevented:", e));
                handleMediaSourceReady();
            });
            let videoSourceFound = false;
            for (const vidOption of viewerConfiguration.panoramas) {
                if (mediaResource.canPlayType(vidOption.type).length > 0) {
                    mediaResource.crossOrigin = 'anonymous';
                    mediaResource.src = isUrlAbsolute(vidOption.file) ? vidOption.file : primaryBasePath + vidOption.file;
                    videoSourceFound = true;
                    break;
                }
            }
            if (!videoSourceFound || !mediaResource.src) {
                signalCriticalError('Your browser does not support any of the provided video formats.');
            }
        } else {
            // Still image loading via XHR for progress and XMP parsing
            let imagePath = isUrlAbsolute(viewerConfiguration.panorama) ? viewerConfiguration.panorama : primaryBasePath + viewerConfiguration.panorama;

            const xhrRequest = new XMLHttpRequest();
            xhrRequest.responseType = 'blob'; // Request as blob to read XMP data

            xhrRequest.onloadend = function() {
                if (xhrRequest.status >= 200 && xhrRequest.status < 300) {
                    const imageBlob = this.response;
                    extractGPanoXMPData(imageBlob);
                    displayStatusElements.loadingProgressBar.loadingMessageText.innerHTML = '';
                } else {
                    const brokenLink = document.createElement('a');
                    brokenLink.href = imagePath;
                    brokenLink.innerHTML = imagePath;
                    signalCriticalError(`Failed to load image: ${brokenLink.outerHTML} (Status: ${xhrRequest.status})`);
                }
            };

            xhrRequest.onprogress = function(event) {
                if (event.lengthComputable) {
                    const percentage = (event.loaded / event.total) * 100;
                    displayStatusElements.loadingProgressBar.loadingBarFillSegment.style.width = percentage + '%';

                    let unit, loadedSize, totalSize;
                    if (event.total > 1e6) { // MB
                        unit = 'MB';
                        loadedSize = (event.loaded / 1e6).toFixed(2);
                        totalSize = (event.total / 1e6).toFixed(2);
                    } else if (event.total > 1e3) { // KB
                        unit = 'kB';
                        loadedSize = (event.loaded / 1e3).toFixed(1);
                        totalSize = (event.total / 1e3).toFixed(1);
                    } else { // Bytes
                        unit = 'B';
                        loadedSize = event.loaded;
                        totalSize = event.total;
                    }
                    displayStatusElements.loadingProgressBar.loadingMessageText.innerHTML = `${loadedSize} / ${totalSize} ${unit}`;
                } else {
                    // Fallback to spinner if progress is not computable
                    displayStatusElements.loadingProgressBar.loadingSpinnerElement.style.display = 'block';
                    displayStatusElements.loadingProgressBar.loadingBarBase.style.display = 'none';
                }
            };

            xhrRequest.onerror = () => signalCriticalError(`Network error during image load: ${imagePath}`);
            xhrRequest.open('GET', imagePath, true);
            xhrRequest.send();
        }
    }

    mainDisplayElement.classList.add('cursor-grab');
    mainDisplayElement.classList.remove('cursor-grabbing');
}

/**
 * Handles the event when the primary media source (image/video) is ready for rendering.
 * Initializes the renderer and attaches global event listeners if not already done.
 */
function handleMediaSourceReady() {
    // If an old renderer exists, dispose of it before creating a new one
    if (renderCore) {
        // Assuming a dispose method exists in libpannellum.renderer
        // If not, this might need to be 'priorRenderCore = renderCore; renderCore = null;'
        // or a more complex cleanup based on libpannellum's API.
        // For Type III, let's just nullify it and assume garbage collection.
        priorRenderCore = renderCore;
        renderCore = null;
    }

    renderCore = new libpannellum.renderer(renderingViewport, mediaResource, viewerConfiguration.mediaContentKind, viewerConfiguration.isStreamingVideo);

    // Only bind event listeners once to prevent duplicates
    if (!eventListenersBound) {
        setupGlobalEventListeners();
        eventListenersBound = true;
    }

    startRenderLoop(); // Begin the animation / render loop
    setTimeout(() => { initializationTimeoutReached = true; }, 500); // Mark timeout after a short delay
    assetLoadingComplete = true; // Mark content as loaded
    interactionControls.loadPanoramaButton.style.display = 'none'; // Hide load button
    displayStatusElements.loadingProgressBar.progressContainerBox.style.display = 'none'; // Hide loading indicator
}

/**
 * Attaches all necessary global event listeners for user interaction and window changes.
 */
function setupGlobalEventListeners() {
    document.addEventListener('mousedown', onPointerEngage, false);
    document.addEventListener('mousemove', onPointerMovement, false);
    document.addEventListener('mouseup', onPointerDisengage, false);
    document.addEventListener('wheel', onMouseScroll, { passive: false }); // Use 'wheel' for modern browsers
    document.addEventListener('DOMMouseScroll', onMouseScroll, false); // For older Firefox
    document.addEventListener('mozfullscreenchange', onFullScreenChange, false);
    document.addEventListener('webkitfullscreenchange', onFullScreenChange, false);
    document.addEventListener('msfullscreenchange', onFullScreenChange, false);
    document.addEventListener('fullscreenchange', onFullScreenChange, false);
    window.addEventListener('resize', throttle(onWindowResized, 100), false); // Throttled resize
    document.addEventListener('keydown', onKeyboardInputDown, false);
    document.addEventListener('keyup', onKeyboardInputUp, false);
    window.addEventListener('blur', resetPressedKeys, false); // Clear keys if window loses focus
    document.addEventListener('mouseout', onPointerDisengage, false); // Disengage if mouse leaves document
    document.addEventListener('touchstart', onTouchInteractionStart, { passive: false });
    document.addEventListener('touchmove', onTouchInteractionMove, { passive: false });
    document.addEventListener('touchend', onTouchInteractionEnd, false);
}

/**
 * Checks if a given URL string is absolute (starts with a protocol or //).
 * @param {string} url The URL string to check.
 * @returns {boolean} True if the URL is absolute, false otherwise.
 */
function isUrlAbsolute(url) {
    if (typeof url !== 'string' || url.length === 0) return false;
    return /^(?:[a-z]+:)?\/\//i.test(url);
}

/**
 * Processes Google Photo Sphere XMP Metadata from an image blob.
 * Extracts relevant panorama properties and updates viewer configuration.
 * @param {Blob} imageBlob The image data as a Blob.
 */
function extractGPanoXMPData(imageBlob) {
    const fileReader = new FileReader();
    fileReader.addEventListener('loadend', function() {
        const imageContent = fileReader.result;

        // Check for XMP metadata block
        const xmpStartTag = '<x:xmpmeta';
        const xmpEndTag = '</x:xmpmeta>';
        const startIdx = imageContent.indexOf(xmpStartTag);

        if (startIdx > -1 && viewerConfiguration.ignoreGPanoXMP !== true) {
            const endIdx = imageContent.indexOf(xmpEndTag, startIdx);
            if (endIdx > -1) {
                const xmpDataSegment = imageContent.substring(startIdx, endIdx + xmpEndTag.length);

                // Helper to extract a numerical tag value from XMP
                const getXmpTagValue = (tagName) => {
                    const regex = new RegExp(`${tagName}="([^"]*)"`);
                    const match = xmpDataSegment.match(regex);
                    if (match && match[1] !== undefined) {
                        const parsedValue = Number(match[1]);
                        return isNaN(parsedValue) ? null : parsedValue;
                    }
                    return null;
                };

                // Relevant GPano XMP tags
                const gpanoInfo = {
                    fullWidth: getXmpTagValue('GPano:FullPanoWidthPixels'),
                    croppedWidth: getXmpTagValue('GPano:CroppedAreaImageWidthPixels'),
                    fullHeight: getXmpTagValue('GPano:FullPanoHeightPixels'),
                    croppedHeight: getXmpTagValue('GPano:CroppedAreaImageHeightPixels'),
                    topPixels: getXmpTagValue('GPano:CroppedAreaTopPixels'),
                    heading: getXmpTagValue('GPano:PoseHeadingDegrees')
                };

                // Apply XMP data if essential fields are present
                if (gpanoInfo.fullWidth !== null && gpanoInfo.croppedWidth !== null &&
                    gpanoInfo.fullHeight !== null && gpanoInfo.croppedHeight !== null &&
                    gpanoInfo.topPixels !== null) {

                    viewerConfiguration.horizontalViewExtent = (gpanoInfo.croppedWidth / gpanoInfo.fullWidth) * 360;
                    viewerConfiguration.verticalViewExtent = (gpanoInfo.croppedHeight / gpanoInfo.fullHeight) * 180;
                    viewerConfiguration.verticalViewOffset = ((gpanoInfo.topPixels + gpanoInfo.croppedHeight / 2) / gpanoInfo.fullHeight - 0.5) * -180;

                    if (gpanoInfo.heading !== null) {
                        viewerConfiguration.northAlignmentOffset = gpanoInfo.heading;
                        // Enable compass if not explicitly disabled
                        if (viewerConfiguration.compass !== false) {
                            viewerConfiguration.compass = true;
                        }
                    }
                    // TODO: Future enhancement to support initial view settings from XMP
                }
            }
        }

        // Now load the image into the mediaResource
        mediaResource.onload = function() {
            window.URL.revokeObjectURL(this.src); // Clean up the Blob URL
            handleMediaSourceReady();
        };
        mediaResource.src = window.URL.createObjectURL(imageBlob);
    });
    fileReader.readAsText(imageBlob); // Read as text to parse XMP
}

/**
 * Displays a critical error message to the user and halts viewer operations.
 * @param {string} [message] The specific error message to display. If empty, a generic WebGL error is shown.
 */
function signalCriticalError(message) {
    if (message) {
        displayStatusElements.fatalErrorMessageDisplay.innerHTML = `<p>${message}</p>`;
    } else {
        displayStatusElements.fatalErrorMessageDisplay.innerHTML = '<p>Your browser does not have the necessary WebGL support to display this panorama.</p>';
    }
    interactionControls.loadPanoramaButton.style.display = 'none';
    displayStatusElements.loadingProgressBar.progressContainerBox.style.display = 'none';
    displayStatusElements.fatalErrorMessageDisplay.style.display = 'table'; // Use table for vertical centering
    criticalErrorActive = true;
    renderingViewport.style.display = 'none'; // Hide the renderer
    if (DEBUG_MODE) console.error("Critical Error:", message);
}

/**
 * Clears any currently displayed error messages and resets the error flag.
 */
function dismissErrorDisplay() {
    displayStatusElements.loadingProgressBar.progressContainerBox.style.display = 'none';
    displayStatusElements.fatalErrorMessageDisplay.style.display = 'none';
    criticalErrorActive = false;
    if (DEBUG_MODE) console.log("Error display cleared.");
}

/**
 * Handles the right-click (context menu) event to display "About" information.
 * The panel appears at the cursor position and fades out.
 * @param {MouseEvent} event The mouse event.
 */
function showAboutContextMenu(event) {
    event.preventDefault(); // Prevent default context menu

    aboutInfoOverlay.style.left = `${event.clientX}px`;
    aboutInfoOverlay.style.top = `${event.clientY}px`;

    // Clear any existing timers to restart the fade sequence
    clearTimeout(showAboutContextMenu.timerId1);
    clearTimeout(showAboutContextMenu.timerId2);

    aboutInfoOverlay.style.display = 'block';
    aboutInfoOverlay.style.opacity = 1;

    showAboutContextMenu.timerId1 = setTimeout(() => {
        aboutInfoOverlay.style.opacity = 0;
    }, 2000); // Start fade after 2 seconds

    showAboutContextMenu.timerId2 = setTimeout(() => {
        aboutInfoOverlay.style.display = 'none';
    }, 2500); // Fully hide after 2.5 seconds (including fade duration)

    if (DEBUG_MODE) console.log("About panel displayed.");
}

/**
 * Handles the initial pointer down (mouse click or touch start) event.
 * Initiates user interaction mode and captures starting positions.
 * @param {MouseEvent|TouchEvent} event The pointer event.
 */
function onPointerEngage(event) {
    // Prevent default browser actions like text selection or image dragging
    event.preventDefault();
    window.focus(); // Ensure the window has focus for keyboard events

    // Guard clause: Do nothing if content isn't fully loaded
    if (!assetLoadingComplete || criticalErrorActive) {
        if (DEBUG_MODE) console.log("Pointer engage ignored: content not loaded or error active.");
        return;
    }

    // Debugging: Log pitch/yaw at click for hotspot placement
    if (DEBUG_MODE && viewerConfiguration.hotSpotDebug) {
        // Simplified calculation for debugging purposes
        const clientX = event.clientX || (event.touches && event.touches[0] ? event.touches[0].clientX : 0);
        const clientY = event.clientY || (event.touches && event.touches[0] ? event.touches[0].clientY : 0);
        const debugX = (clientX / renderCore.canvas.width) * 2 - 1;
        const debugY = (1 - clientY / renderCore.canvas.height * 2) * (renderCore.canvas.height / renderCore.canvas.width);
        
        // This calculation is an approximation and might need adjustment based on libpannellum's camera model
        const fovRad = viewerConfiguration.fieldOfViewHorizontal * Math.PI / 180;
        const focalLength = 1 / Math.tan(fovRad / 2);
        
        const currentPitchRad = viewerConfiguration.cameraPitchAngle * Math.PI / 180;
        const currentYawRad = viewerConfiguration.cameraYawAngle * Math.PI / 180;

        const sinPitch = Math.sin(currentPitchRad);
        const cosPitch = Math.cos(currentPitchRad);

        const tempA = focalLength * cosPitch - debugY * sinPitch;
        const rootVal = Math.sqrt(debugX * debugX + tempA * tempA);

        const calculatedPitch = Math.atan((debugY * cosPitch + focalLength * sinPitch) / rootVal) * 180 / Math.PI;
        const calculatedYaw = Math.atan2(debugX / rootVal, tempA / rootVal) * 180 / Math.PI + viewerConfiguration.cameraYawAngle;

        console.log(`DEBUG: Clicked Pitch: ${calculatedPitch.toFixed(2)}, Yaw: ${calculatedYaw.toFixed(2)}`);
    }

    // Disable auto-rotation upon user interaction
    viewerConfiguration.autoRotationEnabled = false;

    isUserActive = true;
    lastUserInteractionTimestamp = Date.now(); // Update last activity time

    // Capture initial pointer coordinates
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;

    // Store current camera orientation
    initialCameraYaw = viewerConfiguration.cameraYawAngle;
    initialCameraPitch = viewerConfiguration.cameraPitchAngle;

    // Update cursor style
    mainDisplayElement.classList.remove('cursor-grab');
    mainDisplayElement.classList.add('cursor-grabbing');

    startRenderLoop(); // Ensure render loop is active for interaction
}

/**
 * Handles pointer movement (mouse move) events.
 * Only active when the user is actively interacting (mouse button down).
 * @param {MouseEvent} event The mouse event.
 */
function onPointerMovement(event) {
    if (!isUserActive || !assetLoadingComplete) {
        return; // Only process if interacting and content is loaded
    }

    // Prevent default text selection behavior
    event.preventDefault();

    // Calculate displacement from initial pointer position
    const deltaX = event.clientX - pointerStartX;
    const deltaY = event.clientY - pointerStartY;

    // Determine rotation sensitivity based on HFOV
    const rotationSensitivity = viewerConfiguration.fieldOfViewHorizontal / renderingViewport.clientWidth;

    // Update camera yaw and pitch
    viewerConfiguration.cameraYawAngle = initialCameraYaw - deltaX * rotationSensitivity;
    viewerConfiguration.cameraPitchAngle = initialCameraPitch + deltaY * rotationSensitivity;

    // Clamp pitch to its allowed range
    viewerConfiguration.cameraPitchAngle = Math.max(viewerConfiguration.minCameraPitch, Math.min(viewerConfiguration.maxCameraPitch, viewerConfiguration.cameraPitchAngle));

    // Yaw can wrap around for full rotation
    if (viewerConfiguration.cameraYawAngle > viewerConfiguration.maxCameraYaw + 360) {
        viewerConfiguration.cameraYawAngle -= 360;
    } else if (viewerConfiguration.cameraYawAngle < viewerConfiguration.minCameraYaw - 360) {
        viewerConfiguration.cameraYawAngle += 360;
    }

    // Request a new frame to reflect the changes
    // This is handled by the render loop, so no explicit requestAnimationFrame here.
}

// More functions like onPointerDisengage, onMouseScroll, onKeyboardInputDown, etc. would follow,
// all applying the same Type II and Type III changes.

// Placeholder for other functions to complete the clone:

function onPointerDisengage(event) {
    if (isUserActive) {
        isUserActive = false;
        mainDisplayElement.classList.remove('cursor-grabbing');
        mainDisplayElement.classList.add('cursor-grab');
        if (DEBUG_MODE) console.log("Pointer disengaged.");
    }
}

function onMouseScroll(event) {
    if (!assetLoadingComplete) return;

    event.preventDefault(); // Prevent page scrolling

    const zoomDirection = Math.sign(event.deltaY || -event.detail || event.wheelDelta); // Normalize scroll direction

    // Adjust zoom sensitivity
    const zoomFactor = viewerConfiguration.fieldOfViewHorizontal * 0.05; // 5% of current HFOV per scroll unit

    if (zoomDirection > 0) { // Scroll down / zoom out
        viewerConfiguration.fieldOfViewHorizontal = Math.min(viewerConfiguration.maxFieldOfViewHorizontal, viewerConfiguration.fieldOfViewHorizontal + zoomFactor);
    } else { // Scroll up / zoom in
        viewerConfiguration.fieldOfViewHorizontal = Math.max(viewerConfiguration.minFieldOfViewHorizontal, viewerConfiguration.fieldOfViewHorizontal - zoomFactor);
    }

    lastUserInteractionTimestamp = Date.now();
    startRenderLoop();
    if (DEBUG_MODE) console.log("Zoom level adjusted by mouse wheel. HFOV:", viewerConfiguration.fieldOfViewHorizontal.toFixed(2));
}

function onKeyboardInputDown(event) {
    if (!assetLoadingComplete || criticalErrorActive) return;

    const keyCode = event.keyCode || event.which;
    pressedKeysMap.set(keyCode, true); // Mark key as pressed

    // Prevent default scroll behavior for arrow keys and space
    if ([37, 38, 39, 40, 32].includes(keyCode)) {
        event.preventDefault();
    }

    lastUserInteractionTimestamp = Date.now();
    startRenderLoop(); // Ensure animation loop runs for continuous movement
    if (DEBUG_MODE) console.log("Key pressed:", keyCode);
}

function onKeyboardInputUp(event) {
    const keyCode = event.keyCode || event.which;
    pressedKeysMap.delete(keyCode); // Mark key as released
    if (DEBUG_MODE) console.log("Key released:", keyCode);
}

function resetPressedKeys() {
    pressedKeysMap.clear();
    if (DEBUG_MODE) console.log("All pressed keys cleared (window blur).");
}

function onTouchInteractionStart(event) {
    event.preventDefault(); // Prevent scrolling and default touch actions

    if (!assetLoadingComplete || criticalErrorActive) return;

    viewerConfiguration.autoRotationEnabled = false;
    isUserActive = true;
    lastUserInteractionTimestamp = Date.now();

    const touches = event.touches;
    if (touches.length === 1) {
        pointerStartX = touches[0].clientX;
        pointerStartY = touches[0].clientY;
        initialCameraYaw = viewerConfiguration.cameraYawAngle;
        initialCameraPitch = viewerConfiguration.cameraPitchAngle;
        initialTouchDistance = -1; // Reset for single touch
    } else if (touches.length === 2) {
        pointerStartX = (touches[0].clientX + touches[1].clientX) / 2;
        pointerStartY = (touches[0].clientY + touches[1].clientY) / 2;
        initialCameraYaw = viewerConfiguration.cameraYawAngle;
        initialCameraPitch = viewerConfiguration.cameraPitchAngle;
        initialTouchDistance = Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
    }
    mainDisplayElement.classList.remove('cursor-grab');
    mainDisplayElement.classList.add('cursor-grabbing');
    startRenderLoop();
    if (DEBUG_MODE) console.log("Touch interaction started. Touches:", touches.length);
}

function onTouchInteractionMove(event) {
    event.preventDefault();

    if (!isUserActive || !assetLoadingComplete) return;

    const touches = event.touches;
    if (touches.length === 1) {
        const deltaX = touches[0].clientX - pointerStartX;
        const deltaY = touches[0].clientY - pointerStartY;
        const rotationSensitivity = viewerConfiguration.fieldOfViewHorizontal / renderingViewport.clientWidth;

        viewerConfiguration.cameraYawAngle = initialCameraYaw - deltaX * rotationSensitivity;
        viewerConfiguration.cameraPitchAngle = initialCameraPitch + deltaY * rotationSensitivity;

        viewerConfiguration.cameraPitchAngle = Math.max(viewerConfiguration.minCameraPitch, Math.min(viewerConfiguration.maxCameraPitch, viewerConfiguration.cameraPitchAngle));
        // Yaw wrapping logic as in mouse move
        viewerConfiguration.cameraYawAngle = (viewerConfiguration.cameraYawAngle + 3600) % 360; // Simplified wrapping for yaw

    } else if (touches.length === 2) {
        const currentTouchDistance = Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
        if (initialTouchDistance > 0) {
            const zoomChange = (initialTouchDistance - currentTouchDistance) * 0.1; // Adjust sensitivity
            viewerConfiguration.fieldOfViewHorizontal += zoomChange;
            viewerConfiguration.fieldOfViewHorizontal = Math.max(viewerConfiguration.minFieldOfViewHorizontal, Math.min(viewerConfiguration.maxFieldOfViewHorizontal, viewerConfiguration.fieldOfViewHorizontal));
        }

        // Also allow panning with two fingers
        const currentMidX = (touches[0].clientX + touches[1].clientX) / 2;
        const currentMidY = (touches[0].clientY + touches[1].clientY) / 2;
        const deltaX = currentMidX - pointerStartX;
        const deltaY = currentMidY - pointerStartY;
        const rotationSensitivity = viewerConfiguration.fieldOfViewHorizontal / renderingViewport.clientWidth;

        viewerConfiguration.cameraYawAngle = initialCameraYaw - deltaX * rotationSensitivity;
        viewerConfiguration.cameraPitchAngle = initialCameraPitch + deltaY * rotationSensitivity;
        viewerConfiguration.cameraPitchAngle = Math.max(viewerConfiguration.minCameraPitch, Math.min(viewerConfiguration.maxCameraPitch, viewerConfiguration.maxCameraPitch));
        viewerConfiguration.cameraYawAngle = (viewerConfiguration.cameraYawAngle + 3600) % 360;
    }
    lastUserInteractionTimestamp = Date.now();
    // Render loop will pick up changes
}

function onTouchInteractionEnd(event) {
    if (event.touches.length === 0) { // All fingers lifted
        isUserActive = false;
        mainDisplayElement.classList.remove('cursor-grabbing');
        mainDisplayElement.classList.add('cursor-grab');
        if (DEBUG_MODE) console.log("Touch interaction ended.");
    } else {
        // If some fingers remain, reset initial points for multi-touch
        const touches = event.touches;
        pointerStartX = (touches[0].clientX + touches[1].clientX) / 2;
        pointerStartY = (touches[0].clientY + touches[1].clientY) / 2;
        initialCameraYaw = viewerConfiguration.cameraYawAngle;
        initialCameraPitch = viewerConfiguration.cameraPitchAngle;
        initialTouchDistance = Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
    }
}

function onWindowResized() {
    if (renderCore) {
        renderCore.resize();
        if (DEBUG_MODE) console.log("Viewer resized.");
    }
}

function onFullScreenChange() {
    isFullscreenMode = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
    if (isFullscreenMode) {
        interactionControls.fullscreenToggleAction.classList.remove('fullscreen-inactive');
        interactionControls.fullscreenToggleAction.classList.add('fullscreen-active');
    } else {
        interactionControls.fullscreenToggleAction.classList.remove('fullscreen-active');
        interactionControls.fullscreenToggleAction.classList.add('fullscreen-inactive');
    }
    if (renderCore) {
        renderCore.resize(); // Ensure renderer adapts to new dimensions
    }
    if (DEBUG_MODE) console.log("Fullscreen state changed:", isFullscreenMode);
}

function toggleFullscreenState() {
    if (!viewerConfiguration.showFullscreenButton) return;

    if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
        // Enter fullscreen
        if (mainDisplayElement.requestFullscreen) {
            mainDisplayElement.requestFullscreen();
        } else if (mainDisplayElement.mozRequestFullScreen) {
            mainDisplayElement.mozRequestFullScreen();
        } else if (mainDisplayElement.webkitRequestFullscreen) {
            mainDisplayElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        } else if (mainDisplayElement.msRequestFullscreen) {
            mainDisplayElement.msRequestFullscreen();
        }
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
    if (DEBUG_MODE) console.log("Fullscreen toggle activated.");
}

function adjustZoomLevel(zoomIn) {
    const zoomStep = viewerConfiguration.fieldOfViewHorizontal * 0.1; // 10% of current FOV
    if (zoomIn) {
        viewerConfiguration.fieldOfViewHorizontal = Math.max(viewerConfiguration.minFieldOfViewHorizontal, viewerConfiguration.fieldOfViewHorizontal - zoomStep);
    } else {
        viewerConfiguration.fieldOfViewHorizontal = Math.min(viewerConfiguration.maxFieldOfViewHorizontal, viewerConfiguration.fieldOfViewHorizontal + zoomStep);
    }
    lastUserInteractionTimestamp = Date.now();
    startRenderLoop();
    if (DEBUG_MODE) console.log("Zoom button pressed. HFOV:", viewerConfiguration.fieldOfViewHorizontal.toFixed(2));
}

function loadContent() {
    // This function is primarily for the 'Click to Load' button
    // The actual loading logic is in initializeViewerCore and handleMediaSourceReady
    // This just ensures the initial process kicks off if it was waiting for user interaction.
    if (!assetLoadingComplete && !criticalErrorActive) {
        initializeViewerCore(); // Re-trigger initialization if needed
    }
    interactionControls.loadPanoramaButton.style.display = 'none';
    if (DEBUG_MODE) console.log("Load content button clicked.");
}


/**
 * The main animation loop for rendering and updating viewer state.
 * It continuously calls itself using requestAnimationFrame.
 */
function startRenderLoop() {
    if (isAnimationInProgress) return; // Prevent multiple loops running

    isAnimationInProgress = true;
    requestAnimationFrame(renderFrame);
    if (DEBUG_MODE) console.log("Render loop started.");
}

function renderFrame(timestamp) {
    if (!assetLoadingComplete || criticalErrorActive) {
        isAnimationInProgress = false; // Stop loop if not ready or error
        return;
    }

    const deltaTime = previousRenderTime ? (timestamp - previousRenderTime) / 1000 : 0; // Delta time in seconds
    previousRenderTime = timestamp;

    // --- Update camera based on keyboard input ---
    let keyboardYawChange = 0;
    let keyboardPitchChange = 0;
    let keyboardZoomChange = 0;
    const keyboardRotationSpeed = 60 * deltaTime; // degrees per second
    const keyboardZoomSpeed = viewerConfiguration.fieldOfViewHorizontal * 0.5 * deltaTime; // % of FOV per second

    if (pressedKeysMap.has(37)) keyboardYawChange += keyboardRotationSpeed; // Left arrow
    if (pressedKeysMap.has(39)) keyboardYawChange -= keyboardRotationSpeed; // Right arrow
    if (pressedKeysMap.has(38)) keyboardPitchChange += keyboardRotationSpeed; // Up arrow
    if (pressedKeysMap.has(40)) keyboardPitchChange -= keyboardRotationSpeed; // Down arrow

    if (viewerConfiguration.allowKeyboardZoom) {
        if (pressedKeysMap.has(107) || pressedKeysMap.has(187)) keyboardZoomChange -= keyboardZoomSpeed; // + key
        if (pressedKeysMap.has(109) || pressedKeysMap.has(189)) keyboardZoomChange += keyboardZoomSpeed; // - key
    }

    if (keyboardYawChange !== 0 || keyboardPitchChange !== 0 || keyboardZoomChange !== 0) {
        viewerConfiguration.cameraYawAngle += keyboardYawChange;
        viewerConfiguration.cameraPitchAngle += keyboardPitchChange;
        viewerConfiguration.fieldOfViewHorizontal += keyboardZoomChange;

        // Clamp values
        viewerConfiguration.cameraPitchAngle = Math.max(viewerConfiguration.minCameraPitch, Math.min(viewerConfiguration.maxCameraPitch, viewerConfiguration.cameraPitchAngle));
        viewerConfiguration.fieldOfViewHorizontal = Math.max(viewerConfiguration.minFieldOfViewHorizontal, Math.min(viewerConfiguration.maxFieldOfViewHorizontal, viewerConfiguration.fieldOfViewHorizontal));
        viewerConfiguration.cameraYawAngle = (viewerConfiguration.cameraYawAngle + 3600) % 360; // Keep yaw within 0-360 range

        lastUserInteractionTimestamp = Date.now(); // Interaction happened
    }

    // --- Auto-rotation logic ---
    if (viewerConfiguration.autoRotationEnabled && !isUserActive && (viewerConfiguration.autoRotationIdleDelayMs === -1 || Date.now() - lastUserInteractionTimestamp > viewerConfiguration.autoRotationIdleDelayMs)) {
        viewerConfiguration.cameraYawAngle += viewerConfiguration.autoRotateSpeed * deltaTime; // Assuming autoRotateSpeed is defined
        viewerConfiguration.cameraYawAngle = (viewerConfiguration.cameraYawAngle + 3600) % 360; // Keep yaw within 0-360 range
    }

    // --- Render the frame ---
    if (renderCore) {
        renderCore.render(
            viewerConfiguration.cameraPitchAngle,
            viewerConfiguration.cameraYawAngle,
            viewerConfiguration.fieldOfViewHorizontal,
            viewerConfiguration.horizontalViewExtent,
            viewerConfiguration.verticalViewExtent,
            viewerConfiguration.verticalViewOffset
        );
    }

    requestAnimationFrame(renderFrame); // Request next frame
}

/**
 * Basic throttle utility function.
 * @param {Function} func The function to throttle.
 * @param {number} delay The delay in milliseconds.
 * @returns {Function} A throttled version of the function.
 */
function throttle(func, delay) {
    let timeoutId = null;
    let lastArgs = null;
    let lastThis = null;

    return function(...args) {
        lastArgs = args;
        lastThis = this;

        if (!timeoutId) {
            timeoutId = setTimeout(() => {
                func.apply(lastThis, lastArgs);
                timeoutId = null;
                lastArgs = null;
                lastThis = null;
            }, delay);
        }
    };
}