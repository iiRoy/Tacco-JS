"use strict";

const processInput = (inputData) => {
    // Clean and parse the input string
    inputData = inputData.trim().split('\n');
    const limitNum = parseInt(inputData[0]);
    
    // Initialize a 2D array (matrix) to store counts
    // countMatrix[firstDigit][lastDigit] will store how many numbers
    // from 1 to limitNum start with 'firstDigit' and end with 'lastDigit'.
    const countMatrix = []; 
    
    // Populate the count matrix with initial zeros
    for (let outerIdx = 0; outerIdx < 10; outerIdx++) {
        countMatrix.push(new Array(10).fill(0)); 
    }
    
    // Iterate through numbers from 1 to limitNum
    for (let currentNum = 1; currentNum <= limitNum; currentNum++) {
        const numStr = String(currentNum);
        // Extract the first digit
        const firstDigit = parseInt(numStr[0]);
        // Extract the last digit
        const lastDigit = parseInt(numStr[numStr.length - 1]);
        
        // Increment the count for the corresponding (firstDigit, lastDigit) pair
        countMatrix[firstDigit][lastDigit]++; 
    }
    
    // console.log(countMatrix.map(row => row.join(' ')).join('\n')); // Optional: Debugging output for the matrix
    
    let finalResult = 0; // This variable will accumulate the final sum
    
    // Calculate the total number of pairs (a, b) such that
    // a starts with digit 'i' and ends with digit 'j', AND
    // b starts with digit 'j' and ends with digit 'i'.
    // This is done by multiplying countMatrix[i][j] by countMatrix[j][i].
    for (let idxA = 0; idxA < 10; idxA++) {
        for (let idxB = 0; idxB < 10; idxB++) {
            finalResult += countMatrix[idxA][idxB] * countMatrix[idxB][idxA]; 
        }
    }
    
    // Output the computed final result
    console.log(finalResult);
};

// Read input from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
