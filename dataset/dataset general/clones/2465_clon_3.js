"use strict";

// Define a global namespace for our custom VR rendering utilities.
// This helps prevent conflicts with other libraries and organizes our code.
const VR_ENGINE_CORE = VR_ENGINE_CORE || {};

/**
 * @class StereoDisplayComposer
 * @description Manages the complex process of rendering a scene for stereoscopic (VR) displays.
 * It handles fetching HMD parameters, calculating eye projections, and rendering each eye's view.
 *
 * @param {object} graphicsContext - The underlying 3D rendering context (e.g., a THREE.WebGLRenderer instance).
 * @param {object} hmdDeviceInterface - An interface object to the Head-Mounted Display, providing
 *                                      eye translation and field of view (FOV) information.
 */
VR_ENGINE_CORE.StereoDisplayComposer = function(graphicsContext, hmdDeviceInterface) {

    // A consistent reference to the current instance, useful for callbacks and nested scopes.
    const currentComposerInstance = this;

    // --- Private Internal State Variables ---
    // These store the calculated parameters for each eye's field of view and inter-pupillary distance.
    let _cachedLeftEyeFOV = null;  // Stores the Field of View parameters for the left eye.
    let _cachedRightEyeFOV = null; // Stores the Field of View parameters for the right eye.
    let _halfInterPupillaryDistance = 0.0; // Half of the distance between the user's pupils.

    // --- Configuration Constants ---
    // Pre-calculated factors and default values for projection matrix construction.
    const DEGREES_TO_RADIANS_FACTOR = Math.PI / 180.0;
    const DEFAULT_NEAR_CLIPPING_PLANE = 0.01;
    const DEFAULT_FAR_CLIPPING_PLANE = 10000.0;

    /**
     * @private
     * @description Converts Field of View (FOV) angles, provided in degrees, into their tangent values.
     * These tangent values are critical for constructing perspective projection matrices.
     * @param {object} fovAngleSet - An object containing `upDegrees`, `downDegrees`, `leftDegrees`, and `rightDegrees`.
     * @returns {object} An object with `upTan`, `downTan`, `leftTan`, `rightTan` properties.
     */
    const convertFovDegreesToTangentValues = (fovAngleSet) => {
        // Essential input validation: ensure the FOV object and its properties are valid.
        if (!fovAngleSet || typeof fovAngleSet.upDegrees !== 'number') {
            console.error("Invalid FOV angle set provided for tangent conversion. Expected object with degree properties.");
            // Return a safe, but invalid, set of tangent values to prevent further errors.
            return { upTan: 0, downTan: 0, leftTan: 0, rightTan: 0 };
        }
        return {
            upTan: Math.tan(fovAngleSet.upDegrees * DEGREES_TO_RADIANS_FACTOR),
            downTan: Math.tan(fovAngleSet.downDegrees * DEGREES_TO_RADIANS_FACTOR),
            leftTan: Math.tan(fovAngleSet.leftDegrees * DEGREES_TO_RADIANS_FACTOR),
            rightTan: Math.tan(fovAngleSet.rightDegrees * DEGREES_TO_RADIANS_FACTOR)
        };
    };

    /**
     * @private
     * @description Computes the scale and offset factors required for Normalized Device Coordinates (NDC)
     * based on the provided FOV tangent values. These factors transform view space to NDC space.
     * @param {object} fovTangentSet - An object containing `upTan`, `downTan`, `leftTan`, `rightTan`.
     * @returns {object} An object containing `ndcScale` (array [x,y]) and `ndcOffset` (array [x,y]).
     */
    const calculateNdcProjectionFactors = (fovTangentSet) => {
        // Critical input validation for the tangent set.
        if (!fovTangentSet || typeof fovTangentSet.leftTan !== 'number') {
            console.error("calculateNdcProjectionFactors received invalid FOV tangent data.");
            return { ndcScale: [0, 0], ndcOffset: [0, 0] };
        }

        const sumOfHorizontalTangents = fovTangentSet.leftTan + fovTangentSet.rightTan;
        const sumOfVerticalTangents = fovTangentSet.upTan + fovTangentSet.downTan;

        // Calculate X-axis scale and offset, guarding against division by zero.
        const horizontalScale = (sumOfHorizontalTangents !== 0) ? (2.0 / sumOfHorizontalTangents) : 0;
        const horizontalOffset = (sumOfHorizontalTangents !== 0) ? ((fovTangentSet.leftTan - fovTangentSet.rightTan) * horizontalScale * 0.5) : 0;

        // Calculate Y-axis scale and offset, guarding against division by zero.
        const verticalScale = (sumOfVerticalTangents !== 0) ? (2.0 / sumOfVerticalTangents) : 0;
        const verticalOffset = (sumOfVerticalTangents !== 0) ? ((fovTangentSet.upTan - fovTangentSet.downTan) * verticalScale * 0.5) : 0;

        return {
            ndcScale: [horizontalScale, verticalScale],
            ndcOffset: [horizontalOffset, verticalOffset]
        };
    };

    /**
     * @private
     * @description Constructs a perspective projection matrix using FOV tangent values and clipping planes.
     * This function directly populates a THREE.Matrix4 object's elements.
     *
     * @param {object} fovTangentData - Tangent values for up, down, left, right FOV.
     * @param {boolean} [isRightHanded=true] - Specifies if the coordinate system is right-handed.
     * @param {number} [nearClip=0.01] - The distance to the near clipping plane.
     * @param {number} [farClip=10000.0] - The distance to the far clipping plane.
     * @returns {THREE.Matrix4} The computed projection matrix. Returns an identity matrix on failure.
     */
    const constructProjectionMatrixFromTangents = (fovTangentData, isRightHanded = true, nearClip = DEFAULT_NEAR_CLIPPING_PLANE, farClip = DEFAULT_FAR_CLIPPING_PLANE) => {
        // Ensure THREE.Matrix4 is available; this composer relies on it.
        if (!THREE || typeof THREE.Matrix4 === 'undefined') {
            console.error("THREE.Matrix4 is not defined. Cannot build projection matrix.");
            return new THREE.Matrix4(); // Return an identity matrix as a fallback.
        }

        const coordSystemHandednessFactor = isRightHanded ? -1.0 : 1.0;
        const finalProjectionMatrix = new THREE.Matrix4();
        // Accessing elements directly can be slightly more performant for full matrix population.
        const matrixElementsArray = new Array(16); // Temporary array for elements before setting on Matrix4.

        const ndcCalculationResult = calculateNdcProjectionFactors(fovTangentData);
        const [hScale, vScale] = ndcCalculationResult.ndcScale;
        const [hOffset, vOffset] = ndcCalculationResult.ndcOffset;

        // Pre-calculate terms for the Z-axis transformation, reducing redundant computations.
        const zPlaneRange = nearClip - farClip;
        const zTransformA = farClip / zPlaneRange;
        const zTransformB = (farClip * nearClip) / zPlaneRange;

        // Populate the matrix elements. Three.js uses column-major order, but the original
        // code populates in a row-major fashion then transposes. We'll replicate that pattern.
        // Row 0
        matrixElementsArray[0] = hScale;
        matrixElementsArray[1] = 0.0;
        matrixElementsArray[2] = hOffset * coordSystemHandednessFactor;
        matrixElementsArray[3] = 0.0;

        // Row 1
        matrixElementsArray[4] = 0.0;
        matrixElementsArray[5] = vScale;
        matrixElementsArray[6] = -vOffset * coordSystemHandednessFactor;
        matrixElementsArray[7] = 0.0;

        // Row 2 (Z-axis transformation)
        matrixElementsArray[8] = 0.0;
        matrixElementsArray[9] = 0.0;
        matrixElementsArray[10] = zTransformA * -coordSystemHandednessFactor;
        matrixElementsArray[11] = zTransformB; // This is the W component for perspective division

        // Row 3 (Perspective division row)
        matrixElementsArray[12] = 0.0;
        matrixElementsArray[13] = 0.0;
        matrixElementsArray[14] = coordSystemHandednessFactor; // Z component for perspective division
        matrixElementsArray[15] = 0.0;

        // Assign the temporary array and apply the transpose operation to match the intended matrix layout.
        finalProjectionMatrix.elements = matrixElementsArray;
        finalProjectionMatrix.transpose();

        return finalProjectionMatrix;
    };

    /**
     * @public
     * @description Initializes the stereoscopic rendering system by querying the HMD device
     * for its specific eye parameters (FOV and IPD). This method must be called successfully
     * before stereo rendering can occur.
     * @returns {boolean} `true` if initialization was successful, `false` otherwise.
     */
    currentComposerInstance.initializeHmdParameters = () => {
        // Guard clause: Ensure the HMD interface is valid and has the necessary functions.
        if (!hmdDeviceInterface || typeof hmdDeviceInterface.getEyeTranslation !== 'function' || typeof hmdDeviceInterface.getRecommendedEyeFieldOfView !== 'function') {
            console.error("HMD device interface is invalid or incomplete. Cannot initialize stereo parameters.");
            return false;
        }

        try {
            // Retrieve the translation vector for the left eye from the HMD.
            const leftEyeTranslationVector = hmdDeviceInterface.getEyeTranslation("left");
            // Validate the returned translation object.
            if (!leftEyeTranslationVector || typeof leftEyeTranslationVector.x === 'undefined') {
                 console.error("Failed to obtain left eye translation from HMD. Check HMD connection/status.");
                 return false;
            }

            // Calculate half of the Inter-Pupillary Distance (IPD) from the length of the eye translation vector.
            // Assumes THREE.Vector3 is available for vector operations.
            _halfInterPupillaryDistance = new THREE.Vector3(leftEyeTranslationVector.x, leftEyeTranslationVector.y, leftEyeTranslationVector.z).length();

            // Fetch the recommended Field of View parameters for both the left and right eyes.
            _cachedLeftEyeFOV = hmdDeviceInterface.getRecommendedEyeFieldOfView("left");
            _cachedRightEyeFOV = hmdDeviceInterface.getRecommendedEyeFieldOfView("right");

            // Validate that FOV data was successfully retrieved for both eyes.
            if (!_cachedLeftEyeFOV || !_cachedRightEyeFOV) {
                console.error("Failed to retrieve complete FOV data for one or both eyes from HMD.");
                return false;
            }

            console.info("StereoDisplayComposer successfully initialized HMD parameters.");
            return true;
        } catch (error) {
            console.error("An unexpected error occurred during HMD parameter initialization:", error);
            return false;
        }
    };

    /**
     * @public
     * @description Generates a complete perspective projection matrix for a single eye's view.
     * This method serves as a convenient wrapper, handling the conversion from degrees to tangents
     * and then calling the underlying matrix construction logic.
     *
     * @param {object} eyeFovConfig - Object containing `upDegrees`, `downDegrees`, `leftDegrees`, `rightDegrees` for the eye.
     * @param {boolean} [isRightHanded=true] - Specifies the coordinate system handedness.
     * @param {number} [nearClip=0.01] - Near clipping plane distance.
     * @param {number} [farClip=10000.0] - Far clipping plane distance.
     * @returns {THREE.Matrix4} The generated projection matrix. Returns an identity matrix if inputs are invalid.
     */
    currentComposerInstance.createEyeProjectionMatrix = (eyeFovConfig, isRightHanded = true, nearClip = DEFAULT_NEAR_CLIPPING_PLANE, farClip = DEFAULT_FAR_CLIPPING_PLANE) => {
        // Input validation: ensure the FOV configuration is valid.
        if (!eyeFovConfig || typeof eyeFovConfig.upDegrees !== 'number') {
            console.error("Invalid FOV configuration provided to createEyeProjectionMatrix.");
            return new THREE.Matrix4(); // Return an identity matrix as a safe default.
        }
        // First convert angles to tangents, then construct the matrix.
        const tangentValues = convertFovDegreesToTangentValues(eyeFovConfig);
        return constructProjectionMatrixFromTangents(tangentValues, isRightHanded, nearClip, farClip);
    };

    /**
     * @public
     * @description Renders the provided 3D scene twice, once for each eye, to create a stereoscopic effect.
     * It adjusts the camera position and projection for each eye and renders into separate viewports.
     *
     * @param {THREE.Scene} sceneGraph - The 3D scene object to be rendered.
     * @param {THREE.Camera} mainViewerCamera - The primary camera representing the user's head position and orientation.
     */
    currentComposerInstance.renderStereoView = (sceneGraph, mainViewerCamera) => {
        // Comprehensive pre-render validation to catch common issues early.
        if (!sceneGraph || !mainViewerCamera || !graphicsContext) {
            console.error("Missing critical rendering components (scene, camera, or graphics context) for stereo render.");
            return;
        }
        // Ensure HMD parameters have been initialized. If not, attempt to initialize them now.
        if (!_cachedLeftEyeFOV || !_cachedRightEyeFOV || _halfInterPupillaryDistance === 0.0) {
            console.warn("Stereo parameters are not yet initialized or are invalid. Attempting initialization...");
            if (!currentComposerInstance.initializeHmdParameters()) {
                console.error("Failed to initialize stereo parameters. Cannot proceed with stereo rendering.");
                return;
            }
        }

        // Clone the main camera to create two distinct camera instances for each eye.
        // This ensures that the original camera state remains untouched.
        const leftEyeCamera = mainViewerCamera.clone();
        const rightEyeCamera = mainViewerCamera.clone();

        // Assign the correct projection matrices for each eye based on their specific FOV.
        leftEyeCamera.projectionMatrix = currentComposerInstance.createEyeProjectionMatrix(_cachedLeftEyeFOV, true, mainViewerCamera.near, mainViewerCamera.far);
        rightEyeCamera.projectionMatrix = currentComposerInstance.createEyeProjectionMatrix(_cachedRightEyeFOV, true, mainViewerCamera.near, mainViewerCamera.far);

        // Determine the 'right' direction vector relative to the main camera's current orientation.
        // This vector is used to offset each eye's camera position.
        const cameraRightVec = new THREE.Vector3(1, 0, 0); // Start with a local +X axis vector.
        cameraRightVec.applyQuaternion(mainViewerCamera.quaternion); // Apply the camera's rotation.

        // Calculate the positional offset for each eye based on the half IPD.
        const ipdPositionShift = cameraRightVec.clone().multiplyScalar(_halfInterPupillaryDistance);

        // Adjust the position of each eye camera:
        // Left eye shifts left (subtracting the vector).
        leftEyeCamera.position.sub(ipdPositionShift);
        // Right eye shifts right (adding the vector).
        rightEyeCamera.position.add(ipdPositionShift);

        // Enable scissor testing on the graphics context. This allows rendering into specific
        // rectangular regions of the canvas, crucial for side-by-side stereo views.
        graphicsContext.enableScissorTest(true);

        // Retrieve the dimensions of the rendering canvas element.
        const renderTargetCanvas = graphicsContext.domElement;
        const viewportSectionWidth = renderTargetCanvas.width / 2;
        const viewportFullHeight = renderTargetCanvas.height;

        // --- Render the Left Eye's View ---
        // Set the viewport and scissor rectangle for the left half of the canvas.
        graphicsContext.setViewport(0, 0, viewportSectionWidth, viewportFullHeight);
        graphicsContext.setScissor(0, 0, viewportSectionWidth, viewportFullHeight);
        graphicsContext.render(sceneGraph, leftEyeCamera); // Execute rendering for the left eye.

        // --- Render the Right Eye's View ---
        // Set the viewport and scissor rectangle for the right half of the canvas.
        graphicsContext.setViewport(viewportSectionWidth, 0, viewportSectionWidth, viewportFullHeight);
        graphicsContext.setScissor(viewportSectionWidth, 0, viewportSectionWidth, viewportFullHeight);
        graphicsContext.render(sceneGraph, rightEyeCamera); // Execute rendering for the right eye.

        // Optional: Disable scissor testing if it's not needed for subsequent rendering operations.
        // graphicsContext.enableScissorTest(false);
    };

    // Note: The automatic `initialize()` call from the original code has been removed.
    // Initialization is now an explicit step (`initializeHmdParameters()`) that the user
    // of this composer must call, providing more control and better error handling.
};