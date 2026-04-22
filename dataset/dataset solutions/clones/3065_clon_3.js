// Primary function to process incoming order data for calculation
function processOrderData(rawData) {
    // A robust check for the input type and content.
    // While the original code assumes valid string input, this adds a guard.
    if (typeof rawData !== 'string' || rawData.trim().length === 0) {
        // In a real application, one might throw an error, log, or return a default.
        // For this clone, we'll proceed, but the check demonstrates a structural addition.
        // console.error("Input data is invalid or empty.");
        // return 0;
    }

    // Split the raw multi-line string into individual line segments.
    // The filter operation is a new fragment, removing any blank lines that might occur.
    const lineSegments = rawData.split("\n").filter(segment => segment.trim() !== '');

    // Declare an array to hold the parsed numerical values.
    const numericValues = [];
    // Iterate through each segment to parse it into an integer.
    // This uses a traditional loop instead of map, which is a structural change.
    for (let segmentIndex = 0; segmentIndex < lineSegments.length; segmentIndex++) {
        const currentSegment = lineSegments[segmentIndex];
        const parsedValue = parseInt(currentSegment, 10);

        // Add a validation step: if parsing fails, push 0 instead of NaN.
        // This is an error handling addition and a structural change.
        if (isNaN(parsedValue)) {
            numericValues.push(0);
        } else {
            numericValues.push(parsedValue);
        }
    }

    // Critical validation: The original problem implicitly assumes 5 items.
    // This guard clause explicitly enforces that expectation.
    const REQUIRED_ITEM_QUANTITY = 5;
    if (numericValues.length !== REQUIRED_ITEM_QUANTITY) {
        // If there are fewer items, pad with zeros.
        while (numericValues.length < REQUIRED_ITEM_QUANTITY) {
            numericValues.push(0);
        }
        // If there are more items, truncate the array.
        if (numericValues.length > REQUIRED_ITEM_QUANTITY) {
            numericValues.splice(REQUIRED_ITEM_QUANTITY);
        }
    }

    // Initialize variables to track the item that will NOT be rounded up.
    // 'designatedItemPosition' is the index, initialized to -1 (not found yet).
    let designatedItemPosition = -1;
    // 'minimumNonZeroLastDigit' tracks the smallest last digit found, initialized high.
    let minimumNonZeroLastDigit = 10; // Any single digit will be less than 10.

    // Loop through the numerical values to identify the 'special' item.
    // This loop finds the item with the smallest non-zero last digit.
    for (let currentPosition = 0; currentPosition < numericValues.length; currentPosition++) {
        const itemValue = numericValues[currentPosition];
        const lastDigit = itemValue % 10; // Calculate the last digit.

        // Only consider non-zero last digits for the minimum search.
        if (lastDigit !== 0) {
            // If this last digit is smaller than our current minimum, update.
            if (lastDigit < minimumNonZeroLastDigit) {
                minimumNonZeroLastDigit = lastDigit;
                designatedItemPosition = currentPosition;
            }
        }
    }

    // Structural update: If no item had a non-zero last digit (e.g., all end in 0),
    // the original logic implicitly picked the first item. We make this explicit.
    if (designatedItemPosition === -1) {
        designatedItemPosition = 0; // Default to the first item if all end in 0.
    }

    // Initialize the final sum accumulator.
    let finalAggregateSum = 0;

    // New helper function: This is a structural addition, encapsulating the rounding logic.
    const calculateRoundedUpValue = (val) => {
        // If the value already ends in 0, no rounding is needed.
        if (val % 10 === 0) {
            return val;
        }
        // Otherwise, round up to the nearest multiple of 10.
        return Math.ceil(val / 10) * 10;
    };

    // Second loop to compute the final aggregate sum based on the identified special item.
    for (let currentPosition = 0; currentPosition < numericValues.length; currentPosition++) {
        const currentItemValue = numericValues[currentPosition];
        let valueToContribute; // Intermediate variable for clarity (structural addition).

        // Check if the current item is the designated one.
        if (currentPosition === designatedItemPosition) {
            // If it's the special item, add its original value.
            valueToContribute = currentItemValue;
        } else {
            // Otherwise, round the item's value up using the helper function.
            valueToContribute = calculateRoundedUpValue(currentItemValue);
        }
        // Accumulate to the total sum.
        finalAggregateSum += valueToContribute;
    }

    // Output the computed final sum to the console.
    console.log(finalAggregateSum);
}

// --- Execution Entry Point ---
// Using more descriptive variable names for modules and functions.
const fileSystemUtility = require("fs");
// Read the entire content from standard input synchronously, decoded as UTF-8.
const standardInputContent = fileSystemUtility.readFileSync("/dev/stdin", "utf8");
// Invoke the main processing function with the obtained input.
processOrderData(standardInputContent);