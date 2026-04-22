;(function ( jQueryAlias, currentWindow, docObject, typeUndefined ) {
    // Defines the canonical name for this module
    var moduleAlias = "vaporyze",
        // Default configuration options for the visual effect
        standardOptions = {
            // Smoke-related visual properties
            startColor: '#000000',
            endColor: '#222222',
            alphaValue: 0.1,
            numOrbs: 1,
            maximumAllowedRadius: 'auto',
            minimumAllowedRadius: 'auto',
            minRadiusFactor: 0,
            fractalDepth: 8,
            drawsPerFrame: 10,
            strokeThickness: 2,
            animationSpeed: 1,
            // Background visual properties
            innerBackgroundColor: "#ffffff",
            outerBackgroundColor: "#666666",
        };

    // Constant for a full circle in radians
    var FULL_CIRCLE = Math.PI * 2.0;
    // Timer ID for the animation loop
    var animationInterval;
    // Reference to the current plugin instance
    var currentInstance;
    /**
     * @class VaporEffect
     * @param {HTMLElement} targetElement - The DOM element to attach the effect to.
     * @param {Object} options - User-defined configuration settings.
     */
    function VaporEffect ( targetElement, options ) {
        // Store the raw DOM element
        this.targetElement = targetElement;
        // Store the jQuery-wrapped element
        this.jQueryTarget = jQueryAlias(targetElement);
        // Set the global instance reference for the timer callback
        currentInstance = this;
        // Merge user options with default settings
        this.configuration = jQueryAlias.extend( {}, standardOptions, options );
        // Keep a copy of the base defaults
        this._baseSettings = standardOptions;
        // Store the module's identifier
        this._moduleIdentifier = moduleAlias;
        // Initialize the visual effect
        this.setup();
    }

    // Prototype methods for the VaporEffect class
    VaporEffect.prototype = {
        /**
         * Initializes the plugin by setting up, canvas, and starting generation.
         */
        setup: function () {
            this.configureEffect();
            this.prepareDrawingSurface();
            this.produceAnimation();
        },
        /**
         * Adjusts radius settings based on element dimensions if set to 'auto'.
         */
        configureEffect: function () {
            // Calculate a default radius based on element height
            var calculatedRadius = this.jQueryTarget.height() * 0.4;
            if(this.configuration.maximumAllowedRadius === 'auto') {
                this.configuration.maximumAllowedRadius = calculatedRadius;
            }
            if(this.configuration.minimumAllowedRadius === 'auto') {
                this.configuration.minimumAllowedRadius = calculatedRadius;
            }
        },
        /**
         * Sets up the canvas elements for drawing and off-screen rendering.
         */
        prepareDrawingSurface: function () {
            // Locate the primary canvas element within the target
            this.renderCanvas = this.jQueryTarget.find('canvas');
            // Determine the dimensions of the display area
            this.surfaceWidth = this.jQueryTarget[0].clientWidth;
            this.surfaceHeight = this.jQueryTarget[0].clientHeight;
            // Set canvas dimensions
            this.renderCanvas[0].width = this.surfaceWidth;
            this.renderCanvas[0].height = this.surfaceHeight;
            // Obtain the 2D rendering context
            this.drawingContext = this.renderCanvas[0].getContext("2d");

            // Create an off-screen canvas for image export operations
            this.outputCanvas = docObject.createElement('canvas');
            this.outputCanvas.width = this.surfaceWidth;
            this.outputCanvas.height = this.surfaceHeight;
            this.outputContext = this.outputCanvas.getContext("2d");
        },
        /**
         * Initiates the smoke animation process.
         */
        produceAnimation: function () {
            this.frameCounter = 0;
            // Reset canvas transformation and clear its contents
            this.drawingContext.setTransform(1,0,0,1,0,0);
            this.drawingContext.clearRect(0,0,this.surfaceWidth,this.surfaceHeight);
            this.paintBackground();
            
            this.createOrbs();
            
            // Clear any existing animation timer before starting a new one
            if(animationInterval) {
                currentWindow.clearInterval(animationInterval);
            }
            animationInterval = currentWindow.setInterval(function(){
                currentInstance.animateFrame();
            }, currentInstance.configuration.animationSpeed);
        },
        /**
         * Fills the canvas background with a radial gradient.
         */
        paintBackground: function () {
            // Calculate outer radius for the background gradient
            var outerRadius = Math.sqrt(this.surfaceWidth * this.surfaceWidth + this.surfaceHeight * this.surfaceHeight) / 2.0;
            // Create a new gradient object
            this.fancyGradient = new GradientDrawer(this.surfaceWidth * 0.75, this.surfaceHeight / 2 * 0.75, 0, this.surfaceWidth / 2, this.surfaceHeight / 4, outerRadius);

            // Parse inner background color from hex to RGB
            var hexValue = this.configuration.innerBackgroundColor.replace('#','');

            var color1Red = parseInt(hexValue.substring(0,2), 16), 
                color1Green = parseInt(hexValue.substring(2,4), 16), 
                color1Blue = parseInt(hexValue.substring(4,6), 16);

            // Parse outer background color from hex to RGB
            hexValue = this.configuration.outerBackgroundColor.replace('#','');
            var color2Red = parseInt(hexValue.substring(0,2), 16), 
                color2Green = parseInt(hexValue.substring(2,4), 16), 
                color2Blue = parseInt(hexValue.substring(4,6), 16);

            // Add color stops to the gradient
            this.fancyGradient.addStopPoint(0, color1Red, color1Green, color1Blue);
            this.fancyGradient.addStopPoint(1, color2Red, color2Green, color2Blue);
            // Render the gradient onto the canvas
            this.fancyGradient.renderFill(this.drawingContext, 0, 0, this.surfaceWidth, this.surfaceHeight);
        },
        /**
         * Initializes the properties of the animated smoke orbs.
         */
        createOrbs: function () {
            var idx;
            var redComp, greenComp, blueComp, alphaComp; // Not all used, just for consistency
            var maximumRadius, minimumRadius;
            var radialGrad;
            
            this.animatedOrbs = [];
            
            for (idx = 0; idx < this.configuration.numOrbs; idx++) {
                // Determine random max/min radii for each orb
                maximumRadius = this.configuration.minimumAllowedRadius + Math.random() * (this.configuration.maximumAllowedRadius - this.configuration.minimumAllowedRadius);
                minimumRadius = this.configuration.minRadiusFactor * maximumRadius;
                
                // Define the radial gradient for the orb's color
                radialGrad = this.drawingContext.createRadialGradient(0, 0, minimumRadius, 0, 0, maximumRadius);
                var orbStartColor = this.parseHexToRGBA(this.configuration.startColor, this.configuration.alphaValue),
                    orbEndColor = this.parseHexToRGBA(this.configuration.endColor, this.configuration.alphaValue);

                radialGrad.addColorStop(1, orbStartColor);
                radialGrad.addColorStop(0, orbEndColor);
                
                var currentOrb = {
                    centerPosX: -maximumRadius, // Initial X position off-screen
                    centerPosY: this.surfaceHeight / 2 - 50, // Initial Y position
                    maxOrbRadius : maximumRadius,
                    minOrbRadius : minimumRadius,
                    orbColor: radialGrad, // Gradient or solid color
                    animationProgress : 0, // Progress of fractal interpolation
                    progressRate : 0.004, // Speed of animation progress
                    orbPhase : Math.random() * FULL_CIRCLE, // Phase for a single fractal curve
                    overallPhase: Math.random() * FULL_CIRCLE // Overall sinusoidal movement phase
                };
                this.animatedOrbs.push(currentOrb);
                // Generate two sets of fractal points for smooth transitions
                currentOrb.pointSetA = this.generateFractalPoints(this.configuration.fractalDepth);
                currentOrb.pointSetB = this.generateFractalPoints(this.configuration.fractalDepth);
            }
        },
        /**
         * Advances the animation by one frame, drawing and updating orbs.
         */
        animateFrame: function () {
            var idx, loopIndex;
            var activeOrb;
            var currentRadius;
            var firstPoint, secondPoint;
            var coordX, coordY;
            var cosineProgress;
            
            var horizontalCompression = 0.75; // Simulates 3D perspective
            
            var verticalShift;
            
            // Iterate multiple times per frame for smoother animation
            for (loopIndex = 0; loopIndex < this.configuration.drawsPerFrame; loopIndex++) {
                
                this.frameCounter++;
                
                for (idx = 0; idx < this.configuration.numOrbs; idx++) {
                    activeOrb = this.animatedOrbs[idx];
                    activeOrb.animationProgress += activeOrb.progressRate;
                    if (activeOrb.animationProgress >= 1) {
                        activeOrb.animationProgress = 0;
                        
                        // Swap point sets for continuous animation
                        activeOrb.pointSetA = activeOrb.pointSetB;
                        activeOrb.pointSetB = this.generateFractalPoints(this.configuration.fractalDepth);
                    }
                    // Smooth cosine interpolation for animation progress
                    cosineProgress = 0.5 * (1.0 - Math.cos(Math.PI * activeOrb.animationProgress));
                    
                    this.drawingContext.strokeStyle = activeOrb.orbColor;
                    this.drawingContext.lineWidth = this.configuration.strokeThickness;
                    this.drawingContext.beginPath();
                    firstPoint = activeOrb.pointSetA.startNode;
                    secondPoint = activeOrb.pointSetB.startNode;
                    
                    // Slowly rotate the orb's fractal pattern
                    activeOrb.orbPhase += 2e-4;
                    
                    var angle = activeOrb.orbPhase;
                    currentRadius = activeOrb.minOrbRadius + (firstPoint.y + cosineProgress * (secondPoint.y - firstPoint.y)) * (activeOrb.maxOrbRadius - activeOrb.minOrbRadius);
                    
                    // Move the orb's center across the screen
                    activeOrb.centerPosX += 0.50;
                    activeOrb.centerPosY += 4e-2;
                    // Apply sinusoidal vertical oscillation
                    verticalShift = 40.0 * Math.sin(activeOrb.overallPhase + this.frameCounter / 1000.0 * FULL_CIRCLE);
                    // Stop animation if orb moves completely off-screen
                    if (activeOrb.centerPosX > this.surfaceWidth + this.configuration.maximumAllowedRadius) {
                        currentWindow.clearInterval(animationInterval);
                        animationInterval = null;
                    }           
                    
                    // Apply transformation for position and 3D effect
                    this.drawingContext.setTransform(horizontalCompression, 0, 0, 1, activeOrb.centerPosX, activeOrb.centerPosY + verticalShift);
                    
                    // Drawing the fractal curve by iterating through linked list points
                    coordX = horizontalCompression * currentRadius * Math.cos(angle);
                    coordY = currentRadius * Math.sin(angle);
                    this.drawingContext.lineTo(coordX, coordY);
                    while (firstPoint.nextNode != null) {
                        firstPoint = firstPoint.nextNode;
                        secondPoint = secondPoint.nextNode;
                        angle = FULL_CIRCLE * (firstPoint.x + cosineProgress * (secondPoint.x - firstPoint.x)) + activeOrb.orbPhase;
                        currentRadius = activeOrb.minOrbRadius + (firstPoint.y + cosineProgress * (secondPoint.y - firstPoint.y)) * (activeOrb.maxOrbRadius - activeOrb.minOrbRadius);
                        coordX = horizontalCompression * currentRadius * Math.cos(angle);
                        coordY = currentRadius * Math.sin(angle);
                        this.drawingContext.lineTo(coordX, coordY);
                    }
                    this.drawingContext.closePath();
                    this.drawingContext.stroke();
                }
            }
        },
        /**
         * Generates a list of points for a fractal line using midpoint displacement.
         * @param {number} fractalIterations - The number of subdivision iterations.
         * @returns {Object} A linked list structure representing the fractal line.
         */
        generateFractalPoints: function (fractalIterations) {
            var fractalPointList = {};
            fractalPointList.startNode = {x:0, y:1};
            var endNode = {x:1, y:1}
            var minYCoord = 1;
            var maxYCoord = 1;
            var currentNode;
            var nextNode;
            var deltaX, newCoordX, newCoordY;
            var interpolationRatio;
            
            var minimumRatio = 0.5;
                    
            fractalPointList.startNode.nextNode = endNode;
            for (var idx = 0; idx < fractalIterations; idx++) {
                currentNode = fractalPointList.startNode;
                while (currentNode.nextNode != null) {
                    nextNode = currentNode.nextNode;
                    
                    deltaX = nextNode.x - currentNode.x;
                    newCoordX = (currentNode.x + nextNode.x) / 2.0;
                    newCoordY = (currentNode.y + nextNode.y) / 2.0;
                    newCoordY += deltaX * ((Math.random() * 2.0) - 1.0); // Apply random displacement
                    
                    var insertPoint = {x:newCoordX, y:newCoordY};
                    
                    // Track min/max Y coordinates for normalization
                    if (newCoordY < minYCoord) {
                        minYCoord = newCoordY;
                    }
                    else if (newCoordY > maxYCoord) {
                        maxYCoord = newCoordY;
                    }
                    
                    // Insert the new point into the linked list
                    insertPoint.nextNode = nextNode;
                    currentNode.nextNode = insertPoint;
                    
                    currentNode = nextNode;
                }
            }
            
            // Normalize all Y values to be between 0 and 1
            if (maxYCoord != minYCoord) {
                var normalizationFactor = 1.0 / (maxYCoord - minYCoord);
                currentNode = fractalPointList.startNode;
                while (currentNode != null) {
                    currentNode.y = normalizationFactor * (currentNode.y - minYCoord);
                    currentNode = currentNode.nextNode;
                }
            }
            // Handle edge case where max = min (e.g., zero iterations)
            else {
                currentNode = fractalPointList.startNode;
                while (currentNode != null) {
                    currentNode.y = 1;
                    currentNode = currentNode.nextNode;
                }
            }
            
            return fractalPointList;       
        },
        /**
         * Modifies a specific configuration setting for the plugin.
         * @param {string} settingKey - The name of the setting to change.
         * @param {*} settingValue - The new value for the setting.
         */
        modifySetting: function (settingKey, settingValue) {
            this.configuration[settingKey] = settingValue;
        },
        /**
         * Converts a hexadecimal color string to an RGBA string.
         * @param {string} hex - The hexadecimal color code (e.g., '#RRGGBB').
         * @param {number} alphaValue - The alpha transparency value (0-1).
         * @returns {string} The RGBA color string.
         */
        parseHexToRGBA: function (hex, alphaValue) {
            hex = hex.replace('#','');
            var redComp = parseInt(hex.substring(0,2), 16);
            var greenComp = parseInt(hex.substring(2,4), 16);
            var blueComp = parseInt(hex.substring(4,6), 16);

            var rgbaString = 'rgba(' + redComp + ',' + greenComp + ',' + blueComp + ',' + alphaValue + ')';
            return rgbaString;
        },
        /**
         * Exports the current canvas content as an image in a new window.
         * @param {number} exportWidth - The desired width of the exported image.
         * @param {number} exportHeight - The desired height of the exported image.
         */
        exportImage: function(exportWidth, exportHeight){
            // Draw the display canvas onto the off-screen canvas for export
            this.outputContext.drawImage(this.renderCanvas[0], 0, 0, exportWidth, exportHeight, 0, 0, exportWidth, exportHeight);
            // Get the image data as a URL
            var imageDataURL = this.outputCanvas.toDataURL("image/png");
            // Open a new browser window to display the image
            var exportWindow = currentWindow.open("", "fractalLineImage", "left=0,top=0,width="+exportWidth+",height="+exportHeight+",toolbar=0,resizable=0");
            // Write HTML for an image tag into the new window
            exportWindow.document.write("<title>Exported Image</title>")
            exportWindow.document.write("<img id='outputImageElement'"
                                        + " alt='Exported Effect Image'"
                                        + " height='" + exportHeight + "'"
                                        + " width='"  + exportWidth  + "'"
                                        + " style='position:absolute;left:0;top:0'/>");
            exportWindow.document.close();
            // Assign the generated image data to the image element in the new window
            var outputImageElement = exportWindow.document.getElementById("outputImageElement");
            outputImageElement.src = imageDataURL;
        }
    };

    /**
     * @class GradientDrawer
     * @param {number} startCoordX - X coordinate of the gradient's start circle center.
     * @param {number} startCoordY - Y coordinate of the gradient's start circle center.
     * @param {number} startRadius - Radius of the gradient's start circle.
     * @param {number} endCoordX - X coordinate of the gradient's end circle center.
     * @param {number} endCoordY - Y coordinate of the gradient's end circle center.
     * @param {number} endRadius - Radius of the gradient's end circle.
     */
    function GradientDrawer(startCoordX, startCoordY, startRadius, endCoordX, endCoordY, endRadius) {
        this.startX = startCoordX;
        this.startY = startCoordY;
        this.endX = endCoordX;
        this.endY = endCoordY;
        this.rStart = startRadius;
        this.rEnd = endRadius;
        this.gradientStops = [];
    }

    // Prototype methods for the GradientDrawer class
    GradientDrawer.prototype.addStopPoint = function(interpolationRatio, redComp, greenComp, blueComp) {
        // Ensure ratio is within valid range [0, 1]
        if ((interpolationRatio < 0) || (interpolationRatio > 1)) {
            return;
        }
        var newStopPoint = {ratio:interpolationRatio, r:redComp, g:greenComp, b:blueComp};
        if ((interpolationRatio >= 0) && (interpolationRatio <= 1)) {
            if (this.gradientStops.length === 0) {
                this.gradientStops.push(newStopPoint);
            }
            else {
                var stopIndex = 0;
                var isFound = false;
                var stopCount = this.gradientStops.length;
                // Find the correct position to insert the new stop point, maintaining order
                while ((!isFound) && (stopIndex < stopCount)) {
                    isFound = (interpolationRatio <= this.gradientStops[stopIndex].ratio);
                    if (!isFound) {
                        stopIndex++;
                    }
                }
                // Add the new stop point to the array
                if (!isFound) {
                    this.gradientStops.push(newStopPoint);
                }
                else {
                    if (interpolationRatio === this.gradientStops[stopIndex].ratio) {
                        // Replace existing stop if ratio is a duplicate
                        this.gradientStops.splice(stopIndex, 1, newStopPoint);
                    }
                    else {
                        // Insert new stop point
                        this.gradientStops.splice(stopIndex, 0, newStopPoint);
                    }
                }
            }
        }
    }

        
    GradientDrawer.prototype.renderFill = function(renderContext, drawRectX, drawRectY, drawRectWidth, drawRectHeight) {
        
        if (this.gradientStops.length === 0) {
            return;
        }
        
        // Get pixel data for the specified rectangle
        var imageData = renderContext.getImageData(drawRectX, drawRectY, drawRectWidth, drawRectHeight);
        var pixelBuffer = imageData.data;
        var totalPixels = pixelBuffer.length;
        var closestValue; // Used for dithering
        var quantizationError;
        var pixelX;
        var pixelY;
        
        var vectorX = this.endX - this.startX;
        var vectorY = this.endY - this.startY;
        var invVectorMagnitudeSquared = 1 / (vectorX * vectorX + vectorY * vectorY); // Inverse squared magnitude of the gradient vector
        var interpolationRatio;
        
        var redVal, greenVal, blueVal;
        var redA, greenA, blueA, redB, greenB, blueB;
        var ratioA, ratioB;
        var fraction;
        var currentStopIndex;
        var isFound;
        
        var redBuffer = [];
        var greenBuffer = [];
        var blueBuffer = [];
        // var alphaBuffer = []; // Not used in this implementation
        
        var coeffA, coeffB, coeffC, discriminant;
        var deltaPixelX, deltaPixelY;
        
        var diffX = this.endX - this.startX;
        var diffY = this.endY - this.startY;
        var diffR = this.rEnd - this.rStart;
        coeffA = diffR * diffR - diffX * diffX - diffY * diffY;
        var radiusConstant = 2 * this.rStart * (this.rEnd - this.rStart);
        var rStartSquared = this.rStart * this.rStart;

        // Ensure color stops exist at 0 and 1 ratios
        if (this.gradientStops[0].ratio !== 0) {
            var tempStop = { ratio:0,
                            r: this.gradientStops[0].r,
                            g: this.gradientStops[0].g,
                            b: this.gradientStops[0].b};
            this.gradientStops.splice(0,0,tempStop);
        }
        if (this.gradientStops[this.gradientStops.length-1].ratio !== 1) {
            var tempStop = { ratio:1,
                            r: this.gradientStops[this.gradientStops.length-1].r,
                            g: this.gradientStops[this.gradientStops.length-1].g,
                            b: this.gradientStops[this.gradientStops.length-1].b};
            this.gradientStops.push(tempStop);
        }

        // Calculate float-valued gradient colors for each pixel
        for (var i = 0; i < totalPixels / 4; i++) {
            
            pixelX = drawRectX + (i % drawRectWidth);
            pixelY = drawRectY + Math.floor(i / drawRectWidth);
            
            deltaPixelX = pixelX - this.startX;
            deltaPixelY = pixelY - this.startY;
            coeffB = radiusConstant + 2 * (deltaPixelX * diffX + deltaPixelY * diffY);
            coeffC = rStartSquared - deltaPixelX * deltaPixelX - deltaPixelY * deltaPixelY;
            discriminant = coeffB * coeffB - 4 * coeffA * coeffC;
            
            if (discriminant >= 0) {
                // Solve quadratic equation for interpolation ratio
                interpolationRatio = (-coeffB + Math.sqrt(discriminant)) / (2 * coeffA);
            
                // Clamp ratio to [0, 1]
                if (interpolationRatio < 0) {
                    interpolationRatio = 0;
                }
                else if (interpolationRatio > 1) {
                    interpolationRatio = 1;
                }
                
                // Find the two color stops this ratio falls between
                if (interpolationRatio === 1) {
                    currentStopIndex = this.gradientStops.length - 1;
                }
                else {
                    currentStopIndex = 0;
                    isFound = false;
                    while (!isFound) {
                        isFound = (interpolationRatio < this.gradientStops[currentStopIndex].ratio);
                        if (!isFound) {
                            currentStopIndex++;
                        }
                    }
                }
                
                // Interpolate color components based on the ratio
                redA = this.gradientStops[currentStopIndex-1].r;
                greenA = this.gradientStops[currentStopIndex-1].g;
                blueA = this.gradientStops[currentStopIndex-1].b;
                redB = this.gradientStops[currentStopIndex].r;
                greenB = this.gradientStops[currentStopIndex].g;
                blueB = this.gradientStops[currentStopIndex].b;
                ratioA = this.gradientStops[currentStopIndex-1].ratio;
                ratioB = this.gradientStops[currentStopIndex].ratio;
                    
                fraction = (interpolationRatio - ratioA) / (ratioB - ratioA);
                redVal = redA + (redB - redA) * fraction;
                greenVal = greenA + (greenB - greenA) * fraction;
                blueVal = blueA + (blueB - blueA) * fraction;
            }
            
            else {
                // If no real solution, use the first color stop
                redVal = redA;
                greenVal = greenA;
                blueVal = blueA;
            }
            
            // Store float color values in temporary buffers
            redBuffer.push(redVal);
            greenBuffer.push(greenVal);
            blueBuffer.push(blueVal);
        }
        
        // Apply Floyd-Steinberg dithering while converting float colors to integer pixel values
        for (var i = 0; i < totalPixels / 4; i++) {
            // Red component dithering
            closestValue = Math.floor(redBuffer[i]);
            quantizationError = redBuffer[i] - closestValue;
            redBuffer[i+1] += 0.4375 * quantizationError;
            redBuffer[i-1+drawRectWidth] += 0.1875 * quantizationError;
            redBuffer[i + drawRectWidth] += 0.3125 * quantizationError;
            redBuffer[i+1 + drawRectWidth] += 0.0625 * quantizationError;
            
            // Green component dithering
            closestValue = Math.floor(greenBuffer[i]);
            quantizationError = greenBuffer[i] - closestValue;
            greenBuffer[i+1] += 0.4375 * quantizationError;
            greenBuffer[i-1+drawRectWidth] += 0.1875 * quantizationError;
            greenBuffer[i + drawRectWidth] += 0.3125 * quantizationError;
            greenBuffer[i+1 + drawRectWidth] += 0.0625 * quantizationError;
            
            // Blue component dithering
            closestValue = Math.floor(blueBuffer[i]);
            quantizationError = blueBuffer[i] - closestValue;
            blueBuffer[i+1] += 0.4375 * quantizationError;
            blueBuffer[i-1+drawRectWidth] += 0.1875 * quantizationError;
            blueBuffer[i + drawRectWidth] += 0.3125 * quantizationError;
            blueBuffer[i+1 + drawRectWidth] += 0.0625 * quantizationError;
            
            // Assign dithered integer values to the pixel buffer
            pixelBuffer[i*4] = Math.max(0, Math.min(255, Math.floor(redBuffer[i])));
            pixelBuffer[i*4+1] = Math.max(0, Math.min(255, Math.floor(greenBuffer[i])));
            pixelBuffer[i*4+2] = Math.max(0, Math.min(255, Math.floor(blueBuffer[i])));
            pixelBuffer[i*4+3] = 255; // Fully opaque
        }
        renderContext.putImageData(imageData, drawRectX, drawRectY);
    };

    // jQuery plugin integration
    jQueryAlias.fn[ moduleAlias ] = function ( optParams ) {
        return this.each(function() {
            if ( !jQueryAlias.data( this, "plugin_" + moduleAlias ) ) {
                jQueryAlias.data( this, "plugin_" + moduleAlias, new VaporEffect( this, optParams ) );
            }
        });
    };

})( jQuery, window, document );