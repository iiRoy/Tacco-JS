function processInputData(rawData) {
  // Trim any leading or trailing whitespace from the raw input string.
  rawData = rawData.trim();

  // Split the input string by spaces and parse the three integer values.
  const startVal = parseInt(rawData.split(" ")[0], 10);
  const endVal = parseInt(rawData.split(" ")[1], 10);
  const countLimit = parseInt(rawData.split(" ")[2], 10);

  // Initialize an empty array to store the unique numbers.
  var resultCollection = [];

  // First pass: Add numbers starting from 'startVal' up to 'countLimit' times,
  // as long as they don't exceed 'endVal'.
  for (var idx = 0; idx < countLimit; idx++) {
    if (startVal + idx <= endVal) {
      resultCollection.push(startVal + idx);
    }
  }

  // Second pass: Add numbers counting down from 'endVal' up to 'countLimit' times.
  // Only add if the number is not already in the collection and is not less than 'startVal'.
  for (var idx = 0; idx < countLimit; idx++) {
    const currentVal = endVal - idx;
    if (resultCollection.indexOf(currentVal) === -1) {
      if (startVal <= currentVal) {
        resultCollection.push(currentVal);
      }
    }
  }

  // Sort the collected numbers in ascending order using a custom comparison function.
  resultCollection.sort(function(valA, valB) {
    if (valA < valB) {
      return -1; // valA comes before valB
    }
    if (valA > valB) {
      return 1; // valA comes after valB
    }
    return 0; // valA and valB are equal
  });

  // Iterate through the sorted collection and print each number to the console.
  for (var idx = 0; idx < resultCollection.length; idx++) {
    console.log(resultCollection[idx]);
  }
}

// Read input from standard input and pass it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
