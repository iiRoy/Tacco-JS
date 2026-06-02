function ProcessInput(rawData) {
    // Remove leading/trailing whitespace from the raw input string
    rawData = rawData.trim();

    // Convert the cleaned string input to an integer, using base 10
    var sideCount = parseInt(rawData, 10);

    // Calculate the sum of interior angles for a polygon with 'sideCount' sides
    // The formula is (n - 2) * 180 degrees
    var totalAngleSum = (sideCount - 2) * 180;

    // Display the computed sum of angles to the standard output
    console.log(totalAngleSum);
}

// Read the entire content from standard input synchronously and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
