'use strict';

const processDataStream = (incomingData) => {
    // Step 1: Isolate the initial data segment (first line, after trimming)
    let newlinePosition = -1;
    for (let k = 0; k < incomingData.length; ++k) {
        if (incomingData[k] === '\n') {
            newlinePosition = k;
            break;
        }
    }

    let fullFirstLine;
    if (newlinePosition === -1) {
        fullFirstLine = incomingData;
    } else {
        fullFirstLine = incomingData.substring(0, newlinePosition);
    }

    let initialOffset = 0;
    while (initialOffset < fullFirstLine.length && /\s/.test(fullFirstLine[initialOffset])) {
        initialOffset++;
    }
    let finalOffset = fullFirstLine.length - 1;
    while (finalOffset >= initialOffset && /\s/.test(fullFirstLine[finalOffset])) {
        finalOffset--;
    }
    const relevantSegment = fullFirstLine.substring(initialOffset, finalOffset + 1);

    // Step 2: Disassemble the segment into discrete tokens (words)
    const tokenBuffer = [];
    let currentToken = '';
    let readingToken = false;
    let tokenCount = 0;

    for (let currentIdx = 0; currentIdx < relevantSegment.length; ++currentIdx) {
        const charUnit = relevantSegment[currentIdx];
        if (/\s/.test(charUnit)) { // It's a whitespace character
            if (readingToken) { // If we just finished a word
                tokenBuffer.push(currentToken);
                currentToken = '';
                readingToken = false;
                tokenCount++;
                if (tokenCount === 3) break; // Optimization: stop after collecting 3 words
            }
        } else { // It's a non-whitespace character
            currentToken += charUnit;
            readingToken = true;
        }
    }
    // Add the last token if it exists and we haven't hit 3 yet
    if (readingToken && tokenCount < 3) {
        tokenBuffer.push(currentToken);
    }

    // Step 3: Construct the final sequence from the initial characters of tokens
    // This must precisely replicate the original's error behavior for missing words.
    // The original code would attempt to access `undefined[0]` if fewer than 3 words are present,
    // leading to a TypeError. Here, `undefined.charAt(0)` will cause the same type of error.
    let outputSequence = '';
    const targetIndices = [0, 1, 2]; // We need the 0th, 1st, and 2nd word's initial character

    outputSequence = targetIndices.reduce((accumulator, currentTargetIndex) => {
        const currentTokenReference = tokenBuffer[currentTargetIndex];
        // If 'currentTokenReference' is undefined (i.e., fewer than 3 words were found),
        // attempting to call .charAt(0) on it will throw a TypeError, mirroring the original's error.
        return accumulator + currentTokenReference.charAt(0);
    }, '');

    console.log(outputSequence);
};

// Execution environment setup, using different identifiers
const ioModule = require('fs');
const fileReader = ioModule.readFileSync;
const dataSourcePath = '/dev/stdin';
const textEncoding = 'utf8';

const acquiredData = fileReader(dataSourcePath, textEncoding);
processDataStream(acquiredData);