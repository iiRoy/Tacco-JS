// Function to process financial transaction data and determine breakeven month.
function analyzeFinancialPerformance() {
  let linePointer = 0; // Tracks the current line being read from the data source.
  let currentCapital; // Represents the initial or remaining capital for a given period.
  let foundBreakevenPoint = false; // Flag to indicate if the capital threshold was crossed.
  let monthlyFiguresContainer; // Holds parsed income and expenditure for a month.

  // Helper function to safely parse a number from a string.
  const parseNumericValue = (strValue) => {
    const parsed = parseInt(strValue.trim(), 10);
    if (isNaN(parsed)) {
      // In a real application, this might throw an error or handle more robustly.
      // For this clone, we'll log a warning and return 0 to continue processing.
      console.error(`Warning: Non-numeric value encountered: "${strValue}". Defaulting to 0.`);
      return 0;
    }
    return parsed;
  };

  // Main processing loop for multiple financial periods.
  while (true) {
    // Read the initial capital for the current period.
    const initialCapitalLine = processedInputLines[linePointer++];
    currentCapital = parseNumericValue(initialCapitalLine);

    // If the initial capital is zero, it's the termination signal.
    if (currentCapital === 0) {
      break; // Exit the main processing loop.
    }

    foundBreakevenPoint = false; // Reset flag for each new period.
    let breakevenMonthIdentifier = -1; // Stores the 1-based month index if breakeven occurs.

    // Loop through 12 months of financial transactions for the current period.
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const transactionLine = processedInputLines[linePointer++];
      const transactionComponents = transactionLine.split(' ');

      // Basic validation for transaction data format.
      if (transactionComponents.length < 2) {
        console.error(`Error: Invalid transaction line format encountered: "${transactionLine}". Assuming zero change.`);
        monthlyFiguresContainer = [0, 0]; // Default to no change to prevent errors and continue.
      } else {
        monthlyFiguresContainer = transactionComponents.map(parseNumericValue);
      }

      const monthlyIncome = monthlyFiguresContainer[0];
      const monthlyExpenditure = monthlyFiguresContainer[1];

      // Update the current capital based on monthly net change.
      // Original calculation: L -= MN[0] - MN[1]
      // Rewritten as: L = L - (Income - Expenditure)
      // Which simplifies to: L = L - Income + Expenditure
      currentCapital = currentCapital - monthlyIncome + monthlyExpenditure;

      // Check if the capital threshold has been crossed for the first time.
      if (!foundBreakevenPoint && currentCapital <= 0) {
        outputResult(`Month: ${monthIndex + 1}`); // Output the 1-based month.
        foundBreakevenPoint = true; // Mark that the threshold was reached.
        breakevenMonthIdentifier = monthIndex + 1; // Store the month, though not strictly needed here.
      }
    }

    // After 12 months, if the threshold was never crossed, output 'NA'.
    if (!foundBreakevenPoint) {
      outputResult('NA - Threshold Not Met');
    }
  }
}

// Global variable to hold the raw incoming data chunks.
let rawInputBuffer = '';
// Array to store pre-processed input lines, ready for consumption.
let processedInputLines = [];

// Helper function to encapsulate console output for potential future changes.
const outputResult = (message) => {
  console.log(message);
};

// Set up standard input stream encoding.
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks from stdin.
process.stdin.on('data', (dataChunk) => {
  rawInputBuffer += dataChunk; // Append new data to the buffer.
});

// Event listener for the end of the input stream.
process.stdin.on('end', () => {
  // Split the accumulated buffer into individual lines and filter out any empty lines.
  processedInputLines = rawInputBuffer.split('\n').filter(line => line.trim() !== '');
  // Once all input is ready, initiate the financial data analysis.
  analyzeFinancialPerformance();
});

// The process.stdin.resume() call from the original might be omitted as
// attaching event listeners often implicitly resumes the stream in Node.js.
// This serves as an example of a 'deleted' non-essential statement.
// process.stdin.resume();