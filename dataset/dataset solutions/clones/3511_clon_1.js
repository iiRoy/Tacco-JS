// This script processes an input string to solve a specific problem.
// The 'input' parameter contains the entire input data as a single string.
function Main(input)
{
    // Split the input string by newline characters to get an array of lines.
    inp = input.split('\n');

    // Convert the first line (index 0) to a number and store it in N.
    var N = Number(inp[0]);

    // Split the second line (index 1) by spaces to get an array of strings.
    var an = inp[1].split(' ');

    // Convert each element of 'an' to a number.
    // Note: The result of map is not assigned back to 'an',
    // so 'an' still contains strings. This is part of the original logic.
    an.map(e => Number(e));


    // --- Helper function definition starts here ---
    /**
     * Checks an array 'lt' to count occurrences of its first element.
     * @param {Array<string>} lt - The input array to check.
     * @returns {number} The count of how many times the first element appears consecutively
     *                   at the beginning, or just the count of the first element if not consecutive.
     *                   Actually, it counts all occurrences of the first element.
     */
    function chkArray(lt)
    {
        var buf = ''; // Buffer to store the first element.
        var cnt = 0;  // Counter for occurrences.

        // Loop through the array elements.
        for (var i = 0; i < lt.length; i++)
        {
            // If it's the first element, store it in buf.
            if (i === 0)
            {
                buf = lt[0];
            }

            // If the current element matches the buffered first element, increment counter.
            if (buf === lt[i])
            {
                cnt++;
            }
        }
        return cnt; // Return the total count.
    }
    // --- Helper function definition ends here ---


    // Perform an array check using the defined function.
    var chkcnt = chkArray(an);

    // Conditional check based on the result of chkArray.
    // If all elements are the same as the first element.
    if (chkcnt === an.length)
    {
        // Log the integer division of array length by 2.
        console.log("%d", parseInt(an.length / 2, 10));
        return; // Exit the Main function.
    }

    // Another conditional check.
    // If only one element is unique (meaning the first element is unique, and it appeared only once)
    // and the array length is at least 4.
    if (chkcnt === 1 && an.length >= 4)
    {
        // Log the integer division of array length by 2.
        console.log("%d", parseInt(an.length / 2, 10));
        return; // Exit the Main function.
    }


    // Initialize two Map objects to store counts for elements at even and odd indices.
    num1 = new Map(); // Stores counts for elements at even indices.
    num2 = new Map(); // Stores counts for elements at odd indices.

    // Iterate through the input array 'an'.
    for (var i = 0; i < an.length; i++)
    {
        // Check if the current index 'i' is even.
        if (i % 2 === 0)
        {
            // Get the current value associated with an[i] from num1.
            var val = num1.get(an[i]);

            // If the value is not found (first occurrence), initialize it to 0.
            if (!val)
            {
                val = 0;
                num1.set(an[i], val); // Store the initialized value.
            }

            // Increment the count.
            val++;

            // Update the count in num1.
            num1.set(an[i], val);
        }
        else // If the current index 'i' is odd.
        {
            // Get the current value associated with an[i] from num2.
            var val = num2.get(an[i]);

            // If the value is not found (first occurrence), initialize it to 0.
            if (!val)
            {
                val = 0;
                num2.set(an[i], val); // Store the initialized value.
            }

            // Increment the count.
            val++;

            // Update the count in num2.
            num2.set(an[i], val);
        }
    }

    // Original console.log statements, commented out.
    // console.log(num1);
    // console.log(num2);


    // --- Helper function definition starts here ---
    /**
     * Calculates a specific count from a Map's values.
     * It sorts the values in descending order and sums all but the largest.
     * @param {Map<string, number>} numarray - A Map containing counts of elements.
     * @returns {number} The calculated count.
     */
    function getCnt(numarray)
    {
        var array = []; // Temporary array to store values.
        var cnt = 0;    // Counter for the sum.

        // Iterate over the [key, value] pairs of the Map.
        for (var tmp of numarray)
        {
            array.push(tmp[1]); // Push the value (count) into the temporary array.
        }

        // If there are at least two distinct values (counts).
        if (array.length >= 2)
        {
            // Sort the array of counts in descending order.
            array.sort((a, b) => b - a); // Descending sort.

            // Sum all counts except the largest one (at index 0 after sort).
            for (var i = 1; i < array.length; i++)
            {
                cnt += array[i];
            }
        }
        else if (array.length <= 1) // If there is one or zero distinct values.
        {
            cnt = 0; // The count remains zero as per logic.
        }
        return cnt; // Return the final calculated count.
    }
    // --- Helper function definition ends here ---


    // Calculate the 'ans' by summing results from getCnt for both maps.
    var ans = getCnt(num1);
    ans += getCnt(num2);


    // Output the final answer to the console.
    console.log("%d", ans);

} // End of Main function definition.


// ********************************************************************************
// This section handles standard input/output and should not be modified.
// It reads the entire input from standard in and passes it to the Main function.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// ********************************************************************************