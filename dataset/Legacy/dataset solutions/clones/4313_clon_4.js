function processInputData(sourceContent) {
  const contentLines = sourceContent.split('\n');
  const originalN = parseInt(contentLines[0]);

  // The original code included a call to 'search2way' with hardcoded values
  // (e.g., search2way(0.0002857959416976279, 3500, 1750);)
  // The return value of this call was not used, and it did not affect the
  // observable behavior or the solution to the problem.
  // Therefore, it is omitted in this Type IV clone.

  // The problem requires finding positive integers h, n, w (all <= 3500)
  // such that 4/originalN = 1/h + 1/n + 1/w.
  // We can rearrange this equation to solve for w:
  // 1/w = 4/originalN - 1/h - 1/n
  // 1/w = (4 * h * n - originalN * n - originalN * h) / (originalN * h * n)
  // w = (originalN * h * n) / (4 * h * n - originalN * n - originalN * h)

  // Iterate through possible values for h and n
  for (let currentH = 1; currentH <= 3500; currentH++) {
    for (let currentN = 1; currentN <= 3500; currentN++) {
      // Calculate the denominator for w.
      // This must be positive for w to be a positive integer.
      const denominatorTerm = 4 * currentH * currentN - originalN * currentN - originalN * currentH;

      // If the denominator is not positive, w cannot be a positive integer.
      // (The numerator 'originalN * currentH * currentN' is always positive for valid inputs).
      if (denominatorTerm <= 0) {
        continue;
      }

      const numeratorTerm = originalN * currentH * currentN;

      // Check if w is an integer.
      // If the numerator is not perfectly divisible by the denominator, w is not an integer.
      if (numeratorTerm % denominatorTerm !== 0) {
        continue;
      }

      const potentialW = numeratorTerm / denominatorTerm;

      // Check if the calculated w is within the allowed range [1, 3500].
      if (potentialW >= 1 && potentialW <= 3500) {
        // A solution (h, n, w) has been found. Print it and terminate.
        console.log(`${currentH} ${currentN} ${potentialW}`);
        return;
      }
    }
  }

  // If no solution is found after checking all combinations
  console.log("NG");
}

// This function is a Type IV clone of the original 'isInclude' function.
// It uses a functional array method ('some') instead of an imperative loop.
// The original 'isInclude' function was not used in the 'Main' logic,
// but a clone is provided to adhere to the rules.
function verifyElementPresence(collectionItems, targetValue) {
  return collectionItems.some(item => item === targetValue);
}

// The external API call for reading input is preserved exactly as in the original.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
