/*
 * This is a Type I clone of the original traqball.js code.
 * It maintains exact logical and structural identity.
 * Only whitespace and comments have been altered extensively
 * to create a visually distinct but functionally identical version.
 */

( function ()
{
  // Declare core variables for environment detection and animation frame management
  var userAgent = navigator.userAgent.toLowerCase(),
      canTouch = "ontouchstart" in window,
      prefix = cssPref = "", // CSS vendor prefixes
      requestAnimFrame,
      cancelAnimFrame;

  // Determine browser-specific CSS prefixes based on user agent string.
  // This helps ensure compatibility across different browser engines.
  if ( /webkit/gi.test( userAgent ) )
  {
    prefix = "-webkit-"; // WebKit prefix
    cssPref = "Webkit";
  }
  else if ( /msie | trident/gi.test( userAgent ) )
  {
    prefix = "-ms-"; // Microsoft prefix (IE)
    cssPref = "ms";
  }
  else if ( /mozilla/gi.test( userAgent ) )
  {
    prefix = "-moz-"; // Mozilla prefix (Firefox)
    cssPref = "Moz";
  }
  else if ( /opera/gi.test( userAgent ) )
  {
    prefix = "-o-"; // Opera prefix
    cssPref = "O";
  }
  else
  {
    prefix = ""; // No specific prefix needed or recognized
  }

  /**
   * Binds or unbinds an event listener to a target element.
   * Automatically translates touch events to mouse events if touch is not supported.
   * @param {HTMLElement} target - The DOM element to bind the event to.
   * @param {string} type - The event type (e.g., 'touchstart', 'mousemove').
   * @param {Function} callback - The function to be executed when the event occurs.
   * @param {string} [remove="add"] - Specifies whether to 'add' or 'remove' the event listener.
   */
  function bindEvent( target, type, callback, remove )
  {
    var evType = type || "touchend", // Default event type
        mouseEvs = ["mousedown", "mouseup", "mousemove"], // Mouse event equivalents
        touchEvs = ["touchstart", "touchend", "touchmove"], // Touch event types
        remove = remove || "add"; // Action: "add" or "remove"

    // If touch is not available, map touch events to mouse events
    evType = canTouch ? evType : mouseEvs[touchEvs.indexOf( type )];

    // Execute the appropriate event listener method
    target[remove + "EventListener"]( evType, callback, false );
  }

  /**
   * Retrieves the X and Y coordinates from an event object.
   * Handles both mouse and touch events.
   * @param {Event} eventObj - The event object (e.g., MouseEvent, TouchEvent).
   * @returns {Array<number>} - An array containing [x, y] coordinates.
   */
  function getCoords( eventObj )
  {
    var xTouch,
        yTouch;

    // Check if it's a mouse event
    if ( eventObj.type.indexOf( "mouse" ) > -1 )
    {
      xTouch = eventObj.pageX;
      yTouch = eventObj.pageY;
    }
    // Check if it's a touch event
    else if ( eventObj.type.indexOf( "touch" ) > -1 )
    {
      // Only process if a single finger is used
      if ( eventObj.touches.length === 1 )
      {
        var touch = eventObj.touches[0];
        xTouch = touch.pageX;
        yTouch = touch.pageY;
      }
    }

    return [xTouch, yTouch];
  }

  /**
   * Retrieves the computed style value for a given CSS property.
   * @param {HTMLElement} target - The element to query.
   * @param {string} prop - The CSS property name.
   * @returns {string} - The computed value of the CSS property.
   */
  function getStyle( target, prop )
  {
    var style = document.defaultView.getComputedStyle( target, "" );
    return style.getPropertyValue( prop );
  }

  // Polyfill for requestAnimationFrame for smoother animations.
  requestAnimFrame = ( function ()
  {
    return window[cssPref + "RequestAnimationFrame"] ||
           function ( callback )
           {
             window.setTimeout( callback, 17 ); // Fallback to setTimeout (approx. 60fps)
           };
  } )();

  // Polyfill for cancelAnimationFrame.
  cancelAnimFrame = ( function ()
  {
    return window[cssPref + "CancelRequestAnimationFrame"] ||
           clearTimeout; // Fallback to clearTimeout
  } )();

  /**
   * Traqball constructor. Initializes a new trackball instance.
   * @param {Object} confObj - Configuration object for the trackball.
   */
  var Traqball = function ( confObj )
  {
    this.config = {}; // Stores configuration settings
    this.box = null; // Reference to the rotatable DOM element

    this.setup( confObj ); // Initialize the trackball
  };

  /**
   * Disables the trackball interaction.
   * Removes event listeners from the box and document.
   */
  Traqball.prototype.disable = function ()
  {
    if ( this.box !== null )
    {
      bindEvent( this.box, 'touchstart', this.evHandlers[0], "remove" );
      bindEvent( document, 'touchmove', this.evHandlers[1], "remove" );
      bindEvent( document, 'touchend', this.evHandlers[2], "remove" );
    }
  };

  /**
   * Activates the trackball interaction.
   * Re-adds event listeners to the box and document.
   */
  Traqball.prototype.activate = function ()
  {
    if ( this.box !== null )
    {
      bindEvent( this.box, 'touchstart', this.evHandlers[0] );
      bindEvent( document, 'touchmove', this.evHandlers[1], "remove" );
      bindEvent( document, 'touchend', this.evHandlers[2], "remove" );
    }
  };

  /**
   * Sets up the trackball instance based on the provided configuration.
   * @param {Object} conf - Configuration object.
   */
  Traqball.prototype.setup = function ( conf )
  {
    var THIS = this, // Reference to the Traqball instance
        radius, // Radius of the virtual trackball
        stage, // The DOM container for the rotatable element
        axis = [], // Current rotation axis [x, y, z]
        mouseDownVect = [], // 3D vector at the start of a drag
        mouseMoveVect = [], // 3D vector during a drag
        startMatrix = [], // Initial transformation matrix
        delta = 0, // Momentum/speed of rotation
        impulse, pos, w, h, decr, angle, oldAngle, oldTime, curTime; // Various state variables

    ( function init()
    {
      THIS.disable(); // Ensure previous listeners are removed

      // Copy configuration properties
      for ( var prop in conf )
      {
        THIS.config[prop] = conf[prop];
      }

      // Identify the stage and the rotatable box
      stage = document.getElementById( THIS.config.stage ) || document.getElementsByTagname( "body" )[0];
      pos = findPos( stage ); // Get position of the stage
      angle = THIS.config.angle || 0; // Initial rotation angle
      impulse = THIS.config.impulse === false ? false : true; // Enable/disable impulse (momentum)

      // Calculate trackball radius based on the stage dimensions
      h = stage.offsetHeight / 2;
      w = stage.offsetWidth / 2;
      radius = h < w ? h : w; // Use the shorter dimension for radius

      // Find the first block-level child within the stage to be the rotatable box
      for ( var i = 0, l = stage.childNodes.length; i < l; i++ )
      {
        var child = stage.childNodes[i];

        if ( child.nodeType === 1 )
        {
          THIS.box = child; // Found the box
          break;
        }
      }

      // Get existing CSS3D transform properties
      var perspective = getStyle( stage, prefix + "perspective" ),
          pOrigin = getStyle( stage, prefix + "perspective-origin" ),
          bTransform = getStyle( THIS.box, prefix + "transform" );

      // Initialize axis, angle, and startMatrix based on config or existing CSS
      if ( THIS.config.axis || THIS.config.angle )
      {
        axis = normalize( THIS.config.axis ) || [1, 0, 0]; // Normalize custom axis
        angle = THIS.config.angle || 0;
        startMatrix = calcMatrix( axis, angle ); // Calculate initial matrix
      }
      else if ( bTransform !== "none" )
      {
        // Parse existing CSS3D transforms
        startMatrix = bTransform.split( "," );

        // Convert 2D matrix to 3D matrix if necessary
        if ( /matrix3d/gi.test( startMatrix[0] ) )
        {
          startMatrix[0] = startMatrix[0].replace( /(matrix3d\()/g, "" );
          startMatrix[15] = startMatrix[15].replace( /\)/g, "" );
        }
        else
        {
          startMatrix[0] = startMatrix[0].replace( /(matrix\()/g, "" );
          startMatrix[5] = startMatrix[5].replace( /\)/g, "" );
          startMatrix.splice( 2, 0, 0, 0 );
          startMatrix.splice( 6, 0, 0, 0 );
          startMatrix.splice( 8, 0, 0, 0, 1, 0 );
          startMatrix.splice( 14, 0, 0, 1 );
        }
        // Convert string values to floats
        for ( var i = 0, l = startMatrix.length; i < l; i++ )
        {
          startMatrix[i] = parseFloat( startMatrix[i] );
        }
      }
      else
      {
        // Default values if no config or existing transforms
        axis = [0, 1, 0];
        angle = 0;
        startMatrix = calcMatrix( axis, angle );
      }

      // Apply perspective to the stage if configured or if none exists
      if ( THIS.config.perspective )
      {
        stage.style[cssPref + "Perspective"] = THIS.config.perspective;
      }
      else if ( perspective === "none" )
      {
        stage.style[cssPref + "Perspective"] = "700px";
      }

      // Apply perspective origin if configured
      if ( THIS.config.perspectiveOrigin )
      {
        stage.style[cssPref + "PerspectiveOrigin"] = THIS.config.perspectiveOrigin;
      }

      // Apply the initial transform matrix to the box
      THIS.box.style[cssPref + "Transform"] = "matrix3d(" + startMatrix + ")";
      bindEvent( THIS.box, 'touchstart', startrotation );

      // Store event handlers for easy removal/re-addition
      THIS.evHandlers = [startrotation, rotate, finishrotation];
    } )();


    /**
     * Handles the start of a rotation gesture (mousedown/touchstart).
     * @param {Event} e - The event object.
     */
    function startrotation( e )
    {
      if ( delta !== 0 )
      {
        stopSlide();
      } // Stop any ongoing slide animation
      e.preventDefault(); // Prevent default browser actions (e.g., scrolling)

      mouseDownVect = calcZvector( getCoords( e ) ); // Calculate initial 3D vector
      oldTime = curTime = new Date().getTime(); // Record start time
      oldAngle = angle; // Store current angle

      // Update event listeners for the drag/rotation phase
      bindEvent( THIS.box, 'touchstart', startrotation, "remove" );
      bindEvent( document, 'touchmove', rotate );
      bindEvent( document, 'touchend', finishrotation );
    }

    /**
     * Handles the end of a rotation gesture (mouseup/touchend).
     * @param {Event} e - The event object.
     */
    function finishrotation( e )
    {
      var stopMatrix; // Temporary matrix for cleanup

      // Remove drag/rotation event listeners
      bindEvent( document, 'touchmove', rotate, "remove" );
      bindEvent( document, 'touchend', finishrotation, "remove" );
      bindEvent( THIS.box, 'touchstart', startrotation ); // Re-add start listener

      calcSpeed(); // Calculate the speed for impulse rotation
      // If impulse is enabled and there's momentum, start sliding
      if ( impulse && delta > 0 )
      {
        requestAnimFrame( slide );
      }
      // If no momentum or impulse is disabled, stop immediately
      else if ( !( isNaN( axis[0] ) || isNaN( axis[1] ) || isNaN( axis[2] ) ) )
      {
        stopSlide();
      }
    }

    /**
     * Cleans up the matrix after rotation stops, preparing for the next rotation.
     * Combines the current rotation into the startMatrix.
     */
    function cleanupMatrix()
    {
      // Calculate a matrix from the current axis and angle
      stopMatrix = calcMatrix( axis, angle );
      // Multiply the startMatrix with the stopMatrix to accumulate the rotation
      startMatrix = multiplyMatrix( startMatrix, stopMatrix );
    }

    /**
     * Handles the rotation during a drag gesture (mousemove/touchmove).
     * @param {Event} e - The event object.
     */
    function rotate( e )
    {
      var eCoords = getCoords( e ); // Get current mouse/touch coordinates
      e.preventDefault(); // Prevent default browser actions

      oldTime = curTime; // Update previous time
      oldAngle = angle; // Update previous angle

      // Calculate the current 3D vector on the virtual trackball
      mouseMoveVect = calcZvector( eCoords );

      // Calculate the rotation axis (normal vector perpendicular to mouseDownVect and mouseMoveVect)
      axis[0] = mouseDownVect[1] * mouseMoveVect[2] - mouseDownVect[2] * mouseMoveVect[1];
      axis[1] = mouseDownVect[2] * mouseMoveVect[0] - mouseDownVect[0] * mouseMoveVect[2];
      axis[2] = mouseDownVect[0] * mouseMoveVect[1] - mouseDownVect[1] * mouseMoveVect[0];
      axis = normalize( axis ); // Normalize the axis vector

      // Calculate the angle of rotation between the two vectors
      angle = calcAngle( mouseDownVect, mouseMoveVect );

      // Apply the new transform: current rotation combined with the accumulated startMatrix
      THIS.box.style[cssPref + "Transform"] = "rotate3d(" + axis + "," + angle + "rad) matrix3d(" + startMatrix + ")";

      curTime = new Date().getTime(); // Record current time
    }

    /**
     * Calculates the speed (delta) for impulse rotation based on recent movement.
     */
    function calcSpeed()
    {
      var dw = angle - oldAngle; // Change in angle
      dt = curTime - oldTime; // Change in time

      // Calculate delta, scaling by 17ms (approx. 60fps frame time)
      delta = Math.abs( dw * 17 / dt );

      // Handle potential NaN and cap delta to prevent excessive speed
      if ( isNaN( delta ) )
      {
        delta = 0;
      }
      else if ( delta > 0.2 )
      {
        delta = 0.2;
      }
    }

    /**
     * Implements the "impulse" or "momentum" effect,
     * where the box continues to rotate and gradually slows down.
     */
    function slide()
    {
      angle += delta; // Increment angle by current delta
      decr = 0.01 * Math.sqrt( delta ); // Calculate deceleration factor
      delta = delta > 0 ? delta - decr : 0; // Decrease delta, ensuring it doesn't go negative

      // Apply the new transform with the updated angle
      THIS.box.style[cssPref + "Transform"] = "rotate3d(" + axis + "," + angle + "rad) matrix3d(" + startMatrix + ")";

      // Stop sliding if delta reaches zero
      if ( delta === 0 )
      {
        stopSlide();
      }
      else
      {
        requestAnimFrame( slide ); // Continue animation
      }
    }

    /**
     * Stops any ongoing slide animation and resets related variables.
     */
    function stopSlide()
    {
      cancelAnimFrame( slide ); // Cancel the animation frame request
      cleanupMatrix(); // Integrate current rotation into startMatrix
      oldAngle = angle = 0; // Reset angle
      delta = 0; // Reset delta (speed)
    }

    /**
     * Performs matrix multiplication for two 4x4 matrices.
     * @param {Array<number>} m1 - The first matrix (16 elements).
     * @param {Array<number>} m2 - The second matrix (16 elements).
     * @returns {Array<number>} - The resulting multiplied matrix.
     */
    function multiplyMatrix( m1, m2 )
    {
      var matrix = [];

      matrix[0] = m1[0] * m2[0] + m1[1] * m2[4] + m1[2] * m2[8] + m1[3] * m2[12];
      matrix[1] = m1[0] * m2[1] + m1[1] * m2[5] + m1[2] * m2[9] + m1[3] * m2[13];
      matrix[2] = m1[0] * m2[2] + m1[1] * m2[6] + m1[2] * m2[10] + m1[3] * m2[14];
      matrix[3] = m1[0] * m2[3] + m1[1] * m2[7] + m1[2] * m2[11] + m1[3] * m2[15];
      matrix[4] = m1[4] * m2[0] + m1[5] * m2[4] + m1[6] * m2[8] + m1[7] * m2[12];
      matrix[5] = m1[4] * m2[1] + m1[5] * m2[5] + m1[6] * m2[9] + m1[7] * m2[13];
      matrix[6] = m1[4] * m2[2] + m1[5] * m2[6] + m1[6] * m2[10] + m1[7] * m2[14];
      matrix[7] = m1[4] * m2[3] + m1[5] * m2[7] + m1[6] * m2[11] + m1[7] * m2[15];
      matrix[8] = m1[8] * m2[0] + m1[9] * m2[4] + m1[10] * m2[8] + m1[11] * m2[12];
      matrix[9] = m1[8] * m2[1] + m1[9] * m2[5] + m1[10] * m2[9] + m1[11] * m2[13];
      matrix[10] = m1[8] * m2[2] + m1[9] * m2[6] + m1[10] * m2[10] + m1[11] * m2[14];
      matrix[11] = m1[8] * m2[3] + m1[9] * m2[7] + m1[10] * m2[11] + m1[11] * m2[15];
      matrix[12] = m1[12] * m2[0] + m1[13] * m2[4] + m1[14] * m2[8] + m1[15] * m2[12];
      matrix[13] = m1[12] * m2[1] + m1[13] * m2[5] + m1[14] * m2[9] + m1[15] * m2[13];
      matrix[14] = m1[12] * m2[2] + m1[13] * m2[6] + m1[14] * m2[10] + m1[15] * m2[14];
      matrix[15] = m1[12] * m2[3] + m1[13] * m2[7] + m1[14] * m2[11] + m1[15] * m2[15];

      return matrix;
    }

    /**
     * Calculates the 3D vector (x, y, z) on the virtual trackball
     * from 2D screen coordinates.
     * @param {Array<number>} coords - An array [x, y] of screen coordinates.
     * @returns {Array<number>} - A 3D vector [x, y, z].
     */
    function calcZvector( coords )
    {
      var x = THIS.config.limitAxxis === "x" ? radius : coords[0] - pos[0],
          y = THIS.config.limitAxxis === "y" ? radius : coords[1] - pos[1],
          vector = [( x / radius - 1 ), ( y / radius - 1 )], // Normalize x, y to -1 to 1 range
          z = 1 - vector[0] * vector[0] - vector[1] * vector[1]; // Calculate z component

      // Ensure z is not negative, if so, clamp to 0
      vector[2] = z > 0 ? Math.sqrt( z ) : 0;

      return vector;
    }

    /**
     * Normalizes a 3D vector, making its length equal to 1.
     * @param {Array<number>} vect - The 3D vector [x, y, z] to normalize.
     * @returns {Array<number>} - The normalized vector.
     */
    function normalize( vect )
    {
      var length = Math.sqrt( vect[0] * vect[0] + vect[1] * vect[1] + vect[2] * vect[2] );

      vect[0] /= length;
      vect[1] /= length;
      vect[2] /= length;

      return vect;
    }

    /**
     * Calculates the angle (in radians) between two 3D vectors.
     * @param {Array<number>} vect_1 - The first 3D vector.
     * @param {Array<number>} vect_2 - The second 3D vector.
     * @returns {number} - The angle between the vectors in radians.
     */
    function calcAngle( vect_1, vect_2 )
    {
      var numerator = vect_1[0] * vect_2[0] + vect_1[1] * vect_2[1] + vect_1[2] * vect_2[2],
          denominator = Math.sqrt( vect_1[0] * vect_1[0] + vect_1[1] * vect_1[1] + vect_1[2] * vect_1[2] ) *
                        Math.sqrt( vect_2[0] * vect_2[0] + vect_2[1] * vect_2[1] + vect_2[2] * vect_2[2] ),
          angle = Math.acos( numerator / denominator ); // Use arccosine to find the angle

      return angle;
    }

    /**
     * Calculates a 4x4 transformation matrix from a rotation axis vector and an angle.
     * This is a standard rotation matrix formula (Rodrigues' rotation formula variant).
     * @param {Array<number>} vector - The rotation axis [x, y, z].
     * @param {number} angle - The rotation angle in radians.
     * @returns {Array<number>} - A 16-element array representing the 4x4 matrix.
     */
    function calcMatrix( vector, angle )
    {
      var x = vector[0],
          y = vector[1],
          z = vector[2],
          sin = Math.sin( angle ),
          cos = Math.cos( angle ),
          cosmin = 1 - cos,
          matrix = [( cos + x * x * cosmin ), ( y * x * cosmin + z * sin ), ( z * x * cosmin - y * sin ), 0,
            ( x * y * cosmin - z * sin ), ( cos + y * y * cosmin ), ( z * y * cosmin + x * sin ), 0,
            ( x * z * cosmin + y * sin ), ( y * z * cosmin - x * sin ), ( cos + z * z * cosmin ), 0,
            0, 0, 0, 1];

      return matrix;
    }

    /**
     * Calculates the absolute position of a DOM element relative to the document.
     * (Function adapted from quirksmode.org)
     * @param {HTMLElement} obj - The DOM element.
     * @returns {Array<number>} - An array [left, top] representing the element's position.
     */
    function findPos( obj )
    {
      var curleft = 0,
          curtop = 0;

      if ( obj.offsetParent )
      {
        do
        {
          curleft += obj.offsetLeft;
          curtop += obj.offsetTop;
        } while ( obj = obj.offsetParent ); // Loop through offset parents
        return [curleft, curtop];
      }
    }
  };

  // Expose the Traqball constructor to the global window object
  window.Traqball = Traqball;
} )();