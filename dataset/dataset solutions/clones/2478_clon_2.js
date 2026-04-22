function executeCoreLogic(sourceInputLine) {
    // Parse the first numeric component from the input.
    let valA = sourceInputLine.split(/\s+/g)[0];

    // Obtain the second numeric component.
    let valB = sourceInputLine.split(/\s+/g)[1];

    // Retrieve the third crucial numeric component.
    let valX = sourceInputLine.split(/\s+/g)[2];

    let currentAngleRad = 0; // Initialize the angular value in radians.

    // Apply conditional branching based on the relationship between valX, valB, and valA.
    if (valX >= valB * (valA * valA) / 2) {
        // Calculation for the initial scenario.
        currentAngleRad = Math.atan(2 / valA * (valB - valX / (valA * valA)));
    } else {
        // Alternative calculation path.
        currentAngleRad = Math.atan(valA * (valB * valB) / (2 * valX));
    }

    // Convert the radian measurement into degrees for the final output.
    let finalDegreeMeasurement = currentAngleRad * (180 / Math.PI);

    // Display the computed result to the standard output.
    console.log(finalDegreeMeasurement);
}

// Program's entry point: reads data and invokes the main processing function.
executeCoreLogic(
    require('fs').readFileSync(
        '/dev/stdin',    // Standard input file path.
        'utf8'           // Encoding format for reading the file.
    )
);