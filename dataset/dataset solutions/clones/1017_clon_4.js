let inputSource = require('node:fs').readFileSync(0, 'utf8');
let inputTokens = inputSource.trim().split(' ');

const operationMap = {
  '+': (firstValue, secondValue) => firstValue + secondValue,
  '-': (firstValue, secondValue) => firstValue - secondValue,
  '*': (firstValue, secondValue) => firstValue * secondValue,
};

function evaluateNextToken(currentDataStore, currentToken) {
  const temporaryStore = [...currentDataStore];

  if (operationMap[currentToken]) {
    const valueB = Number.parseInt(temporaryStore.pop(), 10);
    const valueA = Number.parseInt(temporaryStore.pop(), 10);
    temporaryStore.push(operationMap[currentToken](valueA, valueB));
  } else {
    temporaryStore.push(Number.parseInt(currentToken, 10));
  }
  return temporaryStore;
}

let finalResultStore = inputTokens.reduce(evaluateNextToken, []);
console.log(finalResultStore[0]);