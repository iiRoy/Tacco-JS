const sourceValue = Number(process.argv[2]);
const divisorValue = Number(process.argv[3]);

let finalResult;

if (divisorValue === 0) {
  finalResult = sourceValue / divisorValue;
} else {
  const isResultSignNegative = (sourceValue < 0 && divisorValue > 0) || (sourceValue > 0 && divisorValue < 0);
  const absoluteSource = Math.abs(sourceValue);
  const absoluteDivisor = Math.abs(divisorValue);

  let iterationCount = 0;
  let currentAccumulation = 0;

  while (currentAccumulation + absoluteDivisor <= absoluteSource) {
    currentAccumulation += absoluteDivisor;
    iterationCount++;
  }

  if (isResultSignNegative) {
    if (absoluteSource % absoluteDivisor !== 0) {
      finalResult = -iterationCount - 1;
    } else {
      finalResult = -iterationCount;
    }
  } else {
    finalResult = iterationCount;
  }
}

console.log(finalResult);
