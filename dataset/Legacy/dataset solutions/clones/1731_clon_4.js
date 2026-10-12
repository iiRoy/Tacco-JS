function* inputTokenGenerator() {
    const sourceText = require("fs").readFileSync("/dev/stdin", "utf-8").trim();
    const tokens = sourceText.split(/\n|\s/);
    yield* tokens;
}

function acquireTokens(numTokens, iteratorInstance) {
    const currentIterator = iteratorInstance || this.tokenIterator || (this.tokenIterator = inputTokenGenerator());
    const collected = [];
    for (let i = 0; i < numTokens; i += 1) {
        collected.push(currentIterator.next().value);
    }
    return collected;
}

function determineDivisorCount(targetValue) {
    if (targetValue === 0) return 0;
    return Array.from({ length: targetValue }, (_, index) => index + 1)
                .filter(divisorCandidate => targetValue % divisorCandidate === 0)
                .length;
}

(() => {
    const [ inputNString ] = acquireTokens(1);
    const upperLimit = parseInt(inputNString);

    console.log('start');

    const finalSum = Array.from({ length: upperLimit }, (_, index) => index + 1)
        .reduce((accumulator, currentK) => {
            const currentKDivisorCount = determineDivisorCount(currentK);
            return accumulator + (currentK * currentKDivisorCount);
        }, 0);

    console.log(finalSum);
})();
