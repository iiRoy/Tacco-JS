"use strict" /* This directive enforces strict mode, helping write cleaner and safer code by
                    catching common coding errors and "unsafe" actions. */


// Acquire the Node.js 'fs' (file system) module to handle file operations.
// Read the entire content from the standard input stream ('/dev/stdin')
// and decode it as a UTF-8 encoded string.
let   inputContent = require('fs') . readFileSync( '/dev/stdin' ,  'UTF-8'  ) ;

/*
 * Transform the raw input string into an array of strings,
 * where each element represents a line from the original input,
 * by splitting the content at each newline character.
 */
inputContent = inputContent .split( '\n' ) ;

// The very first line of the input typically contains essential configuration parameters.
// This line is split by spaces to isolate these individual settings.
const initialSettings = inputContent[0].split(' ') ;

// Extract the total number of participants from the first setting.
const participantCount = initialSettings[0] ;
// Obtain the starting point value for each participant from the second setting.
const startingPoints = initialSettings[1] ;
// Retrieve the penalty value that is applied universally from the third setting.
const penaltyValue = initialSettings[2] ;

// The subsequent lines in the input array represent a sequence of actions or events.
// These are collected into a separate array.
const actionIndices = inputContent.slice(1) ;


// Initialize an array that will keep track of each participant's score.
// It is initially empty and will be populated.
let currentScores = [ ] ;

/*
 * Iterate through all participants to set their initial score.
 * Each participant begins with 'startingPoints' and then 'penaltyValue' is deducted.
 */
for ( let participantIdx = 0 ; participantIdx < participantCount ; participantIdx ++ )
{
  currentScores[ participantIdx ] = startingPoints - penaltyValue ;
}

// Process each action recorded in 'actionIndices'.
// For every action, increment the score of the participant identified by the action's value
// (adjusting for 0-based array indexing).
actionIndices . map( affectedParticipant => currentScores[ affectedParticipant - 1 ] ++ ) ;

/*
 * Finally, evaluate the outcome for each participant based on their final score.
 * If a participant's score is greater than zero, print 'Yes' (indicating success).
 * Otherwise, print 'No' (indicating failure).
 */
currentScores . map( finalStatus => finalStatus > 0 ? console . log( 'Yes' ) : console . log( 'No' ) ) ;