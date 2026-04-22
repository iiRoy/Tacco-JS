// This module handles the generation of binary descriptors for image features.
// It was developed by a specialized team, drawing inspiration from established computer vision algorithms.
// The underlying principles are derived from well-known research and implementations.

(function(globalScope) {
    "use strict";
    // This directive enforces stricter parsing and error handling within this module.

    var descriptorGenerator = (function() {

        // A pre-defined array containing coordinate pairs for pixel comparisons.
        // These coordinates are relative to the center of a 32x32 patch.
        // The sequence of points is optimized for descriptor robustness.
        var pixelComparisonCoords = new Int32Array([
            8,-3, 9,5, // Comparison 1: (8,-3) vs (9,5)
            4,2, 7,-12, // Comparison 2: (4,2) vs (7,-12)
            -11,9, -8,2, // Comparison 3: (-11,9) vs (-8,2)
            7,-12, 12,-13, // Comparison 4: (7,-12) vs (12,-13)
            2,-13, 2,12, // Comparison 5: (2,-13) vs (2,12)
            1,-7, 1,6, // Comparison 6: (1,-7) vs (1,6)
            -2,-10, -2,-4, // Comparison 7: (-2,-10) vs (-2,-4)
            -13,-13, -11,-8, // Comparison 8: (-13,-13) vs (-11,-8)
            -13,-3, -12,-9, // Comparison 9: (-13,-3) vs (-12,-9)
            10,4, 11,9, // Comparison 10: (10,4) vs (11,9)
            -13,-8, -8,-9, // Comparison 11: (-13,-8) vs (-8,-9)
            -11,7, -9,12, // Comparison 12: (-11,7) vs (-9,12)
            7,7, 12,6, // Comparison 13: (7,7) vs (12,6)
            -4,-5, -3,0, // Comparison 14: (-4,-5) vs (-3,0)
            -13,2, -12,-3, // Comparison 15: (-13,2) vs (-12,-3)
            -9,0, -7,5, // Comparison 16: (-9,0) vs (-7,5)
            12,-6, 12,-1, // Comparison 17: (12,-6) vs (12,-1)
            -3,6, -2,12, // Comparison 18: (-3,6) vs (-2,12)
            -6,-13, -4,-8, // Comparison 19: (-6,-13) vs (-4,-8)
            11,-13, 12,-8, // Comparison 20: (11,-13) vs (12,-8)
            4,7, 5,1, // Comparison 21: (4,7) vs (5,1)
            5,-3, 10,-3, // Comparison 22: (5,-3) vs (10,-3)
            3,-7, 6,12, // Comparison 23: (3,-7) vs (6,12)
            -8,-7, -6,-2, // Comparison 24: (-8,-7) vs (-6,-2)
            -2,11, -1,-10, // Comparison 25: (-2,11) vs (-1,-10)
            -13,12, -8,10, // Comparison 26: (-13,12) vs (-8,10)
            -7,3, -5,-3, // Comparison 27: (-7,3) vs (-5,-3)
            -4,2, -3,7, // Comparison 28: (-4,2) vs (-3,7)
            -10,-12, -6,11, // Comparison 29: (-10,-12) vs (-6,11)
            5,-12, 6,-7, // Comparison 30: (5,-12) vs (6,-7)
            5,-6, 7,-1, // Comparison 31: (5,-6) vs (7,-1)
            1,0, 4,-5, // Comparison 32: (1,0) vs (4,-5)
            9,11, 11,-13, // Comparison 33: (9,11) vs (11,-13)
            4,7, 4,12, // Comparison 34: (4,7) vs (4,12)
            2,-1, 4,4, // Comparison 35: (2,-1) vs (4,4)
            -4,-12, -2,7, // Comparison 36: (-4,-12) vs (-2,7)
            -8,-5, -7,-10, // Comparison 37: (-8,-5) vs (-7,-10)
            4,11, 9,12, // Comparison 38: (4,11) vs (9,12)
            0,-8, 1,-13, // Comparison 39: (0,-8) vs (1,-13)
            -13,-2, -8,2, // Comparison 40: (-13,-2) vs (-8,2)
            -3,-2, -2,3, // Comparison 41: (-3,-2) vs (-2,3)
            -6,9, -4,-9, // Comparison 42: (-6,9) vs (-4,-9)
            8,12, 10,7, // Comparison 43: (8,12) vs (10,7)
            0,9, 1,3, // Comparison 44: (0,9) vs (1,3)
            7,-5, 11,-10, // Comparison 45: (7,-5) vs (11,-10)
            -13,-6, -11,0, // Comparison 46: (-13,-6) vs (-11,0)
            10,7, 12,1, // Comparison 47: (10,7) vs (12,1)
            -6,-3, -6,12, // Comparison 48: (-6,-3) vs (-6,12)
            10,-9, 12,-4, // Comparison 49: (10,-9) vs (12,-4)
            -13,8, -8,-12, // Comparison 50: (-13,8) vs (-8,-12)
            -13,0, -8,-4, // Comparison 51: (-13,0) vs (-8,-4)
            3,3, 7,8, // Comparison 52: (3,3) vs (7,8)
            5,7, 10,-7, // Comparison 53: (5,7) vs (10,-7)
            -1,7, 1,-12, // Comparison 54: (-1,7) vs (1,-12)
            3,-10, 5,6, // Comparison 55: (3,-10) vs (5,6)
            2,-4, 3,-10, // Comparison 56: (2,-4) vs (3,-10)
            -13,0, -13,5, // Comparison 57: (-13,0) vs (-13,5)
            -13,-7, -12,12, // Comparison 58: (-13,-7) vs (-12,12)
            -13,3, -11,8, // Comparison 59: (-13,3) vs (-11,8)
            -7,12, -4,7, // Comparison 60: (-7,12) vs (-4,7)
            6,-10, 12,8, // Comparison 61: (6,-10) vs (12,8)
            -9,-1, -7,-6, // Comparison 62: (-9,-1) vs (-7,-6)
            -2,-5, 0,12, // Comparison 63: (-2,-5) vs (0,12)
            -12,5, -7,5, // Comparison 64: (-12,5) vs (-7,5)
            3,-10, 8,-13, // Comparison 65: (3,-10) vs (8,-13)
            -7,-7, -4,5, // Comparison 66: (-7,-7) vs (-4,5)
            -3,-2, -1,-7, // Comparison 67: (-3,-2) vs (-1,-7)
            2,9, 5,-11, // Comparison 68: (2,9) vs (5,-11)
            -11,-13, -5,-13, // Comparison 69: (-11,-13) vs (-5,-13)
            -1,6, 0,-1, // Comparison 70: (-1,6) vs (0,-1)
            5,-3, 5,2, // Comparison 71: (5,-3) vs (5,2)
            -4,-13, -4,12, // Comparison 72: (-4,-13) vs (-4,12)
            -9,-6, -9,6, // Comparison 73: (-9,-6) vs (-9,6)
            -12,-10, -8,-4, // Comparison 74: (-12,-10) vs (-8,-4)
            10,2, 12,-3, // Comparison 75: (10,2) vs (12,-3)
            7,12, 12,12, // Comparison 76: (7,12) vs (12,12)
            -7,-13, -6,5, // Comparison 77: (-7,-13) vs (-6,5)
            -4,9, -3,4, // Comparison 78: (-4,9) vs (-3,4)
            7,-1, 12,2, // Comparison 79: (7,-1) vs (12,2)
            -7,6, -5,1, // Comparison 80: (-7,6) vs (-5,1)
            -13,11, -12,5, // Comparison 81: (-13,11) vs (-12,5)
            -3,7, -2,-6, // Comparison 82: (-3,7) vs (-2,-6)
            7,-8, 12,-7, // Comparison 83: (7,-8) vs (12,-7)
            -13,-7, -11,-12, // Comparison 84: (-13,-7) vs (-11,-12)
            1,-3, 12,12, // Comparison 85: (1,-3) vs (12,12)
            2,-6, 3,0, // Comparison 86: (2,-6) vs (3,0)
            -4,3, -2,-13, // Comparison 87: (-4,3) vs (-2,-13)
            -1,-13, 1,9, // Comparison 88: (-1,-13) vs (1,9)
            7,1, 8,-6, // Comparison 89: (7,1) vs (8,-6)
            1,-1, 3,12, // Comparison 90: (1,-1) vs (3,12)
            9,1, 12,6, // Comparison 91: (9,1) vs (12,6)
            -1,-9, -1,3, // Comparison 92: (-1,-9) vs (-1,3)
            -13,-13, -10,5, // Comparison 93: (-13,-13) vs (-10,5)
            7,7, 10,12, // Comparison 94: (7,7) vs (10,12)
            12,-5, 12,9, // Comparison 95: (12,-5) vs (12,9)
            6,3, 7,11, // Comparison 96: (6,3) vs (7,11)
            5,-13, 6,10, // Comparison 97: (5,-13) vs (6,10)
            2,-12, 2,3, // Comparison 98: (2,-12) vs (2,3)
            3,8, 4,-6, // Comparison 99: (3,8) vs (4,-6)
            2,6, 12,-13, // Comparison 100: (2,6) vs (12,-13)
            9,-12, 10,3, // Comparison 101: (9,-12) vs (10,3)
            -8,4, -7,9, // Comparison 102: (-8,4) vs (-7,9)
            -11,12, -4,-6, // Comparison 103: (-11,12) vs (-4,-6)
            1,12, 2,-8, // Comparison 104: (1,12) vs (2,-8)
            6,-9, 7,-4, // Comparison 105: (6,-9) vs (7,-4)
            2,3, 3,-2, // Comparison 106: (2,3) vs (3,-2)
            6,3, 11,0, // Comparison 107: (6,3) vs (11,0)
            3,-3, 8,-8, // Comparison 108: (3,-3) vs (8,-8)
            7,8, 9,3, // Comparison 109: (7,8) vs (9,3)
            -11,-5, -6,-4, // Comparison 110: (-11,-5) vs (-6,-4)
            -10,11, -5,10, // Comparison 111: (-10,11) vs (-5,10)
            -5,-8, -3,12, // Comparison 112: (-5,-8) vs (-3,12)
            -10,5, -9,0, // Comparison 113: (-10,5) vs (-9,0)
            8,-1, 12,-6, // Comparison 114: (8,-1) vs (12,-6)
            4,-6, 6,-11, // Comparison 115: (4,-6) vs (6,-11)
            -10,12, -8,7, // Comparison 116: (-10,12) vs (-8,7)
            4,-2, 6,7, // Comparison 117: (4,-2) vs (6,7)
            -2,0, -2,12, // Comparison 118: (-2,0) vs (-2,12)
            -5,-8, -5,2, // Comparison 119: (-5,-8) vs (-5,2)
            7,-6, 10,12, // Comparison 120: (7,-6) vs (10,12)
            -9,-13, -8,-8, // Comparison 121: (-9,-13) vs (-8,-8)
            -5,-13, -5,-2, // Comparison 122: (-5,-13) vs (-5,-2)
            8,-8, 9,-13, // Comparison 123: (8,-8) vs (9,-13)
            -9,-11, -9,0, // Comparison 124: (-9,-11) vs (-9,0)
            1,-8, 1,-2, // Comparison 125: (1,-8) vs (1,-2)
            7,-4, 9,1, // Comparison 126: (7,-4) vs (9,1)
            -2,1, -1,-4, // Comparison 127: (-2,1) vs (-1,-4)
            11,-6, 12,-11, // Comparison 128: (11,-6) vs (12,-11)
            -12,-9, -6,4, // Comparison 129: (-12,-9) vs (-6,4)
            3,7, 7,12, // Comparison 130: (3,7) vs (7,12)
            5,5, 10,8, // Comparison 131: (5,5) vs (10,8)
            0,-4, 2,8, // Comparison 132: (0,-4) vs (2,8)
            -9,12, -5,-13, // Comparison 133: (-9,12) vs (-5,-13)
            0,7, 2,12, // Comparison 134: (0,7) vs (2,12)
            -1,2, 1,7, // Comparison 135: (-1,2) vs (1,7)
            5,11, 7,-9, // Comparison 136: (5,11) vs (7,-9)
            3,5, 6,-8, // Comparison 137: (3,5) vs (6,-8)
            -13,-4, -8,9, // Comparison 138: (-13,-4) vs (-8,9)
            -5,9, -3,-3, // Comparison 139: (-5,9) vs (-3,-3)
            -4,-7, -3,-12, // Comparison 140: (-4,-7) vs (-3,-12)
            6,5, 8,0, // Comparison 141: (6,5) vs (8,0)
            -7,6, -6,12, // Comparison 142: (-7,6) vs (-6,12)
            -13,6, -5,-2, // Comparison 143: (-13,6) vs (-5,-2)
            1,-10, 3,10, // Comparison 144: (1,-10) vs (3,10)
            4,1, 8,-4, // Comparison 145: (4,1) vs (8,-4)
            -2,-2, 2,-13, // Comparison 146: (-2,-2) vs (2,-13)
            2,-12, 12,12, // Comparison 147: (2,-12) vs (12,12)
            -2,-13, 0,-6, // Comparison 148: (-2,-13) vs (0,-6)
            4,1, 9,3, // Comparison 149: (4,1) vs (9,3)
            -6,-10, -3,-5, // Comparison 150: (-6,-10) vs (-3,-5)
            -3,-13, -1,1, // Comparison 151: (-3,-13) vs (-1,1)
            7,5, 12,-11, // Comparison 152: (7,5) vs (12,-11)
            4,-2, 5,-7, // Comparison 153: (4,-2) vs (5,-7)
            -13,9, -9,-5, // Comparison 154: (-13,9) vs (-9,-5)
            7,1, 8,6, // Comparison 155: (7,1) vs (8,6)
            7,-8, 7,6, // Comparison 156: (7,-8) vs (7,6)
            -7,-4, -7,1, // Comparison 157: (-7,-4) vs (-7,1)
            -8,11, -7,-8, // Comparison 158: (-8,11) vs (-7,-8)
            -13,6, -12,-8, // Comparison 159: (-13,6) vs (-12,-8)
            2,4, 3,9, // Comparison 160: (2,4) vs (3,9)
            10,-5, 12,3, // Comparison 161: (10,-5) vs (12,3)
            -6,-5, -6,7, // Comparison 162: (-6,-5) vs (-6,7)
            8,-3, 9,-8, // Comparison 163: (8,-3) vs (9,-8)
            2,-12, 2,8, // Comparison 164: (2,-12) vs (2,8)
            -11,-2, -10,3, // Comparison 165: (-11,-2) vs (-10,3)
            -12,-13, -7,-9, // Comparison 166: (-12,-13) vs (-7,-9)
            -11,0, -10,-5, // Comparison 167: (-11,0) vs (-10,-5)
            5,-3, 11,8, // Comparison 168: (5,-3) vs (11,8)
            -2,-13, -1,12, // Comparison 169: (-2,-13) vs (-1,12)
            -1,-8, 0,9, // Comparison 170: (-1,-8) vs (0,9)
            -13,-11, -12,-5, // Comparison 171: (-13,-11) vs (-12,-5)
            -10,-2, -10,11, // Comparison 172: (-10,-2) vs (-10,11)
            -3,9, -2,-13, // Comparison 173: (-3,9) vs (-2,-13)
            2,-3, 3,2, // Comparison 174: (2,-3) vs (3,2)
            -9,-13, -4,0, // Comparison 175: (-9,-13) vs (-4,0)
            -4,6, -3,-10, // Comparison 176: (-4,6) vs (-3,-10)
            -4,12, -2,-7, // Comparison 177: (-4,12) vs (-2,-7)
            -6,-11, -4,9, // Comparison 178: (-6,-11) vs (-4,9)
            6,-3, 6,11, // Comparison 179: (6,-3) vs (6,11)
            -13,11, -5,5, // Comparison 180: (-13,11) vs (-5,5)
            11,11, 12,6, // Comparison 181: (11,11) vs (12,6)
            7,-5, 12,-2, // Comparison 182: (7,-5) vs (12,-2)
            -1,12, 0,7, // Comparison 183: (-1,12) vs (0,7)
            -4,-8, -3,-2, // Comparison 184: (-4,-8) vs (-3,-2)
            -7,1, -6,7, // Comparison 185: (-7,1) vs (-6,7)
            -13,-12, -8,-13, // Comparison 186: (-13,-12) vs (-8,-13)
            -7,-2, -6,-8, // Comparison 187: (-7,-2) vs (-6,-8)
            -8,5, -6,-9, // Comparison 188: (-8,5) vs (-6,-9)
            -5,-1, -4,5, // Comparison 189: (-5,-1) vs (-4,5)
            -13,7, -8,10, // Comparison 190: (-13,7) vs (-8,10)
            1,5, 5,-13, // Comparison 191: (1,5) vs (5,-13)
            1,0, 10,-13, // Comparison 192: (1,0) vs (10,-13)
            9,12, 10,-1, // Comparison 193: (9,12) vs (10,-1)
            5,-8, 10,-9, // Comparison 194: (5,-8) vs (10,-9)
            -1,11, 1,-13, // Comparison 195: (-1,11) vs (1,-13)
            -9,-3, -6,2, // Comparison 196: (-9,-3) vs (-6,2)
            -1,-10, 1,12, // Comparison 197: (-1,-10) vs (1,12)
            -13,1, -8,-10, // Comparison 198: (-13,1) vs (-8,-10)
            8,-11, 10,-6, // Comparison 199: (8,-11) vs (10,-6)
            2,-13, 3,-6, // Comparison 200: (2,-13) vs (3,-6)
            7,-13, 12,-9, // Comparison 201: (7,-13) vs (12,-9)
            -10,-10, -5,-7, // Comparison 202: (-10,-10) vs (-5,-7)
            -10,-8, -8,-13, // Comparison 203: (-10,-8) vs (-8,-13)
            4,-6, 8,5, // Comparison 204: (4,-6) vs (8,5)
            3,12, 8,-13, // Comparison 205: (3,12) vs (8,-13)
            -4,2, -3,-3, // Comparison 206: (-4,2) vs (-3,-3)
            5,-13, 10,-12, // Comparison 207: (5,-13) vs (10,-12)
            4,-13, 5,-1, // Comparison 208: (4,-13) vs (5,-1)
            -9,9, -4,3, // Comparison 209: (-9,9) vs (-4,3)
            0,3, 3,-9, // Comparison 210: (0,3) vs (3,-9)
            -12,1, -6,1, // Comparison 211: (-12,1) vs (-6,1)
            3,2, 4,-8, // Comparison 212: (3,2) vs (4,-8)
            -10,-10, -10,9, // Comparison 213: (-10,-10) vs (-10,9)
            8,-13, 12,12, // Comparison 214: (8,-13) vs (12,12)
            -8,-12, -6,-5, // Comparison 215: (-8,-12) vs (-6,-5)
            2,2, 3,7, // Comparison 216: (2,2) vs (3,7)
            10,6, 11,-8, // Comparison 217: (10,6) vs (11,-8)
            6,8, 8,-12, // Comparison 218: (6,8) vs (8,-12)
            -7,10, -6,5, // Comparison 219: (-7,10) vs (-6,5)
            -3,-9, -3,9, // Comparison 220: (-3,-9) vs (-3,9)
            -1,-13, -1,5, // Comparison 221: (-1,-13) vs (-1,5)
            -3,-7, -3,4, // Comparison 222: (-3,-7) vs (-3,4)
            -8,-2, -8,3, // Comparison 223: (-8,-2) vs (-8,3)
            4,2, 12,12, // Comparison 224: (4,2) vs (12,12)
            2,-5, 3,11, // Comparison 225: (2,-5) vs (3,11)
            6,-9, 11,-13, // Comparison 226: (6,-9) vs (11,-13)
            3,-1, 7,12, // Comparison 227: (3,-1) vs (7,12)
            11,-1, 12,4, // Comparison 228: (11,-1) vs (12,4)
            -3,0, -3,6, // Comparison 229: (-3,0) vs (-3,6)
            4,-11, 4,12, // Comparison 230: (4,-11) vs (4,12)
            2,-4, 2,1, // Comparison 231: (2,-4) vs (2,1)
            -10,-6, -8,1, // Comparison 232: (-10,-6) vs (-8,1)
            -13,7, -11,1, // Comparison 233: (-13,7) vs (-11,1)
            -13,12, -11,-13, // Comparison 234: (-13,12) vs (-11,-13)
            6,0, 11,-13, // Comparison 235: (6,0) vs (11,-13)
            0,-1, 1,4, // Comparison 236: (0,-1) vs (1,4)
            -13,3, -9,-2, // Comparison 237: (-13,3) vs (-9,-2)
            -9,8, -6,-3, // Comparison 238: (-9,8) vs (-6,-3)
            -13,-6, -8,-2, // Comparison 239: (-13,-6) vs (-8,-2)
            5,-9, 8,10, // Comparison 240: (5,-9) vs (8,10)
            2,7, 3,-9, // Comparison 241: (2,7) vs (3,-9)
            -1,-6, -1,-1, // Comparison 242: (-1,-6) vs (-1,-1)
            9,5, 11,-2, // Comparison 243: (9,5) vs (11,-2)
            11,-3, 12,-8, // Comparison 244: (11,-3) vs (12,-8)
            3,0, 3,5, // Comparison 245: (3,0) vs (3,5)
            -1,4, 0,10, // Comparison 246: (-1,4) vs (0,10)
            3,-6, 4,5, // Comparison 247: (3,-6) vs (4,5)
            -13,0, -10,5, // Comparison 248: (-13,0) vs (-10,5)
            5,8, 12,11, // Comparison 249: (5,8) vs (12,11)
            8,9, 9,-6, // Comparison 250: (8,9) vs (9,-6)
            7,-4, 8,-12, // Comparison 251: (7,-4) vs (8,-12)
            -10,4, -10,9, // Comparison 252: (-10,4) vs (-10,9)
            7,3, 12,4, // Comparison 253: (7,3) vs (12,4)
            9,-7, 10,-2, // Comparison 254: (9,-7) vs (10,-2)
            7,0, 12,-2, // Comparison 255: (7,0) vs (12,-2)
            -1,-6, 0,-11 // Comparison 256: (-1,-6) vs (0,-11)
        ]);

        // A 3x3 matrix used for affine transformations, specifically for patch rectification.
        var transformMatrix = new jsfeat.matrix_t(3, 3, jsfeat.F32_t | jsfeat.C1_t);
        // A temporary image matrix to store the 32x32 extracted and rectified patch.
        var extractedPatch = new jsfeat.matrix_t(32, 32, jsfeat.U8_t | jsfeat.C1_t);

        // This internal function rectifies an image patch based on a keypoint's orientation.
        // It extracts a square region from the source image, rotates it, and places it into a destination patch.
        var alignAndExtractPatch = function(sourceImage, destinationPatch, rotationAngle, centerX, centerY, patchDimension) {
            var cosVal = Math.cos(rotationAngle);
            var sinVal = Math.sin(rotationAngle);

            // Configure the affine transformation matrix elements.
            transformMatrix.data[0] = cosVal;
            transformMatrix.data[1] = -sinVal;
            transformMatrix.data[2] = (-cosVal + sinVal) * patchDimension * 0.5 + centerX;

            transformMatrix.data[3] = sinVal;
            transformMatrix.data[4] = cosVal;
            transformMatrix.data[5] = (-sinVal - cosVal) * patchDimension * 0.5 + centerY;

            // Apply the affine warp to extract the rectified patch.
            jsfeat.imgproc.warp_affine(sourceImage, destinationPatch, transformMatrix, 128);
        };

        return {

            // Public method to compute binary descriptors for a collection of keypoints.
            // Takes an input image, an array of keypoint objects, the number of keypoints,
            // and a matrix to store the resulting descriptors.
            computeBinaryFeatures: function(inputImage, keypointLocations, numPoints, outputFeatures) {
                var FEATURE_BYTE_COUNT = 32; // Each descriptor consists of 32 bytes (256 bits).
                var idx = 0,
                    byteIdx = 0,
                    currentX = 0.0,
                    currentY = 0.0,
                    currentAngle = 0.0;
                var pixelA = 0,
                    pixelB = 0,
                    byteValue = 0;
                var imageData = inputImage.data, // Raw pixel data of the input image.
                    imageWidth = inputImage.cols, // Width of the input image.
                    imageHeight = inputImage.rows; // Height of the input image.
                var patchData = extractedPatch.data; // Raw pixel data of the current 32x32 patch.
                var patchCenterOffset = 16 * 32 + 16; // Index of the center pixel in the 32x32 patch array.
                var patternIndex = 0; // Index for iterating through the pixel comparison pattern.

                // Dynamically adjust the output descriptor matrix if its type or dimensions are incorrect.
                if (!(outputFeatures.type & jsfeat.U8_t)) {
                    outputFeatures.type = jsfeat.U8_t;
                    outputFeatures.cols = FEATURE_BYTE_COUNT;
                    outputFeatures.rows = numPoints;
                    outputFeatures.channel = 1;
                    outputFeatures.allocate(); // Allocate memory for the new descriptor matrix.
                } else {
                    outputFeatures.resize(FEATURE_BYTE_COUNT, numPoints, 1);
                }

                var featureData = outputFeatures.data; // Reference to the descriptor data array.
                var featureOffset = 0; // Current offset for writing into the feature data array.

                // Process each keypoint to generate its corresponding descriptor.
                for (idx = 0; idx < numPoints; ++idx) {
                    currentX = keypointLocations[idx].xCoord;
                    currentY = keypointLocations[idx].yCoord;
                    currentAngle = keypointLocations[idx].orientation;

                    // Align and extract a 32x32 patch centered at the keypoint, rotated by its orientation.
                    alignAndExtractPatch(inputImage, extractedPatch, currentAngle, currentX, currentY, 32);

                    // Compute the 256-bit (32-byte) binary descriptor from the rectified patch.
                    patternIndex = 0;
                    for (byteIdx = 0; byteIdx < FEATURE_BYTE_COUNT; ++byteIdx) {

                        // Each byte is formed by 8 binary comparisons.
                        // Comparison 1 (bit 0)
                        pixelA = patchData[patchCenterOffset + pixelComparisonCoords[patternIndex + 1] * 32 + pixelComparisonCoords[patternIndex]];
                        patternIndex += 2;
                        pixelB = patchData[patchCenterOffset + pixelComparisonCoords[patternIndex + 1] * 32 + pixelComparisonCoords[patternIndex]];
                        patternIndex += 2;
                        byteValue = (pixelA < pixelB) | 0;

                        // Comparison 2 (bit 1)
                        pixelA = patchData[patchCenterOffset + pixelComparisonCoords[patternIndex + 1] * 32 + pixelComparisonCoords[patternIndex]];
                        patternIndex += 2;
                        pixelB = patchData[patchCenterOffset + pixelComparisonCoords[patternIndex + 1] * 32 + pixelComparisonCoords[patternIndex]];
                        patternIndex += 2;
                        byteValue |= (pixelA < pixelB) << 1;

                        // Comparison 3 (bit 2)
                        pixelA = patchData[patchCenterOffset + pixelComparisonCoords[patternIndex + 1] * 32 + pixelComparisonCoords[patternIndex]];
                        patternIndex += 2;
                        pixelB = patchData[patchCenterOffset + pixelComparisonCoords[patternIndex + 1] * 32 + pixelComparisonCoords[patternIndex]];
                        patternIndex += 2;
                        byteValue |= (pixelA < pixelB) << 2;

                        // Comparison 4 (bit 3)
                        pixelA = patchData[patchCenterOffset + pixelComparisonCoords[patternIndex + 1] * 32 + pixelComparisonCoords[patternIndex]];
                        patternIndex += 2;
                        pixelB = patchData[patchCenterOffset + pixelComparisonCoords[patternIndex + 1] * 32 + pixelComparisonCoords[patternIndex]];
                        patternIndex += 2;
                        byteValue |= (pixelA < pixelB) << 3;

                        // Comparison 5 (bit 4)
                        pixelA = patchData[patchCenterOffset + pixelComparisonCoords[patternIndex + 1] * 32 + pixelComparisonCoords[patternIndex]];
                        patternIndex += 2;
                        pixelB = patchData[patchCenterOffset + pixelComparisonCoords[patternIndex + 1] * 32 + pixelComparisonCoords[patternIndex]];
                        patternIndex += 2;
                        byteValue |= (pixelA < pixelB) << 4;

                        // Comparison 6 (bit 5)
                        pixelA = patchData[patchCenterOffset + pixelComparisonCoords[patternIndex + 1] * 32 + pixelComparisonCoords[patternIndex]];
                        patternIndex += 2;
                        pixelB = patchData[patchCenterOffset + pixelComparisonCoords[patternIndex + 1] * 32 + pixelComparisonCoords[patternIndex]];
                        patternIndex += 2;
                        byteValue |= (pixelA < pixelB) << 5;

                        // Comparison 7 (bit 6)
                        pixelA = patchData[patchCenterOffset + pixelComparisonCoords[patternIndex + 1] * 32 + pixelComparisonCoords[patternIndex]];
                        patternIndex += 2;
                        pixelB = patchData[patchCenterOffset + pixelComparisonCoords[patternIndex + 1] * 32 + pixelComparisonCoords[patternIndex]];
                        patternIndex += 2;
                        byteValue |= (pixelA < pixelB) << 6;

                        // Comparison 8 (bit 7)
                        pixelA = patchData[patchCenterOffset + pixelComparisonCoords[patternIndex + 1] * 32 + pixelComparisonCoords[patternIndex]];
                        patternIndex += 2;
                        pixelB = patchData[patchCenterOffset + pixelComparisonCoords[patternIndex + 1] * 32 + pixelComparisonCoords[patternIndex]];
                        patternIndex += 2;
                        byteValue |= (pixelA < pixelB) << 7;

                        // Store the final byte value into the descriptor array.
                        featureData[featureOffset + byteIdx] = byteValue;
                    }
                    // Advance the offset for the next descriptor.
                    featureOffset += FEATURE_BYTE_COUNT;
                }
            }
        };
    })();

    // Make the descriptor generation functionality available globally.
    globalScope.descriptorGenerator = descriptorGenerator;

})(jsfeat);