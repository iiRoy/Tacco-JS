const operationsRegistry = {
    'multiplication': (valA, valB) => valA * valB,
    'sumAndDouble': (valA, valB) => (valA + valB) + (valA + valB)
};

const processNumericalPair = (firstValue, secondValue) => {
    const outcomeList = [];
    outcomeList.push(operationsRegistry['multiplication'](firstValue, secondValue));
    outcomeList.push(operationsRegistry['sumAndDouble'](firstValue, secondValue));
    return outcomeList;
};

let datum1 = 3;
let datum2 = 7;

const computationResults = processNumericalPair(datum1, datum2);

Reflect.apply(globalThis.console.log, globalThis.console, computationResults);