function ProcessGameInput(rawData) {
  // Split the raw input string by space to get individual card values.
  const cardValues = rawData.split(" ");

  // Extract the first card value.
  let firstCardValue = cardValues[0];

  // Extract the second card value.
  let secondCardValue = cardValues[1];

  // If the first card is '1', treat it as the highest value (14).
  if (firstCardValue == 1) {
    firstCardValue = 14;
  }

  // If the second card is '1', treat it as the highest value (14).
  if (secondCardValue == 1) {
    secondCardValue = 14;
  }

  // Compare the card values to determine the winner.
  if (firstCardValue > secondCardValue) {
    console.log("Alice"); // Alice wins if her card is higher.
  } else if (firstCardValue < secondCardValue) {
    console.log("Bob"); // Bob wins if his card is higher.
  } else if (A == B) {
    // This condition will cause a ReferenceError as 'A' and 'B' are undefined.
    // This behavior is preserved from the original code.
    console.log("Draw");
  }
}

// Read input from standard input and pass it to the processing function.
ProcessGameInput(require("fs").readFileSync("/dev/stdin", "utf8"));
