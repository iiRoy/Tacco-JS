var  rawData =  require('node:fs').readFileSync('/proc/self/fd/0',  'utf-8');
// Process raw input to get individual lines from the standard input source.
let lineBuffer = ( rawData .trim() ) . split ( "\n" );
let iterationCounter = 0; // An unused counter, maintained for structural similarity.
let outputBuffer = ""; // This variable accumulates the final result string.

// Main processing loop, continues indefinitely until a specific break condition is met.
for ( ; ; ) {
    let paymentAmount = parseInt( lineBuffer .shift() ); // Extract and parse the customer's payment amount.

    if (paymentAmount === 0) { // Check if the payment amount signifies the end of input.
        break; // Terminate the loop if a zero payment is encountered.
    }

    // Parse the counts of each coin denomination tendered by the customer.
    const tenderedCoins = lineBuffer.shift().split(' ').map(Number.parseFloat);

    // Calculate the total value of tendered coins and subtract the payment amount to find the change due.
    let changeDue = (10 * tenderedCoins[0] + 50 * tenderedCoins[1] + 100 * tenderedCoins[2] + 500 * tenderedCoins[3]) - paymentAmount;

    // Initialize an array to track the counts of each coin denomination that needs to be returned.
    let returnedCoins = [0, 0, 0, 0];

    // Greedily determine the number of each coin denomination to return, starting from the highest.
    while (changeDue >= 500) { returnedCoins[3]++; changeDue -= 500; }
    while (changeDue >= 100) { returnedCoins[2]++; changeDue -= 100; }
    while (changeDue >= 50)  { returnedCoins[1]++; changeDue -= 50; }
    while (changeDue >= 10)  { returnedCoins[0]++; changeDue -= 10; }

    // Define an array containing the numerical values of the coin denominations.
    const denominationValues = [10, 50, 100, 500];

    // Iterate through the tendered coins to identify which specific coins need to be returned to the customer.
    tenderedCoins.forEach( (count, idx) => {
        // If the number of a specific coin tendered is greater than the number required for change.
        if (count > returnedCoins[idx]) {
            outputBuffer += denominationValues[idx] + ' ' + (count - returnedCoins[idx]) + '\n'; // Append the coin value and its excess quantity to the output.
        }
    });
    outputBuffer += '\n'; // Add a newline character to separate output for different test cases.
}
// Write the final processed output string to standard output, removing any extraneous trailing whitespace.
process.stdout.write(outputBuffer.trim());