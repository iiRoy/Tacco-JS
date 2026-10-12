function ProcessInput(rawData) {
  // This function processes the given input string to determine a specific pattern.
  let charSequence = rawData.split(""); // Converts the input string into an array of individual characters.

  const frequencyMap = {}; // Initializes an empty object to store the frequency of each character.

  // Iterates through each character in the sequence.
  for (const currentChar of charSequence) {
    // If the character is already in the map, increment its count; otherwise, initialize its count to 1.
    frequencyMap[currentChar] = (frequencyMap[currentChar] !== undefined) ? (frequencyMap[currentChar] + 1) : 1;
  }

  // Checks for a specific pattern: exactly two unique characters, each appearing exactly twice.
  if (Object.keys(frequencyMap).length === 2 && // Ensures there are precisely two distinct characters.
      frequencyMap[Object.keys(frequencyMap)[0]] === 2 && // Verifies the first unique character appears twice.
      frequencyMap[Object.keys(frequencyMap)[1]] === 2) { // Verifies the second unique character also appears twice.
    console.log('Yes'); // If the pattern matches, output 'Yes'.
  } else {
    console.log('No'); // Otherwise, output 'No'.
  }
}

// Reads input from standard input and passes it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
