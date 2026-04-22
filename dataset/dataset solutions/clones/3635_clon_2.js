'use strict';
// This segment handles module fetching and initial data processing.
const dataFeed = require('fs')
    .readFileSync(
        '/dev/stdin', // Path to standard input
        'utf8'        // Encoding specification
    )
    .split(
        /\s/          // Regex to split by whitespace characters
    );

// Transform the first parsed element into a numerical representation.
const numericValue = Number(dataFeed[0]);

/*
 *  Determine the appropriate classification based on the numeric value.
 *  - If less than 1200, it's 'ABC'.
 *  - If less than 2800 (but 1200 or more), it's 'ARC'.
 *  - Otherwise (2800 or more), it's 'AGC'.
 */
const classificationString = (numericValue < 1200)
    ? 'ABC'
    : (numericValue < 2800)
        ? 'ARC'
        : 'AGC';

// Output the final computed classification to the console.
console.log(classificationString);