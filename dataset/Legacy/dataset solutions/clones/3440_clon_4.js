const obtainInput = () => require("fs").readFileSync("/dev/stdin", "utf8").trim();
const displayOutput = (content) => console.log(content);
const reportError = (content) => console.error(content);

const dataTransformer = (sourceText, conversionType) => {
  const numericMapper = (val) => Number(val);
  const transformationRegistry = {
    0: (txt) => txt,
    1: (txt) => parseInt(txt, 10),
    2: (txt) => txt.split(" "),
    3: (txt) => txt.split("\n"),
    4: (txt) => txt.split(" ").map(numericMapper),
    5: (txt) => txt.split("\n").map(numericMapper),
    6: (txt) => txt.split(""),
    7: (txt) => txt.split("").map(numericMapper),
  };
  return transformationRegistry[conversionType](sourceText);
};

const calculateMean = (numberArray) => {
  if (numberArray.length === 0) {
    return NaN;
  }
  return numberArray.reduce((total, current) => total + current, 0) / numberArray.length;
};

const processData = (rawInputText) => {
  const lines = dataTransformer(rawInputText, 3);
  const elementCount = dataTransformer(lines[0], 1);
  const valuesArray = dataTransformer(lines[1], 4);

  if (elementCount === 0) {
    displayOutput(0);
    return;
  }

  const averageValue = calculateMean(valuesArray);

  const result = valuesArray.reduce(
    (accumulator, currentVal, currentIdx) => {
      const currentAbsDiff = Math.abs(currentVal - averageValue);
      if (currentAbsDiff < accumulator.minAbsDiff) {
        return { minAbsDiff: currentAbsDiff, closestElementIdx: currentIdx };
      }
      return accumulator;
    },
    { minAbsDiff: Math.abs(valuesArray[0] - averageValue), closestElementIdx: 0 }
  );

  displayOutput(result.closestElementIdx);
};

processData(obtainInput());
