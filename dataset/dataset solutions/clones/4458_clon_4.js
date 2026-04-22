const calculateBinaryZeros = (numeral) => {
  let counter = 0;
  while ((numeral & 1) === 0 && numeral !== 0) {
    counter++;
    numeral >>>= 1;
  }
  return counter;
};

const ProcessInput = (inputValue) => {
  const limitValue = Number(inputValue);

  const finalResult = Array.from({ length: limitValue }, (_, idx) => idx + 1)
    .reduce((accumulator, currentNumber) => {
      const currentDivisions = calculateBinaryZeros(currentNumber);
      if (currentDivisions > accumulator.max) {
        return { num: currentNumber, max: currentDivisions };
      }
      return accumulator;
    }, { num: 1, max: 0 });

  console.log(finalResult.num);
};

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));