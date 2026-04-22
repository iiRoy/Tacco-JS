const fileSystemAccess = require('node:fs');
const rawInputData = fileSystemAccess.readFileSync('/dev/stdin', 'utf8');
const cleanedInputText = rawInputData.trim();

let greatestBalancedSequenceValue = 0;

let currentJCounter = 0;
let currentOCounter = 0;
let currentICounter = 0;
let processingState = 0; // 0: Awaiting J, 1: Collecting J's, 2: Collecting O's, 3: Collecting I's

for (let charPosition = 0; charPosition < cleanedInputText.length; charPosition++) {
    const symbol = cleanedInputText[charPosition];

    if (processingState === 0) { // Awaiting J to commence a new pattern
        if (symbol === 'J') {
            currentJCounter = 1;
            currentOCounter = 0;
            currentICounter = 0;
            processingState = 1; // Transition to collecting J's
        } else {
            // Not a 'J', so reset and remain in state 0
            currentJCounter = 0;
            currentOCounter = 0;
            currentICounter = 0;
        }
    } else if (processingState === 1) { // Currently collecting J's
        if (symbol === 'J') {
            currentJCounter++;
        } else if (symbol === 'O') {
            currentOCounter = 1;
            processingState = 2; // Transition to collecting O's
        } else {
            // Unexpected symbol, sequence broken. Re-evaluate this symbol from the start.
            currentJCounter = 0;
            currentOCounter = 0;
            currentICounter = 0;
            processingState = 0;
            charPosition--; // Decrement to re-process the current symbol in the next iteration
        }
    } else if (processingState === 2) { // Currently collecting O's
        if (symbol === 'O') {
            currentOCounter++;
        } else if (symbol === 'I') {
            currentICounter = 1;
            processingState = 3; // Transition to collecting I's
        } else {
            // Unexpected symbol, sequence broken. Re-evaluate this symbol from the start.
            currentJCounter = 0;
            currentOCounter = 0;
            currentICounter = 0;
            processingState = 0;
            charPosition--; // Decrement to re-process the current symbol
        }
    } else if (processingState === 3) { // Currently collecting I's
        if (symbol === 'I') {
            currentICounter++;
        } else {
            // 'I' sequence ended. Calculate the balanced length for the completed J-O-I block.
            const temporaryMin = Math.min(currentJCounter, currentOCounter, currentICounter);
            if (temporaryMin > greatestBalancedSequenceValue) {
                greatestBalancedSequenceValue = temporaryMin;
            }

            // Reset for a new potential sequence, re-evaluate the current symbol.
            currentJCounter = 0;
            currentOCounter = 0;
            currentICounter = 0;
            processingState = 0;
            charPosition--; // Decrement to re-process the current symbol
        }
    }
}

// After loop finishes, check if an 'I' sequence was ongoing at the very end of the string
if (processingState === 3) {
    const temporaryMin = Math.min(currentJCounter, currentOCounter, currentICounter);
    if (temporaryMin > greatestBalancedSequenceValue) {
        greatestBalancedSequenceValue = temporaryMin;
    }
}

process.stdout.write(greatestBalancedSequenceValue.toString() + '\n');