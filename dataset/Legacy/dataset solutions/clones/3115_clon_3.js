function readInput(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function printOutput(message){console.log(message);}
function printError(message){console.error(message);}

const inputConversionStrategies = {
  0: (val) => val,
  1: (val) => parseInt(val, 10),
  2: (val) => val.split(" "),
  3: (val) => val.split("\n"),
  4: (val) => val.split(" ").map(Number),
  5: (val) => val.split("\n").map(Number),
  6: (val) => val.split(""),
  7: (val) => val.split("").map(Number),
};

function convertInput(inputValue, conversionType) {
  const strategy = inputConversionStrategies[conversionType];
  if (strategy) {
    return strategy(inputValue);
  }
  return undefined;
}

const formatPair = (valA, valB) => `${valA} ${valB}`;

function Main(rawInput) {
  let processedInput = convertInput(rawInput, 1);

  if (processedInput === 3) {
    printOutput("2\n1 3\n2 3");
    return;
  }
  if (processedInput === 4) {
    printOutput("4\n1 3\n2 1\n4 2\n3 4");
    return;
  }

  let resultLines = [];

  if (processedInput % 2 === 1) {
    resultLines.push((processedInput - 1) * 2);
    const halfInputFloor = Math.floor(processedInput / 2);

    const addStandardPairsOdd = (leftVal, leftValNext, rightVal, rightValPrev) => {
      resultLines.push(formatPair(leftVal, leftValNext));
      resultLines.push(formatPair(leftVal, rightValPrev));
      resultLines.push(formatPair(rightVal, leftValNext));
      resultLines.push(formatPair(rightVal, rightValPrev));
    };

    for (let i = 0; i < halfInputFloor; i++) {
      let leftVal = i + 1;
      let leftValNext = leftVal + 1;
      let rightVal = processedInput - 1 - i;
      let rightValPrev = rightVal - 1;

      const isFirstIteration = (i === 0);
      const isLastIteration = (i === halfInputFloor - 1);

      if (isFirstIteration || isLastIteration) {
        resultLines.push(formatPair(leftVal, processedInput));
        resultLines.push(formatPair(rightVal, processedInput));
        if (isLastIteration) {
          break;
        }
      }
      addStandardPairsOdd(leftVal, leftValNext, rightVal, rightValPrev);
    }
    printOutput(resultLines.join("\n"));
  } else {
    resultLines.push(processedInput * 2);
    const halfInput = processedInput / 2;

    const addStandardPairsEven = (leftVal, leftValNext, rightVal, rightValPrev) => {
      resultLines.push(formatPair(leftVal, leftValNext));
      resultLines.push(formatPair(leftVal, rightValPrev));
      resultLines.push(formatPair(rightVal, leftValNext));
      resultLines.push(formatPair(rightVal, rightValPrev));
    };

    for (let i = 0; i < halfInput; i++) {
      let leftVal = i + 1;
      let leftValNext = leftVal + 1;
      let rightVal = processedInput - i;
      let rightValPrev = rightVal - 1;

      const isLastIteration = (i === halfInput - 1);

      if (isLastIteration) {
        leftValNext = 1;
        rightValPrev = processedInput;
      }
      addStandardPairsEven(leftVal, leftValNext, rightVal, rightValPrev);
    }
    printOutput(resultLines.join("\n"));
  }
}

Main(readInput());
