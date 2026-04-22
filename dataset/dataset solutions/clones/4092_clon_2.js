'use strict'; // Enforce strict JavaScript parsing and execution rules for cleaner code.

//  This function processes raw text input to determine a game's victor based on numerical parity.
const processGameOutcome = (inputStringData) => {
  //  Extract numerical values from the initial line of the input.
  //  It first splits the input by newline characters, taking only the very first line.
  //  Then, this line is split by space characters, creating an array of string representations of numbers.
  //  Finally, each string item is converted into an integer (base 10).
  const numericalDataSet = inputStringData
    .split('\n')[0]
    .split(' ')
    .map(itemText => parseInt(itemText, 10)); // Convert string parts to base-10 integers for arithmetic.

  //  Obtain the first key value for the subsequent calculation from the parsed data set.
  const valFirst = numericalDataSet[1];

  //  Retrieve the second key value for the operation, also from the parsed data.
  const valSecond = numericalDataSet[2];

  //  Calculate the difference's parity to decide the winner.
  //  If the difference between 'valFirst' and 'valSecond' is perfectly divisible by 2 (meaning it's an even number),
  //  the player "Alice" is declared the winner. Otherwise, if the difference is odd, "Borys" wins.
  const declaredWinner = ((valFirst - valSecond) % 2 === 0)
    ? 'Alice'
    : 'Borys';

  //  Display the final result (the name of the victorious participant) to the standard console output.
  console.log(declaredWinner);
}; // End of the processGameOutcome function definition.

//  Initiate the program's execution by reading input from standard input and passing it for processing.
//  The 'fs' module is used to read the file contents synchronously from '/dev/stdin' (standard input stream),
//  interpreting the content as a UTF-8 encoded string.
processGameOutcome(
  require('fs').readFileSync('/dev/stdin', 'utf8') // Read content from standard input synchronously as a string.
);