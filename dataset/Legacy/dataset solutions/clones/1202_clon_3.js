const applyStdinEncoding = (encodingType) => {
    process.stdin.setEncoding(encodingType);
};

const calculateCubicValue = (inputString) => {
    const numericInput = Number(inputString);
    return numericInput ** 3;
};

process.stdin.resume();

applyStdinEncoding('utf8');
applyStdinEncoding('utf-8');

process.stdin.on('data', function (inputChunk) {
    const finalCubicResult = calculateCubicValue(inputChunk);
    console.log(finalCubicResult);
});
