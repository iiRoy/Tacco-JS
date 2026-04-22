/*
 * This file contains functionality for rotating elements using jQuery.
 * It detects browser capabilities (CSS transforms or VML for IE)
 * and provides a unified interface for rotation and animation.
 *
 * Original Author: Wilq32, wilq32@gmail.com, Wroclaw, Poland, 01.2009
 * Project Website: http://code.google.com/p/jqueryrotate/
 * License: MIT License - http://www.opensource.org/licenses/mit-license.php
 *
 * Version: 2.3
 * Last Modified: 2013-07-11
 */


( function ( $ ) {


    // --- Feature Detection and Global Variables Initialization ---

    var supportedCSS,
        supportedCSSOrigin,
        styles = document.getElementsByTagName( "head" )[ 0 ].style,
        toCheck = "transformProperty WebkitTransform OTransform msTransform MozTransform".split( " " );

    // Iterate through potential transform properties to find supported one
    for ( var a = 0 ; a < toCheck.length ; a++ ) {
        if ( styles[ toCheck[ a ] ] !== undefined ) {
            supportedCSS = toCheck[ a ];
            // Once found, no need to check further
            break;
        }
    }


    // If a CSS transform property is supported, determine the corresponding origin property
    if ( supportedCSS ) {
        supportedCSSOrigin = supportedCSS.replace( /[tT]ransform/ , "TransformOrigin" );
        // Ensure the first letter is lowercase for consistency if it's 'TransformOrigin'
        if ( supportedCSSOrigin[ 0 ] == "T" ) {
            supportedCSSOrigin = "t" + supportedCSSOrigin.substr( 1 );
        }
    }


    // --- Browser-specific detection for Internet Explorer (IE) ---
    // A somewhat unconventional method to detect IE using eval,
    // often used to prevent minifiers from stripping it.
    eval( 'IE = "v"=="\v"' );


    // --- jQuery Plugin Extension ---
    // Extends jQuery's prototype to add rotation capabilities to selected elements.
    jQuery.fn.extend( {


        // Method to apply rotation to elements
        rotate : function ( parameters ) {
            // Do nothing if no elements are selected or parameters are missing
            if ( this.length === 0 || typeof parameters == "undefined" ) {
                return;
            }

            // If a number is passed, assume it's the angle and wrap in an object
            if ( typeof parameters == "number" ) {
                parameters = { angle : parameters };
            }

            var returned = []; // Array to store newly created rotation objects

            // Process each selected element
            for ( var i = 0 , i0 = this.length ; i < i0 ; i++ ) {
                var element = this.get( i );

                // Check if the element already has a rotation effect initialized
                if ( !element.Wilq32 || !element.Wilq32.PhotoEffect ) {
                    // If not initialized, create a new PhotoEffect instance
                    var paramClone = $.extend( true , {} , parameters ); // Deep clone parameters
                    var newRotObject = new Wilq32.PhotoEffect( element , paramClone )._rootObj;

                    returned.push( $( newRotObject ) ); // Add to returned array
                } else {
                    // If already initialized, just update its rotation
                    element.Wilq32.PhotoEffect._handleRotation( parameters );
                }
            }

            return returned; // Return array of jQuery-wrapped rotation objects
        },


        // Method to get the current rotation angle(s) of elements
        getRotateAngle : function () {
            var ret = []; // Array to store angles

            // Iterate over each selected element
            for ( var i = 0 , i0 = this.length ; i < i0 ; i++ ) {
                var element = this.get( i );

                // If a rotation effect exists, store its current angle
                if ( element.Wilq32 && element.Wilq32.PhotoEffect ) {
                    ret[ i ] = element.Wilq32.PhotoEffect._angle;
                }
            }

            return ret; // Return array of angles
        },


        // Method to stop ongoing rotation animations
        stopRotate : function () {
            // Iterate over each selected element
            for ( var i = 0 , i0 = this.length ; i < i0 ; i++ ) {
                var element = this.get( i );

                // If a rotation effect exists, clear its animation timer
                if ( element.Wilq32 && element.Wilq32.PhotoEffect ) {
                    clearTimeout( element.Wilq32.PhotoEffect._timer );
                }
            }
        }

    } );


    // --- Core Rotation Library (Wilq32.PhotoEffect) ---
    // This section defines the main rotation logic, abstracting browser differences.

    Wilq32 = window.Wilq32 || {}; // Ensure Wilq32 namespace exists
    Wilq32.PhotoEffect = ( function () {


        // Branch for browsers supporting CSS transforms (modern browsers)
        if ( supportedCSS ) {
            return function ( img , parameters ) {
                // Attach PhotoEffect instance to the image element
                img.Wilq32 = {
                    PhotoEffect : this
                };

                // Initialize internal references
                this._img = this._rootObj = this._eventObj = img;
                this._handleRotation( parameters ); // Apply initial rotation
            };
        } else {
            // Branch for Internet Explorer (using VML) or other browsers without CSS transforms
            return function ( img , parameters ) {
                this._img = img;
                this._onLoadDelegate = [ parameters ]; // Store parameters for deferred loading

                // Create a root span element to wrap the image and handle VML positioning
                this._rootObj = document.createElement( 'span' );
                this._rootObj.style.display = "inline-block"; // Essential for layout in IE
                this._rootObj.Wilq32 =
                    {
                        PhotoEffect : this
                    };
                // Insert the root object before the original image
                img.parentNode.insertBefore( this._rootObj , img );

                // Check if the image is already loaded
                if ( img.complete ) {
                    this._Loader(); // If complete, proceed directly
                } else {
                    var self = this;
                    // If not complete, bind to the 'load' event.
                    // This requires jQuery, which is a dependency.
                    // CONSIDER: Removing jQuery dependency here for a pure JS solution.
                    jQuery( this._img ).bind( "load" , function () {
                        self._Loader();
                    } );
                }
            };
        }

    } )();


    // --- Prototype Methods for Wilq32.PhotoEffect ---
    // Defines the common methods and properties for rotation instances.
    Wilq32.PhotoEffect.prototype = {


        // Sets up or updates rotation parameters
        _setupParameters : function ( parameters ) {
            this._parameters = this._parameters || {}; // Initialize if not present

            // Set initial angle if not defined
            if ( typeof this._angle !== "number" ) {
                this._angle = 0;
            }

            // Update angle if provided in parameters
            if ( typeof parameters.angle === "number" ) {
                this._angle = parameters.angle;
            }

            // Set animation target angle
            this._parameters.animateTo = ( typeof parameters.animateTo === "number" ) ? ( parameters.animateTo ) : ( this._angle );

            // Set animation step callback
            this._parameters.step = parameters.step || this._parameters.step || null;
            // Set easing function for animation
            this._parameters.easing = parameters.easing || this._parameters.easing || this._defaultEasing;
            // Set animation duration
            this._parameters.duration = parameters.duration || this._parameters.duration || 1000;
            // Set callback function after animation completes
            this._parameters.callback = parameters.callback || this._parameters.callback || this._emptyFunction;
            // Set rotation center, default to 50% 50%
            this._parameters.center = parameters.center || this._parameters.center || [ "50%" , "50%" ];

            // Calculate rotation center X coordinate
            if ( typeof this._parameters.center[ 0 ] == "string" ) {
                this._rotationCenterX = ( parseInt( this._parameters.center[ 0 ] , 10 ) / 100 ) * this._imgWidth * this._aspectW;
            } else {
                this._rotationCenterX = this._parameters.center[ 0 ];
            }

            // Calculate rotation center Y coordinate
            if ( typeof this._parameters.center[ 1 ] == "string" ) {
                this._rotationCenterY = ( parseInt( this._parameters.center[ 1 ] , 10 ) / 100 ) * this._imgHeight * this._aspectH;
            } else {
                this._rotationCenterY = this._parameters.center[ 1 ];
            }

            // Bind new events if provided and different
            if ( parameters.bind && parameters.bind != this._parameters.bind ) {
                this._BindEvents( parameters.bind );
            }
        },


        // A placeholder empty function for callbacks
        _emptyFunction : function () {
        },


        // Default easing function (easeOutQuart)
        _defaultEasing : function ( x , t , b , c , d ) {
            return -c * ( ( t = t / d - 1 ) * t * t * t - 1 ) + b;
        },


        // Handles the rotation process, either immediate or animated
        _handleRotation : function ( parameters , dontcheck ) {
            // For non-CSS transform browsers, defer if image is not loaded
            if ( !supportedCSS && !this._img.complete && !dontcheck ) {
                this._onLoadDelegate.push( parameters );
                return;
            }

            this._setupParameters( parameters ); // Set up parameters

            // If target angle is same as current, just apply it
            if ( this._angle == this._parameters.animateTo ) {
                this._rotate( this._angle );
            } else {
                // Otherwise, start the animation
                this._animateStart();
            }
        },


        // Binds event handlers to the rotation object
        _BindEvents : function ( events ) {
            if ( events && this._eventObj ) {
                // Unbind any previously bound events
                if ( this._parameters.bind ) {
                    var oldEvents = this._parameters.bind;
                    for ( var a in oldEvents ) {
                        if ( oldEvents.hasOwnProperty( a ) ) {
                            // This part relies on jQuery for event unbinding.
                            // CONSIDER: Abstracting jQuery dependency.
                            jQuery( this._eventObj ).unbind( a , oldEvents[ a ] );
                        }
                    }
                }

                // Bind new events
                this._parameters.bind = events;
                for ( var a in events ) {
                    if ( events.hasOwnProperty( a ) ) {
                        // This part relies on jQuery for event binding.
                        // CONSIDER: Abstracting jQuery dependency.
                        jQuery( this._eventObj ).bind( a , events[ a ] );
                    }
                }
            }
        },


        // --- Image Loader and Initialization (Browser-specific) ---
        // This IIFE determines the appropriate loading mechanism based on browser capabilities.
        _Loader : ( function () {
            // Branch for Internet Explorer (using VML)
            if ( IE ) {
                return function () {
                    var width = this._img.width;
                    var height = this._img.height;

                    this._imgWidth = width;
                    this._imgHeight = height;

                    // Remove original image from DOM
                    this._img.parentNode.removeChild( this._img );

                    // Create VML image element
                    this._vimage = this.createVMLNode( 'image' );
                    this._vimage.src = this._img.src;
                    this._vimage.style.height = height + "px";
                    this._vimage.style.width = width + "px";
                    this._vimage.style.position = "absolute"; // Crucial for IE VML rendering
                    this._vimage.style.top = "0px";
                    this._vimage.style.left = "0px";
                    this._aspectW = this._aspectH = 1; // Aspect ratio for VML is usually 1:1

                    // Create VML group element to handle rotation and positioning
                    this._container = this.createVMLNode( 'group' );
                    this._container.style.width = width;
                    this._container.style.height = height;
                    this._container.style.position = "absolute";
                    this._container.style.top = "0px";
                    this._container.style.left = "0px";
                    // Adjust coordsize for VML rendering precision in IE
                    this._container.setAttribute( 'coordsize' , ( width - 1 ) + ',' + ( height - 1 ) );
                    this._container.appendChild( this._vimage );

                    // Append VML container to the root object
                    this._rootObj.appendChild( this._container );
                    this._rootObj.style.position = "relative"; // Essential for containing VML
                    this._rootObj.style.width = width + "px";
                    this._rootObj.style.height = height + "px";
                    this._rootObj.setAttribute( 'id' , this._img.getAttribute( 'id' ) );
                    this._rootObj.className = this._img.className;
                    this._eventObj = this._rootObj; // Events are bound to the root object

                    // Process any deferred rotation requests
                    var parameters;
                    while ( parameters = this._onLoadDelegate.shift() ) {
                        this._handleRotation( parameters , true );
                    }
                };
            } else {
                // Branch for modern browsers (using Canvas)
                return function () {
                    this._rootObj.setAttribute( 'id' , this._img.getAttribute( 'id' ) );
                    this._rootObj.className = this._img.className;

                    this._imgWidth = this._img.naturalWidth;
                    this._imgHeight = this._img.naturalHeight;

                    // Calculate a large enough canvas size to prevent clipping during rotation
                    var _widthMax = Math.sqrt( ( this._imgHeight ) * ( this._imgHeight ) + ( this._imgWidth ) * ( this._imgWidth ) );
                    this._width = _widthMax * 3;
                    this._height = _widthMax * 3;

                    // Calculate aspect ratios
                    this._aspectW = this._img.offsetWidth / this._img.naturalWidth;
                    this._aspectH = this._img.offsetHeight / this._img.naturalHeight;

                    // Remove original image from DOM
                    this._img.parentNode.removeChild( this._img );

                    // Create canvas element
                    this._canvas = document.createElement( 'canvas' );
                    this._canvas.setAttribute( 'width' , this._width );
                    this._canvas.setAttribute( 'height' , this._height ); // Set canvas height
                    this._canvas.style.position = "relative";
                    // Initial positioning to center the image on the larger canvas
                    this._canvas.style.left = -this._img.height * this._aspectW + "px";
                    this._canvas.style.top = -this._img.width * this._aspectH + "px";
                    this._canvas.Wilq32 = this._rootObj.Wilq32; // Link canvas to rotation instance

                    this._rootObj.appendChild( this._canvas );
                    // Adjust root object size to match original image dimensions
                    this._rootObj.style.width = this._img.width * this._aspectW + "px";
                    this._rootObj.style.height = this._img.height * this._aspectH + "px";
                    this._eventObj = this._canvas; // Events are bound to the canvas

                    this._cnv = this._canvas.getContext( '2d' ); // Get 2D rendering context

                    // Process any deferred rotation requests
                    var parameters;
                    while ( parameters = this._onLoadDelegate.shift() ) {
                        this._handleRotation( parameters , true );
                    }
                };
            }
        } )(),


        // Initiates the animation process
        _animateStart : function () {
            // Clear any existing animation timer
            if ( this._timer ) {
                clearTimeout( this._timer );
            }
            this._animateStartTime = +new Date; // Record start time
            this._animateStartAngle = this._angle; // Record start angle
            this._animate(); // Begin animation loop
        },


        // The main animation loop
        _animate : function () {
            var actualTime = +new Date;
            var checkEnd = actualTime - this._animateStartTime > this._parameters.duration;

            // If animation has ended and it's not an animated GIF
            if ( checkEnd && !this._parameters.animatedGif ) {
                clearTimeout( this._timer ); // Stop the timer
            } else {
                // If there's an element to rotate (canvas, VML, or direct image)
                if ( this._canvas || this._vimage || this._img ) {
                    // Calculate current angle using easing function
                    var angle = this._parameters.easing( 0 , actualTime - this._animateStartTime , this._animateStartAngle , this._parameters.animateTo - this._animateStartAngle , this._parameters.duration );
                    this._rotate( ( ~~( angle * 10 ) ) / 10 ); // Apply rotation, rounding to one decimal place
                }

                // Call step callback if defined
                if ( this._parameters.step ) {
                    this._parameters.step( this._angle );
                }

                // Schedule next animation frame
                var self = this;
                this._timer = setTimeout( function () {
                    self._animate.call( self );
                } , 10 ); // 10ms interval for smooth animation
            }

            // Execute callback function once animation completes
            // This is placed here to ensure the callback is called after the final rotation is applied.
            if ( this._parameters.callback && checkEnd ) {
                this._angle = this._parameters.animateTo; // Ensure final angle is exact
                this._rotate( this._angle ); // Apply final rotation
                this._parameters.callback.call( this._rootObj ); // Execute user callback
            }
        },


        // --- Core Rotation Application (Browser-specific) ---
        // This IIFE determines the appropriate rotation method based on browser capabilities.
        _rotate : ( function () {
            var rad = Math.PI / 180; // Constant for converting degrees to radians

            // Branch for Internet Explorer (using VML)
            if ( IE ) {
                return function ( angle ) {
                    this._angle = angle; // Store current angle
                    this._container.style.rotation = ( angle % 360 ) + "deg"; // Apply VML rotation
                    // Adjust VML image position relative to its container for correct centering
                    this._vimage.style.top = -( this._rotationCenterY - this._imgHeight / 2 ) + "px";
                    this._vimage.style.left = -( this._rotationCenterX - this._imgWidth / 2 ) + "px";
                    // Adjust VML container position to align with the original image's center
                    this._container.style.top = this._rotationCenterY - this._imgHeight / 2 + "px";
                    this._container.style.left = this._rotationCenterX - this._imgWidth / 2 + "px";
                };
            } else if ( supportedCSS ) {
                // Branch for modern browsers (using CSS transforms)
                return function ( angle ) {
                    this._angle = angle; // Store current angle
                    // Apply CSS transform rotation
                    this._img.style[ supportedCSS ] = "rotate(" + ( angle % 360 ) + "deg)";
                    // Set CSS transform origin for rotation point
                    this._img.style[ supportedCSSOrigin ] = this._parameters.center.join( " " );
                };
            } else {
                // Fallback branch (e.g., older browsers, or if canvas/VML fails) - uses Canvas
                return function ( angle ) {
                    this._angle = angle; // Store current angle
                    angle = ( angle % 360 ) * rad; // Convert angle to radians

                    // Clear and redraw canvas for each frame
                    this._canvas.width = this._width;
                    this._canvas.height = this._height;

                    // Apply canvas transformations in reverse order of desired effect:
                    // 1. Translate to center of image on canvas
                    this._cnv.translate( this._imgWidth * this._aspectW , this._imgHeight * this._aspectH );
                    // 2. Translate to rotation center
                    this._cnv.translate( this._rotationCenterX , this._rotationCenterY );
                    // 3. Rotate
                    this._cnv.rotate( angle );
                    // 4. Translate back from rotation center
                    this._cnv.translate( -this._rotationCenterX , -this._rotationCenterY );
                    // 5. Scale if aspect ratio is different
                    this._cnv.scale( this._aspectW , this._aspectH );
                    // 6. Draw the image
                    this._cnv.drawImage( this._img , 0 , 0 );
                };
            }

        } )()
    };


    // --- VML Node Creation for Internet Explorer ---
    // This section is specific to IE's VML rendering engine.
    if ( IE ) {
        Wilq32.PhotoEffect.prototype.createVMLNode = ( function () {
            // Add a CSS rule for VML behavior
            document.createStyleSheet().addRule( ".rvml" , "behavior:url(#default#VML)" );

            try {
                // Attempt to add VML namespace if not already present
                !document.namespaces.rvml && document.namespaces.add( "rvml" , "urn:schemas-microsoft-com:vml" );
                return function ( tagName ) {
                    // Return VML element creation using the rvml namespace
                    return document.createElement( '<rvml:' + tagName + ' class="rvml">' );
                };
            } catch ( e ) {
                return function ( tagName ) {
                    // Fallback for older IE versions or specific security settings
                    return document.createElement( '<' + tagName + ' xmlns="urn:schemas-microsoft-com:vml" class="rvml">' );
                };
            }
        } )();
    }


} )( jQuery ); // End of the self-executing anonymous function, passing jQuery as $