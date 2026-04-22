/*
 *  Problem: 0505 Questionnaire - Aizu Online Judge
 *  Source:  http://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=0505
 *  Author:  Equim
 *  Date:    2017-02-08
 *
 *  This file contains a solution to the questionnaire problem.
 *  The goal is to calculate sums for each question and then
 *  output the question indices sorted by their sums in descending order.
 *  If sums are equal, sort by index in ascending order.
 */


// Enforce strict parsing and execution rules for better code quality.
'use strict'
;


// Read the entire input from standard input,
// decode it as UTF-8, remove leading/trailing whitespace,
// and split it into an array of lines.
var raw = require('fs').readFileSync('/dev/stdin', 'utf8') .trim() .split('\n')
;


// Main processing loop.
// Continues until a specific termination condition is met.
while (true) {

    // Extract the first line, which contains the dimensions (rows, columns).
    // Split by space and convert parts to numbers.
    var size = raw.shift().split(' ').map(Number)
    ;

    // Check for the termination condition: if the number of rows (size[0]) is 0.
    if (size[0] === 0)
    {
        break; // Exit the loop if the condition is met.
    }


    // Initialize an object to store the sum for each question (column).
    // The keys will be question indices (1-based), and values will be their sums.
    var count = {}
    ;

    // Loop through each row of the questionnaire data.
    // size[0] represents the number of rows.
    for (var i = 0; i < size[0]; i++)
    {
        // Read the current line (row), split by space, and convert to numbers.
        var line = raw.shift().split(' ').map(Number)
        ;

        // Loop through each element (question response) in the current row.
        // size[1] represents the number of columns (questions).
        for (var j = 0; j < size[1]; j++)
        {
            // Calculate the 1-based index for the current question.
            var questionIndex = j + 1;

            // Add the current response to the total count for this question.
            // If the question index is not yet in 'count', initialize its sum to 0.
            count[questionIndex] = ( (questionIndex) in count ? count[questionIndex] : 0 ) + line[j]
            ;
        }
    }

    // This comment is for internal thought process during development.
    // It indicates a desire for more concise lambda syntax support in older JS environments.
    // Support Lambda pls QAQ

    // 1. Get all question indices (keys) from the 'count' object.
    // 2. Sort these indices based on the problem's criteria:
    //    a. Primary sort: descending order of their sums (values in 'count').
    //    b. Secondary sort (tie-breaker): ascending order of their indices (keys).
    // 3. Join the sorted indices with a space to form the final output string.
    console.log(
        Object.keys(count) // Get an array of question indices (as strings).
            .sort(function(a, b) { // Custom sort function.
                // Compare sums first.
                return count[a] === count[b] // If sums are equal...
                       ? a - b              // ...sort by index ascending (convert string keys to numbers).
                       : count[b] - count[a] // ...otherwise, sort by sum descending.
            })
            .join(' ') // Join the sorted indices with spaces.
    )
    ;
}