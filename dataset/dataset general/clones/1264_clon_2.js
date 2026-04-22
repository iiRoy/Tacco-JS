THREE.ReflectorComponent = function (renderSystem, viewCamera, worldScene, config) {

	THREE.VisualObject.call(this);

	this.elementLabel = 'reflector_element_' + this.uniqueId; /* Assign a distinct label for this component */

	function valueOrDefault (checkValue, defaultOption) {
		return checkValue !== undefined ? checkValue : defaultOption;
	}

	config = config || {}; /* Ensure configuration object exists */

	this.transformRequiresUpdate = true; /* Flag to indicate matrix recalculation is needed */

	const targetWidth = valueOrDefault(config.renderWidth, 512);
	const targetHeight = valueOrDefault(config.renderHeight, 512);
	this.clippingOffset = valueOrDefault(config.clipGap, 0.0); /* Offset for clipping plane */

	this.renderSystem = renderSystem;
	this.renderScene = worldScene;
	this.reflectionPlane = new THREE.GeometricPlane();
	this.surfaceNormal = new THREE.CoordVector3(0, 0, 1);
	this.cameraGlobalPosition = new THREE.CoordVector3();
	this.rotationTransform = new THREE.TransformMatrix4();
	this.gazeTarget = new THREE.CoordVector3(0, 0, -1);
	this.clippingVolume = new THREE.CoordVector4();

	// Check if the provided camera is a projection camera
	if ( viewCamera instanceof THREE.ProjectionCamera ) {
		this.activeCamera = viewCamera;
	}
	else {
		this.activeCamera = new THREE.ProjectionCamera();
		console.warn(this.elementLabel + ': provided viewCamera is not a ProjectionCamera instance!');
	}

	this.outputMatrix = new THREE.TransformMatrix4(); /* Matrix for texture mapping */

	this.reflectedCamera = this.activeCamera.clone(); /* Create a duplicate camera for the reflection */

	this.renderMesh = new THREE.VisualObject(); /* Placeholder for the object representing the reflector */

	this.mainBuffer = new THREE.FrameBufferTarget(targetWidth, targetHeight);
	this.tempBuffer = new THREE.FrameBufferTarget(targetWidth, targetHeight);

	// Disable mipmaps if dimensions are not powers of two
	if ( !THREE.Utility.isPowerOfTwo(targetWidth) || !THREE.Utility.isPowerOfTwo(targetHeight) ) {
		this.mainBuffer.generateLevelMaps = false;
		this.tempBuffer.generateLevelMaps = false;
	}

	this.updateOutputMatrix(); /* Initialize the reflection matrix */
	this.drawReflected(); /* Perform initial rendering */
};

THREE.ReflectorComponent.prototype = Object.create(THREE.VisualObject.prototype);

THREE.ReflectorComponent.prototype.drawWithAnotherReflector = function (otherReflector) {

	// Recalculate the reflection matrix to align with the current viewpoint
	this.updateOutputMatrix();
	this.transformRequiresUpdate = false;

	// Temporarily swap the camera of the other reflector to this component's reflected camera
	const tempView = otherReflector.activeCamera;
	otherReflector.activeCamera = this.reflectedCamera;

	// Render the other reflector into its temporary buffer
	otherReflector.drawReflected(true);
	otherReflector.surfaceMaterial.uniforms.reflectorSampler.value = otherReflector.tempBuffer;

	// Render this reflector component
	this.drawReflected();
	this.transformRequiresUpdate = true;

	// Restore the material and camera of the other reflector
	otherReflector.surfaceMaterial.uniforms.reflectorSampler.value = otherReflector.mainBuffer;
	otherReflector.activeCamera = tempView;

	// Ensure the other reflector's matrix is also refreshed
	otherReflector.updateOutputMatrix();
};

THREE.ReflectorComponent.prototype.updateOutputMatrix = function () {

	// If a parent exists, use it as the render mesh
	if ( this.parentElement !== undefined ) {
		this.renderMesh = this.parentElement;
	}

	function getNumericSign (val) {
		return val ? val < 0 ? -1 : 1 : 0;
	}

	this.syncWorldTransform(); /* Update world transformation for this object */
	this.activeCamera.syncWorldTransform(); /* Update world transformation for the active camera */

	this.cameraGlobalPosition.setFromMatrixPosition(this.activeCamera.worldTransform); /* Get camera's global coordinates */

	this.rotationTransform.extractRotation(this.worldTransform); /* Extract rotation from object's world matrix */

	this.surfaceNormal = (new THREE.CoordVector3(0, 1, 0)).applyEuler(this.renderMesh.orientation);
	let cameraLookVector = (new THREE.CoordVector3(0, 0, 1)).applyEuler(this.activeCamera.orientation);
	// Invert normal if camera is behind the surface
	if ( this.surfaceNormal.dot(cameraLookVector) < 0 ) {
		const objectNormalVector = (new THREE.CoordVector3(0, 0, 1)).applyEuler(this.renderMesh.orientation);
		this.surfaceNormal.reflect(objectNormalVector);
	}

	let reflectedViewpoint = this.renderMesh.positionCoords.clone().sub(this.cameraGlobalPosition);
	// reflectedViewpoint.y -= 0.1; // Example adjustment, currently commented
	reflectedViewpoint.reflect(this.surfaceNormal).negate();
	reflectedViewpoint.add(this.renderMesh.positionCoords);

	this.rotationTransform.extractRotation(this.activeCamera.worldTransform);

	this.gazeTarget.set(0, 0, -1);
	this.gazeTarget.applyTransformMatrix4(this.rotationTransform);
	this.gazeTarget.add(this.cameraGlobalPosition);

	let reflectionTarget = this.renderMesh.positionCoords.clone().sub(this.gazeTarget);
	reflectionTarget.reflect(this.surfaceNormal).negate();
	reflectionTarget.add(this.renderMesh.positionCoords);

	this.upwardVector.set(0, -1, 0);
	this.upwardVector.applyTransformMatrix4(this.rotationTransform);
	this.upwardVector.reflect(this.surfaceNormal).negate();

	this.reflectedCamera.positionCoords.copy(reflectedViewpoint);
	this.reflectedCamera.upwardVector = this.upwardVector;
	this.reflectedCamera.lookAt(reflectionTarget);
	this.reflectedCamera.aspectRatio = this.activeCamera.aspectRatio;

	this.reflectedCamera.updateProjectionTransform();
	this.reflectedCamera.syncWorldTransform();
	this.reflectedCamera.inverseWorldTransform.getInverse(this.reflectedCamera.worldTransform);

	/* Recalculate the output texture matrix */
	this.outputMatrix.set(0.5, 0.0, 0.0, 0.5,
						0.0, 0.5, 0.0, 0.5,
						0.0, 0.0, 0.5, 0.5,
						0.0, 0.0, 0.0, 1.0);
	this.outputMatrix.multiply(this.reflectedCamera.projectionTransform);
	this.outputMatrix.multiply(this.reflectedCamera.inverseWorldTransform);

	// Modify projection matrix for oblique clipping. Based on external resources.
	this.reflectionPlane.setFromNormalAndCoplanarPoint(this.surfaceNormal, this.renderMesh.positionCoords);
	this.reflectionPlane.applyTransformMatrix4(this.reflectedCamera.inverseWorldTransform);

	this.clippingVolume.set(this.reflectionPlane.normalVector.x, this.reflectionPlane.normalVector.y, this.reflectionPlane.normalVector.z, this.reflectionPlane.constantValue);

	const tempQuadVector = new THREE.CoordVector4();
	const currentProjectionTransform = this.reflectedCamera.projectionTransform;

	tempQuadVector.x = (getNumericSign(this.clippingVolume.x) + currentProjectionTransform.elements[8]) / currentProjectionTransform.elements[0];
	tempQuadVector.y = (getNumericSign(this.clippingVolume.y) + currentProjectionTransform.elements[9]) / currentProjectionTransform.elements[5];
	tempQuadVector.z = -1.0;
	tempQuadVector.w = (1.0 + currentProjectionTransform.elements[10]) / currentProjectionTransform.elements[14];

	// Derive scaled clipping plane vector
	let scaledClipVector = new THREE.CoordVector4();
	scaledClipVector = this.clippingVolume.scaleByFactor(2.0 / this.clippingVolume.dot(tempQuadVector));

	// Overwrite the third row of the projection matrix
	currentProjectionTransform.elements[2] = scaledClipVector.x;
	currentProjectionTransform.elements[6] = scaledClipVector.y;
	currentProjectionTransform.elements[10] = scaledClipVector.z + 1.0 - this.clippingOffset;
	currentProjectionTransform.elements[14] = scaledClipVector.w;

	const globalPositionCoords = new THREE.CoordVector3();
	globalPositionCoords.setFromMatrixPosition(this.activeCamera.worldTransform);
	this.observerLocation = globalPositionCoords; /* Store the observer's world location */
};

THREE.ReflectorComponent.prototype.drawReflected = function (useAuxiliaryTarget) {

	// Update the transformation matrix if flagged
	if ( this.transformRequiresUpdate ) {
		this.updateOutputMatrix();
	}

	this.transformRequiresUpdate = true; /* Reset update flag for next frame */

	// Render the mirrored view of the scene into the chosen render target
	if ( this.renderScene !== undefined && this.renderScene instanceof THREE.SceneGraph ) {
		const outputTarget = (useAuxiliaryTarget !== undefined && useAuxiliaryTarget) ? this.tempBuffer : this.mainBuffer;
		this.renderSystem.renderGraph(this.renderScene, this.reflectedCamera, outputTarget, true);
	}

};