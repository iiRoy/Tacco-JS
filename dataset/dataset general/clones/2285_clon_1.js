// This file contains a JavaScript implementation for a signature pad widget.
// It allows users to draw or type their signatures on a canvas element.

/*
 *  Usage information for the signature pad library:
 *
 *  To allow users to create new signatures:
 *  jQuery('.sigPad').signaturePad();
 *
 *  To display previously saved signatures:
 *  jQuery('.sigPad').signaturePad({ displayOnly: true }).regenerate(sig);
 *  Alternatively, you can store the API reference:
 *  var signatureApi = jQuery('.sigPad').signaturePad({ displayOnly: true });
 *  signatureApi.regenerate(sig);
 */
( function ( $ ) {

    // Main constructor for the SignaturePad object.
    // This function initializes a new signature pad instance.
    function SignaturePad ( selector, options ) {
        /**
         *  A self-reference for the current SignaturePad instance.
         *  Used within public methods to ensure correct context.
         *
         *  @private
         *  @type {Object}
         */
        var self = this;

        /**
         *  Combined settings object.
         *  Merges default options with any user-provided overrides.
         *
         *  @private
         *  @type {Object}
         */
        var settings = $.extend( {}, $.fn.signaturePad.defaults, options );

        /**
         *  The jQuery context of the selected signature pad element(s).
         *
         *  @private
         *  @type {Object}
         */
        var context = $( selector );

        /**
         *  jQuery object representing the canvas element within the pad.
         *
         *  @private
         *  @type {Object}
         */
        var canvas = $( settings.canvas, context );

        /**
         *  Direct DOM reference to the canvas element.
         *  Obtained from the jQuery object for raw canvas API access.
         *
         *  @private
         *  @type {Object}
         */
        var element = canvas.get( 0 );

        /**
         *  The 2D rendering context of the signature canvas.
         *  Used for all drawing operations.
         *
         *  @private
         *  @type {Object}
         */
        var canvasContext = null;

        /**
         *  Stores the coordinates of the last drawn point.
         *  Helps prevent drawing multiple points at the same location,
         *  which can make lines appear overly thick.
         *
         *  @private
         *  @type {Object}
         */
        var previous = { 'x': null, 'y': null };

        /**
         *  An array that accumulates all the points and lines
         *  that constitute the user's signature.
         *  Each entry is an object describing a line segment.
         *
         *  @private
         *  @type {Array}
         */
        var output = [];

        /**
         *  Holds a reference to a timeout that is set when the mouse
         *  leaves the canvas area. If the mouse stays off for a duration,
         *  drawing is automatically stopped.
         *
         *  @private
         *  @type {Object|Boolean}
         */
        var mouseLeaveTimeout = false;

        /**
         *  Flag indicating whether the mouse button is currently held down.
         *
         *  @private
         *  @type {Boolean}
         */
        var mouseButtonDown = false;

        /**
         *  Flag to detect if the current browsing environment supports touch events.
         *
         *  @private
         *  @type {Boolean}
         */
        var touchable = false;

        /**
         *  Flag to track if event listeners have already been bound to the canvas.
         *  Prevents duplicate event bindings.
         *
         *  @private
         *  @type {Boolean}
         */
        var eventsBound = false;

        /**
         *  The default font size used for typed signatures.
         *  This value serves as a baseline for scaling.
         *
         *  @private
         *  @type {Number}
         */
        var typeItDefaultFontSize = 30;

        /**
         *  The current font size being used for typed signatures.
         *  Can be adjusted dynamically based on text length.
         *
         *  @private
         *  @type {Number}
         */
        var typeItCurrentFontSize = typeItDefaultFontSize;

        /**
         *  Keeps count of the number of characters in the typed name field.
         *  Used to assist in font size scaling.
         *
         *  @private
         *  @type {Number}
         */
        var typeItNumChars = 0;


        /**
         *  Resets the mouse leave timeout and related flags.
         *  Ensures that drawing state is correctly cleared.
         *
         *  @private
         *  @returns {void}
         */
        function clearMouseLeaveTimeout ( ) {
            clearTimeout( mouseLeaveTimeout );
            mouseLeaveTimeout = false;
            mouseButtonDown = false;
        }


        /**
         *  Draws a continuous line segment on the canvas.
         *  It intelligently avoids drawing over the exact same pixel
         *  to maintain line quality and anti-aliasing.
         *
         *  @private
         *  @param {Object} e - The event object (mouse or touch event).
         *  @param {Number} newYOffset - An optional vertical offset, typically 1,
         *                                used to draw a single dot on click.
         *  @returns {Boolean} Returns true if the drawing was skipped (same point).
         *  @returns {void}
         */
        function drawLine ( e, newYOffset ) {
            var offset, newX, newY;

            e.preventDefault( );

            offset = $( e.target ).offset( );

            // Clear any pending mouse leave timeout as we are actively drawing.
            clearTimeout( mouseLeaveTimeout );
            mouseLeaveTimeout = false;

            // Determine coordinates based on touch or mouse event.
            if ( typeof e.targetTouches !== 'undefined' ) {
                newX = Math.floor( e.targetTouches[ 0 ].pageX - offset.left );
                newY = Math.floor( e.targetTouches[ 0 ].pageY - offset.top );
            } else {
                newX = Math.floor( e.pageX - offset.left );
                newY = Math.floor( e.pageY - offset.top );
            }

            // If the new point is the same as the previous, do nothing to avoid artifacts.
            if ( previous.x === newX && previous.y === newY ) {
                return true;
            }

            // Initialize previous coordinates if this is the first point in a stroke.
            if ( previous.x === null ) {
                previous.x = newX;
            }
            if ( previous.y === null ) {
                previous.y = newY;
            }

            // Apply vertical offset if provided.
            if ( newYOffset ) {
                newY += newYOffset;
            }

            // Begin drawing the path.
            canvasContext.beginPath( );
            canvasContext.moveTo( previous.x, previous.y );
            canvasContext.lineTo( newX, newY );
            canvasContext.lineCap = settings.penCap; // Set line end style.
            canvasContext.stroke( );                  // Draw the line.
            canvasContext.closePath( );               // End the path.

            // Store the drawn line segment in the output array.
            output.push( {
                'lx' : newX,
                'ly' : newY,
                'mx' : previous.x,
                'my' : previous.y
            } );

            // Update previous coordinates for the next segment.
            previous.x = newX;
            previous.y = newY;

            // Execute the custom onDraw callback if defined.
            if ( settings.onDraw && typeof settings.onDraw === 'function' ) {
                settings.onDraw.apply( self );
            }
        }


        /**
         *  A simple wrapper function for `stopDrawing()`.
         *  This is useful for event listeners that need to call `stopDrawing`
         *  without passing an event object, and allows for easier removal.
         *
         *  @private
         *  @returns {void}
         */
        function stopDrawingWrapper ( ) {
            stopDrawing( );
        }


        /**
         *  Halts the drawing process on the canvas.
         *  Removes relevant event listeners and finalizes the current stroke.
         *
         *  @private
         *  @param {Object} [e] - The event object, if stopping drawing was triggered by an event.
         *  @returns {void}
         */
        function stopDrawing ( e ) {
            // If an event object is provided, it means drawing stopped due to an event
            // (e.g., mouseup, touchend), so draw a final small dot.
            if ( !! e ) {
                drawLine( e, 1 );
            } else {
                // If no event, clean up event listeners.
                if ( touchable ) {
                    canvas.each( function ( ) {
                        this.removeEventListener( 'touchmove', drawLine );
                        // this.removeEventListener('MSPointerMove', drawLine); // For IE touch events
                    } );
                } else {
                    canvas.unbind( 'mousemove.signaturepad' );
                }

                // Trigger the onDrawEnd callback if a signature was drawn.
                if ( output.length > 0 && settings.onDrawEnd && typeof settings.onDrawEnd === 'function' ) {
                    settings.onDrawEnd.apply( self );
                }
            }

            // Reset previous coordinates to indicate no active stroke.
            previous.x = null;
            previous.y = null;

            // Update the hidden output field with the JSON representation of the signature.
            if ( settings.output && output.length > 0 ) {
                $( settings.output, context ).val( JSON.stringify( output ) );
            }
        }


        /**
         *  Draws the decorative signature line on the canvas.
         *  This line acts as a guide for the user's signature.
         *
         *  @private
         *  @returns {Boolean} Returns false if settings.lineWidth is not set, indicating no line should be drawn.
         *  @returns {void}
         */
        function drawSigLine ( ) {
            if ( ! settings.lineWidth ) {
                return false; // Don't draw if line width is zero or undefined.
            }

            canvasContext.beginPath( );
            canvasContext.lineWidth = settings.lineWidth;
            canvasContext.strokeStyle = settings.lineColour;
            canvasContext.moveTo( settings.lineMargin, settings.lineTop );
            canvasContext.lineTo( element.width - settings.lineMargin, settings.lineTop );
            canvasContext.stroke( );
            canvasContext.closePath( );
        }


        /**
         *  Clears the entire canvas content and, if not in displayOnly mode,
         *  redraws the signature guide line. Resets the stored signature data.
         *
         *  @private
         *  @returns {void}
         */
        function clearCanvas ( ) {
            // Clear the entire canvas area.
            canvasContext.clearRect( 0, 0, element.width, element.height );

            // Fill the canvas with the background color.
            canvasContext.fillStyle = settings.bgColour;
            canvasContext.fillRect( 0, 0, element.width, element.height );

            // Redraw the signature line if not in display-only mode.
            if ( ! settings.displayOnly ) {
                drawSigLine( );
            }

            // Reset drawing style for the pen.
            canvasContext.lineWidth = settings.penWidth;
            canvasContext.strokeStyle = settings.penColour;

            // Clear the hidden output field and the internal output array.
            $( settings.output, context ).val( '' );
            output = [];

            // Ensure drawing is stopped and state is reset.
            stopDrawing( );
        }


        /**
         *  Event handler for mouse/touch movement over the canvas.
         *  It initiates a new line segment if `previous.x` is null,
         *  otherwise continues the current line.
         *
         *  @private
         *  @param {Object} e - The event object.
         *  @param {Object} o - The object context (the canvas DOM element).
         *  @returns {void}
         */
        function onMouseMove ( e, o ) {
            if ( previous.x == null ) { // Check if this is the start of a new stroke.
                drawLine( e, 1 );       // Draw a small dot to start.
            } else {
                drawLine( e, o );       // Continue drawing the line.
            }
        }


        /**
         *  Initiates the drawing process on the canvas.
         *  Binds the appropriate mouse or touch move event listeners.
         *
         *  @private
         *  @param {Object} e - The event object that triggered the start of drawing.
         *  @param {Object} touchObject - The DOM object to attach touch listeners to (the canvas itself).
         *  @returns {void}
         */
        function startDrawing ( e, touchObject ) {
            if ( touchable ) {
                touchObject.addEventListener( 'touchmove', onMouseMove, false );
                // touchObject.addEventListener('MSPointerMove', onMouseMove, false); // For IE touch events
            } else {
                canvas.bind( 'mousemove.signaturepad', onMouseMove );
            }

            // Draws a single point on initial mouse down or touch start.
            // This is crucial for capturing "dots" in signatures (e.g., periods in names).
            drawLine( e, 1 );
        }


        /**
         *  Disables drawing capabilities by removing all associated mouse and touch events
         *  from the canvas and related elements.
         *
         *  @private
         *  @returns {void}
         */
        function disableCanvas ( ) {
            eventsBound = false; // Reset the events bound flag.

            canvas.each( function ( ) {
                if ( this.removeEventListener ) {
                    // Remove touch event listeners
                    this.removeEventListener( 'touchend', stopDrawingWrapper );
                    this.removeEventListener( 'touchcancel', stopDrawingWrapper );
                    this.removeEventListener( 'touchmove', drawLine );
                    // this.removeEventListener('MSPointerUp', stopDrawingWrapper);
                    // this.removeEventListener('MSPointerCancel', stopDrawingWrapper);
                    // this.removeEventListener('MSPointerMove', drawLine);
                }

                // Clear the `ontouchstart` property to disable direct touch handling.
                if ( this.ontouchstart ) {
                    this.ontouchstart = null;
                }
            } );

            // Unbind jQuery mouse events from document and canvas.
            $( document ).unbind( 'mouseup.signaturepad' );
            canvas.unbind( 'mousedown.signaturepad' );
            canvas.unbind( 'mousemove.signaturepad' );
            canvas.unbind( 'mouseleave.signaturepad' );

            // Unbind click event from the clear button.
            $( settings.clear, context ).unbind( 'click.signaturepad' );
        }


        /**
         *  Performs lazy detection of touch events and binds initial drawing events.
         *  This function is called on the first interaction (mousedown/touchstart)
         *  to reliably determine if the device is touch-enabled.
         *
         *  @private
         *  @param {Object} e - The event object (mousedown or touchstart).
         *  @returns {Boolean} Returns false if events are already bound.
         *  @returns {void}
         */
        function initDrawEvents ( e ) {
            if ( eventsBound ) {
                return false; // Already initialized, exit.
            }

            eventsBound = true; // Mark events as bound.

            // Attempt to close any open virtual keyboards to free screen space.
            $( 'input' ).blur( );

            // Detect if the event is a touch event.
            if ( typeof e.targetTouches !== 'undefined' ) {
                touchable = true;
            }

            if ( touchable ) {
                // Bind touch-specific listeners.
                canvas.each( function ( ) {
                    this.addEventListener( 'touchend', stopDrawingWrapper, false );
                    this.addEventListener( 'touchcancel', stopDrawingWrapper, false );
                    // this.addEventListener('MSPointerUp', stopDrawingWrapper, false);
                    // this.addEventListener('MSPointerCancel', stopDrawingWrapper, false);
                } );

                // Unbind mouse down if touch is detected, to prevent double handling.
                canvas.unbind( 'mousedown.signaturepad' );
            } else {
                // Bind mouse-specific listeners for non-touch devices.
                $( document ).bind( 'mouseup.signaturepad', function ( ) {
                    if ( mouseButtonDown ) {
                        stopDrawing( );
                        clearMouseLeaveTimeout( );
                    }
                } );

                canvas.bind( 'mouseleave.signaturepad', function ( e ) {
                    if ( mouseButtonDown ) {
                        stopDrawing( e );
                    }

                    if ( mouseButtonDown && ! mouseLeaveTimeout ) {
                        mouseLeaveTimeout = setTimeout( function ( ) {
                            stopDrawing( );
                            clearMouseLeaveTimeout( );
                        }, 500 ); // Stop drawing after 500ms if mouse leaves and button is down.
                    }
                } );

                // Clear `ontouchstart` for mouse-only devices.
                canvas.each( function ( ) {
                    this.ontouchstart = null;
                } );
            }
        }


        /**
         *  Activates the drawing mode for the signature pad.
         *  This involves hiding the typed signature input, clearing the canvas,
         *  and setting up event listeners for drawing.
         *
         *  @private
         *  @returns {void}
         */
        function drawIt ( ) {
            $( settings.typed, context ).hide( ); // Hide the typed signature input.
            clearCanvas( );                       // Clear the canvas for drawing.

            // Set up touch start event listener for each canvas element.
            canvas.each( function ( ) {
                this.ontouchstart = function ( e ) {
                    e.preventDefault( );
                    mouseButtonDown = true;
                    initDrawEvents( e );        // Initialize drawing events (touch/mouse detection).
                    startDrawing( e, this );    // Begin drawing.
                };
            } );

            // Bind mouse down event listener for the canvas.
            canvas.bind( 'mousedown.signaturepad', function ( e ) {
                e.preventDefault( );

                // Only respond to left mouse button clicks.
                if ( e.which > 1 ) {
                    return false;
                }

                mouseButtonDown = true;
                initDrawEvents( e ); // Initialize drawing events.
                startDrawing( e );   // Begin drawing.
            } );

            // Bind the clear button's click event.
            $( settings.clear, context ).bind( 'click.signaturepad', function ( e ) {
                e.preventDefault( );
                clearCanvas( );
            } );

            // Manage 'Type It' and 'Draw It' button states and events.
            $( settings.typeIt, context ).bind( 'click.signaturepad', function ( e ) {
                e.preventDefault( );
                typeIt( ); // Switch to type mode.
            } );
            $( settings.drawIt, context ).unbind( 'click.signaturepad' ); // Unbind previous events.
            $( settings.drawIt, context ).bind( 'click.signaturepad', function ( e ) {
                e.preventDefault( ); // Prevent default action for drawIt button in draw mode.
            } );

            // Update CSS classes for active/inactive modes.
            $( settings.typeIt, context ).removeClass( settings.currentClass );
            $( settings.drawIt, context ).addClass( settings.currentClass );
            $( settings.sig, context ).addClass( settings.currentClass );

            // Toggle visibility of descriptions.
            $( settings.typeItDesc, context ).hide( );
            $( settings.drawItDesc, context ).show( );
            $( settings.clear, context ).show( ); // Ensure clear button is visible.
        }


        /**
         *  Activates the typing mode for the signature pad.
         *  This hides the canvas, shows the text input field,
         *  and disables canvas drawing events.
         *
         *  @private
         *  @returns {void}
         */
        function typeIt ( ) {
            clearCanvas( );     // Clear the canvas content.
            disableCanvas( );   // Disable all drawing events on the canvas.
            $( settings.typed, context ).show( ); // Show the text input for typing.

            // Bind 'Draw It' button to switch back to drawing mode.
            $( settings.drawIt, context ).bind( 'click.signaturepad', function ( e ) {
                e.preventDefault( );
                drawIt( );
            } );
            $( settings.typeIt, context ).unbind( 'click.signaturepad' ); // Unbind previous events.
            $( settings.typeIt, context ).bind( 'click.signaturepad', function ( e ) {
                e.preventDefault( ); // Prevent default action for typeIt button in type mode.
            } );

            $( settings.output, context ).val( '' ); // Clear the output field.

            // Update CSS classes for active/inactive modes.
            $( settings.drawIt, context ).removeClass( settings.currentClass );
            $( settings.typeIt, context ).addClass( settings.currentClass );