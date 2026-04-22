THREE.ReflectSurface = function (graphixRenderer, mainCamera, worldScene, configParams) {

    // Inherit from THREE.Object3D to get scene graph capabilities.
    THREE.Object3D.call(this);
    // Assign a unique identifier for this reflection surface.
    this.surfaceIdentifier = 'reflector_' + this.id.toString();

    // Ensure essential renderer and scene objects are provided.
    if (!graphixRenderer || !worldScene) {
        console.error("ReflectSurface initialization failed: A valid THREE.WebGLRenderer and THREE.Scene are required.");
        // Consider throwing an error or setting up a 'disabled' state for robustness.
    }

    // Process configuration parameters, using defaults where not specified.
    const effectiveSettings = configParams ?? {};

    // Flag to indicate if the internal projection matrix needs recalculation.
    this.needsTextureRefresh = true;

    // Define the dimensions for the reflection texture.
    const renderSize = {
        w: effectiveSettings.renderWidth || 512,
        h: effectiveSettings.renderHeight || 512
    };

    // Set the offset for the clipping plane, preventing self-intersection artifacts.
    this.clippingPlaneOffset = effectiveSettings.clipOffset ?? 0.0;

    // Store references to the external rendering components.
    this.displayEngine = graphixRenderer;
    this.currentScene = worldScene;

    // Initialize internal mathematical objects for reflection calculations.
    this.reflectionPlane = new THREE.Plane();
    this.surfaceNormal = new THREE.Vector3(0, 0, 1);
    this.viewpointPosition = new THREE.Vector3();
    this.orientationMatrix = new THREE.Matrix4();
    this.targetDirection = new THREE.Vector3(0, 0, -1);
    this.renderClipVector = new THREE.Vector4();

    // Configure the primary camera. If a PerspectiveCamera is provided, use it; otherwise, create a default one.
    this.primaryViewpoint = (mainCamera instanceof THREE.PerspectiveCamera) ? mainCamera : new THREE.PerspectiveCamera();

    // Matrix used to transform UV coordinates for texture projection.
    this.projectionAdjustMatrix = new THREE.Matrix4();

    // Create a clone of the primary camera to use for rendering the reflected scene.
    this.reflectedViewpoint = this.primaryViewpoint.clone();

    // Placeholder for the 3D object this mirror is associated with, typically its parent.
    this.associatedObject = new THREE.Object3D();

    // Create render targets for the reflection texture and a temporary buffer.
    this.mainRenderTarget = new THREE.WebGLRenderTarget(renderSize.w, renderSize.h);
    this.temporaryRenderTarget = new THREE.WebGLRenderTarget(renderSize.w, renderSize.h);

    // Helper function to check if a dimension is a power of two.
    const isDimensionPowerOfTwo = (dim) => (dim > 0) && ((dim & (dim - 1)) === 0);

    // Disable mipmaps if dimensions are not powers of two, to avoid WebGL warnings/errors.
    if (!isDimensionPowerOfTwo(renderSize.w) || !isDimensionPowerOfTwo(renderSize.h)) {
        this.mainRenderTarget.generateMipmaps = false;
        this.temporaryRenderTarget.generateMipmaps = false;
    }

    // Perform initial setup and render the reflection.
    this.refreshProjectionMapping();
    this.drawSurface();
};

THREE.ReflectSurface.prototype = Object.create(THREE.Object3D.prototype);

THREE.ReflectSurface.prototype.renderNestedReflection = function (otherReflectorInstance) {

    // Update the reflection matrix for this surface to capture the current scene state.
    this.refreshProjectionMapping();
    this.needsTextureRefresh = false;

    // Temporarily swap the other reflector's camera to this reflector's mirrored camera.
    const cachedOtherCamera = otherReflectorInstance.primaryViewpoint;
    otherReflectorInstance.primaryViewpoint = this.reflectedViewpoint;

    // Render the other reflector's view into its temporary buffer.
    otherReflectorInstance.drawSurface(true);

    // Update the other reflector's material to sample from its newly rendered temporary texture.
    if (otherReflectorInstance.material && otherReflectorInstance.material.uniforms && otherReflectorInstance.material.uniforms.mirrorSampler) {
        otherReflectorInstance.material.uniforms.mirrorSampler.value = otherReflectorInstance.temporaryRenderTarget;
    }


    // Render this current reflector's view into its main texture.
    this.drawSurface();
    this.needsTextureRefresh = true;

    // Restore the other reflector's material to its primary texture.
    if (otherReflectorInstance.material && otherReflectorInstance.material.uniforms && otherReflectorInstance.material.uniforms.mirrorSampler) {
        otherReflectorInstance.material.uniforms.mirrorSampler.value = otherReflectorInstance.mainRenderTarget;
    }
    // Restore the other reflector's original camera.
    otherReflectorInstance.primaryViewpoint = cachedOtherCamera;

    // Ensure the other reflector's internal matrices are refreshed after camera restoration.
    otherReflectorInstance.refreshProjectionMapping();
};

THREE.ReflectSurface.prototype.refreshProjectionMapping = function () {

    // Determine the object associated with this reflection surface.
    const currentRenderObject = this.parent !== undefined ? this.parent : this.associatedObject;
    this.associatedObject = currentRenderObject; // Update internal reference if parent exists.

    // Update world matrices for accurate positioning and orientation.
    this.updateMatrixWorld();
    this.primaryViewpoint.updateMatrixWorld();

    // Get the global position of the primary camera.
    this.viewpointPosition.setFromMatrixPosition(this.primaryViewpoint.matrixWorld);

    // Extract the rotation component of this object's world matrix.
    this.orientationMatrix.extractRotation(this.matrixWorld);

    // Define initial vectors for calculations.
    const defaultSurfaceUp = new THREE.Vector3(0, 1, 0);
    const initialCamForward = new THREE.Vector3(0, 0, 1);

    // Calculate the surface's normal vector in world space.
    this.surfaceNormal.copy(defaultSurfaceUp).applyEuler(currentRenderObject.rotation);

    // Calculate the camera's forward direction in world space.
    const cameraForwardVector = initialCamForward.clone().applyEuler(this.primaryViewpoint.rotation);

    // Adjust surface normal if the camera is viewing the back face of the mirror.
    if (this.surfaceNormal.dot(cameraForwardVector) < 0) {
        const primarySurfaceNormal = initialCamForward.clone().applyEuler(currentRenderObject.rotation);
        this.surfaceNormal.reflect(primarySurfaceNormal);
    }

    // Calculate the reflected camera position.
    const reflectedViewPosition = currentRenderObject.position.clone();
    reflectedViewPosition.sub(this.viewpointPosition);
    reflectedViewPosition.reflect(this.surfaceNormal);
    reflectedViewPosition.negate();
    reflectedViewPosition.add(currentRenderObject.position);

    // Re-extract camera's rotation matrix for look-at calculations.
    this.orientationMatrix.extractRotation(this.primaryViewpoint.matrixWorld);

    // Calculate the reflected camera target point.
    this.targetDirection.set(0, 0, -1);
    this.targetDirection.applyMatrix4(this.orientationMatrix);
    this.targetDirection.add(this.viewpointPosition);

    const reflectedLookAtTarget = currentRenderObject.position.clone();
    reflectedLookAtTarget.sub(this.targetDirection);
    reflectedLookAtTarget.reflect(this.surfaceNormal);
    reflectedLookAtTarget.negate();
    reflectedLookAtTarget.add(currentRenderObject.position);

    // Calculate the reflected camera's 'up' vector.
    const reflectedUpVector = new THREE.Vector3(0, -1, 0);
    reflectedUpVector.applyMatrix4(this.orientationMatrix);
    reflectedUpVector.reflect(this.surfaceNormal);
    reflectedUpVector.negate();

    // Apply calculated positions and orientations to the reflected camera.
    this.reflectedViewpoint.position.copy(reflectedViewPosition);
    this.reflectedViewpoint.up.copy(reflectedUpVector);
    this.reflectedViewpoint.lookAt(reflectedLookAtTarget);
    this.reflectedViewpoint.aspect = this.primaryViewpoint.aspect;

    // Update the reflected camera's projection and world matrices.
    this.reflectedViewpoint.updateProjectionMatrix();
    this.reflectedViewpoint.updateMatrixWorld();
    this.reflectedViewpoint.matrixWorldInverse.getInverse(this.reflectedViewpoint.matrixWorld);

    // Construct the texture projection matrix.
    const textureTransformBase = new THREE.Matrix4().set(
        0.5, 0.0, 0.0, 0.5,
        0.0, 0.5, 0.0, 0.5,
        0.0, 0.0, 0.5, 0.5,
        0.0, 0.0, 0.0, 1.0
    );
    this.projectionAdjustMatrix.copy(textureTransformBase);
    this.projectionAdjustMatrix.multiply(this.reflectedViewpoint.projectionMatrix);
    this.projectionAdjustMatrix.multiply(this.reflectedViewpoint.matrixWorldInverse);

    // Define the clipping plane for the reflection.
    this.reflectionPlane.setFromNormalAndCoplanarPoint(this.surfaceNormal, currentRenderObject.position);
    this.reflectionPlane.applyMatrix4(this.reflectedViewpoint.matrixWorldInverse);

    this.renderClipVector.set(this.reflectionPlane.normal.x, this.reflectionPlane.normal.y, this.reflectionPlane.normal.z, this.reflectionPlane.constant);

    // Adjust the reflected camera's projection matrix to include the clipping plane.
    const clipVectorQ = new THREE.Vector4();
    const currentProjectionMatrix = this.reflectedViewpoint.projectionMatrix;

    clipVectorQ.x = (Math.sign(this.renderClipVector.x) + currentProjectionMatrix.elements[8]) / currentProjectionMatrix.elements[0];
    clipVectorQ.y = (Math.sign(this.renderClipVector.y) + currentProjectionMatrix.elements[9]) / currentProjectionMatrix.elements[5];
    clipVectorQ.z = -1.0;
    clipVectorQ.w = (1.0 + currentProjectionMatrix.elements[10]) / currentProjectionMatrix.elements[14];

    const scaledClipVector = this.renderClipVector.clone().multiplyScalar(2.0 / this.renderClipVector.dot(clipVectorQ));

    currentProjectionMatrix.elements[2] = scaledClipVector.x;
    currentProjectionMatrix.elements[6] = scaledClipVector.y;
    currentProjectionMatrix.elements[10] = scaledClipVector.z + 1.0 - this.clippingPlaneOffset;
    currentProjectionMatrix.elements[14] = scaledClipVector.w;
};

THREE.ReflectSurface.prototype.drawSurface = function (useTemporaryBuffer = false) {

    // Recalculate the projection matrix if marked as needing an update.
    if (this.needsTextureRefresh) {
        this.refreshProjectionMapping();
    }

    // Mark for refresh for the next frame to ensure dynamic reflections.
    this.needsTextureRefresh = true;

    // Render the scene from the perspective of the reflected camera into the chosen render target.
    if (this.currentScene && this.currentScene instanceof THREE.Scene) {
        const targetBuffer = useTemporaryBuffer ? this.temporaryRenderTarget : this.mainRenderTarget;
        this.displayEngine.render(this.currentScene, this.reflectedViewpoint, targetBuffer, true);
    }
};