(function(){
    const detectVendorSpecifics = () => {
        const testDiv = document.createElement('div');
        const styleProps = {
            'webkitTransform': ['-webkit-', 'Webkit'],
            'msTransform': ['-ms-', 'ms'],
            'MozTransform': ['-moz-', 'Moz'],
            'OTransform': ['-o-', 'O'],
            'transform': ['', '']
        };
        for (const prop in styleProps) {
            if (testDiv.style[prop] !== undefined) {
                return styleProps[prop];
            }
        }
        return ['', ''];
    };

    const [styleVendorTag, jsVendorTag] = detectVendorSpecifics();

    const hasTouchEvents = 'ontouchstart' in window;

    const eventOverseer = (element, kind, actionHandler, operation = 'add') => {
        const mouseEventMap = {
            'touchstart': 'mousedown',
            'touchend': 'mouseup',
            'touchmove': 'mousemove'
        };
        const actualKind = hasTouchEvents ? kind : mouseEventMap[kind] || kind;
        element[`${operation}EventListener`](actualKind, actionHandler, false);
    };

    const obtainPointerPosition = (inputEvent) => {
        if (inputEvent.type.startsWith('mouse')) {
            return [inputEvent.pageX, inputEvent.pageY];
        } else if (inputEvent.type.startsWith('touch') && inputEvent.touches.length === 1) {
            const soleTouch = inputEvent.touches[0];
            return [soleTouch.pageX, soleTouch.pageY];
        }
        return [0, 0];
    };

    const fetchElementProperty = (subjectElement, propertyKey) => {
        return window.getComputedStyle(subjectElement, null).getPropertyValue(styleVendorTag + propertyKey);
    };

    const getAbsolutePosition = (targetNode) => {
        const bounds = targetNode.getBoundingClientRect();
        return [bounds.left + window.pageXOffset, bounds.top + window.pageYOffset];
    };

    const scheduleNextFrame = (() => {
        const requestFn = window.requestAnimationFrame || window[jsVendorTag + 'RequestAnimationFrame'] || ((cb) => setTimeout(cb, 17));
        const cancelFn = window.cancelAnimationFrame || window[jsVendorTag + 'CancelAnimationFrame'] || clearTimeout;
        return { requestFn, cancelFn };
    })();
    const nextRenderCycle = scheduleNextFrame.requestFn;
    const haltAnimation = scheduleNextFrame.cancelFn;

    // --- 3D Math Utilities ---
    const normalizeVector = (vector) => {
        const magnitude = Math.sqrt(vector[0]*vector[0] + vector[1]*vector[1] + vector[2]*vector[2]);
        if (magnitude === 0) return [0, 0, 0];
        return [vector[0] / magnitude, vector[1] / magnitude, vector[2] / magnitude];
    };

    const dotProduct = (vA, vB) => {
        return vA[0]*vB[0] + vA[1]*vB[1] + vA[2]*vB[2];
    };

    const crossProduct = (vA, vB) => {
        return [
            vA[1]*vB[2] - vA[2]*vB[1],
            vA[2]*vB[0] - vA[0]*vB[2],
            vA[0]*vB[1] - vA[1]*vB[0]
        ];
    };

    const determineAngularDifference = (vA, vB) => {
        const numerator = dotProduct(vA, vB);
        const denominator = Math.sqrt(dotProduct(vA, vA)) * Math.sqrt(dotProduct(vB, vB));
        let ratio = numerator / denominator;
        if (ratio > 1) ratio = 1;
        if (ratio < -1) ratio = -1;
        return Math.acos(ratio);
    };

    const formTransformationMatrix = (rotationalAxis, radians) => {
        const x = rotationalAxis[0], y = rotationalAxis[1], z = rotationalAxis[2];
        const s = Math.sin(radians), c = Math.cos(radians), c_minus_1 = 1 - c;
        return [
            (c + x*x*c_minus_1), (y*x*c_minus_1 + z*s), (z*x*c_minus_1 - y*s), 0,
            (x*y*c_minus_1 - z*s), (c + y*y*c_minus_1), (z*y*c_minus_1 + x*s), 0,
            (x*z*c_minus_1 + y*s), (y*z*c_minus_1 - x*s), (c + z*z*c_minus_1), 0,
            0, 0, 0, 1
        ];
    };

    const mergeTransformationMatrices = (matrixA, matrixB) => {
        const result = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let sum = 0;
                for (let k = 0; k < 4; k++) {
                    sum += matrixA[i * 4 + k] * matrixB[k * 4 + j];
                }
                result[i * 4 + j] = sum;
            }
        }
        return result;
    };

    const parseCssMatrix = (cssMatrixString) => {
        let values = [];
        if (cssMatrixString.startsWith('matrix3d(')) {
            values = cssMatrixString.substring(9, cssMatrixString.length - 1).split(',').map(parseFloat);
        } else if (cssMatrixString.startsWith('matrix(')) {
            const tempValues = cssMatrixString.substring(7, cssMatrixString.length - 1).split(',').map(parseFloat);
            values = [
                tempValues[0], tempValues[1], 0, 0,
                tempValues[2], tempValues[3], 0, 0,
                0, 0, 1, 0,
                tempValues[4], tempValues[5], 0, 1
            ];
        } else {
            values = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        }
        return values;
    };

    // --- Main Rotator Factory ---
    const createSpatialRotator = (initialParams) => {
        let currentSettings = {};
        let subjectNode = null;
        let viewportNode = null;
        let sphereDimension = 0;
        let viewportOffset = [0, 0];
        let orientationAxis = [0, 0, 0];
        let currentRotationAngle = 0;
        let baseTransformMatrix = [];
        let priorInteractionVector = [0, 0, 0];
        let ongoingInteractionVector = [0, 0, 0];
        let angularMomentum = 0;
        let previousTimestamp = 0;
        let angleBeforeDrag = 0;
        let animationProcessId = null;

        const computeOrbVector = (screenPosition) => {
            const xComponent = currentSettings.restrictAxis === "x" ? sphereDimension : screenPosition[0] - viewportOffset[0];
            const yComponent = currentSettings.restrictAxis === "y" ? sphereDimension : screenPosition[1] - viewportOffset[1];
            const normalizedX = (xComponent / sphereDimension) - 1;
            const normalizedY = (yComponent / sphereDimension) - 1;
            const zSquared = 1 - normalizedX * normalizedX - normalizedY * normalizedY;
            const zComponent = zSquared > 0 ? Math.sqrt(zSquared) : 0;
            return [normalizedX, normalizedY, zComponent];
        };

        const applyCurrentTransform = () => {
            subjectNode.style[jsVendorTag + 'Transform'] = `rotate3d(${orientationAxis.join(',')},${currentRotationAngle}rad) matrix3d(${baseTransformMatrix.join(',')})`;
        };

        const beginSpin = (evt) => {
            if (angularMomentum !== 0) {
                haltAnimation(animationProcessId);
                angularMomentum = 0;
            }
            evt.preventDefault();
            priorInteractionVector = computeOrbVector(obtainPointerPosition(evt));
            previousTimestamp = new Date().getTime();
            angleBeforeDrag = currentRotationAngle;

            eventOverseer(subjectNode, 'touchstart', beginSpin, 'remove');
            eventOverseer(document, 'touchmove', processRotation);
            eventOverseer(document, 'touchend', finalizeSpin);
        };

        const processRotation = (evt) => {
            const coords = obtainPointerPosition(evt);
            evt.preventDefault();

            previousTimestamp = new Date().getTime();
            angleBeforeDrag = currentRotationAngle;

            ongoingInteractionVector = computeOrbVector(coords);

            orientationAxis = crossProduct(priorInteractionVector, ongoingInteractionVector);
            orientationAxis = normalizeVector(orientationAxis);

            currentRotationAngle = determineAngularDifference(priorInteractionVector, ongoingInteractionVector);

            applyCurrentTransform();
        };

        const finalizeSpin = () => {
            eventOverseer(document, 'touchmove', processRotation, 'remove');
            eventOverseer(document, 'touchend', finalizeSpin, 'remove');
            eventOverseer(subjectNode, 'touchstart', beginSpin);

            const timeElapsed = new Date().getTime() - previousTimestamp;
            const angleChange = currentRotationAngle - angleBeforeDrag;
            angularMomentum = Math.abs((angleChange * 17) / timeElapsed);

            if (isNaN(angularMomentum)) {
                angularMomentum = 0;
            } else if (angularMomentum > 0.2) {
                angularMomentum = 0.2;
            }

            if (currentSettings.momentumEnabled && angularMomentum > 0) {
                animationProcessId = nextRenderCycle(animateDeceleration);
            } else {
                consolidateState();
            }
        };

        const animateDeceleration = () => {
            currentRotationAngle += angularMomentum;
            const decayRate = 0.01 * Math.sqrt(angularMomentum);
            angularMomentum = angularMomentum > 0 ? angularMomentum - decayRate : 0;

            applyCurrentTransform();

            if (angularMomentum <= 0) {
                consolidateState();
            } else {
                animationProcessId = nextRenderCycle(animateDeceleration);
            }
        };

        const consolidateState = () => {
            haltAnimation(animationProcessId);
            const rotationUpdateMatrix = formTransformationMatrix(orientationAxis, currentRotationAngle);
            baseTransformMatrix = mergeTransformationMatrices(baseTransformMatrix, rotationUpdateMatrix);
            currentRotationAngle = 0;
            angularMomentum = 0;
            subjectNode.style[jsVendorTag + 'Transform'] = `matrix3d(${baseTransformMatrix.join(',')})`;
        };

        const configureProcessor = (params) => {
            deactivateManipulator();

            currentSettings = { ...currentSettings, ...params };

            viewportNode = document.getElementById(currentSettings.displayAreaId) || document.body;
            viewportOffset = getAbsolutePosition(viewportNode);

            const halfHeight = viewportNode.offsetHeight / 2;
            const halfWidth = viewportNode.offsetWidth / 2;
            sphereDimension = Math.min(halfHeight, halfWidth);

            for (const child of viewportNode.children) {
                if (child.nodeType === 1) {
                    subjectNode = child;
                    break;
                }
            }

            orientationAxis = currentSettings.initialAxis || [0, 1, 0];
            currentRotationAngle = currentSettings.initialAngle || 0;
            currentSettings.momentumEnabled = currentSettings.momentumEnabled === false ? false : true;

            const existingTransform = fetchElementProperty(subjectNode, 'transform');
            if (currentSettings.initialAxis || currentSettings.initialAngle !== undefined) {
                orientationAxis = normalizeVector(currentSettings.initialAxis || [1, 0, 0]);
                baseTransformMatrix = formTransformationMatrix(orientationAxis, currentSettings.initialAngle || 0);
            } else if (existingTransform !== 'none') {
                baseTransformMatrix = parseCssMatrix(existingTransform);
            } else {
                baseTransformMatrix = formTransformationMatrix([0, 1, 0], 0);
            }

            if (currentSettings.viewPerspective) {
                viewportNode.style[jsVendorTag + 'Perspective'] = currentSettings.viewPerspective;
            } else if (fetchElementProperty(viewportNode, 'perspective') === 'none') {
                viewportNode.style[jsVendorTag + 'Perspective'] = '700px';
            }

            if (currentSettings.viewOrigin) {
                viewportNode.style[jsVendorTag + 'PerspectiveOrigin'] = currentSettings.viewOrigin;
            }

            subjectNode.style[jsVendorTag + 'Transform'] = `matrix3d(${baseTransformMatrix.join(',')})`;

            eventOverseer(subjectNode, 'touchstart', beginSpin);
        };

        const deactivateManipulator = () => {
             if (subjectNode) {
                eventOverseer(subjectNode, 'touchstart', beginSpin, 'remove');
             }
             eventOverseer(document, 'touchmove', processRotation, 'remove');
             eventOverseer(document, 'touchend', finalizeSpin, 'remove');
             haltAnimation(animationProcessId);
             animationProcessId = null;
        };

        const enableManipulator = () => {
             deactivateManipulator();
             if (subjectNode) {
                eventOverseer(subjectNode, 'touchstart', beginSpin);
             }
        };

        configureProcessor(initialParams);

        return {
            disableRotation: deactivateManipulator,
            enableRotation: enableManipulator,
            reconfigure: configureProcessor
        };
    };

    window.ElementOrbiter = createSpatialRotator;
})();