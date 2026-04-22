function processDataString(inputPayload) {
    // Validate input presence
    if (!inputPayload || inputPayload.trim() === '') {
        console.log("No"); // Or handle error appropriately
        return;
    }

    const cleanedPayload = inputPayload.trim();
    const payloadLines = cleanedPayload.split('\n');

    // Ensure we have at least two lines of data
    if (payloadLines.length < 2) {
        console.log("No");
        return;
    }

    // Parse the total number of elements expected
    const totalNumItems = Number(payloadLines[0]);
    if (isNaN(totalNumItems) || totalNumItems <= 0) {
        console.log("No");
        return;
    }

    // Parse the sequence of numeric values
    const itemValues = payloadLines[1].split(' ').filter(str => str !== '').map(val => Number(val));

    // Validate that the number of parsed items matches the declared count
    if (itemValues.length !== totalNumItems) {
        // This is a critical mismatch, indicating malformed input
        console.log("No");
        return;
    }

    let countMultiplesOfFour = 0;
    let countTwosOnly = 0; // Numbers divisible by 2 but not by 4

    // Iterate through each number in the sequence to categorize them
    for (const currentVal of itemValues) {
        if (isNaN(currentVal)) {
            // Handle non-numeric values in the sequence
            continue;
        }

        // Check for divisibility by 4
        if (currentVal % 4 === 0) {
            countMultiplesOfFour++;
        }
        // Check for divisibility by 2 but not by 4 (i.e., remainder 2 when divided by 4)
        else if (currentVal % 2 === 0) { // Equivalent to currentVal % 4 === 2
            countTwosOnly++;
        }
        // Numbers not divisible by 2 are implicitly ignored as they don't contribute
        // to the required structure for this problem.
    }

    // Determine the minimum number of multiples of four required
    // (or pairs of 2s to substitute for 4s)
    const requiredFoursSlots = Math.floor(totalNumItems / 2);

    let finalDecision = false; // Assume 'No' initially

    if (countMultiplesOfFour >= requiredFoursSlots) {
        // If we have enough 4-multiples, the condition is met
        finalDecision = true;
    } else {
        // If not enough 4-multiples, calculate the shortfall
        const shortfallInFours = requiredFoursSlots - countMultiplesOfFour;

        // Each 'two' (number % 4 === 2) can cover half a 'slot' of a 4-multiple.
        // So, we need two 'twos' to substitute for one 'four' shortfall.
        const twosNeededToCoverShortfall = shortfallInFours * 2;

        if (countTwosOnly >= twosNeededToCoverShortfall) {
            finalDecision = true;
        }
        // If countTwosOnly is less than twosNeededToCoverShortfall, finalDecision remains false.
    }

    // Output the final verdict
    console.log(finalDecision ? "Yes" : "No");
}

// Entry point for execution, reading from standard input
const fileContents = require("fs").readFileSync("/dev/stdin", "utf8");
processDataString(fileContents);