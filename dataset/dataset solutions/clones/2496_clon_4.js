'use strict'

const processInputAndCompute = (sourceOfData) => {
    const rawContent = require('fs').readFileSync(sourceOfData, 'utf8');

    const contentLines = rawContent.trim().split('\n');
    
    // The first line provides a numerical length, which is not directly used in the final calculation
    // but is parsed as per the original's structure.
    const sequenceDimension = Number(contentLines[0].trim()); 
    
    // The second line contains the primary character series.
    const characterSeries = contentLines[1].trim();

    // Instead of an iterative scan with state variables,
    // this approach uses a regular expression to identify and segment
    // consecutive identical characters into distinct blocks.
    // The pattern /(.)\1*/g captures any character and then matches zero or more
    // subsequent occurrences of that *same* captured character, globally.
    const characterBlocks = characterSeries.match(/(.)\1*/g);

    // The total number of such distinct blocks is the length of the resulting array.
    // Handles cases where characterSeries might be empty (match returns null).
    const blockCount = characterBlocks ? characterBlocks.length : 0;

    console.log(blockCount);
};

processInputAndCompute('/dev/stdin');