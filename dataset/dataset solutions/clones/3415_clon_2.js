function ProcessData(sourceContent) {
    var initialValues;

    sourceContent = sourceContent.split('\n');
    initialValues = sourceContent[0].split(' ');

    // Iterate through the primary dataset and convert string elements to numeric form
    for (var currentIdx = 0; currentIdx < sourceContent.length; currentIdx++) {
        sourceContent[currentIdx] = parseInt(sourceContent[currentIdx], 10);
    }
    // Process the configuration parameters, converting them to integers
    for (var paramIdx = 0; paramIdx < initialValues.length; paramIdx++) {
        initialValues[paramIdx] = parseInt(initialValues[paramIdx], 10);
    }

    var swapBuffer;
    // Arrange elements in ascending order within the primary collection
    // This uses a basic comparison sort mechanism
    for (var outerLoop = 1; outerLoop < sourceContent.length - 1; outerLoop++) {
        for (var innerLoop = 1; innerLoop < sourceContent.length - 1; innerLoop++) {
            if (sourceContent[innerLoop] > sourceContent[outerLoop]) {
                swapBuffer = sourceContent[innerLoop];
                sourceContent[innerLoop] = sourceContent[outerLoop];
                sourceContent[outerLoop] = swapBuffer;
            }
        }
    }

    var minimumGap;
    // Calculate the initial absolute difference between two specific elements
    minimumGap = Math.abs(sourceContent[1] - sourceContent[initialValues[1]]);
    // console.log("Initial calculated gap:", minimumGap); // Debug log example

    // Traverse the sorted collection to find the smallest difference between elements
    // based on a sliding window determined by initial configuration
    for (var windowStart = 1; windowStart < sourceContent.length - 2 - initialValues[1]; windowStart++) {
        // console.log("Current window difference:", sourceContent[windowStart + initialValues[1] - 1] - sourceContent[windowStart]); // Another debug log
        if (minimumGap > sourceContent[windowStart + initialValues[1]] - sourceContent[windowStart]) {
            // console.log("Found a smaller difference!"); // Debug output
            // console.log("New absolute difference candidate:", Math.abs(sourceContent[1] - sourceContent[windowStart + initialValues[1] - 1])); // More debug
            minimumGap = sourceContent[windowStart + initialValues[1]] - sourceContent[windowStart];
        }
    }

    console.log(minimumGap);
}

ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));