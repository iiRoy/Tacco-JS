"use strict"

// This script processes an input string to find the relative order difference
// between two specified sequences within a set of all possible permutations.

/**
 * Main entry point function for processing the given input data.
 * It parses the input, generates permutations, and calculates
 * the absolute difference in indices of two target arrangements.
 *
 * @param {string} inputString The raw string content from the input source.
 */
function processInputData( inputString ) {

    // Split the input into individual lines and clean up whitespace.
    const parsedLines = inputString.trim().split( "\n" ) ;

    // Extract the first sequence from the second line of the input.
    const firstSequence = parsedLines[ 1 ].split( " " ) ;

    // Extract the second sequence from the third line of the input.
    const secondSequence = parsedLines[ 2 ].split( " " ) ;

    // Generate all possible ordered arrangements of the elements in the first sequence.
    let allArrangements = generatePermutations( firstSequence, firstSequence.length ) ;

    // Convert the first sequence array into a single contiguous string for comparison.
    const firstSequenceJoined = firstSequence.join( "" ) ;

    // Convert the second sequence array into a single contiguous string for comparison.
    const secondSequenceJoined = secondSequence.join( "" ) ;

    let firstSequenceIndex ;
    let secondSequenceIndex ;

    // Convert each generated arrangement (which is an array of elements) into a string.
    for ( let idx = 0 ; idx < allArrangements.length ; idx++ ) {
        allArrangements[ idx ] = allArrangements[ idx ].join( "" ) ;
    }

    // Sort all the generated string arrangements lexicographically.
    allArrangements.sort() ;

    // Iterate through the sorted arrangements to find the indices of our target sequences.
    for ( let currentIdx = 0 ; currentIdx < allArrangements.length ; currentIdx++ ) {
        // Check if the current arrangement matches the first target sequence.
        if ( firstSequenceJoined === allArrangements[ currentIdx ] ) {
            firstSequenceIndex = currentIdx ;
        }
        // Check if the current arrangement matches the second target sequence.
        if ( secondSequenceJoined === allArrangements[ currentIdx ] ) {
            secondSequenceIndex = currentIdx ;
        }
    }

    // Output the absolute difference between the found indices.
    console.log( Math.abs( firstSequenceIndex - secondSequenceIndex ) ) ;
}

// Invoke the main processing function, reading input from standard input.
processInputData( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) ) ;


/**
 * Recursively generates all unique permutations (ordered arrangements)
 * of a given set of elements.
 *
 * @param {Array<any>} inputElements The array of items from which to generate permutations.
 * @param {number} subsetSize The number of elements to choose for each permutation (typically inputElements.length).
 * @returns {Array<Array<any>>} An array containing all generated permutations, each as an array.
 */
function generatePermutations( inputElements, subsetSize ) {

    const resultList = [ ] ; // Stores the collected permutations.

    // If the requested subset size is larger than the available elements,
    // no permutations are possible.
    if ( inputElements.length < subsetSize ) {
        return [ ] ;
    }

    // Base case: if we need to choose only one element,
    // each element itself forms a permutation.
    if ( subsetSize === 1 ) {
        for ( let elementIdx = 0 ; elementIdx < inputElements.length ; elementIdx++ ) {
            resultList[ elementIdx ] = [ inputElements[ elementIdx ] ] ;
        }
    }
    // Recursive step: for choosing more than one element.
    else {
        // Iterate through each element in the input set.
        for ( let currentElementIdx = 0 ; currentElementIdx < inputElements.length ; currentElementIdx++ ) {

            // Create a temporary array excluding the current element.
            const remainingElements = inputElements.slice( 0 ) ;
            remainingElements.splice( currentElementIdx, 1 ) ; // Remove the current element.

            // Recursively find permutations of the remaining elements for a smaller subset size.
            const subPermutations = generatePermutations( remainingElements, subsetSize - 1 ) ;

            // Combine the current element with each of the sub-permutations.
            for ( let subRowIdx = 0 ; subRowIdx < subPermutations.length ; subRowIdx++ ) {
                resultList.push( [ inputElements[ currentElementIdx ] ].concat( subPermutations[ subRowIdx ] ) ) ;
            }
        }
    }

    return resultList ; // Return the complete list of permutations.
}