// This program initializes the standard input stream.
process.stdin.resume();

// It then sets up an event listener to process incoming data.
process.stdin.on("data", function (payloadData) {
  // For each piece of data received, it calculates its cube
  // and prints the result to the console.
  console.log(Math.pow(payloadData, 3));
});
