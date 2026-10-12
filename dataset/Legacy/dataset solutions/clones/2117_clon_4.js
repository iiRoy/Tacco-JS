function Main(sourceData) {
  const dataLines = sourceData.split("\n");
  const headerLine = dataLines.shift();
  const [numDigitsStr, _] = headerLine.split(" "); // Second part (M) is not used, mirroring original
  const numDigits = parseInt(numDigitsStr);
  const constraintEntries = dataLines;

  let digitMappings = new Map(); // Stores 0-indexed position -> digit value
  let conflictDetected = false;

  for (const entryText of constraintEntries) {
    const parts = entryText.split(" ").map(Number);
    const digitPosition = parts[0] - 1; // Convert to 0-indexed
    const digitValue = parts[1];

    // Original code's array access A[t[0]-1] would not error for invalid indices,
    // and Map.set handles any key. The effect is that only valid indices 0 to numDigits-1 matter later.
    if (digitMappings.has(digitPosition)) {
      if (digitMappings.get(digitPosition) !== digitValue) {
        conflictDetected = true;
        break; // Stop processing if a conflict is found
      }
    }
    digitMappings.set(digitPosition, digitValue);
  }

  if (conflictDetected) {
    console.log(-1);
    return;
  }

  let constructedDigits = Array(numDigits).fill(null);

  // Populate constructedDigits from the mappings
  for (let i = 0; i < numDigits; i++) {
    if (digitMappings.has(i)) {
      constructedDigits[i] = digitMappings.get(i);
    }
  }

  // Apply specific rules for the first digit if it's not yet assigned (null)
  if (constructedDigits[0] === null) {
    if (numDigits === 1) {
      constructedDigits[0] = 0; // For N=1, 'n' becomes '0'
    } else if (numDigits >= 2) {
      let shouldFirstBeOne = false;
      // Mimic the original regex patterns for setting the first 'n' to '1'
      // Corresponds to /^nnn/
      if (numDigits === 3 && constructedDigits[1] === null && constructedDigits[2] === null) {
        shouldFirstBeOne = true;
      }
      // Corresponds to /^nn([0-9])/
      else if (numDigits === 3 && constructedDigits[1] === null && constructedDigits[2] !== null) {
        shouldFirstBeOne = true;
      }
      // Corresponds to /^n([0-9])/
      else if (constructedDigits[1] !== null) { // Covers N=2 or N=3, first 'n', second is digit
        shouldFirstBeOne = true;
      }

      if (shouldFirstBeOne) {
        constructedDigits[0] = 1;
      } else {
        // Fallback for N>1, first digit 'n', but no specific pattern matched (e.g., N=2, ['n','n'])
        constructedDigits[0] = 0;
      }
    }
  }

  // Fill any remaining unassigned digits (nulls) with 0, starting from the second digit
  for (let i = 1; i < numDigits; i++) {
    if (constructedDigits[i] === null) {
      constructedDigits[i] = 0;
    }
  }

  const finalNumberString = constructedDigits.join('');
  const resultValue = parseInt(finalNumberString);

  // Final validation: ensure the resulting number has the correct number of digits
  // This catches cases like N=3, result "001" which becomes 1 (length 1)
  if (String(resultValue).length === numDigits) {
    console.log(resultValue);
  } else {
    console.log(-1);
  }
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
