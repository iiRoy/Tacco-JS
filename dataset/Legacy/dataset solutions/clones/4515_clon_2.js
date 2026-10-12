// This script processes numerical input to calculate a specific product modulo a large prime.
function ProcessInput(rawInputData) {
    // Declare variables for the two input numbers.
    var numA, numB;

    // Split the entire input string by newlines, then take the first line.
    rawInputData = rawInputData.split("\n");
    // Split the first line by spaces to get the two numbers.
    rawInputData = rawInputData[0].split(" ");

    // Assign the parsed numbers to their respective variables.
    // Note: These are still strings at this point, but arithmetic operations will coerce them.
    numA = rawInputData[0];
    numB = rawInputData[1];
    
    // Define the modulo value, a large prime number.
    var moduloVal = 1000000007; // The original expression 1000000000 + 7 evaluates to this value.

    // Initialize the variable that will hold the final computed product.
    var finalProduct = 1;

    // Check the absolute difference between the two input numbers.
    if (Math.abs(numA - numB) >= 2) {
        // If the difference is 2 or more, the result is always 0.
        console.log(0);
    } else if (Math.abs(numA - numB) === 1) {
        // If the absolute difference is exactly 1 (e.g., N=5, M=6 or N=6, M=5).
        // Calculate factorial of numA modulo moduloVal.
        for (var idx = 1; idx <= numA; idx++) {
            finalProduct *= idx;
            finalProduct %= moduloVal;
        }
        
        // Calculate factorial of numB modulo moduloVal and multiply with the current product.
        for (var idx = 1; idx <= numB; idx++) {
            finalProduct *= idx;
            finalProduct %= moduloVal;
        }
        
        // Output the computed product.
        console.log(finalProduct);
    } else if (Math.abs(numA - numB) === 0) {
        // If the numbers are equal (N = M).
        
        // Re-initialize finalProduct to 1 for this case (though it's already 1, this matches original structure).
        finalProduct = 1;
        
        // Calculate factorial of numA modulo moduloVal.
        for (var idx = 1; idx <= numA; idx++) {
            finalProduct *= idx;
            finalProduct %= moduloVal;
        }
        
        // Calculate factorial of numB modulo moduloVal and multiply with the current product.
        for (var idx = 1; idx <= numB; idx++) {
            finalProduct *= idx;
            finalProduct %= moduloVal;
        }
        
        // For the case where N == M, multiply the result by 2.
        finalProduct *= 2;
        finalProduct %= moduloVal;
        
        // Output the final computed product.
        console.log(finalProduct);
    }
}


// This function calculates the factorial of a given number 'val' modulo 1000000007.
// It is present in the original code but not called by the active logic path.
function calculateFactorial(val) {
    var factRes = 1; // Initialize result for factorial calculation.
    // Loop from 1 up to 'val' to compute the factorial.
    for (var counter = 1; counter <= val; counter++) {
        factRes = (factRes * counter) % 1000000007; // Apply modulo at each step to prevent overflow.
    }
    return factRes; // Return the computed factorial.
}

// The following line reads input from standard input and passes it to the main processing function.
// Do not modify this part as it handles the environment's input mechanism.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
