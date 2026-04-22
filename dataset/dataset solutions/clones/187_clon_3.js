var dataAccumulator = '';

function ascertainSmaller(primaryValue, secondaryValue) {
  if (primaryValue < secondaryValue) {
    return primaryValue;
  } else {
    return secondaryValue;
  }
}

function ascertainLarger(primaryValue, secondaryValue) {
  return (primaryValue > secondaryValue) ? primaryValue : secondaryValue;
}

function parseNumericLine(lineContent) {
    const trimmedContent = lineContent.trim();
    if (trimmedContent === '') {
        return null;
    }

    const numericalValue = parseFloat(trimmedContent);

    if (isNaN(numericalValue)) {
        return null;
    }

    return numericalValue;
}

function computeNumericRangeDifference() {
  const validNumbers = [];

  for (const rawLine of processedInputLines) {
    const parsedVal = parseNumericLine(rawLine);
    if (parsedVal !== null) {
      validNumbers.push(parsedVal);
    }
  }

  if (validNumbers.length === 0) {
    console.error("No valid numbers were provided in the input to compute a range.");
    return;
  }

  let minimumObserved = validNumbers[0];
  let maximumObserved = validNumbers[0];

  for (let i = 1; i < validNumbers.length; i++) {
    const currentNumber = validNumbers[i];
    minimumObserved = ascertainSmaller(currentNumber, minimumObserved);
    maximumObserved = ascertainLarger(currentNumber, maximumObserved);
  }

  const calculatedSpan = maximumObserved - minimumObserved;

  console.log(calculatedSpan);
}

let processedInputLines = [];

function handleIncomingData(incomingSegment) {
  dataAccumulator += incomingSegment;
}

function finalizeProcessing() {
  processedInputLines = dataAccumulator.split('\n').filter(line => line !== '');

  computeNumericRangeDifference();
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', handleIncomingData);
process.stdin.on('end', finalizeProcessing);