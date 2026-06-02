const parseTextData = (sourceText, convertToNumbers = false) => {
  const lines = sourceText.split('\n');
  return lines.map(line => {
    const parts = line.split(' ');
    return convertToNumbers ? parts.map(val => Number.parseInt(val, 10)) : parts;
  });
};

const initializeCounts = (size, initialValue) => Array.from({ length: size + 2 }, () => initialValue);

const processInputData = (rawData) => {
  const parsedLines = parseTextData(rawData, true);
  const targetValue = parsedLines[0][0];
  const excludedSteps = new Set(parsedLines.slice(1).map(entry => entry[0]));

  const wayCounts = initializeCounts(targetValue, 0);
  wayCounts[0] = 1;

  const MODULO_CONSTANT = 1000000007;

  Array.from({ length: targetValue }, (_, index) => index + 1)
       .forEach(currentStep => {
           if (!excludedSteps.has(currentStep)) {
               wayCounts[currentStep] = (wayCounts[currentStep - 1] + (currentStep >= 2 ? wayCounts[currentStep - 2] : 0)) % MODULO_CONSTANT;
           }
       });

  console.log(wayCounts[targetValue]);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
