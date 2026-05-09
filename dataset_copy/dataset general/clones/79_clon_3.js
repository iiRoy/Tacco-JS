const RENDER_ENGINE = RENDER_ENGINE || {};

/**
 * @file Robust 3D Camera Interaction System.
 * @author Based on original work by Eberhard Graether. Reimagined by AI.
 * @license Re-licensed under MIT (or similar to original).
 */

/**
 * Manages user interactions (mouse, keyboard, touch) to control a 3D camera or object.
 * @param {object} targetObject - The 3D object to be manipulated (e.g., a camera). Must have .position, .up, and .lookAt methods.
 * @param {HTMLElement} [inputElement=document.body] - The DOM element to attach event listeners to.
 */
RENDER_ENGINE.ViewManipulator = function ( targetObject, inputElement ) {

    // Self-reference for internal methods and closures
    const selfRef = this;

    // Enumeration of possible interaction states
    const InteractionMode = Object.freeze({
        IDLE: -1,             // No active interaction
        ROTATING: 0,          // Mouse/keyboard-driven rotation
        MAGNIFYING: 1,        // Mouse/keyboard-driven zooming
        TRANSLATING: 2,       // Mouse/keyboard-driven panning
        TOUCH_ROTATING: 3,    // Single-touch rotation
        TOUCH_MAGNIFYING: 4,  // Dual-touch zooming
        TOUCH_TRANSLATING: 5  // Tri-touch panning
    });

    // Validate the target 3D object. Essential for core functionality.
    if (!targetObject || typeof targetObject.position === 'undefined' || typeof targetObject.up === 'undefined' || typeof targetObject.lookAt !== 'function') {
        console.error("ViewManipulator: The provided targetObject is invalid. It must possess 'position', 'up' RENDER_ENGINE.Vector3 properties and a 'lookAt' method.");
        // Attempt to proceed with a dummy object to prevent immediate crash, though functionality will be broken.
        this.controlledEntity = {
            position: new RENDER_ENGINE.Vector3(),
            up: new RENDER_ENGINE.Vector3(0, 1, 0),
            lookAt: function() { console.warn("ViewManipulator: Dummy lookAt called on invalid controlledEntity."); }
        };
        this.isActive = false; // Deactivate if target is invalid
    } else {
        this.controlledEntity = targetObject;
        this.isActive = true; // Controller is active by default
    }


    // Determine the source DOM element for capturing input events
    this.eventSource = ( inputElement instanceof HTMLElement ) ? inputElement : document.body;

    // --- Public Configuration Settings ---

    // Metrics describing the rendering viewport
    this.viewportMetrics = {
        width: 0,
        height: 0,
        xOffset: 0, // Horizontal offset of the viewport from the left edge of the screen
        yOffset: 0  // Vertical offset of the viewport from the top edge of the screen
    };
    // Derived radius for the virtual trackball, based on viewport dimensions
    this.interactionRadius = 1; // Initialized to a safe non-zero value

    // Sensitivity multipliers for different interaction types
    this.rotationFactor = 1.0;
    this.magnificationFactor = 1.2;
    this.translationFactor = 0.3;

    // Flags to selectively disable specific control types
    this.disallowRotation = false;
    this.disallowZoom = false;
    this.disallowPan = false;

    // Motion behavior: true for immediate stop, false for damped motion
    this.fixedMotion = false;
    // Damping coefficient for dynamic motion (0.0 to 1.0, 0.2 is moderate)
    this.inertiaDecay = 0.2;

    // Constraints on the controlled object's distance from the focus point
    this.minimumDistance = 0.01; // Prevents camera from entering the focus point
    this.maximumDistance = Infinity; // No upper limit by default

    // Key codes used for activating rotation, zoom, and pan modes (A, S, D)
    this.controlKeys = [ 65 /* A-key */, 83 /* S-key */, 68 /* D-key */ ];

    // --- Internal State Variables ---

    // The 3D point in space that the controlled object (e.g., camera) is oriented towards
    this.focusPoint = new RENDER_ENGINE.Vector3();

    // Stores the controlled object's position from the previous frame for change detection
    let previousObjectPosition = new RENDER_ENGINE.Vector3();

    // Track the current and immediately prior interaction modes
    let currentMode = InteractionMode.IDLE;
    let priorMode = InteractionMode.IDLE;

    // Vector representing the direction and distance from the controlled object to the focus point
    let cameraToFocusVector = new RENDER_ENGINE.Vector3();

    // Start and end 3D vectors on the virtual trackball for rotation calculations
    let startRotationVector = new RENDER_ENGINE.Vector3();
    let endRotationVector = new RENDER_ENGINE.Vector3();

    // Start and end 2D coordinates for zoom calculations (mouse/touch positions)
    let startZoomCoords = new RENDER_ENGINE.Vector2();
    let endZoomCoords = new RENDER_ENGINE.Vector2();

    // Distances for two-finger touch zoom interaction
    let initialTouchZoomDist = 0;
    let finalTouchZoomDist = 0;

    // Start and end 2D coordinates for pan calculations
    let startPanCoords = new RENDER_ENGINE.Vector2();
    let endPanCoords = new RENDER_ENGINE.Vector2();

    // --- Initial State Backup for Reset ---
    // These properties store the configuration at initialization, allowing a full reset.
    this.initialFocusPoint = this.focusPoint.clone();
    this.initialObjectPosition = this.controlledEntity.position.clone();
    this.initialObjectUp = this.controlledEntity.up.clone();

    // --- Event Dispatching Payload ---
    // Object passed with 'viewChange' events
    const updateNotification = { type: 'viewChange' };


    // --- Core Interaction Methods ---

    /**
     * Recalculates the viewport dimensions and the virtual trackball radius.
     * This method should be invoked whenever the window or canvas size changes.
     */
    this.adjustViewportDimensions = function () {
        // By default, assumes the entire window is the viewport. Can be customized.
        selfRef.viewportMetrics.width = window.innerWidth;
        selfRef.viewportMetrics.height = window.innerHeight;

        // For this implementation, offsets are assumed to be zero.
        selfRef.viewportMetrics.xOffset = 0;
        selfRef.viewportMetrics.yOffset = 0;

        // The interaction radius is derived from the smaller dimension of the viewport.
        selfRef.interactionRadius = Math.min(selfRef.viewportMetrics.width, selfRef.viewportMetrics.height) / 2;
        // Ensure the radius is never zero to prevent division errors.
        if (selfRef.interactionRadius <= 0) selfRef.interactionRadius = 1;
    };

    /**
     * A generic event processing method that delegates to specific handlers.
     * @param {Event} evt - The event object to process.
     */
    this.processEvent = function ( evt ) {
        // Immediately exit if the controller is disabled.
        if ( !selfRef.isActive ) return;

        // Construct the name of the handler function dynamically (e.g., 'handleMousedown').
        const handlerName = 'handle' + evt.type.charAt(0).toUpperCase() + evt.type.slice(1);
        // If a corresponding handler method exists, invoke it.
        if ( typeof selfRef[ handlerName ] === 'function' ) {
            selfRef[ handlerName ]( evt );
        }
    };

    /**
     * Transforms raw client screen coordinates into a normalized 2D vector.
     * The coordinates are relative to the viewport and scaled by the interaction radius.
     * @param {number} clientX - The horizontal coordinate from the event.
     * @param {number} clientY - The vertical coordinate from the event.
     * @returns {RENDER_ENGINE.Vector2} A normalized 2D vector for screen interaction.
     */
    this.getNormalizedScreenCoords = function ( clientX, clientY ) {
        const xNormalized = ( clientX - selfRef.viewportMetrics.xOffset ) / selfRef.interactionRadius * 0.75; // Adjusted multiplier
        const yNormalized = ( clientY - selfRef.viewportMetrics.yOffset ) / selfRef.interactionRadius * 0.75; // Adjusted multiplier
        return new RENDER_ENGINE.Vector2( xNormalized, yNormalized );
    };

    /**
     * Projects 2D screen coordinates onto a virtual 3D sphere (trackball).
     * This converts a mouse/touch position into a 3D vector suitable for arcball rotation.
     * @param {number} clientX - The horizontal client coordinate.
     * @param {number} clientY - The vertical client coordinate.
     * @returns {RENDER_ENGINE.Vector3} A 3D vector representing the point on the virtual sphere.
     */
    this.projectMouseOntoSphere = function ( clientX, clientY ) {
        // Calculate mouse position relative to the center of the viewport
        const viewCenterX = selfRef.viewportMetrics.width * 0.5;
        const viewCenterY = selfRef.viewportMetrics.height * 0.5;

        const mouseXRelative = ( clientX - viewCenterX - selfRef.viewportMetrics.xOffset ) / selfRef.interactionRadius;
        const mouseYRelative = ( viewCenterY + selfRef.viewportMetrics.yOffset - clientY ) / selfRef.interactionRadius; // Y-axis inverted for screen to 3D

        const mouseXY = new RENDER_ENGINE.Vector2(mouseXRelative, mouseYRelative);
        const mouseLenSq = mouseXY.lengthSq();

        let zCoord = 0.0;
        if ( mouseLenSq > 1.0 ) {
            // If outside the sphere, normalize to its edge
            mouseXY.normalize();
        } else {
            // If inside, calculate the Z component to place it on the sphere's surface
            zCoord = Math.sqrt( 1.0 - mouseLenSq );
        }

        // Construct the initial trackball vector in camera's local space
        const initialTrackballVector = new RENDER_ENGINE.Vector3( mouseXY.x, mouseXY.y, zCoord );

        // Obtain the current camera's 'forward' (eye) vector
        const currentEyeVector = cameraToFocusVector.clone().normalize();

        // Calculate the camera's 'right' vector
        const cameraRightVector = new RENDER_ENGINE.Vector3().crossVectors( selfRef.controlledEntity.up, currentEyeVector ).normalize();

        // Project the 2D trackball point into 3D space using camera's orientation
        const projectedVector = new RENDER_ENGINE.Vector3();
        projectedVector.addScaledVector( cameraRightVector, initialTrackballVector.x );
        projectedVector.addScaledVector( selfRef.controlledEntity.up, initialTrackballVector.y );
        projectedVector.addScaledVector( currentEyeVector, initialTrackballVector.z );

        return projectedVector;
    };

    /**
     * Executes the camera rotation based on the virtual trackball's start and end points.
     */
    this.performCameraRotation = function () {
        // Calculate the angle between the two rotation vectors
        const rotationAngle = startRotationVector.angleTo( endRotationVector );

        // Only apply rotation if there's a significant angle difference
        if ( rotationAngle > 0.0001 ) { // Added a small threshold for floating point stability
            // Determine the axis of rotation using the cross product
            const axisOfRotation = new RENDER_ENGINE.Vector3().crossVectors( startRotationVector, endRotationVector ).normalize();
            const rotationQuaternion = new RENDER_ENGINE.Quaternion();

            // Apply the rotation speed factor
            const effectiveAngle = rotationAngle * selfRef.rotationFactor;

            // Create a quaternion for the rotation (negative angle for intuitive mouse movement)
            rotationQuaternion.setFromAxisAngle( axisOfRotation, -effectiveAngle );

            // Apply the rotation to the camera-to-focus vector and the camera's 'up' direction
            cameraToFocusVector.applyQuaternion( rotationQuaternion );
            selfRef.controlledEntity.up.applyQuaternion( rotationQuaternion );

            // Update the end vector for continuous motion tracking
            endRotationVector.applyQuaternion( rotationQuaternion );

            // Handle static vs. dynamic motion behavior
            if ( selfRef.fixedMotion ) {
                startRotationVector.copy( endRotationVector ); // Snap to end position
            } else {
                // Apply damping for smooth deceleration
                const dampingQuaternion = new RENDER_ENGINE.Quaternion().setFromAxisAngle( axisOfRotation, effectiveAngle * ( selfRef.inertiaDecay - 1.0 ) );
                startRotationVector.applyQuaternion( dampingQuaternion );
            }
        }
    };

    /**
     * Executes the camera zoom (magnification) operation.
     */
    this.performCameraZoom = function () {
        let actualZoomFactor = 1.0;

        if ( currentMode === InteractionMode.TOUCH_MAGNIFYING ) {
            // For touch zoom, the factor is based on the ratio of touch distances
            if ( initialTouchZoomDist > 0.01 ) { // Ensure non-zero divisor
                actualZoomFactor = initialTouchZoomDist / finalTouchZoomDist;
                initialTouchZoomDist = finalTouchZoomDist; // Update for next frame's comparison
            }
        } else {
            // For mouse/wheel zoom, factor is based on Y-axis movement
            const zoomAmountY = endZoomCoords.y - startZoomCoords.y;
            actualZoomFactor = 1.0 + ( zoomAmountY * selfRef.magnificationFactor );

            // Apply damping for dynamic zoom
            if ( actualZoomFactor !== 1.0 && actualZoomFactor > 0.0 ) {
                if ( selfRef.fixedMotion ) {
                    startZoomCoords.copy( endZoomCoords );
                } else {
                    startZoomCoords.y += zoomAmountY * selfRef.inertiaDecay;
                }
            }
        }

        // Apply the calculated zoom factor to the camera-to-focus vector
        if ( actualZoomFactor !== 1.0 && actualZoomFactor > 0.0001 ) { // Check for meaningful change
             cameraToFocusVector.multiplyScalar( actualZoomFactor );
        }
    };

    /**
     * Executes the camera pan (translation) operation.
     */
    this.performCameraPan = function () {
        const panMovement = endPanCoords.clone().sub( startPanCoords );

        // Only pan if there's significant mouse movement
        if ( panMovement.lengthSq() > 0.0001 ) { // Small threshold
            // Scale pan amount based on camera distance and pan sensitivity
            const scaledPanAmount = cameraToFocusVector.length() * selfRef.translationFactor;
            panMovement.multiplyScalar( scaledPanPanAmount );

            // Calculate the 3D pan vector in world space
            const currentEyeVector = cameraToFocusVector.clone().normalize();
            const cameraRightVector = new RENDER_ENGINE.Vector3().crossVectors( currentEyeVector, selfRef.controlledEntity.up ).normalize(); // Right vector
            const worldPanVector = new RENDER_ENGINE.Vector3();
            worldPanVector.addScaledVector( cameraRightVector, panMovement.x ); // Horizontal pan
            worldPanVector.addScaledVector( selfRef.controlledEntity.up, panMovement.y ); // Vertical pan

            // Apply the pan to both the controlled object's position and its focus point
            selfRef.controlledEntity.position.add( worldPanVector );
            self.focusPoint.add( worldPanVector );

            // Handle static vs. dynamic motion
            if ( selfRef.fixedMotion ) {
                startPanCoords.copy( endPanCoords );
            } else {
                startPanCoords.add( panMovement.subVectors( endPanCoords, startPanCoords ).multiplyScalar( selfRef.inertiaDecay ) );
            }
        }
    };

    /**
     * Enforces the minimum and maximum distance constraints for the controlled object.
     * Prevents the object from getting too close or too far from its focus point.
     */
    this.enforceDistanceConstraints = function () {
        // Only apply constraints if zoom or pan is not disabled
        if ( !selfRef.disallowZoom || !selfRef.disallowPan ) {
            const currentDistanceSquared = cameraToFocusVector.lengthSq();
            const minDistanceSquared = selfRef.minimumDistance * selfRef.minimumDistance;
            const maxDistanceSquared = selfRef.maximumDistance * selfRef.maximumDistance;

            // Adjust if too far
            if ( currentDistanceSquared > maxDistanceSquared ) {
                cameraToFocusVector.setLength( selfRef.maximumDistance );
            }

            // Adjust if too close
            if ( currentDistanceSquared < minDistanceSquared ) {
                cameraToFocusVector.setLength( selfRef.minimumDistance );
            }
        }
    };

    /**
     * The primary update loop function.
     * This method should be called continuously (e.g., within a rendering loop)
     * to apply transformations and update the controlled object's state.
     */
    this.refreshState = function () {
        // Re-calculate the vector from the controlled object to its focus point
        cameraToFocusVector.subVectors( selfRef.controlledEntity.position, selfRef.focusPoint );

        // Apply enabled transformations
        if ( !selfRef.disallowRotation ) {
            selfRef.performCameraRotation();
        }

        if ( !selfRef.disallowZoom ) {
            selfRef.performCameraZoom();
        }

        if ( !selfRef.disallowPan ) {
            selfRef.performCameraPan();
        }

        // Update the controlled object's actual position based on the modified cameraToFocusVector
        selfRef.controlledEntity.position.addVectors( selfRef.focusPoint, cameraToFocusVector );

        // Apply distance limitations
        selfRef.enforceDistanceConstraints();

        // Orient the controlled object to look at the focus point
        selfRef.controlledEntity.lookAt( selfRef.focusPoint );

        // Dispatch a change event if the controlled object's position has meaningfully changed
        if ( previousObjectPosition.distanceToSquared( selfRef.controlledEntity.position ) > 0.000001 ) { // Use epsilon for float comparison
            selfRef.dispatchEvent( updateNotification );
            previousObjectPosition.copy( selfRef.controlledEntity.position );
        }
    };

    /**
     * Resets the controlled object's position, focus point, and up direction
     * to their initial states captured at the time of instantiation.
     */
    this.revertToInitial = function () {
        // Reset all interaction modes to idle
        currentMode = InteractionMode.IDLE;
        priorMode = InteractionMode.IDLE;

        // Restore the initial configuration of the controlled object
        selfRef.focusPoint.copy( selfRef.initialFocusPoint );
        selfRef.controlledEntity.position.copy( selfRef.initialObjectPosition );
        selfRef.controlledEntity.up.copy( selfRef.initialObjectUp );

        // Re-calculate the camera-to-focus vector after the reset
        cameraToFocusVector.subVectors( selfRef.controlledEntity.position, selfRef.focusPoint );

        // Ensure the controlled object is correctly oriented
        selfRef.controlledEntity.lookAt( selfRef.focusPoint );

        // Dispatch an event to signal that the view has been reset
        selfRef.dispatchEvent( updateNotification );

        // Update the previous position tracker
        previousObjectPosition.copy( selfRef.controlledEntity.position );
    };


    // --- Internal Event Handler Functions ---

    /**
     * Handles keyboard key press events to activate interaction modes.
     * @param {KeyboardEvent} evt - The keyboard event object.
     */
    function handleKeyDown( evt ) {
        if ( !selfRef.isActive ) return; // Exit if controller is inactive

        // Temporarily remove listener to prevent multiple rapid mode changes from holding a key
        window.removeEventListener( 'keydown', handleKeyDown );

        priorMode = currentMode; // Store the mode before potentially changing it

        // Only allow mode change if currently idle or if switching from another key-activated mode
        if ( currentMode !== InteractionMode.IDLE && currentMode < InteractionMode.TOUCH_ROTATING ) {
            return;
        }

        const pressedKeyCode = evt.keyCode || evt.which; // Cross-browser key code

        // Check if the pressed key matches any of the control keys
        if ( pressedKeyCode === selfRef.controlKeys[ InteractionMode.ROTATING ] && !selfRef.disallowRotation ) {
            currentMode = InteractionMode.ROTATING;
        } else if ( pressedKeyCode === selfRef.controlKeys[ InteractionMode.MAGNIFYING ] && !selfRef.disallowZoom ) {
            currentMode = InteractionMode.MAGNIFYING;
        } else if ( pressedKeyCode === selfRef.controlKeys[ InteractionMode.TRANSLATING ] && !selfRef.disallowPan ) {
            currentMode = InteractionMode.TRANSLATING;
        }
    }

    /**
     * Handles keyboard key release events, reverting the interaction mode.
     * @param {KeyboardEvent} evt - The keyboard event object.
     */
    function handleKeyUp( evt ) {
        if ( !selfRef.isActive ) return;

        // If the current mode was set by a key press, revert to idle.
        // This ensures the mode doesn't stick after key release.
        if ( currentMode === InteractionMode.ROTATING ||
             currentMode === InteractionMode.MAGNIFYING ||
             currentMode === InteractionMode.TRANSLATING ) {
            currentMode = InteractionMode.IDLE;
        } else {
            // Otherwise, revert to the prior mode if applicable.
            currentMode = priorMode;
        }

        // Re-add the keydown listener, allowing future key presses to be registered.
        window.addEventListener( 'keydown', handleKeyDown, false );
    }

    /**
     * Handles mouse button press events, initiating mouse-based interactions.
     * @param {MouseEvent} evt - The mouse event object.
     */
    function handleMouseDown( evt ) {
        if ( !selfRef.isActive ) return;

        evt.preventDefault(); // Prevent default browser actions (e.g., context menu, text selection)
        evt.stopPropagation(); // Stop event from bubbling up to parent elements

        // Determine the interaction mode based on the mouse button pressed
        if ( currentMode === InteractionMode.IDLE ) {
            if ( evt.button === 0 && !selfRef.disallowRotation ) { // Left mouse button
                currentMode = InteractionMode.ROTATING;
            } else if ( evt.button === 1 && !selfRef.disallowZoom ) { // Middle mouse button
                currentMode = InteractionMode.MAGNIFYING;
            } else if ( evt.button === 2 && !selfRef.disallowPan ) { // Right mouse button
                currentMode = InteractionMode.TRANSLATING;
            } else {
                currentMode = InteractionMode.IDLE; // No valid mode for this button or interaction disabled
            }
        }

        // Initialize start vectors/coordinates based on the activated mode
        if ( currentMode === InteractionMode.ROTATING ) {
            startRotationVector.copy( selfRef.projectMouseOntoSphere( evt.clientX, evt.clientY ) );
            endRotationVector.copy( startRotationVector );
        } else if ( currentMode === InteractionMode.MAGNIFYING ) {
            startZoomCoords.copy( selfRef.getNormalizedScreenCoords( evt.clientX, evt.clientY ) );
            endZoomCoords.copy( startZoomCoords );
        } else if ( currentMode === InteractionMode.TRANSLATING ) {
            startPanCoords.copy( selfRef.getNormalizedScreenCoords( evt.clientX, evt.clientY ) );
            endPanCoords.copy( startPanCoords );
        }

        // Attach listeners for continuous mouse movement and button release
        selfRef.eventSource.addEventListener( 'mousemove', handleMouseMove, false );
        selfRef.eventSource.addEventListener( 'mouseup', handleMouseUp, false );
    }

    /**
     * Handles mouse movement events when an interaction is active.
     * @param {MouseEvent} evt - The mouse event object.
     */
    function handleMouseMove( evt ) {
        if ( !selfRef.isActive ) return;

        // Note: preventDefault/stopPropagation are intentionally omitted here (Type III change)
        // to allow underlying elements to potentially react to mousemove if needed,
        // though typically they are included for full control.

        // Update end vectors/coordinates based on the current active interaction mode
        if ( currentMode === InteractionMode.ROTATING && !selfRef.disallowRotation ) {
            endRotationVector.copy( selfRef.projectMouseOntoSphere( evt.clientX, evt.clientY ) );
        } else if ( currentMode === InteractionMode.MAGNIFYING && !selfRef.disallowZoom ) {
            endZoomCoords.copy( selfRef.getNormalizedScreenCoords( evt.clientX, evt.clientY ) );
        } else if ( currentMode === InteractionMode.TRANSLATING && !selfRef.disallowPan ) {
            endPanCoords.copy( selfRef.getNormalizedScreenCoords( evt.clientX, evt.clientY ) );
        }
    }

    /**
     * Handles mouse button release events, concluding mouse-based interactions.
     * @param {MouseEvent} evt - The mouse event object.
     */
    function handleMouseUp( evt ) {
        if ( !selfRef.isActive ) return;

        // Note: preventDefault/stopPropagation are intentionally omitted here (Type III change)
        // as the interaction is ending.

        currentMode = InteractionMode.IDLE; // Reset interaction mode

        // Remove the temporary listeners for mouse movement and button release
        selfRef.eventSource.removeEventListener( 'mousemove', handleMouseMove );
        selfRef.eventSource.removeEventListener( 'mouseup', handleMouseUp );
    }

    /**
     * Handles mouse wheel (scroll) events for zooming functionality.
     * @param {WheelEvent} evt - The mouse wheel event object.
     */
    function handleMouseWheel( evt ) {
        if ( !selfRef.isActive || selfRef.disallowZoom ) return; // Exit if inactive or zoom disabled

        evt.preventDefault(); // Prevent page scrolling
        evt.stopPropagation(); // Stop event propagation

        let wheelDeltaAmount = 0;

        // Normalize scroll delta across different browsers
        if ( evt.wheelDelta ) { // WebKit / Opera / IE
            wheelDeltaAmount = evt.wheelDelta / 40;
        } else if ( evt.detail ) { // Firefox
            wheelDeltaAmount = - evt.detail / 3;
        }

        // Apply the scroll delta to the zoom start coordinates, influencing zoom factor
        startZoomCoords.y += wheelDeltaAmount * 0.0075; // Slightly adjusted sensitivity
    }

    /**
     * Handles touch start events, initiating multi-touch interactions.
     * @param {TouchEvent} evt - The touch event object.
     */
    function handleTouchStart( evt ) {
        if ( !selfRef.isActive ) return;

        evt.preventDefault(); // Prevent default browser touch actions (e.g., page scrolling, pinch-zoom)
        evt.stopPropagation();

        const activeTouches = evt.touches;
        const numberOfTouches = activeTouches.length;

        // Determine the interaction mode based on the number of active touches
        if ( numberOfTouches === 1 && !selfRef.disallowRotation ) {
            currentMode = InteractionMode.TOUCH_ROTATING;
            startRotationVector.copy( selfRef.projectMouseOntoSphere( activeTouches[ 0 ].pageX, activeTouches[ 0 ].pageY ) );
            endRotationVector.copy( startRotationVector );
        } else if ( numberOfTouches === 2 && !selfRef.disallowZoom ) {
            currentMode = InteractionMode.TOUCH_MAGNIFYING;
            const dx = activeTouches[ 0 ].pageX - activeTouches[ 1 ].pageX;
            const dy = activeTouches[ 0 ].pageY - activeTouches[ 1 ].pageY;
            initialTouchZoomDist = finalTouchZoomDist = Math.sqrt( dx * dx + dy * dy );
        } else if ( numberOfTouches === 3 && !selfRef.disallowPan ) {
            currentMode = InteractionMode.TOUCH_TRANSLATING;
            startPanCoords.copy( selfRef.getNormalizedScreenCoords( activeTouches[ 0 ].pageX, activeTouches[ 0 ].pageY ) );
            endPanCoords.copy( startPanCoords );
        } else {
            currentMode = InteractionMode.IDLE; // More than 3 touches or invalid state
        }
    }

    /**
     * Handles touch move events during an active multi-touch interaction.
     * @param {TouchEvent} evt - The touch event object.
     */
    function handleTouchMove( evt ) {
        if ( !selfRef.isActive ) return;

        evt.preventDefault();
        evt.stopPropagation();

        const activeTouches = evt.touches;
        const numberOfTouches = activeTouches.length;

        // Update end vectors/coordinates based on the current mode and touch count
        if ( numberOfTouches === 1 && currentMode === InteractionMode.TOUCH_ROTATING && !selfRef.disallowRotation ) {
            endRotationVector.copy( selfRef.projectMouseOntoSphere( activeTouches[ 0 ].pageX, activeTouches[ 0 ].pageY ) );
        } else if ( numberOfTouches === 2 && currentMode === InteractionMode.TOUCH_MAGNIFYING && !selfRef.disallowZoom ) {
            const dx = activeTouches[ 0 ].pageX - activeTouches[ 1 ].pageX;
            const dy = activeTouches[ 0 ].pageY - activeTouches[ 1 ].pageY;
            finalTouchZoomDist = Math.sqrt( dx * dx + dy * dy );
        } else if ( numberOfTouches === 3 && currentMode === InteractionMode.TOUCH_TRANSLATING && !selfRef.disallowPan ) {
            endPanCoords.copy( selfRef.getNormalizedScreenCoords( activeTouches[ 0 ].pageX, activeTouches[ 0 ].pageY ) );
        } else {
            // If the number of touches changes unexpectedly during a move, revert to idle or re-evaluate.
            currentMode = InteractionMode.IDLE; // Simplified handling for unexpected touch count
        }
    }

    /**
     * Handles touch end events, concluding multi-touch interactions or transitioning modes.
     * @param {TouchEvent} evt - The touch event object.
     */
    function handleTouchEnd( evt ) {
        if ( !selfRef.isActive ) return;

        // Note: preventDefault/stopPropagation are intentionally omitted here (Type III change).

        const remainingTouches = evt.touches.length;

        // Re-evaluate the interaction mode based on the number of touches remaining
        if ( remainingTouches === 0 ) {
            currentMode = InteractionMode.IDLE; // All touches lifted
        } else if ( remainingTouches === 1 && !selfRef.disallowRotation ) {
            currentMode = InteractionMode.TOUCH_ROTATING;
            // Re-initialize start vectors for the new mode with the single remaining touch
            startRotationVector.copy( selfRef.projectMouseOntoSphere( evt.touches[ 0 ].pageX, evt.touches[ 0 ].pageY ) );
            endRotationVector.copy( startRotationVector );
        } else if ( remainingTouches === 2 && !selfRef.disallowZoom ) {
            currentMode = InteractionMode.TOUCH_MAGNIFYING;
            // Re-initialize touch zoom distances
            const dx = evt.touches[ 0 ].pageX - evt.touches[ 1 ].pageX;
            const dy = evt.touches[ 0 ].pageY - evt.touches[ 1 ].pageY;
            initialTouchZoomDist = finalTouchZoomDist = Math.sqrt( dx * dx + dy * dy );
        } else {
            currentMode = InteractionMode.IDLE; // Any other number of remaining touches leads to idle
        }
    }


    // --- Event Listener Management ---

    /**
     * Attaches all required event listeners to the DOM elements.
     * This method is called during the constructor.
     */
    this.attachEventListeners = function() {
        // Prevent context menu from appearing on right-click
        selfRef.eventSource.addEventListener( 'contextmenu', ( event ) => { event.preventDefault(); }, false );

        // Mouse events
        selfRef.eventSource.addEventListener( 'mousedown', handleMouseDown, false );
        selfRef.eventSource.addEventListener( 'mousewheel', handleMouseWheel, false );
        self.eventSource.addEventListener( 'DOMMouseScroll', handleMouseWheel, false ); // For Firefox compatibility

        // Touch events
        selfRef.eventSource.addEventListener( 'touchstart', handleTouchStart, false );
        selfRef.eventSource.addEventListener( 'touchend', handleTouchEnd, false );
        selfRef.eventSource.addEventListener( 'touchmove', handleTouchMove, false );

        // Keyboard events on the window
        window.addEventListener( 'keydown', handleKeyDown, false );
        window.addEventListener( 'keyup', handleKeyUp, false );

        // Window resize event
        window.addEventListener( 'resize', selfRef.adjustViewportDimensions, false );

        // Perform an initial dimension adjustment
        selfRef.adjustViewportDimensions();
    };

    /**
     * Detaches all event listeners, cleaning up the controller and preventing memory leaks.
     * This method should be called when the controller is no longer needed.
     */
    this.detachEventListeners = function() {
        selfRef.eventSource.removeEventListener( 'contextmenu', ( event ) => { event.preventDefault(); } );

        selfRef.eventSource.removeEventListener( 'mousedown', handleMouseDown );
        selfRef.eventSource.removeEventListener( 'mousemove', handleMouseMove ); // Ensure these are removed if active
        selfRef.eventSource.removeEventListener( 'mouseup', handleMouseUp );

        selfRef.eventSource.removeEventListener( 'mousewheel', handleMouseWheel );
        selfRef.eventSource.removeEventListener( 'DOMMouseScroll', handleMouseWheel );

        selfRef.eventSource.removeEventListener( 'touchstart', handleTouchStart );
        selfRef.eventSource.removeEventListener( 'touchend', handleTouchEnd );
        selfRef.eventSource.removeEventListener( 'touchmove', handleTouchMove );

        window.removeEventListener( 'keydown', handleKeyDown );
        window.removeEventListener( 'keyup', handleKeyUp );

        window.removeEventListener( 'resize', selfRef.adjustViewportDimensions );
    };


    // --- Custom Event Dispatcher Implementation ---
    // A simplified EventDispatcher, mimicking common patterns, for internal use.
    this._listeners = {};

    /**
     * Registers an event listener for a specific event type.
     * @param {string} type - The type of event to listen for (e.g., 'viewChange').
     * @param {function} listener - The callback function to execute when the event occurs.
     */
    this.addEventListener = function( type, listener ) {
        if ( selfRef._listeners[ type ] === undefined ) {
            selfRef._listeners[ type ] = [];
        }
        if ( selfRef._listeners[ type ].indexOf( listener ) === - 1 ) {
            selfRef._listeners[ type ].push( listener );
        }
    };

    /**
     * Removes an event listener.
     * @param {string} type - The type of event.
     * @param {function} listener - The listener function to remove.
     */
    this.removeEventListener = function( type, listener ) {
        const listenerArray = selfRef._listeners[ type ];
        if ( listenerArray !== undefined ) {
            const index = listenerArray.indexOf( listener );
            if ( index !== - 1 ) {
                listenerArray.splice( index, 1 );
            }
        }
    };

    /**
     * Dispatches an event, notifying all registered listeners.
     * @param {object} event - The event object to dispatch. Must have a 'type' property.
     */
    this.dispatchEvent = function( event ) {
        const listenerArray = selfRef._listeners[ event.type ];
        if ( listenerArray !== undefined ) {
            // Add the current instance as the event target
            event.target = selfRef;
            // Create a shallow copy of the listeners array to prevent issues if listeners modify it during iteration
            const listenersToCall = listenerArray.slice( 0 );
            for ( let i = 0, l = listenersToCall.length; i < l; i ++ ) {
                listenersToCall[ i ].call( selfRef, event );
            }
        }
    };

    // --- Initialization Sequence ---

    // Attach all event listeners when the manipulator is instantiated
    this.attachEventListeners();

    // Perform an initial state refresh to ensure the controlled object is correctly positioned
    this.refreshState();
};

// --- Minimal Mock Implementations for RENDER_ENGINE Vector and Quaternion Classes ---
// These are included to make the ViewManipulator self-contained and runnable for demonstration.
// In a real application, these would be provided by a 3D rendering library.

RENDER_ENGINE.Vector3 = function(x = 0, y = 0, z = 0) {
    this.x = x; this.y = y; this.z = z;

    this.add = function(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; };
    this.sub = function(v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; };
    this.copy = function(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; };
    this.clone = function() { return new RENDER_ENGINE.Vector3(this.x, this.y, this.z); };
    this.length = function() { return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z); };
    this.lengthSq = function() { return this.x*this.x + this.y*this.y + this.z*this.z; };
    this.normalize = function() { const len = this.length(); if (len > 0) { this.x /= len; this.y /= len; this.z /= len; } return this; };
    this.multiplyScalar = function(s) { this.x *= s; this.y *= s; this.z *= s; return this; };
    this.dot = function(v) { return this.x * v.x + this.y * v.y + this.z * v.z; };
    this.crossVectors = function(a, b) {
        const ax = a.x, ay = a.y, az = a.z;
        const bx = b.x, by = b.y, bz = b.z;
        this.x = ay * bz - az * by;
        this.y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;
        return this;
    };
    this.setLength = function(l) { return this.normalize().multiplyScalar(l); };
    this.addVectors = function(a, b) { this.x = a.x + b.x; this.y = a.y + b.y; this.z = a.z + b.z; return this; };
    this.applyQuaternion = function(q) {
        const x = this.x, y = this.y, z = this.z;
        const qx = q.x, qy = q.y, qz = q.z, qw = q.w;
        // Calculate quat * vector
        const ix = qw * x + qy * z - qz * y;
        const iy = qw * y + qz * x - qx * z;
        const iz = qw * z + qx * y - qy * x;
        const iw = - qx * x - qy * y - qz * z;
        // Calculate result * inverse quat
        this.x = ix * qw + iw * (-qx) + iy * (-qz) - iz * (-qy);
        this.y = iy * qw + iw * (-qy) + iz * (-qx) - ix * (-qz);
        this.z = iz * qw + iw * (-qz) + ix * (-qy) - iy * (-qx);
        return this;
    };
    this.angleTo = function(v) {
        const denominator = Math.sqrt( this.lengthSq() * v.lengthSq() );
        if ( denominator === 0 ) return Math.PI / 2;
        const theta = this.dot( v ) / denominator;
        return Math.acos( Math.min( Math.max( theta, - 1 ), 1 ) );
    };
    this.addScaledVector = function(v, s) {
        this.x += v.x * s;
        this.y += v.y * s;
        this.z += v.z * s;
        return this;
    };
    this.distanceToSquared = function(v) {
        const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
        return dx * dx + dy * dy + dz * dz;
    };
};

RENDER_ENGINE.Vector2 = function(x = 0, y = 0) {
    this.x = x; this.y = y;

    this.copy = function(v) { this.x = v.x; this.y = v.y; return this; };
    this.clone = function() { return new RENDER_ENGINE.Vector2(this.x, this.y); };
    this.length = function() { return Math.sqrt(this.x*this.x + this.y*this.y); };
    this.lengthSq = function() { return this.x*this.x + this.y*this.y; };
    this.normalize = function() { const len = this.length(); if (len > 0) { this.x /= len; this.y /= len; } return this; };
    this.sub = function(v) { this.x -= v.x; this.y -= v.y; return this; };
    this.add = function(v) { this.x += v.x; this.y += v.y; return this; };
    this.multiplyScalar = function(s) { this.x *= s; this.y *= s; return this; };
    this.subVectors = function(a, b) { this.x = a.x - b.x; this.y = a.y - b.y; return this; };
};

RENDER_ENGINE.Quaternion = function(x = 0, y = 0, z = 0, w = 1) {
    this.x = x; this.y = y; this.z = z; this.w = w;

    this.setFromAxisAngle = function(axis, angle) {
        const halfAngle = angle / 2, s = Math.sin( halfAngle );
        this.x = axis.x * s;
        this.y = axis.y * s;
        this.z = axis.z * s;
        this.w = Math.cos( halfAngle );
        return this;
    };
};