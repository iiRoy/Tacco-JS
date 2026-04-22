const ImageMotionController = (userConfiguration) => {
    'use strict'; // Enforce strict parsing and error handling

    // --- Core Module Variables ---
    let primaryAssetSrc = userConfiguration.url;
    let fallbackAssetSrc = userConfiguration.lowResUrl;
    let displayElement = userConfiguration.container || document.body; // Main DOM element for display
    let currentOrientationValue = 0; // Stores the latest calculated tilt angle
    let resizeTimerId = 0; // Identifier for the resize debounce timeout
    let motionDisabled = false; // Flag to enable/disable tilt responsiveness
    let viewDimensions = {}; // Stores width/height of the display area
    let assetMetadata = {}; // Stores image dimensions and aspect ratio
    let visualElement; // The actual <img> tag for the main image
    let assetLoader; // Temporary <img> used for preloading
    let overflowWidth = 0; // Calculated width difference between image and viewport
    let horizontalShiftBase = 0; // Base pixel offset for image translation
    let controlBarWidth = 0; // Width of the visual tilt indicator bar
    let controlIndicatorOffset = 0; // Offset for the indicator within the bar
    let controlIndicatorSize = 0; // Width of the movable indicator
    let controlIndicatorNode; // The DOM element for the tilt indicator
    let moduleSettings; // Internal configuration derived from userConfiguration

    // --- Module Configuration ---
    moduleSettings = {
        maximumDeviationAngle: userConfiguration.maxTilt || 20, // Max tilt angle in degrees
        useProgressiveLoad: !!userConfiguration.lowResUrl, // Boolean to enable two-phase loading
        invertMotionDirection: !!userConfiguration.reverseTilt // Boolean to reverse tilt effect
    };

    // --- Utility Function: Clamps a value within a min/max range ---
    const clampValue = (val, min, max) => Math.max(min, Math.min(val, max));

    // --- Initializer Function ---
    const initializeModule = () => {
        // Validate essential configuration before proceeding
        if (!displayElement || !(displayElement instanceof HTMLElement)) {
            console.error("ImageMotionController: Invalid or missing display container.");
            return; // Abort initialization
        }
        if (!primaryAssetSrc) {
            console.error("ImageMotionController: Primary image URL is missing.");
            return; // Abort initialization
        }

        const initialResourceIdentifier = moduleSettings.useProgressiveLoad ? fallbackAssetSrc : primaryAssetSrc;

        calculateViewDimensions(); // Determine the size of the display area

        fetchImageAsset(initialResourceIdentifier, () => {
            // Clone the loaded image for display; the loader can then be released
            visualElement = assetLoader.cloneNode(false);
            extractAssetMetadata(); // Get image properties
            assetLoader = null; // Free up the loader reference

            // If progressive loading is enabled, fetch the high-resolution image
            if (moduleSettings.useProgressiveLoad) {
                fetchImageAsset(primaryAssetSrc, () => {
                    visualElement.src = assetLoader.src; // Update displayed image with high-res
                    assetLoader = null; // Free up the high-res loader
                });
            }

            composeLayout(); // Build and arrange DOM elements
            attachInteractionHandlers(); // Set up event listeners
        });
    };

    // --- Animation Loop Function ---
    const animateVisualElement = () => {
        let currentDeviation = currentOrientationValue;
        let pixelDisplacement;

        // Clamp the tilt value within the configured maximum deviation
        currentDeviation = clampValue(
            currentDeviation,
            moduleSettings.maximumDeviationAngle * -1,
            moduleSettings.maximumDeviationAngle
        );

        // Invert the deviation if the setting is enabled
        if (!moduleSettings.invertMotionDirection) {
            currentDeviation *= -1;
        }

        // Calculate the pixel shift based on tilt and image overflow
        pixelDisplacement = (currentDeviation * horizontalShiftBase) / moduleSettings.maximumDeviationAngle;

        // Apply translation to the visual element
        applyHorizontalTranslation(visualElement, (horizontalShiftBase + pixelDisplacement) * -1);

        // Update the visual indicator bar
        synchronizeControlBar(currentDeviation);

        // Request the next animation frame
        window.requestAnimationFrame(animateVisualElement);
    };

    // --- Update Tilt Indicator Bar ---
    const synchronizeControlBar = (deviationValue) => {
        // Calculate indicator's pixel shift within the control bar
        const indicatorShift = (deviationValue * ((controlBarWidth - controlIndicatorSize) / 2)) / moduleSettings.maximumDeviationAngle;
        applyHorizontalTranslation(controlIndicatorNode, (controlIndicatorOffset + indicatorShift));
    };

    // --- Event Listener Setup ---
    const attachInteractionHandlers = () => {
        // Device orientation sensor handling
        if (window.DeviceOrientationEvent) {
            const gammaReadingsBuffer = []; // Buffer to average gamma values

            window.addEventListener('deviceorientation', (orientationData) => {
                if (!motionDisabled) {
                    // Maintain a rolling average of gamma readings for smoother motion
                    if (gammaReadingsBuffer.length > 8) {
                        gammaReadingsBuffer.shift(); // Remove oldest reading
                    }
                    gammaReadingsBuffer.push(orientationData.gamma); // Add new reading

                    currentOrientationValue = gammaReadingsBuffer.reduce((sum, val) => sum + val, 0) / gammaReadingsBuffer.length;
                }
            }, false);

            // Start the animation loop after device orientation is available
            window.requestAnimationFrame(animateVisualElement);
        } else {
            // If device orientation is not supported, disable motion and log
            motionDisabled = true;
            console.warn("Device orientation not supported. Tilt functionality disabled.");
        }

        // Window resize event handling (debounced)
        window.addEventListener('resize', () => {
            window.clearTimeout(resizeTimerId); // Clear any existing resize timer

            resizeTimerId = window.setTimeout(() => {
                calculateViewDimensions(); // Recalculate viewport dimensions
                displayElement.innerHTML = ''; // Clear existing content
                composeLayout(); // Re-render the layout
            }, 150); // Debounce for 150ms
        }, false);
    };

    // --- DOM Transformation Utility ---
    const applyHorizontalTranslation = (targetNode, translationValue) => {
        // Apply a horizontal CSS transform for smooth movement
        // Using `transform` directly is widely supported and handles prefixes internally
        targetNode.style.transform = `translateX(${Math.round(translationValue)}px)`;
    };

    // --- Layout Composition and Rendering ---
    const composeLayout = () => {
        // Ensure visualElement exists before proceeding
        if (!visualElement) {
            console.error("ImageMotionController: Visual element not ready for layout composition.");
            return;
        }

        const contentWrapper = document.createElement('div');
        contentWrapper.classList.add('motion-content-wrapper');

        // Set image height to fill the viewport, calculate scaled width
        visualElement.style.height = `${viewDimensions.height}px`;
        const scaledVisualWidth = (assetMetadata.aspectRatio * viewDimensions.height);

        // Calculate how much the image overflows the viewport
        overflowWidth = scaledVisualWidth - viewDimensions.width;
        horizontalShiftBase = overflowWidth / 2;

        // Create the visual tilt control bar
        const motionControlBar = document.createElement('div');
        motionControlBar.classList.add('motion-control-bar');
        const controlBarMargin = 20; // Padding for the control bar
        controlBarWidth = viewDimensions.width - controlBarMargin;
        motionControlBar.style.width = `${controlBarWidth}px`;

        // Create the movable indicator within the control bar
        controlIndicatorNode = document.createElement('div');
        controlIndicatorNode.classList.add('motion-indicator');

        // Calculate indicator size based on image overflow
        controlIndicatorSize = (viewDimensions.width * controlBarWidth) / scaledVisualWidth;
        controlIndicatorNode.style.width = `${controlIndicatorSize}px`;

        // Calculate initial offset for the indicator
        controlIndicatorOffset = ((controlBarWidth / 2) - (controlIndicatorSize / 2));

        // Update initial position
        animateVisualElement();

        // Determine if tilt is functionally possible (image wider than viewport)
        if (controlIndicatorOffset > 0) {
            motionDisabled = false;
            motionControlBar.appendChild(controlIndicatorNode);
            contentWrapper.appendChild(motionControlBar);
            displayElement.classList.remove('no-motion-transitions'); // Allow transitions
        } else {
            motionDisabled = true; // No overflow, no tilt needed
            currentOrientationValue = 0; // Reset tilt
            displayElement.classList.add('no-motion-transitions'); // Disable transitions for static view
        }

        // Add the image to the wrapper, then the wrapper to the display element
        contentWrapper.appendChild(visualElement);
        displayElement.appendChild(contentWrapper);
    };

    // --- Viewport Dimension Calculation ---
    const calculateViewDimensions = () => {
        if (!displayElement) {
            console.warn("Cannot calculate view dimensions: display element is null.");
            return;
        }
        const computedContainerStyle = window.getComputedStyle(displayElement, null);

        viewDimensions = {
            width: parseInt(computedContainerStyle.width, 10),
            height: parseInt(computedContainerStyle.height, 10)
        };
    };

    // --- Image Metadata Extraction ---
    const extractAssetMetadata = () => {
        if (!assetLoader) {
            console.warn("Cannot extract asset metadata: asset loader is null.");
            return;
        }
        assetMetadata = {
            width: assetLoader.naturalWidth, // Use naturalWidth/Height for original dimensions
            height: assetLoader.naturalHeight,
            aspectRatio: assetLoader.naturalWidth / assetLoader.naturalHeight,
            src: assetLoader.src
        };
    };

    // --- Image Preloading Function ---
    const fetchImageAsset = (sourcePath, onLoadedCallback) => {
        if (!sourcePath) {
            console.warn("ImageMotionController: No source path provided for asset loading.");
            // Optionally call callback with an error or just return
            return;
        }
        assetLoader = new Image();
        assetLoader.addEventListener('load', onLoadedCallback, { once: true }); // Use { once: true } for single-shot listener
        assetLoader.addEventListener('error', () => {
            console.error(`Failed to load image from: ${sourcePath}`);
            // Provide a fallback or indicate failure
            if (typeof onLoadedCallback === 'function') {
                onLoadedCallback(new Error(`Failed to load image ${sourcePath}`));
            }
        }, { once: true });
        assetLoader.src = sourcePath;
    };

    // Initialize the module when it's instantiated
    initializeModule();

    // Public API for the module
    return {
        getDisplayElement: () => displayElement, // Expose the main display element
        // Potentially add methods to dynamically change images, enable/disable motion, etc.
        // For now, just returning the container as per original.
    };
};