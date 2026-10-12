function ProcessStringData(rawData) {
  // Remove any leading or trailing whitespace from the initial input string.
  let processedInput = rawData.trim();

  // Divide the cleaned input into an array of individual lines.
  const lineSegments = processedInput.split("\n");

  // The first line is expected to be a number representing the length of the target string.
  const stringLength = parseInt(lineSegments[0], 10);
  // The second line contains the actual string that will be analyzed.
  const targetString = lineSegments[1];

  // Initialize an array to store the calculated counts of common unique characters.
  let commonCharCounts = [];

  // Iterate through all possible split points within the target string.
  // 'splitIndex' represents the length of the first segment of the string.
  for (let splitIndex = 1; splitIndex < stringLength; splitIndex++) {
    // Extract the first part of the string, from the beginning up to 'splitIndex',
    // then convert it into an array of characters.
    let firstPartChars = targetString.substring(0, splitIndex).split('');
    // Create a new array containing only the unique characters from the first part.
    let uniqueFirstPart = firstPartChars.filter((charItem, idx, currentArray) => currentArray.indexOf(charItem) === idx);

    // Extract the second part of the string, starting from 'splitIndex' to the end,
    // and convert it into an array of characters.
    let secondPartChars = targetString.substring(splitIndex, stringLength).split('');
    // Create a new array containing only the unique characters from the second part.
    let uniqueSecondPart = secondPartChars.filter((charItem, idx, currentArray) => currentArray.indexOf(charItem) === idx);

    // Combine the unique characters from both the first and second parts into a single array.
    let combinedUniqueChars = uniqueFirstPart.concat(uniqueSecondPart);

    // Identify characters that are present in both 'uniqueFirstPart' and 'uniqueSecondPart'.
    // This is done by filtering 'combinedUniqueChars' to find elements that appear more than once,
    // ensuring we only count each common character once.
    let intersectingChars = combinedUniqueChars.filter(function (charItem, idx, currentArray) {
      return currentArray.indexOf(charItem) === idx && idx !== currentArray.lastIndexOf(charItem);
    });

    // Add the count of these intersecting (common unique) characters to our results array.
    commonCharCounts.push(intersectingChars.length);
  }

  // After checking all split points, find and print the maximum count of common unique characters.
  console.log(Math.max.apply(null, commonCharCounts));
}

// Execute the main processing function by reading input from standard input.
// This setup is common in Node.js environments for competitive programming.
ProcessStringData(require("fs").readFileSync("/dev/stdin", "utf8"));
