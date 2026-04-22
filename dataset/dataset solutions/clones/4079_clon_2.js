function ProcessData(rawData) {
    // This function processes a given raw data string to compute a specific maximum value.

    // First, split the entire raw input into individual lines.
    rawData = rawData.split("\n");

    // Extract initial parameters from the very first line of input.
    // These parameters define the problem's scope and dimensions.
    var initialNumbers = rawData[0].split(" ").map(stringValue => parseInt(stringValue, 10));

    // 'periodSize' corresponds to 'K' in the original problem, defining a cyclic period.
    var periodSize = initialNumbers[1];

    // 'itemCount' corresponds to 'N', representing the total number of data entries.
    var itemCount = initialNumbers[0];

    // Initialize arrays to store processed geometric coordinates and associated flags.
    var xCoordinates = []; // Stores x-values after modulo operation
    var yCoordinates = []; // Stores y-values after modulo operation
    var orientationFlags = []; // Stores 0 or 1 based on 'W' or 'B'

    // A general purpose loop index, mimicking the original's reuse of 'i'.
    var loopIterator;

    // Iterate through each data entry provided in the input, starting from the second line.
    for (loopIterator = 0; loopIterator < itemCount; loopIterator++) {
        // Split the current line into its constituent parts (x, y, color/orientation).
        var currentEntryParts = rawData[loopIterator + 1].split(" ");

        // Temporarily store the raw split parts before processing individual components.
        xCoordinates[loopIterator] = currentEntryParts;

        // Process the y-coordinate: parse as integer and apply modulo (periodSize * 2).
        yCoordinates[loopIterator] = parseInt(currentEntryParts[1], 10) % (periodSize * 2);

        // Determine the orientation flag: 'W' (White) maps to 0, 'B' (Black) maps to 1.
        orientationFlags[loopIterator] = (currentEntryParts[2] === "W" ? 0 : 1);

        // Process the x-coordinate: parse as integer and apply modulo (periodSize * 2).
        xCoordinates[loopIterator] = parseInt(currentEntryParts[0], 10) % (periodSize * 2);
    }

    // Initialize the variable that will hold the maximum count found throughout the process.
    var maximumAchievedCount = 0;

    // Begin the main calculation loop, iterating through all possible offsets (0 to periodSize - 1).
    // The 'loopIterator' variable is reused here, similar to the original code structure.
    for (loopIterator = 0; loopIterator < periodSize; loopIterator++) {
        // 'currentCalculationSum' tracks the sum for the current offset and subsequent adjustments.
        var currentCalculationSum = 0;

        // Initialize two auxiliary arrays, 'positiveContributions' and 'negativeContributions',
        // to store counts based on y-coordinates for later adjustments.
        var positiveContributions = new Array(periodSize * 2).fill(0);
        var negativeContributions = new Array(periodSize * 2).fill(0);

        // Inner loop: process each data element to update 'currentCalculationSum' and auxiliary arrays.
        for (var elementIndex = 0; elementIndex < itemCount; elementIndex++) {
            // Apply the core logic: a bitwise operation involving x, y, current offset, and period size,
            // then compare with the stored orientation flag.
            if ((((xCoordinates[elementIndex] + loopIterator) / periodSize ^ yCoordinates[elementIndex] / periodSize) & 1) === orientationFlags[elementIndex]) {
                currentCalculationSum++;
                positiveContributions[yCoordinates[elementIndex]]++;
            } else {
                negativeContributions[yCoordinates[elementIndex]]++;
            }
        }

        // Update the overall maximum count if the current sum is greater.
        if (maximumAchievedCount < currentCalculationSum) {
            maximumAchievedCount = currentCalculationSum;
        }
        // Also, check the complement (total items minus current sum) as a potential maximum.
        if (maximumAchievedCount < itemCount - currentCalculationSum) {
            maximumAchievedCount = itemCount - currentCalculationSum;
        }

        // Perform a series of adjustments to 'currentCalculationSum' based on the auxiliary arrays.
        // This loop iterates 'periodSize - 1' times.
        for (var adjustmentIndex = 0; adjustmentIndex < periodSize - 1; adjustmentIndex++) {
            // Modify the sum using values from both 'positiveContributions' and 'negativeContributions'
            // at the current index and an index offset by 'periodSize'.
            currentCalculationSum += negativeContributions[adjustmentIndex] - positiveContributions[adjustmentIndex] + negativeContributions[adjustmentIndex + periodSize] - positiveContributions[adjustmentIndex + periodSize];

            // After each adjustment, re-evaluate and update the 'maximumAchievedCount'.
            if (maximumAchievedCount < currentCalculationSum) {
                maximumAchievedCount = currentCalculationSum;
            }
            // Again, check the complement as well.
            if (maximumAchievedCount < itemCount - currentCalculationSum) {
                maximumAchievedCount = itemCount - currentCalculationSum;
            }
        }
    }

    // Finally, print the computed maximum value to the console.
    console.log(maximumAchievedCount);
}

// Read the input from standard input using Node.js's file system module,
// ensuring UTF-8 encoding, and then pass it to the main processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));