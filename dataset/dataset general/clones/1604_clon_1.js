/*
 * Farbtastic Color Picker Library
 * Version: 2.0.0-alpha.1
 * This file contains the core Farbtastic implementation.
 * Created for educational purposes of code cloning.
 */
( function( $ ) {

    // Internal debugging flag, set to true for verbose console output
    var __debug = false;

    /**
     * jQuery plugin entry point for Farbtastic.
     * Attaches Farbtastic to the selected DOM element(s).
     * @param {object} options - Configuration options for Farbtastic.
     * @returns {jQuery} The jQuery object for chaining.
     */
    $.fn.farbtastic = function( options ) {
        // Delegate to the main Farbtastic constructor
        $.farbtastic( this, options );

        // Return the jQuery object for method chaining
        return this;
    };

    /**
     * Main Farbtastic constructor function.
     * Initializes a new Farbtastic instance on a given container.
     * @param {HTMLElement|jQuery} container - The DOM element or jQuery object to attach Farbtastic to.
     * @param {object} options - Configuration options.
     * @returns {object} The Farbtastic instance.
     */
    $.farbtastic = function( container, options ) {
        // Ensure we have a raw DOM element from the container
        var container = $( container )[0];

        // If an instance already exists, return it; otherwise, create a new one
        return container.farbtastic || ( container.farbtastic = new $._farbtastic( container, options ) );
    }

    /**
     * Internal Farbtastic class constructor.
     * This is the actual implementation of the color picker logic.
     * @param {HTMLElement} container - The DOM element where the color picker will be rendered.
     * @param {object} options - Options for the color picker.
     */
    $._farbtastic = function( container, options ) {
        var fb = this; // Store reference to the Farbtastic instance

        // --- Core Farbtastic Functionality ---

        /**
         * Links the color picker to an input element or a custom callback function.
         * When the color changes, the linked element's value or the callback will be updated.
         * @param {string|HTMLElement|jQuery|function} callback - Selector, element, or function to link to.
         * @returns {object} The Farbtastic instance for chaining.
         */
        fb.linkTo = function( callback ) {
            // Unbind any previously linked keyup event handlers if the callback was an object (input field)
            if ( typeof fb.callback == 'object' ) {
                $( fb.callback ).unbind( 'keyup', fb.updateValue );
            }

            // Reset the internal color state
            fb.color = null;

            // Bind the new callback or elements based on its type
            if ( typeof callback == 'function' ) {
                fb.callback = callback; // Assign the function directly
            }
            else if ( typeof callback == 'object' || typeof callback == 'string' ) {
                fb.callback = $( callback ); // Convert to jQuery object
                fb.callback.bind( 'keyup', fb.updateValue ); // Bind keyup for immediate updates from input

                // If the linked element has a value, initialize the color picker with it
                if ( fb.callback[0] && fb.callback[0].value ) {
                    fb.setColor( fb.callback[0].value );
                }
            }
            return this; // Allow method chaining
        }; // End of fb.linkTo function

        /**
         * Event handler for keyup on linked input fields.
         * Updates the color picker's color if the input value changes.
         * @param {Event} event - The keyup event object.
         */
        fb.updateValue = function( event ) {
            // Check if the input has a value and if it's different from the current color
            if ( this.value && this.value != fb.color ) {
                fb.setColor( this.value ); // Update Farbtastic's color
            }
        }; // End of fb.updateValue

        /**
         * Sets the color of the picker using an HTML hexadecimal string (e.g., "#RRGGBB").
         * Triggers display update if the color is new and valid.
         * @param {string} color - The hexadecimal color string.
         * @returns {object} The Farbtastic instance for chaining.
         */
        fb.setColor = function( color ) {
            var unpack = fb.unpack( color ); // Attempt to parse the color string

            // Only update if the color has actually changed and is a valid format
            if ( fb.color != color && unpack ) {
                fb.color = color;       // Store hex color
                fb.rgb = unpack;        // Store RGB triplet
                fb.hsl = fb.RGBToHSL( fb.rgb ); // Convert to HSL
                fb.updateDisplay();     // Redraw the picker display
            }
            return this; // Allow method chaining
        }; // End of fb.setColor

        /**
         * Sets the color of the picker using an HSL triplet array (e.g., [hue, saturation, lightness]).
         * Values should be between 0 and 1.
         * @param {number[]} hsl - The HSL color triplet.
         * @returns {object} The Farbtastic instance for chaining.
         */
        fb.setHSL = function( hsl ) {
            fb.hsl = hsl;                   // Store HSL triplet
            fb.rgb = fb.HSLToRGB( hsl );    // Convert to RGB
            fb.color = fb.pack( fb.rgb );   // Convert to hex color string
            fb.updateDisplay();             // Redraw the picker display
            return this; // Allow method chaining
        }; // End of fb.setHSL

        // --- Widget Initialization and Drawing ---

        /**
         * Initializes the visual components of the color picker widget.
         * This includes creating the DOM structure and canvas elements.
         */
        fb.initWidget = function() {

            // Calculate dimensions for the widget
            var dim = {
                width : options.width,
                height: options.width
            };

            // Build the HTML structure within the container
            $( container )
                .html(
                    '<div class="farbtastic" style="position: relative">' +
                      '<div class="farbtastic-solid"></div>' +
                      '<canvas class="farbtastic-mask"></canvas>' +
                      '<canvas class="farbtastic-overlay"></canvas>' +
                    '</div>'
                )
                .find( '*' )
                    .attr( dim ) // Set width/height attributes
                    .css( dim )  // Apply width/height CSS
                .end()
                .find( 'div > *' )
                    .css( 'position', 'absolute' ); // Position internal elements absolutely

            // IE Fix: Recreate canvas elements with document.createElement for excanvas compatibility.
            // This block is for older IE versions that don't natively support canvas.
            // Modern browsers will skip this.
            if ( $.browser.msie || false ) {
                $( 'canvas', container ).each( function() {
                    // Fetch original attributes
                    var attr = { 'class': $( this ).attr( 'class' ), style: this.getAttribute( 'style' ) },
                        e = document.createElement( 'canvas' ); // Create new canvas element

                    // Replace the existing canvas element in the DOM
                    $( this ).before( $( e ).attr( attr ) ).remove();

                    // Initialize with explorerCanvas if available (G_vmlCanvasManager)
                    if ( typeof G_vmlCanvasManager !== 'undefined' ) {
                        G_vmlCanvasManager.initElement( e );
                    }

                    // Set dimensions and absolute positioning for the new canvas
                    $( e ).attr( dim ).css( dim ).css( 'position', 'absolute' )
                        .find( '*' ).attr( dim ).css( dim ); // Apply to any internal elements created by excanvas
                } );
            }


            // Determine layout parameters based on options
            fb.radius = ( options.width - options.wheelWidth ) / 2 - 1; // Radius of the color wheel
            fb.square = Math.floor( ( fb.radius - options.wheelWidth / 2 ) * 0.7 ) - 1; // Size of the saturation/luminance square
            fb.mid = Math.floor( options.width / 2 ); // Center point of the widget
            fb.markerSize = options.wheelWidth * 0.3; // Size of the selection markers

            // Initialize the solid color fill element
            fb.solidFill = $( '.farbtastic-solid', container ).css( {
                width : fb.square * 2 - 1,
                height: fb.square * 2 - 1,
                left  : fb.mid - fb.square,
                top   : fb.mid - fb.square
            } );

            // Get canvas contexts for drawing
            fb.cnvMask = $( '.farbtastic-mask', container );
            fb.ctxMask = fb.cnvMask[0].getContext( '2d' ); // Context for wheel and mask
            fb.cnvOverlay = $( '.farbtastic-overlay', container );
            fb.ctxOverlay = fb.cnvOverlay[0].getContext( '2d' ); // Context for markers

            // Translate contexts to the center of the canvas for easier drawing
            fb.ctxMask.translate( fb.mid, fb.mid );
            fb.ctxOverlay.translate( fb.mid, fb.mid );

            // Draw the static base layers of the widget
            fb.drawCircle();
            fb.drawMask();
        }; // End of fb.initWidget

        /**
         * Draws the color wheel (hue ring) on the mask canvas.
         * Uses a series of gradient-stroked bezier curves for smooth color transitions.
         */
        fb.drawCircle = function() {
            var tm = +( new Date() ); // For performance timing

            // Drawing parameters
            var n = 24, // Number of segments for the wheel
                r = fb.radius, // Outer radius of the wheel
                w = options.wheelWidth, // Width of the wheel band
                nudge = 8 / r / n * Math.PI, // Small adjustment to prevent seams
                m = fb.ctxMask, // Mask canvas context
                angle1 = 0, color1, d1; // Initial angle, color, and data point

            m.save(); // Save the current canvas state
            m.lineWidth = w / r; // Line width relative to the scaled radius
            m.scale( r, r ); // Scale the context to simplify drawing coordinates

            // Iterate through segments to draw the color wheel
            for ( var i = 0; i <= n; ++i ) {
                var d2 = i / n, // Current data point (0 to 1)
                    angle2 = d2 * Math.PI * 2, // Current angle in radians
                    // Endpoints for the current segment
                    x1 = Math.sin( angle1 ), y1 = -Math.cos( angle1 ),
                    x2 = Math.sin( angle2 ), y2 = -Math.cos( angle2 ),
                    // Midpoint for the quadratic bezier curve, tangent to the circle
                    am = ( angle1 + angle2 ) / 2,
                    tan = 1 / Math.cos( ( angle2 - angle1 ) / 2 ),
                    xm = Math.sin( am ) * tan, ym = -Math.cos( am ) * tan,
                    // Calculate the new color for the segment
                    color2 = fb.pack( fb.HSLToRGB( [ d2, 1, 0.5 ] ) );

                if ( i > 0 ) {
                    // Special handling for IE due to gradient calculation issues
                    if ( $.browser.msie || false ) {
                        // Apply a correction factor for IE's gradient rendering
                        var corr = ( 1 + Math.min( Math.abs( Math.tan( angle1 ) ), Math.abs( Math.tan( Math.PI / 2 - angle1 ) ) ) ) / n;
                        color1 = fb.pack( fb.HSLToRGB( [ d1 - 0.15 * corr, 1, 0.5 ] ) );
                        color2 = fb.pack( fb.HSLToRGB( [ d2 + 0.15 * corr, 1, 0.5 ] ) );

                        // Create a linear gradient fill for the segment
                        var grad = m.createLinearGradient( x1, y1, x2, y2 );
                        grad.addColorStop( 0, color1 );
                        grad.addColorStop( 1, color2 );
                        m.fillStyle = grad;

                        // Draw the quadratic curve segment as a filled shape
                        var r1 = ( r + w / 2 ) / r, r2 = ( r - w / 2 ) / r; // Inner/outer radius for the fill
                        m.beginPath();
                        m.moveTo( x1 * r1, y1 * r1 );
                        m.quadraticCurveTo( xm * r1, ym * r1, x2 * r1, y2 * r1 );
                        m.lineTo( x2 * r2, y2 * r2 );
                        m.quadraticCurveTo( xm * r2, ym * r2, x1 * r2, y1 * r2 );
                        m.fill();
                    }
                    else {
                        // For non-IE browsers, use a gradient stroke
                        var grad = m.createLinearGradient( x1, y1, x2, y2 );
                        grad.addColorStop( 0, color1 );
                        grad.addColorStop( 1, color2 );
                        m.strokeStyle = grad;

                        // Draw the quadratic curve segment as a stroke
                        m.beginPath();
                        m.moveTo( x1, y1 );
                        m.quadraticCurveTo( xm, ym, x2, y2 );
                        m.stroke();
                    }
                }
                // Update for the next segment, with a slight nudge to prevent gaps
                angle1 = angle2 - nudge;
                color1 = color2;
                d1 = d2;
            }
            m.restore(); // Restore the canvas state
            __debug && $( 'body' ).append( '<div>drawCircle ' + ( +( new Date() ) - tm ) + 'ms' ); // Debug timing
        }; // End of fb.drawCircle

        /**
         * Draws the saturation/luminance mask in the center square.
         * This mask defines how saturation and luminance affect the displayed color.
         */
        fb.drawMask = function() {
            var tm = +( new Date() ); // For performance timing

            // Dimensions of the saturation/luminance square
            var size = fb.square * 2, sq = fb.square;

            /**
             * Helper function to calculate mask pixel values.
             * Iterates over a grid and computes an alpha and grayscale value.
             * @param {number} sizex - Width of the grid.
             * @param {number} sizey - Height of the grid.
             * @param {function(x, y, c, a)} outputPixel - Callback to handle each calculated pixel.
             */
            function calculateMask( sizex, sizey, outputPixel ) {
                var isx = 1 / sizex, isy = 1 / sizey;
                for ( var y = 0; y <= sizey; ++y ) {
                    var l = 1 - y * isy; // Luminance (vertical axis)
                    for ( var x = 0; x <= sizex; ++x ) {
                        var s = 1 - x * isx; // Saturation (horizontal axis)

                        // Calculate alpha and grayscale color based on HSL logic
                        var a = 1 - 2 * Math.min( l * s, ( 1 - l ) * s );
                        var c = ( a > 0 ) ? ( ( 2 * l - 1 + a ) * .5 / a ) : 0;
                        outputPixel( x, y, c, a ); // Call the output handler
                    }
                }
            }

            // Method #1: Direct pixel manipulation using getImageData (modern Canvas)
            if ( fb.ctxMask.getImageData ) {
                // Create a half-resolution buffer canvas for better performance
                var sz = Math.floor( size / 2 );
                var buffer = document.createElement( 'canvas' );
                buffer.width = buffer.height = sz + 1;
                var ctx = buffer.getContext( '2d' );
                var frame = ctx.getImageData( 0, 0, sz + 1, sz + 1 );

                var i = 0;
                calculateMask( sz, sz, function( x, y, c, a ) {
                    frame.data[i++] = frame.data[i++] = frame.data[i++] = c * 255; // RGB channels
                    frame.data[i++] = a * 255; // Alpha channel
                } );

                ctx.putImageData( frame, 0, 0 ); // Put the pixel data onto the buffer
                // Draw the buffer onto the main mask canvas, scaled up
                fb.ctxMask.drawImage( buffer, 0, 0, sz + 1, sz + 1, -sq, -sq, sq * 2, sq * 2 );
            }
            // Method #2: Drawing commands (older Canvas, non-IE)
            else if ( !( $.browser.msie || false ) ) {
                // Render directly at half-resolution using fillRect
                var sz = Math.floor( size / 2 );
                calculateMask( sz, sz, function( x, y, c, a ) {
                    c = Math.round( c * 255 );
                    fb.ctxMask.fillStyle = 'rgba(' + c + ', ' + c + ', ' + c + ', ' + a + ')';
                    fb.ctxMask.fillRect( x * 2 - sq - 1, y * 2 - sq - 1, 2, 2 ); // Draw 2x2 pixel blocks
                } );
            }
            // Method #3: Vertical DXImageTransform gradient strips (IE specific)
            else {
                var cache_last, cache, w = 6; // Each strip is 6 pixels wide
                var sizex = Math.floor( size / w ); // Number of strips

                // Calculate mask in chunks, then apply IE gradients
                calculateMask( sizex, 6, function( x, y, c, a ) {
                    if ( x == 0 ) {
                        cache_last = cache; // Store previous row's cache
                        cache = [];         // Initialize new row's cache
                    }
                    c = Math.round( c * 255 );
                    a = Math.round( a * 255 );

                    // Only start outputting gradients once we have two rows of pixels
                    if ( y > 0 ) {
                        var c_last = cache_last[x][0],
                            a_last = cache_last[x][1],
                            color1 = fb.packDX( c_last, a_last ),
                            color2 = fb.packDX( c, a ),
                            y1 = Math.round( fb.mid + ( ( y - 1 ) * .333 - 1 ) * sq ),
                            y2 = Math.round( fb.mid + ( y * .333 - 1 ) * sq );

                        // Create a div and apply IE's proprietary gradient filter
                        $( '<div>' ).css( {
                            position: 'absolute',
                            filter  : "progid:DXImageTransform.Microsoft.Gradient(StartColorStr=" + color1 + ", EndColorStr=" + color2 + ", GradientType=0)",
                            top     : y1,
                            height  : y2 - y1,
                            left    : fb.mid + ( x * w - sq - 1 ),
                            width   : w - ( x == sizex ? Math.round( w / 2 ) : 0 ) // Adjust width for the last strip
                        } ).appendTo( fb.cnvMask );
                    }
                    cache.push( [ c, a ] ); // Store current pixel for the next row's calculation
                } );
            }
            __debug && $( 'body' ).append( '<div>drawMask ' + ( +( new Date() ) - tm ) + 'ms' ); // Debug timing
        }; // End of fb.drawMask

        /**
         * Draws the selection markers (circles) on the overlay canvas.
         * One marker for hue, another for saturation/luminance.
         */
        fb.drawMarkers = function() {
            // Determine marker dimensions
            var sz = options.width, lw = Math.ceil( fb.markerSize / 4 ), r = fb.markerSize - lw + 1;

            // Calculate positions for hue and sat/lum markers
            var angle = fb.hsl[0] * 6.28, // Hue angle in radians
                x1 = Math.sin( angle ) * fb.radius, // Hue marker X
                y1 = -Math.cos( angle ) * fb.radius, // Hue marker Y
                x2 = 2 * fb.square * ( .5 - fb.hsl[1] ), // Sat/Lum marker X (based on saturation)
                y2 = 2 * fb.square * ( .5 - fb.hsl[2] ), // Sat/Lum marker Y (based on luminance)
                c1 = fb.invert ? '#fff' : '#000', // Marker color for contrast
                c2 = fb.invert ? '#000' : '#fff'; // Inverted marker color

            // Define the circles to be drawn (outer and inner rings for each marker)
            var circles = [
                { x: x1, y: y1, r: r,             c: '#000', lw: lw + 1 }, // Hue marker outer ring (black)
                { x: x1, y: y1, r: fb.markerSize, c: '#fff', lw: lw     }, // Hue marker inner ring (white)
                { x: x2, y: y2, r: r,             c: c2,     lw: lw + 1 }, // Sat/Lum marker outer ring (contrast color)
                { x: x2, y: y2, r: fb.markerSize, c: c1,     lw: lw     }, // Sat/Lum marker inner ring (contrast color)
            ];

            // Clear the overlay canvas before redrawing markers
            fb.ctxOverlay.clearRect( -fb.mid, -fb.mid, sz, sz );

            // Draw each circle
            for ( var i = 0; i < circles.length; i++ ) {
                var c = circles[i];
                fb.ctxOverlay.lineWidth = c.lw;       // Set line width
                fb.ctxOverlay.strokeStyle = c.c;      // Set stroke color
                fb.ctxOverlay.beginPath();            // Start new path
                fb.ctxOverlay.arc( c.x, c.y, c.r, 0, Math.PI * 2, true ); // Draw circle arc
                fb.ctxOverlay.stroke();               // Apply the stroke
            }
        }; // End of fb.drawMarkers

        /**
         * Updates the entire color picker display, including solid fill, markers,
         * and any linked elements or callbacks. This is called when the color changes.
         */
        fb.updateDisplay = function() {
            // Determine if text/markers should be inverted for better contrast
            // (Based on perceived luminance of the current color)
            fb.invert = ( fb.rgb[0] * 0.3 + fb.rgb[1] * .59 + fb.rgb[2] * .11 ) <= 0.6;

            // Update the background color of the central solid square
            // This displays the pure hue of the current color
            fb.solidFill.css( 'backgroundColor', fb.pack( fb.HSLToRGB( [ fb.hsl[0], 1, 0.5 ] ) ) );

            // Redraw the selection markers
            fb.drawMarkers();

            // Handle linked elements or callback functions
            if ( typeof fb.callback == 'object' ) {
                // Apply background and text color to linked elements
                $( fb.callback ).css( {
                    backgroundColor: fb.color,
                    color          : fb.invert ? '#fff' : '#000' // Invert text color for contrast
                } );

                // Update the 'value' property of linked input fields
                $( fb.callback ).each( function() {
                    if ( ( typeof this.value == 'string' ) && this.value != fb.color ) {
                        this.value = fb.color; // Set input value
                    }
                } ).change(); // Trigger change event
            }
            else if ( typeof fb.callback == 'function' ) {
                // If it's a function, call it with the current color
                fb.callback.call( fb, fb.color );
            }
        }; // End of fb.updateDisplay

        // --- Event Handling ---

        /**
         * Helper function to get coordinates relative to the widget's center.
         * @param {Event} event - The mouse event object.
         * @returns {{x: number, y: number}} Coordinates relative to the center.
         */
        fb.widgetCoords = function( event ) {
            return {
                x: event.pageX - fb.offset.left - fb.mid,
                y: event.pageY - fb.offset.top - fb.mid
            };
        }; // End of fb.widgetCoords

        /**
         * Mousedown event handler for the color picker.
         * Initiates dragging and determines which part of the picker is being interacted with.
         * @param {Event} event - The mousedown event object.
         * @returns {boolean} False to prevent default browser behavior.
         */
        fb.mousedown = function( event ) {
            // Capture mouse events globally during drag
            if ( !$._farbtastic.dragging ) {
                $( document ).bind( 'mousemove', fb.mousemove ).bind( 'mouseup', fb.mouseup );
                $._farbtastic.dragging = true; // Set global dragging flag
            }

            // Update the stored offset of the container to ensure correct coordinate calculations
            fb.offset = $( container ).offset();

            // Determine if the drag started on the color wheel or the saturation/luminance square
            var pos = fb.widgetCoords( event );
            fb.circleDrag = Math.max( Math.abs( pos.x ), Math.abs( pos.y ) ) > ( fb.square + 2 );

            // Process the initial click as a mousemove event
            fb.mousemove( event );
            return false; // Prevent default behavior (e.g., text selection)
        }; // End of fb.mousedown

        /**
         * Mousemove event handler, active during drag operations.
         * Updates the color based on mouse position.
         * @param {Event} event - The mousemove event object.
         * @returns {boolean} False to prevent default browser behavior.
         */
        fb.mousemove = function( event ) {
            // Get coordinates relative to the color picker's center
            var pos = fb.widgetCoords( event );

            // Update HSL parameters based on whether dragging the wheel or the square
            if ( fb.circleDrag ) {
                // Calculate hue from angle
                var hue = Math.atan2( pos.x, -pos.y ) / 6.28;
                fb.setHSL( [ ( hue + 1 ) % 1, fb.hsl[1], fb.hsl[2] ] ); // Update hue, keep sat/lum
            }
            else {
                // Calculate saturation and luminance from position within the square
                var sat = Math.max( 0, Math.min( 1, -( pos.x / fb.square / 2 ) + .5 ) );
                var lum = Math.max( 0, Math.min( 1, -( pos.y / fb.square / 2 ) + .5 ) );
                fb.setHSL( [ fb.hsl[0], sat, lum ] ); // Update sat/lum, keep hue
            }
            return false; // Prevent default behavior
        }; // End of fb.mousemove

        /**
         * Mouseup event handler, ends dragging operation.
         * Unbinds global mouse event listeners.
         */
        fb.mouseup = function() {
            // Release global mouse capture
            $( document ).unbind( 'mousemove', fb.mousemove );
            $( document ).unbind( 'mouseup', fb.mouseup );
            $._farbtastic.dragging = false; // Reset global dragging flag
        }; // End of fb.mouseup

        // --- Color Utility Functions ---

        /**
         * Converts a decimal number to its two-digit hexadecimal string representation.
         * @param {number} x - The decimal number (0-255).
         * @returns {string} The two-digit hex string.
         */
        fb.dec2hex = function( x ) {
            return ( x < 16 ? '0' : '' ) + x.toString( 16 );
        }; // End of fb.dec2hex

        /**
         * Packs color components into an IE-specific ARGB hex string for DXImageTransform.
         * @param {number} c - Grayscale color component (0-255).
         * @param {number} a - Alpha component (0-255).
         * @returns {string} The ARGB hex string.
         */
        fb.packDX = function( c, a ) {
            return '#' + fb.dec2hex( a ) + fb.dec2hex( c ) + fb.dec2hex( c ) + fb.dec2hex( c );
        }; // End of fb.packDX

        /**
         * Packs an RGB triplet into an HTML hexadecimal color string (e.g., "#RRGGBB").
         * @param {number[]} rgb - The RGB triplet (values 0-1).
         * @returns {string} The hexadecimal color string.
         */
        fb.pack = function( rgb ) {
            var r = Math.round( rgb[0] * 255 );
            var g = Math.round( rgb[1] * 255 );
            var b = Math.round( rgb[2] * 255 );
            return '#' + fb.dec2hex( r ) + fb.dec2hex( g ) + fb.dec2hex( b );
        }; // End of fb.pack

        /**
         * Unpacks an HTML hexadecimal color string (e.g., "#RRGGBB" or "#RGB") into an RGB triplet.
         * @param {string} color - The hexadecimal color string.
         * @returns {number[]|undefined} The RGB triplet (values 0-1), or undefined if invalid.
         */
        fb.unpack = function( color ) {
            if ( color.length == 7 ) { // Full hex format #RRGGBB
                function x( i ) {
                    return parseInt( color.substring( i, i + 2 ), 16 ) / 255;
                }
                return [ x( 1 ), x( 3 ), x( 5 ) ];
            }
            else if ( color.length == 4 ) { // Shorthand hex format #RGB
                function x( i ) {
                    return parseInt( color.substring( i, i + 1 ), 16 ) / 15;
                }
                return [ x( 1 ), x( 2 ), x( 3 ) ];
            }
            // Return undefined for invalid formats
        }; // End of fb.unpack

        /**
         * Converts an HSL color triplet to an RGB color triplet.
         * Based on algorithm from easyrgb.com.
         * @param {number[]} hsl - The HSL triplet [h, s, l] (values 0-1).
         * @returns {number[]} The RGB triplet [r, g, b] (values 0-1).
         */
        fb.HSLToRGB = function( hsl ) {
            var m1, m2, r, g, b;
            var h = hsl[0], s = hsl[1], l = hsl[2];

            // Calculate m2
            m2 = ( l <= 0.5 ) ? l * ( s + 1 ) : l + s - l * s;
            // Calculate m1
            m1 = l * 2 - m2;

            // Convert hue to RGB components
            return [
                this.hueToRGB( m1, m2, h + 0.33333 ), // Red
                this.hueToRGB( m1, m2, h ),           // Green
                this.hueToRGB( m1, m2, h - 0.33333 )  // Blue
            ];
        }; // End of fb.HSLToRGB

        /**
         * Helper function for HSLToRGB, converts a hue value to an RGB component.
         * @param {number} m1 - Intermediate value from HSLToRGB.
         * @param {number} m2 - Intermediate value from HSLToRGB.
         * @param {number} h - Hue value (adjusted).
         * @returns {number} The RGB component.
         */
        fb.hueToRGB = function( m1, m2, h ) {
            h = ( h + 1 ) % 1; // Ensure hue is within [0, 1)

            if ( h * 6 < 1 ) return m1 + ( m2 - m1 ) * h * 6;
            if ( h * 2 < 1 ) return m2;
            if ( h * 3 < 2 ) return m1 + ( m2 - m1 ) * ( 0.66666 - h ) * 6;
            return m1;
        }; // End of fb.hueToRGB

        /**
         * Converts an RGB color triplet to an HSL color triplet.
         * Based on algorithm from easyrgb.com.
         * @param {number[]} rgb - The RGB triplet [r, g, b] (values 0-1).
         * @returns {number[]} The HSL triplet [h, s, l] (values 0-1).
         */
        fb.RGBToHSL = function( rgb ) {
            var r = rgb[0], g = rgb[1], b = rgb[2],
                min = Math.min( r, g, b ),
                max = Math.max( r, g, b ),
                delta = max - min,
                h = 0,
                s = 0,
                l = ( min + max ) / 2; // Calculate luminance

            if ( l > 0 && l < 1 ) {
                s = delta / ( l < 0.5 ? ( 2 * l ) : ( 2 - 2 * l ) ); // Calculate saturation
            }

            if ( delta > 0 ) {
                // Calculate hue based on which RGB component is max
                if ( max == r && max != g ) h += ( g - b ) / delta;
                if ( max == g && max != b ) h += ( 2 + ( b - r ) / delta );
                if ( max == b && max != r ) h += ( 4 + ( r - g ) / delta );
                h /= 6; // Normalize hue to 0-1
            }
            return [ h, s, l ];
        }; // End of fb.RGBToHSL

        // --- Initialization Logic ---

        // If options is just a callback function, wrap it in an object
        if ( !options.callback ) {
            options = { callback: options };
        }

        // Extend default options with user-provided options
        options = $.extend( {
            width     : 300, // Default width of the color picker
            wheelWidth: ( options.width || 300 ) / 10, // Default wheel width relative to total width
            callback  : null // Default callback is null
        }, options );

        // Initial setup calls
        fb.initWidget(); // Render the widget UI
        fb.linkTo( options.callback ); // Link to initial callback/element

        // Bind mousedown event to the container for interaction
        $( container ).bind( 'mousedown', fb.mousedown );

        // Set initial color if provided, otherwise default to white
        fb.setColor( options.color || '#FFFFFF' );

    }; // End of $._farbtastic constructor

} )( jQuery ); // Pass jQuery as $ to the immediately invoked function expression