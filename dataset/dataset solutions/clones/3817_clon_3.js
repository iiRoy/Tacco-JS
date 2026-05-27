function readInput(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function writeOutput(content){console.log(content);}
function writeError(content){console.error(content);}

function convertInput(inputStr, conversionType) {
  const toNumbers = (arr) => arr.map((item) => Number(item));

  switch (conversionType) {
    case 0: return inputStr;
    case 1: return parseInt(inputStr);
    case 2: return inputStr.split(" ");
    case 3: return inputStr.split("\n");
    case 4: return toNumbers(inputStr.split(" "));
    case 5: return toNumbers(inputStr.split("\n"));
    case 6: return inputStr.split("");
    case 7: return toNumbers(inputStr.split(""));
    default: return inputStr; // Fallback, though not expected to be hit with valid conversionType
  }
}

function processData(rawData) {
  const ERROR_CODE = -1;

  let numericData = convertInput(rawData, 5);
  const dataSize = numericData[0]; // N from original
  numericData.shift(); // Remove N
  numericData.push(0); // Add sentinel value at the end

  // Initial validation: Check if the first actual data point is zero
  if (numericData[0] !== 0) {
    writeOutput(ERROR_CODE);
    return;
  }

  let finalResult = 0;
  // Initialize difference array for the "imosu" method
  const diffArray = new Array(dataSize + 1).fill(0);

  const loopStartIdx = dataSize - 1;
  for (let idx = loopStartIdx; idx >= 1; idx--) {
    const currentVal = numericData[idx]; // 'mae' from original
    const nextVal = numericData[idx + 1]; // 'ato' from original

    // Guard clause for invalid sequence
    if (nextVal - currentVal > 1) {
      writeOutput(ERROR_CODE);
      return;
    }

    // Apply "imosu" method logic based on value difference
    if (currentVal >= nextVal) { // Equivalent to original 'mae - ato >= 0'
      diffArray[idx + 1]--;
      const rangeStartPoint = idx - (currentVal - 1);
      diffArray[rangeStartPoint]++;
    }
    // If nextVal - currentVal == 1, it's implicitly handled by continuing the loop
  }

  // Calculate prefix sums to get actual values
  for (let idx = 0; idx < dataSize; idx++) {
    diffArray[idx + 1] += diffArray[idx];
  }

  // Sum up the calculated values
  for (let idx = 0; idx < dataSize; idx++) {
    finalResult += diffArray[idx];
  }

  writeOutput(finalResult);
}

processData(readInput());
