function ProcessInput(rawData) {
    // Split the incoming data string into individual lines.
    let lines = rawData.split("\n");

    // Extract the first numerical value, representing one base of the trapezoid.
    let sideA = parseInt(lines[0], 10);

    // Extract the second numerical value, representing the other base of the trapezoid.
    let sideB = parseInt(lines[1], 10);

    // Extract the third numerical value, representing the perpendicular height.
    let heightVal = parseInt(lines[2], 10);

    // Compute the area of the trapezoid using the standard formula.
    let areaResult = (sideA + sideB) * heightVal / 2;

    // Display the computed area as an integer.
    console.log('%d', areaResult);
}

// Read the entire content from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
