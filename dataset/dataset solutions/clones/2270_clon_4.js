function processInput(rawData) {
  const primeDivisor = 10000000007;

  const [firstLine, secondLine] = rawData.split("\n");
  const countElements = Number(firstLine);

  const numericSequence = secondLine.split(" ").map(Number);

  const relevantNumbers = numericSequence.slice(1);
  const sumOfRelevant = relevantNumbers.reduce((accumulator, current) => accumulator + current, 0);
  const averageOfRelevant = sumOfRelevant / (countElements - 1);

  const factorialLimit = countElements - 1;
  const factors = Array.from({ length: factorialLimit }, (_, index) => index + 1);
  const productFactorial = factors.reduce((accumulator, current) => accumulator * current, 1);

  const finalResult = (averageOfRelevant * productFactorial) % primeDivisor;
  console.log(finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
