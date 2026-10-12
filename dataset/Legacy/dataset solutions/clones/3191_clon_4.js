function processInputData(rawData) {
  const lines = rawData.split("\n");
  const firstLineParts = lines[0].split(" ");
  const elementCount = Number(firstLineParts[0]);

  const numericValues = lines[1].split(" ").map(Number);

  const calculatePairGCD = (valA, valB) => {
    while (valB !== 0) {
      valA %= valB;
      [valA, valB] = [valB, valA];
    }
    return valA;
  };

  const finalGCD = numericValues.reduce((accumulator, currentValue) =>
    calculatePairGCD(accumulator, currentValue)
  );

  console.log(finalGCD);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
