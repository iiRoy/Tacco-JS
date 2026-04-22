/*
 * This JavaScript file processes input data from standard input.
 * It reads lines, parses numerical values, and performs calculations.
 * The primary goal is to identify qualified entities based on accumulated amounts.
 */
process
    .stdin
    .resume(); /* Ensure the standard input stream stays open for data. */

// Set the encoding for incoming data to UTF-8.
process.stdin.setEncoding(
    'utf8'
);

/*
 * Event listener for 'data' events on standard input.
 * This function will be executed whenever new data is available.
 */
process
    .stdin
    .on(
        'data',
        function(input) {

            // Process the raw input: trim whitespace and split into an array of lines.
            var line = input.trim().split("\n");

            // Initialize a counter for iterating through the input lines.
            var i = 0;

            // Start an infinite loop to process multiple datasets until a termination condition is met.
            while (true) {

                /*
                 * Parse the first number on the current line.
                 * This number 'N' represents the count of records in the current dataset.
                 */
                var N = parseInt(line[i].trim());

                // Check for the termination condition: N equals 0.
                if (N === 0) {

                    // If N is 0, exit the processing loop.
                    break;
                } else {
                    /*
                     * If N is not 0, proceed to process the dataset.
                     * Declare several variables that will be used within this block.
                     */
                    var found, len, k, res, uid;

                    // Initialize two arrays: 'qualified' to store unique IDs and 'amount' to store corresponding accumulated amounts.
                    var qualified = [],
                        amount = [];

                    // Loop N times to process each record in the current dataset.
                    for (var j = 0; j < N; ++j) {

                        // Get the current line, trim it, and split it by space to get individual data elements.
                        var dataset = line[i++].trim().split(" ");

                        // Calculate 'res' by multiplying two parsed integer values from the dataset.
                        res = parseInt(dataset[1]) * parseInt(dataset[2]);

                        // Get the current length of the 'qualified' array.
                        len = qualified.length;

                        // Reset 'found' flag for the current record.
                        found = 0;

                        // Re-get the length (redundant but kept as per Type I definition).
                        len = qualified.length;

                        // Parse the unique ID from the first element of the dataset.
                        uid = parseInt(dataset[0]);

                        // Iterate through the already qualified IDs to check if the current UID exists.
                        for (k = 0; k < len; ++k) {

                            // If the current UID matches an existing qualified ID.
                            if (qualified[k] === uid) {

                                // Set 'found' flag to 1, indicating the UID was found.
                                found = 1;

                                // Add the calculated 'res' to the existing amount for this UID.
                                amount[k] = amount[k] + res;

                                // Exit the inner loop as the UID has been processed.
                                break;
                            }
                        }

                        // If the UID was not found in the 'qualified' array.
                        if (found === 0) {

                            // Add the new UID to the 'qualified' array.
                            qualified.push(uid);

                            // Add the calculated 'res' as the initial amount for this new UID.
                            amount.push(res);
                        }
                    }

                    // Reset 'found' flag for the final check.
                    found = 0;

                    // Get the length of the 'qualified' array for the final iteration.
                    len = qualified.length;

                    // Iterate through all qualified entities to check if their total amount meets the threshold.
                    for (k = 0; k < len; ++k) {

                        // If the accumulated amount for the current entity is 1,000,000 or more.
                        if (amount[k] >= 1000000) {

                            // Print the UID of the qualified entity to standard output.
                            console.log(qualified[k]);

                            // Set 'found' flag to 1, indicating at least one entity met the criteria.
                            found = 1;
                        }
                    }

                    // If no entity met the qualification criteria (found is still 0).
                    if (found === 0) {

                        // Print "NA" to indicate no qualified entities.
                        console.log("NA");
                    }
                }
            }
        }); // End of the 'data' event listener function.