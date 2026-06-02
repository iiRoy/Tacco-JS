function computeAndDisplay(rawInputString) {
  const parseInputNumbers = (dataString) => {
    const stringParts = dataString.split(" ");
    const numericArray = stringParts.map(Number);
    return numericArray;
  };

  const numericParts = parseInputNumbers(rawInputString);

  const valA = numericParts[0];
  const valB = numericParts[1];

  const productOfValues = valA * valB;
  const sumOfValues = valA + valB;

  const finalComputedResult = productOfValues / sumOfValues;

  console.log(finalComputedResult);
}

computeAndDisplay(require("fs").readFileSync("/dev/stdin", "utf8"));
