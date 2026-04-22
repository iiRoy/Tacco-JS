const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const calculationModulus = 1000000007n;

const allInputTokens = rawInputContent.trim().split(/\s+/g);
let currentTokenPointer = 0;
const retrieveNextToken = () => allInputTokens[currentTokenPointer++];

const totalInputNumberCount = BigInt(retrieveNextToken());

const numericalInputs = [];
for (let currentNumIndex = 0; currentNumIndex < totalInputNumberCount; currentNumIndex++) {
    numericalInputs.push(BigInt(retrieveNextToken()));
}

const highestRelevantBit = 60; 

const bitOneCounts = new Array(highestRelevantBit + 1).fill(0n);

for (const currentNumber of numericalInputs) {
    let temporaryNumber = currentNumber;
    let bitPosition = 0;
    while (temporaryNumber > 0n && bitPosition <= highestRelevantBit) {
        if ((temporaryNumber & 1n) === 1n) {
            bitOneCounts[bitPosition]++;
        }
        temporaryNumber >>= 1n;
        bitPosition++;
    }
}

let cumulativeBitwiseSum = 0n;
let currentTwoPower = 1n;

for (let bitPosition = 0; bitPosition <= highestRelevantBit; bitPosition++) {
    const onesAtThisPosition = bitOneCounts[bitPosition];
    const zerosAtThisPosition = totalInputNumberCount - onesAtThisPosition;

    const termForThisBit = (currentTwoPower * onesAtThisPosition * zerosAtThisPosition) % calculationModulus;
    
    cumulativeBitwiseSum = (cumulativeBitwiseSum + termForThisBit) % calculationModulus;

    currentTwoPower = (currentTwoPower * 2n) % calculationModulus;
}

console.log(cumulativeBitwiseSum.toString());