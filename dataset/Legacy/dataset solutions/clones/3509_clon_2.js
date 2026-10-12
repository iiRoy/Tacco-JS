function processInputData(rawData) {
  // Parse the total number of elements from the first line of input.
  // The value itself is not used in the subsequent logic, but its parsing is preserved.
  const totalElements = parseInt(rawData[0].split(' ')[0], 10);

  // Convert the second line of input into an array of numerical values.
  const numericSequence = rawData[1].split(' ').map(valString => Number(valString));

  // Initialize two objects to store frequency counts:
  // one for numbers at even indices, and one for numbers at odd indices.
  const evenIndexedCounts = {};
  const oddIndexedCounts = {};

  // Iterate through the numeric sequence to populate the count objects.
  numericSequence.forEach((currentValue, currentIndex) => {
    if (currentIndex % 2 === 0) {
      // If the index is even, increment the count for this number in 'evenIndexedCounts'.
      evenIndexedCounts[currentValue] = (evenIndexedCounts[currentValue] || 0) + 1;
    } else {
      // If the index is odd, increment the count for this number in 'oddIndexedCounts'.
      oddIndexedCounts[currentValue] = (oddIndexedCounts[currentValue] || 0) + 1;
    }
  });

  // Get the keys (numbers) from the count objects and sort them
  // in descending order based on their frequencies.
  const sortedEvenKeys = Object.keys(evenIndexedCounts).sort((keyOne, keyTwo) => evenIndexedCounts[keyTwo] - evenIndexedCounts[keyOne]);
  const sortedOddKeys = Object.keys(oddIndexedCounts).sort((keyOne, keyTwo) => oddIndexedCounts[keyTwo] - oddIndexedCounts[keyOne]);

  let finalSum = 0; // This variable will accumulate the total count of elements to be changed.

  // Variables to store the index of the element to exclude from each sorted list.
  // 'evenExcludeIndex' is initially undefined, 'oddExcludeIndex' is initialized to zero.
  let evenExcludeIndex;
  let oddExcludeIndex = 0;

  // Determine the exclusion strategy based on the most frequent elements.
  if (sortedEvenKeys[0] === sortedOddKeys[0]) {
    // If the most frequent element in both sets is the same,
    // we must change one of them. We choose to keep the one
    // whose second most frequent element is less common.
    if (evenIndexedCounts[sortedEvenKeys[1]] > oddIndexedCounts[sortedOddKeys[1]]) {
      evenExcludeIndex = 0; // Exclude the most frequent from 'even' set.
      oddExcludeIndex = 1;  // Exclude the second most frequent from 'odd' set.
    } else {
      evenExcludeIndex = 1; // Exclude the second most frequent from 'even' set.
      oddExcludeIndex = 0;  // Exclude the most frequent from 'odd' set.
    }
  } else {
    // If the most frequent elements are different,
    // we simply exclude the most frequent from both sets.
    evenExcludeIndex = 0;
    oddExcludeIndex = 0;
  }

  // Sum the counts of all elements in 'evenIndexedCounts' except the one at 'evenExcludeIndex'.
  sortedEvenKeys.filter((_value, indexPosition) => indexPosition !== evenExcludeIndex).forEach(keyVal => {
    finalSum += evenIndexedCounts[keyVal];
  });

  // Sum the counts of all elements in 'oddIndexedCounts' except the one at 'oddExcludeIndex'.
  sortedOddKeys.filter((_value, indexPosition) => indexPosition !== oddExcludeIndex).forEach(keyVal => {
    finalSum += oddIndexedCounts[keyVal];
  });

  // Print the final calculated sum to the console.
  console.log(finalSum);
}

// Read input from standard input, decode it as UTF-8, trim whitespace,
// split by newlines, and pass the resulting array to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n'));
