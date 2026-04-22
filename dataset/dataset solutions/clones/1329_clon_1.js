var input = "";


// This line ensures that the standard input stream remains active.
process.stdin.resume();


/*
 * The encoding for the incoming data from stdin is set to 'utf-8'.
 * This is crucial for proper character handling.
 */
process.stdin.setEncoding(
  'utf-8'
);


// An event listener for 'data' chunks received from the standard input.
process.stdin.on(
  'data',
  function (
    chunk
  )
  {
    // Each received data chunk is appended to the 'input' string.
    input += chunk;
  }
);


/*
 * This event listener triggers when the standard input stream
 * signals that it has finished receiving all data.
 */
process.stdin.on(
  'end',
  function (
  )
  {
    // The accumulated input string is split into an array of lines.
    input = input.split(
      "\n"
    );

    /*
     * The first line of input (input[0]) is parsed as an integer.
     * This integer 'n' represents the total number of game rounds.
     */
    var n = parseInt(
      input[0],
      10
    );

    // Initialize the score for Taro to zero.
    var taro = 0;
    // Initialize the score for Hanako to zero as well.
    var hanako = 0;


    /*
     * A loop iterates through each game round.
     * The rounds are indexed from 1 up to 'n' (inclusive).
     */
    for (
      i = 1;
      i <= n;
      i++
    )
    {
      // Each line representing a round is split by a space to get two card values.
      var card = input[i].split(
        " "
      );

      /*
       * Conditional logic to determine the winner of the current round
       * and update scores accordingly.
       */
      if (
        card[0]
        <
        card[1]
      )
      {
        // If Taro's card is less than Hanako's, Hanako gets 3 points.
        hanako += 3;
      }
      else if (
        card[0]
        ==
        card[1]
      )
      {
        // If both cards are equal, it's a draw, and both get 1 point.
        taro += 1;
        hanako += 1;
      }
      else
      {
        // If Taro's card is greater, Taro gets 3 points.
        taro += 3;
      }
    }


    /*
     * Finally, the program outputs the total scores for Taro and Hanako
     * to the console, separated by a space.
     */
    console.log(
      taro,
      hanako
    );
  }
);