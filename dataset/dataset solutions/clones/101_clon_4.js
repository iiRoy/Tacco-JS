const fileSystem = require('fs');

// Read all standard input content as a single string
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Process the raw content into an array of trimmed lines
const rawInputLines = rawInputContent.trim().split('\n');

/**
 * Groups an array of lines into pairs.
 * Each pair consists of two consecutive lines from the input.
 * @param {string[]} allLines - An array of input lines.
 * @returns {string[][]} An array where each element is a two-element array [line1, line2].
 */
function groupLinesIntoPairs(allLines) {
  const linePairs = [];
  for (let lineIndex = 0; lineIndex < allLines.length; lineIndex += 2) {
    linePairs.push([allLines[lineIndex], allLines[lineIndex + 1]]);
  }
  return linePairs;
}

/**
 * Analyzes a pair of string sequences to find positional and content matches.
 * @param {string[]} sequenceStrings - A two-element array [primaryString, secondaryString].
 * @returns {number[]} A two-element array [positionalMatches, contentMatches].
 */
function analyzeSequencePair(sequenceStrings) {
  const [primaryString, secondaryString] = sequenceStrings;

  // Split and trim each string into an array of elements
  const primaryElements = primaryString.trim().split(' ');
  const secondaryElements = secondaryString.trim().split(' ');

  // Calculate positional matches: elements that are identical and at the same index
  const positionalMatches = primaryElements.filter((element, index) =>
    element === secondaryElements[index]
  ).length;

  // Create a Set from the secondary elements for efficient content lookup
  const secondaryElementsSet = new Set(secondaryElements);

  // Calculate content matches: elements from primary that exist anywhere in secondary
  const contentMatches = primaryElements.filter(element =>
    secondaryElementsSet.has(element)
  ).length;

  return [positionalMatches, contentMatches];
}

// Group the raw input lines into pairs
const groupedInput = groupLinesIntoPairs(rawInputLines);

// Process each pair to get the match counts
const computedResults = groupedInput.map(analyzeSequencePair);

// Output the results for each pair
computedResults.forEach(matchPair => {
  console.log(matchPair[0], matchPair[1]);
});
