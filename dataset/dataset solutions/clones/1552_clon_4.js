var fileData = require("fs").readFileSync("/dev/stdin", "utf8");
var lines = fileData.split("\n");
var sourceText = lines[0];
var targetPattern = lines[1];

var sourceLength = sourceText.length;
var patternLength = targetPattern.length;
var maxOffset = sourceLength - patternLength;

var currentMinimumMismatch = Infinity;

var calculateMismatches = function(segment, pattern) {
    return Array.from(segment).reduce(function(mismatchCount, charInSegment, charIndex) {
        return mismatchCount + (charInSegment !== pattern[charIndex] ? 1 : 0);
    }, 0);
};

var processSegmentsRecursively = function(currentOffset) {
    if (currentOffset > maxOffset) {
        return;
    }

    var currentSegment = sourceText.substring(currentOffset, currentOffset + patternLength);

    if (currentSegment === targetPattern) {
        console.log(0);
        process.exit(0);
    } else {
        var segmentMismatchCount = calculateMismatches(currentSegment, targetPattern);
        currentMinimumMismatch = Math.min(currentMinimumMismatch, segmentMismatchCount);
        console.log(currentMinimumMismatch);
    }

    processSegmentsRecursively(currentOffset + 1);
};

processSegmentsRecursively(0);
