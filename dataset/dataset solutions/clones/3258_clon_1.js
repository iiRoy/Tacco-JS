function Main(input) {
    // This function processes the given input to calculate a specific value.

    input = input.split("\n"); // Split the input string into an array of lines.

    var series = input[1].split(" "); // Get the second line and split it by spaces to form an array of string numbers.

    series = series.map(str => parseInt(str, 10)); // Convert each string in the 'series' array to an integer.

    var n = parseInt(input[0], 10); // Parse the first line of input to get the integer 'n'.

    var water = 0; // Initialize a variable 'water' to accumulate the result, starting from zero.

    // Loop through the 'series' array from the first element up to 'n' elements.
    for (
        var i = 0; // Initialize loop counter 'i' to 0.
        i < n;     // Continue as long as 'i' is less than 'n'.
        i++        // Increment 'i' after each iteration.
    ) {
        // Calculate the 'water' value based on the current and previous elements.
        // If it's the first element (i == 0), add its value directly.
        // Otherwise, check if the current element is greater than the previous one.
        // If it is, add the difference (current - previous) to 'water'; otherwise, add 0.
        water += (i == 0)
            ? series[i] // For the first element, just add its value.
            : (
                (series[i - 1] < series[i]) // Check if current is greater than previous.
                    ? (series[i] - series[i - 1]) // If true, add the difference.
                    : 0                           // If false, add 0.
            );
    }

    console.log(water); // Print the final calculated 'water' value to the console.

} // End of the Main function.

/*
 * This portion of the code is responsible for handling standard input/output.
 * Do not modify any code below this line, as it facilitates reading input
 * and invoking the Main function with the data.
 */
Main(require("fs").readFileSync("/dev/stdin", "utf8"));