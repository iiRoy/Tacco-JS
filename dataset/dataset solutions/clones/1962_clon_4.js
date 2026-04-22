function performCalculation(dataInput) {
  const lineSegments = dataInput.match(/[^\r\n]+/g);
  
  const initialValueTokens = lineSegments[0].match(/(-?\d+)/g);
  const primaryNumber = Number(initialValueTokens[0]);

  const numbersToAggregateString = lineSegments[1];
  let accumulatedSum = 0;
  let remainingContent = numbersToAggregateString.trim();

  while (remainingContent.length > 0) {
    const termMatch = remainingContent.match(/^\s*(-?\d+)\s*(.*)$/);
    if (termMatch) {
      accumulatedSum += Number(termMatch[1]);
      remainingContent = termMatch[2];
    } else {
      break; 
    }
  }

  const finalOutcome = primaryNumber - accumulatedSum;

  if (finalOutcome < 0) {
    console.log(-1);
  } else {
    console.log(finalOutcome);
  }
}

performCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));