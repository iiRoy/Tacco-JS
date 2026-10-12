function ProcessInput(rawData) {
    // Split the first line of input to get the number of items and operations
    const tempParts = rawData[0].split(' ');
    let numItems = tempParts[0]; // Corresponds to N in the original code
    let numOperations = tempParts[1]; // Corresponds to K in the original code

    // Split the second and third lines to get the two arrays
    const arrayA = rawData[1].split(' '); // Corresponds to A
    const arrayF = rawData[2].split(' '); // Corresponds to F

    // Sort arrayA in descending order based on its numeric values
    arrayA.sort(function(val1, val2) {
        if (val1 > val2) {
            return -1; // val1 should come before val2
        }
        if (val1 < val2) {
            return 1;  // val2 should come before val1
        }
        return 0;      // val1 and val2 are considered equal
    });

    // Sort arrayF in ascending order based on its numeric values
    arrayF.sort(function(val1, val2) {
        if (val1 > val2) {
            return 1;  // val2 should come before val1
        }
        if (val1 < val2) {
            return -1; // val1 should come before val2
        }
        return 0;      // val1 and val2 are considered equal
    });
  
    // Create a new array to store computed products and original values
    let transformedData = []; // Corresponds to T
    for (let idx = 0; idx < numItems; ++idx) {
        // Each element is an array: [product, original_A_value, original_F_value]
        transformedData[idx] = [arrayA[idx] * arrayF[idx], arrayA[idx], arrayF[idx]];
    }
  
    // Perform K operations to minimize the maximum product
    for (let idx = 0; idx < numOperations; ++idx) {
        // Sort the transformedData array by the product (first element) in descending order
        transformedData.sort(function(val1, val2) {
            if (val1[0] > val2[0]) {
                return -1; // val1's product comes before val2's product
            }
            if (val1[0] < val2[0]) {
                return 1;  // val2's product comes before val1's product
            }
            return 0;      // products are equal
        });

        // Decrement the original A value (second element) of the item with the largest product
        transformedData[0][1] = transformedData[0][1] - 1; 
        // Recalculate the product for this modified item
        transformedData[0][0] = transformedData[0][1] * transformedData[0][2];
    }
  
    // After all operations, sort one last time to find the overall maximum product
    transformedData.sort(function(val1, val2) {
        if (val1[0] > val2[0]) {
            return -1; // val1's product comes before val2's product
        }
        if (val1[0] < val2[0]) {
            return 1;  // val2's product comes before val1's product
        }
        return 0;      // products are equal
    });

    // Output the largest product found
    console.log(transformedData[0][0]);
}

// Read input from standard input, split by newlines, and pass to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));
