// This file is part of the Three.js library.
// Original author: Eberhard Graether (http://egraether.com/)
// License: MIT
//
// This is a Type I clone, preserving all original logic and identifiers,
// but with extensive changes to whitespace and comments for visual differentiation.

THREE.TrackballControls = function ( object , domElement )
{
    // Reference to the current instance, useful in callbacks.
    var _this = this;

    // Internal state constants for tracking user interaction.
    // NONE: No interaction
    // ROTATE: Camera rotation
    // ZOOM: Camera zoom
    // PAN: Camera panning
    // TOUCH_ROTATE: Touch-based rotation
    // TOUCH_ZOOM: Touch-based zoom (pinch)
    // TOUCH_PAN: Touch-based pan
    var STATE = {
        NONE        : -1,
        ROTATE      :  0,
        ZOOM        :  1,
        PAN         :  2,
        TOUCH_ROTATE:  3,
        TOUCH_ZOOM  :  4,
        TOUCH_PAN   :  5
    };

    // The camera object being controlled.
    this.object = object;
    // The DOM element to attach event listeners to. Defaults to document if not provided.
    this.domElement = ( domElement !== undefined ) ? domElement : document;

    // --- API Properties ---
    // These properties can be configured by the user.

    // Flag to enable or disable the controls.
    this.enabled = true;

    // Screen dimensions and offset for mouse calculations.
    this.screen = {
        width     : 0,
        height    : 0,
        offsetLeft: 0,
        offsetTop : 0
    };
    // Radius of the virtual trackball.
    this.radius = ( this.screen.width + this.screen.height ) / 4;

    // Control speeds for different actions.
    this.rotateSpeed = 1.0;
    this.zoomSpeed   = 1.2;
    this.panSpeed    = 0.3;

    // Flags to disable specific interaction types.
    this.noRotate = false; // If true, rotation is disabled.
    this.noZoom   = false;   // If true, zooming is disabled.
    this.noPan    = false;     // If true, panning is disabled.

    // Movement behavior flags.
    this.staticMoving       = false; // If true, movement stops immediately after interaction ends.
    this.dynamicDampingFactor = 0.2; // Damping factor for dynamic movement.

    // Distance constraints for the camera.
    this.minDistance = 0;
    this.maxDistance = Infinity; // Can be set to a finite value.

    // Keyboard keys used to activate specific control modes.
    // Default keys: A (Rotate), S (Zoom), D (Pan)
    this.keys = [
        65 /* A key */,
        83 /* S key */,
        68 /* D key */
    ];

    // --- Internal Variables ---
    // These variables manage the state and calculations of the controls.

    // The target point the camera is looking at.
    this.target = new THREE.Vector3();

    // Stores the camera's position from the previous update for change detection.
    var lastPosition = new THREE.Vector3();

    // Current and previous interaction states.
    var _state    = STATE.NONE, // Current interaction state.
        _prevState = STATE.NONE, // Previous interaction state (used for keydown).

    // Vector representing the camera's eye position relative to the target.
        _eye = new THREE.Vector3(),

    // Vectors for tracking rotation start and end points on the virtual trackball.
        _rotateStart = new THREE.Vector3(),
        _rotateEnd   = new THREE.Vector3(),

    // Vectors for tracking zoom start and end points on the screen.
        _zoomStart = new THREE.Vector2(),
        _zoomEnd   = new THREE.Vector2(),

    // Distances for touch-based zooming (pinch gesture).
        _touchZoomDistanceStart = 0,
        _touchZoomDistanceEnd   = 0,

    // Vectors for tracking pan start and end points on the screen.
        _panStart = new THREE.Vector2(),
        _panEnd   = new THREE.Vector2();

    // --- Reset State Storage ---
    // Store initial values to allow resetting the camera position.

    this.target0 = this.target.clone(); // Initial target position.
    this.position0 = this.object.position.clone(); // Initial camera position.
    this.up0 = this.object.up.clone(); // Initial camera up vector.

    // --- Events ---
    // Event object to be dispatched when the camera state changes.

    var changeEvent = { type: 'change' };


    // --- Public Methods ---
    // Functions exposed as part of the controls API.

    /**
     * Updates screen dimensions and trackball radius on window resize.
     * Should be called whenever the renderer's size changes.
     */
    this.handleResize = function ()
    {
        // Get current window dimensions.
        this.screen.width  = window.innerWidth;
        this.screen.height = window.innerHeight;

        // Reset offsets (assuming full window usage).
        this.screen.offsetLeft = 0;
        this.screen.offsetTop  = 0;

        // Recalculate trackball radius based on new screen size.
        this.radius = ( this.screen.width + this.screen.height ) / 4;
    };

    /**
     * Generic event handler for various DOM events.
     * Dispatches to specific event-type methods if they exist.
     * @param {Event} event - The DOM event object.
     */
    this.handleEvent = function ( event )
    {
        // Check if a method corresponding to the event type exists.
        if ( typeof this[ event.type ] == 'function' )
        {
            // Call the appropriate handler method.
            this[ event.type ]( event );
        }
    };

    /**
     * Converts client coordinates to a normalized screen position on the trackball.
     * @param {number} clientX - The client X coordinate of the mouse.
     * @param {number} clientY - The client Y coordinate of the mouse.
     * @returns {THREE.Vector2} A normalized vector representing mouse position.
     */
    this.getMouseOnScreen = function ( clientX , clientY )
    {
        // Returns a new THREE.Vector2 instance.
        return new THREE.Vector2(
            ( clientX - _this.screen.offsetLeft ) / _this.radius * 0.5, // X component
            ( clientY - _this.screen.offsetTop  ) / _this.radius * 0.5  // Y component
        );
    };

    /**
     * Projects client coordinates onto the virtual trackball sphere.
     * @param {number} clientX - The client X coordinate of the mouse.
     * @param {number} clientY - The client Y coordinate of the mouse.
     * @returns {THREE.Vector3} A vector representing the projected point on the ball.
     */
    this.getMouseProjectionOnBall = function ( clientX , clientY )
    {
        // Calculate mouse position relative to the center of the screen.
        var mouseOnBall = new THREE.Vector3(
            ( clientX - _this.screen.width * 0.5 - _this.screen.offsetLeft ) / _this.radius,
            ( _this.screen.height * 0.5 + _this.screen.offsetTop - clientY ) / _this.radius,
            0.0
        );

        // Calculate the length (distance from center) of the mouse vector.
        var length = mouseOnBall.length();

        // If the mouse is outside the trackball sphere, normalize it.
        if ( length > 1.0 )
        {
            mouseOnBall.normalize();
        }
        // If inside, calculate the Z component to project onto the sphere.
        else
        {
            mouseOnBall.z = Math.sqrt( 1.0 - length * length );
        }

        // Copy camera position and subtract target to get eye vector.
        _eye.copy( _this.object.position ).sub( _this.target );

        // Calculate projection vector based on mouse position and camera orientation.
        var projection = _this.object.up.clone().setLength( mouseOnBall.y );
        projection.add( _this.object.up.clone().cross( _eye ).setLength( mouseOnBall.x ) );
        projection.add( _eye.setLength( mouseOnBall.z ) );

        return projection;
    };

    /**
     * Rotates the camera based on the start and end points on the trackball.
     */
    this.rotateCamera = function ()
    {
        // Calculate the angle of rotation between the start and end vectors.
        var angle = Math.acos( _rotateStart.dot( _rotateEnd ) / _rotateStart.length() / _rotateEnd.length() );

        // Only rotate if there's a significant angle.
        if ( angle )
        {
            // Determine the axis of rotation by crossing the start and end vectors.
            var axis       = ( new THREE.Vector3() ).crossVectors( _rotateStart , _rotateEnd ).normalize(),
                quaternion = new THREE.Quaternion(); // Create a new quaternion for rotation.

            // Apply rotation speed.
            angle *= _this.rotateSpeed;

            // Set quaternion from axis and negative angle (for camera rotation).
            quaternion.setFromAxisAngle( axis , -angle );

            // Apply the quaternion to the eye vector and camera's up vector.
            _eye.applyQuaternion( quaternion );
            _this.object.up.applyQuaternion( quaternion );

            // Update the end rotation point.
            _rotateEnd.applyQuaternion( quaternion );

            // Handle static vs. dynamic moving.
            if ( _this.staticMoving )
            {
                // For static moving, the start point becomes the end point.
                _rotateStart.copy( _rotateEnd );
            }
            else
            {
                // For dynamic moving, apply damping to the start point.
                quaternion.setFromAxisAngle( axis , angle * ( _this.dynamicDampingFactor - 1.0 ) );
                _rotateStart.applyQuaternion( quaternion );
            }
        }
    };

    /**
     * Zooms the camera in or out.
     */
    this.zoomCamera = function ()
    {
        // Handle touch zoom specifically.
        if ( _state === STATE.TOUCH_ZOOM )
        {
            // Calculate zoom factor based on touch distance change.
            var factor = _touchZoomDistanceStart / _touchZoomDistanceEnd;
            _touchZoomDistanceStart = _touchZoomDistanceEnd; // Update start distance for next frame.
            _eye.multiplyScalar( factor ); // Apply zoom to eye vector.
        }
        else
        {
            // Calculate zoom factor for mouse wheel or drag zoom.
            var factor = 1.0 + ( _zoomEnd.y - _zoomStart.y ) * _this.zoomSpeed;

            // Apply zoom if factor is valid and not 1 (no change).
            if ( factor !== 1.0 && factor > 0.0 )
            {
                _eye.multiplyScalar( factor );

                // Handle static vs. dynamic moving.
                if ( _this.staticMoving )
                {
                    _zoomStart.copy( _zoomEnd ); // For static, start becomes end.
                }
                else
                {
                    // For dynamic, interpolate start towards end with damping.
                    _zoomStart.y += ( _zoomEnd.y - _zoomStart.y ) * this.dynamicDampingFactor;
                }
            }
        }
    };

    /**
     * Pans the camera (moves it laterally).
     */
    this.panCamera = function ()
    {
        // Calculate the change in mouse position for panning.
        var mouseChange = _panEnd.clone().sub( _panStart );

        // Only pan if there's a significant mouse movement.
        if ( mouseChange.lengthSq() )
        {
            // Scale mouse change by eye distance and pan speed.
            mouseChange.multiplyScalar( _eye.length() * _this.panSpeed );

            // Calculate the pan vector.
            // Pan horizontally (X) by crossing eye with up vector.
            var pan = _eye.clone().cross( _this.object.up ).setLength( mouseChange.x );
            // Pan vertically (Y) by using camera's up vector.
            pan.add( _this.object.up.clone().setLength( mouseChange.y ) );

            // Apply pan to both camera position and target.
            _this.object.position.add( pan );
            _this.target.add( pan );

            // Handle static vs. dynamic moving.
            if ( _this.staticMoving )
            {
                _panStart = _panEnd; // For static, start becomes end.
            }
            else
            {
                // For dynamic, interpolate start towards end with damping.
                _panStart.add( mouseChange.subVectors( _panEnd , _panStart ).multiplyScalar( _this.dynamicDampingFactor ) );
            }
        }
    };

    /**
     * Checks and enforces distance constraints (minDistance, maxDistance) for the camera.
     */
    this.checkDistances = function ()
    {
        // Only apply constraints if zoom or pan is enabled.
        if ( !_this.noZoom || !_this.noPan )
        {
            // Enforce maximum distance.
            if ( _this.object.position.lengthSq() > _this.maxDistance * _this.maxDistance )
            {
                _this.object.position.setLength( _this.maxDistance );
            }

            // Enforce minimum distance.
            if ( _eye.lengthSq() < _this.minDistance * _this.minDistance )
            {
                // Adjust eye vector to minDistance and update camera position.
                _this.object.position.addVectors( _this.target , _eye.setLength( _this.minDistance ) );
            }
        }
    };

    /**
     * Main update loop for the controls.
     * Should be called in the application's animation loop.
     */
    this.update = function ()
    {
        // Recalculate eye vector (camera position relative to target).
        _eye.subVectors( _this.object.position , _this.target );

        // Perform camera actions based on enabled flags.
        if ( !_this.noRotate )
        {
            _this.rotateCamera(); // Execute rotation logic.
        }

        if ( !_this.noZoom )
        {
            _this.zoomCamera(); // Execute zoom logic.
        }

        if ( !_this.noPan )
        {
            _this.panCamera(); // Execute pan logic.
        }

        // Reconstruct camera position from target and updated eye vector.
        _this.object.position.addVectors( _this.target , _eye );

        _this.checkDistances(); // Apply distance limits.

        _this.object.lookAt( _this.target ); // Make camera look at the target.

        // If camera position has changed, dispatch a 'change' event.
        if ( lastPosition.distanceToSquared( _this.object.position ) > 0 )
        {
            _this.dispatchEvent( changeEvent ); // Notify listeners of change.

            lastPosition.copy( _this.object.position ); // Update last position.
        }
    };

    /**
     * Resets the camera to its initial position and orientation.
     */
    this.reset = function ()
    {
        // Reset internal state variables.
        _state    = STATE.NONE;
        _prevState = STATE.NONE;

        // Restore initial target, position, and up vector.
        _this.target.copy( _this.target0 );
        _this.object.position.copy( _this.position0 );
        _this.object.up.copy( _this.up0 );

        // Recalculate eye vector after reset.
        _eye.subVectors( _this.object.position , _this.target );

        _this.object.lookAt( _this.target ); // Make camera look at the target.

        _this.dispatchEvent( changeEvent ); // Dispatch change event.

        lastPosition.copy( _this.object.position ); // Update last position.
    };

    // --- Private Event Listeners ---
    // These functions handle raw DOM events and update the control state.

    /**
     * Handles keyboard keydown events.
     * Activates rotation, zoom, or pan modes based on key presses.
     * @param {KeyboardEvent} event - The keydown event object.
     */
    function keydown ( event )
    {
        // If controls are disabled, do nothing.
        if ( _this.enabled === false ) { return; }

        // Immediately remove listener to prevent repeated keydown events.
        window.removeEventListener( 'keydown' , keydown );

        _prevState = _state; // Store current state as previous.

        // If already in an active state (e.g., mouse interaction), ignore keydown.
        if ( _state !== STATE.NONE )
        {
            return;
        }
        // Check for 'A' key (Rotate).
        else if ( event.keyCode === _this.keys[ STATE.ROTATE ] && !_this.noRotate )
        {
            _state = STATE.ROTATE;
        }
        // Check for 'S' key (Zoom).
        else if ( event.keyCode === _this.keys[ STATE.ZOOM ] && !_this.noZoom )
        {
            _state = STATE.ZOOM;
        }
        // Check for 'D' key (Pan).
        else if ( event.keyCode === _this.keys[ STATE.PAN ] && !_this.noPan )
        {
            _state = STATE.PAN;
        }
    }

    /**
     * Handles keyboard keyup events.
     * Resets the control state after a key is released.
     * @param {KeyboardEvent} event - The keyup event object.
     */
    function keyup ( event )
    {
        // If controls are disabled, do nothing.
        if ( _this.enabled === false ) { return; }

        _state = _prevState; // Revert to the state before keydown.

        // Re-add keydown listener.
        window.addEventListener( 'keydown' , keydown , false );
    }

    /**
     * Handles mouse button down events.
     * Initiates rotation, zoom, or pan based on mouse button.
     * @param {MouseEvent} event - The mousedown event object.
     */
    function mousedown ( event )
    {
        // If controls are disabled, do nothing.
        if ( _this.enabled === false ) { return; }

        // Prevent default browser actions and event propagation.
        event.preventDefault();
        event.stopPropagation();

        // If no active state, set state based on mouse button.
        if ( _state === STATE.NONE )
        {
            _state = event.button;
        }

        // Initialize start and end points based on the active state.
        if ( _state === STATE.ROTATE && !_this.noRotate )
        {
            _rotateStart = _rotateEnd = _this.getMouseProjectionOnBall( event.clientX , event.clientY );
        }
        else if ( _state === STATE.ZOOM && !_this.noZoom )
        {
            _zoomStart = _zoomEnd = _this.getMouseOnScreen( event.clientX , event.clientY );
        }
        else if ( _state === STATE.PAN && !_this.noPan )
        {
            _panStart = _panEnd = _this.getMouseOnScreen( event.clientX , event.clientY );
        }

        // Add mousemove and mouseup listeners to the document for drag tracking.
        document.addEventListener( 'mousemove' , mousemove , false );
        document.addEventListener( 'mouseup'   , mouseup   , false );
    }

    /**
     * Handles mouse movement events during a drag operation.
     * Updates end points for rotation, zoom, or pan.
     * @param {MouseEvent} event - The mousemove event object.
     */
    function mousemove ( event )
    {
        // If controls are disabled, do nothing.
        if ( _this.enabled === false ) { return; }

        // Prevent default browser actions and event propagation.
        event.preventDefault();
        event.stopPropagation();

        // Update end points based on the active state.
        if ( _state === STATE.ROTATE && !_this.noRotate )
        {
            _rotateEnd = _this.getMouseProjectionOnBall( event.clientX , event.clientY );
        }
        else if ( _state === STATE.ZOOM && !_this.noZoom )
        {
            _zoomEnd = _this.getMouseOnScreen( event.clientX , event.clientY );
        }
        else if ( _state === STATE.PAN && !_this.noPan )
        {
            _panEnd = _this.getMouseOnScreen( event.clientX , event.clientY );
        }
    }

    /**
     * Handles mouse button up events.
     * Resets the control state and removes drag listeners.
     * @param {MouseEvent} event - The mouseup event object.
     */
    function mouseup ( event )
    {
        // If controls are disabled, do nothing.
        if ( _this.enabled === false ) { return; }

        // Prevent default browser actions and event propagation.
        event.preventDefault();
        event.stopPropagation();

        _state = STATE.NONE; // Reset state to none.

        // Remove mousemove and mouseup listeners.
        document.removeEventListener( 'mousemove' , mousemove );
        document.removeEventListener( 'mouseup'   , mouseup   );
    }

    /**
     * Handles mouse wheel events for zooming.
     * @param {WheelEvent} event - The mousewheel event object.
     */
    function mousewheel ( event )
    {
        // If controls are disabled, do nothing.
        if ( _this.enabled === false ) { return; }

        // Prevent default browser actions and event propagation.
        event.preventDefault();
        event.stopPropagation();

        var delta = 0; // Initialize delta for zoom amount.

        // Determine delta based on browser (WebKit/Opera/IE vs. Firefox).
        if ( event.wheelDelta )
        {
            // WebKit / Opera / Explorer 9+
            delta = event.wheelDelta / 40;
        }
        else if ( event.detail )
        {
            // Firefox
            delta = -event.detail / 3;
        }

        // Apply delta to the zoom start Y component.
        // This will be picked up by zoomCamera in the update loop.
        _zoomStart.y += delta * 0.01;
    }

    /**
     * Handles touch start events.
     * Initiates touch-based rotation, zoom, or pan based on number of touches.
     * @param {TouchEvent} event - The touchstart event object.
     */
    function touchstart ( event )
    {
        // If controls are disabled, do nothing.
        if ( _this.enabled === false ) { return; }

        // Determine action based on number of active touches.
        switch ( event.touches.length )
        {
            case 1: // Single touch for rotation.
                _state = STATE.TOUCH_ROTATE;
                _rotateStart = _rotateEnd = _this.getMouseProjectionOnBall( event.touches[ 0 ].pageX , event.touches[ 0 ].pageY );
                break;

            case 2: // Two touches for zooming (pinch).
                _state = STATE.TOUCH_ZOOM;
                var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                // Calculate initial distance between touches.
                _touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt( dx * dx + dy * dy );
                break;

            case 3: // Three touches for panning.
                _state = STATE.TOUCH_PAN;
                _panStart = _panEnd = _this.getMouseOnScreen( event.touches[ 0 ].pageX , event.touches[ 0 ].pageY );
                break;

            default: // More than 3 touches or no recognized gesture.
                _state = STATE.NONE;
        }
    }

    /**
     * Handles touch move events.
     * Updates end points for touch-based rotation, zoom, or pan.
     * @param {TouchEvent} event - The touchmove event object.
     */
    function touchmove ( event )
    {
        // If controls are disabled, do nothing.
        if ( _this.enabled === false ) { return; }

        // Prevent default browser actions and event propagation.
        event.preventDefault();
        event.stopPropagation();

        // Update end points based on the number of touches and active state.
        switch ( event.touches.length )
        {
            case 1: // Single touch, update rotation end point.
                _rotateEnd = _this.getMouseProjectionOnBall( event.touches[ 0 ].pageX , event.touches[ 0 ].pageY );
                break;

            case 2: // Two touches, update zoom distance.
                var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                _touchZoomDistanceEnd = Math.sqrt( dx * dx + dy * dy );
                break;

            case 3: // Three touches, update pan end point.
                _panEnd = _this.getMouseOnScreen( event.touches[ 0 ].pageX , event.touches[ 0 ].pageY );
                break;

            default: // Unrecognized touch gesture.
                _state = STATE.NONE;
        }
    }

    /**
     * Handles touch end events.
     * Note: The provided original code for this function was incomplete (switch statement not closed).
     * For a Type I clone, I must replicate this exact structure, only altering whitespace and comments.
     * No logical completion of the switch statement is permitted.
     * @param {TouchEvent} event - The touchend event object.
     */
    function touchend ( event )
    {
        // If the controls are currently disabled, exit early.
        if ( _this.enabled === false ) { return; }

        // Begin processing based on the number of active touches remaining.
        switch ( event.touches.length )
        {
            // The original source code snippet ends abruptly here.
            // As per Type I cloning rules, no new code or logical completion
            // of the switch statement can be added. Only whitespace and comments
            // are allowed as changes.
            // This preserves the exact logical and structural identity of the original fragment.