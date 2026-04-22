/*
 * This module processes game round data from a provided input source.
 * It calculates scores for two players based on a series of rounds.
 */
( function ( dataSource )
  {
    // Split the entire input string into individual lines.
    var lineFragments = dataSource . split ( '\n' ) ;

    /*
     * Extract the total number of rounds from the first line.
     * Although this variable is not used in the scoring logic,
     * its extraction maintains the original structural flow.
     */
    var totalRoundsCount = parseInt ( lineFragments . shift () , 10 ) ;

    // Initialize an iteration counter for processing game rounds.
    let roundIterator = 0 ;

    // Declare and initialize score variables for the two participants.
    let playerOneScore = 0 ,
        playerTwoScore = 0 ;

    // Loop through a fixed number of rounds (3 in this case).
    while ( roundIterator ++ < 3 )
    {
      // Retrieve the next line, which contains card values for the current round.
      var currentRoundCards = lineFragments . shift () . split ( ' ' ) ;

      // Parse the card values for each player into integers for numerical comparison.
      var firstPlayerCard = parseInt ( currentRoundCards [ 0 ] , 10 ) ;
      var secondPlayerCard = parseInt ( currentRoundCards [ 1 ] , 10 ) ;

      // Determine the winner of the current round and update scores accordingly.
      if ( firstPlayerCard > secondPlayerCard )
      {
        playerOneScore += 3 ; // Player One wins the round.
      }
      else if ( firstPlayerCard < secondPlayerCard )
      {
        playerTwoScore += 3 ; // Player Two wins the round.
      }
      else
      {
        playerOneScore ++ ; // It's a draw, both players get one point.
        playerTwoScore ++ ;
      }
    }

    // Output the final scores of both players to the console.
    console . log ( 'Final Scores: %d %d' , playerOneScore , playerTwoScore ) ;

  }
) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;