function obtainInputLines()
{
    /*
     * This module function is responsible for fetching all input data
     * from the standard input stream.
     * It reads the entire content and then segments it into an array of lines.
     */
    var inputContent = require("fs").readFileSync("/dev/stdin", "utf8");

    // The input string is broken down into an array of strings,
    // using newline characters as delimiters. It accommodates
    // both common newline conventions.
    return inputContent.split(/\n\r?/);
}


// The main processing logic iterates through each line of the acquired input.
// The 'every' method is employed, but its boolean return value for each iteration
// is primarily used to control continuation, while the side effect (console output)
// is the main purpose of the iteration.
obtainInputLines().every(
    function(currentLineData) { // An anonymous callback function to handle each individual input line.

        // The current input line is parsed to extract numerical parameters.
        // It's assumed the line contains space-separated values.
        var partsArray = currentLineData.split(' ');
        var upperLimit = +partsArray[0]; // Explicitly convert the first part to a numeric type.
        var targetSum = +partsArray[1]; // Explicitly convert the second part to a numeric type.
        var countMatches = 0; // A counter initialized to zero, tracking successful combinations.

        // A series of nested loops to explore all distinct combinations of three numbers.
        // Each number must be within the range from 1 up to 'upperLimit', inclusive.
        for (
            var firstNum = 1; // The initial value for the first number in the combination.
            firstNum <= upperLimit; // Loop continues as long as 'firstNum' does not exceed the 'upperLimit'.
            firstNum++ // Increment 'firstNum' for the next iteration.
        )
        {
            for (
                var secondNum = firstNum; // The second number starts from 'firstNum' to ensure proper ordering and avoid redundant checks.
                secondNum <= upperLimit; // Loop continues as long as 'secondNum' does not exceed the 'upperLimit'.
                secondNum++ // Increment 'secondNum' for the next iteration.
            )
            {
                // This condition ensures that the second number is strictly greater than the first number,
                // thereby guaranteeing distinctness and avoiding permutations of the same set.
                if (secondNum === firstNum)
                    continue;

                for (
                    var thirdNum = secondNum; // The third number starts from 'secondNum'.
                    thirdNum <= upperLimit; // Loop continues as long as 'thirdNum' does not exceed the 'upperLimit'.
                    thirdNum++ // Increment 'thirdNum' for the next iteration.
                )
                {
                    // These conditions ensure that 'thirdNum' is strictly greater than both 'secondNum' and 'firstNum'.
                    // This is crucial for obtaining unique sets of three distinct numbers.
                    if (thirdNum === secondNum || thirdNum === firstNum) {
                        continue;
                    }

                    // Evaluate if the sum of the three distinct numbers equals the specified 'targetSum'.
                    // The double-negation '!!' converts the boolean result (true/false) into its
                    // numeric equivalent (1/0), which is then added to the 'countMatches'.
                    countMatches += !!(firstNum + secondNum + thirdNum === targetSum);
                }
            }
        }

        // Determine the boolean value to return from the 'every' callback.
        // If both 'upperLimit' and 'targetSum' are zero (falsy values), the function returns 'false',
        // which would typically stop the 'every' iteration.
        // Otherwise, it prints the final 'countMatches' to the console and then returns
        // the logical NOT of the result of 'console.log'. Since 'console.log' returns 'undefined',
        // '!undefined' evaluates to 'true', allowing 'every' to continue processing.
        return !upperLimit && !targetSum
            ? false
            : !console.log(countMatches);
    }
);