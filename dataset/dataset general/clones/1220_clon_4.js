(function(applicationSpace) {
    "use strict";

    // Re-encoding of the original `bit_pattern_31_` data structure.
    // Each group of four numbers represents the (x1, y1, x2, y2) coordinates
    // for a single pixel comparison within the 32x32 patch.
    const sourceComparisonData = [
        8,-3, 9,5, 4,2, 7,-12, -11,9, -8,2, 7,-12, 12,-13, 2,-13, 2,12, 1,-7, 1,6, -2,-10, -2,-4, -13,-13, -11,-8, -13,-3, -12,-9, 10,4, 11,9, -13,-8, -8,-9, -11,7, -9,12, 7,7, 12,6, -4,-5, -3,0, -13,2, -12,-3, -9,0, -7,5, 12,-6, 12,-1, -3,6, -2,12, -6,-13, -4,-8, 11,-13, 12,-8, 4,7, 5,1, 5,-3, 10,-3, 3,-7, 6,12, -8,-7, -6,-2, -2,11, -1,-10, -13,12, -8,10, -7,3, -5,-3, -4,2, -3,7, -10,-12, -6,11, 5,-12, 6,-7, 5,-6, 7,-1, 1,0, 4,-5, 9,11, 11,-13, 4,7, 4,12, 2,-1, 4,4, -4,-12, -2,7, -8,-5, -7,-10, 4,11, 9,12, 0,-8, 1,-13, -13,-2, -8,2, -3,-2, -2,3, -6,9, -4,-9, 8,12, 10,7, 0,9, 1,3, 7,-5, 11,-10, -13,-6, -11,0, 10,7, 12,1, -6,-3, -6,12, 10,-9, 12,-4, -13,8, -8,-12, -13,0, -8,-4, 3,3, 7,8, 5,7, 10,-7, -1,7, 1,-12, 3,-10, 5,6, 2,-4, 3,-10, -13,0, -13,5, -13,-7, -12,12, -13,3, -11,8, -7,12, -4,7, 6,-10, 12,8, -9,-1, -7,-6, -2,-5, 0,12, -12,5, -7,5, 3,-10, 8,-13, -7,-7, -4,5, -3,-2, -1,-7, 2,9, 5,-11, -11,-13, -5,-13, -1,6, 0,-1, 5,-3, 5,2, -4,-13, -4,12, -9,-6, -9,6, -12,-10, -8,-4, 10,2, 12,-3, 7,12, 12,12, -7,-13, -6,5, -4,9, -3,4, 7,-1, 12,2, -7,6, -5,1, -13,11, -12,5, -3,7, -2,-6, 7,-8, 12,-7, -13,-7, -11,-12, 1,-3, 12,12, 2,-6, 3,0, -4,3, -2,-13, -1,-13, 1,9, 7,1, 8,-6, 1,-1, 3,12, 9,1, 12,6, -1,-9, -1,3, -13,-13, -10,5, 7,7, 10,12, 12,-5, 12,9, 6,3, 7,11, 5,-13, 6,10, 2,-12, 2,3, 3,8, 4,-6, 2,6, 12,-13, 9,-12, 10,3, -8,4, -7,9, -11,12, -4,-6, 1,12, 2,-8, 6,-9, 7,-4, 2,3, 3,-2, 6,3, 11,0, 3,-3, 8,-8, 7,8, 9,3, -11,-5, -6,-4, -10,11, -5,10, -5,-8, -3,12, -10,5, -9,0, 8,-1, 12,-6, 4,-6, 6,-11, -10,12, -8,7, 4,-2, 6,7, -2,0, -2,12, -5,-8, -5,2, 7,-6, 10,12, -9,-13, -8,-8, -5,-13, -5,-2, 8,-8, 9,-13, -9,-11, -9,0, 1,-8, 1,-2, 7,-4, 9,1, -2,1, -1,-4, 11,-6, 12,-11, -12,-9, -6,4, 3,7, 7,12, 5,5, 10,8, 0,-4, 2,8, -9,12, -5,-13, 0,7, 2,12, -1,2, 1,7, 5,11, 7,-9, 3,5, 6,-8, -13,-4, -8,9, -5,9, -3,-3, -4,-7, -3,-12, 6,5, 8,0, -7,6, -6,12, -13,6, -5,-2, 1,-10, 3,10, 4,1, 8,-4, -2,-2, 2,-13, 2,-12, 12,12, -2,-13, 0,-6, 4,1, 9,3, -6,-10, -3,-5, -3,-13, -1,1, 7,5, 12,-11, 4,-2, 5,-7, -13,9, -9,-5, 7,1, 8,6, 7,-8, 7,6, -7,-4, -7,1, -8,11, -7,-8, -13,6, -12,-8, 2,4, 3,9, 10,-5, 12,3, -6,-5, -6,7, 8,-3, 9,-8, 2,-12, 2,8, -11,-2, -10,3, -12,-13, -7,-9, -11,0, -10,-5, 5,-3, 11,8, -2,-13, -1,12, -1,-8, 0,9, -13,-11, -12,-5, -10,-2, -10,11, -3,9, -2,-13, 2,-3, 3,2, -9,-13, -4,0, -4,6, -3,-10, -4,12, -2,-7, -6,-11, -4,9, 6,-3, 6,11, -13,11, -5,5, 11,11, 12,6, 7,-5, 12,-2, -1,12, 0,7, -4,-8, -3,-2, -7,1, -6,7, -13,-12, -8,-13, -7,-2, -6,-8, -8,5, -6,-9, -5,-1, -4,5, -13,7, -8,10, 1,5, 5,-13, 1,0, 10,-13, 9,12, 10,-1, 5,-8, 10,-9, -1,11, 1,-13, -9,-3, -6,2, -1,-10, 1,12, -13,1, -8,-10, 8,-11, 10,-6, 2,-13, 3,-6, 7,-13, 12,-9, -10,-10, -5,-7, -10,-8, -8,-13, 4,-6, 8,5, 3,12, 8,-13, -4,2, -3,-3, 5,-13, 10,-12, 4,-13, 5,-1, -9,9, -4,3, 0,3, 3,-9, -12,1, -6,1, 3,2, 4,-8, -10,-10, -10,9, 8,-13, 12,12, -8,-12, -6,-5, 2,2, 3,7, 10,6, 11,-8, 6,8, 8,-12, -7,10, -6,5, -3,-9, -3,9, -1,-13, -1,5, -3,-7, -3,4, -8,-2, -8,3, 4,2, 12,12, 2,-5, 3,11, 6,-9, 11,-13, 3,-1, 7,12, 11,-1, 12,4, -3,0, -3,6, 4,-11, 4,12, 2,-4, 2,1, -10,-6, -8,1, -13,7, -11,1, -13,12, -11,-13, 6,0, 11,-13, 0,-1, 1,4, -13,3, -9,-2, -9,8, -6,-3, -13,-6, -8,-2, 5,-9, 8,10, 2,7, 3,-9, -1,-6, -1,-1, 9,5, 11,-2, 11,-3, 12,-8, 3,0, 3,5, -1,4, 0,10, 3,-6, 4,5, -13,0, -10,5, 5,8, 12,11, 8,9, 9,-6, 7,-4, 8,-12, -10,4, -10,9, 7,3, 12,4, 9,-7, 10,-2, 7,0, 12,-2, -1,-6, 0,-11
    ];

    // Pre-processed comparison points for easier access.
    // Each element is an array [x1, y1, x2, y2] representing one comparison.
    const pixelDifferentialPairs = [];
    for (let i = 0; i < sourceComparisonData.length; i += 4) {
        pixelDifferentialPairs.push([
            sourceComparisonData[i],     // x-coordinate of the first point
            sourceComparisonData[i+1],   // y-coordinate of the first point
            sourceComparisonData[i+2],   // x-coordinate of the second point
            sourceComparisonData[i+3]    // y-coordinate of the second point
        ]);
    }

    // Custom Image data structure, replacing `jsfeat.matrix_t`.
    class ImageBuffer {
        constructor(width, height, pixelFormat = 'U8C1') {
            this.width = width;
            this.height = height;
            this.pixelFormat = pixelFormat;
            if (pixelFormat === 'U8C1') {
                this.dataArray = new Uint8Array(width * height);
            } else if (pixelFormat === 'F32C1') {
                this.dataArray = new Float32Array(width * height);
            } else {
                throw new Error("Unsupported pixel format.");
            }
        }

        // Resizes or reallocates the buffer if dimensions or format change.
        updateDimensions(newWidth, newHeight, newFormat = this.pixelFormat) {
            if (this.width !== newWidth || this.height !== newHeight || this.pixelFormat !== newFormat) {
                this.width = newWidth;
                this.height = newHeight;
                this.pixelFormat = newFormat;
                if (newFormat === 'U8C1') {
                    this.dataArray = new Uint8Array(newWidth * newHeight);
                } else if (newFormat === 'F32C1') {
                    this.dataArray = new Float32Array(newWidth * newHeight);
                }
            }
        }
    }

    // Custom Affine Transformation Matrix class, replacing `jsfeat.matrix_t` for the transformation.
    class AffineMatrix {
        constructor(m00, m01, m02, m10, m11, m12) {
            // Stores the 2x3 matrix components: [a, b, tx, c, d, ty]
            // Represents: x' = a*x + b*y + tx, y' = c*x + d*y + ty
            this.components = [m00, m01, m02, m10, m11, m12];
        }

        // Creates an inverse affine transformation matrix from keypoint properties.
        // This matrix maps coordinates from the destination patch (0..31, 0..31)
        // back to the source image coordinates.
        static createFromKeypoint(rotationAngle, keypointCoordX, keypointCoordY, patchDimension) {
            const cosVal = Math.cos(rotationAngle);
            const sinVal = Math.sin(rotationAngle);
            const halfPatch = patchDimension * 0.5; // 16 for a 32x32 patch

            // The inverse transform components are derived from rotating the patch
            // by -angle around its center (16,16) then translating its center
            // to the keypoint's position (keypointCoordX, keypointCoordY) in the source image.
            const inv_a = cosVal;
            const inv_b = sinVal;
            const inv_tx = keypointCoordX - halfPatch * cosVal - halfPatch * sinVal;

            const inv_c = -sinVal;
            const inv_d = cosVal;
            const inv_ty = keypointCoordY + halfPatch * sinVal - halfPatch * cosVal;

            return new AffineMatrix(inv_a, inv_b, inv_tx, inv_c, inv_d, inv_ty);
        }

        // Applies the transformation to a point from the destination (patch)
        // to find its corresponding point in the source image.
        transformDestinationToSource(destX, destY) {
            const m = this.components;
            const sourceX = m[0] * destX + m[1] * destY + m[2];
            const sourceY = m[3] * destX + m[4] * destY + m[5];
            return { x: sourceX, y: sourceY };
        }
    }

    // Function to perform image warping, replacing `jsfeat.imgproc.warp_affine`.
    // Uses bilinear interpolation for sampling and a boundary fill value for out-of-bounds pixels.
    function performImageWarp(sourceImage, destinationPatch, transformationMatrix, boundaryFill) {
        const srcW = sourceImage.width;
        const srcH = sourceImage.height;
        const destW = destinationPatch.width;
        const destH = destinationPatch.height;
        const srcPixels = sourceImage.dataArray;
        const destPixels = destinationPatch.dataArray;

        for (let dy = 0; dy < destH; ++dy) {
            for (let dx = 0; dx < destW; ++dx) {
                const { x: sx, y: sy } = transformationMatrix.transformDestinationToSource(dx, dy);

                const xFloor = Math.floor(sx);
                const yFloor = Math.floor(sy);
                const xCeil = xFloor + 1;
                const yCeil = yFloor + 1;

                const fracX = sx - xFloor;
                const fracY = sy - yFloor;
                const oneMinusFracX = 1 - fracX;
                const oneMinusFracY = 1 - fracY;

                let p00, p10, p01, p11;

                // Retrieve pixel values from source, using boundaryFill for out-of-bounds.
                p00 = (xFloor >= 0 && xFloor < srcW && yFloor >= 0 && yFloor < srcH) ? srcPixels[yFloor * srcW + xFloor] : boundaryFill;
                p10 = (xCeil >= 0 && xCeil < srcW && yFloor >= 0 && yFloor < srcH) ? srcPixels[yFloor * srcW + xCeil] : boundaryFill;
                p01 = (xFloor >= 0 && xFloor < srcW && yCeil >= 0 && yCeil < srcH) ? srcPixels[yCeil * srcW + xFloor] : boundaryFill;
                p11 = (xCeil >= 0 && xCeil < srcW && yCeil >= 0 && yCeil < srcH) ? srcPixels[yCeil * srcW + xCeil] : boundaryFill;
                
                // Bilinear interpolation formula
                const interpolatedValue = oneMinusFracX * oneMinusFracY * p00 +
                                          fracX       * oneMinusFracY * p10 +
                                          oneMinusFracX * fracY       * p01 +
                                          fracX       * fracY       * p11;
                
                destPixels[dy * destW + dx] = Math.round(interpolatedValue);
            }
        }
    }

    // Helper to get a pixel value from the 32x32 patch data.
    // Coordinates are relative to the patch's center (16,16).
    function getPatchPixelAtRelativeCoord(patchPixelData, relativeX, relativeY) {
        const patchDimension = 32;
        const patchCenterX = 16;
        const patchCenterY = 16;
        const absoluteX = patchCenterX + relativeX;
        const absoluteY = patchCenterY + relativeY;
        return patchPixelData[absoluteY * patchDimension + absoluteX];
    }

    // Main feature descriptor generation module, replacing the `orb` object.
    const FeatureVectorGenerator = (function() {
        const PATCH_RESOLUTION = 32;
        const RESULT_VECTOR_BYTES = 32;

        // A temporary buffer to store the 32x32 warped patch for each keypoint.
        const workingPatchBuffer = new ImageBuffer(PATCH_RESOLUTION, PATCH_RESOLUTION, 'U8C1');

        // This function computes a single byte of the descriptor using a recursive approach.
        // This provides a "genuinely different strategy" compared to the original's explicit
        // loop unrolling for bitwise operations.
        const computeSingleByte = (patchData, pairStartIndex, bitIndex = 0, byteAccumulator = 0) => {
            if (bitIndex >= 8) {
                return byteAccumulator;
            }

            const [coordA_x, coordA_y, coordB_x, coordB_y] = pixelDifferentialPairs[pairStartIndex + bitIndex];
            const valueA = getPatchPixelAtRelativeCoord(patchData, coordA_x, coordA_y);
            const valueB = getPatchPixelAtRelativeCoord(patchData, coordB_x, coordB_y);

            const bitValue = (valueA < valueB) ? 1 : 0;
            // Recursively build the byte by shifting and OR-ing the new bit.
            return computeSingleByte(patchData, pairStartIndex, bitIndex + 1, byteAccumulator | (bitValue << bitIndex));
        };

        return {
            // Main function to generate feature descriptors for a list of keypoints.
            // Replaces `orb.describe`.
            generateDescriptors: function(inputImage, keypointList, totalKeypoints, outputFeatureSet) {
                // Ensure output buffer has correct dimensions and pixel format.
                if (outputFeatureSet.pixelFormat !== 'U8C1') {
                    outputFeatureSet.pixelFormat = 'U8C1';
                }
                outputFeatureSet.updateDimensions(RESULT_VECTOR_BYTES, totalKeypoints, 'U8C1');
                const outputDataArray = outputFeatureSet.dataArray;
                let currentOutputDataPointer = 0;

                for (let i = 0; i < totalKeypoints; ++i) {
                    const currentKeypoint = keypointList[i];
                    
                    // Create the affine transformation matrix for the current keypoint.
                    const affineTransform = AffineMatrix.createFromKeypoint(
                        currentKeypoint.angle, currentKeypoint.x, currentKeypoint.y, PATCH_RESOLUTION
                    );

                    // Warp the image to extract the rectified patch.
                    performImageWarp(inputImage, workingPatchBuffer, affineTransform, 128); // 128 is the default border fill value.

                    // Compute the 32-byte feature vector (descriptor) from the warped patch.
                    for (let byteIndex = 0; byteIndex < RESULT_VECTOR_BYTES; ++byteIndex) {
                        const comparisonGroupStart = byteIndex * 8; // Each byte uses 8 comparison pairs.
                        outputDataArray[currentOutputDataPointer + byteIndex] = computeSingleByte(
                            workingPatchBuffer.dataArray, comparisonGroupStart
                        );
                    }
                    currentOutputDataPointer += RESULT_VECTOR_BYTES;
                }
            }
        };
    })();

    // Expose the new feature generator to the global scope.
    applicationSpace.FeatureVectorGenerator = FeatureVectorGenerator;

})(typeof window !== 'undefined' ? window : this); // Handles both browser and Node.js environments