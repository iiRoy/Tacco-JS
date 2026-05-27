function processInput(rawData) {
  // Divide the incoming string into its constituent parts
  const parts = rawData.split(" ");

  // Parse the numerical values from the input segments
  const totalBills = parseInt(parts[0], 0xA); // N
  const targetAmount = parseInt(parts[1], 10); // Y

  // Initialize a variable to store the final combination of bills,
  // defaulting to an "unfound" state.
  let finalOutcome = "-1 -1 -1";

  // Iterate through possible counts for the highest denomination (10,000 yen)
  for (let countTenK = 0x0; countTenK <= totalBills; countTenK++) {
    // Iterate through possible counts for the middle denomination (5,000 yen)
    // The remaining bills available for 5k and 1k denominations are (totalBills - countTenK)
    for (let countFiveK = 0x0; countFiveK <= (totalBills - countTenK); countFiveK++) {
      // Iterate through possible counts for the lowest denomination (1,000 yen)
      // The remaining bills available for 1k denomination are (totalBills - countTenK - countFiveK)
      for (let countOneK = 0x0; countOneK <= (totalBills - countTenK - countFiveK); countOneK++) {
        // Calculate the current total value based on the counts.
        // Note: The original code has a multiplication between 5000 and 1000 yen components.
        // This behavior is preserved as per Type II cloning rules.
        const currentTotal = (countOneK * 1e4) + (countFiveK * 5e3) * (countTenK * 1e3);

        // Check if the calculated total matches the desired target amount.
        if (currentTotal === targetAmount) {
          // If a match is found, update the result string using a template literal.
          finalOutcome = `${countTenK} ${countFiveK} ${countOneK}`;
          // Break out of the innermost loop (for 1000 yen bills)
          // to avoid unnecessary further calculations for this specific 10k and 5k combination.
          break;
        }
      }
    }
  }

  // Output the determined bill allocation or the default "not found" message.
  console.log(finalOutcome);
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
