const processRawData = (fullDataString) => {
  let valA = 0;
  let valB = 0;
  let currentNumStr = "";
  let parsingFirstNum = true;

  for (let idx = 0; idx < fullDataString.length; idx++) {
    const charUnit = fullDataString[idx];
    if (charUnit === '\n') {
      if (currentNumStr.length > 0) {
        valB = Number(currentNumStr);
      }
      break;
    }
    if (charUnit === ' ') {
      if (currentNumStr.length > 0) {
        valA = Number(currentNumStr);
        currentNumStr = "";
        parsingFirstNum = false;
      }
    } else if (charUnit >= '0' && charUnit <= '9') {
      currentNumStr += charUnit;
    }
  }

  if (parsingFirstNum && currentNumStr.length > 0) {
    valA = Number(currentNumStr);
  } else if (!parsingFirstNum && currentNumStr.length > 0) {
    valB = Number(currentNumStr);
  }

  const calculateBaseResult = (dimOne, dimTwo) => {
    const productOfDims = dimOne * dimTwo;
    return (productOfDims + 1) >> 1;
  };

  const determineFinalOutcome = (dimOne, dimTwo) => {
    return (dimOne === 1 || dimTwo === 1) ? 1 : calculateBaseResult(dimOne, dimTwo);
  };

  const finalComputedValue = determineFinalOutcome(valA, valB);

  console.log(finalComputedValue);
};

processRawData(require("fs").readFileSync("/dev/stdin", "utf8"));