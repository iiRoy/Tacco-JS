"use strict"
/* This file contains a solution for a competitive programming problem.
 * It reads input from /dev/stdin, processes it, and prints the result.
 *
 * The problem involves calculating a score based on a sequence of moves
 * in a game similar to Rock-Paper-Scissors, with some specific rules
 * for scoring based on repeating moves.
 */

const fs = require( "fs" ) ; // Import the 'fs' (file system) module to read input.

// Define the winning relationships for Rock-Paper-Scissors.
// Key is the opponent's hand, value is the hand that wins against it.
const winningHands = {
    r : "P" , // Paper wins against Rock
    s : "R" , // Rock wins against Scissors
    p : "S"   // Scissors wins against Paper
} ;

// Read the entire input from standard input, decode it as UTF-8, and split it into lines.
const lines = fs . readFileSync( "/dev/stdin" , { encoding : "utf8" } ) . split( "\n" ) ;

// Parse the first line of input.
const firstLine = lines [ 0 ] . split( " " ) ;

// Parse the second line of input.
const secondLine = lines [ 1 ] . split( " " ) ;

// Extract problem parameters from the first line.
const N = parseInt( firstLine [ 0 ] ) ; // Total number of game rounds (though not used directly in this solution's loop logic)
const K = parseInt( firstLine [ 1 ] ) ; // A parameter determining the stride for score calculation

// Extract points for each hand from the second line.
const R = parseInt( secondLine [ 0 ] ) ; // Points for winning with Rock
const S = parseInt( secondLine [ 1 ] ) ; // Points for winning with Scissors
const P = parseInt( secondLine [ 2 ] ) ; // Points for winning with Paper

// The sequence of opponent's moves is given in the third line.
const T = lines [ 2 ] ;

// Store the points in an object for easy lookup.
const POINTS = { R , S , P } ; // Object literal shorthand for { R: R, S: S, P: P }

let answer = 0 ; // Initialize the total accumulated score.

// Iterate K times, calculating the score for different subsequences.
// This structure suggests K independent calculations that are summed up.
for ( let k = 0 ; k < K ; ++ k ) {
    // Add the score from the 'sub' function to the total answer.
    answer += sub( k , K ) ;
}

// Print the final calculated answer to standard output.
console . log( answer ) ;

/**
 * Calculates the score for a specific subsequence of moves.
 *
 * @param {number} offset - The starting index for the subsequence in the T string.
 * @param {number} stride - The step size to take for consecutive moves in the subsequence.
 * @returns {number} The total score for this particular subsequence.
 */
function sub( offset , stride ) {
    let totalScore = 0 ; // Initialize the score for this subsequence.
    let prevHand = null ; // Tracks the winning hand from the *previous* move in the subsequence.
    let cnt = 0 ;         // Counts consecutive occurrences of the same winning hand.

    // Iterate through the T string with the given offset and stride.
    for ( let t = offset ; t < T . length ; t += stride ) {
        // Determine the hand that wins against the current opponent's move.
        const winningHand = winningHands [ T [ t ] ] ;

        // Check if the current winning hand is different from the previous one.
        if ( winningHand !== prevHand ) {
            // If there was a previous hand (i.e., not the very first iteration),
            // calculate and add its score before resetting.
            if ( prevHand ) {
                // Score is points for the winning hand multiplied by floor((count + 1) / 2).
                // This formula effectively scores every other win in a streak.
                totalScore += POINTS [ prevHand ] * Math . floor( ( cnt + 1 ) / 2 ) ;
            }
            // Reset the counter for the new streak.
            cnt = 0 ;
        }

        // Update the previous hand to the current winning hand.
        prevHand = winningHand ;

        // Increment the counter for the current streak.
        cnt ++ ;
    }

    // After the loop, if there's an ongoing streak, calculate and add its final score.
    if ( prevHand ) {
        totalScore += POINTS [ prevHand ] * Math . floor( ( cnt + 1 ) / 2 ) ;
    }

    // Return the accumulated score for this subsequence.
    return totalScore ;
}