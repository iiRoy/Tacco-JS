'use strict'

// This function processes the incoming raw text data.
const processInput = (rawData) => {
  // Split the entire input string by newline characters to get an array of individual lines.
  const lines = rawData.split('\n')

  // The first line is expected to be a number, representing the count of words.
  const numWords = Number(lines[0])

  // Remove the first element (the count) from the 'lines' array,
  // so 'lines' now contains only the actual words.
  lines.shift()

  // Create a new array containing only the unique words from the 'lines' array.
  // This is done by filtering out elements whose first occurrence index is not their current index.
  let uniqueWords = lines.filter((currentWord, idx, arrRef) => arrRef.indexOf(currentWord) === idx)

  // Check if the number of unique words found matches the expected number of words.
  if (uniqueWords.length !== numWords) {
    // If they don't match, it means there were duplicate words when none were expected,
    // or the count was incorrect. Output 'No' and terminate.
    console.log('No')
    return
  } else {
    // If the unique word count matches, proceed to check the word chain rule.
    // Iterate through the words starting from the second word (index 1).
    for (let k = 1; k < lines.length; k++) {
      // Compare the last character of the previous word with the first character of the current word.
      // The slice(-1) gets the last character, and slice(0, 1) gets the first character.
      if (lines[k - 1].slice(-1) !== lines[k].slice(0, 1)) {
        // If the characters do not match, the word chain rule is broken.
        // Output 'No' and terminate.
        console.log('No')
        return
      }
    }
  }

  // If all checks (unique word count and word chain rule) pass,
  // then the input satisfies all conditions. Output 'Yes'.
  console.log('Yes')
}

// Read the entire content of standard input as a UTF-8 string
// and pass it to the 'processInput' function for execution.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'))
