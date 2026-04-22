// This module, 'ImageEnhancer', provides a jQuery plugin for applying dynamic visual effects
// to image elements using the HTML5 Canvas API. It supports effects like grayscale,
// color inversion, and a subtle blur.
//
// Project Name: ImageEnhancer
// Version: 1.1.0
// License: Custom (Derived from MIT-like)
// Author: A. Coder (Original concept by Ilias Iovis)
// Date: October 27, 2023
//
// This utility is designed for flexibility, allowing customization of effects,
// overlay positioning, and animation timings to seamlessly integrate into web designs.

(function (jQ) {

    // Attach the main plugin function to jQuery's prototype.
    jQ.fn.imageEnhancer = function (effectSettings) {

        // --- Core Configuration and Default Values ---
        // Establish a comprehensive set of default operational parameters.
        const defaultEffectParameters = {
            'appliedFilter': "grayscale",      // Specifies the visual effect: 'grayscale', 'invert', 'blur'.
            'canvasLayerPosition': "top",      // Determines if the canvas overlay is 'top' or 'bottom'.
            'containerWrapperClass': "img-effect-container", // CSS class for the generated parent div.
            'sizeHandling': "responsive",      // How dimensions are managed: 'responsive', fixed width (e.g., 500), or 'inherit'.
            'fixedPixelHeight': "auto",        // Only applicable with fixed 'sizeHandling'.
            'forceAspectRatioStretch': false,  // If true, image/canvas will stretch to fill fixed dimensions.
            'animationSpeedIn': "medium",      // Fade-in duration: 'slow', 'fast', 'medium', or numerical milliseconds.
            'animationSpeedOut': "medium"      // Fade-out duration: 'slow', 'fast', 'medium', or numerical milliseconds.
        };

        // Internal mapping for common animation speed keywords to milliseconds.
        const animationDurationMappings = {
            'slow': 600,
            'medium': 300,
            'fast': 150
        };

        // Deep merge user-provided settings with the established defaults.
        let mergedConfiguration = jQ.extend(true, {}, defaultEffectParameters, effectSettings);

        // Convert string-based animation speed settings into numerical milliseconds.
        mergedConfiguration.animationSpeedIn = typeof mergedConfiguration.animationSpeedIn === 'string'
            ? animationDurationMappings[mergedConfiguration.animationSpeedIn.toLowerCase()] || animationDurationMappings.medium
            : mergedConfiguration.animationSpeedIn;
        mergedConfiguration.animationSpeedOut = typeof mergedConfiguration.animationSpeedOut === 'string'
            ? animationDurationMappings[mergedConfiguration.animationSpeedOut.toLowerCase()] || animationDurationMappings.medium
            : mergedConfiguration.animationSpeedOut;


        // --- Global CSS Workaround for `max-width` Rendering Anomalies ---
        // This addresses a specific browser rendering glitch that can occur when
        // dynamically manipulating image and canvas elements in conjunction with `max-width`.
        let globalMaxWidthTemporarilyDisabled = false;
        if (jQ('img').css('maxWidth') !== "none") {
            jQ('img').css('maxWidth', "none");
            globalMaxWidthTemporarilyDisabled = true;
        }


        // --- Pixel Manipulation Helper Functions ---

        /**
         * Transforms pixel data to a grayscale representation using a common luminance formula.
         * @param {Uint8ClampedArray} rgbaPixelData - The raw RGBA pixel array from ImageData.
         */
        const applyGrayscaleFilter = (rgbaPixelData) => {
            const totalPixels = rgbaPixelData.length;
            for (let pixelIndex = 0; pixelIndex < totalPixels; pixelIndex += 4) {
                // Compute luminance (perceived brightness) from RGB components.
                const brightnessValue = (rgbaPixelData[pixelIndex] * 0.2126) + // Red contribution
                                        (rgbaPixelData[pixelIndex + 1] * 0.7152) + // Green contribution
                                        (rgbaPixelData[pixelIndex + 2] * 0.0722);  // Blue contribution

                rgbaPixelData[pixelIndex] = brightnessValue;     // Set Red channel
                rgbaPixelData[pixelIndex + 1] = brightnessValue; // Set Green channel
                rgbaPixelData[pixelIndex + 2] = brightnessValue; // Set Blue channel
                // Alpha (rgbaPixelData[pixelIndex + 3]) remains untouched.
            }
        };

        /**
         * Inverts the colors of the provided pixel data.
         * @param {Uint8ClampedArray} rgbaPixelData - The raw RGBA pixel array from ImageData.
         */
        const applyColorInversionFilter = (rgbaPixelData) => {
            const totalPixels = rgbaPixelData.length;
            for (let pixelIndex = 0; pixelIndex < totalPixels; pixelIndex += 4) {
                rgbaPixelData[pixelIndex] = 255 - rgbaPixelData[pixelIndex];         // Invert Red
                rgbaPixelData[pixelIndex + 1] = 255 - rgbaPixelData[pixelIndex + 1]; // Invert Green
                rgbaPixelData[pixelIndex + 2] = 255 - rgbaPixelData[pixelIndex + 2]; // Invert Blue
                // Alpha (rgbaPixelData[pixelIndex + 3]) remains untouched.
            }
        };

        /**
         * Implements a simple blur effect by repeatedly drawing the source image
         * with slight offsets and a reduced global alpha.
         * @param {CanvasRenderingContext2D} renderingContext - The 2D rendering context of the target canvas.
         * @param {HTMLImageElement} sourceDOMImage - The original HTML image element.
         * @param {number} finalWidth - The target width for drawing.
         * @param {number} finalHeight - The target height for drawing.
         */
        const executeCanvasBlur = (renderingContext, sourceDOMImage, finalWidth, finalHeight) => {
            // Temporarily reduce the global transparency for drawing operations.
            // This low value (e.g., 1/16) allows multiple draws to blend subtly.
            renderingContext.globalAlpha = 0.0625;

            // Iterate over a small grid of offsets around the center.
            // Each iteration draws a slightly shifted, semi-transparent copy of the image.
            for (let verticalShift = -3; verticalShift <= 3; verticalShift += 1) {
                for (let horizontalShift = -3; horizontalShift <= 3; horizontalShift += 1) {
                    renderingContext.drawImage(sourceDOMImage, horizontalShift, verticalShift, finalWidth, finalHeight);
                }
            }
            // Restore full opacity for subsequent drawing operations.
            renderingContext.globalAlpha = 1.0;
        };


        // --- Process Each Selected Image Element ---
        this.each(function () {
            const currentDOMImage = jQ(this);

            // Guard clause: Ensure the selected element is an image and has a source attribute.
            if (!currentDOMImage.is('img') || !currentDOMImage.attr('src')) {
                console.warn("ImageEnhancer: Skipping element as it's not a valid image or lacks a 'src' attribute.", this);
                return; // Proceed to the next element in the collection.
            }

            // --- Construct the DOM Structure ---
            // Create a wrapper div to contain both the original image and the canvas.
            const wrapperElement = jQ(`<div class="${mergedConfiguration.containerWrapperClass}"></div>`);
            currentDOMImage.wrap(wrapperElement); // Enclose the image within the new wrapper.

            const parentWrapper = currentDOMImage.parent(`.${mergedConfiguration.containerWrapperClass}`);
            // Apply essential CSS for relative positioning of children and potential overflow handling.
            parentWrapper.css({ 'position': 'relative', 'overflow': 'hidden' });

            // Create the canvas element that will host the visual effect.
            const effectCanvasElement = jQ('<canvas class="effect-layer"></canvas>');
            parentWrapper.append(effectCanvasElement); // Add the canvas as a sibling to the image.

            const rawCanvasElement = effectCanvasElement.get(0);
            // Guard clause: Check for canvas API support in the browser.
            if (!rawCanvasElement || !rawCanvasElement.getContext) {
                console.error("ImageEnhancer: HTML5 Canvas not supported or context unavailable for:", this);
                return; // Cannot proceed without Canvas support.
            }
            const canvas2DContext = rawCanvasElement.getContext("2d");

            // --- Manage Z-Index for Layer Positioning ---
            // Store the image's original z-index to allow for potential restoration or debugging.
            const initialZIndex = currentDOMImage.css('z-index');
            currentDOMImage.data('original-z-index', initialZIndex);

            if (mergedConfiguration.canvasLayerPosition === "top") {
                currentDOMImage.css({ 'z-index': 1 }); // Image is below
                effectCanvasElement.css({ 'position': 'absolute', 'top': 0, 'left': 0, 'z-index': 2 }); // Canvas on top, visible by default
            } else { // 'bottom'
                currentDOMImage.css({ 'z-index': 2 }); // Image is above
                effectCanvasElement.css({ 'position': 'absolute', 'top': 0, 'left': 0, 'z-index': 1, 'display': 'none' }); // Canvas on bottom, hidden initially
            }

            // --- Determine Element Dimensions ---
            // Retrieve the intrinsic (natural) dimensions of the source image.
            const intrinsicImageWidth = currentDOMImage[0].naturalWidth;
            const intrinsicImageHeight = currentDOMImage[0].naturalHeight;

            let calculatedTargetWidth = intrinsicImageWidth;
            let calculatedTargetHeight = intrinsicImageHeight;

            // Apply sizing logic based on configuration.
            if (mergedConfiguration.sizeHandling === "responsive") {
                // Set max-width to 100% for responsive behavior, letting CSS handle scaling.
                effectCanvasElement.css({ 'max-width': '100%', 'height': 'auto' });
                currentDOMImage.css({ 'max-width': '100%', 'height': 'auto' });
                parentWrapper.css({ 'width': '100%', 'height': 'auto' });
                // Canvas base dimensions still need to be set for drawing.
                rawCanvasElement.width = intrinsicImageWidth;
                rawCanvasElement.height = intrinsicImageHeight;
            } else if (mergedConfiguration.sizeHandling === "inherit") {
                // Inherit the currently rendered dimensions of the image.
                calculatedTargetWidth = currentDOMImage.width();
                calculatedTargetHeight = currentDOMImage.height();
                rawCanvasElement.width = calculatedTargetWidth;
                rawCanvasElement.height = calculatedTargetHeight;
                parentWrapper.css({ 'width': calculatedTargetWidth, 'height': calculatedTargetHeight });
            } else { // Fixed width specified by user
                calculatedTargetWidth = parseInt(mergedConfiguration.sizeHandling, 10);
                // Calculate height: maintain aspect ratio if 'auto', otherwise use fixed height.
                if (mergedConfiguration.fixedPixelHeight === "auto") {
                    calculatedTargetHeight = (intrinsicImageHeight / intrinsicImageWidth) * calculatedTargetWidth;
                } else {
                    calculatedTargetHeight = parseInt(mergedConfiguration.fixedPixelHeight, 10);
                }

                rawCanvasElement.width = calculatedTargetWidth;
                rawCanvasElement.height = calculatedTargetHeight;

                if (!mergedConfiguration.forceAspectRatioStretch) {
                    // Maintain aspect ratio, allowing content to crop if larger than container.
                    parentWrapper.css({ 'width': calculatedTargetWidth, 'height': calculatedTargetHeight, 'overflow': 'hidden' });
                    currentDOMImage.css({ 'width': 'auto', 'height': 'auto', 'max-width': 'none' });
                } else {
                    // Stretch image and canvas to precisely fill the fixed dimensions.
                    parentWrapper.css({ 'width': calculatedTargetWidth, 'height': calculatedTargetHeight });
                    currentDOMImage.css({ 'width': calculatedTargetWidth, 'height': calculatedTargetHeight });
                }
            }

            // --- Initial Image Drawing onto Canvas ---
            // Draw the original image onto the canvas, scaled to its determined dimensions.
            canvas2DContext.drawImage(currentDOMImage.get(0), 0, 0, rawCanvasElement.width, rawCanvasElement.height);

            // --- Apply Configured Visual Effect ---
            let imageDataContainer = null;
            let pixelDataArrayRef = null;

            // The blur effect directly manipulates the canvas context and does not use `getImageData`/`putImageData`.
            if (mergedConfiguration.appliedFilter !== 'blur') {
                try {
                    // Attempt to retrieve pixel data for manipulation.
                    imageDataContainer = canvas2DContext.getImageData(0, 0, rawCanvasElement.width, rawCanvasElement.height);
                    pixelDataArrayRef = imageDataContainer.data;
                } catch (accessError) {
                    // Handle potential security errors (e.g., cross-origin image loading).
                    if (typeof netscape !== 'undefined' && netscape.security && netscape.security.PrivilegeManager) {
                        try {
                            // Attempt privilege escalation for Firefox-specific scenarios.
                            netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
                            imageDataContainer = canvas2DContext.getImageData(0, 0, rawCanvasElement.width, rawCanvasElement.height);
                            pixelDataArrayRef = imageDataContainer.data;
                        } catch (escalationError) {
                            console.error("ImageEnhancer: Failed to access image data even with privilege escalation for:", this, escalationError);
                            return; // Cannot apply pixel-based effects.
                        }
                    } else {
                        console.error("ImageEnhancer: Unable to access image pixel data (likely a CORS security restriction) for:", this, accessError);
                        return; // Cannot apply pixel-based effects.
                    }
                }
            }

            // Execute the specific filter based on the 'appliedFilter' setting.
            switch (mergedConfiguration.appliedFilter) {
                case "invert":
                    if (pixelDataArrayRef) applyColorInversionFilter(pixelDataArrayRef);
                    break;
                case "blur":
                    executeCanvasBlur(canvas2DContext, currentDOMImage.get(0), rawCanvasElement.width, rawCanvasElement.height);
                    break;
                case "grayscale": // Default behavior if no specific filter is set or recognized.
                default:
                    if (pixelDataArrayRef) applyGrayscaleFilter(pixelDataArrayRef);
                    break;
            }

            // If pixel data was modified (i.e., not a blur effect), write it back to the canvas.
            if (imageDataContainer && mergedConfiguration.appliedFilter !== 'blur') {
                canvas2DContext.putImageData(imageDataContainer, 0, 0);
            }


            // --- Implement Hover Interaction for Fade Effect ---
            parentWrapper.hover(
                // Mouse enters the container area
                function () {
                    if (mergedConfiguration.canvasLayerPosition === "top") {
                        effectCanvasElement.stop(true, true).fadeOut(mergedConfiguration.animationSpeedOut);
                    } else { // 'bottom'
                        effectCanvasElement.stop(true, true).fadeIn(mergedConfiguration.animationSpeedOut);
                    }
                },
                // Mouse leaves the container area
                function () {
                    if (mergedConfiguration.canvasLayerPosition === "top") {
                        effectCanvasElement.stop(true, true).fadeIn(mergedConfiguration.animationSpeedIn);
                    } else { // 'bottom'
                        effectCanvasElement.stop(true, true).fadeOut(mergedConfiguration.animationSpeedIn);
                    }
                }
            ); // End of hover event binding

        }); // End of this.each() iteration


        // --- Final Cleanup: Restore `max-width` if it was modified ---
        if (globalMaxWidthTemporarilyDisabled) {
            jQ('img').css('maxWidth', "100%");
        }

        // Return the jQuery object to maintain chainability.
        return this;
    };

})(jQuery);