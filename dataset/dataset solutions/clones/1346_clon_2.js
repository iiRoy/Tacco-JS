function ProcessInput(dataValue) {
  // Convert the incoming string value to an integer for numerical operations.
  dataValue = parseInt(dataValue);

  // Calculate the area of a circle (π * radius^2) and its circumference (2 * π * radius).
  // The 'dataValue' is used as the radius for these calculations.
  console.log(
    "%d %d",
    Math.PI * dataValue * dataValue, // First value: Area
    Math.PI * 2 * dataValue // Second value: Circumference
  );
}

// Read the content of the file "b.txt" synchronously using Node.js's file system module.
// The content is expected to be a string, which is then passed to the processing function.
ProcessInput(require("fs").readFileSync("b.txt", "utf8"));
