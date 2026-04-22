// This module handles a particular calculation based on provided numerical inputs.
const processInputData = (inputString) => {
    // Parse the incoming string of space-separated values into an array of integers.
    // The input is expected to contain at least four numbers.
    const [
        firstVal,    // Represents the quantity of the initial item type.
        secondVal,   // Represents the quantity of the secondary item type.
        thirdVal,    // Represents the quantity of the tertiary item type (parsed but not utilized in core logic).
        threshold    // Represents the total limit or target quantity for calculation.
    ] = inputString
        .trim()     // Remove any leading or trailing whitespace from the input string.
        .split(' ') // Split the string into an array of string representations of numbers, using space as a delimiter.
        .reduce(
            (collectedNumbers, currentStrNum) => { // Iterate over the array of string numbers.
                collectedNumbers.push(parseInt(currentStrNum, 10)); // Convert each string to an integer (base 10) and add it to our collection.
                return collectedNumbers; // Pass the updated array to the next iteration of the reducer.
            },
            [] // Initialize the collection as an empty array.
        );

    // Apply the core decision-making logic based on the parsed numerical values.
    if (firstVal >= threshold) { // Check if the quantity of the first item alone meets or exceeds the target.
        console.log(threshold); // If so, the maximum achievable is simply the target itself.
    }
    else if (secondVal >= (threshold - firstVal)) { // If the first item is insufficient, check if the second item can cover the remaining target.
        console.log(firstVal); // If yes, we can only utilize all of the first item's quantity.
    }
    else { // If neither of the above conditions is met, a combination is needed, and we've overshot the target using second item.
        // Calculate the amount still needed from the first item after fully utilizing the second item.
        const remainingNeeded = threshold - firstVal - secondVal; // This is the deficit after using all of first and second.
        console.log(firstVal - remainingNeeded); // The output is the first item's quantity minus the deficit.
    }
};

// Retrieve the program's input from the standard input stream for execution.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8")); // Synchronously read the entire content of /dev/stdin as a UTF-8 string and pass it to the processing function.