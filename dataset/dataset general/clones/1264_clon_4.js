class THREE.ReflectorModule extends THREE.Object3D {
    constructor(graphicsController, primaryObserver, universeContainer, configuration = {}) {
        super();
        this.moduleID = 'reflector_element_' + this.id;

        const extractOrDefault = (val, def) => (val !== undefined ? val : def);

        this.transformUpdateRequired = true;

        const canvasWidth = extractOrDefault(configuration.textureWidth, 512);
        const canvasHeight = extractOrDefault(configuration.textureHeight, 512);
        this.clippingOffset = extractOrDefault(configuration.clipBias, 0.0);

        this.graphicsController = graphicsController;
        this.universeContainer = universeContainer;
        this.reflectiveSurface = new THREE.Plane();
        this.surfaceNormal = new THREE.Vector3(0, 0, 1);
        this.observerGlobalPosition = new THREE.Vector3();
        this.orientationTransform = new THREE.Matrix4();
        this.gazeTarget = new THREE.Vector3(0, 0, -1);
        this.cutPlane = new THREE.Vector4();

        if (primaryObserver instanceof THREE.PerspectiveCamera) {
            this.primaryObserver = primaryObserver;
        } else {
            this.primaryObserver = new THREE.PerspectiveCamera();
            console.warn(this.moduleID + ': Main observer is not a Perspective Camera! Using a default one.');
        }

        this.projectionMap = new THREE.Matrix4();

        this.reflectedObserver = this.primaryObserver.clone();

        this.mirrorElement = this;

        this.outputBuffer = new THREE.WebGLRenderTarget(canvasWidth, canvasHeight);
        this.scratchBuffer = new THREE.WebGLRenderTarget(canvasWidth, canvasHeight);

        if (!THREE.Math.isPowerOfTwo(canvasWidth) || !THREE.Math.isPowerOfTwo(canvasHeight)) {
            this.outputBuffer.generateMipmaps = false;
            this.scratchBuffer.generateMipmaps = false;
        }

        this.recomputeViewTransforms();
        this.executeRenderCycle();
    }

    static _createPlanarReflectionMatrix(planeNormal, pointOnPlane) {
        const n = planeNormal.clone().normalize();
        const d = -n.dot(pointOnPlane);

        const nx = n.x, ny = n.y, nz = n.z;

        const mat = new THREE.Matrix4();
        const el = mat.elements;

        el[0] = 1 - 2 * nx * nx; el[4] = -2 * nx * ny; el[8] = -2 * nx * nz; el[12] = -2 * nx * d;
        el[1] = -2 * ny * nx; el[5] = 1 - 2 * ny * ny; el[9] = -2 * ny * nz; el[13] = -2 * ny * d;
        el[2] = -2 * nz * nx; el[6] = -2 * nz * ny; el[10] = 1 - 2 * nz * nz; el[14] = -2 * nz * d;
        el[3] = 0;             el[7] = 0;             el[11] = 0;             el[15] = 1;

        return mat;
    }

    processInterReflections(adjacentReflector) {
        this.recomputeViewTransforms();
        this.transformUpdateRequired = false;

        const originalObserver = adjacentReflector.primaryObserver;
        adjacentReflector.primaryObserver = this.reflectedObserver;

        adjacentReflector.executeRenderCycle(true);
        adjacentReflector.material.uniforms.mirrorSampler.value = adjacentReflector.scratchBuffer;

        this.executeRenderCycle();
        this.transformUpdateRequired = true;

        adjacentReflector.material.uniforms.mirrorSampler.value = adjacentReflector.outputBuffer;
        adjacentReflector.primaryObserver = originalObserver;

        adjacentReflector.recomputeViewTransforms();
    }

    recomputeViewTransforms() {
        this.mirrorElement.updateMatrixWorld();
        this.primaryObserver.updateMatrixWorld();

        const localPlaneNormalReference = new THREE.Vector3(0, 0, 1);
        this.surfaceNormal.setFromMatrixColumn(this.mirrorElement.matrixWorld, 2).normalize();

        this.reflectiveSurface.setFromNormalAndCoplanarPoint(this.surfaceNormal, this.mirrorElement.position);

        this.primaryObserver.getWorldPosition(this.observerGlobalPosition);
        const observerToMirrorDirection = new THREE.Vector3().subVectors(this.observerGlobalPosition, this.mirrorElement.position);
        if (this.reflectiveSurface.normal.dot(observerToMirrorDirection) < 0) {
            this.reflectiveSurface.normal.negate();
            this.reflectiveSurface.constant *= -1;
        }
        this.surfaceNormal.copy(this.reflectiveSurface.normal);

        const reflectionTransform = THREE.ReflectorModule._createPlanarReflectionMatrix(
            this.reflectiveSurface.normal,
            this.mirrorElement.position
        );

        const primaryObserverWorldMatrix = this.primaryObserver.matrixWorld;
        const reflectedObserverWorldMatrix = new THREE.Matrix4().multiplyMatrices(reflectionTransform, primaryObserverWorldMatrix);

        const newReflectedPosition = new THREE.Vector3();
        const newReflectedQuaternion = new THREE.Quaternion();
        const newReflectedScale = new THREE.Vector3();

        reflectedObserverWorldMatrix.decompose(newReflectedPosition, newReflectedQuaternion, newReflectedScale);

        this.reflectedObserver.position.copy(newReflectedPosition);
        this.reflectedObserver.quaternion.copy(newReflectedQuaternion);
        this.reflectedObserver.scale.set(1, 1, 1);

        this.reflectedObserver.updateMatrixWorld(true);
        this.reflectedObserver.aspect = this.primaryObserver.aspect;
        this.reflectedObserver.updateProjectionMatrix();

        this.projectionMap.set(
            0.5, 0.0, 0.0, 0.5,
            0.0, 0.5, 0.0, 0.5,
            0.0, 0.0, 0.5, 0.5,
            0.0, 0.0, 0.0, 1.0
        );
        this.projectionMap.multiply(this.reflectedObserver.projectionMatrix);
        this.projectionMap.multiply(this.reflectedObserver.matrixWorldInverse);

        const tempReflectionPlane = this.reflectiveSurface.clone();
        tempReflectionPlane.applyMatrix4(this.reflectedObserver.matrixWorldInverse);

        this.cutPlane.set(
            tempReflectionPlane.normal.x,
            tempReflectionPlane.normal.y,
            tempReflectionPlane.normal.z,
            tempReflectionPlane.constant
        );

        const clipHelperVector = new THREE.Vector4();
        const perspectiveMatrix = this.reflectedObserver.projectionMatrix;

        const determineSign = (x) => (x > 0 ? 1 : x < 0 ? -1 : 0);

        clipHelperVector.x = (determineSign(this.cutPlane.x) + perspectiveMatrix.elements[8]) / perspectiveMatrix.elements[0];
        clipHelperVector.y = (determineSign(this.cutPlane.y) + perspectiveMatrix.elements[9]) / perspectiveMatrix.elements[5];
        clipHelperVector.z = -1.0;
        clipHelperVector.w = (1.0 + perspectiveMatrix.elements[10]) / perspectiveMatrix.elements[14];

        const scaledClipVector = this.cutPlane.clone().multiplyScalar(2.0 / this.cutPlane.dot(clipHelperVector));

        perspectiveMatrix.elements[2] = scaledClipVector.x;
        perspectiveMatrix.elements[6] = scaledClipVector.y;
        perspectiveMatrix.elements[10] = scaledClipVector.z + 1.0 - this.clippingOffset;
        perspectiveMatrix.elements[14] = scaledClipVector.w;
        
        const globalCoordinates = new THREE.Vector3();
        this.primaryObserver.getWorldPosition(globalCoordinates);
        this.observerEyePosition = globalCoordinates;
    }

    executeRenderCycle(intoScratchBuffer = false) {
        if (this.transformUpdateRequired) {
            this.recomputeViewTransforms();
        }

        this.transformUpdateRequired = true;

        if (this.universeContainer instanceof THREE.Scene) {
            const currentRenderTarget = intoScratchBuffer ? this.scratchBuffer : this.outputBuffer;
            this.graphicsController.render(this.universeContainer, this.reflectedObserver, currentRenderTarget, true);
        }
    }
}