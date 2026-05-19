process.stdin.resume();
process.stdin.setEncoding('utf-8');

let inputBuffer = '';
let linePointer = 0;

process.stdin.on('data', incomingData => {
    inputBuffer += incomingData;
});

process.stdin.on('end', () => {
    inputBuffer = inputBuffer.split(/\n/);
    processInputAndCompute();
});

function obtainLine() {
    return inputBuffer[linePointer++];
}

function powerModulo(baseVal, exponentVal, modulusVal) {
    let resultVal = 1;
    baseVal %= modulusVal;
    while (exponentVal > 0) {
        if (exponentVal % 2 === 1) {
            resultVal = (resultVal * baseVal) % modulusVal;
        }
        baseVal = (baseVal * baseVal) % modulusVal;
        exponentVal = Math.floor(exponentVal / 2);
    }
    return resultVal;
}

function processInputAndCompute() {
    const primeDivisor = 1000000007; // Equivalent to Math.pow(10, 9) + 7
    const inputNumber = Number(obtainLine());

    const tenPower = powerModulo(10, inputNumber, primeDivisor);
    const ninePower = powerModulo(9, inputNumber, primeDivisor);
    const eightPower = powerModulo(8, inputNumber, primeDivisor);

    let intermediateResult = tenPower - ninePower + eightPower;

    // Ensure the final result is positive before applying modulo
    const finalSum = (intermediateResult % primeDivisor + primeDivisor) % primeDivisor;

    console.log(finalSum);
}
