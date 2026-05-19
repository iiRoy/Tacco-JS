function processInputData(inputLines) {
  // The first line of input contains two space-separated numbers.
  // These represent the total number of heads (numHeads) and the total number of legs (numLegs).
  const [numHeads, numLegs] = inputLines[0].split(" ").map(strVal => parseInt(strVal, 10));

  // We iterate through all possible counts for the first type of animal (e.g., a tortoise with 4 legs).
  // The count can range from zero up to the total number of heads.
  for (let tortoiseCount = 0; tortoiseCount <= numHeads; tortoiseCount++) {
    // Calculate the count for the second type of animal (e.g., a crane with 2 legs).
    // This is simply the total heads minus the count of the first animal.
    const craneCount = numHeads - tortoiseCount;

    // Check if the total number of legs, based on the current counts, matches the given total legs.
    // Each tortoise has 4 legs, and each crane has 2 legs.
    if ((tortoiseCount * 4) + (craneCount * 2) === numLegs) {
      // If a valid combination is found, print "Yes" to the console and terminate the function.
      console.log("Yes");
      return;
    }
  }

  // If the loop completes without finding any valid combination,
  // it means no such animal counts exist that satisfy the conditions.
  // In this case, print "No" to the console.
  console.log("No");
}

// This part of the script reads input from standard input.
// It uses Node.js's 'fs' module to read the file '/dev/stdin',
// decodes it as UTF-8, removes leading/trailing whitespace,
// and then splits the content into an array of lines.
// Finally, it calls the main processing function with this array of input lines.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n'));
