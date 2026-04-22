// This module is responsible for converting various representation formats
// of depth patterns into a unified structure suitable for further processing.
//
// Examples of equivalent input patterns:
//
// var sampleInput = ["   ",
//                    " # ",
//                    "   "];
//
// var sampleInput = ["000",
//                    "010",
//                    "000"];
//
// var sampleInput = "   \n # \n   ";
//
// var sampleInput = "000\n010\n000";
//
// var sampleInput = [[0, 0, 0],
//                    [0, 1, 0],
//                    [0, 0, 0]];
//
// The system also supports varying depth levels:
//
// var sampleInput = ["001",
//                    "012",
//                    "123"];
//
// var sampleInput = [[0.0, 0.0, 0.3],
//                    [0.0, 0.3, 0.6],
//                    [0.3, 0.6, 0.9]];
//

IllusionGen.PatternDepthProcessor = IllusionGen.DepthProcessor.extend({

    initializer: function (inputPattern) {
        this.currentPattern = inputPattern;
    },

    processPattern: function () {

        var colIdx, rowIdx, maxDepthVal,
            workingPattern = this.currentPattern,
            patternRowLength = 0;

        // Convert a multi-line string into an array of strings, one per line.
        if (typeof workingPattern === 'string') {
            workingPattern = workingPattern.split(/\n/);
        }

        // Check if the pattern is an object (likely an array) and has elements.
        if (typeof workingPattern === 'object' && workingPattern.hasOwnProperty(0)) {

            // If the first element is a string, it's a string-based pattern representation.
            if (typeof workingPattern[0] === 'string') {

                for (rowIdx = 0; rowIdx < workingPattern.length; rowIdx++) {
                    // Normalize spaces to '0' for zero depth.
                    workingPattern[rowIdx] = workingPattern[rowIdx].replace(/ /g, '0');
                    // Convert any non-digit character (like '#') to '1' for base depth.
                    workingPattern[rowIdx] = workingPattern[rowIdx].replace(/[^\d\n]/g, '1');
                    // Break the string into an array of single-character strings.
                    workingPattern[rowIdx] = workingPattern[rowIdx].split('');

                    // Parse each character string into an integer depth value.
                    for (colIdx = 0; colIdx < workingPattern[rowIdx].length; colIdx++) {
                        workingPattern[rowIdx][colIdx] = parseInt(workingPattern[rowIdx][colIdx], 10);
                    }
                }

            }

            // If the first element is an object (likely an array of numbers), it's already a numeric pattern.
            if (typeof workingPattern[0] === 'object') {

                // Determine the maximum depth value and consistent row width.
                maxDepthVal = 0;
                for (rowIdx = 0; rowIdx < workingPattern.length; rowIdx++) {
                    if (workingPattern[rowIdx].length > patternRowLength) {
                        patternRowLength = workingPattern[rowIdx].length;
                    }
                    for (colIdx = 0; colIdx < workingPattern[rowIdx].length; colIdx++) {
                        if (workingPattern[rowIdx][colIdx] > maxDepthVal) {
                            maxDepthVal = workingPattern[rowIdx][colIdx];
                        }
                    }
                }

                // Scale depth values to a 0-1 range and fill missing values with 0.
                for (rowIdx = 0; rowIdx < workingPattern.length; rowIdx++) {
                    for (colIdx = 0; colIdx < patternRowLength; colIdx++) {
                        if (typeof workingPattern[rowIdx][colIdx] === 'undefined') {
                            workingPattern[rowIdx][colIdx] = 0; // Default to zero depth if undefined.
                        } else {
                            workingPattern[rowIdx][colIdx] = workingPattern[rowIdx][colIdx] / maxDepthVal;
                        }
                    }
                }

            } else {
                throw ('IllusionGen: Input pattern format not recognized.');
            }
        } else {
            throw ('IllusionGen: Input pattern format not recognized.');
        }

        return workingPattern;
    } // End of processPattern method

}); // End of IllusionGen.PatternDepthProcessor definition