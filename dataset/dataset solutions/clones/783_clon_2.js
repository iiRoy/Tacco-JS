var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read the entire input from standard input
var lineData = (rawData.trim()).split("\n"); // Trim whitespace and split the input into an array of lines

var idx = 0; // An index variable, though not actively used in the loop's logic
var resultBuffer = ""; // A string buffer to accumulate the output for all test cases

// Loop indefinitely until a specific termination condition is met
while (true) {
   // Extract the purchase amount for the current transaction
   // The `- 0` converts the string to a number explicitly
   var purchaseAmount = lineData.shift() - 0;

   // If the purchase amount is 0, it signifies the end of input, so break the loop
   if (purchaseAmount === 0) break;

   // Extract the counts of coins initially provided by the customer
   // Split the string by space and convert each part to a number
   var initialCoins = (lineData.shift()).split(" ").map(Number);

   // Calculate the total value of coins provided by the customer
   // Then subtract the purchase amount to find the change that needs to be returned
   var changeDue = (10 * initialCoins[0] + 50 * initialCoins[1] + 100 * initialCoins[2] + 500 * initialCoins[3]) - purchaseAmount;

   // Initialize an array to keep track of the number of each coin denomination to be returned
   // The indices correspond to 10, 50, 100, and 500 yen coins respectively
   var returnedCoins = [0, 0, 0, 0];

   // Greedily calculate the number of each coin denomination to return, starting from the largest
   while (500 <= changeDue) { returnedCoins[3]++; changeDue -= 500; } // Count 500-yen coins
   while (100 <= changeDue) { returnedCoins[2]++; changeDue -= 100; } // Count 100-yen coins
   while (50 <= changeDue) { returnedCoins[1]++; changeDue -= 50; }   // Count 50-yen coins
   while (10 <= changeDue) { returnedCoins[0]++; changeDue -= 10; }   // Count 10-yen coins

   // Define the actual values of the coin denominations for output purposes
   var coinDenominations = [10, 50, 100, 500];

   // Iterate through the initial coins provided by the customer
   initialCoins.forEach(function(initialCount, denominationIndex) {
      // If the customer provided more of a certain coin than what needs to be returned
      if (initialCount > returnedCoins[denominationIndex]) {
         // Append the denomination and the difference (coins not returned) to the result buffer
         resultBuffer += coinDenominations[denominationIndex] + " " + (initialCount - returnedCoins[denominationIndex]) + "\n";
      }
   });

   // Add an extra newline character to separate the output of different test cases
   resultBuffer += "\n";
}

// Print the final accumulated result to the console, trimming any trailing whitespace
console.log(resultBuffer.trim());
