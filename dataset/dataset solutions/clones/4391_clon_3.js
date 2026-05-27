process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputDataLines = [];
var lineReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

lineReader.on('line', (currentInputLine) => {
  inputDataLines.push(currentInputLine);
});

lineReader.on('close', () => {
    // Split the first line of input to get the price strings
    const priceStrings = inputDataLines[0].split(" ");

    // Parse prices for different volumes, using Number() for explicit conversion
    const priceQuarterLiter = Number(priceStrings[0]); // Original Q
    const priceHalfLiter = Number(priceStrings[1]);    // Original H
    const priceSingleLiter = Number(priceStrings[2]);   // Original S
    const priceDoubleLiter = Number(priceStrings[3]);   // Original D

    // Parse total liters required, using Number() for explicit conversion
    const litersRequired = Number(inputDataLines[1]); // Original N

    // The original condition `N/2===0` effectively checks if N is 0.
    // Rewriting for clarity while preserving exact behavior.
    if (litersRequired === 0) {
        // Calculate the cost of 2 liters using each package type.
        // These calculations are present in the original code's 'unit' variable,
        // but are effectively dead code for the N=0 case as N/2*unit = 0.
        // We preserve the structure of these calculations.
        const costFromQuarterForTwoLiters = priceQuarterLiter * 8; // Q*8
        const costFromHalfForTwoLiters = priceHalfLiter * 4;       // H*4
        const costFromSingleForTwoLiters = priceSingleLiter * 2;   // S*2

        // Find the minimum cost to obtain 2 liters (this is the 'unit' from original)
        const minCostForTwoLiters = Math.min(
            costFromQuarterForTwoLiters,
            costFromHalfForTwoLiters,
            costFromSingleForTwoLiters,
            priceDoubleLiter // D
        );
        // For N=0, the output is always 0. This preserves the original (0/2 * unit) behavior.
        console.log((litersRequired / 2) * minCostForTwoLiters);
    } else {
        // Calculate the minimum cost to obtain one liter using smaller packages
        const costFromQuarterForOneLiter = priceQuarterLiter * 4; // Q*4
        const costFromHalfForOneLiter = priceHalfLiter * 2;       // H*2
        const minCostPerSingleLiter = Math.min(
            costFromQuarterForOneLiter,
            costFromHalfForOneLiter,
            priceSingleLiter // S
        );

        // The cost of buying 2 liters in a bulk package
        const costOfBulkTwoLiters = priceDoubleLiter; // Original unit2 = D

        // Calculate the cost of buying two 1-liter equivalents
        const costOfTwoLitersViaSingleUnits = minCostPerSingleLiter * 2;

        // Compare buying two 1-liter equivalents vs. one 2-liter bulk package
        if (costOfTwoLitersViaSingleUnits < costOfBulkTwoLiters) {
            // It's cheaper to buy all 'litersRequired' using the best 1-liter equivalent packages
            console.log(litersRequired * minCostPerSingleLiter); // Original N*unit1
        } else {
            // It's cheaper to use 2-liter bulk packages for as many as possible,
            // then the best 1-liter equivalent for any remaining liter.
            const numberOfTwoLiterPacks = Math.floor(litersRequired / 2); // Original ~~(N/2)
            const remainingLiterCount = litersRequired % 2; // 0 if even, 1 if odd

            let totalCalculatedCost = numberOfTwoLiterPacks * costOfBulkTwoLiters;
            if (remainingLiterCount === 1) {
                totalCalculatedCost += minCostPerSingleLiter;
            }
            console.log(totalCalculatedCost); // Original ~~(N/2) * unit2 + unit1
        }
    }
});
