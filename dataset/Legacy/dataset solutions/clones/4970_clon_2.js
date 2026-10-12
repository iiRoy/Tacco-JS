// This script processes input from standard input to determine a winner based on a card game logic.
console.log(
  (
    (inputData) => { // An immediately invoked function expression to encapsulate the game's logic.
      // The input string is expected to contain three lines, each representing a player's cards.
      // These lines are processed to create three arrays of characters, with the cards in reverse order.
      const [firstArr, secondArr, thirdArr] = inputData
        .trim() // Remove any leading or trailing whitespace from the entire input.
        .split`\n` // Split the input string into an array of strings, one for each line.
        .map(
          (lineContent) => lineContent.split('').reverse() // For each line, convert it to an array of characters and then reverse that array.
        );

      // An object is created to map player identifiers ('a', 'b', 'c') to their respective card arrays.
      const cardPiles = {
        a: firstArr, // Player 'a's cards.
        b: secondArr, // Player 'b's cards.
        c: thirdArr // Player 'c's cards.
      };

      // The game starts with player 'a'. This variable will track the current player.
      let currentPlayer = 'a';

      // The game continues as long as the current player's pile of cards is not empty.
      while (cardPiles[currentPlayer].length > 0) {
        // The current player takes the top card from their pile.
        // This card's character (which is 'a', 'b', or 'c') determines the next player.
        currentPlayer = cardPiles[currentPlayer].pop();
      }

      // Once a player's pile is empty, the loop terminates.
      // The 'currentPlayer' variable at this point holds the identifier of the player
      // who just ran out of cards, meaning they are the winner.
      // The identifier is converted to uppercase for the final output.
      return currentPlayer.toUpperCase();
    }
  )(
    require('fs').readFileSync('/dev/stdin', 'utf8') // Read the entire content of standard input synchronously as a UTF-8 string.
  )
);
