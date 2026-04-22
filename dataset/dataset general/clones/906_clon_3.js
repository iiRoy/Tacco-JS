/*
 *  mist-canvas.js - v2.0
 *  jQuery extension. Dynamic background vapor generator
 *  http://www.example.com/project-page
 *
 *  Crafted by CodeArchitects
 *
 *  Distributed under the Apache 2.0 License
 *
 *  Inspired by: creativecoding.net
 */

;(function ( jQuery, windowObject, documentObject, undefinedValue ) {

    // Unique identifier for this plugin module
    const MODULE_ID = "mistCanvas";

    // Default configuration parameters for the vapor effect
    const DEFAULT_SETTINGS = {
        // Vapor properties
        startColor: '#000000',           // Initial color for the vapor gradient
        endColor: '#222222',             // Final color for the vapor gradient
        vaporAlpha: 0.1,                 // Opacity level of the individual vapor elements
        particleCount: 1,                // Number of distinct vapor "circles"
        maxRadiusValue: 'auto',          // Maximum possible radius for a vapor element
        minRadiusValue: 'auto',          // Minimum possible radius for a vapor element
        minRadiusFactor: 0,              // Factor to determine inner radius based on max radius
        fractalIterations: 8,            // Number of fractal subdivision iterations for path generation
        drawPassesPerFrame: 10,          // How many individual vapor shapes to draw per animation frame
        strokeThickness: 2,              // Line width for drawing vapor shapes
        animationSpeed: 1,               // Overall animation speed multiplier
        // Background properties
        innerBackgroundColor: "#ffffff", // Inner color for the background radial gradient
        outerBackgroundColor: "#666666", // Outer color for the background radial gradient
    };

    // Pre-calculated constant for 2 * PI (full circle in radians)
    const FULL_CIRCLE_RADIANS = 2 * Math.PI;

    // Global reference for the animation frame, allows stopping it
    let animationFrameHandle = null;

    /**
     * @class MistGenerator
     * @description Main class responsible for generating and animating the vapor effect.
     * @param {HTMLElement} targetElement The DOM element to attach the canvas to.
     * @param {Object} userOptions User-defined configuration options.
     */
    function MistGenerator ( targetElement, userOptions ) {
        // Validate the target element before proceeding
        if (!targetElement || !(targetElement instanceof HTMLElement)) {
            console.error("MistGenerator: Invalid target element provided.");
            return;
        }

        this.hostElement = targetElement;
        this.$hostContainer = jQuery(targetElement);

        // Merge default settings with user-provided options
        this.effectSettings = jQuery.extend( {}, DEFAULT_SETTINGS, userOptions );

        // Initialize the effect components
        this.setupEffect();
    }

    /**
     * @prototype MistGenerator.prototype
     * @description Prototype methods for the MistGenerator class.
     */
    MistGenerator.prototype = {
        /**
         * @method setupEffect
         * @description Orchestrates the initial setup of the vapor effect.
         */
        setupEffect: function () {
            // Apply dynamic settings based on container size
            this.adjustDynamicSettings();
            // Prepare the canvas elements for drawing
            this.prepareDisplayCanvases();
            // Begin the vapor generation and animation
            this.commenceAnimation();
        },

        /**
         * @method adjustDynamicSettings
         * @description Calculates and sets 'auto' radius values based on the host element's dimensions.
         */
        adjustDynamicSettings: function () {
            const containerHeight = this.$hostContainer.height();
            const calculatedRadius = (containerHeight * 0.8) / 2; // 80% of height, halved for radius

            if (this.effectSettings.maxRadiusValue === 'auto') {
                this.effectSettings.maxRadiusValue = calculatedRadius;
            }
            if (this.effectSettings.minRadiusValue === 'auto') {
                this.effectSettings.minRadiusValue = calculatedRadius;
            }
        },

        /**
         * @method prepareDisplayCanvases
         * @description Configures the main drawing canvas and an off-screen canvas for exports.
         */
        prepareDisplayCanvases: function () {
            this.outputCanvas = this.$hostContainer.find('canvas').first();
            // Ensure a canvas element exists, or create one
            if (!this.outputCanvas.length) {
                this.outputCanvas = jQuery('<canvas>').appendTo(this.$hostContainer);
            }

            this.canvasWidth = this.$hostContainer[0].clientWidth;
            this.canvasHeight = this.$hostContainer[0].clientHeight;

            // Set canvas dimensions
            this.outputCanvas[0].width = this.canvasWidth;
            this.outputCanvas[0].height = this.canvasHeight;

            // Get 2D rendering context
            this.renderContext = this.outputCanvas[0].getContext("2d");
            if (!this.renderContext) {
                console.error("MistGenerator: 2D canvas context not supported or failed to retrieve.");
                return;
            }

            // Create an auxiliary canvas for potential image export operations
            this.exportTargetCanvas = documentObject.createElement('canvas');
            this.exportTargetCanvas.width = this.canvasWidth;
            this.exportTargetCanvas.height = this.canvasHeight;
            this.exportContext = this.exportTargetCanvas.getContext("2d");
        },

        /**
         * @method commenceAnimation
         * @description Initializes the drawing sequence, background, and starts the animation loop.
         */
        commenceAnimation: function () {
            this.currentDrawCounter = 0; // Reset frame drawing counter
            this.renderContext.setTransform(1, 0, 0, 1, 0, 0); // Reset canvas transform
            this.renderContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight); // Clear previous frame

            this.drawBackgroundGradient(); // Render the static background
            this.prepareParticles();       // Initialize vapor particle properties

            // Clear any existing animation frame request to prevent duplicates
            if (animationFrameHandle) {
                cancelAnimationFrame(animationFrameHandle);
            }
            // Start the animation loop using requestAnimationFrame for efficiency
            const animationLoop = () => {
                this.animateFrame();
                animationFrameHandle = requestAnimationFrame(animationLoop);
            };
            animationFrameHandle = requestAnimationFrame(animationLoop);
        },

        /**
         * @method drawBackgroundGradient
         * @description Fills the canvas with a radial background gradient.
         */
        drawBackgroundGradient: function () {
            const maxDimension = Math.max(this.canvasWidth, this.canvasHeight);
            const outerRadiusCalc = Math.sqrt(maxDimension * maxDimension + maxDimension * maxDimension) / 2; // Dynamic outer radius

            // Create an instance of our custom radial gradient class
            const backgroundGradient = new RadialColorizer(
                this.canvasWidth * 0.75, // x0
                this.canvasHeight / 2 * 0.75, // y0
                0, // r0
                this.canvasWidth / 2, // x1
                this.canvasHeight / 4, // y1
                outerRadiusCalc // r1
            );

            // Parse hex colors for inner and outer background
            const innerHex = this.effectSettings.innerBackgroundColor.replace('#', '');
            const rInner = parseInt(innerHex.substring(0, 2), 16);
            const gInner = parseInt(innerHex.substring(2, 4), 16);
            const bInner = parseInt(innerHex.substring(4, 6), 16);

            const outerHex = this.effectSettings.outerBackgroundColor.replace('#', '');
            const rOuter = parseInt(outerHex.substring(0, 2), 16);
            const gOuter = parseInt(outerHex.substring(2, 4), 16);
            const bOuter = parseInt(outerHex.substring(4, 6), 16);

            // Add color stops to the custom gradient
            backgroundGradient.addColorStop(0, rInner, gInner, bInner);
            backgroundGradient.addColorStop(1, rOuter, gOuter, bOuter);

            // Apply the gradient to fill the canvas rectangle
            backgroundGradient.fillRect(this.renderContext, 0, 0, this.canvasWidth, this.canvasHeight);
        },

        /**
         * @method prepareParticles
         * @description Initializes the properties for each vapor particle.
         */
        prepareParticles: function () {
            this.vaporParticles = []; // Array to hold all vapor particle objects
            const { particleCount, minRadiusFactor, maxRadiusValue, minRadiusValue, fractalIterations } = this.effectSettings;

            for (let i = 0; i < particleCount; i++) {
                // Determine random max and min radii for the current particle
                const particleMaxRad = minRadiusValue + Math.random() * (maxRadiusValue - minRadiusValue);
                const particleMinRad = minRadiusFactor * particleMaxRad;

                // Create a radial gradient for the vapor particle
                const particleGradient = this.renderContext.createRadialGradient(0, 0, particleMinRad, 0, 0, particleMaxRad);
                const gradientStartRGBA = this.convertHexToRgbaString(this.effectSettings.startColor, this.effectSettings.vaporAlpha);
                const gradientEndRGBA = this.convertHexToRgbaString(this.effectSettings.endColor, this.effectSettings.vaporAlpha);

                particleGradient.addColorStop(1, gradientStartRGBA);
                particleGradient.addColorStop(0, gradientEndRGBA);

                // Define initial properties for a new vapor particle
                const newParticle = {
                    centerX: -particleMaxRad, // Start off-screen to the left
                    centerY: this.canvasHeight / 2 - 50,
                    maxRad: particleMaxRad,
                    minRad: particleMinRad,
                    drawColor: particleGradient, // The gradient used for stroking
                    animationParam: 0, // Parameter for interpolating between fractal paths
                    paramChangeRate: 1 / 250, // Speed at which animationParam changes
                    fractalPhase: Math.random() * FULL_CIRCLE_RADIANS, // Individual phase for fractal rotation
                    globalPhase: Math.random() * FULL_CIRCLE_RADIANS // Overall phase for vertical oscillation
                };

                // Generate two fractal path lists for smooth interpolation
                newParticle.pathPoints1 = this.generateFractalPath(fractalIterations);
                newParticle.pathPoints2 = this.generateFractalPath(fractalIterations);

                this.vaporParticles.push(newParticle);
            }
        },

        /**
         * @method animateFrame
         * @description Executes drawing operations for a single animation frame.
         */
        animateFrame: function () {
            const { drawsPassesPerFrame, particleCount, strokeThickness, animationSpeed } = this.effectSettings;
            const horizontalSqueeze = 0.75; // Creates a pseudo-3D perspective effect

            // Execute multiple drawing passes per frame for continuous motion
            for (let j = 0; j < drawsPassesPerFrame; j++) {
                this.currentDrawCounter++;

                for (let i = 0; i < particleCount; i++) {
                    const currentParticle = this.vaporParticles[i];

                    // Update particle animation parameter
                    currentParticle.animationParam += currentParticle.paramChangeRate * animationSpeed;
                    if (currentParticle.animationParam >= 1) {
                        currentParticle.animationParam = 0; // Reset parameter
                        // Cycle fractal paths for continuous morphing
                        currentParticle.pathPoints1 = currentParticle.pathPoints2;
                        currentParticle.pathPoints2 = this.generateFractalPath(this.effectSettings.fractalIterations);
                    }

                    // Smooth interpolation factor using cosine
                    const interpolationFactor = 0.5 - 0.5 * Math.cos(Math.PI * currentParticle.animationParam);

                    this.renderContext.strokeStyle = currentParticle.drawColor;
                    this.renderContext.lineWidth = strokeThickness;
                    this.renderContext.beginPath();

                    let currentPoint1 = currentParticle.pathPoints1.head;
                    let currentPoint2 = currentParticle.pathPoints2.head;

                    // Increment particle's rotational phase
                    currentParticle.fractalPhase += 0.0002 * animationSpeed;

                    // Calculate current radius based on interpolated fractal points
                    let currentRadius = currentParticle.minRad + (currentPoint1.y + interpolationFactor * (currentPoint2.y - currentPoint1.y)) * (currentParticle.maxRad - currentParticle.minRad);

                    // Update particle's center position for movement
                    currentParticle.centerX += 0.5 * animationSpeed;
                    currentParticle.centerY += 0.04 * animationSpeed;

                    // Calculate vertical oscillation using global phase
                    const verticalOffset = 40 * Math.sin(currentParticle.globalPhase + this.currentDrawCounter / 1000 * FULL_CIRCLE_RADIANS);

                    // Stop animation if particle moves completely off-screen
                    if (currentParticle.centerX > this.canvasWidth + currentParticle.maxRad) {
                        cancelAnimationFrame(animationFrameHandle);
                        animationFrameHandle = null; // Clear handle
                        // Optionally, re-initialize or remove particle
                        // console.log("Particle off-screen, animation stopped.");
                        return; // Exit this frame's drawing if animation stops
                    }

                    // Apply transformation for drawing, moving with the particle
                    this.renderContext.setTransform(horizontalSqueeze, 0, 0, 1, currentParticle.centerX, currentParticle.centerY + verticalOffset);

                    // Initial point for the fractal path
                    let xCoord = horizontalSqueeze * currentRadius * Math.cos(currentParticle.fractalPhase);
                    let yCoord = currentRadius * Math.sin(currentParticle.fractalPhase);
                    this.renderContext.lineTo(xCoord, yCoord);

                    // Iterate through the linked list of fractal points to draw the curve
                    while (currentPoint1.next !== null) {
                        currentPoint1 = currentPoint1.next;
                        currentPoint2 = currentPoint2.next;

                        const pointAngle = FULL_CIRCLE_RADIANS * (currentPoint1.x + interpolationFactor * (currentPoint2.x - currentPoint1.x)) + currentParticle.fractalPhase;
                        currentRadius = currentParticle.minRad + (currentPoint1.y + interpolationFactor * (currentPoint2.y - currentPoint1.y)) * (currentParticle.maxRad - currentParticle.minRad);

                        xCoord = horizontalSqueeze * currentRadius * Math.cos(pointAngle);
                        yCoord = currentRadius * Math.sin(pointAngle);
                        this.renderContext.lineTo(xCoord, yCoord);
                    }

                    this.renderContext.closePath();
                    this.renderContext.stroke(); // Draw the vapor shape outline
                }
            }
        },

        /**
         * @method generateFractalPath
         * @description Creates a linked list of points representing a fractal curve using midpoint displacement.
         * @param {number} numIterations The number of subdivision iterations.
         * @returns {object} An object containing the head of the linked list of points.
         */
        generateFractalPath: function (numIterations) {
            if (numIterations < 0) numIterations = 0; // Ensure non-negative iterations

            const pointStructure = {};
            pointStructure.head = { x: 0, y: 1, next: null }; // Start point (0,1)
            let tailPoint = { x: 1, y: 1, next: null };       // End point (1,1)

            let overallMinY = 1;
            let overallMaxY = 1;

            pointStructure.head.next = tailPoint;

            // Perform midpoint displacement subdivision
            for (let i = 0; i < numIterations; i++) {
                let current = pointStructure.head;
                while (current.next !== null) {
                    let next = current.next;

                    const deltaX = next.x - current.x;
                    const midX = 0.5 * (current.x + next.x);
                    // Introduce randomness for Y displacement
                    const midY = 0.5 * (current.y + next.y) + deltaX * (Math.random() * 2 - 1);

                    const newMidPoint = { x: midX, y: midY, next: null };

                    // Track overall min/max Y values for normalization
                    if (midY < overallMinY) overallMinY = midY;
                    else if (midY > overallMaxY) overallMaxY = midY;

                    // Insert the new midpoint into the linked list
                    newMidPoint.next = next;
                    current.next = newMidPoint;

                    current = next; // Move to the next original point
                }
            }

            // Normalize Y values to be between 0 and 1
            if (overallMaxY !== overallMinY) {
                const normalizationFactor = 1 / (overallMaxY - overallMinY);
                let current = pointStructure.head;
                while (current !== null) {
                    current.y = normalizationFactor * (current.y - overallMinY);
                    current = current.next;
                }
            } else {
                // If all Y values are the same (e.g., 0 iterations), set them all to 1
                let current = pointStructure.head;
                while (current !== null) {
                    current.y = 1;
                    current = current.next;
                }
            }

            return pointStructure;
        },

        /**
         * @method updateOption
         * @description Allows updating a specific configuration option at runtime.
         * @param {string} optName The name of the option to update.
         * @param {*} optValue The new value for the option.
         */
        updateOption: function (optName, optValue) {
            if (this.effectSettings.hasOwnProperty(optName)) {
                this.effectSettings[optName] = optValue;
                // Potentially re-initialize parts of the effect if critical options change
                if (['particleCount', 'maxRadiusValue', 'minRadiusValue'].includes(optName)) {
                    this.commenceAnimation(); // Re-generate particles and restart animation
                }
            } else {
                console.warn(`MistGenerator: Option "${optName}" not found.`);
            }
        },

        /**
         * @method convertHexToRgbaString
         * @description Converts a hexadecimal color string to an RGBA string with a given opacity.
         * @param {string} hexColor The hexadecimal color string (e.g., "#RRGGBB" or "RRGGBB").
         * @param {number} alphaValue The opacity value (0.0 to 1.0).
         * @returns {string} The RGBA color string.
         */
        convertHexToRgbaString: function (hexColor, alphaValue) {
            // Basic validation for hex format
            if (!/^#?([0-9a-fA-F]{3}){1,2}$/.test(hexColor)) {
                console.warn("MistGenerator: Invalid hex color format provided, defaulting to black.");
                hexColor = "#000000";
            }
            const cleanHex = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
            const r = parseInt(cleanHex.substring(0, 2), 16);
            const g = parseInt(cleanHex.substring(2, 4), 16);
            const b = parseInt(cleanHex.substring(4, 6), 16);

            return `rgba(${r},${g},${b},${alphaValue})`;
        },

        /**
         * @method exportCanvasImage
         * @description Exports the current canvas content as a PNG image in a new window.
         * @param {number} desiredWidth Desired width of the exported image.
         * @param {number} desiredHeight Desired height of the exported image.
         */
        exportCanvasImage: function(desiredWidth, desiredHeight){
            // Draw the visible canvas onto the off-screen export canvas
            this.exportContext.drawImage(this.outputCanvas[0], 0, 0, desiredWidth, desiredHeight, 0, 0, desiredWidth, desiredHeight);

            // Get the image data URL
            const imageDataURL = this.exportTargetCanvas.toDataURL("image/png");

            // Open a new window and display the image
            const imageDisplayWindow = windowObject.open("", "exportedMistImage", `left=0,top=0,width=${desiredWidth},height=${desiredHeight},toolbar=0,resizable=0`);
            if (imageDisplayWindow) {
                imageDisplayWindow.document.write("<title>Exported Vapor Image</title>");
                imageDisplayWindow.document.write(`<img id='exportedImg' alt='Generated Vapor Effect' height='${desiredHeight}' width='${desiredWidth}' style='position:absolute;left:0;top:0'/>`);
                imageDisplayWindow.document.close();
                imageDisplayWindow.document.getElementById("exportedImg").src = imageDataURL;
            } else {
                console.error("MistGenerator: Failed to open new window for image export. Pop-up blockers might be active.");
            }
        },

        /**
         * @method destroy
         * @description Cleans up resources and stops the animation.
         */
        destroy: function() {
            if (animationFrameHandle) {
                cancelAnimationFrame(animationFrameHandle);
                animationFrameHandle = null;
            }
            // Further cleanup could involve removing the canvas from the DOM if desired
            // this.outputCanvas.remove();
            // this.$hostContainer.removeData(MODULE_ID);
        }
    };

    /**
     * @class RadialColorizer
     * @description A utility class to create and apply a custom radial gradient with dithering.
     * @param {number} x0_start Start X coordinate of the gradient circle.
     * @param {number} y0_start Start Y coordinate of the gradient circle.
     * @param {number} r0_start Start radius of the gradient circle.
     * @param {number} x1_end End X coordinate of the gradient circle.
     * @param {number} y1_end End Y coordinate of the gradient circle.
     * @param {number} r1_end End radius of the gradient circle.
     */
    function RadialColorizer(x0_start, y0_start, r0_start, x1_end, y1_end, r1_end) {
        this.gradientStartX = x0_start;
        this.gradientStartY = y0_start;
        this.gradientStartRadius = r0_start;
        this.gradientEndX = x1_end;
        this.gradientEndY = y1_end;
        this.gradientEndRadius = r1_end;
        this.gradientStops = []; // Array to hold color stop objects
    }

    /**
     * @method addColorStop
     * @description Adds a color stop to the radial gradient, maintaining sorted order.
     * @param {number} stopRatio Position of the color stop (0.0 to 1.0).
     * @param {number} redComponent Red color component (0-255).
     * @param {number} greenComponent Green color component (0-255).
     * @param {number} blueComponent Blue color component (0-255).
     */
    RadialColorizer.prototype.addColorStop = function(stopRatio, redComponent, greenComponent, blueComponent) {
        // Basic validation for ratio
        if (stopRatio < 0 || stopRatio > 1) {
            console.warn("RadialColorizer: Color stop ratio must be between 0 and 1.");
            return;
        }

        const newStop = { ratio: stopRatio, r: redComponent, g: greenComponent, b: blueComponent };

        if (this.gradientStops.length === 0) {
            this.gradientStops.push(newStop);
            return;
        }

        // Find the correct insertion point to keep stops sorted by ratio
        let insertIndex = 0;
        let foundPosition = false;
        while (insertIndex < this.gradientStops.length && !foundPosition) {
            if (stopRatio <= this.gradientStops[insertIndex].ratio) {
                foundPosition = true;
            } else {
                insertIndex++;
            }
        }

        if (foundPosition && stopRatio === this.gradientStops[insertIndex].ratio) {
            // Replace existing stop if ratio is identical
            this.gradientStops.splice(insertIndex, 1, newStop);
        } else {
            // Insert new stop at the found position
            this.gradientStops.splice(insertIndex, 0, newStop);
        }
    };

    /**
     * @method fillRect
     * @description Fills a specified rectangle on the canvas with the radial gradient, applying Floyd-Steinberg dithering.
     * @param {CanvasRenderingContext2D} ctx The 2D rendering context of the canvas.
     * @param {number} rectLeft Left X coordinate of the rectangle.
     * @param {number} rectTop Top Y coordinate of the rectangle.
     * @param {number} rectWidth Width of the rectangle.
     * @param {number} rectHeight Height of the rectangle.
     */
    RadialColorizer.prototype.fillRect = function(ctx, rectLeft, rectTop, rectWidth, rectHeight) {
        if (this.gradientStops.length === 0) {
            return; // No color stops defined, nothing to draw
        }

        // Ensure 0 and 1 ratios are present for robust interpolation
        if (this.gradientStops[0].ratio !== 0) {
            const firstStop = this.gradientStops[0];
            this.gradientStops.splice(0, 0, { ratio: 0, r: firstStop.r, g: firstStop.g, b: firstStop.b });
        }
        if (this.gradientStops[this.gradientStops.length - 1].ratio !== 1) {
            const lastStop = this.gradientStops[this.gradientStops.length - 1];
            this.gradientStops.push({ ratio: 1, r: lastStop.r, g: lastStop.g, b: lastStop.b });
        }

        // Get the pixel data from the specified rectangle
        const imageData = ctx.getImageData(rectLeft, rectTop, rectWidth, rectHeight);
        const pixelDataArray = imageData.data;
        const totalPixels = pixelDataArray.length / 4;

        // Buffers to store floating-point color values before dithering
        const rFloatBuffer = new Float32Array(totalPixels);
        const gFloatBuffer = new Float32Array(totalPixels);
        const bFloatBuffer = new Float32Array(totalPixels);

        // Pre-calculate constants for the quadratic equation to find gradient ratio
        const dxGrad = this.gradientEndX - this.gradientStartX;
        const dyGrad = this.gradientEndY - this.gradientStartY;
        const drGrad = this.gradientEndRadius - this.gradientStartRadius;

        const quadA = drGrad * drGrad - dxGrad * dxGrad - dyGrad * dyGrad;
        const quadB_const = 2 * this.gradientStartRadius * drGrad;
        const quadC_const = this.gradientStartRadius * this.gradientStartRadius;

        // Iterate through each pixel in the rectangle
        for (let pixelIndex = 0; pixelIndex < totalPixels; pixelIndex++) {
            const currentX = rectLeft + (pixelIndex % rectWidth);
            const currentY = rectTop + Math.floor(pixelIndex / rectWidth);

            const pixelDx = currentX - this.gradientStartX;
            const pixelDy = currentY - this.gradientStartY;

            // Solve quadratic equation for 't' (gradient ratio)
            // at^2 + bt + c = 0 where t is the ratio
            const quadB = quadB_const + 2 * (pixelDx * dxGrad + pixelDy * dyGrad);
            const quadC = quadC_const - pixelDx * pixelDx - pixelDy * pixelDy;
            const discriminant = quadB * quadB - 4 * quadA * quadC;

            let gradientRatio = 0;

            if (discriminant >= 0) {
                // Take the positive root for the ratio
                gradientRatio = (-quadB + Math.sqrt(discriminant)) / (2 * quadA);
                // Clamp ratio to [0, 1] range
                gradientRatio = Math.max(0, Math.min(1, gradientRatio));
            } else {
                // If discriminant is negative, pixel is outside the gradient's real solution range
                // Default to the start color (ratio 0) or end color (ratio 1) based on context
                // For simplicity, we'll clamp to 0 here. Could be more sophisticated.
                gradientRatio = 0;
            }

            // Find the two color stops that bracket the current gradientRatio
            let stopIdx = 0;
            while (stopIdx < this.gradientStops.length - 1 && gradientRatio > this.gradientStops[stopIdx].ratio) {
                stopIdx++;
            }
            const lowerStop = this.gradientStops[stopIdx - 1] || this.gradientStops[0];
            const upperStop = this.gradientStops[stopIdx] || this.gradientStops[this.gradientStops.length - 1];

            // Interpolate color components between the two stops
            let interpolatedR, interpolatedG, interpolatedB;
            if (lowerStop.ratio === upperStop.ratio) { // Handle case where ratio falls exactly on a stop or only one stop exists
                interpolatedR = lowerStop.r;
                interpolatedG = lowerStop.g;
                interpolatedB = lowerStop.b;
            } else {
                const f = (gradientRatio - lowerStop.ratio) / (upperStop.ratio - lowerStop.ratio);
                interpolatedR = lowerStop.r + (upperStop.r - lowerStop.r) * f;
                interpolatedG = lowerStop.g + (upperStop.g - lowerStop.g) * f;
                interpolatedB = lowerStop.b + (upperStop.b - lowerStop.b) * f;
            }

            // Store floating-point color values in buffers
            rFloatBuffer[pixelIndex] = interpolatedR;
            gFloatBuffer[pixelIndex] = interpolatedG;
            bFloatBuffer[pixelIndex] = interpolatedB;
        }

        // Apply Floyd-Steinberg dithering and convert to integer color values
        for (let pixelIndex = 0; pixelIndex < totalPixels; pixelIndex++) {
            const pIdx4 = pixelIndex * 4; // Index for the imageData.data array

            // Process Red channel
            const rVal = rFloatBuffer[pixelIndex];
            const nearestR = Math.round(rVal); // Quantize to nearest integer
            const errorR = rVal - nearestR;    // Calculate quantization error
            pixelDataArray[pIdx4 + 0] = Math.max(0, Math.min(255, nearestR)); // Clamp R value

            // Distribute error to neighboring pixels (if they exist)
            // Right neighbor (i+1)
            if (pixelIndex + 1 < totalPixels) rFloatBuffer[pixelIndex + 1] += errorR * (7 / 16);
            // Bottom-left neighbor (i-1+rectWidth)
            if (pixelIndex - 1 + rectWidth < totalPixels && (pixelIndex % rectWidth) !== 0) rFloatBuffer[pixelIndex - 1 + rectWidth] += errorR * (3 / 16);
            // Bottom neighbor (i+rectWidth)
            if (pixelIndex + rectWidth < totalPixels) rFloatBuffer[pixelIndex + rectWidth] += errorR * (5 / 16);
            // Bottom-right neighbor (i+1+rectWidth)
            if (pixelIndex + 1 + rectWidth < totalPixels && (pixelIndex % rectWidth) !== (rectWidth - 1)) rFloatBuffer[pixelIndex + 1 + rectWidth] += errorR * (1 / 16);


            // Process Green channel (similar logic)
            const gVal = gFloatBuffer[pixelIndex];
            const nearestG = Math.round(gVal);
            const errorG = gVal - nearestG;
            pixelDataArray[pIdx4 + 1] = Math.max(0, Math.min(255, nearestG));

            if (pixelIndex + 1 < totalPixels) gFloatBuffer[pixelIndex + 1] += errorG * (7 / 16);
            if (pixelIndex - 1 + rectWidth < totalPixels && (pixelIndex % rectWidth) !== 0) gFloatBuffer[pixelIndex - 1 + rectWidth] += errorG * (3 / 16);
            if (pixelIndex + rectWidth < totalPixels) gFloatBuffer[pixelIndex + rectWidth] += errorG * (5 / 16);
            if (pixelIndex + 1 + rectWidth < totalPixels && (pixelIndex % rectWidth) !== (rectWidth - 1)) gFloatBuffer[pixelIndex + 1 + rectWidth] += errorG * (1 / 16);

            // Process Blue channel (similar logic)
            const bVal = bFloatBuffer[pixelIndex];
            const nearestB = Math.round(bVal);
            const errorB = bVal - nearestB;
            pixelDataArray[pIdx4 + 2] = Math.max(0, Math.min(255, nearestB));

            if (pixelIndex + 1 < totalPixels) bFloatBuffer[pixelIndex + 1] += errorB * (7 / 16);
            if (pixelIndex - 1 + rectWidth < totalPixels && (pixelIndex % rectWidth) !== 0) bFloatBuffer[pixelIndex - 1 + rectWidth] += errorB * (3 / 16);
            if (pixelIndex + rectWidth < totalPixels) bFloatBuffer[pixelIndex + rectWidth] += errorB * (5 / 16);
            if (pixelIndex + 1 + rectWidth < totalPixels && (pixelIndex % rectWidth) !== (rectWidth - 1)) bFloatBuffer[pixelIndex + 1 + rectWidth] += errorB * (1 / 16);

            // Set Alpha channel to fully opaque
            pixelDataArray[pIdx4 + 3] = 255;
        }

        // Put the modified pixel data back onto the canvas
        ctx.putImageData(imageData, rectLeft, rectTop);
    };


    // jQuery plugin integration
    jQuery.fn[MODULE_ID] = function ( userOptions ) {
        return this.each(function () {
            // Prevent multiple instances on the same element
            if (!jQuery.data(this, `plugin_${MODULE_ID}`)) {
                jQuery.data(this, `plugin_${MODULE_ID}`, new MistGenerator( this, userOptions ));
            }
        });
    };

})( jQuery, window, document, undefined );