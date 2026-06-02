let inputLine;
let finalResult = 0;
const modulusValue = Math.pow(10, 9) + 7;

const standardChars = ["A", "B", "C"];

const processInput = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

processInput.on('line', function (x) {
    inputLine = x;
});

processInput.on('close', function () {
    const sourceChars = inputLine.split("");
    const questionPositions = [];
    for (let i = 0; i < sourceChars.length; i++) {
        if (sourceChars[i] === '?') {
            questionPositions.push(i);
        }
    }

    const numQuestions = questionPositions.length;
    const totalPermutations = Math.pow(3, numQuestions);

    for (let permutationIndex = 0; permutationIndex < totalPermutations; permutationIndex++) {
        const tempPermutation = [...sourceChars];
        let currentBaseThree = permutationIndex;

        for (let j = 0; j < numQuestions; j++) {
            const baseThreeDigit = currentBaseThree % 3;
            tempPermutation[questionPositions[j]] = standardChars[baseThreeDigit];
            currentBaseThree = Math.floor(currentBaseThree / 3);
        }
        
        finalResult = (finalResult + calculateValue(tempPermutation, modulusValue)) % modulusValue;
    }

    console.log(finalResult);
});

function calculateValue(characterSequence, currentModulus) {
    let currentA = 0;
    let currentAB = 0;
    let currentABC = 0;

    let bCount = 0; // Counts occurrences of 'B' in the sequence so far for 'AB' calculation
    let cCount = 0; // Counts occurrences of 'C' in the sequence so far for 'ABC' calculation

    for (const char of characterSequence) {
        if (char === 'A') {
            currentA = (currentA + 1) % currentModulus;
        } else if (char === 'B') {
            currentAB = (currentAB + currentA + bCount) % currentModulus;
            bCount++;
        } else if (char === 'C') {
            currentABC = (currentABC + currentAB + cCount) % currentModulus;
            cCount++;
        }
    }
    return currentABC;
}
