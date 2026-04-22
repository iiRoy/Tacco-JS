// Ensure the standard input stream remains active for reading.
process.stdin.resume();

// Set the character encoding for incoming data from the standard input stream.
process.stdin.setEncoding('utf8');

// A dynamic array to accumulate each line of text received from stdin.
let capturedInputLines = [];

// Initialize a readline interface for processing input and output streams.
// This allows reading input line by line.
const streamProcessor = require('node:readline').createInterface({
  input: process.stdin,   // The source stream for input.
  output: process.stdout  // The destination stream for output (though not directly used for problem solutions).
});

// Register an event handler to be invoked whenever a new line of input is detected.
streamProcessor.on('line', (currentLineSegment) => {
  // Append the newly read line to our collection of input data.
  capturedInputLines.push(currentLineSegment);
});

// Register an event handler to be executed once the entire input stream has concluded.
streamProcessor.on('close', () => {
    // --- Input Data Parsing and Basic Validation ---

    // Validate that at least two lines of input are available, as expected by the problem.
    if (capturedInputLines.length < 2) {
        console.error("Error: Not enough input lines. Expected at least two lines for costs and volume.");
        return; // Exit if input is incomplete.
    }

    // Parse the first line to extract the four cost parameters.
    // These represent costs for 0.25L, 0.5L, 1L, and 2L respectively.
    const costParametersRaw = capturedInputLines[0].split(" ");
    if (costParametersRaw.length < 4) {
        console.error("Error: First line is malformed. Expected four cost parameters (Q, H, S, D).");
        return;
    }

    const quarterLiterRate = Number.parseInt(costParametersRaw[0], 10); // Cost for 0.25 liter
    const halfLiterRate = Number.parseInt(costParametersRaw[1], 10);    // Cost for 0.50 liter
    const singleLiterRate = Number.parseInt(costParametersRaw[2], 10);  // Cost for 1.00 liter
    const doubleLiterRate = Number.parseInt(costParametersRaw[3], 10);  // Cost for 2.00 liters

    // Parse the second line to get the total volume of liquid required.
    const totalDesiredVolume = Number.parseInt(capturedInputLines[1], 10);

    // --- Business Logic: Calculate Minimum Cost (replicating original code's behavior) ---
    let finalComputedPrice = 0; // Variable to store the ultimate minimum cost.

    // The original code's condition `N/2 === 0` is only true when N is exactly 0
    // for non-negative integer N. We replicate this specific behavior.
    if (totalDesiredVolume === 0) {
        // For a required volume of zero, the cost is naturally zero.
        // The original code calculates an intermediate 'unit' variable even for N=0,
        // which is then multiplied by (0/2), resulting in 0. We mimic this structure.
        const costViaEightQuarters = quarterLiterRate * 8;
        const costViaFourHalves = halfLiterRate * 4;
        const costViaTwoSingles = singleLiterRate * 2;
        const minCostForTwoLitersFromAllSources = Math.min(costViaEightQuarters, costViaFourHalves, costViaTwoSingles, doubleLiterRate);

        finalComputedPrice = (totalDesiredVolume / 2) * minCostForTwoLitersFromAllSources; // Will evaluate to 0.
    } else {
        // This branch is executed for any positive `totalDesiredVolume`.

        // Determine the most cost-effective way to acquire a single liter.
        const priceFromFourQuarters = quarterLiterRate * 4;
        const priceFromTwoHalves = halfLiterRate * 2;
        const optimalOneLiterPrice = Math.min(priceFromFourQuarters, priceFromTwoHalves, singleLiterRate);

        // The direct cost of a 2-liter package.
        const directTwoLiterPackagePrice = doubleLiterRate;

        // Compare the cost of buying two 1-liter units versus one 2-liter package.
        if (optimalOneLiterPrice * 2 < directTwoLiterPackagePrice) {
            // If purchasing two 1-liter units is cheaper than a single 2-liter package,
            // then it's always optimal to buy individual 1-liter units.
            finalComputedPrice = totalDesiredVolume * optimalOneLiterPrice;
        } else {
            // If a 2-liter package is more cost-effective (or equal) than two 1-liter units.
            // This logic path contains a subtle behavior from the original code:
            // For odd `totalDesiredVolume`, it correctly uses `floor(N/2) * D + 1L_cost`.
            // For even `totalDesiredVolume` greater than 0, it *also* applies `+ 1L_cost`,
            // which is an overcharge (a bug in the original problem's provided solution).
            const numberOfDoubleLiterPackages = Math.floor(totalDesiredVolume / 2);
            // The addition of `optimalOneLiterPrice` here serves two purposes:
            // 1. Correctly accounts for the remaining single liter if `totalDesiredVolume` is odd.
            // 2. Replicates the original code's behavior of adding an extra 1L cost even for even `totalDesiredVolume > 0`.
            finalComputedPrice = (numberOfDoubleLiterPackages * directTwoLiterPackagePrice) + optimalOneLiterPrice;
        }
    }

    // Output the final calculated minimum cost to the console.
    console.log(finalComputedPrice);
});