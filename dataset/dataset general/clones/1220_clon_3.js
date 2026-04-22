/**
 * @file Feature descriptor computation module.
 * @author Altered by a different developer for demonstration purposes.
 *
 * Based on an initial ORB descriptor implementation, which itself
 * was adapted from OpenCV by Eugene Zatepyakin.
 * Key concepts from OpenCV authors Ethan Rublee, Vincent Rabaud, and Gary Bradski are retained.
 */

(function(processingContext) {
    "use strict"; // Enforce strict mode for cleaner code.

    // Define a utility for extracting binary feature patterns.
    var patternDescriptor = (function() {

        // Pre-computed sampling point pairs for binary comparisons.
        // Each group of four integers (x1, y1, x2, y2) defines two points
        // whose pixel intensities are compared to generate a bit in the descriptor.
        var samplingCoordinates = new Int32Array([
            8,-3, 9,5,
            4,2, 7,-12,
            -11,9, -8,2,
            7,-12, 12,-13,
            2,-13, 2,12,
            1,-7, 1,6,
            -2,-10, -2,-4,
            -13,-13, -11,-8,
            -13,-3, -12,-9,
            10,4, 11,9,
            -13,-8, -8,-9,
            -11,7, -9,12,
            7,7, 12,6,
            -4,-5, -3,0,
            -13,2, -12,-3,
            -9,0, -7,5,
            12,-6, 12,-1,
            -3,6, -2,12,
            -6,-13, -4,-8,
            11,-13, 12,-8,
            4,7, 5,1,
            5,-3, 10,-3,
            3,-7, 6,12,
            -8,-7, -6,-2,
            -2,11, -1,-10,
            -13,12, -8,10,
            -7,3, -5,-3,
            -4,2, -3,7,
            -10,-12, -6,11,
            5,-12, 6,-7,
            5,-6, 7,-1,
            1,0, 4,-5,
            9,11, 11,-13,
            4,7, 4,12,
            2,-1, 4,4,
            -4,-12, -2,7,
            -8,-5, -7,-10,
            4,11, 9,12,
            0,-8, 1,-13,
            -13,-2, -8,2,
            -3,-2, -2,3,
            -6,9, -4,-9,
            8,12, 10,7,
            0,9, 1,3,
            7,-5, 11,-10,
            -13,-6, -11,0,
            10,7, 12,1,
            -6,-3, -6,12,
            10,-9, 12,-4,
            -13,8, -8,-12,
            -13,0, -8,-4,
            3,3, 7,8,
            5,7, 10,-7,
            -1,7, 1,-12,
            3,-10, 5,6,
            2,-4, 3,-10,
            -13,0, -13,5,
            -13,-7, -12,12,
            -13,3, -11,8,
            -7,12, -4,7,
            6,-10, 12,8,
            -9,-1, -7,-6,
            -2,-5, 0,12,
            -12,5, -7,5,
            3,-10, 8,-13,
            -7,-7, -4,5,
            -3,-2, -1,-7,
            2,9, 5,-11,
            -11,-13, -5,-13,
            -1,6, 0,-1,
            5,-3, 5,2,
            -4,-13, -4,12,
            -9,-6, -9,6,
            -12,-10, -8,-4,
            10,2, 12,-3,
            7,12, 12,12,
            -7,-13, -6,5,
            -4,9, -3,4,
            7,-1, 12,2,
            -7,6, -5,1,
            -13,11, -12,5,
            -3,7, -2,-6,
            7,-8, 12,-7,
            -13,-7, -11,-12,
            1,-3, 12,12,
            2,-6, 3,0,
            -4,3, -2,-13,
            -1,-13, 1,9,
            7,1, 8,-6,
            1,-1, 3,12,
            9,1, 12,6,
            -1,-9, -1,3,
            -13,-13, -10,5,
            7,7, 10,12,
            12,-5, 12,9,
            6,3, 7,11,
            5,-13, 6,10,
            2,-12, 2,3,
            3,8, 4,-6,
            2,6, 12,-13,
            9,-12, 10,3,
            -8,4, -7,9,
            -11,12, -4,-6,
            1,12, 2,-8,
            6,-9, 7,-4,
            2,3, 3,-2,
            6,3, 11,0,
            3,-3, 8,-8,
            7,8, 9,3,
            -11,-5, -6,-4,
            -10,11, -5,10,
            -5,-8, -3,12,
            -10,5, -9,0,
            8,-1, 12,-6,
            4,-6, 6,-11,
            -10,12, -8,7,
            4,-2, 6,7,
            -2,0, -2,12,
            -5,-8, -5,2,
            7,-6, 10,12,
            -9,-13, -8,-8,
            -5,-13, -5,-2,
            8,-8, 9,-13,
            -9,-11, -9,0,
            1,-8, 1,-2,
            7,-4, 9,1,
            -2,1, -1,-4,
            11,-6, 12,-11,
            -12,-9, -6,4,
            3,7, 7,12,
            5,5, 10,8,
            0,-4, 2,8,
            -9,12, -5,-13,
            0,7, 2,12,
            -1,2, 1,7,
            5,11, 7,-9,
            3,5, 6,-8,
            -13,-4, -8,9,
            -5,9, -3,-3,
            -4,-7, -3,-12,
            6,5, 8,0,
            -7,6, -6,12,
            -13,6, -5,-2,
            1,-10, 3,10,
            4,1, 8,-4,
            -2,-2, 2,-13,
            2,-12, 12,12,
            -2,-13, 0,-6,
            4,1, 9,3,
            -6,-10, -3,-5,
            -3,-13, -1,1,
            7,5, 12,-11,
            4,-2, 5,-7,
            -13,9, -9,-5,
            7,1, 8,6,
            7,-8, 7,6,
            -7,-4, -7,1,
            -8,11, -7,-8,
            -13,6, -12,-8,
            2,4, 3,9,
            10,-5, 12,3,
            -6,-5, -6,7,
            8,-3, 9,-8,
            2,-12, 2,8,
            -11,-2, -10,3,
            -12,-13, -7,-9,
            -11,0, -10,-5,
            5,-3, 11,8,
            -2,-13, -1,12,
            -1,-8, 0,9,
            -13,-11, -12,-5,
            -10,-2, -10,11,
            -3,9, -2,-13,
            2,-3, 3,2,
            -9,-13, -4,0,
            -4,6, -3,-10,
            -4,12, -2,-7,
            -6,-11, -4,9,
            6,-3, 6,11,
            -13,11, -5,5,
            11,11, 12,6,
            7,-5, 12,-2,
            -1,12, 0,7,
            -4,-8, -3,-2,
            -7,1, -6,7,
            -13,-12, -8,-13,
            -7,-2, -6,-8,
            -8,5, -6,-9,
            -5,-1, -4,5,
            -13,7, -8,10,
            1,5, 5,-13,
            1,0, 10,-13,
            9,12, 10,-1,
            5,-8, 10,-9,
            -1,11, 1,-13,
            -9,-3, -6,2,
            -1,-10, 1,12,
            -13,1, -8,-10,
            8,-11, 10,-6,
            2,-13, 3,-6,
            7,-13, 12,-9,
            -10,-10, -5,-7,
            -10,-8, -8,-13,
            4,-6, 8,5,
            3,12, 8,-13,
            -4,2, -3,-3,
            5,-13, 10,-12,
            4,-13, 5,-1,
            -9,9, -4,3,
            0,3, 3,-9,
            -12,1, -6,1,
            3,2, 4,-8,
            -10,-10, -10,9,
            8,-13, 12,12,
            -8,-12, -6,-5,
            2,2, 3,7,
            10,6, 11,-8,
            6,8, 8,-12,
            -7,10, -6,5,
            -3,-9, -3,9,
            -1,-13, -1,5,
            -3,-7, -3,4,
            -8,-2, -8,3,
            4,2, 12,12,
            2,-5, 3,11,
            6,-9, 11,-13,
            3,-1, 7,12,
            11,-1, 12,4,
            -3,0, -3,6,
            4,-11, 4,12,
            2,-4, 2,1,
            -10,-6, -8,1,
            -13,7, -11,1,
            -13,12, -11,-13,
            6,0, 11,-13,
            0,-1, 1,4,
            -13,3, -9,-2,
            -9,8, -6,-3,
            -13,-6, -8,-2,
            5,-9, 8,10,
            2,7, 3,-9,
            -1,-6, -1,-1,
            9,5, 11,-2,
            11,-3, 12,-8,
            3,0, 3,5,
            -1,4, 0,10,
            3,-6, 4,5,
            -13,0, -10,5,
            5,8, 12,11,
            8,9, 9,-6,
            7,-4, 8,-12,
            -10,4, -10,9,
            7,3, 12,4,
            9,-7, 10,-2,
            7,0, 12,-2,
            -1,-6, 0,-11
        ]);

        // Matrix for affine transformations, 3x3 single-channel float.
        var affineTransformMatrix = new processingContext.matrix_t(3, 3, processingContext.F32_t|processingContext.C1_t);
        // Buffer to hold the rectified (rotated and scaled) image patch.
        // It's a 32x32 single-channel unsigned 8-bit integer matrix.
        var rectifiedPatchBuffer = new processingContext.matrix_t(32, 32, processingContext.U8_t|processingContext.C1_t);

        /**
         * Aligns and extracts a square patch from the source image based on keypoint orientation and position.
         * The extracted patch is stored in the target buffer after rotation and translation.
         * @param {object} sourceImage - The input image matrix (e.g., jsfeat.matrix_t).
         * @param {object} targetBuffer - The output buffer matrix for the rectified patch.
         * @param {number} rotationAngle - The rotation angle in radians for the patch.
         * @param {number} patchX - The X-coordinate of the patch center in the source image.
         * @param {number} patchY - The Y-coordinate of the patch center in the source image.
         * @param {number} patchSideLength - The side length of the square patch (e.g., 32).
         */
        var alignAndExtractPatch = function(sourceImage, targetBuffer, rotationAngle, patchX, patchY, patchSideLength) {
            // Guard clause: ensure patchSideLength is valid to avoid division by zero or negative sizes.
            if (patchSideLength <= 0) {
                console.warn("Patch side length must be positive. Skipping patch rectification.");
                return;
            }

            const cosVal = Math.cos(rotationAngle);
            const sinVal = Math.sin(rotationAngle);

            // Construct the 2x3 affine transformation matrix (stored in a 3x3 matrix `affineTransformMatrix`).
            // This matrix combines rotation and translation to center the rotated patch.
            const matrixData = affineTransformMatrix.data;
            const halfSide = patchSideLength * 0.5;

            matrixData[0] = cosVal;
            matrixData[1] = -sinVal;
            matrixData[2] = (-cosVal + sinVal) * halfSide + patchX; // Translation X component

            matrixData[3] = sinVal;
            matrixData[4] = cosVal;
            matrixData[5] = (-sinVal - cosVal) * halfSide + patchY; // Translation Y component

            // Use jsfeat's image processing utility to apply the affine warp.
            // The last argument (128) is the border fill value for pixels outside the source.
            processingContext.imgproc.warp_affine(sourceImage, targetBuffer, affineTransformMatrix, 128);
        };

        return {
            /**
             * Computes binary descriptors for a set of keypoints on an input image.
             * @param {object} inputSource - The source image matrix (e.g., jsfeat.matrix_t).
             * @param {Array<object>} keypoints - An array of keypoint objects, each with x, y, and angle properties.
             * @param {number} numKeypoints - The number of keypoints to process.
             * @param {object} outputDescriptors - The jsfeat.matrix_t object to store the computed descriptors.
             *                                   It will be resized/allocated as U8_t, 1 channel, DESCRIPTOR_BYTE_COUNT columns.
             */
            computeDescriptors: function(inputSource, keypoints, numKeypoints, outputDescriptors) {
                // Number of bytes per descriptor. Each byte holds 8 binary comparisons.
                const DESCRIPTOR_BYTE_COUNT = 32;
                // Side length of the square patch to be sampled.
                const PATCH_DIM = 32;
                // Offset from the start of the patch data to its center pixel (16,16 for a 32x32 patch).
                const PATCH_CENTER_OFFSET = (PATCH_DIM / 2) * PATCH_DIM + (PATCH_DIM / 2);

                let kptIdx = 0; // Keypoint index
                let byteIdx = 0; // Byte index within a descriptor
                let currentBitVal = 0; // Value for the current byte (accumulates 8 bits)
                let coordX = 0.0, coordY = 0.0, kptAngle = 0.0; // Keypoint properties
                let pixelVal1 = 0, pixelVal2 = 0; // Intensities of comparison points

                // Data buffer for the rectified patch.
                const patchPixelData = rectifiedPatchBuffer.data;
                // Index into the samplingCoordinates array.
                let samplingPatternOffset = 0;

                // Early exit if no keypoints to process.
                if (numKeypoints <= 0) {
                    console.log("No keypoints provided for descriptor computation.");
                    return;
                }
                // Basic validation for keypoints array type.
                if (!Array.isArray(keypoints)) {
                    console.error("Keypoints parameter must be an array.");
                    return;
                }
                // Basic validation for keypoints array length.
                if (keypoints.length < numKeypoints) {
                    console.warn(`Number of keypoints specified (${numKeypoints}) exceeds array length (${keypoints.length}). Adjusting to actual length.`);
                    numKeypoints = keypoints.length;
                }


                // Ensure the outputDescriptors matrix is correctly configured.
                // If it's not U8_t or not the right size, reallocate.
                if (!(outputDescriptors.type & processingContext.U8_t) ||
                    outputDescriptors.cols !== DESCRIPTOR_BYTE_COUNT ||
                    outputDescriptors.rows < numKeypoints ||
                    outputDescriptors.channel !== 1)
                {
                    outputDescriptors.type = processingContext.U8_t;
                    outputDescriptors.cols = DESCRIPTOR_BYTE_COUNT;
                    outputDescriptors.rows = numKeypoints;
                    outputDescriptors.channel = 1;
                    outputDescriptors.allocate();
                } else if (outputDescriptors.rows > numKeypoints) {
                    // If it's too large, resize down
                    outputDescriptors.resize(DESCRIPTOR_BYTE_COUNT, numKeypoints, 1);
                }

                const descriptorRawData = outputDescriptors.data;
                let currentDescriptorByteOffset = 0;

                // Loop through each keypoint to compute its descriptor.
                for (kptIdx = 0; kptIdx < numKeypoints; ++kptIdx) {
                    // Retrieve keypoint properties.
                    const currentKeypoint = keypoints[kptIdx];
                    coordX = currentKeypoint.x;
                    coordY = currentKeypoint.y;
                    kptAngle = currentKeypoint.angle;

                    // Align and extract the patch centered at the keypoint, rotated by its angle.
                    alignAndExtractPatch(inputSource, rectifiedPatchBuffer, kptAngle, coordX, coordY, PATCH_DIM);

                    // Reset sampling pattern index for the new patch.
                    samplingPatternOffset = 0;

                    // Compute the 32-byte (256-bit) descriptor.
                    // Each byte is composed of 8 binary comparisons.
                    // For efficiency, these are unrolled.
                    for (byteIdx = 0; byteIdx < DESCRIPTOR_BYTE_COUNT; ++byteIdx) {
                        currentBitVal = 0; // Reset for each new byte.

                        // Perform 8 pairwise comparisons to generate one descriptor byte.
                        // Each comparison (pixelVal1 < pixelVal2) results in 0 or 1.
                        // This result is then shifted into the `currentBitVal`.

                        // Comparison 0 (bit 0)
                        pixelVal1 = patchPixelData[PATCH_CENTER_OFFSET + samplingCoordinates[samplingPatternOffset+1] * PATCH_DIM + samplingCoordinates[samplingPatternOffset]]; samplingPatternOffset += 2;
                        pixelVal2 = patchPixelData[PATCH_CENTER_OFFSET + samplingCoordinates[samplingPatternOffset+1] * PATCH_DIM + samplingCoordinates[samplingPatternOffset]]; samplingPatternOffset += 2;
                        currentBitVal = (pixelVal1 < pixelVal2); // Directly assigns 0 or 1

                        // Comparison 1 (bit 1)
                        pixelVal1 = patchPixelData[PATCH_CENTER_OFFSET + samplingCoordinates[samplingPatternOffset+1] * PATCH_DIM + samplingCoordinates[samplingPatternOffset]]; samplingPatternOffset += 2;
                        pixelVal2 = patchPixelData[PATCH_CENTER_OFFSET + samplingCoordinates[samplingPatternOffset+1] * PATCH_DIM + samplingCoordinates[samplingPatternOffset]]; samplingPatternOffset += 2;
                        currentBitVal |= (pixelVal1 < pixelVal2) << 1;

                        // Comparison 2 (bit 2)
                        pixelVal1 = patchPixelData[PATCH_CENTER_OFFSET + samplingCoordinates[samplingPatternOffset+1] * PATCH_DIM + samplingCoordinates[samplingPatternOffset]]; samplingPatternOffset += 2;
                        pixelVal2 = patchPixelData[PATCH_CENTER_OFFSET + samplingCoordinates[samplingPatternOffset+1] * PATCH_DIM + samplingCoordinates[samplingPatternOffset]]; samplingPatternOffset += 2;
                        currentBitVal |= (pixelVal1 < pixelVal2) << 2;

                        // Comparison 3 (bit 3)
                        pixelVal1 = patchPixelData[PATCH_CENTER_OFFSET + samplingCoordinates[samplingPatternOffset+1] * PATCH_DIM + samplingCoordinates[samplingPatternOffset]]; samplingPatternOffset += 2;
                        pixelVal2 = patchPixelData[PATCH_CENTER_OFFSET + samplingCoordinates[samplingPatternOffset+1] * PATCH_DIM + samplingCoordinates[samplingPatternOffset]]; samplingPatternOffset += 2;
                        currentBitVal |= (pixelVal1 < pixelVal2) << 3;

                        // Comparison 4 (bit 4)
                        pixelVal1 = patchPixelData[PATCH_CENTER_OFFSET + samplingCoordinates[samplingPatternOffset+1] * PATCH_DIM + samplingCoordinates[samplingPatternOffset]]; samplingPatternOffset += 2;
                        pixelVal2 = patchPixelData[PATCH_CENTER_OFFSET + samplingCoordinates[samplingPatternOffset+1] * PATCH_DIM + samplingCoordinates[samplingPatternOffset]]; samplingPatternOffset += 2;
                        currentBitVal |= (pixelVal1 < pixelVal2) << 4;

                        // Comparison 5 (bit 5)
                        pixelVal1 = patchPixelData[PATCH_CENTER_OFFSET + samplingCoordinates[samplingPatternOffset+1] * PATCH_DIM + samplingCoordinates[samplingPatternOffset]]; samplingPatternOffset += 2;
                        pixelVal2 = patchPixelData[PATCH_CENTER_OFFSET + samplingCoordinates[samplingPatternOffset+1] * PATCH_DIM + samplingCoordinates[samplingPatternOffset]]; samplingPatternOffset += 2;
                        currentBitVal |= (pixelVal1 < pixelVal2) << 5;

                        // Comparison 6 (bit 6)
                        pixelVal1 = patchPixelData[PATCH_CENTER_OFFSET + samplingCoordinates[samplingPatternOffset+1] * PATCH_DIM + samplingCoordinates[samplingPatternOffset]]; samplingPatternOffset += 2;
                        pixelVal2 = patchPixelData[PATCH_CENTER_OFFSET + samplingCoordinates[samplingPatternOffset+1] * PATCH_DIM + samplingCoordinates[samplingPatternOffset]]; samplingPatternOffset += 2;
                        currentBitVal |= (pixelVal1 < pixelVal2) << 6;

                        // Comparison 7 (bit 7)
                        pixelVal1 = patchPixelData[PATCH_CENTER_OFFSET + samplingCoordinates[samplingPatternOffset+1] * PATCH_DIM + samplingCoordinates[samplingPatternOffset]]; samplingPatternOffset += 2;
                        pixelVal2 = patchPixelData[PATCH_CENTER_OFFSET + samplingCoordinates[samplingPatternOffset+1] * PATCH_DIM + samplingCoordinates[samplingPatternOffset]]; samplingPatternOffset += 2;
                        currentBitVal |= (pixelVal1 < pixelVal2) << 7;

                        // Store the computed byte in the descriptor.
                        descriptorRawData[currentDescriptorByteOffset + byteIdx] = currentBitVal;
                    }
                    // Advance to the next descriptor's starting position.
                    currentDescriptorByteOffset += DESCRIPTOR_BYTE_COUNT;
                }
            }
        };
    })();

    // Expose the patternDescriptor module to the global processing context (jsfeat).
    processingContext.patternDescriptor = patternDescriptor;

})(jsfeat);