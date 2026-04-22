"use strict";

let processInput = (  inputData ) => {
    // Process the raw input string by trimming and splitting into lines
    inputData = inputData.trim() . split("\n") ;
    // Parse the first line to get the total quantity of elements
    let countElements = parseInt( inputData[0] ) ;
    // Parse the second line to obtain the array of numeric values
    let numberArray = inputData[1].split(" ") .map(  val => parseInt(val) ) ;

    let currentSum = numberArray[0]; // Initialize the accumulated sum with the first element
    let modificationCount = 0;      // Initialize a counter for necessary adjustments

    for ( let idx = 1 ; idx < countElements ; idx++ ) {
        // Condition: if the running aggregate is positive or zero AND adding the current element keeps it positive or zero
        while ( currentSum >= 0 && currentSum + numberArray[idx] >= 0 ) {
            numberArray[idx]--; // Decrease the value of the current element
            modificationCount++; // Increment the counter for this adjustment
        }

        // Condition: if the running aggregate is negative or zero AND adding the current element keeps it negative or zero
        while ( currentSum <= 0 && currentSum + numberArray[idx] <= 0 ) {
            numberArray[idx]++; // Increase the value of the current element
            modificationCount++; // Increment the counter for this adjustment
        }

        currentSum += numberArray[idx]; // Update the accumulated sum with the (possibly modified) current element
    }

    console.log( modificationCount ); // Output the final tally of modifications
};
processInput( require('fs').readFileSync( '/dev/stdin' , 'utf8' ) );