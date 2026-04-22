function getDistinctElements(sourceList) {
 return Array.from(new Set(sourceList));
}

function ProcessInput(entryData) {
  // Parse numeric values from the input stream
  const lowerBound = parseInt(entryData[0], 10);
  const upperBound = parseInt(entryData[1], 10);
  const factorA = parseInt(entryData[2], 10);
  const factorB = parseInt(entryData[3], 10);

  // Initialize starting index for multiples of factorA
  let multipleIndexA = lowerBound % factorA !== 0
    ? Math.floor(lowerBound / factorA) + 1
    : Math.floor(lowerBound / factorA);

  // Initialize starting index for multiples of factorB
  let multipleIndexB = lowerBound % factorB !== 0
    ? Math.floor(lowerBound / factorB) + 1
    : Math.floor(lowerBound / factorB);

  // Container for all identified multiples
  const foundMultiples = [];

  // Iterate and collect multiples of factorA within the range
  while (factorA * multipleIndexA <= upperBound) {
    foundMultiples.push(factorA * multipleIndexA);
    multipleIndexA++;
  }

  // Iterate and collect multiples of factorB within the range
  while (factorB * multipleIndexB <= upperBound) {
    foundMultiples.push(factorB * multipleIndexB);
    multipleIndexB++;
  }

  // Obtain a list of unique multiples
  const distinctMultiples = getDistinctElements(foundMultiples);

  // Output the count of numbers not divisible by either factorA or factorB
  console.log(upperBound - lowerBound + 1 - distinctMultiples.length);
}

// Execute the primary routine with data from standard input
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));