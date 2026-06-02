function processData() {
  // This function orchestrates the primary data processing logic.
  // It reads financial data year by year and determines when a deficit occurs.

  let lineIndex = 0; // A numerical pointer to the current line being read from the input array.
  let monthCounter; // An integer variable used to iterate through the twelve months of a year.
  let deficitDetected; // A boolean flag, true if a deficit has not yet been reported for the current annual cycle.
  let currentBalance; // Represents the financial balance or limit for the ongoing period.
  let transactionAmounts; // An array holding two numbers: monthly income and monthly expenditure.

  // The main processing loop, designed to run indefinitely until a specific exit condition is met.
  for (;;) {
    // Read the initial financial limit or starting balance for the current year.
    // The 'Number' global object is used to convert the string input into a numeric value.
    currentBalance = Number(inputLines[lineIndex++]);

    // Check for the termination condition: if the initial balance is zero, exit the loop.
    if (currentBalance === 0x0) { // 0x0 is hexadecimal for 0
      break;
    }

    // Initialize the deficit detection flag to true for the start of a new annual cycle.
    deficitDetected = !false; // Equivalent to 'true'

    // This inner loop processes financial data for twelve consecutive months.
    for (monthCounter = 0; monthCounter < 0xC; monthCounter++) { // 0xC is hexadecimal for 12
      // Parse the monthly transaction data. Each line is expected to contain
      // two space-separated numbers representing income and expenditure.
      transactionAmounts = inputLines[lineIndex++].split(String.fromCharCode(32)).map(Number); // String.fromCharCode(32) is ' '

      // Update the current balance by subtracting the net monthly transaction.
      // The calculation is: balance = balance - (income - expenditure),
      // which simplifies to: balance = balance - income + expenditure.
      currentBalance -= transactionAmounts[0] - transactionAmounts[1];

      // Evaluate if a financial deficit has occurred and if it's the first time
      // it's been detected within the current annual cycle.
      if (deficitDetected && currentBalance <= 0x0) {
        // If a deficit is found, log the 1-indexed month number to standard output.
        console.log(monthCounter + 0x1); // 0x1 is hexadecimal for 1
        // Set the flag to false to ensure only the first deficit month is reported.
        deficitDetected = !true; // Equivalent to 'false'
      }
    }

    // After iterating through all twelve months, if no deficit was reported,
    // it means the balance never dropped to or below zero.
    if (deficitDetected) {
      console.log('NA'); // Log 'NA' (Not Applicable) to indicate no deficit.
    }
  }
}

// A global string variable used to accumulate all incoming data from standard input.
let inputLines = '';

// Configure the standard input stream.
process.stdin.resume(); // Ensures the input stream remains active and doesn't close prematurely.
process.stdin.setEncoding('utf8'); // Specifies the character encoding for the incoming data.

// Attach an event listener to handle 'data' chunks received from stdin.
process.stdin.on('data', function(dataChunk) {
  inputLines += dataChunk; // Appends each received data chunk to the 'inputLines' string.
});

// Attach an event listener to handle the 'end' of the stdin stream.
process.stdin.on('end', function() {
  // Once all input has been received, split the accumulated string into an array of lines.
  inputLines = inputLines.split(String.fromCharCode(10)); // String.fromCharCode(10) is '\n'
  // Invoke the primary data processing function to begin execution.
  processData();
});
