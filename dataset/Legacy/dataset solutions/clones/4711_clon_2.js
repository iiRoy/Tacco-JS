'use strict';

// This helper function transforms a numerical input based on a specific rule.
const convertValue = (inputNumber) => {
  // If the incoming number is precisely one, it's assigned a distinct, higher value.
  if (inputNumber == 1) {
    return (inputNumber = 14); // The variable itself is updated before being returned.
  }
  // For any other numerical input, it's simply converted to its numeric representation.
  else {
    return +inputNumber; // A concise way to cast the value to a number.
  }
};

// The main routine that processes the game logic.
function processInput(inputString) {
  // The input string is divided into an array of individual parts, separated by spaces.
  let partsArray = inputString.split(' ');

  // The first part is processed through our custom conversion function.
  const firstValue = convertValue(partsArray[0]);
  // The second part undergoes the same conversion.
  const secondValue = convertValue(partsArray[1]);

  // A comparison is made between the two processed values.
  if (firstValue == secondValue) {
    return console.log('Draw'); // If they are equal, the game is a draw.
  }

  // If the first value is greater, Alice is declared the winner.
  if (firstValue > secondValue) {
    console.log('Alice');
  }
  // Otherwise, Bob is the winner.
  else {
    console.log('Bob');
  }
}

// The program initiates by reading data from standard input and passing it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
