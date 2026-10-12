function ProcessInput(rawData) {
  // Split the entire input string into individual text segments based on newline characters.
  const textSegments = rawData.split('\n');

  // Initialize an object to store the frequency of each lowercase character.
  // Using an object as a hash map for character counts.
  const charOccurrences = {};

  // Iterate over each segment of text.
  for (const segmentIndex in textSegments) {
    // If a segment is empty, it signifies the end of meaningful input, so break the loop.
    if (textSegments[segmentIndex] === "") {
      break;
    }

    // Iterate through each character within the current text segment.
    for (let charPosition = 0; charPosition < textSegments[segmentIndex].length; ++charPosition) {
      // Convert the current character to lowercase to ensure case-insensitive counting.
      const currentCharacter = textSegments[segmentIndex][charPosition].toLowerCase();

      // Check if the character has been encountered before.
      if (!charOccurrences[currentCharacter]) {
        // If it's the first time seeing this character, initialize its count to 1.
        charOccurrences[currentCharacter] = 1;
      } else {
        // If the character has been seen, increment its existing count.
        charOccurrences[currentCharacter]++;
      }
    }
  }

  // Loop through all lowercase English alphabet characters from 'a' to 'z'.
  // ASCII values for 'a' (0x61) to 'z' (0x7a).
  for (let charCode = 0x61; charCode <= 0x7a; ++charCode) {
    // Convert the ASCII code back to its corresponding character.
    const currentLetter = String.fromCharCode(charCode);

    // Retrieve the count for the current letter, defaulting to 0 if not found.
    const letterCount = charOccurrences[currentLetter] ? charOccurrences[currentLetter] : 0;

    // Print the character and its total occurrence count to the console.
    console.log(currentLetter + " : " + letterCount);
  }
}

// Read the entire content from standard input synchronously and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
