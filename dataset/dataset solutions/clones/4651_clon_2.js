// This script processes input from stdin to find the minimum frequency of each character
// across multiple lines, then outputs a sorted string of those characters repeated
// by their minimum observed frequency.

// Step 1: Read input, parse lines, and calculate character frequencies per line.
const charMinCounts = (String(require("fs").readFileSync(0))) // Read all input from stdin (fd 0) as a string.
  .split('\n') // Divide the input string into an array of lines using newline as a delimiter.
  .slice(1, -1) // Remove the first and last elements of the array (often empty lines or headers).
  .map(currentLine => { // For each remaining line, create an object mapping characters to their counts.
    // Split the current line into an array of individual characters.
    return currentLine.split('').reduce((charOccurrences, singleChar) => {
      // Increment the count for the current character.
      // The -~ operator is a concise way to increment a number, treating undefined as 0.
      charOccurrences[singleChar] = -~charOccurrences[singleChar];
      return charOccurrences; // Return the updated character occurrences object.
    }, {}); // Initialize the character occurrences object as empty for each line.
  })
  .reduce((combinedCounts, lineCharCounts) => { // Aggregate character counts across all lines.
    // Iterate over each character key present in the accumulated combinedCounts.
    for (const charKey in combinedCounts) {
      // Update the count for charKey to be the minimum of its current count
      // and its count in the current line's character map (lineCharCounts).
      // If charKey is not in lineCharCounts, lineCharCounts[charKey] is undefined,
      // so `|| 0` ensures it's treated as zero for the minimum calculation.
      combinedCounts[charKey] = Math.min(combinedCounts[charKey], lineCharCounts[charKey] || 0);
    }
    return combinedCounts; // Return the object with minimum character counts.
  });

// Step 2: Construct an array of strings, where each string is a character repeated
// by its minimum frequency.
const repeatedCharsArray = []; // Initialize an empty array to hold the repeated character strings.

// Loop through each character (key) and its minimum count in the final charMinCounts object.
for (const charKey in charMinCounts) {
  // Create a string by repeating the character 'charKey' 'charMinCounts[charKey]' times.
  repeatedCharsArray.push(charKey.repeat(charMinCounts[charKey]));
}

// Step 3: Sort the array of repeated character strings and print the concatenated result.
// Sort the array alphabetically.
// Join all elements of the sorted array into a single string without any separator.
console.log(repeatedCharsArray.sort().join(''));
