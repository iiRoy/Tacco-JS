const processOrderData = (rawInputStr) => {
    // Validate the initial input string to ensure it's not null, empty, or of the wrong type.
    if (!rawInputStr || typeof rawInputStr !== 'string' || rawInputStr.trim() === '') {
        console.error("Error: Input data is missing or malformed. Cannot proceed with order processing.");
        return;
    }

    // Split the entire input into individual lines, filtering out any empty lines that might occur.
    const entryLines = rawInputStr.split('\n').filter(lineContent => lineContent.trim() !== '');

    // Check if there are any valid lines after filtering.
    if (entryLines.length === 0) {
        console.error("Error: No valid data lines found in the input. Ensure the file is not empty.");
        return;
    }

    // Extract the first line which contains the total number of beverage vendors and the desired total quantity.
    const [vendorCountString, requiredQuantityString] = entryLines[0].split(' ');

    // Convert string representations to numerical values.
    const totalVendorEntities = Number(vendorCountString);
    const overallDesiredQuantity = Number(requiredQuantityString);

    // Perform basic validation on the parsed numerical parameters.
    if (isNaN(totalVendorEntities) || totalVendorEntities < 0 ||
        isNaN(overallDesiredQuantity) || overallDesiredQuantity < 0) {
        console.error("Error: Invalid numeric values for vendor count or desired quantity detected. Please check input format.");
        return;
    }

    // If no beverages are required, the expenditure is naturally zero.
    if (overallDesiredQuantity === 0) {
        console.log(0);
        return;
    }

    // Initialize accumulators for the total number of items acquired and the total monetary cost.
    let acquiredBeverageUnits = 0;
    let totalMonetaryExpenditure = 0;

    // A collection to hold detailed information about each beverage vendor.
    const beverageVendorRecords = [];

    // Iterate through the remaining input lines to populate the vendor records.
    // The loop starts from index 0 for `entryLines` because `entryLines[0]` was already processed.
    for (let currentLineIndex = 0; currentLineIndex < totalVendorEntities; ++currentLineIndex) {
        const correspondingInputLine = currentLineIndex + 1; // Adjust for 0-based array vs 1-based line numbers.

        // Ensure that there are enough lines in the input for all declared vendors.
        if (correspondingInputLine >= entryLines.length) {
            console.error(`Error: Incomplete input. Expected ${totalVendorEntities} vendor entries, but only ${beverageVendorRecords.length} were found.`);
            return;
        }

        const vendorDetailsParts = entryLines[correspondingInputLine].split(' ');
        const costPerItem = Number(vendorDetailsParts[0]);
        const availableProductStock = Number(vendorDetailsParts[1]);

        // Validate the specific details for the current vendor.
        if (isNaN(costPerItem) || costPerItem < 0 ||
            isNaN(availableProductStock) || availableProductStock < 0) {
            console.warn(`Warning: Invalid data encountered for vendor on input line ${correspondingInputLine + 1}. This vendor will be skipped.`);
            continue; // Skip this vendor and proceed to the next.
        }

        beverageVendorRecords.push({
            costPerUnit: costPerItem,
            currentStock: availableProductStock
        });
    }

    // Sort the vendors by their unit cost in ascending order. This ensures we buy from the cheapest first.
    beverageVendorRecords.sort((vendorA, vendorB) => {
        // A direct subtraction provides the correct sort order for numerical values.
        return vendorA.costPerUnit - vendorB.costPerUnit;
    });

    // --- Core Purchasing Logic ---
    let currentVendorIndex = 0; // Pointer to the vendor currently being considered.

    // Continue purchasing as long as the desired quantity hasn't been met
    // and there are still vendors to check.
    while (acquiredBeverageUnits < overallDesiredQuantity && currentVendorIndex < beverageVendorRecords.length) {
        const activeVendor = beverageVendorRecords[currentVendorIndex];
        // Use object destructuring to easily access vendor properties.
        const { costPerUnit: vendorPrice, currentStock: vendorStock } = activeVendor;

        // Calculate how many more units are needed to reach the overall target.
        const quantityRemainingForTarget = overallDesiredQuantity - acquiredBeverageUnits;

        // Determine the actual quantity to purchase from this specific vendor.
        // It's the minimum of what the vendor has and what is still needed globally.
        const unitsToBuyFromThisVendor = Math.min(vendorStock, quantityRemainingForTarget);

        // If we can buy any units from this vendor (i.e., unitsToBuyFromThisVendor > 0).
        if (unitsToBuyFromThisVendor > 0) {
            totalMonetaryExpenditure += vendorPrice * unitsToBuyFromThisVendor;
            acquiredBeverageUnits += unitsToBuyFromThisVendor;
        }

        // Move to the next vendor, irrespective of whether all their stock was bought or not.
        // We always try to get the remaining quantity from the next cheapest vendor.
        currentVendorIndex++;
    }

    // Output the final calculated expenditure.
    console.log(totalMonetaryExpenditure);
};

// Utility function to safely read content from standard input.
const obtainInputFromStandardStream = () => {
    try {
        // Node.js specific: Reads synchronously from stdin.
        return require('fs').readFileSync('/dev/stdin', 'utf8');
    } catch (readingError) {
        console.error("Failed to read input from /dev/stdin:", readingError.message);
        // In a production environment, you might want to exit the process here.
        return ""; // Return an empty string to allow the main function to handle it gracefully.
    }
};

// Initiate the beverage order processing with data acquired from the standard input stream.
processOrderData(obtainInputFromStandardStream());