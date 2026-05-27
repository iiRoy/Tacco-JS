function processInput(rawData) {
    // Split the raw input string into an array of lines
    const lines = rawData.split('\n');

    // Parse the first line to get the number of stores (N) and the maximum drinks to buy (M)
    let firstLineParts = lines[0].split(' ');
    let numStores = parseInt(firstLineParts[0], 10); // Total number of stores
    let maxDrinksToBuy = parseInt(firstLineParts[1], 10); // Maximum drinks allowed to purchase

    // Initialize variables to track the total drinks bought and the total cost
    let totalDrinksBought = 0;
    let totalCost = 0;

    // This object template is declared but not directly used to create instances.
    // It serves as a structural placeholder, similar to the original.
    let storeDetailsTemplate = {
        unitPrice: '',
        stockQuantity: ''
    };

    // Array to hold information about all stores
    let allStoreOfferings = [];

    // Loop through the input lines to populate the store offerings array
    for (let idx = 0; idx < numStores; idx++) {
        // Each subsequent line contains price and available quantity for a store
        let currentStoreData = lines[idx + 1].split(' ');
        // Store the parsed price and quantity for the current store
        allStoreOfferings[idx] = {
            unitPrice: parseInt(currentStoreData[0], 10),
            availableUnits: parseInt(currentStoreData[1], 10)
        };
    }

    // Sort the store offerings by unit price in ascending order
    allStoreOfferings.sort((offerA, offerB) => {
        // If offerA's price is less than offerB's, it comes first (-1)
        // Otherwise, offerB comes first (1)
        return (offerA.unitPrice < offerB.unitPrice) ? -1 : 1;
    });

    // Variable to hold the current store offering being considered
    let currentOffering;

    // Iterate through the sorted store offerings to make purchases
    for (let idx = 0; idx < numStores; idx++) {
        currentOffering = allStoreOfferings[idx]; // Get the current store's details

        // Check if buying all available units from the current store
        // would exceed the maximum allowed drinks (maxDrinksToBuy)
        if (currentOffering.availableUnits + totalDrinksBought <= maxDrinksToBuy) {
            // If not, buy all available units from this store
            totalCost += currentOffering.availableUnits * currentOffering.unitPrice;
            totalDrinksBought += currentOffering.availableUnits;

            // If the maximum drinks limit has been reached, stop purchasing
            if (totalDrinksBought === maxDrinksToBuy) {
                break;
            }
        } else {
            // If buying all units from this store would exceed the limit,
            // buy only the remaining quantity needed to reach maxDrinksToBuy
            let remainingNeeded = maxDrinksToBuy - totalDrinksBought;
            totalCost += currentOffering.unitPrice * remainingNeeded;
            // No need to update totalDrinksBought as we break immediately after
            // reaching the limit.
            break; // Stop purchasing as the limit is now met
        }
    }

    // Output the final calculated total cost
    console.log(totalCost);
}

// Read input from standard input and pass it to the main processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
