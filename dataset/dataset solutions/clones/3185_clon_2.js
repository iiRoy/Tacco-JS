// This function handles the entire input data block.
function ProcessData(rawData) {

    rawData = rawData.split("\n");
    let dimensions = rawData[0].split(" "); // Separate the first line into dimensions

    let numItems = parseInt(dimensions[0], 10); // First dimension: number of items (N)
    let numCategories = parseInt(dimensions[1], 10); // Second dimension: number of categories (M)

    let currentCategory = 1; // Initialize category identifier, starting from 1
    let matchCounter = 0;    // Initialize counter for matches within a category iteration
    let finalResult = 0;     // Initialize the overall successful category count

    // Iterate through each possible category, from 1 up to numCategories
    for (currentCategory = 1; currentCategory <= numCategories; currentCategory++) {

        // Iterate through each item's data row provided in the input, starting from line 1
        for (let itemIndex = 1; itemIndex <= numItems; itemIndex++) {

            let currentItemData = rawData[itemIndex].split(" "); // Split the current item's data line by spaces
            let numPreferences = parseInt(currentItemData[0], 10); // The first element is the number of preferences for this item

            // Loop through the actual preferences listed for the current item
            for (let preferenceIndex = 1; preferenceIndex <= numPreferences; preferenceIndex++) {
                let currentPreference = parseInt(currentItemData[preferenceIndex], 10); // Get the current preference value

                // Check if this item's preference matches the category currently being evaluated
                if (currentPreference === currentCategory) {
                    matchCounter++; // Increment the match counter if a match is found
                }
            }
        }

        // After checking all items against the current category, determine if all items matched
        if (matchCounter === numItems) {
            finalResult++; // If every item had a preference for the current category, increment the overall successful category count
        }
        
        matchCounter = 0; // Reset the match counter to zero for the next category evaluation
    }

    console.log(finalResult); // Output the final count of categories that satisfied all items
}

// Do not modify the following line; it handles standard input and invokes the primary processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));