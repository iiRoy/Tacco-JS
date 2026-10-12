function processInput(rawData) {
    // The raw input string is split into an array of lines.
    rawData = rawData.split("\n");

    // The first line of input is further split by space to get individual coordinate strings.
    var coordinates = rawData[0].split(" ");

    // The first coordinate string is parsed as an integer for the X-coordinate.
    var coordX = parseInt(coordinates[0], 10);
    // The first coordinate string is also parsed as an integer for the Y-coordinate.
    // This replicates the original code's behavior where Y was assigned the same value as X.
    var coordY = parseInt(coordinates[0], 10);

    // A preliminary check: if the sum of coordX and coordY is not divisible by 3,
    // the program outputs 0 and terminates.
    if ((coordX + coordY) % 3 !== 0) {
        console.log(0);
        return;
    }

    // Calculate an intermediate value 'valA' using the coordinates.
    var valA = (2 * coordY - coordX) / 3;
    // Calculate another intermediate value 'valB' based on coordY and valA.
    var valB = coordY - (2 * valA);

    // If either valA or valB is negative, it indicates an invalid state,
    // so the program outputs 0 and terminates.
    if (valA < 0 || valB < 0) {
        console.log(0);
        return;
    }

    // Calculate the sum of valA and valB.
    var sumVals = valA + valB;
    // Determine the smaller of valA and valB.
    var minVal = (valA > valB) ? valB : valA;

    // Initialize variables to accumulate factorial-like products.
    var numeratorFactorial = 1;
    var denominatorFactorial = 1;

    // A loop iterates 'minVal' times to compute parts of a combinatorial expression.
    for (var loopCounter = 0; loopCounter < minVal; loopCounter++) {
        // The numerator product is updated by multiplying with (sumVals - loopCounter).
        numeratorFactorial *= sumVals - loopCounter;
        // The denominator product is updated by multiplying with (loopCounter + 1).
        denominatorFactorial *= loopCounter + 1;
    }

    // The final result, which is the division of the two accumulated products, is printed to the console.
    console.log(numeratorFactorial / denominatorFactorial);
}

// This standard boilerplate code reads input from stdin and passes it to the main processing function.
// It should remain unchanged to ensure compatibility with the execution environment.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
