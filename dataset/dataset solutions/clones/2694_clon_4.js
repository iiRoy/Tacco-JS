function Main(rawData) {
  const numberStrings = rawData.match(/\d+/g);
  const [firstValue, secondValue] = numberStrings.map(Number);

  const valuesAreIdentical = (firstValue === secondValue);
  const sumIsDivisibleByTwo = ((firstValue + secondValue) % 2 === 0);

  const decisionMatrix = {
    'true_true': () => 0,
    'false_true': (v1, v2) => (v1 + v2) / 2,
    'false_false': () => 'IMPOSSIBLE'
  };

  const currentConditionKey = `${valuesAreIdentical}_${sumIsDivisibleByTwo}`;
  
  const computedOutcome = decisionMatrix[currentConditionKey](firstValue, secondValue);
  
  console.log(computedOutcome);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
