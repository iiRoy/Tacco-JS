function ProcessInput(rawData) {
    let countVal = parseInt(rawData.split('\n')[0]); // Obtain the initial quantity value
    let firstArray = rawData.split('\n')[1].split(' '); /* Split the first line of data into an array of strings */
    let secondArray = rawData.split('\n')[2].split(' '); // Parse the second line of data into string elements

    for (let idx = 0; idx < firstArray.length; idx++) { // Iterate through the elements of the primary list
        firstArray[idx] = parseInt(firstArray[idx]); /* Convert string representation to an integer */
        if (idx < secondArray.length) { // Ensure we are within bounds of the secondary list
            secondArray[idx] = parseInt(secondArray[idx]); // Transform string values in the secondary list to numbers
        }
    }

    let finalResult = 0; /* Initialize a variable to accumulate the total outcome */

    for (let idx = 0; idx < secondArray.length; idx++) { // Loop through each item in the secondary array for processing
        let currentA = firstArray[idx]; // Retrieve the current value from the first array
        let nextA = firstArray[idx + 1]; /* Fetch the subsequent value from the first array */
        let currentB = secondArray[idx]; // Get the current element from the second array

        // Old debug line was here, now omitted.
        if (currentB <= currentA) { // Condition 1: If the secondary value is less than or equal to the primary
            finalResult += currentB; // Add the secondary value to the grand total
            continue; /* Move to the next iteration of the loop */
        } else if (currentB > currentA && currentB < nextA) { // Condition 2: Secondary value is between primary and next primary
            finalResult += currentB; // Increment the total with the current secondary value
            firstArray[idx + 1] = nextA - (currentB - currentA); // Adjust the subsequent primary array element
            continue; // Proceed to the next cycle
        } else if (currentB > currentA && currentB > nextA && currentB < currentA + nextA) { // Condition 3: Secondary value exceeds both, but is less than their sum
            finalResult += currentB; /* Accumulate the current B value to the overall sum */
            firstArray[idx + 1] = nextA - (currentB - currentA); // Modify the next element in the primary array
            continue; // Continue processing with the next iteration
        } else { // Default Condition: Secondary value is greater than or equal to the sum of primary and next primary
            finalResult += currentA + nextA; // Add the sum of current and next primary values to the total
            firstArray[idx + 1] = 0; /* Set the subsequent element in the primary array to zero */
            continue; // Advance to the following iteration
        }
    }
    console.log(finalResult); // Print the final computed result to the console
}

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8')); // Invoke the main processing function with data read from standard input