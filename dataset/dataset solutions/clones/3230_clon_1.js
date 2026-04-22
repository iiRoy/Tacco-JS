/* This is a Type I clone of the original JavaScript code.
   Only whitespace and comments have been altered.
   The core logic, identifiers, and structure remain strictly identical. */

"use strict"
; /* Enable strict mode for the entire script. */

// Function to perform a bitwise XOR operation on two numbers.
// It converts numbers to binary strings, pads them, performs XOR,
// and then converts the result back to an integer.
function XOR( a, X ) {

    let strA = a.toString(2)
    ; // Convert the first number 'a' to its binary string representation.

    let strX = X.toString(2)
    ; // Convert the second number 'X' to its binary string representation.

    // Determine the maximum length between the two binary strings.
    let max = Math.max( strA.length, strX.length )
    ;

    /* Pad 'strA' with leading zeros to match the 'max' length. */
    strA = "0".repeat( max - strA.length ) + strA
    ;
    // Pad 'strX' with leading zeros to match the 'max' length.
    strX = "0".repeat( max - strX.length ) + strX
    ;

    let result = ""
    ; // Initialize an empty string to store the XOR result.

    // Loop through each bit position from left to right.
    for ( let i = 0 ; i < max ; i++ ) {
        // If bits at the current position are the same, append "0".
        if ( strA[i] === strX[i] ) {
            result += "0"
            ;
        }
        // If bits are different, append "1".
        else {
            result += "1"
            ;
        }
    }
    // Convert the resulting binary string back to an integer (base 2).
    return parseInt( result, 2 )
    ;
}

// Main function to process input and solve the problem.
function main( input ) {

    // Split the input string by newlines and filter out any empty lines.
    const inputs = input.split("\n").filter( x => x !== "" )
    ;

    // Parse N (number of elements) and K (target value) from the first line.
    const N = inputs[0].split(" ").map(Number)[0]
    ;
    const K = inputs[0].split(" ").map(Number)[1]
    ;
    // Parse array A from the second line.
    const A = inputs[1].split(" ").map(Number)
    ;

    // Create a sorted copy of array A to find the maximum element.
    const sA = A.sort((a,b) => a-b)
    ;
    // Get the maximum value from the sorted array.
    const maxA = sA[sA.length - 1]
    ;
    // Determine the number of bits required to represent the maximum value.
    const maxDigit = maxA.toString(2).length
    ;
    // Convert each number in A to a binary string, padded with leading zeros
    // to match 'maxDigit'.
    const strA = A.map(num => {
        let str = num.toString(2)
        ;
        return "0".repeat(maxDigit - str.length) + str
        ;
    })
    ;

    // console.log({N,K,A,strA,maxA, maxDigit}) // Debugging line, commented out.

    let result = ""
    ; // Initialize an empty string for the constructed binary representation of X.

    // Iterate through each bit position from the most significant down to the least.
    for (let i = 0 ; i < maxDigit ; i++ ) {
        let count0 = 0
        ; // Counter for '0's at the current bit position.
        let count1 = 0
        ; // Counter for '1's at the current bit position.

        // Count '0's and '1's at the current bit position across all numbers in strA.
        strA.forEach( str => {
            if ( str[i] === "0" ) {
                count0++
                ;
            } else {
                count1++
                ;
            }
        })
        ;

        // Based on the counts, decide the bit for X.
        // If '0's are more frequent, choosing '1' for X at this position
        // will maximize the sum of XORs.
        if ( count0 > count1 ) {
            result += "1"
            ;
        }
        // Otherwise, choosing '0' for X at this position is better.
        else {
            result += "0"
            ;
        }
    }

    // Determine the number of bits in K.
    let dK = K.toString(2).length
    ;

    // console.log({result}, result.length); // Debugging line, commented out.

    // Adjust the 'result' (binary string of X) based on K.
    if ( result.length < dK ) {
        // If 'result' is shorter than K's binary representation,
        // pad with '1's to make it equal in length, as this maximizes.
        result = "1".repeat( dK - result.length ) + result
        ;
    } else if( K === 0 ) {
        // If K is 0, then X should be 0 to maximize the sum (0 XOR A = A).
        result = "0"
        ;
    } else {
        // If 'result' is longer than K's binary representation,
        // take the dK least significant bits.
        result = result.slice( result.length - dK )
        ;
    }

    // Convert the final binary string 'result' to an integer X.
    let X = parseInt( result, 2 )
    ;

    // console.log({dK, result, X}) // Debugging line, commented out.

    // Calculate the sum of XORs of each element in A with the determined X.
    let fX = A.map( a => XOR(a, X) ).reduce( (acc, cur) => cur + acc )
    ;
    // Print the final calculated sum.
    console.log(fX)
    ;

}

// Read input from standard input and pass it to the main function.
main( require("fs").readFileSync("/dev/stdin", "utf8") )
;