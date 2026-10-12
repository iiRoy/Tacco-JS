function processInput(rawData) {
  // Remove any leading or trailing whitespace from the initial input string.
  let cleanedString = rawData.trim();

  // Convert the cleaned string into an array of individual characters for processing.
  const charSequence = cleanedString.split('');

  // Count the occurrences of the character 'a' within the character sequence.
  // The 'match' method is called on the array, which implicitly converts it to a string (e.g., "a,b,c").
  // If no matches are found, 'match' returns null, so '|| []' ensures we always have an array to get 'length' from.
  let countOfA = (charSequence.match(/a/g) || []).length;

  // Similarly, count the occurrences of the character 'b'.
  let countOfB = (charSequence.match(/b/g) || []).length;

  // And count the occurrences of the character 'c'.
  let countOfC = (charSequence.match(/c/g) || []).length;

  // Check if each of the characters 'a', 'b', and 'c' appeared exactly once.
  // Output 'Yes' if this condition is met, otherwise output 'No'.
  console.log((countOfA === 1 && countOfB === 1 && countOfC === 1) ? 'Yes' : 'No');
}

// The program begins by reading the entire content from standard input.
// It uses the 'fs' module to synchronously read the file at '/dev/stdin' with UTF-8 encoding.
// This content is then passed as an argument to the 'processInput' function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
