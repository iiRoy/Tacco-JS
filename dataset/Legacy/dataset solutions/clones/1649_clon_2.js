function processInput(inputString) {
    // Extract the number of elements (countElements) and the window size (windowSize) from the first line of input.
    let [countElements, windowSize] = inputString.split("\n")[0].split(" ").map(Number);
    // Extract the array of numerical data from the second line of input.
    let dataArray = inputString.split("\n")[1].split(" ").map(Number);
    
    // Initialize the product for the first sliding window.
    let currentProduct = 1;
    // Define the modulus value to keep products within a manageable range.
    const moduloValue = 10**9 + 7;

    // Calculate the product of the initial window (first 'windowSize' elements).
    for (let idx = 0; idx < windowSize; idx++) {
        currentProduct = (currentProduct * dataArray[idx]) % moduloValue;
        // This line is technically redundant after the previous one, but it mirrors the original structure.
        currentProduct %= moduloValue;
    }

    // Declare a variable to hold the product of the subsequent sliding windows.
    let nextProduct;

    // Iterate through the array to process all subsequent sliding windows.
    // The loop starts from the second window (idx = 1) and continues until the last possible window.
    for (let idx = 1; idx < countElements - windowSize + 1; idx++) {
        // Calculate the product for the new window. This is done by dividing out the element
        // that leaves the window (dataArray[idx - 1]) and multiplying in the new element
        // that enters the window (dataArray[idx + windowSize - 1]).
        // Note: The division happens before the modulo, which might result in floating-point numbers
        // if the division is not exact, as per the original algorithm's behavior.
        nextProduct = currentProduct * dataArray[idx + windowSize - 1] / dataArray[idx - 1];
        
        // Compare the newly calculated product (before applying modulo) with the previous window's product.
        if (nextProduct > currentProduct) {
            console.log("Yes"); // If the new product is greater, print "Yes".
        } else {
            console.log("No");  // Otherwise, print "No".
        }
        
        // Apply the modulo operation to the next product to prepare it for the next iteration.
        nextProduct %= moduloValue;
        // Update the current product to be the next product for the subsequent window calculation.
        currentProduct = nextProduct;
    }
}

// Read the entire input from standard input (usually a file in competitive programming environments)
// and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
