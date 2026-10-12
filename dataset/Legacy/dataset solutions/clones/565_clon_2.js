process.stdin.resume();
process.stdin.setEncoding('utf8'); // Set the input encoding to UTF-8


process.stdin.on('data', function (inputDataBlock) {
    // Process the incoming data chunk
    let inputLines = inputDataBlock
        .toString() // Convert the buffer to a string
        .split("\n") // Split the string by newline characters
        .filter(lineContent => lineContent !== ""); // Remove any empty lines

    // Iterate through each processed input line
    for (let idx = 0; idx < inputLines.length; idx++) {
        // Calculate the amount of change needed from 1000
        const remainingAmount = 1000 - inputLines[idx];

        // Calculate potential number of 500-yen coins and the remainder
        const numFiveHundredCoins = remainingAmount / 500;
        const remainderAfterFiveHundred = remainingAmount % 500;

        // Calculate potential number of 100-yen coins and the remainder
        const numHundredCoins = remainderAfterFiveHundred / 100;
        const remainderAfterHundred = remainderAfterFiveHundred % 100;

        // Calculate potential number of 50-yen coins and the remainder
        const numFiftyCoins = remainderAfterHundred / 50;
        const remainderAfterFifty = remainderAfterHundred % 50;

        // Calculate potential number of 10-yen coins and the remainder
        const numTenCoins = remainderAfterFifty / 10;
        const remainderAfterTen = remainderAfterFifty % 10;

        // Calculate potential number of 5-yen coins and the remainder
        const numFiveCoins = remainderAfterTen / 5;
        const remainderAfterFive = remainderAfterTen % 5;

        // Get the floor values for each coin denomination
        const count500 = Math.floor(numFiveHundredCoins);
        const count100 = Math.floor(numHundredCoins);
        const count10 = Math.floor(numTenCoins);
        const count5 = Math.floor(numFiveCoins);
        const count50 = Math.floor(numFiftyCoins);
        const count1 = Math.floor(remainderAfterFive); // The remainder after 5-yen coins is the 1-yen coins

        // Only output if the input is not "0"
        if (inputLines[idx] !== "0") {
            // Sum up all the coin counts and print to console
            console.log(count500 + count100 + count10 + count5 + count50 + count1);
        } else {
            // Do nothing if the input is "0"
            false;
        }
    }
});
