process.stdin.resume();
process.stdin.setEncoding('utf-8');

let dataBuffer = '';
let lineIndex = 0;

process.stdin.on('data', incomingChunk => {
    dataBuffer += incomingChunk;
});

process.stdin.on('end', () => {
    dataBuffer = dataBuffer.split(/\n/);
    executeProgram();
});

function fetchLine() {
    return dataBuffer[lineIndex++];
}

const moduloVal = Math.pow(10, 9) + 7;

function executeProgram() {
    const inputCount = Number(fetchLine());
    let powerOfTen = 1;
    let powerOfNine = 2;
    let powerOfEight = 1;

    for (let iter = 0; iter < inputCount; iter++) {
        powerOfTen = (powerOfTen * 10) % moduloVal;
        powerOfNine = (powerOfNine * 9) % moduloVal;
        powerOfEight = (powerOfEight * 8) % moduloVal;
    }

    const finalResult = powerOfTen - powerOfNine + powerOfEight;
    console.log(finalResult >= 0 ? finalResult % moduloVal : finalResult + moduloVal);
}
