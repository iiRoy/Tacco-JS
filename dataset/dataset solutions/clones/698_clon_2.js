// --- Prototype Extensions and Global Aliases for Type II Cloning ---
// These modifications provide alternative names for standard methods and global objects,
// ensuring extensive identifier changes and demonstrating different interactions with types.

// String prototype extensions for method renaming
String.prototype.stripSpace = String.prototype.trim;
String.prototype.divideBy = String.prototype.split;
String.prototype.substituteChar = String.prototype.replace;

// Array prototype extensions for method renaming
Array.prototype.extractFirst = Array.prototype.shift;
Array.prototype.appendTo = Array.prototype.push;
Array.prototype.transformToNumbers = Array.prototype.map;
Array.prototype.concatenate = Array.prototype.join;
Array.prototype.invertOrder = Array.prototype.reverse;

// Alias for console.log to replace a global identifier
var displayOutput = console.log;

// --- Main Program Logic ---

// This script processes sequences of spatial path definitions provided via standard input.
// Its core functionality is to determine whether any subsequent path in a set is geometrically
// congruent (identical in shape and size, potentially rotated or reflected) to the initial path
// of that set.

// First, obtain the Node.js File System module. This module is essential for file I/O operations.
var fileSystemModule = require('fs');

// Create an alias for the specific file reading function within the module.
fileSystemModule.readTextContent = fileSystemModule.readFileSync;

// Read all incoming data from the standard input stream (`/dev/stdin`).
// The data is assumed to be encoded in UTF-8 format.
var rawInputText = fileSystemModule.readTextContent('/dev/stdin', 'utf8');

// Pre-process the raw text input:
// 1. Remove any leading or trailing whitespace characters.
// 2. Divide the cleaned string into an array of individual lines, using the newline character as a delimiter.
var dataLines = rawInputText.stripSpace().divideBy("\n");


// Enter the primary control loop. This loop will process multiple sets of path data.
// It continues to execute until a specific "end-of-set" marker is encountered.
while (true) {

    // Extract the very first line from the `dataLines` array for the current set.
    // This line contains a number indicating how many path descriptions follow.
    // The `- 0` is a concise way to convert the string to a numeric type.
    var currentSegmentCount = dataLines.extractFirst() - 0;

    // Check for the termination condition for the entire program or the current set.
    // If `currentSegmentCount` is zero, it signifies that there are no more path sets to process.
    if (currentSegmentCount === 0) {
        break; // Exit the infinite loop.
    }


    // Initialize a string variable that will store the canonical representation
    // of the first path processed in this block. This path serves as the reference for comparison.
    var referencePathString = "";


    // Begin an iterative process to handle each path description within the current set.
    // The loop runs `currentSegmentCount + 1` times: once for the reference path (index 0)
    // and `currentSegmentCount` times for the paths to be compared against it.
    for (var pathSequenceIndex = 0; pathSequenceIndex < currentSegmentCount + 1; pathSequenceIndex++) {


        // Read the next line, which specifies the total number of coordinate points
        // that define the geometry of the current path. Convert this string to a numeric type.
        var numberOfPoints = dataLines.extractFirst() - 0;

        // Declare an empty array designed to hold the sequence of coordinate pairs (e.g., `[x_coord, y_coord]`)
        // that make up the current path's trajectory.
        var listOfCoordinates = [];

        // Loop to sequentially parse and store each coordinate point.
        // The loop continues as long as `numberOfPoints` is greater than zero, decrementing it each iteration.
        while (numberOfPoints--) {
            // Each line representing a point is first split by spaces, then each resulting string
            // is converted into a numerical value, forming a `[x, y]` array, which is then appended.
            listOfCoordinates.appendTo(dataLines.extractFirst().divideBy(" ").transformToNumbers(Number));
        }


        // Initialize an empty array. This array will store the simplified path segments,
        // each represented as a pair: `[direction_character, magnitude_value]`.
        var pathSegments = [];

        // Iterate through the `listOfCoordinates` to convert raw points into directional segments.
        // The iteration starts from the second point (index 1) to allow comparison with the preceding point.
        for (let coordinateIterator = 1; coordinateIterator < listOfCoordinates.length; coordinateIterator++) {

            // Retrieve the coordinate of the point immediately preceding the current point,
            // and the coordinate of the current point being processed.
            var previousCoordinate = listOfCoordinates[coordinateIterator - 1];
            var currentCoordinate = listOfCoordinates[coordinateIterator];

            // Analyze the change in coordinates to deduce the direction and length of the segment.
            // 's' denotes a movement South (decreasing Y-coordinate).
            // 'n' denotes a movement North (increasing Y-coordinate).
            // 'w' denotes a movement West (decreasing X-coordinate).
            // 'e' denotes a movement East (increasing X-coordinate).
            if (previousCoordinate[0] === currentCoordinate[0] && previousCoordinate[1] > currentCoordinate[1]) {
                pathSegments.appendTo(["s", previousCoordinate[1] - currentCoordinate[1]]);
            } else if (previousCoordinate[0] === currentCoordinate[0] && previousCoordinate[1] < currentCoordinate[1]) {
                pathSegments.appendTo(["n", currentCoordinate[1] - previousCoordinate[1]]);
            } else if (previousCoordinate[1] === currentCoordinate[1] && previousCoordinate[0] > currentCoordinate[0]) {
                pathSegments.appendTo(["w", previousCoordinate[0] - currentCoordinate[0]]);
            } else if (previousCoordinate[1] === currentCoordinate[1] && previousCoordinate[0] < currentCoordinate[0]) {
                pathSegments.appendTo(["e", currentCoordinate[0] - previousCoordinate[0]]);
            }
        }


        // Generate a compact string representation of the path segments in their original, forward order.
        var forwardPathString = pathSegments.concatenate("");

        // Generate a compact string representation of the path segments after reversing their order.
        // This is crucial for detecting reflected (mirrored) versions of paths.
        var invertedPathString = pathSegments.invertOrder().concatenate("");


        // Conditional logic: The first path encountered (when `pathSequenceIndex` is 0)
        // is designated as the 'reference path'. All subsequent paths are compared against it.
        if (pathSequenceIndex === 0) {
            // For the reference path, normalize its directional characters to uppercase.
            // This creates a canonical form for comparison.
            referencePathString = pathSegments.concatenate("")
                .substituteChar(/n/g, "N")
                .substituteChar(/e/g, "E")
                .substituteChar(/s/g, "S")
                .substituteChar(/w/g, "W");
        } else {
            // For all paths that are not the reference path:
            // Compute all eight possible geometric orientations (four rotations and four reflections)
            // of the current path and then compare each against the `referencePathString`.

            // --- Rotated Orientations of the Forward Path ---
            // 1. Path as-is, with directions normalized (North-up).
            var northUpFwd = forwardPathString.substituteChar(/n/g, "N").substituteChar(/e/g, "E").substituteChar(/s/g, "S").substituteChar(/w/g, "W");
            // 2. Path rotated 90 degrees clockwise (East-up).
            var eastUpFwd = forwardPathString.substituteChar(/n/g, "E").substituteChar(/e/g, "S").substituteChar(/s/g, "W").substituteChar(/w/g, "N");
            // 3. Path rotated 180 degrees (South-up).
            var southUpFwd = forwardPathString.substituteChar(/n/g, "S").substituteChar(/e/g, "W").substituteChar(/s/g, "N").substituteChar(/w/g, "E");
            // 4. Path rotated 270 degrees clockwise (West-up).
            var westUpFwd = forwardPathString.substituteChar(/n/g, "W").substituteChar(/e/g, "N").substituteChar(/s/g, "E").substituteChar(/w/g, "S");

            // --- Rotated Orientations of the Reflected (Inverted) Path ---
            // These capture the mirrored versions of the path, then rotated.
            // 5. Reflected path, North-up.
            var northUpRev = invertedPathString.substituteChar(/n/g, "N").substituteChar(/e/g, "E").substituteChar(/s/g, "S").substituteChar(/w/g, "W");
            // 6. Reflected path, East-up.
            var eastUpRev = invertedPathString.substituteChar(/n/g, "E").substituteChar(/e/g, "S").substituteChar(/s/g, "W").substituteChar(/w/g, "N");
            // 7. Reflected path, South-up.
            var southUpRev = invertedPathString.substituteChar(/n/g, "S").substituteChar(/e/g, "W").substituteChar(/s/g, "N").substituteChar(/w/g, "E");
            // 8. Reflected path, West-up.
            var westUpRev = invertedPathString.substituteChar(/n/g, "W").substituteChar(/e/g, "N").substituteChar(/s/g, "E").substituteChar(/w/g, "S");


            // Check if the `referencePathString` is strictly equal to any of the
            // eight generated orientations of the current path.
            if (referencePathString === eastUpFwd || referencePathString === southUpFwd || referencePathString === westUpFwd || referencePathString === northUpFwd ||
                referencePathString === eastUpRev || referencePathString === southUpRev || referencePathString === westUpRev || referencePathString === northUpRev) {
                // If a match is found, output the `pathSequenceIndex` (the 1-based index of the current path).
                displayOutput(pathSequenceIndex);
            }
        }
    }

    // After a complete set of paths has been processed (i.e., the inner loop finishes),
    // print a distinctive separator string to the output.
    displayOutput("+++++");
}