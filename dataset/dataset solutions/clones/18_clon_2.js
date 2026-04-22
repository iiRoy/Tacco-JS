let cumulativeText = "";

// Configure the standard input stream to handle incoming data efficiently
process.stdin.resume(); // Ensures the input stream remains active for data reception
process.stdin.setEncoding("utf8"); // Specifies character encoding for correct data interpretation

// Attaches an event listener for when new data portions arrive from standard input
process.stdin.on("data", (dataPortion) => {
  // Appends each received data segment to the overall buffer for later processing
  cumulativeText += dataPortion;
});

// Attaches an event listener for when the standard input stream indicates its completion
process.stdin.on("end", () => {
  // Once all input has been fully received, the entire buffer is split into individual lines
  // Each line is expected to contain parameters for a distinct system of equations
  cumulativeText = cumulativeText.split("\n");
  // Initiates the primary processing routine using the collected and segmented input
  executeCalculations();
});

// Primary function responsible for iterating through input lines and performing necessary computations
function executeCalculations() {
  // Loops through each single line present in the prepared input data array
  for (let currentLineNum = 0; currentLineNum < cumulativeText.length; currentLineNum++) {
    // Parses the current line into its constituent string parts, assuming values are space-separated
    let lineSegments = cumulativeText[currentLineNum].split(" ");

    // Extracts numerical coefficients and constants from the segmented line array
    // Explicitly converts each string part to a floating-point number for accurate arithmetic operations
    let valA = parseFloat(lineSegments[0]);
    let valB = parseFloat(lineSegments[1]);
    let valC = parseFloat(lineSegments[2]);
    let valD = parseFloat(lineSegments[3]);
    let valE = parseFloat(lineSegments[4]);
    let valF = parseFloat(lineSegments[5]);

    // Computes the value of the first unknown variable, designated as solutionX
    // This calculation directly solves for 'x' within a system of two linear equations:
    // valA*x + valB*y = valC
    // valD*x + valE*y = valF
    let solutionX = (valB * valF - valE * valC) / (valD * valB - valA * valE);

    // Computes the value of the second unknown variable, designated as solutionY
    // This is derived using back-substitution into the first equation: y = (valC - valA*x) / valB
    let solutionY = (valC - valA * solutionX) / valB;

    // Prints the calculated solutions, solutionX and solutionY, formatted to three decimal places
    console.log(solutionX.toFixed(3), solutionY.toFixed(3));
  }
}