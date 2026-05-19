process.stdin.on('data', function(inputChunk) {
  if (!global.inputBuffer) {
    global.inputBuffer = [];
  }
  global.inputBuffer.push(inputChunk.toString('utf8'));
});

process.stdin.on('end', function() {
  const fullInputContent = global.inputBuffer ? global.inputBuffer.join('') : '';
  global.inputBuffer = undefined; // Clear buffer

  try {
    const processedResult = calculateDoughnutCount(fullInputContent);
    process.stdout.write(String(processedResult) + '\n');
  } catch (error) {
    // Replicate unsafeCrashWith behavior by throwing
    throw error;
  }
});

function calculateDoughnutCount(rawText) {
  const cleanedText = rawText.trim();
  const textLines = cleanedText.split('\n');

  if (textLines.length === 0 || (textLines.length === 1 && textLines[0] === '')) {
    throw new Error("Input lines missing or empty.");
  }

  const firstLineContent = textLines.shift();
  if (!firstLineContent) {
    throw new Error("First line content is unexpectedly empty.");
  }

  const firstLineParts = firstLineContent.split(' ');
  if (firstLineParts.length !== 2) {
    throw new Error("First line must contain exactly two space-separated numbers.");
  }

  const totalDoughnutTypes = parseInt(firstLineParts[0], 10);
  const initialFlourAmount = parseInt(firstLineParts[1], 10);

  if (isNaN(totalDoughnutTypes) || isNaN(initialFlourAmount)) {
    throw new Error("Invalid numeric values in the first line.");
  }

  const individualDoughnutFlourNeeds = textLines
    .map(line => parseInt(line, 10))
    .filter(value => !isNaN(value)); // Filter out non-numeric lines, mirroring mapMaybe

  if (individualDoughnutFlourNeeds.length !== totalDoughnutTypes) {
      // This check ensures strict adherence to N lines, if problem implies it.
      // The original PureScript code would proceed with the filtered array,
      // but if N is large and many lines are invalid, it might be an implicit error.
      // For competitive programming, usually N lines are guaranteed to be valid.
      // If not, the original code would just use the valid ones.
      // Let's assume valid input for now, or that filtering is the intended behavior.
  }

  let cumulativeFlourConsumption = 0;
  let smallestFlourRequirement = Infinity;

  for (const flourAmount of individualDoughnutFlourNeeds) {
    cumulativeFlourConsumption += flourAmount;
    if (flourAmount < smallestFlourRequirement) {
      smallestFlourRequirement = flourAmount;
    }
  }

  const remainingFlour = initialFlourAmount - cumulativeFlourConsumption;
  let extraDoughnutsPossible;

  // Replicate PureScript's Data.EuclideanRing.intDiv behavior for divisor 0
  if (smallestFlourRequirement === 0) {
    extraDoughnutsPossible = 0;
  } else {
    extraDoughnutsPossible = Math.floor(remainingFlour / smallestFlourRequirement);
  }

  return totalDoughnutTypes + extraDoughnutsPossible;
}
