import * as fs from 'fs';
import bigInt from 'big-integer';

const processInputData = (sourceContent) => {
  const contentLines = sourceContent.split('\n');
  const numberOfStrings = Number(contentLines[0]);

  // Utilize a Map object for counting string occurrences,
  // diverging from the original's plain object usage.
  // Employ a functional 'reduce' pattern to populate the frequency map.
  const stringFrequencies = contentLines.slice(1, numberOfStrings + 1).reduce((accumulatorMap, currentEntry) => {
    accumulatorMap.set(currentEntry, (accumulatorMap.get(currentEntry) || 0) + 1);
    return accumulatorMap;
  }, new Map());

  // Determine the highest frequency encountered among all strings.
  // Use Math.max with the spread operator for a more declarative approach.
  let highestFrequencyValue = 0;
  if (stringFrequencies.size > 0) {
    highestFrequencyValue = Math.max(...stringFrequencies.values());
  }

  // Filter for strings that match the highest frequency and then sort them lexicographically.
  // This sequence of Array.from, filter, map, and sort represents a substantially
  // different implementation strategy compared to the original's imperative loops
  // and direct array manipulation.
  const topRankedStrings = Array.from(stringFrequencies.entries())
    .filter(([, frequency]) => frequency === highestFrequencyValue)
    .map(([text]) => text)
    .sort(); // Default sort for strings is lexicographical (alphabetical)

  // Output each of the top-ranked strings.
  topRankedStrings.forEach(outputItem => console.log(outputItem));
};

// Read input from the standard input and pass it to the processing function.
processInputData(fs.readFileSync('/dev/stdin', 'utf8'));
