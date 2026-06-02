function initializeProcessor(rawData) {
  // Split the incoming raw data string by newline characters
  rawData = rawData.split("\n");

  // Parse the first line to get the total number of elements
  totalElements = Number(rawData[0]);

  // Process the second line: split by space and convert each part to a number
  heightMeasurements = rawData[1].split(" ").map(function (measurementValue, indexPosition) {
    return Number(measurementValue); // Convert string to number
  });

  // After setting up the data, invoke the primary processing function
  processData();
}

function processData() {
  // Initialize a variable to count the number of visible items
  var visibleCount = 0;

  // Initialize a variable to keep track of the maximum height encountered so far
  var maxHeightSoFar = 0;

  // Iterate through each height measurement in the collection
  heightMeasurements.forEach(function (measurementValue, indexPosition) {
    // If the current measurement is greater than or equal to the maximum height seen previously
    if (maxHeightSoFar <= measurementValue) {
      // Increment the counter for visible items
      visibleCount++;
      // Update the maximum height encountered
      maxHeightSoFar = measurementValue;
    }
  });

  // Print the final count of visible items to the console
  console.log(visibleCount);
}

// Read input from standard input using Node.js 'fs' module and pass it to the setup function
initializeProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));
