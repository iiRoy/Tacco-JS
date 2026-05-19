(function(inputContent) {
    // This function processes input data to generate ASCII frames.

    // Split the entire input string by newline characters to get individual lines.
    var lineData = inputContent.split('\n');
    // An array to store parsed width and height values for each line.
    var dimensionPairs = [];

    // Loop through each line of the input data.
    for (var currentIdx = 0, totalEntries = lineData.length; currentIdx < totalEntries; currentIdx++) {
        // Split the current line by space to separate width and height.
        dimensionPairs[currentIdx] = lineData[currentIdx].split(' ');

        // Convert the string representations of width and height to numeric values.
        // The `- 0` operation is a common JavaScript trick for type coercion to number.
        var currentWidth = dimensionPairs[currentIdx][0] - 0;
        var currentHeight = dimensionPairs[currentIdx][1] - 0;

        // If both width and height are zero, it's a termination signal.
        // The function should stop processing further input.
        if (currentWidth === 0 && currentHeight === 0) {
            return; // Exit the anonymous function.
        }

        // Construct the top and bottom border line of the frame.
        // It consists of 'currentWidth' hash characters followed by a newline.
        var horizontalBorder = new Array(currentWidth + 1).join('#') + '\n';

        // Construct the pattern for the middle rows of the frame.
        // It starts with '#', followed by 'currentWidth - 2' dots, then another '#', and a newline.
        // If currentWidth is 1, it becomes '#\n'. If currentWidth is 2, it becomes '##\n'.
        var interiorRowPattern = '#' + (new Array(currentWidth - 1).join('.') + ('#') + '\n');

        // Assemble the complete ASCII frame.
        // It starts with the top border, followed by 'currentHeight - 2' repetitions of the interior row pattern,
        // and finally the bottom border, with an extra newline at the very end for spacing.
        var completeFrameOutput = horizontalBorder + (new Array(currentHeight - 1).join(interiorRowPattern)) + horizontalBorder + '\n';

        // Output the generated frame to the console.
        console.log(completeFrameOutput);
    }
}(require('fs').readFileSync('/dev/stdin', 'utf8'))); // Read input from standard input using Node.js 'fs' module.
