function processInputData(rawData) {
  const lines = rawData.split('\n');

  const [valK, valT] = lines[0].split(' ').map(Number);

  const minimumElement = lines[1].split(' ').reduce((accumulator, currentString) => {
    const currentNumber = Number(currentString);
    return Math.min(accumulator, currentNumber);
  }, Infinity);

  const finalResult = Math.max(2 * minimumElement - valK - 1, 0);

  console.log(finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
