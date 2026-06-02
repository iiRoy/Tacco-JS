const ProcessInput = (rawData) => {
  // This function is designed to process a block of raw text input.
  // It aims to identify and count the number of unique lines within the input.

  // First, the entire raw data string is broken down into an array of individual lines.
  const stringCollection = rawData.split('\n');

  // The very first element of the array is expected to be a numerical count
  // representing the total number of items. This element is extracted and converted
  // to a number, and simultaneously removed from the array.
  const itemCount = Number(stringCollection.shift());

  // A JavaScript Set object is then instantiated using the remaining elements
  // of the stringCollection array. The Set automatically ensures that only
  // unique values are stored, effectively filtering out any duplicate lines.
  const uniqueElements = new Set(stringCollection);

  // Finally, the size of the Set (which represents the count of unique lines)
  // is printed to the console.
  console.log(uniqueElements.size);

  /*
  // This commented-out block illustrates an alternative, more manual approach
  // to counting unique items, which is not currently active in this version.
  let currentCount = 0; // Initialize a counter for unique items.
  if (itemCount === 1) {
    currentCount = 1; // If only one item, it's unique.
  } else {
    // Iterate through the list from the end to check for uniqueness.
    for (let idx = itemCount - 1; idx >= 0; idx--) {
      // If the current item is not found anywhere after its current position,
      // it means it's a unique occurrence in the remaining part of the list.
      if (!stringCollection.includes(stringCollection[idx], idx + 1)) {
        currentCount++; // Increment the unique item counter.
      }
    }
  }
  // console.log(currentCount); // This would output the count from the manual method.
  */
};

// The program's execution begins by reading content from standard input.
// The 'fs' module is used to synchronously read the file located at '/dev/stdin',
// and the content is decoded as a UTF-8 string before being passed to the
// ProcessInput function for processing.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

/*
// Below are several commented-out test cases that could be used to
// verify the functionality of the ProcessInput function with different inputs.
// These are currently inactive and serve as examples.

// ProcessInput(`3
// apple
// orange
// apple`);

// ProcessInput(`5
// grape
// grape
// grape
// grape
// grape`);

// ProcessInput(`4
// aaaa
// a
// aaa
// aa`);
*/
