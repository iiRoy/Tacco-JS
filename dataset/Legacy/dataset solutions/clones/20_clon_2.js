let inputValues = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split(/\s/);

// Iterate through the collected input values.
// The 'idx' variable serves as a pointer to the current position in the 'inputValues' array.
for (let idx = 0; idx < inputValues.length;) {
    // Extract six numerical coefficients for a system of linear equations.
    // Each coefficient is retrieved, and the index is advanced immediately.
    let coeffA = inputValues[idx++];
    let coeffB = inputValues[idx++];
    let coeffC = inputValues[idx++];
    let coeffD = inputValues[idx++];
    let coeffE = inputValues[idx++];
    let coeffF = inputValues[idx++];

    // Calculate the value of the second unknown variable, 'resultY'.
    // This step applies a formula derived from solving a 2x2 linear system.
    let resultY = (coeffC * coeffD - coeffA * coeffF) / (coeffB * coeffD - coeffA * coeffE);

    // Calculate the value of the first unknown variable, 'resultX'.
    // This calculation uses the 'resultY' value obtained in the previous step.
    let resultX = (coeffC - coeffB * resultY) / coeffA;

    // Adjust 'resultX' and 'resultY' by rounding them to three decimal places.
    // This is achieved by multiplying by 1000, rounding to the nearest integer,
    // and then dividing by 1000. This modifies the variables in place.
    resultX = Math.round(resultX * 1000) / 1000;
    resultY = Math.round(resultY * 1000) / 1000;

    // Print the final calculated values of 'resultX' and 'resultY'.
    // Each value is formatted to exactly three decimal places, and they are
    // separated by a single space in the output.
    console.log(resultX.toFixed(3) + " " + resultY.toFixed(3));
}
