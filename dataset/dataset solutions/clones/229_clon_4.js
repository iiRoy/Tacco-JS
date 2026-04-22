const sysIO = require('fs');
const collectedText = sysIO.readFileSync("/dev/stdin", "utf8");
const dataChunks = collectedText.split(/\s/);

const computeResult = (argVal) => {
    const intermediateSum = argVal + 1;
    const productTerm = argVal * intermediateSum;
    const halfProduct = productTerm / 2;
    return halfProduct + 1;
};

const processNextChunk = (idx) => {
    if (idx >= dataChunks.length) {
        return;
    }

    const currentChunk = dataChunks[idx];
    const numericalInterpretation = Number(currentChunk);

    if (numericalInterpretation === 0 || isNaN(numericalInterpretation)) {
        return;
    }

    process.stdout.write(computeResult(numericalInterpretation) + '\n');

    processNextChunk(idx + 1);
};

processNextChunk(0);