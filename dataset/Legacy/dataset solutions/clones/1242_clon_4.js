import * as Fs from 'fs';

const inputData = Fs.readFileSync('/dev/stdin', 'utf8');
const inputTokens = [];
let currentTokenAccumulator = '';

for (let i = 0; i < inputData.length; i++) {
    const character = inputData[i];
    if (character === ' ') {
        inputTokens.push(currentTokenAccumulator);
        currentTokenAccumulator = '';
    } else {
        currentTokenAccumulator += character;
    }
}
inputTokens.push(currentTokenAccumulator);

const processedNumbers = [];
for (let j = 0; j < inputTokens.length; j++) {
    processedNumbers.push(BigInt(inputTokens[j]));
}

const [firstOperand, secondOperand] = processedNumbers;

const calculateFloorValue = (valueToFloor) => Math.floor(valueToFloor);

console.log(calculateFloorValue(firstOperand / secondOperand), firstOperand % secondOperand, firstOperand / secondOperand);
