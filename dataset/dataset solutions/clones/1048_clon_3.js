(function executeProgram() {
    // Import the Node.js file system module for reading input.
    const nodeFileSystemModule = require('fs');
    // Define the standard input path for competitive programming environments.
    const standardInputPath = '/dev/stdin';

    // --- Input Data Acquisition and Parsing ---
    // Read the entire input file synchronously, decode it as UTF-8,
    // remove any leading/trailing whitespace, and split it into an array of lines.
    const rawInputContent = nodeFileSystemModule.readFileSync(standardInputPath, 'utf8');
    const inputDataRows = rawInputContent.trim().split("\n");

    // Implement a guard clause for scenarios with no input data.
    if (inputDataRows.length === 0) {
        console.error("Execution halted: No input lines were provided.");
        return; // Terminate execution gracefully.
    }

    // Extract the primary parameters from the first line of input.
    // These are typically 'N' (total items) and 'K' (maximum containers/trucks).
    const configurationValues = inputDataRows.shift().split(' ');
    const totalItemQuantity = Number(configurationValues[0]);
    const maximumContainerAllotment = Number(configurationValues[1]);

    // Perform validation on the parsed configuration values.
    // Ensure they are valid non-negative numbers.
    if (isNaN(totalItemQuantity) || isNaN(maximumContainerAllotment) || totalItemQuantity < 0 || maximumContainerAllotment < 0) {
        console.error("Execution halted: Invalid numeric parameters for item quantity or container allotment.");
        return;
    }

    // Convert the remaining input lines into an array of item weights.
    // Each line represents the weight of a single item.
    const cargoWeightManifest = inputDataRows.map(weightString => Number(weightString));

    // Validate the cargo manifest: check for non-numeric entries or count mismatch.
    if (cargoWeightManifest.some(isNaN) || cargoWeightManifest.length !== totalItemQuantity) {
        console.error("Execution halted: Mismatch in item weights provided or invalid weight values.");
        return;
    }

    // --- Core Logic: Capacity Feasibility Evaluation Function ---
    // This function checks if it's possible to transport all items
    // using the 'maximumContainerAllotment' containers, given a 'proposedContainerCapacity'.
    // It returns the total number of items that could be successfully loaded.
    const assessLoadingCapability = (proposedContainerCapacity) => {
        let currentCargoIndex = 0; // Index of the next item to consider for loading.
        const itemsToLoad = cargoWeightManifest.length; // Total count of items.

        // Early exit optimization: If any single item's weight exceeds the proposed capacity,
        // it's impossible to load all items, so we can immediately return.
        if (cargoWeightManifest.some(itemWeight => itemWeight > proposedContainerCapacity)) {
            return 0; // Indicates that not all items could be loaded.
        }

        // Iterate through each available container.
        for (let containerIteration = 0; containerIteration < maximumContainerAllotment; containerIteration++) {
            let currentContainerLoad = 0; // Accumulator for the current container's total weight.

            // Attempt to load items into the current container.
            // Continue as long as there are items left AND the current item fits.
            while (currentCargoIndex < itemsToLoad &&
                   currentContainerLoad + cargoWeightManifest[currentCargoIndex] <= proposedContainerCapacity) {
                currentContainerLoad += cargoWeightManifest[currentCargoIndex];
                currentCargoIndex++; // Move to the next item in the manifest.
            }

            // If all items have been placed into containers, we've found a feasible capacity.
            if (currentCargoIndex === itemsToLoad) {
                return itemsToLoad; // All items successfully loaded.
            }
        }
        // If we've used all containers but haven't loaded all items,
        // return the count of items that were successfully loaded.
        return currentCargoIndex;
    };

    // --- Determination of Minimum Optimal Capacity ---
    // Calculate an initial lower bound for the container capacity.
    // This is often derived from the average weight per container.
    const totalWeightAccumulation = cargoWeightManifest.reduce((acc, weight) => acc + weight, 0);
    let initialCapacityEstimate = Math.floor(totalWeightAccumulation / maximumContainerAllotment);

    // A more stringent lower bound is the weight of the single heaviest item.
    // No container can have a capacity less than its heaviest item.
    const heaviestIndividualItem = Math.max(...cargoWeightManifest);

    // Set the starting point for the capacity search to the maximum of these lower bounds.
    let currentMinimumCapacity = Math.max(initialCapacityEstimate, heaviestIndividualItem);

    // Perform a linear search to find the smallest possible capacity.
    // We increment the capacity and re-evaluate until all items can be loaded.
    // The loop continues as long as the 'assessLoadingCapability' function
    // indicates that not all items ('totalItemQuantity') can be loaded.
    do {
        currentMinimumCapacity++; // Increment the capacity to test the next higher value.
    } while (assessLoadingCapability(currentMinimumCapacity) !== totalItemQuantity);


    // --- Outputting the Final Result ---
    // Display the determined minimum container capacity to standard output.
    console.log(currentMinimumCapacity);

})(); // End of the self-executing anonymous function.