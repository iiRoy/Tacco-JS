const processInput = (rawData) => {
  // Clean up the raw input string and split it into lines.
  rawData = rawData.trim().split('\n');

  // Extract the first line to get the number of items and pairs.
  const [numItems, numPairs] = rawData[0].split(' ').map(Number);

  // The rest of the lines represent the pairs.
  const [, ...pairData] = rawData;

  // Initialize beacon strengths, adding a dummy 0 at index 0 for 1-based indexing.
  const beaconStrengths = [0, ...rawData[1].split(' ').map(Number)];

  // Initialize an array to track if each item is the strongest, assuming all are initially.
  const isStrongest = [false, ...new Array(numItems).fill(true)];

  // Iterate through each pair to determine which items are not the strongest.
  for (let idx = 0; idx < pairData.length; idx++) {
    const [firstItem, secondItem] = pairData[idx].split(' ').map(Number);

    // Compare strengths and mark the weaker one as not strongest.
    if (beaconStrengths[firstItem] >= beaconStrengths[secondItem]) {
      isStrongest[secondItem] = false;
    } else if (beaconStrengths[firstItem] <= beaconStrengths[secondItem]) {
      isStrongest[firstItem] = false;
    }
  }

  // Count how many items remain marked as strongest.
  let strongestCount = 0;
  for (let jdx = 1; jdx < isStrongest.length; jdx++) {
    if (isStrongest[jdx]) {
      strongestCount++;
    }
  }

  // Output the final count.
  return console.log(strongestCount);
};

// Conditional execution based on environment variable, for testing or production.
process.env.MYTEST
  ? (process.env.MYTEST === 'test' ? test() : processInput(require('fs').readFileSync('dev/stdin', 'utf8')))
  : processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
