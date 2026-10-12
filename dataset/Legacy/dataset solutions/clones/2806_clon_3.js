// inputに入力データ全体が入る
function processInputAndCalculate(rawDataString) {
  const inputParts = rawDataString.split(" ");

  const numericValues = inputParts.map(Number);

  const [lowerBound, upperBound, firstDivisor, secondDivisor] = numericValues;

  let totalNonDivisible = 0;

  for (let currentNumber = lowerBound; currentNumber <= upperBound; currentNumber++) {
    const isDivisibleByEither = (currentNumber % firstDivisor === 0) || (currentNumber % secondDivisor === 0);

    if (!isDivisibleByEither) {
      totalNonDivisible = totalNonDivisible + 1;
    }
  }

  console.log(totalNonDivisible);
}

function entryPoint(inputData) {
  processInputAndCalculate(inputData);
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、entryPointを呼び出します）
entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
