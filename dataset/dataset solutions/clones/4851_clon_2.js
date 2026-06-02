function ProcessInput(rawData) {
  // This function calculates the equivalent resistance of two parallel resistors.
  const parsedValues = rawData.split(" ");

  const resistanceOne = parseFloat(parsedValues[0]);
  const resistanceTwo = parseFloat(parsedValues[1]);

  const equivalentResistance = 1.0 / (1.0 / resistanceOne + 1.0 / resistanceTwo);

  console.log(equivalentResistance);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
