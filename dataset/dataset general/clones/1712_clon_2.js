/*
 * ProjectSphere - An immersive WebGL viewer for panoramic content.
 * Copyright (c) 2020-2023 Acme Corp.
 *
 * This software is provided under the MIT License.
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

'use-strict';

// Declaration of core variables and state flags
var settings,
    journeyOptions = {},
    urlSettings,
    visualizer,
    priorVisualizer,
    glimpse,
    mainWrapper = document.querySelector('#viewport-area'), // Main DOM element for the viewer
    isUserEngaged = false,
    lastActivityTime = Date.now(),
    initialClickX = 0,
    initialClickY = 0,
    initialClickDistance = -1,
    initialViewYaw = 0,
    initialViewPitch = 0,
    pressedKeys = new Array(10),
    fullScreenMode = false,
    contentReady = false,
    hasIssue = false,
    timedOutFlag = false,
    eventHandlersAttached = false,
    panoramaSource,
    previousFrameTime,
    horizontalSpeed = 0,
    verticalSpeed = 0,
    magnificationSpeed = 0,
    isAnimating = false,
    interactivePointsGenerated = false;

// Default configuration parameters for the viewer
var standardSettings = {
    horizontalFieldOfView: 100,
    minHorizontalFOV: 50,
    maxHorizontalFOV: 120,
    verticalAngle: 0,
    minVerticalAngle: -85,
    maxVerticalAngle: 85,
    horizontalAngle: 0,
    minHorizontalAngle: -360,
    maxHorizontalAngle: 360,
    totalHorizontalAngle: 360,
    totalVerticalAngle: 180,
    verticalOffset: 0,
    autoRotationEnabled: false,
    autoRotateIdleDelay: -1,
    sourceType: 'equirectangular',
    compassOffset: 0,
    displayFullscreenControl: true,
    isVideoContent: false,
    enableKeyboardZoom: true
};

// Apply base CSS class to the main container
mainWrapper.classList.add('viewport-wrapper');

// Setup 'about' information displayed on right-click
var infoLabel = document.createElement('div');
infoLabel.className = 'info-display-message';
infoLabel.innerHTML = '<a href="http://example.com/project/" target="_blank">ProjectSphere</a>';
mainWrapper.appendChild(infoLabel);
document.addEventListener('contextmenu', onContextClick); // Handle right-click event


// Create the dedicated area for the WebGL renderer
var displayArea = document.createElement('div');
displayArea.className = 'render-surface';
mainWrapper.appendChild(displayArea);
var dragOverlay = document.createElement('div');
dragOverlay.className = 'drag-fix-element';
mainWrapper.appendChild(dragOverlay);


// Initialize status and information display elements
var statusMonitor = {};

// Panorama meta-information section
statusMonitor.container = document.createElement('div');
statusMonitor.container.className = 'view-information';
statusMonitor.caption = document.createElement('div');
statusMonitor.caption.className = 'caption-box';
statusMonitor.container.appendChild(statusMonitor.caption);
statusMonitor.creator = document.createElement('div');
statusMonitor.creator.className = 'creator-box';
statusMonitor.container.appendChild(statusMonitor.creator);
mainWrapper.appendChild(statusMonitor.container);

// Loading progress section
statusMonitor.loadingIndicator = {};
statusMonitor.loadingIndicator.box = document.createElement('div');
statusMonitor.loadingIndicator.box.className = 'loading-panel';
statusMonitor.loadingIndicator.box.innerHTML = '<p>Preparing...</p>';
statusMonitor.loadingIndicator.spinnerBox = document.createElement('div');
statusMonitor.loadingIndicator.spinnerBox.className = 'spinnerBox';
statusMonitor.loadingIndicator.spinnerBox.innerHTML = '<div class="spinner-animation"></div>';
statusMonitor.loadingIndicator.box.appendChild(statusMonitor.loadingIndicator.spinnerBox);
statusMonitor.loadingIndicator.progressBar = document.createElement('div');
statusMonitor.loadingIndicator.progressBar.className = 'progressBar';
statusMonitor.loadingIndicator.progressFill = document.createElement('div');
statusMonitor.loadingIndicator.progressFill.className = 'progress-fill';
statusMonitor.loadingIndicator.progressBar.appendChild(statusMonitor.loadingIndicator.progressFill);
statusMonitor.loadingIndicator.box.appendChild(statusMonitor.loadingIndicator.progressBar);
statusMonitor.loadingIndicator.progressMessage = document.createElement('p');
statusMonitor.loadingIndicator.progressMessage.className = 'progress-message';
statusMonitor.loadingIndicator.box.appendChild(statusMonitor.loadingIndicator.progressMessage);
mainWrapper.appendChild(statusMonitor.loadingIndicator.box);

// Error message display area
statusMonitor.errorMessagePanel = document.createElement('div');
statusMonitor.errorMessagePanel.className = 'error-alert info-box-style';
mainWrapper.appendChild(statusMonitor.errorMessagePanel);


// Create interactive user controls
var userControls = {};

// Load content button
userControls.loadButton = document.createElement('div');
userControls.loadButton.className = 'initiate-button';
userControls.loadButton.innerHTML = '<p>Click to<br>Start<br>Viewer<p>';
userControls.loadButton.addEventListener('click', initiateView);
mainWrapper.appendChild(userControls.loadButton);

// Magnification (zoom) controls
userControls.magnificationControls = document.createElement('div');
userControls.magnificationControls.className = 'zoom-group controls';
userControls.magnifyInButton = document.createElement('div');
userControls.magnifyInButton.className = 'zoom-in-icon sprite control';
userControls.magnifyInButton.addEventListener('click', increaseMagnification);
userControls.magnificationControls.appendChild(userControls.magnifyInButton);
userControls.magnifyOutButton = document.createElement('div');
userControls.magnifyOutButton.className = 'zoom-out-icon sprite control';
userControls.magnifyOutButton.addEventListener('click', decreaseMagnification);
userControls.magnificationControls.appendChild(userControls.magnifyOutButton);
mainWrapper.appendChild(userControls.magnificationControls);

// Fullscreen toggle button
userControls.fullScreenToggle = document.createElement('div');
userControls.fullScreenToggle.addEventListener('click', toggleDisplayMode);
userControls.fullScreenToggle.className = 'fullscreen-button sprite fullscreen-button-inactive controls control';
mainWrapper.appendChild(userControls.fullScreenToggle);

// Orientation indicator (compass)
var orientationIndicator = document.createElement('div');
orientationIndicator.className = 'orientation-widget controls control';
mainWrapper.appendChild(orientationIndicator);

// Initial processing of URL parameters
processURLOptions();

// Main function to set up and start the viewer
function initializeViewer() {
    // Show an error for unsupported IE versions (like IE9)
    var testDiv = document.createElement("div");
    testDiv.innerHTML = "<!--[if lte IE 9]><i></i><![endif]-->";
    if (testDiv.getElementsByTagName("i").length == 1) {
        displayError();
    }
    
    var idx, pathSegment;
    
    // Determine the type of panoramic content and prepare the source
    if (settings.sourceType == 'cubemap') {
        panoramaSource = [];
        for (idx = 0; idx < 6; idx++) {
            panoramaSource.push(new Image());
            panoramaSource[idx].crossOrigin = 'anonymous'; // Enable cross-origin loading
        }
        statusMonitor.loadingIndicator.spinnerBox.style.display = 'block';
        statusMonitor.loadingIndicator.progressBar.style.display = 'none';
    } else if (settings.sourceType == 'multires') {
        var copySettings = JSON.parse(JSON.stringify(settings.multiResolution)); // Deep copy
        if (settings.basePath && settings.multiResolution.basePath) { // Construct base path if available
            copySettings.basePath = settings.basePath + settings.multiResolution.basePath;
        } else if (settings.basePath) {
            copySettings.basePath = settings.basePath;
        } else if (journeyOptions.basePath && settings.multiResolution.basePath) {
            copySettings.basePath = journeyOptions.basePath + settings.multiResolution.basePath;
        } else if (journeyOptions.basePath) {
            copySettings.basePath = journeyOptions.basePath;
        }
        panoramaSource = copySettings;
    } else {
        if (settings.isVideoContent === true) {
            panoramaSource = document.createElement('video'); // Video element for video panoramas
            statusMonitor.loadingIndicator.spinnerBox.style.display = 'block';
            statusMonitor.loadingIndicator.progressBar.style.display = 'none';
        } else {
            panoramaSource = new Image(); // Image element for still panoramas
        }
    }
    
    // Callback function once the panorama media is loaded
    function onMediaLoaded() {
        visualizer = new projectview.renderer(displayArea, panoramaSource, settings.sourceType, settings.isVideoContent);
        
        // Attach event listeners only once to prevent duplicates
        if (!eventHandlersAttached) {
            eventHandlersAttached = true;
            document.addEventListener('pointerdown', handlePointerDown, false);
            document.addEventListener('pointermove', handlePointerMove, false);
            document.addEventListener('pointerup', handlePointerUp, false);
            document.addEventListener('wheel', handleWheelScroll, false); // Standard wheel event
            document.addEventListener('DOMMouseScroll', handleWheelScroll, false); // Firefox specific
            document.addEventListener('onresize', handleWindowResize, false);
            document.addEventListener('mozfullscreenchange', handleFullScreenChange, false);
            document.addEventListener('webkitfullscreenchange', handleFullScreenChange, false);
            document.addEventListener('msfullscreenchange', handleFullScreenChange, false);
            document.addEventListener('fullscreenchange', handleFullScreenChange, false);
            window.addEventListener('resize', handleWindowResize, false);
            document.addEventListener('keydown', handleKeyPress, false);
            document.addEventListener('keyup', handleKeyRelease, false);
            window.addEventListener('blur', resetKeys, false); // Clear keys on window blur
            document.addEventListener('mouseout', handlePointerUp, false); // Release interaction on mouseout
            document.addEventListener('touchstart', handleTouchStart, false);
            document.addEventListener('touchmove', handleTouchMove, false);
            document.addEventListener('touchend', handleTouchEnd, false);
        }
        
        renderSetup(); // Initialize rendering loop
        setTimeout(function(){timedOutFlag = true;}, 500); // Set a timeout flag
    }
    
    // Utility function to check if a URL is absolute
    var isAbsoluteURL = function(urlIdentifier) {
        return new RegExp('^(?:[a-z]+:)?//', 'i').test(urlIdentifier);
    };
    
    // Configure media loading based on content type
    if (settings.sourceType == 'cubemap') {
        // Counter for cubemap images to ensure all are loaded
        var remainingItems = 6;
        
        var onItemLoad = function() {
            remainingItems--;
            if (remainingItems === 0) {
                onMediaLoaded();
            }
        };
        
        var onLoadingError = function(e) {
            var linkElem = document.createElement('a');
            linkElem.href = e.target.src;
            linkElem.innerHTML = linkElem.href;
            displayError('The resource ' + linkElem.outerHTML + ' could not be accessed.');
        };
        
        for (idx = 0; idx < panoramaSource.length; idx++) {
            panoramaSource[idx].onload = onItemLoad;
            panoramaSource[idx].onerror = onLoadingError;
            pathSegment = settings.cubeMap[idx];
            if (settings.basePath && !isAbsoluteURL(pathSegment)) {
                pathSegment = settings.basePath + pathSegment;
            } else if (journeyOptions.basePath && !isAbsoluteURL(pathSegment)) {
                pathSegment = journeyOptions.basePath + pathSegment;
            }
            panoramaSource[idx].src = pathSegment;
        }
    } else if (settings.sourceType == 'multires') {
        onMediaLoaded(); // Multi-resolution loads differently, so callback immediately
    } else {
        pathSegment = '';
        if (settings.basePath) {
            pathSegment = settings.basePath;
        } else if (journeyOptions.basePath) {
            pathSegment = journeyOptions.basePath;
        }
        
        if (settings.isVideoContent === true) {
            panoramaSource.addEventListener('loadeddata', function() {
                panoramaSource.play(); // Start video playback
                onMediaLoaded();
            });
            for (idx = 0; idx < settings.mediaSources.length; idx++) {
                if (panoramaSource.canPlayType(settings.mediaSources[idx].type).length > 0) {
                    panoramaSource.crossOrigin = 'anonymous';
                    panoramaSource.src = isAbsoluteURL(settings.mediaSources[idx].file) ? settings.mediaSources[idx].file : pathSegment + settings.mediaSources[idx].file;
                    break;
                }
            }
            if (panoramaSource.src.length < 1) {
                // No supported video format found
                console.warn('Warning: provided video formats are not supported');
                displayError('Your browser does not support any of the provided' +
                    ' video formats. Please try using a different browser or' +
                    ' device.');
            }
        } else {
            // Still image loading path
            pathSegment = isAbsoluteURL(settings.panoramaPath) ? settings.panoramaPath : pathSegment + settings.panoramaPath;
            
            panoramaSource.onload = function() {
                window.URL.revokeObjectURL(this.src); // Clean up blob URL
                onMediaLoaded();
            };
            
            var httpRequest = new XMLHttpRequest();
            httpRequest.onloadend = function() {
                if (httpRequest.status != 200) {
                    // Display error if image fails to load
                    var linkElem = document.createElement('a');
                    linkElem.href = pathSegment;
                    linkElem.innerHTML = linkElem.href;
                    displayError('The resource ' + linkElem.outerHTML + ' could not be accessed.');
                }
                var mediaBlob = this.response;
                processXMPMetadata(mediaBlob); // Parse embedded XMP metadata
                statusMonitor.loadingIndicator.progressMessage.innerHTML = '';
            };
            httpRequest.onprogress = function(event) {
                if (event.lengthComputable) {
                    // Update progress bar
                    var completionPercentage = event.loaded / event.total * 100;
                    statusMonitor.loadingIndicator.progressFill.style.width = completionPercentage + '%';
                    var unitText, currentAmount, totalAmount;
                    if (event.total > 1e6) {
                        unitText = 'MB';
                        currentAmount = (event.loaded / 1e6).toFixed(2);
                        totalAmount = (event.total / 1e6).toFixed(2);
                    } else if (event.total > 1e3) {
                        unitText = 'kB';
                        currentAmount = (event.loaded / 1e3).toFixed(1);
                        totalAmount = (event.total / 1e3).toFixed(1);
                    } else {
                        unitText = 'B';
                        currentAmount = event.loaded;
                        totalAmount = event.total;
                    }
                    statusMonitor.loadingIndicator.progressMessage.innerHTML = currentAmount + ' / ' + totalAmount + ' ' + unitText;
                } else {
                    // Show spinner if progress is not computable
                    statusMonitor.loadingIndicator.spinnerBox.style.display = 'block';
                    statusMonitor.loadingIndicator.progressBar.style.display = 'none';
                }
            };
            httpRequest.open('GET', pathSegment, true);
            httpRequest.responseType = 'blob'; // Request as a blob to read metadata
            httpRequest.send();
        }
    }
    
    mainWrapper.classList.add('draggable-cursor'); // Set cursor for dragging
    mainWrapper.classList.remove('dragging-cursor');
}

// Function to parse Google Photo Sphere XMP Metadata from an image blob
// Refer to: https://developers.google.com/photo-sphere/metadata/
function processXMPMetadata(mediaBlob) {
    var fileReader = new FileReader();
    fileReader.addEventListener('loadend', function() {
        var fileContent = fileReader.result;
        
        var startPoint = fileContent.indexOf('<x:xmpmeta');
        if (startPoint > -1 && settings.ignoreXMP !== true) {
            var metadataString = fileContent.substring(startPoint, fileContent.indexOf('</x:xmpmeta>') + 12);
            
            // Helper to extract a specific tag value from XMP data
            var extractTagValue = function(tagKey) {
                var valueResult = metadataString.substring(metadataString.indexOf(tagKey + '="') + tagKey.length + 2);
                valueResult = valueResult.substring(0, valueResult.indexOf('"'));
                if (valueResult.length === 0) {
                    return null;
                }
                return Number(valueResult);
            };
            
            // Extract relevant XMP fields
            var extractedMetadata = {
                fullWidthPixels: extractTagValue('GPano:FullPanoWidthPixels'),
                croppedWidthPixels: extractTagValue('GPano:CroppedAreaImageWidthPixels'),
                fullHeightPixels: extractTagValue('GPano:FullPanoHeightPixels'),
                croppedHeightPixels: extractTagValue('GPano:CroppedAreaImageHeightPixels'),
                croppedTopPixels: extractTagValue('GPano:CroppedAreaTopPixels'),
                poseHeading: extractTagValue('GPano:PoseHeadingDegrees')
            };
            
            if (extractedMetadata.fullWidthPixels !== null && extractedMetadata.croppedWidthPixels !== null &&
                extractedMetadata.fullHeightPixels !== null && extractedMetadata.croppedHeightPixels !== null &&
                extractedMetadata.croppedTopPixels !== null) {
                
                // Update viewer settings based on GPano XMP data
                settings.totalHorizontalAngle = extractedMetadata.croppedWidthPixels / extractedMetadata.fullWidthPixels * 360;
                settings.totalVerticalAngle = extractedMetadata.croppedHeightPixels / extractedMetadata.fullHeightPixels * 180;
                settings.verticalOffset = ((extractedMetadata.croppedTopPixels + extractedMetadata.croppedHeightPixels / 2) / extractedMetadata.fullHeightPixels - 0.5) * -180;
                if (extractedMetadata.poseHeading !== null) {
                    // Adjust north offset; consider making this work for partial panoramas
                    settings.compassOffset = extractedMetadata.poseHeading;
                    if (settings.displayCompass !== false) {
                        settings.displayCompass = true;
                    }
                }
                
                // Future: support for initial view settings from XMP
            }
        }
        
        // Load the panorama image from the created object URL
        panoramaSource.src = window.URL.createObjectURL(mediaBlob);
    });
    fileReader.readAsText(mediaBlob); // Read blob as text to parse XMP
}

// Displays an error message to the user
function displayError(issueText) {
    if (issueText !== undefined) {
        statusMonitor.errorMessagePanel.innerHTML = '<p>' + issueText + '</p>';
    } else {
        statusMonitor.errorMessagePanel.innerHTML = '<p>Your browser lacks the necessary WebGL capabilities to render this panorama.</p>';
    }
    userControls.loadButton.style.display = 'none';
    statusMonitor.loadingIndicator.box.style.display = 'none';
    statusMonitor.errorMessagePanel.style.display = 'table';
    hasIssue = true; // Set error flag
    displayArea.style.display = 'none'; // Hide the renderer
}

// Clears any displayed error messages
function resetErrors() {
    statusMonitor.loadingIndicator.box.style.display = 'none';
    statusMonitor.errorMessagePanel.style.display = 'none';
    hasIssue = false;
}

// Handles the context menu (right-click) event
function onContextClick(evt) {
    infoLabel.style.left = evt.clientX + 'px';
    infoLabel.style.top = evt.clientY + 'px';
    clearTimeout(onContextClick.timerOne);
    clearTimeout(onContextClick.timerTwo);
    infoLabel.style.display = 'block';
    infoLabel.style.opacity = 1;
    onContextClick.timerOne = setTimeout(function() {infoLabel.style.opacity = 0;}, 2000);
    onContextClick.timerTwo = setTimeout(function() {infoLabel.style.display = 'none';}, 2500);
    evt.preventDefault(); // Prevent default context menu
}

// Handles pointer down (mouse click or touch start) events
function handlePointerDown(evt) {
    // Override browser's default actions
    evt.preventDefault();
    // Ensure window focus is maintained
    window.focus();
    
    // Only proceed if the content is fully loaded
    if (!contentReady) {
        return;
    }
    
    // Log coordinates for hotspot debugging if enabled
    if (settings.hotspotDebugging) {
        var normalizedX = evt.clientX / visualizer.canvasElement.width * 2 - 1;
        var normalizedY = (1 - evt.clientY / visualizer.canvasElement.height * 2) * visualizer.canvasElement.height / visualizer.canvasElement.width;
        var focalLength = 1 / Math.tan(settings.horizontalFieldOfView * Math.PI / 360);
        var sinPitch = Math.sin(settings.verticalAngle * Math.PI / 180);
        var cosPitch = Math.cos(settings.verticalAngle * Math.PI / 180);
        var calculatedA = focalLength * cosPitch - normalizedY * sinPitch;
        var calculatedRoot = Math.sqrt(normalizedX*normalizedX + calculatedA*calculatedA);
        var calculatedPitch = Math.atan((normalizedY * cosPitch + focalLength * sinPitch) / calculatedRoot) * 180 / Math.PI;
        var calculatedYaw = Math.atan2(normalizedX / calculatedRoot, calculatedA / calculatedRoot) * 180 / Math.PI + settings.horizontalAngle;
        console.log('Pitch: ' + calculatedPitch + ', Yaw: ' + calculatedYaw);
    }
    
    // Disable auto-rotation if user interacts
    settings.autoRotationEnabled = false;
    
    isUserEngaged = true;
    lastActivityTime = Date.now();
    
    initialClickX = evt.clientX;
    initialClickY = evt.clientY;
    
    initialViewYaw = settings.horizontalAngle;
    initialViewPitch = settings.verticalAngle;
    
    mainWrapper.classList.add('dragging-cursor'); // Change cursor to 'grabbing'
    mainWrapper.classList.remove('draggable-cursor'); // Remove default drag cursor
    
    startAnimationCycle(); // Ensure animation loop is active
}

// Handles pointer move (mouse move or touch move) events
function handlePointerMove(evt) {
    if (isUserEngaged && contentReady) {