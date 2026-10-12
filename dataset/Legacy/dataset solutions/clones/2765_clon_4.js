const processInput = (dataLines) => {
  const moduloDivisor = 2019;
  const [rawLower, rawUpper] = dataLines[0].split(" ");

  const lowerBound = parseInt(rawLower, 10);
  const upperBound = parseInt(rawUpper, 10);

  if (lowerBound === upperBound) {
    // The original code, when L === R, will result in a 'mods' array with a single element.
    // Accessing mods[1] would yield 'undefined', leading to NaN when multiplied.
    console.log(NaN);
    return;
  }

  // Determine if a multiple of 'moduloDivisor' exists within the inclusive range [lowerBound, upperBound].
  // If such a multiple exists, then 0 is one of the possible remainders.
  // The smallest possible remainder is 0, making the product of the two smallest remainders 0.
  const firstMultipleOrGreater = Math.ceil(lowerBound / moduloDivisor) * moduloDivisor;

  if (firstMultipleOrGreater <= upperBound) {
    console.log(0);
  } else {
    // If no multiple of 'moduloDivisor' is found within the range,
    // then all remainders (i % moduloDivisor) for i in [lowerBound, upperBound] will be non-zero.
    // Since the range [lowerBound, upperBound] does not span across a multiple of 'moduloDivisor',
    // the sequence of remainders (lowerBound % moduloDivisor, (lowerBound+1) % moduloDivisor, ...)
    // will be strictly increasing.
    // Therefore, the two smallest remainders are simply lowerBound % moduloDivisor
    // and (lowerBound + 1) % moduloDivisor.
    const smallestRemainder = lowerBound % moduloDivisor;
    const nextSmallestRemainder = (lowerBound + 1) % moduloDivisor;
    console.log(smallestRemainder * nextSmallestRemainder);
  }
};

processInput(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n"));
