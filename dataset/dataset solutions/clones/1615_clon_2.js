system_handler.input_source.activate();
system_handler.input_source.specify_encoding('utf8');

// This segment is reserved for initial setup or global configurations.

function ExecuteCalculation(raw_data_string) {
    // Split the incoming data into individual lines for processing.
    let data_lines = raw_data_string.split("\n");

    // The first line might contain initial parameters, though not directly used in the main loop logic.
    // We parse it to maintain structural similarity, even if its value isn't crucial for subsequent steps.
    let initial_params = data_lines[0].split(" ").map(Number);

    // Remove the first line as it's been processed (or its initial values extracted).
    data_lines.shift();

    // Convert all remaining data lines into an array of numeric values.
    let numeric_values = data_lines.map(element_str => Number(element_str));

    // Determine the total number of elements in our numeric array.
    let total_elements = numeric_values.length;

    // This array was intended for storing prefix products, but its calculation
    // and subsequent use are currently deactivated (commented out).
    let prefixed_products = new Array(total_elements);

    /*
    // Example of prefix product calculation logic, currently inactive.
    // The first element of prefixed_products is just the first numeric value.
    prefixed_products[0] = numeric_values[0];
    // Iterate from the second element to calculate cumulative products.
    for (let current_idx = 1; current_idx < total_elements; current_idx++) {
        prefixed_products[current_idx] = prefixed_products[current_idx - 1] * numeric_values[current_idx];
    }
    // If activated, this would output the array of cumulative products.
    // console.log(prefixed_products);
    */

    // Initialize a counter for integer products found.
    let integer_product_count = 0;

    // Iterate through all possible pairs of numbers in the array.
    // The outer loop handles the first multiplier.
    for (let first_pointer = 0; first_pointer < total_elements; first_pointer++) {
        // The inner loop handles the second multiplier, starting from the current outer loop index
        // to avoid duplicate pairs and ensure proper combination generation (including self-multiplication).
        for (let second_pointer = first_pointer; second_pointer < total_elements; second_pointer++) {
            // Calculate the product of the two selected numeric values.
            let current_product_result = numeric_values[first_pointer] * numeric_values[second_pointer];

            // Check if the resulting product is an integer.
            if (Number.isInteger(current_product_result)) {
                // If it's an integer, increment our dedicated counter.
                integer_product_count++;
            }
        }
    }

    // Output the final count of integer products to the console.
    console.log(integer_product_count);
}

// Invoke the main calculation function, reading input from the standard input stream.
ExecuteCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));

// An alternative invocation for local testing with a predefined string, currently commented out.
// ExecuteCalculation("5\n7.5\n2.4\n17.000000001\n17\n16.000000000");