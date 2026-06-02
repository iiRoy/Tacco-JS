function processInput(rawData) {
  // Split the raw input string into an array of lines.
  rawData = rawData.split('\n');

  // Iterate over each line of the processed data.
  for (let idx = 0; idx < rawData.length; idx++) {
    // For each line, determine its plural form and print it to the console.
    console.log(pluralizeWord(rawData[idx]));
  }
}

function pluralizeWord(wordToPluralize) {
  // Define a regular expression to check if a string ends with the letter 's'.
  const endsWithSChecker = /s$/;

  // Check if the word already ends with 's'.
  // If it does, append "es" to form the plural.
  // Otherwise, simply append "s".
  return endsWithSChecker.test(wordToPluralize)
    ? wordToPluralize + "es"
    : wordToPluralize + "s";
}

// Read the entire content from standard input, decode it as UTF-8,
// and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
