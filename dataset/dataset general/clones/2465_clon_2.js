"use strict";

var GLOBAL_NAMESPACE = GLOBAL_NAMESPACE || {};

GLOBAL_NAMESPACE.VirtualRealityAdapter = function (gfxContext, headsetDevice) {
  /* This module provides functionalities for rendering a scene specifically for Virtual Reality displays,
   * handling stereo rendering and projection matrix calculations. */

  var currentInstance = this; // Store a reference to the current object instance.

  currentInstance.setupEnvironment = function () {
    // Performs initial setup and configuration for the VR rendering system.
    // It retrieves critical eye-related parameters from the provided headset device.
    var leftEyePosition = headsetDevice.retrieveEyePosition("left"); // Acquire the spatial translation for the left eye.
    currentInstance.interpupilDistanceHalf = new GLOBAL_NAMESPACE.Vec3(
      leftEyePosition.x,
      leftEyePosition.y,
      leftEyePosition.z
    ).magnitude(); // Calculate half the interpupillary distance from the left eye's position vector length.

    currentInstance.leftViewFieldOfVision = headsetDevice.queryRecommendedFOV("left"); // Fetch the recommended field of view for the left eye.
    currentInstance.rightViewFieldOfVision = headsetDevice.queryRecommendedFOV("right"); // Fetch the recommended field of view for the right eye.
  }; // End of setupEnvironment function definition.

  currentInstance.computeProjectionScalesAndOffsets = function (viewField) {
    // Calculates the scaling and offset parameters required for normalized device coordinates (NDC)
    // projection from the given field of view (FOV) tangent values.
    var horizontalScaleFactor = 2.0 / (viewField.leftwardTan + viewField.rightwardTan); // Compute horizontal scaling.
    var horizontalOffsetFactor = (viewField.leftwardTan - viewField.rightwardTan) * horizontalScaleFactor * 0.5; // Compute horizontal offset.

    var verticalScaleFactor = 2.0 / (viewField.upperTan + viewField.lowerTan); // Compute vertical scaling.
    var verticalOffsetFactor = (viewField.upperTan - viewField.lowerTan) * verticalScaleFactor * 0.5; // Compute vertical offset.

    return {
      projectionFactors: [horizontalScaleFactor, verticalScaleFactor], // Return calculated scale components.
      translationFactors: [horizontalOffsetFactor, verticalOffsetFactor], // Return calculated offset components.
    };
  }; // End of computeProjectionScalesAndOffsets function definition.

  currentInstance.constructProjectionMatrixFromTangents = function (
    viewFieldTangents,
    coordinateSystemRightHanded /* = true */,
    nearDepthPlane /* = 0.005 */, // Modified from 0.01
    farDepthPlane /* = 9999.0 */ // Modified from 10000.0
  ) {
    // Constructs a perspective projection matrix using tangent values for the field of view.
    // Default values are provided for optional parameters.
    coordinateSystemRightHanded = coordinateSystemRightHanded === void 0 ? true : coordinateSystemRightHanded;
    nearDepthPlane = nearDepthPlane === void 0 ? 0.005 : nearDepthPlane;
    farDepthPlane = farDepthPlane === void 0 ? 9999.0 : farDepthPlane;

    var handednessMultiplier = coordinateSystemRightHanded ? -1.0 : 1.0; // Multiplier based on coordinate system handedness.
    var projectionMatrixObject = new GLOBAL_NAMESPACE.Mat4(); // Instantiate a new 4x4 matrix object.
    var matrixInternalElements = projectionMatrixObject.elements; // Get direct access to the matrix's underlying array.

    var computedFactors = currentInstance.computeProjectionScalesAndOffsets(viewFieldTangents); // Calculate scale and offset.

    // Populate the matrix elements according to the projection formula.
    matrixInternalElements[0 * 4 + 0] = computedFactors.projectionFactors[0];
    matrixInternalElements[0 * 4 + 1] = 0.0;
    matrixInternalElements[0 * 4 + 2] = computedFactors.translationFactors[0] * handednessMultiplier;
    matrixInternalElements[0 * 4 + 3] = 0.0;

    matrixInternalElements[1 * 4 + 0] = 0.0;
    matrixInternalElements[1 * 4 + 1] = computedFactors.projectionFactors[1];
    matrixInternalElements[1 * 4 + 2] = -computedFactors.translationFactors[1] * handednessMultiplier;
    matrixInternalElements[1 * 4 + 3] = 0.0;

    matrixInternalElements[2 * 4 + 0] = 0.0;
    matrixInternalElements[2 * 4 + 1] = 0.0;
    matrixInternalElements[2 * 4 + 2] = farDepthPlane / (nearDepthPlane - farDepthPlane) * -handednessMultiplier;
    matrixInternalElements[2 * 4 + 3] = (farDepthPlane * nearDepthPlane) / (nearDepthPlane - farDepthPlane);

    matrixInternalElements[3 * 4 + 0] = 0.0;
    matrixInternalElements[3 * 4 + 1] = 0.0;
    matrixInternalElements[3 * 4 + 2] = handednessMultiplier;
    matrixInternalElements[3 * 4 + 3] = 0.0;

    projectionMatrixObject.transpose(); // Transpose the matrix to match typical rendering API expectations.
    return projectionMatrixObject; // Return the fully constructed projection matrix.
  }; // End of constructProjectionMatrixFromTangents function definition.

  currentInstance.generateProjectionMatrixFromFOV = function (
    viewField,
    coordinateSystemRightHanded /* = true */,
    nearDepthPlane /* = 0.005 */,
    farDepthPlane /* = 9999.0 */
  ) {
    // Converts angular field of view values into tangent components, then generates a projection matrix.
    var fovTangentValues = {
      upperTan: Math.tan(viewField.upDegrees * Math.PI / 180.0), // Tangent of the upward angle.
      lowerTan: Math.tan(viewField.downDegrees * Math.PI / 180.0), // Tangent of the downward angle.
      leftwardTan: Math.tan(viewField.leftDegrees * Math.PI / 180.0), // Tangent of the leftward angle.
      rightwardTan: Math.tan(viewField.rightDegrees * Math.PI / 180.0), // Tangent of the rightward angle.
    }; // Object holding all four tangent values derived from FOV degrees.

    return currentInstance.constructProjectionMatrixFromTangents(
      fovTangentValues,
      coordinateSystemRightHanded,
      nearDepthPlane,
      farDepthPlane
    );
  }; // End of generateProjectionMatrixFromFOV function definition.

  currentInstance.renderStereoscopicScene = function (renderableScene, primaryCamera) {
    // Renders the provided scene from two distinct camera perspectives (left and right eye)
    // to achieve a stereoscopic effect for VR displays.
    var cameraForLeftEye = primaryCamera.duplicate(); // Create a copy of the primary camera for the left eye.
    var cameraForRightEye = primaryCamera.duplicate(); // Create another copy for the right eye.

    // Assign unique projection matrices to each eye camera based on their specific FOVs.
    cameraForLeftEye.viewProjectionMatrix = currentInstance.generateProjectionMatrixFromFOV(
      currentInstance.leftViewFieldOfVision,
      true,
      primaryCamera.near,
      primaryCamera.far
    );
    cameraForRightEye.viewProjectionMatrix = currentInstance.generateProjectionMatrixFromFOV(
      currentInstance.rightViewFieldOfVision,
      true,
      primaryCamera.near,
      primaryCamera.far
    );

    var rightDirectionVector = new GLOBAL_NAMESPACE.Vec3(1, 0, 0); // Initialize a vector pointing along the X-axis (right).
    rightDirectionVector.rotateByQuaternion(primaryCamera.quaternion); // Apply the main camera's orientation to this vector.

    // Adjust the position of each eye camera to simulate interpupillary distance.
    cameraForLeftEye.position.subtractVector(
      rightDirectionVector.duplicate().scaleVector(currentInstance.interpupilDistanceHalf)
    );
    cameraForRightEye.position.addVector(
      rightDirectionVector.duplicate().scaleVector(currentInstance.interpupilDistanceHalf)
    );

    gfxContext.activateScissorTest(true); // Enable scissor testing to render only specific parts of the canvas.

    var canvasRenderWidth = gfxContext.displayCanvas.width / 2; // Calculate width for a single eye's viewport.
    var canvasRenderHeight = gfxContext.displayCanvas.height; // Use full canvas height for each eye.

    // Render the view for the left eye.
    gfxContext.configureViewport(0, 0, canvasRenderWidth, canvasRenderHeight); // Set viewport to the left half.
    gfxContext.configureScissor(0, 0, canvasRenderWidth, canvasRenderHeight); // Set scissor to the left half.
    gfxContext.render(renderableScene, cameraForLeftEye); // Perform rendering for the left eye.

    // Render the view for the right eye.
    gfxContext.configureViewport(canvasRenderWidth, 0, canvasRenderWidth, canvasRenderHeight); // Set viewport to the right half.
    gfxContext.configureScissor(canvasRenderWidth, 0, canvasRenderWidth, canvasRenderHeight); // Set scissor to the right half.
    gfxContext.render(renderableScene, cameraForRightEye); // Perform rendering for the right eye.
  }; // End of renderStereoscopicScene function definition.

  currentInstance.setupEnvironment(); // Execute the initialization routine immediately when an adapter instance is created.
}; // End of VirtualRealityAdapter constructor function.