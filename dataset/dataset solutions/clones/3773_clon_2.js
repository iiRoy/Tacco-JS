// This function checks if two objects have the same properties and values.
function areObjectsIdentical(firstObj, secondObj) {
    // Retrieve all enumerable own property names from the first object.
    var firstProps = Object.getOwnPropertyNames(firstObj);
    // Retrieve all enumerable own property names from the second object.
    var secondProps = Object.getOwnPropertyNames(secondObj);

    // If the count of properties differs between the two objects, they cannot be identical.
    if (firstProps.length !== secondProps.length) {
        return false;
    }

    // Iterate through each property name obtained from the first object.
    for (var idx = 0; idx < firstProps.length; idx++) {
        // Compare the value of the current property in both objects.
        // If any property's value is strictly not equal, the objects are not identical.
        if (firstObj[firstProps[idx]] !== secondObj[firstProps[idx]]) {
            return false;
        }
    }
    // If the loop completes without finding any differing properties, the objects are identical.
    return true;
}

// A helper function to parse a string into an integer using base 10.
function parseIntegerBase10(inputString) {
    return parseInt(inputString, 10);
}

// An array containing powers of 6, calculated for specific exponents.
var powersOfSix = [6, 5, 4, 3, 2, 1].map(exponentVal => Math.pow(6, exponentVal));
// An array containing powers of 9, calculated for specific exponents.
var powersOfNine = [5, 4, 3, 2, 1].map(exponentVal => Math.pow(9, exponentVal));

// A recursive function designed to compute a specific value based on an input number.
function calculateValue(inputNumber) {
    // Base case: If the input number is less than 6, return the number itself.
    if (inputNumber < 6) {
        return inputNumber;
    }
    // Another base case: If the input number is less than 9, return 1 plus the difference from 6.
    if (inputNumber < 9) {
        return 1 + (inputNumber - 6);
    }
    // Recursive step: Determine the minimum value by exploring two paths.
    // Path 1: Subtract the largest power of 6 that is less than or equal to the input number.
    // Path 2: Subtract the largest power of 9 that is less than or equal to the input number.
    return Math.min(
        calculateValue(inputNumber - powersOfSix.find(powerVal => powerVal <= inputNumber)) + 1,
        calculateValue(inputNumber - powersOfNine.find(powerVal => powerVal <= inputNumber)) + 1
    );
}

// The primary function responsible for processing the input data and calculating the minimum cost.
function processInputData(rawDataString) {
    // Split the entire raw input string into individual lines.
    var inputLines = rawDataString.split("\n");

    // Extract the grid dimensions (gridSizeN) and the total number of colors (colorCountC) from the first line.
    var [gridSizeN, colorCountC] = inputLines.shift().split(" ").map(valStr => parseIntegerBase10(valStr));

    // Parse the subsequent 'colorCountC' lines to construct the cost matrix (costMatrixD).
    // Each row in this matrix represents the cost of changing from one color to another.
    var costMatrixD = inputLines.splice(0, colorCountC).map(lineStr => lineStr.split(" ").map(valStr => parseIntegerBase10(valStr)));

    // Parse the next 'gridSizeN' lines to form the initial color grid (colorGridC).
    var colorGridC = inputLines.splice(0, gridSizeN).map(lineStr => lineStr.split(" ").map(valStr => parseIntegerBase10(valStr)));

    // Initialize a data structure to store color statistics based on (row + col) modulo 3.
    // This array will hold counts for each color for each of the three remainder groups (0, 1, 2).
    var remainderColorStats = [".".repeat(colorCountC).split("").map(dummy => 0), ".".repeat(colorCountC).split("").map(dummy => 0), ".".repeat(colorCountC).split("").map(dummy => 0)];

    // Populate the remainderColorStats array by iterating through the color grid.
    colorGridC.forEach((rowVal, rowIndex) => rowVal.forEach((cellColor, colIndex) => {
        // Increment the count for the specific color in the appropriate remainder group.
        remainderColorStats[(rowIndex + colIndex) % 3][cellColor - 1]++;
    }));

    // Calculate the total cost for each remainder group if all cells in that group were changed to a specific target color.
    var remainderScores = remainderColorStats.map(currentStats => {
        // This console.log statement is part of the original code's observable behavior and must be preserved.
        console.log(".".repeat(colorCountC).split("").map((dummyChar, targetColorIndex) => currentStats.map((currentCount, sourceColorIndex) => sourceColorIndex === targetColorIndex ? 0 : currentCount * costMatrixD[sourceColorIndex][targetColorIndex])));
        
        // Return an array where each element is the total cost for a specific target color for the current remainder group.
        return ".".repeat(colorCountC).split("").map((dummyChar, targetColorIndex) => currentStats.map((currentCount, sourceColorIndex) => sourceColorIndex === targetColorIndex ? 0 : currentCount * costMatrixD[sourceColorIndex][targetColorIndex]).reduce((accumulator, currentValue) => accumulator + currentValue, 0));
    });

    // Initialize the minimum total cost to a very large number.
    var minimumTotalCost = Infinity;

    // Iterate through all possible combinations of three distinct colors.
    // 'firstColor' for remainder group 0, 'secondColor' for group 1, 'thirdColor' for group 2.
    for (let firstColor = 0; firstColor < colorCountC; firstColor++) {
        for (let secondColor = 0; secondColor < colorCountC; secondColor++) {
            // Ensure the second color is different from the first color.
            if (firstColor === secondColor) {
                continue;
            }
            for (let thirdColor = 0; thirdColor < colorCountC; thirdColor++) {
                // Ensure the third color is different from both the first and second colors.
                if (secondColor === thirdColor || firstColor === thirdColor) {
                    continue;
                }
                // This console.log statement is part of the original code's observable behavior and must be preserved.
                // It logs the color combination if the current total cost is not strictly less than the current minimum.
                if (minimumTotalCost <= remainderScores[0][firstColor] + remainderScores[1][secondColor] + remainderScores[2][thirdColor]) {
                    console.log(firstColor, secondColor, thirdColor);
                }
                // Update the minimum total cost if the current combination yields a lower cost.
                minimumTotalCost = Math.min(minimumTotalCost, remainderScores[0][firstColor] + remainderScores[1][secondColor] + remainderScores[2][thirdColor]);
            }
        }
    }
    // The final console.log statement, preserving all original arguments for behavioral equivalence.
    console.log(rawDataString, remainderColorStats, remainderScores, minimumTotalCost);
}

// Read the input from standard input and pass it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
