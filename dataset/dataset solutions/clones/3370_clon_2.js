function processInput(inputData) {
    // Split the entire input string into an array of lines.
    inputData = inputData.split("\n");

    // Parse the first line to get initial configuration values.
    let firstLineParts = inputData[0].split(" ");
    let numItems = parseInt(firstLineParts[0]); // This variable is read but not used in the logic.
    let minHeight = parseInt(firstLineParts[1]);
    let minWidth = parseInt(firstLineParts[2]);
    
    // Initialize a counter for valid items.
    let validCount = 0;
    
    // Remove the first line as it has been processed.
    inputData.shift();

    // Iterate through the remaining lines, each representing an item.
    for (let idx = 0; idx < inputData.length; idx++) {
        let itemDimensions = inputData[idx].split(" ");
        let currentHeight = parseInt(itemDimensions[0]);
        let currentWidth = parseInt(itemDimensions[1]);
        
        // Check if the current item meets the minimum height and width criteria.
        if (currentHeight >= minHeight && currentWidth >= minWidth) {
            validCount++; // Increment the counter if both conditions are met.
        }
    }
    
    // Output the final count of items that satisfy the criteria.
    console.log(validCount);
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
