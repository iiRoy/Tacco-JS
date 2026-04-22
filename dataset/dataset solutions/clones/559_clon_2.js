'use strict';

// This module provides a decoder for a shifted alphabet cipher.
function decodeShifted ( encodedMessage ) {
    var decodedString  =  ''; /* Initialize an empty string to accumulate the result */

    // Variable to hold the numeric value of each character
    var charNumericVal ;

    for ( var  idx = 0 ;  idx  <  encodedMessage.length ;  idx ++ ) {
        charNumericVal = encodedMessage.charCodeAt(idx) - 3; // Apply the reverse shift
        if (charNumericVal < 65) { // If the character wraps around before 'A'
            charNumericVal += 26; // Wrap it back around the alphabet
        }
        decodedString += String.fromCharCode(charNumericVal); // Append the transformed character
    }
    
    return decodedString; // Deliver the final decoded text
}

// Input/Output handling section
require('readline') .createInterface ( {
    input : process.stdin , // Standard input stream
    output : process.stdout // Standard output stream
} ) .on ( 'line' ,  function (inputLine) {
    console.log(decodeShifted(inputLine.trim())); // Process each line and print the outcome
} );