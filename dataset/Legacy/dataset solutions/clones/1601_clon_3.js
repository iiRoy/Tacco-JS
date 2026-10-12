function parseNumericInput(inputString) {
  const parts = inputString.trim().split(" ").map(Number);
  return {
    valX: parts[0],
    valK: parts[1],
    valD: parts[2]
  };
}

function ProcessInput(rawData) {
  const { valX, valK, valD } = parseNumericInput(rawData);

  const absoluteXValue = Math.abs(valX);
  const absoluteQuotient = Math.abs(valX / valD);
  const remainderValue = valX % valD;

  let finalOutcome;

  const isKEven = (valK % 2 === 0);

  if (absoluteXValue < valD) {
    // Case 1: Initial position is within one step 'd' from zero
    if (isKEven) {
      finalOutcome = valX;
    } else {
      finalOutcome = valX + valD;
    }
  } else if (absoluteQuotient > valK) {
    // Case 2: Fewer moves 'k' than steps required to cross zero
    const totalDistanceMoved = valK * valD;
    if (valX > 0) {
      finalOutcome = Math.abs(valX - totalDistanceMoved);
    } else {
      finalOutcome = Math.abs(valX + totalDistanceMoved);
    }
  } else {
    // Case 3: Enough moves 'k' to cross zero or land exactly on zero
    const isRemainderZero = (remainderValue === 0);
    if (isKEven && isRemainderZero) {
      finalOutcome = valD;
    } else {
      finalOutcome = remainderValue;
    }
  }

  console.log(finalOutcome);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
