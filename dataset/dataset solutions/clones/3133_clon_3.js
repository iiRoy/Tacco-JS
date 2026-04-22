function calculateMinimumAcquisitionCost(rawDataInput) {
    // This function determines the lowest total price to acquire a specified number of items
    // from a list of available offers, each with a unit price and quantity.

    let totalAccumulatedCost = 0.0; // Stores the running total cost (renamed from 'ans')
    let currentOfferPointer = 0;   // Index to track the currently considered offer (renamed from 'i')
    let acquiredItemCount = 0;     // Counter for the total number of items acquired (renamed from 'j')

    // --- Input Parsing and Initialization ---
    // Split the raw input string into individual lines.
    const allInputLines = rawDataInput.split("\n");

    // Parse the first line to get the number of distinct offers and the total items required.
    const initialConfiguration = allInputLines[0].split(" ");

    // Type III: Add validation for critical initial parameters.
    if (initialConfiguration.length < 2) {
        console.error("Error: Initial configuration line is incomplete. Expected two numbers.");
        return; // Exit if input is malformed.
    }

    const distinctOffersCount = parseInt(initialConfiguration[0], 10); // Renamed from arg[0]
    const requiredItemQuantity = parseInt(initialConfiguration[1], 10); // Renamed from arg[1]

    // Type III: Validate parsed numerical parameters.
    if (isNaN(distinctOffersCount) || isNaN(requiredItemQuantity) || distinctOffersCount < 0 || requiredItemQuantity < 0) {
        console.error("Error: Invalid numerical values in the initial configuration.");
        return;
    }

    // --- Offer Data Loading ---
    // Prepare an array to store details of each offer. (Renamed from 'A')
    const listOfAvailableOffers = [];

    // Loop through the input lines to populate the offer list.
    for (let offerIterator = 0; offerIterator < distinctOffersCount; offerIterator++) { // Renamed loop var, used 'let'
        // Type III: Add validation for sufficient input lines for offers.
        if (offerIterator + 1 >= allInputLines.length) {
            console.error(`Error: Missing data for offer number ${offerIterator + 1}.`);
            return;
        }

        const offerSpecifics = allInputLines[offerIterator + 1].split(" "); // Get details for the current offer

        // Type III: Add validation for offer specifics structure.
        if (offerSpecifics.length < 2) {
            console.error(`Error: Offer data on line ${offerIterator + 2} is incomplete.`);
            return;
        }

        // Parse price and quantity, ensuring they are numbers.
        const unitPrice = parseFloat(offerSpecifics[0]);
        const availableStock = parseInt(offerSpecifics[1], 10);

        // Type III: Validate parsed offer values.
        if (isNaN(unitPrice) || isNaN(availableStock) || unitPrice < 0 || availableStock < 0) {
            console.error(`Error: Invalid numerical values for offer on line ${offerIterator + 2}.`);
            return;
        }

        listOfAvailableOffers.push([unitPrice, availableStock]); // Add offer details to the list
    }

    // --- Offer Sorting ---
    // Sort the offers in ascending order based on their unit price.
    // Type II: Use arrow function for conciseness and clarity.
    listOfAvailableOffers.sort((firstOffer, secondOffer) => firstOffer[0] - secondOffer[0]);

    // --- Item Acquisition Logic ---
    // Continue acquiring items until the required quantity is met.
    while (acquiredItemCount < requiredItemQuantity) {
        // Type III: Guard clause to prevent accessing out-of-bounds offers.
        // This handles cases where total available items are less than required.
        if (currentOfferPointer >= listOfAvailableOffers.length) {
            console.warn("Warning: Not enough items available across all offers to meet the required quantity.");
            break; // Stop processing if no more offers are available.
        }

        // Type III: Introduce helper variables for current offer's attributes for improved readability.
        const activeOffer = listOfAvailableOffers[currentOfferPointer];
        const currentOfferUnitPrice = activeOffer[0];
        let currentOfferRemainingQuantity = activeOffer[1]; // Quantity is mutable

        // Type III: Explicitly ensure quantity is an integer before arithmetic operations.
        // This handles potential type inconsistencies if not parsed correctly earlier or if modified externally.
        currentOfferRemainingQuantity = parseInt(currentOfferRemainingQuantity, 10);
        if (isNaN(currentOfferRemainingQuantity)) {
            console.error(`Critical Error: Non-numeric quantity found for offer at index ${currentOfferPointer}.`);
            break;
        }

        // Add the price of one item from the current cheapest offer to the total cost.
        totalAccumulatedCost += currentOfferUnitPrice;

        // Decrement the available quantity of the current offer.
        currentOfferRemainingQuantity--;
        activeOffer[1] = currentOfferRemainingQuantity; // Update the array element

        // Increment the count of items acquired.
        acquiredItemCount++;

        // If the current offer has been fully utilized (quantity depleted),
        // move to the next cheapest offer.
        if (currentOfferRemainingQuantity <= 0) {
            currentOfferPointer++;
        }
    }

    // Output the final calculated total cost.
    console.log(totalAccumulatedCost);
}

// Entry point: Read input from standard input and pass it to the processing function.
// Type II: Renamed 'main' to 'calculateMinimumAcquisitionCost' for better description.
calculateMinimumAcquisitionCost(require('fs').readFileSync('/dev/stdin', 'utf8'));