process.stdin.resume();
process.stdin.setEncoding('utf8');

let parsedInputNumber;
const moduloValue = 1000000007;

const obtainFactorialModulo = (currentValue, modulusDivisor) => {
    if (currentValue === 0) {
        return 1;
    }
    return (currentValue * obtainFactorialModulo(currentValue - 1, modulusDivisor)) % modulusDivisor;
};

process.stdin.on('data', function (inputChunk) {
    inputChunk.trim().split('\n').forEach(function(inputLine) {
        parsedInputNumber = parseInt(inputLine, 10);
    });
});

process.stdin.on('end', function () {
    const finalResult = obtainFactorialModulo(parsedInputNumber, moduloValue);
    console.log(finalResult);
});
