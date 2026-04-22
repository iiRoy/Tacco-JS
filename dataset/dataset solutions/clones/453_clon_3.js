// This script processes financial scenarios provided via standard input.
// It calculates the month in which an initial debt is settled over a 12-month period.

// Configure the standard input stream to accept data.
process.stdin.resume();
// Set the character encoding for the incoming data.
process.stdin.setEncoding('utf8');

// A buffer to accumulate all incoming data chunks from standard input.
let accumulatedInputDataBuffer = '';

// Event listener: Appends each received data chunk to the buffer.
process.stdin.on('data', (incomingDataSegment) => {
  accumulatedInputDataBuffer += incomingDataSegment;
});

// Event listener: Triggered when all standard input data has been received.
process.stdin.on('end', () => {
  // Split the accumulated data into an array of individual lines.
  const allInputLines = accumulatedInputDataBuffer.split('\n');
  // Initialize a pointer to keep track of the current line being processed.
  let currentLineCursor = 0;

  // Outer loop: Processes multiple financial scenarios until a termination condition is met.
  while (true) {
    // Extract the raw string for the initial debt from the current line.
    const rawInitialDebtString = allInputLines[currentLineCursor++];
    // Convert the raw string into a numeric value for the initial debt.
    const scenarioInitialDebt = Number(rawInitialDebtString);

    // Basic validation: Check if the parsed debt amount is a valid number.
    if (isNaN(scenarioInitialDebt)) {
      // If not a number, log a warning and skip to the next scenario (if any).
      // This is an added robustness feature (Type III addition).
      console.error(`Warning: Invalid initial debt value detected: "${rawInitialDebtString}". Skipping this scenario.`);
      // If there are no more lines, we might break here, but for now, assume `0` will eventually terminate.
      if (currentLineCursor >= allInputLines.length) break; // Added safety break
      continue; // Move to the next line/scenario
    }

    // Termination condition: A debt of 0 signals the end of input scenarios.
    if (scenarioInitialDebt === 0) {
      break; // Exit the main processing loop.
    }

    // Initialize the current outstanding balance for the scenario.
    let outstandingBalance = scenarioInitialDebt;
    // Variable to store the 1-indexed month when the balance is settled.
    let earliestSettlementMonth = 'NA';
    // A flag to ensure that `earliestSettlementMonth` is recorded only once.
    let hasBalanceBeenSettled = false;

    // Inner loop: Processes 12 monthly transactions for the current financial scenario.
    for (let monthCycleIndex = 0; monthCycleIndex < 12; monthCycleIndex++) {
      // Retrieve the raw monthly transaction data.
      const rawMonthlyTransactionLine = allInputLines[currentLineCursor++];
      // Split the line into its two component values (e.g., payment and deduction).
      const transactionComponents = rawMonthlyTransactionLine.split(' ');

      // Enhanced validation for transaction data (Type III addition).
      if (transactionComponents.length < 2) {
        console.error(`Error: Malformed transaction data on line ${currentLineCursor - 1}. Expected 2 values, got ${transactionComponents.length}. Defaulting to zeros.`);
        // Pad with '0' if components are missing to prevent errors.
        transactionComponents[0] = transactionComponents[0] || '0';
        transactionComponents[1] = transactionComponents[1] || '0';
      }

      // Parse the individual transaction amounts.
      const incomingPayment = Number(transactionComponents[0]);
      const outgoingDeduction = Number(transactionComponents[1]);

      // Check for non-numeric transaction values (Type III addition).
      if (isNaN(incomingPayment) || isNaN(outgoingDeduction)) {
        console.error(`Warning: Non-numeric values in monthly transaction on line ${currentLineCursor - 1}. Using 0 for calculations.`);
        // Apply only valid parts or default to 0 for calculations.
        outstandingBalance -= (isNaN(incomingPayment) ? 0 : incomingPayment) - (isNaN(outgoingDeduction) ? 0 : outgoingDeduction);
      } else {
        // Calculate the net effect of the month's transactions on the balance.
        const netMonthlyAdjustment = incomingPayment - outgoingDeduction;
        // Update the outstanding balance.
        outstandingBalance -= netMonthlyAdjustment;
      }

      // Check if the balance has become zero or less for the first time.
      if (!hasBalanceBeenSettled && outstandingBalance <= 0) {
        // Record the 1-indexed month (monthCycleIndex is 0-indexed).
        earliestSettlementMonth = monthCycleIndex + 1;
        // Set the flag to prevent further updates to `earliestSettlementMonth`.
        hasBalanceBeenSettled = true;
      }
    }

    // Output the result for the current financial scenario.
    console.log(earliestSettlementMonth);
  }
});