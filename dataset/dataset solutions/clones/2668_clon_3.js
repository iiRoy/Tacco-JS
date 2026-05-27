function Main(inputStringData) {
    // Helper function to parse an item string into its components.
    // This encapsulates the string splitting and number conversion logic.
    const extractItemDetails = (itemLine) => {
        const parts = itemLine.split(' ');
        // Assuming the format is "leadTime value"
        return {
            leadTime: Number(parts[0]),
            value: Number(parts[1])
        };
    };

    let allInputLines = inputStringData.split('\n');

    // Parse the first line to get N (total items) and M (total processing days).
    const initialConfigLineParts = allInputLines[0].split(' ');
    const totalInitialItemsCount = Number(initialConfigLineParts[0]); // Corresponds to 'n'
    const totalProcessingDaysCount = Number(initialConfigLineParts[1]); // Corresponds to 'm'

    // Remove the configuration line, leaving only the item data lines.
    allInputLines.shift();

    // This array will hold the item strings that are still available for selection.
    // It is dynamically updated in each iteration, reflecting the original logic.
    let currentlyAvailableItemStrings = allInputLines;
    let accumulatedTotalValue = 0; // Corresponds to 'sum'

    // Iterate through each processing day, from day 0 up to M-1.
    for (let currentDayIndex = 0; currentDayIndex < totalProcessingDaysCount; currentDayIndex++) {
        // Calculate the number of days remaining for processing, including the current day.
        const daysRemainingForSelection = totalProcessingDaysCount - currentDayIndex;
        let itemsEligibleForCurrentDay = []; // Corresponds to 'tempArray'

        // First pass: Filter currently available items based on their lead time.
        // Only items whose lead time is less than or equal to the remaining days are eligible.
        for (let i = 0; i < currentlyAvailableItemStrings.length; i++) {
            const itemEntry = currentlyAvailableItemStrings[i];
            const details = extractItemDetails(itemEntry); // Use the helper function
            if (details.leadTime <= daysRemainingForSelection) {
                itemsEligibleForCurrentDay.push(itemEntry);
            }
        }

        let highestValueFoundThisDay = 0; // Corresponds to 'max'
        let indexOfHighestValueInEligible = -1; // Corresponds to 'maxIndex', index within itemsEligibleForCurrentDay

        // Second pass: Find the item with the highest value among the eligible ones.
        for (let j = 0; j < itemsEligibleForCurrentDay.length; j++) {
            const eligibleItemEntry = itemsEligibleForCurrentDay[j];
            const eligibleItemDetails = extractItemDetails(eligibleItemEntry); // Use the helper function
            if (eligibleItemDetails.value > highestValueFoundThisDay) {
                highestValueFoundThisDay = eligibleItemDetails.value;
                indexOfHighestValueInEligible = j;
            }
        }

        // Add the value of the selected (highest value) item to the running total.
        accumulatedTotalValue += highestValueFoundThisDay;

        // Remove the selected item from the list of eligible items.
        // This modification is crucial as itemsEligibleForCurrentDay will become
        // the new currentlyAvailableItemStrings for the next iteration.
        if (indexOfHighestValueInEligible !== -1) {
            itemsEligibleForCurrentDay.splice(indexOfHighestValueInEligible, 1);
        }
        
        // Update the list of available items for the next day's processing.
        // This mimics the original 'input = tempArray;' behavior.
        currentlyAvailableItemStrings = itemsEligibleForCurrentDay;
    }

    // Output the final accumulated sum.
    console.log(accumulatedTotalValue);
}

// Standard input reading for competitive programming environments.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
