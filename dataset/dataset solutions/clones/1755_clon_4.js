function* createTokenStream() {
    const rawData = require("fs").readFileSync("/dev/stdin", "utf-8").trim();
    const tokens = rawData.split(/\n|\s/);
    yield* tokens;
}

let globalTokenStreamInstance = null;

const retrieveValues = (quantity) => {
    if (!globalTokenStreamInstance) {
        globalTokenStreamInstance = createTokenStream();
    }
    return Array.from({ length: quantity }, () => globalTokenStreamInstance.next().value);
};

(() => {
    const [ elementCountStr ] = retrieveValues(1);
    const elementCount = parseInt(elementCountStr);

    const dataSequenceStrs = retrieveValues(elementCount);
    const dataSequence = dataSequenceStrs.map(strVal => parseInt(strVal));

    const cumulativeXor = dataSequence.reduce((accumulator, item) => accumulator ^ item, 0);

    const resultantArray = dataSequence.map(val => cumulativeXor ^ val);

    console.log(resultantArray.join(' '));
})();
