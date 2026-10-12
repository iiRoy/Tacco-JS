function ProcessInputData(rawData) {
  // Split the raw input string into an array of lines
  let processedLines = rawData.split("\n");

  // The first line contains the count of numbers
  let itemCount = processedLines[0];

  // The second line contains the space-separated numbers
  let numericValues = processedLines[1].split(" ");

  // Sort the array of string numbers numerically
  numericValues.sort(function(firstVal, secondVal) {
    // Convert strings to integers for proper numerical comparison
    return parseInt(firstVal, 10) - parseInt(secondVal, 10);
  });

  // Iterate through the sorted array to check for adjacent duplicates
  for (let idx = 0; idx < itemCount - 1; idx++) {
    // If an element is identical to its immediate successor, a duplicate exists
    if (numericValues[idx] === numericValues[idx + 1]) {
      console.log("NO"); // Output "NO" indicating duplicates
      return; // Exit the function immediately
    }
  }

  // If the loop completes without finding any duplicates, all numbers are unique
  console.log("YES"); // Output "YES" indicating no duplicates
}
