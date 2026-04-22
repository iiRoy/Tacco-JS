function ProcessValues(sourceText) {
    const inputLines = sourceText.split('\n');
    const numberStrings = inputLines[1].split(' ');
    
    const numericEntities = numberStrings.map(entry => BigInt(entry));

    const aggregateSum = numericEntities.reduce((accu, currentElement) => accu + currentElement, BigInt(0));
    const sumOfSquares = numericEntities.reduce((accu, currentElement) => accu + (currentElement * currentElement), BigInt(0));

    const derivedNumerator = (aggregateSum * aggregateSum) - sumOfSquares;
    const finalComputation = derivedNumerator / BigInt(2);

    const MODULAR_CONSTANT = BigInt(1000000007);
    const displayedValue = finalComputation % MODULAR_CONSTANT;

    console.log(Number(displayedValue));
}

ProcessValues(require("fs").readFileSync("/dev/stdin", "utf8"));