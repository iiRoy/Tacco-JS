function processInput(  rawData  ) {
  const limitValue = Number.parseInt(rawData);
  const trackedElements = [];
  let tally = 0;

  // Handle trivial case where input is 1
  if ( limitValue === 1 ) {
    return console.info(0);
  }

  const factorList = obtainFactors(limitValue);
  let previousFactor = 0;
  let currentElement = 0;

  // Iterate through the list of prime factors
  factorList.forEach(item => {
    // If the current factor is different from the previous one, reset the current element
    if ( previousFactor !== item ) {
      currentElement = item;
    }

    // Check if the current element is already tracked
    if ( !trackedElements.includes(currentElement) ) {
      trackedElements.push(currentElement); // Add to tracked list
      tally++; // Increment the counter
    } else {
      currentElement *= item; // Multiply current element by the factor
    }

    previousFactor = item; // Update previous factor for next iteration
  });

  // Output the final count
  console.info(tally);
}


function obtainFactors (upperBound) {
    const factorCollection = [];

    // Special handling for the number 1
    if (upperBound === 1) {
        return [1];
    }

    let divisorStart = 2; // Start checking for divisors from 2

    // Continue until the upperBound is reduced to 1
    while (upperBound !== 1) {
        let candidateDivisor = divisorStart;
        // Search for the smallest prime factor
        while (candidateDivisor < Number.MAX_SAFE_INTEGER) {
            if (upperBound % candidateDivisor === 0) {
                factorCollection.push(candidateDivisor); // Store the found factor
                upperBound /= candidateDivisor; // Reduce the upperBound
                break; // Found a factor, break inner loop to re-evaluate upperBound
            }
            candidateDivisor++; // Check next potential divisor
        }
        divisorStart = candidateDivisor; // Update the starting point for the next divisor search
    }
    return factorCollection; // Return the list of prime factors
}


processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));