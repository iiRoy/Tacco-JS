process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputDataRows = [];

const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputProcessor.on('line', (currentLineText) => {
  inputDataRows.push(currentLineText);
});

inputProcessor.on('close', () => {
    // Extract price values for different quantities from the first input line
    const [quarterLiterPrice, halfLiterPrice, singleLiterPrice, doubleLiterPrice] = inputDataRows[0].split(" ").map(valueStr => BigInt(valueStr));
    // Get the target total volume from the second input line
    const targetVolume = BigInt(inputDataRows[1]);

    // Determine the most cost-effective way to purchase the target volume
    if (targetVolume % 2n === 0n) {
        // If the target volume is an even number of liters
        // Calculate the minimum cost to acquire 2 liters using various options
        const effectiveUnitCost = findMinimum(
            quarterLiterPrice * 8n, // Cost for 8 * 0.25L = 2L
            halfLiterPrice * 4n,    // Cost for 4 * 0.5L = 2L
            singleLiterPrice * 2n,  // Cost for 2 * 1L = 2L
            doubleLiterPrice        // Cost for 1 * 2L = 2L
        );
        // The total cost is (target volume / 2) * effective cost per 2 liters
        outputResult(targetVolume / 2n * effectiveUnitCost);
    } else {
        // If the target volume is an odd number of liters
        // Calculate the minimum cost to acquire 1 liter using various options
        const costPerLiter = findMinimum(
            quarterLiterPrice * 4n, // Cost for 4 * 0.25L = 1L
            halfLiterPrice * 2n,    // Cost for 2 * 0.5L = 1L
            singleLiterPrice        // Cost for 1 * 1L = 1L
        );
        // The direct cost of a 2-liter bottle
        const costForTwoLiters = doubleLiterPrice;

        // Compare buying two 1-liter equivalents versus one 2-liter bottle
        if (costPerLiter * 2n < costForTwoLiters) {
            // If buying two 1-liter equivalents is cheaper than a 2-liter bottle
            // The total cost is simply target volume * best 1-liter price
            outputResult(targetVolume * costPerLiter);
        } else {
            // If a 2-liter bottle is cheaper or equal to two 1-liter equivalents
            // Buy (target volume - 1) / 2 units of 2-liter bottles, plus one 1-liter equivalent
            outputResult((targetVolume - 1n) / 2n * costForTwoLiters + costPerLiter);
        }
    }
});

// Utility function to determine the smallest value among its arguments
const findMinimum = (...valuesToCompare) => {
    return valuesToCompare.reduce((accumulator, currentValue) => accumulator < currentValue ? accumulator : currentValue, valuesToCompare[0]);
};

// Utility function to print the final calculated value to the console
const outputResult = (finalValue) => {
    console.log(finalValue.toString());
};
