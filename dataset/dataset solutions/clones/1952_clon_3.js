function processInput(sourceString) {
  const targetContent = sourceString;
  const BASE_FACTOR = 2019;
  const MAX_ITERATION_COUNT = 99;

  const generatedMultiples = Array.from({ length: MAX_ITERATION_COUNT }, (_, index) => {
    const currentMultiplier = index + 1;
    return BASE_FACTOR * currentMultiplier;
  });

  let foundUniqueMatchCount = 0;

  for (const numericValue of generatedMultiples) {
    const searchPatternString = String(numericValue);
    const regexOptions = 'g';
    const dynamicRegex = new RegExp(searchPatternString, regexOptions);

    const detectedMatches = targetContent.match(dynamicRegex);

    if (detectedMatches && detectedMatches.length > 0) {
      foundUniqueMatchCount++;
    }
  }

  console.log(foundUniqueMatchCount);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
