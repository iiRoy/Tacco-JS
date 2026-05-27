var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read the entire input from standard input

var inputLines = (fileContent.trim()).split('\n'); // Trim whitespace and split the input into an array of lines

// Process each line of the input data
for (var lineIdx = 0; lineIdx < inputLines.length; lineIdx++) {
    // Check for the termination condition "0 0"
    if (inputLines[lineIdx] === "0 0") {
        break; // Exit the loop if the termination sequence is encountered
    }

    // Parse the current line, splitting by space and converting to numbers
    var currentNumbers = inputLines[lineIdx].split(' ').map(Number);

    var totalItems = currentNumbers[0]; // The first number represents the total count of items
    var skipCount = currentNumbers[1];  // The second number represents the number of empty slots to skip

    var itemPositions = {}; // An object to store the assigned position for each item

    // Initialize all possible item positions to null, indicating they are empty
    for (var initIdx = 0; initIdx < totalItems; initIdx++) {
        itemPositions[initIdx] = null;
    }

    var currentPointer = 0; // Initialize a pointer to track the current position in the circular arrangement

    // Iterate through each item that needs to be placed
    for (var itemToPlace = 0; itemToPlace < totalItems; itemToPlace++) {
        var foundEmptySlots = 0; // Counter for the number of empty slots encountered

        // Loop to find the next available position based on 'skipCount'
        do {
            currentPointer++; // Move the pointer to the next position

            // If the pointer goes beyond the total items, wrap it around to the beginning
            if (currentPointer === totalItems) {
                currentPointer = 0;
            }

            // If the current position is empty (null), increment the empty slots counter
            if (itemPositions[currentPointer] === null) {
                foundEmptySlots++;
            }
        } while (foundEmptySlots !== skipCount); // Continue until 'skipCount' empty slots have been found

        // Assign the current item to the determined position
        itemPositions[currentPointer] = itemToPlace;
    }

    // If the final pointer position is 0, adjust it to 1 as per problem logic
    if (currentPointer === 0) {
        currentPointer = 1;
    }

    // Output the final adjusted pointer value for the current line
    console.log(currentPointer);
}
