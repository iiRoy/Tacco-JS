function ProcessInput(rawData) {
  // Split the entire input string by newline characters to get individual lines.
  rawData = rawData.split("\n");

  // Parse the first line to extract three integer values.
  let count = parseInt(rawData[0].split(" ")[0]); // Represents 'n' from original.
  let valZ = parseInt(rawData[0].split(" ")[1]);  // Represents 'z' from original.
  let valW = parseInt(rawData[0].split(" ")[2]);  // Represents 'w' from original.

  // Split the second line into an array of string representations of numbers.
  let tempArr = rawData[1].split(" "); // Represents 'tmp' from original.

  // Initialize a variable to store the final computed result.
  let finalResult = 0; // Represents 'ans' from original.

  // Create a new array of size 'count' and fill it with zeros.
  let dataArray = new Array(count).fill(0); // Represents 'a' from original.

  // Iterate through the temporary string array and parse each element into an integer,
  // storing it in the main data array.
  for (let idx = 0; idx < count; idx++) { // Represents 'i' from original.
    dataArray[idx] = parseInt(tempArr[idx]);
  }

  // Initialize variables to find the maximum and minimum values in the data array.
  let maxValue = 0; // Represents 'max' from original.
  let minValue = 1000000000; // Represents 'min' from original, a large initial value.

  // Loop through the data array to determine the actual maximum and minimum values.
  for (let idx = 0; idx < count; idx++) { // Represents 'i' from original.
    maxValue = Math.max(maxValue, dataArray[idx]);
    minValue = Math.min(minValue, dataArray[idx]);
  }

  // Calculate the final result using Math.max and Math.abs based on specific conditions.
  // This involves comparing absolute differences between maxValue, valW, the last element of dataArray, and minValue.
  finalResult = Math.max(
    Math.abs(maxValue - valW),
    Math.abs(maxValue - dataArray[count - 1]),
    Math.abs(dataArray[count - 1] - minValue)
  );

  // Output the calculated final result to the console.
  console.log('%s', finalResult);
}

// Read the entire content from standard input synchronously and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
