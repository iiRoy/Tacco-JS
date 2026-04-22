var THREE_EXTENSIONS = THREE_EXTENSIONS || {};

THREE_EXTENSIONS.OrbitalManipulator = function ( visualObject, surfaceElement ) {

    const eventSystem = (function() {
        const _listeners = new Map();
        return {
            addListener: function(type, listener) {
                if (!_listeners.has(type)) {
                    _listeners.set(type, new Set());
                }
                _listeners.get(type).add(listener);
            },
            removeListener: function(type, listener) {
                if (_listeners.has(type)) {
                    _listeners.get(type).delete(listener);
                }
            },
            triggerEvent: function(event) {
                if (_listeners.has(event.type)) {
                    _listeners.get(event.type).forEach(listener => listener(event));
                }
            }
        };
    })();

    const InteractionStatus = new Map([
        ["NONE_ACTIVE", -1],
        ["SPIN_MODE", 0],
        ["MAGNIFY_MODE", 1],
        ["SHIFT_MODE", 2],
        ["TOUCH_SPIN", 3],
        ["TOUCH_MAGNIFY", 4],
        ["TOUCH_SHIFT", 5]
    ]);

    let internalState = {
        enabled: true,
        viewportMetrics: { width: 0, height: 0, xOffset: 0, yOffset: 0 },
        interactionSphereRadius: 0,
        spinFactor: 1.0,
        magnificationFactor: 1.2,
        shiftFactor: 0.3,
        disableSpin: false,
        disableMagnify: false,
        disableShift: false,
        fixedMotion: false,
        momentumDecay: 0.2,
        closestApproach: 0,
        furthestRetreat: Infinity,
        keyBindings: new Map([
            [65, InteractionStatus.get("SPIN_MODE")],
            [83, InteractionStatus.get("MAGNIFY_MODE")],
            [68, InteractionStatus.get("SHIFT_MODE")]
        ]),

        focusPoint: new THREE.Vector3(),
        previousLocation: new THREE.Vector3(),

        currentMode: InteractionStatus.get("NONE_ACTIVE"),
        priorMode: InteractionStatus.get("NONE_ACTIVE"),

        viewVector: new THREE.Vector3(),

        spinAnchor: new THREE.Vector3(),
        spinCurrent: new THREE.Vector3(),

        magnifyAnchor: new THREE.Vector2(),
        magnifyCurrent: new THREE.Vector2(),

        pinchStartDistance: 0,
        pinchEndDistance: 0,

        shiftAnchor: new THREE.Vector2(),
        shiftCurrent: new THREE.Vector2(),

        initialFocus: null,
        initialPosition: null,
        initialUp: null,

        controlledObject: visualObject,
        inputSurface: surfaceElement || document,

        boundHandlers: {},

        getCurrentEye: () => internalState.controlledObject.position.clone().sub(internalState.focusPoint)
    };

    internalState.initialFocus = internalState.focusPoint.clone();
    internalState.initialPosition = internalState.controlledObject.position.clone();
    internalState.initialUp = internalState.controlledObject.up.clone();

    const mapPointerToNormalizedPlane = ( clientX, clientY ) => {
        return new THREE.Vector2(
            ( clientX - internalState.viewportMetrics.xOffset ) / internalState.interactionSphereRadius * 0.5,
            ( clientY - internalState.viewportMetrics.yOffset ) / internalState.interactionSphereRadius * 0.5
        );
    };

    const projectPointerToSphere = ( clientX, clientY ) => {
        const pointerOnSphere = new THREE.Vector3(
            ( clientX - internalState.viewportMetrics.width * 0.5 - internalState.viewportMetrics.xOffset ) / internalState.interactionSphereRadius,
            ( internalState.viewportMetrics.height * 0.5 + internalState.viewportMetrics.yOffset - clientY ) / internalState.interactionSphereRadius,
            0.0
        );

        const sphereLength = pointerOnSphere.length();

        if ( sphereLength > 1.0 ) {
            pointerOnSphere.normalize();
        } else {
            pointerOnSphere.z = Math.sqrt( 1.0 - sphereLength * sphereLength );
        }

        const currentView = internalState.getCurrentEye();
        const upVector = internalState.controlledObject.up.clone();

        const projectionVector = upVector.clone().setLength( pointerOnSphere.y );
        projectionVector.add( upVector.clone().cross( currentView ).setLength( pointerOnSphere.x ) );
        projectionVector.add( currentView.setLength( pointerOnSphere.z ) );

        return projectionVector;
    };

    const performRotation = () => {
        const angleValue = Math.acos( internalState.spinAnchor.dot( internalState.spinCurrent ) / internalState.spinAnchor.length() / internalState.spinCurrent.length() );

        if ( angleValue ) {
            const rotationAxis = ( new THREE.Vector3() ).crossVectors( internalState.spinAnchor, internalState.spinCurrent ).normalize();
            const rotationQuaternion = new THREE.Quaternion();

            const adjustedAngle = angleValue * internalState.spinFactor;

            rotationQuaternion.setFromAxisAngle( rotationAxis, -adjustedAngle );

            internalState.viewVector.applyQuaternion( rotationQuaternion );
            internalState.controlledObject.up.applyQuaternion( rotationQuaternion );

            internalState.spinCurrent.applyQuaternion( rotationQuaternion );

            if ( internalState.fixedMotion ) {
                internalState.spinAnchor.copy( internalState.spinCurrent );
            } else {
                rotationQuaternion.setFromAxisAngle( rotationAxis, adjustedAngle * ( internalState.momentumDecay - 1.0 ) );
                internalState.spinAnchor.applyQuaternion( rotationQuaternion );
            }
        }
    };

    const performMagnification = () => {
        let scalingFactor;

        if ( internalState.currentMode === InteractionStatus.get("TOUCH_MAGNIFY") ) {
            scalingFactor = internalState.pinchStartDistance / internalState.pinchEndDistance;
            internalState.pinchStartDistance = internalState.pinchEndDistance;
            internalState.viewVector.multiplyScalar( scalingFactor );
        } else {
            scalingFactor = 1.0 + ( internalState.magnifyCurrent.y - internalState.magnifyAnchor.y ) * internalState.magnificationFactor;

            if ( scalingFactor !== 1.0 && scalingFactor > 0.0 ) {
                internalState.viewVector.multiplyScalar( scalingFactor );

                if ( internalState.fixedMotion ) {
                    internalState.magnifyAnchor.copy( internalState.magnifyCurrent );
                } else {
                    internalState.magnifyAnchor.y += ( internalState.magnifyCurrent.y - internalState.magnifyAnchor.y ) * internalState.momentumDecay;
                }
            }
        }
    };

    const performShift = () => {
        const pointerDelta = internalState.shiftCurrent.clone().sub( internalState.shiftAnchor );

        if ( pointerDelta.lengthSq() ) {
            pointerDelta.multiplyScalar( internalState.viewVector.length() * internalState.shiftFactor );

            const panMovement = internalState.viewVector.clone().cross( internalState.controlledObject.up ).setLength( pointerDelta.x );
            panMovement.add( internalState.controlledObject.up.clone().setLength( pointerDelta.y ) );

            internalState.controlledObject.position.add( panMovement );
            internalState.focusPoint.add( panMovement );

            if ( internalState.fixedMotion ) {
                internalState.shiftAnchor.copy( internalState.shiftCurrent );
            } else {
                internalState.shiftAnchor.add( pointerDelta.subVectors( internalState.shiftCurrent, internalState.shiftAnchor ).multiplyScalar( internalState.momentumDecay ) );
            }
        }
    };

    const constrainDistance = () => {
        if ( !internalState.disableMagnify || !internalState.disableShift ) {
            if ( internalState.controlledObject.position.lengthSq() > internalState.furthestRetreat * internalState.furthestRetreat ) {
                internalState.controlledObject.position.setLength( internalState.furthestRetreat );
            }

            if ( internalState.viewVector.lengthSq() < internalState.closestApproach * internalState.closestApproach ) {
                internalState.controlledObject.position.addVectors( internalState.focusPoint, internalState.viewVector.setLength( internalState.closestApproach ) );
            }
        }
    };

    const handleKeyPress = ( event ) => {
        if ( internalState.enabled === false ) return;

        window.removeEventListener( 'keydown', internalState.boundHandlers.keydown );

        internalState.priorMode = internalState.currentMode;

        if ( internalState.currentMode !== InteractionStatus.get("NONE_ACTIVE") ) {
            return;
        }

        const modeFromKey = internalState.keyBindings.get(event.keyCode);
        if (modeFromKey !== undefined) {
            if (modeFromKey === InteractionStatus.get("SPIN_MODE") && !internalState.disableSpin) {
                internalState.currentMode = InteractionStatus.get("SPIN_MODE");
            } else if (modeFromKey === InteractionStatus.get("MAGNIFY_MODE") && !internalState.disableMagnify) {
                internalState.currentMode = InteractionStatus.get("MAGNIFY_MODE");
            } else if (modeFromKey === InteractionStatus.get("SHIFT_MODE") && !internalState.disableShift) {
                internalState.currentMode = InteractionStatus.get("SHIFT_MODE");
            }
        }
    };

    const handleKeyRelease = ( event ) => {
        if ( internalState.enabled === false ) return;

        internalState.currentMode = internalState.priorMode;

        window.addEventListener( 'keydown', internalState.boundHandlers.keydown, false );
    };

    const handlePointerDown = ( event ) => {
        if ( internalState.enabled === false ) return;

        event.preventDefault();
        event.stopPropagation();

        if ( internalState.currentMode === InteractionStatus.get("NONE_ACTIVE") ) {
            internalState.currentMode = event.button;
        }

        if ( internalState.currentMode === InteractionStatus.get("SPIN_MODE") && !internalState.disableSpin ) {
            internalState.spinAnchor = internalState.spinCurrent = projectPointerToSphere( event.clientX, event.clientY );
        } else if ( internalState.currentMode === InteractionStatus.get("MAGNIFY_MODE") && !internalState.disableMagnify ) {
            internalState.magnifyAnchor = internalState.magnifyCurrent = mapPointerToNormalizedPlane( event.clientX, event.clientY );
        } else if ( internalState.currentMode === InteractionStatus.get("SHIFT_MODE") && !internalState.disableShift ) {
            internalState.shiftAnchor = internalState.shiftCurrent = mapPointerToNormalizedPlane( event.clientX, event.clientY );
        }

        document.addEventListener( 'mousemove', internalState.boundHandlers.mousemove, false );
        document.addEventListener( 'mouseup', internalState.boundHandlers.mouseup, false );
    };

    const handlePointerMove = ( event ) => {
        if ( internalState.enabled === false ) return;

        event.preventDefault();
        event.stopPropagation();

        if ( internalState.currentMode === InteractionStatus.get("SPIN_MODE") && !internalState.disableSpin ) {
            internalState.spinCurrent = projectPointerToSphere( event.clientX, event.clientY );
        } else if ( internalState.currentMode === InteractionStatus.get("MAGNIFY_MODE") && !internalState.disableMagnify ) {
            internalState.magnifyCurrent = mapPointerToNormalizedPlane( event.clientX, event.clientY );
        } else if ( internalState.currentMode === InteractionStatus.get("SHIFT_MODE") && !internalState.disableShift ) {
            internalState.shiftCurrent = mapPointerToNormalizedPlane( event.clientX, event.clientY );
        }
    };

    const handlePointerUp = ( event ) => {
        if ( internalState.enabled === false ) return;

        event.preventDefault();
        event.stopPropagation();

        internalState.currentMode = InteractionStatus.get("NONE_ACTIVE");

        document.removeEventListener( 'mousemove', internalState.boundHandlers.mousemove );
        document.removeEventListener( 'mouseup', internalState.boundHandlers.mouseup );
    };

    const handleWheelScroll = ( event ) => {
        if ( internalState.enabled === false ) return;

        event.preventDefault();
        event.stopPropagation();

        let scrollDelta = 0;

        if ( event.wheelDelta ) {
            scrollDelta = event.wheelDelta / 40;
        } else if ( event.detail ) {
            scrollDelta = - event.detail / 3;
        }

        internalState.magnifyAnchor.y += scrollDelta * 0.01;
    };

    const handleTouchStart = ( event ) => {
        if ( internalState.enabled === false ) return;

        const touchCount = event.touches.length;

        switch ( touchCount ) {
            case 1:
                internalState.currentMode = InteractionStatus.get("TOUCH_SPIN");
                internalState.spinAnchor = internalState.spinCurrent = projectPointerToSphere( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                break;
            case 2:
                internalState.currentMode = InteractionStatus.get("TOUCH_MAGNIFY");
                const dx2 = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                const dy2 = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                internalState.pinchEndDistance = internalState.pinchStartDistance = Math.sqrt( dx2 * dx2 + dy2 * dy2 );
                break;
            case 3:
                internalState.currentMode = InteractionStatus.get("TOUCH_SHIFT");
                internalState.shiftAnchor = internalState.shiftCurrent = mapPointerToNormalizedPlane( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                break;
            default:
                internalState.currentMode = InteractionStatus.get("NONE_ACTIVE");
        }
    };

    const handleTouchMove = ( event ) => {
        if ( internalState.enabled === false ) return;

        event.preventDefault();
        event.stopPropagation();

        const touchCount = event.touches.length;

        switch ( touchCount ) {
            case 1:
                internalState.spinCurrent = projectPointerToSphere( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                break;
            case 2:
                const dx2 = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                const dy2 = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                internalState.pinchEndDistance = Math.sqrt( dx2 * dx2 + dy2 * dy2 )
                break;
            case 3:
                internalState.shiftCurrent = mapPointerToNormalizedPlane( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                break;
            default:
                internalState.currentMode = InteractionStatus.get("NONE_ACTIVE");
        }
    };

    const handleTouchEnd = ( event ) => {
        if ( internalState.enabled === false ) return;
        switch ( event.touches.length ) {
        }
    };

    const publicInterface = {
        get accessEnabled() { return internalState.enabled; },
        set accessEnabled(value) { internalState.enabled = value; },

        get viewMetrics() { return internalState.viewportMetrics; },

        get rotationSpeed() { return internalState.spinFactor; },
        set rotationSpeed(value) { internalState.spinFactor = value; },

        get zoomVelocity() { return internalState.magnificationFactor; },
        set zoomVelocity(value) { internalState.magnificationFactor = value; },

        get panVelocity() { return internalState.shiftFactor; },
        set panVelocity(value) { internalState.shiftFactor = value; },

        get forbidRotation() { return internalState.disableSpin; },
        set forbidRotation(value) { internalState.disableSpin = value; },

        get forbidZoom() { return internalState.disableMagnify; },
        set forbidZoom(value) { internalState.disableMagnify = value; },

        get forbidPan() { return internalState.disableShift; },
        set forbidPan(value) { internalState.disableShift = value; },

        get useFixedMotion() { return internalState.fixedMotion; },
        set useFixedMotion(value) { internalState.fixedMotion = value; },

        get dynamicDamping() { return internalState.momentumDecay; },
        set dynamicDamping(value) { internalState.momentumDecay = value; },

        get minimumDistance() { return internalState.closestApproach; },
        set minimumDistance(value) { internalState.closestApproach = value; },

        get maximumDistance() { return internalState.furthestRetreat; },
        set maximumDistance(value) { internalState.furthestRetreat = value; },

        get actionKeys() { return internalState.keyBindings; },
        set actionKeys(value) { internalState.keyBindings = value; },

        adjustDimensions: () => {
            internalState.viewportMetrics.width = window.innerWidth;
            internalState.viewportMetrics.height = window.innerHeight;
            internalState.viewportMetrics.xOffset = 0;
            internalState.viewportMetrics.yOffset = 0;
            internalState.interactionSphereRadius = ( internalState.viewportMetrics.width + internalState.viewportMetrics.height ) / 4;
        },

        refreshView: () => {
            internalState.viewVector.subVectors( internalState.controlledObject.position, internalState.focusPoint );

            if ( !internalState.disableSpin ) {
                performRotation();
            }

            if ( !internalState.disableMagnify ) {
                performMagnification();
            }

            if ( !internalState.disableShift ) {
                performShift();
            }

            internalState.controlledObject.position.addVectors( internalState.focusPoint, internalState.viewVector );

            constrainDistance();

            internalState.controlledObject.lookAt( internalState.focusPoint );

            if ( internalState.previousLocation.distanceToSquared( internalState.controlledObject.position ) > 0 ) {
                eventSystem.triggerEvent( { type: 'change' } );
                internalState.previousLocation.copy( internalState.controlledObject.position );
            }
        },

        revertToInitial: () => {
            internalState.currentMode = InteractionStatus.get("NONE_ACTIVE");
            internalState.priorMode = InteractionStatus.get("NONE_ACTIVE");

            internalState.focusPoint.copy( internalState.initialFocus );
            internalState.controlledObject.position.copy( internalState.initialPosition );
            internalState.controlledObject.up.copy( internalState.initialUp );

            internalState.viewVector.subVectors( internalState.controlledObject.position, internalState.focusPoint );

            internalState.controlledObject.lookAt( internalState.focusPoint );

            eventSystem.triggerEvent( { type: 'change' } );
            internalState.previousLocation.copy( internalState.controlledObject.position );
        },

        activateMonitoring: () => {
            const globalSurface = internalState.inputSurface === document ? window : internalState.inputSurface;
            const localSurface = internalState.inputSurface;

            internalState.boundHandlers.keydown = handleKeyPress;
            internalState.boundHandlers.keyup = handleKeyRelease;
            internalState.boundHandlers.mousedown = handlePointerDown;
            internalState.boundHandlers.mousemove = handlePointerMove;
            internalState.boundHandlers.mouseup = handlePointerUp;
            internalState.boundHandlers.mousewheel = handleWheelScroll;
            internalState.boundHandlers.touchstart = handleTouchStart;
            internalState.boundHandlers.touchmove = handleTouchMove;
            internalState.boundHandlers.touchend = handleTouchEnd;
            internalState.boundHandlers.resize = publicInterface.adjustDimensions;

            globalSurface.addEventListener( 'keydown', internalState.boundHandlers.keydown, false );
            globalSurface.addEventListener( 'keyup', internalState.boundHandlers.keyup, false );
            localSurface.addEventListener( 'mousedown', internalState.boundHandlers.mousedown, false );
            localSurface.addEventListener( 'mousewheel', internalState.boundHandlers.mousewheel, false );
            localSurface.addEventListener( 'DOMMouseScroll', internalState.boundHandlers.mousewheel, false );
            localSurface.addEventListener( 'touchstart', internalState.boundHandlers.touchstart, false );
            localSurface.addEventListener( 'touchmove', internalState.boundHandlers.touchmove, false );
            localSurface.addEventListener( 'touchend', internalState.boundHandlers.touchend, false );
            window.addEventListener( 'resize', internalState.boundHandlers.resize, false );

            publicInterface.adjustDimensions();
        },

        deactivateMonitoring: () => {
            const globalSurface = internalState.inputSurface === document ? window : internalState.inputSurface;
            const localSurface = internalState.inputSurface;

            globalSurface.removeEventListener( 'keydown', internalState.boundHandlers.keydown );
            globalSurface.removeEventListener( 'keyup', internalState.boundHandlers.keyup );
            localSurface.removeEventListener( 'mousedown', internalState.boundHandlers.mousedown );
            localSurface.removeEventListener( 'mousewheel', internalState.boundHandlers.mousewheel );
            localSurface.removeEventListener( 'DOMMouseScroll', internalState.boundHandlers.mousewheel );
            localSurface.removeEventListener( 'touchstart', internalState.boundHandlers.touchstart );
            localSurface.removeEventListener( 'touchmove', internalState.boundHandlers.touchmove );
            localSurface.removeEventListener( 'touchend', internalState.boundHandlers.touchend );
            window.removeEventListener( 'resize', internalState.boundHandlers.resize );

            document.removeEventListener( 'mousemove', internalState.boundHandlers.mousemove );
            document.removeEventListener( 'mouseup', internalState.boundHandlers.mouseup );
        },

        addEventListener: eventSystem.addListener,
        removeEventListener: eventSystem.removeListener,
        dispatchEvent: eventSystem.triggerEvent
    };

    publicInterface.activateMonitoring();
    publicInterface.adjustDimensions();

    return publicInterface;
};