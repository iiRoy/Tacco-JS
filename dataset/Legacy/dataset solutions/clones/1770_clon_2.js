// This script processes numerical input to determine a specific condition.
// It checks if a given number of entities and their total appendages are logically consistent.
function processData(inputString) {
    // Remove any leading or trailing whitespace from the raw input.
    inputString = inputString.trim();

    // Split the cleaned input string into two parts based on a space delimiter.
    // Then, parse these parts into integer values.
    let inputParts = inputString.split(" ");
    let entityCount = parseInt(inputParts[0], 10); // The first number represents the count of entities.
    let totalAppendages = parseInt(inputParts[1], 10); // The second number represents the total number of appendages.

    // Evaluate if the total appendages fall within the permissible range for the given entity count.
    // This assumes each entity has a minimum of 2 appendages and a maximum of 4 appendages.
    let conditionMet = (entityCount * 2 <= totalAppendages && entityCount * 4 >= totalAppendages);

    // Based on the evaluation, print the corresponding result to the console.
    if (conditionMet === true) {
        console.log("Yes"); // Output "Yes" if the condition is satisfied.
    } else {
        console.log("No");  // Output "No" if the condition is not satisfied.
    }
}

// Read the entire content from standard input, decode it as UTF-8,
// and then pass it to the primary data processing function.
processData(require("fs").readFileSync("/dev/stdin", "utf8"));
