/*
 *  This is a Type I clone of the waterpipe.js plugin.
 *  The original code was created by dragdropsite.com.
 *  This version retains all original identifiers, operators, and expressions.
 *  Only whitespace and comments have been altered.
 *  This file is logically and structurally identical to the original.
 *  It is still under the MIT License.
 */

; ( function ( $,
              window,
              document,
              undefined ) { // Wrapping the entire plugin in an IIFE.

    // Define the plugin's name for consistency.
    var pluginName = "waterpipe",

    // Set up default configuration options for the smoke effect and background.
        defaults = {
            // --- Smoke effect parameters ---
            gradientStart : '#000000', // Starting color of the smoke gradient.
            gradientEnd   : '#222222', // Ending color of the smoke gradient.
            smokeOpacity  : 0.1,       // Overall opacity of the smoke circles.
            numCircles    : 1,         // Number of smoke circles to generate.

            // Radius settings for the smoke circles.
            maxMaxRad     : 'auto',    // Maximum possible radius for circles.
            minMaxRad     : 'auto',    // Minimum possible radius for circles.
            minRadFactor  : 0,         // Factor to determine minimum radius from max radius.

            iterations    : 8,         // Number of fractal iterations for smoke shape.
            drawsPerFrame : 10,        // How many times to redraw circles per animation frame.
            lineWidth     : 2,         // Line width for drawing smoke circles.
            speed         : 1,         // Animation speed (interval for onTimer).

            // --- Background parameters ---
            bgColorInner  : "#ffffff", // Inner color of the background gradient.
            bgColorOuter  : "#666666"  // Outer color of the background gradient.
        };


    // Define a constant for 2 * PI, frequently used in circular calculations.
    var TWO_PI = 2 * Math.PI;

    // Timer variable to control animation loop.
    var timer;

    // Instance reference, used in the timer callback.
    var inst;


    // The main constructor function for the Smoke plugin.
    function Smoke ( element, options ) {

        this.element  = element; // Store the raw DOM element.
        this.$element = $( element ); // Store the jQuery-wrapped element.

        inst          = this; // Set global instance reference for timer.

        // Merge default settings with user-provided options.
        this.settings = $.extend( {}, defaults, options );

        this._defaults = defaults;     // Keep a copy of the default settings.
        this._name     = pluginName;   // Store the plugin name.

        this.init(); // Initialize the plugin instance.

    } // End of Smoke constructor.


    // Define methods for the Smoke prototype.
    Smoke.prototype = {

        // Initialization method, called once when the plugin starts.
        init: function () {

            this.initSettings(); // Set up dynamic settings based on element size.
            this.initCanvas();   // Prepare the canvas elements.
            this.generate();     // Start generating and animating the smoke.

        }, // End of init.

        // Initializes or adjusts settings based on the element's dimensions.
        initSettings: function () {

            // Calculate a base radius from the element's height.
            var radius = this.$element.height() * 0.8 / 2;

            // If maxMaxRad is 'auto', set it to the calculated radius.
            if ( this.settings.maxMaxRad === 'auto' ) {
                this.settings.maxMaxRad = radius;
            }

            // If minMaxRad is 'auto', set it to the calculated radius.
            if ( this.settings.minMaxRad === 'auto' ) {
                this.settings.minMaxRad = radius;
            }

        }, // End of initSettings.

        // Sets up the display and export canvases.
        initCanvas: function () {

            // Find the canvas element within the plugin's root element.
            this.displayCanvas = this.$element.find( 'canvas' );

            // Get the display width and height from the parent element.
            this.displayWidth  = this.$element[0].clientWidth;
            this.displayHeight = this.$element[0].clientHeight;

            // Set the canvas dimensions to match the display area.
            this.displayCanvas[0].width  = this.displayWidth;
            this.displayCanvas[0].height = this.displayHeight;

            // Get the 2D rendering context for the display canvas.
            this.context = this.displayCanvas[0].getContext( "2d" );


            // Create an off-screen canvas for exporting images, if needed.
            this.exportCanvas        = document.createElement( 'canvas' );
            this.exportCanvas.width  = this.displayWidth;
            this.exportCanvas.height = this.displayHeight;

            // Get the 2D rendering context for the export canvas.
            this.exportContext = this.exportCanvas.getContext( "2d" );

        }, // End of initCanvas.

        // Main generation and animation start point.
        generate: function () {

            this.drawCount = 0; // Reset draw counter.

            // Reset canvas transformation and clear the display area.
            this.context.setTransform( 1, 0, 0, 1, 0, 0 );
            this.context.clearRect( 0, 0, this.displayWidth, this.displayHeight );

            this.fillBackground(); // Draw the background gradient.

            this.setCircles(); // Initialize the smoke circles.

            // Clear any existing timer to prevent multiple animation loops.
            if ( timer ) {
                clearInterval( timer );
            }

            // Start the animation timer.
            timer = setInterval( function () { inst.onTimer() }, inst.settings.speed );

        }, // End of generate.

        // Fills the canvas background with a radial gradient.
        fillBackground: function () {

            // Calculate the outer radius for the background gradient.
            var outerRad = Math.sqrt( this.displayWidth * this.displayWidth + this.displayHeight * this.displayHeight ) / 2;

            // Create a new SmokeNiceBG instance for the background gradient.
            this.niceGradient = new SmokeNiceBG( this.displayWidth * 0.75,
                                                 this.displayHeight / 2 * 0.75,
                                                 0,
                                                 this.displayWidth / 2,
                                                 this.displayHeight / 4,
                                                 outerRad );

            // Convert inner background color hex to RGB components.
            var hex = this.settings.bgColorInner.replace( '#', '' );

            var r0 = parseInt( hex.substring( 0, 2 ), 16 ),
                g0 = parseInt( hex.substring( 2, 4 ), 16 ),
                b0 = parseInt( hex.substring( 4, 6 ), 16 );

            // Convert outer background color hex to RGB components.
            hex = this.settings.bgColorOuter.replace( '#', '' );

            var r1 = parseInt( hex.substring( 0, 2 ), 16 ),
                g1 = parseInt( hex.substring( 2, 4 ), 16 ),
                b1 = parseInt( hex.substring( 4, 6 ), 16 );

            // Add color stops to the background gradient.
            this.niceGradient.addColorStop( 0, r0, g0, b0 );
            this.niceGradient.addColorStop( 1, r1, g1, b1 );

            // Fill the entire canvas with the generated background gradient.
            this.niceGradient.fillRect( this.context, 0, 0, this.displayWidth, this.displayHeight );

        }, // End of fillBackground.

        // Initializes the properties for all smoke circles.
        setCircles: function () {

            var i;          // Loop counter.
            var maxR, minR; // Maximum and minimum radii for individual circles.
            var grad;       // Gradient object for circle color.

            this.circles = []; // Initialize an empty array to hold circle objects.

            for ( i = 0; i < this.settings.numCircles; i++ ) {

                // Calculate a random max radius within the defined range.
                maxR = this.settings.minMaxRad + Math.random() * ( this.settings.maxMaxRad - this.settings.minMaxRad );

                // Calculate the min radius based on the max radius and factor.
                minR = this.settings.minRadFactor * maxR;

                // Create a radial gradient for the smoke circle.
                grad = this.context.createRadialGradient( 0, 0, minR, 0, 0, maxR );

                // Convert hex colors to RGBA with the specified smoke opacity.
                var gradientStart = this.hexToRGBA( this.settings.gradientStart, this.settings.smokeOpacity ),
                    gradientEnd   = this.hexToRGBA( this.settings.gradientEnd, this.settings.smokeOpacity );

                // Add color stops to the circle's gradient.
                grad.addColorStop( 1, gradientStart );
                grad.addColorStop( 0, gradientEnd );

                // Define a new smoke circle object with its properties.
                var newCircle = {
                    centerX     : -maxR,                                    // Initial X position (off-screen left).
                    centerY     : this.displayHeight / 2 - 50,              // Initial Y position.
                    maxRad      : maxR,                                     // Maximum radius for this circle.
                    minRad      : minR,                                     // Minimum radius for this circle.
                    color       : grad,                                     // The gradient to use for filling the circle.
                    param       : 0,                                        // Animation parameter for fractal interpolation.
                    changeSpeed : 1 / 250,                                  // Speed at which 'param' changes.
                    phase       : Math.random() * TWO_PI,                   // Random phase for individual circle rotation.
                    globalPhase : Math.random() * TWO_PI                    // Random phase for global vertical oscillation.
                };

                this.circles.push( newCircle ); // Add the new circle to the array.

                // Generate initial fractal point lists for the circle's shape.
                newCircle.pointList1 = this.setLinePoints( this.settings.iterations );
                newCircle.pointList2 = this.setLinePoints( this.settings.iterations );

            } // End of for loop through numCircles.

        }, // End of setCircles.

        // This function is called repeatedly by the animation timer.
        onTimer: function () {

            var i, j;         // Loop counters.
            var c;            // Current circle object.
            var rad;          // Current radius during drawing.
            var point1, point2; // Points from the fractal lists.
            var x0, y0;       // Calculated coordinates for drawing.
            var cosParam;     // Cosine of the animation parameter.
            var theta;        // Angle for polar coordinates.

            // A factor to simulate a cheap 3D effect by compressing in X.
            var xSqueeze = 0.75;

            var yOffset;      // Vertical offset for global oscillation.

            // Loop to draw multiple times per frame, enhancing smoothness.
            for ( j = 0; j < this.settings.drawsPerFrame; j++ ) {

                this.drawCount++; // Increment the global draw counter.

                // Iterate through each smoke circle.
                for ( i = 0; i < this.settings.numCircles; i++ ) {

                    c = this.circles[i]; // Get the current circle.

                    c.param += c.changeSpeed; // Advance the animation parameter.

                    // If animation parameter reaches 1, reset and update point lists.
                    if ( c.param >= 1 ) {

                        c.param = 0; // Reset parameter.

                        // Swap point lists for continuous animation.
                        c.pointList1 = c.pointList2;
                        c.pointList2 = this.setLinePoints( this.settings.iterations );

                    }

                    // Calculate cosine of param for smooth interpolation.
                    cosParam = 0.5 - 0.5 * Math.cos( Math.PI * c.param );

                    // Set drawing style for the current circle.
                    this.context.strokeStyle = c.color;
                    this.context.lineWidth   = this.settings.lineWidth;

                    this.context.beginPath(); // Start a new path.

                    // Get the first points from the fractal lists.
                    point1 = c.pointList1.first;
                    point2 = c.pointList2.first;

                    // Slowly rotate the circle's phase for dynamic appearance.
                    c.phase += 0.0002;

                    theta = c.phase; // Initial angle.

                    // Interpolate radius based on current animation parameter and fractal points.
                    rad = c.minRad + ( point1.y + cosParam * ( point2.y - point1.y ) ) * ( c.maxRad - c.minRad );

                    // Move the circle's center to the right.
                    c.centerX += 0.5;
                    c.centerY += 0.04;

                    // Calculate vertical oscillation offset.
                    yOffset = 40 * Math.sin( c.globalPhase + this.drawCount / 1000 * TWO_PI );

                    // Check if the circle has moved entirely off-screen.
                    if ( c.centerX > this.displayWidth + this.settings.maxMaxRad ) {

                        clearInterval( timer ); // Stop the animation timer.
                        timer = null;           // Clear the timer reference.

                    }

                    // Apply a transformation to draw the circle at its new position and apply squeeze.
                    this.context.setTransform( xSqueeze, 0, 0, 1, c.centerX, c.centerY + yOffset );

                    // Calculate the first point's Cartesian coordinates.
                    x0 = xSqueeze * rad * Math.cos( theta );
                    y0 = rad * Math.sin( theta );
                    this.context.lineTo( x0, y0 ); // Move to the first point.

                    // Iterate through the linked list of fractal points to draw the curve.
                    while ( point1.next != null ) {

                        point1 = point1.next; // Advance to the next point in list 1.
                        point2 = point2.next; // Advance to the next point in list 2.

                        // Interpolate angle and radius.
                        theta = TWO_PI * ( point1.x + cosParam * ( point2.x - point1.x ) ) + c.phase;
                        rad   = c.minRad + ( point1.y + cosParam * ( point2.y - point1.y ) ) * ( c.maxRad - c.minRad );

                        // Calculate Cartesian coordinates.
                        x0 = xSqueeze * rad * Math.cos( theta );
                        y0 = rad * Math.sin( theta );

                        this.context.lineTo( x0, y0 ); // Draw line segment to this point.

                    }

                    this.context.closePath(); // Close the path to form a complete shape.
                    this.context.stroke();    // Draw the outline of the shape.

                } // End of inner for loop (numCircles).

            } // End of outer for loop (drawsPerFrame).

        }, // End of onTimer.

        // Generates a linked list of points using fractal subdivision (midpoint displacement).
        setLinePoints: function ( iterations ) {

            var pointList = {}; // Object to hold the linked list.
            pointList.first = { x: 0, y: 1 }; // Starting point.

            var lastPoint = { x: 1, y: 1 }; // Ending point.

            var minY = 1; // Track minimum Y value for normalization.
            var maxY = 1; // Track maximum Y value for normalization.

            var point;     // Current point in the list.
            var nextPoint; // Next point in the list.

            var dx, newX, newY; // Delta X, new X, new Y for midpoint.

            // Connect the first and last points.
            pointList.first.next = lastPoint;

            // Perform fractal subdivision for specified iterations.
            for ( var i = 0; i < iterations; i++ ) {

                point = pointList.first; // Start from the beginning of the list.

                while ( point.next != null ) {

                    nextPoint = point.next; // Get the next point.

                    dx = nextPoint.x - point.x; // Calculate horizontal distance.

                    newX = 0.5 * ( point.x + nextPoint.x ); // Midpoint X.
                    newY = 0.5 * ( point.y + nextPoint.y ); // Midpoint Y.

                    // Displace the midpoint Y randomly.
                    newY += dx * ( Math.random() * 2 - 1 );

                    var newPoint = { x: newX, y: newY }; // Create the new midpoint.

                    // Update min/max Y values.
                    if ( newY < minY ) {
                        minY = newY;
                    } else if ( newY > maxY ) {
                        maxY = newY;
                    }

                    // Insert the new point into the linked list.
                    newPoint.next = nextPoint;
                    point.next    = newPoint;

                    point = nextPoint; // Move to the next original segment.

                } // End of while loop for current iteration.

            } // End of for loop for iterations.

            // Normalize Y values to be between 0 and 1.
            if ( maxY != minY ) {

                var normalizeRate = 1 / ( maxY - minY );
                point = pointList.first;

                while ( point != null ) {

                    point.y = normalizeRate * ( point.y - minY );
                    point = point.next;

                }

            }
            // If max == min (unlikely for >0 iterations), set all Y to 1.
            else {

                point = pointList.first;

                while ( point != null ) {

                    point.y = 1;
                    point = point.next;

                }

            }

            return pointList; // Return the generated linked list of points.

        }, // End of setLinePoints.

        // Allows setting an individual option after initialization.
        setOption: function ( optionName, optionValue ) {

            this.settings[optionName] = optionValue;

        }, // End of setOption.

        // Converts a hex color string to an RGBA string.
        hexToRGBA: function ( hex, opacity ) {

            hex = hex.replace( '#', '' ); // Remove the '#' prefix.

            // Parse R, G, B components.
            r = parseInt( hex.substring( 0, 2 ), 16 );
            g = parseInt( hex.substring( 2, 4 ), 16 );
            b = parseInt( hex.substring( 4, 6 ), 16 );

            // Construct the RGBA string.
            result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')';

            return result; // Return the RGBA string.

        }, // End of hexToRGBA.

        // Downloads the current canvas content as a PNG image.
        download: function ( width, height ) {

            // Draw the display canvas content onto the export canvas, scaling if needed.
            this.exportContext.drawImage( this.displayCanvas[0], 0, 0, width, height, 0, 0, width, height );

            // Retrieve the canvas image as a data URL.
            var dataURL = this.exportCanvas.toDataURL( "image/png" );

            // Open a new window with appropriate size to hold the image.
            var imageWindow = window.open( "", "fractalLineImage", "left=0,top=0,width=" + width + ",height=" + height + ",toolbar=0,resizable=0" );

            // Write HTML into the new window to create an empty image element.
            imageWindow.document.write( "<title>Export Image</title>" );
            imageWindow.document.write( "<img id='exportImage'"
                                        + " alt=''"
                                        + " height='" + height + "'"
                                        + " width='" + width + "'"
                                        + " style='position:absolute;left:0;top:0'/>" );
            imageWindow.document.close();

            // Copy the image data URL into the empty image element in the new window.
            var exportImage = imageWindow.document.getElementById( "exportImage" );
            exportImage.src = dataURL;

        } // End of download.

    }; // End of Smoke.prototype.


    // Constructor for creating a radial gradient-like background fill.
    function SmokeNiceBG ( _x0, _y0, _rad0, _x1, _y1, _rad1 ) {

        this.x0 = _x0;     // Start X coordinate for the gradient.
        this.y0 = _y0;     // Start Y coordinate for the gradient.
        this.x1 = _x1;     // End X coordinate for the gradient.
        this.y1 = _y1;     // End Y coordinate for the gradient.
        this.rad0 = _rad0; // Start radius for the gradient.
        this.rad1 = _rad1; // End radius for the gradient.

        this.colorStops = []; // Array to store color stop definitions.

    } // End of SmokeNiceBG constructor.


    // Adds a color stop to the gradient.
    SmokeNiceBG.prototype.addColorStop = function ( ratio, r, g, b ) {

        // Validate ratio: must be between 0 and 1.
        if ( ( ratio < 0 ) || ( ratio > 1 ) ) {
            return;
        }

        var newStop = { ratio: ratio, r: r, g: g, b: b }; // Create new color stop object.

        if ( ( ratio >= 0 ) && ( ratio <= 1 ) ) {

            if ( this.colorStops.length == 0 ) {
                this.colorStops.push( newStop ); // If no stops, just add it.
            } else {

                var i = 0;       // Loop counter.
                var found = false; // Flag to indicate insertion point found.
                var len = this.colorStops.length; // Number of existing stops.

                // Search for the proper place to insert the new stop, maintaining order.
                while ( ( !found ) && ( i < len ) ) {

                    found = ( ratio <= this.colorStops[i].ratio ); // Check if current ratio is greater or equal.
                    if ( !found ) {
                        i++;
                    }

                }

                // Add or replace the stop.
                if ( !found ) {
                    this.colorStops.push( newStop ); // Place at the end if no larger ratio found.
                } else {

                    if ( ratio == this.colorStops[i].ratio ) {
                        this.colorStops.splice( i, 1, newStop ); // Replace if ratio is a duplicate.
                    } else {
                        this.colorStops.splice( i, 0, newStop ); // Insert if ratio is unique and found position.
                    }

                }

            }

        }

    }; // End of addColorStop.


    // Fills a rectangle with the custom radial gradient, using Floyd-Steinberg dithering.
    SmokeNiceBG.prototype.fillRect = function ( ctx, rectX0, rectY0, rectW, rectH ) {

        if ( this.colorStops.length == 0 ) {
            return; // Nothing to draw if no color stops defined.
        }

        // Get image data for the target rectangle.
        var image = ctx.getImageData( rectX0, rectY0, rectW, rectH );
        var pixelData = image.data; // Raw pixel array.
        var len = pixelData.length; // Total length of pixel data (R,G,B,A for each pixel).

        var x; // Current pixel's X coordinate.
        var y; // Current pixel's Y coordinate.

        var ratio; // Interpolated ratio for gradient.

        var r, g, b; // Calculated RGB values.
        var r0, g0, b0, r1, g1, b1; // RGB values of adjacent color stops.
        var ratio0, ratio1; // Ratios of adjacent color stops.
        var f; // Interpolation factor between two color stops.
        var stopNumber; // Index of the upper color stop.
        var found; // Flag for finding color stop.

        var rBuffer = []; // Buffer for float R values.
        var gBuffer = []; // Buffer for float G values.
        var bBuffer = []; // Buffer for float B values.

        var a, b, c, discrim; // Variables for quadratic equation.
        var dx, dy; // Delta X, Delta Y from gradient start point.

        // Pre-calculate differences for quadratic equation.
        var xDiff = this.x1 - this.x0;
        var yDiff = this.y1 - this.y0;
        var rDiff = this.rad1 - this.rad0;

        a = rDiff * rDiff - xDiff * xDiff - yDiff * yDiff;
        var rConst1 = 2 * this.rad0 * ( this.rad1 - this.rad0 );
        var r0Square = this.rad0 * this.rad0;

        // Ensure color stops exist at ratio 0 and 1.
        if ( this.colorStops[0].ratio != 0 ) {

            var newStop = {
                ratio: 0,
                r    : this.colorStops[0].r,
                g    : this.colorStops[0].g,
                b    : this.colorStops[0].b
            };
            this.colorStops.splice( 0, 0, newStop ); // Insert at beginning.

        }
        if ( this.colorStops[this.colorStops.length - 1].ratio != 1 ) {

            var newStop = {
                ratio: 1,
                r    : this.colorStops[this.colorStops.length - 1].r,
                g    : this.colorStops[this.colorStops.length - 1].g,
                b    : this.colorStops[this.colorStops.length - 1].b
            };
            this.colorStops.push( newStop ); // Append to end.

        }

        // --- First pass: Calculate float-valued colors for each pixel ---
        for ( i = 0; i < len / 4; i++ ) {

            x = rectX0 + ( i % rectW );       // Current pixel's absolute X.
            y = rectY0 + Math.floor( i / rectW ); // Current pixel's absolute Y.

            dx = x - this.x0; // Distance from gradient start point X.
            dy = y - this.y0; // Distance from gradient start point Y.

            // Solve quadratic equation for 'ratio'.
            b = rConst1 + 2 * ( dx * xDiff + dy * yDiff );
            c = r0Square - dx * dx - dy * dy;
            discrim = b * b - 4 * a * c;

            if ( discrim >= 0 ) { // If a real solution exists.

                ratio = ( -b + Math.sqrt( discrim ) ) / ( 2 * a ); // Use the positive solution.

                // Clamp ratio to [0, 1].
                if ( ratio < 0 ) {
                    ratio = 0;
                } else if ( ratio > 1 ) {
                    ratio = 1;
                }

                // Find which two color stops this ratio falls between.
                if ( ratio == 1 ) {
                    stopNumber = this.colorStops.length - 1;
                } else {

                    stopNumber = 0;
                    found = false;
                    while ( !found ) {

                        found = ( ratio < this.colorStops[stopNumber].ratio );
                        if ( !found ) {
                            stopNumber++;
                        }

                    }

                }

                // Calculate the interpolated color.
                r0 = this.colorStops[stopNumber - 1].r;
                g0 = this.colorStops[stopNumber - 1].g;
                b0 = this.colorStops[stopNumber - 1].b;
                r1 = this.colorStops[stopNumber].r;
                g1 = this.colorStops[stopNumber].g;
                b1 = this.colorStops[stopNumber].b;

                ratio0 = this.colorStops[stopNumber - 1].ratio;
                ratio1 = this.colorStops[stopNumber].ratio;

                f = ( ratio - ratio0 ) / ( ratio1 - ratio0 ); // Interpolation factor.

                r = r0 + ( r1 - r0 ) * f;
                g = g0 + ( g1 - g0 ) * f;
                b = b0 + ( b1 - b0 ) * f;

            } else { // If no real solution (pixel outside gradient range).

                r = r0; // Use the color of the first stop (or closest, depending on implementation).
                g = g0;
                b = b0;

            }

            // Store calculated float values in buffers.
            rBuffer.push( r );
            gBuffer.push( g );
            bBuffer.push( b );

        } // End of first pass loop.


        // --- Second pass: Apply Floyd-Steinberg dithering and convert to integer colors ---
        var nearestValue; // Nearest integer color component.
        var quantError;   // Quantization error.

        for ( i = 0; i < len / 4; i++ ) {

            // Dither Red component.
            nearestValue = ~~( rBuffer[i] ); // Truncate to integer.
            quantError = rBuffer[i] - nearestValue; // Calculate error.

            // Distribute error to neighboring pixels (Floyd-Steinberg coefficients).
            if (i + 1 < len/4) rBuffer[i + 1] += 7 / 16 * quantError;
            if (i - 1 + rectW < len/4 && i - 1 + rectW >= 0) rBuffer[i - 1 + rectW] += 3 / 16 * quantError;
            if (i + rectW < len/4) rBuffer[i + rectW] += 5 / 16 * quantError;
            if (i + 1 + rectW < len/4) rBuffer[i + 1 + rectW] += 1 / 16 * quantError;

            // Dither Green component.
            nearestValue = ~~( gBuffer[i] );
            quantError = gBuffer[i] - nearestValue;

            if (i + 1 < len/4) gBuffer[i + 1] += 7 / 16 * quantError;
            if (i - 1 + rectW < len/4 && i - 1 + rectW >= 0) gBuffer[i - 1 + rectW] += 3 / 16 * quantError;
            if (i + rectW < len/4) gBuffer[i + rectW] += 5 / 16 * quantError;
            if (i + 1 + rectW < len/4) gBuffer[i + 1 + rectW] += 1 / 16 * quantError;

            // Dither Blue component.
            nearestValue = ~~( bBuffer[i] );
            quantError = bBuffer[i] - nearestValue;

            if (i + 1 < len/4) bBuffer[i + 1] += 7 / 16 * quantError;
            if (i - 1 + rectW < len/4 && i - 1 + rectW >= 0) bBuffer[i - 1 + rectW] += 3 / 16 * quantError;
            if (i + rectW < len/4) bBuffer[i + rectW] += 5 / 16 * quantError;
            if (i + 1 + rectW < len/4) bBuffer[i + 1 + rectW] += 1 / 16 * quantError;

            // Clamp final RGB values to [0, 255] and set in pixel data.
            pixelData[i * 4 + 0] = Math.max( 0, Math.min( 255, ~~( rBuffer[i] ) ) ); // Red
            pixelData[i * 4 + 1] = Math.max( 0, Math.min( 255, ~~( gBuffer[i] ) ) ); // Green
            pixelData[i * 4 + 2] = Math.max( 0, Math.min( 255, ~~( bBuffer[i] ) ) ); // Blue
            pixelData[i * 4 + 3] = 255;                                              // Alpha (fully opaque)

        } // End of second pass loop.

        ctx.putImageData( image, rectX0, rectY0 ); // Put the modified pixel data back onto the canvas.

    }; // End of fillRect.


    // jQuery plugin integration: wraps the Smoke constructor.
    $.fn[pluginName] = function ( options ) {

        return this.each( function () {

            // Prevent multiple instantiations on the same element.
            if ( !$.data( this, "plugin_" + pluginName ) ) {

                // Store plugin instance in element's data.
                $.data( this, "plugin_" + pluginName, new Smoke( this, options ) );

            }

        } );

    }; // End of jQuery plugin definition.

} )( jQuery, window, document ); // Pass jQuery, window, and document to the IIFE.