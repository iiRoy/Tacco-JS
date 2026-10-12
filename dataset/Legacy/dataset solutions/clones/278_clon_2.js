String.prototype.replaceEvery = function (oldValue, newValue) {
  // This function replaces all occurrences of oldValue with newValue within the string.
  // It achieves this by splitting the string by oldValue and then joining the parts with newValue.
  return this.split(oldValue).join(newValue);
};

// An array to accumulate words that meet specific length criteria.
let collectedTerms = [];

// Activate the standard input stream to begin receiving data.
process.stdin.resume();

// Set the character encoding for the incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Attach an event listener for when data chunks are received from standard input.
process.stdin.on('data', function(incomingData) {
    // First, replace all periods with spaces, then all commas with spaces,
    // and finally split the resulting string by spaces to get an array of tokens.
    const tokenArray = incomingData
        .replaceEvery(".", " ")
        .replaceEvery(",", " ")
        .split(" ");

    // Iterate through each token in the generated array.
    for (let currentIdx in tokenArray) {
      // Check if the length of the current token is greater than 2 and less than 7.
      // This means words with lengths 3, 4, 5, or 6 are considered.
      if (tokenArray[currentIdx].length > 2 && tokenArray[currentIdx].length < 7) {
        // If the condition is met, add the token to our collection.
        collectedTerms.push(tokenArray[currentIdx]);
      }
    }
});

// Attach an event listener for when the standard input stream ends.
process.stdin.on('end', function() {
  // Once all input has been processed, join all the collected terms with a single space
  // and print the resulting string to the console.
  console.log(collectedTerms.join(" "));
});
