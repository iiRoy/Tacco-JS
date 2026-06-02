process.stdin.resume();
process.stdin.setEncoding('utf-8');
 
let rawDataBuffer = '';
let lineIndex = 0;
 
function fetchNextLine() {
    return rawDataBuffer[lineIndex++];
}

const moduloConstant = Math.pow(10, 9) + 7;

function normalizeModulo(value, mod) {
    const result = value % mod;
    return result >= 0 ? result : result + mod;
}

function updateModularValue(currentValue, multiplier, modulus) {
    return (currentValue * multiplier) % modulus;
}

function executeCalculation() {
    const inputCountStr = fetchNextLine();
    const inputCount = Number(inputCountStr);

    let powerOfTen = 1;
    let powerOfNine = 2;
    let powerOfEight = 1;

    for (let iterationCounter = 0; iterationCounter < inputCount; iterationCounter++) {
        powerOfTen = updateModularValue(powerOfTen, 10, moduloConstant);
        powerOfNine = updateModularValue(powerOfNine, 9, moduloConstant);
        powerOfEight = updateModularValue(powerOfEight, 8, moduloConstant);
    }

    const intermediateSum = powerOfTen - powerOfNine + powerOfEight;
    const finalResult = normalizeModulo(intermediateSum, moduloConstant);
    
    console.log(finalResult);
}

function initializeInputSystem() {
    process.stdin.on('data', (chunk) => {
        rawDataBuffer += chunk;
    });
 
    process.stdin.on('end', () => {
        const processedLines = rawDataBuffer.split(/\n/);
        rawDataBuffer = processedLines;
        executeCalculation();    
    });
}

initializeInputSystem();
