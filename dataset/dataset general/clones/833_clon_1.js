var artisan = ( function ( window, undefined ) {

    /*
     * Artisan.js - A JavaScript library for canvas drawing by David Brooks.
     * Further details and documentation can be found at http://www.artisanjs.com
     * This initial check ensures the browser supports the HTML5 canvas API.
     */
    if ( !document.createElement( 'canvas' ).getContext ) {
        // If canvas context is not available, the module exits gracefully.
        return;
    }

    // --- Internal Data Structures and Configuration ---

    // `stacks`: This array holds collections of layers, which in turn contain drawing histories.
    var stacks              = [];

    // `color_schemes`: An array intended for storing various predefined color palettes.
    var color_schemes       = [];

    // `default_colors`: A set of default hexadecimal color values used when no specific color is provided.
    var default_colors      = [ '#AC4A08', '#6C88A1', '#D9DCC6', '#EB9E1A', '#FBCC37' ];

    // `contexts`: Stores references to 2D rendering contexts for different canvas elements,
    // paired with their respective target element IDs.
    var contexts            = [];

    // `global_rotate`: A variable to store a global rotation value, currently not used in this snippet.
    var global_rotate       = 0;

    // `current_history`: A temporary array that accumulates drawing commands before they are committed
    // to a specific layer's history.
    var current_history     = [];

    // `images`: An array to potentially cache or manage image objects used in drawing operations.
    var images              = [];


    // The public interface of the `artisan` module.
    return {

        // --- Module Definition and Configuration ---
        define: {

            // `canvas`: A placeholder function for defining canvas-specific properties or behaviors.
            canvas: function() {
                // This function can be extended to set up global canvas defaults.
            },

            // `stack`: A placeholder function for defining properties related to a drawing stack.
            stack: function() {
                var colors = []; // A local variable, possibly for stack-specific color definitions.
            },

            // `defaultColors`: Allows overriding the global default color palette.
            defaultColors: function( new_default ) {
                default_colors = new_default; // Assigns the new array of colors.
            }

        }, // End of `define` methods.


        // --- Canvas Initialization ---
        // `setupCanvas`: Retrieves a canvas element by its ID and stores its 2D rendering context.
        setupCanvas: function( target ) {
            var canvas            = document.getElementById( target );
            var context           = canvas.getContext( '2d' );
            var this_context_pair = [ target, context ]; // Create a tuple of ID and context.
            contexts.push( this_context_pair );          // Add to the global list of contexts.
        }, // End of `setupCanvas`.


        // --- Element Creation ---
        create: {

            // `canvas`: Creates and appends a new canvas element to a specified parent DOM element.
            canvas: function( parent, width, height ) {
                // This function is designed to dynamically create a canvas element.
                // Actual DOM manipulation logic would be implemented here to create and append the element.
            },

            // `stack`: Initializes a new drawing stack with an empty layer and history.
            stack: function() {
                // This method adds a new stack to the `stacks` array.
                var new_stack   = [];
                var new_layer   = [];
                var new_history = [];

                new_layer.push( new_history ); // A layer begins with an empty history.
                new_stack.push( new_layer );   // A stack starts with an empty layer.
                stacks.push( new_stack );      // Append the newly formed stack to the global collection.

                return stacks.length - 1;      // Return the index of the newly created stack.
            },

            // `layer`: Adds a new, empty layer to an existing stack.
            layer: function( stack ) {
                // This function creates a new layer and adds it to the specified stack.
                if ( !stack || isNaN( stack ) ) {
                    stack = 0; // Default to the first stack if `stack` is invalid or not provided.
                }

                var new_layer   = [];
                var new_history = [];

                new_layer.push( new_history );   // The new layer is initialized with an empty history.
                stacks[stack].push( new_layer ); // Add the new layer to the target stack.

                return stacks[stack].length - 1; // Return the index of the new layer within its stack.
            },

            // `history`: Adds a new, empty history step to a specific layer within a stack.
            history: function( stack, layer ) {
                // This method adds an empty history array (representing a step) to a given layer.
                if ( !stack || isNaN( stack ) ) {
                    stack = 0; // Default to the first stack.
                }
                if ( !layer || isNaN( layer ) ) {
                    layer = 0; // Default to the first layer.
                }

                var new_history = [];
                stacks[stack][layer].push( new_history ); // Add the empty history step.

                return stacks[stack][layer].length - 1;   // Return the index of the new history step.
            }

        }, // End of `create` methods.


        // --- Data Clearing ---
        clear: {

            // `layer`: Clears all history data within a specified layer.
            layer: function( stack, layer ) {
                // This function is responsible for resetting the data in a given layer.
                if ( !stack || isNaN( stack ) ) {
                    stack = 0; // Default to the first stack.
                }
                if ( !layer || isNaN( layer ) ) {
                    layer = 0; // Default to the first layer.
                }

                var target_layer = stacks[stack][layer];

                // Iterate through each history step and reinitialize it as an empty array.
                for ( l = 0; l < target_layer.length; l++ ) {
                    target_layer[l] = []; // Clear the contents of each history step.
                }
            }

        }, // End of `clear` methods.


        // --- Data Collection ---
        collect: {

            // `current_history`: Retrieves the contents of the temporary `current_history` buffer.
            current_history: function() {
                return current_history;
            }

        }, // End of `collect` methods.


        // --- Format Conversion ---
        convertTo: {

            // `PNG`: Converts the content of a canvas element into a PNG data URL string.
            PNG: function( target ) {
                var image_file = document.getElementById( target );
                image_file     = image_file.toDataURL(); // Get the base64 encoded data URL.
                return image_file;
            }

        }, // End of `convertTo` methods.


        // --- History Manipulation ---
        // `addToHistory`: Appends a new drawing directive and its information to a specific history step.
        addToHistory: function( stack, layer, history_step, directive, information ) {
            if ( !stack || isNaN( stack ) ) {
                stack = 0; // Default stack index.
            }
            if ( !layer || isNaN( layer ) ) {
                layer = 0; // Default layer index.
            }
            if ( !history_step || isNaN( history_step ) ) {
                history_step = 0; // Default history step index.
            }

            var new_history = [];
            new_history.push( directive, information ); // Store the command and its associated data.
            stacks[stack][layer][history_step].push( new_history ); // Add to the designated history step.
        }, // End of `addToHistory`.


        // --- Element Inspection ---
        // `interpretElement`: Returns the tag name of the HTML element identified by `element` ID.
        interpretElement: function( element ) {
            var target = document.getElementById( element ).tagName;
            return target;
        }, // End of `interpretElement`.


        // --- Canvas Context Management ---
        // `findContext`: Locates the 2D rendering context for a given canvas element.
        // If not found, it calls `setupCanvas` to initialize it and then retrieves it.
        findContext: function( element ) {
            var context = ''; // Initialize `context` as an empty string.

            // Search through the stored `contexts` array.
            for ( c = 0; c < contexts.length; c++ ) {
                if ( contexts[c][0] == element ) {
                    context = contexts[c][1]; // Found a match, assign the context.
                }
            }

            if ( context === '' ) {
                // If no context was found, set up the canvas for the element.
                artisan.setupCanvas( element );
                // Recursively call `findContext` to retrieve the newly established context.
                context = artisan.findContext( element );
            }

            return context;
        }, // End of `findContext`.


        // --- Drawing Primitives ---

        // `drawCircle`: Draws a circle on the specified canvas target.
        drawCircle: function( target, placex, placey, radius, fill_color, line_width, stroke_color, alpha, shadow_blur, shadow_color, shadow_offset_x, shadow_offset_y ) {
            // This comprehensive function handles the drawing of a circle using the canvas API.
            var targeted        = document.getElementById( target );
            var target_width    = targeted.width;
            var target_height   = targeted.height;

            // Interpret and normalize all drawing parameters (e.g., convert percentages to pixels).
            placex              = artisan.interpretRequest( placex, target_width );
            placey              = artisan.interpretRequest( placey, target_height );
            line_width          = artisan.interpretRequest( line_width, target_width );
            radius              = artisan.interpretRequest( radius, target_width );
            fill_color          = artisan.interpretColor( fill_color );
            alpha               = artisan.interpretAlpha( alpha );
            stroke_color        = artisan.interpretColor( stroke_color );
            shadow_color        = artisan.interpretColor( shadow_color );

            // Process `shadow_blur`, allowing for a 'random' value.
            if ( shadow_blur !== 'random' ) {
                shadow_blur = parseInt( shadow_blur, 10 );
            }
            shadow_offset_x     = parseInt( shadow_offset_x, 10 );
            shadow_offset_y     = parseInt( shadow_offset_y, 10 );

            if ( !shadow_blur ) {
                shadow_blur = 0;
            } else if ( shadow_blur === 'random' ) {
                shadow_blur = artisan.randomize( 0, 30 ); // Generate a random blur value.
            }

            // Ensure shadow offsets are valid numbers, defaulting to 0.
            if ( !shadow_offset_x || isNaN( shadow_offset_x ) ) {
                shadow_offset_x = 0;
            }
            if ( !shadow_offset_y || isNaN( shadow_offset_y ) ) {
                shadow_offset_y = 0;
            }

            // Store the circle parameters in the `current_history` buffer.
            var this_circle = [ placex, placey, radius, fill_color, line_width, stroke_color, alpha, shadow_blur, shadow_color, shadow_offset_x, shadow_offset_y ];
            var this_set    = [ 'circle', this_circle ];
            current_history.push( this_set );

            // Determine the type of the target element (e.g., 'CANVAS').
            var format = artisan.interpretElement( target );

            switch ( format ) {
                case "CANVAS":
                    // Canvas-specific drawing instructions for a circle.
                    var context         = artisan.findContext( target );
                    context.beginPath();
                    context.lineWidth   = line_width;
                    context.globalAlpha = alpha;
                    context.arc( placex, placey, radius, 0, Math.PI * 2, true ); // Draw the arc.
                    context.closePath();
                    context.fillStyle   = fill_color;

                    if ( line_width !== 0 ) {
                        context.strokeStyle = stroke_color;
                        context.stroke(); // Apply stroke if `line_width` is not zero.
                    }

                    if ( shadow_blur ) {
                        context.shadowOffsetX = shadow_offset_x;
                        context.shadowOffsetY = shadow_offset_y;
                        context.shadowBlur    = shadow_blur;
                        context.shadowColor   = shadow_color;
                    }

                    if ( fill_color !== '' ) {
                        context.fill(); // Fill the circle if `fill_color` is specified.
                    }
                    break;
                default:
                    // This block is for other rendering targets, currently empty.
                    // It would contain alternative drawing logic for non-canvas elements.
            }
        }, // End of `drawCircle`.

        // `drawRectangle`: Draws a rectangle on the specified canvas target.
        drawRectangle: function( target, start_x, start_y, width, height, fill_color, line_width, stroke_color, alpha, shadow_blur, shadow_color, shadow_offset_x, shadow_offset_y ) {
            var targeted        = document.getElementById( target );
            var target_width    = targeted.width;
            var target_height   = targeted.height;

            // Interpret and normalize all rectangle dimensions and positions.
            start_x             = artisan.interpretRequest( start_x, target_width );
            start_y             = artisan.interpretRequest( start_y, target_height );
            width               = artisan.interpretRequest( width, target_width );
            height              = artisan.interpretRequest( height, target_height );
            line_width          = artisan.interpretRequest( line_width, target_width );
            stroke_color        = artisan.interpretColor( stroke_color );
            fill_color          = artisan.interpretColor( fill_color );
            alpha               = artisan.interpretAlpha( alpha );

            // Process `shadow_blur`.
            if ( shadow_blur !== 'random' ) {
                shadow_blur = parseInt( shadow_blur, 10 );
            }
            shadow_offset_x     = parseInt( shadow_offset_x, 10 );
            shadow_offset_y     = parseInt( shadow_offset_y, 10 );

            if ( !shadow_blur ) {
                shadow_blur = 0;
            } else if ( shadow_blur === 'random' ) {
                shadow_blur = artisan.randomize( 0, 30 ); // Random blur value.
            }

            // Process `shadow_color`, supporting 'random' and array inputs.
            if ( !shadow_color ) {
                shadow_color = '';
            } else if ( shadow_color === 'random' ) {
                shadow_color = default_colors[ artisan.randomize( 0, default_colors.length ) ];
            } else if ( shadow_color.constructor.toString().indexOf( "Array" ) !== -1 ) {
                shadow_color = shadow_color[ artisan.randomize( 0, shadow_color.length ) ];
            }

            // Ensure shadow offsets are valid.
            if ( !shadow_offset_x || isNaN( shadow_offset_x ) ) {
                shadow_offset_x = 0;
            }
            if ( !shadow_offset_y || isNaN( shadow_offset_y ) ) {
                shadow_offset_y = 0;
            }

            var format = artisan.interpretElement( target );

            switch ( format ) {
                case "CANVAS":
                    // Canvas-specific drawing instructions for a rectangle.
                    var context         = artisan.findContext( target );
                    context.fillStyle   = fill_color;
                    context.strokeStyle = stroke_color;
                    context.lineWidth   = line_width;
                    context.globalAlpha = alpha;

                    if ( shadow_blur ) {
                        context.shadowOffsetX = shadow_offset_x;
                        context.shadowOffsetY = shadow_offset_y;
                        context.shadowBlur    = shadow_blur;
                        context.shadowColor   = shadow_color;
                    }

                    context.fillRect( start_x, start_y, width, height ); // Draw the filled rectangle.

                    if ( line_width !== 0 ) {
                        context.strokeRect( start_x, start_y, width, height ); // Draw the stroke.
                    }
                    break;
                default:
                    // Standard Code: Placeholder for non-canvas drawing.
            }
        }, // End of `drawRectangle`.

        // `drawImage`: Draws an image on the specified canvas target.
        drawImage: function( target, src, placex, placey, width, height, alpha, fill_color, line_width, stroke_color, shadow_blur, shadow_color, shadow_offset_x, shadow_offset_y ) {
            var targeted        = document.getElementById( target );
            var target_width    = targeted.width;
            var target_height   = targeted.height;

            if ( src ) { // Proceed only if an image source is provided.
                // Interpret and normalize image position and dimensions.
                placex            = artisan.interpretRequest( placex, target_width );
                placey            = artisan.interpretRequest( placey, target_height );
                width             = artisan.interpretRequest( width, target_width );
                height            = artisan.interpretRequest( height, target_height );
                line_width        = artisan.interpretRequest( line_width, target_width );
                fill_color        = artisan.interpretColor( fill_color );
                alpha             = artisan.interpretAlpha( alpha );
                stroke_color      = artisan.interpretColor( stroke_color );
                shadow_color      = artisan.interpretColor( shadow_color );

                // Process `shadow_blur`.
                if ( shadow_blur !== 'random' ) {
                    shadow_blur = parseInt( shadow_blur, 10 );
                }
                shadow_offset_x   = parseInt( shadow_offset_x, 10 );
                shadow_offset_y   = parseInt( shadow_offset_y, 10 );

                if ( !shadow_blur ) {
                    shadow_blur = 0;
                } else if ( shadow_blur === 'random' ) {
                    shadow_blur = artisan.randomize( 0, 30 );
                }

                // Process `shadow_color`.
                if ( !shadow_color ) {
                    shadow_color = '';
                } else if ( shadow_color === 'random' ) {
                    shadow_color = default_colors[ artisan.randomize( 0, default_colors.length ) ];
                } else if ( shadow_color.length ) { // Check if `shadow_color` is an array.
                    shadow_color = shadow_color[ artisan.randomize( 0, shadow_color.length ) ];
                }

                // Ensure shadow offsets are valid.
                if ( !shadow_offset_x || isNaN( shadow_offset_x ) ) {
                    shadow_offset_x = 0;
                }
                if ( !shadow_offset_y || isNaN( shadow_offset_y ) ) {
                    shadow_offset_y = 0;
                }

                var format = artisan.interpretElement( target );

                switch ( format ) {
                    case "CANVAS":
                        // Canvas-specific drawing instructions for an image.
                        var context       = artisan.findContext( target );
                        var this_image    = new Image();
                        this_image.src    = src;
                        this_image.style.opacity    = alpha;    // Apply opacity via CSS (may not affect canvas directly).
                        this_image.style.MozOpacity = alpha;    // Firefox-specific opacity.

                        this_image.onload = function() {
                            // Set shadow properties before drawing the image.
                            context.shadowOffsetX = shadow_offset_x;
                            context.shadowOffsetY = shadow_offset_y;
                            context.shadowBlur    = shadow_blur;
                            context.shadowColor   = shadow_color;
                            context.strokeStyle   = stroke_color;
                            context.fillStyle     = fill_color;
                            context.drawImage( this_image, placex, placey, width, height ); // Draw the image.
                        };
                        break;
                    default:
                        // Standard Code: Placeholder for non-canvas image rendering.
                }
            }
        }, // End of `drawImage`.

        // `drawPath`: Draws a custom path, which can include lines, Bezier, and quadratic curves.
        drawPath: function( target, path, line_width, line_color, fill_color, alpha ) {
            var targeted        = document.getElementById( target );
            var target_width    = targeted.width;
            var target_height   = targeted.height;
            var cp1x, cp1y, cp2x, cp2y, cur_x, cur_y; // Variables for control points and current coordinates.

            var context         = artisan.findContext( target );

            if ( !path ) {
                path = [ [ 0, 0 ] ]; // Default to a single point at the origin if no path is provided.
            }

            // Interpret and normalize drawing parameters for the path.
            line_width          = artisan.interpretRequest( line_width, target_width );
            fill_color          = artisan.interpretColor( fill_color );
            alpha               = artisan.interpretAlpha( alpha );
            line_color          = artisan.interpretColor( line_color );

            // Get and interpret the starting point from the path array.
            var starting_point_x = path[0][0];
            starting_point_x     = artisan.interpretRequest( starting_point_x, target_width );
            var starting_point_y = path[0][1];
            starting_point_y     = artisan.interpretRequest( starting_point_y, target_height );

            context.beginPath(); // Start a new path segment.
            context.moveTo( starting_point_x, starting_point_y ); // Move to the initial point.

            cur_x = starting_point_x; // Initialize current X position.
            cur_y = starting_point_y; // Initialize current Y position.

            // Iterate through the remaining points in the path to draw segments.
            for ( p = 1; p < path.length; p++ ) {
                var point_x = path[p][0];
                point_x     = artisan.interpretRequest( point_x, target_width );
                var point_y = path[p][1];
                point_y     = artisan.interpretRequest( point_y, target_height );

                if ( !path[p][2] ) {
                    // If no segment type is specified, draw a straight line.
                    context.lineTo( point_x, point_y );
                } else if ( path[p][2] === 'bezier' ) {
                    // Draw a cubic Bezier curve, requiring two control points.
                    cp1x = path[p][3];
                    cp1x = artisan.interpretRequest( cp1x, target_width );
                    cp1y = path[p][4];
                    cp1y = artisan.interpretRequest( cp1y, target_height );
                    cp2x = path[p][5];
                    cp2x = artisan.interpretRequest( cp2x, target_width );
                    cp2y = path[p][6];
                    cp2y = artisan.interpretRequest( cp2y, target_height );
                    context.bezierCurveTo( cp1x, cp1y, cp2x, cp2y, point_x, point_y );
                } else if ( path[p][2] === 'quadratic' ) {
                    // Draw a quadratic Bezier curve, approximated as a cubic Bezier.
                    // Calculate the control points for the cubic approximation.
                    cp1x = cur_x + 2.0 / 3.0 * ( path[p][3] - cur_x );
                    cp1x = artisan.interpretRequest( cp1x, target_width );
                    cp1y = cur_y + 2.0 / 3.0 * ( path[p][4] - cur_y );
                    cp1y = artisan.interpretRequest( cp1y, target_height );
                    cp2x = cp1x + ( point_x - cur_x ) / 3.0;
                    cp2x = artisan.interpretRequest( cp2x, target_width );
                    cp2y = cp1y + ( point_y - cur_y ) / 3.0;
                    cp2y = artisan.interpretRequest( cp2y, target_height );
                    context.bezierCurveTo( cp1x, cp1y, cp2x, cp2y, point_x, point_y );
                }
                cur_x = point_x; // Update current position to the end of the drawn segment.
                cur_y = point_y;
            }

            // Apply stroke if `line_width` is set and `line_color` is provided.
            if ( line_width !== 0 && line_color !== '' ) {
                line_width          = artisan.analyzeValue( line_width, target_width ); // Re-analyze line_width.
                context.lineWidth   = line_width;
                context.strokeStyle = line_color;
                context.stroke(); // Render the outline of the path.
            }

            // Apply fill if `fill_color` is provided.
            if ( fill_color !== '' ) {
                context.fillStyle = fill_color;
                context.fill(); // Fill the enclosed path.
            }

            context.closePath(); // Close the current path.
        }, // End of `drawPath`.

        // `drawLine`: Draws a single line or curve segment (straight, Bezier, or quadratic).
        drawLine: function( target, start_x, start_y, end_x, end_y, line_width, line_color, type, cp1_x, cp1_y, cp2_x, cp2_y ) {
            var targeted        = document.getElementById( target );
            var target_width    = targeted.width;
            var target_height   = targeted.height;

            // Interpret and normalize all coordinate and dimension parameters.
            start_x             = artisan.interpretRequest( start_x, target_width );
            start_y             = artisan.interpretRequest( start_y, target_height );
            end_x               = artisan.interpretRequest( end_x, target_width );
            end_y               = artisan.interpretRequest( end_y, target_height );
            cp1_x               = artisan.interpretRequest( cp1_x, target_width );
            cp1_y               = artisan.interpretRequest( cp1_y, target_height );
            cp2_x               = artisan.interpretRequest( cp2_x, target_width );
            cp2_y               = artisan.interpretRequest( cp2_y, target_height );
            line_width          = artisan.interpretRequest( line_width, target_width );
            line_color          = artisan.interpretColor( line_color );

            var context         = artisan.findContext( target );

            context.beginPath(); // Start a new path for this line segment.
            context.moveTo( start_x, start_y ); // Move to the starting point of the line.

            if ( !type ) {
                // If no type is specified, draw a straight line.
                context.lineTo( end_x, end_y );
            } else if ( type === 'bezier' ) {
                // Draw a cubic Bezier curve.
                cp1_x = parseInt( cp1_x, 10 );
                cp1_y = parseInt( cp1_y, 10 );
                cp2_x = parseInt( cp2_x, 10 );
                cp2_y = parseInt( cp2_y, 10 );
                context.bezierCurveTo( cp1_x, cp1_y, cp2_x, cp2_y, end_x, end_y );
            } else if ( type === 'quadratic' ) {
                // Draw a quadratic Bezier curve, converted to cubic.
                // Calculate the control points for the cubic approximation.
                cp1_x = start_x + 2.0 / 3.0 * ( cp1_x - start_x );
                cp1_y = start_y + 2.0 / 3.0 * ( cp1_y - start_y );
                cp2_x = cp1_x + ( end_x - start_x ) / 3.0;
                cp2_y = cp1_y + ( end_y - start_y ) / 3.0;

                cp1_x = parseInt( cp1_x, 10 );
                cp1_y = parseInt( cp1_y, 10 );
                cp2_x = parseInt( cp2_x, 10 );
                cp2_y = parseInt( cp2_y, 10 );

                context.bezierCurveTo( cp1_x, cp1_y, cp2_x, cp2_y, end_x, end_y );
            }

            // Apply stroke if `line_width` is not zero and `line_color` is provided.
            if ( line_width !== 0 && line_color !== '' ) {
                context.strokeStyle = line_color;
                context.lineWidth   = line_width;
                context.stroke(); // Render the line or curve.
            }
        }, // End of `drawLine`.

        // `closePath`: Closes the currently open path on the specified canvas context.
        closePath: function( target ) {
            var context = artisan.findContext( target );
            context.closePath(); // Closes the current path by drawing a straight line to the start point.
        }, // End of `closePath`.

        // `drawText`: Draws text on the target canvas with various styling options.
        drawText: function( target, place_x, place_y, text, text_color, weight, size, font, align, alpha, line_width, line_color, baseline ) {
            var targeted        = document.getElementById( target );
            var target_width    = targeted.width;
            var target_height   = targeted.height;

            // Interpret and normalize text positioning and styling parameters.
            place_x             = artisan.interpretRequest( place_x, target_width );
            place_y             = artisan.interpretRequest( place_y, target_height );
            text_color          = artisan.interpretColor( text_color );
            alpha               = artisan.interpretAlpha( alpha );
            line_width          = artisan.interpretRequest( line_width, target_width );
            line_color          = artisan.interpretColor( line_color );

            if ( !text ) {
                text = ''; // Default `text` to an empty string.
            }
            if ( !weight ) {
                weight = ''; // Default `weight` to an empty string.
            }

            // Process `size`, allowing for 'random' values.
            if ( size !== 'random' && size ) {
                size = artisan.analyzeValue( size, target_width ) + 'px'; // Convert size to pixels.
            } else if ( size === 'random' ) {
                size = artisan.randomize( 0, 190 ) + 'px'; // Assign a random size.
            } else if ( !size ) {
                size = '15px'; // Default font size.
            }

            if ( !font ) {
                font = 'sans-serif'; // Default font family.
            }

            var font_style      = weight + ' ' + size + ' ' + font; // Construct the CSS-like font string.

            if ( !align ) {
                align = 'left'; // Default text alignment.
            }
            if ( !baseline ) {
                baseline = 'top'; // Default text baseline.
            }

            var context         = artisan.findContext( target );

            context.textAlign    = align;
            context.globalAlpha  = alpha;
            context.fillStyle    = text_color;
            context.font         = font_style;
            context.textBaseline = baseline;

            context.fillText( text, place_x, place_y ); // Draw the filled text.

            if ( line_width !== 0 ) {
                context.strokeText( text, place_x, place_y ); // Draw the stroked text if line_width is not zero.
            }
        }, // End of `drawText`.


        // --- Stack and Layer Rendering Operations ---

        // `drawStack`: Renders all layers within a specified stack to the target element.
        drawStack: function( target, stack, history ) {
            // This function iterates through and draws the layers of a chosen stack.
            if ( stack === 'latest' ) {
                stack = stacks.length - 1; // Select the most recently added stack.
            } else if ( !stack || isNaN( stack ) || stack === 'first' ) {
                stack = 0; // Default to the first stack if invalid or unspecified.
            }

            // Loop through each layer within the selected stack.
            for ( l = 0; l < stacks[stack].length; l++ ) {
                // Determine which specific history step to draw for the current layer.
                if ( history === 'first' || history === 0 ) {
                    history = 0; // Draw the very first history step.
                } else if ( !history || isNaN( history ) || history === 'latest' ) {
                    history = stacks[stack][l].length - 1; // Draw the latest history step.
                }
                // Delegate to `drawLayer` to handle the actual rendering of the layer's history.
                artisan.drawLayer( target, stack, l, history );
            }
        }, // End of `drawStack`.

        // `drawLayer`: Renders a specific layer from a stack to the target element.
        drawLayer: function( target, stack, layer, history ) {
            // This function processes and renders a single layer's content.
            if ( !stack || isNaN( stack ) ) {
                stack = 0; // Default to the first stack.
            }

            if ( layer === 'latest' ) {
                layer = stacks[stack].length - 1; // Select the most recent layer in the stack.
            } else if ( !layer || isNaN( layer ) || layer === 'first' ) {
                layer = 0; // Default to the first layer.
            }

            // Determine which history step within the layer should be rendered.
            if ( history === 'previous' ) {
                history = stacks[stack][layer].length - 2; // Render the second-to-last history step.
            } else if ( !history || isNaN( history ) || history === 'latest' ) {
                history = stacks[stack][layer].length - 1; // Render the latest history step.
            } else if ( history === 'first' || history === 0 ) {
                history = 0; // Render the initial history step.
            }
            // Note: The actual drawing of the history commands (e.g., calling drawCircle, drawRectangle)
            // based on the `history` variable is expected to occur after this logic,
            // likely by interpreting the commands stored in `stacks[stack][layer][history]`.
        } // End of `drawLayer`.

    }; // End of the `return` object, which defines the public API.

} )( window, undefined ); // End of the Immediately Invoked Function Expression (IIFE).