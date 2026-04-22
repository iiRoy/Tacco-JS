const processInputValues = (sourceText) => {
  const dataLines = sourceText.trim().split('\n');
  const upperBoundary = parseInt(dataLines[0], 10);
  const numericList = dataLines[1].split(' ').map(val => parseInt(val, 10));

  const pertinentNumbers = numericList.slice(0, upperBoundary - 1);

  const frequencyRegister = new Map();
  for (const item of pertinentNumbers) {
    frequencyRegister.set(item, (frequencyRegister.get(item) || 0) + 1);
  }

  const outputCollection = [];
  for (let currentNumber = 1; currentNumber <= upperBoundary; currentNumber++) {
    outputCollection.push(frequencyRegister.get(currentNumber) || 0);
  }

  return outputCollection.join('\n');
};

const executeProgram = (inputContent) => {
  console.log(processInputValues(inputContent));
};

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));