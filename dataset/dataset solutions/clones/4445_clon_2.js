function ProcessInput(rawData) {
    rawData = rawData.trim();
    let arrayLength = parseInt(rawData.split("\n")[0], 10);
    let numberArray = rawData.split("\n")[1].split(" ").map((elementValue) => Number(elementValue));
    let resultString = "Yes";

    // Counter for numbers perfectly divisible by four.
    let multiplesOfFourCount = 0;
    // Counter for numbers divisible by two but not by four.
    let multiplesOfTwoOnlyCount = 0;

    for (let idx = 0; idx < numberArray.length; idx++) {
        const currentValue = numberArray[idx];
        if (currentValue % 2 === 0 && currentValue % 4 !== 0) {
            multiplesOfTwoOnlyCount++;
        } else if (currentValue % 4 === 0) {
            multiplesOfFourCount++;
        }
    }

    // Logic to determine if the condition holds.
    // Check if the count of numbers divisible by four is sufficient.
    const requiredPairs = Math.floor(arrayLength / 2);
    if (requiredPairs > multiplesOfFourCount) {
        // If not enough fours, calculate the shortage.
        let deficitCount = requiredPairs - multiplesOfFourCount;
        // Two-multiples can substitute for four-multiples at a 2:1 ratio.
        if (deficitCount * 2 > multiplesOfTwoOnlyCount) {
            resultString = "No"; // Insufficient numbers to meet the condition.
        }
    }

    console.log(resultString);
}

ProcessInput(require("node:fs").readFileSync("/dev/stdin", "utf8"));