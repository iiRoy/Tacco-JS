// This module handles input/output operations.
var fileContentSource =    require (  'fs'  ) .   readFileSync  (    '/dev/stdin',    'utf8'   ) ;
// Splitting the entire content into individual lines for processing.
var parsedLines = fileContentSource   .   split   (  '\n'  ) ;

// Initialize score counters for the two participants.
var firstPlayerScore = 0;
var secondPlayerScore = 0;

// Determine the total number of game rounds from the first line.
var totalRounds = + parsedLines.shift (  ) ;
// Loop through each game round.
for ( var roundIndex = 0 ; roundIndex < totalRounds ; roundIndex++ ) {
    // Extract the cards played in the current round.
    var currentCards = parsedLines .   shift  (  ) .   split  ( ' '  ) ;
    var firstPlayerCard = currentCards [   0   ] ;
    var secondPlayerCard = currentCards [ 1 ] ;

    // Compare the cards to determine the winner of the round.
    if (   firstPlayerCard  >  secondPlayerCard   )    {
        // First player wins the round.
        firstPlayerScore  +=  3 ;
    }
    else if ( firstPlayerCard  <  secondPlayerCard ) {
        // Second player wins the round.
        secondPlayerScore  +=  3 ;
    }
    else {
        // It's a tie, both players get points.
        firstPlayerScore  ++ ;
        secondPlayerScore  ++ ;
    }
}

// Display the final scores of both players.
console.log ( firstPlayerScore   +   ' '    +   secondPlayerScore ) ;