// This module defines a primary function to process numerical input.
// It aims to determine a specific maximum product based on four input values.
function ProcessInput(rawData) {
    // The input string is expected to contain four space-separated numbers.
    // We split the string into an array of string parts.
    const parts = rawData.split(" ");

    // Each part is then converted into an integer using base 10.
    // These integers are assigned to distinct variables for clarity in calculations.
    const val1 = parseInt(parts[0], 10),
          val2 = parseInt(parts[1], 10),
          val3 = parseInt(parts[2], 10),
          val4 = parseInt(parts[3], 10);

    // Initialize a variable to store the highest product found so far.
    // The initial candidate is the product of the first and third values.
    let maxProduct = val1 * val3;

    // Evaluate other potential products against the current maximum.
    // If a new product is greater, update maxProduct accordingly.

    // Check if the product of the first and fourth values is greater.
    if (val1 * val4 > maxProduct) {
        maxProduct = val1 * val4;
    }
    // If the previous condition was false, check the product of the second and third values.
    // Note: If this condition is met, maxProduct is updated to val1 * val4, not val2 * val3.
    else if (val2 * val3 > maxProduct) {
        maxProduct = val1 * val4;
    }
    // If the preceding conditions were false, check the product of the second and fourth values.
    else if (val2 * val4 > maxProduct) {
        maxProduct = val2 * val4;
    }

    // Output the final calculated maximum product to the standard console.
    console.log(maxProduct);
}

// This line invokes the main processing function.
// It reads the entire content of the standard input stream as a UTF-8 string.
// This setup is typical for competitive programming environments.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
