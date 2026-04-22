"use strict";

const RADIAN_CONVERSION_FACTOR = Math.PI / 180.0;

// Utility to compute vector magnitude from an object with x, y, z properties
function calculateVectorMagnitude(vectorObject) {
    return Math.sqrt(vectorObject.x * vectorObject.x + vectorObject.y * vectorObject.y + vectorObject.z * vectorObject.z);
}

// Utility to build an asymmetric projection matrix
function assembleAsymmetricProjection(hScale, hBias, vScale, vBias, handednessFactor, nearClipPlane, farClipPlane) {
    const transformEntity = new THREE.Matrix4();
    const elementArray = transformEntity.elements;

    // Define the matrix elements in row-major order first
    const matrixSchema = [
        [hScale, 0.0, hBias * handednessFactor, 0.0],
        [0.0, vScale, -vBias * handednessFactor, 0.0],
        [0.0, 0.0, farClipPlane / (nearClipPlane - farClipPlane) * -handednessFactor, (farClipPlane * nearClipPlane) / (nearClipPlane - farClipPlane)],
        [0.0, 0.0, handednessFactor, 0.0]
    ];

    // Populate the column-major 'elements' array with the transpose of the row-major schema
    // A subsequent transpose() will then correctly align the matrix.
    for (let rowIdx = 0; rowIdx < 4; rowIdx++) {
        for (let colIdx = 0; colIdx < 4; colIdx++) {
            elementArray[colIdx * 4 + rowIdx] = matrixSchema[rowIdx][colIdx];
        }
    }

    transformEntity.transpose();
    return transformEntity;
}

class StereoViewComposer {
    constructor(visualizerContext, displaySystemInterface) {
        this.visualizer = visualizerContext;
        this.displaySystem = displaySystemInterface;

        this.interocularDistanceHalf = 0;
        this.leftEyeField = null;
        this.rightEyeField = null;

        this.prepareDisplayContext();
    }

    prepareDisplayContext() {
        const eyeOffsetVector = this.displaySystem.getEyeTranslation("left");
        this.interocularDistanceHalf = calculateVectorMagnitude(eyeOffsetVector);
        this.leftEyeField = this.displaySystem.getRecommendedEyeFieldOfView("left");
        this.rightEyeField = this.displaySystem.getRecommendedEyeFieldOfView("right");
    }

    computeNormalizedScaleOffset(viewConeDefinition) {
        const horizontalScale = 2.0 / (viewConeDefinition.leftTan + viewConeDefinition.rightTan);
        const horizontalBias = (viewConeDefinition.leftTan - viewConeDefinition.rightTan) * horizontalScale * 0.5;
        const verticalScale = 2.0 / (viewConeDefinition.upTan + viewConeDefinition.downTan);
        const verticalBias = (viewConeDefinition.upTan - viewConeDefinition.downTan) * verticalScale * 0.5;
        return {
            scalingFactors: [horizontalScale, verticalScale],
            offsetValues: [horizontalBias, verticalBias]
        };
    }

    constructProjectionTransform(tangentCone, orientationPositive = true, nearClippingPlane = 0.01, farClippingPlane = 10000.0) {
        const handednessScalar = orientationPositive ? -1.0 : 1.0;
        const ndcFactors = this.computeNormalizedScaleOffset(tangentCone);

        return assembleAsymmetricProjection(
            ndcFactors.scalingFactors[0],
            ndcFactors.offsetValues[0],
            ndcFactors.scalingFactors[1],
            ndcFactors.offsetValues[1],
            handednessScalar,
            nearClippingPlane,
            farClippingPlane
        );
    }

    deriveProjectionMatrix(fieldOfViewDegrees, orientationPositive = true, nearClippingPlane = 0.01, farClippingPlane = 10000.0) {
        const tangentAngles = {
            upTan: Math.tan(fieldOfViewDegrees.upDegrees * RADIAN_CONVERSION_FACTOR),
            downTan: Math.tan(fieldOfViewDegrees.downDegrees * RADIAN_CONVERSION_FACTOR),
            leftTan: Math.tan(fieldOfViewDegrees.leftDegrees * RADIAN_CONVERSION_FACTOR),
            rightTan: Math.tan(fieldOfViewDegrees.rightDegrees * RADIAN_CONVERSION_FACTOR)
        };
        return this.constructProjectionTransform(tangentAngles, orientationPositive, nearClippingPlane, farClippingPlane);
    }

    presentFrame(displayEnvironment, viewpointCamera) {
        const { position, quaternion, near, far } = viewpointCamera;

        const leftViewer = viewpointCamera.clone();
        const rightViewer = viewpointCamera.clone();

        leftViewer.projectionMatrix = this.deriveProjectionMatrix(this.leftEyeField, true, near, far);
        rightViewer.projectionMatrix = this.deriveProjectionMatrix(this.rightEyeField, true, near, far);

        const viewAxis = new THREE.Vector3(1, 0, 0);
        viewAxis.applyQuaternion(quaternion);

        // Functional approach for position adjustment
        const adjustViewerPosition = (viewerInstance, directionVector, separationDistance, operationType) => {
            const adjustedDirection = directionVector.clone().multiplyScalar(separationDistance);
            operationType === 'subtract' ? viewerInstance.position.sub(adjustedDirection) : viewerInstance.position.add(adjustedDirection);
        };

        adjustViewerPosition(leftViewer, viewAxis, this.interocularDistanceHalf, 'subtract');
        adjustViewerPosition(rightViewer, viewAxis, this.interocularDistanceHalf, 'add');

        this.visualizer.enableScissorTest(true);

        const canvasWidth = this.visualizer.domElement.width;
        const canvasHeight = this.visualizer.domElement.height;
        const halfCanvasWidth = canvasWidth / 2;

        // Encapsulate rendering for each eye
        const renderEyeView = (viewerInstance, xPosition) => {
            this.visualizer.setViewport(xPosition, 0, halfCanvasWidth, canvasHeight);
            this.visualizer.setScissor(xPosition, 0, halfCanvasWidth, canvasHeight);
            this.visualizer.render(displayEnvironment, viewerInstance);
        };

        renderEyeView(leftViewer, 0);
        renderEyeView(rightViewer, halfCanvasWidth);
    }
}

THREE.StereoViewComposer = StereoViewComposer;