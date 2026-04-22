(function(){
    // This module provides a 3D orbital control system for HTML elements.
    // Based on the original Traqball library by Dirk Weber.
    // Enhanced and refactored for modern JavaScript practices.

    "use strict"; // Enforce stricter parsing and error handling

    // Internal variables for environment detection and animation frame management
    const browserAgentString    = navigator.userAgent.toLowerCase();
    const hasTouchCapabilities  = "ontouchstart" in window;
    let vendorPrefixCSS         = "";
    let vendorPrefixDOM         = "";
    let requestAnimationFrameFn;
    let cancelAnimationFrameFn;

    // Determine appropriate vendor prefixes for CSS properties and DOM methods
    // Using a more structured approach than sequential if/else
    const prefixMap = {
        webkit: { css: "-webkit-", dom: "Webkit" },
        msie:   { css: "-ms-",     dom: "ms" },
        trident: { css: "-ms-",    dom: "ms" }, // IE11
        mozilla: { css: "-moz-",    dom: "Moz" },
        opera:  { css: "-o-",      dom: "O" }
    };

    for (const key in prefixMap) {
        if (browserAgentString.includes(key)) {
            vendorPrefixCSS = prefixMap[key].css;
            vendorPrefixDOM = prefixMap[key].dom;
            break;
        }
    }

    /**
     * Manages event listeners on a DOM element.
     * Translates touch events to mouse events if touch is not supported.
     * @param {Element} targetElement - The DOM element to attach/detach the event.
     * @param {string} eventName - The base event name (e.g., 'touchstart', 'mousemove').
     * @param {Function} eventHandler - The callback function for the event.
     * @param {boolean} [shouldRemove=false] - If true, removes the event listener.
     */
    function manageInteractionBinding(targetElement, eventName, eventHandler, shouldRemove = false){
        // Map touch events to mouse events for non-touch devices
        const mouseEventAlternatives = {
            "touchstart": "mousedown",
            "touchend":   "mouseup",
            "touchmove":  "mousemove"
        };
        const actualEventType = hasTouchCapabilities ? eventName : mouseEventAlternatives[eventName] || eventName;

        const action = shouldRemove ? "removeEventListener" : "addEventListener";
        targetElement[action](actualEventType, eventHandler, false);
    }

    /**
     * Extracts X and Y coordinates from a mouse or touch event.
     * @param {Event} eventObject - The DOM event object.
     * @returns {number[]} An array [x, y] of coordinates, or [0, 0] if invalid.
     */
    function extractEventCoordinates(eventObject){
        let coordX = 0;
        let coordY = 0;

        const eventType = eventObject.type;

        if (eventType.startsWith("mouse")) {
            coordX = eventObject.pageX;
            coordY = eventObject.pageY;
        } else if (eventType.startsWith("touch")) {
            // Only process if a single finger is used for interaction
            if (eventObject.touches && eventObject.touches.length === 1) {
                const touchPoint = eventObject.touches[0];
                coordX = touchPoint.pageX;
                coordY = touchPoint.pageY;
            } else {
                // If not a single touch, return default or throw error
                return [0, 0];
            }
        } else {
            console.warn("Unsupported event type for coordinate extraction:", eventType);
            return [0, 0];
        }

        return [coordX, coordY];
    }

    /**
     * Retrieves a computed CSS style property for a given element.
     * @param {Element} targetElement - The DOM element.
     * @param {string} propertyName - The CSS property name (e.g., 'perspective').
     * @returns {string} The computed style value.
     */
    function getElementComputedStyle(targetElement, propertyName){
        const computedStyle = window.getComputedStyle(targetElement);
        return computedStyle.getPropertyValue(propertyName);
    }

    // Polyfill for requestAnimationFrame and cancelAnimationFrame
    requestAnimationFrameFn = window[`${vendorPrefixDOM}RequestAnimationFrame`] ||
                              function(callback){
                                  return window.setTimeout(callback, 1000 / 60); // ~60 FPS
                              };

    cancelAnimationFrameFn = window[`${vendorPrefixDOM}CancelAnimationFrame`] ||
                             window[`${vendorPrefixDOM}CancelRequestAnimationFrame`] ||
                             clearTimeout;

    /**
     * Represents a 3D orbital controller for a DOM element.
     * @class OrbitalControl
     */
    const OrbitalControl = function(initialSettings){
        this.configuration = {};
        this.controlledElement = null; // The DOM element to be rotated

        this.configureSystem(initialSettings);
    };

    Object.freeze(OrbitalControl.prototype); // Prevent prototype modification

    /**
     * Disables the orbital control by removing all event listeners.
     */
    OrbitalControl.prototype.deactivate = function(){
        if (!this.controlledElement) return; // Guard clause

        const handlers = this.interactionHandlers;
        manageInteractionBinding(this.controlledElement, 'touchstart', handlers[0], true);
        manageInteractionBinding(document, 'touchmove', handlers[1], true);
        manageInteractionBinding(document, 'touchend', handlers[2], true);
    };

    /**
     * Activates the orbital control by adding necessary event listeners.
     */
    OrbitalControl.prototype.enable = function(){
        if (!this.controlledElement) {
            console.warn("Cannot enable OrbitalControl: no controlled element found.");
            return;
        }

        const handlers = this.interactionHandlers;
        manageInteractionBinding(this.controlledElement, 'touchstart', handlers[0]);
        // The move and end handlers are attached/detached dynamically during interaction
    };

    /**
     * Sets up the orbital control system based on provided configuration.
     * @param {Object} setupOptions - Configuration object.
     */
    OrbitalControl.prototype.configureSystem = function(setupOptions){
        const selfReference = this; // Capture 'this' for nested functions
        let rotationRadius; // Radius of the virtual trackball
        let containerElement; // The DOM container of the rotatable element
        let rotationAxis        = [0, 0, 0]; // Current rotation axis (normalized vector)
        let dragStartVector     = [0, 0, 0]; // Vector at the start of a drag
        let currentDragVector   = [0, 0, 0]; // Vector during dragging
        let initialTransformMatrix = []; // Transformation matrix at the start of dragging
        let angularVelocity     = 0; // Current angular velocity for deceleration
        let applyImpulse        = true; // Whether to apply deceleration after release
        let elementOffsetCoords = [0, 0]; // Top-left coordinates of the container
        let containerWidth, containerHeight; // Dimensions of the container
        let currentAngleRadians = 0; // Total accumulated rotation angle
        let previousAngleRadians = 0; // Angle from previous animation frame
        let previousTimeMs; // Timestamp from previous animation frame
        let currentTimeMs; // Current timestamp

        // Inner initialization routine
        (function initControlSystem (){
            selfReference.deactivate(); // Ensure clean state by removing old listeners

            // Merge provided options into the configuration
            Object.assign(selfReference.configuration, setupOptions);

            const config = selfReference.configuration;

            // Identify the main stage/container element
            containerElement = document.getElementById(config.stageId) || document.querySelector("body");
            if (!containerElement) {
                console.error("OrbitalControl: Stage element not found with ID:", config.stageId);
                return;
            }

            elementOffsetCoords = calculateElementPageOffset(containerElement);
            currentAngleRadians = config.initialAngle || 0;
            applyImpulse        = config.enableDeceleration === false ? false : true;

            // Determine the radius of the virtual trackball
            containerHeight = containerElement.offsetHeight / 2;
            containerWidth  = containerElement.offsetWidth / 2;
            rotationRadius  = Math.min(containerHeight, containerWidth); // Take the shorter side

            // Find the first child element to be controlled/rotated
            selfReference.controlledElement = containerElement.firstElementChild;
            if (!selfReference.controlledElement) {
                console.warn("OrbitalControl: No child element found within the stage to control.");
                return;
            }

            // Retrieve existing CSS3D transform properties
            const currentPerspective = getElementComputedStyle(containerElement, `${vendorPrefixCSS}perspective`);
            const currentTransform   = getElementComputedStyle(selfReference.controlledElement, `${vendorPrefixCSS}transform`);

            // Initialize rotation state (axis, angle, matrix)
            if (config.initialAxis || config.initialAngle !== undefined) {
                // Normalize the initial axis vector
                rotationAxis = normalizeVector(config.initialAxis || [1, 0, 0]);
                currentAngleRadians = config.initialAngle || 0;
                initialTransformMatrix = createRotationMatrix(rotationAxis, currentAngleRadians);
            } else if (currentTransform !== "none") {
                // Parse existing CSS transform matrix
                initialTransformMatrix = parseExistingTransform(currentTransform);
            } else {
                // Default initial state
                rotationAxis = [0, 1, 0];
                currentAngleRadians = 0;
                initialTransformMatrix = createRotationMatrix(rotationAxis, currentAngleRadians);
            }

            // Apply perspective to the container if configured or not present
            if (config.perspectiveValue) {
                containerElement.style[`${vendorPrefixDOM}Perspective`] = config.perspectiveValue;
            } else if (currentPerspective === "none") {
                containerElement.style[`${vendorPrefixDOM}Perspective`] = "700px"; // Default
            }

            if (config.perspectiveOriginValue) {
                containerElement.style[`${vendorPrefixDOM}PerspectiveOrigin`] = config.perspectiveOriginValue;
            }

            // Apply initial transform
            selfReference.controlledElement.style[`${vendorPrefixDOM}Transform`] = `matrix3d(${initialTransformMatrix.join(',')})`;
            manageInteractionBinding(selfReference.controlledElement, 'touchstart', handleInteractionStart);

            // Store interaction handlers for easy activation/deactivation
            selfReference.interactionHandlers = [handleInteractionStart, handleRotationUpdate, handleInteractionEnd];
        })(); // End of initControlSystem IIFE


        /**
         * Parses an existing CSS transform string into a 16-element matrix3d array.
         * Handles both matrix() and matrix3d() formats.
         * @param {string} transformString - The CSS transform value.
         * @returns {number[]} A 16-element float array representing a matrix3d.
         */
        function parseExistingTransform(transformString) {
            let matrixValues = transformString.split(",");
            if (matrixValues[0].includes("matrix3d")) {
                matrixValues[0] = matrixValues[0].replace(/matrix3d\(/g, "");
                matrixValues[15] = matrixValues[15].replace(/\)/g, "");
            } else if (matrixValues[0].includes("matrix")) {
                // Convert 2D matrix to 3D matrix
                matrixValues[0] = matrixValues[0].replace(/matrix\(/g, "");
                matrixValues[5] = matrixValues[5].replace(/\)/g, "");
                matrixValues.splice(2, 0, "0", "0");
                matrixValues.splice(6, 0, "0", "0");
                matrixValues.splice(8, 0, "0", "0", "1", "0");
                matrixValues.splice(14, 0, "0", "1");
            } else {
                return createRotationMatrix([0, 0, 0], 0); // Default to identity if unparseable
            }
            return matrixValues.map(parseFloat);
        }

        /**
         * Handles the start of a user interaction (mousedown/touchstart).
         * @param {Event} eventPayload - The event object.
         */
        function handleInteractionStart(eventPayload){
            eventPayload.preventDefault(); // Prevent default browser actions (e.g., scrolling)

            if (angularVelocity !== 0) {
                stopDecelerationAnimation();
            }

            dragStartVector = projectToSphere(extractEventCoordinates(eventPayload));
            previousTimeMs  = currentTimeMs = Date.now();
            previousAngleRadians = currentAngleRadians;

            manageInteractionBinding(selfReference.controlledElement, 'touchstart', handleInteractionStart, true);
            manageInteractionBinding(document, 'touchmove', handleRotationUpdate);
            manageInteractionBinding(document, 'touchend', handleInteractionEnd);
        }

        /**
         * Handles the end of a user interaction (mouseup/touchend).
         * @param {Event} eventPayload - The event object.
         */
        function handleInteractionEnd(eventPayload){
            // console.log("Interaction End");
            manageInteractionBinding(document, 'touchmove', handleRotationUpdate, true);
            manageInteractionBinding(document, 'touchend', handleInteractionEnd, true);
            manageInteractionBinding(selfReference.controlledElement, 'touchstart', handleInteractionStart);

            calculateDecelerationRate();
            if (applyImpulse && angularVelocity > 0.001) { // Threshold to prevent tiny, endless spins
                requestAnimationFrameFn(animateDeceleration);
            } else {
                finalizeTransformation(); // Clean up matrix immediately if no impulse
            }
        }

        /**
         * Cleans up the transformation state after a rotation sequence.
         * Updates the initial transformation matrix.
         */
        function finalizeTransformation(){
            const currentRotationMatrix = createRotationMatrix(rotationAxis, currentAngleRadians);
            // Combine the initial matrix with the current rotation to form a new base
            initialTransformMatrix = multiplyMatrices(initialTransformMatrix, currentRotationMatrix);
            // Reset current rotation state for the next interaction
            previousAngleRadians = currentAngleRadians = 0;
            angularVelocity = 0;
        }

        /**
         * Handles ongoing rotation during user interaction (mousemove/touchmove).
         * @param {Event} eventPayload - The event object.
         */
        function handleRotationUpdate(eventPayload){
            eventPayload.preventDefault(); // Prevent default browser actions

            const currentEventCoords = extractEventCoordinates(eventPayload);
            if (currentEventCoords[0] === 0 && currentEventCoords[1] === 0 && eventPayload.type.startsWith("touch") && eventPayload.touches.length !== 1) {
                // Skip if not a single touch for touch events
                return;
            }

            previousTimeMs = currentTimeMs;
            previousAngleRadians = currentAngleRadians;

            currentDragVector = projectToSphere(currentEventCoords);

            // Calculate rotation axis (cross product of start and current drag vectors)
            rotationAxis = [
                dragStartVector[1] * currentDragVector[2] - dragStartVector[2] * currentDragVector[1],
                dragStartVector[2] * currentDragVector[0] - dragStartVector[0] * currentDragVector[2],
                dragStartVector[0] * currentDragVector[1] - dragStartVector[1] * currentDragVector[0]
            ];
            rotationAxis = normalizeVector(rotationAxis); // Ensure axis is a unit vector

            // Calculate the angle between the two vectors
            currentAngleRadians = determineAngleBetweenVectors(dragStartVector, currentDragVector);

            // Apply the new transform: current rotation combined with the initial base matrix
            selfReference.controlledElement.style[`${vendorPrefixDOM}Transform`] =
                `rotate3d(${rotationAxis.join(',')},${currentAngleRadians}rad) matrix3d(${initialTransformMatrix.join(',')})`;

            currentTimeMs = Date.now();
        }

        /**
         * Calculates the angular velocity for deceleration.
         */
        function calculateDecelerationRate(){
            const angularDelta = currentAngleRadians - previousAngleRadians;
            const timeDeltaMs  = currentTimeMs - previousTimeMs;

            // A scaling factor (17ms per frame @ 60fps) to normalize velocity
            angularVelocity = Math.abs((angularDelta * 17) / timeDeltaMs);

            if (isNaN(angularVelocity) || !isFinite(angularVelocity)) {
                angularVelocity = 0;
            } else {
                // Clamp angular velocity to a reasonable range
                angularVelocity = Math.min(angularVelocity, 0.2);
            }
        }

        /**
         * Animates the deceleration of the rotation after release.
         */
        let decelerationFrameId = null;
        function animateDeceleration(){
            currentAngleRadians += angularVelocity;
            const decelerationFactor = 0.01 * Math.sqrt(angularVelocity);
            angularVelocity = Math.max(0, angularVelocity - decelerationFactor); // Ensure velocity doesn't go negative

            selfReference.controlledElement.style[`${vendorPrefixDOM}Transform`] =
                `rotate3d(${rotationAxis.join(',')},${currentAngleRadians}rad) matrix3d(${initialTransformMatrix.join(',')})`;

            if (angularVelocity < 0.001) { // Stop if velocity is very low
                stopDecelerationAnimation();
            } else {
                decelerationFrameId = requestAnimationFrameFn(animateDeceleration);
            }
        }

        /**
         * Stops the deceleration animation and finalizes the transformation.
         */
        function stopDecelerationAnimation(){
            if (decelerationFrameId) {
                cancelAnimationFrameFn(decelerationFrameId);
                decelerationFrameId = null;
            }
            finalizeTransformation();
            // Reset angle and velocity for the next interaction
            previousAngleRadians = currentAngleRadians = 0;
            angularVelocity = 0;
        }

        /**
         * Performs 4x4 matrix multiplication.
         * @param {number[]} matrixA - The first 4x4 matrix (16 elements).
         * @param {number[]} matrixB - The second 4x4 matrix (16 elements).
         * @returns {number[]} The resulting 4x4 matrix.
         */
        function multiplyMatrices(matrixA, matrixB){
            const resultMatrix = new Array(16);
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    resultMatrix[i * 4 + j] =
                        matrixA[i * 4 + 0] * matrixB[0 * 4 + j] +
                        matrixA[i * 4 + 1] * matrixB[1 * 4 + j] +
                        matrixA[i * 4 + 2] * matrixB[2 * 4 + j] +
                        matrixA[i * 4 + 3] * matrixB[3 * 4 + j];
                }
            }
            return resultMatrix;
        }

        /**
         * Projects 2D screen coordinates onto a virtual sphere (trackball) to get a 3D vector.
         * @param {number[]} screenCoords - An array [x, y] of screen coordinates.
         * @returns {number[]} A 3D vector [x, y, z] on the sphere's surface.
         */
        function projectToSphere(screenCoords){
            const config = selfReference.configuration;
            const offsetX = elementOffsetCoords[0];
            const offsetY = elementOffsetCoords[1];

            // Adjust coordinates relative to the center of the container
            const xNormalized = ((config.constrainAxis === "x" ? rotationRadius : screenCoords[0] - offsetX) / rotationRadius) - 1;
            const yNormalized = ((config.constrainAxis === "y" ? rotationRadius : screenCoords[1] - offsetY) / rotationRadius) - 1;

            // Calculate the Z-component
            let zSquared = 1 - (xNormalized * xNormalized) - (yNormalized * yNormalized);
            const zComponent = zSquared > 0 ? Math.sqrt(zSquared) : 0; // Clamp z to 0 if outside sphere

            return [xNormalized, yNormalized, zComponent];
        }

        /**
         * Normalizes a 3D vector to have a length of 1 (unit vector).
         * @param {number[]} inputVector - The 3D vector [x, y, z].
         * @returns {number[]} The normalized 3D vector.
         */
        function normalizeVector(inputVector){
            const length = Math.hypot(inputVector[0], inputVector[1], inputVector[2]);
            if (length === 0) return [0, 0, 0]; // Avoid division by zero

            return [
                inputVector[0] / length,
                inputVector[1] / length,
                inputVector[2] / length
            ];
        }

        /**
         * Calculates the angle (in radians) between two 3D vectors.
         * @param {number[]} vectorA - The first 3D vector.
         * @param {number[]} vectorB - The second 3D vector.
         * @returns {number} The angle in radians.
         */
        function determineAngleBetweenVectors(vectorA, vectorB){
            const dotProduct = vectorA[0] * vectorB[0] + vectorA[1] * vectorB[1] + vectorA[2] * vectorB[2];
            const magnitudeA = Math.hypot(vectorA[0], vectorA[1], vectorA[2]);
            const magnitudeB = Math.hypot(vectorB[0], vectorB[1], vectorB[2]);

            const denominator = magnitudeA * magnitudeB;
            if (denominator === 0) return 0; // Avoid division by zero

            // Clamp dot product to [-1, 1] to prevent floating point errors causing NaN with acos
            const clampedDotProduct = Math.max(-1, Math.min(1, dotProduct / denominator));
            return Math.acos(clampedDotProduct);
        }

        /**
         * Generates a 4x4 rotation matrix from an axis vector and an angle.
         * @param {number[]} axisVector - The 3D rotation axis [x, y, z].
         * @param {number} rotationAngle - The rotation angle in radians.
         * @returns {number[]} A 16-element float array representing the rotation matrix.
         */
        function createRotationMatrix(axisVector, rotationAngle){
            const x = axisVector[0];
            const y = axisVector[1];
            const z = axisVector[2];
            const sinAngle = Math.sin(rotationAngle);
            const cosAngle = Math.cos(rotationAngle);
            const oneMinusCos = 1 - cosAngle;

            // Construct the rotation matrix elements
            return [
                cosAngle + x * x * oneMinusCos,        y * x * oneMinusCos + z * sinAngle,  z * x * oneMinusCos - y * sinAngle, 0,
                x * y * oneMinusCos - z * sinAngle,    cosAngle + y * y * oneMinusCos,      z * y * oneMinusCos + x * sinAngle, 0,
                x * z * oneMinusCos + y * sinAngle,    y * z * oneMinusCos - x * sinAngle,  cosAngle + z * z * oneMinusCos,     0,
                0,                                     0,                                   0,                                  1
            ];
        }

        /**
         * Calculates the absolute page offset (top, left) of a DOM element.
         * @param {Element} domElement - The element to calculate offset for.
         * @returns {number[]} An array [left, top] representing the offset.
         */
        function calculateElementPageOffset(domElement) {
            let currentLeft = 0;
            let currentTop  = 0;
            let target = domElement;

            // Traverse up the offsetParent chain to accumulate offsets
            while (target && target.offsetParent) {
                currentLeft += target.offsetLeft;
                currentTop  += target.offsetTop;
                target = target.offsetParent;
            }
            return [currentLeft, currentTop];
        }
    };

    // Expose the OrbitalControl class globally
    window.OrbitalControl = OrbitalControl;
})();